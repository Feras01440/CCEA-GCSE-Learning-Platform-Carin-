import { describe, expect, it } from "vitest";
import { ANSWER_WORDS, WIRED_MAX, promptFindings } from "../../../scripts/qa/prompt-few.mjs";

/**
 * The owner's verdict of 24 Sep 2026 (23:40), after trying Slides: retrieval prompts are optional,
 * fewer and short-answer, never essay-like; one or two short recall prompts per topic, never four by
 * habit. scripts/qa/prompt-few.mjs is the lint; scripts/qa/lesson-v2.mjs reports it as a warning.
 */

const words = (n: number) => Array.from({ length: n }, (_, i) => `w${i}`).join(" ");
const rp = (id: string, answer: string) => ({ id, topic: "maths.m4.x", specRefs: ["M4-1"], kind: "qa", prompt: "Q?", answer });
const wire = (...ids: string[]) => ids.map((promptId) => ({ type: "prompt", promptId }));
const shipped = (...prompts: ReturnType<typeof rp>[]) => ({ prompts, verification: prompts.map((p, i) => ({ id: `ver.${i}`, itemId: p.id, status: "verified" })) });
const note = (...ids: string[]) => [{ type: "hero" }, { type: "h", text: "In the exam", role: "pointer" }, { type: "p", md: "One paragraph." }, ...wire(...ids)];

describe("retrieval prompts: few and short", () => {
  it("states the limits the owner set", () => {
    expect(WIRED_MAX).toBe(2);
    expect(ANSWER_WORDS).toBe(25);
  });

  it("passes a note that wires one or two short prompts", () => {
    const bundle = shipped(rp("rp.a", "the optimum"), rp("rp.b", words(25)));
    expect(promptFindings(note("rp.a"), bundle)).toEqual([]);
    expect(promptFindings(note("rp.a", "rp.b"), bundle)).toEqual([]);
  });

  it("warns when a note wires more than two prompts, naming them", () => {
    const bundle = shipped(...["a", "b", "c", "d"].map((x) => rp(`rp.${x}`, "short")));
    expect(promptFindings(note("rp.a", "rp.b", "rp.c", "rp.d"), bundle)).toEqual([
      { kind: "wired", count: 4, ids: ["rp.a", "rp.b", "rp.c", "rp.d"], detail: "the note wires 4 retrieval prompts (at most 2: few, optional and short)" },
    ]);
  });

  it("warns on any shipped prompt whose expected answer runs past 25 words, wired or not", () => {
    const bundle = shipped(rp("rp.a", words(26)), rp("rp.b", words(40)), rp("rp.c", "short"));
    const found = promptFindings(note("rp.a", "rp.c"), bundle);
    expect(found.map((f: { kind: string; id?: string; words?: number; wired?: boolean }) => [f.kind, f.id, f.words, f.wired])).toEqual([
      ["long", "rp.a", 26, true],
      ["long", "rp.b", 40, false],
    ]);
    expect(found[0].detail).toBe("prompt rp.a expects a 26-word answer (at most 25: a short recall, never an essay)");
  });

  it("counts a prompt wired twice once, and ignores a draft prompt the pipeline never ships", () => {
    const bundle = {
      prompts: [rp("rp.a", "short"), rp("rp.b", "short"), rp("rp.c", words(30))],
      verification: [
        { id: "ver.1", itemId: "rp.a", status: "verified" },
        { id: "ver.2", itemId: "rp.b", status: "verified" },
        { id: "ver.3", itemId: "rp.c", status: "draft" },
      ],
    };
    expect(promptFindings(note("rp.a", "rp.b", "rp.a"), bundle)).toEqual([]);
  });
});
