"use client";

/**
 * The working box under the answer field: one line per step, marked by the working ladder
 * (`src/lib/marking/working.ts`) when the answer itself does not earn everything.
 *
 * It is opt-in on the lesson path — folded away, and whichever way she leaves it is how it opens next
 * time on this device — and open from the start on an exam-style run and on any part the scheme says
 * needs working. Nothing about it is a demand: the label says optional, and a correct answer never
 * needs it.
 */
import { useEffect, useId, useRef, useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import { KeyStrip, MATHS_KEYS, insertAtCaret } from "@/components/items";
import { fieldCls } from "@/components/items/ui";

const REMEMBER_KEY = "cairn:working-open";

function remembered(): boolean {
  try {
    return localStorage.getItem(REMEMBER_KEY) === "1";
  } catch {
    // Storage may be unavailable (private mode); the box simply starts folded away.
    return false;
  }
}

function remember(open: boolean) {
  try {
    localStorage.setItem(REMEMBER_KEY, open ? "1" : "0");
  } catch {
    // Nothing to do: the choice lasts for this page load.
  }
}

export interface WorkingFieldProps {
  value: string;
  onChange: (v: string) => void;
  /** Open from the start, and never folded away: an exam-style run, or a part that needs working. */
  alwaysOpen?: boolean;
  /** The one line of context on an exam-style run. */
  note?: string;
  disabled?: boolean;
}

export function WorkingField({ value, onChange, alwaysOpen = false, note, disabled }: WorkingFieldProps) {
  const [open, setOpen] = useState(alwaysOpen);
  const ref = useRef<HTMLTextAreaElement>(null);
  const id = useId();

  // Read on the client only: the server render cannot know what this device remembered.
  useEffect(() => {
    if (!alwaysOpen) setOpen(remembered());
  }, [alwaysOpen]);

  const toggle = () => {
    const next = !open;
    setOpen(next);
    remember(next);
  };

  return (
    <div className="mt-2">
      {!alwaysOpen && (
        <button
          type="button"
          onClick={toggle}
          aria-expanded={open}
          aria-controls={id}
          className="tap inline-flex items-center gap-1.5 text-meta text-ink-2 hover:text-ink"
        >
          {open ? <ChevronDown size={14} aria-hidden /> : <ChevronRight size={14} aria-hidden />}
          Show your working (optional)
        </button>
      )}
      {open && (
        <div id={id} className={alwaysOpen ? undefined : "mt-1.5"}>
          <label htmlFor={`${id}-box`} className={alwaysOpen ? "mb-1 block text-meta text-ink-2" : "sr-only"}>
            Show your working (optional)
          </label>
          {note && <p className="mb-1.5 mt-0.5 text-meta text-ink-2">{note}</p>}
          <textarea
            ref={ref}
            id={`${id}-box`}
            rows={3}
            value={value}
            disabled={disabled}
            onChange={(e) => onChange(e.target.value)}
            placeholder={"One line per step\n1/3 × π × 6² × 15"}
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            spellCheck={false}
            className={`${fieldCls} scroll-mb-28 font-mono text-ui`}
          />
          <KeyStrip
            keys={MATHS_KEYS}
            disabled={disabled}
            label="Maths symbols for your working"
            onKey={(k) => insertAtCaret(ref.current, value, k, onChange)}
          />
        </div>
      )}
    </div>
  );
}
