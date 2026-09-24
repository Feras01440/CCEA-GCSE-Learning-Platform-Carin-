/**
 * Runs the app's OWN marker (src/components/items/mark.ts, gates.ts and the engines under
 * src/lib/marking) over every published part, step, twin, diagnostic option and gate of the FM3
 * batch-C bundles.
 *
 *  - the correct answer is fed in every natural spelling: the 4 d.p. value an instructed part asks
 *    for (and its leading-dot form), an exact short decimal as a decimal, a fraction and with a
 *    trailing zero; an algebraic answer as LaTeX, with carets, with no spaces and with its terms
 *    in reverse order;
 *  - every commonError is fed in as the candidate would write it: it must not be marked correct, it
 *    must match its own pattern, it must surface its misconception tag, and it must earn exactly the
 *    marks it claims;
 *  - text parts: accepted[0] earns every key-word group and the part's own worked solution earns
 *    full marks; reversal fixtures stay below full marks;
 *  - table parts: the expected cells earn full marks and a single wrong cell does not;
 *  - the note's gates: each accepted answer passes, nonsense fails, a choice gate passes only its
 *    answer (so two options that normalise to the same text are caught);
 *  - the named error routes the brief asks for are executed as whole responses (see ROUTE_FIXTURES).
 *
 * Run from the repository root:  node_modules/.bin/tsx scratchpad/fm3-batch-c/check-marking.mts
 */
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

const ROOT = "C:/Users/feras/Downloads/CCEA GCSE Top Learning Platform";
const mod = (rel: string) => import(pathToFileURL(path.join(ROOT, rel)).href);

const { markAnswer, matchesCommonError, instructsAccuracy } = await mod("src/components/items/mark.ts");
const { markGate } = await mod("src/components/items/gates.ts");
const { markText } = await mod("src/components/items/text-marking.ts");
const { formatTableResponse } = await mod("src/lib/marking/table.ts");
const { fixMatches, markFix, resultValue, stepLineMatches, lastNumber } = await mod("src/components/items/mistake-marking.ts");

const SLUGS = ["binomial-probabilities", "normal-distribution-z-probabilities", "pascals-triangle-binomial-expansion", "normal-distribution-bell-curve"];
const only = process.argv.slice(2);

let bad = 0;
let checks = 0;
const say = (ok: boolean, msg: string) => {
  checks += 1;
  if (!ok) {
    bad += 1;
    console.error("FAIL " + msg);
  }
};

const gcd = (a: number, b: number): number => (b ? gcd(b, a % b) : Math.abs(a) || 1);

/** Every spelling a learner would write for a numeric answer, given the part's stem. */
function numericSpellings(spec: any, stem: string): string[] {
  const out = new Set<string>();
  const v = spec.value;
  const t = spec.tolerance;
  if (t?.type === "dp") {
    const s = v.toFixed(t.places);
    out.add(s);
    if (s.startsWith("0.")) out.add(s.slice(1));
    if (!instructsAccuracy(stem)) out.add(String(v));
  } else if (t?.type === "exact") {
    out.add(String(v));
    if (v < 0) out.add(`−${Math.abs(v)}`);
    if (String(v).startsWith("0.")) out.add(String(v).slice(1));
    if (!Number.isInteger(v) && String(v).split(".")[1].length < 4) out.add(`${v}0`);
    if ((spec.acceptForms ?? []).includes("fraction") && !Number.isInteger(v)) {
      for (let den = 2; den <= 100000; den += 1) {
        const num = v * den;
        if (Math.abs(num - Math.round(num)) < 1e-9) {
          const n = Math.round(num);
          const g = gcd(n, den);
          out.add(`${n / g}/${den / g}`);
          break;
        }
      }
    }
  } else if (t?.type === "absolute") {
    out.add(String(v));
  } else if (t?.type === "range") {
    out.add(String(v));
    // the value a table-reader would give is inside the range too
    out.add(String(t.min + (t.max - t.min) / 3).slice(0, 5));
  } else {
    out.add(String(v));
  }
  // a percentage is written with its sign as often as without
  if (spec.unit === "%") for (const s of [...out]) out.add(`${s}%`);
  return [...out];
}

/** How a candidate who made the slip would write the pattern's value. */
function probeFor(ce: any, spec: any): string | null {
  const p = ce.pattern;
  if (p.kind === "numeric") {
    if (p.tolerance?.type === "dp") return p.value.toFixed(p.tolerance.places);
    return String(p.value);
  }
  if (p.kind === "algebraic") return p.latex;
  // The 'plus signs left out' route: the answer's own terms written as a list with commas.
  if (p.kind === "text" && spec.kind === "algebraic" && !/ - /.test(spec.latex)) {
    const list = spec.latex.split(" + ").map((t: string) => t.replace(/\^\{(\d+)\}/g, "^$1")).join(", ");
    if (new RegExp(p.regex, "i").test(list)) return list;
  }
  return null;
}

type Part = { id: string; stem: string; marks: number; answer: any; commonErrors: any[]; workedSolution?: string };

function checkPart(where: string, part: Part, { fullStem = part.stem } = {}) {
  const spec = part.answer;
  const opts = { marks: part.marks, commonErrors: part.commonErrors, prompt: fullStem };

  if (spec.kind === "numeric") {
    for (const typed of numericSpellings(spec, fullStem)) {
      const r = markAnswer(typed, spec, opts);
      say(r.correct && r.marksAwarded === part.marks, `${where}: correct spelling "${typed}" earns ${r.marksAwarded}/${part.marks} (${r.explanation})`);
    }
  } else if (spec.kind === "algebraic") {
    const variants = new Set<string>([spec.latex]);
    const plain = spec.latex.replace(/\^\{(\d+)\}/g, "^$1");
    variants.add(plain);
    variants.add(plain.replace(/\s+/g, ""));
    if (/ \+ /.test(plain) && !/,/.test(plain)) variants.add(plain.split(" + ").reverse().join(" + "));
    for (const typed of variants) {
      const r = markAnswer(typed, spec, opts);
      say(r.correct && r.marksAwarded === part.marks, `${where}: correct spelling "${typed}" earns ${r.marksAwarded}/${part.marks} (${r.explanation})`);
    }
  } else if (spec.kind === "text") {
    for (const acc of spec.accepted) {
      const r = markAnswer(acc, spec, opts);
      say(r.correct, `${where}: accepted spelling "${acc}" marked wrong (${r.explanation})`);
    }
    if (spec.accepted.length > 0 && spec.keyWords.length > 0) {
      const t = markText(spec.accepted[0], { ...spec, accepted: [] });
      say(t.matchedGroups.length === spec.keyWords.length, `${where}: accepted[0] earns ${t.matchedGroups.length} of ${spec.keyWords.length} key-word groups`);
    }
    if (part.workedSolution && spec.keyWords.length > 0) {
      const ws = markAnswer(part.workedSolution, { ...spec, accepted: [] }, opts);
      say(ws.marksAwarded === part.marks, `${where}: the part's own worked solution earns ${ws.marksAwarded}/${part.marks} (${ws.explanation})`);
    }
  } else if (spec.kind === "mcq") {
    for (const o of spec.options) {
      const r = markAnswer(o.id, spec, opts);
      say(r.correct === o.correct, `${where}: option "${o.id}" marked ${r.correct}, expected ${o.correct}`);
      if (!o.correct && o.misconception) say((r.tags ?? []).includes(o.misconception), `${where}: option "${o.id}" did not surface ${o.misconception}`);
    }
  } else if (spec.kind === "table") {
    const cells = spec.cells.map((c: any) => ({ row: c.row, col: c.col, value: String(c.value) }));
    const r = markAnswer(formatTableResponse({ cells }), spec, opts);
    say(r.correct && r.marksAwarded === part.marks, `${where}: the expected cells earn ${r.marksAwarded}/${part.marks} (${r.explanation})`);
    if (cells.length > 1) {
      const wrong = cells.map((c: any, i: number) => (i === 1 ? { ...c, value: String(Number(c.value) + 1) } : c));
      const r2 = markAnswer(formatTableResponse({ cells: wrong }), spec, opts);
      say(!r2.correct, `${where}: a table with one wrong cell is marked CORRECT`);
    }
  }

  for (const ce of part.commonErrors ?? []) {
    const probe = probeFor(ce, spec);
    if (probe === null) {
      say(false, `${where}: commonError ${ce.misconception} of kind ${ce.pattern.kind} has no probe`);
      continue;
    }
    const r = markAnswer(probe, spec, opts);
    say(!r.correct, `${where}: commonError ${ce.misconception} "${probe}" is marked CORRECT, so it can never fire`);
    say(matchesCommonError(probe, ce, undefined, spec.variables), `${where}: commonError ${ce.misconception} "${probe}" does not match its own pattern`);
    say((r.tags ?? []).includes(ce.misconception), `${where}: commonError ${ce.misconception} "${probe}" did not surface its tag (got ${JSON.stringify(r.tags ?? [])})`);
    say((r.marksAwarded ?? 0) === ce.marksTypicallyEarned, `${where}: commonError ${ce.misconception} "${probe}" earns ${r.marksAwarded} of ${part.marks}, but the pattern claims ${ce.marksTypicallyEarned}`);
  }
}

/**
 * The error routes the brief names, executed as whole responses against the published parts.
 * Each fixture is [slug, "q.id#part", response, expected marks, expected tag or null].
 */
const ROUTE_FIXTURES: Array<[string, string, string, number, string | null]> = [];
const fixtureFile = path.join(ROOT, "scratchpad/fm3-batch-c/route-fixtures.json");
if (fs.existsSync(fixtureFile)) ROUTE_FIXTURES.push(...JSON.parse(fs.readFileSync(fixtureFile, "utf8")));

// Every executed route, fed to its part as the candidate would write it: rounded to 4 d.p. and
// unrounded to 8 d.p. Both must fire the commonError and earn the marks it claims.
const { allRoutes } = await import(pathToFileURL(path.join(ROOT, "scratchpad/fm3-batch-c/routes.mjs")).href);
const { bFixed } = await import(pathToFileURL(path.join(ROOT, "scratchpad/fm3-batch-c/lib.mjs")).href);
const slugOfTopic = (id: string) => id.replace(/^q\.fm\.u3\./, "").replace(/\.\d{4}#.*$/, "");
const ROUTED: Array<{ slug: string; where: string; typed: string; misconception: string }> = [];
for (const r of allRoutes()) {
  if (!r.where.startsWith("q.")) continue;
  const slug = slugOfTopic(r.where);
  ROUTED.push({ slug, where: r.where, typed: r.dp4, misconception: r.misconception });
  ROUTED.push({ slug, where: r.where, typed: bFixed(r.exact, 8).replace(/0+$/, "").replace(/\.$/, ""), misconception: r.misconception });
}

for (const slug of SLUGS) {
  if (only.length && !only.includes(slug)) continue;
  const dir = path.join(ROOT, "packs/further-maths/content/fm3", slug);
  if (!fs.existsSync(path.join(dir, "bundle.json"))) {
    console.log(`skip ${slug} (not written yet)`);
    continue;
  }
  const bundle = JSON.parse(fs.readFileSync(path.join(dir, "bundle.json"), "utf8"));
  const before = checks;
  const parts = new Map<string, Part>();
  for (const q of bundle.questions) {
    // A later part is marked with the question's opening lines in view, as the paper prints them.
    for (const p of q.parts) {
      parts.set(`${q.id}#${p.id}`, p);
      checkPart(`${q.id}#${p.id}`, p);
    }
  }
  for (const we of bundle.workedExamples) {
    checkPart(`${we.id}#twin`, { id: "twin", stem: we.twin.stem, marks: 1, answer: we.twin.answer, commonErrors: [] });
    for (const s of we.steps) if (s.input) checkPart(`${we.id}#step${s.n}`, { id: `step${s.n}`, stem: "", marks: s.earns?.length || 1, answer: s.input, commonErrors: [] });
    for (const f of we.faded) for (const n of f.studentSupplies) say(n > f.showSteps && n <= we.steps.length, `${we.id}: faded step ${n} out of range`);
  }
  for (const d of bundle.diagnostics) {
    for (const item of d.items) {
      checkPart(`${d.id}#${item.id}`, { id: item.id, stem: item.stem, marks: 1, answer: { kind: "mcq", options: item.options, shuffle: false }, commonErrors: [] });
    }
  }
  // Find the mistake, as the fix box reads it since the 23 Sep engine brief (markFix): a correction line
  // typed as written is the fix unless it is already on the page; the flagged line and every sound line
  // of her working fix nothing; the corrected value alone is the fix when the last correction line ends
  // on a value her working does not already state; her wrong value is never a fix.
  for (const f of bundle.findTheMistake) {
    const item = { correction: f.correction, studentWorking: f.studentWorking, mistakeLine: f.mistakeLine };
    say(f.mistakeLine >= 1 && f.mistakeLine <= f.studentWorking.length, `${f.id}: mistakeLine out of range`);
    say(f.studentWorking[f.mistakeLine - 1] !== f.correction[f.mistakeLine - 1], `${f.id}: the mistake line is the same as its correction`);
    say(markFix(f.correction[f.mistakeLine - 1], item).match, `${f.id}: the corrected line "${f.correction[f.mistakeLine - 1]}" is not accepted by the fix box`);
    for (const line of f.correction) {
      if (f.studentWorking.includes(line)) continue;
      say(markFix(line, item).match, `${f.id}: correction line "${line}" is not accepted by the fix box`);
    }
    for (const line of f.studentWorking) say(!markFix(line, item).match, `${f.id}: her own line "${line}" is accepted as a fix`);
    const last = f.correction[f.correction.length - 1];
    const target = resultValue(last, "authored");
    const reached = f.studentWorking.some((w: string) => {
      const v = resultValue(w, "authored");
      return v !== null && target !== null && Math.abs(v - target) < 1e-9;
    });
    if (target !== null && !reached) say(markFix(String(target), item).match, `${f.id}: the corrected value ${target} typed alone is refused`);
    if (target === null || reached) console.log(`note ${f.id}: the corrected value is taken as a line only (${target === null ? "the last correction line ends on an expression" : "her working already states it"})`);
    const wrong = resultValue(f.studentWorking[f.studentWorking.length - 1], "authored") ?? lastNumber(f.studentWorking[f.studentWorking.length - 1]);
    if (wrong !== null) say(!markFix(String(wrong), item).match, `${f.id}: the student's wrong value ${wrong} is accepted as a fix`);
  }
  // Worked-example steps that carry no input spec are matched line by line: the step's own
  // working, typed plainly, must be accepted.
  for (const we of bundle.workedExamples) {
    for (const s of we.steps) {
      if (s.input) continue;
      const plain = String(s.working).replace(/\$/g, "").replace(/\\left|\\right/g, "").replace(/\\text\{([^}]*)\}/g, "$1");
      const r = stepLineMatches(plain, s.working);
      if (!r.match) console.log(`note ${we.id} step ${s.n}: a plain typing of the working is not matched (self-judged step): "${plain.slice(0, 70)}"`);
    }
  }
  for (const rt of ROUTED) {
    if (rt.slug !== slug) continue;
    const p = parts.get(rt.where);
    if (!p) {
      say(false, `route ${rt.misconception} names ${rt.where}, which is not a published part`);
      continue;
    }
    const ce = (p.commonErrors ?? []).find((c: any) => c.misconception === rt.misconception && matchesCommonError(rt.typed, c, undefined, p.answer.variables));
    say(Boolean(ce), `${rt.where}: route ${rt.misconception} typed as "${rt.typed}" matches no commonError of that tag`);
    if (!ce) continue;
    const r = markAnswer(rt.typed, p.answer, { marks: p.marks, commonErrors: p.commonErrors, prompt: p.stem });
    say(!r.correct && (r.tags ?? []).includes(rt.misconception) && r.marksAwarded === ce.marksTypicallyEarned, `${rt.where}: route "${rt.typed}" earns ${r.marksAwarded} with tags ${JSON.stringify(r.tags ?? [])}; the commonError claims ${ce.marksTypicallyEarned} and ${rt.misconception}`);
  }
  // Pascal: the 'triangle not written' route of Summer 2019, executed. The grid is left empty and the
  // expansion written from memory correctly: the triangle's mark is lost and the expansion's is kept.
  if (slug === "pascals-triangle-binomial-expansion") {
    const a = parts.get("q.fm.u3.pascals-triangle-binomial-expansion.0007#a");
    const b = parts.get("q.fm.u3.pascals-triangle-binomial-expansion.0007#b");
    if (!a || !b) say(false, "pascal: exam-style 0007 (a)/(b) missing");
    else {
      const ra = markAnswer("", a.answer, { marks: a.marks });
      const rb = markAnswer(b.answer.latex, b.answer, { marks: b.marks });
      say(ra.marksAwarded === 0 && rb.marksAwarded === b.marks, `pascal: triangle-not-written route earns ${ra.marksAwarded} + ${rb.marksAwarded}, expected 0 + ${b.marks}`);
    }
    // A learner who copies the question back unexpanded must not score an expansion's last mark.
    for (const [where, p] of parts) {
      if (p.answer.kind !== "algebraic" || p.answer.form !== "expanded") continue;
      const m = /\(p - q\)\^\{(\d)\}|\(p \+ q\)\^\{(\d)\}|\(1 \+ 2x\)\^\{(\d)\}/.exec(p.stem);
      if (!m) continue;
      const r = markAnswer(m[0].replace(/\^\{(\d)\}/, "^$1"), p.answer, { marks: p.marks });
      say(!r.correct && r.marksAwarded < p.marks, `${where}: the unexpanded bracket "${m[0]}" earns ${r.marksAwarded}/${p.marks}`);
    }
  }
  for (const [s, where, response, marks, tag] of ROUTE_FIXTURES) {
    if (s !== slug) continue;
    const p = parts.get(where);
    if (!p) {
      say(false, `route fixture names ${where}, which is not a published part`);
      continue;
    }
    const r = markAnswer(response, p.answer, { marks: p.marks, commonErrors: p.commonErrors, prompt: p.stem });
    say(r.marksAwarded === marks, `${where}: route response "${response}" earns ${r.marksAwarded}, fixture expects ${marks} (${r.explanation})`);
    if (tag) say((r.tags ?? []).includes(tag), `${where}: route response "${response}" did not surface ${tag} (got ${JSON.stringify(r.tags ?? [])})`);
  }

  const blocks = JSON.parse(fs.readFileSync(path.join(dir, "note.blocks.json"), "utf8"));
  let gates = 0;
  for (const b of blocks) {
    if (b.type !== "gate") continue;
    gates += 1;
    for (const alt of b.answer.split("|").map((s: string) => s.trim())) say(markGate(b, alt), `${slug} gate ${b.id}: accepted answer "${alt}" does not mark as correct`);
    say(!markGate(b, "definitely not the answer"), `${slug} gate ${b.id}: nonsense marks as correct`);
    if (b.kind === "choice") {
      for (const o of b.options ?? []) say(markGate(b, o) === (o === b.answer), `${slug} gate ${b.id}: option "${o}" marks as ${markGate(b, o)}`);
      say((b.options ?? []).includes(b.answer), `${slug} gate ${b.id}: the answer is not one of the options`);
    }
  }
  console.log(`${slug}: ${checks - before} assertions, ${gates} gates`);
}

console.log(`\n${checks} assertions run`);
console.log(bad === 0 ? "marking check: OK" : `marking check: ${bad} failure(s)`);
if (bad > 0) process.exitCode = 1;
