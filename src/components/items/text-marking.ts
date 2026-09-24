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

export function normaliseText(s: string): string {
  return s
    .toLowerCase()
    .replace(/[‘’‚‛']/g, "")
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
export function phraseIn(haystack: string, needle: string): boolean {
  if (!needle) return false;
  const h = ` ${haystack} `;
  if (h.includes(` ${needle} `)) return true;
  // An algebraic key word ("(2x - 1)(x + 3) = 30", "x^2 + 17x - 168 = 0") is matched with the spaces around its
  // operators ignored, so "(2x-1)(x+3) = 30" and "2x^2+5x-33 = 0" earn it however she spaces them.
  if (isAlgebraic(needle) && ` ${compactOperators(haystack)} `.includes(` ${compactOperators(needle)} `)) return true;
  // Each word of the key word may take or drop a trailing s ("rabbit number" ~ "rabbits number", "cell wall" ~ "cell walls").
  const loose = needle
    .split(" ")
    .map((w) => {
      const stem = w.replace(/(es|s)$/, "");
      return stem.length >= 3 && /^[a-z]+$/.test(w) ? `${escapeRegExp(stem)}(?:es|s)?` : escapeRegExp(w);
    })
    .join(" ");
  if (new RegExp(`(^| )${loose}( |$)`).test(h)) return true;
  if (needle.length < STEM_MIN_LETTERS || !/^[a-z]+$/.test(needle)) return false;
  // "increase" ~ "increasing", "leave" ~ "leaving": a final e is dropped before -ing / -ed / -ation.
  const stems = needle.endsWith("e") && needle.length - 1 >= STEM_MIN_LETTERS ? [needle, needle.slice(0, -1)] : [needle];
  return haystack.split(" ").some((w) => stems.some((s) => w.startsWith(s) && INFLECTIONS.has(w.slice(s.length))));
}

export interface KeywordCheck {
  present: string[];
  missing: string[];
  all: boolean;
}

/** Which key words / phrases appear in the answer (case-insensitive, punctuation-blind). */
export function keywordsPresent(raw: string, keyWords: readonly string[]): KeywordCheck {
  const h = normaliseText(raw);
  const present: string[] = [];
  const missing: string[] = [];
  for (const k of keyWords) (phraseIn(h, normaliseText(k)) ? present : missing).push(k);
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
  // A comma inside brackets is part of the item ("(4, 0) and (1, 0)" is two coordinates, not four numbers).
  const masked = raw.replace(/\([^()]*\)/g, (m) => m.replace(/,/g, "\u0000"));
  const segments = masked
    .split(/\n|;|,|\band\b|\bor\b|\//i)
    .map((p) => p.replace(/\u0000/g, ","))
    .map((p) => p.trim())
    .filter((p) => p.length > 0);
  // A long segment anywhere makes the whole answer prose; a short clause that continues the previous one is not an item.
  if (segments.some((s) => s.split(/\s+/).length > LIST_ITEM_MAX_WORDS)) return 1;
  return segments.filter((p, i) => i === 0 || !CLAUSE_OPENER.test(p)).length;
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

export function markText(raw: string, spec: TextSpec): TextMarkResult {
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
  groups.forEach((g, i) => {
    const hit = g.any.map(normaliseText).find((k) => !used.has(k) && phraseIn(answer, k));
    const bad = (g.reject ?? []).filter((r) => phraseIn(answer, normaliseText(r)));
    rejected.push(...bad);
    if (hit !== undefined && bad.length === 0) {
      used.add(hit);
      matchedGroups.push(i);
      marks += g.marks;
    }
  });

  let penalty = 0;
  if (spec.listingRule && groups.length > 0) {
    const listed = countListedItems(raw);
    if (listed > groups.length) penalty = Math.min(marks, listed - groups.length);
  }
  const marksAwarded = Math.max(0, marks - penalty);
  const correct = groups.length > 0 && marksAwarded === marksAvailable;

  const missingIdeas = groups.filter((_, i) => !matchedGroups.includes(i)).map((g) => g.any[0]);
  let feedback: string;
  if (correct) feedback = "Every marking point is there.";
  else if (groups.length === 0) feedback = "That does not match the expected wording.";
  else if (penalty > 0)
    feedback = `Listing rule: more answers were given than asked for, so ${penalty} mark${penalty === 1 ? " is" : "s are"} lost. Give only what the question asks for.`;
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
