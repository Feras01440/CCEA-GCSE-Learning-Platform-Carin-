/**
 * Figures for binomial-probabilities. Every number drawn comes from a Binom model (exact rationals
 * over BigInt) and is printed with d4 / exactDec; nothing is typed. Widths are kept near 540 with
 * 13-14 px text so a figure scaled to a phone column stays readable.
 */
import { svgGroup, svgTextIn, svgRect, svgLine, svgPath, svgWrap, px } from "./lib.mjs";
import { d4, exactDec, terminatesWithin } from "./stat.mjs";

const SUP = { 0: "⁰", 1: "¹", 2: "²", 3: "³", 4: "⁴", 5: "⁵", 6: "⁶", 7: "⁷", 8: "⁸", 9: "⁹" };
export const sup = (k) => String(k).split("").map((d) => SUP[d]).join("");

/** "0.8³" or "0.8" (power 1) or "" (power 0), for a number printed in a figure. */
const powNum = (s, k) => (k === 0 ? "" : k === 1 ? s : `${s}${sup(k)}`);

/** A term written out with its numbers: "4 × 0.8³ × 0.2". */
export function termWords(b, r, { pStr = b.pStr, qStr = b.qStr } = {}) {
  const parts = [];
  const c = b.coef(r);
  if (c !== 1) parts.push(String(c));
  const pp = powNum(pStr.includes("/") ? `(${pStr})` : pStr, r);
  const qq = powNum(qStr.includes("/") ? `(${qStr})` : qStr, b.n - r);
  if (pp) parts.push(pp);
  if (qq) parts.push(qq);
  return parts.join(" × ");
}

/** A value for a figure: exact when it terminates within 4 places, else "0.1382…". */
const truncDec = (x, places) => {
  const scaled = (x.n * 10n ** BigInt(places)) / x.d;
  const t = scaled.toString().padStart(places + 1, "0");
  return `${t.slice(0, t.length - places)}.${t.slice(t.length - places)}`;
};
export const shown = (x) => (terminatesWithin(x, 6) ? exactDec(x) : `${truncDec(x, 6)}…`);
const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

/**
 * The expansion ladder: one row per number of successes r = 0 … n, with the term written out,
 * its value and what it means, and a total row that comes to 1. `shade` = [from, to] tints the
 * rows a question wants; `routes` adds the two ways of reaching the shaded total underneath.
 */
export function ladderSvg(b, { successWord, failureWord, successOne = successWord, failureOne = failureWord, shade = null, routes = false, title, caption }) {
  const W = 470;
  const top = 44;
  const rowH = 30;
  const cols = { r: 26, term: 128, value: 258, meaning: 382 };
  const body = [];
  const texts = [];
  texts.push(svgTextIn(cols.r, top - 18, `${successWord}`));
  texts.push(svgTextIn(cols.term, top - 18, "the term"));
  texts.push(svgTextIn(cols.value, top - 18, "probability"));
  texts.push(svgTextIn(cols.meaning, top - 18, "outcome"));
  body.push(svgLine(12, top - 10, W - 12, top - 10, { width: 1.3 }));
  if (shade) {
    const [a, z] = shade;
    body.push(svgRect(12, top - 8 + a * rowH, W - 24, (z - a + 1) * rowH, { width: 1.4, fill: "currentColor", opacity: 0.12 }));
  }
  for (let r = 0; r <= b.n; r += 1) {
    const y = top + r * rowH + 12;
    texts.push(svgTextIn(cols.r, y, String(r)));
    texts.push(svgTextIn(cols.term, y, termWords(b, r)));
    texts.push(svgTextIn(cols.value, y, shown(b.term(r))));
    texts.push(svgTextIn(cols.meaning, y, `${r} ${r === 1 ? successOne : successWord}, ${b.n - r} ${b.n - r === 1 ? failureOne : failureWord}`));
    body.push(svgLine(12, top - 8 + (r + 1) * rowH, W - 12, top - 8 + (r + 1) * rowH, { width: 0.5 }));
  }
  const totY = top + (b.n + 1) * rowH + 12;
  body.push(svgLine(12, totY - 20, W - 12, totY - 20, { width: 1.3 }));
  texts.push(svgTextIn(cols.term, totY, "total of the rows"));
  texts.push(svgTextIn(cols.value, totY, "1"));
  let H = totY + 14;
  if (shade && routes) {
    const [a, z] = shade;
    const inside = b.sum(a, z);
    const outsideRows = [];
    for (let r = 0; r <= b.n; r += 1) if (r < a || r > z) outsideRows.push(r);
    const insideRows = [];
    for (let r = a; r <= z; r += 1) insideRows.push(r);
    const plus = (rows) => rows.map((r) => `P(${r})`).join(" + ");
    const y0 = H + 12;
    const shorter = insideRows.length <= outsideRows.length ? "inside" : "outside";
    const lineA = `add the shaded rows: ${plus(insideRows)} = ${shown(inside)}`;
    const lineB = `or take the rest from 1: 1 − (${plus(outsideRows)}) = ${shown(inside)}`;
    body.push(svgRect(18, y0 - 2 + (shorter === "inside" ? 0 : 30), W - 36, 26, { width: 1.6 }));
    texts.push(svgTextIn(W / 2, y0 + 15, lineA));
    texts.push(svgTextIn(W / 2, y0 + 45, lineB));
    H = y0 + 60;
  }
  if (caption) {
    texts.push(svgTextIn(W / 2, H + 8, caption));
    H += 22;
  }
  return svgWrap(`0 0 ${W} ${Math.round(H)}`, title, body.join("") + svgGroup(texts.join(""), { size: 13 }));
}

/** The four conditions, each with its evidence in one example, and a tick drawn as a path. */
export function conditionsSvg({ rows, title, caption }) {
  const W = 470;
  const rowH = 42;
  const body = [];
  const texts = [];
  rows.forEach(([cond, evidence], i) => {
    const y = 16 + i * rowH;
    body.push(svgRect(14, y, W - 28, rowH - 8, { width: 1.1 }));
    body.push(svgPath(`M ${px(30)} ${px(y + 17)} L ${px(36)} ${px(y + 24)} L ${px(48)} ${px(y + 9)}`, { width: 2 }));
    texts.push(`<text x='62' y='${px(y + 15)}' font-weight='600'>${esc(cond)}</text>`);
    texts.push(`<text x='62' y='${px(y + 30)}'>${esc(evidence)}</text>`);
  });
  let H = 16 + rows.length * rowH;
  if (caption) {
    texts.push(`<text x='${W / 2}' y='${px(H + 12)}' text-anchor='middle'>${esc(caption)}</text>`);
    H += 26;
  }
  return svgWrap(`0 0 ${W} ${Math.round(H)}`, title, body.join("") + svgGroup(texts.join(""), { size: 13, anchor: "start" }));
}

/** The label card: four lines filled in (or left with a gap) before any arithmetic. */
export function labelCardSvg({ lines, title, caption }) {
  const W = 470;
  const rowH = 34;
  const body = [];
  const texts = [];
  body.push(svgRect(14, 14, W - 28, lines.length * rowH + 16, { width: 1.4 }));
  lines.forEach((l, i) => {
    const y = 42 + i * rowH;
    texts.push(`<text x='34' y='${y}' font-weight='600'>${esc(l.label)}</text>`);
    body.push(svgLine(186, y + 6, W - 30, y + 6, { width: 0.9 }));
    if (l.value) texts.push(`<text x='194' y='${y}'>${esc(l.value)}</text>`);
  });
  let H = lines.length * rowH + 40;
  if (caption) {
    texts.push(`<text x='${W / 2}' y='${H + 4}' text-anchor='middle'>${esc(caption)}</text>`);
    H += 20;
  }
  return svgWrap(`0 0 ${W} ${Math.round(H)}`, title, body.join("") + svgGroup(texts.join(""), { size: 14, anchor: "start" }));
}

/**
 * One term taken apart: the written term across the top and a label under each piece, joined by
 * short leader lines. `pieces` = [{ text, note }] in reading order.
 */
export function anatomySvg({ pieces, footer, title, caption }) {
  const W = 470;
  const body = [];
  const texts = [];
  const gap = 14;
  const charW = 11.2;
  const widths = pieces.map((p) => Math.max(34, p.text.length * charW));
  const total = widths.reduce((a, b) => a + b, 0) + gap * (pieces.length - 1);
  let x = (W - total) / 2;
  const centres = [];
  pieces.forEach((p, i) => {
    centres.push(x + widths[i] / 2);
    texts.push(`<text x='${px(x + widths[i] / 2)}' y='44' font-size='22' text-anchor='middle'>${esc(p.text)}</text>`);
    x += widths[i] + gap;
  });
  const labelled = pieces.map((p, i) => ({ ...p, cx: centres[i] })).filter((p) => p.note);
  const slotW = (W - 28) / labelled.length;
  labelled.forEach((p, i) => {
    const lx = 14 + slotW * (i + 0.5);
    body.push(svgPath(`M ${px(p.cx)} 54 L ${px(p.cx)} 64 L ${px(lx)} 84 L ${px(lx)} 92`, { width: 1.1 }));
    const lines = Array.isArray(p.note) ? p.note : [p.note];
    lines.forEach((ln, k) => texts.push(`<text x='${px(lx)}' y='${108 + k * 16}' text-anchor='middle'>${esc(ln)}</text>`));
  });
  let H = 164;
  if (footer) {
    body.push(svgRect(60, H - 8, W - 120, 30, { width: 1.3, fill: "currentColor", opacity: 0.08 }));
    texts.push(`<text x='${W / 2}' y='${H + 12}' text-anchor='middle'>${esc(footer)}</text>`);
    H += 36;
  }
  if (caption) {
    texts.push(`<text x='${W / 2}' y='${H + 10}' text-anchor='middle'>${esc(caption)}</text>`);
    H += 24;
  }
  return svgWrap(`0 0 ${W} ${Math.round(H)}`, title, body.join("") + svgGroup(texts.join(""), { size: 13, anchor: "middle" }));
}

/** Two lines side by side in effect: the bracketed complement and the unbracketed slip, both evaluated. */
export function bracketCardSvg({ right, wrong, rightNote, wrongNote, title, caption }) {
  const W = 470;
  const body = [];
  const texts = [];
  body.push(svgRect(14, 14, W - 28, 58, { width: 1.8 }));
  texts.push(`<text x='30' y='40' font-size='15'>${esc(right)}</text>`);
  texts.push(`<text x='30' y='60'>${esc(rightNote)}</text>`);
  body.push(svgRect(14, 86, W - 28, 58, { width: 1, dash: "5 4" }));
  texts.push(`<text x='30' y='112' font-size='15'>${esc(wrong)}</text>`);
  texts.push(`<text x='30' y='132'>${esc(wrongNote)}</text>`);
  body.push(svgLine(26, 107, 26 + Math.min(W - 60, wrong.length * 8.4), 107, { width: 1.4 }));
  let H = 158;
  if (caption) {
    texts.push(`<text x='${W / 2}' y='${H + 6}' text-anchor='middle'>${esc(caption)}</text>`);
    H += 20;
  }
  return svgWrap(`0 0 ${W} ${Math.round(H)}`, title, body.join("") + svgGroup(texts.join(""), { size: 13, anchor: "start" }));
}

/**
 * Pascal's triangle to row `upTo`, then a separate answer grid for row `upTo + 1`: a heading row of
 * column numbers and one empty row of boxes, so the table field's "Row 1, column c" names each box.
 * Every printed entry is ROWS[n][k] from stat.mjs (built by addition).
 */
export function pascalGridSvg({ rows, upTo, title, caption }) {
  const W = 540;
  const stepX = 46;
  const stepY = 30;
  const body = [];
  const texts = [];
  const cx = (n, k) => W / 2 - (n * stepX) / 2 + k * stepX;
  for (let n = 0; n <= upTo; n += 1) {
    texts.push(`<text x='26' y='${28 + n * stepY}' text-anchor='start' font-size='12'>row ${n}</text>`);
    for (let k = 0; k <= n; k += 1) texts.push(`<text x='${px(cx(n, k))}' y='${28 + n * stepY}'>${rows[n][k]}</text>`);
  }
  const target = upTo + 1;
  const gTop = 28 + (upTo + 1) * stepY + 6;
  const boxW = 58;
  const gLeft = (W - boxW * (target + 1)) / 2;
  texts.push(`<text x='${W / 2}' y='${gTop + 4}' font-size='12'>row ${target}: write one number in each box</text>`);
  for (let c = 0; c <= target; c += 1) {
    const x = gLeft + c * boxW;
    body.push(svgRect(x, gTop + 12, boxW, 24, { width: 0.8, fill: "currentColor", opacity: 0.07 }));
    texts.push(`<text x='${px(x + boxW / 2)}' y='${gTop + 29}' font-size='12'>column ${c + 1}</text>`);
    body.push(svgRect(x, gTop + 36, boxW, 34, { width: 1.3 }));
  }
  let H = gTop + 84;
  if (caption) {
    texts.push(`<text x='${W / 2}' y='${H + 4}'>${esc(caption)}</text>`);
    H += 20;
  }
  return svgWrap(`0 0 ${W} ${Math.round(H)}`, title, body.join("") + svgGroup(texts.join(""), { size: 15, anchor: "middle" }));
}

/** A ruled table: rows of cells, the first row a heading. */
export function tableSvg({ rows, widths, title, caption, rowH = 30 }) {
  const W = widths.reduce((a, b) => a + b, 0) + 28;
  const body = [];
  const texts = [];
  const xAt = (c) => 14 + widths.slice(0, c).reduce((a, b) => a + b, 0);
  rows.forEach((row, i) => {
    const y = 14 + i * rowH;
    if (i === 0) body.push(svgRect(14, y, W - 28, rowH, { width: 1.2, fill: "currentColor", opacity: 0.08 }));
    row.forEach((cell, c) => texts.push(`<text x='${px(xAt(c) + 10)}' y='${px(y + rowH / 2 + 5)}'${i === 0 ? " font-weight='600'" : ""}>${esc(cell)}</text>`));
    body.push(svgLine(14, y + rowH, W - 14, y + rowH, { width: i === 0 ? 1.2 : 0.6 }));
  });
  body.push(svgRect(14, 14, W - 28, rows.length * rowH, { width: 1.2 }));
  for (let c = 1; c < widths.length; c += 1) body.push(svgLine(xAt(c), 14, xAt(c), 14 + rows.length * rowH, { width: 0.6 }));
  let H = 14 + rows.length * rowH + 12;
  if (caption) {
    texts.push(`<text x='${W / 2}' y='${H + 6}' text-anchor='middle'>${esc(caption)}</text>`);
    H += 20;
  }
  return svgWrap(`0 0 ${W} ${Math.round(H)}`, title, body.join("") + svgGroup(texts.join(""), { size: 13, anchor: "start" }));
}
