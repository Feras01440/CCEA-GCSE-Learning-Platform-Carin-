import { describe, expect, test } from "vitest";
import { hasTex, splitTex } from "./tex-split";

describe("splitTex", () => {
  test("plain text is one segment", () => {
    expect(splitTex("Estimate the median.")).toEqual([{ type: "text", text: "Estimate the median." }]);
  });

  test("inline maths is cut out and trimmed", () => {
    expect(splitTex("The class $20 < h \\le 30$ has frequency 16.")).toEqual([
      { type: "text", text: "The class " },
      { type: "math", tex: "20 < h \\le 30", display: false },
      { type: "text", text: " has frequency 16." },
    ]);
  });

  test("display maths uses $$ and may span lines", () => {
    expect(splitTex("So:\n$$\n\\frac{6}{18} \\times 10\n$$\nDone")).toEqual([
      { type: "text", text: "So:\n" },
      { type: "math", tex: "\\frac{6}{18} \\times 10", display: true },
      { type: "text", text: "\nDone" },
    ]);
  });

  test("escaped dollars are literal", () => {
    expect(splitTex("It costs \\$5 today")).toEqual([{ type: "text", text: "It costs $5 today" }]);
  });

  test("an unmatched dollar stays as text", () => {
    expect(splitTex("about $5 in total")).toEqual([{ type: "text", text: "about $5 in total" }]);
  });

  test("inline maths does not cross a line break", () => {
    expect(splitTex("cost $5\nand $6 more")).toEqual([{ type: "text", text: "cost $5\nand $6 more" }]);
  });

  test("empty delimiters are left alone", () => {
    expect(splitTex("a $$ b")).toEqual([{ type: "text", text: "a $$ b" }]);
  });

  test("several maths runs in one string", () => {
    const segs = splitTex("$n = 40$, so the median is the $20$th value.");
    expect(segs.filter((s) => s.type === "math")).toHaveLength(2);
    expect(hasTex("$x$")).toBe(true);
    expect(hasTex("no maths")).toBe(false);
  });
});
