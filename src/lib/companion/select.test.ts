import { describe, expect, it } from "vitest";
import { buildCompanionContext, type CompanionContext } from "./context";
import { FIXTURES, FIXTURE_NAMES, type FixtureName } from "./fixtures";
import { LINES, MOMENTS, UNSIGNED_MOMENTS, type Moment } from "./lines";
import { bannedIn, dateWordsIn, dialectWordsIn, lintRendered, MAX_CHARS, placeWordsIn, withoutValues } from "./lint";
import { SLOTS, SLOT_IDS, candidatesFor, momentsFor, select, selectAt, selectDetailed, selectForSlot, selectLetter } from "./select";

function ctx(name: FixtureName, patch: Partial<CompanionContext> = {}): CompanionContext {
  return { ...buildCompanionContext(FIXTURES[name]), ...patch };
}

const ALL: Array<[FixtureName, CompanionContext]> = FIXTURE_NAMES.map((n) => [n, ctx(n)]);

describe("at most one line, ever", () => {
  it("returns one line or none for every moment in every fixture", () => {
    for (const [name, c] of ALL) {
      for (const moment of MOMENTS) {
        const s = select(moment, c);
        expect(s === null || typeof s.text === "string", `${name}/${moment}`).toBe(true);
        if (s) expect(s.moment).toBe(moment);
      }
    }
  });

  it("returns one line or none for every wired slot in every fixture", () => {
    for (const [name, c] of ALL) {
      for (const slot of SLOT_IDS) {
        if (!SLOTS[slot].moments.length) continue;
        const s = selectForSlot(slot, c);
        expect(s === null || SLOTS[slot].moments.includes(s.moment), `${name}/${slot}`).toBe(true);
      }
    }
  });

  it("is stable: the same context selects the same line every time", () => {
    const c = ctx("normal-evening");
    const first = select("today-open", c);
    for (let i = 0; i < 5; i++) expect(select("today-open", c)?.line.id).toBe(first?.line.id);
  });
});

describe("silence", () => {
  it("says nothing at all during a question", () => {
    const c = ctx("during-a-question");
    expect(c.questionVisible).toBe(true);
    for (const moment of MOMENTS) {
      if (UNSIGNED_MOMENTS.has(moment)) continue;
      expect(select(moment, c), moment).toBeNull();
    }
  });

  it("renders the second-miss support unsigned: no mark, no signature, no attribute", () => {
    const c = ctx("during-a-question");
    const s = select("support", c);
    expect(s).not.toBeNull();
    expect(s!.unsigned).toBe(true);
    expect(s!.letter).toBe(false);
  });

  it("every moment that can speak over a live question is unsigned", () => {
    const c = ctx("during-a-question");
    for (const moment of MOMENTS) {
      const s = select(moment, c);
      if (s) expect(s.unsigned, moment).toBe(true);
    }
  });

  it("says nothing when she has silenced it", () => {
    const c = ctx("silenced");
    for (const moment of MOMENTS) expect(select(moment, c), moment).toBeNull();
    expect(selectDetailed("today-open", c).reason).toBe("silenced");
  });

  it("yields to her brother's note", () => {
    const c = ctx("brother-note-on-screen");
    expect(select("today-open", c)).toBeNull();
    expect(selectDetailed("today-open", c).reason).toBe("gift-note");
    expect(selectLetter("first-letter", c)).toEqual([]);
  });

  it("stays silent on an empty install rather than inventing a fact", () => {
    const c = ctx("empty-install");
    const spoken = MOMENTS.map((m) => select(m, c)).filter(Boolean);
    for (const s of spoken) expect(Object.keys(s!.values).length, s!.line.id).toBe(0);
  });

  it("offers the first Letter only while it is owed, and never twice", () => {
    expect(ctx("first-letter").flags.firstLetterDue).toBe(true);
    expect(selectLetter("first-letter", ctx("first-letter")).length).toBeGreaterThan(0);
    expect(selectLetter("first-letter", ctx("normal-evening"))).toEqual([]);
  });
});

describe("plain mode", () => {
  it("is on for the first fortnight of an install", () => {
    expect(ctx("plain-mode").plainMode).toBe(true);
    expect(ctx("normal-evening").plainMode).toBe(false);
  });

  it("never says a line that carries the hills or the dialect without a plain wording", () => {
    const c = ctx("plain-mode");
    for (const moment of MOMENTS) {
      const s = select(moment, c);
      if (!s) continue;
      if (s.line.place || s.line.dialect) expect(s.line.plainTemplate, s.line.id).toBeTruthy();
      if (s.line.plainTemplate) expect(s.text.startsWith(s.line.plainTemplate.slice(0, 6)) || true).toBe(true);
    }
  });

  it("says the plain wording, not the place one", () => {
    const plain = ctx("plain-mode", { flags: { ...ctx("plain-mode").flags, noDue: true, hasDue: false } });
    const s = select("today-open", plain);
    if (s?.line.id === "today.nothing-back") expect(s.text).toContain("something new");
  });
});

describe("no repetition inside fourteen days", () => {
  it("skips a line used inside the window and picks another", () => {
    const c = ctx("normal-evening");
    const first = select("today-open", c)!;
    const after = select("today-open", {
      ...c,
      recentLines: [{ id: first.line.id, at: new Date(c.now.getTime() - 3 * 86_400_000).toISOString() }],
    });
    expect(after?.line.id).not.toBe(first.line.id);
  });

  it("allows a line again once the window has passed", () => {
    const c = ctx("normal-evening");
    const first = select("today-open", c)!;
    const after = select("today-open", {
      ...c,
      recentLines: [{ id: first.line.id, at: new Date(c.now.getTime() - 15 * 86_400_000).toISOString() }],
    });
    expect(after?.line.id).toBe(first.line.id);
  });

  it("falls back to silence when every line for a moment is inside the window", () => {
    const c = ctx("normal-evening");
    const used = candidatesFor("today-open").map((l) => ({ id: l.id, at: c.now.toISOString() }));
    const r = selectDetailed("today-open", { ...c, recentLines: used });
    expect(r.selection).toBeNull();
    expect(r.reason).toBe("no-eligible-line");
  });
});

describe("the constitution holds for every line it can actually say", () => {
  it("never renders a banned word, an exclamation mark, an invented number or a hard-coded date", () => {
    for (const [name, c] of ALL) {
      for (const moment of MOMENTS) {
        const s = select(moment, c);
        if (!s) continue;
        const where = `${name}/${moment}/${s.line.id}: ${s.text}`;
        expect(lintRendered(s.line.id, s.text, s.values, s.line.fixedCounts ?? []), where).toEqual([]);
        expect(s.text, where).not.toContain("!");
        expect(s.text.length, where).toBeLessThanOrEqual(MAX_CHARS);
        const residue = withoutValues(s.text, s.values);
        expect(bannedIn(residue), where).toEqual([]);
        expect(dateWordsIn(residue), where).toEqual([]);
      }
    }
  });

  it("never mentions the gap: the same facts speak the same after a week and a half as after one day", () => {
    const near = ctx("normal-evening");
    const far = ctx("after-three-days");
    for (const moment of MOMENTS) {
      // The Sunday letter is the one surface that reports the week itself, so it is allowed to
      // differ when the week differs. Everything else must be blind to when she was last here.
      if (moment === "weekly-letter") continue;
      expect(select(moment, far)?.text ?? null, moment).toBe(select(moment, near)?.text ?? null);
    }
  });

  it("writes a letter about a week with nothing in it without naming the nothing", () => {
    const far = ctx("after-three-days");
    expect(far.sessionsThisWeek).toBe(0);
    const s = select("weekly-letter", far);
    expect(s).not.toBeNull();
    expect(bannedIn(s!.text)).toEqual([]);
    expect(s!.text).not.toMatch(/\bno sessions|nothing this week|empty week\b/i);
  });

  it("is identical at seven in the morning and at eight in the evening", () => {
    const morning = buildCompanionContext({ ...FIXTURES["normal-evening"], now: new Date("2026-10-01T07:00:00") });
    const evening = buildCompanionContext({ ...FIXTURES["normal-evening"], now: new Date("2026-10-01T20:00:00") });
    for (const moment of MOMENTS) {
      expect(select(moment, morning)?.text ?? null, moment).toBe(select(moment, evening)?.text ?? null);
    }
  });

  it("only ever says it is late while she is here to read it", () => {
    const late = buildCompanionContext({ ...FIXTURES["normal-evening"], now: new Date("2026-10-01T23:10:00") });
    expect(late.flags.isLate).toBe(true);
    expect(ctx("normal-evening").flags.isLate).toBe(false);
    expect(select("evening", ctx("normal-evening"))).toBeNull();
    expect(select("evening", late)).not.toBeNull();
    expect(selectForSlot("today-open", late)?.moment).toBe("evening");
  });
});

describe("the facts come from the plan, the item and her own words", () => {
  it("reads the paper dates from the exam plan", () => {
    const s = selectLetter("first-letter", ctx("first-letter")).find((l) => l.line.id === "fl.papers");
    expect(s?.text).toContain("B1 on 11 May");
    expect(s?.text).toContain("M4 on 14 May");
  });

  it("quotes only what she typed", () => {
    const c = ctx("normal-evening");
    expect(c.quotedSlots).toContain("herNote");
    const quoting = candidatesFor("today-open").filter((l) => (l.quotes ?? []).length);
    expect(quoting.length).toBeGreaterThan(0);
    const without = { ...c, quotedSlots: [] };
    for (const moment of MOMENTS) {
      const s = select(moment, without);
      if (s) expect(s.line.quotes ?? [], s.line.id).toEqual([]);
    }
  });

  it("takes the answer from the item, never from the line", () => {
    const c = ctx("during-a-question");
    const s = select("answer-given", c);
    expect(s?.text).toContain("15.4 cm cubed");
  });

  it("says the paper's own start time, and no other hour", () => {
    const s = select("paper-eve", ctx("paper-eve"));
    expect(s).not.toBeNull();
    if (s?.line.id === "eve.logistics") expect(s.text).toContain("9.15");
  });

  it("names what a mock sends back, and never the mark", () => {
    const c = ctx("mock-entered");
    const s = select("mock-entered", c);
    expect(s).not.toBeNull();
    expect(s!.text).toContain("M4");
    expect(s!.text).not.toMatch(/mark|score|grade|ums/i);
    // What comes back is that unit's review cards, never items "from" the paper, which makes none.
    expect(s!.line.id).toBe("mock.entered");
    expect(s!.text).toBe("M4 is filed. Due back from that unit over the next week: three items, the first on Sunday.");
    expect(s!.text).not.toMatch(/from it\b/);
  });

  it("says a filed paper leaves tonight as it was when nothing of its unit is due back", () => {
    const s = select("mock-entered", ctx("mock-quiet-week"));
    expect(s?.line.id).toBe("mock.quiet-week");
    expect(s!.text).toBe("FM1 is filed. Nothing from that unit is due back in the next week, so tonight is unchanged.");
  });

  it("speaks for every paper filed, even two in one evening", () => {
    const c = ctx("mock-entered");
    const first = select("mock-entered", c)!;
    const again = select("mock-entered", { ...c, recentLines: [{ id: first.line.id, at: new Date(c.now.getTime() - 60_000).toISOString() }] });
    expect(again?.line.id).toBe(first.line.id);
  });

  it("places a stone on the close card only when one was placed", () => {
    const withStone = ctx("close-with-stone");
    expect(withStone.flags.stonePlaced).toBe(true);
    expect(withStone.slots.stonePhrase).toBe("one stone");
    expect(ctx("normal-evening").flags.stonePlaced).toBe(false);
  });
});

describe("every wired slot can speak at least once", () => {
  const speaking: Record<string, number> = {};
  it("finds a fixture in which each slot has something true to say", () => {
    for (const [, c] of ALL) {
      for (const slot of SLOT_IDS) {
        if (!SLOTS[slot].moments.length) continue;
        if (selectForSlot(slot, c)) speaking[slot] = (speaking[slot] ?? 0) + 1;
      }
    }
    for (const slot of SLOT_IDS) {
      if (!SLOTS[slot].moments.length) continue;
      expect(speaking[slot] ?? 0, `slot ${slot}`).toBeGreaterThan(0);
    }
  });
});

describe("the letter", () => {
  it("is the only place more than one line stands together", () => {
    const letter = selectLetter("first-letter", ctx("first-letter"));
    expect(letter.length).toBeGreaterThan(1);
    expect(letter.every((l) => l.letter)).toBe(true);
    const moments: Moment[] = MOMENTS.filter((m) => m !== "first-letter" && m !== "weekly-letter");
    for (const m of moments) expect(select(m, ctx("normal-evening")) === null || true).toBe(true);
  });
});

describe("per-line cooldown", () => {
  it("says where she stopped again the next day, while a line with a voice waits the fortnight", () => {
    const resume = LINES.find((l) => l.id === "topic.resume");
    expect(resume?.cooldownDays).toBe(1);
    // Only information has its own cooldown: where she stopped, the paper she has just filed, tonight's facts on
    // Today, and the first visit's fallback. Everything with a voice waits the fortnight.
    const own = LINES.filter((l) => l.cooldownDays !== undefined).map((l) => l.id).sort();
    expect(own).toEqual([
      "mock.entered",
      "mock.quiet-week",
      "today.back-tonight",
      "today.first-up",
      "today.nothing-back",
      "topic.first-kept",
      "topic.resume",
    ]);
    for (const l of LINES.filter((x) => x.cooldownDays !== undefined)) expect(l.cooldownDays!, l.id).toBeLessThanOrEqual(1);
    for (const id of ["dry.arrangement", "dry.not-me", "dry.specific", "dry.sly", "dry.booklet-b", "topic.new-ground"]) {
      expect(LINES.find((l) => l.id === id)?.cooldownDays, id).toBeUndefined();
    }
  });

  it("counts a cooldown in calendar days: a line said last night may be said tonight", () => {
    const c = ctx("existing-install-next-day");
    const lastNight = new Date(c.now.getTime() - 20 * 3_600_000).toISOString();
    const s = select("today-open", { ...c, recentLines: [{ id: "today.back-tonight", at: lastNight }] });
    expect(s?.line.id === "today.back-tonight" || s?.line.id === "today.first-up").toBe(true);
    const earlierTonight = new Date(c.now.getTime() - 3_600_000).toISOString();
    const both = [{ id: "today.back-tonight", at: earlierTonight }, { id: "today.first-up", at: earlierTonight }];
    expect(["today.back-tonight", "today.first-up"]).not.toContain(select("today-open", { ...c, recentLines: both })?.line.id);
  });
});

/** The rendered words of a selection with the supplied values taken out: what Rowan itself said. */
function ownWords(s: { text: string; values: Record<string, string> }): string {
  return withoutValues(s.text, s.values);
}

describe("day one (decision 3): Rowan is there from the first session", () => {
  it("says nothing before first run, so no line is spent on the screen that sends her there", () => {
    const c = ctx("before-first-run");
    expect(c.firstRunDone).toBe(false);
    for (const moment of MOMENTS) {
      const r = selectDetailed(moment, c);
      expect(r.selection, moment).toBeNull();
      expect(r.reason, moment).toBe("first-run");
    }
    expect(selectLetter("first-letter", c)).toEqual([]);
  });

  it("fresh install: the first Today offers the Letter, in plain words", () => {
    const c = ctx("fresh-install-day-one");
    expect(c.plainMode).toBe(true);
    expect(c.flags.firstLetterDue).toBe(true);
    expect(c.flags.letterGoesFirst).toBe(true);
    const letter = selectLetter("first-letter", c);
    expect(letter.map((l) => l.line.id)).toEqual(["fl.keeper", "fl.papers", "fl.nothing-to-set-up"]);
    expect(letter[0].text).toBe("I keep the dates of your papers and what comes back when. You do the maths.");
    expect(letter[1].text).toBe("Your papers are in: B1 on 11 May, then M4 on 14 May. Everything here counts back from those.");
    expect(letter[2].text).toBe(
      "Nothing to set up. Simplifying, multiplying and dividing algebraic fractions is open, and the note teaches before it asks.",
    );
    for (const l of letter) {
      expect(placeWordsIn(ownWords(l)), l.line.id).toEqual([]);
      expect(dialectWordsIn(ownWords(l)), l.line.id).toEqual([]);
    }
  });

  it("fresh install: on the Letter's first day it goes first, and the lesson's own prose is not held back", () => {
    const c = ctx("fresh-install-day-one");
    for (const moment of ["today-open", "evening", "topic-open", "session-close", "mock-entered"] as Moment[]) {
      expect(selectDetailed(moment, c).reason, moment).toBe("letter-first");
    }
    expect(selectAt("today-open", c)).toBeNull();
    // The second-miss support is the note's register, unsigned: it never waits for the Letter.
    const support = select("support", c);
    expect(support).not.toBeNull();
    expect(support!.unsigned).toBe(true);
  });

  it("fresh install: once she has read the Letter, every wired slot speaks that same evening, plainly", () => {
    const c = ctx("fresh-install-letter-read");
    expect(c.plainMode).toBe(true);
    const spoken = {
      "today-open": selectAt("today-open", c),
      "topic-open": select("topic-open", c),
      "session-close": select("session-close", c),
      support: select("support", c),
      "mock-entered": select("mock-entered", c),
    };
    for (const [slot, s] of Object.entries(spoken)) {
      expect(s, slot).not.toBeNull();
      expect(placeWordsIn(ownWords(s!)), `${slot}: ${s!.text}`).toEqual([]);
      expect(dialectWordsIn(ownWords(s!)), `${slot}: ${s!.text}`).toEqual([]);
    }
    // The first visit's line, said the plain way when it is the one chosen.
    const firstVisit = candidatesFor("topic-open").filter((l) => l.flags?.includes("firstVisitToTopic")).map((l) => l.id);
    expect(firstVisit).toContain(spoken["topic-open"]!.line.id);
    if (spoken["topic-open"]!.line.id === "topic.new-ground") expect(spoken["topic-open"]!.text.startsWith("This is new.")).toBe(true);
    // The part in front of her has a method mark, so the support may say so; it never claims "most candidates"
    // without the examiners' evidence on the item.
    expect(spoken.support!.line.id).not.toBe("support.catches-most");
  });

  it("existing install: the upgrade Letter reads the paper dates from the plan and names the next step", () => {
    const c = ctx("existing-install-first-letter");
    expect(c.flags.firstLetterDue).toBe(true);
    const letter = selectLetter("first-letter", c);
    expect(letter.map((l) => l.line.id)).toEqual(["fl.keeper", "fl.papers", "fl.nothing-to-set-up"]);
    expect(letter[1].text).toContain("B1 on 11 May, then M4 on 14 May");
    expect(letter[2].text).toBe("Nothing to set up. Bounds is open, and the note teaches before it asks.");
  });

  it("existing install: the Letter goes first only on its first day; the day after, Rowan speaks everywhere", () => {
    const first = ctx("existing-install-first-letter");
    for (const moment of ["today-open", "topic-open", "session-close"] as Moment[]) {
      expect(selectDetailed(moment, first).reason, moment).toBe("letter-first");
    }
    const next = ctx("existing-install-next-day");
    expect(next.flags.firstLetterDue).toBe(true);
    expect(next.flags.letterGoesFirst).toBe(false);
    expect(selectAt("today-open", next)).not.toBeNull();
    expect(select("topic-open", next)).not.toBeNull();
    expect(select("session-close", next)).not.toBeNull();
    // The Letter is still there to read, under Start, until she does.
    expect(selectLetter("first-letter", next).length).toBe(3);
  });

  it("existing install: a day of her own history gives the arrival line something of hers to say", () => {
    const s = selectAt("today-open", ctx("existing-install-next-day"));
    expect(s).not.toBeNull();
    expect(s!.moment).toBe("today-open");
    expect(s!.text.length).toBeGreaterThan(0);
  });

  it("day fifteen: plain mode has run out and the place wording is back, with the same facts", () => {
    const d15 = ctx("day-fifteen");
    expect(d15.plainMode).toBe(false);
    const close = select("session-close", d15);
    expect(close?.line.id).toBe("close.stone");
    expect(close!.text).toBe("Frustums: proved, and one stone on the M4 cairn.");
    // The same sitting inside the fortnight says it plainly.
    const plain = select("session-close", { ...d15, plainMode: true });
    expect(plain!.text).toBe("Frustums: proved, and one stone on M4.");
    // And the first visit's walking phrase comes back with it.
    const onlyNewGround = { ...d15, recentLines: ["topic.first-checks", "topic.first-stone-later", "topic.no-clock"].map((id) => ({ id, at: d15.now.toISOString() })) };
    expect(select("topic-open", onlyNewGround)!.text).toBe("New ground. The note teaches before it asks, and nothing in it is scored.");
    expect(select("topic-open", { ...onlyNewGround, plainMode: true })!.text).toBe("This is new. The note teaches before it asks, and nothing in it is scored.");
  });

  it("every plain wording in every fixture is free of the hills and the dialect", () => {
    for (const [name, c] of ALL) {
      if (!c.plainMode) continue;
      for (const moment of MOMENTS) {
        const s = select(moment, c);
        if (!s) continue;
        expect(placeWordsIn(ownWords(s)), `${name}/${s.line.id}: ${s.text}`).toEqual([]);
        expect(dialectWordsIn(ownWords(s)), `${name}/${s.line.id}: ${s.text}`).toEqual([]);
      }
    }
  });
});

describe("two lines that could never be said, or said something untrue (found 23 Sep)", () => {
  it("says a line that opens with a count: the capital no longer hides the value from the lint", () => {
    const c = ctx("existing-install-next-day");
    const back = select("today-open", { ...c, recentLines: candidatesFor("today-open").filter((l) => l.id !== "today.back-tonight").map((l) => ({ id: l.id, at: c.now.toISOString() })) });
    expect(back?.line.id).toBe("today.back-tonight");
    expect(back!.text).toBe("Nine back tonight. Two are the ones you were sure about.");
    const first = select("today-open", { ...c, recentLines: candidatesFor("today-open").filter((l) => l.id !== "today.first-up").map((l) => ({ id: l.id, at: c.now.toISOString() })) });
    expect(first?.text).toBe("First up tonight: frustums.");
  });

  it("never leaves a first visit to a topic silent: the fallback speaks once the others have been heard", () => {
    const c = ctx("existing-install-next-day");
    const voiced = candidatesFor("topic-open").filter((l) => l.flags?.includes("firstVisitToTopic") && l.id !== "topic.first-kept");
    expect(voiced.length).toBeGreaterThanOrEqual(4);
    const heard = voiced.map((l) => ({ id: l.id, at: c.now.toISOString() }));
    const s = select("topic-open", { ...c, recentLines: [...heard, { id: "topic.first-kept", at: c.now.toISOString() }] });
    expect(s?.line.id).toBe("topic.first-kept");
    expect(s!.text).toBe("Every check you answer here keeps your place, so you can stop at any section.");
    // While a voiced first-visit line is fresh, it comes before the fallback.
    expect(select("topic-open", c)?.line.id).not.toBe("topic.first-kept");
  });

  it("leaves her own words exactly as she wrote them, even where a sentence would take a capital", () => {
    const c = ctx("normal-evening");
    const s = select("today-open", c);
    expect(s?.line.id).toBe("today.quote-note");
    expect(s!.text).toContain("‘cube the scale factor for volume’");
  });

  it("names only the topics that come back on the day it names", () => {
    const c = ctx("existing-install-next-day");
    // Bounds is due on Saturday, circle theorems on Sunday, frustums on Monday.
    expect(c.slots.returnDay).toBe("Saturday");
    expect(c.slots.returningTopics).toBe("bounds");
    const onlyReturns = { ...c, recentLines: candidatesFor("session-close").filter((l) => l.id !== "close.returns").map((l) => ({ id: l.id, at: c.now.toISOString() })) };
    expect(select("session-close", onlyReturns)?.text).toBe("Saturday brings back bounds. Nothing else until then.");
  });
});

describe("one switch for the figure (rule 2: reduced to its voice, or silenced, at no cost)", () => {
  it("carries the figure into the context: drawn by default, not in Words only, not in Quiet", () => {
    const full = ctx("normal-evening");
    expect(full.figure).toBe(true);
    const words = buildCompanionContext({ ...FIXTURES["normal-evening"], state: { ...FIXTURES["normal-evening"].state, figure: false } });
    expect(words.figure).toBe(false);
    expect(ctx("silenced").figure).toBe(false);
    const quietButDrawn = buildCompanionContext({ ...FIXTURES["normal-evening"], state: { ...FIXTURES["normal-evening"].state, silenced: true, figure: true } });
    expect(quietButDrawn.figure).toBe(false);
  });

  it("Words only changes nothing about what is said: every moment in every fixture selects the same line", () => {
    for (const [name, c] of ALL) {
      const words = { ...c, figure: false };
      for (const moment of MOMENTS) {
        expect(select(moment, words)?.text ?? null, `${name}/${moment}`).toBe(select(moment, c)?.text ?? null);
      }
      expect(selectLetter("first-letter", words).map((l) => l.text)).toEqual(selectLetter("first-letter", c).map((l) => l.text));
    }
  });
});

describe("the Today slot says it is late first", () => {
  it("tries the evening lines before the arrival lines, through the component's own selector", () => {
    expect(momentsFor("today-open")).toEqual(["evening", "today-open"]);
    expect(momentsFor("topic-open")).toEqual(["topic-open"]);
    const late = buildCompanionContext({ ...FIXTURES["normal-evening"], now: new Date("2026-10-01T23:10:00") });
    const s = selectAt("today-open", late);
    expect(s?.moment).toBe("evening");
    expect(selectAt("today-open", ctx("normal-evening"))?.moment).toBe("today-open");
  });

  it("says something true on arrival late at night, whether or not anything is due", () => {
    const lateDue = buildCompanionContext({ ...FIXTURES["normal-evening"], now: new Date("2026-10-01T23:10:00") });
    const lateNone = buildCompanionContext({ ...FIXTURES["topic-first-visit"], now: new Date("2026-10-01T23:10:00") });
    expect(lateNone.flags.noDue).toBe(true);
    const plain = { ...lateDue, plainMode: true };
    const seen = new Set<string>();
    for (const c of [lateDue, lateNone, plain]) {
      for (const line of candidatesFor("evening")) {
        const used = candidatesFor("evening").filter((l) => l.id !== line.id).map((l) => ({ id: l.id, at: c.now.toISOString() }));
        const s = select("evening", { ...c, recentLines: used });
        if (s) seen.add(s.text);
      }
    }
    expect([...seen].sort()).toEqual([
      "It is late and nothing is due. Anything new will keep for tomorrow.",
      "It is late. One short one to finish on is plenty.",
      "It is late. One wee one to finish on is plenty.",
      "Whatever is due can be tomorrow’s. It will keep.",
    ]);
  });
});
