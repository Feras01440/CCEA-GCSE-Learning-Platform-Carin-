import fs from "node:fs";
const slugs = [
  "perpendicular-lines",
  "frustums-and-compound-solids",
  "stratified-sampling-and-population-estimates",
  "factorising-harder-quadratics-ax2-plus-bx-plus-c",
];
for (const s of slugs) {
  const blocks = JSON.parse(fs.readFileSync(`packs/maths/content/m4/${s}/note.blocks.json`, "utf8"));
  let run = 0;
  const spans = [];
  for (const b of blocks) {
    if (b.type === "gate") {
      spans.push(run);
      run = 0;
      continue;
    }
    const t = [b.md, b.text, b.caption].filter(Boolean).join(" ");
    run += t.replace(/\$[^$]*\$/g, " x ").split(/\s+/).filter(Boolean).length;
  }
  spans.push(run);
  console.log(s.padEnd(48), "words between gates:", spans.join(", "), "| max", Math.max(...spans));
}
