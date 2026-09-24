import { expect, test, type Page } from "@playwright/test";
import { MAIN, expectNoHorizontalOverflow } from "./helpers";

/**
 * Papers (02-surfaces.md §5): the page opens as her plan, the next paper first with the one accented action, "Sit the
 * next one"; every other entry is a row with its past papers behind a disclosure; CCEA's own PDFs are linked and never
 * re-hosted; and a timed run is a room of its own, with no navigation to tap away to, that ends on the grade she earned.
 *
 * The ccea.org.uk links are asserted by attribute only. Nothing in this suite navigates off-site.
 */

async function accentFilled(page: Page): Promise<string[]> {
  return page.evaluate((main) => {
    const probe = document.createElement("div");
    probe.style.background = "var(--accent)";
    document.body.appendChild(probe);
    const accent = getComputedStyle(probe).backgroundColor;
    probe.remove();
    return Array.from(document.querySelectorAll(`${main} a, ${main} button`))
      .filter((el) => getComputedStyle(el).backgroundColor === accent)
      .map((el) => (el.textContent ?? "").trim());
  }, MAIN);
}

test.describe("Papers", () => {
  test("opens as her plan: the next paper first, one accent, past papers folded, official links out", async ({ page }) => {
    await page.goto("/papers/");
    await expect(page.getByRole("heading", { level: 1, name: /Your papers/i })).toBeVisible();

    // The plan, not a catalogue: the soonest entry leads and says how long there is, in words.
    const next = page.getByTestId("next-paper");
    await expect(next).toBeVisible();
    await expect(next.getByText(/^Next paper$/)).toBeVisible();
    await expect(next.getByText(/^(in \d+ days|tomorrow|today)$/)).toBeVisible();

    // One accented control on the page, and it is the one thing to do next.
    expect(await accentFilled(page)).toEqual([expect.stringMatching(/Sit the next one/)]);

    // Past papers wait behind a disclosure: no "Run it timed" shows until she opens one.
    await expect(page.getByRole("link", { name: /Run it timed/ })).toHaveCount(0);
    const disclose = next.getByRole("button", { name: /^Past papers · \d+ sittings?$/ });
    await expect(disclose).toHaveAttribute("aria-expanded", "false");
    await disclose.click();
    await expect(disclose).toHaveAttribute("aria-expanded", "true");
    const runs = page.getByRole("link", { name: /Run it timed/ });
    await expect(runs.first()).toBeVisible();
    // Every run link is an outline, never the accent.
    expect(await accentFilled(page)).toEqual([expect.stringMatching(/Sit the next one/)]);

    // Foundation papers are hidden while she sits Higher.
    const plan = page.locator("section").filter({ has: page.getByRole("heading", { name: /^Your plan/ }) });
    await expect(plan.getByText(/Foundation/)).toHaveCount(0);

    // Paper links, each opening the official PDF in a new tab.
    const openPaper = page.getByRole("link", { name: /Open paper \(ccea\.org\.uk\)/ });
    const count = await openPaper.count();
    expect(count).toBeGreaterThan(0);
    for (let i = 0; i < count; i++) {
      const link = openPaper.nth(i);
      expect(await link.getAttribute("href")).toMatch(/^https:\/\/ccea\.org\.uk\//);
      await expect(link).toHaveAttribute("target", "_blank");
      await expect(link).toHaveAttribute("rel", /noopener/);
    }

    // One quiet toggle reveals the whole archive: one tab per subject, exactly one selected.
    await expect(page.getByRole("tab")).toHaveCount(0);
    await page.getByRole("button", { name: /^Show every paper$/ }).click();
    const tabs = page.getByRole("tab");
    await expect(tabs).toHaveCount(3);
    await expect(page.getByRole("tab", { selected: true })).toHaveCount(1);
    await tabs.nth(2).click();
    await expect(tabs.nth(2)).toHaveAttribute("aria-selected", "true");
    expect(await page.getByRole("link", { name: /Open paper \(ccea\.org\.uk\)/ }).count()).toBeGreaterThan(0);
  });

  test("a timed run: pre-flight, a room with no navigation, then the grade she earned first", async ({ page }) => {
    await page.goto("/papers/");
    const sit = page.getByRole("link", { name: /Sit the next one/ });
    await expect(sit).toBeVisible();
    const href = await sit.getAttribute("href");
    expect(href).toMatch(/^\/papers\/[^/]+\/$/);
    await sit.click();
    await expect(page).toHaveURL(new RegExp(`${href}$`));

    await expect(page.getByRole("heading", { level: 2, name: /^Before you start$/ })).toBeVisible();
    const startTimer = page.getByRole("button", { name: /^Start timer\b/ });
    await expect(startTimer).toBeEnabled();
    await expect(startTimer).toContainText(/\d+\s*(h|min)/);
    await startTimer.click();

    // The running screen is a room of its own: a modal dialog over everything, focus inside it, nothing behind to tap.
    const room = page.getByRole("dialog");
    await expect(room).toBeVisible();
    await expect(room.getByText(/^Time left$/)).toBeVisible();
    const cover = await page.evaluate(() => {
      const hit = document.elementFromPoint(window.innerWidth / 2, window.innerHeight - 12);
      return {
        inRoom: !!hit?.closest('[role="dialog"]'),
        focusInRoom: !!document.activeElement?.closest('[role="dialog"]'),
        locked: document.body.style.overflow === "hidden",
      };
    });
    expect(cover).toEqual({ inRoom: true, focusInRoom: true, locked: true });

    await room.getByRole("button", { name: /Finish paper/ }).click();
    await expect(page.getByRole("dialog")).toHaveCount(0);
    await expect(page.getByRole("heading", { level: 2, name: /^Mark it yourself$/ })).toBeVisible();
    // The marking grid scrolls inside its own box on a phone; the page never scrolls sideways.
    await expectNoHorizontalOverflow(page);

    // Enter a mark on every row, then the result.
    const awarded = page.getByRole("textbox", { name: /marks awarded/ });
    const rows = await awarded.count();
    for (let i = 0; i < rows; i++) await awarded.nth(i).fill("1");
    await page.getByRole("button", { name: /See UMS result/ }).click();

    // The grade she earned leads: the dial names it first, and it is the largest thing in it.
    const dial = page.locator('[aria-labelledby="result-heading"] svg[role="img"]').first();
    await expect(dial).toHaveAttribute("aria-label", /^Unit grade [a-gu*]+: \d+ of \d+ UMS/i);
    const order = await dial.evaluate((svg) => Array.from(svg.querySelectorAll("text")).map((t) => ({ text: t.textContent, size: parseFloat(getComputedStyle(t).fontSize) })));
    expect(order[0].text).toBe("unit grade");
    expect(Math.max(...order.map((t) => t.size))).toBe(order[1].size);
  });
});
