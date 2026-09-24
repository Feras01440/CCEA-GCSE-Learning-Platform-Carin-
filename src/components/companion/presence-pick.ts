/**
 * What the Settings control for Full, Words only and Quiet shows, and why it is not simply the stored row.
 *
 * The row answers a database write later (the write, then the live query's next read: 60 ms in Chromium on the build
 * machine, longer on a slow phone). A radio drawn only from the row is put back on her old choice by React straight
 * after her tap and moves when the row catches up (seen 24 September 2026). So the control holds her latest choice from the moment she makes
 * it, until the device has saved that choice and the row says the same; from then on the row alone decides, so a change
 * made elsewhere (a restored backup) shows as it is. Rules:
 * - each choice is numbered, so a slower earlier save can neither hand back to the row nor undo a later choice;
 * - the hand-back needs both the save and the row agreeing, in either order, so nothing in between is ever drawn;
 * - a choice the device could not save goes back to the stored one and the control says so, until her next choice.
 * Pure, so presence-pick.test.ts holds every order the events can arrive in.
 */

import type { CompanionPresence } from "@/lib/companion";

export interface PresencePick {
  /** Her latest choice while it is being saved, with its number, and whether the device has saved it yet. */
  pending: { presence: CompanionPresence; n: number; saved: boolean } | null;
  /** Her last choice could not be saved: the control shows the stored one again and says so. */
  unsaved: boolean;
}

export const NO_PICK: PresencePick = { pending: null, unsaved: false };

export type PresencePickEvent =
  /** She chose, by tap, click or arrow key; `n` numbers the choice (the next one is always larger). */
  | { type: "chose"; presence: CompanionPresence; n: number }
  /** The device saved choice `n`. */
  | { type: "saved"; n: number }
  /** The device could not save choice `n`. */
  | { type: "not-saved"; n: number }
  /** What the stored row says now. */
  | { type: "stored"; presence: CompanionPresence };

export function pickPresence(state: PresencePick, event: PresencePickEvent): PresencePick {
  const pending = state.pending;
  switch (event.type) {
    case "chose":
      return { pending: { presence: event.presence, n: event.n, saved: false }, unsaved: false };
    case "saved":
      return pending && pending.n === event.n && !pending.saved ? { ...state, pending: { ...pending, saved: true } } : state;
    case "not-saved":
      return pending && pending.n === event.n ? { pending: null, unsaved: true } : state;
    case "stored":
      return pending && pending.saved && pending.presence === event.presence ? { ...state, pending: null } : state;
  }
}

/** The choice the control draws: hers while it is being saved, the stored row's otherwise. */
export function shownPresence(stored: CompanionPresence, pick: PresencePick): CompanionPresence {
  return pick.pending ? pick.pending.presence : stored;
}
