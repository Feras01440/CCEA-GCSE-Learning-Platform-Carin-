/**
 * Rowan's words about itself, outside the lines: the Letter's eyebrow, the sealed Letter's preview, and the
 * Settings copy that explains plain words.
 *
 * Pure and here rather than in the components, so the same lint that reads every line reads these too
 * (voice.test.ts): no banned word, no exclamation mark, no hills or dialect in anything plain mode shows.
 * The name is whatever she calls it; the default is Rowan.
 */

import { plainWords, rowanName, type CompanionPresence, type CompanionState } from "./memory";

/** "Tuesday 6 October", from an ISO date, read on the local calendar like every other date here. */
export function longDay(iso: string): string {
  const d = new Date(`${iso}T12:00:00`);
  const weekday = d.toLocaleDateString("en-GB", { weekday: "long" });
  const month = d.toLocaleDateString("en-GB", { month: "long" });
  return `${weekday} ${d.getDate()} ${month}`;
}

/**
 * The small line above a Letter. The first Letter's place eyebrow is "Left at the cairn"; in plain mode
 * the cairn goes, like every other place word.
 */
export function letterEyebrow(moment: string, plain: boolean): string {
  if (moment === "weekly-letter") return "Sunday";
  if (moment === "first-letter") return plain ? "A note to start with" : "Left at the cairn";
  return "For next time";
}

/** What a sealed first Letter says until she opens it: from its second day, it waits under Start. */
export function sealedLetterPreview(name: string): string {
  return `A short letter from ${name}. Open it when you have a minute.`;
}

/**
 * The Settings control for what she sees of it: Full, Words only or Quiet (rule 2, rewritten 23 September: Rowan
 * "can be reduced to its voice or silenced at no cost"). Each state says what it shows, in the product's words; the
 * note says what none of them costs her, because the plan, the dates and what comes back are the product's own.
 */
export interface PresenceCopy {
  /** The group's name. */
  legend: string;
  options: Array<{ id: CompanionPresence; label: string; detail: string }>;
  /** What none of the three changes. */
  note: string;
}

export function describePresence(state: Pick<CompanionState, "name">): PresenceCopy {
  const name = rowanName(state);
  return {
    legend: `What you see of ${name}`,
    options: [
      { id: "full", label: "Full", detail: "The hare and its lines: on Today, at the start of a topic and at the close of a session." },
      { id: "words", label: "Words only", detail: "The same lines, with nothing drawn." },
      { id: "quiet", label: "Quiet", detail: "Nothing said and nothing drawn, anywhere." },
    ],
    note: "Whichever you choose, your plan, your papers’ dates and what comes back stay on Today.",
  };
}

/** The Settings copy for plain words, in her words, with the one or two choices that make sense now. */
export interface VoiceCopy {
  /** Where it stands, with the date it changes when it will change by itself. */
  status: string;
  /** What plain words leaves out. */
  meaning: string;
  /** One pair of wordings, so the difference is seen rather than described. */
  example: string;
  /** The choices from here. `plain` is what the choice writes: true keeps plain words for good. */
  actions: Array<{ id: "keep-plain" | "voice-now" | "plain-again"; label: string; plain: boolean }>;
}

export function describeVoice(state: Pick<CompanionState, "plainModeUntil" | "name">, now = new Date()): VoiceCopy {
  const name = rowanName(state);
  const meaning = `Plain words means ${name} leaves out the hills, paths and cairns, and local words such as “wee” and “grand”. The facts are the same either way.`;
  const example = `For example, “one stone on M4” in plain words is “one stone on the M4 cairn” in ${name}’s own voice.`;
  const status = plainWords(state, now);
  switch (status.mode) {
    case "fortnight":
      return {
        status: `Plain words until ${longDay(status.until)}. From ${longDay(status.voiceFrom)}, ${name} talks in its own voice, unless you keep plain words.`,
        meaning,
        example,
        actions: [
          { id: "keep-plain", label: "Keep plain words", plain: true },
          { id: "voice-now", label: `Use ${name}’s own voice now`, plain: false },
        ],
      };
    case "always":
      return {
        status: "Plain words, for good. It stays this way unless you change it here.",
        meaning,
        example,
        actions: [{ id: "voice-now", label: `Use ${name}’s own voice`, plain: false }],
      };
    case "voice":
      return {
        status: status.since ? `${name}’s own voice, since ${longDay(status.since)}.` : `${name}’s own voice, as you chose.`,
        meaning,
        example,
        actions: [{ id: "plain-again", label: "Go back to plain words", plain: true }],
      };
  }
}
