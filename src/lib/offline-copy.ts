/**
 * The full offline copy: the service worker (scripts/build-sw.mjs) precaches the app shell at install and
 * keeps the pages the learner opens; on request it fetches every topic page, its content and every paper
 * page as well, so a whole journey works with no signal. This module is the page side of that exchange:
 * ask for the status, start the copy, listen to its progress, and remember that the learner wants it so a
 * new version of the worker (which starts from an empty cache) fetches it again by itself.
 */

export interface OfflineCopyStatus {
  version: string;
  /** On-demand files already in this version's cache. */
  cached: number;
  total: number;
  /** Size of the whole on-demand set, in bytes (from the build). */
  bytes: number;
  copying: boolean;
}

export interface OfflineCopyProgress {
  version: string;
  done: number;
  total: number;
  failed: number;
  finished: boolean;
}

const PREF_KEY = "cairn.offline-copy";

/** Whether the learner asked to keep the full copy (a per-device preference). */
export function offlineCopyWanted(): boolean {
  try {
    return localStorage.getItem(PREF_KEY) === "on";
  } catch {
    return false;
  }
}

export function setOfflineCopyWanted(on: boolean): void {
  try {
    if (on) localStorage.setItem(PREF_KEY, "on");
    else localStorage.removeItem(PREF_KEY);
  } catch {
    /* storage unavailable: the copy still works for this visit */
  }
}

export function offlineCopySupported(): boolean {
  return typeof navigator !== "undefined" && "serviceWorker" in navigator;
}

/** The active worker, or null when none registers within a few seconds (the dev server has no worker). */
async function activeWorker(): Promise<ServiceWorker | null> {
  if (!offlineCopySupported()) return null;
  const timeout = new Promise<null>((resolve) => setTimeout(() => resolve(null), 4000));
  const reg = await Promise.race([navigator.serviceWorker.ready, timeout]);
  return reg?.active ?? null;
}

/** Asks the worker how much of the on-demand set is present. Null when there is no worker to ask. */
export async function requestOfflineCopyStatus(): Promise<OfflineCopyStatus | null> {
  const worker = await activeWorker();
  if (!worker) return null;
  return new Promise((resolve) => {
    const timer = setTimeout(() => {
      stop();
      resolve(null);
    }, 5000);
    const onMessage = (e: MessageEvent) => {
      const d: unknown = e.data;
      if (d && typeof d === "object" && (d as { type?: string }).type === "offline-copy:status") {
        clearTimeout(timer);
        stop();
        resolve(d as OfflineCopyStatus);
      }
    };
    const stop = () => navigator.serviceWorker.removeEventListener("message", onMessage);
    navigator.serviceWorker.addEventListener("message", onMessage);
    worker.postMessage({ type: "offline-copy:status" });
  });
}

/** Starts (or joins) the full copy. False when there is no worker. */
export async function startOfflineCopy(): Promise<boolean> {
  const worker = await activeWorker();
  if (!worker) return false;
  worker.postMessage({ type: "offline-copy:start" });
  return true;
}

/** Subscribes to progress and completion messages; returns the unsubscribe function. */
export function onOfflineCopyProgress(cb: (p: OfflineCopyProgress) => void): () => void {
  if (!offlineCopySupported()) return () => undefined;
  const onMessage = (e: MessageEvent) => {
    const d = e.data as { type?: string; version?: string; done?: number; total?: number; failed?: number } | null;
    if (!d || typeof d !== "object") return;
    if (d.type === "offline-copy:progress" || d.type === "offline-copy:done") {
      cb({ version: d.version ?? "", done: d.done ?? 0, total: d.total ?? 0, failed: d.failed ?? 0, finished: d.type === "offline-copy:done" });
    }
  };
  navigator.serviceWorker.addEventListener("message", onMessage);
  return () => navigator.serviceWorker.removeEventListener("message", onMessage);
}

/** "about 50 MB": rounded to the nearest 5 MB, never below 5. */
export function describeSize(bytes: number): string {
  const mb = Math.max(5, Math.round(bytes / 1048576 / 5) * 5);
  return `about ${mb} MB`;
}
