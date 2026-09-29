/**
 * The set-ups an apparatus figure can draw, each assembled and working, in CCEA's two-dimensional cross-section style:
 * open tubes, every piece recognisable, labels with leader lines. A figure is drawn only when every entry of its parts
 * list is a piece one of these set-ups places; otherwise planApparatus returns null and the figure says its parts in
 * words, because a diagram that is wrongly assembled would teach the very fault the examiners mark down.
 *
 *   gas-train    a gas made in a flask or a tube (thistle funnel optional) led by a delivery tube to a gas syringe; over
 *                water to a gas jar (on a beehive shelf or not) or an upturned measuring cylinder; or into a tube of
 *                limewater
 *   vessel       an open vessel and what stands in it: a water bath with tubes; a polystyrene cup in a beaker; a tube in
 *                a beaker of hot water on a heatproof mat; a measuring cylinder with a stone on a thread; a thermometer
 *   beam         a metre rule balanced on a pivot with weights hung from it
 *   potometer    a bubble potometer: a leafy shoot, a capillary tube with its bubble, a reservoir and tap, a ruler
 *   clamped      a tube held in a clamp over a flame (burning food on a mounted needle, or a Bunsen burner)
 *   bunsen       a Bunsen burner and its flame: a wire loop at the flame's edge, or a tripod, gauze and vessel above it
 *   instruments  measuring instruments with nothing to assemble, side by side
 *
 * Geometry is in viewBox units on a 400-unit width (the illustration system's 360 to 420, phone first). Every piece is
 * drawn from a few shapes with a role (geometry.ts); every label is text placed by placeLabels.
 */
import { parseApparatusParts, type Contents, type Piece, type PieceKind } from "./parts";
import { offsetPolyline, pathOf, placeLabels, pt, r2, type Box, type LabelOption, type LabelRequest, type PlacedLabel, type Pt, type Shape } from "./geometry";

export const APPARATUS_WIDTH = 400;
const W = APPARATUS_WIDTH;

export type Layout = "gas-train" | "vessel" | "beam" | "potometer" | "clamped" | "bunsen" | "instruments";

/**
 * The facts a CCEA examiner checks on a diagram, as numbers: where the gas path starts and ends, what the bung leaves
 * open, whether the funnel's stem is under the acid, where each thermometer's bulb is, where the flame reaches.
 */
export interface Anatomy {
  /** The delivery tube's centreline and half its outer width. */
  tube?: { path: Pt[]; bore: number };
  generatorLiquidTop?: number;
  /** The bung's solid pieces across its widest edge, round the tubes' holes. */
  bung?: Array<{ x: number; w: number }>;
  /** Where the gas goes in: the syringe's nozzle, the space under the shelf's hole, the mouth of a jar or cylinder. */
  collectorMouth?: Box;
  collectorLiquidTop?: number;
  funnelStemEnd?: Pt;
  troughWaterTop?: number;
  thermometerBulb?: Pt;
  bulbLiquidTop?: number;
  /** A flame's tip and base, and its outer edge (right side) at the height anything is held in it. */
  flame?: { tip: Pt; base: Pt; edgeX: number };
  /** The lowest point of what is heated: a tube's bottom, a gauze's underside. */
  heated?: Pt;
  loop?: Pt;
}

export interface ApparatusPlan {
  layout: Layout;
  width: number;
  height: number;
  /**
   * How far the shapes are moved up to crop the figure to what is drawn: shapes are in the layout's own coordinates and
   * drawn translated by -offset; labels and anatomy are already in the figure's.
   */
  offset: number;
  shapes: Shape[];
  labels: PlacedLabel[];
  /** The figure's accessible name: the arrangement in words, naming every labelled piece. */
  description: string;
  anatomy: Anatomy;
}

/* ------------------------------------------------------------------------------------------------------------------ */
/* Drawing helpers                                                                                                     */
/* ------------------------------------------------------------------------------------------------------------------ */

const n = (v: number) => r2(v);
const M = (x: number, y: number) => `M${n(x)} ${n(y)}`;
const L = (x: number, y: number) => `L${n(x)} ${n(y)}`;
const Q = (cx: number, cy: number, x: number, y: number) => `Q${n(cx)} ${n(cy)} ${n(x)} ${n(y)}`;
const A = (r: number, sweep: 0 | 1, x: number, y: number) => `A${n(r)} ${n(r)} 0 0 ${sweep} ${n(x)} ${n(y)}`;

/** The part of a polygon on or below a horizontal line (screen y grows downwards): a vessel's interior under a liquid's surface. */
function clipBelow(poly: readonly Pt[], y: number): Pt[] {
  const out: Pt[] = [];
  for (let i = 0; i < poly.length; i++) {
    const a = poly[i];
    const b = poly[(i + 1) % poly.length];
    const aIn = a.y >= y;
    const bIn = b.y >= y;
    if (aIn) out.push(a);
    if (aIn !== bIn) out.push(pt(a.x + ((b.x - a.x) * (y - a.y)) / (b.y - a.y), y));
  }
  return out;
}

/** Points round a half circle from angle a0 to a1 (radians, screen coordinates), for a round-bottomed vessel's interior. */
function arcPoints(cx: number, cy: number, r: number, a0: number, a1: number, steps = 10): Pt[] {
  return Array.from({ length: steps + 1 }, (_, i) => {
    const a = a0 + ((a1 - a0) * i) / steps;
    return pt(cx + r * Math.cos(a), cy + r * Math.sin(a));
  });
}

/** A closed outline through sample points, smoothed: each corner becomes a curve through the midpoints beside it. */
function smoothClosed(points: readonly Pt[]): string {
  const mid = (a: Pt, b: Pt) => pt((a.x + b.x) / 2, (a.y + b.y) / 2);
  const first = mid(points[points.length - 1], points[0]);
  let d = M(first.x, first.y);
  for (let i = 0; i < points.length; i++) {
    const p = points[i];
    const m = mid(p, points[(i + 1) % points.length]);
    d += ` ${Q(p.x, p.y, m.x, m.y)}`;
  }
  return `${d} Z`;
}

/** Irregular lumps of a solid (marble chips, zinc granules), each its own six-sided shape, resting in a row. */
const LUMP_SHAPES: ReadonlyArray<ReadonlyArray<readonly [number, number]>> = [
  [[-6, 1], [-3, -4], [3, -5], [6, -1], [3, 4], [-4, 4]],
  [[-5, -2], [0, -5], [6, -3], [5, 3], [-1, 5], [-6, 3]],
  [[-6, -1], [-2, -5], [5, -4], [6, 2], [1, 5], [-5, 4]],
  [[-5, -3], [2, -5], [6, 0], [3, 5], [-3, 4], [-6, 1]],
  [[-6, 0], [-3, -5], [4, -4], [6, 1], [2, 5], [-4, 4]],
];

class Sketch {
  readonly shapes: Shape[] = [];
  readonly drawing: Box[] = [];
  readonly requests: LabelRequest[] = [];
  readonly anatomy: Anatomy = {};

  add(...shapes: Shape[]): void {
    this.shapes.push(...shapes);
  }
  glass(points: readonly Pt[], closed = false): void {
    this.shapes.push({ kind: "path", d: pathOf(points, closed), role: "glass" });
  }
  fine(x1: number, y1: number, x2: number, y2: number, tag?: string): void {
    this.shapes.push({ kind: "line", x1, y1, x2, y2, role: "fine", ...(tag ? { tag } : {}) });
  }
  liquid(poly: readonly Pt[]): void {
    if (poly.length > 2) this.shapes.push({ kind: "path", d: pathOf(poly, true), role: "liquid" });
  }
  /** Room the drawing takes, which labels keep off and the figure's height is measured from. */
  block(x: number, y: number, w: number, h: number): void {
    this.drawing.push({ x, y, w, h });
  }
  lumps(cx: number, y: number, count: number, spread: number): void {
    for (let i = 0; i < count; i++) {
      const x = count === 1 ? cx : cx - spread + (2 * spread * i) / (count - 1);
      const shape = LUMP_SHAPES[i % LUMP_SHAPES.length];
      this.shapes.push({ kind: "path", d: pathOf(shape.map(([dx, dy]) => pt(x + dx, y + dy)), true), role: "solid" });
    }
  }
  label(names: number | number[], text: string, targets: Pt | Pt[], options: LabelOption[]): void {
    this.requests.push({ text, names: Array.isArray(names) ? names : [names], targets: Array.isArray(targets) ? targets : [targets], options });
  }
}

const MARGIN = 8;

/** The anatomy moved up by dy (every y, and each point's y). */
function shiftAnatomy(a: Anatomy, dy: number): Anatomy {
  const p = (q: Pt): Pt => pt(q.x, q.y + dy);
  const b = (q: Box): Box => ({ ...q, y: q.y + dy });
  const y = (v: number | undefined) => (v === undefined ? undefined : v + dy);
  return {
    ...a,
    tube: a.tube && { path: a.tube.path.map(p), bore: a.tube.bore },
    generatorLiquidTop: y(a.generatorLiquidTop),
    collectorMouth: a.collectorMouth && b(a.collectorMouth),
    collectorLiquidTop: y(a.collectorLiquidTop),
    funnelStemEnd: a.funnelStemEnd && p(a.funnelStemEnd),
    troughWaterTop: y(a.troughWaterTop),
    thermometerBulb: a.thermometerBulb && p(a.thermometerBulb),
    bulbLiquidTop: y(a.bulbLiquidTop),
    flame: a.flame && { tip: p(a.flame.tip), base: p(a.flame.base), edgeX: a.flame.edgeX },
    heated: a.heated && p(a.heated),
    loop: a.loop && p(a.loop),
  };
}

/** Labels placed, then the figure cropped to what it draws with a margin all round: no empty band above a short set-up. */
function finish(s: Sketch, layout: Layout, description: string): ApparatusPlan {
  const labels = placeLabels(s.requests, W, s.drawing);
  const top = Math.min(...s.drawing.map((b) => b.y), ...labels.map((l) => l.box.y));
  const bottom = Math.max(...s.drawing.map((b) => b.y + b.h), ...labels.map((l) => l.box.y + l.box.h));
  const offset = Math.max(0, Math.floor(top - MARGIN));
  const moved = labels.map((l) => ({
    ...l,
    y: l.y - offset,
    box: { ...l.box, y: l.box.y - offset },
    leaders: l.leaders.map((d) => ({ ...d, y1: d.y1 - offset, y2: d.y2 - offset })),
    leader: l.leader && { ...l.leader, y1: l.leader.y1 - offset, y2: l.leader.y2 - offset },
  }));
  return {
    layout,
    width: W,
    height: Math.ceil(bottom - offset + MARGIN),
    offset,
    shapes: s.shapes,
    labels: moved,
    description,
    anatomy: offset ? shiftAnatomy(s.anatomy, -offset) : s.anatomy,
  };
}

/* ------------------------------------------------------------------------------------------------------------------ */
/* Words                                                                                                               */
/* ------------------------------------------------------------------------------------------------------------------ */

// Names that take no article: plurals ("bathroom scales", "slotted masses") and things that are not counted ("burning food").
const NO_ARTICLE = /(^|\s)(scales|weights|masses)$|^(burning )?food\b|^(hot |cold )?water$/i;
/** "a conical flask", "an air bubble", "bathroom scales", "burning food on a mounted needle". */
const a = (words: string): string => (NO_ARTICLE.test(words) ? words : /^[aeiou]/i.test(words) ? `an ${words}` : `a ${words}`);
/** "weight" twice: "two weights". */
const COUNT = ["", "one", "two", "three", "four"];
const plural = (words: string): string => (/(s|sh|ch|x)$/i.test(words) ? `${words}es` : `${words}s`);
/** Pieces said together: "two weights" when they share a name, "a weight and a slotted mass" when they do not. */
const counted = (labels: readonly string[]): string =>
  labels.length > 1 && labels.every((l) => l === labels[0]) ? `${COUNT[labels.length] ?? labels.length} ${plural(labels[0])}` : listed(labels.map(a));
/** A piece and, when it has its own label, what it holds: "a conical flask holding dilute hydrochloric acid". */
const named = (p: Piece): string => (p.contents?.labelled ? `${a(p.label)} holding ${p.contents.text}` : a(p.label));
/** "a, b and c". */
const listed = (items: readonly string[]): string => (items.length <= 1 ? (items[0] ?? "") : `${items.slice(0, -1).join(", ")} and ${items[items.length - 1]}`);
const sentence = (s: string): string => `${s.charAt(0).toUpperCase()}${s.slice(1)}`;

/* ------------------------------------------------------------------------------------------------------------------ */
/* The pieces                                                                                                          */
/* ------------------------------------------------------------------------------------------------------------------ */

/** A vessel a gas is made in: where its mouth is (for the bung), how wide inside, where its liquid stands. */
interface Generator {
  cx: number;
  base: number;
  mouthTop: number;
  innerHalf: number;
  liquidTop: number;
  /** Points on its outline for labels: its side wall at mid height and the middle of its liquid. */
  wall: Pt;
  liquidMid: Pt;
  left: number;
  right: number;
}

const FLASK = { bodyHalf: 46, body: 80, neckHalf: 11, neck: 26 };

/** A conical flask on its base at `base`, holding a liquid (and lumps of a solid) when it holds anything. */
function conicalFlask(s: Sketch, cx: number, base: number, contents: Contents | undefined, mustHoldLiquid: boolean): Generator {
  const shoulder = base - FLASK.body;
  const neckTop = shoulder - FLASK.neck;
  const halfAt = (y: number) => FLASK.neckHalf + ((FLASK.bodyHalf - FLASK.neckHalf) * (y - shoulder)) / FLASK.body;
  const liquidTop = base - 32;
  if (contents?.liquid || mustHoldLiquid) {
    const h = halfAt(liquidTop) - 1.4;
    s.liquid([pt(cx - h, liquidTop), pt(cx + h, liquidTop), pt(cx + FLASK.bodyHalf - 2.4, base - 1), pt(cx - FLASK.bodyHalf + 2.4, base - 1)]);
  }
  if (contents?.solid && /powder/i.test(contents.text)) {
    // A powder lies in a thin layer, not in lumps.
    s.add({ kind: "path", d: pathOf([pt(cx - 40, base - 1.5), pt(cx - 30, base - 6), pt(cx - 10, base - 7), pt(cx + 12, base - 6.5), pt(cx + 30, base - 5.5), pt(cx + 40, base - 1.5)], true), role: "solid", tag: "powder" });
  } else if (contents?.solid) s.lumps(cx, base - 7, 5, 27);
  s.glass([
    pt(cx - FLASK.neckHalf, neckTop),
    pt(cx - FLASK.neckHalf, shoulder),
    pt(cx - FLASK.bodyHalf, base),
    pt(cx + FLASK.bodyHalf, base),
    pt(cx + FLASK.neckHalf, shoulder),
    pt(cx + FLASK.neckHalf, neckTop),
  ]);
  s.block(cx - FLASK.bodyHalf, shoulder, 2 * FLASK.bodyHalf, FLASK.body);
  s.block(cx - FLASK.neckHalf - 2, neckTop, 2 * FLASK.neckHalf + 4, FLASK.neck);
  const wallY = shoulder + FLASK.body * 0.45;
  return {
    cx,
    base,
    mouthTop: neckTop,
    innerHalf: FLASK.neckHalf,
    liquidTop,
    wall: pt(cx + halfAt(wallY), wallY),
    liquidMid: pt(cx + 14, liquidTop + 16),
    left: cx - FLASK.bodyHalf,
    right: cx + FLASK.bodyHalf,
  };
}

const TUBES: Record<"test-tube" | "boiling-tube", { half: number; height: number }> = {
  "test-tube": { half: 11, height: 118 },
  "boiling-tube": { half: 16, height: 140 },
};

/**
 * A test tube or boiling tube, upright, with its liquid to `liquidTop` and any lumps at the bottom. Standing in another
 * liquid (a water bath), its inside is masked so that liquid stops at its wall, and its own liquid takes the inner tone.
 */
function uprightTube(s: Sketch, cx: number, top: number, bottom: number, half: number, liquidTop: number | null, solid: boolean, inLiquid = false): void {
  // The interior: the straight sides, then the round bottom from the right round to the left.
  const r = half - 1.4;
  const interior = [pt(cx - r, top), pt(cx + r, top), ...arcPoints(cx, bottom - half, r, 0, Math.PI, 12)];
  if (inLiquid) s.add({ kind: "path", d: pathOf(interior, true), role: "mask" });
  if (liquidTop !== null) {
    const surface = clipBelow(interior, liquidTop);
    if (surface.length > 2) s.add({ kind: "path", d: pathOf(surface, true), role: inLiquid ? "inner" : "liquid" });
  }
  if (solid) s.lumps(cx, bottom - half * 0.55, half > 12 ? 3 : 2, half - 8);
  s.add({ kind: "path", d: `${M(cx - half, top)} ${L(cx - half, bottom - half)} ${A(half, 0, cx + half, bottom - half)} ${L(cx + half, top)}`, role: "glass" });
  s.block(cx - half, top, 2 * half, bottom - top);
}

/** A tube used to make a gas in. */
function tubeGenerator(s: Sketch, kind: "test-tube" | "boiling-tube", cx: number, base: number, contents: Contents | undefined): Generator {
  const { half, height } = TUBES[kind];
  const top = base - height;
  const liquidTop = base - 46;
  uprightTube(s, cx, top, base, half, liquidTop, Boolean(contents?.solid));
  return {
    cx,
    base,
    mouthTop: top,
    innerHalf: half,
    liquidTop,
    wall: pt(cx + half, top + height * 0.4),
    liquidMid: pt(cx + 4, liquidTop + 18),
    left: cx - half,
    right: cx + half,
  };
}

/**
 * A bung in a mouth whose inside is `innerHalf` wide each side of `cx`, its top 6 units proud, with a hole for each
 * tube: the rubber is drawn in pieces round the holes, so no line crosses a tube's bore (a blocked tube is a lost mark).
 */
function bung(s: Sketch, cx: number, mouthTop: number, innerHalf: number, holes: Array<{ x: number; half: number }>): { top: number; bottom: number; left: number; right: number } {
  const top = mouthTop - 6;
  const height = 20;
  const bottom = top + height;
  const topHalf = innerHalf + 4;
  const bottomHalf = innerHalf + 1;
  const leftAt = (y: number) => cx - topHalf + ((topHalf - bottomHalf) * (y - top)) / height;
  const rightAt = (y: number) => cx + topHalf - ((topHalf - bottomHalf) * (y - top)) / height;
  const cuts = holes.map((h) => [h.x - h.half, h.x + h.half] as const).sort((p, q) => p[0] - q[0]);
  const spans: Array<[number, number]> = [];
  let from = cx - topHalf;
  for (const [x0, x1] of cuts) {
    if (x0 > from) spans.push([from, x0]);
    from = Math.max(from, x1);
  }
  if (from < cx + topHalf) spans.push([from, cx + topHalf]);
  s.anatomy.bung = [];
  for (const [x0, x1] of spans) {
    const tl = Math.max(x0, leftAt(top));
    const tr = Math.min(x1, rightAt(top));
    const bl = Math.max(x0, leftAt(bottom));
    const br = Math.min(x1, rightAt(bottom));
    s.add({ kind: "path", d: pathOf([pt(tl, top), pt(tr, top), pt(br, bottom), pt(bl, bottom)], true), role: "rubber", tag: "bung" });
    s.anatomy.bung.push({ x: tl, w: tr - tl });
  }
  s.block(cx - topHalf, top, 2 * topHalf, height);
  return { top, bottom, left: cx - topHalf, right: cx + topHalf };
}

/** Where a path first goes below a horizontal line, and all of it from there: the part of a tube under water. */
function pathBelow(path: readonly Pt[], y: number): Pt[] {
  for (let i = 0; i < path.length; i++) {
    if (path[i].y >= y) {
      if (i === 0) return [...path];
      const a = path[i - 1];
      const b = path[i];
      const cross = a.y === b.y ? a : pt(a.x + ((b.x - a.x) * (y - a.y)) / (b.y - a.y), y);
      return [cross, ...path.slice(i)];
    }
  }
  return [];
}

/**
 * A glass tube bent along a centreline: two walls the bore apart, open at both ends. Where it runs under water its bore
 * is painted the page's colour, so it reads as an open tube there too.
 */
function glassTube(s: Sketch, path: readonly Pt[], half: number, waterTop?: number): void {
  if (waterTop !== undefined) {
    const under = pathBelow(path, waterTop);
    if (under.length > 1) s.add({ kind: "path", d: pathOf(under), role: "gap", width: 2 * half - 1.6 });
  }
  s.glass(offsetPolyline(path, half));
  s.glass(offsetPolyline(path, -half));
  for (let i = 1; i < path.length; i++) {
    const p = path[i - 1];
    const q = path[i];
    s.block(Math.min(p.x, q.x) - half, Math.min(p.y, q.y) - half, Math.abs(q.x - p.x) + 2 * half, Math.abs(q.y - p.y) + 2 * half);
  }
}

/** A gas syringe lying level, its nozzle's open end at xn: returns its nozzle (where the gas goes in) and its extent. */
function gasSyringe(s: Sketch, xn: number, yc: number): { mouth: Box; x0: number; x1: number; top: number; bottom: number } {
  const nozzle = 12;
  const nozzleHalf = 5.5;
  const barrel = 132;
  const half = 15;
  const x0 = xn + nozzle;
  const x1 = x0 + barrel;
  for (let i = 1; x0 + i * 11 < x1 - 8; i++) {
    const x = x0 + i * 11;
    s.fine(x, yc - half, x, yc - half + (i % 5 === 0 ? 8 : 5));
  }
  s.glass([pt(xn, yc - nozzleHalf), pt(x0, yc - nozzleHalf), pt(x0, yc - half), pt(x1, yc - half), pt(x1, yc - half - 5)]);
  s.glass([pt(xn, yc + nozzleHalf), pt(x0, yc + nozzleHalf), pt(x0, yc + half), pt(x1, yc + half), pt(x1, yc + half + 5)]);
  const seal = x0 + 58;
  s.add({ kind: "rect", x: seal, y: yc - half + 1.6, w: 6, h: 2 * half - 3.2, r: 1.5, role: "rubber" });
  s.add({ kind: "rect", x: seal + 6, y: yc - 2.5, w: x1 + 20 - (seal + 6), h: 5, role: "body" });
  s.add({ kind: "rect", x: x1 + 20, y: yc - 12, w: 5, h: 24, r: 1.5, role: "body" });
  s.block(xn, yc - half - 5, x1 + 25 - xn, 2 * half + 10);
  return { mouth: { x: xn, y: yc - nozzleHalf, w: nozzle, h: 2 * nozzleHalf }, x0, x1: x1 + 25, top: yc - half - 5, bottom: yc + half + 5 };
}

/** A trough on the bench from x0 to x1, filled with water to waterTop. */
function troughOfWater(s: Sketch, x0: number, x1: number, rim: number, floor: number, waterTop: number): void {
  s.add({ kind: "rect", x: x0 + 1.2, y: waterTop, w: x1 - x0 - 2.4, h: floor - waterTop - 1.2, role: "liquid" });
  s.glass([pt(x0, rim), pt(x0, floor), pt(x1, floor), pt(x1, rim)]);
  s.block(x0, rim, x1 - x0, floor - rim);
}

/** A beehive shelf standing on the trough's floor, centred on cx: a hole in its top, an arch in its side for the tube. */
function beehiveShelf(s: Sketch, cx: number, floor: number): { top: number; cavity: Box; left: number; right: number } {
  // In cross-section: a squat dome with a hole in its top for the gas, and an opening low in its side for the tube.
  const half = 34;
  const top = floor - 32;
  const wall = 8;
  const hole = 7;
  const opening = 16;
  const r = 11;
  s.add({
    kind: "path",
    d: `${M(cx - half, floor - opening)} ${L(cx - half, top + r)} ${Q(cx - half, top, cx - half + r, top)} ${L(cx - hole, top)} ${L(cx - hole, top + wall)} ${L(cx - half + wall + 3, top + wall)} ${Q(cx - half + wall, top + wall, cx - half + wall, top + wall + 3)} ${L(cx - half + wall, floor - opening)} Z`,
    role: "body",
    tag: "beehive-shelf",
  });
  s.add({
    kind: "path",
    d: `${M(cx + hole, top)} ${L(cx + half - r, top)} ${Q(cx + half, top, cx + half, top + r)} ${L(cx + half, floor)} ${L(cx + half - wall, floor)} ${L(cx + half - wall, top + wall + 3)} ${Q(cx + half - wall, top + wall, cx + half - wall - 3, top + wall)} ${L(cx + hole, top + wall)} Z`,
    role: "body",
    tag: "beehive-shelf",
  });
  s.block(cx - half, top, 2 * half, 32);
  return { top, cavity: { x: cx - half + wall, y: top + wall, w: 2 * (half - wall), h: floor - top - wall }, left: cx - half, right: cx + half };
}

/** A gas jar standing upside down with its mouth at `mouth`, full of water below `waterFrom`, gas collected above it. */
function upturnedGasJar(s: Sketch, cx: number, mouth: number, height: number, waterFrom: number): { top: number; left: number; right: number } {
  const half = 26;
  const top = mouth - height;
  s.add({ kind: "rect", x: cx - half + 1.2, y: waterFrom, w: 2 * half - 2.4, h: mouth - waterFrom, role: "liquid" });
  s.add({
    kind: "path",
    d: `${M(cx - half, mouth)} ${L(cx - half, top + 6)} ${Q(cx - half, top, cx - half + 6, top)} ${L(cx + half - 6, top)} ${Q(cx + half, top, cx + half, top + 6)} ${L(cx + half, mouth)}`,
    role: "glass",
  });
  // The ground rim of the jar's mouth.
  s.glass([pt(cx - half - 4, mouth), pt(cx - half, mouth)]);
  s.glass([pt(cx + half, mouth), pt(cx + half + 4, mouth)]);
  s.block(cx - half - 4, top, 2 * half + 8, height);
  return { top, left: cx - half, right: cx + half };
}

/** A measuring cylinder, upright on its foot or upside down in a trough, with its scale on the left. */
function measuringCylinder(
  s: Sketch,
  cx: number,
  top: number,
  bottom: number,
  opts: { upturned: boolean; liquidTop: number | null },
): { left: number; right: number; top: number; bottom: number } {
  const half = 20;
  const inner = half - 1.4;
  if (opts.liquidTop !== null) {
    if (opts.upturned) s.add({ kind: "rect", x: cx - inner, y: opts.liquidTop, w: 2 * inner, h: bottom - opts.liquidTop, role: "liquid" });
    else {
      // The meniscus: the surface dips in the middle.
      const t = opts.liquidTop;
      s.add({ kind: "path", d: `${M(cx - inner, t - 2)} ${Q(cx, t + 4, cx + inner, t - 2)} ${L(cx + inner, bottom - 1)} ${L(cx - inner, bottom - 1)} Z`, role: "liquid" });
      s.add({ kind: "path", d: `${M(cx - inner, t - 2)} ${Q(cx, t + 4, cx + inner, t - 2)}`, role: "fine" });
    }
  }
  const closed = opts.upturned ? top : bottom;
  const open = opts.upturned ? bottom : top;
  for (let i = 1; ; i++) {
    const y = opts.upturned ? closed + 8 + i * 11 : closed - 8 - i * 11;
    if (opts.upturned ? y > open - 10 : y < open + 10) break;
    s.fine(cx - half, y, cx - half + (i % 5 === 0 ? 11 : 6), y);
  }
  s.glass([pt(cx - half, open), pt(cx - half, closed), pt(cx + half, closed), pt(cx + half, open)]);
  // The foot, on the closed end.
  const footY = opts.upturned ? closed - 6 : closed;
  s.add({ kind: "rect", x: cx - 30, y: footY, w: 60, h: 6, r: 1.5, role: "body" });
  if (!opts.upturned) s.glass([pt(cx - half, open), pt(cx - half - 5, open - 5)]);
  s.block(cx - 30, Math.min(top, footY), 60, Math.max(bottom, footY + 6) - Math.min(top, footY));
  return { left: cx - half, right: cx + half, top, bottom };
}

/** A thermometer standing with its bulb at bulbY. */
function thermometer(s: Sketch, x: number, top: number, bulbY: number): void {
  s.add({ kind: "path", d: `${M(x - 3.5, bulbY - 5)} ${L(x - 3.5, top + 3.5)} ${A(3.5, 1, x + 3.5, top + 3.5)} ${L(x + 3.5, bulbY - 5)}`, role: "glass" });
  s.fine(x, bulbY - 6, x, bulbY - (bulbY - top) * 0.42, "thermometer-thread");
  s.add({ kind: "circle", cx: x, cy: bulbY, r: 6, role: "solid", tag: "thermometer-bulb" });
  s.block(x - 6, top, 12, bulbY + 6 - top);
  s.anatomy.thermometerBulb = pt(x, bulbY);
}

/** A beaker (lips turned out) from top to bottom, with its liquid. */
function beaker(s: Sketch, cx: number, top: number, bottom: number, half: number, liquidTop: number | null): void {
  if (liquidTop !== null) s.add({ kind: "path", d: `${M(cx - half + 1.2, liquidTop)} ${L(cx + half - 1.2, liquidTop)} ${L(cx + half - 1.2, bottom - 5)} ${Q(cx + half - 1.2, bottom - 1.2, cx + half - 5, bottom - 1.2)} ${L(cx - half + 5, bottom - 1.2)} ${Q(cx - half + 1.2, bottom - 1.2, cx - half + 1.2, bottom - 5)} Z`, role: "liquid" });
  s.add({
    kind: "path",
    d: `${M(cx - half - 6, top - 5)} ${Q(cx - half, top - 1, cx - half, top + 5)} ${L(cx - half, bottom - 5)} ${Q(cx - half, bottom, cx - half + 5, bottom)} ${L(cx + half - 5, bottom)} ${Q(cx + half, bottom, cx + half, bottom - 5)} ${L(cx + half, top + 5)} ${Q(cx + half, top - 1, cx + half + 6, top - 5)}`,
    role: "glass",
  });
  s.block(cx - half - 6, top - 5, 2 * half + 12, bottom - top + 5);
}

/** A water bath: an open tank of water. */
function waterBath(s: Sketch, cx: number, top: number, bottom: number, half: number, waterTop: number): void {
  s.add({ kind: "rect", x: cx - half + 1.2, y: waterTop, w: 2 * half - 2.4, h: bottom - waterTop - 1.2, r: 3, role: "liquid" });
  s.add({ kind: "path", d: `${M(cx - half, top)} ${L(cx - half, bottom - 5)} ${Q(cx - half, bottom, cx - half + 5, bottom)} ${L(cx + half - 5, bottom)} ${Q(cx + half, bottom, cx + half, bottom - 5)} ${L(cx + half, top)}`, role: "glass" });
  s.block(cx - half, top, 2 * half, bottom - top);
}

/** A polystyrene cup: a thick, tapered, insulating wall, its liquid inside. */
function polystyreneCup(s: Sketch, cx: number, top: number, bottom: number, liquidTop: number | null): { innerLeft: (y: number) => number; outerRight: (y: number) => number } {
  const topHalf = 50;
  const bottomHalf = 36;
  const wall = 7;
  const outer = (y: number) => topHalf - ((topHalf - bottomHalf) * (y - top)) / (bottom - top);
  const inner = (y: number) => outer(y) - wall;
  if (liquidTop !== null) {
    const floor = bottom - wall;
    s.liquid([pt(cx - inner(liquidTop) + 1, liquidTop), pt(cx + inner(liquidTop) - 1, liquidTop), pt(cx + inner(floor) - 1, floor - 0.5), pt(cx - inner(floor) + 1, floor - 0.5)]);
  }
  const floor = bottom - wall;
  s.add({
    kind: "path",
    d: pathOf(
      [
        pt(cx - topHalf, top),
        pt(cx - bottomHalf, bottom),
        pt(cx + bottomHalf, bottom),
        pt(cx + topHalf, top),
        pt(cx + inner(top), top),
        pt(cx + inner(floor), floor),
        pt(cx - inner(floor), floor),
        pt(cx - inner(top), top),
      ],
      true,
    ),
    role: "body",
    tag: "polystyrene-cup",
  });
  s.block(cx - topHalf, top, 2 * topHalf, bottom - top);
  return { innerLeft: (y) => cx - inner(y), outerRight: (y) => cx + outer(y) };
}

/** A stone hanging on a thread from above the vessel. */
function stoneOnThread(s: Sketch, cx: number, cy: number, threadTop: number): void {
  s.fine(cx, threadTop, cx, cy - 9, "thread");
  s.add({ kind: "path", d: pathOf([pt(cx - 13, cy - 2), pt(cx - 6, cy - 10), pt(cx + 7, cy - 9), pt(cx + 13, cy), pt(cx + 7, cy + 10), pt(cx - 8, cy + 9)], true), role: "solid", tag: "stone" });
  s.block(cx - 13, threadTop, 26, cy + 10 - threadTop);
}

/** A leaf standing in a liquid: a pointed blade with its midrib. */
function leafIn(s: Sketch, cx: number, top: number, bottom: number, half: number): void {
  const mid = (top + bottom) / 2;
  s.add({ kind: "path", d: `${M(cx, top)} ${Q(cx + half * 1.6, mid, cx, bottom)} ${Q(cx - half * 1.6, mid, cx, top)} Z`, role: "tissue", tag: "leaf" });
  s.fine(cx, top + 3, cx, bottom - 2);
  s.block(cx - half, top, 2 * half, bottom - top);
}

/** A stop clock: a face with its hands, a crown and a button. */
function stopClock(s: Sketch, cx: number, cy: number): void {
  const r = 17;
  s.add({ kind: "rect", x: cx - 3.5, y: cy - r - 6, w: 7, h: 6, r: 1.5, role: "body" });
  s.add({ kind: "circle", cx, cy, r, role: "body", tag: "stop-clock" });
  for (let i = 0; i < 12; i++) {
    const t = (i * Math.PI) / 6;
    const long = i % 3 === 0;
    s.fine(cx + (r - (long ? 6 : 3.5)) * Math.sin(t), cy - (r - (long ? 6 : 3.5)) * Math.cos(t), cx + (r - 1.5) * Math.sin(t), cy - (r - 1.5) * Math.cos(t));
  }
  s.fine(cx, cy, cx, cy - r + 6);
  s.fine(cx, cy, cx + 7, cy + 4);
  s.block(cx - r, cy - r - 6, 2 * r, 2 * r + 6);
}

/** A flame from its base up to its tip: an outer cone and an inner one. Returns its outer edge's x at a height. */
function flame(s: Sketch, cx: number, base: number, height: number, maxHalf: number): { edgeAt: (y: number) => number; tip: Pt } {
  const width = (t: number) => maxHalf * Math.pow(Math.max(0, Math.sin(Math.PI * (0.18 + 0.82 * t))), 1.15);
  const outline = (h: number, m: number) => {
    const right = Array.from({ length: 13 }, (_, i) => i / 12).map((t) => pt(cx + (width(t) * m) / maxHalf, base - h * t));
    const left = [...right].reverse().map((p) => pt(2 * cx - p.x, p.y));
    return [...right, ...left.slice(1, -1)];
  };
  s.add({ kind: "path", d: smoothClosed(outline(height, maxHalf)), role: "flame", tag: "flame" });
  s.add({ kind: "path", d: smoothClosed(outline(height * 0.42, maxHalf * 0.5)), role: "core", tag: "flame" });
  s.block(cx - maxHalf, base - height, 2 * maxHalf, height);
  const edgeAt = (y: number) => cx + width((base - y) / height);
  s.anatomy.flame = { tip: pt(cx, base - height), base: pt(cx, base), edgeX: cx + maxHalf };
  return { edgeAt, tip: pt(cx, base - height) };
}

/** A Bunsen burner on its base at `base`, its barrel `barrel` tall: returns the top of the barrel, where its flame starts. */
function bunsenBurner(s: Sketch, cx: number, base: number, barrel: number): { top: number; left: number } {
  s.add({ kind: "rect", x: cx - 30, y: base - 8, w: 60, h: 8, r: 2, role: "body", tag: "bunsen" });
  s.add({ kind: "rect", x: cx - 30, y: base - 18, w: 23, h: 5, r: 1.5, role: "body", tag: "bunsen" });
  s.add({ kind: "rect", x: cx - 7, y: base - 8 - barrel, w: 14, h: barrel, role: "body", tag: "bunsen" });
  s.add({ kind: "rect", x: cx - 10, y: base - 30, w: 20, h: 11, r: 2, role: "body", tag: "bunsen" });
  s.add({ kind: "circle", cx, cy: base - 24.5, r: 2.6, role: "gap" });
  // Room taken piece by piece, so a label may sit beside the narrow barrel.
  s.block(cx - 30, base - 8, 60, 8);
  s.block(cx - 30, base - 18, 23, 5);
  s.block(cx - 10, base - 30, 20, 11);
  s.block(cx - 7, base - 8 - barrel, 14, barrel);
  return { top: base - 8 - barrel, left: cx - 7 };
}

/** A metre rule lying level, with its centimetre marks. */
function metreRule(s: Sketch, x0: number, x1: number, y: number): void {
  s.add({ kind: "rect", x: x0, y, w: x1 - x0, h: 12, r: 1.5, role: "body", tag: "metre-rule" });
  const step = (x1 - x0) / 20;
  for (let i = 1; i < 20; i++) s.fine(x0 + i * step, y, x0 + i * step, y + (i % 5 === 0 ? 7 : 4));
  s.block(x0, y, x1 - x0, 12);
}

/** Slotted masses on a hanger, hung by a thread from `from`. */
function hungWeight(s: Sketch, x: number, from: number, top: number): number {
  s.fine(x, from, x, top, "thread");
  s.add({ kind: "path", d: `${M(x - 5, top + 4)} ${Q(x - 5, top - 2, x, top - 2)} ${Q(x + 5, top - 2, x + 5, top + 4)}`, role: "fine" });
  for (let i = 0; i < 3; i++) s.add({ kind: "rect", x: x - 13, y: top + 4 + i * 8, w: 26, h: 7, r: 1.5, role: "body", tag: "weight" });
  s.block(x - 13, from, 26, top + 28 - from);
  return top + 28;
}

/* ------------------------------------------------------------------------------------------------------------------ */
/* Counting the pieces                                                                                                 */
/* ------------------------------------------------------------------------------------------------------------------ */

type Tally = { all: Piece[]; of: (kind: PieceKind) => Piece[]; one: (kind: PieceKind) => Piece | undefined };

function tally(pieces: readonly Piece[]): Tally {
  return {
    all: [...pieces],
    of: (kind) => pieces.filter((p) => p.kind === kind),
    one: (kind) => pieces.find((p) => p.kind === kind),
  };
}

/** True when every piece's kind is allowed and none appears more times than allowed. */
function only(pieces: readonly Piece[], allowed: Partial<Record<PieceKind, number>>): boolean {
  const counts = new Map<PieceKind, number>();
  for (const p of pieces) counts.set(p.kind, (counts.get(p.kind) ?? 0) + 1);
  for (const [kind, count] of counts) if ((allowed[kind] ?? 0) < count) return false;
  return true;
}

/** Label requests for a vessel's contents when they have a label of their own. */
function contentsLabel(s: Sketch, p: Piece, target: Pt, options: LabelOption[]): void {
  if (p.contents?.labelled) s.label(p.index, p.contents.text, target, options);
}

/* ------------------------------------------------------------------------------------------------------------------ */
/* gas-train                                                                                                           */
/* ------------------------------------------------------------------------------------------------------------------ */

function gasTrain(pieces: readonly Piece[]): ApparatusPlan | null {
  const t = tally(pieces);
  const tube = t.one("delivery-tube");
  const generator = pieces.find((p) => p.kind === "conical-flask" || p.kind === "boiling-tube" || p.kind === "test-tube");
  if (!tube || !generator) return null;
  const rest = pieces.filter((p) => p !== generator);
  const allowed = { "delivery-tube": 1, bung: 1, "thistle-funnel": 1, trough: 1, "beehive-shelf": 1, "stop-clock": 1, "gas-syringe": 1, "gas-jar": 1, "measuring-cylinder": 1, "test-tube": 1, "boiling-tube": 1 };
  if (!only(rest, allowed)) return null;
  const syringe = t.one("gas-syringe");
  const jar = t.one("gas-jar");
  const cylinder = rest.find((p) => p.kind === "measuring-cylinder");
  const tubeCollector = rest.find((p) => p.kind === "test-tube" || p.kind === "boiling-tube");
  const collectors = [syringe, jar, cylinder, tubeCollector].filter((p): p is Piece => p !== undefined);
  if (collectors.length !== 1) return null;
  const trough = t.one("trough");
  const shelf = t.one("beehive-shelf");
  const funnel = t.one("thistle-funnel");
  const plug = t.one("bung");
  const clock = t.one("stop-clock");
  const overWater = Boolean(jar || cylinder);
  if (overWater !== Boolean(trough)) return null;
  if (shelf && !jar) return null;
  if (funnel && generator.kind !== "conical-flask") return null;

  const s = new Sketch();
  // Height above the delivery tube's level run: room for its label, for a thistle funnel's head and its label, or for
  // the label over a collector standing in a trough.
  const yRun = funnel ? 78 : trough ? 46 : 38;
  const mouthTop = yRun + 34 + 6;
  const isFlask = generator.kind === "conical-flask";
  // With a funnel the flask sits a little further in, so the funnel's label has room on its left.
  const gx = isFlask ? (funnel ? 82 : 74) : 62;
  const base = isFlask ? mouthTop + FLASK.body + FLASK.neck : mouthTop + TUBES[generator.kind as "test-tube" | "boiling-tube"].height;

  // The generator always holds a reacting liquid, named or not: a set-up with an empty flask would make no gas.
  const gen = isFlask ? conicalFlask(s, gx, base, generator.contents, true) : tubeGenerator(s, generator.kind as "test-tube" | "boiling-tube", gx, base, generator.contents);
  s.anatomy.generatorLiquidTop = gen.liquidTop;
  const tubeHalf = 3.5;
  const tx = funnel ? gx + 6 : gx;
  const fx = gx - 5;
  const holes = [{ x: tx, half: tubeHalf }, ...(funnel ? [{ x: fx, half: 2.5 }] : [])];
  const stopper = bung(s, gx, gen.mouthTop, gen.innerHalf, holes);
  const start = pt(tx, stopper.bottom + 8);

  // The thistle funnel: its stem through the bung to below the liquid's surface, its head above the tube's run.
  let funnelHead: Box | null = null;
  if (funnel) {
    const stemEnd = gen.liquidTop + 16;
    const headBase = yRun - 18;
    glassTube(s, [pt(fx, stemEnd), pt(fx, headBase)], 2.5);
    s.add({ kind: "circle", cx: fx, cy: headBase - 7, r: 7.5, role: "glass" });
    s.add({ kind: "path", d: `${M(fx - 4.5, headBase - 13)} ${L(fx - 14, headBase - 32)} ${M(fx + 4.5, headBase - 13)} ${L(fx + 14, headBase - 32)}`, role: "glass" });
    s.block(fx - 14, headBase - 32, 28, 32);
    s.anatomy.funnelStemEnd = pt(fx, stemEnd);
    funnelHead = { x: fx - 14, y: headBase - 32, w: 28, h: 32 };
  }

  let path: Pt[];
  let collectorWords = "";
  let runEnd: number;
  if (syringe) {
    const xn = isFlask ? 216 : 206;
    const g = gasSyringe(s, xn, yRun);
    path = [start, pt(tx, yRun), pt(xn + 6, yRun)];
    runEnd = xn;
    s.anatomy.collectorMouth = g.mouth;
    s.label(syringe.index, syringe.label, pt((g.x0 + g.x1) / 2 - 20, g.bottom - 5), [
      { side: "below", at: pt((g.x0 + g.x1) / 2 - 20, g.bottom + 6), targets: [pt((g.x0 + g.x1) / 2 - 20, g.bottom - 5)] },
      { side: "above", at: pt((g.x0 + g.x1) / 2 - 20, g.top - 4), targets: [pt((g.x0 + g.x1) / 2 - 20, g.top + 5)] },
    ]);
    collectorWords = `to ${a(syringe.label)}`;
  } else if (tubeCollector) {
    const kind = tubeCollector.kind as "test-tube" | "boiling-tube";
    const { half } = TUBES[kind];
    const cx = 300;
    const top = yRun + 30;
    const liquid = tubeCollector.contents?.liquid ? base - 58 : null;
    uprightTube(s, cx, top, base, half, liquid, Boolean(tubeCollector.contents?.solid));
    const end = liquid !== null ? base - 24 : base - half - 10;
    path = [start, pt(tx, yRun), pt(cx, yRun), pt(cx, end)];
    runEnd = cx;
    s.anatomy.collectorMouth = { x: cx - half, y: top, w: 2 * half, h: base - top };
    if (liquid !== null) s.anatomy.collectorLiquidTop = liquid;
    s.label(tubeCollector.index, tubeCollector.label, pt(cx + half, top + 30), [
      { side: "right", at: pt(cx + half + 14, top + 26) },
      { side: "left", at: pt(cx - half - 14, top + 26), targets: [pt(cx - half, top + 30)] },
    ]);
    if (liquid !== null) contentsLabel(s, tubeCollector, pt(cx + 3, (liquid + base) / 2), [
      { side: "right", at: pt(cx + half + 14, (liquid + base) / 2) },
      { side: "below", at: pt(cx, base + 6), targets: [pt(cx, base - 4)] },
    ]);
    collectorWords = liquid !== null ? `down into ${named(tubeCollector)}, its end under the surface` : `down into ${named(tubeCollector)}`;
  } else {
    // Over water: a trough on the right, the tube down into it, along its floor and up into the collector.
    const x0 = 198;
    const x1 = 392;
    const floor = base;
    const rim = floor - 76;
    const waterTop = rim + 12;
    troughOfWater(s, x0, x1, rim, floor, waterTop);
    s.anatomy.troughWaterTop = waterTop;
    const cx = 318;
    const xDown = 228;
    let end: Pt;
    if (jar) {
      if (shelf) {
        const sh = beehiveShelf(s, cx, floor);
        const g = upturnedGasJar(s, cx, sh.top, 124, sh.top - 124 + 34);
        end = pt(cx, floor - 19);
        s.anatomy.collectorMouth = sh.cavity;
        s.label(shelf.index, shelf.label, pt(sh.right - 2, sh.top + 14), [
          { side: "below", at: pt(cx + 14, floor + 6), targets: [pt(sh.right - 3, floor - 6)] },
          { side: "right", at: pt(x1 + 4, floor - 12), targets: [pt(sh.right, floor - 12)] },
        ]);
        s.label(jar.index, jar.label, pt(g.right, g.top + 20), [
          { side: "above", at: pt(cx, g.top - 5), targets: [pt(cx, g.top)] },
          { side: "right", at: pt(g.right + 10, g.top + 22) },
        ]);
        collectorWords = `down into ${named(trough!)}, under ${a(shelf.label)} and up into ${a(jar.label)} standing upside down on the shelf, full of water`;
      } else {
        const mouth = floor - 24;
        const g = upturnedGasJar(s, cx, mouth, 124, mouth - 124 + 34);
        end = pt(cx, mouth - 14);
        s.anatomy.collectorMouth = { x: cx - 26, y: mouth - 30, w: 52, h: 30 };
        s.label(jar.index, jar.label, pt(g.right, g.top + 20), [
          { side: "above", at: pt(cx, g.top - 5), targets: [pt(cx, g.top)] },
          { side: "right", at: pt(g.right + 10, g.top + 22) },
        ]);
        collectorWords = `down into ${named(trough!)} and up into ${a(jar.label)} held upside down with its mouth under the water, full of water`;
      }
    } else {
      const mouth = floor - 24;
      const c = measuringCylinder(s, cx, mouth - 132, mouth, { upturned: true, liquidTop: mouth - 132 + 34 });
      end = pt(cx, mouth - 14);
      s.anatomy.collectorMouth = { x: c.left, y: mouth - 30, w: c.right - c.left, h: 30 };
      s.label(cylinder!.index, cylinder!.label, pt(cx, c.top - 6), [
        { side: "above", at: pt(cx - 8, c.top - 10), targets: [pt(cx, c.top - 6)] },
        { side: "right", at: pt(c.right + 12, c.top + 30), maxWidth: 110, targets: [pt(c.right, c.top + 40)] },
      ]);
      collectorWords = `down into ${named(trough!)} and up into ${a(cylinder!.label)} standing upside down in the water, full of water`;
    }
    path = [start, pt(tx, yRun), pt(xDown, yRun), pt(xDown, floor - 8), pt(cx, floor - 8), end];
    runEnd = xDown;
    s.label(trough!.index, trough!.label, pt(x0 + 30, floor), [
      { side: "below", at: pt(x0 + 44, floor + 6), targets: [pt(x0 + 44, floor)] },
      { side: "left", at: pt(x0 - 10, waterTop + 20), targets: [pt(x0 + 12, waterTop + 20)], maxWidth: 110 },
    ]);
    contentsLabel(s, trough!, pt(x0 + 14, waterTop + 26), [
      { side: "left", at: pt(x0 - 10, waterTop + 26), maxWidth: 110 },
      { side: "below", at: pt(x0 + 60, floor + 6), targets: [pt(x0 + 60, floor - 10)] },
    ]);
  }
  glassTube(s, path, tubeHalf, s.anatomy.troughWaterTop);
  s.anatomy.tube = { path, bore: tubeHalf };

  // Labels, most constrained first.
  const runMid = (tx + runEnd) / 2 + 6;
  s.label(tube.index, tube.label, pt(runMid, yRun - tubeHalf), [
    { side: "above", at: pt(runMid, yRun - tubeHalf - 5), targets: [pt(runMid, yRun - tubeHalf)] },
    { side: "below", at: pt(runMid, yRun + tubeHalf + 5), targets: [pt(runMid, yRun + tubeHalf)] },
  ]);
  if (funnel && funnelHead) {
    s.label(funnel.index, funnel.label, pt(funnelHead.x + 3, funnelHead.y + 8), [
      { side: "left", at: pt(funnelHead.x - 8, funnelHead.y + 12), maxWidth: 70 },
      { side: "above", at: pt(funnelHead.x + 14, funnelHead.y - 4), targets: [pt(funnelHead.x + 14, funnelHead.y)] },
    ]);
  }
  if (plug) {
    const y = (stopper.top + stopper.bottom) / 2;
    s.label(plug.index, plug.label, pt(stopper.right - 1, y), [
      { side: "right", at: pt(stopper.right + 16, y + 6), targets: [pt(stopper.right - 1, y)] },
      { side: "left", at: pt(stopper.left - 12, y), targets: [pt(stopper.left + 1, y)] },
    ]);
  }
  s.label(generator.index, generator.label, gen.wall, [
    { side: "below", at: pt(gx, base + 6), targets: [pt(gx, base)] },
    { side: "left", at: pt(gen.left - 6, base - 24), targets: [pt(gen.left + 8, base - 24)] },
  ]);
  contentsLabel(s, generator, gen.liquidMid, [
    { side: "right", at: pt(gen.right + 10, gen.liquidTop + 14), maxWidth: 150 },
    { side: "right", at: pt(gen.right + 10, gen.liquidTop + 14), maxWidth: 110 },
    { side: "below", at: pt(gx + 20, base + 6), maxWidth: 180, targets: [pt(gx + 10, base - 12)] },
  ]);
  if (clock) {
    const at = syringe ? pt(352, base - 34) : pt(gx + 30, 26);
    stopClock(s, at.x, at.y);
    s.label(clock.index, clock.label, pt(at.x, at.y + 17), [
      { side: "below", at: pt(at.x, at.y + 22), targets: [pt(at.x, at.y + 17)] },
      { side: "left", at: pt(at.x - 24, at.y), targets: [pt(at.x - 17, at.y)] },
    ]);
  }

  const inGenerator = funnel ? `, with ${a(funnel.label)} through the bung, its stem below the liquid` : "";
  const bungWords = plug ? `closed by ${a(plug.label)}` : "closed by a bung";
  const description = `Apparatus, drawn assembled: ${named(generator)}, ${bungWords}${inGenerator}. ${sentence(a(tube.label))} runs from the bung ${collectorWords}.${clock ? ` ${sentence(a(clock.label))} stands beside it.` : ""}`;
  return finish(s, "gas-train", description);
}

/* ------------------------------------------------------------------------------------------------------------------ */
/* vessel                                                                                                              */
/* ------------------------------------------------------------------------------------------------------------------ */

function vessel(pieces: readonly Piece[]): ApparatusPlan | null {
  const t = tally(pieces);
  const outer = t.one("water-bath") ?? t.one("beaker") ?? t.one("polystyrene-cup") ?? t.one("measuring-cylinder") ?? t.one("boiling-tube") ?? t.one("test-tube");
  if (!outer) return null;
  const allowed: Partial<Record<PieceKind, number>> = { thermometer: 1, "stop-clock": 1, mat: 1 };
  const s = new Sketch();
  const clock = t.one("stop-clock");
  const probe = t.one("thermometer");
  const mat = t.one("mat");
  let description = "";

  if (outer.kind === "water-bath") {
    Object.assign(allowed, { "water-bath": 1, "test-tube": 3, "boiling-tube": 3 });
    // A water bath stands on the bench as it is: a mat under it is not a set-up this draws, so it is not drawn at all.
    if (!only(pieces, allowed) || mat) return null;
    const tubes = pieces.filter((p) => p.kind === "test-tube" || p.kind === "boiling-tube");
    const cx = 190;
    const half = 140;
    const top = 104;
    const bottom = 262;
    const waterTop = 128;
    waterBath(s, cx, top, bottom, half, waterTop);
    const slots = tubes.length === 1 ? [cx - 30] : tubes.length === 2 ? [cx - 88, cx + 22] : [cx - 96, cx - 30, cx + 36];
    tubes.forEach((p, i) => {
      const { half: th } = TUBES[p.kind as "test-tube" | "boiling-tube"];
      const x = slots[i];
      const liquid = p.contents?.liquid ? 176 : null;
      uprightTube(s, x, 66, 236, th, liquid, Boolean(p.contents?.solid), true);
      if (p.contents?.labelled) s.label(p.index, p.contents.text, pt(x, 66), [
        { side: "above", at: pt(x, 60), targets: [pt(x, 66)], maxWidth: 110 },
      ]);
    });
    // One label for identical tubes, with a leader to each.
    const byLabel = new Map<string, Piece[]>();
    for (const p of tubes) byLabel.set(p.label, [...(byLabel.get(p.label) ?? []), p]);
    for (const [label, same] of byLabel) {
      const xs = same.map((p) => slots[tubes.indexOf(p)]);
      const th = TUBES[same[0].kind as "test-tube" | "boiling-tube"].half;
      const options: LabelOption[] =
        xs.length === 2
          ? // Between the two, a leader to each: one label for two identical pieces.
            [{ side: "centre", at: pt((xs[0] + xs[1]) / 2, 100), targets: [pt(xs[0] + th, 100), pt(xs[1] - th, 100)] }]
          : [];
      options.push({ side: "left", at: pt(Math.min(...xs) - th - 12, 100), targets: xs.map((x) => pt(x - th, 100)) });
      s.label(
        same.map((p) => p.index),
        label,
        xs.map((x) => pt(x - th, 100)),
        options,
      );
    }
    if (probe) {
      const x = cx + 100;
      thermometer(s, x, 44, 236);
      s.anatomy.bulbLiquidTop = waterTop;
      s.label(probe.index, probe.label, pt(x + 3.5, 60), [
        { side: "above", at: pt(x, 38), targets: [pt(x, 44)] },
        { side: "right", at: pt(x + 16, 60), targets: [pt(x + 4, 60)] },
      ]);
    }
    s.label(outer.index, outer.label, pt(cx, bottom), [{ side: "below", at: pt(cx, bottom + 6), targets: [pt(cx, bottom)] }]);
    contentsLabel(s, outer, pt(cx + half - 20, waterTop + 60), [{ side: "right", at: pt(cx + half + 8, waterTop + 60), maxWidth: 60 }]);
    const inside = [...tubes.map(named), ...(probe ? [a(probe.label)] : [])];
    const water = outer.contents?.labelled ? `holding ${outer.contents.text}` : "full of water";
    description = `Apparatus: ${a(outer.label)} ${water}, with ${listed(inside)} standing in it.`;
  } else if (outer.kind === "beaker" || (outer.kind === "polystyrene-cup" && !t.one("beaker"))) {
    Object.assign(allowed, { beaker: 1, "polystyrene-cup": 1, "boiling-tube": 1, "test-tube": 1, leaf: 1, stone: 1 });
    if (!only(pieces, allowed)) return null;
    const cup = t.one("polystyrene-cup");
    const inner = pieces.find((p) => p.kind === "boiling-tube" || p.kind === "test-tube");
    const leaf = t.one("leaf");
    const stone = t.one("stone");
    const outerBeaker = t.one("beaker");
    // Every piece is placed or nothing is drawn: a cup takes no tube, stone, leaf or mat; a leaf needs a tube to stand in.
    if ((cup && (inner || leaf || stone || mat)) || (leaf && !inner) || (stone && inner)) return null;
    if (pieces.filter((p) => p.kind === "boiling-tube" || p.kind === "test-tube").length > 1) return null;
    const cx = 180;
    const bottom = 272;
    if (cup) {
      // A polystyrene cup, standing in a beaker so it cannot tip, with the thermometer in its liquid.
      const cupTop = 118;
      const cupBottom = 266;
      const liquid = cup.contents?.liquid !== false ? 196 : null;
      if (outerBeaker) beaker(s, cx, 150, bottom, 76, null);
      const c = polystyreneCup(s, cx, cupTop, cupBottom, liquid);
      if (probe) {
        thermometer(s, cx + 6, 40, 244);
        s.anatomy.bulbLiquidTop = liquid ?? undefined;
        s.label(probe.index, probe.label, pt(cx + 9.5, 60), [
          { side: "right", at: pt(cx + 24, 52), targets: [pt(cx + 10, 56)] },
          { side: "left", at: pt(cx - 10, 50), targets: [pt(cx + 2, 54)] },
        ]);
      }
      s.label(cup.index, cup.label, pt(c.outerRight(cupTop + 20), cupTop + 20), [
        { side: "right", at: pt(c.outerRight(cupTop + 20) + 44, cupTop + 6), maxWidth: 150 },
        { side: "right", at: pt(c.outerRight(cupTop + 20) + 44, cupTop + 6), maxWidth: 90 },
      ]);
      if (liquid !== null) contentsLabel(s, cup, pt(c.innerLeft(liquid + 30) + 12, liquid + 30), [
        { side: "left", at: pt(cx - 96, liquid + 30), maxWidth: 80 },
        { side: "below", at: pt(cx, bottom + 6), targets: [pt(cx - 10, liquid + 40)] },
      ]);
      if (outerBeaker) s.label(outerBeaker.index, outerBeaker.label, pt(cx + 76, 236), [
        { side: "right", at: pt(cx + 92, 236), targets: [pt(cx + 76, 236)] },
        { side: "left", at: pt(cx - 92, 236), targets: [pt(cx - 76, 236)] },
      ]);
      description = `Apparatus: ${named(cup)}${outerBeaker ? ` standing in ${a(outerBeaker.label)} so that it cannot tip over` : ""}${probe ? `, with ${a(probe.label)} in the liquid` : ""}.`;
    } else {
      const b = outerBeaker!;
      const half = 86;
      const top = inner ? 162 : 120;
      const water = b.contents?.liquid ? top + 26 : null;
      beaker(s, cx, top, bottom, half, water);
      if (inner) {
        const { half: th } = TUBES[inner.kind as "test-tube" | "boiling-tube"];
        const tTop = 84;
        const tBottom = bottom - 12;
        const liquid = inner.contents?.liquid ? (water ?? 180) - 20 : null;
        uprightTube(s, cx, tTop, tBottom, th, liquid, Boolean(inner.contents?.solid), water !== null);
        if (leaf) leafIn(s, cx, (liquid ?? 180) + 14, tBottom - 26, 9);
        s.label(inner.index, inner.label, pt(cx + th, tTop + 30), [
          { side: "right", at: pt(cx + th + 22, tTop + 12), maxWidth: 170 },
          { side: "right", at: pt(cx + th + 22, tTop + 12), maxWidth: 120 },
        ]);
        if (inner.contents?.labelled && liquid !== null) contentsLabel(s, inner, pt(cx, liquid + 8), [{ side: "left", at: pt(cx - th - 30, liquid + 2), maxWidth: 90 }]);
        if (leaf) s.label(leaf.index, leaf.label, pt(cx - 3, tBottom - 60), [
          { side: "left", at: pt(cx - half - 12, tBottom - 64), targets: [pt(cx - 4, tBottom - 64)] },
          { side: "left", at: pt(cx - th - 40, tBottom - 64), targets: [pt(cx - 4, tBottom - 64)] },
        ]);
      }
      if (stone) {
        stoneOnThread(s, cx, bottom - 26, top - 30);
        s.label(stone.index, stone.label, pt(cx + 12, bottom - 26), [{ side: "right", at: pt(cx + half + 12, bottom - 30), maxWidth: 100 }]);
      }
      if (probe) {
        const x = inner ? cx - 44 : cx + 30;
        thermometer(s, x, top - 60, bottom - 22);
        s.anatomy.bulbLiquidTop = water ?? undefined;
        s.label(probe.index, probe.label, pt(x, top - 50), [
          { side: "left", at: pt(x - 14, top - 50), targets: [pt(x - 4, top - 50)] },
          { side: "above", at: pt(x, top - 66), targets: [pt(x, top - 60)] },
        ]);
      }
      if (water !== null) {
        const wy = water + 40;
        contentsLabel(s, b, pt(cx + half - 24, wy), [
          { side: "right", at: pt(cx + half + 14, wy), maxWidth: 90, targets: [pt(cx + half - 22, wy)] },
          { side: "left", at: pt(cx - half - 14, wy), maxWidth: 90, targets: [pt(cx - half + 22, wy)] },
        ]);
      }
      s.label(b.index, b.label, pt(cx + half, top + 20), [
        { side: "right", at: pt(cx + half + 14, top + 10), targets: [pt(cx + half + 1, top + 14)] },
        { side: "left", at: pt(cx - half - 14, top + 10), targets: [pt(cx - half - 1, top + 14)] },
      ]);
      if (mat) {
        s.add({ kind: "rect", x: cx - half - 30, y: bottom, w: 2 * half + 60, h: 9, r: 2, role: "body", tag: "mat" });
        s.block(cx - half - 30, bottom, 2 * half + 60, 9);
        s.label(mat.index, mat.label, pt(cx - half - 14, bottom + 9), [
          { side: "below", at: pt(cx - half + 10, bottom + 16), targets: [pt(cx - half - 12, bottom + 9)] },
          { side: "below", at: pt(cx, bottom + 16), targets: [pt(cx - 30, bottom + 9)] },
        ]);
      }
      const held = [
        ...(inner ? [`${named(inner)} standing in it${leaf ? `, ${a(leaf.label)} in the ${inner.contents?.text ?? "tube"}` : ""}`] : []),
        ...(stone ? [`${a(stone.label)} hanging in the liquid`] : []),
        ...(probe ? [`${a(probe.label)} in the liquid`] : []),
      ];
      description = `Apparatus: ${named(b)}${held.length ? `, with ${listed(held)}` : ""}${mat ? `, on ${a(mat.label)}` : ""}.`;
    }
  } else if (outer.kind === "measuring-cylinder") {
    Object.assign(allowed, { "measuring-cylinder": 1, stone: 1 });
    if (!only(pieces, allowed) || mat) return null;
    const stone = t.one("stone");
    const cx = 170;
    const top = 60;
    const bottom = 262;
    const liquid = outer.contents?.liquid ? 146 : null;
    const c = measuringCylinder(s, cx, top, bottom, { upturned: false, liquidTop: liquid });
    s.label(outer.index, outer.label, pt(c.right, top + 30), [{ side: "right", at: pt(c.right + 16, top + 26), maxWidth: 170 }]);
    if (liquid !== null) contentsLabel(s, outer, pt(cx + 8, liquid + 26), [{ side: "right", at: pt(c.right + 16, liquid + 30), maxWidth: 170, targets: [pt(c.right - 4, liquid + 30)] }]);
    if (stone) {
      stoneOnThread(s, cx + 2, bottom - 22, top - 30);
      s.label(stone.index, stone.label, pt(cx + 15, bottom - 22), [{ side: "right", at: pt(c.right + 16, bottom - 22), maxWidth: 170, targets: [pt(cx + 15, bottom - 22)] }]);
    }
    if (probe) {
      thermometer(s, cx - 8, top - 30, bottom - 24);
      s.anatomy.bulbLiquidTop = liquid ?? undefined;
      s.label(probe.index, probe.label, pt(cx - 8, top - 20), [{ side: "left", at: pt(cx - 40, top - 20), targets: [pt(cx - 12, top - 20)] }]);
    }
    description = `Apparatus: ${named(outer)}${stone ? `, with ${a(stone.label)} hanging in ${outer.contents?.text ?? "the liquid"}` : ""}${probe ? `, and ${a(probe.label)} in it` : ""}.`;
  } else {
    return null;
  }
  if (clock) {
    stopClock(s, 360, 40);
    s.label(clock.index, clock.label, pt(360, 57), [{ side: "below", at: pt(360, 62), targets: [pt(360, 57)] }]);
    description = `${description} ${sentence(a(clock.label))} stands beside it.`;
  }
  return finish(s, "vessel", description);
}

/* ------------------------------------------------------------------------------------------------------------------ */
/* beam                                                                                                                */
/* ------------------------------------------------------------------------------------------------------------------ */

function beam(pieces: readonly Piece[]): ApparatusPlan | null {
  const t = tally(pieces);
  const rule = t.one("metre-rule");
  const pivot = t.one("pivot");
  if (!rule || !pivot || !only(pieces, { "metre-rule": 1, pivot: 1, weight: 3 })) return null;
  const weights = t.of("weight");
  const s = new Sketch();
  const y = 92;
  metreRule(s, 20, 380, y);
  // The pivot: a knife edge under the rule's centre, on its block.
  s.add({ kind: "path", d: pathOf([pt(200, y + 12), pt(186, y + 38), pt(214, y + 38)], true), role: "body", tag: "pivot" });
  s.add({ kind: "rect", x: 176, y: y + 38, w: 48, h: 7, r: 1.5, role: "body", tag: "pivot" });
  s.block(176, y + 12, 48, 33);
  const xs = weights.length === 1 ? [92] : weights.length === 2 ? [92, 296] : [74, 128, 296];
  weights.forEach((w, i) => {
    const bottom = hungWeight(s, xs[i], y + 12, y + 40);
    s.label(w.index, w.label, pt(xs[i], bottom), [
      { side: "below", at: pt(xs[i], bottom + 6), targets: [pt(xs[i], bottom)] },
      { side: "right", at: pt(xs[i] + 22, bottom - 12), targets: [pt(xs[i] + 13, bottom - 12)] },
    ]);
  });
  s.label(pivot.index, pivot.label, pt(214, y + 30), [
    { side: "below", at: pt(200, y + 52), targets: [pt(200, y + 45)] },
    { side: "right", at: pt(232, y + 32), targets: [pt(210, y + 32)] },
  ]);
  s.label(rule.index, rule.label, pt(330, y), [
    { side: "above", at: pt(320, y - 12), targets: [pt(320, y)] },
    { side: "above", at: pt(90, y - 12), targets: [pt(90, y)] },
  ]);
  const hung =
    weights.length === 0
      ? ""
      : `, with ${counted(weights.map((w) => w.label))} hanging from it${weights.length === 2 ? ", one on each side of the pivot" : ""}`;
  return finish(s, "beam", `Apparatus: ${a(rule.label)} balanced on ${a(pivot.label)} at its centre${hung}.`);
}

/* ------------------------------------------------------------------------------------------------------------------ */
/* potometer                                                                                                           */
/* ------------------------------------------------------------------------------------------------------------------ */

function potometer(pieces: readonly Piece[]): ApparatusPlan | null {
  const t = tally(pieces);
  const shoot = t.one("leafy-shoot");
  const capillary = t.one("capillary-tube");
  if (!shoot || !capillary || !only(pieces, { "leafy-shoot": 1, "capillary-tube": 1, "air-bubble": 1, reservoir: 1, tap: 1, ruler: 1, "stop-clock": 1 })) return null;
  const bubble = t.one("air-bubble");
  const reservoir = t.one("reservoir");
  const tap = t.one("tap");
  const ruler = t.one("ruler");
  const clock = t.one("stop-clock");
  if (tap && !reservoir) return null;
  const s = new Sketch();
  const x = 64;
  const run = 214;
  const half = 4;
  // The shoot, cut under water and sealed into the water-filled tube.
  const stemTop = 44;
  const seal = 128;
  s.add({ kind: "rect", x: x - 2, y: stemTop, w: 4, h: seal - stemTop + 6, r: 2, role: "leaf", tag: "stem" });
  const leaves: Array<[number, number, number]> = [
    [x - 2, stemTop + 12, -1],
    [x + 2, stemTop + 30, 1],
    [x - 2, stemTop + 50, -1],
    [x + 2, stemTop + 68, 1],
  ];
  for (const [lx, ly, dir] of leaves) {
    const tipX = lx + dir * 40;
    const tipY = ly - 16;
    s.add({ kind: "path", d: `${M(lx, ly)} ${Q(lx + dir * 16, ly - 20, tipX, tipY)} ${Q(lx + dir * 26, ly + 4, lx, ly)} Z`, role: "leaf", tag: "leaf" });
  }
  s.block(x - 42, stemTop - 6, 84, seal - stemTop + 6);
  s.add({ kind: "rect", x: x - 9, y: seal, w: 18, h: 18, r: 3, role: "rubber", tag: "seal" });
  s.block(x - 9, seal, 18, 18);
  const path = [pt(x, seal + 18), pt(x, run), pt(386, run)];
  s.add({ kind: "path", d: pathOf(path), role: "wet", width: 2 * half - 1.2 });
  let bubbleX = 0;
  if (bubble) {
    bubbleX = 292;
    s.add({ kind: "ellipse", cx: bubbleX, cy: run, rx: 8, ry: half - 1, role: "gap", tag: "air-bubble" });
  }
  glassTube(s, path, half);
  // The reservoir and its tap, on a side arm, refill the tube and send the bubble back.
  let tapY = 0;
  let resTop = 0;
  const armX = 142;
  if (reservoir) {
    const armTop = 150;
    s.add({ kind: "path", d: pathOf([pt(armX, run - half), pt(armX, armTop)]), role: "wet", width: 2 * half - 1.2 });
    glassTube(s, [pt(armX, run - half), pt(armX, armTop)], half);
    resTop = 58;
    const rh = 14;
    s.add({ kind: "rect", x: armX - rh + 1.2, y: resTop + 30, w: 2 * rh - 2.4, h: armTop - resTop - 30, role: "liquid" });
    s.glass([pt(armX - rh, resTop), pt(armX - rh, armTop - 6), pt(armX - half, armTop), pt(armX - half, armTop + 2)]);
    s.glass([pt(armX + rh, resTop), pt(armX + rh, armTop - 6), pt(armX + half, armTop), pt(armX + half, armTop + 2)]);
    s.block(armX - rh, resTop, 2 * rh, armTop - resTop + 4);
    if (tap) {
      tapY = 176;
      s.add({ kind: "rect", x: armX - 9, y: tapY - 5, w: 18, h: 10, r: 2, role: "body", tag: "tap" });
      s.add({ kind: "rect", x: armX + 9, y: tapY - 2, w: 12, h: 4, r: 1.5, role: "body", tag: "tap" });
      s.block(armX - 9, tapY - 5, 30, 10);
    }
  }
  let rulerTop = 0;
  if (ruler) {
    rulerTop = run + half + 8;
    s.add({ kind: "rect", x: 170, y: rulerTop, w: 214, h: 12, r: 1.5, role: "body", tag: "ruler" });
    for (let i = 1; i < 20; i++) s.fine(170 + i * 10.7, rulerTop, 170 + i * 10.7, rulerTop + (i % 5 === 0 ? 7 : 4));
    s.block(170, rulerTop, 214, 12);
  }
  s.label(shoot.index, shoot.label, pt(x - 30, stemTop + 26), [
    { side: "above", at: pt(x + 20, stemTop - 10), targets: [pt(x + 8, stemTop + 2)] },
    { side: "left", at: pt(x - 44, stemTop + 30), targets: [pt(x - 30, stemTop + 30)] },
  ]);
  if (reservoir) s.label(reservoir.index, reservoir.label, pt(armX + 14, resTop + 50), [
    { side: "right", at: pt(armX + 30, resTop + 40), targets: [pt(armX + 14, resTop + 44)] },
  ]);
  if (tap) s.label(tap.index, tap.label, pt(armX + 21, tapY), [
    { side: "right", at: pt(armX + 34, tapY), targets: [pt(armX + 21, tapY)] },
  ]);
  if (bubble) s.label(bubble.index, bubble.label, pt(bubbleX, run - half), [
    { side: "above", at: pt(bubbleX, run - half - 14), targets: [pt(bubbleX, run - half)] },
  ]);
  // Under the capillary's left end, clear of the ruler, so its leader crosses nothing.
  s.label(capillary.index, capillary.label, pt(108, run + half), [
    { side: "below", at: pt(108, run + half + 8), targets: [pt(108, run + half)] },
    { side: "above", at: pt(214, run - half - 12), targets: [pt(214, run - half)] },
  ]);
  if (ruler) s.label(ruler.index, ruler.label, pt(300, rulerTop + 12), [
    { side: "below", at: pt(320, rulerTop + 18), targets: [pt(320, rulerTop + 12)] },
  ]);
  if (clock) {
    stopClock(s, 360, 60);
    s.label(clock.index, clock.label, pt(360, 77), [{ side: "below", at: pt(360, 82), targets: [pt(360, 77)] }]);
  }
  const parts = [
    `${a(shoot.label)} sealed into a water-filled tube that joins ${a(capillary.label)}`,
    ...(bubble ? [`${a(bubble.label)} in the ${capillary.label}`] : []),
    ...(ruler ? [`${a(ruler.label)} beside it to measure how far the bubble moves`] : []),
  ];
  const refill = reservoir ? ` ${sentence(a(reservoir.label))}${tap ? ` with ${a(tap.label)}` : ""} on a side arm refills the tube.` : "";
  return finish(s, "potometer", `Apparatus, a bubble potometer: ${listed(parts)}.${refill}${clock ? ` ${sentence(a(clock.label))} stands beside it.` : ""}`);
}

/* ------------------------------------------------------------------------------------------------------------------ */
/* clamped                                                                                                             */
/* ------------------------------------------------------------------------------------------------------------------ */

function clamped(pieces: readonly Piece[]): ApparatusPlan | null {
  const t = tally(pieces);
  const clamp = t.one("clamp");
  const stand = t.one("clamp-stand");
  const held = pieces.find((p) => p.kind === "boiling-tube" || p.kind === "test-tube");
  const food = t.one("burning-food");
  const burner = t.one("bunsen");
  if (!(clamp || stand) || !held || !(food || burner)) return null;
  if (!only(pieces, { clamp: 1, "clamp-stand": 1, "boiling-tube": 1, "test-tube": 1, thermometer: 1, "burning-food": 1, bunsen: 1, flame: 1, mat: 1 })) return null;
  if (food && burner) return null;
  if (pieces.filter((p) => p.kind === "boiling-tube" || p.kind === "test-tube").length !== 1) return null;
  const probe = t.one("thermometer");
  const flameWord = t.one("flame");
  const mat = t.one("mat");
  const s = new Sketch();
  const { half } = TUBES[held.kind as "test-tube" | "boiling-tube"];
  const rodX = 54;
  const cx = 214;
  const top = 64;
  const bottom = 208;
  const benchY = 330;
  const armY = 110;
  // The stand: base, rod, boss and clamp arm, with cork-lined jaws on the tube.
  s.add({ kind: "rect", x: rodX - 26, y: benchY - 8, w: 110, h: 8, r: 2, role: "body", tag: "clamp-stand" });
  s.add({ kind: "rect", x: rodX - 3, y: 34, w: 6, h: benchY - 8 - 34, role: "body", tag: "clamp-stand" });
  s.block(rodX - 26, 34, 110, benchY - 34);
  s.add({ kind: "rect", x: rodX - 8, y: armY - 8, w: 16, h: 16, r: 2, role: "body", tag: "clamp" });
  s.add({ kind: "rect", x: rodX + 8, y: armY - 2.5, w: cx - half - 7 - (rodX + 8), h: 5, role: "body", tag: "clamp" });
  s.add({ kind: "rect", x: cx - half - 7, y: armY - 10, w: 7, h: 20, r: 1.5, role: "rubber", tag: "clamp" });
  s.add({ kind: "rect", x: cx + half, y: armY - 10, w: 7, h: 20, r: 1.5, role: "rubber", tag: "clamp" });
  s.block(rodX - 8, armY - 10, cx + half + 7 - (rodX - 8), 20);
  const liquid = held.contents?.liquid ? 150 : null;
  uprightTube(s, cx, top, bottom, half, liquid, Boolean(held.contents?.solid));
  if (probe) {
    thermometer(s, cx + 4, 26, bottom - 18);
    s.anatomy.bulbLiquidTop = liquid ?? undefined;
  }
  s.anatomy.heated = pt(cx, bottom);
  let heatWords = "";
  if (food) {
    // Burning food on a mounted needle, held with its flame just under the tube.
    const foodY = bottom + 50;
    flame(s, cx, foodY - 6, 38, 10);
    s.add({ kind: "path", d: pathOf([pt(cx - 9, foodY - 3), pt(cx - 3, foodY - 8), pt(cx + 7, foodY - 7), pt(cx + 10, foodY), pt(cx + 3, foodY + 6), pt(cx - 7, foodY + 5)], true), role: "solid", tag: "food" });
    s.add({ kind: "line", x1: cx + 6, y1: foodY + 2, x2: cx + 104, y2: foodY + 30, role: "glass", tag: "needle" });
    s.add({ kind: "rect", x: cx + 102, y: foodY + 24, w: 62, h: 12, r: 6, role: "body", tag: "needle" });
    s.block(cx - 10, foodY - 8, 176, 44);
    s.label(food.index, food.label, pt(cx - 2, foodY + 5), [
      { side: "below", at: pt(cx - 6, foodY + 46), maxWidth: 260 },
      { side: "below", at: pt(cx + 30, foodY + 46), maxWidth: 170 },
    ]);
    heatWords = `${a(food.label)} is held with its flame just under the tube`;
  } else if (burner) {
    const b = bunsenBurner(s, cx, benchY, 58);
    flame(s, cx, b.top, b.top - bottom - 6, 11);
    s.label(burner.index, burner.label, pt(b.left, b.top + 30), [{ side: "right", at: pt(cx + 44, b.top + 30), targets: [pt(cx + 7, b.top + 30)] }]);
    heatWords = `${a(burner.label)} heats it from below`;
  }
  if (flameWord && s.anatomy.flame) {
    const f = s.anatomy.flame;
    s.label(flameWord.index, flameWord.label, pt(f.edgeX - 2, (f.tip.y + f.base.y) / 2), [
      { side: "left", at: pt(cx - 30, (f.tip.y + f.base.y) / 2), targets: [pt(cx - 8, (f.tip.y + f.base.y) / 2)] },
    ]);
  }
  if (mat) {
    s.add({ kind: "rect", x: cx - 60, y: benchY, w: 120, h: 8, r: 2, role: "body", tag: "mat" });
    s.block(cx - 60, benchY, 120, 8);
    s.label(mat.index, mat.label, pt(cx + 40, benchY + 8), [{ side: "below", at: pt(cx + 40, benchY + 14), targets: [pt(cx + 40, benchY + 8)] }]);
  }
  if (probe) s.label(probe.index, probe.label, pt(cx + 4, 36), [
    { side: "left", at: pt(cx - 30, 30), targets: [pt(cx, 34)] },
    { side: "right", at: pt(cx + 22, 30), targets: [pt(cx + 8, 34)] },
  ]);
  if (clamp) s.label(clamp.index, clamp.label, pt(rodX + 60, armY - 2.5), [
    { side: "above", at: pt(rodX + 64, armY - 12), targets: [pt(rodX + 64, armY - 2.5)] },
  ]);
  if (stand) s.label(stand.index, stand.label, pt(rodX - 3, 200), [
    { side: "right", at: pt(rodX + 14, 220), targets: [pt(rodX + 3, 220)] },
    { side: "left", at: pt(rodX - 12, 200), targets: [pt(rodX - 3, 200)] },
  ]);
  s.label(held.index, held.label, pt(cx + half, top + 20), [
    { side: "right", at: pt(cx + half + 22, top + 4), maxWidth: 150 },
  ]);
  if (liquid !== null) contentsLabel(s, held, pt(cx + half - 4, liquid + 20), [
    { side: "right", at: pt(cx + half + 22, liquid + 20), maxWidth: 140, targets: [pt(cx + half - 3, liquid + 20)] },
  ]);
  const holder = clamp ? `held in ${a(clamp.label)}${stand ? ` on ${a(stand.label)}` : " on its stand"}` : `held on ${a(stand!.label)}`;
  const inTube = probe ? `, with ${a(probe.label)} in ${held.contents ? "the liquid" : "it"}` : "";
  return finish(s, "clamped", `Apparatus: ${named(held)}${inTube}, ${holder}; ${heatWords}.${mat ? ` It stands on ${a(mat.label)}.` : ""}`);
}

/* ------------------------------------------------------------------------------------------------------------------ */
/* bunsen                                                                                                              */
/* ------------------------------------------------------------------------------------------------------------------ */

function bunsen(pieces: readonly Piece[]): ApparatusPlan | null {
  const t = tally(pieces);
  const burner = t.one("bunsen");
  if (!burner) return null;
  if (!only(pieces, { bunsen: 1, flame: 1, "wire-loop": 1, holder: 1, tripod: 1, gauze: 1, mat: 1, beaker: 1, "conical-flask": 1, thermometer: 1 })) return null;
  const loop = t.one("wire-loop");
  const holder = t.one("holder");
  const tripod = t.one("tripod");
  const gauze = t.one("gauze");
  const mat = t.one("mat");
  const flameWord = t.one("flame");
  const vesselPiece = t.one("beaker") ?? t.one("conical-flask");
  const probe = t.one("thermometer");
  if (holder && !loop) return null;
  if (loop && (tripod || gauze || vesselPiece)) return null;
  if ((gauze || vesselPiece) && !tripod) return null;
  if (t.one("beaker") && t.one("conical-flask")) return null;
  if (probe && !vesselPiece) return null;
  const s = new Sketch();
  let description = "";
  if (tripod) {
    // A heating stack: mat, Bunsen burner, tripod with gauze, the vessel on top; room on the left for the burner's label.
    const cx = 200;
    const matTop = 312;
    const benchY = mat ? matTop : matTop + 8;
    if (mat) {
      s.add({ kind: "rect", x: cx - 92, y: matTop, w: 184, h: 8, r: 2, role: "body", tag: "mat" });
      s.block(cx - 92, matTop, 184, 8);
    }
    const tripodTop = benchY - 100;
    const b = bunsenBurner(s, cx, benchY, 44);
    s.add({ kind: "rect", x: cx - 48, y: tripodTop, w: 96, h: 6, r: 1.5, role: "body", tag: "tripod" });
    for (const side of [-1, 1] as const) {
      s.add({ kind: "path", d: pathOf([pt(cx + side * 42, tripodTop + 6), pt(cx + side * 47, tripodTop + 6), pt(cx + side * 60, benchY), pt(cx + side * 54, benchY)], true), role: "body", tag: "tripod-leg" });
    }
    s.block(cx - 60, tripodTop, 120, benchY - tripodTop);
    let heatedY = tripodTop;
    if (gauze) {
      s.add({ kind: "rect", x: cx - 58, y: tripodTop - 4, w: 116, h: 4, role: "body", tag: "gauze" });
      for (let x = cx - 52; x <= cx + 52; x += 8) s.fine(x, tripodTop - 4, x + 4, tripodTop, "gauze");
      s.block(cx - 58, tripodTop - 4, 116, 4);
      heatedY = tripodTop;
    }
    s.anatomy.heated = pt(cx, heatedY);
    flame(s, cx, b.top, b.top - heatedY - 3, 12);
    const standOn = gauze ? tripodTop - 4 : tripodTop;
    if (vesselPiece) {
      const liquid = vesselPiece.contents?.liquid ? standOn - 60 : null;
      if (vesselPiece.kind === "beaker") beaker(s, cx, standOn - 90, standOn, 46, liquid);
      else conicalFlask(s, cx, standOn, vesselPiece.contents, false);
      if (probe) {
        thermometer(s, cx + 10, standOn - 150, standOn - 16);
        s.anatomy.bulbLiquidTop = liquid ?? undefined;
        s.label(probe.index, probe.label, pt(cx + 14, standOn - 140), [{ side: "right", at: pt(cx + 28, standOn - 140), targets: [pt(cx + 14, standOn - 140)] }]);
      }
      s.label(vesselPiece.index, vesselPiece.label, pt(cx - 46, standOn - 70), [
        { side: "left", at: pt(cx - 64, standOn - 70), targets: [pt(cx - 46, standOn - 70)] },
        { side: "right", at: pt(cx + 64, standOn - 70), targets: [pt(cx + 46, standOn - 70)] },
      ]);
      if (liquid !== null) contentsLabel(s, vesselPiece, pt(cx + 30, standOn - 30), [
        { side: "right", at: pt(cx + 64, standOn - 30), maxWidth: 150, targets: [pt(cx + 30, standOn - 30)] },
      ]);
    }
    if (gauze) s.label(gauze.index, gauze.label, pt(cx + 58, tripodTop - 2), [{ side: "right", at: pt(cx + 76, tripodTop - 2), targets: [pt(cx + 58, tripodTop - 2)] }]);
    s.label(tripod.index, tripod.label, pt(cx + 52, tripodTop + 40), [{ side: "right", at: pt(cx + 76, tripodTop + 40), targets: [pt(cx + 51, tripodTop + 40)] }]);
    s.label(burner.index, burner.label, pt(cx - 7, b.top + 26), [
      { side: "left", at: pt(cx - 70, b.top + 20), targets: [pt(cx - 7, b.top + 26)] },
    ]);
    if (flameWord) s.label(flameWord.index, flameWord.label, pt(cx + 8, b.top - 10), [{ side: "right", at: pt(cx + 76, b.top - 16), targets: [pt(cx + 7, b.top - 12)] }]);
    if (mat) s.label(mat.index, mat.label, pt(cx + 70, matTop + 8), [{ side: "below", at: pt(cx + 60, matTop + 14), targets: [pt(cx + 60, matTop + 8)] }]);
    description = `Apparatus: ${a(burner.label)}${mat ? ` on ${a(mat.label)}` : ""} under ${a(tripod.label)} with two legs${gauze ? `, ${a(gauze.label)} on the tripod` : ""}${vesselPiece ? ` and ${named(vesselPiece)} on ${gauze ? "the gauze" : "the tripod"}` : ""}${probe ? `, ${a(probe.label)} in it` : ""}; the flame reaches up to ${gauze ? "the gauze" : "the tripod"}.`;
  } else {
    // A Bunsen burner and its flame, with a wire loop held at the flame's edge when there is one.
    const cx = 124;
    const benchY = 300;
    const b = bunsenBurner(s, cx, benchY, 70);
    const f = flame(s, cx, b.top, 104, 15);
    if (loop) {
      const y = b.top - 104 * 0.5;
      const lx = f.edgeAt(y) + 1;
      s.add({ kind: "circle", cx: lx + 4, cy: y, r: 5, role: "fine", tag: "wire-loop" });
      s.anatomy.loop = pt(lx + 4, y);
      s.anatomy.flame = { ...s.anatomy.flame!, edgeX: f.edgeAt(y) };
      const hx = 300;
      const hy = y + 22;
      s.add({ kind: "line", x1: lx + 9, y1: y + 1, x2: hx, y2: hy, role: "fine", tag: "wire" });
      if (holder) s.add({ kind: "rect", x: hx, y: hy - 7, w: 76, h: 14, r: 7, role: "body", tag: "holder" });
      s.block(lx - 1, y - 5, (holder ? hx + 76 : hx) - lx, hy + 7 - (y - 5));
      s.label(loop.index, loop.label, pt(lx + 6, y - 5), [
        { side: "above", at: pt(lx + 90, y - 40), targets: [pt(lx + 7, y - 5)], maxWidth: 200 },
        { side: "right", at: pt(lx + 40, y - 30), targets: [pt(lx + 7, y - 5)], maxWidth: 200 },
      ]);
      if (holder) s.label(holder.index, holder.label, pt(hx + 38, hy + 7), [{ side: "below", at: pt(hx + 38, hy + 14), targets: [pt(hx + 38, hy + 7)] }]);
    }
    if (flameWord) s.label(flameWord.index, flameWord.label, pt(cx - 12, b.top - 50), [
      { side: "left", at: pt(cx - 28, b.top - 60), targets: [pt(cx - 11, b.top - 52)] },
    ]);
    s.label(burner.index, burner.label, pt(cx - 7, b.top + 34), [
      { side: "left", at: pt(cx - 24, b.top + 34), targets: [pt(cx - 7, b.top + 34)] },
      { side: "right", at: pt(cx + 24, b.top + 34), targets: [pt(cx + 7, b.top + 34)] },
    ]);
    if (mat) {
      s.add({ kind: "rect", x: cx - 60, y: benchY, w: 120, h: 8, r: 2, role: "body", tag: "mat" });
      s.block(cx - 60, benchY, 120, 8);
      s.label(mat.index, mat.label, pt(cx + 40, benchY + 8), [{ side: "below", at: pt(cx + 40, benchY + 14), targets: [pt(cx + 40, benchY + 8)] }]);
    }
    description = `Apparatus: ${a(burner.label)} with ${flameWord ? a(flameWord.label) : "its flame"}${loop ? `; ${a(loop.label)}${holder ? ` on ${a(holder.label)}` : ""} is held at the edge of the flame` : ""}${mat ? `, on ${a(mat.label)}` : ""}.`;
  }
  return finish(s, "bunsen", description);
}

/* ------------------------------------------------------------------------------------------------------------------ */
/* instruments                                                                                                         */
/* ------------------------------------------------------------------------------------------------------------------ */

function instruments(pieces: readonly Piece[]): ApparatusPlan | null {
  const standalone: ReadonlySet<PieceKind> = new Set(["stop-clock", "balance", "scales", "metre-rule", "ruler", "thermometer", "gas-syringe", "measuring-cylinder"]);
  if (!pieces.every((p) => standalone.has(p.kind)) || pieces.some((p) => p.contents)) return null;
  const s = new Sketch();
  const long = pieces.filter((p) => p.kind === "metre-rule" || p.kind === "ruler" || p.kind === "gas-syringe");
  const compact = pieces.filter((p) => !long.includes(p));
  let y = 24;
  if (compact.length) {
    const tall = compact.some((p) => p.kind === "thermometer" || p.kind === "measuring-cylinder");
    const rowBottom = y + (tall ? 150 : 56);
    const slot = W / compact.length;
    compact.forEach((p, i) => {
      const cx = slot * i + slot / 2;
      if (p.kind === "stop-clock") stopClock(s, cx, rowBottom - 20);
      else if (p.kind === "scales") {
        s.add({ kind: "rect", x: cx - 50, y: rowBottom - 16, w: 100, h: 16, r: 5, role: "body", tag: "scales" });
        s.add({ kind: "rect", x: cx - 15, y: rowBottom - 12, w: 30, h: 8, r: 2, role: "fine", tag: "scales" });
        s.block(cx - 50, rowBottom - 16, 100, 16);
      } else if (p.kind === "balance") {
        s.add({ kind: "rect", x: cx - 34, y: rowBottom - 36, w: 68, h: 5, r: 2, role: "body", tag: "balance" });
        s.add({ kind: "rect", x: cx - 4, y: rowBottom - 31, w: 8, h: 5, role: "body", tag: "balance" });
        s.add({ kind: "rect", x: cx - 46, y: rowBottom - 26, w: 92, h: 26, r: 4, role: "body", tag: "balance" });
        s.add({ kind: "rect", x: cx - 30, y: rowBottom - 19, w: 32, h: 11, r: 2, role: "fine", tag: "balance" });
        s.block(cx - 46, rowBottom - 36, 92, 36);
      } else if (p.kind === "thermometer") thermometer(s, cx, rowBottom - 140, rowBottom - 6);
      else measuringCylinder(s, cx, rowBottom - 140, rowBottom - 6, { upturned: false, liquidTop: null });
      s.label(p.index, p.label, pt(cx, rowBottom), [{ side: "below", at: pt(cx, rowBottom + 8), targets: [pt(cx, rowBottom)], maxWidth: slot - 8 }]);
    });
    y = rowBottom + 44;
  }
  for (const p of long) {
    if (p.kind === "gas-syringe") {
      const g = gasSyringe(s, 30, y + 20);
      s.label(p.index, p.label, pt(140, g.bottom), [{ side: "below", at: pt(140, g.bottom + 6), targets: [pt(140, g.bottom - 5)] }]);
      y = g.bottom + 40;
    } else {
      const x1 = p.kind === "ruler" ? 250 : 380;
      metreRule(s, 20, x1, y + 6);
      s.label(p.index, p.label, pt((20 + x1) / 2, y + 18), [{ side: "below", at: pt((20 + x1) / 2, y + 24), targets: [pt((20 + x1) / 2, y + 18)] }]);
      y += 58;
    }
  }
  return finish(s, "instruments", `Apparatus, shown side by side with nothing to assemble: ${listed(pieces.map((p) => a(p.label)))}.`);
}

/* ------------------------------------------------------------------------------------------------------------------ */

const LAYOUTS: ReadonlyArray<(pieces: readonly Piece[]) => ApparatusPlan | null> = [gasTrain, potometer, beam, clamped, bunsen, vessel, instruments];

/**
 * The drawing of an apparatus figure's parts, or null when it cannot be drawn as a working set-up: a name the
 * vocabulary does not know, or pieces no set-up here assembles. Pure: the same parts give the same plan.
 */
export function planApparatus(parts: readonly string[]): ApparatusPlan | null {
  const { pieces, unknown } = parseApparatusParts(parts);
  if (unknown.length > 0 || pieces.length === 0) return null;
  for (const layout of LAYOUTS) {
    const plan = layout(pieces);
    if (plan) return plan;
  }
  return null;
}
