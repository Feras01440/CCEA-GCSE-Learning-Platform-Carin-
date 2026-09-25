import { describe, expect, test } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import type { WorkedExample } from "@/lib/content/schema";
import { WorkedExampleAsQuestion, figureForMode } from "./WorkedExampleAsQuestion";

// 25 Sep 2026 (coordinator): a worked example's figure is annotated for the full example, so in the faded and problem
// modes it can print what a hidden step asks for. The schema now carries `figurePlain`, a copy with nothing a hidden
// step asks for: those modes show it; the full example keeps the annotated figure; the twin keeps its own figure; a
// worked example without `figurePlain` is unchanged.
const bundle = JSON.parse(readFileSync(join(process.cwd(), "packs/maths/content/m4/frustums-and-compound-solids/bundle.json"), "utf8"));
const base = bundle.workedExamples[0] as WorkedExample;
const annotated = { kind: "svg", src: "/figures/annotated.svg", alt: "Annotated figure" } as const;
const plain = { kind: "svg", src: "/figures/plain.svg", alt: "Plain figure" } as const;
const withPlain = { ...base, figure: annotated, figurePlain: plain } as WorkedExample;
const without = { ...base, figure: annotated, figurePlain: undefined } as WorkedExample;
const html = (we: WorkedExample, fade: "full" | "faded1" | "faded2" | "problem") => renderToStaticMarkup(createElement(WorkedExampleAsQuestion, { we, fade }));

describe("figureForMode", () => {
  test("the plain copy in the faded and problem modes, the annotated one in full", () => {
    expect(figureForMode(withPlain, "full")).toBe(annotated);
    expect(figureForMode(withPlain, "faded1")).toBe(plain);
    expect(figureForMode(withPlain, "faded2")).toBe(plain);
    expect(figureForMode(withPlain, "problem")).toBe(plain);
  });
  test("without a plain copy, the figure as before", () => {
    for (const fade of ["full", "faded1", "faded2", "problem"] as const) expect(figureForMode(without, fade)).toBe(annotated);
  });
});

describe("WorkedExampleAsQuestion renders the figure for its mode", () => {
  test("faded and problem show the plain figure; full shows the annotated one", () => {
    expect(html(withPlain, "full")).toContain("/figures/annotated.svg");
    expect(html(withPlain, "full")).not.toContain("/figures/plain.svg");
    for (const fade of ["faded1", "faded2", "problem"] as const) {
      expect(html(withPlain, fade), fade).toContain("/figures/plain.svg");
      expect(html(withPlain, fade), fade).not.toContain("/figures/annotated.svg");
    }
  });
  test("a worked example without figurePlain is unchanged in every mode", () => {
    for (const fade of ["full", "faded1", "faded2", "problem"] as const) expect(html(without, fade), fade).toContain("/figures/annotated.svg");
  });
});

describe("a faded rung's heading says what it asks (trial audit MK-09)", () => {
  test("fm1 algebraic-fractions-simplify WE01: the first rung asks for the last step and says so", () => {
    const b = JSON.parse(readFileSync(join(process.cwd(), "packs/further-maths/content/fm1/algebraic-fractions-simplify/bundle.json"), "utf8"));
    const we = b.workedExamples[0] as WorkedExample;
    const first = renderToStaticMarkup(createElement(WorkedExampleAsQuestion, { we, fade: "faded1" }));
    expect(first).toContain("Your turn · the last step is yours");
    expect(first).toContain("Step 3 is yours");
    const second = renderToStaticMarkup(createElement(WorkedExampleAsQuestion, { we, fade: "faded2" }));
    expect(second).toContain("Your turn · the last 2 steps are yours");
    expect(second).toContain("Step 2 is yours");
  });
});
