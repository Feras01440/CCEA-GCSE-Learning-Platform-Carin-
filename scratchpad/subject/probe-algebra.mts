/**
 * Probe: does an `equation`-style algebraic AnswerSpec latex ("x=\\frac{4y}{5-v}") with
 * equivalence "equivalent" actually enforce that the subject is isolated?
 * Run: npx tsx scratchpad/subject/probe-algebra.mts
 */
import { checkAlgebraic } from "../../src/lib/marking/algebra.ts";
import { toAlgebraSpec } from "../../src/components/items/spec-map.ts";

type Case = { latex: string; vars: string[]; tries: Array<[string, boolean]> };

const cases: Case[] = [
  {
    latex: "x=\\frac{4y}{5-v}",
    vars: ["x", "y", "v"],
    tries: [
      ["x = \\frac{4y}{5-v}", true],
      ["x=4y/(5-v)", true],
      ["\\frac{4y}{5-v}", true], // bare expression, no "x ="
      ["x=\\frac{-4y}{v-5}", true],
      ["x(5-v)=4y", false], // NOT isolated
      ["5x-vx=4y", false], // NOT isolated
      ["5x=vx+4y", false], // the original formula
      ["x=\\frac{4y}{v-5}", false], // sign slip
      ["y=\\frac{x(5-v)}{4}", false], // wrong subject
    ],
  },
  {
    latex: "z=\\frac{x^2}{y}",
    vars: ["x", "y", "z"],
    tries: [
      ["z=\\frac{x^2}{y}", true],
      ["z=x^2/y", true],
      ["x^2/y", true],
      ["zy=x^2", false],
      ["z=\\frac{x}{y}", false],
      ["z=\\sqrt{\\frac{x}{y}}", false],
    ],
  },
  {
    latex: "r=\\sqrt{\\frac{3V}{\\pi h}}",
    vars: ["r", "V", "h"],
    tries: [
      ["r=\\sqrt{\\frac{3V}{\\pi h}}", true],
      ["r=\\sqrt{3V/(\\pi h)}", true],
      ["r^2=\\frac{3V}{\\pi h}", false],
      ["r=\\frac{\\sqrt{3V}}{\\pi h}", false],
      ["r=\\frac{3V}{\\pi h}", false],
    ],
  },
  {
    latex: "t=\\frac{5w+2}{w-3}",
    vars: ["t", "w"],
    tries: [
      ["t=\\frac{5w+2}{w-3}", true],
      ["t=\\frac{-5w-2}{3-w}", true],
      ["t(w-3)=5w+2", false],
      ["tw-3t=5w+2", false],
    ],
  },
];

let bad = 0;
for (const c of cases) {
  console.log(`\n### spec latex: ${c.latex}`);
  const spec = toAlgebraSpec({
    kind: "algebraic",
    latex: c.latex,
    equivalence: "equivalent",
    variables: c.vars,
  } as never);
  console.log("   mapped AlgebraSpec:", JSON.stringify(spec));
  for (const [ans, want] of c.tries) {
    const v = checkAlgebraic(ans, spec);
    const ok = v.correct === want;
    if (!ok) bad++;
    console.log(`   ${ok ? "OK  " : "DIFF"} "${ans}" -> correct=${v.correct} (${v.reason}) want=${want}`);
  }
}
console.log(`\n${bad} probe(s) differed from expectation.`);
