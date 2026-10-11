/**
 * The compute engine is fetched on demand in the browser and loaded at first use in Node (compute-engine.ts). These
 * tests hold the three things the split depends on: Node marks synchronously as before; in a browser nothing marks
 * until the engine is in, and a Check pressed while it loads runs once, after it lands; and no module of the app
 * imports the engine statically, which would put its 2.7 MB back into every page's first chunk.
 */
import fs from "node:fs";
import path from "node:path";
import { afterEach, describe, expect, it, vi } from "vitest";
import { checkAlgebraic } from "./algebra";
import { computeEngine, computeEngineLoaded, loadComputeEngine, whenComputeEngine } from "./compute-engine";

describe("Node: the engine loads at first use, synchronously", () => {
  it("marks without anything awaited first", () => {
    expect(checkAlgebraic("(x+3)(x-2)", { answer: "x^2+x-6", mode: "equivalent" }).correct).toBe(true);
    expect(checkAlgebraic("(x+3)(x+2)", { answer: "x^2+x-6", mode: "equivalent" }).correct).toBe(false);
    expect(computeEngineLoaded()).toBe(true);
  });

  it("is the engine's ESM build, with the three names algebra.ts uses", async () => {
    const api = computeEngine();
    expect(typeof api.ComputeEngine).toBe("function");
    expect(typeof api.isFunction).toBe("function");
    expect(typeof api.sym).toBe("function");
    expect(api.version).toBe("0.120.0");
    // loadComputeEngine() hands back the module already loaded, never a second copy.
    expect(await loadComputeEngine()).toBe(api);
  });

  it("runs a Check at once when the engine is in", () => {
    let ran = 0;
    whenComputeEngine(() => (ran += 1));
    expect(ran).toBe(1);
  });
});

describe("a browser: nothing marks before the engine is in", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.resetModules();
  });

  it("refuses to hand out the engine before it is loaded, and a waiting Check runs once after it lands", async () => {
    vi.resetModules();
    vi.stubGlobal("window", { setTimeout, requestIdleCallback: undefined });
    const fresh = await import("./compute-engine");
    expect(fresh.computeEngineLoaded()).toBe(false);
    expect(() => fresh.computeEngine()).toThrow(/not loaded/);

    let ran = 0;
    const once = { current: false };
    fresh.whenComputeEngine(() => (ran += 1), once);
    // A second Check pressed while it loads is held, not queued.
    fresh.whenComputeEngine(() => (ran += 1), once);
    expect(ran).toBe(0);
    expect(once.current).toBe(true);

    await fresh.loadComputeEngine();
    await Promise.resolve();
    expect(ran).toBe(1);
    expect(once.current).toBe(false);
    expect(fresh.computeEngineLoaded()).toBe(true);
    expect(typeof fresh.computeEngine().ComputeEngine).toBe("function");
  });
});

describe("no static import of the engine anywhere in the app", () => {
  const ROOT = path.resolve(__dirname, "../../..");
  const files: string[] = [];
  const walk = (dir: string) => {
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
      const p = path.join(dir, e.name);
      if (e.isDirectory()) {
        if (e.name !== "node_modules" && e.name !== "generated") walk(p);
      } else if (/\.(ts|tsx)$/.test(e.name) && !/\.test\.tsx?$/.test(e.name)) files.push(p);
    }
  };
  walk(path.join(ROOT, "src"));
  walk(path.join(ROOT, "app"));

  it("imports it only as types, or through import() in compute-engine.ts", () => {
    const offenders = files.filter((f) => {
      const src = fs.readFileSync(f, "utf8");
      // Any `import ... from "@cortex-js/compute-engine"` that is not `import type`, and any require of it.
      const statics = [...src.matchAll(/^\s*(import|export)\s+(?!type\b)[^;]*?from\s*["']@cortex-js\/compute-engine[^"']*["']/gm)];
      const required = /require\(\s*["']@cortex-js\/compute-engine/.test(src);
      return statics.length > 0 || required;
    });
    expect(offenders.map((f) => path.relative(ROOT, f))).toEqual([]);
    expect(files.length).toBeGreaterThan(100);
  });
});
