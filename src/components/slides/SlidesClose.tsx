"use client";

/**
 * The close of a Slides run (art direction v2 §8.1 "Close", benchmarks page 13): the evening scene with Rowan on the
 * hill by the cairn, what was done in exam terms, Rowan's session-close line, what returns and when, and two ways
 * out. No score, no confetti, no word from the banned list; a stone only when one was placed.
 *
 * The scene is the character agent's CompanionScene (data-companion-figure="close", the hare on the hill by the
 * redrawn cairn; silent exactly when the session-close line is, nothing while a question is up; the hare's arrival
 * is its one movement and is skipped under reduced motion).
 */
import { useEffect, useRef, useState, type ReactNode } from "react";
import Link from "next/link";
import { clsx } from "clsx";
import { CompanionLine } from "@/components/companion/CompanionLine";
import { CompanionScene } from "@/components/companion/CompanionScene";
import { dayNameWithin, useCompanionContext, type CompanionContext } from "@/lib/companion";
import type { Subject } from "@/lib/content/taxonomy";
import { Recess, controlPrimary, controlSecondary } from "./ui";

export interface SlidesCloseProps {
  subject: Subject;
  unit: string;
  slug: string;
  title: string;
  displayTitle: string;
  /** "25 of 25" */
  count: string;
  /** Epoch ms this run began. */
  startedAt: number;
  /** What was done, in the deck's own terms. */
  facts: { checks: number; answered: number; missed: number; held: number; recalled: number };
}

/** lg and up (the desktop frame), read after mount so the scene is drawn once, in the one variant the screen needs. */
function useDesktop(): boolean {
  const [desktop, setDesktop] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 64rem)");
    const on = () => setDesktop(mq.matches);
    on();
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, []);
  return desktop;
}

function factsLine({ checks, answered, missed, held, recalled }: SlidesCloseProps["facts"]): string {
  const parts: string[] = [];
  parts.push(answered === checks ? `${checks} ${checks === 1 ? "check" : "checks"} answered` : `${answered} of ${checks} checks answered`);
  if (missed > 0) parts.push(held === missed ? (missed === 1 ? "the one that came back held" : `the ${missed} that came back held`) : `${held} of the ${missed} that came back held`);
  if (recalled > 0) parts.push(`${recalled} recall ${recalled === 1 ? "card" : "cards"} graded`);
  return parts.join(" · ");
}

/** The next returns, grouped by the day and the topic they share, so one topic's three checks are one line, not three. */
export function groupReturns(returns: CompanionContext["returns"], now: Date): Array<{ key: string; when: string; count: number; title: string; reason: string }> {
  const out: Array<{ key: string; when: string; count: number; title: string; reason: string }> = [];
  for (const r of returns) {
    const day = dayNameWithin(r.dueAt, now) ?? r.dueAt.toLocaleDateString("en-GB", { day: "numeric", month: "long" });
    const key = `${day}|${r.topicSlug}|${r.reason}`;
    const found = out.find((g) => g.key === key);
    if (found) found.count += 1;
    else out.push({ key, when: day.charAt(0).toUpperCase() + day.slice(1), count: 1, title: r.title, reason: r.reason });
  }
  return out;
}

function Returns({ ctx }: { ctx: CompanionContext | undefined }) {
  if (!ctx) return null;
  const rows = groupReturns(ctx.returns, ctx.now);
  return (
    <Recess title="What returns">
      {rows.length === 0 ? (
        <p className="font-serif-lesson text-[16px] leading-[1.45] text-ink">Nothing is due back yet. Whatever you answer tonight comes back on the schedule, the first in a day or two.</p>
      ) : (
        <ul className="flex flex-col gap-1.5 font-serif-lesson text-[16px] leading-[1.45] text-ink">
          {rows.map((g) => (
            <li key={g.key}>
              <span className="font-semibold">{g.when}</span> · {g.count === 1 ? g.title : `${g.count} items from ${g.title}`}, because{" "}
              {g.count === 1 ? g.reason : g.reason.replace(/^it is due/, "they are due").replace(/^you were sure and not right, so it comes/, "you were sure and not right, so they come")}.
            </li>
          ))}
        </ul>
      )}
    </Recess>
  );
}

export function SlidesClose({ subject, unit, slug, title, displayTitle, count, startedAt, facts }: SlidesCloseProps) {
  // The `session-close` slot, from the context of this sitting; held once so the line chosen is the line kept.
  const live = useCompanionContext({ sessionStartedAt: startedAt, questionVisible: false, topic: { slug, unit, subject, title, shortTitle: displayTitle } });
  const held = useRef<CompanionContext | undefined>(undefined);
  if (live && !held.current) held.current = live;
  const ctx = held.current;
  const desktop = useDesktop();

  const words: ReactNode = (
    <>
      <p className="tnum font-sans text-[15px] text-ink-2">{factsLine(facts)}</p>
      <CompanionLine moment="session-close" context={ctx} className="mt-3" />
    </>
  );
  const exits = (
    <>
      <Link href="/" className={clsx(controlPrimary, "lg:w-[240px]")}>
        Done for tonight
      </Link>
      <Link href={`/learn/${subject}/${unit}/${slug}/#practice`} className={clsx(controlSecondary, "lg:w-[240px]")}>
        Practise this topic
      </Link>
    </>
  );

  return (
    <section aria-label="Done for tonight" data-close className="flex h-full flex-col lg:grid lg:grid-cols-[520px_minmax(0,1fr)]">
      {/* Desktop: the tall scene fills the left panel; the phone's wide scene sits under the count. One scene, once. */}
      <div className="hidden h-full min-h-0 bg-[var(--eve-sky)] lg:block" data-scene="tall">
        {desktop && <CompanionScene context={ctx} variant="tall" />}
      </div>
      <div className="flex min-h-0 flex-1 flex-col px-6 pt-4 lg:px-16 lg:pt-9">
        <p className="tnum font-sans text-[13px] text-ink-2">
          {displayTitle} · {count}
        </p>
        <div className="mt-4 aspect-[342/230] w-full overflow-hidden rounded-[12px] bg-[var(--eve-sky)] lg:hidden" data-scene="wide">
          {!desktop && <CompanionScene context={ctx} variant="wide" />}
        </div>
        <h1 tabIndex={-1} className="mt-5 font-serif-lesson text-[28px] font-medium leading-[1.15] text-ink outline-none lg:mt-10 lg:text-[40px] lg:leading-[1.1]">
          Done for tonight.
        </h1>
        <div className="mt-2.5 max-w-[44ch] font-serif-lesson text-[17px] leading-[1.5] lg:mt-4 lg:text-[19px]">{words}</div>
        <div className="mt-3.5 lg:mt-5 lg:max-w-[560px]">
          <Returns ctx={ctx} />
        </div>
        <div className="mt-auto flex flex-col gap-2.5 pb-6 pt-5 lg:flex-row lg:items-center lg:gap-3 lg:pb-9">{exits}</div>
        <p className="-mt-3 pb-5 font-sans text-[13px] text-ink-3 lg:-mt-6 lg:pb-9">Saved on this device.</p>
      </div>
    </section>
  );
}
