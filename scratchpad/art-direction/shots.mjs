import { chromium } from "playwright";
import fs from "node:fs";
import path from "node:path";

const BASE = "http://localhost:3211";
const OUT = process.argv[2] || "docs/design/art-direction/audit";
fs.mkdirSync(OUT, { recursive: true });

const PHONE = { width: 390, height: 844 };
const DESK = { width: 1280, height: 800 };

const shots = [
  // name, url, viewport, theme, options
  ["today-phone-light", "/", PHONE, "light", {}],
  ["today-phone-dark", "/", PHONE, "dark", {}],
  ["today-desktop-light", "/", DESK, "light", {}],
  ["unitmap-m4-phone-light", "/learn/maths/M4/", PHONE, "light", {}],
  ["unitmap-m4-desktop-light", "/learn/maths/M4/", DESK, "light", {}],
  ["learn-index-desktop-light", "/learn/", DESK, "light", {}],
  ["topic-histograms-phone-light", "/learn/maths/M4/histograms-unequal-widths/", PHONE, "light", {}],
  ["topic-histograms-phone-scroll1", "/learn/maths/M4/histograms-unequal-widths/", PHONE, "light", { scroll: 900 }],
  ["topic-histograms-phone-scroll2", "/learn/maths/M4/histograms-unequal-widths/", PHONE, "light", { scroll: 2400 }],
  ["topic-histograms-desktop-light", "/learn/maths/M4/histograms-unequal-widths/", DESK, "light", {}],
  ["topic-histograms-desktop-scroll1", "/learn/maths/M4/histograms-unequal-widths/", DESK, "light", { scroll: 1100 }],
  ["topic-histograms-desktop-dark", "/learn/maths/M4/histograms-unequal-widths/", DESK, "dark", {}],
  ["topic-heart-phone-light", "/learn/science/B2/b2-heart-double-circulation/", PHONE, "light", {}],
  ["topic-heart-phone-scroll1", "/learn/science/B2/b2-heart-double-circulation/", PHONE, "light", { scroll: 1400 }],
  ["topic-heart-desktop-light", "/learn/science/B2/b2-heart-double-circulation/", DESK, "light", {}],
  ["papers-phone-light", "/papers/", PHONE, "light", {}],
  ["papers-desktop-light", "/papers/", DESK, "light", {}],
  ["flashcards-phone-light", "/flashcards/", PHONE, "light", {}],
  ["flashcards-maths-phone-light", "/flashcards/maths/", PHONE, "light", {}],
  ["practise-desktop-light", "/practise/", DESK, "light", {}],
  ["map-desktop-light", "/map/", DESK, "light", {}],
  ["welcome-phone-light", "/welcome/", PHONE, "light", {}],
  ["review-phone-light", "/review/", PHONE, "light", {}],
];

const browser = await chromium.launch();

for (const [name, url, viewport, theme, opts] of shots) {
  const ctx = await browser.newContext({
    viewport,
    deviceScaleFactor: 2,
    colorScheme: theme === "dark" ? "dark" : "light",
    serviceWorkers: "block",
    isMobile: viewport.width < 500,
    hasTouch: viewport.width < 500,
  });
  await ctx.addInitScript(
    (t) => {
      try {
        localStorage.setItem("cairn.theme", t);
      } catch {}
    },
    theme,
  );
  const page = await ctx.newPage();
  try {
    await page.goto(BASE + url, { waitUntil: "domcontentloaded", timeout: 30000 });
    await page.waitForTimeout(2200);
    if (opts.scroll) {
      await page.evaluate((y) => window.scrollTo(0, y), opts.scroll);
      await page.waitForTimeout(700);
    }
    await page.screenshot({ path: path.join(OUT, name + ".png") });
    console.log("ok   " + name);
  } catch (e) {
    console.log("FAIL " + name + " :: " + e.message.split("\n")[0]);
  }
  await ctx.close();
}

await browser.close();
