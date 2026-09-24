import fs from "node:fs";

const file = process.argv[2];
const b = JSON.parse(fs.readFileSync(file, "utf8"));
const nb = b.noteBlocks ?? [];
console.log("noteBlocks count:", Array.isArray(nb) ? nb.length : typeof nb);
if (Array.isArray(nb)) {
  console.log("kinds:", nb.map((x) => x.kind ?? x.type).join(", "));
  const slice = Number(process.argv[3] ?? 8);
  const stop = Number(process.argv[4] ?? 0);
  for (const blk of nb.slice(stop, stop + slice)) {
    const j = JSON.stringify(blk);
    console.log("\n--- " + (blk.kind ?? blk.type) + " ---");
    console.log(j.length > 2600 ? j.slice(0, 2600) + "…[truncated " + j.length + "]" : j);
  }
}
