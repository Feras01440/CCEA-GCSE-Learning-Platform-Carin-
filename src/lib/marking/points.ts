/**
 * Coordinate-pair answers: a simultaneous-equations solution (x, y), or the intersection points of a
 * line and a curve, where the pairing matters. A flat solution set would accept x = 1 with y = -6 when
 * the pairs are (1, 2) and (-3, -6); this marks the set of pairs as pairs.
 *
 * The spec is written as coordinate tuples: "(2, 3)" or "(1, 2), (-3, -6)". A learner may type tuples in
 * any order, or "x = 1, y = 2 or x = -3, y = -6" style assignments; components go through parseNumeric,
 * so fractions, decimals and surds are all fine. Pure.
 */
import { parseNumeric } from "./numeric";

export interface Point {
  x: number;
  y: number;
}

export type PointReason = "correct" | "missing" | "extra" | "crossed" | "wrong" | "unparseable";

export interface PointSetVerdict {
  correct: boolean;
  reason: PointReason;
  feedback: string;
  /** Pairs the learner gave, in the order written (empty when unparseable). */
  found: Point[];
  expected: Point[];
}

const TUPLE = /\(\s*([^,()]+?)\s*,\s*([^,()]+?)\s*\)/g;

/**
 * The LaTeX an author writes in a spec ("(2 + \sqrt{2}, 9 + 4\sqrt{2})"), turned into the plain spellings the
 * numeric parser reads ("2 + √2"). Harmless on text that carries no LaTeX.
 */
export function texToPlain(s: string): string {
  return s
    .replace(/\\left|\\right/g, "")
    // No brackets around the halves: a bracket inside a tuple would break the "(a, b)" pattern.
    .replace(/\\[dt]?frac\s*\{([^{}]*)\}\s*\{([^{}]*)\}/g, "$1/$2")
    .replace(/\\sqrt\s*\{([^{}]*)\}/g, "√$1")
    .replace(/\\sqrt\s*(\d+)/g, "√$1")
    .replace(/\\pi\b/g, "π")
    .replace(/\\times\b|\\cdot\b/g, "×")
    .replace(/\\[,;: ]|\\!/g, " ")
    .replace(/\^\{([^{}]*)\}/g, "^$1");
}

function num(s: string): number | null {
  const p = parseNumeric(texToPlain(s).trim());
  return p && Number.isFinite(p.value) ? p.value : null;
}

/** True when the text carries at least one "(a, b)" coordinate tuple with numeric components. */
export function looksLikePointList(text: string): boolean {
  TUPLE.lastIndex = 0;
  let m: RegExpExecArray | null;
  while ((m = TUPLE.exec(texToPlain(text))) !== null) {
    if (num(m[1]!) !== null && num(m[2]!) !== null) return true;
  }
  return false;
}

/**
 * Parses "(1, 2), (-3, -6)", "(1,2) and (-3,-6)", "x=1, y=2, x=-3, y=-6", "x = 1 and y = 2 or x = -3 and
 * y = -6", "x=1 y=2; x=-3 y=-6" into points. Returns null when nothing parses, or a value is not a number.
 */
export function parsePointList(text: string, names: readonly [string, string] = ["x", "y"]): Point[] | null {
  const src = texToPlain(text).replace(/[−–—]/g, "-").replace(/\s+/g, " ").trim();
  if (!src) return null;
  const points: Point[] = [];

  TUPLE.lastIndex = 0;
  let m: RegExpExecArray | null;
  while ((m = TUPLE.exec(src)) !== null) {
    const x = num(m[1]!);
    const y = num(m[2]!);
    if (x === null || y === null) return null;
    points.push({ x, y });
  }
  if (points.length > 0) return points;

  // Assignment form: gather `name = value` in reading order; a repeated name starts a new pair.
  const [nx, ny] = names;
  const assign = new RegExp(`(${nx}|${ny})\\s*=\\s*(.+?)(?=\\s*(?:,|;|\\band\\b|\\bor\\b|\\b(?:${nx}|${ny})\\s*=|$))`, "g");
  let cur: Partial<Point> = {};
  let a: RegExpExecArray | null;
  let seen = 0;
  while ((a = assign.exec(src)) !== null) {
    seen++;
    const key = a[1] === nx ? "x" : "y";
    const v = num(a[2]!);
    if (v === null) return null;
    if (cur[key] !== undefined) {
      if (cur.x === undefined || cur.y === undefined) return null;
      points.push({ x: cur.x, y: cur.y });
      cur = {};
    }
    cur[key] = v;
  }
  if (seen === 0) return null;
  if (cur.x === undefined || cur.y === undefined) return null;
  points.push({ x: cur.x, y: cur.y });
  return points;
}

function same(a: number, b: number, tol: number): boolean {
  return Math.abs(a - b) <= tol + 1e-9 * Math.max(Math.abs(a), Math.abs(b));
}

function fmt(p: Point): string {
  const f = (v: number) => (Number.isInteger(v) ? String(v) : String(Math.round(v * 1e6) / 1e6));
  return `(${f(p.x)}, ${f(p.y)})`;
}

export interface PointOptions {
  /** Absolute tolerance per coordinate (default 1e-6). */
  tolerance?: number;
  names?: readonly [string, string];
}

/** Marks a learner's pairs against the expected set of pairs. */
export function checkPoints(answer: string, expected: string | readonly Point[], opts: PointOptions = {}): PointSetVerdict {
  const tol = opts.tolerance ?? 1e-6;
  const names = opts.names ?? ["x", "y"];
  const exp = typeof expected === "string" ? (parsePointList(expected, names) ?? []) : [...expected];
  const found = parsePointList(answer, names);
  const [nx, ny] = names;
  const verdict = (correct: boolean, reason: PointReason, feedback: string, pts: Point[]): PointSetVerdict => ({ correct, reason, feedback, found: pts, expected: exp });

  if (!found || found.length === 0) {
    return verdict(false, "unparseable", `Give each pair as (${nx}, ${ny}), or as ${nx} = … and ${ny} = ….`, []);
  }

  const unmatched = [...exp];
  const extras: Point[] = [];
  for (const p of found) {
    const i = unmatched.findIndex((e) => same(e.x, p.x, tol) && same(e.y, p.y, tol));
    if (i >= 0) unmatched.splice(i, 1);
    else extras.push(p);
  }

  if (unmatched.length === 0 && extras.length === 0) {
    const n = exp.length;
    return verdict(true, "correct", n === 1 ? "Correct – the pair is right." : `Correct – all ${n} pairs found.`, found);
  }

  // Right values, wrong pairing: every extra point has its x in one expected pair and its y in another.
  const crossed =
    extras.length > 0 &&
    extras.every((p) => exp.some((e) => same(e.x, p.x, tol)) && exp.some((e) => same(e.y, p.y, tol)) && !exp.some((e) => same(e.x, p.x, tol) && same(e.y, p.y, tol)));
  if (crossed) {
    const hint = exp.map((e) => `${nx} = ${fmt(e).slice(1, -1).split(", ")[0]} goes with ${ny} = ${fmt(e).slice(1, -1).split(", ")[1]}`).join("; ");
    return verdict(false, "crossed", `The values are right but they are paired wrongly: ${hint}. Each ${ny} comes from its own ${nx}.`, found);
  }

  if (extras.length === 0 && unmatched.length > 0) {
    return verdict(false, "missing", `You have found ${exp.length - unmatched.length} of the ${exp.length} pairs – there ${unmatched.length === 1 ? "is one more" : `are ${unmatched.length} more`} to find.`, found);
  }
  if (unmatched.length === 0 && extras.length > 0) {
    return verdict(false, "extra", `The correct pair${exp.length === 1 ? " is" : "s are"} there, but ${extras.map(fmt).join(" and ")} ${extras.length === 1 ? "is" : "are"} not a solution – check by substituting back.`, found);
  }
  return verdict(false, "wrong", `${extras.map(fmt).join(" and ")} ${extras.length === 1 ? "is" : "are"} not right – check each coordinate against your working.`, found);
}
