import { chromium } from "playwright";
import path from "node:path";

const BASE = "http://localhost:3211";
const OUT = "docs/design/art-direction/audit";
const PHONE = { width: 390, height: 844 };
const DESK = { width: 1280, height: 800 };

const browser = await chromium.launch();

async function ctxFor(viewport, theme = "light") {
  const ctx = await browser.newContext({
    viewport,
    deviceScaleFactor: 2,
    colorScheme: theme === "dark" ? "dark" : "light",
    serviceWorkers: "block",
    isMobile: viewport.width < 500,
    hasTouch: viewport.width < 500,
  });
  await ctx.addInitScript((t) => {
    try {
      localStorage.setItem("cairn.theme", t);
    } catch {}
  }, theme);
  return ctx;
}

// Walk first run so Today renders its real tiles.
async function pastFirstRun(page) {
  await page.goto(BASE + "/welcome/", { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(1500);
  const cont = page.getByRole("button", { name: /Continue/i });
  if (await cont.count()) {
    await cont.first().click();
    await page.waitForTimeout(900);
  }
  const field = page.getByPlaceholder("First name");
  if (await field.count()) await field.first().fill("Amal");
  const begin = page.getByRole("button", { name: /Begin/i });
  if (await begin.count()) {
    await begin.first().click();
    await page.waitForTimeout(2000);
  }
}

// ---- 1. Today, past first run: phone + desktop, light + dark
for (const [name, vp, theme] of [
  ["today-real-phone-light", PHONE, "light"],
  ["today-real-desktop-light", DESK, "light"],
  ["today-real-phone-dark", PHONE, "dark"],
]) {
  const ctx = await ctxFor(vp, theme);
  const page = await ctx.newPage();
  try {
    await pastFirstRun(page);
    await page.goto(BASE + "/", { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(2200);
    await page.screenshot({ path: path.join(OUT, name + ".png") });
    console.log("ok   " + name);
  } catch (e) {
    console.log("FAIL " + name + " :: " + e.message.split("\n")[0]);
  }
  await ctx.close();
}

// ---- 2. Practice question mid-answer and marked (phone + desktop)
async function practiceShots(vp, tag) {
  const ctx = await ctxFor(vp, "light");
  const page = await ctx.newPage();
  try {
    await page.goto(BASE + "/learn/maths/M4/histograms-unequal-widths/", { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(2500);

    // Find the practice section and start it.
    const start = page.getByRole("button", { name: /Start practice|Begin practice|Start the practice|Practice/i });
    const cnt = await start.count();
    console.log("  start buttons: " + cnt);
    for (let i = 0; i < cnt; i++) {
      const t = await start.nth(i).innerText().catch(() => "");
      console.log("   [" + i + "] " + t.replace(/\n/g, " | "));
    }
    if (cnt) {
      await start.first().scrollIntoViewIfNeeded();
      await start.first().click();
      await page.waitForTimeout(1200);
    }

    // The first text/number field inside a question card.
    const fields = page.locator("input[type='text'], input[inputmode='decimal'], input[inputmode='numeric'], textarea");
    const fc = await fields.count();
    console.log("  fields: " + fc);
    if (fc) {
      const f = fields.first();
      await f.scrollIntoViewIfNeeded();
      await f.fill("1700");
      await page.waitForTimeout(400);
      await page.screenshot({ path: path.join(OUT, `practice-midanswer-${tag}.png`) });
      console.log("ok   practice-midanswer-" + tag);

      const check = page.getByRole("button", { name: /^Check$/i });
      if (await check.count()) {
        await check.first().click();
        await page.waitForTimeout(1400);
        await page.screenshot({ path: path.join(OUT, `practice-miss-${tag}.png`) });
        console.log("ok   practice-miss-" + tag);
      }
    }
  } catch (e) {
    console.log("FAIL practice-" + tag + " :: " + e.message.split("\n")[0]);
  }
  await ctx.close();
}

await practiceShots(PHONE, "phone");
await practiceShots(DESK, "desktop");

// ---- 3. The check-yourself section and the Sheet / "In the exam" panel
{
  const ctx = await ctxFor(PHONE, "light");
  const page = await ctx.newPage();
  try {
    await page.goto(BASE + "/learn/maths/M4/histograms-unequal-widths/", { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(2500);
    const h = await page.evaluate(() => document.body.scrollHeight);
    console.log("  page height: " + h);
    for (const [frac, name] of [
      [0.55, "topic-histograms-phone-mid"],
      [0.78, "topic-histograms-phone-late"],
      [0.95, "topic-histograms-phone-end"],
    ]) {
      await page.evaluate((y) => window.scrollTo(0, y), Math.round(h * frac));
      await page.waitForTimeout(800);
      await page.screenshot({ path: path.join(OUT, name + ".png") });
      console.log("ok   " + name);
    }
  } catch (e) {
    console.log("FAIL late-scroll :: " + e.message.split("\n")[0]);
  }
  await ctx.close();
}

await browser.close();
