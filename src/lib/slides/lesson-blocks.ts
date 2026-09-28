/**
 * The note as the lesson shows it, in both ways in: which blocks of note.blocks.json she meets in the lesson itself, and
 * which the hero or the title card has already shown her. Pure, with no imports at all, so that the minute model
 * (./minutes.ts), the Read page (src/components/topic/lesson-plan.ts, which re-exports every name here), the Slides deck
 * (./cards.ts) and the content session's lint (through tsx) all read one definition.
 *
 * Moved here unchanged from lesson-plan.ts on 29 Sep 2026 (the minutes agent), so that the minute model can price a
 * whole note without importing the page's module and the content manifest behind it; `ledeOf` and `closingRoleOf` are
 * the two rules that were written inline where they were used (heroDataFor, and the deck's withClosingRoles).
 */

type Block = Record<string, unknown>;

const isBlock = (b: unknown): b is Block => typeof b === "object" && b !== null;
const blockType = (b: unknown): string => (isBlock(b) && typeof b.type === "string" ? b.type : "");
const str = (v: unknown): string => (typeof v === "string" ? v : "");

/**
 * The hero's lede: the `hero` block's own, or, for a note without one, its first paragraph (what the hero then shows).
 * lesson-plan.ts heroDataFor reads the lede here, and the lesson leaves out what it already says (lessonBlocks).
 */
export function ledeOf(blocks: readonly unknown[] | null | undefined): string {
  const list = blocks ?? [];
  const hero = list.find((b) => blockType(b) === "hero");
  if (isBlock(hero)) return str(hero.lede);
  const firstParagraph = list.find((b) => blockType(b) === "p");
  return isBlock(firstParagraph) ? str(firstParagraph.md) : "";
}

/** The first figure or photo in the note, which the hero promotes and the lesson therefore skips. */
export function hoistedFigureIndex(blocks: readonly unknown[] | null | undefined): number {
  const list = blocks ?? [];
  for (let i = 0; i < list.length; i += 1) {
    const t = blockType(list[i]);
    if (t === "photo") return i;
    if (t === "figure" && str((list[i] as Block).svg)) return i;
  }
  return -1;
}

const RECAP = /^\s*you can now\b/i;
const POINTER = /^\s*in the exam\b/i;

/**
 * A heading's closing role: "recap" ("You can now") or "pointer" ("In the exam"), else null. A role the author gave
 * decides (read trimmed, as src/lib/slides/readiness.ts reads roles); a heading written before the roles existed, with
 * no role at all, is read by its words, as the deck always read the close (cards.ts withClosingRoles).
 */
export function closingRoleOf(heading: unknown): "recap" | "pointer" | null {
  if (blockType(heading) !== "h") return null;
  const given = str((heading as Block).role);
  if (given) {
    const role = given.trim();
    return role === "recap" || role === "pointer" ? role : null;
  }
  const text = str((heading as Block).text);
  return RECAP.test(text) ? "recap" : POINTER.test(text) ? "pointer" : null;
}

/**
 * Markdown normalised for comparison: emphasis and maths markers dropped, whitespace collapsed.
 * Kept with an index back into the raw string so a prefix match can be cut from the raw markdown.
 */
function normalisedWithMap(md: string): { text: string; map: number[] } {
  let text = "";
  const map: number[] = [];
  let pendingSpace = false;
  for (let i = 0; i < md.length; i += 1) {
    const ch = md[i];
    if (ch === "*" || ch === "_" || ch === "`" || ch === "$" || ch === "\\") continue;
    if (/\s/.test(ch)) {
      pendingSpace = text.length > 0;
      continue;
    }
    if (pendingSpace) {
      text += " ";
      map.push(i);
      pendingSpace = false;
    }
    text += ch.toLowerCase();
    map.push(i);
  }
  return { text, map };
}

/** The end offset of each sentence in a string, for cutting an opening the hero has taken. */
function sentenceEnds(s: string): number[] {
  const ends: number[] = [];
  for (const m of s.matchAll(/[.!?](?=["')\]]*(\s|$))/g)) ends.push(m.index + m[0].length);
  if (ends[ends.length - 1] !== s.length) ends.push(s.length);
  return ends;
}

/**
 * What is left of a paragraph once the hero has said its opening: the raw markdown after the
 * sentences the lede already carries, "" when the paragraph says nothing else, or null when this
 * paragraph is not the hero's. Sentence by sentence, because the pipeline lifts a lede and then
 * edits its punctuation. A cut that would leave unbalanced emphasis or maths markers is refused.
 */
export function paragraphAfterLede(md: string, lede: string): string | null {
  const wanted = normalisedWithMap(lede).text;
  if (wanted.length < 24) return null;
  let cut = 0;
  for (const end of sentenceEnds(md)) {
    const sentence = normalisedWithMap(md.slice(cut, end)).text;
    if (sentence.length < 24 || !wanted.includes(sentence)) break;
    cut = end;
  }
  if (cut === 0) return null;
  const removed = md.slice(0, cut);
  if ((removed.match(/\*\*/g) ?? []).length % 2 !== 0 || (removed.match(/\$/g) ?? []).length % 2 !== 0) return null;
  return md.slice(cut).replace(/^[\s.;:,—–-]+/, "");
}

/**
 * The note as the lesson renders it: the hero block gone, the hoisted figure gone, and the
 * opening the hero already says trimmed off the first paragraph. The pipeline writes most ledes
 * by lifting the note's first sentences, and nobody should read the same sentence twice.
 */
export function lessonBlocks<T>(blocks: readonly T[] | null | undefined, lede?: string): T[] {
  const list = blocks ?? [];
  const hoisted = hoistedFigureIndex(list);
  const out: T[] = [];
  let firstParagraph = true;
  for (let i = 0; i < list.length; i += 1) {
    const b = list[i];
    const type = blockType(b);
    if (type === "hero" || i === hoisted) continue;
    if (type === "p" && firstParagraph) {
      firstParagraph = false;
      const rest = lede ? paragraphAfterLede(str((b as Block).md), lede) : null;
      if (rest !== null) {
        if (rest.trim().length === 0) continue;
        out.push({ ...(b as Block), md: rest } as T);
        continue;
      }
    }
    out.push(b);
  }
  // A heading with nothing left under it is not a section: the hero has taken its paragraph.
  const kept = out.filter((b, i) => !(blockType(b) === "h" && blockType(out[i + 1]) === "h"));
  return withPauses(kept);
}

/**
 * A "Pause here" block at every section boundary: before each heading after the first (02-surfaces.md §3.3). A
 * twenty-minute school night does not end where the lesson does, so every boundary is a place to stop, not one in
 * the middle. The note shows a pause only once the stretch before it is open (nothing after an unanswered gate
 * renders), so it appears as she finishes a section. A pause block is not a section: the spine never counts it.
 */
export function withPauses<T>(blocks: readonly T[]): T[] {
  const out: T[] = [];
  let headings = 0;
  for (const b of blocks) {
    if (blockType(b) === "h") {
      headings += 1;
      if (headings > 1) out.push({ type: "pause" } as T);
    }
    out.push(b);
  }
  return out;
}
