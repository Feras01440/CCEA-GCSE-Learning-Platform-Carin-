import { describe, expect, it } from "vitest";
import { EXPLAIN_MAX, REASON_WORDS, SEE_STEPS, markCodes, optionByPosition, seeBlockProblems, seeItFindings, warmUp } from "../../../scripts/qa/see-it.mjs";

/**
 * Lesson structure v3 (the teach-first case, docs/plan/review/2026-09-24-teach-first-case.md §8.4, approved by the owner
 * on 27 Sep 2026; the block shapes in docs/plan/review/2026-09-27-see-it-block-shape.md): every teaching section is
 * explain → See it → Your turn. scripts/qa/see-it.mjs is the lint; scripts/qa/lesson-v2.mjs reports it as warnings.
 * The hard shape rules the renderer needs (two to six steps, numbered, a reference the bundle ships, the twin's fields)
 * are refused by the build (src/components/items/content-lint.ts); these are the rules a note can break and still draw.
 */

type Block = Record<string, unknown>;
const hero: Block = { type: "hero", lede: "A lede.", can: ["Do a", "Do b", "Do c"], minutes: 8 };
const h = (text: string, role?: string): Block => (role ? { type: "h", text, role } : { type: "h", text });
const p = (md: string): Block => ({ type: "p", md });
const words = (n: number) => Array.from({ length: n }, (_, i) => `w${i}`).join(" ");
const gate = (id: string, extra: Block = {}): Block => ({ type: "gate", id, kind: "choice", prompt: "Which line comes next?", options: ["A one", "B two"], answer: "A one", explain: "Because.", ...extra });
const step = (n: number, extra: Block = {}): Block => ({ n, working: `$x = ${n}$`, decision: `Reason ${n}.`, ...extra });
const see = (k = 3, extra: Block = {}): Block => ({ type: "see", stem: "Simplify it.", steps: Array.from({ length: k }, (_, i) => step(i + 1)), ...extra });
const video: Block = { type: "video", videoId: "abc", title: "Worked", channel: "C", why: "Watch the method." };
const recap = [h("You can now", "recap"), p("Cancel.\nFactorise.\nCheck.")];
const pointer = [h("In the exam", "pointer"), p("One paragraph."), { type: "prompt", promptId: "rp.x.001" }];
const note = (...body: Block[]) => [hero, ...body, ...recap, ...pointer];
const FM = markCodes({ codes: [{ code: "M" }, { code: "W" }, { code: "MW" }] });
const kinds = (r: { findings: Array<{ kind: string }> }) => r.findings.map((f) => f.kind);

describe("see-it: the limits the case and the owner set", () => {
  it("states them", () => {
    expect(SEE_STEPS).toEqual({ min: 2, max: 6 });
    expect(REASON_WORDS).toBe(40);
    expect(EXPLAIN_MAX).toBe(225);
  });

  it("reads the mark codes from the subject's mark language, never the banded QWC", () => {
    expect(markCodes({ codes: [{ code: "P" }, { code: "QWC" }] })).toEqual(["P"]);
    expect(FM).toEqual(["MW", "M", "W"]);
  });
});

describe("see-it: a See it block's own problems (the ones the build lets through)", () => {
  it("passes a clean block", () => {
    expect(seeBlockProblems(see(3, { finalAnswer: "$x = 3$" }), { codes: FM })).toEqual([]);
    expect(seeBlockProblems(see(2, { steps: [step(1, { earns: ["MW1"] }), step(2, { earns: ["W1", "M2"] })] }), { codes: FM })).toEqual([]);
  });

  it("warns on a reason over 40 words, an unbalanced $, a code outside the mark language, and a why menu", () => {
    const long = step(1, { decision: words(41) });
    const unbalanced = step(2, { working: "$x = 2" });
    const code = step(3, { earns: ["A1"] });
    const menu = step(4, { whyMenu: { options: ["a", "b"], correct: 0 } });
    expect(seeBlockProblems(see(4, { steps: [long, unbalanced, code, menu] }), { codes: FM })).toEqual([
      "step 1's reason is 41 words (at most 40)",
      "step 2's working has an unclosed $",
      'step 3 earns "A1", not a mark in this subject\'s language (MW, M, W)',
      "step 4 carries a whyMenu, which a See it does not use (the Your turn is the check)",
    ]);
  });

  it("counts a maths segment in a reason as one word", () => {
    const d = `${words(39)} $\\dfrac{x - 3}{x + 2} = 1$`;
    expect(seeBlockProblems(see(2, { steps: [step(1, { decision: d }), step(2)] }), { codes: FM })).toEqual([]);
  });

  it("warns when a See it names a worked example the path also serves as a faded run", () => {
    const bundle = { workedExamples: [{ id: "we.a", steps: [step(1), step(2)], faded: [{ hide: [2] }, { hide: [1, 2] }] }, { id: "we.b", steps: [step(1), step(2)] }] };
    expect(seeBlockProblems({ type: "see", workedExample: "we.a" }, { codes: FM, bundle })).toEqual([
      "names we.a, which the path also serves as a faded run: work the See it inline on new numbers (a note must not work what a later item asks)",
    ]);
    expect(seeBlockProblems({ type: "see", workedExample: "we.b" }, { codes: FM, bundle })).toEqual([]);
  });
});

describe("see-it: the section structure (explain → See it → Your turn)", () => {
  it("passes a v3 note: every section explains, shows its See it and ends in its Your turn", () => {
    const r = seeItFindings(note(h("1. The idea", "idea"), p("The idea."), see(), gate("g1"), h("2. Factorise first", "variant"), p("The case."), see(4), video, gate("g2")), { codes: FM });
    expect(r.findings).toEqual([]);
    expect(r).toMatchObject({ gates: 2, gatesAfterSee: 2, seeBlocks: 2, seeSteps: 7, gatedSections: 2, gatedSectionsWithSee: 2, firstCheck: true });
  });

  it("warns on a gate with no See it before it in its section, and a first check that follows none", () => {
    const r = seeItFindings(note(h("1. The idea", "idea"), p("The idea."), gate("g1"), h("2. Next", "variant"), see(), gate("g2")), { codes: FM });
    expect(r.findings.map((f: { kind: string; gate?: string }) => [f.kind, f.gate])).toEqual([
      ["see-missing", "g1"],
      ["first-check", "g1"],
    ]);
    expect(r.gatesAfterSee).toBe(1);
    expect(r.firstCheck).toBe(false);
  });

  it("a check spends its See it: a later gate after more teaching needs its own, two in a row share one", () => {
    const twoInARow = seeItFindings(note(h("1. Two variants", "variant"), p("Both."), see(), see(), gate("g1"), gate("g2")), { codes: FM });
    expect(twoInARow.findings).toEqual([]);
    const spent = seeItFindings(note(h("1. Idea", "idea"), p("Idea."), see(), gate("g1"), p("More teaching."), gate("g2")), { codes: FM });
    expect(spent.findings.map((f: { kind: string; gate?: string }) => [f.kind, f.gate])).toEqual([
      ["see-missing", "g2"],
      ["turn-last", "g1"],
    ]);
  });

  it("a 'See it done' heading continues the section above", () => {
    const r = seeItFindings(note(h("2. Factorise first", "variant"), p("The case."), h("See it done", "see"), see(), gate("g1")), { codes: FM });
    expect(r.findings).toEqual([]);
  });

  it("warns on an explanation over 225 words before the See it, and counts none after it", () => {
    const long = seeItFindings(note(h("1. Idea", "idea"), p(words(120)), p(words(106)), see(), gate("g1")), { codes: FM });
    expect(long.findings.map((f: { kind: string; detail: string }) => [f.kind, f.detail])).toEqual([["explain-long", '226 words of explanation in "1. Idea" before its See it (at most 225: split the section)']]);
    const after = seeItFindings(note(h("1. Idea", "idea"), p(words(200)), see(), p(words(60)), gate("g1")), { codes: FM });
    expect(after.findings).toEqual([]);
    // a section with no See it: the explanation before its gate is measured
    const legacy = seeItFindings(note(h("1. Idea", "idea"), p(words(230)), gate("g1")), { codes: FM });
    expect(kinds(legacy)).toEqual(["see-missing", "first-check", "explain-long"]);
  });

  it("warns on a section that runs on after its Your turn, and on three turns in one section", () => {
    const runOn = seeItFindings(note(h("1. Idea", "idea"), p("Idea."), see(), gate("g1"), p("An afterthought.")), { codes: FM });
    expect(runOn.findings.map((f: { kind: string; gate?: string }) => [f.kind, f.gate])).toEqual([["turn-last", "g1"]]);
    const three = seeItFindings(note(h("1. Idea", "idea"), p("Idea."), see(), gate("g1"), gate("g2"), gate("g3")), { codes: FM });
    expect(kinds(three)).toEqual(["turns"]);
  });

  it("warns on a video that is a section's only See it, or stands before our own steps", () => {
    const only = seeItFindings(note(h("1. Idea", "idea"), p("Idea."), video, gate("g1")), { codes: FM });
    expect(kinds(only)).toEqual(["see-missing", "first-check", "video"]);
    expect(only.findings[2].detail).toBe('a video is the only See it in "1. Idea": our own worked steps come first, the video beside them');
    const before = seeItFindings(note(h("1. Idea", "idea"), p("Idea."), video, see(), gate("g1")), { codes: FM });
    expect(before.findings.map((f: { kind: string; detail: string }) => [f.kind, f.detail])).toEqual([["video", 'a video stands before the See it in "1. Idea": our own worked steps come first, the video beside them']]);
  });

  it("warns on a first check that is an interface warm-up", () => {
    expect(warmUp("One tap to start. What is x² − 9 as a product of two brackets?")).toBe(true);
    expect(warmUp("Warm-up: tap any option")).toBe(true);
    expect(warmUp("What is x² − 9 as a product of two brackets?")).toBe(false);
    const r = seeItFindings(note(h("1. Idea", "idea"), p("Idea."), see(), gate("g1", { prompt: "One tap to start. Which is the factorised form?" })), { codes: FM });
    expect(r.findings.map((f: { kind: string; detail: string }) => [f.kind, f.detail])).toEqual([["first-check", "the topic's first check, gate g1, is an interface warm-up; ask a real question answerable from the first See it"]]);
  });

  it("carries a See it block's own problems, and the depth measures for H bands", () => {
    const r = seeItFindings(note(h("1. Idea", "idea"), p("Idea."), see(2, { steps: [step(1, { earns: ["A1"] }), step(2)] }), gate("g1"), h("2. A variant", "variant"), p("Case."), gate("g2")), { codes: FM });
    expect(r.findings.map((f: { kind: string; detail: string }) => [f.kind, f.detail])).toEqual([
      ["block", 'See it in "1. Idea": step 1 earns "A1", not a mark in this subject\'s language (MW, M, W)'],
      ["see-missing", 'gate g2 in "2. A variant" has no See it before it in its section (explain → See it → Your turn)'],
    ]);
    expect(r).toMatchObject({ variantSections: 1, variantsWithSee: 0 });
  });

  it("measures the body only: the recap and the pointer hold no sections", () => {
    const r = seeItFindings(note(h("1. Idea", "idea"), p("Idea."), see(), gate("g1")), { codes: FM });
    expect(r.sections.map((s: { heading: string }) => s.heading)).toEqual(["(opening)", "1. Idea"]);
  });

  it("counts a referenced worked example's steps in the See it steps", () => {
    const bundle = { workedExamples: [{ id: "we.b", steps: [step(1), step(2), step(3), step(4)] }] };
    const r = seeItFindings(note(h("1. Idea", "idea"), p("Idea."), see(2), gate("g1"), h("2. Next", "variant"), p("Case."), { type: "see", workedExample: "we.b" }, gate("g2")), { codes: FM, bundle });
    expect(r.seeSteps).toBe(6);
  });
});

describe("see-it: a gate's explanation never names an option by its position (the options are shuffled)", () => {
  it("finds the positional names the corpus uses", () => {
    for (const s of [
      "The second option changed the sign of the first term only.",
      "The middle option prices the soup at £52.10.",
      "Only the first answer has both.",
      "and the last answer makes the magnet stronger.",
      "Option B forgets the minus sign.",
      "The option above is the tangent.",
      "The third option runs the change backwards.",
    ])
      expect(optionByPosition(s), s).not.toBeNull();
  });

  it("leaves the same words alone where they name no option", () => {
    for (const s of [
      "The fraction you divide by turns over; turning the first one over instead gives the reciprocal.",
      "so find the denominator rule and write one above the other.",
      "The four advantages each answer a problem with animal insulin.",
      "Each way of making the first choice opens a whole fresh set of second choices.",
      "the single step that separates the top answers from the rest.",
      "Dividing by 90 instead would answer a different question.",
      "the bottom limit is the left one and the top limit is the right one.",
      "Stopping at x² keeps the method marks and loses the last one.",
    ])
      expect(optionByPosition(s), s).toBeNull();
  });

  it("checks choice gates and their twins, never a typed gate", () => {
    const named = gate("g1", { explain: "Factorise first. The second option stops one line short." });
    const twin = gate("g2", { twin: { prompt: "Again?", options: ["C", "D"], answer: "C", explain: "The first option is the tangent." } });
    const typed = { type: "gate", id: "g3", kind: "number", prompt: "How many?", answer: "2", explain: "The second answer, x = −3, is rejected." };
    const r = seeItFindings(note(h("1. Idea", "idea"), p("Idea."), see(), named, h("2. Next", "variant"), p("Case."), see(), twin, h("3. Last", "variant"), p("Case."), see(), typed), { codes: FM });
    expect(r.findings.map((f: { kind: string; detail: string }) => [f.kind, f.detail])).toEqual([
      ["option-position", 'gate g1\'s explanation names an option by its position ("second option"); the options are shuffled, so name its content or point at the step'],
      ["option-position", 'gate g2\'s twin explanation names an option by its position ("first option"); the options are shuffled, so name its content or point at the step'],
    ]);
  });
});
