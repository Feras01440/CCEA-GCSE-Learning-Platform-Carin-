// Print a note.blocks.json readably: node print-note.mjs <slug> [dir]
import fs from "node:fs";
const slug = process.argv[2];
const dir = process.argv[3] ?? "further-maths/content/fm1";
const blocks = JSON.parse(fs.readFileSync(`packs/${dir}/${slug}/note.blocks.json`, "utf8"));
blocks.forEach((b, i) => {
  const rest = { ...b };
  delete rest.type;
  if (rest.svg) rest.svg = `<svg ${rest.svg.length} bytes>`;
  if (rest.figure && rest.figure.svg) rest.figure = { ...rest.figure, svg: `<svg ${rest.figure.svg.length} bytes>` };
  console.log(`[${i}] ${b.type}: ${JSON.stringify(rest)}`);
});
