/**
 * The companion's components, rendered to markup exactly as a page would render them, from the acceptance
 * fixtures. No DOM and no database: effects do not run in a static render, so nothing is recorded.
 *
 * What is proved here (decision 3 and decision 8, 23 September 2026; the hare at the canvas's sizes):
 * - a signed line carries the hare where the canvas puts it: on Today beside the arrival line (140 px, 200 px once
 *   the line has room), in a topic's hero beside the topic-open line (72 px, 80 px from the tablet breakpoint), in
 *   the state the moment calls for, with the attribute of the moment that spoke and the name for a screen reader;
 *   the unsigned support prose carries none of them;
 * - the close card's figure is the scene, Rowan on the hill by the cairn, drawn exactly when the close line speaks;
 * - nothing signed and no figure renders during a question;
 * - the first Letter carries the hare beside the note (100 px, 110 on the desktop), says no cairn in plain mode, and
 *   seals itself from the day after it was first offered, waiting in one line under Start with Rowan's 24 px mark.
 */
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { buildCompanionContext, selectAt, type CompanionContext } from "@/lib/companion";
import { FIXTURES, type FixtureName } from "@/lib/companion/fixtures";
import { CompanionFigure, FIGURE_SLOTS } from "./CompanionFigure";
import { CompanionLetter } from "./CompanionLetter";
import { CompanionLine } from "./CompanionLine";
import { CompanionScene } from "./CompanionScene";
import { PLACED_STONE } from "./CairnArt";

const ctx = (name: FixtureName, patch: Partial<CompanionContext> = {}): CompanionContext => ({ ...buildCompanionContext(FIXTURES[name]), ...patch });
const line = (moment: Parameters<typeof CompanionLine>[0]["moment"], context: CompanionContext) =>
  renderToStaticMarkup(createElement(CompanionLine, { moment, context, onShown: () => {} }));
const letter = (context: CompanionContext) => renderToStaticMarkup(createElement(CompanionLetter, { moment: "first-letter", context }));
const scene = (context: CompanionContext, variant: "wide" | "tall" = "wide") => renderToStaticMarkup(createElement(CompanionScene, { context, variant }));

/** The hare's own viewBox, and the heather stone held up in its paws (rowan.mjs, the stone-placed pose). */
const HARE = 'viewBox="0 0 160 160"';
const HELD_STONE = "M70 92 C72 84 84 82 92 86";
/** The dry face's brow (rowan.mjs: drawn only for the dry expression). */
const BROW = 'd="M73 40 q7 -3.5 14 0"';

describe("a signed line carries the hare where the canvas puts it", () => {
  it("Today's arrival line: the posed hare at 140 px, 200 px once the line has room, with the attribute and the name", () => {
    const html = line("today-open", ctx("existing-install-next-day"));
    expect(html).toContain('data-companion="today-open"');
    expect(html).toContain('data-companion-figure="arrival"');
    expect(html).toContain('data-figure-state="arrival"');
    expect(html).toContain(`size-[${FIGURE_SLOTS.arrival.phone}px]`);
    expect(html).toContain(`@min-[32rem]:size-[${FIGURE_SLOTS.arrival.desktop}px]`);
    // The query that grows it is the line's own block, so the words are never squeezed to make room.
    expect(html).toMatch(/data-companion="today-open" class="@container/);
    expect(html).toContain(HARE);
    expect(html).toContain('<span class="sr-only">Rowan: </span>');
    expect(html).not.toContain("aria-live");
  });

  it("late at night the same slot speaks the evening line, and the hare sits low under the moon", () => {
    const late = buildCompanionContext({ ...FIXTURES["normal-evening"], now: new Date("2026-10-01T23:10:00") });
    const html = line("today-open", late);
    expect(html).toContain('data-companion="evening"');
    expect(html).toContain('data-figure-state="evening"');
    expect(html).toContain('d="M130 15 a11 11 0 1 0 9 17'); // the moon, drawn in the hare's own corner
  });

  it("the topic hero's line: the hare listening beside it, 72 px, 80 px from the tablet breakpoint", () => {
    const html = line("topic-open", ctx("existing-install-next-day"));
    expect(html).toContain('data-companion="topic-open"');
    expect(html).toContain('data-companion-figure="topic"');
    expect(html).toContain('data-figure-state="listening"');
    expect(html).toContain(`size-[${FIGURE_SLOTS.topic.phone}px]`);
    expect(html).toContain(`md:size-[${FIGURE_SLOTS.topic.desktop}px]`);
    // The figure comes first and the words beside it, as the Read hero draws them.
    expect(html.indexOf("data-companion-figure")).toBeLessThan(html.indexOf("sr-only"));
  });

  it("an ordinary line gets the attentive face: no brow", () => {
    const c = ctx("existing-install-next-day");
    expect(selectAt("today-open", c)?.line.id).toBe("today.back-tonight");
    expect(line("today-open", c)).not.toContain(BROW);
  });

  it("the close card's line stands alone: its figure is the scene above the card's title", () => {
    const html = line("session-close", ctx("close-with-stone"));
    expect(html).toContain('data-companion="session-close"');
    expect(html).not.toContain("data-companion-figure");
    expect(html).not.toContain("<svg");
  });
});

describe("the close scene: Rowan on the hill by the cairn", () => {
  it("draws when the close line speaks, as the close slot, holding the heather stone up when a stone was placed", () => {
    const c = ctx("close-with-stone");
    expect(selectAt("session-close", c)).not.toBeNull();
    const html = scene(c);
    expect(html).toMatch(/^<div aria-hidden="true" data-companion-figure="close" data-figure-state="stone-placed"/);
    expect(html).toContain('viewBox="0 0 342 200"');
    expect(html).toContain('preserveAspectRatio="xMidYMax slice"');
    expect(html).toContain('<svg x="16" y="20" width="156" height="156" viewBox="0 0 160 160">');
    expect(html).toContain(HELD_STONE);
    // One heather stone in the picture: the hare holds it, so the cairn is not given it as well.
    expect(html).not.toContain(PLACED_STONE);
  });

  it("fills a full-height panel on the desktop, the hare at 250 units on the tall hill", () => {
    const html = scene(ctx("close-with-stone"), "tall");
    expect(html).toContain('viewBox="0 0 400 640"');
    expect(html).toContain('<svg x="-16" y="268" width="250" height="250" viewBox="0 0 160 160">');
  });

  it("waves when no stone was placed, and a dry line gets the dry face: the lower lids and the brow", () => {
    const c = ctx("normal-evening");
    expect(selectAt("session-close", c)?.line.id).toBe("dry.not-me");
    const html = scene(c);
    expect(html).toContain('data-figure-state="arrival"');
    expect(html).toContain('transform="rotate(-38 104 104)"'); // the near arm raised: the wave
    expect(html).toContain(BROW);
    expect(html).not.toContain(HELD_STONE);
  });

  it("is silent when the line is: silenced, before first run, while a question is up", () => {
    expect(scene(ctx("silenced"))).toBe("");
    expect(scene(ctx("before-first-run"))).toBe("");
    expect(scene(ctx("close-with-stone", { questionVisible: true }))).toBe("");
    expect(scene(ctx("close-with-stone", { silenced: true }))).toBe("");
  });
});

describe("nothing signed inside the work", () => {
  it("renders the second-miss support as the note's own prose: no attribute, no figure, no name", () => {
    const html = line("support", ctx("during-a-question"));
    expect(html.length).toBeGreaterThan(0);
    expect(html).not.toContain("data-companion");
    expect(html).not.toContain("sr-only");
    expect(html).not.toContain("<svg");
  });

  it("renders nothing signed, and no figure, while a question is up", () => {
    const c = ctx("during-a-question");
    for (const moment of ["today-open", "topic-open", "session-close", "mock-entered"] as const) expect(line(moment, c), moment).toBe("");
    for (const slot of ["arrival", "letter", "topic", "close"] as const) {
      expect(renderToStaticMarkup(createElement(CompanionFigure, { slot, state: "arrival", context: c })), slot).toBe("");
    }
    expect(scene(c)).toBe("");
    expect(letter(ctx("first-letter", { questionVisible: true }))).toBe("");
  });
});

describe("Words only and Quiet: one switch, obeyed by every surface", () => {
  const words = (name: FixtureName) => ctx(name, { figure: false });

  it("Words only: the arrival line speaks with its attribute and name, and nothing is drawn or given room", () => {
    const html = line("today-open", words("existing-install-next-day"));
    expect(html).toContain('data-companion="today-open"');
    expect(html).toContain('<span class="sr-only">Rowan: </span>');
    expect(html).toContain(selectAt("today-open", ctx("existing-install-next-day"))!.text);
    expect(html).not.toContain("data-companion-figure");
    expect(html).not.toContain("<svg");
    // The words take the room the hare had: no 140 px column beside an empty box.
    expect(html).not.toContain("140px");
    expect(html).not.toContain("@container");
  });

  it("Words only: the topic hero's line stands alone, and the close scene is not drawn", () => {
    const hero = line("topic-open", words("existing-install-next-day"));
    expect(hero).toContain('data-companion="topic-open"');
    expect(hero).not.toContain("data-companion-figure");
    expect(hero).not.toContain("<svg");
    expect(scene(words("close-with-stone"))).toBe("");
    expect(scene(words("close-with-stone"), "tall")).toBe("");
    // The close line itself is unchanged.
    expect(line("session-close", words("close-with-stone"))).toContain('data-companion="session-close"');
  });

  it("Words only: the Letter keeps its lines, its eyebrow and its signature, with no hare and no mark", () => {
    const open = letter(words("fresh-install-day-one"));
    expect(open).toContain('data-companion="first-letter"');
    expect(open).toContain("A note to start with");
    expect(open).toContain("I keep the dates of your papers and what comes back when. You do the maths.");
    expect(open).toContain('data-companion-control="rename"');
    expect(open).not.toContain("data-companion-figure");
    expect(open).not.toContain("<svg");
    expect(open).not.toContain("100px");
    const sealed = letter(words("existing-install-next-day"));
    expect(sealed).toContain('aria-expanded="false"');
    expect(sealed).toContain("A short letter from Rowan. Open it when you have a minute.");
    expect(sealed).not.toContain("<svg");
  });

  it("the figure slot itself draws nothing when the context says Words only", () => {
    for (const slot of ["arrival", "letter", "topic", "close"] as const) {
      expect(renderToStaticMarkup(createElement(CompanionFigure, { slot, state: "arrival", context: words("normal-evening") })), slot).toBe("");
      expect(renderToStaticMarkup(createElement(CompanionFigure, { slot, state: "letter", context: words("normal-evening"), mark: true })), `${slot} mark`).toBe("");
    }
  });

  it("Quiet: nothing said and nothing drawn, on every surface", () => {
    const quiet = ctx("silenced");
    expect(quiet.figure).toBe(false);
    for (const moment of ["today-open", "topic-open", "session-close", "mock-entered", "support"] as const) expect(line(moment, quiet), moment).toBe("");
    expect(scene(quiet)).toBe("");
    expect(letter(ctx("first-letter", { silenced: true, figure: false }))).toBe("");
  });
});

describe("the first Letter", () => {
  it("on its first day: open, the hare holding it beside the note, plain eyebrow, three lines and the rename", () => {
    const html = letter(ctx("fresh-install-day-one"));
    expect(html).toContain('data-companion="first-letter"');
    expect(html).toContain('data-companion-figure="letter"');
    expect(html).toContain('data-figure-state="letter"');
    expect(html).toContain(`size-[${FIGURE_SLOTS.letter.phone}px]`);
    expect(html).toContain(`lg:size-[${FIGURE_SLOTS.letter.desktop}px]`);
    expect(html).toContain(HARE);
    expect(html).toContain("A note to start with");
    expect(html).not.toContain("cairn");
    expect(html).toContain("I keep the dates of your papers and what comes back when. You do the maths.");
    expect(html).toContain('data-companion-control="rename"');
    expect(html).toContain(">Close</button>");
    // One hare on the Letter: the signature row is the name alone.
    expect(html.match(/data-companion-figure=/g)).toHaveLength(1);
  });

  it("from the next day, unread: sealed in one line under Start, with Rowan's 24 px mark, opened by a tap", () => {
    const html = letter(ctx("existing-install-next-day"));
    expect(html).toContain('aria-expanded="false"');
    expect(html).toContain("A short letter from Rowan. Open it when you have a minute.");
    expect(html).not.toContain("I keep the dates of your papers");
    expect(html).toContain('data-companion-figure="letter"');
    expect(html).toContain('viewBox="0 0 24 24"');
    expect(html).not.toContain(HARE);
  });

  it("is gone once read, and never shown before first run", () => {
    expect(letter(ctx("fresh-install-letter-read"))).toBe("");
    expect(letter(ctx("before-first-run"))).toBe("");
  });

  it("after the fortnight, says where it was left, in its own voice", () => {
    const html = letter(ctx("existing-install-first-letter", { plainMode: false }));
    expect(html).toContain("Left at the cairn");
    expect(html).toContain("I keep the path: the dates of your papers, and what comes back when. You do the maths.");
  });
});
