"use client";

import { useEffect, useMemo, useState } from "react";
import { CONTENT_MANIFEST, loadBundle, type ShippedBundle } from "@/lib/content/load";
import type { Question } from "@/lib/content/schema";
import { QuestionRunner } from "@/components/topic/QuestionRunner";
import type { Subject } from "@/lib/content/taxonomy";
import { unitsFor } from "@/lib/content/taxonomy";
import { ProgressLine } from "@/components/ux/ProgressLine";

type Calc = "any" | "calc" | "non-calc";

interface Pool {
  topicId: string;
  slug: string;
  unit: string;
  subject: Subject;
  title: string;
  questions: Question[];
}

/** No two consecutive items from the same topic when avoidable; deterministic per seed. */
function interleave(items: Array<{ topicId: string; q: Question }>, seed: number): Array<{ topicId: string; q: Question }> {
  let s = seed || 1;
  const rnd = () => ((s = (s * 1664525 + 1013904223) % 4294967296) / 4294967296);
  const pool = [...items].sort(() => rnd() - 0.5);
  const out: typeof pool = [];
  while (pool.length) {
    const last = out[out.length - 1];
    let i = pool.findIndex((x) => !last || x.topicId !== last.topicId);
    if (i === -1) i = 0;
    out.push(pool.splice(i, 1)[0]);
  }
  return out;
}

export function MixedPractice() {
  const [subject, setSubject] = useState<Subject>("maths");
  const [units, setUnits] = useState<Set<string>>(new Set());
  const [calc, setCalc] = useState<Calc>("any");
  const [size, setSize] = useState(6);
  const [pools, setPools] = useState<Pool[] | null>(null);
  const [set, setSet] = useState<Array<{ topicId: string; q: Question }> | null>(null);
  const [index, setIndex] = useState(0);
  const [score, setScore] = useState({ marks: 0, available: 0 });

  const shipped = useMemo(() => CONTENT_MANIFEST.topics.filter((t) => t.subject === subject), [subject]);
  const unitOptions = useMemo(() => unitsFor(subject).filter((u) => shipped.some((t) => t.unit === u.code)), [subject, shipped]);

  useEffect(() => {
    let cancelled = false;
    Promise.all(
      shipped.map(async (t) => {
        const b: ShippedBundle = await loadBundle(t.subject, t.id);
        return { topicId: t.id, slug: t.slug, unit: t.unit, subject: t.subject as Subject, title: t.title, questions: b.questions };
      }),
    ).then((p) => {
      if (!cancelled) setPools(p);
    });
    return () => {
      cancelled = true;
    };
  }, [shipped]);

  const candidates = useMemo(() => {
    if (!pools) return [];
    return pools
      .filter((p) => units.size === 0 || units.has(p.unit))
      .flatMap((p) =>
        p.questions
          .filter((q) => calc === "any" || (calc === "calc" ? q.paper.calculator !== false : q.paper.calculator === false))
          .map((q) => ({ topicId: p.topicId, q })),
      );
  }, [pools, units, calc]);

  function start() {
    const chosen = interleave(candidates, Date.now() % 100000).slice(0, size);
    setSet(chosen);
    setIndex(0);
    setScore({ marks: 0, available: 0 });
  }

  if (set) {
    if (index >= set.length) {
      return (
        <div className="rise-in mx-auto max-w-xl rounded-[var(--radius)] border border-line bg-surface p-6 shadow-[var(--shadow-2)]">
          <p className="text-meta font-medium text-ink-2">Mixed set complete</p>
          <p className="tnum mt-2 text-[28px] font-semibold tracking-tight">
            {score.marks} / {score.available} marks
          </p>
          <p className="mt-1 text-meta text-ink-2">Lost marks are in the ledger with their reasons. Anything you missed will come back in your reviews.</p>
          <div className="mt-5 flex gap-2">
            <button type="button" className="tap rounded-[var(--radius-sm)] bg-accent px-5 font-medium text-accent-ink" onClick={start}>
              Another set
            </button>
            <button type="button" className="tap rounded-[var(--radius-sm)] border border-line-2 px-5 font-medium" onClick={() => setSet(null)}>
              Change the mix
            </button>
          </div>
        </div>
      );
    }
    const cur = set[index];
    const pool = pools?.find((p) => p.topicId === cur.topicId);
    return (
      <div className="mx-auto max-w-2xl">
        <ProgressLine value={index} max={set.length} label="Questions done" />
        <p className="mb-3 mt-3 text-meta text-ink-2">
          <span className="tnum">
            {index + 1} of {set.length}
          </span>
          {" · "}no topic labels: work out what it is asking
        </p>
        <QuestionRunner
          key={cur.q.id}
          q={cur.q}
          kind="practice"
          item={{ subject: pool?.subject ?? subject, unit: pool?.unit ?? "", topicSlug: pool?.slug ?? "" }}
          onDone={(m, a) => {
            setScore((s) => ({ marks: s.marks + m, available: s.available + a }));
          }}
        />
        <div className="mt-3 flex justify-end">
          <button type="button" className="tap rounded-[var(--radius-sm)] border border-line-2 px-5 text-meta font-medium hover:bg-surface-2" onClick={() => setIndex((i) => i + 1)}>
            {index + 1 < set.length ? "Next question" : "Finish"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
      <section className="rounded-[var(--radius)] border border-line bg-surface p-5 shadow-[var(--shadow-1)]">
        <h2 className="text-meta font-medium text-ink-2">Build a mixed set</h2>
        <div className="mt-3 flex flex-col gap-4 text-meta">
          <div>
            <p className="text-ink-2">Subject</p>
            <div className="mt-1 flex flex-wrap gap-2">
              {(["maths", "further-maths", "science"] as Subject[]).map((s) => (
                <button
                  key={s}
                  type="button"
                  aria-pressed={subject === s}
                  onClick={() => {
                    setSubject(s);
                    setUnits(new Set());
                  }}
                  className={`tap rounded-[var(--radius-sm)] border px-4 ${subject === s ? "border-ink bg-ink text-ground" : "border-line-2"}`}
                >
                  {s === "maths" ? "Maths" : s === "further-maths" ? "Further Maths" : "Science"}
                </button>
              ))}
            </div>
          </div>
          <div>
            <p className="text-ink-2">Units (none selected = all with content)</p>
            <div className="mt-1 flex flex-wrap gap-2">
              {unitOptions.map((u) => (
                <button
                  key={u.code}
                  type="button"
                  aria-pressed={units.has(u.code)}
                  onClick={() => {
                    const next = new Set(units);
                    if (next.has(u.code)) next.delete(u.code);
                    else next.add(u.code);
                    setUnits(next);
                  }}
                  className={`tap rounded-[var(--radius-sm)] border px-4 ${units.has(u.code) ? "border-ink bg-ink text-ground" : "border-line-2"}`}
                >
                  {u.short}
                </button>
              ))}
              {unitOptions.length === 0 && <p className="text-ink-2">No published questions for this subject yet.</p>}
            </div>
          </div>
          <div>
            <p className="text-ink-2">Calculator</p>
            <div className="mt-1 flex flex-wrap gap-2">
              {(["any", "calc", "non-calc"] as Calc[]).map((c) => (
                <button key={c} type="button" aria-pressed={calc === c} onClick={() => setCalc(c)} className={`tap rounded-[var(--radius-sm)] border px-4 ${calc === c ? "border-ink bg-ink text-ground" : "border-line-2"}`}>
                  {c === "any" ? "Either" : c === "calc" ? "Calculator" : "Non-calculator"}
                </button>
              ))}
            </div>
          </div>
          <div>
            <p className="text-ink-2">Questions</p>
            <div className="mt-1 flex flex-wrap gap-2">
              {[4, 6, 8, 12].map((n) => (
                <button key={n} type="button" aria-pressed={size === n} onClick={() => setSize(n)} className={`tap tnum rounded-[var(--radius-sm)] border px-4 ${size === n ? "border-ink bg-ink text-ground" : "border-line-2"}`}>
                  {n}
                </button>
              ))}
            </div>
          </div>
          <button type="button" disabled={!pools || candidates.length === 0} onClick={start} className="tap self-start rounded-[var(--radius-sm)] bg-accent px-5 font-medium text-accent-ink disabled:opacity-40">
            Start · {Math.min(size, candidates.length)} questions
          </button>
        </div>
      </section>
      <section className="rounded-[var(--radius)] border border-line bg-surface p-5 shadow-[var(--shadow-1)]">
        <h2 className="text-meta font-medium text-ink-2">Why mixed</h2>
        <p className="mt-3 text-meta leading-relaxed text-ink-2">
          Blocked practice tells you the method before you start. In the exam nothing does. Mixed sets with no topic labels are where the recognition step is
          learned, and the evidence says the gain is large. It will feel harder. That is the point.
        </p>
        <p className="mt-3 text-meta text-ink-2">
          Available now: <span className="tnum font-medium text-ink">{candidates.length}</span> original questions across{" "}
          <span className="tnum font-medium text-ink">{pools?.filter((p) => units.size === 0 || units.has(p.unit)).length ?? 0}</span> topics.
        </p>
      </section>
    </div>
  );
}
