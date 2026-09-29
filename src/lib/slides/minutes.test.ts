/**
 * The minute model (./minutes.ts): one price list for both ways in, and the whole-note estimate the content session's
 * lint imports. Fixtures pin the numbers; the corpus test holds the app to the model over every note in packs/ (read
 * straight from the packs, never the rebuilt public copy: the lead, 27 Sep 2026).
 */
import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import type { RetrievalPrompt, WorkedExample } from "@/lib/content/schema";
import * as plan from "@/components/topic/lesson-plan";
import { heroDataFor, lessonMinutes, lessonSections, seeStepsOf } from "@/components/topic/lesson-plan";
import * as cardsModule from "./cards";
import { buildDeck, deckStats } from "./cards";
import { deckFor } from "./deck";
import { ledeOf, lessonBlocks } from "./lesson-blocks";
import {
  CHECK_ITEM_MINUTES,
  FIGURE_LOOK_SECONDS,
  FIGURE_TO_ACT_ON_MINUTES,
  FIND_THE_MISTAKE_MINUTES,
  MINUTES_PER_MARK,
  RECALL_SECONDS,
  SEE_STEP_SECONDS,
  WORDS_PER_MINUTE,
  WORKED_EXAMPLE_MINUTES,
  YOUR_TURN_SECONDS,
  blockCost,
  cardCost,
  cardSeconds,
  countWords,
  estimateMinutes,
  headingWords,
  lessonMinutesFor,
  lessonTotal,
  partShares,
  partWork,
  partWords,
  partsOfCards,
  untimedPhrase,
  type PartCost,
} from "./minutes";
import { packTopics } from "./packs-corpus.test-helper";
import { shownPrompts } from "./recall";
import { SEE_FIXTURE_BLOCKS, SEE_FIXTURE_PROMPTS, SEE_FIXTURE_WORKED_EXAMPLE } from "./see-fixture";

const words = (n: number) => Array.from({ length: n }, () => "word").join(" ");
const steps = (n: number) => Array.from({ length: n }, (_, i) => ({ n: i + 1, working: `$x + ${i + 1}$`, decision: "Because the line above says so." }));
const gate = (id: string) => ({ type: "gate", id, kind: "choice", prompt: "Which line comes next?", options: ["$x$", "$2x$", "$x^{2}$"], answer: "$x$", explain: "As the steps showed." });

/** A worked example the fixture's second See it names: three steps. */
const WE = { id: "we.fm.u1.minutes-fixture.01", stem: "Simplify $\\frac{x^{2}-9}{x+3}$.", steps: steps(3), finalAnswer: "$x-3$" } as unknown as WorkedExample;
/** Two light recall prompts (a formula, a key phrase): both become recall cards, as the teach-first fixture's do. */
const PROMPTS = SEE_FIXTURE_PROMPTS as unknown as RetrievalPrompt[];
/** A prompt that asks for an explanation: neither way asks it inside the lesson (recall.ts shownPrompts; the lead's ruling, 29 Sep 2026). */
const HEAVY = {
  id: "rp.fm.u1.minutes-fixture.09",
  topic: "fm.u1.minutes-fixture",
  specRefs: ["FM1-ALF-01"],
  kind: "qa",
  prompt: "Explain why a factor cancels and a term does not.",
  answer: "A factor multiplies the whole line, so dividing both lines by it keeps the fraction's value; a term is only part of a line.",
} as unknown as RetrievalPrompt;

/**
 * The brief's fixture: a 4-step See it, a timed video (300 s), an untimed video, two recall cards, around a recap and a
 * pointer. By hand, in the model's units (a word 60, a second 180, a minute 10 800):
 *   1 "Only a factor divides out": 5 + 180 words, See it 4 x 15 s, a Your turn 40 s = 29 100 (2.69 min)
 *   2 "See it done at writing speed": 6 + 90 words, the video 300 s, the named See it 3 x 15 s, a Your turn = 75 060 (6.95)
 *   3 "The paper's way": 3 + 60 words, the untimed video 0, a Your turn = 10 980 (1.02)
 *   4 "You can now": 3 + 6 words = 540 (0.05)
 *   5 "In the exam": 3 + 30 words, two prompts 60 s = 12 780 (1.18)
 *   all 128 460 = 11.89 minutes, so 12; the rows 3 + 7 + 1 + 1 + 1 = 13 give a minute back where it was rounded up most
 *   (row 1, 2.69 shown as 3): 2 + 7 + 1 + 1 + 1 = 12.
 */
const NOTE: unknown[] = [
  { type: "hero", lede: "A lede that no paragraph of the lesson repeats, so nothing is trimmed.", can: ["Cancel a factor.", "Factorise first.", "Finish."], minutes: 30 },
  { type: "h", text: "1. Only a factor divides out", role: "idea" },
  { type: "p", md: words(180) },
  { type: "see", stem: "Simplify $\\frac{2x(x+5)}{4(x+5)}$.", steps: steps(4) },
  gate("g1"),
  { type: "h", text: "2. See it done at writing speed", role: "variant" },
  { type: "p", md: words(90) },
  { type: "video", videoId: "tlKN8NNNxdI", title: "Simplifying algebraic fractions", channel: "corbettmaths", start: 30, end: 330 },
  { type: "see", workedExample: WE.id },
  gate("g2"),
  { type: "h", text: "3. The paper's way", role: "variant" },
  { type: "p", md: words(60) },
  { type: "video", videoId: "aBcDeFgHiJk", title: "An untimed video", channel: "corbettmaths" },
  gate("g3"),
  { type: "h", text: "You can now", role: "recap" },
  { type: "p", md: "Factorise both lines.\nCancel only factors." },
  { type: "h", text: "In the exam", role: "pointer" },
  { type: "p", md: words(30) },
  { type: "prompt", promptId: PROMPTS[0]!.id },
  { type: "prompt", promptId: PROMPTS[1]!.id },
];

const without = (note: readonly unknown[], drop: (b: Record<string, unknown>) => boolean) => note.filter((b) => !drop(b as Record<string, unknown>));
const estimate = (note: readonly unknown[], prompts: RetrievalPrompt[] = PROMPTS, extra: { figuresToActOn?: number } = {}) =>
  lessonMinutesFor({ blocks: note, workedExamples: [WE], prompts, ...extra });
const deckOf = (note: readonly unknown[], prompts: RetrievalPrompt[] = PROMPTS) => buildDeck(note, prompts, null, { workedExamples: [WE] });

describe("the constants, each documented at the top of minutes.ts", () => {
  it("prices reading at 180 words a minute, a See it at 15 s a step, a Your turn 40 s, a recall 30 s, a figure's look 20 s, a figure to act on a minute", () => {
    expect([WORDS_PER_MINUTE, SEE_STEP_SECONDS, YOUR_TURN_SECONDS, RECALL_SECONDS, FIGURE_LOOK_SECONDS, FIGURE_TO_ACT_ON_MINUTES]).toEqual([180, 15, 40, 30, 20, 1]);
    expect([WORKED_EXAMPLE_MINUTES, CHECK_ITEM_MINUTES, MINUTES_PER_MARK, FIND_THE_MISTAKE_MINUTES]).toEqual([2, 1, 1.2, 2]);
    const source = fs.readFileSync(path.join(__dirname, "minutes.ts"), "utf8");
    const header = source.slice(0, source.indexOf("*/"));
    for (const name of ["WORDS_PER_MINUTE", "SEE_STEP_SECONDS", "YOUR_TURN_SECONDS", "RECALL_SECONDS", "FIGURE_LOOK_SECONDS", "FIGURE_TO_ACT_ON_MINUTES"])
      expect(header, `${name} is explained in the header`).toContain(name);
  });

  it("is the only price list: the page's and the deck's old names are the module's own values", () => {
    expect(plan.WORDS_PER_MINUTE).toBe(WORDS_PER_MINUTE);
    expect(plan.SECONDS_PER_GATE).toBe(YOUR_TURN_SECONDS);
    expect(plan.SECONDS_PER_PROMPT).toBe(RECALL_SECONDS);
    expect(plan.SECONDS_PER_SEE_STEP).toBe(SEE_STEP_SECONDS);
    expect(cardsModule.SEE_STEP_SECONDS).toBe(SEE_STEP_SECONDS);
    expect(plan.countWords).toBe(countWords);
    expect(plan.estimateMinutes).toBe(estimateMinutes);
    expect(cardsModule.cardSeconds).toBe(cardSeconds);
    expect(plan.lessonBlocks).toBe(lessonBlocks);
    expect(plan.videoSeconds).toBe(cardsModule.videoSeconds);
    expect(plan.plusVideos).toBe(untimedPhrase);
  });

  it("loads with nothing but its pure siblings, so tsx (the lint) and Playwright can import it", () => {
    const importsOf = (file: string) =>
      fs
        .readFileSync(path.join(__dirname, file), "utf8")
        .split("\n")
        .filter((l) => /^import\s/.test(l));
    for (const line of importsOf("minutes.ts")) expect(line, line).toMatch(/^import type |from "\.\/(lesson-blocks|recall|enrichment)";$/);
    expect(importsOf("lesson-blocks.ts")).toEqual([]);
    for (const file of ["recall.ts", "enrichment.ts"]) for (const line of importsOf(file)) expect(line, `${file}: ${line}`).toMatch(/^import type /);
  });
});

describe("a note with a 4-step See it, a timed video, an untimed video and two recall cards", () => {
  const stepsOfWE = seeStepsOf([WE]);

  it("prices it part by part and rounds the lesson once: 12 minutes in Read and in Slides", () => {
    const est = estimate(NOTE);
    expect(est.read.parts.map((p) => [p.heading, partWords(p), p.seconds])).toEqual([
      ["1. Only a factor divides out", 185, 100],
      ["2. See it done at writing speed", 96, 385],
      ["3. The paper's way", 63, 40],
      ["You can now", 9, 0],
      ["In the exam", 33, 60],
    ]);
    expect(est.read.parts.map((p) => Number(partWork(p).toFixed(3)))).toEqual([2.694, 6.95, 1.017, 0.05, 1.183]);
    expect(est.read.minutes).toBe(12);
    expect(est.slides.minutes).toBe(12);
    expect(est.untimedVideos).toBe(1);
  });

  it("gives the same 12 on the hero, in the track's rows (which add up to it) and on the deck's title card", () => {
    const hero = heroDataFor(NOTE, stepsOfWE);
    const sections = lessonSections(NOTE, hero.lede, stepsOfWE);
    expect(sections.map((s) => s.minutes)).toEqual([2, 7, 1, 1, 1]);
    expect(hero.minutes).toBe(12);
    expect(lessonMinutes(NOTE, hero.lede, stepsOfWE)).toBe(12);
    expect(hero.untimedVideos).toBe(1);
    const deck = deckOf(NOTE);
    expect(deck.stats).toMatchObject({ minutes: 12, recall: 2, sees: 2, videos: 2, untimedVideos: 1 });
    // The title card counts the cards it is given (SlidesRun): the deck's own cards give the same minutes.
    expect(deckStats(deck.cards).minutes).toBe(deck.stats.minutes);
  });

  it("prices the 4-step See it at 15 s a step, and the one naming a worked example by that example's steps", () => {
    expect(blockCost(NOTE[3])).toEqual({ words: 0, seconds: 60 });
    expect(blockCost(NOTE[8], { steps: stepsOfWE })).toEqual({ words: 0, seconds: 45 });
    // A name the bundle does not hold shows no steps and costs nothing, in both ways.
    expect(blockCost(NOTE[8])).toEqual({ words: 0, seconds: 0 });
    const sees = deckOf(NOTE).cards.filter((c) => c.kind === "see");
    expect(sees.map((c) => cardCost(c).seconds)).toEqual([60, 45]);
  });

  it("counts the timed video's own length: without its end it is named instead, and the lesson is 5 minutes shorter", () => {
    const untimed = NOTE.map((b) => ((b as { title?: string }).title === "Simplifying algebraic fractions" ? { ...(b as object), end: undefined } : b));
    const est = estimate(untimed);
    expect(est.untimedVideos).toBe(2);
    expect([est.read.minutes, est.slides.minutes]).toEqual([7, 7]);
    expect(estimate(NOTE).read.minutes - est.read.minutes).toBe(300 / 60);
    expect(deckOf(untimed).stats).toMatchObject({ minutes: 7, untimedVideos: 2 });
  });

  it("names the untimed video beside the minutes and never times it: without it the minutes do not move", () => {
    const est = estimate(without(NOTE, (b) => b.title === "An untimed video"));
    expect(est.untimedVideos).toBe(0);
    expect([est.read.minutes, est.slides.minutes]).toEqual([12, 12]);
    expect(untimedPhrase(1)).toBe("plus a video");
    expect(untimedPhrase(2)).toBe("plus two videos");
    expect(untimedPhrase(0)).toBeNull();
  });

  it("prices each recall card at 30 s, in Slides as in Read: without the two, a minute less in both", () => {
    const est = estimate(without(NOTE, (b) => b.type === "prompt"));
    expect([est.read.minutes, est.slides.minutes]).toEqual([11, 11]);
    expect(deckOf(NOTE).cards.filter((c) => c.kind === "recall").map((c) => cardCost(c).seconds)).toEqual([30, 30]);
  });
});

describe("the one difference allowed between the two ways: what one shows and the other does not", () => {
  it("adds a whole minute to Slides for each figure to act on, and nothing to Read", () => {
    const est = estimate(NOTE, PROMPTS, { figuresToActOn: 1 });
    expect([est.read.minutes, est.slides.minutes]).toEqual([12, 13]);
    const deck = buildDeck(NOTE, PROMPTS, { interactions: [{ after: "see:only-a-factor-divides-out:1", id: "fixture.act-on" }] }, { workedExamples: [WE] });
    expect(deck.cards.some((c) => c.kind === "interaction")).toBe(true);
    expect(deck.stats.minutes).toBe(13);
  });

  it("prices a placed prompt the rule leaves out (not light) in neither way: the lesson does not ask it (the lead's ruling, 29 Sep 2026)", () => {
    const note = [...NOTE, { type: "prompt", promptId: HEAVY.id }];
    const est = estimate(note, [...PROMPTS, HEAVY]);
    est.read.parts.forEach((r, i) => {
      const s = est.slides.parts[i]!;
      expect(r.words, r.heading).toBe(s.words);
      expect(r.seconds, r.heading).toBe(s.seconds);
    });
    // Read asks the two light prompts Slides keeps, and prices those: 11.89 minutes in both ways, 12 printed. (Before the
    // ruling Read showed the heavy one too: 12.39.) The heavy one waits under "Say it from memory" (TopicContent).
    expect([est.read.minutes, est.slides.minutes]).toEqual([12, 12]);
    expect(est.read.minutes).toBe(estimate(NOTE, PROMPTS).read.minutes);
    const deck = deckOf(note, [...PROMPTS, HEAVY]);
    expect(deck.stats.recall).toBe(2);
    expect(deck.stats.minutes).toBe(est.slides.minutes);
  });

  it("prices a figure in the lesson at a 20 s look in both ways, and the hero's own figure not at all", () => {
    const svg = "<svg viewBox='0 0 100 50'><path d='M0 0L10 10'/></svg>";
    const note = [
      { type: "hero", lede: "A lede no paragraph repeats, long enough to be a lede.", can: [], minutes: 5 },
      { type: "figure", alt: "The hero's figure", svg },
      { type: "h", text: "1. Look first", role: "idea" },
      { type: "figure", alt: "A drawing the paragraph reads", svg, caption: "The strip moves." },
      { type: "p", md: words(40) },
      { type: "photo", src: "/img/a.jpg", alt: "A photo", credit: "Someone", licence: "CC BY 4.0" },
      { type: "see", stem: "Do it.", steps: steps(2) },
      gate("g1"),
    ];
    const est = lessonMinutesFor({ blocks: note });
    expect(est.read.parts.map((p) => p.seconds)).toEqual([2 * FIGURE_LOOK_SECONDS + 2 * SEE_STEP_SECONDS + YOUR_TURN_SECONDS]);
    const deck = buildDeck(note);
    const idea = deck.cards.find((c) => c.kind === "idea");
    expect(idea && idea.kind === "idea" && idea.figure !== null).toBe(true);
    expect(partsOfCards(deck.cards).map((p) => [p.words, p.seconds])).toEqual(est.slides.parts.map((p) => [p.words, p.seconds]));
    expect(deck.stats.minutes).toBe(est.read.minutes);
  });
});

describe("rounding: the lesson once, its rows shared out so they add up", () => {
  const part = (words: number, seconds = 0, heading = ""): PartCost => ({ heading, words, seconds });

  it("rounds all the work once, a half up, whichever way it was added", () => {
    expect(estimateMinutes(180, 0)).toBe(1);
    expect(estimateMinutes(360, 3)).toBe(4);
    expect(estimateMinutes(0, 0)).toBe(1);
    expect(estimateMinutes(450)).toBe(3); // 2.5 minutes exactly: a half rounds up
    expect(lessonTotal([part(225), part(225)])).toBe(3);
    expect(lessonTotal([part(75, 60), part(75, 60)])).toBe(lessonTotal([part(150, 120)]));
  });

  it("never gives a lesson fewer minutes than parts, nor a row under a minute", () => {
    const tiny = [part(10), part(10), part(10)];
    expect(lessonTotal(tiny)).toBe(3);
    expect(partShares(tiny)).toEqual([1, 1, 1]);
    expect(lessonTotal([])).toBe(1);
    expect(partShares([])).toEqual([]);
  });

  it("keeps each row to its own work rounded unless the total needs a minute moved, and moves the nearest first", () => {
    // 2.69, 6.95, 1.02, 0.05 and 1.18 minutes: own rounding 3 + 7 + 1 + 1 + 1 = 13 against 12 once; row 1 was rounded
    // up furthest (0.31) and gives its minute back.
    const parts = estimate(NOTE).read.parts;
    expect(partShares(parts)).toEqual([2, 7, 1, 1, 1]);
    // A lesson whose rows round down: 1.4 + 1.4 + 1.4 = 4.2, rows 1 + 1 + 1 = 3 against 4: the first takes the minute.
    const low = [part(252), part(252), part(252)];
    expect(lessonTotal(low)).toBe(4);
    expect(partShares(low)).toEqual([2, 1, 1]);
    for (const set of [parts, low]) expect(partShares(set).reduce((n, s) => n + s, 0)).toBe(lessonTotal(set));
  });

  it("reads a heading as she sees it, the authored number dropped", () => {
    expect(headingWords("3. Above the optimum: denatured")).toBe(4);
    expect(headingWords("You can now")).toBe(3);
  });
});

describe("the teach-first fixture (see-fixture.ts): both ways, one number", () => {
  it("agrees in Read, in Slides and in the module, part by part", () => {
    const wes = [SEE_FIXTURE_WORKED_EXAMPLE as unknown as WorkedExample];
    const prompts = SEE_FIXTURE_PROMPTS as unknown as RetrievalPrompt[];
    const est = lessonMinutesFor({ blocks: SEE_FIXTURE_BLOCKS, workedExamples: wes, prompts });
    const deck = buildDeck(SEE_FIXTURE_BLOCKS, prompts, null, { workedExamples: wes });
    expect(heroDataFor(SEE_FIXTURE_BLOCKS, seeStepsOf(wes)).minutes).toBe(est.read.minutes);
    expect(deck.stats.minutes).toBe(est.slides.minutes);
    expect(est.slides.minutes).toBe(est.read.minutes);
    expect(partsOfCards(deck.cards).map((p) => [p.n, p.words, p.seconds])).toEqual(
      est.slides.parts.flatMap((p, i) => (p.cards ? [[i + 1, p.words, p.seconds]] : [])),
    );
  });
});

/** The build's rule for what ships (pipeline/build-content.mts keep): a log found by the item's ref, else its id. */
function shipped<T extends { id: string; verification?: string }>(items: readonly T[], logs: readonly unknown[]): T[] {
  const SHIPPABLE = new Set(["verified", "published"]);
  const rows = logs as Array<{ id?: string; itemId?: string; status?: string }>;
  return items.filter((it) => {
    const log = it.verification ? rows.find((l) => l.id === it.verification) : rows.find((l) => l.itemId === it.id);
    return SHIPPABLE.has(log?.status ?? "draft");
  });
}

/**
 * Every note the packs hold, as the site ships it (only verified or published worked examples and prompts). The hero,
 * the track and the Slides title card are each computed the way the app computes them, and held to the module's
 * estimate; the two ways are held to each other part by part. A difference between Read and Slides is allowed only
 * where one shows what the other does not: a figure to act on (Slides, a minute) or a placed prompt Slides does not keep
 * as a recall card (Read, 30 s in its part).
 */
describe("every note in packs/: the app's numbers are the module's, and Read and Slides differ only where they show different things", () => {
  const topics = packTopics().map((t) => {
    const logs = t.bundle.verification ?? [];
    const wes = shipped(t.bundle.workedExamples, logs);
    const prompts = shipped(t.bundle.prompts, logs);
    return { ...t, wes, prompts, est: lessonMinutesFor({ blocks: t.blocks, workedExamples: wes, prompts, topicId: t.topicId }) };
  });
  const measurable = (blocks: readonly unknown[]) => blocks.some((b) => ["p", "callout", "h", "gate"].includes((b as { type?: string }).type ?? ""));

  it("reads the packs", () => {
    expect(topics.length).toBeGreaterThan(100);
  });

  it("prints on the hero, the track and the Contents exactly the module's Read minutes", () => {
    for (const t of topics) {
      const steps = seeStepsOf(t.wes);
      const hero = heroDataFor(t.blocks, steps, t.prompts);
      expect(hero.minutes, t.file).toBe(t.est.read.minutes);
      expect(hero.untimedVideos, t.file).toBe(t.est.untimedVideos);
      const sections = lessonSections(t.blocks, hero.lede, steps, t.prompts);
      expect(sections.length, t.file).toBe(t.est.read.parts.length);
      expect(sections.map((s) => s.words), t.file).toEqual(t.est.read.parts.map(partWords));
      // The track and the Contents add the rows up (TopicContent), and the hero says the same.
      if (measurable(t.blocks)) expect(sections.reduce((n, s) => n + s.minutes, 0), t.file).toBe(hero.minutes);
    }
  });

  it("prints on the Start button and the title card exactly the module's Slides minutes, part by part", () => {
    for (const t of topics) {
      const deck = deckFor(t.topicId, t.blocks, t.prompts, t.wes);
      expect(deck.stats.minutes, t.file).toBe(t.est.slides.minutes);
      expect(deckStats(deck.cards).minutes, t.file).toBe(deck.stats.minutes);
      expect(deck.stats.untimedVideos, t.file).toBe(t.est.untimedVideos);
      expect(deck.cards.filter((c) => c.kind === "interaction").length, t.file).toBe(t.est.slides.figuresToActOn);
      const fromCards = partsOfCards(deck.cards).map((p) => [p.n, p.words, p.seconds]);
      const fromModel = t.est.slides.parts.flatMap((p, i) => (p.cards ? [[i + 1, p.words, p.seconds]] : []));
      expect(fromCards, t.file).toEqual(fromModel);
    }
  });

  it("differs between Read and Slides only by the figures to act on: Read asks the prompts Slides keeps (the lead's ruling, 29 Sep 2026)", () => {
    let differ = 0;
    const why: string[] = [];
    for (const t of topics) {
      const { read, slides } = t.est;
      const lesson = lessonBlocks<unknown>(t.blocks, ledeOf(t.blocks));
      // The prompts each way asks inside the lesson are the same (recall.ts shownPrompts), so every part costs the same.
      expect(shownPrompts(lesson, t.prompts).length, t.file).toBe(buildDeck(t.blocks, t.prompts).stats.recall);
      read.parts.forEach((r, i) => {
        const s = slides.parts[i]!;
        expect(r.words, `${t.file} part ${i + 1}`).toBe(s.words);
        expect(r.seconds, `${t.file} part ${i + 1}`).toBe(s.seconds);
      });
      if (read.minutes !== slides.minutes) {
        differ += 1;
        why.push(`${t.file}: Read ${read.minutes}, Slides ${slides.minutes} (${slides.figuresToActOn} to act on)`);
        expect(slides.figuresToActOn > 0, t.file).toBe(true);
      }
    }
    console.log(`[minutes] ${topics.length} notes; Read and Slides differ on ${differ}:${why.length ? `\n  ${why.join("\n  ")}` : " none"}`);
  });

  it("reports what the hero prints where the page is not given the bundle's prompts (every placed prompt priced)", () => {
    const unshipped = topics.filter((t) => heroDataFor(t.blocks, seeStepsOf(t.wes)).minutes !== t.est.read.minutes).map((t) => t.file);
    console.log(`[minutes] notes whose hero would price a placed prompt the bundle does not ship: ${unshipped.length ? unshipped.join(", ") : "none"}`);
    expect(Array.isArray(unshipped)).toBe(true);
  });

  it("reports the lead's four cases and the authored hero.minutes beside them (the site never prints the authored number)", () => {
    const cases = ["further-maths/fm3/addition-rule-probability", "further-maths/fm3/venn-diagrams-probability", "further-maths/fm3/tree-diagrams-probability", "further-maths/fm1/differentiation-integer-powers"];
    const rows = cases.flatMap((file) => {
      const t = topics.find((x) => x.file === file);
      if (!t) return [];
      const authored = (t.blocks.find((b) => (b as { type?: string }).type === "hero") as { minutes?: number } | undefined)?.minutes;
      return [`${file}: Read ${t.est.read.minutes}, Slides ${t.est.slides.minutes} (authored hero.minutes ${authored ?? "none"})`];
    });
    console.log(`[minutes] the four cases:\n  ${rows.join("\n  ")}`);
    expect(rows.length).toBeGreaterThan(0);
  });
});
