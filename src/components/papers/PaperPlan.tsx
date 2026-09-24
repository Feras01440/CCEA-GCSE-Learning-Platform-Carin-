"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Ban, Calculator, ChevronDown, ExternalLink, Timer } from "lucide-react";
import { clsx } from "clsx";
import { todayISO } from "@/lib/plan/exam-plan";
import { useExamPlan } from "@/lib/plan/store";
import { useAllMocks } from "@/lib/papers/runs";
import { CCEA_LINK_NOTICE, formatMinutes, runnerHref, sessionLabel, tierWord, type PaperSubject, type PickerPaper } from "@/lib/papers/meta";
import { buildPlanView, daysAwayWord, sameRun, umsLine, type PlanCard, type RunSummary } from "@/lib/papers/plan-view";
import { btnPrimary } from "@/components/items/ui";
import { CardSkeleton, Loading } from "@/components/ux/Skeleton";
import { PaperPicker } from "./PaperPicker";

/**
 * /papers as her plan (02-surfaces.md §5, the platform audit §6.6): the next paper first, with one accented action,
 * "Sit the next one", which opens the newest past paper of that unit she has not yet timed; then every other entry of
 * her plan as a row on the page, soonest first, each with its date, its best and latest run, and its past papers
 * behind one disclosure. Every "Run it timed" is an outline: the accent belongs to the one thing to do next.
 * A date is a fact at the end of a row, "in 230 days", never a bar. The full catalogue stays one click below.
 */

const runOutline =
  "tap inline-flex items-center gap-1.5 rounded-[var(--radius-sm)] border border-line-3 bg-surface px-3 text-meta font-medium text-ink hover:bg-surface-2";
const quietLink = "tap inline-flex items-center gap-1 text-meta text-ink-2 underline decoration-line-3 underline-offset-4 hover:text-ink";

function formatWhen(d: Date): string {
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

/** Raw → UMS → grade for one saved run, with the paper it came from. */
function RunLine({ label, run }: { label: string; run: RunSummary }) {
  return (
    <p className="tnum text-meta">
      <span className="text-ink-2">{label} </span>
      {umsLine(run)}
      <span className="text-ink-2">
        {" "}
        · {sessionLabel(run.sessionKey)} paper, sat {formatWhen(run.at)}
      </span>
    </p>
  );
}

function Runs({ card }: { card: PlanCard }) {
  if (!card.best) return null;
  return (
    <div className="mt-1 space-y-0.5">
      <RunLine label="Best run:" run={card.best} />
      {!sameRun(card.best, card.latest) && card.latest && <RunLine label="Latest:" run={card.latest} />}
    </div>
  );
}

function PaperRow({ p }: { p: PickerPaper }) {
  const calc = p.subject === "science" ? null : p.calculator;
  return (
    <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1.5">
      {p.paperNumber !== null && <span className="text-meta font-medium">Paper {p.paperNumber}</span>}
      {p.booklet !== null && p.discipline !== null && <span className="text-meta font-medium">{p.discipline}</span>}
      <span className="tnum text-meta text-ink-2">
        {p.marks} marks · {formatMinutes(p.durationMinutes)}
        {calc !== null && (
          <>
            {" · "}
            <span className="inline-flex items-center gap-1 align-middle">
              {calc ? <Calculator size={14} strokeWidth={1.5} aria-hidden /> : <Ban size={14} strokeWidth={1.5} aria-hidden />}
              {calc ? "Calculator" : "Non-calculator"}
            </span>
          </>
        )}
      </span>
      {p.runnable ? (
        <Link href={runnerHref(p.id)} className={runOutline}>
          <Timer size={16} strokeWidth={1.5} aria-hidden /> Run it timed
        </Link>
      ) : (
        <span className="text-meta text-ink-2">No mark scheme yet, so no timed run</span>
      )}
      <a href={p.url} target="_blank" rel="noopener noreferrer" className={quietLink}>
        <ExternalLink size={16} strokeWidth={1.5} aria-hidden /> Open paper (ccea.org.uk)
      </a>
      {p.markSchemeUrl ? (
        <a href={p.markSchemeUrl} target="_blank" rel="noopener noreferrer" className={quietLink}>
          <ExternalLink size={16} strokeWidth={1.5} aria-hidden /> Open mark scheme
        </a>
      ) : (
        <span className="text-meta text-ink-2">Mark scheme not yet published</span>
      )}
    </div>
  );
}

/** The past papers of one entry, behind one disclosure: nothing of the archive shows until she asks for it. */
function PastPapers({ card }: { card: PlanCard }) {
  const [open, setOpen] = useState(false);
  const id = `past-${card.key.replace(/[:.]/g, "-")}`;
  if (card.note) return <p className="mt-1 text-meta text-ink-2">{card.note}</p>;
  const n = card.sittings.length;
  return (
    <div className="mt-1">
      <button type="button" aria-expanded={open} aria-controls={id} onClick={() => setOpen((v) => !v)} className="tap inline-flex items-center gap-1.5 text-meta font-medium text-ink-2 hover:text-ink">
        <ChevronDown size={16} strokeWidth={1.5} aria-hidden className={clsx("transition-transform duration-200 motion-reduce:transition-none", open && "rotate-180")} />
        Past papers · {n} sitting{n === 1 ? "" : "s"}
      </button>
      {open && (
        <ul id={id} className="mt-1 divide-y divide-line rounded-[var(--radius-sm)] bg-surface-2 px-3">
          {card.sittings.map((s) => (
            <li key={s.sessionKey} className="py-2.5">
              <p className="text-ui font-medium">{sessionLabel(s.sessionKey)}</p>
              {s.papers.map((p) => (
                <PaperRow key={p.id} p={p} />
              ))}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

/** The name of an entry as a card heading: "Biology Unit 1 · Higher". */
const cardTitle = (card: PlanCard) => `${card.label}${card.tier ? ` · ${tierWord(card.tier)}` : ""}`;

/** One entry as a row on the page: name, date, when, runs, and its past papers folded away. */
function EntryRow({ card }: { card: PlanCard }) {
  return (
    <li className="py-4" data-entry={card.unit}>
      <div className="flex flex-wrap items-baseline justify-between gap-x-4">
        <h3 className="text-ui font-semibold">{cardTitle(card)}</h3>
        <span className="tnum text-meta text-ink-2">{daysAwayWord(card.daysAway)}</span>
      </div>
      <p className="tnum text-meta text-ink-2">{card.when}</p>
      <Runs card={card} />
      <PastPapers card={card} />
    </li>
  );
}

/**
 * The paper "Sit the next one" opens: the newest runnable past paper of the next entry that she has not timed yet,
 * or failing that its newest runnable one. When the next entry has none, the soonest entry that does.
 */
function nextToSit(cards: PlanCard[], timed: Set<string>): { card: PlanCard; paper: PickerPaper } | null {
  for (const card of cards) {
    const runnable = card.papers.filter((p) => p.runnable);
    const paper = runnable.find((p) => !timed.has(p.id)) ?? runnable[0];
    if (paper) return { card, paper };
  }
  return null;
}

function NextUp({ cards, timed }: { cards: PlanCard[]; timed: Set<string> }) {
  const next = cards[0];
  const sit = nextToSit(cards, timed);
  const sameUnit = sit?.card.key === next.key;
  return (
    <section aria-labelledby="next-heading" className="rounded-[var(--radius)] border border-line-2 bg-surface p-5 sm:p-6" data-testid="next-paper">
      <p className="text-meta font-medium text-ink-2">Next paper</p>
      <div className="mt-1 flex flex-wrap items-baseline justify-between gap-x-4">
        <h2 id="next-heading" className="text-h3 font-semibold">
          {cardTitle(next)}
        </h2>
        <span className="tnum text-meta text-ink-2">{daysAwayWord(next.daysAway)}</span>
      </div>
      <p className="tnum text-meta text-ink-2">{next.when}</p>
      <Runs card={next} />
      {sit ? (
        <div className="mt-4">
          <Link href={runnerHref(sit.paper.id)} className={clsx(btnPrimary, "tap-lg")}>
            <Timer size={18} strokeWidth={1.5} aria-hidden /> Sit the next one
          </Link>
          <p className="mt-2 text-meta text-ink-2">
            {sameUnit ? "" : `${sit.card.label}: `}
            {sessionLabel(sit.paper.sessionKey)} paper{sit.paper.paperNumber ? ` ${sit.paper.paperNumber}` : ""}, {formatMinutes(sit.paper.durationMinutes)} against the clock
            {timed.has(sit.paper.id) ? " (you have timed this one before)" : ""}.
          </p>
        </div>
      ) : (
        <p className="mt-3 text-meta text-ink-2">No past paper in your plan has a published mark scheme yet, so there is nothing to time.</p>
      )}
      <PastPapers card={next} />
    </section>
  );
}

export function PaperPlan({ papers }: { papers: Record<PaperSubject, PickerPaper[]> }) {
  const plan = useExamPlan();
  const mocks = useAllMocks();
  const today = todayISO();
  const [catalogue, setCatalogue] = useState(false);

  const view = useMemo(() => (plan && mocks ? buildPlanView({ plan, today, papers, mocks }) : null), [plan, mocks, today, papers]);
  const timed = useMemo(() => new Set((mocks ?? []).map((m) => m.paperId)), [mocks]);

  return (
    <>
      <section aria-labelledby="plan-heading">
        <div className="mb-3 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
          <h2 id="plan-heading" className="text-meta font-medium text-ink-2">
            Your plan{view ? ` · ${view.cards.length} paper${view.cards.length === 1 ? "" : "s"} to come` : ""}
          </h2>
          <Link href="/settings/#plan" className="tap inline-flex items-center text-meta text-ink-2 underline-offset-4 hover:text-ink hover:underline">
            Change entries
          </Link>
        </div>

        <Loading loading={view === null} label="Loading your plan" skeleton={<CardSkeleton lines={2} quiet />}>
          {view && view.cards.length === 0 && (
            <p className="py-6 text-ui text-ink-2">Every paper in your plan has been sat. The full catalogue is below, and you can set new entries in Settings.</p>
          )}
          {view && view.cards.length > 0 && (
            <>
              <NextUp cards={view.cards} timed={timed} />
              {view.runCount === 0 && (
                <p className="mt-4 max-w-[60ch] text-meta text-ink-2" data-testid="runs-empty">
                  When you sit a paper against the clock, its raw mark, UMS and grade appear here.
                </p>
              )}
              {view.cards.length > 1 && (
                <>
                  <h2 className="mt-6 text-meta font-medium text-ink-2">Then</h2>
                  <ol className="divide-y divide-line border-t border-line">
                    {view.cards.slice(1).map((c) => (
                      <EntryRow key={c.key} card={c} />
                    ))}
                  </ol>
                </>
              )}
            </>
          )}
        </Loading>

        <p className="mt-4 text-meta text-ink-2">{CCEA_LINK_NOTICE} Papers and mark schemes are © CCEA and open on ccea.org.uk in a new tab; nothing is re-hosted here.</p>
      </section>

      <section aria-labelledby="catalogue-heading" className="section-rule">
        <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-2">
          <div>
            <h2 id="catalogue-heading" className="text-h3 font-semibold">
              Every CCEA paper
            </h2>
            {view && (
              <p className="tnum mt-0.5 max-w-2xl text-meta text-ink-2">
                Your plan lists {view.planPaperCount} of the {view.cataloguePaperCount} papers in the archive.
                {view.hiddenTierCount > 0 ? ` The ${view.hiddenTierCount} at the other tier, and the units you are not entered for, are here.` : " The units you are not entered for are here."}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={() => setCatalogue((v) => !v)}
            aria-expanded={catalogue}
            aria-controls="catalogue"
            className="tap rounded-[var(--radius-sm)] border border-line-3 px-4 text-meta font-medium hover:bg-surface-2"
          >
            {catalogue ? "Hide every paper" : "Show every paper"}
          </button>
        </div>
        <div id="catalogue" className={catalogue ? "mt-6" : undefined}>
          {catalogue && <PaperPicker papers={papers} />}
        </div>
      </section>
    </>
  );
}
