/**
 * Turns each note's "You can now" mustknow callout into the recap card lesson-v2 asks for:
 * an `h` block reading "You can now" followed by the same three-to-five lines as a `p` block.
 * The lines themselves are untouched.
 */
import fs from "node:fs";

const files = [
  "scratchpad/fm1-batch-e/topic1-curve-sketching.mjs",
  "scratchpad/fm1-batch-e/topic2-optimisation.mjs",
  "scratchpad/fm1-batch-e/topic3-integration.mjs",
  "scratchpad/fm1-batch-e/topic4-definite.mjs",
];

// { type: "callout", kind: "mustknow", title: "You can now", md: <lines> },  ->  { h }, { p }
const RE = /\{\s*\n\s*type: "callout",\s*\n\s*kind: "mustknow",\s*\n\s*title: "You can now",\s*\n\s*md: ([\s\S]*?),?\s*\n\s*\},/;

for (const file of files) {
  const src = fs.readFileSync(file, "utf8");
  const m = RE.exec(src);
  if (!m) throw new Error(`${file}: no "You can now" callout found`);
  const md = m[1].trim().replace(/,$/, "");
  const replacement = `{ type: "h", text: "You can now" },\n  {\n    type: "p",\n    md: ${md},\n  },`;
  fs.writeFileSync(file, src.replace(RE, replacement));
  console.log(`patched ${file}`);
}
