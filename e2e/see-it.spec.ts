import { expect, test, type Page } from "@playwright/test";
import { SEE_FIXTURE_BLOCKS, SEE_FIXTURE_PROMPTS, SEE_FIXTURE_WORKED_EXAMPLE } from "../src/lib/slides/see-fixture";

/**
 * Read v2 in lesson structure v3 (the teach-first case §8.2 and §11, with the owner's answers of 27 Sep 2026): the same
 * See it stepping, the same Your turn and re-teach as Slides, on the page (src/components/items/StepRevealNote.tsx).
 *
 * The trial topic's page draws Read v2; its note is not yet converted to the See it shape, so these tests serve the
 * teach-first fixture (src/lib/slides/see-fixture.ts: four sections, a See it that names a worked example, a twin on
 * two gates, a step she types, two Your turns on one See it, a note on every wrong option) in place of the trial bundle's
 * note, with the fixture's worked example added to the bundle, through the page's own fetch. The topic page passes the
 * bundle's worked examples and each gate's first answer to the note. The service worker is blocked so the served bundle
 * is the one the page reads.
 *
 * Asserted, as the screen promises it:
 *  - a See it shows its first step and one more per "Next step", its Your turn only after the last (explain → see → turn);
 *  - a miss is re-taught before its answer ("Not quite.", her choice, the note on her option before the explanation, the
 *    step the explanation points at), and "Show me the answer" then lights the right option and edges hers; one record;
 *  - a missed Your turn comes back once before the recap, as its twin on new numbers, unrecorded;
 *  - a step she types is marked through the engine and never recorded;
 *  - a number Your turn takes a negative answer from the key strip's minus (the phone's decimal pad has none);
 *  - every option has a name (audit READ-1); after a reload a missed Your turn never looks passed (READ-7);
 *  - nothing is left animating under reduced motion, and the steps still come one per press.
 */

test.use({ serviceWorkers: "block" });

const TOPIC = "/learn/further-maths/FM1/algebraic-fractions-simplify/";
const BUNDLE = "**/content/further-maths/fm.u1.algebraic-fractions-simplify.json";
const TOPIC_ID = "fm.u1.algebraic-fractions-simplify";
const DB_NAME = "ccea-study";

async function serveFixture(page: Page): Promise<void> {
  await page.route(BUNDLE, async (route) => {
    const response = await route.fetch();
    const json = (await response.json()) as Record<string, unknown>;
    json.noteBlocks = SEE_FIXTURE_BLOCKS;
    json.prompts = [...((json.prompts as unknown[]) ?? []), ...SEE_FIXTURE_PROMPTS];
    json.workedExamples = [...((json.workedExamples as unknown[]) ?? []), SEE_FIXTURE_WORKED_EXAMPLE];
    await route.fulfill({ response, json });
  });
}

async function openNote(page: Page): Promise<void> {
  await serveFixture(page);
  await page.goto(TOPIC);
  await expect(page.locator("#note article")).toBeVisible();
  await page.evaluate(() => document.fonts.ready.then(() => true));
}

const gate = (page: Page, id: string) => page.locator(`#note [data-gate="${id}"]`);
const seeIt = (page: Page) => page.locator("#note [data-see-it]");

/** Every step of the See it on screen, one "Next step" at a time; a typed step is shown, not typed. */
async function showAllSteps(page: Page): Promise<void> {
  const see = seeIt(page).last();
  for (let i = 0; i < 8; i += 1) {
    if (await see.locator("[data-show-step]").count()) {
      await see.locator("[data-show-step]").click();
      await expect(see.locator("[data-typed-result]")).toBeVisible();
      continue;
    }
    const next = see.locator("[data-next-step]");
    if ((await next.count()) === 0) return;
    const shown = await see.locator("[data-step]").count();
    await next.click();
    await expect(see.locator("[data-step]")).toHaveCount(shown + 1);
  }
}

/** Choose the option with the given authored text and press Check. */
async function answer(page: Page, id: string, value: string): Promise<void> {
  const box = gate(page, id);
  const radios = box.getByRole("radio");
  const at = await radios.evaluateAll((els, v) => els.findIndex((el) => el.getAttribute("data-value") === v), value);
  expect(at, `option "${value}" of ${id}`).toBeGreaterThanOrEqual(0);
  await radios.nth(at).click();
  await box.getByRole("button", { name: /^Check$/ }).click();
}

/** A typed Your turn: fill the field and press Check. */
async function answerTyped(page: Page, id: string, value: string): Promise<void> {
  const box = gate(page, id);
  await box.locator("[data-gate-field]").fill(value);
  await box.getByRole("button", { name: /^Check$/ }).click();
}

async function continueOn(page: Page): Promise<void> {
  await page.locator("#note [data-continue]:not([data-finish])").last().click();
}

async function attempts(page: Page): Promise<Array<{ itemId: string; correct: boolean | null; misconceptionTags: string[] }>> {
  return page.evaluate(
    (name) =>
      new Promise((resolve) => {
        const open = indexedDB.open(name);
        open.onerror = () => resolve([]);
        open.onsuccess = () => {
          const db = open.result;
          try {
            const req = db.transaction("attempts", "readonly").objectStore("attempts").getAll();
            req.onsuccess = () => {
              db.close();
              resolve((req.result as Array<{ itemId: string; correct: boolean | null; misconceptionTags?: string[] }>).map((a) => ({ itemId: a.itemId, correct: a.correct, misconceptionTags: a.misconceptionTags ?? [] })));
            };
            req.onerror = () => {
              db.close();
              resolve([]);
            };
          } catch {
            db.close();
            resolve([]);
          }
        };
      }),
    DB_NAME,
  );
}

const gateRows = async (page: Page, id: string) => (await attempts(page)).filter((a) => a.itemId === `${TOPIC_ID}#gate:${id}`);

test.describe("Read v2: See it, then Your turn", () => {
  test("a See it shows one step per Next step, and its Your turn only once every step has been shown", async ({ page }) => {
    await openNote(page);
    const see = seeIt(page).first();
    await expect(see).toBeVisible();
    await expect(see).toHaveAttribute("aria-label", "See it");
    await expect(see.locator("[data-step]")).toHaveCount(1);
    await expect(see.locator("[data-ghost]")).toHaveCount(2);
    await expect(gate(page, "g1")).toHaveCount(0);
    // Each step comes with its reason; the mark it earns stands beside its line.
    await expect(see.locator("[data-step='1']")).toContainText("Read the top as its factors");
    await see.locator("[data-next-step]").click();
    await expect(see.locator("[data-step]")).toHaveCount(2);
    await expect(gate(page, "g1")).toHaveCount(0);
    await see.locator("[data-next-step]").click();
    await expect(see.locator("[data-step]")).toHaveCount(3);
    await expect(see.locator("[data-ghost]")).toHaveCount(0);
    await expect(see.locator("[data-next-step]")).toHaveCount(0);
    await expect(see.locator("[aria-label='Earns W1']")).toBeVisible();
    // Only now the Your turn, named so, and it asks what the steps showed.
    await expect(gate(page, "g1")).toBeVisible();
    await expect(gate(page, "g1")).toContainText("Your turn");
    await expect(gate(page, "g1")).toContainText("Answer from what you just saw. If you miss, it is taught again first.");
    // Nothing is left animating under the suite's reduced motion, and the steps still came one per press.
    expect(await page.evaluate(() => document.getAnimations().length)).toBe(0);
  });

  test("every option has a name a screen reader can say, maths spoken (audit READ-1)", async ({ page }) => {
    await openNote(page);
    await showAllSteps(page);
    const box = gate(page, "g1");
    await expect(box.getByRole("radiogroup", { name: "What does 5x(x + 2) over 10(x + 2) simplify to?" })).toBeVisible();
    for (const name of ["x over 2", "5x over 10", "(x + 2) over 2"]) await expect(box.getByRole("radio", { name, exact: true })).toHaveCount(1);
  });

  test("a miss is re-taught before its answer: Not quite, her choice, her option's note first, the step; then the answer lit; one record", async ({ page }) => {
    await openNote(page);
    await showAllSteps(page);
    await answer(page, "g1", "$\\dfrac{5x}{10}$");
    const box = gate(page, "g1");
    const reteach = box.locator("[data-reteach]");
    await expect(reteach).toBeVisible();
    await expect(reteach).toBeFocused();
    await expect(reteach).toContainText("Not quite.");
    await expect(reteach.locator("[data-her-choice]")).toBeVisible();
    // The note on her option comes before the general explanation (V3.1).
    const order = await reteach.evaluate((el) => {
      const text = el.textContent ?? "";
      return { note: text.indexOf("Dividing out the bracket is right"), explanation: text.indexOf("Divide out what both lines share") };
    });
    expect(order.note).toBeGreaterThanOrEqual(0);
    expect(order.note).toBeLessThan(order.explanation);
    await expect(reteach.locator("[data-reteach-step='3']")).toContainText("Step 3 of See it");
    // Nothing is lit before she asks: no right option shown, no answer line.
    await expect(box.locator("[data-option='ok']")).toHaveCount(0);
    await expect(box.locator("[data-answer-line]")).toHaveCount(0);
    // One record, her first answer, tagged with the misconception her option's note names.
    await expect.poll(async () => (await gateRows(page, "g1")).length).toBe(1);
    expect(await gateRows(page, "g1")).toEqual([{ itemId: `${TOPIC_ID}#gate:g1`, correct: false, misconceptionTags: expect.any(Array) }]);

    await reteach.locator("[data-show-answer]").click();
    await expect(box.locator("[data-verdict-block] [data-answer-line]")).toBeVisible();
    await expect(box.locator("[data-verdict-block]")).toBeFocused();
    await expect(box.locator("[data-option='ok']")).toHaveCount(1);
    await expect(box.locator("[data-option='miss']")).toHaveAttribute("data-value", "$\\dfrac{5x}{10}$");
    await expect(box.getByRole("radio", { name: "5x over 10 (your answer)" })).toHaveCount(1);
    await expect(box.getByRole("radio", { name: "x over 2 (the right answer)" })).toHaveCount(1);
    await expect(box.locator("[data-verdict-block]")).toContainText("comes back before the recap on new numbers");
    // The re-teach stays on the page: nothing she read is taken away.
    await expect(reteach).toBeVisible();
    await expect(page.locator("#main").getByText(/\bWrong\b/)).toHaveCount(0);
    expect(await gateRows(page, "g1")).toHaveLength(1);
  });

  test("the missed Your turn comes back before the recap as its twin on new numbers, once, unrecorded", async ({ page }) => {
    await openNote(page);
    await showAllSteps(page);
    await answer(page, "g1", "$\\dfrac{x+2}{2}$");
    await gate(page, "g1").locator("[data-show-answer]").click();
    await continueOn(page);
    // Section 2: its See it, then g2, right.
    await showAllSteps(page);
    await answer(page, "g2", "$\\dfrac{x-2}{x+3}$");
    await continueOn(page);
    // Section 3: its See it (its typed step shown), then g3, a number, right.
    await showAllSteps(page);
    await answerTyped(page, "g3", "-3");
    await expect(gate(page, "g3").locator("[data-verdict]")).toHaveText("Yes.");
    await continueOn(page);
    // Section 4: one See it, two Your turns, then the retry before the recap.
    await showAllSteps(page);
    await expect(gate(page, "g4")).toContainText("Your turn · 1 of 2");
    await answerTyped(page, "g4", "8");
    await expect(gate(page, "g5")).toContainText("Your turn · 2 of 2");
    await answer(page, "g5", "$(3x+5)(3x-5)$");
    const retry = page.locator('#note [data-gate-retry="g1"]');
    await expect(retry).toBeVisible();
    await expect(retry).toHaveAttribute("data-retry", "twin");
    await expect(retry).toContainText("Once more · on new numbers");
    // The twin's own question (new numbers), with its own options.
    await expect(retry.getByRole("radio", { name: "x over 3", exact: true })).toHaveCount(1);
    // The section does not end until the retry is answered; then it holds, unrecorded.
    await expect(page.locator('#note [data-section-end="4"] [data-continue]')).toHaveCount(0);
    const radios = retry.getByRole("radio");
    const at = await radios.evaluateAll((els) => els.findIndex((el) => el.getAttribute("data-value") === "$\\dfrac{x}{3}$"));
    await radios.nth(at).click();
    await retry.getByRole("button", { name: /^Check$/ }).click();
    await expect(retry.locator("[data-verdict]")).toHaveText("Yes.");
    await expect(retry).toContainText("Asked once more, and held. Your first answer is the one on record.");
    expect(await gateRows(page, "g1")).toHaveLength(1);
    expect((await gateRows(page, "g1"))[0]?.correct).toBe(false);
    await expect(page.locator('#note [data-section-end="4"] [data-continue]')).toBeVisible();
  });

  test("a step she types is marked through the engine and never recorded", async ({ page }) => {
    await openNote(page);
    await showAllSteps(page);
    await answer(page, "g1", "$\\dfrac{x}{2}$");
    await continueOn(page);
    await showAllSteps(page);
    await answer(page, "g2", "$\\dfrac{x-2}{x+3}$");
    await continueOn(page);
    // Section 3's See it: two steps by Next step, then the third is hers to type.
    const see = seeIt(page).last();
    await see.locator("[data-next-step]").click();
    await see.locator("[data-next-step]").click();
    const typed = see.locator("[data-typed-step='3']");
    await expect(typed).toBeVisible();
    await expect(gate(page, "g3")).toHaveCount(0);
    const before = (await attempts(page)).length;
    await typed.locator("input").first().fill("10");
    await typed.getByRole("button", { name: /^Check$/ }).click();
    await expect(see.locator("[data-typed-result='right']")).toContainText("You wrote 10");
    await expect(gate(page, "g3")).toBeVisible();
    expect((await attempts(page)).length).toBe(before);
  });

  test("a number Your turn takes a negative answer from the key strip's minus", async ({ page }) => {
    await openNote(page);
    await showAllSteps(page);
    await answer(page, "g1", "$\\dfrac{x}{2}$");
    await continueOn(page);
    await showAllSteps(page);
    await answer(page, "g2", "$\\dfrac{x-2}{x+3}$");
    await continueOn(page);
    await showAllSteps(page);
    const box = gate(page, "g3");
    const field = box.locator("[data-gate-field]");
    await expect(field).toHaveAttribute("inputmode", "decimal");
    await box.getByRole("button", { name: "minus" }).click();
    await field.pressSequentially("3");
    await expect(field).toHaveValue("−3");
    await box.getByRole("button", { name: /^Check$/ }).click();
    await expect(box.locator("[data-verdict]")).toHaveText("Yes.");
  });

  test("the See it that names a worked example shows that example's steps, without its why-menu or its typed step", async ({ page }) => {
    await openNote(page);
    await showAllSteps(page);
    await answer(page, "g1", "$\\dfrac{x}{2}$");
    await continueOn(page);
    const see = seeIt(page).last();
    await expect(see.locator("[data-see-stem]")).toContainText("Simplify fully");
    await showAllSteps(page);
    await expect(see.locator("[data-step]")).toHaveCount(SEE_FIXTURE_WORKED_EXAMPLE.steps.length);
    // Shown, never typed: the worked example's step 2 carries an input for its faded runs, and the See it asks nothing.
    await expect(see.locator("[data-typed-step]")).toHaveCount(0);
    await expect(see).not.toContainText("Why does that work?");
    await expect(see.locator("[data-step='3']")).toContainText("divides out");
  });

  test("after a reload, a Your turn she missed is drawn missed, never passed (audit READ-7)", async ({ page }) => {
    await openNote(page);
    await showAllSteps(page);
    await answer(page, "g1", "$\\dfrac{5x}{10}$");
    await expect.poll(async () => (await gateRows(page, "g1")).length).toBe(1);
    await page.reload();
    await expect(page.locator("#note article")).toBeVisible();
    const box = gate(page, "g1");
    await expect(box).toBeVisible();
    // Her first answer, from the device: her option edged, the right one lit, "Not quite.", and never a "Yes.".
    await expect(box.locator("[data-verdict]", { hasText: "Yes." })).toHaveCount(0);
    await expect(box.locator("[data-option='miss']")).toHaveAttribute("data-value", "$\\dfrac{5x}{10}$");
    await expect(box.locator("[data-option='ok']")).toHaveCount(1);
    await expect(box).toContainText("Not quite.");
    await expect(box).toContainText("Missed on an earlier visit.");
    // Restored, so it is not re-taught again and asks for nothing.
    await expect(box.locator("[data-show-answer]")).toHaveCount(0);
  });
});
