/**
 * Lists every inline maths segment that breaks the depth standard's long-maths rule, with where it
 * sits: over 60 characters of TeX (spaces removed), a \dfrac over 40, or a number list inside maths.
 * Mirrors mathsIssues() in scripts/qa/lesson-v2.mjs, over the same strings, and says which of them
 * are frozen by the depth-pass guard (diagnostic options, find-the-mistake working).
 *   node scratchpad/fm3-batch-c/long-maths.mjs <slug> [<slug> …]
 */
import fs from "node:fs";
import path from "node:path";

const ROOT = "C:/Users/feras/Downloads/CCEA GCSE Top Learning Platform";

export function segmentIssues(s) {
  const out = [];
  for (const m of String(s ?? "").matchAll(/\$(?!\$)([^$]+)\$/g)) {
    const tex = m[1];
    const compact = tex.replace(/\s+/g, "");
    if (compact.length > 60) out.push({ why: `long ${compact.length}`, tex });
    if (/(?:-?\d+(?:\.\d+)?\s*,\s*){5,}/.test(tex)) out.push({ why: "number list", tex });
    for (const f of tex.matchAll(/\\[dt]?frac\{/g)) {
      let i = f.index + f[0].length - 1;
      let depth = 0;
      let inner = 0;
      let groups = 0;
      for (; i < tex.length && groups < 2; i += 1) {
        const ch = tex[i];
        if (ch === "{") depth += 1;
        else if (ch === "}") {
          depth -= 1;
          if (depth === 0) groups += 1;
        } else if (depth > 0 && !/\s/.test(ch)) inner += 1;
      }
      if (groups === 2 && inner > 40) out.push({ why: `dfrac ${inner}`, tex });
    }
  }
  return out;
}

function everyString(block) {
  const out = [];
  if (block.type === "hero") out.push(block.lede, ...(block.can ?? []));
  if (block.type === "p" || block.type === "callout") out.push(block.md, block.title);
  if (block.type === "h") out.push(block.text);
  if (block.type === "gate") out.push(block.prompt, block.explain, ...(block.options ?? []));
  if (block.caption) out.push(block.caption);
  if (block.alt) out.push(block.alt);
  if (block.type === "video") out.push(block.title, block.why);
  if (block.type === "sim") out.push(block.title, block.task);
  return out.filter(Boolean);
}

/** [{where, text, frozen}] over exactly the strings lesson-v2 measures. */
export function measuredStrings(blocks, bundle) {
  const out = [];
  blocks.forEach((b, i) => everyString(b).forEach((s) => out.push({ where: `note#${i} ${b.type}${b.id ? " " + b.id : ""}`, text: s, frozen: false })));
  for (const q of bundle.questions)
    for (const p of q.parts) {
      out.push({ where: `${q.id} (${p.id}) stem`, text: p.stem, frozen: false });
      out.push({ where: `${q.id} (${p.id}) workedSolution`, text: p.workedSolution, frozen: false });
      (p.hints ?? []).forEach((h, k) => out.push({ where: `${q.id} (${p.id}) hint ${k + 1}`, text: h, frozen: false }));
    }
  for (const we of bundle.workedExamples) {
    out.push({ where: `${we.id} stem`, text: we.stem, frozen: false });
    out.push({ where: `${we.id} twin stem`, text: we.twin?.stem, frozen: false });
    we.steps.forEach((s) => out.push({ where: `${we.id} step ${s.n} working`, text: s.working, frozen: false }));
  }
  for (const d of bundle.diagnostics)
    for (const it of d.items) {
      out.push({ where: `${d.id}/${it.id} stem`, text: it.stem, frozen: false });
      it.options.forEach((o) => out.push({ where: `${d.id}/${it.id} option ${o.id}`, text: o.text, frozen: true }));
    }
  for (const f of bundle.findTheMistake) {
    out.push({ where: `${f.id} stem`, text: f.stem, frozen: false });
    f.studentWorking.forEach((l, k) => out.push({ where: `${f.id} working line ${k + 1}`, text: l, frozen: true }));
    f.correction.forEach((l, k) => out.push({ where: `${f.id} correction ${k + 1}`, text: l, frozen: false }));
  }
  return out.filter((x) => x.text);
}

if (process.argv[1] && process.argv[1].endsWith("long-maths.mjs")) {
  for (const slug of process.argv.slice(2)) {
    const dir = path.join(ROOT, "packs/further-maths/content/fm3", slug);
    const bundle = JSON.parse(fs.readFileSync(path.join(dir, "bundle.json"), "utf8"));
    const blocks = JSON.parse(fs.readFileSync(path.join(dir, "note.blocks.json"), "utf8"));
    let n = 0;
    for (const s of measuredStrings(blocks, bundle))
      for (const issue of segmentIssues(s.text)) {
        n += 1;
        console.log(`${slug}  ${s.where}${s.frozen ? "  [FROZEN]" : ""}  ${issue.why}: ${issue.tex}`);
      }
    console.log(`${slug}: ${n} long-maths issue(s)`);
  }
}
