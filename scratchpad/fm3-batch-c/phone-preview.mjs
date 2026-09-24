/**
 * Renders SVG strings to PNG at a phone column (343 CSS px at 2x) so a figure can be looked at
 * before it is published.   import { renderAll } from "./phone-preview.mjs"
 */
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const ROOT = "C:/Users/feras/Downloads/CCEA GCSE Top Learning Platform";

export async function renderAll(dirName, figs) {
  const outDir = path.join(ROOT, "scratchpad/fm3-batch-c/preview", dirName);
  fs.mkdirSync(outDir, { recursive: true });
  for (const [name, svg0] of Object.entries(figs)) {
    const vb = /viewBox='([^']+)'/.exec(svg0)[1].split(/\s+/).map(Number);
    const width = 686;
    const height = Math.round((width * vb[3]) / vb[2]);
    const svg = svg0
      .replace(/currentColor/g, "#1d1d1f")
      .replace(/font-family='inherit'/g, "font-family='Segoe UI, Arial, sans-serif'")
      .replace("<svg ", `<svg width='${width}' height='${height}' `);
    const out = path.join(outDir, `${name}.png`);
    await sharp(Buffer.from(svg)).flatten({ background: "#ffffff" }).png().toFile(out);
    const sizes = [...svg0.matchAll(/font-size='([\d.]+)'/g)].map((m) => Number(m[1]));
    console.log(`${out}  ${vb[2]}x${vb[3]}  min font ${Math.min(...sizes)} (${((Math.min(...sizes) * Math.min(358, vb[2])) / vb[2]).toFixed(1)} px at 358)  ${Buffer.byteLength(svg0)} B`);
  }
}
