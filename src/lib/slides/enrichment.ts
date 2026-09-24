/**
 * What a topic's Slides carry beyond its note: pure descriptors keyed by topic id, safe to import on the server (the
 * static route counts cards with them) and in the generator's tests. The drawings and interactions themselves are
 * React components in src/components/slides/enrich/*, keyed by the same ids; this file names them, nothing more.
 *
 * A descriptor never edits the bundle. It may add a figure she acts on after a named card, and it says which cards
 * carry a registered illustration or a registered reaction in place of the note's own SVG.
 */
import type { SlidesEnrichment } from "./cards";

export interface SlidesEnrichmentSpec extends SlidesEnrichment {
  /** Card keys whose illustration is drawn in code, by the id the component registry knows. */
  illustrations?: Record<string, string>;
  /** Gate ids whose verdict draws a consequence, by the id the component registry knows. */
  reactions?: Record<string, string>;
  /** Recap glyph ids by line index. */
  recapGlyphs?: string[];
}

export const ENRICHMENT: Record<string, SlidesEnrichmentSpec> = {
  "fm.u1.algebraic-fractions-simplify": {
    // The figure she acts on (art direction v2 §3.3, "Tap to cancel"): after the card that states moves 2 and 3.
    interactions: [{ after: "idea:the-three-moves:2", id: "afs.tap-to-cancel" }],
    illustrations: {
      title: "afs.cancel",
      "idea:why-cancelling-works-and-when-it-does-not:1": "afs.cancel",
    },
    reactions: { g2: "afs.substitute" },
    recapGlyphs: ["factorise", "cancel", "numbers"],
  },
};

export function enrichmentFor(topicId: string): SlidesEnrichmentSpec | null {
  return ENRICHMENT[topicId] ?? null;
}
