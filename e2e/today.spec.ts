import { expect, test, type Page } from "@playwright/test";
import { MAIN, completeFirstRun, expectNoHorizontalOverflow, tile } from "./helpers";

/**
 * Today is the page she opens every evening (02-surfaces.md §1): one object (Tonight) with one accented action, the
 * plan as rows on the page, and one recess of what is coming up. Nothing on it counts what was not done.
 */

/** Buttons and links in the page whose painted background is the accent: there is exactly one thing to do next. */
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

test.describe("Today", () => {
  test.beforeEach(async ({ page }) => {
    await completeFirstRun(page);
  });

  test("is one object, the plan as rows, and what is coming up", async ({ page }) => {
    // Tonight: either reviews are back ("Start") or nothing is ("Learn"), and it is the only accented control.
    const tonight = tile(page, "Tonight");
    await expect(tonight).toBeVisible();
    await expect(tonight.getByRole("link", { name: /^(Start|Learn)$/ })).toBeVisible();
    expect(await accentFilled(page)).toEqual([expect.stringMatching(/^(Start|Learn)$/)]);

    // The plan: four rows on the page, each a label and what it says.
    const plan = page.locator(MAIN).locator("section").filter({ has: page.getByRole("heading", { level: 2, name: "The plan" }) });
    await expect(plan).toBeVisible();
    for (const label of ["Next step", "This week", "Next paper", "Your cairn"]) {
      await expect(plan.locator(`[data-row="${label}"]`)).toBeVisible();
    }

    // The week says what was done in words, and the plan's number is not a target: no "1 / 4", no dots.
    const week = plan.locator('[data-row="This week"]');
    await expect(week).toContainText(/(Nothing yet this week\.|\w+ evenings? this week\.)/);
    await expect(week).toContainText(/is the plan, not a target\./);
    await expect(week).not.toContainText(/\d+\s*\/\s*\d+/);

    // The next paper is a place on the calendar, its days said once at the end of the row at 14 px, never large.
    const nextPaper = plan.locator('[data-row="Next paper"]');
    await expect(nextPaper).toContainText(/(in \d+ days|tomorrow|today)/);
    const daysSize = await nextPaper.getByText(/^(in \d+ days|tomorrow|today)$/).evaluate((el) => parseFloat(getComputedStyle(el).fontSize));
    expect(daysSize).toBeLessThanOrEqual(14);

    // No large zero anywhere on the page.
    const bigZeros = await page.evaluate((main) =>
      Array.from(document.querySelectorAll(`${main} *`)).filter((el) => {
        const own = Array.from(el.childNodes).filter((n) => n.nodeType === 3).map((n) => n.textContent ?? "").join("").trim();
        return /^0\b/.test(own) && parseFloat(getComputedStyle(el).fontSize) >= 20;
      }).length,
    MAIN);
    expect(bigZeros).toBe(0);

    // What is coming up: a recess of the next papers, on CCEA's dates.
    await expect(page.getByRole("heading", { level: 2, name: "Coming up" })).toBeVisible();
    await expect(page.getByText(/papers? to come, on CCEA/)).toBeVisible();
  });

  test("the tonight action leads somewhere real", async ({ page }) => {
    const action = tile(page, "Tonight").getByRole("link", { name: /^(Start|Learn)$/ });
    const href = await action.getAttribute("href");
    // Reviews when something is back; otherwise the next step's topic (or the subjects, with no step to take).
    expect(href).toMatch(/^\/(review\/|learn\/(?:[a-z-]+\/[A-Z0-9]+\/[a-z0-9-]+\/)?)$/);
    await action.click();
    await expect(page).toHaveURL(new RegExp(`${href}$`));
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  });

  test("the one action is on the first screen of a phone", async ({ page, isMobile }) => {
    test.skip(!isMobile, "The 640 px rule is a phone rule.");
    const action = tile(page, "Tonight").getByRole("link", { name: /^(Start|Learn)$/ });
    await expect(action).toBeVisible();
    const top = await action.evaluate((el) => el.getBoundingClientRect().top);
    expect(top).toBeLessThan(640);
  });

  test("does not scroll sideways", async ({ page }) => {
    await expectNoHorizontalOverflow(page);
  });

  test("when nothing is back, the tile and Rowan never say the same sentence", async ({ page }) => {
    // The first Today after first run carries the Letter, and Rowan's arrival line waits for it; once the Letter is
    // read, the next open has the tile's fact and Rowan's own line under it (found 24 Sep 2026: both said "Nothing
    // back tonight.").
    const letter = page.locator('[data-companion="first-letter"]');
    await expect(letter).toBeVisible();
    await letter.getByRole("button", { name: /^Close$/ }).click();
    await expect(letter).toHaveCount(0);
    await page.reload();
    await expect(page.getByRole("heading", { level: 1, name: "Today" })).toBeVisible();

    const tonight = tile(page, "Tonight");
    await expect(tonight).toContainText("Nothing back tonight.");
    const line = tonight.locator('[data-companion="today-open"], [data-companion="evening"]');
    await expect(line).toHaveCount(1);
    await expect(line).not.toBeEmpty();

    const { said, printed } = await tonight.evaluate((section) => {
      const clone = section.cloneNode(true) as HTMLElement;
      const rowan = clone.querySelector("[data-companion]") as HTMLElement;
      rowan.querySelectorAll(".sr-only").forEach((n) => n.remove());
      const said = rowan.textContent ?? "";
      rowan.remove();
      clone.querySelectorAll(".sr-only, [aria-hidden]").forEach((n) => n.remove());
      return { said, printed: clone.textContent ?? "" };
    });
    const sentences = (text: string) =>
      text
        .split(/(?<=[.?])\s+/)
        .map((s) => s.trim().toLowerCase())
        .filter(Boolean);
    const tileSentences = new Set(sentences(printed));
    expect(sentences(said).filter((s) => tileSentences.has(s)), `Rowan "${said}" repeats the tile`).toEqual([]);
  });
});
