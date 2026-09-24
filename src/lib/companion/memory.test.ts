import "fake-indexeddb/auto";
import { beforeEach, describe, expect, it } from "vitest";
import { getDB } from "@/lib/db/db";
import {
  COMPANION_TABLES,
  DEFAULT_ROWAN_NAME,
  PLAIN_MODE_DAYS,
  PRIVATE_COMPANION_TABLES,
  REPEAT_COOLDOWN_DAYS,
  addNote,
  companionExportExclusions,
  deleteNote,
  forgetEverything,
  freshState,
  getCompanionState,
  isPlainMode,
  listNotes,
  markLetterOffered,
  markLetterSeen,
  noteLineShown,
  notesForTopic,
  plainWords,
  presenceOf,
  pruneRecent,
  rowanName,
  setPlainMode,
  setPresence,
  setRowanName,
  setSilenced,
  usedRecently,
  type CompanionState,
} from "./memory";

const DAY = 86_400_000;
const NOW = new Date("2026-09-19T20:00:00");

beforeEach(async () => {
  const db = getDB();
  await Promise.all([db.companionNotes.clear(), db.companionState.clear()]);
});

describe("the two stores", () => {
  it("lives in the database from version 4 on, beside the peer's flow table", async () => {
    const db = getDB();
    await db.open();
    // Version 4 added the two stores; later versions (5: the "Something wrong?" reports) leave them as they are.
    expect(db.verno).toBeGreaterThanOrEqual(4);
    const names = db.tables.map((t) => t.name);
    for (const t of COMPANION_TABLES) expect(names).toContain(t);
    expect(names).toContain("flow");
  });
});

describe("the state row", () => {
  it("is seeded on first read, with plain mode on for the first fortnight", async () => {
    const state = await getCompanionState(NOW);
    expect(state.id).toBe("state");
    expect(state.letterSeen).toBe(false);
    expect(state.silenced).toBe(false);
    expect(isPlainMode(state, NOW)).toBe(true);
    expect(isPlainMode(state, new Date(NOW.getTime() + (PLAIN_MODE_DAYS - 1) * DAY))).toBe(true);
    expect(isPlainMode(state, new Date(NOW.getTime() + (PLAIN_MODE_DAYS + 1) * DAY))).toBe(false);
  });

  it("keeps the same row through every change", async () => {
    await getCompanionState(NOW);
    await setRowanName("Fern", NOW);
    await markLetterSeen(NOW);
    await setSilenced(true, NOW);
    const state = await getCompanionState(NOW);
    expect(await getDB().companionState.count()).toBe(1);
    expect(state.name).toBe("Fern");
    expect(state.letterSeen).toBe(true);
    expect(state.silenced).toBe(true);
  });

  it("returns to the default name when she clears it", async () => {
    await setRowanName("Fern", NOW);
    expect(rowanName(await getCompanionState(NOW))).toBe("Fern");
    await setRowanName("  ", NOW);
    expect(rowanName(await getCompanionState(NOW))).toBe(DEFAULT_ROWAN_NAME);
  });

  it("lets her turn plain mode on for good, or off for good", async () => {
    await setPlainMode(false, NOW);
    expect(isPlainMode(await getCompanionState(NOW), NOW)).toBe(false);
    await setPlainMode(true, NOW);
    expect(isPlainMode(await getCompanionState(NOW), new Date(NOW.getTime() + 400 * DAY))).toBe(true);
  });

  it("stores no date except `updatedAt`, so a backup revives it untouched", async () => {
    await markLetterOffered(NOW);
    const state = await getCompanionState(NOW);
    for (const [key, value] of Object.entries(state)) {
      if (value instanceof Date) expect(key).toBe("updatedAt");
    }
    expect(typeof state.plainModeUntil).toBe("string");
    expect(typeof state.letterOfferedOn).toBe("string");
  });
});

describe("what she sees of it: Full, Words only or Quiet (rule 2: reduced to its voice or silenced at no cost)", () => {
  it("draws the figure by default", async () => {
    expect(freshState(NOW).figure).toBe(true);
    expect(presenceOf(freshState(NOW))).toBe("full");
    expect(presenceOf(await getCompanionState(NOW))).toBe("full");
  });

  it("Words only keeps the voice and drops the drawing; Quiet silences; Full restores both", async () => {
    await setPresence("words", NOW);
    let state = await getCompanionState(NOW);
    expect([state.silenced, state.figure]).toEqual([false, false]);
    expect(presenceOf(state)).toBe("words");

    await setPresence("quiet", NOW);
    state = await getCompanionState(NOW);
    expect(state.silenced).toBe(true);
    expect(presenceOf(state)).toBe("quiet");

    await setPresence("full", NOW);
    state = await getCompanionState(NOW);
    expect([state.silenced, state.figure]).toEqual([false, true]);
    expect(presenceOf(state)).toBe("full");
  });

  it("is a choice, so it survives Forget everything, and the old Quiet switch still means Quiet", async () => {
    await setPresence("words", NOW);
    await forgetEverything(NOW);
    expect(presenceOf(await getCompanionState(NOW))).toBe("words");
    await setSilenced(true, NOW);
    expect(presenceOf(await getCompanionState(NOW))).toBe("quiet");
    await setSilenced(false, NOW);
    expect(presenceOf(await getCompanionState(NOW))).toBe("words");
  });

  it("reads a state row written before the switch existed as Full, so no install changes under her", async () => {
    const older: Partial<CompanionState> = { ...freshState(NOW) };
    delete older.figure;
    await getDB().companionState.put(older as CompanionState);
    const state = await getCompanionState(NOW);
    expect(state.figure).toBe(true);
    expect(presenceOf(state)).toBe("full");
  });
});

describe("the first Letter's first day", () => {
  it("is not set until the Letter is first put in front of her", async () => {
    expect((await getCompanionState(NOW)).letterOfferedOn).toBeNull();
  });

  it("is written once, and a later offer never moves it", async () => {
    await markLetterOffered(NOW);
    await markLetterOffered(new Date(NOW.getTime() + 3 * DAY));
    expect((await getCompanionState(NOW)).letterOfferedOn).toBe("2026-09-19");
  });

  it("survives Forget everything, so an emptied memory does not hold Rowan back for another day", async () => {
    await markLetterOffered(NOW);
    await forgetEverything(new Date(NOW.getTime() + DAY));
    expect((await getCompanionState(NOW)).letterOfferedOn).toBe("2026-09-19");
  });
});

describe("plain words, as Settings explains them", () => {
  it("runs for the first fortnight and says the day it ends and the day the own voice starts", () => {
    const state = freshState(NOW);
    expect(state.plainModeUntil).toBe("2026-10-03");
    expect(plainWords(state, NOW)).toEqual({ mode: "fortnight", until: "2026-10-03", voiceFrom: "2026-10-04" });
    expect(plainWords(state, new Date("2026-10-03T23:00:00"))).toEqual({ mode: "fortnight", until: "2026-10-03", voiceFrom: "2026-10-04" });
  });

  it("turns into the own voice by itself on day fifteen, and says since when", () => {
    expect(plainWords(freshState(NOW), new Date("2026-10-04T09:00:00"))).toEqual({ mode: "voice", since: "2026-10-04" });
  });

  it("knows a choice from the fortnight: plain for good, or the own voice as she chose", async () => {
    await setPlainMode(true, NOW);
    expect(plainWords(await getCompanionState(NOW), NOW)).toEqual({ mode: "always" });
    await setPlainMode(false, NOW);
    expect(plainWords(await getCompanionState(NOW), NOW)).toEqual({ mode: "voice", since: null });
  });
});

describe("the fourteen-day cooldown", () => {
  it("records a line and reports it as used", async () => {
    await noteLineShown("today.back-tonight", NOW);
    const state = await getCompanionState(NOW);
    expect(usedRecently(state.recent, "today.back-tonight", NOW)).toBe(true);
    expect(usedRecently(state.recent, "today.nothing-back", NOW)).toBe(false);
  });

  it("forgets a line once the window has passed", () => {
    const recent = [{ id: "a", at: new Date(NOW.getTime() - (REPEAT_COOLDOWN_DAYS + 1) * DAY).toISOString() }];
    expect(usedRecently(recent, "a", NOW)).toBe(false);
    expect(pruneRecent(recent, NOW)).toEqual([]);
  });

  it("never lets the list grow without bound", async () => {
    await noteLineShown("a", new Date(NOW.getTime() - 40 * DAY));
    await noteLineShown("b", new Date(NOW.getTime() - 30 * DAY));
    await noteLineShown("c", NOW);
    const state = await getCompanionState(NOW);
    expect(state.recent.map((r) => r.id)).toEqual(["c"]);
  });

  it("does not record the same line twice", async () => {
    await noteLineShown("a", new Date(NOW.getTime() - DAY));
    await noteLineShown("a", NOW);
    const state = await getCompanionState(NOW);
    expect(state.recent.filter((r) => r.id === "a")).toHaveLength(1);
  });
});

describe("her notes", () => {
  it("keeps what she wrote, newest first, with its source", async () => {
    await addNote({ kind: "cairn-note", text: "cube the scale factor for volume", topicId: "frustums-of-cones", source: "her", at: new Date(NOW.getTime() - DAY) });
    await addNote({ kind: "when-next", text: "Thursday", source: "her", at: NOW });
    const notes = await listNotes();
    expect(notes.map((n) => n.kind)).toEqual(["when-next", "cairn-note"]);
    expect(notes.every((n) => n.source === "her")).toBe(true);
  });

  it("finds the note left at one topic", async () => {
    await addNote({ kind: "cairn-note", text: "two volumes, not one", topicId: "frustums-of-cones", source: "her", at: NOW });
    await addNote({ kind: "cairn-note", text: "round last", topicId: "bounds-and-accuracy", source: "her", at: NOW });
    expect((await notesForTopic("frustums-of-cones")).map((n) => n.text)).toEqual(["two volumes, not one"]);
  });

  it("deletes one row without touching the rest", async () => {
    const id = await addNote({ kind: "cairn-note", text: "keep this", source: "her", at: NOW });
    await addNote({ kind: "cairn-note", text: "remove this", source: "her", at: NOW });
    const remove = (await listNotes()).find((n) => n.text === "remove this")!;
    await deleteNote(remove.id!);
    const left = await listNotes();
    expect(left.map((n) => n.text)).toEqual(["keep this"]);
    expect(left[0].id).toBe(id);
  });

  it("forgets everything she gave it, and keeps her settings", async () => {
    await addNote({ kind: "cairn-note", text: "cube the scale factor", source: "her", at: NOW });
    await setRowanName("Fern", NOW);
    await markLetterSeen(NOW);
    await setSilenced(true, NOW);
    await noteLineShown("today.back-tonight", NOW);

    await forgetEverything(NOW);

    expect(await listNotes()).toEqual([]);
    const state = await getCompanionState(NOW);
    expect(state.name).toBeNull();
    expect(state.recent).toEqual([]);
    expect(state.silenced).toBe(true);
    expect(state.letterSeen).toBe(true);
  });
});

describe("the backup", () => {
  it("leaves her notes out by default", () => {
    expect(companionExportExclusions(false)).toEqual(["companionNotes"]);
    expect(PRIVATE_COMPANION_TABLES).toEqual(["companionNotes"]);
  });

  it("includes them only when she asks", () => {
    expect(companionExportExclusions(true)).toEqual([]);
  });

  it("never excludes the settings row, which holds no free text", () => {
    expect(companionExportExclusions(false)).not.toContain("companionState");
    expect(Object.keys(freshState(NOW))).not.toContain("text");
  });
});
