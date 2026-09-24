"use client";

/**
 * One short check, one item at a time: "Check yourself" after the lesson and "Check again" after
 * practice. Done or skipped is written to the flow table, so a reload shows the closing line rather
 * than the first item again. Nothing on the page waits for it (learner review, 13 Sep 2026).
 */
import { useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { clsx } from "clsx";
import { DiagnosticWithConfidence, btnSecondary } from "@/components/items";
import { CardSkeleton } from "@/components/ux/Skeleton";
import { loadFlow, saveFlow, type CheckItem, type CheckPhase, type FlowPatch } from "@/lib/session/flow";
import { recordAttempt, touchSession, type ItemRef } from "@/lib/session/record";

export interface CheckSectionProps {
  /** Which flags of the flow row this check reads and writes. */
  phase: CheckPhase;
  /** Items in the order they are asked, from selectCheckItems. */
  items: readonly CheckItem[];
  item: Omit<ItemRef, "id">;
}

const COPY: Record<CheckPhase, { done: string; skip: string | null }> = {
  check: { done: "Check done. Practice is next; anything you missed will come back on its schedule.", skip: "Skip to practice" },
  recheck: { done: "Check done. Anything you missed will come back on its schedule.", skip: null },
};

export function CheckSection({ phase, items, item }: CheckSectionProps) {
  const { subject, topicSlug } = item;
  const [index, setIndex] = useState(0);
  const [finished, setFinished] = useState(false);
  // undefined while the row loads; null when there is none (or IndexedDB is unavailable).
  const flow = useLiveQuery(async () => {
    try {
      return (await loadFlow(subject, topicSlug)) ?? null;
    } catch {
      return null;
    }
  }, [subject, topicSlug]);

  if (items.length === 0) return null;
  if (flow === undefined) return <CardSkeleton lines={3} />;

  const copy = COPY[phase];
  const restored = flow !== null && (phase === "check" ? flow.checkDone || flow.checkSkipped : flow.postDone);
  if (finished || restored) return <p className="text-meta text-ink-2">{copy.done}</p>;

  const current = items[Math.min(index, items.length - 1)];
  const close = (patch: FlowPatch) => {
    setFinished(true);
    saveFlow(subject, topicSlug, patch).catch(() => undefined);
  };
  const finish = () => close(phase === "check" ? { checkDone: true } : { postDone: true });

  return (
    <>
      <DiagnosticWithConfidence
        key={`${current.setId}:${current.item.id}`}
        item={current.item}
        index={index + 1}
        total={items.length}
        onAnswer={async (a) => {
          await recordAttempt({
            item: { ...item, id: current.item.id },
            itemKind: "diagnostic",
            correct: a.correct,
            confidence: a.confidence,
            misconceptionTags: a.misconception ? [a.misconception] : [],
            timeMs: a.ms,
          });
          await touchSession(subject);
        }}
        onNext={() => (index + 1 < items.length ? setIndex(index + 1) : finish())}
      />
      {copy.skip && (
        <button type="button" className={clsx(btnSecondary, "self-start")} onClick={() => close({ checkSkipped: true })}>
          {copy.skip}
        </button>
      )}
    </>
  );
}
