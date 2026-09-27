/**
 * scripts/qa/shingles-allow.mjs — the pure rules behind scripts/qa/shingles.mjs's verdict on one shared run.
 *
 * A standard statement of a named theorem, law or definition (scripts/qa/shingles.allow.json) is common
 * mathematical or scientific language: a circle theorem has one accepted English form, the mark schemes print
 * it as the reason a candidate must give, and the marker checks her answer for exactly those words. So a run
 * that lies inside an allow-listed statement is "allowed" even when a mark scheme or report prints it (25 Sep
 * 2026: the M4 circle-theorems reasons were breaches only because the schemes print the theorems). A run may
 * open with the word that introduces the reason ("because the angle at the centre is twice", "that the angle
 * at the centre is twice"); the rest of it must lie inside the statement. Everything else keeps its verdict:
 * a scheme or report run that is not an allow-listed statement is never allowed.
 */

/** Words only: LaTeX commands, punctuation and symbols drop out, so spacing never hides a copy. */
export const words = (s) =>
  String(s)
    .replace(/\\[a-zA-Z]+/g, " ")
    .replace(/[^A-Za-z0-9\s]/g, " ")
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean);

/** The words that introduce a stated reason; a run may open with one and still be the statement. */
export const REASON_OPENERS = new Set(["because", "that"]);

/** The allow-list as { statement, reason, normalised }, from the parsed JSON (keys beginning with $ ignored). */
export function allowEntries(json) {
  return Object.entries(json ?? {})
    .filter(([k]) => !k.startsWith("$"))
    .map(([statement, reason]) => ({ statement, reason, normalised: words(statement).join(" ") }));
}

/** The allow-list entry a run sits inside, or null. */
export function allowedBy(seq, entries) {
  const inside = (s) => entries.find((a) => ` ${a.normalised} `.includes(` ${s} `)) ?? null;
  const direct = inside(seq);
  if (direct) return direct;
  const [first, ...rest] = seq.split(" ");
  return REASON_OPENERS.has(first) && rest.length ? inside(rest.join(" ")) : null;
}

/**
 * The verdict on one shared run.
 * @param {{ papers: number, schemes: number, reports: number, textbooks?: number }} h  how many corpus files of each kind share it
 * @param {object|null} allow  allowedBy's answer
 * @param {() => boolean} commandMaterial  whether the run is instruction language (asked only when needed)
 * @param {number} stockPapers  papers a run must recur in to be stock language
 *
 * A run a CCEA textbook shares (docs/sources/textbooks/*.txt, the lead's item 12, 27 Sep 2026) is a "textbook-copy"
 * breach: no author's wording shares a run with a textbook sentence. Two things a textbook prints that are not its own
 * prose keep their verdict: an allow-listed named statement, and the board's stock instruction language (a run in three
 * or more question papers that is command material), which a textbook quotes like everyone else.
 */
export function verdict(h, allow, commandMaterial, stockPapers = 3) {
  if (allow) return "allowed";
  if (h.schemes > 0 || h.reports > 0) return "scheme-or-report";
  if ((h.textbooks ?? 0) > 0) return h.papers >= stockPapers && commandMaterial() ? "stock" : "textbook-copy";
  if (h.papers >= stockPapers) return commandMaterial() ? "stock" : "stimulus-copy";
  return "paper-copy";
}

/**
 * A textbook's pages, from its text as pdftotext writes it: one form feed (\f) between PDF pages. Each page carries its
 * PDF page number (1-based, the page the PDF viewer opens) and the number printed on it when its last non-empty line is
 * a number alone (the book's own page, often two or four fewer than the PDF's), with the index of its first word in the
 * whole book's `words` list, so a shared run's first word gives its page.
 * @param {string} text
 * @returns {Array<{ pdfPage: number, printed: string|null, firstWord: number }>}
 */
export function textbookPages(text) {
  const out = [];
  let firstWord = 0;
  String(text).split("\f").forEach((page, i) => {
    const lines = page.split("\n").map((l) => l.trim()).filter(Boolean);
    const last = lines[lines.length - 1] ?? "";
    out.push({ pdfPage: i + 1, printed: /^\d{1,4}$/.test(last) ? last : null, firstWord });
    firstWord += words(bookPage(page, i)).length;
  });
  return out;
}

/**
 * A textbook page's own text: without its running header (the "… eGuide" line every page opens with) and, on a cover
 * (the first page with under 40 words), without anything: the book's title is what a verification log cites when it
 * names the book, never a copy of it.
 */
export function bookPage(page, index) {
  const text = String(page)
    .split("\n")
    .filter((l) => !/\beGuide\b/.test(l))
    .join("\n");
  return index === 0 && words(text).length < 40 ? "" : text;
}

/** A textbook's words, page by page as textbookPages counts them. */
export const bookWords = (text) => String(text).split("\f").flatMap((page, i) => words(bookPage(page, i)));

/** The page holding the book's word number `at` (its index in the whole book's `words` list). */
export function pageOfWord(pages, at) {
  let hit = pages[0];
  for (const p of pages) {
    if (p.firstWord > at) break;
    hit = p;
  }
  return hit ? { pdfPage: hit.pdfPage, printed: hit.printed } : null;
}
