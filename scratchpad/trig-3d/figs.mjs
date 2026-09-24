/**
 * Oblique-projection solids for maths.m8.pythagoras-and-trigonometry-in-3d.
 *
 * Every builder returns { body, w, h } in its own coordinate space with the origin at the
 * top-left, so `compose()` can place a solid and its extracted 2-D triangle side by side.
 * House rules: viewBox on the finished svg, currentColor only, no <style>, no <script>,
 * no external hrefs, text font-family='inherit'.
 */

// Depth direction of the oblique projection: back is up and to the right, foreshortened.
const KX = 0.48;
const KY = 0.3;

const n = (v) => {
  const r = Math.round(v * 100) / 100;
  return Object.is(r, -0) ? 0 : r;
};

/** 3-D point -> unscaled screen point (y grows downwards). */
export function project([x, y, z], s) {
  return [s * (x + KX * y), -s * (z + KY * y)];
}

/** Shift a map of screen points so the whole drawing sits inside a padded box. */
function fit(points, pad) {
  const xs = Object.values(points).map((p) => p[0]);
  const ys = Object.values(points).map((p) => p[1]);
  const minX = Math.min(...xs);
  const minY = Math.min(...ys);
  const out = {};
  for (const [k, p] of Object.entries(points)) out[k] = [p[0] - minX + pad, p[1] - minY + pad];
  return { pts: out, w: Math.max(...xs) - minX + 2 * pad, h: Math.max(...ys) - minY + 2 * pad };
}

const sub = (a, b) => [a[0] - b[0], a[1] - b[1]];
const add = (a, b) => [a[0] + b[0], a[1] + b[1]];
const mul = (a, k) => [a[0] * k, a[1] * k];
const len = (a) => Math.hypot(a[0], a[1]);
const unit = (a) => (len(a) === 0 ? [0, 0] : mul(a, 1 / len(a)));
const mid = (a, b) => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
const perp = (a) => [-a[1], a[0]];

const line = (a, b, { dash = false, width = 1.6 } = {}) =>
  `<path d='M${n(a[0])} ${n(a[1])}L${n(b[0])} ${n(b[1])}' fill='none' stroke='currentColor' stroke-width='${width}'${
    dash ? " stroke-dasharray='5 4'" : ""
  } stroke-linecap='round'/>`;

const text = (p, s, { size = 12, anchor = "middle", weight = null, dy = 0 } = {}) =>
  `<text x='${n(p[0])}' y='${n(p[1] + dy)}' text-anchor='${anchor}' font-family='inherit' font-size='${size}'${
    weight ? ` font-weight='${weight}'` : ""
  } fill='currentColor'>${s}</text>`;

const dot = (p, r = 2.6) => `<circle cx='${n(p[0])}' cy='${n(p[1])}' r='${r}' fill='currentColor'/>`;

/** Small square marking a right angle at `c`, opening towards `a` and `b`. */
function rightAngle(c, a, b, size = 9) {
  const u = mul(unit(sub(a, c)), size);
  const v = mul(unit(sub(b, c)), size);
  const p1 = add(c, u);
  const p2 = add(add(c, u), v);
  const p3 = add(c, v);
  return `<path d='M${n(p1[0])} ${n(p1[1])}L${n(p2[0])} ${n(p2[1])}L${n(p3[0])} ${n(p3[1])}' fill='none' stroke='currentColor' stroke-width='1.2'/>`;
}

/** Arc marking the angle at `c` between rays to `a` and `b`, with an optional label. */
function angleArc(c, a, b, label, { r = 20, size = 12, gap = 15 } = {}) {
  const u = unit(sub(a, c));
  const v = unit(sub(b, c));
  const p1 = add(c, mul(u, r));
  const p2 = add(c, mul(v, r));
  const cross = u[0] * v[1] - u[1] * v[0];
  const sweep = cross > 0 ? 1 : 0;
  let out = `<path d='M${n(p1[0])} ${n(p1[1])}A${r} ${r} 0 0 ${sweep} ${n(p2[0])} ${n(p2[1])}' fill='none' stroke='currentColor' stroke-width='1.2'/>`;
  if (label) {
    const bis = unit(add(u, v));
    const lp = add(c, mul(bis, r + gap));
    out += text(lp, label, { size, dy: 4 });
  }
  return out;
}

/** Vertex letters, pushed outwards from the centre of the drawing (or along a given direction). */
function vertexLabels(pts, names, centre, { d = 14, size = 13, dirs = {} } = {}) {
  return names
    .map((name) => {
      const p = pts[name];
      const away = dirs[name] ? unit(dirs[name]) : unit(sub(p, centre));
      const lp = add(p, mul(away, dirs[name] ? d + 3 : d));
      return dot(p) + text(lp, name, { size, weight: 600, dy: 4.5 });
    })
    .join("");
}

/** Label for an edge: pushed outwards from the centre of the drawing. */
function edgeLabel(a, b, label, centre, { d = 17, size = 12 } = {}) {
  const m = mid(a, b);
  const away = unit(sub(m, centre));
  return text(add(m, mul(away, d)), label, { size, dy: 4 });
}

/** Label for an interior line (a diagonal): pushed perpendicular to it, anchored clear of the line. */
function innerLabel(a, b, label, side = 1, { d = 13, size = 12 } = {}) {
  const m = mid(a, b);
  const off = mul(unit(perp(unit(sub(b, a)))), d * side);
  const anchor = off[0] > 4 ? "start" : off[0] < -4 ? "end" : "middle";
  return text(add(m, off), label, { size, dy: 4, anchor });
}

const centreOf = (pts, keys) => {
  const ps = keys.map((k) => pts[k]);
  return [ps.reduce((t, p) => t + p[0], 0) / ps.length, ps.reduce((t, p) => t + p[1], 0) / ps.length];
};

// ---------------------------------------------------------------------------
// Cuboid ABCD (base) / EFGH (top), E above A, F above B, G above C, H above D
// ---------------------------------------------------------------------------

/**
 * @param {object} o
 * @param {number} o.w AB, @param {number} o.d BC, @param {number} o.h CG (drawing units)
 * @param {object} [o.edges] labels keyed by edge, e.g. { AB: '8 cm', BC: '6 cm', CG: '5 cm' }
 * @param {boolean} [o.baseDiag] draw AC, @param {string} [o.baseDiagLabel]
 * @param {boolean} [o.spaceDiag] draw AG, @param {string} [o.spaceDiagLabel]
 * @param {string} [o.angle] label for the angle GAC at A (between AG and the base)
 * @param {[string,string,string]} [o.markAngle] mark the angle at pts[1] between pts[0] and pts[2]
 * @param {string} [o.markAngleLabel]
 */
export function cuboid(o) {
  const s = o.scale ?? 26;
  const V = {
    A: [0, 0, 0],
    B: [o.w, 0, 0],
    C: [o.w, o.d, 0],
    D: [0, o.d, 0],
    E: [0, 0, o.h],
    F: [o.w, 0, o.h],
    G: [o.w, o.d, o.h],
    H: [0, o.d, o.h],
  };
  const raw = {};
  for (const [k, v] of Object.entries(V)) raw[k] = project(v, s);
  const { pts, w, h } = fit(raw, o.pad ?? 36);
  const c = centreOf(pts, Object.keys(pts));
  const names = o.names ?? ["A", "B", "C", "D", "E", "F", "G", "H"];
  const re = (a, b) => `${a}${b}`;

  let body = "";
  // solid edges, then the three edges hidden behind the solid
  for (const [a, b] of [
    ["A", "B"],
    ["B", "C"],
    ["A", "E"],
    ["B", "F"],
    ["C", "G"],
    ["E", "F"],
    ["F", "G"],
    ["G", "H"],
    ["H", "E"],
  ])
    body += line(pts[a], pts[b]);
  for (const [a, b] of [
    ["A", "D"],
    ["D", "C"],
    ["D", "H"],
  ])
    body += line(pts[a], pts[b], { dash: true, width: 1.2 });

  if (o.baseDiag) body += line(pts.A, pts.C, { dash: true, width: 1.3 });
  if (o.spaceDiag) body += line(pts.A, pts.G, { width: 2.1 });

  for (const [edge, label] of Object.entries(o.edges ?? {})) {
    body += edgeLabel(pts[edge[0]], pts[edge[1]], label, c);
  }
  if (o.baseDiagLabel) body += innerLabel(pts.A, pts.C, o.baseDiagLabel, 1);
  if (o.spaceDiagLabel) body += innerLabel(pts.A, pts.G, o.spaceDiagLabel, -1);
  if (o.angle) {
    body += angleArc(pts.A, pts.G, pts.C, o.angle, { r: 24, gap: 14 });
    body += rightAngle(pts.C, pts.A, pts.G, 8);
  }
  if (o.markAngle) {
    const [a, v, b] = o.markAngle;
    body += angleArc(pts[v], pts[a], pts[b], o.markAngleLabel ?? "", { r: 30, gap: 22 });
  }
  if (o.extraLines) for (const [a, b, dash] of o.extraLines) body += line(pts[a], pts[b], { dash: !!dash, width: 1.3 });

  // D and H sit inside the outline in this projection, so their letters get a fixed push
  body += vertexLabels(pts, o.showNames ?? names, c, { dirs: { D: [-0.95, 0.3], H: [-0.95, -0.3], ...(o.dirs ?? {}) } });
  if (o.title) body += text([w / 2, h - 4], o.title, { size: 12 });
  void re;
  return { body, w, h: o.title ? h + 6 : h, pts };
}

// ---------------------------------------------------------------------------
// Square-based pyramid: base ABCD, apex V above the centre M
// ---------------------------------------------------------------------------

export function pyramid(o) {
  const s = o.scale ?? 26;
  const b = o.base;
  const V = {
    A: [0, 0, 0],
    B: [b, 0, 0],
    C: [b, b, 0],
    D: [0, b, 0],
    V: [b / 2, b / 2, o.h],
    M: [b / 2, b / 2, 0],
    N: [b / 2, 0, 0], // midpoint of AB, for the angle between face VAB and the base
  };
  const raw = {};
  for (const [k, v] of Object.entries(V)) raw[k] = project(v, s);
  const { pts, w, h } = fit(raw, o.pad ?? 36);
  const c = centreOf(pts, ["A", "B", "C", "D", "V"]);

  let body = "";
  for (const [a, bb] of [
    ["A", "B"],
    ["B", "C"],
    ["V", "A"],
    ["V", "B"],
    ["V", "C"],
  ])
    body += line(pts[a], pts[bb]);
  for (const [a, bb] of [
    ["A", "D"],
    ["D", "C"],
    ["V", "D"],
  ])
    body += line(pts[a], pts[bb], { dash: true, width: 1.2 });

  if (o.diagonal) body += line(pts.A, pts.C, { dash: true, width: 1.3 });
  if (o.height) {
    body += line(pts.V, pts.M, { dash: true, width: 1.4 });
    body += rightAngle(pts.M, pts.A, pts.V, 8);
  }
  if (o.slantHeight) {
    body += line(pts.V, pts.N, { width: 2 });
    body += line(pts.M, pts.N, { dash: true, width: 1.3 });
    body += rightAngle(pts.N, pts.M, pts.V, 8);
  }
  if (o.slantEdge) body += line(pts.V, pts.A, { width: 2.1 });

  for (const [edge, label] of Object.entries(o.edges ?? {})) body += edgeLabel(pts[edge[0]], pts[edge[1]], label, c);
  for (const [k, label] of Object.entries(o.innerLabels ?? {}))
    body += innerLabel(pts[k[0]], pts[k[1]], label, o.innerSides?.[k] ?? 1);
  if (o.angleAtA) body += angleArc(pts.A, pts.V, pts.C, o.angleAtA, { r: 22, gap: 14 });
  if (o.angleAtN) body += angleArc(pts.N, pts.V, pts.M, o.angleAtN, { r: 17, gap: 17 });

  const show = o.showNames ?? ["A", "B", "C", "D", "V"];
  body += vertexLabels(pts, show, c, { dirs: { D: [-0.95, 0.25], V: [0, -1] } });
  if (o.markM) body += dot(pts.M) + text(add(pts.M, [-14, 7]), "M", { size: 13, weight: 600, dy: 4.5 });
  if (o.markN) body += dot(pts.N) + text(add(pts.N, [-2, 19]), "N", { size: 13, weight: 600, dy: 4.5 });
  return { body, w, h, pts };
}

// ---------------------------------------------------------------------------
// Wedge (right triangular prism lying on its rectangular face):
// base ABCD, vertical face DCGH at the back, sloping face ABGH
// ---------------------------------------------------------------------------

export function wedge(o) {
  const s = o.scale ?? 26;
  const V = {
    A: [0, 0, 0],
    B: [o.w, 0, 0],
    C: [o.w, o.d, 0],
    D: [0, o.d, 0],
    G: [o.w, o.d, o.h],
    H: [0, o.d, o.h],
  };
  const raw = {};
  for (const [k, v] of Object.entries(V)) raw[k] = project(v, s);
  const { pts, w, h } = fit(raw, o.pad ?? 36);
  const c = centreOf(pts, Object.keys(pts));

  let body = "";
  for (const [a, b] of [
    ["A", "B"],
    ["B", "C"],
    ["B", "G"],
    ["C", "G"],
    ["G", "H"],
    ["H", "A"],
  ])
    body += line(pts[a], pts[b]);
  for (const [a, b] of [
    ["A", "D"],
    ["D", "C"],
    ["D", "H"],
  ])
    body += line(pts[a], pts[b], { dash: true, width: 1.2 });

  if (o.baseDiag) body += line(pts.A, pts.C, { dash: true, width: 1.3 });
  if (o.slopeDiag) body += line(pts.A, pts.G, { width: 2.1 });
  for (const [edge, label] of Object.entries(o.edges ?? {})) body += edgeLabel(pts[edge[0]], pts[edge[1]], label, c);
  for (const [k, label] of Object.entries(o.innerLabels ?? {}))
    body += innerLabel(pts[k[0]], pts[k[1]], label, o.innerSides?.[k] ?? 1);
  if (o.angle) {
    body += angleArc(pts.A, pts.G, pts.C, o.angle, { r: 24, gap: 14 });
    body += rightAngle(pts.C, pts.A, pts.G, 8);
  }
  body += vertexLabels(pts, o.showNames ?? Object.keys(V), c, { dirs: { D: [-0.95, 0.3], H: [-0.95, -0.3] } });
  return { body, w, h, pts };
}

// ---------------------------------------------------------------------------
// Cone with radius, vertical height and slant height
// ---------------------------------------------------------------------------

export function cone(o) {
  const s = o.scale ?? 26;
  const r = o.r * s;
  const hh = o.h * s;
  const ry = r * 0.32;
  const pad = o.pad ?? 36;
  const w = 2 * r + 2 * pad;
  const h = hh + ry + 2 * pad;
  const cx = pad + r;
  const cy = pad + hh; // centre of the base ellipse
  const apex = [cx, pad];
  const left = [cx - r, cy];
  const right = [cx + r, cy];
  const centre = [cx, cy];

  let body = `<ellipse cx='${n(cx)}' cy='${n(cy)}' rx='${n(r)}' ry='${n(ry)}' fill='none' stroke='currentColor' stroke-width='1.6'/>`;
  body += line(apex, left);
  body += line(apex, right, { width: 2.1 });
  body += line(apex, centre, { dash: true, width: 1.4 });
  body += line(centre, right, { dash: true, width: 1.4 });
  body += rightAngle(centre, apex, right, 9);
  if (o.rLabel) body += text([cx + r / 2, cy + 16], o.rLabel, { size: 12 });
  if (o.hLabel) body += text([cx - 10, cy - hh / 2], o.hLabel, { size: 12, anchor: "end" });
  if (o.lLabel) body += text([cx + r * 0.55 + 14, cy - hh * 0.45], o.lLabel, { size: 12, anchor: "start" });
  if (o.angle) body += angleArc(right, apex, centre, o.angle, { r: 22, gap: 15 });
  body += dot(centre, 2.4);
  return { body, w, h };
}

// ---------------------------------------------------------------------------
// The extracted 2-D right-angled triangle, drawn on its own
// ---------------------------------------------------------------------------

/**
 * Right angle at the bottom-right vertex; the named angle sits at the bottom-left.
 * @param {object} o
 * @param {number} o.base horizontal length, @param {number} o.height vertical length
 * @param {[string,string,string]} o.names [bottom-left, bottom-right, top-right]
 * @param {string} [o.baseLabel] [o.heightLabel] [o.hypLabel] [o.angle]
 */
export function rightTri(o) {
  const maxW = o.maxW ?? 200;
  const maxH = o.maxH ?? 150;
  // keep the shape honest but never so thin that the labels collide
  const ratio = Math.min(3.2, Math.max(0.3, o.height / o.base));
  let bw = maxW;
  let bh = bw * ratio;
  if (bh > maxH) {
    bh = maxH;
    bw = bh / ratio;
  }
  const padL = o.padL ?? 48;
  // the height label sits outside the triangle, so the right margin has to hold it
  const padR = o.padR ?? Math.max(56, 18 + 6.6 * (o.heightLabel?.length ?? 0));
  const padT = o.padT ?? 28;
  const padB = o.padB ?? 46;
  const P = [padL, padT + bh];
  const Q = [padL + bw, padT + bh];
  const R = [padL + bw, padT];
  const [nP, nQ, nR] = o.names;

  let body = line(P, Q) + line(Q, R) + line(P, R, { width: 2.1 });
  body += rightAngle(Q, P, R, 10);
  if (o.angle) body += angleArc(P, Q, R, o.angle, { r: 24, gap: 16 });
  if (o.baseLabel) body += text([padL + bw / 2, padT + bh + 34], o.baseLabel, { size: 12 });
  if (o.heightLabel) body += text([padL + bw + 11, padT + bh / 2], o.heightLabel, { size: 12, anchor: "start", dy: 4 });
  if (o.hypLabel) body += text([padL + bw / 2 - 8, padT + bh / 2 - 9], o.hypLabel, { size: 12, anchor: "end" });
  const c = [(P[0] + Q[0] + R[0]) / 3, (P[1] + Q[1] + R[1]) / 3];
  body += vertexLabels({ [nP]: P, [nQ]: Q, [nR]: R }, [nP, nQ, nR], c, {
    d: 15,
    dirs: { [nP]: [-0.9, 0.45], [nQ]: [0.9, 0.45], [nR]: [0.65, -0.76] },
  });
  return { body, w: padL + bw + padR, h: padT + bh + padB };
}

// ---------------------------------------------------------------------------
// Composition
// ---------------------------------------------------------------------------

/** Lay parts out left to right, vertically centred, with an optional caption under each. */
export function compose(parts, { gap = 18, captionSize = 11.5, title = null } = {}) {
  const capH = parts.some((p) => p.caption) ? 20 : 0;
  const h = Math.max(...parts.map((p) => p.h)) + capH + (title ? 20 : 0);
  const top = title ? 20 : 0;
  let x = 0;
  let body = "";
  if (title) body += text([0, 13], title, { size: 12, anchor: "start" });
  for (const p of parts) {
    const dy = top + (h - top - capH - p.h) / 2;
    body += `<g transform='translate(${n(x)} ${n(dy)})'>${p.body}</g>`;
    if (p.caption) body += text([x + p.w / 2, h - 5], p.caption, { size: captionSize });
    x += p.w + gap;
  }
  const w = x - gap;
  if (title) {
    // re-emit the title centred once the width is known
    body = body.replace(
      /^<text x='0'[^>]*>.*?<\/text>/,
      `<text x='${n(w / 2)}' y='13' text-anchor='middle' font-family='inherit' font-size='12' fill='currentColor'>${title}</text>`,
    );
  }
  return svgWrap(body, w, h);
}

export function svgWrap(body, w, h) {
  return `<svg viewBox='0 0 ${n(w)} ${n(h)}' xmlns='http://www.w3.org/2000/svg' width='${n(w)}' height='${n(h)}' role='img'>${body}</svg>`;
}

/** data: URI for a figures[] entry. decodeURIComponent must survive it, so % # and non-ASCII are encoded. */
export function dataUri(svg) {
  const encoded = svg
    .replace(/%/g, "%25")
    .replace(/#/g, "%23")
    .replace(/[^\x20-\x7E]/g, (ch) => encodeURIComponent(ch));
  return `data:image/svg+xml;utf8,${encoded}`;
}
