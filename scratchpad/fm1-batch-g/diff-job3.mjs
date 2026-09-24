/**
 * 23 Sep (job 3): what the re-emit changed in each of the eight topics, against the backups taken before the job
 * (scratchpad/fm1-batch-g/bak-0923-logs/<slug>/). Content is deep-diffed path by path; the verification array is
 * compared entry by entry (added ids, removed ids, entries whose checks changed, and which fields changed).
 *   node scratchpad/fm1-batch-g/diff-job3.mjs            (cwd = the project root)
 */
import fs from "node:fs";
import path from "node:path";

// Jobs 4 and 5 reuse it: node scratchpad/fm1-batch-g/diff-job3.mjs --bak scratchpad/fm1-batch-g/bak-0923-job45 <slug...>
const args = process.argv.slice(2);
const bakAt = args.indexOf("--bak");
const BAK_DIR = bakAt >= 0 ? args[bakAt + 1] : "scratchpad/fm1-batch-g/bak-0923-logs";
const named = args.filter((a, i) => a !== "--bak" && i !== bakAt + 1);
const SLUGS = named.length ? named : [
  "area-under-curve", "indicial-equations", "log-log-graphs", "logarithms-from-indices",
  "matrix-arithmetic", "matrix-inverse-2x2", "matrix-equations", "matrix-simultaneous-equations",
];
const PACK = (slug, file) => path.join("packs/further-maths/content/fm1", slug, file);
const BAK = (slug, file) => path.join(BAK_DIR, slug, file);
const read = (f) => JSON.parse(fs.readFileSync(f, "utf8"));
const short = (v) => {
  const s = JSON.stringify(v);
  return s === undefined ? "(absent)" : s.length > 160 ? s.slice(0, 157) + "..." : s;
};

function diff(a, b, at, out) {
  if (JSON.stringify(a) === JSON.stringify(b)) return;
  const bothObjects = a && b && typeof a === "object" && typeof b === "object" && Array.isArray(a) === Array.isArray(b);
  if (!bothObjects) {
    out.push(`${at}: ${short(a)} -> ${short(b)}`);
    return;
  }
  const keys = new Set([...Object.keys(a), ...Object.keys(b)]);
  for (const k of keys) diff(a[k], b[k], Array.isArray(a) ? `${at}[${k}]` : `${at}.${k}`, out);
}

let unexpected = 0;
for (const slug of SLUGS) {
  const before = read(BAK(slug, "bundle.json"));
  const after = read(PACK(slug, "bundle.json"));
  const noteBefore = fs.readFileSync(BAK(slug, "note.blocks.json"), "utf8");
  const noteAfter = fs.readFileSync(PACK(slug, "note.blocks.json"), "utf8");
  console.log(`\n== ${slug}`);
  console.log(`  note.blocks.json ${noteBefore === noteAfter ? "byte-identical" : "CHANGED"}`);
  if (noteBefore !== noteAfter) unexpected++;

  const content = [];
  const { verification: vb, ...cb } = before;
  const { verification: va, ...ca } = after;
  diff(cb, ca, "bundle", content);
  console.log(`  content paths changed: ${content.length}`);
  for (const line of content) console.log(`    ${line}`);

  const byId = (list) => new Map(list.map((v) => [v.id, v]));
  const mb = byId(vb);
  const ma = byId(va);
  const added = [...ma.keys()].filter((id) => !mb.has(id));
  const removed = [...mb.keys()].filter((id) => !ma.has(id));
  const changed = [];
  for (const [id, v] of mb) {
    if (!ma.has(id)) continue;
    const d = [];
    diff(v, ma.get(id), id, d);
    if (d.length) changed.push(d);
  }
  console.log(`  verification: ${vb.length} -> ${va.length} entries; added ${added.length}, removed ${removed.length}, changed ${changed.length}`);
  if (removed.length) {
    unexpected++;
    console.log(`    REMOVED: ${removed.join(", ")}`);
  }
  const fieldsChanged = new Set();
  for (const d of changed) for (const line of d) fieldsChanged.add(line.replace(/^[^.]*\./, "").replace(/\[\d+\]/g, "[]").split(":")[0]);
  if (fieldsChanged.size) console.log(`    fields changed in existing entries: ${[...fieldsChanged].join(", ")}`);
  console.log(`    added: ${added.join(", ")}`);
}
console.log(`\n${unexpected ? `${unexpected} unexpected change(s)` : "no removed logs; every note byte-identical"}`);
process.exit(unexpected ? 1 : 0);
