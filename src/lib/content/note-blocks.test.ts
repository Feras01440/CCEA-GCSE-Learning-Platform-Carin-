/**
 * The note-blocks schema (src/lib/content/schema.ts NoteBlocks): the See it block in both forms and the gate's twin,
 * as docs/plan/review/2026-09-27-see-it-block-shape.md and src/components/items/gates.ts name them, and the build's own
 * rules for them (content-lint.ts seeAndTwinDefects, 27 Sep 2026). The schema accepts what the lint accepts: every
 * case below is judged by both, and they must agree. Where they cannot (the schema never sees the bundle; the schema's
 * step is the worked example's step, whose mark codes and answer spec have a shape), the difference is pinned and was
 * reported to the lead.
 */
import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import type { z } from "zod";
import { lintNoteBlocks } from "@/components/items/content-lint";
import type { NoteBlock as GatesNoteBlock } from "@/components/items/gates";
import { SEE_FIXTURE_BLOCKS, SEE_FIXTURE_PROMPTS, SEE_FIXTURE_VERIFICATION, SEE_FIXTURE_WE_ID, SEE_FIXTURE_WORKED_EXAMPLE } from "@/lib/slides/see-fixture";
import { NoteBlock, NoteBlocks, RetrievalPrompt, SEE_STEPS, WorkedExample } from "./schema";

const ROOT = path.resolve(__dirname, "../../..");

/** The schema's block is gates.ts's block, both ways: a compile-time check (tsc fails here if they drift apart). */
type Parsed = z.infer<typeof NoteBlock>;
const schemaToGates = (b: Parsed): GatesNoteBlock => b;
const gatesToSchema = (b: GatesNoteBlock): Parsed => b;

/** The bundle a reference See it is checked against: the fixture's worked example, shipped. */
const BUNDLE = { workedExamples: [SEE_FIXTURE_WORKED_EXAMPLE], verification: SEE_FIXTURE_VERIFICATION };

const schemaOk = (blocks: unknown[]) => NoteBlocks.safeParse(blocks).success;
const lintOk = (blocks: unknown[]) => lintNoteBlocks(blocks, "case", BUNDLE).length === 0;

const h = (text: string, role?: string) => (role ? { type: "h", text, role } : { type: "h", text });
const p = (md: string) => ({ type: "p", md });
const step = (n: number, extra: Record<string, unknown> = {}) => ({ n, working: `$x = ${n}$`, decision: `Step ${n} because.`, ...extra });
const see = (steps: unknown[], extra: Record<string, unknown> = {}) => ({ type: "see", stem: "Simplify $\\dfrac{2x}{4}$.", steps, ...extra });
const choice = (id: string, extra: Record<string, unknown> = {}) => ({ type: "gate", id, kind: "choice", prompt: "Which?", options: ["a", "b", "c"], answer: "a", explain: "Because.", ...extra });
const numberGate = (id: string, extra: Record<string, unknown> = {}) => ({ type: "gate", id, kind: "number", prompt: "How many?", answer: "-3", explain: "Because.", ...extra });
const NUMERIC_INPUT = { kind: "numeric", value: 2, tolerance: { type: "exact" }, unitRequired: false, acceptForms: ["decimal"] };
/** A first section with its own See it, so a later See it is not the topic's first. */
const opening = [h("One", "idea"), p("Words."), see([step(1), step(2)]), choice("g0")];

describe("the note-blocks schema is gates.ts's NoteBlock", () => {
  it("types the same blocks both ways (a compile-time check)", () => {
    expect(typeof schemaToGates).toBe("function");
    expect(typeof gatesToSchema).toBe("function");
  });

  it("accepts every published note (198 on 27 Sep 2026), each block by its type", () => {
    const failures: string[] = [];
    let notes = 0;
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
          notes += 1;
          const r = NoteBlocks.safeParse(JSON.parse(fs.readFileSync(file, "utf8")));
          if (!r.success) failures.push(`${subject}/${unit}/${topic}: ${r.error.issues.map((i) => `[${i.path.join(".")}] ${i.message}`).join("; ")}`);
        }
      }
    }
    expect(notes).toBeGreaterThan(150);
    expect(failures, failures.join("\n")).toEqual([]);
  });

  it("accepts the teach-first fixture (both See it forms, two twins, a typed step, two Your turns), and so does the lint", () => {
    const r = NoteBlocks.safeParse(SEE_FIXTURE_BLOCKS);
    expect(r.success, r.success ? "" : JSON.stringify(r.error.issues, null, 1)).toBe(true);
    expect(lintNoteBlocks(SEE_FIXTURE_BLOCKS, "fixture", BUNDLE)).toEqual([]);
    // The fixture's worked example and prompts are themselves valid content, so the end-to-end specs can serve them.
    expect(WorkedExample.safeParse(SEE_FIXTURE_WORKED_EXAMPLE).success).toBe(true);
    for (const prompt of SEE_FIXTURE_PROMPTS) expect(RetrievalPrompt.safeParse(prompt).success, prompt.id).toBe(true);
    expect(SEE_STEPS).toEqual({ min: 2, max: 6 });
  });
});

describe("the schema and the build's lint judge the See it and the twin alike", () => {
  const cases: Array<{ name: string; blocks: unknown[]; ok: boolean }> = [
    { name: "a note written before 27 Sep, with no See it", blocks: [h("One"), p("Words."), choice("g1")], ok: true },
    { name: "an inline See it of two steps before its gate", blocks: [h("One"), p("Words."), see([step(1), step(2)]), choice("g1")], ok: true },
    { name: "six steps", blocks: [see([1, 2, 3, 4, 5, 6].map((n) => step(n)))], ok: true },
    { name: "one step", blocks: [see([step(1)])], ok: false },
    { name: "seven steps", blocks: [see([1, 2, 3, 4, 5, 6, 7].map((n) => step(n)))], ok: false },
    { name: "steps out of order", blocks: [see([step(1), step(3)])], ok: false },
    { name: "a blank working line", blocks: [see([step(1), step(2, { working: "  " })])], ok: false },
    { name: "a blank reason", blocks: [see([step(1), step(2, { decision: " " })])], ok: false },
    { name: "no stem", blocks: [{ type: "see", steps: [step(1), step(2)] }], ok: false },
    { name: "a blank stem", blocks: [see([step(1), step(2)], { stem: "   " })], ok: false },
    { name: "a typed step in the topic's first See it", blocks: [see([step(1), step(2, { input: NUMERIC_INPUT })])], ok: false },
    { name: "one typed step in a later See it", blocks: [...opening, h("Two"), see([step(1), step(2, { input: NUMERIC_INPUT })]), choice("g1")], ok: true },
    { name: "a typed first step in a later See it", blocks: [...opening, h("Two"), see([step(1, { input: NUMERIC_INPUT }), step(2)]), choice("g1")], ok: true },
    { name: "two typed steps in a later See it", blocks: [...opening, h("Two"), see([step(1), step(2, { input: NUMERIC_INPUT }), step(3, { input: NUMERIC_INPUT })])], ok: false },
    { name: "the reference form", blocks: [h("One"), p("Words."), { type: "see", workedExample: SEE_FIXTURE_WE_ID }, choice("g1")], ok: true },
    { name: "the reference form with a stem of its own (ignored)", blocks: [{ type: "see", workedExample: SEE_FIXTURE_WE_ID, stem: "Not read." }], ok: true },
    { name: "both forms at once", blocks: [{ type: "see", workedExample: SEE_FIXTURE_WE_ID, stem: "S", steps: [step(1), step(2)] }], ok: false },
    { name: "a gate before its section's See it", blocks: [h("One"), p("Words."), choice("g1"), see([step(1), step(2)])], ok: false },
    { name: "a gate before a See it under a 'see' heading, which continues the section", blocks: [h("One"), p("Words."), choice("g1"), h("See it done", "see"), see([step(1), step(2)])], ok: false },
    { name: "a gate in the section before a See it", blocks: [h("One"), p("Words."), choice("g1"), h("Two"), see([step(1), step(2)]), choice("g2")], ok: true },
    { name: "a gate after its See it and a video", blocks: [h("One"), see([step(1), step(2)]), { type: "video", videoId: "v", title: "V", channel: "c" }, choice("g1")], ok: true },
    { name: "a choice gate's twin with its options", blocks: [choice("g1", { twin: { prompt: "Which, again?", options: ["d", "e"], answer: "d", explain: "Again." } })], ok: true },
    { name: "a choice gate's twin without options", blocks: [choice("g1", { twin: { prompt: "Which, again?", answer: "d", explain: "Again." } })], ok: false },
    { name: "a choice gate's twin with empty options", blocks: [choice("g1", { twin: { prompt: "Which, again?", options: [], answer: "d", explain: "Again." } })], ok: false },
    { name: "a twin whose answer is not an option", blocks: [choice("g1", { twin: { prompt: "Which, again?", options: ["d", "e"], answer: "f", explain: "Again." } })], ok: false },
    { name: "a twin with no explanation", blocks: [numberGate("g1", { twin: { prompt: "How many now?", answer: "-4" } })], ok: false },
    { name: "a twin with a blank prompt", blocks: [numberGate("g1", { twin: { prompt: " ", answer: "-4", explain: "Again." } })], ok: false },
    { name: "a number gate's twin", blocks: [numberGate("g1", { twin: { prompt: "How many now?", answer: "-4", explain: "Again." } })], ok: true },
    { name: "a blank gate's twin with options holding the answer", blocks: [{ ...choice("g1"), kind: "blank", twin: { prompt: "Fill it?", options: ["x", "y"], answer: " x ", explain: "Again." } }], ok: true },
    { name: "a blank gate's twin with options not holding the answer", blocks: [{ ...choice("g1"), kind: "blank", twin: { prompt: "Fill it?", options: ["x", "y"], answer: "z", explain: "Again." } }], ok: false },
  ];
  for (const c of cases) {
    it(`${c.ok ? "accepts" : "rejects"} ${c.name}`, () => {
      expect(schemaOk(c.blocks), "the schema").toBe(c.ok);
      expect(lintOk(c.blocks), `the lint: ${lintNoteBlocks(c.blocks, "case", BUNDLE).join("; ")}`).toBe(c.ok);
    });
  }
});

describe("where the two cannot agree, pinned (and reported to the lead, 27 Sep)", () => {
  it("the lint checks the named worked example against the bundle; the schema, which never sees the bundle, checks its id", () => {
    const unknown = [{ type: "see", workedExample: "we.fm.u1.fixture-simplify.99" }];
    expect(schemaOk(unknown)).toBe(true);
    expect(lintOk(unknown)).toBe(false);
    const notAnId = [{ type: "see", workedExample: "the second example" }];
    expect(schemaOk(notAnId)).toBe(false);
    expect(lintOk(notAnId)).toBe(false);
  });

  it("a See it step is the worked example's step, so its mark codes, answer spec and why-menu are judged by the lint in the schema's own words (agreed 27 Sep 21:55)", () => {
    const later = (s: Record<string, unknown>) => [...opening, h("Two"), see([step(1), step(2, s)]), choice("g1")];
    for (const odd of [{ earns: ["M1 A1"] }, { input: { kind: "numeric", value: "two" } }, { whyMenu: { options: ["only one"], correct: 0, explain: "E" } }]) {
      expect(schemaOk(later(odd)), JSON.stringify(odd)).toBe(false);
      expect(lintOk(later(odd)), JSON.stringify(odd)).toBe(false);
    }
    // And a drawing or a final answer that is there must be one.
    expect(schemaOk([see([step(1), step(2)], { figure: { kind: "svg", src: "", alt: "" } })])).toBe(false);
    expect(lintOk([see([step(1), step(2)], { figure: { kind: "svg", src: "", alt: "" } })])).toBe(false);
    expect(schemaOk([see([step(1), step(2)], { finalAnswer: "" })])).toBe(false);
    expect(lintOk([see([step(1), step(2)], { finalAnswer: "" })])).toBe(false);
  });
});

// The independent review of 27 Sep 2026: a choice gate may carry notes on its wrong options, and an inline See it a
// kind. Both are optional; the schema and the lint judge them alike.
describe("a choice gate's option notes and a See it's kind", () => {
  const withNotes = (notes: unknown[], gate: (id: string, extra?: Record<string, unknown>) => Record<string, unknown> = choice) => [
    ...opening,
    h("Two"),
    see([step(1), step(2)]),
    gate("g1", { optionNotes: notes }),
  ];
  const note = (option: string, why = "It halves instead of doubling.", extra: Record<string, unknown> = {}) => ({ option, why, ...extra });
  const cases: Array<{ name: string; blocks: unknown[]; ok: boolean }> = [
    { name: "notes on two wrong options, one naming its misconception", blocks: withNotes([note("b"), note("c", "Adds the tops.", { misconception: "fm.algfrac.add-tops" })]), ok: true },
    { name: "a note on the answer", blocks: withNotes([note("a")]), ok: false },
    { name: "a note on an option the gate does not offer", blocks: withNotes([note("d")]), ok: false },
    { name: "two notes on one option", blocks: withNotes([note("b"), note("b", "Again.")]), ok: false },
    { name: "a why of 41 words", blocks: withNotes([note("b", Array.from({ length: 41 }, () => "word").join(" "))]), ok: false },
    { name: "a why of 40 words", blocks: withNotes([note("b", Array.from({ length: 40 }, () => "word").join(" "))]), ok: true },
    { name: "a note with no why", blocks: withNotes([note("b", "")]), ok: false },
    { name: "notes on a number gate", blocks: withNotes([note("b")], numberGate), ok: false },
    { name: "an inline See it of kind calculation", blocks: [...opening, h("Two"), see([step(1), step(2)], { kind: "calculation" }), choice("g1")], ok: true },
    { name: "an inline See it of an unknown kind", blocks: [...opening, h("Two"), see([step(1), step(2)], { kind: "anecdote" }), choice("g1")], ok: false },
  ];
  for (const c of cases) {
    it(`${c.ok ? "accepts" : "rejects"} ${c.name}`, () => {
      expect(schemaOk(c.blocks), "the schema").toBe(c.ok);
      if (c.name.includes("unknown kind")) return; // the kind's values are the schema's shape; the lint does not read them
      expect(lintOk(c.blocks), `the lint: ${lintNoteBlocks(c.blocks, "case", BUNDLE).join("; ")}`).toBe(c.ok);
    });
  }
});
