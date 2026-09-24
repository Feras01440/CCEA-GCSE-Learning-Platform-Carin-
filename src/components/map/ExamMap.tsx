"use client";

import Link from "next/link";
import { useLiveQuery } from "dexie-react-hooks";
import { clsx } from "clsx";
import { getDB, type TopicMastery } from "@/lib/db/db";
import { useExamPlan } from "@/lib/plan/store";
import { catalogue, formatPaperDate, isTypedSubject, planUnits, todayISO, type ExamPlan, type PlanGroup, type PlanUnit } from "@/lib/plan/exam-plan";
import { chooseNextStep } from "@/lib/plan/next-step";
import { daysAwayWord } from "@/lib/papers/plan-view";
import { topicsFor, type Subject } from "@/lib/content/taxonomy";
import { contentIndex } from "@/lib/content/load";
import { levelLabel } from "@/lib/mastery/engine";
import { CairnStack } from "@/components/ux/CairnStack";
import { Loading, RowsSkeleton } from "@/components/ux/Skeleton";
import { RowanMark } from "@/components/companion/RowanMark";
import { useCompanionPresence } from "@/lib/companion";
import { JourneyChart } from "./JourneyChart";

/**
 * The Map: the units of her plan and nothing else, what she has proved in each, and when each is sat
 * (docs/plan/review/2026-09-22-platform-audit.md §6.7: "her units only, stones per unit, no bars").
 *
 * Everything is derived from her plan and the exam map: a unit appears because it is in her plan (M3 is off the
 * Map only because it is not; if she adds it, it appears), the order is this school year's papers first, then later
 * ones, then what she has sat, and the names come from the data. A paper is a place on the calendar, said once at the
 * end of its row in words ("in 237 days"), never a bar whose length is the time left (02-surfaces.md §5). Stones are
 * proved topics, placed only; a unit with none shows no stack and no zero. Every topic of the unit is a square coloured
 * by what she has shown, and a topic with no lesson here yet is an outline, so the Map never asks for work that does
 * not exist.
 */

const BUILT = contentIndex();
const isBuilt = (subject: Subject, slug: string) => BUILT.has(`${subject}:${slug}`);

/** Darker is further on; a topic with no lesson here yet is the faintest thing on the Map, an outline. */
const LEVEL_CLASS: Record<TopicMastery["level"], string> = {
  "not-started": "bg-line-2",
  attempted: "bg-line-3",
  familiar: "bg-ink-3",
  proficient: "bg-accent",
  mastered: "bg-ink",
};
const NO_LESSON_CLASS = "border border-line-2 bg-transparent";

const GROUP_LABEL: Record<PlanGroup, string> = {
  "this-year": "This year",
  later: "Later",
  sat: "Already sat",
  unscheduled: "No sitting in the series chosen",
};

const proved = (level: TopicMastery["level"] | undefined) => level === "proficient" || level === "mastered";

/** When the unit is sat, as a place on the calendar: "Tue 18 May 2027 · in 237 days". */
function unitWhen(u: PlanUnit): string {
  if (!u.paper) return "Choose a series with a sitting in Settings";
  if (u.daysAway < 0) return `Sat on ${formatPaperDate(u.date)}`;
  if (u.paper.booklets) return `After ${u.paper.booklets.map((b) => b.after).join(", ")}, from ${formatPaperDate(u.date)} · ${daysAwayWord(u.daysAway)}`;
  return `${formatPaperDate(u.date)} · ${daysAwayWord(u.daysAway)}`;
}

function UnitRow({ u, byKey }: { u: PlanUnit; byKey: Map<string, TopicMastery> }) {
  const typed = isTypedSubject(u.subject);
  const topics = typed ? topicsFor(u.subject as Subject, u.unit) : [];
  const rows = topics.map((t) => ({ t, level: byKey.get(`${u.subject}:${t.slug}`)?.level, built: typed && isBuilt(u.subject as Subject, t.slug) }));
  const stones = rows.filter((r) => proved(r.level)).length;
  const built = rows.filter((r) => r.built).length;
  const meta =
    topics.length === 0
      ? "No topics listed here yet"
      : [`${topics.length} topics${built < topics.length ? `, ${built === 0 ? "no lessons" : `${built} with lessons`} here yet` : ""}`, stones > 0 ? `${stones} proved` : null]
          .filter(Boolean)
          .join(" · ");

  return (
    <li className="py-3" data-unit={u.unit}>
      <div className="flex flex-wrap items-baseline justify-between gap-x-4">
        {typed ? (
          <Link href={`/learn/${u.subject}/${u.unit}/`} className="tap inline-flex items-center text-ui font-medium underline-offset-4 hover:underline">
            {u.name}
          </Link>
        ) : (
          <span className="tap inline-flex items-center text-ui font-medium">{u.name}</span>
        )}
        <span className="tnum text-meta text-ink-2">{unitWhen(u)}</span>
      </div>
      <div className="mt-1 flex items-end justify-between gap-4">
        <div className="min-w-0 flex-1">
          {rows.length > 0 && (
            <div
              className="flex flex-wrap gap-[3px]"
              role="img"
              aria-label={`${u.name}: ${topics.length} topics, ${stones} proved${built < topics.length ? `, ${topics.length - built} with no lesson here yet` : ""}`}
            >
              {rows.map(({ t, level, built: has }) => (
                <span
                  key={t.slug}
                  title={`${t.title} · ${has ? levelLabel(level ?? "not-started") : "No lesson here yet"}`}
                  className={clsx("h-3.5 w-3.5 rounded-[3px]", has || level ? LEVEL_CLASS[level ?? "not-started"] : NO_LESSON_CLASS)}
                />
              ))}
            </div>
          )}
          <p className="tnum mt-1.5 text-meta text-ink-2">{meta}</p>
        </div>
        {stones > 0 && <CairnStack count={stones} size="sm" className="shrink-0" />}
      </div>
    </li>
  );
}

function Legend() {
  const items: Array<[string, string]> = [
    ["Not started", LEVEL_CLASS["not-started"]],
    ["Attempted", LEVEL_CLASS.attempted],
    ["Familiar", LEVEL_CLASS.familiar],
    ["Proficient", LEVEL_CLASS.proficient],
    ["Mastered", LEVEL_CLASS.mastered],
    ["No lesson here yet", NO_LESSON_CLASS],
  ];
  return (
    <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5 text-meta text-ink-2" aria-label="What the squares mean">
      {items.map(([label, cls]) => (
        <li key={label} className="inline-flex items-center gap-1.5">
          <span className={clsx("h-3 w-3 rounded-[3px]", cls)} aria-hidden /> {label}
        </li>
      ))}
    </ul>
  );
}

function Units({ plan, mastery, today }: { plan: ExamPlan; mastery: TopicMastery[]; today: string }) {
  const byKey = new Map(mastery.map((m) => [m.key, m]));
  const units = planUnits(plan, today);
  if (units.length === 0) {
    return <p className="py-6 text-ui text-ink-2">No units in your plan yet. Add the ones you are entered for in Settings and they appear here on CCEA&rsquo;s dates.</p>;
  }
  const groups: Array<{ group: PlanGroup; units: PlanUnit[] }> = [];
  for (const u of units) {
    const last = groups[groups.length - 1];
    if (last && last.group === u.group) last.units.push(u);
    else groups.push({ group: u.group, units: [u] });
  }
  // One group needs no label; with more than one, each says what it is.
  const labelled = groups.length > 1;
  return (
    <>
      {groups.map((g) => (
        <div key={g.group} className="mt-3" data-group={g.group}>
          {labelled && <h3 className="text-meta font-medium text-ink-2">{GROUP_LABEL[g.group]}</h3>}
          <ol className="divide-y divide-line border-t border-line">
            {g.units.map((u) => (
              <UnitRow key={`${u.subject}:${u.unit}`} u={u} byKey={byKey} />
            ))}
          </ol>
        </div>
      ))}
      <Legend />
    </>
  );
}

export function ExamMap() {
  const plan = useExamPlan();
  const today = todayISO();
  const mastery = useLiveQuery(async () => {
    try {
      return await getDB().mastery.toArray();
    } catch {
      return [] as TopicMastery[];
    }
  }, []);

  const next = plan && mastery ? chooseNextStep(plan, mastery, today, isBuilt) : null;
  // Rowan's place on the Map is a drawing, so it follows what she sees of Rowan: only in Full (never in Words only or
  // Quiet), read from the same state row every other surface reads.
  const presence = useCompanionPresence();

  // The rules of the subjects in her plan, and only those, in the exam map's order.
  const inPlan = new Set((plan?.entries ?? []).map((e) => e.subject));
  const rules = catalogue()
    .filter((s) => inPlan.has(s.id))
    .flatMap((s) => s.rules);

  return (
    <div className="flex flex-col">
      <section aria-labelledby="units-heading">
        <div className="flex items-center justify-between gap-3">
          <h2 id="units-heading" className="text-h3 font-semibold">
            Your units
          </h2>
          <Link href="/settings/#plan" className="tap inline-flex items-center text-meta text-ink-2 underline-offset-4 hover:text-ink hover:underline">
            Change entries
          </Link>
        </div>
        <Loading loading={plan === undefined || mastery === undefined} label="Loading your plan" skeleton={<RowsSkeleton rows={4} />}>
          {plan && mastery && <Units plan={plan} mastery={mastery} today={today} />}
        </Loading>
      </section>

      <section aria-labelledby="journey-heading" className="section-rule">
        <h2 id="journey-heading" className="flex items-center gap-2 text-h3 font-semibold">
          Your journey
          {/* The `map-place` slot: Rowan's mark, the hare's head and ears, and never a line; drawn only in Full. */}
          {presence === "full" && <RowanMark className="shrink-0 text-ink-3" />}
        </h2>
        <JourneyChart mastery={mastery ?? []} startHref={next?.href ?? "/learn/"} />
      </section>

      {rules.length > 0 && (
        <section aria-labelledby="rules-heading" className="section-rule">
          <h2 id="rules-heading" className="text-h3 font-semibold">
            Rules that decide your grade
          </h2>
          <ul className="mt-3 list-disc space-y-1.5 rounded-[var(--radius-sm)] bg-surface-2 p-4 pl-8 text-meta text-ink-2">
            {rules.map((r) => (
              <li key={r}>{r}</li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
