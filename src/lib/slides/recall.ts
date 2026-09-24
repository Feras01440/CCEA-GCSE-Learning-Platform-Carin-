/**
 * Which of a lesson's retrieval prompts become Slides' recall cards (the owner's trial, 24 Sep 2026: "the last four
 * retrieval prompts: it doesn't have to be always four, sometimes it's more hassle, like writing an essay, not
 * remembering"). Pure: no React, no database.
 *
 * The interim rule, until the owner decides the grammar after the design case (how many, which, where):
 *  - at most two per lesson, taken from the prompts the note itself places in the lesson (its `prompt` blocks), never
 *    invented and never pulled in from elsewhere in the bundle;
 *  - only a prompt whose expected answer is short: a single value, or at most about twelve words once the model
 *    answer's elaboration is set aside (its first sentence, cut at the first clause that explains it);
 *  - never one that asks for an explanation ("why", "explain", "the difference between"), for a list ("the three
 *    moves", "give the four steps"), or for two things at once ("…, and what is it not?"), and never one that needs a
 *    picture the card cannot show;
 *  - the shortest answers first when there are more than two, shown in the note's order.
 * Each card can be skipped, and a skip records nothing (SlidesRun).
 */
import type { RetrievalPrompt } from "@/lib/content/schema";

export const RECALL_MAX = 2;
export const RECALL_WORDS = 12;

/** A request for reasons, not recall. */
const EXPLAIN = /\b(?:explain|why|describe|justify|evaluate|discuss|compare|contrast|outline|differ|differs|what is the difference|difference between)\b/i;

/**
 * A request for several things: "the three moves", "give the four steps", "the last two things you do", "name the
 * control variables", "what is each one used for", "complete both", or a cloze with two or more blanks. Every one of
 * these was read in the corpus (24 Sep 2026) before it went in, and each is several answers, not one.
 */
const NUMBER = "two|three|four|five|six|seven|eight|nine|ten";
const MANY =
  "steps|moves|stages|rules|conditions|properties|features|ways|parts|things|reasons|marks|facts|points|checks|methods|types|laws|lines|" +
  "advantages|disadvantages|differences|similarities|effects|uses|processes|examples|groups|regions|rearrangements|values|numbers|products|" +
  "reactants|results|quantities|variables|equations|formulae|formulas|definitions|diseases|organs|structures|functions|dangers|tests|" +
  "colours|units|letters|species|agents|electrodes|events|symptoms|substances|characteristics|observations|causes|issues|particles|" +
  "components|organisms|bonds|ions|molecules";
const LIST = new RegExp(
  [
    `\\blist\\b`,
    `\\bsteps\\s+(?:to|for)\\b`,
    `\\b(?:${NUMBER})\\s+(?:[\\w-]+\\s+){0,2}(?:${MANY})\\b`,
    // The things asked for, counted: "Which two forces", "the three denominators", "the five columns". A count that
    // only sets the scene ("multiplying two matrices", "Two unequal resistors are in parallel") is not matched.
    `\\b(?:which|what|the)\\s+(?:${NUMBER})\\s+(?:[\\w-]+\\s+){0,2}[\\w-]+s\\b`,
    `\\b(?:name|give|state|write|say)\\s+(?:all\\s+)?(?:the\\s+)?(?:[\\w-]+\\s+){0,2}(?:${MANY})\\b`,
    `\\beach\\b`,
    `\\bcomplete both\\b|\\bboth (?:results|answers|equations|values|parts|tests)\\b`,
    // Two blanks to fill, or a colon followed by three things to give.
    `_{3,}[^_]+_{3,}`,
    `:\\s*[^,.?:]+,\\s*[^,.?:]+,\\s*[^,.?:]+`,
    // Three things asked for in a row: "what happens to water reabsorption, urine volume and urine concentration",
    // "name the vector partner of distance, of speed and of rate of change of speed". A list that only sets the scene
    // ("the area between a curve, the x-axis and the ordinates") asks for one thing and is not matched.
    `\\b(?:what happens to|name|give|list|state|define)\\b[^.?!]*,[^.?!]*\\band\\b`,
  ].join("|"),
  "i",
);

/**
 * Two questions in one: "What is it, and what is it not?", "Where does it turn, and is that a maximum?", "Name the
 * enzyme, and name the ends it leaves", "Give the test and the full result", "What happens to the numerator and the
 * denominator?", "What is the test for oxygen and its result?".
 */
const TWO_QUESTIONS = new RegExp(
  [
    `\\?[^?]*[A-Za-z][^?]*\\?`,
    `,\\s*and\\s+(?:to\\s+|in\\s+|at\\s+|for\\s+)?(?:what|which|why|how|when|where|who|is|are|does|do|did|can|could|would|should|will|name|say|give|state|write|use|find|show)\\b`,
    `\\band\\s+(?:why|how)\\b`,
    `\\band\\s+(?:which|what|when|where)\\s+(?:to|of|for|in|at|is|are|does|do|did|you)\\b`,
    `;\\s*and\\b`,
    // "Give the test and the full result", "Write the word equation and the balanced symbol equation"; "Give the danger of
    // … microwaves, and the danger of … infrared". Not "Write the integral for the area between a curve, the x-axis and
    // the ordinates", which asks for one integral.
    `\\b(?:give|write|state|name)\\s+(?:the\\s+|a\\s+|an\\s+)?(?:[\\w-]+\\s+){0,3}and\\s+(?:the|a|an|its|their)\\s+[\\w-]+`,
    `\\b(?:give|write|state|name)\\s+the\\s+([\\w-]+)\\b[^.?!]*\\band\\s+the\\s+\\1\\b`,
    `\\bdefine\\b[^.?!]*,[^.?!]*\\band\\b`,
    `\\b(?:the|a|an)\\s+[\\w-]+\\s+and\\s+(?:the|a|an)\\s+[\\w-]+[^?]*\\?`,
    `,?\\s+and\\s+(?:its|their)\\s+(?:result|results|unit|units|name|names|meaning|value|values|use|uses|effect|effects|sign|signs|formula|reason|reasons)\\b`,
  ].join("|"),
  "i",
);

/** A model answer that is itself a list: two or more semicolons, or a chain of three or more arrows, outside maths. */
const listedAnswer = (firstSentenceText: string): boolean => {
  const text = firstSentenceText.replace(/\$[^$]*\$/g, "");
  return (text.match(/;\s/g) ?? []).length >= 2 || (text.match(/→/g) ?? []).length >= 3;
};

/** Kinds that are not a line to recall: a diagram to label needs its picture; a quotation is a passage. */
const NOT_A_LINE = new Set<RetrievalPrompt["kind"]>(["label-diagram", "quotation"]);

/** The answer's first sentence (a stop, then a space and a capital, a digit or maths), never cut inside `$…$`. */
function firstSentence(answer: string): string {
  const s = answer.trim();
  let inMaths = false;
  for (let i = 0; i < s.length; i += 1) {
    const ch = s[i];
    if (ch === "\\") {
      i += 1;
      continue;
    }
    if (ch === "$") {
      inMaths = !inMaths;
      continue;
    }
    if (!inMaths && /[.!?]/.test(ch) && /^\s+[A-Z0-9$(]/.test(s.slice(i + 1, i + 3))) return s.slice(0, i + 1);
  }
  return s;
}

/**
 * What she is expected to say: the model answer's first sentence, without its asides, up to the clause that starts
 * explaining it. "The numbers. A numerical factor left on both lines…" → "The numbers"; "Take the common factor $x$
 * out, which leaves…" → "Take the common factor $x$ out"; "$(a+b)(a-b)$, the difference of two squares." →
 * "$(a+b)(a-b)$"; "Atoms of one element that share an atomic number (the same number of protons) but differ in mass
 * number (…)." → the whole definition without its brackets, which is the part she must say.
 */
export function expectedAnswer(answer: string): string {
  const maths: string[] = [];
  let t = firstSentence(answer).replace(/\$[^$]*\$/g, (m) => {
    maths.push(m);
    return `\u0001${maths.length - 1}\u0002`;
  });
  // Asides go: a bracket, or a pair of dashes ("The value of a factor — temperature or pH — at which…").
  t = t.replace(/\s*\([^()]*\)/g, "").replace(/\s[—–]\s[^—–]*\s[—–]\s/g, " ");
  // Then the first clause: up to a dash, a semicolon or colon, a comma that opens an explaining clause, or "because".
  const cut = t.search(/\s[—–]\s|;\s|:\s|,\s(?:which|because|so|as|since|then|and then|giving|leaving|for|with|not|where|while|whereas|but)\b|\sbecause\s/);
  if (cut > 0) t = t.slice(0, cut);
  // A value in apposition: "$(a+b)(a-b)$, the difference of two squares".
  const apposition = /^(\u0001\d+\u0002|[-−]?[\d.,/]+\s*[a-zA-Z°%²³]{0,4}),\s(?:the|a|an)\b/.exec(t);
  if (apposition) t = apposition[1];
  return t
    .replace(/\u0001(\d+)\u0002/g, (_, i: string) => maths[Number(i)] ?? "")
    .replace(/[.,;:!]+$/, "")
    .trim();
}

/** Words in an answer, with each piece of maths counted as one. */
export function answerWords(text: string): number {
  return text
    .replace(/\$[^$]*\$/g, " M ")
    .split(/\s+/)
    .filter(Boolean).length;
}

/** A single value: one piece of maths, or a number with at most a short unit. */
function isSingleValue(text: string): boolean {
  const t = text.trim();
  return /^\$[^$]+\$$/.test(t) || /^[-−]?[\d.,/]+\s*[a-zA-Z°%²³]{0,4}$/.test(t);
}

export interface RecallFit {
  ok: boolean;
  /** Why it is not a light recall card, in plain words (empty when it is). */
  reasons: string[];
  expected: string;
  /** Words in the expected answer; a single value counts as one. */
  words: number;
}

export function recallFit(p: RetrievalPrompt): RecallFit {
  const expected = expectedAnswer(p.answer);
  const single = isSingleValue(expected);
  const words = single ? 1 : answerWords(expected);
  const reasons: string[] = [];
  if (NOT_A_LINE.has(p.kind) || p.image) reasons.push("needs a picture or a passage");
  if (EXPLAIN.test(p.prompt)) reasons.push("asks for an explanation");
  if (LIST.test(p.prompt) || listedAnswer(firstSentence(p.answer))) reasons.push("asks for a list");
  if (TWO_QUESTIONS.test(p.prompt)) reasons.push("asks two things at once");
  if (words > RECALL_WORDS) reasons.push(`the answer runs to ${words} words`);
  return { ok: reasons.length === 0, reasons, expected, words };
}

/**
 * The recall cards of a lesson: from the prompts the note places (in the note's order), the light ones, the shortest
 * first when there are more than `max`, returned in the note's order.
 */
export function chooseRecall(placed: readonly RetrievalPrompt[], max = RECALL_MAX): RetrievalPrompt[] {
  const fits = placed.map((p, i) => ({ p, i, fit: recallFit(p) })).filter((x) => x.fit.ok);
  const chosen = [...fits].sort((a, b) => a.fit.words - b.fit.words || a.i - b.i).slice(0, Math.max(0, max));
  return chosen.sort((a, b) => a.i - b.i).map((x) => x.p);
}
