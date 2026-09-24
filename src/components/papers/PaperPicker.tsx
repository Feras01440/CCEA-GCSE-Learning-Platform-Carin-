"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Ban, Calculator, ExternalLink, Info, Timer } from "lucide-react";
import { clsx } from "clsx";
import {
  CCEA_LINK_NOTICE,
  SUBJECTS,
  compareSessionsDesc,
  formatMinutes,
  runnerHref,
  sessionLabel,
  unitFilterLabel,
  unitLabel,
  unitsForSubject,
  type PaperSubject,
  type PickerPaper,
  type Tier,
} from "@/lib/papers/meta";

const SUBJECT_KEY = "cairn:papers:subject";
const DEFAULT_SESSIONS_SHOWN = 6;

function isSubject(v: string | null): v is PaperSubject {
  return v === "maths" || v === "further-maths" || v === "science";
}

function PaperCard({ p }: { p: PickerPaper }) {
  const calc = p.subject === "science" ? null : p.calculator;
  return (
    <article className="flex flex-col gap-3 rounded-[var(--radius)] border border-line bg-surface p-4 shadow-[var(--shadow-1)]">
      <div>
        <h3 className="text-[16px] font-semibold leading-tight">{unitLabel(p)}</h3>
        <p className="tnum mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-meta text-ink-2">
          <span>{sessionLabel(p.sessionKey)}</span>
          <span aria-hidden>·</span>
          <span>{p.marks} marks</span>
          <span aria-hidden>·</span>
          <span>{formatMinutes(p.durationMinutes)}</span>
          {calc !== null && (
            <>
              <span aria-hidden>·</span>
              <span className="inline-flex items-center gap-1">
                {calc ? <Calculator size={13} aria-hidden /> : <Ban size={13} aria-hidden />}
                {calc ? "Calculator" : "Non-calculator"}
              </span>
            </>
          )}
        </p>
      </div>
      {!p.markSchemeUrl && (
        <p className="inline-flex w-fit items-center gap-1.5 rounded-full border border-line-2 px-2.5 py-1 text-meta text-ink-2">
          <Info size={13} aria-hidden /> Mark scheme not yet published
        </p>
      )}
      <div className="mt-auto flex flex-wrap items-center gap-x-4 gap-y-1 text-meta">
        <a href={p.url} target="_blank" rel="noopener noreferrer" className="tap inline-flex items-center gap-1 text-ink-2 underline decoration-line-2 underline-offset-4 hover:text-ink">
          <ExternalLink size={14} aria-hidden /> Open paper (ccea.org.uk)
        </a>
        {p.markSchemeUrl && (
          <a href={p.markSchemeUrl} target="_blank" rel="noopener noreferrer" className="tap inline-flex items-center gap-1 text-ink-2 underline decoration-line-2 underline-offset-4 hover:text-ink">
            <ExternalLink size={14} aria-hidden /> Open mark scheme
          </a>
        )}
      </div>
      {p.runnable ? (
        <Link href={runnerHref(p.id)} className="tap inline-flex w-fit items-center gap-2 rounded-[var(--radius-sm)] border border-ink px-4 text-meta font-medium hover:bg-surface-2">
          <Timer size={15} aria-hidden /> Start timed run
        </Link>
      ) : (
        <p className="text-meta text-ink-2">No mark scheme for this paper, so there is no timed run; the paper itself is still worth reading.</p>
      )}
    </article>
  );
}

export function PaperPicker({ papers }: { papers: Record<PaperSubject, PickerPaper[]> }) {
  const [subject, setSubject] = useState<PaperSubject>("maths");
  const [unit, setUnit] = useState<string>("all");
  const [tier, setTier] = useState<"all" | Tier>("all");
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(SUBJECT_KEY);
      if (isSubject(stored)) setSubject(stored);
    } catch {
      // ignore
    }
  }, []);

  const pick = (s: PaperSubject) => {
    setSubject(s);
    setUnit("all");
    setTier("all");
    setShowAll(false);
    try {
      localStorage.setItem(SUBJECT_KEY, s);
    } catch {
      // ignore
    }
  };

  const tiered = subject !== "further-maths";

  const filtered = useMemo(
    () => papers[subject].filter((p) => (unit === "all" || p.unit === unit) && (tier === "all" || p.tier === tier)),
    [papers, subject, unit, tier],
  );

  const grouped = useMemo(() => {
    const map = new Map<string, PickerPaper[]>();
    for (const p of filtered) {
      const list = map.get(p.sessionKey);
      if (list) list.push(p);
      else map.set(p.sessionKey, [p]);
    }
    return [...map.entries()].sort((a, b) => compareSessionsDesc(a[0], b[0]));
  }, [filtered]);

  const visible = showAll ? grouped : grouped.slice(0, DEFAULT_SESSIONS_SHOWN);
  const hidden = grouped.length - visible.length;

  return (
    <div>
      <div role="tablist" aria-label="Subject" className="flex flex-wrap gap-1 rounded-[var(--radius)] border border-line bg-surface p-1">
        {SUBJECTS.map((s) => {
          const active = s.id === subject;
          return (
            <button
              key={s.id}
              role="tab"
              type="button"
              id={`tab-${s.id}`}
              aria-selected={active}
              aria-controls={`panel-${s.id}`}
              onClick={() => pick(s.id)}
              className={clsx(
                "tap flex-1 rounded-[10px] px-3 text-ui",
                active ? "bg-accent-3 font-medium text-ink" : "text-ink-2 hover:bg-surface-2 hover:text-ink",
              )}
            >
              {s.label}
              <span className="tnum ml-1.5 text-meta text-ink-2">{papers[s.id].length}</span>
            </button>
          );
        })}
      </div>

      <div id={`panel-${subject}`} role="tabpanel" aria-labelledby={`tab-${subject}`} className="mt-4">
        <div className="flex flex-wrap items-end gap-3">
          <label className="flex flex-col gap-1 text-meta font-medium text-ink-2">
            Unit
            <select
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
              className="tap rounded-[var(--radius-sm)] border border-line-3 bg-surface px-3 text-ui font-normal text-ink"
            >
              <option value="all">All units</option>
              {unitsForSubject(subject).map((u) => (
                <option key={u} value={u}>
                  {unitFilterLabel(subject, u)}
                </option>
              ))}
            </select>
          </label>
          {tiered && (
            <div className="flex flex-col gap-1 text-meta font-medium text-ink-2">
              <span id="tier-label">Tier</span>
              <div role="group" aria-labelledby="tier-label" className="inline-flex rounded-[var(--radius-sm)] border border-line-2 p-0.5">
                {(["all", "H", "F"] as const).map((t) => (
                  <button
                    key={t}
                    type="button"
                    aria-pressed={tier === t}
                    onClick={() => setTier(t)}
                    className={clsx(
                      "tap rounded-[8px] px-3 text-meta font-normal",
                      tier === t ? "bg-ink font-medium text-surface" : "text-ink-2 hover:bg-surface-2",
                    )}
                  >
                    {t === "all" ? "Both" : t === "H" ? "Higher" : "Foundation"}
                  </button>
                ))}
              </div>
            </div>
          )}
          <p className="tnum ml-auto self-center text-meta text-ink-2">
            {filtered.length} paper{filtered.length === 1 ? "" : "s"} · Standard papers only
          </p>
        </div>

        {grouped.length === 0 ? (
          <p className="mt-6 text-ink-2">No papers match those filters.</p>
        ) : (
          <div className="mt-6 space-y-8">
            {visible.map(([sessionKey, list]) => (
              <section key={sessionKey} aria-labelledby={`session-${sessionKey}`}>
                <div className="mb-3 flex flex-wrap items-baseline gap-x-3 gap-y-1">
                  <h2 id={`session-${sessionKey}`} className="text-[18px] font-semibold tracking-tight">
                    {sessionLabel(sessionKey)}
                  </h2>
                  <span className="tnum text-meta text-ink-2">
                    {list.length} paper{list.length === 1 ? "" : "s"}
                    {list.every((p) => !p.markSchemeUrl) && " · mark schemes not yet published"}
                  </span>
                </div>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {list.map((p) => (
                    <PaperCard key={p.id} p={p} />
                  ))}
                </div>
              </section>
            ))}
            {hidden > 0 && (
              <button type="button" onClick={() => setShowAll(true)} className="tap rounded-[var(--radius-sm)] border border-line-2 px-4 text-meta font-medium hover:bg-surface-2">
                Show {hidden} older sitting{hidden === 1 ? "" : "s"}
              </button>
            )}
          </div>
        )}

        <div className="mt-8 space-y-1 border-t border-line pt-4 text-meta text-ink-2">
          <p>{CCEA_LINK_NOTICE} Papers and mark schemes are © CCEA and open on ccea.org.uk in a new tab; nothing is re-hosted here.</p>
          {subject === "science" && (
            <p>Unit 7 Booklet A is the pre-release lab practical, marked by CCEA from the work done in class, so it is not listed as a timed paper.</p>
          )}
          {subject === "maths" && <p>M5–M8 are sat as two papers (Paper 1 non-calculator, Paper 2 calculator); each is timed on its own and the unit UMS uses both.</p>}
        </div>
      </div>
    </div>
  );
}
