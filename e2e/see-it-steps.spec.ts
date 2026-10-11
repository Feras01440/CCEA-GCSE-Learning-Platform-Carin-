import { expect, request as pwRequest, test, type APIRequestContext, type Page } from "@playwright/test";
import { readyRows, topicContent } from "./content";

/**
 * The multi-step See it on Slides, as the ledger that becomes the ladder (slides-steps, 11 Oct 2026; the design note at
 * scratchpad/reports/slides-steps/DESIGN.md, after the owner's finding that a stepped See it rolled the card down and
 * never showed the whole case at once). Proved on the lab's twelve longest See its (app/lab/see-its, the real frame
 * around the real card), each at 390 × 844 and 1280 × 800, after every reveal:
 *  - the card body does not scroll (scrollHeight ≤ clientHeight + 1);
 *  - the newest step is wholly inside the card, and the control is on screen;
 *  - no visible text is under 13 px (the floor; KaTeX measured at its rendered size, its hidden MathML excluded);
 *  - nothing animates under the suite's reduced motion, and the steps still come one per press;
 * and at the end the ladder (data-see-ladder) holds every working line, the answer where the See it has one, and
 * "Step through again" takes it back to its first step.
 *
 * LAB_BASE=http://localhost:3017 runs it against a dev server instead of the export on :3200.
 */

const BASE = process.env.LAB_BASE ?? "";
const PHONE = { width: 390, height: 844 };
const DESKTOP = { width: 1280, height: 800 };

interface LabCase {
  id: string;
  href: string;
  steps: number;
  answer: boolean;
  typed: boolean;
  figure: boolean;
}

const LAB_CASES = 12;
const words = (s: unknown) => (typeof s === "string" ? s.split(/\s+/).filter(Boolean).length : 0);

/**
 * The longest See its the content holds, through the spec-content contract (e2e/content.ts): every topic the build made
 * ready, its served bundle, each See it's words (the stem, every working line, every reason, the answer line) and, from
 * the contract's reading, its step count and whether a step is typed. The lab page must list exactly these, in this
 * order (app/lab/see-its/cases.ts ranks the same way), so no id is typed here and a content edit moves the lab, the
 * spec and the card together.
 */
async function longestSeeIts(request: APIRequestContext): Promise<Array<{ id: string; words: number; steps: number; typed: boolean }>> {
  const all: Array<{ id: string; words: number; steps: number; typed: boolean }> = [];
  for (const row of readyRows()) {
    const t = await topicContent(request, row);
    const blocks = t.bundle.noteBlocks ?? [];
    let k = 0;
    blocks.forEach((b, i) => {
      const x = b as { type?: string; stem?: string; steps?: Array<{ working?: string; decision?: string }>; finalAnswer?: string } | null;
      if (!x || x.type !== "see") return;
      const see = t.sees[k];
      k += 1;
      if (!see) return;
      const steps = x.steps ?? [];
      all.push({ id: `${row.id}:${i}`, words: words(x.stem) + steps.reduce((a, s) => a + words(s.working) + words(s.decision), 0) + words(x.finalAnswer), steps: see.steps, typed: see.typed !== null });
    });
  }
  all.sort((a, b) => b.words - a.words || a.id.localeCompare(b.id));
  return all.slice(0, LAB_CASES);
}

/** The lab's cases as the lab lists them, checked against the contract's twelve longest. */
async function cases(page: Page, request: APIRequestContext): Promise<LabCase[]> {
  // The contract reads the bundles the server under test serves: with LAB_BASE set that is the dev server, not the
  // config's baseURL (the export on :3200), so the request context follows the page.
  const ctx = BASE ? await pwRequest.newContext({ baseURL: BASE }) : request;
  const want = await longestSeeIts(ctx).finally(() => (ctx === request ? undefined : ctx.dispose()));
  // The index's twelve frames each boot the app; the list is in the page itself, so the frames are not loaded here.
  const frames = "**/lab/see-its/card/**";
  await page.route(frames, (route) => route.abort());
  await page.goto(`${BASE}/lab/see-its/`);
  const rows = page.locator("[data-lab-case]");
  await expect(rows.first()).toBeAttached();
  await page.unroute(frames);
  const listed: LabCase[] = await rows.evaluateAll((els) =>
    els.map((el) => ({
      id: el.getAttribute("data-lab-case")!,
      href: el.getAttribute("data-href")!,
      steps: Number(el.getAttribute("data-steps")),
      answer: el.getAttribute("data-answer") === "1",
      typed: el.getAttribute("data-typed") === "1",
      figure: el.getAttribute("data-figure") === "1",
    })),
  );
  expect(listed.map((c) => c.id), "the lab lists the contract's twelve longest See its, longest first").toEqual(want.map((w) => w.id));
  expect(listed.map((c) => [c.steps, c.typed]), "each case's steps and typed step as the contract reads them").toEqual(want.map((w) => [w.steps, w.typed]));
  return listed;
}

interface Geometry {
  overflow: number;
  newestInside: boolean | null;
  controlOnScreen: boolean;
  smallestFont: number;
  shown: number;
  ghosts: number;
  animations: number;
}

/** The card's geometry now: measured on the real elements, nothing assumed. */
async function geometry(page: Page): Promise<Geometry> {
  await page.evaluate(() => document.fonts.ready.then(() => true));
  return page.evaluate(() => {
    const card = document.querySelector<HTMLElement>("[data-card='see']")!;
    const cr = card.getBoundingClientRect();
    const cur = document.querySelector<HTMLElement>("[data-step][data-current]");
    const r = cur?.getBoundingClientRect() ?? null;
    const ctl = document.querySelector<HTMLElement>("[data-control]")?.getBoundingClientRect() ?? null;
    // The smallest font among visible text: KaTeX at its rendered box's size (its MathML is hidden and sized for speech,
    // not for the eye), sr-only text and empty or zero-width nodes excluded.
    let smallest = Infinity;
    const seen = new Set<Element>();
    const walker = document.createTreeWalker(card, NodeFilter.SHOW_TEXT);
    while (walker.nextNode()) {
      const t = walker.currentNode as Text;
      if (!t.textContent || !t.textContent.replace(/[\s​]/g, "")) continue;
      const el = t.parentElement;
      if (!el || el.closest(".sr-only, .katex-mathml, [hidden], [aria-hidden='true']")) continue;
      const box = el.closest<HTMLElement>(".katex") ?? el;
      if (seen.has(box)) continue;
      seen.add(box);
      if (box.getClientRects().length === 0) continue;
      const fs = parseFloat(getComputedStyle(box).fontSize);
      if (fs < smallest) smallest = fs;
    }
    // Content against the box: a fit shows its spare pixels as a negative overflow (scrollHeight floors at the client height).
    const cs = getComputedStyle(card);
    const content = document.querySelector("[data-card-section]")!.getBoundingClientRect().height + parseFloat(cs.paddingTop) + parseFloat(cs.paddingBottom);
    // A typed step waiting for her line has no foot control: its own Check is the control (src/lib/slides/run.ts primaryFor).
    const typedWaiting = document.querySelector("[data-typed-step]") !== null;
    return {
      overflow: Math.round(content - card.clientHeight),
      newestInside: r ? r.top >= cr.top - 1 && r.bottom <= cr.bottom + 1 : null,
      controlOnScreen: ctl ? ctl.top >= 0 && ctl.bottom <= window.innerHeight && ctl.width > 0 : typedWaiting,
      smallestFont: smallest,
      shown: document.querySelectorAll("[data-step]").length,
      ghosts: document.querySelectorAll("[data-ghost]").length,
      animations: document.getAnimations().length,
    };
  });
}

async function openCase(page: Page, c: LabCase): Promise<void> {
  // From one case to the next the address differs only by its hash (a same-document navigation): wait for this case.
  await page.goto(`${BASE}${c.href}`);
  await expect(page.locator(`[data-lab-ready][data-lab-case="${c.id}"]`)).toBeAttached();
  await expect(page.locator("[data-step]")).toHaveCount(1);
}

/** The next step by the one control (a typed step is shown, not typed); returns the geometry after it has arrived. */
async function nextStep(page: Page): Promise<void> {
  if (await page.locator("[data-show-step]").count()) {
    await page.locator("[data-show-step]").click();
    await expect(page.locator("[data-typed-result]")).toBeVisible();
    return;
  }
  const shown = await page.locator("[data-step]").count();
  await page.locator("[data-control]").click();
  await expect(page.locator("[data-step]")).toHaveCount(shown + 1);
}

/**
 * `opening`: the card as it opens, before any reveal. A See it with a figure may need one scroll there on a phone: the
 * question and the figure are shown whole, and neither may shrink (the figure's labels sit at the 13 px floor). From the
 * first reveal the head folds and the card fits; that is what is asserted after every reveal.
 */
function check(g: Geometry, where: string, opening: { figure: boolean } | null = null): void {
  if (!(opening?.figure && g.overflow > 1)) {
    expect(g.overflow, `${where}: the card body scrolls by ${g.overflow} px`).toBeLessThanOrEqual(1);
    expect(g.newestInside, `${where}: the newest step is not wholly inside the card`).toBe(true);
  }
  expect(g.controlOnScreen, `${where}: the control is off screen`).toBe(true);
  expect(g.smallestFont, `${where}: text under the 13 px floor`).toBeGreaterThanOrEqual(13);
  expect(g.animations, `${where}: animations under reduced motion`).toBe(0);
}

test.describe("Slides: the multi-step See it never scrolls, and ends as the ladder", () => {
  test("the lab lists the contract's twelve longest See its, the longest first", async ({ page, request }) => {
    const all = await cases(page, request);
    expect(all).toHaveLength(LAB_CASES);
    expect(all.every((c) => c.steps >= 2 && c.steps <= 6)).toBe(true);
  });

  for (const size of [PHONE, DESKTOP]) {
    test(`every lab case at ${size.width} × ${size.height}: no scroll after any reveal, the newest step inside, the control on screen, nothing under 13 px, the ladder at the end`, async ({ page, request }) => {
      test.setTimeout(240_000);
      await page.setViewportSize(size);
      const all = await cases(page, request);
      for (const c of all) {
        await openCase(page, c);
        const where = (k: number) => `${c.id} at ${size.width}, step ${k} of ${c.steps}`;
        check(await geometry(page), where(1), { figure: c.figure });
        for (let k = 2; k <= c.steps; k += 1) {
          await nextStep(page);
          // A typed step shown is settled in place; the step count only grows on a reveal.
          const g = await geometry(page);
          if (g.shown < k) {
            await nextStep(page);
          }
          const after = await geometry(page);
          expect(after.shown, where(k)).toBe(k);
          expect(after.ghosts, where(k)).toBe(c.steps - k);
          await expect(page.locator(`[data-step='${k}'][data-current]`)).toBeVisible();
          check(after, where(k));
        }
        if (await page.locator("[data-show-step]").count()) await nextStep(page);
        // The end: the ladder with every line, the answer where there is one, nothing left to come.
        await expect(page.locator("[data-see-ladder]")).toBeAttached();
        await expect(page.locator("[data-see-ladder] [data-step]")).toHaveCount(c.steps);
        await expect(page.locator("[data-ghost]")).toHaveCount(0);
        await expect(page.locator("[data-see-answer]")).toHaveCount(c.answer ? 1 : 0);
        await expect(page.locator("[data-control]")).toHaveText("Your turn");
        check(await geometry(page), `${c.id} at ${size.width}, the end`);
        // Finished rows fold their reason; a tap on a row's number opens it, and only one is open at a time.
        if (c.steps >= 3) {
          const folded = page.locator("[data-step-folded]");
          await expect(folded).toHaveCount(c.steps - 1);
          await page.locator("[data-step='1'] [data-step-why]").click();
          await expect(page.locator("[data-step='1'] [data-step-why]")).toHaveAttribute("aria-expanded", "true");
          await expect(folded).toHaveCount(c.steps - 2);
          await page.locator("[data-step='2'] [data-step-why]").click();
          await expect(page.locator("[data-step='1'] [data-step-why]")).toHaveAttribute("aria-expanded", "false");
          await expect(folded).toHaveCount(c.steps - 2);
        }
        // Step through again: back to the first step, the rail back, nothing recorded (the lab records nothing anyway).
        await page.locator("[data-see-restart]").click();
        await expect(page.locator("[data-step]")).toHaveCount(1);
        await expect(page.locator("[data-ghost]")).toHaveCount(c.steps - 1);
        await expect(page.locator("[data-see-ladder]")).toHaveCount(0);
      }
    });
  }

  test("the head folds after the first reveal and opens on a tap; the stem's text stays whole for the specs", async ({ page, request }) => {
    await page.setViewportSize(PHONE);
    const all = await cases(page, request);
    const c = all[0]!;
    await openCase(page, c);
    await expect(page.locator("[data-see-head-folded]")).toHaveCount(0);
    const stemText = (await page.locator("[data-see-stem]").textContent()) ?? "";
    await nextStep(page);
    await expect(page.locator("[data-see-head-folded]")).toHaveCount(1);
    expect(await page.locator("[data-see-stem]").textContent()).toBe(stemText);
    const toggle = page.locator("[data-see-stem-toggle]");
    await expect(toggle).toHaveAttribute("aria-expanded", "false");
    const foldedHeight = await toggle.evaluate((el) => el.getBoundingClientRect().height);
    await toggle.click();
    await expect(toggle).toHaveAttribute("aria-expanded", "true");
    expect(await toggle.evaluate((el) => el.getBoundingClientRect().height)).toBeGreaterThan(foldedHeight);
    // The next reveal folds it again: the newest step is the one thing shown in full.
    await nextStep(page);
    await expect(toggle).toHaveAttribute("aria-expanded", "false");
  });

  test("the keyboard lands on the new step without the card moving, and the arrow key shows the next step", async ({ page, request }) => {
    await page.setViewportSize(DESKTOP);
    const all = await cases(page, request);
    const c = all.find((x) => !x.typed && x.steps >= 3) ?? all[0]!;
    await openCase(page, c);
    // The first reveal folds the head (the one moment the rows above move up, by design); from then on nothing above a
    // new step moves, and the new step takes the keyboard where it arrives.
    await page.keyboard.press("ArrowRight");
    await expect(page.locator("[data-step='2'][data-current]")).toBeFocused();
    const tops = () => page.locator("[data-step]").evaluateAll((els) => els.map((el) => Math.round(el.getBoundingClientRect().top)));
    const before = await tops();
    await page.keyboard.press("ArrowRight");
    await expect(page.locator("[data-step='3'][data-current]")).toBeFocused();
    expect((await tops()).slice(0, 2)).toEqual(before);
    expect(await page.locator("[data-card='see']").evaluate((el) => el.scrollTop)).toBe(0);
  });
});
