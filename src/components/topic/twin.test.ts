import { describe, expect, it } from "vitest";
import type { WorkedExample } from "@/lib/content/schema";
import { twinFor } from "./twin";

const we = (id: string, specRefs: string[]): WorkedExample => ({ id, specRefs }) as unknown as WorkedExample;

describe("twinFor: the worked example whose twin fits the missed question (engine item 10.5)", () => {
  // Every miss used to open the topic's first worked example's twin, whatever the question practised.
  const examples = [we("we.a.01", ["FM1-LOG-01"]), we("we.a.02", ["FM1-LOG-02"]), we("we.a.03", ["FM1-LOG-02", "FM1-LOG-03"])];
  it("takes the worked example that shares the most specification points with the question", () => {
    expect(twinFor(examples, { specRefs: ["FM1-LOG-02", "FM1-LOG-03"] })?.id).toBe("we.a.03");
    expect(twinFor(examples, { specRefs: ["FM1-LOG-02"] })?.id).toBe("we.a.02");
  });
  it("keeps the authored order on a tie, so the core method comes first", () => {
    expect(twinFor(examples, { specRefs: ["FM1-LOG-01", "FM1-LOG-02"] })?.id).toBe("we.a.01");
  });
  it("falls back to the first worked example when nothing is shared, or there is no question", () => {
    expect(twinFor(examples, { specRefs: ["FM1-MAT-01"] })?.id).toBe("we.a.01");
    expect(twinFor(examples, null)?.id).toBe("we.a.01");
  });
  it("has no twin to offer in a topic without worked examples", () => {
    expect(twinFor([], { specRefs: ["FM1-LOG-01"] })).toBeUndefined();
  });
});
