import { expect, test, type Page } from "@playwright/test";
import { readFileSync } from "node:fs";
import path from "node:path";
import { difficultyLabel } from "../src/lib/content/taxonomy";

/**
 * Unit 7, the practical skills unit, as its pages show it (29 Sep 2026).
 *
 *  - The specification's skills are shown in their own words on every Unit 7 topic, published ("On the paper", under
 *    "In the exam") or not ("What the specification says"). They used to print as their ids ("U7.1.1") because the
 *    catalogue's Unit 7 topics were built apart from every other unit's. The words are checked against the catalogue
 *    file itself (data/spec/double-award-science-topics.json), not against the code that reads it.
 *  - The difficulty shown is the catalogue's own. Only a topic still being written shows a difficulty (its header's
 *    meter and word); a published topic opens on its hero, which shows none by design (TopicHero: nothing on it is a
 *    tariff, a series, a trap or a verdict), so there the check is that none appears. The published bundles' declared
 *    difficulty is checked against the catalogue in src/lib/content/taxonomy.test.ts.
 *  - Figures: the published lessons draw their apparatus as inline SVG, and every figure on the first screen keeps its
 *    labels at 13 px or more on a 390 px phone (01-art-direction.md §7's acceptance test). An `apparatus` figure
 *    (FigureSpec kind "apparatus") is served into each published topic's first See it, through the page's own fetch,
 *    and must draw the assembled set-up with every part's label as text at 13 px or more. That test needs Figure.tsx to
 *    send the apparatus kind to src/components/figures/ApparatusFigure.tsx (the one-case patch); until then the See it
 *    shows "Apparatus: …" as a line of text and the test fails, which is what it is for.
 *
 * The service worker is blocked so that the served bundle is the one the page reads.
 */

test.use({ serviceWorkers: "block" });

type Skill = { id: string; text: string };
type Entry = { slug: string; unit: string; difficulty: number; skills: Skill[] };
const ROOT = path.join(__dirname, "..");
const CATALOGUE = JSON.parse(readFileSync(path.join(ROOT, "data", "spec", "double-award-science-topics.json"), "utf8")) as { unit7: Entry[] };
const MANIFEST = JSON.parse(readFileSync(path.join(ROOT, "src", "generated", "manifest.json"), "utf8")) as {
  topics: Array<{ id: string; subject: string; slug: string; hasNote?: boolean }>;
};
const shipped = (slug: string) => MANIFEST.topics.find((t) => t.subject === "science" && t.slug === slug && t.hasNote);
const pageOf = (slug: string) => `/learn/science/U7/${slug}/`;
const squash = (s: string) => s.replace(/\s+/g, " ").trim();

/** Every text label of every SVG figure inside `scope`, with the size it is drawn at on screen, in CSS pixels. */
async function drawnLabelSizes(page: Page, scope: string): Promise<Array<{ text: string; px: number }>> {
  return page.evaluate((sel) => {
    const out: Array<{ text: string; px: number }> = [];
    for (const svg of Array.from(document.querySelectorAll<SVGSVGElement>(`${sel} svg[viewBox]`))) {
      const box = svg.viewBox.baseVal;
      const drawn = svg.getBoundingClientRect().width;
      if (!box || box.width <= 0 || drawn <= 0) continue;
      for (const t of Array.from(svg.querySelectorAll("text"))) {
        const size = parseFloat(t.getAttribute("font-size") ?? getComputedStyle(t).fontSize);
        out.push({ text: (t.textContent ?? "").trim(), px: (size * drawn) / box.width });
      }
    }
    return out;
  }, scope);
}

for (const entry of CATALOGUE.unit7) {
  test.describe(entry.slug, () => {
    test("shows every skill of the specification in its own words, never an id in their place", async ({ page }) => {
      await page.goto(pageOf(entry.slug));
      const list = shipped(entry.slug)
        ? page.locator('section[aria-labelledby="ref-spec"] ul').first()
        : page
            .locator("section")
            .filter({ has: page.getByRole("heading", { level: 2, name: "What the specification says" }) })
            .locator("ul")
            .first();
      await expect(list).toBeAttached();
      const items = list.locator(":scope > li");
      await expect(items).toHaveCount(entry.skills.length);
      const shown = (await items.allTextContents()).map(squash);
      entry.skills.forEach((skill, i) => {
        expect(shown[i], skill.id).toContain(squash(skill.text));
        expect(squash(shown[i].replace(skill.id, "")), `${skill.id} is more than its id`).not.toBe("");
      });
    });

    test("shows its difficulty only where the page shows one, and then the catalogue's own", async ({ page }) => {
      await page.goto(pageOf(entry.slug));
      const meter = page.getByRole("img", { name: /^Difficulty \d of 5$/ });
      if (shipped(entry.slug)) {
        await expect(page.locator("[data-hero-promise]")).toBeVisible();
        await expect(meter).toHaveCount(0);
      } else {
        await expect(meter).toHaveAccessibleName(`Difficulty ${entry.difficulty} of 5`);
        await expect(page.getByText(difficultyLabel(entry.difficulty), { exact: true })).toBeVisible();
      }
    });
  });
}

// The set-up each published topic's first See it is served, as an `apparatus` figure: the gas-syringe set-up the planning
// lesson uses as a guest case, and the gas preparation the carrying-out lesson teaches (C6).
const SERVED: Record<string, { parts: string[]; labels: string[] }> = {
  "u7-planning": {
    parts: ["conical flask: dilute hydrochloric acid and marble chips", "bung", "delivery tube", "gas syringe"],
    labels: ["conical flask", "dilute hydrochloric acid and marble chips", "bung", "delivery tube", "gas syringe"],
  },
  "u7-carrying-out": {
    parts: ["conical flask: zinc and dilute acid", "thistle funnel", "bung", "delivery tube", "trough of water", "beehive shelf", "gas jar"],
    labels: ["conical flask", "zinc and dilute acid", "thistle funnel", "bung", "delivery tube", "trough of water", "beehive shelf", "gas jar"],
  },
};

test.describe("figures on a phone", () => {
  test.use({ viewport: { width: 390, height: 844 } });

  for (const slug of Object.keys(SERVED).filter((s) => shipped(s))) {
    test(`${slug}: the figures on the first screen keep every label at 13 px or more`, async ({ page }) => {
      await page.goto(pageOf(slug));
      await expect(page.locator("#note article")).toBeVisible();
      await page.evaluate(() => document.fonts.ready.then(() => true));
      // The hero's figure (the note's first figure, drawn on the first screen).
      const labels = await drawnLabelSizes(page, "#main header");
      expect(labels.length, "the first screen draws a labelled figure").toBeGreaterThan(0);
      for (const l of labels) expect(l.px, `"${l.text}" is drawn at ${l.px.toFixed(1)} px`).toBeGreaterThanOrEqual(13);
    });

    test(`${slug}: an apparatus figure draws its set-up, every part labelled in words at 13 px or more`, async ({ page }) => {
      const topic = shipped(slug)!;
      const served = SERVED[slug];
      await page.route(`**/content/science/${topic.id}.json`, async (route) => {
        const response = await route.fetch();
        const json = (await response.json()) as { noteBlocks?: Array<Record<string, unknown>> };
        const see = (json.noteBlocks ?? []).find((b) => b.type === "see");
        if (see) see.figure = { kind: "apparatus", parts: served.parts, style: "ccea-2d" };
        await route.fulfill({ response, json });
      });
      await page.goto(pageOf(slug));
      const figure = page.locator('#note [data-see-figure] figure[data-figure="apparatus"]').first();
      await expect(figure, "the See it draws the apparatus (needs the Figure.tsx case)").toBeVisible();
      const svg = figure.locator('svg[role="img"]');
      await expect(svg).toHaveAttribute("aria-label", /^Apparatus, drawn assembled: /);
      const name = (await svg.getAttribute("aria-label")) ?? "";
      for (const label of served.labels) expect(name.toLowerCase(), label).toContain(label.toLowerCase());
      await page.evaluate(() => document.fonts.ready.then(() => true));
      const drawn = await drawnLabelSizes(page, '#note [data-see-figure] figure[data-figure="apparatus"]');
      expect([...new Set(drawn.map((d) => squash(d.text)))].sort()).toEqual([...new Set(served.labels)].sort());
      for (const d of drawn) expect(d.px, `"${d.text}" is drawn at ${d.px.toFixed(1)} px`).toBeGreaterThanOrEqual(13);
      // Nothing drawn as a picture: the labels are text, and the figure holds no image.
      await expect(figure.locator("image, foreignObject")).toHaveCount(0);
    });
  }
});
