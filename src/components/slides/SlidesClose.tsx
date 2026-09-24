"use client";

/**
 * The close of a Slides run (art direction v2 §8.1 "Close", benchmarks page 13): the evening scene with Rowan on the
 * hill by the cairn, what was done in exam terms, Rowan's session-close line, what returns and when, and two ways
 * out. No score, no confetti, no word from the banned list; a stone only when one was placed.
 *
 * The scene is the character agent's CompanionScene (data-companion-figure="close", the hare on the hill by the
 * redrawn cairn; silent exactly when the session-close line is, nothing while a question is up; the hare's arrival
 * is its one movement and is skipped under reduced motion). When it is silent (first run, the Letter's first day,
 * Quiet, every line in its cooldown) its panel is not drawn at all: an empty evening-coloured block is neither a
 * drawing nor nothing (audit CQ-09).
 *
 * What the close says is true of the cards on the device (src/lib/slides/close.ts): "What returns" counts every card
 * it names (CT-07) and gives a reason only when there is one (LD-05); and Rowan is told what is really due tonight,
 * the cards this run made included, so the library's own selection never says "There is nothing else to do" above a
 * list of things coming back tonight (LD-05). Nothing is chosen here: the line is the library's.
 */
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import Link from "next/link";
import { useLiveQuery } from "dexie-react-hooks";
import { clsx } from "clsx";
import { CompanionLine } from "@/components/companion/CompanionLine";
import { CompanionScene } from "@/components/companion/CompanionScene";
import { selectAt, useCompanionContext, type CompanionContext } from "@/lib/companion";
import { spokenTitle } from "@/lib/companion/context";
import { titlesForCards } from "@/lib/companion/live";
import type { Subject } from "@/lib/content/taxonomy";
import { getDB, type ReviewCard } from "@/lib/db/db";
import { eveningEnd, returnRows } from "@/lib/slides/close";
import { Recess, controlPrimary, controlSecondary } from "./ui";

export interface SlidesCloseProps {
  subject: Subject;
  unit: string;
  slug: string;
  title: string;
  displayTitle: string;
  /** "23 of 23" */
  count: string;
  /** Epoch ms this run began. */
  startedAt: number;
  /** What was done, in the deck's own terms. */
  facts: { checks: number; answered: number; missed: number; held: number; recalled: number };
  /**
   * The run's last writes (the last grade, the last check) have landed. Until they have, the close does not read the
   * cards or hold Rowan's context, so what it says counts the card she graded a moment ago.
   */
  settled?: boolean;
}

/** The Practice stage's anchor on the topic page (TopicContent's `<Stage id="practice">`), agreed with the topic agent. */
export const PRACTICE_ANCHOR = "practice";

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

function Returns({ cards, now }: { cards: ReviewCard[]; now: Date }) {
  const titles = useMemo(() => titlesForCards(cards), [cards]);
  const { rows, more } = returnRows(cards, now, (c) => spokenTitle(titles[c.topicSlug] ?? c.topicSlug.replace(/-/g, " ")));
  // Nothing coming back this week: no recess at all, rather than a sentence about nothing.
  if (rows.length === 0) return null;
  return (
    <Recess title="What returns">
      <ul className="flex flex-col gap-1.5 font-serif-lesson text-[16px] leading-[1.45] text-ink" data-returns>
        {rows.map((r) => (
          <li key={r.key} data-return={r.count}>
            <span className="font-semibold">{r.when}</span> · {r.what}
            {r.reason ? `, ${r.reason}` : ""}.
          </li>
        ))}
        {more > 0 && <li className="text-ink-2">{more === 1 ? "And one more later in the week." : `And ${more} more later in the week.`}</li>}
      </ul>
    </Recess>
  );
}

export function SlidesClose({ subject, unit, slug, title, displayTitle, count, startedAt, facts, settled = true }: SlidesCloseProps) {
  // The cards coming back within the week, read once the run's last writes have landed.
  const [now] = useState(() => new Date());
  const cards = useLiveQuery(async () => {
    if (!settled) return undefined;
    try {
      return await getDB().cards.where("due").belowOrEqual(new Date(now.getTime() + 7 * 86_400_000)).toArray();
    } catch {
      return [] as ReviewCard[];
    }
  }, [now, settled]);
  const end = useMemo(() => eveningEnd(now), [now]);
  const dueTonight = useMemo(() => (cards ? cards.filter((c) => c.due.getTime() <= end.getTime()) : undefined), [cards, end]);

  // The `session-close` slot, from the context of this sitting, with tonight's real queue; held once, when both have
  // loaded, so the line chosen is the line kept.
  const live = useCompanionContext({
    sessionStartedAt: startedAt,
    questionVisible: false,
    topic: { slug, unit, subject, title, shortTitle: displayTitle },
    ...(dueTonight ? { dueCards: dueTonight } : {}),
  });
  const held = useRef<CompanionContext | undefined>(undefined);
  if (live && dueTonight && !held.current) held.current = live;
  const ctx = held.current;
  const desktop = useDesktop();
  // The scene speaks exactly when the close line does, with a figure (CompanionScene's own rule, read the same way).
  const scene = useMemo(() => {
    if (!ctx || ctx.questionVisible || !ctx.figure) return false;
    const s = selectAt("session-close", ctx);
    return s !== null && !s.unsigned;
  }, [ctx]);

  const words: ReactNode = (
    <>
      <p className="tnum font-sans text-[15px] text-ink-2">{factsLine(facts)}</p>
      <CompanionLine moment="session-close" context={ctx} className="mt-3" />
    </>
  );
  const exits = (
    <>
      <Link href="/" className={clsx(controlPrimary, "lg:w-[240px]")} data-exit="done">
        Done for tonight
      </Link>
      {/* Lands on the topic page's Practice stage: the topic page scrolls to #practice once the stage has rendered. */}
      <Link href={`/learn/${subject}/${unit}/${slug}/#${PRACTICE_ANCHOR}`} className={clsx(controlSecondary, "lg:w-[240px]")} data-exit="practise">
        Practise this topic
      </Link>
    </>
  );

  return (
    <section aria-label="Done for tonight" data-close className={clsx("flex h-full flex-col", scene && "lg:grid lg:grid-cols-[520px_minmax(0,1fr)]")}>
      {/* Desktop: the tall scene fills the left panel; the phone's wide scene sits under the count. One scene, once. */}
      {scene && (
        <div className="hidden h-full min-h-0 bg-[var(--eve-sky)] lg:block" data-scene="tall">
          {desktop && <CompanionScene context={ctx} variant="tall" />}
        </div>
      )}
      <div className={clsx("flex min-h-0 flex-1 flex-col px-6 pt-4 lg:pt-9", scene ? "lg:px-16" : "lg:mx-auto lg:w-full lg:max-w-[720px] lg:px-10")}>
        <p className="tnum font-sans text-[13px] text-ink-2">
          {displayTitle} · {count}
        </p>
        {scene && (
          <div className="mt-4 aspect-[342/230] w-full overflow-hidden rounded-[12px] bg-[var(--eve-sky)] lg:hidden" data-scene="wide">
            {!desktop && <CompanionScene context={ctx} variant="wide" />}
          </div>
        )}
        <h1 tabIndex={-1} data-focus-quiet className="mt-5 font-serif-lesson text-[28px] font-medium leading-[1.15] text-ink outline-none lg:mt-10 lg:text-[40px] lg:leading-[1.1]">
          Done for tonight.
        </h1>
        <div className="mt-2.5 max-w-[44ch] font-serif-lesson text-[17px] leading-[1.5] lg:mt-4 lg:text-[19px]">{words}</div>
        <div className="mt-3.5 lg:mt-5 lg:max-w-[560px]">{cards && <Returns cards={cards} now={now} />}</div>
        <div className="mt-auto flex flex-col gap-2.5 pb-6 pt-5 lg:flex-row lg:items-center lg:gap-3 lg:pb-9">{exits}</div>
        <p className="-mt-3 pb-5 font-sans text-[13px] text-ink-3 lg:-mt-6 lg:pb-9">Saved on this device.</p>
      </div>
    </section>
  );
}
