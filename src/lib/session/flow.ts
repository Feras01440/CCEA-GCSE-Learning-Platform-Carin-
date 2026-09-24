"use client";

/**
 * Where a topic's first-visit flow stands, and which diagnostic items each of its two checks asks.
 * The flags live in their own table so a reload keeps a check done or skipped, and so the branch never
 * keys on mastery (one check attempt already flips a first-timer to "attempted").
 */
import type { DiagnosticItem, DiagnosticSet } from "@/lib/content/schema";
import { getDB, type Attempt, type TopicFlow } from "@/lib/db/db";

type Subject = Attempt["subject"];

/** The two checks on a topic page: "Check yourself" after the lesson, "Check again" after practice. */
export type CheckPhase = "check" | "recheck";
export type FlowPatch = Partial<Pick<TopicFlow, "checkDone" | "checkSkipped" | "postDone" | "practiceIndex" | "examIndex" | "setIndex">>;

export const flowKey = (subject: Subject, topicSlug: string): string => `${subject}:${topicSlug}`;

/** The topic's row, or undefined before anything has been done or skipped there. */
export async function loadFlow(subject: Subject, topicSlug: string): Promise<TopicFlow | undefined> {
  return getDB().flow.get(flowKey(subject, topicSlug));
}

/** Merges `patch` into the topic's row (created with every flag false), stamping updatedAt. */
export async function saveFlow(subject: Subject, topicSlug: string, patch: FlowPatch, now = new Date()): Promise<TopicFlow> {
  const db = getDB();
  const key = flowKey(subject, topicSlug);
  return db.transaction("rw", db.flow, async () => {
    const existing = await db.flow.get(key);
    const row: TopicFlow = { key, checkDone: false, checkSkipped: false, postDone: false, ...existing, ...patch, updatedAt: now };
    await db.flow.put(row);
    return row;
  });
}

/**
 * Gate ids answered in this topic's note on any visit, once each in first-answered order. The note
 * records a gate as an attempt with itemId `${topicId}#gate:<gateId>` (TopicContent), so the prefix is the query.
 */
export async function answeredGateIds(subject: Subject, topicSlug: string, topicId: string): Promise<string[]> {
  const prefix = `${topicId}#gate:`;
  const rows = await getDB()
    .attempts.where("itemId")
    .startsWith(prefix)
    .and((a) => a.subject === subject && a.topicSlug === topicSlug)
    .toArray();
  rows.sort((a, b) => a.at.getTime() - b.at.getTime());
  return [...new Set(rows.map((a) => a.itemId.slice(prefix.length)))];
}

/** One item to ask with the set it came from: item ids are set-local ("01"), so the pair is the unique key. */
export interface CheckItem {
  setId: string;
  item: DiagnosticItem;
}

/** Items per check. Four keeps a check to a couple of minutes at four taps an item. */
export const CHECK_SIZE = 4;

/**
 * Splits a topic's diagnostic sets between its two checks, keeping authored order:
 * - check (after the lesson): the `pre` items, then `both` items, until `size`;
 * - recheck (after practice): the `post` items, then the `both` items the first check did not use, until `size`.
 * Leftover `pre` items are not asked anywhere.
 */
export function selectCheckItems(sets: readonly DiagnosticSet[], size = CHECK_SIZE): Record<CheckPhase, CheckItem[]> {
  const tagged = (when: DiagnosticSet["when"]): CheckItem[] =>
    sets.filter((s) => s.when === when).flatMap((s) => s.items.map((item) => ({ setId: s.id, item })));
  const pre = tagged("pre");
  const both = tagged("both");
  const check = [...pre, ...both].slice(0, size);
  const bothUsed = Math.max(0, check.length - pre.length);
  const recheck = [...tagged("post"), ...both.slice(bothUsed)].slice(0, size);
  return { check, recheck };
}
