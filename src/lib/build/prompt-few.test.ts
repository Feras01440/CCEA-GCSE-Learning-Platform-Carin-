import { describe, expect, it } from "vitest";
import { ANSWER_TARGET, ANSWER_WORDS, QUESTION_WORDS, WIRED_MAX, numberedList, promptFindings, promptTargets } from "../../../scripts/qa/prompt-few.mjs";

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

  it("states the owner's sizes of 27 Sep: a question of at most 15 words, an answer of about 12", () => {
    expect(QUESTION_WORDS).toBe(15);
    expect(ANSWER_TARGET).toBe(12);
  });

  it("warns on an answer written as a numbered list (a procedure in a prompt), wired or not", () => {
    expect(numberedList("1. Factorise the top. 2. Factorise the bottom. 3. Cancel.")).toBe(true);
    expect(numberedList("Factorise first:\n1) the top\n2) the bottom")).toBe(true);
    expect(numberedList("(1) the top (2) the bottom")).toBe(true);
    expect(numberedList("Step 1 factorise, Step 2 cancel")).toBe(true);
    expect(numberedList("$x = 1.5$ or $x = 2$")).toBe(false);
    expect(numberedList("Divide by 2. Then add 1.")).toBe(false);
    expect(numberedList("Only step 2 needs the sign.")).toBe(false);
    const bundle = shipped(rp("rp.a", "1. Factorise. 2. Cancel."), rp("rp.b", "the optimum"));
    expect(promptFindings(note("rp.b"), bundle).map((f: { kind: string; id?: string; wired?: boolean }) => [f.kind, f.id, f.wired])).toEqual([["numbered", "rp.a", false]]);
    expect(promptFindings(note("rp.b"), bundle)[0].detail).toBe("prompt rp.a expects a numbered list (a procedure is the recap's job; a prompt is one fact)");
  });

  it("warns on a wired prompt whose question runs past 15 words; the flashcards deck's unwired prompts are not held to it", () => {
    const long = { ...rp("rp.a", "short"), prompt: words(16) };
    const unwired = { ...rp("rp.b", "short"), prompt: words(20) };
    const found = promptFindings(note("rp.a"), shipped(long, unwired));
    expect(found.map((f: { kind: string; id?: string; words?: number }) => [f.kind, f.id, f.words])).toEqual([["question", "rp.a", 16]]);
    expect(found[0].detail).toBe("prompt rp.a asks a 16-word question (at most 15 on a recall card)");
  });

  it("reports, never warns, the answers over the 12-word target", () => {
    const bundle = shipped(rp("rp.a", words(12)), rp("rp.b", words(13)), rp("rp.c", words(30)));
    expect(promptTargets(note("rp.b"), bundle)).toEqual([
      { id: "rp.b", words: 13, wired: true },
      { id: "rp.c", words: 30, wired: false },
    ]);
    expect(promptFindings(note("rp.b"), bundle).map((f: { kind: string }) => f.kind)).toEqual(["long"]);
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
