/**
 * The Letter's rename, as a pure flow (CompanionLetter renders it; rename-flow.test.ts proves every order of events).
 *
 * Until 27 September 2026 the rename had no form, so Enter did nothing, and Save wrote the name while the Letter kept
 * showing the old one: the label still said "It answers to Rowan", the signature still read "Rowan", nothing replied and
 * the field kept her text, so the save looked as if it had failed (the trial audit's COMPANION-9). Now a save she makes
 * shows at once: the Letter's label and signature take the new name and Rowan replies in one line; a save the device
 * refuses keeps her text and the old name, and says so.
 */

export interface RenameState {
  /** What is in the field. Emptied once a name is kept, so the placeholder shows the name in use. */
  draft: string;
  /** The name being saved, while the device has not answered. */
  saving: string | null;
  /** The last name kept on this visit, which the Letter shows at once. */
  saved: string | null;
  /** What the status line says: nothing, the reply to a kept name, or that nothing was kept. */
  status: "idle" | "saved" | "not-saved";
}

export const NO_RENAME: RenameState = { draft: "", saving: null, saved: null, status: "idle" };

export type RenameEvent =
  | { type: "typed"; value: string }
  /** Enter in the field, or Save. */
  | { type: "submit" }
  /** The device kept the name. */
  | { type: "saved" }
  /** The device refused it. */
  | { type: "not-saved" };

export function renameStep(state: RenameState, event: RenameEvent): RenameState {
  switch (event.type) {
    case "typed":
      return { ...state, draft: event.value, status: "idle" };
    case "submit": {
      const name = state.draft.trim();
      if (!name || state.saving) return state;
      return { ...state, saving: name, status: "idle" };
    }
    case "saved":
      if (!state.saving) return state;
      return { draft: "", saving: null, saved: state.saving, status: "saved" };
    case "not-saved":
      if (!state.saving) return state;
      return { ...state, saving: null, status: "not-saved" };
  }
}

/** The name the Letter shows: the one she has just kept, or the stored one. */
export function shownName(state: RenameState, stored: string): string {
  return state.saved ?? stored;
}
