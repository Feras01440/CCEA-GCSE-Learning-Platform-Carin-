/**
 * Five small squares; filled ones show examiner-reported difficulty (5 = repeatedly worst answered).
 * Never coloured: a verdict on a topic she has not opened must not be an alarm (01-art-direction.md §4.7).
 * The whole meter leaves the contents page in pass 2d; until then the hardest level is ink, like level 4.
 */
export function DifficultyDots({ value }: { value: number }) {
  return (
    <span className="flex gap-0.5" aria-label={`Difficulty ${value} of 5`} role="img">
      {Array.from({ length: 5 }).map((_, i) => (
        <span key={i} className={`h-2 w-2 rounded-[2px] ${i < value ? (value >= 4 ? "bg-ink" : "bg-ink-3") : "bg-line-2"}`} />
      ))}
    </span>
  );
}
