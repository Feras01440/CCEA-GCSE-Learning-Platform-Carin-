/**
 * Her place in a topic's Read lesson, kept on this device (27 Sep 2026; the trial audit's READ-9, READ-11, READ-12 and
 * HERO-1). Read v2 opens a lesson one section at a time; this is where she is in it, so a reload, a Back, the hero's
 * button and Today all agree:
 *
 * - `open` is the section she is in: the furthest she has opened. Continue opens the next section; "Pause here" at the
 *   end of the section she is in opens the next one too, for next time ("Your place is kept; the lesson opens at the
 *   next section"). Answering a check never moves her on by itself: only her own Continue or Pause does (READ-9).
 * - `finished` is the lesson's last Continue (or Pause here at the end of the last section).
 * - A place never runs past a check she has not answered: a check added to the note later waits for her there.
 * - A content edit can renumber the sections (the trial note went from seven to nine): the place is found again by its
 *   section's title, and only when the title is gone by its number, clamped to the note.
 *
 * The record lives in localStorage, as the Slides run keeps its place (src/lib/slides/position.ts), wrapped so private
 * mode and a full store leave it for the visit only. `cairn.read.last` names the lesson she last worked in, which is
 * what Today reads (`lastReadLesson`), with the link that lands on her section (`#resume`).
 *
 * THE CONTRACT with Today (the companion-today agent reads it; change it only with them):
 *   lastReadLesson() -> { place: ReadPlace, done, pausedLast, href } | null, null once the lesson is finished.
 *
 * Pure apart from the storage wrappers at the end; every function takes the time it stamps.
 */
import type { Subject } from "@/lib/content/taxonomy";

/** Where she is in one topic's Read lesson. Key: `cairn.read.place.<topicId>`. */
export interface ReadPlace {
  v: 1;
  /** The shipped bundle's id, "fm.u1.algebraic-fractions-simplify". */
  topicId: string;
  subject: Subject;
  /** The unit code, "FM1". */
  unit: string;
  slug: string;
  /** The hero's display title, "Simplifying algebraic fractions". */
  title: string;
  /** The lesson's sections, the track's N. */
  total: number;
  /** The section she is in, 1 to total. */
  open: number;
  /** That section's title: how the place is found again after a content edit renumbers the sections. */
  openTitle: string;
  /** She pressed the lesson's last Continue, or paused at the end of its last section. */
  finished: boolean;
  /** When the record last changed (ISO 8601). */
  updatedAt: string;
  /** Her last "Pause here" in this lesson (ISO 8601), or null. */
  pausedAt: string | null;
}

/** A section as the place needs it: its title and its checks (lesson-plan.ts LessonSection fits). */
export interface PlaceSection {
  title: string;
  gateIds: readonly string[];
}

/** What a new record is told about the lesson it belongs to. */
export interface PlaceMeta {
  topicId: string;
  subject: Subject;
  unit: string;
  slug: string;
  title: string;
}

/** Where the page opens, what the hero names, and whether the lesson is done. */
export interface Resume {
  /** Sections open on arrival (0 for a note with no sections). */
  open: number;
  /** The section the hero's Read button and Rowan name ("Continue at section 3"), or null (a first visit, a finished lesson). */
  sectionNumber: number | null;
  finished: boolean;
}

const clamp = (n: number, lo: number, hi: number): number => Math.min(hi, Math.max(lo, n));
const titleAt = (sections: readonly PlaceSection[], open: number): string => sections[open - 1]?.title ?? "";

/** The section (1-based) holding the first check she has not answered, or null when every check is answered. */
export function frontierOf(sections: readonly PlaceSection[], answered: Iterable<string>): number | null {
  const done = new Set(answered);
  const at = sections.findIndex((s) => s.gateIds.some((id) => !done.has(id)));
  return at >= 0 ? at + 1 : null;
}

/** A place's section in the note as it is now: by its title first, then by its number, clamped to the note. */
function placeIn(place: ReadPlace, sections: readonly PlaceSection[]): number {
  if (sections.length === 0) return 0;
  if (titleAt(sections, place.open) === place.openTitle) return clamp(place.open, 1, sections.length);
  const byTitle = place.openTitle ? sections.findIndex((s) => s.title === place.openTitle) : -1;
  return byTitle >= 0 ? byTitle + 1 : clamp(place.open, 1, sections.length);
}

/**
 * One reading of where she is, shared by the page (how many sections to open), the track (with `finished`) and the hero
 * (the section it names). With a place kept: its section, never past a check still to answer. Without one (a device
 * that read before places were kept, or answers given in Slides): up to the first check still to answer, the hero naming
 * it only once she has answered something; a legacy finished mark (`cairn.read.finished.<topicId>`, builds 7 and 8)
 * still counts while every check is answered.
 */
export function resumeState({
  sections,
  answered,
  place,
  legacyFinished = false,
}: {
  sections: readonly PlaceSection[];
  answered: Iterable<string>;
  place: ReadPlace | null;
  legacyFinished?: boolean;
}): Resume {
  const total = sections.length;
  if (total === 0) return { open: 0, sectionNumber: null, finished: false };
  const done = new Set(answered);
  const frontier = frontierOf(sections, done);
  const finished = frontier === null && (place ? place.finished : legacyFinished);
  if (finished) return { open: total, sectionNumber: null, finished: true };
  if (place) {
    const open = Math.min(placeIn(place, sections), frontier ?? total);
    return { open, sectionNumber: open, finished: false };
  }
  const hasChecks = sections.some((s) => s.gateIds.length > 0);
  const open = frontier ?? (hasChecks ? total : 1);
  // With no place kept, she stopped after the last section in which she answered something, and never past a check
  // still to answer: a section with no check after it is not skipped ("Continue at 4" when 4 has no check and 5 waits).
  let lastAnswered = 0;
  sections.forEach((s, i) => {
    if (s.gateIds.some((id) => done.has(id))) lastAnswered = i + 1;
  });
  return { open, sectionNumber: lastAnswered > 0 && frontier !== null ? Math.min(lastAnswered + 1, frontier) : null, finished: false };
}

/** A new record for a lesson: section 1, nothing finished, never paused. */
export function newPlace(meta: PlaceMeta, sections: readonly PlaceSection[], now: Date): ReadPlace {
  return { v: 1, ...meta, total: sections.length, open: 1, openTitle: titleAt(sections, 1), finished: false, updatedAt: now.toISOString(), pausedAt: null };
}

/** The place moved to `open` (clamped), with the note's current length and that section's title. */
function at(place: ReadPlace, sections: readonly PlaceSection[], open: number, now: Date): ReadPlace {
  const total = sections.length;
  const next = total > 0 ? clamp(open, 1, total) : place.open;
  return { ...place, total, open: next, openTitle: titleAt(sections, next) || place.openTitle, updatedAt: now.toISOString() };
}

/** She answered a check or read on: the same section, the time moved on (the lesson she last worked in). */
export function touched(place: ReadPlace, sections: readonly PlaceSection[], now: Date): ReadPlace {
  return at(place, sections, placeIn(place, sections), now);
}

/** She pressed Continue at the end of section `n`: the next section is open. */
export function continued(place: ReadPlace, n: number, sections: readonly PlaceSection[], now: Date): ReadPlace {
  return at(place, sections, Math.max(placeIn(place, sections), n + 1), now);
}

/**
 * She pressed "Pause here" at the end of section `n`. At the end of the section she is in, the lesson opens at the next
 * section next time (at the end of the last section, the lesson is finished); under a section she has already moved
 * past, only the time is kept.
 */
export function paused(place: ReadPlace, n: number, sections: readonly PlaceSection[], now: Date): ReadPlace {
  const here = placeIn(place, sections);
  const stamp = now.toISOString();
  if (n >= sections.length && n >= here) return { ...at(place, sections, sections.length, now), finished: true, pausedAt: stamp };
  return { ...at(place, sections, n >= here ? n + 1 : here, now), pausedAt: stamp };
}

/** She pressed the lesson's last Continue. */
export function finishedLesson(place: ReadPlace, sections: readonly PlaceSection[], now: Date): ReadPlace {
  return { ...at(place, sections, sections.length, now), finished: true };
}

/**
 * How she arrived on the topic page, which decides where it opens (READ-11):
 * - "restore": back where she was reading. A reload of this page, a Back or Forward into a fresh load of it, a tab the
 *   phone discarded and reloaded, or a Back inside the app (a popstate just before the page mounted), when this tab kept
 *   an anchor for the page.
 * - "resume": a link to `#resume` (Today's way back): the section she is in.
 * - "hash": a link to a stage (`#practice`): that stage (TopicContent's stage landing).
 * - "top": anything else, a new visit: the hero, which names where she stopped.
 * The document's own navigation type counts only for the page the document loaded: a reload of Today and then a link to
 * the topic is a new visit.
 */
export function arrivalFor({
  docType,
  docPath,
  path,
  firstMount,
  popped,
  discarded,
  hash,
  anchor,
}: {
  docType: "navigate" | "reload" | "back_forward" | "prerender" | null;
  docPath: string | null;
  path: string;
  firstMount: boolean;
  popped: boolean;
  discarded: boolean;
  hash: string;
  anchor: boolean;
}): "restore" | "resume" | "hash" | "top" {
  const thisDocument = firstMount && docPath !== null && docPath === path;
  const returning = popped || (thisDocument && (docType === "reload" || docType === "back_forward" || discarded));
  if (returning && anchor) return "restore";
  if (hash === "resume") return "resume";
  if (hash) return "hash";
  return "top";
}

// ---------------------------------------------------------------------------------------------------------------------
// On the device
// ---------------------------------------------------------------------------------------------------------------------

export const READ_PLACE_KEY = (topicId: string): string => `cairn.read.place.${topicId}`;
/** The lesson she last worked in: `{ topicId, at }`. */
export const READ_LAST_KEY = "cairn.read.last";
/** Dispatched on window when a place is written, with the topic id as `detail`: the hero above the lesson follows it. */
export const READ_PLACE_EVENT = "cairn:read-place";
/** What builds 7 and 8 kept when she pressed the lesson's last Continue ("1"). Read, never written. */
const LEGACY_FINISHED_KEY = (topicId: string): string => `cairn.read.finished.${topicId}`;

const isRecord = (v: unknown): v is Record<string, unknown> => typeof v === "object" && v !== null && !Array.isArray(v);

function parsePlace(raw: string | null): ReadPlace | null {
  if (!raw) return null;
  try {
    const v = JSON.parse(raw) as unknown;
    if (!isRecord(v) || v.v !== 1) return null;
    const strs = ["topicId", "subject", "unit", "slug", "title", "openTitle", "updatedAt"] as const;
    if (strs.some((k) => typeof v[k] !== "string")) return null;
    if (typeof v.total !== "number" || typeof v.open !== "number" || !Number.isFinite(v.open) || v.open < 1) return null;
    if (v.subject !== "maths" && v.subject !== "further-maths" && v.subject !== "science") return null;
    return {
      v: 1,
      topicId: v.topicId as string,
      subject: v.subject,
      unit: v.unit as string,
      slug: v.slug as string,
      title: v.title as string,
      total: Math.max(0, Math.floor(v.total)),
      open: Math.floor(v.open),
      openTitle: v.openTitle as string,
      finished: v.finished === true,
      updatedAt: v.updatedAt as string,
      pausedAt: typeof v.pausedAt === "string" ? v.pausedAt : null,
    };
  } catch {
    return null;
  }
}

/** Her place in a topic's lesson on this device, or null. */
export function readPlace(topicId: string): ReadPlace | null {
  try {
    const place = parsePlace(window.localStorage.getItem(READ_PLACE_KEY(topicId)));
    return place && place.topicId === topicId ? place : null;
  } catch {
    return null;
  }
}

/** Keeps the place, names its lesson as the one she last worked in, and tells the page (READ_PLACE_EVENT). */
export function writePlace(place: ReadPlace): void {
  try {
    window.localStorage.setItem(READ_PLACE_KEY(place.topicId), JSON.stringify(place));
    window.localStorage.setItem(READ_LAST_KEY, JSON.stringify({ topicId: place.topicId, at: place.updatedAt }));
  } catch {
    // The place holds for this visit.
  }
  try {
    if (typeof window.dispatchEvent === "function") window.dispatchEvent(new CustomEvent(READ_PLACE_EVENT, { detail: place.topicId }));
  } catch {
    // Nothing is listening.
  }
}

/** Builds 7 and 8 kept the lesson's last Continue on its own. */
export function legacyFinished(topicId: string): boolean {
  try {
    return window.localStorage.getItem(LEGACY_FINISHED_KEY(topicId)) === "1";
  } catch {
    return false;
  }
}

/** The link that lands on her section of the lesson (TopicContent treats `#resume` as a landing). */
export function resumeHref(place: Pick<ReadPlace, "subject" | "unit" | "slug">): string {
  return `/learn/${place.subject}/${place.unit}/${place.slug}/#resume`;
}

/** What Today shows of the lesson she last worked in (see the file comment). */
export interface ReadResume {
  place: ReadPlace;
  /** Sections done: every one before the section she is in. */
  done: number;
  /** Her last act in the lesson was "Pause here" (Today may say "Section 3 done."). */
  pausedLast: boolean;
  /** The way back: the topic page landing on her section. */
  href: string;
}

/** The lesson she last worked in, unless it is finished; null when nothing is kept (and on the server). */
export function lastReadLesson(): ReadResume | null {
  let topicId: string | null = null;
  try {
    const raw = window.localStorage.getItem(READ_LAST_KEY);
    const v = raw ? (JSON.parse(raw) as unknown) : null;
    topicId = isRecord(v) && typeof v.topicId === "string" ? v.topicId : null;
  } catch {
    return null;
  }
  if (!topicId) return null;
  const place = readPlace(topicId);
  if (!place || place.finished) return null;
  return { place, done: place.open - 1, pausedLast: place.pausedAt !== null && place.pausedAt === place.updatedAt, href: resumeHref(place) };
}
