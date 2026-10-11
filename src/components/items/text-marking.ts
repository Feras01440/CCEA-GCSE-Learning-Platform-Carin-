/**
 * Text, key-word and multiple-choice marking (pure; no content dependencies).
 * Numeric and algebraic marking live in src/lib/marking and are dispatched from mark.ts.
 */
import type { AnswerSpec, McqOption } from "@/lib/content/schema";

export type TextSpec = Extract<AnswerSpec, { kind: "text" }>;
export type McqSpec = Extract<AnswerSpec, { kind: "mcq" }>;

/**
 * Lower-case, unify quotes/dashes/operators, drop punctuation and apostrophes, collapse whitespace.
 * Apostrophes go entirely so that "Benedict's" and "Benedicts" are one word, and a key word "benedict" finds both.
 * Relation signs are spaced out so "x=6" and "x = 6" are the same three words, and "±6" becomes "6 -6" so that a
 * plus-or-minus answer carries both signed values.
 */
const SUPERSCRIPT_DIGITS = "⁰¹²³⁴⁵⁶⁷⁸⁹";

function superscriptDigits(run: string): string {
  return [...run].map((c) => String(SUPERSCRIPT_DIGITS.indexOf(c))).join("");
}

/** Small whole numbers in words, as digits: "two ends" and "2 ends" are one phrase (B2 D, 25 Sep 2026). */
const TEXT_NUMBERS = ["zero", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten", "eleven", "twelve", "thirteen", "fourteen", "fifteen", "sixteen", "seventeen", "eighteen", "nineteen", "twenty"];
const TEXT_NUMBER_RE = new RegExp(`\\b(${TEXT_NUMBERS.join("|")})\\b`, "g");

export function normaliseText(s: string): string {
  return s
    // Capital letters joined by a plus or a slash are a list of letters ("B+D", "B/D"), not a sum or a fraction.
    .replace(/(?<=\b[A-Z])\s*[+/]\s*(?=[A-Z]\b)/g, " ")
    .toLowerCase()
    // A contraction is its two words: "wouldn't" is "would not", "can't" "can not" (B2 D, 25 Sep 2026).
    .replace(/\bwon['’]t\b/g, "will not")
    .replace(/\bcan['’]t\b/g, "can not")
    .replace(/\bshan['’]t\b/g, "shall not")
    .replace(/n['’]t\b/g, " not")
    .replace(/[‘’‚‛']/g, "")
    // A slash between two words is two words ("reproduce/multiply"); "x/y" between letters stays algebra.
    .replace(/(?<=[a-z]{2})\s*\/\s*(?=[a-z]{2})/g, " ")
    .replace(TEXT_NUMBER_RE, (w) => String(TEXT_NUMBERS.indexOf(w)))
    .replace(/[“”„‟]/g, '"')
    .replace(/[−–—]/g, "-")
    // An ion charge written with superscripts is the plain spelling ("Cu²⁺" = "cu2+", "SO₄²⁻" = "so42-", "Na⁺" = "na+"),
    // so authors key one spelling; this runs before the power rule below, which would read ² as ^2.
    .replace(/([⁰¹²³⁴⁵⁶⁷⁸⁹]*)([⁺⁻])/g, (_, d: string, sign: string) => superscriptDigits(d) + (sign === "⁺" ? "+" : "-"))
    .replace(/[₀₁₂₃₄₅₆₇₈₉]/g, (c) => String("₀₁₂₃₄₅₆₇₈₉".indexOf(c)))
    // Typed superscripts and the caret are the same power: "2x² + 5x" and "2x^2 + 5x".
    .replace(/²/g, "^2")
    .replace(/³/g, "^3")
    .replace(/×/g, "x")
    .replace(/÷/g, "/")
    .replace(/±\s*([^\s,;]+)/g, "$1 -$1")
    // A TeX relation is its sign, in a key and in her answer alike ("x \le -3" and "x ≤ -3"; gate 2, G2-08: the answer
    // field's TeX is read as signs, so a key written in TeX must read the same).
    .replace(/\\(?:leqslant|leq|le)(?![a-z])/g, " ≤ ")
    .replace(/\\(?:geqslant|geq|ge)(?![a-z])/g, " ≥ ")
    .replace(/\\(?:neq|ne)(?![a-z])/g, " ≠ ")
    .replace(/\\lt(?![a-z])/g, " < ")
    .replace(/\\gt(?![a-z])/g, " > ")
    // Currency, percent and degree signs are dropped so "£8106.96" and "8106.96", "96°" and "96", are the same number.
    .replace(/[.,;:!?"()[\]{}£€$%°]/g, " ")
    .replace(/\s*([=<>≤≥≠≈])\s*/g, " $1 ")
    // A hyphen joining plain words is a space ("nitrogen-fixing" = "nitrogen fixing", "y-intercept" = "y intercept");
    // a token with a digit or another operator ("2a-b", "x^2-1") keeps its minus.
    .replace(/(^|\s)([a-z]+(?:-[a-z]+)+)(?=\s|$)/g, (_, lead: string, word: string) => lead + word.replace(/-/g, " "))
    .replace(/\s+/g, " ")
    .trim();
}

function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** A single word of at least this many letters is also matched as the stem of an inflected word. */
const STEM_MIN_LETTERS = 4;

/** A key word is algebra when it carries a digit and an operator; prose key words never take this path. */
function isAlgebraic(needle: string): boolean {
  return /\d/.test(needle) && /[+\-/^*]/.test(needle);
}

/** "2x - 1 x + 3 = 30" -> "2x-1 x+3 = 30": the spaces around + - / ^ * dropped, relation signs left spaced. */
function compactOperators(s: string): string {
  return s.replace(/\s*([+\-/^*])\s*/g, "$1");
}

/**
 * Endings a key word may carry in an answer: "heat" ~ "heated", "denatur" ~ "denaturation", "mitochondri" ~
 * "mitochondria". A closed list rather than a length allowance, so "ratio" never matches "rational", "cell" never
 * matches "cellulose", "form" never matches "formula" and "mass" never matches "massive".
 */
const INFLECTIONS = new Set([
  "s", "es", "d", "ed", "ing", "ings", "er", "ers", "est",
  "ion", "ions", "tion", "tions", "ation", "ations",
  "ise", "ised", "ises", "ising", "ize", "ized", "izing",
  "ly", "ally", "al", "ic", "ical", "ity", "ities", "ies", "y",
  "e", "a", "ae", "i", "on", "um",
  "ent", "ents", "ant", "ants", "ance", "ence", "ment", "ments",
  "ate", "ated", "ates", "ating", "ure", "ures", "ist", "ists", "ism", "age", "ness",
]);

/**
 * Whole-word/phrase containment. Tolerates a trailing s / es on the phrase ("bar" ~ "bars", "class" ~ "classes"),
 * and lets one word stand for its inflections ("denatur" ~ "denatured" / "denaturation", "heat" ~ "heated",
 * "increase" ~ "increasing"), which is how authors write key words and how learners write answers. Words of three
 * letters or fewer, and anything that is not plain letters, stay exact.
 */
/**
 * The endings a reject word may carry: its verb forms only. A reject is a wrong answer named in the scheme, and a
 * derived word is a different word ("an atom" must not cancel "share an atomic number"; c1 isotopes, 25 Sep 2026).
 */
const REJECT_INFLECTIONS: ReadonlySet<string> = new Set(["s", "es", "d", "ed", "ing"]);

export function phraseIn(haystack: string, needle: string, inflections: ReadonlySet<string> = INFLECTIONS): boolean {
  if (!needle) return false;
  const h = ` ${haystack} `;
  if (h.includes(` ${needle} `)) return true;
  // A compound word is one word written solid, spaced or hyphenated: "midpoint", "mid point", "mid-point" (gate 2, G2-54,
  // 11 Oct 2026: the chip for "midpoint" stayed grey on "the mid-point"). A one-word key of six letters or more is found
  // as two of her words written together, and a two-word key as one word.
  if (/^[a-z]{6,}$/.test(needle)) {
    const ws = haystack.split(" ");
    for (let i = 0; i + 1 < ws.length; i += 1) if (ws[i]!.length >= 2 && ws[i + 1]!.length >= 2 && `${ws[i]}${ws[i + 1]}` === needle) return true;
  } else if (/^[a-z]{2,} [a-z]{2,}$/.test(needle) && h.includes(` ${needle.replace(" ", "")} `)) return true;
  // An operator before or after a key word is a boundary, as a space is: "sin(57)" stands in "9.6sin(52)/sin(57)" (the
  // M8 author, 8 Oct 2026). A needle with an operator of its own is read by the algebraic path below.
  if (!/[/×*+=÷]/.test(needle) && new RegExp(`(?:^|[\\s/×*+=÷])${needle.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}(?:$|[\\s/×*+=÷])`).test(haystack)) return true;
  // An algebraic key word ("(2x - 1)(x + 3) = 30", "x^2 + 17x - 168 = 0") is matched with the spaces around its
  // operators ignored, so "(2x-1)(x+3) = 30" and "2x^2+5x-33 = 0" earn it however she spaces them.
  if (isAlgebraic(needle) && ` ${compactOperators(haystack)} `.includes(` ${compactOperators(needle)} `)) return true;
  // Each word of the key word may take or drop a trailing s ("rabbit number" ~ "rabbits number", "cell wall" ~ "cell walls").
  const endings = `(?:${[...inflections].sort((a, b) => b.length - a.length).join("|")})?`;
  const loose = needle
    .split(" ")
    .map((w) => {
      if (!/^[a-z]+$/.test(w)) return escapeRegExp(w);
      // "pass" is not the plural of "pas": a double s stays; a longer word takes any of its endings ("pass the gene" ~
      // "passes the gene", "survive" ~ "surviving"; B2 D, 25 Sep 2026: only a trailing s was allowed on a phrase).
      const stem = w.endsWith("ss") ? w : w.replace(/(es|s)$/, "");
      if (stem.length < 3) return escapeRegExp(w);
      if (stem.length < STEM_MIN_LETTERS) return `${escapeRegExp(stem)}(?:es|s)?`;
      return `(?:${wordStems(stem).map(escapeRegExp).join("|")})${endings}`;
    })
    .join(" ");
  if (new RegExp(`(^| )${loose}( |$)`).test(h)) return true;
  if (needle.length < STEM_MIN_LETTERS || !/^[a-z]+$/.test(needle)) return false;
  // "increase" ~ "increasing", "leave" ~ "leaving": a final e is dropped before -ing / -ed / -ation.
  const stems = wordStems(needle);
  return haystack.split(" ").some((w) => stems.some((s) => w.startsWith(s) && inflections.has(w.slice(s.length))));
}

/**
 * The stems a word may be inflected from: itself; without a final e ("increase" ~ "increasing"); a consonant + y as
 * consonant + i ("carry" ~ "carries", "carried"); a consonant + i (from "carries" less its -es) as consonant + y
 * ("carries" ~ "carry", "carrying"). Only words long enough to be stemmed at all.
 */
function wordStems(stem: string): string[] {
  const out = [stem];
  if (stem.length - 1 < STEM_MIN_LETTERS) return out;
  if (stem.endsWith("e")) out.push(stem.slice(0, -1));
  if (/[^aeiou]y$/.test(stem)) out.push(`${stem.slice(0, -1)}i`);
  if (/[^aeiou]i$/.test(stem)) out.push(`${stem.slice(0, -1)}y`);
  return out;
}

export interface KeywordCheck {
  present: string[];
  missing: string[];
  all: boolean;
}

/**
 * TeX as it would be typed: "$\dfrac{ad-bc}{bd}$" is "(ad-bc)/(bd)", "$\log(ab)$" is "log(ab)", "$y \, dx$" is "y dx",
 * "$4x^{-2}$" is "4x^-2", "$2\sqrt{5}$" is "2√5". Text with no TeX is returned as it was.
 */
function texAsTyped(s: string): string {
  if (!/[$\\]/.test(s)) return s;
  let t = s.replace(/\$/g, " ").replace(/\\left|\\right/g, "");
  for (let i = 0; i < 6 && /\\[dt]?frac\s*\{/.test(t); i += 1) t = t.replace(/\\[dt]?frac\s*\{([^{}]*)\}\s*\{([^{}]*)\}/g, "($1)/($2)");
  return t
    .replace(/\^\s*\{?\s*\\circ\s*\}?/g, "°")
    .replace(/_\{?([A-Za-z0-9]+)\}?/g, "$1")
    .replace(/\\sqrt\s*\{([^{}]*)\}/g, "√$1")
    .replace(/\\(?:text|mathrm|mathbf|operatorname)\s*\{([^{}]*)\}/g, "$1")
    .replace(/\\times\b|\\cdot\b/g, "×")
    .replace(/\\div\b/g, "÷")
    .replace(/\\pm\b/g, "±")
    .replace(/\\pi\b/g, "π")
    .replace(/\\[,;:! ]/g, " ")
    .replace(/\^\{([^{}]*)\}/g, "^$1")
    .replace(/_\{([^{}]*)\}/g, "_$1")
    .replace(/\\([A-Za-z]+)/g, " $1 ")
    .replace(/[{}]/g, " ");
}

/**
 * Which key words / phrases appear in the answer (case-insensitive, punctuation-blind). For the retrieval prompt's
 * chips, which award nothing: TeX on either side is read as typed, and the spacing round an operator between letters
 * is ignored as it is between numbers ("ad - bc" is in "(ad-bc)/(bd)"; the QA fixer and trial audit MK-16, 25 Sep 2026).
 */
export function keywordsPresent(raw: string, keyWords: readonly string[]): KeywordCheck {
  // A spaced dash in prose ("$(3x+1)(3x-1)$ — a square minus a square") is a pause, not a minus to glue to the maths.
  const h = normaliseText(texAsTyped(raw).replace(/\s[—–]\s/g, ", "));
  // With the operators closed up, a minus between letters is read as normaliseText reads it, a space ("a-b" is "a b").
  const chip = (s: string) => compactOperators(s).replace(/([a-z])-(?=[a-z])/g, "$1 ");
  const tight = ` ${compactOperators(h)} `;
  const chipped = ` ${chip(h)} `;
  // The expression's tokens, its operators and brackets as spaces: a key word with no operator of its own is present
  // when it is one of them, the base or the exponent of a power included ("10" in "a = 10^c" or "10^{c}"; the FM1
  // author, 7 Oct 2026: a right line that wrote the base as a power earned nothing on the key-word route).
  const tokens = ` ${h.replace(/[\^*/+\-=()×{}]/g, " ").replace(/\s+/g, " ").trim()} `;
  // Braces and spacing aside: "$X = A^{-1}B$" holds "A^-1 B" once both are squashed to one stream, the match standing on
  // its own (no letter or digit against either end; the FM1 author, 7 Oct 2026).
  const squash = (s: string) => s.replace(/[{}\s]/g, "");
  const squashed = squash(h);
  const squashedHolds = (key: string) => {
    const k = squash(key);
    if (k.length === 0) return false;
    for (let at = squashed.indexOf(k); at >= 0; at = squashed.indexOf(k, at + 1)) {
      const before = squashed[at - 1] ?? "";
      const after = squashed[at + k.length] ?? "";
      if (!/[a-z0-9]/i.test(before) && !/[a-z0-9]/i.test(after)) return true;
    }
    return false;
  };
  const present: string[] = [];
  const missing: string[] = [];
  for (const k of keyWords) {
    const key = normaliseText(texAsTyped(k));
    // A minus between letters reads as a hyphen in normaliseText ("ad-bc" → "ad bc"), so a key word with one is also
    // looked for that way.
    const found =
      phraseIn(h, key) ||
      (/[+\-/^*]/.test(key) && (tight.includes(` ${compactOperators(key)} `) || chipped.includes(` ${chip(key)} `) || squashedHolds(key))) ||
      (/[a-z]\s*-\s*[a-z]/.test(key) && phraseIn(h, key.replace(/([a-z])\s*-\s*(?=[a-z])/g, "$1 "))) ||
      (!/[+\-/^*=()]/.test(key) && tokens.includes(` ${key} `));
    (found ? present : missing).push(k);
  }
  return { present, missing, all: keyWords.length > 0 && missing.length === 0 };
}

/** A listed item is a few words at most; anything longer is a clause of prose, not an extra answer. */
const LIST_ITEM_MAX_WORDS = 4;

/**
 * Count of listed items in an answer ("a, b and c" → 3) for the CCEA listing rule. The rule punishes hedging
 * ("nucleus, cytoplasm, vacuole, cell wall" when two were asked for), so it only counts when the answer is
 * list-shaped: every segment between commas, semicolons, slashes, "and" and "or" is at most a few words. A
 * sentence such as "it is waterlogged and cold, so there is no oxygen" is one answer, not four.
 */
/** A segment that opens like this continues the previous clause ("the sun, captured by the leaves"), so it is not an item. */
const CLAUSE_OPENER = /^(?:which|that|who|whose|where|when|while|because|since|so|then|as|but|if|by|with|without|for|from|to|in|on|at|of|into|through|via|using|giving|making|meaning|causing|captured|carried|stored|passed|released|absorbed|produced|formed|made|found|taken|given|left|held|kept|not|no)\b/i;

export function countListedItems(raw: string): number {
  return listedItems(raw).length;
}

/**
 * The listed items of a list-shaped answer (see countListedItems); an answer that is prose is one item. Single capital
 * letters separated by spaces, commas, slashes or plus signs are each an item ("B D E"; B2 D, 25 Sep 2026: counted as
 * one).
 */
export function listedItems(raw: string): string[] {
  const t = raw.trim();
  if (/^[A-Z](?:\s*[\s,/+&]\s*[A-Z])+$/.test(t)) return t.split(/[\s,/+&]+/).filter(Boolean);
  // A comma inside brackets is part of the item ("(4, 0) and (1, 0)" is two coordinates, not four numbers).
  const masked = raw.replace(/\([^()]*\)/g, (m) => m.replace(/,/g, "\u0000"));
  const segments = masked
    .split(/\n|;|,|\band\b|\bor\b|\//i)
    .map((p) => p.replace(/\u0000/g, ","))
    .map((p) => p.trim())
    .filter((p) => p.length > 0);
  // A long segment anywhere makes the whole answer prose; a short clause that continues the previous one is not an item.
  if (segments.some((s) => s.split(/\s+/).length > LIST_ITEM_MAX_WORDS)) return [t];
  const items = segments.filter((p, i) => i === 0 || !CLAUSE_OPENER.test(p));
  // An apposition naming the class of the answer ("argon, a noble gas"; "helium, which is inert") is one answer, not a
  // list: a list is two candidates of the same kind (the C2 E author, 7 Oct 2026).
  if (items.length === 2 && /^(?:a|an|which|that)\s/i.test(items[1]!) && !/^(?:a|an|the)\s/i.test(items[0]!)) return [t];
  // A name and a formula side by side are one answer (C2 D F04, 24 Sep 2026: "ethanol, C2H5OH" was two). CCEA's general
  // marking instructions (C2 Higher MS Summer 2021, "Both name and formula provided by candidate"): where a name is
  // asked for the formula beside it is ignored, and where a formula is asked for the name beside it is ignored. Only a
  // pair is read so: in a longer list a formula may be one more answer.
  if (items.length === 2 && items.filter(isFormula).length === 1) return [t];
  return items;
}

/**
 * A chemical formula as typed: element symbols with counts, brackets, a hydrate dot or bonds ("C2H5OH", "Mg(NO3)2",
 * "CH2=CHCH3", "CuSO4.5H2O"). It must hold a digit or two element symbols, so a capitalised word ("Propene") and a
 * lone letter are not formulae.
 */
/**
 * A name given with its formula as one answer: "Propene (C3H6)", "propene, C3H6", "C3H6 (propene)", "propene / C3H6".
 * Null unless the answer is exactly two parts and exactly one of them is a formula.
 */
export function nameWithFormula(raw: string): { name: string; formula: string } | null {
  const t = raw.trim().replace(/[.!]+$/, "");
  const m = /^(.+?)\s*\(([^()]+)\)$/.exec(t) ?? /^([^,/]+?)\s*[,/]\s*([^,/]+)$/.exec(t);
  if (!m) return null;
  const [a, b] = [m[1]!.trim(), m[2]!.trim()];
  if (isFormula(a) === isFormula(b)) return null;
  const [name, formula] = isFormula(a) ? [b, a] : [a, b];
  // The other side must be a name: a word of three letters or more and no formula in it (gate 2, 11 Oct 2026). A unit
  // ("Cm3/s", where Cm is curium, read as "Cm3" beside the name "s"), a formula's own bracket ("CnH(2n+2)") and a list
  // of formulae ("Mg(C3H7COO)2, H2O and CO2") are not a name given with its formula.
  if (!/[A-Za-z]{3,}/.test(name) || name.split(/[\s,;+]+/).some((w) => w.length > 0 && isFormula(w))) return null;
  return { name, formula };
}

/**
 * A formula typed with spaces between its element groups, closed up: "C12 H26" is "C12H26", "Na Cl" is "NaCl". Only runs
 * of element groups (a capital, an optional small letter, an optional count) close up; a word ("and", "is") stops it.
 */
export function closeFormulaGroups(raw: string): string {
  return raw.replace(/\b[A-Z][a-z]?\d*(?:\s+[A-Z][a-z]?\d*)+\b/g, (run) => {
    const groups = run.split(/\s+/);
    return groups.every((g) => ELEMENT_SYMBOLS.has(g.replace(/\d+$/, ""))) ? groups.join("") : run;
  });
}

/** The element symbols: a formula is made of these and nothing else, so "TB", "DNA" and "MRSA" are abbreviations, not formulae. */
const ELEMENT_SYMBOLS = new Set(
  "H He Li Be B C N O F Ne Na Mg Al Si P S Cl Ar K Ca Sc Ti V Cr Mn Fe Co Ni Cu Zn Ga Ge As Se Br Kr Rb Sr Y Zr Nb Mo Tc Ru Rh Pd Ag Cd In Sn Sb Te I Xe Cs Ba La Ce Pr Nd Pm Sm Eu Gd Tb Dy Ho Er Tm Yb Lu Hf Ta W Re Os Ir Pt Au Hg Tl Pb Bi Po At Rn Fr Ra Ac Th Pa U Np Pu Am Cm Bk Cf Es Fm Md No Lr Rf Db Sg Bh Hs Mt Ds Rg Cn Nh Fl Mc Lv Ts Og".split(
    " ",
  ),
);

export function isFormula(segment: string): boolean {
  const t = segment
    .trim()
    .replace(/[₀-₉]/g, (c) => String("₀₁₂₃₄₅₆₇₈₉".indexOf(c)))
    .replace(/\s+/g, "");
  if (!/^(?:[A-Z][a-z]?\d*|\(|\)\d*|[=≡.·-])+$/.test(t)) return false;
  // Every symbol an element (the B2 E author, 7 Oct 2026: "lung cancer and TB" was one answer, TB read as a formula
  // beside a name, and the listing rule never fired).
  if (!(t.match(/[A-Z][a-z]?/g) ?? []).every((sym) => ELEMENT_SYMBOLS.has(sym))) return false;
  return /\d/.test(t) || (t.match(/[A-Z]/g) ?? []).length >= 2;
}

/**
 * A hydrocarbon's condensed formula in one spelling for either end: "CH2=CHCH3", "CH3CH=CH2", "H2C=CHCH3" and
 * "CH3-CH=CH2" are all the same (C2 D F11, 24 Sep 2026: the formula written from the other end was refused). The
 * carbon groups are read in order ("CH3", "CH", "=", "CH2"; a group written hydrogen first, "H2C", is "CH2") and the
 * smaller of the forward and reversed spellings is the key. Null for anything that is not a chain of two or more
 * carbon groups of carbon and hydrogen only, which is left to be matched as written.
 */
export function hydrocarbonKey(s: string): string | null {
  const t = s
    .trim()
    .replace(/[₀-₉]/g, (c) => String("₀₁₂₃₄₅₆₇₈₉".indexOf(c)))
    .replace(/[-–—−]/g, "");
  if (!/^(?:H\d*C|C(?:H\d*)?|=|≡)+$/.test(t)) return null;
  const groups = (t.match(/H\d*C|C(?:H\d*)?|=|≡/g) ?? []).map((g) => (/^H(\d*)C$/.test(g) ? `CH${g.slice(1, -1)}` : g));
  if (groups.filter((g) => g.startsWith("C")).length < 2) return null;
  const forward = groups.join("");
  const reversed = [...groups].reverse().join("");
  return forward < reversed ? forward : reversed;
}

/** Does the answer hold the hydrocarbon key word, written from either end? */
function hydrocarbonIn(raw: string, keyWord: string): boolean {
  const key = hydrocarbonKey(keyWord);
  if (key === null) return false;
  return raw.split(/[\s,;:()]+/).some((token) => token.length > 0 && hydrocarbonKey(token.replace(/[.!?]+$/, "")) === key);
}

/**
 * The alternatives of a hedge: an answer, or one clause of it, that offers short answers joined by "or" or a slash
 * ("poly(ethene) or poly(ethane)", "ethene/ethane"). A clause with a long alternative is prose, not a hedge; a slash
 * in a clause with a number in it is a unit ("g/cm³"), not a hedge.
 */
function hedges(raw: string): string[][] {
  const out: string[][] = [];
  // A long alternative is still an alternative ("had a mutation or became immune"), and a reason after "because" is a
  // clause of its own (B2 D, 25 Sep 2026). Only a named wrong answer among them costs anything (markText).
  for (const clause of raw.split(/\n|;|,|\b(?:because|since|so|as)\b/i)) {
    const parts = clause
      .split(/\d/.test(clause) ? /\s+or\s+/i : /\s+or\s+|\s*\/\s*/i)
      .map((p) => p.trim())
      .filter((p) => p.length > 0);
    if (parts.length >= 2) out.push(parts);
  }
  return out;
}

export interface TextMarkResult {
  correct: boolean;
  marksAwarded: number;
  marksAvailable: number;
  /** Indices into spec.keyWords of the groups that earned their marks. */
  matchedGroups: number[];
  /** Reject words that were found. */
  rejected: string[];
  feedback: string;
}

/**
 * The negation model (build-9 gate, 29 Sep 2026). Three kinds of word change what the key word after them says:
 *   - a plain negator denies it ("not resistant", "no colonies", "cannot fit", "non-resistant");
 *   - an avoidance verb says the event after it does not happen ("to prevent contamination", "stop microorganisms
 *     landing on the agar");
 *   - a reduction word says the quantity after it is smaller, not absent ("reduces her risk by 21%", "carry less
 *     oxygen"): a reduction is never a denial.
 * Each governs its own verb phrase only, and an avoidance or reduction that is itself negated ("does not reduce
 * contamination", "does not stop microorganisms getting in") denies the avoidance: the harm is not kept off. Two plain
 * negators on the same verb are a positive.
 */
const PLAIN_NEGATOR = /^(?:not|no|never|none|nor|neither|without|non|cannot)$/;
const AVOIDANCE = /^(?:prevents?|prevented|preventing|stops?|stopped|stopping|avoids?|avoided|avoiding)$/;
const REDUCTION = /^(?:reduces?|reduced|reducing|lowers?|lowered|lowering|decreases?|decreased|decreasing|lessens?|lessened|lessening|less|fewer|minimi[sz]es?|minimi[sz]ed|minimi[sz]ing)$/;
/** Any of the three. */
const OPERATOR = new RegExp(`${PLAIN_NEGATOR.source}|${AVOIDANCE.source}|${REDUCTION.source}`);
/** Helping verbs and pronouns that may stand between a plain negator and the verb it governs ("does not reduce"). */
const BETWEEN = /^(?:do|does|did|will|would|could|can|should|may|might|must|to|be|is|are|was|were|has|have|had|been|being|it|this|they|them|even|really|actually|always|ever|still)$/;

/** The clauses of an answer: a negation governs only its own clause ("it is not continuous, so it is discontinuous"). */
function clausesOf(raw: string): string[] {
  return raw.split(/[.;:!?,\n]|\b(?:but|because|so|although|whereas|however|while|though|since|therefore|and then)\b/i).filter((c) => c.trim().length > 0);
}

/**
 * Words that end a negation's reach inside a clause: a coordinating word starts a new verb phrase ("light isn't
 * obstructed and can reach the chloroplasts"; "copper has no free electrons and the rubber has free electrons").
 */
// A subordinator opening a time or condition clause ("after heating it again", "until the mass did not change") ends a
// negator's reach as a conjunction does: the clause is outside the negated verb phrase and carries its own key (the
// Unit 7 author, 7 Oct 2026: "the mass did not change after heating it again" lost the heating mark).
const NEGATION_ENDS = /^(?:and|which|who|whom|whose|where|when|then|also|yet|nor|after|before|until|while|once|unless|if|because|since)$/;
/**
 * A preposition before a determiner starts a phrase the negation is not about: "not complementary to the active
 * site" negates "complementary", not "the active site"; "no light is blocked on its way to the palisade cells".
 * "Not need to be pure" is an infinitive, not a phrase, and stays negated.
 */
const PREPOSITION = /^(?:to|on|in|into|onto|at|from|with|by|for|through|towards?|across|inside|within)$/;
const DETERMINER = /^(?:the|a|an|its|their|his|her|this|that|these|those|each|every|some|any|all|both|our|your)$/;

/** A noun naming the chance of an event: "no risk of …" says the event is avoided (G2-17). */
const RISK_NOUN = /^(?:risk|risks|chance|chances|danger|dangers|possibility|likelihood|threat)$/;

/** What her words say about a key word: see the model above. */
type Polarity = "plain" | "negated" | "avoided" | "reduced" | "denied";
/** A key word's polarity in one place, with the words its operator reaches (the event it names). */
interface Governor {
  polarity: Polarity;
  reach: string[];
}
/** The polarities that assert the key word: said plainly, said smaller, or said not to be avoided. */
const ASSERTS: ReadonlySet<Polarity> = new Set<Polarity>(["plain", "reduced", "denied"]);

/** The words an operator at `from − 1` governs: up to the end of its verb phrase. */
function reachFrom(words: readonly string[], from: number): string[] {
  const out: string[] = [];
  for (let j = from; j < words.length; j++) {
    const w = words[j]!;
    if (NEGATION_ENDS.test(w)) break;
    if (PREPOSITION.test(w) && DETERMINER.test(words[j + 1] ?? "")) break;
    out.push(w);
  }
  return out;
}

/**
 * What the words before position `at` say about the word there, read back within its own verb phrase (the reach ends
 * at "and", "which", …, at a preposition before a determiner, or at the clause's start): the nearest operator decides,
 * and its own negation, a plain negator just before it with helping verbs between, turns an avoidance or reduction
 * into a denial and a plain negator into a positive.
 */
function governorAt(words: readonly string[], at: number): Governor {
  let op: { kind: "plain" | "avoid" | "reduce"; index: number } | null = null;
  let determiners = 0;
  for (let j = at - 1; j >= 0 && op === null; j--) {
    const w = words[j]!;
    if (NEGATION_ENDS.test(w)) break;
    if (PREPOSITION.test(w) && DETERMINER.test(words[j + 1] ?? "")) break;
    if (DETERMINER.test(w)) determiners += 1;
    // "Without" governs its own object only ("without light"): a determiner between it and the key starts another phrase
    // ("Without light the leaf cannot photosynthesise" says nothing against "cannot photosynthesise"; the corpus guard,
    // 29 Sep 2026).
    if (w === "without" && determiners > 0) break;
    if (PLAIN_NEGATOR.test(w)) op = { kind: "plain", index: j };
    else if (AVOIDANCE.test(w)) op = { kind: "avoid", index: j };
    else if (REDUCTION.test(w)) op = { kind: "reduce", index: j };
  }
  if (op === null) return { polarity: "plain", reach: [] };
  const negated = operatorNegated(words, op.index);
  const reach = reachFrom(words, op.index + 1);
  // No risk, no chance, no danger of an event is the event avoided (gate 2, G2-17, 11 Oct 2026: "so there is no risk of
  // electrocution" was read as a plain denial of "electrocution" and refused on the point "so it cannot give a shock").
  if (op.kind === "plain" && !negated && RISK_NOUN.test(words[op.index + 1] ?? "") && words[op.index + 2] === "of") return { polarity: "avoided", reach };
  if (op.kind === "plain") return { polarity: negated ? "plain" : "negated", reach };
  if (negated) return { polarity: "denied", reach };
  return { polarity: op.kind === "avoid" ? "avoided" : "reduced", reach };
}

/** One word is a form of another: "lowers" of "lower", "carries" of "carry", "stopped" of "stop", "killed" of "kill". */
function wordForm(w: string, first: string): boolean {
  if (w === first) return true;
  if (!/^[a-z]+$/.test(w) || !/^[a-z]+$/.test(first)) return false;
  if (phraseIn(w, first) || phraseIn(first, w)) return true;
  const stem = first.length >= 5 ? first.replace(/(?:es|s|e|ed|ing)$/, "") : first;
  return w.length > stem.length + 1 && w.startsWith(`${stem}${stem.slice(-1)}`) && INFLECTIONS.has(w.slice(stem.length + 1));
}

/** Where a key word starts in a clause's words: its first word in any of its forms, the rest of the key following. */
function keyStarts(words: readonly string[], key: string): number[] {
  const kWords = normaliseText(key).split(" ");
  const first = kWords[0] ?? "";
  const k = kWords.join(" ");
  return words.map((_, p) => p).filter((p) => wordForm(words[p]!, first) && phraseIn(words.slice(p, p + kWords.length).join(" "), k));
}

/** The normalised clauses of a text, kept between calls: the model answers are read for every key. */
const CLAUSE_CACHE = new Map<string, string[][]>();
function normalisedClauses(raw: string): string[][] {
  let c = CLAUSE_CACHE.get(raw);
  if (!c) {
    c = clausesOf(raw).map((clause) => normaliseText(clause).split(" "));
    if (CLAUSE_CACHE.size > 512) CLAUSE_CACHE.clear();
    CLAUSE_CACHE.set(raw, c);
  }
  return c;
}

/** The polarity of every place the key word stands in the text; empty where it is absent or cannot be pinned. */
/**
 * An operator's own negation: a plain negator before it with helping verbs between ("does not reduce"), or a "no" on the
 * verb's subject ("no dose reduces her risk", "nothing stops them"): one subject word may stand between.
 */
function operatorNegated(words: readonly string[], opIndex: number): boolean {
  let skipped = 0;
  for (let j = opIndex - 1; j >= 0; j--) {
    const w = words[j]!;
    if (PLAIN_NEGATOR.test(w)) return true;
    if (NEGATION_ENDS.test(w) || OPERATOR.test(w)) break;
    if (!BETWEEN.test(w) && ++skipped > 1) break;
  }
  return false;
}

function polarities(raw: string, key: string): Governor[] {
  const out: Governor[] = [];
  const k = normaliseText(key);
  const kWords = k.split(" ");
  // A key that carries its own operator ("did not photosynthesise", "no starch", "carry less oxygen") states its own
  // polarity: her words that hold it say what it says, whatever negation stands earlier in the sentence ("Because it
  // did not get light it did not photosynthesise"), and only a negation of the key's own operator ("does not carry
  // less oxygen") or of its subject negates it (the Unit 7 author, 7 Oct 2026: the earlier "not" was read as
  // governing the key, and a right answer lost a mark).
  const ownOp = kWords.findIndex((w) => OPERATOR.test(w));
  for (const words of normalisedClauses(raw)) {
    if (!phraseIn(words.join(" "), k)) continue;
    for (const at of keyStarts(words, key)) {
      if (ownOp < 0) {
        out.push(governorAt(words, at));
        continue;
      }
      let opAt = at + ownOp;
      if (!OPERATOR.test(words[opAt] ?? "")) opAt = words.findIndex((w, i) => i >= at && i < at + kWords.length + 2 && OPERATOR.test(w));
      if (opAt < 0) {
        out.push(governorAt(words, at));
        continue;
      }
      // A negation of the key's own operator ("doesn't lower cholesterol" against the reject "lowers cholesterol"), or a
      // negator quantifying the key's own subject ("none of the non-resistant bacteria survived"), negates the key's
      // whole statement: "negated", never the "denied" that a plain key takes as asserted. A negator further back,
      // with a new subject between ("did not get light it did not photosynthesise"), belongs to another verb phrase.
      const quantified = (() => {
        for (let j = at - 1; j >= 0; j--) {
          const w = words[j]!;
          if (PLAIN_NEGATOR.test(w)) return true;
          if (!(DETERMINER.test(w) || PREPOSITION.test(w) || w === "of")) return false;
        }
        return false;
      })();
      out.push({ polarity: operatorNegated(words, opAt) || quantified ? "negated" : "plain", reach: reachFrom(words, opAt + 1) });
    }
  }
  return out;
}

/**
 * The model negates the key word itself, not a word before it: a plain negator next to the key with only an article, a
 * copula or an adverb between ("are not complementary", "is not a fair comparison", "no enzyme"). An avoidance verb
 * ("to avoid growing pathogens", "stop microorganisms from the air landing") names the harm, and never makes a plain
 * mention of it a contradiction.
 */
function negatesKeyItself(raw: string, key: string): boolean {
  const k = normaliseText(key);
  for (const words of normalisedClauses(raw)) {
    if (!phraseIn(words.join(" "), k)) continue;
    for (const at of keyStarts(words, key)) {
      for (let j = at - 1; j >= 0; j--) {
        const w = words[j]!;
        if (PLAIN_NEGATOR.test(w)) return true;
        if (!/^(?:a|an|the|be|been|being|is|are|was|were|very|fully|quite|so|as|any|at|all|of|longer)$/.test(w)) break;
      }
    }
  }
  return false;
}

/** Words too common to name a subject. */
const NOT_A_SUBJECT = new Set(["this", "that", "they", "them", "their", "there", "these", "those", "with", "from", "have", "been", "were", "what", "when", "which", "also", "only", "then", "than", "into", "each", "very", "more", "most", "some", "such", "will", "would", "could", "should", "does", "done", "make", "made", "because", "cannot"]);

/**
 * The words naming what a key word is said of, in the clauses that hold it: the content words before the key (four
 * letters or more, cut to their first four), operator words aside. "The shapes of B and C are not complementary" gives
 * {shap}; "the comparison is fair" gives {comp}.
 */
function subjectBefore(raw: string, key: string): Set<string> {
  const k = normaliseText(key);
  const out = new Set<string>();
  for (const words of normalisedClauses(raw)) {
    if (!phraseIn(words.join(" "), k)) continue;
    const at = keyStarts(words, key)[0] ?? -1;
    for (const w of words.slice(0, at < 0 ? words.length : at)) if (w.length >= 4 && !OPERATOR.test(w) && !NOT_A_SUBJECT.has(w)) out.add(w.slice(0, 4));
  }
  return out;
}

export interface MarkTextOptions {
  /**
   * Named wrong answers (the part's common errors written as text patterns). One offered beside the right answer in a
   * hedge cancels the mark the right answer would earn (C2 D F12, 24 Sep 2026: "poly(ethene) or poly(ethane)" was paid).
   */
  wrongAnswers?: readonly RegExp[];
  /**
   * The model answer (the accepted answers and the worked solution). Where it states a key word inside a negation
   * itself ("the shapes are not complementary"), the negation is the point, and her negated key word earns as it does.
   */
  model?: readonly string[];
  /**
   * For each key-word group, the groups it depends on (indices), from the mark scheme's `dependsOn` (mark.ts
   * `groupDependencies`): a group earns only when every group it depends on has earned, as CCEA's "dep" marks do.
   */
  dependsOn?: ReadonlyArray<readonly number[]>;
}

/**
 * How a key-word group is named in her feedback: its first entry's first spelling. An entry may hold one idea in several
 * spellings joined by "|" (author-topic.md "Phrases match word for word"), and the bars are the engine's notation, never
 * hers to read (the lead's note of 11 Oct 2026: "still missing thins the blood|thin the blood|…" on b2-heart-attacks-strokes
 * .0004(c)). Display only.
 */
export function ideaLabel(group: { any: readonly string[] }): string {
  const first = group.any[0] ?? "";
  const label = (first.split("|").find((s) => s.trim().length > 0) ?? first).trim();
  // A key written in TeX reads as she writes it: "x \le -3" is "x ≤ -3" (gate 2's mutation check, 11 Oct 2026: the FM1
  // quadratic-inequalities feedback printed "Expected: x \le -3, x \ge 4.").
  return label
    .replace(/\\text\s*\{([^{}]*)\}/g, "$1")
    .replace(/\\(?:leqslant|leq|le)(?![a-z])/g, "≤")
    .replace(/\\(?:geqslant|geq|ge)(?![a-z])/g, "≥")
    .replace(/\\(?:neq|ne)(?![a-z])/g, "≠")
    .replace(/\\lt(?![a-z])/g, "<")
    .replace(/\\gt(?![a-z])/g, ">")
    .replace(/\s+/g, " ")
    .trim();
}

export function markText(raw: string, spec: TextSpec, opts: MarkTextOptions = {}): TextMarkResult {
  const answer = normaliseText(raw);
  const groups = spec.keyWords;
  const marksAvailable = groups.length > 0 ? groups.reduce((a, g) => a + g.marks, 0) : 1;

  if (answer.length === 0) {
    return { correct: false, marksAwarded: 0, marksAvailable, matchedGroups: [], rejected: [], feedback: "Type an answer first." };
  }

  // An accepted answer made of allele letters ("B and b", "Bb") is the accepted answer only with its letters' case: "B
  // and B" is not the Bb pony's gametes (the B2 author, 8 Oct 2026).
  const ALLELE_ANSWER = /^(?:([a-z])(?:\s*(?:and|or|,|\/)\s*\1)+|([a-z])\2)$/i;
  const alleleCase = (a: string) => (ALLELE_ANSWER.test(a.trim()) ? [...(a.match(/[A-Za-z]/g) ?? [])].sort().join("") : null);
  const rawLetters = [...(raw.match(/[A-Za-z]/g) ?? [])].sort().join("");
  if (spec.accepted.some((a) => normaliseText(a) === answer && (alleleCase(a) === null || alleleCase(a) === rawLetters))) {
    return {
      correct: true,
      marksAwarded: marksAvailable,
      marksAvailable,
      matchedGroups: groups.map((_, i) => i),
      rejected: [],
      feedback: "That is the accepted answer.",
    };
  }

  const matchedGroups: number[] = [];
  const rejected: string[] = [];
  let marks = 0;
  // The key word each paid group was paid for (normalised), and a named slip found inside paid words (G2-02).
  const paidBy = new Map<number, string>();
  let namedSlip: string | null = null;
  // A key word earns one group only. "Give two symptoms" is written as two groups with the same list, and a
  // single symptom must not collect both marks; two groups that merely overlap are handled the same way.
  const used = new Set<string>();
  const model = [...spec.accepted, ...(opts.model ?? [])];
  const entriesOf = (g: TextSpec["keyWords"][number]) => g.any.flatMap((entry) => entry.split("|"));
  const hasOperator = (t: string) => normaliseText(t).split(" ").some((w) => OPERATOR.test(w));
  /**
   * The group's point is a harm avoided, a quantity reduced or a fact denied: one of its entries says so ("cannot carry
   * oxygen", "carry less oxygen", "not on the streak"), or the model says so of one of them ("to stop microorganisms
   * from the air landing", "to avoid growing pathogens", "so they do not contaminate"). On such a point her plain
   * mention names the risk and earns (E-NEG-POINT), and so do her avoidance and her reduction; her denial of the
   * avoidance ("does not reduce contamination") does not.
   */
  const avoidedGroups = new Map<number, boolean>();
  const groupAvoided = (i: number, g: TextSpec["keyWords"][number]): boolean => {
    let v = avoidedGroups.get(i);
    if (v === undefined) {
      const entries = entriesOf(g);
      v = entries.some(hasOperator) || entries.some((e) => model.some((m) => polarities(m, e).some((p) => p.polarity !== "plain")));
      avoidedGroups.set(i, v);
    }
    return v;
  };
  /**
   * The model negates the key word itself ("their shapes are not complementary", "so they do not contaminate"): the
   * negation is the point both ways: her negated key earns, her plain one contradicts. And only about the same
   * subject: the model's "the number who became ill is not a fair comparison" says nothing against her "a percentage
   * lets you compare fairly" (the B2 E author, 29 Sep 2026). A bare key word has no subject of its own and meets the
   * model's.
   */
  const negationIsThePoint = (k: string, text?: string): boolean => {
    const kn = normaliseText(k);
    const saying = model.filter((m) => phraseIn(normaliseText(m), kn));
    if (saying.length === 0) return false;
    // Every place the model says the key is governed, and one of them is the key itself under a plain negator
    // (negatesKeyItself): an avoidance next to it ("stop microorganisms from the air landing") names a harm, not a negation.
    if (!saying.every((m) => negatesKeyItself(m, k) && polarities(m, k).every((p) => p.polarity === "negated" || p.polarity === "avoided"))) return false;
    if (text === undefined) return true;
    const hers = subjectBefore(text, k);
    if (hers.size === 0) return true;
    return saying.some((m) => [...subjectBefore(m, k)].some((w) => hers.has(w)));
  };
  const pointKind = (i: number, g: TextSpec["keyWords"][number], k: string, text: string): "negated" | "avoided" | "plain" =>
    negationIsThePoint(k, text) ? "negated" : groupAvoided(i, g) ? "avoided" : "plain";
  /**
   * Her negated key on an avoided point earns in two cases: an entry of the group is that very negation ("not on the
   * streak" for her "no colonies on the streak"; "cannot carry oxygen" for her "not carrying oxygen"), read word for word
   * with the operator words and determiners off; or the event she denies is the event the model avoids ("no harmful
   * bacteria can grow" against "to avoid growing pathogens": both name growing). A key that is itself a reduction or an
   * avoidance ("reduce contamination", "carry less oxygen") denied by her "not" is a denial, never waived.
   */
  const waived = (g: TextSpec["keyWords"][number], k: string, hers: readonly Governor[]): boolean => {
    if (hasOperator(k)) return false;
    const strip = (t: string) => normaliseText(t).split(" ").filter((w) => !OPERATOR.test(w) && !DETERMINER.test(w));
    const stem = (w: string) => (w.length <= 3 ? w : w.slice(0, 4));
    const same = (a: string[], b: string[]) => a.length === b.length && a.every((w, i) => stem(w) === stem(b[i]!));
    const mine = strip(k);
    const entries = entriesOf(g);
    // Exactly one operator in the entry: "non resistant bacteria cannot survive" negates the resistance and the
    // surviving both, and is not her "non-resistant bacteria survived" (b2-natural-selection .0011(b)).
    const operators = (t: string) => normaliseText(t).split(" ").filter((w) => OPERATOR.test(w)).length;
    if (entries.some((e) => operators(e) === 1 && same(strip(e), mine))) return true;
    // The point is a plain negation the model states of a sibling word of the group ("their shapes are not
    // complementary" for the group "shape|complementary"): her negation of the sibling ("the active site is not the
    // right shape") says the same. Only a plain negator in the model, never an avoidance ("to avoid growing pathogens"
    // makes her "do not cause disease" no point), and only of an entry that carries no operator of its own.
    if (entries.some((e) => !hasOperator(e) && model.some((m) => negatesKeyItself(m, e) && polarities(m, e).some((p) => p.polarity === "negated")))) return true;
    const content = (ws: readonly string[], except: readonly string[]) => new Set(ws.filter((w) => w.length >= 4 && !OPERATOR.test(w) && !except.includes(w) && !NOT_A_SUBJECT.has(w)).map(stem));
    const kw = normaliseText(k).split(" ");
    const herEvents = new Set(hers.filter((h) => h.polarity === "negated").flatMap((h) => [...content(h.reach, kw)]));
    if (herEvents.size === 0) return false;
    return entries.some((e) => {
      const ew = normaliseText(e).split(" ");
      return model.some((m) => polarities(m, e).some((p) => p.polarity !== "plain" && [...content(p.reach, ew)].some((s) => herEvents.has(s))));
    });
  };
  /** Does the key word, as she wrote it, say what the group's point says? */
  const keyEarns = (text: string, i: number, g: TextSpec["keyWords"][number], k: string): boolean => {
    // A formula typed with spaces between its element groups is the formula ("C12 H26" for C12H26; gate 2, G2-11, the C2
    // author's EF-12): for a formula key the groups are closed up before the phrase is looked for.
    if (!phraseIn(normaliseText(text), normaliseText(k)) && !(isFormula(k) && phraseIn(normaliseText(closeFormulaGroups(text)), normaliseText(k)))) return false;
    const ps = polarities(text, k);
    // A key that cannot be pinned (an algebraic key, a spelling normalised apart) is read as written.
    if (ps.length === 0) return true;
    const kind = pointKind(i, g, k, text);
    if (kind === "negated") return ps.every((p) => p.polarity === "negated" || p.polarity === "avoided");
    if (kind === "avoided") return ps.some((p) => p.polarity === "plain" || p.polarity === "reduced" || p.polarity === "avoided") || (ps.some((p) => p.polarity === "negated") && waived(g, k, ps));
    return ps.some((p) => ASSERTS.has(p.polarity));
  };
  // A group's key word is in a piece of the answer as written or, for a hydrocarbon's condensed formula, from either end,
  // and says what the point says. An entry written "cheaper|costs less" is one idea in several spellings.
  /**
   * A key word made of allele letters (single letters joined by and/or/comma, or an allele pair such as Bb) is matched
   * case-sensitively against the accepted answers' letters, in either order and with any joiner: B and b is the Bb
   * pony's gametes, B and B is not (the B2 author, 8 Oct 2026; CCEA's 2024 Foundation scheme). Ordinary words stay
   * case-insensitive. A key with no cased accepted answer behind it is read as before.
   */
  // An allele key is one letter in two cases or repeated (Bb, bb, BB, Tt), or single letters of that one letter joined
  // by and/or/comma ("B and b"); two different letters ("YZ", "BC") are a name and stay case-insensitive (the M8 author,
  // 8 Oct 2026: "YZ" lost its key word to this rule).
  const ALLELE_KEY = /^(?:([a-z])(?:\s*(?:and|or|,|\/)\s*\1)+|([a-z])\2)$/i;
  const alleleLetters = (t: string, pair: boolean): string | null => {
    const found = pair ? t.match(/\b[A-Za-z]{2}\b/g) : t.match(/\b[A-Za-z]\b/g);
    if (!found) return null;
    return [...found.join("")].sort().join("");
  };
  const alleleCaseOk = (text: string, k: string): boolean => {
    if (!ALLELE_KEY.test(k.trim())) return true;
    const pair = /^[a-z]{2}$/i.test(k.trim());
    const kn = normaliseText(k);
    const cased = spec.accepted.filter((a) => phraseIn(normaliseText(a), kn) || (pair && normaliseText(a) === kn)).map((a) => alleleLetters(a, pair)).filter((x): x is string => x !== null);
    if (cased.length === 0) return true;
    const mine = alleleLetters(text, pair);
    return mine !== null && cased.includes(mine);
  };
  const hits = (text: string, i: number, g: TextSpec["keyWords"][number]) => g.any.filter((entry) => entry.split("|").some((k) => (keyEarns(text, i, g, k) || hydrocarbonIn(text, k)) && alleleCaseOk(text, k)));
  // A reject word cancels where she asserts it; under her own "not" it is no reject ("doesn't lower cholesterol").
  const rejectHits = (text: string, r: string) => {
    if (!phraseIn(normaliseText(text), normaliseText(r), REJECT_INFLECTIONS)) return false;
    const ps = polarities(text, r);
    return ps.length === 0 || ps.some((p) => ASSERTS.has(p.polarity));
  };
  // A hedge that offers a named wrong answer beside a right one: CCEA's general marking instructions (C2 Higher MS
  // Summer 2021) "Additional incorrect responses cancel out a correct response". The groups the hedge's other
  // alternatives earn are cancelled; a reject word counts as a named wrong answer here as it does everywhere.
  const cancelled = new Set<number>();
  let cancelledBy: string | null = null;
  // A named wrong answer: a common error's pattern, or a reject word. An alternative that earns a group is not wrong,
  // and a pattern anchored at both ends describes a whole answer ("2.91" alone, one root of two), not an alternative.
  // A value offered beside the right one ("M = 650 or 651"; the FM2 review, 27 Sep 2026: paid 3/3 on a show-that part)
  // is a wrong answer when no key word, accepted answer or model answer states it: two values are a hedge.
  const modelNumbers = new Set([...model, ...groups.flatMap((g) => g.any)].flatMap((t) => t.match(/\d+(?:\.\d+)?/g) ?? []).map(Number));
  const wrongValue = (p: string) => {
    const numbers = (p.match(/\d+(?:\.\d+)?/g) ?? []).map(Number);
    return numbers.length > 0 && modelNumbers.size > 0 && numbers.every((n) => !modelNumbers.has(n));
  };
  const isWrong = (p: string) =>
    !groups.some((g, i) => hits(p, i, g).length > 0) &&
    ((opts.wrongAnswers ?? []).some((re) => !(re.source.startsWith("^") && re.source.endsWith("$")) && re.test(p)) ||
      groups.some((g) => (g.reject ?? []).some((r) => rejectHits(p, r))) ||
      wrongValue(p));
  for (const alternatives of hedges(raw)) {
    const wrong = alternatives.filter(isWrong);
    if (wrong.length === 0) continue;
    for (const p of alternatives) {
      if (isWrong(p)) continue;
      // A wrong value cancels the point it pertains to (C2 2021 MS §4): the one stated in the clause it stands beside
      // ("… so 10.8M = 7020 and M = 650 or 651" cancels "M = 650", not the working before it).
      const clauses = p.split(/[.;,]|\b(?:and|so|then|therefore|giving)\b/i).filter((c) => c.trim().length > 0);
      const beside = wrong.every(wrongValue) && clauses.length > 1 ? clauses[clauses.length - 1]! : p;
      groups.forEach((g, i) => {
        if (hits(beside, i, g).length > 0) {
          cancelled.add(i);
          cancelledBy ??= wrong[0]!;
        }
      });
    }
  }
  // One idea earns one group: a key word already paid, or one inside a key word already paid ("survived" inside
  // "resistant bacteria survived"), is the same idea said again (B2 D, 25 Sep 2026). A longer idea that merely
  // contains a paid word is a new idea ("zinc corrodes" after "zinc", "resistance depends on temperature" after
  // "temperature", "quarter turn clockwise" after "quarter turn"; the P2 D pass, 25 Sep 2026).
  const sameIdea = (k: string) => [...used].some((u) => u === k || u.split("|").some((a) => k.split("|").some((b) => phraseIn(a, b))));
  groups.forEach((g, i) => {
    // The longest idea first, so a short word inside it cannot be paid again by the next group.
    const hit = hits(raw, i, g)
      .map(normaliseText)
      .sort((a, b) => b.length - a.length)
      .find((k) => !sameIdea(k));
    const bad = (g.reject ?? []).filter((r) => rejectHits(raw, r));
    rejected.push(...bad);
    // A key word the model negates, written by her without the negation, contradicts the point: the group is not paid
    // by another of its words ("their shape is complementary" where the model says "not complementary" earned the group
    // through "shape"; the verifier, 29 Sep 2026).
    const contradicted = g.any.some((entry) => entry.split("|").some((k) => negationIsThePoint(k, raw) && polarities(raw, k).some((p) => ASSERTS.has(p.polarity))));
    if (hit !== undefined && bad.length === 0 && !cancelled.has(i) && !contradicted) {
      used.add(hit);
      matchedGroups.push(i);
      marks += g.marks;
      paidBy.set(i, hit);
    }
  });

  // A named wrong qualifier on the words that earned a mark (gate 2, G2-02, 11 Oct 2026): a phrase-level common error (a
  // pattern that does not describe a whole answer, so not anchored at its start) whose match starts inside the very words
  // a group was paid for and runs on past them into a qualifying phrase ("… of aluminium") cancels that group, as a reject
  // word does. c2-aluminium-extraction .0005 pays "lowers the melting point (of the aluminium oxide)" and names "melting
  // point of aluminium" as its slip: "it lowers the melting point of aluminium" was paid 1/1. CCEA: words in brackets
  // need not be there, but if present they must be right. Only that shape: the corpus's diagnostic patterns also match
  // right answers ("turn" inside "quarter turn", "64 … twice" around a full reason; the guard, 11 Oct 10:12), so a match
  // that starts before the paid words, ends inside them, or adds no qualifying phrase costs nothing.
  if (matchedGroups.length > 0 && (opts.wrongAnswers ?? []).length > 0) {
    // The answer as she wrote it: the patterns are written against her text, whose ";" and "," are boundaries they rely on
    // ("covered[^;\n]*kept the same" stops at a semicolon), and the paid words are found in it word by word.
    const h = raw;
    const spansOf = (key: string): Array<[number, number]> => {
      const out: Array<[number, number]> = [];
      for (const spelling of key.split("|").map((k) => normaliseText(k)).filter((k) => k.length > 0)) {
        const words = spelling.split(" ").map(escapeRegExp).join("[^A-Za-z0-9]+");
        const re = new RegExp(`(?<![A-Za-z0-9])${words}(?:s|es|ed|d|ing)?(?![A-Za-z0-9])`, "gi");
        for (const m of h.matchAll(re)) out.push([m.index!, m.index! + m[0].length]);
      }
      return out;
    };
    for (const re of opts.wrongAnswers ?? []) {
      if (re.source.startsWith("^")) continue;
      let global: RegExp;
      try {
        global = new RegExp(re.source, re.flags.includes("g") ? re.flags : `${re.flags}g`);
      } catch {
        continue;
      }
      for (const m of h.matchAll(global)) {
        if (m[0].length === 0) continue;
        const [s0, e0] = [m.index!, m.index! + m[0].length];
        for (const i of [...matchedGroups]) {
          const key = paidBy.get(i);
          if (key === undefined || !spansOf(key).some(([s1, e1]) => s1 <= s0 && s0 < e1 && e0 > e1 && /^\s*(?:of|in|on|for|to|from|at|by|with)\b/.test(h.slice(e1, e0)))) continue;
          matchedGroups.splice(matchedGroups.indexOf(i), 1);
          marks -= groups[i]!.marks;
          cancelled.add(i);
          cancelledBy ??= m[0];
          namedSlip ??= m[0];
        }
      }
    }
  }

  // A dependent mark (engine brief item 3: a reason earned its mark with the direction it explains reversed). Lost
  // groups are taken off until every group left has what it depends on.
  let lostTo: { group: number; needs: number } | null = null;
  for (let changed = true; changed && opts.dependsOn; ) {
    changed = false;
    for (const i of [...matchedGroups]) {
      const needs = (opts.dependsOn[i] ?? []).find((d) => !matchedGroups.includes(d));
      if (needs === undefined) continue;
      matchedGroups.splice(matchedGroups.indexOf(i), 1);
      marks -= groups[i]!.marks;
      lostTo ??= { group: i, needs };
      changed = true;
    }
  }

  let penalty = 0;
  if (spec.listingRule && groups.length > 0) {
    // Only a wrong extra answer costs a mark ("trap and filter", both right, is not penalised; CCEA: "additional
    // incorrect responses"): the penalty is the extra items that earn no group, at most the extra count.
    const items = listedItems(raw);
    if (items.length > groups.length) {
      const wrong = items.filter((it) => !groups.some((g, i) => hits(it, i, g).length > 0)).length;
      penalty = Math.min(marks, items.length - groups.length, wrong);
    }
  }
  const marksAwarded = Math.max(0, marks - penalty);
  const correct = groups.length > 0 && marksAwarded === marksAvailable;

  const missingIdeas = groups.filter((_, i) => !matchedGroups.includes(i)).map(ideaLabel);
  let feedback: string;
  if (correct) feedback = "Every marking point is there.";
  else if (groups.length === 0) feedback = "That does not match the expected wording.";
  else if (penalty > 0)
    feedback = `Listing rule: more answers were given than asked for, so ${penalty} mark${penalty === 1 ? " is" : "s are"} lost. Give only what the question asks for.`;
  else if (lostTo !== null && matchedGroups.length === 0)
    feedback = `The mark for "${ideaLabel(groups[lostTo.group]!)}" depends on "${ideaLabel(groups[lostTo.needs]!)}", which is not there yet.`;
  else if (namedSlip !== null) feedback = `"${namedSlip}" is the slip this question names, so the mark it sits in is lost.`;
  else if (cancelledBy !== null)
    feedback = `"${cancelledBy}" beside the right answer cancels its mark: an incorrect answer given with a right one earns nothing. Give one answer.`;
  else if (rejected.length > 0) feedback = `"${rejected[0]}" cancels the mark it sits with. Leave it out.`;
  else if (matchedGroups.length === 0) feedback = `The marking points are not there yet. Expected: ${missingIdeas.join(", ")}.`;
  else feedback = `${marksAwarded} of ${marksAvailable}: still missing ${missingIdeas.join(", ")}.`;

  return { correct, marksAwarded, marksAvailable, matchedGroups, rejected, feedback };
}

export interface McqMarkResult {
  correct: boolean;
  chosen: McqOption[];
  correctOptions: McqOption[];
  feedback: string;
  misconception?: string;
}

export function markMcq(selected: string | readonly string[], spec: McqSpec): McqMarkResult {
  const ids = typeof selected === "string" ? [selected] : [...selected];
  const chosen = spec.options.filter((o) => ids.includes(o.id));
  const correctOptions = spec.options.filter((o) => o.correct);
  const correctIds = new Set(correctOptions.map((o) => o.id));
  const correct = chosen.length > 0 && chosen.length === correctOptions.length && chosen.every((o) => correctIds.has(o.id));
  const firstMiss = chosen.find((o) => !o.correct);
  const feedback = chosen.length === 0 ? "Choose an option first." : (firstMiss ?? chosen[0]).feedback;
  const misconception = firstMiss?.misconception;
  return misconception ? { correct, chosen, correctOptions, feedback, misconception } : { correct, chosen, correctOptions, feedback };
}
