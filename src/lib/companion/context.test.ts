import { describe, expect, it } from "vitest";
import { DEFAULT_PLAN } from "@/lib/plan/exam-plan";
import { buildCompanionContext, dayNameWithin, daysPhrase, joinWords, lateNow, numberWord, shortDate, stonesPhrase, whenPhrase } from "./context";
import { FIXTURES, M4_TOPIC_SLUGS } from "./fixtures";
import { freshState } from "./memory";
import { newCard } from "@/lib/srs/scheduler";
import type { ReviewCard } from "@/lib/db/db";

const DAY = 86_400_000;

describe("the values it hands to a template", () => {
  it("spells small numbers and prints large ones", () => {
    expect(numberWord(0)).toBe("zero");
    expect(numberWord(9)).toBe("nine");
    expect(numberWord(13)).toBe("thirteen");
    expect(numberWord(61)).toBe("61");
  });

  it("says days and stones in the singular when there is one", () => {
    expect(daysPhrase(1)).toBe("one day");
    expect(daysPhrase(13)).toBe("thirteen days");
    expect(stonesPhrase(1)).toBe("one stone");
    expect(stonesPhrase(3)).toBe("three stones");
  });

  it("reads a paper date from the plan, never from a line", () => {
    expect(shortDate("2027-05-14")).toBe("14 May");
  });

  it("names a day only while it is inside the coming week", () => {
    const now = new Date("2026-10-01T19:00:00"); // a Thursday
    expect(dayNameWithin(new Date("2026-10-01T22:00:00"), now)).toBe("later today");
    expect(dayNameWithin(new Date("2026-10-02T09:00:00"), now)).toBe("tomorrow");
    expect(dayNameWithin(new Date("2026-10-05T09:00:00"), now)).toBe("Monday");
    expect(dayNameWithin(new Date("2026-11-05T09:00:00"), now)).toBeNull();
  });

  it("joins a list in English", () => {
    expect(joinWords([])).toBe("");
    expect(joinWords(["bounds"])).toBe("bounds");
    expect(joinWords(["bounds", "circle theorems"])).toBe("bounds and circle theorems");
  });

  it("says a day mid-sentence the British way, and something already due is today", () => {
    const now = new Date("2026-10-01T19:00:00"); // a Thursday
    expect(whenPhrase(new Date("2026-10-01T22:00:00"), now)).toBe("later today");
    expect(whenPhrase(new Date("2026-10-02T09:00:00"), now)).toBe("tomorrow");
    expect(whenPhrase(new Date("2026-10-05T09:00:00"), now)).toBe("on Monday");
    expect(whenPhrase(new Date("2026-09-30T09:00:00"), now)).toBe("today");
    expect(whenPhrase(new Date("2026-11-05T09:00:00"), now)).toBeNull();
  });
});

describe("day one", () => {
  const card = (id: string, topicSlug: string, due: Date, subject: ReviewCard["subject"] = "maths"): ReviewCard => ({
    id,
    subject,
    topicSlug,
    card: newCard(due),
    due,
    createdAt: due,
  });

  it("knows first run is not done, and says so to the selector", () => {
    expect(buildCompanionContext(FIXTURES["before-first-run"]).firstRunDone).toBe(false);
    expect(buildCompanionContext(FIXTURES["normal-evening"]).firstRunDone).toBe(true);
  });

  it("lets the Letter go first on the day it is first offered, and only that day", () => {
    const now = new Date("2026-09-23T19:30:00");
    const base = { now, plan: DEFAULT_PLAN, firstRunDone: true };
    const notYet = buildCompanionContext({ ...base, state: freshState(now) });
    expect(notYet.flags.firstLetterDue).toBe(true);
    expect(notYet.flags.letterGoesFirst).toBe(true);
    const sameDay = buildCompanionContext({ ...base, state: { ...freshState(now), letterOfferedOn: "2026-09-23" } });
    expect(sameDay.flags.letterGoesFirst).toBe(true);
    const nextDay = buildCompanionContext({ ...base, now: new Date("2026-09-24T08:00:00"), state: { ...freshState(now), letterOfferedOn: "2026-09-23" } });
    expect(nextDay.flags.firstLetterDue).toBe(true);
    expect(nextDay.flags.letterGoesFirst).toBe(false);
    const read = buildCompanionContext({ ...base, state: { ...freshState(now), letterSeen: true, letterOfferedOn: "2026-09-23" } });
    expect(read.flags.firstLetterDue).toBe(false);
    expect(read.flags.letterGoesFirst).toBe(false);
  });

  it("counts what comes back from a filed paper's unit only, and says nothing without its topics", () => {
    const now = new Date("2026-11-20T18:30:00");
    const future = [
      card("rp.bounds.04", "bounds-and-accuracy", new Date(now.getTime() + 2 * DAY)),
      card("rp.algebra.01", "algebraic-fractions-simplify", new Date(now.getTime() + DAY), "further-maths"),
      card("rp.circle.09", "circle-theorems", new Date(now.getTime() + 12 * DAY)),
    ];
    const due = [card("rp.frustums.01", "frustums-of-cones", new Date(now.getTime() - DAY))];
    const base = { now, plan: DEFAULT_PLAN, state: freshState(now), futureCards: future, dueCards: due };
    const m4 = buildCompanionContext({ ...base, mock: { unit: "M4", subject: "maths", at: now, topicSlugs: M4_TOPIC_SLUGS } });
    // Frustums is due now and bounds on Sunday; circle theorems is twelve days off, and the FM1 card is another unit.
    expect(m4.slots.mockReturnsCount).toBe("two items");
    expect(m4.slots.mockReturnsWhen).toBe("today");
    expect(m4.flags.mockNothingSoon).toBe(false);
    const unknown = buildCompanionContext({ ...base, mock: { unit: "M4", subject: "maths", at: now } });
    expect(unknown.slots.mockReturnsCount).toBeUndefined();
    expect(unknown.flags.mockNothingSoon).toBe(false);
    expect(unknown.flags.mockEntered).toBe(true);
  });

  it("names the topics returning on the first return day, and only those", () => {
    const now = new Date("2026-10-01T19:00:00");
    const future = [
      card("a", "bounds-and-accuracy", new Date("2026-10-03T10:00:00")),
      card("b", "circle-theorems", new Date("2026-10-03T18:00:00")),
      card("c", "frustums-of-cones", new Date("2026-10-04T10:00:00")),
    ];
    const c = buildCompanionContext({ now, plan: DEFAULT_PLAN, state: freshState(now), futureCards: future, topicTitles: { "bounds-and-accuracy": "bounds", "circle-theorems": "circle theorems", "frustums-of-cones": "frustums" } });
    expect(c.slots.returnDay).toBe("Saturday");
    expect(c.slots.returnWhen).toBe("on Saturday");
    expect(c.slots.returningTopics).toBe("bounds and circle theorems");
  });
});

describe("what it refuses to know", () => {
  it("has no field for the gap, the hour opened, or a missed plan", () => {
    const c = buildCompanionContext(FIXTURES["normal-evening"]);
    const keys = JSON.stringify(Object.keys(c));
    for (const forbidden of ["daysSince", "lastOpened", "missed", "streak", "gap", "hourOpened"]) {
      expect(keys, forbidden).not.toContain(forbidden);
    }
  });

  it("counts sessions up and never down", () => {
    const c = buildCompanionContext(FIXTURES["normal-evening"]);
    expect(c.sessionsThisWeek).toBeGreaterThanOrEqual(0);
    const far = buildCompanionContext(FIXTURES["after-three-days"]);
    expect(far.sessionsThisWeek).toBe(0);
    expect(far.slots.sessionCount).toBeUndefined();
  });

  it("knows it is late only from the clock it was handed, and only while she is here", () => {
    expect(lateNow(new Date("2026-10-01T19:00:00"))).toBe(false);
    expect(lateNow(new Date("2026-10-01T21:29:00"))).toBe(false);
    expect(lateNow(new Date("2026-10-01T21:30:00"))).toBe(true);
    expect(lateNow(new Date("2026-10-02T01:00:00"))).toBe(true);
  });
});

describe("quoting", () => {
  const now = new Date("2026-10-01T19:00:00");

  it("quotes a note she wrote", () => {
    const c = buildCompanionContext({
      now,
      plan: DEFAULT_PLAN,
      state: freshState(now),
      notes: [{ at: new Date(now.getTime() - DAY), kind: "cairn-note", text: "cube the scale factor", source: "her", topicId: "frustums-of-cones" }],
      topicTitles: { "frustums-of-cones": "frustums" },
    });
    expect(c.quotedSlots).toContain("herNote");
    expect(c.slots.herNote).toBe("cube the scale factor");
    expect(c.slots.herNoteTopic).toBe("frustums");
  });

  it("never quotes a line Rowan wrote itself", () => {
    const c = buildCompanionContext({
      now,
      plan: DEFAULT_PLAN,
      state: freshState(now),
      notes: [{ at: now, kind: "cairn-note", text: "a line Rowan left", source: "rowan", topicId: "frustums-of-cones" }],
    });
    expect(c.quotedSlots).toEqual([]);
    expect(c.slots.herNote).toBeUndefined();
    expect(c.flags.hasHerNote).toBe(false);
  });

  it("takes an intended day only when it is a day she chose", () => {
    const state = freshState(now);
    const make = (text: string) =>
      buildCompanionContext({ now, plan: DEFAULT_PLAN, state, notes: [{ at: now, kind: "when-next", text, source: "her" }] });
    expect(make("Thursday").slots.intendedDay).toBe("Thursday");
    expect(make("whenever").slots.intendedDay).toBeUndefined();
  });
});

describe("the plan", () => {
  it("counts every paper back from the real timetable", () => {
    const c = buildCompanionContext(FIXTURES["normal-evening"]);
    expect(c.nextPaper?.unit).toBe("B1");
    expect(c.nextPaper?.date).toBe("2027-05-11");
    expect(c.slots.papersLine).toBe("B1 on 11 May, then M4 on 14 May");
    expect(c.daysToPaperByUnit["maths:M4"]).toBeGreaterThan(0);
  });

  it("knows a paper has been sat once its sitting has finished", () => {
    expect(buildCompanionContext(FIXTURES["after-a-paper"]).flags.afterPaper).toBe(true);
    expect(buildCompanionContext(FIXTURES["paper-eve"]).flags.afterPaper).toBe(false);
    expect(buildCompanionContext(FIXTURES["paper-eve"]).flags.paperEve).toBe(true);
  });
});
