import { expect, test, type Page } from "@playwright/test";

/**
 * Slides on the trial topic (TRIAL-BRIEF.md, slides row; docs/design/2026-09-23-art-direction-v2.md §11; benchmarks
 * page 4; lesson structure v3, the teach-first case §11 with the owner's answers of 27 Sep 2026). Everything asserted
 * here is a promise the screen makes:
 *  - the title card is one screen with one accent-filled control and the honest count, on both sizes, with no app chrome;
 *  - a See it shows its steps one per Continue and its last control is "Your turn"; "Skip to your turn" only on a return
 *    visit;
 *  - a Your turn blocks the way on until it is answered, records the Read gate's id once (the first answer), and a miss
 *    is re-taught before its answer ("Not quite.", her choice, the explanation again, the figure's consequence, then
 *    "Show me the answer"); then the right option is lit in fern, hers edged in ink, nothing red; it comes back before
 *    the recap, the gate's twin on new numbers where the note carries one, unrecorded;
 *  - arrow keys, the Next button, a tap on Continue and a swipe all move on; Enter checks; the digits choose;
 *  - every drawn label renders at 13 px or more at 390 wide; nothing animates under reduced motion;
 *  - the figure she acts on strikes the shared factors and shows the simplified fraction;
 *  - at most two recall cards, optional, each with Skip;
 *  - the close carries the character and Rowan's line and holds no answer field, and its first way out is "Now the
 *    questions" (the Practice stage), its second "Done for tonight"; no Your turn carries the character;
 *  - the topic hero offers Slides on the accent on a first visit on both sizes, remembers Read when she chooses it, and
 *    says where the slides stopped when she leaves mid-run;
 *  - in dark mode the accent control keeps 4.5:1 with its text and the character keeps its own colours.
 *
 * The See it, the twin and the Skip tests read the trial note's own blocks and wait for its conversion to the See it
 * shape (docs/plan/review/2026-09-27-see-it-block-shape.md): until the note carries a `see` block (a twin), they are
 * skipped with that reason. The suite's config runs with reducedMotion "reduce", which is what the getAnimations checks
 * rely on; the steps of a See it still come one per Continue under it (src/lib/slides/run.ts).
 */

const TOPIC = "/learn/further-maths/FM1/algebraic-fractions-simplify/";
const SLIDES = `${TOPIC}slides/`;
const TOPIC_ID = "fm.u1.algebraic-fractions-simplify";
const CONTENT = "/content/further-maths/fm.u1.algebraic-fractions-simplify.json";
const DB_NAME = "ccea-study";
const PHONE = { width: 390, height: 844 };
const DESKTOP = { width: 1280, height: 800 };
/**
 * The trial deck as the content session rewrote it to teach, then show, then check (25 Sep 2026): 36 cards (the note's
 * 35 with the figure she acts on), 8 checks, two light recall cards, the video timed. Its first check, g2, is card 5,
 * after three cards that explain and work the idea. These are the trial's design; a content edit that changes them
 * must change them here too.
 */
const DECK = 36;
const CHECKS = 8;
/** Card 5: the first check, after the section's explanation and its worked lines. */
const FIRST_GATE = { id: "g2", at: 5 };
/** The figure she acts on, 3x(x + 7) over 6(x + 7)(x − 7): the shared factors as pairs of pills, top then bottom. */
const PAIRS: Array<[string, string]> = [
  ["t-b", "b-b"],
  ["t-n", "b-n"],
];

interface Gate {
  id: string;
  answer: string;
  options?: string[];
  prompt?: string;
  twin?: { prompt: string; options?: string[]; answer: string; explain: string };
}

async function gates(page: Page): Promise<Gate[]> {
  return page.evaluate(async (url) => {
    const b = (await (await fetch(url)).json()) as { noteBlocks: Array<{ type: string; id?: string; answer?: string; options?: string[]; prompt?: string; twin?: Gate["twin"] }> };
    return b.noteBlocks.filter((x) => x.type === "gate").map((g) => ({ id: g.id!, answer: g.answer!, options: g.options, prompt: g.prompt, twin: g.twin }));
  }, CONTENT);
}

/** The note's See it blocks, in order, with how many steps each shows (a named worked example's from the bundle). */
async function seeIts(page: Page): Promise<Array<{ steps: number }>> {
  return page.evaluate(async (url) => {
    const b = (await (await fetch(url)).json()) as { noteBlocks: Array<{ type: string; steps?: unknown[]; workedExample?: string }>; workedExamples: Array<{ id: string; steps: unknown[] }> };
    return b.noteBlocks
      .filter((x) => x.type === "see")
      .map((s) => ({ steps: s.steps?.length ?? b.workedExamples.find((w) => w.id === s.workedExample)?.steps.length ?? 0 }));
  }, CONTENT);
}

/** The caption of the note's hoisted figure, which the registered drawing on card 2 stands in for. */
async function heroCaption(page: Page): Promise<string> {
  return page.evaluate(async (url) => {
    const b = (await (await fetch(url)).json()) as { noteBlocks: Array<{ type: string; caption?: string }> };
    return b.noteBlocks.find((x) => x.type === "figure")?.caption ?? "";
  }, CONTENT);
}

/** Strikes every factor both lines share on the figure she acts on, pair by pair. */
async function strikeAll(page: Page): Promise<void> {
  for (const [top, bottom] of PAIRS) {
    await page.locator(`[data-pill='${top}']`).click();
    await page.locator(`[data-pill='${bottom}']`).click();
  }
}

/**
 * From the title card, Continue until the first Your turn is on screen (the cards before it explain and show the idea
 * first). On a See it a Continue shows the next step and the card stays; everywhere else it moves on one card.
 */
async function toFirstGate(page: Page, press: () => Promise<void> = () => control(page).click(), from = 1): Promise<void> {
  let n = from;
  for (let guard = 0; guard < 40 && (await page.locator(`[data-gate='${FIRST_GATE.id}']`).count()) === 0; guard += 1) {
    if ((await page.locator("[data-ghost]").count()) > 0) {
      const shown = await page.locator("[data-step]").count();
      await press();
      await expect(page.locator("[data-step]")).toHaveCount(shown + 1);
      continue;
    }
    await press();
    n += 1;
    await expect(count(page)).toHaveText(`${n} of ${DECK}`);
  }
  await expect(page.locator(`[data-gate='${FIRST_GATE.id}']`)).toBeVisible();
  expect(n, "the first Your turn's card").toBe(FIRST_GATE.at);
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
  // A hit or a retry shows its verdict; a first asking's miss is re-taught first.
  await expect(page.locator("[data-verdict], [data-reteach]").first()).toBeVisible();
}

/** After the re-teach, "Show me the answer": the answer state with its verdict. */
async function showAnswer(page: Page): Promise<void> {
  await expect(page.locator("[data-card='reteach']")).toBeVisible();
  await expect(control(page)).toHaveText("Show me the answer");
  await control(page).click();
  await expect(page.locator("[data-verdict='miss']")).toBeVisible();
}

/** What a retry card asks: the gate's twin (data-retry="twin"), whose own answer is right, or the gate again. */
async function retryAnswer(page: Page, g: Gate): Promise<string> {
  return (await page.locator("[data-gate]").getAttribute("data-retry")) === "twin" ? g.twin!.answer : g.answer;
}

/** On a See it, Continue until every step is shown (a step she types is shown rather than typed, on a walk through). */
async function stepThrough(page: Page): Promise<void> {
  for (let i = 0; i < 12; i += 1) {
    if (await page.locator("[data-show-step]").count()) {
      await page.locator("[data-show-step]").click();
      await expect(page.locator("[data-typed-result]")).toBeVisible();
      continue;
    }
    if ((await page.locator("[data-ghost]").count()) === 0) return;
    const shown = await page.locator("[data-step]").count();
    await control(page).click();
    await expect(page.locator("[data-step]")).toHaveCount(shown + 1);
  }
}

/** Walks from the current card to the close, answering every gate right except `missIds`, which are answered wrong once. */
async function walkToClose(page: Page, missIds: string[] = []): Promise<void> {
  const all = await gates(page);
  const byId = new Map(all.map((g) => [g.id, g]));
  for (let step = 0; step < 90; step += 1) {
    const kind = await card(page).getAttribute("data-card");
    if (kind === "close") return;
    if (kind === "see") {
      await stepThrough(page);
      await control(page).click();
    } else if (kind === "reteach") {
      await control(page).click();
      await expect(page.locator("[data-verdict]")).toBeVisible();
      await control(page).click();
    } else if (kind === "gate") {
      const id = (await page.locator("[data-gate]").getAttribute("data-gate"))!;
      const retry = (await page.locator("[data-gate]").getAttribute("data-retry")) !== null;
      const g = byId.get(id)!;
      const wrong = g.options?.find((o) => o !== g.answer) ?? "";
      await answerChoice(page, retry ? await retryAnswer(page, g) : missIds.includes(id) ? wrong : g.answer);
      if (!retry && missIds.includes(id)) await showAnswer(page);
      await control(page).click();
    } else if (kind === "interaction") {
      await strikeAll(page);
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
  throw new Error("the deck did not reach its close in 90 steps");
}

test.describe("Slides: the title card", () => {
  for (const size of [PHONE, DESKTOP]) {
    test(`at ${size.width} it is one screen, no chrome, one accent control, the honest count`, async ({ page }) => {
      await page.setViewportSize(size);
      await openSlides(page);
      await expect(page.locator("nav[aria-label='Primary']")).toHaveCount(0);
      await expect(page.getByRole("heading", { level: 1 })).toHaveText("Simplifying algebraic fractions");
      await expect(page.locator("[data-card='title']")).toContainText(`${DECK} cards · ${CHECKS} your turns`);
      // The video states its length (341 s), so it is counted in the minutes and listed with the counts (audit LD-03); the
      // check is named "Your turn" (the owner's answer 6), and a note with See its counts them too ("4 see its").
      const sees = (await seeIts(page)).length;
      await expect(page.locator("[data-promise]")).toHaveText(new RegExp(`^About \\d+ minutes · ${DECK} cards · ${CHECKS} your turns${sees ? ` · ${sees} see its?` : ""} · 1 video$`));
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
    // Start, then the three cards of section 1 that explain and work the idea, then its check (the owner's rule, 24 Sep).
    await toFirstGate(page);
    const at = FIRST_GATE.at;

    // Locked: the arrow key and a swipe do nothing, the control says Check and is disabled until an option is chosen.
    await page.keyboard.press("ArrowRight");
    await expect(count(page)).toHaveText(`${at} of ${DECK}`);
    await expect(control(page)).toHaveText("Check");
    await expect(control(page)).toBeDisabled();
    expect(await page.locator("[data-companion], [data-companion-figure]").count(), "nothing signed on a gate card").toBe(0);
    expect(await animations(page)).toBe(0);

    // Her answer, wrong: first the re-teach (the teach-first case §6.3), on the same card, before anything is lit.
    const first = (await gates(page)).find((g) => g.id === FIRST_GATE.id)!;
    const wrong = first.options!.find((o) => o !== first.answer)!;
    await answerChoice(page, wrong);
    const reteach = page.locator("[data-card='reteach']");
    await expect(reteach).toBeVisible();
    await expect(reteach).toContainText("Not quite.");
    await expect(page.locator("[data-her-choice]")).toBeVisible();
    await expect(page.locator("[data-outcome]")).toHaveCount(0);
    // The re-teach is part of its Your turn: the count does not move, and "Show me the answer" is the one control.
    await expect(count(page)).toHaveText(`${at} of ${DECK + 1}`);
    await expect(control(page)).toHaveText("Show me the answer");
    expect(await accentControls(page)).toEqual(["Show me the answer"]);
    expect(await reddish(page), "a colour near red on the re-teach").toEqual([]);
    await expect(page.locator("[data-reteach]")).toBeFocused();

    // Then the answer: the right option is lit (a tick), hers is edged (the circle-dash), nothing is red.
    await showAnswer(page);
    await expect(page.locator("[data-outcome='ok']")).toHaveCount(1);
    await expect(page.locator("[data-outcome='miss']")).toHaveCount(1);
    await expect(page.locator("[data-outcome='ok'] svg")).toBeVisible();
    await expect(page.locator("[data-verdict='miss'] [data-answer-line]")).toBeVisible();
    await expect(page.locator("[data-verdict='miss'] [data-diagnosis]")).toHaveAttribute("data-hers", wrong);
    await expect(page.locator("[data-verdict='miss']")).toContainText(first.twin ? "comes back before the recap on new numbers" : "comes back before the recap");
    await expect(page.locator("[data-verdict='miss']")).toBeFocused();
    expect(await reddish(page), "a colour near red on the card").toEqual([]);
    const okEdge = await page.locator("[data-outcome='ok']").evaluate((el) => getComputedStyle(el).borderTopColor);
    const missEdge = await page.locator("[data-outcome='miss']").evaluate((el) => getComputedStyle(el).borderTopColor);
    expect(okEdge).not.toBe(missEdge);
    expect(await animations(page)).toBe(0);
    // The deck grew by the retry.
    await expect(count(page)).toHaveText(`${at} of ${DECK + 1}`);
    // One attempt, the first answer, with the id Read uses; nothing for the re-teach.
    const rows = await attempts(page);
    expect(rows).toEqual([{ itemId: `${TOPIC_ID}#gate:${FIRST_GATE.id}`, itemKind: "practice", correct: false }]);

    // Back re-reads, forward returns to the answered Your turn, Continue moves on.
    await page.keyboard.press("ArrowLeft");
    await expect(count(page)).toHaveText(`${at - 1} of ${DECK + 1}`);
    await page.keyboard.press("ArrowRight");
    await expect(page.locator("[data-verdict='miss']")).toBeVisible();
    await expect(control(page)).toHaveText("Continue");
    await control(page).click();
    await expect(count(page)).toHaveText(`${at + 1} of ${DECK + 1}`);
    expect((await attempts(page)).length, "no second record").toBe(1);
  });

  test("Enter checks and the digits choose, on the desktop", async ({ page }) => {
    await page.setViewportSize(DESKTOP);
    await openSlides(page);
    await toFirstGate(page, () => page.keyboard.press("Enter"));
    await expect(page.locator("[data-hints]")).toContainText("choose");
    // The digit chooses by the shown position; the right answer's position is the seeded order's, read from the badge.
    const first = (await gates(page)).find((g) => g.id === FIRST_GATE.id)!;
    const shownAt = await page.locator("[data-gate] [role='radio']").evaluateAll((els, answer) => els.findIndex((el) => el.getAttribute("data-value") === answer), first.answer);
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
    await expect(page.locator("[data-stem] p").first()).toHaveText("Simplify");
  });
});

/** Moves on through cards that need no answer until the card of `kind` (and gate id) is on screen. */
async function walkTo(page: Page, kind: string, gateId?: string): Promise<void> {
  const all = await gates(page);
  const byId = new Map(all.map((g) => [g.id, g]));
  for (let step = 0; step < 90; step += 1) {
    const k = await card(page).getAttribute("data-card");
    if (k === kind && (!gateId || (await page.locator("[data-gate]").getAttribute("data-gate")) === gateId)) return;
    if (k === "see") {
      await stepThrough(page);
      await control(page).click();
    } else if (k === "reteach") {
      await control(page).click();
      await expect(page.locator("[data-verdict]")).toBeVisible();
      await control(page).click();
    } else if (k === "gate") {
      const id = (await page.locator("[data-gate]").getAttribute("data-gate"))!;
      if (await page.locator("[data-verdict]").count()) await control(page).click();
      else {
        const g = byId.get(id)!;
        const retry = (await page.locator("[data-gate]").getAttribute("data-retry")) !== null;
        await answerChoice(page, retry ? await retryAnswer(page, g) : g.answer);
        await control(page).click();
      }
    } else if (k === "interaction") {
      await strikeAll(page);
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
    // The two the note wires, both short: a² − b² as its brackets (rp.02), then the last check (rp.08); optional, with Skip.
    await expect(page.locator("[data-header]")).toContainText("Recall · optional · 1 of 2");
    await expect(page.locator("[data-recall='rp.fm.u1.algebraic-fractions-simplify.02']")).toBeVisible();

    // Skip moves on and records nothing: no attempt, no review card, never a miss.
    const promptRows = async () => (await attempts(page)).filter((r) => r.itemKind === "prompt").length;
    expect(await promptRows()).toBe(0);
    await page.locator("[data-skip]").click();
    await expect(page.locator("[data-header]")).toContainText("Recall · optional · 2 of 2");
    await expect(page.locator("[data-recall='rp.fm.u1.algebraic-fractions-simplify.08']")).toContainText("last check before the answer line");
    expect(await promptRows()).toBe(0);
    expect(await cardDue(page, "rp.fm.u1.algebraic-fractions-simplify.02")).toBeNull();

    // She types, then shows the answer: her words stand above the model answer, with the key word she used (audit LD-06).
    await page.locator("[data-recall] textarea").fill("the numbers");
    await control(page).click();
    await expect(page.locator("[data-typed]")).toContainText("the numbers");
    await expect(page.locator("[data-model-answer]")).toContainText("The numbers");
    await expect(page.locator("[data-recall]")).toContainText("Every key word the scheme rewards is in yours.");

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
    await expect.poll(() => cardDue(page, "rp.fm.u1.algebraic-fractions-simplify.08")).not.toBeNull();
    const due = (await cardDue(page, "rp.fm.u1.algebraic-fractions-simplify.08"))!;
    expect(due - shownAt).toBeGreaterThan(86_400_000);
    expect(await promptRows()).toBe(1);
    // The close counts what was graded, and says nothing of the one she skipped.
    await expect(page.locator("[data-card='close']")).toContainText("1 recall card graded");
  });
});

test.describe("Slides: where the right answer sits (the owner's trial, 24 Sep: 'most of the correct answers are option A')", () => {
  test("the eight right answers are spread over A, B and C as evenly as eight allow, and Read shows the same order", async ({ page }) => {
    await page.setViewportSize(DESKTOP);
    await openSlides(page);
    await control(page).click();
    const all = await gates(page);
    const byId = new Map(all.map((g) => [g.id, g]));
    const shown = new Map<string, string[]>();
    for (let step = 0; step < 90 && shown.size < all.length; step += 1) {
      const k = await card(page).getAttribute("data-card");
      if (k === "see") {
        await stepThrough(page);
        await control(page).click();
      } else if (k === "gate") {
        const id = (await page.locator("[data-gate]").getAttribute("data-gate"))!;
        shown.set(id, await page.locator("[data-gate] [role='radio']").evaluateAll((els) => els.map((e) => e.getAttribute("data-value") ?? "")));
        await answerChoice(page, byId.get(id)!.answer);
        await control(page).click();
      } else if (k === "interaction") {
        await strikeAll(page);
        await control(page).click();
        await control(page).click();
      } else {
        await control(page).click();
      }
      await page.waitForTimeout(60);
    }
    // The note's own checks in the note's order (since the teach-first rewrite of 25 Sep: g1, g3, g5, g6, g7 withdrawn).
    expect([...shown.keys()]).toEqual(all.map((g) => g.id));
    expect([...shown.keys()]).toEqual(["g2", "g12", "g9", "g13", "g4", "g10", "g11", "g8"]);
    // Each shows its own options, each once.
    for (const [id, order] of shown) expect([...order].sort(), id).toEqual([...byId.get(id)!.options!].sort());
    const at = [...shown.entries()].map(([id, order]) => order.indexOf(byId.get(id)!.answer));
    const counts = [0, 1, 2].map((p) => at.filter((a) => a === p).length);
    // Build 7 showed A, A, A, A, B, A, B (five at A, none at C). No explanation names an option by place now, so every
    // gate takes part: eight in three places is 3, 3, 2, and no place three gates running.
    const said = `answers at ${at.map((a) => "ABC"[a]).join("")}`;
    expect(Math.max(...counts) - Math.min(...counts), said).toBeLessThanOrEqual(1);
    for (let i = 2; i < at.length; i += 1) expect(at[i] === at[i - 1] && at[i] === at[i - 2], said).toBe(false);

    // Read shows the first gate in the same order (the lesson's order is one function of the note).
    await page.goto(TOPIC);
    const readFirst = page.locator(`#note [data-gate='${FIRST_GATE.id}'] [role='radio']`);
    await expect(readFirst.first()).toBeVisible();
    expect(await readFirst.evaluateAll((els) => els.map((e) => e.getAttribute("data-value") ?? ""))).toEqual(shown.get(FIRST_GATE.id));
  });
});

test.describe("Slides: the figure she acts on, and the drawn labels", () => {
  test("the shared factors strike in pairs, (x − 7) never, a mismatch is named, Check draws the simplified fraction", async ({ page }) => {
    await page.setViewportSize(PHONE);
    await openSlides(page);
    await walkTo(page, "interaction");
    // It follows the card that works the three moves in front of her (the owner's rule: shown, then hers to do).
    await expect(page.getByRole("heading", { level: 2 })).toHaveText("Strike every factor both lines share");
    expect(await smallestDrawnLabel(page)).toBeNull(); // pills are real buttons, 44 px, not drawn text
    await page.locator("[data-pill='t-b']").click();
    await page.locator("[data-pill='b-b']").click();
    await expect(page.locator("[data-pill][data-struck]")).toHaveCount(2);
    await page.locator("[data-pill='t-n']").click();
    await page.locator("[data-pill='b-m']").click();
    await expect(page.locator("[data-interaction] p[aria-live]")).toContainText("3x and (x − 7) are not the same factor");
    await expect(page.locator("[data-pill][data-struck]")).toHaveCount(2);
    await page.locator("[data-pill='t-n']").click();
    await page.locator("[data-pill='b-n']").click();
    await expect(page.locator("[data-pill][data-struck]")).toHaveCount(4);
    // (x − 7) is on one line only: it is never struck (the trial review, 25 Sep).
    await expect(page.locator("[data-pill='b-m'][data-struck]")).toHaveCount(0);
    // 3x and 6 share a 3, not themselves: the 3 is struck out of each and x and 2 are left (audit MK-05).
    await expect(page.locator("[data-pill='t-n']")).toHaveAttribute("data-struck", "3");
    await expect(page.locator("[data-pill='t-n']")).toHaveAttribute("data-left", "x");
    await expect(page.locator("[data-pill='b-n']")).toHaveAttribute("data-struck", "3");
    await expect(page.locator("[data-pill='b-n']")).toHaveAttribute("data-left", "2");
    await expect(page.locator("[data-pill='t-b']")).toHaveAttribute("data-struck", "all");
    await expect(page.locator("[data-pill='b-b']")).toHaveAttribute("data-struck", "all");
    await expect(page.locator("[data-interaction] p[aria-live]")).toContainText("the 3 divides out of both, leaving x and 2");
    await control(page).click();
    await expect(page.locator("[data-result='done']")).toBeVisible();
    await expect(page.locator("[data-result] [role='img']")).toHaveAttribute("aria-label", "x over 2(x − 7)");
    await expect(page.locator("[data-interaction] p[aria-live]")).toContainText("x and 2(x − 7) share nothing");
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
    await page.locator("[data-pill='t-n']").click();
    await page.locator("[data-pill='b-n']").click();
    await control(page).click();
    await expect(page.locator("[data-result='done']")).toBeVisible();
    // After Check: a reload keeps the strikes, what is left, and the result.
    await page.reload();
    await expect(page.locator("[data-slides][data-ready='true']")).toBeAttached();
    await expect(page.locator("[data-card='interaction']")).toBeVisible();
    await expect(page.locator("[data-pill][data-struck]")).toHaveCount(4);
    await expect(page.locator("[data-pill='b-n']")).toHaveAttribute("data-left", "2");
    await expect(page.locator("[data-result='done']")).toBeVisible();
    await expect(control(page)).toHaveText("Continue");
  });

  test("a run kept from the old drawing (build 8's pills) opens the figure afresh, never 'done' over unstruck pills", async ({ page }) => {
    await page.setViewportSize(PHONE);
    await openSlides(page);
    await walkTo(page, "interaction");
    // What build 8 stored for this card: 2x(x + 5) over 4(x + 5)(x − 5), struck and checked.
    await page.evaluate((key) => {
      const raw = JSON.parse(localStorage.getItem(key) ?? "{}");
      raw.figures = { "interaction:afs.tap-to-cancel": { struck: ["t-b", "b-b", "t-2x", "b-4"], lit: [] } };
      raw.checked = { "interaction:afs.tap-to-cancel": { correct: true } };
      localStorage.setItem(key, JSON.stringify(raw));
    }, `cairn.slides.${TOPIC_ID}`);
    await page.reload();
    await expect(page.locator("[data-slides][data-ready='true']")).toBeAttached();
    await expect(page.locator("[data-card='interaction']")).toBeVisible();
    await expect(page.locator("[data-pill][data-struck]")).toHaveCount(0);
    await expect(page.locator("[data-result]")).toHaveCount(0);
    await expect(control(page)).toHaveText("Check");
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
    await expect(page.locator("[data-pill='t-n'][data-lit]")).toBeEnabled();
    await expect(page.locator("[data-interaction] p[aria-live]")).toContainText("A factor of 3 still divides both 3x and 6.");
    await expect(page.locator("[data-result='shown']")).toContainText("It simplifies to");
    expect(await reddish(page)).toEqual([]);
    // She finishes it: the pair strikes, the lit set clears, and the line says so.
    await page.locator("[data-pill='t-n']").click();
    await page.locator("[data-pill='b-n']").click();
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

  test("the idea's drawing, the note's own figures and the miss's consequence keep every label at 13 px or more at 390", async ({ page }) => {
    await page.setViewportSize(PHONE);
    await openSlides(page);
    await control(page).click();
    // Card 2 reads the drawing ("In the drawing…"): the registered drawing stands on it with the note figure's own caption.
    const drawing = page.locator("[data-card-figure='afs.cancel']");
    await expect(drawing.locator("svg[data-figure='afs.cancel']")).toBeVisible();
    await expect(drawing).toContainText(await heroCaption(page));
    expect(await smallestDrawnLabel(page)).toBeGreaterThanOrEqual(13);
    // It strikes exactly the 3 out of 3x and 6 and the bracket (x + 7), and leaves (x − 7) standing.
    const struck = await drawing.locator("[data-piece]").evaluateAll((els) => els.map((e) => `${e.getAttribute("data-piece")}:${e.getAttribute("data-struck") ?? "-"}`));
    expect(struck).toEqual(["t-n:3", "t-b:all", "b-n:3", "b-b:all", "b-m:-"]);

    await walkTo(page, "gate", FIRST_GATE.id);
    const first = (await gates(page)).find((g) => g.id === FIRST_GATE.id)!;
    await answerChoice(page, first.options!.find((o) => o !== first.answer)!);
    // The consequence is drawn on the re-teach, before the answer is shown.
    await expect(page.locator("[data-card='reteach'] [data-reaction]")).toBeVisible();
    expect(await smallestDrawnLabel(page)).toBeGreaterThanOrEqual(13);
    expect(await reddish(page)).toEqual([]);

    // The next card reads the note's own L-shape figure: on its stage, as wide as its labels were sized for (a 356 px
    // drawing; on the 316 px stage the 15-unit labels were 11.9 px), and nothing scrolls sideways.
    await showAnswer(page);
    await control(page).click();
    const figure = page.locator("[data-card-figure='note'] svg");
    await expect(figure).toBeVisible();
    expect(await smallestDrawnLabel(page)).toBeGreaterThanOrEqual(13);
    expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBeLessThanOrEqual(0);
    expect(await page.locator("[data-card]").evaluate((el) => el.scrollWidth - el.clientWidth)).toBeLessThanOrEqual(0);
  });

  test("a worked line stands whole: no inline formula breaks across lines on the three moves' worked card, at 390 and 1280", async ({ page }) => {
    for (const [i, size] of [PHONE, DESKTOP].entries()) {
      await page.setViewportSize(size);
      if (i > 0) await page.evaluate(() => localStorage.clear());
      await openSlides(page);
      await walkTo(page, "interaction");
      await page.keyboard.press("ArrowLeft");
      await expect(page.locator("[data-card='idea']")).toContainText("Strike");
      const found = await page.evaluate(() => {
        const inline = Array.from(document.querySelectorAll<HTMLElement>("[data-card] .katex")).filter((k) => !k.closest(".katex-display"));
        const bases = (k: HTMLElement) => Array.from(k.querySelectorAll<HTMLElement>(".katex-html > .katex-base")).map((b) => b.getBoundingClientRect());
        return {
          // KaTeX may break a formula only between these pieces; one with several is one that could have broken.
          breakable: inline.filter((k) => bases(k).length > 1).length,
          broken: inline.filter((k) => bases(k).some((r, j, all) => j > 0 && r.left < all[j - 1].right - 1)).map((k) => k.querySelector("annotation")?.textContent ?? "?"),
        };
      });
      expect(found.breakable, `formulas that could break at ${size.width}`).toBeGreaterThan(0);
      expect(found.broken, `formulas broken across lines at ${size.width}`).toEqual([]);
    }
  });

  // g2, "What cancels in this fraction? (x + 4)/x": each wrong option draws its own consequence at x = 1, the test its
  // explanation makes (audit CT-19, CQ-03), and the two labels under the tiles never meet, on the phone or at the
  // verdict's full 356 px (audit CT-11, CD-02, LD-10).
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
    await toFirstGate(page);
    const radios = page.locator("[data-gate] [role='radio']");
    await radios.nth(0).click();
    await expect(radios.nth(0)).toHaveAttribute("aria-checked", "true");
    await page.keyboard.press("ArrowDown");
    await expect(radios.nth(1)).toHaveAttribute("aria-checked", "true");
    await expect(radios.nth(1)).toBeFocused();
    await page.keyboard.press("ArrowUp");
    await expect(radios.nth(0)).toHaveAttribute("aria-checked", "true");
    await expect(count(page)).toHaveText(`${FIRST_GATE.at} of ${DECK}`);
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
    // The cards that explain and work the idea move on freely (on a See it the next button shows the next step first);
    // the Your turn after them is locked until answered.
    await toFirstGate(page, () => page.locator("[data-next]").click(), 2);
    await expect(page.locator("[data-next]")).toBeDisabled(); // a gate: locked
    await page.locator("[data-prev]").click();
    await expect(count(page)).toHaveText(`${FIRST_GATE.at - 1} of ${DECK}`);
  });
});

test.describe("Slides: the whole deck and the close", () => {
  test("the missed gate returns before the recap; the close holds the character and Rowan's line and no answer field", async ({ page }) => {
    await page.setViewportSize(PHONE);
    await installPastFirstRun(page);
    await openSlides(page);
    await control(page).click();
    await walkToClose(page, [FIRST_GATE.id]);

    await expect(page.locator("[data-card='close']")).toBeVisible();
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Done for tonight.");
    await expect(page.locator("[data-card='close']")).toContainText(`${CHECKS} your turns answered · the one that came back held · 2 recall cards graded`);
    await expect(page.locator("[data-companion-figure='close']")).toHaveCount(1);
    await expect(page.locator("[data-companion='session-close']")).toBeVisible();
    await expect(page.locator("[data-companion='session-close']")).not.toContainText("!");
    expect(await page.locator("[data-card='close'] :is(input, textarea, [role='radio'])").count()).toBe(0);
    await expect(page.locator("[data-card='close']")).toContainText("What returns");
    // Every card counted, with no reason that is not one (audit CT-07, LD-05): the run's ten cards come back tonight.
    await expect(page.locator("[data-returns] li").first()).toHaveText(`Tonight · ${CHECKS} your turns and 2 recall cards from Simplifying algebraic fractions.`);
    // And so Rowan does not say there is nothing else to do (the library's own line for a night with nothing due).
    await expect(page.locator("[data-companion='session-close']")).not.toContainText("nothing else to do");
    // The questions proper come after the teaching (the owner's answer 1: the Practice stage): the first way out, on the
    // accent; "Done for tonight" is the second, outlined.
    expect(await accentControls(page)).toEqual(["Now the questions"]);
    const exits = page.locator("[data-close] a[data-exit]");
    await expect(exits).toHaveCount(2);
    await expect(exits.nth(0)).toHaveText("Now the questions");
    await expect(exits.nth(0)).toHaveAttribute("href", `${TOPIC}#practice`);
    await expect(exits.nth(1)).toHaveText("Done for tonight");
    await expect(exits.nth(1)).toHaveAttribute("href", "/");
    expect(await animations(page)).toBe(0);

    // The records: the eight gates once each with Read's ids, the miss on the first kept as the record, two prompts.
    const rows = await attempts(page);
    const gateRows = rows.filter((r) => r.itemId.includes("#gate:"));
    expect(gateRows.map((r) => r.itemId.split("#gate:")[1]).sort()).toEqual((await gates(page)).map((g) => g.id).sort());
    expect(gateRows).toHaveLength(CHECKS);
    expect(gateRows.find((r) => r.itemId.endsWith(`#gate:${FIRST_GATE.id}`))?.correct).toBe(false);
    expect(rows.filter((r) => r.itemKind === "prompt")).toHaveLength(2);

    // Done for tonight goes home; the run is finished, so the slides start afresh next time.
    await page.getByRole("link", { name: /^Done for tonight$/ }).click();
    await expect(page.getByRole("heading", { level: 1, name: "Today" })).toBeVisible();
  });

  test("a close where Rowan is silent draws no empty scene, and Now the questions lands on Practice", async ({ page }) => {
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

  test("on a phone the re-teach, then the answer, are brought into view, not left under the foot (audit LD-14)", async ({ page }) => {
    await page.setViewportSize(PHONE);
    await openSlides(page);
    await control(page).click();
    await walkTo(page, "gate", "g4");
    // The option that strikes the two x² terms, which are terms of a sum (the longest explanation in the deck).
    await answerChoice(page, "$\\frac{9x+14}{5x-14}$");
    const inView = (selector: string) =>
      page.evaluate((sel) => {
        const el = document.querySelector(sel)!.getBoundingClientRect();
        const body = document.querySelector("[data-card]")!.getBoundingClientRect();
        return Math.round(body.bottom - Math.min(el.bottom, el.top + 120));
      }, selector);
    await expect.poll(() => inView("[data-reteach]")).toBeGreaterThanOrEqual(0);
    await showAnswer(page);
    await expect(page.locator("[data-verdict='miss']")).toContainText("comes back before the recap");
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

  test("the retry card sits just before the recap and is asked once more, unrecorded; the recap draws a glyph a line", async ({ page }) => {
    await page.setViewportSize(DESKTOP);
    await openSlides(page);
    await control(page).click();
    const all = await gates(page);
    const first = all.find((g) => g.id === FIRST_GATE.id)!;
    const last = all[all.length - 1];
    await walkTo(page, "gate", first.id);
    await answerChoice(page, first.options!.find((o) => o !== first.answer)!);
    await showAnswer(page);
    await control(page).click();
    // The last check of the lesson (g8, "How the paper asks it"), then the retry.
    await walkTo(page, "gate", last.id);
    await answerChoice(page, last.answer);
    await control(page).click();
    // The next card is the retry, before the recap: the twin on new numbers where the note has one, else the gate again.
    const retry = page.locator(`[data-gate='${first.id}'][data-retry]`);
    await expect(retry).toBeVisible();
    await expect(retry).toHaveAttribute("data-retry", first.twin ? "twin" : "same");
    await expect(page.locator("[data-header]")).toContainText(first.twin ? "Once more · on new numbers" : "Once more");
    await answerChoice(page, first.twin ? first.twin.answer : first.answer);
    await expect(page.locator("[data-verdict='ok']")).toContainText("Asked once more, and held. Your first answer is the one on record.");
    expect((await attempts(page)).filter((r) => r.itemId.endsWith(`#gate:${first.id}`))).toHaveLength(1);
    await control(page).click();
    await expect(page.getByRole("heading", { level: 2 })).toHaveText("You can now");
    await expect(page.locator("[data-card='recap']")).toContainText("The one you missed came back before this card, and held.");
    // Four lines, four drawn glyphs, in the note's order; every glyph's numeral at the 13 px floor.
    await expect(page.locator("[data-card='recap'] li")).toHaveCount(4);
    expect(await page.locator("[data-card='recap'] [data-glyph]").evaluateAll((els) => els.map((e) => e.getAttribute("data-glyph")))).toEqual(["factorise", "cancel", "numbers", "divide"]);
    expect(await smallestDrawnLabel(page)).toBeGreaterThanOrEqual(13);
  });
});

/**
 * Lesson structure v3 (the teach-first case §11 items 1, 2, 6; the owner's answers 2 and 5). These read the trial note's
 * own blocks: a note not yet converted to the See it shape has no See it card and no twin, and the tests say so.
 */
test.describe("Slides: See it, and the twin before the recap", () => {
  test("a See it shows one step per Continue, each with its reason, and its last control is Your turn", async ({ page }) => {
    await page.setViewportSize(PHONE);
    await openSlides(page);
    const sees = await seeIts(page);
    test.skip(sees.length === 0, "the trial note has no See it block yet (its conversion to the See it shape is the content session's)");
    await control(page).click();
    await walkTo(page, "see");
    const n = sees[0]!.steps;
    const at = await count(page).textContent();
    // The topic's first See it is shown, never typed: every step comes by Continue (or →, which is the same press).
    await expect(page.locator("[data-typed-step]")).toHaveCount(0);
    await expect(page.locator("[data-header]")).toContainText("See it");
    for (let shown = 1; shown <= n; shown += 1) {
      await expect(page.locator("[data-step]")).toHaveCount(shown);
      await expect(page.locator("[data-ghost]")).toHaveCount(n - shown);
      await expect(page.locator(`[data-step='${shown}'][data-current]`)).toBeVisible();
      // No Skip on a first visit (the owner's answer 5: the first pass is the lesson).
      await expect(page.locator("[data-skip-see]")).toHaveCount(0);
      // The card stays while its steps come: the count does not move.
      await expect(count(page)).toHaveText(at!);
      if (shown === n) break;
      await expect(control(page)).toHaveText("Continue");
      if (shown % 2 === 1) await control(page).click();
      else await page.keyboard.press("ArrowRight");
    }
    // Back a card and forward again: the steps she has seen are still there.
    await page.keyboard.press("ArrowLeft");
    await page.keyboard.press("ArrowRight");
    await expect(page.locator("[data-step]")).toHaveCount(n);
    await expect(page.locator("[data-ghost]")).toHaveCount(0);
    // The last step's control names where it goes: the Your turn, or the video that stands beside the See it.
    await expect(control(page)).toHaveText(/^(Your turn|Continue)$/);
    expect(await animations(page)).toBe(0);
  });

  test("the first Your turn follows the first See it, and asks what it showed (the owner's answer 8)", async ({ page }) => {
    await page.setViewportSize(DESKTOP);
    await openSlides(page);
    test.skip((await seeIts(page)).length === 0, "the trial note has no See it block yet");
    await control(page).click();
    const kinds: string[] = [];
    for (let guard = 0; guard < 40; guard += 1) {
      const k = (await card(page).getAttribute("data-card"))!;
      kinds.push(k);
      if (k === "gate") break;
      if (k === "see") await stepThrough(page);
      await control(page).click();
    }
    expect(kinds.indexOf("see"), kinds.join(" ")).toBeGreaterThanOrEqual(0);
    expect(kinds.indexOf("see"), kinds.join(" ")).toBeLessThan(kinds.indexOf("gate"));
    await expect(page.locator("[data-header]")).toContainText("Your turn");
    await expect(page.locator("[data-gate]")).not.toContainText(/one tap to start|warm-up/i);
  });

  test("Skip to your turn appears only on a return visit, and shows every step on the way on", async ({ page }) => {
    await page.setViewportSize(PHONE);
    await openSlides(page);
    test.skip((await seeIts(page)).length === 0, "the trial note has no See it block yet");
    await control(page).click();
    await walkToClose(page);
    // A return visit: the finished run starts afresh, and the See its she saw to their end offer the skip.
    await openSlides(page);
    await control(page).click();
    await walkTo(page, "see");
    const skip = page.locator("[data-skip-see]");
    await expect(skip).toBeVisible();
    await expect(skip).toHaveText(/Skip to your turn/);
    const at = await count(page).textContent();
    await skip.click();
    await expect(count(page)).not.toHaveText(at!);
    // Going back finds the See it shown whole; nothing was recorded for the skip.
    await page.keyboard.press("ArrowLeft");
    await expect(page.locator("[data-ghost]")).toHaveCount(0);
    await expect(page.locator("[data-skip-see]")).toHaveCount(0);
  });

  test("a step she types is marked through the engine and never recorded", async ({ page }) => {
    await page.setViewportSize(PHONE);
    await openSlides(page);
    test.skip((await seeIts(page)).length < 2, "the trial note has no second See it yet (a first See it is never typed)");
    await control(page).click();
    // Walk the See its until one asks her to type a step (never the first).
    let found = false;
    for (let guard = 0; guard < 40 && !found; guard += 1) {
      if ((await card(page).getAttribute("data-card")) !== "see") {
        await walkTo(page, "see").catch(() => undefined);
        if ((await card(page).getAttribute("data-card")) !== "see") break;
        continue;
      }
      for (let i = 0; i < 8; i += 1) {
        if (await page.locator("[data-typed-step]").count()) {
          found = true;
          break;
        }
        if ((await page.locator("[data-ghost]").count()) === 0) break;
        await control(page).click();
      }
      if (!found) await control(page).click();
    }
    test.skip(!found, "no See it in the trial note asks her to type a step");
    const before = (await attempts(page)).length;
    // Her line, wrong: the step is shown with what she wrote; nothing is recorded.
    await page.locator("[data-typed-step] input, [data-typed-step] textarea").first().fill("0");
    await page.locator("[data-typed-step] button[type='submit']").click();
    await expect(page.locator("[data-typed-result]")).toBeVisible();
    expect((await attempts(page)).length).toBe(before);
  });

  test("a missed Your turn with a twin comes back before the recap on new numbers, once, unrecorded", async ({ page }) => {
    await page.setViewportSize(DESKTOP);
    await openSlides(page);
    const all = await gates(page);
    const withTwin = all.find((g) => g.twin && g.options);
    test.skip(!withTwin, "no gate in the trial note carries a twin yet");
    const g = withTwin!;
    await control(page).click();
    await walkTo(page, "gate", g.id);
    await answerChoice(page, g.options!.find((o) => o !== g.answer)!);
    await showAnswer(page);
    await expect(page.locator("[data-verdict='miss']")).toContainText("comes back before the recap on new numbers");
    await control(page).click();
    // On to the retry, answering everything between right: it comes before the recap, and asks the twin.
    for (let guard = 0; guard < 90 && (await page.locator(`[data-gate='${g.id}'][data-retry]`).count()) === 0; guard += 1) {
      const k = await card(page).getAttribute("data-card");
      if (k === "recap" || k === "close") throw new Error(`the ${k} came before the twin`);
      if (k === "see") {
        await stepThrough(page);
        await control(page).click();
      } else if (k === "gate") {
        const id = (await page.locator("[data-gate]").getAttribute("data-gate"))!;
        const other = all.find((x) => x.id === id)!;
        if ((await page.locator("[data-verdict]").count()) === 0) await answerChoice(page, (await page.locator("[data-gate]").getAttribute("data-retry")) !== null ? await retryAnswer(page, other) : other.answer);
        await control(page).click();
      } else if (k === "interaction") {
        await strikeAll(page);
        await control(page).click();
        await control(page).click();
      } else await control(page).click();
      await page.waitForTimeout(60);
    }
    const retry = page.locator(`[data-gate='${g.id}'][data-retry='twin']`);
    await expect(retry).toBeVisible();
    await expect(retry).toHaveAttribute("data-asked", `${g.id}~twin`);
    const options = await retry.locator("[role='radio']").evaluateAll((els) => els.map((e) => e.getAttribute("data-value")));
    expect([...options].sort()).toEqual([...g.twin!.options!].sort());
    await answerChoice(page, g.twin!.answer);
    await expect(page.locator("[data-verdict='ok']")).toContainText("Asked once more, and held.");
    // One record, the first answer.
    expect((await attempts(page)).filter((r) => r.itemId.endsWith(`#gate:${g.id}`))).toEqual([{ itemId: `${TOPIC_ID}#gate:${g.id}`, itemKind: "practice", correct: false }]);
    await control(page).click();
    await expect(page.locator("[data-card='recap']")).toBeVisible();
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
    await toFirstGate(page);
    await page.locator("[data-gate] [role='radio']").first().click();
    expect(await contrast()).toBeGreaterThanOrEqual(4.5);
  });
});
