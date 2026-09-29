/**
 * scripts/qa/lesson-model.mjs — the app's own lesson model, read by the lint (scripts/qa/lesson-v2.mjs) so that the two
 * never differ (the lead's items e and f, 29 Sep 2026):
 *
 *   minutes   the minutes the pack's hero states (`hero.minutes`) against the minutes the app prints for the lesson, Read's,
 *             from src/lib/slides/minutes.ts lessonMinutesFor (the hero line, the track and the Contents all print them; the
 *             authored number stands in only for a note with nothing to measure). Report only: since the lead's ruling of
 *             29 Sep 2026, 18:00, the content build ships the model's number in the hero (src/lib/build/hero-minutes.ts),
 *             so a different authored number never reaches her; the line says how many the build replaces.
 *   recall    the retrieval prompts a note wires (its `prompt` blocks) that the lesson leaves out, each with the reason
 *             src/lib/slides/recall.ts gives (recallFit), and the recall cards it keeps (shownPrompts: THE rule for the
 *             prompts a lesson asks inside itself, in Read and in Slides; a prompt left out waits with the topic's other
 *             prompts under "Say it from memory").
 *
 * Pure: the app's TypeScript modules are passed in (lesson-v2 loads them through tsx, the tests import them), never
 * copied, so a change to the model is a change to the lint.
 *
 * No tolerance: the build ships the model's own number (lessonTotal rounds the lesson's work once to the nearest minute,
 * never below a minute a part), so any other authored number is one the build replaces.
 */

/**
 * The hero's stated minutes against the model's Read minutes, or null when they are the same number (or the note states
 * none: the hero check says so). Report only.
 * @param {any[]} blocks  note.blocks.json
 * @param {any} model  lessonMinutesFor's result for this note
 * @param {any} minutes  src/lib/slides/minutes.ts (partWork, partWords, WORDS_PER_MINUTE)
 * @returns {null | { stated: number, model: number, work: number, words: number, seconds: number, detail: string }}
 */
export function heroMinutesFinding(blocks, model, minutes) {
  const hero = (Array.isArray(blocks) ? blocks : []).find((b) => b && b.type === "hero");
  if (!hero || typeof hero.minutes !== "number") return null;
  const stated = hero.minutes;
  const priced = model.read.minutes;
  const work = model.read.parts.reduce((n, p) => n + minutes.partWork(p), 0);
  if (stated === priced) return null;
  const words = model.read.parts.reduce((n, p) => n + minutes.partWords(p), 0);
  const seconds = model.read.parts.reduce((n, p) => n + p.seconds, 0);
  const clock = `${Math.floor(seconds / 60)} min ${String(Math.round(seconds % 60)).padStart(2, "0")} s`;
  return {
    stated,
    model: priced,
    work,
    words,
    seconds,
    detail: `the pack's hero.minutes is ${stated}; the app's minute model (src/lib/slides/minutes.ts) gives ${priced}: ${work.toFixed(1)} min of work, ${words} words read at ${minutes.WORDS_PER_MINUTE} a minute and ${clock} of See it steps, Your turns, figures, videos and recall cards, rounded once; the build ships ${priced}`,
  };
}

/**
 * The prompts a note wires that the lesson leaves out, in the note's order, with recall.ts's reasons; and the ones it keeps.
 * @param {any[]} blocks  note.blocks.json
 * @param {{ shipped: any[], all: any[], logs: any[] }} prompts  the bundle's prompts that ship (log
 *   verified or published, the build's rule), all it holds, and its verification logs (to say why one does not ship)
 * @param {any} recall  src/lib/slides/recall.ts (recallFit, shownPrompts, RECALL_MAX)
 * @returns {{ wired: string[], kept: string[], leftOut: Array<{ id: string, kind: "unfit" | "unshipped" | "over", reasons: string[], expected: string | null, detail: string }> }}
 */
export function recallFindings(blocks, { shipped, all, logs }, recall) {
  const list = Array.isArray(blocks) ? blocks : [];
  const wired = list.filter((b) => b && b.type === "prompt" && typeof b.promptId === "string").map((b) => b.promptId);
  const kept = recall.shownPrompts(list, shipped).map((p) => p.id);
  const keptSet = new Set(kept);
  const byId = new Map(shipped.map((p) => [p.id, p]));
  const leftOut = [];
  for (const id of wired) {
    if (keptSet.has(id)) continue;
    const p = byId.get(id);
    let kind;
    let reasons;
    let expected = null;
    if (!p) {
      kind = "unshipped";
      const held = all.some((x) => x.id === id);
      const log = logs.find((l) => l.itemId === id);
      reasons = [!held ? "the bundle holds no prompt with this id" : log ? `the bundle does not ship it (its log says "${log.status}")` : "the bundle does not ship it (it has no verification log)"];
    } else {
      const fit = recall.recallFit(p);
      expected = fit.expected;
      if (!fit.ok) {
        kind = "unfit";
        reasons = fit.reasons;
      } else {
        kind = "over";
        reasons = [`it fits, but a lesson keeps at most ${recall.RECALL_MAX} recall cards and keeps the lighter ${kept.join(" and ")}`];
      }
    }
    const said = expected && kind === "unfit" ? ` (the answer she would give: "${expected}")` : "";
    leftOut.push({ id, kind, reasons, expected, detail: `prompt ${id} is wired but the lesson leaves it out (Read and Slides, src/lib/slides/recall.ts): ${reasons.join("; ")}${said}` });
  }
  return { wired, kept, leftOut };
}
