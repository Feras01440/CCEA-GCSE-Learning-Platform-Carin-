/**
 * The drawing primitives of an apparatus figure: shapes with a role (the renderer turns a role into the illustration
 * system's strokes and fills, so no piece chooses a colour), labels measured and placed with their leader lines, and a
 * tube's two walls offset from its centreline.
 */

export interface Pt {
  x: number;
  y: number;
}

export interface Box {
  x: number;
  y: number;
  w: number;
  h: number;
}

/**
 * What a shape is, which is all the renderer needs to draw it in the grammar (01-art-direction.md §7 and v2 §3):
 *  glass   a wall of glassware: an ink line, nothing filled
 *  fine    a graduation, a thread, a hand: a thinner ink line
 *  liquid  a liquid: the subject's mid tint, no edge
 *  wet     a liquid filling a tube: a tint stroke as wide as the bore
 *  solid   lumps of a solid: ink, strongly filled
 *  rubber  a bung or rubber tubing: a grey fill with an ink edge
 *  body    an instrument's body, a stand, a rule, a weight: the figure fill with an ink edge
 *  leaf    a leaf: the mid tint with a fine ink edge
 *  gap     an empty space inside a liquid (an air bubble, a tube's bore under water): the page colour
 *  flame   a flame's outer cone: the mid tint with an ink edge
 *  core    a flame's inner cone: ink, lightly filled
 *  mask    the inside of a tube standing in another liquid, painted the page's colour so the outer liquid stops at its wall
 *  inner   the liquid in a tube that stands in another liquid: ink, lightly filled, so the two liquids read apart
 *  tissue  a leaf or other tissue standing in a liquid: ink, filled, with a fine edge
 */
export type Role = "glass" | "fine" | "liquid" | "wet" | "solid" | "rubber" | "body" | "leaf" | "gap" | "flame" | "core" | "mask" | "inner" | "tissue";

/** `tag` names what a shape is (a tripod's leg, say), for a reader of the plan; the renderer ignores it. */
export type Shape = (
  | { kind: "path"; d: string; role: Role; width?: number }
  | { kind: "rect"; x: number; y: number; w: number; h: number; r?: number; role: Role }
  | { kind: "circle"; cx: number; cy: number; r: number; role: Role }
  | { kind: "ellipse"; cx: number; cy: number; rx: number; ry: number; role: Role }
  | { kind: "line"; x1: number; y1: number; x2: number; y2: number; role: Role }
) & { tag?: string };

/** Two decimal places at most, so the markup is short and the same on every machine. */
export const r2 = (n: number): number => Math.round(n * 100) / 100;

export const pt = (x: number, y: number): Pt => ({ x, y });

/** An SVG path through the points, open unless closed. */
export function pathOf(points: readonly Pt[], closed = false): string {
  return points.map((p, i) => `${i === 0 ? "M" : "L"}${r2(p.x)} ${r2(p.y)}`).join(" ") + (closed ? " Z" : "");
}

/**
 * The line parallel to a polyline at distance d (positive to the left of travel in screen coordinates), with mitred
 * corners: one wall of a tube bent at right angles, so the two walls of a delivery tube stay the bore apart round
 * every bend and the tube stays open along its whole length.
 */
export function offsetPolyline(points: readonly Pt[], d: number): Pt[] {
  const unitNormal = (a: Pt, b: Pt): Pt => {
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    const len = Math.hypot(dx, dy) || 1;
    return { x: dy / len, y: -dx / len };
  };
  return points.map((p, i) => {
    const before = i > 0 ? unitNormal(points[i - 1], p) : null;
    const after = i < points.length - 1 ? unitNormal(p, points[i + 1]) : null;
    if (!before && after) return { x: p.x + after.x * d, y: p.y + after.y * d };
    if (before && !after) return { x: p.x + before.x * d, y: p.y + before.y * d };
    const n1 = before!;
    const n2 = after!;
    const mx = n1.x + n2.x;
    const my = n1.y + n2.y;
    const len = Math.hypot(mx, my) || 1;
    const m = { x: mx / len, y: my / len };
    const cos = m.x * n1.x + m.y * n1.y || 1;
    return { x: p.x + (m.x * d) / cos, y: p.y + (m.y * d) / cos };
  });
}

/* ---------------- labels ---------------- */

/**
 * Every label's size in viewBox units, set by the narrowest place a figure is drawn on a 390 px phone: inside a See it
 * card (20 px padding and a 1 px border within the 358 px column), 316 px wide, where 17 units draw at 13.4 px. On a
 * Slides stage (342 px) that is 14.5 px, on the column 15.2 px, and at full size 17 px.
 */
export const LABEL_UNITS = 17;
/** Baseline to baseline, for a label on two or three lines. */
export const LINE_UNITS = 20;
const ASCENT = 0.76 * LABEL_UNITS;
const DESCENT = 0.24 * LABEL_UNITS;
/** The paper halo round every label (paint-order: stroke), which the box includes so halos never touch. */
export const HALO_UNITS = 3.5;

// Advance widths of Inter at weight 500, in em, rounded up a little: labels are measured to keep them apart and inside
// the figure, so an estimate that errs wide is the safe one.
const LOWER: Record<string, number> = {
  a: 0.56, b: 0.6, c: 0.54, d: 0.6, e: 0.57, f: 0.35, g: 0.6, h: 0.58, i: 0.24, j: 0.24, k: 0.53, l: 0.24, m: 0.87,
  n: 0.58, o: 0.59, p: 0.6, q: 0.6, r: 0.37, s: 0.52, t: 0.36, u: 0.58, v: 0.53, w: 0.79, x: 0.52, y: 0.53, z: 0.52,
};

/** A label's width in viewBox units at the label size. */
export function textWidth(text: string, size = LABEL_UNITS): number {
  let em = 0;
  for (const ch of text) {
    if (ch === " ") em += 0.28;
    else if (LOWER[ch] !== undefined) em += LOWER[ch];
    else if (/[0-9]/.test(ch)) em += 0.62;
    else if (/[A-Z]/.test(ch)) em += ch === "M" || ch === "W" ? 0.9 : ch === "I" ? 0.28 : 0.7;
    else if ("().,:;'!|[]".includes(ch)) em += 0.3;
    else em += 0.62;
  }
  return em * size * 1.04;
}

/** A label broken into lines no wider than `max`, at spaces; a single word longer than `max` keeps its own line. */
export function wrap(text: string, max: number): string[] {
  const words = text.split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  for (const word of words) {
    const last = lines[lines.length - 1];
    if (last !== undefined && textWidth(`${last} ${word}`) <= max) lines[lines.length - 1] = `${last} ${word}`;
    else lines.push(word);
  }
  return lines.length ? lines : [text];
}

export type Side = "left" | "right" | "above" | "below" | "centre";

/**
 * One place a label may sit. left or right: `at` is the label's edge nearest the piece (x) and its middle (y). above or
 * below: its centre (x) and its edge nearest the piece (y). centre: its centre, between the pieces it names, with a
 * leader from whichever side faces each. `maxWidth` wraps it for that place.
 */
export interface LabelOption {
  side: Side;
  at: Pt;
  maxWidth?: number;
  /** Where the leaders end from this place, when not the request's own targets (below a flask, its base; beside it, its wall). */
  targets?: Pt[];
}

/** A label a layout asks for: its words, the point on each piece its leader ends at, and the places it may sit, best first. */
export interface LabelRequest {
  text: string;
  /** Where each leader ends: on the piece's edge, or inside a liquid for what a vessel holds. */
  targets: Pt[];
  options: LabelOption[];
  /** The parts-list entries the label names. */
  names: number[];
}

export interface PlacedLabel {
  lines: string[];
  /** Where the first line's baseline starts (anchor "start"), ends ("end") or is centred ("middle"). */
  x: number;
  y: number;
  anchor: "start" | "middle" | "end";
  /** The label's extent with its halo, in viewBox units. */
  box: Box;
  /** The first leader (every label has one unless it sits against its piece), for tests and readers. */
  leader?: { x1: number; y1: number; x2: number; y2: number };
  leaders: Array<{ x1: number; y1: number; x2: number; y2: number }>;
  names: number[];
}

type Segment = { x1: number; y1: number; x2: number; y2: number };
type Measured = Omit<PlacedLabel, "leader" | "leaders" | "names">;

const overlaps = (a: Box, b: Box): boolean => a.x < b.x + b.w && b.x < a.x + a.w && a.y < b.y + b.h && b.y < a.y + a.h;

const overlapArea = (a: Box, b: Box): number =>
  Math.max(0, Math.min(a.x + a.w, b.x + b.w) - Math.max(a.x, b.x)) * Math.max(0, Math.min(a.y + a.h, b.y + b.h) - Math.max(a.y, b.y));

/** Whether a segment passes through a box (Liang and Barsky's clip). */
export function segmentHitsBox(s: Segment, b: Box): boolean {
  const dx = s.x2 - s.x1;
  const dy = s.y2 - s.y1;
  let t0 = 0;
  let t1 = 1;
  const edges: Array<[number, number]> = [
    [-dx, s.x1 - b.x],
    [dx, b.x + b.w - s.x1],
    [-dy, s.y1 - b.y],
    [dy, b.y + b.h - s.y1],
  ];
  for (const [p, q] of edges) {
    if (p === 0) {
      if (q < 0) return false;
      continue;
    }
    const t = q / p;
    if (p < 0) t0 = Math.max(t0, t);
    else t1 = Math.min(t1, t);
    if (t0 > t1) return false;
  }
  return true;
}

/** Whether two segments cross (touching at an end does not count). */
function segmentsCross(a: Segment, b: Segment): boolean {
  const orient = (px: number, py: number, qx: number, qy: number, rx: number, ry: number) => (qx - px) * (ry - py) - (qy - py) * (rx - px);
  const d1 = orient(a.x1, a.y1, a.x2, a.y2, b.x1, b.y1);
  const d2 = orient(a.x1, a.y1, a.x2, a.y2, b.x2, b.y2);
  const d3 = orient(b.x1, b.y1, b.x2, b.y2, a.x1, a.y1);
  const d4 = orient(b.x1, b.y1, b.x2, b.y2, a.x2, a.y2);
  return d1 * d2 < 0 && d3 * d4 < 0;
}

function measure(text: string, option: LabelOption, at: Pt): Measured {
  const lines = wrap(text, option.maxWidth ?? 400);
  const w = Math.max(...lines.map((l) => textWidth(l)));
  const h = (lines.length - 1) * LINE_UNITS + ASCENT + DESCENT;
  const pad = HALO_UNITS / 2;
  if (option.side === "left" || option.side === "right") {
    const top = at.y - h / 2;
    const anchor = option.side === "right" ? "start" : "end";
    const left = option.side === "right" ? at.x : at.x - w;
    return { lines, x: at.x, y: top + ASCENT, anchor, box: { x: left - pad, y: top - pad, w: w + 2 * pad, h: h + 2 * pad } };
  }
  if (option.side === "centre") {
    const top = at.y - h / 2;
    return { lines, x: at.x, y: top + ASCENT, anchor: "middle", box: { x: at.x - w / 2 - pad, y: top - pad, w: w + 2 * pad, h: h + 2 * pad } };
  }
  const top = option.side === "below" ? at.y : at.y - h;
  return { lines, x: at.x, y: top + ASCENT, anchor: "middle", box: { x: at.x - w / 2 - pad, y: top - pad, w: w + 2 * pad, h: h + 2 * pad } };
}

/** A label's leaders: each starts just off its side or edge and ends on its piece. Above or below, a label within 7 units of its piece needs none. */
function leadersFor(side: Side, m: Measured, targets: readonly Pt[]): Segment[] {
  const b = m.box;
  const pad = HALO_UNITS / 2;
  return targets
    .map((t): Segment => {
      const nearX = Math.min(Math.max(t.x, b.x + 6), b.x + b.w - 6);
      const facesLeft = side === "right" || (side === "centre" && t.x < b.x + b.w / 2);
      if (side === "right" || side === "centre") {
        return facesLeft ? { x1: b.x + pad - 4, y1: b.y + b.h / 2, x2: t.x, y2: t.y } : { x1: b.x + b.w - pad + 4, y1: b.y + b.h / 2, x2: t.x, y2: t.y };
      }
      if (side === "left") return { x1: b.x + b.w - pad + 4, y1: b.y + b.h / 2, x2: t.x, y2: t.y };
      if (side === "below") return { x1: nearX, y1: b.y + pad - 3, x2: t.x, y2: t.y };
      return { x1: nearX, y1: b.y + b.h - pad + 3, x2: t.x, y2: t.y };
    })
    .filter((l) => side === "left" || side === "right" || side === "centre" || Math.hypot(l.x2 - l.x1, l.y2 - l.y1) > 7);
}

/** The margin a label keeps from the drawing. */
const CLEAR = 3;

// How far a label may slide from the place it asked for: along its column (left, right) or its row (above, below).
const SLIDE_COLUMN = [0, -8, 8, -16, 16, -26, 26, -38, 38, -52, 52, -68, 68];
const SLIDE_ROW = [0, 10, -10, 22, -22, 36, -36, 52, -52, 70, -70, 92, -92];

/**
 * Every label placed, in the order asked: each tries its places best first, sliding a little along each, and takes the
 * cheapest that is inside the figure, clear of every label already placed, with no leader through a label. The cost
 * counts how far down its list the place is, how far it slid, how much of the drawing it covers (a label on a picture
 * is hard to read), how long its leaders are and how many leaders they cross.
 */
export function placeLabels(requests: readonly LabelRequest[], width: number, drawing: readonly Box[]): PlacedLabel[] {
  const placed: PlacedLabel[] = [];
  for (const req of requests) {
    let best: { cost: number; label: PlacedLabel } | null = null;
    req.options.forEach((option, rank) => {
      const column = option.side === "left" || option.side === "right" || option.side === "centre";
      for (const slide of column ? SLIDE_COLUMN : SLIDE_ROW) {
        const at = column ? { x: option.at.x, y: option.at.y + slide } : { x: option.at.x + slide, y: option.at.y };
        const m = measure(req.text, option, at);
        if (m.box.x < 0 || m.box.x + m.box.w > width || m.box.y < 0) continue;
        if (placed.some((p) => overlaps(p.box, m.box))) continue;
        const leaders = leadersFor(option.side, m, option.targets ?? req.targets);
        if (leaders.some((l) => placed.some((p) => segmentHitsBox(l, p.box)))) continue;
        if (placed.some((p) => p.leaders.some((l) => segmentHitsBox(l, m.box)))) continue;
        // A label keeps a clear margin from the drawing, as well as off it.
        const covered = drawing.reduce((sum, d) => sum + overlapArea({ x: d.x - CLEAR, y: d.y - CLEAR, w: d.w + 2 * CLEAR, h: d.h + 2 * CLEAR }, m.box), 0);
        const length = leaders.reduce((sum, l) => sum + Math.hypot(l.x2 - l.x1, l.y2 - l.y1), 0);
        const crossings = leaders.reduce((n, l) => n + placed.reduce((k, p) => k + p.leaders.filter((o) => segmentsCross(l, o)).length, 0), 0);
        const cost = rank * 30 + Math.abs(slide) * 0.8 + covered * 6 + length * 0.12 + crossings * 25;
        if (!best || cost < best.cost) best = { cost, label: { ...m, leaders, leader: leaders[0], names: req.names } };
      }
    });
    if (!best) {
      // Nowhere clean: the first place as asked, so a test sees the clash rather than a label that silently vanished.
      const m = measure(req.text, req.options[0], req.options[0].at);
      const leaders = leadersFor(req.options[0].side, m, req.options[0].targets ?? req.targets);
      best = { cost: Infinity, label: { ...m, leaders, leader: leaders[0], names: req.names } };
    }
    placed.push(best.label);
  }
  return placed;
}
