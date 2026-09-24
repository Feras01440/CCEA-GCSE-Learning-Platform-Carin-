import { describe, expect, it } from "vitest";
import { SUBJECTS, topicsFor, unitsFor, type TopicInfo } from "./taxonomy";

const topicsOf = (subject: TopicInfo["subject"]): TopicInfo[] => unitsFor(subject).flatMap((u) => topicsFor(subject, u.code));

describe("tiers, as each specification states them (audit CT-06)", () => {
  it("GCSE Further Mathematics sets no tier: every topic and every statement is untiered", () => {
    // The FM specification (data/spec/further-mathematics.json) gives no tier to any topic or statement: every
    // candidate sits the same papers. The catalogue used to write "H" for all of them, and the topic page then printed
    // "Higher tier only" on all 73 Further Maths topics.
    const fm = topicsOf("further-maths");
    expect(fm.length).toBeGreaterThan(0);
    for (const t of fm) {
      expect(t.tier, t.slug).toBe("untiered");
      for (const s of t.statements) expect(s.tier, `${t.slug} ${s.id}`).toBe("untiered");
    }
  });

  it("the tiered qualifications keep the tiers their specifications give", () => {
    const tiered = SUBJECTS.filter((s) => s.id !== "further-maths").flatMap((s) => topicsOf(s.id));
    expect(tiered.length).toBeGreaterThan(0);
    for (const t of tiered) {
      expect(["F", "H", "mixed"], `${t.subject} ${t.slug}`).toContain(t.tier);
      for (const s of t.statements) expect(["F", "H", "mixed"], `${t.slug} ${s.id}`).toContain(s.tier);
    }
    // A Higher unit's topics are Higher (M4 and M8 are the Higher route).
    expect(topicsFor("maths", "M4").every((t) => t.tier === "H")).toBe(true);
  });
});
