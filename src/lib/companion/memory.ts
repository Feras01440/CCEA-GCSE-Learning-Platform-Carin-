"use client";

/**
 * What Rowan remembers, and the controls that let her see it and delete it.
 *
 * Two Dexie stores, added in version(4) of src/lib/db/db.ts (version 3 is the peer's `flow` table):
 *
 *   companionNotes  ++id, at, kind, topicId, source   — free text: hers, or a line Rowan left
 *   companionState  id                                — one row, id "state"
 *
 * Rules this file enforces:
 * - `source` is "her" or "rowan"; only a note with source "her" may ever be quoted back (see context.ts).
 * - companionNotes is excluded from the backup file by default, because a backup restored on a family
 *   laptop would otherwise carry her notes with it (companionExportExclusions).
 * - Plain mode is on for the first fortnight of an install; she turns the place language on, not off.
 * - "Forget everything" empties the notes and everything Rowan learned about her, in one action.
 *
 * Date fields are named `at` and `updatedAt` only, so src/lib/db/export.ts revives them untouched;
 * every other stored time is an ISO string for the same reason.
 */

import { getDB } from "@/lib/db/db";

export type NoteKind = "cairn-note" | "felt" | "when-next" | "taught" | "paper-recall";
export type NoteSource = "her" | "rowan";

/** One remembered line. `text` is free text, so this table never leaves the device by default. */
export interface CompanionNote {
  id?: number;
  at: Date;
  kind: NoteKind;
  text: string;
  topicId?: string;
  source: NoteSource;
}

/** A line Rowan has already used, so it is not used again within the cooldown. */
export interface ShownLine {
  id: string;
  /** ISO timestamp. A string, not a Date, so a backup round-trips it unchanged. */
  at: string;
}

/** The single settings row. Everything here was chosen by her, or seeded once on first read. */
export interface CompanionState {
  id: "state";
  /** ISO date. Plain mode is on while today is on or before it. Null once she turns it off. */
  plainModeUntil: string | null;
  /** The first (upgrade) Letter has been read. */
  letterSeen: boolean;
  /**
   * ISO date the first Letter was first put in front of her on Today. The Letter goes first only on that
   * day: from the next day Rowan speaks everywhere whether or not she has opened it, and the Letter waits,
   * sealed, under Start. A date of one event, never a count of days or a record of when she opens the app.
   */
  letterOfferedOn: string | null;
  /** What she renamed the companion to, if she did. Null means the default name. */
  name: string | null;
  /** She turned the voice off. Nothing speaks, anywhere (Quiet). */
  silenced: boolean;
  /**
   * The drawn figure may be shown. False is "Words only": every line as it is, and nothing drawn anywhere (rule 2 of
   * the emotional-design rules as rewritten on 23 September: Rowan "can be reduced to its voice or silenced at no
   * cost"). A row written before this field existed reads as true, so no install changes under her.
   */
  figure: boolean;
  /** Lines used inside the cooldown window, pruned on every write. */
  recent: ShownLine[];
  updatedAt: Date;
}

export const COMPANION_STATE_ID = "state" as const;
export const DEFAULT_ROWAN_NAME = "Rowan";
/** Plain mode is on for this many days after the state row is first written. */
export const PLAIN_MODE_DAYS = 14;
/** A line is not repeated inside this many days. */
export const REPEAT_COOLDOWN_DAYS = 14;

/** The two stores this session owns. Nothing else in the database belongs to the companion. */
export const COMPANION_TABLES = ["companionNotes", "companionState"] as const;
/** Free text she typed. Left out of the backup unless she asks for it. */
export const PRIVATE_COMPANION_TABLES = ["companionNotes"] as const;
/** Settings key the export toggle writes. Absent means false, which is the safe default. */
export const EXPORT_NOTES_SETTING = "companionNotesInExport";

const DAY = 86_400_000;

export function todayISOFrom(now: Date): string {
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function addDaysISO(now: Date, days: number): string {
  return todayISOFrom(new Date(now.getTime() + days * DAY));
}

/** The state a fresh install starts from: plain mode on for a fortnight, no letter offered or read yet. */
export function freshState(now = new Date()): CompanionState {
  return {
    id: COMPANION_STATE_ID,
    plainModeUntil: addDaysISO(now, PLAIN_MODE_DAYS),
    letterSeen: false,
    letterOfferedOn: null,
    name: null,
    silenced: false,
    figure: true,
    recent: [],
    updatedAt: now,
  };
}

/**
 * What she sees of it, as one choice with three states (the Settings control):
 * - "full": the hare and its lines;
 * - "words": the lines alone, in Rowan's voice, with nothing drawn anywhere;
 * - "quiet": nothing said and nothing drawn.
 * Quiet is the old `silenced` switch; Words only is `figure: false`. Quiet leaves `figure` as it was, so leaving
 * Quiet returns her to the choice she made before it.
 */
export type CompanionPresence = "full" | "words" | "quiet";

export function presenceOf(state: Pick<CompanionState, "silenced" | "figure">): CompanionPresence {
  if (state.silenced) return "quiet";
  return state.figure ? "full" : "words";
}

/** Plain mode strips the place language. Pure, so the selector can be tested without a database. */
export function isPlainMode(state: Pick<CompanionState, "plainModeUntil">, now = new Date()): boolean {
  return state.plainModeUntil !== null && todayISOFrom(now) <= state.plainModeUntil;
}

/**
 * Where plain words stand, for the Settings switch. Three honest states:
 * - "fortnight": the seeded first fortnight is still running, and ends on its own after `until`;
 * - "always": she chose plain words for good;
 * - "voice": Rowan's own voice, either because the fortnight ran out (`since` is the first day of it)
 *   or because she chose it (`since` is null).
 * A plain-mode end date further off than the fortnight can only have been chosen, never seeded.
 */
export type PlainWords =
  | { mode: "fortnight"; until: string; voiceFrom: string }
  | { mode: "always" }
  | { mode: "voice"; since: string | null };

export function plainWords(state: Pick<CompanionState, "plainModeUntil">, now = new Date()): PlainWords {
  const until = state.plainModeUntil;
  if (until === null) return { mode: "voice", since: null };
  if (until < todayISOFrom(now)) return { mode: "voice", since: nextDayISO(until) };
  if (until > addDaysISO(now, PLAIN_MODE_DAYS)) return { mode: "always" };
  return { mode: "fortnight", until, voiceFrom: nextDayISO(until) };
}

/** The day after an ISO date, as an ISO date, read on the local calendar like every other date here. */
function nextDayISO(iso: string): string {
  const d = new Date(`${iso}T12:00:00`);
  d.setDate(d.getDate() + 1);
  return todayISOFrom(d);
}

/**
 * Drops anything older than the cooldown, so `recent` cannot grow without bound. Cooldowns are counted in
 * calendar days: a line with a one-day cooldown said last night may be said tonight, and a fourteen-day line
 * said on a Tuesday may be said again on the Tuesday a fortnight later. Zero days is no cooldown at all.
 */
export function pruneRecent(recent: ShownLine[], now = new Date(), days = REPEAT_COOLDOWN_DAYS): ShownLine[] {
  const midnight = new Date(now);
  midnight.setHours(0, 0, 0, 0);
  const cutoff = midnight.getTime() - (days - 1) * DAY;
  return recent.filter((r) => {
    const t = Date.parse(r.at);
    return Number.isFinite(t) && t >= cutoff;
  });
}

/** True when this line was used inside the cooldown and must not be used again yet. */
export function usedRecently(recent: ShownLine[], lineId: string, now = new Date(), days = REPEAT_COOLDOWN_DAYS): boolean {
  return pruneRecent(recent, now, days).some((r) => r.id === lineId);
}

/** Which tables the backup must leave out. She can opt the notes back in from Settings. */
export function companionExportExclusions(includeNotes: boolean): string[] {
  return includeNotes ? [] : [...PRIVATE_COMPANION_TABLES];
}

/** The name in use: hers if she renamed it, otherwise the default. */
export function rowanName(state: Pick<CompanionState, "name"> | null | undefined): string {
  const n = state?.name?.trim();
  return n ? n : DEFAULT_ROWAN_NAME;
}

// ---------------------------------------------------------------------------
// Dexie helpers. Every one of them is safe to call when the store is empty.
//
// Every change to the state row is one read-write transaction (changeCompanionState): the row is read, changed and
// written back with nothing able to land in between. Several writers share the row (Today's seed, the Letter's day,
// the line just said, her choices in Settings), and until 25 September each helper read in one transaction and wrote
// in another, so a write that landed in the gap was overwritten with the stale copy: two quick choices in Settings
// kept only the second, and a line's record could undo her choice. None of this is called inside a liveQuery (a
// write there throws); the queriers read through live.ts's readCompanionState.
// ---------------------------------------------------------------------------

/** The stored row over the defaults, so a row written before a field existed reads that field's default. */
function withDefaults(row: CompanionState, now: Date): CompanionState {
  return { ...freshState(now), ...row, id: COMPANION_STATE_ID };
}

/**
 * Reads the row (or a fresh one, if there is none), applies `change` and writes the result, in one transaction.
 * `change` returns the row unchanged (the same object) when there is nothing to write; a missing row is still seeded
 * then, so plain mode's fortnight starts on the first real open.
 */
async function changeCompanionState(now: Date, change: (current: CompanionState) => CompanionState): Promise<CompanionState> {
  const db = getDB();
  return db.transaction("rw", db.companionState, async () => {
    const row = await db.companionState.get(COMPANION_STATE_ID);
    const current = row ? withDefaults(row, now) : freshState(now);
    const next = change(current);
    if (next !== current || !row) await db.companionState.put(next);
    return next;
  });
}

/** The state row, seeding it on first read so plain mode's fortnight starts the day she upgrades. */
export async function getCompanionState(now = new Date()): Promise<CompanionState> {
  return changeCompanionState(now, (current) => current);
}

export async function updateCompanionState(patch: Partial<Omit<CompanionState, "id">>, now = new Date()): Promise<CompanionState> {
  return changeCompanionState(now, (current) => {
    const next: CompanionState = { ...current, ...patch, id: COMPANION_STATE_ID, updatedAt: now };
    next.recent = pruneRecent(next.recent, now);
    return next;
  });
}

/** She renamed it on the first Letter. An empty name returns it to the default. */
export async function setRowanName(name: string, now = new Date()): Promise<CompanionState> {
  return updateCompanionState({ name: name.trim() || null }, now);
}

/** The first Letter has been read: it never introduces itself again. */
export async function markLetterSeen(now = new Date()): Promise<CompanionState> {
  return updateCompanionState({ letterSeen: true }, now);
}

/**
 * The first Letter is on her screen for the first time: that day is the one day it goes first. Written
 * once; a later offer of the same Letter never moves the date.
 */
export async function markLetterOffered(now = new Date()): Promise<CompanionState> {
  return changeCompanionState(now, (current) => {
    if (current.letterOfferedOn) return current;
    return { ...current, letterOfferedOn: todayISOFrom(now), recent: pruneRecent(current.recent, now), updatedAt: now };
  });
}

/** The voice off, or on again. Off costs her nothing else in the product. */
export async function setSilenced(silenced: boolean, now = new Date()): Promise<CompanionState> {
  return updateCompanionState({ silenced }, now);
}

/** Full, Words only or Quiet, as one choice. Picking Full or Words only says so explicitly; Quiet only silences. */
export async function setPresence(presence: CompanionPresence, now = new Date()): Promise<CompanionState> {
  if (presence === "quiet") return updateCompanionState({ silenced: true }, now);
  return updateCompanionState({ silenced: false, figure: presence === "full" }, now);
}

/** Plain mode on indefinitely, or off for good. */
export async function setPlainMode(on: boolean, now = new Date()): Promise<CompanionState> {
  return updateCompanionState({ plainModeUntil: on ? addDaysISO(now, 3650) : null }, now);
}

/** Records that a line was used, so the selector varies without repeating inside the cooldown. */
export async function noteLineShown(lineId: string, now = new Date()): Promise<void> {
  await changeCompanionState(now, (current) => ({
    ...current,
    recent: pruneRecent([{ id: lineId, at: now.toISOString() }, ...current.recent.filter((r) => r.id !== lineId)], now),
    updatedAt: now,
  }));
}

/** Everything she left, newest first. This is the list Settings shows her. */
export async function listNotes(): Promise<CompanionNote[]> {
  const rows = await getDB().companionNotes.orderBy("at").reverse().toArray();
  return rows;
}

export async function notesForTopic(topicId: string): Promise<CompanionNote[]> {
  const rows = await getDB().companionNotes.where("topicId").equals(topicId).toArray();
  return rows.sort((a, b) => b.at.getTime() - a.at.getTime());
}

export async function addNote(note: Omit<CompanionNote, "id" | "at"> & { at?: Date }): Promise<number> {
  const row: CompanionNote = { ...note, at: note.at ?? new Date() };
  const id = await getDB().companionNotes.add(row);
  return Number(id);
}

export async function deleteNote(id: number): Promise<void> {
  await getDB().companionNotes.delete(id);
}

/**
 * Forget everything: the notes, the rename, the lines already used. Her settings survive
 * (silenced, the figure, plain mode) because those are choices, not memories, and `letterSeen` stays true
 * so an emptied memory does not make it introduce itself all over again.
 */
export async function forgetEverything(now = new Date()): Promise<void> {
  const db = getDB();
  // One transaction over both stores: the notes go and the row is rebuilt from what it says at that moment.
  await db.transaction("rw", db.companionNotes, db.companionState, async () => {
    const row = await db.companionState.get(COMPANION_STATE_ID);
    const current = row ? withDefaults(row, now) : freshState(now);
    await db.companionNotes.clear();
    await db.companionState.put({
      ...freshState(now),
      plainModeUntil: current.plainModeUntil,
      silenced: current.silenced,
      figure: current.figure,
      letterSeen: current.letterSeen,
      letterOfferedOn: current.letterOfferedOn,
      name: null,
      recent: [],
      updatedAt: now,
    });
  });
}
