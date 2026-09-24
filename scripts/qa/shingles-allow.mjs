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
 * @param {{ papers: number, schemes: number, reports: number }} h  how many corpus files of each kind share it
 * @param {object|null} allow  allowedBy's answer
 * @param {() => boolean} commandMaterial  whether the run is instruction language (asked only when needed)
 * @param {number} stockPapers  papers a run must recur in to be stock language
 */
export function verdict(h, allow, commandMaterial, stockPapers = 3) {
  if (allow) return "allowed";
  if (h.schemes > 0 || h.reports > 0) return "scheme-or-report";
  if (h.papers >= stockPapers) return commandMaterial() ? "stock" : "stimulus-copy";
  return "paper-copy";
}
