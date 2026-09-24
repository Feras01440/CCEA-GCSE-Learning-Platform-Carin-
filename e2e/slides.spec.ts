import { expect, test, type Page } from "@playwright/test";

/**
 * Slides on the trial topic (TRIAL-BRIEF.md, slides row; docs/design/2026-09-23-art-direction-v2.md §11; benchmarks
 * page 4). Everything asserted here is a promise the screen makes:
 *  - the title card is one screen with one accent-filled control and the honest count, on both sizes, with no app chrome;
 *  - a gate blocks the way on until it is answered, records the Read gate's id once, and a miss carries its meaning in
 *    colour (the right option lit in fern, hers edged in ink, "Not quite.", nothing red) and comes back before the recap;
 *  - arrow keys, the Next button, a tap on Continue and a swipe all move on; Enter checks; the digits choose;
 *  - every drawn label renders at 13 px or more at 390 wide; nothing animates under reduced motion;
 *  - the figure she acts on strikes the shared factors and shows the simplified fraction;
 *  - the close carries the character and Rowan's line and holds no answer field; no gate card carries either;
 *  - the topic hero offers Slides on the accent on a first visit on both sizes, remembers Read when she chooses it, and
 *    says where the slides stopped when she leaves mid-run;
 *  - in dark mode the accent control keeps 4.5:1 with its text and the character keeps its own colours.
 *
 * The suite's config runs with reducedMotion "reduce", which is what the getAnimations checks rely on.
 */

const TOPIC = "/learn/further-maths/FM1/algebraic-fractions-simplify/";
const SLIDES = `${TOPIC}slides/`;
const TOPIC_ID = "fm.u1.algebraic-fractions-simplify";
const CONTENT = "/content/further-maths/fm.u1.algebraic-fractions-simplify.json";
const DB_NAME = "ccea-study";
const PHONE = { width: 390, height: 844 };
const DESKTOP = { width: 1280, height: 800 };

interface Gate {
  id: string;
  answer: string;
  options?: string[];
}

async function gates(page: Page): Promise<Gate[]> {
  return page.evaluate(async (url) => {
    const b = (await (await fetch(url)).json()) as { noteBlocks: Array<{ type: string; id?: string; answer?: string; options?: string[] }> };
    return b.noteBlocks.filter((x) => x.type === "gate").map((g) => ({ id: g.id!, answer: g.answer!, options: g.options }));
  }, CONTENT);
}

async function openSlides(page: Page): Promise<void> {
  await page.goto(SLIDES);
  await expect(page.locator("[data-card='title']")).toBeVisible();
  // Hydrated and restored: only then do the keys and the control have their listeners.
  await expect(page.locator("[data-slides][data-ready='true']")).toBeAttached();
  await page.evaluate(() => document.fonts.ready.then(() => true));
}

const count = (page: Page) => page.locator("[data-count]");
const card = (page: Page) => page.locator("[data-card]");
const control = (page: Page) => page.locator("[data-control]");

/**
 * Animations at rest, under the suite's reduced motion. Anything in a shadow root is not the page's: on the dev server
 * Next's overlay spins while it compiles (the export has no overlay), so only the document tree is counted.
 */
async function animations(page: Page): Promise<number> {
  await page.evaluate(() => document.fonts.ready.then(() => true));
  return page.evaluate(() =>
    document.getAnimations().filter((a) => {
      const t = (a.effect as KeyframeEffect | null)?.target;
      return !(t instanceof Element) || t.getRootNode() === document;
    }).length,
  );
}

/** Visible controls whose computed background is the accent: the one-accent rule, counted from the pixels. */
async function accentControls(page: Page): Promise<string[]> {
  return page.evaluate(() => {
    const root = document.querySelector("[data-slides]") ?? document.body;
    const accent = getComputedStyle(root).getPropertyValue("--accent").trim();
    const probe = document.createElement("span");
    probe.style.backgroundColor = accent;
    root.appendChild(probe);
    const resolved = getComputedStyle(probe).backgroundColor;
    probe.remove();
    return Array.from(document.querySelectorAll<HTMLElement>("button, a"))
      .filter((e) => e.getBoundingClientRect().width > 0 && getComputedStyle(e).backgroundColor === resolved)
      .map((e) => (e.textContent ?? "").trim());
  });
}

/** Colours on the card near red (hue within 20° of 0, saturated), which the miss state must never use. */
async function reddish(page: Page): Promise<string[]> {
  return page.evaluate(() => {
    const out: string[] = [];
    const seen = new Set<string>();
    for (const el of document.querySelectorAll<HTMLElement>("[data-slides] *")) {
      const cs = getComputedStyle(el);
      for (const c of [cs.color, cs.backgroundColor, cs.borderTopColor, cs.borderLeftColor]) {
        if (seen.has(c)) continue;
        seen.add(c);
        const m = /^rgba?\((\d+), (\d+), (\d+)/.exec(c);
        if (!m) continue;
        const [r, g, b] = [Number(m[1]), Number(m[2]), Number(m[3])].map((v) => v / 255);
        const max = Math.max(r, g, b);
        const min = Math.min(r, g, b);
        const d = max - min;
        if (d < 0.25) continue; // not saturated enough to read as a colour
        let h = 0;
        if (max === r) h = ((g - b) / d) % 6;
        else if (max === g) h = (b - r) / d + 2;
        else h = (r - g) / d + 4;
        h = (h * 60 + 360) % 360;
        if (h <= 20 || h >= 340) out.push(c);
      }
    }
    return out;
  });
}

/** Every visible drawn label on the card, as rendered pixels: fontSize × clientWidth ÷ viewBoxWidth. */
async function smallestDrawnLabel(page: Page): Promise<number | null> {
  return page.evaluate(() => {
    let min: number | null = null;
    for (const svg of document.querySelectorAll<SVGSVGElement>("[data-card] svg[viewBox]")) {
      const w = svg.clientWidth;
      if (w < 2) continue;
      const vb = svg.getAttribute("viewBox")!.split(/[\s,]+/).map(Number);
      for (const t of svg.querySelectorAll("text")) {
        const fs = Number(t.getAttribute("font-size") ?? getComputedStyle(t).fontSize.replace("px", ""));
        const px = (fs * w) / vb[2];
        min = min === null ? px : Math.min(min, px);
      }
    }
    return min;
  });
}

async function attempts(page: Page): Promise<Array<{ itemId: string; itemKind: string; correct: boolean | null }>> {
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
              resolve((req.result as Array<{ itemId: string; itemKind: string; correct: boolean | null }>).map((a) => ({ itemId: a.itemId, itemKind: a.itemKind, correct: a.correct })));
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

/** An install past first run with the Letter read yesterday, so Rowan speaks at the close (the companion spec's seed). */
async function installPastFirstRun(page: Page): Promise<void> {
  await page.goto("/");
  await expect(page).toHaveURL(/\/welcome\/?$/);
  const failure = await page.evaluate(
    (name) =>
      new Promise<string | null>((resolve) => {
        const d = new Date(Date.now() - 86_400_000);
        const yesterday = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
        const open = indexedDB.open(name);
        open.onerror = () => resolve(`open: ${open.error?.message ?? "failed"}`);
        open.onsuccess = () => {
          const db = open.result;
          try {
            const tx = db.transaction(["settings", "companionState"], "readwrite");
            tx.objectStore("settings").put({ key: "firstRunDone", value: true });
            tx.objectStore("companionState").put({ id: "state", plainModeUntil: null, letterSeen: true, letterOfferedOn: yesterday, name: null, silenced: false, recent: [], updatedAt: new Date() });
            tx.oncomplete = () => {
              db.close();
              resolve(null);
            };
            tx.onerror = () => {
              db.close();
              resolve(`write: ${tx.error?.message ?? "failed"}`);
            };
          } catch (e) {
            db.close();
            resolve(String(e));
          }
        };
      }),
    DB_NAME,
  );
  expect(failure, "seeding the install").toBeNull();
}

/**
 * Selects the option with the given authored text and checks it. Options are found by their value (`data-value`, the
 * authored string), never by their place: the shown order is a seeded shuffle (engine item 11) and a rendered option's
 * text carries KaTeX's MathML and HTML.
 */
async function answerChoice(page: Page, option: string): Promise<void> {
  const radios = page.locator("[data-gate] [role='radio']");
  // Matched in the page by the attribute's exact value: a selector literal would have to escape the maths in it.
  const at = await radios.evaluateAll((els, value) => els.findIndex((el) => el.getAttribute("data-value") === value), option);
  expect(at, `option "${option}"`).toBeGreaterThanOrEqual(0);
  await radios.nth(at).click();
  await expect(radios.nth(at)).toHaveAttribute("aria-checked", "true");
  await control(page).click();
  await expect(page.locator("[data-verdict]")).toBeVisible();
}

/** Walks from the current card to the close, answering every gate right except `missIds`, which are answered wrong once. */
async function walkToClose(page: Page, missIds: string[] = []): Promise<void> {
  const all = await gates(page);
  const byId = new Map(all.map((g) => [g.id, g]));
  for (let step = 0; step < 60; step += 1) {
    const kind = await card(page).getAttribute("data-card");
    if (kind === "close") return;
    if (kind === "gate") {
      const id = (await page.locator("[data-gate]").getAttribute("data-gate"))!;
      const retry = (await page.locator("[data-gate]").getAttribute("data-retry")) === "true";
      const g = byId.get(id)!;
      const wrong = g.options?.find((o) => o !== g.answer) ?? "";
      await answerChoice(page, !retry && missIds.includes(id) ? wrong : g.answer);
      await control(page).click();
    } else if (kind === "interaction") {
      for (const pill of ["t-b", "b-b", "t-2x", "b-4"]) await page.locator(`[data-pill='${pill}']`).click();
      await control(page).click();
      await expect(page.locator("[data-result]")).toBeVisible();
      await control(page).click();
    } else if (kind === "recall") {
      await control(page).click();
      await page.locator("[data-grades] button", { hasText: "Good" }).click();
    } else {
      await control(page).click();
    }
    await page.waitForTimeout(80);
  }
  throw new Error("the deck did not reach its close in 60 steps");
}

test.describe("Slides: the title card", () => {
  for (const size of [PHONE, DESKTOP]) {
    test(`at ${size.width} it is one screen, no chrome, one accent control, the honest count`, async ({ page }) => {
      await page.setViewportSize(size);
      await openSlides(page);
      await expect(page.locator("nav[aria-label='Primary']")).toHaveCount(0);
      await expect(page.getByRole("heading", { level: 1 })).toHaveText("Simplifying algebraic fractions");
      await expect(page.locator("[data-card='title']")).toContainText("25 cards · 7 checks · 1 video");
      await expect(page.locator("[data-card='title']")).toContainText(/About \d+ minutes/);
      expect(await accentControls(page)).toEqual(["Start the slides"]);
      const scroll = await page.evaluate(() => {
        const body = document.querySelector("[data-body]")!;
        return { page: document.documentElement.scrollHeight - document.documentElement.clientHeight, card: body.scrollHeight - body.clientHeight };
      });
      expect(scroll.page, "the page scrolls").toBeLessThanOrEqual(0);
      expect(scroll.card, "the title card scrolls").toBeLessThanOrEqual(0);
      expect(await animations(page), "animations under reduced motion").toBe(0);
      const label = await smallestDrawnLabel(page);
      expect(label, "the smallest drawn label in px").not.toBeNull();
      expect(label!).toBeGreaterThanOrEqual(13);
    });
  }

  test("Read it as a page instead goes back to the topic and is remembered", async ({ page }) => {
    await page.setViewportSize(PHONE);
    await openSlides(page);
    await page.getByRole("link", { name: /^Read it as a page instead$/ }).click();
    await expect(page).toHaveURL(new RegExp(`${TOPIC.replace(/\//g, "\\/")}$`));
    expect(await page.evaluate(() => localStorage.getItem("cairn.lessonWay"))).toBe("read");
  });
});

test.describe("Slides: the gate", () => {
  test("blocks the way on, records the Read gate id once, and a miss carries its meaning in colour and comes back", async ({ page }) => {
    await page.setViewportSize(PHONE);
    await openSlides(page);
    await control(page).click(); // Start
    await expect(count(page)).toHaveText("2 of 25");
    await control(page).click(); // Continue past the first idea
    await expect(count(page)).toHaveText("3 of 25");
    await expect(page.locator("[data-gate='g1']")).toBeVisible();

    // Locked: the arrow key and a swipe do nothing, the control says Check and is disabled until an option is chosen.
    await page.keyboard.press("ArrowRight");
    await expect(count(page)).toHaveText("3 of 25");
    await expect(control(page)).toHaveText("Check");
    await expect(control(page)).toBeDisabled();
    expect(await page.locator("[data-companion], [data-companion-figure]").count(), "nothing signed on a gate card").toBe(0);
    expect(await animations(page)).toBe(0);

    // Her answer, wrong: the right option is lit (a tick), hers is edged (the circle-dash), the word is "Not quite.", nothing is red.
    const g1 = (await gates(page)).find((g) => g.id === "g1")!;
    const wrong = g1.options!.find((o) => o !== g1.answer)!;
    await answerChoice(page, wrong);
    await expect(page.locator("[data-outcome='ok']")).toHaveCount(1);
    await expect(page.locator("[data-outcome='miss']")).toHaveCount(1);
    await expect(page.locator("[data-outcome='ok'] svg")).toBeVisible();
    await expect(page.locator("[data-verdict='miss']")).toContainText("Not quite.");
    await expect(page.locator("[data-verdict='miss']")).toContainText("comes back once more before the recap");
    expect(await reddish(page), "a colour near red on the card").toEqual([]);
    const okEdge = await page.locator("[data-outcome='ok']").evaluate((el) => getComputedStyle(el).borderTopColor);
    const missEdge = await page.locator("[data-outcome='miss']").evaluate((el) => getComputedStyle(el).borderTopColor);
    expect(okEdge).not.toBe(missEdge);
    expect(await animations(page)).toBe(0);
    // The deck grew by the retry.
    await expect(count(page)).toHaveText("3 of 26");
    // One attempt, with the id Read uses, and a review card for it.
    const rows = await attempts(page);
    expect(rows).toEqual([{ itemId: `${TOPIC_ID}#gate:g1`, itemKind: "practice", correct: false }]);

    // Back re-reads, forward returns to the marked gate, Continue moves on.
    await page.keyboard.press("ArrowLeft");
    await expect(count(page)).toHaveText("2 of 26");
    await page.keyboard.press("ArrowRight");
    await expect(page.locator("[data-verdict='miss']")).toBeVisible();
    await expect(control(page)).toHaveText("Continue");
    await control(page).click();
    await expect(count(page)).toHaveText("4 of 26");
    expect((await attempts(page)).length, "no second record").toBe(1);
  });

  test("Enter checks and the digits choose, on the desktop", async ({ page }) => {
    await page.setViewportSize(DESKTOP);
    await openSlides(page);
    await page.keyboard.press("Enter");
    await page.keyboard.press("Enter");
    await expect(page.locator("[data-gate='g1']")).toBeVisible();
    await expect(page.locator("[data-hints]")).toContainText("choose");
    // The digit chooses by the shown position; the right answer's position is the seeded order's, read from the badge.
    const g1 = (await gates(page)).find((g) => g.id === "g1")!;
    const shownAt = await page.locator("[data-gate] [role='radio']").evaluateAll((els, answer) => els.findIndex((el) => el.getAttribute("data-value") === answer), g1.answer);
    expect(shownAt).toBeGreaterThanOrEqual(0);
    await page.keyboard.press(String(shownAt + 1));
    await expect(page.locator("[role='radio'][aria-checked='true']")).toHaveCount(1);
    await page.keyboard.press("Enter");
    await expect(page.locator("[data-verdict='ok']")).toContainText("Yes.");
    await expect(page.locator("[data-verdict='ok']")).toContainText("Recorded. It comes back in your reviews.");
    // The lifted stem: a command's expression on its own line at the display size (art direction v2 §8.4).
    await walkTo(page, "gate", "g4");
    const maths = page.locator("[data-stem-maths] .katex-display");
    await expect(maths).toBeVisible();
    expect(await maths.evaluate((el) => parseFloat(getComputedStyle(el).fontSize))).toBeGreaterThanOrEqual(32);
    await expect(page.locator("[data-stem] > div").first()).toHaveText("Simplify");
  });
});

/** Moves on through cards that need no answer until the card of `kind` (and gate id) is on screen. */
async function walkTo(page: Page, kind: string, gateId?: string): Promise<void> {
  const all = await gates(page);
  const byId = new Map(all.map((g) => [g.id, g]));
  for (let step = 0; step < 60; step += 1) {
    const k = await card(page).getAttribute("data-card");
    if (k === kind && (!gateId || (await page.locator("[data-gate]").getAttribute("data-gate")) === gateId)) return;
    if (k === "gate") {
      const id = (await page.locator("[data-gate]").getAttribute("data-gate"))!;
      if (await page.locator("[data-verdict]").count()) await control(page).click();
      else {
        await answerChoice(page, byId.get(id)!.answer);
        await control(page).click();
      }
    } else if (k === "interaction") {
      for (const pill of ["t-b", "b-b", "t-2x", "b-4"]) await page.locator(`[data-pill='${pill}']`).click();
      await control(page).click();
      await control(page).click();
    } else if (k === "recall") {
      await control(page).click();
      await page.locator("[data-grades] button", { hasText: "Good" }).click();
    } else if (k === "close") {
      throw new Error(`reached the close before ${kind} ${gateId ?? ""}`);
    } else {
      await control(page).click();
    }
    await page.waitForTimeout(80);
  }
  throw new Error(`did not reach ${kind} ${gateId ?? ""}`);
}

test.describe("Slides: the figure she acts on, and the drawn labels", () => {
  test("the shared factors strike in pairs, a mismatch is named, Check draws the simplified fraction", async ({ page }) => {
    await page.setViewportSize(PHONE);
    await openSlides(page);
    await walkTo(page, "interaction");
    await expect(page.getByRole("heading", { level: 2 })).toHaveText("Cancel every factor on both lines");
    expect(await smallestDrawnLabel(page)).toBeNull(); // pills are real buttons, 44 px, not drawn text
    await page.locator("[data-pill='t-b']").click();
    await page.locator("[data-pill='b-b']").click();
    await expect(page.locator("[data-pill][data-struck]")).toHaveCount(2);
    await page.locator("[data-pill='t-2x']").click();
    await page.locator("[data-pill='b-m']").click();
    await expect(page.locator("[data-interaction] p[aria-live]")).toContainText("not the same factor");
    await expect(page.locator("[data-pill][data-struck]")).toHaveCount(2);
    await page.locator("[data-pill='t-2x']").click();
    await page.locator("[data-pill='b-4']").click();
    await expect(page.locator("[data-pill][data-struck]")).toHaveCount(4);
    await expect(page.locator("[data-pill='b-m'][data-struck]")).toHaveCount(0);
    await control(page).click();
    await expect(page.locator("[data-result]")).toBeVisible();
    await expect(page.locator("[data-interaction] p[aria-live]")).toContainText("(x − 5) stays");
    await expect(control(page)).toHaveText("Continue");
    expect(await animations(page)).toBe(0);
  });

  test("the idea's illustration and the miss's consequence keep every label at 13 px or more at 390", async ({ page }) => {
    await page.setViewportSize(PHONE);
    await openSlides(page);
    await walkTo(page, "idea");
    await control(page).click();
    await walkTo(page, "gate", "g2");
    // Card 4 (the idea with the drawing) was passed on the way; go back to it and measure.
    await page.keyboard.press("ArrowLeft");
    await page.keyboard.press("ArrowLeft");
    await expect(page.locator("[data-stage] svg").first()).toBeVisible();
    expect(await smallestDrawnLabel(page)).toBeGreaterThanOrEqual(13);
    await page.keyboard.press("ArrowRight");
    await page.keyboard.press("ArrowRight");
    await expect(page.locator("[data-gate='g2']")).toBeVisible();
    const g2 = (await gates(page)).find((g) => g.id === "g2")!;
    await answerChoice(page, g2.options!.find((o) => o !== g2.answer)!);
    await expect(page.locator("[data-reaction]")).toBeVisible();
    expect(await smallestDrawnLabel(page)).toBeGreaterThanOrEqual(13);
    expect(await reddish(page)).toEqual([]);
  });
});

test.describe("Slides: moving on", () => {
  test("a swipe moves on and back on a touch phone", async ({ page, isMobile }) => {
    test.skip(!isMobile, "the swipe is a phone gesture");
    await openSlides(page);
    await control(page).click();
    await expect(count(page)).toHaveText("2 of 25");
    const box = (await card(page).boundingBox())!;
    const y = box.y + box.height / 2;
    await page.mouse.move(box.x + box.width - 40, y);
    await page.mouse.down();
    await page.mouse.move(box.x + 40, y, { steps: 8 });
    await page.mouse.up();
    await expect(count(page)).toHaveText("3 of 25");
    await page.mouse.move(box.x + 40, y);
    await page.mouse.down();
    await page.mouse.move(box.x + box.width - 40, y, { steps: 8 });
    await page.mouse.up();
    await expect(count(page)).toHaveText("2 of 25");
  });

  test("the Next button at the screen's edge and the arrow keys move on, on the desktop", async ({ page }) => {
    await page.setViewportSize(DESKTOP);
    await openSlides(page);
    await page.keyboard.press("Enter");
    await expect(count(page)).toHaveText("2 of 25");
    await page.locator("[data-next]").click();
    await expect(count(page)).toHaveText("3 of 25");
    await expect(page.locator("[data-next]")).toBeDisabled(); // a gate: locked
    await page.locator("[data-prev]").click();
    await expect(count(page)).toHaveText("2 of 25");
  });
});

test.describe("Slides: the whole deck and the close", () => {
  test("the missed gate returns before the recap; the close holds the character and Rowan's line and no answer field", async ({ page }) => {
    await page.setViewportSize(PHONE);
    await installPastFirstRun(page);
    await openSlides(page);
    await control(page).click();
    await walkToClose(page, ["g2"]);

    await expect(page.locator("[data-card='close']")).toBeVisible();
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Done for tonight.");
    await expect(page.locator("[data-card='close']")).toContainText("7 checks answered · the one that came back held · 4 recall cards graded");
    await expect(page.locator("[data-companion-figure='close']")).toHaveCount(1);
    await expect(page.locator("[data-companion='session-close']")).toBeVisible();
    await expect(page.locator("[data-companion='session-close']")).not.toContainText("!");
    expect(await page.locator("[data-card='close'] :is(input, textarea, [role='radio'])").count()).toBe(0);
    await expect(page.locator("[data-card='close']")).toContainText("What returns");
    expect(await accentControls(page)).toEqual(["Done for tonight"]);
    expect(await animations(page)).toBe(0);

    // The records: seven gates once each with Read's ids, the miss on g2 kept as the record, four prompts.
    const rows = await attempts(page);
    const gateRows = rows.filter((r) => r.itemId.includes("#gate:"));
    expect(gateRows.map((r) => r.itemId.split("#gate:")[1]).sort()).toEqual(["g1", "g2", "g3", "g4", "g5", "g6", "g7"]);
    expect(gateRows.find((r) => r.itemId.endsWith("g2"))?.correct).toBe(false);
    expect(rows.filter((r) => r.itemKind === "prompt")).toHaveLength(4);

    // Done for tonight goes home; the run is finished, so the slides start afresh next time.
    await page.getByRole("link", { name: /^Done for tonight$/ }).click();
    await expect(page.getByRole("heading", { level: 1, name: "Today" })).toBeVisible();
  });

  test("the retry card sits just before the recap and is asked once more, unrecorded", async ({ page }) => {
    await page.setViewportSize(DESKTOP);
    await openSlides(page);
    await control(page).click();
    await walkTo(page, "gate", "g2");
    const g2 = (await gates(page)).find((g) => g.id === "g2")!;
    await answerChoice(page, g2.options!.find((o) => o !== g2.answer)!);
    await control(page).click();
    await walkTo(page, "gate", "g6");
    await answerChoice(page, (await gates(page)).find((g) => g.id === "g6")!.answer);
    await control(page).click();
    // The next card is the retry, before the recap.
    await expect(page.locator("[data-gate='g2'][data-retry='true']")).toBeVisible();
    await expect(page.locator("[data-header]")).toContainText("Once more");
    await answerChoice(page, g2.answer);
    await expect(page.locator("[data-verdict='ok']")).toContainText("Asked again, and held. The first answer is the one on record.");
    expect((await attempts(page)).filter((r) => r.itemId.endsWith("#gate:g2"))).toHaveLength(1);
    await control(page).click();
    await expect(page.getByRole("heading", { level: 2 })).toHaveText("You can now");
    await expect(page.locator("[data-card='recap']")).toContainText("The check you missed came back before this card, and held.");
  });
});

test.describe("Slides: the hero's two ways in", () => {
  for (const size of [PHONE, DESKTOP]) {
    test(`at ${size.width} Slides carries the accent on a first visit, Read is the second way, and the choice is remembered`, async ({ page }) => {
      await page.setViewportSize(size);
      await page.goto(TOPIC);
      const slides = page.locator("header a[data-way='slides'], a[data-way='slides']").first();
      const read = page.locator("button[data-way='read']").first();
      await expect(slides).toBeVisible();
      await expect(slides).toHaveText(/^Start the slides/);
      await expect(read).toHaveText("Read it as a page");
      const slidesBg = await slides.evaluate((el) => getComputedStyle(el).backgroundColor);
      const readBg = await read.evaluate((el) => getComputedStyle(el).backgroundColor);
      expect(slidesBg).not.toBe(readBg);

      // She chooses Read: it is remembered, and next time Read carries the accent.
      await read.click();
      await page.reload();
      await expect(page.locator("button[data-way='read']").first()).toHaveText("Start the lesson");
      await expect(page.locator("a[data-way='slides']").first()).toHaveText(/^Start the slides/);
      const readBgNow = await page.locator("button[data-way='read']").first().evaluate((el) => getComputedStyle(el).backgroundColor);
      expect(readBgNow).toBe(slidesBg);

      // She starts the slides and leaves after two cards: the hero says where they stopped.
      await page.locator("a[data-way='slides']").first().click();
      await expect(page.locator("[data-card='title']")).toBeVisible();
      await control(page).click();
      await control(page).click();
      await expect(count(page)).toHaveText("3 of 25");
      await page.locator("[data-exit]").click();
      await expect(page.locator("a[data-way='slides']").first()).toHaveText(/^Continue the slides · card 3 of 25$/);
    });
  }
});

test.describe("Slides: dark mode", () => {
  test("the accent control keeps 4.5:1 with its text and the character keeps its colours", async ({ page }) => {
    await page.setViewportSize(PHONE);
    const contrast = async () =>
      control(page).evaluate((el) => {
        const canvas = document.createElement("canvas");
        canvas.width = canvas.height = 1;
        const ctx = canvas.getContext("2d", { willReadFrequently: true })!;
        const rgb = (color: string) => {
          ctx.clearRect(0, 0, 1, 1);
          ctx.fillStyle = "#000";
          ctx.fillStyle = color;
          ctx.fillRect(0, 0, 1, 1);
          const d = ctx.getImageData(0, 0, 1, 1).data;
          return [d[0], d[1], d[2]];
        };
        const lum = (c: number[]) => c.map((v) => (v / 255 <= 0.04045 ? v / 255 / 12.92 : Math.pow((v / 255 + 0.055) / 1.055, 2.4))).reduce((a, v, i) => a + v * [0.2126, 0.7152, 0.0722][i], 0);
        const cs = getComputedStyle(el);
        const a = lum(rgb(cs.color));
        const b = lum(rgb(cs.backgroundColor));
        return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
      });
    const fur = () => page.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue("--fur").trim());

    await page.emulateMedia({ colorScheme: "light" });
    await openSlides(page);
    const lightFur = await fur();
    expect(await contrast()).toBeGreaterThanOrEqual(4.5);

    await page.emulateMedia({ colorScheme: "dark" });
    await openSlides(page);
    await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
    expect(await contrast()).toBeGreaterThanOrEqual(4.5);
    expect(await fur()).toBe(lightFur);
    await control(page).click();
    await control(page).click();
    await expect(page.locator("[data-gate='g1']")).toBeVisible();
    await page.locator("[data-gate] [role='radio']").first().click();
    expect(await contrast()).toBeGreaterThanOrEqual(4.5);
  });
});
