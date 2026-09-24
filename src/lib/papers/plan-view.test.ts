import { describe, expect, test } from "vitest";
import type { Mock } from "@/lib/db/db";
import { DEFAULT_PLAN, entryTier, type ExamPlan } from "@/lib/plan/exam-plan";
import { pickerPapers } from "./index";
import type { PaperSubject, PickerPaper } from "./meta";
import { NO_PAPERS_NOTE, buildPlanView, daysAwayWord, umsLine } from "./plan-view";

const TODAY = "2026-09-15";

/** The plan with some entries changed. */
const withEntries = (change: (e: ExamPlan["entries"][number]) => ExamPlan["entries"][number] | null): ExamPlan => ({
  ...DEFAULT_PLAN,
  entries: DEFAULT_PLAN.entries.map(change).filter((e): e is ExamPlan["entries"][number] => e !== null),
});

const INDEX: Record<PaperSubject, PickerPaper[]> = {
  maths: pickerPapers("maths"),
  "further-maths": pickerPapers("further-maths"),
  science: pickerPapers("science"),
};

const EMPTY: Record<PaperSubject, PickerPaper[]> = { maths: [], "further-maths": [], science: [] };

const view = (over: { plan?: ExamPlan; today?: string; papers?: Record<PaperSubject, PickerPaper[]>; mocks?: Mock[] } = {}) =>
  buildPlanView({
    plan: over.plan ?? DEFAULT_PLAN,
    today: over.today ?? TODAY,
    papers: over.papers ?? INDEX,
    mocks: over.mocks ?? [],
  });

/** A saved run of B1 Higher. */
const b1Mock = (over: Partial<Mock>): Mock => ({
  at: new Date("2026-09-01"),
  paperId: "b1-2025",
  subject: "science",
  unit: "B1",
  engineUnit: "B1H",
  sessionKey: "2025-Summer",
  tier: "H",
  paperNumber: null,
  discipline: null,
  booklet: null,
  minutesUsed: 60,
  paused: 0,
  pausedMinutes: 0,
  marks: [],
  raw: 50,
  rawMax: 70,
  ums: 47,
  grade: "b",
  series: "summer-2025",
  estimated: true,
  ...over,
});

describe("plan view", () => {
  test("her twelve entries become cards (Unit 7 with them), the next paper first, dates ascending", () => {
    const v = view();
    expect(v.cards).toHaveLength(12);
    expect(v.cards[0]).toMatchObject({ unit: "B1", subject: "science", date: "2027-05-11", daysAway: 238 });
    expect(v.cards.map((c) => c.date)).toEqual([...v.cards.map((c) => c.date)].sort());
    expect(v.cards.map((c) => c.unit)).toContain("M4");
    expect(v.cards.map((c) => c.unit)).toContain("M8");
    expect(v.cards.map((c) => c.unit)).toEqual(expect.arrayContaining(["FM1", "FM2", "FM3"]));
  });

  test("papers already sat drop out of the plan; nothing is left once every date has passed", () => {
    expect(view({ today: "2027-05-12" }).cards.map((c) => c.unit)).not.toContain("B1");
    expect(view({ today: "2027-07-01" }).cards).toHaveLength(0);
  });

  test("Foundation papers are hidden on a Higher entry and counted, newest sitting first", () => {
    const b1 = view().cards.find((c) => c.unit === "B1")!;
    expect(b1.tier).toBe("H");
    expect(b1.papers.length).toBeGreaterThan(0);
    expect(b1.papers.every((p) => p.tier === "H")).toBe(true);
    expect(b1.hiddenTierCount).toBeGreaterThan(0);
    expect(b1.hiddenTierCount).toBe(INDEX.science.filter((p) => p.unit === "B1" && p.tier === "F").length);
    expect(b1.note).toBeNull();
    expect(b1.sittings[0].sessionKey).toBe("2026-March"); // the newest B1 in the feed; Summer 2026 Science is not up yet
    expect(b1.sittings.map((s) => s.sessionKey)).toEqual([...new Set(b1.papers.map((p) => p.sessionKey))]);

    // The same plan at Foundation hides the Higher papers instead.
    const foundation = withEntries((e) => (e.subject === "science" ? { ...e, tier: "F" } : e));
    const f = view({ plan: foundation }).cards.find((c) => c.unit === "B1")!;
    expect(f.papers.every((p) => p.tier === "F")).toBe(true);
    expect(f.papers.length).toBe(b1.hiddenTierCount);
  });

  test("M8 keeps both papers of a sitting, Paper 1 first; Further Maths has no tier", () => {
    const m8 = view().cards.find((c) => c.unit === "M8")!;
    expect(m8.tier).toBe("H");
    expect(m8.hiddenTierCount).toBe(0); // the M8 code is Higher; the Foundation route is M6
    expect(m8.sittings[0].papers.map((p) => p.paperNumber)).toEqual([1, 2]);
    const fm1 = view().cards.find((c) => c.unit === "FM1")!;
    expect(fm1.tier).toBeNull();
    expect(fm1.papers.every((p) => p.unit === "FM1")).toBe(true);
  });

  test("units she does not sit are left out of the plan, and Unit 7 is in it with its Booklet B papers", () => {
    const units = view().cards.map((c) => c.unit);
    for (const u of ["M1", "M2", "M3", "M5", "M6", "M7", "FM4"]) expect(units).not.toContain(u);
    const u7 = view().cards.find((c) => c.unit === "U7")!;
    expect(u7).toMatchObject({ subject: "science", tier: "H", date: "2027-06-02" });
    expect(u7.papers.every((p) => p.unit === "U7" && p.tier === "H")).toBe(true);
    // A plan without Further Maths drops those three cards, and only those.
    const noFm = view({ plan: withEntries((e) => (e.subject === "further-maths" ? null : e)) });
    expect(noFm.cards).toHaveLength(9);
    expect(noFm.cards.some((c) => c.subject === "further-maths")).toBe(false);
  });

  test("best is the highest UMS and latest is the newest run of that unit", () => {
    const mocks: Mock[] = [
      b1Mock({ id: 1, at: new Date("2026-09-01"), raw: 50, ums: 47, grade: "b" }),
      b1Mock({ id: 2, at: new Date("2026-09-08"), raw: 61, ums: 58, grade: "a" }),
      b1Mock({ id: 3, at: new Date("2026-09-12"), raw: 44, ums: 41, grade: "c" }),
      // Another unit's run must not leak on to the B1 card.
      b1Mock({ id: 4, unit: "C1", engineUnit: "C1H", at: new Date("2026-09-14"), raw: 68, ums: 64, grade: "a" }),
      // Nor must a Foundation run of the same unit while she sits Higher.
      b1Mock({ id: 5, tier: "F", engineUnit: "B1F", at: new Date("2026-09-13"), raw: 60, ums: 60, grade: "a" }),
    ];
    const b1 = view({ mocks }).cards.find((c) => c.unit === "B1")!;
    expect(b1.runCount).toBe(3);
    expect(b1.best?.id).toBe(2);
    expect(b1.best?.ums).toBe(58);
    expect(b1.latest?.id).toBe(3);
    expect(umsLine(b1.latest!)).toBe("44 of 70 raw → 41 UMS → grade c (estimated)");

    const c1 = view({ mocks }).cards.find((c) => c.unit === "C1")!;
    expect(c1.best?.id).toBe(4);
    expect(c1.latest?.id).toBe(4);

    const v = view({ mocks });
    expect(v.runCount).toBe(4);
    expect(v.unitsWithRuns).toBe(2);
    expect(view().cards.every((c) => c.best === null && c.latest === null)).toBe(true);
    expect(view().runCount).toBe(0);
  });

  test("a single run is both the best and the latest", () => {
    const one = view({ mocks: [b1Mock({ id: 7 })] }).cards.find((c) => c.unit === "B1")!;
    expect(one.best?.id).toBe(7);
    expect(one.latest?.id).toBe(7);
  });

  test("an empty index leaves every card empty, each with the honest sentence", () => {
    const v = view({ papers: EMPTY });
    expect(v.cards).toHaveLength(12);
    expect(v.planPaperCount).toBe(0);
    expect(v.cataloguePaperCount).toBe(0);
    for (const c of v.cards) {
      expect(c.papers).toHaveLength(0);
      expect(c.sittings).toHaveLength(0);
      expect(c.note).toBe(NO_PAPERS_NOTE);
    }
  });

  test("a unit with papers only at the other tier says where they are", () => {
    const papers = { ...EMPTY, science: INDEX.science.filter((p) => p.unit === "B1" && p.tier === "F") };
    const b1 = view({ papers }).cards.find((c) => c.unit === "B1")!;
    expect(b1.papers).toHaveLength(0);
    expect(b1.note).toBe("No Higher papers for this unit in the archive; the Foundation ones are in the full catalogue below.");
  });

  test("counts: the plan is a small share of the catalogue", () => {
    const v = view();
    expect(v.cataloguePaperCount).toBe(INDEX.maths.length + INDEX["further-maths"].length + INDEX.science.length);
    expect(v.planPaperCount).toBeGreaterThan(0);
    expect(v.planPaperCount).toBeLessThan(v.cataloguePaperCount);
    expect(v.hiddenTierCount).toBeGreaterThan(0);
  });

  test("entry tiers come from the unit code where it fixes one, and from the entry where the subject is entered at one", () => {
    expect(entryTier({ subject: "maths", unit: "M4", tier: null })).toBe("H");
    expect(entryTier({ subject: "maths", unit: "M1", tier: null })).toBe("F");
    expect(entryTier({ subject: "science", unit: "B1", tier: "H" })).toBe("H");
    expect(entryTier({ subject: "science", unit: "B1", tier: "F" })).toBe("F");
    expect(entryTier({ subject: "further-maths", unit: "FM1", tier: null })).toBeNull();
    expect(entryTier({ subject: "science", unit: "B1", tier: null })).toBeNull();
  });

  test("a subject the archive does not cover still gets its card, with the honest sentence", () => {
    const papers = { ...INDEX } as Record<string, PickerPaper[]>;
    delete papers["further-maths"];
    const fm1 = view({ papers: papers as Record<PaperSubject, PickerPaper[]> }).cards.find((c) => c.unit === "FM1")!;
    expect(fm1.papers).toHaveLength(0);
    expect(fm1.note).toBe(NO_PAPERS_NOTE);
  });

  test("days remaining are said plainly", () => {
    expect(daysAwayWord(0)).toBe("today");
    expect(daysAwayWord(1)).toBe("tomorrow");
    expect(daysAwayWord(238)).toBe("in 238 days");
  });

  test("the UMS line reads raw → UMS → grade", () => {
    expect(umsLine({ raw: 78, rawMax: 100, ums: 166, grade: "a", estimated: false })).toBe("78 of 100 raw → 166 UMS → grade a");
  });
});
