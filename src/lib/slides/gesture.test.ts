import { describe, expect, it } from "vitest";
import { SWIPE_PX, swipeDirection } from "./gesture";

const move = (over: Partial<Parameters<typeof swipeDirection>[0]> = {}) => swipeDirection({ pointerType: "touch", dx: -120, dy: 10, selection: "", ...over });

describe("a swipe turns the card; a drag that selects text never does (audit CQ-05)", () => {
  it("turns on a deliberate sideways finger or pen: left is next, right is back", () => {
    expect(move()).toBe("next");
    expect(move({ dx: 120 })).toBe("back");
    expect(move({ pointerType: "pen" })).toBe("next");
  });

  it("never turns on a mouse drag, which is how a desk selects a sentence", () => {
    expect(move({ pointerType: "mouse" })).toBeNull();
    expect(move({ pointerType: "mouse", dx: 250 })).toBeNull();
  });

  it("never turns while text is selected", () => {
    expect(move({ selection: "the cancel is this" })).toBeNull();
    expect(move({ selection: "   " })).toBe("next");
  });

  it("ignores a short or mostly vertical movement (reading scrolls)", () => {
    expect(move({ dx: -(SWIPE_PX - 1) })).toBeNull();
    expect(move({ dx: -100, dy: 60 })).toBeNull();
    expect(move({ dx: -100, dy: 50 })).toBe("next");
  });
});
