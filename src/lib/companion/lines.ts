/**
 * Every line Rowan can say, as data.
 *
 * The forty lines of the specification (docs/plan/companion/2026-09-19-companion-spec.md §3) plus the
 * five dry lines the completeness critic asked for. They live in TypeScript, not JSON, so lint.ts runs
 * over all of them at test time and a line that breaks the constitution cannot reach the build.
 *
 * Nothing here hard-codes a date, a time, an answer or a count about her work: every such value is a
 * named slot filled from the exam plan, the item or her own notes (context.ts). The lint proves it.
 *
 * Where the specification's line contradicted the constitution, the line is reworded and the reason is
 * on the entry. `template` is the voice with its place language; `plainTemplate` is the same fact said
 * plainly, and is what she sees while plain mode is on (the first fortnight, by default).
 */

/** Where a line may be said. Moments in UNSIGNED_MOMENTS sit on a study surface and carry no signature. */
export type Moment =
  | "first-letter"
  | "today-open"
  | "evening"
  | "topic-open"
  | "vocab"
  | "correct"
  | "support"
  | "confident-wrong"
  | "three-misses"
  | "answer-given"
  | "recap"
  | "session-close"
  | "paper-eve"
  | "after-paper"
  | "mock-entered"
  | "weekly-letter";

export const MOMENTS: Moment[] = [
  "first-letter",
  "today-open",
  "evening",
  "topic-open",
  "vocab",
  "correct",
  "support",
  "confident-wrong",
  "three-misses",
  "answer-given",
  "recap",
  "session-close",
  "paper-eve",
  "after-paper",
  "mock-entered",
  "weekly-letter",
];

/**
 * Moments that render inside the work. They are unsigned prose in the note's own register: no mark,
 * no `data-companion` attribute, no name. This is how the second-miss support slot obeys both the
 * coherence principle and the rule that Rowan never speaks during a question.
 */
export const UNSIGNED_MOMENTS: ReadonlySet<Moment> = new Set<Moment>([
  "vocab",
  "correct",
  "support",
  "confident-wrong",
  "three-misses",
  "answer-given",
  "recap",
]);

/** The two moments that render as a Letter, and the only two that carry the three-stone mark. */
export const LETTER_MOMENTS: ReadonlySet<Moment> = new Set<Moment>(["first-letter", "weekly-letter"]);

export function isUnsigned(moment: Moment): boolean {
  return UNSIGNED_MOMENTS.has(moment);
}

export function isLetter(moment: Moment): boolean {
  return LETTER_MOMENTS.has(moment);
}

/** Voice principles, §3 of the specification. Carried on every line so the tone can be audited. */
export type Principle = "P1" | "P2" | "P3" | "P4" | "P5" | "P6" | "P7" | "P8";

/** Every value a template may ask for. context.ts fills them; a line whose slots are unfilled is silent. */
export type SlotName =
  // the exam plan
  | "papersLine"
  | "nextPaperUnit"
  | "nextPaperDate"
  | "nextPaperStart"
  | "nextPaperDays"
  | "satPaperUnit"
  | "resumeDay"
  | "trapsMinutes"
  // tonight's work
  | "dueCount"
  | "confidentWrongCount"
  /** Mid-sentence: "later today", "tomorrow", "on Thursday". */
  | "returnWhen"
  /** The front of a sentence: "Tomorrow", "Thursday". */
  | "returnDay"
  | "returningTopics"
  | "recheckWhen"
  | "firstItemTitle"
  | "nextTopicTitle"
  // the topic in front of her
  | "topicTitle"
  | "sectionNumber"
  | "unit"
  | "stonePhrase"
  // what the week held
  | "sessionCount"
  | "returnCount"
  | "itemCount"
  | "provedCount"
  // her own words
  | "herNote"
  | "herNoteTopic"
  | "taughtLine"
  | "intendedDay"
  // the item in front of her
  | "answerText"
  | "methodLine"
  | "whyHard"
  | "recapAsk"
  | "evidenceSeries"
  | "evidenceFinding"
  // a school mock she entered
  | "mockUnit"
  | "mockReturnsCount"
  | "mockReturnsWhen";

export const SLOT_NAMES: SlotName[] = [
  "papersLine", "nextPaperUnit", "nextPaperDate", "nextPaperStart", "nextPaperDays", "satPaperUnit", "resumeDay", "trapsMinutes",
  "dueCount", "confidentWrongCount", "returnWhen", "returnDay", "returningTopics", "recheckWhen", "firstItemTitle", "nextTopicTitle",
  "topicTitle", "sectionNumber", "unit", "stonePhrase",
  "sessionCount", "returnCount", "itemCount", "provedCount",
  "herNote", "herNoteTopic", "taughtLine", "intendedDay",
  "answerText", "methodLine", "whyHard", "recapAsk", "evidenceSeries", "evidenceFinding",
  "mockUnit", "mockReturnsCount", "mockReturnsWhen",
];

/**
 * Slots that quote her. A line declaring one of these is eligible only when the value came from a
 * companionNote with `source: "her"`, which is the mechanism behind "it quotes only what she typed".
 */
export const QUOTED_SLOTS: ReadonlySet<SlotName> = new Set<SlotName>(["herNote", "taughtLine", "intendedDay"]);

/** Conditions a line can ask of the context. All must hold; `notFlags` must all be false. */
export type Flag =
  | "hasDue"
  | "noDue"
  | "confidentWrongPending"
  | "hasHerNote"
  | "hasTaughtLine"
  | "hasIntention"
  | "firstVisitToTopic"
  | "resumable"
  | "reviserPath"
  | "stonePlaced"
  | "isLate"
  | "paperEve"
  | "afterPaper"
  | "mockEntered"
  /** A mock is filed and nothing from its unit is due back inside the coming week. */
  | "mockNothingSoon"
  | "askedAboutNerves"
  | "hasEvidence"
  /** The part in front of her has a method mark in its scheme. */
  | "hasMethodMark"
  | "unitsInAnswer"
  | "scienceDue"
  | "topicIsSly"
  | "topicTitleShort"
  | "firstLetterDue"
  /** The Letter is owed and today is its first day: it goes first, and the other signed lines wait. */
  | "letterGoesFirst";

export const FLAGS: Flag[] = [
  "hasDue", "noDue", "confidentWrongPending", "hasHerNote", "hasTaughtLine", "hasIntention",
  "firstVisitToTopic", "resumable", "reviserPath", "stonePlaced", "isLate", "paperEve", "afterPaper",
  "mockEntered", "mockNothingSoon", "askedAboutNerves", "hasEvidence", "hasMethodMark", "unitsInAnswer", "scienceDue",
  "topicIsSly", "topicTitleShort", "firstLetterDue", "letterGoesFirst",
];

export interface CompanionLineSpec {
  /** Stable id. Used by the fourteen-day cooldown, so never renumber one in place. */
  id: string;
  moment: Moment;
  /** The line, with `{slot}` placeholders. Every placeholder must also appear in `requires`. */
  template: string;
  /** The same fact without the place language. Shown while plain mode is on. */
  plainTemplate?: string;
  /**
   * Days before the line may be said again; the fourteen-day default otherwise. Only for a line that
   * states where she is (the section she stopped at) or what just happened (the paper she has just filed),
   * which is information she needs each time it is true. A line with a voice keeps the default, so it is
   * never heard twice in a fortnight.
   */
  cooldownDays?: number;
  principle: Principle;
  /** Slots the template needs. The line is silent unless the context can fill all of them. */
  requires: SlotName[];
  /** Context conditions that must all be true. */
  flags?: Flag[];
  /**
   * How the line ranks against the others at its moment, when its flags do not say it: 3 quotes her, 2 is
   * specific to the moment, 1 is general. Set only where a flag merely keeps the line true (close.done
   * needs nothing to be due) rather than making it the thing to say, so a placed stone still comes first.
   */
  rank?: 1 | 2 | 3;
  /** Context conditions that must all be false. */
  notFlags?: Flag[];
  /** Slots that quote her own words. Eligible only when the value came from a note she wrote. */
  quotes?: SlotName[];
  /**
   * Number words the template contains on purpose, because they state a rule of the product
   * ("a gate is one question", "two goes is enough") or are the pronoun "one". Never her data:
   * the lint refuses anything outside ALLOWED_FIXED_COUNTS and refuses digits outright.
   */
  fixedCounts?: string[];
  /** Carries the hills and the path. Excluded in plain mode unless a plainTemplate stands in. */
  place?: boolean;
  /** Carries Ulster dialect ("wee", "Grand"). Excluded in plain mode unless a plainTemplate stands in. */
  dialect?: boolean;
  /** Why this line differs from the specification's wording, when it does. */
  note?: string;
}

export const LINES: CompanionLineSpec[] = [
  // ---------------------------------------------------------------- the first Letter (spec 1-3)
  {
    id: "fl.keeper",
    moment: "first-letter",
    template: "I keep the path: the dates of your papers, and what comes back when. You do the maths.",
    plainTemplate: "I keep the dates of your papers and what comes back when. You do the maths.",
    principle: "P7",
    requires: [],
    place: true,
    note:
      "Spec line 1 promised 'the notes left at each cairn', but nothing in the app lets her leave one yet; " +
      "a line about itself has to be true on the day she reads it (P7), so it says only what it keeps now.",
  },
  {
    id: "fl.papers",
    moment: "first-letter",
    template: "Your papers are in: {papersLine}. Everything here counts back from those.",
    principle: "P1",
    requires: ["papersLine"],
    note: "Spec line 2 hard-coded 'M4 on the 14th at 9.15'; the dates come from exam-plan now.",
  },
  {
    id: "fl.nothing-to-set-up",
    moment: "first-letter",
    template: "Nothing to set up. {nextTopicTitle} is open, and the note teaches before it asks.",
    principle: "P3",
    requires: ["nextTopicTitle"],
  },

  // ---------------------------------------------------------------- the words, where they first occur (spec 4-5)
  {
    id: "vocab.gate",
    moment: "vocab",
    template: "A gate is one question at the end of a section. Yes or Not quite; no score.",
    principle: "P7",
    requires: [],
    fixedCounts: ["one"],
  },
  {
    id: "vocab.proficient",
    moment: "vocab",
    template: "Proficient means proved in a later mixed set. That is when a stone goes on.",
    principle: "P1",
    requires: [],
  },

  // ---------------------------------------------------------------- arrival (spec 6-10)
  {
    id: "today.back-tonight",
    moment: "today-open",
    template: "{dueCount} back tonight. {confidentWrongCount} are the ones you were sure about.",
    principle: "P1",
    requires: ["dueCount", "confidentWrongCount"],
    flags: ["hasDue", "confidentWrongPending"],
    cooldownDays: 1,
    note:
      "Tonight's facts, different each night, so it waits a day rather than a fortnight: with the fourteen-day " +
      "cooldown on every arrival line Today went quiet from the second evening (the audit's must-fix 2, 23 Sep). " +
      "It could never be said before 23 Sep: the capitalised count failed the rendered lint.",
  },
  {
    id: "today.first-up",
    moment: "today-open",
    template: "First up tonight: {firstItemTitle}.",
    principle: "P1",
    requires: ["firstItemTitle"],
    flags: ["hasDue"],
    cooldownDays: 1,
    note:
      "Says what the tile does not: which topic the review inbox puts first (live.ts orders tonight's cards with " +
      "the inbox's own pickQueue). The count is on the tile already, so it is not said twice. Tonight's fact, so it " +
      "waits a day.",
  },
  {
    id: "today.you-said",
    moment: "today-open",
    template: "{intendedDay}, you said. First up is {firstItemTitle}.",
    principle: "P1",
    requires: ["intendedDay", "firstItemTitle"],
    flags: ["hasIntention", "hasDue"],
    quotes: ["intendedDay"],
  },
  {
    id: "today.nothing-back",
    moment: "today-open",
    template: "{nextTopicTitle} is open if you want new ground.",
    plainTemplate: "{nextTopicTitle} is open if you want something new.",
    principle: "P3",
    requires: ["nextTopicTitle"],
    flags: ["noDue"],
    place: true,
    cooldownDays: 1,
    note:
      "Tonight's fact, so it waits a day, not a fortnight: the audit asked for it every night nothing is due. It used to " +
      "open with 'Nothing back tonight.', the very sentence the Tonight tile's headline prints above it (seen 24 Sep): " +
      "the tile states the fact, Rowan says what is open (tonight-copy.test.ts holds every Today line to that).",
  },
  {
    id: "today.days-then-note",
    moment: "today-open",
    template: "{nextPaperUnit} is {nextPaperDays} away. Tonight is reviews, then the question you left a note on.",
    principle: "P1",
    requires: ["nextPaperUnit", "nextPaperDays"],
    flags: ["hasDue", "hasHerNote"],
  },
  {
    id: "today.quote-note",
    moment: "today-open",
    template: "You left a line at {herNoteTopic}: ‘{herNote}’. It is still true.",
    principle: "P1",
    requires: ["herNoteTopic", "herNote"],
    flags: ["hasHerNote"],
    quotes: ["herNote"],
  },

  // ---------------------------------------------------------------- topic open (spec 11-13)
  {
    id: "topic.new-ground",
    moment: "topic-open",
    template: "New ground. The note teaches before it asks, and nothing in it is scored.",
    plainTemplate: "This is new. The note teaches before it asks, and nothing in it is scored.",
    principle: "P3",
    requires: [],
    flags: ["firstVisitToTopic"],
    place: true,
    note:
      "'New ground' is the walking phrase today.nothing-back already treats as place language, so it has a plain " +
      "wording. Spec line 11's 'nothing here is a test' became 'nothing in it is scored': the page's practice is " +
      "marked, the note's checks are not.",
  },
  {
    id: "topic.first-checks",
    moment: "topic-open",
    template: "First time here. Each check is one question, and the note waits for your answer.",
    principle: "P7",
    requires: [],
    flags: ["firstVisitToTopic"],
    fixedCounts: ["one"],
    note: "How the note works, said once: a gate is a single question and the next section opens on her answer.",
  },
  {
    id: "topic.first-stone-later",
    moment: "topic-open",
    template: "A first go is for understanding. The stone comes later, when it is proved in a mixed set.",
    principle: "P1",
    requires: [],
    flags: ["firstVisitToTopic"],
    note: "How a stone is earned, said where she starts rather than where she might feel she has fallen short.",
  },
  {
    id: "topic.no-clock",
    moment: "topic-open",
    template: "There is no clock on the note. Read it at your own pace; the checks will wait.",
    principle: "P3",
    requires: [],
    flags: ["firstVisitToTopic"],
  },
  {
    id: "topic.first-kept",
    moment: "topic-open",
    template: "Every check you answer here keeps your place, so you can stop at any section.",
    principle: "P8",
    requires: [],
    flags: ["firstVisitToTopic"],
    rank: 1,
    cooldownDays: 0,
    note:
      "The first visit's fallback: ranked below the four above, so it is said only when all four have been heard " +
      "this fortnight, and with no cooldown, so no first visit is silent. It is the one thing worth hearing every " +
      "time: that stopping costs nothing. True because the note restores the gates she answered (TopicContent " +
      "passes them to StepRevealNote) and the hero names the section she stopped at.",
  },
  {
    id: "topic.resume",
    moment: "topic-open",
    template: "Section {sectionNumber} is where you stopped. Start there.",
    principle: "P1",
    requires: ["sectionNumber"],
    flags: ["resumable"],
    cooldownDays: 1,
    note: "Information, not a remark: it is said once a day, whichever topic she resumes.",
  },
  {
    id: "topic.reviser-order",
    moment: "topic-open",
    template: "Sheet first, then a short check, then the twins.",
    principle: "P3",
    requires: [],
    flags: ["reviserPath"],
  },

  // ---------------------------------------------------------------- a correct answer (spec 14-16)
  {
    id: "correct.method-too",
    moment: "correct",
    template: "Yes. {methodLine}, and that is where the method mark sits.",
    principle: "P2",
    requires: ["methodLine"],
  },
  {
    id: "correct.rushed-line",
    moment: "correct",
    template: "That is the line the examiners said most candidates rushed. You did not.",
    principle: "P2",
    requires: [],
    flags: ["hasEvidence"],
  },
  {
    id: "correct.working-there",
    moment: "correct",
    template: "Right, and the working is there, so the method mark is too.",
    principle: "P2",
    requires: [],
  },

  // ---------------------------------------------------------------- the second miss (spec 17-19)
  {
    id: "support.catches-most",
    moment: "support",
    template: "That one catches plenty of candidates. The method mark lives in the working, not the answer.",
    principle: "P5",
    requires: [],
    flags: ["hasEvidence", "hasMethodMark"],
    fixedCounts: ["one"],
    note:
      "Found on the dev server, 22 Sep: it said 'catches most candidates' and 'the line you skipped' on a " +
      "labelling question with no method mark and no examiner evidence. Both halves now need their fact: the " +
      "examiners' evidence on the item, and a method mark in its scheme.",
  },
  {
    id: "support.method-mark",
    moment: "support",
    template: "The method mark sits in the working. Write the first step down, even if the answer is not there yet.",
    principle: "P5",
    requires: [],
    flags: ["hasMethodMark"],
    note: "Only where the part's scheme has an M line: showing the step is how that mark is earned.",
  },
  {
    id: "support.two-goes",
    moment: "support",
    template: "Two goes is enough. A hint, or the whole thing worked; you choose.",
    principle: "P3",
    requires: [],
    fixedCounts: ["two"],
  },
  {
    id: "support.units",
    moment: "support",
    template: "Shall we check the units before anything else?",
    principle: "P3",
    requires: [],
    flags: ["unitsInAnswer"],
  },

  // ---------------------------------------------------------------- sure and not right (spec 20-22)
  {
    id: "cw.worth-a-minute",
    moment: "confident-wrong",
    template: "Not quite, and you were sure, so this one is worth a minute. It comes back {returnWhen}.",
    principle: "P5",
    requires: ["returnWhen"],
    fixedCounts: ["one"],
    note:
      "Not wired yet (M4). `returnWhen` is the next return of any card; whoever wires this moment must fill it " +
      "from this item's own card, or 'It comes back' names the wrong day.",
  },
  {
    id: "cw.series-finding",
    moment: "confident-wrong",
    template: "{evidenceSeries}, this question: {evidenceFinding}.",
    principle: "P1",
    requires: ["evidenceSeries", "evidenceFinding"],
    flags: ["hasEvidence"],
  },
  {
    id: "cw.useful-kind",
    moment: "confident-wrong",
    template: "Sure and not right is the useful kind. Have a look at where it went.",
    principle: "P5",
    requires: [],
  },

  // ---------------------------------------------------------------- three misses (spec 23-25)
  {
    id: "three.stop-asking",
    moment: "three-misses",
    template: "That is enough asking. Here is the whole thing worked, then a twin.",
    principle: "P3",
    requires: [],
    note: "Spec line 23 counted her misses out loud; counts of her misses are not stored or said.",
  },
  {
    id: "three.why-hard",
    moment: "three-misses",
    template: "This section is hard for a reason: {whyHard}.",
    principle: "P5",
    requires: ["whyHard"],
  },
  {
    id: "three.first-line",
    moment: "three-misses",
    template: "Read it once, then tell me the first line yourself.",
    principle: "P3",
    requires: [],
  },

  // ---------------------------------------------------------------- she asked for the answer (spec 26-27)
  {
    id: "answer.here-it-is",
    moment: "answer-given",
    template: "Here it is: {answerText}. The method mark sits in the working, not in the answer.",
    principle: "P5",
    requires: ["answerText"],
    note: "Spec line 26 hard-coded '15.4 cm cubed'; the answer comes from the item.",
  },
  {
    id: "answer.comes-back",
    moment: "answer-given",
    template: "It comes back {returnWhen} without the answer. That is the deal.",
    plainTemplate: "It comes back {returnWhen} without the answer.",
    principle: "P7",
    requires: ["returnWhen"],
    dialect: true,
    note: "Not wired yet (M4). As cw.worth-a-minute: fill `returnWhen` from this item's own card when it is.",
  },

  // ---------------------------------------------------------------- explain it back (spec 28)
  {
    id: "recap.explain-back",
    moment: "recap",
    template: "Tell me why {recapAsk}, in one line. I will hand it back when this returns.",
    principle: "P2",
    requires: ["recapAsk"],
    fixedCounts: ["one"],
  },
  {
    id: "recap.own-words",
    moment: "recap",
    template: "Say why {recapAsk} in your own words. It becomes the first hint when this comes back.",
    principle: "P2",
    requires: ["recapAsk"],
    note: "The taught line returns as the first hint, so explaining it back has a visible consequence.",
  },

  // ---------------------------------------------------------------- the close (spec 29-32)
  {
    id: "close.stone",
    moment: "session-close",
    template: "{topicTitle}: proved, and {stonePhrase} on the {unit} cairn.",
    plainTemplate: "{topicTitle}: proved, and {stonePhrase} on {unit}.",
    principle: "P1",
    requires: ["topicTitle", "stonePhrase", "unit"],
    flags: ["stonePlaced"],
    place: true,
  },
  {
    id: "close.returns",
    moment: "session-close",
    template: "{returnDay} brings back {returningTopics}. Nothing else until then.",
    principle: "P1",
    requires: ["returnDay", "returningTopics"],
    note: "The bare day at the front of the sentence ('Thursday brings back'); mid-sentence days say 'on Thursday'.",
  },
  {
    id: "close.sessions-and-returns",
    moment: "session-close",
    template: "{sessionCount} sessions and {returnCount} returns on {topicTitle}. It comes back {recheckWhen}.",
    principle: "P1",
    requires: ["sessionCount", "returnCount", "topicTitle", "recheckWhen"],
    note: "Spec line 31 ended 'which is about what it takes', a comparison with other candidates.",
  },
  {
    id: "close.done",
    moment: "session-close",
    template: "Done for tonight. There is nothing else to do.",
    principle: "P8",
    requires: [],
    flags: ["noDue"],
    rank: 1,
    note: "Only when nothing is due: with reviews still waiting, 'nothing else to do' would not be true.",
  },
  {
    id: "close.can-stop",
    moment: "session-close",
    template: "You can stop here. Whatever is still due will keep until tomorrow.",
    principle: "P8",
    requires: [],
    flags: ["hasDue"],
    rank: 1,
    note: "The close when reviews are still waiting: permission to stop, never a request to stay.",
  },

  // ---------------------------------------------------------------- late, and present (spec 33-34)
  {
    id: "evening.one-to-finish",
    moment: "evening",
    template: "It is late. One wee one to finish on is plenty.",
    plainTemplate: "It is late. One short one to finish on is plenty.",
    principle: "P6",
    requires: [],
    flags: ["isLate"],
    fixedCounts: ["one"],
    dialect: true,
    note:
      "Lateness is only ever said while she is here. It is never inferred from absence and no hour is named. " +
      "Said on arrival (the Today slot tries `evening` first), so the plain wording keeps the meaning of 'one wee " +
      "one to finish on'; it used to say 'Finish the one you are on', which is wrong before she has started.",
  },
  {
    id: "evening.will-keep",
    moment: "evening",
    template: "Whatever is due can be tomorrow’s. It will keep.",
    principle: "P8",
    requires: [],
    flags: ["isLate", "hasDue"],
    note: "Spec line 34 said 'This one', which has nothing to point at on arrival; it now names what can wait.",
  },
  {
    id: "evening.nothing-new",
    moment: "evening",
    template: "It is late and nothing is due. Anything new will keep for tomorrow.",
    principle: "P8",
    requires: [],
    flags: ["isLate", "noDue"],
  },

  // ---------------------------------------------------------------- paper eve (spec 35-37)
  {
    id: "eve.logistics",
    moment: "paper-eve",
    template: "{nextPaperUnit} is at {nextPaperStart}. Nothing new tonight; {trapsMinutes} minutes on the traps sheet, then your bag.",
    principle: "P5",
    requires: ["nextPaperUnit", "nextPaperStart", "trapsMinutes"],
    flags: ["paperEve"],
  },
  {
    id: "eve.fast-heart",
    moment: "paper-eve",
    template: "A fast heart before a paper is the body getting ready. It is not a verdict.",
    principle: "P5",
    requires: [],
    flags: ["paperEve", "askedAboutNerves"],
    note: "Gated on her asking, per the critic: never fired at her unsolicited.",
  },
  {
    id: "eve.kit",
    moment: "paper-eve",
    template: "Calculator, two pens, ruler. The formula sheet is given.",
    principle: "P1",
    requires: [],
    flags: ["paperEve"],
    fixedCounts: ["two"],
  },

  // ---------------------------------------------------------------- after a paper (spec 38-39)
  {
    id: "after.that-is-done",
    moment: "after-paper",
    template: "{satPaperUnit} done, and that is grand. Nothing here today unless you want it.",
    plainTemplate: "That is {satPaperUnit} done. Nothing here today unless you want it.",
    principle: "P6",
    requires: ["satPaperUnit"],
    flags: ["afterPaper"],
    dialect: true,
  },
  {
    id: "after.next-summit",
    moment: "after-paper",
    template: "{nextPaperUnit} is in {nextPaperDays}. We start {resumeDay}, not tonight.",
    principle: "P8",
    requires: ["nextPaperUnit", "nextPaperDays", "resumeDay"],
    flags: ["afterPaper"],
  },

  // ---------------------------------------------------------------- the Sunday letter (spec 40)
  {
    id: "sunday.week",
    moment: "weekly-letter",
    template: "{sessionCount} sessions, {itemCount} items, {provedCount} proved. {nextPaperUnit} is {nextPaperDays} away.",
    principle: "P1",
    requires: ["sessionCount", "itemCount", "provedCount", "nextPaperUnit", "nextPaperDays"],
  },
  {
    id: "sunday.returns",
    moment: "weekly-letter",
    template: "{provedCount} proved this week, and {returningTopics} come back. Nothing to do now.",
    principle: "P1",
    requires: ["provedCount", "returningTopics"],
    note: "The week said as what returns rather than as a score, which is how the framing flips later on.",
  },
  {
    id: "sunday.returns-only",
    moment: "weekly-letter",
    template: "{returningTopics} come back this week. Nothing to do now.",
    principle: "P1",
    requires: ["returningTopics"],
    note: "The whole of a week with nothing in it: what returns, and no remark about the week itself.",
  },

  // ---------------------------------------------------------------- a school mock, entered (critic)
  {
    id: "mock.entered",
    moment: "mock-entered",
    template: "{mockUnit} is filed. Due back from that unit over the next week: {mockReturnsCount}, the first {mockReturnsWhen}.",
    principle: "P1",
    requires: ["mockUnit", "mockReturnsCount", "mockReturnsWhen"],
    flags: ["mockEntered"],
    cooldownDays: 0,
    note:
      "Silent on the mark itself. No consolation, no verdict; the UMS dial is hers to open. It used to say the " +
      "returning items came 'from it' (the mock), but they are that unit's review cards: the line now says so. " +
      "Information about the paper she has just filed, different each time, so it has no cooldown: two papers " +
      "filed on one evening each get their line.",
  },
  {
    id: "mock.quiet-week",
    moment: "mock-entered",
    template: "{mockUnit} is filed. Nothing from that unit is due back in the next week, so tonight is unchanged.",
    principle: "P8",
    requires: ["mockUnit"],
    flags: ["mockEntered", "mockNothingSoon"],
    cooldownDays: 0,
    note:
      "Replaces 'What it found comes back', which was not true: a filed paper makes no review cards. Filing a " +
      "paper changes nothing on Today, and this says so.",
  },

  // ---------------------------------------------------------------- the five dry lines (critic)
  {
    id: "dry.not-me",
    moment: "session-close",
    template: "I was never the one doing the maths. That was you.",
    principle: "P7",
    requires: [],
    fixedCounts: ["one"],
    note: "Dry line 1 of 5, and the third disclosure beat. Aimed at itself.",
  },
  {
    id: "dry.booklet-b",
    moment: "today-open",
    template: "Booklet B is where science candidates hand marks back. That is the whole secret.",
    principle: "P1",
    requires: [],
    flags: ["scienceDue"],
    note: "Dry line 2 of 5. Aimed at the paper.",
  },
  {
    id: "dry.sly",
    moment: "topic-open",
    template: "{topicTitle} is not difficult. It is sly, which is worse.",
    principle: "P1",
    requires: ["topicTitle"],
    flags: ["topicIsSly", "topicTitleShort"],
    note: "Dry line 3 of 5. Fires only on a topic the examiners flagged, and only when its title is said in one breath.",
  },
  {
    id: "dry.specific",
    moment: "session-close",
    template: "The paper is not out to trick anyone. It is only ever specific.",
    principle: "P7",
    requires: [],
    note: "Dry line 4 of 5. Aimed at the paper.",
  },
  {
    id: "dry.arrangement",
    moment: "today-open",
    template: "I have opinions about the papers and none about you. That is the arrangement.",
    principle: "P7",
    requires: [],
    note: "Dry line 5 of 5. Aimed at itself, and states the boundary out loud.",
  },
];

export function linesFor(moment: Moment): CompanionLineSpec[] {
  return LINES.filter((l) => l.moment === moment);
}

export function lineById(id: string): CompanionLineSpec | undefined {
  return LINES.find((l) => l.id === id);
}

/** Placeholders a template asks for, in order of first appearance. */
export function placeholdersIn(template: string): string[] {
  const out: string[] = [];
  for (const m of template.matchAll(/\{([a-zA-Z]+)\}/g)) if (!out.includes(m[1])) out.push(m[1]);
  return out;
}

/** The template that applies: the plain one while plain mode is on, when the line has one. */
export function templateFor(line: CompanionLineSpec, plainMode: boolean): string | null {
  if (!plainMode) return line.template;
  if (line.plainTemplate) return line.plainTemplate;
  return line.place || line.dialect ? null : line.template;
}
