/**
 * The hero's minutes as the content build ships them (the lead's ruling, 29 Sep 2026, 18:00). The topic page prints the
 * lesson's minutes from the app's own model (src/components/topic/lesson-plan.ts heroDataFor, reading
 * src/lib/slides/minutes.ts lessonMinutesFor) and lets the authored `hero.minutes` stand in only for a note with nothing
 * to measure, so the number in the pack is a guess the app almost never shows. pipeline/build-content.mts therefore
 * writes the model's own Read minutes into the shipped note's hero, priced on what ships (the shipped worked examples,
 * for a See it that names one, and the shipped prompts, for the recall cards the lesson keeps), exactly as the page and
 * scripts/qa/lesson-v2.mjs price it. For a note with nothing to measure lessonMinutesFor itself returns the authored
 * number, so that one is kept. The pack is never changed. Pure: a new array is returned and the input is untouched.
 */
import { lessonMinutesFor, type NoteInput } from "../slides/minutes";

const isHero = (b: unknown): b is Record<string, unknown> => typeof b === "object" && b !== null && (b as { type?: unknown }).type === "hero";

/**
 * The note's blocks with the hero's `minutes` set to the model's Read minutes (lessonMinutesFor(...).read.minutes).
 * A note without a hero is returned as a copy; a missing note stays null.
 * @param blocks note.blocks.json as the pack holds it
 * @param note what ships beside it: the shipped worked examples and prompts, and the topic id
 */
export function withModelMinutes(blocks: readonly unknown[] | null | undefined, note: Omit<NoteInput, "blocks"> = {}): unknown[] | null {
  if (!Array.isArray(blocks)) return null;
  const at = blocks.findIndex(isHero);
  if (at < 0) return [...blocks];
  const minutes = lessonMinutesFor({ ...note, blocks }).read.minutes;
  const out = [...blocks];
  out[at] = { ...(blocks[at] as Record<string, unknown>), minutes };
  return out;
}
