"use client";

/** A thin line that fills one step at a time. Momentum without a counter. */
export function ProgressLine({ value, max, label }: { value: number; max: number; label?: string }) {
  const pct = max > 0 ? Math.min(100, Math.round((value / max) * 100)) : 0;
  return (
    <div
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={max}
      aria-valuenow={value}
      aria-label={label ?? "Progress"}
      className="h-[3px] w-full overflow-hidden rounded-full bg-line"
    >
      <div
        className="h-full origin-left rounded-full bg-ink transition-transform duration-300 [transition-timing-function:var(--ease-out)] motion-reduce:transition-none"
        style={{ transform: `scaleX(${pct / 100})` }}
      />
    </div>
  );
}
