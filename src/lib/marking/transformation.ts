/**
 * Marking for `graph` answers with plot "transformation". The learner places the image's vertices on a grid (or
 * types them) and the set of vertices is compared with the expected image, order-free. When it is wrong, the
 * shape she drew is identified against a library of single transformations of the object, so the feedback can
 * say what she did ("a reflection in the y-axis") against what was asked. Pure; no content dependencies.
 */
import { parsePointList } from "./points";
import { parsePlotResponse } from "./plot";

export type Vertex = readonly [number, number];

export interface TransformationSpec {
  object: readonly Vertex[];
  image: readonly Vertex[];
}

export interface TransformationVerdict {
  correct: boolean;
  /** The parsed vertices, or null when the response is not a list of coordinates. */
  placed: Vertex[] | null;
  /** How many placed vertices coincide with a vertex of the correct image. */
  inPlace: number;
  total: number;
  feedback: string;
  /** The single transformation that maps the object onto what she drew, if one does. */
  did: string | null;
  /** The single transformation that maps the object onto the correct image, if one does. */
  asked: string | null;
}

const EPS = 1e-6;
/** Lattice range searched for mirror lines and centres. */
const RANGE = 10;

const near = (p: Vertex, q: Vertex): boolean => Math.abs(p[0] - q[0]) < EPS && Math.abs(p[1] - q[1]) < EPS;

const fmt = (n: number): string => {
  const r = Math.round(n * 100) / 100;
  return (Object.is(r, -0) ? 0 : r).toString().replace("-", "−");
};

/** "(1, 3), (1, 8), (4, 3)" */
export function formatVertices(vs: readonly Vertex[]): string {
  return vs.map(([x, y]) => `(${fmt(x)}, ${fmt(y)})`).join(", ");
}

/** Coordinates typed or produced by the grid: tuples, or x = …, y = … pairs. */
export function parseVertices(raw: string): Vertex[] | null {
  const pts = parsePointList(raw);
  if (!pts || pts.length === 0) return null;
  return pts.map((p) => [p.x, p.y] as const);
}

/** Every "(a, b)" in a piece of text, e.g. a common error's description of a wrong image. */
export function verticesInText(text: string): Vertex[] {
  const out: Vertex[] = [];
  const re = /\(\s*(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)\s*\)/g;
  for (const m of text.matchAll(re)) out.push([Number(m[1]), Number(m[2])]);
  return out;
}

/** The same vertices in any order (a polygon's vertex set; duplicates must match one for one). */
export function sameVertexSet(a: readonly Vertex[], b: readonly Vertex[]): boolean {
  if (a.length !== b.length) return false;
  const used: boolean[] = new Array(b.length).fill(false);
  for (const p of a) {
    const j = b.findIndex((q, k) => !used[k] && near(p, q));
    if (j < 0) return false;
    used[j] = true;
  }
  return true;
}

type Map2 = (v: Vertex) => Vertex;
interface Candidate {
  name: string;
  f: Map2;
}

const point = (x: number, y: number): string => (x === 0 && y === 0 ? "the origin" : `(${fmt(x)}, ${fmt(y)})`);

/** Single transformations in the order the feedback should prefer them (the common ones first). */
function* candidates(): Generator<Candidate> {
  yield { name: "a reflection in the x-axis", f: ([x, y]) => [x, -y] };
  yield { name: "a reflection in the y-axis", f: ([x, y]) => [-x, y] };
  yield { name: "a reflection in the line y = x", f: ([x, y]) => [y, x] };
  yield { name: "a reflection in the line y = −x", f: ([x, y]) => [-y, -x] };
  yield { name: "a rotation of 90° clockwise about the origin", f: ([x, y]) => [y, -x] };
  yield { name: "a rotation of 90° anticlockwise about the origin", f: ([x, y]) => [-y, x] };
  yield { name: "a rotation of 180° about the origin", f: ([x, y]) => [-x, -y] };
  for (let k = -RANGE; k <= RANGE; k += 0.5) {
    if (k === 0) continue;
    yield { name: `a reflection in the line x = ${fmt(k)}`, f: ([x, y]) => [2 * k - x, y] };
    yield { name: `a reflection in the line y = ${fmt(k)}`, f: ([x, y]) => [x, 2 * k - y] };
  }
  for (let a = -RANGE; a <= RANGE; a += 0.5) {
    for (let b = -RANGE; b <= RANGE; b += 0.5) {
      if (a === 0 && b === 0) continue;
      const c = point(a, b);
      yield { name: `a rotation of 90° clockwise about ${c}`, f: ([x, y]) => [a + (y - b), b - (x - a)] };
      yield { name: `a rotation of 90° anticlockwise about ${c}`, f: ([x, y]) => [a - (y - b), b + (x - a)] };
      yield { name: `a rotation of 180° about ${c}`, f: ([x, y]) => [2 * a - x, 2 * b - y] };
    }
  }
  const factors: Array<[number, string]> = [
    [2, "2"],
    [3, "3"],
    [4, "4"],
    [0.5, "½"],
    [1 / 3, "⅓"],
    [-1, "−1"],
    [-2, "−2"],
    [-0.5, "−½"],
  ];
  for (let a = -RANGE; a <= RANGE; a += 1) {
    for (let b = -RANGE; b <= RANGE; b += 1) {
      for (const [k, label] of factors) {
        yield { name: `an enlargement, scale factor ${label}, centre ${point(a, b)}`, f: ([x, y]) => [a + k * (x - a), b + k * (y - b)] };
      }
    }
  }
}

function translationName(vx: number, vy: number): string {
  const parts: string[] = [];
  if (vx !== 0) parts.push(`${fmt(Math.abs(vx))} ${vx > 0 ? "right" : "left"}`);
  if (vy !== 0) parts.push(`${fmt(Math.abs(vy))} ${vy > 0 ? "up" : "down"}`);
  return `a translation of ${parts.join(" and ")}, the vector (${fmt(vx)}, ${fmt(vy)})`;
}

/** Which single transformation of the object gives these vertices, in words; null when none in the library does. */
export function describeMapping(object: readonly Vertex[], placed: readonly Vertex[]): string | null {
  if (placed.length !== object.length || object.length === 0) return null;
  if (sameVertexSet(object, placed)) return "the object itself, unmoved";
  // Translations first: cheap, and the commonest thing a wrong drawing turns out to be.
  const p0 = placed[0]!;
  for (const o of object) {
    const vx = p0[0] - o[0];
    const vy = p0[1] - o[1];
    if (vx === 0 && vy === 0) continue;
    if (sameVertexSet(object.map(([x, y]) => [x + vx, y + vy] as const), placed)) return translationName(vx, vy);
  }
  for (const c of candidates()) {
    if (sameVertexSet(object.map(c.f), placed)) return c.name;
  }
  return null;
}

export function checkTransformation(raw: string, spec: TransformationSpec): TransformationVerdict {
  const total = spec.image.length;
  const placed = parseVertices(raw);
  const asked = describeMapping(spec.object, spec.image);
  if (!placed) {
    return {
      correct: false,
      placed: null,
      inPlace: 0,
      total,
      feedback: `Give the image's vertices as coordinates, one pair for each vertex, for example ${formatVertices(spec.object)}.`,
      did: null,
      asked,
    };
  }
  const inPlace = placed.filter((p) => spec.image.some((q) => near(p, q))).length;
  if (placed.length !== total) {
    return {
      correct: false,
      placed,
      inPlace,
      total,
      feedback: `The image has ${total} vertices, one for each vertex of the object; ${placed.length} ${placed.length === 1 ? "is" : "are"} placed.`,
      did: null,
      asked,
    };
  }
  if (sameVertexSet(placed, spec.image)) {
    return { correct: true, placed, inPlace: total, total, feedback: "Every vertex of the image is in the right place.", did: asked, asked };
  }
  const did = describeMapping(spec.object, placed);
  let feedback: string;
  if (did && asked) feedback = `That is ${did}. The question asked for ${asked}.`;
  else if (did) feedback = `That is ${did} of the object, which is not the image asked for here.`;
  else if (inPlace === 0) feedback = `None of the vertices is in the right place yet.${asked ? ` The image is ${asked}: work one vertex at a time.` : " Work one vertex at a time."}`;
  else feedback = `${inPlace} of ${total} vertices ${inPlace === 1 ? "is" : "are"} in the right place. Check the others one at a time.`;
  return { correct: false, placed, inPlace, total, feedback, did, asked };
}

/**
 * A graph common error whose description lists a wrong image's vertices ("image drawn at (-3, 1), (-8, 1),
 * (-3, 4), the reflection in the y-axis") matches when the placed vertices are exactly that set.
 */
export function graphTestMatches(raw: string, test: string): boolean {
  const listed = verticesInText(test);
  // A plot field submits JSON ({"points": …}): its test names the misplaced point or points ("point plotted at
  // (6.4, 12)") and matches when every listed point is among those she placed (the line's two points included).
  if (raw.trim().startsWith("{")) {
    if (listed.length < 1) return false;
    const response = parsePlotResponse(raw);
    if (!response) return false;
    const placed: Vertex[] = [...(response.points ?? []), ...(response.line ?? [])].map((p) => [p[0], p[1]]);
    return listed.every((l) => placed.some((p) => Math.abs(p[0] - l[0]) < 1e-6 && Math.abs(p[1] - l[1]) < 1e-6));
  }
  if (listed.length < 2) return false;
  const placed = parseVertices(raw);
  return !!placed && sameVertexSet(placed, listed);
}
