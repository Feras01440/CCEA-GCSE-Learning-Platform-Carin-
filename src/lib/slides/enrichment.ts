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
    // The figure she acts on (art direction v2 §3.3, "Tap to cancel"): after the card that works the three moves in
    // front of her, so the strikes are hers to make once she has seen them made; then the video, then g4. That card is
    // the See it once the note is converted to the See it shape (see-it-block-shape.md), and the worked paragraph today.
    interactions: [{ after: ["see:the-three-moves:1", "idea:the-three-moves:2"], id: "afs.tap-to-cancel" }],
    // The note's hero figure, drawn in the grammar: on the title card and on the card that reads it ("In the drawing
    // at the top…"), where it carries the hero figure's own caption.
    illustrations: {
      title: "afs.cancel",
      "idea:why-cancelling-works-and-when-it-does-not:1": "afs.cancel",
    },
    // g2's explanation tests the cancel with x = 1 (5 against her 4 or 1): the consequence draws that test.
    reactions: { g2: "afs.substitute" },
    // One glyph a line of "You can now", in the note's order: factorise; cancel only factors; finish on the numbers and
    // any lone x; turn a division into a multiplication.
    recapGlyphs: ["factorise", "cancel", "numbers", "divide"],
  },
};

export function enrichmentFor(topicId: string): SlidesEnrichmentSpec | null {
  return ENRICHMENT[topicId] ?? null;
}
