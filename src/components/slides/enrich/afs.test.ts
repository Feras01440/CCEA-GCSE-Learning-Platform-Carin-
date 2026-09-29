import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { enrichmentFor, recapGlyphsFor } from "@/lib/slides/enrichment";
import { FigCancel, RECAP_GLYPHS, RecapGlyph, Substitute, TapToCancel, isRecapGlyph } from "./afs";
import { PILLS, RESULT, SHARED } from "./afs-model";
import { INTERACTIONS } from "./index";

/** The pieces a rendered drawing marks, in document order: id, what is struck ("all" or the factor), what is left. */
function pieces(markup: string, attr: "data-piece" | "data-pill"): Array<{ id: string; struck: string | null; left: string | null }> {
  return [...markup.matchAll(new RegExp(`<[a-z]+[^>]*\\s${attr}="([^"]+)"[^>]*>`, "g"))].map((m) => ({
    id: m[1],
    struck: /\sdata-struck="([^"]+)"/.exec(m[0])?.[1] ?? null,
    left: /\sdata-left="([^"]+)"/.exec(m[0])?.[1] ?? null,
  }));
}

/** The markup of one piece's group: from its tag to the group's close (a pill's group holds no other group). */
function pieceMarkup(markup: string, id: string): string {
  const start = markup.indexOf(`data-piece="${id}"`);
  const end = markup.indexOf("</g>", start);
  return markup.slice(start, end);
}

const EXACTLY = [
  { id: "t-n", struck: "3", left: "x" },
  { id: "t-b", struck: "all", left: null },
  { id: "b-n", struck: "3", left: "2" },
  { id: "b-b", struck: "all", left: null },
  { id: "b-m", struck: null, left: null },
];

describe("the drawings strike exactly what the note strikes: (x + 7) and the shared 3, never (x − 7) (the trial review, 25 Sep)", () => {
  for (const variant of ["idea", "title"] as const) {
    it(`the idea drawing (${variant}): 3 × x and 3 × 2 lose their 3, (x + 7) is struck on each line, (x − 7) stands`, () => {
      const markup = renderToStaticMarkup(createElement(FigCancel, { variant }));
      expect(pieces(markup, "data-piece")).toEqual(EXACTLY);
      // No stroke of any kind inside (x − 7)'s pill: only its outline and its text.
      const m = pieceMarkup(markup, "b-m");
      expect(m).not.toMatch(/<path/);
      expect(m).toContain("(x − 7)");
      // What stands on the right is the answer, and the label says what it is.
      expect(markup).toContain(`>${RESULT.top}</text>`);
      expect(markup).toContain(`>${RESULT.bottom}</text>`);
      expect(markup).toContain(`aria-label="3 × x × (x + 7) over 3 × 2 × (x + 7) × (x − 7). The 3 and the bracket (x + 7) are struck out of both lines, leaving x on top and 2(x − 7) underneath: x over 2(x − 7). Only a factor divides out."`);
    });
  }

  it("the figure she acts on, finished: the same pieces struck as the idea drawing, and the answer risen in", () => {
    const markup = renderToStaticMarkup(createElement(TapToCancel, { state: { struck: [...SHARED], lit: [] }, checked: { correct: true }, checkSignal: 0, onChecked: () => {} }));
    expect(pieces(markup, "data-pill")).toEqual(EXACTLY);
    expect(markup).toContain(`aria-label="${RESULT.top} over ${RESULT.bottom}"`);
    expect(markup).toContain("Both lines shared (x + 7) and a factor of 3. With both gone, x and 2(x − 7) share nothing: that is the answer.");
    expect(markup).toContain("The fraction 3x(x + 7) over 6(x + 7)(x − 7), each factor a button");
  });

  it("the figure she acts on, at rest: every factor whole, (x − 7) a button like the others", () => {
    const markup = renderToStaticMarkup(createElement(TapToCancel, { checked: null, checkSignal: 0, onChecked: () => {} }));
    expect(pieces(markup, "data-pill")).toEqual(PILLS.map((p) => ({ id: p.id, struck: null, left: null })));
    expect(markup).toContain("Tap a factor on top, then its match underneath.");
  });

  it("the registry knows the figure's pieces, so a run on an older drawing is recognised", () => {
    expect(INTERACTIONS["afs.tap-to-cancel"].pills).toEqual(PILLS.map((p) => p.id));
  });
});

describe("the g2 consequence and the recap glyphs", () => {
  it("draws her own value against the fraction's 5 at x = 1", () => {
    for (const [hers, value] of [
      ["The $x$, leaving $4$", "4"],
      ["The $x$ and the $4$", "1"],
    ] as const) {
      const markup = renderToStaticMarkup(createElement(Substitute, { hers, correct: false }));
      expect(markup).toMatch(new RegExp(`data-value="true"[^>]*>${value}</text>|data-value=""[^>]*>${value}</text>`));
      expect(markup).toContain(`your cancelled version is ${value}`);
      expect(markup).toContain(">5</text>");
    }
  });

  it("has a drawn glyph for each line the trial's recap can say, found by its words, and draws each one", () => {
    const spec = enrichmentFor("fm.u1.algebraic-fractions-simplify");
    const table = spec?.recapGlyphs ?? [];
    for (const { glyph } of table) expect(isRecapGlyph(glyph), glyph).toBe(true);
    // The table names every drawn glyph, and draws none it does not name. (cards.test.ts checks the note's own lines.)
    expect(new Set(table.map((g) => g.glyph))).toEqual(new Set(RECAP_GLYPHS));
    for (const kind of RECAP_GLYPHS) {
      const markup = renderToStaticMarkup(createElement(RecapGlyph, { kind }));
      expect(markup, kind).toContain(`data-glyph="${kind}"`);
      // Every drawn numeral stays at the 13 px floor at the recap's 44 px (a 44-unit box).
      for (const m of markup.matchAll(/font-size="([\d.]+)"/g)) expect(Number(m[1]), kind).toBeGreaterThanOrEqual(13);
    }
    // "Finish on the numbers and any lone x": the glyph carries the x as well as the numbers.
    const numbers = renderToStaticMarkup(createElement(RecapGlyph, { kind: "numbers" }));
    expect(numbers).toContain(">2x</text>");
    expect(numbers).toContain(">4x</text>");
    // "Read the newest shapes the other way round": the number first, in the accent.
    const reverse = renderToStaticMarkup(createElement(RecapGlyph, { kind: "reverse" }));
    expect(reverse).toContain(">8</tspan>");
    // A line's glyph is found by its words, never its place; and if one line has none, no line has one.
    expect(recapGlyphsFor(["Factorise both lines fully.", "Cancel only factors, never terms."], spec)).toEqual(["factorise", "cancel"]);
    expect(recapGlyphsFor(["Cancel only factors, never terms.", "Factorise both lines fully."], spec)).toEqual(["cancel", "factorise"]);
    expect(recapGlyphsFor(["Factorise both lines fully.", "Something the table does not know."], spec)).toBeNull();
    expect(recapGlyphsFor(["Factorise both lines fully."], null)).toBeNull();
  });
});
