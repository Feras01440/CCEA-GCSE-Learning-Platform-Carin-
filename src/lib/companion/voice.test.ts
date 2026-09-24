/**
 * Rowan's words about itself (voice.ts): the Letter's eyebrow, the sealed preview and the Settings copy
 * for plain words. Every string she can see here passes the same constitution as the lines.
 */
import { describe, expect, it } from "vitest";
import { bannedIn, dialectWordsIn, placeWordsIn } from "./lint";
import { freshState } from "./memory";
import { describePresence, describeVoice, letterEyebrow, longDay, sealedLetterPreview } from "./voice";

const INSTALLED = new Date("2026-09-22T19:40:00");
const fresh = freshState(INSTALLED);

function everyString(copy: ReturnType<typeof describeVoice>): string[] {
  return [copy.status, copy.meaning, copy.example, ...copy.actions.map((a) => a.label)];
}

describe("the words about the words", () => {
  it("says a day the way she would read it", () => {
    expect(longDay("2026-10-06")).toBe("Tuesday 6 October");
    expect(longDay("2026-10-07")).toBe("Wednesday 7 October");
  });

  it("drops the cairn from the first Letter's eyebrow in plain mode", () => {
    expect(letterEyebrow("first-letter", false)).toBe("Left at the cairn");
    expect(letterEyebrow("first-letter", true)).toBe("A note to start with");
    expect(placeWordsIn(letterEyebrow("first-letter", true))).toEqual([]);
    expect(letterEyebrow("weekly-letter", true)).toBe("Sunday");
  });

  it("offers a sealed Letter in one plain line, by the name she gave it", () => {
    expect(sealedLetterPreview("Rowan")).toBe("A short letter from Rowan. Open it when you have a minute.");
    expect(sealedLetterPreview("Fern")).toContain("Fern");
  });
});

describe("what she sees of it, in Settings (Full, Words only, Quiet)", () => {
  it("offers the three states in order, each saying what it shows, and says what none of them costs", () => {
    const copy = describePresence(fresh);
    expect(copy.legend).toBe("What you see of Rowan");
    expect(copy.options.map((o) => [o.id, o.label])).toEqual([
      ["full", "Full"],
      ["words", "Words only"],
      ["quiet", "Quiet"],
    ]);
    expect(copy.options[0].detail).toBe("The hare and its lines: on Today, at the start of a topic and at the close of a session.");
    expect(copy.options[1].detail).toBe("The same lines, with nothing drawn.");
    expect(copy.options[2].detail).toBe("Nothing said and nothing drawn, anywhere.");
    expect(copy.note).toBe("Whichever you choose, your plan, your papers’ dates and what comes back stay on Today.");
    // Shown only when the device could not save her choice; the control has gone back to the stored one by then.
    expect(copy.unsaved).toBe("That did not save on this device, so nothing has changed.");
  });

  it("uses the name she gave it, and passes the constitution", () => {
    for (const state of [fresh, { ...fresh, name: "Fern" }]) {
      const copy = describePresence(state);
      const strings = [copy.legend, copy.note, copy.unsaved, ...copy.options.flatMap((o) => [o.label, o.detail])];
      for (const s of strings) {
        expect(bannedIn(s), s).toEqual([]);
        expect(s, s).not.toContain("!");
        expect(placeWordsIn(s), s).toEqual([]);
        expect(dialectWordsIn(s), s).toEqual([]);
      }
    }
    expect(describePresence({ ...fresh, name: "Fern" }).legend).toBe("What you see of Fern");
  });
});

describe("plain words in Settings, in her words", () => {
  it("during the fortnight: the day it ends, the day the own voice starts, and both choices", () => {
    const copy = describeVoice(fresh, new Date("2026-09-23T20:00:00"));
    expect(copy.status).toBe("Plain words until Tuesday 6 October. From Wednesday 7 October, Rowan talks in its own voice, unless you keep plain words.");
    expect(copy.actions.map((a) => [a.label, a.plain])).toEqual([
      ["Keep plain words", true],
      ["Use Rowan’s own voice now", false],
    ]);
  });

  it("says what plain words leaves out, with one pair taken from the lines themselves", () => {
    const copy = describeVoice(fresh, new Date("2026-09-23T20:00:00"));
    expect(copy.meaning).toBe(
      "Plain words means Rowan leaves out the hills, paths and cairns, and local words such as “wee” and “grand”. The facts are the same either way.",
    );
    expect(copy.example).toBe("For example, “one stone on M4” in plain words is “one stone on the M4 cairn” in Rowan’s own voice.");
  });

  it("after the fortnight: the own voice since the day it began, and the way back", () => {
    const copy = describeVoice(fresh, new Date("2026-10-08T20:00:00"));
    expect(copy.status).toBe("Rowan’s own voice, since Wednesday 7 October.");
    expect(copy.actions).toEqual([{ id: "plain-again", label: "Go back to plain words", plain: true }]);
  });

  it("after a choice: plain for good, or the own voice as she chose", () => {
    const always = describeVoice({ ...fresh, plainModeUntil: "2036-09-20" }, new Date("2026-09-23T20:00:00"));
    expect(always.status).toBe("Plain words, for good. It stays this way unless you change it here.");
    expect(always.actions.map((a) => a.plain)).toEqual([false]);
    const chose = describeVoice({ ...fresh, plainModeUntil: null }, new Date("2026-09-23T20:00:00"));
    expect(chose.status).toBe("Rowan’s own voice, as you chose.");
  });

  it("uses the name she gave it", () => {
    const copy = describeVoice({ ...fresh, name: "Fern" }, new Date("2026-09-23T20:00:00"));
    expect(copy.status).toContain("Fern talks in its own voice");
    expect(copy.actions[1].label).toBe("Use Fern’s own voice now");
  });

  it("passes the constitution: no banned word, no exclamation mark, and the dialect only as the example it names", () => {
    const states = [fresh, { ...fresh, plainModeUntil: "2036-09-20" }, { ...fresh, plainModeUntil: null }];
    for (const state of states) {
      for (const now of [new Date("2026-09-23T20:00:00"), new Date("2026-10-08T20:00:00")]) {
        for (const s of everyString(describeVoice(state, now))) {
          expect(bannedIn(s), s).toEqual([]);
          expect(s, s).not.toContain("!");
        }
      }
    }
    // The status and the actions never use the words plain mode leaves out; only the explanation quotes them.
    const copy = describeVoice(fresh, new Date("2026-09-23T20:00:00"));
    for (const s of [copy.status, ...copy.actions.map((a) => a.label)]) {
      expect(placeWordsIn(s), s).toEqual([]);
      expect(dialectWordsIn(s), s).toEqual([]);
    }
  });
});
