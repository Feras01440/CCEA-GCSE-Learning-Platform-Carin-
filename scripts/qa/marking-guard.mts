/**
 * The marking guard: every published answer, common error, gate, find-the-mistake fix and worked-example twin put
 * through the real marking engine, so "right answers refused, wrong answers paid" is a number, not an impression.
 *
 * The probes, per published topic (src/generated/manifest.json, written by the content build):
 *   R-answer  each question part's own answer, typed as the feedback card prints it, earns every mark;
 *   R-latex   an algebraic part's answer typed as its LaTeX earns every mark;
 *   R-form    a numeric part's answer typed in the form the question demands (7/11, 3√5 cm, 49π, 2.7 × 10^3), and as a
 *             fraction wherever a fraction is accepted, earns every mark;
 *   W-eq      a chemical equation part's own equation, unbalanced (coefficients dropped), without its state symbols
 *             where they are required, or with its sides swapped, never earns every mark;
 *   W-error   each common error's own value (numeric, algebraic, matrix patterns) is not marked right and is not
 *             paid in full; `overpaid` also lists an error paid more than its marksTypicallyEarned;
 *   R-twin    each worked example's twin answer earns every mark; R-step each step `input`;
 *   R-gate    each note gate's answer is right; W-gate each other option of a choice gate is not;
 *   R-fix     each find-the-mistake item's last correction line (and the corrected line itself, where the correction
 *             rewrites it) is accepted as the fix; W-fix the flagged line, retyped, is not.
 * Graph, drawing, annotation and long-text parts are counted as not probed: their answers are not a string.
 *
 * Run:  npx tsx scripts/qa/marking-guard.mts                      (summary and every failure)
 *       npx tsx scripts/qa/marking-guard.mts --out a.json         (also write every verdict)
 *       npx tsx scripts/qa/marking-guard.mts --baseline a.json    (list verdicts that changed since a.json)
 *       --packs <dir> --manifest <file>                           (content from another tree: run the script from an
 *                                                                  older engine's worktree against today's content)
 * Exit code 1 when a probe fails, so it can gate a build.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { markAnswer, instructsAccuracy } from "../../src/components/items/mark.ts";
import { expectedDisplay } from "../../src/components/items/spec-map.ts";
import { markGate } from "../../src/components/items/gates.ts";
import { markFix } from "../../src/components/items/mistake-marking.ts";

type AnyObj = Record<string, any>;

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
const argv = process.argv.slice(2);
const flag = (name: string): string | undefined => {
  const i = argv.indexOf(name);
  return i >= 0 ? argv[i + 1] : undefined;
};
const PACKS = path.resolve(flag("--packs") ?? path.join(ROOT, "packs"));
const MANIFEST = path.resolve(flag("--manifest") ?? path.join(ROOT, "src", "generated", "manifest.json"));
const OUT = flag("--out");
const BASELINE = flag("--baseline");
const QUIET = argv.includes("--quiet");

type Kind = "R-answer" | "R-latex" | "R-form" | "W-eq" | "W-error" | "R-twin" | "R-step" | "R-gate" | "W-gate" | "R-fix" | "W-fix";

interface Verdict {
  key: string;
  kind: Kind;
  topic: string;
  item: string;
  raw: string;
  pass: boolean;
  correct: boolean;
  awarded?: number;
  available?: number;
  typical?: number;
  recognised?: boolean;
  overpaid?: boolean;
  note?: string;
}

const verdicts: Verdict[] = [];
let notProbed = 0;
const notProbedKinds = new Map<string, number>();

const stripDollars = (s: string) => s.trim().replace(/^\$+|\$+$/g, "").trim();

// The probe's own spelling of a value in a demanded form, independent of the engine under test (the old engine has no
// formatter to lend, and an oracle should not borrow the code it checks).
const near = (a: number, b: number) => Math.abs(a - b) <= 1e-9 * Math.max(1, Math.abs(a), Math.abs(b));
function ratio(v: number, maxDen: number): [number, number] | null {
  for (let q = 1; q <= maxDen; q += 1) {
    const p = Math.round(v * q);
    if (near(p / q, v)) {
      const g = (a: number, b: number): number => (b === 0 ? Math.abs(a) : g(b, a % b));
      const d = g(p, q) || 1;
      return [p / d, q / d];
    }
  }
  return null;
}
const sqfree = (n: number) => {
  for (let d = 2; d * d <= n; d += 1) if (n % (d * d) === 0) return false;
  return true;
};
function withSymbol(p: number, q: number, sym: string): string {
  const sign = p < 0 ? "-" : "";
  const top = Math.abs(p) === 1 ? sym : `${Math.abs(p)}${sym}`;
  return q === 1 ? `${sign}${top}` : `${sign}${top}/${q}`;
}
function spell(v: number, form: string): string | null {
  if (form === "fraction" || form === "mixed") {
    const r = ratio(v, 5000);
    if (!r) return null;
    const [p, q] = r;
    if (q === 1) return String(p);
    if (form === "mixed" && Math.abs(p) > q) {
      const whole = Math.trunc(p / q);
      return `${whole} ${Math.abs(p) - Math.abs(whole) * q}/${q}`;
    }
    return `${p}/${q}`;
  }
  if (form === "surd") {
    const w = ratio(v, 1);
    if (w) return String(w[0]);
    for (let b = 2; b <= 2000; b += 1) {
      if (!sqfree(b)) continue;
      const r = ratio(v / Math.sqrt(b), 500);
      if (r) return withSymbol(r[0], r[1], `√${b}`);
    }
    return null;
  }
  if (form === "pi") {
    const r = ratio(v / Math.PI, 500);
    return r ? withSymbol(r[0], r[1], "π") : null;
  }
  if (form === "standardForm") {
    if (v === 0) return "0";
    let n = Math.floor(Math.log10(Math.abs(v)));
    let a = Number((v / 10 ** n).toPrecision(10));
    if (Math.abs(a) >= 10) [a, n] = [Number((a / 10).toPrecision(10)), n + 1];
    if (Math.abs(a) < 1) [a, n] = [Number((a * 10).toPrecision(10)), n - 1];
    return `${a} × 10^${n}`;
  }
  return null;
}

/** Chemical-equation mutations a learner could write that must never earn every mark. */
function equationMutations(spec: AnyObj): string[] {
  if (spec.kindOf === "physics") return [];
  const eq = String(spec.balancedLatex);
  const out: string[] = [];
  const arrow = /\\rightarrow|\\longrightarrow|\\to\b|->|→/;
  const reversible = /rightleftharpoons|⇌|leftrightarrow/.test(eq);
  const coeffs = [...eq.matchAll(/(?:^|\+|->|→|\\rightarrow|\\longrightarrow|\\to\b)\s*(\d+)\s*(?=[A-Z(\\]|e\^|e\s*-)/g)].map((m) => m[1]);
  if (coeffs.length > 0) {
    const stripped = eq.replace(/((?:^|\+|->|→|\\rightarrow|\\longrightarrow|\\to\b)\s*)(\d+)\s*(?=[A-Z(\\]|e\^|e\s*-)/g, "$1");
    if (stripped !== eq) out.push(stripped);
  }
  if (spec.stateSymbolsRequired) {
    const bare = eq.replace(/\s*\((s|l|g|aq)\)/gi, "");
    if (bare !== eq) out.push(bare);
  }
  const m = arrow.exec(eq);
  if (m && !reversible) {
    const [left, right] = [eq.slice(0, m.index).trim(), eq.slice(m.index + m[0].length).trim()];
    if (left && right && left !== right) out.push(`${right} ${m[0]} ${left}`);
  }
  return out;
}

/** What a learner who knows the answer types, as the field would submit it; [] when the answer is not a string. */
function rightRaws(spec: AnyObj, prompt: string | undefined): string[] {
  switch (spec.kind) {
    case "numeric": {
      const unit = spec.unit ? ` ${spec.unit}` : "";
      if (spec.tolerance?.type === "range") return [`${spec.value}${unit}`];
      const shown = expectedDisplay(spec as any, { accuracyInstructed: instructsAccuracy(prompt) });
      const forms = (spec.acceptForms ?? []) as string[];
      const out: string[] = [];
      if (forms.includes("decimal") || forms.length === 0) out.push(shown.includes("$") ? `${Number(Number(spec.value).toPrecision(12))}${unit}` : shown);
      else if (!["fraction", "mixed", "surd", "pi", "standardForm"].some((f) => forms.includes(f))) out.push(shown.replace(/\$/g, ""));
      return out;
    }
    case "algebraic":
      return [stripDollars(expectedDisplay(spec as any))];
    case "mcq":
      return [spec.options.filter((o: AnyObj) => o.correct).map((o: AnyObj) => o.id).join(",")];
    case "text": {
      if (spec.accepted.length > 0) return [spec.accepted[0]];
      // One key word per group, never the same word twice (a key word earns one group only).
      const used = new Set<string>();
      const words: string[] = [];
      for (const g of spec.keyWords as AnyObj[]) {
        const w = (g.any as string[]).find((a) => !used.has(a.toLowerCase()));
        if (!w) return [];
        used.add(w.toLowerCase());
        words.push(w);
      }
      return words.length ? [words.join(", ")] : [];
    }
    case "equation":
      return [spec.balancedLatex];
    case "order":
      return [spec.correctOrder.join(",")];
    case "steps":
      return [spec.expectedOrder.map((_: unknown, i: number) => i).join(",")];
    case "table":
      // A text cell written with alternatives ("lilac/purple") is answered with one of them.
      return [JSON.stringify({ cells: spec.cells.map((c: AnyObj) => ({ row: c.row, col: c.col, value: typeof c.value === "string" ? c.value.split("/")[0]!.trim() : String(c.value) })) })];
    case "matrix":
      return [expectedDisplay(spec as any).replace(/\$/g, "")];
    case "label":
      return [JSON.stringify({ labels: Object.fromEntries(spec.targets.map((t: AnyObj) => [t.id, t.accepted[0]])) })];
    default:
      return [];
  }
}

/** A common error's own wrong answer as a learner would type it; null for patterns that are not one string. */
function errorRaw(err: AnyObj, spec: AnyObj): string | null {
  const p = err.pattern;
  if (p.kind === "numeric") return spec.kind === "numeric" && spec.unit && spec.unitRequired ? `${p.value} ${spec.unit}` : String(p.value);
  if (p.kind === "algebraic") return p.latex;
  if (p.kind === "matrix") {
    const body = (p.entries as string[][]).map((row) => row.join(" & ")).join(" \\\\ ");
    return `\\begin{pmatrix}${body}\\end{pmatrix}`;
  }
  return null;
}

function record(v: Omit<Verdict, "key">, index: number) {
  verdicts.push({ ...v, key: `${v.topic}|${v.item}|${v.kind}|${index}` });
}

function probePart(topic: string, item: string, part: AnyObj) {
  const spec = part.answer;
  const marks = part.marks ?? 1;
  const opts = { marks, commonErrors: part.commonErrors, prompt: part.stem, scheme: part.scheme };
  const raws = rightRaws(spec, part.stem);
  const formCovered = spec.kind === "numeric" && ((spec.acceptForms ?? []) as string[]).some((f) => ["fraction", "mixed", "surd", "pi", "standardForm"].includes(f));
  if (raws.length === 0 && !formCovered) {
    notProbed += 1;
    notProbedKinds.set(spec.kind, (notProbedKinds.get(spec.kind) ?? 0) + 1);
  }
  raws.forEach((raw, i) => {
    const r = markAnswer(raw, spec, opts);
    record({ kind: "R-answer", topic, item, raw, pass: r.correct && r.marksAwarded === r.marksAvailable, correct: r.correct, awarded: r.marksAwarded, available: r.marksAvailable, note: r.correct ? undefined : r.explanation }, i);
  });
  // An accuracy the stem instructs ("to 2 decimal places") is a demand for the decimal, whatever else the spec lists.
  if (spec.kind === "numeric" && spec.tolerance?.type !== "range" && !instructsAccuracy(part.stem)) {
    const unit = spec.unit ? ` ${spec.unit}` : "";
    const forms = (spec.acceptForms ?? []) as string[];
    const wanted = forms.includes("decimal") ? forms.filter((f) => f === "fraction" || f === "mixed") : forms;
    for (const f of wanted) {
      const sp = spell(Number(spec.value), f);
      if (sp === null) continue;
      if (forms.includes("decimal") && /^-?\d+$/.test(sp)) break;
      const raw = `${sp}${unit}`;
      const r = markAnswer(raw, spec, opts);
      record({ kind: "R-form", topic, item, raw, pass: r.correct && r.marksAwarded === r.marksAvailable, correct: r.correct, awarded: r.marksAwarded, available: r.marksAvailable, note: r.correct ? undefined : r.explanation }, 0);
      break;
    }
  }
  if (spec.kind === "equation") {
    equationMutations(spec).forEach((raw, i) => {
      const r = markAnswer(raw, spec, opts);
      record({ kind: "W-eq", topic, item, raw, pass: !r.correct && r.marksAwarded < r.marksAvailable, correct: r.correct, awarded: r.marksAwarded, available: r.marksAvailable, note: r.explanation }, i);
    });
  }
  if (spec.kind === "algebraic") {
    const r = markAnswer(spec.latex, spec, opts);
    record({ kind: "R-latex", topic, item, raw: spec.latex, pass: r.correct && r.marksAwarded === r.marksAvailable, correct: r.correct, awarded: r.marksAwarded, available: r.marksAvailable, note: r.correct ? undefined : r.explanation }, 0);
  }
  (part.commonErrors ?? []).forEach((err: AnyObj, i: number) => {
    const raw = errorRaw(err, spec);
    if (raw === null) return;
    // An accepted error is a right answer with a note: it must be marked right with every mark.
    if (err.accepted === true) {
      const r = markAnswer(raw, spec, opts);
      record({ kind: "R-answer", topic, item, raw, pass: r.correct && r.marksAwarded === r.marksAvailable, correct: r.correct, awarded: r.marksAwarded, available: r.marksAvailable, note: r.explanation }, 100 + i);
      return;
    }
    const r = markAnswer(raw, spec, opts);
    const recognised = (r.tags ?? []).includes(err.misconception);
    record(
      {
        kind: "W-error",
        topic,
        item,
        raw,
        pass: !r.correct && r.marksAwarded < r.marksAvailable,
        correct: r.correct,
        awarded: r.marksAwarded,
        available: r.marksAvailable,
        typical: err.marksTypicallyEarned,
        recognised,
        overpaid: r.marksAwarded > err.marksTypicallyEarned,
        note: r.explanation,
      },
      i,
    );
  });
}

interface ManifestTopic {
  id: string;
  subject: string;
  unit: string;
  slug: string;
}

const manifest = JSON.parse(fs.readFileSync(MANIFEST, "utf8")) as { topics: ManifestTopic[] };
const started = Date.now();
let topics = 0;
for (const t of manifest.topics) {
  const dir = path.join(PACKS, t.subject, "content", t.unit.toLowerCase(), t.slug);
  const bundleFile = path.join(dir, "bundle.json");
  if (!fs.existsSync(bundleFile)) continue;
  topics += 1;
  const b = JSON.parse(fs.readFileSync(bundleFile, "utf8")) as AnyObj;
  for (const q of (b.questions ?? []) as AnyObj[]) for (const part of q.parts ?? []) probePart(t.id, `${q.id}#${part.id}`, part);
  for (const we of (b.workedExamples ?? []) as AnyObj[]) {
    const stepMarks = (we.steps ?? []).reduce((a: number, s: AnyObj) => a + (s.earns?.length ?? 0), 0) || 1;
    if (we.twin?.answer) {
      const tw = we.twin.answer;
      const twinRaws = rightRaws(tw, we.twin.stem);
      if (tw.kind === "numeric" && tw.tolerance?.type !== "range" && !instructsAccuracy(we.twin.stem)) {
        const forms = (tw.acceptForms ?? []) as string[];
        const wanted = forms.includes("decimal") ? forms.filter((f) => f === "fraction" || f === "mixed") : forms;
        for (const f of wanted) {
          const sp = spell(Number(tw.value), f);
          if (sp === null || (forms.includes("decimal") && /^-?\d+$/.test(sp))) continue;
          twinRaws.push(`${sp}${tw.unit ? ` ${tw.unit}` : ""}`);
          break;
        }
      }
      twinRaws.forEach((raw, i) => {
        const r = markAnswer(raw, we.twin.answer, { marks: stepMarks, prompt: we.twin.stem });
        record({ kind: "R-twin", topic: t.id, item: `${we.id}#twin`, raw, pass: r.correct && r.marksAwarded === r.marksAvailable, correct: r.correct, awarded: r.marksAwarded, available: r.marksAvailable, note: r.correct ? undefined : r.explanation }, i);
      });
    }
    for (const s of (we.steps ?? []) as AnyObj[]) {
      if (!s.input) continue;
      rightRaws(s.input, undefined).forEach((raw, i) => {
        const r = markAnswer(raw, s.input, { marks: s.earns?.length ?? 1 });
        record({ kind: "R-step", topic: t.id, item: `${we.id}#step${s.n}`, raw, pass: r.correct && r.marksAwarded === r.marksAvailable, correct: r.correct, awarded: r.marksAwarded, available: r.marksAvailable, note: r.correct ? undefined : r.explanation }, i);
      });
    }
  }
  for (const f of (b.findTheMistake ?? []) as AnyObj[]) {
    const item = { correction: f.correction ?? [], studentWorking: f.studentWorking ?? [], mistakeLine: f.mistakeLine };
    const flagged = item.studentWorking[item.mistakeLine - 1];
    const onPage = (line: string) => item.studentWorking.some((w: string) => w.trim() === line.trim());
    const rights: string[] = [];
    const last = item.correction[item.correction.length - 1];
    if (last && !onPage(last)) rights.push(last);
    const fixed = item.correction[item.mistakeLine - 1];
    if (fixed && fixed !== last && !onPage(fixed)) rights.push(fixed);
    rights.forEach((raw, i) => {
      const m = markFix(raw, item);
      record({ kind: "R-fix", topic: t.id, item: f.id, raw, pass: m.match, correct: m.match }, i);
    });
    if (flagged) {
      const m = markFix(flagged, item);
      record({ kind: "W-fix", topic: t.id, item: f.id, raw: flagged, pass: !m.match, correct: m.match }, 0);
    }
  }
  const blocksFile = path.join(dir, "note.blocks.json");
  if (fs.existsSync(blocksFile)) {
    const raw = JSON.parse(fs.readFileSync(blocksFile, "utf8"));
    const blocks = (Array.isArray(raw) ? raw : (raw.blocks ?? [])) as AnyObj[];
    for (const g of blocks.filter((x) => x.type === "gate")) {
      const answer = g.kind === "choice" ? String(g.answer) : String(g.answer).split("|")[0]!.trim();
      const ok = markGate(g as any, answer);
      record({ kind: "R-gate", topic: t.id, item: `gate:${g.id}`, raw: answer, pass: ok, correct: ok }, 0);
      if (g.kind === "choice") {
        (g.options ?? []).filter((o: string) => o.trim() !== String(g.answer).trim()).forEach((o: string, i: number) => {
          const wrong = markGate(g as any, o);
          record({ kind: "W-gate", topic: t.id, item: `gate:${g.id}`, raw: o, pass: !wrong, correct: wrong }, i);
        });
      }
    }
  }
}

// ---------------------------------------------------------------------------------------------------------------
// Report
// ---------------------------------------------------------------------------------------------------------------

const ALLOW_FILE = path.join(ROOT, "scripts", "qa", "marking-guard.allow.json");
const allowed: Record<string, string> = fs.existsSync(ALLOW_FILE) ? (JSON.parse(fs.readFileSync(ALLOW_FILE, "utf8")).allow ?? {}) : {};

const KINDS: Kind[] = ["R-answer", "R-latex", "R-form", "W-eq", "W-error", "R-twin", "R-step", "R-gate", "W-gate", "R-fix", "W-fix"];
const failures = verdicts.filter((v) => !v.pass && !(v.key in allowed));
const allowedFailures = verdicts.filter((v) => !v.pass && v.key in allowed);
const staleAllow = Object.keys(allowed).filter((k) => !verdicts.some((v) => v.key === k && !v.pass));
const lines: string[] = [];
lines.push(`marking guard: ${topics} topics, ${verdicts.length} probes in ${((Date.now() - started) / 1000).toFixed(1)} s; ${notProbed} parts not probed (${[...notProbedKinds].map(([k, n]) => `${k} ${n}`).join(", ") || "none"})`);
for (const k of KINDS) {
  const all = verdicts.filter((v) => v.kind === k);
  if (all.length === 0) continue;
  const bad = all.filter((v) => !v.pass && !(v.key in allowed)).length;
  const known = all.filter((v) => !v.pass && v.key in allowed).length;
  lines.push(`  ${k.padEnd(9)} ${String(all.length - bad - known).padStart(6)} of ${String(all.length).padEnd(6)} pass${bad ? `   ${bad} FAIL` : ""}${known ? `   ${known} known (allow list)` : ""}`);
}
const werr = verdicts.filter((v) => v.kind === "W-error");
const unrecognised = werr.filter((v) => v.pass && !v.recognised).length;
const overpaid = werr.filter((v) => v.pass && v.overpaid);
lines.push(`  common errors not named by their own misconception tag when typed: ${unrecognised} of ${werr.length}; paid above marksTypicallyEarned: ${overpaid.length}`);
if (!QUIET && failures.length) {
  lines.push("", "Failures:");
  for (const v of failures) {
    const marks = v.available !== undefined ? ` ${v.awarded}/${v.available}` : "";
    lines.push(`  ${v.kind.padEnd(9)} ${v.topic} ${v.item}  typed ${JSON.stringify(v.raw).slice(0, 140)} →${marks} ${v.correct ? "RIGHT" : "not right"}${v.note ? `  | ${v.note.slice(0, 160)}` : ""}`);
  }
}
if (allowedFailures.length) {
  lines.push("", `Known and queued (scripts/qa/marking-guard.allow.json): ${allowedFailures.length}`);
  if (!QUIET) for (const v of allowedFailures) lines.push(`  ${v.kind.padEnd(9)} ${v.topic} ${v.item}: ${allowed[v.key]}`);
}
if (staleAllow.length) lines.push("", `Allow-list entries that no longer fail (remove them): ${staleAllow.join(", ")}`);
if (!QUIET && overpaid.length) {
  lines.push("", "Paid above the marks the error typically earns (not a failure; worth a look):");
  for (const v of overpaid.slice(0, 80)) lines.push(`  ${v.topic} ${v.item} typed ${JSON.stringify(v.raw).slice(0, 100)} → ${v.awarded}/${v.available}, typically ${v.typical}`);
  if (overpaid.length > 80) lines.push(`  … and ${overpaid.length - 80} more`);
}

if (BASELINE) {
  const before = new Map<string, Verdict>((JSON.parse(fs.readFileSync(BASELINE, "utf8")) as Verdict[]).map((v) => [v.key, v]));
  const regressions: string[] = [];
  const improvements: string[] = [];
  const marksChanged: string[] = [];
  for (const v of verdicts) {
    const b = before.get(v.key);
    if (!b || b.raw !== v.raw) continue;
    const describe = (x: Verdict) => `${x.correct ? "RIGHT" : "not right"}${x.available !== undefined ? ` ${x.awarded}/${x.available}` : ""}`;
    const line = `  ${v.kind.padEnd(9)} ${v.topic} ${v.item}  typed ${JSON.stringify(v.raw).slice(0, 120)}: was ${describe(b)}, now ${describe(v)}`;
    if (b.pass && !v.pass) regressions.push(line);
    else if (!b.pass && v.pass) improvements.push(line);
    else if (b.awarded !== v.awarded || b.correct !== v.correct) marksChanged.push(line);
  }
  lines.push("", `Against ${path.basename(BASELINE)}: ${regressions.length} regression(s), ${improvements.length} improvement(s), ${marksChanged.length} other change(s) in marks.`);
  if (regressions.length) lines.push("Regressions (passed before, fail now):", ...regressions);
  if (improvements.length) lines.push("Improvements (failed before, pass now):", ...improvements);
  if (marksChanged.length) lines.push("Other changes (same verdict, different marks):", ...marksChanged.slice(0, 120));
}

console.log(lines.join("\n"));
if (OUT) fs.writeFileSync(OUT, JSON.stringify(verdicts));
process.exit(failures.length ? 1 : 0);
