/**
 * The deck of a shipped topic, with its registered enrichment: the one call the static route, the topic hero and the
 * runner share, so every surface counts the same cards. Pass the bundle's worked examples too wherever the note may
 * hold a See it that names one, so its steps are known (the count is the same without them; the minutes are not).
 */
import type { RetrievalPrompt, WorkedExample } from "@/lib/content/schema";
import { buildDeck, type Deck } from "./cards";
import { enrichmentFor } from "./enrichment";

type WorkedExampleLike = Pick<WorkedExample, "id" | "stem" | "steps" | "finalAnswer" | "figure">;

export function deckFor(
  topicId: string,
  blocks: readonly unknown[] | null | undefined,
  prompts: readonly RetrievalPrompt[] = [],
  workedExamples: readonly WorkedExampleLike[] | null = null,
): Deck {
  return buildDeck(blocks, prompts, enrichmentFor(topicId), { workedExamples });
}

/** "25" on the hero's button: the card count as the title card will state it. */
export function slidesCardCount(
  topicId: string,
  blocks: readonly unknown[] | null | undefined,
  prompts: readonly RetrievalPrompt[] = [],
  workedExamples: readonly WorkedExampleLike[] | null = null,
): number {
  return deckFor(topicId, blocks, prompts, workedExamples).stats.cards;
}
