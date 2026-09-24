// How the note's number gates take a percentage typed with and without its sign.
import path from "node:path";
import { pathToFileURL } from "node:url";

const ROOT = "C:/Users/feras/Downloads/CCEA GCSE Top Learning Platform";
const { markGate } = await import(pathToFileURL(path.join(ROOT, "src/components/items/gates.ts")).href);

const gate = (answer: string) => ({ type: "gate", id: "t", kind: "number", prompt: "", answer, explain: "" });
for (const [answer, tries] of [
  ["2.5 | 2.3 | 2.28", ["2.5", "2.5%", "2.3%", "2.28", "5", "5%", "25"]],
  ["2.5 | 2.5% | 2.3 | 2.3% | 2.28 | 2.28%", ["2.5", "2.5%", "2.3%", "2.28 %", "5", "5%", "0.025"]],
  ["62", ["62", "62 marks", "48"]],
  ["20.5", ["20.5", "20.5 cm", "20.50"]],
  ["25", ["25", "25 cm", "35"]],
] as const) {
  console.log(answer);
  for (const t of tries) console.log(`   ${markGate(gate(answer), t) ? "yes" : "no "}  ${t}`);
}
