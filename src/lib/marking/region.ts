/**
 * Marking for `graph` answers with plot "region": a set of linear inequalities describes the region to shade.
 * The field draws the boundary lines and she taps one point inside the region she would shade; the tap fixes
 * a side of every boundary at once, which is exactly the decision the exam marks (the line, then the side).
 * Each inequality her point satisfies is one element; the feedback names the boundary she is on the wrong
 * side of, with a test point. Pure; no content dependencies.
 */

export interface Inequality {
  /** a·x + b·y (op) c */
  a: number;
  b: number;
  c: number;
  op: "<=" | ">=" | "<" | ">";
  /** As written in the spec, for feedback. */
  text: string;
}

export type Pt = readonly [number, number];

const OPS: Array<[RegExp, Inequality["op"]]> = [
  [/≤|<=|⩽/, "<="],
  [/≥|>=|⩾/, ">="],
  [/</, "<"],
  [/>/, ">"],
];

/** Coefficients of a linear expression in x and y, e.g. "x + 2y", "3 - y", "2x − y + 1". */
function linear(expr: string): { x: number; y: number; k: number } | null {
  const s = expr.replace(/[−–]/g, "-").replace(/\s+/g, "").replace(/\*/g, "");
  if (!s) return null;
  const out = { x: 0, y: 0, k: 0 };
  const terms = s.match(/[+-]?[^+-]+/g);
  if (!terms) return null;
  for (const t of terms) {
    // "2y", "x", "3", "1/2x", "x/2", "0.5y"
    const m = t.match(/^([+-]?)(\d*\.?\d*)(?:\/(\d+))?([xy])?(?:\/(\d+))?$/);
    if (!m) return null;
    const sign = m[1] === "-" ? -1 : 1;
    let coef = m[2] === "" ? 1 : Number(m[2]);
    if (m[3]) coef /= Number(m[3]);
    if (m[5]) coef /= Number(m[5]);
    if (!Number.isFinite(coef)) return null;
    if (m[4] === "x") out.x += sign * coef;
    else if (m[4] === "y") out.y += sign * coef;
    else {
      if (m[2] === "") return null;
      out.k += sign * coef;
    }
  }
  return out;
}

/** "x + 2y ≤ 6", "y ≤ x", "x ≥ 1", "y > 2x - 1" → a·x + b·y (op) c. Null when it is not a linear inequality. */
export function parseInequality(text: string): Inequality | null {
  const t = text.replace(/\$/g, "").replace(/\\le(?:q)?\b/g, "≤").replace(/\\ge(?:q)?\b/g, "≥").replace(/\\l[t]\b/g, "<").replace(/\\gt\b/g, ">").trim();
  const found = OPS.find(([re]) => re.test(t));
  if (!found) return null;
  const [re, op] = found;
  const parts = t.split(re);
  if (parts.length !== 2) return null;
  const lhs = linear(parts[0]!);
  const rhs = linear(parts[1]!);
  if (!lhs || !rhs) return null;
  const a = lhs.x - rhs.x;
  const b = lhs.y - rhs.y;
  const c = rhs.k - lhs.k;
  if (a === 0 && b === 0) return null;
  return { a, b, c, op, text: text.trim() };
}

/** Signed value a·x + b·y − c at a point: negative on the "≤" side, positive on the "≥" side, zero on the line. */
export const boundaryValue = (q: Inequality, p: Pt): number => q.a * p[0] + q.b * p[1] - q.c;

export function satisfies(q: Inequality, p: Pt): boolean {
  const v = boundaryValue(q, p);
  switch (q.op) {
    case "<=":
      return v <= 1e-9;
    case ">=":
      return v >= -1e-9;
    case "<":
      return v < -1e-9;
    case ">":
      return v > 1e-9;
  }
}

export interface RegionExpect {
  plot: "region";
  inequalities: readonly string[];
  shadeInside?: boolean;
}

export interface RegionVerdict {
  correct: boolean;
  earned: number;
  total: number;
  feedback: string;
}

export function formatRegionResponse(point: Pt): string {
  return JSON.stringify({ point: [point[0], point[1]] });
}

export function parseRegionResponse(raw: string): Pt | null {
  const t = raw.trim();
  if (!t.startsWith("{")) return null;
  try {
    const o = JSON.parse(t) as { point?: unknown };
    const p = o.point;
    if (Array.isArray(p) && p.length === 2 && typeof p[0] === "number" && typeof p[1] === "number" && Number.isFinite(p[0]) && Number.isFinite(p[1])) return [p[0], p[1]];
    return null;
  } catch {
    return null;
  }
}

const fmtN = (n: number): string => (Number.isInteger(n) ? String(n) : String(Math.round(n * 1000) / 1000)).replace("-", "−");

/** A lattice test point on the correct side of the boundary, for the feedback ("test with (0, 0)"). */
function testPoint(q: Inequality): Pt | null {
  const candidates: Pt[] = [[0, 0], [1, 1], [0, 1], [1, 0], [2, 2], [3, 1], [1, 3], [4, 4], [0, 5], [5, 0], [6, 6]];
  return candidates.find((p) => satisfies(q, p) && Math.abs(boundaryValue(q, p)) > 1e-9) ?? null;
}

/** The boundary as an equation for the feedback: "x + 2y = 6". */
export function boundaryEquation(q: Inequality): string {
  const term = (coef: number, sym: string, first: boolean): string => {
    if (coef === 0) return "";
    const mag = Math.abs(coef) === 1 ? "" : fmtN(Math.abs(coef));
    if (first) return `${coef < 0 ? "−" : ""}${mag}${sym}`;
    return ` ${coef < 0 ? "−" : "+"} ${mag}${sym}`;
  };
  const lhs = `${term(q.a, "x", true)}${term(q.b, "y", q.a === 0)}`.trim();
  return `${lhs} = ${fmtN(q.c)}`;
}

/** Marks the tapped point against every inequality. */
export function checkRegion(raw: string, expect: RegionExpect): RegionVerdict {
  const parsed = expect.inequalities.map((s) => parseInequality(s));
  const total = expect.inequalities.length;
  if (parsed.some((q) => q === null)) {
    return { correct: false, earned: 0, total, feedback: "There is a problem with this question's inequalities; please report it." };
  }
  const qs = parsed as Inequality[];
  const point = parseRegionResponse(raw);
  if (!point) return { correct: false, earned: 0, total, feedback: "Nothing was shaded yet." };
  const onLine = qs.find((q) => Math.abs(boundaryValue(q, point)) <= 1e-9);
  if (onLine) {
    return { correct: false, earned: 0, total, feedback: `Your point sits on the line ${boundaryEquation(onLine)}; tap a point clearly inside the region instead.` };
  }
  const failing = qs.filter((q) => !satisfies(q, point));
  const earned = total - failing.length;
  if (failing.length === 0) {
    return {
      correct: true,
      earned,
      total,
      feedback: total === 1 ? "That is the right side of the line." : `That is the region: the right side of ${total === 2 ? "both" : "all"} ${total} boundary lines.`,
    };
  }
  const notes = failing.map((q) => {
    const tp = testPoint(q);
    return `Your region is on the wrong side of ${boundaryEquation(q)}: it needs ${q.text.replace(/\$/g, "")}${tp ? `, and ${fmtPt(tp)} shows which side that is` : ""}`;
  });
  return { correct: false, earned, total, feedback: `${notes.join(". ")}.` };
}

export const fmtPt = (p: Pt): string => `(${fmtN(p[0])}, ${fmtN(p[1])})`;

export function describeRegionExpect(expect: RegionExpect): string {
  return `the region where ${expect.inequalities.map((s) => s.replace(/\$/g, "")).join(", ")}`;
}
