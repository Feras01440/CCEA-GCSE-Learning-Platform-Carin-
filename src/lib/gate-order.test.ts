import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { gateOptions, markGate, type GateBlock } from "@/components/items/gates";
import { heroDataFor, lessonBlocks } from "@/components/topic/lesson-plan";
import type { RetrievalPrompt } from "@/lib/content/schema";
import { deckFor } from "@/lib/slides/deck";
import { deckGateOrders, deckGatePlacements, optionTex, positionalSentences, positionalWording, retryOrder, shownOptions } from "./gate-order";

const ROOT = path.resolve(__dirname, "../..");
const readJson = (file: string) => JSON.parse(fs.readFileSync(file, "utf8"));

interface Note {
  file: string;
  topicId: string;
  blocks: unknown[];
  prompts: RetrievalPrompt[];
}

const NOTES: Note[] = (() => {
  const out: Note[] = [];
  const packs = path.join(ROOT, "packs");
  for (const subject of fs.readdirSync(packs)) {
    const content = path.join(packs, subject, "content");
    if (!fs.existsSync(content)) continue;
    for (const unit of fs.readdirSync(content)) {
      const unitDir = path.join(content, unit);
      if (!fs.statSync(unitDir).isDirectory()) continue;
      for (const topic of fs.readdirSync(unitDir)) {
        const file = path.join(unitDir, topic, "note.blocks.json");
        if (!fs.existsSync(file)) continue;
        const bundle = readJson(path.join(unitDir, topic, "bundle.json")) as { topic?: { id?: string }; prompts?: RetrievalPrompt[] };
        out.push({ file: `${subject}/${unit}/${topic}`, topicId: bundle.topic?.id ?? topic, blocks: readJson(file) as unknown[], prompts: bundle.prompts ?? [] });
      }
    }
  }
  return out;
})();

const choiceGates = (blocks: readonly unknown[]): GateBlock[] =>
  blocks.filter((b): b is GateBlock => (b as GateBlock).type === "gate" && (b as GateBlock).kind === "choice" && ((b as GateBlock).options?.length ?? 0) >= 2);

const TRIAL = NOTES.find((n) => n.topicId === "fm.u1.algebraic-fractions-simplify")!;

describe("the trial topic: the owner's finding that the right answer was nearly always A", () => {
  it("spreads the seven right answers over A, B and C, never more than three in one place", () => {
    const placed = deckGatePlacements(TRIAL.blocks);
    expect([...placed.keys()]).toEqual(["g1", "g2", "g7", "g3", "g4", "g5", "g6"]);
    const at = [...placed.values()].map((p) => p.answerAt);
    const counts = [0, 1, 2].map((p) => at.filter((a) => a === p).length);
    // Seven gates in three places: 3, 2, 2 is the best there is, and two of the seven are held at A (below).
    expect(Math.max(...counts)).toBeLessThanOrEqual(3);
    expect(Math.min(...counts)).toBeGreaterThanOrEqual(2);
    // The seeded shuffle alone had put five of the seven at A and none at C (build 7, measured 24 Sep 23:59).
    expect(counts[0]).toBeLessThan(5);
  });

  it("keeps g4 and g5 in their authored order, because their explanations name the options by place", () => {
    const placed = deckGatePlacements(TRIAL.blocks);
    const byId = new Map(choiceGates(TRIAL.blocks).map((g) => [g.id, g]));
    for (const id of ["g4", "g5"]) {
      expect(placed.get(id)).toMatchObject({ pinned: true, order: byId.get(id)!.options });
    }
    // g4's explanation, verbatim: true only as authored.
    expect(positionalWording(byId.get("g4")!.explain)).toBe(
      "The second option is that same line before any cancelling; the third strikes out the two $x^{2}$ terms, which are terms of a sum.",
    );
    // The other five are free to move.
    expect([...placed.entries()].filter(([, p]) => !p.pinned).map(([id]) => id)).toEqual(["g1", "g2", "g7", "g3", "g6"]);
  });
});

describe("every published note", () => {
  it("reads every published note (184 on 24 Sep; the content session publishes more)", () => {
    expect(NOTES.length).toBeGreaterThanOrEqual(184);
  });

  it("shows each choice gate's own options, each once, and marks by the option picked, not its place", () => {
    for (const n of NOTES) {
      const orders = deckGateOrders(n.blocks);
      for (const g of choiceGates(n.blocks)) {
        const order = orders.get(g.id)!;
        expect([...order].sort(), `${n.file} ${g.id}`).toEqual([...g.options!].sort());
        for (const opt of order) expect(markGate(g, opt), `${n.file} ${g.id}: ${opt}`).toBe(opt.trim() === g.answer.trim());
      }
    }
  });

  it("never puts more than half the right answers plus one in one place, in a lesson with four or more choice gates", () => {
    const offenders: string[] = [];
    for (const n of NOTES) {
      const at = [...deckGatePlacements(n.blocks).values()].map((p) => p.answerAt).filter((a) => a >= 0);
      if (at.length < 4) continue;
      const most = Math.max(...[0, 1, 2, 3].map((p) => at.filter((a) => a === p).length));
      if (most > Math.floor(at.length / 2) + 1) offenders.push(`${n.file}: ${at.map((a) => "ABCD"[a]).join("")}`);
    }
    expect(offenders).toEqual([]);
  });

  it("spreads them as evenly as the gates allow where nothing is held in place: no place differs from another by more than one", () => {
    const uneven: string[] = [];
    let checked = 0;
    for (const n of NOTES) {
      const gates = choiceGates(n.blocks);
      const placed = deckGatePlacements(n.blocks);
      const widths = new Set(gates.map((g) => g.options!.length));
      if (gates.length < 2 || widths.size !== 1 || [...placed.values()].some((p) => p.pinned)) continue;
      checked += 1;
      const k = [...widths][0];
      const counts = Array.from({ length: k }, (_, p) => [...placed.values()].filter((x) => x.answerAt === p).length);
      if (Math.max(...counts) - Math.min(...counts) > 1) uneven.push(`${n.file}: ${counts.join("/")}`);
    }
    expect(checked).toBeGreaterThan(100);
    expect(uneven).toEqual([]);
  });

  it("never shows one place three gates running unless the gates held in place force it", () => {
    const runs: string[] = [];
    for (const n of NOTES) {
      const placed = [...deckGatePlacements(n.blocks).values()].filter((p) => p.answerAt >= 0);
      for (let i = 2; i < placed.length; i += 1) {
        const three = placed.slice(i - 2, i + 1);
        if (three.every((p) => p.answerAt === three[0].answerAt) && !three.every((p) => p.pinned)) runs.push(`${n.file} at gate ${i + 1}`);
      }
    }
    expect(runs).toEqual([]);
  });

  it("gives the same gate the same order in Slides and in Read, because both deal the note's gates in the same order", () => {
    for (const n of NOTES) {
      // Read: the note as the lesson renders it (TopicContent's plan.noteBlocks).
      const read = lessonBlocks(n.blocks, heroDataFor(n.blocks).lede);
      // Slides: the gates of the deck the route builds (retries are built from these same gates).
      const slides = deckFor(n.topicId, n.blocks, n.prompts)
        .cards.filter((c) => c.kind === "gate")
        .map((c) => (c as Extract<typeof c, { kind: "gate" }>).gate);
      expect(deckGateOrders(slides), n.file).toEqual(deckGateOrders(read));
      // And one gate looked up alone in either renders the lesson's order.
      const orders = deckGateOrders(read);
      for (const g of choiceGates(read)) expect(shownOptions(g, orders), `${n.file} ${g.id}`).toEqual(orders.get(g.id));
    }
  });

  it("keeps every gate whose explanation names options by place in its authored order", () => {
    let pinned = 0;
    for (const n of NOTES) {
      const placed = deckGatePlacements(n.blocks);
      for (const g of choiceGates(n.blocks)) {
        if (!positionalWording(g.explain)) continue;
        pinned += 1;
        expect(placed.get(g.id), `${n.file} ${g.id}`).toMatchObject({ pinned: true, order: g.options });
      }
    }
    // 43 on 24 Sep 2026 (positional-explains.json went to the content session); rewording brings this down.
    expect(pinned).toBeGreaterThan(0);
  });

  it("is a pure function of the note: the same order every time, and not the same pattern in every lesson", () => {
    const firsts = new Set<number>();
    for (const n of NOTES) {
      const a = deckGatePlacements(n.blocks);
      expect(deckGatePlacements(JSON.parse(JSON.stringify(n.blocks)))).toEqual(a);
      const first = [...a.values()].find((p) => !p.pinned);
      if (first && choiceGates(n.blocks).length >= 3) firsts.add(first.answerAt);
    }
    expect(firsts.size).toBeGreaterThanOrEqual(3);
  });
});

describe("a lesson with one choice gate, and a gate asked on its own", () => {
  const gate = (over: Partial<GateBlock> = {}): GateBlock => ({
    type: "gate",
    id: "g1",
    kind: "choice",
    prompt: "What is $x^{2}-9$ as a product of two brackets?",
    options: ["$(x+3)(x-3)$", "$(x+3)^{2}$", "$(x+9)(x-1)$"],
    answer: "$(x+3)(x-3)$",
    explain: "A difference of two squares.",
    ...over,
  });

  it("shows a lone gate exactly as its own seeded order always has", () => {
    const g = gate();
    expect(deckGateOrders([g]).get("g1")).toEqual(gateOptions(g));
    expect(deckGateOrders([{ type: "h", text: "A heading" }, g, { type: "p", md: "Prose." }]).get("g1")).toEqual(gateOptions(g));
    expect(shownOptions(g)).toEqual(gateOptions(g));
    expect(shownOptions(g, null)).toEqual(gateOptions(g));
  });

  it("shows a lone gate whose explanation names options by place in its authored order (the review inbox shows the explanation too)", () => {
    const g = gate({ explain: "The second option is a perfect square; the third multiplies to $x^{2}+8x-9$." });
    expect(shownOptions(g)).toEqual(g.options);
  });

  it("leaves blank and number gates alone", () => {
    const blank: GateBlock = { type: "gate", id: "g2", kind: "blank", prompt: "Fill it.", answer: "x", explain: "e" };
    expect(deckGateOrders([blank, gate()]).has("g2")).toBe(false);
    expect(shownOptions(blank)).toEqual([]);
  });
});

describe("the gate asked once more before the recap (Slides' retry)", () => {
  it("moves the answer off the place it was lit in, and turns the other options round", () => {
    for (const n of NOTES) {
      const orders = deckGateOrders(n.blocks);
      for (const g of choiceGates(n.blocks)) {
        const first = orders.get(g.id)!;
        const again = retryOrder(g, first);
        expect([...again].sort(), `${n.file} ${g.id}`).toEqual([...first].sort());
        const was = first.findIndex((o) => o.trim() === g.answer.trim());
        const now = again.findIndex((o) => o.trim() === g.answer.trim());
        if (positionalWording(g.explain)) expect(again, `${n.file} ${g.id}`).toEqual(first);
        else expect(now, `${n.file} ${g.id}`).not.toBe(was);
        expect(retryOrder(g, first)).toEqual(again);
      }
    }
  });
});

describe("how an option's maths is set, in Slides and in Read (audit LD-16)", () => {
  it("sets a stacked fraction at text size, and leaves the value as authored for marking", () => {
    const g4 = choiceGates(TRIAL.blocks).find((g) => g.id === "g4")!;
    expect(g4.options!.map(optionTex)).toEqual(["$\\dfrac{x+2}{x-2}$", "$\\dfrac{(x+5)(x+2)}{(x+5)(x-2)}$", "$\\dfrac{7x+10}{3x-10}$"]);
    for (const opt of g4.options!) expect(markGate(g4, opt)).toBe(opt === g4.answer);
    expect(optionTex("$\\dfrac{1}{2}$ and $\\tfrac{1}{2}$ and plain words")).toBe("$\\dfrac{1}{2}$ and $\\tfrac{1}{2}$ and plain words");
  });
});

describe("positional wording (audit LD-01): which sentences name an option by its place", () => {
  const named = [
    "The second option changed the sign of the first term only; the third added instead of subtracting.",
    "Multiplying the bracket out, as the third option does, is not simplifying.",
    "The middle option prices the soup at $£52.10$.",
    "The second answer roots before dividing; the third halves the square instead of rooting it.",
    "The second gives $w^2 - 100$; the third has a middle term.",
    "The second stops too early; the third leaves the 3 inside a bracket.",
    "Only the first is a power.",
    "All three are the same number, but only the first has a rational denominator.",
    "The other two are M8-NA-03 itself, and the first is the Teacher Guidance example.",
    "and the last one describes two transformations when the question asked for one.",
    "Summer 2023 recorded candidates using the first alternative and a few using the second.",
    "Option B forgets the minus sign.",
    "The answer (c) is the tangent.",
    "The one above is the uncancelled line.",
  ];
  const notNamed = [
    "The other two options are the same common denominator written two ways.",
    "The first numerator is multiplied by $(x+2)$.",
    "That is the first method mark, and it is available before any answer.",
    "Leaving $\\sqrt{50}$ is worth a mark; simplifying it earns the last one.",
    "Stopping at $x^{2}$ keeps the method marks and loses the last one, which is the commonest way to score three out of four.",
    "The third decimal rounds the second one up; chopping would give a different answer.",
    "Dividing by 120 instead would answer a different question.",
    "The four advantages each answer a problem with animal insulin.",
    "Concentration and surface area change only the first; temperature changes both.",
    "Two angles give you the third, so you have a side with the angle facing it.",
    "Each way of making the first choice opens a whole fresh set of second choices.",
    "The third and fourth are where it dips below the axis on the graph.",
    "The velocity at Q ends the first stage and begins the second.",
    "Find the denominator rule and write one above the other.",
    "The quartiles are the first and third cuts, so the middle two groups sit between them.",
  ];
  it.each(named)("names an option by place: %s", (s) => {
    expect(positionalSentences(s)).toEqual([s]);
  });
  it.each(notNamed)("does not: %s", (s) => {
    expect(positionalWording(s)).toBeNull();
  });
  it("returns each sentence that does, and none that does not", () => {
    expect(positionalSentences("Both brackets factorise. The second option stops one line short; the third used the product. Check the numbers.")).toEqual([
      "The second option stops one line short; the third used the product.",
    ]);
    expect(positionalSentences("")).toEqual([]);
    expect(positionalWording(undefined)).toBeNull();
  });
});
