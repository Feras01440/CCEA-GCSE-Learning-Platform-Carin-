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
import { followThroughValue, instructsAccuracy, isFormTask } from "./mark";
import { positionalWording } from "@/lib/gate-order";
import type { AnswerSpec } from "@/lib/content/schema";
import { planFade } from "./fade";
import type { z } from "zod";
import { SeeBlockInline, SeeBlockReference, WorkedExampleStep } from "@/lib/content/schema";

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

/** A See it holds two to six steps (docs/plan/review/2026-09-27-see-it-block-shape.md §2). */
export const SEE_STEPS = { min: 2, max: 6 } as const;
const SHIPPED_LOG = new Set(["verified", "published"]);
/** The words of a gate option's note: at most 40 (schema.ts OPTION_NOTE_WORDS). */
const OPTION_NOTE_WORDS = 40;

/**
 * The fields of a See it step whose shape is the schema's (a step IS a WorkedExampleStep): the mark codes, the typed
 * answer (an AnswerSpec) and the why-menu. Their defects are reported in the schema's own words, by asking the schema
 * (src/lib/content/schema.ts), so the lint and the schema can never word one fault two ways (lead, 27 Sep 2026).
 */
const STEP_SHAPED = ["earns", "input", "whyMenu"] as const;

/** The schema's messages for a value, each prefixed with its path under `field` ("earns.0: a mark code such as …"). */
function schemaIssues(schema: z.ZodType, value: unknown, field: string): string[] {
  const r = schema.safeParse(value);
  return r.success ? [] : r.error.issues.map((issue) => `${[field, ...issue.path.map(String)].join(".")}: ${issue.message}`);
}
const filled = (v: unknown): boolean => typeof v === "string" && v.trim().length > 0;
const stepsWord = (n: number) => `${n} step${n === 1 ? "" : "s"}`;

/**
 * The See it block and the gate's twin (see-it-block-shape.md; the types SeeBlockInline, SeeBlockReference and
 * GateTwin in ./gates), as the renderer needs them to draw: the inline form's stem and two to six steps numbered
 * 1..k, each with its working line and its reason; at most one typed step (`input`), and none in the topic's
 * first See it, which is shown, never typed; the reference form naming a worked example the bundle ships (when
 * the bundle is given), itself two to six steps, and never both forms at once; a twin with its prompt, answer and
 * explanation, and on a choice gate its options with the answer among them; and, in a section that holds a See it,
 * no gate before it. A section starts at each heading; a "See it done" heading (role `see`) continues the section
 * above. A section with no See it at all is a note written before 27 Sep 2026: scripts/qa/lesson-v2.mjs warns on
 * it while the notes migrate, and the build does not refuse it.
 */
function seeAndTwinDefects(blocks: readonly unknown[], label: string, bundle: unknown): string[] {
  const out: string[] = [];
  const recs = blocks.map((b) => (b && typeof b === "object" ? (b as Record<string, unknown>) : {}));
  const b = bundle && typeof bundle === "object" ? (bundle as Record<string, unknown>) : null;
  const logs = onlyObjects(b?.verification);
  const workedExamples = b ? onlyObjects(b.workedExamples) : null;
  let firstSee = true;
  recs.forEach((rec, i) => {
    if (rec.type === "see") {
      const at = `${label} note block ${i} (See it)`;
      const hasSteps = Array.isArray(rec.steps);
      if (typeof rec.workedExample === "string") {
        const idIssues = schemaIssues(SeeBlockReference.shape.workedExample, rec.workedExample, "workedExample");
        if (hasSteps) out.push(`${at}: carries both a workedExample and its own steps (use one form)`);
        else if (idIssues.length) out.push(...idIssues.map((m) => `${at}: ${m}`));
        else if (workedExamples) {
          const we = workedExamples.find((w) => w.id === rec.workedExample);
          const status = we ? logs.find((l) => l.id === we.verification)?.status : undefined;
          const k = we && Array.isArray(we.steps) ? we.steps.length : 0;
          if (!we) out.push(`${at}: names worked example ${rec.workedExample}, which the bundle does not hold`);
          else if (!SHIPPED_LOG.has(String(status))) out.push(`${at}: names worked example ${rec.workedExample}, which the bundle does not ship (its log is ${status ?? "missing"})`);
          else if (k < SEE_STEPS.min || k > SEE_STEPS.max) out.push(`${at}: names worked example ${rec.workedExample}, which has ${stepsWord(k)} (a See it has two to six)`);
        }
      } else {
        if (!filled(rec.stem)) out.push(`${at}: no stem`);
        const steps = hasSteps ? onlyObjects(rec.steps) : [];
        if (steps.length < SEE_STEPS.min || steps.length > SEE_STEPS.max) out.push(`${at}: ${stepsWord(steps.length)} (a See it has two to six)`);
        steps.forEach((s, k) => {
          if (s.n !== k + 1) out.push(`${at}: step ${k + 1} is numbered ${String(s.n)} (steps run 1, 2, 3 … in order)`);
          if (!filled(s.working)) out.push(`${at}: step ${k + 1} has no working line`);
          if (!filled(s.decision)) out.push(`${at}: step ${k + 1} has no reason (decision)`);
          // A step IS a worked example's step: its marks, typed answer and why-menu have the schema's shape, in its words
          for (const field of STEP_SHAPED) if (s[field] !== undefined) out.push(...schemaIssues(WorkedExampleStep.shape[field], s[field], field).map((m) => `${at}: step ${k + 1} ${m}`));
        });
        if (rec.figure !== undefined) out.push(...schemaIssues(SeeBlockInline.shape.figure, rec.figure, "figure").map((m) => `${at}: ${m}`));
        if (rec.finalAnswer !== undefined) out.push(...schemaIssues(SeeBlockInline.shape.finalAnswer, rec.finalAnswer, "finalAnswer").map((m) => `${at}: ${m}`));
        if (rec.kind !== undefined) out.push(...schemaIssues(SeeBlockInline.shape.kind, rec.kind, "kind").map((m) => `${at}: ${m}`));
        const typed = steps.map((s, k) => (s.input !== undefined && s.input !== null ? k + 1 : 0)).filter(Boolean);
        if (firstSee && typed.length) out.push(`${at}: the topic's first See it asks her to type step ${typed.join(", ")} (the first See it is shown, never typed)`);
        else if (typed.length > 1) out.push(`${at}: ${typed.length} typed steps (at most one)`);
      }
      firstSee = false;
    }
    if (rec.type === "gate" && rec.twin !== undefined) {
      const at = `${label} note block ${i} (gate ${String(rec.id)})`;
      const twin = rec.twin && typeof rec.twin === "object" ? (rec.twin as Record<string, unknown>) : {};
      for (const field of ["prompt", "answer", "explain"]) if (!filled(twin[field])) out.push(`${at}: its twin has no ${field}`);
      const options = Array.isArray(twin.options) ? twin.options.map((o) => String(o).trim()) : null;
      // the schema's own sentences for these two (GateBlockSchema in src/lib/content/schema.ts)
      if (rec.kind === "choice" && !options?.length) out.push(`${at}: the twin of a choice gate needs its options`);
      else if (options?.length && filled(twin.answer) && !options.includes(String(twin.answer).trim())) out.push(`${at}: the twin's answer "${String(twin.answer)}" is not one of its options`);
    }
    // Notes on a choice gate's wrong options (GateOptionNote): one of its options, not the answer, one note per option,
    // the reason in 40 words or fewer.
    if (rec.type === "gate" && rec.optionNotes !== undefined) {
      const at = `${label} note block ${i} (gate ${String(rec.id)})`;
      const notes = Array.isArray(rec.optionNotes) ? onlyObjects(rec.optionNotes) : [];
      if (!Array.isArray(rec.optionNotes)) out.push(`${at}: optionNotes is not a list`);
      const options = Array.isArray(rec.options) ? rec.options.map((o) => String(o).trim()) : [];
      const answer = String(rec.answer ?? "").trim();
      const seen = new Set<string>();
      notes.forEach((n, k) => {
        const option = String(n.option ?? "").trim();
        const where = `${at}: option note ${k + 1}`;
        if (rec.kind !== "choice") out.push(`${where} is on a ${String(rec.kind)} gate (option notes belong to a choice gate)`);
        else if (!filled(n.option)) out.push(`${where} names no option`);
        else if (!options.includes(option)) out.push(`${where}: "${option}" is not one of the gate's options`);
        else if (option === answer) out.push(`${where}: "${option}" is the answer (notes are for wrong options)`);
        if (option && seen.has(option)) out.push(`${where}: a second note on "${option}" (one note per option)`);
        seen.add(option);
        if (!filled(n.why)) out.push(`${where} has no why`);
        else {
          const words = String(n.why).trim().split(/\s+/).length;
          if (words > OPTION_NOTE_WORDS) out.push(`${where}: its why has ${words} words (at most ${OPTION_NOTE_WORDS})`);
        }
        if (n.misconception !== undefined && !filled(n.misconception)) out.push(`${where}: its misconception is empty`);
      });
    }
  });

  // In a section that holds a See it, every gate follows one.
  const sections: number[][] = [[]];
  recs.forEach((rec, i) => {
    if (rec.type === "h" && rec.role !== "see") sections.push([]);
    else if (rec.type !== "h") sections[sections.length - 1]!.push(i);
  });
  for (const s of sections) {
    const firstSeeAt = s.find((i) => recs[i]!.type === "see");
    if (firstSeeAt === undefined) continue;
    for (const i of s)
      if (i < firstSeeAt && recs[i]!.type === "gate") out.push(`${label} note block ${i} (gate ${String(recs[i]!.id)}): comes before its section's See it (a section's gate follows its See it)`);
  }
  return out;
}

/**
 * Note blocks (note.blocks.json) carry inline SVG on figure blocks; the same drawing checks apply to them.
 * Returns one line per defect, labelled by block index and the figure's alt text. The See it blocks and the gates'
 * twins are checked as seeAndTwinDefects says; pass the raw bundle so a See it that names a worked example is
 * resolved against it.
 */
export function lintNoteBlocks(blocks: unknown, label: string, bundle?: unknown): string[] {
  const out: string[] = [];
  if (!Array.isArray(blocks)) return out;
  blocks.forEach((b, i) => {
    if (!b || typeof b !== "object") return;
    const rec = b as Record<string, unknown>;
    // a See it drawn from a figure carries it as a FigureSpec ({ kind: "svg", src, alt })
    const fig = rec.type === "see" && rec.figure && typeof rec.figure === "object" ? (rec.figure as Record<string, unknown>) : null;
    const svg = typeof rec.svg === "string" ? rec.svg : fig?.kind === "svg" && typeof fig.src === "string" ? fig.src : null;
    if (svg === null) return;
    const text = svgText(svg);
    if (text === null) return;
    const altText = typeof rec.alt === "string" ? rec.alt : typeof fig?.alt === "string" ? fig.alt : null;
    const alt = altText !== null ? ` "${altText.slice(0, 40)}"` : "";
    for (const d of svgDefects(text)) out.push(`${label} note block ${i}${alt}: ${d}`);
  });
  out.push(...seeAndTwinDefects(blocks, label, bundle));
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

/**
 * Warnings on a note's blocks (never a refusal): a choice gate whose explanation, or whose twin's, names an option by
 * its place ("the second option …", "option B", "Only the first answer has both"). src/lib/gate-order.ts shows such a
 * gate in its WRITTEN order so the sentence stays true, and authors write the answer first, so its answer stays at A:
 * the pattern the owner noticed in the trial (the lead, 27 Sep 2026). The sentence is found by gate-order's own reader
 * (`positionalWording`), so the build and the app agree on which gates are pinned. Typed gates are not read: their
 * "second answer" is a second root, not an option.
 */
export function noteBlockWarnings(blocks: unknown, label: string, bundle?: unknown): string[] {
  const out: string[] = [];
  if (!Array.isArray(blocks)) return out;
  // a gate the note's log withdrew is not warned on (the lead's item 15): it is being replaced, never shipped again
  const gone = withdrawnIds(bundle);
  blocks = blocks.filter((b) => !(b && typeof b === "object" && (b as Record<string, unknown>).type === "gate" && gone.has(String((b as Record<string, unknown>).id))));
  if (!Array.isArray(blocks)) return out;
  // A v3 note (one that holds a See it) names each inline See it's kind and notes each wrong option of a choice gate
  // (the lead's item 13, 27 Sep 2026; the fields are the schema's: SeeBlockInline.kind, GateOptionNote). A note written
  // before the See it block is not judged: its migration adds both.
  const v3 = blocks.some((b) => b && typeof b === "object" && (b as Record<string, unknown>).type === "see");
  const kinds = SeeBlockInline.shape.kind.unwrap().options.join(", ");
  if (v3)
    blocks.forEach((b, i) => {
      const rec = b && typeof b === "object" ? (b as Record<string, unknown>) : {};
      if (rec.type === "see" && typeof rec.workedExample !== "string" && rec.kind === undefined) out.push(`${label} note block ${i} (See it): no kind (one of ${kinds})`);
    });
  for (const b of onlyObjects(blocks)) {
    if (v3 && b.type === "gate" && b.kind === "choice" && Array.isArray(b.options)) {
      const noted = new Set(onlyObjects(b.optionNotes).map((n) => String(n.option ?? "").trim()));
      const answer = String(b.answer ?? "").trim();
      for (const o of b.options.map((x) => String(x).trim()))
        if (o !== answer && !noted.has(o)) out.push(`${label} gate ${String(b.id)}: no option note on "${o}" (one sentence on why that option tempts and what is wrong with it)`);
    }
    if (b.type !== "gate" || b.kind !== "choice" || !Array.isArray(b.options) || b.options.length < 2) continue;
    const own = positionalWording(typeof b.explain === "string" ? b.explain : null);
    if (own) out.push(`${label} gate ${String(b.id)}: its explanation names an option by its place ("${own}"): the gate is then shown in its written order, so its answer stays where it was written; name the option by what it says`);
    const twin = b.twin && typeof b.twin === "object" ? (b.twin as Record<string, unknown>) : null;
    const theirs = twin ? positionalWording(typeof twin.explain === "string" ? twin.explain : null) : null;
    if (theirs) out.push(`${label} gate ${String(b.id)}: its twin's explanation names an option by its place ("${theirs}"): that is true only in the order the twin was written; name the option by what it says`);
  }
  return out;
}

/**
 * Sizes (the lead's item 16, 27 Sep 2026): the limits a phone download should carry, in KB of serialised JSON (UTF-8).
 * b2-natural-selection-selective-breeding reached 3.37 MB with four questions of 350–650 KB of inline figure markup.
 */
export const SIZE_LIMITS_KB = { item: 40, note: 150, bundle: 600 } as const;
const kbOf = (v: unknown) => new TextEncoder().encode(JSON.stringify(v) ?? "").length / 1024;

/**
 * Warnings (never refusals) on size, one line each naming the item and its size: a question, a worked example or a See
 * it over 40 KB, a note (note.blocks.json) over 150 KB, a bundle over 600 KB.
 */
export function sizeWarnings(bundle: unknown, blocks: unknown, label: string): string[] {
  const out: string[] = [];
  const b = bundle && typeof bundle === "object" ? (bundle as Record<string, unknown>) : null;
  const line = (what: string, kb: number, limit: string) => `${label} ${what}: ${Math.round(kb)} KB serialised (${limit})`;
  const item = (what: string, v: unknown, noun: string) => {
    const kb = kbOf(v);
    if (kb > SIZE_LIMITS_KB.item) out.push(line(what, kb, `${noun} is at most ${SIZE_LIMITS_KB.item} KB; inline figure markup is the usual cause`));
  };
  if (b) {
    for (const q of onlyObjects(b.questions)) item(String(q.id), q, "a question");
    for (const w of onlyObjects(b.workedExamples)) item(String(w.id), w, "a worked example");
  }
  if (Array.isArray(blocks)) blocks.forEach((x, i) => x && typeof x === "object" && (x as Record<string, unknown>).type === "see" && item(`note block ${i} (See it)`, x, "a See it"));
  if (b && kbOf(b) > SIZE_LIMITS_KB.bundle) out.push(line("bundle.json", kbOf(b), `a bundle is at most ${SIZE_LIMITS_KB.bundle} KB`));
  if (Array.isArray(blocks) && kbOf(blocks) > SIZE_LIMITS_KB.note) out.push(line("note.blocks.json", kbOf(blocks), `a note is at most ${SIZE_LIMITS_KB.note} KB`));
  return out;
}

/** Every id a verification log of the bundle records as withdrawn (VerificationLog.withdrawn[].id, 25 Sep 2026). */
function withdrawnIds(bundle: unknown): Set<string> {
  const b = bundle && typeof bundle === "object" ? (bundle as Record<string, unknown>) : null;
  return new Set(onlyObjects(b?.verification).flatMap((l) => onlyObjects(l.withdrawn).map((w) => String(w.id))));
}

/* ------------------------------------------------------------------------------------------------------------------ */
/* Marking warnings: the Fable judge's rulings of 27 Sep 2026 (fork scratchpad reports/fable-marking-rulings-judgement.md) */

/**
 * A stem that asks for the form (the lead's item 14, 27 Sep 2026), most specific first so the quote names the ask:
 * "simplify fully", "simplest form", "a single fraction / logarithm", then "write … as" a form ("as a product of its
 * prime factors", "as a single power of y", "as one fraction"). Not "write down, as coordinates", "write your answer as
 * $x = …$", "as recorded" or "as an expression in x": those name a layout or a value, not a form (the corpus read on
 * 27 Sep 2026, every "write … as" stem with a numeric or algebraic spec).
 */
const FORM_ASKED = [
  /\bsimplify fully\b|\bfully simplif\w*/i,
  /\b(?:its |the )?simplest form\b|\blowest terms\b/i,
  /\ba single (?:fraction|logarithm|log)\b/i,
  /\bwrite\b[^.?!]*?\bas (?:a |an |one )?(?:single |simplified |mixed |improper )?(?:fraction|product|power|surd|decimal|percentage|mixed number|ratio|integer)\b/i,
];

/** "Show that …": the exam pays the working, never the printed result typed back (ruling 3). */
const SHOW_THAT = /\bshow that\b/i;
/**
 * A part that uses an earlier part's result, by its stem's words (ruling 14): "hence", "use your answer", "using your
 * value", "your answer to (a)", "your answer to part (b)", "from part (a)", "your answer to the previous part". Not
 * "give your answer to 3 significant figures", "your answer in standard form" or "use your graph" (a drawing, whose
 * follow-through is the diagram's).
 */
const PART_REF = String.raw`(?:part\s*)?\([a-z]{1,2}(?:\([ivx]{1,4}\))?\)|(?:the )?(?:previous|earlier|last|first) part`;
const USES_EARLIER = new RegExp(
  String.raw`\bhence\b|\b(?:use|using) your (?:answers?|values?|results?)\b|\byour answers? (?:to|from|for) (?:${PART_REF})|\bfrom (?:${PART_REF})`,
  "i",
);
const stemWords = (s: unknown) => String(s ?? "").replace(/\$[^$]*\$/g, " ");
/**
 * An earlier value merely printed again in a worked solution is evidence only when it could not be a coincidence: not a
 * whole number under 10, and not a constant every paper uses (g = 10, a right angle, 180°, 360°, 60 minutes, 100 %).
 */
const CONSTANTS = new Set([10, 60, 90, 100, 180, 270, 360, 1000]);
const distinctive = (v: number) => Number.isFinite(v) && (!Number.isInteger(v) || Math.abs(v) >= 10) && !CONSTANTS.has(Math.abs(v));
/** "By part (c), …", "from part (a)": the worked solution says it uses an earlier part. */
const SOLUTION_USES = new RegExp(String.raw`\b(?:by|from|using|with|in) (?:your answer to )?part \(?[a-z]{1,2}(?:\([ivx]{1,4}\))?\)?`, "i");
/** "Substituting $x = 4$ into …", "Putting $x = 24$ …", "With $n = 3$ …": the value put in, read from its maths. */
const SUBSTITUTES = /\b(?:substitut\w*|putting|put|with|using|when)\s+\$[^$]*?=\s*(-?\d+(?:\.\d+)?)\s*\$/gi;
const sameNumber = (a: number, b: number) => Math.abs(a - b) <= 1e-9 * Math.max(1, Math.abs(b));
/** The numbers written in a worked solution, maths delimiters and TeX spacing set aside. */
const numbersIn = (s: unknown) => [...String(s ?? "").replace(/\\[,;:! ]/g, "").matchAll(/(?<![\w.])-?\d+(?:\.\d+)?(?![\w.]*\d)/g)].map((m) => Number(m[0]));

/**
 * Warnings on a bundle's questions (never a refusal), one line each naming the topic, the item and the part:
 * - ruling 3: a "show that" part with a numeric or algebraic answer spec (typing the printed result back is paid, while
 *   the exam pays only the working): give it a working or steps spec;
 * - ruling 5: unitRequired on a maths or further-maths part (maths schemes carry no unit mark);
 * - ruling 14: a numeric part that uses an earlier numeric part (its stem says hence, using your, your answer to, from
 *   part (a); or its worked solution reuses the earlier value, when that value is not a whole number under 10) with no
 *   followThrough relation; `noFollowThrough`, a non-empty string quoting the scheme line that forbids it ("Allow no FT
 *   from an incorrect quadratic expression"), is the one exemption. The schema does not declare `noFollowThrough` yet
 *   (27 Sep 2026): the lint reads it from the raw bundle;
 * - ruling 15: a common error on a form task (mark.ts isFormTask: the engine's own reading) that earns more than
 *   marks − 1 (the form is itself a mark). Whether its value matches a line of the cited scheme cannot be read: a common
 *   error's `source` is a Chief Examiner citation, and bundles do not quote the scheme;
 * - the lead's item 14 (the M4 author's finding): a stem that asks for the form (FORM_ASKED) with a spec that holds none
 *   (algebraic: no `form`, `mustBeFactorised` or `mustBeExpanded`; numeric: neither `mustBeSimplified` nor an
 *   `acceptForms` without "decimal"), and every algebraic spec with equivalence "simplifiedOnly". Probed through
 *   markAnswer on 27 Sep 2026: "equivalent", "identical" and "simplifiedOnly" all pay the question typed back
 *   ((3x²−27)/(x²+x−6) for "Simplify fully" 3/3; "550" for "Write 550 as a product of its prime factors" 2/2), and so
 *   does `formTask: true` on an algebraic spec; `form: "simplest-fraction"` refuses it.
 * Only shipped items are read (the lead's item 15): a question whose log is not verified or published, or whose id a
 * log records as withdrawn, is skipped, as the build leaves it unshipped.
 */
export function markingWarnings(bundle: unknown, label: string): string[] {
  const out: string[] = [];
  const b = bundle && typeof bundle === "object" ? (bundle as Record<string, unknown>) : null;
  if (!b) return out;
  const topic = b.topic && typeof b.topic === "object" ? (b.topic as Record<string, unknown>) : {};
  const maths = topic.subject === "maths" || topic.subject === "further-maths";
  // Only what ships is warned on (the lead's item 15): a question whose log is not verified or published, or whose id a
  // log records as withdrawn, is left out, as the build leaves it unshipped. A bundle with no logs is read in full.
  const logs = Array.isArray(b.verification) ? onlyObjects(b.verification) : null;
  const gone = withdrawnIds(b);
  const ships = (q: Record<string, unknown>) =>
    !gone.has(String(q.id)) && (logs === null || SHIPPED_LOG.has(String(logs.find((l) => l.id === q.verification)?.status)));
  for (const q of onlyObjects(b.questions).filter(ships)) {
    const parts = onlyObjects(q.parts);
    parts.forEach((p, k) => {
      const at = `${label} ${String(q.id)}(${String(p.id)})`;
      const a = p.answer && typeof p.answer === "object" ? (p.answer as Record<string, unknown>) : {};
      const marks = typeof p.marks === "number" ? p.marks : 0;

      // the form the stem asks for, held by the spec (item 14): the engine marks equivalent, identical and
      // simplifiedOnly specs after simplifying her answer, so without a form the question typed back is paid in full
      if (a.kind === "algebraic" && a.equivalence === "simplifiedOnly")
        out.push(`${at}: equivalence "simplifiedOnly" marks her answer after simplifying it, so the question typed back and an uncancelled answer earn full marks; use a form (simplest-fraction …) instead`);
      else {
        const stem = stemWords(p.stem);
        const asked = FORM_ASKED.map((re) => re.exec(stem)?.[0]).find(Boolean)?.trim();
        const acceptForms = Array.isArray(a.acceptForms) ? a.acceptForms : [];
        if (asked && a.kind === "algebraic" && a.form === undefined && a.mustBeFactorised !== true && a.mustBeExpanded !== true)
          out.push(`${at}: the stem asks for the form ("${asked}") but the answer spec holds none (no form, mustBeFactorised or mustBeExpanded): the engine pays any equal expression in full, the question typed back included; give it the form (simplest-fraction, single-fraction …)`);
        if (asked && a.kind === "numeric" && a.mustBeSimplified !== true && (acceptForms.length === 0 || acceptForms.includes("decimal")))
          out.push(`${at}: the stem asks for the form ("${asked}") but the answer spec holds none (neither mustBeSimplified nor a form-only acceptForms): the engine pays any equal expression in full, the question typed back included; give it the form (acceptForms ["fraction"], mustBeSimplified)`);
      }

      if (SHOW_THAT.test(stemWords(p.stem)) && (a.kind === "numeric" || a.kind === "algebraic"))
        out.push(`${at}: a "show that" part with ${a.kind === "algebraic" ? "an algebraic" : "a numeric"} answer spec: typing the printed result back is paid, and the exam pays only the working (ruling 3); give it a working or steps spec`);

      if (maths && a.kind === "numeric" && a.unitRequired === true)
        out.push(`${at}: unitRequired on a ${String(topic.subject)} part: maths schemes carry no unit mark (ruling 5), so a right value without its unit loses a mark the exam gives`);

      if (a.kind === "numeric" && k > 0) {
        const earlier = parts.slice(0, k).filter((e) => e.answer && typeof e.answer === "object" && (e.answer as Record<string, unknown>).kind === "numeric");
        const ft = p.followThrough && typeof p.followThrough === "object" ? (p.followThrough as Record<string, unknown>) : null;
        const cue = USES_EARLIER.exec(stemWords(p.stem))?.[0];
        const own = typeof a.value === "number" ? a.value : NaN;
        const solution = typeof p.workedSolution === "string" ? p.workedSolution : "";
        const valueOf = (e: Record<string, unknown>) => (e.answer as Record<string, unknown>).value as number;
        const other = earlier.filter((e) => typeof valueOf(e) === "number" && !sameNumber(valueOf(e), own));
        // The worked solution's evidence, strongest first: the engine's own chain reader computes this answer from the
        // earlier value; the value is substituted ("Substituting $x = 4$ …"); the solution names the part ("By part (c)");
        // the value, one that cannot be a coincidence, is printed again.
        const perturbed = (v: number) => String(Math.round((v * 1.1 + 0.37) * 1e6) / 1e6);
        const computed = other.find((e) => distinctive(valueOf(e)) && followThroughValue({ earlierSpec: e.answer as AnswerSpec, earlierRaw: perturbed(valueOf(e)), workedSolution: solution }, a as AnswerSpec) !== null);
        const substituted = other.find((e) => [...solution.matchAll(SUBSTITUTES)].some((m) => sameNumber(Number(m[1]), valueOf(e))));
        const says = SOLUTION_USES.exec(solution.replace(/\$[^$]*\$/g, " "))?.[0];
        const reused = other.find((e) => distinctive(valueOf(e)) && numbersIn(solution).some((n) => sameNumber(n, valueOf(e))));
        const evidence = computed ?? substituted ?? reused;
        // the part it uses: the one its followThrough names; else the one its stem names ("your answer to (a)"); else the
        // one the worked solution uses; else the nearest numeric part before it
        const named = cue ? earlier.find((e) => new RegExp(`\\(${String(e.id).replace(/[()]/g, "\\$&")}\\)`).test(stemWords(p.stem))) : undefined;
        const from = (ft && typeof ft.fromPart === "string" ? parts.find((e) => e.id === ft.fromPart) : undefined) ?? named ?? evidence ?? earlier[earlier.length - 1];
        const exempt = typeof p.noFollowThrough === "string" && /\S/.test(p.noFollowThrough);
        if (from && (cue || says || evidence) && !exempt && !(ft && typeof ft.relation === "string" && /\S/.test(ft.relation))) {
          const why = cue
            ? `"${cue}"`
            : computed
              ? `its worked solution computes the answer from ${String(valueOf(computed))}`
              : substituted
                ? `its worked solution substitutes ${String(valueOf(substituted))}`
                : says
                  ? `its worked solution says "${says}"`
                  : `its worked solution reuses ${String(valueOf(reused!))}`;
          const fix = "add followThrough with its relation, or noFollowThrough quoting the scheme line";
          if (!ft) out.push(`${at}: uses part (${String(from.id)}) (${why}) but has no followThrough: a right answer from her own earlier value is refused (ruling 14); ${fix}`);
          else {
            const earlierSpec = (from.answer ?? {}) as AnswerSpec;
            const v0 = typeof (earlierSpec as Record<string, unknown>).value === "number" ? ((earlierSpec as Record<string, unknown>).value as number) : 1;
            const chain = followThroughValue({ earlierSpec, earlierRaw: String(Math.round((v0 * 1.1 + 0.37) * 1e6) / 1e6), workedSolution: typeof p.workedSolution === "string" ? p.workedSolution : undefined }, a as AnswerSpec);
            out.push(`${at}: uses part (${String(from.id)}) (${why}) but its followThrough has no relation (${chain !== null ? "the worked solution's chain carries it today" : "and the worked solution's chain does not carry it, so a consistent answer is refused"}) (ruling 14); add the relation, or noFollowThrough quoting the scheme line`);
          }
        }
      }

      if (marks > 0 && isFormTask(typeof p.stem === "string" ? p.stem : undefined, a as AnswerSpec))
        for (const ce of onlyObjects(p.commonErrors))
          if (typeof ce.marksTypicallyEarned === "number" && ce.marksTypicallyEarned > marks - 1)
            out.push(`${at}: common error ${String(ce.misconception)} earns ${ce.marksTypicallyEarned} of ${marks} on a form task (at most ${marks - 1}: the form is a mark; ruling 15)`);
    });
  }
  return out;
}
