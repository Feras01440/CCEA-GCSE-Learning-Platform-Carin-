/**
 * The working ladder: method marks awarded line by line from what she typed.
 *
 * A numeric, algebraic, equation or mcq part is marked all or nothing by `markAnswer`, so a learner
 * who reaches the method line and then slips on the arithmetic scores nothing of two
 * (docs/plan/review/2026-09-19-quality-bar.md, item 2). The scheme has already said what the first
 * mark is for — "MA1 for (1/3)π(6)²(15) seen" — and she can type that line. This module reads her
 * typed working against the scheme's method and process points and says which of them are evidenced.
 *
 * What it will and will not do:
 *   - only M, MA, MW, W and P points are on the ladder; an A or B point is accuracy, and accuracy is
 *     the answer's own mark, never the working's;
 *   - a point is awarded once, to the first point that a line evidences, and a line is spent when it
 *     is used, so one line cannot pay for two marks;
 *   - the total can never exceed the method marks the scheme actually carries.
 *
 * The comparison is the one the faded worked examples and find-the-mistake already use for a typed
 * line (`stepLineMatches`): the whole line as written, or the value it ends on when the evidence line
 * states a result. A substitution line states no result — "(1/3)π(6)²(15)" ends on a factor, not on an
 * answer — so it must be matched as a line, and a string normaliser cannot tell "(6)²(15)" from
 * "6² × 15". Where both sides are maths and neither is prose, the algebra engine settles it by
 * equivalence, which is what "or equivalent" in the scheme means anyway.
 *
 * Pure: no React, no database, no verdicts. `markAnswer` keeps the last word on whether the answer is
 * right; the ladder only adds the marks the working earned underneath it.
 */
import type { MarkPoint } from "@/lib/content/schema";
import { chainStates, evaluateArithmetic, hasMatrixProduct, holdsMaths, mathsKey, resultValue, statementsOf, stepLineMatches, workingLines } from "@/components/items/mistake-marking";
import { solutionLineFor } from "@/components/topic/reteach";
import { checkAlgebraic } from "@/lib/marking/algebra";

/** M, MA, MW, W, P are method and process; A, B, L and QWC are not on the ladder. */
const METHOD_CODE = /^[MWP]/;

export interface MethodStep {
  id: string;
  /** The chip the scheme is printed with, as the mark scheme block renders it: "MA1", "M2", "P1". */
  code: string;
  marks: number;
  /** The mark point in the scheme's own words, with its "seen" / "oe" boilerplate trimmed off. */
  for: string;
  /** Every line that can evidence it: the mark point's own wording (each alternative separately), its
   *  authored `accept` spellings, and the worked-solution line paired with it when that is unambiguous. */
  evidence: string[];
}

export interface EarnedMark {
  id: string;
  /** "MA1", in the scheme's own code, for the line under the marks. */
  code: string;
  marks: number;
  /** What the scheme gives it for, cleaned for display. */
  for: string;
  /** The line she typed that evidenced it. */
  matchedLine: string;
}

export interface WorkingMarks {
  earned: EarnedMark[];
  /** Method marks earned, never more than `available`. */
  marks: number;
  /** Method and process marks the scheme carries. */
  available: number;
}

/**
 * Mark-scheme boilerplate that is instruction to the examiner rather than the line itself:
 * "… seen", "… oe", "… or equivalent", "… shown". Stripped from the end, repeatedly, so
 * "(2/3)π(9)³ seen oe" comes down to "(2/3)π(9)³".
 */
const BOILERPLATE =
  /[\s,;]*\b(?:oe|o\.?e\.?|or equivalent|seen|shown|stated|used|identified|indicated|obtained|reached|attempted|either order|any order)\b\.?\s*$/i;

/** A trailing examiner aside — "(accept 180π)", "(allow 179.9 – 180.1)", "(ignore units)". */
const ASIDE = /\s*\((accept|allow|condone|ignore|or)\b([^()]*)\)\s*$/i;

/** The mark point's wording without the scheme's boilerplate, plus anything an aside said to accept. */
function cleanStepText(text: string): { text: string; accepts: string[] } {
  let s = text.trim();
  const accepts: string[] = [];
  for (let guard = 0; guard < 4; guard += 1) {
    const aside = ASIDE.exec(s);
    if (aside) {
      const keyword = aside[1]!.toLowerCase();
      const inner = (aside[2] ?? "").trim();
      // "accept", "allow" and "or" name another spelling that earns the mark; "ignore" and "condone" do not.
      if ((keyword === "accept" || keyword === "allow" || keyword === "or") && inner.length > 0) accepts.push(inner);
      s = s.slice(0, aside.index).trim();
      continue;
    }
    const without = s.replace(BOILERPLATE, "").trim();
    if (without === s) break;
    s = without;
  }
  return { text: s, accepts };
}

/** "A or B" in a mark point is two acceptable lines, not one. Brackets are respected, so "(1/2) or x" splits but "(a or b)" does not. */
function alternatives(text: string): string[] {
  const parts: string[] = [];
  let depth = 0;
  let start = 0;
  for (let i = 0; i < text.length; i += 1) {
    const c = text[i];
    if (c === "(" || c === "[" || c === "{") depth += 1;
    else if (c === ")" || c === "]" || c === "}") depth = Math.max(0, depth - 1);
    else if (depth === 0 && /\s/.test(c)) {
      const m = /^\s+or\s+/i.exec(text.slice(i));
      if (m) {
        parts.push(text.slice(start, i));
        start = i + m[0].length;
        i = start - 1;
      }
    }
  }
  parts.push(text.slice(start));
  return parts.map((p) => cleanStepText(p).text).filter((p) => p.length > 0);
}

/** Function names that are maths even though they are letters; anything else wordy is prose. */
const FUNCTION_WORDS = /\b(?:arcsin|arccos|arctan|sinh|cosh|tanh|sin|cos|tan|sec|cosec|csc|cot|log|ln|exp|sqrt|abs|pi)\b/gi;

/** A fragment worth matching against: long enough to mean something, and doing something to its terms. */
function substantial(fragment: string): boolean {
  const flat = fragment.replace(/\s+/g, "");
  // A lone bracket ("(x + 3)") is a factor that sits in the question, the working and the answer alike, so it is never
  // evidence on its own (trial audit MK-04: "(x+3)" alone paid "(x + 3) cancelled").
  if (/^\([^()]*\)$/.test(flat)) return false;
  return flat.length >= 4 && /[+\-−×÷/^√()=²³]/.test(flat);
}

/** One pair of brackets (round or square) round the whole of a piece of maths is only its grouping. */
function unwrap(maths: string): string {
  const t = maths.trim();
  const open = t[0];
  const close = open === "(" ? ")" : open === "[" ? "]" : null;
  if (close === null || t[t.length - 1] !== close) return t;
  let depth = 0;
  for (let i = 0; i < t.length - 1; i += 1) {
    if (t[i] === "(" || t[i] === "[") depth += 1;
    else if (t[i] === ")" || t[i] === "]") depth -= 1;
    if (depth === 0) return t;
  }
  return t.slice(1, -1).trim();
}

/**
 * A point's maths written "A over B" ("5(x + 4) over (x + 4)(x − 4)", "2(x − 2) over (x + 3)") is one fraction: a
 * line evidences it only when it holds both A and B (`evidences`). The parts are kept joined by this mark.
 */
const OVER = "\u241F";

/**
 * A point's example, "e.g. (73 − 37)/(4 − 1)", stands for any working of the same shape that comes to the same value:
 * the points she reads off the line may be other points on it ("(85 − 25)/(5 − 0)"), and the method is the same (the QA
 * fixer, 25 Sep 2026: such points were never paid). Kept with this mark in front.
 */
const EXAMPLE = "\u2042";

/** The shape of a stretch of arithmetic: its numbers blanked, so "(73 − 37)/(4 − 1)" and "(85 − 25)/(5 − 0)" agree. */
function arithmeticShape(maths: string): string {
  return mathsKey(maths).replace(/\d+(?:\.\d+)?/g, "#");
}

/**
 * Most mark points are written the way an examiner writes them: a phrase and then the maths
 * ("lowest common denominator $x(x+1)$", "each numerator multiplied up: 2x + 2 and 3x"). She types the
 * maths, not the phrase, so the maths in a point is offered as evidence alongside the point itself —
 * the `$…$` spans where the author used them, otherwise the runs left between the prose words. Short
 * or bare fragments ("3x", "18") are dropped: a mark must not fall out of one loose term.
 */
function mathsFragments(pointText: string): string[] {
  let text = pointText;
  const tex = [...text.matchAll(/\$([^$]+)\$/g)].map((m) => m[1]!.trim()).filter((s) => s.length > 0);
  if (tex.length > 0) return tex.filter(substantial).map((s) => `$${s}$`);
  // "e.g. (73 − 37)/(4 − 1)": what an example introduces is marked, so it is read as an example (`EXAMPLE`).
  text = text.replace(/\b(?:e\.\s?g\.?|for example|for instance)[,:]?\s*/gi, EXAMPLE);
  // Prose words split the line; function names are maths and do not.
  const marked = text.replace(FUNCTION_WORDS, (w) => "\u0000".repeat(w.length));
  const chunks: string[] = [];
  // overAfter[i]: the word after chunk i is "over", so chunk i and chunk i + 1 are one fraction's top and bottom.
  const overAfter: boolean[] = [];
  let at = 0;
  for (const m of marked.matchAll(/[A-Za-z]{3,}/g)) {
    chunks.push(text.slice(at, m.index));
    overAfter.push(/^over$/i.test(m[0]));
    at = m.index + m[0].length;
  }
  chunks.push(text.slice(at));
  overAfter.push(false);
  // What a colon introduces is the maths ("by 6 (or 12): 3(x + 4) + 2(x − 1) = 30" is the equation after it), and
  // two-letter words left between the prose ("by", "or") are not part of it (23 Sep 2026).
  // The same holds for a two-letter word left at either end of a run ("10x² − 15x + 4x − 6, or" before "one correct
  // bracket seen" is the expansion, not the expansion and a word).
  const joiner = /^(?:(?:or|by|to|of|as|at|in|is|on|if)\b[\s,;:.]*)+|[\s,;:.]+(?:or|by|to|of|as|at|in|is|on|if)$/gi;
  const tidy = (c: string) => (c.split(/:\s+/).pop() ?? c).replace(/^[\s:;,.]+|[\s:;,.]+$/g, "").replace(joiner, "").replace(/^[\s:;,.]+|[\s:;,.]+$/g, "");
  const out: string[] = [];
  for (let i = 0; i < chunks.length; i += 1) {
    const top = tidy(chunks[i]!);
    if (overAfter[i] && i + 1 < chunks.length) {
      // The bottom runs to the first comma or clause break: "(x + 3), with no common factor left". Only maths is
      // joined ("a difference over a difference" is words, and the chunk after it keeps its own fragments). A pair of
      // brackets round the whole of a part is its grouping: "[2(x + 1)(x − 2) + 3(x − 2) − (x + 1)]".
      // Words over maths ("all three terms over (x + 1)(x − 2)") name only the bottom: the group then asks for a fraction
      // with that denominator, never for the bracket anywhere in a line. What follows the bottom's comma is left to be
      // read on its own.
      const [head = "", ...tail] = chunks[i + 1]!.split(/[,;]/);
      const bottom = unwrap(tidy(head));
      const t = unwrap(top);
      if (/[\d()]/.test(bottom)) {
        out.push(`${/[\d()]/.test(t) ? t : ""}${OVER}${bottom}`);
        chunks[i + 1] = tail.join(",");
        continue;
      }
    }
    if (top.startsWith(EXAMPLE)) {
      const example = top.slice(EXAMPLE.length).trim();
      if (substantial(example)) out.push(`${EXAMPLE}${example}`);
      continue;
    }
    if (substantial(top)) out.push(top);
  }
  return out;
}

/**
 * The method and process points of a scheme with the lines that evidence them. The worked solution is
 * read through `solutionLineFor`, the pairing the re-teach panel already uses: only an unambiguous
 * line is taken, because a line put under the wrong mark point would pay for a mark she has not earned.
 */
export function methodSteps(scheme: readonly MarkPoint[], workedSolution = ""): MethodStep[] {
  return scheme
    .filter((p) => METHOD_CODE.test(p.code))
    .map((p) => {
      const cleaned = cleanStepText(p.for);
      const evidence = new Set<string>(alternatives(cleaned.text));
      for (const a of cleaned.accepts) evidence.add(a);
      for (const a of p.accept ?? []) {
        const c = cleanStepText(a).text;
        if (c.length > 0) evidence.add(c);
      }
      for (const f of mathsFragments(cleaned.text)) evidence.add(f);
      const line = workedSolution ? solutionLineFor({ for: cleaned.text }, workedSolution) : null;
      if (line) evidence.add(line);
      return { id: p.id, code: `${p.code}${p.marks}`, marks: p.marks, for: cleaned.text, evidence: [...evidence] };
    });
}

/**
 * Is this line an expression the algebra engine can be trusted with? It must carry some maths, and it
 * must not carry prose: a mark point phrased as an instruction ("read from the line inside the box")
 * would otherwise be sampled as a product of single letters and could agree with anything.
 */
function looksLikeMaths(line: string): boolean {
  const bare = line.replace(FUNCTION_WORDS, " ");
  if (!/\d/.test(bare)) return false;
  if (/[A-Za-z]{3,}/.test(bare)) return false;
  return /[+\-*/^×÷√π()]/.test(bare) || /\d\s*[²³]/.test(bare);
}

/** A trailing unit ("cm³", "m/s", "°") is not part of the expression. */
const TRAILING_UNIT = /\s*\b(?:cm|mm|m|km|kg|g|s|ml|l|N|J|W|V|A|Pa|Hz|°C|°)\s*[²³]?(?:\/[A-Za-z]{1,3}[²³]?)?\s*$/;

/** "V = 1/3π(6)²(15)" is the same substitution as "1/3π(6)²(15)"; the label is hers to write or not. */
const LABEL = /^[A-Za-z][A-Za-z ]*\s*=\s*/;

/** The plain, unlabelled, unit-free expression on a line, or null when there is nothing to compare. */
function expressionOf(line: string): string | null {
  const plain = workingLines(line).join(" ").trim();
  if (plain.length === 0) return null;
  const bare = plain.replace(LABEL, "").replace(TRAILING_UNIT, "").trim();
  return bare.length > 0 ? bare : null;
}

/**
 * Do two maths lines say the same thing? The algebra engine is asked only when both sides are
 * expressions rather than prose — it is what settles "(1/3)π(6)²(15)" against "1/3 × π × 6² × 15",
 * which no string normalisation can, and it is the same engine `markAnswer` marks an algebraic
 * answer with. Never throws: an unparseable line is simply not a match.
 */
function equivalentMaths(typed: string, evidence: string): boolean {
  const a = expressionOf(typed);
  const b = expressionOf(evidence);
  if (a === null || b === null) return false;
  if (!looksLikeMaths(a) || !looksLikeMaths(b)) return false;
  // A chain ("a = b = c") or a list of roots is not one equation; those are read side by side elsewhere. Matrices
  // do not commute, so a product of them ("A^-1 B") is never settled by the algebra engine.
  if ((a.match(/=/g) ?? []).length > 1 || (b.match(/=/g) ?? []).length > 1) return false;
  if (hasMatrixProduct(a) || hasMatrixProduct(b)) return false;
  // An expression is the working a mark point names only in the same number of terms: "10x² − 15x + 4x − 6" is the
  // middle term split, and "10x² − 11x − 6", equal to it, is the question restated (23 Sep 2026).
  if (!/=/.test(a) && !/=/.test(b) && termCount(a) !== termCount(b)) return false;
  try {
    // Two statements that are simply true — "40.8407 + 26 = 66.8407" and "360 − 130 = 230", or two identities such
    // as "x² + 6x + 13 = (x + 3)² + 4" and "x² − 10x + 32 = (x − 5)² + 7" — are "equivalent" as equations (both
    // come down to 0 = 0) and say nothing alike. For those the sides are compared, side for side (23 Sep 2026:
    // reading a line by its statements put such pairs in front of the engine, and it paid for them).
    if (/=/.test(a) && /=/.test(b) && (isIdentity(a) || isIdentity(b))) return sidesEquivalent(a, b);
    const v = checkAlgebraic(a, { answer: b, mode: "equivalent" });
    return v.correct;
  } catch {
    return false;
  }
}

/** The terms an expression adds at its top level: a sign inside brackets, or after an operator, starts none. */
function termCount(expr: string): number {
  const s = expr.replace(/\s+/g, "");
  let depth = 0;
  let n = 1;
  for (let i = 0; i < s.length; i += 1) {
    const c = s[i]!;
    if ("([{".includes(c)) depth += 1;
    else if (")]}".includes(c)) depth -= 1;
    else if (depth === 0 && i > 0 && "+-−".includes(c) && !/[\^*/×÷·(+\-−]/.test(s[i - 1]!)) n += 1;
  }
  return n;
}

/** Is an equation true whatever its letters are (its sides the same expression), or a plain arithmetic fact? */
function isIdentity(equation: string): boolean {
  const sides = equation.split("=");
  if (sides.length !== 2) return true;
  // No unknown at all: a sum written out ("(1/3)π(9)²(24) = 2035.8"), true or rounded, is a fact, not an equation.
  if (!/[A-Za-z]/.test(equation.replace(FUNCTION_WORDS, " ").replace(/π|\bpi\b/gi, " "))) return true;
  try {
    return checkAlgebraic(sides[0]!, { answer: sides[1]!, mode: "equivalent" }).correct;
  } catch {
    return true;
  }
}

/** The same sides, in order or swapped ("y + 8 = 5x" and "5x = y + 8"), each pair the same expression. */
function sidesEquivalent(a: string, b: string): boolean {
  const x = a.split("=");
  const y = b.split("=");
  if (x.length !== y.length) return false;
  const same = (p: string, q: string) => {
    try {
      return checkAlgebraic(p, { answer: q, mode: "equivalent" }).correct;
    } catch {
      return false;
    }
  };
  if (x.every((s, i) => same(s, y[i]!))) return true;
  return x.length === 2 && same(x[0]!, y[1]!) && same(x[1]!, y[0]!);
}

/** Does one typed statement evidence one authored line, as a whole? */
function evidencesWhole(typed: string, evidence: string): boolean {
  // The faded worked examples' comparator first: the whole line as written, or the value it ends on
  // when the evidence line states a result. `stepLineMatches` already refuses a value match against an
  // evidence line that states none (a substitution line states none); the guard here is that a value is
  // only evidence when both lines really do arrive at one. "x + 1" must not pay for "$c = 1$", and
  // "x = (y+8)/5" must not pay for "$y + 8 = 5x$" on the strength of a shared coefficient.
  const m = stepLineMatches(typed, evidence);
  if (m.match) {
    if (m.how !== "value") return true;
    // The comparer's own value reading decides whether each line arrives at a value ("the mean is 48 press-ups"
    // does; "x + 1" and "y + 8 = 5x" do not), the same reading the fix box and the worked steps use.
    return resultValue(workingLines(typed).join(" "), "typed") !== null && resultValue(workingLines(evidence).join(" "), "authored") !== null;
  }
  return equivalentMaths(typed, evidence);
}

/**
 * The evidence as a stretch of maths worth finding inside a longer line: an equation with no prose that does
 * something to its terms — "4x² = (2x)²", "60/2 = 30" — not a bare "x = 20" or "= 100", which a line can hold while
 * doing something else entirely ("At x = 20 this is 1/5").
 */
function findableMaths(evidence: string): string | null {
  const plain = workingLines(evidence).join(" ");
  // "and" / "or" join a list of results ("x = −1 and x = 5"); any other word is prose.
  if (/[A-Za-z]{3,}/.test(plain.replace(FUNCTION_WORDS, " ").replace(/\b(?:and|or)\b/gi, " "))) return null;
  // A list of the same letter's values ("x = −1 and x = 5") is a result no other working states, so it is found as it
  // stands; any other stretch must do something to its terms.
  const list = /(?<![\w.])([A-Za-z])\s*=[^=]*\b(?:or|and)\s+\1\s*=/.test(plain);
  if (!list && !/[\w)²³]\s*[+\-−*/^×÷]\s*[\w(√]/.test(plain)) return null;
  const key = mathsKey(evidence);
  const size = key.replace(/¦/g, "").length;
  // An equation of four characters says something; a bare expression must be long enough to be this working and
  // no other ("2x² + 6x + x + 3", not "(x + 2)" or "5/14", which a line can hold on its way to something else).
  if (/=/.test(key)) return size >= 4 ? key : null;
  // A bracket pair such as "(x − 3)(x + 2)" is a denominator in one line and a factorised numerator in the next, so
  // an expression is found inside a line only when it is a real piece of working (three operations or more).
  const operators = (key.match(/[+\-*/^×÷]/g) ?? []).length;
  return size >= 8 && operators >= 3 ? key : null;
}

/**
 * Is the evidence, an expression, one whole side of a chain she wrote ("V = (1/3)π(6)²(15) = 565.5" has the
 * substitution as a side)? A lone value is not: "7/33" in "7/33 subtracted from 1" is not the working that mark is for.
 */
function sideOfChain(typed: string, evidence: string): boolean {
  const plain = workingLines(evidence).join(" ");
  if (/=/.test(plain) || !/[\w)²³]\s*[+\-−*/^×÷]\s*[\w(√]/.test(plain)) return false;
  // A fraction not in its lowest terms ("5/100" on the way from "5/(4 × 25)" to "1/20") is working, not a value
  // anyone states as a result, so it may stand as a side; a fraction in lowest terms is a value and may not.
  const fraction = /^(\d+)\/(\d+)$/.exec(mathsKey(evidence));
  const gcd = (a: number, b: number): number => (b === 0 ? a : gcd(b, a % b));
  const working = fraction !== null && gcd(+fraction[1]!, +fraction[2]!) > 1;
  if (!working && resultValue(plain, "typed") !== null) return false;
  return statementsOf(typed).some((s) => {
    const sides = s.split("=").map((x) => x.trim());
    return sides.length > 1 && sides.some((side) => stepLineMatches(side, evidence).how === "line");
  });
}

/**
 * Does one typed line evidence one authored line? As a whole first; then, since a line of working is often
 * several statements ("Taking logs: 2x log 5 = (x + 4) log 3", "60/2 = 30, so read across from 30"), by any one of
 * its statements, by a chain of equal sides that states the evidence ("√48 = √16√3 = 4√3" for "√48 = 4√3"), or by
 * the evidence's maths standing whole inside it (engine brief item 1, 23 Sep 2026). The old comparer found many of
 * these only because two lines happened to end on the same number — and paid "y = 8" for "dy/dx = −4x + 8" the
 * same way; it no longer reads the last number of a line as its value, so the working is read for what it says.
 */
function evidences(typed: string, evidence: string): boolean {
  if (typed.trim().length === 0 || evidence.trim().length === 0) return false;
  // A fraction written "A over B" in the point: her line must hold its top and its bottom.
  if (evidence.startsWith(EXAMPLE)) {
    const example = evidence.slice(EXAMPLE.length);
    const value = evaluateArithmetic(example);
    if (value === null) return false;
    return workingLines(typed)
      .join(" ")
      .split("=")
      .some((side) => {
        const v = evaluateArithmetic(side.trim());
        return v !== null && arithmeticShape(side) === arithmeticShape(example) && Math.abs(v - value) <= 1e-9 * Math.max(1, Math.abs(value));
      });
  }
  if (evidence.includes(OVER)) {
    // A fraction she wrote whose top holds the point's top (when it names one) and whose bottom holds its bottom.
    const [top = "", bottom = ""] = evidence.split(OVER);
    const plain = workingLines(typed).join(" ");
    const asFraction = plain.split("=").some((side) => {
      const parts = fractionParts(side);
      if (parts.length !== 2) return false;
      return (top.trim() === "" || holdsMaths(mathsKey(parts[0]!), mathsKey(top))) && holdsMaths(mathsKey(parts[1]!), mathsKey(bottom));
    });
    if (asFraction) return true;
    // Or both written out in one line, neither inside the other ("the numerator gives 5(x + 4) and the denominator gives
    // (x + 4)(x − 4)"): each part must be working in its own right, and the bottom must stand outside the top.
    if (top.trim() === "" || !substantial(top) || !substantial(bottom)) return false;
    const key = mathsKey(plain);
    const topKey = mathsKey(top);
    const at = key.indexOf(topKey);
    if (at < 0 || !holdsMaths(key, topKey)) return false;
    const rest = `${key.slice(0, at)}¦${key.slice(at + topKey.length)}`;
    return holdsMaths(rest, mathsKey(bottom));
  }
  if (evidencesWhole(typed, evidence)) return true;
  // Even a one-statement line is read as its statement: "So L = …" states "L = …".
  if (statementsOf(typed).some((p) => evidencesWhole(p, evidence) || chainStates(p, evidence))) return true;
  if (chainStates(typed, evidence) || sideOfChain(typed, evidence)) return true;
  // The top or the bottom of a fraction she wrote is a whole piece of working: "2(x+3)(x-2)/(x+3)^2" shows the
  // numerator factorised (trial audit MK-04: the factorised line a candidate writes paid nothing).
  // Only a piece of algebra or working counts: a bare number on top or underneath ("1/100", "649/11") is a value on the
  // way to another, not the evidence a point's "1" or "n = 11" names (the corpus guard's catch, 25 Sep 2026).
  if (
    workingLines(typed)
      .join(" ")
      .split("=")
      .some((side) => fractionParts(side).some((part) => /[A-Za-z(]/.test(part) && substantial(part) && evidencesWhole(part, evidence)))
  )
    return true;
  const maths = findableMaths(evidence);
  return maths !== null && holdsMaths(mathsKey(typed), maths);
}

/** The top and bottom of a side written as one fraction, "N/D" with a single "/" outside brackets; else none. */
function fractionParts(side: string): string[] {
  const s = side.trim();
  let depth = 0;
  let slash = -1;
  for (let i = 0; i < s.length; i += 1) {
    const c = s[i];
    if (c === "(") depth += 1;
    else if (c === ")") depth -= 1;
    else if (c === "/" && depth === 0) {
      if (slash >= 0) return [];
      slash = i;
    }
  }
  if (slash <= 0 || slash === s.length - 1) return [];
  const bare = (x: string) => {
    const t = x.trim();
    // One pair of brackets round the whole of a part is only its grouping: "((x+4)(x-4))" is "(x+4)(x-4)".
    if (/^\(.*\)$/.test(t)) {
      let d = 0;
      for (let i = 0; i < t.length - 1; i += 1) {
        if (t[i] === "(") d += 1;
        else if (t[i] === ")") d -= 1;
        if (d === 0) return t;
      }
      return t.slice(1, -1);
    }
    return t;
  };
  return [bare(s.slice(0, slash)), bare(s.slice(slash + 1))].filter((p) => p.length > 0);
}

/**
 * The method marks her typed working evidences. Each point is awarded at most once and each line is
 * spent at most once: walking the scheme in its authored order, a line that would evidence two points
 * pays for the first of them only, and the second must be written out on its own line to be earned.
 * Nothing here awards an accuracy mark, and nothing here exceeds the scheme's own method total.
 */
export function markWorking(typedLines: readonly string[], scheme: readonly MarkPoint[], workedSolution = ""): WorkingMarks {
  const steps = methodSteps(scheme, workedSolution);
  const available = steps.reduce((s, p) => s + p.marks, 0);
  const lines = typedLines.map((l) => l.trim()).filter((l) => l.length > 0);
  const spent = new Set<number>();
  const earned: EarnedMark[] = [];
  for (const step of steps) {
    let found = false;
    for (let i = 0; i < lines.length; i += 1) {
      if (spent.has(i)) continue;
      if (!step.evidence.some((e) => evidences(lines[i]!, e))) continue;
      spent.add(i);
      earned.push({ id: step.id, code: step.code, marks: step.marks, for: step.for, matchedLine: lines[i]! });
      found = true;
      break;
    }
    if (found) continue;
    // A fraction's top and bottom written on lines of their own ("5(x+4)", then "(x+4)(x-4)") show it as well as one
    // line does; both lines are spent.
    // Each part must be working in its own right: a lone "(x + 3)" on a line is not the bottom of an answer.
    for (const group of step.evidence.filter((e) => e.includes(OVER) && e.split(OVER).every((part) => substantial(part)))) {
      const at = group.split(OVER).map((part) => lines.findIndex((l, i) => !spent.has(i) && holdsMaths(mathsKey(l), mathsKey(part))));
      if (at.some((i) => i < 0) || new Set(at).size !== at.length) continue;
      at.forEach((i) => spent.add(i));
      earned.push({ id: step.id, code: step.code, marks: step.marks, for: step.for, matchedLine: at.map((i) => lines[i]!).join("; ") });
      break;
    }
  }
  // A scheme's dependsOn is not applied here (tried 25 Sep 2026 for MK-04 and withdrawn): a prerequisite written in
  // words the ladder cannot find ("two brackets expanded correctly, e.g. …", "v = u + at with v = 0 …") would take
  // away marks right working has earned, 385 of them across the corpus guard's worked solutions.
  const marks = Math.min(available, earned.reduce((s, e) => s + e.marks, 0));
  return { earned, marks, available };
}

/**
 * The part's award once the ladder has read her working. A right answer keeps the marks it has. A wrong one keeps
 * the higher of its own award and the working's, but never every mark: the answer is wrong, so at least its mark is
 * not there (trial audit MK-04: a wrong answer was paid 4 of 4 from its working).
 */
export function ladderTotal(marked: { correct: boolean; marksAwarded: number }, workingMarks: number | null, partMarks: number): number {
  if (marked.correct || workingMarks === null) return marked.marksAwarded;
  return Math.max(marked.marksAwarded, Math.min(partMarks - 1, workingMarks));
}

/** The textarea's contents as the lines to mark. Blank lines are hers to space the working with. */
export function workingToLines(raw: string): string[] {
  return raw.replace(/\r/g, "").split("\n").map((l) => l.trim()).filter((l) => l.length > 0);
}
