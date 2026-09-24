// Marker check for the restored gates g5 and g6 of fm1/algebraic-fractions-simplify (23 Sep).
import fs from "node:fs";
import { markGate } from "../../src/components/items/gates.ts";
const note = JSON.parse(fs.readFileSync("packs/further-maths/content/fm1/algebraic-fractions-simplify/note.blocks.json", "utf8"));
let bad = 0;
for (const id of ["g5", "g6"]) {
  const g = note.find((b: any) => b.type === "gate" && b.id === id);
  for (const o of g.options) {
    const r = markGate(g, o);
    const want = o === g.answer;
    if (r !== want) bad++;
    console.log(`${r === want ? "ok  " : "FAIL"} ${id} "${o}" -> ${r}`);
  }
}
console.log(bad ? `${bad} FAIL` : "gates mark exactly their answer");
