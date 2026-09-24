/** Why did a given run classify as stock? Prints its sentence and the phrase that overlaps it. */
import fs from "node:fs";
import path from "node:path";

const RUN = process.argv.slice(2).join(" ") || "diabetes is a condition in which the blood";
const FILE = "packs/science/content/b1/b1-blood-glucose-diabetes/note.blocks.json";
const N = RUN.split(" ").length;

const NOT_PROSE = new Set([
  "svg", "src", "regex", "id", "url", "videoId", "misconception", "verification", "itemId", "source",
  "solutionProgram", "kind", "type", "status", "tool", "at", "by", "licence", "licenceUrl", "sourceUrl",
  "attribution", "credit", "$schema", "slug", "subject", "unit", "tier", "code", "promptId",
  "generatedAt", "version", "updated", "rubricId", "registryId", "paperId", "textHash",
]);
const words = (s) => s.replace(/\\[a-zA-Z]+/g, " ").replace(/[^A-Za-z0-9\s]/g, " ").toLowerCase().split(/\s+/).filter(Boolean);
function collect(node, out, key) {
  if (typeof node === "string") { if (!NOT_PROSE.has(key)) out.push(node); return; }
  if (Array.isArray(node)) return node.forEach((v) => collect(v, out, key));
  if (node && typeof node === "object") for (const [k, v] of Object.entries(node)) collect(v, out, k);
}

const STANDING = [
  "give your answer", "give your answers", "correct to", "decimal place", "decimal places",
  "significant figure", "significant figures", "you must show", "in this question you will be assessed",
  "quality of your written communication", "use the formula", "the diagram shows", "the table shows",
  "not drawn to scale", "you may use", "write down", "show that", "hence", "or otherwise",
];
const phrases = new Set(STANDING.map((p) => words(p).join(" ")));
for (const subject of fs.readdirSync("packs")) {
  const cw = path.join("packs", subject, "exam-true", "command-words.json");
  if (!fs.existsSync(cw)) continue;
  for (const w of JSON.parse(fs.readFileSync(cw, "utf8")).words ?? []) {
    if (w.kind === "question-stem") continue;
    for (const t of [w.word, ...(w.aliases ?? [])]) {
      const n = words(String(t)).join(" ");
      if (n) phrases.add(n);
    }
  }
}

const strings = [];
collect(JSON.parse(fs.readFileSync(FILE, "utf8")), strings, "");
let found = false;
for (const s of strings) {
  const w = words(s);
  for (let i = 0; i + N <= w.length; i++) {
    if (w.slice(i, i + N).join(" ") !== RUN) continue;
    found = true;
    console.log(`sentence: "${w.join(" ")}"`);
    console.log(`run at ${i}..${i + N}`);
    for (const p of phrases) {
      const ph = p.split(" ");
      for (let k = 0; k + ph.length <= w.length; k++) {
        if (ph.every((x, d) => w[k + d] === x) && k < i + N && k + ph.length > i) {
          console.log(`  OVERLAPPING PHRASE "${p}" at ${k}..${k + ph.length}`);
        }
      }
    }
    break;
  }
  if (found) break;
}
if (!found) console.log("run not found in that file");
