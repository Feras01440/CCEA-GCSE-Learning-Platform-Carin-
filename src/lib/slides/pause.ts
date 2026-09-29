/**
 * Stopping points in a deck (the owner, 29 Sep 2026: "keep a stopping point in Slides: Read has Pause here, and Slides
 * drops it"; the rule stays length by need with stopping points, never shorter teaching). Pure: no React, no storage.
 *
 * A stop stands where a section's work is done: after its Your turn, once it is answered (on a miss, after the re-teach
 * and the answer she asked to see). That card, answered, offers "Pause here" beside Continue, as Read's section end
 * does; pressing it keeps the card after the stop as her place (./place.ts), and the slides open there next time.
 *  - Two Your turns on one See it are one stop, after the second: a pause never leaves a check of its section behind.
 *  - The retries owed before the recap follow the last section's Your turn: the stop moves past them, to the recap.
 *  - No stop before the close (nothing is left to come back to), and none inside a re-teach, which is its Your turn's
 *    own phase and not a card; so no two stops are ever in a row, and the card a stop opens on is never a Your turn.
 *  - A two-part break, when a deck has one (proposed in the grammar agent's STATE, not built), would be a stop of its
 *    own at the break.
 * Where she left a run without pausing (a closed tab, a reload), `resumeIndex` keeps the same promise: a Your turn she
 * has not answered opens on its See it, the tap before it.
 */
import type { Card } from "./cards";
import { partsOfCards, slidesMinutes } from "./minutes";
import { spokenText } from "./text";

export interface PausePoint {
  /** The card whose answered state offers "Pause here": a section's last Your turn, or the last retry before the recap. */
  after: string;
  /** Where the slides open next time: the card after the stop. */
  resume: string;
  /** `resume`'s index in the cards given. */
  resumeAt: number;
}

/** The deck's stops, in order, for the cards as the run deals them (withRetries: a missed Your turn's retry included). */
export function pausePoints(cards: readonly Card[]): PausePoint[] {
  const out: PausePoint[] = [];
  for (let i = 0; i + 1 < cards.length; i += 1) {
    const here = cards[i]!;
    const next = cards[i + 1]!;
    // After the last of a run of Your turns (a retry is one too): the section's work is done.
    if (here.kind !== "gate" || next.kind === "gate" || next.kind === "close") continue;
    out.push({ after: here.key, resume: next.key, resumeAt: i + 1 });
  }
  return out;
}

/** What a place in the deck says, as Today words it: what opens there next, and the teaching sections done of all. */
export interface PlaceWords {
  /** The section's own title (as the spine lists it), or "the recap" once the teaching is done. */
  next: string;
  done: number;
  total: number;
}

export const RECAP_WORDS = "the recap";

export function placeWords(cards: readonly Card[], at: number): PlaceWords {
  const sections = cards.flatMap((c) => ("section" in c && c.section && c.section.n > 0 ? [c.section] : []));
  const total = sections.reduce((n, s) => Math.max(n, s.total), 0);
  const card = cards[Math.max(0, Math.min(at, cards.length - 1))];
  if (!card) return { next: RECAP_WORDS, done: total, total };
  // A title in plain words: Today prints it as text, so its maths is said, not typeset ("x squared").
  const said = (s: { title: string; heading: string }) => spokenText(s.title || s.heading);
  if (card.kind === "title") return { next: sections[0] ? said(sections[0]) : RECAP_WORDS, done: 0, total };
  // A retry stands before the recap whatever section its Your turn was in: the teaching is done by then.
  const section = "section" in card && card.section && card.section.n > 0 && !(card.kind === "gate" && card.retry) ? card.section : null;
  if (section) return { next: said(section), done: section.n - 1, total };
  return { next: RECAP_WORDS, done: total, total };
}

/** Minutes left from the card at `at` to the close, by the deck's own model (./minutes.ts); 0 once nothing is left. */
export function minutesLeft(cards: readonly Card[], at: number): number {
  const rest = cards.slice(Math.max(0, at));
  const parts = partsOfCards(rest);
  const acts = rest.filter((c) => c.kind === "interaction").length;
  if (parts.length === 0 && acts === 0) return 0;
  return slidesMinutes(parts, acts);
}

/**
 * Where a run opens, given the card she was on: that card, unless it is a Your turn she has not answered (its first
 * asking, not a retry), which opens on its See it instead, so she is never dropped onto a check she has not re-read for;
 * the See it offers "Your turn" as its last control, or "Skip to your turn" on a return visit. A Your turn with no See it
 * (a note in the v2 shape) opens on its section's first card.
 */
export function resumeIndex(cards: readonly Card[], at: number, answered: (gateId: string) => boolean): number {
  const card = cards[at];
  if (!card || card.kind !== "gate" || card.retry || answered(card.gate.id)) return at;
  const seeAt = card.seeKey ? cards.findIndex((c) => c.key === card.seeKey) : -1;
  if (seeAt >= 0 && seeAt < at) return seeAt;
  const n = card.section?.n ?? 0;
  if (n <= 0) return at;
  const first = cards.findIndex((c) => "section" in c && c.section?.n === n && c.kind !== "gate");
  return first >= 0 && first < at ? first : at;
}
