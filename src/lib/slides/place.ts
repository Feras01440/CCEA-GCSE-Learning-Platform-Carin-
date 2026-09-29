/**
 * Her place in a topic's slides as Today reads it (the owner, 29 Sep 2026: a paused deck shows on Today in the same row
 * as a paused Read lesson), kept beside the run the runner restores from (./position.ts). As Read keeps its place
 * (src/components/topic/read-place.ts): a record per lesson (`cairn.slides.place.<topicId>`), a pointer to the lesson
 * she last worked in (`cairn.slides.last`), and an event when they are written (`cairn:slides-place`). What it says is
 * the section that opens next and the minutes left, never a card number.
 *
 * Pure apart from the storage wrappers, which leave private mode and a full store with the place for the visit only.
 */
import type { Subject } from "@/lib/content/taxonomy";

export interface SlidesPlace {
  v: 1;
  /** The shipped bundle's id, "fm.u1.algebraic-fractions-simplify". */
  topicId: string;
  subject: Subject;
  /** The unit code, "FM1". */
  unit: string;
  slug: string;
  /** The hero's display title, "Simplifying algebraic fractions". */
  title: string;
  /** The card she is on, or opens on next after a pause: its key. */
  key: string;
  /** What opens next, in words: the section's title, or "the recap" (./pause.ts placeWords). */
  next: string;
  /** Teaching sections done, of `total`. */
  done: number;
  total: number;
  /** Minutes left, by the deck's own model (./pause.ts minutesLeft). */
  minutesLeft: number;
  /** The run reached its close. */
  finished: boolean;
  /** When the record last changed (ISO 8601). */
  updatedAt: string;
  /** Her last "Pause here" (ISO 8601) and the card it kept, until she moves on from that card. */
  pausedAt: string | null;
  pausedKey: string | null;
}

export const SLIDES_PLACE_KEY = (topicId: string): string => `cairn.slides.place.${topicId}`;
/** The lesson she last worked in, in Slides: `{ topicId, at }`. */
export const SLIDES_LAST_KEY = "cairn.slides.last";
/** Dispatched on window when a place is written, with the topic id as `detail`. */
export const SLIDES_PLACE_EVENT = "cairn:slides-place";

const isRecord = (v: unknown): v is Record<string, unknown> => typeof v === "object" && v !== null && !Array.isArray(v);
const count = (v: unknown): number | null => (typeof v === "number" && Number.isFinite(v) && v >= 0 ? Math.floor(v) : null);

export function parseSlidesPlace(raw: string | null): SlidesPlace | null {
  if (!raw) return null;
  try {
    const v = JSON.parse(raw) as unknown;
    if (!isRecord(v) || v.v !== 1) return null;
    const strs = ["topicId", "subject", "unit", "slug", "title", "key", "next", "updatedAt"] as const;
    if (strs.some((k) => typeof v[k] !== "string")) return null;
    if (v.subject !== "maths" && v.subject !== "further-maths" && v.subject !== "science") return null;
    const done = count(v.done);
    const total = count(v.total);
    const minutes = count(v.minutesLeft);
    if (done === null || total === null || minutes === null) return null;
    return {
      v: 1,
      topicId: v.topicId as string,
      subject: v.subject,
      unit: v.unit as string,
      slug: v.slug as string,
      title: v.title as string,
      key: v.key as string,
      next: v.next as string,
      done,
      total,
      minutesLeft: minutes,
      finished: v.finished === true,
      updatedAt: v.updatedAt as string,
      pausedAt: typeof v.pausedAt === "string" ? v.pausedAt : null,
      pausedKey: typeof v.pausedKey === "string" ? v.pausedKey : null,
    };
  } catch {
    return null;
  }
}

/** Her place in a topic's slides on this device, or null. */
export function readSlidesPlace(topicId: string): SlidesPlace | null {
  try {
    const place = parseSlidesPlace(window.localStorage.getItem(SLIDES_PLACE_KEY(topicId)));
    return place && place.topicId === topicId ? place : null;
  } catch {
    return null;
  }
}

/** Keeps the place, names its lesson as the one she last worked in, and tells the page (SLIDES_PLACE_EVENT). */
export function writeSlidesPlace(place: SlidesPlace): void {
  try {
    window.localStorage.setItem(SLIDES_PLACE_KEY(place.topicId), JSON.stringify(place));
    window.localStorage.setItem(SLIDES_LAST_KEY, JSON.stringify({ topicId: place.topicId, at: place.updatedAt }));
  } catch {
    // The place holds for this visit.
  }
  try {
    if (typeof window.dispatchEvent === "function") window.dispatchEvent(new CustomEvent(SLIDES_PLACE_EVENT, { detail: place.topicId }));
  } catch {
    // Nothing is listening.
  }
}

/** The slides route of a lesson: the run opens where she left it (the runner's restore, ./pause.ts resumeIndex). */
export function slidesPlaceHref(place: Pick<SlidesPlace, "subject" | "unit" | "slug">): string {
  return `/learn/${place.subject}/${place.unit}/${place.slug}/slides/`;
}

/** When the pointer to the lesson she last worked in was written (ISO 8601), or null. */
export function lastSlidesAt(): { topicId: string; at: string } | null {
  try {
    const raw = window.localStorage.getItem(SLIDES_LAST_KEY);
    const v = raw ? (JSON.parse(raw) as unknown) : null;
    return isRecord(v) && typeof v.topicId === "string" && typeof v.at === "string" ? { topicId: v.topicId, at: v.at } : null;
  } catch {
    return null;
  }
}

/** What Today shows of the deck she last worked in. */
export interface SlidesResume {
  place: SlidesPlace;
  /** Her last act in the deck was "Pause here", and she has not moved on from the card it kept. */
  pausedLast: boolean;
  href: string;
}

/** The deck she last worked in, unless its run is finished; null when nothing is kept (and on the server). */
export function lastSlidesLesson(): SlidesResume | null {
  const last = lastSlidesAt();
  if (!last) return null;
  const place = readSlidesPlace(last.topicId);
  if (!place || place.finished) return null;
  return { place, pausedLast: place.pausedAt !== null && place.pausedKey === place.key, href: slidesPlaceHref(place) };
}
