"use client";

import { useEffect } from "react";
import { offlineCopyWanted, startOfflineCopy } from "@/lib/offline-copy";

/**
 * Registers /sw.js in production builds only (the dev server has no service worker). A learner who asked
 * for the full offline copy keeps it across updates: each new worker version starts from an empty cache,
 * so the copy is requested again as soon as the new worker is in charge.
 */
export function ServiceWorker() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") return;
    if (!("serviceWorker" in navigator)) return;
    const resume = () => {
      if (offlineCopyWanted()) void startOfflineCopy();
    };
    navigator.serviceWorker
      .register("/sw.js")
      .then(resume)
      .catch(() => undefined);
    navigator.serviceWorker.addEventListener("controllerchange", resume);
    return () => navigator.serviceWorker.removeEventListener("controllerchange", resume);
  }, []);
  return null;
}
