/**
 * The lesson she last worked in, whichever way she took it (the owner, 29 Sep 2026: "keep a stopping point in Slides";
 * a paused deck shows on Today in the same row as a paused Read lesson). This is the ONE function Today reads, over
 * Read's place (./read-place.ts, lastReadLesson, which stays as Read's own reader) and the slides' place
 * (src/lib/slides/place.ts, lastSlidesLesson). The later of the two ways' pointers decides which lesson that is, and a
 * finished lesson shows nothing, as Read's always did. It says the section that opens next and the minutes left, never
 * a card number.
 *
 * THE CONTRACT with Today (TodayTiles.tsx and the companion context read it):
 *   lastLesson() -> { way, topicId, title, next, open, done, total, minutesLeft, pausedLast, pausedAt, href } | null
 */
import { lastSlidesAt, lastSlidesLesson } from "@/lib/slides/place";
import { lastReadLesson, READ_LAST_KEY } from "./read-place";

export interface LastLesson {
  way: "read" | "slides";
  topicId: string;
  /** The lesson's display title, "Simplifying algebraic fractions". */
  title: string;
  /** What opens next: the section's title ("A quadratic on a line"), or "the recap" in the slides. */
  next: string;
  /** The section that opens next, 1-based, of `total`. */
  open: number;
  /** Sections done. */
  done: number;
  total: number;
  /** Minutes left by the lesson's own model; null for a Read place kept before minutes were. */
  minutesLeft: number | null;
  /** Her last act in the lesson was "Pause here". */
  pausedLast: boolean;
  /** Her last "Pause here" (ISO 8601), or null. */
  pausedAt: string | null;
  /** The way back: Read's page landing on her section, or the slides route, which opens where she left it. */
  href: string;
}

/** When Read's pointer to the lesson she last worked in was written (ISO 8601), or null. */
function lastReadAt(): string | null {
  try {
    const raw = window.localStorage.getItem(READ_LAST_KEY);
    const v = raw ? (JSON.parse(raw) as unknown) : null;
    return typeof v === "object" && v !== null && typeof (v as { at?: unknown }).at === "string" ? (v as { at: string }).at : null;
  } catch {
    return null;
  }
}

/** The lesson she last worked in, either way, unless it is finished; null when nothing is kept (and on the server). */
export function lastLesson(): LastLesson | null {
  const readAt = lastReadAt();
  const slidesAt = lastSlidesAt()?.at ?? null;
  // The later pointer is the lesson she last worked in (ISO 8601 in UTC orders as text); a tie goes to Read.
  const way: "read" | "slides" | null = readAt === null && slidesAt === null ? null : slidesAt !== null && (readAt === null || slidesAt > readAt) ? "slides" : "read";
  if (way === "slides") {
    const s = lastSlidesLesson();
    if (!s) return null;
    const p = s.place;
    return {
      way,
      topicId: p.topicId,
      title: p.title,
      next: p.next,
      open: Math.min(p.done + 1, Math.max(1, p.total)),
      done: p.done,
      total: p.total,
      minutesLeft: p.minutesLeft,
      pausedLast: s.pausedLast,
      pausedAt: p.pausedAt,
      href: s.href,
    };
  }
  if (way === "read") {
    const r = lastReadLesson();
    if (!r) return null;
    const p = r.place;
    return {
      way,
      topicId: p.topicId,
      title: p.title,
      next: p.openTitle,
      open: p.open,
      done: r.done,
      total: p.total,
      minutesLeft: typeof p.minutesLeft === "number" ? p.minutesLeft : null,
      pausedLast: r.pausedLast,
      pausedAt: p.pausedAt,
      href: r.href,
    };
  }
  return null;
}
