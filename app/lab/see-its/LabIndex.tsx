"use client";

import { useRef, useState } from "react";
import { clsx } from "clsx";
import type { LabCase } from "./cases";

const toolCls = "tap rounded-[8px] border border-line-3 bg-surface px-3 py-1.5 text-[14px] font-medium text-ink-2 hover:bg-surface-2 hover:text-ink";

type Width = 390 | 1280;
const SIZES: Record<Width, { w: number; h: number; label: string }> = {
  390: { w: 390, h: 844, label: "Phone · 390 × 844" },
  1280: { w: 1280, h: 800, label: "Desktop · 1280 × 800" },
};

/** The lab page: a width switch and the cases, each in a frame of that size with its own controls inside. */
export function LabIndex({ cases }: { cases: Array<LabCase & { href: string }> }) {
  const [width, setWidth] = useState<Width>(390);
  const size = SIZES[width];
  const frames = useRef<Record<string, HTMLIFrameElement | null>>({});
  // The frame is the real card, untouched; the lab's three actions reach it by message, as its keys do.
  const send = (id: string, lab: "step" | "all" | "again") => frames.current[id]?.contentWindow?.postMessage({ lab }, window.location.origin);
  return (
    <main className="mx-auto max-w-[1400px] px-6 py-8 font-sans text-ink" data-lab-see-its>
      <h1 className="font-serif-lesson text-[26px] font-medium">The twelve longest See its, in the Slides frame</h1>
      <p className="mt-2 max-w-[70ch] text-[15px] text-ink-2">
        Each frame is the real card, header to foot: its Continue shows the next step; the buttons beside it show the next step, every step at once, or start it again (inside a frame, the keys
        are → or Enter, A and R). &ldquo;Open on its own&rdquo; measures a case at any window size. Nothing here is recorded.
      </p>
      <div role="radiogroup" aria-label="Frame size" className="mt-5 flex gap-2">
        {(Object.keys(SIZES) as unknown as Width[]).map((w) => (
          <button
            key={w}
            type="button"
            role="radio"
            aria-checked={width === Number(w)}
            onClick={() => setWidth(Number(w) as Width)}
            data-lab-width={w}
            className={clsx("tap rounded-[10px] border px-4 py-2 text-[15px] font-medium", width === Number(w) ? "border-ink bg-surface text-ink shadow-[inset_0_0_0_1px_var(--ink)]" : "border-line-3 bg-surface text-ink-2 hover:bg-surface-2")}
          >
            {SIZES[w].label}
          </button>
        ))}
      </div>
      <ol className="mt-8 flex flex-col gap-10">
        {cases.map((c, i) => (
          <li key={`${c.topicId}:${c.block}`} data-lab-case={`${c.topicId}:${c.block}`} data-href={c.href} data-steps={c.steps} data-answer={c.answer ? "1" : "0"} data-figure={c.figure ? "1" : "0"} data-typed={c.typed ? "1" : "0"}>
            <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
              <span className="tnum text-[13px] text-ink-3">{i + 1}</span>
              <span className="font-medium">{c.title}</span>
              <span className="text-[13px] text-ink-2">
                {c.subject} · {c.unit} · {c.slug} · block {c.block} · {c.steps} steps · {c.words} words{c.figure ? " · figure" : ""}
                {c.typed ? " · a typed step" : ""}
                {c.answer ? " · answer line" : ""}
              </span>
              <a href={c.href} target="_blank" rel="noreferrer" className="text-[13px] font-medium text-ink-2 underline decoration-accent underline-offset-[3px] hover:text-ink" data-lab-open>
                Open on its own
              </a>
            </div>
            <p className="mt-1 max-w-[80ch] font-serif-lesson text-[15px] text-ink-2">{c.stem.replace(/\$\$?[^$]*\$\$?/g, " … ").replace(/\s+/g, " ")}</p>
            <div className="mt-2 flex flex-wrap gap-2">
              <button type="button" className={toolCls} onClick={() => send(`${c.topicId}:${c.block}`, "step")} data-lab-step>
                Next step
              </button>
              <button type="button" className={toolCls} onClick={() => send(`${c.topicId}:${c.block}`, "all")} data-lab-all>
                Show every step
              </button>
              <button type="button" className={toolCls} onClick={() => send(`${c.topicId}:${c.block}`, "again")} data-lab-again>
                Step through again
              </button>
            </div>
            <div className="mt-3 overflow-x-auto">
              <iframe
                ref={(el) => {
                  frames.current[`${c.topicId}:${c.block}`] = el;
                }}
                title={`${c.title}, See it ${c.nth} of ${c.seeCount}`}
                src={c.href}
                width={size.w}
                height={size.h}
                loading="lazy"
                className="block rounded-[14px] border border-line-2 bg-surface"
                style={{ width: size.w, height: size.h }}
              />
            </div>
          </li>
        ))}
      </ol>
    </main>
  );
}
