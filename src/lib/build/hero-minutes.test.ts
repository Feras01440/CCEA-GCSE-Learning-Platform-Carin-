import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { withModelMinutes } from "./hero-minutes";
import { lessonMinutesFor } from "@/lib/slides/minutes";
import { packTopics } from "@/lib/slides/packs-corpus.test-helper";

/**
 * The build ships the model's minutes (the lead's ruling, 29 Sep 2026, 18:00): a shipped note's hero.minutes is the app's
 * own Read minutes (src/lib/slides/minutes.ts lessonMinutesFor), priced on what ships; the authored number is kept only
 * where the model has nothing to measure (lessonMinutesFor returns it then).
 */

type Block = Record<string, unknown>;
const words = (n: number) => Array.from({ length: n }, (_, i) => `w${i}`).join(" ");
const hero = (minutes: number): Block => ({ type: "hero", lede: "A lede.", can: ["Do a", "Do b", "Do c"], minutes });
const heroOf = (blocks: unknown[] | null) => (blocks ?? []).find((b) => (b as Block).type === "hero") as Block | undefined;

describe("hero-minutes: the build writes the model's minutes into the shipped hero", () => {
  it("writes the model's Read minutes for a note it can measure, and leaves the pack's copy alone", () => {
    // 1 heading word + 899 words at 180 a minute, one Your turn of 40 s: 5.67 minutes of work, 6 printed
    const blocks: Block[] = [hero(25), { type: "h", text: "Idea" }, { type: "p", md: words(899) }, { type: "gate", id: "g1", kind: "choice", prompt: "?", options: ["a", "b"], answer: "a", explain: "E." }];
    const shipped = withModelMinutes(blocks);
    expect(heroOf(shipped)?.minutes).toBe(6);
    expect(heroOf(shipped)?.minutes).toBe(lessonMinutesFor({ blocks }).read.minutes);
    expect(blocks[0].minutes).toBe(25);
    expect(shipped?.slice(1)).toEqual(blocks.slice(1));
  });

  it("keeps the authored number where the model has nothing to measure", () => {
    const blocks: Block[] = [hero(12), { type: "figure", svg: "<svg/>", alt: "A drawing.", caption: "A drawing." }];
    expect(heroOf(withModelMinutes(blocks))?.minutes).toBe(12);
  });

  it("prices a See it that names a worked example by that example's steps, as the page does", () => {
    const blocks: Block[] = [hero(1), { type: "h", text: "Idea" }, { type: "p", md: words(179) }, { type: "see", workedExample: "we.x.01" }];
    const workedExamples = [{ id: "we.x.01", steps: [{}, {}, {}, {}] }];
    // 180 words (1 minute) and four See it steps at 15 s (1 minute): 2
    expect(heroOf(withModelMinutes(blocks, { workedExamples }))?.minutes).toBe(2);
    expect(heroOf(withModelMinutes(blocks))?.minutes).toBe(1);
  });

  it("returns a note without a hero as a copy, and a missing note as null", () => {
    const blocks: Block[] = [{ type: "p", md: "Text." }];
    expect(withModelMinutes(blocks)).toEqual(blocks);
    expect(withModelMinutes(blocks)).not.toBe(blocks);
    expect(withModelMinutes(null)).toBeNull();
  });

  it("gives every note in the packs the model's number, priced on what ships (the build's own rule)", () => {
    const SHIPPABLE = new Set(["verified", "published"]);
    let notes = 0;
    let changed = 0;
    for (const t of packTopics()) {
      const logs = (t.bundle.verification ?? []) as Array<{ id?: string; itemId?: string; status?: string }>;
      const ships = (it: { id: string; verification?: string }) => SHIPPABLE.has(String((it.verification ? logs.find((l) => l.id === it.verification) : logs.find((l) => l.itemId === it.id))?.status));
      const workedExamples = t.bundle.workedExamples.filter(ships);
      const prompts = t.bundle.prompts.filter(ships);
      const shipped = withModelMinutes(t.blocks, { workedExamples, prompts, topicId: t.topicId });
      const h = heroOf(shipped);
      if (!h) continue;
      notes += 1;
      expect(h.minutes, t.file).toBe(lessonMinutesFor({ blocks: t.blocks, workedExamples, prompts, topicId: t.topicId }).read.minutes);
      if (h.minutes !== heroOf(t.blocks)?.minutes) changed += 1;
    }
    expect(notes).toBeGreaterThan(0);
    console.log(`[hero-minutes] ${notes} notes: the build ships the model's minutes; ${changed} differ from the pack's authored number`);
  });

  it("is what pipeline/build-content.mts ships as the note's blocks", () => {
    const build = fs.readFileSync(path.resolve(__dirname, "../../../pipeline/build-content.mts"), "utf8");
    expect(build).toMatch(/noteBlocks: noteOk \? withModelMinutes\(noteBlocks, \{ workedExamples: shippedWorkedExamples, prompts: shippedPrompts, topicId: b\.topic\.id \}\) : null/);
  });
});
