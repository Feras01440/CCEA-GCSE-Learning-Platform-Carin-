/**
 * 23 Sep (job 3): add verification logging for the diagnostics, find-the-mistake items and prompts to the eight FM1
 * generators that never logged them. Two edits per generator, each asserted to happen exactly once: import draftLogs
 * from the batch library, and spread its logs at the end of the verification array.
 *   node scratchpad/fm1-batch-g/add-draft-logs.mjs          (cwd = the project root)
 */
import fs from "node:fs";

const F_VERIFIER = "The numeric distractors were re-derived from their routes by scratchpad/fm1-batch-f/verify-published.mjs.";
const G_VERIFIER = "The matrices were added, multiplied and inverted again from the matrices printed in the items' own stems (scratchpad/fm1-batch-g/probe-drafts-0923.mts), and the rest checked by hand in the read-through.";
const JOBS = [
  ["scratchpad/fm1-batch-f/area-under-curve.mjs", "findTheMistake", F_VERIFIER],
  ["scratchpad/fm1-batch-f/indicial-equations.mjs", "findTheMistake", F_VERIFIER],
  ["scratchpad/fm1-batch-f/log-log-graphs.mjs", "findTheMistake", F_VERIFIER],
  ["scratchpad/fm1-batch-f/logarithms-from-indices.mjs", "[]", F_VERIFIER],
  ["scratchpad/fm1-batch-g/matrix-arithmetic.mjs", "findTheMistake", G_VERIFIER],
  ["scratchpad/fm1-batch-g/matrix-inverse-2x2.mjs", "findTheMistake", G_VERIFIER],
  ["scratchpad/fm1-batch-g/matrix-equations.mjs", "findTheMistake", G_VERIFIER],
  ["scratchpad/fm1-batch-g/matrix-simultaneous-equations.mjs", "findTheMistake", G_VERIFIER],
];

const once = (text, find, replace, label) => {
  const at = text.indexOf(find);
  if (at < 0 || text.indexOf(find, at + 1) >= 0) throw new Error(`${label}: expected exactly one "${find.slice(0, 40)}"`);
  return text.slice(0, at) + replace + text.slice(at + find.length);
};

for (const [file, ftm, verifier] of JOBS) {
  let src = fs.readFileSync(file, "utf8");
  if (src.includes("draftLogs")) {
    console.log(`${file}: already done`);
    continue;
  }
  src = once(src, "PAPER, check, ", "PAPER, check, draftLogs, ", `${file} import`);
  const tail = "      ),\n    ),\n  ),\n];\n\nconst bundle = {";
  const added = `      ),\n    ),\n  ),\n  // 23 Sep (job 3): the diagnostics, find-the-mistake items and prompts, never logged before, so never shipped.\n  ...draftLogs({ diagnostics, findTheMistake: ${ftm}, prompts, verifier: ${JSON.stringify(verifier)} }),\n];\n\nconst bundle = {`;
  src = once(src, tail, added, `${file} verification tail`);
  fs.writeFileSync(file, src, "utf8");
  console.log(`${file}: import and logs added`);
}
