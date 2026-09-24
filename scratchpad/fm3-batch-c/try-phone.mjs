// Draws one of each phone-native figure with real numbers and renders them for a look.
import { ROWS } from "./stat.mjs";
import { nTail, nScales, nTable, nSides, nFold, nRough, bTable, bAnatomy, bDots, pTriangle, pPowers, pGrid } from "./phone.mjs";
import { renderAll } from "./phone-preview.mjs";

const figs = {
  nTail: nTail({ mean: 34, x: 40.5, z: 1.3, unit: "cm", tail: "right", statement: "P(L > 40.5)", title: "t" }),
  nTailNear: nTail({ mean: 102, x: 104.32, z: 1.45, unit: "g", tail: "right", statement: "P(M > 104.32)", title: "t" }),
  nTailBelow: nTail({ mean: 34, x: 29.5, z: -0.9, unit: "cm", tail: "right", statement: "P(L > 29.5)", title: "t" }),
  nScales: nScales({ marks: (z) => String(34 + 5 * z), unitLabel: "length (cm)", highlight: { z: 1.3, top: "40.5", bottom: "1.3" }, title: "t" }),
  nTable: nTable({ rows: [1.1, 1.2, 1.3, 1.4], cols: [0, 0.01, 0.02, 0.03, 0.04], ring: { row: 1.3, col: 0 }, title: "t" }),
  nSides: nSides({ z: 0.7, title: "t" }),
  nFold: nFold({ z: 0.6, title: "t" }),
  nRough: nRough({ title: "t" }),
  bTable: bTable({
    head: ["scores", "term", "probability"],
    rows: [
      [0, "0.2⁴", "0.0016"],
      [1, "4 × 0.8 × 0.2³", "0.0256"],
      [2, "6 × 0.8² × 0.2²", "0.1536"],
      [3, "4 × 0.8³ × 0.2", "0.4096"],
      [4, "0.8⁴", "0.4096"],
    ],
    total: ["total of the five", "1"],
    title: "t",
  }),
  bTableShaded: bTable({
    head: ["scores", "term", "probability"],
    rows: [
      [0, "0.2⁴", "0.0016"],
      [1, "4 × 0.8 × 0.2³", "0.0256"],
      [2, "6 × 0.8² × 0.2²", "0.1536"],
      [3, "4 × 0.8³ × 0.2", "0.4096"],
      [4, "0.8⁴", "0.4096"],
    ],
    total: ["total of the five", "1"],
    shade: [2, 4],
    title: "t",
  }),
  bAnatomy: bAnatomy({
    pieces: [
      { text: "10", x: 58, notes: ["coefficient", "from row 5"] },
      { text: "×", x: 124 },
      { text: "0.15²", x: 196, notes: ["p squared", "2 late days"] },
      { text: "×", x: 268 },
      { text: "0.85³", x: 336, notes: ["q cubed", "3 on time"] },
    ],
    title: "t",
  }),
  bDots: bDots({
    n: 6,
    rows: [
      ["at least 2", [2, 3, 4, 5, 6]],
      ["at most 2", [0, 1, 2]],
      ["more than 2", [3, 4, 5, 6]],
      ["fewer than 2", [0, 1]],
    ],
    title: "t",
  }),
  pTriangle: pTriangle({ rows: ROWS, upTo: 8, sums: [[4, 2], [6, 3]], title: "t" }),
  pBand: pTriangle({ rows: ROWS, upTo: 6, band: 5, title: "t" }),
  pPowers: pPowers({ rows: ROWS, n: 4, title: "t" }),
  pGrid78: pGrid({ rows: ROWS, upTo: 6, fill: [7, 8], title: "t" }),
  pGrid6: pGrid({ rows: ROWS, upTo: 5, fill: [6], title: "t" }),
};
await renderAll("phone", figs);
