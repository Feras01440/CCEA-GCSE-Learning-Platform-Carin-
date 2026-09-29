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
      const stems = stem.endsWith("e") && stem.length - 1 >= STEM_MIN_LETTERS ? [stem, stem.slice(0, -1)] : [stem];
      return `(?:${stems.map(escapeRegExp).join("|")})${endings}`;
    })
    .join(" ");
  if (new RegExp(`(^| )${loose}( |$)`).test(h)) return true;
  if (needle.length < STEM_MIN_LETTERS || !/^[a-z]+$/.test(needle)) return false;
  // "increase" ~ "increasing", "leave" ~ "leaving": a final e is dropped before -ing / -ed / -ation.
  const stems = needle.endsWith("e") && needle.length - 1 >= STEM_MIN_LETTERS ? [needle, needle.slice(0, -1)] : [needle];
  return haystack.split(" ").some((w) => stems.some((s) => w.startsWith(s) && inflections.has(w.slice(s.length))));
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
  const present: string[] = [];
  const missing: string[] = [];
  for (const k of keyWords) {
    const key = normaliseText(texAsTyped(k));
    // A minus between letters reads as a hyphen in normaliseText ("ad-bc" → "ad bc"), so a key word with one is also
    // looked for that way.
    const found =
      phraseIn(h, key) ||
      (/[+\-/^*]/.test(key) && (tight.includes(` ${compactOperators(key)} `) || chipped.includes(` ${chip(key)} `))) ||
      (/[a-z]\s*-\s*[a-z]/.test(key) && phraseIn(h, key.replace(/([a-z])\s*-\s*(?=[a-z])/g, "$1 ")));
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
  return isFormula(a) ? { name: b, formula: a } : { name: a, formula: b };
}

export function isFormula(segment: string): boolean {
  const t = segment
    .trim()
    .replace(/[₀-₉]/g, (c) => String("₀₁₂₃₄₅₆₇₈₉".indexOf(c)))
    .replace(/\s+/g, "");
  if (!/^(?:[A-Z][a-z]?\d*|\(|\)\d*|[=≡.·-])+$/.test(t)) return false;
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

/** Words that negate what follows them in their clause. */
// Prevent, stop, avoid and reduce deny what follows as "not" does ("to prevent contamination", "to stop contamination";
// the B2 E author, 29 Sep 2026).
const NEGATION = /^(?:not|no|never|none|nor|neither|without|non|cannot|prevents?|prevented|preventing|stops?|stopped|stopping|avoids?|avoided|avoiding|reduces?|reduced|reducing)$/;
/** A verb's own negation inside a key word: such a key is the negation itself. */
const VERB_NEGATION = /^(?:not|cannot|never|prevents?|prevented|preventing|stops?|stopped|stopping|avoids?|avoided|avoiding|reduces?|reduced|reducing)$/;

/** The clauses of an answer: a negation governs only its own clause ("it is not continuous, so it is discontinuous"). */
function clausesOf(raw: string): string[] {
  return raw.split(/[.;:!?,\n]|\b(?:but|because|so|although|whereas|however|while|though|since|therefore|and then)\b/i).filter((c) => c.trim().length > 0);
}

/**
 * Words that end a negation's reach inside a clause: a coordinating word starts a new verb phrase ("light isn't
 * obstructed and can reach the chloroplasts"; "copper has no free electrons and the rubber has free electrons").
 */
const NEGATION_ENDS = /^(?:and|which|who|whom|whose|where|when|then|also|yet|nor)$/;
/**
 * A preposition before a determiner starts a phrase the negation is not about: "not complementary to the active
 * site" negates "complementary", not "the active site"; "no light is blocked on its way to the palisade cells".
 * "Not need to be pure" is an infinitive, not a phrase, and stays negated.
 */
const PREPOSITION = /^(?:to|on|in|into|onto|at|from|with|by|for|through|towards?|across|inside|within)$/;
const DETERMINER = /^(?:the|a|an|its|their|his|her|this|that|these|those|each|every|some|any|all|both|our|your)$/;

/**
 * Where a negation earlier in the clause still governs position `at`: the nearest negation word before it with no
 * end of its reach between them (the QA fixer, 25 Sep 2026: a negation governs its own verb phrase, up to the next
 * "and", "which", comma or full stop, and not a prepositional phrase after its word).
 */
function governedAt(words: readonly string[], at: number): boolean {
  for (let j = at - 1; j >= 0; j--) {
    const w = words[j]!;
    if (NEGATION_ENDS.test(w)) return false;
    if (PREPOSITION.test(w) && DETERMINER.test(words[j + 1] ?? "")) return false;
    if (NEGATION.test(w)) {
      // A negated negator is a positive ("it does not reduce contamination" says contamination is not reduced; the B2 E
      // author, 29 Sep 2026): a "not", "never" or "no" just before it, a helping verb between them, undoes it.
      const before = words.slice(Math.max(0, j - 3), j).filter((x) => !/^(?:do|does|did|will|would|could|can|should|may|might|to|be)$/.test(x));
      if (before.length > 0 && /^(?:not|never|no|cannot)$/.test(before[before.length - 1]!) && !/^(?:not|never|no|cannot|non|none|nor|neither|without)$/.test(w)) return false;
      return true;
    }
  }
  return false;
}

/**
 * The model negates the key word itself, not a word before it: the negation is next to the key with only an article, a
 * copula or an adverb between ("are not complementary", "is not a fair comparison", "no enzyme"). "To avoid growing
 * pathogens" negates the growing, and names the pathogens as the harm: a plain "pathogens could grow" is no contradiction.
 */
function negatesKeyItself(raw: string, key: string): boolean {
  const k = normaliseText(key);
  const first = k.split(" ")[0] ?? "";
  for (const clause of clausesOf(raw)) {
    const c = normaliseText(clause);
    if (!phraseIn(c, k)) continue;
    const words = c.split(" ");
    const at = words.findIndex((w) => w === first || w.startsWith(first.slice(0, Math.max(3, first.length - 2))));
    if (at < 0) continue;
    for (let j = at - 1; j >= 0; j--) {
      const w = words[j]!;
      if (NEGATION.test(w)) return true;
      if (!/^(?:a|an|the|be|been|being|is|are|was|were|very|fully|quite|so|as|any|at|all|of|longer)$/.test(w)) break;
    }
  }
  return false;
}

/**
 * Is every occurrence of the key word in the answer governed by a negation ("they do not have the human gene", "the
 * non-resistant bacteria"; the B2 D reviewer, 25 Sep 2026: 13 of 13 such answers were paid)? A negation governs its own
 * verb phrase only (`governedAt`). A key word that is itself a negation ("does not change direction", "no longer
 * flows") is earned as written: the key word's own words never negate it.
 */
function negatedIn(raw: string, key: string): boolean {
  const k = normaliseText(key);
  const kWords = k.split(" ");
  const first = kWords[0] ?? "";
  const stem = first.length >= 5 ? first.replace(/(?:es|s|e|ed|ing)$/, "") : first;
  // A key word that holds a verb's negation is that negation itself, and starts its own verb phrase ("cannot
  // photosynthesise" in "without light the leaf cannot photosynthesise"): an earlier negation does not undo it. A
  // negated noun ("non resistant bacteria survived") can still sit inside another negation ("none of the …").
  // Unless her "not" denies it in turn ("it does not reduce contamination" against the key "reduce contamination"; the
  // B2 E author's E-NEG-DOUBLE, 29 Sep 2026).
  if (kWords.some((w) => VERB_NEGATION.test(w))) {
    let seen = false;
    for (const clause of clausesOf(raw)) {
      const words = normaliseText(clause).split(" ");
      const at = words.findIndex((w, p) => (w === first || w.startsWith(stem)) && phraseIn(words.slice(p, p + kWords.length).join(" "), k));
      if (at < 0) continue;
      seen = true;
      const before = words.slice(Math.max(0, at - 3), at).filter((x) => !/^(?:do|does|did|will|would|could|can|should|may|might|to|be|it|this|that)$/.test(x));
      if (!(before.length > 0 && /^(?:not|never|no|cannot)$/.test(before[before.length - 1]!))) return false;
    }
    return seen;
  }
  // The key's first word in any of its forms, at any length ("kill" in "killed", "kills"; the B2 E author, 29 Sep 2026:
  // a short first word had to match exactly).
  const startsKey = (w: string) => w === first || (w.startsWith(stem) && INFLECTIONS.has(w.slice(stem.length))) || (w.length > stem.length + 1 && w.startsWith(`${stem}${stem.slice(-1)}`) && INFLECTIONS.has(w.slice(stem.length + 1)));
  let found = false;
  for (const clause of clausesOf(raw)) {
    const c = normaliseText(clause);
    if (!phraseIn(c, k)) continue;
    found = true;
    const words = c.split(" ");
    // Every place the key word starts in the clause; where none can be pinned (an algebraic key), its first word.
    let starts = words.map((_, p) => p).filter((p) => startsKey(words[p]!) && phraseIn(words.slice(p, p + kWords.length).join(" "), k));
    if (starts.length === 0) starts = words.map((_, p) => p).filter((p) => startsKey(words[p]!)).slice(0, 1);
    // A key that cannot be pinned in the clause is not read as negated: the clause's end would count the key's own
    // words ("non" in "kill the non resistant") as a negation of it.
    if (starts.length === 0) return false;
    if (starts.some((at) => !governedAt(words, at))) return false;
  }
  return found;
}

/** Words too common to name a subject. */
const NOT_A_SUBJECT = new Set(["this", "that", "they", "them", "their", "there", "these", "those", "with", "from", "have", "been", "were", "what", "when", "which", "also", "only", "then", "than", "into", "each", "very", "more", "most", "some", "such", "will", "would", "could", "should", "does", "done", "make", "made", "because", "cannot"]);

/**
 * The words naming what a key word is said of, in the clauses that hold it: the content words before the key (four
 * letters or more, cut to their first four), negation words aside. "The shapes of B and C are not complementary" gives
 * {shap}; "the comparison is fair" gives {comp}.
 */
function subjectBefore(raw: string, key: string): Set<string> {
  const k = normaliseText(key);
  const first = k.split(" ")[0] ?? "";
  const out = new Set<string>();
  for (const clause of clausesOf(raw)) {
    const c = normaliseText(clause);
    if (!phraseIn(c, k)) continue;
    const words = c.split(" ");
    const at = words.findIndex((w) => w === first || w.startsWith(first.slice(0, Math.max(3, first.length - 2))));
    for (const w of words.slice(0, at < 0 ? words.length : at)) if (w.length >= 4 && !NEGATION.test(w) && !NOT_A_SUBJECT.has(w)) out.add(w.slice(0, 4));
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

export function markText(raw: string, spec: TextSpec, opts: MarkTextOptions = {}): TextMarkResult {
  const answer = normaliseText(raw);
  const groups = spec.keyWords;
  const marksAvailable = groups.length > 0 ? groups.reduce((a, g) => a + g.marks, 0) : 1;

  if (answer.length === 0) {
    return { correct: false, marksAwarded: 0, marksAvailable, matchedGroups: [], rejected: [], feedback: "Type an answer first." };
  }

  if (spec.accepted.some((a) => normaliseText(a) === answer)) {
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
  // A key word earns one group only. "Give two symptoms" is written as two groups with the same list, and a
  // single symptom must not collect both marks; two groups that merely overlap are handled the same way.
  const used = new Set<string>();
  // A group's key word is in a piece of the answer as written or, for a hydrocarbon's condensed formula, from either end,
  // and not only inside a negation. An entry written "cheaper|costs less" is one idea in several spellings.
  const model = [...spec.accepted, ...(opts.model ?? [])];
  // Her negated key word earns where any model text negates it ("cannot deliver oxygen"). Her un-negated key word
  // contradicts the point only where every model text that says it negates it: one accepted answer's "no air can get
  // in" beside a worked solution's "keeps air away" leaves "air" a plain key word.
  const negationWaived = (k: string) => model.some((m) => negatedIn(m, k));
  // And only about the same subject: the model's "the number who became ill is not a fair comparison" says nothing
  // against her "a percentage lets you compare fairly" (the B2 E author, 29 Sep 2026); "the shapes … are not
  // complementary" does contradict her "their shape is complementary". A bare key word ("complementary") has no subject
  // of its own and meets the model's.
  const negationIsThePoint = (k: string, text?: string) => {
    const saying = model.filter((m) => phraseIn(normaliseText(m), normaliseText(k)));
    if (saying.length === 0 || !saying.every((m) => negatedIn(m, k) && negatesKeyItself(m, k))) return false;
    if (text === undefined) return true;
    const hers = subjectBefore(text, k);
    if (hers.size === 0) return true;
    return saying.some((m) => [...subjectBefore(m, k)].some((w) => hers.has(w)));
  };
  // A group whose point is a harm avoided or a thing reduced waives her negation for every one of its words: the model
  // negates one of them ("to avoid growing pathogens" waives "to stop harmful bacteria growing"), or one of its own
  // entries is itself a negation or a reduction ("cannot carry oxygen", "carry less oxygen" waive "stops … carrying
  // oxygen"; the B2 E author and the C2 D author, 29 Sep 2026).
  // An entry's own negation waives only a key about the same thing ("cannot carry oxygen" for "carrying oxygen", never
  // "antibiotics do not work" for "resistant": "they are not resistant" is the opposite of the point).
  const stems = (t: string) => normaliseText(t).split(" ").filter((w) => w.length >= 4 && !NEGATION.test(w)).map((w) => w.slice(0, 4));
  const groupWaived = (g: TextSpec["keyWords"][number], k: string) => {
    const entries = g.any.flatMap((entry) => entry.split("|"));
    if (entries.some((e) => negationWaived(e))) return true;
    const mine = stems(k);
    return entries.some((e) => {
      const words = normaliseText(e).split(" ");
      if (!words.some((w) => NEGATION.test(w) || w === "less" || w === "fewer")) return false;
      const theirs = stems(e);
      return mine.length > 0 && mine.every((s) => theirs.includes(s));
    });
  };
  const hits = (text: string, g: TextSpec["keyWords"][number]) => {
    const norm = normaliseText(text);
    const waivedFor = (k: string) => groupWaived(g, k);
    return g.any.filter((entry) =>
      entry
        .split("|")
        // Where the model negates the key word, the negation is the point both ways: her negated key earns, and her
        // un-negated one does not ("complementary" where the model says "not complementary"; the verifier, 29 Sep 2026).
        // A key that is itself a reduction ("reduce contamination") is never waived: her "not" before it is a denial.
        .some((k) => (phraseIn(norm, normaliseText(k)) && (negationIsThePoint(k, text) ? negatedIn(text, k) : !negatedIn(text, k) || (!normaliseText(k).split(" ").some((w) => VERB_NEGATION.test(w)) && waivedFor(k)))) || hydrocarbonIn(text, k)),
    );
  };
  const rejectHits = (text: string, r: string) => phraseIn(normaliseText(text), normaliseText(r), REJECT_INFLECTIONS) && !negatedIn(text, r);
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
    !groups.some((g) => hits(p, g).length > 0) &&
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
        if (hits(beside, g).length > 0) {
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
    const hit = hits(raw, g)
      .map(normaliseText)
      .sort((a, b) => b.length - a.length)
      .find((k) => !sameIdea(k));
    const bad = (g.reject ?? []).filter((r) => rejectHits(raw, r));
    rejected.push(...bad);
    // A key word the model negates, written by her without the negation, contradicts the point: the group is not paid
    // by another of its words ("their shape is complementary" where the model says "not complementary" earned the group
    // through "shape"; the verifier, 29 Sep 2026).
    const contradicted = g.any.some((entry) =>
      entry.split("|").some((k) => negationIsThePoint(k, raw) && phraseIn(normaliseText(raw), normaliseText(k)) && !negatedIn(raw, k)),
    );
    if (hit !== undefined && bad.length === 0 && !cancelled.has(i) && !contradicted) {
      used.add(hit);
      matchedGroups.push(i);
      marks += g.marks;
    }
  });

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
      const wrong = items.filter((it) => !groups.some((g) => hits(it, g).length > 0)).length;
      penalty = Math.min(marks, items.length - groups.length, wrong);
    }
  }
  const marksAwarded = Math.max(0, marks - penalty);
  const correct = groups.length > 0 && marksAwarded === marksAvailable;

  const missingIdeas = groups.filter((_, i) => !matchedGroups.includes(i)).map((g) => g.any[0]);
  let feedback: string;
  if (correct) feedback = "Every marking point is there.";
  else if (groups.length === 0) feedback = "That does not match the expected wording.";
  else if (penalty > 0)
    feedback = `Listing rule: more answers were given than asked for, so ${penalty} mark${penalty === 1 ? " is" : "s are"} lost. Give only what the question asks for.`;
  else if (lostTo !== null && matchedGroups.length === 0)
    feedback = `The mark for "${groups[lostTo.group]!.any[0]}" depends on "${groups[lostTo.needs]!.any[0]}", which is not there yet.`;
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
