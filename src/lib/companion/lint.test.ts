import { describe, expect, it } from "vitest";
import { LINES, MOMENTS, placeholdersIn, templateFor, type CompanionLineSpec } from "./lines";
import {
  ALLOWED_FIXED_COUNTS,
  BANNED_WORDS,
  MAX_CHARS,
  bannedIn,
  countSentences,
  dateWordsIn,
  dialectWordsIn,
  formatFindings,
  lintLine,
  lintLines,
  lintRendered,
  numberWordsIn,
  placeWordsIn,
  plainLeaks,
  withoutValues,
} from "./lint";

const base: CompanionLineSpec = { id: "t.1", moment: "today-open", template: "Nothing to add.", principle: "P1", requires: [] };
const withTemplate = (template: string, patch: Partial<CompanionLineSpec> = {}): CompanionLineSpec => ({ ...base, ...patch, template });

describe("the constitution, over every line", () => {
  it("passes every authored line", () => {
    const findings = lintLines(LINES);
    expect(formatFindings(findings)).toBe("");
  });

  it("carries the forty specification lines plus the five dry ones", () => {
    expect(LINES.length).toBeGreaterThanOrEqual(45);
  });

  it("gives every line a unique id", () => {
    expect(new Set(LINES.map((l) => l.id)).size).toBe(LINES.length);
  });

  it("gives every moment at least two lines, so nothing is ever the only thing it can say", () => {
    for (const moment of MOMENTS) {
      const n = LINES.filter((l) => l.moment === moment).length;
      expect(n, `moment ${moment}`).toBeGreaterThanOrEqual(2);
    }
  });

  it("leaves at least one line sayable in plain mode at every moment", () => {
    for (const moment of MOMENTS) {
      const sayable = LINES.filter((l) => l.moment === moment && templateFor(l, true) !== null);
      expect(sayable.length, `moment ${moment} in plain mode`).toBeGreaterThanOrEqual(1);
    }
  });

  it("declares every placeholder it uses, and uses every slot it declares", () => {
    for (const line of LINES) {
      const used = new Set([...placeholdersIn(line.template), ...placeholdersIn(line.plainTemplate ?? "")]);
      for (const r of line.requires) expect([...used], `${line.id} declares ${r}`).toContain(r);
    }
  });

  it("never hard-codes a date, an hour or an answer", () => {
    for (const line of LINES) {
      expect(dateWordsIn(line.template), line.id).toEqual([]);
      expect(line.template.replace(/\{[a-zA-Z]+\}/g, "")).not.toMatch(/\d/);
    }
  });

  it("only ever spells out a number that is a rule of the product", () => {
    for (const line of LINES) {
      for (const n of numberWordsIn(line.template.replace(/\{[a-zA-Z]+\}/g, " "))) {
        expect(ALLOWED_FIXED_COUNTS, `${line.id} says “${n}”`).toContain(n);
        expect(line.fixedCounts ?? [], `${line.id} declares “${n}”`).toContain(n);
      }
    }
  });
});

describe("the rules themselves", () => {
  it("refuses an exclamation mark", () => {
    expect(lintLine(withTemplate("Good work!")).map((f) => f.rule)).toContain("exclamation");
  });

  it("refuses an emoji", () => {
    expect(lintLine(withTemplate("Nine back tonight \u{1F389}")).map((f) => f.rule)).toContain("emoji");
  });

  it("refuses a digit in a template", () => {
    expect(lintLine(withTemplate("M4 is 61 days away.")).map((f) => f.rule)).toContain("digit");
  });

  it("refuses a hard-coded date", () => {
    const rules = lintLine(withTemplate("Your first paper is on 11 May.")).map((f) => f.rule);
    expect(rules).toContain("hard-coded-date");
    expect(lintLine(withTemplate("Thursday, you said.")).map((f) => f.rule)).toContain("hard-coded-date");
  });

  it("refuses an undeclared number word, and one that is not a rule of the product", () => {
    expect(lintLine(withTemplate("Two goes is enough.")).map((f) => f.rule)).toContain("number-word");
    expect(lintLine(withTemplate("Thirteen items come back.")).map((f) => f.rule)).toContain("number-word");
    expect(lintLine(withTemplate("Two goes is enough.", { fixedCounts: ["two"] }))).toEqual([]);
  });

  it("refuses every banned word", () => {
    for (const w of BANNED_WORDS) {
      expect(bannedIn(`A line with ${w} in it.`), w).toContain(w);
    }
  });

  it("refuses the gap, the hour and asking her to stay", () => {
    for (const phrase of ["It has been three days.", "Welcome back.", "Keep going.", "Five more minutes and you are there.", "It is nine o’clock."]) {
      expect(bannedIn(phrase).length, phrase).toBeGreaterThan(0);
    }
  });

  it("refuses a slot the context cannot fill, and an undeclared quote", () => {
    expect(lintLine(withTemplate("It is {vibes}.", { requires: [] })).map((f) => f.rule)).toContain("unknown-slot");
    expect(lintLine(withTemplate("You said ‘{herNote}’.", { requires: ["herNote"] })).map((f) => f.rule)).toContain("undeclared-quote");
  });

  it("counts sentences without tripping over a paper's start time", () => {
    expect(countSentences("M4 is at 9.15. Nothing new tonight.")).toBe(2);
    expect(countSentences("One. Two. Three.")).toBe(3);
  });

  it("refuses a number in the rendered line that the context did not supply", () => {
    const supplied = lintRendered("t.1", "Nine back tonight.", { dueCount: "Nine" });
    expect(supplied).toEqual([]);
    const invented = lintRendered("t.1", "Nine back tonight, 3 of them new.", { dueCount: "Nine" });
    expect(invented.map((f) => f.rule)).toContain("digit");
  });

  it("refuses a rendered line over the length cap", () => {
    const long = `${"word ".repeat(40)}.`;
    expect(lintRendered("t.1", long, {}).map((f) => f.rule)).toContain("length");
    expect(long.length).toBeGreaterThan(MAX_CHARS);
  });

  it("accepts a supplied count that opens the line with a capital, and still refuses an invented one", () => {
    expect(lintRendered("t.1", "Nine back tonight. Two are the ones you were sure about.", { dueCount: "nine", confidentWrongCount: "two" })).toEqual([]);
    expect(lintRendered("t.1", "Nine back tonight.", { dueCount: "eight" }).map((f) => f.rule)).toContain("number-word");
    const residue = withoutValues("Tomorrow brings back bounds.", { returnDay: "tomorrow", returningTopics: "bounds" });
    expect(residue.replace(/\s+/g, " ").trim()).toBe("brings back .");
  });
});

describe("plain mode: the same facts, without the hills or the dialect", () => {
  it("finds the place language and the dialect, and nothing else", () => {
    expect(placeWordsIn("I keep the path: the dates of your papers.")).toEqual(["path"]);
    expect(placeWordsIn("One stone on the M4 cairn.")).toEqual(["cairn"]);
    expect(placeWordsIn("Nothing back tonight. Bounds is open if you want new ground.")).toEqual(["new ground"]);
    expect(placeWordsIn("One stone on M4. You were sure about two of them.")).toEqual([]);
    expect(dialectWordsIn("One wee one to finish on is plenty.")).toEqual(["wee"]);
    expect(dialectWordsIn("It comes back on Thursday without the answer. That is the deal.")).toEqual(["that is the deal"]);
    expect(dialectWordsIn("It comes back on Thursday without the answer.")).toEqual([]);
  });

  it("gives every line that carries the hills or the dialect a plain wording free of both", () => {
    for (const line of LINES) {
      if (line.place || line.dialect) expect(line.plainTemplate, line.id).toBeTruthy();
      if (!line.plainTemplate) continue;
      expect(placeWordsIn(line.plainTemplate), line.id).toEqual([]);
      expect(dialectWordsIn(line.plainTemplate), line.id).toEqual([]);
    }
  });

  it("refuses a plain wording that leaks, and a template that hides its place language", () => {
    expect(lintLine(withTemplate("On the path.", { place: true, plainTemplate: "On the cairn." })).map((f) => f.rule)).toContain("plain-leak");
    expect(lintLine(withTemplate("On the ridge.")).map((f) => f.rule)).toContain("undeclared-place");
    expect(lintLine(withTemplate("A wee one.")).map((f) => f.rule)).toContain("undeclared-dialect");
  });

  it("judges only Rowan's own words: a topic called 'Critical path analysis' is its name, not the hills", () => {
    expect(plainLeaks("Critical path analysis is open.", { nextTopicTitle: "Critical path analysis" })).toEqual([]);
    expect(plainLeaks("Bounds is open on the path.", { nextTopicTitle: "Bounds" })).toEqual(["path"]);
  });
});
