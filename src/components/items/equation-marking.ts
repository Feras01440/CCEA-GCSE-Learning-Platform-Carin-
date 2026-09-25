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
  // "\left" and "\right" as whole commands only: "\rightarrow" is an arrow, and stripping its "\right" left "arrow"
  // (25 Sep 2026: every typed arrow was refused against a key written with \rightarrow).
  s = s.replace(/\\(?:left|right)(?![A-Za-z])|\\(?:,|;|!|quad|qquad| )/g, "");
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
      return m ? { coefficient: Number(m[1]), species: speciesKey(m[2]) } : { coefficient: 1, species: speciesKey(t) };
    })
    .sort((a, b) => a.species.localeCompare(b.species));
}

/**
 * The species a formula names, for comparing equations. An organic compound (carbon and hydrogen both in it) is the
 * same species whatever correct formula it is written with, so it is read as its atom counts: CH3CH2OH, C2H5OH and
 * C2H6O are one species (C2 D F05, 24 Sep 2026; CCEA credits "C3H8O/C3H7OH" for propanol, C2 Higher MS Summer 2021).
 * Anything else keeps its spelling: an inorganic formula has one conventional order (H2O, not OH2), and an ion, an
 * electron or a hydrate is left exactly as written. A state symbol stays attached.
 */
function speciesKey(species: string): string {
  const m = /^(.*?)(\((?:s|l|g|aq)\))?$/i.exec(species);
  // A bond drawn in a structural formula ("CH2=CH2") is part of the same compound's formula.
  const formula = (m?.[1] ?? species).replace(/[=≡]/g, "");
  const state = m?.[2] ?? "";
  if (!/^(?:[A-Z][a-z]?\d*|\((?:[A-Z][a-z]?\d*)+\)\d*)+$/.test(formula)) return species;
  const counts = new Map<string, number>();
  const add = (el: string, n: number) => counts.set(el, (counts.get(el) ?? 0) + n);
  for (const g of formula.matchAll(/\(((?:[A-Z][a-z]?\d*)+)\)(\d*)|([A-Z][a-z]?)(\d*)/g)) {
    if (g[1] !== undefined) {
      const times = g[2] ? Number(g[2]) : 1;
      for (const a of g[1].matchAll(/([A-Z][a-z]?)(\d*)/g)) add(a[1]!, (a[2] ? Number(a[2]) : 1) * times);
    } else add(g[3]!, g[4] ? Number(g[4]) : 1);
  }
  if (!counts.has("C") || !counts.has("H")) return species;
  const order = ["C", "H", ...[...counts.keys()].filter((e) => e !== "C" && e !== "H").sort()];
  return `{${order.map((e) => `${e}${counts.get(e)}`).join("")}}${state}`;
}

/**
 * Same species on each side, coefficients in one common ratio (so 2H2 + O2 → 2H2O ≡ 4H2 + 2O2 → 4H2O). With
 * `exact`, the ratio must be 1: the same equation, its species in any order and spelt any correct way.
 */
function sameUpToMultiple(a: string, b: string, exact = false): boolean {
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
  return ratio !== null && (!exact || Math.abs(ratio - 1) < 1e-9);
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
  /**
   * Compare as a chemical equation: the same species on each side in any order, an organic compound in any correct
   * formula (C2 D F05), at the same coefficients.
   */
  species?: boolean;
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
  // A single arrow and a reversible sign are different equations (the independent verifier, 25 Sep 2026: "N2 + 3H2 →
  // 2NH3" scored full marks against "⇌"; CCEA C2 H 2021: "proper reversible sign needed").
  const arrow = (e: string) => (e.includes("<->") ? "<->" : e.includes("->") ? "->" : "=");
  if (arrow(a) !== arrow(b)) return false;
  if (opts.acceptMultiples && sameUpToMultiple(a, b)) return true;
  if (opts.species && sameUpToMultiple(a, b, true)) return true;
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

/** A species typed with its charge after it on a keyboard: "e-", "Cl-", "Zn2+", "2O2-", "NH4+(aq)". */
const KEYBOARD_CHARGE = /^(\d*)((?:[A-Z][a-z]?\d*|\((?:[A-Z][a-z]?\d*)+\)\d*)+|e)([+-])(\((?:s|l|g|aq)\))?$/;

/**
 * The ways a line with charges typed on a keyboard can be read (C2 E, 24 Sep 2026: "Zn²⁺ + 2e- → Zn" was refused
 * while "2e⁻" passed). A species followed by + or − and then a space or the line's end carries that charge: "e-" is
 * an electron, never an element or a separator. A digit before the sign may be the charge's size ("Zn2+", "O2-") or
 * the formula's last count ("NH4+"): both readings are offered, and the key decides which she meant. At most 16.
 */
export function keyboardChargeReadings(line: string): string[] {
  const tokens = line.trim().split(/(\s+)/);
  let readings: string[][] = [[]];
  let changed = false;
  for (const token of tokens) {
    const m = KEYBOARD_CHARGE.exec(token);
    let options = [token];
    if (m) {
      const [, coefficient = "", formula = "", sign = "", state = ""] = m;
      const size = /^(.*?[A-Za-z)])(\d+)$/.exec(formula);
      options = [`${coefficient}${formula}^${sign}${state}`];
      if (formula !== "e" && size) options.unshift(`${coefficient}${size[1]}^{${size[2]}${sign}}${state}`);
      changed = true;
    }
    readings = readings.flatMap((r) => options.map((o) => [...r, o])).slice(0, 16);
  }
  return changed ? readings.map((r) => r.join("")) : [];
}

export function markEquation(raw: string, spec: EquationSpec): EquationMarkResult {
  const lines = raw.replace(/\r/g, "").split("\n");
  const equationLine = (lines[0] ?? "").trim();
  const working = lines.slice(1).join("\n").trim();
  if (equationLine.length === 0) {
    return { correct: false, feedback: "Write the equation on the first line before any numbers.", equationLine, working };
  }
  const first = markEquationLine(equationLine, working, spec);
  if (first.correct || spec.kindOf === "physics") return first;
  // Charges typed on a keyboard: the first reading the key accepts, else the first that says more than "not the
  // expected equation" (unbalanced, or the state symbols), else the line as typed.
  const read = keyboardChargeReadings(equationLine).map((r) => ({ ...markEquationLine(r, working, spec), equationLine }));
  return read.find((r) => r.correct) ?? read.find((r) => r.feedback !== first.feedback && !/not the expected equation/.test(r.feedback)) ?? first;
}

function markEquationLine(equationLine: string, working: string, spec: EquationSpec): EquationMarkResult {
  const physics = spec.kindOf === "physics";
  const hasStates = /\((s|l|g|aq)\)/i.test(equationLine);
  const compare = { allowSwap: physics, lowercase: physics, implicitMultiply: physics, acceptMultiples: spec.acceptMultiples, species: !physics };
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

// ---------------------------------------------------------------------------------------------
// Point by point: a chemical equation part marked against its own scheme
// ---------------------------------------------------------------------------------------------

/** What one mark point of a chemical equation part is for, as far as the engine can read it. */
type EquationPointNeed =
  | { kind: "lhs" | "rhs" | "both" | "both-no-electrons" | "balanced" | "states" | "reversible" | "electrons" }
  | { kind: "species"; side: 0 | 1; species: string; coefficient: number | null };

interface ReadEquation {
  sides: Term[][];
  reversible: boolean;
}

/** An equation line read into its two sides of terms, or null when it has not got two sides. */
function readEquation(line: string, opts: { stripStates: boolean; lowercase: boolean }): ReadEquation | null {
  const n = normaliseEquation(line, { stripStates: opts.stripStates, lowercase: opts.lowercase });
  const s = sides(n);
  if (s.length !== 2) return null;
  return { sides: s.map(terms), reversible: n.includes("<->") };
}

const isElectron = (t: Term) => /^e\^?-?$/i.test(t.species);
const speciesSet = (ts: readonly Term[], electrons = true) =>
  [...new Set(ts.filter((t) => electrons || !isElectron(t)).map((t) => t.species))].sort().join("+");

/**
 * The needs of one mark point, read from its words: "reactants" / "left-hand side", "products" / "right-hand side",
 * "formulae on both sides", "balancing", "state symbols", "the reversible sign", "electrons on the correct side",
 * "ion and product", or a species of the key named on its own ("6CO₂", "carbon dioxide"). Null when the point is
 * about something else, and the part is then marked all or nothing.
 */
function equationPointNeeds(text: string, key: ReadEquation, lowercase: boolean): EquationPointNeed[] | null {
  const t = text.toLowerCase();
  const needs: EquationPointNeed[] = [];
  if (/state symbol/.test(t)) needs.push({ kind: "states" });
  if (/reversible/.test(t)) needs.push({ kind: "reversible" });
  if (/balanc/.test(t)) needs.push({ kind: "balanced" });
  if (needs.length > 0) return needs;
  if (/electron/.test(t)) return [{ kind: "electrons" }];
  if (/\b(?:ion|reactant) and product\b/.test(t)) return [{ kind: "both-no-electrons" }];
  if (/both sides|reactants and products|left.hand side and right.hand side/.test(t)) return [{ kind: "both" }];
  if (/reactant|left.hand side/.test(t)) return [{ kind: "lhs" }];
  if (/product|right.hand side/.test(t)) return [{ kind: "rhs" }];
  // A species of the key named on its own, perhaps with a note in brackets ("(muscle) lactic acid").
  const bare = text.replace(/\([^()]*\)\s*/g, " ").trim();
  if (bare.length === 0 || /[:;,]|\b(?:and|or|correct|seen)\b/i.test(bare)) return null;
  const named = terms(normaliseEquation(bare, { stripStates: true, lowercase }));
  if (named.length !== 1) return null;
  const coefficient = /^\s*\d/.test(normaliseEquation(bare, { stripStates: true, lowercase })) ? named[0]!.coefficient : null;
  const side = key.sides.findIndex((s) => s.some((k) => k.species === named[0]!.species));
  if (side < 0) return null;
  return [{ kind: "species", side: side as 0 | 1, species: named[0]!.species, coefficient }];
}

/**
 * The marks an equation line earns point by point against the part's scheme, or null when some point is one the
 * engine cannot read (the part is then all or nothing, as before). Each point is paid on its own: the reactants'
 * formulae, the products', the balancing (the whole equation right, any multiple where the part accepts one, the
 * arrow aside where the reversible sign has a point of its own), the state symbols (on the right formulae), the
 * reversible sign, the electrons' side, a named species on its side (with its coefficient when the point gives
 * one). Charges typed on a keyboard are read every way `keyboardChargeReadings` allows, and the best reading counts.
 */
export function equationSchemeMarks(
  raw: string,
  spec: EquationSpec,
  scheme: readonly { marks: number; for: string; id?: string; dependsOn?: readonly string[] }[],
): number | null {
  if (spec.kindOf === "physics" || scheme.length === 0) return null;
  const line = (raw.replace(/\r/g, "").split("\n")[0] ?? "").trim();
  if (line.length === 0) return 0;
  const lowercase = spec.kindOf === "word";
  const key = readEquation(spec.balancedLatex, { stripStates: true, lowercase });
  const keyStates = readEquation(spec.balancedLatex, { stripStates: false, lowercase });
  if (!key || !keyStates) return null;
  const needs = scheme.map((p) => equationPointNeeds(p.for, key, lowercase));
  if (needs.some((n) => n === null)) return null;
  const separateArrow = needs.some((n) => n!.some((x) => x.kind === "reversible"));
  const score = (typedLine: string): number => {
    const typed = readEquation(typedLine, { stripStates: true, lowercase });
    const typedStates = readEquation(typedLine, { stripStates: false, lowercase });
    if (!typed || !typedStates) return 0;
    const sameSide = (i: 0 | 1, electrons = true) => speciesSet(typed.sides[i]!, electrons) === speciesSet(key.sides[i]!, electrons);
    const arrowless = (s: string) => s.replace(/⇌|<=>|<->|\\rightleftharpoons/g, "->");
    const balanced = equationsMatch(separateArrow ? arrowless(typedLine) : typedLine, separateArrow ? arrowless(spec.balancedLatex) : spec.balancedLatex, {
      acceptMultiples: spec.acceptMultiples,
      stripStates: true,
      species: true,
      lowercase,
    });
    const electronSide = key.sides.findIndex((s) => s.some(isElectron));
    const holds = (n: EquationPointNeed): boolean => {
      switch (n.kind) {
        case "lhs":
          return sameSide(0);
        case "rhs":
          return sameSide(1);
        case "both":
          return sameSide(0) && sameSide(1);
        case "both-no-electrons":
          return sameSide(0, false) && sameSide(1, false);
        case "balanced":
          return balanced;
        case "states":
          return sameSide(0) && sameSide(1) && [0, 1].every((i) => speciesSet(typedStates.sides[i]!) === speciesSet(keyStates.sides[i]!));
        case "reversible":
          return typed.reversible === key.reversible;
        case "electrons":
          return electronSide >= 0 && typed.sides[electronSide]!.some(isElectron) && !typed.sides[1 - electronSide]!.some(isElectron);
        case "species":
          return typed.sides[n.side]!.some((t) => t.species === n.species && (n.coefficient === null || Math.abs(t.coefficient - n.coefficient) < 1e-9));
      }
    };
    // A point is paid only with the points it depends on ("second mark dependent on first", C1 H 2018; the verifier).
    const met = scheme.map((_, i) => needs[i]!.every(holds));
    const paid = (i: number, seen: Set<number> = new Set()): boolean =>
      met[i]! &&
      (scheme[i]!.dependsOn ?? []).every((d) => {
        const j = scheme.findIndex((x) => x.id === d);
        return j < 0 || seen.has(j) || paid(j, new Set([...seen, i]));
      });
    return scheme.reduce((sum, p, i) => sum + (paid(i) ? p.marks : 0), 0);
  };
  return Math.max(score(line), ...keyboardChargeReadings(line).map(score));
}
