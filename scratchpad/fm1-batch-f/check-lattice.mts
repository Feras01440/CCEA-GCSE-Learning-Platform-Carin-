/**
 * Every plotted target of every graph part of this batch, checked against the app's OWN grid
 * (src/lib/marking/plot.ts plotLattice): can a tap land on each table point, and on each point the
 * line must pass through, within the part's tolerance? Exits 1 on any unreachable target.
 * Also reports how the part's tolerance compares with half a small square on each axis.
 */
import fs from "node:fs";
import path from "node:path";
import { plotLattice, toleranceOf, type PointsExpect } from "../../src/lib/marking/plot.ts";

const SLUGS = ["logarithms-from-indices", "area-under-curve", "laws-of-logarithms", "log-log-graphs", "indicial-equations"];
const findings: string[] = [];
let checked = 0;

for (const slug of SLUGS) {
  const file = path.resolve("packs/further-maths/content/fm1", slug, "bundle.json");
  if (!fs.existsSync(file)) continue;
  const b = JSON.parse(fs.readFileSync(file, "utf8")) as { questions: Array<{ id: string; parts: Array<{ id: string; answer: Record<string, unknown> }> }> };
  for (const q of b.questions) {
    for (const p of q.parts) {
      if (p.answer.kind !== "graph") continue;
      const expect = p.answer.expect as PointsExpect;
      if (expect.plot !== "points-line" && expect.plot !== "curve") continue;
      checked++;
      const lattice = plotLattice(expect);
      const tol = toleranceOf(expect);
      for (const u of lattice.unreachable) {
        findings.push(`${slug} ${q.id}(${p.id}): ${u.axis} = ${u.value} cannot be tapped (nearest ${u.nearest} on a ${u.minor} lattice, tolerance ${u.tolerance})`);
      }
      const halfX = lattice.x.minor / 2;
      const halfY = lattice.y.minor / 2;
      console.log(
        `${slug} ${q.id}(${p.id}): x major ${lattice.x.major} minor ${lattice.x.minor} (half ${halfX}); y major ${lattice.y.major} minor ${lattice.y.minor} (half ${halfY}); tolerance ${tol}`,
      );
      if (tol > halfX + 1e-9) findings.push(`${slug} ${q.id}(${p.id}): tolerance ${tol} is more than half an x small square (${halfX})`);
      if (tol > halfY + 1e-9) findings.push(`${slug} ${q.id}(${p.id}): tolerance ${tol} is more than half a y small square (${halfY})`);
    }
  }
}

console.log(`lattice check: ${checked} graph part(s)`);
if (findings.length === 0) console.log("no findings");
else {
  for (const f of findings) console.log("FINDING", f);
  process.exitCode = 1;
}
