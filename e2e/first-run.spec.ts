import { expect, test } from "@playwright/test";
import { completeFirstRun } from "./helpers";

/**
 * The gift moment. A device that has never opened the app is sent to /welcome/, reads the note,
 * gives a name, and then ends inside a real lesson rather than on Today: one section, one check,
 * one marked question (docs/plan/review/2026-09-19-quality-bar.md, item 7). It must never be sent
 * back to /welcome/ afterwards, and it must be leavable in one click at any point.
 */
test.describe("first run", () => {
  test("a fresh device reads the note, gives a name, and lands inside a lesson", async ({ page }) => {
    await page.goto("/");

    // TodayTiles finds no `firstRunDone` setting and replaces the route.
    await expect(page).toHaveURL(/\/welcome\/?$/);

    // The gift moment owns the screen: no side rail, no bottom tabs.
    await expect(page.getByRole("navigation", { name: "Primary" })).toHaveCount(0);

    // The note from the giver: its eyebrow, a title and a body.
    await expect(page.getByText(/^a note from /i)).toBeVisible();
    const note = page.getByRole("heading", { level: 1 });
    await expect(note).toBeVisible();
    await expect(note).not.toBeEmpty();

    await page.getByRole("button", { name: /^Continue$/ }).click();

    const name = page.getByLabel(/what should it call you/i);
    await expect(name).toBeVisible();
    await expect(name).toHaveValue("");
    await name.fill("Test");
    await expect(name).toHaveValue("Test");

    await page.getByRole("button", { name: /^Begin$/ }).click();

    // Not Today: a seeded topic, with its own title and the promise the note opens on.
    const lesson = page.getByTestId("seeded-lesson");
    await expect(lesson).toBeVisible();
    await expect(lesson.getByRole("heading", { level: 1 })).not.toBeEmpty();
    await expect(lesson.getByText(/By the end you will be able to/i)).toBeVisible();

    // One real check, closing the section, and the caption that names the mechanic once.
    await expect(lesson.getByText("Answer to continue")).toBeVisible();
    await expect(lesson.getByText("A check. The note stops here until you answer; nothing is scored.")).toBeVisible();

    // `firstRunDone` is written before the lesson, so a reload mid-lesson lands on Today for good.
    await page.reload();
    await expect(page.getByRole("heading", { level: 1, name: "Today" })).toBeVisible();
    await expect(page).toHaveURL(/^https?:\/\/[^/]+\/$/);

    // And neither must a fresh navigation to the root.
    await page.goto("/");
    await expect(page.getByRole("heading", { level: 1, name: "Today" })).toBeVisible();
    await expect(page).not.toHaveURL(/\/welcome\//);
  });

  test("the lesson can be left in one click, from the first screen", async ({ page }) => {
    await page.goto("/welcome/");
    await page.getByRole("button", { name: /^Skip to Today$/ }).click();
    await expect(page.getByRole("heading", { level: 1, name: "Today" })).toBeVisible();

    // Skipping is leaving: Today does not send her back.
    await page.goto("/");
    await expect(page).not.toHaveURL(/\/welcome\//);
  });

  test("the name given at first run is kept in Settings", async ({ page }) => {
    await completeFirstRun(page, "Test");
    await page.goto("/settings/");
    await expect(page.getByLabel(/your first name/i)).toHaveValue("Test");
  });
});
