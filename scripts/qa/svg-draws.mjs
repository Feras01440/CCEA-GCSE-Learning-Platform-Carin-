#!/usr/bin/env node
/**
 * scripts/qa/svg-draws.mjs - run with `node scripts/qa/svg-draws.mjs`.
 * Walks every bundle.json and note.blocks.json under packs/, decodes every inline SVG and data-URI SVG, and reports
 * figures that cannot draw: <path> without a d attribute, path data written as bare text inside a group, a <text> node
 * holding path data, or a figure with no drawn shape at all. Exit code 1 when anything is found.
 */
import fs from "node:fs";
import path from "node:path";
function files(d, out = []) { for (const f of fs.readdirSync(d)) { const p = path.join(d, f); if (fs.statSync(p).isDirectory()) files(p, out); else if (f === "bundle.json" || f === "note.blocks.json") out.push(p); } return out; }
const hits = {}; let svgs = 0;
const add = (file, kind) => { const k = file.split(path.sep).slice(-3, -1).join("/") + (file.endsWith("note.blocks.json") ? " (note)" : ""); hits[k] = hits[k] || {}; hits[k][kind] = (hits[k][kind] || 0) + 1; };
function scanSvg(svg, file) {
  svgs++;
  for (const p of svg.match(/<path\b[^>]*>/g) || []) if (!/\sd\s*=\s*["']/.test(p)) add(file, "path-without-d");
  for (const t of svg.match(/<text\b[^>]*>([^<]*)<\/text>/g) || []) { const inner = t.replace(/<text\b[^>]*>/, "").replace(/<\/text>$/, ""); if (/^\s*[Mm]\s*-?\d/.test(inner) && /[LlCcQqAaHhVv]\s*-?\d|\d+[ ,]-?\d+\s+[LlCcHhVv]/.test(inner)) add(file, "text-holding-path-data"); }
  const shapes = (svg.match(/<(path|line|polyline|polygon|rect|circle|ellipse)\b/g) || []).length;
  if (shapes === 0) add(file, "no-drawn-shape");
  // path data as bare text directly inside <g> (the reported defect)
  const stripped = svg.replace(/<text\b[^>]*>[^<]*<\/text>/g, "");
  if (/>\s*M\s*-?\d[\d.\s,-]*[LlCcHhVvAaQq]/.test(stripped)) add(file, "path-data-as-bare-text");
}
function walk(v, file) { if (typeof v === "string") { if (v.startsWith("<svg")) scanSvg(v, file); else if (v.startsWith("data:image/svg+xml;utf8,")) { let s = v.slice(24); try { s = decodeURIComponent(s); } catch {} scanSvg(s, file); } } else if (Array.isArray(v)) v.forEach((x) => walk(x, file)); else if (v && typeof v === "object") Object.values(v).forEach((x) => walk(x, file)); }
for (const file of files(path.resolve("packs"))) walk(JSON.parse(fs.readFileSync(file, "utf8")), file);
const rows = Object.entries(hits);
console.log(`svgs scanned ${svgs} | files with defects: ${rows.length}`);
for (const [k, v] of rows) console.log(" ", k, JSON.stringify(v));
process.exit(rows.length ? 1 : 0);
