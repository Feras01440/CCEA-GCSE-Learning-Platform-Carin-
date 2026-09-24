#!/usr/bin/env node
/** Writes scratchpad/subject/figures.html so the five authored SVGs can be eyeballed. */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, "..", "..");
const DIR = path.join(ROOT, "packs", "maths", "content", "m7", "changing-the-subject-harder-formulae");
const blocks = JSON.parse(fs.readFileSync(path.join(DIR, "note.blocks.json"), "utf8"));
const bundle = JSON.parse(fs.readFileSync(path.join(DIR, "bundle.json"), "utf8"));

const cards = [];
for (const b of blocks) if (b.type === "figure") cards.push([b.alt.slice(0, 90), b.svg]);
for (const q of bundle.questions)
  for (const f of q.figures ?? [])
    if (f.kind === "svg") cards.push([`${q.id}: ${f.alt.slice(0, 80)}`, decodeURIComponent(f.src.replace(/^data:image\/svg\+xml;utf8,/, ""))]);

const html = `<!doctype html><meta charset="utf-8"><title>figures</title>
<style>body{font:14px system-ui;margin:24px;color:#16191d;background:#fff}
section{margin:0 0 28px;padding:14px;border:1px solid #ccd}
h2{font-size:13px;margin:0 0 10px;font-weight:600;color:#555}
svg{max-width:100%;height:auto}
.dark{background:#14171b;color:#e8eaed}</style>
${cards.map(([t, s]) => `<section><h2>${t.replace(/</g, "&lt;")}</h2>${s}</section>`).join("\n")}
<section class="dark"><h2>dark check</h2>${cards[1][1]}</section>`;

const out = path.join(HERE, "figures.html");
fs.writeFileSync(out, html);
console.log(`wrote ${out} with ${cards.length} figures`);
