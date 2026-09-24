/**
 * The defect classes of fm1-g-matrices-1.md, scanned across the four matrix bundles (22 Sep).
 *   node scratchpad/fm1-batch-g/scan-defect-classes.mjs [slug…]
 *
 * Automatic (prints FLAG):
 *   shape   a matrix commonError whose pattern is not the answer field's rows x cols (the grid can never submit it)
 *   earns   a worked-example step code, or a find-the-mistake earned code, that no scheme in the bundle carries
 *   tariff  a worked example whose twin tariff (count of earns) differs from every question part with the same scheme ids
 *   3x3     a "3 × 3" outside notOnThisSpec
 * Listed for a line-by-line read (prints LIST):
 *   every misconception-tagged option / commonError with its text and feedback
 *   every text part with its key-word groups
 *   every find-the-mistake with its earned codes and the scheme of the question it mirrors
 */
import fs from "node:fs";

const slugs = process.argv.slice(2).length
  ? process.argv.slice(2)
  : ["matrix-arithmetic", "matrix-inverse-2x2", "matrix-equations", "matrix-simultaneous-equations"];

let flags = 0;
const flag = (s) => { flags++; console.log(`FLAG ${s}`); };

for (const slug of slugs) {
  const b = JSON.parse(fs.readFileSync(`packs/further-maths/content/fm1/${slug}/bundle.json`, "utf8"));
  const note = JSON.parse(fs.readFileSync(`packs/further-maths/content/fm1/${slug}/note.blocks.json`, "utf8"));
  console.log(`\n==================== ${slug}`);
  const schemeCodes = new Set();
  const partSchemes = [];
  for (const q of b.questions) for (const p of q.parts) {
    for (const s of p.scheme ?? []) schemeCodes.add(s.id);
    partSchemes.push({ where: `${q.id}(${p.id})`, ids: (p.scheme ?? []).map((s) => s.id).join(","), marks: p.marks, stem: p.stem });
  }

  // shape
  for (const q of b.questions) for (const p of q.parts) {
    if (p.answer.kind !== "matrix") continue;
    for (const e of p.commonErrors ?? []) {
      if (e.pattern.kind !== "matrix") continue;
      const r = e.pattern.entries.length;
      const c = e.pattern.entries[0].length;
      if (r !== p.answer.rows || c !== p.answer.cols) flag(`shape ${q.id}(${p.id}) pattern ${r}x${c} on a ${p.answer.rows}x${p.answer.cols} field (${e.misconception})`);
    }
  }
  for (const we of b.workedExamples) {
    const t = we.twin.answer;
    // twin commonErrors are not authored, nothing to check
    const codes = we.steps.flatMap((s) => s.earns ?? []);
    for (const c of codes) if (!schemeCodes.has(c)) flag(`earns ${we.id} step code ${c} appears in no scheme of this bundle`);
    const tariff = codes.length || 1;
    const same = partSchemes.filter((p) => p.ids === codes.join(","));
    console.log(`LIST we ${we.id}: earns ${codes.join(",")} -> twin out of ${tariff}; twin "${we.twin.stem.slice(0, 70)}"; parts with the same scheme ids: ${same.map((p) => `${p.where}[${p.marks}]`).join(" ") || "none"}`);
    if (same.length === 0) flag(`tariff ${we.id} earns ${codes.join(",")} match no question part's scheme ids; check the twin's tariff by hand`);
    else if (same.some((p) => p.marks !== tariff)) flag(`tariff ${we.id} twin out of ${tariff} but a part with the same scheme is ${same.map((p) => p.marks).join("/")}`);
  }
  for (const f of b.findTheMistake ?? []) {
    for (const c of f.marksEarnedAsWritten ?? []) if (!schemeCodes.has(c)) flag(`earns ${f.id} marksEarnedAsWritten ${c} appears in no scheme of this bundle`);
    console.log(`LIST ftm ${f.id}: earned ${JSON.stringify(f.marksEarnedAsWritten)}; task "${String(f.task ?? f.stem ?? "").slice(0, 90)}"`);
    console.log(`     working: ${JSON.stringify(f.studentWorking)} mistakeLine ${f.mistakeLine}`);
    console.log(`     feedback: ${String(f.feedback).slice(0, 240)}`);
  }

  // 3x3
  const walk = (o, p, out) => {
    if (Array.isArray(o)) return o.forEach((x, i) => walk(x, `${p}[${i}]`, out));
    if (o && typeof o === "object") return Object.entries(o).forEach(([k, v]) => walk(v, `${p}.${k}`, out));
    if (typeof o === "string" && /3\s*(?:\\times|×|x|by)\s*3\b/.test(o) && !/notOnThisSpec/.test(p)) out.push(`${p}: ${o.slice(0, 140)}`);
  };
  const threes = [];
  walk(b, "bundle", threes);
  walk(note, "note", threes);
  for (const t of threes) console.log(`LIST 3x3 ${t}`);

  // tags
  for (const d of b.diagnostics) for (const it of d.items) for (const o of it.options) {
    if (o.misconception) console.log(`LIST tag ${d.id}/${it.id}/${o.id} [${o.misconception}] "${o.text}" :: ${o.feedback}   (stem: ${it.stem.slice(0, 90)})`);
  }
  for (const q of b.questions) for (const p of q.parts) {
    if (p.answer.kind === "mcq") for (const o of p.answer.options) {
      if (o.misconception) console.log(`LIST tag ${q.id}(${p.id})/${o.id} [${o.misconception}] "${o.text}" :: ${o.feedback}`);
    }
    for (const e of p.commonErrors ?? []) {
      const val = e.pattern.kind === "numeric" ? e.pattern.value : e.pattern.kind === "matrix" ? JSON.stringify(e.pattern.entries) : e.pattern.latex ?? e.pattern.regex;
      console.log(`LIST ce ${q.id}(${p.id}) [${e.misconception}] ${val} earns ${e.marksTypicallyEarned}/${p.marks} :: ${e.feedback}`);
    }
    if (p.answer.kind === "text") {
      console.log(`LIST text ${q.id}(${p.id}) ${p.marks}m: ${p.stem.replace(/\n/g, " / ").slice(0, 120)}`);
      console.log(`     accepted: ${JSON.stringify(p.answer.accepted)}`);
      console.log(`     keyWords: ${JSON.stringify(p.answer.keyWords)}`);
      console.log(`     scheme: ${JSON.stringify(p.scheme)}`);
    }
  }
  for (const n of note.filter((x) => x.type === "gate")) {
    const opts = n.options ?? [];
    console.log(`LIST gate ${n.id}: ${String(n.prompt).slice(0, 110)} | options ${JSON.stringify(opts)} | answer ${JSON.stringify(n.answer)}`);
  }
}
console.log(`\n${flags} FLAG line(s)`);
