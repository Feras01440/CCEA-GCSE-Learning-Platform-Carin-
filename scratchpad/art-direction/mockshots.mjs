import { chromium } from "playwright";
import path from "node:path";
import url from "node:url";

const DIR = path.resolve("docs/design/art-direction/mockups");
const PHONE = { width: 390, height: 844 };
const DESK = { width: 1280, height: 800 };

const jobs = [
  ["today", PHONE, "phone", {}],
  ["today-first", PHONE, "phone", {}],
  ["today", PHONE, "phone-plan", { anchor: "#plan", offset: -40 }],
  ["today", DESK, "desktop", {}],
  ["topic", PHONE, "phone", {}],
  ["topic", PHONE, "phone-lesson", { anchor: "#note", offset: -60 }],
  ["topic", DESK, "desktop", {}],
  ["topic", DESK, "desktop-lesson", { anchor: "#note", offset: -110 }],
  ["practice", PHONE, "phone", { nth: 0, offset: -60 } ],
  ["practice", PHONE, "phone-correct", { nth: 1, offset: -60 }],
  ["practice", PHONE, "phone-partway", { nth: 2, offset: -60 }],
  ["practice", PHONE, "phone-notyet", { nth: 3, offset: -60 }],
  ["practice", DESK, "desktop", { nth: 3, offset: -80 }],
];

const browser = await chromium.launch();

for (const [name, viewport, tag, opts] of jobs) {
  const ctx = await browser.newContext({
    viewport,
    deviceScaleFactor: 2,
    isMobile: viewport.width < 500,
    hasTouch: viewport.width < 500,
  });
  const page = await ctx.newPage();
  const file = url.pathToFileURL(path.join(DIR, name + ".html")).href;
  await page.goto(file, { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(900);
  if (opts.anchor) {
    await page.evaluate(
      ([sel, off]) => {
        const el = document.querySelector(sel);
        if (el) window.scrollTo(0, el.getBoundingClientRect().top + window.scrollY + off);
      },
      [opts.anchor, opts.offset ?? 0],
    );
    await page.waitForTimeout(400);
  } else if (opts.nth !== undefined) {
    await page.evaluate(
      ([n, off]) => {
        const el = document.querySelectorAll(".state")[n];
        if (el) window.scrollTo(0, el.getBoundingClientRect().top + window.scrollY + off);
      },
      [opts.nth, opts.offset ?? 0],
    );
    await page.waitForTimeout(400);
  }
  await page.screenshot({ path: path.join(DIR, `${name}-${tag}.png`) });
  console.log("ok " + name + "-" + tag);
  await ctx.close();
}

await browser.close();
