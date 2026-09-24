/**
 * The Settings control for what she sees of Rowan (Full, Words only, Quiet) shows her choice from the moment she makes
 * it. Found on 24 September 2026 (build 7, both e2e profiles): the radio was drawn only from the stored row, which
 * answers a database write later, so React put the radio back on her old choice straight after the tap and it moved
 * about 60 ms later; Playwright's `check()` reported "Clicking the checkbox did not change its state". The control now
 * holds her latest choice until the device has saved it and the row says the same, then the row is the truth again;
 * a choice the device could not save goes back to the stored one and says so in one line.
 */
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { describePresence, freshState, type CompanionPresence } from "@/lib/companion";
import { PresenceChoice } from "./CompanionVoiceSettings";
import { NO_PICK, pickPresence, shownPresence, type PresencePick, type PresencePickEvent } from "./presence-pick";

/** Plays a run of events through the reducer from nothing picked. */
const play = (...events: PresencePickEvent[]): PresencePick => events.reduce(pickPresence, NO_PICK);

describe("her choice shows at once, and the stored row is the truth again once it agrees", () => {
  it("shows the stored choice while she has not picked anything", () => {
    expect(shownPresence("full", NO_PICK)).toBe("full");
    expect(shownPresence("quiet", NO_PICK)).toBe("quiet");
  });

  it("shows Words only from the moment she picks it, before the device has answered", () => {
    const pick = play({ type: "chose", presence: "words", n: 1 });
    expect(shownPresence("full", pick)).toBe("words");
    // The row has not changed yet and says so; the control still shows her choice.
    expect(shownPresence("full", pickPresence(pick, { type: "stored", presence: "full" }))).toBe("words");
  });

  it("hands back to the stored row only once her choice is saved and the row says the same", () => {
    let pick = play({ type: "chose", presence: "words", n: 1 });
    // The row catches up before the save is reported: her choice is still held (it is not known to be saved).
    pick = pickPresence(pick, { type: "stored", presence: "words" });
    expect(pick.pending).not.toBeNull();
    pick = pickPresence(pick, { type: "saved", n: 1 });
    expect(shownPresence("words", pick)).toBe("words");
    pick = pickPresence(pick, { type: "stored", presence: "words" });
    expect(pick).toEqual(NO_PICK);
    // From then on the row alone decides, so a change made elsewhere (a restored backup) shows as it is.
    expect(shownPresence("quiet", pick)).toBe("quiet");
  });

  it("two quick choices never flicker back to the first one while the first is being saved", () => {
    let pick = play({ type: "chose", presence: "words", n: 1 }, { type: "chose", presence: "quiet", n: 2 });
    for (const event of [
      { type: "saved", n: 1 },
      { type: "stored", presence: "words" },
    ] as PresencePickEvent[]) {
      pick = pickPresence(pick, event);
      expect(shownPresence("words", pick)).toBe("quiet");
    }
    pick = pickPresence(pick, { type: "saved", n: 2 });
    pick = pickPresence(pick, { type: "stored", presence: "quiet" });
    expect(pick).toEqual(NO_PICK);
  });

  it("going back to where she started does not flash the choice in between", () => {
    // Full, then Words only, then Full again before the first save lands: the row passes through Words only.
    let pick = play({ type: "chose", presence: "words", n: 1 }, { type: "chose", presence: "full", n: 2 });
    const seen: CompanionPresence[] = [];
    for (const [stored, event] of [
      ["full", { type: "stored", presence: "full" }],
      ["words", { type: "saved", n: 1 }],
      ["words", { type: "stored", presence: "words" }],
      ["words", { type: "saved", n: 2 }],
    ] as Array<[CompanionPresence, PresencePickEvent]>) {
      pick = pickPresence(pick, event);
      seen.push(shownPresence(stored, pick));
    }
    expect(seen).toEqual(["full", "full", "full", "full"]);
    expect(pickPresence(pick, { type: "stored", presence: "full" })).toEqual(NO_PICK);
  });

  it("a choice the device could not save goes back to the stored one and says so, until her next choice", () => {
    let pick = play({ type: "chose", presence: "words", n: 1 }, { type: "not-saved", n: 1 });
    expect(shownPresence("full", pick)).toBe("full");
    expect(pick.unsaved).toBe(true);
    pick = pickPresence(pick, { type: "chose", presence: "quiet", n: 2 });
    expect(pick.unsaved).toBe(false);
    expect(shownPresence("full", pick)).toBe("quiet");
  });

  it("an earlier choice that fails after a later one is overtaken: the later one decides", () => {
    const pick = play({ type: "chose", presence: "words", n: 1 }, { type: "chose", presence: "quiet", n: 2 }, { type: "not-saved", n: 1 });
    expect(shownPresence("full", pick)).toBe("quiet");
    expect(pick.unsaved).toBe(false);
  });
});

describe("the control draws the choice it is given", () => {
  const copy = describePresence(freshState(new Date("2026-09-24T20:00:00")));
  const render = (shown: CompanionPresence, unsaved = false) =>
    renderToStaticMarkup(createElement(PresenceChoice, { copy, shown, unsaved, onChoose: () => {}, id: "p" }));
  const checked = (html: string) => [...html.matchAll(/<input[^>]*value="(\w+)"[^>]*>/g)].filter((m) => /\schecked=""/.test(m[0])).map((m) => m[1]);

  it("one radio checked, the one shown, in a group named for her", () => {
    for (const shown of ["full", "words", "quiet"] as const) expect(checked(render(shown)), shown).toEqual([shown]);
    const html = render("words");
    expect(html).toContain('role="radiogroup"');
    expect(html).toContain('aria-labelledby="p-legend"');
    expect(html).toContain('id="p-legend"');
    expect(html).toContain("What you see of Rowan");
  });

  it("after Words only is picked and before the device answers, Words only is the radio drawn checked", () => {
    const pick = play({ type: "chose", presence: "words", n: 1 });
    expect(checked(render(shownPresence("full", pick)))).toEqual(["words"]);
  });

  it("says a save that did not happen in one line, in a status the screen reader hears, and nothing otherwise", () => {
    expect(render("full", true)).toContain(`role="status"`);
    expect(render("full", true)).toContain(copy.unsaved);
    expect(render("full", false)).not.toContain(copy.unsaved);
  });
});
