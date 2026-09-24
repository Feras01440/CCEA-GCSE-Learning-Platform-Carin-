"use client";

/**
 * "What Rowan remembers": the Settings list, with a delete on every row and one control that
 * empties the lot.
 *
 * The memory is private only if she can see it and remove it, and a backup restored on a family
 * laptop would otherwise carry her notes with it, so the export toggle lives here too and is off
 * until she turns it on (companionExportExclusions in src/lib/companion/memory.ts).
 *
 * Nothing on this screen is a reward or a record of attendance: it is a list of sentences she typed.
 */

import { useEffect, useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { Trash2 } from "lucide-react";
import { clsx } from "clsx";
import { getSetting, setSetting } from "@/lib/plan/store";
import {
  EXPORT_NOTES_SETTING,
  deleteNote,
  forgetEverything,
  listNotes,
  readCompanionState,
  rowanName,
  type CompanionNote,
  type NoteKind,
} from "@/lib/companion";

const KIND_LABEL: Record<NoteKind, string> = {
  "cairn-note": "A line you left",
  felt: "How a session went",
  "when-next": "When you said next",
  taught: "Something you explained",
  "paper-recall": "After a paper",
};

export interface CompanionMemoryProps {
  /** Injected for tests and the gallery. Left out, the list reads the database itself. */
  notes?: CompanionNote[];
  onDelete?: (id: number) => void;
  onForget?: () => void;
  className?: string;
}

export function CompanionMemory({ notes, onDelete, onForget, className }: CompanionMemoryProps) {
  const live = useLiveQuery(async () => {
    try {
      return await listNotes();
    } catch {
      return [] as CompanionNote[];
    }
  }, []);
  const rows = notes ?? live;
  // The name she calls it by, read without seeding (a write inside a liveQuery throws).
  const name = useLiveQuery(async () => {
    try {
      return rowanName((await readCompanionState(new Date())).state);
    } catch {
      return rowanName(null);
    }
  }, []) ?? rowanName(null);
  const [confirming, setConfirming] = useState(false);
  const [inExport, setInExport] = useState(false);

  useEffect(() => {
    getSetting(EXPORT_NOTES_SETTING, false)
      .then(setInExport)
      .catch(() => setInExport(false));
  }, []);

  async function remove(id: number | undefined) {
    if (id == null) return;
    if (onDelete) onDelete(id);
    else await deleteNote(id);
  }

  async function forgetAll() {
    setConfirming(false);
    if (onForget) onForget();
    else await forgetEverything();
  }

  async function toggleExport(next: boolean) {
    setInExport(next);
    try {
      await setSetting(EXPORT_NOTES_SETTING, next);
    } catch {
      setInExport(!next);
    }
  }

  return (
    <section className={clsx("rounded-[var(--radius)] border border-line bg-surface p-5 shadow-[var(--shadow-1)]", className)}>
      <h2 className="text-[16px] font-semibold">What {name} remembers</h2>
      <p className="mt-1 text-meta text-ink-2">
        Only what you typed or chose, and only on this device. Delete any of it, at any time.
      </p>

      {rows === undefined ? (
        <p className="mt-3 text-meta text-ink-2">Reading the list.</p>
      ) : rows.length === 0 ? (
        <p className="mt-3 text-meta text-ink-2">
          Nothing you have written. Apart from the choices on this page, it keeps only which lines it has said in the
          last two weeks, so it does not repeat itself.
        </p>
      ) : (
        <ul className="mt-3 divide-y divide-line">
          {rows.map((n) => (
            <li key={n.id ?? `${n.at.getTime()}-${n.text}`} className="flex items-start justify-between gap-3 py-2.5">
              <div className="min-w-0">
                <p className="text-meta text-ink-2">
                  {KIND_LABEL[n.kind]} · {n.at.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                </p>
                <p className="mt-0.5 break-words text-ui">{n.text}</p>
              </div>
              <button
                type="button"
                onClick={() => void remove(n.id)}
                aria-label={`Delete this note from ${n.at.toLocaleDateString("en-GB")}`}
                className="tap shrink-0 rounded-[var(--radius-sm)] border border-line-2 px-3 text-meta font-medium hover:bg-surface-2"
              >
                <Trash2 size={15} aria-hidden />
              </button>
            </li>
          ))}
        </ul>
      )}

      <label className="mt-4 flex items-start gap-2 text-meta text-ink-2">
        <input type="checkbox" checked={inExport} onChange={(e) => void toggleExport(e.target.checked)} className="mt-1" />
        <span>Include these notes in the backup file. Off by default, because a backup can be restored by somebody else.</span>
      </label>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        {confirming ? (
          <>
            <button type="button" onClick={() => void forgetAll()} className="tap rounded-[var(--radius-sm)] border border-line-2 px-4 text-meta font-medium text-danger hover:bg-surface-2">
              Yes, forget everything
            </button>
            <button type="button" onClick={() => setConfirming(false)} className="tap rounded-[var(--radius-sm)] px-4 text-meta font-medium text-ink-2 hover:bg-surface-2">
              Keep it
            </button>
          </>
        ) : (
          <button type="button" onClick={() => setConfirming(true)} className="tap rounded-[var(--radius-sm)] border border-line-2 px-4 text-meta font-medium hover:bg-surface-2">
            Forget everything
          </button>
        )}
        {confirming && <span className="text-meta text-ink-2">Your notes and the name you gave it. Your progress is untouched.</span>}
      </div>
    </section>
  );
}
