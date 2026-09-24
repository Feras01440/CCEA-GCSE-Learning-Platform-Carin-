/** Small pure formatters shared by the item components. */

const SERIES_WORD: Record<string, string> = {
  summer: "Summer",
  november: "November",
  march: "March",
  january: "January",
  june: "June",
};

/** "2025-summer" → "Summer 2025". Anything else is returned untouched. */
export function formatSeries(series: string): string {
  const m = /^(\d{4})-([a-z]+)$/i.exec(series.trim());
  if (!m) return series;
  const word = SERIES_WORD[m[2].toLowerCase()] ?? m[2][0].toUpperCase() + m[2].slice(1);
  return `${word} ${m[1]}`;
}

/** "ccea-cer:maths:2025-summer:M4:Q22" → "CCEA examiners' report · Summer 2025 · M4 Q22". */
export function formatExaminerSource(source: string): string {
  const parts = source.split(":");
  if (parts.length < 5 || parts[0] !== "ccea-cer") return source;
  const [, , series, unit, question] = parts;
  return `CCEA examiners' report · ${formatSeries(series)} · ${unit} ${question}`;
}

/** Just the series and question, for a compact citation: "Summer 2025, M4 Q22". */
export function shortExaminerSource(source: string): string {
  const parts = source.split(":");
  if (parts.length < 5 || parts[0] !== "ccea-cer") return source;
  return `${formatSeries(parts[2])}, ${parts[3]} ${parts[4]}`;
}

/** "median.class-midpoint" → "Median: class midpoint" — a readable stand-in until a label registry exists. */
export function humaniseMisconception(id: string): string {
  const [head, ...rest] = id.split(".");
  const words = (s: string) => s.replace(/[-_]+/g, " ").trim();
  const tail = rest.map(words).join(", ");
  const h = words(head);
  const cap = h.charAt(0).toUpperCase() + h.slice(1);
  return tail ? `${cap}: ${tail}` : cap;
}

/** "maths-numeric" → "Maths numeric". */
export function humaniseKebab(s: string): string {
  const t = s.replace(/[-_]+/g, " ");
  return t.charAt(0).toUpperCase() + t.slice(1);
}

/** 102345 ms → "1:42"; 7000 → "0:07"; over an hour → "1:05:09". */
export function formatMs(ms: number): string {
  const total = Math.max(0, Math.round(ms / 1000));
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  const mm = h > 0 ? String(m).padStart(2, "0") : String(m);
  return `${h > 0 ? `${h}:` : ""}${mm}:${String(s).padStart(2, "0")}`;
}

/** "today", "yesterday", "3 days ago", "2 weeks ago", "3 months ago", "a year ago". */
export function relativeTime(date: Date, now: Date = new Date()): string {
  const days = Math.floor((now.getTime() - date.getTime()) / 86_400_000);
  if (days <= 0) return "today";
  if (days === 1) return "yesterday";
  if (days < 14) return `${days} days ago`;
  if (days < 60) return `${Math.floor(days / 7)} weeks ago`;
  if (days < 365) return `${Math.floor(days / 30)} months ago`;
  const years = Math.floor(days / 365);
  return years === 1 ? "a year ago" : `${years} years ago`;
}

/** Option letters for choice buttons: 0 → "A". */
export function optionLetter(index: number): string {
  return String.fromCharCode(65 + (index % 26));
}

/** Formats a spec value without float noise: 36.15 → "36.15", 0.1 + 0.2 → "0.3". */
export function formatValue(value: number): string {
  if (!Number.isFinite(value)) return String(value);
  return String(Number(value.toPrecision(12)));
}
