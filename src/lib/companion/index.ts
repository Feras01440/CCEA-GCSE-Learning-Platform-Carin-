/**
 * Rowan, keeper of the path: the whole public surface of the companion.
 *
 * Nothing outside src/lib/companion and src/components/companion should import from a file inside
 * this folder directly; the contract in docs/plan/companion/integration-contract.md is written
 * against these exports and the slot table in select.ts.
 */

export {
  LINES,
  MOMENTS,
  SLOT_NAMES,
  FLAGS,
  QUOTED_SLOTS,
  UNSIGNED_MOMENTS,
  LETTER_MOMENTS,
  isUnsigned,
  isLetter,
  linesFor,
  lineById,
  placeholdersIn,
  templateFor,
  type CompanionLineSpec,
  type Flag,
  type Moment,
  type Principle,
  type SlotName,
} from "./lines";

export {
  ALLOWED_FIXED_COUNTS,
  BANNED_PHRASES,
  BANNED_WORDS,
  DIALECT_PHRASES,
  DIALECT_WORDS,
  MAX_CHARS,
  MAX_SENTENCES,
  NUMBER_WORDS,
  PLACE_PHRASES,
  PLACE_WORDS,
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
  type LintFinding,
  type LintRule,
} from "./lint";

export {
  buildCompanionContext,
  dayNameWithin,
  daysPhrase,
  joinWords,
  lateNow,
  numberWord,
  shortDate,
  stonesPhrase,
  whenPhrase,
  type CompanionContext,
  type CompanionInput,
  type ItemContextInput,
  type MockContextInput,
  type TopicContextInput,
} from "./context";

export {
  SLOTS,
  SLOT_IDS,
  candidatesFor,
  momentsFor,
  renderTemplate,
  select,
  selectAt,
  selectDetailed,
  selectForSlot,
  selectLetter,
  type SelectResult,
  type Selection,
  type SilenceReason,
  type SlotId,
  type SlotSpec,
} from "./select";

export {
  COMPANION_STATE_ID,
  COMPANION_TABLES,
  DEFAULT_ROWAN_NAME,
  EXPORT_NOTES_SETTING,
  PLAIN_MODE_DAYS,
  PRIVATE_COMPANION_TABLES,
  REPEAT_COOLDOWN_DAYS,
  addNote,
  companionExportExclusions,
  deleteNote,
  forgetEverything,
  freshState,
  getCompanionState,
  isPlainMode,
  listNotes,
  markLetterOffered,
  markLetterSeen,
  noteLineShown,
  notesForTopic,
  plainWords,
  presenceOf,
  pruneRecent,
  rowanName,
  setPlainMode,
  setPresence,
  setRowanName,
  setSilenced,
  todayISOFrom,
  updateCompanionState,
  usedRecently,
  type CompanionNote,
  type CompanionPresence,
  type CompanionState,
  type NoteKind,
  type NoteSource,
  type PlainWords,
  type ShownLine,
} from "./memory";

export { describePresence, describeVoice, letterEyebrow, sealedLetterPreview, type PresenceCopy, type VoiceCopy } from "./voice";

export {
  FIGURE_SLOTS,
  FIGURE_SLOT_NAMES,
  FIGURE_STATES,
  MARK_SIZE,
  MOMENT_FIGURE,
  figureExpressionFor,
  figureStateFor,
  type FigureExpression,
  type FigureSlot,
  type FigureState,
} from "./figure";

export { readCompanionState, rememberLineShown, useCompanionContext, useCompanionPresence } from "./live";
