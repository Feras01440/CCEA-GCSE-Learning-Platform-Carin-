import { expect, test, type Locator, type Page } from "@playwright/test";
import { MAIN, counter } from "./helpers";

/**
 * Mixed practice: build a set, work through unlabelled questions, and get feedback that
 * diagnoses the mistake. The one word the feedback must never use is "Wrong".
 */

/** The machine-marked surfaces: a typed field or the A-D option buttons. */
function answerField(page: Page): Locator {
  return page.locator(`${MAIN} input[type="text"], ${MAIN} textarea`).first();
}

function optionButtons(page: Page): Locator {
  return page.locator(`${MAIN} [role="radio"], ${MAIN} [role="checkbox"]`);
}

test.describe("Mixed practice", () => {
  test("the builder starts a set, marks a wrong answer kindly, and advances", async ({ page }) => {
    await page.goto("/practise/");

    // The builder.
    await expect(page.getByRole("heading", { level: 2, name: /^Build a mixed set$/i })).toBeVisible();
    for (const group of ["Subject", "Units", "Calculator", "Questions"]) {
      await expect(page.getByText(new RegExp(group, "i")).first()).toBeVisible();
    }

    // Start is disabled until the question pools have loaded.
    const start = page.getByRole("button", { name: /^Start · \d+ questions?$/ });
    await expect(start).toBeEnabled();
    await start.click();

    // The set counter.
    await expect(counter(page, 1)).toBeVisible();
    const label = await counter(page, 1).innerText();
    const total = Number(/\b1 of (\d+)\b/.exec(label)?.[1]);
    expect(total).toBeGreaterThan(1);

    // An answer surface is present: a field to type in, or options to choose from.
    const field = answerField(page);
    const options = optionButtons(page);
    await expect(field.or(options.first())).toBeVisible();

    // Walk forward until a typed field appears, then answer it obviously wrongly.
    let typed = false;
    for (let i = 1; i <= total && !typed; i++) {
      if (await field.count()) {
        await field.fill("-987654321");
        await field.press("Enter");
        typed = true;
        break;
      }
      const next = page.getByRole("button", { name: /^(Next question|Finish)$/ });
      await next.click();
      await expect(counter(page, i + 1)).toBeVisible();
    }
    expect(typed, "at least one question in the set is machine-marked from a typed field").toBe(true);

    // Feedback: a live region that names what happened, never "Wrong".
    const feedback = page.locator('[role="status"]').first();
    await expect(feedback).toBeVisible();
    await expect(feedback).toContainText(/(Not yet|Part way there|Expected|marks?)/i);
    await expect(feedback).not.toContainText(/\bwrong\b/i);
    await expect(page.locator(`${MAIN}`)).not.toContainText(/\bWrong\b/);

    // "Next question" moves the set on.
    const at = Number(/\b(\d+) of \d+\b/.exec(await page.getByText(/\b\d+ of \d+\b/).first().innerText())?.[1]);
    const next = page.getByRole("button", { name: /^(Next question|Finish)$/ });
    await expect(next).toBeVisible();
    await next.click();
    if (at < total) {
      await expect(counter(page, at + 1)).toBeVisible();
    } else {
      await expect(page.getByText(/Mixed set complete/i)).toBeVisible();
    }
  });

  test("the mix can be narrowed before starting", async ({ page }) => {
    await page.goto("/practise/");
    const four = page.getByRole("button", { name: "4", exact: true });
    await four.click();
    await expect(four).toHaveAttribute("aria-pressed", "true");

    const start = page.getByRole("button", { name: /^Start · \d+ questions?$/ });
    await expect(start).toContainText("4");
    await start.click();
    await expect(page.getByText(/\b1 of 4\b/)).toBeVisible();
  });
});
