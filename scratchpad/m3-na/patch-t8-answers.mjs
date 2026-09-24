/**
 * Re-encode every two-root answer in t8 as a comma-separated solution set computed
 * from the equation's own coefficients. Line-addressed so identical source lines
 * are not confused; each replacement is a CALL, so the roots stay computed.
 */
import fs from "node:fs";

const FILE = "scratchpad/m3-na/t8-solving-quadratics.mjs";
const lines = fs.readFileSync(FILE, "utf8").split("\n");

// line number (1-based) -> [letter, a, b, c] for a x^2 + b x + c = 0
const TARGETS = {
  179: ["x", 1, 2, -35],   // we.01 twin
  227: ["x", 1, -7, 0],    // we.02 twin  (x^2 = 7x)
  325: ["x", 1, -17, 60],  // we.04 twin
  408: ["x", 1, -2, -24],  // q0001  (x + 4)(x - 6) = 0
  431: ["x", 1, -10, 21],  // q0002a
  451: ["x", 1, 5, -24],   // q0002b
  495: ["x", 1, 2, -35],   // q0003b
  532: ["x", 1, 3, -40],   // q0004a
  552: ["x", 1, 4, -12],   // q0004b
  580: ["x", 1, -9, 0],    // q0005a  (x^2 = 9x)
  600: ["x", 2, 0, -18],   // q0005b
  627: ["c", 1, -11, 30],  // q0006a
  647: ["y", 1, -13, 42],  // q0006b
  780: ["x", 1, -6, -27],  // q0010
  831: ["x", 1, -31, 168], // q0011b
  909: ["x", 1, -5, -14],  // q0013b
};

let patched = 0;
for (const [lnStr, [letter, a, b, c]] of Object.entries(TARGETS)) {
  const i = Number(lnStr) - 1;
  const before = lines[i];
  if (!/answer: numAnswer\(/.test(before)) {
    console.error(`line ${lnStr} is not a numAnswer line:\n  ${before}`);
    process.exitCode = 1;
    continue;
  }
  const indent = before.match(/^\s*/)[0];
  lines[i] = `${indent}answer: solutionSet("${letter}", ${a}, ${b}, ${c}),`;
  patched++;
}
fs.writeFileSync(FILE, lines.join("\n"));
console.log(`patched ${patched} of ${Object.keys(TARGETS).length} answer encodings in t8`);
