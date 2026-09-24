import { expect, test, type Locator, type Page } from "@playwright/test";
import { completeFirstRun, tile } from "./helpers";

/**
 * Rowan, wired into its surfaces (docs/plan/companion/integration-contract.md).
 *
 * What is checked, and why each is here:
 * - on a fresh install nothing is spent before first run, first run carries no Letter, and the first Today
 *   offers it (decision 3, 22 Sep 2026);
 * - the Letter arrives once and never after it is read, with its figure slot and plain words;
 * - it goes first for one day only: the day after, it waits sealed under Start while Rowan speaks on Today
 *   and in a new topic's hero (the lead's ruling, 23 Sep);
 * - Today speaks again on the second evening (the platform audit's must-fix 2, 23 Sep);
 * - the hare stands in its places at the design canvas's sizes (decision 8, the art direction v2 §7): posed on
 *   the Tonight tile beside the arrival line (140 px, 200 once the line has room), holding the Letter (100, 110 on
 *   the desktop), listening in a new topic's hero (72, 80 from the tablet width), on the hill by the cairn at the
 *   top of the close card (160 px or more); the day's state late at night; and it holds still under reduced
 *   motion (no animation on any of those screens);
 * - nothing signed, and no figure, is ever inside a container that holds an answer field;
 * - everything she typed can be deleted, and Settings explains plain words in her words.
 *
 * The helpers read and write the app's own IndexedDB directly, because some states cannot be reached through
 * the interface: an install past first run that has not read the Letter, a memory list with a note in it, and
 * the next day (the record of what was said, and of when the Letter was first offered, moved back one day,
 * which is what the clock moving forward one day does to them).
 */

/** The Dexie database in src/lib/db/db.ts. Version 4 carries companionNotes and companionState. */
const DB_NAME = "ccea-study";

/** An arrival line: Today's slot says `evening` late at night and `today-open` otherwise. */
const ARRIVAL = '[data-companion="today-open"], [data-companion="evening"]';

/** Writes one row into a store of the live database. The page must already have opened it. */
async function seedRow(page: Page, store: string, row: Record<string, unknown>): Promise<void> {
  const failure = await page.evaluate(
    ({ name, store, row }) =>
      new Promise<string | null>((resolve) => {
        const open = indexedDB.open(name);
        open.onerror = () => resolve(`open: ${open.error?.message ?? "failed"}`);
        open.onsuccess = () => {
          const db = open.result;
          try {
            const tx = db.transaction(store, "readwrite");
            tx.objectStore(store).put(row);
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
            resolve(`write: ${String(e)}`);
          }
        };
      }),
    { name: DB_NAME, store, row },
  );
  expect(failure, `seeding ${store}`).toBeNull();
}

/** Drops the companion's state row, which puts the install back to "the Letter is owed". */
async function forgetCompanionState(page: Page): Promise<void> {
  const failure = await page.evaluate(
    ({ name }) =>
      new Promise<string | null>((resolve) => {
        const open = indexedDB.open(name);
        open.onerror = () => resolve(`open: ${open.error?.message ?? "failed"}`);
        open.onsuccess = () => {
          const db = open.result;
          try {
            const tx = db.transaction("companionState", "readwrite");
            tx.objectStore("companionState").delete("state");
            tx.oncomplete = () => {
              db.close();
              resolve(null);
            };
            tx.onerror = () => {
              db.close();
              resolve(`delete: ${tx.error?.message ?? "failed"}`);
            };
          } catch (e) {
            db.close();
            resolve(`delete: ${String(e)}`);
          }
        };
      }),
    { name: DB_NAME },
  );
  expect(failure, "clearing companionState").toBeNull();
}

interface StoredState {
  letterSeen?: boolean;
  letterOfferedOn?: string | null;
  plainModeUntil?: string | null;
  recent?: Array<{ id: string; at: string }>;
  silenced?: boolean;
  figure?: boolean;
}

/** The companion's state row, read back from the database rather than inferred from the page. */
async function readState(page: Page): Promise<StoredState | null> {
  return page.evaluate(
    ({ name }) =>
      new Promise<StoredState | null>((resolve) => {
        const open = indexedDB.open(name);
        open.onerror = () => resolve(null);
        open.onsuccess = () => {
          const db = open.result;
          try {
            const req = db.transaction("companionState", "readonly").objectStore("companionState").get("state");
            req.onsuccess = () => {
              db.close();
              resolve((req.result as StoredState | undefined) ?? null);
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
    { name: DB_NAME },
  );
}

async function letterSeen(page: Page): Promise<boolean> {
  return (await readState(page))?.letterSeen === true;
}

/**
 * The next day, as the companion sees it: every line said moves back one day, and a Letter first offered
 * today becomes one first offered yesterday. Nothing else about the install changes.
 */
async function moveToNextDay(page: Page): Promise<void> {
  const failure = await page.evaluate(
    ({ name }) =>
      new Promise<string | null>((resolve) => {
        const day = 86_400_000;
        const iso = (d: Date) =>
          `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
        const open = indexedDB.open(name);
        open.onerror = () => resolve("open failed");
        open.onsuccess = () => {
          const db = open.result;
          const tx = db.transaction("companionState", "readwrite");
          const store = tx.objectStore("companionState");
          const get = store.get("state");
          get.onsuccess = () => {
            const s = get.result as { letterOfferedOn?: string | null; recent?: Array<{ id: string; at: string }> } | undefined;
            if (!s) return;
            if (s.letterOfferedOn) s.letterOfferedOn = iso(new Date(Date.now() - day));
            s.recent = (s.recent ?? []).map((r) => ({ id: r.id, at: new Date(Date.parse(r.at) - day).toISOString() }));
            store.put(s);
          };
          tx.oncomplete = () => {
            db.close();
            resolve(null);
          };
          tx.onerror = () => {
            db.close();
            resolve(`write: ${tx.error?.message ?? "failed"}`);
          };
        };
      }),
    { name: DB_NAME },
  );
  expect(failure, "moving to the next day").toBeNull();
}

/** A state row for an install whose Letter was read yesterday, with nothing said yet. */
async function seedLetterRead(page: Page, plainModeUntil: string | null = null): Promise<void> {
  const yesterday = await page.evaluate(() => {
    const d = new Date(Date.now() - 86_400_000);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  });
  await seedRow(page, "companionState", {
    id: "state",
    plainModeUntil,
    letterSeen: true,
    letterOfferedOn: yesterday,
    name: null,
    silenced: false,
    recent: [],
    updatedAt: new Date(),
  });
}

/**
 * Opens the app once so Dexie creates the database, then marks first run as done without
 * walking it, so the Letter is still owed on Today (the upgrade case, binding condition 4).
 */
async function installPastFirstRun(page: Page): Promise<void> {
  await page.goto("/");
  // A device that has never opened the app is sent to the welcome note; the database exists by then.
  await expect(page).toHaveURL(/\/welcome\/?$/);
  await seedRow(page, "settings", { key: "firstRunDone", value: true });
  await forgetCompanionState(page);
}

/** A published topic she has never opened: the owner's exemplar, whose hero and gates are stable. */
const NEW_TOPIC = "/learn/further-maths/FM1/algebraic-fractions-simplify/";

/** Resource 404s on the static server are not the app talking. Everything else counts. */
function isPageProblem(text: string): boolean {
  return !/favicon|manifest|service worker|net::ERR|Failed to load resource/i.test(text);
}

/** An answer surface: a field to type in, or options to choose from. The Slides / Read switch and the Letter's rename are not. */
const ANSWERS = 'input:not([type=hidden]):not([data-companion-control]), textarea, [role="radio"]:not([data-way]), [role="checkbox"], [role="option"], [data-plot], canvas';

/**
 * The containment rule: a signed line or a figure is never a descendant of a section, card or form that holds an
 * answer field, and it precedes the first answer field in document order.
 */
async function misplacedCompanions(page: Page): Promise<string[]> {
  return page.evaluate((fields) => {
    const first = document.querySelector(`#main :is(${fields})`);
    const out: string[] = [];
    for (const el of document.querySelectorAll("[data-companion], [data-companion-figure]")) {
      const what = el.getAttribute("data-companion") ?? `figure:${el.getAttribute("data-companion-figure")}`;
      const holder = el.closest("section, form, article, [data-card]");
      if (holder && holder.querySelector(fields)) out.push(`${what} inside a container with an answer field`);
      if (first && !(el.compareDocumentPosition(first) & Node.DOCUMENT_POSITION_FOLLOWING)) out.push(`${what} after the first answer field`);
    }
    return out;
  }, ANSWERS);
}

/** The rendered box of a figure slot, in CSS pixels. */
async function box(locator: Locator): Promise<{ x: number; y: number; width: number; height: number }> {
  const b = await locator.boundingBox();
  expect(b, "the figure has a box on screen").not.toBeNull();
  return b!;
}

/** The suite runs with reduced motion, so the hare's one arrival must never have been created: nothing moves. */
async function expectStill(page: Page, where: string): Promise<void> {
  expect(await page.evaluate(() => document.getAnimations().length), `animations on ${where} under reduced motion`).toBe(0);
}

/**
 * One review card due now whose item the content no longer ships: the inbox offers "Skip", and skipping it is the
 * shortest honest way to the review's close card. The FSRS state is a new card's, as ts-fsrs creates it.
 */
async function seedWithdrawnCard(page: Page): Promise<void> {
  const due = await page.evaluate(() => new Date(Date.now() - 60_000).toISOString());
  await seedRow(page, "cards", {
    id: "further-maths:algebraic-fractions-simplify:e2e-withdrawn",
    subject: "further-maths",
    topicSlug: "algebraic-fractions-simplify",
    card: { due: new Date(due), stability: 0, difficulty: 0, elapsed_days: 0, scheduled_days: 0, learning_steps: 0, reps: 0, lapses: 0, state: 0 },
    due: new Date(due),
    createdAt: new Date(Date.parse(due) - 86_400_000),
  });
}

test.describe("Rowan", () => {
  test("a fresh install: nothing is spent before first run, first run has no Letter, the first Today offers it", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveURL(/\/welcome\/?$/);
    // Today rendered for a moment on its way here. Nothing may have been said, or recorded as said, there.
    expect((await readState(page))?.recent ?? []).toEqual([]);

    await page.getByRole("button", { name: /^Continue$/ }).click();
    const name = page.getByLabel(/what should it call you/i);
    await expect(name).toBeVisible();
    // One name field on this screen: hers. Rowan's Letter is not part of first run.
    await expect(page.locator("[data-companion], [data-companion-figure]")).toHaveCount(0);
    await name.fill("Test");
    await page.getByRole("button", { name: /^Begin$/ }).click();
    await page.getByRole("button", { name: /^Skip to Today$/ }).click();
    await expect(page.getByRole("heading", { level: 1, name: "Today" })).toBeVisible();

    const letter = page.locator('[data-companion="first-letter"]');
    await expect(letter).toBeVisible();
    await expect(letter).toContainText("A note to start with");
    await expect(letter).toContainText("You do the maths.");
    await expect(letter).not.toContainText(/cairn|path/i);
    await expect(letter.locator('[data-companion-figure="letter"]')).toHaveCount(1);
    // On its first day it is the whole of Rowan on Today.
    await expect(page.locator(ARRIVAL)).toHaveCount(0);
    expect(await letterSeen(page)).toBe(false);
  });

  test("offers the Letter on Today once, and never after it is read", async ({ page }) => {
    await installPastFirstRun(page);
    await page.goto("/");
    await expect(page.getByRole("heading", { level: 1, name: "Today" })).toBeVisible();

    const letter = page.locator('[data-companion="first-letter"]');
    await expect(letter).toBeVisible();
    await expect(letter).not.toBeEmpty();
    await expect(page.locator(ARRIVAL)).toHaveCount(0);
    // A letter is read, not announced over the page.
    await expect(letter).not.toHaveAttribute("aria-live", /./);
    // The day it first reached her is recorded: it goes first on that day only.
    await expect.poll(async () => (await readState(page))?.letterOfferedOn ?? null).toMatch(/^\d{4}-\d{2}-\d{2}$/);

    await letter.getByRole("button", { name: /^Close$/ }).click();
    await expect(letter).toHaveCount(0);
    await expect.poll(() => letterSeen(page), { message: "the Letter is recorded as read" }).toBe(true);

    // Not on this visit, and not on the next one.
    await page.reload();
    await expect(page.getByRole("heading", { level: 1, name: "Today" })).toBeVisible();
    await expect(page.locator('[data-companion="first-letter"]')).toHaveCount(0);
  });

  test("the Letter goes first for one day: the day after, it waits sealed and Rowan speaks on Today and in the hero", async ({ page }) => {
    await installPastFirstRun(page);
    await page.goto("/");
    await expect(page.locator('[data-companion="first-letter"]')).toBeVisible();
    await expect.poll(async () => (await readState(page))?.letterOfferedOn ?? null).toMatch(/^\d{4}-\d{2}-\d{2}$/);

    await moveToNextDay(page);
    await page.goto("/");
    await expect(page.getByRole("heading", { level: 1, name: "Today" })).toBeVisible();

    // Rowan's arrival line is back in the Tonight tile, with its figure slot.
    const arrival = tile(page, "Tonight").locator(ARRIVAL);
    await expect(arrival).toHaveCount(1);
    await expect(arrival.locator('[data-companion-figure="arrival"]')).toHaveCount(1);
    await expect(arrival).not.toContainText("!");

    // The Letter waits in one line, a real button, until she opens it; opening it is reading it.
    const sealed = page.locator('[data-companion="first-letter"] button[aria-expanded="false"]');
    await expect(sealed).toBeVisible();
    await expect(sealed).toContainText(/A short letter from Rowan/);
    await sealed.click();
    await expect(page.locator('[data-companion="first-letter"]')).toContainText("You do the maths.");
    await expect.poll(() => letterSeen(page)).toBe(true);

    // A topic she has never opened says something on the first visit, with the hare listening beside it.
    await page.goto(NEW_TOPIC);
    const hero = page.locator('header [data-companion="topic-open"]');
    await expect(hero).toBeVisible();
    await expect(hero).not.toBeEmpty();
    await expect(hero.locator('[data-companion-figure="topic"]')).toHaveCount(1);
  });

  test("says exactly one thing on Today, speaks again on the second evening, and logs nothing", async ({ page }) => {
    const problems: string[] = [];
    page.on("pageerror", (e) => problems.push(`pageerror: ${e.message}`));
    page.on("console", (m) => {
      if (m.type() === "error" && isPageProblem(m.text())) problems.push(`console: ${m.text()}`);
    });

    await installPastFirstRun(page);
    // Past first run and the Letter read yesterday: the ordinary arrival line is what is left.
    await seedLetterRead(page);

    await page.goto("/");
    await expect(page.getByRole("heading", { level: 1, name: "Today" })).toBeVisible();
    await expect(page.locator('[data-companion="first-letter"]')).toHaveCount(0);

    const arrival = tile(page, "Tonight").locator(ARRIVAL);
    await expect(arrival).toHaveCount(1);
    await expect(arrival).toBeVisible();
    await expect(arrival).not.toHaveAttribute("aria-live", /./);
    await expect(arrival).not.toContainText("!");
    // Nothing else on Today speaks.
    await expect(page.locator("[data-companion]")).toHaveCount(1);
    await expect.poll(async () => ((await readState(page))?.recent ?? []).length, { message: "the line is recorded" }).toBe(1);

    // The second evening (the audit's must-fix 2): Today speaks again.
    await moveToNextDay(page);
    await page.reload();
    await expect(page.getByRole("heading", { level: 1, name: "Today" })).toBeVisible();
    await expect(tile(page, "Tonight").locator(ARRIVAL)).toHaveCount(1);

    expect(problems, problems.join("\n")).toEqual([]);
  });

  test("says nothing signed, and draws no figure, inside anything that holds an answer field", async ({ page }) => {
    await completeFirstRun(page);
    await seedLetterRead(page);

    await page.goto(NEW_TOPIC);
    // The hero speaks on a first visit, so the containment check below has a line to hold to account.
    await expect(page.locator('header [data-companion="topic-open"]')).toBeVisible();

    // An answer surface is up: a field to type in, or options to choose from.
    await expect(page.locator(`#main :is(${ANSWERS})`).first()).toBeAttached();
    // The hero's hare is on the page too, so the rule below holds it to account as well as the line.
    await expect(page.locator('header [data-companion-figure="topic"]')).toHaveCount(1);

    // Nothing signed may render inside the work: a signed line or a figure is never a descendant of a section,
    // card or form that holds an answer field, and it precedes the first answer field in document order (the
    // hero's topic-open line sits above the lesson). The Slides / Read switch is a choice of how to read, not an
    // answer, so `[data-way]` is not an answer field; nor is the Letter's own rename field.
    expect(await misplacedCompanions(page)).toEqual([]);
    // And nothing unsigned carries the attribute either: the support line is prose in the note's register.
    await expect(page.locator('[data-companion="support"]')).toHaveCount(0);
  });

  test("the hare stands in its places at the canvas's sizes, and holds still under reduced motion", async ({ page }) => {
    const width = page.viewportSize()?.width ?? 0;
    await installPastFirstRun(page);

    // The Letter's first day: the hare holds it beside the note, 100 px, 110 on the desktop.
    await page.goto("/");
    const letter = page.locator('[data-companion="first-letter"]');
    await expect(letter).toBeVisible();
    const holding = letter.locator('[data-companion-figure="letter"]');
    await expect(holding).toHaveAttribute("data-figure-state", "letter");
    expect((await box(holding)).width).toBe(width >= 1024 ? 110 : 100);
    await expectStill(page, "Today with the Letter");
    await expect.poll(async () => (await readState(page))?.letterOfferedOn ?? null).toMatch(/^\d{4}-\d{2}-\d{2}$/);

    // The next day, unread: the posed hare on the Tonight tile beside the arrival line, standing on the tile's floor,
    // 140 px, or 200 once the line's own block is 512 px wide; the sealed Letter keeps Rowan's 24 px mark.
    await moveToNextDay(page);
    await page.goto("/");
    const tonight = tile(page, "Tonight");
    const arrival = tonight.locator(ARRIVAL);
    const posed = arrival.locator('[data-companion-figure="arrival"]');
    await expect(posed).toHaveCount(1);
    await expect(posed).toHaveAttribute("data-figure-state", /^(arrival|evening)$/);
    const lineBlock = await box(arrival);
    const hare = await box(posed);
    expect(hare.width).toBe(lineBlock.width >= 512 ? 200 : 140);
    expect(hare.height).toBe(hare.width);
    const words = await box(arrival.locator("p"));
    expect(words.x + words.width, "the words stay beside the hare").toBeLessThanOrEqual(hare.x + 0.5);
    const start = await box(tonight.getByRole("link", { name: /^(Start|Learn)/ }));
    expect(hare.y + hare.height, "the hare stands above the tile's one button").toBeLessThanOrEqual(start.y + 0.5);
    const mark = page.locator('[data-companion="first-letter"] [data-companion-figure="letter"]');
    expect((await box(mark)).width).toBe(24);
    expect(await misplacedCompanions(page)).toEqual([]);
    await expectStill(page, "Today");

    // A topic she has never opened: the hare listening beside the hero's line, 72 px, 80 from the tablet width.
    await page.goto(NEW_TOPIC);
    const listening = page.locator('header [data-companion="topic-open"] [data-companion-figure="topic"]');
    await expect(listening).toHaveAttribute("data-figure-state", "listening");
    expect((await box(listening)).width).toBe(width >= 768 ? 80 : 72);
    await expectStill(page, "the topic hero");

    // The close: the review's close card opens on the scene, the hare on the hill by the cairn, above the card's
    // title and Rowan's words. The phone's scene is 342 by 200 units in a 342:230 box, the hare 156 units of it.
    await seedWithdrawnCard(page);
    await page.goto("/review/");
    await page.getByRole("button", { name: /^Skip$/ }).click();
    const scene = page.locator('[data-companion-figure="close"]');
    await expect(scene).toHaveCount(1);
    await expect(scene).toHaveAttribute("data-figure-state", /^(arrival|stone-placed)$/);
    await expect(scene.locator('svg[viewBox="0 0 342 200"] > svg[viewBox="0 0 160 160"][width="156"]')).toHaveCount(1);
    const hill = await box(scene);
    expect(hill.height * (156 / 200), "the hare stands 160 px or more on the hill").toBeGreaterThanOrEqual(160);
    const order = await page.evaluate(() => {
      const s = document.querySelector('[data-companion-figure="close"]');
      const title = [...document.querySelectorAll("p")].find((p) => p.textContent?.trim() === "Review complete");
      const words = document.querySelector('[data-companion="session-close"]');
      const before = (a: Element | null | undefined, b: Element | null | undefined) => !!a && !!b && !!(a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING);
      return { sceneBeforeTitle: before(s, title), titleBeforeWords: words ? before(title, words) : true };
    });
    expect(order).toEqual({ sceneBeforeTitle: true, titleBeforeWords: true });
    expect(await misplacedCompanions(page)).toEqual([]);
    await expectStill(page, "the close card");
  });

  test("late at night the Tonight tile's hare takes the evening pose, under its own moon", async ({ page }) => {
    // The clock only decides which sentence is true (binding condition 2): the evening line, and the pose drawn for it.
    await page.clock.setFixedTime(new Date("2026-09-24T23:10:00"));
    await installPastFirstRun(page);
    await seedLetterRead(page);
    await page.goto("/");
    const evening = tile(page, "Tonight").locator('[data-companion="evening"]');
    await expect(evening).toHaveCount(1);
    const hare = evening.locator('[data-companion-figure="arrival"]');
    await expect(hare).toHaveAttribute("data-figure-state", "evening");
    await expect(hare.locator('path[d^="M130 15 a11 11"]')).toHaveCount(1);
    await expectStill(page, "Today late at night");
  });

  test("Words only keeps every line and draws nothing; Quiet says nothing and draws nothing; Full brings the hare back", async ({ page }) => {
    // Rule 2 (art direction v2, appendix): Rowan "can be reduced to its voice or silenced at no cost". One control in
    // Settings, obeyed by Today, the topic hero and the Map alike, and nothing of hers changes with it.
    await installPastFirstRun(page);
    await seedLetterRead(page);

    await page.goto("/settings/");
    const presence = tile(page, "How Rowan speaks").getByRole("radiogroup", { name: /What you see of Rowan/ });
    await expect(presence).toBeVisible();
    await expect(presence.getByRole("radio", { name: /^Full/ })).toBeChecked();

    // Words only: the lines stay, in their places, and every drawing goes, the Map's mark included.
    await presence.getByRole("radio", { name: /^Words only/ }).check();
    await expect.poll(async () => (await readState(page))?.figure).toBe(false);
    await page.goto("/");
    const tonight = tile(page, "Tonight");
    await expect(tonight.locator(ARRIVAL)).toHaveCount(1);
    await expect(tonight.locator(ARRIVAL)).not.toBeEmpty();
    await expect(page.locator("[data-companion-figure]")).toHaveCount(0);
    await expect(tonight.locator("svg")).toHaveCount(0);
    await page.goto(NEW_TOPIC);
    await expect(page.locator('header [data-companion="topic-open"]')).toBeVisible();
    await expect(page.locator("[data-companion-figure]")).toHaveCount(0);
    await page.goto("/map/");
    await expect(page.getByRole("heading", { level: 2, name: /Your journey/ })).toBeVisible();
    await expect(page.locator("#journey-heading svg")).toHaveCount(0);

    // Quiet: nothing said and nothing drawn; the plan is still on the page in the product's own words.
    await page.goto("/settings/");
    await presence.getByRole("radio", { name: /^Quiet/ }).check();
    await expect.poll(async () => (await readState(page))?.silenced).toBe(true);
    await page.goto("/");
    await expect(tile(page, "Tonight")).toBeVisible();
    await expect(page.locator("[data-companion], [data-companion-figure]")).toHaveCount(0);
    await expect(page.locator('[data-row="Next paper"]')).toBeVisible();
    await page.goto(NEW_TOPIC);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await expect(page.locator("[data-companion], [data-companion-figure]")).toHaveCount(0);

    // Full again: the hare is back beside the arrival line, at no cost to anything else.
    await page.goto("/settings/");
    await presence.getByRole("radio", { name: /^Full/ }).check();
    await expect.poll(async () => {
      const s = await readState(page);
      return s ? `${s.silenced}/${s.figure}` : "no state row";
    }).toBe("false/true");
    await page.goto("/");
    await expect(tile(page, "Tonight").locator(`${ARRIVAL} [data-companion-figure="arrival"]`)).toHaveCount(1);
  });

  test("shows what it remembers in Settings, forgets it on request, and explains plain words", async ({ page }) => {
    await installPastFirstRun(page);
    await seedRow(page, "companionNotes", {
      at: new Date(),
      kind: "cairn-note",
      text: "Read the diagram before the numbers",
      source: "her",
    });

    await page.goto("/settings/");
    await expect(page.getByRole("heading", { level: 1, name: "Settings" })).toBeVisible();

    const memory = tile(page, "What Rowan remembers");
    await expect(memory).toBeVisible();
    await expect(memory).toContainText("Read the diagram before the numbers");

    // Plain words, in her words: until when, what changes then, and the two choices from here.
    const voice = tile(page, "How Rowan speaks");
    await expect(voice).toBeVisible();
    const plain = voice.getByTestId("plain-words");
    await expect(plain).toContainText(/Plain words until [A-Z][a-z]+day \d{1,2} [A-Z][a-z]+\. From [A-Z][a-z]+day \d{1,2} [A-Z][a-z]+, Rowan talks in its own voice/);
    await expect(plain).toContainText("leaves out the hills, paths and cairns");
    await expect(plain.getByRole("button", { name: /^Keep plain words$/ })).toBeVisible();
    await plain.getByRole("button", { name: /^Use Rowan’s own voice now$/ }).click();
    await expect(plain).toContainText("Rowan’s own voice, as you chose.");
    await expect(plain.getByRole("button", { name: /^Go back to plain words$/ })).toBeVisible();
    await expect
      .poll(async () => {
        const state = await readState(page);
        return state ? state.plainModeUntil : "no state row";
      })
      .toBeNull();

    await memory.getByRole("button", { name: /^Forget everything$/ }).click();
    await memory.getByRole("button", { name: /^Yes, forget everything$/ }).click();

    await expect(memory).not.toContainText("Read the diagram before the numbers");
    await expect(memory).toContainText(/Nothing you have written/i);

    // Emptied, not hidden: the list is always reachable and says so when it is empty.
    await page.reload();
    await expect(tile(page, "What Rowan remembers")).toContainText(/Nothing you have written/i);
  });
});
