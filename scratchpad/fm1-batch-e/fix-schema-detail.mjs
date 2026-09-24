import fs from "node:fs";
const files = ["topic1-emit.mjs", "topic2-emit.mjs", "topic3-emit.mjs", "topic4-definite.mjs"].map((f) => `scratchpad/fm1-batch-e/${f}`);
for (const file of files) {
  let src = fs.readFileSync(file, "utf8");
  const before = src;
  src = src.replace(
    /\["schema", "pass", "(Validated against the Zod NoteFrontmatter[^\n]*?)"\],/g,
    (_m, body) => `["schema", "pass", \`${body.replace(/\$\{note\.filter\(\(b\) => b\.type === "gate"\)\.length\}/g, "${note.filter((b) => b.type === 'gate').length}")}\`],`,
  );
  if (src === before) throw new Error(`${file}: schema detail not rewritten`);
  if (/\["schema", "pass", "[^"]*\$\{/.test(src)) throw new Error(`${file}: a plain string still carries a placeholder`);
  fs.writeFileSync(file, src);
  console.log(`fixed ${file}`);
}
