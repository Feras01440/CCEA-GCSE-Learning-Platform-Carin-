/**
 * Figures for maths.m7.standard-form.
 *
 * House rules (pipeline/prompts/author-topic.md): every SVG carries a viewBox, draws with
 * stroke/fill "currentColor" (plus fill-opacity tints), has no <style>, <script>, event handler
 * or external href, and uses no url(#id) references so nothing collides when several figures are
 * inlined on one page. Arrowheads are explicit triangles.
 *
 * Two flavours are exported:
 *   noteSvg*()  -> a raw SVG string for a note `figure` block
 *   dataUri()   -> the same string wrapped as data:image/svg+xml;utf8,... for a question FigureSpec
 */

/** Wrap an SVG string as a utf8 data URI; % and # must be escaped for decodeURIComponent. */
export function dataUri(svg) {
  return "data:image/svg+xml;utf8," + svg.replace(/%/g, "%25").replace(/#/g, "%23");
}

/** Arrowhead triangle pointing along (dx, dy) with its tip at (x, y). */
function head(x, y, dir, size = 7) {
  const s = size;
  if (dir === "left") return `<path d="M${x} ${y} L${x + s} ${y - s * 0.6} L${x + s} ${y + s * 0.6} Z" fill="currentColor"/>`;
  if (dir === "right") return `<path d="M${x} ${y} L${x - s} ${y - s * 0.6} L${x - s} ${y + s * 0.6} Z" fill="currentColor"/>`;
  if (dir === "up") return `<path d="M${x} ${y} L${x - s * 0.6} ${y + s} L${x + s * 0.6} ${y + s} Z" fill="currentColor"/>`;
  return `<path d="M${x} ${y} L${x - s * 0.6} ${y - s} L${x + s * 0.6} ${y - s} Z" fill="currentColor"/>`;
}

/** A small solid caret marking where the decimal point is sitting. */
function caret(x, y, dashed = false) {
  const d = `M${x} ${y} L${x - 6} ${y + 11} L${x + 6} ${y + 11} Z`;
  return dashed
    ? `<path d="${d}" fill="none" stroke="currentColor" stroke-width="1.2" stroke-dasharray="3 2"/>`
    : `<path d="${d}" fill="currentColor"/>`;
}

// ---------------------------------------------------------------------------
// Figure 1 — the place-value slider
// ---------------------------------------------------------------------------

export const SLIDER_ALT =
  "A place-value slider in two rows. The top row shows the digits 4 8 3 0 0 0 0 with a solid caret marking the decimal point after the final zero and a dashed caret between the 4 and the 8; a labelled arrow runs from the solid caret leftwards to the dashed one, marked six places, and the row is labelled 4 830 000 equals 4.83 times ten to the power 6. The bottom row shows the digits 0 point 0 0 0 0 6 2 with a solid caret after the leading zero and a dashed caret between the 6 and the 2; a labelled arrow runs rightwards, marked five places, and the row is labelled 0.000 062 equals 6.2 times ten to the power negative 5. A line underneath reads: slide left for a positive power, slide right for a negative power.";

export function noteSvgSlider() {
  const x0 = 96;
  const step = 42;
  const topDigits = ["4", "8", "3", "0", "0", "0", "0"];
  const botDigits = ["0", "0", "0", "0", "6", "2"];

  // Top row: 4 830 000 -> 4.83, point slides 6 places left.
  const topCells = topDigits
    .map((d, i) => `<text x="${x0 + i * step}" y="82" text-anchor="middle">${d}</text>`)
    .join("");
  const topTicks = topDigits
    .map((_, i) => `<path d="M${x0 + (i + 0.5) * step} 58 L${x0 + (i + 0.5) * step} 90"/>`)
    .join("");
  const topStart = x0 + 6.5 * step; // after the last zero
  const topEnd = x0 + 0.5 * step; // between the 4 and the 8

  // Bottom row: 0.000 062 -> 6.2, point slides 5 places right.
  const botCells = botDigits
    .map((d, i) => `<text x="${x0 + i * step}" y="196" text-anchor="middle">${d}</text>`)
    .join("");
  const botTicks = botDigits
    .map((_, i) => `<path d="M${x0 + (i + 0.5) * step} 172 L${x0 + (i + 0.5) * step} 204"/>`)
    .join("");
  const botStart = x0 - 0.5 * step; // straight after the leading zero
  const botEnd = x0 + 4.5 * step; // between the 6 and the 2

  return `<svg viewBox="0 0 660 300" xmlns="http://www.w3.org/2000/svg" role="img" aria-labelledby="sfslider"><title id="sfslider">A place-value slider: the point slides six places left for ten to the power six and five places right for ten to the power negative five</title><g font-family="inherit" font-size="13" fill="currentColor"><text x="20" y="26">The power of ten is a count of places, not a count of zeros.</text></g><g font-family="inherit" font-size="21" fill="currentColor">${topCells}</g><g stroke="currentColor" fill="none" stroke-width="0.7" opacity="0.45">${topTicks}</g><g>${caret(topStart, 92)}${caret(topEnd, 92, true)}</g><g stroke="currentColor" fill="none" stroke-width="1.3"><path d="M${topStart - 8} 118 L${topEnd + 10} 118"/></g>${head(topEnd + 2, 118, "left")}<g font-family="inherit" font-size="13" fill="currentColor"><text x="${(topStart + topEnd) / 2}" y="136" text-anchor="middle">6 places left</text><text x="20" y="82" text-anchor="start">4 830 000</text><text x="${x0 + 7.2 * step}" y="82" text-anchor="start">= 4.83 × 10⁶</text></g><g stroke="currentColor" fill="none" stroke-width="0.8" opacity="0.35"><path d="M20 150 L640 150"/></g><g font-family="inherit" font-size="21" fill="currentColor"><text x="${x0 - step}" y="196" text-anchor="middle">0.</text>${botCells}</g><g stroke="currentColor" fill="none" stroke-width="0.7" opacity="0.45">${botTicks}</g><g>${caret(botStart, 206)}${caret(botEnd, 206, true)}</g><g stroke="currentColor" fill="none" stroke-width="1.3"><path d="M${botStart + 8} 232 L${botEnd - 10} 232"/></g>${head(botEnd - 2, 232, "right")}<g font-family="inherit" font-size="13" fill="currentColor"><text x="${(botStart + botEnd) / 2}" y="250" text-anchor="middle">5 places right</text><text x="${x0 + 5.6 * step}" y="196" text-anchor="start">= 6.2 × 10⁻⁵</text><text x="20" y="284">Slide left for a positive power. Slide right for a negative power. The digits never change.</text></g></svg>`;
}

// ---------------------------------------------------------------------------
// Figure 2 — the number line of powers of ten
// ---------------------------------------------------------------------------

/**
 * Real quantities pinned to the line. `row` chooses one of four label rows (A1/A2 above,
 * B1/B2 below) picked so that no leader line ever crosses another row's text.
 */
export const SCALE_FACTS = [
  { exp: -31, label: "mass of an electron", value: "9.1 × 10⁻³¹ kg", row: "A1", anchor: "start" },
  { exp: -10, label: "width of a hydrogen atom", value: "1 × 10⁻¹⁰ m", row: "B1", anchor: "middle" },
  { exp: -6, label: "width of a red blood cell", value: "7 × 10⁻⁶ m", row: "A1", anchor: "middle" },
  { exp: 0, label: "your height", value: "1.7 × 10⁰ m", row: "B2", anchor: "middle" },
  { exp: 6, label: "radius of the Earth", value: "6.4 × 10⁶ m", row: "A2", anchor: "middle" },
  { exp: 11, label: "distance to the Sun", value: "1.5 × 10¹¹ m", row: "B1", anchor: "middle" },
  { exp: 24, label: "mass of the Earth", value: "6.0 × 10²⁴ kg", row: "A1", anchor: "end" },
];

export const SCALE_ALT =
  "A horizontal number line of powers of ten running from ten to the power negative 35 on the left to ten to the power 25 on the right, with labelled ticks at ten to the power negative 30, negative 20, negative 10, 0, 10 and 20. Seven real quantities are pinned to it by dots and leader lines, some labelled above the line and some below: the mass of an electron at 9.1 times ten to the power negative 31 kilograms, the width of a hydrogen atom at 1 times ten to the power negative 10 metres, the width of a red blood cell at 7 times ten to the power negative 6 metres, your height at 1.7 times ten to the power 0 metres, the radius of the Earth at 6.4 times ten to the power 6 metres, the distance to the Sun at 1.5 times ten to the power 11 metres, and the mass of the Earth at 6.0 times ten to the power 24 kilograms. A line underneath reads: one step to the right is one more zero, so ten times bigger, and from the electron to the Earth is 55 steps.";

const SUP = { "-": "⁻", 0: "⁰", 1: "¹", 2: "²", 3: "³", 4: "⁴", 5: "⁵", 6: "⁶", 7: "⁷", 8: "⁸", 9: "⁹" };
export const sup = (n) => String(n).split("").map((c) => SUP[c]).join("");

/** Label-row geometry: [leader end y, label baseline y, value baseline y]. */
const SCALE_ROWS = {
  A2: { lead: 78, label: 58, value: 72 },
  A1: { lead: 118, label: 98, value: 112 },
  B1: { lead: 172, label: 186, value: 200 },
  B2: { lead: 212, label: 226, value: 240 },
};

export function noteSvgScale() {
  const y = 150;
  const px = (e) => 40 + (e + 35) * 10;

  let ticks = "";
  let tickLabels = "";
  for (let e = -30; e <= 20; e += 10) {
    const x = px(e);
    ticks += `<path d="M${x} ${y - 6} L${x} ${y + 6}"/>`;
    // The leftmost label is pushed right so the electron's leader line runs clear of it.
    tickLabels +=
      e === -30
        ? `<text x="${x + 6}" y="${y - 14}" text-anchor="start">10${sup(e)}</text>`
        : `<text x="${x}" y="${y - 14}" text-anchor="middle">10${sup(e)}</text>`;
  }

  const pins = SCALE_FACTS.map((f) => {
    const x = px(f.exp);
    const r = SCALE_ROWS[f.row];
    const above = f.row.startsWith("A");
    const tx = f.anchor === "start" ? x - 20 : f.anchor === "end" ? x + 20 : x;
    return (
      `<path d="M${x} ${above ? y - 6 : y + 6} L${x} ${r.lead}" stroke="currentColor" stroke-width="1" fill="none"/>` +
      `<circle cx="${x}" cy="${y}" r="3.2" fill="currentColor"/>` +
      `<text x="${tx}" y="${r.label}" text-anchor="${f.anchor}">${f.label}</text>` +
      `<text x="${tx}" y="${r.value}" text-anchor="${f.anchor}">${f.value}</text>`
    );
  }).join("");

  return `<svg viewBox="0 0 690 300" xmlns="http://www.w3.org/2000/svg" role="img" aria-labelledby="sfscale"><title id="sfscale">A number line of powers of ten from ten to the power negative 35 to ten to the power 25, with seven real quantities pinned to it</title><g stroke="currentColor" fill="none" stroke-width="1.4"><path d="M40 ${y} L650 ${y}"/></g><g stroke="currentColor" fill="none" stroke-width="1.2">${ticks}</g><g font-family="inherit" font-size="12.5" fill="currentColor">${tickLabels}</g><g font-family="inherit" font-size="12.5" fill="currentColor">${pins}</g><g font-family="inherit" font-size="12.5" fill="currentColor"><text x="40" y="278">One step to the right is one more zero, so ten times bigger. From the electron to the Earth is 55 steps.</text></g></svg>`;
}

// ---------------------------------------------------------------------------
// Figure 3 — aligning the powers before adding
// ---------------------------------------------------------------------------

export const ALIGN_ALT =
  "A worked addition set out in a column. The first line reads 3.60 times ten to the power 5. Underneath, 4.2 times ten to the power 4 is shown to one side with a curved arrow relabelling it as 0.42 times ten to the power 5, and the note: the power goes up by one, so the point slides one place left. The second line of the column therefore reads plus 0.42 times ten to the power 5, a rule is drawn, and the total reads 4.02 times ten to the power 5. To the right a boxed warning shows the wrong route, 3.6 plus 4.2 equals 7.8 and 5 plus 4 equals 9, giving 7.8 times ten to the power 9, with the note that this is about 19 000 times too big.";

export function noteSvgAlign() {
  return `<svg viewBox="0 0 660 280" xmlns="http://www.w3.org/2000/svg" role="img" aria-labelledby="sfalign"><title id="sfalign">Aligning the powers before adding two numbers in standard form</title><g font-family="inherit" font-size="13" fill="currentColor"><text x="20" y="24">Addition only works down a column when every power of ten is the same.</text></g><g font-family="inherit" font-size="19" fill="currentColor"><text x="60" y="76">3.60 × 10⁵</text><text x="36" y="114">+</text><text x="60" y="114">0.42 × 10⁵</text><text x="60" y="152">4.02 × 10⁵</text></g><g stroke="currentColor" fill="none" stroke-width="1.4"><path d="M36 126 L206 126"/></g><g font-family="inherit" font-size="15" fill="currentColor"><text x="236" y="98">4.2 × 10⁴ is the same size as 0.42 × 10⁵</text></g><g stroke="currentColor" fill="none" stroke-width="1.2"><path d="M300 106 L300 118 L182 118"/></g>${head(174, 118, "left")}<g font-family="inherit" font-size="12.5" fill="currentColor"><text x="236" y="136">the power goes up by one,</text><text x="236" y="152">so the point slides one place left</text></g><g stroke="currentColor" fill="none" stroke-width="1.2" stroke-dasharray="5 3"><rect x="36" y="184" width="588" height="72" rx="6" fill="currentColor" fill-opacity="0.05"/></g><g font-family="inherit" font-size="13" fill="currentColor"><text x="52" y="208">The route that scores nothing: add the fronts and add the powers.</text><text x="52" y="230" font-size="15">3.6 + 4.2 = 7.8 and 5 + 4 = 9, giving 7.8 × 10⁹</text><text x="52" y="248">That answer is about 19 000 times the true one, so a size check catches it straight away.</text></g></svg>`;
}

// ---------------------------------------------------------------------------
// Question figures (data URIs)
// ---------------------------------------------------------------------------

export const COMPARE_ALT =
  "Two sealed sample boxes side by side on a bench line. The box labelled X is marked 6.4 times ten to the power 5 milligrams and the box labelled Y is marked 5.9 times ten to the power 2 grams.";

export function figCompare() {
  const svg = `<svg viewBox='0 0 460 190' xmlns='http://www.w3.org/2000/svg' role='img'><g stroke='currentColor' fill='none' stroke-width='1.4'><rect x='46' y='46' width='140' height='86' rx='4' fill='currentColor' fill-opacity='0.05'/><rect x='274' y='46' width='140' height='86' rx='4' fill='currentColor' fill-opacity='0.05'/><path d='M20 132 L440 132'/><path d='M46 62 L186 62'/><path d='M274 62 L414 62'/></g><g font-family='inherit' font-size='16' fill='currentColor'><text x='116' y='58' text-anchor='middle'>X</text><text x='344' y='58' text-anchor='middle'>Y</text></g><g font-family='inherit' font-size='17' fill='currentColor'><text x='116' y='102' text-anchor='middle'>6.4 × 10⁵ mg</text><text x='344' y='102' text-anchor='middle'>5.9 × 10² g</text></g><g font-family='inherit' font-size='13' fill='currentColor'><text x='230' y='166' text-anchor='middle'>Two sealed samples. The labels are printed in different units.</text></g></svg>`;
  return dataUri(svg);
}

export const BARMODEL_ALT =
  "A bar model in two rows. The top row is one bar labelled 6 times ten to the power 5, marked 100 per cent and divided into ten equal parts each worth 6 times ten to the power 4. The bottom row repeats that bar and adds seven more of the same parts, bracketed and labelled 70 per cent, with the whole bottom row labelled the new amount.";

export function figBarModel() {
  const cell = 34;
  const x0 = 70;
  const topCells = Array.from({ length: 10 }, (_, i) => `<rect x='${x0 + i * cell}' y='44' width='${cell}' height='30' fill='none' stroke='currentColor' stroke-width='1'/>`).join("");
  const botBase = Array.from({ length: 10 }, (_, i) => `<rect x='${x0 + i * cell}' y='112' width='${cell}' height='30' fill='none' stroke='currentColor' stroke-width='1'/>`).join("");
  const botExtra = Array.from({ length: 7 }, (_, i) => `<rect x='${x0 + (10 + i) * cell}' y='112' width='${cell}' height='30' fill='currentColor' fill-opacity='0.12' stroke='currentColor' stroke-width='1'/>`).join("");
  const svg = `<svg viewBox='0 0 660 210' xmlns='http://www.w3.org/2000/svg' role='img'><g>${topCells}${botBase}${botExtra}</g><g font-family='inherit' font-size='13' fill='currentColor'><text x='${x0}' y='34'>100%, worth 6 × 10⁵</text><text x='16' y='64'>before</text><text x='16' y='132'>after</text><text x='${x0 + 10 * cell + 8}' y='104'>70% more</text><text x='${x0}' y='166'>each part is 10%, worth 6 × 10⁴</text></g><g stroke='currentColor' fill='none' stroke-width='1.2'><path d='M${x0 + 10 * cell} 152 L${x0 + 10 * cell} 158 L${x0 + 17 * cell} 158 L${x0 + 17 * cell} 152'/></g><g font-family='inherit' font-size='13' fill='currentColor'><text x='${x0 + 13.5 * cell}' y='176' text-anchor='middle'>7 extra parts</text></g></svg>`;
  return dataUri(svg);
}

export const ORDERCARD_ALT =
  "Three labelled cards. Card A reads open bracket 6 times ten to the power negative 4 close bracket plus open bracket 3 times ten to the power 2 close bracket. Card B reads the same two numbers multiplied. Card C reads the first divided by the second. Beneath the cards are three empty answer boxes joined by arrows and labelled smallest on the left and largest on the right.";

export function figOrderCards() {
  const cards = [
    { t: "A", e: "(6 × 10⁻⁴) + (3 × 10²)" },
    { t: "B", e: "(6 × 10⁻⁴) × (3 × 10²)" },
    { t: "C", e: "(6 × 10⁻⁴) ÷ (3 × 10²)" },
  ];
  const cardSvg = cards
    .map(
      (c, i) =>
        `<rect x='24' y='${20 + i * 46}' width='400' height='36' rx='5' fill='none' stroke='currentColor' stroke-width='1.2'/>` +
        `<text x='44' y='${44 + i * 46}' font-size='16' fill='currentColor'>${c.t} =</text>` +
        `<text x='92' y='${44 + i * 46}' font-size='16' fill='currentColor'>${c.e}</text>`,
    )
    .join("");
  const boxes = [0, 1, 2]
    .map((i) => `<rect x='${60 + i * 120}' y='180' width='84' height='34' rx='4' fill='none' stroke='currentColor' stroke-width='1.2' stroke-dasharray='4 3'/>`)
    .join("");
  const joins = [0, 1]
    .map((i) => `<path d='M${146 + i * 120} 197 L${172 + i * 120} 197' stroke='currentColor' stroke-width='1.2' fill='none'/>${head(176 + i * 120, 197, "right", 6)}`)
    .join("");
  return dataUri(
    `<svg viewBox='0 0 460 240' xmlns='http://www.w3.org/2000/svg' role='img'><g font-family='inherit'>${cardSvg}</g><g>${boxes}${joins}</g><g font-family='inherit' font-size='12.5' fill='currentColor'><text x='60' y='232'>smallest</text><text x='384' y='232' text-anchor='end'>largest</text></g></svg>`,
  );
}
