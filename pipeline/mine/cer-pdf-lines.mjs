/**
 * pipeline/mine/cer-pdf-lines.mjs
 *
 * Reads a Chief Examiner report PDF with its word positions and rebuilds the page as text lines,
 * one line per printed baseline, so that a question label in the report's left-hand column sits on
 * the same line as the finding printed beside it.
 *
 * Why: the reports print each unit's findings as a two-column table (labels "Q8 (a) (i)" on the
 * left, the finding on the right). `pdftotext -layout` keeps the columns apart when the rows of the
 * two columns are spaced differently, so in the text file the label column drifts away from its
 * findings: in Summer 2025 B2H the labels "Q8" and "Q9" land two findings too early and every
 * finding for Q8, Q9 and Q10 ends up under the Q10 heading. Grouping the PDF's own text items by
 * baseline puts every label back on the row it was printed on.
 *
 * The output imitates `pdftotext -layout` closely enough for extract-cer.mjs's splitter: pages are
 * separated by a form feed, a line is indented by its left edge in average character widths, and
 * items on one line are separated by spaces in proportion to the gap between them.
 */
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL, fileURLToPath } from "node:url";
import { createRequire } from "node:module";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");

/** Points per character of indentation and gap; pdftotext -layout uses about this for 11-12 pt body text. */
export const CHAR_WIDTH = 5.4;
/** Two items whose baselines differ by at most this many points are on one printed line (sub- and superscripts join their line). */
export const Y_TOLERANCE = 4.5;

/**
 * Group positioned text items into printed lines. Pure: no PDF access.
 * @param {Array<{x:number,y:number,w?:number,str:string}>} items  one page's items (PDF user space: y grows upwards)
 * @param {{left?:number, charWidth?:number, yTol?:number}} [opts]
 * @returns {Array<{y:number,x:number,text:string}>} lines from the top of the page down
 */
export function assembleLines(items, { left, charWidth = CHAR_WIDTH, yTol = Y_TOLERANCE } = {}) {
  const live = items.filter((it) => typeof it.str === "string" && it.str.trim() !== "");
  if (!live.length) return [];
  const margin = left ?? Math.min(...live.map((it) => it.x));
  // Anchor each line on its first (largest-baseline) item; a new item joins the nearest open line within yTol.
  const sorted = [...live].sort((a, b) => b.y - a.y || a.x - b.x);
  const lines = [];
  for (const it of sorted) {
    let target = null;
    for (let i = lines.length - 1; i >= 0 && i >= lines.length - 3; i--) {
      if (Math.abs(lines[i].y - it.y) <= yTol) { target = lines[i]; break; }
    }
    if (!target) { target = { y: it.y, items: [] }; lines.push(target); }
    target.items.push(it);
  }
  return lines.map((ln) => {
    const row = [...ln.items].sort((a, b) => a.x - b.x);
    let text = " ".repeat(Math.max(0, Math.round((row[0].x - margin) / charWidth)));
    let end = row[0].x;
    row.forEach((it, i) => {
      const s = it.str;
      if (i > 0) {
        const gap = it.x - end;
        const needsSpace = gap > charWidth * 0.3 && !/\s$/.test(text) && !/^\s/.test(s);
        if (gap > charWidth * 1.5) text = text.replace(/\s+$/, "") + " ".repeat(Math.max(2, Math.round(gap / charWidth)));
        else if (needsSpace) text += " ";
      }
      text += s;
      const width = Number.isFinite(it.w) && it.w > 0 ? it.w : s.length * charWidth;
      end = Math.max(end, it.x + width);
    });
    return { y: ln.y, x: row[0].x, text: text.replace(/\s+$/, "") };
  });
}

let pdfjsPromise = null;
function loadPdfjs() {
  if (!pdfjsPromise) {
    const require = createRequire(path.join(ROOT, "package.json"));
    pdfjsPromise = import(pathToFileURL(require.resolve("pdfjs-dist/legacy/build/pdf.mjs")).href);
  }
  return pdfjsPromise;
}

/**
 * The report as layout text rebuilt from word positions: pages joined by "\f", one printed baseline per line.
 * The left margin is the document's most common line start, so the report's left column sits at column 0.
 */
export async function pdfLayoutText(pdfFile) {
  const pdfjs = await loadPdfjs();
  const task = pdfjs.getDocument({ data: new Uint8Array(fs.readFileSync(pdfFile)), verbosity: 0 });
  const doc = await task.promise;
  const pages = [];
  for (let p = 1; p <= doc.numPages; p++) {
    const page = await doc.getPage(p);
    const tc = await page.getTextContent();
    pages.push(tc.items
      .filter((it) => typeof it.str === "string")
      .map((it) => ({ x: it.transform[4], y: it.transform[5], w: it.width, str: it.str })));
    page.cleanup();
  }
  await task.destroy();
  const starts = new Map();
  for (const items of pages) {
    for (const ln of assembleLines(items, { left: 0 })) {
      const k = Math.round(ln.x);
      starts.set(k, (starts.get(k) ?? 0) + 1);
    }
  }
  // The left margin: the smallest line start shared by at least 5% of the lines (a stray page number
  // or a footer further left must not become the margin).
  const total = [...starts.values()].reduce((a, b) => a + b, 0);
  const left = [...starts.entries()].sort((a, b) => a[0] - b[0]).find(([, n]) => n >= total * 0.05)?.[0] ?? 0;
  return pages.map((items) => assembleLines(items, { left }).map((l) => l.text).join("\n")).join("\n\f");
}
