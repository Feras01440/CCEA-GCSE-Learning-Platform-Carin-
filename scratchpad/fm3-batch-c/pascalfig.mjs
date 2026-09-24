/**
 * Figures for pascals-triangle-binomial-expansion, sized for a phone column (about 480 wide,
 * 13-15 px text). Every entry is ROWS[n][k] from stat.mjs, where each row is built by addition
 * and asserted symmetric with a total of 2^n.
 */
import { svgGroup, svgRect, svgLine, svgPath, svgCircle, svgWrap, px } from "./lib.mjs";
import { ROWS } from "./stat.mjs";

const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

/**
 * The triangle to `maxRow`, rows numbered from 0 down the left, each entry in a circle.
 * `additions` = [[n, k], …] draws the two short leaders from the entries above into entry (n, k)
 * with a plus sign; `highlight` tints one row; `blankFrom` leaves later rows' circles empty.
 */
export function triangleFig({ maxRow = 8, additions = [], highlight = null, blankFrom = null, notes = [], title, caption }) {
  const W = 480;
  const stepX = 44;
  const stepY = 38;
  const top = 26;
  const cx = (n, k) => W / 2 + 14 - (n * stepX) / 2 + k * stepX;
  const cy = (n) => top + n * stepY;
  const body = [];
  const texts = [];
  if (highlight !== null) body.push(svgRect(46, cy(highlight) - 17, W - 52, 34, { width: 1.2, fill: "currentColor", opacity: 0.1 }));
  for (let n = 0; n <= maxRow; n += 1) {
    texts.push(`<text x='12' y='${cy(n) + 5}' text-anchor='start' font-size='12'>row ${n}</text>`);
    for (let k = 0; k <= n; k += 1) {
      body.push(svgCircle(cx(n, k), cy(n), 15, { fill: "none", width: 1.1 }));
      if (blankFrom === null || n < blankFrom) texts.push(`<text x='${px(cx(n, k))}' y='${cy(n) + 5}'>${ROWS[n][k]}</text>`);
    }
  }
  for (const [n, k] of additions) {
    body.push(svgPath(`M ${px(cx(n - 1, k - 1) + 6)} ${px(cy(n - 1) + 14)} L ${px(cx(n, k) - 5)} ${px(cy(n) - 14)}`, { width: 1.3 }));
    body.push(svgPath(`M ${px(cx(n - 1, k) - 6)} ${px(cy(n - 1) + 14)} L ${px(cx(n, k) + 5)} ${px(cy(n) - 14)}`, { width: 1.3 }));
    texts.push(`<text x='${px(cx(n, k))}' y='${px(cy(n) - 19)}' font-size='13' font-weight='600'>+</text>`);
  }
  let H = cy(maxRow) + 26;
  for (const note of notes) {
    texts.push(`<text x='${W / 2}' y='${H + 6}'>${esc(note)}</text>`);
    H += 18;
  }
  if (caption) {
    texts.push(`<text x='${W / 2}' y='${H + 8}'>${esc(caption)}</text>`);
    H += 22;
  }
  return svgWrap(`0 0 ${W} ${Math.round(H)}`, title, body.join("") + svgGroup(texts.join(""), { size: 14, anchor: "middle" }));
}

/**
 * The triangle written out to `upTo`, then an answer grid for the rows in `targets`: a heading row of
 * column numbers and one row of empty boxes per target, labelled "Row 1", "Row 2" in the order the
 * table field names its inputs.
 */
export function gridFig({ upTo, targets, title, caption }) {
  const W = 480;
  const stepX = 40;
  const stepY = 26;
  const top = 22;
  const cx = (n, k) => W / 2 + 20 - (n * stepX) / 2 + k * stepX;
  const cy = (n) => top + n * stepY;
  const body = [];
  const texts = [];
  for (let n = 0; n <= upTo; n += 1) {
    texts.push(`<text x='12' y='${cy(n) + 5}' text-anchor='start' font-size='12'>row ${n}</text>`);
    for (let k = 0; k <= n; k += 1) texts.push(`<text x='${px(cx(n, k))}' y='${cy(n) + 5}'>${ROWS[n][k]}</text>`);
  }
  const cols = Math.max(...targets) + 1;
  const boxW = Math.min(44, (W - 120) / cols);
  const gLeft = 104;
  let y = cy(upTo) + 22;
  texts.push(`<text x='${gLeft - 8}' y='${y + 16}' text-anchor='end' font-size='12'>column</text>`);
  for (let c = 0; c < cols; c += 1) {
    body.push(svgRect(gLeft + c * boxW, y, boxW, 22, { width: 0.8, fill: "currentColor", opacity: 0.07 }));
    texts.push(`<text x='${px(gLeft + c * boxW + boxW / 2)}' y='${y + 16}' font-size='12'>${c + 1}</text>`);
  }
  y += 22;
  targets.forEach((n, i) => {
    texts.push(`<text x='${gLeft - 8}' y='${y + 21}' text-anchor='end' font-size='12'>${esc(`Row ${i + 1} (row ${n})`)}</text>`);
    for (let c = 0; c <= n; c += 1) body.push(svgRect(gLeft + c * boxW, y, boxW, 32, { width: 1.3 }));
    y += 32;
  });
  let H = y + 14;
  if (caption) {
    texts.push(`<text x='${W / 2}' y='${H + 6}'>${esc(caption)}</text>`);
    H += 20;
  }
  return svgWrap(`0 0 ${W} ${Math.round(H)}`, title, body.join("") + svgGroup(texts.join(""), { size: 14, anchor: "middle" }));
}

/**
 * The term strip for (p + q)^n: one row per term with its coefficient, the power of p, the power of
 * q and the running check that the two powers add to n. Arrows down the power columns say which way
 * each power moves.
 */
export function stripFig({ n, title, caption }) {
  const W = 480;
  const rowH = 28;
  const top = 50;
  const col = { term: 40, coef: 130, p: 220, q: 300, sum: 400 };
  const body = [];
  const texts = [];
  const heads = [["term", col.term], ["coefficient", col.coef], ["power of p", col.p], ["power of q", col.q], ["powers add to", col.sum]];
  for (const [h, x] of heads) texts.push(`<text x='${x}' y='${top - 22}' font-weight='600' font-size='12.5'>${esc(h)}</text>`);
  body.push(svgLine(14, top - 14, W - 14, top - 14, { width: 1.3 }));
  for (let r = 0; r <= n; r += 1) {
    const y = top + r * rowH + 4;
    texts.push(`<text x='${col.term}' y='${y}'>${r + 1}</text>`);
    texts.push(`<text x='${col.coef}' y='${y}'>${ROWS[n][r]}</text>`);
    texts.push(`<text x='${col.p}' y='${y}'>${n - r}</text>`);
    texts.push(`<text x='${col.q}' y='${y}'>${r}</text>`);
    texts.push(`<text x='${col.sum}' y='${y}'>${esc(`${n - r} + ${r} = ${n}`)}</text>`);
    body.push(svgLine(14, y + 10, W - 14, y + 10, { width: 0.5 }));
  }
  const bottom = top + n * rowH + 4;
  body.push(svgPath(`M ${col.p + 26} ${top - 6} L ${col.p + 26} ${bottom}`, { width: 1.2 }));
  body.push(svgPath(`M ${col.p + 21} ${bottom - 8} L ${col.p + 26} ${bottom} L ${col.p + 31} ${bottom - 8}`, { width: 1.2 }));
  body.push(svgPath(`M ${col.q + 26} ${top - 6} L ${col.q + 26} ${bottom}`, { width: 1.2 }));
  body.push(svgPath(`M ${col.q + 21} ${bottom - 8} L ${col.q + 26} ${bottom} L ${col.q + 31} ${bottom - 8}`, { width: 1.2 }));
  let H = bottom + 24;
  texts.push(`<text x='${col.p}' y='${H}' font-size='12'>falls</text>`);
  texts.push(`<text x='${col.q}' y='${H}' font-size='12'>rises</text>`);
  H += 8;
  if (caption) {
    texts.push(`<text x='${W / 2}' y='${H + 14}'>${esc(caption)}</text>`);
    H += 26;
  }
  return svgWrap(`0 0 ${W} ${Math.round(H)}`, title, body.join("") + svgGroup(texts.join(""), { size: 14, anchor: "middle" }));
}
