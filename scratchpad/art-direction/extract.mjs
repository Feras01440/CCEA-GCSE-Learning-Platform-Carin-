import fs from "node:fs";

const file = process.argv[2];
const b = JSON.parse(fs.readFileSync(file, "utf8"));

const out = {};
out.topLevelKeys = Object.keys(b);
out.id = b.id;
out.title = b.title;
out.subject = b.subject;
out.unit = b.unit;
if (b.note) {
  out.noteKeys = Object.keys(b.note);
  out.hero = b.note.hero;
  const blocks = b.note.blocks ?? b.note.body ?? [];
  out.blockCount = Array.isArray(blocks) ? blocks.length : "n/a";
  out.blockKinds = Array.isArray(blocks) ? blocks.map((x) => x.kind ?? x.type).slice(0, 40) : [];
  out.firstBlocks = Array.isArray(blocks) ? blocks.slice(0, 12) : [];
  if (b.note.sheet) out.sheetKeys = Object.keys(b.note.sheet);
}
if (b.questions) {
  out.questionCount = b.questions.length;
  out.firstQuestion = b.questions[0];
}
if (b.diagnostics) {
  out.diagnosticCount = b.diagnostics.length;
  out.firstDiagnostic = b.diagnostics[0];
}
console.log(JSON.stringify(out, null, 2));
