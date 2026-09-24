/**
 * Marking for `table` answers ("complete the table"): one expected value per cell, addressed by the spec's own
 * row and column numbers (0-based, from the top-left cell under the headings; column 0 is usually the row's
 * heading) and named the way she counts them, from 1 ("Row 1, column 1" is that top-left cell). The field submits
 * JSON (`formatTableResponse`). A numeric cell is checked by the numeric engine
 * within the cell's tolerance, exact when none is given; a text cell after `normaliseText`: equal to the expected
 * wording or one of its "/"-separated alternatives ("lilac/purple"), or containing it whole. Feedback names
 * every cell that is off, with what it should be. Pure; no content dependencies beyond the tolerance type.
 */
import type { Tolerance } from "@/lib/content/schema";
import { normaliseText, phraseIn } from "@/components/items/text-marking";
import { checkNumeric, droppedZerosReminder, formatNumber, parseNumeric, type NumericSpec, type Tolerance as NumericTolerance } from "./numeric";

export interface TableCell {
  row: number;
  col: number;
  value: number | string;
  tolerance?: Tolerance;
}

export interface TableExpect {
  cells: readonly TableCell[];
}

export interface TableResponseCell {
  row: number;
  col: number;
  /** As typed; "" for a cell left blank. */
  value: string;
}

export interface TableResponse {
  cells: TableResponseCell[];
}

export interface TableOptions {
  /**
   * The part's stem instructs an accuracy ("Give each value in grams to two decimal places"). A d.p. or s.f. tolerance
   * is then a demand on what she writes, as it is for a numeric part: too many places is wrong, and a right value with
   * its final zeros dropped is right, with the reminder to write them (engine item 5, 23 Sep 2026: a table cell
   * "2.9" for 2.90 passed in silence). Without one the tolerance is only a closeness test.
   */
  accuracyInstructed?: boolean;
}

export interface TableVerdict {
  correct: boolean;
  /** Cells that match, out of `total`. */
  earned: number;
  total: number;
  feedback: string;
}

/** "Row 2, column 4" for the spec's row 1, column 3 — the cell's name in the field and in feedback, counted from 1. */
export const cellLabel = (cell: { row: number; col: number }): string => `Row ${cell.row + 1}, column ${cell.col + 1}`;

export function formatTableResponse(r: TableResponse): string {
  return JSON.stringify(r);
}

/** A response string from the field, or null when it is not one. */
export function parseTableResponse(raw: string): TableResponse | null {
  const t = raw.trim();
  if (!t.startsWith("{")) return null;
  try {
    const o = JSON.parse(t) as { cells?: unknown };
    if (!Array.isArray(o.cells)) return null;
    const cells: TableResponseCell[] = [];
    for (const c of o.cells) {
      if (!c || typeof c !== "object") continue;
      const { row, col, value } = c as Record<string, unknown>;
      if (typeof row !== "number" || typeof col !== "number" || !Number.isInteger(row) || !Number.isInteger(col)) continue;
      cells.push({ row, col, value: typeof value === "string" ? value : typeof value === "number" ? String(value) : "" });
    }
    return { cells };
  } catch {
    return null;
  }
}

/** The schema's tolerance in the numeric engine's terms; a cell without one must be the value as written. */
function engineTolerance(t: Tolerance | undefined): NumericTolerance {
  if (!t) return { type: "absolute", value: 0 };
  switch (t.type) {
    case "absolute":
      return { type: "absolute", value: t.value };
    case "relative":
      return { type: "relative", value: t.value };
    case "dp":
      return { type: "dp", n: t.places };
    case "sf":
      return { type: "sigfigs", n: t.figures };
    case "range":
      return { type: "range", min: t.min, max: t.max };
    case "exact":
      return { type: "absolute", value: 0 };
  }
}

/** Is the typed number the cell's value, within its tolerance? Anything the engine cannot read is not. */
export function numericCellMatches(typed: string, value: number, tolerance?: Tolerance, opts: TableOptions = {}): boolean {
  return checkNumeric(typed, cellSpec(value, tolerance, opts)).correct;
}

/** The numeric engine's spec for a cell: its tolerance, and the accuracy the stem demands of it, if any. */
function cellSpec(value: number, tolerance: Tolerance | undefined, opts: TableOptions): NumericSpec {
  const spec: NumericSpec = { value, tolerance: engineTolerance(tolerance) };
  if (opts.accuracyInstructed && tolerance?.type === "dp") spec.dp = tolerance.places;
  if (opts.accuracyInstructed && tolerance?.type === "sf") spec.sigfigs = tolerance.figures;
  return spec;
}

/** A right cell written with fewer decimal places than the stem demands ("2.9" for 2.90). */
function droppedZeros(typed: string, cell: TableCell, opts: TableOptions): boolean {
  if (!opts.accuracyInstructed || cell.tolerance?.type !== "dp") return false;
  const given = parseNumeric(typed)?.decimalPlaces;
  return given !== null && given !== undefined && given < cell.tolerance.places;
}

/** Lower-case and punctuation-blind, with hyphens as spaces so "yellow-brown" and "yellow brown" are one phrase. */
const norm = (s: string): string => normaliseText(s).replace(/-/g, " ").replace(/\s+/g, " ").trim();

/** "lilac/purple" → ["lilac", "purple"]: an expected text written with alternatives accepts any of them. */
const alternatives = (expected: string): string[] =>
  expected
    .split("/")
    .map((s) => s.trim())
    .filter(Boolean);

/**
 * Words that frame an answer without naming anything: "it is glucose", "it's XX", "the answer is lipase", "a brick red
 * precipitate forms". Whatever else sits beside the expected phrase names something else: a hedge ("XX or XY"), a
 * second answer ("simple sugars and protein") or a negation ("not XX").
 */
const FRAME_BEFORE = /^(?:(?:it|this|that|they|these|those|its|thats|theyre)\s+(?:(?:is|are|was|were)\s+)?)?(?:(?:the\s+)?answer\s+(?:is\s+)?)?(?:=\s*)?(?:(?:a|an|the|some)\s+)?/;
const FRAME_AFTER = /\s+(?:(?:is|are|was|were)\s+)?(?:formed|forms|form|produced|seen|appears|present|made|obtained)$/;
const unframed = (s: string): string => s.replace(FRAME_BEFORE, "").replace(FRAME_AFTER, "").trim();
const wordCount = (s: string): number => s.split(" ").filter(Boolean).length;

/**
 * Is the typed text the cell's wording, as the whole answer? Equal after normalising and after the framing words
 * come off, or the same phrase with a plural or inflection of its own ("amino acid" for "amino acids"), so "it is
 * glucose", "a brick red precipitate forms" and "purple" for "lilac/purple" pass while "brick red" for "brick red
 * precipitate" does not. An answer that merely contains the phrase is not it: the cell used to match whenever the
 * phrase appeared anywhere, so "XX or XY" earned an XX box (engine item 6, 23 Sep 2026).
 */
export function textCellMatches(typed: string, expected: string): boolean {
  const answer = norm(typed);
  if (!answer) return false;
  const core = unframed(answer);
  return alternatives(expected).some((alt) => {
    const a = norm(alt);
    if (a === "") return false;
    if (answer === a || core === a || core === unframed(a)) return true;
    return phraseIn(core, a) && wordCount(core) === wordCount(a);
  });
}

/** The expected value for display: a number to the accuracy its tolerance names, text as written. */
export function formatCellValue(cell: TableCell): string {
  if (typeof cell.value === "string") return cell.value;
  const t = cell.tolerance;
  const s = t?.type === "dp" ? formatNumber(cell.value, { dp: t.places }) : t?.type === "sf" ? formatNumber(cell.value, { sigfigs: t.figures }) : formatNumber(cell.value);
  return s.replace(/^-/, "−");
}

const MAX_ECHO = 40;

/** What she typed, quoted when the cell is text, shortened when it runs on. */
function echo(typed: string, text: boolean): string {
  const t = typed.length > MAX_ECHO ? `${typed.slice(0, MAX_ECHO - 1)}…` : typed;
  return text ? `"${t}"` : t;
}

/** Marks a field response cell by cell. An unreadable response scores nothing. */
export function checkTable(raw: string, expect: TableExpect, opts: TableOptions = {}): TableVerdict {
  const total = expect.cells.length;
  const response = parseTableResponse(raw);
  if (!response) return { correct: false, earned: 0, total, feedback: "Nothing has been filled in yet." };
  let earned = 0;
  const notes: string[] = [];
  /** Right cells to write with their zeros, by the places the stem asks for. */
  const zeros = new Map<number, string[]>();
  for (const cell of expect.cells) {
    const typed = (response.cells.find((c) => c.row === cell.row && c.col === cell.col)?.value ?? "").trim();
    const text = typeof cell.value === "string";
    const shouldBe = text ? `"${cell.value}"` : formatCellValue(cell);
    if (typed === "") {
      notes.push(`${cellLabel(cell)} is not filled in yet; it should be ${shouldBe}`);
      continue;
    }
    const ok = typeof cell.value === "number" ? numericCellMatches(typed, cell.value, cell.tolerance, opts) : textCellMatches(typed, cell.value);
    if (ok) {
      earned += 1;
      if (cell.tolerance?.type === "dp" && droppedZeros(typed, cell, opts)) zeros.set(cell.tolerance.places, [...(zeros.get(cell.tolerance.places) ?? []), shouldBe]);
    } else notes.push(`${cellLabel(cell)} should be ${shouldBe}, not ${echo(typed, text)}`);
  }
  const reminders = [...zeros].map(([places, written]) => ` ${droppedZerosReminder(places, written)}`).join("");
  const correct = earned === total;
  const feedback = correct
    ? `${total === 1 ? "The cell is right." : "Every cell is right."}${reminders}`
    : `${earned === 0 ? "" : `${earned} of ${total} cells ${earned === 1 ? "is" : "are"} right. `}${notes.join(". ")}.${reminders}`;
  return { correct, earned, total, feedback };
}

/**
 * The typed values in cell order, comma-separated ("15, 40, 18, 30"), which is how authors write text common-error
 * patterns against a completed row; a response that is not the field's JSON is returned as it is.
 */
export function tableResponseText(raw: string): string {
  const r = parseTableResponse(raw);
  if (!r) return raw;
  return r.cells
    .map((c) => c.value.trim())
    .filter(Boolean)
    .join(", ");
}

/** What the marker expects, for the "expected" line of a result: "Row 2, column 2: 3; Row 2, column 3: 4". */
export function describeTableExpect(expect: TableExpect): string {
  return expect.cells.map((c) => `${cellLabel(c)}: ${formatCellValue(c)}`).join("; ");
}
