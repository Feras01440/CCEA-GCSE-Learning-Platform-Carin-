// 23 Sep: which options does markGate accept for the two choice gates whose options normalise alike?
import fs from "node:fs";
import { markGate } from "../../../src/components/items/gates";
const cases = [
  ["packs/further-maths/content/fm1/indicial-equations/note.blocks.json", "g3"],
  ["packs/science/content/b2/b2-monohybrid-genetics/note.blocks.json", "g6"],
];
for (const [file, id] of cases) {
  if (!fs.existsSync(file)) { console.log("missing", file); continue; }
  const gate = JSON.parse(fs.readFileSync(file, "utf8")).find((b: any) => b.type === "gate" && b.id === id);
  console.log(file.split("/").slice(-2, -1)[0], id, "answer:", JSON.stringify(gate.answer));
  for (const opt of gate.options) console.log("   ", markGate(gate, opt) ? "MARKED RIGHT" : "marked wrong", JSON.stringify(opt));
}
