import { describe, expect, it } from "vitest";
import { heroMinutesFinding, recallFindings } from "../../../scripts/qa/lesson-model.mjs";
import * as minutes from "@/lib/slides/minutes";
import * as recall from "@/lib/slides/recall";
import type { RetrievalPrompt } from "@/lib/content/schema";

/**
 * scripts/qa/lesson-model.mjs reads the app's own lesson model for lesson-v2 (the lead's items e and f, 29 Sep 2026): the
 * hero's stated minutes against src/lib/slides/minutes.ts, and the wired prompts the lesson leaves out by
 * src/lib/slides/recall.ts. These tests hand it the real modules, as lesson-v2 does.
 */

type Block = Record<string, unknown>;
const words = (n: number) => Array.from({ length: n }, (_, i) => `w${i}`).join(" ");
const note = (heroMinutes: number | undefined, ...body: Block[]): Block[] => [{ type: "hero", lede: "A lede.", can: ["Do a", "Do b", "Do c"], ...(heroMinutes === undefined ? {} : { minutes: heroMinutes }) }, ...body];
const priced = (blocks: Block[]) => minutes.lessonMinutesFor({ blocks });
const finding = (blocks: Block[]) => heroMinutesFinding(blocks, priced(blocks), minutes);

describe("lesson-model: the pack's hero.minutes against the app's minute model (report only: the build ships the model's)", () => {
  it("says nothing for the model's own number and reports any other with the number the build ships", () => {
    // 1 heading word + 899 words = 900 words at 180 a minute, and one Your turn of 40 s: 5.67 minutes of work, 6 printed
    const body = [{ type: "h", text: "Idea" }, { type: "p", md: words(899) }, { type: "gate", id: "g1", kind: "choice", prompt: "?", options: ["a", "b"], answer: "a", explain: "E." }];
    expect(priced(note(6, ...body)).read.minutes).toBe(6);
    expect(finding(note(6, ...body))).toBeNull();
    const f = finding(note(9, ...body));
    expect(f).not.toBeNull();
    expect([f!.stated, f!.model, f!.words, f!.seconds]).toEqual([9, 6, 900, 40]);
    expect(f!.detail).toBe(
      "the pack's hero.minutes is 9; the app's minute model (src/lib/slides/minutes.ts) gives 6: 5.7 min of work, 900 words read at 180 a minute and 0 min 40 s of See it steps, Your turns, figures, videos and recall cards, rounded once; the build ships 6",
    );
    expect(finding(note(5, ...body))).not.toBeNull();
  });

  it("has no tolerance: at an exact half the model's number is the one it rounds up to, and the minute below differs", () => {
    // 450 words: 2.5 minutes of work, printed (and shipped) as 3
    const body = [{ type: "h", text: "Idea" }, { type: "p", md: words(449) }];
    expect(priced(note(3, ...body)).read.minutes).toBe(3);
    expect(finding(note(3, ...body))).toBeNull();
    expect(finding(note(2, ...body))?.model).toBe(3);
    expect(finding(note(4, ...body))?.model).toBe(3);
  });

  it("passes the model's number where its minute-a-part floor lifts it above the work, and says nothing without a stated number", () => {
    const body = ["One", "Two", "Three"].flatMap((t) => [{ type: "h", text: t }, { type: "p", md: "Short." }]);
    expect(priced(note(3, ...body)).read.minutes).toBe(3);
    expect(finding(note(3, ...body))).toBeNull();
    expect(finding(note(undefined, ...body))).toBeNull();
  });
});

describe("lesson-model: the wired prompts the lesson leaves out, with recall.ts's reasons", () => {
  const prompt = (id: string, promptText: string, answer: string): RetrievalPrompt => ({ id, kind: "definition", prompt: promptText, answer }) as unknown as RetrievalPrompt;
  const wire = (...ids: string[]): Block[] => ids.map((promptId) => ({ type: "prompt", promptId }));
  const light = prompt("rp.x.01", "What is the unit of force?", "The newton.");
  const why = prompt("rp.x.02", "Why does a catalyst speed up a reaction?", "It gives a route with a lower activation energy.");
  const draft = prompt("rp.x.03", "What is the unit of energy?", "The joule.");

  it("names the unfit and the unshipped with their reasons, and keeps the light one", () => {
    const r = recallFindings(note(8, ...wire("rp.x.01", "rp.x.02", "rp.x.03", "rp.x.09")), { shipped: [light, why], all: [light, why, draft], logs: [{ itemId: "rp.x.03", status: "draft" }] }, recall);
    expect(r.wired).toEqual(["rp.x.01", "rp.x.02", "rp.x.03", "rp.x.09"]);
    expect(r.kept).toEqual(["rp.x.01"]);
    expect(r.leftOut.map((x: { id: string; kind: string; reasons: string[] }) => [x.id, x.kind, x.reasons])).toEqual([
      ["rp.x.02", "unfit", ["asks for an explanation"]],
      ["rp.x.03", "unshipped", ['the bundle does not ship it (its log says "draft")']],
      ["rp.x.09", "unshipped", ["the bundle holds no prompt with this id"]],
    ]);
    expect(r.leftOut[0].detail).toBe(
      'prompt rp.x.02 is wired but the lesson leaves it out (Read and Slides, src/lib/slides/recall.ts): asks for an explanation (the answer she would give: "It gives a route with a lower activation energy")',
    );
  });

  it("keeps at most two light ones, the shortest, and says why a third is left out", () => {
    const third = prompt("rp.x.04", "What is the unit of power?", "The watt, one joule every second of the time it runs.");
    const r = recallFindings(note(8, ...wire("rp.x.01", "rp.x.04", "rp.x.03")), { shipped: [light, third, draft], all: [light, third, draft], logs: [] }, recall);
    expect(r.kept).toEqual(["rp.x.01", "rp.x.03"]);
    expect(r.leftOut.map((x: { id: string; kind: string }) => [x.id, x.kind])).toEqual([["rp.x.04", "over"]]);
    expect(r.leftOut[0].reasons).toEqual(["it fits, but a lesson keeps at most 2 recall cards and keeps the lighter rp.x.01 and rp.x.03"]);
  });

  it("reports a note that wires none as keeping none, with nothing left out", () => {
    expect(recallFindings(note(8), { shipped: [light], all: [light], logs: [] }, recall)).toEqual({ wired: [], kept: [], leftOut: [] });
  });
});
