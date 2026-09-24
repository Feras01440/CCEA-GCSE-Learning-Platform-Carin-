import "fake-indexeddb/auto";
import { describe, expect, it } from "vitest";
import type { ShippedBundle } from "@/lib/content/load";
import type { GateBlock } from "@/components/items/gates";
import histogramsJson from "@/lib/content/fixtures/histograms.example.json";
import { findInBundle } from "./resolve";

const gate: GateBlock = {
  type: "gate",
  id: "g3",
  kind: "blank",
  prompt: "Frequency density is frequency ÷ __",
  answer: "class width | width",
  explain: "The height of the bar is frequency per unit of the axis, so the divisor is the class width.",
};

// The published bundle carries the lesson's note blocks; the fixture is the same shape without them.
const bundle = { ...(histogramsJson as unknown as ShippedBundle), noteBlocks: [{ type: "h", text: "Reading a histogram" }, gate] };

describe("findInBundle", () => {
  it("resolves a retrieval prompt and a diagnostic item", () => {
    expect(findInBundle(bundle, "rp.maths.m4.histograms.02")).toMatchObject({ kind: "prompt", prompt: { id: "rp.maths.m4.histograms.02" } });
    expect(findInBundle(bundle, "02")).toMatchObject({ kind: "diagnostic", item: { id: "02" } });
  });

  it("resolves one part of a question, which is what the card stands for", () => {
    const found = findInBundle(bundle, "q.maths.m4.histograms.0001#b");
    expect(found?.kind).toBe("question");
    if (found?.kind !== "question") throw new Error("expected a question");
    expect(found.question.id).toBe("q.maths.m4.histograms.0001");
    expect(found.question.style).toBe("exam-style");
    expect(found.part.id).toBe("b");
    expect(found.part.marks).toBe(2);
  });

  it("resolves a find-the-mistake item", () => {
    expect(findInBundle(bundle, "ftm.maths.m4.histograms.01")).toMatchObject({ kind: "mistake", item: { id: "ftm.maths.m4.histograms.01" } });
  });

  it("resolves a note gate from the bundle's own note blocks", () => {
    expect(findInBundle(bundle, "maths.m4.histograms#gate:g3")).toEqual({ kind: "gate", gate, context: [] });
    expect(findInBundle(bundle, "maths.m4.histograms#gate:g99")).toBeNull();
  });

  it("resolves the one card a worked example's twin and faded steps share to a fresh twin", () => {
    const found = findInBundle(bundle, "we.maths.m4.histograms.01#twin");
    expect(found?.kind).toBe("twin");
    if (found?.kind !== "twin") throw new Error("expected a twin");
    expect(found.we.id).toBe("we.maths.m4.histograms.01");
    expect(found.we.twin.stem.length).toBeGreaterThan(0);
  });

  it("is null for an item the bundle no longer ships, so the inbox skips the card", () => {
    expect(findInBundle(bundle, "q.maths.m4.histograms.0001#z")).toBeNull();
    expect(findInBundle(bundle, "q.maths.m4.withdrawn.0009#a")).toBeNull();
    expect(findInBundle(bundle, "we.maths.m4.gone.02#twin")).toBeNull();
    expect(findInBundle(bundle, "rp.maths.m4.gone.09")).toBeNull();
  });
});
