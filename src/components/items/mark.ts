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
import { checkNumeric, knownUnit, normaliseUnit, parseNumeric } from "@/lib/marking/numeric";
import { checkAlgebraic } from "@/lib/marking/algebra";
import { checkPoints, looksLikePointList } from "@/lib/marking/points";
import { checkTransformation, graphTestMatches } from "@/lib/marking/transformation";
import { checkPlot } from "@/lib/marking/plot";
import { checkRegion } from "@/lib/marking/region";
import { checkTable, tableResponseText } from "@/lib/marking/table";
import { checkMatrix, matrixResponseText, parseMatrix, sameMatrixEntries } from "@/lib/marking/matrix";
import { checkLabel, labelResponseText } from "@/lib/marking/label";
import { qwcEvidence, qwcSummary } from "@/lib/marking/qwc";
import { equationSchemeMarks, markEquation, normaliseEquation, reversedReversible } from "./equation-marking";
import { evaluateArithmetic } from "./mistake-marking";
import { expectedDisplay, isAutoMarkable, toAlgebraSpec, toNumericSpec, toNumericTolerance } from "./spec-map";
import { ideaLabel, isFormula, listedItems, markMcq, markText, nameWithFormula } from "./text-marking";
import { markOrder, orderMarks, stepsAsOrder } from "./order-marking";
import { FACTORISED, markWorking, methodSteps } from "@/lib/marking/working";

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
   * A "show that" answer box restating the printed target: the box earns nothing and her working decides. The runner pays
   * the ladder over her working, every mark when it reaches every point (ruling 3; the verifier, 29 Sep 2026).
   */
  workingOnly?: boolean;
  /**
   * Her answer is the question as printed (copiesTheQuestion): no step taken, so the runner never reads it as a line of
   * her working either (gate 2's sweep, 11 Oct 2026: "3x + 4y = 24" typed back earned a ladder point through G2-18).
   */
  copiesQuestion?: boolean;
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
  /** The part's worked solution: a text part reads its negations as the model's (text-marking MarkTextOptions.model). */
  workedSolution?: string;
  /** Follow-through from an earlier part (the part's `followThrough`, "use-candidate-value"): see `followThroughValue`. */
  followThrough?: FollowThrough;
  /**
   * The part requires working (the part's `requiresWorking`, or a stem that says "you must show your working"): a bare
   * right value or expression earns nothing, and the working ladder decides (CCEA's 2021 C2 Higher general instruction 9;
   * the C2 reviewer's ruling, 8 Oct 2026). A text answer is its own working and is never bare.
   */
  requiresWorking?: boolean;
  /**
   * The part's subject ("science", "maths", "further-maths"). Science papers mark instructed decimal places as written
   * (a dropped final zero loses the accuracy mark); maths and further maths accept it. Omitted: the maths reading.
   */
  subject?: string;
}

/** The maths of a line, spelt one way: no dollars, spaces, \left/\right; TeX fractions and products as typed. */
function mathsSpelling(s: string): string {
  return s
    .replace(/\$/g, "")
    .replace(/\\left|\\right/g, "")
    .replace(/\^\{([^{}]*)\}/g, "^$1")
    .replace(/_\{([^{}]*)\}/g, "_$1")
    .replace(/\\[dt]?frac\{([^{}]*)\}\{([^{}]*)\}/g, "($1)/($2)")
    .replace(/\\(?:times|cdot)/g, "*")
    .replace(/[×·]/g, "*")
    // A division however it is written: "÷", "\div" and "/" are one sign here.
    .replace(/\\div/g, "/")
    .replace(/÷/g, "/")
    .replace(/\\,|\\ /g, "")
    .replace(/[−–]/g, "-")
    .replace(/²/g, "^2")
    .replace(/³/g, "^3")
    .replace(/[{}\s]/g, "");
}

/** A scheme point's expression and hers are the same expression (maths only: prose is never sampled). */
function sameExpression(point: string, raw: string): boolean {
  const bare = point.replace(/\b(?:sin|cos|tan|log|ln|sqrt)\b/g, " ");
  if (!/[+\-*/^×÷()]/.test(bare) || /[A-Za-z]{3,}/.test(bare)) return false;
  try {
    return checkAlgebraic(raw, { answer: point, mode: "equivalent" }).correct;
  } catch {
    return false;
  }
}

/** Her answer is an expression the stem itself prints: the question typed back, no step taken. */
function copiesTheQuestion(raw: string, prompt: string | undefined, numbers = true): boolean {
  if (!prompt) return false;
  const hers = mathsSpelling(raw.replace(/^\s*(?:[A-Za-z][\w{}]*(?:\([^()]*\))?\s*=\s*)/, ""));
  if (hers.length === 0) return false;
  // The stem's maths, display ($$…$$) and inline ($…$) alike (S44: "$$" read as an empty inline span left a display
  // stem's numbers in its prose, and a right answer equal to one of them was read as the question typed back).
  const MATHS = /\$\$([\s\S]+?)\$\$|\$([^$]+)\$/g;
  // A number the stem gives in its words, typed back ("550" for "Write 550 as a product of its prime factors"): on a
  // form task only.
  if (numbers && /^\d+(?:\.\d+)?$/.test(hers) && new RegExp(`(?<![\\d.])${hers.replace(".", "\\.")}(?![\\d.])`).test(prompt.replace(MATHS, " "))) return true;
  // An expression, integral or equation the stem prints, unchanged. A lone number or symbol is not "the question".
  return [...prompt.matchAll(MATHS)].some((m) => {
    const theirs = mathsSpelling(m[1] ?? m[2] ?? "");
    if (!/[+\-*/^√]|\\(?:int|frac|sqrt|div|log|ln|sin|cos|tan)/.test(theirs)) return false;
    // The whole piece, or a side of a labelled one ("$f(x) = x^{2} - 5x + 11$" typed back as "x^2-5x+11").
    const sides = theirs.split("=").filter((x) => /[+\-*/^√]|\\/.test(x));
    return [theirs, ...(sides.length > 1 || theirs.includes("=") ? sides : [])].some(
      (t) => t === hers || t.replace(/[()]/g, "") === hers.replace(/[()]/g, ""),
    );
  });
}

/**
 * The stem prints the part's answer: a number in its words or maths within 0.5 % of the value ("12.7 cm, correct to 3
 * significant figures" for 12.689; "$3\sqrt{2}$"), or a maths piece the algebraic spec accepts. A show-that part may also
 * ask for a value it does not print ("… and work out that area when x = 10"), which is marked as an answer.
 */
function printsTheValue(prompt: string | undefined, spec: AnswerSpec): boolean {
  if (!prompt) return false;
  const MATHS = /\$\$([\s\S]+?)\$\$|\$([^$]+)\$/g;
  const pieces = [...prompt.matchAll(MATHS)].map((m) => m[1] ?? m[2] ?? "");
  if (spec.kind === "numeric") {
    const prose = prompt.replace(MATHS, " ").match(/[-−]?\d+(?:\.\d+)?/g) ?? [];
    const typed = (p: string) =>
      p
        .replace(/\^\{?\\circ\}?|°/g, "")
        .replace(/\\sqrt\{([^{}]*)\}/g, "√($1)")
        .replace(/\\pi\b/g, "π")
        .replace(/\\[dt]?frac\{([^{}]*)\}\{([^{}]*)\}/g, "($1)/($2)")
        .replace(/\\(?:times|cdot)/g, "×")
        .replace(/[{}]/g, "");
    const candidates = [...prose, ...pieces.map((p) => typed(p).split("=").pop() ?? "")];
    return candidates.some((c) => {
      const v = parseNumeric(c)?.value;
      return v !== undefined && Math.abs(v - spec.value) <= Math.max(1e-9, 0.005 * Math.abs(spec.value));
    });
  }
  if (spec.kind === "algebraic") {
    return pieces.some((p) => {
      const sides = p.split("=");
      return [p, sides[sides.length - 1] ?? p].some((t) => {
        try {
          return /[A-Za-z0-9]/.test(t) && checkAlgebraic(t, toAlgebraSpec(spec)).correct;
        } catch {
          return false;
        }
      });
    });
  }
  return false;
}

/**
 * A "show that" part: the stem prints the answer, and the working is what earns (ruling 3). The command ("Show that
 * …", "(b) Show that", "hence show that", "use the sine rule to show that"), never a sentence about what some results
 * show ("Explain why the results show that respiration is exothermic" asks for an explanation, not a proof; the
 * verifier, 29 Sep 2026).
 */
export function isShowThat(prompt: string | undefined): boolean {
  return prompt !== undefined && /(?:^|[^A-Za-z\s]\s*|\b(?:to|hence|then|now|and|also|first|next|or)\s+)show that\b/im.test(prompt);
}

/** A common error that names a verification by substitution: the printed result put into the equation and checked. */
function isVerification(error: CommonError): boolean {
  return /verif/i.test(error.misconception);
}

/**
 * Her answer box holds working, not only a restated result: an equals sign with something done before it ("√(20² +
 * 15²) = 25"), or a chain. "VP = 25 cm" and "AC = 13" are a label and the printed value.
 */
function showsWorking(raw: string): boolean {
  const sides = raw.split(/[=≈]/);
  if (sides.length > 2) return true;
  if (sides.length < 2) return false;
  const left = sides[0]!.trim();
  return !/^[A-Za-zθα-ω][A-Za-z0-9_{}()' ]*$/.test(left) && /[\d(]|[+\-−×*/÷^√]/.test(left);
}

/** A derivative's notation: dy/dx, dA/dx, d2y/dx2, d^2y/dx^2, d²y/dx², \\frac{dy}{dx}, \\frac{d^{2}y}{dx^{2}}, f'(x), f''(x), A'. */
const DERIVATIVE_LABEL =
  /^(?:\\[dt]?frac\s*\{\s*d\s*(?:\^\s*\{?\s*2\s*\}?|²)?\s*[A-Za-z]\w*\s*\}\s*\{\s*d\s*[A-Za-z]\s*(?:\^\s*\{?\s*2\s*\}?|²)?\s*\}|d\s*(?:\^?\s*2|²)?\s*[A-Za-z]\w*\s*\/\s*d\s*[A-Za-z]\s*(?:\^?\s*2|²)?|[A-Za-z](?:'{1,2}|′{1,2}|″)(?:\s*\(\s*[A-Za-z]\s*\))?)$/;

/** Maths as a key for comparing an answer's label with the stem's expression: TeX bold and spacing, braces, $ and * gone. */
function labelKey(s: string): string {
  return s
    .replace(/\\(?:mathbf|boldsymbol|vec|mathrm|textbf)\s*\{([^{}]*)\}/g, "$1")
    .replace(/\\(?:left|right)\b/g, "")
    .replace(/[\s${}*]/g, "")
    .replace(/\\cdot|\\times|×/g, "")
    .toLowerCase();
}

/**
 * The expression after a label, where the answer is an expression (no "=" in the key) and she wrote "LABEL = expression"
 * with one "=": a derivative's notation ("dA/dx = 40 - 2x", "f'(x) = …", "d²y/dx² = …") or the stem's own expression
 * ("2a + 3b = 9i - 10j" for "Find 2a + 3b"). Gate 2, G2-20/G2-21 (11 Oct 2026): those were refused while "y = 40 - 2x"
 * was paid. Null where there is no such label; the side after it is judged as her answer, right or wrong.
 */
export function expressionAfterLabel(raw: string, keyLatex: string, prompt?: string): string | null {
  if (/[=<>≤≥]|\\(?:le|ge|lt|gt|neq?)\b/.test(keyLatex)) return null;
  const text = raw.trim().replace(/^\$+|\$+$/g, "");
  const sides = text.split("=");
  if (sides.length !== 2) return null;
  const [left, right] = [sides[0]!.trim(), sides[1]!.trim()];
  if (left.length === 0 || right.length === 0) return null;
  if (DERIVATIVE_LABEL.test(left)) return right;
  if (prompt) {
    const asked = [...prompt.matchAll(/\$([^$]+)\$/g)].map((m) => labelKey(m[1]!));
    if (asked.includes(labelKey(left))) return right;
  }
  return null;
}

/**
 * TeX relations as she would type them: \lt \gt \le \leq \leqslant \ge \geq \geqslant \ne \neq become their signs, a
 * \text{…} or \mathrm{…} its words, and the dollar signs go. Anything without a backslash is returned unchanged.
 */
export function texRelationsAsTyped(s: string): string {
  if (!s.includes("\\")) return s;
  return s
    .replace(/\\(?:text|mathrm|textrm|mbox)\s*\{([^{}]*)\}/g, " $1 ")
    .replace(/\\(?:leqslant|leq|le)(?![A-Za-z])/g, " ≤ ")
    .replace(/\\(?:geqslant|geq|ge)(?![A-Za-z])/g, " ≥ ")
    .replace(/\\(?:neq|ne)(?![A-Za-z])/g, " ≠ ")
    .replace(/\\lt(?![A-Za-z])/g, " < ")
    .replace(/\\gt(?![A-Za-z])/g, " > ")
    .replace(/\$/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Does the paper demand working for this part, so that a bare right value or expression earns nothing (`requiresWorking`
 * in MarkOptions)? Gate 2, G2-05 (11 Oct 2026): ruling 28 (the C2 reviewer, 8 Oct) was applied to the part's
 * `requiresWorking` flag, which authors set to open the working box (author-topic.md: the box is "open on exam-style parts
 * and on any part with requiresWorking"), and on 1950 shipped numeric and algebraic parts a bare right answer earned 0.
 * The ruling's cited line, CCEA C2 2021 Higher general instruction 9, reads: "Full marks can be awarded for a correct
 * numerical answer to any calculation even if no working out is shown apart from degree of hydration and empirical
 * formula calculations for which working out is required"; the maths general marking advice gives a correct answer full
 * marks. So working is demanded where the stem says so ("you must show your working"), or, on a science part whose box is
 * flagged, for a degree-of-hydration or empirical-formula calculation, read from the question's stems (a hydrate written
 * with x, "CuSO₄·xH₂O", "Na2CO3.xH2O"; "empirical formula"; "degree of hydration"). The flag alone opens the box.
 */
export function demandsWorking(part: { stem: string; requiresWorking?: boolean }, questionStems: readonly string[] = [], subject?: string): boolean {
  if (/\bmust show\b[^.?!]*\bworking\b/i.test(part.stem)) return true;
  if (part.requiresWorking !== true || subject !== "science") return false;
  const text = [part.stem, ...questionStems].join("\n");
  return /[·.•∙]\s*x\s*H(?:2|₂)O|\bx\s*H(?:2|₂)O\b|\bempirical formula\b|\bdegree of hydration\b/i.test(text);
}

/**
 * The printed target of a "show that" restated in the answer box (the verifier, 29 Sep 2026: "25", "VP = 25 cm", "3√2",
 * "28x + 49" each earned full marks): 0 for the box. `workingOnly` tells the runner that her working decides: the ladder
 * over her lines pays the marks, all of them when it reaches every point.
 */
function showThatTarget(marks: number, expected: string): MarkResult {
  return {
    correct: false,
    marksAwarded: 0,
    marksAvailable: marks,
    expected,
    explanation: "A show-that question prints its answer: the marks are for the working that reaches it. Write your working.",
    workingOnly: true,
  };
}

/**
 * A numeric answer still to be worked out: an operation between numbers ("(83 + 17)(83 − 17)", "100 × 66") that is not a
 * form an answer is given in (standard form, a fraction, a surd, π).
 */
function unevaluated(raw: string, form: string | undefined): boolean {
  if (form && !["integer", "decimal"].includes(form)) return false;
  const body = raw.replace(/^\s*[A-Za-zθα-ω][\w{}]*\s*=\s*/, "").trim();
  if (/[=≈]/.test(body)) return false;
  if (/^\s*[-−]?\d+(?:\.\d+)?\s*[×x*]\s*10\s*\^/.test(body)) return false;
  // Only a line that is nothing but the sum (and perhaps a unit): words or a remark mean the value was read from it.
  if (!/^[\d\s.,+\-−×x*÷/^()²³√]+(?:\s*[A-Za-zΩµ°%²³/]{1,6})?$/.test(body)) return false;
  return /[\d)²³]\s*[+\-−×x*÷^]\s*[\d(]|\)\s*\(\s*[-−\d]|\d\s*\(\s*[-−\d]/.test(body.replace(/^\s*[-−]/, ""));
}

/**
 * A form task answered with the right value in another form (ruling 1 as the judge changed it, 27 Sep 2026): the
 * answer is working. The ladder pays the scheme's method points it shows ("Expand and simplify (n + 2)(n − 4)"
 * answered "n² − 4n + 2n − 8" is MA1 MA1, 2 of 3; M4 2025 Q5), a matched common error may raise the award, and the
 * whole is capped at marks − 1: the last mark is the form. The question typed back takes no step and earns only what
 * a common error naming it says.
 */
function formTaskAward(raw: string, feedback: string, marks: number, expected: string, opts: MarkOptions, spec: AnswerSpec): MarkResult {
  const copied = copiesTheQuestion(raw, opts.prompt);
  let ladder = 0;
  // A bare decimal shows no step ("0.333333333333" for "change 0.3̇ to a fraction" is the question's own value, which a
  // scheme line "x = 0.333…" would otherwise read as its first step).
  const bareDecimal = /^\s*[-−]?\d+(?:\.\d+)?\s*$/.test(raw);
  if (!copied && !bareDecimal && opts.scheme && opts.scheme.length > 0) {
    const ws = opts.workedSolution ?? "";
    // Her one line may show several points at once (both lines of a fraction factorised): each point reads its own copy.
    const w = markWorking(opts.scheme.map(() => raw), opts.scheme, ws);
    ladder = w.marks;
    // A later line of one chain implies the earlier ones: "n² − 4n + 2n − 8" is past "n(n − 4) + 2(n − 4)", which is
    // the same expression one step back (M4 2025 Q5: MA1 MA1). A parallel point ("numerator factorised") is not
    // implied by another ("denominator factorised"): only an earlier point whose expression equals hers counts.
    const steps = methodSteps(opts.scheme, ws);
    const earned = new Set(w.earned.map((e) => e.id));
    const lastEarned = steps.reduce((at, s, i) => (earned.has(s.id) ? i : at), -1);
    for (let i = 0; i < lastEarned; i += 1) {
      const s = steps[i]!;
      if (!earned.has(s.id) && s.evidence.some((e) => sameExpression(e, raw))) ladder += s.marks;
    }
  }
  // The ladder decides and there is no fixed floor (the lead's ruling, 29 Sep 2026): an equivalent expression that shows
  // no scheme line (the question reordered, the answer scaled top and bottom) earns nothing, as the exam gives nothing
  // for it; an unconditional "at least 1" paid 139 of 400 such answers across the corpus (the verifier's sweep).
  const award = Math.min(marks - 1, ladder);
  const base: MarkResult = {
    correct: false,
    marksAwarded: award,
    marksAvailable: marks,
    expected,
    explanation: copied
      ? "That is the expression the question gives: no step has been taken yet."
      : award > 0
        ? `${feedback} The steps shown earn ${award} of ${marks}; the last mark is for the form the question asks for.`
        : `${feedback} The value is right, but the question asks for that form, and the form is what the marks are for.`,
  };
  const r = withCommonError(base, raw, opts, undefined, undefined, spec.kind === "algebraic" ? spec.variables : undefined, spec.kind === "algebraic" ? spec.latex : undefined);
  return { ...r, marksAwarded: Math.min(r.marksAwarded, Math.max(0, marks - 1)) };
}

/** The top and bottom of the first \frac in a stem's maths, as written (braces matched), or null. */
function stemFraction(stem: string): { top: string; bottom: string } | null {
  for (const m of stem.matchAll(/\$\$?([\s\S]+?)\$\$?/g)) {
    const piece = m[1]!;
    const at = piece.search(/\\[dt]?frac\s*\{/);
    if (at < 0) continue;
    const groups: string[] = [];
    let i = piece.indexOf("{", at);
    while (groups.length < 2 && i >= 0 && i < piece.length) {
      let depth = 0;
      let j = i;
      for (; j < piece.length; j += 1) {
        if (piece[j] === "{") depth += 1;
        else if (piece[j] === "}") {
          depth -= 1;
          if (depth === 0) break;
        }
      }
      if (j >= piece.length) return null;
      groups.push(piece.slice(i + 1, j));
      i = piece.indexOf("{", j);
    }
    if (groups.length === 2) return { top: groups[0]!.trim(), bottom: groups[1]!.trim() };
  }
  return null;
}

/** What `twinScheme` reads of a worked example: its stem, its steps and its twin. */
export interface TwinExample {
  stem: string;
  steps: ReadonlyArray<{ n: number; earns?: readonly string[]; working: string }>;
  twin: { stem: string; answer: AnswerSpec };
}

/**
 * The twin's mark scheme from the example's steps (the build-9 gate, class 5). The twin is marked with no scheme of
 * its own, so a factorised but uncancelled twin answer earned nothing once the floor went. Each step that earns is one
 * point with the step's code and one mark per earn. A step written "L = R" whose left side is the example's numerator
 * or denominator (the stem's fraction) asks the twin for that line factorised, checked on the twin's own fraction
 * (FM1 2021 Q8(i): "One MW1 mark for each of the three correctly factorised expressions"); any other step keeps its
 * working as its evidence, which a twin on the same numbers can meet.
 */
export function twinScheme(we: TwinExample): MarkPoint[] {
  const example = stemFraction(we.stem);
  const twin = stemFraction(we.twin.stem);
  return we.steps
    .filter((s) => (s.earns?.length ?? 0) > 0)
    .map((s) => {
      const earns = s.earns!;
      const point: MarkPoint = { id: `twin-step-${s.n}`, code: earns[0]!.replace(/\d+$/, ""), marks: earns.length, for: s.working } as MarkPoint;
      const sides = s.working.replace(/\$/g, "").split("=");
      if (example && twin && sides.length === 2) {
        const left = mathsSpelling(sides[0]!);
        if (left === mathsSpelling(example.top)) return { ...point, for: "numerator factorised", accept: [`${FACTORISED}${twin.top}`] };
        if (left === mathsSpelling(example.bottom)) return { ...point, for: "denominator factorised", accept: [`${FACTORISED}${twin.bottom}`] };
      }
      return point;
    });
}

/** A science part (the subject on the part; Double Award Science). */
function isScience(subject: string | undefined): boolean {
  return subject !== undefined && /science/i.test(subject);
}

function plural(n: number, word: string): string {
  return `${n} ${word}${n === 1 ? "" : "s"}`;
}

/** Her right value is written to other places (or figures) than the stem instructs: "13" or "13.00" for 13.0 to 1 d.p. */
function sciencePlacesDiffer(v: { parsed: { decimalPlaces: number | null; sigFigs: number | null; form: string } | null }, spec: AnswerSpec): boolean {
  if (spec.kind !== "numeric" || !v.parsed) return false;
  if (!["decimal", "integer", "percent"].includes(v.parsed.form)) return false;
  if (spec.tolerance.type === "dp" && spec.tolerance.places !== undefined) return (v.parsed.decimalPlaces ?? 0) !== spec.tolerance.places;
  // Figures: an integer's trailing zeros are ambiguous (4500 is 2, 3 or 4 s.f.), so only a decimal is judged.
  if (spec.tolerance.type === "sf" && spec.tolerance.figures !== undefined && v.parsed.form === "decimal") return v.parsed.sigFigs !== spec.tolerance.figures;
  return false;
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
/** An i, j vector as typed or as a spec writes it ("5i + 11j", "-i - 7j", "(4i - 3j) N", "5\mathbf{i} + 12\mathbf{j}"). */
function ijVector(raw: string): { a: number; b: number } | null {
  const s = raw
    .replace(/\$/g, "")
    .replace(/\\mathbf\{([ij])\}/g, "$1")
    .replace(/\\,|\\ /g, "")
    .replace(/[−–]/g, "-")
    .replace(/\s+/g, "")
    .replace(/^\(|\)N?$/g, "")
    .replace(/N$/, "");
  const coefficient = (c: string) => (c === "" || c === "+" ? 1 : c === "-" ? -1 : Number(c));
  const m = /^([+-]?\d*\.?\d*)i([+-]\d*\.?\d*)j$/.exec(s) ?? null;
  if (m) return { a: coefficient(m[1]!), b: coefficient(m[2]!) };
  const n = /^([+-]?\d*\.?\d*)j([+-]\d*\.?\d*)i$/.exec(s);
  if (n) return { a: coefficient(n[2]!), b: coefficient(n[1]!) };
  return null;
}

/** The values an answer states as roots: "x = 4 or x = -5.5" gives [4, -5.5]; a bare list "3, -5.5" gives both; prose gives none. */
export function statedRoots(raw: string): number[] {
  const t = raw.replace(/[−–]/g, "-").trim();
  const equated = [...t.matchAll(/(?<![A-Za-z])[a-z]\s*=\s*(-?\d+(?:\.\d+)?(?:\/\d+)?)/gi)].map((m) => parseNumeric(m[1]!)?.value).filter((v): v is number => v !== undefined);
  if (equated.length > 0) return equated;
  if (/^\s*-?\d+(?:\.\d+)?(?:\/\d+)?(?:\s*(?:,|;|\band\b|\bor\b)\s*-?\d+(?:\.\d+)?(?:\/\d+)?)*\s*$/i.test(t)) {
    return t.split(/\s*(?:,|;|\band\b|\bor\b)\s*/i).map((p) => parseNumeric(p)?.value).filter((v): v is number => v !== undefined);
  }
  return [];
}

/**
 * Her answer against the value her earlier answer leads to, at an accuracy that value can carry (gate 2, G2-49, 11 Oct
 * 2026). A range written round the right answer (10.3 to 10.4 for 10.38) moves with the followed-through value
 * (1557.5 ÷ 155 = 10.048: "10.05" is right); an exact answer whose followed-through value does not terminate (70 ÷ 6 =
 * 11.666…) is met by that value rounded to the places she gives, one place at least. Otherwise the part's own tolerance.
 */
function followThroughMeets(typed: string, spec: AnswerSpec, t: number, variables: readonly string[]): boolean {
  if (spec.kind !== "numeric") return false;
  const base = { ...toNumericSpec(spec), value: t, variables };
  if (checkNumeric(typed, base).correct) return true;
  const tol = spec.tolerance;
  if (tol.type === "range") {
    const shifted = { ...base, tolerance: { type: "range" as const, min: t - (spec.value - tol.min), max: t + (tol.max - spec.value) } };
    return checkNumeric(typed, shifted).correct;
  }
  if (tol.type === "exact" || (tol.type === "absolute" && tol.value === 0)) {
    const hers = parseNumeric(typed.trim().replace(/^.*[=≈]\s*/, ""));
    if (!hers || Number.isInteger(t)) return false;
    const places = (/\.(\d+)/.exec(String(hers.raw ?? typed).replace(/[^\d.]/g, ""))?.[1] ?? "").length;
    if (places < 1) return false;
    const rounded = Math.round(t * 10 ** places) / 10 ** places;
    return Math.abs(hers.value - rounded) < 1e-9;
  }
  return false;
}

/** A relation's value, its round(), floor() and ceil() worked out first ("round(9 * (32) / 80)" is 4; G2-50). */
function evaluateRelation(put: string): number | null {
  let s = put;
  for (let guard = 0; guard < 8; guard += 1) {
    const m = /\b(round|floor|ceil)\s*\(/.exec(s);
    if (!m) break;
    let depth = 0;
    let end = -1;
    for (let i = m.index + m[0].length - 1; i < s.length; i += 1) {
      if (s[i] === "(") depth += 1;
      else if (s[i] === ")") {
        depth -= 1;
        if (depth === 0) {
          end = i;
          break;
        }
      }
    }
    if (end < 0) return null;
    const inner = evaluateRelation(s.slice(m.index + m[0].length, end));
    if (inner === null) return null;
    const v = m[1] === "round" ? Math.round(inner) : m[1] === "floor" ? Math.floor(inner) : Math.ceil(inner);
    s = `${s.slice(0, m.index)}(${v})${s.slice(end + 1)}`;
  }
  const bare = /^[\s(]*([-+]?\d+(?:\.\d+)?)[\s)]*$/.exec(s);
  return bare ? Number(bare[1]) : evaluateArithmetic(s);
}

export function followThroughValue(ft: FollowThrough, spec: AnswerSpec, typed?: string): number | null {
  // Her own solution list carries into a later part through its relation, root by root: "7" after "x = 4 or x = -5.5"
  // with 2x − 1 is right for her positive root (the M4 author, 8 Oct 2026: histograms/quadratics .0014(c) paid nothing
  // after a two-root text part). The root whose carried value her answer matches is the one the part meant.
  if (ft.earlierSpec.kind === "text") {
    if (!ft.relation || spec.kind !== "numeric") return null;
    const relation = ft.relation;
    const candidates = statedRoots(ft.earlierRaw)
      .map((x) => {
        const put = relation.replace(/\bx\b/g, `(${x})`);
        return evaluateRelation(put);
      })
      .filter((v): v is number => v !== null && Number.isFinite(v));
    if (candidates.length === 0) return null;
    if (typed !== undefined) {
      const hit = candidates.find((c) => checkNumeric(typed, { ...toNumericSpec(spec), value: c }).correct);
      if (hit !== undefined) return hit;
    }
    return candidates[0]!;
  }
  // Her own vector carries into a numeric part: its magnitude, its direction (the angle with the positive x-axis, in the
  // convention the part's own answer uses) or one of its components (the FM2 reviewer, 8 Oct 2026: fm2 ij-vector
  // .0019(b)(c), .0030(c), resultant .0007(b)(c), .0009(b) refused a right answer built on her earlier vector).
  if (ft.earlierSpec.kind === "algebraic") {
    if (spec.kind !== "numeric") return null;
    const was = ijVector(ft.earlierSpec.latex);
    const hers = ijVector(ft.earlierRaw);
    if (!was || !hers) return null;
    const target = spec.value;
    const slack = spec.tolerance.type === "absolute" ? spec.tolerance.value : spec.tolerance.type === "dp" ? 0.5 * Math.pow(10, -(spec.tolerance.places ?? 2)) : 0;
    const close = (v: number) => Number.isFinite(v) && Math.abs(v - target) <= Math.max(slack, 0.006 * Math.abs(target), 0.006);
    const deg = (y: number, x: number) => (Math.atan2(y, x) * 180) / Math.PI;
    const readings: Array<[number, number]> = [
      [Math.hypot(was.a, was.b), Math.hypot(hers.a, hers.b)],
      [deg(was.b, was.a), deg(hers.b, hers.a)],
      [Math.abs(deg(was.b, was.a)), Math.abs(deg(hers.b, hers.a))],
      [(deg(was.b, was.a) + 360) % 360, (deg(hers.b, hers.a) + 360) % 360],
      [Math.abs((Math.atan(was.b / was.a) * 180) / Math.PI), Math.abs((Math.atan(hers.b / hers.a) * 180) / Math.PI)],
      [Math.abs((Math.atan(was.a / was.b) * 180) / Math.PI), Math.abs((Math.atan(hers.a / hers.b) * 180) / Math.PI)],
      [was.a, hers.a],
      [was.b, hers.b],
      [Math.abs(was.a), Math.abs(hers.a)],
      [Math.abs(was.b), Math.abs(hers.b)],
    ];
    for (const [ref, mine] of readings) if (close(ref)) return mine;
    return null;
  }
  if (ft.earlierSpec.kind !== "numeric") return null;
  const x = parseNumeric(ft.earlierRaw.trim())?.value;
  if (x === undefined || !Number.isFinite(x)) return null;
  // Her own value carries even when it is within the earlier part's tolerance (3.24 for 3.2 leads to 12.96, not 12.8).
  const v0 = ft.earlierSpec.value;
  if (ft.relation) {
    // The identity relation ("x", "(x)") hands the reader a bare value, which has no operator to evaluate: it is the value
    // (the P2 author, 7 Oct 2026: p2-calculating-resistance .0014(b)(ii) with her (a) = 9 paid nothing).
    const put = ft.relation.replace(/\bx\b/g, `(${x})`);
    return evaluateRelation(put);
  }
  if (spec.kind !== "numeric" || !ft.workedSolution) return null;
  const target = spec.value;
  // Degree signs come off, so a chain of angles ("90° − 62° = 28°") is arithmetic like any other.
  for (const line of ft.workedSolution.replace(/°/g, "").split(/\n|(?<=[.;])\s+(?=[A-Z])/)) {
    const sides = normaliseEquation(line.replace(/\$/g, " ")).replace(/\*/g, "×").split("=");
    // The value the chain arrives at, with any words after it ("= 28 with the second normal") left off.
    const lastValue = parseNumeric(/^[-+]?\d+(?:\.\d+)?/.exec(sides[sides.length - 1] ?? "")?.[0] ?? "")?.value;
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
/**
 * Does the stem ask for the answer in this unit ("Give your answer in mA", "What current flows, in milliamps?", "in
 * hours")? Only a unit the marker knows counts, and never the article "a" ("in a circuit").
 */
export function instructsUnit(prompt: string | undefined, unit: string): boolean {
  if (!prompt) return false;
  const want = knownUnit(unit) ?? unit;
  for (const m of prompt.matchAll(/\b(?:in (?:the unit )?|how many )([A-Za-zµΩ£%°²³/]+(?: per [A-Za-z]+)?)/gi)) {
    const words = m[1]!;
    if (/^(?:a|an|i|the|it|its|this|that|each|every|one|order|total|terms|full|form|words)$/i.test(words)) continue;
    if (knownUnit(words) === want) return true;
  }
  return false;
}

/**
 * Two inequalities in one unknown, read as the set they describe. Two outside regions ("x < −3", "x > 5") are joined by
 * "or" (or a comma, a semicolon or a new line); "and" between them names no value, the slip the 2025 FM1 report names.
 * An inside region ("x > −3", "x < 5") is "and" or a chain; "or" between those is every value. The message when the
 * connective is wrong, else null (one inequality, a chain, two of the same direction or two unknowns are not judged).
 */
export function solutionSetFault(raw: string): string | null {
  const t = raw.replace(/\s+/g, " ").trim();
  const re = /(?<![A-Za-z])([a-z])\s*(<=?|>=?|≤|≥)\s*(-?\d+(?:\.\d+)?)(?![\d.])|(?<![\d.A-Za-z])(-?\d+(?:\.\d+)?)\s*(<=?|>=?|≤|≥)\s*([a-z])(?![A-Za-z])/g;
  const found: Array<{ v: string; dir: "lt" | "gt"; n: number; at: number; end: number }> = [];
  for (const m of t.matchAll(re)) {
    const less = (m[2] ?? m[5] ?? "").startsWith("<") || (m[2] ?? m[5]) === "≤";
    if (m[1] !== undefined) found.push({ v: m[1], dir: less ? "lt" : "gt", n: Number(m[3]), at: m.index!, end: m.index! + m[0].length });
    else found.push({ v: m[6]!, dir: less ? "gt" : "lt", n: Number(m[4]), at: m.index!, end: m.index! + m[0].length });
  }
  if (found.length !== 2 || found[0]!.v !== found[1]!.v) return null;
  const [p, q] = found as [(typeof found)[number], (typeof found)[number]];
  const lt = p.dir === "lt" ? p : q.dir === "lt" ? q : null;
  const gt = p.dir === "gt" ? p : q.dir === "gt" ? q : null;
  if (!lt || !gt || lt.n === gt.n) return null;
  const between = t.slice(Math.min(p.end, q.end), Math.max(p.at, q.at));
  const joinedAnd = /\band\b|&|∩/i.test(between);
  const joinedOr = /\bor\b|∪|[,;\n]/i.test(between);
  const outside = lt.n < gt.n;
  if (outside && joinedAnd && !joinedOr) {
    return `No value of ${lt.v} is both less than ${lt.n} and greater than ${gt.n}: the two regions are separate, so they are joined by "or" (${lt.v} < ${lt.n} or ${lt.v} > ${gt.n}). The method marks come from the working.`;
  }
  if (!outside && joinedOr && !joinedAnd) {
    return `Every value of ${lt.v} is either greater than ${gt.n} or less than ${lt.n}: the region between them is one region, written ${gt.n} < ${lt.v} < ${lt.n} (or with "and"). The method marks come from the working.`;
  }
  return null;
}

/**
 * One term, as a simplified index answer is written: an optional sign and number, each letter once with at most one
 * index, a quotient allowed (x³/y, \frac{1}{2}x), no multiplication sign, no root, no bracket outside an index and no
 * number raised to a power left unworked ("3^3 c^12"). The answer's own spelling is judged, not its value.
 */
export function isSingleTerm(raw: string): boolean {
  const s = raw.replace(/\$/g, "").replace(/\s+/g, "");
  if (s.length === 0) return false;
  if (/[×*·√=]|\\times|\\cdot|\\sqrt|sqrt/.test(s)) return false;
  // A number raised to a power is a value still to work out ("3^3", "2^{2}").
  if (/(^|[^A-Za-z}])\d+(?:\.\d+)?\^/.test(s)) return false;
  const bare = s
    .replace(/\\[dt]?frac\{([^{}]*)\}\{([^{}]*)\}/g, "$1/$2")
    .replace(/\^(?:\{[^{}]*\}|\([^()]*\)|[-−]?\d+(?:\/\d+)?|[A-Za-z])/g, "")
    .replace(/[²³⁻¹⁰-⁹]/g, "");
  if (/[(){}+]/.test(bare) || /(?!^)[-−]/.test(bare)) return false;
  const letters = bare.match(/[A-Za-z]/g) ?? [];
  if (new Set(letters).size !== letters.length) return false;
  return /^[-−]?(?:\d+(?:\.\d+)?)?[A-Za-z]*(?:\/(?:\d+(?:\.\d+)?)?[A-Za-z]*)?$/.test(bare) && /[A-Za-z\d]/.test(bare);
}

/** An instruction to round to the nearest whole number (or integer, or whole unit of the thing counted): zero decimal places. */
export function instructsNearestWhole(prompt: string | undefined): boolean {
  return instructsAccuracy(prompt) && /\b(?:to|correct to)\s+the\s+nearest\s+(?:whole\s+(?:number|[a-z]+)|integer|unit)\b/i.test(prompt ?? "");
}

export function instructsAccuracy(prompt: string | undefined): boolean {
  if (!prompt) return false;
  const text = prompt.replace(/\bd\.p\./gi, "dp").replace(/\bs\.f\./gi, "sf");
  // An instruction sentence starts with a command word, or attaches the accuracy to "your answer" ("Show your
  // working and give your answer to one decimal place"); a given such as "6.4 cm, correct to 1 decimal place" does neither.
  // "A stopwatch does not round: it cuts the display off at 1 decimal place" describes the given, not the answer (m4
  // bounds .0005, 27 Sep 2026): "round" alone is not an instruction; "round to", "rounded to" are.
  return text.split(/[.!?\n]+/).some(
    (s) =>
      /\b(decimal places?|significant figures?|dp|sf|nearest)\b/i.test(s) &&
      (/^\s*(give|write|work out|calculate|find|round|state|express|estimate)\b/i.test(s) ||
        /\byour answers?\b|\bgiving\b|\brounding\b|\bround(?:ed)?\s+(?:it\s+|this\s+|them\s+)?(?:correct\s+)?to\b/i.test(s)),
  );
}

/** The instructions that make the form the task: an equivalent answer in another form has not done it. */
const FORM_TASK = new RegExp(
  [
    String.raw`\b(?:simplif(?:y|ied)|factori[sz]e|factori[sz]ed|expand|multiply out|rationali[sz]e|as a single (?:fraction|logarithm|log))\b`,
    // "Write down (p + q)^7 in expanded form" asks for the expansion as "Expand" does (fm3 pascals .0003, 29 Sep 2026).
    String.raw`\bin (?:expanded|factori[sz]ed) form\b`,
    String.raw`\bexpress\b(?![^.?!]*\bin terms of\b)[^.?!]*\bas\b`,
    // "Write 550 as a product of its prime factors" (m3 hcf .0011(a), 27 Sep 2026: "550" typed back was paid 2/2).
    String.raw`\bas (?:a |the )?product of (?:its )?prime factors\b`,
    // Converting a number is the whole task (the verifier, round 2): "convert 0.4̇ to a fraction", "write … as a surd",
    // "change … into a mixed number", "write … in standard form".
    String.raw`\b(?:convert|change|write)\b[^.?!]*\b(?:(?:to|as|into) an? (?:fraction|mixed number|surd|decimal|percentage)|in (?:standard|surd) form)\b`,
    // A "show that" part prints its answer, and "show your working" asks for the working: a value alone shows nothing.
    String.raw`\bshow that\b`,
    String.raw`\bshow (?:all )?(?:your|clear) working\b`,
  ].join("|"),
  "i",
);

/**
 * Does the stem instruct the form the value is given in ("leave your answer in terms of π", "in surd form", "as a
 * fraction", "exactly", "in its lowest terms", "in standard form")? Then a right value in another form keeps every
 * mark but the final one, as the accuracy mark is withheld; without such an instruction a value equal within the
 * tolerance earns every mark (the verifier's ruling, 25 Sep 2026).
 */
const FORM_INSTRUCTION = /\b(?:in terms of|in the form|surd form|exact(?:ly)?|as an? (?:exact |single |mixed |improper )?(?:fraction|mixed number|decimal|percentage|whole number|integer)|lowest terms|simplest form|standard form)\b/i;
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
  return {
    ...rest,
    marksAwarded: Math.min(base.marksAvailable, Math.max(base.marksAwarded, hit.marksTypicallyEarned)),
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
  const result = markAnswerInner(raw, spec, opts);
  // A part that requires working pays a bare right value or expression nothing: the runner's working ladder decides,
  // as for a show-that's printed target (`workingOnly`). The answer's own line of working ("20 × 33.4 = 668") is working.
  if (opts.requiresWorking && result.correct && (spec.kind === "numeric" || spec.kind === "algebraic") && !showsWorking(raw)) {
    return {
      ...result,
      correct: false,
      marksAwarded: 0,
      workingOnly: true,
      explanation: "The value is right, but this part says you must show your working: the marks are for the working. Write it in the working box.",
    };
  }
  return result;
}

function markAnswerInner(raw: string, spec: AnswerSpec, opts: MarkOptions = {}): MarkResult {
  const marks = Math.max(1, Math.round(opts.marks ?? 1));
  // The expected answer is shown to the accuracy the stem instructs, as the marking demands it (engine item 13).
  const expected = expectedDisplay(spec, { accuracyInstructed: instructsAccuracy(opts.prompt) });
  let trimmed = raw.trim();

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

  // The question typed back (the stem's own expression, integral or equation, unchanged) takes no step and earns
  // nothing on any part, form task or not (the verifier, 29 Sep 2026: "83² − 17²" for "work out 83² − 17²", an integral
  // typed back, "(p + q)^7" for its expansion). A matching common error still names the misconception, its tag and its
  // feedback, but never its marks: diagnosis is separate from marks (the lead's F, 29 Sep 2026). A bare number from the
  // stem counts only on a form task ("550" for its prime factors): a number the stem gives is often the right answer.
  // The number rule reads only a real form task's stem: "show your working" and "show that" are not ("Calculate the mean
  // … Show your working out" answered 6, one of the data values, is the right mean).
  const conversion = opts.prompt !== undefined && isFormTask(opts.prompt.replace(/\bshow that\b[^.?!]*|\bshow (?:all )?(?:your|clear) working(?: out)?\b/gi, " "), spec);
  if ((spec.kind === "numeric" || spec.kind === "algebraic") && copiesTheQuestion(trimmed, opts.prompt, conversion)) {
    const base: MarkResult = { correct: false, marksAwarded: 0, marksAvailable: marks, expected, explanation: "That is the question as it is printed: no step has been taken yet." };
    const named = withCommonError(base, trimmed, opts, undefined, undefined, spec.kind === "algebraic" ? spec.variables : undefined, spec.kind === "algebraic" ? spec.latex : undefined);
    // On a show-that part the printed target is what she typed back: her working decides (showThatTarget).
    return { ...named, marksAwarded: 0, copiesQuestion: true, ...(isShowThat(opts.prompt) ? { workingOnly: true } : {}) };
  }

  switch (spec.kind) {
    case "numeric": {
      const numSpec = { ...toNumericSpec(spec, { accuracyInstructed: instructsAccuracy(opts.prompt) }), variables: variableLetters(opts.prompt) };
      // "Correct to the nearest whole number" is an accuracy demand of no decimal places, read as "to 0 decimal places"
      // is: an unrounded value that rounds to the answer ("4856.3" for 4856) is the right value, and on a science paper,
      // which marks instructed places as written, it loses the accuracy mark only (the B2 E author, 7 Oct 2026:
      // b2-heart-attacks .0007(a) scored 0 of 3; maths keeps the lead's 27 Sep ruling that more places than asked are right).
      const nearestWhole = numSpec.dp === undefined && numSpec.sigfigs === undefined && Number.isInteger(spec.value) && spec.tolerance.type === "absolute" && instructsNearestWhole(opts.prompt);
      if (nearestWhole) {
        numSpec.dp = 0;
        numSpec.tolerance = { type: "dp", n: 0 };
      }
      const placesSpec: AnswerSpec = nearestWhole ? { ...spec, tolerance: { type: "dp", places: 0 } } : spec;
      const v = checkNumeric(trimmed, numSpec);
      if (v.correct && isShowThat(opts.prompt) && !showsWorking(trimmed) && printsTheValue(opts.prompt, spec)) return showThatTarget(marks, expected);
      // A "work out" answered with the sum still to do ("(83 + 17)(83 − 17)" for 6600): working, not the answer. The
      // ladder pays what it shows, never the answer's mark (the verifier, 29 Sep 2026; M4 scheme: MA1 for the form, A1
      // for 6600).
      if (v.correct && unevaluated(trimmed, v.parsed?.form)) {
        const ladder = opts.scheme && opts.scheme.length > 0 ? markWorking(opts.scheme.map(() => trimmed), opts.scheme, opts.workedSolution ?? "").marks : marks - 1;
        const award = Math.max(0, Math.min(marks - 1, ladder));
        return { correct: false, marksAwarded: award, marksAvailable: marks, expected, explanation: `${trimmed} is right, but it is a calculation still to do: work it out to finish. ${award} of ${marks}.` };
      }
      // A right value whose required unit is missing or wrong keeps every mark but the unit's, the answer's last; so
      // does a right value in another form, unless the form is the task (MK-01 ruling), where it earns nothing.
      const unitOnly = !v.correct && v.valueRight === true && marks > 1;
      const formTask = !v.correct && v.formOnly === true && isFormTask(opts.prompt, spec);
      // A right value in another form: every mark where the stem does not instruct the form, the marks less the final
      // one where it does, and nothing where the form is the whole task.
      // Decimal places or significant figures instructed are an instructed form too: an exact value there ("12√2" for
      // "to 2 decimal places") is the right value in the wrong form (the ruling is symmetric; FM2 D, 25 Sep 2026).
      if (!v.correct && v.formOnly === true && !formTask && !instructsForm(opts.prompt) && !instructsAccuracy(opts.prompt)) {
        return { correct: true, marksAwarded: marks, marksAvailable: marks, expected, explanation: "Correct." };
      }
      // A form task on a number ("Change 0.3̇ to a fraction in its simplest form") pays the steps its answer shows, as
      // for an expression ("3/9" is the scheme's "3/9 seen", M1; the verifier, 29 Sep 2026: it had no ladder).
      if (formTask) return formTaskAward(trimmed, v.feedback, marks, expected, opts, spec);
      // A decimal where the stem instructs an exact form ("Give your answer as a fraction in its lowest terms"): a
      // calculator's decimal shows no method, so with a scheme only the ladder pays ("0.1666666667" for 1/6 earns what
      // its line shows; the verifier's E, 29 Sep 2026). An exact form where decimals are asked keeps marks − 1.
      // Only for a fraction: the decimal is the value unconverted. "113.1" for 36π shows the evaluation, and keeps marks − 1.
      const asksFraction = spec.acceptForms.some((f) => f === "fraction" || f === "mixed") && !spec.acceptForms.some((f) => f === "pi" || f === "surd");
      if (!v.correct && v.formOnly === true && asksFraction && instructsForm(opts.prompt) && opts.scheme && opts.scheme.length > 0 && ["decimal", "integer"].includes(v.parsed?.form ?? "")) {
        return formTaskAward(trimmed, v.feedback, marks, expected, opts, spec);
      }
      const formOnly = !v.correct && v.formOnly === true && !formTask && marks > 1;
      // The right value short of the instructed accuracy (rounded to fewer places or figures than asked, or an exact form
      // where a decimal is asked): every mark but the accuracy mark. A dropped final zero and more places than asked are
      // right (CCEA's guidance; the lead's reversal of 27 Sep 2026), with the write-it-this-way reminder as words only.
      if (!v.correct && v.accuracyOnly === true && !formTask) {
        // A common error that names this value as another mistake decides instead ("6" for 6.09 is the mean of the two
        // velocities, marked 0, not 6.09 rounded; the lead's H, 29 Sep 2026).
        if ((opts.commonErrors ?? []).some((e) => matchesCommonError(trimmed, e))) {
          return withCommonError({ correct: false, marksAwarded: 0, marksAvailable: marks, expected, explanation: v.feedback }, trimmed, opts);
        }
        const award = Math.max(0, marks - 1);
        const lost = award === 0 ? `0 of ${marks}: the accuracy mark is lost.` : `${award} of ${marks}: only the accuracy mark is lost.`;
        const r: MarkResult = { correct: false, marksAwarded: award, marksAvailable: marks, expected, explanation: `${v.feedback} ${lost}` };
        return withCommonError(r, trimmed, opts);
      }
      // Science marks the places as instructed: a dropped final zero or extra places lose the accuracy mark there (DAS
      // 2025 chemistry report, C1 Q(b): "many lost a mark for not giving their answer to one decimal place as
      // instructed"; the lead's scope of ruling 12, 27 Sep 2026). Further Maths and Maths parts keep them right with the
      // reminder (FM GMI "Accept 1.5 instead of 1.50 for an answer required to 2 dp"; M4 2025 GMA (viii)).
      if (v.correct && !v.converted && isScience(opts.subject) && instructsAccuracy(opts.prompt) && sciencePlacesDiffer(v, placesSpec)) {
        const award = Math.max(0, marks - 1);
        const said = v.feedback.replace(/^Correct(?:, within the accepted accuracy)?\.\s*/, "The value is right. ");
        const places = nearestWhole
          ? "the nearest whole number"
          : placesSpec.tolerance.type === "dp"
            ? plural(placesSpec.tolerance.places ?? 0, "decimal place")
            : plural(placesSpec.tolerance.type === "sf" ? (placesSpec.tolerance.figures ?? 0) : 0, "significant figure");
        const reminder = /on the paper/.test(said) ? "" : ` The question asks for ${places}: ${expected}.`;
        const lost = award === 0 ? `0 of ${marks}: the accuracy mark is lost.` : `${award} of ${marks}: only the accuracy mark is lost.`;
        const placed: MarkResult = { correct: false, marksAwarded: award, marksAvailable: marks, expected, explanation: `${said}${reminder} ${lost}`.replace(/\s{2,}/g, " ").trim() };
        // The part's own common error for this slip (the instructed places ignored) tags it; the award is the scheme's
        // accuracy mark lost (gate 2, G2-62, the P2 author's EF-8).
        const named = (opts.commonErrors ?? []).find((e) => matchesCommonError(trimmed, e));
        return named ? { ...placed, tags: [named.misconception] } : placed;
      }
      // A unit the stem instructs ("Give your answer in mA", "… in hours?"): the right value left in another unit has
      // not made the conversion asked for, and loses the unit's mark (the P2 C review, 25 Sep 2026: "0.08 A" for "in mA").
      if (v.correct && v.converted === true && spec.unit && instructsUnit(opts.prompt, spec.unit)) {
        const award = Math.max(0, marks - 1);
        const r: MarkResult = {
          correct: false,
          marksAwarded: award,
          marksAvailable: marks,
          expected,
          explanation: `${trimmed} is the right value, but the question asks for the answer in ${spec.unit}: ${expected}. ${award} of ${marks}: the unit's mark is lost.`,
        };
        return withCommonError(r, trimmed, opts);
      }
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
        const t = followThroughValue(opts.followThrough, spec, trimmed);
        if (t !== null && followThroughMeets(trimmed, spec, t, variableLetters(opts.prompt))) {
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
      // A label before the expression asked for is a label: the side after it is her answer (gate 2, G2-20/G2-21).
      trimmed = expressionAfterLabel(trimmed, spec.latex, opts.prompt) ?? trimmed;
      // Where x is not one of the answer's letters, an x between numbers is the times sign ("2 x 5^2 x 11").
      const read = spec.variables.includes("x") ? trimmed : trimmed.replace(/(?<=[\d)²³])\s*x\s*(?=[\d(])/g, " × ");
      let v = checkAlgebraic(read, toAlgebraSpec(spec));
      // "1/2x" is half of x to one student and 1/(2x) to another, and the schemes print both ("y = −3/2x + 4" for a
      // gradient; "\frac{1}{2x}" for a reciprocal). The engine reads the joined form as a/(bx); when that is not the
      // answer, the coefficient reading (a/b)x is tried, and the answer is right when either reading is. The two
      // readings differ, so a wrong answer is never paid by the other reading (the M4 author, 8 Oct 2026:
      // perpendicular-lines .0008 to .0022 refused "y = -1/2x + 1").
      if (!v.correct && /(^|[^\w/.\\{])\d+\/\d+(?=[A-Za-z(])/.test(read)) {
        const coefficient = read.replace(/(^|[^\w/.\\{])(\d+)\/(\d+)(?=[A-Za-z(])/g, "$1\\frac{$2}{$3}");
        const alt = checkAlgebraic(coefficient, toAlgebraSpec(spec));
        if (alt.correct) v = alt;
      }
      if (v.correct && isShowThat(opts.prompt) && !showsWorking(trimmed) && printsTheValue(opts.prompt, spec)) return showThatTarget(marks, expected);
      // A simplify-indices task is a form task (ruling 4): the answer is one term, its number worked out, each letter
      // once with one index, no operator between the factors and no root sign. An unfinished product ("27 × c^12",
      // "3^3 c^12", "x^(5/2) × x^(1/2)") is equivalent and is not the answer: it earns the matching common error or the
      // ladder only (the M8 author, 8 Oct 2026; the November 2024 M8 report: a times sign left in lost the mark).
      if (v.correct && isFormTask(opts.prompt, spec) && isSingleTerm(spec.latex) && !isSingleTerm(trimmed)) {
        return formTaskAward(trimmed, "The value is right, but a simplified index answer is one term: the number worked out, each letter once with one index, no multiplication sign between the factors and no root sign.", marks, expected, opts, spec);
      }
      // One right root of a solution set earns the scheme's accuracy point that names it, or one mark a root where the
      // scheme names none, never the last mark (the M4 author, 8 Oct 2026: m4 perpendicular-lines .0021 "p = 7" scored
      // 0 of 6 where the scheme pays A2). A wrong root beside a right one is not this case and earns nothing.
      if (!v.correct && v.reason === "partial-solution-set" && v.solutionsFound && v.solutionsFound.length > 0) {
        // A scheme's accuracy point names a root by its equation ("x = 7") or by its value ("x = −4/3 (accept −1.33 or
        // better)", "x = 4 and x = −4").
        const pointsNaming = (roots: readonly string[], values: readonly number[]) =>
          (opts.scheme ?? [])
            .filter((p) => /^[AB]/.test(p.code))
            .filter((p) => {
              const bare = normaliseEquation(p.for.replace(/\$/g, "").replace(/\([^()]*\)/g, ""), { lowercase: true });
              if (roots.some((root) => bare === normaliseEquation(root, { lowercase: true }))) return true;
              const numbers = (p.for.replace(/[−–]/g, "-").match(/-?\d+(?:\.\d+)?(?:\/\d+)?/g) ?? []).map((n) => parseNumeric(n)?.value).filter((n): n is number => n !== undefined);
              return values.some((value) => Number.isFinite(value) && numbers.some((n) => Math.abs(n - value) <= 0.006 * Math.max(1, Math.abs(value))));
            })
            .reduce((s, p) => s + p.marks, 0);
        const named = pointsNaming(v.solutionsFound, v.solutionsFoundValues ?? []);
        // The method before the roots is implied by a right root (CCEA: a correct answer implies the method unless working
        // is demanded), so one root loses only the accuracy point its scheme gives the missing root: "x = 1/2" is MA1 +
        // A1 = 2 of 3 (the M4 author, 8 Oct 2026). Where no point names the missing root, the found roots' own points stand.
        const lost = pointsNaming(v.solutionsMissing ?? [], v.solutionsMissingValues ?? []);
        const award = Math.min(marks - 1, lost > 0 ? Math.max(named, marks - lost) : named > 0 ? named : v.solutionsFound.length);
        // At 0 marks there is no mark to name ("0 of 1: the x = 3 you found earns its mark" said both; gate 2, G2-55), and a
        // common error that names the slip tags it as the scheme's own error does.
        const said =
          award > 0
            ? `${v.feedback} ${award} of ${marks}: the ${(v.solutionsFoundShown ?? v.solutionsFound).join(", ")} you found ${v.solutionsFound.length === 1 ? "earns its mark" : "earn their marks"}; the rest wait for the other ${v.solutionsTotal! - v.solutionsFound.length === 1 ? "root" : "roots"}.`
            : `${v.feedback} 0 of ${marks}: the mark is for every solution.`;
        const partial: MarkResult = { correct: false, marksAwarded: award, marksAvailable: marks, expected, explanation: said };
        const namedError = (opts.commonErrors ?? []).find((e) => matchesCommonError(trimmed, e));
        return namedError ? { ...partial, tags: [namedError.misconception] } : partial;
      }
      // The right expression in the wrong form (unsimplified, not yet a single log, not factorised) keeps every mark
      // but the last on a multi-mark part: the scheme's final mark is the form, the earlier ones the working.
      // Not where the form IS the task (MK-01 ruling, 25 Sep 2026: "simplify fully" with the question typed back was
      // paid marks − 1): there the right value in another form earns nothing, or a matched common error's own marks.
      const wrongForm = !v.correct && (v.reason === "equivalent-wrong-form" || v.reason === "not-simplified");
      const formTask = wrongForm && isFormTask(opts.prompt, spec);
      if (formTask) return formTaskAward(trimmed, v.feedback, marks, expected, opts, spec);
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
        if (x !== undefined && nextOptionAbove(spec, x) === ids[0]) {
          return { correct: true, marksAwarded: marks, marksAvailable: marks, expected, explanation: "Right for your answer to the earlier part: the marks follow through." };
        }
      }
      return base;
    }
    case "text": {
      // The answer field writes relations in TeX ("-6 \lt x \lt 5", "x \le -3 \text{ or } x \ge 4"): a relation command
      // is its sign and \text{…} its words, before anything reads the answer (gate 2, G2-08, 11 Oct 2026: the right
      // region scored 0/3, diagnosed as the critical values because no sign was read).
      trimmed = texRelationsAsTyped(trimmed);
      // A solution set written as two inequalities is read as a set before its key words are: "x < −3 and x > 5" names
      // no value (the FM1 group 1 author, 7 Oct 2026; the 2025 FM1 report's slip), and the key-word route would pay both
      // regions. The answer earns nothing; her working still earns its method marks through the runner's ladder.
      const setFault = solutionSetFault(trimmed);
      if (setFault !== null) return { correct: false, marksAwarded: 0, marksAvailable: marks, expected, explanation: setFault };
      // The part's text common errors are its named wrong answers: offered beside the right one in a hedge, they cancel it.
      const wrongAnswers = (opts.commonErrors ?? []).flatMap((e) => {
        if (e.pattern.kind !== "text") return [];
        try {
          return [new RegExp(e.pattern.regex, "i")];
        } catch {
          return [];
        }
      });
      // A name with its formula: the part judges the one it asks for, the other is ignored even if wrong (CCEA C2 2021;
      // the verifier, 25 Sep 2026: "carbon monoxide (CO2)" was paid for carbon dioxide). The stem's "name" or
      // "formula" decides; without either, formula-only key words ask for the formula, anything else for the name.
      const asksFormula = /\bformulae?\b/i.test(opts.prompt ?? "");
      const asksName = /\bname\b/i.test(opts.prompt ?? "");
      const formulaKeys = spec.keyWords.length > 0 && spec.keyWords.every((g) => g.any.every((k) => isFormula(k)));
      // The side the part judges; the other side is dropped unless it earns a point of its own that the judged side does
      // not ("C3H6, a gas" where the part asks for the formula AND the state; gate 2, G2-10, 11 Oct 2026: the state was
      // dropped, 1/2).
      const judge = (item: string, p: { name: string; formula: string }) => {
        const kept = asksFormula && !asksName ? p.formula : asksName && !asksFormula ? p.name : formulaKeys ? p.formula : p.name;
        const dropped = kept === p.formula ? p.name : p.formula;
        const groupsOf = (t: string) => markText(t, spec).matchedGroups;
        // A point of its own: a group the judged side does not earn and that names no substance by formula (a state, a
        // property); a group keyed by formulae is the substance the stem asks about, judged on the side it asks for.
        const own = groupsOf(dropped).filter((g) => !groupsOf(kept).includes(g) && !spec.keyWords[g]!.any.some((k) => k.split("|").some((x) => isFormula(x))));
        return own.length > 0 ? item : kept;
      };
      // Item by item: each listed item that is a name with its formula is judged as its own pair ("carbon dioxide (CO2)
      // and water (H2O)" was read as one pair and judged as "H2O" alone, 1/2; G2-09, the C2 author's EF-15).
      const items = listedItems(trimmed);
      const pairs = items.map((it) => nameWithFormula(it));
      const pair = nameWithFormula(trimmed);
      let judged = trimmed;
      if (items.length >= 2 && pairs.some((x) => x !== null)) judged = items.map((it, k) => (pairs[k] ? judge(it, pairs[k]!) : it)).join(" and ");
      else if (pair) judged = judge(trimmed, pair);
      const v = markText(judged, spec, { wrongAnswers, dependsOn: groupDependencies(spec, opts.scheme), model: opts.workedSolution ? [opts.workedSolution] : [] });
      const groups = spec.keyWords.length > 0;
      // Key-word groups need not sum to the part's tariff: a 1-mark "state, with a reason" part is written as
      // two groups (the verdict and the reason). The part's marks are shared out by the fraction of group
      // marks earned, rounding down, so every group is needed for the full mark and a question's total
      // always agrees with its parts.
      let awarded = !groups
        ? v.correct
          ? marks
          : 0
        : v.marksAvailable === marks
          ? v.marksAwarded
          : Math.floor((marks * v.marksAwarded) / v.marksAvailable);
      let explanation = v.feedback;
      if (groups && v.marksAvailable !== marks && v.feedback.startsWith(`${v.marksAwarded} of ${v.marksAvailable}:`)) {
        const missing = spec.keyWords.filter((_, i) => !v.matchedGroups.includes(i)).map(ideaLabel);
        explanation = `${awarded} of ${marks}: still missing ${missing.join(", ")}.`;
      }
      // A show-that's printed result typed alone earns nothing (class C, the M4 author, 8 Oct 2026: m4 quadratic-formula
      // .0011, .0014(a), .0022(a) paid 1/3 for the target). A group whose every entry is the printed target counts only
      // beside another group; a lead-in ("so …") is not working.
      if (groups && !v.correct && isShowThat(opts.prompt)) {
        const target = (opts.prompt ?? "").match(/show that\s*\$([^$]+)\$/i)?.[1];
        if (target) {
          const key = normaliseEquation(target, { lowercase: true });
          const targetGroups = spec.keyWords.map((g, i) => (g.any.every((k) => normaliseEquation(k.replace(/\$/g, ""), { lowercase: true }) === key) ? i : -1)).filter((i) => i >= 0);
          if (targetGroups.length > 0 && v.matchedGroups.length > 0 && v.matchedGroups.every((i) => targetGroups.includes(i))) {
            const note = "That is the printed result, which the question gives you: the marks are for the lines that reach it. Show the working from the given facts to this equation.";
            // The target and nothing else (a lead-in such as "so" aside) earns nothing, whatever common error its line
            // matches; a fuller answer whose key words are only the target's pays nothing for them, and a matched
            // common error (a verification by substitution) may still pay below.
            const alone = normaliseEquation(trimmed.replace(/^(?:so|therefore|hence|thus|then|giving|gives)[\s,:]+/i, ""), { lowercase: true }) === key;
            if (alone) return { correct: false, marksAwarded: 0, marksAvailable: marks, expected, explanation: note };
            awarded = 0;
            explanation = note;
          }
        }
      }
      // A root list (every key-word group a value: "1.81" and "−1.21"): a bare list with a value that is no root earns
      // nothing, and one right root loses only the accuracy point its scheme gives the missing root (the M4 author, 8 Oct
      // 2026: .0008 "x = 1.81" 2/4 where the scheme gives 3; .0020 "12 and 13" 2/4 where it gives 0).
      const rootList = groups && spec.keyWords.every((g) => g.any.every((k) => parseNumeric(k)?.value !== undefined));
      if (rootList && !v.correct) {
        const rootValues = spec.keyWords.map((g) => g.any.map((k) => parseNumeric(k)!.value));
        const isRoot = (x: number) => rootValues.some((vs) => vs.some((r) => Math.abs(r - x) <= 1e-9 * Math.max(1, Math.abs(r))));
        const stated = statedRoots(trimmed);
        const bareList = stated.length > 0 && !/[a-z]{2,}/i.test(trimmed.replace(/\b(?:and|or)\b/gi, ""));
        if (bareList && stated.some((x) => !isRoot(x))) {
          return { correct: false, marksAwarded: 0, marksAvailable: marks, expected, explanation: `${stated.filter((x) => !isRoot(x)).join(", ")} is not a solution of this equation: a wrong value beside a right one earns nothing. Check the working that led to it.` };
        }
        // The roots she has are the ones she stated (a group dependency drawn from the scheme may have dropped one from
        // the key-word count: "x = -4" against A1 "x = 4 and x = −4"), else the groups the key words found.
        const foundGroups = stated.length > 0 ? rootValues.map((vs, i) => (stated.some((x) => vs.some((r) => Math.abs(r - x) <= 1e-9 * Math.max(1, Math.abs(r)))) ? i : -1)).filter((i) => i >= 0) : v.matchedGroups;
        if (foundGroups.length > 0 && foundGroups.length < spec.keyWords.length && (stated.length === 0 || stated.every(isRoot))) {
          const missingValues = rootValues.filter((_, i) => !foundGroups.includes(i)).flat();
          const lost = (opts.scheme ?? [])
            .filter((p) => /^[AB]/.test(p.code))
            .filter((p) => (p.for.replace(/[−–]/g, "-").match(/-?\d+(?:\.\d+)?/g) ?? []).map(Number).some((n) => missingValues.some((m) => Math.abs(m - n) <= 1e-9 * Math.max(1, Math.abs(m)))))
            .reduce((s, p) => s + p.marks, 0);
          if (lost > 0) {
            const award = Math.max(awarded, Math.min(marks - 1, marks - lost));
            const missing = spec.keyWords.filter((_, i) => !foundGroups.includes(i)).map(ideaLabel);
            return { correct: false, marksAwarded: award, marksAvailable: marks, expected, explanation: `${award} of ${marks}: the root you have earns its marks; still missing ${missing.join(", ")}.` };
          }
        }
      }
      const base: MarkResult = { correct: v.correct, marksAwarded: awarded, marksAvailable: marks, expected, explanation };
      if (v.correct) return base;
      // A matched common error supplies the diagnosis and the tag but never raises the key words' award (the lead's I,
      // 29 Sep 2026: "protons and neutrons" was paid 2/3 by an error written for "electrons collide with the protons").
      // The one exception is a show-that verified by substitution: the scheme pays the check its method marks, which the
      // error names, never the last mark (the lead's H; CCEA FM2 2021 MS caps verification at 2 of 3). Only that error,
      // on a real show-that: any other error on such a stem ("x = 2" for a discriminant proof, "multiply the whole
      // equation by 10", a sin/cos swap) names a wrong method and pays nothing (the verifier, 29 Sep 2026).
      const diagnosed = withCommonError(base, trimmed, opts);
      const hit = (opts.commonErrors ?? []).find((e) => matchesCommonError(trimmed, e));
      const verified = hit !== undefined && isVerification(hit) && isShowThat(opts.prompt) && diagnosed.marksAwarded > base.marksAwarded;
      // The lead's ruling of 8 Oct 2026 (the M8 author): on a show-that part, a matched common error whose answer shows a
      // line of working pays what its own scheme line gives, the author's marksTypicallyEarned (the M1 for a correct
      // substitution with a slip after it: "x² + x² + 25 = 53", "484 − 144 = 340"), never the show-that value itself. A
      // bare value or a sentence with no working ("x = 2", "multiply the whole equation by 10") still names a wrong
      // method and pays nothing.
      const slip = hit !== undefined && isShowThat(opts.prompt) && showsWorking(trimmed) && diagnosed.marksAwarded > base.marksAwarded;
      return { ...diagnosed, marksAwarded: verified || slip ? Math.min(diagnosed.marksAwarded, marks - 1) : base.marksAwarded };
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
      // A reversible reaction written back to front with the reversible sign, otherwise right: every mark but one (the
      // verifier, round 2; CCEA C2 H 2022 "award [3]" of 4).
      if (!v.correct && spec.kindOf !== "physics" && marks > 1 && reversedReversible(raw, spec)) {
        return { correct: false, marksAwarded: marks - 1, marksAvailable: marks, expected, explanation: `The reaction is right, but written back to front: ${marks - 1} of ${marks}. Put the reactants on the left.` };
      }
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
