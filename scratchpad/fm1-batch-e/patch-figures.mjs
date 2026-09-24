/**
 * OP-1 and OP-2: a question or worked-example figure shows the letters its stem uses, never the
 * value the stem asks for, and q.0015 gets the two-pen diagram its stem describes.
 * The note keeps the solved copies.
 */
import fs from "node:fs";
const file = "scratchpad/fm1-batch-e/topic2-emit.mjs";
let src = fs.readFileSync(file, "utf8");

const swaps = [
  // we.01 and q.0010: the bed, labelled x and y
  ["figure: svgFigure(wallDiagram, `A rectangular flower bed against a wall, with two sides of x metres and the side facing the wall completing the ${frText(A.edging)} metres of timber`),",
   "figure: svgFigure(wallDiagramVars, `A rectangular flower bed against a wall, with two sides of x metres, the side facing the wall y metres, and the ${frText(A.edging)} metres of timber covering those three sides`),"],
  ["figures: [svgFigure(wallDiagram, `A rectangular flower bed against a wall, edged on three sides only`)],",
   "figures: [svgFigure(wallDiagramVars, `A rectangular flower bed against a wall, edged on three sides only, with the two ends x metres and the side facing the wall y metres`)],"],
  // we.02 and q.0009: the divided plot, labelled x and y
  ["figure: svgFigure(plotDiagram, `A rectangular vegetable plot with one extra fence across the middle, ${frText(B.x)} metres across and ${frText(B.y)} metres deep`),",
   "figure: svgFigure(plotDiagramVars, `A rectangular vegetable plot of area ${frText(B.area)} square metres, x metres across and y metres deep, with one extra fence of length y across the middle`),"],
  ["figures: [svgFigure(plotDiagram, `A rectangular vegetable plot with one extra fence across the middle, ${frText(B.x)} metres across and ${frText(B.y)} metres deep`)],",
   "figures: [svgFigure(plotDiagramVars, `A rectangular vegetable plot of area ${frText(B.area)} square metres, x metres across and y metres deep, with one extra fence of length y across the middle`)],"],
  // q.0015: the two pens the stem describes, not the single bed
  ['figures: [svgFigure(wallDiagram, "A rectangular enclosure against a wall, fenced on three sides")],',
   'figures: [svgFigure(pensDiagram, "Two rectangular pens side by side against a barn wall, the two ends and the divider each x metres and the far side y metres")],'],
  // q.0017: the river field, labelled x and y
  ["figures: [svgFigure(riverDiagram, `A rectangular field beside a river, fenced on three sides, ${frText(F.x)} metres along the far side and ${frText(F.y)} metres on each end`)],",
   "figures: [svgFigure(riverDiagram, `A rectangular field of area ${frText(F.area)} square metres beside a river, fenced on three sides: the side opposite the river x metres and each end y metres`)],"],
];

for (const [from, to] of swaps) {
  if (!src.includes(from)) throw new Error(`anchor not found: ${from.slice(0, 90)}`);
  src = src.split(from).join(to);
}
src = src.replace(
  "  wallDiagram, plotDiagram, noticeDiagram, riverDiagram, areaGraph, lengthGraph, stepCard, natureCard,",
  "  wallDiagram, wallDiagramVars, pensDiagram, plotDiagram, plotDiagramVars, noticeDiagram, riverDiagram, areaGraph, lengthGraph, stepCard, natureCard,",
);
fs.writeFileSync(file, src);
console.log("patched figures in", file);
