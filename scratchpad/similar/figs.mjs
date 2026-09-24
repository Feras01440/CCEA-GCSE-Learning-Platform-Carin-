/**
 * SVG builders for the M7 similar-shapes bundle.
 * Every shape is drawn from computed geometry: no hand-typed path data.
 * Rules: viewBox always; stroke/fill = currentColor with fill-opacity tints;
 * text font-family='inherit'; no <style>, <script>, href, #, % or &.
 */

const r1 = (n) => Math.round(n * 10) / 10;

export const svg = (w, h, body) =>
  `<svg viewBox='0 0 ${w} ${h}' xmlns='http://www.w3.org/2000/svg'>${body}</svg>`;

export const text = (x, y, s, o = {}) => {
  const { anchor = "start", size = 12.5, weight = null, italic = false, opacity = null } = o;
  return (
    `<text x='${r1(x)}' y='${r1(y)}' text-anchor='${anchor}' font-family='inherit' font-size='${size}' ` +
    `fill='currentColor'${weight ? ` font-weight='${weight}'` : ""}${italic ? " font-style='italic'" : ""}` +
    `${opacity ? ` fill-opacity='${opacity}'` : ""}>${s}</text>`
  );
};

const path = (d, o = {}) => {
  const { fill = "none", fillOpacity = null, width = 1.5, dash = null } = o;
  return (
    `<path d='${d}' fill='${fill}'${fillOpacity !== null ? ` fill-opacity='${fillOpacity}'` : ""} ` +
    `stroke='currentColor' stroke-width='${width}'${dash ? ` stroke-dasharray='${dash}'` : ""}/>`
  );
};

const line = (x1, y1, x2, y2, o = {}) => path(`M${r1(x1)} ${r1(y1)}L${r1(x2)} ${r1(y2)}`, o);

const poly = (pts, o = {}) =>
  path(pts.map((p, i) => `${i ? "L" : "M"}${r1(p[0])} ${r1(p[1])}`).join("") + "Z", o);

const rect = (x, y, w, h, o = {}) => poly([[x, y], [x + w, y], [x + w, y + h], [x, y + h]], o);

const ellipse = (cx, cy, rx, ry, o = {}) => {
  const { fillOpacity = null, width = 1.5, dash = null } = o;
  return (
    `<ellipse cx='${r1(cx)}' cy='${r1(cy)}' rx='${r1(rx)}' ry='${r1(ry)}' fill='currentColor' ` +
    `fill-opacity='${fillOpacity === null ? 0 : fillOpacity}' stroke='currentColor' stroke-width='${width}'` +
    `${dash ? ` stroke-dasharray='${dash}'` : ""}/>`
  );
};

const dot = (x, y, r = 2.6) => `<circle cx='${r1(x)}' cy='${r1(y)}' r='${r}' fill='currentColor'/>`;

/** A thin open arrow from (x1,y1) to (x2,y2), drawn without markers so no id is needed. */
function arrow(x1, y1, x2, y2) {
  const a = Math.atan2(y2 - y1, x2 - x1);
  const h = 7;
  const p1 = [x2 - h * Math.cos(a - 0.42), y2 - h * Math.sin(a - 0.42)];
  const p2 = [x2 - h * Math.cos(a + 0.42), y2 - h * Math.sin(a + 0.42)];
  return (
    line(x1, y1, x2, y2, { width: 1.4 }) +
    path(`M${r1(p1[0])} ${r1(p1[1])}L${r1(x2)} ${r1(y2)}L${r1(p2[0])} ${r1(p2[1])}`, { width: 1.4 })
  );
}

/** Chevrons across a segment, the standard "these lines are parallel" mark. */
function parallelMark(x1, y1, x2, y2, n = 1) {
  const mx = (x1 + x2) / 2;
  const my = (y1 + y2) / 2;
  const a = Math.atan2(y2 - y1, x2 - x1);
  let out = "";
  for (let i = 0; i < n; i++) {
    const off = (i - (n - 1) / 2) * 6;
    const bx = mx + off * Math.cos(a);
    const by = my + off * Math.sin(a);
    const tipx = bx + 4.5 * Math.cos(a);
    const tipy = by + 4.5 * Math.sin(a);
    const p1 = [bx - 4 * Math.cos(a - 1.05), by - 4 * Math.sin(a - 1.05)];
    const p2 = [bx - 4 * Math.cos(a + 1.05), by - 4 * Math.sin(a + 1.05)];
    out += path(
      `M${r1(p1[0] + (tipx - bx))} ${r1(p1[1] + (tipy - by))}L${r1(tipx)} ${r1(tipy)}L${r1(p2[0] + (tipx - bx))} ${r1(p2[1] + (tipy - by))}`,
      { width: 1.3 },
    );
  }
  return out;
}

/** Oblique cuboid: front face w x h at (x, y), depth d drawn up-and-right. */
function cuboid(x, y, w, h, d, { nx = 1, ny = 1, nz = 1 } = {}) {
  const dx = d * 0.62;
  const dy = -d * 0.5;
  let out = "";
  // top and right faces first so the front face sits over their edges
  out += poly([[x, y], [x + dx, y + dy], [x + w + dx, y + dy], [x + w, y]], { fill: "currentColor", fillOpacity: 0.14 });
  out += poly([[x + w, y], [x + w + dx, y + dy], [x + w + dx, y + h + dy], [x + w, y + h]], { fill: "currentColor", fillOpacity: 0.07 });
  out += rect(x, y, w, h, { fill: "currentColor", fillOpacity: 0.03 });
  for (let i = 1; i < nx; i++) {
    const px = x + (w * i) / nx;
    out += line(px, y, px, y + h, { width: 0.9 });
    out += line(px, y, px + dx, y + dy, { width: 0.9 });
  }
  for (let i = 1; i < ny; i++) {
    const py = y + (h * i) / ny;
    out += line(x, py, x + w, py, { width: 0.9 });
    out += line(x + w, py, x + w + dx, py + dy, { width: 0.9 });
  }
  for (let i = 1; i < nz; i++) {
    const ox = (dx * i) / nz;
    const oy = (dy * i) / nz;
    out += line(x + ox, y + oy, x + w + ox, y + oy, { width: 0.9 });
    out += line(x + w + ox, y + oy, x + w + ox, y + h + oy, { width: 0.9 });
  }
  return out;
}

/** Cylinder standing on its base. */
function cylinder(cx, topY, rx, ry, h) {
  return (
    path(
      `M${r1(cx - rx)} ${r1(topY)}V${r1(topY + h)}A${r1(rx)} ${r1(ry)} 0 0 0 ${r1(cx + rx)} ${r1(topY + h)}V${r1(topY)}`,
      { fill: "currentColor", fillOpacity: 0.05 },
    ) + ellipse(cx, topY, rx, ry, { fillOpacity: 0.12 })
  );
}

/** Right cone standing on its base. */
function cone(cx, apexY, rx, ry, h) {
  const baseY = apexY + h;
  return (
    poly([[cx, apexY], [cx - rx, baseY], [cx + rx, baseY]], { fill: "currentColor", fillOpacity: 0.05 }) +
    ellipse(cx, baseY, rx, ry, { fillOpacity: 0.12 })
  );
}

/** Triangle with apex 30% along the base; returns [B, C, A] in pixels. */
function triPts(leftX, baseY, base, height) {
  return [
    [leftX, baseY],
    [leftX + base, baseY],
    [leftX + base * 0.3, baseY - height],
  ];
}

const NOT_ACCURATE = "diagram not drawn accurately";

/** Word-wraps a short caption to at most `max` characters a line. */
function wrap(str, max) {
  const out = [];
  let line = "";
  for (const w of str.split(" ")) {
    if (line && (line + " " + w).length > max) { out.push(line); line = w; }
    else line = line ? line + " " + w : w;
  }
  if (line) out.push(line);
  return out;
}

/** A label that may be one string or several short lines, stacked downwards. */
function lines(x, y, label, o = {}) {
  if (!label) return "";
  const arr = Array.isArray(label) ? label : [label];
  const step = (o.size ?? 12) + 3;
  return arr.map((s, i) => text(x, y + i * step, s, o)).join("");
}

// ---------------------------------------------------------------------------
// Note figures (inline SVG)
// ---------------------------------------------------------------------------

/** k, k squared, k cubed in one picture: a square enlarged by 3, a cube enlarged by 2. */
export function figScaleTrio({ kSq, kCu, squares, cubes, f }) {
  const W = 680;
  const H = 352;
  let b = "";

  // --- left panel: square, k = 3 ---
  b += text(20, 26, `A square enlarged by k = ${f(kSq)}`, { weight: 600, size: 13.5 });
  const u = 26;
  b += rect(28, 56, u, u, { fill: "currentColor", fillOpacity: 0.1 });
  b += text(41, 74, "1", { anchor: "middle", size: 11 });
  b += text(41, 100, "1 by 1", { anchor: "middle", size: 11, opacity: 0.75 });
  b += arrow(66, 82, 106, 82);
  b += text(86, 72, `k = ${f(kSq)}`, { anchor: "middle", size: 11.5 });
  const big = kSq * u;
  b += rect(120, 56, big, big, { fill: "currentColor", fillOpacity: 0.1 });
  for (let i = 1; i < kSq; i++) {
    b += line(120 + i * u, 56, 120 + i * u, 56 + big, { width: 0.9 });
    b += line(120, 56 + i * u, 120 + big, 56 + i * u, { width: 0.9 });
  }
  b += text(120 + big / 2, 152, `${f(kSq)} by ${f(kSq)}`, { anchor: "middle", size: 11, opacity: 0.75 });
  b += text(20, 178, `${f(squares)} of the old squares fit inside: area × ${f(kSq)}² = ${f(squares)}`, { size: 12.5 });

  // --- right panel: cube, k = 2 ---
  b += text(360, 26, `A cube enlarged by k = ${f(kCu)}`, { weight: 600, size: 13.5 });
  b += cuboid(368, 66, 24, 24, 16);
  b += text(386, 116, "1 by 1 by 1", { anchor: "middle", size: 11, opacity: 0.75 });
  b += arrow(424, 78, 462, 78);
  b += text(443, 68, `k = ${f(kCu)}`, { anchor: "middle", size: 11.5 });
  b += cuboid(482, 52, 48, 48, 32, { nx: kCu, ny: kCu, nz: kCu });
  b += text(510, 134, `${f(kCu)} by ${f(kCu)} by ${f(kCu)}`, { anchor: "middle", size: 11, opacity: 0.75 });
  b += text(360, 178, `${f(cubes)} of the old cubes fit inside: volume × ${f(kCu)}³ = ${f(cubes)}`, { size: 12.5 });

  // --- the rule strip ---
  const boxes = [
    ["length", "× k", "every side, every height, the perimeter"],
    ["area", "× k²", "every face, the surface area, the cross-section"],
    ["volume", "× k³", "the whole solid, and what it holds"],
  ];
  boxes.forEach(([what, mult, note], i) => {
    const x = 20 + i * 216;
    b += rect(x, 206, 200, 74, { fill: "currentColor", fillOpacity: 0.04, width: 1.2 });
    b += text(x + 14, 230, what, { weight: 600, size: 13 });
    b += text(x + 186, 230, mult, { anchor: "end", weight: 600, size: 15 });
    b += lines(x + 14, 252, wrap(note, 34), { size: 10.8, opacity: 0.8 });
  });
  b += text(20, 310, "Going back the other way: k = √(area factor)   and   k = ∛(volume factor)", { size: 13 });
  b += text(20, 334, `So an area ratio of 1 : ${f(squares)} is a length ratio of 1 : ${f(kSq)} and a volume ratio of 1 : ${f(kSq ** 3)}.`, {
    size: 12,
    opacity: 0.85,
  });
  return svg(W, H, b);
}

/** Similar triangles with the corresponding sides marked, plus the mismatch trap. */
export function figCorrespondingSides({ small1, large1, small2, large2, k, f }) {
  const W = 730;
  const H = 300;
  let b = "";
  b += text(20, 24, "Corresponding sides sit opposite equal angles", { weight: 600, size: 13.5 });

  const small = triPts(110, 170, 120, 94);
  const large = triPts(370, 210, 200, 156);
  b += poly(small, { fill: "currentColor", fillOpacity: 0.05 });
  b += poly(large, { fill: "currentColor", fillOpacity: 0.05 });

  // vertices
  const nameS = ["P", "Q", "R"];
  const nameL = ["X", "Y", "Z"];
  const offS = [[-14, 14], [8, 14], [-4, -8]];
  small.forEach((p, i) => {
    b += dot(p[0], p[1]);
    b += text(p[0] + offS[i][0], p[1] + offS[i][1], nameS[i], { weight: 600, size: 12.5 });
  });
  large.forEach((p, i) => {
    b += dot(p[0], p[1]);
    b += text(p[0] + offS[i][0], p[1] + offS[i][1], nameL[i], { weight: 600, size: 12.5 });
  });

  // angle arcs: one arc at P and X, two at Q and Y
  const arcAt = (pts, i, n) => {
    const p = pts[i];
    const a = pts[(i + 1) % 3];
    const c = pts[(i + 2) % 3];
    const ang = (q) => Math.atan2(q[1] - p[1], q[0] - p[0]);
    let out = "";
    for (let k = 0; k < n; k++) {
      const rr = 16 + k * 5;
      const s = [p[0] + rr * Math.cos(ang(a)), p[1] + rr * Math.sin(ang(a))];
      const e = [p[0] + rr * Math.cos(ang(c)), p[1] + rr * Math.sin(ang(c))];
      out += path(`M${r1(s[0])} ${r1(s[1])}A${rr} ${rr} 0 0 1 ${r1(e[0])} ${r1(e[1])}`, { width: 1.1 });
    }
    return out;
  };
  b += arcAt(small, 0, 1) + arcAt(large, 0, 1);
  b += arcAt(small, 1, 2) + arcAt(large, 1, 2);

  b += text(170, 188, `PQ = ${f(small1)} cm`, { anchor: "middle", size: 12 });
  b += text(470, 228, `XY = ${f(large1)} cm`, { anchor: "middle", size: 12 });
  b += text(100, 128, `PR = ${f(small2)} cm`, { anchor: "end", size: 12 });
  b += text(360, 150, `XZ = ${f(large2)} cm`, { anchor: "end", size: 12 });
  b += text(20, 262, "One arc pairs with one arc, two with two: PQ goes with XY, PR with XZ.", { size: 12.5 });
  b += text(20, 284, `k = ${f(large1)} ÷ ${f(small1)} = ${f(k)}, and ${f(small2)} × ${f(k)} = ${f(large2)}. Pair the sides first, divide second.`, { size: 12.5, opacity: 0.85 });
  b += text(W - 20, 24, NOT_ACCURATE, { anchor: "end", size: 10.5, opacity: 0.7 });
  return svg(W, H, b);
}

/** Two similar cylinders carrying an area ratio, a height ratio and a volume ratio. */
export function figCylinderChain({ a2, b2, a, b: bb, a3, b3, f }) {
  const W = 620;
  const H = 300;
  let b = "";
  b += text(20, 24, "One chain, three links", { weight: 600, size: 13.5 });
  b += cylinder(90, 130, 30, 11, 74);
  b += text(90, 232, "C", { anchor: "middle", weight: 600, size: 13 });
  b += cylinder(240, 60, 45, 16.5, 111);
  b += text(240, 232, "D", { anchor: "middle", weight: 600, size: 13 });
  b += line(136, 130, 136, 204, { width: 1, dash: "4 3" });
  b += text(142, 172, "h", { size: 12, italic: true });
  b += line(296, 60, 296, 171, { width: 1, dash: "4 3" });
  b += text(302, 120, "H", { size: 12, italic: true });

  const rows = [
    ["curved surface areas", `${f(a2)} : ${f(b2)}`, "given"],
    ["heights", `${f(a)} : ${f(bb)}`, `√${f(a2)} : √${f(b2)}`],
    ["volumes", `${f(a3)} : ${f(b3)}`, `${f(a)}³ : ${f(bb)}³`],
  ];
  rows.forEach(([a, c, why], i) => {
    const y = 78 + i * 46;
    b += rect(360, y - 20, 240, 36, { fill: "currentColor", fillOpacity: 0.04, width: 1.1 });
    b += text(370, y - 5, a, { size: 11.5, opacity: 0.85 });
    b += text(370, y + 11, c, { size: 14, weight: 600 });
    b += text(592, y + 11, why, { anchor: "end", size: 11, opacity: 0.8 });
    if (i < 2) b += arrow(480, y + 16, 480, y + 26);
  });
  b += text(20, 268, "Never jump from areas straight to volumes: land on the lengths first.", { size: 12.5 });
  b += text(W - 20, 24, NOT_ACCURATE, { anchor: "end", size: 10.5, opacity: 0.7 });
  return svg(W, H, b);
}

// ---------------------------------------------------------------------------
// Item figures (returned raw; gen.mjs wraps them as data URIs)
// ---------------------------------------------------------------------------

export function figTrianglePair({ leftName, rightName, leftBase, rightBase, leftSide, rightSide, leftArea, rightArea, question }) {
  const W = 620;
  const H = 254;
  let b = "";
  const small = triPts(110, 170, 130, 100);
  const large = triPts(310, 190, 200, 154);
  b += poly(small, { fill: "currentColor", fillOpacity: 0.05 });
  b += poly(large, { fill: "currentColor", fillOpacity: 0.05 });
  b += text(175, 212, leftName, { anchor: "middle", weight: 600, size: 13 });
  b += text(410, 232, rightName, { anchor: "middle", weight: 600, size: 13 });
  if (leftBase) b += text(175, 188, leftBase, { anchor: "middle", size: 12 });
  if (rightBase) b += text(410, 208, rightBase, { anchor: "middle", size: 12 });
  if (leftSide) b += text(98, 122, leftSide, { anchor: "end", size: 12 });
  if (rightSide) b += text(302, 128, rightSide, { anchor: "end", size: 12 });
  if (leftArea) b += text(175, 148, leftArea, { anchor: "middle", size: 12 });
  if (rightArea) b += text(410, 168, rightArea, { anchor: "middle", size: 12 });
  if (question) b += text(20, 26, question, { size: 12.5 });
  b += text(W - 20, H - 8, NOT_ACCURATE, { anchor: "end", size: 10.5, opacity: 0.7 });
  return svg(W, H, b);
}

export function figNestedTriangle({ apex, left, right, dName, eName, adLabel, dbLabel, deLabel, bcLabel, aeLabel, ecLabel, t = 0.4 }) {
  const W = 470;
  const H = 280;
  let b = "";
  const A = [200, 34];
  const B = [40, 226];
  const C = [400, 226];
  const D = [A[0] + (B[0] - A[0]) * t, A[1] + (B[1] - A[1]) * t];
  const E = [A[0] + (C[0] - A[0]) * t, A[1] + (C[1] - A[1]) * t];
  b += poly([A, B, C], { fill: "currentColor", fillOpacity: 0.04 });
  b += poly([A, D, E], { fill: "currentColor", fillOpacity: 0.09 });
  b += line(D[0], D[1], E[0], E[1], { width: 1.5 });
  b += parallelMark(D[0], D[1], E[0], E[1], 1);
  b += parallelMark(B[0], B[1], C[0], C[1], 1);
  [[A, apex, -4, -12], [B, left, -16, 16], [C, right, 8, 16], [D, dName, -18, 4], [E, eName, 8, 4]].forEach(([p, n, ox, oy]) => {
    b += dot(p[0], p[1]);
    b += text(p[0] + ox, p[1] + oy, n, { weight: 600, size: 12.5 });
  });
  if (adLabel) b += text((A[0] + D[0]) / 2 - 10, (A[1] + D[1]) / 2, adLabel, { anchor: "end", size: 12 });
  if (dbLabel) b += text((D[0] + B[0]) / 2 - 10, (D[1] + B[1]) / 2 + 6, dbLabel, { anchor: "end", size: 12 });
  if (aeLabel) b += text((A[0] + E[0]) / 2 + 10, (A[1] + E[1]) / 2, aeLabel, { size: 12 });
  if (ecLabel) b += text((E[0] + C[0]) / 2 + 10, (E[1] + C[1]) / 2 + 6, ecLabel, { size: 12 });
  if (deLabel) b += text((D[0] + E[0]) / 2, D[1] - 8, deLabel, { anchor: "middle", size: 12 });
  if (bcLabel) b += text((B[0] + C[0]) / 2, B[1] + 20, bcLabel, { anchor: "middle", size: 12 });
  b += text(W - 14, 20, NOT_ACCURATE, { anchor: "end", size: 10.5, opacity: 0.7 });
  return svg(W, H, b);
}

export function figCylinderPair({ leftName, rightName, note, leftLabel, rightLabel }) {
  const W = 480;
  const H = 250;
  let b = "";
  b += cylinder(110, 118, 32, 12, 78);
  b += text(110, 224, leftName, { anchor: "middle", weight: 600, size: 13 });
  b += cylinder(300, 58, 48, 18, 117);
  b += text(300, 224, rightName, { anchor: "middle", weight: 600, size: 13 });
  b += lines(110, 205, leftLabel, { anchor: "middle", size: 12 });
  b += lines(300, 205, rightLabel, { anchor: "middle", size: 12 });
  if (note) b += text(20, 26, note, { size: 12.5 });
  b += text(W - 16, H - 10, NOT_ACCURATE, { anchor: "end", size: 10.5, opacity: 0.7 });
  return svg(W, H, b);
}

export function figConePair({ leftName, rightName, note, leftLabel, rightLabel, leftHeight, rightHeight }) {
  const W = 480;
  const H = 250;
  let b = "";
  b += cone(110, 96, 34, 12, 92);
  b += text(110, 224, leftName, { anchor: "middle", weight: 600, size: 13 });
  b += cone(300, 42, 52, 18, 146);
  b += text(300, 224, rightName, { anchor: "middle", weight: 600, size: 13 });
  b += line(110, 96, 110, 188, { width: 1, dash: "4 3" });
  b += line(300, 42, 300, 188, { width: 1, dash: "4 3" });
  if (leftHeight) b += text(116, 150, leftHeight, { size: 11.5 });
  if (rightHeight) b += text(306, 130, rightHeight, { size: 11.5 });
  b += lines(110, 208, leftLabel, { anchor: "middle", size: 12 });
  b += lines(300, 208, rightLabel, { anchor: "middle", size: 12 });
  if (note) b += text(20, 26, note, { size: 12.5 });
  b += text(W - 16, H - 10, NOT_ACCURATE, { anchor: "end", size: 10.5, opacity: 0.7 });
  return svg(W, H, b);
}

export function figRectPair({ leftName, rightName, leftW, leftH, rightW, rightH, leftLabel, rightLabel, note }) {
  const W = 520;
  const H = 268;
  let b = "";
  b += rect(80, 96, leftW, leftH, { fill: "currentColor", fillOpacity: 0.06 });
  b += rect(280, 60, rightW, rightH, { fill: "currentColor", fillOpacity: 0.06 });
  b += text(80 + leftW / 2, 96 + leftH + 22, leftName, { anchor: "middle", weight: 600, size: 13 });
  b += text(280 + rightW / 2, 60 + rightH + 22, rightName, { anchor: "middle", weight: 600, size: 13 });
  b += lines(80 + leftW / 2, 96 + leftH + 40, leftLabel, { anchor: "middle", size: 12 });
  b += lines(280 + rightW / 2, 60 + rightH + 40, rightLabel, { anchor: "middle", size: 12 });
  if (note) b += text(20, 26, note, { size: 12.5 });
  b += text(W - 16, H - 8, NOT_ACCURATE, { anchor: "end", size: 10.5, opacity: 0.7 });
  return svg(W, H, b);
}

export function figCuboidPair({ leftName, rightName, leftLabel, rightLabel, note }) {
  const W = 520;
  const H = 268;
  let b = "";
  b += cuboid(110, 118, 68, 46, 30);
  b += text(152, 196, leftName, { anchor: "middle", weight: 600, size: 13 });
  b += cuboid(310, 74, 102, 69, 45);
  b += text(372, 196, rightName, { anchor: "middle", weight: 600, size: 13 });
  b += lines(152, 216, leftLabel, { anchor: "middle", size: 12 });
  b += lines(372, 216, rightLabel, { anchor: "middle", size: 12 });
  if (note) b += text(20, 26, note, { size: 12.5 });
  b += text(W - 16, H - 8, NOT_ACCURATE, { anchor: "end", size: 10.5, opacity: 0.7 });
  return svg(W, H, b);
}

export function figQuadPair({ leftName, rightName, leftLabel, rightLabel, note, leftSide, rightSide }) {
  const W = 520;
  const H = 250;
  let b = "";
  // a kite-ish quadrilateral, scaled
  const shape = (x, y, s) =>
    [[x, y + 0.55 * s], [x + 0.42 * s, y], [x + s, y + 0.3 * s], [x + 0.5 * s, y + s]];
  const s1 = shape(46, 96, 110);
  const s2 = shape(250, 60, 176);
  b += poly(s1, { fill: "currentColor", fillOpacity: 0.06 });
  b += poly(s2, { fill: "currentColor", fillOpacity: 0.06 });
  b += text(101, 232, leftName, { anchor: "middle", weight: 600, size: 13 });
  b += text(338, 256 - 24, rightName, { anchor: "middle", weight: 600, size: 13 });
  b += lines(101, 214, leftLabel, { anchor: "middle", size: 12 });
  b += lines(338, 214, rightLabel, { anchor: "middle", size: 12 });
  if (leftSide) b += text(72, 84, leftSide, { anchor: "middle", size: 12 });
  if (rightSide) b += text(316, 48, rightSide, { anchor: "middle", size: 12 });
  if (note) b += text(20, 26, note, { size: 12.5 });
  b += text(W - 16, H - 8, NOT_ACCURATE, { anchor: "end", size: 10.5, opacity: 0.7 });
  return svg(W, H, b);
}

/** data:image/svg+xml;utf8,… with the two characters that would break decodeURIComponent escaped. */
export function dataUri(s) {
  return "data:image/svg+xml;utf8," + s.replace(/%/g, "%25").replace(/#/g, "%23");
}
