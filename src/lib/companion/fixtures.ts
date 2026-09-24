/**
 * The acceptance fixtures.
 *
 * The specification asks for six (first visit, normal evening, three-day gap, final fortnight, paper
 * eve, after a paper). The completeness critic replaced the first with "existing install, first
 * Letter", because she went through first run on 13 September and the fresh-install card would never
 * have reached her; a mock and a live question surface are added for the two slots the critic asked
 * for. Every one of them is a plain object with a fixed clock, so the tests, the lint and the
 * read-aloud gallery all see exactly what she would see.
 *
 * Decision 3 (23 September 2026) adds the day-one fixtures: a device before first run, a fresh install
 * on the evening of first run (Letter unread, then read), an install already past first run on the day
 * the upgrade Letter first reaches it and on the day after, and the fresh install on day fifteen, when
 * plain mode has run out.
 *
 * Dates are the real 2027 timetable in data/exams/exam-map.json: B1 on 11 May, M4 on 14 May.
 */

import type { Attempt, ReviewCard, StudySession, TopicMastery } from "@/lib/db/db";
import { DEFAULT_PLAN } from "@/lib/plan/exam-plan";
import { newCard } from "@/lib/srs/scheduler";
import type { CompanionInput } from "./context";
import { freshState, type CompanionNote, type CompanionState } from "./memory";

const DAY = 86_400_000;

export const TOPIC_TITLES: Record<string, string> = {
  "frustums-of-cones": "frustums",
  "bounds-and-accuracy": "bounds",
  "circle-theorems": "circle theorems",
  "histograms-unequal-widths": "histograms",
  "cell-structure": "cell structure",
  "b1-cells-and-microscopy": "Cells, microscopy and specialisation",
};

/** The M4 topics the evening fixtures use, as the taxonomy would hand them to a filed M4 paper. */
export const M4_TOPIC_SLUGS = ["frustums-of-cones", "bounds-and-accuracy", "circle-theorems", "histograms-unequal-widths"];

/** The first-run evening of a fresh install: first run finished at 19:40 on Tuesday 22 September. */
export const FRESH_INSTALL_AT = new Date("2026-09-22T19:40:00");
/** The upgrade Letter first reaches an install that was past first run: Wednesday 23 September. */
export const UPGRADE_AT = new Date("2026-09-23T19:30:00");

/** What first run leaves behind: one checked gate and one marked question part from the seeded lesson. */
function seededLessonRows(installedAt: Date) {
  const at = new Date(installedAt.getTime() + 5 * 60_000);
  const science = (id: string, dueAt: Date) => card(id, "b1-cells-and-microscopy", dueAt, "science");
  return {
    futureCards: [
      science("q.science.b1.b1-cells-and-microscopy.0001#main", new Date(installedAt.getTime() + DAY)),
      science("science.b1.b1-cells-and-microscopy#gate:g1", new Date(installedAt.getTime() + 3 * DAY)),
    ],
    attempts: [
      { ...attempt(at, "b1-cells-and-microscopy", "practice"), subject: "science" as const },
      { ...attempt(new Date(at.getTime() + 60_000), "b1-cells-and-microscopy", "practice", false), subject: "science" as const },
    ],
    sessions: [session(at, 2)],
    mastery: [{ ...proved("b1-cells-and-microscopy", at), key: "science:b1-cells-and-microscopy", subject: "science" as const, level: "attempted" as const, score: 0.33 }],
  };
}

/** Today's next step on a new device with the default plan, as chooseNextStep gave it on the dev server. */
const NEXT_STEP_M3 = {
  slug: "simplifying-multiplying-and-dividing-algebraic-fractions",
  title: "Simplifying, multiplying and dividing algebraic fractions (factorise and cancel)",
};

function card(id: string, topicSlug: string, dueAt: Date, subject: ReviewCard["subject"] = "maths"): ReviewCard {
  return { id, subject, topicSlug, card: newCard(dueAt), due: dueAt, createdAt: new Date(dueAt.getTime() - 7 * DAY) };
}

function attempt(at: Date, topicSlug: string, itemKind: Attempt["itemKind"] = "prompt", correct = true): Attempt {
  return {
    at,
    subject: "maths",
    topicSlug,
    itemId: `rp.${topicSlug}.${at.getTime()}`,
    itemKind,
    correct,
    marksAwarded: null,
    marksAvailable: null,
    confidence: null,
    rating: null,
    misconceptionTags: [],
    timeMs: null,
    answerRaw: null,
  };
}

function session(startedAt: Date, items = 12): StudySession {
  return { startedAt, endedAt: new Date(startedAt.getTime() + 14 * 60_000), subject: "maths", minutes: 14, itemsDone: items };
}

function proved(topicSlug: string, updatedAt: Date): TopicMastery {
  return {
    key: `maths:${topicSlug}`,
    subject: "maths",
    topicSlug,
    level: "proficient",
    score: 0.9,
    lastEvidenceAt: updatedAt,
    updatedAt,
  };
}

function note(kind: CompanionNote["kind"], text: string, at: Date, topicId?: string): CompanionNote {
  return { at, kind, text, topicId, source: "her" };
}

/** A state row with plain mode already finished, unless a fixture says otherwise. */
function settled(now: Date, patch: Partial<CompanionState> = {}): CompanionState {
  return { ...freshState(now), plainModeUntil: null, letterSeen: true, ...patch };
}

const EVENING = new Date("2026-10-01T19:20:00");

function eveningRows(now: Date) {
  const due = [
    card("rp.frustums.01", "frustums-of-cones", new Date(now.getTime() - 2 * DAY)),
    card("rp.frustums.02", "frustums-of-cones", new Date(now.getTime() - DAY)),
    card("rp.bounds.01", "bounds-and-accuracy", new Date(now.getTime() - DAY)),
    card("rp.bounds.02", "bounds-and-accuracy", new Date(now.getTime() - DAY)),
    card("rp.circle.01", "circle-theorems", new Date(now.getTime() - DAY)),
    card("rp.circle.02", "circle-theorems", new Date(now.getTime() - DAY)),
    card("rp.hist.01", "histograms-unequal-widths", new Date(now.getTime() - DAY)),
    card("hc:dx.bounds.03:1", "bounds-and-accuracy", new Date(now.getTime() - DAY)),
    card("hc:dx.bounds.03:2", "bounds-and-accuracy", new Date(now.getTime() - DAY)),
  ];
  const future = [
    card("rp.bounds.04", "bounds-and-accuracy", new Date(now.getTime() + 2 * DAY)),
    card("rp.circle.05", "circle-theorems", new Date(now.getTime() + 3 * DAY)),
    card("rp.frustums.06", "frustums-of-cones", new Date(now.getTime() + 4 * DAY)),
  ];
  return { due, future };
}

export type FixtureName =
  | "first-letter"
  | "normal-evening"
  | "after-three-days"
  | "final-fortnight"
  | "paper-eve"
  | "after-a-paper"
  | "mock-entered"
  | "during-a-question"
  | "topic-first-visit"
  | "close-with-stone"
  | "plain-mode"
  | "silenced"
  | "brother-note-on-screen"
  | "empty-install"
  | "before-first-run"
  | "fresh-install-day-one"
  | "fresh-install-letter-read"
  | "existing-install-first-letter"
  | "existing-install-next-day"
  | "day-fifteen"
  | "mock-quiet-week";

export const FIXTURES: Record<FixtureName, CompanionInput> = {
  // An install that is already past first run: the Letter is an upgrade moment, not a welcome card.
  "first-letter": (() => {
    const now = new Date("2026-09-19T20:10:00");
    return {
      now,
      plan: DEFAULT_PLAN,
      state: settled(now, { letterSeen: false, plainModeUntil: "2026-10-03" }),
      firstRunDone: true,
      nextTopic: { slug: "frustums-of-cones", title: "Frustums" },
      topicTitles: TOPIC_TITLES,
    };
  })(),

  "normal-evening": (() => {
    const now = EVENING;
    const { due, future } = eveningRows(now);
    return {
      now,
      plan: DEFAULT_PLAN,
      state: settled(now),
      dueCards: due,
      futureCards: future,
      attempts: [attempt(new Date(now.getTime() - DAY), "frustums-of-cones")],
      sessions: [session(new Date(now.getTime() - DAY))],
      notes: [
        note("cairn-note", "cube the scale factor for volume", new Date(now.getTime() - 3 * DAY), "frustums-of-cones"),
        note("when-next", "Thursday", new Date(now.getTime() - DAY)),
      ],
      topicTitles: TOPIC_TITLES,
      nextTopic: { slug: "bounds-and-accuracy", title: "Bounds" },
    };
  })(),

  // Identical facts, a week and a half since the last sitting. Nothing may differ in what is said.
  "after-three-days": (() => {
    const now = EVENING;
    const { due, future } = eveningRows(now);
    return {
      now,
      plan: DEFAULT_PLAN,
      state: settled(now),
      dueCards: due,
      futureCards: future,
      attempts: [attempt(new Date(now.getTime() - 11 * DAY), "frustums-of-cones")],
      sessions: [session(new Date(now.getTime() - 11 * DAY))],
      notes: [
        note("cairn-note", "cube the scale factor for volume", new Date(now.getTime() - 3 * DAY), "frustums-of-cones"),
        note("when-next", "Thursday", new Date(now.getTime() - DAY)),
      ],
      topicTitles: TOPIC_TITLES,
      nextTopic: { slug: "bounds-and-accuracy", title: "Bounds" },
    };
  })(),

  "final-fortnight": (() => {
    const now = new Date("2027-05-02T19:00:00");
    const { due, future } = eveningRows(now);
    return {
      now,
      plan: DEFAULT_PLAN,
      state: settled(now),
      dueCards: due,
      futureCards: future,
      sessions: [session(new Date(now.getTime() - DAY))],
      attempts: [attempt(new Date(now.getTime() - DAY), "bounds-and-accuracy")],
      topicTitles: TOPIC_TITLES,
      nextTopic: { slug: "circle-theorems", title: "Circle theorems" },
    };
  })(),

  "paper-eve": (() => {
    const now = new Date("2027-05-10T20:00:00"); // B1 is at 09:15 tomorrow
    const { due, future } = eveningRows(now);
    return {
      now,
      plan: DEFAULT_PLAN,
      state: settled(now),
      dueCards: due,
      futureCards: future,
      topicTitles: TOPIC_TITLES,
    };
  })(),

  "after-a-paper": (() => {
    const now = new Date("2027-05-11T11:30:00"); // B1 finished at 10:15
    const { future } = eveningRows(now);
    return {
      now,
      plan: DEFAULT_PLAN,
      state: settled(now),
      futureCards: future,
      topicTitles: TOPIC_TITLES,
    };
  })(),

  "mock-entered": (() => {
    const now = new Date("2026-11-20T18:30:00");
    const { future } = eveningRows(now);
    return {
      now,
      plan: DEFAULT_PLAN,
      state: settled(now),
      futureCards: future,
      mock: { unit: "M4", subject: "maths", at: now, topicSlugs: M4_TOPIC_SLUGS },
      topicTitles: TOPIC_TITLES,
    };
  })(),

  // A paper filed for a unit with nothing of it due back in the coming week.
  "mock-quiet-week": (() => {
    const now = new Date("2026-11-20T18:30:00");
    const { future } = eveningRows(now);
    return {
      now,
      plan: DEFAULT_PLAN,
      state: settled(now),
      futureCards: future,
      mock: { unit: "FM1", subject: "further-maths", at: now, topicSlugs: ["algebraic-fractions-simplify", "completing-the-square"] },
      topicTitles: TOPIC_TITLES,
    };
  })(),

  "during-a-question": (() => {
    const now = EVENING;
    const { due, future } = eveningRows(now);
    return {
      now,
      plan: DEFAULT_PLAN,
      state: settled(now),
      dueCards: due,
      futureCards: future,
      questionVisible: true,
      topic: { slug: "frustums-of-cones", unit: "M4", subject: "maths", title: "Frustums", sectionNumber: 3 },
      item: {
        id: "q.maths.m4.frustums.04",
        answerText: "15.4 cm cubed",
        methodLine: "the big cone first, then the subtraction",
        whyHard: "the frustum wants two volumes and the question hands you one",
        recapAsk: "the small cone is subtracted",
        unitsInAnswer: true,
        evidence: { series: "Summer 2024", finding: "most candidates used the lower bound here, not the midpoint" },
      },
      topicTitles: TOPIC_TITLES,
    };
  })(),

  "topic-first-visit": (() => {
    const now = EVENING;
    return {
      now,
      plan: DEFAULT_PLAN,
      state: settled(now),
      topic: { slug: "bounds-and-accuracy", unit: "M4", subject: "maths", title: "Bounds", firstVisit: true, examinerFlagged: true },
      topicTitles: TOPIC_TITLES,
    };
  })(),

  "close-with-stone": (() => {
    const now = EVENING;
    const { future } = eveningRows(now);
    const startedAt = now.getTime() - 20 * 60_000;
    return {
      now,
      plan: DEFAULT_PLAN,
      state: settled(now),
      futureCards: future,
      sessionStartedAt: startedAt,
      mastery: [proved("frustums-of-cones", new Date(startedAt + 60_000))],
      attempts: [
        attempt(new Date(startedAt + 30_000), "frustums-of-cones"),
        attempt(new Date(startedAt + 90_000), "frustums-of-cones", "prompt"),
      ],
      sessions: [session(new Date(startedAt))],
      topic: { slug: "frustums-of-cones", unit: "M4", subject: "maths", title: "Frustums" },
      topicTitles: TOPIC_TITLES,
    };
  })(),

  // The first fortnight of an install: the place language is off until she turns it on.
  "plain-mode": (() => {
    const now = EVENING;
    const { due, future } = eveningRows(now);
    return {
      now,
      plan: DEFAULT_PLAN,
      state: { ...freshState(now), letterSeen: true },
      dueCards: due,
      futureCards: future,
      topicTitles: TOPIC_TITLES,
      nextTopic: { slug: "bounds-and-accuracy", title: "Bounds" },
    };
  })(),

  silenced: (() => {
    const now = EVENING;
    const { due, future } = eveningRows(now);
    return {
      now,
      plan: DEFAULT_PLAN,
      state: settled(now, { silenced: true }),
      dueCards: due,
      futureCards: future,
      topicTitles: TOPIC_TITLES,
    };
  })(),

  "brother-note-on-screen": (() => {
    const now = EVENING;
    const { due, future } = eveningRows(now);
    return {
      now,
      plan: DEFAULT_PLAN,
      state: settled(now),
      dueCards: due,
      futureCards: future,
      giftNoteOnScreen: true,
      topicTitles: TOPIC_TITLES,
    };
  })(),

  // Nothing has happened yet. Almost every slot must be silent rather than invent a fact.
  "empty-install": (() => {
    const now = new Date("2026-09-19T17:00:00");
    return { now, plan: DEFAULT_PLAN, state: settled(now) };
  })(),

  // A new device on its way to first run: Today renders for a moment before it sends her to /welcome/.
  "before-first-run": (() => {
    const now = new Date("2026-09-22T19:30:00");
    return { now, plan: DEFAULT_PLAN, state: freshState(now), firstRunDone: false, nextTopic: NEXT_STEP_M3 };
  })(),

  // Day one of a fresh install, the first Today after first run: the Letter is owed and not yet opened.
  "fresh-install-day-one": (() => {
    const now = new Date("2026-09-22T19:55:00");
    const rows = seededLessonRows(FRESH_INSTALL_AT);
    return {
      now,
      plan: DEFAULT_PLAN,
      state: freshState(FRESH_INSTALL_AT),
      firstRunDone: true,
      ...rows,
      sessionStartedAt: FRESH_INSTALL_AT.getTime(),
      topic: { slug: NEXT_STEP_M3.slug, unit: "M3", subject: "maths", title: NEXT_STEP_M3.title, firstVisit: true },
      nextTopic: NEXT_STEP_M3,
      topicTitles: TOPIC_TITLES,
    };
  })(),

  // The same evening, after she has read the Letter: plain mode is on and everything else may speak.
  "fresh-install-letter-read": (() => {
    const now = new Date("2026-09-22T20:10:00");
    const rows = seededLessonRows(FRESH_INSTALL_AT);
    return {
      now,
      plan: DEFAULT_PLAN,
      state: { ...freshState(FRESH_INSTALL_AT), letterSeen: true, letterOfferedOn: "2026-09-22" },
      firstRunDone: true,
      ...rows,
      sessionStartedAt: now.getTime() - 20 * 60_000,
      topic: { slug: NEXT_STEP_M3.slug, unit: "M3", subject: "maths", title: NEXT_STEP_M3.title, firstVisit: true },
      item: { id: "q.maths.m3.simplifying.0003#a", unitsInAnswer: false, methodMark: true },
      mock: { unit: "M4", subject: "maths", at: now, topicSlugs: M4_TOPIC_SLUGS },
      nextTopic: NEXT_STEP_M3,
      topicTitles: TOPIC_TITLES,
    };
  })(),

  // An install already past first run when Rowan arrives (her phone): the upgrade Letter's first day.
  "existing-install-first-letter": (() => {
    const now = UPGRADE_AT;
    const { due, future } = eveningRows(now);
    return {
      now,
      plan: DEFAULT_PLAN,
      state: freshState(now),
      firstRunDone: true,
      dueCards: due,
      futureCards: future,
      attempts: [attempt(new Date(now.getTime() - 2 * DAY), "frustums-of-cones"), attempt(new Date(now.getTime() - 6 * DAY), "bounds-and-accuracy")],
      sessions: [session(new Date(now.getTime() - 2 * DAY)), session(new Date(now.getTime() - 6 * DAY))],
      mastery: [proved("frustums-of-cones", new Date(now.getTime() - 5 * DAY))],
      sessionStartedAt: now.getTime() - 20 * 60_000,
      topic: { slug: "circle-theorems", unit: "M4", subject: "maths", title: "Circle theorems", firstVisit: true },
      nextTopic: { slug: "bounds-and-accuracy", title: "Bounds" },
      topicTitles: TOPIC_TITLES,
    };
  })(),

  // The day after: she has not opened the Letter. It waits, sealed, and Rowan speaks everywhere else.
  "existing-install-next-day": (() => {
    const now = new Date(UPGRADE_AT.getTime() + DAY);
    const { due, future } = eveningRows(now);
    return {
      now,
      plan: DEFAULT_PLAN,
      state: { ...freshState(UPGRADE_AT), letterOfferedOn: "2026-09-23" },
      firstRunDone: true,
      dueCards: due,
      futureCards: future,
      attempts: [attempt(new Date(now.getTime() - 3 * DAY), "frustums-of-cones")],
      sessions: [session(new Date(now.getTime() - 3 * DAY))],
      mastery: [proved("frustums-of-cones", new Date(now.getTime() - 6 * DAY))],
      sessionStartedAt: now.getTime() - 20 * 60_000,
      topic: { slug: "circle-theorems", unit: "M4", subject: "maths", title: "Circle theorems", firstVisit: true },
      item: { id: "q.maths.m4.circle.0002#b", unitsInAnswer: false, methodMark: false },
      nextTopic: { slug: "bounds-and-accuracy", title: "Bounds" },
      topicTitles: TOPIC_TITLES,
    };
  })(),

  // The fresh install on day fifteen: plain mode ran out on 6 October, so the place wording is back.
  "day-fifteen": (() => {
    const now = new Date("2026-10-07T19:30:00");
    const { due, future } = eveningRows(now);
    const startedAt = now.getTime() - 20 * 60_000;
    return {
      now,
      plan: DEFAULT_PLAN,
      state: { ...freshState(FRESH_INSTALL_AT), letterSeen: true, letterOfferedOn: "2026-09-22" },
      firstRunDone: true,
      dueCards: due,
      futureCards: future,
      sessionStartedAt: startedAt,
      mastery: [proved("frustums-of-cones", new Date(startedAt + 60_000))],
      attempts: [attempt(new Date(startedAt + 30_000), "frustums-of-cones")],
      sessions: [session(new Date(startedAt))],
      topic: { slug: "frustums-of-cones", unit: "M4", subject: "maths", title: "Frustums", firstVisit: true },
      nextTopic: { slug: "bounds-and-accuracy", title: "Bounds" },
      topicTitles: TOPIC_TITLES,
    };
  })(),
};

export const FIXTURE_NAMES = Object.keys(FIXTURES) as FixtureName[];
