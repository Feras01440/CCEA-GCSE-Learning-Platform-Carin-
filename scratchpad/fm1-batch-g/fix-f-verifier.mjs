/**
 * 23 Sep (job 3, second pass): batch F's verifier sentence overclaimed. verify-published.mjs matches only the TAGGED
 * numeric distractors to a route (pre-check distractors are untagged by design and were read by hand), so the
 * sentence now says exactly that. Asserts exactly one occurrence per generator.
 *   node scratchpad/fm1-batch-g/fix-f-verifier.mjs          (cwd = the project root)
 */
import fs from "node:fs";

const OLD = "The numeric distractors were re-derived from their routes by scratchpad/fm1-batch-f/verify-published.mjs.";
const NEW = "The tagged numeric distractors were matched to the routes that produce them by scratchpad/fm1-batch-f/verify-published.mjs, and the rest checked by hand in the read-through.";
const FILES = ["area-under-curve", "indicial-equations", "log-log-graphs", "logarithms-from-indices"].map((s) => `scratchpad/fm1-batch-f/${s}.mjs`);

for (const file of FILES) {
  const src = fs.readFileSync(file, "utf8");
  if (src.includes(NEW)) {
    console.log(`${file}: already done`);
    continue;
  }
  const at = src.indexOf(OLD);
  if (at < 0 || src.indexOf(OLD, at + 1) >= 0) throw new Error(`${file}: expected exactly one verifier sentence`);
  fs.writeFileSync(file, src.slice(0, at) + NEW + src.slice(at + OLD.length), "utf8");
  console.log(`${file}: verifier sentence replaced`);
}
