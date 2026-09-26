/**
 * What the Slides close says about what comes back, from the review cards themselves (pure; the close reads the cards
 * and hands them in). Two rules, from the trial audit:
 *  - every number is a count of real cards, never the length of a list that was cut short (CT-07: "3 items" was the
 *    companion context's display cap of three);
 *  - a reason is given only when there is one (LD-05: "because they are due on the schedule" is not a reason). The one
 *    real reason the data holds is a confident miss: it comes back sooner.
 * And one for the line above it: the evening is not over while the cards she has just made come due tonight, so the
 * companion is told they are due (the library's own close lines then say "You can stop here…" rather than "There is
 * nothing else to do", which its own note reserves for a night with nothing due).
 */

export interface ReturnCard {
  id: string;
  subject: string;
  topicSlug: string;
  due: Date;
}

export interface ReturnRow {
  key: string;
  /** "Tonight", "Tomorrow", "Thursday". */
  when: string;
  /** "7 checks and 2 recall cards from Simplifying algebraic fractions". */
  what: string;
  /** Only a real one: "because you were sure and not right, so it comes back sooner". */
  reason: string | null;
  count: number;
}

const WEEKDAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

function startOfDay(d: Date): number {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x.getTime();
}

/** The end of this evening: 04:00 tomorrow, or 04:00 today if it is still the small hours. */
export function eveningEnd(now: Date): Date {
  const end = new Date(now);
  end.setHours(4, 0, 0, 0);
  if (end.getTime() <= now.getTime()) end.setDate(end.getDate() + 1);
  return end;
}

/**
 * "Tonight" for what comes due before this evening ends (eveningEnd, the close's own count of what is due tonight, so a
 * card made at ten to midnight is not "Tomorrow" and one made at two in the morning is not "Later today"), then "Later
 * today", "Tomorrow", a weekday within six days (so a weekday name never means the same day next week), else null.
 */
export function returnDay(due: Date, now: Date): string | null {
  const days = Math.round((startOfDay(due) - startOfDay(now)) / 86_400_000);
  if (days < 0 || days > 6) return null;
  if (due.getTime() <= eveningEnd(now).getTime()) return "Tonight";
  if (days === 0) return "Later today";
  if (days === 1) return "Tomorrow";
  return WEEKDAYS[due.getDay()];
}

const isConfidentMiss = (id: string) => id.startsWith("hc:");
/** A confident miss's re-probe card ("hc:<item>:<n>") names the item it re-asks. */
const sourceOf = (id: string) => (isConfidentMiss(id) ? id.replace(/^hc:/, "").replace(/:\d+$/, "") : id);
const kindOf = (id: string): "check" | "recall" | "item" => (id.includes("#gate:") ? "check" : id.startsWith("rp.") ? "recall" : "item");
const plural = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`;

/** "7 checks and 2 recall cards", "1 item": the kinds in a group, counted. */
function describe(ids: readonly string[]): string {
  const counts = { check: 0, recall: 0, item: 0 };
  for (const id of ids) counts[kindOf(id)] += 1;
  const parts = [
    counts.check ? plural(counts.check, "check", "checks") : null,
    counts.recall ? plural(counts.recall, "recall card", "recall cards") : null,
    counts.item ? plural(counts.item, counts.check || counts.recall ? "other item" : "item", counts.check || counts.recall ? "other items" : "items") : null,
  ].filter((p): p is string => p !== null);
  return parts.length <= 1 ? parts.join("") : `${parts.slice(0, -1).join(", ")} and ${parts[parts.length - 1]}`;
}

/**
 * The next returns within the coming week, grouped by day and topic (a confident miss in a row of its own, with its
 * reason), soonest first, at most `limit` rows; `more` counts the cards in the rows not shown.
 */
export function returnRows(cards: readonly ReturnCard[], now: Date, titleOf: (card: ReturnCard) => string, limit = 3): { rows: ReturnRow[]; more: number } {
  const groups = new Map<string, { when: string; first: number; card: ReturnCard; ids: string[]; confident: boolean }>();
  for (const c of [...cards].filter((x) => x.due.getTime() > now.getTime()).sort((a, b) => a.due.getTime() - b.due.getTime())) {
    const when = returnDay(c.due, now);
    if (!when) continue;
    const confident = isConfidentMiss(c.id);
    const key = `${when}|${c.subject}|${c.topicSlug}|${confident ? "hc" : "all"}`;
    const g = groups.get(key);
    if (g) g.ids.push(c.id);
    else groups.set(key, { when, first: c.due.getTime(), card: c, ids: [c.id], confident });
  }
  const all = [...groups.entries()].sort((a, b) => a[1].first - b[1].first);
  const rows = all.slice(0, Math.max(0, limit)).map(([key, g]) => ({
    key,
    when: g.when,
    what: `${describe(g.ids.map(sourceOf))} from ${titleOf(g.card)}`,
    reason: g.confident ? (g.ids.length === 1 ? "because you were sure and not right, so it comes back sooner" : "because you were sure and not right, so they come back sooner") : null,
    count: g.ids.length,
  }));
  const more = all.slice(Math.max(0, limit)).reduce((n, [, g]) => n + g.ids.length, 0);
  return { rows, more };
}
