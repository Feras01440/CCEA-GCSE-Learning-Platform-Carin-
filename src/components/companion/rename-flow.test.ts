/**
 * The Letter's rename, as a flow (the trial audit's COMPANION-9, 25 Sep 2026: Enter did nothing, and Save stored the
 * name while nothing on the screen changed, so it looked as if Save had failed). Emotional-design rule 3: every important
 * interaction gets a human response, not only a database write. The flow is pure so every order of events can be proved
 * here; the component only renders it (CompanionLetter), and Enter reaches it because the rename is a form.
 */
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { buildCompanionContext } from "@/lib/companion";
import { FIXTURES } from "@/lib/companion/fixtures";
import { bannedIn, dialectWordsIn, placeWordsIn } from "@/lib/companion/lint";
import { renameNotSaved, renamedReply } from "@/lib/companion/voice";
import { CompanionLetter } from "./CompanionLetter";
import { NO_RENAME, renameStep, shownName, type RenameEvent, type RenameState } from "./rename-flow";

const run = (events: RenameEvent[], from: RenameState = NO_RENAME) => events.reduce(renameStep, from);

describe("the rename, step by step", () => {
  it("takes the new name at once when the device keeps it: the name everywhere in the Letter, and a reply", () => {
    const typed = run([{ type: "typed", value: "  Rua " }]);
    expect(typed.draft).toBe("  Rua ");
    const saving = renameStep(typed, { type: "submit" });
    expect(saving.saving).toBe("Rua");
    const saved = renameStep(saving, { type: "saved" });
    expect(saved).toEqual({ draft: "", saving: null, saved: "Rua", status: "saved" });
    expect(shownName(saved, "Rowan")).toBe("Rua");
  });

  it("does nothing for an empty name, and nothing twice while a save is under way", () => {
    expect(run([{ type: "submit" }])).toEqual(NO_RENAME);
    expect(run([{ type: "typed", value: "   " }, { type: "submit" }]).saving).toBeNull();
    const once = run([{ type: "typed", value: "Rua" }, { type: "submit" }]);
    expect(renameStep(once, { type: "submit" })).toBe(once);
  });

  it("keeps her text and the old name when the device could not save, and says so", () => {
    const failed = run([{ type: "typed", value: "Rua" }, { type: "submit" }, { type: "not-saved" }]);
    expect(failed).toEqual({ draft: "Rua", saving: null, saved: null, status: "not-saved" });
    expect(shownName(failed, "Rowan")).toBe("Rowan");
  });

  it("puts the reply away as soon as she types again, and a second name replaces the first", () => {
    const first = run([{ type: "typed", value: "Rua" }, { type: "submit" }, { type: "saved" }]);
    const typing = renameStep(first, { type: "typed", value: "F" });
    expect(typing.status).toBe("idle");
    expect(shownName(typing, "Rowan")).toBe("Rua");
    const second = run([{ type: "typed", value: "Fern" }, { type: "submit" }, { type: "saved" }], typing);
    expect(shownName(second, "Rowan")).toBe("Fern");
  });

  it("ignores a report that arrives with no save under way", () => {
    expect(renameStep(NO_RENAME, { type: "saved" })).toBe(NO_RENAME);
    expect(renameStep(NO_RENAME, { type: "not-saved" })).toBe(NO_RENAME);
  });
});

describe("what it says", () => {
  it("replies in its own voice, and says plainly when nothing was kept", () => {
    expect(renamedReply("Rua")).toBe("Rua it is.");
    expect(renameNotSaved("Rowan")).toBe("That did not save on this device, so it still answers to Rowan.");
    for (const s of [renamedReply("Rua"), renameNotSaved("Rowan")]) {
      expect(bannedIn(s), s).toEqual([]);
      expect(s).not.toContain("!");
      expect(placeWordsIn(s), s).toEqual([]);
      expect(dialectWordsIn(s), s).toEqual([]);
    }
  });
});

describe("the Letter's rename is a form", () => {
  it("so Enter in the field saves, with Save as its submit button and a status line always in the page", () => {
    const html = renderToStaticMarkup(createElement(CompanionLetter, { moment: "first-letter", context: buildCompanionContext(FIXTURES["fresh-install-day-one"]) }));
    const form = html.match(/<form[^>]*>[\s\S]*?<\/form>/)?.[0] ?? "";
    expect(form).toContain('id="companion-name"');
    expect(form).toMatch(/<button type="submit"[^>]*>Save<\/button>/);
    expect(form).toMatch(/role="status"/);
    // The field keeps its mark as a control of the Letter's own, never an answer field (the containment rule).
    expect(form).toContain('data-companion-control="rename"');
  });
});
