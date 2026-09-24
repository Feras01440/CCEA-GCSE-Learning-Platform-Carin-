/**
 * The constitution, as a function.
 *
 * A line reaches her only if it passes this. It runs twice: over every template at test time
 * (lintLines, in lint.test.ts, so a bad line cannot be committed) and over the rendered text at
 * selection time (lintRendered, in select.ts, so a bad value cannot be shown even if a template
 * is fine). Rejection is silence, never a fallback line.
 *
 * What it refuses:
 * - the banned vocabulary of §2 of the specification: the gap, the hour, the unkept plan, the streak,
 *   loss words, and praise aimed at her rather than at the line;
 * - an exclamation mark or an emoji, anywhere;
 * - a digit in a template: every number about her work must arrive through a named slot;
 * - a number word that is not a declared rule of the product ("one question", "two goes");
 * - a hard-coded date: month and weekday names must arrive through a slot, from exam-plan;
 * - a number in the rendered line that the context did not supply;
 * - a slot that does not exist, is not declared in `requires`, or quotes her without saying so;
 * - the hills or the dialect in a plain wording, or in a template that does not declare them, so plain
 *   mode can be proved to say the same facts with neither.
 */

import {
  FLAGS,
  QUOTED_SLOTS,
  SLOT_NAMES,
  placeholdersIn,
  type CompanionLineSpec,
  type SlotName,
} from "./lines";

export type LintRule =
  | "banned-word"
  | "exclamation"
  | "emoji"
  | "digit"
  | "number-word"
  | "hard-coded-date"
  | "length"
  | "sentences"
  | "unknown-slot"
  | "undeclared-slot"
  | "undeclared-quote"
  | "unknown-flag"
  | "plain-leak"
  | "undeclared-place"
  | "undeclared-dialect";

export interface LintFinding {
  lineId: string;
  rule: LintRule;
  detail: string;
}

/** At most two sentences and 140 characters, per the specification's acceptance tests. */
export const MAX_CHARS = 140;
export const MAX_SENTENCES = 2;

/**
 * Single words that may never appear. The loss and shame vocabulary of §2, plus praise of the person.
 * "You did not" is deliberately absent: line correct.rushed-line uses it about the examiners' aggregate,
 * which is praise of the line, not of her.
 */
export const BANNED_WORDS: string[] = [
  "wrong", "wrongly", "fail", "failed", "failing", "failure",
  "lost", "lose", "losing", "missed", "missing",
  "behind", "disappointed", "disappointing", "waiting", "streak", "streaks",
  "sorry", "shame", "ashamed", "guilt", "guilty", "punish", "slipping", "slipped",
  "clever", "genius", "brilliant", "amazing", "smart", "star", "superstar", "proud",
];

/** Phrases that may never appear: the gap, the hour, the unkept plan, and asking her to stay. */
export const BANNED_PHRASES: string[] = [
  "days since", "since you last", "it has been", "you were away", "welcome back",
  "long time", "been a while", "last time you", "you have not", "you haven't",
  "catch up", "caught up", "fallen behind", "should have", "missed a day", "missed a week",
  "well done", "good girl", "proud of you", "great job", "keep it up",
  "keep going", "one more", "a bit longer", "do not stop", "don't stop", "stay a", "five more",
  "o’clock", "o'clock", "this hour", "time of night", "this late",
];

/**
 * The place language plain mode leaves out: the hills and the path Rowan walks. "Stone" is not here: the
 * stones are the product's own count, on Today and the Map, in either voice.
 */
export const PLACE_WORDS: string[] = [
  "path", "paths", "cairn", "cairns", "hill", "hills", "ridge", "ridges", "summit", "summits",
  "trail", "trailhead", "mournes", "mourne", "sperrins", "causeway", "slieve", "donard",
];
export const PLACE_PHRASES: string[] = ["new ground"];

/** The Ulster dialect plain mode leaves out. */
export const DIALECT_WORDS: string[] = ["wee", "grand", "aye", "youse", "wains"];
export const DIALECT_PHRASES: string[] = ["that is the deal"];

/** Place words and phrases in a string. */
export function placeWordsIn(text: string): string[] {
  const ws = words(text);
  const n = normalised(text);
  return [...PLACE_WORDS.filter((w) => ws.includes(w)), ...PLACE_PHRASES.filter((p) => n.includes(p))];
}

/** Dialect words and phrases in a string. */
export function dialectWordsIn(text: string): string[] {
  const ws = words(text);
  const n = normalised(text);
  return [...DIALECT_WORDS.filter((w) => ws.includes(w)), ...DIALECT_PHRASES.filter((p) => n.includes(p))];
}

/**
 * What a rendered line would leak into plain mode: place or dialect words left once the values the
 * context supplied are taken out (a topic may be called "Critical path analysis"; that is its name,
 * not Rowan's hills).
 */
export function plainLeaks(text: string, values: Record<string, string>): string[] {
  const residue = withoutValues(text, values);
  return [...placeWordsIn(residue), ...dialectWordsIn(residue)];
}

/**
 * A rendered line with every supplied value taken out, longest first, in the form it was supplied and
 * with a capital (renderTemplate capitalises a value that opens a sentence). What is left is what the
 * template itself said.
 */
export function withoutValues(text: string, values: Record<string, string>): string {
  let residue = text;
  for (const v of Object.values(values).sort((a, b) => b.length - a.length)) {
    if (!v) continue;
    const capital = v.charAt(0).toUpperCase() + v.slice(1);
    residue = residue.split(v).join(" ").split(capital).join(" ");
  }
  return residue;
}

/** Number words. Anything here in a template must be declared in `fixedCounts`. */
export const NUMBER_WORDS: string[] = [
  "zero", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten",
  "eleven", "twelve", "thirteen", "fourteen", "fifteen", "sixteen", "seventeen", "eighteen",
  "nineteen", "twenty", "thirty", "forty", "fifty", "sixty", "hundred",
];

/**
 * The only number words a template may contain: they state a rule of the product (a gate is one
 * question; two goes is enough) or are the pronoun "one". Never a count of her work.
 */
export const ALLOWED_FIXED_COUNTS: string[] = ["one", "two"];

const MONTHS = [
  "january", "february", "march", "april", "may", "june", "july", "august", "september", "october", "november", "december",
  "jan", "feb", "mar", "apr", "jun", "jul", "aug", "sep", "sept", "oct", "nov", "dec",
];
const WEEKDAYS = [
  "monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday",
  "mon", "tue", "tues", "wed", "thu", "thur", "thurs", "fri", "sat", "sun",
];

const EMOJI = /\p{Extended_Pictographic}/u;

/** Lower-cased words of a string, apostrophes kept so "haven't" survives. */
function words(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[‘’]/g, "'")
    .split(/[^a-z']+/)
    .filter(Boolean);
}

function normalised(text: string): string {
  return text.toLowerCase().replace(/[‘’]/g, "'").replace(/\s+/g, " ");
}

/** Sentences: a full stop or question mark followed by a space or the end. "9.15" is not one. */
export function countSentences(text: string): number {
  return (text.match(/[.?](\s|$)/g) ?? []).length;
}

/** Number words actually present in a string. */
export function numberWordsIn(text: string): string[] {
  const found = new Set<string>();
  for (const w of words(text)) if (NUMBER_WORDS.includes(w)) found.add(w);
  return [...found].sort();
}

/** Banned vocabulary in a string, whether a word or a phrase. */
export function bannedIn(text: string): string[] {
  const found: string[] = [];
  const ws = words(text);
  for (const b of BANNED_WORDS) if (ws.includes(b)) found.push(b);
  const n = normalised(text);
  for (const p of BANNED_PHRASES) if (n.includes(p)) found.push(p);
  return found;
}

/** Month and weekday names in a string: a date said in the line rather than read from the plan. */
export function dateWordsIn(text: string): string[] {
  const ws = words(text);
  return [...MONTHS, ...WEEKDAYS].filter((d) => ws.includes(d));
}

/** Every rule that applies to a bare string, whichever template it came from. */
function lintText(lineId: string, text: string, opts: { declaredCounts: string[]; where: string }): LintFinding[] {
  const out: LintFinding[] = [];
  const add = (rule: LintRule, detail: string) => out.push({ lineId, rule, detail: `${opts.where}: ${detail}` });

  if (text.includes("!")) add("exclamation", "an exclamation mark");
  if (EMOJI.test(text)) add("emoji", "an emoji");
  for (const b of bannedIn(text)) add("banned-word", `the banned word or phrase “${b}”`);
  for (const d of dateWordsIn(text)) add("hard-coded-date", `the date word “${d}”; dates come from the exam plan`);

  const digits = text.replace(/\{[a-zA-Z]+\}/g, "").match(/\d/g);
  if (digits) add("digit", `the digit ${digits[0]}; numbers come from the context`);

  const present = numberWordsIn(text.replace(/\{[a-zA-Z]+\}/g, " "));
  const declared = [...opts.declaredCounts].sort();
  for (const n of present) {
    if (!ALLOWED_FIXED_COUNTS.includes(n)) add("number-word", `the number word “${n}”; it must arrive through a slot`);
    else if (!declared.includes(n)) add("number-word", `the number word “${n}” is not declared in fixedCounts`);
  }
  for (const d of declared) {
    if (!ALLOWED_FIXED_COUNTS.includes(d)) add("number-word", `fixedCounts declares “${d}”, which is not a rule of the product`);
  }

  if (countSentences(text) > MAX_SENTENCES) add("sentences", `${countSentences(text)} sentences; at most ${MAX_SENTENCES}`);
  return out;
}

/** Everything that can be checked about one line without a context. */
export function lintLine(line: CompanionLineSpec): LintFinding[] {
  const out: LintFinding[] = [];
  const add = (rule: LintRule, detail: string) => out.push({ lineId: line.id, rule, detail });
  const declaredCounts = line.fixedCounts ?? [];

  const templates: Array<[string, string]> = [["template", line.template]];
  if (line.plainTemplate) templates.push(["plainTemplate", line.plainTemplate]);

  for (const [where, template] of templates) {
    out.push(...lintText(line.id, template, { declaredCounts, where }));

    const used = placeholdersIn(template);
    for (const p of used) {
      if (!(SLOT_NAMES as string[]).includes(p)) add("unknown-slot", `${where}: “${p}” is not a slot context.ts can fill`);
      else if (!(line.requires as string[]).includes(p)) add("undeclared-slot", `${where}: “${p}” is used but not in requires`);
      if (QUOTED_SLOTS.has(p as SlotName) && !(line.quotes ?? []).includes(p as SlotName)) {
        add("undeclared-quote", `${where}: “${p}” quotes her and must be declared in quotes`);
      }
    }
    // A template with every slot at its shortest is already over the cap: a real render can only be longer.
    const floor = template.replace(/\{[a-zA-Z]+\}/g, "").length;
    if (floor > MAX_CHARS) add("length", `${where}: ${floor} characters before any value is filled in; at most ${MAX_CHARS}`);
  }

  // Plain mode says the same fact with neither the hills nor the dialect, and a template that carries
  // either must say so, or plain mode would let it through.
  if (line.plainTemplate) {
    for (const w of [...placeWordsIn(line.plainTemplate), ...dialectWordsIn(line.plainTemplate)]) {
      add("plain-leak", `plainTemplate: “${w}” is the place or dialect language plain mode leaves out`);
    }
  }
  if (placeWordsIn(line.template).length && !line.place) {
    add("undeclared-place", `template: “${placeWordsIn(line.template)[0]}” is place language; mark the line place: true`);
  }
  if (dialectWordsIn(line.template).length && !line.dialect) {
    add("undeclared-dialect", `template: “${dialectWordsIn(line.template)[0]}” is dialect; mark the line dialect: true`);
  }

  for (const r of line.requires) {
    if (!(SLOT_NAMES as string[]).includes(r)) add("unknown-slot", `requires “${r}”, which is not a slot`);
  }
  for (const f of [...(line.flags ?? []), ...(line.notFlags ?? [])]) {
    if (!(FLAGS as string[]).includes(f)) add("unknown-flag", `uses the flag “${f}”, which the context does not set`);
  }
  for (const q of line.quotes ?? []) {
    if (!QUOTED_SLOTS.has(q)) add("undeclared-quote", `declares “${q}” as a quote, but it is not one of her words`);
  }
  return out;
}

export function lintLines(lines: CompanionLineSpec[]): LintFinding[] {
  return lines.flatMap(lintLine);
}

/**
 * The rendered line, with the values the context supplied. Every number and date word left after the
 * supplied values are removed is one the line invented, and the line is refused.
 */
export function lintRendered(
  lineId: string,
  text: string,
  values: Record<string, string>,
  declaredCounts: string[] = [],
): LintFinding[] {
  const out: LintFinding[] = [];
  const add = (rule: LintRule, detail: string) => out.push({ lineId, rule, detail });

  if (text.length > MAX_CHARS) add("length", `${text.length} characters; at most ${MAX_CHARS}`);

  // Take the supplied values out, longest first, and judge what is left. A value that opens a sentence
  // is set with a capital, so it is taken out in that form too.
  const residue = withoutValues(text, values);
  out.push(...lintText(lineId, residue, { declaredCounts, where: "rendered" }));
  if (text.includes("!")) add("exclamation", "rendered: an exclamation mark");
  if (EMOJI.test(text)) add("emoji", "rendered: an emoji");
  if (countSentences(text) > MAX_SENTENCES) add("sentences", `rendered: ${countSentences(text)} sentences`);
  return out;
}

export function formatFindings(findings: LintFinding[]): string {
  return findings.map((f) => `${f.lineId} [${f.rule}] ${f.detail}`).join("\n");
}
