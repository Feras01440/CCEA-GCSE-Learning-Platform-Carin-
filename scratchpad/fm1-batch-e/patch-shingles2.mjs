import fs from "node:fs";
const edits = {
  "scratchpad/fm1-batch-e/topic1-emit.mjs": [
    ["Find the coordinates of the point at which the curve meets the $y$-axis.", "Find the coordinates of the point where this curve meets the $y$-axis."],
    ["Write down the coordinates of the point at which the curve meets the $y$-axis.", "Write down the coordinates of the point where this curve meets the $y$-axis."],
    ["Use the second derivative to show that this turning point is a maximum.", "Show, from the sign of $\frac{d^{2}y}{dx^{2}}$, that this turning point is a maximum."],
    ["Use the second derivative to show that the turning point where $x = ${frText(C2.sps[1].x)}$ is a minimum.", "Show, from the sign of $\frac{d^{2}y}{dx^{2}}$, that the turning point where $x = ${frText(C2.sps[1].x)}$ is a minimum."],
  ],
  "scratchpad/fm1-batch-e/topic2-emit.mjs": [
    ["Using calculus, find the value of $x$ that uses the least fencing, showing clearly that it is a minimum.", "Using calculus, find the value of $x$ which uses the least fencing, showing clearly that it is a minimum."],
  ],
};
for (const [file, pairs] of Object.entries(edits)) {
  let src = fs.readFileSync(file, "utf8");
  let hit = 0;
  for (const [from, to] of pairs) {
    if (!src.includes(from)) continue;
    src = src.split(from).join(to);
    hit++;
  }
  fs.writeFileSync(file, src);
  console.log(`${file}: ${hit}/${pairs.length}`);
}
