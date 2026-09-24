/**
 * Marking for `matrix` answers — CCEA Further Mathematics Unit 1 works in 2×2 matrices: addition,
 * subtraction, scalar multiples, products, the identity, determinants and inverses. One expected entry
 * per position, addressed the way she counts a matrix, from 1 ("Row 2, column 1" is the bottom-left
 * entry of a 2×2).
 *
 * `parseMatrix` reads every spelling a learner or an author is likely to write:
 *  - a LaTeX environment, `\begin{pmatrix} 1 & 2 \\ 3 & 4 \end{pmatrix}` (pmatrix, bmatrix, Bmatrix,
 *    vmatrix, Vmatrix, matrix, smallmatrix), inside `$…$`, `\(…\)` or `\[…\]` or bare;
 *  - a nested list, `[[1,2],[3,4]]` or `((1,2),(3,4))`;
 *  - the plain grid the field submits, rows on new lines or separated by ";" and entries by spaces or
 *    commas ("1 2; 3 4").
 * A name in front of it ("AB = 1 2; 3 4") is read through.
 *
 * `checkMatrix` compares entry by entry: an entry of digits through the numeric engine within the
 * spec's absolute tolerance (exact when none is given), an entry carrying a letter or a TeX command
 * through the algebra engine's equivalence, so "0.5", "1/2" and "\frac{1}{2}" are one answer. The
 * feedback names the first entries that are out by row and column, says so when the answer is the
 * transpose (the right entries read the other way round), and asks for the right size when the shape
 * differs. The part's marks are shared in proportion by `shareMarks` in mark.ts, as for a table.
 *
 * Pure; never throws on learner input.
 */
import { checkAlgebraic } from "./algebra";
import { checkNumeric } from "./numeric";

export type MatrixTolerance = { type: "absolute"; value: number };

export interface MatrixExpect {
  rows: number;
  cols: number;
  /** `rows` rows of `cols` entries, each a number or a short algebraic expression as LaTeX or plain text. */
  entries: readonly (readonly string[])[];
  /** Absolute tolerance per entry; without one every entry must be the value as written. */
  tolerance?: MatrixTolerance;
}

export interface MatrixWrongCell {
  row: number;
  col: number;
  /** The entry as typed, tidied. */
  got: string;
  /** The entry the spec asks for, as authored. */
  expected: string;
}

export interface MatrixVerdict {
  correct: boolean;
  /** Entries that are right and in the right position, out of `total`. */
  inPlace: number;
  total: number;
  wrongCells: MatrixWrongCell[];
  feedback: string;
  /** The answer is the spec's matrix with its rows and columns swapped. */
  transposed: boolean;
  shape: "ok" | "wrong-size" | "unparseable";
}

/** "Row 2, column 1" for the entry at [1][0] — the way she counts a matrix, from 1. */
export const entryLabel = (cell: { row: number; col: number }): string => `Row ${cell.row + 1}, column ${cell.col + 1}`;

// ---------------------------------------------------------------------------
// Reading what she typed
// ---------------------------------------------------------------------------

/** One entry, tidied: TeX spacing dropped, minus signs in one spelling, no leading "+", single spaces. */
export function tidyEntry(s: string): string {
  return s
    .replace(/\\[,;:!]/g, " ")
    .replace(/\\(?:quad|qquad)(?![a-zA-Z])/g, " ")
    .replace(/[−–—]/g, "-")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/^\+(?=[^\s])/, "");
}

/** The entry as the feedback prints it: a true minus sign, so "-3" reads "−3". */
export const formatEntry = (s: string): string => tidyEntry(s).replace(/^-/, "−");

/** Strips any number of `$…$`, `$$…$$`, `\(…\)` or `\[…\]` wrappers. */
function stripMathDelimiters(raw: string): string {
  let s = raw.trim();
  for (;;) {
    const before = s;
    s = s
      .replace(/^\$\$([\s\S]*)\$\$$/, "$1")
      .replace(/^\$([\s\S]*)\$$/, "$1")
      .replace(/^\\\(([\s\S]*)\\\)$/, "$1")
      .replace(/^\\\[([\s\S]*)\\\]$/, "$1")
      .trim();
    if (s === before) return s;
  }
}

const MATRIX_ENV = /\\begin\s*\{(pmatrix|bmatrix|Bmatrix|vmatrix|Vmatrix|matrix|smallmatrix)\*?\}([\s\S]*?)\\end\s*\{\1\*?\}/;

/** A matrix named in front of the answer: "AB = …", "A^{-1} = …", "M = …". */
const NAMED = /^\s*[A-Za-z][A-Za-z0-9\s^{}'*-]*=\s*/;

/** The rows of a LaTeX matrix environment's body: "\\" ends a row (with an optional "[2pt]"), "&" separates entries. */
function rowsFromEnv(body: string): string[][] {
  return body
    .split(/\\\\(?:\s*\[[^\]]*\])?/)
    .map((row) => row.split("&").map(tidyEntry))
    .filter((row) => row.some((e) => e !== ""));
}

const GROUP = () => /[[(]([^[\]()]*)[\])]/g;

/** "[[1,2],[3,4]]", "((1,2),(3,4))" or "(1,2),(3,4)" — two or more bracketed rows and nothing else. */
function rowsFromNestedList(s: string): string[][] | null {
  const groups = [...s.matchAll(GROUP())];
  if (groups.length < 2) return null;
  const leftover = s
    .replace(GROUP(), "")
    .replace(/^[[(]|[\])]$/g, "")
    .replace(/[,;\s]/g, "");
  if (leftover !== "") return null;
  return groups.map((g) => splitRow(g[1] ?? "")).filter((row) => row.length > 0);
}

/** One row's entries: separated by commas or spaces. */
const splitRow = (row: string): string[] =>
  row
    .split(/[,\s]+/)
    .map(tidyEntry)
    .filter((e) => e !== "");

/** A single bracket pair around the whole answer ("[1 2; 3 4]", "(1, 2)") is a wrapper, not a row. */
function unwrapOuter(s: string): string {
  const m = /^[[(]([\s\S]*)[\])]$/.exec(s.trim());
  if (!m) return s;
  const inner = m[1] ?? "";
  // Only when the brackets really are the outermost pair.
  return /[[(\])]/.test(inner) ? s : inner;
}

/** Rows on new lines or separated by ";", entries by spaces or commas. */
function rowsFromGrid(s: string): string[][] {
  return s
    .split(/[;\n]+/)
    .map(splitRow)
    .filter((row) => row.length > 0);
}

/**
 * The matrix she typed, as rows of entry text, or null when nothing readable is there. Rows may come
 * back ragged: that is an answer of the wrong shape, which `checkMatrix` says rather than hides.
 */
/** A scalar written in front of the matrix, as CCEA prints an inverse: "\\frac{1}{5}", "1/5", "0.2", "-2", with an optional times sign. */
const LEADING_SCALAR = /^\s*(-?)\s*(?:\\[dt]?frac\{\s*(-?\d+)\s*\}\{\s*(-?\d+)\s*\}|(-?\d+)\s*\/\s*(\d+)|(-?\d+(?:\.\d+)?))\s*(?:\\times|\\cdot|\*|×)?\s*(?=\\left|\\begin|\[|\()/;

function gcd(a: number, b: number): number {
  return b === 0 ? Math.abs(a) : gcd(b, a % b);
}

/** Multiplies a parsed entry by num/den, keeping a fraction exact and trimming a decimal. */
function scaleEntry(entry: string, num: number, den: number): string {
  const frac = /^(-?\d+)\s*\/\s*(\d+)$/.exec(entry);
  const plain = /^-?\d+(?:\.\d+)?$/.test(entry);
  if (!frac && !plain) return `(${num}/${den})*(${entry})`;
  const en = frac ? Number(frac[1]) : Number(entry);
  const ed = frac ? Number(frac[2]) : 1;
  if (Number.isInteger(en) && Number.isInteger(num)) {
    let n = en * num;
    let d = ed * den;
    if (d < 0) {
      n = -n;
      d = -d;
    }
    const g = gcd(n, d) || 1;
    n /= g;
    d /= g;
    return d === 1 ? String(n) : `${n}/${d}`;
  }
  const v = (en / ed) * (num / den);
  return String(Math.round(v * 1e10) / 1e10);
}

export function parseMatrix(raw: string): string[][] | null {
  if (typeof raw !== "string") return null;
  let s = stripMathDelimiters(raw);
  // A scalar in front is multiplied into every entry, so "1/5 (2 -1; -3 4)" is the matrix it means.
  let scale: { num: number; den: number } | null = null;
  const lead = LEADING_SCALAR.exec(s);
  if (lead) {
    const sign = lead[1] === "-" ? -1 : 1;
    if (lead[2] !== undefined) scale = { num: sign * Number(lead[2]), den: Number(lead[3]) };
    else if (lead[4] !== undefined) scale = { num: sign * Number(lead[4]), den: Number(lead[5]) };
    else scale = { num: sign * Number(lead[6]), den: 1 };
    if (!Number.isFinite(scale.num) || !scale.den) scale = null;
    else s = s.slice(lead[0].length);
  }
  const env = MATRIX_ENV.exec(s);
  let rows: string[][] | null;
  if (env) {
    rows = rowsFromEnv(env[2] ?? "");
  } else {
    const plain = s
      .replace(/\\left\s*/g, "")
      .replace(/\\right\s*/g, "")
      .replace(NAMED, "")
      .trim();
    rows = rowsFromNestedList(plain) ?? rowsFromGrid(unwrapOuter(plain));
  }
  if (!rows || rows.length === 0) return null;
  if (rows.some((row) => row.length === 0 || row.some((e) => e === ""))) return null;
  if (scale) {
    const { num, den } = scale;
    return rows.map((row) => row.map((e) => scaleEntry(e, num, den)));
  }
  return rows;
}

// ---------------------------------------------------------------------------
// Comparing it with the spec
// ---------------------------------------------------------------------------

/** An entry with a letter or a TeX command is algebra ("2a", "\frac{1}{2}"); anything else is a number. */
const isAlgebraic = (entry: string): boolean => /[a-zA-Z\\]/.test(entry);

const PLAIN_NUMBER = /^-?\d+(?:\.\d+)?$/;

/**
 * Is the typed entry the expected one? The same spelling always passes; otherwise a numeric entry goes
 * to the numeric engine within the spec's tolerance (exact when none is given) and an algebraic one to
 * the algebra engine's equivalence.
 */
export function entryMatches(typed: string, expected: string, tolerance?: MatrixTolerance): boolean {
  const got = tidyEntry(typed);
  const want = tidyEntry(expected);
  if (got === "" || want === "") return false;
  if (got === want) return true;
  const tol: MatrixTolerance = { type: "absolute", value: tolerance ? Math.abs(tolerance.value) : 0 };
  try {
    if (!isAlgebraic(want) && !isAlgebraic(got)) return checkNumeric(got, { value: want, tolerance: tol }).correct;
    return checkAlgebraic(got, { answer: want, mode: "equivalent" }).correct;
  } catch {
    return false;
  }
}

/** Entry for entry, the spelling as written or the same number ("7.0" is 7). What a common-error pattern means by equal. */
export function sameMatrixEntries(a: readonly (readonly string[])[], b: readonly (readonly string[])[]): boolean {
  if (a.length !== b.length) return false;
  return a.every((row, r) => {
    const other = b[r] ?? [];
    if (row.length !== other.length) return false;
    return row.every((entry, c) => {
      const x = tidyEntry(entry);
      const y = tidyEntry(other[c] ?? "");
      if (x === y) return x !== "";
      return PLAIN_NUMBER.test(x) && PLAIN_NUMBER.test(y) && Number(x) === Number(y);
    });
  });
}

const transpose = (m: readonly (readonly string[])[]): string[][] =>
  (m[0] ?? []).map((_, c) => m.map((row) => row[c] ?? ""));

/** Is this matrix the spec's, entry for entry, at the spec's size? */
function matchesSpec(m: readonly (readonly string[])[], spec: MatrixExpect): boolean {
  if (m.length !== spec.rows) return false;
  return m.every((row, r) => {
    const want = spec.entries[r] ?? [];
    return row.length === spec.cols && want.length === spec.cols && row.every((e, c) => entryMatches(e, want[c] ?? "", spec.tolerance));
  });
}

const size = (rows: number, cols: number): string => `${rows} by ${cols}`;

const UNREADABLE =
  "That could not be read as a matrix. Type one row at a time, with spaces between the entries and a semicolon between the rows, like 1 2; 3 4.";
const TRANSPOSED = "That is the transpose: the rows and the columns are the other way round.";

/** "Row 2, column 1 should be −3", the first two that are out, with a count of any others. */
function entryFeedback(inPlace: number, total: number, wrong: readonly MatrixWrongCell[]): string {
  const named = wrong.slice(0, 2).map((w) => `${entryLabel(w)} should be ${formatEntry(w.expected)}`);
  const rest = wrong.length - named.length;
  const count = inPlace === 0 ? "" : `${inPlace} of ${total} entries ${inPlace === 1 ? "is" : "are"} right. `;
  const more = rest > 0 ? ` ${rest} other ${rest === 1 ? "entry needs" : "entries need"} another look.` : "";
  return `${count}${named.join(". ")}.${more}`;
}

/** Marks a typed matrix entry by entry. An answer of the wrong shape earns nothing and is asked for again at the right size. */
export function checkMatrix(raw: string, spec: MatrixExpect): MatrixVerdict {
  const total = Math.max(0, spec.rows * spec.cols);
  const got = parseMatrix(raw);
  if (!got) return { correct: false, inPlace: 0, total, wrongCells: [], feedback: UNREADABLE, transposed: false, shape: "unparseable" };

  const width = got[0]?.length ?? 0;
  const ragged = got.some((row) => row.length !== width);

  if (!ragged && got.length === spec.rows && width === spec.cols) {
    const wrongCells: MatrixWrongCell[] = [];
    let inPlace = 0;
    for (let r = 0; r < spec.rows; r += 1) {
      for (let c = 0; c < spec.cols; c += 1) {
        const expected = spec.entries[r]?.[c] ?? "";
        const typed = got[r]?.[c] ?? "";
        if (entryMatches(typed, expected, spec.tolerance)) inPlace += 1;
        else wrongCells.push({ row: r, col: c, got: tidyEntry(typed), expected });
      }
    }
    if (wrongCells.length === 0) {
      return {
        correct: true,
        inPlace,
        total,
        wrongCells,
        feedback: total === 1 ? "The entry is right." : "Every entry is right.",
        transposed: false,
        shape: "ok",
      };
    }
    // A square answer can be the transpose at the right size; that is one whole idea, so it is named
    // rather than read out entry by entry.
    const transposed = spec.rows === spec.cols && matchesSpec(transpose(got), spec);
    return {
      correct: false,
      inPlace,
      total,
      wrongCells,
      feedback: transposed ? TRANSPOSED : entryFeedback(inPlace, total, wrongCells),
      transposed,
      shape: "ok",
    };
  }

  // The wrong shape: no entry has a position to be in, so nothing is earned. A transpose of a matrix that
  // is not square lands here, and the transpose is the more useful thing to say about it.
  const transposed = !ragged && got.length === spec.cols && width === spec.rows && matchesSpec(transpose(got), spec);
  const feedback = transposed
    ? TRANSPOSED
    : ragged
      ? `This answer should be a ${size(spec.rows, spec.cols)} matrix, with the same number of entries in every row.`
      : `This answer should be a ${size(spec.rows, spec.cols)} matrix; that one is ${size(got.length, width)}.`;
  return { correct: false, inPlace: 0, total, wrongCells: [], feedback, transposed, shape: "wrong-size" };
}

// ---------------------------------------------------------------------------
// Writing one out
// ---------------------------------------------------------------------------

/** The response the field submits and `parseMatrix` reads back: "1 2; 3 4". */
export function formatMatrixResponse(entries: readonly (readonly string[])[]): string {
  return entries.map((row) => row.map((e) => tidyEntry(e).replace(/\s+/g, "")).join(" ")).join("; ");
}

/**
 * The typed matrix as the plain grid ("1 2; 3 4"), which is how authors write a text common-error pattern
 * against one; a response that cannot be read is returned as it is.
 */
export function matrixResponseText(raw: string): string {
  const m = parseMatrix(raw);
  return m ? formatMatrixResponse(m) : raw;
}

/** The matrix as LaTeX, for the note, the feedback card and the worked solution. */
export function matrixLatex(entries: readonly (readonly string[])[], env = "pmatrix"): string {
  const body = entries.map((row) => row.map(tidyEntry).join(" & ")).join(" \\\\ ");
  return `\\begin{${env}} ${body} \\end{${env}}`;
}

/** What the marker expects, for the "Expected" row of a result. */
export const describeMatrixExpect = (spec: MatrixExpect): string => `$${matrixLatex(spec.entries)}$`;
