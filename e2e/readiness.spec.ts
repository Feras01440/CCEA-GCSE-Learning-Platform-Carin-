import { readFileSync } from "node:fs";
import path from "node:path";
import { expect, test, type APIRequestContext } from "@playwright/test";
import { MAIN } from "./helpers";
import { lessonReadiness, type LessonReadiness } from "../src/lib/slides/readiness";

/**
 * Readiness (27 Sep 2026; src/lib/slides/readiness.ts and src/lib/slides/ready.ts): Slides and Read v2 switch on per
 * topic from the content itself, never from a list in code. A topic is ready when its note passes lesson structure v3
 * and the latest teach-show-check review in the note's own verification log says pass, or when that review is the
 * waiver on a note with no See it block yet (the trial topic, until its migration). On the served export:
 *  - the trial topic offers Slides, draws Read v2, and has its /slides/ route;
 *  - a published topic that is not ready offers Read alone, draws the classic page, and has no /slides/ route;
 *  - over every published topic, the /slides/ route exists exactly when the rule, applied to the content the export
 *    serves, says ready; the manifest the build wrote says the same; and the service worker precaches exactly those.
 * The trial topic is the only topic named; every other verdict is read from the content.
 */

const TRIAL = { id: "fm.u1.algebraic-fractions-simplify", subject: "further-maths", unit: "FM1", slug: "algebraic-fractions-simplify", hasBlocks: true } as const;

interface Row {
  id: string;
  subject: string;
  unit: string;
  slug: string;
  hasBlocks: boolean;
  ready?: unknown;
}

/** The published topics, from the manifest this build wrote (src/generated/manifest.json). */
const ROWS: Row[] = (JSON.parse(readFileSync(path.join(__dirname, "..", "src", "generated", "manifest.json"), "utf8")) as { topics: Row[] }).topics.filter((t) => t.hasBlocks);

const topicPath = (t: Pick<Row, "subject" | "unit" | "slug">): string => `/learn/${t.subject}/${t.unit}/${t.slug}/`;

/** The rule, applied to the content the export serves for a topic. */
async function servedReadiness(request: APIRequestContext, t: Row): Promise<LessonReadiness> {
  const res = await request.get(`/content/${t.subject}/${t.id}.json`);
  expect(res.status(), `${t.id}: the export serves no content for a topic the manifest lists (is out/ older than the manifest? rebuild)`).toBe(200);
  return lessonReadiness(await res.json());
}

test("the trial topic offers Slides, draws Read v2, and has its /slides/ route", async ({ page }) => {
  const verdict = await servedReadiness(page.request, TRIAL);
  expect(verdict.ready, `the trial topic is not ready: ${verdict.reasons.join("; ")}`).toBe(true);

  const res = await page.goto(topicPath(TRIAL));
  expect(res?.status()).toBe(200);
  const slides = page.locator(`${MAIN} header a[data-way="slides"]`);
  await expect(slides).toBeVisible();
  await expect(slides).toHaveText(/^(Start|Continue) the slides/);
  await expect(slides).toHaveAttribute("href", `${topicPath(TRIAL)}slides/`);
  // Read v2, from the same one function: the lesson's centred column, and the desktop rail folded beside it.
  await expect(page.locator("[data-read='v2']")).toBeAttached();
  await expect(page.locator("nav[aria-label='Primary'][data-folded]")).toHaveCount(1);

  const deck = await page.goto(`${topicPath(TRIAL)}slides/`);
  expect(deck?.status()).toBe(200);
  await expect(page.locator("[data-card='title']")).toBeVisible();
});

test("a published topic its reviewers have not passed offers Read alone, draws the classic page, and has no /slides/ route", async ({ page }) => {
  // The first published topic the served content says is not ready, from the trial's own unit first.
  const candidates = [...ROWS.filter((t) => t.unit === TRIAL.unit && t.slug !== TRIAL.slug), ...ROWS.filter((t) => t.unit !== TRIAL.unit)];
  let topic: Row | null = null;
  for (const t of candidates) {
    if (!(await servedReadiness(page.request, t)).ready) {
      topic = t;
      break;
    }
  }
  test.skip(topic === null, "every published topic is ready, so no topic is left without Slides to check");
  if (topic === null) return;

  const res = await page.goto(topicPath(topic));
  expect(res?.status()).toBe(200);
  await expect(page.getByRole("button", { name: /^Start the lesson$/ })).toBeVisible();
  await expect(page.locator(`${MAIN} header [data-way="read"]`)).toBeVisible();
  // Nothing promises a screen that does not exist.
  await expect(page.locator('[data-way="slides"]')).toHaveCount(0);
  await expect(page.locator(`a[href="${topicPath(topic)}slides/"]`)).toHaveCount(0);
  // The classic page, with the rail open.
  await expect(page.locator("[data-read='v2']")).toHaveCount(0);
  await expect(page.locator("nav[aria-label='Primary'][data-folded]")).toHaveCount(0);

  const route = await page.request.get(`${topicPath(topic)}slides/`);
  expect(route.status(), `${topicPath(topic)}slides/`).toBe(404);
});

test("over every published topic, a /slides/ route exists exactly when the served content is ready, and the build agrees", async ({ request, isMobile }) => {
  test.skip(isMobile, "one sweep of the export is enough: nothing in it depends on the device");
  test.setTimeout(240_000);

  const wrong: string[] = [];
  const ready = new Set<string>();
  const queue = [...ROWS];
  const worker = async () => {
    for (let t = queue.shift(); t !== undefined; t = queue.shift()) {
      const verdict = await servedReadiness(request, t);
      const route = (await request.get(`${topicPath(t)}slides/`)).status();
      if (verdict.ready) ready.add(topicPath(t));
      if (verdict.ready && route !== 200) wrong.push(`${topicPath(t)}: ready (${verdict.via}), but its /slides/ route answers ${route}`);
      if (!verdict.ready && route !== 404) wrong.push(`${topicPath(t)}: not ready (${verdict.reasons[0] ?? ""}), but its /slides/ route answers ${route}`);
      if ("ready" in t && t.ready !== verdict.ready) wrong.push(`${topicPath(t)}: the manifest says ready ${String(t.ready)}, the served content says ${verdict.ready}`);
    }
  };
  await Promise.all(Array.from({ length: 12 }, worker));
  expect(wrong).toEqual([]);
  expect(ready.has(topicPath(TRIAL)), "the trial topic is among the ready").toBe(true);

  // The service worker precaches the Slides of exactly these topics (scripts/build-sw.mjs).
  const sw = await (await request.get("/sw.js")).text();
  const precache = JSON.parse(/const PRECACHE = (\[.*?\]);/.exec(sw)?.[1] ?? "[]") as string[];
  const precachedSlides = new Set(precache.flatMap((u) => /^(\/learn\/[^/]+\/[^/]+\/[^/]+\/)slides\//.exec(u)?.[1] ?? []));
  expect([...precachedSlides].sort()).toEqual([...ready].sort());
});
