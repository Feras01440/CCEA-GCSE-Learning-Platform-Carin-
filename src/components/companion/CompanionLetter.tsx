"use client";

/**
 * The Letter: the only visual container the companion has.
 *
 * One top edge (its own border is the hairline rule), a small eyebrow, the lines at reading size beside the
 * hare holding the Letter (100 px, 110 on the desktop: the art direction v2 §7 and the canvas's Today boards),
 * and a signature: the name in visible text (02-surfaces.md §8). Sealed, it is one line, so Rowan's 24 px mark
 * stands in for the figure there. It is used twice: once as the first Letter, on the first Today after first
 * run (and, on an install that was already past first run when Rowan arrived, as the upgrade moment the
 * specification's review asked for), and again on Sunday, sealed until tapped.
 *
 * The first Letter goes first on the day it is first put in front of her: that day is recorded here
 * (markLetterOffered), and select.ts holds the other signed lines back until she reads it or the day ends.
 * From the next day, if she has not opened it, it waits under Start, sealed, one line long, and Rowan
 * speaks everywhere else as usual. Opening the sealed Letter counts as reading it.
 *
 * The sealed state is a real `button` with `aria-expanded`; the figure is decorative and the signature is
 * the visible name, per the completeness critic's accessibility note. In plain mode the eyebrow says no
 * cairn, like every other place word. In Words only (the context's `figure` off) the lines, the eyebrow, the
 * rename and the signature are exactly the same and nothing is drawn: the note takes the hare's column and the
 * sealed line stands without the mark.
 */

import { useEffect, useState, type ReactNode } from "react";
import { clsx } from "clsx";
import {
  letterEyebrow,
  markLetterOffered,
  markLetterSeen,
  sealedLetterPreview,
  selectLetter,
  setRowanName,
  type CompanionContext,
  type Moment,
} from "@/lib/companion";
import { COMPANION_FONT } from "./CompanionLine";
import { CompanionFigure } from "./CompanionFigure";

export interface CompanionLetterProps {
  /** "first-letter" for the first Letter, "weekly-letter" for Sunday. */
  moment: Moment;
  context: CompanionContext | null | undefined;
  /** Overrides the eyebrow. Keep it to three words. */
  eyebrow?: string;
  /**
   * Shows the preview and opens on a tap. Left out, the first Letter seals itself from the day after it was
   * first offered, so an unread Letter waits in one line rather than filling the tile every evening.
   */
  sealed?: boolean;
  /** The one line shown while sealed. */
  preview?: string;
  /** Offers the rename field. Defaults to true on the first Letter. */
  rename?: boolean;
  /** Defaults to writing the name to companionState. */
  onRename?: (name: string) => void;
  /** Called when she has read it: on Close, or on opening it from sealed. Defaults to marking the first Letter read. */
  onRead?: () => void;
  /** Anything the slot adds below the lines: the paper chips, the week's plan. */
  children?: ReactNode;
  className?: string;
}

export function CompanionLetter({
  moment,
  context,
  eyebrow,
  sealed,
  preview,
  rename,
  onRename,
  onRead,
  children,
  className,
}: CompanionLetterProps) {
  const [opened, setOpened] = useState(false);
  const [name, setName] = useState("");
  const [closed, setClosed] = useState(false);

  const lines = context ? selectLetter(moment, context) : [];
  const showRename = rename ?? moment === "first-letter";
  const isFirst = moment === "first-letter";
  const visible = !!context && lines.length > 0 && !closed;

  // The first time the first Letter is on her screen, that day becomes the one day it goes first.
  const needsOffered = visible && isFirst && !context?.letterOfferedOn;
  useEffect(() => {
    if (!needsOffered) return;
    markLetterOffered().catch(() => {
      // Unrecorded, the Letter keeps going first; the next open records it.
    });
  }, [needsOffered]);

  if (!visible || !context) return null;

  const sealedByDay = isFirst && context.letterOfferedOn !== null && context.letterOfferedOn < context.today;
  const open = !(sealed ?? sealedByDay) || opened;

  async function markRead() {
    if (onRead) onRead();
    else if (isFirst) {
      try {
        await markLetterSeen();
      } catch {
        // A Letter she has read but the device did not record is shown once more. No harm done.
      }
    }
  }

  function openSealed() {
    setOpened(true);
    void markRead();
  }

  async function close() {
    setClosed(true);
    await markRead();
  }

  async function saveName() {
    const trimmed = name.trim();
    if (!trimmed) return;
    if (onRename) onRename(trimmed);
    else {
      try {
        await setRowanName(trimmed);
      } catch {
        // Keeping the default name is not a failure worth a message.
      }
    }
  }

  const signature = context.rowanName;

  // One top edge: the object's own border is the specification's hairline rule (02-surfaces.md §8).
  return (
    <section
      data-companion={moment}
      className={clsx("rise-in rounded-[var(--radius)] border border-line bg-surface p-5 shadow-[var(--shadow-1)]", className)}
    >
      <p className="text-meta font-medium text-ink-2">{eyebrow ?? letterEyebrow(moment, context.plainMode)}</p>

      {!open ? (
        <div className="mt-2 flex items-center gap-3">
          {/* One line with no room for the figure: Rowan's 24 px mark stands in (art direction v2 §7), unless she chose
              Words only, in which case the slot draws nothing. */}
          <CompanionFigure slot="letter" state="letter" context={context} mark />
          <button
            type="button"
            aria-expanded={false}
            onClick={openSealed}
            className="tap block min-w-0 flex-1 text-left text-[17px] leading-[1.55] text-ink-2"
            style={{ fontFamily: COMPANION_FONT }}
          >
            {preview ?? (isFirst ? sealedLetterPreview(signature) : "A letter, when you have a minute.")}
          </button>
        </div>
      ) : (
        <>
          {/* The hare holds the Letter beside the note, 100 px, 110 on the desktop (the canvas's Today boards). In Words
              only there is no column for it: the note alone, at its measure. */}
          <div className={clsx("mt-3 items-start gap-3.5", context.figure && "grid grid-cols-[100px_minmax(0,1fr)] lg:grid-cols-[110px_minmax(0,1fr)]")}>
            {context.figure && (
              <div className="mt-0.5">
                <CompanionFigure slot="letter" state="letter" context={context} />
              </div>
            )}
            <div className="flex max-w-[42ch] flex-col gap-2" style={{ fontFamily: COMPANION_FONT }}>
              {lines.map((l) => (
                <p key={l.line.id} className="text-[17px] leading-[1.55] text-ink">
                  {l.text}
                </p>
              ))}
            </div>
          </div>

          {children}

          {showRename && (
            <div className="mt-4 rounded-[var(--radius-sm)] bg-surface-2 p-3">
              <label className="block text-meta text-ink-2" htmlFor="companion-name">
                It answers to {signature}. Call it something else if you would rather.
              </label>
              <div className="mt-1 flex gap-2">
                <input
                  id="companion-name"
                  data-companion-control="rename"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={signature}
                  maxLength={24}
                  className="tap min-w-0 flex-1 rounded-[var(--radius-sm)] border border-line-3 bg-surface px-3 text-[16px] text-ink"
                />
                <button type="button" onClick={saveName} className="tap rounded-[var(--radius-sm)] border border-line-2 px-4 text-meta font-medium hover:bg-surface-2">
                  Save
                </button>
              </div>
            </div>
          )}

          <div className="mt-4 flex items-center justify-between gap-3">
            <p className="text-meta text-ink-2">{signature}</p>
            <button type="button" onClick={close} className="tap rounded-[var(--radius-sm)] border border-line-2 px-4 text-meta font-medium hover:bg-surface-2">
              Close
            </button>
          </div>
        </>
      )}
    </section>
  );
}
