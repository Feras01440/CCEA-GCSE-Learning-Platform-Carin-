import { describe, expect, it } from "vitest";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import type { VerificationLog } from "@/lib/content/schema";
import { CheckedPanel } from "./CheckedPanel";

const log: VerificationLog = {
  id: "vl.q.fm.u1.algebraic-fractions-simplify.0010.v1",
  itemId: "q.fm.u1.algebraic-fractions-simplify.0010",
  version: 1,
  checks: [{ type: "answer-recomputed", tool: "sympy", result: "pass", at: "2026-09-20", by: "pipeline" }],
  status: "published",
  reports: [],
} as unknown as VerificationLog;

const render = (props: Partial<Parameters<typeof CheckedPanel>[0]> = {}) =>
  renderToStaticMarkup(createElement(CheckedPanel, { log, onReport: () => {}, defaultOpen: true, ...props }));

describe("the Checked panel keeps its promise about a report (engine item 10.4, 24 Sep 2026)", () => {
  // The panel said "The item is re-checked and you see the outcome here" while the handler threw her words away. The
  // words are now kept on the device (src/lib/db/reports.ts) and go into her backup; nothing yet carries an outcome
  // back to the panel, so it promises what is true, and shows her what she sent.
  it("says where a report goes, and never promises an outcome on this panel", () => {
    const html = render();
    expect(html).toContain("Something wrong?");
    expect(html).toMatch(/kept with this item on this device and in your backup/i);
    expect(html).not.toMatch(/see the outcome here/i);
  });

  it("shows the reports she has sent on this item, oldest first, with the day she sent each", () => {
    const html = render({
      sent: [
        { at: new Date("2026-09-23T21:30:00"), text: "The answer should be 2(x - 2)/(x + 3)" },
        { at: new Date("2026-09-24T08:05:00"), text: "Part (b) says cm but the answer is in mm" },
      ],
    });
    expect(html).toContain("What you sent");
    const first = html.indexOf("The answer should be 2(x - 2)/(x + 3)");
    const second = html.indexOf("Part (b) says cm but the answer is in mm");
    expect(first).toBeGreaterThan(-1);
    expect(second).toBeGreaterThan(first);
    expect(html).toContain("23 Sept 2026");
  });

  it("shows nothing of hers when she has sent nothing", () => {
    expect(render({ sent: [] })).not.toContain("What you sent");
    expect(render()).not.toContain("What you sent");
  });
});
