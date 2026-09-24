/**
 * The review close card's headline. A skipped review used to print "0 items · 1 min" at heading size, which is
 * true and reads like a bug; a night with nothing answered says so in words, and the minute is not worth printing.
 */
export function reviewHeadline(count: number, minutes: number): string {
  if (count <= 0) return "Nothing answered tonight";
  return `${count} item${count === 1 ? "" : "s"} · ${Math.max(1, minutes)} min`;
}
