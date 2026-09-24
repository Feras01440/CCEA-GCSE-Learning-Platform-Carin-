/**
 * The Tonight tile and Rowan's arrival line share one screen, and on 24 September 2026 they said the same words when
 * nothing was due: the tile's headline "Nothing back tonight." and Rowan's "Nothing back tonight. … is open if you
 * want something new." One screen, one sentence, once: the tile states the fact in the product's voice and Rowan's
 * line is its own. This holds every line the Today slot can select, in both wordings and every fixture, against
 * every sentence the tile can print for that context.
 */
import { describe, expect, it } from "vitest";
import { buildCompanionContext, candidatesFor, select, type CompanionContext, type Moment } from "@/lib/companion";
import { bannedIn } from "@/lib/companion/lint";
import { FIXTURES, FIXTURE_NAMES } from "@/lib/companion/fixtures";
import { NOTHING_BACK, tonightHeadline, tonightSentences, tonightSublines } from "./tonight-copy";

/** Sentences as a reader hears them: split at a full stop or a question mark, lower-cased, trimmed. */
function sentences(text: string): string[] {
  return text
    .split(/(?<=[.?])\s+/)
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
}

/** Every line the slot's moments could put on Today from this context: each candidate forced in turn by cooling the rest. */
function everyLineSaid(c: CompanionContext): string[] {
  const out: string[] = [];
  for (const moment of ["today-open", "evening"] as Moment[]) {
    for (const line of candidatesFor(moment)) {
      const others = candidatesFor(moment).filter((l) => l.id !== line.id).map((l) => ({ id: l.id, at: c.now.toISOString() }));
      const s = select(moment, { ...c, recentLines: others });
      if (s) out.push(s.text);
    }
  }
  return out;
}

describe("the tile's own words", () => {
  it("state the fact and the length, in the product's voice, with nothing from the banned list", () => {
    expect(tonightHeadline(0)).toBe(NOTHING_BACK);
    expect(tonightHeadline(9)).toBe("9 back");
    expect(tonightSublines({ due: 0, gentle: false, firstWeek: true })).toEqual(["Ten minutes on a new topic is enough."]);
    expect(tonightSublines({ due: 0, gentle: true, firstWeek: false })).toEqual(["Ten minutes is enough tonight."]);
    expect(tonightSublines({ due: 9, gentle: true, firstWeek: true })).toEqual([
      "Chosen for you: questions to try again, and ones you answered without being sure.",
      "Ten minutes is enough tonight.",
    ]);
    expect(tonightSublines({ due: 9, gentle: false, firstWeek: false })).toEqual([]);
    for (const due of [0, 1, 9]) {
      for (const gentle of [false, true]) {
        for (const firstWeek of [false, true]) {
          for (const s of tonightSentences({ due, gentle, firstWeek })) {
            expect(bannedIn(s), s).toEqual([]);
            expect(s).not.toContain("!");
          }
        }
      }
    }
  });
});

describe("one screen, one sentence, once (24 September 2026)", () => {
  it("no line Rowan can say on Today repeats a sentence the tile prints for the same night, in either wording", () => {
    for (const name of FIXTURE_NAMES) {
      const base = buildCompanionContext(FIXTURES[name]);
      for (const plainMode of [false, true]) {
        const c = { ...base, plainMode };
        const tile = new Set<string>();
        for (const gentle of [false, true]) {
          for (const firstWeek of [false, true]) {
            for (const s of tonightSentences({ due: c.due.count, gentle, firstWeek })) for (const one of sentences(s)) tile.add(one);
          }
        }
        for (const said of everyLineSaid(c)) {
          const shared = sentences(said).filter((s) => tile.has(s));
          expect(shared, `${name} (${plainMode ? "plain" : "voiced"}): Rowan "${said}" repeats the tile`).toEqual([]);
        }
      }
    }
  });

  it("when nothing is due, Rowan's line says what is open, not that nothing is back", () => {
    const c = buildCompanionContext(FIXTURES["topic-first-visit"]);
    expect(c.flags.noDue).toBe(true);
    const others = candidatesFor("today-open").filter((l) => l.id !== "today.nothing-back").map((l) => ({ id: l.id, at: c.now.toISOString() }));
    const voiced = select("today-open", { ...c, recentLines: others, nextPaper: c.nextPaper, slots: { ...c.slots, nextTopicTitle: "Bounds" } });
    expect(voiced?.line.id).toBe("today.nothing-back");
    expect(voiced!.text).toBe("Bounds is open if you want new ground.");
    const plain = select("today-open", { ...c, plainMode: true, recentLines: others, slots: { ...c.slots, nextTopicTitle: "Bounds" } });
    expect(plain!.text).toBe("Bounds is open if you want something new.");
    for (const s of [voiced!.text, plain!.text]) expect(sentences(s)).not.toContain(NOTHING_BACK.toLowerCase());
  });
});
