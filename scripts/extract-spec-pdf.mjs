#!/usr/bin/env node
/**
 * extract-spec-pdf.mjs
 *
 * Dump the text of a PDF (page range) as a JSON array of lines, preserving
 * font-style information so that downstream parsers can detect bold (Higher
 * Tier) and italic (prescribed practical) text in CCEA specification PDFs.
 *
 * Usage:
 *   node scripts/extract-spec-pdf.mjs <pdf> [--from <page>] [--to <page>] [--out <json>] [--y-tol <pt>]
 *
 * Output shape (one object per visual line):
 *   {
 *     page: 12,            // 1-based PDF page index
 *     y: 612.3,            // baseline y of the line (PDF user space, origin bottom-left)
 *     x: 226.4,            // x of the first run on the line
 *     text: "1.1.2 ...",   // concatenated text of the line (runs joined, spacing inferred from gaps)
 *     bold: true,          // every non-whitespace character on the line is in a bold face
 *     italic: false,       // every non-whitespace character on the line is in an italic face
 *     boldRatio: 1,        // share of non-whitespace characters that are bold
 *     size: 10.5,          // dominant font size on the line
 *     runs: [ { x, w, text, bold, italic, font, size } ]  // per-font runs, left to right
 *   }
 *
 * Notes
 * - Font family names are resolved through page.commonObjs (after forcing the
 *   operator list to load) so that the real embedded name (e.g. "Calibri-Bold")
 *   is available instead of the opaque "g_d0_f3" id.
 * - Subscripts/superscripts (e.g. the "2" in CO2) are set on a slightly shifted
 *   baseline with a smaller size; they are merged into the parent line when the
 *   baseline shift is within --y-tol points (default 4.5).
 */
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL, fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const pdfjsPath = require.resolve('pdfjs-dist/legacy/build/pdf.mjs');
const pdfjs = await import(pathToFileURL(pdfjsPath).href);

function parseArgs(argv) {
  const args = { pdf: null, from: 1, to: null, out: null, yTol: 4.5 };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--from') args.from = Number(argv[++i]);
    else if (a === '--to') args.to = Number(argv[++i]);
    else if (a === '--out') args.out = argv[++i];
    else if (a === '--y-tol') args.yTol = Number(argv[++i]);
    else if (!args.pdf) args.pdf = a;
    else throw new Error(`Unexpected argument: ${a}`);
  }
  if (!args.pdf) {
    console.error('Usage: node scripts/extract-spec-pdf.mjs <pdf> [--from N] [--to M] [--out file.json] [--y-tol pt]');
    process.exit(1);
  }
  return args;
}

const isBoldFont = (name) => /bold|black|semibold|heavy/i.test(name);
const isItalicFont = (name) => /italic|oblique/i.test(name);

export async function extractLines(pdfFile, { from = 1, to = null, yTol = 4.5 } = {}) {
  const data = new Uint8Array(fs.readFileSync(pdfFile));
  const doc = await pdfjs.getDocument({ data, useSystemFonts: true, verbosity: 0 }).promise;
  const last = to ?? doc.numPages;
  const out = [];

  for (let p = from; p <= last; p++) {
    const page = await doc.getPage(p);
    await page.getOperatorList(); // forces fonts into commonObjs so we can read real names
    const tc = await page.getTextContent();

    const fontNames = {};
    const fontName = (id) => {
      if (!(id in fontNames)) {
        let n = null;
        try { n = page.commonObjs.get(id)?.name; } catch { /* not loaded */ }
        fontNames[id] = n || tc.styles[id]?.fontFamily || id;
      }
      return fontNames[id];
    };

    // Collect glyph runs with geometry.
    const items = [];
    for (const it of tc.items) {
      if (it.str === undefined) continue;
      const [a, b, c, d, e, f] = it.transform;
      const size = Math.hypot(b, d) || Math.hypot(a, c) || it.height || 0;
      const font = fontName(it.fontName);
      items.push({
        x: e, y: f, w: it.width, h: it.height, size, text: it.str, font,
        bold: isBoldFont(font), italic: isItalicFont(font), hasEOL: !!it.hasEOL,
      });
    }
    if (!items.length) continue;

    // Cluster into lines by baseline. Sort top-to-bottom; a new item joins the
    // current cluster if its baseline is within yTol of the cluster's anchor
    // (the anchor is the largest-size item so that sub/superscripts are absorbed).
    items.sort((p1, p2) => (p2.y - p1.y) || (p1.x - p2.x));
    const lines = [];
    for (const it of items) {
      let target = null;
      for (let i = lines.length - 1; i >= 0 && i >= lines.length - 3; i--) {
        const ln = lines[i];
        if (Math.abs(it.y - ln.anchorY) <= yTol) { target = ln; break; }
      }
      if (!target) {
        target = { anchorY: it.y, anchorSize: it.size, items: [] };
        lines.push(target);
      } else if (it.size > target.anchorSize + 0.5) {
        target.anchorY = it.y; target.anchorSize = it.size;
      }
      target.items.push(it);
    }

    for (const ln of lines) {
      ln.items.sort((p1, p2) => p1.x - p2.x);
      // Build text, inserting a space where the horizontal gap suggests one.
      let text = '';
      let prev = null;
      const runs = [];
      for (const it of ln.items) {
        if (it.text === '') continue;
        if (prev) {
          const gap = it.x - (prev.x + prev.w);
          const needSpace = gap > Math.max(1.2, prev.size * 0.16) && !/\s$/.test(text) && !/^\s/.test(it.text);
          if (needSpace) text += ' ';
        }
        text += it.text;
        const r = runs[runs.length - 1];
        if (r && r.font === it.font && Math.abs(r.size - it.size) < 0.3 && it.x - (r.x + r.w) < Math.max(1.2, it.size * 0.16) + 0.01) {
          r.text += it.text; r.w = it.x + it.w - r.x;
        } else {
          runs.push({ x: it.x, w: it.w, text: it.text, bold: it.bold, italic: it.italic, font: it.font, size: it.size });
        }
        prev = it;
      }
      text = text.replace(/\s+/g, ' ').trim();
      if (!text) continue;
      const inkRuns = runs.filter((r) => r.text.trim());
      const boldChars = inkRuns.reduce((n, r) => n + (r.bold ? r.text.trim().length : 0), 0);
      const italChars = inkRuns.reduce((n, r) => n + (r.italic ? r.text.trim().length : 0), 0);
      const totalChars = inkRuns.reduce((n, r) => n + r.text.trim().length, 0);
      // dominant size
      const sizeCount = {};
      for (const r of inkRuns) sizeCount[r.size.toFixed(1)] = (sizeCount[r.size.toFixed(1)] || 0) + r.text.length;
      const size = Number(Object.entries(sizeCount).sort((a, b) => b[1] - a[1])[0]?.[0] ?? 0);
      out.push({
        page: p,
        y: Number(ln.anchorY.toFixed(2)),
        x: Number(Math.min(...ln.items.map((i) => i.x)).toFixed(2)),
        text,
        bold: totalChars > 0 && boldChars === totalChars,
        italic: totalChars > 0 && italChars === totalChars,
        boldRatio: totalChars ? Number((boldChars / totalChars).toFixed(3)) : 0,
        size,
        runs: runs.map((r) => ({ x: Number(r.x.toFixed(2)), w: Number(r.w.toFixed(2)), text: r.text, bold: r.bold, italic: r.italic, font: r.font, size: Number(r.size.toFixed(2)) })),
      });
    }
  }
  return out;
}

// CLI entry (only when executed directly, not when imported)
const invokedDirectly = !!process.argv[1] && path.resolve(process.argv[1]) === path.resolve(fileURLToPath(import.meta.url));
if (invokedDirectly) {
  const args = parseArgs(process.argv.slice(2));
  const lines = await extractLines(args.pdf, { from: args.from, to: args.to, yTol: args.yTol });
  const json = JSON.stringify(lines, null, 1);
  if (args.out) {
    fs.mkdirSync(path.dirname(args.out), { recursive: true });
    fs.writeFileSync(args.out, json);
    console.error(`Wrote ${lines.length} lines (pages ${args.from}-${args.to ?? 'end'}) to ${args.out}`);
  } else {
    process.stdout.write(json);
  }
}
