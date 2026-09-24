import { expect, test, type Page } from "@playwright/test";
import { MAIN, completeFirstRun, expectNoHorizontalOverflow } from "./helpers";

/**
 * Learn is the spine: three subjects, eight Maths units, topics in teaching order, and two
 * kinds of topic page — one with original content and one that still only has the spec.
 */

const MATHS_UNITS = ["M1", "M2", "M3", "M4", "M5", "M6", "M7", "M8"];

async function hrefs(page: Page, selector: string): Promise<string[]> {
  return page.locator(selector).evaluateAll((els) => els.map((e) => e.getAttribute("href") ?? ""));
}

/** The first topic in a unit list with something published: a lesson, or questions only. */
function readyTopicLink(page: Page) {
  return page.locator(`${MAIN} ol > li:is([data-built="lesson"], [data-built="questions"]) a`).first();
}

/** Three long-published topics, one per subject (the appearance spec uses the same three). If a slug is renamed, change it here. */
const TOPICS = [
  { subject: "maths", path: "/learn/maths/M4/histograms-unequal-widths/" },
  { subject: "further-maths", path: "/learn/further-maths/FM1/matrix-inverse-2x2/" },
  { subject: "science", path: "/learn/science/B1/b1-enzyme-factors/" },
] as const;

async function openTopic(page: Page, path: string): Promise<void> {
  await page.goto(path);
  await expect(page.getByRole("button", { name: /^Start the lesson$/ })).toBeVisible();
  // The lesson loads on the client just after the hero.
  await expect(page.locator("#note article")).toBeVisible();
  await page.evaluate(() => document.fonts.ready.then(() => true));
}

/**
 * The trial topic, where Read v2 runs (TRIAL-BRIEF.md; lesson-plan.ts isReadV2): no rail beside the text, a slim track
 * with a Contents popover, Continue at each section's end, and the gate drawn as Slides draws it. Its hero offers
 * Slides first on a first visit, so it has no "Start the lesson" to wait for.
 */
const TRIAL = { path: "/learn/further-maths/FM1/algebraic-fractions-simplify/", bundle: "/content/further-maths/fm.u1.algebraic-fractions-simplify.json" } as const;

async function openTrial(page: Page): Promise<void> {
  await page.goto(TRIAL.path);
  await expect(page.locator(`${MAIN} header h1`)).toBeVisible();
  await expect(page.locator("#note article")).toBeVisible();
  await page.evaluate(() => document.fonts.ready.then(() => true));
}

/** The hero's first way in: "Start the slides" on a first visit, or the Read button that took its place. */
function primaryWayIn(page: Page) {
  return page.locator(`${MAIN} header [data-way]`).first();
}

type TrialGate = { id: string; kind: string; options?: string[]; answer: string; prompt: string };

async function trialGates(page: Page): Promise<TrialGate[]> {
  return page.evaluate(async (url) => {
    const b = (await (await fetch(url)).json()) as { noteBlocks: Array<{ type: string } & Partial<TrialGate>> };
    return b.noteBlocks.filter((x) => x.type === "gate") as TrialGate[];
  }, TRIAL.bundle);
}

/**
 * Where an authored option is shown: a gate shows its options in a seeded order of its own (engine item 11, so the
 * answer is not always A), and each option carries its authored text as `data-value`.
 */
async function optionAt(page: Page, gateId: string, pick: (value: string) => boolean): Promise<number> {
  const values = await page.locator(`#note [data-gate="${gateId}"] [role=radio]`).evaluateAll((els) => els.map((e) => e.getAttribute("data-value") ?? ""));
  return values.findIndex(pick);
}

/** Choose an option of a Read v2 gate and press Check: the right one, or the first shown that is not right. */
async function answerGate(page: Page, gate: TrialGate, right = true): Promise<void> {
  const box = page.locator(`#note [data-gate="${gate.id}"]`);
  const at = await optionAt(page, gate.id, (v) => (right ? v === gate.answer : v !== gate.answer));
  await box.getByRole("radio").nth(at).click();
  await box.getByRole("button", { name: /^Check$/ }).click();
  await expect(box.locator("[data-verdict]")).toBeVisible();
}

/** Every sticky or fixed thing on screen but the app's own navigation: what it is, where, and whether it is beside the text. */
async function pinnedThings(page: Page) {
  return page.evaluate(() => {
    const prose = Array.from(document.querySelectorAll<HTMLElement>("#note article p, #note article h3")).find((el) => el.getBoundingClientRect().width > 100);
    const pr = prose?.getBoundingClientRect();
    return Array.from(document.querySelectorAll<HTMLElement>("body *"))
      .filter((el) => ["sticky", "fixed"].includes(getComputedStyle(el).position))
      .filter((el) => !el.closest("nav[aria-label='Primary'], nextjs-portal"))
      .map((el) => ({ el, r: el.getBoundingClientRect() }))
      .filter(({ r }) => r.width > 0 && r.height > 0 && r.bottom > 0 && r.top < window.innerHeight)
      .map(({ el, r }) => ({
        what: `${el.tagName.toLowerCase()} ${el.getAttribute("aria-label") ?? ""}`.trim(),
        track: el.hasAttribute("data-read-track"),
        top: Math.round(r.top),
        height: Math.round(r.height),
        // beside the text: it shares no column with the prose
        beside: pr ? r.right <= pr.left + 1 || r.left >= pr.right - 1 : false,
      }));
  });
}

/** Where the lesson's running prose sits: a paragraph of the note in the lesson serif. */
async function proseBox(page: Page): Promise<{ left: number; width: number }> {
  return page.evaluate(() => {
    const p = Array.from(document.querySelectorAll<HTMLElement>("#note article p")).find(
      (el) => (el.textContent ?? "").trim().length > 80 && getComputedStyle(el).fontFamily.includes("Literata"),
    );
    if (!p) return { left: -1, width: -1 };
    const r = p.getBoundingClientRect();
    return { left: r.left, width: r.width };
  });
}

test.describe("Learn", () => {
  test("/learn/ lists the three subjects", async ({ page }) => {
    await page.goto("/learn/");
    await expect(page.getByRole("heading", { level: 1, name: "Subjects" })).toBeVisible();

    const subjects = page.locator(`${MAIN} a[href^="/learn/"]`);
    // Honest counters: each card says how many of the catalogue's topics have a built lesson.
    await expect(subjects.first()).toContainText(/\d+ of \d+ topics built/);
    await expect(subjects).toHaveCount(3);
    // Each card links one level down and names a subject.
    for (const href of await hrefs(page, `${MAIN} a[href^="/learn/"]`)) {
      expect(href).toMatch(/^\/learn\/[a-z-]+\/$/);
    }
    await expect(subjects.first().getByRole("heading", { level: 2 })).toBeVisible();
  });

  test("/learn/maths/ lists the eight units M1-M8", async ({ page }) => {
    await page.goto("/learn/maths/");

    const units = page.locator(`${MAIN} a[href^="/learn/maths/"]`);
    await expect(units).toHaveCount(MATHS_UNITS.length);
    const found = await hrefs(page, `${MAIN} a[href^="/learn/maths/"]`);
    expect([...found].sort()).toEqual(MATHS_UNITS.map((u) => `/learn/maths/${u}/`));

    // Every unit card shows its short code.
    for (const unit of MATHS_UNITS) {
      await expect(page.locator(`${MAIN} a[href="/learn/maths/${unit}/"]`)).toContainText(unit);
    }
  });

  test("/learn/maths/M4/ lists topics and flags the ones with practice", async ({ page }) => {
    await page.goto("/learn/maths/M4/");

    const topics = page.locator(`${MAIN} ol > li`);
    expect(await topics.count()).toBeGreaterThan(0);
    // Rows are numbered and link into the topic.
    await expect(topics.first().locator("a")).toHaveAttribute("href", /^\/learn\/maths\/M4\/[a-z0-9-]+\/$/);

    // What is published is in the row's data; no row carries a badge that is true of every row.
    expect(await page.locator(`${MAIN} ol > li[data-built="lesson"]`).count()).toBeGreaterThan(0);
    await expect(page.getByText(/^(Practice ready|Lesson and practice)$/)).toHaveCount(0);
  });

  test("a topic with content teaches first: the lesson, the examples, then the check", async ({ page }) => {
    await page.goto("/learn/maths/M4/");
    const link = readyTopicLink(page);
    await expect(link).toBeVisible();
    await link.click();
    await expect(page).toHaveURL(/\/learn\/maths\/M4\/[a-z0-9-]+\/$/);

    // The hero comes first: an honest minute estimate, the lesson's own figure, and one way in.
    const hero = page.locator(`${MAIN} header`).first();
    await expect(hero).toContainText(/About \d+ minutes?/);
    await expect(hero.getByRole("button", { name: /^Start the lesson$/ })).toBeVisible();
    await expect(hero.locator("figure svg, figure img").first()).toBeVisible();

    // The bundle loads on the client. Nothing is gated: every section is on the page at once, with the
    // check after the teaching, and the way past the check is a shortcut rather than an unlock.
    const ORDER = ["The lesson", "Worked examples", "Check yourself", "Practice", "In the exam"];
    for (const heading of ORDER) {
      await expect(page.getByRole("heading", { level: 2, name: new RegExp(`^${heading}$`, "i") })).toBeVisible();
    }
    await expect(page.getByRole("button", { name: /^skip to practice$/i })).toBeVisible();

    // ...and in teaching order.
    const h2s = await page.locator(`${MAIN} h2`).allTextContents();
    expect(h2s.map((t) => t.trim()).filter((t) => ORDER.includes(t))).toEqual(ORDER);
  });

  test("a topic without content falls back to the specification", async ({ page }) => {
    await page.goto("/learn/maths/M1/");
    const first = page.locator(`${MAIN} ol > li a`).first();
    await expect(first).toBeVisible();
    await expect(page.locator(`${MAIN} ol > li`).first()).toHaveAttribute("data-built", "none");
    await first.click();

    await expect(page.getByRole("heading", { level: 2, name: /^What the specification says$/i })).toBeVisible();
    // The spec statements are listed with their CCEA ids.
    await expect(page.locator(`${MAIN} li`).filter({ hasText: /\S/ }).first()).toBeVisible();
  });

  test("the hero promises what the spine adds up to, on one screen", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await openTopic(page, TOPICS[1].path);
    const promised = await page.locator(`${MAIN} header`).first().getByText(/^About \d+ minutes?$/).textContent();
    const stage = await page.locator("#note").getByText(/^Read and check · about \d+ min$/).textContent();
    expect(Number(/\d+/.exec(promised ?? "")?.[0]), `hero "${promised}" against the lesson's "${stage}"`).toBe(Number(/\d+/.exec(stage ?? "")?.[0]));
  });

  test("neither kind of topic page scrolls sideways", async ({ page }) => {
    await page.goto("/learn/maths/M4/");
    await readyTopicLink(page).click();
    await expect(page.getByRole("heading", { level: 2, name: /^The lesson$/i })).toBeVisible();
    await expectNoHorizontalOverflow(page);

    await page.goto("/learn/maths/M1/");
    await page.locator(`${MAIN} ol > li a`).first().click();
    await expect(page.getByRole("heading", { level: 2, name: /^What the specification says$/i })).toBeVisible();
    await expectNoHorizontalOverflow(page);
  });
});

/**
 * Decision 1 (platform programme, 22 Sep 2026) and the plan's hero rule (03-implementation-plan.md, pass 2a): the lesson is
 * the page. Measured, not looked at: where the button lands on a phone, how wide the prose runs on a desktop, that the
 * contents can be put away without moving the text, and that a phone carries one sticky thing besides the tab bar.
 * The rail and the 47 px bar are the page of every topic that has not moved to Read v2 (below); their tests go when the
 * owner says yes to the trial and v2 rolls out. The 640 px rule stays for every topic, the trial's included.
 */
test.describe("The topic page: the lesson is the page", () => {
  test("Start the lesson is on the first phone screen, within 640 px, on a topic in each subject", async ({ page }) => {
    // 22 Sep, before pass 2a: 1,015 px (maths), 812 px (further maths), 942 px (science).
    await page.setViewportSize({ width: 390, height: 844 });
    for (const topic of TOPICS) {
      await openTopic(page, topic.path);
      await page.evaluate(() => window.scrollTo(0, 0));
      const top = await page.getByRole("button", { name: /^Start the lesson$/ }).evaluate((el) => el.getBoundingClientRect().top);
      expect(top, `Start the lesson at ${Math.round(top)} px on ${topic.path}`).toBeLessThan(640);
    }
    // The trial topic too, under its track: its first way in (Slides on a first visit) within the same 640 px.
    await openTrial(page);
    await page.evaluate(() => window.scrollTo(0, 0));
    const way = primaryWayIn(page);
    await expect(way).toBeVisible();
    const top = await way.evaluate((el) => el.getBoundingClientRect().top);
    expect(top, `the first way in at ${Math.round(top)} px on ${TRIAL.path}`).toBeLessThan(640);
  });

  test("at 1280 x 800 the lesson prose runs 640 to 720 px wide", async ({ page }) => {
    // 22 Sep: 585 px, inside a card capped at 626 px, with 154 px of empty page to its right.
    await page.setViewportSize({ width: 1280, height: 800 });
    for (const topic of TOPICS) {
      await openTopic(page, topic.path);
      const { width } = await proseBox(page);
      expect(width, `prose width on ${topic.path}`).toBeGreaterThanOrEqual(640);
      expect(width, `prose width on ${topic.path}`).toBeLessThanOrEqual(720);
    }
  });

  test("the contents rail is put away with one tap, the prose does not move, and the choice is kept", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await openTopic(page, TOPICS[0].path);
    const spine = page.getByRole("navigation", { name: "Lesson contents" });
    const toggle = spine.getByRole("button", { name: /^Contents$/ });
    await expect(toggle).toHaveAttribute("aria-expanded", "true");
    const before = await proseBox(page);

    await toggle.click();
    await expect(toggle).toHaveAttribute("aria-expanded", "false");
    // Put away: no rows of sections, only the track and where she is.
    await expect(spine.locator("[aria-current]:visible")).toHaveCount(0);
    const after = await proseBox(page);
    expect(Math.abs(after.width - before.width), "the prose re-wraps when the rail goes").toBeLessThanOrEqual(40);
    expect(Math.abs(after.left - before.left), "the prose moves when the rail goes").toBeLessThanOrEqual(40);

    // Remembered on this device.
    await page.reload();
    await expect(page.locator("#note article")).toBeVisible();
    await expect(page.getByRole("navigation", { name: "Lesson contents" }).getByRole("button", { name: /^Contents$/ })).toHaveAttribute("aria-expanded", "false");
    await page.getByRole("navigation", { name: "Lesson contents" }).getByRole("button", { name: /^Contents$/ }).click();
    await expect(page.getByRole("navigation", { name: "Lesson contents" }).getByRole("button", { name: /^Contents$/ })).toHaveAttribute("aria-expanded", "true");
  });

  test("a section she finishes ends in a place to stop, and next time the button takes her on from there", async ({ page }) => {
    // 04-critique.md §7.10 (a stopping point at every section boundary) and §7.13 (the returning-visit hero).
    await page.setViewportSize({ width: 390, height: 844 });
    await openTopic(page, TOPICS[1].path);
    const gate = await page.evaluate(async () => {
      const bundle = (await (await fetch("/content/further-maths/fm.u1.matrix-inverse-2x2.json")).json()) as {
        noteBlocks: Array<{ type: string; id?: string; kind?: string; answer?: string; options?: string[] }>;
      };
      return bundle.noteBlocks.find((b) => b.type === "gate")!;
    });
    const box = page.locator(`#note [data-gate="${gate.id}"]`);
    // Options are shown in the gate's own seeded order: find the answer by what it says.
    if (gate.kind === "choice") await box.getByRole("radio").nth(await optionAt(page, gate.id!, (v) => v === gate.answer)).click();
    else {
      await box.locator("input").fill(gate.answer!.split("|")[0].trim().replace(/\$/g, ""));
      await box.getByRole("button", { name: /^Check$/ }).click();
    }
    // The next stretch opens with a way to stop before it: to Today, her place kept.
    const pause = page.getByTestId("pause-here").first();
    await expect(pause).toBeVisible();
    await expect(pause.getByRole("link", { name: /^Pause here/ })).toHaveAttribute("href", "/");

    await page.reload();
    const again = page.getByRole("button", { name: /^Continue at section 2$/ });
    await expect(again).toBeVisible();
    await page.evaluate(() => window.scrollTo(0, 0));
    const top = await again.evaluate((el) => el.getBoundingClientRect().top);
    expect(top, `Continue at ${Math.round(top)} px`).toBeLessThan(640);
    await expect(page.getByRole("button", { name: /^Read from the top$/ })).toBeVisible();
  });

  test("on a phone the spine is one 47 px bar, the only sticky thing besides the tab bar, and it opens the contents", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await openTopic(page, TOPICS[2].path);
    await page.evaluate(() => {
      const note = document.getElementById("note")!;
      window.scrollTo(0, note.getBoundingClientRect().top + window.scrollY + 600);
    });
    await page.waitForTimeout(300);
    const pinned = await page.evaluate(() =>
      Array.from(document.querySelectorAll<HTMLElement>("body *"))
        .filter((el) => ["sticky", "fixed"].includes(getComputedStyle(el).position))
        .filter((el) => !el.closest("nav[aria-label='Primary'], nextjs-portal"))
        .map((el) => ({ el, r: el.getBoundingClientRect() }))
        .filter(({ r }) => r.width > 0 && r.height > 0 && r.bottom > 0 && r.top < window.innerHeight)
        .map(({ el, r }) => ({ what: `${el.tagName.toLowerCase()} ${el.getAttribute("aria-label") ?? ""}`.trim(), top: Math.round(r.top), height: Math.round(r.height) })),
    );
    expect(pinned, JSON.stringify(pinned)).toHaveLength(1);
    expect(pinned[0].what).toBe("nav Lesson contents");
    expect(pinned[0].top).toBe(0);
    expect(pinned[0].height).toBeLessThanOrEqual(47);

    // The bar opens every row; Escape closes it and gives the keyboard back to the bar.
    const bar = page.getByRole("navigation", { name: "Lesson contents" }).locator("button[aria-expanded]").first();
    await bar.click();
    await expect(bar).toHaveAttribute("aria-expanded", "true");
    await expect(page.getByRole("navigation", { name: "Lesson contents" }).locator("li button:visible")).not.toHaveCount(0);
    await page.keyboard.press("Escape");
    await expect(bar).toHaveAttribute("aria-expanded", "false");
    await expect(bar).toBeFocused();
  });
});

/**
 * Read v2 on the trial topic (TRIAL-BRIEF.md, the read row; art direction v2 §8.4 and §9). Measured, not looked at: one
 * centred column with the app's rail folded to its icons, nothing pinned beside the text at any width, the track and its
 * Contents popover (closed by default), Continue at the end of each section, and the gate's rhythm and marked states as
 * Slides draws them. 23 Sep before: a 240 px app rail and a 200 px contents rail sticky beside the text, the column at
 * x = 512 with 272 px to its left and 48 px to its right; a gate stem at 18/19 px, 12 px above the options, 8 px apart.
 */
test.describe("Read v2 on the trial topic: one column, a track, Continue", () => {
  test("at 1280 x 800 the lesson is one centred column, the app's rail is icons, and only the track is pinned", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await openTrial(page);
    const { width } = await proseBox(page);
    expect(width, "prose width").toBeGreaterThanOrEqual(640);
    expect(width, "prose width").toBeLessThanOrEqual(720);

    const geo = await page.evaluate(() => {
      const rail = document.querySelector<HTMLElement>("nav[aria-label='Primary'][data-folded]")!.getBoundingClientRect();
      const col = document.querySelector<HTMLElement>("[data-read='v2']")!.getBoundingClientRect();
      return { rail: Math.round(rail.width), col: Math.round(col.width), left: Math.round(col.left - rail.right), right: Math.round(document.documentElement.clientWidth - col.right) };
    });
    expect(geo.rail, "the app's rail folded to its icons").toBeLessThanOrEqual(64);
    expect(geo.col).toBeLessThanOrEqual(720);
    expect(Math.abs(geo.left - geo.right), `centred: ${geo.left} px to its left, ${geo.right} px to its right`).toBeLessThanOrEqual(2);
    // Folded, every destination keeps its name.
    const rail = page.locator("nav[aria-label='Primary']:visible");
    for (const name of ["Today", "Learn", "Practise", "Papers", "Map"]) await expect(rail.getByRole("link", { name })).toBeVisible();

    // Inside the lesson the track is the one thing pinned, above the text and never beside it.
    await page.evaluate(() => window.scrollTo(0, document.getElementById("note")!.getBoundingClientRect().top + window.scrollY + 200));
    await page.waitForTimeout(300);
    const held = await pinnedThings(page);
    expect(held, JSON.stringify(held)).toHaveLength(1);
    expect(held[0].track).toBe(true);
    expect(held[0].beside).toBe(false);
    expect(held[0].top).toBe(0);
  });

  test("at every width nothing is pinned beside the text and nothing scrolls sideways", async ({ page }) => {
    for (const width of [390, 768, 1024, 1440]) {
      await page.setViewportSize({ width, height: 900 });
      await openTrial(page);
      await page.evaluate(() => window.scrollTo(0, document.getElementById("note")!.getBoundingClientRect().top + window.scrollY + 200));
      await page.waitForTimeout(300);
      const held = await pinnedThings(page);
      expect(held.filter((h) => h.beside), `pinned beside the text at ${width}: ${JSON.stringify(held)}`).toEqual([]);
      expect(held.map((h) => h.track), `pinned at ${width}: ${JSON.stringify(held)}`).toEqual([true]);
      await expectNoHorizontalOverflow(page);
    }
  });

  test("the track says where she is; Contents opens a popover, closed by default, whose rows take her there", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await openTrial(page);
    const track = page.locator("[data-read-track]");
    await expect(track.locator("p")).toContainText("1 of 7");
    await expect(track.locator("p")).toContainText("Simplifying algebraic fractions");
    await expect(track.locator("[data-segment]")).toHaveCount(7);

    const contents = track.getByRole("button", { name: /^Contents$/ });
    await expect(contents).toHaveAttribute("aria-expanded", "false");
    await expect(track.locator("ol button")).toHaveCount(0);
    await contents.click();
    await expect(contents).toHaveAttribute("aria-expanded", "true");
    const rows = track.locator("ol > li > button");
    await expect(rows).toHaveCount(7);
    await expect(rows.first()).toHaveAttribute("aria-current", "location");
    await expect(track.getByRole("button", { name: /^Worked examples/ })).toBeVisible();

    // Escape closes it and gives the keyboard back to the button.
    await page.keyboard.press("Escape");
    await expect(contents).toHaveAttribute("aria-expanded", "false");
    await expect(contents).toBeFocused();

    // A section not open yet takes her to the check that opens it, under the bar, with the keyboard there.
    await contents.click();
    await rows.nth(2).click();
    await expect(contents).toHaveAttribute("aria-expanded", "false");
    const landed = await page.evaluate(() => {
      const a = document.activeElement as HTMLElement;
      return { gate: a.getAttribute("data-gate"), top: Math.round(a.getBoundingClientRect().top), bar: Math.round(document.querySelector("[data-read-track]")!.getBoundingClientRect().bottom) };
    });
    expect(landed.gate).toBe("g1");
    expect(landed.top, `the check at ${landed.top} px, the bar ends at ${landed.bar} px`).toBeGreaterThanOrEqual(landed.bar);

    // Never remembered open.
    await contents.click();
    await page.reload();
    await expect(page.locator("#note article")).toBeVisible();
    await expect(page.locator("[data-read-track]").getByRole("button", { name: /^Contents$/ })).toHaveAttribute("aria-expanded", "false");
  });

  test("each section ends in Continue and Pause here; Continue opens the next under the bar and places a segment", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await openTrial(page);
    const gates = await trialGates(page);
    await expect(page.locator("#note [data-lesson-section]")).toHaveCount(1);
    await expect(page.locator("#note [data-continue]")).toHaveCount(0);

    await answerGate(page, gates[0]);
    // The verdict takes the keyboard (the Check that had it is gone), and the section ends in its two ways on.
    await expect(page.locator('#note [data-gate="g1"] [data-verdict-block]')).toBeFocused();
    const end = page.locator('#note [data-section-end="1"]');
    await expect(end.getByRole("button", { name: /^Continue/ })).toBeVisible();
    await expect(end.getByRole("link", { name: /^Pause here/ })).toHaveAttribute("href", "/");
    await expect(page.locator("#note [data-lesson-section]")).toHaveCount(1);

    await end.getByRole("button", { name: /^Continue/ }).click();
    await expect(page.locator("#note [data-lesson-section]")).toHaveCount(2);
    const next = await page.evaluate(() => {
      const a = document.activeElement as HTMLElement;
      return { section: a.getAttribute("data-section"), top: Math.round(a.getBoundingClientRect().top), bar: Math.round(document.querySelector("[data-read-track]")!.getBoundingClientRect().bottom) };
    });
    expect(next.section, "the keyboard is on section 2's heading").toBe("1");
    expect(next.top, `the heading at ${next.top} px, the bar ends at ${next.bar} px`).toBeGreaterThan(next.bar);
    await expect(page.locator("[data-read-track] p")).toContainText("2 of 7");
    await expect(page.locator("[data-read-track] [data-segment]").first()).toHaveAttribute("data-segment", "done");

    // Her place is kept: after a reload the lesson opens as far as she had come, and no further, and the hero's Read way
    // in takes her to that section's heading, clear of the bar.
    await page.reload();
    await expect(page.locator("#note article")).toBeVisible();
    await expect(page.locator("#note [data-lesson-section]")).toHaveCount(2);
    await page.locator(`${MAIN} header button[data-way="read"]`).click();
    await expect(page.locator('#note h3[data-section="1"]')).toBeFocused();
    const back = await page.evaluate(() => ({
      top: Math.round(document.activeElement!.getBoundingClientRect().top),
      bar: Math.round(document.querySelector("[data-read-track]")!.getBoundingClientRect().bottom),
    }));
    expect(back.top, `the heading at ${back.top} px, the bar ends at ${back.bar} px`).toBeGreaterThan(back.bar);
  });

  test("the gate answers to the keyboard: arrows choose, Enter checks, and Continue is the next stop", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await openTrial(page);
    const gate = page.locator('#note [data-gate="g1"]');
    const options = gate.getByRole("radio");
    // One stop for the group: the first option until one is chosen.
    await expect(options.nth(0)).toHaveAttribute("tabindex", "0");
    await expect(options.nth(1)).toHaveAttribute("tabindex", "-1");
    await options.nth(0).focus();
    await page.keyboard.press("ArrowDown");
    await expect(options.nth(1)).toHaveAttribute("aria-checked", "true");
    await expect(options.nth(1)).toBeFocused();
    await page.keyboard.press("ArrowUp");
    await expect(options.nth(0)).toHaveAttribute("aria-checked", "true");
    // Nothing is marked until she checks. Down to the right answer, wherever the gate's order put it.
    await expect(gate.locator("[data-verdict]")).toHaveCount(0);
    const g1 = (await trialGates(page)).find((g) => g.id === "g1")!;
    const right = await optionAt(page, "g1", (v) => v === g1.answer);
    for (let i = 0; i < right; i += 1) await page.keyboard.press("ArrowDown");
    await expect(options.nth(right)).toHaveAttribute("aria-checked", "true");
    await page.keyboard.press("Enter");
    await expect(gate.locator("[data-verdict]")).toHaveText("Yes.");
    await expect(gate.locator("[data-verdict-block]")).toBeFocused();
    await page.keyboard.press("Tab");
    await expect(page.locator('#note [data-section-end="1"] [data-continue]')).toBeFocused();
    await page.keyboard.press("Enter");
    await expect(page.locator('#note h3[data-section="1"]')).toBeFocused();
  });

  for (const size of [
    { name: "phone", width: 390, height: 844, stem: 20, maths: 28, stemToMaths: 16, toAnswer: 20 },
    { name: "desktop", width: 1280, height: 800, stem: 22, maths: 32, stemToMaths: 20, toAnswer: 24 },
  ]) {
    test(`on the ${size.name} a gate keeps §8.4's rhythm: the stem, its maths on its own line, the answer`, async ({ page }) => {
      await page.setViewportSize({ width: size.width, height: size.height });
      await openTrial(page);
      const gates = await trialGates(page);
      const byId = Object.fromEntries(gates.map((g) => [g.id, g]));
      const rhythm = (id: string) =>
        page.locator(`#note [data-gate="${id}"]`).evaluate((box) => {
          const r = (el: Element | null) => el!.getBoundingClientRect();
          const lead = box.querySelector("[data-stem-lead]");
          const maths = box.querySelector("[data-stem-maths]");
          const tail = box.querySelector("[data-stem-tail]");
          const options = Array.from(box.querySelectorAll("[role=radio]"));
          const question = tail ?? maths ?? lead;
          return {
            stem: parseFloat(getComputedStyle(lead!).fontSize),
            maths: maths ? parseFloat(getComputedStyle(maths.querySelector(".katex")!).fontSize) : null,
            stemToMaths: maths ? r(maths).top - r(lead).bottom : null,
            mathsToTail: tail && maths ? r(tail).top - r(maths).bottom : null,
            toAnswer: r(options[0]).top - r(question).bottom,
            heights: options.map((o) => r(o).height),
            gaps: options.slice(1).map((o, i) => r(o).top - r(options[i]).bottom),
          };
        });
      const near = (a: number | null, b: number) => expect(Math.abs((a ?? -99) - b), `${a} against ${b}`).toBeLessThanOrEqual(1);

      // g1: a stem with no maths of its own line.
      const g1 = await rhythm("g1");
      expect(g1.stem).toBe(size.stem);
      near(g1.toAnswer, size.toAnswer);
      for (const h of g1.heights) expect(h).toBeGreaterThanOrEqual(52);
      for (const gap of g1.gaps) near(gap, 10);

      // On to g4, whose fraction ends its instruction and stands on its own line.
      await answerGate(page, byId.g1);
      await page.locator("#note [data-continue]").click();
      await answerGate(page, byId.g2);
      await page.locator("#note [data-continue]").click();
      await answerGate(page, byId.g7);
      await answerGate(page, byId.g3);
      await page.locator("#note [data-continue]").click();
      const g4 = await rhythm("g4");
      expect(g4.stem).toBe(size.stem);
      expect(g4.maths).toBe(size.maths);
      near(g4.stemToMaths, size.stemToMaths);
      near(g4.toAnswer, size.toAnswer);

      // g6: the words after the maths come back at the same gap, then the answer.
      await answerGate(page, byId.g4);
      await page.locator("#note [data-continue]").click();
      await answerGate(page, byId.g5);
      const g6 = await rhythm("g6");
      expect(g6.maths).toBe(size.maths);
      near(g6.stemToMaths, size.stemToMaths);
      near(g6.mathsToTail, size.stemToMaths);
      near(g6.toAnswer, size.toAnswer);
    });
  }

  test("a miss lights the right answer in fern, edges hers, says 'Not quite.' with the consequence drawn, and nothing is red", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await openTrial(page);
    const gates = await trialGates(page);
    await answerGate(page, gates[0]);
    await page.locator("#note [data-continue]").click();
    await answerGate(page, gates[1], false);

    const box = page.locator('#note [data-gate="g2"]');
    await expect(box.locator('[data-option="ok"]')).toHaveCount(1);
    await expect(box.locator('[data-option="ok"]')).toHaveAttribute("aria-checked", "false");
    await expect(box.locator('[data-option="miss"]')).toHaveCount(1);
    await expect(box.locator('[data-option="miss"]')).toHaveAttribute("aria-checked", "true");
    const verdict = box.locator("[data-verdict]");
    await expect(verdict).toHaveText("Not quite.");
    expect(await verdict.evaluate((el) => getComputedStyle(el).fontSize)).toBe("21px");
    // The consequence, drawn: x = 1 put into both.
    await expect(box.locator('[data-reaction="afs.substitute"]')).toBeVisible();
    await expect(page.locator("#main").getByText(/\bWrong\b/)).toHaveCount(0);

    // No colour on the gate or its verdict within 20 degrees of red (LCH hue 20-60 at chroma over 20).
    const reds = await box.evaluate((root) => {
      const canvas = document.createElement("canvas");
      canvas.width = canvas.height = 1;
      const ctx = canvas.getContext("2d", { willReadFrequently: true })!;
      const lin = (v: number) => (v / 255 <= 0.04045 ? v / 255 / 12.92 : Math.pow((v / 255 + 0.055) / 1.055, 2.4));
      const f = (t: number) => (t > 216 / 24389 ? Math.cbrt(t) : (24389 / 27 * t + 16) / 116);
      const lch = (color: string) => {
        ctx.clearRect(0, 0, 1, 1);
        ctx.fillStyle = "#000";
        ctx.fillStyle = color;
        ctx.fillRect(0, 0, 1, 1);
        const [R, G, B, A] = ctx.getImageData(0, 0, 1, 1).data;
        if (A === 0) return null;
        const [r, g, b] = [lin(R), lin(G), lin(B)];
        const [x, y, z] = [0.4124 * r + 0.3576 * g + 0.1805 * b, 0.2126 * r + 0.7152 * g + 0.0722 * b, 0.0193 * r + 0.1192 * g + 0.9505 * b];
        const [fx, fy, fz] = [f(x / 0.95047), f(y), f(z / 1.08883)];
        const a = 500 * (fx - fy);
        const bb = 200 * (fy - fz);
        return { c: Math.hypot(a, bb), h: ((Math.atan2(bb, a) * 180) / Math.PI + 360) % 360 };
      };
      const out: string[] = [];
      for (const el of [root, ...Array.from(root.querySelectorAll("*"))]) {
        const cs = getComputedStyle(el);
        for (const prop of ["color", "backgroundColor", "borderTopColor", "borderLeftColor", "fill", "stroke"] as const) {
          const v = cs[prop];
          if (!v || v === "none" || v.startsWith("url")) continue;
          const c = lch(v);
          if (c && c.c > 20 && c.h >= 20 && c.h <= 60) out.push(`${el.tagName.toLowerCase()} ${prop} ${v}`);
        }
      }
      return out;
    });
    expect(reds).toEqual([]);

    // Under reduced motion nothing is left moving.
    expect(await page.evaluate(() => document.getAnimations().length)).toBe(0);
  });

  test("on a phone the track is the one thing pinned besides the tab bar, and its popover fits the screen", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await openTrial(page);
    await page.evaluate(() => window.scrollTo(0, document.getElementById("note")!.getBoundingClientRect().top + window.scrollY + 200));
    await page.waitForTimeout(300);
    const held = await pinnedThings(page);
    expect(held, JSON.stringify(held)).toHaveLength(1);
    expect(held[0].track).toBe(true);
    expect(held[0].top).toBe(0);
    expect(held[0].height).toBeLessThanOrEqual(56);

    const contents = page.locator("[data-read-track]").getByRole("button", { name: /^Contents$/ });
    await contents.click();
    await expect(contents).toHaveAttribute("aria-expanded", "true");
    const panel = await page.locator("[data-read-track] ol").evaluate((el) => {
      const r = el.parentElement!.getBoundingClientRect();
      return { left: r.left, right: r.right, bottom: r.bottom };
    });
    expect(panel.left).toBeGreaterThanOrEqual(0);
    expect(panel.right).toBeLessThanOrEqual(390);
    // Above the tab bar.
    expect(panel.bottom).toBeLessThanOrEqual(844 - 57);
    // A tap outside closes it.
    await page.mouse.click(4, 420);
    await expect(contents).toHaveAttribute("aria-expanded", "false");
    await expectNoHorizontalOverflow(page);
  });
});

/**
 * The focused element's ring as painted: its outline and box-shadow, and the outline's colour against the accent of the
 * place it sits in and against the page, all resolved to sRGB by the browser (a probe beside it reads the accent there).
 */
async function ringOf(locator: ReturnType<Page["locator"]>) {
  return locator.evaluate((el) => {
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = 1;
    const ctx = canvas.getContext("2d", { willReadFrequently: true })!;
    const rgb = (color: string) => {
      ctx.clearRect(0, 0, 1, 1);
      ctx.fillStyle = "#000";
      ctx.fillStyle = color;
      ctx.fillRect(0, 0, 1, 1);
      return Array.from(ctx.getImageData(0, 0, 1, 1).data.slice(0, 3));
    };
    const lum = (c: number[]) => c.map((v) => (v / 255 <= 0.04045 ? v / 255 / 12.92 : Math.pow((v / 255 + 0.055) / 1.055, 2.4))).reduce((s, v, i) => s + v * [0.2126, 0.7152, 0.0722][i], 0);
    const probe = document.createElement("span");
    probe.style.color = "var(--accent)";
    el.parentElement!.appendChild(probe);
    const accent = rgb(getComputedStyle(probe).color);
    probe.remove();
    const cs = getComputedStyle(el);
    const ring = rgb(cs.outlineColor);
    const ground = rgb(getComputedStyle(document.body).backgroundColor);
    const [a, b] = [lum(ring), lum(ground)];
    return {
      style: cs.outlineStyle,
      width: cs.outlineWidth,
      shadow: cs.boxShadow,
      accent: ring.every((v, i) => Math.abs(v - accent[i]) <= 1),
      contrast: (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05),
    };
  });
}

/**
 * The owner's trial (24 Sep 2026): "a purple rectangular line around the texts that appears but disappears when I click
 * on something". The page moves the keyboard by script to a landing place (the next heading after Continue), and
 * Chrome ringed it as soon as any key was pressed, Space or an arrow to scroll included. The ring now follows keyboard
 * navigation only (shell/input-modality.ts, html[data-input]; app/globals.css): a pointer lands without it, reading keys
 * keep it off, Tab and a key pressed on a control bring it, on buttons and options alike, in every theme.
 */
test.describe("Focus: the ring follows the keyboard, not the page", () => {
  test("a pointer on Continue lands on the next heading with no ring; Space and the arrows keep it off; Tab rings the next control", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await openTrial(page);
    const html = page.locator("html");
    await expect(html).toHaveAttribute("data-input", "pointer");
    const gates = await trialGates(page);
    await answerGate(page, gates[0]);
    await page.locator('#note [data-section-end="1"] [data-continue]').click();

    const heading = page.locator('#note h3[data-section="1"]');
    await expect(heading).toBeFocused();
    expect(await ringOf(heading)).toMatchObject({ style: "none", shadow: "none" });

    // Reading on with the keyboard scrolls the page: the heading keeps the focus and stays unringed.
    for (const key of ["ArrowDown", " ", "ArrowUp"]) {
      await page.keyboard.press(key);
      await expect(heading).toBeFocused();
      await expect(html).toHaveAttribute("data-input", "pointer");
      expect(await ringOf(heading), `after ${JSON.stringify(key)}`).toMatchObject({ style: "none", shadow: "none" });
    }

    // Tab moves the keyboard on: the next control, g2's first option, wears the accent ring.
    await page.keyboard.press("Tab");
    await expect(html).toHaveAttribute("data-input", "keyboard");
    const option = page.locator('#note [data-gate="g2"] [role=radio][tabindex="0"]');
    await expect(option).toBeFocused();
    expect(await ringOf(option)).toMatchObject({ style: "solid", width: "2px", accent: true });
  });

  test("keyboard Enter on Continue lands on the next heading with the accent ring, and Continue wears it too", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await openTrial(page);
    const gates = await trialGates(page);
    await answerGate(page, gates[0]);
    // The verdict has the keyboard after Check; Tab goes on to Continue, a button, which is ringed.
    await page.keyboard.press("Tab");
    const cont = page.locator('#note [data-section-end="1"] [data-continue]');
    await expect(cont).toBeFocused();
    expect(await ringOf(cont)).toMatchObject({ style: "solid", width: "2px", accent: true });

    await page.keyboard.press("Enter");
    const heading = page.locator('#note h3[data-section="1"]');
    await expect(heading).toBeFocused();
    await expect(page.locator("html")).toHaveAttribute("data-input", "keyboard");
    expect(await ringOf(heading)).toMatchObject({ style: "solid", width: "2px", accent: true });
    // A keyboard reader who scrolls on keeps her ring.
    await page.keyboard.press("ArrowDown");
    expect(await ringOf(heading)).toMatchObject({ style: "solid", width: "2px" });
  });

  test("high contrast keeps a visible keyboard ring in its own accent", async ({ page }) => {
    await openTrial(page);
    await page.evaluate(() => localStorage.setItem("cairn.theme", "hc"));
    await openTrial(page);
    await expect(page.locator("html")).toHaveAttribute("data-theme", "hc");
    await page.keyboard.press("Tab");
    const focused = page.locator(":focus");
    await expect(focused).toHaveCount(1);
    const ring = await ringOf(focused);
    expect(ring).toMatchObject({ style: "solid", width: "2px", accent: true });
    expect(ring.contrast, "the ring against the paper").toBeGreaterThanOrEqual(3);
  });
});

/** The hero's ways in as painted: which one is filled with the accent of the place it sits in, and what it says. */
async function heroWays(page: Page) {
  return page.locator(`${MAIN} header [data-way]`).evaluateAll((els) => {
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = 1;
    const ctx = canvas.getContext("2d", { willReadFrequently: true })!;
    const rgb = (color: string) => {
      ctx.clearRect(0, 0, 1, 1);
      ctx.fillStyle = "#000";
      ctx.fillStyle = color;
      ctx.fillRect(0, 0, 1, 1);
      const d = ctx.getImageData(0, 0, 1, 1).data;
      return d[3] === 0 ? null : [d[0], d[1], d[2]];
    };
    return els.map((el) => {
      const probe = document.createElement("span");
      probe.style.color = "var(--accent)";
      el.parentElement!.appendChild(probe);
      const accent = rgb(getComputedStyle(probe).color)!;
      probe.remove();
      const bg = rgb(getComputedStyle(el).backgroundColor);
      return { way: el.getAttribute("data-way"), text: (el.textContent ?? "").trim(), accent: bg !== null && bg.every((v, i) => Math.abs(v - accent[i]) <= 1) };
    });
  });
}

/**
 * Decision 17 and art direction v2 §8.2: Slides is the primary way in on both sizes, and "Start the slides" carries the
 * accent unless she chose Read herself. The audit (CQ-01, 24 Sep) found the accent moved to Read on any device holding
 * one answer on the topic, and (CQ-10) that the first paint showed Read on the accent for half a second before swapping.
 */
test.describe("The way in: Slides carries the accent until she chooses Read herself", () => {
  test("her answers on the topic never move the accent, nothing swaps after the first paint, and her own choice of Read does", async ({ page }) => {
    // Every state the two ways in pass through, from the first paint.
    await page.addInitScript(() => {
      const w = window as unknown as { __ways: string[] };
      w.__ways = [];
      const snap = () => {
        const els = Array.from(document.querySelectorAll("header [data-way]"));
        if (els.length === 0) return;
        const s = els.map((el) => `${el.getAttribute("data-way")}:${/(^|\s)bg-accent(\s|$)/.test(el.getAttribute("class") ?? "") ? "accent" : "outline"}`).join(" ");
        if (w.__ways[w.__ways.length - 1] !== s) w.__ways.push(s);
      };
      new MutationObserver(snap).observe(document, { subtree: true, childList: true, attributes: true });
      document.addEventListener("DOMContentLoaded", snap);
    });
    const painted = () => page.evaluate(() => (window as unknown as { __ways: string[] }).__ways);

    await page.setViewportSize({ width: 390, height: 844 });
    await openTrial(page);
    let ways = await heroWays(page);
    expect(ways.map((w) => [w.way, w.accent])).toEqual([["slides", true], ["read", false]]);
    expect(await painted(), "a first visit never shows Read on the accent").toEqual(["slides:accent read:outline"]);

    // Evidence, and no choice: g1 answered in Read under the hero, and a mastery row from an earlier week.
    const gates = await trialGates(page);
    await answerGate(page, gates[0]);
    await expect
      .poll(() =>
        page.evaluate(
          () =>
            new Promise<number>((resolve) => {
              const open = indexedDB.open("ccea-study");
              open.onerror = () => resolve(-1);
              open.onsuccess = () => {
                const db = open.result;
                const all = db.transaction("attempts").objectStore("attempts").getAll();
                all.onsuccess = () => {
                  db.close();
                  resolve((all.result as Array<{ itemId: string }>).filter((r) => r.itemId.endsWith("#gate:g1")).length);
                };
                all.onerror = () => resolve(-1);
              };
            }),
        ),
      )
      .toBe(1);
    const seeded = await page.evaluate(
      () =>
        new Promise<string | null>((resolve) => {
          const open = indexedDB.open("ccea-study");
          open.onerror = () => resolve("open failed");
          open.onsuccess = () => {
            const db = open.result;
            const tx = db.transaction("mastery", "readwrite");
            const at = new Date("2026-09-13T19:00:00");
            tx.objectStore("mastery").put({ key: "further-maths:algebraic-fractions-simplify", subject: "further-maths", topicSlug: "algebraic-fractions-simplify", level: "attempted", score: 0.2, lastEvidenceAt: at, updatedAt: at });
            tx.oncomplete = () => {
              db.close();
              resolve(null);
            };
            tx.onerror = () => resolve(`write failed: ${tx.error?.message}`);
          };
        }),
    );
    expect(seeded).toBeNull();
    await openTrial(page);
    await expect(page.locator(`${MAIN} header button[data-way="read"]`)).toHaveText("Read on from section 2");
    ways = await heroWays(page);
    expect(ways.map((w) => [w.way, w.accent]), JSON.stringify(ways)).toEqual([["slides", true], ["read", false]]);
    expect(ways[0].text).toMatch(/^Start the slides/);
    expect(new Set(await painted()), "Slides held the accent from the first paint").toEqual(new Set(["slides:accent read:outline"]));
    expect(await page.evaluate(() => localStorage.getItem("cairn.lessonWay"))).toBeNull();

    // She chooses Read herself: from then on Read carries the accent, and it says where she was.
    await page.locator(`${MAIN} header button[data-way="read"]`).click();
    await expect.poll(() => page.evaluate(() => localStorage.getItem("cairn.lessonWay"))).toBe("read");
    await openTrial(page);
    await expect(page.locator(`${MAIN} header button[data-way="read"]`)).toHaveText("Continue at section 2");
    ways = await heroWays(page);
    expect(ways.map((w) => [w.way, w.accent]), JSON.stringify(ways)).toEqual([["read", true], ["slides", false]]);
  });
});

/**
 * One truth per way in (audit LD-04, CT-12, CD-12, 24 Sep): the hero said "About 9 minutes · 7 sections" beside a
 * "Start the slides · 25 cards" whose title card said "About 11 minutes", and neither named the video. Now each way is
 * named on the hero with its own minutes and size, and each number is the one that way prints itself: Read's in its
 * track and Contents, Slides' on its Start button and its title card.
 */
test.describe("The way in: each way states its own numbers, the ones it prints itself", () => {
  test("the hero's Slides and Read lines agree with the Slides title card, the Start button and the Read track", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await openTrial(page);
    const num = (text: string, re: RegExp) => Number(re.exec(text)?.[1] ?? Number.NaN);
    const slidesLine = (await page.locator(`${MAIN} header [data-way-length="slides"]`).textContent()) ?? "";
    const readLine = (await page.locator(`${MAIN} header [data-way-length="read"]`).textContent()) ?? "";
    expect(slidesLine).toMatch(/^Slides: about \d+ minutes? plus a video\s*·\s*,?\s*\d+ cards$/);
    expect(readLine).toMatch(/^Read: about \d+ minutes? plus a video\s*·\s*,?\s*\d+ sections$/);
    const slides = { minutes: num(slidesLine, /about (\d+) minute/), cards: num(slidesLine, /(\d+) cards/) };
    const read = { minutes: num(readLine, /about (\d+) minute/), sections: num(readLine, /(\d+) sections/) };

    // Read's numbers are the track's: "1 of 7", and the Contents heading's minutes with the same video named.
    const track = page.locator("[data-read-track]");
    await expect(track.locator("p").first()).toContainText(`1 of ${read.sections}`);
    await track.getByRole("button", { name: /^Contents$/ }).click();
    await expect(track).toContainText(`The lesson · about ${read.minutes} minutes plus a video`);
    await page.keyboard.press("Escape");

    // Slides' numbers are its Start button's and its title card's.
    await expect(page.locator(`${MAIN} header a[data-way="slides"]`)).toHaveText(`Start the slides · ${slides.cards} cards`);
    await page.locator(`${MAIN} header a[data-way="slides"]`).click();
    const promise = page.locator("[data-card='title'] [data-promise]");
    await expect(promise).toBeVisible();
    const card = (await promise.textContent()) ?? "";
    expect(num(card, /About (\d+) minute/), card).toBe(slides.minutes);
    expect(num(card, /(\d+) cards/), card).toBe(slides.cards);
    expect(card).toContain("plus a video");
  });

  test("the lede's fractions sit in their line at the inline size, at 390 and 1280", async ({ page }) => {
    // Build 7: "12/18 cancels to 2/3" set as two full-size stacked fractions, numerals 18.7 px in a 17 px line (19.8 in
    // 18 at 1280), so the first line stood about 12 px taller than the rest (audit CD-06, CT-13).
    for (const size of [
      { width: 390, height: 844 },
      { width: 1280, height: 800 },
    ]) {
      await page.setViewportSize(size);
      await openTrial(page);
      const lede = await page.locator(`${MAIN} header [data-hero-lede]`).evaluate((el) => {
        const cs = getComputedStyle(el);
        const numerals = Array.from(el.querySelectorAll(".katex-html .mfrac .mord"))
          .filter((m) => m.children.length === 0 && /\d/.test(m.textContent ?? ""))
          .map((m) => parseFloat(getComputedStyle(m).fontSize));
        return { font: parseFloat(cs.fontSize), line: parseFloat(cs.lineHeight), height: el.getBoundingClientRect().height, numerals };
      });
      expect(lede.numerals.length, "the lede's fractions").toBeGreaterThan(0);
      for (const px of lede.numerals) {
        expect(px, `a numeral at ${size.width}`).toBeLessThan(lede.font);
        expect(px, `a numeral at ${size.width}: the 13 px floor`).toBeGreaterThanOrEqual(13 - 0.01);
      }
      // Every line the same height: the lede is a whole number of lines.
      const lines = lede.height / lede.line;
      expect(Math.abs(lines - Math.round(lines)), `${lede.height} px over ${lede.line} px lines at ${size.width}`).toBeLessThan(0.1);
    }
  });
});

/**
 * "Practise this topic" on the Slides close links to the topic's #practice, and the page used to stay on its hero with
 * the Practice stage 11,000 px below and nothing focused (audit LD-02, CQ-06, 24 Sep): the stage is drawn only after the
 * lesson loads, when the browser and the router have already looked for it. A link naming a stage now lands on it, with
 * the keyboard there, on a fresh load and on an in-app navigation, and the stage stays put while the lesson above it
 * settles.
 */
test.describe("Landing on a stage: a link to Practice arrives at Practice", () => {
  /** Where the stage sits against its own scroll margin, and whether it has the keyboard. */
  async function landed(page: Page) {
    return page.locator("#practice").evaluate((el) => ({
      offset: Math.round(el.getBoundingClientRect().top - (parseFloat(getComputedStyle(el).scrollMarginTop) || 0)),
      focused: document.activeElement === el,
      scrollY: Math.round(window.scrollY),
    }));
  }

  for (const size of [
    { width: 390, height: 844 },
    { width: 1280, height: 800 },
  ]) {
    test(`at ${size.width}, on a fresh load and from the Slides close`, async ({ page }) => {
      await page.setViewportSize(size);
      // A fresh load of the link.
      await page.goto(`${TRIAL.path}#practice`);
      await expect(page.locator("#practice")).toBeFocused();
      await expect.poll(async () => Math.abs((await landed(page)).offset)).toBeLessThanOrEqual(2);
      // Still there once the lesson above has settled.
      await page.waitForTimeout(1500);
      let at = await landed(page);
      expect(Math.abs(at.offset), JSON.stringify(at)).toBeLessThanOrEqual(2);
      expect(at.scrollY).toBeGreaterThan(size.height);
      // Arrived by a link, not by the keyboard: no ring.
      expect(await page.locator("#practice").evaluate((el) => getComputedStyle(el).outlineStyle)).toBe("none");

      // In the app: the close's own link, with the run restored at its last card.
      await page.evaluate(() =>
        localStorage.setItem("cairn.slides.fm.u1.algebraic-fractions-simplify", JSON.stringify({ at: 999, done: false, missed: [], answers: {}, checked: {}, graded: {} })),
      );
      await page.goto(`${TRIAL.path}slides/`);
      await page.getByRole("link", { name: /^Practise this topic$/ }).click();
      await expect(page).toHaveURL(/#practice$/);
      await expect(page.locator("#practice")).toBeFocused();
      await expect.poll(async () => Math.abs((await landed(page)).offset)).toBeLessThanOrEqual(2);
      await page.waitForTimeout(1500);
      at = await landed(page);
      expect(Math.abs(at.offset), JSON.stringify(at)).toBeLessThanOrEqual(2);
      expect(at.focused).toBe(true);
    });
  }
});

/**
 * GCSE Further Mathematics sets no tier (its specification gives none; the bundle says "untiered"), yet every Further
 * Maths topic page said "Higher tier only" (audit CT-06, 24 Sep): the catalogue wrote "H" for all of them. The page says
 * nothing about tiers for an untiered qualification, on a published topic and on one still being written.
 */
test.describe("Tiers: an untiered qualification is never called Higher", () => {
  test("the trial topic's 'On the paper' and an unpublished Further Maths topic say nothing about a tier", async ({ page }) => {
    await openTrial(page);
    const onThePaper = page.locator("section[aria-labelledby='ref-spec']");
    await expect(onThePaper).toContainText("Examined in FM1 · calculator allowed");
    await expect(onThePaper).not.toContainText(/higher|tier/i);

    // A topic with no lesson yet shows the specification instead, with the same line.
    await page.goto("/learn/further-maths/FM4/counting-principles/");
    const spec = page.getByRole("heading", { level: 2, name: /^What the specification says$/i }).locator("xpath=..");
    await expect(spec).toContainText("Examined in FM4");
    await expect(spec).not.toContainText(/higher|tier/i);
  });
});

/**
 * The owner ruled the old pill-stack cairn out of the product on the craft floor (art direction v2 §3.1, 23 Sep): the
 * one cairn is CairnArt's. The old drawings (the rail's monogram, CairnStack, the mastery chip's stones) were stacks of
 * lying pills: `rect`s in currentColor, wider than tall, with rx half their height, two or more in one svg. None may
 * render anywhere, and the stones she has placed are still there as data. (The hare's inner ears are standing rects in
 * their own rose, and the Map's weekly chart has bars: neither is a pill.)
 */
test.describe("The cairn: the redrawn one everywhere", () => {
  /** Old cairns on this screen: the old marker, a rect inside the new cairn, or an svg stacking two or more pills. */
  async function oldCairns(page: Page): Promise<number> {
    return page.evaluate(() => {
      const pillsBySvg = new Map<SVGSVGElement, number>();
      for (const r of Array.from(document.querySelectorAll<SVGRectElement>("svg rect"))) {
        const w = Number(r.getAttribute("width"));
        const h = Number(r.getAttribute("height"));
        const rx = Number(r.getAttribute("rx"));
        const ink = r.getAttribute("fill") === "currentColor" || r.getAttribute("stroke") === "currentColor";
        if (!ink || !(w > h && h > 0 && Math.abs(rx * 2 - h) < 0.01)) continue;
        const svg = r.ownerSVGElement!;
        pillsBySvg.set(svg, (pillsBySvg.get(svg) ?? 0) + 1);
      }
      const stacks = Array.from(pillsBySvg.values()).filter((n) => n >= 2).length;
      return document.querySelectorAll("[data-cairn-stack], [data-cairn] svg rect").length + stacks;
    });
  }

  test("first run, Today, the Map and both kinds of topic page draw no pill stack, and the stones are still counted", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto("/welcome/");
    await expect(page.getByRole("button", { name: /^Continue$/ })).toBeVisible();
    expect(await oldCairns(page), "first run").toBe(0);

    await completeFirstRun(page);
    // Five topics proved in FM1: five stones.
    const seeded = await page.evaluate(
      (slugs) =>
        new Promise<string | null>((resolve) => {
          const open = indexedDB.open("ccea-study");
          open.onerror = () => resolve("open failed");
          open.onsuccess = () => {
            const db = open.result;
            const tx = db.transaction("mastery", "readwrite");
            const now = new Date();
            for (const slug of slugs) tx.objectStore("mastery").put({ key: `further-maths:${slug}`, subject: "further-maths", topicSlug: slug, level: "proficient", score: 0.9, lastEvidenceAt: now, updatedAt: now });
            tx.oncomplete = () => {
              db.close();
              resolve(null);
            };
            tx.onerror = () => resolve(`write failed: ${tx.error?.message}`);
          };
        }),
      ["algebraic-fractions-simplify", "algebraic-fractions-add-subtract", "algebraic-fractions-multiply-divide", "completing-the-square", "matrix-inverse-2x2"],
    );
    expect(seeded).toBeNull();

    await page.goto("/");
    await expect(page.getByRole("heading", { level: 1, name: "Today" })).toBeVisible();
    await expect(page.locator("[data-cairn='stones']").first()).toBeVisible();
    expect(await oldCairns(page), "Today").toBe(0);

    await page.goto("/map/");
    const onMap = page.locator("[data-cairn='stones'][data-stones='5']");
    await expect(onMap.first()).toBeVisible();
    await expect(onMap.first().locator("svg")).toHaveAttribute("aria-label", "5 stones");
    expect(await oldCairns(page), "the Map").toBe(0);

    for (const path of [TRIAL.path, TOPICS[0].path]) {
      await page.goto(path);
      await expect(page.locator("#note article")).toBeVisible();
      await expect(page.locator("nav[aria-label='Primary']:visible svg").first()).toBeVisible();
      expect(await oldCairns(page), path).toBe(0);
    }
  });
});
