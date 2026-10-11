/**
 * Helpers for FindTheMistake and the faded worked-example steps (pure): the reason
 * sentence, and whether a typed line matches an authored one — by line (after
 * normalisation) or by its final value.
 *
 * What the fix box will and will not take (engine brief items 1, 4 and 12, 23 Sep 2026). A sweep of every published
 * find-the-mistake found the fix box saying "Fixed." to 17 flagged wrong lines typed back as written, to 188 lines
 * she already had on the page, and to algebraic lines whose last digit agreed with the correction's (an exponent, a
 * bracket's constant), because the value fallback read "the last number" of any line; and refusing correction lines
 * typed exactly as printed, because only the authored side was tidied (docs/dev/qa/pre-read/fm1-g-logs-reverify.md
 * "A", fm2-c-1.md D4/E8, fm3-b-1.md E2). So `markFix` now:
 *   - refuses a line already on the page (the flagged one or a sound one) and a correction line that only restates
 *     what her working already had;
 *   - reads both sides the same way (TeX, `\mathbf{…}`, colons, full stops, a leading "=");
 *   - compares the clauses of a correction line ("37 − x = 32, so x = 5"), its `$…$` pieces, an equation she has
 *     rearranged ("18 − x + x + 15 − x + 4 = 32"), and a prose line's value with its direction words;
 *   - takes a value only when it is a result the corrected working states — the flagged line's own corrected value
 *     or the final answer — and never a value her working had already reached.
 */
import { checkNumeric, normaliseUnit, parseNumeric, unitDimension } from "@/lib/marking/numeric";
import { checkAlgebraic } from "@/lib/marking/algebra";
import { parseMatrix } from "@/lib/marking/matrix";
import { equationsMatch, normaliseEquation } from "./equation-marking";
import { mdToPlain } from "./md";

/** First sentence of a paragraph: "She took the midpoint. Eight of…" → "She took the midpoint." */
export function firstSentence(text: string): string {
  const m = /^(.+?[.!?])(\s|$)/.exec(text.trim());
  return (m ? m[1] : text).trim();
}

/** The last number in a line of working: "Median ≈ 30 + (8 ÷ 26) × 20 = 36.2 cm" → 36.2. */
export function lastNumber(line: string): number | null {
  const cleaned = line
    .replace(/[−–]/g, "-")
    // An exponent on a unit is not a value: "4 m/s^2", "4 ms^-2" and "4 m s^{-2}" all end in 4.
    .replace(/(?<=[a-zA-Zµ°])\s*\^\s*\{?-?\d+\}?/g, "")
    .replace(/(?<=[a-zA-Zµ°])-?\d+(?=\s|$)/g, "");
  // A line that ends on a fraction states the fraction's value ("= 27/55" is 0.4909…), not its denominator.
  const frac = /(-?\d+(?:\.\d+)?)\s*\/\s*(\d+(?:\.\d+)?)\s*[a-zA-Z°%²³]{0,4}\s*$/.exec(cleaned);
  if (frac && Number(frac[2]) !== 0) return Number(frac[1]) / Number(frac[2]);
  const matches = cleaned.match(/-?\d+(?:\.\d+)?/g);
  if (!matches || matches.length === 0) return null;
  const n = Number(matches[matches.length - 1]);
  return Number.isFinite(n) ? n : null;
}

/**
 * ≈ as =, and a hyphen between letters as the space it stands for ("nitrogen-fixing"). A "÷" is left as written:
 * the line comparison reads it as "/" (`normaliseEquation`), but "13.2 ÷ 30" is a sum still to be done, not the
 * value 0.44 that "27/55" is, so the value reading must still see it.
 */
function tidy(line: string): string {
  return line
    .replace(/≈/g, "=")
    // A hyphen between letters joins a compound word ("nitrogen-fixing"), so it must not read as a minus.
    .replace(/(?<=[A-Za-z])-(?=[A-Za-z])/g, " ")
    // "at right angles to" says "perpendicular to" (fm2-c-1.md D4: "perpendicular to the slope" was refused against a
    // correction written "at right angles to the slope").
    .replace(/\bat right angles to\b/gi, "perpendicular to")
    .replace(/\bat (?:90 ?°|90 degrees|90|a right angle) to\b/gi, "perpendicular to")
    .trim();
}

// The trailing unit, as the line reading has always dropped it, and in the fix box with the electrical and energy units
// too ("10 kWh", "600 C", "0.9 A"; gate 2, G2-45). The working ladder and the line steps keep "24 Ω" and "30 mA": a scheme
// line "R = 24 Ω" is short, so the unit would come off it and not off her longer line (gate 2's corpus guard: 16 ladder
// points lost, p2 calculating-resistance .0007 P3 among them).
const TRAILING_UNIT = /(?<=[\d)])\s*(?:(?:square |sq\.? )?units?(?:²|\^\{?2\}?)?|cm|mm|m|km|kg|g|s|[Mm]inutes|min|[Ss]econds|sec|[Hh]ours|h|°|[Dd]egrees|N|kN|J|kJ|W|kW|Pa|kPa|Hz|m\/s|ms⁻¹|ms\^?-1|m s⁻¹|m\/s²|m\/s\^?\{?2\}?|ms⁻²|ms\^?\{?-2\}?|m s⁻²|m s\^?\{?-2\}?)(?=[})\]]*\s*$)/;
const TRAILING_UNIT_FIX = /(?<=[\d)])\s*(?:(?:square |sq\.? )?units?(?:²|\^\{?2\}?)?|cm|mm|m|km|kg|g|s|[Mm]inutes|min|[Ss]econds|sec|[Hh]ours|h|°|[Dd]egrees|N|kN|J|kJ|W|kW|kWh|Wh|Pa|kPa|Hz|C|mA|A|V|Ω|m\/s|ms⁻¹|ms\^?-1|m s⁻¹|m\/s²|m\/s\^?\{?2\}?|ms⁻²|ms\^?\{?-2\}?|m s⁻²|m s\^?\{?-2\}?)(?=[})\]]*\s*$)/;
/**
 * A trailing unit comes off (mechanics units included, in ASCII and superscript spellings). Case matters: "5 j"
 * is a unit vector, not joules, and "8 i" is not a unit at all (the case-blind version read "y = 5 j" as y = 5).
 */
function dropUnit(line: string): string {
  // A unit before the closing brackets of a group ("\dfrac{…}{\sin 57°}", "/(sin 57°)") comes off too, so the typed
  // line and the authored one lose the same thing.
  // An area in "units²" / "square units" (a grid with no scale) is a unit too (engine brief item 19).
  return line.replace(fixBox > 0 ? TRAILING_UNIT_FIX : TRAILING_UNIT, "").trim();
}

/** A unit written after a number, spaced ("18 m"), or a unit of two or more letters glued ("18cm"). */
const ARITHMETIC_UNIT = String.raw`(?:\s+(?:m\/s²|m\/s|cm|mm|km|kg|g|s|min|h|N|kN|J|kJ|W|kW|kWh|V|A|mA|Ω|C|Hz|Pa|m)|(?:m\/s²|m\/s|cm|mm|km|kg|min|kN|kJ|kW|kWh|mA|Hz|Pa|Ω))`;

/**
 * Units inside arithmetic come off when every number of a side carries one ("Gradient = 18 m ÷ 6 s = 3 m/s" is
 * "18 ÷ 6 = 3"; gate 2, G2-27, 11 Oct 2026: refused where "18 ÷ 6 = 3" was the fix). A side with a number but no unit,
 * or a letter after a number with no space ("5m + 3m", algebra), is left as it is.
 */
function dropArithmeticUnits(line: string): string {
  const unit = new RegExp(`(\\d)${ARITHMETIC_UNIT}(?=\\s*(?:[×x*÷/+\\-−]|$))`, "g");
  return line
    .split(/(=)/)
    .map((side) => {
      if (side === "=") return side;
      const numbers = side.match(/\d+(?:\.\d+)?/g) ?? [];
      if (numbers.length < 2 || !/[×x*÷/+\-−]/.test(side.replace(/^\s*-/, ""))) return side;
      const stripped = side.replace(unit, "$1");
      const unitsGone = (side.match(unit) ?? []).length;
      return unitsGone === numbers.length ? stripped : side;
    })
    .join("");
}

function prepare(line: string): string {
  return dropUnit(dropArithmeticUnits(tidy(line)));
}

/**
 * A chemical formula written as a word of a label or a line ("O2", "H2O", "CO2", "C2H5OH"): element symbols with at
 * least one count. A capital letter and a number are a formula's symbol and count; a number before a letter ("3R",
 * "2x") is a coefficient, which is algebra.
 */
const FORMULA_WORD = String.raw`(?:[A-Z][a-z]?\d*)*[A-Z][a-z]?\d+(?:[A-Z][a-z]?\d*)*`;
/** A label's words: letters, or a formula (C2 D F01, 24 Sep 2026: "O2 molecules needed" was not a label). */
// A symbol's subscript is part of its name: "R_D" is not "R_C" (the FM2 review, 27 Sep 2026: the wrong reaction set to
// zero was confirmed, as "R" alone named nothing).
// A label may carry a power ("B² = …", "B^2 = …", "A^-1 = …"; the FM1 author, 7 Oct 2026: a bare matrix was refused against
// "B² = (11 2 ; 4 3)" where "X = (3 5 ; -5 -8)" took one).
const LABEL_RE = new RegExp(String.raw`^((?:${FORMULA_WORD}|[A-Za-z]+(?:_\{?[A-Za-z0-9]+\}?)?(?:[²³]|\^\{?-?\d+\}?)?)(?: +(?:${FORMULA_WORD}|[A-Za-z]+))* *(?:\([^()]*\))?)\s*=\s*`);

/**
 * The label a line is written under, and what it says: "Median = 30 + …" → "Median" and "30 + …";
 * "P(A given B) = 21/40" → "P(A given B)" and "21/40". A continuation line ("= 36.2") has no label and
 * its equals sign is not part of what it states, so "36.2" and "= 36.2" say the same thing.
 */
function splitLabel(line: string): { label: string | null; body: string; continuation: boolean } {
  const m = LABEL_RE.exec(line);
  if (m) return { label: m[1]!.trim(), body: line.slice(m[0].length), continuation: false };
  const lead = /^[=≈]\s*/.exec(line);
  if (lead) return { label: null, body: line.slice(lead[0].length), continuation: true };
  return { label: null, body: line, continuation: false };
}

/**
 * Two labels name the same quantity unless two clauses of prose plainly say different things ("the area is least
 * when x" / "the area is greatest when x"). Abbreviations ("W" for "weight") and a prose lead-in ending in the
 * symbol still agree, and so do two probabilities: "P(all three blue)" is "P(all three blue and at least two
 * blue)" when one event holds the other, which a label cannot show.
 */
/** The words a quantity's usual symbol names, by the symbol as written (its case matters: T is a tension, t a time). */
const QUANTITY_SYMBOLS: Record<string, readonly string[]> = {
  F: ["force", "friction"],
  R: ["force", "reaction", "resistance"],
  T: ["force", "tension"],
  W: ["force", "weight"],
  N: ["force", "reaction"],
  a: ["acceleration"],
  v: ["velocity", "speed"],
  u: ["velocity", "speed"],
  s: ["displacement", "distance"],
  t: ["time"],
  m: ["mass"],
  g: ["gravity"],
  E: ["energy"],
  P: ["power", "pressure"],
  I: ["current"],
  V: ["voltage", "potential difference", "volume"],
  Q: ["charge"],
  f: ["frequency"],
};

function labelsAgree(a: string | null, b: string | null): boolean {
  if (!a || !b) return true;
  // A lead-in before a colon ("Resolving horizontally: F") left a wide gap; the label is what follows it.
  const own = (s: string) => {
    const parts = s.split(/\s{2,}/);
    return (parts[parts.length - 1] ?? s).toLowerCase().replace(/\s+/g, " ").trim();
  };
  const x = own(a);
  const y = own(b);
  if (x === y) return true;
  if (/^p\(/.test(x) && /^p\(/.test(y)) return true;
  // Two symbols name two quantities: "m = −2" is not "c = −2". A symbol against a word or phrase agrees when it is
  // the word's letter or the phrase's initials ("W" for "weight", "LQ" for "lower quartile").
  const symbol = (s: string) => /^[a-zα-ω](?:_?[a-z0-9]{0,2})?$|^[a-z]{2}$/.test(s) && !s.includes(" ");
  if (symbol(x) && symbol(y)) return false;
  const initials = (s: string) => s.split(" ").map((w) => w[0] ?? "").join("");
  if (symbol(x) !== symbol(y)) {
    // "eliminating and reaching y" names y; "Therefore c" names c.
    const [sym, phrase] = symbol(x) ? [x, y] : [y, x];
    if (phrase.startsWith(sym) || phrase.endsWith(` ${sym}`) || initials(phrase).startsWith(sym.replace(/_/g, ""))) return true;
    // A quantity's usual symbol names it ("R" for a force, "a" for an acceleration; FM2 D, 25 Sep 2026: "R = 35√2 =
    // 49.5" was refused against "Force = … = 49.50 N"). The letter's case matters: T is a tension, t a time.
    // A subscript names which one ("R_T", the total resistance); the symbol is the letter before it (the P2 author,
    // 7 Oct 2026: "R = 8 Ω" was refused against "Total resistance = … = 8 Ω").
    const rawSym = (symbol(x) ? a : b).trim().split(/\s{2,}/).pop()!.trim().replace(/_.*$/, "");
    return (QUANTITY_SYMBOLS[rawSym] ?? []).some((word) => new RegExp(`\\b${word}`).test(phrase));
  }
  const words = (s: string) => s.split(" ").filter(Boolean).length;
  return !(words(x) >= 3 && words(y) >= 3);
}

export type FixMatch = { match: true; how: "line" | "value" } | { match: false; how: "none" };

const NONE: FixMatch = { match: false, how: "none" };
const LINE: FixMatch = { match: true, how: "line" };
/** Above 0 while markFix reads: the readings only the fix box uses (see TRAILING_UNIT_FIX and asTyped). */
let fixBox = 0;

/** A line with `$…$` maths in it, as plain text (the maths kept as TeX): what she might type, before tidying. */
function plainText(line: string): string {
  return /\$/.test(line) ? mdToPlain(line) : line;
}

/** A line with `$…$` maths or TeX in it, as the plain line she would type. */
function plainLine(line: string): string {
  return /[$\\]/.test(line) ? asTyped(plainText(line)) : line;
}

/**
 * Both sides of every comparison go through this one reading, so a line she types and the same line
 * authored in `$…$` TeX compare alike (the fix box used to tidy only the authored side, and refused 14 published
 * correction lines typed exactly as printed: a colon, a full stop or a `\dfrac` on one side only).
 */
function canon(line: string): string {
  return prepare(asTyped(plainLine(line)));
}

/** The same reading with the unit kept: a line typed "as written", where a unit may be the very thing corrected. */
function asWritten(line: string): string {
  return tidy(asTyped(plainLine(line)));
}

const LINE_OPTS = { lowercase: true, implicitMultiply: true, allowSwap: true } as const;

function sameWritten(a: string, b: string): boolean {
  return a.length > 0 && b.length > 0 && equationsMatch(a, b, LINE_OPTS);
}

/**
 * How two lines agree: "whole", as written; "body", once the label is dropped from one side (never across two
 * labels that disagree); "value", when what is left on both sides is only a number — "x = 6" against "The area
 * is greatest when x = 6" — which is a value match in a line's clothing, so the value route's gate applies to it.
 */
function compareLines(a: string, b: string): "whole" | "body" | "value" | null {
  if (a.length === 0 || b.length === 0) return null;
  if (equationsMatch(a, b, LINE_OPTS) || sameMathsLine(a, b) || sameMatrixLine(a, b)) return "whole";
  const x = splitLabel(a);
  const y = splitLabel(b);
  if (!labelsAgree(x.label, y.label) || x.body.trim().length === 0) return null;
  if (!equationsMatch(x.body, y.body, LINE_OPTS) && !sameMathsLine(x.body, y.body)) return null;
  if (bareValue(x.body) === null) return "body";
  // "150" against a continuation line "= 150 s" has always been a value match (the value route, with its gates,
  // decides it); only a dropped label makes a bare value a line match, as it did before.
  return x.continuation || y.continuation ? null : "value";
}

/**
 * The numbers, letters and function names an expression is made of, each with the sign written in front of it,
 * sorted: what it is, whatever its brackets. The sign matters: "25x − 10 − (3x + 12)" and "25x − 10 − 3x − 12"
 * have the same numbers, but taking the bracket away is the step.
 */
function atomsOf(side: string): string {
  const flat = normaliseEquation(side, { lowercase: true, implicitMultiply: true });
  const atoms: string[] = [];
  for (const m of flat.matchAll(/sin|cos|tan|log|ln|sqrt|√|π|\d+(?:\.\d+)?|\p{L}/gu)) {
    atoms.push(`${flat[(m.index ?? 0) - 1] === "-" ? "-" : "+"}${m[0]}`);
  }
  return atoms.sort().join(" ");
}

/**
 * Two lines that end on the same matrix, entry by entry, whatever the spelling of each entry ("(0.2 0.4 ; 0.8 0.6)"
 * is "(1/5 2/5 ; 4/5 3/5)", and "−1/5 (−1 −2 ; −4 −3)" is both), under the same name (engine brief item 18). Only
 * the bracketed "(a b ; c d)" form the fix box and the notes use is read as a matrix.
 */
function sameMatrixLine(a: string, b: string): boolean {
  const sa = a.split("=");
  const sb = b.split("=");
  if (sa.length !== sb.length) return false;
  const norm = (s: string) => normaliseEquation(s, { lowercase: true, implicitMultiply: true });
  if (!sa.slice(0, -1).every((s, i) => norm(s) === norm(sb[i]!))) return false;
  const read = (s: string) => {
    const rows = s.replace(/⁏/g, ";").trim();
    return /\([^()]*;[^()]*\)$/.test(rows) ? parseMatrix(rows) : null;
  };
  const x = read(sa[sa.length - 1]!);
  const y = read(sb[sb.length - 1]!);
  if (!x || !y || x.length !== y.length || x.length === 0) return false;
  const value = (e: string) => evaluateArithmetic(e) ?? valueOf(e.replace(/−/g, "-"));
  return x.every(
    (row, r) =>
      row.length === (y[r] ?? []).length &&
      row.every((e, c) => {
        const p = value(e);
        const q = value(y[r]![c]!);
        return p !== null && q !== null ? Math.abs(p - q) <= 1e-9 : e === y[r]![c];
      }),
  );
}

/**
 * Two capital letters multiplied ("A^-1 B", "BA", "A × B"): matrices, whose order matters, where the algebra engine
 * would treat them as numbers that commute (engine brief item 16, from the FM1 fix pass). Capitalised words
 * ("Area", "Median") are prose and are set aside first.
 */
export function hasMatrixProduct(line: string): boolean {
  return /[A-Z](?:\^-1)?\s*[×*]?\s*[A-Z]/.test(line.replace(/\b[A-Z][a-z]+\b/g, " "));
}

/**
 * A side of a line with no prose in it: letters only as symbols, function names or TeX commands. A function name
 * may be typed glued to its numbers ("24sin50"), so it is taken out without asking for a word boundary.
 */
function isMaths(side: string): boolean {
  const bare = side.replace(/\\[A-Za-z]+/g, "").replace(/arcsin|arccos|arctan|sin|cos|tan|log|ln|sqrt|pi/gi, "");
  return /[\d\p{L}]/u.test(side) && !/[A-Za-z]{3,}/.test(bare);
}

/**
 * Two maths lines that differ only in notation: side for side, either the same after normalising, or the same
 * numbers and letters in an equivalent expression (the algebra engine decides). So "2x(x+5)/(4(x+5)(x-5))" is the
 * authored "\frac{2x(x+5)}{4(x+5)(x-5)}" and "2x^2/3 × x/6" is "\dfrac{2x^2}{3} \times \dfrac{x}{6}", whatever
 * brackets the slash form needs or drops (engine brief item 9; audit must-fix 6); but "x^2 + 5x + 6" is not
 * "(x + 2)(x + 3)": the same value in another form is another line, because the form is what the step is for.
 */
function sameMathsLine(a: string, b: string): boolean {
  // Matrices do not commute: "X = B A^-1" is not "X = A^-1 B", so a product of matrices is compared as written.
  if (hasMatrixProduct(a) || hasMatrixProduct(b)) return false;
  const sa = a.split("=");
  const sb = b.split("=");
  if (sa.length !== sb.length) return false;
  let reasoned = false;
  for (let i = 0; i < sa.length; i += 1) {
    const x = sa[i]!.trim();
    const y = sb[i]!.trim();
    if (x.length === 0 || y.length === 0) {
      if (x.length !== y.length) return false;
      continue;
    }
    if (normaliseEquation(x, { lowercase: true, implicitMultiply: true }) === normaliseEquation(y, { lowercase: true, implicitMultiply: true })) continue;
    if (!isMaths(x) || !isMaths(y) || atomsOf(x) !== atomsOf(y)) return false;
    try {
      if (!checkAlgebraic(asExpression(x), { answer: asExpression(y), mode: "equivalent" }).correct) return false;
    } catch {
      return false;
    }
    reasoned = true;
  }
  return reasoned;
}

/**
 * A bare number, a signed number or a fraction of two whole numbers: what a line states when it states a value.
 * "0.0968/0.9554" and "13.2/30" are divisions still to be done, not values as "27/55" is.
 */
const BARE_VALUE = /^[-−+]?(?:\d+(?:\.\d+)?|\d+\s*\/\s*\d+)$/;

function valueOf(bare: string): number | null {
  const m = /^([-−+]?\d+(?:\.\d+)?)(?:\s*\/\s*(\d+(?:\.\d+)?))?$/.exec(bare.trim());
  if (!m) return null;
  const n = Number(m[1]!.replace("−", "-"));
  if (m[2] === undefined) return Number.isFinite(n) ? n : null;
  const d = Number(m[2]);
  return d !== 0 && Number.isFinite(n) ? n / d : null;
}

/**
 * Units a value may be followed by. A one-letter unit needs a space before it ("20 m", not "20m") so a term
 * such as "4p" or "12x" is never read as a number and its unit.
 */
const UNIT_WORD =
  "(?:mm|cm|km|kg|mg|tonnes?|ms|min|minutes?|hours?|hrs?|days?|years?|seconds?|sec|degrees?|kWh|Wh|kN|kJ|MJ|kW|MW|Pa|kPa|Hz|kHz|mA|ohms?|coulombs?|joules?|watts?|volts?|amps?|amperes?|newtons?|metres?|mol|dm|ml|mL|litres?|square|sq|units?|m|g|t|s|h|K|N|J|W|V|A|C|l|L)";
const UNIT_POWER = "(?:\\^?\\{?[-−]?\\d\\}?|[²³]|⁻[¹²³])?";
// A composite unit is one unit after a symbol too: "°C per minute", "°C/min" (the M8 author, 7 Oct 2026: a right fix
// ending in "°C per minute" was refused where "-5.5" was accepted).
const UNIT_TAIL = new RegExp(
  `(?:\\s*(?:°C|°|%|Ω)|\\s+${UNIT_WORD}${UNIT_POWER})(?:\\s*(?:/|per|\\s)\\s*${UNIT_WORD}${UNIT_POWER}){0,3}\\s*$`,
);
/** "(2 dp)", "(to 3 s.f.)", "exactly": an accuracy note after a value is not part of it. */
const ACCURACY_NOTE = /\s*(?:\((?:to\s+)?\d+\s*(?:d\.?\s?p\.?|s\.?\s?f\.?|decimal places?|significant figures?)\)|\bexactly)\s*$/i;

/** A value as written: the number and the text it was read from (whose decimal places say how it was rounded). */
interface Stated {
  value: number;
  text: string;
}

/**
 * A sum she has written out and not finished — "10^0.602", "0.10 / 0.16", "√(36 × 2)" — evaluated, for her side of
 * the comparison only: she may stop at the division that gives the value (item 17 of the engine brief). Numbers,
 * + − × ÷ / ^, brackets, √ and π; any letter and it is not arithmetic, and the answer is null.
 */
export function evaluateArithmetic(expr: string): number | null {
  const src = expr
    .replace(/[−–]/g, "-")
    .replace(/[×·]/g, "*")
    .replace(/÷/g, "/")
    .replace(/\\times|\\cdot/g, "*")
    .replace(/\\div/g, "/")
    .replace(/\\pi|π/g, "π")
    .replace(/[{]/g, "(")
    .replace(/[}]/g, ")")
    .replace(/\s+/g, "");
  if (src.length === 0 || /[A-Za-z]/.test(src) || !/[-+*/^√]/.test(src.replace(/^-/, ""))) return null;
  let at = 0;
  const peek = () => src[at];
  const number = (): number | null => {
    const m = /^\d+(?:\.\d+)?/.exec(src.slice(at));
    if (!m) return null;
    at += m[0].length;
    return Number(m[0]);
  };
  // expr := term (('+'|'-') term)* ; term := power (('*'|'/'|implicit) power)* ; power := unary ('^' power)?
  const unary = (): number | null => {
    if (peek() === "-") {
      at += 1;
      const v = unary();
      return v === null ? null : -v;
    }
    if (peek() === "+") {
      at += 1;
      return unary();
    }
    if (peek() === "√") {
      at += 1;
      const v = power();
      return v === null || v < 0 ? null : Math.sqrt(v);
    }
    return atom();
  };
  const atom = (): number | null => {
    if (peek() === "(") {
      at += 1;
      const v = sum();
      if (peek() !== ")") return null;
      at += 1;
      return v;
    }
    if (peek() === "π") {
      at += 1;
      return Math.PI;
    }
    return number();
  };
  const power = (): number | null => {
    const base = unary();
    if (base === null) return null;
    if (peek() === "^") {
      at += 1;
      const exp = power();
      return exp === null ? null : base ** exp;
    }
    return base;
  };
  const term = (): number | null => {
    let v = power();
    while (v !== null) {
      const c = peek();
      if (c === "*" || c === "/") {
        at += 1;
        const r = power();
        if (r === null) return null;
        v = c === "*" ? v * r : r === 0 ? null : v / r;
      } else if (c === "(" || c === "π" || c === "√") {
        const r = power();
        if (r === null) return null;
        v *= r;
      } else break;
    }
    return v;
  };
  const sum = (): number | null => {
    let v = term();
    while (v !== null && (peek() === "+" || peek() === "-")) {
      const c = peek();
      at += 1;
      const r = term();
      if (r === null) return null;
      v = c === "+" ? v + r : v - r;
    }
    return v;
  };
  const v = sum();
  return v !== null && at === src.length && Number.isFinite(v) ? v : null;
}

function stated(text: string | undefined): Stated | null {
  if (text === undefined) return null;
  const value = valueOf(text);
  return value === null ? null : { value, text: text.trim() };
}

/** Her own unfinished sum, worked out (see `evaluateArithmetic`); its text ends "/1" so that `near` reads it as exact. */
function worked(text: string): Stated | null {
  const bare = text.trim().replace(/[.,;:]+$/, "").replace(UNIT_TAIL, "").trim();
  const value = evaluateArithmetic(bare);
  return value === null ? null : { value, text: `${bare}/1` };
}

/** The value a stretch of text ends on once its unit, accuracy note and closing full stop are off, or null. */
function bareStated(text: string): Stated | null {
  const s = text
    .trim()
    .replace(/[.,;:]+$/, "")
    .replace(ACCURACY_NOTE, "")
    .replace(UNIT_TAIL, "")
    // "about -5.5" states -5.5 (the M8 author, 7 Oct 2026); a word before a value with no "=" ("banana 36.2") is prose,
    // not a label, so it is left to refuse.
    .replace(/^(?:about|approximately|approx\.?|roughly|around|≈|~)\s+/i, "")
    .replace(/^£\s*/, "")
    .trim();
  return BARE_VALUE.test(s) ? stated(s) : null;
}

function bareValue(text: string): number | null {
  return bareStated(text)?.value ?? null;
}

/**
 * "x = 7 or x = 4", "y = 9 and y = -23": one letter given two values, so the line states no single value. A
 * sequence of different results ("so 2k = 8 and k = 4") is not a set.
 */
const SOLUTION_SET = /(?<![\w.])([A-Za-z])\s*=[^=]*\b(?:or|and)\s+\1\s*=/;

/**
 * (A lone letter after the value is a term or a vector, "= 8 i", unless it is a unit letter, "= 24.6 m above": 25 Sep 2026.)
 * A value at the start of what follows an equals sign, when a few words and nothing more follow it ("= 17 directly",
 * "= −9/2, or as a decimal"): no operator, no glued term, and no further number, which would make the words a
 * clause of their own ("x = 20/3 it is 14, so …", "= 12.25. A scone is £1.40 …").
 */
const LEADING_VALUE = /^\s*([-−+]?\d+(?:\.\d+)?(?:\s*\/\s*\d+)?)(?=\s*[°%]?\s*[,;.]?\s*$|\s*[°%]?\s*[,;.]?\s+(?:(?:[A-Za-z£][A-Za-z'-]+|[mgsthKNJWVACLl](?![A-Za-z]))[,;.]?\s*){1,4}$)/;

/**
 * Is what comes before a line's first "=" an expression in an unknown — a letter joined to a number or an operator
 * ("2x − 8", "162/x²", "4x", "3R")? Then the line is an equation. A label is not ("Median", "the mean", "P(A)",
 * "f(3)", "dy/dx", "v²", "The area is least when x"), and neither is a calculation ("30 + (8 ÷ 26) × 20",
 * "sin inverse of 0.6"): words go first, then a letter's own brackets and a single letter's power.
 */
function isEquation(first: string): boolean {
  // Only what follows the last gap a colon or comma left is the maths ("j: −2 + 9" is the label j and the sum
  // −2 + 9; "Setting it to zero: 2x − 6" is prose and then 2x − 6).
  const parts = first.split(/\s{2,}/);
  // A formula in the name ("O2 molecules needed", C2 D F01) is a word of the name, not an unknown with a number.
  let s = (parts[parts.length - 1] ?? "").replace(new RegExp(String.raw`(?<![\w.])${FORMULA_WORD}(?![\w.])`, "g"), " ");
  for (let i = 0; i < 6 && /\\[dt]?frac\{/.test(s); i += 1) s = s.replace(/\\[dt]?frac\{([^{}]*)\}\{([^{}]*)\}/g, "($1)/($2)");
  s = s
    .replace(/\\(?:times|cdot)\b/g, "×")
    .replace(/\\div\b/g, "÷")
    .replace(/\\[A-Za-z]+/g, " ")
    .replace(/[{}]/g, "")
    .replace(/[A-Za-z]{2,}/g, " ")
    .replace(/(?<=[A-Za-z])\s*\([^()]*\)/g, "")
    .replace(/(?<![\w.])([A-Za-z])\s*(?:\^\d|[²³])(?![\w.])/g, "$1")
    .replace(/_[A-Za-z0-9]+/g, "")
    .replace(/[()]/g, " ");
  if (!/[A-Za-z]/.test(s)) return false;
  // A term is written joined ("2x", "3R"); a number and a letter with words between them ("2 and y") are not one.
  return /[A-Za-z]\d|\d[A-Za-z]|[A-Za-z]\s*[+\-−×*/÷^]|[+\-−×*/÷^]\s*[A-Za-z]/.test(s);
}

// The verbs before a value her line states in words; in the fix box also "be", "holds", "has", "have", "contains" and
// "carries" ("each daughter cell holds 46"; gate 2, G2-46). The pairing of a scheme point with its solution line and the
// line steps keep the first list (gate 2's corpus guard: m7 simultaneous .0011 A1 "y = 8" lost its solution line).
const COPULA_VALUE = /\b(?:is|are|was|equals|gives|giving|makes|becomes|comes to|to|totals?|totalling|sums? to|adds? up to)\s+(?:about\s+|approximately\s+)?([-−]?\d+(?:\.\d+)?(?:\s*\/\s*\d+)?)((?:\s*(?:°C|°|%)|(?:\s+[A-Za-z][A-Za-z'-]*[²³]?(?:\/[A-Za-z]{1,3}[²³]?)?){1,3})?)[.,;]*\s*$/i;
const COPULA_VALUE_FIX = /\b(?:is|are|was|be|equals|gives|giving|makes|becomes|holds|has|have|contains|carries|comes to|to|totals?|totalling|sums? to|adds? up to)\s+(?:about\s+|approximately\s+)?([-−]?\d+(?:\.\d+)?(?:\s*\/\s*\d+)?)((?:\s*(?:°C|°|%)|(?:\s+[A-Za-z][A-Za-z'-]*[²³]?(?:\/[A-Za-z]{1,3}[²³]?)?){1,3})?)[.,;]*\s*$/i;
/**
 * A value her line states in words at its end: "so the mean is 59", "corrected to 94.8", "which comes to 21.5 cm".
 * Only after one of these verbs, so a stray number ("banana 36.2") is still not a value.
 */
function copulaValue(s: string): Stated | null {
  // The value, then at most a unit or a short unit phrase ("48 press-ups", "58 loaves an hour", "22 cm").
  const m = (fixBox > 0 ? COPULA_VALUE_FIX : COPULA_VALUE).exec(s);
  if (!m) return null;
  return stated(m[1]);
}

/**
 * A value, then its reason or qualifier in words: "25 °C at most, to avoid growing pathogens", "25 °C, so pathogens
 * do not grow" (B2E-01, 24 Sep 2026: an authored correction written so stated no value, and the fix box refused even
 * the bare 25). The words may hold no number, no operator and no letter standing alone ("8 i" is a vector, "3 x" a
 * term), so "= 4x − 9", "= 7π + 14 cm" and "20 people under 18" are not values; and they may not open by denying it
 * ("25 is not right"). Group 2 is the unit, when there is one.
 */
const VALUE_UNIT = String.raw`(?:\s*(?:°C|°|%|Ω)|\s+${UNIT_WORD}(?:\^?\{?[-−]?\d\}?|[²³]|⁻[¹²³])?(?![A-Za-z]))`;
const VALUE_THEN_WORDS = new RegExp(
  String.raw`^\s*([-−+]?\d+(?:\.\d+)?(?:\s*\/\s*\d+)?)` +
    String.raw`(${VALUE_UNIT}?)` +
    String.raw`(?:\s*[,;]\s*|\s+)(?!(?:is\s+|are\s+)?(?:not|wrong|incorrect|never)\b)` +
    String.raw`(?![A-Za-z](?![A-Za-z']))[A-Za-z][A-Za-z']*(?:[ ,;-]+(?:a|[A-Za-z][A-Za-z']+))*[.!]?\s*$`,
);
/**
 * On her side the words after the value and its unit must open as a reason or a qualifier does: a comma, or "so",
 * "to", "because", "at", "as", "since", "which", "maximum", "minimum". "= 6 cm⁻¹ after." is the end of a sentence
 * about another quantity (the corpus guard's catch: a later step's line read as step 1's value).
 */
const TYPED_QUALIFIER = new RegExp(
  String.raw`^\s*[-−+]?\d+(?:\.\d+)?(?:\s*\/\s*\d+)?${VALUE_UNIT}(?:\s*[,;]|\s+(?:so|to|because|as|since|which|at|maximum|minimum|max|min)\b)`,
  "i",
);
/** A count against the formula it counts: "3O2", "3 O2 molecules" (C2 D F01). */
const VALUE_THEN_FORMULA = new RegExp(String.raw`^\s*(\d+)\s*${FORMULA_WORD}(?:\s+[A-Za-z]{2,}){0,2}[.!]?\s*$`);

/**
 * The value `VALUE_THEN_WORDS` or `VALUE_THEN_FORMULA` reads. On her side of the comparison the value must carry its
 * unit or its formula ("25 °C, to avoid growing pathogens", "3O2"): a bare number followed by a clause ("= 13,
 * because the atom has no overall charge", "= 0.6, and both angles are inside the range") is a check or a reason
 * about a value already on the page, and reading it as a result let other lines of the working pass as the fix.
 */
function valueThenWords(text: string, side: "typed" | "authored"): Stated | null {
  const words = VALUE_THEN_WORDS.exec(text);
  if (words && (side === "authored" || TYPED_QUALIFIER.test(text))) return stated(words[1]);
  const formula = VALUE_THEN_FORMULA.exec(text);
  return formula ? stated(formula[1]) : null;
}

/** A check written with squares ("37.08² + 19.72² = 42²") states its value squared: the value is the base. */
const SQUARED_VALUE = /^\s*([-−+]?\d+(?:\.\d+)?)\s*(?:²|\^\{?2\}?)\s*$/;

/**
 * The value a line states as its result, or null. With an equals sign it is the number after the last one:
 * "Median ≈ 30 + (8 ÷ 26) × 20 = 36.2 cm" → 36.2, "= 27/55" → 27/55. An authored reference must end there (its
 * value is the target), so "= (4x + 9) over (x + 3)(x + 4)", "= log 8x^3" and "= 7π + 14 cm" state no value — their
 * last number is a term, not a result; the compared line may carry on in words after its value ("leaves
 * x = 17 directly", "x = −9/2, or −4.5 as a decimal"), but not into an expression ("= 4x − 9"). Without an equals
 * sign a typed line must be the value itself ("36.2 cm", "27/55"), while an authored line may end on its value
 * in prose ("The median mass is about 53.75 g."), provided the number stands alone and does not finish an
 * expression. A line that gives one letter two values ("x = 7 or x = 4") states none.
 */
export function resultValue(line: string, side: "typed" | "authored"): number | null {
  return resultOf(line, side)?.value ?? null;
}

function resultOf(line: string, side: "typed" | "authored"): Stated | null {
  const s = line.trim();
  if (s.length === 0) return null;
  const eq = Math.max(s.lastIndexOf("="), s.lastIndexOf("≈"));
  if (eq >= 0) {
    if (SOLUTION_SET.test(s)) return null;
    // An equation states no value: "2x − 8 = 0", "162/x² = 2" and "4x = 20" end on a number, but it is not a result
    // of anything, and every equation set to zero shares its 0 (the ladder paid "2x − 6 = 0" for "2x − 8 = 0"). The
    // first side names what is being found and the side before the last "=" is what the value comes from; either
    // one in an unknown makes the line an equation ("3R = 80 × 2.5 = 200", "x = 4 from 2x − 8 = 0").
    const sides = s.split(/[=≈]/);
    // A new statement after a gap ("From y + z = 24, z = 9": "z" alone before the last "=") is its own result.
    const penult = sides[sides.length - 2]!;
    // "So", "therefore", "hence", "thus", "giving" and "⇒" join two statements as a comma does ("48 = 10a so a = 4.8";
    // FM2 D, 25 Sep 2026: only the comma was read as a break).
    const penultParts = penult.split(/\s{2,}|\s+(?:so|therefore|hence|thus|giving|gives|then)\s+|\s*(?:[⇒∴→]|->)\s*/i);
    const restarts = penultParts.length > 1 && /^[A-Za-z][A-Za-z ]*$/.test((penultParts[penultParts.length - 1] ?? "").trim());
    if (!restarts && (isEquation(sides[0]!) || isEquation(penult))) return null;
    const after = s.slice(eq + 1);
    const bare = bareStated(after) ?? valueThenWords(after, side);
    if (bare !== null || side === "authored") return bare;
    const squared = SQUARED_VALUE.exec(after);
    if (squared) return stated(squared[1]);
    const lead = LEADING_VALUE.exec(after);
    if (lead) return stated(lead[1]);
    return worked(after) ?? copulaValue(s);
  }
  const whole = bareStated(s);
  if (whole !== null) return whole;
  if (side === "typed") return worked(s) ?? copulaValue(s) ?? valueThenWords(s, side);
  // An authored sentence ending on its value: the last number must stand alone, after a word, not after an operator.
  const tail = /(?:^|\s)([-−]?\d+(?:\.\d+)?(?:\s*\/\s*\d+)?)((?:\s*(?:°C|°|%|Ω)|\s+[A-Za-z]{1,6}[²³]?(?:\/[A-Za-z]{1,3}[²³]?)?)?)[.,;:]*\s*$/.exec(s);
  if (!tail) return null;
  const before = s.slice(0, tail.index).trimEnd();
  if (/[+\-−×*/÷^(]$/.test(before)) return null;
  const unit = (tail[2] ?? "").trim();
  if (unit && !/^(?:°C|°|%|Ω)$/.test(unit) && !new RegExp(`^${UNIT_WORD}[²³]?(?:/${UNIT_WORD}[²³]?)?$`).test(unit)) return null;
  return stated(tail[1]);
}

/**
 * A value close enough to the target: 1 % or 0.05, whichever is looser; and below 1 (a probability, a gradient)
 * the value as she rounded it — at least 2 decimal places, within half a unit of its last place ("0.73" and
 * "0.725" for 0.725, never "0.7"; "0.0968" is not 0.1013, which a flat 0.005 allowed), or the fraction itself.
 * Without the text she typed (two values compared with each other) the flat 0.005 stands.
 */
function near(value: number, target: number, typedText?: string, targetText?: string): boolean {
  if (Math.abs(target) < 1 && (typedText !== undefined || targetText !== undefined)) {
    // The coarser of the two as written decides: "5/17" meets a printed "0.29" at 2 d.p.; a fraction is exact.
    const places = (text?: string) => (text === undefined || /\//.test(text) ? Infinity : ((/\.(\d+)$/.exec(text.replace(/^[-−+]/, "")) ?? [, ""])[1]!.length));
    const p = Math.min(places(typedText), places(targetText));
    if (p === Infinity || p < 2) return Math.abs(value - target) <= 1e-9;
    return Math.abs(value - target) <= 0.5 * 10 ** -p + 1e-12;
  }
  const tol = Math.abs(target) < 1 ? 0.005 : Math.max(0.05, Math.abs(target) * 0.01);
  return checkNumeric(String(value), { value: target, tolerance: { type: "absolute", value: tol } }).correct;
}

/**
 * What a line's value is the value of, when that is a single number: "120%" in "120% = £54", "10%" in
 * "10% = £54 ÷ 12". Two lines about different percentages share a £54 by chance, not by reasoning.
 */
function numericWhat(line: string): number | null {
  const first = line.split(/[=≈]/)[0] ?? "";
  const parts = first.split(/\s{2,}/);
  const m = /^[£$]?\s*([-−]?\d+(?:\.\d+)?)\s*(?:%|[A-Za-z]{1,3})?$/.exec((parts[parts.length - 1] ?? "").trim());
  return m && /=/.test(line) ? valueOf(m[1]!) : null;
}

/**
 * A line's clauses: "37 − x = 32, so x = 5" is two statements, and "x + 7 = 0 gives x = −7; x − 4 = 0 gives x = 4"
 * four, each read the fix box's way. She may write any one of them as her line.
 */
function clauses(line: string): string[] {
  const out: string[] = [];
  const push = (part: string) => {
    // A statement's opening connective ("So L = …", "Therefore c = 4") is not part of what it states.
    out.push(part.trim().replace(/^(?:so|then|therefore|hence|thus|and|giving)\s+/i, ""));
  };
  // Sentences first ("…= 30. A value at the mean …"; a decimal point or an ellipsis inside a number is not a
  // sentence end), then the words that join one statement to the next.
  for (const sentence of plainText(line).split(/(?<=[^\s.]\.|\.\.\.)\s+(?=[A-Z(\\])/)) {
    for (const part of sentence.split(/\s*;\s*|,?\s+(?:so|then|gives|giving|hence|therefore|which gives|that is)\s+/i)) {
      push(part);
      // A lead-in ("Taking logs: 2x log 5 = …", "Multiply every term by 6: 3(x + 4) + …") is not part of the
      // statement after it.
      const lead = /^[A-Za-z0-9(][A-Za-z0-9 ()×x*+\-−=.]{0,40}:\s+(.+)$/.exec(part.trim());
      if (lead) push(lead[1]!);
      // Two statements joined by "and" ("a/4 = 2 and a = 8", "∑x = 120 and ∑x² = 2970") are each a statement; the
      // roots of one letter ("x = 1 and x = 3") stay one set.
      const halves = part.split(/,?\s+and\s+/i);
      if (halves.length > 1 && halves.every((h) => /=/.test(h)) && !SOLUTION_SET.test(canon(part))) halves.forEach(push);
    }
  }
  return out.map((c) => canon(c)).filter((c) => c.length > 0);
}

/** A line of working as the separate statements it makes (its sentences, its "so …" clauses), each read as typed. */
export function statementsOf(line: string): string[] {
  return clauses(line);
}

/**
 * A stretch of maths as one comparable string: TeX and typed spellings alike, spaces gone, and the ways a list of
 * results is joined (",", ";", "and", "or") made one separator, so "$x=-2, x=4$" and "so $x = -2$ and $x = 4$" read
 * the same.
 */
export function mathsKey(s: string): string {
  const joined = mdToPlain(s).replace(/\s*(?:[,;]|\band\b|\bor\b)\s*/gi, " | ");
  // Word gaps are kept as "¦" (the equation normaliser drops whitespace, and reads "·" as a times sign) so a key
  // can be found with its edges intact.
  const spaced = workingLines(joined).join(" ").replace(/\s+/g, "¦");
  return normaliseEquation(spaced, { lowercase: true }).replace(/¦*([=<>≤≥≠+\-*/^()|,])¦*/g, "$1");
}

/** Does the line's key hold the maths whole — "x=3" in "so¦x=3¦gives", never inside "x=3.5", "2x=3" or "x=30"? */
export function holdsMaths(lineKey: string, maths: string): boolean {
  for (let at = lineKey.indexOf(maths); at >= 0; at = lineKey.indexOf(maths, at + 1)) {
    const before = at === 0 ? "" : lineKey[at - 1]!;
    const after = lineKey.slice(at + maths.length, at + maths.length + 2);
    // A term may carry its coefficient ("c^12" is seen in "27c^12"), but an equation may not ("x=3" is not "2x=3").
    const coefficient = /\d/.test(before) && /^\p{L}/u.test(maths) && !maths.includes("=");
    const edgeBefore = before === "" || coefficient || !/[\p{L}\p{N}.]/u.test(before) || !/^[\p{L}\p{N}]/u.test(maths);
    const edgeAfter = after === "" || (!/^[\p{L}\p{N}]/u.test(after) && !/^\.\d/.test(after)) || !/[\p{L}\p{N}]$/u.test(maths);
    if (edgeBefore && edgeAfter) return true;
  }
  return false;
}

/**
 * Does a chain of equal sides state the evidence? "√48 = √16√3 = 4√3" states "√48 = 4√3", and "c = 64 + 32 = 96"
 * states "c = 96": the evidence's sides appear among the chain's, in order, each the same maths (brackets and the
 * \frac-or-slash spelling aside). The first side anchors it, so "y = 2x − 3 = 3" does not state "x = 3".
 */
export function chainStates(statement: string, evidence: string): boolean {
  // "x = −7 or x = 4" is a list of roots, not a chain whose sides are x, −7 or x, and 4 ("x = 2 and y = 5" is two
  // different letters, and may be read as one).
  const list = (s: string) => /\bor\b/i.test(s) || SOLUTION_SET.test(s);
  if (list(canon(statement)) || list(canon(evidence))) return false;
  const s = canon(statement)
    .split("=")
    .map((x) => x.trim())
    .filter(Boolean);
  const e = canon(evidence)
    .split("=")
    .map((x) => x.trim())
    .filter(Boolean);
  if (e.length < 2 || s.length <= e.length) return false;
  const same = (a: string, b: string) => equationsMatch(a, b, LINE_OPTS) || sameMathsLine(a, b);
  let at = 0;
  for (const side of e) {
    while (at < s.length && !same(s[at]!, side)) at += 1;
    if (at >= s.length) return false;
    at += 1;
  }
  return true;
}

/**
 * Every value a line's clauses state as the result of an equals sign ("x = 7 or x = 4" states 7 and 4). A number
 * inside prose is not a stated result: "50 sin 40" does not state 40, nor "20 people under 18" 18.
 */
function statedValues(line: string): number[] {
  return statedResults(line).map((r) => r.value);
}

/** The same, each with the text it was read from and the label of the clause that states it. */
function statedResults(line: string): Array<Stated & { label: string | null; what: number | null }> {
  const out: Array<Stated & { label: string | null; what: number | null }> = [];
  for (const c of clauses(line)) {
    const pieces = SOLUTION_SET.test(c) ? c.split(/\s+(?:or|and)\s+/i) : [c];
    for (const p of pieces) {
      const r = /[=≈]/.test(p) ? resultOf(p, "authored") : null;
      if (r !== null) out.push({ ...r, label: splitLabel(p).label, what: numericWhat(p) });
    }
  }
  return out;
}

/**
 * The label of a line as she reads it: what comes before its first ":" or "=", when that is a few words starting
 * with a letter ("j", "P(wet given late)", "downward arrow", "horizontal component"), lower-cased; else null.
 */
function lineLabel(line: string): string | null {
  const text = asTypedTeX(plainText(line)).trim();
  const m = /^([A-Za-z][^:=]*?)\s*[:=]/.exec(text);
  if (!m) return null;
  const label = m[1]!.replace(/\s+/g, " ").trim().toLowerCase();
  // A label is words (a probability's event in brackets included), never an expression: "x + 3" in "x + 3 = 36"
  // is the left-hand side of an equation.
  const outside = label.replace(/\([^()]*\)/g, "()");
  if (/[+\-−×*/÷^=<>]/.test(outside)) return null;
  // "P(all three blue and at least two blue)" is one label however many words its event takes.
  return outside.split(" ").length <= 6 ? label : null;
}

/**
 * A `$…$` piece of an authored line worth comparing on its own: a statement or an expression, never a value, bare
 * or labelled ("$z = 1.45$" in a sketch step is a value the step mentions, which the value rules judge).
 */
function mathsPieces(line: string): string[] {
  return [...line.matchAll(/\$([^$]+)\$/g)]
    .map((m) => canon(m[1]!))
    .filter((p) => p.replace(/\s+/g, "").length >= 5 && /[=+\-*/^×]/.test(p) && bareValue(splitLabel(p).body) === null);
}

/** Function names that are maths even though they are letters; anything else wordy is prose. */
const FUNCTION_WORDS = /\b(?:arcsin|arccos|arctan|sin|cos|tan|log|ln|sqrt|pi)\b/gi;

/**
 * Two equations that say the same thing once rearranged ("18 − x + x + 15 − x + 4 = 32" and "(18 − x) + x +
 * (15 − x) + 4 = 32", "37 − x = 32"): both must be maths with a letter to solve for and no prose, and the algebra
 * engine must find them equivalent.
 */
function sameEquation(a: string, b: string): boolean {
  if (!/=/.test(a) || !/=/.test(b) || hasMatrixProduct(a) || hasMatrixProduct(b)) return false;
  const bareA = a.replace(FUNCTION_WORDS, " ");
  const bareB = b.replace(FUNCTION_WORDS, " ");
  if (/[A-Za-z]{2,}/.test(bareA) || /[A-Za-z]{2,}/.test(bareB) || !/[A-Za-z]/.test(bareA)) return false;
  try {
    return checkAlgebraic(a, { answer: b, mode: "equivalent" }).correct;
  } catch {
    return false;
  }
}

const DIRECTION_WORD = /\b(vertical(?:ly)?|horizontal(?:ly)?|up(?:wards?)?|down(?:wards?)?|left(?:wards?)?|right(?:wards?)?|forwards?|backwards?|anticlockwise|clockwise|north|south|east|west|along|perpendicular|parallel)\b/gi;

function directionWords(text: string): string {
  const words = text
    .toLowerCase()
    .replace(/\bat right angles\b/g, "perpendicular")
    .match(DIRECTION_WORD);
  return [...new Set((words ?? []).map((w) => w.replace(/ly$/, "").replace(/wards?$/, "").replace(/s$/, "")))].sort().join(" ");
}

function numbersIn(text: string): string {
  return (text.match(/\d+(?:\.\d+)?/g) ?? []).map(Number).sort((x, y) => x - y).join(" ");
}

/**
 * A correction written in prose with a value in it ("the weight, 70 N, vertically downwards") is matched by a line
 * with the same values and the same direction words ("W = 70 N, vertically down"), since the direction is what such
 * a correction puts right. A bare "70 N" has no direction, so it is not that line.
 */
function sameProseValue(typed: string, reference: string): boolean {
  const ref = asTyped(plainText(reference));
  if (/=/.test(ref)) return false;
  const numbers = numbersIn(ref);
  const directions = directionWords(ref);
  if (!numbers || !directions) return false;
  const t = asTyped(plainText(typed));
  return numbersIn(t) === numbers && directionWords(t) === directions;
}

export interface FixOptions {
  /** The student's working, when the reference is a find-the-mistake correction. */
  working?: readonly string[];
  /** The flagged line of that working, 1-based. */
  mistakeLine?: number;
  /**
   * Also compare the clauses of each authored line ("37 − x = 32, so x = 5"), its `$…$` pieces written on their
   * own, and the result an identity chain arrives at. Right for her line in the fix box or a worked-example step,
   * where any statement of the step is hers to write; wrong for the working ladder and the re-teach pairing, where
   * one piece of a long line must not stand for the mark point the whole line evidences.
   */
  pieces?: boolean;
  /** Lines stated before this one (a worked example's earlier steps): their pieces are not this line's. */
  exclude?: readonly string[];
  /** Her line as she typed it, before tidying took its commas: the statements a value match checks (valueLineSound). */
  rawTyped?: string;
}

/**
 * Two lines that give one letter the same values in any order ("x = 5 or x = 1" and "$x = 1$ and $x = 5$",
 * "x = 1, x = 5"), by the algebra engine's solution-set reading. Both must be such a set: one root of two is
 * half the line (the old comparer took any line ending on the last root, "x = 5" or "y = 5" alike).
 */
function sameSolutionSet(a: string, b: string): boolean {
  // A comma between the roots was already read as a space ("x = 1  x = 5"), so a letter given two values is a set
  // however it is joined.
  const set = /(?<![\w.])([A-Za-z])\s*=[^=]*?(?:\b(?:and|or)\s+|\s)\1\s*=/;
  if (!set.test(a) || !set.test(b)) return false;
  const listed = (s: string) => s.replace(/\s+(?:and|or)\s+/gi, ", ").replace(/(\S)\s{2,}(?=[A-Za-z]\s*=)/g, "$1, ");
  try {
    return checkAlgebraic(listed(a), { answer: listed(b), mode: "equivalent" }).correct;
  } catch {
    return false;
  }
}

/**
 * A side of a chain as an expression the algebra engine reads: ratios as quotients, roots as sqrt, and a degree
 * sign dropped (both sides are read the same way, so "24 sin 50" and "24 sin 50°" are one expression).
 */
function asExpression(side: string): string {
  const ratio = side.replace(/°/g, "").split("∶");
  const roots = (s: string) => s.replace(/√\{([^{}]*)\}/g, "sqrt($1)").replace(/√(\d+(?:\.\d+)?)/g, "sqrt($1)");
  return ratio.length === 2 ? `(${roots(ratio[0]!)})/(${roots(ratio[1]!)})` : roots(ratio[0]!);
}

/**
 * Is `typed` the result a chain of equal expressions arrives at? The last side of "\frac{2x(x+5)}{4(x+5)(x-5)} =
 * \frac{x}{2(x-5)}" is the step's answer, so "x/(2(x-5))" is that line (audit must-fix 6), and "9 : 25" is the
 * line "45 : 125 = 9 : 25" arrives at. Only an identity counts — the first and last sides the same expression —
 * never an equation such as "50 − T = 5a", whose right-hand side alone says nothing; and a value is left to the
 * value rules.
 */
function endsTheChain(typedBody: string, reference: string): boolean {
  const sides = splitLabel(reference)
    .body.split("=")
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
  if (sides.length < 2) return false;
  const first = sides[0]!;
  const last = sides[sides.length - 1]!;
  // A TeX command ("\frac", "\sqrt") is maths, not a word of prose.
  const words = last.replace(/\\[A-Za-z]+/g, "").replace(FUNCTION_WORDS, "");
  if (last.replace(/\s+/g, "").length < 2 || bareValue(last) !== null || /[A-Za-z]{3,}/.test(words)) return false;
  if (!equationsMatch(typedBody, last, LINE_OPTS) && !sameResultForm(typedBody, last)) return false;
  try {
    return checkAlgebraic(asExpression(first), { answer: asExpression(last), mode: "equivalent" }).correct;
  } catch {
    return false;
  }
}

/** Is there a + or − outside every bracket (a sum, not a product)? A sign at the very start is the term's own. */
function topLevelSum(s: string): boolean {
  let depth = 0;
  for (let i = 0; i < s.length; i += 1) {
    const c = s[i]!;
    if (c === "(" || c === "[" || c === "{") depth += 1;
    else if (c === ")" || c === "]" || c === "}") depth -= 1;
    else if (depth === 0 && i > 0 && /[+\-−]/.test(c) && !/[\^eE(]/.test(s[i - 1] ?? "")) return true;
  }
  return false;
}

/**
 * The result of a step in an equal spelling that keeps the result's form (trial audit MK-08, 24 Sep 2026: "4(x−5)(x+5)"
 * for "4(x+5)(x−5)" and "x/(2x−10)" for "x/(2(x−5))" were "Not the same line yet"): a fraction in its simplest form for
 * a fraction, a product fully factorised for a product, otherwise the same numbers and letters in an equivalent
 * expression. "x² + 5x + 6" is still not "(x + 2)(x + 3)": the form is what the step is for.
 */
function sameResultForm(typed: string, result: string): boolean {
  if (/=/.test(typed) || /=/.test(result)) return false;
  // Both sides as typed maths: a TeX fraction ("\frac{x}{2(x-5)}") is read as the slash form it stands for.
  const a = asExpression(normaliseEquation(typed.trim()));
  const b = asExpression(normaliseEquation(result.trim()));
  if (!isMaths(a) || !isMaths(b) || !/[A-Za-z]/.test(b) || hasMatrixProduct(a) || hasMatrixProduct(b)) return false;
  try {
    // Only a result that is itself in that form: a fraction not yet cancelled ("-(5+w)(w-5)/((w-5)(w+2))") is the step's
    // point, and the cancelled fraction a later step reaches is not it (the corpus guard's catch, 25 Sep 2026).
    const form = (x: string, f: "simplest-fraction" | "factorised") => checkAlgebraic(x, { answer: b, mode: "form", form: f }).correct;
    if (/\//.test(b)) return form(b, "simplest-fraction") && form(a, "simplest-fraction");
    if (/\(/.test(b) && !topLevelSum(b)) return form(b, "factorised") && form(a, "factorised");
    return atomsOf(a) === atomsOf(b) && checkAlgebraic(a, { answer: b, mode: "equivalent" }).correct;
  } catch {
    return false;
  }
}

/**
 * Her line as a chain of equal expressions that arrives at a correction's result: "3x²/x = 3x" and "Answer 3x²/x = 3x"
 * for "Answer: 3x" (trial audit MK-07: only the bare "3x" passed). Every side must equal the next, and the last side
 * must be the result, as written or in an equal spelling of its form.
 */
function chainArrives(typed: string, reference: string): boolean {
  const sides = splitLabel(typed)
    .body.split("=")
    .map((x, i) => (i === 0 ? x.replace(/^(?:[A-Za-z]{2,}:?\s+)+/, "") : x).trim())
    .filter((x) => x.length > 0);
  if (sides.length < 2) return false;
  const ref = splitLabel(reference).body.replace(/^[A-Za-z][A-Za-z ]*:\s*/, "").trim();
  if (ref.length === 0 || /=/.test(ref) || bareValue(ref) !== null || !/[A-Za-z]/.test(ref) || !isMaths(ref)) return false;
  const last = sides[sides.length - 1]!;
  if (!equationsMatch(last, ref, LINE_OPTS) && !sameResultForm(last, ref)) return false;
  try {
    for (let i = 0; i + 1 < sides.length; i += 1) {
      if (!checkAlgebraic(asExpression(sides[i]!), { answer: asExpression(sides[i + 1]!), mode: "equivalent" }).correct) return false;
    }
    return true;
  } catch {
    return false;
  }
}

/**
 * What the find-the-mistake item already says before she types: the values her working reached up to and
 * including the flagged line (and in any later line the correction restates as sound), and which correction lines
 * restate a line of her working word for word. A value in that set proves nothing, and a restating line is not
 * the fix. A correction line that keeps the flagged line's value and changes what it means ("intercept = log k,
 * so log k = 0.602", "Area factor = 2.25.", "k = 24/36 = 2/3 exactly") is the fix, so a shared value alone never
 * makes a line a restatement.
 */
function fixContext(correction: readonly string[], working: readonly string[], mistakeLine: number) {
  const soundLater = working.filter((w, i) => i >= mistakeLine && correction.some((c) => sameWritten(asWritten(c), asWritten(w))));
  const reachedValues = [...working.slice(0, Math.max(0, mistakeLine)), ...soundLater].flatMap(statedValues);
  const reached = (v: number) => reachedValues.some((r) => near(v, r) && near(r, v));
  const restates = (c: string) => working.some((w) => sameWritten(asWritten(c), asWritten(w)));
  const flagged = working[mistakeLine - 1] ?? "";
  const flaggedLabel = lineLabel(flagged);
  /**
   * A line under another label than the flagged one, stating a value her working already reached, is a sound
   * line of the working restated, not this line's fix: "P(wet and late) = 0.10" for the flagged "P(wet given
   * late) = 0.10" (the correction restates the numerator; conditional probability .02).
   */
  const elsewhere = (line: string) => {
    const label = lineLabel(line);
    if (flaggedLabel === null || label === null || label === flaggedLabel) return false;
    const v = resultValue(canon(line), "typed");
    return v !== null && reached(v);
  };
  return { reached, restates, elsewhere, flagged, flaggedLabel };
}

/**
 * Does the typed fix agree with any authored correction line? A whole-line match wins;
 * otherwise the final values are compared (the value the correction states, to 1 % or 0.05,
 * whichever is looser, and 0.005 below 1). With `working` it reads a find-the-mistake item: lines
 * and values her working already has are not evidence of the fix.
 */
export function fixMatches(typed: string, correction: readonly string[], opts: FixOptions = {}): FixMatch {
  const t = canon(typed);
  if (t.length === 0 || correction.length === 0) return NONE;
  const ctx = opts.working ? fixContext(correction, opts.working, opts.mistakeLine ?? opts.working.length) : null;
  const reached = (v: number) => ctx !== null && ctx.reached(v);
  if (ctx && ctx.elsewhere(typed)) return NONE;
  const refs = correction.filter((c) => canon(c).length > 0 && !(ctx && ctx.restates(c)));
  // What earlier lines of a worked example already state is not this step's contribution (see `stepLineMatches`):
  // their lines, clauses and pieces, and the result each chain in them arrives at ("Q = … = 19 + 8√3" states Q).
  const earlier = (opts.exclude ?? []).flatMap((e) => [canon(e), ...clauses(e), ...mathsPieces(e)]);
  const results = earlier.map((e) => {
    const sides = splitLabel(e).body.split("=");
    return sides.length > 1 ? sides[sides.length - 1]!.trim() : "";
  });
  const fromEarlier = (k: string) => {
    const body = splitLabel(k).body;
    return earlier.some((e) => sameWritten(k, e) || sameWritten(body, splitLabel(e).body)) || results.some((r) => r.length > 0 && sameWritten(body, r));
  };

  const lineVerdict = (reference: string): boolean => {
    const how = compareLines(t, reference);
    if (how === null) return sameSolutionSet(t, reference);
    // A statement of a single value ("x = 4", "7/33") is judged by that value: one her working already reached is
    // no fix, however the line is written ("x = 4" when the flagged line is "x = 7 or x = 4").
    const v = bareValue(splitLabel(reference).body);
    return v === null || !reached(v);
  };
  for (const r of refs) {
    if (lineVerdict(canon(r))) return LINE;
    if (!opts.pieces) continue;
    const parts = clauses(r).filter((k) => !fromEarlier(k));
    if (parts.length > 1 && parts.some((k) => !(ctx && ctx.restates(k)) && lineVerdict(k))) return LINE;
    // A `$…$` piece of the line, written on its own ("-2 + 9 = 7" from "$\mathbf{j}$: $-2 + 9 = 7$", "s max = …" from
    // "$s$ largest when …: $s_{\max} = \dfrac{…}{…}$").
    const body = splitLabel(t).body;
    if (mathsPieces(r).some((p) => !fromEarlier(p) && (lineVerdict(p) || equationsMatch(body, splitLabel(p).body, LINE_OPTS)))) return LINE;
    // The result a chain of equal expressions arrives at ("x/(2(x-5))" for "\frac{2x(x+5)}{4(x+5)(x-5)} =
    // \frac{x}{2(x-5)}", "9 : 25" for "45 : 125 = 9 : 25").
    if ([canon(r), ...clauses(r), ...mathsPieces(r)].some((k) => !fromEarlier(k) && endsTheChain(body, k))) return LINE;
    // Her own chain arriving at the result ("3x²/x = 3x" for "Answer: 3x"; MK-07).
    // In the fix box and in a worked-example step alike: every side must equal the next and the last be the result in
    // its own form (sameResultForm), so a later step's chain never arrives at an earlier step's uncancelled result.
    if (/=/.test(t) && [canon(r), ...clauses(r)].some((k) => !fromEarlier(k) && chainArrives(t, k))) return LINE;
    // Her line stopping part-way along the chain ("P(wet given late) = 0.10 / 0.16" of "… = 0.10 / 0.16 = 5/8 =
    // 0.625", "k = 10^0.602" of "k = 10^0.602 = 4.0"): its sides are the chain's, in order.
    if (/=/.test(t) && [canon(r), ...clauses(r)].some((k) => !fromEarlier(k) && chainStates(k, t))) return LINE;
  }

  if (ctx) {
    // The same equation rearranged, unless it is also the flagged equation rearranged. A single value ("x = 4") is
    // no equation to rearrange: it was judged above, by its value.
    const equations = (r: string) => [canon(r), ...clauses(r)].filter((k) => !ctx.restates(k) && bareValue(splitLabel(k).body) === null);
    // Her own single value ("x = 4") solves "x − 4 = 0" as well, and is held to the same gate: reached, it is no fix.
    const ownValue = bareValue(splitLabel(t).body);
    const gated = ownValue !== null && reached(ownValue);
    if (!gated && !sameEquation(t, canon(ctx.flagged)) && refs.some((r) => equations(r).some((k) => sameEquation(t, k)))) return LINE;
    if (refs.some((r) => sameProseValue(typed, r))) return LINE;
  }

  // A correction that is a unit ("unit = Ω/m"): her line names the same unit, in any spelling ("ohms per metre").
  if (ctx) {
    const unitOf = (line: string): string | null => {
      const body = splitLabel(canon(line)).body.replace(/^(?:the\s+)?units?\s*(?:=|:|is)\s*/i, "").replace(/^[-−+]?\d+(?:\.\d+)?\s*/, "").trim();
      if (body.length === 0 || /\d/.test(body.replace(/[⁻¹²³]|\^-?\d/g, ""))) return null;
      const p = parseNumeric(`1 ${body}`);
      return p?.unit ? normaliseUnit(p.unit) : null;
    };
    const unitRefs = refs.filter((r) => /^(?:the\s+)?units?\s*(?:=|:|is)/i.test(canon(r).trim()));
    const typedUnit = unitOf(typed);
    if (typedUnit !== null && unitRefs.some((r) => unitOf(r) === typedUnit) && unitOf(ctx.flagged) !== typedUnit) return LINE;
  }
  const typedResult = resultOf(t, "typed");
  if (typedResult === null) return NONE;
  const lastLine = correction[correction.length - 1]!;
  /** A value to reach, as written, with the label of the clause that states it and the number it is the value of. */
  let targets: Array<Stated & { label: string | null; what: number | null }>;
  const last = clauses(lastLine);
  const finalClause = last[last.length - 1];
  const finalLabel = finalClause !== undefined ? splitLabel(finalClause).label : null;
  if (ctx) {
    // A value any correction line states that her working never reached: the flagged line's own corrected value, a
    // conversion the fix needs ("400 mA = 0.40 A", "2.3 kW = 2300 W"), what follows from it ("I = 5.5 A"), and the final
    // answer (P2 D, 25 Sep 2026: only the flagged line's label and the last line were read, so "0.4 A" and "2300 W"
    // were refused). A correction line that restates her working is not in `refs`, and a value she reached is no fix.
    const own = refs.flatMap((r) => statedResults(r));
    const final = finalClause !== undefined ? resultOf(finalClause, "authored") : null;
    targets = [...own, ...(final === null ? [] : [{ ...final, label: finalLabel, what: numericWhat(finalClause!) }])].filter((x) => !reached(x.value));
  } else {
    const v = resultOf(canon(lastLine), "authored");
    targets = v === null ? [] : [{ ...v, label: finalLabel, what: numericWhat(finalClause ?? canon(lastLine)) }];
  }
  // Her label must name what the target's line names ("The area is least when x" is not "The area is greatest
  // when x"; "m" is not "c"); a line with no label, or a symbol for a word, agrees. And a value of a different
  // percentage is a different quantity ("120% = £54" is not "75% = £54").
  const typedLabel = splitLabel(t).label;
  const typedWhat = numericWhat(t);
  return targets.some(
    (x) =>
      labelsAgree(typedLabel, x.label) &&
      (typedWhat === null || x.what === null || typedWhat === x.what) &&
      near(typedResult.value, x.value, typedResult.text, x.text),
  ) && valueLineSound(opts.rawTyped ?? typed, correction, opts.exclude ?? [])
    ? { match: true, how: "value" }
    : NONE;
}

// ---------------------------------------------------------------------------------------------------------------------
// A line judged by its value must also be true, point the step's way and be in its unit (the FM2 review, 27 Sep 2026:
// "42 sin 28 = 37.08" was confirmed against 42 cos 28 = 37.08 — the sine and cosine swapped, the error the examiners'
// reports name most in FM2; "a = 1.2 downwards" against up as positive; "60 kg" for a force).
// ---------------------------------------------------------------------------------------------------------------------

/** Sine, cosine and tangent of degrees, and their inverses, replaced by their values; null when an argument is unread. */
function trigFree(expr: string): string | null {
  let s = expr
    .replace(/\\left|\\right/g, "")
    .replace(/\\(arcsin|arccos|arctan|sin|cos|tan)(?![A-Za-z])/g, "$1")
    .replace(/\^\{?\\circ\}?|°/g, "")
    .replace(/\\sqrt\{([^{}]*)\}/g, "√($1)")
    .replace(/\\[dt]?frac\{([^{}]*)\}\{([^{}]*)\}/g, "(($1)/($2))")
    .replace(/²/g, "^2")
    .replace(/³/g, "^3");
  for (let n = 0; n < 12; n += 1) {
    const m = /(arcsin|arccos|arctan|sin|cos|tan)\s*(\^\{?-1\}?|⁻¹|\^-1|-1(?=\s*\())?\s*/i.exec(s);
    if (!m) return s;
    const fn = m[1]!.toLowerCase();
    const inverse = m[2] !== undefined || fn.startsWith("arc");
    const at = m.index + m[0].length;
    let arg: string;
    let end: number;
    if (s[at] === "(") {
      let depth = 0;
      let close = -1;
      for (let i = at; i < s.length; i += 1) {
        if (s[i] === "(") depth += 1;
        else if (s[i] === ")" && --depth === 0) {
          close = i;
          break;
        }
      }
      if (close < 0) return null;
      arg = s.slice(at + 1, close);
      end = close + 1;
    } else {
      const lit = /^[-−]?\d+(?:\.\d+)?/.exec(s.slice(at));
      if (!lit) return null;
      arg = lit[0];
      end = at + lit[0].length;
    }
    const inner = evaluateWithTrig(arg);
    if (inner === null) return null;
    const deg = Math.PI / 180;
    const base = fn.replace(/^arc/, "");
    const v = inverse
      ? (base === "sin" ? Math.asin(inner) : base === "cos" ? Math.acos(inner) : Math.atan(inner)) / deg
      : base === "sin"
        ? Math.sin(inner * deg)
        : base === "cos"
          ? Math.cos(inner * deg)
          : Math.tan(inner * deg);
    if (!Number.isFinite(v)) return null;
    s = `${s.slice(0, m.index)}(${v.toFixed(12)})${s.slice(end)}`;
  }
  return null;
}

/** Arithmetic with trigonometry in degrees: "42 sin 28", "\tan^{-1}(5/12)", "√(37.08² + 19.72²)". Null for algebra. */
export function evaluateWithTrig(expr: string): number | null {
  const s = trigFree(expr.trim());
  if (s === null) return null;
  // A number before a bracket multiplies it ("42(0.4695)", as "42 sin 28" becomes).
  const t = s.replace(/\s+/g, "").replace(/−/g, "-").replace(/(\d|\))\(/g, "$1*(");
  if (/^\(?-?\d+(?:\.\d+)?\)?$/.test(t)) return Number(t.replace(/[()]/g, ""));
  return evaluateArithmetic(t);
}

/** Two sides of a typed statement agree to the precision she wrote them (a rounded "= 34.64", "≈ 42"). */
function sidesAgree(a: number, b: number, textA: string, textB: string): boolean {
  const places = (t: string) => {
    const m = /^\s*[-−]?\d+\.(\d+)\s*$/.exec(dropUnit(t));
    return m ? m[1]!.length : null;
  };
  const p = [places(textA), places(textB)].filter((x): x is number => x !== null);
  const written = p.length > 0 ? 0.5 * 10 ** -Math.min(...p) : 0;
  return Math.abs(a - b) <= Math.max(written, 0.005 * Math.max(Math.abs(a), Math.abs(b)), 1e-9) + 1e-9;
}

/** Every statement in her line whose sides are all numbers is true: "40 cos 30 = 20" is not (it is 34.64). */
export function statementsHold(typed: string): boolean {
  // Split into statements before tidying, which drops the commas between them.
  for (const raw of plainText(typed).split(/\s*[,;]\s*|\s+(?:so|and|therefore|hence|thus|giving|then)\s+/i)) {
    const sides = asTyped(raw)
      .split(/[=≈]/)
      .map((x) => x.trim())
      .filter((x) => x.length > 0);
    const values = sides.map((side) => {
      const letters = side.replace(/(?:arcsin|arccos|arctan|sin|cos|tan)|\\[A-Za-z]+/g, "");
      // A division next to an implied product ("90π ÷ 4/3π") has two readings; such a side is not judged.
      const ambiguous = /÷|\/|\\div/.test(side) && /(?:\d|\))\s*(?:π|\\pi|\()|π\s*\d/.test(side);
      return ambiguous || /[A-Za-z]/.test(dropUnit(letters)) ? null : evaluateWithTrig(dropUnit(side));
    });
    for (let i = 0; i + 1 < values.length; i += 1) {
      const [a, b] = [values[i], values[i + 1]];
      if (a === null || a === undefined || b === null || b === undefined) continue;
      if (sidesAgree(a, b, sides[i]!, sides[i + 1]!)) continue;
      // One quantity in two units: "20 cm = 0.2 m", "1.61 kW = 1610 W" (gate 2, G2-27, the P2 authors).
      const pb = parseNumeric(sides[i + 1]!);
      if (pb?.unit && unitDimension(pb.unit) !== null && checkNumeric(sides[i]!, { value: pb.value, unit: pb.unit, tolerance: { type: "relative", value: 0.001 } }).correct) continue;
      return false;
    }
  }
  return true;
}

const OPPOSITE: Record<string, string> = { up: "down", down: "up", left: "right", right: "left", acw: "cw", cw: "acw", forward: "backward", backward: "forward" };

/** The directions a line states, as up/down/left/right/cw/acw ("Taking up as positive", "down the slope"). */
function directionsIn(text: string): Set<string> {
  const t = asTyped(plainText(text)).toLowerCase();
  const out = new Set<string>();
  if (/\bup(?:wards?)?\b/.test(t)) out.add("up");
  if (/\bdown(?:wards?)?\b/.test(t)) out.add("down");
  if (/\bleft(?:wards?)?\b/.test(t)) out.add("left");
  if (/\bright(?:wards?)?\b/.test(t) && !/\bright[- ]angle/.test(t)) out.add("right");
  if (/\banti-?clockwise\b/.test(t)) out.add("acw");
  if (/(?<!anti-?)\bclockwise\b/.test(t)) out.add("cw");
  if (/\bforwards?\b/.test(t)) out.add("forward");
  if (/\bbackwards?\b/.test(t)) out.add("backward");
  return out;
}

/**
 * Her direction contradicts the step's: the step (or, where it names none, the working before it) states the opposite
 * direction and never hers ("a = 1.2 downwards" where the working takes up as positive).
 */
function directionContradicts(typed: string, lines: readonly string[], before: readonly string[]): boolean {
  const hers = directionsIn(typed);
  if (hers.size === 0) return false;
  const own = new Set(lines.flatMap((l) => [...directionsIn(l)]));
  const context = own.size > 0 ? own : new Set(before.flatMap((l) => [...directionsIn(l)]));
  return [...hers].some((d) => context.has(OPPOSITE[d]!) && !context.has(d));
}

/** The kind of quantity a line's final value is in ("force" for N, "mass" for kg), when the unit is one the marker knows. */
function resultDimension(line: string): string | null {
  const plain = asTyped(plainText(line)).replace(/[.,;:]+$/, "");
  if (/^\s*(?:number of )?units\s*[=:]/i.test(plain)) return unitDimension("kWh");
  const last = plain.split(/[=≈]/).pop() ?? "";
  const m = /[-−]?\d+(?:\.\d+)?\s*([A-Za-zΩ°µ][A-Za-z²³⁻¹/^0-9]*)\s*$/.exec(last.trim());
  return m ? unitDimension(m[1]!) : null;
}

/** Her value is true, points the step's way and is in the step's kind of unit. */
function valueLineSound(typed: string, lines: readonly string[], before: readonly string[]): boolean {
  if (!statementsHold(typed)) return false;
  if (directionContradicts(typed, lines, before)) return false;
  const hers = resultDimension(typed);
  const theirs = lines.map(resultDimension).filter((d): d is string => d !== null);
  return hers === null || theirs.length === 0 || theirs.includes(hers);
}

/**
 * Is the typed fix the flagged wrong line itself, as the fix box reads lines — the same line respaced, in TeX or
 * typed, with or without its label? Then it is "not there yet", whatever the correction lines happen to share
 * with it (engine brief item 1; the pre-read found "= log 2x^3", "log(x + 5) / log(x - 1) = log 3" and
 * "P(wet given late) = 0.10" accepted as their own fixes).
 */
export function sameAsMistakeLine(typed: string, mistakeLine: string): boolean {
  return compareLines(canon(typed), canon(mistakeLine)) !== null;
}

/** The find-the-mistake fields the fix box reads. */
export interface FixItem {
  correction: readonly string[];
  studentWorking: readonly string[];
  /** 1-based. */
  mistakeLine: number;
}

/**
 * The fix box's verdict on a find-the-mistake item, in order:
 *   1. a line already on the page, typed as written (the flagged line or a sound one), fixes nothing — the
 *      corrections often restate the sound lines, so retyping line 1 used to count as fixing line 3;
 *   2. a line of the correction typed as written is the fix (its unit kept, so a unit put right is seen), unless
 *      that line only restates what her working already had;
 *   3. the flagged line under the looser reading (unit or label dropped) is still the flagged line;
 *   4. otherwise `fixMatches` with her working.
 */
export function markFix(typed: string, item: FixItem): FixMatch {
  fixBox += 1;
  try {
    return markFixReading(typed, item);
  } finally {
    fixBox -= 1;
  }
}

function markFixReading(typed: string, item: FixItem): FixMatch {
  // A correction line "Also accepted = …" offers its wording under the flagged line's own label, and on its own (gate 2,
  // G2-39, 11 Oct 2026: "Step 4 = repeat heating and weighing until constant mass" was refused while the same words
  // stood in an "Also accepted" line).
  const flaggedRaw = plainText(item.studentWorking[item.mistakeLine - 1] ?? "").trim();
  const flaggedLabel = /^([^:=]{1,40}?)\s*[:=]\s*\S/.exec(flaggedRaw)?.[1]?.trim() ?? null;
  const expanded = item.correction.flatMap((c) => {
    const m = /^\s*also accepted\s*[=:]\s*(.+)$/i.exec(c);
    const lines = m ? [m[1]!, ...(flaggedLabel ? [`${flaggedLabel} = ${m[1]!}`] : [])] : [c];
    // A remark in brackets at the end of a line ("12 hires (a whole number)") is the author's aside, not the fix's words.
    return lines.flatMap((l) => {
      const r = /^(.*\S)\s*\(([^()]*[A-Za-z]{3,}[^()]*)\)\s*\.?$/.exec(l);
      return r && !/[=+×÷*/^]/.test(r[2]!) ? [l, r[1]!] : [l];
    });
  });
  const it = { ...item, correction: expanded };
  const verdict = markFixLines(typed, it);
  if (verdict.match) return verdict;
  // The flagged line typed back fixes nothing, whichever route below reads it (fixer-p2's EP-7, 11 Oct 2026: lens-ray-
  // diagrams ftm.0003's flagged line, typed back word for word, passed the statements route as one clause the fix and the
  // rest reasons).
  const flaggedLine = item.studentWorking[item.mistakeLine - 1] ?? "";
  if (sameAsMistakeLine(typed, flaggedLine)) return NONE;
  // So does any line already on the page, as the line route's first rule reads it (a bare value aside): gate 2's corpus
  // guard found 25 of her own sound lines paid by the routes below ("Top: x² + 9x = x(x + 9)" through the lead-in route).
  {
    const bare = splitLabel(canon(typed));
    const bareValueLine = bare.label === null && bareValue(bare.body) !== null;
    const written = asWritten(typed);
    if (!bareValueLine && item.studentWorking.some((w) => sameWritten(written, asWritten(w)))) return NONE;
    // A line of the correction typed as written has had the line route's whole reading (a restated sound line, or a
    // line under another label stating a value she already reached, is not this line's fix); the routes below read her
    // own wording and never overturn it (pressure ftm.02: "Check: 8 × 8 = 64 cm²" passed the lead-in route).
    if (it.correction.some((c) => sameWritten(written, asWritten(c)))) return NONE;
  }
  // The flagged line's own wrong words: in it and in no line of the correction ("virtual", "directly" where the correction
  // keeps "the image can be caught on the sensor, so it is real"). A negator is left out: it can sit beside any word.
  const correctionWords = it.correction.flatMap(coreWords);
  const wrongWords = coreWords(flaggedLine).filter(
    (w) => w.length >= 4 && !CORE_STOP.has(w) && !CORE_DIRECTION.has(w) && !/^[0-9]/.test(w) && !/^(?:not|never|cannot|nt)$/.test(w) && !correctionWords.some((x) => sameCoreWord(x, w)),
  );
  // Her line with a prose lead-in ("resolving horizontally: 85 − F = 0"): the statement after it (gate 2, G2-35).
  const lead = /^\s*[A-Za-z][A-Za-z ,]{2,40}:\s*(.*[=<>].*)$/.exec(plainText(typed));
  if (lead && !/[=<>]/.test(lead[0].slice(0, lead[0].indexOf(":"))) && markFixLines(lead[1]!, it).match) return LINE;
  // Statements joined by "so" or a comma: one of them the fix, and every other a reason that contradicts nothing the
  // correction states ("a = 0, so 85 - F = 0"; gate 2, G2-35b). A value of a quantity the correction gives another value
  // ("…, so F = 75") is a contradiction.
  {
    const parts = plainText(typed)
      .split(/\s*[,;]\s*|\s+(?:so|therefore|hence|thus|giving|and so)\s+/i)
      .map((x) => x.trim().replace(/^(?:so|therefore|hence|thus|and)\s+/i, ""))
      .filter((x) => x.length > 0)
      // A chain that ends on its sign ("d2N/dx2 = -24 < 0") is the statement and the sign it reads (G2-31d).
      .flatMap((x) => {
        const m = /^(.*=\s*([-−]?\d+(?:\.\d+)?))\s*([<>])\s*0\s*$/.exec(x);
        return m ? [m[1]!.trim(), `${m[2]} ${m[3]} 0`] : [x];
      });
    if (parts.length >= 2) {
      const correctionValue = (label: string): number[] =>
        it.correction.flatMap((c) => {
          const m = new RegExp(`(?:^|[^A-Za-z])${label.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\s*=\\s*([-−]?\\d+(?:\\.\\d+)?)`).exec(plainText(c));
          return m ? [Number(m[1]!.replace("−", "-"))] : [];
        });
      const reason = (x: string) => {
        // A sign read off a value: "-24 < 0" is a reason when it is true.
        const sign = /^\s*([-−]?\d+(?:\.\d+)?)\s*([<>])\s*0\s*$/.exec(x);
        if (sign) {
          const v = Number(sign[1]!.replace("−", "-"));
          return sign[2] === "<" ? v < 0 : v > 0;
        }
        // Prose holding no value is a reason, unless it says the flagged line's own wrong words again (EP-7).
        if (!/=/.test(x)) return !/\d/.test(x) && !coreWords(x).some((w) => wrongWords.some((v) => sameCoreWord(v, w)));
        const m = /^\s*([A-Za-z])\s*=\s*([-−]?\d+(?:\.\d+)?)\s*[A-Za-z/²]*\s*$/.exec(x);
        if (!m) return false;
        const given = correctionValue(m[1]!);
        return given.length === 0 || given.some((v) => Math.abs(v - Number(m[2]!.replace("−", "-"))) < 1e-9);
      };
      const fixAt = parts.findIndex((x) => !sameAsMistakeLine(x, flaggedLine) && markFixLines(x, it).match);
      if (fixAt >= 0 && parts.every((x, k) => k === fixAt || reason(x) || markFixLines(x, it).match)) return LINE;
    }
  }
  // A worded fix: the words the correction puts in place of the flagged line's (gate 2, G2-34, G2-36, G2-40 to G2-43).
  if (correctedCore(typed, it)) return LINE;
  // The value chosen from the flagged line's list (gate 2, G2-37: "10 cm" where the flagged line offered "−18 cm or 10 cm"
  // and the correction keeps 10 cm).
  if (chosenValue(typed, it)) return LINE;
  // A list of values that are the correction's results (gate 2, G2-38, G2-46: "Bar heights: 1.5, 5, 4, 1.33", "0.9 A and
  // 0.3 A").
  if (resultsListed(typed, it)) return LINE;
  return NONE;
}

/** The values a line states, a label before a colon aside: "Bar heights: 1.5, 5, 4, 1.33" → 1.5, 5, 4, 1.33. */
function listedValues(line: string): number[] {
  const body = plainText(line).replace(/^\s*[A-Za-z][A-Za-z ]{0,40}:\s*/, "").replace(/^[^:]{1,60}:\s*(?=[-−]?\d)/, "");
  if (/[=<>×÷*/^√]/.test(body)) return [];
  return (body.match(/[-−]?\d+(?:\.\d+)?/g) ?? []).map((n) => Number(n.replace("−", "-")));
}

/** Each statement's result in a correction line: the value after its last "=" ("6 ÷ 4 = 1.5, 10 ÷ 2 = 5" → 1.5, 5). */
function statementResults(line: string): number[] {
  return plainText(line)
    .split(/[,;.](?=\s)|\band\b/)
    .map((part) => {
      const sides = part.split("=");
      if (sides.length < 2) return null;
      const v = parseNumeric(sides[sides.length - 1]!.trim());
      return v ? v.value : null;
    })
    .filter((v): v is number => v !== null && Number.isFinite(v));
}

function chosenValue(typed: string, item: FixItem): boolean {
  const flagged = item.studentWorking[item.mistakeLine - 1] ?? "";
  const offered = listedValues(flagged.replace(/^[^:]*:/, "")).length >= 2 ? listedValues(flagged.replace(/^[^:]*:/, "")) : (plainText(flagged).match(/[-−]?\d+(?:\.\d+)?/g) ?? []).map((n) => Number(n.replace("−", "-")));
  if (offered.length < 2 || !/\bor\b/i.test(flagged)) return false;
  const mine = listedValues(typed);
  if (mine.length !== 1) return false;
  const v = mine[0]!;
  const kept = item.correction.some((c) => {
    const vals = (plainText(c).match(/[-−]?\d+(?:\.\d+)?/g) ?? []).map((n) => Number(n.replace("−", "-")));
    return vals.length === 1 && Math.abs(vals[0]! - v) < 1e-9;
  });
  return kept && offered.some((o) => Math.abs(o - v) < 1e-9);
}

function resultsListed(typed: string, item: FixItem): boolean {
  const mine = listedValues(typed);
  if (mine.length < 2) return false;
  const flagged = item.studentWorking[item.mistakeLine - 1] ?? "";
  const flaggedValues = (plainText(flagged).match(/[-−]?\d+(?:\.\d+)?/g) ?? []).map((n) => Number(n.replace("−", "-")));
  const results = item.correction.flatMap(statementResults);
  const near = (a: number, b: number) => Math.abs(a - b) <= Math.max(0.005, 0.01 * Math.abs(b));
  const pool = [...results];
  for (const m of mine) {
    const k = pool.findIndex((r) => near(m, r));
    if (k < 0) return false;
    pool.splice(k, 1);
  }
  // Not the flagged line's own values said again.
  return !mine.every((m) => flaggedValues.some((f) => near(m, f)));
}

/**
 * The words a prose correction puts in place of the flagged line's, said in her own sentence (gate 2, 11 Oct 2026: "the
 * ore is bauxite" for "ore = bauxite", "orange to colourless" for "The bromine water changes
 * from orange to colourless.", "CO2 and H2O" for "The products are CO2 and H2O.", "Kerosene is used as aircraft fuel."
 * for "Kerosene is a fuel for aircraft."). The correction and the flagged line lose their common opening and ending
 * words; what is left of the correction (its content words, at most four) must all be in her answer, in their order where
 * the correction runs from one to the other ("white to blue"), with none of the flagged line's own words and no negator
 * just before them. A correction that only reorders the flagged line's words ("from the positive terminal to the
 * negative terminal") is met by its first and last words in its order. Synonyms are the content's to list ("Also
 * accepted" lines): "planes" is not "aircraft" here.
 */
const CORE_STOP = new Set(["a", "an", "the", "is", "are", "was", "were", "be", "been", "it", "its", "of", "and", "so", "that", "this", "as", "by", "for", "with", "at", "in", "on", "than", "then", "has", "have", "had", "will", "would", "can", "very", "there", "their", "they", "which", "used", "use", "uses", "acts", "act", "changes", "change", "changed", "turns", "turn", "turned", "goes", "go", "went", "becomes", "become", "became", "gives", "give", "makes", "make", "made", "should", "must"]);
const CORE_DIRECTION = new Set(["to", "into", "from", "towards", "toward", "then"]);
function coreWords(line: string): string[] {
  return asTyped(plainLine(line))
    // "n-shaped", "U-shaped": one word, before the hyphen becomes a space.
    .replace(/\b([A-Za-z])\s*-\s*shaped\b/g, "$1shaped")
    .replace(/n['’]t\b/g, " not")
    .replace(/(?<=[A-Za-z])-(?=[A-Za-z])/g, " ")
    .replace(/\bat right angles to\b/gi, "perpendicular to")
    .replace(/\bat (?:90 ?°|90 degrees|90|a right angle) to\b/gi, "perpendicular to")
    .toLowerCase()
    .replace(/[^a-z0-9²³+\-−α-ωΩ]+/g, " ")
    .split(" ")
    .filter((w) => w.length > 0 && !/^[+\-−]+$/.test(w));
}
function sameCoreWord(a: string, b: string): boolean {
  if (a === b) return true;
  const [s, l] = a.length <= b.length ? [a, b] : [b, a];
  return s.length >= 3 && (l === `${s}s` || l === `${s}es` || l === `${s}wards` || l === `${s}ward` || (s.length >= 5 && l.startsWith(s) && l.length - s.length <= 3));
}
function correctedCore(typed: string, item: FixItem): boolean {
  const flagged = item.studentWorking[item.mistakeLine - 1] ?? "";
  const f = coreWords(flagged);
  const hers = coreWords(typed);
  if (f.length === 0 || hers.length === 0) return false;
  const has = (w: string) => hers.findIndex((h) => sameCoreWord(h, w));
  const negatedAt = (i: number) => hers.slice(Math.max(0, i - 3), i).some((h) => /^(?:not|no|never|nt|cannot)$/.test(h));
  for (const line of item.correction) {
    if (item.studentWorking.some((w) => sameWritten(asWritten(line), asWritten(w)))) continue;
    const c = coreWords(line);
    let i = 0;
    while (i < f.length && i < c.length && f[i] === c[i]) i += 1;
    let j = 0;
    while (j < f.length - i && j < c.length - i && f[f.length - 1 - j] === c[c.length - 1 - j]) j += 1;
    const coreC = c.slice(i, c.length - j);
    const coreF = f.slice(i, f.length - j);
    const content = (ws: string[]) => ws.filter((w) => !CORE_STOP.has(w) && !CORE_DIRECTION.has(w));
    const cC = content(coreC);
    const cF = content(coreF);
    if (cC.length === 0) continue;
    // A number is the value routes' to judge; a formula (letters and digits) is a word.
    if (cC.some((w) => /^\d/.test(w) && !/[a-z]/.test(w))) continue;
    const dist = cC.filter((w) => !cF.some((x) => sameCoreWord(x, w)));
    // Words, not symbols: a unit letter ("m" of "Ω/m") or a lone symbol is the unit and value routes' to judge. At most
    // four of them: a longer correction is said in its own words or listed as an accepted line.
    if (dist.some((w) => w.length < 3) || dist.length > 4) continue;
    const distF = cF.filter((w) => !cC.some((x) => sameCoreWord(x, w)));
    if (distF.some((w) => has(w) >= 0)) continue;
    if (dist.length === 0) {
      // A reorder: the first and last words of the correction's run, in its order and not the flagged order.
      if (cC.length < 2) continue;
      const a = has(cC[0]!);
      const b = has(cC[cC.length - 1]!);
      if (a >= 0 && b > a && !negatedAt(a)) return true;
      continue;
    }
    const at = dist.map(has);
    if (at.some((x) => x < 0 || negatedAt(x))) continue;
    // A run from one word to another keeps its order ("white to blue", not "blue to white").
    const directed = coreC.some((w) => CORE_DIRECTION.has(w) && w !== "then");
    if (directed && dist.length >= 2 && !at.every((x, k) => k === 0 || x > at[k - 1]!)) continue;
    return true;
  }
  return false;
}

/** The fix box's line and value routes (markFix before gate 2's additions). */
function markFixLines(typed: string, item: FixItem): FixMatch {
  const written = asWritten(typed);
  if (written.length === 0) return NONE;
  // A bare value ("= 7/33") is judged by what it is worth, not by where else it is written: her line 3 may end on
  // the value that corrects line 1 (conditional probability .03), which the value rules below settle.
  const bare = splitLabel(canon(typed));
  const bareValueLine = bare.label === null && bareValue(bare.body) !== null;
  if (!bareValueLine && item.studentWorking.some((w) => sameWritten(written, asWritten(w)))) return NONE;
  // A value her working states on or after the flagged line, in a line no correction restates, is a value the item says
  // is wrong: typed bare, with a label or a currency sign, it is never the fix (the M8 author, 8 Oct 2026: growth-decay
  // ftm.01 took her own "£10080" because it lies within the value route's 1 % of the correction's 10123.78).
  const correct = item.correction.flatMap(statedValues);
  const wrong = item.studentWorking
    .slice(Math.max(0, item.mistakeLine - 1))
    .filter((w) => !item.correction.some((c) => sameWritten(asWritten(c), asWritten(w))))
    .flatMap(statedValues)
    .filter((v) => !correct.some((c) => Math.abs(c - v) <= 1e-9 * Math.max(1, Math.abs(c))));
  const ownValue = bareValue(bare.body) ?? resultValue(canon(typed), "typed");
  if (ownValue !== null && wrong.some((v) => Math.abs(v - ownValue) <= 1e-9 * Math.max(1, Math.abs(v)))) return NONE;
  const ctx = fixContext(item.correction, item.studentWorking, item.mistakeLine);
  if (!ctx.elsewhere(typed) && item.correction.some((c) => !ctx.restates(c) && sameWritten(written, asWritten(c)))) return LINE;
  if (sameAsMistakeLine(typed, ctx.flagged)) return NONE;
  return fixMatches(typed, item.correction, { working: item.studentWorking, mistakeLine: item.mistakeLine, pieces: true });
}

/** The value a learner would need to reach, for the reveal line ("…= 36.2"). */
export function finalValue(correction: readonly string[]): number | null {
  const last = correction[correction.length - 1];
  if (!last) return null;
  const parsed = parseNumeric(String(lastNumber(plainLine(last)) ?? ""));
  return parsed ? parsed.value : null;
}

// ---------------------------------------------------------------------------------------------
// Worked-example steps: her typed line against the authored `working`
// ---------------------------------------------------------------------------------------------

/**
 * Formatting commands that wrap a symbol or a word — `\mathbf{j}`, `\text{minimum}` — are the symbol or the word
 * she types (the FM2 fix pass found "j: -2 + 9 = 7" refused against `$\mathbf{j}$: $-2 + 9 = 7$`).
 */
function asTypedTeX(line: string): string {
  return line.replace(/\\(?:math(?:bf|rm|it|sf)|text(?:bf|it|rm)?|boldsymbol|operatorname)\{([^{}]*)\}/g, "$1");
}

/** Quantity words and the symbols CCEA's physics formulae use for them (a word formula is the formula). */
const WORD_SYMBOL: Array<[RegExp, string]> = [
  [/\bpotential difference\b|\bvoltage\b/gi, "V"],
  [/\bresistance\b/gi, "R"],
  [/\bcurrent\b/gi, "I"],
  [/\bcharge\b/gi, "Q"],
  [/\bpower\b/gi, "P"],
  [/\benergy\b/gi, "E"],
  [/\btime\b/gi, "t"],
  [/\bwave ?speed\b|\bspeed\b|\bvelocity\b/gi, "v"],
  [/\bfrequency\b/gi, "f"],
  [/\bwavelength\b/gi, "λ"],
  [/\bdistance\b/gi, "s"],
  [/\bforce\b/gi, "F"],
  [/\bmass\b/gi, "m"],
  [/\bacceleration\b/gi, "a"],
];
/** "resistance = voltage ÷ current" → "R = V ÷ I"; a line with any word outside the table is left as it is. */
function wordFormula(line: string): string {
  let out = line;
  for (const [re, sym] of WORD_SYMBOL) out = out.replace(re, sym);
  return /[A-Za-z]{2,}/.test(out.replace(/\s+[x]\s+/g, " ")) ? line : out;
}

/** A ratio term: a number, a root of one ("√4", "√{9}") or a power ("2^3"). */
const RATIO_TERM = String.raw`(?:√\{?)?\d+(?:\.\d+)?\}?(?:\^\{?\d+\}?)?`;
/**
 * "9 : 25" is a ratio, not a label and its text: the colon between two ratio terms is kept (as "∶", the ratio sign,
 * so the prose-colon rule below leaves it) and the spaces round it go, so "9 : 25" and "9:25" are one spelling. A
 * ratio's colon is spaced alike on both sides; "At x = 2: 2 + 3" is a label's colon, not the ratio 2 : 2.
 */
const RATIO = new RegExp(String.raw`(?<![\w.])(${RATIO_TERM})(?:\s+:\s+|:)(${RATIO_TERM})(?![\w.])`, "g");

/**
 * Authored TeX spellings → the characters she types (the key strip offers √ π × − ≤ ≥), a
 * typed " x " between digits as times, prose punctuation dropped, and no trailing full stop.
 * Applied to both sides so the comparison stays symmetric.
 */
function asTyped(line: string): string {
  return asTypedTeX(line)
    // A matrix's inverse however it is written: "A inverse", "A^{-1}", "A⁻¹" are all A^-1 (engine brief item 16) …
    .replace(/\b([A-Z])\s+inverse\b/g, "$1^-1")
    .replace(/⁻¹/g, "^-1")
    .replace(/\^\{-1\}/g, "^-1")
    // … and an " x " between two matrices is the product sign, as it is between two numbers below.
    .replace(/(?<=[A-Z]|\^-1)\s+x\s+(?=[A-Z(])/g, " × ")
    // A negative power of a letter is the fraction it writes: "128x^-2" is "128/x^2", "x^{-1}" is "1/x" (gate 2, G2-31:
    // "dL/dx = 2 - 128/x^2" was refused against "dL/dx = 2 - 128x^-2"). Notation, not form: a factorised line is still
    // not its expansion.
    // Only a term: a number before the letter, or an operator or bracket before it; a unit ("Ω m⁻¹") is left alone.
    // In the fix box only: the ladder and the line steps must see the rewriting step itself ("8x^{-1}" for 8/x is the
    // M1 a scheme pays; gate 2's corpus guard: 8 ladder points lost, fm1 gradient-at-a-point .0004 M1 among them).
    .replace(/(^|[=+\-−×*/(]\s*|\d(?:\.\d+)?\s*)([a-z])\^\{?\s*-\s*(\d+)\s*\}?/g, (_m: string, lead: string, v: string, n: string) => {
      if (fixBox === 0) return _m;
      const k = /\d/.test(lead) ? lead.trim() : "";
      return `${k ? "" : lead}${k || "1"}/${v}${n === "1" ? "" : `^${n}`}`;
    })
    // A second derivative in one spelling: d²y/dx², d^2y/dx^2 and d2y/dx2 are d2y/dx2 (gate 2, G2-31).
    .replace(/\bd\s*(?:\^\s*\{?\s*2\s*\}?|²)\s*([A-Za-z])\s*\/\s*d\s*([A-Za-z])\s*(?:\^\s*\{?\s*2\s*\}?|²)/g, (_m: string, y: string, x: string) => `d2${y}/d${x}2`)
    // "…, which is negative" states "< 0", "…, which is positive" "> 0" (G2-31: "d2y/dx2 = -12 < 0").
    // Only straight after a value or an expression: a sentence that opens "That is positive, so …" is left as written
    // (the pairing of optimisation .0014(c) W2 with its solution line reads it so).
    .replace(/(?<=[0-9A-Za-z)}])\s*,?\s*(?:which|that|and this|this)\s+is\s+negative\b/gi, " < 0")
    .replace(/(?<=[0-9A-Za-z)}])\s*,?\s*(?:which|that|and this|this)\s+is\s+positive\b/gi, " > 0")
    // A formula in words is the formula in its symbols ("resistance = voltage ÷ current" is R = V ÷ I; G2-44), in the fix
    // box only: the ladder reads a word formula inside her prose its own way (p2 echoes .0021(a), "…found from distance =
    // speed × time" earns v = d/t).
    .replace(/^(\s*[A-Za-z][A-Za-z ]*?\s*=\s*[A-Za-z][A-Za-z ]*?(?:\s*[×*÷/x]\s*[A-Za-z][A-Za-z ]*?)+\s*)$/i, (line) => (fixBox > 0 ? wordFormula(line) : line))
    // "v squared = u squared + 2as" is the formula v² = u² + 2as.
    .replace(/([A-Za-z0-9)])\s+squared\b/g, "$1^2")
    .replace(/([A-Za-z0-9)])\s+cubed\b/g, "$1^3")
    // "sqrt(72)" as typed on a keyboard is the key strip's √(72).
    .replace(/\bsqrt\s*(?=\()/gi, "√")
    .replace(/\\sqrt\b/g, "√")
    .replace(RATIO, "$1∶$2")
    .replace(/\\[dt]frac\b/g, "\\frac")
    // A numeric fraction is typed a/b, so its value is the fraction and not its denominator.
    .replace(/\\frac\{\s*(-?\d+(?:\.\d+)?)\s*\}\{\s*(\d+(?:\.\d+)?)\s*\}/g, "$1/$2")
    .replace(/\\sqrt\b/g, "√")
    // "^{\circ}" or "^\circ" is a degree sign; the brace is eaten only with its partner, or the "}" closing a
    // \frac's numerator went with it ("\dfrac{9.6 \sin 52^\circ}{…}" could not be read).
    .replace(/\^\{\\circ\}|\^\\circ\b|\\circ\b/g, "°")
    .replace(/\\(?:ldots|cdots|dots)\b|…|\.{3}/g, "")
    .replace(/\\(?:Rightarrow|implies|therefore)\b|⇒|∴/g, "->")
    .replace(/\\leq?\b/g, "≤")
    .replace(/\\geq?\b/g, "≥")
    .replace(/\\neq?\b/g, "≠")
    .replace(/\\pm\b/g, "±")
    .replace(/\\approx\b/g, "≈")
    .replace(/\\propto\b/g, "∝")
    .replace(/\\equiv\b/g, "≡")
    .replace(/(\d)\s+x\s+(\d)/g, "$1 × $2")
    .replace(/(\d),(?=\d{3}\b)/g, "$1")
    // A ";" inside brackets separates a matrix's rows ("(3 -5 ; -1 2)"); it is kept (as "⁏") where prose
    // punctuation goes.
    .replace(/\([^()]*;[^()]*\)/g, (m) => m.replace(/;/g, "⁏"))
    .replace(/[,;:]/g, " ")
    .trim()
    .replace(/\.$/, "")
    .trim();
}

/** A step's `working` (mini-markdown with $maths$) as the plain lines she might type. */
export function workingLines(working: string): string[] {
  return mdToPlain(working)
    .split("\n")
    .map(asTyped)
    .filter((l) => l.length > 0);
}

/** A line states a result when it has an equals sign and ends on a number, with or without a unit. */
const HAS_EQUALS = /[=≈]/;
const ENDS_ON_VALUE = /\d[²³]?\s*(?:[A-Za-z°%]{1,3}[²³]?(?:\/[A-Za-z]{1,3}[²³]?)?)?$/;

function statesResult(line: string): boolean {
  const bare = line.replace(/[{}]/g, "").trim();
  return HAS_EQUALS.test(bare) && ENDS_ON_VALUE.test(bare);
}

/**
 * Does her typed line agree with a worked-example step's `working`? A whole-line match with
 * any line of the step wins (`fixMatches` normalisation, so `1/3 π 5² × 10` reads as
 * `\tfrac{1}{3}\pi (5)^2 (10)`); otherwise the final value carries it, but only when the
 * step's last line states a result — a number in the middle of a sentence is not its value.
 * `pieces` (her own line in a worked-example step): a clause or a `$…$` piece of the step also counts.
 */
export function stepLineMatches(typed: string, working: string, opts: { pieces?: boolean; before?: readonly string[] } = {}): FixMatch {
  const once = (line: string) => stepLineMatchesOnce(line, working, opts);
  const direct = once(typed);
  if (direct.match) return direct;
  const before = opts.before ?? [];
  // The FM2 review (27 Sep 2026): right lines refused for how they were written.
  // A direction she adds that agrees with the step ("a = 1.2 m/s² upwards" where up is positive): judged without it.
  const withoutDirection = typed.replace(STEP_DIRECTION_TAIL, "").trim();
  if (withoutDirection !== typed.trim() && withoutDirection.length > 0 && !directionContradicts(typed, [working], before)) {
    const r = once(withoutDirection);
    if (r.match) return r;
  }
  // The routes below read a piece of her line as the whole, which is right for her own line in a worked-example step
  // (`pieces`) and wrong for the ladder and the re-teach pairing, where one piece of a long line must not stand for a
  // point (a later line's equivalent expression paired with an earlier point: laws-of-logarithms .0007, 27 Sep 2026).
  if (opts.pieces !== true) return NONE;
  // A lead-in before a colon ("T − W = ma: 5600 − 5000 = 500a").
  const lead = /^[^:]{1,60}:\s*(\S.*)$/.exec(typed.trim());
  if (lead && /\d/.test(lead[1]!)) {
    const r = once(lead[1]!);
    if (r.match) return r;
  }
  // Two statements, the last the step's line and each earlier one true of its value ("R_A + 470 = 650, R_A = 180",
  // "2T_D = 206, T_D = 103").
  const parts = plainText(typed)
    .split(/\s*[,;]\s*|\s+(?:so|therefore|hence|thus|giving|then)\s+/i)
    .map((p) => p.trim())
    .filter((p) => p.length > 0);
  if (parts.length >= 2) {
    const last = parts[parts.length - 1]!;
    const r = once(last);
    if (r.match && parts.slice(0, -1).every((p) => holdsFor(p, last))) return r;
  }
  // The step's equation rearranged or worked ("600 = 500a" for "5600 − 5000 = 500a"; "40 cos 30 − 12 = 5a" for
  // "34.64 − 12 = 5a"): one unknown, the same root, and not yet solved (the solved value is the next step's).
  if (sameRootEquation(typed, working, before)) return LINE;
  return NONE;
}

/** A direction after her value: "upwards", "up the slope", "(downwards)", "to the left". */
const STEP_DIRECTION_TAIL = /\s*,?\s*\(?\s*(?:(?:vertically|horizontally|acting)\s+)?(?:up(?:wards?)?|down(?:wards?)?|to the (?:left|right)|left(?:wards?)?|right(?:wards?)?|anti-?clockwise|clockwise)(?:\s+(?:the\s+)?(?:slope|plane|incline))?\s*\)?\s*\.?\s*$/i;

/** A symbol her statement solves for, as she wrote it ("R_A", "T_{D}", "a"), and the value. */
function solvedFor(statement: string): { symbol: string; value: number } | null {
  const m = /^\s*([A-Za-zθα-ω](?:_\{?[A-Za-z0-9]+\}?)?)\s*=\s*([-−]?\d+(?:\.\d+)?)\s*(?:[A-Za-zΩ°µ/²³^-]*\s*)?$/.exec(asTyped(statement));
  return m ? { symbol: m[1]!, value: Number(m[2]!.replace("−", "-")) } : null;
}

/** Her symbol's value put into the statement, both sides a number: does it hold? */
function substituted(statement: string, symbol: string, value: number): { left: number; right: number; texts: [string, string] } | null {
  const sides = asTyped(statement).split(/[=≈]/);
  if (sides.length !== 2) return null;
  const variants = [symbol, symbol.replace(/_\{?([A-Za-z0-9]+)\}?/, "_$1"), symbol.replace(/_\{?([A-Za-z0-9]+)\}?/, "_{$1}"), symbol.replace(/_\{?([A-Za-z0-9]+)\}?/, "$1")];
  const put = (side: string) => {
    let s = side;
    for (const v of [...new Set(variants)].sort((a, b) => b.length - a.length)) {
      s = s.replace(new RegExp(`(?<![A-Za-z_])${v.replace(/[{}^$.*+?()[\]\\|]/g, "\\$&")}(?![A-Za-z_0-9])`, "g"), `(${value})`);
    }
    return evaluateWithTrig(dropUnit(s));
  };
  const [l, r] = [put(sides[0]!), put(sides[1]!)];
  return l === null || r === null ? null : { left: l, right: r, texts: [sides[0]!, sides[1]!] };
}

/** An earlier statement of hers is true of the value her last statement solves for (or is true arithmetic). */
function holdsFor(statement: string, last: string): boolean {
  const solved = solvedFor(last);
  if (!solved) return false;
  const s = substituted(statement, solved.symbol, solved.value);
  if (s) return sidesAgree(s.left, s.right, s.texts[0], s.texts[1]) || Math.abs(s.left - s.right) <= 0.005 * Math.max(Math.abs(s.left), Math.abs(s.right), 1);
  return statementsHold(statement) && /\d/.test(statement) && !/[A-Za-z]/.test(asTyped(statement).replace(/(?:sin|cos|tan)/g, ""));
}

/** Her equation is the step's with its arithmetic done, side for side, and not yet solved. */
function sameRootEquation(typed: string, working: string, before: readonly string[] = []): boolean {
  // The step's own equation with its arithmetic done, side for side ("600 = 500a" for "5600 − 5000 = 500a", "40 cos 30 −
  // 12 = 5a" for "34.64 − 12 = 5a"): each side the same as the step's, or both numbers of the same value. Another
  // equation with the same root is not this step (the verifier, 29 Sep 2026: an earlier step's line, the question's
  // equation and the next step's line all matched by root), and nor is a line an earlier step states.
  const mine = asTyped(plainText(typed)).trim();
  if ((mine.match(/[=≈]/g) ?? []).length !== 1 || solvedFor(mine) !== null) return false;
  // A symbol alone on a side ("Q = 19 + 8√3") is a result, judged as one (and never a restated earlier result).
  if (mine.split(/[=≈]/).some((s) => /^\s*[A-Za-zθα-ω](?:_\{?[A-Za-z0-9]+\}?)?\s*$/.test(s))) return false;
  const tidy = (x: string) => x.replace(/\s+/g, "").replace(/[×·]/g, "*").replace(/\\times/g, "*");
  const written = (a: string, b: string) => tidy(a) === tidy(b);
  // The step's transformation is from its left side to its right. Her line must hold one side as the step writes it,
  // and the other as written or with the step's arithmetic done: a plain number of the same value ("600" for
  // "5600 − 5000"), or the same operation still shown ("40 cos 30 − 12" for "34.64 − 12"). A side matched only by
  // value in another form is another step: "(3/2)² = 9/4" holds step 3's result "(3/2)²" and step 4's evaluation
  // of it, and "10 × 10⁶ = 1 × 10⁷" holds step 2's result and step 3's normalisation (the build-9 gate, class 6).
  const plainNumber = (x: string) => /^\s*[-−+]?\d+(?:\.\d+)?\s*(?:\.\.\.|…)?\s*$/.test(dropUnit(x));
  const done = (hers: string, theirs: string) => {
    const [vh, vt] = [evaluateWithTrig(dropUnit(hers)), evaluateWithTrig(dropUnit(theirs))];
    if (vh === null || vt === null || !sidesAgree(vh, vt, hers, theirs)) return false;
    // The same number to more or fewer places ("1.666..." for "1.66666666...") is the step's own number.
    if (plainNumber(hers) && plainNumber(theirs)) return true;
    const op = mainOperation(theirs);
    if (op === null) return false;
    if (plainNumber(hers)) return true;
    return mainOperation(hers) === op;
  };
  const equationsOf = (text: string) =>
    [...text.split("\n"), ...[...text.matchAll(/\$([^$]+)\$/g)].map((m) => m[1]!)]
      .map((l) => asTyped(plainText(l)).replace(/^[^=:]{1,60}:\s*/, "").trim())
      .filter((l) => (l.match(/[=≈]/g) ?? []).length === 1 && solvedFor(l) === null);
  const [ml, mr] = mine.split(/[=≈]/) as [string, string];
  const same = (ref: string) => {
    const [rl, rr] = ref.split(/[=≈]/) as [string, string];
    const side = (a: string, ra: string) => written(a, ra) || done(a, ra);
    return (side(ml, rl) && side(mr, rr)) || (side(ml, rr) && side(mr, rl));
  };
  if (before.flatMap(equationsOf).some((ref) => tidy(ref) === tidy(mine))) return false;
  return equationsOf(working).some(same);
}

/**
 * The operation a side of an equation does last, outside its brackets: "add" for a sum or difference ("5600 − 5000",
 * "8 × 10⁶ + 2 × 10⁶"), "mul" for a product or quotient ("1 × 10⁷", "9/4"), null where there is none ("(2/3)^-2",
 * "600"). A sign in front, or after "^" or another operator, is not an operation.
 */
function mainOperation(side: string): "add" | "mul" | null {
  const s = dropUnit(side).replace(/\\times/g, "×").replace(/\s+/g, "");
  let depth = 0;
  let found: "add" | "mul" | null = null;
  for (let i = 0; i < s.length; i += 1) {
    const c = s[i]!;
    if ("([{".includes(c)) depth += 1;
    else if (")]}".includes(c)) depth -= 1;
    else if (depth === 0 && i > 0 && "+-−".includes(c) && !/[\^*/×÷·(+\-−=]/.test(s[i - 1]!)) return "add";
    else if (depth === 0 && "×*/÷·".includes(c)) found = "mul";
  }
  return found;
}

function stepLineMatchesOnce(typed: string, working: string, opts: { pieces?: boolean; before?: readonly string[] } = {}): FixMatch {
  const lines = workingLines(working);
  // The authored lines go in as written, `$…$` and all, so a piece of maths she types on its own can be found; the
  // plain lines follow them (a markdown table's rows read as she sees them), the last of them the step's result.
  const authored = working
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l.length > 0 && !l.startsWith("|"));
  // `before`: the earlier steps' working. A piece this step only restates from them ("$Q = 19 + 8\sqrt{3}$ is
  // irrational" restating step 5's Q) is not this step's line.
  const exclude = (opts.before ?? []).flatMap((w) => w.split("\n").map((l) => l.trim()).filter((l) => l.length > 0 && !l.startsWith("|")));
  // A line that ends in prose after its value ("Weight = 9 × 10 = 90 N, acting vertically downwards.") states that value.
  // (A comma reads as a wide gap once the line is tidied.)
  const PROSE_TAIL = /(?:,\s*|\s{2,})[A-Za-z][^=\d]*$/;
  const trimmed = lines.map((l) => l.replace(PROSE_TAIL, "").trim()).filter((l, i) => l !== lines[i] && /=/.test(l));
  const result = fixMatches(asTyped(typed), [...authored, ...lines, ...trimmed], { pieces: opts.pieces === true, exclude, rawTyped: typed });
  if (result.how !== "value") return result;
  const last = lines[lines.length - 1] ?? "";
  return statesResult(last) || statesResult(last.replace(PROSE_TAIL, "").trim()) ? result : NONE;
}
