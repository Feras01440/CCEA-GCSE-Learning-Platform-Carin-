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

/**
 * A value written in a form a question can demand, so the feedback card never prints "0.636363636364" for a question
 * that asked for a fraction (cloud session, 26 Sep 2026: 95 parts and 19 twins showed a 12-digit decimal as the
 * expected answer where the form was fraction, surd, π or standard form). `plain` is what she types on the answer line
 * (the key strip's / √ π × ^), `tex` is how the card sets it. Null when the value has no clean spelling in that form.
 */
export interface FormSpelling {
  plain: string;
  tex: string;
}

export type SpellableForm = "fraction" | "mixed" | "surd" | "pi" | "standardForm";

const close = (a: number, b: number) => Math.abs(a - b) <= 1e-9 * Math.max(1, Math.abs(a), Math.abs(b));

/** The simplest p/q within 1e-9 of the value (continued fractions, denominator at most `maxDen`); null when none. */
export function rationalOf(value: number, maxDen = 10_000): [number, number] | null {
  if (!Number.isFinite(value)) return null;
  const sign = value < 0 ? -1 : 1;
  let x = Math.abs(value);
  let [h0, h1, k0, k1] = [0, 1, 1, 0];
  for (let i = 0; i < 40; i += 1) {
    const a = Math.floor(x);
    [h0, h1] = [h1, a * h1 + h0];
    [k0, k1] = [k1, a * k1 + k0];
    if (k1 > maxDen) return null;
    if (close(h1 / k1, Math.abs(value))) return [sign * h1, k1];
    const frac = x - a;
    if (frac < 1e-12) break;
    x = 1 / frac;
  }
  return close(h1 / k1, Math.abs(value)) && k1 <= maxDen ? [sign * h1, k1] : null;
}

const isSquarefree = (n: number) => {
  for (let d = 2; d * d <= n; d += 1) if (n % (d * d) === 0) return false;
  return true;
};

/** "p", "-p/q" and their TeX, with the sign in front. */
function spellRational(p: number, q: number): FormSpelling {
  const sign = p < 0 ? "-" : "";
  const n = Math.abs(p);
  if (q === 1) return { plain: `${sign}${n}`, tex: `${sign}${n}` };
  return { plain: `${sign}${n}/${q}`, tex: `${sign}\\frac{${n}}{${q}}` };
}

/** A coefficient p/q in front of a symbol ("√3", "π"): "2√3", "√3/2", "3π/4"; the TeX puts the symbol on the top line. */
function spellWithSymbol(p: number, q: number, plainSymbol: string, texSymbol: string): FormSpelling {
  const sign = p < 0 ? "-" : "";
  const n = Math.abs(p);
  const top = n === 1 ? plainSymbol : `${n}${plainSymbol}`;
  const texTop = n === 1 ? texSymbol : `${n}${texSymbol}`;
  if (q === 1) return { plain: `${sign}${top}`, tex: `${sign}${texTop}` };
  return { plain: `${sign}${top}/${q}`, tex: `${sign}\\frac{${texTop}}{${q}}` };
}

export function spellInForm(value: number, form: SpellableForm): FormSpelling | null {
  if (!Number.isFinite(value)) return null;
  switch (form) {
    case "fraction": {
      const r = rationalOf(value);
      return r ? spellRational(r[0], r[1]) : null;
    }
    case "mixed": {
      const r = rationalOf(value);
      if (!r) return null;
      const [p, q] = r;
      if (q === 1 || Math.abs(p) < q) return spellRational(p, q);
      const whole = Math.trunc(p / q);
      const rest = Math.abs(p) - Math.abs(whole) * q;
      return { plain: `${whole} ${rest}/${q}`, tex: `${whole}\\frac{${rest}}{${q}}` };
    }
    case "surd": {
      const whole = rationalOf(value, 1000);
      if (whole && whole[1] === 1) return spellRational(whole[0], 1);
      for (let b = 2; b <= 2000; b += 1) {
        if (!isSquarefree(b)) continue;
        const r = rationalOf(value / Math.sqrt(b), 1000);
        if (r) return spellWithSymbol(r[0], r[1], `√${b}`, `\\sqrt{${b}}`);
      }
      return null;
    }
    case "pi": {
      const r = rationalOf(value / Math.PI, 1000);
      return r ? spellWithSymbol(r[0], r[1], "π", "\\pi") : null;
    }
    case "standardForm": {
      if (value === 0) return { plain: "0", tex: "0" };
      let n = Math.floor(Math.log10(Math.abs(value)));
      let a = Number((value / 10 ** n).toPrecision(10));
      if (Math.abs(a) >= 10) {
        a = Number((a / 10).toPrecision(10));
        n += 1;
      }
      if (Math.abs(a) < 1) {
        a = Number((a * 10).toPrecision(10));
        n -= 1;
      }
      return { plain: `${a} × 10^${n}`, tex: `${a} \\times 10^{${n}}` };
    }
  }
}
