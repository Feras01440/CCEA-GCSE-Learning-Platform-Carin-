/**
 * Everything Rowan is allowed to know at this moment, as one plain object.
 *
 * Pure: no Dexie, no React, no clock of its own. The caller passes the rows and the time, which is what
 * makes the identity test possible (the same facts at 7 am and at 11 pm produce the same context except
 * for `isLate`, and the same after one day as after thirty). src/lib/companion/live.ts does the reading.
 *
 * Three rules are enforced here rather than trusted to the templates:
 * - a slot that quotes her is filled only from a companionNote with `source: "her"`, and is listed in
 *   `quotedSlots` so the selector can refuse a line that quotes without one;
 * - nothing derived from absence is computed at all. There is no "days since", no missed slot, no
 *   session count that can fall. `isLate` exists only because she is here to read it;
 * - the first Letter goes first for one day only. `letterGoesFirst` is true while the Letter is owed and
 *   it is the day it was first put in front of her (or it has not been yet); from the next day Rowan
 *   speaks everywhere whether or not she has opened it (the lead's ruling of 23 September 2026).
 */

import type { Attempt, Mock, ReviewCard, StudySession, TopicMastery } from "@/lib/db/db";
import { nextPaper as nextPaperOf, upcomingPapers, type ExamPlan, type UpcomingPaper } from "@/lib/plan/exam-plan";
import type { CompanionNote, CompanionState } from "./memory";
import { isPlainMode, rowanName, todayISOFrom, type ShownLine } from "./memory";
import type { Flag, SlotName } from "./lines";

/** The topic on screen, as the page already knows it. */
export interface TopicContextInput {
  slug: string;
  unit: string;
  subject: "maths" | "further-maths" | "science";
  title: string;
  /** No attempt on this topic yet. */
  firstVisit?: boolean;
  /** The section she stopped at, if the flow row says so. 1-based. */
  sectionNumber?: number | null;
  /** She came in on the reviser path (Sheet first). */
  reviserPath?: boolean;
  /** The examiners flagged this topic: the dry line about slyness is earned. */
  examinerFlagged?: boolean;
  /**
   * The title as the page already says it short (the lesson spine's form), if the caller has one.
   * Without it the catalogue title is shortened here; see spokenTitle.
   */
  shortTitle?: string;
}

/** The single item in front of her, and what the packs know about it. */
export interface ItemContextInput {
  id: string;
  /** The answer, for the moment she asks for it. Never invented here. */
  answerText?: string | null;
  /** The step that carries the method mark, in the item's own words. */
  methodLine?: string | null;
  /** Why this section is hard, in the item's own words. */
  whyHard?: string | null;
  /** What the recap asks her to explain, as a clause: "the small cone is subtracted". */
  recapAsk?: string | null;
  /** The answer carries a unit, so "check the units" is a real offer. */
  unitsInAnswer?: boolean;
  /**
   * The part's scheme carries a method mark (an M, MA or MW line), so "the method mark is in the working"
   * is true of it. Left out, no line says anything about a method mark.
   */
  methodMark?: boolean;
  /** The examiner evidence for this item, with its series. */
  evidence?: { series: string; finding: string } | null;
}

/** A school mock she has just filed. The mark is never read: only its unit, and what of that unit returns. */
export interface MockContextInput extends Pick<Mock, "unit" | "subject" | "at"> {
  /**
   * The unit's topic slugs, from the taxonomy (live.ts fills them in). Without them nothing can be said about
   * what of that unit comes back, and the lines that need it stay silent rather than guess.
   */
  topicSlugs?: string[];
}

export interface CompanionInput {
  now: Date;
  plan: ExamPlan;
  state: CompanionState;
  mastery?: TopicMastery[];
  /** Recent attempts. The caller decides how many; nothing here counts misses. */
  attempts?: Attempt[];
  /**
   * Cards due now: tonight's queue, in the order the review inbox will put them (live.ts sorts them with the
   * inbox's own pickQueue), so "starting with" names the item she will actually meet first.
   */
  dueCards?: ReviewCard[];
  /** Cards due later, for "what returns when". */
  futureCards?: ReviewCard[];
  sessions?: StudySession[];
  notes?: CompanionNote[];
  topic?: TopicContextInput | null;
  item?: ItemContextInput | null;
  /** A school mock just entered. The mark is never read: only what returns, and when. */
  mock?: MockContextInput | null;
  /** An answer field or grading buttons are on screen. Nothing signed may render. */
  questionVisible?: boolean;
  /** Her brother's note is on this screen. Rowan yields to it, always. */
  giftNoteOnScreen?: boolean;
  /** She tapped the paper-eve chip about nerves. The reappraisal line is gated on this. */
  askedAboutNerves?: boolean;
  /**
   * First run is behind her. Until it is, nothing speaks at all: Today renders for a moment before it sends
   * a new device to /welcome/, and a line said there would be spent on a screen she never reads. Defaults
   * to true for the pure tests; live.ts reads the real setting.
   */
  firstRunDone?: boolean;
  /** Epoch ms this sitting began, for stones placed since. */
  sessionStartedAt?: number;
  /** topicSlug to title, so "what returns" can be said in words. */
  topicTitles?: Record<string, string>;
  /** The step Today would send her to next. */
  nextTopic?: { slug: string; title: string } | null;
  /** A paper sat today, if the caller knows it. Otherwise derived from the timetable. */
  satPaperUnit?: string | null;
  /** Minutes on the traps sheet the evening before a paper. */
  trapsMinutes?: number;
}

export interface CompanionContext {
  now: Date;
  today: string;
  rowanName: string;
  learnerName: string | null;
  plainMode: boolean;
  silenced: boolean;
  /**
   * The drawn figure may be shown: her choice (Full), and not Quiet. False is Words only, or Quiet. This is the one
   * thing every figure slot reads (CompanionFigure, CompanionScene, the line and Letter layouts, the Map's mark), so
   * the switch is implemented here once and obeyed everywhere.
   */
  figure: boolean;
  /** First run is done. Nothing speaks before it. */
  firstRunDone: boolean;
  letterSeen: boolean;
  /** The day the first Letter was first put in front of her, if it has been. */
  letterOfferedOn: string | null;
  questionVisible: boolean;
  giftNoteOnScreen: boolean;
  /** The papers, soonest first, and days to each by `${subject}:${unit}`. */
  papers: UpcomingPaper[];
  nextPaper: UpcomingPaper | null;
  daysToPaperByUnit: Record<string, number>;
  due: { count: number; minutes: number | null; confidentWrong: number; subjects: string[] };
  /** The next three items that return, each with a date and the reason it returns. */
  returns: Array<{ id: string; topicSlug: string; title: string; dueAt: Date; reason: string }>;
  lastSession: { at: Date; items: number; minutes: number } | null;
  sessionsThisWeek: number;
  notes: CompanionNote[];
  herNote: { text: string; topicSlug: string | null } | null;
  taught: { text: string; topicSlug: string | null } | null;
  intention: { day: string } | null;
  stoppedAt: { topicSlug: string; sectionNumber: number } | null;
  topic: TopicContextInput | null;
  item: ItemContextInput | null;
  stones: { total: number; placedThisSession: number };
  flags: Record<Flag, boolean>;
  recentLines: ShownLine[];
  /** Ready-to-render values. A line whose slots are not all here stays silent. */
  slots: Partial<Record<SlotName, string>>;
  /** Slots whose text came from a note she wrote herself. */
  quotedSlots: SlotName[];
}

const DAY = 86_400_000;
const WEEKDAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const ONES = [
  "zero", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten",
  "eleven", "twelve", "thirteen", "fourteen", "fifteen", "sixteen", "seventeen", "eighteen", "nineteen", "twenty",
];

/** Numbers up to twenty in words, above it in figures. Either way the context supplied it. */
export function numberWord(n: number): string {
  if (!Number.isFinite(n) || n < 0) return "0";
  const i = Math.round(n);
  return i <= 20 ? ONES[i] : String(i);
}

/** "one day" / "thirteen days" / "61 days". */
export function daysPhrase(n: number): string {
  return `${numberWord(n)} ${Math.round(n) === 1 ? "day" : "days"}`;
}

/** "one stone" / "two stones". */
export function stonesPhrase(n: number): string {
  return `${numberWord(n)} ${Math.round(n) === 1 ? "stone" : "stones"}`;
}

/** "14 May", for a paper date read from the plan. */
export function shortDate(iso: string): string {
  const d = new Date(iso + "T00:00:00");
  return `${d.getDate()} ${d.toLocaleDateString("en-GB", { month: "long" })}`;
}

/**
 * A day named only when it is inside the coming week, so the sentence always reads as English.
 * Further away, the slot is absent and the lines that need it stay silent rather than say it badly.
 * This is the bare form, for the front of a sentence: "Thursday brings back bounds."
 */
export function dayNameWithin(target: Date, now: Date, days = 7): string | null {
  const t = startOfDay(target).getTime();
  const n = startOfDay(now).getTime();
  const delta = Math.round((t - n) / DAY);
  if (delta < 0 || delta > days) return null;
  if (delta === 0) return "later today";
  if (delta === 1) return "tomorrow";
  return WEEKDAYS[target.getDay()];
}

/**
 * The same day said in the middle of a sentence, the British way: "later today", "tomorrow", "on Thursday".
 * Something already due is "today". Null beyond the coming week, like dayNameWithin.
 */
export function whenPhrase(target: Date, now: Date, days = 7): string | null {
  if (target.getTime() <= now.getTime()) return "today";
  const day = dayNameWithin(target, now, days);
  if (!day) return null;
  return day === "later today" || day === "tomorrow" ? day : `on ${day}`;
}

function startOfDay(d: Date): Date {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

function startOfWeek(d: Date): Date {
  const x = startOfDay(d);
  x.setDate(x.getDate() - ((x.getDay() + 6) % 7)); // Monday
  return x;
}

function titleFor(slug: string, titles: Record<string, string>): string {
  return spokenTitle(titles[slug] ?? slug.split("/").pop()!.replace(/-/g, " "));
}

/** Joined in English: "bounds", "bounds and circle theorems", "bounds, frustums and circle theorems". */
export function joinWords(list: string[]): string {
  if (list.length <= 1) return list[0] ?? "";
  return `${list.slice(0, -1).join(", ")} and ${list[list.length - 1]}`;
}

/** A title said in one breath has at most this many words; a longer one is cut, or the line that needs it stays silent. */
export const SPOKEN_TITLE_WORDS = 6;

/**
 * A catalogue title as a person would say it, and never a different topic's name.
 *
 * An aside in brackets goes ("(frequency density)", "(factorise and cancel)"); a bracket with no word of
 * three letters in it is mathematics and stays ("expanding (a + b)ⁿ"), as the topic page's own
 * withoutAsides does. A title of six words or fewer is said whole. A longer one is cut only where the part
 * kept is still the whole name: at a colon or a semicolon (a subtitle follows), or before "including" or
 * "using" (an extension follows), and only when at least three words are kept. Never at a comma or "and":
 * "Index laws with zero and negative powers" cut there is "Index laws with zero", and "Sketching the graphs
 * of sin x, cos x and tan x" is "Sketching the graphs of sin x" (found by the topic-page agent, 23 September).
 * A title that cannot be cut is said whole; a line it would push past 140 characters is dropped by the lint.
 */
export function spokenTitle(title: string): string {
  const base = withoutAsides(title);
  if (wordCount(base) <= SPOKEN_TITLE_WORDS) return base;
  const cuts = [":", ";", " including ", " using "]
    .map((sep) => base.indexOf(sep))
    .filter((i) => i > 0)
    .sort((a, b) => a - b);
  for (const i of cuts) {
    const head = base.slice(0, i).trim();
    if (wordCount(head) >= 3) return head;
  }
  return base;
}

/**
 * A title without its asides: a bracket that holds a word of three letters, or that ends the title, goes; a
 * bracket of mathematics inside the title stays. The same rule as withoutAsides in
 * src/components/topic/lesson-plan.ts, so Rowan and the page's heading name a topic alike.
 */
export function withoutAsides(title: string): string {
  const out = title.replace(/\s\(([^()]*)\)(?=$|[\s,:;.])/g, (whole: string, inner: string, offset: number) => {
    const atEnd = offset + whole.length >= title.length;
    return atEnd || /[A-Za-z]{3,}/.test(inner) ? "" : whole;
  });
  return out.replace(/\s+([,:;.])/g, "$1").replace(/\s{2,}/g, " ").trim();
}

function wordCount(text: string): number {
  return text.split(" ").filter(Boolean).length;
}

/** Why an item returns, in one clause. Never a count of her misses. */
function reasonFor(card: ReviewCard): string {
  return card.id.startsWith("hc:") ? "you were sure and not right, so it comes back sooner" : "it is due on the schedule";
}

/**
 * Builds the context. Everything is optional: with an empty database this returns a context whose
 * flags are all false and whose slots are almost all absent, which makes Rowan silent rather than wrong.
 */
export function buildCompanionContext(input: CompanionInput): CompanionContext {
  const now = input.now;
  const today = todayISOFrom(now);
  const state = input.state;
  const notes = input.notes ?? [];
  const attempts = input.attempts ?? [];
  const mastery = input.mastery ?? [];
  const dueCards = input.dueCards ?? [];
  const futureCards = input.futureCards ?? [];
  const sessions = input.sessions ?? [];
  const titles = input.topicTitles ?? {};
  const topic = input.topic ?? null;
  const item = input.item ?? null;
  const firstRunDone = input.firstRunDone ?? true;

  const papers = upcomingPapers(input.plan, today);
  const next = nextPaperOf(input.plan, today);
  const daysToPaperByUnit: Record<string, number> = {};
  for (const p of papers) daysToPaperByUnit[`${p.subject}:${p.unit}`] = p.daysAway;

  // Tonight's work.
  const confidentWrong = dueCards.filter((c) => c.id.startsWith("hc:")).length;
  const dueSubjects = [...new Set(dueCards.map((c) => c.subject))];
  const dueMinutes = dueCards.length ? Math.max(1, Math.round(dueCards.length * 0.75)) : null;

  // What returns, and when. The next three, each with its reason.
  const returns = [...futureCards]
    .sort((a, b) => a.due.getTime() - b.due.getTime())
    .slice(0, 3)
    .map((c) => ({ id: c.id, topicSlug: c.topicSlug, title: titleFor(c.topicSlug, titles), dueAt: c.due, reason: reasonFor(c) }));

  // Her own words. Only a note she wrote may ever be quoted.
  const hers = notes.filter((n) => n.source === "her");
  const newest = (kind: CompanionNote["kind"]) =>
    hers.filter((n) => n.kind === kind).sort((a, b) => b.at.getTime() - a.at.getTime())[0] ?? null;
  const cairnNote = newest("cairn-note");
  const taughtNote = newest("taught");
  const whenNext = newest("when-next");

  const herNote = cairnNote ? { text: cairnNote.text.trim(), topicSlug: cairnNote.topicId ?? null } : null;
  const taught = taughtNote ? { text: taughtNote.text.trim(), topicSlug: taughtNote.topicId ?? null } : null;
  const intendedDay = whenNext && WEEKDAYS.includes(whenNext.text.trim()) ? whenNext.text.trim() : null;

  // Sessions. Counted up only, never down, and never as a distance from the last one.
  const weekStart = startOfWeek(now).getTime();
  const sessionsThisWeek = sessions.filter((s) => s.startedAt.getTime() >= weekStart).length;
  const last = [...sessions].sort((a, b) => b.startedAt.getTime() - a.startedAt.getTime())[0] ?? null;
  const lastSession = last ? { at: last.startedAt, items: last.itemsDone, minutes: last.minutes } : null;

  // Stones.
  const proved = mastery.filter((m) => m.level === "proficient" || m.level === "mastered");
  const startedAt = input.sessionStartedAt ?? now.getTime();
  const placedThisSession = proved.filter((m) => m.updatedAt.getTime() >= startedAt).length;

  // The week, in exam currency.
  const weekAttempts = attempts.filter((a) => a.at.getTime() >= weekStart);
  const provedThisWeek = proved.filter((m) => m.updatedAt.getTime() >= weekStart).length;

  // This topic, if she is on one.
  const topicAttempts = topic ? attempts.filter((a) => a.topicSlug === topic.slug && a.subject === topic.subject) : [];
  const topicDays = new Set(topicAttempts.map((a) => Math.floor(a.at.getTime() / DAY))).size;
  const topicReturns = topicAttempts.filter((a) => a.itemKind === "prompt" || a.itemKind === "recall").length;
  const topicNextCard = topic
    ? [...futureCards].filter((c) => c.topicSlug === topic.slug).sort((a, b) => a.due.getTime() - b.due.getTime())[0]
    : undefined;

  // A mock she filed: what of that unit comes back inside the coming week, already-due items included.
  // Null when the unit's topics are unknown, so nothing is said about them.
  const mock = input.mock ?? null;
  const mockBack =
    mock && mock.topicSlugs
      ? (() => {
          const slugs = new Set(mock.topicSlugs);
          return [...dueCards, ...futureCards]
            .filter((c) => c.subject === mock.subject && slugs.has(c.topicSlug) && whenPhrase(c.due, now) !== null)
            .sort((a, b) => a.due.getTime() - b.due.getTime());
        })()
      : null;

  // The topic's name as the page says it: the hero's display title when it carries no mathematics (a line is
  // plain text, and "$y = k^{x}$" would be read out with its dollar signs), otherwise the catalogue's.
  const topicName = topic ? (topic.shortTitle && !topic.shortTitle.includes("$") ? topic.shortTitle : topic.title) : null;

  // The timetable's own days.
  const satToday = input.satPaperUnit ?? satPaperToday(papers, now);
  const paperEve = next != null && next.daysAway === 1;
  const isLate = lateNow(now);

  // The first Letter: owed once first run is done, and first in line only on the day it is first offered.
  const letterOwed = firstRunDone && !state.letterSeen;
  const letterOfferedOn = state.letterOfferedOn ?? null;
  const letterGoesFirst = letterOwed && (letterOfferedOn === null || letterOfferedOn >= today);

  const flags: Record<Flag, boolean> = {
    hasDue: dueCards.length > 0,
    noDue: dueCards.length === 0,
    confidentWrongPending: confidentWrong > 0,
    hasHerNote: herNote != null && herNote.text.length > 0,
    hasTaughtLine: taught != null && taught.text.length > 0,
    hasIntention: intendedDay != null,
    firstVisitToTopic: topic?.firstVisit === true,
    resumable: topic != null && typeof topic.sectionNumber === "number" && topic.sectionNumber > 1,
    reviserPath: topic?.reviserPath === true,
    stonePlaced: placedThisSession > 0,
    isLate,
    paperEve,
    afterPaper: satToday != null,
    mockEntered: mock != null,
    mockNothingSoon: mockBack != null && mockBack.length === 0,
    askedAboutNerves: input.askedAboutNerves === true,
    hasEvidence: item?.evidence != null,
    hasMethodMark: item?.methodMark === true,
    unitsInAnswer: item?.unitsInAnswer === true,
    scienceDue: dueSubjects.includes("science"),
    topicIsSly: topic?.examinerFlagged === true,
    // A line that names the topic mid-sentence needs a title said in one breath.
    topicTitleShort: topicName != null && wordCount(spokenTitle(topicName)) <= SPOKEN_TITLE_WORDS,
    firstLetterDue: letterOwed,
    letterGoesFirst,
  };

  const slots: Partial<Record<SlotName, string>> = {};
  const put = (name: SlotName, value: string | null | undefined) => {
    if (value != null && String(value).trim() !== "") slots[name] = String(value).trim();
  };

  // The plan.
  if (papers.length) {
    const first = papers.find((p) => p.daysAway >= 0) ?? papers[0];
    const second = papers.filter((p) => p.daysAway >= 0)[1];
    put("papersLine", second ? `${first.unit} on ${shortDate(first.date)}, then ${second.unit} on ${shortDate(second.date)}` : `${first.unit} on ${shortDate(first.date)}`);
  }
  if (next) {
    put("nextPaperUnit", next.unit);
    put("nextPaperDate", shortDate(next.date));
    // The paper's own start time, said the way the timetable says it: "9.15", never "09:15".
    put("nextPaperStart", next.start ? next.start.replace(":", ".").replace(/^0/, "") : null);
    put("nextPaperDays", daysPhrase(next.daysAway));
  }
  put("satPaperUnit", satToday);
  put("resumeDay", WEEKDAYS[new Date(now.getTime() + 2 * DAY).getDay()]);
  put("trapsMinutes", numberWord(input.trapsMinutes ?? 20));

  // Tonight.
  if (dueCards.length) put("dueCount", numberWord(dueCards.length));
  if (confidentWrong) put("confidentWrongCount", numberWord(confidentWrong));
  if (returns.length) {
    put("returnWhen", whenPhrase(returns[0].dueAt, now));
    put("returnDay", dayNameWithin(returns[0].dueAt, now));
    // Only the topics that come back on that same day: "Saturday brings back bounds and circle theorems"
    // must not name a topic that comes back on Sunday.
    const firstDay = startOfDay(returns[0].dueAt).getTime();
    const sameDay = [
      ...new Set(
        futureCards
          .filter((c) => startOfDay(c.due).getTime() === firstDay)
          .sort((a, b) => a.due.getTime() - b.due.getTime())
          .map((c) => titleFor(c.topicSlug, titles)),
      ),
    ];
    put("returningTopics", sameDay.length <= 3 ? joinWords(sameDay) : joinWords([sameDay[0], sameDay[1], `${numberWord(sameDay.length - 2)} more topics`]));
  }
  if (topicNextCard) put("recheckWhen", whenPhrase(topicNextCard.due, now));
  if (dueCards.length) put("firstItemTitle", titleFor(dueCards[0].topicSlug, titles));
  put("nextTopicTitle", input.nextTopic ? spokenTitle(input.nextTopic.title) : null);

  // The topic.
  if (topic && topicName) {
    put("topicTitle", spokenTitle(topicName));
    put("unit", topic.unit);
    if (typeof topic.sectionNumber === "number" && topic.sectionNumber > 1) put("sectionNumber", String(topic.sectionNumber));
  }
  if (placedThisSession > 0) put("stonePhrase", stonesPhrase(placedThisSession));

  // The week. A count of zero is left absent rather than said: the line that needed it stays silent,
  // which is how a quiet week is reported without ever being named as a shortfall.
  const sessionsSaid = sessionsThisWeek || topicDays;
  if (sessionsSaid > 0) put("sessionCount", numberWord(sessionsSaid));
  if (topicReturns > 0) put("returnCount", numberWord(topicReturns));
  if (weekAttempts.length > 0) put("itemCount", numberWord(weekAttempts.length));
  if (provedThisWeek > 0) put("provedCount", numberWord(provedThisWeek));

  // Her words.
  const quotedSlots: SlotName[] = [];
  if (herNote?.text) {
    put("herNote", herNote.text);
    put("herNoteTopic", herNote.topicSlug ? titleFor(herNote.topicSlug, titles) : null);
    quotedSlots.push("herNote");
  }
  if (taught?.text) {
    put("taughtLine", taught.text);
    quotedSlots.push("taughtLine");
  }
  if (intendedDay) {
    put("intendedDay", intendedDay);
    quotedSlots.push("intendedDay");
  }

  // The item.
  if (item) {
    put("answerText", item.answerText);
    put("methodLine", item.methodLine);
    put("whyHard", item.whyHard);
    put("recapAsk", item.recapAsk);
    if (item.evidence) {
      put("evidenceSeries", item.evidence.series);
      put("evidenceFinding", item.evidence.finding);
    }
  }

  // A mock she entered. Silent on the mark: only its unit, and what of that unit comes back, and when.
  if (mock) {
    put("mockUnit", mock.unit);
    if (mockBack && mockBack.length) {
      put("mockReturnsCount", `${numberWord(mockBack.length)} ${mockBack.length === 1 ? "item" : "items"}`);
      put("mockReturnsWhen", whenPhrase(mockBack[0].due, now));
    }
  }

  return {
    now,
    today,
    rowanName: rowanName(state),
    learnerName: input.plan.learnerName ?? null,
    plainMode: isPlainMode(state, now),
    silenced: state.silenced,
    figure: state.figure !== false && !state.silenced,
    firstRunDone,
    letterSeen: state.letterSeen,
    letterOfferedOn,
    questionVisible: input.questionVisible === true,
    giftNoteOnScreen: input.giftNoteOnScreen === true,
    papers,
    nextPaper: next,
    daysToPaperByUnit,
    due: { count: dueCards.length, minutes: dueMinutes, confidentWrong, subjects: dueSubjects },
    returns,
    lastSession,
    sessionsThisWeek,
    notes,
    herNote,
    taught,
    intention: intendedDay ? { day: intendedDay } : null,
    stoppedAt: topic && typeof topic.sectionNumber === "number" ? { topicSlug: topic.slug, sectionNumber: topic.sectionNumber } : null,
    topic,
    item,
    stones: { total: proved.length, placedThisSession },
    flags,
    recentLines: state.recent ?? [],
    slots,
    quotedSlots,
  };
}

/** Late enough to be told so, and only because she is here reading it. No hour is ever named. */
export function lateNow(now: Date): boolean {
  const h = now.getHours();
  const m = now.getMinutes();
  return h >= 22 || (h === 21 && m >= 30) || h < 4;
}

/** A paper on today's date whose sitting has finished, from the timetable alone. */
function satPaperToday(papers: UpcomingPaper[], now: Date): string | null {
  const todays = papers.filter((p) => p.daysAway === 0);
  for (const p of todays) {
    const [hh, mm] = (p.start ?? "09:15").split(":").map(Number);
    const end = new Date(now);
    end.setHours(hh, mm + (p.durationMinutes ?? 120), 0, 0);
    if (now.getTime() >= end.getTime()) return p.unit;
  }
  return null;
}
