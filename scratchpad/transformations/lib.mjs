/**
 * Geometry + SVG helpers for the M7 combined-transformations bundle.
 * Every image point in the bundle is produced here and asserted against the
 * value written into the content, so no coordinate in the bundle is hand-waved.
 */
import assert from "node:assert/strict";

// ---------------------------------------------------------------------------
// Transformations. Points are [x, y]; all of them return exact numbers.
// ---------------------------------------------------------------------------

export const reflectYeqX = ([x, y]) => [y, x];
export const reflectYeqNegX = ([x, y]) => [-y, -x];
export const reflectXaxis = ([x, y]) => [x, -y];
export const reflectYaxis = ([x, y]) => [-x, y];
export const reflectVertical = (a) => ([x, y]) => [2 * a - x, y];
export const reflectHorizontal = (b) => ([x, y]) => [x, 2 * b - y];
export const translate = ([dx, dy]) => ([x, y]) => [x + dx, y + dy];
export const enlarge = (k, [cx, cy]) => ([x, y]) => [cx + k * (x - cx), cy + k * (y - cy)];

/** Anticlockwise is positive: 90 = quarter turn anticlockwise, -90 = clockwise. */
export const rotate = (deg, [cx, cy] = [0, 0]) => ([x, y]) => {
  const t = (deg * Math.PI) / 180;
  const c = Math.round(Math.cos(t));
  const s = Math.round(Math.sin(t));
  assert.ok([0, 1, -1].includes(c) && [0, 1, -1].includes(s), `rotate: ${deg} is not a multiple of 90`);
  return [cx + (x - cx) * c - (y - cy) * s, cy + (x - cx) * s + (y - cy) * c];
};

export const apply = (shape, f) => shape.map(f);
export const compose = (...fs) => (p) => fs.reduce((q, f) => f(q), p);

/** Assert a computed image equals the coordinates written into the bundle. */
export function check(label, got, want) {
  assert.deepEqual(
    got.map((p) => p.map((n) => Number(n.toFixed(10)))),
    want.map((p) => p.map((n) => Number(n.toFixed(10)))),
    `${label}\n  computed ${JSON.stringify(got)}\n  written  ${JSON.stringify(want)}`,
  );
  return want;
}

/** Perpendicular bisector of AB as the line ux + vy = w. */
export function perpBisector([ax, ay], [bx, by]) {
  const u = bx - ax;
  const v = by - ay;
  return { u, v, w: (u * (ax + bx) + v * (ay + by)) / 2 };
}

export function intersect(l1, l2) {
  const det = l1.u * l2.v - l2.u * l1.v;
  assert.notEqual(det, 0, "parallel lines have no intersection");
  return [(l1.w * l2.v - l2.w * l1.v) / det, (l1.u * l2.w - l2.u * l1.w) / det];
}

/** The centre of a rotation, from two vertex pairs, by perpendicular bisectors. */
export function centreOfRotation(shape, image) {
  return intersect(perpBisector(shape[0], image[0]), perpBisector(shape[1], image[1]));
}

/** The centre of an enlargement, from two vertex pairs, by joining and extending. */
export function centreOfEnlargement(shape, image) {
  const line = (p, q) => ({ u: q[1] - p[1], v: p[0] - q[0], w: (q[1] - p[1]) * p[0] + (p[0] - q[0]) * p[1] });
  return intersect(line(shape[0], image[0]), line(shape[1], image[1]));
}

export function scaleFactor(shape, image) {
  const d = (p, q) => Math.hypot(q[0] - p[0], q[1] - p[1]);
  return d(image[0], image[1]) / d(shape[0], shape[1]);
}

// ---------------------------------------------------------------------------
// SVG. No <style>, no <script>, no external href, no event handlers.
// currentColor throughout; every text uses font-family='inherit'.
// ---------------------------------------------------------------------------

const STEP = 17;
const PAD = { l: 22, r: 14, t: 14, b: 22 };
const X0 = -8;
const X1 = 8;
const Y0 = -8;
const Y1 = 8;

const W = PAD.l + (X1 - X0) * STEP + PAD.r;
const H = PAD.t + (Y1 - Y0) * STEP + PAD.b;

const n = (v) => {
  const r = Math.round(v * 10) / 10;
  return Number.isInteger(r) ? String(r) : String(r);
};
const PX = (x) => n(PAD.l + (x - X0) * STEP);
const PY = (y) => n(PAD.t + (Y1 - y) * STEP);
const px = (x) => PAD.l + (x - X0) * STEP;
const py = (y) => PAD.t + (Y1 - y) * STEP;

/** Clip a straight line (through p in direction d) to the plot rectangle. */
function clipLine([ax, ay], [dx, dy]) {
  let tmin = -1e9;
  let tmax = 1e9;
  const slab = (p, d, lo, hi) => {
    if (Math.abs(d) < 1e-12) return;
    const t1 = (lo - p) / d;
    const t2 = (hi - p) / d;
    tmin = Math.max(tmin, Math.min(t1, t2));
    tmax = Math.min(tmax, Math.max(t1, t2));
  };
  slab(ax, dx, X0, X1);
  slab(ay, dy, Y0, Y1);
  return [
    [ax + tmin * dx, ay + tmin * dy],
    [ax + tmax * dx, ay + tmax * dy],
  ];
}

function gridPath() {
  const d = [];
  for (let x = X0; x <= X1; x += 1) d.push(`M${PX(x)} ${PY(Y1)}V${PY(Y0)}`);
  for (let y = Y0; y <= Y1; y += 1) d.push(`M${PX(X0)} ${PY(y)}H${PX(X1)}`);
  return d.join("");
}

function axes() {
  const xAxis = `M${PX(X0)} ${PY(0)}H${n(px(X1) + 8)}`;
  const yAxis = `M${PX(0)} ${PY(Y0)}V${n(py(Y1) - 8)}`;
  const arrowX = `M${n(px(X1) + 9)} ${PY(0)}L${n(px(X1) + 2)} ${n(py(0) - 3.2)}L${n(px(X1) + 2)} ${n(py(0) + 3.2)}Z`;
  const arrowY = `M${PX(0)} ${n(py(Y1) - 9)}L${n(px(0) - 3.2)} ${n(py(Y1) - 2)}L${n(px(0) + 3.2)} ${n(py(Y1) - 2)}Z`;
  const ticks = [];
  for (let x = X0; x <= X1; x += 2) {
    if (x === 0) continue;
    ticks.push(`<text x='${PX(x)}' y='${n(py(0) + 11)}' text-anchor='middle'>${x}</text>`);
  }
  for (let y = Y0; y <= Y1; y += 2) {
    if (y === 0) continue;
    ticks.push(`<text x='${n(px(0) - 4)}' y='${n(py(y) + 3.4)}' text-anchor='end'>${y}</text>`);
  }
  return (
    `<g fill='none' stroke='currentColor' stroke-width='1.2'><path d='${xAxis}'/><path d='${yAxis}'/></g>` +
    `<g fill='currentColor'><path d='${arrowX}'/><path d='${arrowY}'/></g>` +
    `<g fill='currentColor' fill-opacity='0.72' font-family='inherit' font-size='8.5'>${ticks.join("")}` +
    `<text x='${n(px(0) - 4)}' y='${n(py(0) + 11)}' text-anchor='end'>0</text></g>` +
    `<g fill='currentColor' font-family='inherit' font-size='11' font-style='italic'>` +
    `<text x='${n(px(X1) + 4)}' y='${n(py(0) + 15)}'>x</text>` +
    `<text x='${n(px(0) + 7)}' y='${n(py(Y1) - 1)}'>y</text></g>`
  );
}

const polyD = (pts) => `M${pts.map((p) => `${PX(p[0])} ${PY(p[1])}`).join("L")}Z`;

const centroid = (pts) => [
  pts.reduce((a, p) => a + p[0], 0) / pts.length,
  pts.reduce((a, p) => a + p[1], 0) / pts.length,
];

/**
 * Build a coordinate-grid figure.
 *   shapes: [{ pts, label?, at?, style?: "object"|"image"|"final"|"ghost", dots?: true }]
 *   lines:  [{ kind: "y=x"|"y=-x"|"x="|"y=", at?, label, labelAt: [x,y] }]
 *   marks:  [{ at: [x,y], label?, labelAt?: [x,y], kind?: "centre"|"point" }]
 *   rays:   [{ from: [x,y], to: [x,y], extend?: number }]
 *   joins:  [{ from, to }]        thin dashed vertex joins
 *   bisectors: [{ u, v, w, label?, labelAt? }]
 *   arrows: [{ from, to, label?, labelAt? }]
 */
export function gridSvg({ shapes = [], lines = [], marks = [], rays = [], joins = [], bisectors = [], arrows = [] }) {
  const out = [];
  out.push(`<svg viewBox='0 0 ${W} ${H}' xmlns='http://www.w3.org/2000/svg' width='${W}' height='${H}'>`);
  out.push(`<path d='${gridPath()}' fill='none' stroke='currentColor' stroke-width='0.5' stroke-opacity='0.2'/>`);
  out.push(axes());

  for (const l of lines) {
    let seg;
    if (l.kind === "y=x") seg = clipLine([0, 0], [1, 1]);
    else if (l.kind === "y=-x") seg = clipLine([0, 0], [1, -1]);
    else if (l.kind === "x=") seg = clipLine([l.at, 0], [0, 1]);
    else seg = clipLine([0, l.at], [1, 0]);
    out.push(
      `<path d='M${PX(seg[0][0])} ${PY(seg[0][1])}L${PX(seg[1][0])} ${PY(seg[1][1])}' fill='none' stroke='currentColor' stroke-width='1.3' stroke-dasharray='6 4'/>`,
    );
    if (l.label) {
      const [lx, ly] = l.labelAt;
      out.push(
        `<text x='${PX(lx)}' y='${PY(ly)}' font-family='inherit' font-size='11' font-style='italic' fill='currentColor' text-anchor='middle'>${l.label}</text>`,
      );
    }
  }

  for (const j of joins) {
    out.push(
      `<path d='M${PX(j.from[0])} ${PY(j.from[1])}L${PX(j.to[0])} ${PY(j.to[1])}' fill='none' stroke='currentColor' stroke-width='0.9' stroke-opacity='0.75' stroke-dasharray='3 3'/>`,
    );
  }

  for (const b of bisectors) {
    const d = [-b.v, b.u];
    const p0 = Math.abs(b.u) > Math.abs(b.v) ? [b.w / b.u, 0] : [0, b.w / b.v];
    const seg = clipLine(p0, d);
    out.push(
      `<path d='M${PX(seg[0][0])} ${PY(seg[0][1])}L${PX(seg[1][0])} ${PY(seg[1][1])}' fill='none' stroke='currentColor' stroke-width='1' stroke-opacity='0.85' stroke-dasharray='1.5 3'/>`,
    );
    if (b.label) {
      out.push(
        `<text x='${PX(b.labelAt[0])}' y='${PY(b.labelAt[1])}' font-family='inherit' font-size='9.5' fill='currentColor' text-anchor='middle'>${b.label}</text>`,
      );
    }
  }

  for (const r of rays) {
    const k = r.extend ?? 1;
    const to = [r.from[0] + (r.to[0] - r.from[0]) * k, r.from[1] + (r.to[1] - r.from[1]) * k];
    out.push(
      `<path d='M${PX(r.from[0])} ${PY(r.from[1])}L${PX(to[0])} ${PY(to[1])}' fill='none' stroke='currentColor' stroke-width='0.9' stroke-opacity='0.8' stroke-dasharray='2 2.5'/>`,
    );
  }

  for (const a of arrows) {
    const dx = px(a.to[0]) - px(a.from[0]);
    const dy = py(a.to[1]) - py(a.from[1]);
    const len = Math.hypot(dx, dy);
    const ux = dx / len;
    const uy = dy / len;
    const hx = px(a.to[0]);
    const hy = py(a.to[1]);
    out.push(
      `<path d='M${PX(a.from[0])} ${PY(a.from[1])}L${n(hx - ux * 7)} ${n(hy - uy * 7)}' fill='none' stroke='currentColor' stroke-width='1.2'/>`,
    );
    out.push(
      `<path d='M${n(hx)} ${n(hy)}L${n(hx - ux * 8 - uy * 3.4)} ${n(hy - uy * 8 + ux * 3.4)}L${n(hx - ux * 8 + uy * 3.4)} ${n(hy - uy * 8 - ux * 3.4)}Z' fill='currentColor'/>`,
    );
    if (a.label) {
      out.push(
        `<text x='${PX(a.labelAt[0])}' y='${PY(a.labelAt[1])}' font-family='inherit' font-size='9.5' fill='currentColor' text-anchor='middle'>${a.label}</text>`,
      );
    }
  }

  for (const s of shapes) {
    const style = s.style ?? "object";
    const strokeWidth = style === "ghost" ? 1.1 : 1.7;
    const dash =
      style === "image" ? " stroke-dasharray='5 3'" : style === "ghost" ? " stroke-dasharray='2 3'" : "";
    const fillOpacity = style === "final" ? 0.16 : style === "object" ? 0.08 : style === "image" ? 0.04 : 0;
    out.push(
      `<path d='${polyD(s.pts)}' fill='currentColor' fill-opacity='${fillOpacity}' stroke='currentColor' stroke-width='${strokeWidth}'${dash}/>`,
    );
    if (s.dots) {
      for (const p of s.pts) out.push(`<circle cx='${PX(p[0])}' cy='${PY(p[1])}' r='2.1' fill='currentColor'/>`);
    }
    if (s.label) {
      const [lx, ly] = s.at ?? centroid(s.pts);
      out.push(
        `<text x='${PX(lx)}' y='${PY(ly)}' font-family='inherit' font-size='12' font-weight='600' fill='currentColor' text-anchor='middle'>${s.label}</text>`,
      );
    }
  }

  for (const m of marks) {
    const kind = m.kind ?? "centre";
    if (kind === "centre") {
      out.push(
        `<path d='M${n(px(m.at[0]) - 5)} ${PY(m.at[1])}h10M${PX(m.at[0])} ${n(py(m.at[1]) - 5)}v10' fill='none' stroke='currentColor' stroke-width='1.5'/>`,
      );
      out.push(`<circle cx='${PX(m.at[0])}' cy='${PY(m.at[1])}' r='3' fill='none' stroke='currentColor' stroke-width='1.3'/>`);
    } else {
      out.push(`<circle cx='${PX(m.at[0])}' cy='${PY(m.at[1])}' r='2.6' fill='currentColor'/>`);
    }
    if (m.label) {
      const [lx, ly] = m.labelAt ?? [m.at[0] + 1.3, m.at[1] + 0.7];
      out.push(
        `<text x='${PX(lx)}' y='${PY(ly)}' font-family='inherit' font-size='10' fill='currentColor' text-anchor='middle'>${m.label}</text>`,
      );
    }
  }

  out.push("</svg>");
  const svg = out.join("");
  assert.ok(!/<style|<script|\son[a-z]+=|href=/i.test(svg), "SVG must not contain style, script, handlers or href");
  assert.ok(svg.length < 12000, `SVG is ${svg.length} bytes, over the 12 KB limit`);
  // Nothing may be drawn outside the canvas: a label pushed off the edge is invisible.
  for (const m of svg.matchAll(/<text x='(-?[\d.]+)' y='(-?[\d.]+)'/g)) {
    assert.ok(Number(m[1]) >= 2 && Number(m[1]) <= W - 2, `label x ${m[1]} is off the ${W}px canvas`);
    assert.ok(Number(m[2]) >= 8 && Number(m[2]) <= H - 2, `label y ${m[2]} is off the ${H}px canvas`);
  }
  return svg;
}

/** A figure spec for a question or a worked example: the SVG as a data URI. */
export function svgFigure(svg, alt) {
  assert.ok(!svg.includes("%"), "a per-cent sign would break decodeURIComponent on the data URI");
  return { kind: "svg", src: `data:image/svg+xml;utf8,${svg.replace(/#/g, "%23")}`, alt };
}

export const fmt = (p) => `(${p[0]}, ${p[1]})`;
export const fmtList = (pts) => pts.map(fmt).join(", ");
export { W as SVG_W, H as SVG_H };
