/**
 * Freeze / compare every answer spec and common-error pattern of the published topics.
 * The shingle pass rewords stems and prose only, so these must come out byte-identical.
 *
 *   node scratchpad/fm1-batch-g/specs-frozen.mjs save   <slug…>
 *   node scratchpad/fm1-batch-g/specs-frozen.mjs check  <slug…>
 */
import fs from "node:fs";
import path from "node:path";

const mode = process.argv[2];
const slugs = process.argv.slice(3);
const STORE = "scratchpad/fm1-batch-g/specs-frozen.json";

/** The parts of a bundle the shingle pass must not touch, keyed by item and part id. */
function fingerprint(slug) {
  const b = JSON.parse(fs.readFileSync(path.join("packs/further-maths/content/fm1", slug, "bundle.json"), "utf8"));
  const out = {};
  for (const q of b.questions) {
    for (const p of q.parts) {
      out[`${q.id}(${p.id})`] = JSON.stringify({ answer: p.answer, commonErrors: p.commonErrors, marks: p.marks });
    }
  }
  for (const we of b.workedExamples) out[`${we.id}.twin`] = JSON.stringify(we.twin.answer);
  for (const d of b.diagnostics) {
    for (const item of d.items) out[`${d.id}/${item.id}`] = JSON.stringify(item.options.map((o) => [o.id, o.text, o.correct, o.misconception ?? null]));
  }
  return out;
}

const now = Object.fromEntries(slugs.map((s) => [s, fingerprint(s)]));

if (mode === "save") {
  fs.writeFileSync(STORE, `${JSON.stringify(now, null, 2)}\n`);
  const n = Object.values(now).reduce((a, o) => a + Object.keys(o).length, 0);
  console.log(`frozen: ${n} specs across ${slugs.length} topic(s) -> ${STORE}`);
} else {
  const before = JSON.parse(fs.readFileSync(STORE, "utf8"));
  let checked = 0;
  const findings = [];
  for (const slug of slugs) {
    const a = before[slug] ?? {};
    const b = now[slug] ?? {};
    for (const k of new Set([...Object.keys(a), ...Object.keys(b)])) {
      checked++;
      if (a[k] === undefined) findings.push(`${slug} ${k}: appeared`);
      else if (b[k] === undefined) findings.push(`${slug} ${k}: disappeared`);
      else if (a[k] !== b[k]) findings.push(`${slug} ${k}: CHANGED\n    was ${a[k].slice(0, 160)}\n    now ${b[k].slice(0, 160)}`);
    }
  }
  console.log(`specs-frozen: ${checked} specs compared`);
  if (findings.length === 0) console.log("every answer spec, common-error pattern and option set is byte-identical");
  else {
    for (const f of findings) console.log("FINDING", f);
    process.exitCode = 1;
  }
}
