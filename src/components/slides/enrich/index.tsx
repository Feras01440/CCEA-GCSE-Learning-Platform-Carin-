"use client";

/**
 * The component registry behind src/lib/slides/enrichment.ts: the ids the descriptors name, drawn. A topic without an
 * entry here shows its note's own figures and has no figure to act on; nothing is invented for it.
 */
import type { ComponentType } from "react";
import { FigCancel, RecapGlyph, Substitute, TapToCancel, type TapResult } from "./afs";
import type { TapState } from "./afs-model";

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

/** What each registered illustration shows, said under it on an idea card; it names the drawing's own factors. */
export const ILLUSTRATION_CAPTIONS: Record<string, string> = {
  "afs.cancel": "Both lines are multiplied by 3 and by (x + 7), so both divide out. A term never does.",
};

export const INTERACTIONS: Record<string, { Component: ComponentType<InteractionProps>; title: string; verb: string; caption: string }> = {
  "afs.tap-to-cancel": {
    Component: TapToCancel,
    title: "Cancel every factor on both lines",
    verb: "Tap a factor on the top line, then its match underneath. When nothing is shared any more, press Check.",
    caption: "The numbers are factors too. That last look is where the marks go.",
  },
};

export const REACTIONS: Record<string, ComponentType<ReactionProps>> = {
  "afs.substitute": Substitute,
};

export function RecapGlyphFor({ kind, size }: { kind: string; size?: number }) {
  return <RecapGlyph kind={kind} size={size} />;
}
