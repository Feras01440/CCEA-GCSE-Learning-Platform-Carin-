import { expect, test as base, type Locator, type Page } from "@playwright/test";
import { classicTopic, manifestRows, topicContent, trialContent, type Gate, type TopicContent } from "./content";
import {
  MAIN,
  answerReadGate,
  completeFirstRun,
  escapeRegExp,
  expectNoHorizontalOverflow,
  finishReadSection,
  openSections,
  reachReadGate,
  readOnTo,
  readSection,
  showSeeIt,
  trackPlaced,
  walkToLessonEnd,
} from "./helpers";

/**
 * Learn is the spine: three subjects, eight Maths units, topics in teaching order, and two
 * kinds of topic page — one with original content and one that still only has the spec.
 *
 * What a topic's note holds (its sections, its Your turns and their answers, its See its) is read from the content the
 * export serves, through the app's own rules (e2e/content.ts); nothing about a note is typed here. The trial topic is
 * named once, in content.ts, as the subject of the Read v2 walks.
 */

const test = base.extend<{ trial: TopicContent; classic: TopicContent[] }>({
  // The owner's trial topic, read from what the export serves.
  trial: async ({ request }, use) => {
    await use(await trialContent(request));
  },
  // Topics still on the classic page ("Start the lesson", the rail), one per subject. Under READINESS_POLICY "structure"
  // (9 Oct 2026) a migrated note runs Read v2, so these are notes not yet migrated: the lead's three while the content
  // keeps them classic (the appearance spec uses the same three), else the first of their subject that is.
  classic: async ({ request }, use) => {
    await use(
      await Promise.all([
        classicTopic(request, "maths", "box-plots-and-comparing-distributions"),
        classicTopic(request, "further-maths", "pascals-triangle-binomial-expansion"),
        classicTopic(request, "science", "b1-enzyme-factors"),
      ]),
    );
  },
});

// A control that never comes fails in 15 seconds, as an assertion does, never at the 60-second test timeout.
test.use({ actionTimeout: 15_000, navigationTimeout: 30_000 });

const MATHS_UNITS = ["M1", "M2", "M3", "M4", "M5", "M6", "M7", "M8"];

async function hrefs(page: Page, selector: string): Promise<string[]> {
  return page.locator(selector).evaluateAll((els) => els.map((e) => e.getAttribute("href") ?? ""));
}

/**
 * A lesson whose page is still the classic one, as a unit list links it: in M4 while M4 has one (the unit this describe
 * always walked), else in the first Maths unit that does. The content decides, by the rule, on what the export serves.
 */
async function classicLessonLink(page: Page): Promise<{ unit: string; link: Locator; topic: TopicContent }> {
  for (const unit of ["M4", ...MATHS_UNITS.filter((u) => u !== "M4")]) {
    for (const row of manifestRows().filter((r) => r.subject === "maths" && r.unit === unit && r.hasBlocks && r.ready !== true)) {
      const topic = await topicContent(page.request, row);
      if (!topic.readiness.ready) return { unit, topic, link: page.locator(`${MAIN} ol > li[data-built="lesson"] a[href="${topic.path}"]`) };
    }
  }
  throw new Error("no published Maths topic draws the classic page any more: every one is ready");
}

async function openTopic(page: Page, path: string): Promise<void> {
  await page.goto(path);
  await expect(page.getByRole("button", { name: /^Start the lesson$/ })).toBeVisible();
  // The lesson loads on the client just after the hero.
  await expect(page.locator("#note article")).toBeVisible();
  await page.evaluate(() => document.fonts.ready.then(() => true));
}

/**
 * The trial topic, where Read v2 runs (lesson-plan.ts isReadV2): no rail beside the text, a slim track with a Contents
 * popover, Continue at each section's end, and the Your turn drawn as Slides draws it. Its hero offers Slides first on a
 * first visit, so it has no "Start the lesson" to wait for.
 */
async function openTrial(page: Page, trial: TopicContent): Promise<void> {
  await page.goto(trial.path);
  await expect(page.locator(`${MAIN} header h1`)).toBeVisible();
  await expect(page.locator("#note article")).toBeVisible();
  await page.evaluate(() => document.fonts.ready.then(() => true));
}

/** The hero's first way in: "Start the slides" on a first visit, or the Read button that took its place. */
function primaryWayIn(page: Page) {
  return page.locator(`${MAIN} header [data-way]`).first();
}

/** A section's last Your turn, its earlier ones answered first: the one whose verdict comes just before the section's end. */
async function toSectionsLastTurn(page: Page, trial: TopicContent, n: number): Promise<Gate> {
  const ids = trial.read[n - 1]!.gates;
  for (const id of ids.slice(0, -1)) {
    if ((await page.locator(`#note [data-gate="${id}"]`).count()) === 0) await showSeeIt(page, n);
    await answerReadGate(page, trial.gate(id));
  }
  await showSeeIt(page, n);
  const last = trial.gate(ids[ids.length - 1]!);
  await expect(page.locator(`#note [data-gate="${last.id}"]`)).toBeVisible();
  return last;
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
    const { unit, link, topic } = await classicLessonLink(page);
    await page.goto(`/learn/maths/${unit}/`);
    await expect(link).toBeVisible();
    await link.click();
    await expect(page).toHaveURL(new RegExp(`${escapeRegExp(topic.path)}$`));

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

  test("the hero promises what the spine adds up to, on one screen", async ({ page, classic }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await openTopic(page, classic[1]!.path);
    const promised = await page.locator(`${MAIN} header`).first().getByText(/^About \d+ minutes?$/).textContent();
    const stage = await page.locator("#note").getByText(/^Read and check · about \d+ min$/).textContent();
    expect(Number(/\d+/.exec(promised ?? "")?.[0]), `hero "${promised}" against the lesson's "${stage}"`).toBe(Number(/\d+/.exec(stage ?? "")?.[0]));
  });

  test("neither kind of topic page scrolls sideways", async ({ page }) => {
    const { unit, link } = await classicLessonLink(page);
    await page.goto(`/learn/maths/${unit}/`);
    await link.click();
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
  test("Start the lesson is on the first phone screen, within 640 px, on a topic in each subject", async ({ page, classic, trial }) => {
    // 22 Sep, before pass 2a: 1,015 px (maths), 812 px (further maths), 942 px (science).
    await page.setViewportSize({ width: 390, height: 844 });
    for (const topic of classic) {
      await openTopic(page, topic.path);
      await page.evaluate(() => window.scrollTo(0, 0));
      const top = await page.getByRole("button", { name: /^Start the lesson$/ }).evaluate((el) => el.getBoundingClientRect().top);
      expect(top, `Start the lesson at ${Math.round(top)} px on ${topic.path}`).toBeLessThan(640);
    }
    // The trial topic too, under its track: its first way in (Slides on a first visit) within the same 640 px.
    await openTrial(page, trial);
    await page.evaluate(() => window.scrollTo(0, 0));
    const way = primaryWayIn(page);
    await expect(way).toBeVisible();
    const top = await way.evaluate((el) => el.getBoundingClientRect().top);
    expect(top, `the first way in at ${Math.round(top)} px on ${trial.path}`).toBeLessThan(640);
  });

  test("at 1280 x 800 the lesson prose runs 640 to 720 px wide", async ({ page, classic }) => {
    // 22 Sep: 585 px, inside a card capped at 626 px, with 154 px of empty page to its right.
    await page.setViewportSize({ width: 1280, height: 800 });
    for (const topic of classic) {
      await openTopic(page, topic.path);
      const { width } = await proseBox(page);
      expect(width, `prose width on ${topic.path}`).toBeGreaterThanOrEqual(640);
      expect(width, `prose width on ${topic.path}`).toBeLessThanOrEqual(720);
    }
  });

  test("the contents rail is put away with one tap, the prose does not move, and the choice is kept", async ({ page, classic }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await openTopic(page, classic[0]!.path);
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

  test("a section she finishes ends in a place to stop, and next time the button takes her on from there", async ({ page, classic }) => {
    // 04-critique.md §7.10 (a stopping point at every section boundary) and §7.13 (the returning-visit hero).
    const topic = classic[1]!;
    await page.setViewportSize({ width: 390, height: 844 });
    await openTopic(page, topic.path);
    // The note's first check, read from the content it serves; a See it before it (a note part-way to v3) is shown first.
    const gate = topic.gates[0]!;
    const box = page.locator(`#note [data-gate="${gate.id}"]`);
    for (let presses = 0; presses < 20 && (await box.count()) === 0 && (await page.locator("#note [data-next-step]").count()) > 0; presses += 1) {
      await page.locator("#note [data-next-step]").first().click();
    }
    // Options are shown in the gate's own seeded order: found by what they say.
    if (gate.kind === "choice") {
      const at = await box.locator("[role=radio]").evaluateAll((els, v) => els.findIndex((e) => e.getAttribute("data-value") === v), gate.right);
      await box.getByRole("radio").nth(at).click();
    } else {
      await box.locator("input").fill(gate.right);
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

  test("on a phone the spine is one 47 px bar, the only sticky thing besides the tab bar, and it opens the contents", async ({ page, classic }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await openTopic(page, classic[2]!.path);
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
 * Read v2 on the trial topic (TRIAL-BRIEF.md, the read row; art direction v2 §8.4 and §9; lesson structure v3). Measured,
 * not looked at: one centred column with the app's rail folded to its icons, nothing pinned beside the text at any width,
 * the track and its Contents popover (closed by default), a section that explains, shows its See it one step at a time
 * and only then asks its Your turn, Continue at the end of each section, and the Your turn's rhythm and marked states as
 * Slides draws them. 23 Sep before: a 240 px app rail and a 200 px contents rail sticky beside the text, the column at
 * x = 512 with 272 px to its left and 48 px to its right; a gate stem at 18/19 px, 12 px above the options, 8 px apart.
 */
test.describe("Read v2 on the trial topic: one column, a track, Continue", () => {
  test("at 1280 x 800 the lesson is one centred column, the app's rail is icons, and only the track is pinned", async ({ page, trial }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await openTrial(page, trial);
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

  test("at every width nothing is pinned beside the text and nothing scrolls sideways", async ({ page, trial }) => {
    for (const width of [390, 768, 1024, 1440]) {
      await page.setViewportSize({ width, height: 900 });
      await openTrial(page, trial);
      await page.evaluate(() => window.scrollTo(0, document.getElementById("note")!.getBoundingClientRect().top + window.scrollY + 200));
      await page.waitForTimeout(300);
      const held = await pinnedThings(page);
      expect(held.filter((h) => h.beside), `pinned beside the text at ${width}: ${JSON.stringify(held)}`).toEqual([]);
      expect(held.map((h) => h.track), `pinned at ${width}: ${JSON.stringify(held)}`).toEqual([true]);
      await expectNoHorizontalOverflow(page);
    }
  });

  test("a section explains, shows its See it one step per Next step, and only then asks its Your turn", async ({ page, trial }) => {
    // Lesson structure v3 (the teach-first case §6.2; the owner's answer 8): the Your turn mounts once the See it's last
    // step is shown, so nothing is asked before it has been shown. Read from the note: section 1's See it and its steps.
    await page.setViewportSize({ width: 390, height: 844 });
    await openTrial(page, trial);
    const see = trial.read[0]!.sees[0]!;
    expect(see, "section 1 shows a See it before its Your turn").toBeTruthy();
    const box = readSection(page, 1);
    const turn = page.locator(`#note [data-gate="${see.gate}"]`);
    for (let shown = 1; shown <= see.steps; shown += 1) {
      await expect(box.locator("[data-see-it] [data-step]")).toHaveCount(shown);
      await expect(box.locator("[data-see-it] [data-ghost]")).toHaveCount(see.steps - shown);
      if (shown === see.steps) break;
      // Not asked yet, and no way on yet.
      await expect(turn).toHaveCount(0);
      await expect(page.locator("#note [data-continue]")).toHaveCount(0);
      await box.locator("[data-next-step]").click();
    }
    await expect(box.locator("[data-next-step]")).toHaveCount(0);
    await expect(turn).toBeVisible();
    await expect(turn).toHaveAttribute("data-phase", "open");
    await expect(page.locator("#note [data-continue]")).toHaveCount(0);
  });

  test("the track says where she is; Contents opens a popover, closed by default, whose rows take her there", async ({ page, trial }) => {
    const total = trial.read.length;
    await page.setViewportSize({ width: 1280, height: 800 });
    await openTrial(page, trial);
    const track = page.locator("[data-read-track]");
    // "1 of N · 2 min · Why cancelling works…": where she is, what the section costs, and the section's own title.
    await expect(track.locator("p")).toContainText(`1 of ${total}`);
    await expect(track.locator("p")).toContainText(`${trial.read[0]!.minutes} min`);
    await expect(track.locator("p")).toContainText(trial.read[0]!.title);
    // Nothing placed yet: a segment a section while they are wide enough to read, else one bar with nothing filled.
    const drawn = await trackPlaced(page);
    expect(drawn).toMatchObject({ placed: 0, total });
    if (drawn.segments !== null) expect(drawn.segments).toHaveLength(total);

    const contents = track.getByRole("button", { name: /^Contents$/ });
    await expect(contents).toHaveAttribute("aria-expanded", "false");
    await expect(track.locator("ol button")).toHaveCount(0);
    await contents.click();
    await expect(contents).toHaveAttribute("aria-expanded", "true");
    const rows = track.locator("ol > li > button");
    await expect(rows).toHaveCount(total);
    await expect(rows.first()).toHaveAttribute("aria-current", "location");
    await expect(track.getByRole("button", { name: /^Worked examples/ })).toHaveCount(trial.workedExamples > 0 ? 1 : 0);

    // Escape closes it and gives the keyboard back to the button.
    await page.keyboard.press("Escape");
    await expect(contents).toHaveAttribute("aria-expanded", "false");
    await expect(contents).toBeFocused();

    // A section not open yet takes her to the check that opens it, under the bar, with the keyboard there. In v3 that
    // check stands after its See it, so the See it is shown first: then the check is on the page to be taken to.
    const opener = trial.read[0]!.gates[trial.read[0]!.gates.length - 1]!;
    await showSeeIt(page, 1);
    await contents.click();
    await rows.nth(2).click();
    await expect(contents).toHaveAttribute("aria-expanded", "false");
    const landed = await page.evaluate(() => {
      const a = document.activeElement as HTMLElement;
      return { gate: a.getAttribute("data-gate"), top: Math.round(a.getBoundingClientRect().top), bar: Math.round(document.querySelector("[data-read-track]")!.getBoundingClientRect().bottom) };
    });
    expect(landed.gate).toBe(opener);
    expect(landed.top, `the check at ${landed.top} px, the bar ends at ${landed.bar} px`).toBeGreaterThanOrEqual(landed.bar);

    // Never remembered open.
    await contents.click();
    await page.reload();
    await expect(page.locator("#note article")).toBeVisible();
    await expect(page.locator("[data-read-track]").getByRole("button", { name: /^Contents$/ })).toHaveAttribute("aria-expanded", "false");
  });

  test("each section ends in Continue and Pause here; Continue opens the next under the bar and places it on the track", async ({ page, trial }) => {
    const total = trial.read.length;
    await page.setViewportSize({ width: 390, height: 844 });
    await openTrial(page, trial);
    await expect(page.locator("#note [data-lesson-section]")).toHaveCount(1);
    await expect(page.locator("#note [data-continue]")).toHaveCount(0);

    const last = await toSectionsLastTurn(page, trial, 1);
    await answerReadGate(page, last);
    // The verdict takes the keyboard (the Check that had it is gone), and the section ends in its two ways on.
    await expect(page.locator(`#note [data-gate="${last.id}"] [data-verdict-block]`)).toBeFocused();
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
    await expect(page.locator("[data-read-track] p")).toContainText(`2 of ${total}`);
    await expect.poll(async () => (await trackPlaced(page)).placed, { message: "section 1 placed on the track" }).toBe(1);

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

  test("the gate answers to the keyboard: arrows choose, Enter checks, and Continue is the next stop", async ({ page, trial }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await openTrial(page, trial);
    const asked = await toSectionsLastTurn(page, trial, 1);
    const gate = page.locator(`#note [data-gate="${asked.id}"]`);
    const options = gate.getByRole("radio");
    // Shown in the lesson's balanced order, the one Slides shows (src/lib/gate-order.ts).
    expect(await options.evaluateAll((els) => els.map((e) => e.getAttribute("data-value")))).toEqual(asked.shown);
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
    const right = asked.shown.indexOf(asked.answer);
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
    test(`on the ${size.name} a gate keeps §8.4's rhythm: the stem, its maths on its own line, the answer`, async ({ page, trial }) => {
      // The first Your turn of each stem shape the note asks, by the layout both ways share (lesson-plan.ts gateStem):
      // its maths ending the question on a line of its own ("lifted"), no maths of its own line ("plain"), and words
      // after the lifted maths ("tail").
      const shapeOf = (g: Gate) => (g.stem.maths === null ? "plain" : g.stem.tail ? "tail" : g.stem.lead ? "lifted" : "bare");
      const first = new Map<string, Gate>();
      for (const g of trial.gates) if (!first.has(shapeOf(g))) first.set(shapeOf(g), g);
      for (const shape of ["lifted", "plain", "tail"]) expect(first.get(shape), `the trial note asks a Your turn whose stem is ${shape}`).toBeTruthy();
      const wanted = new Map([...first].filter(([shape]) => shape !== "bare").map(([shape, g]) => [g.id, shape]));

      await page.setViewportSize({ width: size.width, height: size.height });
      await openTrial(page, trial);
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
      const near = (a: number | null, b: number, what: string) => expect(Math.abs((a ?? -99) - b), `${what}: ${a} against ${b}`).toBeLessThanOrEqual(1);

      // In the note's order, each wanted Your turn measured as it is asked, before it is answered (the walk answers it on).
      for (const [id, shape] of wanted) {
        await reachReadGate(page, trial, id);
        const m = await rhythm(id);
        const where = `${id} (${shape}) at ${size.width}`;
        expect(m.stem, `${where}: the stem`).toBe(size.stem);
        if (shape === "lifted") {
          // Its fraction ends the question and stands on its own line.
          expect(m.maths, `${where}: the maths`).toBe(size.maths);
          near(m.stemToMaths, size.stemToMaths, `${where}: stem to maths`);
        } else if (shape === "plain") {
          // A stem with no maths of its own line: the options, 52 px or more, 10 px apart.
          for (const h of m.heights) expect(h, `${where}: an option's height`).toBeGreaterThanOrEqual(52);
          for (const gap of m.gaps) near(gap, 10, `${where}: between options`);
        } else {
          // The words after the maths come back at the same gap, then the answer.
          expect(m.maths, `${where}: the maths`).toBe(size.maths);
          near(m.stemToMaths, size.stemToMaths, `${where}: stem to maths`);
          near(m.mathsToTail, size.stemToMaths, `${where}: maths to the words after it`);
        }
        near(m.toAnswer, size.toAnswer, `${where}: the question to the answer`);
      }
    });
  }

  test("a miss is taught again first, then shows the right answer in fern with hers edged, the consequence drawn, nothing red", async ({ page, trial }) => {
    // The Your turn whose verdict draws its consequence (the enrichment's reaction: on the trial, x = 1 put into both).
    const gate = trial.gates.find((g) => g.reaction !== null && g.kind === "choice");
    expect(gate, "a Your turn in the note whose verdict draws its consequence").toBeTruthy();
    await page.setViewportSize({ width: 390, height: 844 });
    await openTrial(page, trial);
    await readOnTo(page, trial, gate!.section);
    await showSeeIt(page, gate!.section);
    await answerReadGate(page, gate!, false);

    // First the re-teach (the teach-first case §6.3): "Not quite.", her choice, the consequence drawn, the explanation
    // again, and nothing lit until she asks for the answer.
    const box = page.locator(`#note [data-gate="${gate!.id}"]`);
    await expect(box).toHaveAttribute("data-phase", "reteach");
    const reteach = box.locator("[data-reteach]");
    await expect(reteach).toBeFocused();
    const verdict = reteach.locator("[data-verdict]");
    await expect(verdict).toHaveText("Not quite.");
    expect(await verdict.evaluate((el) => getComputedStyle(el).fontSize)).toBe("21px");
    await expect(reteach.locator("[data-her-choice]")).toBeVisible();
    await expect(reteach.locator(`[data-reaction="${gate!.reaction}"]`)).toBeVisible();
    await expect(box.locator('[data-option="ok"]')).toHaveCount(0);
    await expect(box.locator('[data-option="miss"]')).toHaveCount(1);
    await expect(box.locator('[data-option="miss"]')).toHaveAttribute("aria-checked", "true");

    // Then the answer she asks for: the right option lit in fern, hers edged, the answer line; the re-teach stays.
    await reteach.locator("[data-show-answer]").click();
    await expect(box).toHaveAttribute("data-phase", "answer");
    await expect(box.locator('[data-option="ok"]')).toHaveCount(1);
    await expect(box.locator('[data-option="ok"]')).toHaveAttribute("aria-checked", "false");
    await expect(box.locator('[data-option="ok"]')).toHaveAttribute("data-value", gate!.answer);
    await expect(box.locator('[data-option="miss"]')).toHaveCount(1);
    await expect(box.locator('[data-option="miss"]')).toHaveAttribute("aria-checked", "true");
    await expect(box.locator("[data-verdict-block] [data-answer-line]")).toBeVisible();
    await expect(box.locator("[data-verdict-block]")).toBeFocused();
    await expect(reteach).toBeVisible();
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

  test("on a phone the track is the one thing pinned besides the tab bar, and its popover fits the screen", async ({ page, trial }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await openTrial(page, trial);
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
  test("a pointer on Continue lands on the next heading with no ring; Space and the arrows keep it off; Tab rings the next control", async ({ page, trial }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await openTrial(page, trial);
    const html = page.locator("html");
    await expect(html).toHaveAttribute("data-input", "pointer");
    await finishReadSection(page, trial, 1);
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

    // Tab moves the keyboard on to the next control of section 2 (past its figure and its words, which are not
    // controls): in v3 its See it's "Next step", which shows before the section asks anything; the accent ring on it.
    await page.keyboard.press("Tab");
    await expect(html).toHaveAttribute("data-input", "keyboard");
    const second = trial.read[1]!;
    const control = second.sees.length > 0 ? readSection(page, 2).locator("[data-next-step]") : page.locator(`#note [data-gate="${second.gates[0]}"] [role=radio][tabindex="0"]`);
    await expect(control).toBeFocused();
    expect(await ringOf(control)).toMatchObject({ style: "solid", width: "2px", accent: true });
  });

  test("keyboard Enter on Continue lands on the next heading with the accent ring, and Continue wears it too", async ({ page, trial }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await openTrial(page, trial);
    await finishReadSection(page, trial, 1);
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

  test("high contrast keeps a visible keyboard ring in its own accent", async ({ page, trial }) => {
    await openTrial(page, trial);
    await page.evaluate(() => localStorage.setItem("cairn.theme", "hc"));
    await openTrial(page, trial);
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
  test("her answers on the topic never move the accent, nothing swaps after the first paint, and her own choice of Read does", async ({ page, trial }) => {
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
    await openTrial(page, trial);
    let ways = await heroWays(page);
    expect(ways.map((w) => [w.way, w.accent])).toEqual([["slides", true], ["read", false]]);
    expect(await painted(), "a first visit never shows Read on the accent").toEqual(["slides:accent read:outline"]);

    // Evidence, and no choice: section 1's checks answered in Read under the hero and Continue pressed (so section 2 is
    // where she is: a check answered alone keeps her in its section, audit READ-9), and a mastery row from an earlier week.
    const first = trial.read[0]!.gates[0]!;
    await finishReadSection(page, trial, 1);
    await page.locator('#note [data-section-end="1"] [data-continue]').click();
    await expect(page.locator("#note [data-lesson-section]")).toHaveCount(2);
    await expect
      .poll(() =>
        page.evaluate(
          (id) =>
            new Promise<number>((resolve) => {
              const open = indexedDB.open("ccea-study");
              open.onerror = () => resolve(-1);
              open.onsuccess = () => {
                const db = open.result;
                const all = db.transaction("attempts").objectStore("attempts").getAll();
                all.onsuccess = () => {
                  db.close();
                  resolve((all.result as Array<{ itemId: string }>).filter((r) => r.itemId.endsWith(`#gate:${id}`)).length);
                };
                all.onerror = () => resolve(-1);
              };
            }),
          first,
        ),
      )
      .toBe(1);
    const seeded = await page.evaluate(
      ({ subject, slug }) =>
        new Promise<string | null>((resolve) => {
          const open = indexedDB.open("ccea-study");
          open.onerror = () => resolve("open failed");
          open.onsuccess = () => {
            const db = open.result;
            const tx = db.transaction("mastery", "readwrite");
            const at = new Date("2026-09-13T19:00:00");
            tx.objectStore("mastery").put({ key: `${subject}:${slug}`, subject, topicSlug: slug, level: "attempted", score: 0.2, lastEvidenceAt: at, updatedAt: at });
            tx.oncomplete = () => {
              db.close();
              resolve(null);
            };
            tx.onerror = () => resolve(`write failed: ${tx.error?.message}`);
          };
        }),
      { subject: trial.row.subject, slug: trial.row.slug },
    );
    expect(seeded).toBeNull();
    await openTrial(page, trial);
    await expect(page.locator(`${MAIN} header button[data-way="read"]`)).toHaveText("Read on from section 2");
    ways = await heroWays(page);
    expect(ways.map((w) => [w.way, w.accent]), JSON.stringify(ways)).toEqual([["slides", true], ["read", false]]);
    expect(ways[0].text).toMatch(/^Start the slides/);
    expect(new Set(await painted()), "Slides held the accent from the first paint").toEqual(new Set(["slides:accent read:outline"]));
    expect(await page.evaluate(() => localStorage.getItem("cairn.lessonWay"))).toBeNull();

    // She chooses Read herself: from then on Read carries the accent, and it says where she was.
    await page.locator(`${MAIN} header button[data-way="read"]`).click();
    await expect.poll(() => page.evaluate(() => localStorage.getItem("cairn.lessonWay"))).toBe("read");
    await openTrial(page, trial);
    await expect(page.locator(`${MAIN} header button[data-way="read"]`)).toHaveText("Continue at section 2");
    ways = await heroWays(page);
    expect(ways.map((w) => [w.way, w.accent]), JSON.stringify(ways)).toEqual([["read", true], ["slides", false]]);
  });
});

/**
 * One truth per way in (audit LD-04, CT-12, CD-12, 24 Sep): the hero said "About 9 minutes · 7 sections" beside a
 * "Start the slides · 25 cards" whose title card said "About 11 minutes", and neither named the video. Now each way is
 * named on the hero with its own minutes and size, and each number is the one that way prints itself: Read's in its
 * track and Contents, Slides' on its Start button and its title card; and each is the one the content's own rule gives.
 */
test.describe("The way in: each way states its own numbers, the ones it prints itself", () => {
  test("the trial hero's figure starts on the first screen (within 720 px) at 390 x 844, two ways in and all", async ({ page, trial }) => {
    // 04-critique.md R5 and e2e/appearance.spec.ts's rule for every topic: a first screen with no picture is the real
    // "plain". The trial hero carries two ways in and their numbers; they must not push the figure below the fold.
    await page.setViewportSize({ width: 390, height: 844 });
    await openTrial(page, trial);
    await page.evaluate(() => window.scrollTo(0, 0));
    const figure = page.locator(`${MAIN} header figure`).first();
    await expect(figure).toBeVisible();
    const top = await figure.evaluate((el) => el.getBoundingClientRect().top);
    expect(top, `the figure's top edge at ${Math.round(top)} px`).toBeLessThan(720);
  });

  test("the hero's Slides and Read lines agree with the Slides title card, the Start button and the Read track", async ({ page, trial }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await openTrial(page, trial);
    const num = (text: string, re: RegExp) => Number(re.exec(text)?.[1] ?? Number.NaN);
    const slidesLine = (await page.locator(`${MAIN} header [data-way-length="slides"]`).textContent()) ?? "";
    const readLine = (await page.locator(`${MAIN} header [data-way-length="read"]`).textContent()) ?? "";
    // Each way is one short line ("Slides · 36 cards · about 21 min"; the sr-only ": " and ", " sit between), and a
    // video with no stated length is named once beside the facts, not on each way (audit LD-21: the hero's figure
    // must stay on the first screen at 390).
    expect(slidesLine).toMatch(/^Slides\s*·\s*:?\s*\d+ cards\s*·\s*,?\s*about \d+ min$/);
    expect(readLine).toMatch(/^Read\s*·\s*:?\s*\d+ sections\s*·\s*,?\s*about \d+ min$/);
    // Since 25 Sep the trial's video states its length, so the hero names no untimed video: read the fact only if it is
    // there (a locator's textContent waits for its element, and this one is absent).
    const videoFactEl = page.locator(`${MAIN} header [data-hero-promise] [data-video-fact]`);
    const videoFact = (await videoFactEl.count()) > 0 ? ((await videoFactEl.first().textContent()) ?? "") : "";
    const plus = / ?plus [a-z ]*videos?/.exec(videoFact)?.[0].replace(/^ ?/, " ") ?? "";
    if (videoFact) expect(videoFact, "the untimed video is named as not timed").toMatch(/^plus [a-z ]*videos?, not timed$/);
    const slides = { minutes: num(slidesLine, /about (\d+) min/), cards: num(slidesLine, /(\d+) cards/) };
    const read = { minutes: num(readLine, /about (\d+) min/), sections: num(readLine, /(\d+) sections/) };
    // The rule's numbers for the same content (the deck the route builds; the sections Read numbers and prices): the hero
    // printing others would be a stale export or a renderer that counts differently.
    expect(slides, "the hero's Slides line against the deck the content builds (src/lib/slides/deck.ts)").toEqual({ minutes: trial.deck.stats.minutes, cards: trial.deck.stats.cards });
    expect(read, "the hero's Read line against the note's sections (lesson-plan.ts lessonSections)").toEqual({
      minutes: trial.read.reduce((n, s) => n + s.minutes, 0),
      sections: trial.read.length,
    });

    // Read's numbers are the track's: "1 of 9", and the Contents heading's minutes (with the same video named, were one untimed).
    const track = page.locator("[data-read-track]");
    await expect(track.locator("p").first()).toContainText(`1 of ${read.sections}`);
    await track.getByRole("button", { name: /^Contents$/ }).click();
    await expect(track).toContainText(`The lesson · about ${read.minutes} ${read.minutes === 1 ? "minute" : "minutes"}${plus}`);
    await page.keyboard.press("Escape");

    // Slides' numbers are its Start button's and its title card's.
    await expect(page.locator(`${MAIN} header a[data-way="slides"]`)).toHaveText(`Start the slides · ${slides.cards} cards`);
    await page.locator(`${MAIN} header a[data-way="slides"]`).click();
    const promise = page.locator("[data-card='title'] [data-promise]");
    await expect(promise).toBeVisible();
    const card = (await promise.textContent()) ?? "";
    expect(num(card, /About (\d+) minute/), card).toBe(slides.minutes);
    expect(num(card, /(\d+) cards/), card).toBe(slides.cards);
    expect(/ plus [a-z ]*videos?/.exec(card)?.[0] ?? "", "the title card names the same video").toBe(plus);
  });
});

/**
 * The hero's lede is running prose (art direction v2 §8.4: "\tfrac is the most an inline fraction may be"). On build 7
 * "12/18 cancels to 2/3" was set as two full-size stacked fractions, numerals 18.7 px in a 17 px line (19.8 in 18 at
 * 1280), so the first line stood about 12 px taller than the rest (audit CD-06, CT-13).
 */
test.describe("The hero's lede: a fraction in it takes the inline size", () => {
  test("the lede's fractions sit in their line, above the 13 px floor, at 390 and 1280", async ({ page, trial }) => {
    for (const size of [
      { width: 390, height: 844 },
      { width: 1280, height: 800 },
    ]) {
      await page.setViewportSize(size);
      await openTrial(page, trial);
      const lede = await page.locator(`${MAIN} header [data-hero-lede]`).evaluate((el) => {
        const cs = getComputedStyle(el);
        const numerals = Array.from(el.querySelectorAll(".katex-html .mfrac .mord"))
          .filter((m) => m.children.length === 0 && /\d/.test(m.textContent ?? ""))
          .map((m) => parseFloat(getComputedStyle(m).fontSize));
        return { font: parseFloat(cs.fontSize), line: parseFloat(cs.lineHeight), height: el.getBoundingClientRect().height, numerals };
      });
      // Whatever fractions the lede carries sit smaller than its words and above the floor.
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

/** The buttons and links on screen filled with the accent of the place they sit in (01 §4.3: at most one). */
async function accentFilledInView(page: Page): Promise<string[]> {
  return page.evaluate(() => {
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
    return Array.from(document.querySelectorAll<HTMLElement>("button, a"))
      .filter((el) => {
        const r = el.getBoundingClientRect();
        const cs = getComputedStyle(el);
        if (r.width === 0 || r.height === 0 || r.bottom <= 0 || r.top >= window.innerHeight || cs.visibility === "hidden") return false;
        const probe = document.createElement("span");
        probe.style.color = "var(--accent)";
        el.parentElement!.appendChild(probe);
        const accent = rgb(getComputedStyle(probe).color);
        probe.remove();
        const bg = rgb(cs.backgroundColor);
        return bg !== null && accent !== null && bg.every((v, i) => Math.abs(v - accent[i]) <= 1);
      })
      .map((el) => (el.textContent ?? "").trim());
  });
}

/** The lesson's last Continue goes on to the first stage after it: the worked examples, where the topic has them. */
const finishLabel = (trial: TopicContent) => (trial.workedExamples > 0 ? "Continue to the worked examples" : null);

/**
 * One accent-filled control per screen (01-art-direction.md §4.3; v2 §11.1): at the lesson's end two "Show answer"
 * buttons shared the screen with "Continue to the worked examples", three accent fills at once (audit CD-04, build 7).
 * Continue is the one thing to press there; the retrieval prompts' reveal is secondary inside a note.
 */
test.describe("The lesson's end: one accent-filled control on the screen", () => {
  for (const size of [
    { width: 390, height: 844 },
    { width: 1280, height: 800 },
    { width: 1440, height: 900 },
  ]) {
    test(`at ${size.width} x ${size.height}, with the last Continue low on the screen and in its middle`, async ({ page, trial }) => {
      await page.setViewportSize(size);
      await openTrial(page, trial);
      await walkToLessonEnd(page, trial);
      const finish = page.locator("#note [data-finish]");
      const label = ((await finish.textContent()) ?? "").trim();
      if (finishLabel(trial)) expect(label, "the last Continue names the stage after the lesson").toBe(finishLabel(trial));
      for (const at of ["low", "middle"] as const) {
        await finish.evaluate((el, at) => {
          const r = el.getBoundingClientRect();
          window.scrollTo(0, at === "low" ? r.bottom + window.scrollY - window.innerHeight + 40 : r.top + window.scrollY - window.innerHeight / 2);
        }, at);
        await expect.poll(() => accentFilledInView(page), { message: `accent fills on screen, Continue ${at}` }).toEqual([label]);
      }
    });
  }

  test("the last Continue places the last section on the track, and a reload keeps the lesson finished", async ({ page, trial }) => {
    // Build 7 (audit CQ-15): after a reload the last section went back to "here" on a lesson she had finished.
    const total = trial.read.length;
    await page.setViewportSize({ width: 1280, height: 800 });
    await openTrial(page, trial);
    await walkToLessonEnd(page, trial);
    await page.locator("#note [data-finish]").click();
    await expect(page.locator("#examples")).toBeFocused();
    await expect.poll(async () => (await trackPlaced(page)).placed, { message: "every section placed" }).toBe(total);
    await page.reload();
    await expect(page.locator("#note article")).toBeVisible();
    await expect.poll(async () => (await trackPlaced(page)).placed, { message: "every section placed after a reload" }).toBe(total);
  });
});

/**
 * "Practise this topic" on the Slides close (now its first way out, "Now the questions") links to the topic's #practice,
 * and the page used to stay on its hero with the Practice stage 11,000 px below and nothing focused (audit LD-02, CQ-06,
 * 24 Sep): the stage is drawn only after the lesson loads, when the browser and the router have already looked for it. A
 * link naming a stage now lands on it, with the keyboard there, on a fresh load and on an in-app navigation, and the
 * stage stays put while the lesson above it settles.
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
    test(`at ${size.width}, on a fresh load and from the Slides close`, async ({ page, trial }) => {
      await page.setViewportSize(size);
      // A fresh load of the link.
      await page.goto(`${trial.path}#practice`);
      await expect(page.locator("#practice")).toBeFocused();
      await expect.poll(async () => Math.abs((await landed(page)).offset)).toBeLessThanOrEqual(2);
      // Still there once the lesson above has settled.
      await page.waitForTimeout(1500);
      let at = await landed(page);
      expect(Math.abs(at.offset), JSON.stringify(at)).toBeLessThanOrEqual(2);
      expect(at.scrollY).toBeGreaterThan(size.height);
      // Arrived by a link, not by the keyboard: no ring.
      expect(await page.locator("#practice").evaluate((el) => getComputedStyle(el).outlineStyle)).toBe("none");

      // In the app: the close's own way to the questions, with the run restored at its last card (the deck's close).
      await page.evaluate(
        ({ key, at }) => localStorage.setItem(key, JSON.stringify({ at, key: "close", done: false, missed: [], answers: {}, checked: {}, graded: {} })),
        { key: `cairn.slides.${trial.row.id}`, at: trial.deck.cards.length - 1 },
      );
      await page.goto(trial.slidesPath);
      await expect(page.locator("[data-card='close']")).toBeVisible();
      await page.locator("[data-exit='practise']").click();
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
  test("the trial topic's 'On the paper' and an unpublished Further Maths topic say nothing about a tier", async ({ page, trial }) => {
    await openTrial(page, trial);
    const onThePaper = page.locator("section[aria-labelledby='ref-spec']");
    await expect(onThePaper).toContainText(`Examined in ${trial.row.unit} · calculator allowed`);
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

  test("first run, Today, the Map and both kinds of topic page draw no pill stack, and the stones are still counted", async ({ page, trial, classic }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto("/welcome/");
    await expect(page.getByRole("button", { name: /^Continue$/ })).toBeVisible();
    expect(await oldCairns(page), "first run").toBe(0);

    await completeFirstRun(page);
    // Five published topics of the trial's unit proved: five stones.
    const proved = manifestRows()
      .filter((r) => r.subject === trial.row.subject && r.unit === trial.row.unit && r.hasBlocks)
      .slice(0, 5);
    expect(proved, "five published topics in the trial's unit").toHaveLength(5);
    const seeded = await page.evaluate(
      ({ subject, slugs }) =>
        new Promise<string | null>((resolve) => {
          const open = indexedDB.open("ccea-study");
          open.onerror = () => resolve("open failed");
          open.onsuccess = () => {
            const db = open.result;
            const tx = db.transaction("mastery", "readwrite");
            const now = new Date();
            for (const slug of slugs) tx.objectStore("mastery").put({ key: `${subject}:${slug}`, subject, topicSlug: slug, level: "proficient", score: 0.9, lastEvidenceAt: now, updatedAt: now });
            tx.oncomplete = () => {
              db.close();
              resolve(null);
            };
            tx.onerror = () => resolve(`write failed: ${tx.error?.message}`);
          };
        }),
      { subject: trial.row.subject, slugs: proved.map((r) => r.slug) },
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

    for (const path of [trial.path, classic[0]!.path]) {
      await page.goto(path);
      await expect(page.locator("#note article")).toBeVisible();
      await expect(page.locator("nav[aria-label='Primary']:visible svg").first()).toBeVisible();
      expect(await oldCairns(page), path).toBe(0);
    }
  });
});

/* ----------------------------------------------------------------------------------------------------------------------
 * The trial audit's Read flow (measured on build 8, 25 Sep; fixed 27 Sep by the read-flow agent; walked again on the v3
 * note, 11 Oct). Each describe names its row. Structure is read from the served content (which sections hold two checks
 * or a video, where each See it stands), never hard-coded.
 * -------------------------------------------------------------------------------------------------------------------- */

/** Her kept place and the lesson she last worked in, as the page wrote them for Today (read-place.ts). */
async function keptPlace(page: Page, trial: TopicContent) {
  return page.evaluate((id) => {
    const parse = (raw: string | null) => (raw ? JSON.parse(raw) : null);
    return { place: parse(localStorage.getItem(`cairn.read.place.${id}`)), last: parse(localStorage.getItem("cairn.read.last")) };
  }, trial.row.id);
}

/** An element's top edge on the screen, in whole px. */
const topOf = (locator: ReturnType<Page["locator"]>) => locator.evaluate((el) => Math.round(el.getBoundingClientRect().top));

/** Where the Read track ends on the screen. */
const trackBottom = (page: Page) => page.evaluate(() => Math.round(document.querySelector("[data-read-track]")!.getBoundingClientRect().bottom));

test.describe("Read v2: her place is kept by her own Continue and Pause here (audit READ-9, READ-12)", () => {
  test("a check answered is not a Continue; Continue and Pause here move her on; the page, the track, the hero and Today's record agree", async ({ page, trial }) => {
    const total = trial.read.length;
    await page.setViewportSize({ width: 1280, height: 800 });
    await openTrial(page, trial);

    // Build 8: the first check answered and a reload opened section 2 and placed section 1's segment.
    await finishReadSection(page, trial, 1);
    await page.reload();
    await expect(page.locator("#note article")).toBeVisible();
    await expect.poll(() => openSections(page)).toEqual([1]);
    await page.evaluate(() => window.scrollTo(0, 0));
    await expect.poll(async () => (await trackPlaced(page)).placed, { message: "nothing placed by a check alone" }).toBe(0);
    expect((await keptPlace(page, trial)).place).toMatchObject({ v: 1, topicId: trial.row.id, total, open: 1, finished: false, pausedAt: null });

    // Her Continue moves her on, and a reload keeps it.
    await page.locator('#note [data-section-end="1"] [data-continue]').click();
    await expect.poll(() => openSections(page)).toEqual([1, 2]);
    await page.reload();
    await expect(page.locator("#note article")).toBeVisible();
    await expect.poll(() => openSections(page)).toEqual([1, 2]);

    // Pause here at the end of section 2: "the lesson opens at the next section", and Today can say so.
    await finishReadSection(page, trial, 2);
    await page.locator('#note [data-section-end="2"]').getByRole("link", { name: /^Pause here/ }).click();
    await expect(page).not.toHaveURL(new RegExp(escapeRegExp(trial.path)));
    const kept = await keptPlace(page, trial);
    expect(kept.place).toMatchObject({ open: 3, finished: false });
    expect(kept.place.pausedAt, "Pause here was the last thing she did").toBe(kept.place.updatedAt);
    expect(kept.last).toEqual({ topicId: trial.row.id, at: kept.place.updatedAt });

    // Next time: section 3 open and nothing after it; two sections placed; the hero names section 3.
    await openTrial(page, trial);
    await expect.poll(() => openSections(page)).toEqual([1, 2, 3]);
    await page.evaluate(() => window.scrollTo(0, 0));
    await expect.poll(async () => (await trackPlaced(page)).placed, { message: "sections 1 and 2 placed" }).toBe(2);
    await expect(page.locator(`${MAIN} header button[data-way="read"]`)).toHaveText("Read on from section 3");
    await expect(page.locator("#note [data-finish]")).toHaveCount(0);

    // Today's way back is the page with #resume: it lands on section 3's heading, under the track, keyboard there.
    await page.goto("/learn/");
    await page.goto(`${trial.path}#resume`);
    const heading = page.locator('#note [data-lesson-section="3"] [data-section]');
    await expect(heading).toBeFocused();
    await expect.poll(async () => (await topOf(heading)) - (await trackBottom(page))).toBeGreaterThan(0);
  });
});

test.describe("Read v2: a reload or a Back brings her back to where she was reading (audit READ-11)", () => {
  for (const size of [
    { width: 390, height: 844 },
    { width: 1280, height: 800 },
  ]) {
    test(`at ${size.width} x ${size.height}: the same block, where it stood on the screen`, async ({ page, trial }) => {
      await page.setViewportSize(size);
      await openTrial(page, trial);
      await readOnTo(page, trial, 3);
      // She reads on into section 3; the page keeps the block at the reading line a moment after she stops scrolling.
      const block = page.locator('#note [data-lesson-section="3"] > :nth-child(2)');
      await block.evaluate((el) => window.scrollTo(0, el.getBoundingClientRect().top + window.scrollY - 140));
      await page.waitForTimeout(600);
      const before = await topOf(block);
      // Build 8: y 3332 -> 11164 at 1280 (the page's end), 3660 -> 1008 at 390 (the hero's objectives).
      await page.reload();
      await expect(page.locator("#note article")).toBeVisible();
      await expect.poll(async () => Math.abs((await topOf(block)) - before), { message: `the block back at ${before} px` }).toBeLessThanOrEqual(2);
      expect(await page.evaluate(() => window.scrollY)).toBeGreaterThan(size.height);

      // Pause here, Today, then the browser's Back (build 8 at 390: 2937 -> 5361, inside "See it"). She reads section 2's
      // end where she can press it: in the middle of the screen, clear of the track (a link under the track is not one she
      // can tap, and a click there would first move the page).
      const end = page.locator('#note [data-section-end="2"]');
      await end.evaluate((el) => window.scrollTo(0, el.getBoundingClientRect().top + window.scrollY - window.innerHeight / 2));
      await page.waitForTimeout(600);
      const atPause = await topOf(end);
      await end.getByRole("link", { name: /^Pause here/ }).click();
      await expect(page).not.toHaveURL(new RegExp(escapeRegExp(trial.path)));
      await page.goBack();
      await expect(page.locator("#note article")).toBeVisible();
      await expect.poll(async () => Math.abs((await topOf(end)) - atPause), { message: `section 2's end back at ${atPause} px` }).toBeLessThanOrEqual(2);
    });
  }
});

test.describe("The hero names the section she is in, and its Read button lands there (audit HERO-1)", () => {
  test("stopped between the two checks of a section, the hero names that section, not the next, and lands on its heading", async ({ page, trial }) => {
    const two = trial.read.find((s) => s.gates.length >= 2);
    expect(two, "the trial note has a section with two checks").toBeTruthy();
    await page.setViewportSize({ width: 390, height: 844 });
    await openTrial(page, trial);
    await reachReadGate(page, trial, two!.gates[0]!);
    await answerReadGate(page, trial.gate(two!.gates[0]!));

    // A new visit (build 8: "Read on from section 4" and Rowan's "Section 4 is where you stopped", with section 3's
    // second check waiting; the button then landed on the lesson's top, 2,560 to 3,013 px above that check).
    await openTrial(page, trial);
    await page.evaluate(() => window.scrollTo(0, 0));
    const read = page.locator(`${MAIN} header button[data-way="read"]`);
    await expect(read).toHaveText(`Read on from section ${two!.n}`);
    const rowan = (await page.locator(`${MAIN} header [data-companion="topic-open"]`).count()) > 0 ? await page.locator(`${MAIN} header [data-companion="topic-open"]`).textContent() : "";
    const named = /section (\d+)/i.exec(rowan ?? "")?.[1];
    if (named) expect(Number(named), `Rowan: ${rowan}`).toBe(two!.n);

    await read.click();
    const heading = page.locator(`#note [data-lesson-section="${two!.n}"] [data-section]`);
    await expect(heading).toBeFocused();
    await expect.poll(async () => (await topOf(heading)) - (await trackBottom(page))).toBeGreaterThan(0);
    await expect(page.locator(`#note [data-lesson-section="${two!.n}"] [data-gate="${two!.gates[1]}"]`)).toBeVisible();
    await expect(page.locator(`#note [data-lesson-section="${two!.n + 1}"]`)).toHaveCount(0);
  });
});

test.describe("On a phone the tab bar never covers what she needs next (audit READ-10)", () => {
  test("after Check the section's Continue stands above the tab bar, and Tab from the verdict reaches it uncovered", async ({ page, trial }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await openTrial(page, trial);
    const last = await toSectionsLastTurn(page, trial, 1);
    await answerReadGate(page, last);
    const cont = page.locator('#note [data-section-end="1"] [data-continue]');
    await expect(cont).toBeVisible();
    // Build 8: Continue at 780-832 under a bar that starts at 787; 7 px of it showed.
    await expect
      .poll(() =>
        cont.evaluate((el) => {
          const bar = document.querySelector("[data-tab-bar]")!.getBoundingClientRect();
          return Math.round(el.getBoundingClientRect().bottom - bar.top);
        }),
      )
      .toBeLessThanOrEqual(0);
    await expect(page.locator(`#note [data-gate="${last.id}"] [data-verdict-block]`)).toBeFocused();
    await page.keyboard.press("Tab");
    await expect(cont).toBeFocused();
    const covered = await cont.evaluate((el) => {
      const r = el.getBoundingClientRect();
      const hit = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2);
      return hit !== null && !el.contains(hit) ? (hit.closest("nav")?.getAttribute("aria-label") ?? hit.tagName) : null;
    });
    expect(covered, "what covers the focused Continue").toBeNull();
  });
});

test.describe("Offline, a section's video says so and opens no blank player (audit READ-14)", () => {
  test("the row names the connection, is not a button, and plays again once she is back online", async ({ page, context, trial }) => {
    const withVideo = trial.read.find((s) => s.video);
    expect(withVideo, "the trial note has a section with a video").toBeTruthy();
    await page.setViewportSize({ width: 390, height: 844 });
    await openTrial(page, trial);
    // In v3 the video stands beside the section's See it, after it: it is on the page once the steps are shown, with the
    // section's Your turn.
    await reachReadGate(page, trial, withVideo!.gates[0]!);
    const row = readSection(page, withVideo!.n).locator("[data-video]").first();
    await expect(row).toHaveAttribute("data-video-state", "ready");

    await context.setOffline(true);
    await expect(row).toHaveAttribute("data-video-state", "offline");
    await expect(row.locator("[data-video-offline]")).toContainText("No connection, so this video cannot play here.");
    await expect(row.getByRole("button", { name: /^Play video/ })).toHaveCount(0);
    await expect(row.locator("iframe")).toHaveCount(0);

    await context.setOffline(false);
    await expect(row.getByRole("button", { name: /^Play video/ })).toBeVisible();
    await expect(row.locator("[data-video-offline]")).toHaveCount(0);
  });
});

test.describe("The exam-style close is not signed below live answer fields (audit READ-15)", () => {
  test("after the exam-style run, nothing of Rowan's stands after the page's first answer field", async ({ page, trial }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto(`${trial.path}#exam`);
    await expect(page.locator("#exam")).toBeFocused();
    // Each exam-style part's answer as she would type it, read from the content (content.ts examAnswers).
    const answers = trial.examAnswers;
    expect(answers.length, "the trial's exam-style questions have parts to answer").toBeGreaterThan(0);
    const exam = page.locator("#exam");
    for (let step = 0, k = 0; step < 24; step += 1) {
      if (/Exam-style complete/.test((await exam.textContent()) ?? "")) break;
      const field = exam.locator("input[type=text], input:not([type]), input[inputmode]").first();
      const next = exam.getByRole("button", { name: /^(Next part|Next question|Finish|Done)/ }).first();
      if (k < answers.length && (await field.count()) > 0 && (await field.isVisible()) && (await field.isEditable())) {
        await field.fill(answers[k]!);
        k += 1;
        const check = exam.getByRole("button", { name: /^Check/ }).first();
        if ((await check.count()) > 0) await check.click();
        else await field.press("Enter");
      } else if ((await next.count()) > 0) await next.click();
      else break;
    }
    await expect(exam).toContainText("Exam-style complete");
    const misplaced = await page.evaluate(() => {
      const first = document.querySelector("main :is(input, textarea, select, [role=radio], [role=textbox])");
      return Array.from(document.querySelectorAll("main :is([data-companion], [data-companion-figure])"))
        .filter((c) => first !== null && Boolean(first.compareDocumentPosition(c) & Node.DOCUMENT_POSITION_FOLLOWING))
        .map((c) => c.getAttribute("data-companion") ?? `figure:${c.getAttribute("data-companion-figure")}`);
    });
    expect(misplaced, "companion slots after the first answer field").toEqual([]);
  });
});

/** WCAG contrast of an element's text against the surface under it (lch() and friends resolved on a canvas). */
async function contrastOf(locator: ReturnType<Page["locator"]>): Promise<number> {
  return locator.evaluate((el) => {
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = 1;
    const ctx = canvas.getContext("2d", { willReadFrequently: true })!;
    const rgba = (c: string) => {
      ctx.clearRect(0, 0, 1, 1);
      ctx.fillStyle = "rgba(0,0,0,0)";
      ctx.fillStyle = c;
      ctx.fillRect(0, 0, 1, 1);
      const d = ctx.getImageData(0, 0, 1, 1).data;
      return [d[0], d[1], d[2], d[3] / 255];
    };
    const over = (top: number[], under: number[]) => [0, 1, 2].map((i) => top[i] * top[3] + under[i] * (1 - top[3])).concat(1);
    let bg = [255, 255, 255, 1];
    const layers: number[][] = [];
    for (let e: Element | null = el; e; e = e.parentElement) {
      const c = rgba(getComputedStyle(e).backgroundColor);
      if (c[3] > 0) layers.push(c);
      if (c[3] >= 1) break;
    }
    for (let i = layers.length - 1; i >= 0; i -= 1) bg = over(layers[i], bg);
    const fg = over(rgba(getComputedStyle(el).color), bg);
    const lin = (v: number) => (v / 255 <= 0.04045 ? v / 255 / 12.92 : Math.pow((v / 255 + 0.055) / 1.055, 2.4));
    const lum = (c: number[]) => 0.2126 * lin(c[0]) + 0.7152 * lin(c[1]) + 0.0722 * lin(c[2]);
    const [a, b] = [lum(fg), lum(bg)];
    return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
  });
}

test.describe("Text on the subject's wash keeps 4.5:1 in every theme (audit READ-17)", () => {
  for (const theme of ["light", "dark", "evening"] as const) {
    test(`${theme}: the Contents row she is on, and the Slides title card's locator`, async ({ page, trial }) => {
      await page.addInitScript((t) => localStorage.setItem("cairn.theme", t), theme);
      await page.setViewportSize({ width: 390, height: 844 });
      await openTrial(page, trial);
      await page.locator("[data-read-track]").getByRole("button", { name: /^Contents$/ }).click();
      // Build 8: "1 min" in ink-3 on the row's wash, 4.44:1 light, 4.33:1 evening, 3.90:1 dark.
      const minutes = page.locator('[data-read-track] ol button[aria-current="location"] > span').last();
      await expect(minutes).toHaveText(/\d+ min/);
      expect(await contrastOf(minutes), "the current row's minutes").toBeGreaterThanOrEqual(4.5);

      await page.goto(trial.slidesPath);
      const locator = page.locator('[data-card="title"] p.uppercase:visible').first();
      await expect(locator).toBeVisible();
      expect(await contrastOf(locator), "the title card's locator on the wash").toBeGreaterThanOrEqual(4.5);
    });
  }
});

test.describe("Grading buttons are tapped hundreds of times: 52 px (audit READ-22)", () => {
  for (const width of [390, 1280]) {
    test(`at ${width}: Again, Good and Easy after Show answer`, async ({ page, trial }) => {
      await page.setViewportSize({ width, height: 844 });
      await openTrial(page, trial);
      const prompt = page.locator("#prompts section[aria-label$='prompt']").first();
      await prompt.getByRole("button", { name: /^Show answer$/ }).click();
      const grades = prompt.getByRole("group", { name: "How did it go?" }).getByRole("button");
      await expect(grades).toHaveCount(3);
      // Build 8: 44 px, the unlayered .tap floor beating the buttons' own min-h-[52px].
      for (const h of await grades.evaluateAll((els) => els.map((b) => b.getBoundingClientRect().height))) expect(h).toBeGreaterThanOrEqual(52);
    });
  }
});

test.describe("With motion allowed, only transform and opacity ever animate (audit READ-24)", () => {
  test.use({ reducedMotion: "no-preference" });

  test("hovering, choosing and checking a Read gate's option changes its colours at once", async ({ page, trial }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await openTrial(page, trial);
    const first = await toSectionsLastTurn(page, trial, 1);
    const box = page.locator(`#note [data-gate="${first.id}"]`);
    const wrong = await box.locator("[role=radio]").evaluateAll((els, v) => els.findIndex((e) => e.getAttribute("data-value") === v), first.wrongs[0]!);
    const transitions = () =>
      page.evaluate(() =>
        document
          .getAnimations()
          .filter((a) => a instanceof CSSTransition)
          .map((a) => (a as CSSTransition).transitionProperty)
          .filter((p) => !["transform", "translate", "scale", "rotate", "opacity"].includes(p)),
      );
    // Build 8: a 150 ms background-color on hover, four border colours on choosing, both again on Check.
    await box.getByRole("radio").nth(wrong).hover();
    expect(await transitions(), "on hover").toEqual([]);
    await box.getByRole("radio").nth(wrong).click();
    expect(await transitions(), "on choosing").toEqual([]);
    await box.getByRole("button", { name: /^Check$/ }).click();
    expect(await transitions(), "on Check").toEqual([]);
  });
});

/**
 * The smallest character, in px, of a stacked fraction (the element itself, or every one inside it): KaTeX's atoms
 * that draw a character (struts and zero-width spacers left out). `scripts: false` leaves out powers and indices.
 */
const smallestFractionGlyph = (locator: ReturnType<Page["locator"]>, { scripts = true }: { scripts?: boolean } = {}) =>
  locator.evaluate(
    (el, withScripts) => {
      const fractions = el.matches(".mfrac") ? [el] : Array.from(el.querySelectorAll(".katex-html .mfrac"));
      const sizes = fractions
        .flatMap((f) => Array.from(f.querySelectorAll(":is(.mord, .mbin, .mrel, .mopen, .mclose, .mpunct, .mop)")))
        .filter((s) => s.children.length === 0 && Array.from(s.textContent ?? "").some((ch) => ch.trim() !== "" && ch.charCodeAt(0) !== 0x200b))
        .filter((s) => withScripts || !s.closest(".msupsub"))
        .map((s) => parseFloat(getComputedStyle(s).fontSize));
      return sizes.length ? Math.min(...sizes) : 0;
    },
    scripts,
  );

test.describe("The expression a question is about is legible (audit READ-18, READ-19)", () => {
  test("a find-the-mistake stem and a retrieval prompt set their fraction at 13 px or more", async ({ page, trial }) => {
    // Needs the item components' patch (the read-flow agent's report): build 8 set these at 11.55 and 12.32 px. The
    // fraction each is about is its first one, before the working she marks or the field she types in.
    await page.setViewportSize({ width: 390, height: 844 });
    await openTrial(page, trial);
    const stem = page.locator("#mistakes section[aria-label='Find the mistake']").first().locator(".katex-html .mfrac").first();
    await expect(stem).toBeVisible();
    expect(await smallestFractionGlyph(stem), "the find-the-mistake stem").toBeGreaterThanOrEqual(13);
    const prompt = page.locator("#prompts section[aria-label$='prompt']").filter({ has: page.locator(".mfrac") }).first().locator(".katex-html .mfrac").first();
    await expect(prompt).toBeVisible();
    expect(await smallestFractionGlyph(prompt), "the retrieval prompt").toBeGreaterThanOrEqual(13);
  });

  test("a miss card's expected answer is never the smallest text on the card", async ({ page, trial }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(`${trial.path}#exam`);
    const exam = page.locator("#exam");
    const field = exam.locator("input[type=text], input:not([type]), input[inputmode]").first();
    await field.fill("2");
    await exam.getByRole("button", { name: /^Check/ }).first().click();
    const expected = exam.locator("dt", { hasText: /^Expected$/ }).locator("xpath=following-sibling::dd[1]");
    await expect(expected).toBeVisible();
    const text = await expected.evaluate((el) => parseFloat(getComputedStyle(el).fontSize));
    // Build 8: 11.55 px glyphs beside 15 px words (inline \frac); the engine now sets it as \dfrac (spec-map.ts).
    expect(await smallestFractionGlyph(expected, { scripts: false })).toBeGreaterThanOrEqual(Math.max(13, text - 0.5));
  });
});
