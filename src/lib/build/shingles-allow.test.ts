import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { allowEntries, allowedBy, bookWords, noteWithoutWithdrawn, pageOfWord, specRuns, textbookPages, verdict, withoutWithdrawn, words } from "../../../scripts/qa/shingles-allow.mjs";

/**
 * scripts/qa/shingles.mjs's verdict on a run it shares with the corpus (QA fixer, 25 Sep 2026): the M4
 * circle-theorems reasons were reported as mark-scheme copies because the schemes print the theorems, which are
 * also the key words her marker checks for. An allow-listed standard statement now passes with or without a
 * leading "because" or "that", even where a scheme prints it; nothing else changes.
 */
const allow = allowEntries(JSON.parse(fs.readFileSync(path.resolve("scripts/qa/shingles.allow.json"), "utf8")));
const run = (s: string) => words(s).join(" ");
const scheme = { papers: 0, schemes: 2, reports: 0 };

describe("an allow-listed theorem statement", () => {
  it("passes inside the statement, even when a mark scheme prints it", () => {
    const a = allowedBy(run("the angle at the centre is twice the"), allow);
    expect(a?.statement).toBe("The angle at the centre is twice the angle at the circumference");
    expect(verdict(scheme, a, () => false)).toBe("allowed");
  });

  it("passes with the reason's opening word, because or that", () => {
    expect(allowedBy(run("because the angle at the centre is twice"), allow)).not.toBeNull();
    expect(allowedBy(run("that the angle at the centre is twice"), allow)).not.toBeNull();
    expect(allowedBy(run("because angles in the same segment are equal"), allow)?.statement).toBe("Angles in the same segment are equal");
  });

  it("covers the cyclic quadrilateral in its standard 'in' wording", () => {
    for (const s of ["opposite angles in a cyclic quadrilateral add up", "angles in a cyclic quadrilateral add up to", "in a cyclic quadrilateral add up to 180"])
      expect(allowedBy(run(s), allow), s).not.toBeNull();
  });

  it("does not stretch to other words: any other opener, or a run leaving the statement, keeps its verdict", () => {
    expect(allowedBy(run("so the angle at the centre is twice"), allow)).toBeNull();
    expect(allowedBy(run("because the angle at the centre is three"), allow)).toBeNull();
    expect(allowedBy(run("is twice the angle at the circumference so x"), allow)).toBeNull();
    expect(verdict(scheme, null, () => true)).toBe("scheme-or-report");
    expect(verdict({ papers: 4, schemes: 0, reports: 0 }, null, () => false)).toBe("stimulus-copy");
    expect(verdict({ papers: 4, schemes: 0, reports: 0 }, null, () => true)).toBe("stock");
    expect(verdict({ papers: 1, schemes: 0, reports: 0 }, null, () => true)).toBe("paper-copy");
  });

  it("matches whole words only", () => {
    // "ngles in the same segment are equal" is not a run of the statement's words
    expect(allowedBy("ngles in the same segment are equal", allow)).toBeNull();
  });

  /**
   * The CCEA textbooks (docs/sources/textbooks/*.txt, the lead's item 12, 27 Sep 2026): no author's wording shares a run
   * with a textbook sentence. A shared run is a textbook-copy breach, unless it is a named statement on the allow-list
   * or the board's stock instruction language (three papers and command material), which a textbook quotes too.
   */
  it("a run shared with a textbook is a breach, unless it is an allowed statement or stock instruction language", () => {
    const book = { papers: 0, schemes: 0, reports: 0, textbooks: 1 };
    expect(verdict(book, null, () => true)).toBe("textbook-copy");
    expect(verdict({ ...book, papers: 2 }, null, () => true)).toBe("textbook-copy");
    expect(verdict({ ...book, papers: 3 }, null, () => false)).toBe("textbook-copy");
    expect(verdict({ ...book, papers: 3 }, null, () => true)).toBe("stock");
    expect(verdict(book, { statement: "s", reason: "r" }, () => false)).toBe("allowed");
    // a mark scheme or a report outranks the book
    expect(verdict({ ...book, schemes: 1 }, null, () => true)).toBe("scheme-or-report");
    // no textbook count (the call of before 27 Sep) keeps every verdict it had
    expect(verdict({ papers: 1, schemes: 0, reports: 0 }, null, () => true)).toBe("paper-copy");
  });
});

describe("textbook pages", () => {
  it("reads the PDF page from the form feeds and the printed page from the page's last line", () => {
    const text = "Title\nContents  1\n\fGCSE eGuide\nMotion in a straight line\nSpeed is distance over time.\n2\n\fGCSE eGuide\nA figure\n";
    const pages = textbookPages(text);
    expect(pages.map((p) => [p.pdfPage, p.printed])).toEqual([
      [1, null],
      [2, "2"],
      [3, null],
    ]);
    // the cover (page 1, under 40 words) and the running "eGuide" headers are not the book's text
    expect(bookWords(text)).toEqual(words("Motion in a straight line Speed is distance over time. 2 A figure"));
    expect(pageOfWord(pages, 0)).toEqual({ pdfPage: 2, printed: "2" });
    expect(pageOfWord(pages, words("Motion in a straight line Speed is distance over time. 2").length)).toEqual({ pdfPage: 3, printed: null });
  });
});

/**
 * Withdrawn items are not read (the lead, 29 Sep 2026): a withdrawn copy stays in the pack byte-identical by rule, and a
 * shingle line against it tempts an author to edit it (one did). The rule of the marking and size lints: an id in a
 * withdrawn record, or an item whose own log says "withdrawn". Drafts are still read: they are what an author checks
 * before filing.
 */
describe("withdrawn items are not read", () => {
  const record = (id: string, kind: string) => ({ id, kind, replacedBy: null, reason: "r", on: "2026-09-29T00:00:00Z" });
  const bundle = {
    note: { verification: "ver.note.x" },
    questions: [{ id: "q.1", verification: "ver.q.1" }, { id: "q.2", verification: "ver.q.2" }, { id: "q.3", verification: "ver.q.3" }, { id: "q.4", verification: "ver.q.4" }],
    workedExamples: [{ id: "we.1", verification: "ver.we.1" }, { id: "we.2", verification: "ver.we.2" }],
    diagnostics: [{ id: "dx.pre", verification: "ver.dx.pre", items: [{ id: "i1" }, { id: "i2" }] }],
    findTheMistake: [{ id: "ftm.1" }],
    prompts: [{ id: "rp.1" }, { id: "rp.2" }],
    verification: [
      { id: "ver.note.x", itemId: "note.x", status: "verified", withdrawn: [record("g3", "gate"), record("q.2", "question"), record("dx.pre#i2", "diagnostic"), record("rp.2", "prompt")] },
      { id: "ver.q.1", itemId: "q.1", status: "verified" },
      { id: "ver.q.2", itemId: "q.2", status: "verified" },
      { id: "ver.q.3", itemId: "q.3", status: "withdrawn" },
      { id: "ver.q.4", itemId: "q.4", status: "draft" },
      { id: "ver.we.2", itemId: "we.2", status: "withdrawn" },
      { id: "ver.ftm.1", itemId: "ftm.1", status: "withdrawn" },
    ],
  };

  it("drops an id in a withdrawn record and an item whose own log says withdrawn, and keeps drafts", () => {
    const kept = withoutWithdrawn(bundle);
    expect(kept.questions.map((q: { id: string }) => q.id)).toEqual(["q.1", "q.4"]);
    expect(kept.workedExamples.map((w: { id: string }) => w.id)).toEqual(["we.1"]);
    expect(kept.diagnostics[0].items.map((i: { id: string }) => i.id)).toEqual(["i1"]);
    expect(kept.findTheMistake).toEqual([]);
    expect(kept.prompts.map((p: { id: string }) => p.id)).toEqual(["rp.1"]);
    // the pack is not changed: the copy stays byte-identical
    expect(bundle.questions).toHaveLength(4);
  });

  it("drops a withdrawn gate from the note, and nothing else", () => {
    const blocks = [{ type: "p", md: "Text." }, { type: "gate", id: "g3" }, { type: "gate", id: "g4" }];
    expect(noteWithoutWithdrawn(blocks, bundle)).toEqual([{ type: "p", md: "Text." }, { type: "gate", id: "g4" }]);
    expect(noteWithoutWithdrawn(blocks, null)).toEqual(blocks);
    expect(withoutWithdrawn({ questions: [{ id: "q.1" }] })).toEqual({ questions: [{ id: "q.1" }] });
  });

  // The B2 author, 8 Oct 2026: four textbook-copy runs in b2-monohybrid-genetics sat only in the scope-tier checks of nine
  // withdrawn items' own logs. A log's check texts never ship, and a withdrawn item's log never changes, so they are not
  // read; the log keeps what identifies it and its withdrawn records, which the app's resolver and the lints still need.
  it("trims a withdrawn item's own log to its id, item, status and withdrawn records, and leaves every other log whole", () => {
    const check = (detail: string) => ({ type: "scope-tier", result: "pass", detail });
    const own = record("q.5", "question");
    const withLogs = {
      ...bundle,
      questions: [...bundle.questions, { id: "q.5", verification: "ver.q.5" }],
      verification: [
        ...bundle.verification.map((l) => ({ ...l, version: 1, checks: [check(`checked ${l.id}`)], reports: ["a report"] })),
        { id: "ver.q.5", itemId: "q.5", version: 2, status: "withdrawn", checks: [check("old scope-tier text")], reports: [], withdrawn: [own] },
      ],
    };
    const kept = withoutWithdrawn(withLogs);
    const byId = new Map(kept.verification.map((l: { id: string }) => [l.id, l]));
    // the logs of q.2 (a record), q.3, we.2 and ftm.1 (their own status) and q.5 lose their checks and reports
    for (const id of ["ver.q.2", "ver.q.3", "ver.we.2", "ver.ftm.1"]) expect(Object.keys(byId.get(id) as object).sort(), id).toEqual(["id", "itemId", "status"]);
    expect(byId.get("ver.q.5")).toEqual({ id: "ver.q.5", itemId: "q.5", status: "withdrawn", withdrawn: [own] });
    // live items' logs, and the note's log with the records it carries, are untouched
    for (const id of ["ver.note.x", "ver.q.1", "ver.q.4"]) expect(byId.get(id), id).toEqual(withLogs.verification.find((l) => l.id === id));
    // the records survive, so the note's withdrawn gate is still dropped through the trimmed copy
    expect(noteWithoutWithdrawn([{ type: "gate", id: "g3" }, { type: "gate", id: "g4" }], kept)).toEqual([{ type: "gate", id: "g4" }]);
    // the pack is not changed
    expect(withLogs.verification.find((l) => l.id === "ver.q.5")?.checks).toHaveLength(1);
  });
});

describe("the specification's own words", () => {
  // The B2 author, 8 Oct 2026: "gamete and offspring ratios, percentages and probabilities, homozygous and heterozygous
  // genotypes" is 2.4.8's second and third bullets joined, which the eGuide reprints; the run crosses the join.
  const spec = {
    units: [
      {
        outcomes: [
          {
            text: "use the terms:",
            bullets: [
              { text: "dominant and recessive alleles;" },
              { text: "genotype, phenotype, gamete and offspring ratios, percentages and probabilities;" },
              { text: "homozygous and heterozygous genotypes;" },
            ],
          },
          { text: "describe the outcome of a cross between two heterozygous parents in a Punnett square.", bullets: [] },
        ],
      },
    ],
    keywords: ["genotype", "phenotype"],
  };
  const runs = specRuns([spec], 8);

  it("keeps every run inside one string", () => {
    expect(runs.has("genotype phenotype gamete and offspring ratios percentages and")).toBe(true);
  });

  it("reads across the join between two bullets, and between an outcome's stem and its first bullet", () => {
    expect(runs.has("ratios percentages and probabilities homozygous and heterozygous genotypes")).toBe(true);
    expect(runs.has("gamete and offspring ratios percentages and probabilities homozygous")).toBe(true);
    // an outcome's stem and its bullets print as one passage, so a run may cross more than one join
    expect(runs.has("use the terms dominant and recessive alleles genotype")).toBe(true);
    expect(runs.has("the terms dominant and recessive alleles genotype phenotype")).toBe(true);
  });

  it("does not join texts that never stand together", () => {
    // one outcome's last bullet and the next outcome's stem are two outcomes, never read as one passage
    expect(runs.has("heterozygous genotypes describe the outcome of a cross between")).toBe(false);
    // nor are the items of a plain list (keywords)
    expect(specRuns([{ keywords: ["a b c d", "e f g h"] }], 8).has("a b c d e f g h")).toBe(false);
  });
});
