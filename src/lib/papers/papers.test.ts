import { describe, expect, test } from "vitest";
import {
  defaultTemplate,
  engineUnit,
  getEntry,
  hasPublishedMarkScheme,
  isRunnable,
  listSessions,
  paperDurationMinutes,
  paperMarks,
  papersFor,
  pairWithMarkScheme,
  partKeyOf,
  partsNeeded,
  questionTemplate,
  runnablePaperIds,
  runnerPaper,
  sittablePapers,
  standardPapers,
  unitLabel,
  type IndexEntry,
} from "./index";
import { bracketFor, composeSavedUnits, computePaperResult, gapCaption } from "./result";
import type { Mock } from "@/lib/db/db";

const meta = (over: Partial<IndexEntry>): IndexEntry => ({
  id: "x",
  subject: "maths",
  qualificationId: "504",
  series: "Summer",
  year: 2025,
  sessionKey: "2025-Summer",
  type: "Standard",
  kind: "paper",
  tier: "H",
  unit: "M4",
  unitName: "Unit M4",
  paperNumber: null,
  calculator: true,
  discipline: null,
  booklet: null,
  variant: null,
  title: "",
  url: "https://ccea.org.uk/x.pdf",
  changed: "",
  pairId: "",
  counterpartIds: [],
  duplicateOf: null,
  notes: [],
  ...over,
});

describe("labels, durations, marks", () => {
  test("unit labels follow the agreed forms", () => {
    expect(unitLabel(meta({ unit: "M4" }))).toBe("M4 Higher (calculator)");
    expect(unitLabel(meta({ unit: "M1", tier: "F" }))).toBe("M1 Foundation (calculator)");
    expect(unitLabel(meta({ unit: "M8", paperNumber: 1, calculator: false }))).toBe("M8 Paper 1 (non-calculator)");
    expect(unitLabel(meta({ unit: "M8", paperNumber: 2, calculator: true }))).toBe("M8 Paper 2 (calculator)");
    expect(unitLabel(meta({ subject: "further-maths", unit: "FM1", tier: null }))).toBe("FM1 Pure Mathematics");
    expect(unitLabel(meta({ subject: "science", unit: "B1", tier: "H", calculator: null }))).toBe("B1 Higher");
    expect(unitLabel(meta({ subject: "science", unit: "U7", tier: "H", booklet: "B", discipline: "Physics", calculator: null }))).toBe(
      "Unit 7 Booklet B Physics Higher",
    );
  });

  test("durations and marks match the specifications", () => {
    expect(paperDurationMinutes(meta({ unit: "M1" }))).toBe(105);
    expect(paperDurationMinutes(meta({ unit: "M4" }))).toBe(120);
    expect(paperDurationMinutes(meta({ unit: "M6", paperNumber: 1 }))).toBe(60);
    expect(paperDurationMinutes(meta({ unit: "M8", paperNumber: 2 }))).toBe(75);
    expect(paperMarks(meta({ unit: "M4" }))).toBe(100);
    expect(paperMarks(meta({ unit: "M8", paperNumber: 1 }))).toBe(50);
    expect(paperDurationMinutes(meta({ subject: "further-maths", unit: "FM1" }))).toBe(120);
    expect(paperMarks(meta({ subject: "further-maths", unit: "FM3" }))).toBe(50);
    expect(paperMarks(meta({ subject: "science", unit: "B1", tier: "F" }))).toBe(60);
    expect(paperMarks(meta({ subject: "science", unit: "C1", tier: "H" }))).toBe(70);
    expect(paperMarks(meta({ subject: "science", unit: "P2", tier: "H" }))).toBe(80);
    expect(paperDurationMinutes(meta({ subject: "science", unit: "P2" }))).toBe(75);
    expect(paperDurationMinutes(meta({ subject: "science", unit: "U7", booklet: "B" }))).toBe(30);
    expect(paperMarks(meta({ subject: "science", unit: "U7", booklet: "B" }))).toBe(35);
  });

  test("engine unit mapping and unit parts", () => {
    expect(engineUnit(meta({ unit: "M8" }))).toBe("M8");
    expect(engineUnit(meta({ subject: "further-maths", unit: "FM3", tier: null }))).toBe("U3");
    expect(engineUnit(meta({ subject: "science", unit: "B1", tier: "F" }))).toBe("B1F");
    expect(engineUnit(meta({ subject: "science", unit: "U7", tier: "H", booklet: "B" }))).toBe("U7BH");
    expect(partsNeeded(meta({ unit: "M8" }))).toEqual(["P1", "P2"]);
    expect(partKeyOf(meta({ unit: "M8", paperNumber: 2 }))).toBe("P2");
    expect(partsNeeded(meta({ subject: "science", unit: "U7" }))).toEqual(["Biology", "Chemistry", "Physics"]);
    expect(partKeyOf(meta({ subject: "science", unit: "U7", discipline: "Chemistry" }))).toBe("Chemistry");
    expect(partsNeeded(meta({ unit: "M4" }))).toEqual(["main"]);
  });

  test("default templates use the typical question counts", () => {
    expect(defaultTemplate(meta({ unit: "M4" })).rows).toHaveLength(22);
    expect(defaultTemplate(meta({ unit: "M8", paperNumber: 1 })).rows).toHaveLength(14);
    expect(defaultTemplate(meta({ subject: "further-maths", unit: "FM1" })).rows).toHaveLength(12);
    expect(defaultTemplate(meta({ subject: "science", unit: "U7", booklet: "B" })).formulaSheetPage).toBeNull();
    expect(defaultTemplate(meta({ unit: "M1" })).formulaSheetPage).toBe(2);
  });
});

describe("index", () => {
  test("standard papers exclude duplicate uploads; sittable papers exclude Booklet A", () => {
    expect(standardPapers().every((p) => p.type === "Standard" && p.kind === "paper" && !p.duplicateOf)).toBe(true);
    expect(sittablePapers().some((p) => p.unit === "U7" && p.booklet === "A")).toBe(false);
    expect(sittablePapers().length).toBeGreaterThan(400);
  });

  test("Summer 2025 M4 has a mark scheme and is runnable; Summer 2026 M8 Paper 1 has none but is runnable", () => {
    const m4 = getEntry("66598")!;
    expect(m4.unit).toBe("M4");
    expect(hasPublishedMarkScheme(m4)).toBe(true);
    expect(pairWithMarkScheme(m4)?.kind).toBe("ms");
    expect(isRunnable(m4)).toBe(true);
    const s26 = getEntry("69328")!;
    expect(s26.sessionKey).toBe("2026-Summer");
    expect(hasPublishedMarkScheme(s26)).toBe(false);
    expect(isRunnable(s26)).toBe(true);
  });

  test("a duplicate upload is never runnable and its canonical copy is", () => {
    const dup = getEntry("34900")!;
    expect(dup.duplicateOf).toBe("35772");
    expect(isRunnable(dup)).toBe(false);
    expect(isRunnable(getEntry("35772")!)).toBe(true);
    expect(runnablePaperIds()).not.toContain("34900");
  });

  test("a paper whose counterpart scheme is a duplicate resolves to the canonical scheme", () => {
    for (const p of sittablePapers()) {
      const ms = pairWithMarkScheme(p);
      if (ms) expect(ms.duplicateOf, p.id).toBeNull();
    }
  });

  test("sessions are newest first and papersFor filters by unit", () => {
    const keys = listSessions("maths").map((s) => s.sessionKey);
    expect(keys[0]).toBe("2026-Summer");
    expect(keys[1]).toBe("2025-November");
    const m4s = papersFor("maths", "M4");
    expect(m4s.every((p) => p.unit === "M4")).toBe(true);
    expect(m4s[0].sessionKey).toBe("2026-Summer");
  });

  test("page-map template for Summer 2025 M4: 22 rows adding to 100, pages for deep links", () => {
    const t = questionTemplate(getEntry("66598")!);
    expect(t.source).toBe("page-map");
    expect(t.rows).toHaveLength(22);
    expect(t.rows.reduce((s, r) => s + (r.available ?? 0), 0)).toBe(100);
    expect(t.verified).toBe(true);
    expect(t.rows[0].page).toBe(3);
    expect(t.formulaSheetPage).toBe(2);
  });

  test("the mis-parsed Booklet B (one 15-mark question) falls back to the default template", () => {
    const t = questionTemplate(getEntry("46842")!);
    expect(t.source).toBe("default");
    expect(t.rows).toHaveLength(4);
  });

  test("runner paper carries the sibling of a completion test", () => {
    const p1 = runnerPaper("69328")!; // Summer 2026 M8 Paper 1
    expect(p1.sibling?.paperNumber).toBe(2);
    expect(p1.sibling?.label).toBe("M8 Paper 2 (calculator)");
    const p2 = runnerPaper(p1.sibling!.id)!;
    expect(p2.sibling?.id).toBe("69328");
    expect(runnerPaper("34900")).toBeUndefined();
  });
});

describe("result model", () => {
  const m4 = runnerPaper("66598")!; // Summer 2025 M4

  test("A* bracket on M4 is 174–180 UMS in 2025 (394 − 220), raw 91", () => {
    const b = bracketFor(m4, "summer-2025")!;
    expect(b).toMatchObject({ grade: "A*", fromUms: 174, toUms: 180, fromRaw: 91, kind: "floor" });
    expect(bracketFor(m4, "summer-2026")).toMatchObject({ fromUms: 173, fromRaw: 89 });
  });

  test("M3 bracket is the pathway's best grade, B", () => {
    const m3 = runnerPaper(papersFor("maths", "M3").find((p) => p.sessionKey === "2025-Summer")!.id)!;
    expect(bracketFor(m3, "summer-2025")).toMatchObject({ grade: "B", fromUms: 292 - 175 });
  });

  test("M4 raw 78 → 166 UMS, unit grade a, 13 raw short of the A* band, M8 needs", () => {
    const r = computePaperResult(m4, 78, "summer-2025", {});
    expect(r.unit.ums).toBe(166);
    expect(r.unit.grade).toBe("a");
    expect(r.gapRaw).toBe(13);
    expect(r.assumed).toBe(false);
    expect(r.whatIf?.unit).toBe("M8");
    expect(r.whatIf?.lines.map((l) => l.grade)).toEqual(["A*", "A", "B"]);
    expect(r.whatIf?.lines[0].rawNeeded).toBeNull(); // 166 + 220 = 386 < 394
    expect(r.subject).toBeNull();
    expect(gapCaption(r)).toBe("13 raw marks short of the A* band on M4.");
  });

  test("a saved M8 (both papers) completes the combination and yields a subject grade", () => {
    const base: Omit<Mock, "id" | "paperNumber" | "raw" | "paperId"> = {
      at: new Date("2026-09-01"),
      subject: "maths",
      unit: "M8",
      engineUnit: "M8",
      sessionKey: "2025-Summer",
      tier: "H",
      discipline: null,
      booklet: null,
      minutesUsed: 75,
      paused: 0,
      pausedMinutes: 0,
      marks: [],
      rawMax: 50,
      ums: 0,
      grade: "a",
      series: "summer-2025",
      estimated: false,
    };
    const mocks: Mock[] = [
      { ...base, paperId: "p1", paperNumber: 1, raw: 40 },
      { ...base, paperId: "p2", paperNumber: 2, raw: 45, at: new Date("2026-09-02") },
      { ...base, paperId: "p2old", paperNumber: 2, raw: 10, at: new Date("2026-08-01") }, // superseded
    ];
    const saved = composeSavedUnits(mocks);
    expect(saved.M8.P2.raw).toBe(45);
    const r = computePaperResult(m4, 95, "summer-2025", saved);
    expect(r.subject?.result.totalUms).toBe(177 + 209); // M4 95 → 176.7 → 177; M8 85 → 176 + 45/60×44 = 209
    expect(r.subject?.result.grade).toBe("A");
    expect(r.subject?.gap.target).toBe("A*");
  });

  test("a completion paper on its own assumes the other paper and says so", () => {
    const p1 = runnerPaper("69328")!; // Summer 2026 M8 Paper 1
    const r = computePaperResult(p1, 40, "summer-2026", {});
    expect(r.assumed).toBe(true);
    expect(r.parts.map((p) => p.source)).toEqual(["this-run", "assumed"]);
    expect(r.unit.raw).toBe(80);
    expect(r.notes.some((n) => n.includes("assumed"))).toBe(true);
  });

  test("Further Maths U1 bracket and science estimate", () => {
    const fm1 = runnerPaper(papersFor("further-maths", "FM1").find((p) => p.sessionKey === "2025-Summer")!.id)!;
    expect(bracketFor(fm1, "summer-2025")).toMatchObject({ grade: "A*", fromUms: 84, fromRaw: 74 });
    const r = computePaperResult(fm1, 68, "summer-2025", {});
    expect(r.unit.ums).toBe(80);
    expect(r.unit.grade).toBe("a");
    const c1 = runnerPaper(papersFor("science", "C1").find((p) => p.sessionKey === "2025-Summer" && p.tier === "H")!.id)!;
    const s = computePaperResult(c1, 63, "summer-2025", {});
    expect(s.estimated).toBe(true);
    expect(s.unit.ums).toBe(59); // 63/70 × 66 = 59.4
    expect(s.bracket).toMatchObject({ grade: "A*A*", kind: "pro-rata", fromUms: 60 }); // 544/600 × 66 = 59.8 → 60
  });
});
