import { describe, expect, it } from "vitest";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { Md } from "./Markdown";

/** The class list on Md's own wrapper. */
function wrapperClass(className?: string): string {
  const html = renderToStaticMarkup(createElement(Md, { md: "A bar's area is its frequency.", className }));
  return /^<div class="([^"]*)"/.exec(html)?.[1] ?? "";
}

const PROSE = /(^|\s)text-prose(\s|$)/;

describe("Md type size (appearance pass 1)", () => {
  it("sets learning prose at the prose token, 17 px on a phone and 18 px from md, when the caller names no size", () => {
    expect(wrapperClass()).toMatch(PROSE);
    expect(wrapperClass("mt-3")).toMatch(PROSE);
  });

  it("leaves the size to a caller that names one, so the caller's size is the only size on the element", () => {
    // An arbitrary default used to sort after a named size in the stylesheet and silently win:
    // "Because" asked for text-meta and rendered at 16 px.
    for (const size of ["text-meta", "text-ui", "text-micro", "text-h3", "text-[16px]"]) {
      const cls = wrapperClass(`mt-2 ${size} text-ink-2`);
      expect(cls).toContain(size);
      expect(cls).not.toMatch(PROSE);
      expect(cls).not.toContain("text-[16px] leading");
    }
  });
});
