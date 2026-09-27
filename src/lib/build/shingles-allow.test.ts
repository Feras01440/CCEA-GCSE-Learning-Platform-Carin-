import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { allowEntries, allowedBy, bookWords, pageOfWord, textbookPages, verdict, words } from "../../../scripts/qa/shingles-allow.mjs";

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
