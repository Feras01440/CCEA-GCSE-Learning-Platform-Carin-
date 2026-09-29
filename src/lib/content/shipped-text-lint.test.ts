import { describe, expect, it } from "vitest";
import { characterWarnings, keyWordBarWarnings, shippedItems } from "./shipped-text-lint";
import { markText, type TextSpec } from "@/components/items/text-marking";

/**
 * The build's text warnings on what a topic ships (src/lib/content/shipped-text-lint.ts; the lead's items b and d, 29 Sep
 * 2026). Characters are built from their code points, never typed, so this file holds none of them itself.
 */

type Json = Record<string, unknown>;
const ch = (cp: number) => String.fromCharCode(cp);
const LABEL = "maths/content/m7/standard-form";
const question = (stem: string, extra: Json = {}): Json => ({ id: "q.maths.m7.standard-form.0003", parts: [{ id: "a", stem, answer: { kind: "numeric", value: 1 }, ...extra }] });
const shippedWith = (over: Json): Json => ({ topic: { id: "maths.m7.standard-form", title: "Standard form" }, note: null, noteBlocks: null, workedExamples: [], diagnostics: [], questions: [], findTheMistake: [], prompts: [], insight: null, sets: [], verification: [], ...over });

describe("characterWarnings: characters that must never ship", () => {
  it("names each forbidden character by its code point, with the topic, the item and the field", () => {
    const cases: Array<[number, string]> = [
      [0x00, "U+0000 NULL"],
      [0x08, "U+0008 BACKSPACE"],
      [0x0b, "U+000B LINE TABULATION"],
      [0x0c, "U+000C FORM FEED"],
      [0x0d, "U+000D CARRIAGE RETURN"],
      [0x1f, "U+001F control character"],
      [0xfffd, "U+FFFD REPLACEMENT CHARACTER"],
      [0x200b, "U+200B ZERO WIDTH SPACE"],
      [0x200c, "U+200C ZERO WIDTH NON-JOINER"],
      [0x200d, "U+200D ZERO WIDTH JOINER"],
      [0x2028, "U+2028 LINE SEPARATOR"],
      [0x2029, "U+2029 PARAGRAPH SEPARATOR"],
      [0xd800, "U+D800 LONE SURROGATE"],
      [0xdc00, "U+DC00 LONE SURROGATE"],
    ];
    for (const [cp, named] of cases) {
      const found = characterWarnings(shippedWith({ questions: [question(`Write 45 ${ch(cp)} 000 in standard form.`)] }), LABEL);
      expect(found, named).toHaveLength(1);
      expect(found[0]).toContain(`${LABEL} q.maths.m7.standard-form.0003 parts(a).stem: ${named} at character 10: `);
      expect(found[0]).toContain(`"Write 45 <${named.split(" ")[0]}> 000 in standard form."`);
    }
  });

  it("leaves a newline and a tab in prose, a whole astral character and ordinary symbols alone", () => {
    const text = `Line one${ch(0x0a)}line two${ch(0x09)}and a tab. ${String.fromCodePoint(0x1d465)} × − ² é → Cu²⁺ 30 °C`;
    expect(characterWarnings(shippedWith({ questions: [question(text)] }), LABEL)).toEqual([]);
  });

  it("names the TeX command a JSON escape ate: a tab or a newline inside maths, a form feed anywhere", () => {
    // the m7/standard-form case of 29 Sep 2026: "\times" written with one backslash in the JSON is a tab and "imes"
    const md = `**Standard form** — an answer left as an ordinary number, or as $11.7 ${ch(0x09)}imes 10^{8}$, drops it.`;
    expect(characterWarnings(shippedWith({ noteBlocks: [{ type: "hero" }, { type: "p", md }] }), LABEL)).toEqual([
      `${LABEL} note block 1 (p) md: U+0009 TAB inside maths at character 71: the JSON escape "\\t" ate the backslash of \\times, so she reads "imes"; write "\\\\times" in the JSON file: "… ordinary number, or as $11.7 <U+0009>imes 10^{8}$, drops it."`,
    ]);
    // the same letters outside maths are a tab in prose; a newline before "eq" inside display maths is \neq
    expect(characterWarnings(shippedWith({ questions: [question(`A table:${ch(0x09)}imes and dates.`)] }), LABEL)).toEqual([]);
    const display = characterWarnings(shippedWith({ questions: [question(`Show that $$x ${ch(0x0a)}eq 3$$.`)] }), LABEL);
    expect(display).toHaveLength(1);
    expect(display[0]).toContain("U+000A NEWLINE inside maths");
    expect(display[0]).toContain("ate the backslash of \\neq");
    expect(characterWarnings(shippedWith({ questions: [question(`First line${ch(0x0a)}equals the second.`)] }), LABEL)).toEqual([]);
    // a form feed is flagged wherever it stands, and "\frac" is named when "rac" follows it
    const ff = characterWarnings(shippedWith({ questions: [question(`Simplify $${ch(0x0c)}rac{6}{8}$.`)] }), LABEL);
    expect(ff).toHaveLength(1);
    expect(ff[0]).toContain('U+000C FORM FEED at character 11: the JSON escape "\\f" ate the backslash of \\frac, so she reads "rac"');
  });

  it("reads every shipped item (note blocks, worked-example steps, diagnostic items, figures' alt text) and never the logs", () => {
    const bad = `A${ch(0x200b)}B`;
    const shipped = shippedWith({
      noteBlocks: [{ type: "gate", id: "g3", kind: "choice", prompt: "Which?", options: ["x", "y"], answer: "x", explain: bad }],
      workedExamples: [{ id: "we.x.01", stem: "S", steps: [{ n: 2, working: bad, decision: "D." }], figure: { kind: "svg", src: "<svg/>", alt: bad } }],
      diagnostics: [{ id: "dx.x.pre", when: "pre", items: [{ id: "d2", stem: bad, options: [] }] }],
      verification: [{ id: "v.x", status: "verified", reports: [bad] }],
    });
    expect(characterWarnings(shipped, LABEL).map((w) => w.split(":")[0])).toEqual([
      `${LABEL} note block 0 (gate g3) explain`,
      `${LABEL} we.x.01 steps(2).working`,
      `${LABEL} we.x.01 figure.alt`,
      `${LABEL} dx.x.pre#d2 stem`,
    ]);
  });

  it("names items the way an author finds them", () => {
    expect(shippedItems(shippedWith({ questions: [{ id: "q.1" }], diagnostics: [{ id: "dx.1", items: [{ id: "d1" }] }], noteBlocks: [{ type: "p" }] })).map((x) => x.where)).toEqual([
      "topic",
      "note block 0 (p)",
      "q.1",
      "dx.1",
      "dx.1#d1",
    ]);
  });
});

describe("keyWordBarWarnings: a \"|\" that does not do what its author meant", () => {
  const textPart = (answer: Json): Json => ({ id: "q.science.b2.b2-heart-attacks-strokes.0002", parts: [{ id: "a", stem: "Explain why a stroke kills brain cells.", answer }] });
  const text = (keyWords: Json[], accepted: string[] = []): Json => ({ kind: "text", accepted, keyWords, listingRule: false });
  const HEART = "science/content/b2/b2-heart-attacks-strokes";

  it("rests on the engine's reading (text-marking.ts markText): one idea in several spellings pays once", () => {
    // Probed on 29 Sep 2026: why a bar inside a key-word entry is never warned. Splitting the entry would let one idea
    // earn two groups.
    const piped = text([{ any: ["cheap|less expensive"], marks: 1 }, { any: ["cheap|less expensive", "mass produced"], marks: 1 }]) as unknown as TextSpec;
    const split = text([{ any: ["cheap", "less expensive"], marks: 1 }, { any: ["cheap", "less expensive", "mass produced"], marks: 1 }]) as unknown as TextSpec;
    expect(markText("It is cheap and less expensive.", piped).marksAwarded).toBe(1);
    expect(markText("It is cheap and less expensive.", split).marksAwarded).toBe(2);
  });

  it("never warns on a bar inside a key-word entry, the first entry included (its raw display is the engine's to fix)", () => {
    // The lead's ruling, 29 Sep 2026, 18:00: "narrow|narrows|…" printed in her feedback is an engine display fault, fixed in
    // the engine, never by reordering packs.
    const barred = text([{ any: ["narrow|narrows|narrowed", "blocked"], marks: 1 }, { any: ["less oxygen", "no oxygen|lack of oxygen"], marks: 1 }]);
    expect(keyWordBarWarnings(shippedWith({ questions: [textPart(barred)] }), HEART)).toEqual([]);
  });

  it("warns on a bar where the marker compares the string whole: an accepted answer, a reject word, an indicative key word, a prompt's key word", () => {
    const shipped = shippedWith({
      questions: [
        textPart(text([{ any: ["active transport"], marks: 1, reject: ["diffusion|osmosis"] }], ["mitochondria|mitochondrion"])),
        { id: "q.x.0009", parts: [{ id: "b", stem: "Evaluate.", answer: { kind: "text-long", rubricId: "r", bands: [], indicativeContent: [{ point: "Cost", keyWords: ["cheap|cheaper"] }], selfMark: true } }] },
      ],
      prompts: [{ id: "rp.x.01", kind: "definition", prompt: "What is osmosis?", answer: "Water moving.", keyWords: ["water|H2O"] }],
    });
    const found = keyWordBarWarnings(shipped, HEART);
    expect(found.map((w) => w.slice(HEART.length + 1, w.indexOf(":")))).toEqual([
      "q.science.b2.b2-heart-attacks-strokes.0002 parts(a).answer",
      "q.science.b2.b2-heart-attacks-strokes.0002 parts(a).answer",
      "q.x.0009 parts(b).answer",
      "rp.x.01 keyWords[0]",
    ]);
    expect(found[0]).toContain('accepted answer 1 "mitochondria|mitochondrion" holds a "|", but an accepted answer is compared whole');
    expect(found[1]).toContain('reject word 1 "diffusion|osmosis" holds a "|", but a reject word is compared whole, so it never cancels anything');
    expect(found[2]).toContain('indicative point 1\'s key word "cheap|cheaper"');
    expect(found[3]).toContain('the retrieval prompt\'s key word "water|H2O"');
  });

  it("warns on an entry whose bars leave an empty spelling or cut a bracket (P(A|B), |x|)", () => {
    const found = keyWordBarWarnings(shippedWith({ questions: [textPart(text([{ any: ["independent", "P(A|B) = P(A)", "cheap||costs less"], marks: 1 }]))] }), HEART);
    expect(found).toHaveLength(2);
    expect(found[0]).toContain('entry 2 "P(A|B) = P(A)": the marker splits an entry at every "|", so it reads "P(A", a spelling that cuts a bracket in two');
    expect(found[1]).toContain("entry 3 \"cheap||costs less\": the marker splits an entry at every \"|\", so it reads an empty spelling");
  });

  it("reads worked-example step inputs and See it steps, and never a gate's answer (the app splits those at |)", () => {
    const input = text([{ any: ["moves"], marks: 1 }], ["diffusion|diffuses"]);
    const shipped = shippedWith({
      workedExamples: [{ id: "we.x.02", stem: "S", steps: [{ n: 3, working: "W", decision: "D", input }] }],
      noteBlocks: [
        { type: "see", stem: "S", steps: [{ n: 1, working: "W", decision: "D", input }] },
        { type: "gate", id: "g6", kind: "blank", prompt: "Valves stop the blood flowing ______.", answer: "backwards | back", explain: "E." },
      ],
    });
    expect(keyWordBarWarnings(shipped, HEART).map((w) => w.slice(HEART.length + 1, w.indexOf(":")))).toEqual(["note block 0 (see) steps(1).input", "we.x.02 steps(3).input"]);
  });
});
