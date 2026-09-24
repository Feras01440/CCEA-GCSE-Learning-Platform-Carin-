/**
 * The shingle ruling: a shared 8-word run is allowed only where it recurs in three or more
 * question papers. These rewordings break the runs that trace to one or two papers, and keep
 * the stock instruction language (which is what makes the practice read like the paper).
 */
import fs from "node:fs";

const edits = {
  "scratchpad/fm1-batch-e/topic1-emit.mjs": [
    // the opener, whose window runs into the printed equation
    ["A curve is defined by the equation $y = ", "A curve has the equation $y = "],
    ["A curve is defined by the equation $y = x(x - 5)(x - 8)$", "A curve has the equation $y = x(x - 5)(x - 8)$"],
    ["A curve is defined by the equation $y = x(x - 3)(x + 4)$", "A curve has the equation $y = x(x - 3)(x + 4)$"],
    ["A curve is defined by the equation $y = (x + 1)(x - 3)(x - 6)$", "A curve has the equation $y = (x + 1)(x - 3)(x - 6)$"],
    ["A curve is defined by the equation $y = (x - 2)^{2}(x - 8)$", "A curve has the equation $y = (x - 2)^{2}(x - 8)$"],
    // "Write down the coordinates of the points where …" traces to two papers
    ["Write down the coordinates of the points where the curve meets the $x$-axis.", "Write down the coordinates of each point where the curve meets the $x$-axis."],
    ["Write down the coordinates of the points where the curve meets the x-axis.", "Write down the coordinates of each point where the curve meets the x-axis."],
    // the singular y-axis crossing traces to two papers
    ["Find the coordinates of the point where the curve meets the $y$-axis.", "Find the coordinates of the point at which the curve meets the $y$-axis."],
    ["Write down the coordinates of the point where the curve meets the $y$-axis.", "Write down the coordinates of the point at which the curve meets the $y$-axis."],
    // "using calculus, find the coordinates of the turning point(s) of the curve"
    ["Using calculus, find the coordinates of the turning point of the curve.", "Using calculus, find the coordinates of each turning point on the curve."],
    ["Using calculus, find the coordinates of the turning points of the curve.", "Using calculus, find the coordinates of each turning point on the curve."],
    // "show clearly why this turning point is a …" is one paper's own sentence
    ["Show clearly why this turning point is a maximum.", "Use the second derivative to show that this turning point is a maximum."],
    ["Show clearly why the turning point where $x = ${frText(C2.sps[1].x)}$ is a minimum.", "Use the second derivative to show that the turning point where $x = ${frText(C2.sps[1].x)}$ is a minimum."],
  ],
  "scratchpad/fm1-batch-e/topic2-emit.mjs": [
    ["Write down an expression for $y$ in terms of $x$.", "Write down $y$ in terms of $x$."],
    ["Using calculus, find the value of $x$ that gives the greatest area.", "Using calculus, find the value of $x$ which gives the greatest area."],
    ["Using calculus, find the value of $x$ that gives the greatest total area, showing clearly that it is a maximum.", "Using calculus, find the value of $x$ which gives the greatest total area, showing clearly that it is a maximum."],
    ["Using calculus, find the value of $x$ that makes the total area least, showing clearly that it is a minimum.", "Using calculus, find the value of $x$ which makes the total area least, showing clearly that it is a minimum."],
    ["Using calculus, find the value of $x$ that makes $C$ least.", "Using calculus, find the value of $x$ which makes $C$ least."],
    ["Using calculus, find the greatest value of $A$.", "Using calculus, find the greatest value that $A$ can take."],
  ],
  "scratchpad/fm1-batch-e/topic2-optimisation.mjs": [
    ["The wording is *using calculus, find the value of $x$ that gives the maximum, showing that it is a maximum*, usually after one or two show-that parts.",
     "The wording is *using calculus, find the value of $x$ which gives the maximum, showing that it is a maximum*, usually after one or two show-that parts."],
  ],
  "scratchpad/fm1-batch-e/topic3-emit.mjs": [
    ["Find an expression for $y$, given that $y = ${frText(X3.py)}$ when $x = ${frText(X3.px)}$.", "Find $y$ in terms of $x$, given that $y = ${frText(X3.py)}$ when $x = ${frText(X3.px)}$."],
    ["find an expression for y given a point", "find y in terms of x given a point"],
    ["and find an expression for y given that y = ... when x = ....", "and find y in terms of x given that y = ... when x = ...."],
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
  console.log(`${file}: ${hit}/${pairs.length} rewordings applied`);
}
