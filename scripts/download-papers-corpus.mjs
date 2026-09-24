// Downloads the Standard CCEA past papers + mark schemes listed in data/papers/index.json
// into docs/sources/papers/<subject>/<session>/ for PRIVATE, personal-use analysis only
// (CCEA terms permit personal download; never re-host or publish these files).
// Polite: browser UA, one request at a time, 2.5 s delay, resumable (skips existing files).
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const index = JSON.parse(fs.readFileSync(path.join(ROOT, "data/papers/index.json"), "utf8"));
const OUT = path.join(ROOT, "docs/sources/papers");
const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0 Safari/537.36";
const DELAY_MS = 2500;
const only = process.argv[2]; // optional subject filter

const items = index.papers.filter((p) => p.type === "Standard" && !p.duplicateOf && (!only || p.subject === only));
console.log(`${items.length} files to fetch`);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function fileName(p) {
  const bits = [p.unit];
  if (p.tier) bits.push(p.tier);
  if (p.paperNumber) bits.push("P" + p.paperNumber);
  if (p.discipline) bits.push(p.discipline);
  if (p.booklet) bits.push("Bk" + p.booklet);
  bits.push(p.kind === "ms" ? "MS" : "Paper");
  bits.push(p.id);
  return bits.join("-") + ".pdf";
}

let done = 0, skipped = 0, failed = 0;
for (const p of items) {
  const dir = path.join(OUT, p.subject, p.sessionKey);
  fs.mkdirSync(dir, { recursive: true });
  const pdf = path.join(dir, fileName(p));
  const txt = pdf.replace(/\.pdf$/, ".txt");
  if (fs.existsSync(pdf) && fs.statSync(pdf).size > 10_000) {
    skipped++;
  } else {
    try {
      const res = await fetch(p.url, { headers: { "User-Agent": UA, Accept: "application/pdf,*/*" } });
      if (!res.ok) throw new Error("HTTP " + res.status);
      const buf = Buffer.from(await res.arrayBuffer());
      if (buf.subarray(0, 4).toString() !== "%PDF") throw new Error("not a PDF");
      fs.writeFileSync(pdf, buf);
      done++;
      console.log(`ok   ${p.subject}/${p.sessionKey}/${path.basename(pdf)} (${(buf.length / 1024).toFixed(0)} KB)`);
    } catch (e) {
      failed++;
      console.log(`FAIL ${p.subject}/${p.sessionKey}/${path.basename(pdf)}: ${e.message} :: ${p.url}`);
      await sleep(DELAY_MS);
      continue;
    }
    await sleep(DELAY_MS);
  }
  if (fs.existsSync(pdf) && !fs.existsSync(txt)) {
    try { execFileSync("pdftotext", ["-layout", pdf, txt], { stdio: "ignore" }); } catch { /* keep going */ }
  }
}
console.log(`DONE downloaded=${done} skipped=${skipped} failed=${failed}`);
