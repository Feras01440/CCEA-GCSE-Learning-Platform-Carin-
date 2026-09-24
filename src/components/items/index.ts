/**
 * Item components (master plan §6.4 rows 1–8, 16, 17) and the pure helpers they share.
 * Everything here is a client component; import from "@/components/items".
 */

// Components
export { Tex } from "./Tex";
export { Md, MdInlines } from "./Markdown";
export { Figure, InlineSvg } from "./Figure";
export { AnswerField, KeyStrip, MathsLineInput, insertAtCaret, MATHS_KEYS, PHYSICS_KEYS, CHEM_KEYS } from "./AnswerField";
export type { AnswerFieldProps, StripKey } from "./AnswerField";
export { FeedbackCard, EncouragementCard } from "./FeedbackCard";
export type { FeedbackCardProps, EncouragementCardProps } from "./FeedbackCard";
export { DiagnosticWithConfidence, CONFIDENCE_LEVELS } from "./DiagnosticWithConfidence";
export type { DiagnosticWithConfidenceProps, DiagnosticAnswer, Confidence } from "./DiagnosticWithConfidence";
export { InlinePrompt } from "./InlinePrompt";
export type { InlinePromptProps, PromptGrade, PromptIntervals } from "./InlinePrompt";
export { RecallSprint } from "./RecallSprint";
export type { RecallSprintProps } from "./RecallSprint";
export { WorkedExampleAsQuestion } from "./WorkedExampleAsQuestion";
export type { WorkedExampleAsQuestionProps } from "./WorkedExampleAsQuestion";
export { FindTheMistake } from "./FindTheMistake";
export type { FindTheMistakeProps, FindTheMistakeResult } from "./FindTheMistake";
export { StepRevealNote } from "./StepRevealNote";
export type { StepRevealNoteProps } from "./StepRevealNote";
export { MasteryChip, Stones, stonesFor } from "./MasteryChip";
export type { MasteryChipProps, MasteryLevel } from "./MasteryChip";
export { CheckedPanel, summariseChecks } from "./CheckedPanel";
export type { CheckedPanelProps } from "./CheckedPanel";
export { Tick, MissMark, MarkChip, Rise, Settle, Card, Eyebrow, Letter, MarksLine, btnPrimary, btnSecondary, btnQuiet, btnOption, fieldCls, cardCls } from "./ui";

// Marking and helpers (pure)
export { markAnswer, matchesCommonError } from "./mark";
export type { MarkResult, MarkOptions } from "./mark";
export { markText, markMcq, keywordsPresent, normaliseText, countListedItems } from "./text-marking";
export type { TextMarkResult, McqMarkResult, KeywordCheck, TextSpec, McqSpec } from "./text-marking";
export { markEquation, equationsMatch, normaliseEquation } from "./equation-marking";
export { markOrder, parseArrangement } from "./order-marking";
export { checkPoints, parsePointList, looksLikePointList } from "@/lib/marking/points";
export type { Point, PointSetVerdict, PointReason } from "@/lib/marking/points";
export { qwcEvidence, qwcSuggestedMarks, qwcBandFor, qwcBandRange, qwcSummary, qwcWordCount, QWC_DEFAULT_MIN_WORDS } from "@/lib/marking/qwc";
export type { QwcEvidence, QwcPointEvidence, QwcBand, LongTextSpec } from "@/lib/marking/qwc";
export type { OrderMarkResult, OrderSpec } from "./order-marking";
export type { EquationMarkResult, EquationMatchOptions, EquationSpec } from "./equation-marking";
export { toNumericSpec, toAlgebraSpec, toNumericTolerance, expectedDisplay, isAutoMarkable } from "./spec-map";
export { splitTex, hasTex } from "./tex-split";
export type { TexSegment } from "./tex-split";
export { parseMd, parseInline, mdToPlain } from "./md";
export type { MdBlock, MdInline } from "./md";
export { formatSeries, formatExaminerSource, shortExaminerSource, humaniseMisconception, humaniseKebab, formatMs, relativeTime, optionLetter, formatValue } from "./format";
export { planFade, accuracyOf, nextFade } from "./fade";
export type { FadeLevel, FadePlan, StepRole } from "./fade";
export { createSprint, answerCurrent, currentId, remaining, isFinished, sprintStats, selfCheck } from "./sprint";
export type { SprintCard, SprintState, SprintStats, SelfCheck, SelfCheckVerdict } from "./sprint";
export { visibleBlocks, markGate, gateAlternatives, gateOptions, wordsBetweenGates } from "./gates";
export type { NoteBlock, GateBlock, VisibleNote } from "./gates";
export { fixMatches, firstSentence, lastNumber, finalValue, markFix, sameAsMistakeLine, stepLineMatches, workingLines } from "./mistake-marking";
export type { FixMatch } from "./mistake-marking";
export { seededShuffle, hashSeed } from "./shuffle";
