/**
 * A lesson she paused, on Today (the trial audit's READ-12, with the read-flow agent's record, src/components/topic/
 * read-place.ts): "Pause here" used to land on a Today that said nothing about the lesson, whose one button and Next step
 * both went to a different topic. Now the tile says where the lesson opens and offers the way back, in the product's
 * voice, and Rowan, the evening she paused, says the section is done, in its own; the two never say the same thing, and
 * nothing on the tile then invites her to start something new instead.
 */
import { describe, expect, it } from "vitest";
import { buildCompanionContext, candidatesFor, selectAt, type CompanionContext } from "@/lib/companion";
import { FIXTURES } from "@/lib/companion/fixtures";
import { bannedIn } from "@/lib/companion/lint";
import { pausedRow, tonightSentence } from "./tonight-copy";

const PAUSED = { title: "Simplifying algebraic fractions", done: 3, open: 4, total: 9, pausedToday: true };

/** Sentences as a reader hears them. */
const sentences = (text: string) =>
  text
    .split(/(?<=[.?])\s+/)
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);

/** Every line the Today slot could say in this context (each forced in turn by cooling the rest, family apart). */
function everyLineSaid(c: CompanionContext): Array<{ id: string; text: string }> {
  const all = [...candidatesFor("evening"), ...candidatesFor("today-open")];
  const out: Array<{ id: string; text: string }> = [];
  for (const line of all) {
    const others = all.filter((l) => l.id !== line.id && !(line.family && l.family === line.family)).map((l) => ({ id: l.id, at: c.now.toISOString() }));
    const s = selectAt("today-open", { ...c, recentLines: others });
    if (s && s.line.id === line.id) out.push({ id: s.line.id, text: s.text });
  }
  return out;
}

describe("the tile's way back to a paused lesson", () => {
  it("says the lesson and the section it opens at, and the one word of the way back", () => {
    expect(pausedRow(PAUSED)).toEqual({ label: "Simplifying algebraic fractions · section 4 of 9 next", action: "Carry on" });
    expect(bannedIn(pausedRow(PAUSED).label)).toEqual([]);
  });

  it("with nothing due, the tile's own sentence keeps to the lesson rather than something new", () => {
    expect(tonightSentence({ due: 0, gentle: false, late: false, paused: true })).toBe("Your place in the lesson is kept.");
    expect(tonightSentence({ due: 0, gentle: false, late: false, paused: false })).toBe("Ten minutes on a new topic is enough.");
    expect(tonightSentence({ due: 0, gentle: false, late: true, paused: true })).toBe("Anything new can wait for tomorrow.");
  });
});

describe("Rowan, the evening she paused", () => {
  const base = buildCompanionContext({ ...FIXTURES["topic-first-visit"], pausedLesson: PAUSED, nextTopic: { slug: "bounds-and-accuracy", title: "Bounds" } });

  it("says the section is done and the rest will keep, and never repeats the tile", () => {
    expect(base.flags.lessonPaused && base.flags.pausedToday).toBe(true);
    const s = selectAt("today-open", base);
    expect(s?.line.id).toBe("today.paused-done");
    expect(s!.text).toBe("Section 3 done. The rest will keep.");
    const row = new Set([...sentences(pausedRow(PAUSED).label), ...sentences(tonightSentence({ due: 0, gentle: false, late: false, paused: true }))]);
    for (const said of everyLineSaid(base)) expect(sentences(said.text).filter((x) => row.has(x)), said.text).toEqual([]);
  });

  it("never offers something new while a lesson waits half done", () => {
    const ids = everyLineSaid(base).map((s) => s.id);
    expect(ids).not.toContain("today.nothing-back");
    expect(ids).not.toContain("today.named-open");
  });

  it("says it only the evening she paused, and not when she has gone back into the lesson since", () => {
    const later = buildCompanionContext({ ...FIXTURES["topic-first-visit"], pausedLesson: { ...PAUSED, pausedToday: false } });
    expect(later.flags.lessonPaused).toBe(true);
    expect(later.flags.pausedToday).toBe(false);
    expect(everyLineSaid(later).map((s) => s.id)).not.toContain("today.paused-done");
    const none = buildCompanionContext({ ...FIXTURES["topic-first-visit"], pausedLesson: null });
    expect(none.flags.lessonPaused).toBe(false);
  });
});
