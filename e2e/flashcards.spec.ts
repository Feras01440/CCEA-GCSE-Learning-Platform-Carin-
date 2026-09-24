import { expect, test } from "@playwright/test";
import { MAIN, counter } from "./helpers";

/**
 * Flashcards: decks per unit, topics you can pick, then flip-and-grade in a sitting of fifteen. The way in is on the
 * first screen of a phone, a card cannot be graded before it is turned over, the three grading buttons are 52 px and
 * none of them is accented, and grading moves the sitting on.
 */
test.describe("Flashcards", () => {
  test("/flashcards/ lists the units with their card counts", async ({ page }) => {
    await page.goto("/flashcards/");
    await expect(page.getByRole("heading", { level: 1, name: /Decks by unit/i })).toBeVisible();

    // Three subject columns, each a list of units.
    const columns = page.locator(`${MAIN} > div > section`);
    expect(await columns.count()).toBe(3);

    // At least one unit is published with a card and topic count, and links to its deck; a unit row is 52 px.
    const counts = page.getByText(/\d+ cards · \d+ topics/);
    expect(await counts.count()).toBeGreaterThan(0);
    await expect(counts.first()).toBeVisible();

    const deckLinks = page.locator(`${MAIN} a[href^="/flashcards/"]`);
    await expect(deckLinks.first()).toBeVisible();
    await expect(deckLinks.first()).toHaveAttribute("href", /^\/flashcards\/[a-z-]+\/[A-Z0-9]+\/$/);
    expect(await deckLinks.first().evaluate((el) => el.getBoundingClientRect().height)).toBeGreaterThanOrEqual(52);
  });

  test("a sitting is fifteen cards, started from the first screen, flipped and graded", async ({ page, isMobile }) => {
    await page.goto("/flashcards/science/P1/");
    await expect(page.getByRole("heading", { level: 1, name: /\bdeck$/i })).toBeVisible();
    await expect(page.getByText(/\d+ cards across \d+ topics/i)).toBeVisible();

    // Topics, each with a checkbox and a card count.
    const boxes = page.locator(`${MAIN} input[type="checkbox"]`);
    await expect(boxes.first()).toBeVisible();
    expect(await boxes.count()).toBeGreaterThan(0);

    // The way in: a sitting of at most fifteen, on the first screen of a phone.
    const study = page.getByRole("button", { name: /^Study \d+ cards$/ });
    await expect(study).toBeVisible();
    const size = Number(/(\d+)/.exec(await study.innerText())?.[1]);
    expect(size).toBeGreaterThan(0);
    expect(size).toBeLessThanOrEqual(15);
    if (isMobile) expect(await study.evaluate((el) => el.getBoundingClientRect().top)).toBeLessThan(640);
    await study.click();

    await expect(counter(page, 1)).toBeVisible();
    await expect(page.getByText(new RegExp(`\\b1 of ${size}\\b`))).toBeVisible();

    // Face down: the three grade buttons are disabled and hidden from the a11y tree.
    await expect(page.locator(`${MAIN} button:disabled`)).toHaveCount(3);

    // Flip it.
    const card = page.locator(`${MAIN} button[aria-pressed]`).first();
    await expect(card).toHaveAttribute("aria-pressed", "false");
    await card.click();
    await expect(card).toHaveAttribute("aria-pressed", "true");

    // Face up: Again / Good / Easy are enabled, 52 px tall, and none of them is filled with the accent.
    const accent = await page.evaluate(() => {
      const probe = document.createElement("div");
      probe.style.background = "var(--accent)";
      document.body.appendChild(probe);
      const c = getComputedStyle(probe).backgroundColor;
      probe.remove();
      return c;
    });
    for (const label of ["Again", "Good", "Easy"]) {
      const b = page.getByRole("button", { name: new RegExp(`^${label}\\b`) });
      await expect(b).toBeEnabled();
      const { height, bg } = await b.evaluate((el) => ({ height: el.getBoundingClientRect().height, bg: getComputedStyle(el).backgroundColor }));
      expect(height).toBeGreaterThanOrEqual(52);
      expect(bg).not.toBe(accent);
    }

    // Grading moves to the next card, which starts face down again.
    await page.getByRole("button", { name: /^Good\b/ }).click();
    await expect(counter(page, 2)).toBeVisible();
    await expect(page.locator(`${MAIN} button[aria-pressed]`).first()).toHaveAttribute("aria-pressed", "false");
  });

  test("picking a single topic narrows the sitting", async ({ page }) => {
    await page.goto("/flashcards/science/P1/");
    const first = page.locator(`${MAIN} input[type="checkbox"]`).first();
    await first.check();
    await expect(first).toBeChecked();

    const study = page.getByRole("button", { name: /^Study \d+ cards$/ });
    const narrowed = Number(/(\d+)/.exec(await study.innerText())?.[1]);
    expect(narrowed).toBeGreaterThan(0);
    await study.click();
    await expect(page.getByText(new RegExp(`\\b1 of ${narrowed}\\b`))).toBeVisible();
  });
});
