/**
 * Post-build checks for the changing-the-subject bundle.
 *
 *  1. every algebraic AnswerSpec accepts its own latex through the real marking engine
 *  2. no algebraic commonError pattern is equivalent to the part's correct answer
 *     (a trap that matched the right answer would fire on a correct response)
 *  3. isolation: an un-isolated but equivalent line is rejected by each subject-twice answer
 *  4. every $…$ segment in bundle.json and note.blocks.json compiles with KaTeX
 *
 * Run: npx tsx scratchpad/subject/check-bundle.mts
 */
import fs from "node:fs";
import path from "node:path";
import katex from "katex";
import { checkAlgebraic } from "../../src/lib/marking/algebra.ts";
import { toAlgebraSpec } from "../../src/components/items/spec-map.ts";

const DIR = path.resolve("packs/maths/content/m7/changing-the-subject-harder-formulae");
const bundle = JSON.parse(fs.readFileSync(path.join(DIR, "bundle.json"), "utf8"));
const blocksRaw = fs.readFileSync(path.join(DIR, "note.blocks.json"), "utf8");

let fails = 0;
const fail = (msg: string) => {
  fails++;
  console.log(`  FAIL ${msg}`);
};

// --- 1 + 2: algebraic answers and their traps -------------------------------
console.log("1/2. Algebraic answers and commonError traps");
let algCount = 0;
let trapCount = 0;
const walkParts = (q: any, where: string) => {
  for (const p of q.parts ?? []) {
    const a = p.answer;
    if (a?.kind === "algebraic") {
      algCount++;
      const spec = toAlgebraSpec(a);
      const self = checkAlgebraic(a.latex, spec);
      if (!self.correct) fail(`${where} part ${p.id}: spec latex "${a.latex}" not accepted by its own spec (${self.reason})`);
      for (const e of p.commonErrors ?? []) {
        if (e.pattern?.kind !== "algebraic") continue;
        trapCount++;
        const clash = checkAlgebraic(e.pattern.latex, spec);
        if (clash.correct) fail(`${where} part ${p.id}: trap "${e.pattern.latex}" is equivalent to the correct answer`);
      }
    }
  }
};
for (const q of bundle.questions) walkParts(q, q.id);
for (const we of bundle.workedExamples) {
  const a = we.twin?.answer;
  if (a?.kind === "algebraic") {
    algCount++;
    const self = checkAlgebraic(a.latex, toAlgebraSpec(a));
    if (!self.correct) fail(`${we.id} twin: spec latex "${a.latex}" not accepted (${self.reason})`);
  }
}
console.log(`  ${algCount} algebraic specs self-accepted, ${trapCount} algebraic traps checked against them`);

// --- 3: does the equation-style latex actually force "x = …"? ---------------
console.log("3. Isolation enforced by the equation-style latex");
const isolation: Array<[string, string[], string[]]> = [
  // [spec latex, accepted spellings, rejected (equivalent but NOT isolated) lines]
  ["x=\\frac{12+3w}{8-w}", ["x=(12+3w)/(8-w)", "\\frac{12+3w}{8-w}"], ["x(8-w)=12+3w", "8x-wx=12+3w", "8x-3w=wx+12"]],
  ["a=\\frac{9b}{b-4}", ["a=9b/(b-4)", "a=\\frac{-9b}{4-b}"], ["a(b-4)=9b", "ab-4a=9b", "4a+9b=ab"]],
  ["x=\\frac{4+c}{9-c}", ["x=(c+4)/(9-c)"], ["x(9-c)=4+c", "9x-cx=4+c"]],
  ["x=\\frac{b+3}{5-a}", ["x=(3+b)/(5-a)"], ["x(5-a)=b+3", "ax+3=5x-b"]],
  ["h=\\frac{g+3}{g-1}", ["h=(3+g)/(g-1)"], ["h(g-1)=g+3", "gh-h=3+g"]],
  ["n=\\frac{5k}{2-k}", ["n=5k/(2-k)"], ["n(2-k)=5k", "kn+5k=2n"]],
  ["x^2=\\frac{3y}{y-5}", ["x^2=3y/(y-5)"], ["x^2(y-5)=3y", "yx^2-5x^2=3y"]],
  ["r=\\sqrt{\\frac{3V}{\\pi h}}", ["r=\\sqrt{3V/(\\pi h)}"], ["r^2=\\frac{3V}{\\pi h}", "\\pi r^2h=3V"]],
  ["h=\\frac{S-2\\pi r^2}{2\\pi r}", ["h=\\frac{S}{2\\pi r}-r"], ["2\\pi rh=S-2\\pi r^2"]],
  ["L=\\frac{gT^2}{4\\pi^2}", ["L=\\frac{gT^2}{4\\pi^2}", "L=0.25gT^2/\\pi^2"], ["\\frac{L}{g}=\\frac{T^2}{4\\pi^2}"]],
  ["r=\\sqrt{\\frac{A}{\\pi}}", ["r=\\sqrt{A/\\pi}"], ["r^2=\\frac{A}{\\pi}", "\\pi r^2=A"]],
  ["x=\\sqrt{y+11}", ["x=\\sqrt{11+y}"], ["x^2=y+11", "y=x^2-11"]],
  ["b=\\sqrt{c^2-a^2}", ["b=\\sqrt{-a^2+c^2}"], ["b^2=c^2-a^2"]],
  ["v=\\sqrt{\\frac{2E}{m}}", ["v=\\sqrt{2E/m}"], ["v^2=\\frac{2E}{m}", "mv^2=2E"]],
  ["t=\\frac{4g}{g-3}", ["t=4g/(g-3)"], ["t(g-3)=4g", "gt-3t=4g"]],
  ["y=\\frac{14-2c}{5-c}", ["y=(14-2c)/(5-c)"], ["y(5-c)=14-2c", "5y-cy=14-2c"]],
  ["s=\\frac{c(P+100)}{100}", ["s=(Pc+100c)/100", "s=c+\\frac{Pc}{100}"], []],
];

/**
 * Known leniency, reported not failed: the engine compares two equations up to ONE non-zero
 * constant factor, so a line that differs from the answer by a pure NUMBER (never by a letter)
 * is accepted even though the subject is not literally alone. It only bites where the subject's
 * coefficient collapses to a number, and the mark scheme line carries the form in those parts.
 */
const LENIENT: Array<[string, string]> = [
  ["L=\\frac{gT^2}{4\\pi^2}", "4\\pi^2L=gT^2"],
  ["s=\\frac{c(P+100)}{100}", "100s=c(P+100)"],
  ["s=\\frac{c(P+100)}{100}", "Pc=100s-100c"],
  ["x=\\frac{w}{4}", "4x=w"],
  ["x=3(y-4)", "\\frac{x}{3}=y-4"],
];
for (const [latex, yes, no] of isolation) {
  const spec = toAlgebraSpec({ kind: "algebraic", latex, equivalence: "equivalent", variables: [] } as never);
  for (const y of yes) {
    const v = checkAlgebraic(y, spec);
    if (!v.correct) fail(`"${y}" should be accepted by ${latex} (${v.reason})`);
  }
  for (const n of no) {
    const v = checkAlgebraic(n, spec);
    if (v.correct) fail(`"${n}" is NOT isolated but was accepted by ${latex}`);
  }
}
console.log(`  ${isolation.length} answers: equivalent-but-unisolated lines rejected, equivalent isolated spellings accepted`);
for (const [latex, line] of LENIENT) {
  const spec = toAlgebraSpec({ kind: "algebraic", latex, equivalence: "equivalent", variables: [] } as never);
  const v = checkAlgebraic(line, spec);
  console.log(`  ${v.correct ? "LENIENT (as documented)" : "rejected"}: "${line}" against ${latex}`);
}

// --- 4: KaTeX ----------------------------------------------------------------
console.log("4. KaTeX compile");
const texts: string[] = [];
const collect = (n: unknown) => {
  if (typeof n === "string") texts.push(n);
  else if (Array.isArray(n)) n.forEach(collect);
  else if (n && typeof n === "object") Object.values(n as Record<string, unknown>).forEach(collect);
};
collect(bundle);
collect(JSON.parse(blocksRaw));
let segs = 0;
for (const t of texts) {
  if (t.startsWith("data:image/svg+xml")) continue;
  const parts = t.split("$");
  if (parts.length < 3) continue;
  for (let i = 1; i < parts.length; i += 2) {
    const tex = parts[i];
    if (!tex.trim()) continue;
    segs++;
    try {
      katex.renderToString(tex, { throwOnError: true, displayMode: false });
    } catch (e) {
      fail(`KaTeX: "${tex}" → ${(e as Error).message.split("\n")[0]}`);
    }
  }
}
console.log(`  ${segs} $…$ segments compiled`);

// --- 5: house-style lint -----------------------------------------------------
console.log("5. Style lint");
const joined = texts.join("\n") + "\n" + blocksRaw;
for (const [label, re] of [
  ["exclamation mark", /!/],
  ["grade 9 label", /grade\s*9/i],
  ["US spelling 'color'", /\bcolor\b/i],
  ["US spelling 'math '", /\bmath\b/i],
] as Array<[string, RegExp]>) {
  const m = re.exec(joined);
  if (m) fail(`${label} found near: ${joined.slice(Math.max(0, m.index - 60), m.index + 60).replace(/\n/g, " ")}`);
}
const verdict = /\bwrong\b/gi;
const hits = [...joined.matchAll(verdict)];
if (hits.length) {
  for (const h of hits) console.log(`  NOTE "wrong" at: ...${joined.slice(Math.max(0, h.index - 70), h.index + 70).replace(/\n/g, " ")}...`);
}

// --- 6: SVG rule -------------------------------------------------------------
console.log("6. SVG rule");
const svgs = texts.filter((t) => t.includes("<svg"));
for (const s of svgs) {
  for (const bad of ["<style", "<script", "onclick", "onload", "prefers-color-scheme", "xlink:href", "http://", "https://"]) {
    if (s.includes(bad) && !(bad === "http://" && s.includes("http://www.w3.org/2000/svg"))) {
      fail(`SVG contains "${bad}"`);
    }
  }
  if (!s.includes("viewBox")) fail("SVG without a viewBox");
  const kb = Buffer.byteLength(s, "utf8") / 1024;
  if (kb > 12) fail(`SVG is ${kb.toFixed(1)} KB (limit 12)`);
}
console.log(`  ${svgs.length} SVGs: no style/script/external href, all have viewBox, largest ${Math.max(...svgs.map((s) => Buffer.byteLength(s, "utf8") / 1024)).toFixed(1)} KB`);

console.log(`\n${fails} failure(s).`);
process.exitCode = fails ? 1 : 0;
