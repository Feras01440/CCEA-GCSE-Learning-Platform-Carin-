/**
 * The Tonight tile and Rowan's arrival line share one screen. One screen, one sentence, once: the headline states the
 * fact in the product's voice, and under it stands ONE sentence beside the hare: Rowan's line when Rowan speaks this
 * open, otherwise the tile's own sentence (tonightSentence). They are never shown together, so they cannot repeat one
 * another; and no line Rowan can say on Today repeats the headline, in either wording, in any fixture.
 *
 * Found on build 8 (the trial audit, 25 Sep 2026): the tile printed "Ten minutes on a new topic is enough." above
 * Rowan's "… is open if you want something new." (the same advice twice, TODAY-3), and late at night "Nothing back
 * tonight. Ten minutes on a new topic is enough." above Rowan's "It is late and nothing is due. Anything new will keep
 * for tomorrow." (the fact twice, and opposite advice on one tile, TODAY-2).
 */
import { describe, expect, it } from "vitest";
import { buildCompanionContext, candidatesFor, selectAt, type CompanionContext } from "@/lib/companion";
import { bannedIn } from "@/lib/companion/lint";
import { FIXTURES, FIXTURE_NAMES } from "@/lib/companion/fixtures";
import { NOTHING_BACK, tonightHeadline, tonightSentence, type TonightState } from "./tonight-copy";

/** Sentences as a reader hears them: split at a full stop or a question mark, lower-cased, trimmed. */
function sentences(text: string): string[] {
  return text
    .split(/(?<=[.?])\s+/)
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
}

/**
 * Every line the Today slot could put on the tile from this context: each candidate forced in turn by cooling the rest
 * (all but its own family, whose twin said tonight would hold it back until tomorrow).
 */
function everyLineSaid(c: CompanionContext): string[] {
  const all = [...candidatesFor("evening"), ...candidatesFor("today-open")];
  const out: string[] = [];
  for (const line of all) {
    const others = all.filter((l) => l.id !== line.id && !(line.family && l.family === line.family)).map((l) => ({ id: l.id, at: c.now.toISOString() }));
    const s = selectAt("today-open", { ...c, recentLines: others });
    if (s) out.push(s.text);
  }
  return out;
}

const STATES: TonightState[] = [];
for (const due of [0, 1, 9]) for (const gentle of [false, true]) for (const late of [false, true]) STATES.push({ due, gentle, late });

describe("the tile's own words", () => {
  it("state the fact and the length in the headline, in the product's voice", () => {
    expect(tonightHeadline(0)).toBe(NOTHING_BACK);
    expect(tonightHeadline(9)).toBe("9 back");
  });

  it("give one sentence for every state, and it is true of that state", () => {
    expect(tonightSentence({ due: 0, gentle: false, late: false })).toBe("Ten minutes on a new topic is enough.");
    expect(tonightSentence({ due: 0, gentle: true, late: false })).toBe("Ten minutes is enough tonight.");
    expect(tonightSentence({ due: 9, gentle: false, late: false })).toBe("Each one is back just before you would forget it.");
    expect(tonightSentence({ due: 9, gentle: true, late: false })).toBe("Ten minutes is enough tonight.");
    expect(tonightSentence({ due: 9, gentle: false, late: true })).toBe("Ten minutes is enough tonight.");
    expect(tonightSentence({ due: 0, gentle: false, late: true })).toBe("Anything new can wait for tomorrow.");
    for (const s of STATES) {
      const said = tonightSentence(s);
      expect(sentences(said), JSON.stringify(s)).toHaveLength(1);
      expect(bannedIn(said), said).toEqual([]);
      expect(said).not.toContain("!");
    }
  });

  it("late at night never advises new work, whatever else is true", () => {
    for (const s of STATES.filter((x) => x.late)) {
      expect(tonightSentence(s), JSON.stringify(s)).not.toMatch(/new topic|something new|start|first up/i);
    }
  });
});

describe("one screen, one sentence, once", () => {
  it("no line Rowan can say on Today repeats the headline, in either wording, at any hour", () => {
    for (const name of FIXTURE_NAMES) {
      for (const hour of ["19:20", "23:40"]) {
        const input = FIXTURES[name];
        const day = input.now.toISOString().slice(0, 10);
        const base = buildCompanionContext({ ...input, now: new Date(`${day}T${hour}:00`) });
        for (const plainMode of [false, true]) {
          const c = { ...base, plainMode };
          const headline = new Set(sentences(tonightHeadline(c.due.count)));
          for (const said of everyLineSaid(c)) {
            const shared = sentences(said).filter((s) => headline.has(s));
            expect(shared, `${name} ${hour} (${plainMode ? "plain" : "voiced"}): Rowan "${said}" repeats the tile`).toEqual([]);
          }
        }
      }
    }
  });

  it("when nothing is due, Rowan never states the tile's own fact again", () => {
    for (const hour of ["19:20", "23:40"]) {
      const c = buildCompanionContext({ ...FIXTURES["topic-first-visit"], now: new Date(`2026-10-01T${hour}:00`), nextTopic: { slug: "bounds-and-accuracy", title: "Bounds" } });
      expect(c.flags.noDue).toBe(true);
      for (const said of everyLineSaid(c)) expect(said, `${hour}: ${said}`).not.toMatch(/nothing is due|nothing back|nothing due/i);
    }
  });

  it("when nothing is due in the evening, Rowan's line says what is open, not that nothing is back", () => {
    const c = buildCompanionContext(FIXTURES["topic-first-visit"]);
    expect(c.flags.noDue).toBe(true);
    const others = candidatesFor("today-open").filter((l) => l.id !== "today.nothing-back" && l.family !== "open-offer").map((l) => ({ id: l.id, at: c.now.toISOString() }));
    const voiced = selectAt("today-open", { ...c, recentLines: others, slots: { ...c.slots, nextTopicTitle: "Bounds" } });
    expect(voiced?.line.id).toBe("today.nothing-back");
    expect(voiced!.text).toBe("Bounds is open if you want new ground.");
    const plain = selectAt("today-open", { ...c, plainMode: true, recentLines: others, slots: { ...c.slots, nextTopicTitle: "Bounds" } });
    expect(plain!.text).toBe("Bounds is open if you want something new.");
    for (const s of [voiced!.text, plain!.text]) expect(sentences(s)).not.toContain(NOTHING_BACK.toLowerCase());
  });
});
