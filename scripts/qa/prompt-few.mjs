/**
 * scripts/qa/prompt-few.mjs — retrieval prompts are few, optional and short (the owner's verdict of
 * 24 Sep 2026, 23:40, after trying Slides: "one or two short recall prompts per topic, never four by
 * habit", never essay-like; and the owner's answer 3 of 27 Sep 2026: at most two recall cards, each with
 * Skip, a question of at most 15 words, an answer of about 12 words, 25 the hard cap).
 * pipeline/prompts/author-topic.md (Lesson template v2 item 6 and the Depth standard) carries the rule;
 * scripts/qa/lesson-v2.mjs reports what this finds as warnings.
 *
 *   wired     the note wires more than WIRED_MAX distinct retrieval prompts (`prompt` blocks);
 *   long      a shipped retrieval prompt of the bundle expects an answer of more than ANSWER_WORDS words,
 *             whether the note wires it or not (the review queue asks it all the same);
 *   numbered  a shipped prompt's answer is a numbered list: a procedure, which is the recap's job, never a
 *             prompt's (the teach-first case §8.4);
 *   question  a wired prompt's question runs past QUESTION_WORDS words (a recall card is read at a glance;
 *             the bundle's unwired prompts, for the flashcards deck, are held only to the answer cap).
 *
 * promptTargets lists, for a report line only and never as a warning, every shipped answer over the
 * ANSWER_TARGET of 12 words (the case's target; 25 is the cap).
 *
 *   examiner  a shipped prompt carries an examiner's finding (a series named, "examiners", "candidates"): that is
 *             the Sheet's trap with its series, never a prompt (the case §7).
 *
 * Words: "a fraction or a formula counts as one word" (the case §7, 27 Sep 2026), so a maths segment ($…$, $$…$$)
 * is one word and a sign standing alone ("a² − b²") is none. Until 27 Sep the text was split at spaces, which
 * counted "$x^2 + 5x + 6$" as five words; the new count only ever lowers a number.
 * Only shipped prompts count, by the pipeline's rule: a verification log found by the prompt's id
 * (`itemId`) with status verified or published; anything else is a draft the app never ships.
 */

export const WIRED_MAX = 2;
export const ANSWER_WORDS = 25;
export const ANSWER_TARGET = 12;
export const QUESTION_WORDS = 15;
const SHIPPABLE = new Set(["verified", "published"]);

const MATHS = /\$\$[\s\S]+?\$\$|\$[^$]+\$/g;
export const words = (s) =>
  String(s ?? "")
    .replace(MATHS, " m ")
    .split(/\s+/)
    .filter((w) => /[\p{L}\p{N}]/u.test(w)).length;

/** An examiner's finding in a prompt: a series named ("Summer 2025"), "examiners", "candidates". Calibrated 27 Sep 2026 on the 1,662 shipped prompts: 34 hits, every one a finding. */
const EXAMINER = /\b(?:summer|winter|november|june|january|march|autumn|spring)\s+(?:19|20)\d\d\b|\bexaminers?\b|\bcandidates\b/i;
export const examinerFinding = (s) => EXAMINER.exec(String(s ?? ""))?.[0] ?? null;

const shippedPrompts = (bundle) => {
  const logs = bundle?.verification ?? [];
  return (bundle?.prompts ?? []).filter((p) => SHIPPABLE.has(logs.find((l) => l.itemId === p.id)?.status));
};
const wiredIds = (blocks) => [...new Set((blocks ?? []).filter((b) => b.type === "prompt").map((b) => b.promptId))];

/**
 * An answer written as a numbered list: the labels 1 and 2 both appear, in that order, as list labels ("1." "1)"
 * "(1)" "Step 1"), at the start of the text or of a line, or after a space. A decimal ("1.5") is not a label, and
 * one number ending a sentence ("Divide by 2.") is not a list.
 */
const LABEL = /(?:^|[\s:;,])(?:\((\d)\)|(\d)[.)](?=\s)|[Ss]tep\s+(\d)\b)/g;
export function numberedList(answer) {
  const labels = [...String(answer ?? "").matchAll(LABEL)].map((m) => Number(m[1] ?? m[2] ?? m[3]));
  const one = labels.indexOf(1);
  return one >= 0 && labels.indexOf(2, one + 1) > one;
}

/**
 * @param {Array<object>} blocks  note.blocks.json
 * @param {object} bundle         bundle.json
 * @returns {Array<{kind:"wired", count:number, ids:string[], detail:string} | {kind:"long"|"examiner"|"numbered"|"question", id:string, words?:number, wired:boolean, detail:string}>}
 */
export function promptFindings(blocks, bundle) {
  const shipped = shippedPrompts(bundle);
  const wired = wiredIds(blocks);
  const out = [];
  if (wired.length > WIRED_MAX)
    out.push({ kind: "wired", count: wired.length, ids: wired, detail: `the note wires ${wired.length} retrieval prompts (at most ${WIRED_MAX}: few, optional and short)` });
  for (const p of shipped) {
    const n = words(p.answer);
    const isWired = wired.includes(p.id);
    if (n > ANSWER_WORDS)
      out.push({ kind: "long", id: p.id, words: n, wired: isWired, detail: `prompt ${p.id} expects a ${n}-word answer (at most ${ANSWER_WORDS}: a short recall, never an essay)` });
    const finding = examinerFinding(`${p.prompt ?? ""} ${p.answer ?? ""}`);
    if (finding)
      out.push({ kind: "examiner", id: p.id, wired: isWired, detail: `prompt ${p.id} carries an examiner's finding ("${finding}"): that is the Sheet's trap with its series, never a prompt` });
    if (numberedList(p.answer))
      out.push({ kind: "numbered", id: p.id, wired: isWired, detail: `prompt ${p.id} expects a numbered list (a procedure is the recap's job; a prompt is one fact)` });
    const q = words(p.prompt);
    if (isWired && q > QUESTION_WORDS)
      out.push({ kind: "question", id: p.id, words: q, wired: true, detail: `prompt ${p.id} asks a ${q}-word question (at most ${QUESTION_WORDS} on a recall card)` });
  }
  return out;
}

/**
 * Every shipped answer over the 12-word target, for the report line (never a warning).
 * @returns {Array<{id:string, words:number, wired:boolean}>}
 */
export function promptTargets(blocks, bundle) {
  const wired = wiredIds(blocks);
  return shippedPrompts(bundle)
    .map((p) => ({ id: p.id, words: words(p.answer), wired: wired.includes(p.id) }))
    .filter((t) => t.words > ANSWER_TARGET);
}
