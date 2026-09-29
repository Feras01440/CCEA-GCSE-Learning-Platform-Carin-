/**
 * scripts/qa/see-it.mjs — Lesson structure v3: every teaching section is explain → See it → Your turn (the
 * teach-first case, docs/plan/review/2026-09-24-teach-first-case.md §8.3 and §8.4, approved by the owner on
 * 27 Sep 2026 with his eight answers; the block shapes in docs/plan/review/2026-09-27-see-it-block-shape.md;
 * pipeline/prompts/author-topic.md, "Lesson template v2" item 3 and "Teach before you check").
 * scripts/qa/lesson-v2.mjs reports what this finds as warnings (--see for the list, --see-fatal for breaches).
 *
 * The hard shape rules the renderer needs (two to six steps numbered 1..k, each with its line and its reason; at
 * most one typed step and none in the topic's first See it; a reference the bundle ships; the twin's fields; no
 * gate before its section's See it once the section holds one) are refused by the build, in
 * src/components/items/content-lint.ts (lintNoteBlocks). What is left here are the rules a note can break and still
 * draw, and the migration measures:
 *
 *   block           a See it block's own problems: a reason (`decision`) over REASON_WORDS words (a maths segment
 *                   counts as one word); an unclosed $ in the stem, a working line, a reason or the final answer;
 *                   an `earns` code outside the subject's mark language (Maths M, A, MA; Further Maths M, W, MW;
 *                   Science P; never the banded QWC); a `whyMenu` (the Your turn is the check); a reference to a
 *                   worked example the path also serves as a faded run (a note must not work what a later item
 *                   asks: work the See it inline on new numbers).
 *   see-missing     a gate with no See it before it in its section. A check spends its See it: a later gate needs
 *                   its own, unless it follows the gate before it directly (two Your turns on one See it).
 *   first-check     the topic's first gate does not follow a See it in its section, or is an interface warm-up
 *                   ("One tap to start"): the owner's answer 8, a real check answerable from the first See it.
 *   explain-long    more than EXPLAIN_MAX words of explanation (p and callout text) in a section before its See it
 *                   (before its gate when it has none; in all when it has neither).
 *   explain-blocks  more than EXPLAIN_BLOCKS explanation blocks (p, callout) before a teaching section's See it (or its
 *                   gate): "one to three idea cards" (the case §6.2, §8.3).
 *   turn-last       a section runs on after a Your turn: the gate is followed by more blocks in its stretch (a "See it
 *                   done" heading opens a new stretch, so the See it done after a Your turn is not a run-on).
 *   turns           more than two gates in one stretch (two only where the section showed two variants).
 *   video           a video or a sim is a section's only See it, or stands before the See it (the case §6.2 and §8.3:
 *                   "beside it, never instead of it"; the owner's answer 4: our own worked steps first).
 *   option-position a choice gate's explanation, or its twin's, names an option by its place ("the second option",
 *                   "option B", "the one above"), read by the app's own src/lib/gate-order.ts positionalWording, which
 *                   the caller passes as `positional` (none passed, none read): such a gate is shown in its written
 *                   order, so its answer stays where it was written.
 *   answer-shown    a Your turn's answer is printed in a See it of its own section shown before it (in a working line,
 *                   the final answer or a reason; a number as a whole result: a line, a side of an equation, the final
 *                   answer, a value ending a sentence; words as whole words, not in a sentence that names another
 *                   option), so she can copy it: it re-asks on new numbers, as a twin does (the lead, 27 Sep 2026; the
 *                   line drawn against the Slides candidates on 29 Sep, above answerShownIn).
 *   reteach         a gate's explanation, or its twin's, runs past RETEACH_WORDS words: a miss re-teaches in at most
 *                   60 (the case §6.3), a fraction or a formula counting as one word.
 *   twin            a gate's twin repeats the gate's prompt or answer: a twin is the same structure on new numbers,
 *                   with its own answer (the case §6.3).
 *
 * Sections. The body runs to the recap heading ("You can now", role recap) or, failing that, the "In the exam"
 * pointer; the hero is not in it. A section starts at each heading; a heading with role `see` continues the
 * section above (see-it-block-shape.md §1). The blocks before the first heading are the opening (index 0).
 * These are the raw sections of the v3 structure; teach-show-check.mjs, which judges explained-and-shown, keeps its
 * own reading (it also lets a gateless section's teaching run on), and the two are reported side by side.
 */

export const SEE_STEPS = { min: 2, max: 6 };
export const REASON_WORDS = 40;
export const EXPLAIN_MAX = 225;
export const EXPLAIN_BLOCKS = 3;
export const RETEACH_WORDS = 60;
export const TURNS_MAX = 2;

const isRecap = (b) => b.type === "h" && (b.role === "recap" || /^you can now$/i.test(String(b.text ?? "").trim()));
const isPointer = (b) => b.type === "h" && (b.role === "pointer" || /^in the exam$/i.test(String(b.text ?? "").trim()));
const words = (s) => String(s ?? "").split(/\s+/).filter(Boolean).length;
// A fraction or a formula counts as one word (the case §7): a maths segment is one word, and a sign standing alone
// ("a² − b²") is not a word. Used for a See it's reasons and a gate's re-teaching; the section's 225 words are counted
// as the text runs, like the 75-word card rule.
const MATHS = /\$\$[\s\S]+?\$\$|\$[^$]+\$/g;
const reasonWords = (s) =>
  String(s ?? "")
    .replace(MATHS, " m ")
    .split(/\s+/)
    .filter((w) => /[\p{L}\p{N}]/u.test(w)).length;
const unclosed = (s) => (String(s ?? "").match(/(?<!\\)\$/g) ?? []).length % 2 === 1;

/** The step mark codes of a subject, from packs/<subject>/exam-true/mark-language.json; the banded QWC marks a whole answer, never a step. Longest first, so MA is tried before M. */
export function markCodes(markLanguage) {
  return (markLanguage?.codes ?? [])
    .map((c) => String(c.code ?? ""))
    .filter((c) => /^[A-Z]{1,3}$/.test(c) && c !== "QWC")
    .sort((a, b) => b.length - a.length);
}

/** An interface warm-up rather than a real check: "One tap to start", "Warm-up: tap any option". */
const WARM_UP = /\bone tap\b|\bwarm[- ]?up\b|\btap any\b|\bjust tap\b|\bto get started\b|\bready to (start|begin)\b/i;
export const warmUp = (prompt) => WARM_UP.test(String(prompt ?? ""));

/**
 * Positional wording is read by the app's own reader, src/lib/gate-order.ts `positionalWording` (the sentence that names
 * an option by its place, or null), which the caller passes in as `positional`: lesson-v2.mjs loads it through tsx, the
 * tests import it. The build's GATE warning (content-lint.ts noteBlockWarnings) uses the same reader and the same words,
 * so the three never disagree on a gate (the lead, 27 Sep 2026: "do not copy the regex"; this module's own regex of the
 * morning was retired with it).
 */
const PINNED = "the gate is then shown in its written order, so its answer stays where it was written; name the option by what it says";
const PINNED_TWIN = "that is true only in the order the twin was written; name the option by what it says";

/**
 * A Your turn's answer printed in its own section's See it (the lead, 27 Sep 2026: it re-asks on new numbers, as a twin
 * does). Compared after normalising case, spaces, LaTeX delimiters ($, $$, \( \), \[ \]) and trailing punctuation. A
 * number answer counts only as a whole result (a whole line, one side of an equation, or the final answer), so the 5 of
 * "(x + 5)" is not the answer 5; any other answer counts wherever it stands, between non-alphanumeric neighbours.
 *
 * The line drawn on 29 Sep 2026 (the lead's item c), from the Slides candidates (src/lib/slides/cards.ts
 * seeAnswerPrinted, which looks in the stem, every working line and reason and the answer line, a number as any number
 * of its own and a word inside any word) read one by one against their See its, 42 gates in the 92 migrated notes:
 *  - The reasons are read as well as the working and the final answer: five copyable answers stood only in a reason
 *    (m8/pythagoras-3d g20 "so use the cosine rule" for the same triangle ACF; fm3/line-of-best-fit g3 "Line A passes this
 *    check" on the same garden graph; b2/blood-and-vessels g1 "Not oxygen, which rides in the red cells" for "Which is
 *    NOT transported by the plasma?"; fm1/expand-three-brackets g2 "six in all"; fm2/equilibrium g1 "the resultant is
 *    zero"). The stem is not read: it is the See it's question, and its words are the question's vocabulary (five
 *    candidates stood only in a stem and were fine: "a maximum or a minimum", "on, inside or outside the circle", "true,
 *    false, or not possible to tell", "the recurring decimal", "the umbilical cord is squeezed"; one was not, b2
 *    natural-selection g8's "could become extinct", left to its author).
 *  - A number, or a number word (zero to twenty, as the engine reads "two" as 2), counts as a whole result: a whole line,
 *    a side of an equation, the final answer, or a value stated at the end of a sentence ("its gradient is 0", "the
 *    resultant is zero", "six in all"). Never a given, a coefficient, a label or a step on the way ("6 s later", "(x + 4)",
 *    "Box 2:", "$(-2)^{2}$ is $4$, positive", "3x = 66 and x = 22": sixteen candidates of that kind were fine).
 *  - A word answer counts as a whole word, and also without its leading article ("a catalyst" in "so P is the
 *    catalyst"); a charge written in TeX is the charge ("2e^-" is the accepted "2e-"). It does not count in a sentence
 *    (between . ; : ! ?) that also names another option of a choice gate: that sentence states a rule or a contrast
 *    ("anticlockwise makes a north pole, clockwise a south pole", p2/magnetism g3, whose See it worked the other way
 *    round). And a choice gate's answer in a reason does not count when the See it's own result (its final answer, else
 *    its last working line) names another of the gate's options and not this one, unless the gate asks for an exception
 *    (NOT, except, never): the See it answered a case with another answer, and its reason only teaches the contrast
 *    (c2/homologous-series g13: pentane "is a liquid", its reason "above it, the solid has gone", the gate's answer solid).
 */
const NUMBER_WORDS = ["zero", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten", "eleven", "twelve", "thirteen", "fourteen", "fifteen", "sixteen", "seventeen", "eighteen", "nineteen", "twenty"];
const NUMBER_WORD = new RegExp(`\\b(${NUMBER_WORDS.join("|")})\\b`, "gi");
/** Number words as digits, and a charge written in TeX or with superscripts as the plain sign ("2e^-", "2e^{-}", "2e⁻" are "2e-"). */
const plain = (s) =>
  String(s ?? "")
    .replace(NUMBER_WORD, (w) => String(NUMBER_WORDS.indexOf(w.toLowerCase())))
    .replace(/\^\{?([+-])\}?/g, "$1")
    .replace(/⁻/g, "-")
    .replace(/⁺/g, "+");
const ARTICLE = /^(?:a|an|the)\s+(?=\S{3})/i;
/** The sentences of a text, split at . ! ? (before a space or the end), ; and : outside maths. */
function sentences(text) {
  const s = String(text ?? "");
  const out = [];
  let cur = "";
  let inMaths = false;
  for (let i = 0; i < s.length; i += 1) {
    const ch = s[i];
    if (ch === "$") inMaths = !inMaths;
    const stop = !inMaths && (ch === ";" || ch === ":" || ch === "\n" || (/[.!?]/.test(ch) && (i + 1 >= s.length || /\s/.test(s[i + 1]))));
    if (stop) {
      if (cur.trim()) out.push(cur.trim());
      cur = "";
    } else cur += ch;
  }
  if (cur.trim()) out.push(cur.trim());
  return out;
}
/** A value stated as a result at the end of a sentence: "is 0", "are 6 m/s", "equals 12", "six in all" (digits by then). */
const RESULT_AT_END = /(?:\b(?:is|are|was|were|equals|gives|makes|leaves|becomes)\s+|[=:]\s*)(-?\d+(?:\.\d+)?)(?:\s?(?:°\s?C|°|%|m\/s²|m\/s\^2|m\/s|km\/h|cm³|cm²|dm³|m³|m²|mm|cm|km|kg|mg|kJ|kW|kPa|Pa|Hz|mol|ms|min|hours?|minutes?|seconds?|metres?|degrees?|units?|Ω|[smgJWNVAK]))?$|(-?\d+(?:\.\d+)?)\s+(?:in all|in total|altogether)$/i;
function numberShown(a, text) {
  const t = plain(text);
  if (normalised(t) === a) return true;
  if (t.split(RELATION).some((side) => normalised(side) === a)) return true;
  return sentences(t).some((c) => {
    const m = RESULT_AT_END.exec(c.replace(/\$/g, " ").replace(/\s+/g, " ").trim().replace(/[.!?]+$/, ""));
    return m !== null && normalised(m[1] ?? m[2]) === a;
  });
}
// Maths is compared with its spaces taken out ("(x + 3)(x - 3)" is "(x+3)(x-3)"); words keep one space between them, so a
// phrase is found only as whole words ("difference of two squares", not inside another word).
const normalised = (s, words = false) =>
  String(s ?? "")
    .toLowerCase()
    .replace(/\$\$|\$|\\\(|\\\)|\\\[|\\\]/g, " ")
    .replace(/\s+/g, words ? " " : "")
    .trim()
    .replace(/[.,;:!?]+$/, "");
const NUMBER = /^[-−]?\d+(?:\.\d+)?$/;
const RELATION = /=|≈|→|⇒|\\approx|\\to|\\rightarrow|\\implies/;
// Words, not maths: a phrase of two words or more, or one word of two letters or more with no maths in it (the lead's item
// 19: a one-word blank, "digests", is found as a whole word in the See it, never inside "indigestion"); or a phrase of
// words alone, whatever their length ("Line A", "a catalyst": 29 Sep 2026, squeezed together "linea" was never a word).
const WORDY = /[a-z]{2,}\s+[a-z]{2,}|^\s*[a-z][a-z'-]+\s*$|^\s*[a-z][a-z'-]*(?:\s+[a-z][a-z'-]*)+\s*$/i;
function printedIn(answer, text) {
  const ans = plain(answer);
  const words = WORDY.test(ans.replace(/\$[^$]*\$/g, " "));
  const a = normalised(ans, words);
  if (!a || !normalised(text)) return false;
  if (NUMBER.test(a)) return numberShown(a, text);
  const t = normalised(plain(text), words);
  if (t === a) return true;
  const esc = a.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  // not inside a longer number or word: "4 m/s" is not in "8.4 m/s" (fm2/average-speed-and-velocity g12, 27 Sep 2026)
  return new RegExp(`(?<![a-z0-9.])${esc}(?![a-z0-9])`).test(t);
}
/**
 * An answer or an option as it may be printed: as written, and without its leading article ("a catalyst" as "catalyst"),
 * when what is left is a word, never a number ("A one", an option lettered A, is not the number 1).
 */
function namedIn(answer, text) {
  const t = String(answer ?? "").trim();
  const bare = t.replace(ARTICLE, "");
  return printedIn(t, text) || (bare !== t && !NUMBER.test(normalised(plain(bare))) && printedIn(bare, text));
}
/** A gate that asks for the one left out ("Which of these is NOT …", "all except …"). */
const EXCEPTION = /\b(?:not|except|never)\b/i;
/** Where a See it prints a gate's answer: "step 2", "the final answer", "step 3's reason", or null. */
function answerShownIn(gate, see, bundle) {
  const we = typeof see.workedExample === "string" ? (bundle?.workedExamples ?? []).find((w) => w.id === see.workedExample) : null;
  const steps = we ? (we.steps ?? []) : Array.isArray(see.steps) ? see.steps : [];
  const finalAnswer = we ? we.finalAnswer : see.finalAnswer;
  const choice = gate.kind === "choice";
  const answer = String(gate.answer ?? "").trim();
  const others = choice ? (Array.isArray(gate.options) ? gate.options : []).map((o) => String(o ?? "").trim()).filter((o) => o && o !== answer) : [];
  // a number is a whole result wherever it stands; a word counts in a sentence that names no other option (a sentence
  // naming two options states a rule or a contrast between them)
  const shownIn = (alt, text) => (NUMBER.test(normalised(plain(alt))) ? printedIn(alt, text) : sentences(text).some((c) => namedIn(alt, c) && !others.some((o) => namedIn(o, c))));
  // the See it's own result names another option and not this one: it worked a case with another answer, so a reason
  // that names this one teaches the contrast (unless the gate asks for the one left out)
  const result = finalAnswer || steps[steps.length - 1]?.working || "";
  const otherCase = choice && !EXCEPTION.test(String(gate.prompt ?? "")) && others.some((o) => namedIn(o, result)) && !namedIn(answer, result);
  // every alternative of a typed gate ("backwards | back"; a number gate's "10 | 10.0"), as the app reads them
  const alternatives = (choice ? [answer] : answer.split("|")).map((s) => s.trim()).filter(Boolean);
  for (const alt of alternatives) {
    const k = steps.findIndex((s) => shownIn(alt, s?.working));
    if (k >= 0) return { answer: alt, where: `step ${k + 1}` };
    if (shownIn(alt, finalAnswer)) return { answer: alt, where: "the final answer" };
  }
  if (!otherCase)
    for (const alt of alternatives) {
      const k = steps.findIndex((s) => shownIn(alt, s?.decision));
      if (k >= 0) return { answer: alt, where: `step ${k + 1}'s reason` };
    }
  return null;
}

/**
 * A See it block's own problems (the ones the build lets through).
 * @param {object} block  a `see` block
 * @param {{codes?: string[], bundle?: object}} ctx  the subject's step mark codes; the bundle, to resolve a reference
 * @returns {string[]}
 */
export function seeBlockProblems(block, { codes = [], bundle } = {}) {
  const out = [];
  if (typeof block.workedExample === "string") {
    const we = (bundle?.workedExamples ?? []).find((w) => w.id === block.workedExample);
    if (we?.faded?.length)
      out.push(`names ${block.workedExample}, which the path also serves as a faded run: work the See it inline on new numbers (a note must not work what a later item asks)`);
    (we?.steps ?? []).forEach((s, k) => {
      const n = reasonWords(s.decision);
      if (n > REASON_WORDS) out.push(`step ${k + 1}'s reason is ${n} words (at most ${REASON_WORDS})`);
    });
    return out;
  }
  if (unclosed(block.stem)) out.push("the stem has an unclosed $");
  const code = codes.length ? new RegExp(`^(${codes.join("|")})\\d?$`) : null;
  (Array.isArray(block.steps) ? block.steps : []).forEach((s, k) => {
    const at = `step ${k + 1}`;
    const n = reasonWords(s?.decision);
    if (n > REASON_WORDS) out.push(`${at}'s reason is ${n} words (at most ${REASON_WORDS})`);
    if (unclosed(s?.working)) out.push(`${at}'s working has an unclosed $`);
    if (unclosed(s?.decision)) out.push(`${at}'s reason has an unclosed $`);
    if (code) for (const e of s?.earns ?? []) if (!code.test(String(e))) out.push(`${at} earns "${e}", not a mark in this subject's language (${codes.join(", ")})`);
    if (s?.whyMenu !== undefined) out.push(`${at} carries a whyMenu, which a See it does not use (the Your turn is the check)`);
  });
  if (unclosed(block.finalAnswer)) out.push("the final answer has an unclosed $");
  return out;
}

/** The steps a See it shows: its own, or those of the worked example it names (0 when the bundle does not hold it). */
function stepsOf(block, bundle) {
  if (typeof block.workedExample === "string") return ((bundle?.workedExamples ?? []).find((w) => w.id === block.workedExample)?.steps ?? []).length;
  return Array.isArray(block.steps) ? block.steps.length : 0;
}

/**
 * The v3 structure of one note.
 * @param {Array<object>} blocks  note.blocks.json
 * @param {{codes?: string[], bundle?: object, positional?: (explain: string | null) => string | null}} ctx  the step mark codes; the bundle; gate-order.ts positionalWording
 */
export function seeItFindings(blocks, { codes = [], bundle, positional } = {}) {
  const recapAt = blocks.findIndex(isRecap);
  const pointerAt = blocks.findIndex(isPointer);
  const end = recapAt >= 0 ? recapAt : pointerAt >= 0 ? pointerAt : blocks.length;
  const body = blocks.slice(0, end).filter((b) => b.type !== "hero");

  // A "See it done" heading (role see) continues the section above, but it opens a new stretch (`segs`) inside it: the
  // Your turn before it is not "run on" by the See it done that follows, and each stretch has its own one or two turns
  // (the teach-first case §8.5: "Your turn g3, then g7", then "See it done at writing speed … Your turn g4").
  const sections = [{ index: 0, heading: "(opening)", role: null, items: [], segs: [] }];
  let headingNo = 0;
  for (const b of body) {
    const s = sections[sections.length - 1];
    if (b.type === "h") {
      headingNo += 1;
      if (b.role === "see") {
        s.seg = (s.seg ?? 0) + 1;
        continue;
      }
      sections.push({ index: headingNo, heading: String(b.text ?? ""), role: b.role ?? null, items: [], segs: [] });
    } else {
      s.items.push(b);
      s.segs.push(s.seg ?? 0);
    }
  }

  const findings = [];
  let gates = 0;
  let gatesAfterSee = 0;
  let seeBlocks = 0;
  let seeSteps = 0;
  let firstGate = true;
  let firstCheck = null;
  for (const s of sections) {
    const where = `"${s.heading}"`;
    let seen = false;
    const shown = []; // the section's See it blocks so far
    s.items.forEach((b, k) => {
      if (b.type === "see") {
        seen = true;
        shown.push(b);
        seeBlocks += 1;
        seeSteps += stepsOf(b, bundle);
        for (const p of seeBlockProblems(b, { codes, bundle })) findings.push({ kind: "block", section: s.heading, detail: `See it in ${where}: ${p}` });
        return;
      }
      if (b.type !== "gate") return;
      gates += 1;
      if (seen) gatesAfterSee += 1;
      else findings.push({ kind: "see-missing", gate: b.id, section: s.heading, detail: `gate ${b.id} in ${where} has no See it before it in its section (explain → See it → Your turn)` });
      if (firstGate) {
        firstGate = false;
        firstCheck = seen && !warmUp(b.prompt);
        if (warmUp(b.prompt))
          findings.push({ kind: "first-check", gate: b.id, section: s.heading, detail: `the topic's first check, gate ${b.id}, is an interface warm-up; ask a real question answerable from the first See it` });
        else if (!seen)
          findings.push({ kind: "first-check", gate: b.id, section: s.heading, detail: `the topic's first check, gate ${b.id}, does not follow a See it in its section; it must be answerable from the first See it` });
      }
      // the choice gates gate-order shuffles: kind choice, two options or more (its isChoiceGate)
      if (positional && b.kind === "choice" && (b.options ?? []).length >= 2) {
        const own = positional(typeof b.explain === "string" ? b.explain : null);
        if (own) findings.push({ kind: "option-position", gate: b.id, section: s.heading, detail: `gate ${b.id}: its explanation names an option by its place ("${own}"): ${PINNED}` });
        const theirs = b.twin ? positional(typeof b.twin.explain === "string" ? b.twin.explain : null) : null;
        if (theirs) findings.push({ kind: "option-position", gate: b.id, section: s.heading, detail: `gate ${b.id}: its twin's explanation names an option by its place ("${theirs}"): ${PINNED_TWIN}` });
      }
      // its answer printed in a See it of its own section, shown before it
      for (const v of shown) {
        const hit = answerShownIn(b, v, bundle);
        if (!hit) continue;
        findings.push({ kind: "answer-shown", gate: b.id, section: s.heading, detail: `gate ${b.id}'s answer "${hit.answer}" is printed in its section's See it (${hit.where}): she can copy it rather than do it; ask it on new numbers, as a twin does` });
        break;
      }
      // a miss re-teaches in at most 60 words (the case §6.3), the twin's too
      for (const [whose, text] of [["explanation", b.explain], ["twin explanation", b.twin?.explain]]) {
        const n = text === undefined ? 0 : reasonWords(text);
        if (n > RETEACH_WORDS) findings.push({ kind: "reteach", gate: b.id, section: s.heading, detail: `gate ${b.id}'s ${whose} is ${n} words (a miss re-teaches in at most ${RETEACH_WORDS})` });
      }
      // the twin is the same structure on new numbers, with its own answer (the case §6.3)
      if (b.twin) {
        const same = (x, y) => String(x ?? "").replace(/\s+/g, " ").trim() === String(y ?? "").replace(/\s+/g, " ").trim();
        const repeats = [same(b.twin.prompt, b.prompt) ? "prompt" : "", same(b.twin.answer, b.answer) ? "answer" : ""].filter(Boolean);
        if (repeats.length) findings.push({ kind: "twin", gate: b.id, section: s.heading, detail: `gate ${b.id}'s twin repeats its ${repeats.join(" and ")} (a twin is the same structure on new numbers, with its own answer)` });
      }
      // a check spends its See it, unless the next block is another gate (two turns on one See it)
      if (s.items[k + 1]?.type !== "gate") seen = false;
    });

    const gateAt = s.items.map((b, k) => (b.type === "gate" ? k : -1)).filter((k) => k >= 0);
    // run-on and the count of turns are judged within a stretch: a "See it done" that follows a Your turn is not a run-on
    for (const k of gateAt) {
      const after = s.items.slice(k + 1).filter((_, j) => s.segs[k + 1 + j] === s.segs[k]);
      if (after.length && after[0].type !== "gate")
        findings.push({ kind: "turn-last", gate: s.items[k].id, section: s.heading, detail: `the section ${where} runs on after its Your turn, gate ${s.items[k].id}: ${after.length} block(s) follow it (a section ends in its Your turn; split it here)` });
    }
    for (const seg of new Set(gateAt.map((k) => s.segs[k]))) {
      const n = gateAt.filter((k) => s.segs[k] === seg).length;
      if (n > TURNS_MAX) findings.push({ kind: "turns", section: s.heading, detail: `${n} gates in ${where}${seg ? " (its See it done)" : ""} (one Your turn, two only where the section showed two variants)` });
    }

    // a video or a sim stands beside a See it, never instead of it (the case §6.2 and §8.3; the owner's answer 4)
    const seeAt = s.items.findIndex((b) => b.type === "see");
    const visualAt = s.items.findIndex((b) => b.type === "video" || b.type === "sim");
    const what = visualAt >= 0 ? `a ${s.items[visualAt].type}` : "";
    if (visualAt >= 0 && seeAt < 0) findings.push({ kind: "video", section: s.heading, detail: `${what} is the only See it in ${where}: our own worked steps come first, the ${s.items[visualAt].type} beside them` });
    else if (visualAt >= 0 && visualAt < seeAt) findings.push({ kind: "video", section: s.heading, detail: `${what} stands before the See it in ${where}: our own worked steps come first, the ${s.items[visualAt].type} beside them` });

    // explain: one to three blocks, at most 225 words in all, before the See it (the case §6.2 and §8.3)
    const upTo = seeAt >= 0 ? seeAt : gateAt.length ? gateAt[0] : s.items.length;
    const explainBlocks = s.items.slice(0, upTo).filter((b) => b.type === "p" || b.type === "callout");
    const explain = explainBlocks.reduce((a, b) => a + words(b.md), 0);
    const before = seeAt >= 0 ? "before its See it" : gateAt.length ? "before its Your turn" : "with no Your turn";
    if (explain > EXPLAIN_MAX) findings.push({ kind: "explain-long", section: s.heading, detail: `${explain} words of explanation in ${where} ${before} (at most ${EXPLAIN_MAX}: split the section)` });
    // Not in an "Exam twists" section: the depth standard asks one paragraph of ≤ 40 words per twist, and at least four
    // twists for H5, so its paragraphs are the twists themselves (a conflict of the two texts, put to the coordinator on
    // 27 Sep 2026; the 225 words still apply).
    if (explainBlocks.length > EXPLAIN_BLOCKS && (seeAt >= 0 || gateAt.length) && s.role !== "twists")
      findings.push({ kind: "explain-blocks", section: s.heading, detail: `${explainBlocks.length} explanation blocks in ${where} ${before} (at most ${EXPLAIN_BLOCKS}: split the section)` });
  }

  const gated = sections.filter((s) => s.items.some((b) => b.type === "gate"));
  const seeFirst = (s) => {
    const g = s.items.findIndex((b) => b.type === "gate");
    const v = s.items.findIndex((b) => b.type === "see");
    return v >= 0 && v < g;
  };
  const variants = sections.filter((s) => s.role === "variant");
  return {
    sections: sections.map((s) => ({ index: s.index, heading: s.heading, role: s.role, blocks: s.items.length })),
    gates,
    gatesAfterSee,
    seeBlocks,
    seeSteps,
    gatedSections: gated.length,
    gatedSectionsWithSee: gated.filter(seeFirst).length,
    variantSections: variants.length,
    variantsWithSee: variants.filter((s) => s.items.some((b) => b.type === "see")).length,
    firstCheck,
    findings,
  };
}
