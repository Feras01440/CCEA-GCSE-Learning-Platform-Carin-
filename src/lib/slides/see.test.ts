import { describe, expect, it } from "vitest";
import { markGate, type GateBlock, type SeeBlock } from "@/components/items/gates";
import { markAnswer } from "@/components/items/mark";
import type { AnswerSpec, WorkedExample } from "@/lib/content/schema";
import { SEE_KINDS } from "@/lib/content/schema";
import { buildDeck } from "./cards";
import { diagnosisFor, lineAbout, misconceptionTags, optionNoteFor, resolveSee, seeShowsAnswer, stepPointer, stepPointers, twinGate, twinOptions, typedStep } from "./see";
import { trialNote } from "./packs-corpus.test-helper";
import { SEE_FIXTURE_BLOCKS, SEE_FIXTURE_WE_ID, SEE_FIXTURE_WORKED_EXAMPLE } from "./see-fixture";
import { spokenTex, spokenText } from "./text";

/** The trial's gates as its note on disk has them (packs/, or SLIDES_TRIAL_DIR: packs-corpus.test-helper.ts). */
const trialGates = (): GateBlock[] => (trialNote().blocks as GateBlock[]).filter((b) => b.type === "gate");
const fixtureBlock = <T>(pred: (b: Record<string, unknown>) => boolean) => (SEE_FIXTURE_BLOCKS as Array<Record<string, unknown>>).find(pred) as T;
const WES = [SEE_FIXTURE_WORKED_EXAMPLE as unknown as WorkedExample];

describe("a See it, resolved", () => {
  it("takes the inline form as written, without a why-menu, and keeps its one typed step", () => {
    const typed = fixtureBlock<SeeBlock>((b) => b.type === "see" && String(b.stem ?? "").startsWith("Find the value"));
    const see = resolveSee({ ...typed, steps: (typed as { steps: unknown[] }).steps.map((s, i) => (i === 0 ? { ...(s as object), whyMenu: { options: ["a", "b"], correct: 0, explain: "e" } } : s)) } as SeeBlock, WES)!;
    expect(see.steps).toHaveLength(3);
    expect("whyMenu" in see.steps[0]!).toBe(false);
    expect(see.steps[2]!.input).toMatchObject({ kind: "numeric", value: 10 });
    expect(see.workedExample).toBeNull();
    // The step she types is marked through the engine: 10 is the value, and 7 + 3 written as 10 is it.
    expect(markAnswer("10", see.steps[2]!.input as AnswerSpec).correct).toBe(true);
    expect(markAnswer("9", see.steps[2]!.input as AnswerSpec).correct).toBe(false);
  });

  it("draws a named worked example's stem, figure, steps and answer line, without its why-menu and without its input", () => {
    const see = resolveSee({ type: "see", workedExample: SEE_FIXTURE_WE_ID }, WES)!;
    expect(see.stem).toBe(SEE_FIXTURE_WORKED_EXAMPLE.stem);
    expect(see.steps.map((s) => Object.keys(s).sort())).toEqual([
      ["decision", "earns", "n", "working"],
      ["decision", "earns", "n", "working"],
      ["decision", "earns", "n", "working"],
    ]);
    // Its last step ends in the answer, so the answer line is not printed twice.
    expect(see.finalAnswer).toBeNull();
    expect(resolveSee({ type: "see", workedExample: "we.fm.u1.nowhere.01" }, WES)).toBeNull();
    expect(resolveSee({ type: "see", workedExample: SEE_FIXTURE_WE_ID }, null)).toBeNull();
  });

  it("prints the answer line only when the last step does not already end in it", () => {
    const see = resolveSee({ type: "see", stem: "S", steps: [{ n: 1, working: "$a = 1$", decision: "d" }, { n: 2, working: "$b = 2$", decision: "d" }], finalAnswer: "$c = 3$" }, null)!;
    expect(see.finalAnswer).toBe("$c = 3$");
  });

  it("types no step in the topic's first See it, and at most one in a later one; never in a See it drawn from a worked example", () => {
    const typed = resolveSee(fixtureBlock<SeeBlock>((b) => b.type === "see" && String(b.stem ?? "").startsWith("Find the value")), WES);
    expect(typedStep(typed, false)).toBe(2);
    expect(typedStep(typed, true)).toBeNull();
    expect(typedStep(resolveSee({ type: "see", workedExample: SEE_FIXTURE_WE_ID }, WES), false)).toBeNull();
    expect(typedStep(null, false)).toBeNull();
  });
});

describe("the re-teach and the answer", () => {
  it("finds the steps an explanation points at, one or several", () => {
    expect(stepPointer("Divide out what both lines share, as step 3 of See it did: …")).toBe(3);
    expect(stepPointer("This is step 2 of the See it.")).toBe(2);
    expect(stepPointer("Factorise first, as the worked lines did.")).toBeNull();
    expect(stepPointer(undefined)).toBeNull();
    // As the migrated notes write them (fm2/average-speed g7: "This is steps 1 and 2 of See it").
    expect(stepPointers("This is steps 1 and 2 of See it. Stage speeds lead to the trap.")).toEqual([1, 2]);
    expect(stepPointers("Steps 2 to 4 of the See it did this.")).toEqual([2, 3, 4]);
    expect(stepPointers("As steps 1, 3 and 4 of See it showed.")).toEqual([1, 3, 4]);
    expect(stepPointers("Step 1 of the See it again: the brown rabbits existed first.")).toEqual([1]);
    expect(stepPointers("No pointer here.")).toEqual([]);
  });

  it("finds a See it that prints the answer of the Your turn it is shown for, and not one that only shares digits", () => {
    const see = (working: string[], stem = "Simplify it.") => resolveSee({ type: "see", stem, steps: working.map((w, i) => ({ n: i + 1, working: w, decision: "Because." })) }, null)!;
    const gate = (kind: GateBlock["kind"], answer: string): GateBlock => ({ type: "gate", id: "g", kind, prompt: "?", answer, explain: "E.", ...(kind === "choice" ? { options: [answer, "other"] } : {}) });
    expect(seeShowsAnswer(see(["$\\frac{x-2}{x+3}$ is the answer"]), gate("choice", "$\\dfrac{x-2}{x+3}$"))).toBe("$\\dfrac{x-2}{x+3}$");
    expect(seeShowsAnswer(see(["$\\dfrac{x}{2(x-7)}$"]), gate("choice", "$\\dfrac{x}{2}$"))).toBeNull();
    // A number counts only as a number of its own.
    expect(seeShowsAnswer(see(["$1 - 4 = -3$"]), gate("number", "-3"))).toBe("-3");
    expect(seeShowsAnswer(see(["$\\dfrac{x^{2}-9}{x-3}$", "$x^{-3}$", "$x - 3$"]), gate("number", "-3"))).toBeNull();
    expect(seeShowsAnswer(see(["$x - 3$"]), gate("number", "3"))).toBeNull();
    expect(seeShowsAnswer(see(["$x + 3 = 10$"]), gate("number", "10 | 10.0"))).toBe("10");
    expect(seeShowsAnswer(see(["$210$ counters"]), gate("number", "10"))).toBeNull();
    // Words, case and spacing aside.
    expect(seeShowsAnswer(see(["The Left Ventricle pumps blood to the body."]), gate("blank", "left ventricle"))).toBe("left ventricle");
    // The fixture's See its print none of their Your turns' answers.
    const deck = buildDeck(SEE_FIXTURE_BLOCKS, [], null, { workedExamples: WES });
    for (const c of deck.cards) {
      if (c.kind !== "gate") continue;
      const s = deck.cards.find((d) => d.key === c.seeKey);
      expect(s?.kind === "see" && s.see ? seeShowsAnswer(s.see, c.gate) : null, c.gate.id).toBeNull();
    }
  });

  it("names her option with the explanation's own sentence about it, found by its formula", () => {
    // The trial's g12, g10 and g2 as its v3 note words them (29 Sep 2026): the heuristic's test data, kept here so a
    // later edit of the note cannot change what this test means.
    const g12 = "Eighty-one is $9^{2}$, so $x^{2}-81$ is a square minus a square, as in step 1 of the See it: one bracket takes $+9$, the other $-9$, and the middle terms cancel. $(x+9)^{2}$ gives $x^{2}+18x+81$, and $(x+81)(x-1)$ gives $x^{2}+80x-81$. So it is $(x+9)(x-9)$.";
    const g10 = "Look at the numbers, as step 4 of the See it did: 14 and 7 share a factor of 7, so dividing both by 7 gives $\\frac{2}{x-9}$. Multiplying the bracket out to $\\frac{14}{7x-63}$ only hides that factor. So no: it becomes $\\frac{2}{x-9}$.";
    const g2 = "Cancelling divides a whole line, so only a factor can go. In $\\frac{x+4}{x}$ the $x$ on top is added to the 4, a term, as in step 2 of the See it, and no 4 sits underneath. Test it as step 3 did: at $x=1$ the fraction is 5, not 4 or 1. So nothing cancels.";
    expect(diagnosisFor(g12, "$(x+9)^{2}$")).toMatch(/^\$\(x\+9\)\^\{2\}\$ gives/);
    expect(diagnosisFor(g10, "No — it becomes $\\frac{14}{7x-63}$")).toBe("Multiplying the bracket out to $\\frac{14}{7x-63}$ only hides that factor.");
    // A formula of a letter or a digit names nothing, and a word as short as "Yes" is not searched for.
    expect(diagnosisFor(g2, "The $x$, leaving $4$")).toBeNull();
    expect(diagnosisFor(g10, "Yes")).toBeNull();
  });
});

describe("a gate's twin", () => {
  const g1 = fixtureBlock<GateBlock>((b) => b.id === "g1");
  const g3 = fixtureBlock<GateBlock>((b) => b.id === "g3");

  it("is a gate of its own: the gate's kind, new numbers, its own options and answer, marked as a gate is", () => {
    const twin = twinGate(g1)!;
    expect(twin).toMatchObject({ type: "gate", id: "g1~twin", kind: "choice", answer: "$\\dfrac{x}{3}$" });
    expect(twin.prompt).not.toBe(g1.prompt);
    expect(markGate(twin, "$\\dfrac{x}{3}$")).toBe(true);
    expect(markGate(twin, "$\\dfrac{4x}{12}$")).toBe(false);
    const numeric = twinGate(g3)!;
    expect(numeric).toMatchObject({ kind: "number", answer: "-4" });
    expect("options" in numeric).toBe(false);
    // A minus sign typed from the strip is the same number.
    expect(markGate(numeric, "−4")).toBe(true);
    expect(markGate(numeric, "4")).toBe(false);
    expect(twinGate({ ...g1, twin: undefined })).toBeNull();
  });

  it("never shows its answer where the first asking lit the gate's", () => {
    const twin = twinGate(g1)!;
    for (let at = 0; at < 3; at += 1) {
      const order = twinOptions(twin, at);
      expect([...order].sort()).toEqual([...twin.options!].sort());
      expect(order.indexOf(twin.answer), `first lit at ${at}`).not.toBe(at);
    }
    expect(twinOptions(twin, null)).toHaveLength(3);
  });
});

describe("V3.1: the note on her option, and a See it's kind", () => {
  const g1 = fixtureBlock<GateBlock>((b) => b.id === "g1");
  const g2 = fixtureBlock<GateBlock>((b) => b.id === "g2");

  it("finds the note on the option she chose, by its words as written; never on the answer or on a gate with none", () => {
    expect(optionNoteFor(g1, "$\\dfrac{5x}{10}$")?.why).toMatch(/^Dividing out the bracket is right/);
    expect(optionNoteFor(g1, " $\\dfrac{x+2}{2}$ ")?.why).toMatch(/is on the top only, so it stays\.$/);
    expect(optionNoteFor(g1, g1.answer)).toBeNull();
    expect(optionNoteFor(g1, "something else")).toBeNull();
    expect(optionNoteFor({ ...g1, optionNotes: undefined }, "$\\dfrac{5x}{10}$")).toBeNull();
    expect(optionNoteFor(fixtureBlock<GateBlock>((b) => b.id === "g3"), "3")).toBeNull();
  });

  it("says one line about her choice: the note where there is one, else the explanation's own sentence", () => {
    expect(lineAbout(g1, "$\\dfrac{5x}{10}$")).toMatch(/fully means nothing shared is left\.$/);
    expect(lineAbout({ ...g1, optionNotes: undefined }, "$\\dfrac{5x}{10}$")).toMatch(/^Stopping at/);
  });

  it("tags her attempt with the misconception her option names, and nothing when it names none", () => {
    expect(misconceptionTags(g1, "$\\dfrac{5x}{10}$")).toEqual(["fm.algfrac.not-fully-simplified"]);
    expect(misconceptionTags(g2, "$\\dfrac{x+2}{x+3}$")).toEqual([]);
    expect(misconceptionTags(g1, g1.answer)).toEqual([]);
  });

  it("asks the twin with its own notes, never the gate's", () => {
    const twin = twinGate(g1)!;
    expect(optionNoteFor(twin, "$\\dfrac{4x}{12}$")?.why).toMatch(/a \$4\$ still divides both lines/);
    expect(optionNoteFor(twin, "$\\dfrac{5x}{10}$")).toBeNull();
    expect(twinGate(g2)).toBeNull();
    // A twin without notes of its own asks with none.
    const bare = twinGate({ ...g1, twin: { ...g1.twin!, optionNotes: undefined } as GateBlock["twin"] })!;
    expect(bare.optionNotes).toBeUndefined();
  });

  it("carries a See it's kind as written, every kind the enum names, and none for a See it drawn from a worked example", () => {
    for (const kind of SEE_KINDS) expect(resolveSee({ type: "see", kind, stem: "S", steps: [{ n: 1, working: "$a$", decision: "d" }, { n: 2, working: "$b$", decision: "d" }] }, null)?.kind).toBe(kind);
    expect(resolveSee({ type: "see", stem: "S", steps: [{ n: 1, working: "$a$", decision: "d" }, { n: 2, working: "$b$", decision: "d" }] }, null)?.kind).toBeNull();
    expect(resolveSee({ type: "see", workedExample: SEE_FIXTURE_WE_ID }, WES)?.kind).toBeNull();
  });
});

describe("maths read aloud (an option's or a question's accessible name)", () => {
  it("says fractions, powers, roots and signs as words a screen reader reads well", () => {
    expect(spokenTex("(x+9)(x-9)")).toBe("(x + 9)(x − 9)");
    expect(spokenTex("\\frac{x+2}{x-2}")).toBe("(x + 2) over (x − 2)");
    expect(spokenTex("\\dfrac{x}{2(x-7)}")).toBe("x over 2(x − 7)");
    expect(spokenTex("x^{2}-81")).toBe("x squared − 81");
    expect(spokenTex("x^{3}-144x")).toBe("x cubed − 144x");
    expect(spokenTex("x^{n+1}")).toBe("x to the power n + 1");
    expect(spokenTex("\\sqrt{2}")).toBe("root 2");
    expect(spokenTex("-2")).toBe("−2");
    expect(spokenTex("1 - 4 = -3")).toBe("1 − 4 = −3");
    expect(spokenTex("3 \\times x \\times (x+7)")).toBe("3 × x × (x + 7)");
  });

  it("keeps a line's words and speaks its formulas, so no option is announced without a name (audit READ-1, SLIDES-4)", () => {
    expect(spokenText("What cancels in this fraction? $\\dfrac{x+4}{x}$")).toBe("What cancels in this fraction? (x + 4) over x");
    expect(spokenText("The $x$, leaving $4$")).toBe("The x, leaving 4");
    expect(spokenText("No — it becomes $\\frac{2}{x-9}$")).toBe("No — it becomes 2 over (x − 9)");
    expect(spokenText("$(x+9)(x-9)$")).toBe("(x + 9)(x − 9)");
    expect(spokenText("**Simplify fully** $x^{2}$")).toBe("Simplify fully x squared");
    // Every option of every trial gate and of every twin has a name with something in it (the note on disk, whatever its version).
    for (const g of trialGates()) for (const o of [...(g.options ?? []), ...(g.twin?.options ?? [])]) expect(spokenText(o).trim().length, `${g.id}: ${o}`).toBeGreaterThan(0);
  });
});
