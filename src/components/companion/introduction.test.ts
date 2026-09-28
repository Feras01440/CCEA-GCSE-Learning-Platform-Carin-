/**
 * Her name, asked for and then used (the trial audit's COMPANION-8, 25 Sep 2026): first run asked "What should it call
 * you?" before any "it" had been met, and then nothing ever called her by the name she typed. Now the question is Rowan's:
 * the hare introduces itself in one sentence just above it, and it uses the name, first at the top of its Letter and then,
 * now and then, on Today with one fact about tonight (the companion specification §10: "she is greeted by name with one
 * fact about her own work").
 */
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { LINES, buildCompanionContext, candidatesFor, selectAt, type CompanionContext } from "@/lib/companion";
import { FIXTURES } from "@/lib/companion/fixtures";
import { bannedIn, dialectWordsIn, lintRendered, placeWordsIn } from "@/lib/companion/lint";
import { introduction, learnerNameNote } from "@/lib/companion/voice";
import { DEFAULT_PLAN } from "@/lib/plan/exam-plan";
import { CompanionLetter } from "./CompanionLetter";
import { RowanIntroduction } from "./RowanIntroduction";

const ROOT = resolve(__dirname, "../../..");
const named = (name: string | null, fixture: keyof typeof FIXTURES = "existing-install-next-day", now?: string): CompanionContext =>
  buildCompanionContext({ ...FIXTURES[fixture], plan: { ...DEFAULT_PLAN, learnerName: name }, ...(now ? { now: new Date(now) } : {}) });

describe("first run: the question is Rowan's, and Rowan is met first", () => {
  it("introduces the hare in one sentence that gives 'it' its meaning, with the hare waving hello beside it", () => {
    const html = renderToStaticMarkup(createElement(RowanIntroduction, { presence: "full" }));
    expect(html).toContain(introduction());
    expect(introduction()).toBe("This is Rowan, a hare. It keeps your papers’ dates and what comes back when.");
    expect(html).toContain('data-companion-figure="welcome"');
    expect(html).toContain('data-figure-state="arrival"');
    expect(html).toContain('aria-hidden="true"');
    // It is the product introducing Rowan, not a line of Rowan's: no attribute of a signed line, no field.
    expect(html).not.toContain("data-companion=");
    expect(html).not.toMatch(/<input|<form|<textarea/);
  });

  it("keeps the sentence and draws nothing in Words only or Quiet, or before the choice has been read", () => {
    for (const presence of ["words", "quiet", undefined] as const) {
      const html = renderToStaticMarkup(createElement(RowanIntroduction, { presence }));
      expect(html, String(presence)).toContain(introduction());
      expect(html, String(presence)).not.toContain("<svg");
      expect(html, String(presence)).not.toContain("data-companion-figure");
    }
  });

  it("stands above the name card, never inside it, and before the question in the page's order", () => {
    const source = readFileSync(resolve(ROOT, "src/components/gift/FirstRun.tsx"), "utf8");
    const step = source.slice(source.indexOf("{step === 1 && ("));
    const intro = step.indexOf("<RowanIntroduction");
    const card = step.indexOf("<section");
    const question = step.indexOf("What should it call you?");
    expect(intro).toBeGreaterThan(-1);
    expect(intro).toBeLessThan(card);
    expect(card).toBeLessThan(question);
  });

  it("passes the constitution", () => {
    for (const s of [introduction(), learnerNameNote("Niamh"), learnerNameNote(null)]) {
      expect(bannedIn(s), s).toEqual([]);
      expect(s).not.toContain("!");
      expect(placeWordsIn(s), s).toEqual([]);
      expect(dialectWordsIn(s), s).toEqual([]);
    }
  });
});

describe("the Letter begins with her name", () => {
  it("as a letter does, when she gave one, and not otherwise", () => {
    const withName = renderToStaticMarkup(createElement(CompanionLetter, { moment: "first-letter", context: named("Niamh", "fresh-install-day-one") }));
    expect(withName).toMatch(/<p[^>]*data-salutation=""[^>]*>Niamh,<\/p>/);
    expect(withName.indexOf("Niamh,")).toBeLessThan(withName.indexOf("I keep the dates of your papers"));
    const without = renderToStaticMarkup(createElement(CompanionLetter, { moment: "first-letter", context: named(null, "fresh-install-day-one") }));
    expect(without).not.toContain("data-salutation");
    // Sealed, it is still one line: the name waits inside.
    const sealed = renderToStaticMarkup(createElement(CompanionLetter, { moment: "first-letter", context: named("Niamh") }));
    expect(sealed).toContain('aria-expanded="false"');
    expect(sealed).not.toContain("data-salutation");
  });
});

describe("on Today, now and then, by name, with one fact about tonight", () => {
  /**
   * The Today slot's line with every other line of the slot in its cooldown, except the line's own family: its plain
   * twin stays sayable, so the test also proves the named wording comes first when both could be said.
   */
  const only = (c: CompanionContext, id: string) => {
    const family = LINES.find((l) => l.id === id)?.family;
    const others = [...candidatesFor("evening"), ...candidatesFor("today-open")].filter((l) => l.id !== id && !(family && l.family === family)).map((l) => ({ id: l.id, at: c.now.toISOString() }));
    return selectAt("today-open", { ...c, recentLines: [...c.recentLines, ...others] });
  };

  it("with something back: her name and what comes first", () => {
    const s = only(named("Niamh"), "today.named-first-up");
    expect(s?.line.id).toBe("today.named-first-up");
    expect(s!.text).toBe("Niamh, first up tonight: frustums.");
    expect(lintRendered(s!.line.id, s!.text, s!.values)).toEqual([]);
  });

  it("with nothing back: her name and what is open", () => {
    const c = named("Niamh", "topic-first-visit");
    const s = only({ ...c, slots: { ...c.slots, nextTopicTitle: "Bounds" } }, "today.named-open");
    expect(s?.line.id).toBe("today.named-open");
    expect(s!.text).toBe("Niamh, Bounds is open if you want new ground.");
    const plain = only({ ...c, plainMode: true, slots: { ...c.slots, nextTopicTitle: "Bounds" } }, "today.named-open");
    expect(plain!.text).toBe("Niamh, Bounds is open if you want something new.");
  });

  it("never without a name she gave, never late at night, and not more than once a fortnight", () => {
    expect(only(named(null), "today.named-first-up")?.line.id).not.toBe("today.named-first-up");
    expect(only(named("   "), "today.named-first-up")?.line.id).not.toBe("today.named-first-up");
    expect(only(named("Niamh", "existing-install-next-day", "2026-09-24T23:40:00"), "today.named-first-up")?.line.id).not.toBe("today.named-first-up");
    const c = named("Niamh");
    const week = { ...c, recentLines: [{ id: "today.named-first-up", at: new Date(c.now.getTime() - 7 * 86_400_000).toISOString() }] };
    expect(only(week, "today.named-first-up")?.line.id).not.toBe("today.named-first-up");
  });

  it("takes her name exactly as she typed it, and a capital only where it opens the line", () => {
    const s = only(named("niamh"), "today.named-first-up");
    expect(s!.text).toBe("Niamh, first up tonight: frustums.");
  });

  it("says tonight's fact once an evening: after either wording, the other waits until tomorrow", () => {
    const c = named("Niamh");
    const earlier = new Date(c.now.getTime() - 60 * 60_000).toISOString();
    const yesterday = new Date(c.now.getTime() - 26 * 60 * 60_000).toISOString();
    const pairs: Array<[string, string]> = [
      ["today.named-first-up", "today.first-up"],
      ["today.first-up", "today.named-first-up"],
    ];
    for (const [said, other] of pairs) {
      const rest = [...candidatesFor("evening"), ...candidatesFor("today-open")].filter((l) => l.id !== other && l.id !== said).map((l) => ({ id: l.id, at: c.now.toISOString() }));
      const tonight = selectAt("today-open", { ...c, recentLines: [...rest, { id: said, at: earlier }] });
      expect(tonight?.line.id, `${said} said earlier tonight`).not.toBe(other);
      if (said === "today.named-first-up") {
        // The plain wording is tonight's fact and returns the next evening; the named one keeps its fortnight.
        const tomorrow = selectAt("today-open", { ...c, recentLines: [...rest, { id: said, at: yesterday }] });
        expect(tomorrow?.line.id).toBe(other);
      }
    }
  });
});
