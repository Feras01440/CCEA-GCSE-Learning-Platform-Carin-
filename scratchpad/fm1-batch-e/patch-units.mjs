/** OP-7: prepend the unit-omitted common error to the three two-mark unit parts. */
import fs from "node:fs";
const file = "scratchpad/fm1-batch-e/topic2-emit.mjs";
let src = fs.readFileSync(file, "utf8");

const swaps = [
  // q.0012 (main): the greatest area of the two pens
  [`      commonErrors: [
        {
          misconception: "fm.optim.final-quantity-not-evaluated",
          pattern: { kind: "numeric", value: R.dStopAtX },
          feedback: \`That is the value of $x$, which is the length of one end in metres. The area is what the question asks for, and substituting gives $\${frText(D.value)}$ m².\`,`,
   `      commonErrors: [
        unitOmitted(D.value, "m²", "an area", "ccea-cer:further-maths:2022-summer:FM1:Q13"),
        {
          misconception: "fm.optim.final-quantity-not-evaluated",
          pattern: { kind: "numeric", value: R.dStopAtX },
          feedback: \`That is the value of $x$, which is the length of one end in metres. The area is what the question asks for, and substituting gives $\${frText(D.value)}$ m².\`,`],
  // exam1 (d): the least total area of the card
  [`      commonErrors: [
        {
          misconception: "fm.optim.final-quantity-not-evaluated",
          pattern: { kind: "numeric", value: R.cStopAtX },`,
   `      commonErrors: [
        unitOmitted(C.value, "cm²", "an area", "ccea-cer:further-maths:2022-summer:FM1:Q13"),
        {
          misconception: "fm.optim.final-quantity-not-evaluated",
          pattern: { kind: "numeric", value: R.cStopAtX },`],
  // exam2 (d): the greatest total area of the two pens
  [`      commonErrors: [
        {
          misconception: "fm.optim.final-quantity-not-evaluated",
          pattern: { kind: "numeric", value: R.dStopAtX },
          feedback: \`That is the value of $x$ from part (c), a length in metres. The area is $\${frText(D.value)}$ m².\`,`,
   `      commonErrors: [
        unitOmitted(D.value, "m²", "an area", "ccea-cer:further-maths:2022-summer:FM1:Q13"),
        {
          misconception: "fm.optim.final-quantity-not-evaluated",
          pattern: { kind: "numeric", value: R.dStopAtX },
          feedback: \`That is the value of $x$ from part (c), a length in metres. The area is $\${frText(D.value)}$ m².\`,`],
];

for (const [from, to] of swaps) {
  if (!src.includes(from)) throw new Error(`anchor not found:\n${from.slice(0, 160)}`);
  if (src.split(from).length > 2) throw new Error(`anchor is not unique:\n${from.slice(0, 160)}`);
  src = src.replace(from, to);
}
fs.writeFileSync(file, src);
console.log("patched the three unit parts");
