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

/*
 * Withdrawn items are not read (the lead, 29 Sep 2026). A withdrawn item stays in the pack byte-identical by rule (a
 * review card may still point at it), and a shingle line against it tempts an author to edit a copy that must not
 * change (one did). The rule is the marking and size lints' (src/components/items/content-lint.ts, item 15): an id in a
 * withdrawn record (VerificationLog.withdrawn[].id; a diagnostic item as "<set id>#<item id>"), or an item whose own log
 * (found by its `verification` ref, else by `itemId`) says "withdrawn". Drafts are still read: they are what an author
 * checks before filing. The pack is never changed; these return filtered copies.
 *
 * A withdrawn item's own verification log is trimmed too (the B2 author, 8 Oct 2026: four textbook-copy runs in
 * b2-monohybrid-genetics sat only in the scope-tier checks of nine withdrawn items' logs). Its check and report texts
 * never ship and never change; it keeps its id, item, status and withdrawn records, which the app's resolver
 * (src/lib/review/withdrawn.ts) and noteWithoutWithdrawn still read.
 */
const logsOf = (bundle) => (Array.isArray(bundle?.verification) ? bundle.verification.filter((l) => l && typeof l === "object") : []);
const recordsOf = (bundle) => logsOf(bundle).flatMap((l) => (Array.isArray(l.withdrawn) ? l.withdrawn : [])).filter((r) => r && typeof r === "object");

/** A withdrawn item's log as the lints read it: what identifies it and its withdrawn records, never its check texts. */
const trimmedLog = (l) => ({ id: l.id, itemId: l.itemId, status: l.status, ...(Array.isArray(l.withdrawn) ? { withdrawn: l.withdrawn } : {}) });

/**
 * The bundle without its withdrawn questions, worked examples, diagnostic sets and items, find-the-mistake items and
 * prompts, and with those items' own verification logs trimmed to their ids, status and withdrawn records.
 */
export function withoutWithdrawn(bundle) {
  if (!bundle || typeof bundle !== "object") return bundle;
  const logs = logsOf(bundle);
  const gone = new Set(recordsOf(bundle).map((r) => String(r.id)));
  const ownLog = (it) => (typeof it.verification === "string" ? logs.find((l) => l.id === it.verification) : logs.find((l) => l.itemId === it.id));
  const withdrawn = (it) => it && typeof it === "object" && (gone.has(String(it.id)) || ownLog(it)?.status === "withdrawn");
  const copy = { ...bundle };
  for (const key of ["questions", "workedExamples", "findTheMistake", "prompts"]) if (Array.isArray(bundle[key])) copy[key] = bundle[key].filter((it) => !withdrawn(it));
  if (Array.isArray(bundle.diagnostics))
    copy.diagnostics = bundle.diagnostics
      .filter((d) => !withdrawn(d))
      .map((d) => (Array.isArray(d?.items) ? { ...d, items: d.items.filter((it) => !gone.has(`${d.id}#${it?.id}`)) } : d));
  // the logs of the items just dropped (by their verification ref, else by itemId), and any log that says withdrawn
  const items = ["questions", "workedExamples", "findTheMistake", "prompts", "diagnostics"].flatMap((k) => (Array.isArray(bundle[k]) ? bundle[k] : []));
  const ownLogIds = new Set(items.filter(withdrawn).map((it) => ownLog(it)?.id).filter(Boolean));
  if (Array.isArray(bundle.verification))
    copy.verification = bundle.verification.map((l) =>
      l && typeof l === "object" && (ownLogIds.has(l.id) || gone.has(String(l.itemId)) || l.status === "withdrawn") ? trimmedLog(l) : l,
    );
  return copy;
}

/**
 * The specification's own runs of n words (data/spec/*.json, parsed): every run inside one string, and every run of an
 * outcome read as the one passage it prints as, its stem followed by its bullets (and theirs) in order (the B2 author,
 * 8 Oct 2026: "gamete and offspring ratios, percentages and probabilities, homozygous and heterozygous genotypes" is
 * 2.4.8's second and third bullets joined, as the eGuide reprints them). Two outcomes, or the items of a plain list,
 * are never joined: they do not stand together as one sentence.
 * @param {unknown[]} specs  the parsed spec files
 * @param {number} n  the run length
 * @returns {Set<string>}
 */
export function specRuns(specs, n) {
  const runs = new Set();
  const add = (text) => {
    const w = words(text);
    for (let i = 0; i + n <= w.length; i++) runs.add(w.slice(i, i + n).join(" "));
  };
  /** An outcome's passage: its text, then each bullet's passage, in order. */
  const passage = (o) => [typeof o?.text === "string" ? o.text : "", ...(Array.isArray(o?.bullets) ? o.bullets.map(passage) : [])].filter(Boolean).join(" ");
  const walk = (o) => {
    if (typeof o === "string") add(o);
    else if (Array.isArray(o)) o.forEach(walk);
    else if (o && typeof o === "object") {
      if (typeof o.text === "string" && Array.isArray(o.bullets) && o.bullets.length) add(passage(o));
      Object.values(o).forEach(walk);
    }
  };
  for (const s of specs) walk(s);
  return runs;
}

/** The note without the gates its bundle's logs withdraw (records of kind "gate"). */
export function noteWithoutWithdrawn(blocks, bundle) {
  if (!Array.isArray(blocks)) return blocks;
  const gates = new Set(recordsOf(bundle).filter((r) => r.kind === "gate").map((r) => String(r.id)));
  return gates.size ? blocks.filter((b) => !(b && b.type === "gate" && gates.has(String(b.id)))) : blocks;
}
