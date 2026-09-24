import { describe, expect, it } from "vitest";
import examMap from "../../../data/exams/exam-map.json";
import fmSpec from "../../../data/spec/further-mathematics.json";
import mathsSpec from "../../../data/spec/mathematics.json";
import {
  DEFAULT_PLAN,
  DEFAULT_UNIT_1_SCIENCE_SERIES,
  catalogue,
  entryWhen,
  formatLength,
  migratePlan,
  nextPaper,
  nextPlanPaper,
  planPapers,
  planSummary,
  practicalWindow,
  seriesFor,
  upcomingPapers,
  type ExamPlan,
  type ExamPlanV1,
} from "./exam-plan";

const TODAY = "2026-09-23";

const V1: ExamPlanV1 = {
  version: 1,
  learnerName: "Aoife",
  maths: { gateway: "M4", completion: "M8", gatewaySeries: "2027-Summer", completionSeries: "2027-Summer" },
  furtherMaths: { units: ["FM1", "FM2", "FM3"], series: "2027-Summer" },
  science: { tier: "H", unit1Series: "2027-Summer", unit2Series: "2027-Summer" },
  sessionsPerWeek: 4,
};

describe("exam plan", () => {
  it("lists the default plan soonest first with real CCEA dates", () => {
    const list = upcomingPapers(DEFAULT_PLAN, "2026-09-15");
    expect(list[0]).toMatchObject({ subject: "science", unit: "B1", date: "2027-05-11", start: "09:15", durationMinutes: 60 });
    expect(list.find((p) => p.unit === "M4")).toMatchObject({ date: "2027-05-14", durationMinutes: 120 });
    expect(list.find((p) => p.unit === "M8")).toMatchObject({ date: "2027-05-27", durationMinutes: 150 });
    expect(list.find((p) => p.unit === "FM1")).toMatchObject({ date: "2027-05-18", durationMinutes: 120 });
    expect(list.map((p) => p.date)).toEqual([...list.map((p) => p.date)].sort());
  });

  it("supports a November 2026 M4 entry", () => {
    const plan: ExamPlan = { ...DEFAULT_PLAN, entries: DEFAULT_PLAN.entries.map((e) => (e.unit === "M4" ? { ...e, series: "2026-November" } : e)) };
    expect(nextPaper(plan, "2026-10-01")).toMatchObject({ unit: "M4", date: "2026-11-17", daysAway: 47 });
  });

  it("returns null when every paper has passed", () => {
    expect(nextPaper(DEFAULT_PLAN, "2027-07-01")).toBeNull();
    expect(nextPlanPaper(DEFAULT_PLAN, "2027-07-01")).toBeNull();
  });

  it("the default is a list of entries, with one value deciding when B1, C1 and P1 are sat", () => {
    expect(DEFAULT_PLAN.version).toBe(2);
    expect(DEFAULT_PLAN.entries.map((e) => e.unit)).toEqual(["M4", "M8", "FM1", "FM2", "FM3", "B1", "C1", "P1", "B2", "C2", "P2", "U7"]);
    for (const u of ["B1", "C1", "P1"]) expect(DEFAULT_PLAN.entries.find((e) => e.unit === u)!.series).toBe(DEFAULT_UNIT_1_SCIENCE_SERIES);
  });
});

describe("a stored plan", () => {
  it("in the old three-field shape becomes the same papers as entries, Unit 7 with the Unit 2 papers", () => {
    const v2 = migratePlan(V1);
    expect(v2.version).toBe(2);
    expect(v2.learnerName).toBe("Aoife");
    expect(v2.entries).toEqual(DEFAULT_PLAN.entries);
    expect(planPapers(v2, TODAY)).toEqual(planPapers(DEFAULT_PLAN, TODAY));
  });

  it("keeps what she changed in the old shape", () => {
    const v2 = migratePlan({ ...V1, science: { tier: "F", unit1Series: "2026-Summer", unit2Series: "2027-Summer" }, furtherMaths: { units: ["FM1", "FM3", "FM4"], series: "2027-Summer" } });
    expect(v2.entries.filter((e) => e.subject === "further-maths").map((e) => e.unit)).toEqual(["FM1", "FM3", "FM4"]);
    expect(v2.entries.find((e) => e.unit === "B1")).toEqual({ subject: "science", unit: "B1", series: "2026-Summer", tier: "F" });
    expect(v2.entries.find((e) => e.unit === "U7")).toEqual({ subject: "science", unit: "U7", series: "2027-Summer", tier: "F" });
  });

  it("drops a subject the old shape had switched off, and a repeated unit, and falls back to the default on junk", () => {
    expect(migratePlan({ ...V1, furtherMaths: null }).entries.some((e) => e.subject === "further-maths")).toBe(false);
    const twice = migratePlan({ ...DEFAULT_PLAN, entries: [...DEFAULT_PLAN.entries, { subject: "maths", unit: "M4", series: "2026-November", tier: null }] });
    expect(twice.entries.filter((e) => e.unit === "M4")).toHaveLength(1);
    expect(migratePlan(null)).toBe(DEFAULT_PLAN);
    expect(migratePlan({ version: 7 })).toBe(DEFAULT_PLAN);
  });

  it("reads back in words, in the exam map's order", () => {
    expect(planSummary(DEFAULT_PLAN)).toBe("Maths M4, M8 · Further Maths FM1, FM2, FM3 · Science B1, C1, P1, B2, C2, P2, U7 (Higher)");
    expect(planSummary(V1)).toBe(planSummary(DEFAULT_PLAN));
  });
});

describe("her Further Maths entries", () => {
  it("are FM1, FM2 and FM3 in Summer 2027, dated as the specification's own timetable dates them", () => {
    const fm = upcomingPapers(DEFAULT_PLAN, TODAY).filter((p) => p.subject === "further-maths");
    expect(fm.map((p) => p.unit)).toEqual(["FM1", "FM2", "FM3"]);
    const spec = fmSpec.examDates["Summer 2027"] as unknown as Record<string, { date: string; session: string; durationMinutes: number }>;
    for (const p of fm) {
      expect(p.date).toBe(spec[p.unit].date);
      expect(p.durationMinutes).toBe(spec[p.unit].durationMinutes);
      expect(p.start).toBe(spec[p.unit].session === "Morning" ? "09:15" : "13:30");
      expect(p.daysAway).toBeGreaterThan(0);
    }
  });

  it("the exam map agrees with further-mathematics.json on every Further Maths date it carries", () => {
    const bySeries: Record<string, string> = { "2026-Summer": "Summer 2026", "2027-Summer": "Summer 2027" };
    const rows = examMap.papers.filter((p) => p.subject === "further-maths");
    expect(rows.length).toBe(8);
    for (const row of rows) {
      const spec = (fmSpec.examDates as Record<string, Record<string, unknown>>)[bySeries[row.series]][row.unit] as { date: string; session: string };
      expect(row.date, `${row.unit} ${row.series}`).toBe(spec.date);
      expect((row as { session?: string }).session, `${row.unit} ${row.series}`).toBe(spec.session === "Morning" ? "am" : "pm");
    }
  });

  it("the exam map agrees with mathematics.json on every Maths date it carries", () => {
    const bySeries: Record<string, string> = { "2026-Summer": "Summer 2026", "2026-November": "November 2026", "2027-Summer": "Summer 2027" };
    for (const row of examMap.papers.filter((p) => p.subject === "maths")) {
      const spec = (mathsSpec.examDates as Record<string, { gateway: { date: string }; completion: { date: string } }>)[bySeries[row.series]];
      const which = row.unit.startsWith("M1") ? spec.gateway : spec.completion;
      expect(row.date, `${row.unit} ${row.series}`).toBe(which.date);
    }
  });
});

describe("the catalogue a plan can draw on", () => {
  it("is every subject and unit the exam map sets a sitting for, named from the data", () => {
    const cat = catalogue();
    expect(cat.map((s) => s.id)).toEqual(["maths", "further-maths", "science"]);
    expect(cat.find((s) => s.id === "maths")!.units.map((u) => u.unit)).toEqual(["M1", "M2", "M3", "M4", "M5", "M6", "M7", "M8"]);
    expect(cat.find((s) => s.id === "further-maths")!.units.map((u) => u.unit)).toEqual(["FM1", "FM2", "FM3", "FM4"]);
    expect(cat.find((s) => s.id === "science")!.units.map((u) => u.unit)).toEqual(["B1", "C1", "P1", "B2", "C2", "P2", "U7"]);
    expect(cat.find((s) => s.id === "science")!.tieredByEntry).toBe(true);
    expect(cat.find((s) => s.id === "maths")!.units.find((u) => u.unit === "M4")).toMatchObject({ tier: "H", name: "M4 · Higher" });
    expect(cat.find((s) => s.id === "further-maths")!.rules[0]).toMatch(/Unit 1 Pure compulsory/);
  });

  it("offers only the series in which CCEA sets that unit's sitting", () => {
    expect(seriesFor("further-maths", "FM1").map((s) => s.key)).toEqual(["2026-Summer", "2027-Summer"]);
    expect(seriesFor("maths", "M4").map((s) => s.key)).toEqual(["2026-Summer", "2026-November", "2027-Summer"]);
    expect(seriesFor("science", "B1").map((s) => s.key)).toEqual(["2026-Summer", "2026-November", "2027-March", "2027-Summer"]);
    expect(seriesFor("science", "B2").map((s) => s.key)).toEqual(["2026-Summer", "2027-Summer"]);
    expect(seriesFor("science", "U7")).toEqual([
      { key: "2026-Summer", label: "Summer 2026", date: "2026-06-08" },
      { key: "2027-Summer", label: "Summer 2027", date: "2027-06-02" },
    ]);
  });

  it("an entry in a series with no sitting produces no paper, which is why Settings never offers one", () => {
    const plan: ExamPlan = { ...DEFAULT_PLAN, entries: [{ subject: "further-maths", unit: "FM1", series: "2026-November", tier: null }] };
    expect(planPapers(plan, TODAY)).toEqual([]);
  });

  it("an entry in a subject the typed layers do not know still has its paper, from the data alone", () => {
    const plan: ExamPlan = { ...DEFAULT_PLAN, entries: [...DEFAULT_PLAN.entries, { subject: "english-language", unit: "EL1", series: "2027-Summer", tier: null }] };
    // No sitting in the exam map yet: no paper, nothing thrown, and the typed list is untouched.
    expect(planPapers(plan, TODAY).some((p) => p.subject === "english-language")).toBe(false);
    expect(upcomingPapers(plan, TODAY)).toEqual(upcomingPapers(DEFAULT_PLAN, TODAY));
  });
});

describe("an entry, said as a timetable says it", () => {
  const list = planPapers(DEFAULT_PLAN, TODAY);

  it("gives a date, a start and a length", () => {
    expect(formatLength(120)).toBe("2 h");
    expect(formatLength(75)).toBe("1 h 15 min");
    expect(formatLength(30)).toBe("30 min");
    expect(entryWhen(list.find((p) => p.unit === "FM1")!)).toMatch(/18 May 2027, 09:15 · 2 h$/);
  });

  it("names both papers of a completion unit", () => {
    const m8 = list.find((p) => p.unit === "M8")!;
    expect(m8.parts).toEqual([
      { paper: 1, start: "09:15", durationMinutes: 75 },
      { paper: 2, start: "10:45", durationMinutes: 75 },
    ]);
    expect(entryWhen(m8)).toMatch(/27 May 2027 · Paper 1 at 09:15, Paper 2 at 10:45, 1 h 15 min each$/);
  });

  it("gives Unit 7 its three Booklet Bs, each straight after a Unit 2 paper, and its practical window", () => {
    for (const unit of ["B2", "C2", "P2"]) expect(list.find((x) => x.unit === unit)!.then).toMatchObject({ start: "10:45", durationMinutes: 30 });
    const u7 = list.find((p) => p.unit === "U7")!;
    expect(u7).toMatchObject({ date: "2027-06-02", start: "10:45", durationMinutes: 30, tier: "H" });
    expect(u7.booklets!.map((b) => [b.date, b.after])).toEqual([
      ["2027-06-02", "B2"],
      ["2027-06-10", "C2"],
      ["2027-06-14", "P2"],
    ]);
    expect(entryWhen(u7)).toMatch(/^After B2, C2 and P2, from .*2 Jun 2027 · 10:45, 30 min each$/);
    expect(practicalWindow("science", "U7", "2027-Summer")).toMatchObject({ from: "2026-12-01", to: "2027-05-01" });
  });

  it("says a past entry was sat rather than counting towards it", () => {
    const plan: ExamPlan = { ...DEFAULT_PLAN, entries: DEFAULT_PLAN.entries.map((e) => (e.unit === "B1" ? { ...e, series: "2026-Summer" } : e)) };
    const b1 = planPapers(plan, TODAY).find((p) => p.unit === "B1")!;
    expect(b1.daysAway).toBeLessThan(0);
    expect(entryWhen(b1)).toMatch(/^Sat on .*12 May 2026$/);
  });
});

describe("the topic hero's place on the calendar", () => {
  it("names the unit's own paper as a date, and nothing for a unit outside the plan or already sat", async () => {
    const { paperPhrase } = await import("./exam-plan");
    expect(paperPhrase(DEFAULT_PLAN, "further-maths", "FM1", TODAY)).toBe("for your paper on 18 May");
    expect(paperPhrase(DEFAULT_PLAN, "maths", "M3", TODAY)).toBeNull();
    expect(paperPhrase(DEFAULT_PLAN, "further-maths", "FM1", "2027-06-01")).toBeNull();
  });
});
