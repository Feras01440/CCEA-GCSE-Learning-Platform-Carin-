"use client";

import { useEffect, useMemo, useState } from "react";
import { clsx } from "clsx";
import {
  DEFAULT_PLAN,
  catalogue,
  entryWhen,
  planPapers,
  practicalWindow,
  seriesFor,
  sortUnits,
  todayISO,
  unitLabel,
  unitName,
  type CatalogueSubject,
  type ExamPlan,
  type PlanEntry,
  type PlanPaper,
  type Tier,
} from "@/lib/plan/exam-plan";
import { loadPlan, savePlan } from "@/lib/plan/store";
import { btnPrimary, btnSecondary } from "@/components/items/ui";
import { Skeleton } from "@/components/ux/Skeleton";

/**
 * Her plan, edited as the list it is (the owner's ruling of 23 September 2026: "she picks and chooses her plan, and
 * English and other subjects will be added later"). Every unit she is entered for is one row with its series, its
 * tier where the subject is entered at one, CCEA's date for it, and Remove. A unit she has already sat is the same
 * row with a past series: one choice in the series menu, and it reads "Sat on …" everywhere. Units and subjects are
 * added from the catalogue the exam map describes (data/exams/exam-map.json), so a subject CCEA timetables tomorrow
 * appears here with no change to this file.
 *
 * A series is offered only where CCEA sets a sitting for that unit, so no choice can quietly drop a paper from Today,
 * Papers and the Map. The subject's own rules sit under its name as guidance, not as a lock: she knows her entries.
 * Save is the accent only while there is something to save.
 */

// 16 px: an iOS or iPadOS field under 16 px zooms the page when it takes focus. The edge is --line-3 (3.1:1,
// WCAG 1.4.11), because the border is the only thing that says "this is a control".
const controlCls = "tap min-w-0 rounded-[var(--radius-sm)] border border-line-3 bg-surface px-3 text-[16px] text-ink";
const quietBtn = "tap inline-flex items-center rounded-[var(--radius-sm)] px-2 text-meta text-ink-2 underline decoration-line-3 underline-offset-4 hover:text-ink";

/** "1 December 2026": a window, not a sitting, so no weekday. */
const longDate = (iso: string) => new Date(iso + "T00:00:00").toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });

/** The series she can be entered in for a unit, oldest first; one already past is marked as sat. */
function SeriesSelect({ entry, today, onChange }: { entry: PlanEntry; today: string; onChange: (key: string) => void }) {
  const options = seriesFor(entry.subject, entry.unit);
  const stale = !options.some((o) => o.key === entry.series);
  return (
    <select aria-label={`Series for ${unitName(entry.subject, entry.unit)}`} className={clsx(controlCls, "min-w-[9.5rem] flex-1 sm:max-w-[14rem]")} value={entry.series} onChange={(e) => onChange(e.target.value)}>
      {stale && (
        <option value={entry.series} disabled>
          {entry.series} (no sitting)
        </option>
      )}
      {options.map((o) => (
        <option key={o.key} value={o.key}>
          {o.label}
          {o.date < today ? " (sat)" : ""}
        </option>
      ))}
    </select>
  );
}

function EntryRow({
  entry,
  paper,
  tiered,
  today,
  onChange,
  onRemove,
}: {
  entry: PlanEntry;
  paper: PlanPaper | null;
  tiered: boolean;
  today: string;
  onChange: (patch: Partial<PlanEntry>) => void;
  onRemove: () => void;
}) {
  const name = unitName(entry.subject, entry.unit);
  const window = paper?.booklets ? practicalWindow(entry.subject, entry.unit, entry.series) : null;
  return (
    <li className="py-3" data-entry={`${entry.subject}:${entry.unit}`}>
      <div className="flex items-center justify-between gap-3">
        <span className="min-w-0 text-ui font-medium text-ink">{name}</span>
        <button type="button" className={quietBtn} onClick={onRemove} aria-label={`Remove ${name} from your plan`}>
          Remove
        </button>
      </div>
      <div className="mt-1 flex items-center gap-2">
        <SeriesSelect entry={entry} today={today} onChange={(series) => onChange({ series })} />
        {tiered && (
          <select aria-label={`Tier for ${name}`} className={clsx(controlCls, "w-[8.5rem] shrink-0")} value={entry.tier ?? ""} onChange={(e) => onChange({ tier: (e.target.value || null) as Tier | null })}>
            {entry.tier === null && (
              <option value="" disabled>
                Tier
              </option>
            )}
            <option value="H">Higher</option>
            <option value="F">Foundation</option>
          </select>
        )}
      </div>
      <p className="tnum mt-1 text-meta text-ink-2">{paper ? entryWhen(paper) : `No sitting for ${entry.unit} in that series. Choose another one.`}</p>
      {paper?.then && paper.daysAway >= 0 && (
        <p className="tnum text-meta text-ink-2">
          Then {unitLabel(entry.subject, paper.then.unit.split("-")[0])}, {paper.then.start} · {paper.then.durationMinutes} min
        </p>
      )}
      {window && window.to >= today && (
        <p className="text-meta text-ink-2">
          Booklet A is the practical, done in class between {longDate(window.from)} and {longDate(window.to)}
          {window.note ? " (last year's window; CCEA has not confirmed this year's yet)." : "."}
        </p>
      )}
    </li>
  );
}

/** A unit of the subject she is not entered for yet, added in its soonest series, at the tier of her other units. */
function AddUnit({ subject, plan, today, onAdd }: { subject: CatalogueSubject; plan: ExamPlan; today: string; onAdd: (entry: PlanEntry) => void }) {
  const taken = new Set(plan.entries.filter((e) => e.subject === subject.id).map((e) => e.unit));
  const open = subject.units.filter((u) => !taken.has(u.unit));
  if (open.length === 0) return null;
  const siblingTier = plan.entries.find((e) => e.subject === subject.id && e.tier)?.tier ?? null;
  return (
    <label className="mt-2 flex flex-wrap items-center gap-2 text-meta text-ink-2">
      <span>Add a unit</span>
      <select
        className={controlCls}
        value=""
        onChange={(e) => {
          const u = open.find((x) => x.unit === e.target.value);
          if (!u) return;
          const soonest = u.series.find((s) => s.date >= today) ?? u.series[u.series.length - 1];
          if (!soonest) return;
          onAdd({ subject: subject.id, unit: u.unit, series: soonest.key, tier: subject.tieredByEntry ? siblingTier : null });
        }}
      >
        <option value="" disabled>
          Choose a {subject.short} unit
        </option>
        {open.map((u) => (
          <option key={u.unit} value={u.unit}>
            {u.name}
          </option>
        ))}
      </select>
    </label>
  );
}

export function ExamPlanSettings({ className }: { className?: string }) {
  const [plan, setPlan] = useState<ExamPlan | null>(null);
  const [saved, setSaved] = useState<string>("");
  const [status, setStatus] = useState<string | null>(null);
  /** Subjects she has chosen to add, shown with their "Add a unit" menu before their first unit is in. */
  const [adding, setAdding] = useState<string[]>([]);
  const today = todayISO();
  const cat = useMemo(() => catalogue(), []);

  useEffect(() => {
    let alive = true;
    loadPlan()
      .catch(() => DEFAULT_PLAN)
      .then((p) => {
        if (!alive) return;
        setPlan(p);
        setSaved(JSON.stringify(p));
      });
    return () => {
      alive = false;
    };
  }, []);

  const change = (next: (p: ExamPlan) => ExamPlan) => {
    setPlan((p) => (p ? next(p) : p));
    setStatus(null);
  };
  const setEntry = (i: number, patch: Partial<PlanEntry>) => change((p) => ({ ...p, entries: p.entries.map((e, j) => (j === i ? { ...e, ...patch } : e)) }));
  const removeEntry = (i: number) => change((p) => ({ ...p, entries: p.entries.filter((_, j) => j !== i) }));
  const addEntry = (e: PlanEntry) => {
    change((p) => ({ ...p, entries: [...p.entries, e] }));
    setAdding((a) => a.filter((s) => s !== e.subject));
  };

  const dirty = plan !== null && JSON.stringify(plan) !== saved;

  async function onSave() {
    if (!plan) return;
    try {
      await savePlan(plan);
      setSaved(JSON.stringify(plan));
      setStatus("Saved. Today, Papers and the Map use these dates now.");
    } catch {
      setStatus("Could not save the plan on this device. Try again.");
    }
  }

  const papers = plan ? planPapers(plan, today) : [];
  const paperOf = (e: PlanEntry) => papers.find((p) => p.subject === e.subject && p.unit === e.unit) ?? null;
  const inPlan = plan ? cat.filter((s) => plan.entries.some((e) => e.subject === s.id) || adding.includes(s.id)) : [];
  // A subject in her plan that the exam map does not describe (yet) still shows, by its id.
  const unknown = plan ? [...new Set(plan.entries.map((e) => e.subject))].filter((s) => !cat.some((c) => c.id === s)) : [];
  const addable = plan ? cat.filter((s) => !inPlan.includes(s)) : [];

  return (
    <section id="plan" aria-labelledby="plan-heading" className={clsx("rounded-[var(--radius)] border border-line-2 bg-surface p-5 sm:p-6", className)}>
      <h2 id="plan-heading" className="text-[16px] font-semibold">
        Exam plan
      </h2>
      <p className="mt-1 text-meta text-ink-2">
        The units you are entered for, on CCEA&rsquo;s own dates. Today, Papers and the Map all read this list. A unit you have already sat keeps its place: choose the series you sat it in.
      </p>

      {!plan ? (
        <div className="mt-4 flex flex-col gap-3" aria-busy="true" aria-label="Loading your plan">
          <Skeleton className="h-11 w-full" />
          <Skeleton className="h-11 w-full" />
          <Skeleton className="h-11 w-2/3" />
        </div>
      ) : (
        <form
          className="mt-4 flex flex-col gap-6"
          onSubmit={(e) => {
            e.preventDefault();
            void onSave();
          }}
        >
          <label className="flex flex-col gap-1 text-meta">
            <span className="text-ink-2">Your first name</span>
            <input className={clsx(controlCls, "w-full")} value={plan.learnerName ?? ""} onChange={(e) => change((p) => ({ ...p, learnerName: e.target.value || null }))} placeholder="Optional" autoComplete="given-name" />
          </label>

          {[...inPlan.map((s) => s.id), ...unknown].map((subjectId) => {
            const subject = cat.find((c) => c.id === subjectId);
            const rows = plan.entries.map((e, i) => ({ e, i })).filter(({ e }) => e.subject === subjectId);
            const order = sortUnits(subjectId, rows.map(({ e }) => e.unit));
            rows.sort((a, b) => order.indexOf(a.e.unit) - order.indexOf(b.e.unit));
            return (
              <fieldset key={subjectId} className="min-w-0" data-subject-group={subjectId}>
                <legend className="text-ui font-semibold text-ink">{subject?.title ?? subjectId}</legend>
                {subject && subject.rules.length > 0 && <p className="mt-1 text-meta text-ink-2">{subject.rules[0]}</p>}
                <ul className="mt-2 divide-y divide-line border-t border-line">
                  {rows.map(({ e, i }) => (
                    <EntryRow
                      key={`${e.subject}:${e.unit}`}
                      entry={e}
                      paper={paperOf(e)}
                      tiered={subject?.tieredByEntry ?? e.tier !== null}
                      today={today}
                      onChange={(patch) => setEntry(i, patch)}
                      onRemove={() => removeEntry(i)}
                    />
                  ))}
                </ul>
                {subject && <AddUnit subject={subject} plan={plan} today={today} onAdd={addEntry} />}
              </fieldset>
            );
          })}

          {addable.length > 0 && (
            <label className="flex flex-wrap items-center gap-2 text-meta text-ink-2">
              <span>Add a subject</span>
              <select
                className={controlCls}
                value=""
                onChange={(e) => {
                  const id = e.target.value;
                  if (id) setAdding((a) => (a.includes(id) ? a : [...a, id]));
                }}
              >
                <option value="" disabled>
                  Choose a subject
                </option>
                {addable.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.title}
                  </option>
                ))}
              </select>
            </label>
          )}

          <label className="flex flex-col gap-1 text-meta">
            <span className="text-ink-2">Evenings a week you plan to study</span>
            <select className={clsx(controlCls, "w-full sm:max-w-[12rem]")} value={plan.sessionsPerWeek} onChange={(e) => change((p) => ({ ...p, sessionsPerWeek: Number(e.target.value) }))}>
              {[1, 2, 3, 4, 5, 6, 7].map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
            <span className="text-ink-2">A plan, not a target: Today counts what you did, never what you did not.</span>
          </label>

          <div className="flex flex-wrap items-center gap-3">
            <button type="submit" className={dirty ? btnPrimary : btnSecondary} disabled={!dirty} aria-disabled={!dirty}>
              Save plan
            </button>
            {status ? (
              <span className="text-meta text-ink-2" role="status">
                {status}
              </span>
            ) : dirty ? (
              <span className="text-meta text-ink-2">Not saved yet.</span>
            ) : null}
          </div>
        </form>
      )}
    </section>
  );
}
