/**
 * Read's note with lesson structure v3 (src/components/items/StepRevealNote.tsx), server-rendered: a See it stops the
 * page until it has been shown to its end, then its Your turn; a gate answered on an earlier visit is drawn as it was
 * answered, a miss as a miss (audit READ-7); every option has a name a screen reader can say (READ-1); a number field
 * has the minus key. What needs a click (Next step, Check, the re-teach, the retry before the recap) is e2e/see-it.spec.ts.
 */
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { StepRevealNote, type NoteBlock } from "@/components/items/StepRevealNote";
import type { WorkedExample } from "@/lib/content/schema";
import { SEE_FIXTURE_BLOCKS, SEE_FIXTURE_WORKED_EXAMPLE } from "@/lib/slides/see-fixture";

const blocks = SEE_FIXTURE_BLOCKS.filter((b) => b.type !== "hero") as unknown as NoteBlock[];
const workedExamples = [SEE_FIXTURE_WORKED_EXAMPLE as unknown as WorkedExample];
const paced = (open: number) => ({ open, onContinue: () => undefined, titles: [] as string[] });
const render = (props: Partial<Parameters<typeof StepRevealNote>[0]>) =>
  renderToStaticMarkup(createElement(StepRevealNote, { blocks, onGate: () => undefined, workedExamples, sections: [1, 2, 3, 4, 5, 6].map((n) => ({ n, minutes: 1 })), ...props }));
const count = (markup: string, re: RegExp) => (markup.match(re) ?? []).length;

describe("Read v2: a section is explain, See it, Your turn", () => {
  it("opens on the See it's first step and holds its Your turn back until every step has been shown", () => {
    const markup = render({ paced: paced(1) });
    expect(markup).toContain('data-see-it="');
    expect(count(markup, /\sdata-step="\d"/g)).toBe(1);
    expect(count(markup, /\sdata-ghost="\d"/g)).toBe(2);
    expect(markup).toContain("Next step");
    expect(markup).not.toContain('data-gate="g1"');
    expect(markup).not.toContain("data-section-end");
  });

  it("shows a See it complete, and its Your turn, when that Your turn was answered on an earlier visit", () => {
    const markup = render({ paced: paced(1), initialOutcomes: { g1: { correct: true, answer: "$\\dfrac{x}{2}$" } } });
    expect(count(markup, /\sdata-step="\d"/g)).toBe(3);
    expect(markup).not.toContain("Next step");
    expect(markup).toContain('data-gate="g1"');
    expect(markup).toContain(">Your turn<");
    expect(markup).toContain(">Yes.<");
    expect(markup).toContain("Answered on an earlier visit.");
  });

  it("draws a Your turn missed on an earlier visit as missed: her option edged, the right one lit, Not quite (audit READ-7)", () => {
    const markup = render({ paced: paced(1), initialOutcomes: { g1: { correct: false, answer: "$\\dfrac{5x}{10}$" } } });
    expect(markup).toContain('data-option="miss"');
    expect(markup).toContain('data-option="ok"');
    expect(markup).toContain('aria-label="5x over 10 (your answer)"');
    expect(markup).toContain('aria-label="x over 2 (the right answer)"');
    expect(markup).toContain(">Not quite.<");
    expect(markup).toContain("Missed on an earlier visit.");
    expect(markup).not.toContain(">Yes.<");
    // The line about her choice is the note on her option (V3.1), then the explanation, since nothing re-taught it here.
    expect(markup).toContain("Dividing out the bracket is right, but a ");
    expect(markup.indexOf("Dividing out the bracket is right")).toBeLessThan(markup.indexOf("Divide out what both lines share, as step 3"));
    // Restored, so no re-teach to ask through again, and no retry before the recap on this visit.
    expect(markup).not.toContain("Show me the answer");
    expect(markup).not.toContain("data-gate-retry");
  });

  it("never draws a Your turn known only to have been answered as passed", () => {
    const markup = render({ paced: paced(1), initiallyAnswered: ["g1"] });
    expect(markup).toContain('data-gate="g1"');
    expect(markup).not.toContain('data-option="ok"');
    expect(markup).not.toContain(">Yes.<");
    expect(markup).toContain("Answered on an earlier visit.");
  });

  it("names every option by what it says, and the group by its question (audit READ-1)", () => {
    const markup = render({ paced: paced(1), initialOutcomes: { g1: { correct: true, answer: "$\\dfrac{x}{2}$" } } });
    expect(markup).toContain('role="radiogroup" aria-label="What does 5x(x + 2) over 10(x + 2) simplify to?"');
    expect(markup).toContain('aria-label="x over 2 (your answer, and right)"');
    expect(markup).toContain('aria-label="5x over 10"');
    expect(markup).not.toMatch(/role="radio"[^>]*aria-label=""/);
  });

  it("gives a number Your turn the minus key and the fraction bar", () => {
    const answered = { g1: { correct: true, answer: "$\\dfrac{x}{2}$" }, g2: { correct: true, answer: "$\\dfrac{x-2}{x+3}$" } };
    // Section 3 without its See it (a static render cannot press Next step), so its Your turn g3, a number, is open.
    const markup = render({ paced: paced(3), initialOutcomes: answered, blocks: blocks.filter((b) => !(b.type === "see" && "stem" in b && b.stem.startsWith("Find the value"))) });
    expect(markup).toContain('data-gate="g3"');
    expect(markup).toContain('inputMode="decimal"');
    expect(markup).toContain('aria-label="minus"');
  });
});

describe("the classic note (every topic not yet on Read v2) draws a See it too", () => {
  it("stops at an unfinished See it, and names options by what they say", () => {
    const markup = render({});
    expect(markup).toContain('data-see-it="');
    expect(markup).toContain("Next step");
    expect(markup).not.toContain('data-gate="g1"');
    expect(markup).not.toContain("End of the lesson.");
    const done = render({ initialOutcomes: { g1: { correct: false, answer: "$\\dfrac{5x}{10}$" } } });
    expect(done).toContain('data-gate="g1"');
    expect(done).toContain("Not quite.");
    expect(done).toContain('aria-label="5x over 10 (your answer)"');
  });
});
