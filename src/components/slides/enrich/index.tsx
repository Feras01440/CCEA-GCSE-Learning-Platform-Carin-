"use client";

/**
 * The component registry behind src/lib/slides/enrichment.ts: the ids the descriptors name, drawn. A topic without an
 * entry here shows its note's own figures and has no figure to act on; nothing is invented for it.
 */
import type { ComponentType } from "react";
import { FigCancel, RecapGlyph, Substitute, TapToCancel, isRecapGlyph, type TapResult } from "./afs";
import { PILLS, type TapState } from "./afs-model";

export interface InteractionProps {
  onChecked: (r: TapResult) => void;
  checked: TapResult | null;
  /** Counts up each time the frame's Check is pressed; the interaction marks itself then. */
  checkSignal: number;
  /** What she has done to the figure, kept by the run so it survives a card change and a reload. */
  state?: TapState;
  onState?: (s: TapState) => void;
}

export interface ReactionProps {
  /** The option she chose, as authored. */
  hers: string;
  correct: boolean;
}

export const ILLUSTRATIONS: Record<string, ComponentType<{ className?: string; variant?: "title" | "idea" }>> = {
  "afs.cancel": FigCancel,
};

export interface InteractionSpec {
  Component: ComponentType<InteractionProps>;
  title: string;
  verb: string;
  caption: string;
  /**
   * The pieces the figure is drawn with, by id. A run kept from an earlier build that names a piece not in this list was
   * made on a different drawing, so the figure starts afresh rather than showing a "done" over pieces left unstruck.
   */
  pills: readonly string[];
}

export const INTERACTIONS: Record<string, InteractionSpec> = {
  "afs.tap-to-cancel": {
    Component: TapToCancel,
    // The note's third move in its own words: "strike every factor both lines share, numbers included, and check that
    // nothing else divides both".
    title: "Strike every factor both lines share",
    verb: "Tap a factor on the top line, then its match underneath. When nothing else divides both lines, press Check.",
    caption: "The numbers are factors too. What is left unstruck is the answer.",
    pills: PILLS.map((p) => p.id),
  },
};

export const REACTIONS: Record<string, ComponentType<ReactionProps>> = {
  "afs.substitute": Substitute,
};

/** A recap line's drawn glyph, or nothing when the descriptor names one the registry does not draw. */
export function RecapGlyphFor({ kind, size }: { kind: string; size?: number }) {
  return isRecapGlyph(kind) ? <RecapGlyph kind={kind} size={size} /> : null;
}

export { isRecapGlyph };
