import { describe, expect, it } from "vitest";
import { decodeSvgDataUri, sanitizeInlineSvg, svgViewBoxWidth } from "./svg";

describe("inline svg sanitiser", () => {
  it("removes style, script and event handlers but keeps currentColor drawing", () => {
    const svg = `<svg viewBox='0 0 10 10' width='10' height='10'><style>svg{color:#123}@media (prefers-color-scheme:dark){svg{color:#fff}}</style><script>alert(1)</script><circle r='4' stroke='currentColor' onclick='x()'/></svg>`;
    const out = sanitizeInlineSvg(svg);
    expect(out).not.toMatch(/<style|<script|onclick|prefers-color-scheme/);
    expect(out).toMatch(/stroke='currentColor'/);
    expect(out).toMatch(/viewBox='0 0 10 10'/);
    expect(out).not.toMatch(/width='10'/);
  });

  it("keeps internal # references and drops external hrefs", () => {
    const out = sanitizeInlineSvg(`<svg viewBox='0 0 1 1'><use href='#a'/><image href='https://x.y/z.png'/></svg>`);
    expect(out).toMatch(/href='#a'/);
    expect(out).not.toMatch(/x\.y/);
  });

  it("reads the root viewBox width, which caps how wide a figure is drawn", () => {
    expect(svgViewBoxWidth(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 560 320"><g viewBox="0 0 9 9"/></svg>`)).toBe(560);
    expect(svgViewBoxWidth(`<svg viewBox='0,0,607.8,300' width='600'></svg>`)).toBe(607.8);
    expect(svgViewBoxWidth(`<svg width="300" height="200"></svg>`)).toBeNull();
    expect(svgViewBoxWidth(`<svg viewBox="0 0 0 10"></svg>`)).toBeNull();
    expect(svgViewBoxWidth("not an svg")).toBeNull();
  });

  it("decodes utf8 and base64 svg data uris and rejects others", () => {
    expect(decodeSvgDataUri("data:image/svg+xml;utf8,<svg viewBox='0 0 1 1'></svg>")).toMatch(/^<svg/);
    expect(decodeSvgDataUri("data:image/svg+xml;base64," + Buffer.from("<svg></svg>").toString("base64"))).toBe("<svg></svg>");
    expect(decodeSvgDataUri("data:image/png;base64,AAAA")).toBeNull();
    expect(decodeSvgDataUri("/figures/a.svg")).toBeNull();
  });
});
