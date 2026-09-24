import { describe, expect, it } from "vitest";
import { reviewHeadline } from "./review-copy";

describe("the review close card's headline", () => {
  it("says in words when nothing was answered, and counts otherwise", () => {
    expect(reviewHeadline(0, 1)).toBe("Nothing answered tonight");
    expect(reviewHeadline(1, 3)).toBe("1 item · 3 min");
    expect(reviewHeadline(12, 9)).toBe("12 items · 9 min");
    expect(reviewHeadline(2, 0)).toBe("2 items · 1 min");
  });
});
