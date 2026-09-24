"use client";

import { useMemo } from "react";
import { Info } from "lucide-react";
import { clsx } from "clsx";
import { SERIES, type Series } from "@/lib/grades/ums";
import { SERIES_LABEL, type RunnerPaper } from "@/lib/papers/meta";
import { computePaperResult, gapCaption, type SavedUnits } from "@/lib/papers/result";
import { UmsDial } from "./UmsDial";

function Stat({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div>
      <p className="text-meta font-medium text-ink-2">{label}</p>
      <p className="tnum text-[22px] font-semibold leading-tight">{value}</p>
      {sub && <p className="text-meta text-ink-2">{sub}</p>}
    </div>
  );
}

/**
 * Raw → UMS → unit grade → the top-grade band and what the other unit needs, from the
 * grade engine. Everything estimated is labelled as such in words.
 */
export function UmsResult({
  paper,
  raw,
  series,
  onSeriesChange,
  saved,
}: {
  paper: RunnerPaper;
  raw: number;
  series: Series;
  onSeriesChange: (s: Series) => void;
  saved: SavedUnits;
}) {
  const model = useMemo(() => computePaperResult(paper, raw, series, saved), [paper, raw, series, saved]);
  const caption = gapCaption(model);
  // The grade she earned first, then what it is worth, then the gap: the order the dial draws them in.
  const dialLabel = `Unit grade ${model.unit.grade}: ${model.unit.ums} of ${model.umsMax} UMS on ${model.engineUnit}${model.estimated ? ", estimated" : ""}. ${caption}`;

  return (
    <div className="grid gap-6 md:grid-cols-[minmax(0,320px)_1fr] md:items-start">
      <div>
        <UmsDial
          ums={model.unit.ums}
          umsMax={model.umsMax}
          grade={model.unit.grade}
          bracket={model.bracket ? { label: model.bracket.grade, from: model.bracket.fromUms, to: model.bracket.toUms } : null}
          estimated={model.estimated}
          label={dialLabel}
        />
        <p className="mt-1 text-center text-ui font-medium">{caption}</p>
        {model.bracket && <p className="mt-1 text-center text-meta text-ink-2">{model.bracket.text}</p>}
      </div>

      <div className="space-y-5">
        <div className="grid grid-cols-3 gap-3">
          <Stat label="Raw" value={`${model.paperRaw} / ${model.paperRawMax}`} sub={model.parts.length > 1 ? `${model.unit.raw} / ${model.unit.rawMax} on ${model.engineUnit}` : undefined} />
          <Stat label="UMS" value={`${model.unit.ums} / ${model.umsMax}`} sub={model.estimated ? "estimated" : undefined} />
          <Stat label="Unit grade" value={model.unit.grade} sub={model.assumed ? "part assumed" : undefined} />
        </div>

        {model.parts.length > 1 && (
          <ul className="space-y-1 text-meta text-ink-2">
            {model.parts.map((p) => (
              <li key={p.key} className="tnum">
                {p.label}: {p.raw}/{p.rawMax}{" "}
                <span className="text-ink-2">
                  {p.source === "this-run" ? "(this run)" : p.source === "saved" ? "(saved run)" : "(assumed)"}
                </span>
              </li>
            ))}
          </ul>
        )}

        {model.whatIf && (
          <div>
            <p className="text-meta font-medium text-ink-2">
              {model.whatIf.note.startsWith("Given") ? model.whatIf.note : `With this ${model.engineUnit}, ${model.whatIf.unit} would need`}
            </p>
            <ul className="mt-1 grid gap-1 sm:grid-cols-3">
              {model.whatIf.lines.map((l) => (
                <li key={l.grade} className="tnum rounded-[var(--radius-sm)] border border-line px-3 py-2 text-meta">
                  <span className="font-semibold">{l.grade}</span>{" "}
                  {l.rawNeeded === null ? <span className="text-ink-2">out of reach from here</span> : l.rawNeeded === 0 ? <span className="text-ink-2">already secured</span> : <>{l.rawNeeded}/{l.rawMax} raw</>}
                </li>
              ))}
            </ul>
            {!model.whatIf.note.startsWith("Given") && <p className="mt-1 text-meta text-ink-2">{model.whatIf.note}</p>}
          </div>
        )}

        {model.subject && (
          <div className="rounded-[var(--radius-sm)] bg-surface-2 p-4">
            <p className="text-meta font-medium text-ink-2">Subject level, with your saved runs</p>
            <p className="tnum mt-1 text-[18px] font-semibold">
              {model.subject.result.totalUms} / {model.subject.result.scaleMax} UMS → {model.subject.result.grade}
              {model.subject.result.capped && <span className="text-meta font-normal text-ink-2"> (capped at {model.subject.result.cap} by the unit combination)</span>}
            </p>
            <p className="mt-1 text-meta text-ink-2">{model.subject.gap.text}</p>
            <p className="mt-1 text-meta text-ink-2">Using {model.subject.usedParts.map((p) => `${p.label} ${p.raw}/${p.rawMax}`).join(", ")}.</p>
          </div>
        )}

        <div>
          <p className="text-meta font-medium text-ink-2">Boundaries</p>
          <div className="mt-1 inline-flex rounded-[var(--radius-sm)] border border-line-2 p-0.5" role="group" aria-label="Boundary series">
            {SERIES.map((s) => (
              <button
                key={s}
                type="button"
                aria-pressed={series === s}
                onClick={() => onSeriesChange(s)}
                className={clsx(
                  "tap rounded-[8px] px-3 text-meta",
                  series === s ? "bg-ink font-medium text-surface" : "text-ink-2 hover:bg-surface-2",
                )}
              >
                {SERIES_LABEL[s]}
              </button>
            ))}
          </div>
        </div>

        {model.notes.length > 0 && (
          <ul className="space-y-1.5 text-meta text-ink-2">
            {model.notes.map((n) => (
              <li key={n} className="flex items-start gap-1.5">
                <Info size={14} className="mt-0.5 shrink-0" aria-hidden />
                <span>{n}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
