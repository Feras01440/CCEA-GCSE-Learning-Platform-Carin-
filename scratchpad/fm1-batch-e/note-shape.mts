import fs from "node:fs";
import { wordsBetweenGates } from "../../src/components/items/gates.ts";

for (const s of ["curve-sketching-quadratic-cubic", "optimisation", "integration-as-inverse", "definite-integrals"]) {
  const all = JSON.parse(fs.readFileSync(`packs/further-maths/content/fm1/${s}/note.blocks.json`, "utf8"));
  // the lesson renderer ignores the hero block; the topic page reads it
  const b = all.filter((x: { type: string }) => x.type !== "hero");
  const w = wordsBetweenGates(b as never);
  const interior = w.slice(0, -1);
  const closing = w[w.length - 1];
  const firstFig = b.findIndex((x: { type: string }) => x.type === "figure");
  const wordsBeforeFig = b
    .slice(0, firstFig)
    .reduce((n: number, x: Record<string, string>) => n + (x.md ?? x.text ?? "").split(/\s+/).filter(Boolean).length, 0);
  console.log(
    `${s} | gates ${b.filter((x: { type: string }) => x.type === "gate").length} | words between gates ${interior.join(", ")} | closing panel after the last gate ${closing} | words before the first figure ${wordsBeforeFig}`,
  );
}
