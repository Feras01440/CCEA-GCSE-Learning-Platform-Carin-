/**
 * Marking for drawn graphs other than transformations: the plotted points of a cumulative frequency curve, a
 * straight line from a table or a science results plot; a line of best fit or a line through two points; the
 * bars of a histogram; the sample points of a curve. The field submits JSON (`formatPlotResponse`), the spec's
 * tolerances are in data units, and every target is a value from the table, so nothing is judged "by eye".
 * The field's grid is derived here too (`plotLattice`), so the field that snaps her taps, the marker that
 * judges them and the content lint that checks a bundle all agree on what a tap can reach.
 * Pure; no content dependencies.
 */

export type Pt = readonly [number, number];

interface PlotTolerance {
  type: string;
  value?: number;
  places?: number;
}

export interface PointsLineExpect {
  plot: "points-line";
  points: readonly Pt[];
  tolerance?: PlotTolerance | undefined;
  /** The line to draw. Two points describe a line of best fit or a straight-line graph; more than two (or
   * none, with `lineRequired`) means "join the plotted points". */
  lineThrough?: readonly Pt[] | undefined;
  lineRequired?: boolean | undefined;
}

export interface CurveExpect {
  plot: "curve";
  /** The table's points; the curve is drawn through them. */
  samples: readonly Pt[];
  tolerance?: PlotTolerance | undefined;
}

export type PointsExpect = PointsLineExpect | CurveExpect;

/** The table's points, whichever field the plot keeps them in. */
export const pointsOf = (expect: PointsExpect): readonly Pt[] => (expect.plot === "curve" ? expect.samples : expect.points);

export interface HistogramExpect {
  plot: "histogram";
  bars: readonly { from: number; to: number; frequencyDensity: number }[];
  scaleTolerance: number;
}

export interface BoxExpect {
  plot: "box";
  min: number;
  q1: number;
  median: number;
  q3: number;
  max: number;
  tolerance?: PlotTolerance | undefined;
}

export type PlotExpect = PointsExpect | HistogramExpect | BoxExpect;

export interface PlotResponse {
  points?: Pt[];
  /** Two points on the learner's line, when the part asks for one. */
  line?: [Pt, Pt] | null;
  /** One height per bar, null where a bar was not drawn. */
  bars?: (number | null)[];
  /** The five values of a box plot in order (min, Q1, median, Q3, max), null where one is not placed. */
  box?: (number | null)[];
}

/** The five values of a box plot, in the order they are placed. */
export const BOX_KEYS = ["min", "q1", "median", "q3", "max"] as const;
export const BOX_LABELS: Record<(typeof BOX_KEYS)[number], string> = {
  min: "minimum",
  q1: "lower quartile",
  median: "median",
  q3: "upper quartile",
  max: "maximum",
};

export interface PlotVerdict {
  correct: boolean;
  /** Correct elements (points, bars; plus one for a required line) out of `total`. */
  earned: number;
  total: number;
  feedback: string;
}

const isPt = (v: unknown): v is [number, number] =>
  Array.isArray(v) && v.length === 2 && typeof v[0] === "number" && typeof v[1] === "number" && Number.isFinite(v[0]) && Number.isFinite(v[1]);

/** The same point, to floating-point noise. */
export const samePoint = (a: Pt, b: Pt): boolean => Math.abs(a[0] - b[0]) < 1e-9 && Math.abs(a[1] - b[1]) < 1e-9;

export function formatPlotResponse(r: PlotResponse): string {
  return JSON.stringify(r);
}

/** A response string from the field, or null when it is not one. */
export function parsePlotResponse(raw: string): PlotResponse | null {
  const t = raw.trim();
  if (!t.startsWith("{")) return null;
  try {
    const o = JSON.parse(t) as Record<string, unknown>;
    const out: PlotResponse = {};
    if (Array.isArray(o.points)) out.points = o.points.filter(isPt).map((p) => [p[0], p[1]] as Pt);
    // Two coinciding points describe no line at all, so they are read as "no line drawn".
    if (Array.isArray(o.line) && o.line.length === 2 && isPt(o.line[0]) && isPt(o.line[1]) && !samePoint(o.line[0], o.line[1])) out.line = [o.line[0], o.line[1]];
    if (Array.isArray(o.bars)) out.bars = o.bars.map((b) => (typeof b === "number" && Number.isFinite(b) ? b : null));
    if (Array.isArray(o.box)) out.box = o.box.map((b) => (typeof b === "number" && Number.isFinite(b) ? b : null));
    return out;
  } catch {
    return null;
  }
}

const fmt = (n: number): string => (Number.isInteger(n) ? String(n) : String(Math.round(n * 1000) / 1000)).replace("-", "−");
export const formatPt = (p: Pt): string => `(${fmt(p[0])}, ${fmt(p[1])})`;

/** Absolute closeness in data units; a spec without an absolute tolerance gets half a small square of 1. */
export function toleranceOf(expect: PointsExpect | BoxExpect): number {
  const t = expect.tolerance;
  if (t && t.type === "absolute" && typeof t.value === "number") return t.value;
  if (t && t.type === "dp" && typeof t.places === "number") return 0.5 / 10 ** t.places;
  return 0.5;
}

/* ---- The grid she draws on ------------------------------------------------------------------------------- */

/** One axis of the plotting grid: `major` is the labelled step, `minor` the small square every tap snaps to. */
export interface PlotAxis {
  lo: number;
  hi: number;
  major: number;
  minor: number;
}

/** A table value that no tap can land within tolerance of, even on the finest lattice the grid offers. */
export interface UnreachableTarget {
  axis: "x" | "y";
  value: number;
  /** The nearest small-square value on the finest lattice. */
  nearest: number;
  minor: number;
  tolerance: number;
}

export interface PlotLattice {
  x: PlotAxis;
  y: PlotAxis;
  /** Empty for any part a learner can complete by tapping. */
  unreachable: UnreachableTarget[];
}

/** Labelled steps an axis aims for: about eight across, ten up (the printed cumulative-frequency grids label 10s). */
const X_STEPS = 8;
const Y_STEPS = 10;
/** Small squares per labelled step, coarsest first; the printed grid has five. */
const SQUARES_PER_STEP = [5, 10, 20] as const;

const round6 = (v: number): number => Math.round(v * 1e6) / 1e6;
/** The nearest multiple of `step`, clean of floating-point noise (0.1 lattices stay 0.3, never 0.30000000000000004). */
export const snapTo = (v: number, step: number): number => round6(Math.round(v / step) * step);

/** 1, 2 or 5 × 10^k so the span holds about `target` labelled steps. */
export function niceStep(span: number, target: number): number {
  if (span <= 0) return 1;
  const rough = span / target;
  const pow = 10 ** Math.floor(Math.log10(rough));
  for (const m of [1, 2, 5, 10]) if (m * pow >= rough - 1e-12) return m * pow;
  return 10 * pow;
}

/** An axis from 0 (or below the data) to a labelled step past the largest value; five small squares to a step. */
function axisFor(values: number[], target: number, headroom: boolean): PlotAxis {
  const min = Math.min(0, ...values);
  const max = Math.max(...values);
  const major = niceStep(max - min || 1, target);
  const lo = round6(Math.floor(min / major + 1e-9) * major);
  let hi = round6(Math.ceil(max / major - 1e-9) * major);
  if (hi <= lo) hi = round6(lo + major);
  if (headroom && max > hi - major * 0.1) hi = round6(hi + major);
  return { lo, hi, major, minor: major / 5 };
}

/**
 * The coarsest small square (a fifth, a tenth or a twentieth of the labelled step) on which every target sits
 * within `tol` of a lattice value, so a tap can always land on the table's value. When even the finest does
 * not reach a target, the axis keeps the finest and the target is reported in `unreachable`.
 */
function refineMinor(a: PlotAxis, axis: "x" | "y", targets: readonly number[], tol: number, unreachable: UnreachableTarget[]): PlotAxis {
  const reaches = (minor: number, v: number): boolean => Math.abs(v - snapTo(v, minor)) <= tol + 1e-9;
  for (const squares of SQUARES_PER_STEP) {
    const minor = a.major / squares;
    if (targets.every((v) => reaches(minor, v))) return { ...a, minor };
  }
  const minor = a.major / SQUARES_PER_STEP[SQUARES_PER_STEP.length - 1]!;
  for (const v of targets) if (!reaches(minor, v)) unreachable.push({ axis, value: v, nearest: snapTo(v, minor), minor, tolerance: tol });
  return { ...a, minor };
}

/**
 * The axes the field draws for a points, curve or histogram part, with the small square derived from the
 * data: every point (and every point the line must pass through), or every bar height, lies within the
 * spec's tolerance of a small square wherever the grid can manage it.
 */
export function plotLattice(expect: PointsExpect | HistogramExpect): PlotLattice {
  const unreachable: UnreachableTarget[] = [];
  if (expect.plot === "histogram") {
    const heights = expect.bars.map((b) => b.frequencyDensity);
    return {
      // A bar is chosen by the interval touched, not by a snapped x, so the x squares are only the printed ones.
      x: axisFor(expect.bars.flatMap((b) => [b.from, b.to]), X_STEPS, false),
      y: refineMinor(axisFor(heights, Y_STEPS, true), "y", heights, expect.scaleTolerance, unreachable),
      unreachable,
    };
  }
  const pts = [...pointsOf(expect), ...(expect.plot === "points-line" ? (expect.lineThrough ?? []) : [])];
  const xs = pts.map((p) => p[0]);
  const ys = pts.map((p) => p[1]);
  const tol = toleranceOf(expect);
  return {
    x: refineMinor(axisFor(xs, X_STEPS, false), "x", xs, tol, unreachable),
    y: refineMinor(axisFor(ys, Y_STEPS, true), "y", ys, tol, unreachable),
    unreachable,
  };
}

/* ---- Marking --------------------------------------------------------------------------------------------- */

const within = (a: Pt, b: Pt, tol: number): boolean => Math.abs(a[0] - b[0]) <= tol + 1e-9 && Math.abs(a[1] - b[1]) <= tol + 1e-9;

/** Greedy matching of placed points to expected points within `tol`: each expected point takes its nearest unused placed point. */
function matchPoints(expected: readonly Pt[], placed: readonly Pt[], tol: number): { matched: number[]; missing: Pt[]; extra: Pt[] } {
  const used = new Set<number>();
  const matched: number[] = [];
  const missing: Pt[] = [];
  for (const e of expected) {
    let best = -1;
    let bestD = Infinity;
    placed.forEach((p, i) => {
      if (used.has(i) || !within(p, e, tol)) return;
      const d = Math.hypot(p[0] - e[0], p[1] - e[1]);
      if (d < bestD) {
        bestD = d;
        best = i;
      }
    });
    if (best >= 0) {
      used.add(best);
      matched.push(best);
    } else missing.push(e);
  }
  const extra = placed.filter((_, i) => !used.has(i));
  return { matched, missing, extra };
}

/**
 * Signed vertical distance from a point to the line through a and b: positive when the point sits above the
 * line (the line passes below it), negative when below. For a vertical line, the horizontal distance instead.
 */
function gapToLine(point: Pt, [a, b]: [Pt, Pt]): number {
  if (Math.abs(b[0] - a[0]) < 1e-12) return point[0] - a[0];
  const y = a[1] + ((b[1] - a[1]) * (point[0] - a[0])) / (b[0] - a[0]);
  return point[1] - y;
}

const isVertical = ([a, b]: [Pt, Pt]): boolean => Math.abs(b[0] - a[0]) < 1e-12;

/** Does the part ask for a line placed with two taps (best fit, or a straight-line graph), rather than joining the points? */
export function needsPlacedLine(expect: PointsExpect): boolean {
  return expect.plot === "points-line" && expect.lineRequired === true && Array.isArray(expect.lineThrough) && expect.lineThrough.length === 2;
}

function checkPoints(response: PlotResponse, expect: PointsExpect): PlotVerdict {
  const tol = toleranceOf(expect);
  const placed = response.points ?? [];
  const table = pointsOf(expect);
  const { matched, missing, extra } = matchPoints(table, placed, tol);
  const lineWanted = needsPlacedLine(expect);
  const total = table.length + (lineWanted ? 1 : 0);
  let earned = matched.length;
  const notes: string[] = [];

  if (missing.length === 0 && extra.length === 0) notes.push(table.length === 1 ? "The point is plotted correctly." : "Every point is plotted correctly.");
  else {
    // A stray point in a missing point's column (same x) is that point plotted at the wrong height; failing
    // that, one close by in both directions. Name it against where it belongs before listing the rest.
    const named = new Set<Pt>();
    for (const m of missing) {
      const near =
        extra.find((p) => !named.has(p) && Math.abs(p[0] - m[0]) <= tol + 1e-9) ??
        extra.find((p) => !named.has(p) && Math.abs(p[0] - m[0]) <= 4 * tol + 1e-9 && Math.abs(p[1] - m[1]) <= 6 * tol + 1e-9);
      if (near) {
        named.add(near);
        notes.push(`The point at ${formatPt(near)} belongs at ${formatPt(m)}.`);
      }
    }
    const unnamed = missing.filter((m) => !notes.some((n) => n.endsWith(`belongs at ${formatPt(m)}.`)));
    if (unnamed.length) notes.push(`${unnamed.length === 1 ? "Not plotted yet" : "Not plotted yet"}: ${unnamed.slice(0, 4).map(formatPt).join(", ")}${unnamed.length > 4 ? "…" : ""}.`);
    const stray = extra.filter((p) => !named.has(p));
    if (stray.length) notes.push(`${stray.length === 1 ? "One point is" : `${stray.length} points are`} not in the table: ${stray.slice(0, 3).map(formatPt).join(", ")}.`);
  }

  if (lineWanted) {
    const through = (expect as PointsLineExpect).lineThrough as readonly [Pt, Pt];
    if (!response.line) notes.push(`Now draw the line: it should pass through ${formatPt(through[0])} and ${formatPt(through[1])}.`);
    else {
      const line = response.line as [Pt, Pt];
      const gaps = through.map((p) => gapToLine(p, line));
      const ok = gaps.every((g) => Math.abs(g) <= tol + 1e-9);
      if (ok) {
        earned += 1;
        notes.push(`Your line passes through ${formatPt(through[0])} and ${formatPt(through[1])}.`);
      } else {
        // Name the point the line misses by more, and which side of it the line runs, so she knows which way to move it.
        const worst = Math.abs(gaps[0]!) >= Math.abs(gaps[1]!) ? 0 : 1;
        const gap = gaps[worst]!;
        const side = isVertical(line) ? "beside" : gap > 0 ? "below" : "above";
        notes.push(`Your line passes ${fmt(Math.round(Math.abs(gap) * 100) / 100)} ${side} ${formatPt(through[worst]!)}. It should go through ${formatPt(through[0])} and ${formatPt(through[1])}.`);
      }
    }
  } else if (expect.plot === "curve") {
    notes.push(missing.length === 0 && extra.length === 0 ? "On paper, join them with one smooth freehand curve, never straight segments." : "Plot every point from the table first, then join them with one smooth curve.");
  } else if ((expect as PointsLineExpect).lineRequired) {
    notes.push(missing.length === 0 && extra.length === 0 ? "On paper, join the points with straight segments or a smooth curve." : "Plot every point first, then join them.");
  }

  return { correct: earned === total, earned, total, feedback: notes.join(" ") };
}

function checkHistogram(response: PlotResponse, expect: HistogramExpect): PlotVerdict {
  const heights = response.bars ?? [];
  const tol = expect.scaleTolerance;
  let earned = 0;
  const notYet: string[] = [];
  expect.bars.forEach((bar, i) => {
    const h = heights[i] ?? null;
    if (h !== null && Math.abs(h - bar.frequencyDensity) <= tol + 1e-9) earned += 1;
    else if (h === null) notYet.push(`the ${fmt(bar.from)}–${fmt(bar.to)} bar is not drawn (it should reach ${fmt(bar.frequencyDensity)})`);
    else notYet.push(`the ${fmt(bar.from)}–${fmt(bar.to)} bar should reach ${fmt(bar.frequencyDensity)}, not ${fmt(h)}`);
  });
  const total = expect.bars.length;
  const feedback =
    notYet.length === 0
      ? "Every bar has the right height: frequency density is frequency divided by class width."
      : `${notYet.length === 1 ? "One bar is not at its height yet: " : `${notYet.length} bars are not at their heights yet: `}${notYet.join("; ")}. Frequency density is frequency ÷ class width.`;
  return { correct: earned === total, earned, total, feedback };
}

function checkBox(response: PlotResponse, expect: BoxExpect): PlotVerdict {
  const tol = toleranceOf(expect);
  const values = response.box ?? [];
  let earned = 0;
  const wrong: string[] = [];
  BOX_KEYS.forEach((key, i) => {
    const v = values[i] ?? null;
    const target = expect[key];
    if (v !== null && Math.abs(v - target) <= tol + 1e-9) earned += 1;
    else if (v === null) wrong.push(`the ${BOX_LABELS[key]} is not placed (it belongs at ${fmt(target)})`);
    else wrong.push(`the ${BOX_LABELS[key]} should be at ${fmt(target)}, not ${fmt(v)}`);
  });
  const total = BOX_KEYS.length;
  const feedback =
    wrong.length === 0
      ? "Every value is in the right place: whiskers at the minimum and maximum, the box from the lower to the upper quartile, and the median inside it."
      : `${wrong.length === 1 ? "One value is wrong: " : `${wrong.length} values are wrong: `}${wrong.join("; ")}.`;
  return { correct: earned === total, earned, total, feedback };
}

/** Marks a field response against the expectation. An unreadable response scores nothing. */
export function checkPlot(raw: string, expect: PlotExpect): PlotVerdict {
  const response = parsePlotResponse(raw);
  if (!response) {
    const total = expect.plot === "histogram" ? expect.bars.length : expect.plot === "box" ? BOX_KEYS.length : pointsOf(expect).length + (needsPlacedLine(expect) ? 1 : 0);
    return { correct: false, earned: 0, total, feedback: "Nothing was drawn yet." };
  }
  if (expect.plot === "histogram") return checkHistogram(response, expect);
  if (expect.plot === "box") return checkBox(response, expect);
  return checkPoints(response, expect);
}

/** What the marker expects, for the "expected" line of a result. */
export function describePlotExpect(expect: PlotExpect): string {
  if (expect.plot === "histogram") return expect.bars.map((b) => `${fmt(b.from)}–${fmt(b.to)}: ${fmt(b.frequencyDensity)}`).join(", ");
  if (expect.plot === "box") return BOX_KEYS.map((k) => `${BOX_LABELS[k]} ${fmt(expect[k])}`).join(", ");
  const pts = pointsOf(expect).map(formatPt).join(", ");
  return expect.plot === "points-line" && needsPlacedLine(expect) ? `${pts}; line through ${(expect.lineThrough as readonly Pt[]).map(formatPt).join(" and ")}` : pts;
}
