import { defineConfig, devices } from "@playwright/test";

/**
 * End-to-end smoke tests (P0-28) against the static export in `out/`.
 *
 * The app is a Next.js static export, so the tests run against the same files
 * that ship: `npx serve out -l 3200` (no single-page fallback, so `/learn/maths/M4/`
 * resolves to `out/learn/maths/M4/index.html` the way `trailingSlash: true` intends).
 * Build first if `out/` is missing or stale: `npm run build`.
 */

const PORT = 3200;
const BASE_URL = `http://localhost:${PORT}`;

export default defineConfig({
  testDir: "./e2e",
  // Artefacts stay inside e2e/ so nothing lands in the rest of the repo.
  outputDir: "./e2e/.artifacts/test-results",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 2 : undefined,
  timeout: 60_000,
  expect: { timeout: 15_000 },
  reporter: [["list"], ["html", { outputFolder: "./e2e/.artifacts/report", open: "never" }]],

  use: {
    baseURL: BASE_URL,
    // Animations settle instantly, so assertions do not race the motion layer.
    reducedMotion: "reduce",
    screenshot: "only-on-failure",
    trace: "retain-on-failure",
    video: "off",
  },

  projects: [
    {
      name: "Desktop Chrome",
      use: { ...devices["Desktop Chrome"], viewport: { width: 1280, height: 900 } },
    },
    {
      name: "Pixel 7",
      use: { ...devices["Pixel 7"] },
    },
  ],

  webServer: {
    command: `npx serve out -l ${PORT}`,
    url: `${BASE_URL}/`,
    reuseExistingServer: true,
    timeout: 120_000,
    stdout: "ignore",
    stderr: "pipe",
  },
});
