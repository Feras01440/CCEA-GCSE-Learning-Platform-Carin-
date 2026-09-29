import { describe, expect, it } from "vitest";
import { EXPLAIN_MAX, REASON_WORDS, SEE_STEPS, markCodes, seeBlockProblems, seeItFindings, warmUp } from "../../../scripts/qa/see-it.mjs";
import { positionalWording } from "@/lib/gate-order";

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

describe("see-it: the case's own v3 deck (§8.5, fm1/algebraic-fractions-simplify) and the rules read again", () => {
  const figure: Block = { type: "figure", alt: "The bracket struck", svg: "<svg/>", caption: "Only a factor divides out." };
  const examiner: Block = { type: "callout", kind: "examiner", title: "Summer 2024", md: "Fully means fully." };
  const why: Block = { type: "callout", kind: "why", title: "Why", md: "A factor divides; a term does not." };
  const notonspec: Block = { type: "callout", kind: "notonspec", title: "Beyond FM1", md: "No paper sets the cubic." };
  const deck = (section4: Block[]) =>
    note(
      h("1. Only a factor divides out", "idea"), p("The hook."), p("The idea."), figure, see(4), gate("g2"),
      h("2. Factorise first", "variant"), p("Move 1."), see(3), gate("g1"),
      h("3. A coefficient in front", "variant"), p("The root of 4x²."), notonspec, see(2), see(2), gate("g3"), gate("g7"),
      h("4. See it done at writing speed", "see"), ...section4,
      h("5. Fully means fully", "twists"), p("The idea."), examiner, why, see(2), gate("g5"), gate("g6"),
    );

  it("passes the deck with the owner's answer 4 applied (our own See it in section 4, the video beside it)", () => {
    const r = seeItFindings(deck([see(3), video, figure, gate("g4")]), { codes: FM });
    expect(r.findings).toEqual([]);
    expect(r).toMatchObject({ gates: 7, gatesAfterSee: 7, seeBlocks: 6, firstCheck: true });
  });

  it("finds only the missing See it in section 4 as the case first drew it (the video and the figure alone)", () => {
    const r = seeItFindings(deck([video, figure, gate("g4")]), { codes: FM });
    expect(r.findings.map((f: { kind: string; gate?: string }) => [f.kind, f.gate])).toEqual([["see-missing", "g4"]]);
  });

  it("a sim, like a video, stands beside a See it and never instead of it", () => {
    const sim: Block = { type: "sim", provider: "phet", url: "https://phet.colorado.edu/x", title: "Forces", attribution: "PhET", licence: "CC-BY" };
    const only = seeItFindings(note(h("1. Idea", "idea"), p("Idea."), sim, gate("g1")), { codes: FM });
    expect(only.findings.filter((f: { kind: string }) => f.kind === "video").map((f: { detail: string }) => f.detail)).toEqual([
      'a sim is the only See it in "1. Idea": our own worked steps come first, the sim beside them',
    ]);
    expect(seeItFindings(note(h("1. Idea", "idea"), p("Idea."), see(), sim, gate("g1")), { codes: FM }).findings).toEqual([]);
  });

  it("warns on more than three explanation blocks before a teaching section's See it, never on a section that teaches nothing to check", () => {
    const four = seeItFindings(note(h("1. Idea", "idea"), p("a"), p("b"), why, p("d"), see(), gate("g1")), { codes: FM });
    expect(four.findings.map((f: { kind: string; detail: string }) => [f.kind, f.detail])).toEqual([["explain-blocks", '4 explanation blocks in "1. Idea" before its See it (at most 3: split the section)']]);
    const bare = seeItFindings(note(h("1. Idea", "idea"), p("Idea."), see(), gate("g1"), h("2. Background", "why"), p("a"), p("b"), p("c"), p("d")), { codes: FM });
    expect(kinds(bare)).toEqual([]);
    // an "Exam twists" section is one short paragraph per twist, four or more for H5 (the depth standard)
    const twists = seeItFindings(note(h("1. Idea", "idea"), p("Idea."), see(), gate("g1"), h("9. Exam twists", "twists"), p("t1"), p("t2"), p("t3"), p("t4"), see(), gate("g2")), { codes: FM });
    expect(kinds(twists)).toEqual([]);
  });

  it("warns on a re-teaching explanation over 60 words, a formula counting as one word", () => {
    const long = gate("g1", { explain: words(61) });
    expect(seeItFindings(note(h("1. Idea", "idea"), p("Idea."), see(), long), { codes: FM }).findings.map((f: { kind: string; detail: string }) => [f.kind, f.detail])).toEqual([
      ["reteach", "gate g1's explanation is 61 words (a miss re-teaches in at most 60)"],
    ]);
    const formula = gate("g1", { explain: `${words(59)} $x^2 + 5x + 6 = (x + 2)(x + 3)$ − ` });
    expect(seeItFindings(note(h("1. Idea", "idea"), p("Idea."), see(), formula), { codes: FM }).findings).toEqual([]);
  });

  it("warns on a twin that repeats its gate's prompt or answer", () => {
    const twin = gate("g1", { twin: { prompt: "Which line comes next?", options: ["A one", "C three"], answer: "A one", explain: "Again." } });
    expect(seeItFindings(note(h("1. Idea", "idea"), p("Idea."), see(), twin), { codes: FM }).findings.map((f: { kind: string; detail: string }) => [f.kind, f.detail])).toEqual([
      ["twin", "gate g1's twin repeats its prompt and answer (a twin is the same structure on new numbers, with its own answer)"],
    ]);
  });
});

/**
 * A gate's explanation never names an option by its place (the options are shuffled). The reader is the app's own,
 * src/lib/gate-order.ts positionalWording, passed in by the caller (lesson-v2.mjs loads it through tsx), so the lesson
 * lint, the build's GATE warning and the app's pinning agree on every gate (the lead, 27 Sep 2026: "do not copy the
 * regex"). Its wording rules are gate-order.test.ts's to test; here, that it is used and how its finding reads.
 */
describe("see-it: a gate's explanation never names an option by its place (the options are shuffled)", () => {
  it("reports the sentence gate-order's reader finds, for choice gates and their twins, never a typed gate", () => {
    const named = gate("g1", { explain: "Factorise first. The second option stops one line short." });
    const twin = gate("g2", { twin: { prompt: "Again?", options: ["C", "D"], answer: "C", explain: "The first option is the tangent." } });
    const typed = { type: "gate", id: "g3", kind: "number", prompt: "How many?", answer: "7", explain: "The second answer, x = −3, is rejected." };
    const blocks = note(h("1. Idea", "idea"), p("Idea."), see(), named, h("2. Next", "variant"), p("Case."), see(), twin, h("3. Last", "variant"), p("Case."), see(), typed);
    const r = seeItFindings(blocks, { codes: FM, positional: positionalWording });
    expect(r.findings.map((f: { kind: string; detail: string }) => [f.kind, f.detail])).toEqual([
      ["option-position", 'gate g1: its explanation names an option by its place ("The second option stops one line short."): the gate is then shown in its written order, so its answer stays where it was written; name the option by what it says'],
      ["option-position", 'gate g2: its twin\'s explanation names an option by its place ("The first option is the tangent."): that is true only in the order the twin was written; name the option by what it says'],
    ]);
  });

  it("reads nothing when no reader is given (a caller that cannot load gate-order)", () => {
    const r = seeItFindings(note(h("1. Idea", "idea"), p("Idea."), see(), gate("g1", { explain: "The second option stops short." })), { codes: FM });
    expect(r.findings).toEqual([]);
  });
});

/**
 * A Your turn whose answer is printed in its own section's See it can be answered by copying the card before it (the
 * lead, 27 Sep 2026: the ruling is that it re-asks on new numbers, as a twin does). Warning only. Compared after
 * normalising case, spaces, LaTeX delimiters and trailing punctuation; a number counts only as a whole result (a whole
 * line, a side of an equation or the final answer), so the 5 of "(x + 5)" is not the answer 5.
 */
describe("see-it: a Your turn answer printed in its section's See it", () => {
  const worked = (lines: string[], extra: Block = {}) => ({ type: "see", stem: "S", steps: lines.map((working, i) => ({ n: i + 1, working, decision: `R${i + 1}.` })), ...extra });

  it("flags an expression the See it prints, in any spacing or delimiters, and names the step", () => {
    const g = gate("g1", { options: ["$(x+3)(x-3)$", "$(x-3)^2$"], answer: "$(x+3)(x-3)$" });
    const r = seeItFindings(note(h("1. Idea", "idea"), p("Idea."), worked(["$x^2 - 9 = (x + 3)(x - 3)$", "$\\dfrac{x-3}{x+2}$"]), g), { codes: FM });
    expect(r.findings.map((f: { kind: string; detail: string }) => [f.kind, f.detail])).toEqual([
      ["answer-shown", 'gate g1\'s answer "$(x+3)(x-3)$" is printed in its section\'s See it (step 1): she can copy it rather than do it; ask it on new numbers, as a twin does'],
    ]);
  });

  it("flags a number only as a whole result: a line, a side of an equation or the final answer", () => {
    const five = { type: "gate", id: "g1", kind: "number", prompt: "x?", answer: "5", explain: "E." };
    const side = seeItFindings(note(h("1. Idea", "idea"), p("Idea."), worked(["$2x = 10$", "$x = 5$"]), five), { codes: FM });
    expect(side.findings.map((f: { kind: string }) => f.kind)).toEqual(["answer-shown"]);
    const final = seeItFindings(note(h("1. Idea", "idea"), p("Idea."), worked(["$2x = 10$", "divide by 2"], { finalAnswer: "5." }), five), { codes: FM });
    expect(final.findings.map((f: { kind: string; detail: string }) => f.detail)).toEqual(['gate g1\'s answer "5" is printed in its section\'s See it (the final answer): she can copy it rather than do it; ask it on new numbers, as a twin does']);
    const inside = seeItFindings(note(h("1. Idea", "idea"), p("Idea."), worked(["$x^2 + 5x + 6 = (x + 2)(x + 3)$", "$15 = 3 \\times 5$ is not it"]), five), { codes: FM });
    expect(inside.findings).toEqual([]);
    // a value with its unit is not found inside a longer number (the real case: 4 m/s against 8.4 m/s)
    const speed = { type: "gate", id: "g12", kind: "choice", prompt: "Average speed?", options: ["$4$ m/s", "$6.25$ m/s"], answer: "$4$ m/s", explain: "E." };
    const decimal = seeItFindings(note(h("1. Idea", "idea"), p("Idea."), worked(["Total: $420$ m in $50$ s", "Average speed $= \\dfrac{420}{50} = 8.4$ m/s"]), speed), { codes: FM });
    expect(decimal.findings).toEqual([]);
  });

  // the lead's item 19 (27 Sep 2026): a one-word blank answered by a word she has just read is recognition, not recall
  // (b2-defence-mechanisms-immunity g3: "… engulfs the clump and then ______ it", step 4 "The phagocyte digests the bacteria")
  it("flags a one-word blank whose word the See it prints, as a whole word only", () => {
    const blank = { type: "gate", id: "g3", kind: "blank", prompt: "A phagocyte engulfs the clump and then ______ it.", answer: "digests | digest | breaks down", explain: "E." };
    const steps = worked(["The antibodies clump the bacteria together.", "The phagocyte digests the bacteria inside it."]);
    const r = seeItFindings(note(h("1. Idea", "idea"), p("Idea."), steps, blank), { codes: FM });
    expect(r.findings.map((f: { kind: string; detail: string }) => [f.kind, f.detail])).toEqual([
      ["answer-shown", 'gate g3\'s answer "digests" is printed in its section\'s See it (step 2): she can copy it rather than do it; ask it on new numbers, as a twin does'],
    ]);
    // inside a longer word it is not the word: "digest" is not in "indigestion"
    const inside = worked(["Antacids ease indigestion.", "The pain eases."]);
    const none = seeItFindings(note(h("1. Idea", "idea"), p("Idea."), inside, { ...blank, answer: "digest" }), { codes: FM });
    expect(none.findings).toEqual([]);
  });

  it("reads each alternative of a blank gate, and the steps of a named worked example; a See it in another section does not count", () => {
    const blank = { type: "gate", id: "g2", kind: "blank", prompt: "The name?", answer: "difference of two squares | two squares", explain: "E." };
    const bundle = { workedExamples: [{ id: "we.b", stem: "S", steps: [{ n: 1, working: "It is a Difference of Two Squares.", decision: "R." }, { n: 2, working: "$(a+b)(a-b)$", decision: "R." }] }] };
    const r = seeItFindings(note(h("1. Idea", "idea"), p("Idea."), { type: "see", workedExample: "we.b" }, blank), { codes: FM, bundle });
    expect(r.findings.map((f: { kind: string; detail: string }) => f.detail)).toEqual(['gate g2\'s answer "difference of two squares" is printed in its section\'s See it (step 1): she can copy it rather than do it; ask it on new numbers, as a twin does']);
    const elsewhere = seeItFindings(note(h("1. Idea", "idea"), p("Idea."), worked(["$x = 5$", "$y = 2$"]), gate("g0"), h("2. Next", "variant"), p("Case."), worked(["$y = 7$", "$z = 1$"]), { type: "gate", id: "g1", kind: "number", prompt: "x?", answer: "5", explain: "E." }), { codes: FM });
    expect(elsewhere.findings.filter((f: { kind: string }) => f.kind === "answer-shown")).toEqual([]);
  });
});

/**
 * The line drawn on 29 Sep 2026 (the lead's item c) against the Slides candidates (src/lib/slides/cards.ts seeAnswerPrinted):
 * every case below is a real gate and its real See it, copied from packs/ as they stood that day, each read and judged
 * before the rule was written. Copyable: the See it prints the answer to the gate's own question. Fine: the answer's
 * digits or words stand in a given, a label, a step on the way, the stem's question, a rule naming both options, or a
 * See it whose own case has another answer.
 */
describe("see-it: answer-shown against the Slides candidates (real gates, 29 Sep 2026)", () => {
  type Step = { working: string; decision: string };
  const seeOf = (stem: string, steps: Step[], finalAnswer?: string): Block => ({ type: "see", stem, steps: steps.map((s, i) => ({ n: i + 1, ...s })), ...(finalAnswer ? { finalAnswer } : {}) });
  const shown = (g: Block, v: Block) =>
    seeItFindings(note(h("1. Idea", "idea"), p("Idea."), v, g), { codes: FM })
      .findings.filter((f: { kind: string }) => f.kind === "answer-shown")
      .map((f: { detail: string }) => f.detail);
  const choice = (id: string, prompt: string, options: string[], answer: string): Block => ({ type: "gate", id, kind: "choice", prompt, options, answer, explain: "E." });
  const typed = (id: string, kind: string, prompt: string, answer: string): Block => ({ type: "gate", id, kind, prompt, answer, explain: "E." });

  it("flags an answer a reason prints for the same question (the cosine rule, Line A, not oxygen)", () => {
    // m8/pythagoras-and-trigonometry-in-3d g20
    const acf = seeOf("$ABCDEFGH$ is a cuboid with $AB = 6$ cm, $BC = 4$ cm and $CG = 3$ cm. Calculate the angle $CAF$.", [
      { working: "$AC^2 = 6^2 + 4^2 = 52$, $AF^2 = 6^2 + 3^2 = 45$ and $CF^2 = 4^2 + 3^2 = 25$", decision: "Each side is the diagonal of a face, so each is one Pythagoras step on that face's two edges." },
      { working: "$\\cos \\angle CAF = \\dfrac{52 + 45 - 25}{2\\sqrt{52}\\sqrt{45}}$", decision: "Triangle $ACF$ has no right angle, so use the cosine rule. The squares go straight in." },
      { working: "$\\cos \\angle CAF = 0.7442\\ldots$, so $\\angle CAF = 41.908\\ldots° = 41.9°$", decision: "Keep the roots exact in the calculator and round only the angle." },
    ], "$41.9°$");
    const g20 = choice("g20", "Triangle $ACF$ is made of three face diagonals of a cuboid. Which finds $\\angle CAF$ from its three sides?", ["The cosine rule", "Tangent, with $CF$ over $AC$", "Pythagoras on the three sides"], "The cosine rule");
    expect(shown(g20, acf)).toEqual(['gate g20\'s answer "The cosine rule" is printed in its section\'s See it (step 2\'s reason): she can copy it rather than do it; ask it on new numbers, as a twin does']);
    // fm3/line-of-best-fit g3: the reason names line B too, but in its own clause
    const garden = seeOf("Draw the garden's line of best fit.", [
      { working: "Plot the mean point $(30, 6.4)$ and ring it", decision: "The line must pass through it, and the scheme checks that it does." },
      { working: "Lay the ruler through it along the trend of the crosses", decision: "Turn the ruler about the mean point until the line follows the crosses." },
      { working: "Check: four crosses above the line, four below", decision: "Roughly as many above as below. Line A passes this check; line B, forced through the origin, does not." },
    ]);
    expect(shown(choice("g3", "On the garden graph with lines A and B, both drawn through the mean point, which is the line of best fit?", ["Line A", "Line B", "Either, because both pass through the mean point"], "Line A"), garden)).toHaveLength(1);
    // b2/b2-blood-and-vessels g1: the See it's answer names urea, another option, but the gate asks for the one left out
    const plasma = seeOf("Name three substances, other than cells, that the plasma transports. [3]", [
      { working: "Carbon dioxide.", decision: "Carried from the respiring tissues to the lungs. Each substance named is one mark." },
      { working: "Amino acids.", decision: "A food molecule, absorbed from the small intestine after digestion." },
      { working: "Urea.", decision: "Carried from the liver to the kidneys. Not oxygen, which rides in the red cells: a wrong item beside a right one costs that line its mark." },
    ], "Carbon dioxide, amino acids and urea.");
    expect(shown(choice("g1", "Which of these is NOT transported by the plasma?", ["oxygen", "urea", "hormones"], "oxygen"), plasma)).toEqual([
      'gate g1\'s answer "oxygen" is printed in its section\'s See it (step 3\'s reason): she can copy it rather than do it; ask it on new numbers, as a twin does',
    ]);
  });

  it("flags a number stated as a result in words, and a number word as its number (six in all, is 0, zero)", () => {
    // fm1/expand-three-brackets g2
    const six = seeOf("Expand and simplify $(x + 2)(x - 6)(3x + 1)$.", [
      { working: "$(x + 2)(x - 6) = x^{2} - 4x - 12$", decision: "The two simpler brackets first." },
      { working: "$3x(x^{2} - 4x - 12) = 3x^{3} - 12x^{2} - 36x$", decision: "The 3x meets all three terms: three products." },
      { working: "$1(x^{2} - 4x - 12) = x^{2} - 4x - 12$", decision: "The +1 meets them too: three more, six in all." },
      { working: "$3x^{3} - 11x^{2} - 40x - 12$", decision: "Collect: −12x² + x² and −36x − 4x. Check the ends: 3x³ and −12." },
    ]);
    expect(shown(choice("g2", "Multiplying $x^{2} + 4x - 7$ by $2x - 3$, how many products do you write before collecting?", ["Six", "Five", "Three"], "Six"), six)).toEqual([
      'gate g2\'s answer "Six" is printed in its section\'s See it (step 3\'s reason): she can copy it rather than do it; ask it on new numbers, as a twin does',
    ]);
    // m8/gradient-of-a-curve-as-rate-of-change g21
    const flat = seeOf("A ball's height is $h = 20t - 5t^{2}$ metres after $t$ seconds. Where is its rate of change zero, and what does that mean?", [
      { working: "The curve rises to a highest point at $t = 2$, where $h = 20$", decision: "The top of the arc." },
      { working: "The tangent there is horizontal: its gradient is 0", decision: "A flat line has zero rise." },
      { working: "At $t = 2$ the ball is neither rising nor falling", decision: "Its height is not changing at that instant, so its vertical speed is 0 m/s." },
    ]);
    expect(shown(choice("g21", "A curve rises, levels off at $t = 6$, then falls. What is the gradient of the tangent at $t = 6$?", ["$0$", "The height of the curve at $t = 6$", "It is negative", "It cannot be found"], "$0$"), flat)).toEqual([
      'gate g21\'s answer "$0$" is printed in its section\'s See it (step 2): she can copy it rather than do it; ask it on new numbers, as a twin does',
    ]);
    // fm2/equilibrium-of-forces g1: "zero" is the 0 of "24 − 24 = 0"
    const cancel = seeOf("The picture shows a particle held still by 24 N to the right, 7 N downwards and 25 N up and to the left at 16.26° to the horizontal. Check that nothing is left over.", [
      { working: "The 25 N splits: $25\\cos 16.26° = 24$ N to the left and $25\\sin 16.26° = 7$ N up", decision: "Only the angled force needs splitting; the other two already lie along the directions." },
      { working: "Across: $24 - 24 = 0$", decision: "The part to the left matches the 24 N to the right." },
      { working: "Up and down: $7 - 7 = 0$", decision: "The part upwards matches the 7 N downwards. Zero both ways: the resultant is zero." },
    ]);
    expect(shown(choice("g1", "A particle is in equilibrium under three forces. What is the resultant of those forces?", ["zero", "the largest of the three", "the sum of the three sizes"], "zero"), cancel)).toHaveLength(1);
  });

  it("flags a word without its article, and a charge written in TeX (the catalyst, a maximum, 2e^-)", () => {
    // c2/c2-collision-theory-catalysts g15
    const pqr = seeOf("Solids P, Q and R, 1.50 g each, are added to separate samples of hydrogen peroxide. Afterwards P and R still weigh 1.50 g and Q weighs 0.92 g. The times to collect 35 cm³ of oxygen are P 25 s, Q 60 s and R 400 s. Which solid is the catalyst? [2]", [
      { working: "Q lost mass, so it was used up: Q reacted.", decision: "A catalyst is not used up; a solid that loses mass is a reactant." },
      { working: "R kept its mass but the oxygen came slowly: R did not speed the reaction up.", decision: "Not being used up is only half of it; a catalyst must also raise the rate." },
      { working: "P kept its mass and gave the fastest reaction, so P is the catalyst.", decision: "Both tests passed: the same mass, and a faster reaction." },
    ]);
    expect(shown(choice("g15", "Solid S speeds up a reaction and is recovered with its mass unchanged. What is S?", ["a catalyst", "a reactant", "a product"], "a catalyst"), pqr)).toEqual([
      'gate g15\'s answer "a catalyst" is printed in its section\'s See it (step 3): she can copy it rather than do it; ask it on new numbers, as a twin does',
    ]);
    // fm1/curve-sketching-quadratic-cubic g4: a negative second derivative, "maximum", in both
    const peak = seeOf("$y = 8 - 6x - x^{2}$. Find its turning point and say whether it is a maximum or a minimum.", [
      { working: "$\\frac{dy}{dx} = -6 - 2x = 0$, so $x = -3$", decision: "Gradient zero for the x of the turning point." },
      { working: "$y = 8 - 6(-3) - (-3)^{2} = 17$", decision: "Into the curve for the height." },
      { working: "$\\frac{d^{2}y}{dx^{2}} = -2$", decision: "Differentiate a second time." },
      { working: "Negative, so $(-3, 17)$ is the curve's peak: maximum", decision: "A negative second derivative: the gradient falls through zero, so the curve rises to the point and drops away." },
    ]);
    expect(shown(choice("g4", "A curve has $\\frac{d^{2}y}{dx^{2}} = -6$ at its turning point. What kind of point is it?", ["A maximum", "A minimum", "Neither, because the value is negative"], "A maximum"), peak)).toHaveLength(1);
    // c2/c2-electrolysis-molten-salts g24: the accepted "2e-" is the equation's 2e^-
    const fluorine = seeOf("Fluorine is made industrially by electrolysing a molten fluoride. Write the half equation at the anode. [3]", [
      { working: "$\\ce{2F^- -> F2}$", decision: "Fluorine leaves as F₂, so two fluoride ions make one molecule." },
      { working: "Electrons go on the right: the ions lose them.", decision: "Lost electrons are written after the arrow." },
      { working: "$\\ce{2F^- -> F2 + 2e^-}$: −2 on the left, 0 − 2 = −2 on the right.", decision: "Two ions each lose one electron, so the charges match." },
      { working: "Not $\\ce{F^- -> F + e^-}$: fluorine does not exist as single atoms.", decision: "The near miss the 2024 report names, there for oxygen." },
    ]);
    expect(shown(typed("g24", "blank", "Molten calcium chloride is electrolysed. How many electrons are released at the anode for each chlorine molecule that forms?", "2 | two | 2 electrons | two electrons | 2e- | 2e⁻"), fluorine)).toEqual([
      'gate g24\'s answer "2e-" is printed in its section\'s See it (step 3): she can copy it rather than do it; ask it on new numbers, as a twin does',
    ]);
  });

  it("does not flag a word in a sentence naming another option, nor in a reason whose See it worked a case with another answer", () => {
    // p2/p2-magnetism-electromagnets g3: the rule names both poles; the See it's case (clockwise) has the other answer
    const coil = seeOf("Seen from the left-hand end of a coil, the current flows clockwise. Name the pole at each end. [2]", [
      { working: "Left-hand end: clockwise, seen from that end, so that end is south.", decision: "The end rule: anticlockwise makes a north pole, clockwise a south pole." },
      { working: "Right-hand end: the opposite, so it is north.", decision: "A coil, like a bar magnet, has one north end and one south end." },
    ]);
    expect(shown(choice("g3", "Seen from the left-hand end of a coil, the current flows anticlockwise. Which pole is the right-hand end?", ["a south pole", "a north pole", "no pole: only bar magnets have poles"], "a south pole"), coil)).toEqual([]);
    // c2/c2-homologous-series-alkanes g13: pentane is a liquid; "the solid has gone" teaches the contrast
    const pentane = seeOf("Pentane melts at −130 °C and boils at 36 °C. What is its state at 20 °C? Explain your answer. [2]", [
      { working: "20 °C is above pentane's melting point, −130 °C, so it has already melted.", decision: "Compare with the melting point first: above it, the solid has gone." },
      { working: "20 °C is below its boiling point, 36 °C, so it has not boiled: pentane is a liquid.", decision: "Between the melting and boiling points means liquid. Name the state and give the comparison: that is the mark." },
    ]);
    expect(shown(choice("g13", "An alkane with 20 carbon atoms melts at 37 °C and boils at 343 °C. What is its state at 20 °C?", ["solid", "liquid", "gas"], "solid"), pentane)).toEqual([]);
  });

  it("does not flag a number that is a given, a label, a coefficient or a step on the way", () => {
    // fm1/gradient-at-a-point g7: (−2)² is 4 on the way to −13
    const grad = seeOf("$y = 3x^{2} + \\frac{4}{x}$. Find the gradient where $x = -2$.", [
      { working: "$y = 3x^{2} + 4x^{-1}$", decision: "Rewrite the fraction so every term is a power of $x$." },
      { working: "$\\frac{dy}{dx} = 6x - 4x^{-2} = 6x - \\frac{4}{x^{2}}$", decision: "$4 \\times (-1) = -4$, and the index drops to $-2$." },
      { working: "$6(-2) - \\frac{4}{(-2)^{2}}$", decision: "Brackets round $-2$ in both places: $(-2)^{2}$ is $4$, positive." },
      { working: "$= -12 - 1 = -13$", decision: "Negative: the curve is falling at this point." },
    ]);
    expect(shown(choice("g7", "$y = x^{2} - \\frac{6}{x}$. What is the gradient where $x = -1$?", ["$4$", "$-8$", "$7$"], "$4$"), grad)).toEqual([]);
    // m4/circle-theorems g4: 3x = 66 on the way to x = 22
    const angles = seeOf("AB is a diameter of a circle, centre O, and C lies on the circle. Angle CAB = (2x + 13)° and angle ABC = (x + 11)°.\n\nWork out the value of x and the size of angle ABC.", [
      { working: "Angle ACB = 90°, because the angle in a semicircle is 90°.", decision: "AB passes through O, so it is a diameter, and C is on the circle. Write the right angle before any algebra." },
      { working: "(2x + 13) + (x + 11) + 90 = 180", decision: "The three angles of triangle ABC add up to 180°, and the right angle is one of them." },
      { working: "3x + 114 = 180, so 3x = 66 and x = 22", decision: "Collect the x terms and the numbers separately: 13 + 11 + 90 = 114." },
      { working: "Angle ABC = 22 + 11 = 33°", decision: "Check: angle CAB = 2(22) + 13 = 57°, and 57 + 33 + 90 = 180." },
    ], "x = 22 and angle ABC = 33°.");
    expect(shown(typed("g4", "number", "AB is a diameter and C is on the circle. Angle CAB = 24°. Angle ABC =", "66"), angles)).toEqual([]);
    // fm2/constant-acceleration-formulae g10: a given (t = 6) and "Half of 6 is 3"
    const boat = seeOf("A boat accelerating steadily passes a buoy at $U$ m/s and, 6 s later, passes a second buoy 48 m away at 11 m/s. Find $U$.", [
      { working: "$s = 48$, $v = 11$, $t = 6$, $u = U$; $a$ is spare, so $s = \\tfrac{1}{2}(u + v)t$", decision: "The list shows $a$ neither given nor wanted." },
      { working: "$48 = \\tfrac{1}{2}(U + 11) \\times 6$", decision: "Substitute, keeping $U + 11$ in its bracket." },
      { working: "$48 = 3(U + 11)$", decision: "Half of 6 is 3, still multiplying the whole bracket." },
      { working: "$U + 11 = 16$", decision: "Divide both sides by 3 before touching the 11." },
      { working: "$U = 5$", decision: "Take the 11 off last." },
    ]);
    expect(shown(typed("g10", "number", "A runner accelerating steadily passes a post at U m/s and, 4 s later, passes a flag 30 m further on at 9 m/s. Find U, in m/s.", "6"), boat)).toEqual([]);
    // b2/b2-heart-double-circulation g9: a box label
    const route = seeOf("Complete the route by naming the chamber or vessel in each numbered box. [4]\nbody → 1 → right atrium → 2 → pulmonary artery → lungs → 3 → left atrium → 4 → aorta", [
      { working: "Box 1: vena cava.", decision: "The vein that brings blood back from the body into the right atrium." },
      { working: "Box 2: right ventricle.", decision: "From an atrium, blood passes through a valve into the ventricle on the same side." },
      { working: "Box 3: pulmonary vein.", decision: "Back from the lungs towards the heart, so a vein." },
      { working: "Box 4: left ventricle.", decision: "The left atrium passes blood down to the left ventricle, which pumps it into the aorta." },
    ]);
    expect(shown(typed("g9", "number", "On one complete circuit of the body, how many times does the blood pass through the heart?", "2"), route)).toEqual([]);
  });

  it("does not read the stem: its words are the See it's question (on, inside or outside; the recurring decimal)", () => {
    // m8/equation-of-a-circle-and-its-tangent g14
    const circle = seeOf("Decide whether each point is on, inside or outside the circle $x^2 + y^2 = 130$: $A(-9, 7)$ and $B(8, -9)$.", [
      { working: "$A$: $(-9)^2 + 7^2 = 81 + 49 = 130$", decision: "Square each coordinate; the minus sign disappears." },
      { working: "$130 = 130$, so $A$ is on the circle", decision: "The total equals $r^2$ exactly." },
      { working: "$B$: $8^2 + (-9)^2 = 64 + 81 = 145$", decision: "The same substitution for the second point." },
      { working: "$145 > 130$, so $B$ is further from O than the radius", decision: "A total bigger than $r^2$ always puts the point beyond the circle." },
    ]);
    expect(shown(choice("g14", "Where is the point $(-7, -8)$ compared with the circle $x^2 + y^2 = 110$?", ["Outside the circle", "On the circle", "Inside the circle", "Not on it: both coordinates are negative"], "Outside the circle"), circle)).toEqual([]);
    // m8/recurring-decimals-to-fractions g8
    const recurring = seeOf("Change the recurring decimal $0.\\dot{3}\\dot{6}$ to a fraction in its simplest form.", [
      { working: "Let $x = 0.3636\\ldots$", decision: "Two digits sit under the dots, so the block is 36." },
      { working: "$100x = 36.3636\\ldots$", decision: "Two digits in the block, so two places: multiply by 100." },
      { working: "$100x - x = 99x = 36$", decision: "The tails cancel, leaving whole numbers." },
      { working: "$x = \\dfrac{36}{99} = \\dfrac{4}{11}$", decision: "Divide top and bottom by 9: the last mark is for the lowest terms." },
    ], "$0.\\dot{3}\\dot{6} = \\dfrac{4}{11}$");
    expect(shown(typed("g8", "blank", "Fill the gap: you multiply by one power of ten for each digit in the ______ block.", "repeating | recurring | repeating block | recurring block"), recurring)).toEqual([]);
  });
});
