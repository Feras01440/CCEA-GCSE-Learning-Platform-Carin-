#!/usr/bin/env node
/**
 * scripts/qa/gate-context.mjs - run with `node scripts/qa/gate-context.mjs`.
 * Note gates now also appear on their own in the review inbox, so a gate whose prompt leans on the note around it
 * ("the picture above", "in this diagram") must carry that figure with it. Lists every gate prompt that refers to a
 * figure or table above it, with the id of the nearest preceding figure/photo block (or NONE), so the inbox can
 * attach it and authors can see what a gate depends on. Exit 1 when a leaning gate has no preceding visual.
 */
import fs from "node:fs";
import path from "node:path";
const ROOT = path.resolve("packs");
function notes(d, out = []) { for (const f of fs.readdirSync(d)) { const p = path.join(d, f); if (fs.statSync(p).isDirectory()) notes(p, out); else if (f === "note.blocks.json") out.push(p); } return out; }
const LEAN = /\b(?:the |this |that )?(?:picture|figure|graph|diagram|tree|cuboid|wedge|pyramid|grid|number line|curve|routes?|table|food web|food chain|sketch|drawing|chart)s?\b[^.?]{0,20}\b(above|shown|here|drawn)\b|\bin this (?:diagram|figure|picture|graph|table)\b|\bas above\b/i;
let gates = 0; const rows = []; let orphan = 0;
for (const file of notes(ROOT)) {
  const doc = JSON.parse(fs.readFileSync(file, "utf8")); const arr = Array.isArray(doc) ? doc : doc.blocks;
  let lastVisual = null;
  arr.forEach((b, i) => {
    if (b.type === "figure" || b.type === "photo") lastVisual = { i, alt: (b.alt || "").slice(0, 50) };
    if (b.type === "gate") { gates++; if (LEAN.test(b.prompt || "")) { rows.push({ topic: file.split(path.sep).slice(-2, -1)[0], gate: b.id, visual: lastVisual ? `block ${lastVisual.i} (${lastVisual.alt})` : "NONE" }); if (!lastVisual) orphan++; } }
  });
}
console.log(`gates ${gates} | leaning on a figure: ${rows.length} | without a preceding visual: ${orphan}`);
for (const r of rows) console.log(`  ${r.topic} ${r.gate} -> ${r.visual}`);
process.exit(orphan ? 1 : 0);
