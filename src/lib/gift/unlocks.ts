import notesFile from "../../../data/personal/notes.json";

export type UnlockEvent = "first-open" | "first-proficient" | "first-paper-run" | "paper-eve" | "results-day";

export interface GiftNote {
  id: string;
  title: string;
  body: string;
  unlock: { event?: UnlockEvent; date?: string };
}

export const GIVER_NAME: string = notesFile.giverName;
export const NOTES: GiftNote[] = notesFile.notes as GiftNote[];

export interface UnlockContext {
  today: string; // ISO date
  events: Set<UnlockEvent>;
}

export function isUnlocked(note: GiftNote, ctx: UnlockContext): boolean {
  if (note.unlock.date) return ctx.today >= note.unlock.date;
  if (note.unlock.event) return ctx.events.has(note.unlock.event);
  return false;
}

export function unlockedNotes(ctx: UnlockContext): GiftNote[] {
  return NOTES.filter((n) => isUnlocked(n, ctx));
}
