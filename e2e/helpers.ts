import { expect, type Locator, type Page } from "@playwright/test";
import type { Gate, TopicContent } from "./content";

/**
 * Shared helpers for the smoke suite.
 *
 * Every assertion here is about structure, not about how much content happens to be
 * published: counts come out of the page itself, and text matchers are anchored on the
 * copy the components own ("Tonight", "The lesson", "1 of N") rather than on numbers.
 * What a topic's note holds (its sections, gates, See its) comes from ./content.ts.
 */

/** The app shell renders every page inside `<main id="main">`; scoping there skips the nav. */
export const MAIN = "#main";

/** A tile/card is a `<section>` whose own `<h2>` is the label. Case-insensitive: the CSS uppercases it. */
export function tile(page: Page, label: string): Locator {
  return page.locator("section").filter({
    has: page.getByRole("heading", { level: 2, name: new RegExp(`^${escapeRegExp(label)}$`, "i") }),
  });
}

export function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** `N of M` counters shown by the practice, flashcard and diagnostic runners. */
export function counter(page: Page, n: number): Locator {
  return page.getByText(new RegExp(`\\b${n} of \\d+\\b`)).first();
}

/**
 * Walks the first-run flow so the Today page stops redirecting.
 * Writes `firstRunDone` to IndexedDB through the real UI, which is also test 1's subject.
 *
 * "Begin" no longer lands on Today: it writes `firstRunDone` and then opens the seeded lesson
 * (src/components/gift/SeededLesson.tsx). Every step of first run carries one quiet way out, so
 * the suite takes it in a single click rather than sitting through a lesson it is not testing.
 */
export async function completeFirstRun(page: Page, name = "Test"): Promise<void> {
  await page.goto("/welcome/");
  await page.getByRole("button", { name: /^Continue$/ }).click();
  const field = page.getByLabel(/what should it call you/i);
  await field.waitFor();
  await field.fill(name);
  await page.getByRole("button", { name: /^Begin$/ }).click();
  await page.getByRole("button", { name: /^Skip to Today$/ }).click();
  await expect(page.getByRole("heading", { level: 1, name: "Today" })).toBeVisible();
}

/**
 * The layout must never scroll sideways. One pixel of slack absorbs sub-pixel
 * rounding at fractional device scale factors.
 */
export async function expectNoHorizontalOverflow(page: Page): Promise<void> {
  // Let fonts and any late layout settle before measuring.
  await page.waitForLoadState("load");
  await page.evaluate(() => document.fonts.ready.then(() => true));
  const { scrollWidth, clientWidth, widest } = await page.evaluate(() => {
    const doc = document.documentElement;
    let widest = "";
    let max = 0;
    for (const el of Array.from(document.querySelectorAll("*"))) {
      const r = el.getBoundingClientRect();
      if (r.right > max) {
        max = r.right;
        widest = `${el.tagName.toLowerCase()}.${(el.className || "").toString().slice(0, 80)}`;
      }
    }
    return { scrollWidth: doc.scrollWidth, clientWidth: doc.clientWidth, widest };
  });
  expect(scrollWidth, `horizontal overflow at ${page.url()} (widest: ${widest})`).toBeLessThanOrEqual(clientWidth + 1);
}

/* ----------------------------------------------------------------------------------------------------------------------
 * Read v2, one section at a time (src/components/items/StepRevealNote.tsx, the paced note). Lesson structure v3: a
 * section explains, then shows a See it one step per "Next step", then asks its Your turn, which is not on the page until
 * the See it's last step has been shown; a section's end carries Continue (the furthest section open) and Pause here.
 * The walks below read what to answer from the topic's content (./content.ts), never from a list typed here.
 * -------------------------------------------------------------------------------------------------------------------- */

/** A Read v2 section as the page draws it (`data-lesson-section`, Read's own numbering). */
export const readSection = (page: Page, n: number): Locator => page.locator(`#note [data-lesson-section="${n}"]`);

/** The Read v2 sections open, by number. */
export async function openSections(page: Page): Promise<number[]> {
  return page.locator("#note [data-lesson-section]").evaluateAll((els) => els.map((e) => Number(e.getAttribute("data-lesson-section"))));
}

/**
 * Shows the See it a section is waiting on, to its last step, as she does: presses "Next step" until none is left, each
 * press waited for by the step it shows, and on a step she types, "Show me the step" (nothing is recorded). A section
 * whose See it is already shown whole (its Your turn answered on an earlier visit) needs nothing.
 */
export async function showSeeIt(page: Page, section: number): Promise<void> {
  const box = readSection(page, section);
  const steps = box.locator("[data-see-it] [data-step]");
  const typedResults = box.locator("[data-typed-result]");
  await expect(box).toBeVisible();
  let shown = await steps.count();
  for (let presses = 0; presses < 40; presses += 1) {
    const waiting = await box.evaluate((el) => (el.querySelector("[data-next-step]") ? "next" : el.querySelector("[data-typed-step] [data-show-step]") ? "typed" : null));
    if (waiting === "next") {
      await box.locator("[data-next-step]").click();
      shown += 1;
      await expect(steps).toHaveCount(shown);
    } else if (waiting === "typed") {
      const results = await typedResults.count();
      await box.locator("[data-typed-step] [data-show-step]").click();
      await expect(typedResults).toHaveCount(results + 1);
    } else return;
  }
  throw new Error(`section ${section}'s See it was still not shown whole after 40 presses`);
}

/**
 * A walk's way through a See it that its test is not about: every "Next step" (and a typed step's "Show me the step")
 * pressed in the page, through the same handlers her tap reaches, a task apart so each step renders before the next
 * press, without a pointer's per-press checks: a whole lesson then walks in seconds. The See it's own test presses as she
 * does (showSeeIt above; "a section explains, shows its See it one step per Next step" in learn.spec.ts).
 */
async function pressThroughSeeIt(page: Page, section: number): Promise<void> {
  const left = await readSection(page, section).evaluate(async (el) => {
    const tick = () => new Promise((resolve) => setTimeout(resolve, 0));
    for (let presses = 0; presses < 80; presses += 1) {
      const button = el.querySelector<HTMLElement>("[data-next-step]") ?? el.querySelector<HTMLElement>("[data-typed-step] [data-show-step]");
      if (!button) return 0;
      button.click();
      await tick();
    }
    return el.querySelectorAll("[data-next-step], [data-show-step]").length;
  });
  expect(left, `section ${section}'s See it shown whole`).toBe(0);
}

/**
 * Answers a Read v2 Your turn and presses Check: the right answer, or (`right` false) the first wrong option as shown.
 * Options are found by their authored text (`data-value`), never by place: the shown order is the lesson's balanced one.
 * Waits for what Check brings: the verdict ("Yes.") or, after a miss, the re-teach ("Not quite.").
 */
export async function answerReadGate(page: Page, gate: Gate, right = true): Promise<void> {
  const box = page.locator(`#note [data-gate="${gate.id}"]`);
  if (gate.kind === "choice") {
    const value = right ? gate.right : gate.wrongs[0];
    expect(value, `a ${right ? "right" : "wrong"} option on ${gate.id}`).toBeTruthy();
    const at = await box.locator("[role=radio]").evaluateAll((els, v) => els.findIndex((e) => e.getAttribute("data-value") === v), value!);
    expect(at, `${gate.id} shows the option ${JSON.stringify(value)}`).toBeGreaterThanOrEqual(0);
    await box.getByRole("radio").nth(at).click();
  } else {
    expect(right, `a typed Your turn (${gate.id}) has no wrong answer in the content to give`).toBe(true);
    await box.locator("input").fill(gate.right);
  }
  await box.getByRole("button", { name: /^Check$/ }).click();
  await expect(box.locator("[data-verdict]")).toBeVisible();
}

/**
 * Brings section `n` to its end: its See its shown whole and its Your turns answered right, in the note's order, and a
 * retry owed there (a Your turn missed earlier on this visit, asked once more before the recap) answered too. Leaves the
 * section's Continue on the page; never presses it.
 */
export async function finishReadSection(page: Page, topic: TopicContent, n: number): Promise<void> {
  for (const id of topic.read[n - 1]!.gates) {
    const box = page.locator(`#note [data-gate="${id}"]`);
    if ((await box.count()) === 0) await pressThroughSeeIt(page, n);
    await expect(box, `${id}, section ${n}'s Your turn, after its See it`).toBeVisible();
    if ((await box.getAttribute("data-phase")) === "open") await answerReadGate(page, topic.gate(id));
  }
  // A retry before the recap: the twin on new numbers where the gate has one, else the gate again; it records nothing.
  const retries = readSection(page, n).locator("[data-gate-retry][data-phase='open']");
  for (let guard = 0; guard < 12 && (await retries.count()) > 0; guard += 1) {
    const box = retries.first();
    const g = topic.gate((await box.getAttribute("data-gate-retry"))!);
    const value = (await box.getAttribute("data-retry")) === "twin" ? g.twin!.answer : g.answer;
    const at = await box.locator("[role=radio]").evaluateAll((els, v) => els.findIndex((e) => e.getAttribute("data-value") === v), value);
    await box.getByRole("radio").nth(at).click();
    await box.getByRole("button", { name: /^Check$/ }).click();
    await expect(box.locator("[data-verdict]")).toBeVisible();
  }
}

/**
 * A walk through a section its test is not about, in the page: the See its pressed through, each Your turn answered right
 * (her option, then Check), a retry owed there answered (the twin's answer where it asks the twin), then its Continue,
 * every press through the same handlers her taps reach and a task apart, so each renders before the next. A section with
 * a Your turn she types is walked by the pointer path instead (finishReadSection). Fails saying where it stopped.
 */
async function walkSection(page: Page, topic: TopicContent, n: number): Promise<void> {
  const gates = topic.read[n - 1]!.gates.map((id) => topic.gate(id));
  if (gates.some((g) => g.kind !== "choice")) {
    await finishReadSection(page, topic, n);
    await readSection(page, n).locator(`[data-section-end="${n}"] [data-continue]`).click();
    await expect(readSection(page, n + 1), `section ${n + 1} opens`).toBeAttached();
    return;
  }
  const answers = Object.fromEntries(topic.gates.map((g) => [g.id, { right: g.right, twin: g.twin?.answer ?? null }]));
  const stopped = await page.evaluate(
    async ({ n, ids, answers }) => {
      const tick = () => new Promise((resolve) => setTimeout(resolve, 0));
      // What a press brings renders within a task or two; ten seconds allows for a machine under load.
      const until = async (found: () => Element | null | undefined) => {
        for (const end = performance.now() + 10_000; performance.now() < end; await tick()) {
          const el = found();
          if (el) return el;
        }
        return null;
      };
      const section = () => document.querySelector(`#note [data-lesson-section="${n}"]`);
      const box = (id: string) => document.querySelector(`#note [data-gate="${id}"]`);
      const press = (el: Element | null | undefined) => (el as HTMLElement | null | undefined)?.click();
      const choose = async (b: Element, value: string) => {
        const option = Array.from(b.querySelectorAll("[role=radio]")).find((o) => o.getAttribute("data-value") === value);
        if (!option) return `no option ${JSON.stringify(value)}`;
        press(option);
        await tick();
        press(b.querySelector("button[type=submit]"));
        return (await until(() => b.querySelector("[data-verdict]"))) ? null : "no verdict after Check";
      };
      if (!section()) return `section ${n} is not open`;
      for (const id of ids) {
        for (let presses = 0; presses < 80 && !box(id); presses += 1) {
          const step = section()?.querySelector("[data-next-step]") ?? section()?.querySelector("[data-typed-step] [data-show-step]");
          if (!step) break;
          press(step);
          await tick();
        }
        const b = box(id);
        if (!b) return `${id} is not on the page after its See it`;
        if (b.getAttribute("data-phase") !== "open") continue;
        const why = await choose(b, answers[id]!.right);
        if (why) return `${id}: ${why}`;
      }
      for (let guard = 0; guard < 12; guard += 1) {
        const retry = section()?.querySelector("[data-gate-retry][data-phase='open']");
        if (!retry) break;
        const of = answers[retry.getAttribute("data-gate-retry") ?? ""];
        const why = of ? await choose(retry, retry.getAttribute("data-retry") === "twin" && of.twin ? of.twin : of.right) : "a retry of a gate the content does not hold";
        if (why) return `the retry: ${why}`;
      }
      const go = await until(() => section()?.querySelector(`[data-section-end="${n}"] [data-continue]`));
      if (!go) return `section ${n} ends without its Continue`;
      press(go);
      return (await until(() => document.querySelector(`#note [data-lesson-section="${n + 1}"]`))) ? null : `section ${n + 1} did not open`;
    },
    { n, ids: gates.map((g) => g.id), answers },
  );
  expect(stopped, `walking section ${n}`).toBeNull();
}

/** Reads on until section `n` is open (the section she is in): each section before it walked and its Continue pressed. */
export async function readOnTo(page: Page, topic: TopicContent, n: number): Promise<void> {
  let open = Math.max(...(await openSections(page)));
  for (let guard = 0; guard <= topic.read.length && open < n; guard += 1) {
    await walkSection(page, topic, open);
    open += 1;
  }
  expect(open, `read on to section ${n}`).toBeGreaterThanOrEqual(n);
}

/**
 * Brings a Your turn onto the page, still open: the sections before its own finished and continued, the Your turns before
 * it in its section answered right, and the See it it follows shown whole (as a walk shows one). Returns its box.
 */
export async function reachReadGate(page: Page, topic: TopicContent, id: string): Promise<Locator> {
  const gate = topic.gate(id);
  await readOnTo(page, topic, gate.section);
  const ids = topic.read[gate.section - 1]!.gates;
  for (const before of ids.slice(0, ids.indexOf(id))) {
    const box = page.locator(`#note [data-gate="${before}"]`);
    if ((await box.count()) === 0) await pressThroughSeeIt(page, gate.section);
    if ((await box.getAttribute("data-phase")) === "open") await answerReadGate(page, topic.gate(before));
  }
  const box = page.locator(`#note [data-gate="${id}"]`);
  if ((await box.count()) === 0) await pressThroughSeeIt(page, gate.section);
  await expect(box, `${id}, after its See it`).toBeVisible();
  await expect(box).toHaveAttribute("data-phase", "open");
  return box;
}

/** Reads the whole lesson right, every Continue pressed, until the lesson's last Continue (`data-finish`) is on the page. */
export async function walkToLessonEnd(page: Page, topic: TopicContent): Promise<void> {
  const last = topic.read.length;
  await readOnTo(page, topic, last);
  await finishReadSection(page, topic, last);
  await expect(page.locator("#note [data-finish]")).toBeVisible();
}

/**
 * The Read track's placed sections, from the hook the bar carries (`data-placed`, `data-total`; LessonSpine.tsx ReadTrack),
 * never from the drawing: past eleven sections the track is one bar whose fill is the share placed, and reading that
 * fill's scale through a DOM path tied every test to the bar's markup (the e2e agent's request, 11 Oct 2026). Up to
 * eleven it is also one segment each ("done", "here", "rest"), returned as `segments`, and checked against the hook;
 * past that `segments` is null.
 */
export async function trackPlaced(page: Page): Promise<{ placed: number; total: number; segments: string | null }> {
  return page.evaluate(() => {
    const track = document.querySelector<HTMLElement>("[data-read-track]");
    if (!track) throw new Error("no Read track on the page");
    const placed = Number(track.dataset.placed ?? Number.NaN);
    const total = Number(track.dataset.total ?? Number.NaN);
    if (!Number.isInteger(placed) || !Number.isInteger(total)) throw new Error("the Read track carries no data-placed / data-total");
    const segments = Array.from(track.querySelectorAll("[data-segment]")).map((e) => (e.getAttribute("data-segment") ?? "?")[0]).join("");
    if (segments && segments.split("").filter((c) => c === "d").length !== placed) throw new Error(`the track's segments (${segments}) disagree with data-placed=${placed}`);
    return { placed, total, segments: segments || null };
  });
}
