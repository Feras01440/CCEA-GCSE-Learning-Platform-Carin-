"use client";

/**
 * The drawings for fm1/algebraic-fractions-simplify, in the v2 illustration grammar (§3): three primitives, no
 * outlines, one accent element, labels on the figure, and every figure an object to act on where the card asks for
 * one. Ported from the approved canvas (scratchpad/mockups-v2/art.mjs: figCancel, figTap, figSubstitute, recapGlyph),
 * with one correction the canvas needed too (audit MK-05, LD-08, CT-10): a strike means "divides out of both lines",
 * so 2x and 4, which share a factor of 2 and are not the same factor, each lose their 2 and keep the rest (x on top, 2
 * underneath). What is left unstruck is exactly the answer, x over 2(x − 5), in the idea's drawing and on the card she
 * acts on alike. The mathematics is in ./afs-model.ts, tested on its own.
 *
 * Colours are the tokens: the subject accent for the thing the sentence is about, ink for the rest, fern for what is
 * right, the warm neutral for not yet. Text inside a figure is Literata for the maths and Inter for a label, sized
 * in viewBox units so a label never renders under 13 px on a 318 px stage (a 340-unit box).
 */
import { useEffect, useId, useRef, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { clsx } from "clsx";
import { Caption } from "../ui";
import { BOTTOM, EMPTY_TAP, RESULT, SHARED, TOP, checkTap, pillOf, pillReading, substituteFor, tapPair, type PillId, type PillSpec, type TapState } from "./afs-model";

const MATHS = "var(--serif-lesson)";
const UI = "var(--font-inter), ui-sans-serif, system-ui, sans-serif";

/**
 * A factor drawn as a pill: a rounded rectangle with the expression inside. `struck`: the whole factor divides out (a
 * diagonal in the accent across it). `split`: a number whose common factor divides out: the factor is struck, "×"
 * and what is left stay, so 2x reads 2̶ × x.
 */
function Pill({ x, y, w, text, state = "", split, h = 34, fs = 18 }: { x: number; y: number; w: number; text: string; state?: "" | "struck" | "split"; split?: { factor: string; left: string }; h?: number; fs?: number }) {
  const stroke = state === "" ? "var(--line-2)" : "var(--accent)";
  const base = y + h / 2 + fs * 0.35;
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} rx={h / 2} fill="var(--surface)" stroke={stroke} strokeWidth={state ? 2 : 1} />
      {state === "split" && split ? (
        <>
          <text x={x + 15} y={base} textAnchor="middle" fontSize={fs} fill="var(--ink-3)" fontFamily={MATHS}>
            {split.factor}
          </text>
          <path d={`M${x + 8} ${y + h - 8} L${x + 22} ${y + 8}`} stroke="var(--accent)" strokeWidth={2.5} strokeLinecap="round" />
          <text x={x + 29} y={base} textAnchor="middle" fontSize={fs} fill="var(--ink-3)" fontFamily={MATHS}>
            ×
          </text>
          <text x={x + 43} y={base} textAnchor="middle" fontSize={fs} fill="var(--ink)" fontFamily={MATHS}>
            {split.left}
          </text>
        </>
      ) : (
        <>
          <text x={x + w / 2} y={base} textAnchor="middle" fontSize={fs} fill={state === "struck" ? "var(--ink-3)" : "var(--ink)"} fontFamily={MATHS}>
            {text}
          </text>
          {state === "struck" && <path d={`M${x + 8} ${y + h - 8} L${x + w - 8} ${y + 8}`} stroke="var(--accent)" strokeWidth={2.5} strokeLinecap="round" />}
        </>
      )}
    </g>
  );
}

const Vinculum = ({ x1, x2, y }: { x1: number; x2: number; y: number }) => <path d={`M${x1} ${y} L${x2} ${y}`} stroke="var(--ink)" strokeWidth={2} strokeLinecap="round" />;

/**
 * The idea figure: 2x(x + 5) over 4(x + 5)(x − 5), with every factor the two lines share divided out, the bracket whole
 * and a 2 out of 2x and out of 4, equals x over 2(x − 5), which is what is left. On the title card (`variant="title"`) it
 * carries no label inside the drawing: the lede says it, and at the title's 248 px width a 15-unit label would render
 * under the 13 px floor.
 */
export function FigCancel({ result = true, variant = "idea", className }: { result?: boolean; variant?: "title" | "idea"; className?: string }) {
  const two = pillOf("t-2x").split!;
  const four = pillOf("b-4").split!;
  return (
    <svg
      viewBox={variant === "title" ? "0 0 340 140" : "0 0 340 170"}
      role="img"
      aria-label="2x(x + 5) over 4(x + 5)(x − 5). The (x + 5) on each line is struck through, and a 2 is struck out of 2x and out of 4, leaving x on top and 2(x − 5) underneath: x over 2(x − 5). Only a factor divides out."
      className={clsx("block h-auto w-full max-w-[400px]", className)}
      data-figure="afs.cancel"
    >
      <Pill x={12} y={24} w={58} text="2x" state="split" split={two} />
      <Pill x={76} y={24} w={78} text="(x + 5)" state="struck" />
      <Vinculum x1={8} x2={242} y={78} />
      <Pill x={12} y={96} w={58} text="4" state="split" split={four} />
      <Pill x={76} y={96} w={78} text="(x + 5)" state="struck" />
      <Pill x={160} y={96} w={78} text="(x − 5)" />
      {result && (
        <g>
          <text x={250} y={86} fontSize={22} fill="var(--ink)" fontFamily={MATHS}>
            =
          </text>
          <text x={302} y={62} fontSize={20} textAnchor="middle" fill="var(--ink)" fontFamily={MATHS}>
            {RESULT.top}
          </text>
          <Vinculum x1={272} x2={332} y={78} />
          <text x={302} y={106} fontSize={18} textAnchor="middle" fill="var(--ink)" fontFamily={MATHS}>
            {RESULT.bottom}
          </text>
        </g>
      )}
      {variant === "idea" && (
        <text x={12} y={156} fontSize={15} fill="var(--ink-2)" fontFamily={UI} fontWeight={500}>
          Only a factor divides out.
        </text>
      )}
    </svg>
  );
}

/* ------------------------------------------------------------------------------------------------------------ */
/* The figure she acts on: tap a factor on one line, then its match on the other; a matched pair divides out.     */

export interface TapResult {
  correct: boolean;
}

function StrikeMark({ animate }: { animate: boolean }) {
  return (
    <svg className="pointer-events-none absolute inset-0 h-full w-full overflow-visible" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden>
      <motion.path
        d="M10 88 L90 12"
        fill="none"
        stroke="var(--accent)"
        strokeWidth={2.5}
        strokeLinecap="round"
        vectorEffect="non-scaling-stroke"
        initial={animate ? { pathLength: 0, opacity: 0.6 } : false}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ duration: animate ? 0.25 : 0, ease: [0.2, 0.8, 0.2, 1] }}
      />
    </svg>
  );
}

/**
 * The tap-to-cancel card's body. Pairing is the teaching: a factor must have a match on the other line. She taps one
 * pill (pending, an accent ring), then a pill on the other line: a bracket on both lines strikes whole; 2x with 4 strikes
 * the 2 out of each and leaves x and 2 (the `react` motion, 250 ms); a mismatch clears the pending pill and says why in
 * one line. Check marks: every shared factor divided out and nothing else, and the simplified fraction rises in; or
 * what still divides both lines is lit in fern and named, the answer is shown, and the lit pills stay live so she can
 * finish it now (emotional-design rule 4). What she struck is the run's (`state`, kept across a card change and a
 * reload), never this component's.
 */
export function TapToCancel({
  onChecked,
  checked,
  checkSignal,
  state = EMPTY_TAP,
  onState,
}: {
  onChecked: (r: TapResult) => void;
  checked: TapResult | null;
  checkSignal: number;
  state?: TapState;
  onState?: (s: TapState) => void;
}) {
  const reduce = useReducedMotion();
  const [pending, setPending] = useState<PillId | null>(null);
  const [note, setNote] = useState<string | null>(null);
  // Strikes made on this visit animate; strikes restored from the run are drawn at rest.
  const [fresh, setFresh] = useState<ReadonlySet<PillId>>(() => new Set());
  const groupId = useId();
  // The frame's one Check control asks for the marking by counting up `checkSignal`; the marking runs here, where
  // the pills live. The first render's value is remembered so a card restored mid-run is not marked on mount.
  const seenSignal = useRef(checkSignal);
  const set = (s: TapState) => onState?.(s);

  const finishing = checked !== null && !checked.correct && state.lit.length > 0;
  const live = (id: PillId) => (checked === null ? !state.struck.includes(id) : finishing && state.lit.includes(id));

  const tap = (id: PillId) => {
    if (!live(id)) return;
    if (pending === null) {
      setPending(id);
      setNote(null);
      return;
    }
    if (pending === id) {
      setPending(null);
      return;
    }
    const r = tapPair(state, pending, id);
    setPending(r.pending);
    if (r.state !== state) {
      setFresh((f) => new Set([...f, ...r.state.struck.filter((k) => !state.struck.includes(k))]));
      set(r.state);
    }
    // Before Check, the pairing's own words. After a Check that left something shared, a strike needs no words (the line
    // below says what is left), but a mismatch still says why nothing divided out.
    setNote(checked === null || r.state === state ? r.note : null);
  };

  useEffect(() => {
    if (checkSignal === seenSignal.current) return;
    seenSignal.current = checkSignal;
    if (checked) return;
    const r = checkTap(state);
    if (!r.correct) set({ struck: state.struck, lit: r.lit });
    setPending(null);
    setNote(null);
    onChecked({ correct: r.correct });
    // `state` and `checked` are read at the moment of the signal, which is the point.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [checkSignal]);

  const pill = (p: PillSpec) => {
    const reading = pillReading(p.id, state);
    const isPending = pending === p.id;
    const isLit = checked !== null && state.lit.includes(p.id);
    const acted = reading.kind !== "whole";
    const animate = !reduce && fresh.has(p.id);
    return (
      <button
        key={p.id}
        type="button"
        data-pill={p.id}
        data-struck={acted ? (reading.kind === "split" ? reading.factor : "all") : undefined}
        data-left={reading.kind === "split" ? reading.left : undefined}
        data-lit={isLit || undefined}
        aria-pressed={isPending}
        aria-label={
          `${p.text}, ${p.line === "top" ? "on the top line" : "on the bottom line"}` +
          (reading.kind === "struck" ? ", struck out" : reading.kind === "split" ? `: the ${reading.factor} is struck out, ${reading.left} is left` : isLit ? ", still shared" : "")
        }
        disabled={!live(p.id)}
        onClick={() => tap(p.id)}
        className={clsx(
          "relative inline-flex h-[44px] min-w-[44px] items-center justify-center gap-1 rounded-full bg-surface px-3.5 font-serif-lesson text-[20px] leading-none transition-[transform] duration-150 active:scale-[0.97] disabled:pointer-events-none",
          // The edge is the control's boundary: ink-3 holds 3:1 against the white stage and the wash, light and dark (audit CD-05).
          acted ? "border-2 border-accent" : isLit ? "border-2 border-ok bg-[var(--ok-wash)] text-ink" : isPending ? "border-2 border-accent text-ink" : "border border-[color:var(--ink-3)] text-ink",
          reading.kind === "struck" && "text-ink-3",
        )}
      >
        {reading.kind === "split" ? (
          <span aria-hidden className="inline-flex items-center gap-1">
            <span className="relative px-0.5 text-ink-3">
              {reading.factor}
              <StrikeMark animate={animate} />
            </span>
            <span className="text-[16px] text-ink-3">×</span>
            <span className="text-ink">{reading.left}</span>
          </span>
        ) : (
          <span aria-hidden>{p.text}</span>
        )}
        {reading.kind === "struck" && <StrikeMark animate={animate} />}
      </button>
    );
  };

  const allGone = SHARED.every((k) => state.struck.includes(k));
  const line =
    checked === null
      ? note ?? "Tap a factor on top, then its match underneath."
      : checked.correct
        ? "Both lines shared (x + 5) and a factor of 2. With both gone, x and 2(x − 5) share nothing: that is the answer."
        : allGone
          ? "Finished: nothing is shared by both lines any more."
          : note ?? `${checkTap(state).diagnosis ?? "Something is still shared."} Tap the lit ${state.lit.length > 2 ? "pairs" : "pair"} to finish it.`;

  return (
    <div className="flex flex-col gap-3" data-interaction="afs.tap-to-cancel">
      <div className="rounded-[12px] border border-line bg-surface p-4 lg:border-0 lg:bg-[var(--tint-wash)]" data-stage>
        <div role="group" aria-labelledby={groupId} className="flex flex-col items-start gap-2">
          <span id={groupId} className="sr-only">
            The fraction 2x(x + 5) over 4(x + 5)(x − 5), each factor a button
          </span>
          <div className="flex flex-wrap items-center gap-2">{TOP.map(pill)}</div>
          <div className="h-[2px] w-[min(100%,300px)] rounded bg-ink" aria-hidden />
          <div className="flex flex-wrap items-center gap-2">{BOTTOM.map(pill)}</div>
        </div>
        {checked !== null && (
          <div className="motion-place mt-4 flex items-center gap-3 font-serif-lesson text-[20px] text-ink" data-result={checked.correct || allGone ? "done" : "shown"}>
            {!checked.correct && !allGone ? <span className="font-sans text-[14px] text-ink-2">It simplifies to</span> : <span aria-hidden>=</span>}
            <span className="inline-flex flex-col items-center leading-[1.15]" role="img" aria-label={`${RESULT.top} over ${RESULT.bottom}`}>
              <span className="px-1.5">{RESULT.top}</span>
              <span className="h-[2px] w-full bg-ink" aria-hidden />
              <span className="px-1.5">{RESULT.bottom}</span>
            </span>
          </div>
        )}
        <p className="mt-3 font-sans text-[14px] leading-[1.4] text-ink-2" aria-live="polite" data-tap-line>
          {line}
        </p>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------------------------------------------------ */
/* The reaction figure for gate g2: substitute x = 1; the fraction gives 5, the cancelled version does not.        */

export function Substitute({ hers, correct }: { hers: string; correct: boolean }) {
  // "The x, leaving 4" gives 4; "The x and the 4" leaves 1 (afs-model.ts). On a right answer the tempting route is shown.
  const { value, label } = substituteFor(hers, correct);
  const [first, second] = label.startsWith("your") ? ["your cancelled", "version"] : ["the cancelled", "version"];
  return (
    <svg
      viewBox="0 0 340 132"
      role="img"
      aria-label={`Put x = 1 into both: the fraction (1 + 4) over 1 is 5, but ${label} is ${value}. Not the same.`}
      className="block h-auto w-full max-w-[356px]"
      data-reaction="afs.substitute"
    >
      <text x={20} y={22} fontSize={15} fill="var(--ink-2)" fontFamily={UI} fontWeight={500}>
        Put x = 1 into both:
      </text>
      <g>
        <text x={58} y={54} fontSize={20} textAnchor="middle" fill="var(--ink)" fontFamily={MATHS}>
          1 + 4
        </text>
        <Vinculum x1={34} x2={82} y={62} />
        <text x={58} y={86} fontSize={20} textAnchor="middle" fill="var(--ink)" fontFamily={MATHS}>
          1
        </text>
        <text x={96} y={70} fontSize={20} fill="var(--ink)" fontFamily={MATHS}>
          =
        </text>
        <rect x={116} y={46} width={48} height={38} rx={10} fill="var(--ok-wash)" stroke="var(--ok)" strokeWidth={2} />
        <text x={140} y={73} fontSize={22} textAnchor="middle" fill="var(--ok)" fontWeight={600} fontFamily={MATHS}>
          5
        </text>
        <text x={140} y={108} fontSize={15} textAnchor="middle" fill="var(--ink-2)" fontFamily={UI} data-label="fraction">
          the fraction
        </text>
      </g>
      <text x={201} y={72} fontSize={24} textAnchor="middle" fill="var(--ink-2)" fontFamily={MATHS}>
        ≠
      </text>
      <g>
        <rect x={238} y={46} width={48} height={38} rx={10} fill="var(--surface)" stroke="var(--miss)" strokeWidth={1.6} strokeDasharray="5 3" />
        <text x={262} y={73} fontSize={22} textAnchor="middle" fill="var(--miss)" fontWeight={600} fontFamily={MATHS} data-value>
          {value}
        </text>
        {/* Two short lines under its tile, so the two labels never meet at any width (audit CT-11, CD-02, LD-10). */}
        <text x={262} y={108} fontSize={15} textAnchor="middle" fill="var(--ink-2)" fontFamily={UI} data-label="hers">
          <tspan x={262}>{first}</tspan>
          <tspan x={262} dy={17}>
            {second}
          </tspan>
        </text>
      </g>
    </svg>
  );
}

/* ------------------------------------------------------------------------------------------------------------ */
/* Recap glyphs: factorise, cancel, check the numbers.                                                             */

export function RecapGlyph({ kind, size = 44 }: { kind: string; size?: number }) {
  const box = { width: size, height: size, viewBox: "0 0 44 44", "aria-hidden": true as const, className: "shrink-0" };
  if (kind === "factorise")
    return (
      <svg {...box}>
        <rect x={1} y={1} width={42} height={42} rx={10} fill="var(--tint-wash)" />
        <text x={22} y={28} textAnchor="middle" fontSize={17} fontWeight={600} fill="var(--accent)" fontFamily={MATHS}>
          ( )( )
        </text>
      </svg>
    );
  if (kind === "cancel")
    return (
      <svg {...box}>
        <rect x={1} y={1} width={42} height={42} rx={10} fill="var(--tint-wash)" />
        <rect x={9} y={7} width={26} height={12} rx={6} fill="var(--surface)" stroke="var(--accent)" strokeWidth={1.6} />
        <rect x={9} y={25} width={26} height={12} rx={6} fill="var(--surface)" stroke="var(--accent)" strokeWidth={1.6} />
        <path d="M7 22 L37 22" stroke="var(--ink)" strokeWidth={1.6} />
        <path d="M12 36 L32 8" stroke="var(--accent)" strokeWidth={2.8} strokeLinecap="round" />
      </svg>
    );
  // "Check the numbers": 2 over 4 is still 1 over 2. No tick: fern means right, and 2 over 4 is not finished (audit CT-09).
  return (
    <svg {...box} data-glyph="numbers">
      <rect x={1} y={1} width={42} height={42} rx={10} fill="var(--tint-wash)" />
      <text x={11} y={19} textAnchor="middle" fontSize={13} fontWeight={600} fill="var(--ink)" fontFamily={MATHS}>
        2
      </text>
      <path d="M5 22 L17 22" stroke="var(--ink)" strokeWidth={1.4} />
      <text x={11} y={36} textAnchor="middle" fontSize={13} fontWeight={600} fill="var(--ink)" fontFamily={MATHS}>
        4
      </text>
      <text x={22} y={27} textAnchor="middle" fontSize={13} fill="var(--ink-2)" fontFamily={MATHS}>
        =
      </text>
      <text x={33} y={19} textAnchor="middle" fontSize={13} fontWeight={600} fill="var(--accent)" fontFamily={MATHS}>
        1
      </text>
      <path d="M27 22 L39 22" stroke="var(--accent)" strokeWidth={1.4} />
      <text x={33} y={36} textAnchor="middle" fontSize={13} fontWeight={600} fill="var(--accent)" fontFamily={MATHS}>
        2
      </text>
    </svg>
  );
}

/** The caption under the idea figure, from the note's own words. */
export function CancelCaption() {
  return <Caption>A matching pair of brackets divides out. A matching pair of terms does not.</Caption>;
}
