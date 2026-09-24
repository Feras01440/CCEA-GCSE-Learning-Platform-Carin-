/**
 * The stones, rendered to markup as a page renders them. The pill stack the owner ruled out on the craft floor (23 Sep)
 * is gone: the cairn is CairnArt's, the count is data, a stone placed tonight settles in, and the old sizes hold.
 */
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { CairnMark, PLACED_STONE, STONES } from "@/components/companion/CairnArt";
import { MARK_STONES, Stones } from "@/components/items/MasteryChip";
import { Wordmark } from "@/components/shell/Nav";
import { CairnStack } from "./CairnStack";

const stack = (props: Parameters<typeof CairnStack>[0]) => renderToStaticMarkup(createElement(CairnStack, props));
const stonesDrawn = (html: string) => STONES.filter((s) => html.includes(`d="${s.d}"`)).length;

describe("CairnStack: the craft-floor cairn, the count as data", () => {
  it("never draws the old pill stack", () => {
    for (const count of [0, 1, 3, 4, 12, 60]) {
      const html = stack({ count, fresh: count > 0 ? 1 : 0, size: "sm" });
      expect(html, `${count} stones`).not.toContain("<rect");
      expect(html).not.toContain("data-cairn-stack");
    }
    // The rail's and first run's monogram too.
    expect(renderToStaticMarkup(createElement(Wordmark, { size: 26 }))).not.toContain("<rect");
  });

  it("keeps how many as data and as the name a screen reader hears", () => {
    expect(stack({ count: 7 })).toContain('data-stones="7"');
    expect(stack({ count: 7 })).toContain('aria-label="7 stones"');
    expect(stack({ count: 1 })).toContain('aria-label="1 stone"');
    expect(stack({ count: 0 })).toContain('aria-label="No stones yet"');
    expect(stack({ count: 2, label: "1 stone placed" })).toContain('aria-label="1 stone placed"');
    expect(stack({ count: 2, label: "1 stone placed" })).toContain("<figcaption");
  });

  it("grows base first with the first four stones and then holds", () => {
    expect(stonesDrawn(stack({ count: 0 }))).toBe(0);
    expect(stonesDrawn(stack({ count: 1 }))).toBe(1);
    expect(stonesDrawn(stack({ count: 3 }))).toBe(3);
    expect(stonesDrawn(stack({ count: 4 }))).toBe(4);
    expect(stonesDrawn(stack({ count: 40 }))).toBe(4);
  });

  it("settles a stone placed tonight: the top stone within four, the heather stone past four", () => {
    const within = stack({ count: 3, fresh: 1 });
    expect(within).toContain("motion-place");
    expect(within).not.toContain(PLACED_STONE);
    const past = stack({ count: 12, fresh: 1 });
    expect(past).toContain("motion-place");
    expect(past).toContain(PLACED_STONE);
    // Nothing moves on a visit with nothing new.
    expect(stack({ count: 12 })).not.toContain("motion-place");
    expect(stack({ count: 12 })).not.toContain(PLACED_STONE);
  });

  it("keeps the old widths", () => {
    expect(stack({ count: 2, size: "sm" })).toContain('width="72"');
    expect(stack({ count: 2, size: "md" })).toContain('width="120"');
    expect(stack({ count: 2, size: "lg" })).toContain('width="180"');
  });
});

describe("the mastery chip's stones: the cairn's mark, filled to the level", () => {
  const glyph = (level: Parameters<typeof Stones>[0]["level"]) => renderToStaticMarkup(createElement(Stones, { level }));
  const mark = renderToStaticMarkup(createElement(CairnMark, { size: 24 }));

  it("is drawn from the mark's own three stones, so the two can never drift apart", () => {
    for (const s of MARK_STONES) expect(mark).toContain(`d="${s.d}"`);
  });

  it("fills one stone per level and draws no pill", () => {
    const filled = (html: string) => (html.match(/fill="currentColor" opacity="(1|0\.84|0\.68)"/g) ?? []).length;
    expect(filled(glyph("not-started"))).toBe(0);
    expect(filled(glyph("familiar"))).toBe(1);
    expect(filled(glyph("proficient"))).toBe(2);
    expect(filled(glyph("mastered"))).toBe(3);
    // Attempted: the base's place, dashed.
    expect(glyph("attempted")).toContain("stroke-dasharray");
    for (const level of ["not-started", "attempted", "familiar", "proficient", "mastered"] as const) expect(glyph(level)).not.toContain("<rect");
  });
});
