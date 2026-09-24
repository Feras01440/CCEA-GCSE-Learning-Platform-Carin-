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
import { checkNumeric, parseNumeric } from "@/lib/marking/numeric";
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
    .trim();
}

/**
 * A trailing unit comes off (mechanics units included, in ASCII and superscript spellings). Case matters: "5 j"
 * is a unit vector, not joules, and "8 i" is not a unit at all (the case-blind version read "y = 5 j" as y = 5).
 */
function dropUnit(line: string): string {
  // A unit before the closing brackets of a group ("\dfrac{…}{\sin 57°}", "/(sin 57°)") comes off too, so the typed
  // line and the authored one lose the same thing.
  // An area in "units²" / "square units" (a grid with no scale) is a unit too (engine brief item 19).
  return line
    .replace(/(?<=[\d)])\s*(?:(?:square |sq\.? )?units?(?:²|\^\{?2\}?)?|cm|mm|m|km|kg|g|s|[Mm]inutes|min|[Ss]econds|sec|[Hh]ours|h|°|[Dd]egrees|N|kN|J|kJ|W|kW|Pa|kPa|Hz|m\/s|ms⁻¹|ms\^?-1|m s⁻¹|m\/s²|m\/s\^?\{?2\}?|ms⁻²|ms\^?\{?-2\}?|m s⁻²|m s\^?\{?-2\}?)(?=[})\]]*\s*$)/, "")
    .trim();
}

function prepare(line: string): string {
  return dropUnit(tidy(line));
}

/**
 * A chemical formula written as a word of a label or a line ("O2", "H2O", "CO2", "C2H5OH"): element symbols with at
 * least one count. A capital letter and a number are a formula's symbol and count; a number before a letter ("3R",
 * "2x") is a coefficient, which is algebra.
 */
const FORMULA_WORD = String.raw`(?:[A-Z][a-z]?\d*)*[A-Z][a-z]?\d+(?:[A-Z][a-z]?\d*)*`;
/** A label's words: letters, or a formula (C2 D F01, 24 Sep 2026: "O2 molecules needed" was not a label). */
const LABEL_RE = new RegExp(String.raw`^((?:${FORMULA_WORD}|[A-Za-z]+)(?: +(?:${FORMULA_WORD}|[A-Za-z]+))* *(?:\([^()]*\))?)\s*=\s*`);

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
    return phrase.startsWith(sym) || phrase.endsWith(` ${sym}`) || initials(phrase).startsWith(sym.replace(/_/g, ""));
  }
  const words = (s: string) => s.split(" ").filter(Boolean).length;
  return !(words(x) >= 3 && words(y) >= 3);
}

export type FixMatch = { match: true; how: "line" | "value" } | { match: false; how: "none" };

const NONE: FixMatch = { match: false, how: "none" };
const LINE: FixMatch = { match: true, how: "line" };

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
  "(?:mm|cm|km|kg|mg|tonnes?|ms|min|minutes?|hours?|hrs?|days?|years?|seconds?|sec|degrees?|kN|kJ|MJ|kW|MW|Pa|kPa|Hz|kHz|mA|ohms?|mol|dm|ml|mL|litres?|square|sq|units?|m|g|t|s|h|K|N|J|W|V|A|C|l|L)";
const UNIT_POWER = "(?:\\^?\\{?[-−]?\\d\\}?|[²³]|⁻[¹²³])?";
const UNIT_TAIL = new RegExp(
  `(?:\\s*(?:°C|°|%|Ω)|\\s+${UNIT_WORD}${UNIT_POWER}(?:\\s*(?:/|per|\\s)\\s*${UNIT_WORD}${UNIT_POWER}){0,3})\\s*$`,
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
 * A value at the start of what follows an equals sign, when a few words and nothing more follow it ("= 17 directly",
 * "= −9/2, or as a decimal"): no operator, no glued term, and no further number, which would make the words a
 * clause of their own ("x = 20/3 it is 14, so …", "= 12.25. A scone is £1.40 …").
 */
const LEADING_VALUE = /^\s*([-−+]?\d+(?:\.\d+)?(?:\s*\/\s*\d+)?)(?=\s*[°%]?\s*[,;.]?\s*$|\s*[°%]?\s*[,;.]?\s+(?:[A-Za-z£][A-Za-z'-]*[,;.]?\s*){1,4}$)/;

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

/**
 * A value her line states in words at its end: "so the mean is 59", "corrected to 94.8", "which comes to 21.5 cm".
 * Only after one of these verbs, so a stray number ("banana 36.2") is still not a value.
 */
function copulaValue(s: string): Stated | null {
  // The value, then at most a unit or a short unit phrase ("48 press-ups", "58 loaves an hour", "22 cm").
  const m = /\b(?:is|are|was|equals|gives|giving|makes|becomes|comes to|to|totals?|totalling|sums? to|adds? up to)\s+(?:about\s+|approximately\s+)?([-−]?\d+(?:\.\d+)?(?:\s*\/\s*\d+)?)((?:\s*(?:°C|°|%)|(?:\s+[A-Za-z][A-Za-z'-]*[²³]?(?:\/[A-Za-z]{1,3}[²³]?)?){1,3})?)[.,;]*\s*$/i.exec(s);
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
    const penultParts = penult.split(/\s{2,}/);
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
      const lead = /^[A-Z][A-Za-z0-9 ()]{0,40}:\s+(.+)$/.exec(part.trim());
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
  if (!equationsMatch(typedBody, last, LINE_OPTS)) return false;
  try {
    return checkAlgebraic(asExpression(first), { answer: asExpression(last), mode: "equivalent" }).correct;
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

  const typedResult = resultOf(t, "typed");
  if (typedResult === null) return NONE;
  const lastLine = correction[correction.length - 1]!;
  /** A value to reach, as written, with the label of the clause that states it and the number it is the value of. */
  let targets: Array<Stated & { label: string | null; what: number | null }>;
  const last = clauses(lastLine);
  const finalClause = last[last.length - 1];
  const finalLabel = finalClause !== undefined ? splitLabel(finalClause).label : null;
  if (ctx) {
    // The flagged line's own corrected value (the correction line under the same label), and the final answer.
    const own = ctx.flaggedLabel === null ? [] : refs.flatMap((r) => (lineLabel(r) === ctx.flaggedLabel ? statedResults(r) : []));
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
  )
    ? { match: true, how: "value" }
    : NONE;
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
  const written = asWritten(typed);
  if (written.length === 0) return NONE;
  // A bare value ("= 7/33") is judged by what it is worth, not by where else it is written: her line 3 may end on
  // the value that corrects line 1 (conditional probability .03), which the value rules below settle.
  const bare = splitLabel(canon(typed));
  const bareValueLine = bare.label === null && bareValue(bare.body) !== null;
  if (!bareValueLine && item.studentWorking.some((w) => sameWritten(written, asWritten(w)))) return NONE;
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
  const result = fixMatches(asTyped(typed), [...authored, ...lines], { pieces: opts.pieces === true, exclude });
  if (result.how !== "value") return result;
  const last = lines[lines.length - 1] ?? "";
  return statesResult(last) ? result : NONE;
}
