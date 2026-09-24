import { describe, expect, test } from "vitest";
import { mdToPlain, parseInline, parseMd } from "./md";

describe("parseInline", () => {
  test("bold, emphasis and maths in one line", () => {
    expect(parseInline("Use **frequency density** = $\\frac{f}{w}$, *not* the height.")).toEqual([
      { type: "text", text: "Use " },
      { type: "strong", text: "frequency density" },
      { type: "text", text: " = " },
      { type: "math", tex: "\\frac{f}{w}", display: false },
      { type: "text", text: ", " },
      { type: "em", text: "not" },
      { type: "text", text: " the height." },
    ]);
  });

  test("asterisks inside maths are not emphasis", () => {
    expect(parseInline("$a*b*c$")).toEqual([{ type: "math", tex: "a*b*c", display: false }]);
  });
});

describe("parseMd", () => {
  test("paragraphs split on blank lines, single newlines become breaks", () => {
    const blocks = parseMd("First line\nsecond line\n\nNext paragraph");
    expect(blocks).toHaveLength(2);
    expect(blocks[0]).toEqual({
      type: "p",
      inlines: [
        { type: "text", text: "First line" },
        { type: "br" },
        { type: "text", text: "second line" },
      ],
    });
  });

  test("pipe tables with a header separator, maths in cells", () => {
    const md = [
      "The table shows the journey times.",
      "",
      "| Time ($t$ minutes) | $0 < t \\le 10$ | $10 < t \\le 15$ |",
      "|---|---|---|",
      "| Frequency | 4 | 10 |",
      "",
      "Estimate the median.",
    ].join("\n");
    const blocks = parseMd(md);
    expect(blocks.map((b) => b.type)).toEqual(["p", "table", "p"]);
    const table = blocks[1];
    if (table.type !== "table") throw new Error("expected a table");
    expect(table.header).not.toBeNull();
    expect(table.header?.[1]).toEqual([{ type: "math", tex: "0 < t \\le 10", display: false }]);
    expect(table.rows).toHaveLength(1);
    expect(table.rows[0][0]).toEqual([{ type: "text", text: "Frequency" }]);
  });

  test("a table without a separator row has no header", () => {
    const blocks = parseMd("| a | b |\n| c | d |");
    expect(blocks[0]).toMatchObject({ type: "table", header: null });
    if (blocks[0].type === "table") expect(blocks[0].rows).toHaveLength(2);
  });

  test("windows line endings are tolerated", () => {
    expect(parseMd("a\r\n\r\nb")).toHaveLength(2);
  });

  test("mdToPlain flattens for aria labels", () => {
    expect(mdToPlain("**Bold** and $x^2$\nnext")).toBe("Bold and x^2\nnext");
    expect(mdToPlain("| a | b |\n|---|---|\n| 1 | 2 |")).toBe("a | b\n1 | 2");
  });
});

describe("emphasis spanning maths", () => {
  test("a bold span may contain a maths segment", () => {
    expect(parseInline("Then **multiply by $2x$ first**.")).toEqual([
      { type: "text", text: "Then " },
      { type: "strong", text: "multiply by " },
      { type: "math", tex: "2x", display: false, wrap: "strong" },
      { type: "strong", text: " first" },
      { type: "text", text: "." },
    ]);
  });

  test("unpaired markers stay literal", () => {
    expect(parseInline("a ** b $c$")).toEqual([
      { type: "text", text: "a ** b " },
      { type: "math", tex: "c", display: false },
    ]);
  });
});
