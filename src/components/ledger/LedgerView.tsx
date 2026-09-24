"use client";

import Link from "next/link";
import { useLiveQuery } from "dexie-react-hooks";
import { getDB, type Attempt, type Mock } from "@/lib/db/db";
import { LOSS_TAGS, summariseLedger } from "@/lib/ledger/tags";

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-[var(--radius)] border border-line bg-surface p-5 shadow-[var(--shadow-1)]">
      <h2 className="text-meta font-medium text-ink-2">{title}</h2>
      <div className="mt-3">{children}</div>
    </section>
  );
}

export function LedgerView() {
  const attempts = useLiveQuery(async () => {
    try {
      return await getDB().attempts.orderBy("at").reverse().limit(2000).toArray();
    } catch {
      return [] as Attempt[];
    }
  }, []);
  const mocks = useLiveQuery(async () => {
    try {
      return await getDB().mocks.orderBy("at").reverse().limit(200).toArray();
    } catch {
      return [] as Mock[];
    }
  }, []);

  if (!attempts || !mocks) return <p className="text-meta text-ink-2">Loading…</p>;
  const s = summariseLedger(attempts, mocks);

  if (s.totalLost === 0) {
    return (
      <Card title="Marks lost">
        <p className="text-ui">Nothing in the ledger yet.</p>
        <p className="mt-1 text-meta text-ink-2">
          Every mark you drop in practice, mixed sets and official papers lands here with a reason, so you can see which marks are cheapest to get back.
        </p>
        <Link href="/papers/" className="mt-3 inline-block text-meta underline-offset-2 hover:underline">
          Sit a timed paper
        </Link>
      </Card>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card title="Marks lost, by reason">
        <p className="tnum text-[28px] font-semibold tracking-tight">{s.totalLost}</p>
        {/* Marks a first go dropped and a later go in the same sitting won back: not lost, but part of the night's
            count (engine item 8: the audit's night is 4 lost and 2 won back). */}
        {s.recovered > 0 && (
          <p className="mt-1 text-meta text-ink-2">
            {s.recovered} more dropped on a first go and won back in the same sitting.
          </p>
        )}
        <ul className="mt-3 flex flex-col gap-2">
          {s.byTag.map((r) => {
            const meta = LOSS_TAGS.find((t) => t.id === r.tag)!;
            return (
              <li key={r.tag} className="text-meta">
                <div className="flex items-baseline justify-between">
                  <span className="font-medium">{meta.label}</span>
                  <span className="tnum text-ink-2">{r.marks}</span>
                </div>
                <div className="mt-1 h-1.5 rounded-full bg-line" aria-hidden>
                  <div className="h-1.5 rounded-full bg-ink-3" style={{ width: `${Math.round(r.share * 100)}%` }} />
                </div>
                <p className="mt-0.5 text-meta text-ink-2">{meta.hint}</p>
              </li>
            );
          })}
        </ul>
        {s.cheapest && (
          <p className="mt-4 rounded-[var(--radius-sm)] bg-accent-3 px-3 py-2 text-meta">
            The {LOSS_TAGS.find((t) => t.id === s.cheapest)!.label.toLowerCase()} marks are the cheapest to recover: nothing new to learn, only a habit to fix.
          </p>
        )}
      </Card>
      <Card title="Where they went">
        <ol className="flex flex-col divide-y divide-line">
          {s.byPlace.slice(0, 14).map((r) => (
            <li key={`${r.subject}:${r.where}`} className="flex items-baseline justify-between py-2 text-meta">
              <span className="min-w-0 truncate">
                {r.source === "paper" ? r.where.replace(/^paper:/, "") : r.where.replace(/-/g, " ")}
                <span className="ml-2 text-meta text-ink-2">{r.source === "paper" ? "official paper" : "practice"}</span>
              </span>
              <span className="tnum ml-3 shrink-0 text-ink-2">
                {r.marks} mark{r.marks === 1 ? "" : "s"}
              </span>
            </li>
          ))}
        </ol>
      </Card>
    </div>
  );
}
