/**
 * scripts/qa/prompt-few.mjs — retrieval prompts are few, optional and short (the owner's verdict of
 * 24 Sep 2026, 23:40, after trying Slides: "one or two short recall prompts per topic, never four by
 * habit", never essay-like). pipeline/prompts/author-topic.md, Depth standard, carries the rule;
 * scripts/qa/lesson-v2.mjs reports what this finds as warnings.
 *
 *   wired  the note wires more than WIRED_MAX distinct retrieval prompts (`prompt` blocks);
 *   long   a shipped retrieval prompt of the bundle expects an answer of more than ANSWER_WORDS words,
 *          whether the note wires it or not (the review queue asks it all the same).
 *
 * Only shipped prompts count, by the pipeline's rule: a verification log found by the prompt's id
 * (`itemId`) with status verified or published; anything else is a draft the app never ships.
 */

export const WIRED_MAX = 2;
export const ANSWER_WORDS = 25;
const SHIPPABLE = new Set(["verified", "published"]);

const words = (s) => String(s ?? "").split(/\s+/).filter(Boolean).length;

/**
 * @param {Array<object>} blocks  note.blocks.json
 * @param {object} bundle         bundle.json
 * @returns {Array<{kind:"wired", count:number, ids:string[], detail:string} | {kind:"long", id:string, words:number, wired:boolean, detail:string}>}
 */
export function promptFindings(blocks, bundle) {
  const logs = bundle?.verification ?? [];
  const shipped = (bundle?.prompts ?? []).filter((p) => SHIPPABLE.has(logs.find((l) => l.itemId === p.id)?.status));
  const wired = [...new Set((blocks ?? []).filter((b) => b.type === "prompt").map((b) => b.promptId))];
  const out = [];
  if (wired.length > WIRED_MAX)
    out.push({ kind: "wired", count: wired.length, ids: wired, detail: `the note wires ${wired.length} retrieval prompts (at most ${WIRED_MAX}: few, optional and short)` });
  for (const p of shipped) {
    const n = words(p.answer);
    if (n > ANSWER_WORDS)
      out.push({ kind: "long", id: p.id, words: n, wired: wired.includes(p.id), detail: `prompt ${p.id} expects a ${n}-word answer (at most ${ANSWER_WORDS}: a short recall, never an essay)` });
  }
  return out;
}
