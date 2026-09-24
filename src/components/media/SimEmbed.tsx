"use client";

import { useState } from "react";
import { MousePointerClick } from "lucide-react";
import { clsx } from "clsx";
import { SourceNote } from "./SourceNote";

export interface SimRef {
  provider: "phet" | "geogebra";
  url: string;
  title: string;
  /** Attribution text required by the licence, kept whole under "Source". */
  attribution: string;
  licence: string;
  /** The task she does inside the sim; a sim without a task is decoration. */
  task?: string;
  height?: number;
}

const HOST: Record<SimRef["provider"], { host: string; name: string }> = {
  phet: { host: "phet.colorado.edu", name: "PhET Interactive Simulations" },
  geogebra: { host: "geogebra.org", name: "GeoGebra" },
};

/**
 * An interactive simulation loaded on demand (PhET: CC BY-NC 4.0 with attribution and the PhET logo, which the
 * simulation itself shows; GeoGebra: "Made with GeoGebra®", shown by the applet). Online only.
 *
 * Closed, it is a row like a video's (01-art-direction.md §8): what it is, where it loads from, one control. The task
 * stays above it, because a simulation without a task is decoration; the licence text lives under "Source".
 */
export function SimEmbed({ sim, className = "" }: { sim: SimRef; className?: string }) {
  const [open, setOpen] = useState(false);
  const height = sim.height ?? 504;
  const host = HOST[sim.provider];
  return (
    <div className={clsx("my-5 font-sans", className)}>
      {sim.task && (
        <p className="mb-2 text-ui text-ink">
          <span className="font-medium">Try this: </span>
          {sim.task}
        </p>
      )}
      {open ? (
        <div className="overflow-hidden rounded-[var(--radius-sm)] border border-line-2 bg-surface-2" style={{ minHeight: height }}>
          <iframe src={sim.url} title={sim.title} width="100%" height={height} allowFullScreen className="block w-full" />
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="flex min-h-[52px] w-full items-center gap-3 rounded-[var(--radius)] border border-line-2 bg-surface p-2 text-left hover:bg-surface-2 sm:gap-4"
        >
          <span aria-hidden className="grid h-[63px] w-[112px] shrink-0 place-items-center rounded-[var(--radius-sm)] bg-surface-2 text-ink-2 md:h-[90px] md:w-[160px]">
            <MousePointerClick size={20} strokeWidth={1.5} />
          </span>
          <span className="min-w-0 py-1">
            <span className="block text-ui font-medium leading-snug text-ink">Open the simulation: {sim.title}</span>
            <span className="mt-0.5 block text-meta text-ink-2">Loads from {host.host} · online only</span>
          </span>
        </button>
      )}
      <SourceNote>
        {sim.attribution} · {sim.licence}
      </SourceNote>
    </div>
  );
}
