/**
 * Equation-line marking for physics ("equation before numbers") and chemistry
 * (word / symbol / ionic / half / nuclear). Pure string normalisation: LaTeX-lite or
 * plain typing on both sides, compared after unifying operators, arrows, Greek letters,
 * sub/superscripts and spacing. Multiples of a balanced equation are accepted when the
 * spec allows them.
 */
import type { AnswerSpec } from "@/lib/content/schema";

export type EquationSpec = Extract<AnswerSpec, { kind: "equation" }>;

const GREEK: Record<string, string> = {
  alpha: "α",
  beta: "β",
  gamma: "γ",
  delta: "δ",
  Delta: "Δ",
  eta: "η",
  theta: "θ",
  lambda: "λ",
  mu: "μ",
  pi: "π",
  rho: "ρ",
  sigma: "σ",
  omega: "ω",
};

const SUB: Record<string, string> = { "₀": "0", "₁": "1", "₂": "2", "₃": "3", "₄": "4", "₅": "5", "₆": "6", "₇": "7", "₈": "8", "₉": "9" };
const SUP: Record<string, string> = { "⁰": "0", "¹": "1", "²": "2", "³": "3", "⁴": "4", "⁵": "5", "⁶": "6", "⁷": "7", "⁸": "8", "⁹": "9", "⁺": "+", "⁻": "-" };

const STATE_SYMBOL = /\((s|l|g|aq)\)/gi;

function unwrapBraces(s: string, command: string): string {
  // \command{inner} → inner, matching the brace by depth so an inner ^{3+} (as the notes print charges) is kept.
  const head = "\\" + command + "{";
  let cur = s;
  for (let guard = 0; guard < 20; guard += 1) {
    const at = cur.indexOf(head);
    if (at < 0) break;
    let depth = 0;
    let close = -1;
    for (let i = at + head.length - 1; i < cur.length; i += 1) {
      const c = cur[i];
      if (c === "{") depth += 1;
      else if (c === "}") {
        depth -= 1;
        if (depth === 0) {
          close = i;
          break;
        }
      }
    }
    if (close < 0) break;
    cur = cur.slice(0, at) + cur.slice(at + head.length, close) + cur.slice(close + 1);
  }
  return cur;
}

/**
 * A numerator or denominator that needs no brackets once it is written on one line. A product written with a sign
 * is not one: "\frac{3 \times 5}{2}" is "(3 × 5)/2", and without the brackets it read "3 × 5/2", which no typed
 * line matched (engine brief item 9, 23 Sep 2026).
 */
function isAtom(s: string): boolean {
  return !/[+\-*/=^()×·⋅÷]|\\(?:times|cdot|div)\b/.test(s);
}

function fracToSlash(s: string): string {
  const re = /\\frac\{([^{}]*)\}\{([^{}]*)\}/g;
  let prev = "";
  let cur = s;
  for (let i = 0; i < 20 && prev !== cur; i += 1) {
    prev = cur;
    cur = cur.replace(re, (_, a: string, b: string) => `${isAtom(a) ? a : `(${a})`}/${isAtom(b) ? b : `(${b})`}`);
  }
  return cur;
}

export interface NormaliseEquationOptions {
  lowercase?: boolean;
  stripStates?: boolean;
  /** Drop explicit multiplication between symbols so `m × a`, `m*a` and `ma` compare equal (physics). */
  implicitMultiply?: boolean;
}

/** Canonical spelling of an equation line so two honest spellings compare equal. */
export function normaliseEquation(input: string, opts: NormaliseEquationOptions = {}): string {
  let s = input.replace(/\r/g, "").split("\n")[0] ?? "";
  // The notes print equations as $\ce{…}$, so a learner who copies that form is not marked down for the dollars.
  s = s.trim().replace(/^\$+|\$+$/g, "").replace(/^\\\(|\\\)$/g, "").replace(/^\\\[|\\\]$/g, "");
  s = unwrapBraces(s, "ce");
  s = unwrapBraces(s, "text");
  s = unwrapBraces(s, "mathrm");
  s = unwrapBraces(s, "textbf");
  s = s.replace(/\\(left|right|,|;|!|quad|qquad| )/g, "");
  s = fracToSlash(s);
  s = s.replace(/\\(times|cdot)\b/g, "*").replace(/[×·⋅]/g, "*");
  s = s.replace(/\\div\b/g, "/").replace(/÷/g, "/");
  s = s.replace(/\\(rightleftharpoons|leftrightarrow)\b|⇌|<=>|<->/g, "<->");
  s = s.replace(/\\(longrightarrow|rightarrow|to)\b|→|⟶|-->|->|=>/g, "->");
  s = s.replace(/\\([A-Za-z]+)/g, (m, name: string) => GREEK[name] ?? m);
  s = s.replace(/\^\{([^{}]*)\}/g, "^$1").replace(/_\{([^{}]*)\}/g, "$1").replace(/_/g, "");
  // A plain digit right before a superscript sign is the charge's size ("Fe3⁺" as the key strip produces it, "SO₄2⁻");
  // a subscript digit before the sign ("NH₄⁺") is part of the formula and is left alone.
  s = s.replace(/(\d)([⁺⁻])/g, "^$1$2");
  // ¹ ² ³ live at U+00B9/B2/B3, outside the U+2070 superscript block, so they are listed explicitly.
  s = s.replace(/[₀-₉]/g, (c) => SUB[c] ?? c).replace(/[⁰-⁹¹²³⁺⁻]/g, (c) => `^${SUP[c] ?? c}`);
  s = s.replace(/\^(\d)\^([+-])/g, "^$1$2"); // 2+ written as superscripts: "^2^+" → "^2+"
  s = s.replace(/[−–—]/g, "-");
  if (opts.stripStates) s = s.replace(STATE_SYMBOL, "");
  s = s.replace(/[{}\\]/g, "").replace(/\s+/g, "");
  // Drop brackets that merely wrap an atom in a formula: (distancemoved) → distancemoved. In a chemical
  // equation the brackets are the formula (Mg(NO3)2 is not MgNO32), so they stay when symbols are not multiplied.
  if (opts.implicitMultiply) s = s.replace(/\(([^()+\-*/=^]+)\)/g, "$1");
  // `m*a` → `ma`, but `2*3` keeps its star (a product of two numbers is not a symbol string).
  if (opts.implicitMultiply) s = s.replace(/(?<!\d)\*|\*(?!\d)/g, "");
  return opts.lowercase ? s.toLowerCase() : s;
}

function sides(eq: string): string[] {
  const arrow = eq.includes("<->") ? "<->" : eq.includes("->") ? "->" : "=";
  return eq.split(arrow);
}

interface Term {
  coefficient: number;
  species: string;
}

function terms(side: string): Term[] {
  return side
    .split("+")
    .filter((t) => t.length > 0)
    .map((t) => {
      const m = /^(\d+(?:\.\d+)?)(.*)$/.exec(t);
      return m ? { coefficient: Number(m[1]), species: m[2] } : { coefficient: 1, species: t };
    })
    .sort((a, b) => a.species.localeCompare(b.species));
}

/** Same species on each side, coefficients in one common ratio (so 2H2 + O2 → 2H2O ≡ 4H2 + 2O2 → 4H2O). */
function sameUpToMultiple(a: string, b: string): boolean {
  const sa = sides(a);
  const sb = sides(b);
  if (sa.length !== sb.length) return false;
  let ratio: number | null = null;
  for (let i = 0; i < sa.length; i += 1) {
    const ta = terms(sa[i]);
    const tb = terms(sb[i]);
    if (ta.length !== tb.length) return false;
    for (let j = 0; j < ta.length; j += 1) {
      if (ta[j].species !== tb[j].species) return false;
      const r = ta[j].coefficient / tb[j].coefficient;
      if (!Number.isFinite(r) || r <= 0) return false;
      if (ratio === null) ratio = r;
      else if (Math.abs(ratio - r) > 1e-9) return false;
    }
  }
  return ratio !== null;
}

export interface EquationMatchOptions {
  /** `a = b` also matches `b = a` (physics). */
  allowSwap?: boolean;
  /** Accept any positive multiple of the balanced equation (chemistry). */
  acceptMultiples?: boolean;
  /** Compare case-insensitively (physics symbols typed in lower case). */
  lowercase?: boolean;
  /** Ignore state symbols when comparing. */
  stripStates?: boolean;
  /** Treat `m × a`, `m*a` and `ma` as the same product (physics). */
  implicitMultiply?: boolean;
}

export function equationsMatch(typed: string, expected: string, opts: EquationMatchOptions = {}): boolean {
  const norm = { lowercase: opts.lowercase, stripStates: opts.stripStates, implicitMultiply: opts.implicitMultiply };
  const a = normaliseEquation(typed, norm);
  const b = normaliseEquation(expected, norm);
  if (a.length === 0 || b.length === 0) return false;
  if (a === b) return true;
  if (opts.allowSwap) {
    const [l, r] = a.split("=");
    if (r !== undefined && `${r}=${l}` === b) return true;
  }
  if (opts.acceptMultiples && sameUpToMultiple(a, b)) return true;
  return false;
}

export interface EquationMarkResult {
  correct: boolean;
  feedback: string;
  /** The first line the learner typed (the equation). */
  equationLine: string;
  /** Anything after the first line (substitution and answer, when the field is in two-line mode). */
  working: string;
  /** True when state symbols were required and none were given. */
  missingStateSymbols?: boolean;
}

export function markEquation(raw: string, spec: EquationSpec): EquationMarkResult {
  const lines = raw.replace(/\r/g, "").split("\n");
  const equationLine = (lines[0] ?? "").trim();
  const working = lines.slice(1).join("\n").trim();
  if (equationLine.length === 0) {
    return { correct: false, feedback: "Write the equation on the first line before any numbers.", equationLine, working };
  }
  const physics = spec.kindOf === "physics";
  const hasStates = /\((s|l|g|aq)\)/i.test(equationLine);
  const compare = { allowSwap: physics, lowercase: physics, implicitMultiply: physics, acceptMultiples: spec.acceptMultiples };
  const matched = equationsMatch(equationLine, spec.balancedLatex, { ...compare, stripStates: true });
  if (matched && spec.stateSymbolsRequired) {
    if (!hasStates) {
      return {
        correct: false,
        feedback: "The equation is right but the state symbols — (s), (l), (g), (aq) — are required here.",
        equationLine,
        working,
        missingStateSymbols: true,
      };
    }
    if (!equationsMatch(equationLine, spec.balancedLatex, { ...compare, stripStates: false })) {
      return { correct: false, feedback: "Balanced correctly, but check the state symbols: which substances are (s), (l), (g) or (aq)?", equationLine, working };
    }
  }
  if (matched) {
    return { correct: true, feedback: physics ? "Equation line earned." : "Balanced correctly.", equationLine, working };
  }
  // Same species but not balanced?
  if (!physics) {
    const a = normaliseEquation(equationLine, { stripStates: true });
    const b = normaliseEquation(spec.balancedLatex, { stripStates: true });
    const speciesOf = (eq: string) => sides(eq).map((s) => terms(s).map((t) => t.species).join("+")).join("->");
    if (speciesOf(a) === speciesOf(b)) {
      return { correct: false, feedback: "The right substances, but the equation is not balanced yet. Count each element on both sides.", equationLine, working };
    }
  }
  return {
    correct: false,
    feedback: physics
      ? "That is not the equation this question needs. A wrong equation scores nothing, even if the number comes out right — write it from the vault first."
      : "That is not the expected equation. Check the reactants and products first, then balance.",
    equationLine,
    working,
  };
}
