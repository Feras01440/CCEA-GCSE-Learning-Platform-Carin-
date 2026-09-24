import { describe, expect, it } from "vitest";
import { lessonWayFor, storedWay } from "./lesson-way";

describe("which way in carries the accent (decision 17; art direction v2 §8.2; audit CQ-01)", () => {
  it("Slides, wherever the topic has them and she has chosen nothing, on a first visit and every visit after", () => {
    expect(lessonWayFor({ stored: null, ready: true })).toBe("slides");
  });

  it("stays Slides on a device that holds her answers on the topic: evidence is not a choice", () => {
    // The audit's case: one practice answer or one Read gate on this device, no way-in button ever pressed, so nothing
    // is stored. The decision takes no evidence at all; only a stored choice can move the accent.
    const nothingStored = storedWay(null);
    expect(lessonWayFor({ stored: nothingStored, ready: true })).toBe("slides");
  });

  it("follows her own choice: Read when she chose Read, Slides when she chose Slides", () => {
    expect(lessonWayFor({ stored: "read", ready: true })).toBe("read");
    expect(lessonWayFor({ stored: "slides", ready: true })).toBe("slides");
  });

  it("is Read on a topic without Slides, whatever is stored, so nothing promises a screen that does not exist", () => {
    for (const stored of [null, "read", "slides"] as const) expect(lessonWayFor({ stored, ready: false })).toBe("read");
  });
});

describe("what counts as a stored choice", () => {
  it("only the two ways; anything else in storage is no choice", () => {
    expect(storedWay("slides")).toBe("slides");
    expect(storedWay("read")).toBe("read");
    for (const raw of [null, "", "Slides", "READ", "true", "undefined", " read"]) expect(storedWay(raw), JSON.stringify(raw)).toBeNull();
  });
});
