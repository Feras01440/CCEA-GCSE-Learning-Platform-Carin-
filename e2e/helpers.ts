import { expect, type Locator, type Page } from "@playwright/test";

/**
 * Shared helpers for the smoke suite.
 *
 * Every assertion here is about structure, not about how much content happens to be
 * published: counts come out of the page itself, and text matchers are anchored on the
 * copy the components own ("Tonight", "The lesson", "1 of N") rather than on numbers.
 */

/** The app shell renders every page inside `<main id="main">`; scoping there skips the nav. */
export const MAIN = "#main";

/** A tile/card is a `<section>` whose own `<h2>` is the label. Case-insensitive: the CSS uppercases it. */
export function tile(page: Page, label: string): Locator {
  return page.locator("section").filter({
    has: page.getByRole("heading", { level: 2, name: new RegExp(`^${escapeRegExp(label)}$`, "i") }),
  });
}

export function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** `N of M` counters shown by the practice, flashcard and diagnostic runners. */
export function counter(page: Page, n: number): Locator {
  return page.getByText(new RegExp(`\\b${n} of \\d+\\b`)).first();
}

/**
 * Walks the first-run flow so the Today page stops redirecting.
 * Writes `firstRunDone` to IndexedDB through the real UI, which is also test 1's subject.
 *
 * "Begin" no longer lands on Today: it writes `firstRunDone` and then opens the seeded lesson
 * (src/components/gift/SeededLesson.tsx). Every step of first run carries one quiet way out, so
 * the suite takes it in a single click rather than sitting through a lesson it is not testing.
 */
export async function completeFirstRun(page: Page, name = "Test"): Promise<void> {
  await page.goto("/welcome/");
  await page.getByRole("button", { name: /^Continue$/ }).click();
  const field = page.getByLabel(/what should it call you/i);
  await field.waitFor();
  await field.fill(name);
  await page.getByRole("button", { name: /^Begin$/ }).click();
  await page.getByRole("button", { name: /^Skip to Today$/ }).click();
  await expect(page.getByRole("heading", { level: 1, name: "Today" })).toBeVisible();
}

/**
 * The layout must never scroll sideways. One pixel of slack absorbs sub-pixel
 * rounding at fractional device scale factors.
 */
export async function expectNoHorizontalOverflow(page: Page): Promise<void> {
  // Let fonts and any late layout settle before measuring.
  await page.waitForLoadState("load");
  await page.evaluate(() => document.fonts.ready.then(() => true));
  const { scrollWidth, clientWidth, widest } = await page.evaluate(() => {
    const doc = document.documentElement;
    let widest = "";
    let max = 0;
    for (const el of Array.from(document.querySelectorAll("*"))) {
      const r = el.getBoundingClientRect();
      if (r.right > max) {
        max = r.right;
        widest = `${el.tagName.toLowerCase()}.${(el.className || "").toString().slice(0, 80)}`;
      }
    }
    return { scrollWidth: doc.scrollWidth, clientWidth: doc.clientWidth, widest };
  });
  expect(scrollWidth, `horizontal overflow at ${page.url()} (widest: ${widest})`).toBeLessThanOrEqual(clientWidth + 1);
}
