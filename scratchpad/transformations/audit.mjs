/** Final audit of the written files, read back from disk. */
import fs from "node:fs";
import path from "node:path";

const dir = path.resolve(
  import.meta.dirname,
  "../../packs/maths/content/m7/combined-transformations-and-reflections-in-y-equals-plus-or-minus-x",
);
const bFile = path.join(dir, "bundle.json");
const nFile = path.join(dir, "note.blocks.json");
const raw = fs.readFileSync(bFile, "utf8");
const rawNote = fs.readFileSync(nFile, "utf8");
const bundle = JSON.parse(raw);
const blocks = JSON.parse(rawNote);

console.log(`bundle.json   ${(raw.length / 1024).toFixed(1)} KB  mtime ${fs.statSync(bFile).mtime.toISOString()}`);
console.log(`note.blocks   ${(rawNote.length / 1024).toFixed(1)} KB  mtime ${fs.statSync(nFile).mtime.toISOString()}`);
console.log(`topic.id      ${bundle.topic.id}`);
console.log(
  `counts        we ${bundle.workedExamples.length} · dx ${bundle.diagnostics[0].items.length} · q ${bundle.questions.length} · ftm ${bundle.findTheMistake.length} · rp ${bundle.prompts.length} · sets ${bundle.sets.length} · ver ${bundle.verification.length}`,
);

// Examiner source unit codes
const srcs = new Set();
JSON.stringify(bundle).replace(/ccea-cer:[a-z-]+:\d{4}-[a-z]+:([A-Za-z0-9]+):Q[^"]*/g, (m, unit) => srcs.add(unit));
console.log(`unit codes    ${[...srcs].sort().join(", ")}`);

// Insight card identical to the registry copy
const card = JSON.parse(fs.readFileSync(path.join(dir, "..", "..", "..", "insights", `m7.${bundle.topic.slug}.json`), "utf8"));
console.log(`insight card  ${JSON.stringify(card) === JSON.stringify(bundle.insight) ? "identical to packs/maths/insights copy" : "DIFFERS from the registry copy"}`);

// SVG hygiene
const svgs = [];
blocks.filter((b) => b.type === "figure").forEach((b) => svgs.push(["note", b.svg]));
for (const we of bundle.workedExamples) {
  if (we.figure) svgs.push([we.id, decodeURIComponent(we.figure.src.replace(/^data:image\/svg\+xml;utf8,/, ""))]);
  if (we.twin.figure) svgs.push([`${we.id} twin`, decodeURIComponent(we.twin.figure.src.replace(/^data:image\/svg\+xml;utf8,/, ""))]);
}
for (const q of bundle.questions) {
  for (const f of q.figures) svgs.push([q.id, decodeURIComponent(f.src.replace(/^data:image\/svg\+xml;utf8,/, ""))]);
}
const bad = svgs.filter(([, s]) => /<style|<script|\son[a-z]+=|href=|prefers-color-scheme/i.test(s));
const noViewBox = svgs.filter(([, s]) => !/viewBox=/.test(s));
const noCurrentColor = svgs.filter(([, s]) => !/currentColor/.test(s));
const tooBig = svgs.filter(([, s]) => s.length > 12000);
console.log(
  `svg           ${svgs.length} figures; style/script/href ${bad.length}; missing viewBox ${noViewBox.length}; missing currentColor ${noCurrentColor.length}; over 12 KB ${tooBig.length}; largest ${Math.max(...svgs.map(([, s]) => s.length))} bytes`,
);

// Answer kinds
const kinds = {};
for (const q of bundle.questions) for (const p of q.parts) kinds[p.answer.kind] = (kinds[p.answer.kind] ?? 0) + 1;
console.log(`answer kinds  ${Object.entries(kinds).map(([k, v]) => `${k} ${v}`).join(", ")}`);
const plots = bundle.questions.flatMap((q) => q.parts).filter((p) => p.answer.kind === "graph" && p.answer.expect.plot === "transformation").length;
console.log(`graph specs   ${plots} with plot "transformation"`);

// Marks and video
console.log(`total marks   ${bundle.questions.reduce((a, q) => a + q.totalMarks, 0)} across ${bundle.questions.length} questions (${bundle.questions.filter((q) => q.style === "exam-style").length} exam-style)`);
const video = blocks.find((b) => b.type === "video");
console.log(`video         ${video ? `${video.videoId} (${video.title}, Corbettmaths ${video.corbettmathsNumber})` : "none"}`);
console.log(`note blocks   ${blocks.length}: ${["h", "p", "callout", "figure", "gate", "video", "prompt"].map((t) => `${t} ${blocks.filter((b) => b.type === t).length}`).join(", ")}`);

// Misconceptions used
const used = new Set();
JSON.stringify(bundle).replace(/"misconception":"([^"]+)"/g, (m, x) => used.add(x));
console.log(`misconception ids used (${used.size}): ${[...used].sort().join(", ")}`);
