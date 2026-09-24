"use client";

import { useEffect, useLayoutEffect, useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { getDB } from "@/lib/db/db";
import { DEFAULT_PLAN, migratePlan, type ExamPlan } from "./exam-plan";

const KEY = "examPlan";

/**
 * A synchronous mirror of the stored plan, so a screen that shows a date from it (the topic hero's "for your paper
 * on 18 May", Today's next paper) has it in the first frame it paints instead of one IndexedDB round trip later,
 * when the line would wrap and push everything below it down (18 px on a Further Maths topic on a phone, found by
 * the topic-page agent on 23 September 2026). IndexedDB stays the record; this is only a copy of the last plan read
 * or saved on this device, and a missing or unreadable copy simply means the first frame waits, as before.
 */
const CACHE_KEY = "cairn:exam-plan";
let memory: ExamPlan | undefined;

function readCache(): ExamPlan | undefined {
  if (memory) return memory;
  try {
    const raw = window.localStorage.getItem(CACHE_KEY);
    if (raw) memory = migratePlan(JSON.parse(raw));
  } catch {
    // No storage (private mode) or a copy that does not parse: wait for IndexedDB.
  }
  return memory;
}

function writeCache(plan: ExamPlan): void {
  memory = plan;
  try {
    window.localStorage.setItem(CACHE_KEY, JSON.stringify(plan));
  } catch {
    // The copy is a convenience; the plan itself is in IndexedDB.
  }
}

/**
 * Her plan, always as a v2 plan: a plan stored in the v1 shape (before 23 September 2026) is converted on read and
 * written back in the new shape the next time she saves. Read-only, so it is safe inside a live query.
 */
export async function loadPlan(): Promise<ExamPlan> {
  const row = await getDB().settings.get(KEY);
  return row?.value ? migratePlan(row.value) : DEFAULT_PLAN;
}

export async function savePlan(plan: ExamPlan): Promise<void> {
  await getDB().settings.put({ key: KEY, value: plan });
  writeCache(plan);
}

// A layout effect runs before the browser paints, and never on the server, where there is no plan to read.
const useBeforePaint = typeof window === "undefined" ? useEffect : useLayoutEffect;

/**
 * The live plan. `undefined` only while nothing is known yet; DEFAULT_PLAN when none was ever saved. The first
 * render matches the server's (no plan), and before that render reaches the screen the device's last copy stands
 * in, until IndexedDB answers and replaces it.
 */
export function useExamPlan(): ExamPlan | undefined {
  const live = useLiveQuery(async () => {
    try {
      return await loadPlan();
    } catch {
      return DEFAULT_PLAN;
    }
  }, []);
  const [cached, setCached] = useState<ExamPlan | undefined>(undefined);
  useBeforePaint(() => {
    if (live === undefined) setCached(readCache());
    // Only the first frame needs the copy; `live` takes over from there.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  useEffect(() => {
    if (live) writeCache(live);
  }, [live]);
  return live ?? cached;
}

export async function getSetting<T>(key: string, fallback: T): Promise<T> {
  const row = await getDB().settings.get(key);
  return (row?.value as T | undefined) ?? fallback;
}

export async function setSetting(key: string, value: unknown): Promise<void> {
  await getDB().settings.put({ key, value });
}
