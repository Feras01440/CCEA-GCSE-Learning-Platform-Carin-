import { describe, expect, it } from "vitest";
import { DEFAULT_PLAN, nextPaper, planUnits, type ExamPlan } from "./exam-plan";
import { chooseNextStep, shortReason } from "./next-step";

const TODAY = "2026-09-23";

const withSeries = (plan: ExamPlan, units: string[], series: string): ExamPlan => ({
  ...plan,
  entries: plan.entries.map((e) => (units.includes(e.unit) ? { ...e, series } : e)),
});

describe("the units of her plan", () => {
  it("are the entries of her plan and nothing else: this year's first, by subject, then by date", () => {
    const units = planUnits(DEFAULT_PLAN, TODAY);
    expect(units.map((u) => u.unit)).toEqual(["M4", "M8", "FM1", "FM2", "FM3", "B1", "C1", "P1", "B2", "C2", "P2", "U7"]);
    expect(units.every((u) => u.group === "this-year")).toBe(true);
    expect(units.some((u) => ["M3", "M7", "M1", "M2", "M5", "M6", "FM4"].includes(u.unit))).toBe(false);
    expect(units.find((u) => u.unit === "FM1")!.name).toBe("FM1 · Pure Mathematics");
    expect(units.find((u) => u.unit === "U7")!.date).toBe("2027-06-02"); // the first Booklet B, straight after B2
  });

  it("show M3 the moment she adds it, because it is in her plan, not because of a list", () => {
    const plan: ExamPlan = { ...DEFAULT_PLAN, entries: [...DEFAULT_PLAN.entries, { subject: "maths", unit: "M3", series: "2027-Summer", tier: null }] };
    expect(planUnits(plan, TODAY).map((u) => u.unit)).toContain("M3");
  });

  it("follow the plan's Further Maths units", () => {
    const plan: ExamPlan = {
      ...DEFAULT_PLAN,
      entries: DEFAULT_PLAN.entries.filter((e) => e.unit !== "FM2").concat({ subject: "further-maths", unit: "FM4", series: "2027-Summer", tier: null }),
    };
    expect(planUnits(plan, TODAY).filter((u) => u.subject === "further-maths").map((u) => u.unit)).toEqual(["FM1", "FM3", "FM4"]);
  });

  it("with B1, C1 and P1 sat in Summer 2026, those three follow as sat and the next paper is this year's", () => {
    const plan = withSeries(DEFAULT_PLAN, ["B1", "C1", "P1"], "2026-Summer");
    const units = planUnits(plan, TODAY);
    expect(units.slice(-3).map((u) => [u.unit, u.group])).toEqual([
      ["B1", "sat"],
      ["C1", "sat"],
      ["P1", "sat"],
    ]);
    expect(nextPaper(plan, TODAY)).toMatchObject({ unit: "M4", date: "2027-05-14" });
    expect(["B1", "C1", "P1"]).not.toContain(chooseNextStep(plan, [], TODAY)!.unit);
  });

  it("keep an entry whose series has no sitting, last, rather than losing it", () => {
    const plan = withSeries(DEFAULT_PLAN, ["FM2"], "2026-November");
    const last = planUnits(plan, TODAY).at(-1)!;
    expect(last).toMatchObject({ unit: "FM2", group: "unscheduled", paper: null });
  });
});

describe("Today's next step", () => {
  it("comes from a unit of her plan, never from M3 or M7", () => {
    const step = chooseNextStep(DEFAULT_PLAN, [], TODAY);
    expect(step).not.toBeNull();
    expect(planUnits(DEFAULT_PLAN, TODAY).map((u) => u.unit)).toContain(step!.unit);
    expect(["M3", "M7"]).not.toContain(step!.unit);
    expect(step!.href).toBe(`/learn/${step!.subject}/${step!.unit}/${step!.topic.slug}/`);
  });

  it("is a topic with a lesson here when one is left, and an unbuilt one only when none is", () => {
    const onlyFm1 = (subject: string, slug: string) => subject === "further-maths" && slug === "algebraic-fractions-simplify";
    const step = chooseNextStep(DEFAULT_PLAN, [], TODAY, onlyFm1);
    expect(step).toMatchObject({ subject: "further-maths", unit: "FM1" });
    expect(step!.topic.slug).toBe("algebraic-fractions-simplify");
    expect(chooseNextStep(DEFAULT_PLAN, [], TODAY, () => false)).not.toBeNull();
  });

  it("is null once every paper in the plan has been sat", () => {
    expect(chooseNextStep(DEFAULT_PLAN, [], "2027-07-01")).toBeNull();
  });
});

describe("the short reason on Today", () => {
  it("keeps the first clause and never ends on a semicolon", () => {
    expect(shortReason("Two marks dropped for the unit; the method was full marks")).toBe("Two marks dropped for the unit.");
    expect(shortReason("The next paper is M8 on 11 May. Everything else counts back from it.")).toBe("The next paper is M8 on 11 May.");
    expect(shortReason("One clause with no stop")).toBe("One clause with no stop");
  });
});
