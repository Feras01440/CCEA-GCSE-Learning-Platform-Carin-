/**
 * Review cards for items a later pass withdrew, settled so that none is left dangling.
 *
 * A depth pass never deletes a published item: it withdraws it and records the withdrawal in one machine-readable shape
 * on the bundle's verification logs (commit 756fc25, pipeline/prompts/author-topic.md "Withdraw and replace: one record"):
 *
 *   withdrawn: [{ id, kind, replacedBy, reason, on }]
 *     a gate on the note's own log ("g3"); a bundle item on its own log ("rp.…", "q.…", "we.…", "ftm.…"); a diagnostic
 *     item as "<set id>#<item id>" on its set's log. replacedBy is the replacing id of the same kind, or null.
 *
 * A card she earned on the withdrawn item still carries her schedule for that skill, so it moves to the replacement with
 * its FSRS state intact (a hypercorrection re-probe too); if she already has a card for the replacement, that card is the
 * better evidence and the old one goes; when nothing replaces the item, the card is retired. Her attempts are never
 * touched: they are the record of what she answered, on the item she answered. A card whose item the bundle does not
 * ship and no record explains is left exactly as it is (the inbox's own "withdrawn while it is checked" path), because
 * nothing here can prove what happened to it.
 *
 * Before this (seen on build 8, 27 September 2026) the inbox showed a withdrawn item's card as "This item has been
 * withdrawn from the content while it is checked" with Skip, and the card stayed due for ever: every evening, and in
 * Today's count. The trial topic's published bundle carries 18 records.
 *
 * Card ids are the recorded item ids (src/lib/session/record.ts cardIdFor), one form per kind: `<topicId>#gate:<gateId>`,
 * `<weId>#twin`, `<questionId>#<partId>`, and a bare id for a prompt, a find-the-mistake item or a diagnostic item (the
 * item's own id within its set, as CheckSection and PracticeFlow record it), each optionally wrapped as `hc:<id>:<n>`.
 */
import { getDB, type ReviewCard } from "@/lib/db/db";
import type { ShippedBundle } from "@/lib/content/load";

export type WithdrawnKind = "gate" | "diagnostic" | "prompt" | "question" | "workedExample" | "findTheMistake";

export interface WithdrawnRecord {
  id: string;
  kind: WithdrawnKind;
  replacedBy: string | null;
  reason: string;
  on: string;
}

/** Where a card now points. */
export type CardResolution =
  /** Its item ships and nothing withdrew it. */
  | { kind: "current" }
  /** Its item was withdrawn: the card moves to `to` (following a chain of withdrawals to the end). */
  | { kind: "replaced"; to: string; chain: WithdrawnRecord[] }
  /** Its item was withdrawn with nothing in its place (or its replacement cannot be found): the card is retired. */
  | { kind: "retired"; record: WithdrawnRecord }
  /**
   * Its item is current but the card carries a diagnostic's bare id ("01"), which 136 topics share: the card moves to its
   * own topic's form, "<set id>#<item id>", so the bare id is free for the next topic's card (the independent review of
   * 27 Sep 2026, item 1).
   */
  | { kind: "renamed"; to: string }
  /** Not shipped, and no record says why: left alone. */
  | { kind: "unknown" };

type LogWithRecords = { withdrawn?: WithdrawnRecord[] | null };

/** Every withdrawn record on every verification log of a shipped bundle. */
export function withdrawnRecords(bundle: Pick<ShippedBundle, "verification">): WithdrawnRecord[] {
  const out: WithdrawnRecord[] = [];
  for (const log of (bundle.verification ?? []) as LogWithRecords[]) {
    for (const r of log.withdrawn ?? []) if (r && typeof r.id === "string" && r.kind) out.push(r);
  }
  return out;
}

/** How one kind of card id is read, checked and rebuilt. */
interface Form {
  kind: WithdrawnKind;
  /** The id a record names for this card's item. */
  recordId: string;
  /** Whether an id of this kind (in record form) ships in the bundle as a current item. */
  ships: (recordId: string) => boolean;
  /** The card id for an item of this kind (record form in). */
  cardId: (recordId: string) => string | null;
  /** Records of this kind naming the card's item (diagnostic cards match on the item part of "<set>#<item>"). */
  recordsFor: (recordId: string) => WithdrawnRecord[];
}

const MAX_CHAIN = 8;

function formOf(cardId: string, bundle: ShippedBundle, records: WithdrawnRecord[]): Form | null {
  const byKind = (kind: WithdrawnKind) => records.filter((r) => r.kind === kind);
  const exact = (kind: WithdrawnKind) => (id: string) => byKind(kind).filter((r) => r.id === id);
  const withdrawnIds = (kind: WithdrawnKind) => new Set(byKind(kind).map((r) => r.id));

  const gateId = /#gate:(.+)$/.exec(cardId)?.[1];
  if (gateId !== undefined) {
    const topicId = cardId.slice(0, cardId.lastIndexOf("#gate:"));
    const blocks = (bundle.noteBlocks ?? null) as Array<{ type?: string; id?: string }> | null;
    // Without the note's blocks nothing can be said about a gate: leave it to the inbox.
    if (!blocks || blocks.length === 0) return null;
    const gone = withdrawnIds("gate");
    return {
      kind: "gate",
      recordId: gateId,
      ships: (id) => !gone.has(id) && blocks.some((b) => b.type === "gate" && b.id === id),
      cardId: (id) => `${topicId}#gate:${id}`,
      recordsFor: exact("gate"),
    };
  }

  if (cardId.endsWith("#twin")) {
    const gone = withdrawnIds("workedExample");
    return {
      kind: "workedExample",
      recordId: cardId.slice(0, -"#twin".length),
      ships: (id) => !gone.has(id) && bundle.workedExamples.some((w) => w.id === id),
      cardId: (id) => `${id}#twin`,
      recordsFor: exact("workedExample"),
    };
  }

  const hash = cardId.lastIndexOf("#");
  // A diagnostic item in its set's own form, "<set id>#<item id>" (the records' form, and the card's once it is its topic's
  // own): a set the bundle ships, or one a record names. Before the question part, which has the same shape.
  const dxGone = withdrawnIds("diagnostic");
  if (hash > 0) {
    const setId = cardId.slice(0, hash);
    if (bundle.diagnostics.some((s) => s.id === setId) || byKind("diagnostic").some((r) => r.id.startsWith(`${setId}#`))) {
      return {
        kind: "diagnostic",
        recordId: cardId,
        ships: (id) => !dxGone.has(id) && shipsDiagnostic(bundle, id),
        cardId: (id) => id,
        recordsFor: exact("diagnostic"),
      };
    }
  }
  if (hash > 0) {
    const questionId = cardId.slice(0, hash);
    const partId = cardId.slice(hash + 1);
    const gone = withdrawnIds("question");
    const question = (id: string) => bundle.questions.find((q) => q.id === id);
    return {
      kind: "question",
      recordId: questionId,
      ships: (id) => !gone.has(id) && !!question(id)?.parts.length,
      // The same part of the replacement when it has one, otherwise where the replacement begins.
      cardId: (id) => {
        const q = question(id);
        if (!q || q.parts.length === 0) return null;
        return `${id}#${q.parts.some((p) => p.id === partId) ? partId : q.parts[0].id}`;
      },
      recordsFor: exact("question"),
    };
  }

  // A dotted bare id: a prompt or a find-the-mistake item by its own id. (A diagnostic's bare id is read before this, by
  // resolveCardId, as the legacy form it is.)
  for (const kind of ["prompt", "findTheMistake"] as const) {
    const list = kind === "prompt" ? bundle.prompts : bundle.findTheMistake;
    const gone = withdrawnIds(kind);
    if (gone.has(cardId) || list.some((x) => x.id === cardId)) {
      return { kind, recordId: cardId, ships: (id) => !gone.has(id) && list.some((x) => x.id === id), cardId: (id) => id, recordsFor: exact(kind) };
    }
  }
  return null;
}

/** A diagnostic item "<set id>#<item id>" the bundle ships. */
function shipsDiagnostic(bundle: ShippedBundle, id: string): boolean {
  const hash = id.lastIndexOf("#");
  if (hash <= 0) return false;
  const set = bundle.diagnostics.find((s) => s.id === id.slice(0, hash));
  return !!set && set.items.some((it) => it.id === id.slice(hash + 1));
}

/**
 * A diagnostic's bare item id ("01", "p1", "d3"): the id the lesson and practice have recorded diagnostics under, which
 * 136 topics share. No dot, no hash, no colon: every other kind of card id has one of them.
 */
export function isBareDiagnosticId(id: string): boolean {
  return id.length > 0 && !/[.#:]/.test(id);
}

/**
 * A card under a diagnostic's bare id, in its own topic's bundle: renamed to its set's form when the item is current (the
 * first set that ships it, the one she meets first when a topic's "pre" and "post" checks share an id), or followed
 * through the withdrawn records when it was withdrawn. Null when the bundle knows no such item.
 */
function legacyDiagnostic(bare: string, bundle: ShippedBundle, records: WithdrawnRecord[]): CardResolution | null {
  const gone = new Set(records.filter((r) => r.kind === "diagnostic").map((r) => r.id));
  const set = bundle.diagnostics.find((s) => s.items.some((it) => it.id === bare) && !gone.has(`${s.id}#${bare}`));
  if (set) return { kind: "renamed", to: `${set.id}#${bare}` };
  const named = records.filter((r) => r.kind === "diagnostic" && r.id.slice(r.id.lastIndexOf("#") + 1) === bare);
  if (named.length === 0) return null;
  const record = named.find((r) => r.replacedBy !== null) ?? named[0];
  return resolveCardId(record.id, bundle);
}

/**
 * Where a card (its id less any hypercorrection wrapper) now points, in this bundle. Pure. A diagnostic card under the
 * bare item id takes its set's form: the same item, its own topic's card.
 */
export function resolveCardId(cardId: string, bundle: ShippedBundle): CardResolution {
  const records = withdrawnRecords(bundle);
  if (isBareDiagnosticId(cardId)) return legacyDiagnostic(cardId, bundle, records) ?? { kind: "unknown" };
  const form = formOf(cardId, bundle, records);
  if (!form) return { kind: "unknown" };

  let names = form.recordsFor(form.recordId);
  if (names.length === 0) return form.ships(form.recordId) ? { kind: "current" } : { kind: "unknown" };

  // Follow the withdrawals to the end: a replacement that was itself withdrawn points on to its own replacement.
  const chain: WithdrawnRecord[] = [];
  const seen = new Set<string>([form.recordId]);
  let record = names.find((r) => r.replacedBy !== null) ?? names[0];
  for (let hop = 0; hop < MAX_CHAIN; hop += 1) {
    chain.push(record);
    if (record.replacedBy === null) return { kind: "retired", record };
    const next = record.replacedBy;
    if (seen.has(next)) return { kind: "retired", record };
    seen.add(next);
    names = form.recordsFor(next);
    if (names.length > 0 && !form.ships(next)) {
      record = names.find((r) => r.replacedBy !== null) ?? names[0];
      continue;
    }
    const to = form.ships(next) ? form.cardId(next) : null;
    return to && to !== cardId ? { kind: "replaced", to, chain } : { kind: "retired", record };
  }
  return { kind: "retired", record };
}

/** What a settle did, for tests and for the caller's own record. Never shown to her. */
export interface SettleReport {
  replaced: Array<{ from: string; to: string }>;
  /** Diagnostic cards moved from a bare item id to their own topic's form. */
  renamed: Array<{ from: string; to: string }>;
  merged: Array<{ from: string; into: string }>;
  retired: string[];
}

const HC = /^hc:(.+):(\d+)$/;

/**
 * Every card still under a diagnostic's bare id (a re-probe of one included), on this device: the cards Today settles on
 * every open, due or not, so a card is its own topic's before the next topic's answer can find it.
 */
export async function bareDiagnosticCards(): Promise<ReviewCard[]> {
  const all = await getDB().cards.toArray();
  return all.filter((c) => isBareDiagnosticId(HC.exec(c.id)?.[1] ?? c.id));
}

/**
 * Settles these cards against their topics' bundles: each withdrawn item's card moves to its replacement (keeping its
 * FSRS state, due date and age), joins a card she already has for it, or is retired. One read-write transaction per
 * card, so a card is never half moved; safe to run twice (the second run finds nothing to do) and alongside another
 * run. `load` hands back the topic's shipped bundle, or null when there is none to read (offline, not shipped): then
 * that topic's cards are left alone.
 */
export async function settleWithdrawnCards(
  cards: ReviewCard[],
  load: (card: ReviewCard) => Promise<ShippedBundle | null>,
): Promise<SettleReport> {
  const report: SettleReport = { replaced: [], renamed: [], merged: [], retired: [] };
  const bundles = new Map<string, Promise<ShippedBundle | null>>();
  const bundleFor = (card: ReviewCard) => {
    const key = `${card.subject}:${card.topicSlug}`;
    let p = bundles.get(key);
    if (!p) {
      p = load(card).catch(() => null);
      bundles.set(key, p);
    }
    return p;
  };

  const db = getDB();
  for (const card of cards) {
    const bundle = await bundleFor(card);
    if (!bundle) continue;
    const hc = HC.exec(card.id);
    const base = hc ? hc[1] : card.id;
    const resolution = resolveCardId(base, bundle);
    if (resolution.kind === "current" || resolution.kind === "unknown") continue;

    if (resolution.kind === "retired") {
      const gone = await db.transaction("rw", db.cards, async () => {
        if (!(await db.cards.get(card.id))) return false;
        await db.cards.delete(card.id);
        return true;
      });
      if (gone) report.retired.push(card.id);
      continue;
    }

    const to = hc ? `hc:${resolution.to}:${hc[2]}` : resolution.to;
    const outcome = await db.transaction("rw", db.cards, async () => {
      const old = await db.cards.get(card.id);
      if (!old) return null;
      const already = await db.cards.get(to);
      if (!already) await db.cards.put({ ...old, id: to });
      await db.cards.delete(card.id);
      return already ? "merged" : "replaced";
    });
    if (outcome === "replaced") (resolution.kind === "renamed" ? report.renamed : report.replaced).push({ from: card.id, to });
    if (outcome === "merged") report.merged.push({ from: card.id, into: to });
  }
  return report;
}
