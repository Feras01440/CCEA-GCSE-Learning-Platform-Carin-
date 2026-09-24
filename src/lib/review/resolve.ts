"use client";

import { useLiveQuery } from "dexie-react-hooks";
import { useEffect, useMemo, useState } from "react";
import { getDB, type ReviewCard } from "@/lib/db/db";
import { contentFor, loadBundle, type ShippedBundle } from "@/lib/content/load";
import type { DiagnosticItem, FindTheMistake, Part, Question, RetrievalPrompt, WorkedExample } from "@/lib/content/schema";
import type { GateBlock, NoteBlock } from "@/components/items/gates";
import { topicsFor, unitsFor, type Subject } from "@/lib/content/taxonomy";
import { pickQueue } from "@/lib/srs/queue";
import { sourceItemId } from "@/lib/srs/hypercorrection";
import { useExamPlan } from "@/lib/plan/store";
import { todayISO, upcomingPapers } from "@/lib/plan/exam-plan";

/** The item a card stands for, as the inbox has to render it. */
export type ResolvedContent =
  | { kind: "prompt"; prompt: RetrievalPrompt }
  | { kind: "diagnostic"; item: DiagnosticItem }
  /** One part of a practice or exam-style question: the card is per part, as the marks are. */
  | { kind: "question"; question: Question; part: Part }
  | { kind: "mistake"; item: FindTheMistake }
  /** A check from the lesson's note, asked again on its own. */
  | { kind: "gate"; gate: GateBlock; context: NoteBlock[] }
  /** A worked example, met again as its twin: same structure, new numbers. */
  | { kind: "twin"; we: WorkedExample };

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

/** Tonight's queue: due cards, capped and interleaved, weighted by how near each unit's paper is, joined to content. */
export function useInboxQueue(cap = 25): { queue: ResolvedCard[] | undefined; dueCount: number | undefined } {
  const plan = useExamPlan();
  const today = todayISO();

  const due = useLiveQuery(async () => {
    try {
      return await getDB().cards.where("due").belowOrEqual(new Date()).toArray();
    } catch {
      return [] as ReviewCard[];
    }
  }, []);

  const picked = useMemo(() => {
    if (!due || !plan) return undefined;
    const daysToPaper: Record<string, number | null> = {};
    for (const p of upcomingPapers(plan, today)) daysToPaper[`${p.subject}:${p.unit}`] = p.daysAway;
    // pickQueue weights by `${subject}:${topicSlug}`; translate topic → unit proximity here.
    const byTopic: Record<string, number | null> = {};
    for (const c of due) {
      const u = unitForTopic(c.subject, c.topicSlug);
      byTopic[`${c.subject}:${c.topicSlug}`] = u ? (daysToPaper[`${c.subject}:${u.unit}`] ?? null) : null;
    }
    return pickQueue(due, new Date(), { cap, daysToPaper: byTopic });
  }, [due, plan, today, cap]);

  const [queue, setQueue] = useState<ResolvedCard[] | undefined>(undefined);
  useEffect(() => {
    let cancelled = false;
    if (!picked) return;
    (async () => {
      const out: ResolvedCard[] = [];
      for (const card of picked) {
        const u = unitForTopic(card.subject, card.topicSlug);
        const shipped = contentFor(card.subject, card.topicSlug);
        const itemId = sourceItemId(card.id);
        let content: ResolvedContent | null = null;
        if (shipped) {
          try {
            const bundle = await loadBundle(card.subject, shipped.id);
            content = findInBundle(bundle, itemId);
          } catch {
            content = null;
          }
        }
        out.push({ card, itemId, subject: card.subject, unit: u?.unit ?? "", topicSlug: card.topicSlug, topicTitle: u?.title ?? card.topicSlug, content });
      }
      if (!cancelled) setQueue(out);
    })();
    return () => {
      cancelled = true;
    };
  }, [picked]);

  return { queue, dueCount: due?.length };
}
