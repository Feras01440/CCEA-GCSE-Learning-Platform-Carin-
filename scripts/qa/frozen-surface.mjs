#!/usr/bin/env node
/**
 * frozen-surface.mjs — the depth-pass guard (depth standard, 22 Sep 2026).
 *
 * A depth pass may add sections, worked examples, questions, mistakes and prompts, but every
 * published answer spec, scheme, id, common-error pattern and gate answer must stay byte-identical,
 * so a learner's ledger and the pre-reads' markAnswer results stay valid. This script hashes that
 * frozen surface so a pass can prove it.
 *
 *   node frozen-surface.mjs snapshot packs/<subject>/content/<unit>/<slug> > before.json
 *   node frozen-surface.mjs check    packs/<subject>/content/<unit>/<slug> before.json
 *
 * `check` prints every frozen field that changed or disappeared and exits 1 if any did; new ids
 * are listed as additions and are fine. Run from the repository root.
 */
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const [mode, dir, snapshotFile] = process.argv.slice(2);
if (!mode || !dir || (mode === "check" && !snapshotFile)) {
  console.error("usage: node frozen-surface.mjs snapshot <topic dir> | check <topic dir> <snapshot.json>");
  process.exit(2);
}

const stable = (v) => {
  if (Array.isArray(v)) return `[${v.map(stable).join(",")}]`;
  if (v && typeof v === "object") return `{${Object.keys(v).sort().map((k) => `${JSON.stringify(k)}:${stable(v[k])}`).join(",")}}`;
  return JSON.stringify(v);
};
const hash = (v) => crypto.createHash("sha256").update(stable(v)).digest("hex").slice(0, 16);

function surface(topicDir) {
  const b = JSON.parse(fs.readFileSync(path.join(topicDir, "bundle.json"), "utf8"));
  const notePath = path.join(topicDir, "note.blocks.json");
  const blocks = fs.existsSync(notePath) ? JSON.parse(fs.readFileSync(notePath, "utf8")) : [];
  const out = {};
  out[`topic ${b.topic.id}`] = hash({ id: b.topic.id, slug: b.topic.slug, statementIds: b.topic.statementIds });
  for (const q of b.questions) {
    out[`question ${q.id}`] = hash({
      totalMarks: q.totalMarks,
      skeleton: q.skeleton,
      methodLock: q.methodLock ?? null,
      parts: q.parts.map((p) => ({ id: p.id, marks: p.marks, answer: p.answer, scheme: p.scheme, commonErrors: p.commonErrors, followThrough: p.followThrough ?? null })),
    });
  }
  for (const d of b.diagnostics) {
    out[`diagnostics ${d.id}`] = hash({
      when: d.when,
      items: d.items.map((it) => ({ id: it.id, options: it.options.map((o) => ({ id: o.id, text: o.text, correct: o.correct, misconception: o.misconception ?? null })) })),
    });
  }
  for (const f of b.findTheMistake) out[`mistake ${f.id}`] = hash({ studentWorking: f.studentWorking, mistakeLine: f.mistakeLine, misconception: f.misconception });
  for (const p of b.prompts) out[`prompt ${p.id}`] = hash({ answer: p.answer, keyWords: p.keyWords ?? null });
  for (const we of b.workedExamples) {
    out[`example ${we.id}`] = hash({
      steps: we.steps.map((s) => ({ n: s.n, input: s.input ?? null, earns: s.earns ?? null })),
      faded: we.faded,
      twin: we.twin.answer,
    });
  }
  for (const g of blocks.filter((x) => x.type === "gate")) out[`gate ${g.id}`] = hash({ kind: g.kind, answer: g.answer });
  return out;
}

const now = surface(dir);
if (mode === "snapshot") {
  process.stdout.write(JSON.stringify(now, null, 2) + "\n");
  process.exit(0);
}
if (mode === "check") {
  const before = JSON.parse(fs.readFileSync(snapshotFile, "utf8"));
  let bad = 0;
  for (const [k, h] of Object.entries(before)) {
    if (!(k in now)) { console.log(`MISSING  ${k} (a published item was removed)`); bad += 1; }
    else if (now[k] !== h) { console.log(`CHANGED  ${k} (a frozen field differs)`); bad += 1; }
  }
  const added = Object.keys(now).filter((k) => !(k in before));
  for (const k of added) console.log(`added    ${k}`);
  console.log(`frozen-surface: ${Object.keys(before).length} frozen item(s) checked, ${bad} difference(s), ${added.length} addition(s).`);
  process.exit(bad ? 1 : 0);
}
console.error(`unknown mode "${mode}"`);
process.exit(2);
