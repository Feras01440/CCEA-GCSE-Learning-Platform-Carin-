/**
 * The evidence for Slides and Read v2 on the migrated notes (the lead, 27 Sep 2026: "when your generator and renderer
 * pass on all of them, that is the evidence I need"): every note that holds a See it, read from its pack
 * (packs/…/note.blocks.json and bundle.json, as the lead asked: never the rebuilt public copy), is built into its deck
 * and every card is drawn, server-side, in
 * every state a card can be in: a See it with all its steps (and its typed step shown); a Your turn open, answered
 * right, re-taught after a miss on each wrong option, and answered after the re-teach; its twin as the retry; the
 * callouts, the recap, the pointer, the recall cards. Read v2 draws each note whole, every Your turn answered right,
 * then every one missed. Nothing may throw; every See it shows all its steps with their reasons; every option and every
 * question has a name a screen reader can say; every re-teach on an option with a note shows that note before the
 * explanation.
 */
import { Fragment, createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { StepRevealNote, type NoteBlock } from "@/components/items/StepRevealNote";
import { shownOptions, deckGateOrders } from "@/lib/gate-order";
import { buildDeck, withRetries, type Card, type GateCard } from "@/lib/slides/cards";
import { enrichmentFor } from "@/lib/slides/enrichment";
import { packTopics } from "@/lib/slides/packs-corpus.test-helper";
import { hasSeeBlock } from "@/lib/slides/readiness";
import { answerNote, gateNote } from "@/lib/slides/run";
import { optionNoteFor, twinGate, twinOptions } from "@/lib/slides/see";
import { lessonBlocks, heroDataFor, lessonSections } from "@/components/topic/lesson-plan";
import { calloutParts, gateParts, ideaParts, mediaParts, pointerParts, recallParts, recapParts, reteachParts, seeParts, type CardParts } from "./cards";

const migrated = packTopics()
  .filter((t) => hasSeeBlock(t.blocks))
  .map((t) => ({ topic: { id: t.topicId }, noteBlocks: t.blocks, prompts: t.bundle.prompts, workedExamples: t.bundle.workedExamples }));

const html = (parts: CardParts) => renderToStaticMarkup(createElement(Fragment, null, parts.eyebrow, parts.title, parts.left, parts.right));
const noop = () => undefined;
/** Every accessible name on radios and radiogroups in the markup, which must say something. */
const names = (markup: string) => [...markup.matchAll(/role="radio(?:group)?"[^>]*?aria-label="([^"]*)"/g)].map((m) => m[1]!);

function drawCard(cards: readonly Card[], at: number, id: string): string[] {
  const card = cards[at]!;
  const drawn: string[] = [];
  switch (card.kind) {
    case "idea":
      drawn.push(html(ideaParts(card, null)));
      break;
    case "media":
      drawn.push(html(mediaParts(card, cards[at + 1]?.kind === "gate")));
      break;
    case "see": {
      const steps = card.see?.steps.length ?? 0;
      for (const typedResult of card.typed === null ? [null] : [null, { shown: true } as const]) {
        const markup = html(seeParts(card, { revealed: steps, typedResult, onTyped: noop, animateLast: false, onSkip: null }));
        const shown = (markup.match(/\sdata-step="\d+"/g) ?? []).length;
        expect(shown, `${id} ${card.key}: every step shown`).toBe(steps);
        drawn.push(markup);
      }
      break;
    }
    case "gate": {
      const orders = deckGateOrders(cards.filter((c): c is GateCard => c.kind === "gate" && !c.retry).map((c) => c.gate));
      const options = card.gate.kind === "choice" ? shownOptions(card.gate, orders) : [];
      const base = { asked: card.gate, selected: null, onSelect: noop, reactionId: null, options, note: gateNote(card), meta: "" };
      drawn.push(html(gateParts(card, { ...base, answer: null, phase: "open" })));
      drawn.push(html(gateParts(card, { ...base, answer: { answer: card.gate.answer, correct: true, record: "recorded" }, phase: "answer", meta: answerNote(card, true, "recorded") })));
      const wrongs = card.gate.kind === "choice" ? (card.gate.options ?? []).filter((o) => o.trim() !== card.gate.answer.trim()) : ["0"];
      for (const hers of wrongs) {
        const reteach = html(reteachParts(card, card.gate, { hers, reactionId: null, see: null }));
        const note = optionNoteFor(card.gate, hers);
        if (note) expect(reteach.indexOf("data-option-note"), `${id} ${card.key}: the note on "${hers}" is shown`).toBeGreaterThan(-1);
        drawn.push(reteach);
        drawn.push(html(gateParts(card, { ...base, answer: { answer: hers, correct: false, record: "recorded" }, phase: "answer", meta: answerNote(card, false, "recorded") })));
      }
      // Its retry: the twin on new numbers, where it has one.
      const retry = withRetries(cards, [card.gate.id]).find((c) => c.key === `retry:${card.gate.id}`) as GateCard | undefined;
      const twin = retry?.twin ? twinGate(card.gate) : null;
      if (retry && twin) {
        const twinOrder = twin.kind === "choice" ? twinOptions(twin, options.findIndex((o) => o.trim() === card.gate.answer.trim())) : [];
        drawn.push(html(gateParts(retry, { ...base, asked: twin, options: twinOrder, answer: null, phase: "open", note: gateNote(retry) })));
      }
      break;
    }
    case "callout":
      drawn.push(html(calloutParts(card)));
      break;
    case "recap":
      drawn.push(html(recapParts(card, null, null)));
      break;
    case "pointer":
      drawn.push(html(pointerParts(card)));
      break;
    case "recall":
      drawn.push(html(recallParts(card, { revealed: false, typed: "", onType: noop, graded: null, skipped: false })));
      drawn.push(html(recallParts(card, { revealed: true, typed: "the answer", onType: noop, graded: "good", skipped: false })));
      break;
    default:
      break;
  }
  return drawn;
}

describe("Slides and Read v2 draw every migrated note", () => {
  it(`finds the migrated notes (${migrated.length} on disk)`, () => {
    expect(migrated.length).toBeGreaterThan(0);
    console.log(`[slides] migrated notes drawn: ${migrated.map((b) => b.topic.id).join(", ")}`);
  });

  it("re-teaches every Your turn that names its step with that step of its own See it (b2/natural-selection's g4 included)", () => {
    let pointed = 0;
    for (const b of migrated) {
      const deck = buildDeck(b.noteBlocks, b.prompts, enrichmentFor(b.topic.id), { workedExamples: b.workedExamples });
      for (const c of deck.cards) {
        if (c.kind !== "gate" || c.retry) continue;
        const see = deck.cards.find((d) => d.key === c.seeKey);
        const k = /\bstep\s+(\d+)\s+of\s+(?:the\s+)?see\s+it\b/i.exec(c.gate.explain)?.[1];
        if (!k || see?.kind !== "see") continue;
        const hers = c.gate.kind === "choice" ? (c.gate.options ?? []).find((o) => o.trim() !== c.gate.answer.trim()) ?? "0" : "0";
        const markup = html(reteachParts(c, c.gate, { hers, reactionId: null, see }));
        const has = see.see?.steps.some((s) => String(s.n) === k) ?? false;
        expect(markup.includes(`data-reteach-step="${k}"`), `${b.topic.id} ${c.gate.id}: step ${k}`).toBe(has);
        if (has) pointed += 1;
      }
    }
    console.log(`[slides] re-teaches that show the step they point at: ${pointed}`);
    expect(pointed).toBeGreaterThan(0);
  });

  for (const b of migrated) {
    it(`Slides: every card of ${b.topic.id}, in every state`, () => {
      const deck = buildDeck(b.noteBlocks, b.prompts, enrichmentFor(b.topic.id), { workedExamples: b.workedExamples });
      let drawn = 0;
      deck.cards.forEach((_, at) => {
        for (const markup of drawCard(deck.cards, at, b.topic.id)) {
          drawn += 1;
          for (const n of names(markup)) expect(n.trim().length, `${b.topic.id} card ${at + 1}: an empty name`).toBeGreaterThan(0);
        }
      });
      expect(drawn).toBeGreaterThan(deck.cards.length / 2);
    });

    it(`Read v2: ${b.topic.id} whole, every Your turn right, then every one missed`, () => {
      const hero = heroDataFor(b.noteBlocks);
      const blocks = lessonBlocks(b.noteBlocks!, hero.lede) as NoteBlock[];
      const sections = lessonSections(b.noteBlocks, hero.lede);
      const gates = blocks.filter((x): x is Extract<NoteBlock, { type: "gate" }> => x.type === "gate");
      const render = (outcomes: Record<string, { correct: boolean; answer: string | null }>) =>
        renderToStaticMarkup(
          createElement(StepRevealNote, {
            blocks,
            onGate: noop,
            workedExamples: b.workedExamples,
            sections: sections.map((s) => ({ n: s.n, minutes: s.minutes })),
            initialOutcomes: outcomes,
            paced: { open: sections.length, onContinue: noop, titles: sections.map((s) => s.title) },
          }),
        );
      const right = render(Object.fromEntries(gates.map((g) => [g.id, { correct: true, answer: g.answer }])));
      const wrong = render(Object.fromEntries(gates.map((g) => [g.id, { correct: false, answer: g.kind === "choice" ? (g.options ?? []).find((o) => o.trim() !== g.answer.trim()) ?? null : "0" }])));
      for (const markup of [right, wrong]) {
        // Every See it with all its steps: the Your turn after it is answered, so it opens complete.
        const see = blocks.filter((x) => x.type === "see").length;
        expect((markup.match(/\sdata-see-it="\d+"/g) ?? []).length, `${b.topic.id}: every See it drawn`).toBe(see);
        expect(markup).not.toContain("data-next-step");
        for (const n of names(markup)) expect(n.trim().length, `${b.topic.id}: an empty name`).toBeGreaterThan(0);
      }
      expect((right.match(/>Yes\.</g) ?? []).length).toBe(gates.length);
      expect((wrong.match(/Missed on an earlier visit\./g) ?? []).length).toBe(gates.length);
    });
  }
});
