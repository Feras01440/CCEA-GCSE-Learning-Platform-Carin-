"use client";

import { useEffect, useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { useTheme, type ThemeName } from "@/lib/theme/ThemeProvider";
import { downloadJson, exportAll, importAll } from "@/lib/db/export";
import { btnSecondary } from "@/components/items/ui";
import { ExamPlanSettings } from "./ExamPlanSettings";
import { deleteNote, forgetEverything, listNotes } from "@/lib/companion";
import { CompanionMemory } from "@/components/companion/CompanionMemory";
import { CompanionVoiceSettings } from "@/components/companion/CompanionVoiceSettings";
import {
  describeSize,
  offlineCopySupported,
  offlineCopyWanted,
  onOfflineCopyProgress,
  requestOfflineCopyStatus,
  setOfflineCopyWanted,
  startOfflineCopy,
  type OfflineCopyProgress,
  type OfflineCopyStatus,
} from "@/lib/offline-copy";

const THEMES: Array<{ id: ThemeName; label: string; hint: string }> = [
  { id: "light", label: "Light", hint: "Exam papers are black on white." },
  { id: "evening", label: "Evening", hint: "Warmer and dimmer for late sessions." },
  { id: "dark", label: "Dark", hint: "" },
  { id: "hc", label: "High contrast", hint: "" },
  { id: "system", label: "Follow device", hint: "Default." },
];

/**
 * An object on the page: every section here holds controls. None of them is the accent: a settings page has no
 * single thing to do next, so its buttons are outlined, and only the plan's Save turns accent while there is
 * something to save (the platform audit counted three accent buttons here).
 */
const sectionCls = "rounded-[var(--radius)] border border-line-2 bg-surface p-5 sm:p-6";

/**
 * The `settings-memory` slot: the list of what she typed, with a delete on every row, the export
 * toggle and "Forget everything" (all of that is CompanionMemory's own), and beside it the voice
 * itself: the name, Quiet and plain words, which CompanionVoiceSettings owns and explains
 * (the companion agent's block, by the lead's ruling of 23 September 2026).
 */
function RowanSettings() {
  const notes = useLiveQuery(async () => {
    try {
      return await listNotes();
    } catch {
      return [];
    }
  }, []);

  return (
    <>
      <CompanionMemory
        notes={notes}
        onDelete={(id) => void deleteNote(id).catch(() => {})}
        onForget={() => void forgetEverything().catch(() => {})}
        className="md:col-span-2"
      />

      <CompanionVoiceSettings className="md:col-span-2" />
    </>
  );
}

export function SettingsPanel() {
  const { theme, setTheme } = useTheme();
  const [backupMsg, setBackupMsg] = useState<string | null>(null);

  async function onExport() {
    const file = await exportAll();
    downloadJson(file);
    setBackupMsg("Backup file downloaded. Keep it somewhere safe.");
  }

  async function onImport(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    try {
      const parsed = JSON.parse(await f.text());
      const mode = window.confirm("Replace everything on this device with the file? Cancel to merge instead.") ? "replace" : "merge";
      const r = await importAll(parsed, mode);
      setBackupMsg(`Restored ${r.rows} rows across ${r.tables} tables (${mode}).`);
    } catch (err) {
      setBackupMsg(`Could not restore: ${String(err)}`);
    } finally {
      e.target.value = "";
    }
  }

  // The full offline copy: status from the worker, live progress while it runs, and the learner's wish.
  const [copy, setCopy] = useState<OfflineCopyStatus | null>(null);
  const [copyChecked, setCopyChecked] = useState(false);
  const [progress, setProgress] = useState<OfflineCopyProgress | null>(null);
  const [copyWanted, setCopyWanted] = useState(false);
  useEffect(() => {
    setCopyWanted(offlineCopyWanted());
    let alive = true;
    requestOfflineCopyStatus().then((s) => {
      if (!alive) return;
      setCopy(s);
      setCopyChecked(true);
    });
    const off = onOfflineCopyProgress((p) => {
      if (!alive) return;
      setProgress(p);
      if (p.finished) requestOfflineCopyStatus().then((s) => alive && setCopy(s));
    });
    return () => {
      alive = false;
      off();
    };
  }, []);
  async function onDownloadCopy() {
    setOfflineCopyWanted(true);
    setCopyWanted(true);
    setProgress({ version: copy?.version ?? "", done: copy?.cached ?? 0, total: copy?.total ?? 0, failed: 0, finished: false });
    await startOfflineCopy();
  }
  function onStopCopy() {
    setOfflineCopyWanted(false);
    setCopyWanted(false);
  }
  const copyComplete = !!copy && copy.total > 0 && copy.cached >= copy.total;
  const copyRunning = !!progress && !progress.finished;
  const copySize = copy ? describeSize(copy.bytes) : "about 50 MB";
  const copyStatusText = !copyChecked
    ? ""
    : !copy
      ? offlineCopySupported()
        ? "Available once the app has finished loading."
        : "Offline copy is available in the installed app, not in this preview."
      : copyRunning
        ? `Downloading… ${progress!.done.toLocaleString()} of ${progress!.total.toLocaleString()} files.`
        : copyComplete
          ? "Every topic and paper is ready offline."
          : copy.cached > 0
            ? `${copy.cached.toLocaleString()} of ${copy.total.toLocaleString()} files are on this device.`
            : "Only the pages you have opened are on this device.";

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <ExamPlanSettings className="md:col-span-2" />

      <section className={`${sectionCls} md:col-span-2`}>
        <h2 className="text-[16px] font-semibold">Your progress lives on this device</h2>
        <p className="mt-1 text-meta text-ink-2">Nothing is sent anywhere. Export a backup every couple of weeks, or before changing phone; restore it on the other device.</p>
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <button type="button" onClick={onExport} className={btnSecondary}>
            Export backup
          </button>
          <label className={`${btnSecondary} cursor-pointer focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-accent`}>
            Restore from file
            <input type="file" accept="application/json" onChange={onImport} className="sr-only" />
          </label>
          {backupMsg && (
            <span className="text-meta text-ink-2" role="status">
              {backupMsg}
            </span>
          )}
        </div>
      </section>

      <section className={`${sectionCls} md:col-span-2`}>
        <h2 className="text-[16px] font-semibold">Study without signal</h2>
        <p className="mt-1 text-meta text-ink-2">
          Every page you open is kept on this device, so it works again when the signal drops. For a whole journey with nothing left out,
          download the full copy once ({copySize}); it refreshes itself after each update.
        </p>
        <div className="mt-3 flex flex-wrap items-center gap-3">
          {copyWanted && copyComplete ? (
            <button type="button" onClick={onStopCopy} className={btnSecondary}>
              Stop keeping the full copy
            </button>
          ) : (
            <button type="button" onClick={onDownloadCopy} disabled={!copy || copyRunning} className={btnSecondary}>
              Download the full copy
            </button>
          )}
          {copyStatusText && (
            <span className="text-meta text-ink-2" role="status">
              {copyStatusText}
            </span>
          )}
        </div>
        {copyRunning && progress && progress.total > 0 && (
          <div className="mt-3 h-1 w-full overflow-hidden rounded bg-line" aria-hidden="true">
            <div className="h-1 rounded bg-accent" style={{ width: `${Math.min(100, Math.round((progress.done / progress.total) * 100))}%` }} />
          </div>
        )}
      </section>

      <RowanSettings />

      <section className={`${sectionCls} md:col-span-2`}>
        <h2 className="text-[16px] font-semibold">Appearance</h2>
        <ul className="mt-3 flex flex-col gap-1">
          {THEMES.map((t) => (
            <li key={t.id}>
              <button
                type="button"
                onClick={() => setTheme(t.id)}
                aria-pressed={theme === t.id}
                className={`tap flex w-full items-center justify-between rounded-[var(--radius-sm)] px-3 text-left text-ui ${
                  theme === t.id ? "bg-accent-3 font-medium" : "hover:bg-surface-2"
                }`}
              >
                <span>{t.label}</span>
                {t.hint && <span className="text-meta text-ink-2">{t.hint}</span>}
              </button>
            </li>
          ))}
        </ul>
      </section>

    </div>
  );
}
