import { describe, expect, it } from "vitest";
import { bannedIn } from "@/lib/companion/lint";
import { NOT_OPENED, TWIN_NOTE, reviewHeadline, unopenedLine, unopenedOnly } from "./review-copy";

describe("the review close card's headline", () => {
  it("says in words when nothing was answered, and counts otherwise", () => {
    expect(reviewHeadline(0, 1)).toBe("Nothing answered tonight");
    expect(reviewHeadline(1, 3)).toBe("1 item · 3 min");
    expect(reviewHeadline(12, 9)).toBe("12 items · 9 min");
    expect(reviewHeadline(2, 0)).toBe("2 items · 1 min");
  });
});

describe("what the inbox says about a card it cannot open", () => {
  it("is honest about why, and says the card stays: never 'withdrawn', which was untrue of a flashcard or of no signal", () => {
    // Build 8 said "This item has been withdrawn from the content while it is checked." of every flashcard (27 Sep).
    expect(NOT_OPENED).toBe("This one could not be opened on this device just now. It stays in your reviews.");
    expect(unopenedLine(0)).toBeNull();
    expect(unopenedLine(1)).toBe("One other card could not be opened on this device just now; it stays in your reviews.");
    expect(unopenedLine(3)).toBe("3 other cards could not be opened on this device just now; they stay in your reviews.");
    for (const s of [NOT_OPENED, unopenedLine(1)!, unopenedLine(3)!]) {
      expect(s).not.toMatch(/withdrawn/i);
      expect(bannedIn(s), s).toEqual([]);
      expect(s).not.toContain("!");
    }
  });

  it("says why a check looks new when it is asked as its twin", () => {
    expect(TWIN_NOTE).toBe("The same check as in the lesson, on new numbers.");
    expect(bannedIn(TWIN_NOTE)).toEqual([]);
  });

  it("when nothing due tonight can be opened, never says 'Nothing due'", () => {
    expect(unopenedOnly(1)).toEqual({ title: "Nothing to open just now", line: "One card is due, but it could not be opened on this device just now. It stays in your reviews." });
    expect(unopenedOnly(2).line).toBe("2 cards are due, but they could not be opened on this device just now. They stay in your reviews.");
    for (const n of [1, 2]) expect(unopenedOnly(n).title).not.toMatch(/nothing due/i);
  });
});
