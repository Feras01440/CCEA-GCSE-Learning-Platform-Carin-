"use client";

/**
 * The "Checked" panel on every item: collapsed to one line ("Checked · 7 passes"),
 * expandable to the verification rows straight from the log — failed and waived checks
 * shown, not hidden — the learner's reports with their resolution, and "Something wrong?".
 */
import { useId, useState } from "react";
import { Check, ChevronDown, Minus, X } from "lucide-react";
import { clsx } from "clsx";
import type { VerificationLog } from "@/lib/content/schema";
import { humaniseKebab } from "./format";
import { btnSecondary, fieldCls } from "./ui";

export interface CheckedPanelProps {
  log: VerificationLog;
  onReport: (text: string) => void;
  /** The reports she has sent on this item from this device, oldest first (src/lib/db/reports.ts), shown back to her. */
  sent?: ReadonlyArray<{ at: Date; text: string }>;
  defaultOpen?: boolean;
  className?: string;
}

type Check = VerificationLog["checks"][number];

const RESULT: Record<Check["result"], { word: string; icon: React.ReactNode }> = {
  pass: { word: "Pass", icon: <Check size={14} aria-hidden className="text-ok" /> },
  fail: { word: "Failed", icon: <X size={14} aria-hidden className="text-miss" /> },
  waived: { word: "Waived", icon: <Minus size={14} aria-hidden className="text-warn" /> },
};

function formatWhen(iso: string | Date): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return String(iso);
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

export function summariseChecks(log: VerificationLog): string {
  const counts = { pass: 0, fail: 0, waived: 0 };
  for (const c of log.checks) counts[c.result] += 1;
  const parts = [`${counts.pass} pass${counts.pass === 1 ? "" : "es"}`];
  if (counts.fail > 0) parts.push(`${counts.fail} failed`);
  if (counts.waived > 0) parts.push(`${counts.waived} waived`);
  const open = log.reports.filter((r) => !r.resolvedAt).length;
  if (open > 0) parts.push(`${open} open report${open === 1 ? "" : "s"}`);
  return parts.join(" · ");
}

export function CheckedPanel({ log, onReport, sent: yours = [], defaultOpen = false, className }: CheckedPanelProps) {
  const [open, setOpen] = useState(defaultOpen);
  const [text, setText] = useState("");
  const [sent, setSent] = useState(false);
  const id = useId();
  const summary = summariseChecks(log);
  const attention = log.checks.some((c) => c.result !== "pass") || log.status === "withdrawn" || log.status === "draft";

  return (
    <section className={clsx("rounded-[var(--radius)] border border-line bg-surface", className)} aria-label="Verification">
      <button
        type="button"
        aria-expanded={open}
        aria-controls={id}
        onClick={() => setOpen((o) => !o)}
        className="tap flex w-full items-center justify-between gap-3 px-4 py-2.5 text-left text-meta hover:bg-surface-2"
      >
        <span className="flex min-w-0 items-center gap-2">
          {attention ? <Minus size={16} aria-hidden className="shrink-0 text-warn" /> : <Check size={16} aria-hidden className="shrink-0 text-ok" />}
          <span className="font-medium">Checked</span>
          <span className="tnum truncate text-ink-2">· {summary}</span>
        </span>
        <span className="flex shrink-0 items-center gap-2 text-meta text-ink-2">
          <span className="rounded-full border border-line-2 px-2 py-0.5 capitalize">{log.status}</span>
          <ChevronDown size={16} aria-hidden className={clsx("transition-transform duration-150", open && "rotate-180")} />
        </span>
      </button>

      <div id={id} hidden={!open} className="border-t border-line px-4 pb-4">
        <p className="tnum mt-3 text-meta text-ink-2">
          {log.itemId} · v{log.version}
        </p>
        <ul className="mt-2 divide-y divide-line" aria-label="Checks">
          {log.checks.map((c, i) => (
            <li key={i} className="grid grid-cols-[5.5rem_1fr] gap-x-3 py-2 text-meta sm:grid-cols-[5.5rem_11rem_1fr]">
              <span className="flex items-center gap-1.5 font-medium">
                {RESULT[c.result].icon}
                {RESULT[c.result].word}
              </span>
              <span className="text-ink">{humaniseKebab(c.type)}</span>
              <span className="col-span-2 mt-0.5 text-ink-2 sm:col-span-1 sm:mt-0">
                <span className="font-mono text-meta text-ink-2">{c.tool}</span>
                {/* Check details are verbatim traces from the authoring pipeline (x**2, 1e-9, full-precision roots), so they are set as a log line, not prose. */}
                {c.detail && <span className="mt-0.5 block whitespace-pre-wrap break-words font-mono text-meta leading-5 text-ink-2">{c.detail}</span>}
                <span className="block text-meta text-ink-2">
                  {c.by} · {formatWhen(c.at)}
                </span>
              </span>
            </li>
          ))}
        </ul>

        {log.reports.length > 0 && (
          <div className="mt-3">
            <p className="text-meta font-medium text-ink-2">Reports</p>
            <ul className="mt-1.5 space-y-2" aria-label="Reports">
              {log.reports.map((r, i) => (
                <li key={i} className="rounded-[var(--radius-sm)] bg-surface-2/60 px-3 py-2 text-meta">
                  <p>
                    <span className="text-ink-2">
                      {r.by} · {formatWhen(r.at)} ·{" "}
                    </span>
                    {r.text}
                  </p>
                  {r.resolution ? (
                    <p className="mt-1 text-ink-2">
                      <span className="font-medium text-ink">Resolved{r.resolvedAt ? ` ${formatWhen(r.resolvedAt)}` : ""}: </span>
                      {r.resolution}
                    </p>
                  ) : (
                    <p className="mt-1 text-ink-2">Open.</p>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* What she has sent from this device, so a report is visibly kept (engine item 10.4, 24 Sep 2026). */}
        {yours.length > 0 && (
          <div className="mt-3">
            <p className="text-meta font-medium text-ink-2">What you sent</p>
            <ul className="mt-1.5 space-y-2" aria-label="What you sent">
              {yours.map((r, i) => (
                <li key={i} className="rounded-[var(--radius-sm)] bg-surface-2/60 px-3 py-2 text-meta">
                  <span className="text-ink-2">{formatWhen(r.at)} · </span>
                  {r.text}
                </li>
              ))}
            </ul>
            <p className="mt-1.5 text-meta text-ink-2">Kept on this device and in your backup until the item is re-checked.</p>
          </div>
        )}

        <form
          className="mt-4"
          onSubmit={(e) => {
            e.preventDefault();
            const t = text.trim();
            if (!t) return;
            onReport(t);
            setSent(true);
            setText("");
          }}
        >
          <label htmlFor={`${id}-report`} className="text-meta font-medium">
            Something wrong?
          </label>
          <p className="mt-0.5 text-meta text-ink-2">Say what looks off — an answer, a mark, a wording. Your words are kept with this item on this device and in your backup, so it can be re-checked.</p>
          <textarea
            id={`${id}-report`}
            value={text}
            onChange={(e) => {
              setText(e.target.value);
              setSent(false);
            }}
            rows={2}
            className={clsx(fieldCls, "mt-2 text-ui")}
            placeholder="What looks off?"
          />
          <div className="mt-2 flex items-center gap-3">
            <button type="submit" className={btnSecondary} disabled={!text.trim()}>
              Send
            </button>
            {sent && (
              <span className="text-meta text-ink-2" role="status">
                Thanks — noted.
              </span>
            )}
          </div>
        </form>
      </div>
    </section>
  );
}
