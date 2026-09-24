"use client";

/**
 * The calm close of a run (docs/plan/emotional-design.md): what was done in exam terms, a stone
 * for each topic proved since the run started, "Saved on this device." once, and two ways out.
 * Shared by the review inbox and the topic practice flows so every close reads the same.
 */
import { useRef, type ReactNode } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { getDB } from "@/lib/db/db";
import { useCompanionContext, type CompanionContext } from "@/lib/companion";
import { CompanionLine } from "@/components/companion/CompanionLine";
import { CompanionScene } from "@/components/companion/CompanionScene";
import { CairnStack } from "./CairnStack";

export interface CloseCardProps {
  /** "Review complete", "Practice complete". */
  eyebrow: string;
  /** The headline figure: "12 items · 9 min", "14 / 20 marks". */
  headline: ReactNode;
  /** One line under it: a forecast, the count and minutes, what happens to lost marks. */
  line?: ReactNode;
  /** Stones placed since this moment (mastery rows updated at or after it) settle in as fresh. */
  startedAt: number;
  /** The exits, styled with exitPrimary / exitSecondary. */
  exits: ReactNode;
  /** Rowan's session-close line. Off where another question of the same page can still be up (the topic page's
   *  practice flow, which sits above the exam-style one): it never speaks during a question. */
  companion?: boolean;
}

/** The accent exit (one per card) and the outlined one, for Links and buttons alike. */
export const exitPrimary = "tap inline-flex items-center rounded-[var(--radius-sm)] bg-accent px-5 font-medium text-accent-ink";
export const exitSecondary = "tap inline-flex items-center rounded-[var(--radius-sm)] border border-line-2 px-5 font-medium";

export function CloseCard({ eyebrow, headline, line, startedAt, exits, companion = true }: CloseCardProps) {
  const stones = useLiveQuery(async () => {
    try {
      const all = await getDB().mastery.toArray();
      const proved = all.filter((m) => m.level === "proficient" || m.level === "mastered");
      const fresh = proved.filter((m) => m.updatedAt.getTime() >= startedAt).length;
      return { total: proved.length, fresh };
    } catch {
      return { total: 0, fresh: 0 };
    }
  }, [startedAt]);

  // The `session-close` slot, so the review inbox and the practice flows close the same way. The
  // run is over, so no answer field is up; the line is silent unless a stone was placed or there is
  // something true to say about the sitting. Its figure is the close scene at the top of the card
  // (decision 8, the art direction v2 §8.1): Rowan on the hill by the cairn under the evening sky,
  // waving, or holding the heather stone up when a stone was placed. Scene and line are chosen from
  // the one held context, so the hare is there exactly when Rowan speaks.
  const live = useCompanionContext({ sessionStartedAt: startedAt, questionVisible: false });

  // One line per close. Recording it writes to a row the live context reads, and a second read
  // would find that line inside the cooldown and choose another; the first context is the one
  // that describes this sitting.
  const held = useRef<CompanionContext | undefined>(undefined);
  if (live && !held.current) held.current = live;

  return (
    <div className="rise-in mx-auto max-w-xl rounded-[var(--radius)] border border-line bg-surface p-6 shadow-[var(--shadow-2)]">
      {companion && <CompanionScene context={held.current} className="mb-5" />}
      <p className="text-meta font-medium text-ink-2">{eyebrow}</p>
      <div className="mt-2 flex items-end justify-between gap-4">
        <p className="tnum text-[28px] font-semibold tracking-tight">{headline}</p>
        {stones && stones.total > 0 && (
          <CairnStack count={stones.total} fresh={stones.fresh} size="sm" label={stones.fresh ? `${stones.fresh} stone${stones.fresh === 1 ? "" : "s"} placed` : `${stones.total} stones`} />
        )}
      </div>
      {line && <p className="mt-2 text-meta text-ink-2">{line}</p>}
      {companion && <CompanionLine moment="session-close" context={held.current} className="mt-2" />}
      <p className="mt-1 text-meta text-ink-2">Saved on this device.</p>
      <div className="mt-5 flex flex-wrap gap-2">{exits}</div>
    </div>
  );
}
