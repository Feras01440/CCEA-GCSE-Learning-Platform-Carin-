/**
 * One marking entry point for the item components: maps a content `AnswerSpec` onto the
 * marking engines (numeric, algebraic, text / mcq, equation, order and steps, plots, table
 * cells, matrix entries, diagram labels, banded written communication) and returns the `MarkResult`
 * the FeedbackCard renders. Common errors from the mark scheme are matched first on a
 * miss, so the feedback names the misconception and awards the marks it typically earns.
 * One kind is deliberately not decided here: a `text-long` answer comes back with the
 * evidence, an honest floor and `decision: "qwc-band"`, and the learner places it on the
 * band descriptors. Pure; never throws on learner input.
 */
import type { AnswerSpec, CommonError, MarkPoint } from "@/lib/content/schema";
import { checkNumeric, normaliseUnit, parseNumeric } from "@/lib/marking/numeric";
import { checkAlgebraic } from "@/lib/marking/algebra";
import { checkPoints, looksLikePointList } from "@/lib/marking/points";
import { checkTransformation, graphTestMatches } from "@/lib/marking/transformation";
import { checkPlot } from "@/lib/marking/plot";
import { checkRegion } from "@/lib/marking/region";
import { checkTable, tableResponseText } from "@/lib/marking/table";
import { checkMatrix, matrixResponseText, parseMatrix, sameMatrixEntries } from "@/lib/marking/matrix";
import { checkLabel, labelResponseText } from "@/lib/marking/label";
import { qwcEvidence, qwcSummary } from "@/lib/marking/qwc";
import { equationSchemeMarks, markEquation, normaliseEquation } from "./equation-marking";
import { evaluateArithmetic } from "./mistake-marking";
import { expectedDisplay, isAutoMarkable, toAlgebraSpec, toNumericSpec, toNumericTolerance } from "./spec-map";
import { markMcq, markText } from "./text-marking";
import { markOrder, orderMarks, stepsAsOrder } from "./order-marking";

export interface MarkResult {
  correct: boolean;
  marksAwarded: number;
  marksAvailable: number;
  /** The expected answer, for the feedback card. May contain $…$ maths. */
  expected: string;
  /** One-line process diagnosis in tutor voice. */
  explanation: string;
  /** A near miss the engine spotted (rounding, sign, reciprocal…). */
  nearMiss?: string;
  /** Misconception-registry ids this response matched. */
  tags?: string[];
  /**
   * The examiners' report that names the matched common error ("ccea-cer:maths:2025-summer:M4:Q22"), when its author
   * cited one, so a miss can cite the series (engine item 10.3, 23 Sep 2026: withCommonError dropped it).
   */
  source?: string;
  /**
   * The engine has not decided this mark. `marksAwarded` is an honest floor and `explanation` is the
   * evidence behind it; the surface named here asks her to make the decision before anything is
   * recorded. "qwc-band": place the answer on the band descriptors (six-mark written-communication).
   */
  decision?: "qwc-band";
  /**
   * For an answer marked target by target (a label part): the ids of the targets she has not got, in the spec's
   * order. The shared-out award cannot say which one was missed, and the re-teach panel must name that one's mark
   * point, not the last point of the scheme (engine item 7, 23 Sep 2026).
   */
  unmet?: string[];
}

export interface MarkOptions {
  /** Marks available for the part (default 1). A text spec shares them out across its key-word groups. */
  marks?: number;
  /** The part's common errors; the first match supplies feedback, tags and typical marks. */
  commonErrors?: readonly CommonError[];
  /**
   * The part's stem. An accuracy instruction in it ("Give your answer to 2 decimal places") turns a d.p. / s.f.
   * tolerance into a demand on the written answer; without one the tolerance is only a closeness test.
   */
  prompt?: string;
  /** The part's mark scheme. A text part's key-word groups follow its points' `dependsOn` when they stand one for one. */
  scheme?: readonly MarkPoint[];
  /** Follow-through from an earlier part (the part's `followThrough`, "use-candidate-value"): see `followThroughValue`. */
  followThrough?: FollowThrough;
}

/** What follow-through needs: her answer to the earlier part, that part's answer spec, and how the value carries. */
export interface FollowThrough {
  earlierRaw: string;
  earlierSpec: AnswerSpec;
  /** An expression in x, her earlier value ("x - 5", "x * 4.0"), when the author wrote one. */
  relation?: string;
  /** The later part's worked solution, read for the chain that turns the earlier value into the answer. */
  workedSolution?: string;
}

/**
 * The value this part should have, given her own answer to the earlier part (P2 D, 25 Sep 2026: `followThrough` was
 * metadata only, so a fuse chosen consistently with a wrong current scored 0, where CCEA's "ft" pays it). Null when
 * her earlier answer was right (the key decides), unreadable, or when the relation cannot be known: the authored
 * `relation` first; else the worked solution's chain whose last side is this part's value and whose earlier side holds
 * the earlier part's value, with her value put in its place.
 */
export function followThroughValue(ft: FollowThrough, spec: AnswerSpec): number | null {
  if (ft.earlierSpec.kind !== "numeric") return null;
  const x = parseNumeric(ft.earlierRaw.trim())?.value;
  if (x === undefined || !Number.isFinite(x)) return null;
  if (markAnswer(ft.earlierRaw, ft.earlierSpec, { marks: 1 }).correct) return null;
  const v0 = ft.earlierSpec.value;
  if (ft.relation) return evaluateArithmetic(ft.relation.replace(/\bx\b/g, `(${x})`));
  if (spec.kind !== "numeric" || !ft.workedSolution) return null;
  const target = spec.value;
  for (const line of ft.workedSolution.split(/\n|(?<=[.;])\s+(?=[A-Z])/)) {
    const sides = normaliseEquation(line.replace(/\$/g, " ")).replace(/\*/g, "×").split("=");
    const lastValue = parseNumeric(sides[sides.length - 1] ?? "")?.value;
    if (lastValue === undefined || Math.abs(lastValue - target) > 1e-9 * Math.max(1, Math.abs(target))) continue;
    for (const side of sides.slice(0, -1).reverse()) {
      // The side must be arithmetic that comes to the answer and holds the earlier value as a number of its own.
      // Its arithmetic is the run of numbers and operators it ends on ("… so 4.0 m has 3.2 × 4.0" is 3.2×4.0).
      const plain = (/[\d.()+\-×*/÷^√π]+$/.exec(side)?.[0] ?? "").replace(/^[.)+\-×*/÷^]+/, "");
      const worked = evaluateArithmetic(plain);
      if (worked === null || Math.abs(worked - target) > 1e-6 * Math.max(1, Math.abs(target))) continue;
      let found = false;
      const put = plain.replace(/\d+(?:\.\d+)?/g, (n) => {
        if (Math.abs(Number(n) - v0) > 1e-9 * Math.max(1, Math.abs(v0))) return n;
        found = true;
        return `(${x})`;
      });
      if (found) return evaluateArithmetic(put);
    }
  }
  return null;
}

/** For a choice among numbered options (fuses: 3 A, 5 A, 13 A): the option just above her value. */
function nextOptionAbove(spec: Extract<AnswerSpec, { kind: "mcq" }>, x: number): string | null {
  const valued = spec.options.map((o) => ({ id: o.id, v: parseNumeric(o.text)?.value })).filter((o): o is { id: string; v: number } => o.v !== undefined);
  if (valued.length !== spec.options.length) return null;
  const above = valued.filter((o) => o.v > x).sort((a, b) => a.v - b.v);
  return above[0]?.id ?? null;
}

/**
 * The groups each key-word group depends on, when the groups stand one for one beside the scheme's points (the same
 * count, the same marks in order) and some point has `dependsOn`; else undefined, and nothing depends on anything.
 * Opt-in through what the author already writes: 41 published parts carry dependsOn (engine brief item 3).
 */
export function groupDependencies(spec: Extract<AnswerSpec, { kind: "text" }>, scheme: readonly MarkPoint[] | undefined): number[][] | undefined {
  if (!scheme || scheme.length !== spec.keyWords.length || !scheme.some((m) => (m.dependsOn ?? []).length > 0)) return undefined;
  if (scheme.some((m, i) => m.marks !== spec.keyWords[i]!.marks)) return undefined;
  const index = new Map(scheme.map((m, i) => [m.id, i]));
  return scheme.map((m) => (m.dependsOn ?? []).map((d) => index.get(d)).filter((i): i is number => i !== undefined));
}

/**
 * Does the stem instruct an accuracy for the answer? Only an instruction sentence counts ("Give your answer
 * correct to 3 significant figures", "Round to the nearest penny"), not a given ("6.4 cm, correct to 1 decimal
 * place"), which describes a measurement rather than the answer.
 */
export function instructsAccuracy(prompt: string | undefined): boolean {
  if (!prompt) return false;
  const text = prompt.replace(/\bd\.p\./gi, "dp").replace(/\bs\.f\./gi, "sf");
  // An instruction sentence starts with a command word, or attaches the accuracy to "your answer" ("Show your
  // working and give your answer to one decimal place"); a given such as "6.4 cm, correct to 1 decimal place" does neither.
  return text.split(/[.!?\n]+/).some(
    (s) =>
      /\b(decimal places?|significant figures?|dp|sf|nearest)\b/i.test(s) &&
      (/^\s*(give|write|work out|calculate|find|round|state|express|estimate)\b/i.test(s) || /\byour answers?\b|\bgiving\b|\brounding\b|\bround\b/i.test(s)),
  );
}

/** The instructions that make the form the task: an equivalent answer in another form has not done it. */
const FORM_TASK = /\b(?:simplif(?:y|ied)|factori[sz]e|factori[sz]ed|expand|multiply out|rationali[sz]e|as a single (?:fraction|logarithm|log))\b|\bexpress\b(?![^.?!]*\bin terms of\b)[^.?!]*\bas\b/i;

/**
 * Does the stem instruct the form the value is given in ("leave your answer in terms of π", "in surd form", "as a
 * fraction", "exactly", "in its lowest terms", "in standard form")? Then a right value in another form keeps every
 * mark but the final one, as the accuracy mark is withheld; without such an instruction a value equal within the
 * tolerance earns every mark (the verifier's ruling, 25 Sep 2026).
 */
const FORM_INSTRUCTION = /\b(?:in terms of|in the form|show that|surd form|exact(?:ly)?|as an? (?:exact |single |mixed |improper )?(?:fraction|mixed number|decimal|percentage|whole number|integer)|lowest terms|simplest form|standard form)\b/i;
export function instructsForm(prompt: string | undefined): boolean {
  return prompt !== undefined && FORM_INSTRUCTION.test(prompt);
}

/**
 * Is the form the task (MK-01 ruling, narrowed 25 Sep 2026)? The part's `formTask` flag decides when it is set;
 * otherwise the stem's instruction does, and only where the whole task is the form: simplify, simplify fully,
 * factorise, expand, rationalise, write as a single fraction, express as a single logarithm, express … as … ("Express
 * 1/√8 as √a/b"; not "express … in terms of"). A finishing instruction on
 * a multi-step part ("give your answer in the form y = mx + c") is not: the method marks stand.
 * Only the stem's words count, not its maths ("Write $\\frac{2}{x}$ …" is read without the fraction).
 */
export function isFormTask(prompt: string | undefined, spec: AnswerSpec): boolean {
  if ((spec.kind === "numeric" || spec.kind === "algebraic") && spec.formTask !== undefined) return spec.formTask;
  if (!prompt) return false;
  return FORM_TASK.test(prompt.replace(/\$[^$]*\$/g, " "));
}

/**
 * The form a "simplify" stem demands of an algebraic fraction when the author set none (the marking guard, 26 Sep 2026:
 * sixteen parts said "Simplify" or "Simplify fully" and paid the question typed back, or a fraction left uncancelled,
 * every mark, because their specs asked for equivalence only). Read from the stem's words, as isFormTask reads them:
 * "as a single fraction" demands one fraction; "simplify", "simplified", "simplest form" or "lowest terms" over a
 * fraction (in the stem's maths or the answer) demands it in lowest terms. An explicit `form`, mustBeFactorised or
 * mustBeExpanded always wins; so does `formTask: false`, which says the form is not what the part asks.
 */
export function inferredAlgebraForm(spec: AnswerSpec, prompt: string | undefined): "single-fraction" | "simplest-fraction" | null {
  if (spec.kind !== "algebraic" || !prompt) return null;
  if (spec.form || spec.mustBeFactorised || spec.mustBeExpanded || spec.formTask === false) return null;
  if (spec.equivalence === "identical") return null;
  const words = prompt.replace(/\$[^$]*\$/g, " ");
  const fraction = /\\d?frac|\//.test(spec.latex) || /\$[^$]*\\d?frac/.test(prompt);
  if (/\bas a single fraction\b/i.test(words)) return "single-fraction";
  if (fraction && /\b(?:simplif(?:y|ied)|simplest form|lowest terms)\b/i.test(words)) return "simplest-fraction";
  return null;
}

/** Function names that may be typed into a stem's maths without a backslash; their letters are not variables. */
const MATHS_WORDS = new Set(["sin", "cos", "tan", "log", "ln", "exp", "lim", "max", "min", "mod", "det", "and", "or"]);

/**
 * The letters a stem uses as variables:the single letters inside its `$…$` maths (TeX commands and \text{…} set
 * aside), in order of first use, less any letter the stem also uses as a unit in its prose ("144 m", "m/s", "in s",
 * "seconds"), which may then be typed as that unit. A numeric answer never reads one of these as a unit (numeric.ts
 * `variables`; 24 Sep 2026: "4m" for 3m⁰ + m⁰ was paid as 4 metres).
 */
export function variableLetters(prompt: string | undefined): string[] {
  if (!prompt) return [];
  const maths = [...prompt.matchAll(/\$([^$]+)\$/g)].map((m) => m[1]!);
  const letters: string[] = [];
  for (const seg of maths) {
    const bare = seg.replace(/\\(?:text|mathrm|operatorname|textrm|mbox)\s*\{[^}]*\}/g, " ").replace(/\\[A-Za-z]+/g, " ");
    // Letters side by side are a product ("mx"), except a function written without its backslash ("sin x").
    for (const run of bare.match(/[A-Za-z]+/g) ?? []) {
      if (MATHS_WORDS.has(run.toLowerCase())) continue;
      for (const l of run) if (!letters.includes(l)) letters.push(l);
    }
  }
  const prose = prompt.replace(/\$[^$]+\$/g, " ");
  const proseUnits = new Set((prose.match(/[A-Za-zΩµ°]+/g) ?? []).map((w) => normaliseUnit(w)));
  return letters.filter((l) => !proseUnits.has(normaliseUnit(l)));
}

/** Does the raw response fit a mark scheme's common-error pattern? */
export function matchesCommonError(
  raw: string,
  error: CommonError,
  pairNames?: readonly [string, string],
  variables?: readonly string[],
  answerLatex?: string,
): boolean {
  const p = error.pattern;
  try {
    switch (p.kind) {
      case "numeric":
        return checkNumeric(raw, {
          value: p.value,
          tolerance: p.tolerance ? toNumericTolerance(p.tolerance) : { type: "absolute", value: 0 },
        }).correct;
      case "algebraic":
        // A paired-answer pattern ("(2, -3)") must match every spelling the part accepts, the assignment
        // "p = 2, q = -3" included, so it is read as a pair with the part's own variable names.
        if (looksLikePointList(p.latex)) return checkPoints(raw, p.latex, { names: pairNames ?? ["x", "y"] }).correct;
        // The part's variables ride along, so a vector pattern reads bold, column and unit spellings as the answer does.
        {
          const vars = variables ? [...variables] : undefined;
          const v = checkAlgebraic(raw, { answer: p.latex, mode: "equivalent", variables: vars });
          if (!v.correct) return false;
          // A pattern equivalent to the part's own answer names an error of form (the question's expression typed
          // back, "3(x² − 9)" for "factorise fully"): every unsimplified spelling is equivalent to it, so it is matched
          // only as written (trial audit MK-02, 24 Sep 2026: "10/(2x − 8)" was told it was the expression given).
          if (answerLatex !== undefined && checkAlgebraic(p.latex, { answer: answerLatex, mode: "equivalent", variables: vars }).correct) return v.reason === "identical";
          return true;
        }
      case "matrix": {
        // The whole wrong matrix, entry for entry, in whichever spelling she typed it.
        const typed = parseMatrix(raw);
        return typed !== null && sameMatrixEntries(typed, p.entries);
      }
      case "text":
        return new RegExp(p.regex, "i").test(raw);
      case "graph":
        // Only a test that spells out the wrong image's vertices can be checked against a placed vertex list.
        return graphTestMatches(raw, p.test);
    }
  } catch {
    return false;
  }
}

/**
 * Replaces the engine's explanation with the authored diagnosis of a matched common error. `lead` is a
 * sentence of fact the engine established about the response (what a drawing is) that the diagnosis should
 * follow rather than replace.
 */
function withCommonError(
  base: MarkResult,
  raw: string,
  opts: MarkOptions,
  lead?: string,
  pairNames?: readonly [string, string],
  variables?: readonly string[],
  answerLatex?: string,
): MarkResult {
  const hit = (opts.commonErrors ?? []).find((e) => matchesCommonError(raw, e, pairNames, variables, answerLatex));
  if (!hit) return base;
  // The named misconception is the diagnosis; the engine's near-miss guess would only muddy it.
  const { nearMiss: _dropped, ...rest } = base;
  void _dropped;
  // An accepted response is right: every mark, and the author's note in place of a correction.
  if (hit.accepted && !base.correct) {
    return {
      ...rest,
      correct: true,
      marksAwarded: base.marksAvailable,
      explanation: hit.feedback,
      tags: [...new Set([...(base.tags ?? []), hit.misconception])],
      ...(hit.source ? { source: hit.source } : {}),
    };
  }
  // A wrong answer never collects every mark, whatever the error "typically earns": the equation and element-by-element
  // branches already hold that line (shareMarks, C2 D F05). An error whose typical marks equal the tariff is an authoring
  // slip or a carried-forward value written as an error, and paid the part in full while marked wrong (the marking guard,
  // 26 Sep 2026: FM1 multiply-divide q0001, expand-three-brackets q0001, P1 speed-equations q0003(b) twice).
  const ceiling = base.correct ? base.marksAvailable : Math.max(0, base.marksAvailable - 1);
  return {
    ...rest,
    marksAwarded: Math.min(ceiling, Math.max(base.marksAwarded, hit.marksTypicallyEarned)),
    explanation: lead ? `${lead} ${hit.feedback}` : hit.feedback,
    tags: [...new Set([...(base.tags ?? []), hit.misconception])],
    ...(hit.source ? { source: hit.source } : {}),
  };
}

/**
 * An answer marked element by element (points, bars, cells, labels …) shares the part's marks out in proportion:
 * all of them only when everything is right, and never all of them on a miss.
 */
function shareMarks(marks: number, v: { correct: boolean; earned: number; total: number }): number {
  if (v.correct) return marks;
  return Math.max(0, Math.min(marks - 1, Math.floor((marks * v.earned) / Math.max(1, v.total))));
}

/**
 * The value line under a physics equation: the number her working ends on ("= 2 × 3 = 6 m/s", "v = 6 m/s"), and
 * whether it follows from the numbers she put in. The spec states the equation and no expected value, so the value
 * is read against her own substitution: "2 × 3 = 5" keeps the equation mark and not the value's. Null when the
 * working states no value: nothing under the equation, or a substitution left unworked ("v = 2 × 3").
 */
function physicsValue(working: string): { holds: boolean; substitution: string | null; text: string } | null {
  const sides = working
    .split("\n")
    .flatMap((line) => line.split("="))
    .map((side) => side.trim())
    .filter((side) => side.length > 0 && !/^[A-Za-zλρθΔ]{1,3}$/.test(side));
  const last = sides[sides.length - 1];
  if (last === undefined) return null;
  // An operation between two numbers is working still to do, unless it is standard form ("3 × 10^8").
  if (/\d\s*[×x*÷/+\-−^]\s*\d/.test(last.replace(/[×x*]\s*10\s*\^\s*\{?\s*[-−]?\d+\}?/g, ""))) return null;
  const parsed = parseNumeric(last);
  if (parsed === null) return null;
  const text = last;
  for (const side of sides.slice(0, -1).reverse()) {
    const worked = evaluateArithmetic(side);
    if (worked === null) continue;
    const places = (/\.(\d+)/.exec(last)?.[1] ?? "").length;
    const tolerance = Math.max(Math.abs(parsed.value) * 0.01, 0.5 * 10 ** -places);
    return { holds: Math.abs(worked - parsed.value) <= tolerance, substitution: side, text };
  }
  return { holds: true, substitution: null, text };
}

/** Marks a raw response against a spec. Non-auto-markable kinds return a self-mark placeholder. */
export function markAnswer(raw: string, spec: AnswerSpec, opts: MarkOptions = {}): MarkResult {
  const marks = Math.max(1, Math.round(opts.marks ?? 1));
  // The expected answer is shown to the accuracy the stem instructs, as the marking demands it (engine item 13).
  const expected = expectedDisplay(spec, { accuracyInstructed: instructsAccuracy(opts.prompt) });
  const trimmed = raw.trim();

  if (!isAutoMarkable(spec)) {
    return {
      correct: false,
      marksAwarded: 0,
      marksAvailable: marks,
      expected,
      explanation: "This part is marked against the worked solution: compare and award your own marks.",
    };
  }

  if (trimmed.length === 0) {
    return { correct: false, marksAwarded: 0, marksAvailable: marks, expected, explanation: "Type an answer first." };
  }

  switch (spec.kind) {
    case "numeric": {
      const v = checkNumeric(trimmed, { ...toNumericSpec(spec, { accuracyInstructed: instructsAccuracy(opts.prompt) }), variables: variableLetters(opts.prompt) });
      // A right value whose required unit is missing or wrong keeps every mark but the unit's, the answer's last; so
      // does a right value in another form, unless the form is the task (MK-01 ruling), where it earns nothing.
      const unitOnly = !v.correct && v.valueRight === true && marks > 1;
      const formTask = !v.correct && v.formOnly === true && isFormTask(opts.prompt, spec);
      // A right value in another form: every mark where the stem does not instruct the form, the marks less the final
      // one where it does, and nothing where the form is the whole task.
      if (!v.correct && v.formOnly === true && !formTask && !instructsForm(opts.prompt)) {
        return { correct: true, marksAwarded: marks, marksAvailable: marks, expected, explanation: "Correct." };
      }
      const formOnly = !v.correct && v.formOnly === true && !formTask && marks > 1;
      const base: MarkResult = {
        correct: v.correct,
        marksAwarded: v.correct ? marks : unitOnly || formOnly ? marks - 1 : 0,
        marksAvailable: marks,
        expected,
        explanation: unitOnly
          ? `${v.feedback} ${marks - 1} of ${marks}: only the unit's mark is lost.`
          : formOnly
            ? `${v.feedback} ${marks - 1} of ${marks}: only the form's mark is lost.`
            : formTask
              ? `${v.feedback} The question asks for that form, and the form is what the marks are for.`
              : v.feedback,
      };
      if (v.nearMiss) base.nearMiss = v.nearMiss;
      if (!v.correct && opts.followThrough) {
        const t = followThroughValue(opts.followThrough, spec);
        if (t !== null && checkNumeric(trimmed, { ...toNumericSpec(spec), value: t, variables: variableLetters(opts.prompt) }).correct) {
          return { correct: true, marksAwarded: marks, marksAvailable: marks, expected, explanation: "Right for your answer to the earlier part: the marks follow through." };
        }
      }
      return v.correct ? base : withCommonError(base, trimmed, opts);
    }
    case "algebraic": {
      // A spec written as coordinate pairs — "(2, 3)" or "(1, 2), (-3, -6)" — is a simultaneous-equations
      // or intersection answer: the pairs are marked as pairs, so crossed x and y values do not pass.
      if (looksLikePointList(spec.latex)) {
        const names: [string, string] = spec.variables.length >= 2 ? [spec.variables[0]!, spec.variables[1]!] : ["x", "y"];
        const p = checkPoints(trimmed, spec.latex, { names, tolerance: spec.tolerance });
        const base: MarkResult = { correct: p.correct, marksAwarded: p.correct ? marks : 0, marksAvailable: marks, expected, explanation: p.feedback };
        return p.correct ? base : withCommonError(base, trimmed, opts, undefined, names);
      }
      const algebraSpec = toAlgebraSpec(spec);
      let v = checkAlgebraic(trimmed, algebraSpec);
      // A "simplify" stem over a fraction, with no form set: a right answer must also be in the form the stem asks for,
      // unless the author's own answer is not (M3 q0001's scheme pays (4x − 2)/6 "or the equivalent (2x − 1)/3"). The
      // inference only ever tightens a right verdict; it never replaces the spec's own check.
      const inferred = v.correct ? inferredAlgebraForm(spec, opts.prompt) : null;
      if (inferred) {
        const formSpec = { ...algebraSpec, mode: "form" as const, form: inferred };
        if (checkAlgebraic(spec.latex, formSpec).correct) {
          const f = checkAlgebraic(trimmed, formSpec);
          if (!f.correct) v = f;
        }
      }
      // The right expression in the wrong form (unsimplified, not yet a single log, not factorised) keeps every mark
      // but the last on a multi-mark part: the scheme's final mark is the form, the earlier ones the working.
      // Not where the form IS the task (MK-01 ruling, 25 Sep 2026: "simplify fully" with the question typed back was
      // paid marks − 1): there the right value in another form earns nothing, or a matched common error's own marks.
      const wrongForm = !v.correct && (v.reason === "equivalent-wrong-form" || v.reason === "not-simplified");
      const formTask = wrongForm && isFormTask(opts.prompt, spec);
      const rightValueWrongForm = wrongForm && !formTask && marks > 1;
      const base: MarkResult = {
        correct: v.correct,
        marksAwarded: v.correct ? marks : rightValueWrongForm ? marks - 1 : 0,
        marksAvailable: marks,
        expected,
        explanation: formTask ? `${v.feedback} The value is right, but the question asks for that form, and the form is what the marks are for.` : v.feedback,
      };
      return v.correct ? base : withCommonError(base, trimmed, opts, undefined, undefined, spec.variables, spec.latex);
    }
    case "mcq": {
      const ids = trimmed.split(/[,\s]+/).filter(Boolean);
      const v = markMcq(ids, spec);
      const base: MarkResult = {
        correct: v.correct,
        marksAwarded: v.correct ? marks : 0,
        marksAvailable: marks,
        expected,
        explanation: v.feedback,
      };
      if (v.misconception) base.tags = [v.misconception];
      // Follow-through: the option her own earlier value leads to (the fuse just above her current).
      if (!v.correct && opts.followThrough && opts.followThrough.earlierSpec.kind === "numeric" && ids.length === 1) {
        const x = parseNumeric(opts.followThrough.earlierRaw.trim())?.value;
        const earlierRight = markAnswer(opts.followThrough.earlierRaw, opts.followThrough.earlierSpec, { marks: 1 }).correct;
        if (x !== undefined && !earlierRight && nextOptionAbove(spec, x) === ids[0]) {
          return { correct: true, marksAwarded: marks, marksAvailable: marks, expected, explanation: "Right for your answer to the earlier part: the marks follow through." };
        }
      }
      return base;
    }
    case "text": {
      // The part's text common errors are its named wrong answers: offered beside the right one in a hedge, they cancel it.
      const wrongAnswers = (opts.commonErrors ?? []).flatMap((e) => {
        if (e.pattern.kind !== "text") return [];
        try {
          return [new RegExp(e.pattern.regex, "i")];
        } catch {
          return [];
        }
      });
      const v = markText(trimmed, spec, { wrongAnswers, dependsOn: groupDependencies(spec, opts.scheme) });
      const groups = spec.keyWords.length > 0;
      // Key-word groups need not sum to the part's tariff: a 1-mark "state, with a reason" part is written as
      // two groups (the verdict and the reason). The part's marks are shared out by the fraction of group
      // marks earned, rounding down, so every group is needed for the full mark and a question's total
      // always agrees with its parts.
      const awarded = !groups
        ? v.correct
          ? marks
          : 0
        : v.marksAvailable === marks
          ? v.marksAwarded
          : Math.floor((marks * v.marksAwarded) / v.marksAvailable);
      let explanation = v.feedback;
      if (groups && v.marksAvailable !== marks && v.feedback.startsWith(`${v.marksAwarded} of ${v.marksAvailable}:`)) {
        const missing = spec.keyWords.filter((_, i) => !v.matchedGroups.includes(i)).map((g) => g.any[0]);
        explanation = `${awarded} of ${marks}: still missing ${missing.join(", ")}.`;
      }
      const base: MarkResult = { correct: v.correct, marksAwarded: awarded, marksAvailable: marks, expected, explanation };
      if (v.correct) return base;
      // The key-word marks already are the scheme's partial credit, so a matched common error supplies the
      // diagnosis and the tag but never raises the marks to its "typically earned" figure: an answer that
      // contains only the misconception must not be paid for it.
      const diagnosed = withCommonError(base, trimmed, opts);
      if (diagnosed.correct) return diagnosed;
      return { ...diagnosed, marksAwarded: base.marksAwarded };
    }
    case "text-long": {
      // A banded answer: the engine gathers evidence (which indicative points have a key word present)
      // and offers the floor of the band that count alone suggests. It decides nothing — `decision`
      // sends the result to the QWC panel, where she places the answer on the descriptors herself.
      const ev = qwcEvidence(trimmed, spec);
      const summary = qwcSummary(ev);
      const floor = Math.min(marks, ev.suggestedMarks);
      const correct = floor >= marks;
      const base: MarkResult = { correct, marksAwarded: floor, marksAvailable: marks, expected, explanation: summary, decision: "qwc-band" };
      // A misconception the scheme names ("carbon dioxide is used") is worth saying while she decides, so
      // it follows the evidence rather than replacing it — and it never moves the floor: the band is hers.
      const flagged = withCommonError(base, trimmed, opts, summary);
      return { ...flagged, correct, marksAwarded: floor, decision: "qwc-band" };
    }
    case "order":
    case "steps": {
      // A chain of working (`steps`) is an order whose authored chain is the correct arrangement.
      const order = spec.kind === "steps" ? stepsAsOrder(spec) : spec;
      const v = markOrder(trimmed, order);
      // A miss keeps the marks the arrangement has earned (orderMarks: the lesser of the in-place and in-order readings).
      const base: MarkResult = { correct: v.correct, marksAwarded: orderMarks(v, marks), marksAvailable: marks, expected, explanation: v.feedback };
      if (v.correct) return base;
      // Authors write text common-error patterns against the arranged item texts ("organ, tissue, organ system"),
      // not the raw indices the field submits.
      const arranged = v.arrangement ? v.arrangement.map((i) => order.items[i] ?? "").join(", ") : trimmed;
      return withCommonError(base, arranged, opts);
    }
    case "table": {
      // Cell by cell, the part's marks shared out in proportion. Authors write text common-error patterns against
      // the completed cells ("15.*40.*18.*30"), not the field's JSON. An accuracy the stem instructs is a demand on each
      // cell, as it is on a numeric part (engine item 5).
      const v = checkTable(trimmed, spec, { accuracyInstructed: instructsAccuracy(opts.prompt), variables: variableLetters(opts.prompt) });
      const base: MarkResult = { correct: v.correct, marksAwarded: shareMarks(marks, v), marksAvailable: marks, expected, explanation: v.feedback };
      return v.correct ? base : withCommonError(base, tableResponseText(trimmed), opts);
    }
    case "matrix": {
      // Entry by entry, in place, the part's marks shared out in proportion: a transposed answer keeps only the
      // entries the swap leaves where they were. A text common-error pattern is matched against the plain grid
      // ("1 2; 3 4"), a matrix pattern against the matrix itself.
      const v = checkMatrix(trimmed, spec);
      const base: MarkResult = {
        correct: v.correct,
        marksAwarded: shareMarks(marks, { correct: v.correct, earned: v.inPlace, total: v.total }),
        marksAvailable: marks,
        expected,
        explanation: v.feedback,
      };
      return v.correct ? base : withCommonError(base, matrixResponseText(trimmed), opts);
    }
    case "label": {
      // Target by target, shared out the same way; patterns are matched against the chosen names in target order.
      const v = checkLabel(trimmed, spec);
      const base: MarkResult = { correct: v.correct, marksAwarded: shareMarks(marks, v), marksAvailable: marks, expected, explanation: v.feedback };
      if (!v.correct) base.unmet = v.unmet;
      return v.correct ? base : withCommonError(base, labelResponseText(trimmed, spec), opts);
    }
    case "graph": {
      // Plotted points, a line, a curve's samples or a histogram's bars: marked element by element, the
      // part's marks shared out in proportion (all of them only when everything is right).
      if (spec.expect.plot === "points-line" || spec.expect.plot === "curve" || spec.expect.plot === "histogram" || spec.expect.plot === "box") {
        const v = checkPlot(trimmed, spec.expect);
        const base: MarkResult = { correct: v.correct, marksAwarded: shareMarks(marks, v), marksAvailable: marks, expected, explanation: v.feedback };
        return v.correct ? base : withCommonError(base, trimmed, opts);
      }
      // A region: the tapped point fixes a side of every boundary; each inequality it satisfies is one element.
      if (spec.expect.plot === "region") {
        const v = checkRegion(trimmed, spec.expect);
        const base: MarkResult = { correct: v.correct, marksAwarded: shareMarks(marks, v), marksAvailable: marks, expected, explanation: v.feedback };
        return v.correct ? base : withCommonError(base, trimmed, opts);
      }
      // Best-fit plots are not auto-marked (isAutoMarkable gates them to self-marking).
      if (spec.expect.plot !== "transformation") {
        return { correct: false, marksAwarded: 0, marksAvailable: marks, expected, explanation: "This answer type is not marked automatically yet." };
      }
      const v = checkTransformation(trimmed, spec.expect);
      const base: MarkResult = { correct: v.correct, marksAwarded: v.correct ? marks : 0, marksAvailable: marks, expected, explanation: v.feedback };
      // When the engine has named the drawing ("That is a reflection in the y-axis. The question asked for …"),
      // the authored diagnosis follows that fact instead of replacing it.
      return v.correct ? base : withCommonError(base, trimmed, opts, v.did ? v.feedback : undefined);
    }
    case "equation": {
      const v = markEquation(raw, spec);
      // A physics equation part is the equation and then the value: the equation line alone earns its own mark and
      // not the rest (engine item 10.1, 23 Sep 2026: every mark was paid for the equation line).
      if (spec.kindOf === "physics" && v.correct && marks > 1) {
        const value = physicsValue(v.working);
        if (value === null) {
          return { correct: false, marksAwarded: 1, marksAvailable: marks, expected, explanation: `Equation line earned: 1 of ${marks}. The rest are for the numbers put in and the value worked out, on the lines under it.` };
        }
        // A value with no substitution above it cannot be checked (the spec carries no expected value), so it is not
        // paid: "v = 999 m/s" under the right equation earned every mark until 24 Sep 2026.
        if (value.substitution === null) {
          return { correct: false, marksAwarded: 1, marksAvailable: marks, expected, explanation: `Equation line earned: 1 of ${marks}. Write the equation with the numbers put in on a line before the value, so the value can be checked.` };
        }
        if (!value.holds) {
          return { correct: false, marksAwarded: 1, marksAvailable: marks, expected, explanation: `Equation line earned: 1 of ${marks}. ${value.substitution} does not come to ${value.text}: work it out again.` };
        }
        return { correct: true, marksAwarded: marks, marksAvailable: marks, expected, explanation: "The equation, the numbers in it and the value." };
      }
      // A chemical equation is paid point by point where its scheme says what each mark is for (reactants, products,
      // balancing, state symbols…); a miss never earns every mark (C2 D F05, 24 Sep 2026: it was all or nothing).
      const byPoint = !v.correct && opts.scheme ? equationSchemeMarks(raw, spec, opts.scheme) : null;
      const partial = byPoint === null ? 0 : Math.min(marks - 1, byPoint);
      return {
        correct: v.correct,
        marksAwarded: v.correct ? marks : partial,
        marksAvailable: marks,
        expected,
        explanation: partial > 0 ? `${v.feedback} ${partial} of ${marks}.` : v.feedback,
      };
    }
    default:
      return { correct: false, marksAwarded: 0, marksAvailable: marks, expected, explanation: "This answer type is not marked automatically yet." };
  }
}
