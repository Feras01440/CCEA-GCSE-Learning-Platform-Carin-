"use client";

/**
 * "How Rowan speaks": the Settings section for the voice itself, beside CompanionMemory's list.
 *
 * Three controls, each costing her nothing else in the app: what to call it; what she sees of it (Full, Words only
 * or Quiet: rule 2 as rewritten on 23 September, "reduced to its voice or silenced at no cost", one choice read by
 * every surface through the companion context); and plain words. Plain words is explained in her words
 * (src/lib/companion/voice.ts): what it leaves out, one example pair, the date it changes by itself during the
 * first fortnight, and the one or two choices that make sense from where it stands. Nothing here is a reward, a
 * nudge or a record of attendance.
 *
 * Owned by the companion agent (since 24 September the app-surfaces agent); SettingsPanel renders it in place of
 * the card it used to carry (the lead's ruling of 23 September 2026). The state row is read without seeding,
 * because a write inside a liveQuery throws and would leave the switch showing the wrong state on a new device.
 *
 * The presence radios show her choice from the moment she makes it (presence-pick.ts): drawn from the stored row
 * alone, React put the radio back on her old choice straight after the tap until the row caught up (24 September).
 */

import { useEffect, useId, useReducer, useRef, useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { clsx } from "clsx";
import {
  DEFAULT_ROWAN_NAME,
  describePresence,
  describeVoice,
  presenceOf,
  readCompanionState,
  rowanName,
  setPlainMode,
  setPresence,
  setRowanName,
  type CompanionPresence,
  type CompanionState,
  type PresenceCopy,
} from "@/lib/companion";
import { NO_PICK, pickPresence, shownPresence } from "./presence-pick";

const controlCls =
  "tap rounded-[var(--radius-sm)] border border-line-2 bg-surface px-3 text-ui text-ink focus-visible:border-accent";
const buttonCls = "tap rounded-[var(--radius-sm)] border border-line-2 px-4 text-meta font-medium hover:bg-surface-2";

export interface PresenceChoiceProps {
  copy: PresenceCopy;
  /** The choice to draw checked: hers while it is being saved, the stored one otherwise (shownPresence). */
  shown: CompanionPresence;
  /** Her last choice could not be saved: one line says so under the options. */
  unsaved: boolean;
  onChoose: (presence: CompanionPresence) => void;
  /** Unique on the page: names the group and labels it. */
  id: string;
}

/** Full, Words only or Quiet: three native radios (arrow keys move and choose), each a 44 px row with what it shows. */
export function PresenceChoice({ copy, shown, unsaved, onChoose, id }: PresenceChoiceProps) {
  return (
    <div role="radiogroup" aria-labelledby={`${id}-legend`} data-testid="presence">
      <p id={`${id}-legend`} className="text-meta font-medium">
        {copy.legend}
      </p>
      <div className="mt-1 flex flex-col">
        {copy.options.map((o) => (
          // A 44 px row each (the tap floor), the choice's name in the ink and what it shows under it.
          <label key={o.id} className="tap flex cursor-pointer items-start gap-3 py-2">
            <input
              type="radio"
              name={`${id}-presence`}
              value={o.id}
              checked={shown === o.id}
              onChange={() => onChoose(o.id)}
              className="mt-1 shrink-0"
            />
            <span className="flex flex-col">
              <span className="text-ui text-ink">{o.label}</span>
              <span className="text-meta text-ink-2">{o.detail}</span>
            </span>
          </label>
        ))}
      </div>
      <p className="mt-1 text-meta text-ink-2">{copy.note}</p>
      {/* Always in the page, so a screen reader hears the line when it arrives; empty, it takes no room. */}
      <p role="status" className="text-meta text-ink-2 [&:not(:empty)]:mt-1">
        {unsaved ? copy.unsaved : null}
      </p>
    </div>
  );
}

export interface CompanionVoiceSettingsProps {
  className?: string;
}

export function CompanionVoiceSettings({ className }: CompanionVoiceSettingsProps) {
  const state = useLiveQuery(async (): Promise<CompanionState | null> => {
    try {
      return (await readCompanionState(new Date())).state;
    } catch {
      return null;
    }
  }, []);

  // Null while she has not typed in the field, so the stored name shows through.
  const [draft, setDraft] = useState<string | null>(null);
  const [nameSaved, setNameSaved] = useState(false);

  async function saveName() {
    try {
      await setRowanName(draft ?? "");
      setNameSaved(true);
      setDraft(null);
    } catch {
      // Keeping the name it has is not a failure worth a message.
    }
  }

  const name = rowanName(state);
  const voice = state ? describeVoice(state) : null;
  const presence = state ? describePresence(state) : null;
  const stored = state ? presenceOf(state) : null;
  const presenceId = useId();

  // Her choice, held from the tap until the device has saved it and the row says the same (presence-pick.ts).
  const [pick, dispatch] = useReducer(pickPresence, NO_PICK);
  const choices = useRef(0);
  useEffect(() => {
    if (stored) dispatch({ type: "stored", presence: stored });
    // `pick` too: the row may agree before the save is reported, and the hand-back waits for both.
  }, [stored, pick]);

  function choose(next: CompanionPresence) {
    const n = ++choices.current;
    dispatch({ type: "chose", presence: next, n });
    setPresence(next).then(
      () => dispatch({ type: "saved", n }),
      () => dispatch({ type: "not-saved", n }),
    );
  }

  return (
    <section className={clsx("rounded-[var(--radius)] border border-line bg-surface p-5 shadow-[var(--shadow-1)]", className)}>
      <h2 className="text-[16px] font-semibold">How {name} speaks</h2>
      <p className="mt-1 text-meta text-ink-2">
        A line or two on Today, at the start of a new topic and at the end of a session. Turning the drawing or the voice
        off costs you nothing else in the app.
      </p>

      <div className="mt-4 flex flex-col gap-5">
        <div>
          <label htmlFor="rowan-name" className="text-meta text-ink-2">
            What to call it
          </label>
          <div className="mt-1 flex max-w-sm gap-2">
            <input
              id="rowan-name"
              className={`${controlCls} min-w-0 flex-1`}
              value={draft ?? state?.name ?? ""}
              onChange={(e) => {
                setDraft(e.target.value);
                setNameSaved(false);
              }}
              placeholder={name}
              maxLength={24}
            />
            <button type="button" onClick={() => void saveName()} className={buttonCls}>
              Save
            </button>
          </div>
          <p className="mt-1 text-meta text-ink-2">
            Empty goes back to {DEFAULT_ROWAN_NAME}.
            {nameSaved && <span role="status"> Saved.</span>}
          </p>
        </div>

        {presence && stored && (
          <PresenceChoice copy={presence} shown={shownPresence(stored, pick)} unsaved={pick.unsaved} onChoose={choose} id={presenceId} />
        )}

        {voice && (
          <div data-testid="plain-words">
            <h3 className="text-meta font-medium">Plain words</h3>
            <p className="mt-1 text-ui">{voice.status}</p>
            <p className="mt-1 text-meta text-ink-2">{voice.meaning}</p>
            <p className="mt-1 text-meta text-ink-2">{voice.example}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {voice.actions.map((a) => (
                <button key={a.id} type="button" onClick={() => void setPlainMode(a.plain).catch(() => {})} className={buttonCls}>
                  {a.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
