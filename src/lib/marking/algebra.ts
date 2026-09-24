/**
 * Algebraic answer checker for GCSE / Further Maths marking.
 *
 * Accepts either LaTeX (from a MathLive math-field) or plain typed maths,
 * normalises it to LaTeX, parses it with @cortex-js/compute-engine and then
 * decides whether the student's answer is equivalent to the marking scheme's
 * answer – optionally also checking that it is in the required *form*
 * (factorised, simplest fraction, y = mx + c, ...).
 *
 * Equivalence strategy, in order:
 *   1. `isSame` on canonical forms (structural identity)
 *   2. `isEqual` / simplify(difference) === 0
 *   3. numeric sampling at 12 seeded random points in the domain
 * Equations (and inequalities) are compared as `lhs - rhs` up to a non-zero
 * constant factor, so 2x + 3y = 7 is equivalent to 4x + 6y = 14.
 */
import { ComputeEngine, isFunction, sym } from '@cortex-js/compute-engine';
import type { BoxedExpression } from '@cortex-js/compute-engine';

// ---------------------------------------------------------------------------
// Public types
// ---------------------------------------------------------------------------

export type AlgebraMode = 'equivalent' | 'identical-after-simplify' | 'form';

export type AlgebraForm =
  | 'factorised'
  | 'expanded'
  | 'simplest-fraction'
  | 'completed-square'
  | 'y=mx+c'
  | 'surd-rationalised'
  | 'single-fraction'
  | 'integer-coefficients'
  /** The spec's subject (its `x` in `x = …`) alone on one side and absent from the other. */
  | 'subject'
  /** Exactly one logarithm, and nothing outside it: "express as a single logarithm". */
  | 'single-log'
  /** No product, quotient or power left inside any logarithm: "write in terms of log a and log b". */
  | 'expanded-logs'
  /** A single logarithm whose argument is multiplied out: no power of a bracket left inside, so log 8x^3 rather than log (2x)^3. */
  | 'single-log-expanded';

export interface AlgebraSpec {
  /** Canonical answer – LaTeX or plain, e.g. '(x+3)(x-2)', '\\frac{5x+1}{10}', 'y=2x-1'. */
  answer: string;
  mode: AlgebraMode;
  /** Required form when mode === 'form'. */
  form?: AlgebraForm;
  /** Extra variable names to sample (unknowns in the expressions are always included). */
  variables?: string[];
  /** Sampling ranges per variable; default [-5, 5]. */
  domain?: Record<string, [number, number]>;
  /** Alternative acceptable answers (any one of them matching is enough). */
  alternatives?: string[];
  /** For equations with several solutions, e.g. ['x=2', 'x=-3'] (order-insensitive). */
  solutionSet?: string[];
}

export type AlgebraReason =
  | 'identical'
  | 'equivalent'
  | 'equivalent-wrong-form'
  | 'not-equivalent'
  | 'partial-solution-set'
  | 'extra-solutions'
  | 'unparseable'
  | 'sign-error'
  | 'expanded-not-factorised'
  | 'not-simplified';

export interface AlgebraVerdict {
  correct: boolean;
  reason: AlgebraReason;
  /** Tutor-voice feedback, British English, concise. */
  feedback: string;
  details?: { sampled?: number; mismatchAt?: Record<string, number> };
}

export interface ParsedStudentExpression {
  latex: string;
  expr: BoxedExpression | null;
  error?: string;
}

// ---------------------------------------------------------------------------
// Shared compute engine (lazily created, one instance for the whole app)
// ---------------------------------------------------------------------------

let engine: ComputeEngine | null = null;

export function getEngine(): ComputeEngine {
  if (!engine) engine = new ComputeEngine();
  return engine;
}

// ---------------------------------------------------------------------------
// MathJSON helpers (used on the non-canonical parse for form checks)
// ---------------------------------------------------------------------------

type MJ = number | string | MJ[] | { [key: string]: unknown };

const CONSTANT_SYMBOLS = new Set([
  'Pi',
  'ExponentialE',
  'ImaginaryUnit',
  'Nothing',
  'True',
  'False',
  'Infinity',
  'PositiveInfinity',
  'NegativeInfinity',
  'ComplexInfinity',
  'CatalanConstant',
  'EulerGamma',
  'GoldenRatio',
  'Degrees',
  'NaN',
]);

const SUM_HEADS = new Set(['Add', 'Subtract']);
const PRODUCT_HEADS = new Set(['Multiply', 'InvisibleOperator']);
const RELATION_HEADS = new Set(['Equal', 'NotEqual', 'Less', 'LessEqual', 'Greater', 'GreaterEqual']);
const SET_HEADS = new Set(['Tuple', 'List', 'Set', 'Or', 'And', 'Sequence', 'Pair', 'Triple']);

function head(e: MJ): string | null {
  return Array.isArray(e) && typeof e[0] === 'string' ? e[0] : null;
}

function args(e: MJ): MJ[] {
  return Array.isArray(e) ? e.slice(1) : [];
}

function isSymbol(e: MJ): e is string {
  return typeof e === 'string' && !e.startsWith("'");
}

function isVariableSymbol(e: MJ): e is string {
  return isSymbol(e) && !CONSTANT_SYMBOLS.has(e);
}

/** Numeric value of a literal-ish MathJSON node, or null if it is not a plain number. */
function numberValue(e: MJ): number | null {
  if (typeof e === 'number') return e;
  if (typeof e === 'object' && e !== null && !Array.isArray(e) && typeof e.num === 'string') {
    const v = Number(e.num);
    return Number.isFinite(v) ? v : null;
  }
  const h = head(e);
  const a = args(e);
  if (h === 'Rational' && a.length === 2) {
    const n = numberValue(a[0]);
    const d = numberValue(a[1]);
    return n !== null && d !== null && d !== 0 ? n / d : null;
  }
  if (h === 'Negate' && a.length === 1) {
    const v = numberValue(a[0]);
    return v === null ? null : -v;
  }
  if (h === 'Delimiter') return numberValue(a[0]);
  return null;
}

function isIntegerLiteral(e: MJ): boolean {
  const v = numberValue(e);
  return v !== null && Number.isInteger(v);
}

/** True if the subtree mentions any non-constant symbol. */
function containsVariable(e: MJ): boolean {
  if (isVariableSymbol(e)) return true;
  if (Array.isArray(e)) return e.slice(1).some(containsVariable);
  if (typeof e === 'object' && e !== null && typeof e.sym === 'string') {
    return !CONSTANT_SYMBOLS.has(e.sym);
  }
  return false;
}

function containsSymbol(e: MJ, sym: string): boolean {
  if (e === sym) return true;
  if (Array.isArray(e)) return e.slice(1).some((c) => containsSymbol(c, sym));
  return false;
}

function hasHead(e: MJ, heads: Set<string>): boolean {
  if (!Array.isArray(e)) return false;
  const h = head(e);
  if (h && heads.has(h)) return true;
  return e.slice(1).some((c) => hasHead(c, heads));
}

function walk(e: MJ, visit: (node: MJ) => void): void {
  visit(e);
  if (Array.isArray(e)) e.slice(1).forEach((c) => walk(c, visit));
}

function strip(e: MJ): MJ {
  let cur = e;
  while (head(cur) === 'Delimiter') cur = args(cur)[0];
  return cur;
}

function stripNegate(e: MJ): MJ {
  let cur = strip(e);
  while (head(cur) === 'Negate') cur = strip(args(cur)[0]);
  return cur;
}

/** For `y = expr` or `f(x) = expr` return `expr`; otherwise the node itself. */
function unwrapEquation(e: MJ): MJ {
  const s = strip(e);
  if (head(s) !== 'Equal') return s;
  const [lhs, rhs] = args(s);
  const l = strip(lhs);
  const r = strip(rhs);
  const isSubject = (n: MJ): boolean => {
    if (isVariableSymbol(n)) return true;
    const h = head(n);
    return h !== null && /^[a-zA-Z]$/.test(h) && args(n).every(isVariableSymbol);
  };
  if (isSubject(l)) return r;
  if (isSubject(r)) return l;
  return s;
}

/** Flatten a product into factors; integer powers of non-constant bases are repeated. */
function flattenProduct(e: MJ): MJ[] {
  const s = strip(e);
  const h = head(s);
  if (h && PRODUCT_HEADS.has(h)) return args(s).flatMap(flattenProduct);
  if (h === 'Negate') return [-1, ...flattenProduct(args(s)[0])];
  if (h === 'Power') {
    const [base, exp] = args(s);
    const n = numberValue(exp);
    if (n !== null && Number.isInteger(n) && n >= 2 && n <= 12 && containsVariable(base)) {
      return Array.from({ length: n }, () => strip(base));
    }
  }
  return [s];
}

/** Flatten a sum into terms (subtracted terms are wrapped in Negate). */
function flattenSum(e: MJ): MJ[] {
  const s = strip(e);
  const h = head(s);
  if (h === 'Add') return args(s).flatMap(flattenSum);
  if (h === 'Subtract') {
    const [a, b] = args(s);
    return [...flattenSum(a), ...flattenSum(b).map((t) => ['Negate', t] as MJ)];
  }
  if (h === 'Negate') return flattenSum(args(s)[0]).map((t) => ['Negate', t] as MJ);
  return [s];
}

/** True when sums only appear along the top-level chain (no brackets around sums). */
function sumsOnlyAtTop(e: MJ, atTop = true): boolean {
  if (!Array.isArray(e)) return true;
  const h = head(e);
  if (h === 'Delimiter') return sumsOnlyAtTop(args(e)[0], atTop);
  if (h && SUM_HEADS.has(h)) {
    if (!atTop) return false;
    return args(e).every((c) => sumsOnlyAtTop(c, true));
  }
  return args(e).every((c) => sumsOnlyAtTop(c, false));
}

function isLinearTerm(e: MJ): boolean {
  const s = strip(e);
  if (isVariableSymbol(s) || numberValue(s) !== null) return true;
  if (!containsVariable(s)) return true;
  const h = head(s);
  if (h === 'Negate') return isLinearTerm(args(s)[0]);
  if (h && PRODUCT_HEADS.has(h)) {
    const withVar = args(s).filter(containsVariable);
    return withVar.length === 1 && isVariableSymbol(strip(withVar[0]));
  }
  if (h === 'Divide') {
    const [n, d] = args(s);
    return !containsVariable(d) && isLinearTerm(n);
  }
  return false;
}

function isLinear(e: MJ): boolean {
  const s = strip(e);
  const h = head(s);
  if (h && SUM_HEADS.has(h)) return args(s).every(isLinear);
  if (h === 'Negate') return isLinear(args(s)[0]);
  return isLinearTerm(s);
}

function gcd(a: number, b: number): number {
  a = Math.abs(a);
  b = Math.abs(b);
  while (b) [a, b] = [b, a % b];
  return a;
}

// ---------------------------------------------------------------------------
// Plain text -> LaTeX
// ---------------------------------------------------------------------------

const SUPERSCRIPTS: Record<string, string> = {
  '⁰': '0', '¹': '1', '²': '2', '³': '3', '⁴': '4', '⁵': '5', '⁶': '6', '⁷': '7', '⁸': '8', '⁹': '9', '⁻': '-', '⁺': '+',
};

function normaliseUnicode(s: string): string {
  return s
    .replace(/[−–—‐‑]/g, '-')
    .replace(/[×⋅·]/g, '\\cdot ')
    .replace(/÷/g, '/')
    .replace(/π/g, '\\pi ')
    .replace(/θ/g, '\\theta ')
    .replace(/≤/g, '\\le ')
    .replace(/≥/g, '\\ge ')
    .replace(/≠/g, '\\ne ')
    .replace(/±/g, '\\pm ')
    .replace(/∞/g, '\\infty ')
    .replace(/√/g, 'sqrt')
    .replace(/∈/g, '\\in ')
    .replace(/[   ]/g, ' ')
    .replace(/[⁰¹²³⁴⁵⁶⁷⁸⁹⁻⁺]+/g, (m) => '^{' + [...m].map((c) => SUPERSCRIPTS[c] ?? '').join('') + '}');
}

/**
 * Replace `<prefix>name( ... )` (with balanced brackets) by `wrap(inner)`.
 * `re` must end with `\(` and capture the preserved prefix in group 1.
 */
function replaceBracketed(s: string, re: RegExp, wrap: (inner: string) => string): string {
  let out = s;
  for (let guard = 0; guard < 50; guard++) {
    const m = re.exec(out);
    if (!m) break;
    const start = m.index + m[1].length;
    const open = m.index + m[0].length - 1;
    let depth = 0;
    let close = -1;
    for (let i = open; i < out.length; i++) {
      const c = out[i];
      if (c === '(') depth++;
      else if (c === ')') {
        depth--;
        if (depth === 0) {
          close = i;
          break;
        }
      }
    }
    if (close < 0) break; // unbalanced – leave it for the parser to report
    const inner = out.slice(open + 1, close);
    out = out.slice(0, start) + wrap(inner) + out.slice(close + 1);
  }
  return out;
}

const FUNCTION_NAMES =
  /(^|[^a-zA-Z\\])(arcsin|arccos|arctan|sinh|cosh|tanh|cosec|sin|cos|tan|sec|csc|cot|ln|log)/g;

/**
 * Convert plain typed maths (or lightly sanitise MathLive LaTeX) into LaTeX that
 * compute-engine parses reliably.
 */
export function toLatex(input: string): string {
  const looksLatex = /\\[a-zA-Z]/.test(input);
  let s = normaliseUnicode(input.trim());
  // A numeric fraction written before a function ("1/2 log n", "3/4 sin x") is a coefficient, not a denominator:
  // implicit multiplication would otherwise bind the function into the denominator.
  s = s.replace(/(^|[^\w/.])(\d+)\/(\d+)\s*(?=\\?(?:log|ln|sin|cos|tan|sqrt)\b)/g, '$1\\frac{$2}{$3}');

  // MathLive / editor artefacts
  s = s
    .replace(/\\mleft/g, '\\left')
    .replace(/\\mright/g, '\\right')
    .replace(/\\placeholder\{[^}]*\}/g, '')
    .replace(/\\[dt]frac/g, '\\frac')
    .replace(/\\(displaystyle|textstyle)\b/g, '')
    .replace(/\\operatorname\{([a-zA-Z]+)\}/g, '\\$1 ')
    .replace(/\\mathrm\{([a-zA-Z])\}/g, '$1')
    .replace(/\\exponentialE/g, 'e')
    .replace(/\\imaginaryI/g, 'i')
    .replace(/\\[,;!:]/g, ' ')
    .replace(/\\ /g, ' ')
    .replace(/\\q?quad/g, ' ');

  // ASCII operators
  s = s
    .replace(/\*\*/g, '^')
    .replace(/>=/g, '\\ge ')
    .replace(/<=/g, '\\le ')
    .replace(/(!=|=\/=|<>)/g, '\\ne ')
    .replace(/\+\/-/g, '\\pm ');

  if (!looksLatex) {
    s = s
      .replace(/\[/g, '(')
      .replace(/\]/g, ')')
      .replace(/(^|[^a-zA-Z\\])or(?![a-zA-Z])/g, '$1\\lor ')
      .replace(/(^|[^a-zA-Z\\])and(?![a-zA-Z])/g, '$1\\land ');
  }

  // Function calls with brackets
  s = replaceBracketed(s, /(^|[^a-zA-Z\\])sqrt\s*\(/, (inner) => `\\sqrt{${inner}}`);
  s = replaceBracketed(s, /(^|[^a-zA-Z\\])cbrt\s*\(/, (inner) => `\\sqrt[3]{${inner}}`);
  s = replaceBracketed(s, /(^|[^a-zA-Z\\])abs\s*\(/, (inner) => `\\left|${inner}\\right|`);
  s = replaceBracketed(s, /(^|[^a-zA-Z\\])exp\s*\(/, (inner) => `e^{${inner}}`);
  // sqrt without brackets: sqrt2, sqrt x
  s = s.replace(/(^|[^a-zA-Z\\])sqrt\s*(\d+(?:\.\d+)?|[a-zA-Z])/g, '$1\\sqrt{$2}');
  s = s.replace(/(^|[^a-zA-Z\\])pi(?![a-zA-Z])/g, '$1\\pi ');
  s = s.replace(/(^|[^a-zA-Z\\])inf(?:inity)?(?![a-zA-Z])/g, '$1\\infty ');
  s = s.replace(FUNCTION_NAMES, '$1\\$2 ');

  // Exponents: ^(…) -> ^{…}, ^12 -> ^{12}, ^-1 -> ^{-1}
  s = replaceBracketed(s, /(\^\s*)\(/, (inner) => `{${inner}}`);
  s = s.replace(/\^\s*(-?\d+(?:\.\d+)?)/g, '^{$1}').replace(/\^\s*(-[a-zA-Z])/g, '^{$1}');

  s = s.replace(/\*/g, '\\cdot ');
  return s.replace(/\s+/g, ' ').trim();
}

// ---------------------------------------------------------------------------
// Parsing
// ---------------------------------------------------------------------------

interface Parsed {
  latex: string;
  /** Canonical form – used for equivalence. */
  expr: BoxedExpression;
  /** Non-canonical form – keeps brackets, fractions and order for form checks. */
  raw: BoxedExpression;
}

type ParseResult = { ok: true; value: Parsed } | { ok: false; latex: string; error: string };

function unquote(s: unknown): string {
  return String(s).replace(/^'|'$/g, '');
}

function describeErrors(expr: BoxedExpression): string {
  const messages = new Set<string>();
  for (const err of expr.errors) {
    const j = err.json as unknown as MJ;
    const a = args(j);
    const code = unquote(a[0]).replace(/-/g, ' ');
    const where = a[1];
    const payload = head(where) === 'LatexString' ? unquote(args(where)[0]) : undefined;
    messages.add(payload ? `${code} near "${payload}"` : code);
  }
  return messages.size ? [...messages].join('; ') : 'could not be parsed';
}

function parseFull(input: string): ParseResult {
  const latex = toLatex(input ?? '');
  if (!latex) return { ok: false, latex, error: 'empty answer' };
  const ce = getEngine();
  try {
    const expr = ce.parse(latex);
    if (!expr.isValid) return { ok: false, latex, error: describeErrors(expr) };
    if (expr.json === 'Nothing') return { ok: false, latex, error: 'empty answer' };
    // 'raw' is the typed spelling of the legacy `{ canonical: false }` option in
    // compute-engine ≥ 0.120 – it keeps Delimiter / InvisibleOperator / Subtract
    // nodes, which the form checks rely on.
    const raw = ce.parse(latex, { form: 'raw' });
    return { ok: true, value: { latex, expr, raw } };
  } catch (e) {
    return { ok: false, latex, error: e instanceof Error ? e.message : 'could not be parsed' };
  }
}

/**
 * Parse LaTeX (from MathLive) or plain typed maths into a compute-engine expression.
 */
export function parseStudentExpression(input: string): ParsedStudentExpression {
  const r = parseFull(input);
  if (r.ok) return { latex: r.value.latex, expr: r.value.expr };
  return { latex: r.latex, expr: null, error: r.error };
}

// ---------------------------------------------------------------------------
// Numeric evaluation & sampling
// ---------------------------------------------------------------------------

type Point = Record<string, number>;

interface Ctx {
  vars: string[];
  domain: Record<string, [number, number]>;
  seed: number;
}

const DEFAULT_RANGE: [number, number] = [-5, 5];
const SAMPLE_POINTS = 12;
const MAX_ATTEMPTS = 240;
const REL_TOL = 1e-6;

function hashString(s: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Real value of `e` at `pt`, or undefined if non-finite / complex / symbolic. */
function evalAt(e: BoxedExpression, pt: Point): number | undefined {
  try {
    const r = Object.keys(pt).length ? e.subs(pt).N() : e.N();
    const re: unknown = r.re;
    const im: unknown = r.im;
    if (typeof re !== 'number' || !Number.isFinite(re)) return undefined;
    if (typeof im === 'number' && Number.isFinite(im) && Math.abs(im) > 1e-9 * (1 + Math.abs(re))) return undefined;
    if (typeof im === 'number' && !Number.isFinite(im)) return undefined;
    return re;
  } catch {
    return undefined;
  }
}

function close(a: number, b: number): boolean {
  return Math.abs(a - b) <= REL_TOL * (1 + Math.abs(b));
}

function randomPoint(ctx: Ctx, rnd: () => number): Point {
  const pt: Point = {};
  for (const v of ctx.vars) {
    const [lo, hi] = ctx.domain[v] ?? DEFAULT_RANGE;
    pt[v] = lo + (0.02 + 0.96 * rnd()) * (hi - lo);
  }
  return pt;
}

interface SampleResult {
  status: 'equal' | 'different' | 'undecided';
  sampled: number;
  mismatchAt?: Point;
  values?: [number, number];
}

/** Sample `a` and `b`; equal when they agree at every point where both are defined. */
function sampleEqual(a: BoxedExpression, b: BoxedExpression, ctx: Ctx): SampleResult {
  const rnd = mulberry32(ctx.seed);
  const target = ctx.vars.length ? SAMPLE_POINTS : 1;
  let sampled = 0;
  for (let attempt = 0; attempt < MAX_ATTEMPTS && sampled < target; attempt++) {
    const pt = randomPoint(ctx, rnd);
    const av = evalAt(a, pt);
    const bv = evalAt(b, pt);
    if (av === undefined || bv === undefined) {
      if (!ctx.vars.length) break;
      continue; // either side undefined here – skip the point
    }
    sampled++;
    if (!close(av, bv)) return { status: 'different', sampled, mismatchAt: pt, values: [av, bv] };
  }
  const minimum = ctx.vars.length ? 4 : 1;
  return { status: sampled >= minimum ? 'equal' : 'undecided', sampled };
}

/**
 * Sample `fa` and `fb`; equal when fa = k * fb for one non-zero constant k
 * (k > 0 when `positiveOnly`). Used for equations and inequalities.
 */
function sampleProportional(fa: BoxedExpression, fb: BoxedExpression, ctx: Ctx, positiveOnly: boolean): SampleResult {
  const rnd = mulberry32(ctx.seed);
  const target = ctx.vars.length ? SAMPLE_POINTS : 1;
  let sampled = 0;
  let k: number | undefined;
  for (let attempt = 0; attempt < MAX_ATTEMPTS && sampled < target; attempt++) {
    const pt = randomPoint(ctx, rnd);
    const av = evalAt(fa, pt);
    const bv = evalAt(fb, pt);
    if (av === undefined || bv === undefined) {
      if (!ctx.vars.length) break;
      continue;
    }
    sampled++;
    const aZero = Math.abs(av) <= 1e-9;
    const bZero = Math.abs(bv) <= 1e-9;
    if (aZero && bZero) continue;
    if (aZero !== bZero) return { status: 'different', sampled, mismatchAt: pt, values: [av, bv] };
    const ratio = av / bv;
    if (k === undefined) {
      k = ratio;
      if (positiveOnly && k < 0) return { status: 'different', sampled, mismatchAt: pt, values: [av, bv] };
    } else if (!close(ratio, k)) {
      return { status: 'different', sampled, mismatchAt: pt, values: [av, bv] };
    }
  }
  const minimum = ctx.vars.length ? 4 : 1;
  return { status: sampled >= minimum ? 'equal' : 'undecided', sampled };
}

/**
 * Is the equation `eq` satisfied whenever `subj.sym` takes the value `subj.other` gives it, and linear in
 * that symbol, so that value is its only solution? Sampled over the other variables. This is how
 * x(8 - w) = 12 + 3w is recognised as the same relationship as x = (12 + 3w)/(8 - w): the two differ by the
 * factor (8 - w), which no constant-factor test can see.
 */
function sampleSolves(eq: BoxedExpression, subj: { sym: string; other: BoxedExpression }, ctx: Ctx): SampleResult {
  if (!isFunction(eq) || eq.operator !== 'Equal' || eq.ops.length !== 2) return { status: 'undecided', sampled: 0 };
  const [lhs, rhs] = eq.ops;
  const others = ctx.vars.filter((v) => v !== subj.sym);
  const rnd = mulberry32(ctx.seed);
  const target = others.length ? SAMPLE_POINTS : 1;
  let sampled = 0;
  for (let attempt = 0; attempt < MAX_ATTEMPTS && sampled < target; attempt++) {
    const pt = randomPoint(ctx, rnd);
    const value = evalAt(subj.other, pt);
    if (value === undefined) {
      if (!others.length) break;
      continue;
    }
    // The difference of the two sides with the symbol set to s; undefined when either side is.
    const gap = (s: number): number | undefined => {
      const p = { ...pt, [subj.sym]: s };
      const l = evalAt(lhs, p);
      const r = evalAt(rhs, p);
      return l === undefined || r === undefined ? undefined : l - r;
    };
    const scale = (s: number): number => {
      const p = { ...pt, [subj.sym]: s };
      return 1 + Math.abs(evalAt(lhs, p) ?? 0) + Math.abs(evalAt(rhs, p) ?? 0);
    };
    const g0 = gap(value);
    if (g0 === undefined) {
      if (!others.length) break;
      continue;
    }
    sampled++;
    if (Math.abs(g0) > REL_TOL * scale(value)) return { status: 'different', sampled, mismatchAt: pt };
    // Linear in the symbol: the gap grows at a constant, non-zero rate away from the solution.
    const step = 1 + Math.abs(value);
    const g1 = gap(value + step);
    const g2 = gap(value + 2 * step);
    if (g1 === undefined || g2 === undefined) continue;
    if (Math.abs(g1) <= REL_TOL * scale(value + step)) return { status: 'different', sampled, mismatchAt: pt };
    if (!close(g2, 2 * g1)) return { status: 'different', sampled, mismatchAt: pt };
  }
  const minimum = others.length ? 4 : 1;
  return { status: sampled >= minimum ? 'equal' : 'undecided', sampled };
}

// ---------------------------------------------------------------------------
// Equivalence
// ---------------------------------------------------------------------------

type RelationKind = 'eq' | 'ne' | 'lt' | 'le';

interface Relation {
  kind: RelationKind;
  /** The relation is `f (kind) 0`. */
  f: BoxedExpression;
}

function boxJson(j: MJ): BoxedExpression {
  return getEngine().box(j as Parameters<ComputeEngine['box']>[0]);
}

function asRelation(e: BoxedExpression): Relation | null {
  // `ops` only exists on function expressions in compute-engine ≥ 0.120, so
  // narrow with the library's own type guard before touching it.
  if (!isFunction(e)) return null;
  const op = e.operator;
  if (!RELATION_HEADS.has(op) || e.ops.length !== 2) return null;
  const [a, b] = e.ops;
  const diff = (x: BoxedExpression, y: BoxedExpression) => boxJson(['Subtract', x.json as unknown as MJ, y.json as unknown as MJ]);
  switch (op) {
    case 'Equal':
      return { kind: 'eq', f: diff(a, b) };
    case 'NotEqual':
      return { kind: 'ne', f: diff(a, b) };
    case 'Less':
      return { kind: 'lt', f: diff(a, b) };
    case 'LessEqual':
      return { kind: 'le', f: diff(a, b) };
    case 'Greater':
      return { kind: 'lt', f: diff(b, a) };
    case 'GreaterEqual':
      return { kind: 'le', f: diff(b, a) };
    default:
      return null;
  }
}

/** `y = expr` -> { sym: 'y', other: expr } (either way round). */
function subjectOf(e: BoxedExpression): { sym: string; other: BoxedExpression } | null {
  if (!isFunction(e) || e.operator !== 'Equal' || e.ops.length !== 2) return null;
  const [a, b] = e.ops;
  // `sym()` returns the symbol name of a symbol expression, else undefined.
  const sa = sym(a);
  const sb = sym(b);
  if (sa && !CONSTANT_SYMBOLS.has(sa)) return { sym: sa, other: b };
  if (sb && !CONSTANT_SYMBOLS.has(sb)) return { sym: sb, other: a };
  return null;
}

interface EqResult {
  status: 'identical' | 'equivalent' | 'different' | 'undecided';
  sampled?: number;
  mismatchAt?: Point;
  values?: [number, number];
  /** True when one side was an equation `y = …` and only its right-hand side was compared. */
  unwrapped?: boolean;
}

function fromSample(s: SampleResult): EqResult {
  if (s.status === 'equal') return { status: 'equivalent', sampled: s.sampled };
  if (s.status === 'different') return { status: 'different', sampled: s.sampled, mismatchAt: s.mismatchAt, values: s.values };
  return { status: 'undecided', sampled: s.sampled };
}

function symbolicallyEqual(a: BoxedExpression, b: BoxedExpression): boolean {
  try {
    if (a.isEqual(b) === true) return true;
  } catch {
    /* ignore */
  }
  try {
    const diff = boxJson(['Subtract', a.json as unknown as MJ, b.json as unknown as MJ]).simplify();
    if (diff.isSame(0)) return true;
  } catch {
    /* ignore */
  }
  return false;
}

function compareExpressions(student: BoxedExpression, spec: BoxedExpression, ctx: Ctx): EqResult {
  if (student.isSame(spec)) return { status: 'identical' };

  const rs = asRelation(student);
  const rp = asRelation(spec);

  if (rs && rp) {
    if (rs.kind !== rp.kind) return { status: 'different' };
    if (rs.f.isSame(rp.f)) return { status: 'identical' };
    const prop = sampleProportional(rs.f, rp.f, ctx, rs.kind === 'lt' || rs.kind === 'le');
    if (prop.status !== 'different' || rs.kind !== 'eq') return fromSample(prop);
    // Equations that differ by a variable factor, x(8 - w) = 12 + 3w against x = (12 + 3w)/(8 - w), have the
    // same solutions when one of them is a formula for a symbol and the other is linear in that symbol and
    // satisfied by the formula. Reported as equivalent (not unwrapped), so a required form can still ask for
    // the symbol to be made the subject.
    const bySubject = (formula: BoxedExpression, other: BoxedExpression): SampleResult | undefined => {
      const subj = subjectOf(formula);
      return subj ? sampleSolves(other, subj, ctx) : undefined;
    };
    const solved = bySubject(spec, student) ?? bySubject(student, spec);
    if (solved?.status === 'equal') return { status: 'equivalent', sampled: solved.sampled };
    return fromSample(prop);
  }
  if (rp && !rs) {
    const subj = subjectOf(spec);
    if (!subj) return { status: 'different' };
    const inner = compareExpressions(student, subj.other, ctx);
    return { ...inner, status: inner.status === 'identical' ? 'equivalent' : inner.status, unwrapped: true };
  }
  if (rs && !rp) {
    const subj = subjectOf(student);
    if (!subj) return { status: 'different' };
    const inner = compareExpressions(subj.other, spec, ctx);
    return { ...inner, status: inner.status === 'identical' ? 'equivalent' : inner.status, unwrapped: true };
  }

  if (SET_HEADS.has(student.operator) || SET_HEADS.has(spec.operator)) return { status: 'different' };

  if (symbolicallyEqual(student, spec)) return { status: 'equivalent' };
  return fromSample(sampleEqual(student, spec, ctx));
}

function buildCtx(spec: AlgebraSpec, exprs: BoxedExpression[], seedText: string): Ctx {
  const vars = new Set<string>(spec.variables ?? []);
  for (const e of exprs) {
    try {
      for (const u of e.unknowns) vars.add(u);
    } catch {
      /* ignore */
    }
  }
  return { vars: [...vars].sort(), domain: spec.domain ?? {}, seed: hashString(seedText) };
}

// ---------------------------------------------------------------------------
// Sign-error detection
// ---------------------------------------------------------------------------

/**
 * Variants of the spec with a single sign flipped: the whole expression, one
 * side of a relation, or one term of any sum.
 */
function signVariants(j: MJ): MJ[] {
  const out: MJ[] = [];
  const h0 = head(j);
  if (h0 && RELATION_HEADS.has(h0) && args(j).length === 2) {
    // For `x = 4y/(5-v)` the classic slip is `x = 4y/(v-5)`: one side negated.
    const [l, r] = args(j);
    out.push([h0, l, ['Negate', r]], [h0, ['Negate', l], r]);
  } else {
    out.push(['Negate', j]);
  }
  const rec = (node: MJ, replace: (n: MJ) => MJ): void => {
    if (!Array.isArray(node) || out.length >= 24) return;
    const h = head(node);
    if (!h) return;
    const a = args(node);
    if (h === 'Add' || h === 'Subtract') {
      a.forEach((t, i) => {
        const v = [...a];
        v[i] = ['Negate', t];
        out.push(replace([h, ...v]));
      });
    }
    a.forEach((child, i) =>
      rec(child, (n) => {
        const v = [...a];
        v[i] = n;
        return replace([h, ...v]);
      }),
    );
  };
  rec(j, (n) => n);
  return out.slice(0, 24);
}

function isSignError(student: BoxedExpression, spec: BoxedExpression, ctx: Ctx): boolean {
  for (const variant of signVariants(spec.json as unknown as MJ)) {
    try {
      const v = boxJson(variant);
      const r = compareExpressions(student, v, ctx);
      if (r.status === 'identical' || r.status === 'equivalent') return true;
    } catch {
      /* ignore malformed variant */
    }
  }
  return false;
}

// ---------------------------------------------------------------------------
// Form checks (on the non-canonical parse)
// ---------------------------------------------------------------------------

type FormResult = { ok: true } | { ok: false; reason: AlgebraReason; feedback: string };

const FORM_NAMES: Record<AlgebraForm, string> = {
  factorised: 'factorised form',
  expanded: 'expanded form',
  'simplest-fraction': 'a fraction in its simplest form',
  'completed-square': 'completed-square form a(x + p)² + q',
  'y=mx+c': 'the form y = mx + c',
  'surd-rationalised': 'a surd with a rationalised denominator',
  'single-fraction': 'a single fraction',
  'single-log': 'a single logarithm',
  'single-log-expanded': 'a single logarithm with its argument multiplied out',
  'expanded-logs': 'separate logarithms with no product, quotient or power inside',
  'integer-coefficients': 'a form with integer coefficients',
  subject: 'a formula with the subject on its own',
};

function fail(reason: AlgebraReason, feedback: string): FormResult {
  return { ok: false, reason, feedback };
}

function countNonConstantFactors(canonical: MJ): number {
  const s = stripNegate(canonical);
  const h = head(s);
  if (!containsVariable(s)) return 0;
  // Explicit <number>: without it TS picks the `(acc: MJ, cur: MJ) => MJ` overload because 0 is an MJ.
  if (h === 'Multiply') return args(s).reduce<number>((n, f) => n + countNonConstantFactors(f), 0);
  if (h === 'Power') {
    const [base, exp] = args(s);
    const n = numberValue(exp);
    if (n !== null && Number.isInteger(n) && n >= 1 && containsVariable(base)) return n;
  }
  return 1;
}

function factorCount(e: BoxedExpression): number {
  try {
    const factored = getEngine().box(['Factor', e]).evaluate();
    return countNonConstantFactors(factored.json as unknown as MJ);
  } catch {
    return countNonConstantFactors(e.json as unknown as MJ);
  }
}

function checkFactorised(student: Parsed, spec: Parsed): FormResult {
  let e = stripNegate(unwrapEquation(student.raw.json as unknown as MJ));
  if (head(e) === 'Divide') {
    const [n, d] = args(e);
    if (containsVariable(d)) return fail('equivalent-wrong-form', 'That is equivalent, but the question asks for a factorised expression, not a fraction.');
    e = stripNegate(n);
  }
  const h = head(e);
  if (h && SUM_HEADS.has(h)) {
    return fail(
      'expanded-not-factorised',
      'That expands correctly, but the question asks for a factorised answer – write it as a product of brackets.',
    );
  }
  const factors = flattenProduct(e);
  const nonConstant = factors.filter(containsVariable);
  if (nonConstant.length === 0) return fail('equivalent-wrong-form', 'The answer should be a factorised expression.');

  for (const f of nonConstant) {
    const fh = head(f);
    if (fh && SUM_HEADS.has(fh) && factorCount(boxJson(f)) > 1) {
      return fail('not-simplified', 'Good start, but one of your brackets can be factorised further – factorise fully.');
    }
  }

  // A numerical common factor left inside a bracket, e.g. (2x+4)(x+3) for
  // 2(x+2)(x+3) – unless the marking scheme itself writes it that way.
  const content = (f: MJ): number => integerContent(boxJson(f).json as unknown as MJ) ?? 1;
  const specFactors = flattenProduct(stripNegate(unwrapEquation(spec.raw.json as unknown as MJ))).filter(containsVariable);
  if (!specFactors.some((f) => content(f) > 1)) {
    for (const f of nonConstant) {
      if (content(f) > 1) {
        return fail('not-simplified', 'Nearly there – one of your brackets still has a common factor inside it; take it out to factorise fully.');
      }
    }
  }

  const specCount = countNonConstantFactors(unwrapEquation(spec.expr.json as unknown as MJ));
  if (nonConstant.length < specCount) {
    return fail('not-simplified', 'That is equivalent, but it is not fully factorised – keep going.');
  }
  if (factors.length < 2) return fail('equivalent-wrong-form', 'The answer should be written as a product of factors.');
  return { ok: true };
}

function checkExpanded(student: Parsed, spec: Parsed): FormResult {
  const e = unwrapEquation(student.raw.json as unknown as MJ);
  if (!sumsOnlyAtTop(e)) {
    return fail('equivalent-wrong-form', 'That is equivalent, but the question asks for the expanded form – multiply out the brackets and collect like terms.');
  }
  const terms = flattenSum(e).length;
  const specJson = unwrapEquation(spec.expr.json as unknown as MJ);
  const specTerms = head(specJson) === 'Add' ? args(specJson).length : 1;
  if (terms > specTerms) return fail('not-simplified', 'Almost there – collect the like terms to finish simplifying.');
  return { ok: true };
}

function nonConstantFactorsOf(e: BoxedExpression): BoxedExpression[] {
  const ce = getEngine();
  let factored: BoxedExpression;
  try {
    factored = ce.box(['Factor', e]).evaluate();
  } catch {
    factored = e;
  }
  const out: BoxedExpression[] = [];
  const collect = (j: MJ): void => {
    const s = stripNegate(j);
    if (!containsVariable(s)) return;
    const h = head(s);
    if (h === 'Multiply') args(s).forEach(collect);
    else if (h === 'Power' && containsVariable(args(s)[0])) collect(args(s)[0]);
    else out.push(boxJson(s));
  };
  collect(factored.json as unknown as MJ);
  return out;
}

/** gcd of the integer coefficients of a canonical polynomial (null if any coefficient is not an integer). */
function integerContent(j: MJ): number | null {
  const s = stripNegate(j);
  const h = head(s);
  const terms = h === 'Add' ? args(s) : [s];
  let g = 0;
  for (const t of terms) {
    const ts = stripNegate(t);
    let coef: number | null = 1;
    if (!containsVariable(ts)) coef = numberValue(ts);
    else if (head(ts) === 'Multiply') {
      const nums = args(ts).filter((x) => !containsVariable(x));
      coef = nums.length ? nums.reduce<number | null>((acc, x) => (acc === null ? null : ((v) => (v === null ? null : acc * v))(numberValue(x))), 1) : 1;
    }
    if (coef === null || !Number.isInteger(coef)) return null;
    g = gcd(g, coef);
  }
  return g;
}

function shareCommonFactor(num: BoxedExpression, den: BoxedExpression, ctx: Ctx): boolean {
  const nj = num.json as unknown as MJ;
  const dj = den.json as unknown as MJ;
  const numeric = !containsVariable(nj) && !containsVariable(dj);

  if (numeric) {
    const n = evalAt(num, {});
    const d = evalAt(den, {});
    if (n !== undefined && d !== undefined && Number.isInteger(n) && Number.isInteger(d)) return gcd(n, d) > 1;
    return false;
  }

  const cn = integerContent(nj);
  const cd = integerContent(dj);
  if (cn !== null && cd !== null && gcd(cn, cd) > 1) return true;

  const nf = nonConstantFactorsOf(num);
  const df = nonConstantFactorsOf(den);
  for (const a of nf) {
    for (const b of df) {
      if (a.isSame(b)) return true;
      try {
        if (a.isSame(boxJson(['Negate', b.json as unknown as MJ]))) return true;
      } catch {
        /* ignore */
      }
      const r = sampleEqual(a, b, ctx);
      if (r.status === 'equal') return true;
    }
  }
  return false;
}

function checkSimplestFraction(student: Parsed, ctx: Ctx): FormResult {
  const whole = unwrapEquation(student.raw.json as unknown as MJ);
  const e = stripNegate(whole);
  if (head(e) !== 'Divide') {
    if (hasHead(whole, new Set(['Divide']))) return fail('not-simplified', 'That is equivalent, but write it as a single fraction in its simplest form.');
    return { ok: true };
  }
  const [n, d] = args(e);
  if (hasHead(n, new Set(['Divide'])) || hasHead(d, new Set(['Divide']))) {
    return fail('not-simplified', 'That is equivalent, but there is a fraction inside your fraction – simplify to a single fraction.');
  }
  if (shareCommonFactor(boxJson(n), boxJson(d), ctx)) {
    return fail('not-simplified', 'Right value, but the fraction is not in its simplest form – the numerator and denominator share a common factor. Cancel it.');
  }
  return { ok: true };
}

function checkCompletedSquare(student: Parsed): FormResult {
  const e = unwrapEquation(student.raw.json as unknown as MJ);
  const terms = flattenSum(e);
  let squares = 0;
  let consts = 0;
  let other = 0;
  const isSquarePower = (t: MJ): boolean => {
    const s = strip(t);
    if (head(s) !== 'Power') return false;
    const [base, exp] = args(s);
    return numberValue(exp) === 2 && containsVariable(base) && isLinear(base);
  };
  const isSquareTerm = (t: MJ): boolean => {
    const s = stripNegate(t);
    const h = head(s);
    if (h && PRODUCT_HEADS.has(h)) {
      const withVar = args(s).filter(containsVariable);
      return withVar.length === 1 && isSquarePower(withVar[0]);
    }
    if (h === 'Divide') {
      const [num, den] = args(s);
      return !containsVariable(den) && isSquareTerm(num);
    }
    return isSquarePower(s);
  };
  for (const t of terms) {
    const s = stripNegate(t);
    if (!containsVariable(s)) consts++;
    else if (isSquareTerm(s)) squares++;
    else other++;
  }
  if (squares === 1 && other === 0 && consts <= 1) return { ok: true };
  if (squares === 1 && other === 0) return fail('not-simplified', 'Nearly there – combine the constant terms so it reads a(x + p)² + q.');
  return fail('equivalent-wrong-form', 'That is equivalent, but it is not in completed-square form – write it as a(x + p)² + q.');
}

function checkYmxc(student: Parsed, spec: Parsed, unwrapped: boolean): FormResult {
  const wrong = (msg: string) => fail('equivalent-wrong-form', msg);
  const raw = strip(student.raw.json as unknown as MJ);
  const specSubject = subjectOf(spec.expr)?.sym ?? 'y';
  if (unwrapped || head(raw) !== 'Equal') return wrong(`Correct relationship, but write it as an equation in the form ${specSubject} = mx + c.`);
  const [lhs, rhs] = args(raw);
  if (strip(lhs) !== specSubject) return wrong(`Correct relationship, but ${specSubject} should be on its own on the left-hand side: ${specSubject} = mx + c.`);
  if (containsSymbol(rhs, specSubject)) return wrong(`Correct relationship, but ${specSubject} must appear only on the left-hand side.`);
  if (!sumsOnlyAtTop(rhs)) return wrong('Correct relationship, but expand the brackets and write it as y = mx + c.');

  let badDivide = false;
  walk(rhs, (node) => {
    if (head(node) === 'Divide' && containsVariable(args(node)[1])) badDivide = true;
  });
  if (badDivide) return wrong('Correct relationship, but m and c must be numbers – rearrange to y = mx + c.');

  const rhsExpr = boxJson(rhs);
  const vars = [...rhsExpr.unknowns];
  if (vars.length > 1) return wrong('Correct relationship, but the right-hand side should involve x only.');
  const v = vars[0] ?? 'x';
  const f = [0, 1, 2].map((x) => evalAt(rhsExpr, { [v]: x }));
  if (f.some((y) => y === undefined) || !close(f[0]! + f[2]!, 2 * f[1]!)) {
    return wrong('Correct relationship, but the right-hand side should be linear: y = mx + c with m and c numbers.');
  }
  if (flattenSum(strip(rhs)).length > 2) return fail('not-simplified', 'Correct, but collect the terms so it reads y = mx + c.');
  return { ok: true };
}

const LOG_HEADS = new Set(['Log', 'Ln', 'Lb', 'Lg']);

function logNodes(e: MJ): MJ[] {
  const out: MJ[] = [];
  walk(e, (node) => {
    if (LOG_HEADS.has(head(node) ?? '')) out.push(node);
  });
  return out;
}

/** The expression a form check reads: the right-hand side of "y = …", and any sign in front set aside. */
function formBody(student: Parsed): MJ {
  const raw = strip(student.raw.json as unknown as MJ);
  const body = head(raw) === 'Equal' ? strip(args(raw)[1]) : raw;
  return stripNegate(body);
}

/** "Express as a single logarithm": one log, and the log is the whole answer (a coefficient belongs inside as a power). */
function checkSingleLog(student: Parsed): FormResult {
  const wrong = (msg: string) => fail('equivalent-wrong-form', msg);
  const body = formBody(student);
  const logs = logNodes(body);
  if (logs.length === 0) return wrong('Correct value, but the question asks for it as a single logarithm.');
  if (logs.length > 1) return wrong('Correct, but the logarithms still need combining into one: use the log laws.');
  // A number added to the log ("2 + log x", the question typed back) is not a number in front of it: it has to become
  // a logarithm itself (2 = log 100) before the product law can combine the two (engine item 2, laws-of-logarithms q0006).
  const top = head(body);
  if (top === 'Add' || top === 'Subtract') {
    return wrong('Correct, but a number added to the log (or taken from it) has to be written as a logarithm itself first; then the two combine into one.');
  }
  if (!LOG_HEADS.has(top ?? '')) return wrong('Correct, but a number in front of the log belongs inside it as a power: write it as one logarithm.');
  return { ok: true };
}

/** "Express as a single logarithm" where the argument must be multiplied out: log 8x^3, not log (2x)^3 or log 2^3 x^3. */
function checkSingleLogExpanded(student: Parsed): FormResult {
  const single = checkSingleLog(student);
  if (!single.ok) return single;
  const body = formBody(student);
  let bracketPower = false;
  let numericPower = false;
  walk(args(body)[0] ?? 0, (node) => {
    if (head(node) !== 'Power') return;
    const base = stripNegate(args(node)[0] ?? 0);
    const b = head(base);
    if (b === 'Multiply' || b === 'InvisibleOperator' || b === 'Divide' || b === 'Add' || b === 'Subtract') bracketPower = true;
    if (typeof base === 'number') numericPower = true;
  });
  if (bracketPower || numericPower) return fail('equivalent-wrong-form', 'Correct, but multiply the argument out: a power of a bracket or of a number should not be left inside the logarithm.');
  return { ok: true };
}

/** "Write in terms of log a and log b": nothing multiplied, divided or raised to a power inside any log. */
function checkExpandedLogs(student: Parsed): FormResult {
  const wrong = (msg: string) => fail('equivalent-wrong-form', msg);
  const body = formBody(student);
  const logs = logNodes(body);
  if (logs.length === 0) return wrong('Correct value, but the question asks for it in terms of separate logarithms.');
  for (const l of logs) {
    const inner = head(stripNegate(args(l)[0] ?? 0));
    // The non-canonical parse keeps juxtaposition as InvisibleOperator ("log ab"), so it counts as a product too.
    if (inner === 'Multiply' || inner === 'InvisibleOperator' || inner === 'Divide' || inner === 'Power' || inner === 'Sqrt' || inner === 'Root' || inner === 'Square') {
      return wrong('Correct, but expand it: no product, quotient or power should be left inside a logarithm.');
    }
  }
  return { ok: true };
}

function checkSurdRationalised(student: Parsed): FormResult {
  const raw = student.raw.json as unknown as MJ;
  const surdHeads = new Set(['Sqrt', 'Root']);
  let surdInDenominator = false;
  let unsimplifiedSurd = false;
  walk(raw, (node) => {
    const h = head(node);
    if (h === 'Divide') {
      const den = args(node)[1];
      if (hasHead(den, surdHeads)) surdInDenominator = true;
      walk(den, (n) => {
        if (head(n) === 'Power') {
          const ex = numberValue(args(n)[1]);
          if ((ex !== null && !Number.isInteger(ex)) || hasHead(args(n)[1], new Set(['Divide', 'Rational']))) surdInDenominator = true;
        }
      });
    }
    if (h === 'Sqrt') {
      const v = numberValue(args(node)[0]);
      if (v !== null && Number.isInteger(v) && v > 1) {
        for (let k = 2; k * k <= v; k++) if (v % (k * k) === 0) unsimplifiedSurd = true;
      }
    }
  });
  if (surdInDenominator) return fail('not-simplified', 'Right value, but there is still a surd in the denominator – rationalise it.');
  if (unsimplifiedSurd) return fail('not-simplified', 'Right value, but the surd can be simplified further – look for a square factor.');

  const top = stripNegate(unwrapEquation(raw));
  if (head(top) === 'Divide') {
    const [n, d] = args(top);
    if (!containsVariable(n) && !containsVariable(d)) {
      const intPart = (x: MJ): number | null => {
        const s = stripNegate(x);
        if (isIntegerLiteral(s)) return numberValue(s);
        const h = head(s);
        if (h && PRODUCT_HEADS.has(h)) {
          const ints = args(s).filter(isIntegerLiteral).map((i) => numberValue(i)!);
          return ints.length ? ints.reduce((p, q) => p * q, 1) : 1;
        }
        return null;
      };
      const a = intPart(n);
      const b = intPart(d);
      if (a !== null && b !== null && gcd(a, b) > 1) {
        return fail('not-simplified', 'Right value, but the fraction can be simplified – cancel the common factor.');
      }
    }
  }
  return { ok: true };
}

function checkSingleFraction(student: Parsed): FormResult {
  const whole = unwrapEquation(student.raw.json as unknown as MJ);
  const e = stripNegate(whole);
  if (head(e) !== 'Divide') return fail('equivalent-wrong-form', 'That is equivalent, but write it as a single fraction.');
  const [n, d] = args(e);
  if (hasHead(n, new Set(['Divide'])) || hasHead(d, new Set(['Divide']))) {
    return fail('equivalent-wrong-form', 'That is equivalent, but there should be no fractions inside your fraction – write it as a single fraction.');
  }
  return { ok: true };
}

function checkIntegerCoefficients(student: Parsed): FormResult {
  const raw = student.raw.json as unknown as MJ;
  let bad = false;
  walk(raw, (node) => {
    const h = head(node);
    if (h === 'Divide' || h === 'Rational') bad = true;
    const v = numberValue(node);
    if (!Array.isArray(node) && v !== null && !Number.isInteger(v)) bad = true;
  });
  if (bad) return fail('equivalent-wrong-form', 'Correct, but the question asks for integer coefficients – multiply through to clear the fractions or decimals.');
  return { ok: true };
}

/**
 * 'subject' (changing the subject): once the relationship is right, the subject named by the spec's
 * left-hand side must stand alone on one side of the student's equation and not appear on the other.
 * So for the spec `x = w/4`, `4x = w` and `w/4` are the right relationship in the wrong form.
 */
function checkSubject(student: Parsed, spec: Parsed, unwrapped: boolean): FormResult {
  const wrong = (msg: string) => fail('equivalent-wrong-form', msg);
  const specSubject = subjectOf(spec.expr)?.sym;
  if (!specSubject) return { ok: true };
  const raw = strip(student.raw.json as unknown as MJ);
  if (unwrapped || head(raw) !== 'Equal') {
    return wrong(`Correct relationship, but write it as a formula with ${specSubject} as the subject: ${specSubject} = ….`);
  }
  const [lhs, rhs] = args(raw);
  const lhsIsSubject = strip(lhs) === specSubject;
  const rhsIsSubject = strip(rhs) === specSubject;
  if (!lhsIsSubject && !rhsIsSubject) {
    return wrong(`Correct relationship, but ${specSubject} is not the subject yet – it should be on its own on one side: ${specSubject} = ….`);
  }
  const other = lhsIsSubject ? rhs : lhs;
  if (containsSymbol(other, specSubject)) {
    return wrong(`Correct relationship, but ${specSubject} must appear on one side only – it is still on the other side too.`);
  }
  return { ok: true };
}

function checkForm(form: AlgebraForm, student: Parsed, spec: Parsed, ctx: Ctx, unwrapped: boolean): FormResult {
  switch (form) {
    case 'subject':
      return checkSubject(student, spec, unwrapped);
    case 'factorised':
      return checkFactorised(student, spec);
    case 'expanded':
      return checkExpanded(student, spec);
    case 'simplest-fraction':
      return checkSimplestFraction(student, ctx);
    case 'completed-square':
      return checkCompletedSquare(student);
    case 'y=mx+c':
      return checkYmxc(student, spec, unwrapped);
    case 'surd-rationalised':
      return checkSurdRationalised(student);
    case 'single-fraction':
      return checkSingleFraction(student);
    case 'single-log':
      return checkSingleLog(student);
    case 'single-log-expanded':
      return checkSingleLogExpanded(student);
    case 'expanded-logs':
      return checkExpandedLogs(student);
    case 'integer-coefficients':
      return checkIntegerCoefficients(student);
    default:
      return { ok: true };
  }
}

// ---------------------------------------------------------------------------
// Feedback helpers
// ---------------------------------------------------------------------------

function fmt(n: number): string {
  if (Math.abs(n) >= 1e6 || (Math.abs(n) < 1e-3 && n !== 0)) return n.toExponential(2);
  return String(Number(n.toPrecision(3)));
}

function describePoint(pt: Point): string {
  return Object.entries(pt)
    .map(([k, v]) => `${k} = ${fmt(v)}`)
    .join(' and ');
}

function notEquivalentFeedback(r: EqResult): string {
  if (r.status === 'undecided') {
    return 'I could not check that answer – it may be undefined for the values tested, so check its domain and try again.';
  }
  if (r.mismatchAt && r.values && Object.keys(r.mismatchAt).length) {
    return `That is not equivalent to the expected answer. For example, when ${describePoint(r.mismatchAt)} your answer gives ${fmt(r.values[0])} but the correct answer gives ${fmt(r.values[1])}.`;
  }
  return 'That is not equivalent to the expected answer – check your working.';
}

function verdict(correct: boolean, reason: AlgebraReason, feedback: string, r?: EqResult): AlgebraVerdict {
  const v: AlgebraVerdict = { correct, reason, feedback };
  if (r && (r.sampled !== undefined || r.mismatchAt)) {
    v.details = {};
    if (r.sampled !== undefined) v.details.sampled = r.sampled;
    if (r.mismatchAt) v.details.mismatchAt = r.mismatchAt;
  }
  return v;
}

const RANK: Record<AlgebraReason, number> = {
  identical: 6,
  equivalent: 6,
  'equivalent-wrong-form': 4,
  'not-simplified': 4,
  'expanded-not-factorised': 4,
  'partial-solution-set': 3,
  'extra-solutions': 3,
  'sign-error': 3,
  'not-equivalent': 1,
  unparseable: 0,
};

function better(a: AlgebraVerdict, b: AlgebraVerdict): AlgebraVerdict {
  if (a.correct) return a;
  if (b.correct) return b;
  return RANK[b.reason] > RANK[a.reason] ? b : a;
}

// ---------------------------------------------------------------------------
// Single-answer checking
// ---------------------------------------------------------------------------

function checkSingle(answer: string, student: Parsed, specText: string, spec: AlgebraSpec): AlgebraVerdict {
  const sp = parseFull(specText);
  if (!sp.ok) {
    return verdict(false, 'unparseable', `There is a problem with the expected answer for this question (${sp.error}) – please report it.`);
  }
  const specParsed = sp.value;
  const ctx = buildCtx(spec, [student.expr, specParsed.expr], `${specText} ${answer}`);

  if (SET_HEADS.has(student.expr.operator) && !SET_HEADS.has(specParsed.expr.operator)) {
    return verdict(false, 'not-equivalent', 'A single answer was expected here, but you have given more than one.');
  }

  const r = compareExpressions(student.expr, specParsed.expr, ctx);

  if (r.status === 'identical' || r.status === 'equivalent') {
    const mode = spec.mode;
    if (mode === 'form' && spec.form) {
      const f = checkForm(spec.form, student, specParsed, ctx, r.unwrapped === true);
      if (!f.ok) return verdict(false, f.reason, f.feedback, r);
    } else if (mode === 'identical-after-simplify') {
      let identical = r.status === 'identical';
      if (!identical) {
        try {
          identical = student.expr.simplify().isSame(specParsed.expr.simplify());
        } catch {
          identical = false;
        }
      }
      if (!identical) {
        return verdict(false, 'equivalent-wrong-form', 'That is mathematically correct, but it is not fully simplified – simplify it as far as possible.', r);
      }
      return verdict(true, 'identical', 'Correct – well done.', r);
    }
    if (r.status === 'identical') return verdict(true, 'identical', 'Correct – well done.', r);
    return verdict(true, 'equivalent', 'Correct – that is equivalent to the expected answer.', r);
  }

  if (r.status === 'different' && isSignError(student.expr, specParsed.expr, ctx)) {
    return verdict(false, 'sign-error', 'Very close – check your signs; one of them is the wrong way round.', r);
  }
  return verdict(false, 'not-equivalent', notEquivalentFeedback(r), r);
}

// ---------------------------------------------------------------------------
// Solution sets
// ---------------------------------------------------------------------------

/** Split "x=2 or x=-3", "x=2, -3", "{2, -3}", "x=2\text{ or }x=-3", "x=\pm3" into pieces. */
export function splitSolutions(text: string): string[] {
  let s = normaliseUnicode(text.trim());
  s = s
    .replace(/\\(?:text|mathrm|textrm|operatorname)\{\s*(?:or|and)\s*\}/gi, ',')
    .replace(/\\(?:lor|vee|land|wedge)\b/g, ',')
    .replace(/\\\\/g, ',')
    .replace(/;/g, ',')
    .replace(/\+\/-/g, '\\pm ');
  s = s.replace(/\\q?quad\b/g, (s.match(/=/g) ?? []).length >= 2 ? ',' : ' ');
  s = s.replace(/(^|[^a-zA-Z\\])(?:or|and)(?![a-zA-Z])/g, '$1,');
  // Set notation: x ∈ {2, -3}, {2, -3}, \left\{ … \right\}
  s = s
    .replace(/^\s*[a-zA-Z](?:_\{?\w+\}?)?\s*\\in\s*/, '')
    .replace(/\\(?:left|right)?\\?[{}]/g, '');
  const t = s.trim();
  if (t.startsWith('{') && t.endsWith('}')) s = t.slice(1, -1);

  const pieces: string[] = [];
  let depth = 0;
  let cur = '';
  for (const c of s) {
    if (c === '(' || c === '{' || c === '[') depth++;
    else if (c === ')' || c === '}' || c === ']') depth = Math.max(0, depth - 1);
    if (c === ',' && depth === 0) {
      pieces.push(cur);
      cur = '';
    } else cur += c;
  }
  pieces.push(cur);

  const out: string[] = [];
  for (const raw of pieces) {
    // A trig solution typed with its unit ("30°", "x = 150 degrees", "30^\\circ") is the value 30: the sign is not part of the set.
    const p = raw
      .trim()
      .replace(/\.$/, '')
      .replace(/\s*(?:°|\^\{?\\circ\}?|\\circ|\\degree|degrees?)\s*$/i, '')
      .trim();
    if (!p) continue;
    if (/\\pm|\\mp/.test(p)) {
      out.push(p.replace(/\\pm/, '+').replace(/\\mp/, '-'));
      out.push(p.replace(/\\pm/, '-').replace(/\\mp/, '+'));
    } else out.push(p);
  }
  return out;
}

interface Solution {
  text: string;
  variable: string | null;
  value: Parsed;
}

function parseSolution(text: string): { ok: true; value: Solution } | { ok: false; error: string } {
  const r = parseFull(text);
  if (!r.ok) return { ok: false, error: r.error };
  const parsed = r.value;
  const subj = subjectOf(parsed.expr);
  if (subj) {
    const base = subj.sym.replace(/_.*$/, '');
    const latex = subj.other.latex;
    const inner = parseFull(latex);
    if (inner.ok) return { ok: true, value: { text, variable: base, value: inner.value } };
    return { ok: true, value: { text, variable: base, value: { latex, expr: subj.other, raw: subj.other } } };
  }
  return { ok: true, value: { text, variable: null, value: parsed } };
}

function fmtSolution(variable: string, s: Solution): string {
  return `${variable} = ${s.value.raw.latex.replace(/\\/g, '')}`;
}

function checkSolutionSet(answer: string, specPieces: string[], spec: AlgebraSpec): AlgebraVerdict {
  const specSolutions: Solution[] = [];
  for (const piece of specPieces) {
    const p = parseSolution(piece);
    if (!p.ok) return verdict(false, 'unparseable', `There is a problem with the expected answer for this question (${p.error}) – please report it.`);
    specSolutions.push(p.value);
  }
  const variable = specSolutions.find((s) => s.variable)?.variable ?? 'x';

  const studentPieces = splitSolutions(answer);
  if (!studentPieces.length) return verdict(false, 'unparseable', 'Type an answer first – I could not find any solutions to mark.');
  const studentSolutions: Solution[] = [];
  for (const piece of studentPieces) {
    const p = parseSolution(piece);
    if (!p.ok) return verdict(false, 'unparseable', `I could not read "${piece.trim()}" as a maths expression (${p.error}) – check your brackets and symbols.`);
    if (p.value.variable && p.value.variable !== variable) {
      return verdict(false, 'not-equivalent', `The unknown in this equation is ${variable}, not ${p.value.variable}.`);
    }
    studentSolutions.push(p.value);
  }

  const ctx = buildCtx(
    spec,
    [...specSolutions, ...studentSolutions].map((s) => s.value.expr),
    `${specPieces.join('|')} ${answer}`,
  );

  // Deduplicate the student's list.
  const unique: Solution[] = [];
  for (const s of studentSolutions) {
    if (!unique.some((u) => compareExpressions(s.value.expr, u.value.expr, ctx).status !== 'different')) unique.push(s);
  }

  const matchedSpec = new Set<number>();
  const extras: Solution[] = [];
  let allIdentical = true;
  for (const s of unique) {
    let found = false;
    for (let i = 0; i < specSolutions.length; i++) {
      if (matchedSpec.has(i)) continue;
      const r = compareExpressions(s.value.expr, specSolutions[i].value.expr, ctx);
      if (r.status === 'identical' || r.status === 'equivalent') {
        matchedSpec.add(i);
        found = true;
        if (r.status !== 'identical') allIdentical = false;
        break;
      }
    }
    if (!found) extras.push(s);
  }
  const missing = specSolutions.filter((_, i) => !matchedSpec.has(i));
  const total = specSolutions.length;

  if (!missing.length && !extras.length) {
    if (spec.mode === 'form' && spec.form) {
      for (const s of unique) {
        const f = checkForm(spec.form, s.value, specSolutions[0].value, ctx, false);
        if (!f.ok) return verdict(false, f.reason, f.feedback);
      }
    }
    const plural = total === 1 ? 'Correct – well done.' : `Correct – all ${total} solutions found.`;
    return verdict(true, allIdentical ? 'identical' : 'equivalent', plural);
  }

  if (!extras.length) {
    const found = matchedSpec.size;
    const more = total - found;
    return verdict(
      false,
      'partial-solution-set',
      `You have found ${found} of the ${total} solutions – there ${more === 1 ? 'is one more' : `are ${more} more`} to find.`,
    );
  }

  for (const extra of extras) {
    for (const m of missing) {
      const negated = boxJson(['Negate', m.value.expr.json as unknown as MJ]);
      const r = compareExpressions(extra.value.expr, negated, ctx);
      if (r.status === 'identical' || r.status === 'equivalent') {
        return verdict(false, 'sign-error', `Very close – ${fmtSolution(variable, extra)} has the wrong sign. Check the signs in your working.`);
      }
    }
  }

  if (!missing.length) {
    const right = specSolutions.map((s) => fmtSolution(variable, s)).join(' and ');
    return verdict(false, 'extra-solutions', `${right} ${total === 1 ? 'is' : 'are'} right, but you have included a value that is not a solution – substitute each value back into the equation to check.`);
  }
  const rightOnes = [...matchedSpec].map((i) => fmtSolution(variable, specSolutions[i]));
  const prefix = rightOnes.length ? `${rightOnes.join(' and ')} ${rightOnes.length === 1 ? 'is' : 'are'} right, but ` : '';
  return verdict(false, 'not-equivalent', `${prefix}${prefix ? 'the other value is' : 'those are'} not ${prefix ? 'a solution' : 'the solutions'} of this equation – check your working.`);
}

// ---------------------------------------------------------------------------
// Entry point
// ---------------------------------------------------------------------------

/**
 * Mark a student's algebra answer against a marking-scheme spec.
 */
// ---------------------------------------------------------------------------
// Vectors in i, j
// ---------------------------------------------------------------------------

/** A spec whose variables name both i and j is a vector answer: the unit vectors, not the imaginary unit. */
function isVectorSpec(spec: AlgebraSpec): boolean {
  const v = spec.variables ?? [];
  return v.includes('i') && v.includes('j');
}

/** A unit typed after a vector ("3i + 4j m/s", "… N", "… km/h"): the unit is not part of the vector. */
const VECTOR_UNIT_TAIL = /\s*(?:m\/s\^?\{?2\}?|m\/s²|ms\^?\{?-2\}?|m s\^?\{?-2\}?|ms⁻²|m s⁻²|m\/s|ms\^?\{?-1\}?|m s\^?\{?-1\}?|ms⁻¹|m s⁻¹|km\/h|kmh|km\/hr|newtons?|n|m|km|cm|kg)\s*$/i;

/**
 * The spellings a learner types for a vector, made into one the engine samples as ordinary algebra:
 * bold, hatted or underlined unit vectors read as i and j; a two-row pmatrix / bmatrix column, or a
 * plain tuple "(3, 4)", reads as (a)i + (b)j; a trailing unit is dropped; then i and j become the
 * symbols e_i and e_j, because the compute engine would otherwise treat i as sqrt(-1).
 */
export function vectorInput(s: string): string {
  // The unit comes off before unicode is normalised, so "m/s²" is still "m/s²" when the tail is read.
  let t = normaliseUnicode(s.trim().replace(VECTOR_UNIT_TAIL, ''));
  t = t.replace(/\\(?:mathbf|boldsymbol|hat|underline|vec|mathrm|textbf|bm)\{\s*([ij])\s*\}/g, '$1');
  t = t.replace(/\\(?:mathbf|boldsymbol|underline|vec|textbf|bm)\s*([ij])(?![a-zA-Z])/g, '$1');
  t = t.replace(/\\(?:left|right)/g, '');
  t = t.replace(VECTOR_UNIT_TAIL, '');
  const col = /\\begin\{([pb]?matrix)\}([\s\S]*?)\\end\{\1\}/;
  const m = col.exec(t);
  if (m) {
    const rows = m[2].split(/\\\\/).map((r) => r.trim()).filter((r) => r.length > 0);
    if (rows.length === 2) t = t.replace(col, `(${rows[0]})i + (${rows[1]})j`);
  }
  const tup = /^\(\s*([^,()]+?)\s*,\s*([^,()]+?)\s*\)$/.exec(t);
  if (tup) t = `(${tup[1]})i + (${tup[2]})j`;
  t = t.replace(VECTOR_UNIT_TAIL, '');
  // e_i and e_j parse as whole symbols (a plain "vi" would read as v times i) and never occur in feedback prose.
  return t.replace(/(?<![a-zA-Z\\])i(?![a-zA-Z])/g, 'e_i').replace(/(?<![a-zA-Z\\])j(?![a-zA-Z])/g, 'e_j');
}

function vectorSpec(spec: AlgebraSpec): AlgebraSpec {
  return {
    ...spec,
    answer: vectorInput(spec.answer),
    alternatives: spec.alternatives?.map(vectorInput),
    solutionSet: spec.solutionSet?.map(vectorInput),
    variables: (spec.variables ?? []).map((v) => (v === 'i' ? 'e_i' : v === 'j' ? 'e_j' : v)),
  };
}

/** "+ C" for a spec written "+ c" (and the other way round): the constant of integration has one case. */
function foldConstantCase(answer: string, spec: AlgebraSpec): string {
  const has = (text: string, letter: string) => new RegExp(`(?<![a-zA-Z\\\\])${letter}(?![a-zA-Z])`).test(text);
  for (const [specCase, typedCase] of [['c', 'C'], ['C', 'c']] as const) {
    if (has(spec.answer, specCase) && !has(spec.answer, typedCase) && has(answer, typedCase) && !has(answer, specCase)) {
      return answer.replace(new RegExp(`(?<![a-zA-Z\\\\])${typedCase}(?![a-zA-Z])`, 'g'), specCase);
    }
  }
  return answer;
}

export function checkAlgebraic(answer: string, spec: AlgebraSpec): AlgebraVerdict {
  answer = foldConstantCase(answer ?? '', spec);
  if (!isVectorSpec(spec)) return checkAlgebraicCore(answer, spec);
  const v = checkAlgebraicCore(vectorInput(answer ?? ''), vectorSpec(spec));
  // The sampled symbols are shown with the names she used.
  return { ...v, feedback: v.feedback.replace(/\be_i\b/g, 'i').replace(/\be_j\b/g, 'j') };
}

function checkAlgebraicCore(answer: string, spec: AlgebraSpec): AlgebraVerdict {
  const text = (answer ?? '').trim();
  if (!text) return verdict(false, 'unparseable', 'Type an answer first.');

  const specPieces = spec.solutionSet?.length ? spec.solutionSet.flatMap(splitSolutions) : splitSolutions(spec.answer);
  if (spec.solutionSet?.length || specPieces.length > 1) {
    let best = checkSolutionSet(text, specPieces, spec);
    for (const alt of spec.alternatives ?? []) {
      if (best.correct) break;
      best = better(best, checkSolutionSet(text, splitSolutions(alt), spec));
    }
    return best;
  }

  const student = parseFull(text);
  if (!student.ok) {
    return verdict(false, 'unparseable', `I could not read that as a maths expression (${student.error}) – check your brackets and symbols and try again.`);
  }

  let best = checkSingle(text, student.value, spec.answer, spec);
  for (const alt of spec.alternatives ?? []) {
    if (best.correct) break;
    best = better(best, checkSingle(text, student.value, alt, spec));
  }
  return best;
}
