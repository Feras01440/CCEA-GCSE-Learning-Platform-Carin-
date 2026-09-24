import { describe, expect, test } from "vitest";
import { lintKeyWords } from "./keyword-lint";

const part = (accepted: string[], any: string[], solution = "") => ({
  id: "b",
  prompt: "Explain why the rate falls above 40 °C.",
  answer: { kind: "text", accepted, keyWords: [{ any, marks: 1 }], listingRule: false },
  solution,
});

describe("lintKeyWords", () => {
  test("a group the accepted answer earns under the engine's matching passes, stems and apostrophes included", () => {
    const bundle = {
      questions: [
        { id: "q.science.b1.x.0001", parts: [part(["the enzymes are denatured so the active site changes shape"], ["denatur"])] },
        { id: "q.science.b1.x.0002", parts: [part(["add Benedict's solution and heat it"], ["benedict"])] },
      ],
    };
    expect(lintKeyWords(bundle, "b1/x")).toEqual({ hard: [], soft: [] });
  });
  test("a group no accepted answer earns is reported, hard or soft depending on the part's own wording", () => {
    const bundle = {
      questions: [
        { id: "q.science.b1.x.0003", parts: [part(["the water bath keeps the temperature steady"], ["brick red", "red precipitate"], "A brick red precipitate forms.")] },
        { id: "q.science.b1.x.0004", parts: [part(["it turns blue"], ["lilac", "purple"])] },
      ],
    };
    const r = lintKeyWords(bundle, "b1/x");
    expect(r.soft).toHaveLength(1);
    expect(r.soft[0]).toMatch(/0003\(b\) key-word group 1/);
    expect(r.hard).toHaveLength(1);
    expect(r.hard[0]).toMatch(/0004\(b\).*"lilac"/);
  });
  test("worked-example twins are checked too", () => {
    const bundle = {
      workedExamples: [{ id: "we.science.b1.x.01", twin: { stem: "Name it.", answer: { kind: "text", accepted: ["oxygen"], keyWords: [{ any: ["carbon dioxide"], marks: 1 }], listingRule: false } } }],
    };
    expect(lintKeyWords(bundle, "b1/x").hard[0]).toMatch(/we\.science\.b1\.x\.01 key-word group 1/);
  });
});
