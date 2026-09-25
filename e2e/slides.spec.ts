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
/** The trial deck's length: 23 cards (the note's 22 with the figure she acts on; two light recall cards, 24 Sep). */
const DECK = 23;

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
      await expect(page.locator("[data-card='title']")).toContainText(`${DECK} cards · 7 checks`);
      // The video has no stated length: it is named beside the minutes, not guessed into them (audit LD-03).
      await expect(page.locator("[data-promise]")).toHaveText(new RegExp(`^About \\d+ minutes plus a video · ${DECK} cards · 7 checks$`));
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
    await expect(count(page)).toHaveText(`2 of ${DECK}`);
    await control(page).click(); // Continue past the first idea
    await expect(count(page)).toHaveText(`3 of ${DECK}`);
    await expect(page.locator("[data-gate='g1']")).toBeVisible();

    // Locked: the arrow key and a swipe do nothing, the control says Check and is disabled until an option is chosen.
    await page.keyboard.press("ArrowRight");
    await expect(count(page)).toHaveText(`3 of ${DECK}`);
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
    await expect(count(page)).toHaveText(`3 of ${DECK + 1}`);
    // One attempt, with the id Read uses, and a review card for it.
    const rows = await attempts(page);
    expect(rows).toEqual([{ itemId: `${TOPIC_ID}#gate:g1`, itemKind: "practice", correct: false }]);

    // Back re-reads, forward returns to the marked gate, Continue moves on.
    await page.keyboard.press("ArrowLeft");
    await expect(count(page)).toHaveText(`2 of ${DECK + 1}`);
    await page.keyboard.press("ArrowRight");
    await expect(page.locator("[data-verdict='miss']")).toBeVisible();
    await expect(control(page)).toHaveText("Continue");
    await control(page).click();
    await expect(count(page)).toHaveText(`4 of ${DECK + 1}`);
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

/** A finger's sideways swipe, as the phone sends it (touch events, so the page sees pointerType "touch"). */
async function touchSwipe(page: Page, fromX: number, toX: number, y: number): Promise<void> {
  const cdp = await page.context().newCDPSession(page);
  const steps = 8;
  await cdp.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [{ x: fromX, y }] });
  for (let i = 1; i <= steps; i += 1) {
    await cdp.send("Input.dispatchTouchEvent", { type: "touchMove", touchPoints: [{ x: fromX + ((toX - fromX) * i) / steps, y }] });
  }
  await cdp.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
  await cdp.detach();
}

/** A review card's due time in ms, read from the device's database; null when there is no card. */
async function cardDue(page: Page, id: string): Promise<number | null> {
  return page.evaluate(
    ({ name, id }) =>
      new Promise<number | null>((resolve) => {
        const open = indexedDB.open(name);
        open.onerror = () => resolve(null);
        open.onsuccess = () => {
          const db = open.result;
          try {
            const req = db.transaction("cards", "readonly").objectStore("cards").get(id);
            req.onsuccess = () => {
              db.close();
              const row = req.result as { due?: Date } | undefined;
              resolve(row?.due ? new Date(row.due).getTime() : null);
            };
            req.onerror = () => {
              db.close();
              resolve(null);
            };
          } catch {
            db.close();
            resolve(null);
          }
        };
      }),
    { name: DB_NAME, id },
  );
}

test.describe("Slides: the recall cards (the owner, 24 Sep: 'it doesn't have to be always four … like writing an essay')", () => {
  test("two light cards; Skip records nothing; what she typed stays beside the answer; the three grades say three returns; the tap stores the day it said", async ({ page }) => {
    await page.setViewportSize(PHONE);
    await openSlides(page);
    await control(page).click();
    await walkTo(page, "recall");
    await expect(page.locator("[data-header]")).toContainText("Recall · 1 of 2");
    await expect(page.locator("[data-recall]")).toContainText("What is the last thing to check");

    // Skip moves on and records nothing: no attempt, no review card, never a miss.
    const promptRows = async () => (await attempts(page)).filter((r) => r.itemKind === "prompt").length;
    expect(await promptRows()).toBe(0);
    await page.locator("[data-skip]").click();
    await expect(page.locator("[data-header]")).toContainText("Recall · 2 of 2");
    expect(await promptRows()).toBe(0);
    expect(await cardDue(page, "rp.fm.u1.algebraic-fractions-simplify.04")).toBeNull();

    // She types, then shows the answer: her words stand above the model answer (audit LD-06).
    await page.locator("[data-recall] textarea").fill("take the x out first");
    await control(page).click();
    await expect(page.locator("[data-typed]")).toContainText("take the x out first");
    await expect(page.locator("[data-model-answer]")).toContainText("Take the common factor");

    // Three grades, three different returns: a new card's Again is a minute away, Good ten minutes, Easy days (LD-07).
    const whens = page.locator("[data-grades] [data-when]");
    await expect(whens.nth(0)).toHaveText("in a minute");
    await expect(whens.nth(1)).toHaveText("in 10 minutes");
    const easy = ((await whens.nth(2).textContent()) ?? "").trim();
    expect(easy).not.toMatch(/minute|later today|^$/);
    const shownAt = Date.now();
    await page.locator("[data-grade='easy']").click();
    await expect(page.locator("[data-card='close']")).toBeVisible();

    // Easy is stored as Easy: days away, not the ten minutes a Good gets (audit CQ-02). One attempt row, a prompt.
    await expect.poll(() => cardDue(page, "rp.fm.u1.algebraic-fractions-simplify.06")).not.toBeNull();
    const due = (await cardDue(page, "rp.fm.u1.algebraic-fractions-simplify.06"))!;
    expect(due - shownAt).toBeGreaterThan(86_400_000);
    expect(await promptRows()).toBe(1);
    // The close counts what was graded, and says nothing of the one she skipped.
    await expect(page.locator("[data-card='close']")).toContainText("1 recall card graded");
  });
});

test.describe("Slides: where the right answer sits (the owner's trial, 24 Sep: 'most of the correct answers are option A')", () => {
  test("the seven right answers are spread over A, B and C, the gates that name options by place keep their order, and Read shows the same order", async ({ page }) => {
    await page.setViewportSize(DESKTOP);
    await openSlides(page);
    await control(page).click();
    const all = await gates(page);
    const byId = new Map(all.map((g) => [g.id, g]));
    const shown = new Map<string, string[]>();
    for (let step = 0; step < 60 && shown.size < all.length; step += 1) {
      const k = await card(page).getAttribute("data-card");
      if (k === "gate") {
        const id = (await page.locator("[data-gate]").getAttribute("data-gate"))!;
        shown.set(id, await page.locator("[data-gate] [role='radio']").evaluateAll((els) => els.map((e) => e.getAttribute("data-value") ?? "")));
        await answerChoice(page, byId.get(id)!.answer);
        await control(page).click();
      } else if (k === "interaction") {
        for (const pill of ["t-b", "b-b", "t-2x", "b-4"]) await page.locator(`[data-pill='${pill}']`).click();
        await control(page).click();
        await control(page).click();
      } else {
        await control(page).click();
      }
      await page.waitForTimeout(60);
    }
    expect([...shown.keys()]).toEqual(["g1", "g2", "g7", "g3", "g4", "g5", "g6"]);
    const at = [...shown.entries()].map(([id, order]) => order.indexOf(byId.get(id)!.answer));
    const counts = [0, 1, 2].map((p) => at.filter((a) => a === p).length);
    // Build 7 showed A, A, A, A, B, A, B (five at A, none at C). Seven in three places: never more than three in one.
    expect(new Set(at).size, `answers at ${at.map((a) => "ABC"[a]).join("")}`).toBeGreaterThan(1);
    expect(Math.max(...counts), `answers at ${at.map((a) => "ABC"[a]).join("")}`).toBeLessThanOrEqual(3);
    // g4 and g5 explain themselves by place ("the second option … the third"), so they keep the order they were written in.
    for (const id of ["g4", "g5"]) expect(shown.get(id), id).toEqual(byId.get(id)!.options);

    // Read shows g1, the first gate, in the same order (the lesson's order is one function of the note).
    await page.goto(TOPIC);
    const readG1 = page.locator("#note [data-gate='g1'] [role='radio']");
    await expect(readG1.first()).toBeVisible();
    expect(await readG1.evaluateAll((els) => els.map((e) => e.getAttribute("data-value") ?? ""))).toEqual(shown.get("g1"));
  });
});

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
    // 2x and 4 share a factor of 2, not themselves: the 2 is struck out of each and x and 2 are left (audit MK-05).
    await expect(page.locator("[data-pill='t-2x']")).toHaveAttribute("data-struck", "2");
    await expect(page.locator("[data-pill='t-2x']")).toHaveAttribute("data-left", "x");
    await expect(page.locator("[data-pill='b-4']")).toHaveAttribute("data-struck", "2");
    await expect(page.locator("[data-pill='b-4']")).toHaveAttribute("data-left", "2");
    await expect(page.locator("[data-pill='t-b']")).toHaveAttribute("data-struck", "all");
    await expect(page.locator("[data-interaction] p[aria-live]")).toContainText("the 2 divides out of both, leaving x and 2");
    await control(page).click();
    await expect(page.locator("[data-result='done']")).toBeVisible();
    await expect(page.locator("[data-result] [role='img']")).toHaveAttribute("aria-label", "x over 2(x − 5)");
    await expect(page.locator("[data-interaction] p[aria-live]")).toContainText("x and 2(x − 5) share nothing");
    await expect(control(page)).toHaveText("Continue");
    expect(await animations(page)).toBe(0);
  });

  test("what she struck stays struck when she goes back a card and returns, and after a reload (audit CQ-04)", async ({ page }) => {
    await page.setViewportSize(PHONE);
    await openSlides(page);
    await walkTo(page, "interaction");
    await page.locator("[data-pill='t-b']").click();
    await page.locator("[data-pill='b-b']").click();
    // Before Check: back a card and forward again.
    await page.keyboard.press("ArrowLeft");
    await expect(page.locator("[data-card='idea']")).toBeVisible();
    await page.keyboard.press("ArrowRight");
    await expect(page.locator("[data-pill][data-struck]")).toHaveCount(2);
    await page.locator("[data-pill='t-2x']").click();
    await page.locator("[data-pill='b-4']").click();
    await control(page).click();
    await expect(page.locator("[data-result='done']")).toBeVisible();
    // After Check: a reload keeps the strikes, what is left, and the result.
    await page.reload();
    await expect(page.locator("[data-slides][data-ready='true']")).toBeAttached();
    await expect(page.locator("[data-card='interaction']")).toBeVisible();
    await expect(page.locator("[data-pill][data-struck]")).toHaveCount(4);
    await expect(page.locator("[data-pill='b-4']")).toHaveAttribute("data-left", "2");
    await expect(page.locator("[data-result='done']")).toBeVisible();
    await expect(control(page)).toHaveText("Continue");
  });

  test("a Check with a factor still shared lights it, shows the answer, and lets her finish it now (audit LD-11)", async ({ page }) => {
    await page.setViewportSize(PHONE);
    await openSlides(page);
    await walkTo(page, "interaction");
    await page.locator("[data-pill='t-b']").click();
    await page.locator("[data-pill='b-b']").click();
    await control(page).click();
    // What is still shared is lit in fern and named; the simplified fraction is shown; nothing is red.
    await expect(page.locator("[data-pill][data-lit]")).toHaveCount(2);
    await expect(page.locator("[data-pill='t-2x'][data-lit]")).toBeEnabled();
    await expect(page.locator("[data-interaction] p[aria-live]")).toContainText("A factor of 2 still divides both 2x and 4.");
    await expect(page.locator("[data-result='shown']")).toContainText("It simplifies to");
    expect(await reddish(page)).toEqual([]);
    // She finishes it: the pair strikes, the lit set clears, and the line says so.
    await page.locator("[data-pill='t-2x']").click();
    await page.locator("[data-pill='b-4']").click();
    await expect(page.locator("[data-pill][data-lit]")).toHaveCount(0);
    await expect(page.locator("[data-pill][data-struck]")).toHaveCount(4);
    await expect(page.locator("[data-result='done']")).toBeVisible();
    await expect(page.locator("[data-interaction] p[aria-live]")).toContainText("Finished");
    await expect(control(page)).toHaveText("Continue");
  });

  for (const scheme of ["light", "dark"] as const) {
    test(`the pills' edges hold 3:1 against their stage, ${scheme} (WCAG 1.4.11; audit CD-05)`, async ({ page }) => {
      await page.emulateMedia({ colorScheme: scheme });
      for (const [i, size] of [PHONE, DESKTOP].entries()) {
        await page.setViewportSize(size);
        // Each size starts the deck afresh: the first run's place would otherwise open it at the figure.
        if (i > 0) await page.evaluate(() => localStorage.clear());
        await openSlides(page);
        await walkTo(page, "interaction");
        const ratios = await page.evaluate(() => {
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
          const ratio = (a: string, b: string) => {
            const [x, y] = [lum(rgb(a)), lum(rgb(b))];
            return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05);
          };
          const stage = getComputedStyle(document.querySelector("[data-interaction] [data-stage]")!).backgroundColor;
          return Array.from(document.querySelectorAll<HTMLElement>("[data-pill]")).map((p) => {
            const cs = getComputedStyle(p);
            return Math.min(ratio(cs.borderTopColor, stage), ratio(cs.borderTopColor, cs.backgroundColor));
          });
        });
        expect(ratios).toHaveLength(5);
        for (const r of ratios) expect(r, `${scheme} at ${size.width}`).toBeGreaterThanOrEqual(3);
      }
    });
  }

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

  // g2, "In (x + 4)/x, what cancels?": each wrong option draws its own consequence at x = 1 (audit CT-19, CQ-03), and the
  // two labels under the tiles never meet, on the phone or at the verdict's full 356 px (audit CT-11, CD-02, LD-10).
  for (const [option, value] of [
    ["The $x$, leaving $4$", "4"],
    ["The $x$ and the $4$", "1"],
  ] as const) {
    test(`g2 answered "${option}" draws x = 1 giving 5 against her ${value}, with labels that never overlap`, async ({ page }) => {
      for (const [i, size] of [PHONE, DESKTOP].entries()) {
        await page.setViewportSize(size);
        if (i > 0) await page.evaluate(() => localStorage.clear());
        await openSlides(page);
        await control(page).click();
        await walkTo(page, "gate", "g2");
        await answerChoice(page, option);
        const figure = page.locator("[data-reaction='afs.substitute']");
        await expect(figure).toBeVisible();
        await expect(figure.locator("[data-value]")).toHaveText(value);
        await expect(figure).toHaveAttribute("aria-label", new RegExp(`your cancelled version is ${value}\\.`));
        const boxes = await figure.evaluate((svg) =>
          ["fraction", "hers"].map((k) => {
            const r = svg.querySelector(`[data-label='${k}']`)!.getBoundingClientRect();
            return { left: r.left, right: r.right, top: r.top, bottom: r.bottom };
          }),
        );
        const [fraction, hers] = boxes;
        const apart = fraction.right <= hers.left || hers.right <= fraction.left || fraction.bottom <= hers.top || hers.bottom <= fraction.top;
        expect(apart, `labels at ${size.width}: ${JSON.stringify(boxes)}`).toBe(true);
        expect(await smallestDrawnLabel(page)).toBeGreaterThanOrEqual(13);
      }
    });
  }
});

/**
 * The owner's trial (24 Sep 2026): "a purple rectangular line around the texts that appears but disappears when I click
 * on something". Slides puts the keyboard on each new card's landing place (the title, else the card's section) so a
 * screen reader reads it; the focus contract (src/components/shell/input-modality.ts, html[data-input], app/globals.css)
 * keeps the ring off it unless the keyboard brought her there.
 */
test.describe("Slides: the focus ring follows the keyboard, not the page", () => {
  const ring = (el: ReturnType<Page["locator"]>) =>
    el.evaluate((node) => {
      const cs = getComputedStyle(node);
      return { style: cs.outlineStyle, width: cs.outlineWidth };
    });

  test("no ring on load, after a click on Continue or after the arrow keys; the ring after Enter on the control", async ({ page }) => {
    await page.setViewportSize(DESKTOP);
    await openSlides(page);
    const html = page.locator("html");
    await expect(html).toHaveAttribute("data-input", "pointer");
    // On load the title has the keyboard (a screen reader starts there), with no ring (audit CD-03).
    const h1 = page.locator("[data-card='title'] h1");
    await expect(h1).toBeFocused();
    expect((await ring(h1)).style).toBe("none");

    // A click on Continue: the new card's title takes the keyboard, quietly.
    await control(page).click();
    const title = page.locator("[data-card-title]");
    await expect(title).toBeFocused();
    expect((await ring(title)).style).toBe("none");

    // The arrows turn the cards and are reading keys on a landing place: still pointer, still no ring, and on a card with
    // no title it is the card's section that is focused, not the whole body (audit CQ-13).
    await page.keyboard.press("ArrowRight");
    await expect(count(page)).toHaveText(`3 of ${DECK}`);
    const section = page.locator("[data-card-section]");
    await expect(section).toBeFocused();
    await expect(html).toHaveAttribute("data-input", "pointer");
    expect((await ring(section)).style).toBe("none");

    // Enter on the control, a button, is the keyboard: the next landing place wears the accent ring.
    await page.keyboard.press("ArrowLeft");
    await expect(count(page)).toHaveText(`2 of ${DECK}`);
    await control(page).focus();
    await page.keyboard.press("Enter");
    await expect(count(page)).toHaveText(`3 of ${DECK}`);
    await expect(html).toHaveAttribute("data-input", "keyboard");
    await expect(section).toBeFocused();
    expect(await ring(section)).toMatchObject({ style: "solid", width: "2px" });
  });
});

test.describe("Slides: moving on", () => {
  test("a swipe moves on and back on a touch phone", async ({ page, isMobile }) => {
    test.skip(!isMobile, "the swipe is a phone gesture");
    await openSlides(page);
    await control(page).click();
    await expect(count(page)).toHaveText(`2 of ${DECK}`);
    const box = (await card(page).boundingBox())!;
    const y = box.y + box.height / 2;
    // A finger, not a mouse: only a touch or a pen swipes (src/lib/slides/gesture.ts).
    await touchSwipe(page, box.x + box.width - 40, box.x + 40, y);
    await expect(count(page)).toHaveText(`3 of ${DECK}`);
    await touchSwipe(page, box.x + 40, box.x + box.width - 40, y);
    await expect(count(page)).toHaveText(`2 of ${DECK}`);
  });

  test("a mouse drag that selects a sentence keeps the card and the selection (audit CQ-05)", async ({ page }) => {
    await page.setViewportSize(DESKTOP);
    await openSlides(page);
    await control(page).click();
    await expect(count(page)).toHaveText(`2 of ${DECK}`);
    const prose = page.locator("[data-card='idea'] p").first();
    const box = (await prose.boundingBox())!;
    for (const [from, to] of [
      [box.x + 4, box.x + Math.min(250, box.width - 8)],
      [box.x + Math.min(250, box.width - 8), box.x + 4],
    ]) {
      await page.mouse.move(from, box.y + 12);
      await page.mouse.down();
      await page.mouse.move(to, box.y + 12, { steps: 10 });
      await page.mouse.up();
      await expect(count(page)).toHaveText(`2 of ${DECK}`);
      expect((await page.evaluate(() => window.getSelection()?.toString() ?? "")).trim().length, "the words she selected are still selected").toBeGreaterThan(3);
    }
  });

  test("on a gate the arrows move the choice and Enter checks it (audit CQ-12)", async ({ page }) => {
    await page.setViewportSize(DESKTOP);
    await openSlides(page);
    await control(page).click();
    await control(page).click();
    await expect(page.locator("[data-gate='g1']")).toBeVisible();
    const radios = page.locator("[data-gate] [role='radio']");
    await radios.nth(0).click();
    await expect(radios.nth(0)).toHaveAttribute("aria-checked", "true");
    await page.keyboard.press("ArrowDown");
    await expect(radios.nth(1)).toHaveAttribute("aria-checked", "true");
    await expect(radios.nth(1)).toBeFocused();
    await page.keyboard.press("ArrowUp");
    await expect(radios.nth(0)).toHaveAttribute("aria-checked", "true");
    await expect(count(page)).toHaveText(`3 of ${DECK}`);
    await page.keyboard.press("Enter");
    await expect(page.locator("[data-verdict]")).toBeVisible();
    await expect(control(page)).toHaveText("Continue");
    await expect(page.locator("[data-hints]")).toContainText("continue");
  });

  test("the Next button at the screen's edge and the arrow keys move on, on the desktop", async ({ page }) => {
    await page.setViewportSize(DESKTOP);
    await openSlides(page);
    await page.keyboard.press("Enter");
    await expect(count(page)).toHaveText(`2 of ${DECK}`);
    await page.locator("[data-next]").click();
    await expect(count(page)).toHaveText(`3 of ${DECK}`);
    await expect(page.locator("[data-next]")).toBeDisabled(); // a gate: locked
    await page.locator("[data-prev]").click();
    await expect(count(page)).toHaveText(`2 of ${DECK}`);
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
    await expect(page.locator("[data-card='close']")).toContainText("7 checks answered · the one that came back held · 2 recall cards graded");
    await expect(page.locator("[data-companion-figure='close']")).toHaveCount(1);
    await expect(page.locator("[data-companion='session-close']")).toBeVisible();
    await expect(page.locator("[data-companion='session-close']")).not.toContainText("!");
    expect(await page.locator("[data-card='close'] :is(input, textarea, [role='radio'])").count()).toBe(0);
    await expect(page.locator("[data-card='close']")).toContainText("What returns");
    // Every card counted, with no reason that is not one (audit CT-07, LD-05): the run's nine cards come back tonight.
    await expect(page.locator("[data-returns] li").first()).toHaveText("Tonight · 7 checks and 2 recall cards from Simplifying algebraic fractions.");
    // And so Rowan does not say there is nothing else to do (the library's own line for a night with nothing due).
    await expect(page.locator("[data-companion='session-close']")).not.toContainText("nothing else to do");
    expect(await accentControls(page)).toEqual(["Done for tonight"]);
    expect(await animations(page)).toBe(0);
    // Practise this topic goes to the topic page's Practice stage (the anchor the topic page scrolls to once it renders).
    await expect(page.locator("[data-exit='practise']")).toHaveAttribute("href", `${TOPIC}#practice`);

    // The records: seven gates once each with Read's ids, the miss on g2 kept as the record, two prompts.
    const rows = await attempts(page);
    const gateRows = rows.filter((r) => r.itemId.includes("#gate:"));
    expect(gateRows.map((r) => r.itemId.split("#gate:")[1]).sort()).toEqual(["g1", "g2", "g3", "g4", "g5", "g6", "g7"]);
    expect(gateRows.find((r) => r.itemId.endsWith("g2"))?.correct).toBe(false);
    expect(rows.filter((r) => r.itemKind === "prompt")).toHaveLength(2);

    // Done for tonight goes home; the run is finished, so the slides start afresh next time.
    await page.getByRole("link", { name: /^Done for tonight$/ }).click();
    await expect(page.getByRole("heading", { level: 1, name: "Today" })).toBeVisible();
  });

  test("a close where Rowan is silent draws no empty scene, and Practise this topic lands on Practice", async ({ page }) => {
    // A device that has not been through first run: the companion says nothing, so there is no hare and no hill, and
    // no evening-coloured block where they would have stood (audit CQ-09).
    await page.setViewportSize(DESKTOP);
    await openSlides(page);
    await control(page).click();
    await walkToClose(page);
    await expect(page.locator("[data-card='close']")).toBeVisible();
    await expect(page.locator("[data-companion='session-close']")).toHaveCount(0);
    await expect(page.locator("[data-scene]")).toHaveCount(0);
    await expect(page.locator("[data-companion-figure]")).toHaveCount(0);
    // The exit lands on the Practice stage, in view (audit LD-02, CQ-06; the topic page scrolls to #practice once the stage
    // has rendered, which is the topic agent's half).
    await page.locator("[data-exit='practise']").click();
    await expect(page).toHaveURL(new RegExp(`${TOPIC.replace(/\//g, "\\/")}#practice$`));
    const practice = page.locator("#practice");
    await expect(practice).toBeAttached();
    await expect
      .poll(async () => practice.evaluate((el) => Math.round(el.getBoundingClientRect().top)), { timeout: 10_000 })
      .toBeLessThan(200);
  });

  test("on a phone the verdict's last line is brought into view after Check, not left under the foot (audit LD-14)", async ({ page }) => {
    await page.setViewportSize(PHONE);
    await openSlides(page);
    await control(page).click();
    await walkTo(page, "gate", "g4");
    await answerChoice(page, "$\\frac{7x+10}{3x-10}$");
    await expect(page.locator("[data-verdict='miss']")).toContainText("comes back once more before the recap");
    await expect
      .poll(() =>
        page.evaluate(() => {
          const verdict = document.querySelector("[data-verdict]")!.getBoundingClientRect();
          const body = document.querySelector("[data-card]")!.getBoundingClientRect();
          return Math.round(body.bottom - verdict.bottom);
        }),
      )
      .toBeGreaterThanOrEqual(0);
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
      await expect(count(page)).toHaveText(`3 of ${DECK}`);
      await page.locator("[data-exit]").click();
      await expect(page.locator("a[data-way='slides']").first()).toHaveText(`Continue the slides · card 3 of ${DECK}`);
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
