import { expect, test, type Page } from "@playwright/test";

/**
 * Accessibility (ci-tooling, 11 Oct 2026): axe-core's WCAG 2.x A and AA rules on the three pages Lighthouse budgets in
 * CI (.github/lighthouse/lighthouserc.yml): the first screen a new device lands on, the trial topic's lesson (Read v2)
 * and its Slides, each in the light and the dark scheme (the app follows the device; dark is how she reads at night).
 *
 * The engine is `@axe-core/playwright`, proposed as a devDependency and not yet in package.json. CI installs it for the
 * run (`npm i --no-save`, .github/workflows/ci.yml) and sets CAIRN_REQUIRE_AXE=1, so there a missing engine fails the
 * run; a local run without it skips with that reason. Once it is a devDependency, nothing here changes.
 */

const TRIAL = "/learn/further-maths/FM1/algebraic-fractions-simplify/";

const PAGES: ReadonlyArray<{ name: string; path: string; ready: (page: Page) => Promise<void> }> = [
  {
    name: "the first screen",
    path: "/welcome/",
    ready: (page) => expect(page.getByRole("button", { name: /^Continue$/ })).toBeVisible(),
  },
  {
    name: "the trial lesson (Read v2)",
    path: TRIAL,
    ready: async (page) => {
      await expect(page.locator("[data-read='v2']")).toBeAttached();
      await expect(page.locator("#note")).toBeVisible();
    },
  },
  {
    name: "the trial lesson's Slides",
    path: `${TRIAL}slides/`,
    ready: (page) => expect(page.locator("[data-card='title']")).toBeVisible(),
  },
];

/** WCAG 2.0, 2.1 and 2.2 at levels A and AA (axe's tags): the usual bar for an accessible website. */
const TAGS = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"];

interface AxeNode {
  target: unknown[];
  failureSummary?: string;
}
interface AxeViolation {
  id: string;
  impact?: string | null;
  help: string;
  helpUrl: string;
  nodes: AxeNode[];
}
interface AxeBuilderLike {
  withTags(tags: string[]): AxeBuilderLike;
  exclude(selector: string): AxeBuilderLike;
  analyze(): Promise<{ violations: AxeViolation[] }>;
}
type AxeBuilderCtor = new (options: { page: Page }) => AxeBuilderLike;

/** The engine when it is installed, else null. The specifier is a variable so that tsc does not require the package. */
async function loadAxeBuilder(): Promise<AxeBuilderCtor | null> {
  const specifier = "@axe-core/playwright";
  try {
    const mod = (await import(specifier)) as { default?: unknown; AxeBuilder?: unknown };
    const inner = mod.default as { default?: unknown } | undefined;
    const ctor = [mod.default, inner?.default, mod.AxeBuilder].find((c) => typeof c === "function");
    return (ctor as AxeBuilderCtor | undefined) ?? null;
  } catch {
    return null;
  }
}

function describeViolations(violations: AxeViolation[]): string {
  return violations
    .map((v) => {
      const where = v.nodes
        .slice(0, 3)
        .map((n) => n.target.map(String).join(" "))
        .join("; ");
      const more = v.nodes.length > 3 ? ` and ${v.nodes.length - 3} more` : "";
      return `${v.id} (${v.impact ?? "no impact given"}): ${v.help}. ${v.nodes.length} element(s): ${where}${more}. ${v.helpUrl}`;
    })
    .join("\n");
}

for (const scheme of ["light", "dark"] as const) {
  test.describe(`Accessibility, ${scheme}`, () => {
    for (const target of PAGES) {
      test(`${target.name} has no WCAG A or AA violation axe can find`, async ({ page }, testInfo) => {
        const AxeBuilder = await loadAxeBuilder();
        if (!AxeBuilder && process.env.CAIRN_REQUIRE_AXE === "1") {
          throw new Error("@axe-core/playwright is not installed, and this run requires it (CAIRN_REQUIRE_AXE=1)");
        }
        test.skip(!AxeBuilder, "@axe-core/playwright is not installed (proposed devDependency; CI installs it for the run)");
        if (!AxeBuilder) return;

        await page.emulateMedia({ colorScheme: scheme });
        const res = await page.goto(target.path);
        expect(res?.status(), `${target.path} did not load`).toBe(200);
        await target.ready(page);
        if (scheme === "dark") await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
        await page.evaluate(() => document.fonts.ready.then(() => true));

        // Embedded third-party frames (videos) are not ours to fix; none is on these pages today.
        const { violations } = await new AxeBuilder({ page }).withTags(TAGS).exclude("iframe").analyze();
        await testInfo.attach("axe-violations.json", { body: JSON.stringify(violations, null, 2), contentType: "application/json" });
        expect(violations.length, `axe found ${violations.length} rule(s) broken on ${target.path} (${scheme}):\n${describeViolations(violations)}`).toBe(0);
      });
    }
  });
}
