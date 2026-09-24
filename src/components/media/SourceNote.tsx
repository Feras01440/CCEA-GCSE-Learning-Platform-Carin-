"use client";

import type { ReactNode } from "react";
import { ChevronDown } from "lucide-react";
import { clsx } from "clsx";
import { recessCls } from "@/components/items/ui";

/**
 * Where a video, a simulation or a photograph comes from, and on what licence: one tap away under "Source", in a
 * recess when open (01-art-direction.md §8). Four lines of licence text in the middle of a lesson become one quiet
 * word; nothing is hidden, and the credit is always one tap from the thing it credits.
 */
export function SourceNote({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <details className={clsx("group font-sans", className)}>
      <summary className="tap inline-flex cursor-pointer list-none items-center gap-1 rounded-[var(--radius-sm)] text-meta text-ink-2 hover:text-ink [&::-webkit-details-marker]:hidden">
        Source
        <ChevronDown size={16} strokeWidth={1.5} aria-hidden className="transition-transform duration-[var(--dur)] ease-[var(--ease-out)] group-open:rotate-180 motion-reduce:transition-none" />
      </summary>
      <div className={clsx(recessCls, "mb-2 text-meta text-ink-2")}>{children}</div>
    </details>
  );
}
