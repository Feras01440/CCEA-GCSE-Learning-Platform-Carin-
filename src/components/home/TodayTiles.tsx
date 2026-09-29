"use client";

import Link from "next/link";
import { useEffect, useReducer, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useLiveQuery } from "dexie-react-hooks";
import { ArrowRight } from "lucide-react";
import { clsx } from "clsx";
import { getDB } from "@/lib/db/db";
import { useExamPlan } from "@/lib/plan/store";
import { entryWhen, formatPaperDate, planPapers, todayISO } from "@/lib/plan/exam-plan";
import { chooseNextStep, shortReason } from "@/lib/plan/next-step";
import { daysAwayWord } from "@/lib/papers/plan-view";
import { tierWord } from "@/lib/papers/meta";
import { contentIndex } from "@/lib/content/load";
import type { Subject } from "@/lib/content/taxonomy";
import { lateNow, markLetterSeen, setRowanName, useCompanionContext, type CompanionContext } from "@/lib/companion";
import { CompanionLetter } from "@/components/companion/CompanionLetter";
import { CompanionLine } from "@/components/companion/CompanionLine";
import { CairnStack } from "@/components/ux/CairnStack";
import { CardSkeleton, Loading } from "@/components/ux/Skeleton";
import { btnPrimary } from "@/components/items/ui";
import { useSettledReviews } from "@/lib/review/resolve";
import { READ_LAST_KEY } from "@/components/topic/read-place";
import { lastLesson, type LastLesson } from "@/components/topic/last-lesson";
import { SLIDES_LAST_KEY } from "@/lib/slides/place";
import { aboutMinutes, pausedRow, tonightHeadline, tonightSentence } from "./tonight-copy";

/**
 * Today (02-surfaces.md §1, the fifth evening, and the platform audit's Today): one object, the Letter, four page rows
 * and one recess, where there were six identical tiles.
 *
 * - Tonight is the only object, because it is the only thing she acts on: the count, Rowan's arrival line under it
 *   (a different sentence each night), the one accented button, and the stone stack as its only ornament.
 * - The plan is reference, so it is rows on the paper: the next step with the examiner's reason, the week in words,
 *   the next paper as a place on the calendar with its days said once at the end of the row, and her cairn.
 * - Coming up is reference she consults, so it is a recess.
 *
 * Nothing here counts what was not done: no "1 / 4", no hollow dots, no large zero, no countdown at 24 px.
 */

const BUILT = contentIndex();
const isBuilt = (subject: Subject, slug: string) => BUILT.has(`${subject}:${slug}`);

function startOfWeek(d: Date): Date {
  const x = new Date(d);
  const day = (x.getDay() + 6) % 7; // Monday = 0
  x.setDate(x.getDate() - day);
  x.setHours(0, 0, 0, 0);
  return x;
}

const NUMBER_WORDS = ["No", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen"];
/** "Two", "Twelve"; a figure past the words. */
const inWords = (n: number) => NUMBER_WORDS[n] ?? String(n);

/** A row of the plan: a label, what it says, and the quiet line under it. Page, not an object. */
function PlanRow({ label, children, sub, end }: { label: string; children: React.ReactNode; sub?: React.ReactNode; end?: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[6.5rem_minmax(0,1fr)] gap-x-3 py-3 max-sm:grid-cols-1" data-row={label}>
      <dt className="text-meta font-medium text-ink-2">{label}</dt>
      <dd className="min-w-0">
        <div className="flex items-baseline justify-between gap-3">
          <div className="min-w-0 text-ui text-ink">{children}</div>
          {end && <span className="tnum shrink-0 text-meta text-ink-2">{end}</span>}
        </div>
        {sub && <p className="mt-0.5 text-meta text-ink-2">{sub}</p>}
      </dd>
    </div>
  );
}

export function TodayTiles() {
  const plan = useExamPlan();
  const today = todayISO();
  const router = useRouter();
  /**
   * The device's review cards settled before tonight is counted (src/lib/review/withdrawn.ts): a card for an item a later
   * pass withdrew is moved to its replacement or retired, and a diagnostic card becomes its own topic's, so "9 back" is
   * the list the inbox serves. At most a moment's wait (useSettledReviews gives up waiting after 1.5 s).
   */
  const settled = useSettledReviews();

  const firstRunDone = useLiveQuery(async () => {
    try {
      const row = await getDB().settings.get("firstRunDone");
      return row?.value === true;
    } catch {
      return true;
    }
  }, []);

  useEffect(() => {
    if (firstRunDone === false) router.replace("/welcome/");
  }, [firstRunDone, router]);

  // Counted only once the cards are settled, so the first count she sees is the list the inbox will serve.
  const due = useLiveQuery(async () => {
    if (!settled) return undefined;
    try {
      return await getDB().cards.where("due").belowOrEqual(new Date()).count();
    } catch {
      return 0;
    }
  }, [settled]);

  const sessionsThisWeek = useLiveQuery(async () => {
    try {
      return await getDB().sessions.where("startedAt").aboveOrEqual(startOfWeek(new Date())).count();
    } catch {
      return 0;
    }
  }, []);

  const mastery = useLiveQuery(async () => {
    try {
      return await getDB().mastery.toArray();
    } catch {
      return [];
    }
  }, []);

  const lastSession = useLiveQuery(async () => {
    try {
      return (await getDB().sessions.orderBy("startedAt").last())?.startedAt ?? null;
    } catch {
      return null;
    }
  }, []);

  const papers = plan ? planPapers(plan, today).filter((p) => p.daysAway >= 0) : [];
  const next = papers[0] ?? null;
  const nextStep = plan && mastery ? chooseNextStep(plan, mastery, today, isBuilt) : null;
  const stones = (mastery ?? []).filter((m) => m.level === "proficient" || m.level === "mastered").length;
  const daysSince = lastSession ? Math.floor((Date.now() - lastSession.getTime()) / 86_400_000) : null;
  const gentle = daysSince !== null && daysSince >= 3;

  /**
   * Her brother's notes are rendered by first run (src/components/gift/FirstRun.tsx); Today carries
   * none of them in this slice. If a note ever lands on this screen, set this from the same condition
   * that renders it and the companion yields the tile to it: docs/plan/companion/integration-contract.md,
   * "Do not render a companion line on the same screen as her brother's note."
   */
  const giftNoteOnScreen = false;

  /**
   * The lesson she paused and has not finished, in Read or in Slides, from the one record Today reads
   * (src/components/topic/last-lesson.ts, lastLesson): the tile offers the way back to it, naming the section that opens
   * next and the minutes left, and Rowan, the evening she paused, says the section is done (the trial audit's READ-12;
   * the owner, 29 Sep 2026: Slides keeps a stopping point too). Read on the device once, after mount (the records are in
   * localStorage), and again if another tab changes them.
   */
  const [paused, setPaused] = useState<{ resume: LastLesson | null; read: boolean }>({ resume: null, read: false });
  useEffect(() => {
    const read = () => setPaused({ resume: lastLesson(), read: true });
    read();
    const onStorage = (e: StorageEvent) => {
      if (e.key === null || e.key === READ_LAST_KEY || e.key === SLIDES_LAST_KEY || e.key.startsWith("cairn.read.place.") || e.key.startsWith("cairn.slides.place.")) read();
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);
  const pausedLesson = paused.resume
    ? {
        title: paused.resume.title,
        done: paused.resume.done,
        open: paused.resume.open,
        total: paused.resume.total,
        pausedToday: paused.resume.pausedLast && !!paused.resume.pausedAt && todayISO(new Date(paused.resume.pausedAt)) === today,
      }
    : null;

  // The Tonight tile's slots, `today-open` and `first-letter`. The hook is called on every render,
  // before the skeleton returns, and hands back `undefined` while it loads, which renders nothing.
  const live = useCompanionContext(
    {
      giftNoteOnScreen,
      nextTopic: nextStep ? { slug: nextStep.topic.slug, title: nextStep.topic.title } : null,
      pausedLesson,
    },
    // Read once the cards are settled, so Rowan's facts are the settled ones.
    settled,
  );

  /**
   * One arrival line per visit. Recording the line that was said writes to `companionState`, which
   * is a row the live context itself reads, so a second read would arrive with that line inside the
   * cooldown and the tile would quietly swap to another. Holding the first context keeps the line still,
   * and keeps the cooldown to one entry a visit.
   *
   * It is held only once the plan and her mastery rows have loaded, so the next step (and with it the
   * topic "Nothing back tonight" names) is part of it. Held earlier, the only line left was a dry one with
   * no facts, which spent its fortnight on night one and left Today silent from the second open (the
   * platform audit's must-fix 2, 23 September 2026).
   */
  const held = useRef<CompanionContext | undefined>(undefined);
  if (live && paused.read && plan !== undefined && mastery !== undefined && !held.current) held.current = live;
  const companion = held.current;
  const letterOwed = companion?.flags.firstLetterDue === true;

  /**
   * She renamed it in the Letter: saved, then the name this visit's context carries changes too, so the arrival line's
   * name for a screen reader follows the Letter's signature at once rather than at the next open (COMPANION-9). The save
   * is returned, so the Letter can say whether the device kept it.
   */
  const [, renamed] = useReducer((n: number) => n + 1, 0);
  const renameRowan = async (name: string) => {
    await setRowanName(name);
    if (held.current) held.current = { ...held.current, rowanName: name };
    renamed();
  };

  // The tile waits for the held context as well as the count, so the one sentence beside the hare is chosen once and
  // never swaps from the tile's own words to Rowan's after the first paint.
  const loading = !settled || plan === undefined || due === undefined || companion === undefined;
  // The tile's own sentence (tonight-copy.ts), said only while Rowan is silent: one screen, one sentence, once. The hour
  // is the companion's own `isLate`, so the tile and Rowan agree on what the hour allows.
  const sentence = tonightSentence({ due: due ?? 0, gentle, late: companion ? companion.flags.isLate : lateNow(new Date()), paused: pausedLesson !== null });
  const learnHref = nextStep?.href ?? "/learn/";
  // The way back to a paused lesson: the tile's one button when nothing is due, a quiet link under Start otherwise.
  const pausedWay = paused.resume && pausedLesson ? { ...pausedRow({ ...pausedLesson, next: paused.resume.next, minutesLeft: paused.resume.minutesLeft }), href: paused.resume.href } : null;
  const week = sessionsThisWeek ?? 0;
  const soon = papers.slice(0, 3);

  return (
    // One column at every width, the lesson's own 720 px measure (the desktop mockup, 02-surfaces.md §1): the one
    // object first, the Letter under it, then the plan as rows and what is coming up. At 1280 the Tonight object is
    // 720 px wide, which also gives Rowan's figure its full size beside the arrival line.
    <div className="flex max-w-[720px] flex-col gap-8">
      <div className="flex flex-col gap-4">
        {/* Loading: the shape of the Tonight object only (02-surfaces.md §1); the rows are text and need none. */}
        <Loading loading={loading} label="Loading tonight" skeleton={<CardSkeleton lines={2} quiet />}>
          <section aria-labelledby="tonight-heading" className="relative rounded-[var(--radius)] border border-line-2 bg-surface p-5 sm:p-6">
            <h2 id="tonight-heading" className="text-meta font-medium text-ink-2">
              Tonight
            </h2>
            {/* The stone stack: the object's only ornament, 24 px, no number beside it (the count is in the plan rows,
                so the picture is hidden from a screen reader). It grows with her first three stones and then holds. */}
            {stones > 0 && (
              <div aria-hidden className="absolute right-5 top-5 sm:right-6 sm:top-6 [&_svg]:h-6 [&_svg]:w-auto">
                <CairnStack count={Math.min(stones, 3)} size="sm" />
              </div>
            )}
            <p className={clsx("tnum mt-2 text-h1 font-semibold tracking-[-0.01em]", stones > 0 && "pr-20")}>
              {tonightHeadline(due ?? 0)}
              {due ? <span className="font-normal text-ink-2"> · {aboutMinutes(due)}</span> : null}
            </p>
            {/* The row under the headline (the companion block): one sentence beside the posed hare, which stands on the
                tile on every open in Full, in the state the day calls for (the owner's presence ruling; TODAY-1). The
                sentence is Rowan's line when it has one this open, otherwise the tile's own. The row pulls the Start
                button up to the 12 px the canvas draws under it, so the hare stands on the tile's floor; in Words only
                and Quiet there is no hare, and the sentence keeps the button's full 20 px. */}
            <CompanionLine
              moment="today-open"
              context={companion}
              standing
              fallback={<p className="text-ui text-ink-2">{sentence}</p>}
              className="mt-3"
            />
            {/* One accent: the reviews when something is back; otherwise the way back into a lesson she paused, or the
                next step. A paused lesson under Start keeps its way back as a quiet link beside what it is. */}
            {pausedWay && !due ? (
              <>
                <Link href={pausedWay.href} aria-describedby="paused-lesson" className={clsx(btnPrimary, "tap-lg mt-5")}>
                  {pausedWay.action} <ArrowRight size={18} strokeWidth={1.5} aria-hidden />
                </Link>
                <p id="paused-lesson" data-paused-lesson="" className="mt-2 text-meta text-ink-2">
                  {pausedWay.label}
                </p>
              </>
            ) : (
              <>
                <Link href={due ? "/review/" : learnHref} className={clsx(btnPrimary, "tap-lg mt-5")}>
                  {due ? "Start" : "Learn"} <ArrowRight size={18} strokeWidth={1.5} aria-hidden />
                </Link>
                {pausedWay && (
                  <p data-paused-lesson="" className="mt-2 text-meta text-ink-2">
                    {pausedWay.label} ·{" "}
                    <Link href={pausedWay.href} className="font-medium text-ink underline decoration-line-3 underline-offset-4">
                      {pausedWay.action}
                    </Link>
                  </p>
                )}
              </>
            )}
          </section>
        </Loading>

        {/* The first Letter while it is owed: its own object directly below Tonight, never nested inside it. On the
            Letter's first day the arrival line waits for it (select.ts, "letter-first"); from the next day both
            speak, the Letter sealed to one line until she opens it. Both are silent while her brother's note is
            on this screen. */}
        {letterOwed && (
          <CompanionLetter
            moment="first-letter"
            context={companion}
            onRead={() => void markLetterSeen().catch(() => {})}
            onRename={renameRowan}
          />
        )}
      </div>

      {plan && (
      <div className="flex flex-col gap-8">
        <section aria-labelledby="plan-heading" className="border-t border-line pt-3.5">
          <h2 id="plan-heading" className="text-meta font-medium text-ink-2">
            The plan
          </h2>
          <dl className="mt-1 divide-y divide-line">
            <PlanRow
              label="Next step"
              sub={nextStep ? shortReason(nextStep.reason) : undefined}
            >
              {nextStep ? (
                <Link href={nextStep.href} className="tap flex items-center font-medium underline-offset-4 hover:underline">
                  {nextStep.unit} · {nextStep.topic.title}
                </Link>
              ) : papers.length === 0 ? (
                <Link href="/settings/#plan" className="tap flex items-center underline-offset-4 hover:underline">
                  Add the papers you are entered for in Settings.
                </Link>
              ) : (
                <Link href="/map/" className="tap flex items-center underline-offset-4 hover:underline">
                  Nothing to suggest tonight. The Map shows every unit of your plan.
                </Link>
              )}
            </PlanRow>
            <PlanRow label="This week" sub={`${inWords(plan.sessionsPerWeek)} is the plan, not a target.`}>
              {week === 0 ? "Nothing yet this week." : `${inWords(week)} evening${week === 1 ? "" : "s"} this week.`}
            </PlanRow>
            <PlanRow label="Next paper" end={next ? daysAwayWord(next.daysAway) : undefined} sub={next ? entryWhen(next) : undefined}>
              {next ? (
                <>
                  {next.label}
                  {next.tier ? ` · ${tierWord(next.tier)}` : ""}
                </>
              ) : (
                <Link href="/settings/#plan" className="tap flex items-center underline-offset-4 hover:underline">
                  No paper to come in your plan.
                </Link>
              )}
            </PlanRow>
            <PlanRow label="Your cairn" sub="One for every topic you prove in a later mixed set.">
              {stones === 0 ? "No stones yet." : `${stones} stone${stones === 1 ? "" : "s"}.`}
            </PlanRow>
          </dl>
        </section>

        {soon.length > 0 && (
          <section aria-labelledby="coming-heading">
            <h2 id="coming-heading" className="text-meta font-medium text-ink-2">
              Coming up
            </h2>
            <ul className="mt-2 divide-y divide-line rounded-[var(--radius-sm)] bg-surface-2 px-4">
              {soon.map((p) => (
                <li key={`${p.subject}-${p.unit}-${p.series}`} className="flex items-baseline justify-between gap-3 py-2.5 text-meta">
                  <span className="font-medium text-ink">{p.label}</span>
                  <span className="tnum shrink-0 text-ink-2">
                    {formatPaperDate(p.date)}
                    {p.start ? ` · ${p.start}` : ""}
                  </span>
                </li>
              ))}
            </ul>
            <p className="mt-2 text-meta text-ink-2">
              {inWords(papers.length)} paper{papers.length === 1 ? "" : "s"} to come, on CCEA&rsquo;s own dates.{" "}
              <Link href="/papers/" className="underline decoration-line-3 underline-offset-4 hover:text-ink">
                All of them
              </Link>
            </p>
          </section>
        )}
      </div>
      )}
    </div>
  );
}
