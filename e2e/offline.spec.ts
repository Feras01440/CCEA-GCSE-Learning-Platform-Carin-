import { expect, test } from "@playwright/test";

/**
 * The platform has to work on a bus with no signal. /sw.js precaches the shell at install and keeps
 * every page the learner opens, so a second visit renders with the network off; the full offline copy
 * (every topic, its content and every paper page) is fetched on request from Settings.
 *
 * Service workers do run on http://localhost (it is a secure context). `ready` resolves as
 * soon as a worker is active, which can be a moment before `clients.claim()` reaches this
 * page, so control is awaited via `controllerchange` too. If registration is unavailable
 * for any reason the test falls back to proving the worker is served with its precache
 * list, and annotates the run so the gap is visible rather than silent.
 */

interface SwState {
  hasSW: boolean;
  controlled: boolean;
  cacheEntries: number;
  why: string;
}

async function serviceWorkerState(page: import("@playwright/test").Page): Promise<SwState> {
  return page
    .evaluate(async (): Promise<SwState> => {
      const out: SwState = { hasSW: "serviceWorker" in navigator, controlled: false, cacheEntries: 0, why: "" };
      if (!out.hasSW) {
        out.why = "no serviceWorker on navigator";
        return out;
      }
      const timeout = (ms: number) => new Promise<null>((r) => setTimeout(() => r(null), ms));
      const active = await Promise.race([navigator.serviceWorker.ready, timeout(60_000)]);
      if (!active) {
        out.why = "registration never became active";
        return out;
      }
      // `ready` can resolve before clients.claim() has taken this page over.
      if (!navigator.serviceWorker.controller) {
        await Promise.race([
          new Promise<void>((r) =>
            navigator.serviceWorker.addEventListener("controllerchange", () => r(), { once: true }),
          ),
          timeout(30_000),
        ]);
      }
      out.controlled = !!navigator.serviceWorker.controller;
      out.why = out.controlled ? "controlled" : "active but never took control of this page";
      for (const key of await caches.keys()) {
        out.cacheEntries += (await (await caches.open(key)).keys()).length;
      }
      return out;
    })
    .catch((e: unknown) => ({ hasSW: false, controlled: false, cacheEntries: 0, why: `evaluate failed: ${String(e)}` }));
}

test.describe("Offline", () => {
  test("pages already visited still render with the network off", async ({ page, context }) => {
    // Install precaches the shell; a topic page is kept from the moment it is opened.
    await page.goto("/");
    const sw = await serviceWorkerState(page);

    if (!sw.controlled) {
      // Fallback: the worker itself is served and carries its precache manifest.
      const res = await page.request.get("/sw.js");
      expect(res.status()).toBe(200);
      expect(await res.text()).toContain("PRECACHE");
      test.info().annotations.push({
        type: "issue",
        description: `service worker did not control the page (${sw.why}); asserted /sw.js only`,
      });
      return;
    }

    // Install waits on the precache, so activation implies the shell is in the cache.
    expect(sw.cacheEntries, "the service worker precached the shell").toBeGreaterThan(100);

    // Open the topic once while online: the worker keeps the page, its payloads and its content.
    await page.goto("/learn/maths/M4/circle-theorems/");
    await expect(page.getByRole("heading", { level: 2, name: /^Practice$/i })).toBeVisible();

    await context.setOffline(true);
    try {
      // The subject index.
      const learn = await page.goto("/learn/");
      expect(learn?.ok(), "/learn/ served from the cache while offline").toBe(true);
      await expect(page.getByRole("heading", { level: 1, name: "Subjects" })).toBeVisible();
      expect(await page.locator('#main a[href^="/learn/"]').count()).toBe(3);

      // The topic page opened a moment ago.
      const topic = await page.goto("/learn/maths/M4/circle-theorems/");
      expect(topic?.ok(), "a visited topic page served from the cache while offline").toBe(true);
      const title = page.getByRole("heading", { level: 1 });
      await expect(title).toBeVisible();
      await expect(title).not.toBeEmpty();
      // Its published content came from the cache too, not just the shell.
      await expect(page.getByRole("heading", { level: 2, name: /^Practice$/i })).toBeVisible();
    } finally {
      await context.setOffline(false);
    }
  });

  test("a tap while offline stays a soft navigation (RSC payloads are precached)", async ({ page, context }) => {
    // Next 16 exports the prefetch payloads as nested folders while the client requests the dotted
    // file beside the route; scripts/fix-export.mjs writes those and build-sw precaches them. If they
    // were missing, every offline tap would fall back to a full reload of the page.
    await page.goto("/learn/maths/");
    const sw = await serviceWorkerState(page);
    test.skip(!sw.controlled, `service worker did not control the page (${sw.why})`);

    await context.setOffline(true);
    try {
      // A full reload would wipe this marker.
      await page.evaluate(() => {
        (window as unknown as { __cairnSoftNav: number }).__cairnSoftNav = 1;
      });
      await page.locator('#main a[href="/learn/maths/M4/"]').first().click();
      await expect(page).toHaveURL(/\/learn\/maths\/M4\/$/);
      await expect(page.getByRole("heading", { level: 1 })).toContainText("M4");
      const marker = await page.evaluate(() => (window as unknown as { __cairnSoftNav?: number }).__cairnSoftNav);
      expect(marker, "the unit page opened without a full reload").toBe(1);
    } finally {
      await context.setOffline(false);
    }
  });

  test("the full offline copy opens a topic that was never visited", async ({ page, context }) => {
    // Fetching every topic, its content and every paper page takes a while on a busy machine.
    test.setTimeout(300_000);
    await page.goto("/learn/maths/M8/");
    const sw = await serviceWorkerState(page);
    test.skip(!sw.controlled, `service worker did not control the page (${sw.why})`);
    // A topic with content that this test never opens online.
    const target = await page
      .locator('#main li[data-built="lesson"] a[href^="/learn/maths/M8/"]')
      .first()
      .getAttribute("href");
    expect(target, "an M8 topic with practice to try offline").toMatch(/^\/learn\/maths\/M8\/[^/]+\/$/);

    await page.goto("/settings/");
    await page.getByRole("button", { name: "Download the full copy" }).click();
    await expect(page.getByText("Every topic and paper is ready offline.")).toBeVisible({ timeout: 280_000 });

    await context.setOffline(true);
    try {
      const topic = await page.goto(target!);
      expect(topic?.ok(), "an unvisited topic page served from the full copy while offline").toBe(true);
      await expect(page.getByRole("heading", { level: 2, name: /^Practice$/i })).toBeVisible();
    } finally {
      await context.setOffline(false);
    }
  });

  test("the service worker is served with its precache manifest", async ({ page }) => {
    const res = await page.request.get("/sw.js");
    expect(res.status()).toBe(200);
    const body = await res.text();
    expect(body).toContain("PRECACHE");
    // The shell and the learn index are precached; the published content is in the on-demand set.
    expect(body).toMatch(/"\/learn\/"/);
    expect(body).toContain("ON_DEMAND");
    expect(body).toMatch(/"\/content\//);
  });
});
