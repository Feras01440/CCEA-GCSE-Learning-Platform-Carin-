import { expect, test, type Locator } from "@playwright/test";

/**
 * The transformation grid: a `graph` part with plot "transformation" is drawn on an interactive grid and marked
 * as a vertex set. Content-independent: the object's own vertices are read from the field's placeholder, so the
 * test never hard-codes an answer — leaving the object where it is is always wrong, and the feedback says so.
 */

const TOPIC = "/learn/maths/M7/combined-transformations-and-reflections-in-y-equals-plus-or-minus-x/";
const VIEW = 436; // viewBox of a −8…8 grid: pad 26, cell 24
const PAD = 26;
const CELL = 24;

function parseVertices(s: string): Array<[number, number]> {
  return [...s.matchAll(/\(\s*(-?\d+)\s*,\s*(-?\d+)\s*\)/g)].map((m) => [Number(m[1]), Number(m[2])]);
}

async function firstGridForm(page: import("@playwright/test").Page): Promise<Locator> {
  // Practice runs one question at a time, so find which practice question opens on the grid and deep-link to it.
  const res = await page.request.get("/content/maths/maths.m7.combined-transformations-and-reflections-in-y-equals-plus-or-minus-x.json");
  expect(res.status(), "published content for the transformations topic").toBe(200);
  const bundle = (await res.json()) as { questions: Array<{ style: string; parts: Array<{ answer: { kind: string; expect?: { plot?: string } } }> }> };
  const practice = bundle.questions.filter((q) => q.style === "practice");
  const index = practice.findIndex((q) => q.parts[0]?.answer.kind === "graph" && q.parts[0].answer.expect?.plot === "transformation");
  expect(index, "a practice question whose first part is drawn on the grid").toBeGreaterThanOrEqual(0);
  await page.goto(`${TOPIC}?practice=${index + 1}`);
  // The bundle is fetched on the client; the deep-linked question renders once it has loaded.
  await expect(page.getByRole("heading", { level: 2, name: /^Practice$/i })).toBeVisible();
  const form = page.locator("form").filter({ has: page.getByLabel("Vertices of the image") }).first();
  await form.scrollIntoViewIfNeeded();
  return form;
}

test.describe("Transformation grid", () => {
  test("tapping a grid point places a vertex, tapping it again lifts it, and Check waits for the full image", async ({ page }) => {
    const form = await firstGridForm(page);
    const input = form.getByLabel("Vertices of the image");
    const object = parseVertices((await input.getAttribute("placeholder")) ?? "");
    expect(object.length).toBeGreaterThanOrEqual(3);

    const svg = form.locator("svg[role=img]");
    const box = await svg.boundingBox();
    expect(box).not.toBeNull();
    const at = ([x, y]: [number, number]) => ({
      x: box!.x + ((PAD + (x + 8) * CELL) * box!.width) / VIEW,
      y: box!.y + ((PAD + (8 - y) * CELL) * box!.height) / VIEW,
    });
    const check = form.getByRole("button", { name: /^Check$/ });
    await expect(check).toBeDisabled();

    const first = at(object[0]!);
    await page.mouse.click(first.x, first.y);
    await expect(form.getByText(new RegExp(`^1 of ${object.length} vertices placed$`))).toBeVisible();
    await expect(input).toHaveValue(`(${object[0]![0]}, ${object[0]![1]})`.replace("-", "−"));

    await page.mouse.click(first.x, first.y);
    await expect(form.getByText(new RegExp(`^0 of ${object.length} vertices placed$`))).toBeVisible();

    for (const v of object) await page.mouse.click(at(v).x, at(v).y);
    await expect(form.getByText(new RegExp(`^${object.length} of ${object.length} vertices placed$`))).toBeVisible();
    await expect(check).toBeEnabled();
  });

  test("typed vertices are marked, and the unmoved object is named as what was drawn", async ({ page }) => {
    const form = await firstGridForm(page);
    const input = form.getByLabel("Vertices of the image");
    const placeholder = (await input.getAttribute("placeholder")) ?? "";
    await input.fill(placeholder.replace(/^e\.g\.\s*/, ""));
    await form.getByRole("button", { name: /^Check$/ }).click();
    await expect(page.getByText(/That is the object itself, unmoved\. The question asked for/)).toBeVisible();
  });
});
