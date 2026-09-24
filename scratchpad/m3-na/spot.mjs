import fs from "node:fs";
const show = (slug, qn, part) => {
  const b = JSON.parse(fs.readFileSync(`packs/maths/content/m3/${slug}/bundle.json`, "utf8"));
  const q = b.questions.find((x) => x.id.endsWith(qn));
  const p = q.parts.find((x) => x.id === part);
  console.log(`${slug} ${qn}(${part})  answer.kind=${p.answer.kind} ${p.answer.latex ?? JSON.stringify(p.answer.accepted ?? p.answer.value)}`);
  p.commonErrors.forEach((e, i) => console.log(`    #${i} ${e.pattern.kind} ${e.pattern.value ?? e.pattern.latex ?? e.pattern.regex}`));
};
show("algebraic-fractions-with-numerical-denominators", "0007", "main");
show("algebraic-fractions-with-numerical-denominators", "0009", "main");
show("solving-quadratic-equations-by-factorising", "0002", "a");
show("solving-quadratic-equations-by-factorising", "0006", "a");
show("solving-quadratic-equations-by-factorising", "0011", "a");
show("straight-lines-y-mx-c-equation-of-a-line-and-parallel-lines", "0008", "b");
show("straight-lines-y-mx-c-equation-of-a-line-and-parallel-lines", "0006", "a");
show("hcf-and-lcm-from-prime-factor-form", "0007", "main");
show("upper-and-lower-bounds-addition-and-multiplication", "0009", "a");
show("identities-and-expanding-double-brackets", "0010", "main");
