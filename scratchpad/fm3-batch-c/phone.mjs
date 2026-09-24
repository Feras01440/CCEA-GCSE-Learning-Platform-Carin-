/**
 * Phone-native figures for FM3 batch C (depth standard, 22 Sep 2026): every figure is drawn in a
 * 400-unit viewBox with no label under 14 units (3.5% of the width, 12.5 px in a 358 px phone
 * column), one idea per figure, and no caption text inside the drawing (the block's caption holds
 * it). Every value drawn is computed (stat.mjs), never typed. `assertPhone` refuses a label under
 * the floor or a label that would run off the drawing.
 *
 * Normal curves follow the Summer 2019 report's layout: values and z go below the axis, areas and
 * the probability statement above it.
 */
import { svgGroup, svgRect, svgLine, svgPath, svgCircle, svgWrap, px } from "./lib.mjs";
import { density, phi, phiFixed } from "./stat.mjs";

export const PW = 400;
export const FS = 14; // the smallest label anywhere
export const FM = 15; // ordinary labels
export const FL = 16; // emphasised labels

const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const r2 = (n) => Math.round(n * 100) / 100;
export const minus = (s) => String(s).replace(/^-/, "−");
export const zLabel = (z) => `${z < 0 ? "−" : ""}${Math.abs(z).toFixed(2)}`;

/** A rough width for a label in a sans face: 0.56 em a character, 0.3 em for a space. */
export const textWidth = (s, size) => [...String(s)].reduce((a, ch) => a + (ch === " " ? 0.3 : /[ilj.,:;'|()]/.test(ch) ? 0.32 : /[mwMW%]/.test(ch) ? 0.82 : 0.56), 0) * size;

/**
 * One <text>. Every call records its box so assertPhone can check it stays inside the drawing.
 * `size` defaults to the group's FM.
 */
function label(boxes, x, y, s, { anchor = "middle", weight, size = FM } = {}) {
  const w = textWidth(s, size);
  const x0 = anchor === "middle" ? x - w / 2 : anchor === "end" ? x - w : x;
  boxes.push({ s: String(s), x0, x1: x0 + w, y0: y - size * 0.8, y1: y + size * 0.2, size });
  return `<text x='${px(x)}' y='${px(y)}'${anchor !== "middle" ? ` text-anchor='${anchor}'` : ""}${weight ? ` font-weight='${weight}'` : ""}${size !== FM ? ` font-size='${size}'` : ""}>${esc(s)}</text>`;
}

/** Refuses a label under the floor, off the drawing, or overlapping another label. */
export function assertPhone(boxes, W, H, name) {
  for (const b of boxes) {
    if (b.size < 0.035 * W - 1e-9) throw new Error(`${name}: label "${b.s}" at ${b.size} units is under 3.5% of ${W}`);
    if (b.x0 < 1 || b.x1 > W - 1 || b.y0 < 0 || b.y1 > H) throw new Error(`${name}: label "${b.s}" runs off the drawing (${b.x0.toFixed(0)}–${b.x1.toFixed(0)} of ${W}, ${b.y0.toFixed(0)}–${b.y1.toFixed(0)} of ${H})`);
  }
  for (let i = 0; i < boxes.length; i += 1)
    for (let j = i + 1; j < boxes.length; j += 1) {
      const a = boxes[i];
      const b = boxes[j];
      if (a.x0 < b.x1 - 1 && b.x0 < a.x1 - 1 && a.y0 < b.y1 - 1 && b.y0 < a.y1 - 1) throw new Error(`${name}: labels "${a.s}" and "${b.s}" overlap`);
    }
}

function finish(W, H, title, shapes, texts, boxes, name) {
  assertPhone(boxes, W, H, name ?? title);
  return svgWrap(`0 0 ${W} ${Math.round(H)}`, title, shapes.join("") + svgGroup(texts.join(""), { size: FM, anchor: "middle" }));
}

/* ---- the normal curve ---------------------------------------------------------------------- */

function frame({ left, width, base, height, zMin = -3.5, zMax = 3.5 }) {
  const X = (z) => left + ((z - zMin) / (zMax - zMin)) * width;
  const Y = (z) => base - (density(z) / density(0)) * height;
  const curve = (from = zMin, to = zMax, steps = 80) => {
    const pts = [];
    for (let i = 0; i <= steps; i += 1) {
      const z = from + ((to - from) * i) / steps;
      pts.push(`${i === 0 ? "M" : "L"} ${px(r2(X(z)))} ${px(r2(Y(z)))}`);
    }
    return pts.join(" ");
  };
  const shade = (from, to) => `M ${px(r2(X(from)))} ${px(base)} ${curve(from, to, 36).replace(/^M/, "L")} L ${px(r2(X(to)))} ${px(base)} Z`;
  return { X, Y, curve, shade, zMin, zMax, base, left, width };
}

/**
 * One shaded tail: the curve, the mean and x under the axis with their z-values under those, the
 * region shaded, and the probability statement above the shading. No probability value is drawn,
 * so the plain copy can go on a question.
 */
export function nTail({ mean, x, z, unit = "", tail, statement, showZ = true, showX = true, title }) {
  const W = PW;
  const boxes = [];
  const top = statement ? 34 : 12;
  const f = frame({ left: 14, width: W - 28, base: top + 112, height: 100 });
  const zc = Math.max(f.zMin + 0.15, Math.min(f.zMax - 0.15, z));
  const shapes = [];
  const texts = [];
  shapes.push(svgPath(tail === "right" ? f.shade(zc, f.zMax) : f.shade(f.zMin, zc), { width: 0.6, fill: "currentColor", opacity: 0.22 }));
  shapes.push(svgPath(f.curve(), { width: 1.8 }));
  shapes.push(svgLine(6, f.base, W - 6, f.base, { width: 1.4 }));
  shapes.push(svgPath(`M ${px(f.X(0))} ${px(f.base)} L ${px(f.X(0))} ${px(r2(f.Y(0)))}`, { width: 1.2, dash: "5 4" }));
  shapes.push(svgPath(`M ${px(r2(f.X(zc)))} ${px(f.base + 6)} L ${px(r2(f.X(zc)))} ${px(r2(f.Y(zc)))}`, { width: 1.6 }));
  const u = unit ? ` ${unit}` : "";
  const meanText = `${minus(mean)}${u}`;
  const xText = `${minus(x)}${u}`;
  const zText = `z = ${zLabel(z)}`;
  // Side by side when the two columns would touch: the mean's column on its own side of the peak.
  const need = (Math.max(textWidth(meanText, FM), textWidth("z = 0", FS)) + Math.max(textWidth(xText, FM), textWidth(zText, FS))) / 2 + 8;
  const near = Math.abs(f.X(zc) - f.X(0)) < need;
  const meanAnchor = near ? (zc > 0 ? "end" : "start") : "middle";
  const xAnchor = near ? (zc > 0 ? "start" : "end") : "middle";
  const nudge = (a) => (a === "end" ? -5 : a === "start" ? 5 : 0);
  const clampX = (cx, s, size, a) => {
    const w = textWidth(s, size);
    if (a !== "middle") return cx;
    return Math.max(4 + w / 2, Math.min(W - 4 - w / 2, cx));
  };
  texts.push(label(boxes, clampX(f.X(0) + nudge(meanAnchor), meanText, FM, meanAnchor), f.base + 20, meanText, { anchor: meanAnchor }));
  if (showX) texts.push(label(boxes, clampX(r2(f.X(zc)) + nudge(xAnchor), xText, FM, xAnchor), f.base + 20, xText, { anchor: xAnchor, weight: "600" }));
  let H = f.base + 28;
  if (showZ) {
    texts.push(label(boxes, clampX(f.X(0) + nudge(meanAnchor), "z = 0", FS, meanAnchor), f.base + 38, "z = 0", { anchor: meanAnchor, size: FS }));
    texts.push(label(boxes, clampX(r2(f.X(zc)) + nudge(xAnchor), zText, FS, xAnchor), f.base + 38, zText, { anchor: xAnchor, size: FS }));
    H = f.base + 46;
  }
  if (statement) {
    const w = textWidth(statement, FM);
    const inShade = tail === "right" ? Math.max(zc + 0.7, 0.9) : Math.min(zc - 0.7, -0.9);
    const sx = Math.max(6 + w / 2, Math.min(W - 6 - w / 2, f.X(Math.max(f.zMin + 0.3, Math.min(f.zMax - 0.3, inShade)))));
    texts.push(label(boxes, sx, 22, statement, { weight: "600" }));
    const tz = tail === "right" ? Math.min(zc + 0.45, f.zMax - 0.25) : Math.max(zc - 0.45, f.zMin + 0.25);
    shapes.push(svgPath(`M ${px(r2(sx))} 28 L ${px(r2(f.X(tz)))} ${px(r2(f.base - 8))}`, { width: 1.1 }));
  }
  return finish(W, H, title, shapes, texts, boxes);
}

/** Two aligned scales: the quantity on top, z underneath, so a value and its z-score line up. */
export function nScales({ marks, unitLabel, highlight, title }) {
  const W = PW;
  const boxes = [];
  const left = 34;
  const width = W - 68;
  const X = (z) => left + ((z + 3) / 6) * width;
  const yTop = 52;
  const yBot = 118;
  const shapes = [];
  const texts = [];
  shapes.push(svgLine(left - 14, yTop, left + width + 14, yTop, { width: 1.4 }));
  shapes.push(svgLine(left - 14, yBot, left + width + 14, yBot, { width: 1.4 }));
  texts.push(label(boxes, 6, 18, unitLabel, { anchor: "start", size: FS }));
  texts.push(label(boxes, 6, yBot + 40, "z", { anchor: "start", size: FS, weight: "600" }));
  for (const z of [-3, -2, -1, 0, 1, 2, 3]) {
    shapes.push(svgLine(X(z), yTop - 5, X(z), yTop + 5, { width: 1.2 }));
    shapes.push(svgLine(X(z), yBot - 5, X(z), yBot + 5, { width: 1.2 }));
    shapes.push(svgPath(`M ${px(X(z))} ${yTop + 9} L ${px(X(z))} ${yBot - 9}`, { width: 0.8, dash: "2 3" }));
    texts.push(label(boxes, X(z), yTop - 12, minus(marks(z))));
    texts.push(label(boxes, X(z), yBot + 22, minus(z)));
  }
  if (highlight) {
    const hx = r2(X(highlight.z));
    shapes.push(svgPath(`M ${px(hx)} ${yTop - 2} L ${px(hx)} ${yBot + 2}`, { width: 2.4 }));
    texts.push(label(boxes, hx + 6, yTop + 24, highlight.top, { anchor: "start", weight: "600" }));
    texts.push(label(boxes, hx + 6, yBot - 12, highlight.bottom, { anchor: "start", weight: "600" }));
  }
  return finish(W, yBot + 48, title, shapes, texts, boxes);
}

/**
 * An extract with the shape of the Normal Probability Table: z to one decimal place down the side,
 * the second decimal place across the top, Phi(z) to four places. `ring` boxes one entry.
 */
export function nTable({ rows, cols, ring = null, title }) {
  const W = PW;
  const boxes = [];
  if (cols.length > 5) throw new Error("nTable: at most five columns fit a phone");
  const zW = 58;
  const colW = (W - 12 - zW) / cols.length;
  const top = 42;
  const rowH = 30;
  const shapes = [];
  const texts = [];
  texts.push(label(boxes, 6 + zW / 2, top - 12, "z", { weight: "600" }));
  cols.forEach((c, i) => texts.push(label(boxes, 6 + zW + colW * (i + 0.5), top - 12, c.toFixed(2).slice(1), { weight: "600" })));
  shapes.push(svgRect(6, top - 32, W - 12, 32, { width: 0.8, fill: "currentColor", opacity: 0.07 }));
  shapes.push(svgLine(6, top, W - 6, top, { width: 1.4 }));
  shapes.push(svgLine(6 + zW, top - 32, 6 + zW, top + rows.length * rowH, { width: 1.2 }));
  rows.forEach((zr, i) => {
    const y = top + i * rowH + 20;
    texts.push(label(boxes, 6 + zW / 2, y, zr.toFixed(1), { weight: "600" }));
    cols.forEach((c, j) => texts.push(label(boxes, 6 + zW + colW * (j + 0.5), y, phiFixed(r2(zr + c)))));
    if (i < rows.length - 1) shapes.push(svgLine(6, top + (i + 1) * rowH, W - 6, top + (i + 1) * rowH, { width: 0.5 }));
  });
  shapes.push(svgRect(6, top - 32, W - 12, rows.length * rowH + 32, { width: 1.2 }));
  if (ring) {
    const i = rows.findIndex((r) => Math.abs(r - ring.row) < 1e-9);
    const j = cols.findIndex((c) => Math.abs(c - ring.col) < 1e-9);
    if (i < 0 || j < 0) throw new Error("nTable: the ringed entry is not in the extract");
    shapes.push(svgRect(6 + zW + colW * j + 3, top + i * rowH + 3, colW - 6, rowH - 6, { width: 2.4 }));
  }
  return finish(W, top + rows.length * rowH + 8, title, shapes, texts, boxes);
}

/** Two curves side by side: shaded to the left of z (read Phi) and to the right (1 minus it). */
export function nSides({ z, title }) {
  const W = PW;
  const boxes = [];
  const panelW = 180;
  const shapes = [];
  const texts = [];
  [
    ["left", "shaded to the left", "P(Z < z) = Φ(z)"],
    ["right", "shaded to the right", "P(Z > z) = 1 − Φ(z)"],
  ].forEach(([tail, head, formula], i) => {
    const f = frame({ left: 10 + i * (panelW + 20), width: panelW, base: 112, height: 76 });
    shapes.push(svgPath(tail === "right" ? f.shade(z, f.zMax) : f.shade(f.zMin, z), { width: 0.6, fill: "currentColor", opacity: 0.24 }));
    shapes.push(svgPath(f.curve(), { width: 1.7 }));
    shapes.push(svgLine(f.X(f.zMin) - 2, f.base, f.X(f.zMax) + 2, f.base, { width: 1.3 }));
    shapes.push(svgPath(`M ${px(r2(f.X(z)))} ${px(f.base + 5)} L ${px(r2(f.X(z)))} ${px(r2(f.Y(z)))}`, { width: 1.4 }));
    texts.push(label(boxes, r2(f.X(z)), f.base + 19, "z", { size: FS }));
    texts.push(label(boxes, f.X(0), 18, head, { size: FS }));
    texts.push(label(boxes, f.X(0), f.base + 42, formula, { size: FS, weight: "600" }));
  });
  return finish(W, 164, title, shapes, texts, boxes);
}

/** The fold: the left tail below −z on the upper curve, the right tail above +z on the lower one. */
export function nFold({ z, title }) {
  const W = PW;
  const boxes = [];
  const shapes = [];
  const texts = [];
  const up = frame({ left: 12, width: W - 24, base: 112, height: 76 });
  const lo = frame({ left: 12, width: W - 24, base: 296, height: 76 });
  for (const [f, from, to, zz, stmt, sy] of [
    [up, up.zMin, -z, -z, `P(Z < ${zLabel(-z)})`, 22],
    [lo, z, lo.zMax, z, `P(Z > ${zLabel(z)})`, 204],
  ]) {
    shapes.push(svgPath(f.shade(from, to), { width: 0.6, fill: "currentColor", opacity: 0.26 }));
    shapes.push(svgPath(f.curve(), { width: 1.7 }));
    shapes.push(svgLine(6, f.base, W - 6, f.base, { width: 1.3 }));
    shapes.push(svgPath(`M ${px(f.X(0))} ${px(f.base)} L ${px(f.X(0))} ${px(r2(f.Y(0)))}`, { width: 1.1, dash: "5 4" }));
    shapes.push(svgPath(`M ${px(r2(f.X(zz)))} ${px(f.base + 5)} L ${px(r2(f.X(zz)))} ${px(r2(f.Y(zz)))}`, { width: 1.4 }));
    texts.push(label(boxes, r2(f.X(zz)) + (zz < 0 ? -5 : 5), f.base + 19, zLabel(zz), { anchor: zz < 0 ? "end" : "start", size: FS }));
    texts.push(label(boxes, f.X(0) + (zz < 0 ? 5 : -5), f.base + 19, "0", { anchor: zz < 0 ? "start" : "end", size: FS }));
    const sx = Math.max(8 + textWidth(stmt, FM) / 2, Math.min(W - 8 - textWidth(stmt, FM) / 2, f.X(zz < 0 ? zz - 1.2 : zz + 1.2)));
    texts.push(label(boxes, sx, sy, stmt, { weight: "600" }));
    const tz = zz < 0 ? zz - 0.5 : zz + 0.5;
    shapes.push(svgPath(`M ${px(r2(sx))} ${sy + 6} L ${px(r2(f.X(tz)))} ${px(r2(f.base - 7))}`, { width: 1 }));
  }
  shapes.push(svgRect(W / 2 - 96, 142, 192, 28, { width: 1, fill: "currentColor", opacity: 0.06 }));
  texts.push(label(boxes, W / 2, 161, "same area, by symmetry", { size: FS }));
  return finish(W, lo.base + 28, title, shapes, texts, boxes);
}

/** The tails beyond z = 1, 2 and 3, each labelled under its own z with the share it holds. */
export function nRough({ title }) {
  const W = PW;
  const boxes = [];
  const f = frame({ left: 14, width: W - 28, base: 128, height: 108 });
  const shapes = [];
  const texts = [];
  shapes.push(svgPath(f.shade(1, f.zMax), { width: 0.5, fill: "currentColor", opacity: 0.12 }));
  shapes.push(svgPath(f.shade(2, f.zMax), { width: 0.5, fill: "currentColor", opacity: 0.18 }));
  shapes.push(svgPath(f.shade(3, f.zMax), { width: 0.5, fill: "currentColor", opacity: 0.32 }));
  shapes.push(svgPath(f.curve(), { width: 1.8 }));
  shapes.push(svgLine(6, f.base, W - 6, f.base, { width: 1.4 }));
  const pctWords = (p) => (p >= 10 ? `${Math.round(p)}%` : p >= 1 ? `${p.toFixed(1)}%` : `${p.toFixed(2)}%`);
  texts.push(label(boxes, 8, f.base + 42, "area beyond:", { anchor: "start", size: FS }));
  for (const k of [0, 1, 2, 3]) {
    shapes.push(svgPath(`M ${px(f.X(k))} ${px(f.base + 5)} L ${px(f.X(k))} ${px(r2(f.Y(k)))}`, { width: k === 0 ? 1.1 : 1.3, dash: k === 0 ? "5 4" : undefined }));
    texts.push(label(boxes, f.X(k), f.base + 20, k === 0 ? "z = 0" : String(k), { size: FS }));
    if (k > 0) texts.push(label(boxes, f.X(k), f.base + 42, pctWords((1 - phi(k)) * 100), { size: FS, weight: "600" }));
  }
  return finish(W, f.base + 50, title, shapes, texts, boxes);
}

/* ---- the bell curve (normal-distribution-bell-curve) ----------------------------------------- */

/** A curve y = f(x) drawn in a panel [x0, x0 + w] x [base - h, base], scaled so its peak is h. */
function panelCurve(f, from, to, { x0, w, base, h, steps = 90, fMax }) {
  const top = fMax ?? Math.max(...Array.from({ length: steps + 1 }, (_, i) => f(from + ((to - from) * i) / steps)));
  const X = (t) => x0 + ((t - from) / (to - from)) * w;
  const Y = (t) => base - (f(t) / top) * h;
  const pts = [];
  for (let i = 0; i <= steps; i += 1) {
    const t = from + ((to - from) * i) / steps;
    pts.push(`${i === 0 ? "M" : "L"} ${px(r2(X(t)))} ${px(r2(Y(t)))}`);
  }
  return { d: pts.join(" "), X, Y };
}

/** The hero: the bell, a dashed line at the mean, and "mean = median = mode" under it. */
export function nBell({ title }) {
  const W = PW;
  const boxes = [];
  const f = frame({ left: 14, width: W - 28, base: 150, height: 124 });
  const shapes = [];
  const texts = [];
  shapes.push(svgPath(f.shade(f.zMin, f.zMax), { width: 0, fill: "currentColor", opacity: 0.1 }));
  shapes.push(svgPath(f.curve(), { width: 2 }));
  shapes.push(svgLine(6, f.base, W - 6, f.base, { width: 1.4 }));
  shapes.push(svgPath(`M ${px(f.X(0))} ${px(f.base + 6)} L ${px(f.X(0))} ${px(r2(f.Y(0)))}`, { width: 1.3, dash: "5 4" }));
  texts.push(label(boxes, f.X(0), f.base + 22, "mean = median = mode", { size: FS, weight: "600" }));
  // the two tails, named where they run along the axis
  texts.push(label(boxes, f.X(-2.75), f.base - 16, "tail", { size: FS }));
  texts.push(label(boxes, f.X(2.75), f.base - 16, "tail", { size: FS }));
  return finish(W, f.base + 32, title, shapes, texts, boxes);
}

/**
 * Histogram to curve: the same distribution as expected class frequencies (computed from Phi) with
 * wide classes above and narrow classes below, the smooth curve drawn over the narrow one.
 */
export function nHist({ wide, narrow, title }) {
  const W = PW;
  const boxes = [];
  const shapes = [];
  const texts = [];
  const zMin = -3;
  const zMax = 3;
  const panel = (y0, width, withCurve, name) => {
    const left = 16;
    const w = W - 32;
    const base = y0 + 92;
    const h = 76;
    const X = (z) => left + ((z - zMin) / (zMax - zMin)) * w;
    const bins = [];
    for (let a = zMin; a < zMax - 1e-9; a += width) bins.push({ a, b: a + width, p: phi(a + width) - phi(a) });
    const dens = bins.map((b) => b.p / width);
    const top = Math.max(...dens, density(0));
    bins.forEach((b, i) => shapes.push(svgRect(X(b.a), base - (dens[i] / top) * h, X(b.b) - X(b.a), (dens[i] / top) * h, { width: 0.9, fill: "currentColor", opacity: 0.16 })));
    if (withCurve) {
      const pts = [];
      for (let i = 0; i <= 80; i += 1) {
        const z = zMin + ((zMax - zMin) * i) / 80;
        pts.push(`${i === 0 ? "M" : "L"} ${px(r2(X(z)))} ${px(r2(base - (density(z) / top) * h))}`);
      }
      shapes.push(svgPath(pts.join(" "), { width: 2 }));
    }
    shapes.push(svgLine(8, base, W - 8, base, { width: 1.3 }));
    texts.push(label(boxes, 8, y0 + 12, name, { anchor: "start", size: FS, weight: "600" }));
    return base;
  };
  const b1 = panel(0, wide, false, "wide classes");
  const b2 = panel(b1 + 18, narrow, true, "narrow classes, with the curve");
  return finish(W, b2 + 8, title, shapes, texts, boxes);
}

/**
 * Two shapes side by side: the bell, where the peak and the mean coincide, and a right-skewed
 * curve (x e^-x), whose long tail pulls the mean (2) away from the peak (1).
 */
export function nShapes({ leftTitle, rightTitle, title }) {
  const W = PW;
  const boxes = [];
  const shapes = [];
  const texts = [];
  const pw = 184;
  const base = 128;
  const h = 84;
  // left: the bell
  const L = panelCurve(density, -3.2, 3.2, { x0: 8, w: pw, base, h });
  shapes.push(svgPath(L.d, { width: 1.8 }));
  shapes.push(svgLine(4, base, 8 + pw + 4, base, { width: 1.2 }));
  shapes.push(svgPath(`M ${px(L.X(0))} ${base + 4} L ${px(L.X(0))} ${px(r2(L.Y(0)))}`, { width: 1.2, dash: "4 3" }));
  texts.push(label(boxes, L.X(0), base + 20, "peak and mean", { size: FS }));
  texts.push(label(boxes, 8 + pw / 2, 18, leftTitle, { size: FS, weight: "600" }));
  // right: skewed, f(x) = x e^-x on [0, 7]
  const skew = (x) => x * Math.exp(-x);
  const x0 = W - 8 - pw;
  const R = panelCurve(skew, 0, 7, { x0, w: pw, base, h });
  shapes.push(svgPath(R.d, { width: 1.8 }));
  shapes.push(svgLine(x0 - 4, base, W - 4, base, { width: 1.2 }));
  shapes.push(svgPath(`M ${px(R.X(1))} ${base + 4} L ${px(R.X(1))} ${px(r2(R.Y(1)))}`, { width: 1.2, dash: "4 3" }));
  shapes.push(svgPath(`M ${px(R.X(2))} ${base + 4} L ${px(R.X(2))} ${px(r2(R.Y(2)))}`, { width: 1.2, dash: "4 3" }));
  texts.push(label(boxes, R.X(1) - 4, base + 20, "peak", { anchor: "end", size: FS }));
  texts.push(label(boxes, R.X(2) + 4, base + 20, "mean", { anchor: "start", size: FS }));
  texts.push(label(boxes, x0 + pw / 2, 18, rightTitle, { size: FS, weight: "600" }));
  return finish(W, base + 28, title, shapes, texts, boxes);
}

/**
 * The banded curve: lines at the mean and one and two standard deviations either side, each band
 * holding its computed share, the tails beyond two standard deviations labelled, and brackets for
 * "about 68%" and "about 95%" above.
 */
export function nBands({ title }) {
  const W = PW;
  const boxes = [];
  const f = frame({ left: 12, width: W - 24, base: 186, height: 118, zMin: -3.2, zMax: 3.2 });
  const shapes = [];
  const texts = [];
  const pct = (a, b) => `${(100 * (phi(b) - phi(a))).toFixed(1)}%`;
  const bands = [
    [-2, -1, 0.14],
    [-1, 0, 0.26],
    [0, 1, 0.26],
    [1, 2, 0.14],
  ];
  for (const [a, b, o] of bands) shapes.push(svgPath(f.shade(a, b), { width: 0, fill: "currentColor", opacity: o }));
  shapes.push(svgPath(f.shade(f.zMin, -2), { width: 0, fill: "currentColor", opacity: 0.05 }));
  shapes.push(svgPath(f.shade(2, f.zMax), { width: 0, fill: "currentColor", opacity: 0.05 }));
  shapes.push(svgPath(f.curve(), { width: 2 }));
  shapes.push(svgLine(6, f.base, W - 6, f.base, { width: 1.4 }));
  for (const k of [-2, -1, 0, 1, 2]) shapes.push(svgPath(`M ${px(f.X(k))} ${px(f.base + 5)} L ${px(f.X(k))} ${px(r2(f.Y(k)))}`, { width: k === 0 ? 1.3 : 1.1, dash: k === 0 ? "5 4" : undefined }));
  // shares inside the bands
  texts.push(label(boxes, f.X(-0.5), f.base - 30, pct(-1, 0), { size: FS, weight: "600" }));
  texts.push(label(boxes, f.X(0.5), f.base - 30, pct(0, 1), { size: FS, weight: "600" }));
  texts.push(label(boxes, f.X(-1.5), f.base - 12, pct(-2, -1), { size: FS }));
  texts.push(label(boxes, f.X(1.5), f.base - 12, pct(1, 2), { size: FS }));
  // the tails beyond two standard deviations, labelled above the thin tail with a leader
  for (const s of [-1, 1]) {
    const tx = f.X(s * 2.72);
    texts.push(label(boxes, tx, f.base - 34, pct(2, 9), { size: FS }));
    shapes.push(svgPath(`M ${px(r2(tx))} ${px(f.base - 30)} L ${px(r2(f.X(s * 2.35)))} ${px(f.base - 4)}`, { width: 0.9 }));
  }
  // axis labels
  const names = { "-2": "μ − 2σ", "-1": "μ − σ", 0: "μ", 1: "μ + σ", 2: "μ + 2σ" };
  for (const k of [-2, -1, 0, 1, 2]) texts.push(label(boxes, f.X(k), f.base + 21, names[k], { size: FS }));
  // brackets
  const bracket = (k, y, text) => {
    shapes.push(svgPath(`M ${px(f.X(-k))} ${y + 7} L ${px(f.X(-k))} ${y} L ${px(f.X(k))} ${y} L ${px(f.X(k))} ${y + 7}`, { width: 1.3 }));
    texts.push(label(boxes, f.X(0), y - 6, text, { weight: "600" }));
  };
  bracket(2, 26, "about 95%");
  bracket(1, 56, "about 68%");
  return finish(W, f.base + 30, title, shapes, texts, boxes);
}

/** A sketch for a context: the curve with the mean and one and two standard deviations either side as values. */
export function nSketch({ mean, sd, unit = "", title, dp = 0 }) {
  const W = PW;
  const boxes = [];
  const f = frame({ left: 12, width: W - 24, base: 124, height: 108, zMin: -3.2, zMax: 3.2 });
  const shapes = [];
  const texts = [];
  shapes.push(svgPath(f.curve(), { width: 2 }));
  shapes.push(svgLine(6, f.base, W - 6, f.base, { width: 1.4 }));
  for (const k of [-2, -1, 0, 1, 2]) {
    shapes.push(svgPath(`M ${px(f.X(k))} ${px(f.base + 5)} L ${px(f.X(k))} ${px(r2(f.Y(k)))}`, { width: k === 0 ? 1.3 : 1, dash: k === 0 ? "5 4" : "2 3" }));
    const v = (mean + k * sd).toFixed(dp);
    texts.push(label(boxes, f.X(k), f.base + 21, v, { size: FS, weight: k === 0 ? "600" : undefined }));
  }
  if (unit) texts.push(label(boxes, W - 8, f.base + 40, unit, { anchor: "end", size: FS }));
  return finish(W, f.base + (unit ? 46 : 30), title, shapes, texts, boxes);
}

/**
 * Four small sketches A to D in a 2 x 2 grid: right-skewed, symmetric bell, two peaks, flat. Letters
 * only, no names, so the question's copy says nothing about which is normal.
 */
export function nFour({ order, title }) {
  const W = PW;
  const boxes = [];
  const shapes = [];
  const texts = [];
  const curves = {
    skewed: [(x) => x * Math.exp(-x), 0, 7],
    bell: [density, -3.2, 3.2],
    twoPeaks: [(x) => density((x - 1.6) / 0.75) + density((x + 1.6) / 0.75), -3.6, 3.6],
    flat: [(x) => (Math.abs(x) <= 2 ? 1 : Math.abs(x) <= 2.2 ? (2.2 - Math.abs(x)) / 0.2 : 0), -3, 3],
  };
  const pw = 180;
  const ph = 96;
  order.forEach((name, i) => {
    const col = i % 2;
    const row = Math.floor(i / 2);
    const x0 = 12 + col * (pw + 16);
    const y0 = row * (ph + 20);
    const base = y0 + ph;
    const [fn, from, to] = curves[name];
    const c = panelCurve(fn, from, to, { x0: x0 + 22, w: pw - 26, base, h: ph - 24, steps: 120 });
    shapes.push(svgPath(c.d, { width: 1.8 }));
    shapes.push(svgLine(x0 + 18, base, x0 + pw, base, { width: 1.2 }));
    texts.push(label(boxes, x0 + 2, y0 + 22, String.fromCharCode(65 + i), { anchor: "start", size: FL, weight: "700" }));
  });
  return finish(W, 2 * (ph + 20) - 8, title, shapes, texts, boxes);
}

/* ---- binomial ------------------------------------------------------------------------------ */

/**
 * The outcome table: one row per number of successes, its term and its probability, with the total
 * row. `shade` = [from, to] shades those rows.
 */
export function bTable({ head, rows, total, shade = null, title }) {
  const W = PW;
  const boxes = [];
  const cx = [42, 178, 324];
  const top = 34;
  const rowH = 32;
  const shapes = [];
  const texts = [];
  head.forEach((h, i) => texts.push(label(boxes, cx[i], top - 12, h, { size: FS, weight: "600" })));
  shapes.push(svgLine(6, top, W - 6, top, { width: 1.4 }));
  rows.forEach(([k, term, value], i) => {
    const y0 = top + i * rowH;
    if (shade && i >= shade[0] && i <= shade[1]) shapes.push(svgRect(6, y0, W - 12, rowH, { width: 0, fill: "currentColor", opacity: 0.14 }));
    texts.push(label(boxes, cx[0], y0 + 21, String(k)));
    texts.push(label(boxes, cx[1], y0 + 21, term));
    texts.push(label(boxes, cx[2], y0 + 21, value));
    shapes.push(svgLine(6, y0 + rowH, W - 6, y0 + rowH, { width: i === rows.length - 1 ? 1.4 : 0.5 }));
  });
  if (shade) shapes.push(svgRect(6, top + shade[0] * rowH, W - 12, (shade[1] - shade[0] + 1) * rowH, { width: 2 }));
  const yT = top + rows.length * rowH + 24;
  texts.push(label(boxes, cx[1], yT, total[0], { size: FS }));
  texts.push(label(boxes, cx[2], yT, total[1], { weight: "600" }));
  return finish(W, yT + 10, title, shapes, texts, boxes);
}

/** One term taken apart: the coefficient, the power of p and the power of q, each labelled. */
export function bAnatomy({ pieces, title }) {
  // pieces: [{ text, x, notes: [line1, line2] }, …] with "×" pieces carrying no notes
  const W = PW;
  const boxes = [];
  const shapes = [];
  const texts = [];
  const yExpr = 44;
  for (const p of pieces) {
    texts.push(label(boxes, p.x, yExpr, p.text, { size: 24, weight: p.notes ? "600" : undefined }));
    if (p.notes) {
      shapes.push(svgPath(`M ${px(p.x)} ${yExpr + 10} L ${px(p.x)} ${yExpr + 34}`, { width: 1.3 }));
      p.notes.forEach((line, i) => texts.push(label(boxes, p.x, yExpr + 54 + i * 19, line, { size: i === 0 ? FM : FS, weight: i === 0 ? "600" : undefined })));
    }
  }
  return finish(W, yExpr + 54 + 19 + 12, title, shapes, texts, boxes);
}

/**
 * Which whole numbers each phrase includes, for n trials: a filled dot is included, an open dot is
 * not. One row per phrase.
 */
export function bDots({ n, rows, title }) {
  const W = PW;
  const boxes = [];
  const shapes = [];
  const texts = [];
  const x0 = 140;
  const step = (W - 18 - x0) / n;
  const top = 34;
  const rowH = 34;
  for (let k = 0; k <= n; k += 1) texts.push(label(boxes, x0 + k * step, top - 12, String(k), { size: FS, weight: "600" }));
  rows.forEach(([phrase, set], i) => {
    const y = top + 14 + i * rowH;
    texts.push(label(boxes, 8, y + 5, phrase, { anchor: "start" }));
    shapes.push(svgLine(x0, y, x0 + n * step, y, { width: 1 }));
    for (let k = 0; k <= n; k += 1) shapes.push(svgCircle(x0 + k * step, y, 8, set.includes(k) ? { fill: "currentColor" } : { fill: "none", width: 1.6 }));
  });
  return finish(W, top + 14 + (rows.length - 1) * rowH + 20, title, shapes, texts, boxes);
}

/* ---- Pascal's triangle --------------------------------------------------------------------- */

/**
 * The triangle drawn in circles, rows 0 to `upTo`, with "row n" down the left. `sums` draws the
 * two-above-make-one link for [row, index] of the lower number; `band` shades one whole row.
 */
export function pTriangle({ rows, upTo, sums = [], band = null, title }) {
  const W = PW;
  const boxes = [];
  const shapes = [];
  const texts = [];
  const step = Math.min(38, (W - 70) / upTo);
  const cxMid = 58 + (upTo * step) / 2 + 8;
  const rowH = 36;
  const r = 15;
  const at = (n, k) => ({ x: cxMid + (k - n / 2) * step, y: 24 + n * rowH });
  if (band !== null) {
    const a = at(band, 0);
    const b = at(band, band);
    shapes.push(svgRect(a.x - r - 6, a.y - r - 3, b.x - a.x + 2 * r + 12, 2 * r + 6, { width: 1.4, fill: "currentColor", opacity: 0.12 }));
  }
  for (let n = 0; n <= upTo; n += 1) {
    texts.push(label(boxes, 4, at(n, 0).y + 5, `row ${n}`, { anchor: "start", size: FS }));
    rows[n].forEach((v, k) => {
      const { x, y } = at(n, k);
      shapes.push(svgCircle(x, y, r, { fill: "none", width: 1.2 }));
      texts.push(label(boxes, x, y + 5, String(v), { size: FS }));
    });
  }
  for (const [n, k] of sums) {
    const a = at(n - 1, k - 1);
    const b = at(n - 1, k);
    const c = at(n, k);
    shapes.push(svgPath(`M ${px(a.x + 8)} ${px(a.y + 12)} L ${px(c.x - 5)} ${px(c.y - 13)} M ${px(b.x - 8)} ${px(b.y + 12)} L ${px(c.x + 5)} ${px(c.y - 13)}`, { width: 1.6 }));
  }
  return finish(W, 24 + upTo * rowH + 24, title, shapes, texts, boxes);
}

/**
 * The terms of (p + q)^n in a row, with their coefficient, power of p and power of q lined up
 * underneath, so the fall of one power and the rise of the other can be read across.
 */
export function pPowers({ rows, n, title }) {
  const W = PW;
  const boxes = [];
  const shapes = [];
  const texts = [];
  const x0 = 118;
  const colW = (W - 6 - x0) / (n + 1);
  const cx = (r) => x0 + colW * (r + 0.5);
  const sup = (k) => (k <= 1 ? "" : String(k).replace(/\d/g, (d) => "⁰¹²³⁴⁵⁶⁷⁸⁹"[d]));
  const termText = (r) => {
    const c = rows[n][r];
    const pp = n - r;
    const qq = r;
    return `${c === 1 ? "" : c}${pp ? `p${sup(pp)}` : ""}${qq ? `q${sup(qq)}` : ""}`;
  };
  const lines = [
    ["term", (r) => termText(r), FL, "600"],
    ["coefficient", (r) => String(rows[n][r]), FM],
    ["power of p", (r) => String(n - r), FM],
    ["power of q", (r) => String(r), FM],
  ];
  lines.forEach(([name, f, size, weight], i) => {
    const y = 28 + i * 34;
    texts.push(label(boxes, 12, y, name, { anchor: "start", size: FS, weight: i === 0 ? "600" : undefined }));
    for (let r = 0; r <= n; r += 1) texts.push(label(boxes, cx(r), y, f(r), { size, weight }));
    if (i === 0) shapes.push(svgLine(6, y + 12, W - 6, y + 12, { width: 1.3 }));
  });
  // the two power rows boxed, so the fall of one and the rise of the other read as a pair
  shapes.push(svgRect(6, 28 + 2 * 34 - 20, W - 12, 2 * 34 - 2, { width: 1, fill: "currentColor", opacity: 0.06 }));
  return finish(W, 28 + 3 * 34 + 20, title, shapes, texts, boxes);
}

/**
 * The plain triangle, rows 0 to `upTo` as numbers, and an empty grid for the rows to be filled, one
 * row of boxes per row asked for, columns numbered from 1 as the answer grid numbers them.
 */
export function pGrid({ rows, upTo, fill, title }) {
  const W = PW;
  const boxes = [];
  const shapes = [];
  const texts = [];
  const cols = Math.max(...fill.map((n) => n + 1));
  const x0 = 84;
  const boxW = Math.min(44, (W - 8 - x0) / cols);
  const step = Math.min(42, (W - 96) / upTo);
  const cxMid = x0 + (cols * boxW) / 2;
  for (let n = 0; n <= upTo; n += 1) {
    const y = 24 + n * 28;
    texts.push(label(boxes, 4, y, `row ${n}`, { anchor: "start", size: FS }));
    rows[n].forEach((v, k) => texts.push(label(boxes, cxMid + (k - n / 2) * step, y, String(v))));
  }
  const gTop = 24 + upTo * 28 + 26;
  texts.push(label(boxes, 4, gTop + 16, "column", { anchor: "start", size: FS }));
  for (let c = 0; c < cols; c += 1) {
    shapes.push(svgRect(x0 + c * boxW, gTop, boxW, 24, { width: 0.8, fill: "currentColor", opacity: 0.07 }));
    texts.push(label(boxes, x0 + (c + 0.5) * boxW, gTop + 17, String(c + 1), { size: FS }));
  }
  fill.forEach((n, i) => {
    const y = gTop + 24 + i * 40;
    texts.push(label(boxes, 4, y + 17, `Row ${i + 1}`, { anchor: "start", size: FS, weight: "600" }));
    texts.push(label(boxes, 4, y + 34, `(row ${n})`, { anchor: "start", size: FS }));
    for (let c = 0; c < n + 1; c += 1) shapes.push(svgRect(x0 + c * boxW, y, boxW, 40, { width: 1.3 }));
  });
  return finish(W, gTop + 24 + fill.length * 40 + 6, title, shapes, texts, boxes);
}
