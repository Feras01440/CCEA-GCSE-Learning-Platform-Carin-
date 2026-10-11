/**
 * The compute engine (@cortex-js/compute-engine 0.120: 2.7 MB of minified code), fetched when marking needs it.
 *
 * Only `algebra.ts` uses it, and only to mark: drawing a lesson, a deck or the welcome never does. Imported statically,
 * it sat in the one chunk every topic, Slides and Welcome page loaded before anything on them could be tapped (build 14:
 * a 3,326 KB chunk, 940 KB of the 1,579 KB /welcome/ sends to a phone, and a 740 ms task to evaluate at 4x CPU). The
 * browser now fetches it as a chunk of its own, and nothing marks before it is in:
 *   - every surface that draws questions from a bundle waits for the engine beside the bundle before it draws them: the
 *     topic page (TopicContent's useLesson), the welcome's seeded lesson (resolveSeed), Practise (MixedPractice) and the
 *     review inbox (useInboxQueue). Their marking runs during render as well as on Check (QuestionRunner's method
 *     ladder), and the engine's checks read a missing engine as "not equivalent", so nothing may mark before it. The
 *     bundle loader itself stays engine-free: Today reads bundles to settle withdrawn review cards and marks nothing;
 *   - Slides draws its deck from the page's props, so its typed See it step starts the fetch when it appears
 *     (`prefetchComputeEngine`) and a Check pressed before the engine lands waits for it (`whenComputeEngine`).
 * Node (vitest, the tsx scripts and probes, the export's prerender) has nothing to wait for: the first use loads it
 * synchronously, the same ESM build the browser runs (require(esm), Node 22.12 and later; the exports map would give
 * require() the UMD copy), so marking is synchronous everywhere and every probe and test marks as before.
 */
import type * as ComputeEngineModule from "@cortex-js/compute-engine";

export type ComputeEngineApi = typeof ComputeEngineModule;

let api: ComputeEngineApi | null = null;
let pending: Promise<ComputeEngineApi> | null = null;

/** Whether marking can run now. */
export function computeEngineLoaded(): boolean {
  return api !== null;
}

/** Fetches the engine once (a failed fetch is tried again on the next call). */
export function loadComputeEngine(): Promise<ComputeEngineApi> {
  if (api) return Promise.resolve(api);
  pending ??= import("@cortex-js/compute-engine").then(
    (m) => (api = m),
    (e: unknown) => {
      pending = null;
      throw e;
    },
  );
  return pending;
}

/** The engine's module, for `algebra.ts`. In the browser it must have been loaded first; in Node it loads here. */
export function computeEngine(): ComputeEngineApi {
  if (api) return api;
  if (typeof window === "undefined") return (api = loadInNode());
  throw new Error("The compute engine is not loaded: marking waits for loadComputeEngine() (src/lib/marking/compute-engine.ts)");
}

function loadInNode(): ComputeEngineApi {
  // `process.getBuiltinModule` rather than an import, so no bundler follows it into the browser's code.
  const { createRequire } = process.getBuiltinModule("node:module") as typeof import("node:module");
  const load = createRequire(`${process.cwd()}/`);
  const umd = load.resolve("@cortex-js/compute-engine");
  // The ESM build beside the UMD one the exports map hands to require(): the file the browser and Vite load.
  return load(umd.replace(/umd-min[\\/]compute-engine\.cjs$/, "esm-min/compute-engine.js")) as ComputeEngineApi;
}

/** Starts the fetch when the browser is next idle (a card's entrance first), for a field that will be marked. */
export function prefetchComputeEngine(): void {
  if (api || pending || typeof window === "undefined") return;
  const start = () => void loadComputeEngine().catch(() => undefined);
  if (typeof window.requestIdleCallback === "function") window.requestIdleCallback(start, { timeout: 1500 });
  else window.setTimeout(start, 200);
}

/**
 * Runs `mark` at once when the engine is in, else as soon as it is. `once` holds a run that is waiting, so a second
 * Check pressed while the engine loads does not mark twice; a failed fetch lets the next Check try again.
 */
export function whenComputeEngine(mark: () => void, once?: { current: boolean }): void {
  if (api) {
    mark();
    return;
  }
  if (once?.current) return;
  if (once) once.current = true;
  loadComputeEngine().then(
    () => {
      if (once) once.current = false;
      mark();
    },
    () => {
      if (once) once.current = false;
    },
  );
}
