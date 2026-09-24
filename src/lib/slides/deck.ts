/**
 * The deck of a shipped topic, with its registered enrichment: the one call the static route, the topic hero and the
 * runner share, so every surface counts the same cards.
 */
import type { RetrievalPrompt } from "@/lib/content/schema";
import { buildDeck, type Deck } from "./cards";
import { enrichmentFor } from "./enrichment";

export function deckFor(topicId: string, blocks: readonly unknown[] | null | undefined, prompts: readonly RetrievalPrompt[] = []): Deck {
  return buildDeck(blocks, prompts, enrichmentFor(topicId));
}

/** "25" on the hero's button: the card count as the title card will state it. */
export function slidesCardCount(topicId: string, blocks: readonly unknown[] | null | undefined, prompts: readonly RetrievalPrompt[] = []): number {
  return deckFor(topicId, blocks, prompts).stats.cards;
}
