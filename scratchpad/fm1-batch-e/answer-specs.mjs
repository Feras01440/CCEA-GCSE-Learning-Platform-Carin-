/**
 * Snapshot of everything that is not the note, so a notes-only change can be proved to be one.
 * `node answer-specs.mjs save` writes the snapshot; `node answer-specs.mjs check` compares.
 */
import fs from "node:fs";
import crypto from "node:crypto";

const SLUGS = ["curve-sketching-quadratic-cubic", "optimisation", "integration-as-inverse", "definite-integrals"];
const SNAP = "scratchpad/fm1-batch-e/answer-specs.snapshot.json";

const specs = () => {
  const out = {};
  for (const slug of SLUGS) {
    const file = `packs/further-maths/content/fm1/${slug}/bundle.json`;
    const raw = fs.readFileSync(file, "utf8");
    const b = JSON.parse(raw);
    const answers = [];
    const walk = (node, where) => {
      if (Array.isArray(node)) return node.forEach((v, i) => walk(v, `${where}[${i}]`));
      if (!node || typeof node !== "object") return;
      if (node.answer && typeof node.answer === "object") answers.push([where, JSON.stringify(node.answer)]);
      if (node.expect && typeof node.expect === "object") answers.push([`${where}.expect`, JSON.stringify(node.expect)]);
      for (const [k, v] of Object.entries(node)) walk(v, `${where}.${k}`);
    };
    walk(b, slug);
    out[slug] = {
      bundleSha: crypto.createHash("sha256").update(raw).digest("hex"),
      answerCount: answers.length,
      answerSha: crypto.createHash("sha256").update(answers.map((a) => a.join("=")).join("\n")).digest("hex"),
      answers: Object.fromEntries(answers),
    };
  }
  return out;
};

const mode = process.argv[2] ?? "check";
const now = specs();
if (mode === "save") {
  fs.writeFileSync(SNAP, JSON.stringify(now, null, 2) + "\n");
  for (const s of SLUGS) console.log(`saved ${s}: ${now[s].answerCount} answer specs, bundle ${now[s].bundleSha.slice(0, 16)}`);
} else {
  const was = JSON.parse(fs.readFileSync(SNAP, "utf8"));
  let bad = 0;
  for (const s of SLUGS) {
    const a = was[s], b = now[s];
    if (a.answerSha !== b.answerSha || a.answerCount !== b.answerCount) {
      bad++;
      console.log(`FINDING ${s}: the answer specs changed (${a.answerCount} -> ${b.answerCount} specs)`);
      for (const k of new Set([...Object.keys(a.answers), ...Object.keys(b.answers)]))
        if (a.answers[k] !== b.answers[k]) console.log(`  ${k}\n    was ${a.answers[k]}\n    now ${b.answers[k]}`);
    } else {
      console.log(`${s}: ${b.answerCount} answer specs byte-identical${a.bundleSha === b.bundleSha ? "; the whole bundle.json is byte-identical too" : "; bundle.json differs outside the answer specs"}`);
    }
  }
  if (bad) process.exitCode = 1;
}
