/**
 * The marking grid on a phone (pass 3, owed by the surfaces agent on 23 September 2026): at 390 wide the table used to
 * be 520 px wide and scroll sideways inside its box, with each question's five cells side by side and its tag chips
 * wrapped into the narrow Lost column, so a row stood about 150 px tall with its inputs off screen. Below `sm` the
 * same table now lays each question out as one block by CSS alone (grid areas on the row, the header for screen
 * readers only, the table roles kept), with no minimum width and no sideways box; from `sm` it is the table it was.
 *
 * Static markup, as vitest renders it: what the classes say, checked here; what they measure, checked by the
 * headless script in the app-surfaces agent's folder (390 and 1280, light and dark).
 */
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { MARK_TAGS, type QuestionTemplate } from "@/lib/papers/meta";
import { SelfMarkGrid, gridTotals, rowsFromTemplate, type GridRow } from "./SelfMarkGrid";

const template: QuestionTemplate = {
  source: "page-map",
  verified: true,
  rows: [
    { q: "1", available: 3, page: 2 },
    { q: "2", available: 5, page: 3, label: "Bounds" },
    { q: "3", available: 4, page: 4 },
  ],
} as QuestionTemplate;

function render(rows: GridRow[]): string {
  return renderToStaticMarkup(createElement(SelfMarkGrid, { rows, onChange: () => {}, paperMarks: 12, paperUrl: "https://ccea.org.uk/x.pdf", template }));
}

const fresh = rowsFromTemplate(template);
const marked: GridRow[] = fresh.map((r, i) => (i === 1 ? { ...r, awarded: 3, tags: ["method", "accuracy"] } : i === 0 ? { ...r, awarded: 3 } : r));

describe("the marking grid below sm", () => {
  it("has no minimum width and no sideways box on a phone: the width rule and the scroller apply from sm only", () => {
    const html = render(fresh);
    expect(html).not.toMatch(/class="[^"]*(?<![a-z-]:)min-w-\[520px\]/);
    expect(html).toContain("sm:min-w-[520px]");
    expect(html).not.toMatch(/class="[^"]*(?<![a-z-]:)overflow-x-auto/);
    expect(html).toContain("sm:overflow-x-auto");
    // The table becomes blocks on the phone, and every row a grid with named areas.
    expect(html).toMatch(/<table[^>]*class="[^"]*max-sm:block/);
    expect(html).toMatch(/<thead[^>]*class="[^"]*max-sm:sr-only/);
    expect(html).toMatch(/<tbody[^>]*class="[^"]*max-sm:block/);
    const rows = html.match(/<tr[^>]*role="row"[^>]*>/g) ?? [];
    expect(rows).toHaveLength(3);
    for (const tr of rows) {
      expect(tr).toContain("max-sm:grid");
      expect(tr).toContain("max-sm:[grid-template-areas:");
    }
    for (const area of ["q", "page", "available", "awarded", "lost", "remove"]) expect(html).toContain(`max-sm:[grid-area:${area}]`);
  });

  it("keeps the table's meaning when the cells are blocks: explicit roles, and the inputs' own labels", () => {
    const html = render(fresh);
    expect(html).toMatch(/<table[^>]*role="table"/);
    expect((html.match(/role="columnheader"/g) ?? []).length).toBe(6);
    expect((html.match(/role="rowheader"/g) ?? []).length).toBe(3);
    expect((html.match(/role="cell"/g) ?? []).length).toBe(15);
    expect(html).toContain('aria-label="Question 2: marks available"');
    expect(html).toContain('aria-label="Question 2: marks awarded out of 5"');
  });

  it("names each block where the column header is no longer visible, and labels the two inputs on the phone", () => {
    const html = render(fresh);
    // "Question 2" on the phone, "2" under the Q column on the desktop: one span, hidden from sm.
    expect(html).toMatch(/<span class="sm:hidden">Question <\/span>2/);
    expect((html.match(/<span class="sm:hidden[^"]*">Available<\/span>/g) ?? []).length).toBe(3);
    expect((html.match(/<span class="sm:hidden[^"]*">Awarded<\/span>/g) ?? []).length).toBe(3);
  });

  it("leaves the Lost cell out of the phone block until a mark is entered, and keeps the chips at the tap floor", () => {
    const html = render(marked);
    // Row 3 has nothing entered: its Lost cell is hidden below sm and shows the dash on the desktop.
    const cells = html.match(/<td[^>]*max-sm:\[grid-area:lost\][^>]*>/g) ?? [];
    expect(cells).toHaveLength(3);
    expect(cells[0]).not.toContain("max-sm:hidden"); // full marks
    expect(cells[1]).not.toContain("max-sm:hidden"); // two lost, two tags
    expect(cells[2]).toContain("max-sm:hidden"); // nothing entered yet
    expect(html).toContain("full marks");
    const chips = html.match(/<button[^>]*aria-label="[^"]*: \d of \d"[^>]*>/g) ?? [];
    expect(chips).toHaveLength(MARK_TAGS.length);
    for (const chip of chips) expect(chip).toMatch(/class="[^"]*\btap\b/);
    expect(gridTotals(marked)).toEqual({ awarded: 6, available: 12, entered: 2, lost: 2, tagged: 2 });
  });
});
