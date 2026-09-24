/**
 * Rasterises every SVG of a published topic to PNG with sharp (librsvg), at the width a phone
 * column gives it (343 CSS px, rendered at 2x), so each figure can be looked at before filing.
 * currentColor becomes near-black and font-family inherit becomes a sans font, as the page would.
 *   node scratchpad/fm3-batch-c/render.mjs <slug> [<slug> …]
 */
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const ROOT = "C:/Users/feras/Downloads/CCEA GCSE Top Learning Platform";
const decode = (src) => decodeURIComponent(src.replace(/^data:image\/svg\+xml;utf8,/, "").replace(/%23/g, "#"));

for (const slug of process.argv.slice(2)) {
  const dir = path.join(ROOT, "packs/further-maths/content/fm3", slug);
  const bundle = JSON.parse(fs.readFileSync(path.join(dir, "bundle.json"), "utf8"));
  const blocks = JSON.parse(fs.readFileSync(path.join(dir, "note.blocks.json"), "utf8"));
  const figs = [];
  blocks.forEach((b, i) => {
    if (b.type === "figure" && b.svg) figs.push({ where: `note-${String(i).padStart(2, "0")}`, svg: b.svg });
  });
  for (const q of bundle.questions) (q.figures ?? []).forEach((f, i) => f.kind === "svg" && figs.push({ where: `${q.id.split(".").pop()}-${i}`, svg: decode(f.src) }));
  for (const w of bundle.workedExamples) if (w.figure?.kind === "svg") figs.push({ where: `we-${w.id.split(".").pop()}`, svg: decode(w.figure.src) });
  for (const d of bundle.diagnostics) for (const it of d.items) if (it.figure?.kind === "svg") figs.push({ where: `dx-${it.id}`, svg: decode(it.figure.src) });
  const outDir = path.join(ROOT, "scratchpad/fm3-batch-c/preview", slug);
  fs.mkdirSync(outDir, { recursive: true });
  for (const f of figs) {
    const vb = /viewBox='([^']+)'/.exec(f.svg)[1].split(/\s+/).map(Number);
    const width = 686;
    const height = Math.round((width * vb[3]) / vb[2]);
    const svg = f.svg
      .replace(/currentColor/g, "#1d1d1f")
      .replace(/font-family='inherit'/g, "font-family='Segoe UI, Arial, sans-serif'")
      .replace("<svg ", `<svg width='${width}' height='${height}' `);
    const out = path.join(outDir, `${f.where}.png`);
    await sharp(Buffer.from(svg)).flatten({ background: "#ffffff" }).png().toFile(out);
    console.log(`${out}  ${width}x${height}  (${vb[2]}x${vb[3]} viewBox, ${Buffer.byteLength(f.svg)} B)`);
  }
}
