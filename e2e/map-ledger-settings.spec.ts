import { expect, test } from "@playwright/test";
import { MAIN } from "./helpers";

/** The map, the ledger's empty state, and the settings that touch the whole app. */
test.describe("Map", () => {
  test("shows her units only, on CCEA's dates, with no countdown bars", async ({ page }) => {
    await page.goto("/map/");
    await expect(page.getByRole("heading", { level: 1, name: /Exam map/i })).toBeVisible();

    const units = page.locator("section").filter({ has: page.getByRole("heading", { level: 2, name: "Your units" }) });
    await expect(units).toBeVisible();
    // The units of the default plan, and nothing it does not hold.
    await expect(units.locator("[data-unit]").first()).toBeVisible();
    for (const u of ["M4", "M8", "FM1", "FM2", "FM3", "B2", "C2", "P2", "U7"]) await expect(units.locator(`[data-unit="${u}"]`)).toBeVisible();
    for (const u of ["M1", "M2", "M3", "M5", "M6", "M7", "FM4"]) await expect(units.locator(`[data-unit="${u}"]`)).toHaveCount(0);

    // A paper is a place on the calendar, said in words at the end of its row; no bar's width counts the days.
    await expect(units.getByText(/in \d+ days/).first()).toBeVisible();
    const bars = await units.evaluate((el) => Array.from(el.querySelectorAll<HTMLElement>("[style]")).filter((n) => /width:\s*\d+(\.\d+)?%/.test(n.getAttribute("style") ?? "")).length);
    expect(bars).toBe(0);

    // The legend names every level, and a topic with no lesson here yet is shown as such.
    await expect(units).toContainText(/Not started/);
    await expect(units).toContainText(/No lesson here yet/);

    // A fresh profile has no stones: the designed empty state, one sentence and one action, not an empty axis.
    const empty = page.getByTestId("journey-empty");
    await expect(empty).toContainText("Stones appear here as you prove topics in a later mixed set.");
    await expect(empty.getByRole("link", { name: "Start a topic" })).toBeVisible();
  });
});

test.describe("Ledger", () => {
  test("starts empty and points at a timed paper", async ({ page }) => {
    await page.goto("/ledger/");
    await expect(page.getByRole("heading", { level: 1, name: /Mark ledger/i })).toBeVisible();

    await expect(page.getByText(/Nothing in the ledger yet/i)).toBeVisible();
    const link = page.getByRole("link", { name: /^Sit a timed paper$/ });
    await expect(link).toBeVisible();
    await expect(link).toHaveAttribute("href", "/papers/");
  });
});

test.describe("Settings", () => {
  test("the exam plan lists every unit she is entered for, Further Maths included, each on its date", async ({ page }) => {
    await page.goto("/settings/");
    const plan = page.locator("#plan");
    await expect(plan.getByRole("heading", { level: 2, name: "Exam plan" })).toBeVisible();

    // Further Maths: Unit 1 Pure, Mechanics and Statistics, dated from CCEA's Summer 2027 timetable.
    await expect(plan.locator('[data-entry="further-maths:FM1"]')).toContainText(/18 May 2027, 09:15 · 2 h/);
    await expect(plan.locator('[data-entry="further-maths:FM2"]')).toContainText(/4 Jun 2027, 13:30 · 1 h/);
    await expect(plan.locator('[data-entry="further-maths:FM3"]')).toContainText(/15 Jun 2027, 09:15 · 1 h/);
    await expect(plan.locator('[data-entry="science:U7"]')).toContainText(/After B2, C2 and P2/);

    // Nothing to save until something changes; one choice marks a unit as sat, and Save becomes the one accent.
    const save = plan.getByRole("button", { name: "Save plan" });
    await expect(save).toBeDisabled();
    await plan.getByRole("combobox", { name: /Series for B1/ }).selectOption("2026-Summer");
    await expect(plan.locator('[data-entry="science:B1"]')).toContainText(/Sat on .*12 May 2026/);
    await expect(save).toBeEnabled();

    // A unit can be added from the catalogue and taken out again.
    await plan.getByRole("combobox").filter({ hasText: "Choose a Maths unit" }).selectOption("M3");
    await expect(plan.locator('[data-entry="maths:M3"]')).toBeVisible();
    await plan.getByRole("button", { name: /Remove M3/ }).click();
    await expect(plan.locator('[data-entry="maths:M3"]')).toHaveCount(0);
  });

  test("theme switching writes and clears data-theme on the document", async ({ page }) => {
    await page.goto("/settings/");
    await expect(page.getByRole("heading", { level: 1, name: "Settings" })).toBeVisible();
    await expect(page.getByRole("heading", { level: 2, name: /^Appearance$/ })).toBeVisible();

    // Every theme is an aria-pressed button; light is the default and sets no attribute.
    const themeButtons = page.locator(`${MAIN} section`).filter({ hasText: "Appearance" }).getByRole("button");
    expect(await themeButtons.count()).toBeGreaterThanOrEqual(2);
    const html = page.locator("html");
    await expect(html).not.toHaveAttribute("data-theme", /./);

    await page.getByRole("button", { name: /^Dark$/ }).click();
    await expect(html).toHaveAttribute("data-theme", "dark");

    await page.getByRole("button", { name: /^Light\b/ }).click();
    await expect(html).not.toHaveAttribute("data-theme", /./);
  });

  test("export backup downloads a JSON file", async ({ page }) => {
    await page.goto("/settings/");

    const button = page.getByRole("button", { name: /^Export backup$/ });
    await expect(button).toBeVisible();

    const downloadPromise = page.waitForEvent("download");
    await button.click();
    const download = await downloadPromise;

    expect(download.suggestedFilename()).toMatch(/\.json$/);
    await expect(page.getByText(/Backup file downloaded/i)).toBeVisible();
  });
});
