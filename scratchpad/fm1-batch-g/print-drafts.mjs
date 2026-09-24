// 23 Sep (job 3): print a topic's diagnostics, find-the-mistake items and prompts readably, for the student read-through.
//   node scratchpad/fm1-batch-g/print-drafts.mjs <slug> [dx|ftm|rp]
import fs from "node:fs";
const [slug, only] = process.argv.slice(2);
const b = JSON.parse(fs.readFileSync(`packs/further-maths/content/fm1/${slug}/bundle.json`, "utf8"));
const n = JSON.parse(fs.readFileSync(`packs/further-maths/content/fm1/${slug}/note.blocks.json`, "utf8"));
const clip = (s, k = 400) => String(s ?? "").replace(/\n/g, " / ").slice(0, k);
if (!only || only === "dx") {
  for (const d of b.diagnostics) {
    console.log(`\n=== ${d.id} (${d.when}, ${d.items.length} items)`);
    for (const it of d.items) {
      console.log(`[${it.id}] ${clip(it.stem)}${it.figure ? "  [figure]" : ""}   (skill: ${it.skill})`);
      for (const o of it.options) console.log(`    ${o.correct ? "*" : " "} ${o.id}) ${clip(o.text, 160)}${o.misconception ? `  <${o.misconception}>` : ""}\n         fb: ${clip(o.feedback, 260)}`);
    }
  }
}
if (!only || only === "ftm") {
  for (const f of b.findTheMistake) {
    console.log(`\n=== ${f.id}  <${f.misconception}>  line ${f.mistakeLine}  earns ${JSON.stringify(f.marksEarnedAsWritten)}  source ${f.source}`);
    console.log(`stem: ${clip(f.stem)}`);
    f.studentWorking.forEach((l, i) => console.log(`  ${i + 1}${i + 1 === f.mistakeLine ? "*" : " "} ${l}`));
    console.log(`what went wrong: ${clip(f.whatWentWrong, 900)}`);
    console.log(`correction: ${JSON.stringify(f.correction)}`);
    console.log(`feedback: ${clip(f.feedback, 600)}`);
  }
}
if (!only || only === "rp") {
  console.log(`\n=== prompts (${b.prompts.length}); embedded in the note: ${n.filter((x) => x.type === "prompt").map((x) => x.promptId.split(".").pop()).join(", ")}`);
  for (const p of b.prompts) console.log(`[${p.id.split(".").pop()}] (${p.kind}) ${clip(p.prompt, 200)}\n     => ${clip(p.answer, 400)}   keys ${JSON.stringify(p.keyWords)}`);
}
