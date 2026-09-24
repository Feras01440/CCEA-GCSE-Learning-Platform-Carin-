// Undo two String.replace calls whose replacement text contained "$`" (which inserts the text
// before the match). Each insertion is an exact copy of the file's prefix, so it can be found and cut.
import fs from "node:fs";

const FILE = "C:/Users/feras/Downloads/CCEA GCSE Top Learning Platform/scratchpad/fm3-batch-c/normal-distribution-z-probabilities.mjs";
const s = fs.readFileSync(FILE, "utf8");
const HEADER = "/**\n * FM3 batch C, topic 2";
const heads = [];
for (let i = s.indexOf(HEADER); i >= 0; i = s.indexOf(HEADER, i + 1)) heads.push(i);
console.log("headers at", heads);
if (heads.length !== 4) throw new Error("unexpected shape");

// Undo #2: R2 + copy(prefix m2) was written where MATCH2 stood.
const R2 = "1 - ${T(z)} = ${pv(p)}";
const m2 = heads[2] - R2.length;
if (s.slice(m2, heads[2]) !== R2) throw new Error("#2 marker not where expected");
if (s.slice(heads[2], heads[2] + m2) !== s.slice(0, m2)) throw new Error("#2 copy mismatch");
const FIX2 = "1 - ${T(z)} = ${pv(p)}$`";
const c1 = s.slice(0, m2) + FIX2 + s.slice(heads[2] + m2);

// Undo #1 on the result.
const heads1 = [];
for (let i = c1.indexOf(HEADER); i >= 0; i = c1.indexOf(HEADER, i + 1)) heads1.push(i);
console.log("after #2, headers at", heads1);
if (heads1.length !== 2) throw new Error("unexpected shape after #2");
const R1 = "= ${pv(p)}";
const m1 = heads1[1] - R1.length;
if (c1.slice(m1, heads1[1]) !== R1) throw new Error("#1 marker not where expected");
if (c1.slice(heads1[1], heads1[1] + m1) !== c1.slice(0, m1)) throw new Error("#1 copy mismatch");
const TAIL1 = " }];";
if (c1.slice(heads1[1] + m1, heads1[1] + m1 + TAIL1.length) !== TAIL1) throw new Error("#1 tail mismatch");
const FIX1 = "= ${pv(p)}$` }];";
const original = c1.slice(0, m1) + FIX1 + c1.slice(heads1[1] + m1 + TAIL1.length);
if (original.indexOf(HEADER, 1) >= 0) throw new Error("a second header survived");
fs.writeFileSync(FILE, original, "utf8");
console.log("recovered", original.length, "chars,", original.split("\n").length, "lines");
