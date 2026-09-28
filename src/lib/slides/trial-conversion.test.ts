/**
 * The trial topic (fm1/algebraic-fractions-simplify) converted to the See it shape, as this agent proposes it to the
 * content session (27 Sep 2026): every worked paragraph of the note today becomes a `see` block in the same place, with
 * its maths recomputed; nothing else moves, no gate id or answer changes, and the prose that explains stays prose.
 * The test proves the proposal passes the schema, the build's lint and the readiness structure, and that the deck and
 * its registered enrichment still fit (the figure she acts on attaches after the three moves' See it). The content
 * session writes the note; these blocks are the exact starting point, and each `explain` still has to be rewritten to
 * point at its step ("as step 2 of See it did") and each wrong option given its note (V3.1).
 *
 * Every line recomputed (27 Sep 2026): at x = 2, (x + 8)/5x = 10/10 = 1 and 8/5 ≠ 1; x² − 49 = (x + 7)(x − 7), and
 * back, x² − 7x + 7x − 49; 16x² = (4x)², 81 = 9², 25x² − 1 = (5x + 1)(5x − 1); 2 × 196 = 392, 14² = 196; 2 × 64 = 128,
 * 8 × 9 = 72, 8 + 9 = 17; 8 = 4 × 2; 5x²/x = 5x, 12x/3x = 4; 3x² + 24x = 3x(x + 8), 64 = 8², 3x(x + 8)/(x + 8)(x − 8) =
 * 3x/(x − 8).
 */
import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { lintNoteBlocks } from "@/components/items/content-lint";
import { NoteBlocks, type RetrievalPrompt } from "@/lib/content/schema";
import { buildDeck, deckGateIds, deckRuleViolations, seeAnswerPrinted, type GateCard, type SeeCard } from "./cards";
import { deckFor } from "./deck";
import { enrichmentFor } from "./enrichment";
import { noteStructure } from "./readiness";

const ROOT = path.resolve(__dirname, "../../..");
const TRIAL = path.join(ROOT, "packs", "further-maths", "content", "fm1", "algebraic-fractions-simplify");
const TRIAL_ID = "fm.u1.algebraic-fractions-simplify";
type Block = Record<string, unknown>;

/** The worked paragraph each See it replaces, found by its opening words (the note's own), and the See it itself. */
export const TRIAL_SEE_ITS: Array<{ replaces: string; keep?: string; see: Block }> = [
  {
    replaces: "In $\\frac{x(x+8)}{5x}$ the $x$ multiplies the whole top",
    see: {
      type: "see",
      kind: "explanation",
      stem: "Does the $x$ divide out of $\\dfrac{x(x+8)}{5x}$, and out of $\\dfrac{x+8}{5x}$?",
      steps: [
        { n: 1, working: "$\\dfrac{x(x+8)}{5x} = \\dfrac{x+8}{5}$", decision: "Here the $x$ multiplies the whole top and the whole bottom: a factor of both lines, so it divides out." },
        { n: 2, working: "$\\dfrac{x+8}{5x}$ at $x = 2$: $\\dfrac{10}{10} = 1$", decision: "Here the $x$ on top is added to the 8: a term. Test the fraction with a number first." },
        { n: 3, working: "Striking the $x$ leaves $\\dfrac{8}{5}$, not $1$", decision: "A cancel must leave the value alone. This one changes it, so the $x$ stays where it is." },
      ],
    },
  },
  {
    replaces: "So $x^{2}-49=(x+7)(x-7)$",
    see: {
      type: "see",
      kind: "calculation",
      stem: "Factorise $x^{2}-49$.",
      steps: [
        { n: 1, working: "$49 = 7^{2}$", decision: "Spot the shape: $x^{2}$ minus a square number." },
        { n: 2, working: "$x^{2}-49 = (x+7)(x-7)$", decision: "One bracket takes $+7$, the other $-7$.", earns: ["MW1"] },
        { n: 3, working: "$(x+7)(x-7) = x^{2}-7x+7x-49 = x^{2}-49$", decision: "Multiply back to check: the two middle terms cancel, which is why this shape never has an $x$ term." },
      ],
    },
  },
  {
    replaces: "So $16x^{2}-81=(4x+9)(4x-9)$",
    see: {
      type: "see",
      kind: "calculation",
      stem: "Factorise $16x^{2}-81$, then $25x^{2}-1$.",
      steps: [
        { n: 1, working: "$16x^{2} = (4x)^{2}$ and $81 = 9^{2}$", decision: "Take the square root of each part: the root of $16x^{2}$ is $4x$, not $16x$." },
        { n: 2, working: "$16x^{2}-81 = (4x+9)(4x-9)$", decision: "One bracket plus, one minus.", earns: ["MW1"] },
        { n: 3, working: "$25x^{2}-1 = (5x+1)(5x-1)$", decision: "The same shape: $25x^{2} = (5x)^{2}$ and $1 = 1^{2}$.", earns: ["MW1"] },
      ],
    },
  },
  {
    replaces: "$2x^{2}-392$ looks stuck until the 2 comes out",
    see: {
      type: "see",
      kind: "calculation",
      stem: "Factorise $2x^{2}-392$ fully.",
      steps: [
        { n: 1, working: "$2x^{2}-392 = 2(x^{2}-196)$", decision: "It looks stuck until the common factor comes out: both terms share a 2." },
        { n: 2, working: "$x^{2}-196 = (x+14)(x-14)$", decision: "The bracket is two squares: $196 = 14^{2}$." },
        { n: 3, working: "$2x^{2}-392 = 2(x+14)(x-14)$", decision: "Keep the 2 in the answer: it is a factor, not something to divide away.", earns: ["MW1"] },
      ],
    },
  },
  {
    replaces: "Take $\\frac{2x^{2}-128}{x^{2}+17x+72}$",
    see: {
      type: "see",
      kind: "calculation",
      stem: "Simplify $\\dfrac{2x^{2}-128}{x^{2}+17x+72}$.",
      steps: [
        { n: 1, working: "$2x^{2}-128 = 2(x^{2}-64) = 2(x+8)(x-8)$", decision: "Top: common factor first, then two squares.", earns: ["MW1"] },
        { n: 2, working: "$x^{2}+17x+72 = (x+8)(x+9)$", decision: "Bottom: $8 \\times 9 = 72$ and $8 + 9 = 17$.", earns: ["MW1"] },
        { n: 3, working: "$\\dfrac{2(x+8)(x-8)}{(x+8)(x+9)} = \\dfrac{2(x-8)}{x+9}$", decision: "Strike $(x+8)$, the factor both lines share; nothing else divides both.", earns: ["W1"] },
      ],
    },
  },
  {
    replaces: "In $\\frac{8}{4(x-7)}$ the 8 and the 4 share a 4",
    see: {
      type: "see",
      kind: "calculation",
      stem: "Simplify $\\dfrac{8}{4(x-7)}$ fully.",
      steps: [
        { n: 1, working: "$8 = 4 \\times 2$", decision: "Look at the numbers: 8 and 4 share a factor of 4." },
        { n: 2, working: "$\\dfrac{8}{4(x-7)} = \\dfrac{2}{x-7}$", decision: "Divide the 4 out of both lines. Multiplying the bracket out to $\\dfrac{8}{4x-28}$ would only hide that factor.", earns: ["W1"] },
      ],
    },
  },
  {
    replaces: "So $\\frac{5x^{2}}{x}$ is not finished",
    see: {
      type: "see",
      kind: "calculation",
      stem: "Simplify $\\dfrac{5x^{2}}{x}$, then $\\dfrac{12x}{3x}$.",
      steps: [
        { n: 1, working: "$\\dfrac{5x^{2}}{x} = \\dfrac{5x \\times x}{x} = 5x$", decision: "A lone $x$ divides both lines, so it is a common factor too." },
        { n: 2, working: "$\\dfrac{12x}{3x} = 4$", decision: "Both the $x$ and the 3 divide out, leaving a whole number." },
      ],
    },
  },
  {
    replaces: "**'Hence' hands you the top.**",
    keep: "**'Hence' hands you the top.** One part may ask you to expand, and the next to simplify fully using it (2019). Collect the new numerator, then factorise it and keep the number you take out.",
    see: {
      type: "see",
      kind: "calculation",
      stem: "Part (i) gave the numerator $3x^{2}+24x$. Hence simplify $\\dfrac{3x^{2}+24x}{x^{2}-64}$ fully.",
      steps: [
        { n: 1, working: "$3x^{2}+24x = 3x(x+8)$", decision: "Factorise the line you were given, and keep what comes out.", earns: ["MW1"] },
        { n: 2, working: "$x^{2}-64 = (x+8)(x-8)$", decision: "The bottom is a square minus a square: $64 = 8^{2}$.", earns: ["MW1"] },
        { n: 3, working: "$\\dfrac{3x(x+8)}{(x+8)(x-8)} = \\dfrac{3x}{x-8}$", decision: "Divide out $(x+8)$; nothing else divides both lines.", earns: ["W1"] },
      ],
    },
  },
];

/** The trial note with each worked paragraph replaced by its See it (and the paragraph's explaining words kept where given). */
function converted(blocks: Block[]): Block[] {
  const out: Block[] = [];
  for (const b of blocks) {
    const hit = b.type === "p" ? TRIAL_SEE_ITS.find((s) => String(b.md).startsWith(s.replaces)) : undefined;
    if (!hit) {
      out.push(b);
      continue;
    }
    if (hit.keep) out.push({ type: "p", md: hit.keep });
    out.push(hit.see);
  }
  return out;
}

const readJson = (file: string) => JSON.parse(fs.readFileSync(file, "utf8"));

describe("the trial topic in the See it shape (the proposal to the content session)", () => {
  const blocks = readJson(path.join(TRIAL, "note.blocks.json")) as Block[];
  const bundle = readJson(path.join(TRIAL, "bundle.json")) as { prompts: RetrievalPrompt[] };
  const after = converted(blocks);

  it("replaces the eight worked paragraphs, and nothing else", () => {
    expect(after.filter((b) => b.type === "see")).toHaveLength(TRIAL_SEE_ITS.length);
    // Every paragraph named is in the note today (an edit to the note would show here first).
    for (const s of TRIAL_SEE_ITS) expect(blocks.some((b) => b.type === "p" && String(b.md).startsWith(s.replaces)), s.replaces).toBe(true);
    const ids = (list: Block[]) => list.filter((b) => b.type === "gate").map((b) => b.id);
    expect(ids(after)).toEqual(ids(blocks));
  });

  it("passes the schema, the build's lint and the readiness structure", () => {
    const r = NoteBlocks.safeParse(after);
    expect(r.success, r.success ? "" : JSON.stringify(r.error.issues.slice(0, 5))).toBe(true);
    expect(lintNoteBlocks(after, "trial", bundle)).toEqual([]);
    expect(noteStructure(after)).toEqual({ ok: true, problems: [] });
  });

  it("deals a v3 deck: every Your turn after a See it of its own, the first a real one, no See it printing its answer", () => {
    const deck = buildDeck(after, bundle.prompts);
    expect(deckGateIds(deck.cards)).toEqual(["g2", "g12", "g9", "g13", "g4", "g10", "g11", "g8"]);
    expect(deckRuleViolations(deck.cards)).toEqual([]);
    expect(seeAnswerPrinted(deck.cards)).toEqual([]);
    expect(deck.stats).toMatchObject({ gates: 8, sees: 8, recall: 2, videos: 1 });
    const firstSee = deck.cards.findIndex((c) => c.kind === "see");
    const firstGate = deck.cards.findIndex((c) => c.kind === "gate");
    expect(firstGate).toBe(firstSee + 1);
    // g4 follows the three moves' See it and the video beside it.
    const g4 = deck.cards.findIndex((c) => c.kind === "gate" && c.gate.id === "g4");
    expect(deck.cards.slice(g4 - 2, g4).map((c) => (c.kind === "media" ? c.block.type : c.kind))).toEqual(["see", "video"]);
    expect((deck.cards[g4] as GateCard).seeKey).toBe("see:the-three-moves:1");
  });

  it("keeps its registered enrichment: the figure she acts on after the three moves' See it, the drawing on card 2, g2's consequence", () => {
    const deck = deckFor(TRIAL_ID, after, bundle.prompts);
    const at = deck.cards.findIndex((c) => c.kind === "interaction");
    expect(deck.cards[at - 1]?.key).toBe("see:the-three-moves:1");
    expect(deck.cards[at + 1]).toMatchObject({ kind: "media", block: { type: "video" } });
    const keys = deck.cards.map((c) => c.key);
    const enrichment = enrichmentFor(TRIAL_ID)!;
    for (const key of Object.keys(enrichment.illustrations ?? {})) expect(keys).toContain(key);
    for (const gateId of Object.keys(enrichment.reactions ?? {})) expect(keys).toContain(`gate:${gateId}`);
    // The topic's first See it is shown, never typed.
    expect((deck.cards.find((c) => c.kind === "see") as SeeCard).typed).toBeNull();
    console.log(`[slides] the trial in the See it shape: ${deck.stats.cards} cards, ${deck.stats.sees} see its, ${deck.stats.gates} your turns, about ${deck.stats.minutes} minutes`);
  });
});
