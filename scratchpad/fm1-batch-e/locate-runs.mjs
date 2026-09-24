/**
 * Where does each breached run live? Prints the JSON path and the whole string, so a rewording
 * can be written against the real wording rather than guessed.
 */
import fs from "node:fs";

const NOT_PROSE = new Set([
  "svg", "src", "regex", "id", "url", "videoId", "misconception", "verification", "itemId", "source",
  "solutionProgram", "kind", "type", "status", "tool", "at", "by", "licence", "licenceUrl", "sourceUrl",
  "attribution", "credit", "$schema", "slug", "subject", "unit", "tier", "code", "promptId",
  "generatedAt", "version", "updated", "rubricId", "registryId", "paperId", "textHash",
]);
const words = (s) => s.replace(/\\[a-zA-Z]+/g, " ").replace(/[^A-Za-z0-9\s]/g, " ").toLowerCase().split(/\s+/).filter(Boolean);

function walk(node, key, pathStr, out) {
  if (typeof node === "string") {
    if (!NOT_PROSE.has(key)) out.push({ path: pathStr, text: node });
    return;
  }
  if (Array.isArray(node)) return node.forEach((v, i) => walk(v, key, `${pathStr}[${i}]`, out));
  if (node && typeof node === "object") for (const [k, v] of Object.entries(node)) walk(v, k, `${pathStr}.${k}`, out);
}

const breaches = JSON.parse(fs.readFileSync("scratchpad/fm1-batch-e/ab-breaches.json", "utf8")).breaches;
const bySlug = {};
for (const b of breaches) (bySlug[b.slug] ??= []).push(b);

for (const [slug, list] of Object.entries(bySlug)) {
  console.log(`\n================ ${slug}`);
  const seen = new Map();
  for (const file of ["bundle.json", "note.blocks.json"]) {
    const f = `packs/further-maths/content/fm1/${slug}/${file}`;
    if (!fs.existsSync(f)) continue;
    const out = [];
    walk(JSON.parse(fs.readFileSync(f, "utf8")), "", file, out);
    for (const b of list) {
      for (const { path: p, text } of out) {
        const w = words(text);
        const n = b.sequence.split(" ").length;
        let found = false;
        for (let i = 0; i + n <= w.length; i++) if (w.slice(i, i + n).join(" ") === b.sequence) { found = true; break; }
        if (!found) continue;
        const key = `${p}|${text}`;
        if (!seen.has(key)) {
          seen.set(key, true);
          console.log(`\n  ${p}   [${b.kind}]`);
          console.log(`    ${text.replace(/\n/g, "\n    ")}`);
        }
        break;
      }
    }
  }
}
