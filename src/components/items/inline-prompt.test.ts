import { describe, expect, test } from "vitest";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import type { RetrievalPrompt } from "@/lib/content/schema";
import { InlinePrompt } from "./InlinePrompt";
import { btnCheck, btnSecondary } from "./ui";

// The Read agent's report (23 Sep 2026): at a lesson's end the inline retrieval prompt's "Show answer" was accent
// filled, so two accent controls sat on one screen beside Continue, where the art direction allows one
// (docs/design/art-direction/01-art-direction.md §12). Inside a note the prompt is optional, so revealing its answer is a
// secondary action. On the review screen the prompt is the whole task, and "Show answer" stays its one primary.
const prompt = {
  id: "rp.maths.m4.test.01",
  topic: "maths.m4.test",
  specRefs: ["M4-1.1"],
  kind: "qa",
  prompt: "What is the gradient of y = 3x + 2?",
  answer: "3",
} as unknown as RetrievalPrompt;

const showAnswer = (html: string) => {
  const m = /<button type="submit" class="([^"]*)"[^>]*>\s*Show answer\s*<\/button>/.exec(html);
  if (!m) throw new Error("no Show answer button");
  return m[1]!;
};

describe("InlinePrompt: the Show answer control", () => {
  test("inside a note it is a secondary button, never accent filled", () => {
    const cls = showAnswer(renderToStaticMarkup(createElement(InlinePrompt, { prompt, mode: "inline", onGrade: () => {} })));
    expect(cls).toBe(btnSecondary);
    expect(cls).not.toMatch(/\bbg-accent\b/);
  });
  test("on the review screen it stays the one primary", () => {
    const cls = showAnswer(renderToStaticMarkup(createElement(InlinePrompt, { prompt, mode: "review", onGrade: () => {} })));
    expect(cls).toBe(btnCheck);
  });
});
