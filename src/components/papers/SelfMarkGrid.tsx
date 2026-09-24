"use client";

import { useRef, type KeyboardEvent } from "react";
import { ExternalLink, Info, Plus, Trash2 } from "lucide-react";
import { clsx } from "clsx";
import type { MockMarkTag } from "@/lib/db/db";
import { MARK_TAGS, pdfPageHref, type QuestionRow, type QuestionTemplate } from "@/lib/papers/meta";

export interface GridRow {
  id: string;
  q: string;
  awarded: number | null;
  available: number | null;
  page?: number;
  label?: string;
  tags: MockMarkTag[];
}

let seq = 0;
function rowId(): string {
  seq += 1;
  return `r${Date.now().toString(36)}${seq}`;
}

export function rowsFromTemplate(t: QuestionTemplate): GridRow[] {
  return t.rows.map((r: QuestionRow) => ({
    id: rowId(),
    q: r.q,
    awarded: null,
    available: r.available ?? null,
    page: r.page,
    label: r.label,
    tags: [],
  }));
}

export interface GridTotals {
  awarded: number;
  available: number;
  /** Rows with an awarded mark entered. */
  entered: number;
  lost: number;
  tagged: number;
}

export function gridTotals(rows: readonly GridRow[]): GridTotals {
  let awarded = 0;
  let available = 0;
  let entered = 0;
  let lost = 0;
  let tagged = 0;
  for (const r of rows) {
    if (r.awarded !== null) {
      awarded += r.awarded;
      entered += 1;
    }
    if (r.available !== null) available += r.available;
    if (r.awarded !== null && r.available !== null) lost += Math.max(0, r.available - r.awarded);
    tagged += r.tags.length;
  }
  return { awarded, available, entered, lost, tagged };
}

function parseMark(value: string, max: number | null): number | null {
  const cleaned = value.replace(/[^\d]/g, "");
  if (cleaned === "") return null;
  const n = Number(cleaned);
  if (!Number.isFinite(n)) return null;
  return max === null ? n : Math.min(max, n);
}

const inputClass =
  "tap w-full rounded-[var(--radius-sm)] border border-line-3 bg-surface px-3 text-center text-[16px] tnum focus-visible:border-accent";

export function SelfMarkGrid({
  rows,
  onChange,
  paperMarks,
  paperUrl,
  template,
}: {
  rows: GridRow[];
  onChange: (rows: GridRow[]) => void;
  paperMarks: number;
  paperUrl: string;
  template: QuestionTemplate;
}) {
  const inputs = useRef(new Map<string, HTMLInputElement>());
  const totals = gridTotals(rows);

  const update = (id: string, patch: Partial<GridRow>) => onChange(rows.map((r) => (r.id === id ? { ...r, ...patch } : r)));

  const setAwarded = (row: GridRow, value: string) => {
    const awarded = parseMark(value, row.available);
    const lost = awarded !== null && row.available !== null ? Math.max(0, row.available - awarded) : 0;
    update(row.id, { awarded, tags: row.tags.slice(0, lost) });
  };

  const setAvailable = (row: GridRow, value: string) => {
    const available = parseMark(value, null);
    const awarded = row.awarded !== null && available !== null ? Math.min(row.awarded, available) : row.awarded;
    update(row.id, { available, awarded });
  };

  const cycleTag = (row: GridRow, tag: MockMarkTag) => {
    if (row.awarded === null || row.available === null) return;
    const lost = Math.max(0, row.available - row.awarded);
    const count = row.tags.filter((t) => t === tag).length;
    const others = row.tags.filter((t) => t !== tag);
    const next = count + 1 + others.length > lost ? 0 : count + 1;
    update(row.id, { tags: [...others, ...Array<MockMarkTag>(next).fill(tag)] });
  };

  const addRow = () => {
    const last = rows.length ? Number.parseInt(rows[rows.length - 1].q, 10) : 0;
    onChange([...rows, { id: rowId(), q: String((Number.isFinite(last) ? last : rows.length) + 1), awarded: null, available: null, tags: [] }]);
  };

  const removeRow = (id: string) => onChange(rows.filter((r) => r.id !== id));

  const onKey = (e: KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === "Enter" || e.key === "ArrowDown") {
      e.preventDefault();
      const next = rows[index + 1];
      if (next) inputs.current.get(next.id)?.focus();
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      const prev = rows[index - 1];
      if (prev) inputs.current.get(prev.id)?.focus();
    }
  };

  const availableMismatch = totals.available > 0 && totals.available !== paperMarks;

  return (
    <div>
      {/* One table, two layouts by CSS alone (pass 3, 24 Sep 2026). From `sm` it is a table that scrolls inside this box
          if it must (520 px minimum; `relative` keeps the screen-reader-only header inside the clip, which once scrolled
          the whole page sideways at 390). Below `sm` there is no minimum width and no scroller: each question is one
          block, a grid with named areas (the question and its page link and Remove on the first line, the two inputs
          under their own labels on the second, the lost marks and their tags on the third, left out until a mark is
          entered), so nothing on a phone is ever off screen. The table's meaning is kept for a screen reader by the
          explicit roles, which hold even where a cell's display is no longer table-cell. */}
      <div className="relative rounded-[var(--radius)] border border-line sm:overflow-x-auto">
        <table role="table" className="w-full border-collapse text-ui max-sm:block sm:min-w-[520px]">
          <caption className="sr-only">Marks per question</caption>
          <thead role="rowgroup" className="max-sm:sr-only">
            <tr role="row" className="border-b border-line bg-surface-2 text-left text-meta font-medium text-ink-2">
              <th role="columnheader" scope="col" className="px-3 py-2">Q</th>
              <th role="columnheader" scope="col" className="px-3 py-2">Page</th>
              <th role="columnheader" scope="col" className="px-3 py-2 text-center">Available</th>
              <th role="columnheader" scope="col" className="px-3 py-2 text-center">Awarded</th>
              <th role="columnheader" scope="col" className="px-3 py-2">Lost</th>
              <th role="columnheader" scope="col" className="px-2 py-2">
                <span className="sr-only">Remove</span>
              </th>
            </tr>
          </thead>
          <tbody role="rowgroup" className="max-sm:block">
            {rows.map((row, i) => {
              const lost = row.awarded !== null && row.available !== null ? Math.max(0, row.available - row.awarded) : null;
              return (
                <tr
                  key={row.id}
                  role="row"
                  className="border-b border-line align-top last:border-b-0 max-sm:grid max-sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto] max-sm:items-start max-sm:gap-x-3 max-sm:gap-y-2 max-sm:px-3 max-sm:py-3 max-sm:[grid-template-areas:'q_page_remove'_'available_awarded_.'_'lost_lost_lost']"
                >
                  <th role="rowheader" scope="row" className="p-0 text-left font-medium sm:px-3 sm:py-2 max-sm:[grid-area:q]">
                    {/* "Question 2" on the phone, where the Q column header is no longer visible; "2" under it on the desktop. */}
                    <span className="tnum block sm:pt-3">
                      <span className="sm:hidden">Question </span>
                      {row.q}
                    </span>
                    {row.label && <span className="block max-w-[14ch] text-meta font-normal leading-tight text-ink-2">{row.label}</span>}
                  </th>
                  {/* On the phone the page link and Remove are 44 px tap boxes beside a 24 px line of text: lifted 10 px so
                      their centres sit on the question's first line, inside the block's own 12 px of padding. */}
                  <td role="cell" className="p-0 sm:px-3 sm:py-2 max-sm:-mt-2.5 max-sm:[grid-area:page]">
                    {row.page ? (
                      <a
                        href={pdfPageHref(paperUrl, row.page)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="tap inline-flex items-center gap-1 text-meta text-ink-2 underline decoration-line-2 underline-offset-4 hover:text-ink"
                        aria-label={`Open the paper at page ${row.page} on ccea.org.uk`}
                      >
                        p. <span className="tnum">{row.page}</span> <ExternalLink size={13} aria-hidden />
                      </a>
                    ) : (
                      <span className="block text-ink-2 sm:pt-3">—</span>
                    )}
                  </td>
                  <td role="cell" className="p-0 sm:w-24 sm:px-2 sm:py-2 max-sm:[grid-area:available]">
                    <span className="sm:hidden mb-1 block text-meta text-ink-2">Available</span>
                    <input
                      className={inputClass}
                      inputMode="numeric"
                      pattern="[0-9]*"
                      aria-label={`Question ${row.q}: marks available`}
                      value={row.available ?? ""}
                      onChange={(e) => setAvailable(row, e.target.value)}
                    />
                  </td>
                  <td role="cell" className="p-0 sm:w-24 sm:px-2 sm:py-2 max-sm:[grid-area:awarded]">
                    <span className="sm:hidden mb-1 block text-meta text-ink-2">Awarded</span>
                    <input
                      ref={(el) => {
                        if (el) inputs.current.set(row.id, el);
                        else inputs.current.delete(row.id);
                      }}
                      className={clsx(inputClass, "font-semibold")}
                      inputMode="numeric"
                      pattern="[0-9]*"
                      aria-label={`Question ${row.q}: marks awarded${row.available !== null ? ` out of ${row.available}` : ""}`}
                      value={row.awarded ?? ""}
                      onChange={(e) => setAwarded(row, e.target.value)}
                      onKeyDown={(e) => onKey(e, i)}
                    />
                  </td>
                  <td role="cell" className={clsx("p-0 sm:px-3 sm:py-2 max-sm:[grid-area:lost]", lost === null && "max-sm:hidden")}>
                    {lost === null ? (
                      <span className="block text-ink-2 sm:pt-3">—</span>
                    ) : lost === 0 ? (
                      <span className="block text-ink-2 sm:pt-3">full marks</span>
                    ) : (
                      <div className="sm:pt-1">
                        <span className="tnum inline-block rounded-md border border-line-2 px-2 py-1 text-meta font-medium">−{lost}</span>
                        <div className="mt-1.5 flex flex-wrap gap-1" role="group" aria-label={`Question ${row.q}: tag the ${lost} lost mark${lost === 1 ? "" : "s"}`}>
                          {MARK_TAGS.map((t) => {
                            const count = row.tags.filter((x) => x === t.id).length;
                            return (
                              <button
                                key={t.id}
                                type="button"
                                onClick={() => cycleTag(row, t.id)}
                                aria-pressed={count > 0}
                                aria-label={`${t.label}: ${count} of ${lost}`}
                                title={t.hint}
                                className={clsx(
                                  // 44 px: the tap floor (docs/design/art-direction/03-implementation-plan.md, pass 1 acceptance).
                                  "tap rounded-full border px-3 text-meta",
                                  count > 0 ? "border-ink bg-ink text-surface" : "border-line-3 text-ink-2 hover:bg-surface-2",
                                )}
                              >
                                {t.label}
                                {count > 0 && <span className="tnum"> ×{count}</span>}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </td>
                  <td role="cell" className="p-0 sm:px-2 sm:py-2 max-sm:-mt-2.5 max-sm:[grid-area:remove] max-sm:justify-self-end">
                    <button
                      type="button"
                      onClick={() => removeRow(row.id)}
                      className="tap inline-flex items-center justify-center rounded-[var(--radius-sm)] text-ink-3 hover:bg-surface-2 hover:text-ink"
                      aria-label={`Remove question ${row.q}`}
                    >
                      <Trash2 size={16} aria-hidden />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="mt-3 flex flex-wrap items-start justify-between gap-3">
        <button type="button" onClick={addRow} className="tap inline-flex items-center gap-2 rounded-[var(--radius-sm)] border border-line-2 px-3 text-meta font-medium hover:bg-surface-2">
          <Plus size={16} aria-hidden /> Add a question
        </button>
        <div className="text-right">
          <p className="text-meta font-medium text-ink-2">Total</p>
          <p className="tnum text-[28px] font-semibold leading-tight">
            {totals.awarded} <span className="text-[18px] font-normal text-ink-3">/ {paperMarks}</span>
          </p>
          <p className="tnum text-meta text-ink-2">
            {totals.entered} of {rows.length} questions entered · {totals.lost} lost
            {totals.lost > 0 && ` · ${totals.tagged} tagged`}
          </p>
        </div>
      </div>

      <div className="mt-3 space-y-1.5 text-meta text-ink-2">
        {availableMismatch && (
          <p className="flex items-start gap-1.5">
            <Info size={14} className="mt-0.5 shrink-0" aria-hidden />
            The rows add up to {totals.available} marks; the paper is out of {paperMarks}. Check the marks printed beside each question.
          </p>
        )}
        {template.source === "page-map" && !template.verified && !availableMismatch && (
          <p className="flex items-start gap-1.5">
            <Info size={14} className="mt-0.5 shrink-0" aria-hidden />
            Marks per question were read automatically from the paper; correct any that differ from the printed tariff.
          </p>
        )}
        {template.source === "default" && (
          <p className="flex items-start gap-1.5">
            <Info size={14} className="mt-0.5 shrink-0" aria-hidden />
            No page map for this paper: type the marks available beside each question as printed, and add or remove rows to match.
          </p>
        )}
      </div>
    </div>
  );
}
