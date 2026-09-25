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
 * The checks (warnings in lesson-v2.mjs): every record in the shape; a replacedBy that exists in this topic as the
 * same kind (or null with a reason); every log with status "withdrawn" carries a record for its item; no withdrawn
 * gate id is still a gate of the note.
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

/**
 * @returns {{ records: Array<{ id: string, kind: string, replacedBy: string | null, reason: string, on: string, log: string }>, problems: Array<{ id: string, log: string, problem: string }> }}
 */
export function withdrawnFindings(blocks, bundle) {
  const records = [];
  const problems = [];
  const ids = topicIds(blocks, bundle);
  const logs = objects(bundle?.verification);
  const say = (id, log, problem) => problems.push({ id: String(id ?? "(no id)"), log, problem });

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
      else if (r.replacedBy !== null && WITHDRAWN_KINDS.includes(r.kind) && !ids[r.kind].has(r.replacedBy))
        say(r.id, log.id, `replacedBy ${r.replacedBy} is not a ${r.kind === "workedExample" ? "worked example" : r.kind === "findTheMistake" ? "find-the-mistake item" : r.kind} of this topic`);
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
