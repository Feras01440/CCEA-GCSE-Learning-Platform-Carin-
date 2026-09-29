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
  /**
   * The recap's glyphs, each by the words its line opens with (lower case), never by the line's place: a line the note
   * adds, drops or reorders can then never be drawn with another line's picture (recapGlyphsFor).
   */
  recapGlyphs?: Array<{ opens: string; glyph: string }>;
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
    // One glyph a line of "You can now", each found by what its line says: factorise both lines; cancel only factors;
    // finish on the numbers and any lone x; turn a division into a multiplication; read the newest shapes the other way
    // round, the number first (the v3 note's fifth line, 29 Sep 2026).
    recapGlyphs: [
      { opens: "factorise both lines", glyph: "factorise" },
      { opens: "cancel only factors", glyph: "cancel" },
      { opens: "finish on the numbers", glyph: "numbers" },
      { opens: "turn a division into a multiplication", glyph: "divide" },
      { opens: "read the newest shapes", glyph: "reverse" },
    ],
  },
};

export function enrichmentFor(topicId: string): SlidesEnrichmentSpec | null {
  return ENRICHMENT[topicId] ?? null;
}

/**
 * The glyph for each line of a recap, found by what the line says (its opening words, as the enrichment lists them),
 * never by where it stands, so a picture can never sit beside another line's words (the owner: no contradiction between
 * a picture and its prose). All or nothing: when any line has no glyph of its own, none is drawn and every line keeps
 * the plain marker, so the list reads as one kind of list. Null when the topic registers no glyphs.
 */
export function recapGlyphsFor(lines: readonly string[], spec: SlidesEnrichmentSpec | null): string[] | null {
  const table = spec?.recapGlyphs ?? [];
  if (table.length === 0 || lines.length === 0) return null;
  const glyphs = lines.map((line) => table.find((g) => line.trim().toLowerCase().startsWith(g.opens))?.glyph ?? null);
  return glyphs.every((g): g is string => g !== null) ? glyphs : null;
}
