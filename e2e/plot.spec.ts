import { expect, test, type Locator, type Page } from "@playwright/test";

/**
 * The plot field: `graph` parts with plot "histogram", "points-line" or "curve" are drawn on a data-scaled grid
 * and marked element by element. The expected values are read from the published content JSON the page itself
 * loads, so the tests never hard-code an answer; the wrong-heights test needs no answer at all.
 */

const HISTOGRAMS = "/learn/maths/M4/histograms-unequal-widths/";
const LINES = "/learn/maths/M3/straight-lines-y-mx-c-equation-of-a-line-and-parallel-lines/";
const REGIONS = "/learn/maths/M7/inequalities-in-two-variables-and-regions/";

// RegionField geometry (viewBox units): squared grid, CELL per unit, PAD around.
const R_CELL = 24;
const R_PAD = 26;

// PlotField geometry (viewBox units).
const PLOT_W = 400;
const PLOT_H = 280;
const PAD_L = 44;
const PAD_T = 14;
const W = PAD_L + PLOT_W + 16;
const H = PAD_T + PLOT_H + 30;

interface GraphPart {
  stem: string;
  expect: Record<string, unknown>;
  /** 1-based position among the topic's practice questions, for the ?practice= deep link. */
  practice: number;
}

/** The first practice question of the topic whose first part is a graph of the given plot. */
async function firstGraphPart(page: Page, topicPath: string, plot: string): Promise<GraphPart> {
  // "/learn/<subject>/<unit>/<slug>/"; topic ids follow "<subject>.<unit lower-case>.<slug>".
  const [, , subject, unit, slug] = topicPath.split("/");
  const topicId = `${subject}.${unit!.toLowerCase()}.${slug}`;
  const res = await page.request.get(`/content/${subject}/${topicId}.json`);
  expect(res.status(), `published content for ${topicId}`).toBe(200);
  const bundle = (await res.json()) as { questions: Array<{ style: string; parts: Array<{ stem: string; answer: { kind: string; expect?: Record<string, unknown> } }> }> };
  const practice = bundle.questions.filter((q) => q.style === "practice");
  for (let i = 0; i < practice.length; i++) {
    const p = practice[i]!.parts[0];
    if (p && p.answer.kind === "graph" && p.answer.expect?.plot === plot) return { stem: p.stem, expect: p.answer.expect, practice: i + 1 };
  }
  throw new Error(`no practice question opening on a ${plot} part in ${topicId}`);
}

/** Practice runs one question at a time, so the tests deep-link to the question they need. */
async function openTopic(page: Page, topicPath: string, practice: number): Promise<void> {
  await page.goto(`${topicPath}?practice=${practice}`);
  // The bundle is fetched on the client; the deep-linked question renders once it has loaded.
  await expect(page.getByRole("heading", { level: 2, name: /^Practice$/i })).toBeVisible();
}

function parseRange(label: string): { xlo: number; xhi: number; ylo: number; yhi: number } {
  const m = label.match(/Grid from (−?[\d.]+) to (−?[\d.]+) across and (−?[\d.]+) to (−?[\d.]+) up/);
  if (!m) throw new Error(`no range in "${label}"`);
  const num = (s: string) => Number(s.replace("−", "-"));
  return { xlo: num(m[1]!), xhi: num(m[2]!), ylo: num(m[3]!), yhi: num(m[4]!) };
}

test.describe("Plot field", () => {
  test("a histogram drawn at the wrong heights names each bar and withholds the marks", async ({ page }) => {
    const part = await firstGraphPart(page, HISTOGRAMS, "histogram");
    await openTopic(page, HISTOGRAMS, part.practice);
    const form = page.locator("form").filter({ has: page.getByLabel(/^Height of the/) }).first();
    await form.scrollIntoViewIfNeeded();
    const check = form.getByRole("button", { name: /^Check$/ });
    await expect(check).toBeDisabled();
    const inputs = form.getByLabel(/^Height of the/);
    const n = await inputs.count();
    expect(n).toBeGreaterThan(0);
    for (let i = 0; i < n; i++) await inputs.nth(i).fill("99");
    await expect(form.getByText(new RegExp(`^${n} of ${n} bars drawn$`))).toBeVisible();
    await expect(check).toBeEnabled();
    await check.click();
    await expect(page.getByText(/bars? (is|are) not at (its|their) heights? yet: .*should reach/)).toBeVisible();
    await expect(page.getByText(/Frequency density is frequency ÷ class width/)).toBeVisible();
  });

  test("a histogram at the published heights is fully correct", async ({ page }) => {
    const part = await firstGraphPart(page, HISTOGRAMS, "histogram");
    const bars = part.expect.bars as Array<{ from: number; to: number; frequencyDensity: number }>;
    await openTopic(page, HISTOGRAMS, part.practice);
    const form = page.locator("form").filter({ has: page.getByLabel(/^Height of the/) }).first();
    await form.scrollIntoViewIfNeeded();
    for (const b of bars) {
      await form.getByLabel(`Height of the ${b.from} to ${b.to} bar`).fill(String(b.frequencyDensity));
    }
    await form.getByRole("button", { name: /^Check$/ }).click();
    await expect(page.getByText("Every bar has the right height: frequency density is frequency divided by class width.")).toBeVisible();
  });

  test("a straight-line graph: typed points, then a line laid with two taps", async ({ page }) => {
    const part = await firstGraphPart(page, LINES, "points-line");
    const points = part.expect.points as Array<[number, number]>;
    const through = part.expect.lineThrough as Array<[number, number]> | undefined;
    test.skip(!through || through.length !== 2 || part.expect.lineRequired !== true, "the first points-line part does not ask for a placed line");

    await openTopic(page, LINES, part.practice);
    const form: Locator = page.locator("form").filter({ has: page.getByLabel("Plotted points") }).first();
    await form.scrollIntoViewIfNeeded();
    const check = form.getByRole("button", { name: /^Check$/ });
    await expect(check).toBeDisabled();

    await form.getByLabel("Plotted points").fill(points.map(([x, y]) => `(${x}, ${y})`).join(", "));
    await expect(form.getByText(new RegExp(`^${points.length} of ${points.length} points placed`))).toBeVisible();
    await expect(check).toBeDisabled();

    // Lay the line through the two published points.
    await form.getByRole("button", { name: "Draw the line" }).click();
    const svg = form.locator("svg[role=img]");
    const range = parseRange((await svg.getAttribute("aria-label")) ?? "");
    const box = await svg.boundingBox();
    expect(box).not.toBeNull();
    const at = ([x, y]: [number, number]) => ({
      x: box!.x + ((PAD_L + ((x - range.xlo) / (range.xhi - range.xlo)) * PLOT_W) * box!.width) / W,
      y: box!.y + ((PAD_T + ((range.yhi - y) / (range.yhi - range.ylo)) * PLOT_H) * box!.height) / H,
    });
    for (const p of through!) {
      const pos = at(p);
      await page.mouse.click(pos.x, pos.y);
    }
    await expect(form.getByText(/line drawn$/)).toBeVisible();
    await expect(check).toBeEnabled();
    await check.click();
    await expect(page.getByText(/Every point is plotted correctly\. Your line passes through/)).toBeVisible();
  });

  test("a region: one tap inside shades it and is marked against every inequality", async ({ page }) => {
    const part = await firstGraphPart(page, REGIONS, "region");
    const inequalities = part.expect.inequalities as string[];
    // A point that satisfies every inequality of the first region part, found from the spec itself.
    const parse = (s: string) => {
      const m = s.replace(/\$/g, "").match(/^\s*(.+?)\s*(≤|≥|<=|>=|<|>)\s*(.+?)\s*$/);
      if (!m) throw new Error(`cannot read ${s}`);
      const lin = (e: string) => {
        const out = { x: 0, y: 0, k: 0 };
        for (const t of e.replace(/[−–]/g, "-").replace(/\s+/g, "").match(/[+-]?[^+-]+/g) ?? []) {
          const mm = t.match(/^([+-]?)(\d*\.?\d*)([xy])?$/)!;
          const v = (mm[1] === "-" ? -1 : 1) * (mm[2] === "" ? 1 : Number(mm[2]));
          if (mm[3] === "x") out.x += v;
          else if (mm[3] === "y") out.y += v;
          else out.k += v;
        }
        return out;
      };
      const l = lin(m[1]!);
      const r = lin(m[3]!);
      const op = m[2]!.replace("≤", "<=").replace("≥", ">=");
      return (x: number, y: number) => {
        const v = (l.x - r.x) * x + (l.y - r.y) * y - (r.k - l.k);
        return op === "<=" ? v <= 0 : op === ">=" ? v >= 0 : op === "<" ? v < 0 : v > 0;
      };
    };
    const tests = inequalities.map(parse);
    let inside: [number, number] | null = null;
    for (let x = 0.5; x <= 7 && !inside; x += 0.5) for (let y = 0.5; y <= 7 && !inside; y += 0.5) if (tests.every((t) => t(x, y))) inside = [x, y];
    expect(inside, "a point inside the region").not.toBeNull();

    await openTopic(page, REGIONS, part.practice);
    // Filter on the instruction paragraph, which stays put; the sticky hint changes once a point is placed.
    const form = page.locator("form").filter({ has: page.getByText(/Tap one point inside the region you would shade/) }).first();
    await form.scrollIntoViewIfNeeded();
    const check = form.getByRole("button", { name: /^Check$/ });
    await expect(check).toBeDisabled();
    const svg = form.locator("svg[role=img]");
    const label = (await svg.getAttribute("aria-label")) ?? "";
    const m = label.match(/from (−?\d+) to (−?\d+) across and (−?\d+) to (−?\d+) up/);
    expect(m, "the grid range in the aria-label").not.toBeNull();
    const num = (s: string) => Number(s.replace("−", "-"));
    const xlo = num(m![1]!);
    const xhi = num(m![2]!);
    const ylo = num(m![3]!);
    const yhi = num(m![4]!);
    const W = (xhi - xlo) * R_CELL + 2 * R_PAD;
    const H = (yhi - ylo) * R_CELL + 2 * R_PAD;
    const box = await svg.boundingBox();
    expect(box).not.toBeNull();
    await page.mouse.click(box!.x + ((R_PAD + (inside![0] - xlo) * R_CELL) * box!.width) / W, box!.y + ((R_PAD + (yhi - inside![1]) * R_CELL) * box!.height) / H);
    await expect(form.getByText("Region chosen")).toBeVisible();
    await expect(check).toBeEnabled();
    await check.click();
    await expect(page.getByText(/That is the (region|right side of the line)/)).toBeVisible();
  });
});
