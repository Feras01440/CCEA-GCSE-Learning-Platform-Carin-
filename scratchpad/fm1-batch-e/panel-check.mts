/**
 * FM1 batch E: lesson template v2 item 6, checked against the published notes.
 *
 *  - every teaching run between gates is at most 120 words, and the first figure comes before word 80
 *  - the closing "In the exam" panel is a pointer: one heading, one paragraph of at most 80 words,
 *    then the prompts; at most 150 words in all; no gate, no spec callout, no examiner callout inside it
 *  - at most one examiner callout stands in the teaching body
 *  - every examiner finding the topic cites is carried by a trap in bundle.note.sheet, naming its
 *    series and question, so the panel never has to repeat one
 */
import fs from "node:fs";
import { wordsBetweenGates } from "../../src/components/items/gates.ts";

type Block = Record<string, string | undefined> & { type: string };
const words = (s: string | undefined) => (s ?? "").split(/\s+/).filter(Boolean).length;
const findings: string[] = [];

const SERIES: Record<string, string> = { summer: "Summer", november: "November", march: "March", january: "January" };

for (const slug of ["curve-sketching-quadratic-cubic", "optimisation", "integration-as-inverse", "definite-integrals"]) {
  const dir = `packs/further-maths/content/fm1/${slug}`;
  const all: Block[] = JSON.parse(fs.readFileSync(`${dir}/note.blocks.json`, "utf8"));
  const bundle = JSON.parse(fs.readFileSync(`${dir}/bundle.json`, "utf8"));
  const body = all.filter((b) => b.type !== "hero");

  // 1. teaching runs and the first figure
  const runs = wordsBetweenGates(body as never);
  runs.slice(0, -1).forEach((n, i) => {
    if (n > 120) findings.push(`${slug}: teaching run ${i + 1} is ${n} words, over the 120-word limit`);
  });
  const firstFig = body.findIndex((b) => b.type === "figure");
  const beforeFig = body.slice(0, firstFig).reduce((n, b) => n + words(b.md ?? b.text), 0);
  if (beforeFig > 80) findings.push(`${slug}: the first figure comes after word ${beforeFig}, over the 80-word limit`);

  // 2. the closing panel
  const panelStart = body.findIndex((b) => b.type === "h" && /in the exam/i.test(b.text ?? ""));
  if (panelStart < 0) {
    findings.push(`${slug}: no "In the exam" heading found`);
    continue;
  }
  const panel = body.slice(panelStart);
  const panelWords = panel.reduce((n, b) => n + words(b.md ?? b.text), 0);
  const paragraphs = panel.filter((b) => b.type === "p");
  if (panelWords > 150) findings.push(`${slug}: the closing panel is ${panelWords} words, over the 150-word limit`);
  if (paragraphs.length !== 1) findings.push(`${slug}: the closing panel has ${paragraphs.length} paragraphs, and the template asks for one`);
  for (const p of paragraphs) if (words(p.md) > 80) findings.push(`${slug}: the panel paragraph is ${words(p.md)} words, over the 80-word limit`);
  for (const b of panel) {
    if (b.type === "gate") findings.push(`${slug}: a gate sits inside the closing panel`);
    if (b.type === "callout" && (b.kind === "examiner" || b.kind === "spec")) {
      findings.push(`${slug}: a ${b.kind} callout sits inside the closing panel; the Sheet and the Specification card carry those`);
    }
  }
  const order = panel.map((b) => b.type).join(",");
  if (!/^h,p(,prompt)*$/.test(order)) findings.push(`${slug}: the closing panel reads "${order}" and the template asks for a heading, a paragraph and then the prompts`);

  // 3. at most one examiner callout in the teaching body
  const bodyExaminer = body.slice(0, panelStart).filter((b) => b.type === "callout" && b.kind === "examiner");
  if (bodyExaminer.length > 1) findings.push(`${slug}: ${bodyExaminer.length} examiner callouts in the teaching body, and the template allows one`);

  // 4. every cited examiner finding is a Sheet trap naming its series and question
  const traps: string[] = bundle.note?.sheet?.traps ?? [];
  for (const src of bundle.topic.examinerSources as string[]) {
    const m = /^ccea-cer:[^:]+:(\d{4})-(\w+):(\w+):Q(\S+)$/.exec(src);
    if (!m) continue;
    const [, year, series, unit, q] = m;
    const label = `${SERIES[series] ?? series} ${year}`;
    const covered = traps.some((t) => t.includes(label) && new RegExp(`Q${q}\\b`).test(t));
    if (!covered) findings.push(`${slug}: examiner source ${src} is not carried by any trap in note.sheet.traps (want a trap naming "${label}" and "Q${q}")`);
  }

  console.log(
    `${slug} | gates ${body.filter((b) => b.type === "gate").length} | longest teaching run ${Math.max(...runs.slice(0, -1))} | first figure at word ${beforeFig} | panel ${panelWords} words, ${words(paragraphs[0]?.md)} in its paragraph | traps ${traps.length}`,
  );
}

if (findings.length === 0) console.log("\npanel-check: no findings");
else {
  console.log("");
  for (const f of findings) console.log("FINDING", f);
  process.exitCode = 1;
}
