import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import manifest from "@/generated/manifest.json";
import type { RetrievalPrompt } from "@/lib/content/schema";
import { cardSeconds, type Card } from "@/lib/slides/cards";
import { deckFor } from "@/lib/slides/deck";
import {
  countWords,
  displayTitle,
  estimateMinutes,
  gateStem,
  headingText,
  heroPromise,
  initialOpen,
  inlineLede,
  isReadV2,
  isReadV2Path,
  heroDataFor,
  hoistedFigureIndex,
  lessonBlocks,
  lessonMinutes,
  lessonSections,
  minutesHeading,
  namesTheTopic,
  plusVideos,
  sameTitle,
  SECONDS_PER_GATE,
  SECONDS_PER_PROMPT,
  videoSeconds,
  withPauses,
  withoutAsides,
  minutesForMarks,
  minutesPhrase,
  noteGateIds,
  paragraphAfterLede,
  spineTitle,
  stageEyebrow,
} from "./lesson-plan";

const hero = {
  type: "hero",
  lede: "Cut the top off a cone and what is left is a frustum.",
  can: ["Find the volume", "Add the volumes", "Lay the working out"],
  minutes: 30,
};
const figure = { type: "figure", alt: "A frustum", svg: "<svg viewBox='0 0 10 10'></svg>", caption: "The dashed cone is the piece taken away." };
const blocks = [
  hero,
  { type: "h", text: "Frustums and compound solids" },
  { type: "p", md: "Cut the top off a cone and what is left is a frustum. You already know the separate shapes." },
  figure,
  { type: "gate", id: "g1", kind: "blank", prompt: "A frustum is a cone minus a __ cone.", answer: "small", explain: "Yes." },
  { type: "h", text: "2. A frustum is a subtraction" },
  { type: "p", md: `${"word ".repeat(180).trim()}` },
  { type: "gate", id: "g2", kind: "number", prompt: "How many cones?", answer: "2", explain: "Two." },
  { type: "h", text: "In the exam" },
];

describe("minutes", () => {
  it("reads at 180 words a minute and pays 40 seconds for a check", () => {
    expect(estimateMinutes(180, 0)).toBe(1);
    expect(estimateMinutes(360, 3)).toBe(4); // 2 min + 2 min
    expect(estimateMinutes(0, 0)).toBe(1); // never less than a minute
  });

  it("prices a question at 1.2 minutes a mark", () => {
    expect(minutesForMarks(10)).toBe(12);
    expect(minutesForMarks(0)).toBe(1);
  });

  it("phrases a stage eyebrow as a verb and a cost", () => {
    expect(stageEyebrow("Read and check", 12)).toBe("Read and check · about 12 min");
    expect(minutesPhrase(1)).toBe("about 1 min");
  });

  it("counts a TeX span as one word and ignores markdown markers", () => {
    expect(countWords("**Two** words")).toBe(2);
    expect(countWords("The volume is $\\frac{1}{3}\\pi r^2 h$ exactly")).toBe(5);
  });
});

describe("minutes: a prompt and a video, priced as Slides prices them (audit LD-04, CT-12)", () => {
  const h = (text: string) => ({ type: "h", text });
  const p = (words: number) => ({ type: "p", md: "word ".repeat(words).trim() });
  const prompt = (id: string) => ({ type: "prompt", promptId: id });
  const video = (extra: Record<string, unknown> = {}) => ({ type: "video", videoId: "abc", title: "A video", channel: "corbettmaths", ...extra });

  it("prices a retrieval prompt inside the note at 30 seconds, what the same prompt costs as a Slides recall card", () => {
    const withPrompts = lessonSections([h("1. One"), p(180), prompt("rp.1"), prompt("rp.2"), prompt("rp.3"), prompt("rp.4")]);
    expect(withPrompts[0].minutes).toBe(3); // 1 minute of reading + 4 x 30 s
    expect(lessonSections([h("1. One"), p(180)])[0].minutes).toBe(1);
    // One price for the same work in both ways in: the deck's recall card and gate cost what the note's do.
    const recall = { kind: "recall", key: "recall:rp.1", prompt: { id: "rp.1" } as unknown as RetrievalPrompt, index: 1, total: 1 } as Card;
    const gate = { kind: "gate", key: "gate:g1", section: null, gate: { id: "g1" }, afterMedia: null, retry: false } as unknown as Card;
    expect(cardSeconds(recall)).toBe(SECONDS_PER_PROMPT);
    expect(cardSeconds(gate)).toBe(SECONDS_PER_GATE);
  });

  it("names a video with no stated length beside the minutes, and counts one that states its length", () => {
    const untimed = lessonSections([h("1. See it done"), video(), p(90)]);
    expect(untimed[0].untimedVideos).toBe(1);
    expect(untimed[0].minutes).toBe(1);
    const timed = lessonSections([h("1. See it done"), video({ start: 30, end: 330 }), p(90)]);
    expect(timed[0].untimedVideos).toBe(0);
    expect(timed[0].minutes).toBe(6); // 5 minutes of video + half a minute of reading
    expect(videoSeconds(video({ end: 120 }))).toBe(120);
    expect(videoSeconds(video())).toBeNull();
    expect(videoSeconds(p(10))).toBeNull();
    expect(plusVideos(0)).toBeNull();
    expect(plusVideos(1)).toBe("plus a video");
    expect(plusVideos(2)).toBe("plus two videos");
    expect(heroDataFor([hero, h("1. One"), video(), p(20), h("2. Two"), video(), p(20)]).untimedVideos).toBe(2);
  });

  it("says one minute, not one minutes", () => {
    expect(minutesHeading(1)).toBe("About 1 minute");
    expect(minutesHeading(9)).toBe("About 9 minutes");
  });
});

describe("inlineLede: a stacked fraction in the hero's lede takes the inline size (audit CD-06, CT-13)", () => {
  it("reads an authored \\dfrac inside $…$ as \\frac, in the lede only", () => {
    const lede = "$\\dfrac{12}{18}$ cancels to $\\dfrac{2}{3}$ because 6 divides the whole of the top and the whole of the bottom.";
    expect(inlineLede(lede)).toBe("$\\frac{12}{18}$ cancels to $\\frac{2}{3}$ because 6 divides the whole of the top and the whole of the bottom.");
  });

  it("leaves display maths, \\frac, \\tfrac, other commands and plain words as written", () => {
    for (const md of ["See $$\\dfrac{a}{b}$$ first.", "Half is $\\frac{1}{2}$ or $\\tfrac{1}{2}$.", "A ticket costs \\$5 and $x^{2}$ grows.", "No maths at all."]) {
      expect(inlineLede(md), md).toBe(md);
    }
    expect(inlineLede("$\\dfrac{a}{b} + \\dfrac{c}{d}$")).toBe("$\\frac{a}{b} + \\frac{c}{d}$");
  });

  it("changes nothing else in the trial topic's own lede", () => {
    const bundle = JSON.parse(readFileSync(path.resolve(__dirname, "../../../public/content/further-maths/fm.u1.algebraic-fractions-simplify.json"), "utf8")) as { noteBlocks: unknown[] };
    const lede = heroDataFor(bundle.noteBlocks).lede;
    expect(inlineLede(lede)).not.toMatch(/\\dfrac/);
    // Only a stacked fraction changes size; the lede is otherwise the note's, word for word (it is authored at \\frac now).
    expect(inlineLede(lede)).toBe(lede.replace(/\\dfrac/g, "\\frac"));
  });
});

describe("the hero's promise: each way in states its own numbers, named, from its own source (audit LD-04)", () => {
  const shared = { untimedVideos: 1, checks: 7, workedExamples: 2, findings: 2, practicals: [] as string[] };

  it("names Slides and Read with their own minutes and size, Slides first, and says the shared facts once", () => {
    const promise = heroPromise({ read: { minutes: 11, sections: 7 }, slides: { minutes: 12, cards: 25 }, ...shared });
    expect(promise.ways).toEqual([
      { way: "slides", label: "Slides", minutes: "about 12 minutes", plus: "plus a video", size: "25 cards" },
      { way: "read", label: "Read", minutes: "about 11 minutes", plus: "plus a video", size: "7 sections" },
    ]);
    expect(promise.facts).toEqual(["7 checks", "2 worked examples", "2 examiner findings"]);
  });

  it("keeps the one line on a topic with one way in", () => {
    const promise = heroPromise({ read: { minutes: 9, sections: 1 }, slides: null, ...shared, untimedVideos: 0, checks: 1, workedExamples: 1, findings: 0, practicals: ["B3"] });
    expect(promise.ways).toEqual([{ way: "read", label: null, minutes: "About 9 minutes", plus: null, size: "1 section" }]);
    expect(promise.facts).toEqual(["1 check", "1 worked example", "Prescribed Practical B3"]);
  });

  it("on the trial topic, reads Read from the note and Slides from the deck, the numbers the track and the title card print", () => {
    const bundle = JSON.parse(readFileSync(path.resolve(__dirname, "../../../public/content/further-maths/fm.u1.algebraic-fractions-simplify.json"), "utf8")) as {
      noteBlocks: unknown[];
      prompts: RetrievalPrompt[];
    };
    const blocks = bundle.noteBlocks;
    const heroData = heroDataFor(blocks);
    const sections = lessonSections(blocks, heroData.lede);
    const deck = deckFor("fm.u1.algebraic-fractions-simplify", blocks, bundle.prompts).stats;
    const promise = heroPromise({
      read: { minutes: heroData.minutes, sections: sections.length },
      slides: { minutes: deck.minutes, cards: deck.cards },
      untimedVideos: heroData.untimedVideos,
      checks: noteGateIds(blocks).length,
      workedExamples: 2,
      findings: 2,
      practicals: [],
    });
    const [slides, read] = promise.ways;
    // Read: the sections the track counts ("1 of 7") and the minutes its Contents heading prints.
    expect(read.size).toBe(`${sections.length} sections`);
    expect(read.minutes).toBe(`about ${lessonMinutes(blocks, heroData.lede)} minutes`);
    // Slides: the deck's own cards and minutes, the numbers on its title card and its Start button.
    expect(slides.size).toBe(`${deck.cards} cards`);
    expect(slides.minutes).toBe(`about ${deck.minutes} minutes`);
    // The note's video states its length now (5 min 41 s): both ways count it in their minutes, and neither adds "plus a video".
    expect(heroData.untimedVideos).toBe(0);
    expect(deck.untimedVideos).toBe(heroData.untimedVideos);
    expect(slides.plus).toBeNull();
    expect(read.plus).toBeNull();
  });
});

describe("heroDataFor", () => {
  it("takes the authored hero block", () => {
    const h = heroDataFor(blocks);
    expect(h.lede).toBe(hero.lede);
    expect(h.can).toHaveLength(3);
    // The authored 30 gives way to the note's own measure, the figure the spine shows: 1 + 2 + 1 minutes.
    expect(h.minutes).toBe(4);
    expect(h.minutes).toBe(lessonSections(blocks, h.lede).reduce((n, s) => n + s.minutes, 0));
    expect(heroDataFor([hero]).minutes).toBe(30);
    expect(h.fallback).toBe(false);
    expect(h.generated).toBe(false);
    expect(h.figure).toEqual({ kind: "svg", svg: figure.svg, alt: "A frustum", caption: figure.caption });
  });

  it("marks a pipeline-written hero as generated", () => {
    expect(heroDataFor([{ ...hero, generated: true }]).generated).toBe(true);
  });

  it("carries an authored short title, and none when there is none", () => {
    expect(heroDataFor([hero]).short).toBeNull();
    expect(heroDataFor([{ ...hero, short: "Frustums" }]).short).toBe("Frustums");
    expect(heroDataFor([{ type: "p", md: "Words." }]).short).toBeNull();
  });

  it("falls back to the first paragraph, no promises, and a computed estimate", () => {
    const h = heroDataFor(blocks.slice(1));
    expect(h.fallback).toBe(true);
    expect(h.lede).toBe("Cut the top off a cone and what is left is a frustum. You already know the separate shapes.");
    expect(h.can).toEqual([]);
    // The spine's three sections, the lede's paragraph read in the hero rather than the lesson: 1 + 2 + 1.
    expect(h.minutes).toBe(4);
  });

  it("promotes the first figure and leaves a photo-first note to its photo", () => {
    expect(hoistedFigureIndex(blocks)).toBe(3);
    const photo = { type: "photo", src: "/img/a.jpg", alt: "A dune", credit: "Someone", licence: "CC BY 4.0" };
    const h = heroDataFor([hero, photo, figure]);
    expect(h.figure?.kind).toBe("photo");
  });

  it("has no figure when the note has none", () => {
    expect(heroDataFor([hero, { type: "p", md: "Words." }]).figure).toBeNull();
  });
});

describe("lessonSections", () => {
  it("is one row per heading, numbered, with its own minutes and gates", () => {
    const sections = lessonSections(blocks);
    expect(sections.map((s) => s.title)).toEqual(["Frustums and compound solids", "A frustum is a subtraction", "In the exam"]);
    expect(sections.map((s) => s.n)).toEqual([1, 2, 3]);
    expect(sections[0].gateIds).toEqual(["g1"]);
    expect(sections[1].gateIds).toEqual(["g2"]);
    expect(sections[1].minutes).toBe(2); // 180 words + one check
    expect(sections[2].minutes).toBe(1);
  });

  it("gives an unheaded opening to the section it introduces", () => {
    const sections = lessonSections([{ type: "p", md: "Words before any heading." }, { type: "h", text: "1. First" }, { type: "p", md: "More." }]);
    expect(sections).toHaveLength(1);
    expect(sections[0].title).toBe("First");
  });

  it("drops a heading the hero emptied, so the rows still match the note's own headings", () => {
    const emptied = [hero, { type: "h", text: "Frustums" }, { type: "p", md: hero.lede }, { type: "h", text: "1. A subtraction" }, { type: "p", md: "The piece you take off." }];
    expect(lessonSections(emptied, hero.lede).map((s) => s.title)).toEqual(["A subtraction"]);
    expect((lessonBlocks(emptied, hero.lede) as Array<{ type: string }>).filter((b) => b.type === "h")).toHaveLength(1);
  });

  it("treats a note with no headings as one section", () => {
    expect(lessonSections([{ type: "p", md: "Just prose." }]).map((s) => s.title)).toEqual(["The lesson"]);
  });

  it("strips the authored number and the second clause for the spine", () => {
    expect(spineTitle("3. Above the optimum: denatured")).toBe("Above the optimum");
    expect(spineTitle("5. The harder version: an equation in $r$")).toBe("The harder version");
    expect(spineTitle("Inhibitors, Higher Tier only")).toBe("Inhibitors, Higher Tier only");
  });

  it("lists every gate in the note", () => {
    expect(noteGateIds(blocks)).toEqual(["g1", "g2"]);
  });
});

describe("lessonBlocks", () => {
  it("drops the hero block and the figure the hero shows", () => {
    const out = (lessonBlocks(blocks) as Array<{ type: string }>).filter((b) => b.type !== "pause");
    expect(out.some((b) => b.type === "hero")).toBe(false);
    expect(out.filter((b) => b.type === "figure")).toHaveLength(0);
    expect(out).toHaveLength(blocks.length - 2);
  });

  it("puts a place to stop before every section after the first", () => {
    const out = lessonBlocks(blocks) as Array<{ type: string; text?: string }>;
    const pauses = out.map((b, i) => (b.type === "pause" ? out[i + 1]?.text : null)).filter((t) => t !== null);
    expect(pauses).toEqual(["2. A frustum is a subtraction", "In the exam"]);
  });

  it("trims the opening the hero already says, keeping the rest of the paragraph", () => {
    const out = lessonBlocks(blocks, hero.lede) as Array<{ type: string; md?: string }>;
    expect(out[1].md).toBe("You already know the separate shapes.");
  });

  it("drops a paragraph the hero repeats in full", () => {
    const out = lessonBlocks([hero, { type: "p", md: hero.lede }, { type: "p", md: "Next." }], hero.lede) as Array<{ md?: string }>;
    expect(out).toHaveLength(1);
    expect(out[0].md).toBe("Next.");
  });

  it("matches through markdown emphasis but refuses a cut that would unbalance it", () => {
    const md = "Cut the **top** off a cone and what is left is a frustum. And more.";
    expect(paragraphAfterLede(md, "Cut the top off a cone and what is left is a frustum.")).toBe("And more.");
    expect(paragraphAfterLede("**Cut the top off a cone and what is left is a frustum. And** more.", "Cut the top off a cone and what is left is a frustum.")).toBeNull();
  });

  it("cuts only the sentences the lede repeats, when the rest was edited", () => {
    const lede = "Cut the top off a cone and what is left is a frustum. A compound solid is the same idea joined up, a cone on a block.";
    const md = "Cut the top off a cone and what is left is a frustum. A compound solid is the same idea joined up — a cone on a block. You already know the shapes.";
    expect(paragraphAfterLede(md, lede)).toBe("A compound solid is the same idea joined up — a cone on a block. You already know the shapes.");
  });

  it("leaves a paragraph that only looks like the lede alone", () => {
    expect(paragraphAfterLede("A different opening entirely, longer than the guard.", hero.lede)).toBeNull();
    expect(paragraphAfterLede("Short.", "Short.")).toBeNull();
  });
});

describe("withPauses", () => {
  const h = (text: string) => ({ type: "h", text });
  const p = (words: number) => ({ type: "p", md: "word ".repeat(words).trim() });
  it("puts a pause at every section boundary and none before the first section", () => {
    const long = [p(40), h("1. One"), p(180), h("2. Two"), p(180), h("3. Three"), p(180)];
    const out = withPauses(long) as Array<{ type: string; text?: string }>;
    expect(out.filter((b) => b.type === "pause")).toHaveLength(2);
    expect(out.map((b, i) => (b.type === "pause" ? out[i + 1].text : null)).filter(Boolean)).toEqual(["2. Two", "3. Three"]);
    // A pause is not a section: the spine still sees three.
    expect(lessonSections(out)).toHaveLength(3);
  });
  it("leaves a one-section note alone", () => {
    expect(withPauses([h("1. One"), p(100)]).some((b) => (b as { type: string }).type === "pause")).toBe(false);
    expect(withPauses([p(100)])).toHaveLength(1);
  });
});

describe("Read v2 (the trial)", () => {
  it("is on for the trial topic only, and only on the topic page itself", () => {
    expect(isReadV2("further-maths", "FM1", "algebraic-fractions-simplify")).toBe(true);
    expect(isReadV2("further-maths", "FM1", "matrix-inverse-2x2")).toBe(false);
    expect(isReadV2Path("/learn/further-maths/FM1/algebraic-fractions-simplify/")).toBe(true);
    expect(isReadV2Path("/learn/further-maths/FM1/algebraic-fractions-simplify")).toBe(true);
    // Slides is a route under the topic: it has its own chrome, not the Read page's.
    expect(isReadV2Path("/learn/further-maths/FM1/algebraic-fractions-simplify/slides/")).toBe(false);
    expect(isReadV2Path("/learn/further-maths/FM1/")).toBe(false);
    expect(isReadV2Path("/learn/maths/M4/histograms-unequal-widths/")).toBe(false);
  });

  it("opens a returning visit where she stopped, and a finished lesson whole", () => {
    // The trial topic's shape: seven sections, gates g1 | g2 | g7 g3 | g4 | g5 g6 | none | none.
    const s = (n: number, gateIds: string[]) => ({ n, title: `S${n}`, heading: `S${n}`, words: 50, gateIds, minutes: 1, untimedVideos: 0 });
    const sections = [s(1, ["g1"]), s(2, ["g2"]), s(3, ["g7", "g3"]), s(4, ["g4"]), s(5, ["g5", "g6"]), s(6, []), s(7, [])];
    expect(initialOpen(sections, [])).toBe(1);
    expect(initialOpen(sections, ["g1"])).toBe(2);
    // Half way through section 3: section 3 stays the one in progress.
    expect(initialOpen(sections, ["g1", "g2", "g7"])).toBe(3);
    expect(initialOpen(sections, ["g1", "g2", "g7", "g3", "g4", "g5"])).toBe(5);
    expect(initialOpen(sections, ["g1", "g2", "g7", "g3", "g4", "g5", "g6"])).toBe(7);
    expect(initialOpen([s(1, []), s(2, [])], [])).toBe(1);
    expect(initialOpen([], [])).toBe(0);
  });
});

describe("gateStem: a gate's question laid out as §8.4 draws it, without rewording it", () => {
  // The trial topic's own gates (fm1/algebraic-fractions-simplify), verbatim.
  it("lifts a stacked fraction that ends an instruction onto its own line, with its full stop", () => {
    expect(gateStem("Simplify $\\frac{x^{2}+7x+10}{x^{2}+3x-10}$.")).toEqual({
      lead: "Simplify",
      maths: "\\frac{x^{2}+7x+10}{x^{2}+3x-10}",
      tail: "",
      stackedInline: false,
    });
  });

  it("lifts one that ends the first sentence and keeps the question after it", () => {
    expect(gateStem("Erin has reached $\\frac{3x^{2}}{x}$. Is that her answer?")).toEqual({
      lead: "Erin has reached",
      maths: "\\frac{3x^{2}}{x}",
      tail: "Is that her answer?",
      stackedInline: false,
    });
  });

  it("leaves a stacked fraction in the middle of a sentence where it is, and asks for the taller line", () => {
    expect(gateStem("In $\\dfrac{x+4}{x}$, what cancels?")).toEqual({ lead: "In $\\dfrac{x+4}{x}$, what cancels?", maths: null, tail: "", stackedInline: true });
    expect(gateStem("Is $\\frac{6}{3(x-3)}$ fully simplified?").maths).toBeNull();
  });

  it("leaves a stem with no stacked maths as one sentence", () => {
    expect(gateStem("One tap to start. What is $x^{2}-9$ as a product of two brackets?")).toEqual({
      lead: "One tap to start. What is $x^{2}-9$ as a product of two brackets?",
      maths: null,
      tail: "",
      stackedInline: false,
    });
    // \tfrac is the inline size the content lint allows: it stays in the sentence and needs no taller line.
    expect(gateStem("Can you use $s = \\tfrac{1}{2}(u + v)t$ across a whole journey?")).toMatchObject({ maths: null, stackedInline: false });
  });

  it("reads the corpus's other shapes the same way", () => {
    // Maths first, then the question.
    expect(gateStem("$\\dfrac{2x+1}{3} = 5$. The correct first line is")).toEqual({ lead: "", maths: "\\dfrac{2x+1}{3} = 5", tail: "The correct first line is", stackedInline: false });
    // One span holding two fractions is one thing to look at.
    expect(gateStem("Simplify fully $\\dfrac{3}{x-2} - \\dfrac{12}{x^{2}-4}$.")).toMatchObject({ lead: "Simplify fully", maths: "\\dfrac{3}{x-2} - \\dfrac{12}{x^{2}-4}", tail: "" });
    // Words before it may carry their own inline maths.
    expect(gateStem("Last one. The curve $y = x^{2} + 7x + 15$ has completed square $(x + \\frac{7}{2})^{2} + \\frac{11}{4}$. Its minimum point is:")).toEqual({
      lead: "Last one. The curve $y = x^{2} + 7x + 15$ has completed square",
      maths: "(x + \\frac{7}{2})^{2} + \\frac{11}{4}",
      tail: "Its minimum point is:",
      stackedInline: false,
    });
    // Two stacked spans: nothing is lifted, both stay in the sentence.
    expect(gateStem("$y = 6x^{4} - 3x^{2}$ has $\\frac{dy}{dx} = 24x^{3} - 6x$. Differentiate once more: $\\frac{d^{2}y}{dx^{2}} = $ ___")).toMatchObject({ maths: null, stackedInline: true });
    // A question mark straight after the maths keeps it in the question.
    expect(gateStem("What is the common denominator for $\\frac{1}{x+3} + \\frac{1}{x-5}$?").maths).toBeNull();
  });

  it("keeps a literal dollar a dollar and lifts authored display maths wherever it sits", () => {
    expect(gateStem("A ticket costs \\$5. Work out $\\frac{15}{5}$.")).toMatchObject({ lead: "A ticket costs \\$5. Work out", maths: "\\frac{15}{5}" });
    expect(gateStem("Look at $$y = mx + c$$ and name the gradient.")).toEqual({ lead: "Look at", maths: "y = mx + c", tail: "and name the gradient.", stackedInline: false });
  });

  it("puts every word of the stem back when the pieces are read in order", () => {
    const words = (s: string) => s.replace(/[$.]/g, " ").split(/\s+/).filter(Boolean);
    for (const prompt of [
      "Simplify $\\frac{x^{2}+7x+10}{x^{2}+3x-10}$.",
      "Erin has reached $\\frac{3x^{2}}{x}$. Is that her answer?",
      "A sector has radius 5 cm and angle 72°. Its arc is $\\dfrac{72}{360} \\times 2\\pi(5)$. What is that, to 1 decimal place?",
    ]) {
      const s = gateStem(prompt);
      expect(words([s.lead, s.maths ?? "", s.tail].join(" ")), prompt).toEqual(words(prompt));
    }
  });
});

describe("displayTitle", () => {
  it("keeps a short catalogue title as it is, asides removed", () => {
    expect(displayTitle("Completing the square (coefficient of x² = 1)", "Completing the square")).toBe("Completing the square");
    expect(displayTitle("Differentiating integer powers of x", "The slope that keeps changing")).toBe("Differentiating integer powers of x");
    expect(displayTitle("Echoes, ultrasound, sonar and radar", "Echoes")).toBe("Echoes, ultrasound, sonar and radar");
  });

  it("takes the note's first heading when it names the topic", () => {
    const histograms = "Histograms with unequal class widths (frequency density) and estimating the median";
    expect(displayTitle(histograms, "Histograms with unequal class widths")).toBe("Histograms with unequal class widths");
    expect(displayTitle("Trigonometry (sin, cos, tan) in right-angled triangles; angles of elevation and depression", "Trigonometry in right-angled triangles")).toBe(
      "Trigonometry in right-angled triangles",
    );
    expect(displayTitle("Growth and decay, and exponential graphs y = k to the power x", "Growth, decay and the graphs of $y = k^{x}$")).toBe(
      "Growth, decay and the graphs of $y = k^{x}$",
    );
    // The authored "1." is not part of the title.
    expect(displayTitle("Similar 2D shapes: length and area ratios; effect of enlargement on volume", "1. Similar shapes: k, k² and k³")).toBe("Similar shapes: k, k² and k³");
  });

  it("never shows a hook heading, which does not say what the topic is", () => {
    expect(displayTitle("Gradient of a curve at a point", "Where exactly?")).toBe("Gradient of a curve at a point");
    expect(displayTitle("Laws of logarithms: simplifying and combining expressions", "Three laws that work both ways")).toBe(
      "Laws of logarithms: simplifying and combining expressions",
    );
    expect(displayTitle("Simultaneous equations: one linear and one non-linear", "One linear, one non-linear")).toBe(
      "Simultaneous equations: one linear and one non-linear",
    );
    expect(namesTheTopic("Running the film backwards", "Integration as the reverse of differentiation")).toBe(false);
    expect(namesTheTopic("How fast is it changing right now?", "Gradient at a point on a curve as instantaneous rate of change")).toBe(false);
  });

  it("cuts a long title at its first semicolon or colon, never at a comma or 'and'", () => {
    expect(displayTitle("When to add or multiply probabilities: mutually exclusive and independent events", "Two rules, and the question of which")).toBe(
      "When to add or multiply probabilities",
    );
    expect(displayTitle("Surds: simplifying, expanding, rationalising the denominator; rational vs irrational", "Surds: the exact answer a calculator cannot give you")).toBe(
      "Surds: simplifying, expanding, rationalising the denominator",
    );
    // Over 60 characters with nowhere safe to cut: the whole title, never "Temperature, pH, concentration".
    expect(displayTitle("Temperature, pH, concentration and inhibitors on enzyme action", "What changes an enzyme's rate")).toBe(
      "Temperature, pH, concentration and inhibitors on enzyme action",
    );
  });

  it("prefers an authored short title to everything else", () => {
    expect(displayTitle("Temperature, pH, concentration and inhibitors on enzyme action", "What changes an enzyme's rate", "What changes an enzyme's rate")).toBe(
      "What changes an enzyme's rate",
    );
  });

  it("drops asides but keeps brackets that are maths", () => {
    expect(withoutAsides("Solving matrix equations (A ± X = B, AX = B)")).toBe("Solving matrix equations");
    expect(withoutAsides("Pascal's triangle and expanding (p + q)ⁿ")).toBe("Pascal's triangle and expanding (p + q)ⁿ");
    expect(withoutAsides("Line of best fit through (x̄, ȳ): drawing, equation and use")).toBe("Line of best fit through (x̄, ȳ): drawing, equation and use");
    expect(withoutAsides("Probabilities from the normal table using z = (x − μ)/σ")).toBe("Probabilities from the normal table using z = (x − μ)/σ");
    expect(withoutAsides("Index laws in algebra for integer (including negative) powers")).toBe("Index laws in algebra for integer powers");
  });

  it("never makes a fragment of any shipped topic's title (04-critique.md §7.9)", () => {
    // The heading rule can only return an authored heading whole, so the titles are the part to guard.
    for (const t of manifest.topics) {
      const shown = displayTitle(t.title);
      expect(shown, t.id).not.toMatch(/(,|;|:|\band|\bthe|\bof|\bto|\bin|\bwith|\bfrom)$/i);
      expect(shown.split(" ").length, t.id).toBeGreaterThanOrEqual(1);
      // Asides go; nothing else is invented: the result is the title, or the part before its first ";" or ":".
      expect(t.title.replace(/\s\([^()]*\)/g, "").replace(/\s+/g, " ").startsWith(shown.replace(/\s+/g, " ")) || withoutAsides(t.title).startsWith(shown), t.id).toBe(true);
    }
  });

  it("compares titles whatever their markup, and strips an authored number", () => {
    expect(headingText("3. Above the optimum: denatured")).toBe("Above the optimum: denatured");
    expect(sameTitle("Histograms with **unequal** class widths", "Histograms with unequal class widths")).toBe(true);
    expect(sameTitle("Completing the square", "Completing the squares")).toBe(false);
  });
});
