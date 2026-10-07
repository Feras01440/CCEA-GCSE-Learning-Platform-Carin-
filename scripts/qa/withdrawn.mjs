/**
 * scripts/qa/withdrawn.mjs — the withdraw-and-replace record (coordinator, 25 Sep 2026), read and checked.
 *
 * One shape, on any verification log in bundle.json's `verification`:
 *
 *   withdrawn: [{ id, kind, replacedBy, reason, on }]
 *     id          what was withdrawn: a gate id ("g3"), a bundle item id ("rp.fm.u1.x.04", "q.…", "we.…", "ftm.…"),
 *                 or a diagnostic item as "<set id>#<item id>" ("dx.fm.u1.x#01")
 *     kind        "gate" | "diagnostic" | "prompt" | "question" | "workedExample" | "findTheMistake"
 *     replacedBy  the id that replaces it, in the same form and of the same kind, or null when nothing does
 *     reason      why, in a sentence (required, and it carries the whole case when replacedBy is null)
 *     on          when, as an ISO date-time ("2026-09-25T01:30:00Z")
 *
 * Where: the note's own log (the entry whose id is note.verification) lists the note's withdrawn gates; a bundle
 * item's own log lists the item itself and has status "withdrawn"; a diagnostic set's log lists the withdrawn items
 * of that set. Nothing is deleted: a withdrawn bundle item keeps its entry, so a review card that points at it
 * resolves to "withdrawn".
 *
 * The checks (warnings in lesson-v2.mjs): every record in the shape; every log with status "withdrawn" carries a record
 * for its item; no withdrawn gate id is still a gate of the note; and a replacedBy that is not null leads, link by link,
 * to an item that ships.
 *
 * The chain (the lead's ruling, 7 Oct 2026). A record never changes, so a replacement withdrawn later keeps the old
 * record pointing at it, and its own record points on. The app follows that chain (src/lib/review/withdrawn.ts
 * resolveCardId: "a replacement that was itself withdrawn points on to its own replacement"), so the lint asks what the
 * app asks, with the app's own resolver, passed in as `resolve` (lesson-v2 loads it through tsx, the tests import it):
 * the chain must end in an item of the same kind that ships, with no circle and no dangling link. "Ships" is the build's
 * rule (pipeline/build-content.mts keep: a log found by the item's `verification` ref, else by `itemId`, that says
 * verified or published), read by the resolver together with the records, on the topic as it ships. A failing chain is
 * reported with every link ("g3 → g3b → g9") and how it ends. With no resolver passed, the old check stands: the
 * replacement must be an item of the same kind in this topic.
 */

export const WITHDRAWN_KINDS = ["gate", "diagnostic", "prompt", "question", "workedExample", "findTheMistake"];
const ISO_DATE_TIME = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2}(\.\d+)?)?(Z|[+-]\d{2}:?\d{2})?$/;

const objects = (v) => (Array.isArray(v) ? v.filter((x) => x && typeof x === "object") : []);

/** The ids of this topic by kind, for resolving replacedBy. */
function topicIds(blocks, bundle) {
  const ids = Object.fromEntries(WITHDRAWN_KINDS.map((k) => [k, new Set()]));
  for (const b of objects(blocks)) if (b.type === "gate" && typeof b.id === "string") ids.gate.add(b.id);
  for (const q of objects(bundle?.questions)) ids.question.add(q.id);
  for (const p of objects(bundle?.prompts)) ids.prompt.add(p.id);
  for (const w of objects(bundle?.workedExamples)) ids.workedExample.add(w.id);
  for (const f of objects(bundle?.findTheMistake)) ids.findTheMistake.add(f.id);
  for (const d of objects(bundle?.diagnostics)) for (const it of objects(d.items)) ids.diagnostic.add(`${d.id}#${it.id}`);
  return ids;
}

const SHIPPABLE = new Set(["verified", "published"]);
const NOUN = { gate: "gate", diagnostic: "diagnostic", prompt: "prompt", question: "question", workedExample: "worked example", findTheMistake: "find-the-mistake item" };
const MAX_LINKS = 8;

/**
 * The topic as it ships, in the shape the app's resolver reads (src/lib/content/load.ts ShippedBundle): the note's blocks
 * and the items whose log says verified or published (the build's keep), with every verification log and its records.
 */
function shippedView(blocks, bundle) {
  const logs = objects(bundle?.verification);
  const ships = (it) => SHIPPABLE.has((typeof it.verification === "string" ? logs.find((l) => l.id === it.verification) : logs.find((l) => l.itemId === it.id))?.status);
  const keep = (key) => objects(bundle?.[key]).filter(ships);
  return {
    topic: bundle?.topic ?? null,
    note: bundle?.note ?? null,
    noteBlocks: objects(blocks),
    workedExamples: keep("workedExamples"),
    diagnostics: keep("diagnostics").map((d) => ({ ...d, items: objects(d.items) })),
    questions: keep("questions").map((q) => ({ ...q, parts: objects(q.parts) })),
    findTheMistake: keep("findTheMistake"),
    prompts: keep("prompts"),
    insight: null,
    sets: [],
    verification: logs,
  };
}

/** The id the app records a card under for a record's item (src/lib/session/record.ts cardIdFor), which the resolver reads. */
function cardIdFor(record, bundle) {
  if (record.kind === "gate") return `${bundle?.topic?.id ?? "topic"}#gate:${record.id}`;
  if (record.kind === "workedExample") return `${record.id}#twin`;
  if (record.kind === "question") return `${record.id}#${objects(objects(bundle?.questions).find((q) => q.id === record.id)?.parts)[0]?.id ?? "a"}`;
  return record.id; // a prompt, a find-the-mistake item, a diagnostic item as "<set id>#<item id>"
}

/** The links of a record's chain, for the problem line only (the verdict is the resolver's), and how the chain ends. */
function chainOf(record, records) {
  const named = (id) => records.filter((x) => x.kind === record.kind && x.id === id);
  const ids = [record.id];
  let current = record;
  while (current.replacedBy !== null && current.replacedBy !== undefined) {
    const next = String(current.replacedBy);
    ids.push(next);
    if (ids.indexOf(next) < ids.length - 1) return { ids, end: "circle", at: next };
    if (ids.length > MAX_LINKS + 1) return { ids, end: "long", at: next };
    const own = named(next);
    if (own.length === 0) return { ids, end: "last", at: next };
    current = own.find((x) => x.replacedBy !== null) ?? own[0];
  }
  return { ids, end: "nothing", at: ids[ids.length - 1] };
}

/**
 * @param {any[]} blocks  note.blocks.json
 * @param {any} bundle  bundle.json
 * @param {{ resolve?: any }} [ctx]  src/lib/review/withdrawn.ts resolveCardId, to follow each replacedBy chain as the app does
 * @returns {{ records: Array<{ id: string, kind: string, replacedBy: string | null, reason: string, on: string, log: string }>, problems: Array<{ id: string, log: string, problem: string }> }}
 */
export function withdrawnFindings(blocks, bundle, { resolve } = {}) {
  const records = [];
  const problems = [];
  const ids = topicIds(blocks, bundle);
  const logs = objects(bundle?.verification);
  const say = (id, log, problem) => problems.push({ id: String(id ?? "(no id)"), log, problem });
  const allRecords = logs.flatMap((l) => objects(l.withdrawn));
  const view = resolve ? shippedView(blocks, bundle) : null;

  for (const log of logs) {
    const list = log.withdrawn;
    if (list === undefined) continue;
    if (!Array.isArray(list)) {
      say(log.itemId, log.id, "withdrawn must be a list of records");
      continue;
    }
    for (const r of list) {
      if (!r || typeof r !== "object") {
        say("(record)", log.id, "a withdrawn entry is not a record");
        continue;
      }
      records.push({ ...r, log: log.id });
      if (typeof r.id !== "string" || !r.id) say(r.id, log.id, "id is missing");
      if (!WITHDRAWN_KINDS.includes(r.kind)) say(r.id, log.id, `kind "${r.kind}" is not one of ${WITHDRAWN_KINDS.join(", ")}`);
      if (typeof r.reason !== "string" || !r.reason.trim()) say(r.id, log.id, "no reason given");
      if (typeof r.on !== "string" || !ISO_DATE_TIME.test(r.on)) say(r.id, log.id, `on "${r.on}" is not an ISO date-time`);
      if (!("replacedBy" in r)) say(r.id, log.id, "replacedBy is missing (write null when nothing replaces it)");
      else if (r.replacedBy !== null && WITHDRAWN_KINDS.includes(r.kind) && typeof r.id === "string" && r.id) {
        const noun = NOUN[r.kind];
        if (!view) {
          if (!ids[r.kind].has(r.replacedBy)) say(r.id, log.id, `replacedBy ${r.replacedBy} is not a ${noun} of this topic`);
        } else if (resolve(cardIdFor(r, bundle), view)?.kind !== "replaced") {
          const c = chainOf(r, allRecords);
          const how =
            c.end === "circle"
              ? `goes round in a circle (${c.at} comes back)`
              : c.end === "nothing"
                ? `ends in ${c.at}, withdrawn with nothing in its place`
                : c.end === "long"
                  ? `runs past ${MAX_LINKS} links`
                  : ids[r.kind].has(c.at)
                    ? `ends in ${c.at}, which does not ship and no record withdraws it`
                    : `ends in ${c.at}, which is not a ${noun} of this topic`;
          say(r.id, log.id, `replacedBy chain ${c.ids.join(" → ")} does not end in a ${noun} that ships: it ${how}`);
        }
      }
      if (r.kind === "gate" && ids.gate.has(r.id)) say(r.id, log.id, "withdrawn, but the note still has a gate with this id");
    }
  }

  // every log that says withdrawn carries the record for its own item (or, for a diagnostic set, for its items)
  const recorded = new Set(records.map((r) => r.id));
  for (const log of logs) {
    if (log.status !== "withdrawn") continue;
    const item = String(log.itemId ?? "");
    const has = recorded.has(item) || [...recorded].some((id) => id.startsWith(`${item}#`));
    if (!has) say(item, log.id, "its log says withdrawn but carries no withdrawn record for it");
  }
  return { records, problems };
}
