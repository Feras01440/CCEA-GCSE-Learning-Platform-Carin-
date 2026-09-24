/** Rewrites the four emitters' note verification details so the counts are derived, not typed. */
import fs from "node:fs";

const subs = [
  ["scratchpad/fm1-batch-e/topic1-emit.mjs", [
    ['the hero block is first, the seven gate ids are unique, and every prompt block names a prompt in this bundle."',
     'the hero block is first, all ${note.filter((b) => b.type === "gate").length} gate ids are unique, and every prompt block names a prompt in this bundle."'],
    ['"The note\'s four examiner callouts carry the Summer 2018 Q9, Summer 2019 Q8, Summer 2023 Q12 and Summer 2025 Q11 findings, one each; gate g2 exercises the sign reversal, g3 and g5 the substitution into the curve, g4 the second-derivative test, g6 the impossible-shape check and g7 the labelling mark."',
     '"No examiner callout stands in the teaching body and none is repeated in the closing panel: every one of the Summer 2018 Q9, Summer 2019 Q8, Summer 2022 Q10, Summer 2023 Q12, Summer 2024 Q10 and Summer 2025 Q11 findings is a trap in note.sheet.traps, checked by scratchpad/fm1-batch-e/panel-check.mts. The gates exercise them: g1a and g2 the sign reversal and the calculus-free rows, g3 and g5 the substitution into the curve, g4 the second-derivative test, g5a the three crossings of a cubic, g6 the impossible-shape check and g7 the labelling mark."'],
    ['The note has 7 gates, 6 inline SVG figures',
     'The note has ${note.filter((b) => b.type === "gate").length} gates, ${note.filter((b) => b.type === "figure").length} inline SVG figures'],
  ]],
  ["scratchpad/fm1-batch-e/topic2-emit.mjs", [
    ['the hero block is first, the eight gate ids are unique and every prompt block names a prompt in this bundle."',
     'the hero block is first, all ${note.filter((b) => b.type === "gate").length} gate ids are unique and every prompt block names a prompt in this bundle."'],
    ['"The four examiner callouts carry the Summer 2019 Q14, Summer 2022 Q13, Summer 2024 Q13 and Summer 2025 Q14 findings, one each; gate g2 exercises the missing final step, g3 the constraint, g5 the nature test, g6 the quantity asked for and g7 the square root after a negative power."',
     '"No examiner callout stands in the teaching body and none is repeated in the closing panel: every one of the Summer 2018 Q12, Summer 2019 Q14, Summer 2022 Q13, Summer 2024 Q13 and Summer 2025 Q14 findings is a trap in note.sheet.traps, checked by scratchpad/fm1-batch-e/panel-check.mts. The gates exercise them: g2 the missing final step, g3 the constraint, g5 the nature test, g6 the quantity asked for, g7 the square root after a negative power and g7a the doubled margin."'],
    ['The note has 8 gates, 7 inline SVG figures',
     'The note has ${note.filter((b) => b.type === "gate").length} gates, ${note.filter((b) => b.type === "figure").length} inline SVG figures'],
  ]],
  ["scratchpad/fm1-batch-e/topic3-emit.mjs", [
    ['the hero block is first, the eight gate ids are unique and every prompt block names a prompt in this bundle."',
     'the hero block is first, all ${note.filter((b) => b.type === "gate").length} gate ids are unique and every prompt block names a prompt in this bundle."'],
    ['"The note\'s four examiner callouts carry the Summer 2022 Q2, Summer 2023 Q2, Summer 2024 Q1 and Summer 2025 Q6 findings, one each; gate g2 exercises the division by the new power, g3 the constant, g5 the negative power, g6 the substitution and g7 the gradient-word trap."',
     '"One examiner callout stands in the teaching body, beside the constant of integration it is about, which is the limit the template allows; every other finding (Summer 2019 Q3, Summer 2022 Q2, Summer 2024 Q1, Summer 2025 Q6) is a trap in note.sheet.traps rather than a callout in the closing panel, checked by scratchpad/fm1-batch-e/panel-check.mts. The gates exercise them: g2 the division by the new power, g2a and g3 the constant, g5 the negative power, g5a and g6 the substitution, g7 the gradient-word trap and g8 the presentation of the finished equation."'],
    ['The note has 8 gates, 5 inline SVG figures',
     'The note has ${note.filter((b) => b.type === "gate").length} gates, ${note.filter((b) => b.type === "figure").length} inline SVG figures'],
  ]],
  ["scratchpad/fm1-batch-e/topic4-definite.mjs", [
    ['the hero block is first, the four gate ids are unique and every prompt block names a prompt in this bundle."',
     'the hero block is first, all ${note.filter((b) => b.type === "gate").length} gate ids are unique and every prompt block names a prompt in this bundle."'],
    ['"The note\'s two examiner callouts carry the Summer 2018 Q2 and Summer 2019 Q13 findings; gate g2 exercises the substitution, g3 the order of the subtraction and g4 the unknown constant."',
     '"No examiner callout stands in the teaching body and none is repeated in the closing panel: both the Summer 2018 Q2 and the Summer 2019 Q13 findings are traps in note.sheet.traps, checked by scratchpad/fm1-batch-e/panel-check.mts. The gates exercise them: g2 the substitution, g3 the order of the subtraction and g4 the unknown constant."'],
    ['The note has 4 gates, 3 inline SVG figures',
     'The note has ${note.filter((b) => b.type === "gate").length} gates, ${note.filter((b) => b.type === "figure").length} inline SVG figures'],
  ]],
];

for (const [file, pairs] of subs) {
  let src = fs.readFileSync(file, "utf8");
  for (const [from, to] of pairs) {
    if (!src.includes(from)) throw new Error(`${file}: anchor not found: ${from.slice(0, 70)}`);
    src = src.split(from).join(to);
  }
  // the two "schema"/"examiner-alignment" details are plain strings; make them template literals
  src = src.replace(/\["schema", "pass", "Validated against the Zod NoteFrontmatter([^"]*\$\{[^"]*)"\]/, '["schema", "pass", `Validated against the Zod NoteFrontmatter$1`]');
  fs.writeFileSync(file, src);
  console.log(`patched ${file}`);
}
