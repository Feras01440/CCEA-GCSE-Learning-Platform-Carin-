"use client";

import Link from "next/link";
import { useLiveQuery } from "dexie-react-hooks";
import { getDB, type TopicMastery } from "@/lib/db/db";

export interface UnitTopicRow {
  slug: string;
  title: string;
  href: string;
  /** What is true of this row and not of every row: its strand where strands differ, a tier or calculator note, no lesson yet. */
  meta: string;
  /** What is published for the topic: a lesson (with its questions), questions only, or nothing yet. For tests and tools. */
  built: "lesson" | "questions" | "none";
}

/**
 * A unit's topics as rows on the page, in teaching order (02-surfaces.md §2, amended by 04-critique.md): no
 * difficulty meter and no red (a verdict on a topic she has not opened), no "Lesson and practice" pill (true of every
 * row, so it said nothing), no examiner chip (every topic of M4, M8 and FM1–FM3 carries examiner evidence, so it would
 * say nothing either), no tint band. What she has done shows in a 20 px gutter, always the same width so a title
 * never reflows: a filled stone for a topic proved in a later mixed set, a hollow one for a topic started, and
 * nothing for a topic not started. Each whole row is the link, at least 64 px tall.
 */
export function UnitTopics({ subject, rows }: { subject: string; rows: UnitTopicRow[] }) {
  const levels = useLiveQuery(async () => {
    try {
      const all = await getDB().mastery.where("subject").equals(subject).toArray();
      return new Map(all.map((m) => [m.topicSlug, m.level]));
    } catch {
      return new Map<string, TopicMastery["level"]>();
    }
  }, [subject]);

  return (
    <ol className="divide-y divide-line border-y border-line" aria-label="Topics in teaching order">
      {rows.map((r, i) => {
        const level = levels?.get(r.slug);
        const state = level === "proficient" || level === "mastered" ? "proved" : level === "attempted" || level === "familiar" ? "started" : null;
        return (
          <li key={r.slug} data-topic={r.slug} data-state={state ?? "not-started"} data-built={r.built}>
            <Link href={r.href} className="flex min-h-16 items-start gap-2 py-3 hover:bg-surface-2 sm:gap-3 sm:px-2">
              <span className="tnum mt-0.5 w-6 shrink-0 text-right text-meta text-ink-2">{i + 1}</span>
              <span className="mt-1 flex w-5 shrink-0 justify-center" aria-hidden={state === null}>
                {state && <StoneGlyph filled={state === "proved"} />}
                {state && <span className="sr-only">{state === "proved" ? "Proved." : "Started."}</span>}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-ui font-medium leading-snug">{r.title}</span>
                {r.meta && <span className="mt-0.5 block text-meta text-ink-2">{r.meta}</span>}
              </span>
            </Link>
          </li>
        );
      })}
    </ol>
  );
}

/** One stone of the cairn: placed (filled) or begun (an outline). Never a tick, never a colour. */
function StoneGlyph({ filled }: { filled: boolean }) {
  return (
    <svg width="16" height="11" viewBox="0 0 16 11" aria-hidden className="text-ink-2">
      <rect x="0.75" y="0.75" width="14.5" height="9.5" rx="4.75" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}
