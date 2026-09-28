/**
 * The card bodies of lesson structure v3, rendered (server markup, no browser): the See it's steps and ghosts, the step
 * she types, the Your turn's options with names a screen reader can say, the re-teach before the answer, the answer
 * with a line about her choice, the twin on a retry, and the number field's minus key.
 */
import { Fragment, createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import type { GateBlock } from "@/components/items/gates";
import type { RetrievalPrompt, WorkedExample } from "@/lib/content/schema";
import { buildDeck, withRetries, type Card, type GateCard, type SeeCard } from "@/lib/slides/cards";
import { answerNote, gateNote } from "@/lib/slides/run";
import { twinGate, twinOptions } from "@/lib/slides/see";
import { SEE_FIXTURE_BLOCKS, SEE_FIXTURE_PROMPTS, SEE_FIXTURE_WORKED_EXAMPLE } from "@/lib/slides/see-fixture";
import { gateParts, reteachParts, seeParts, type CardParts, type GateAnswer } from "./cards";

const deck = buildDeck(SEE_FIXTURE_BLOCKS, SEE_FIXTURE_PROMPTS as RetrievalPrompt[], null, { workedExamples: [SEE_FIXTURE_WORKED_EXAMPLE as unknown as WorkedExample] }).cards;
const find = <T extends Card>(key: string) => deck.find((c) => c.key === key) as T;
const html = (parts: CardParts) => renderToStaticMarkup(createElement(Fragment, null, parts.eyebrow, parts.title, parts.left, parts.right));
const count = (markup: string, re: RegExp) => (markup.match(re) ?? []).length;
const noop = () => undefined;

describe("the See it card", () => {
  const first = find<SeeCard>("see:only-a-factor-divides-out:1");

  it("shows one step more per Continue, the rest as numbered ghosts, the newest numbered in the accent", () => {
    for (const revealed of [1, 2, 3]) {
      const markup = html(seeParts(first, { revealed, typedResult: null, onTyped: noop, animateLast: false, onSkip: null }));
      expect(count(markup, /\sdata-step="\d"/g), `steps at ${revealed}`).toBe(revealed);
      expect(count(markup, /\sdata-ghost="\d"/g), `ghosts at ${revealed}`).toBe(3 - revealed);
      expect(count(markup, /\sdata-current="true"/g)).toBe(1);
      expect(markup).toContain(`data-step="${revealed}" data-current="true"`);
    }
    const all = html(seeParts(first, { revealed: 3, typedResult: null, onTyped: noop, animateLast: false, onSkip: null }));
    // Each step's reason is under its line, and the mark it earns beside it.
    expect(all).toContain("Divide out what both lines share");
    expect(all).toContain('aria-label="Earns W1"');
    // The last step already ends in the answer, so no answer line repeats it.
    expect(all).not.toContain("data-see-answer");
    expect(all).toContain("See it");
  });

  it("offers Skip to your turn only when the frame passes it (a return visit)", () => {
    expect(html(seeParts(first, { revealed: 1, typedResult: null, onTyped: noop, animateLast: false, onSkip: null }))).not.toContain("data-skip-see");
    expect(html(seeParts(first, { revealed: 1, typedResult: null, onTyped: noop, animateLast: false, onSkip: noop }))).toContain("Skip to your turn");
  });

  it("asks for the step she types with a field and a way to see it, and afterwards shows the line with what she wrote", () => {
    const typed = find<SeeCard>("see:simplify-before-you-substitute:1");
    const asking = html(seeParts(typed, { revealed: 3, typedResult: null, onTyped: noop, animateLast: false, onSkip: null }));
    expect(asking).toContain('data-typed-step="3"');
    expect(asking).toContain("Show me the step");
    expect(asking).toMatch(/<input[^>]*>/);
    const right = html(seeParts(typed, { revealed: 3, typedResult: { raw: "10", correct: true }, onTyped: noop, animateLast: false, onSkip: null }));
    expect(right).toContain('data-typed-result="right"');
    expect(right).toContain("You wrote 10");
    expect(right).not.toContain("data-typed-step");
    const shown = html(seeParts(typed, { revealed: 3, typedResult: { shown: true }, onTyped: noop, animateLast: false, onSkip: null }));
    expect(shown).toContain('data-typed-result="shown"');
  });
});

describe("the Your turn card", () => {
  const g1 = find<GateCard>("gate:g1");
  const options = ["$\\dfrac{5x}{10}$", "$\\dfrac{x}{2}$", "$\\dfrac{x+2}{2}$"];
  const state = (answer: GateAnswer | null, phase: "open" | "answer") => ({
    asked: g1.gate,
    selected: null,
    answer,
    phase,
    onSelect: noop,
    reactionId: null,
    options,
    note: gateNote(g1),
    meta: answer ? answerNote(g1, answer.correct, answer.record) : "",
  });

  it("names the group by its question and every option by what it says, maths spoken (audit SLIDES-4, READ-1)", () => {
    const markup = html(gateParts(g1, state(null, "open")));
    expect(markup).toContain('role="radiogroup" aria-label="What does 5x(x + 2) over 10(x + 2) simplify to?"');
    expect(markup).toContain('aria-label="5x over 10"');
    expect(markup).toContain('aria-label="x over 2"');
    expect(markup).toContain('aria-label="(x + 2) over 2"');
    expect(count(markup, /aria-checked="true"/g)).toBe(0);
    expect(markup).toContain("Your turn");
    expect(markup).toContain("Answer from what you just saw. If you miss, it is taught again first.");
  });

  it("after a right answer: hers is checked and named right, and the verdict says Yes", () => {
    const markup = html(gateParts(g1, state({ answer: "$\\dfrac{x}{2}$", correct: true, record: "recorded" }, "answer")));
    expect(markup).toContain('aria-checked="true" aria-label="x over 2 (your answer, and right)"');
    expect(markup).toContain('data-verdict="ok"');
    expect(markup).toContain("Yes.");
    expect(markup).toContain("Recorded. It comes back in your reviews.");
  });

  it("after a miss, once re-taught: her option edged, the right one lit, the answer line, a line naming her choice, the record", () => {
    const markup = html(gateParts(g1, state({ answer: "$\\dfrac{5x}{10}$", correct: false, record: "recorded" }, "answer")));
    expect(markup).toContain('data-outcome="miss"');
    expect(markup).toContain('data-outcome="ok"');
    expect(markup).toContain('aria-label="5x over 10 (your answer)"');
    expect(markup).toContain('aria-label="x over 2 (the right answer)"');
    expect(markup).toContain("data-answer-line");
    expect(markup).toContain('data-hers="$\\dfrac{5x}{10}$"');
    // The line about her option is its note (V3.1), not the explanation's general sentence.
    expect(markup).toContain("Dividing out the bracket is right, but a ");
    expect(markup).not.toContain("Stopping at");
    expect(markup).toContain("Recorded. It comes back before the recap on new numbers, and in your reviews.");
    expect(markup).not.toContain(">Wrong");
  });

  it("re-teaches a miss before any answer is shown: Not quite, her choice, her option's note, the explanation, the step it points at; nothing lit", () => {
    const see = find<SeeCard>("see:only-a-factor-divides-out:1");
    const markup = html(reteachParts(g1, g1.gate, { hers: "$\\dfrac{5x}{10}$", reactionId: null, see }));
    expect(markup).toContain("data-reteach");
    expect(markup).toContain("Not quite.");
    expect(markup).toContain('aria-label="You chose 5x over 10"');
    expect(markup).toContain("as step 3 of See it did");
    expect(markup).toContain('data-reteach-step="3"');
    expect(markup).toContain("Step 3 of See it");
    expect(markup).not.toContain("data-outcome");
    expect(markup).toContain("Once more, in other words");
    // The note on the option she chose comes before the general explanation (V3.1): the correction lands on her choice.
    const note = markup.indexOf("data-option-note");
    expect(note).toBeGreaterThan(markup.indexOf("data-her-choice"));
    expect(note).toBeLessThan(markup.indexOf("as step 3 of See it did"));
    expect(markup).toContain("fully means nothing shared is left");
    // Another option, another note; an option with no note (none here) shows none.
    expect(html(reteachParts(g1, g1.gate, { hers: "$\\dfrac{x+2}{2}$", reactionId: null, see }))).toContain("is on the top only, so it stays");
    const noNotes = { ...g1.gate, optionNotes: undefined };
    expect(html(reteachParts(g1, noNotes, { hers: "$\\dfrac{5x}{10}$", reactionId: null, see }))).not.toContain("data-option-note");
  });

  it("asks the twin on a retry, on its own options, with its answer off the place the first asking lit", () => {
    const retry = withRetries(deck, ["g1"]).find((c) => c.key === "retry:g1") as GateCard;
    const twin = twinGate(retry.gate) as GateBlock;
    const order = twinOptions(twin, options.indexOf(g1.gate.answer));
    const markup = html(gateParts(retry, { ...state(null, "open"), asked: twin, options: order, note: gateNote(retry) }));
    expect(markup).toContain('data-retry="twin"');
    expect(markup).toContain('data-asked="g1~twin"');
    expect(markup).toContain("Once more · on new numbers");
    expect(markup).toContain('aria-label="x over 3"');
    expect(markup).not.toContain("before the recap");
  });

  it("gives a number field the minus key and the fraction bar the phone's number pad lacks", () => {
    const g3 = find<GateCard>("gate:g3");
    const markup = html(gateParts(g3, { ...state(null, "open"), asked: g3.gate, options: [] }));
    expect(markup).toContain('inputMode="decimal"');
    expect(markup).toContain('aria-label="minus"');
    expect(markup).toContain('aria-label="fraction bar"');
  });
});
