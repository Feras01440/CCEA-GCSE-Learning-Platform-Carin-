/**
 * Marks every text part of 2+ marks with its own worked solution as the answer and lists the parts whose
 * key words do not cover their solution's phrasing (the marker would under-award a learner who wrote the
 * solution's words). Authors extend the groups from the list; the brief's rule is "key words must cover the
 * worked solution".
 *
 * Run: npx tsx scripts/qa/text-parts-vs-solutions.mts   → docs/dev/qa/text-parts-vs-worked-solutions.md
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { markAnswer } from "../../src/components/items/mark.ts";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
const PACKS = path.join(ROOT, "packs");
const OUT = path.join(ROOT, "docs", "dev", "qa", "text-parts-vs-worked-solutions.md");

const walk = (d: string, o: string[] = []): string[] => {
  for (const e of fs.readdirSync(d, { withFileTypes: true })) {
    const p = path.join(d, e.name);
    if (e.isDirectory()) walk(p, o);
    else if (e.name === "bundle.json") o.push(p);
  }
  return o;
};

interface Row {
  bundle: string;
  id: string;
  part: string;
  marks: number;
  earned: number;
  groups: string;
  missing: string;
  solution: string;
}

const rows: Row[] = [];
let parts = 0;
for (const f of walk(PACKS).sort()) {
  const b = JSON.parse(fs.readFileSync(f, "utf8"));
  for (const q of b.questions ?? []) {
    for (const p of q.parts ?? []) {
      if (p.answer?.kind !== "text" || p.marks < 2) continue;
      parts++;
      const sol = markAnswer(String(p.workedSolution ?? ""), p.answer, { marks: p.marks, commonErrors: p.commonErrors, prompt: p.stem });
      if (sol.correct) continue;
      const groups = (p.answer.keyWords ?? [])
        .map((g: { any: string[] }) => `[${g.any.slice(0, 3).join(" / ")}${g.any.length > 3 ? " / …" : ""}]`)
        .join(" ");
      rows.push({
        bundle: path.relative(PACKS, path.dirname(f)).split(path.sep).join("/"),
        id: q.id,
        part: p.id,
        marks: p.marks,
        earned: sol.marksAwarded,
        groups,
        missing: sol.explanation.replace(/\s+/g, " ").slice(0, 120),
        solution: String(p.workedSolution).replace(/\s+/g, " ").slice(0, 160),
      });
    }
  }
}

const cell = (s: string): string => s.replace(/\|/g, "∣");
const zero = rows.filter((r) => r.earned === 0);
const partial = rows.filter((r) => r.earned > 0);
const lines: string[] = [];
lines.push(`# Key-word marker versus each part's own worked solution — ${new Date().toISOString().slice(0, 16).replace("T", " ")}`);
lines.push("");
lines.push(
  `Every text part of 2+ marks (${parts} across the packs) was marked with its own workedSolution as the answer. ${parts - rows.length} earn full marks; ${partial.length} earn some; ${zero.length} earn none. Fix rule (pipeline/prompts/author-topic.md): every key-word group must include the phrasing the worked solution uses, and "explain" groups accept the reasoning words as well as the number. Rerun: \`npx tsx scripts/qa/text-parts-vs-solutions.mts\`.`,
);
lines.push("");
for (const [title, list] of [
  ["Zero marks", zero],
  ["Partial marks", partial],
] as const) {
  lines.push(`## ${title} (${list.length})`);
  lines.push("");
  lines.push("| Bundle | Item | Part | Earned | Key-word groups | Marker said | Worked solution (start) |");
  lines.push("|---|---|---|---|---|---|---|");
  for (const r of list) lines.push(`| ${r.bundle} | ${r.id.split(".").pop()} | ${r.part} | ${r.earned}/${r.marks} | ${cell(r.groups)} | ${cell(r.missing)} | ${cell(r.solution)} |`);
  lines.push("");
}
fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, lines.join("\n"));
console.log(`${path.relative(ROOT, OUT)}: ${zero.length} zero, ${partial.length} partial of ${parts} text parts`);
