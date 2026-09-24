/**
 * Writes scratchpad/fm3-batch-c/preview/<slug>.html: every SVG of a published topic (note figures,
 * question figures, worked-example figures) at a phone column width and at a desktop width, with
 * its alt text and caption, so each figure is looked at before the topic is filed.
 *   node scratchpad/fm3-batch-c/preview.mjs <slug> [<slug> …]
 */
import fs from "node:fs";
import path from "node:path";

const ROOT = "C:/Users/feras/Downloads/CCEA GCSE Top Learning Platform";
const decode = (src) => decodeURIComponent(src.replace(/^data:image\/svg\+xml;utf8,/, "").replace(/%23/g, "#"));
const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;");

for (const slug of process.argv.slice(2)) {
  const dir = path.join(ROOT, "packs/further-maths/content/fm3", slug);
  const bundle = JSON.parse(fs.readFileSync(path.join(dir, "bundle.json"), "utf8"));
  const blocks = JSON.parse(fs.readFileSync(path.join(dir, "note.blocks.json"), "utf8"));
  const figs = [];
  blocks.forEach((b, i) => {
    if (b.type === "figure" && b.svg) figs.push({ where: `note block ${i}`, svg: b.svg, alt: b.alt, caption: b.caption });
  });
  for (const q of bundle.questions) for (const f of q.figures ?? []) if (f.kind === "svg") figs.push({ where: q.id, svg: decode(f.src), alt: f.alt });
  for (const w of bundle.workedExamples) if (w.figure?.kind === "svg") figs.push({ where: w.id, svg: decode(w.figure.src), alt: w.figure.alt });
  for (const d of bundle.diagnostics) for (const it of d.items) if (it.figure?.kind === "svg") figs.push({ where: `${d.id}#${it.id}`, svg: decode(it.figure.src), alt: it.figure.alt });
  const html = `<!doctype html><meta charset="utf-8"><title>${slug}</title>
<style>body{font-family:system-ui;margin:16px;color:#1d1d1f;background:#fff} .row{display:flex;gap:24px;align-items:flex-start;border-top:1px solid #ccc;padding:12px 0}
.phone{width:343px;flex:none} .desk{width:680px;flex:none} .dark{background:#1b1b1f;color:#eee;width:343px;flex:none;padding:4px}
svg{width:100%;height:auto;display:block} .meta{font-size:12px;color:#555;max-width:343px}</style>
${figs
  .map(
    (f) => `<div class="row"><div class="phone">${f.svg}<div class="meta"><b>${esc(f.where)}</b> · ${Buffer.byteLength(f.svg)} B<br>alt: ${esc(f.alt)}<br>${f.caption ? `caption: ${esc(f.caption)}` : ""}</div></div><div class="desk">${f.svg}</div><div class="dark">${f.svg}</div></div>`,
  )
  .join("\n")}`;
  const out = path.join(ROOT, "scratchpad/fm3-batch-c/preview", `${slug}.html`);
  fs.mkdirSync(path.dirname(out), { recursive: true });
  fs.writeFileSync(out, html, "utf8");
  console.log(`${out}: ${figs.length} figures`);
}
