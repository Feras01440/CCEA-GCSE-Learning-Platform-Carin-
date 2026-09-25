/**
 * 25 Sep 2026 trial pass over fm1/algebraic-fractions-simplify: every changed or new answer spelling marked ON DISK
 * through the real engine. Gates through markGate (each option, and her position picks), prompts through
 * keywordsPresent (the chips under "Show the answer"), question 0011 through markAnswer (the answer in its spellings,
 * both common errors, the question typed back, a wrong form), find-the-mistake 02 through markFix, and the diagnostic
 * items' option records. Run from the project root:
 *   npx tsx scratchpad/fm1-batch-g/probe-trial-pass-0925.mts [--all]
 */
import fs from "node:fs";
import { markGate } from "../../src/components/items/gates.ts";
import { keywordsPresent } from "../../src/components/items/text-marking.ts";
import { markAnswer } from "../../src/components/items/mark.ts";
import { markFix } from "../../src/components/items/mistake-marking.ts";

const DIR = "packs/further-maths/content/fm1/algebraic-fractions-simplify";
const note = JSON.parse(fs.readFileSync(`${DIR}/note.blocks.json`, "utf8"));
const B = JSON.parse(fs.readFileSync(`${DIR}/bundle.json`, "utf8"));
const ID = (k: string, n: string) => `${k}.fm.u1.algebraic-fractions-simplify.${n}`;
let passes = 0;
let fails = 0;
const ok = (cond: boolean, label: string, detail = "") => {
  if (cond) passes++;
  else fails++;
  if (!cond || process.argv.includes("--all")) console.log(`${cond ? "ok  " : "FAIL"} ${label}${detail ? `  :: ${detail}` : ""}`);
};

// ---- gates: every option marks exactly as the answer says, by text and by position --------------------------------
const gates = note.filter((b: any) => b.type === "gate");
ok(gates.map((g: any) => g.id).join(",") === "g2,g12,g9,g13,g4,g10,g11,g8", "gate order", gates.map((g: any) => g.id).join(","));
for (const g of gates) {
  ok(g.options.includes(g.answer), `${g.id}: its answer is one of its options`);
  g.options.forEach((o: string, i: number) => {
    const want = o === g.answer;
    ok(markGate(g, o) === want, `${g.id} option "${o}" -> ${want}`);
    ok(markGate(g, String(i)) === want, `${g.id} position ${i} -> ${want}`);
  });
}
const g = (id: string) => gates.find((x: any) => x.id === id);
ok(g("g2").prompt === "What cancels in this fraction? $\\dfrac{x+4}{x}$", "g2 carries its fraction after the sentence (CD-01)", g("g2").prompt);
ok(g("g10").prompt === "Is this fully simplified? $\\dfrac{14}{7(x-9)}$", "g10 (replacing g5) carries its fraction after the sentence (CD-01)", g("g10").prompt);
for (const w of ["g1", "g3", "g5", "g6", "g7"]) {
  ok(!g(w), `${w} withdrawn from the note`);
  ok(new RegExp(`Gate ${w} withdrawn`).test(JSON.stringify(B.verification)), `${w} kept in full on the note's log with its reason`);
}
// the ruling's defect, checked for every gate and every shipped diagnostic: no maths it shows is a question's, a worked
// example's, a find-the-mistake line's or a prompt's own expression (TeX and plain spellings compared the same way)
{
  const plain = (s: string) =>
    String(s)
      .replace(/\^\{?2\}?|²/g, "^2")
      .replace(/\^\{?3\}?|³/g, "^3")
      .replace(/\\[dt]?frac\{([^{}]*)\}\{([^{}]*)\}/g, "($1)/($2)")
      .replace(/\s+over\s+/g, "/")
      .replace(/−/g, "-")
      .replace(/[\s{}$\\]|left|right/g, "")
      .replace(/[()]/g, "");
  // a whole expression inside the later text: not the front or the back of a longer one ("x^2+7x" is not "x^2+7x+10")
  const TERM = /[0-9x^+\-.]/;
  const contains = (l: string, t: string) => {
    for (let i = l.indexOf(t); i >= 0; i = l.indexOf(t, i + 1)) {
      const before = l[i - 1];
      const after = l[i + t.length];
      if ((before === undefined || !TERM.test(before)) && (after === undefined || !TERM.test(after))) return true;
    }
    return false;
  };
  const spans = (s: string) => [...String(s).matchAll(/\$([^$]+)\$/g)].map((m) => plain(m[1])).filter((t) => t.length >= 6);
  const later: string[] = [];
  for (const q of B.questions) for (const p of q.parts) later.push(plain(p.stem));
  for (const we of B.workedExamples) later.push(plain(we.stem), plain(we.twin.stem), ...we.steps.map((st: any) => plain(st.working)));
  for (const f of B.findTheMistake) later.push(plain(f.stem), ...f.studentWorking.map(plain), ...f.correction.map(plain));
  const shipped = (itemId: string) => B.verification.find((v: any) => v.itemId === itemId)?.status === "verified";
  for (const p of B.prompts.filter((x: any) => shipped(x.id))) later.push(plain(p.prompt));
  const ask = (where: string, text: string) => {
    for (const t of spans(text)) {
      const hit = later.find((l) => contains(l, t));
      ok(!hit, `${where}: "${t}" is not a later item's expression`, hit ?? "");
    }
  };
  for (const x of gates) ask(`gate ${x.id}`, [x.prompt, ...x.options, x.explain].join(" "));
  note.forEach((x: any, i: number) => {
    if (x.type === "p" || x.type === "callout") ask(`note block ${i}`, x.md);
  });
  const liveSet = B.diagnostics.find((d: any) => d.id === "dx.fm.u1.algebraic-fractions-simplify");
  for (const it of liveSet.items) ask(`dx ${it.id}`, [it.stem, ...it.options.map((o: any) => `${o.text} ${o.feedback}`)].join(" "));
}
for (const x of gates) ok(!/one tap/i.test(x.prompt), `${x.id} does not say One tap (CT-16)`);
for (const x of gates) ok(/^[\s\S]*\S/.test(x.explain) && !/second option|third option|first option/i.test(x.explain), `${x.id}: the explanation names no option by position (LD-01)`);

// ---- the note: hero lede, video, wired prompts ---------------------------------------------------------------------
const hero = note[0];
ok(!hero.lede.includes("\\dfrac"), "the lede uses \\frac, not \\dfrac", hero.lede);
const ledeWords = hero.lede.split(/\s+/).filter(Boolean).length;
const ledeSentences = hero.lede.split(/(?<=[.!?])\s+(?=[A-Z$])/).length;
ok(ledeWords <= 45 && ledeSentences === 2, `the lede is two sentences, at most 45 words (${ledeSentences}, ${ledeWords})`);
const video = note.find((b: any) => b.type === "video");
ok(video.end === 341 && video.corbettmathsNumber === 24 && !/below|scroll/i.test(video.why), "the video: 341 s, Corbettmaths 24, no page-scroll words", JSON.stringify(video));
const wired = note.filter((b: any) => b.type === "prompt").map((b: any) => b.promptId);
ok(JSON.stringify(wired) === JSON.stringify([ID("rp", "02"), ID("rp", "08")]), "the note wires rp.02 and rp.08 only", JSON.stringify(wired));

// ---- prompts: shipped ones short; withdrawn ones withdrawn; key-word chips on her spellings -----------------------
const statusOf = (itemId: string) => B.verification.find((v: any) => v.itemId === itemId)?.status;
for (const n of ["01", "04", "05", "06", "07"]) ok(statusOf(ID("rp", n)) === "withdrawn", `rp.${n} withdrawn`);
for (const n of ["02", "03", "08", "09", "10", "11", "12"]) {
  const p = B.prompts.find((x: any) => x.id === ID("rp", n));
  ok(statusOf(p.id) === "verified", `rp.${n} ships`);
  const w = p.answer.split(/\s+/).filter(Boolean).length;
  ok(w <= 25, `rp.${n} answer ${w} words (cap 25)`);
  ok(keywordsPresent(p.answer, p.keyWords).all, `rp.${n}: its own answer carries every key word`, JSON.stringify(keywordsPresent(p.answer, p.keyWords)));
}
const kw = (n: string, typed: string, all: boolean) => {
  const p = B.prompts.find((x: any) => x.id === ID("rp", n));
  const r = keywordsPresent(typed, p.keyWords);
  ok(r.all === all, `rp.${n} typed ${JSON.stringify(typed)} -> ${all ? "every key word" : "a key word missing"}`, JSON.stringify(r));
};
kw("08", "the numbers - check no numerical factor is left", true);
kw("08", "numbers, no common numerical factor top and bottom", true);
kw("08", "the brackets", false);
kw("09", "factorise top and bottom, common factor first", true);
kw("09", "factorise fully, take the common factor out first", true);
kw("09", "cancel", false);
kw("10", "(3x+2)(3x-2)", true);
kw("10", "(3x-2)(3x+2)", true);
kw("10", "(3x + 2)(3x - 2)", true);
kw("10", "(9x+2)(9x-2)", false);
kw("11", "the common factor 2", true);
kw("11", "take out the common factor, 2(x^2-121)", true);
kw("11", "2(x+11)(x-11)", false);
kw("12", "3/(x-13)", true);
kw("12", "3/(x - 13)", true);
kw("12", "\\frac{3}{x-13}", true);
kw("12", "3/(x+13)", false);
// engine finding, not a content fault: the key-word check drops brackets, so "4/x-7" (which reads as 4/x - 7) also
// gets the chip; the chip awards nothing, and the answer beside it shows the bracketed form
{
  const p = B.prompts.find((x: any) => x.id === ID("rp", "12"));
  const r = keywordsPresent("3/x-13", p.keyWords);
  console.log(`ENGINE rp.12 typed "3/x-13" -> ${r.all ? "chip shown (brackets ignored)" : "missing"}`);
}
// MK-15 reproduced on the withdrawn prompt: its TeX key word is what the chip printed
{
  const p7 = B.prompts.find((x: any) => x.id === ID("rp", "07"));
  const r = keywordsPresent("5/(x-4)", p7.keyWords);
  ok(true, `rp.07 (withdrawn) key word is TeX ${JSON.stringify(p7.keyWords)}; the engine now reads 5/(x-4) as ${r.all ? "present" : "missing"}`);
}

// ---- diagnostics: the live set, the withdrawn set, the new items ---------------------------------------------------
const live = B.diagnostics.find((d: any) => d.id === "dx.fm.u1.algebraic-fractions-simplify");
ok(live.items.map((i: any) => i.id).join(",") === "07,09,03,04,10,11,08", "live set order 07,09,03,04,10,11,08", live.items.map((i: any) => i.id).join(","));
ok(statusOf("dx.fm.u1.algebraic-fractions-simplify.withdrawn") === "withdrawn", "the withdrawn set is withdrawn");
ok(B.diagnostics.find((d: any) => d.id === "dx.fm.u1.algebraic-fractions-simplify.withdrawn").items.map((i: any) => i.id).join(",") === "01,02,05,06", "items 01, 02, 05 and 06 kept in it");
for (const it of live.items.filter((i: any) => ["07", "08", "09", "10", "11"].includes(i.id))) {
  ok(it.options.filter((o: any) => o.correct).length === 1, `dx ${it.id}: exactly one correct option`);
  for (const o of it.options) if (!o.correct) ok(typeof o.misconception === "string" && o.misconception.startsWith("fm.algfrac."), `dx ${it.id}/${o.id}: names a misconception`);
  // CT-20's rule is for items whose options are answers (07, 08, 11); 09 and 10 keep 02's and 05's described moves
  if (["07", "08", "11"].includes(it.id)) ok(!it.options.some((o: any) => /—|because|term|factor/.test(o.text)), `dx ${it.id}: no option carries its own reason (CT-20)`);
}

// ---- question 0011 through markAnswer -------------------------------------------------------------------------------
const q = B.questions.find((x: any) => x.id === ID("q", "0011"));
const part = q.parts[0];
const mark = (raw: string) => markAnswer(raw, part.answer, { marks: part.marks, commonErrors: part.commonErrors, prompt: part.stem, scheme: part.scheme } as never);
for (const raw of ["(2x+7)/(4(x-2))", "(2x + 7)/(4(x - 2))", "(2x+7)/(4x-8)", "\\frac{2x+7}{4(x-2)}", "(7+2x)/(4(x-2))"]) {
  const r = mark(raw);
  ok(r.correct && r.marksAwarded === 4, `q0011 ${JSON.stringify(raw)} earns 4 of 4`, JSON.stringify(r));
}
{
  const r = mark("(x+7)/(2(x-2))");
  ok(!r.correct && (r.tags ?? []).includes("fm.algfrac.cancel-across-addition"), "q0011 term-cancelled answer is recognised", JSON.stringify(r));
}
{
  const r = mark("(2x+7)/(x-2)");
  ok(!r.correct && (r.tags ?? []).includes("fm.algfrac.divide-before-factorise"), "q0011 bottom-divided answer is recognised", JSON.stringify(r));
}
{
  const r = mark("(2x^2+11x+14)/(4x^2-16)");
  ok(!r.correct && r.marksAwarded === 0, "q0011 the question typed back earns nothing", JSON.stringify(r));
}
{
  const r = mark("(2x+7)(x+2)/(4(x+2)(x-2))");
  ok(!r.correct, "q0011 the factorised line before cancelling is not the answer", JSON.stringify(r));
}
{
  const r = mark("(2x+7)/(2(x-2))");
  ok(!r.correct, "q0011 a wrong value is refused", JSON.stringify(r));
}

// ---- find-the-mistake 02 through markFix ----------------------------------------------------------------------------
const f = B.findTheMistake.find((x: any) => x.id === ID("ftm", "02"));
ok(f.mistakeLine === 1 && f.studentWorking.length === 4, "ftm.02 flags line 1 of four");
for (const line of f.studentWorking) ok(!markFix(line, f).match, `ftm.02 refuses her line ${JSON.stringify(line)}`, JSON.stringify(markFix(line, f)));
// a correction line that restates one of her own right lines (the bottom) is not a fix, and the box says so
const restated = f.correction.filter((c: string) => f.studentWorking.includes(c));
ok(restated.length === 1, "ftm.02: exactly one correction line restates her own (right) line", JSON.stringify(restated));
for (const t of [...f.correction.filter((c: string) => !restated.includes(c)), "3x(x + 9)", "3x² + 27x = 3x(x + 9)", "3x^2 + 27x = 3x(x+9)"]) ok(markFix(t, f).match, `ftm.02 accepts ${JSON.stringify(t)}`, JSON.stringify(markFix(t, f)));
for (const t of ["x(x + 9)", "x² + 9x", "x over (x - 3)", ...restated]) ok(!markFix(t, f).match, `ftm.02 refuses the non-fix ${JSON.stringify(t)}`, JSON.stringify(markFix(t, f)));

console.log(`probe-trial-pass-0925: ${passes} ok, ${fails} FAIL`);
process.exitCode = fails ? 1 : 0;
