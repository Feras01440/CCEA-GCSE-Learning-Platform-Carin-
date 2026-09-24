import { expect, test, type Page } from "@playwright/test";
import { completeFirstRun, expectNoHorizontalOverflow } from "./helpers";

/**
 * Appearance pass 1 (tokens and type): the checks it owns from docs/design/art-direction/04-critique.md §7.
 *
 *  - The type floor: no visible HTML text under 13 px on Today and on a topic page, tab bar included, at 390
 *    and at 1280. (Figure labels inside an SVG are measured by the figure floor in pass 2; KaTeX is checked
 *    below in the lesson prose, where pass 1's 1.1em puts even a superscript at 13 px.)
 *  - The primary button's contrast on a subject page in light, dark and high contrast. data-subject sits on
 *    <html> beside data-theme; a subject's light-paper lightness must never reach a dark page, where it put
 *    dark text on a dark button at about 2.4:1.
 *  - The hero's "Start the lesson" within 720 px of the top at 390 x 844, and the topic's figure starting there too
 *    (the hero was re-ordered in pass 2a, 23 Sep; the 640 px rule for the button lives in e2e/learn.spec.ts).
 *  - Display maths never scrolls the page and never hides its right-hand end at 390.
 *
 * Three topics, one per subject, all long published. If a slug is renamed, change it here.
 */
const TOPICS = [
  { subject: "maths", path: "/learn/maths/M4/histograms-unequal-widths/" },
  { subject: "further-maths", path: "/learn/further-maths/FM1/matrix-inverse-2x2/" },
  { subject: "science", path: "/learn/science/B1/b1-enzyme-factors/" },
] as const;

const PHONE = { width: 390, height: 844 };
const DESKTOP = { width: 1280, height: 800 };

/** The floor: 13 px is --fs-micro, the smallest size in the scale (01-art-direction.md §3). */
const FLOOR_PX = 13;

async function openTopic(page: Page, path: string): Promise<void> {
  await page.goto(path);
  await expect(page.getByRole("button", { name: /^Start the lesson$/ })).toBeVisible();
  // The lesson loads on the client after the hero; the floor is measured on the whole page.
  await expect(page.locator("#note")).toBeVisible();
  await page.evaluate(() => document.fonts.ready.then(() => true));
}

/** Every visible HTML text run under the floor in #main and the visible primary nav: [size, text, class]. */
async function textUnderFloor(page: Page): Promise<Array<[number, string, string]>> {
  return page.evaluate((floor) => {
    const out: Array<[number, string, string]> = [];
    const roots = [document.querySelector("#main"), ...Array.from(document.querySelectorAll("nav[aria-label='Primary']"))];
    const seen = new Set<Element>();
    for (const root of roots) {
      if (!root || root.getBoundingClientRect().width === 0) continue;
      const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
      for (let n = walker.nextNode(); n; n = walker.nextNode()) {
        // Zero-width spacers (KaTeX's struts) carry no reading.
        if (!(n.textContent ?? "").replace(/[​-‍﻿⁡-⁤]/g, "").trim()) continue;
        const el = n.parentElement;
        if (!el || seen.has(el)) continue;
        seen.add(el);
        // KaTeX is measured on its own below; figure text lives in viewBox units (the pass 2 figure floor).
        if (el.closest(".katex, svg")) continue;
        const r = el.getBoundingClientRect();
        if (r.width < 2 || r.height < 2) continue; // sr-only, collapsed
        const cs = getComputedStyle(el);
        if (cs.visibility === "hidden" || cs.display === "none") continue;
        const size = parseFloat(cs.fontSize);
        if (size < floor - 0.01) out.push([size, (n.textContent ?? "").trim().slice(0, 40), String(el.className).slice(0, 80)]);
      }
    }
    return out;
  }, FLOOR_PX);
}

/** WCAG contrast of an element's text against its own background, both resolved to sRGB by the browser. */
async function buttonContrast(page: Page, name: RegExp): Promise<{ ratio: number; fg: string; bg: string }> {
  const button = page.getByRole("button", { name }).first();
  await expect(button).toBeVisible();
  return button.evaluate((el) => {
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
    const lum = ([r, g, b]: number[]) =>
      [r, g, b].map((v) => {
        const c = v / 255;
        return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
      }).reduce((acc, c, i) => acc + c * [0.2126, 0.7152, 0.0722][i], 0);
    const cs = getComputedStyle(el);
    const a = lum(rgb(cs.color));
    const b = lum(rgb(cs.backgroundColor));
    return { ratio: (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05), fg: cs.color, bg: cs.backgroundColor };
  });
}

test.describe("Appearance pass 1: the type floor", () => {
  test("Today has no text under 13 px, tab bar included, at 390 and 1280", async ({ page }) => {
    await completeFirstRun(page);
    for (const size of [PHONE, DESKTOP]) {
      await page.setViewportSize(size);
      await page.goto("/");
      await expect(page.getByRole("heading", { level: 1, name: "Today" })).toBeVisible();
      await page.evaluate(() => document.fonts.ready.then(() => true));
      expect(await textUnderFloor(page), `text under ${FLOOR_PX} px on Today at ${size.width}`).toEqual([]);
    }
  });

  for (const topic of TOPICS) {
    test(`a ${topic.subject} topic has no text under 13 px at 390 and 1280`, async ({ page }) => {
      for (const size of [PHONE, DESKTOP]) {
        await page.setViewportSize(size);
        await openTopic(page, topic.path);
        expect(await textUnderFloor(page), `text under ${FLOOR_PX} px on ${topic.path} at ${size.width}`).toEqual([]);
      }
    });
  }

  test("maths in the lesson prose is never under 13 px, superscripts and inline fractions included", async ({ page }) => {
    // Prose is --fs-prose (17 px on a phone): with .katex at 1.1em a scriptstyle glyph lands at 13.1 px.
    // Smaller contexts (a 16 px gate prompt, a 15 px option, a 14 px caption) still put a superscript at
    // 10.8-12.3 px; that is the content lint on inline stacks and the pass 2 stem sizes, not this check.
    await page.setViewportSize(PHONE);
    for (const topic of TOPICS) {
      await openTopic(page, topic.path);
      const small = await page.evaluate((floor) => {
        const out: Array<[number, string]> = [];
        const prose = Array.from(document.querySelectorAll("#note .prose-note p .katex")).filter(
          (k) => parseFloat(getComputedStyle(k.closest("p")!).fontSize) >= 17,
        );
        for (const k of prose) {
          const walker = document.createTreeWalker(k, NodeFilter.SHOW_TEXT);
          for (let n = walker.nextNode(); n; n = walker.nextNode()) {
            if (!(n.textContent ?? "").replace(/[​-‍﻿⁡-⁤]/g, "").trim()) continue;
            const el = n.parentElement!;
            if (el.closest(".katex-mathml") || el.getBoundingClientRect().width < 1) continue;
            const size = parseFloat(getComputedStyle(el).fontSize);
            if (size < floor - 0.01) out.push([size, k.querySelector("annotation")?.textContent?.slice(0, 40) ?? ""]);
          }
        }
        return out;
      }, FLOOR_PX);
      expect(small, `KaTeX under ${FLOOR_PX} px in the lesson prose of ${topic.path}`).toEqual([]);
    }
  });
});

test.describe("Appearance pass 1: the subject accent", () => {
  for (const topic of TOPICS) {
    test(`${topic.subject}: the primary button reads in light, dark and high contrast`, async ({ page }) => {
      // Light: the device preference, nothing stored.
      await page.emulateMedia({ colorScheme: "light" });
      await openTopic(page, topic.path);
      await expect(page.locator("html")).toHaveAttribute("data-subject", topic.subject);
      const light = await buttonContrast(page, /^Start the lesson$/);
      expect(light.ratio, `light: ${light.fg} on ${light.bg}`).toBeGreaterThanOrEqual(4.5);

      // Dark from the device, as she would have it at night.
      await page.emulateMedia({ colorScheme: "dark" });
      await openTopic(page, topic.path);
      await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
      await expect(page.locator("html")).toHaveAttribute("data-subject", topic.subject);
      const dark = await buttonContrast(page, /^Start the lesson$/);
      expect(dark.ratio, `dark: ${dark.fg} on ${dark.bg}`).toBeGreaterThanOrEqual(4.5);

      // High contrast, chosen in Settings (stored), which must not be flattened by the subject either.
      await page.evaluate(() => localStorage.setItem("cairn.theme", "hc"));
      await openTopic(page, topic.path);
      await expect(page.locator("html")).toHaveAttribute("data-theme", "hc");
      const hc = await buttonContrast(page, /^Start the lesson$/);
      expect(hc.ratio, `high contrast: ${hc.fg} on ${hc.bg}`).toBeGreaterThanOrEqual(4.5);
    });
  }

  test("the subject scope follows the page: set on a subject page, gone on Today", async ({ page }) => {
    await completeFirstRun(page);
    await openTopic(page, TOPICS[0].path);
    await expect(page.locator("html")).toHaveAttribute("data-subject", "maths");
    // Client-side navigation through the tab bar or the rail, not a fresh load.
    await page.locator("nav[aria-label='Primary']:visible").getByRole("link", { name: "Today" }).click();
    await expect(page.getByRole("heading", { level: 1, name: "Today" })).toBeVisible();
    await expect(page.locator("html")).not.toHaveAttribute("data-subject", /.+/);
  });
});

test.describe("Appearance pass 1: the phone hero and display maths", () => {
  test.use({ viewport: PHONE });

  for (const topic of TOPICS) {
    test(`${topic.subject}: display maths never hides its end and the page never scrolls sideways`, async ({ page }) => {
      await openTopic(page, topic.path);
      const overflowing = await page.evaluate(() =>
        Array.from(document.querySelectorAll(".katex-display"))
          .filter((d) => d.scrollWidth > d.clientWidth + 1)
          .map((d) => d.querySelector("annotation")?.textContent?.slice(0, 60) ?? ""),
      );
      expect(overflowing, `display maths wider than its box at 390 on ${topic.path}`).toEqual([]);
      await expectNoHorizontalOverflow(page);
    });

    test(`${topic.subject}: "Start the lesson" is on the first screen (within 720 px) at 390 x 844`, async ({ page }) => {
      // Measured 22 Sep 2026 on the dev build: 1,053 px (maths), 812 px (further maths), 942 px (science); pass 2a's
      // re-ordered hero put it at 397-440 px on 23 Sep. The tighter 640 px rule is e2e/learn.spec.ts's, permanently.
      await openTopic(page, topic.path);
      await page.evaluate(() => window.scrollTo(0, 0));
      const top = await page.getByRole("button", { name: /^Start the lesson$/ }).evaluate((el) => el.getBoundingClientRect().top);
      expect(top, `Start the lesson at ${Math.round(top)} px on ${topic.path}`).toBeLessThan(720);
    });

    test(`${topic.subject}: the topic's own figure starts on the first screen (within 720 px) at 390 x 844`, async ({ page }) => {
      // 04-critique.md R5, the second hero rule: a first screen with no picture is the real "plain". The figure sits
      // on the page under the button and Rowan's line, above the "you will be able to" lines.
      await openTopic(page, topic.path);
      await page.evaluate(() => window.scrollTo(0, 0));
      const figure = page.locator("#main header figure").first();
      await expect(figure).toBeVisible();
      const top = await figure.evaluate((el) => el.getBoundingClientRect().top);
      expect(top, `the figure's top edge at ${Math.round(top)} px on ${topic.path}`).toBeLessThan(720);
    });
  }
});
