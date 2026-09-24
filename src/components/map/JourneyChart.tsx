"use client";

import Link from "next/link";
import type { TopicMastery } from "@/lib/db/db";
import { btnSecondary } from "@/components/items/ui";

const WEEKS = 16;
const DAY = 86_400_000;

/** Stones placed per week over the last sixteen weeks, oldest first, and the Monday each week starts on. */
export function weeklyStones(mastery: readonly TopicMastery[], now = new Date()): { counts: number[]; start: Date } {
  const monday = new Date(now);
  monday.setDate(now.getDate() - ((now.getDay() + 6) % 7));
  monday.setHours(0, 0, 0, 0);
  const start = new Date(monday.getTime() - (WEEKS - 1) * 7 * DAY);
  const counts = new Array(WEEKS).fill(0) as number[];
  for (const m of mastery) {
    if ((m.level !== "proficient" && m.level !== "mastered") || !m.lastEvidenceAt) continue;
    const idx = Math.floor((m.lastEvidenceAt.getTime() - start.getTime()) / (7 * DAY));
    if (idx >= 0 && idx < WEEKS) counts[idx] += 1;
  }
  return { counts, start };
}

const weekOf = (start: Date, i: number) => new Date(start.getTime() + i * 7 * DAY).toLocaleDateString("en-GB", { day: "numeric", month: "short" });

/**
 * Stones placed per week over the last sixteen weeks. Weeks with nothing are simply empty; nothing is said about
 * them. The bars are a picture, not a control (a sixteenth of a phone is too narrow to tap), so what they show is
 * also said in words underneath, at the type floor, rather than inside the SVG where a viewBox would shrink it.
 *
 * Before the first stone there is no chart to read, and the empty state is the one 02-surfaces.md §9 draws: on the
 * page, one sentence saying what will fill the space, one action, no zero and no picture.
 */
export function JourneyChart({ mastery, startHref, now = new Date() }: { mastery: TopicMastery[]; startHref: string; now?: Date }) {
  const { counts, start } = weeklyStones(mastery, now);
  const total = counts.reduce((n, c) => n + c, 0);

  if (total === 0) {
    return (
      <div className="py-6" data-testid="journey-empty">
        <p className="max-w-[46ch] text-ui text-ink-2">Stones appear here as you prove topics in a later mixed set. None yet.</p>
        <Link href={startHref} className={`${btnSecondary} mt-4`}>
          Start a topic
        </Link>
      </div>
    );
  }

  const max = Math.max(1, ...counts);
  const W = 640;
  const H = 96;
  const pad = 4;
  const bw = (W - pad * 2) / WEEKS;
  const busy = counts.map((c, i) => ({ c, i })).filter((w) => w.c > 0);

  return (
    <figure className="mt-3">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="h-auto w-full text-ink"
        role="img"
        aria-label={`Stones placed per week over the last ${WEEKS} weeks: ${total} in all.`}
      >
        <line x1={pad} x2={W - pad} y1={H - 1} y2={H - 1} stroke="currentColor" strokeOpacity={0.25} />
        {counts.map((c, i) => {
          if (!c) return null;
          const h = Math.max(6, ((H - 8) * c) / max);
          return <rect key={i} x={pad + i * bw + 3} y={H - 1 - h} width={bw - 6} height={h} rx={3} fill="currentColor" opacity={0.8} />;
        })}
      </svg>
      <div className="tnum mt-1 flex justify-between text-micro text-ink-2" aria-hidden>
        <span>{weekOf(start, 0)}</span>
        <span>this week</span>
      </div>
      <figcaption className="tnum mt-2 text-meta text-ink-2">
        {total} stone{total === 1 ? "" : "s"} in the last {WEEKS} weeks
        {busy.length > 0 && ": " + busy.map((w) => `${w.c} in the week of ${weekOf(start, w.i)}`).join(", ")}.
      </figcaption>
    </figure>
  );
}
