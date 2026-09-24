import Dexie, { type EntityTable } from "dexie";
import { backfillCards } from "./backfill";
import type { Card as FsrsCard } from "ts-fsrs";
import type { CompanionNote, CompanionState } from "@/lib/companion/memory";

/** One spaced-retrieval prompt's scheduling state (FSRS). */
export interface ReviewCard {
  id: string;            // prompt id, e.g. "maths:histograms:p03"
  subject: "maths" | "further-maths" | "science";
  topicSlug: string;
  card: FsrsCard;        // ts-fsrs card state
  due: Date;             // denormalised for indexing
  createdAt: Date;
}

/** Every answered question, kept forever for progress + error analysis. */
export interface Attempt {
  id?: number;
  at: Date;
  subject: "maths" | "further-maths" | "science";
  topicSlug: string;
  itemId: string;        // question / prompt / diagnostic id
  itemKind: "diagnostic" | "practice" | "exam" | "prompt" | "recall" | "mistake";
  correct: boolean | null;
  marksAwarded: number | null;
  marksAvailable: number | null;
  confidence: 1 | 2 | 3 | null;
  rating: 1 | 2 | 3 | 4 | null;      // FSRS Again/Hard/Good/Easy when applicable
  misconceptionTags: string[];
  timeMs: number | null;
  answerRaw: string | null;
  /**
   * The working she typed under the answer, when she typed any. Not indexed, so it needs no schema
   * version of its own — Dexie stores whatever the row carries, and older rows simply do not have it.
   */
  workingRaw?: string | null;
}

/** Mastery state per topic (Khan-style with decay), recomputed from attempts. */
export interface TopicMastery {
  key: string;           // `${subject}:${topicSlug}`
  subject: "maths" | "further-maths" | "science";
  topicSlug: string;
  level: "not-started" | "attempted" | "familiar" | "proficient" | "mastered";
  score: number;         // 0..1 rolling evidence
  lastEvidenceAt: Date | null;
  updatedAt: Date;
}

export interface StudySession {
  id?: number;
  startedAt: Date;
  endedAt: Date | null;
  subject: "maths" | "further-maths" | "science" | "mixed";
  minutes: number;
  itemsDone: number;
}

/** Where a topic's first-visit flow stands: each check done or skipped, so a reload does not ask again. */
export interface TopicFlow {
  key: string;           // `${subject}:${topicSlug}`
  checkDone: boolean;    // "Check yourself" (after the lesson) completed…
  checkSkipped: boolean; // …or skipped to practice
  postDone: boolean;     // "Check again" (after practice) completed
  // Where the one-at-a-time practice flows stand, so a reload resumes at the current question
  // (PracticeFlow). Optional and unindexed: no schema version bump was needed for them.
  practiceIndex?: number; // practice questions advanced past
  examIndex?: number;     // exam-style questions advanced past
  setIndex?: number;      // authored mixed-set items advanced past (after the practice questions)
  updatedAt: Date;
}

export interface Setting {
  key: string;
  value: unknown;
}

/** One question row of a self-marked official paper (Paper Runner). */
export interface MockMark {
  q: string;               // question number as printed, e.g. "12"
  awarded: number;
  available?: number;      // marks available (from the page map or typed in)
  tags: MockMarkTag[];     // one entry per lost mark (optional)
}

export type MockMarkTag = "method" | "accuracy" | "misread" | "presentation" | "not-attempted";

/** A timed run of an official past paper, self-marked and converted to UMS. */
export interface Mock {
  id?: number;
  at: Date;
  paperId: string;         // data/papers/index.json id
  subject: "maths" | "further-maths" | "science";
  unit: string;            // index unit code: M4, FM1, B1, U7 …
  engineUnit: string;      // grade-engine unit: M4, U1, B1H, U7BH …
  sessionKey: string;      // e.g. "2025-Summer"
  tier: "H" | "F" | null;
  paperNumber: 1 | 2 | null;
  discipline: "Biology" | "Chemistry" | "Physics" | null;
  booklet: "A" | "B" | null;
  minutesUsed: number;     // working time, pauses excluded
  paused: number;          // number of pauses taken
  pausedMinutes: number;
  marks: MockMark[];
  raw: number;             // marks on this paper
  rawMax: number;
  ums: number;             // unit UMS (estimated where flagged)
  grade: string;           // unit grade: a, b, c*, … (lower case, as CCEA prints unit grades)
  series: "summer-2025" | "summer-2026"; // boundary series used for the conversion
  estimated: boolean;
}

/**
 * A "Something wrong?" report from an item's checked panel: her words about an answer, a mark or a wording that looks
 * off, kept so the item can be re-checked (engine item 10.4, 23 Sep 2026: the panel promised a re-check while its
 * handler threw the words away).
 */
export interface ItemReport {
  id?: number;
  at: Date;
  itemId: string;
  subject: "maths" | "further-maths" | "science";
  topicSlug: string;
  text: string;
}

export class StudyDB extends Dexie {
  cards!: EntityTable<ReviewCard, "id">;
  attempts!: EntityTable<Attempt, "id">;
  mastery!: EntityTable<TopicMastery, "key">;
  sessions!: EntityTable<StudySession, "id">;
  settings!: EntityTable<Setting, "key">;
  mocks!: EntityTable<Mock, "id">;
  flow!: EntityTable<TopicFlow, "key">;
  companionNotes!: EntityTable<CompanionNote, "id">;
  companionState!: EntityTable<CompanionState, "id">;
  reports!: EntityTable<ItemReport, "id">;

  constructor() {
    super("ccea-study");
    this.version(1).stores({
      cards: "id, subject, topicSlug, due",
      attempts: "++id, at, subject, topicSlug, itemId, itemKind",
      mastery: "key, subject, topicSlug, level",
      sessions: "++id, startedAt, subject",
      settings: "key",
    });
    // v2 (Paper Runner): timed runs of official papers. Earlier tables are unchanged.
    this.version(2).stores({
      mocks: "++id, at, paperId, subject, unit, engineUnit, sessionKey",
    });
    // v3 (teach first): per-topic flow flags for the two checks. Earlier tables and indexes are unchanged.
    this.version(3).stores({
      flow: "key, updatedAt",
    });
    // v4 (the companion): what Rowan remembers. `companionNotes` is free text she typed and is left
    // out of the backup by default (src/lib/companion/memory.ts). Earlier tables are unchanged.
    this.version(4).stores({
      companionNotes: "++id, at, kind, topicId, source",
      companionState: "id",
    });
    // v5: "Something wrong?" reports, by item (src/lib/db/reports.ts). Earlier tables are unchanged.
    this.version(5).stores({
      reports: "++id, at, itemId",
    });
    // Answers recorded before every item kind earned a review card get theirs on the next open (once per device).
    this.on("ready", (vip) => backfillCards(vip as StudyDB));
  }
}

let _db: StudyDB | null = null;
/** Lazy singleton: only instantiate in the browser. */
export function getDB(): StudyDB {
  if (typeof indexedDB === "undefined") throw new Error("IndexedDB unavailable (SSR)");
  if (!_db) _db = new StudyDB();
  return _db;
}
