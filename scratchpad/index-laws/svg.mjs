/**
 * Figures for maths.m7.index-laws-zero-and-negative-powers.
 *
 * Rules (pipeline/prompts/author-topic.md "SVG rule"): no <style>, no <script>, no event
 * handlers, no external hrefs, no prefers-color-scheme. Everything drawn with
 * stroke/fill="currentColor" and fill-opacity for tints; text uses font-family="inherit".
 * Unicode superscripts (⁰¹²³⁴⁵⁷⁹⁻) keep the markup small and render everywhere.
 */

const SUP = { "-": "⁻", 0: "⁰", 1: "¹", 2: "²", 3: "³", 4: "⁴", 5: "⁵", 6: "⁶", 7: "⁷", 8: "⁸", 9: "⁹" };

/** "-2" -> "⁻²", "12" -> "¹²" */
export function sup(n) {
  return String(n)
    .split("")
    .map((c) => SUP[c] ?? c)
    .join("");
}

const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

function text(x, y, s, { anchor = "start", size = 14, weight = null, opacity = null } = {}) {
  const a = anchor === "start" ? "" : ` text-anchor="${anchor}"`;
  const w = weight ? ` font-weight="${weight}"` : "";
  const o = opacity ? ` opacity="${opacity}"` : "";
  return `<text x="${x}" y="${y}" font-family="inherit" font-size="${size}"${a}${w}${o} fill="currentColor">${esc(s)}</text>`;
}

// ---------------------------------------------------------------------------
// Figure 1 (note): the ladder — dividing by a at every step, carried past a⁰
// ---------------------------------------------------------------------------

export function ladderSvg() {
  const base = 3;
  const rows = [
    { k: 3, power: `a${sup(3)}`, value: "27" },
    { k: 2, power: `a${sup(2)}`, value: "9" },
    { k: 1, power: `a${sup(1)}`, value: "3" },
    { k: 0, power: `a${sup(0)}`, value: "1" },
    { k: -1, power: `a${sup(-1)}`, value: "1/3" },
    { k: -2, power: `a${sup(-2)}`, value: "1/9" },
    { k: -3, power: `a${sup(-3)}`, value: "1/27" },
  ];
  const top = 74;
  const step = 42;
  const y = (i) => top + i * step;

  const W = 478;
  const xPower = 74;
  const xEq = 128;
  const xValue = 178;
  const xArrow = 240;
  const xBracket = 286;
  const xNote = 298;
  const parts = [];
  parts.push(
    `<svg viewBox="0 0 ${W} ${y(6) + 96}" xmlns="http://www.w3.org/2000/svg" role="img" aria-labelledby="ilzn-ladder-t">`,
    `<title id="ilzn-ladder-t">A ladder of powers of a, with the matching values for a = 3, showing that every step down divides by 3</title>`,
    `<defs><marker id="ilznArrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0 0 L10 5 L0 10 z" fill="currentColor"/></marker></defs>`,
  );

  // Headings and the rule under them.
  parts.push(text(xPower, 36, "power", { anchor: "middle", size: 14, weight: "600" }));
  parts.push(text(xValue, 36, "value when a = 3", { anchor: "middle", size: 14, weight: "600" }));
  parts.push(`<path d="M24 48 L256 48" stroke="currentColor" stroke-width="1.2" opacity="0.55" fill="none"/>`);

  rows.forEach((r, i) => {
    const yy = y(i);
    const zero = r.k === 0;
    if (zero) {
      parts.push(
        `<rect x="24" y="${yy - 23}" width="232" height="32" rx="6" fill="currentColor" fill-opacity="0.09" stroke="currentColor" stroke-width="1.2"/>`,
      );
    }
    parts.push(text(xPower, yy, r.power, { anchor: "middle", size: 18, weight: zero ? "700" : null }));
    parts.push(text(xEq, yy, "=", { anchor: "middle", size: 15, opacity: "0.7" }));
    parts.push(text(xValue, yy, r.value, { anchor: "middle", size: 18, weight: zero ? "700" : null }));
    if (i < rows.length - 1) {
      parts.push(
        `<path d="M${xArrow} ${yy - 10} L${xArrow} ${yy + step - 26}" stroke="currentColor" stroke-width="1.4" fill="none" marker-end="url(#ilznArrow)"/>`,
      );
      parts.push(text(xArrow + 8, yy + 14, `÷ ${base}`, { size: 12.5 }));
    }
  });

  // Right-hand commentary, tied to the three regions of the ladder.
  parts.push(`<path d="M${xBracket} ${y(0) - 22} L${xBracket} ${y(2) + 8}" stroke="currentColor" stroke-width="2" fill="none" opacity="0.55"/>`);
  parts.push(text(xNote, y(1) - 6, "whole-number powers —", { size: 12.5 }));
  parts.push(text(xNote, y(1) + 11, "nothing new here", { size: 12.5, opacity: "0.8" }));

  parts.push(`<path d="M${xBracket} ${y(3) - 20} L${xBracket} ${y(3) + 8}" stroke="currentColor" stroke-width="2" fill="none"/>`);
  parts.push(text(xNote, y(3) - 3, "keep dividing and a⁰", { size: 12.5 }));
  parts.push(text(xNote, y(3) + 14, "must land on 1", { size: 12.5, weight: "600" }));

  parts.push(`<path d="M${xBracket} ${y(4) - 22} L${xBracket} ${y(6) + 8}" stroke="currentColor" stroke-width="2" fill="none" opacity="0.55"/>`);
  parts.push(text(xNote, y(5) - 6, "one more step each time:", { size: 12.5 }));
  parts.push(text(xNote, y(5) + 11, "1/a, 1/a², 1/a³", { size: 12.5 }));

  parts.push(
    `<path d="M24 ${y(6) + 26} L${W - 24} ${y(6) + 26}" stroke="currentColor" stroke-width="1.2" opacity="0.55" fill="none"/>`,
  );
  parts.push(text(24, y(6) + 48, "The ladder never breaks, so a⁰ = 1 and a⁻ⁿ = 1 ÷ aⁿ.", { size: 13.5, weight: "600" }));
  parts.push(text(24, y(6) + 68, "Every value on the right is positive, so a negative", { size: 12.5, opacity: "0.85" }));
  parts.push(text(24, y(6) + 85, "index never makes a negative answer.", { size: 12.5, opacity: "0.85" }));
  parts.push(`</svg>`);
  return parts.join("");
}

// ---------------------------------------------------------------------------
// Figure 2 (note): coefficients and powers are handled separately
// ---------------------------------------------------------------------------

export function coefficientsSvg() {
  const W = 470;
  const cols = [24, 150, 268, 396];
  const dividers = [140, 258, 386];
  const headers = ["expression", "the number", "the letter", "answer"];
  const rows = [
    [`3x${sup(2)} × 4x${sup(5)}`, "3 × 4 = 12", `x${sup(2)}⁺${sup(5)} = x${sup(7)}`, `12x${sup(7)}`],
    [`12y${sup(7)} ÷ 3y${sup(4)}`, "12 ÷ 3 = 4", `y${sup(7)}⁻${sup(4)} = y${sup(3)}`, `4y${sup(3)}`],
    [`(2a${sup(3)})${sup(3)}`, `2${sup(3)} = 8`, `a${sup(3)}ˣ${sup(3)} = a${sup(9)}`, `8a${sup(9)}`],
  ];
  const headY = 52;
  const top = 88;
  const step = 46;
  const lastY = top + step * (rows.length - 1);
  const footRule = lastY + 18;
  const parts = [];
  parts.push(
    `<svg viewBox="0 0 ${W} ${footRule + 92}" xmlns="http://www.w3.org/2000/svg" role="img" aria-labelledby="ilzn-coeff-t">`,
    `<title id="ilzn-coeff-t">A four-column layout showing three index simplifications, with the number in front and the letter dealt with in separate columns</title>`,
  );
  parts.push(text(24, 22, "Two jobs, never mixed:", { size: 14, weight: "600" }));
  parts.push(text(24, 40, "do the number, then do the index.", { size: 14, weight: "600" }));
  headers.forEach((h, i) => parts.push(text(cols[i], headY, h, { size: 11, opacity: "0.75" })));
  parts.push(`<path d="M18 ${headY + 10} L${W - 18} ${headY + 10}" stroke="currentColor" stroke-width="1.2" opacity="0.55" fill="none"/>`);
  for (const x of dividers) {
    parts.push(`<path d="M${x} ${headY - 12} L${x} ${lastY + 16}" stroke="currentColor" stroke-width="1" opacity="0.3" fill="none"/>`);
  }
  rows.forEach((r, i) => {
    const y = top + i * step;
    r.forEach((cell, c) => parts.push(text(cols[c], y, cell, { size: 16, weight: c === 3 ? "700" : null })));
    if (i < rows.length - 1) {
      parts.push(`<path d="M18 ${y + 15} L${W - 18} ${y + 15}" stroke="currentColor" stroke-width="1" opacity="0.28" fill="none"/>`);
    }
  });
  parts.push(`<path d="M18 ${footRule} L${W - 18} ${footRule}" stroke="currentColor" stroke-width="1.2" opacity="0.55" fill="none"/>`);
  parts.push(text(24, footRule + 24, "The 12, the 4 and the 8 came out of the", { size: 12.5 }));
  parts.push(text(24, footRule + 41, "left-hand job only.", { size: 12.5 }));
  parts.push(text(24, footRule + 62, "In the last line the outside power lands on the 2 as", { size: 12.5, opacity: "0.85" }));
  parts.push(text(24, footRule + 79, "well. That is the mark most often dropped.", { size: 12.5, opacity: "0.85" }));
  parts.push(`</svg>`);
  return parts.join("");
}

// ---------------------------------------------------------------------------
// Question figures (data-URI, single-quoted attributes, no # characters)
// ---------------------------------------------------------------------------

const dq = (svg) => `data:image/svg+xml;utf8,${svg.replace(/"/g, "'").replace(/#/g, "%23")}`;

/** q.0015: a powers-of-two table with three blanks and ÷2 arrows along the bottom row. */
export function powersOfTwoTableDataUri() {
  const entries = [
    { p: 4, v: "16" },
    { p: 3, v: "8" },
    { p: 2, v: "4" },
    { p: 1, v: "2" },
    { p: 0, v: null },
    { p: -1, v: null },
    { p: -2, v: null },
  ];
  const x0 = 86;
  const w = 70;
  const yTop = 26;
  const h = 42;
  const W = x0 + entries.length * w + 14;
  const H = yTop + 2 * h + 76;
  const parts = [];
  parts.push(
    `<svg viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" role="img" aria-labelledby="ilzn-q15">`,
    `<title id="ilzn-q15">A table of powers of two from two to the power four down to two to the power negative two, with the last three values left blank</title>`,
    `<defs><marker id="ilznQ15" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0 0 L10 5 L0 10 z" fill="currentColor"/></marker></defs>`,
  );
  entries.forEach((e, i) => {
    const x = x0 + i * w;
    parts.push(`<rect x="${x}" y="${yTop}" width="${w}" height="${h}" fill="none" stroke="currentColor" stroke-width="1.2"/>`);
    parts.push(`<rect x="${x}" y="${yTop + h}" width="${w}" height="${h}" fill="none" stroke="currentColor" stroke-width="1.2"/>`);
    parts.push(text(x + w / 2, yTop + 28, `2${sup(e.p)}`, { anchor: "middle", size: 18 }));
    if (e.v) {
      parts.push(text(x + w / 2, yTop + h + 28, e.v, { anchor: "middle", size: 18 }));
    } else {
      parts.push(`<path d="M${x + 18} ${yTop + h + 31} L${x + w - 18} ${yTop + h + 31}" stroke="currentColor" stroke-width="1.6" fill="none"/>`);
    }
    if (i < entries.length - 1) {
      const cx = x + w;
      parts.push(
        `<path d="M${cx - 20} ${yTop + 2 * h + 22} Q ${cx} ${yTop + 2 * h + 40} ${cx + 20} ${yTop + 2 * h + 22}" stroke="currentColor" stroke-width="1.2" fill="none" marker-end="url(%23ilznQ15)"/>`,
      );
    }
  });
  parts.push(text(x0 - 12, yTop + 28, "power", { anchor: "end", size: 13, opacity: "0.85" }));
  parts.push(text(x0 - 12, yTop + h + 28, "value", { anchor: "end", size: 13, opacity: "0.85" }));
  parts.push(text(x0, yTop + 2 * h + 62, "Each curved arrow is ÷ 2.", { size: 13 }));
  parts.push(`</svg>`);
  return dq(parts.join(""));
}

/** q.0016: a rectangle labelled with an algebraic width and area. */
export function rectangleAreaDataUri() {
  const parts = [];
  const L = 118; // left edge of the rectangle, leaving room for the width label
  const R = 418;
  const W = 440;
  parts.push(
    `<svg viewBox="0 0 ${W} 232" xmlns="http://www.w3.org/2000/svg" width="${W}" height="232" role="img" aria-labelledby="ilzn-q16">`,
    `<title id="ilzn-q16">A rectangle whose width is labelled four a squared centimetres and whose area is labelled twelve a to the power seven square centimetres, with the length unknown</title>`,
  );
  parts.push(`<rect x="${L}" y="52" width="${R - L}" height="110" fill="currentColor" fill-opacity="0.07" stroke="currentColor" stroke-width="1.6"/>`);
  parts.push(text((L + R) / 2, 114, `area = 12a${sup(7)} cm${sup(2)}`, { anchor: "middle", size: 17, weight: "600" }));
  parts.push(`<path d="M96 52 L96 162" stroke="currentColor" stroke-width="1.2" fill="none"/>`);
  parts.push(`<path d="M90 52 L102 52" stroke="currentColor" stroke-width="1.2" fill="none"/>`);
  parts.push(`<path d="M90 162 L102 162" stroke="currentColor" stroke-width="1.2" fill="none"/>`);
  parts.push(text(84, 112, `4a${sup(2)} cm`, { anchor: "end", size: 16 }));
  parts.push(`<path d="M${L} 186 L${R} 186" stroke="currentColor" stroke-width="1.2" fill="none"/>`);
  parts.push(`<path d="M${L} 180 L${L} 192" stroke="currentColor" stroke-width="1.2" fill="none"/>`);
  parts.push(`<path d="M${R} 180 L${R} 192" stroke="currentColor" stroke-width="1.2" fill="none"/>`);
  parts.push(text((L + R) / 2, 208, "length", { anchor: "middle", size: 16 }));
  parts.push(text(L, 34, "Diagram not drawn accurately.", { size: 12, opacity: "0.8" }));
  parts.push(`</svg>`);
  return dq(parts.join(""));
}
