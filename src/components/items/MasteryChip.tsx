"use client";

/**
 * The cairn glyph: three stacked stones, filled to the mastery level, with the level in
 * words beside it (never colour alone). Tapping explains what the next level needs and
 * how recent the evidence is.
 *
 * The stones are the redrawn cairn's mark (CairnArt.tsx CairnMark, art direction v2's craft floor), not the symmetric
 * pills the owner ruled out on 23 Sep: the same three hand-drawn stones, base first, each filled once the level reaches
 * it and otherwise a faint stone-shaped place.
 */
import { useId, useState } from "react";
import { clsx } from "clsx";
import { levelLabel, nextStepHint, type MasteryLevel } from "@/lib/mastery/engine";
import { relativeTime } from "./format";

export type { MasteryLevel } from "@/lib/mastery/engine";

export interface MasteryChipProps {
  level: MasteryLevel;
  lastEvidenceAt?: Date | string | null;
  /** e.g. "Drops to Familiar if not reviewed by Friday". */
  decayHint?: string;
  onClick?: () => void;
  size?: "sm" | "md";
  className?: string;
}

/** Stones filled per level: attempted shows an outlined base, familiar 1, proficient 2, mastered 3. */
export function stonesFor(level: MasteryLevel): number {
  switch (level) {
    case "familiar":
      return 1;
    case "proficient":
      return 2;
    case "mastered":
      return 3;
    default:
      return 0;
  }
}

/** CairnMark's three stones (CairnArt.tsx), base first, and the weight each carries in the mark. */
export const MARK_STONES = [
  { d: "M1.5 19 C2.5 15 9 13.8 13.5 14.2 C18.5 14.6 22.5 16.5 22.5 19.4 C22.5 22 18 23.2 12 23.2 C6 23.2 1.5 22.2 1.5 19 Z", opacity: 1 },
  { d: "M4.6 14 C5.4 10.6 10 9.4 14 9.8 C17.8 10.2 20 12 19.4 14.4 C18.8 16.4 15 17.2 10.8 17.1 C7 17 4.2 16.2 4.6 14 Z", opacity: 0.84 },
  { d: "M8 9.6 C8.6 6.6 12.2 5.4 15.2 6 C17.8 6.5 18.8 8.6 17.8 10.6 C16.8 12.2 13.2 12.6 10.6 12.1 C8.6 11.7 7.6 10.9 8 9.6 Z", opacity: 0.68 },
] as const;

export function Stones({ level, size = 18 }: { level: MasteryLevel; size?: number }) {
  const filled = stonesFor(level);
  const attempted = level === "attempted";
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden className="shrink-0 overflow-visible">
      {MARK_STONES.map((s, i) => {
        const on = i < filled;
        // Attempted: the base stone's place, drawn as a dashed outline; a stone not yet reached is a faint place.
        if (attempted && i === 0) return <path key={i} d={s.d} fill="none" stroke="currentColor" strokeWidth={1.2} strokeDasharray="2 1.5" opacity={0.7} />;
        return <path key={i} d={s.d} fill="currentColor" opacity={on ? s.opacity : 0.16} />;
      })}
    </svg>
  );
}

export function MasteryChip({ level, lastEvidenceAt, decayHint, onClick, size = "md", className }: MasteryChipProps) {
  const [open, setOpen] = useState(false);
  const id = useId();
  const evidence = lastEvidenceAt ? new Date(lastEvidenceAt) : null;
  const label = levelLabel(level);
  const when = evidence && !Number.isNaN(evidence.getTime()) ? relativeTime(evidence) : null;

  return (
    <div className={clsx("inline-block", className)}>
      <button
        type="button"
        aria-expanded={open}
        aria-controls={id}
        onClick={() => {
          setOpen((o) => !o);
          onClick?.();
        }}
        className={clsx(
          "tap inline-flex items-center gap-2 rounded-full border border-line-2 bg-surface pr-3 text-ink hover:bg-surface-2",
          size === "sm" ? "pl-2.5 text-meta" : "pl-3 text-meta",
        )}
      >
        <Stones level={level} size={size === "sm" ? 16 : 18} />
        <span className="font-medium">{label}</span>
        {when && <span className="text-ink-2">· {when}</span>}
        {decayHint && (
          <span className="sr-only">
            {" "}
            · {decayHint}
          </span>
        )}
      </button>
      <div id={id} hidden={!open} className="mt-2 max-w-[28rem] rounded-[var(--radius-sm)] border border-line bg-surface p-3 text-meta leading-relaxed shadow-[var(--shadow-2)]">
        <p>
          <span className="font-medium">{level === "mastered" ? "Mastered." : level === "proficient" ? "Proficient. To master it:" : `${label}. For ${level === "familiar" ? "Proficient" : "the next level"}:`}</span>{" "}
          {nextStepHint(level)}
        </p>
        {decayHint && <p className="mt-1 text-ink-2">{decayHint}</p>}
        {when && <p className="mt-1 text-ink-2">Last evidence {when}.</p>}
      </div>
    </div>
  );
}
