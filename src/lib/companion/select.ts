/**
 * Which line, if any.
 *
 * Pure. Given a context and a moment it returns at most one line, and silence is always an allowed
 * answer: when nothing fits, nothing is said. The order of the checks is the order of the promises.
 *
 *   1. silenced          she turned the voice off; nothing speaks, anywhere
 *   2. first run         the install has not been through first run; nothing speaks before it
 *   3. the brother       his note is on this screen, so Rowan yields
 *   4. the work          an answer field or grading buttons are up, so nothing signed renders
 *   5. the Letter        on the day the first Letter is first offered, and until she reads it, it goes
 *                        first: the other signed lines wait. From the next day they speak regardless.
 *   6. plain mode        the place language is off, so a line without a plain wording is skipped, and a
 *                        rendered line that would still carry the hills or the dialect is dropped
 *   7. the facts         a line whose slots the context cannot fill is skipped
 *   8. her words         a line that quotes her is skipped unless the quote came from a note she wrote
 *   9. the cooldown      a line used inside fourteen days is skipped, and silence is the fallback
 *  10. the constitution  the rendered line is linted, and a failure is silence, never a substitute
 *
 * Ranking, once a line is eligible: one that quotes her beats one tied to the moment, which beats a
 * generic one. Ties break on a hash of the line id and the date, so the choice is stable through a
 * render but varies from day to day.
 */

import type { CompanionContext } from "./context";
import { lintRendered, plainLeaks, type LintFinding } from "./lint";
import {
  LINES,
  isLetter,
  isUnsigned,
  linesFor,
  placeholdersIn,
  templateFor,
  type CompanionLineSpec,
  type Moment,
  type SlotName,
} from "./lines";
import { REPEAT_COOLDOWN_DAYS, usedRecently } from "./memory";

export interface Selection {
  line: CompanionLineSpec;
  moment: Moment;
  /** The finished line, ready to render. */
  text: string;
  /** The values that filled it, for the rendered lint and for tests. */
  values: Record<string, string>;
  /** Renders in the note's own register: no mark, no name, no `data-companion` attribute. */
  unsigned: boolean;
  /** Renders as a Letter, with the hare holding it beside the note. */
  letter: boolean;
}

/** The surfaces the peer session wires. Slot id to component, and which moments it may carry. */
export type SlotId =
  | "today-open"
  | "first-letter"
  | "topic-open"
  | "session-close"
  | "support"
  | "mock-entered"
  | "settings-memory"
  | "map-place";

export interface SlotSpec {
  slot: SlotId;
  component: "CompanionLine" | "CompanionLetter" | "CompanionMemory" | "RowanMark";
  file: string;
  /** Tried in order; the first moment with an eligible line wins. Empty means the slot says nothing. */
  moments: Moment[];
  unsigned: boolean;
  /** The props the peer passes, echoed verbatim in the integration contract's slot table. */
  props: string;
}

export const SLOTS: Record<SlotId, SlotSpec> = {
  "today-open": {
    slot: "today-open",
    component: "CompanionLine",
    file: "src/components/companion/CompanionLine.tsx",
    moments: ["evening", "today-open"],
    unsigned: false,
    props: "{ moment, context, onShown? }",
  },
  "first-letter": {
    slot: "first-letter",
    component: "CompanionLetter",
    file: "src/components/companion/CompanionLetter.tsx",
    moments: ["first-letter"],
    unsigned: false,
    props: "{ moment, context, onRename?, onRead?, sealed?, preview?, children? }",
  },
  "topic-open": {
    slot: "topic-open",
    component: "CompanionLine",
    file: "src/components/companion/CompanionLine.tsx",
    moments: ["topic-open"],
    unsigned: false,
    props: "{ moment, context, onShown? }",
  },
  "session-close": {
    slot: "session-close",
    component: "CompanionLine",
    file: "src/components/companion/CompanionLine.tsx",
    moments: ["session-close"],
    unsigned: false,
    props: "{ moment, context, onShown? }",
  },
  support: {
    slot: "support",
    component: "CompanionLine",
    file: "src/components/companion/CompanionLine.tsx",
    moments: ["support"],
    unsigned: true,
    props: "{ moment, context, onShown? }",
  },
  "mock-entered": {
    slot: "mock-entered",
    component: "CompanionLine",
    file: "src/components/companion/CompanionLine.tsx",
    moments: ["mock-entered"],
    unsigned: false,
    props: "{ moment, context, onShown? }",
  },
  "settings-memory": {
    slot: "settings-memory",
    component: "CompanionMemory",
    file: "src/components/companion/CompanionMemory.tsx",
    moments: [],
    unsigned: false,
    props: "{ notes?, onDelete?, onForget?, className? }",
  },
  "map-place": {
    slot: "map-place",
    component: "RowanMark",
    file: "src/components/companion/RowanMark.tsx",
    moments: [],
    unsigned: false,
    props: "{ size?, className? }",
  },
};

export const SLOT_IDS = Object.keys(SLOTS) as SlotId[];

/**
 * Fills `{slot}` placeholders. A value that opens a sentence of the template ("{dueCount} back tonight.
 * {confidentWrongCount} are the ones…") gets a capital; anywhere else it is set exactly as supplied, so a
 * quotation of her words is never altered. Null when a value is missing.
 */
export function renderTemplate(
  template: string,
  slots: Partial<Record<SlotName, string>>,
): { text: string; values: Record<string, string> } | null {
  const values: Record<string, string> = {};
  for (const name of placeholdersIn(template)) {
    const value = slots[name as SlotName];
    if (value == null || value === "") return null;
    values[name] = value;
  }
  const text = template.replace(/\{([a-zA-Z]+)\}/g, (_match, name: string, offset: number) => {
    const value = values[name];
    const opensSentence = offset === 0 || /[.?]\s+$/.test(template.slice(0, offset));
    return opensSentence ? value.charAt(0).toUpperCase() + value.slice(1) : value;
  });
  return { text: text.charAt(0).toUpperCase() + text.slice(1), values };
}

/** Deterministic, so the same context renders the same line through a re-render. */
function hash(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function conditionsHold(line: CompanionLineSpec, ctx: CompanionContext): boolean {
  for (const f of line.flags ?? []) if (!ctx.flags[f]) return false;
  for (const f of line.notFlags ?? []) if (ctx.flags[f]) return false;
  for (const q of line.quotes ?? []) if (!ctx.quotedSlots.includes(q)) return false;
  return true;
}

function rank(line: CompanionLineSpec): number {
  if (line.rank) return line.rank;
  if ((line.quotes ?? []).length) return 3;
  if ((line.flags ?? []).length) return 2;
  return 1;
}

/** Why a moment is silent, for tests and for the gallery. Never shown to her. */
export type SilenceReason =
  | "silenced"
  | "first-run"
  | "gift-note"
  | "during-a-question"
  | "letter-first"
  | "no-eligible-line";

/**
 * The moments a surface's line tries, in order. Today's arrival slot tries the late-evening lines first
 * (SLOTS["today-open"]), so the component that renders `today-open` is also the one that says it is late;
 * every other moment is only itself.
 */
export function momentsFor(moment: Moment): Moment[] {
  return moment === "today-open" ? SLOTS["today-open"].moments : [moment];
}

/** A line rendered from a template, checked against the constitution and, in plain mode, for leaks. */
function rendered(line: CompanionLineSpec, ctx: CompanionContext, rejected: LintFinding[]): { text: string; values: Record<string, string> } | null {
  const template = templateFor(line, ctx.plainMode);
  if (!template) return null;
  const out = renderTemplate(template, ctx.slots);
  if (!out) return null;
  const findings = lintRendered(line.id, out.text, out.values, line.fixedCounts ?? []);
  if (ctx.plainMode) {
    for (const w of plainLeaks(out.text, out.values)) {
      findings.push({ lineId: line.id, rule: "plain-leak", detail: `rendered in plain mode with “${w}”` });
    }
  }
  if (findings.length) {
    rejected.push(...findings);
    return null;
  }
  return out;
}

export interface SelectResult {
  selection: Selection | null;
  reason: SilenceReason | null;
  /** Lines that were dropped because the rendered text failed the constitution. */
  rejected: LintFinding[];
}

/** The full answer, with the reason for silence. `select` is the thin wrapper over it. */
export function selectDetailed(moment: Moment, ctx: CompanionContext): SelectResult {
  const rejected: LintFinding[] = [];
  if (ctx.silenced) return { selection: null, reason: "silenced", rejected };
  // Today renders for a moment on a new device before it sends her to first run: nothing is spent there.
  if (!ctx.firstRunDone) return { selection: null, reason: "first-run", rejected };
  if (ctx.giftNoteOnScreen) return { selection: null, reason: "gift-note", rejected };
  if (ctx.questionVisible && !isUnsigned(moment)) return { selection: null, reason: "during-a-question", rejected };
  if (moment === "first-letter" && !ctx.flags.firstLetterDue) return { selection: null, reason: "no-eligible-line", rejected };
  // It introduces itself before it says anything else, but only for the day the Letter is first offered:
  // from the next day the signed lines speak whether or not she has opened it, and the Letter waits
  // under Start. Unsigned prose inside the work is the note's register, not an introduction, so it is
  // never held back for the Letter.
  if (moment !== "first-letter" && !isUnsigned(moment) && ctx.flags.letterGoesFirst) {
    return { selection: null, reason: "letter-first", rejected };
  }

  const candidates = linesFor(moment)
    .filter((l) => conditionsHold(l, ctx))
    .filter((l) => !usedRecently(ctx.recentLines, l.id, ctx.now, l.cooldownDays ?? REPEAT_COOLDOWN_DAYS))
    .sort((a, b) => rank(b) - rank(a) || hash(a.id + ctx.today) - hash(b.id + ctx.today));

  for (const line of candidates) {
    const out = rendered(line, ctx, rejected);
    if (!out) continue;
    return {
      selection: {
        line,
        moment,
        text: out.text,
        values: out.values,
        unsigned: isUnsigned(moment),
        letter: isLetter(moment),
      },
      reason: null,
      rejected,
    };
  }
  return { selection: null, reason: "no-eligible-line", rejected };
}

/** At most one line for this moment, or silence. */
export function select(moment: Moment, ctx: CompanionContext): Selection | null {
  return selectDetailed(moment, ctx).selection;
}

/**
 * At most one line for the moment a surface names, trying what that moment stands for in order: for
 * "today-open" the evening lines first, then the arrival lines. This is what CompanionLine renders.
 */
export function selectAt(moment: Moment, ctx: CompanionContext): Selection | null {
  for (const m of momentsFor(moment)) {
    const s = select(m, ctx);
    if (s) return s;
  }
  return null;
}

/** At most one line for a wired slot, trying its moments in order. */
export function selectForSlot(slot: SlotId, ctx: CompanionContext): Selection | null {
  for (const moment of SLOTS[slot].moments) {
    const s = select(moment, ctx);
    if (s) return s;
  }
  return null;
}

/**
 * A Letter is the one place several lines stand together. The cooldown does not apply: a Letter is
 * written once and read once. Everything else does.
 */
export function selectLetter(moment: Moment, ctx: CompanionContext, limit = 3): Selection[] {
  if (ctx.silenced || !ctx.firstRunDone || ctx.giftNoteOnScreen || ctx.questionVisible) return [];
  if (moment === "first-letter" && !ctx.flags.firstLetterDue) return [];
  const out: Selection[] = [];
  const ignored: LintFinding[] = [];
  for (const line of linesFor(moment)) {
    if (!conditionsHold(line, ctx)) continue;
    const text = rendered(line, ctx, ignored);
    if (!text) continue;
    out.push({ line, moment, text: text.text, values: text.values, unsigned: false, letter: true });
    if (out.length >= limit) break;
  }
  return out;
}

/** Every line that could ever be said at this moment, for the read-aloud gallery and for tests. */
export function candidatesFor(moment: Moment): CompanionLineSpec[] {
  return LINES.filter((l) => l.moment === moment);
}
