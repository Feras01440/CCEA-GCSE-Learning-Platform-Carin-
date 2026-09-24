/**
 * Figures for the two normal-distribution topics. The curve is the standard normal density
 * computed point by point (stat.mjs density), every shaded area is the region under that curve,
 * every table entry is Phi from the error-function series, and nothing is typed. Widths sit near
 * 480 with 12-13 px text, so a figure scaled to a phone column stays legible.
 *
 * The Summer 2019 report's layout for a sketch is followed throughout: the mean, x and the z-values
 * go BELOW the axis, and only areas (and the probability statement) go above it.
 */
import { svgGroup, svgTextIn, svgRect, svgLine, svgPath, svgWrap, px } from "./lib.mjs";
import { density, phi, phiFixed } from "./stat.mjs";

const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const r2 = (n) => Math.round(n * 100) / 100;
/** A signed z for a label: "−1.30" with a true minus sign. */
export const zLabel = (z) => `${z < 0 ? "−" : ""}${Math.abs(z).toFixed(2)}`;
/** A number for a label with a true minus sign. */
export const minus = (s) => String(s).replace(/^-/, "−");

/** A curve frame: maps z to x-pixels and density to y-pixels inside a panel. */
function frame({ left, width, base, height, zMin = -3.5, zMax = 3.5 }) {
  const X = (z) => left + ((z - zMin) / (zMax - zMin)) * width;
  const Y = (z) => base - (density(z) / density(0)) * height;
  const curve = (from = zMin, to = zMax, steps = 90) => {
    const pts = [];
    for (let i = 0; i <= steps; i += 1) {
      const z = from + ((to - from) * i) / steps;
      pts.push(`${i === 0 ? "M" : "L"} ${px(r2(X(z)))} ${px(r2(Y(z)))}`);
    }
    return pts.join(" ");
  };
  const shade = (from, to) => `M ${px(r2(X(from)))} ${px(base)} ${curve(from, to, 40).replace(/^M/, "L")} L ${px(r2(X(to)))} ${px(base)} Z`;
  return { X, Y, curve, shade, zMin, zMax, base };
}

/**
 * The shaded-tail card: the curve, the mean and x marked under the axis with their z-values under
 * those, the required region shaded, the probability statement above the shading, and (optionally)
 * the two-cell decision strip. No probability VALUE is ever printed, so a question may carry it.
 */
export function tailFig({ mean, x, z, unit = "", tail, statement, showZ = true, decision = true, title, caption }) {
  const W = 480;
  const f = frame({ left: 20, width: W - 40, base: 150, height: 110 });
  const zc = Math.max(f.zMin + 0.1, Math.min(f.zMax - 0.1, z));
  const body = [];
  const texts = [];
  body.push(svgPath(tail === "right" ? f.shade(zc, f.zMax) : f.shade(f.zMin, zc), { width: 0.6, fill: "currentColor", opacity: 0.2 }));
  body.push(svgPath(f.curve(), { width: 1.8 }));
  body.push(svgLine(10, f.base, W - 10, f.base, { width: 1.3 }));
  body.push(svgPath(`M ${px(f.X(0))} ${px(f.base)} L ${px(f.X(0))} ${px(r2(f.Y(0)))}`, { width: 1.1, dash: "5 4" }));
  body.push(svgPath(`M ${px(r2(f.X(zc)))} ${px(f.base + 6)} L ${px(r2(f.X(zc)))} ${px(r2(f.Y(zc)))}`, { width: 1.4 }));
  const u = unit ? ` ${unit}` : "";
  // Below the axis: the values, then the z-values under them.
  const near = Math.abs(f.X(zc) - f.X(0)) < 70;
  const meanAnchor = near ? (zc > 0 ? "end" : "start") : "middle";
  const xAnchor = near ? (zc > 0 ? "start" : "end") : "middle";
  const nudge = (anchor) => (anchor === "end" ? -4 : anchor === "start" ? 4 : 0);
  texts.push(`<text x='${px(f.X(0) + nudge(meanAnchor))}' y='${f.base + 18}' text-anchor='${meanAnchor}'>${esc(`${minus(mean)}${u}`)}</text>`);
  texts.push(`<text x='${px(r2(f.X(zc)) + nudge(xAnchor))}' y='${f.base + 18}' text-anchor='${xAnchor}' font-weight='600'>${esc(`${minus(x)}${u}`)}</text>`);
  if (showZ) {
    texts.push(`<text x='${px(f.X(0) + nudge(meanAnchor))}' y='${f.base + 34}' text-anchor='${meanAnchor}'>z = 0</text>`);
    texts.push(`<text x='${px(r2(f.X(zc)) + nudge(xAnchor))}' y='${f.base + 34}' text-anchor='${xAnchor}'>${esc(`z = ${zLabel(z)}`)}</text>`);
  }
  // Above the axis: the statement, placed over the shaded region.
  if (statement) {
    const inShade = tail === "right" ? Math.min(f.zMax - 0.9, Math.max(zc + 0.9, 0.9)) : Math.max(f.zMin + 0.9, Math.min(zc - 0.9, -0.9));
    const sx = f.X(inShade);
    const sy = 26;
    texts.push(`<text x='${px(r2(sx))}' y='${sy}' font-weight='600'>${esc(statement)}</text>`);
    const tx = f.X(tail === "right" ? Math.min(zc + 0.35, f.zMax - 0.2) : Math.max(zc - 0.35, f.zMin + 0.2));
    body.push(svgPath(`M ${px(r2(sx))} ${sy + 5} L ${px(r2(tx))} ${px(r2(f.base - 12))}`, { width: 1 }));
  }
  let H = f.base + (showZ ? 44 : 28);
  if (decision) {
    const boxW = (W - 36) / 2;
    [
      ["shaded to the left", "read Φ(z) from the table", tail === "left"],
      ["shaded to the right", "work out 1 − Φ(z)", tail === "right"],
    ].forEach(([a, b, active], i) => {
      const bx = 12 + i * (boxW + 12);
      body.push(svgRect(bx, H, boxW, 40, { width: active ? 2.2 : 0.9, fill: "currentColor", opacity: active ? 0.1 : 0, dash: active ? undefined : "4 3" }));
      texts.push(`<text x='${px(bx + boxW / 2)}' y='${H + 16}'>${esc(a)}</text>`);
      texts.push(`<text x='${px(bx + boxW / 2)}' y='${H + 32}'>${esc(b)}</text>`);
    });
    H += 50;
  }
  if (caption) {
    texts.push(`<text x='${W / 2}' y='${H + 8}'>${esc(caption)}</text>`);
    H += 22;
  }
  return svgWrap(`0 0 ${W} ${Math.round(H)}`, title, body.join("") + svgGroup(texts.join(""), { size: 12.5, anchor: "middle" }));
}

/** Two aligned scales: the quantity on top and z underneath, so a value and its z-score line up. */
export function scalesFig({ mean, sd, unit, marks, highlight, title, caption }) {
  const W = 480;
  const left = 40;
  const width = W - 80;
  const zs = [-3, -2, -1, 0, 1, 2, 3];
  const X = (z) => left + ((z + 3) / 6) * width;
  const body = [];
  const texts = [];
  const yTop = 44;
  const yBot = 104;
  body.push(svgLine(left - 12, yTop, left + width + 12, yTop, { width: 1.3 }));
  body.push(svgLine(left - 12, yBot, left + width + 12, yBot, { width: 1.3 }));
  texts.push(`<text x='${left - 14}' y='${yTop - 26}' text-anchor='start' font-size='11.5'>${esc(unit)}</text>`);
  texts.push(`<text x='${left - 14}' y='${yBot + 36}' text-anchor='start' font-size='11.5'>z</text>`);
  for (const z of zs) {
    body.push(svgLine(X(z), yTop - 5, X(z), yTop + 5, { width: 1.1 }));
    body.push(svgLine(X(z), yBot - 5, X(z), yBot + 5, { width: 1.1 }));
    body.push(svgPath(`M ${px(X(z))} ${yTop + 8} L ${px(X(z))} ${yBot - 8}`, { width: 0.6, dash: "2 3" }));
    texts.push(`<text x='${px(X(z))}' y='${yTop - 10}'>${esc(minus(marks(z)))}</text>`);
    texts.push(`<text x='${px(X(z))}' y='${yBot + 20}'>${esc(minus(z))}</text>`);
  }
  if (highlight) {
    const hx = X(highlight.z);
    body.push(svgPath(`M ${px(r2(hx))} ${yTop - 2} L ${px(r2(hx))} ${yBot + 2}`, { width: 2 }));
    texts.push(`<text x='${px(r2(hx) + 6)}' y='${yTop + 22}' text-anchor='start' font-weight='600'>${esc(highlight.top)}</text>`);
    texts.push(`<text x='${px(r2(hx) + 6)}' y='${yBot - 10}' text-anchor='start' font-weight='600'>${esc(highlight.bottom)}</text>`);
  }
  let H = yBot + 40;
  if (caption) {
    texts.push(`<text x='${W / 2}' y='${H + 6}'>${esc(caption)}</text>`);
    H += 20;
  }
  void mean;
  void sd;
  return svgWrap(`0 0 ${W} ${Math.round(H)}`, title, body.join("") + svgGroup(texts.join(""), { size: 12.5, anchor: "middle" }));
}

/**
 * An extract with the shape of the Normal Probability Table: z to one decimal place down the side,
 * the second decimal place across the top, each entry Phi(z) to four places. `cols` picks which
 * second decimals to show (the printed table runs from .00 to .09); `ring` circles one entry.
 */
export function tableFig({ rows, cols, ring = null, title, caption }) {
  const colW = 64;
  const W = 60 + cols.length * colW + 16;
  const top = 40;
  const rowH = 26;
  const body = [];
  const texts = [];
  texts.push(`<text x='34' y='${top - 12}' font-weight='600'>z</text>`);
  cols.forEach((c, i) => texts.push(`<text x='${60 + colW * (i + 0.5)}' y='${top - 12}' font-weight='600'>${c.toFixed(2).slice(1)}</text>`));
  body.push(svgRect(8, top - 30, W - 16, 26, { width: 0.8, fill: "currentColor", opacity: 0.07 }));
  body.push(svgLine(8, top - 4, W - 8, top - 4, { width: 1.3 }));
  body.push(svgLine(60, top - 30, 60, top + rows.length * rowH, { width: 1.1 }));
  rows.forEach((zr, i) => {
    const y = top + i * rowH + 17;
    texts.push(`<text x='34' y='${y}' font-weight='600'>${zr.toFixed(1)}</text>`);
    cols.forEach((c, j) => texts.push(`<text x='${60 + colW * (j + 0.5)}' y='${y}'>${phiFixed(r2(zr + c))}</text>`));
    body.push(svgLine(8, y + 9, W - 8, y + 9, { width: 0.4 }));
  });
  body.push(svgRect(8, top - 30, W - 16, rows.length * rowH + 30, { width: 1.1 }));
  if (ring) {
    const i = rows.findIndex((r) => Math.abs(r - ring.row) < 1e-9);
    const j = cols.findIndex((c) => Math.abs(c - ring.col) < 1e-9);
    if (i < 0 || j < 0) throw new Error("tableFig: the ringed entry is not in the extract");
    body.push(svgRect(60 + colW * j + 4, top + i * rowH + 1, colW - 8, rowH - 2, { width: 2 }));
  }
  let H = top + rows.length * rowH + 12;
  if (caption) {
    texts.push(`<text x='${W / 2}' y='${H + 8}'>${esc(caption)}</text>`);
    H += 22;
  }
  return svgWrap(`0 0 ${W} ${Math.round(H)}`, title, body.join("") + svgGroup(texts.join(""), { size: 12.5, anchor: "middle" }));
}

/** Two small curves side by side: the left tail read straight from the table, the right tail as 1 minus it. */
export function decisionFig({ z, title, caption }) {
  const W = 480;
  const panelW = 220;
  const body = [];
  const texts = [];
  [
    ["left", "P(Z < z) = Φ(z)"],
    ["right", "P(Z > z) = 1 − Φ(z)"],
  ].forEach(([tail, label], i) => {
    const f = frame({ left: 14 + i * (panelW + 24), width: panelW, base: 104, height: 72 });
    body.push(svgPath(tail === "right" ? f.shade(z, f.zMax) : f.shade(f.zMin, z), { width: 0.6, fill: "currentColor", opacity: 0.22 }));
    body.push(svgPath(f.curve(), { width: 1.6 }));
    body.push(svgLine(f.X(f.zMin) - 4, f.base, f.X(f.zMax) + 4, f.base, { width: 1.2 }));
    body.push(svgPath(`M ${px(r2(f.X(z)))} ${px(f.base + 5)} L ${px(r2(f.X(z)))} ${px(r2(f.Y(z)))}`, { width: 1.2 }));
    texts.push(`<text x='${px(r2(f.X(z)))}' y='${f.base + 17}'>z</text>`);
    texts.push(`<text x='${px(f.X(0))}' y='${f.base + 36}' font-weight='600'>${esc(label)}</text>`);
    texts.push(`<text x='${px(f.X(0))}' y='16'>${tail === "left" ? "shaded to the left" : "shaded to the right"}</text>`);
  });
  let H = 150;
  if (caption) {
    texts.push(`<text x='${W / 2}' y='${H + 6}'>${esc(caption)}</text>`);
    H += 20;
  }
  return svgWrap(`0 0 ${W} ${Math.round(H)}`, title, body.join("") + svgGroup(texts.join(""), { size: 12.5, anchor: "middle" }));
}

/** The fold: a left tail below −z above, the matching right tail above +z below, same area. */
export function foldFig({ z, title, caption }) {
  const W = 480;
  const body = [];
  const texts = [];
  const top = frame({ left: 20, width: W - 40, base: 100, height: 70 });
  const bot = frame({ left: 20, width: W - 40, base: 240, height: 70 });
  for (const [f, from, to, zz] of [
    [top, top.zMin, -z, -z],
    [bot, z, bot.zMax, z],
  ]) {
    body.push(svgPath(f.shade(from, to), { width: 0.6, fill: "currentColor", opacity: 0.24 }));
    body.push(svgPath(f.curve(), { width: 1.6 }));
    body.push(svgLine(12, f.base, W - 12, f.base, { width: 1.2 }));
    body.push(svgPath(`M ${px(f.X(0))} ${px(f.base)} L ${px(f.X(0))} ${px(r2(f.Y(0)))}`, { width: 1, dash: "5 4" }));
    body.push(svgPath(`M ${px(r2(f.X(zz)))} ${px(f.base + 5)} L ${px(r2(f.X(zz)))} ${px(r2(f.Y(zz)))}`, { width: 1.2 }));
    // The z label sits on the far side of its line from the mean, so the two never collide.
    texts.push(`<text x='${px(r2(f.X(zz)) + (zz < 0 ? -4 : 4))}' y='${f.base + 17}' text-anchor='${zz < 0 ? "end" : "start"}'>${esc(zLabel(zz))}</text>`);
    texts.push(`<text x='${px(f.X(0) + (zz < 0 ? 4 : -4))}' y='${f.base + 17}' text-anchor='${zz < 0 ? "start" : "end"}'>0</text>`);
  }
  texts.push(`<text x='${px(top.X(-z - 1.1))}' y='24' font-weight='600'>${esc(`P(Z < ${zLabel(-z)})`)}</text>`);
  texts.push(`<text x='${px(bot.X(z + 1.1))}' y='164' font-weight='600'>${esc(`P(Z > ${zLabel(z)})`)}</text>`);
  body.push(svgRect(W / 2 - 110, 124, 220, 24, { width: 1, fill: "currentColor", opacity: 0.06 }));
  texts.push(`<text x='${W / 2}' y='141'>same area, by symmetry</text>`);
  let H = bot.base + 26;
  if (caption) {
    texts.push(`<text x='${W / 2}' y='${H + 6}'>${esc(caption)}</text>`);
    H += 20;
  }
  return svgWrap(`0 0 ${W} ${Math.round(H)}`, title, body.join("") + svgGroup(texts.join(""), { size: 12.5, anchor: "middle" }));
}

/**
 * The rough-check ruler: the curve with its right-hand tails beyond z = 1, 2 and 3 marked with the
 * percentage each holds (computed from Phi, to the stated rounding).
 */
export function roughFig({ title, caption }) {
  const W = 480;
  const f = frame({ left: 20, width: W - 40, base: 150, height: 104 });
  const body = [];
  const texts = [];
  const tails = [1, 2, 3].map((k) => ({ k, pct: (1 - phi(k)) * 100 }));
  body.push(svgPath(f.shade(1, f.zMax), { width: 0.5, fill: "currentColor", opacity: 0.12 }));
  body.push(svgPath(f.shade(2, f.zMax), { width: 0.5, fill: "currentColor", opacity: 0.16 }));
  body.push(svgPath(f.shade(3, f.zMax), { width: 0.5, fill: "currentColor", opacity: 0.3 }));
  body.push(svgPath(f.curve(), { width: 1.8 }));
  body.push(svgLine(10, f.base, W - 10, f.base, { width: 1.3 }));
  for (const k of [0, 1, 2, 3]) {
    body.push(svgPath(`M ${px(f.X(k))} ${px(f.base + 5)} L ${px(f.X(k))} ${px(r2(f.Y(k)))}`, { width: k === 0 ? 1 : 1.1, dash: k === 0 ? "5 4" : undefined }));
    texts.push(`<text x='${px(f.X(k))}' y='${f.base + 18}'>${k === 0 ? "z = 0" : `z = ${k}`}</text>`);
  }
  const words = (p) => (p >= 10 ? `about ${Math.round(p)}%` : p >= 1 ? `about ${p.toFixed(1)}%` : `about ${p.toFixed(2)}%`);
  // A key in the empty top-left corner: a swatch as dark as each band's shading, then its share.
  // (The shadings stack, so the tail beyond 3 carries all three.)
  const swatch = [0.12, 0.28, 0.58];
  tails.forEach(({ k, pct }, i) => {
    const ly = 22 + i * 22;
    body.push(svgRect(14, ly - 10, 16, 12, { width: 0.8, fill: "currentColor", opacity: swatch[i] }));
    texts.push(`<text x='36' y='${ly}' text-anchor='start'>${esc(`beyond z = ${k}: ${words(pct)}`)}</text>`);
  });
  let H = f.base + 28;
  if (caption) {
    texts.push(`<text x='${W / 2}' y='${H + 6}'>${esc(caption)}</text>`);
    H += 20;
  }
  return svgWrap(`0 0 ${W} ${Math.round(H)}`, title, body.join("") + svgGroup(texts.join(""), { size: 12.5, anchor: "middle" }));
}
