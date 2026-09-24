import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { assembleLines } from "../../../pipeline/mine/cer-pdf-lines.mjs";
import { MANIFEST, reportText, splitReport } from "../../../pipeline/mine/extract-cer.mjs";

/**
 * pipeline/mine/extract-cer.mjs splits each Chief Examiner report into question blocks, and every
 * examiner citation in the packs (ccea-cer:<subject>:<series>:<unit>:Q<n>) is the label of one block.
 * The reports print findings as a two-column table: "Q8 (a) (i)" on the left, the finding on the right.
 * pdftotext -layout let the label column drift away from its rows (Summer 2025 B2H: the findings for
 * Q7 (c), Q8 and Q9 were filed under Q10), so the label is now read from the PDF by position: one text
 * line per printed baseline.
 */

type Item = { x: number; y: number; w: number; str: string };
const LABEL_X = 72;
const PART_X = 100;
const SUB_X = 126;
const TEXT_X = 151;

/** One table row as positioned items: labels in the left column, the finding at TEXT_X, all on one baseline. */
function row(y: number, labels: Array<[number, string]>, text: string): Item[] {
  return [
    ...labels.map(([x, str]) => ({ x, y, w: str.length * 5, str })),
    { x: TEXT_X, y, w: text.length * 5, str: text },
  ];
}

// Invented findings in the report's table shape (never the report's own words).
const PAGE: Item[] = [
  { x: 300, y: 796, w: 200, str: "CCEA GCSE Double Award Science (Summer Series) 2025" },
  ...row(760, [[LABEL_X, "Q7"], [PART_X, "(a)"], [SUB_X, "(i)"]], "Most named both changes on the diagram."),
  ...row(742, [[SUB_X, "(ii)"]], "Many drew the circles too neatly."),
  ...row(710, [[PART_X, "(b)"]], "Most read the graph well."),
  ...row(679, [[PART_X, "(c)"], [SUB_X, "(i)"]], "Many suggested two measures."),
  ...row(660, [[SUB_X, "(ii)"]], "Fewer could name a way to kill resistant bacteria."),
  ...row(641, [[LABEL_X, "Q8"], [PART_X, "(a)"]], "Some wrote the wrong parental genotype."),
  ...row(623, [[PART_X, "(b)"]], "Few could describe a back cross."),
  ...row(591, [[LABEL_X, "Q9"], [PART_X, "(a)"], [SUB_X, "(i)"]], "Many chose four nuclei but not the right four."),
  ...row(546, [[SUB_X, "(ii)"]], "Very few named independent assortment."),
  ...row(509, [[LABEL_X, "Q10"], [PART_X, "(a)"], [SUB_X, "(i)"]], "Many chose base C."),
  { x: 290, y: 47, w: 12, str: "11" },
];

describe("assembleLines (report text rebuilt from word positions)", () => {
  it("puts every left-column label on the baseline of the finding printed beside it", () => {
    const lines = assembleLines(PAGE, { left: LABEL_X }).map((l: { text: string }) => l.text);
    expect(lines.find((l: string) => l.includes("parental genotype"))).toMatch(/^Q8\s+\(a\)\s+Some wrote/);
    expect(lines.find((l: string) => l.includes("independent assortment"))).toMatch(/^\s+\(ii\)\s+Very few/);
    expect(lines.find((l: string) => l.includes("base C"))).toMatch(/^Q10\s+\(a\)\s+\(i\)\s+Many chose/);
  });

  it("joins a superscript or subscript within the tolerance to its line and keeps x order", () => {
    const lines = assembleLines(
      [
        { x: 151, y: 500, w: 40, str: "1.035" },
        { x: 192, y: 504, w: 4, str: "2" },
        { x: 200, y: 500, w: 30, str: "was seen" },
      ],
      { left: 72 },
    );
    expect(lines).toHaveLength(1);
    expect(lines[0].text.trim()).toBe("1.0352 was seen");
  });

  it("files each finding under the question label printed on its row", () => {
    const text = [
      "Biology",
      "Assessment Unit 2   Body Systems, Genetics, Microorganisms and Health",
      "Higher Tier",
      assembleLines(PAGE, { left: LABEL_X }).map((l: { text: string }) => l.text).join("\n"),
    ].join("\n");
    const { units } = splitReport(text, { subject: "science" });
    expect(units.map((u: { unit: string }) => u.unit)).toEqual(["B2H"]);
    const q = (label: string) => units[0].questions.find((b: { question: string }) => b.question === label)?.text ?? "";
    expect(units[0].questions.map((b: { question: string }) => b.question)).toEqual(["Q7", "Q8", "Q9", "Q10"]);
    expect(q("Q7")).toContain("resistant bacteria");
    expect(q("Q8")).toContain("parental genotype");
    expect(q("Q8")).toContain("back cross");
    expect(q("Q9")).toContain("independent assortment");
    expect(q("Q10")).toContain("base C");
    expect(q("Q10")).not.toContain("genotype");
  });
});

describe("splitReport question labels", () => {
  it("reads a label printed a few points right of the margin (Summer 2025 P2F Q6, Summer 2023 M1 Q28)", () => {
    const text = [
      "Physics",
      "Assessment Unit 2   Physics",
      "Foundation Tier",
      "Q5   A QWC question on stars.",
      " Q6  (a)  The diagram of the Solar System confused some.",
      "     (b)  Objects in orbit were well known.",
      "Q7   (a)  Energy transfer was well answered.",
    ].join("\n");
    const { units } = splitReport(text, { subject: "science" });
    expect(units[0].questions.map((b: { question: string }) => b.question)).toEqual(["Q5", "Q6", "Q7"]);
    expect(units[0].questions[1].text).toContain("Objects in orbit");
  });

  it("drops the running footer when the PDF's letter-spacing splits its words", () => {
    const text = [
      "Physics",
      "Assessment Unit 2   Physics",
      "Foundation Tier",
      "Q5   A QWC question on stars.",
      "\f                  CCEA GCSE Double Award Science ( S u m m e r S e r ies) 2025",
      "     It continued on the next page.",
    ].join("\n");
    const { units } = splitReport(text, { subject: "science" });
    expect(units[0].questions[0].text).toBe("A QWC question on stars.\nIt continued on the next page.");
  });

  it("does not read an indented reference to a question as a label", () => {
    const text = ["Physics", "Assessment Unit 2   Physics", "Foundation Tier", "Q5   Stars.", "          Q6 was answered better."].join("\n");
    const { units } = splitReport(text, { subject: "science" });
    expect(units[0].questions.map((b: { question: string }) => b.question)).toEqual(["Q5"]);
  });
});

// The reports themselves are private (docs/sources is gitignored): these run only where they are held.
type Subject = "maths" | "further-maths" | "science";
const entry = (subject: Subject, series: string) =>
  (MANIFEST[subject] as Array<{ series: string; file: string }>).find((e) => e.series === series)!;
const held = (subject: Subject, series: string) => fs.existsSync(entry(subject, series).file.replace(/\.txt$/, ".pdf"));

describe.skipIf(!held("science", "2025-summer") || !held("science", "2023-summer"))("the real reports, labels by position", () => {
  const blocks = async (subject: Subject, series: string, unit: string) => {
    const { text, from } = await reportText(entry(subject, series));
    expect(from).toBe("pdf");
    const u = splitReport(text, { subject }).units.find((x: { unit: string }) => x.unit === unit)!;
    return (label: string) => u.questions.filter((b: { question: string }) => b.question === label).map((b: { text: string }) => b.text).join("\n");
  };

  it("Summer 2025 B2H: Q7 (c), Q8 and Q9 are no longer filed under Q10", async () => {
    const q = await blocks("science", "2025-summer", "B2H");
    expect(q("Q7")).toMatch(/MRSA/);
    expect(q("Q8")).toMatch(/genotype/);
    expect(q("Q8")).toMatch(/cross/);
    expect(q("Q9")).toMatch(/assortment/);
    expect(q("Q10")).not.toMatch(/MRSA|genotype|assortment/);
    expect(q("Q10")).toMatch(/DNA/);
  }, 60_000);

  it("Summer 2023 B2H: Q9's findings are no longer filed under Q10", async () => {
    const q = await blocks("science", "2023-summer", "B2H");
    expect(q("Q9")).toMatch(/germ cells/);
    expect(q("Q10")).not.toMatch(/germ cells/);
  }, 60_000);
});

it("the manifest names a PDF beside every report text it holds", () => {
  for (const [, entries] of Object.entries(MANIFEST as Record<string, Array<{ file: string }>>)) {
    for (const e of entries) {
      if (!fs.existsSync(e.file)) continue;
      expect(fs.existsSync(e.file.replace(/\.txt$/, ".pdf")), path.basename(e.file)).toBe(true);
    }
  }
});
