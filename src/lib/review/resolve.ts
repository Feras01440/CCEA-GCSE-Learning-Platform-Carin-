"use client";

import { useLiveQuery } from "dexie-react-hooks";
import { useEffect, useMemo, useState } from "react";
import { getDB, type ReviewCard } from "@/lib/db/db";
import { contentFor, loadBundle, type ShippedBundle } from "@/lib/content/load";
import type { DiagnosticItem, FindTheMistake, Part, Question, RetrievalPrompt, WorkedExample } from "@/lib/content/schema";
import type { Flashcard, ShippedDeck } from "@/lib/content/deck-schema";
import { deckFor, loadDeck } from "@/lib/content/decks";
import type { GateBlock, NoteBlock } from "@/components/items/gates";
import { topicsFor, unitsFor, type Subject } from "@/lib/content/taxonomy";
import { pickQueue } from "@/lib/srs/queue";
import { sourceItemId } from "@/lib/srs/hypercorrection";
import { useExamPlan } from "@/lib/plan/store";
import { todayISO, upcomingPapers, type ExamPlan } from "@/lib/plan/exam-plan";
import { bareDiagnosticCards, settleWithdrawnCards } from "./withdrawn";

/** The item a card stands for, as the inbox has to render it. */
export type ResolvedContent =
  | { kind: "prompt"; prompt: RetrievalPrompt }
  | { kind: "diagnostic"; item: DiagnosticItem }
  /** One part of a practice or exam-style question: the card is per part, as the marks are. */
  | { kind: "question"; question: Question; part: Part }
  | { kind: "mistake"; item: FindTheMistake }
  /**
   * A check from the lesson's note, asked again on its own: on alternate returns its twin (same structure, new numbers),
   * which is `variant: "twin"` and carries no note figure (gateForReview).
   */
  | { kind: "gate"; gate: GateBlock; context: NoteBlock[]; variant?: "original" | "twin" }
  /** A worked example, met again as its twin: same structure, new numbers. */
  | { kind: "twin"; we: WorkedExample }
  /** A flashcard from its unit's deck (fc.*): graded in Flashcards, it comes back here like every other card. */
  | { kind: "flashcard"; card: Flashcard };

/** A card joined to the content it tests. `content` is null when the bundle no longer ships the item. */
export interface ResolvedCard {
  card: ReviewCard;
  /** The item id to record an attempt against (the card id, less any hypercorrection prefix). */
  itemId: string;
  subject: Subject;
  unit: string;
  topicSlug: string;
  topicTitle: string;
  content: ResolvedContent | null;
}

const unitCache = new Map<string, { unit: string; title: string }>();
function unitForTopic(subject: Subject, slug: string): { unit: string; title: string } | null {
  const key = `${subject}:${slug}`;
  const hit = unitCache.get(key);
  if (hit) return hit;
  for (const u of unitsFor(subject)) {
    const t = topicsFor(subject, u.code).find((x) => x.slug === slug);
    if (t) {
      const v = { unit: u.code, title: t.title };
      unitCache.set(key, v);
      return v;
    }
  }
  return null;
}

/**
 * The item a card id points at, in the bundle as it ships today. Card ids are the recorded item
 * ids (src/lib/session/record.ts `cardIdFor`), so each kind is found by the shape of its id:
 * a bare id is a prompt, a diagnostic or a find-the-mistake item; `<weId>#twin` is a worked
 * example; `<topicId>#gate:<gateId>` is a check in the note; `<questionId>#<partId>` is one part
 * of a question. Null when the bundle no longer ships it — the inbox then skips the card.
 */
export function findInBundle(bundle: ShippedBundle, itemId: string): ResolvedContent | null {
  const prompt = bundle.prompts.find((p) => p.id === itemId);
  if (prompt) return { kind: "prompt", prompt };
  for (const set of bundle.diagnostics) {
    const item = set.items.find((d) => d.id === itemId);
    if (item) return { kind: "diagnostic", item };
  }
  const mistake = bundle.findTheMistake.find((f) => f.id === itemId);
  if (mistake) return { kind: "mistake", item: mistake };

  const TWIN = "#twin";
  if (itemId.endsWith(TWIN)) {
    const we = bundle.workedExamples.find((w) => w.id === itemId.slice(0, -TWIN.length));
    return we ? { kind: "twin", we } : null;
  }

  // A diagnostic item named by its set, "<set id>#<item id>": the form a diagnostic card takes as its own topic's (a bare
  // item id such as "01" is shared by 136 topics; the independent review of 27 Sep 2026). Before the question-part form,
  // which has the same shape.
  const hashAt = itemId.lastIndexOf("#");
  if (hashAt > 0) {
    const set = bundle.diagnostics.find((s) => s.id === itemId.slice(0, hashAt));
    if (set) {
      const item = set.items.find((d) => d.id === itemId.slice(hashAt + 1));
      return item ? { kind: "diagnostic", item } : null;
    }
  }

  const gateId = /#gate:(.+)$/.exec(itemId)?.[1];
  if (gateId !== undefined) {
    // The lesson's gates ride in the bundle itself (TopicContent reads bundle.noteBlocks).
    const blocks = (bundle.noteBlocks ?? []) as NoteBlock[];
    const at = blocks.findIndex((b) => b.type === "gate" && (b as GateBlock).id === gateId);
    if (at < 0) return null;
    // A gate that says "the graph above" needs that figure beside it in the inbox: the nearest preceding figure or photo.
    const visual = blocks.slice(0, at).reverse().find((b) => b.type === "figure" || b.type === "photo");
    return { kind: "gate", gate: blocks[at] as GateBlock, context: visual ? [visual] : [] };
  }

  const hash = itemId.lastIndexOf("#");
  if (hash > 0) {
    const question = bundle.questions.find((q) => q.id === itemId.slice(0, hash));
    const part = question?.parts.find((p) => p.id === itemId.slice(hash + 1));
    if (question && part) return { kind: "question", question, part };
  }
  return null;
}

/** A flashcard in a shipped deck, by its id; null when the deck does not carry it. */
export function findInDeck(deck: ShippedDeck, id: string): Flashcard | null {
  for (const section of deck.sections) {
    for (const topic of section.topics) {
      const found = topic.cards.find((c) => c.id === id);
      if (found) return found;
    }
  }
  return null;
}

/** A stem that points at a drawing on the page: its twin (new numbers) could not use that drawing. */
const LEANS_ON_A_FIGURE = /\b(above|below|shown|diagram|graph|figure|table|drawing|picture|chart)\b/i;

/**
 * Which version of a gate the review asks (the independent review of 27 Sep 2026, item 4). The same gate with the same
 * options, days after its answer was lit in front of her, tests whether she recognises that screen, not whether she can
 * do it. A v3 gate carries a twin, the same structure on new numbers, authored and checked with it: the review asks the
 * twin on the first return and on every other one after (the card's reviews, `reps`, odd), and the gate itself in
 * between, so neither becomes a picture she remembers. The gate itself is kept when there is no twin, when its stem leans
 * on a drawing on the page (the note's figure drew the gate's numbers, not the twin's), or when a choice twin has no
 * options of its own. The twin keeps the gate's id: one card, one schedule, one record of her answers.
 */
export function gateForReview(gate: GateBlock, reps: number): { gate: GateBlock; variant: "original" | "twin" } {
  const twin = gate.twin;
  const usable = !!twin && !LEANS_ON_A_FIGURE.test(gate.prompt) && !LEANS_ON_A_FIGURE.test(twin.prompt) && (gate.kind !== "choice" || (twin.options?.length ?? 0) >= 2);
  if (!usable || reps % 2 !== 1) return { gate, variant: "original" };
  const notes = (twin as { optionNotes?: GateBlock["optionNotes"] }).optionNotes;
  const asked: GateBlock = { type: "gate", id: gate.id, kind: gate.kind, prompt: twin.prompt, answer: twin.answer, explain: twin.explain };
  if (twin.options) asked.options = twin.options;
  if (notes) asked.optionNotes = notes;
  return { gate: asked, variant: "twin" };
}

/** A deck card's id: an authored or generated flashcard lives only in its unit's deck, never in a topic bundle. */
export function isFlashcardId(itemId: string): boolean {
  return itemId.startsWith("fc.");
}

/**
 * What a card's item is, from its topic's bundle and, for a flashcard, its unit's deck. The bundle comes first: the
 * decks carry the bundles' own prompts under the same ids, and those are served as prompts. A gate is asked as the
 * version this return calls for (gateForReview, from the card's reviews). Null when neither holds it.
 */
export function resolveContent(itemId: string, bundle: ShippedBundle | null, deck: ShippedDeck | null, card?: Pick<ReviewCard, "card">): ResolvedContent | null {
  const fromBundle = bundle ? findInBundle(bundle, itemId) : null;
  if (fromBundle?.kind === "gate") {
    const { gate, variant } = gateForReview(fromBundle.gate, card?.card.reps ?? 0);
    return variant === "twin" ? { kind: "gate", gate, context: [], variant } : { ...fromBundle, variant };
  }
  if (fromBundle) return fromBundle;
  if (deck && isFlashcardId(itemId)) {
    const card = findInDeck(deck, itemId);
    if (card) return { kind: "flashcard", card };
  }
  return null;
}

/** A card's topic as it ships today, or null when it does not (the settle then leaves that topic's cards alone). */
export async function shippedBundleFor(card: Pick<ReviewCard, "subject" | "topicSlug">): Promise<ShippedBundle | null> {
  const shipped = contentFor(card.subject, card.topicSlug);
  return shipped ? loadBundle(card.subject, shipped.id) : null;
}

/** The deck of a card's unit, or null when the unit has none (or the topic is not in the catalogue). */
export async function shippedDeckFor(card: Pick<ReviewCard, "subject" | "topicSlug">): Promise<ShippedDeck | null> {
  const unit = unitForTopic(card.subject, card.topicSlug)?.unit;
  return unit && deckFor(card.subject, unit) ? loadDeck(card.subject, unit) : null;
}

/**
 * Tonight's queue from the cards due now, each already joined to its content: only cards the inbox can open are served,
 * capped and ordered exactly as the inbox orders (pickQueue: a sure-and-not-right re-probe first, then the most overdue,
 * weighted by how near each unit's paper is, interleaved by topic). A card it cannot open (its content not on this device
 * just now) never takes a place in the nightly cap, where it would sit on top every night as the most overdue; it stays
 * due, and `unopened` says how many wait.
 */
export function servableQueue(due: ResolvedCard[], plan: ExamPlan, today: string, now: Date, cap: number): { queue: ResolvedCard[]; unopened: number } {
  const open = due.filter((r) => r.content !== null);
  const daysToPaper: Record<string, number | null> = {};
  for (const p of upcomingPapers(plan, today)) daysToPaper[`${p.subject}:${p.unit}`] = p.daysAway;
  // pickQueue weights by `${subject}:${topicSlug}`; translate topic → unit proximity here.
  const byTopic: Record<string, number | null> = {};
  for (const r of open) {
    const u = unitForTopic(r.card.subject, r.card.topicSlug);
    byTopic[`${r.card.subject}:${r.card.topicSlug}`] = u ? (daysToPaper[`${r.card.subject}:${u.unit}`] ?? null) : null;
  }
  const byId = new Map(open.map((r) => [r.card.id, r]));
  const queue = pickQueue(open.map((r) => r.card), now, { cap, daysToPaper: byTopic }).map((c) => byId.get(c.id)!);
  return { queue, unopened: due.length - open.length };
}

/** The cards due now, straight from the device. */
async function readDue(): Promise<ReviewCard[]> {
  return getDB().cards.where("due").belowOrEqual(new Date()).toArray();
}

/**
 * The cards a settle looks at on an open of Today or the inbox: tonight's due cards, and every card still under a
 * diagnostic's bare id, due or not (so a diagnostic card is its own topic's before another topic's answer can find it).
 */
async function cardsToSettle(): Promise<ReviewCard[]> {
  const [due, bare] = await Promise.all([readDue(), bareDiagnosticCards()]);
  const seen = new Set(due.map((c) => c.id));
  return [...due, ...bare.filter((c) => !seen.has(c.id))];
}

/**
 * Settles the device's review cards once per mount (withdrawn items moved to their replacements or retired; diagnostic
 * cards made their own topic's) and says when it is done, or when `timeoutMs` has passed, whichever is first: a slow read
 * never holds the page. Today waits for it before it counts tonight's cards, so the count is the list the inbox serves.
 */
export function useSettledReviews(timeoutMs = 1500): boolean {
  const [done, setDone] = useState(false);
  useEffect(() => {
    let alive = true;
    const timer = setTimeout(() => {
      if (alive) setDone(true);
    }, timeoutMs);
    (async () => {
      try {
        await settleWithdrawnCards(await cardsToSettle(), shippedBundleFor);
      } catch {
        // Nothing settled: every card stays as it was.
      }
      if (alive) setDone(true);
    })();
    return () => {
      alive = false;
      clearTimeout(timer);
    };
  }, [timeoutMs]);
  return done;
}

/** A due card joined to what it tests: its topic's bundle, and for a flashcard its unit's deck. Never throws. */
async function resolveCard(card: ReviewCard): Promise<ResolvedCard> {
  const u = unitForTopic(card.subject, card.topicSlug);
  const itemId = sourceItemId(card.id);
  let bundle: ShippedBundle | null = null;
  let deck: ShippedDeck | null = null;
  try {
    bundle = await shippedBundleFor(card);
  } catch {
    bundle = null;
  }
  if (isFlashcardId(itemId)) {
    try {
      deck = await shippedDeckFor(card);
    } catch {
      deck = null;
    }
  }
  return { card, itemId, subject: card.subject, unit: u?.unit ?? "", topicSlug: card.topicSlug, topicTitle: u?.title ?? card.topicSlug, content: resolveContent(itemId, bundle, deck, card) };
}

/**
 * Tonight's queue: due cards, capped and interleaved, weighted by how near each unit's paper is, joined to content; and
 * how many due cards could not be opened on this device just now (they wait, and take no place in the cap).
 */
export function useInboxQueue(cap = 25): { queue: ResolvedCard[] | undefined; dueCount: number | undefined; unopened: number } {
  const plan = useExamPlan();
  const today = todayISO();

  const due = useLiveQuery(async () => {
    try {
      return await readDue();
    } catch {
      return [] as ReviewCard[];
    }
  }, []);

  // Tonight's cards, settled before the queue is picked (withdrawn.ts): a card for an item a later pass withdrew moves to
  // its replacement, or is retired when nothing replaces it, so the queue never holds a dead end that comes back every
  // evening. Then every due card is joined to what it tests, flashcards from their deck (the independent review of 27 Sep:
  // 1,342 flashcard-only cards showed as "withdrawn"), read once, after the settle, from the device itself: the inbox
  // freezes its queue for the sitting anyway.
  const [resolved, setResolved] = useState<ResolvedCard[] | undefined>(undefined);
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        await settleWithdrawnCards(await cardsToSettle(), shippedBundleFor);
      } catch {
        // A settle that fails leaves every card as it was: the inbox still opens.
      }
      let fresh: ReviewCard[] = [];
      try {
        fresh = await readDue();
      } catch {
        fresh = [];
      }
      const out: ResolvedCard[] = [];
      for (const card of fresh) out.push(await resolveCard(card));
      if (!cancelled) setResolved(out);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const served = useMemo(() => (resolved && plan ? servableQueue(resolved, plan, today, new Date(), cap) : undefined), [resolved, plan, today, cap]);

  return { queue: served?.queue, dueCount: due?.length, unopened: served?.unopened ?? 0 };
}
