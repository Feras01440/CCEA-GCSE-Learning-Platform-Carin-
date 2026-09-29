"use client";

/**
 * The drawings for fm1/algebraic-fractions-simplify, in the v2 illustration grammar (§3): three primitives, no
 * outlines, one accent element, labels on the figure, and every figure an object to act on where the card asks for
 * one. Ported from the approved canvas (scratchpad/mockups-v2/art.mjs: figCancel, figTap, figSubstitute, recapGlyph)
 * and brought to the note's own example when the note was rewritten to teach, show, then check (25 Sep 2026):
 * 3x(x + 7) over 6(x + 7)(x − 7). A strike means "divides out of both lines" (audit MK-05, LD-08, CT-10): the bracket
 * (x + 7) is struck whole on each line; 3x and 6, which share a 3 and are not the same factor, each lose their 3 and keep
 * the rest (x on top, 2 underneath); (x − 7), on one line only, is never struck. What is left unstruck is exactly the
 * answer, x over 2(x − 7), in the idea's drawing and on the card she acts on alike. Both are drawn from the pills of
 * ./afs-model.ts, so neither can show a different fraction from the other; the model is tested on its own and against
 * the note's own figure.
 *
 * Colours are the tokens: the subject accent for the thing the sentence is about, ink for the rest, fern for what is
 * right, the warm neutral for not yet. Text inside a figure is Literata for the maths and Inter for a label, sized
 * in viewBox units so a label never renders under 13 px on a 318 px stage (a 340-unit box).
 */
import { useEffect, useId, useRef, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { clsx } from "clsx";
import { BOTTOM, EMPTY_TAP, RESULT, SHARED, SUBSTITUTE, SUBSTITUTED, TOP, checkTap, pillReading, productForm, rightLine, substituteFor, tapGroupLabel, tapPair, type PillId, type PillSpec, type TapState } from "./afs-model";

const MATHS = "var(--serif-lesson)";
const UI = "var(--font-inter), ui-sans-serif, system-ui, sans-serif";

/**
 * A factor drawn as a pill: a rounded rectangle with the expression inside. `struck`: the whole factor divides out (a
 * diagonal in the accent across it). `split`: a number whose common factor divides out: the factor is struck, "×"
 * and what is left stay, so 3x reads 3̶ × x and 6 reads 3̶ × 2.
 */
function Pill({ id, x, y, w, text, state = "", split, h = 34, fs = 18 }: { id: PillId; x: number; y: number; w: number; text: string; state?: "" | "struck" | "split"; split?: { factor: string; left: string }; h?: number; fs?: number }) {
  const stroke = state === "" ? "var(--line-2)" : "var(--accent)";
  const base = y + h / 2 + fs * 0.35;
  return (
    <g data-piece={id} data-struck={state === "struck" ? "all" : state === "split" ? split?.factor : undefined} data-left={state === "split" ? split?.left : undefined}>
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

/** A pill's width in the drawing: a split number (3̶ × x) or a bracket, the two shapes the example has. */
const pillWidth = (p: PillSpec) => (p.split ? 58 : 78);

/** The pills of one line laid out from the left, 6 units apart. */
function row(line: readonly PillSpec[]): Array<{ p: PillSpec; x: number; w: number }> {
  let x = 12;
  return line.map((p) => {
    const at = { p, x, w: pillWidth(p) };
    x += at.w + 6;
    return at;
  });
}

/** What the drawing says, for a screen reader: the note's own figure in words, from the same pills. */
function cancelLabel(): string {
  const shared = [...new Set([...TOP, ...BOTTOM].filter((p) => SHARED.includes(p.id)).map((p) => (p.split ? `the ${p.split.factor}` : `the bracket ${p.text}`)))].join(" and ");
  const said = shared.charAt(0).toUpperCase() + shared.slice(1);
  return `${productForm(TOP)} over ${productForm(BOTTOM)}. ${said} ${shared.includes(" and ") ? "are" : "is"} struck out of both lines, leaving ${RESULT.top} on top and ${RESULT.bottom} underneath: ${RESULT.top} over ${RESULT.bottom}. Only a factor divides out.`;
}

/**
 * The idea figure, the note's hero figure drawn in the grammar: 3x(x + 7) over 6(x + 7)(x − 7) with every factor the two
 * lines share divided out, (x + 7) whole and a 3 out of 3x and out of 6, equals x over 2(x − 7), which is what is left;
 * (x − 7) stands unstruck. It is the tap card's finished state, drawn from the same pills. On the title card
 * (`variant="title"`) it carries no label inside the drawing: the lede says it, and at the title's 248 px width a
 * 15-unit label would render under the 13 px floor.
 */
export function FigCancel({ result = true, variant = "idea", className }: { result?: boolean; variant?: "title" | "idea"; className?: string }) {
  const drawn = (p: PillSpec): "" | "struck" | "split" => (!SHARED.includes(p.id) ? "" : p.split ? "split" : "struck");
  const top = row(TOP);
  const bottom = row(BOTTOM);
  const right = Math.max(...[...top, ...bottom].map((c) => c.x + c.w));
  return (
    <svg
      viewBox={variant === "title" ? "0 0 340 140" : "0 0 340 170"}
      role="img"
      aria-label={cancelLabel()}
      // Up to the canvas's 560 px, so it fills the Read hero's wide stage (audit CD-09); a Slides host caps it smaller.
      className={clsx("block h-auto w-full max-w-[560px]", className)}
      data-figure="afs.cancel"
    >
      {top.map(({ p, x, w }) => (
        <Pill key={p.id} id={p.id} x={x} y={24} w={w} text={p.text} state={drawn(p)} split={p.split} />
      ))}
      <Vinculum x1={8} x2={right + 4} y={78} />
      {bottom.map(({ p, x, w }) => (
        <Pill key={p.id} id={p.id} x={x} y={96} w={w} text={p.text} state={drawn(p)} split={p.split} />
      ))}
      {result && (
        <g data-result>
          <text x={right + 12} y={86} fontSize={22} fill="var(--ink)" fontFamily={MATHS}>
            =
          </text>
          <text x={right + 64} y={62} fontSize={20} textAnchor="middle" fill="var(--ink)" fontFamily={MATHS}>
            {RESULT.top}
          </text>
          <Vinculum x1={right + 32} x2={right + 96} y={78} />
          <text x={right + 64} y={106} fontSize={18} textAnchor="middle" fill="var(--ink)" fontFamily={MATHS}>
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
 * pill (pending, an accent ring), then a pill on the other line: a bracket on both lines strikes whole; 3x with 6 strikes
 * the 3 out of each and leaves x and 2 (the `react` motion, 250 ms), which is the note's own figure; a mismatch clears
 * the pending pill and says why in one line; (x − 7) has no match and is never struck. Check marks: every shared factor divided out and nothing else, and the simplified fraction rises in; or
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
        ? rightLine()
        : allGone
          ? "Finished: nothing is shared by both lines any more."
          : note ?? `${checkTap(state).diagnosis ?? "Something is still shared."} Tap the lit ${state.lit.length > 2 ? "pairs" : "pair"} to finish it.`;

  return (
    <div className="flex flex-col gap-3" data-interaction="afs.tap-to-cancel">
      <div className="rounded-[12px] border border-line bg-surface p-4 lg:border-0 lg:bg-[var(--tint-wash)]" data-stage>
        <div role="group" aria-labelledby={groupId} className="flex flex-col items-start gap-2">
          <span id={groupId} className="sr-only">
            {tapGroupLabel()}
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
      aria-label={`Put x = ${SUBSTITUTE.x} into both: the fraction (${SUBSTITUTED.top}) over ${SUBSTITUTED.bottom} is ${SUBSTITUTE.value}, but ${label} is ${value}. Not the same.`}
      className="block h-auto w-full max-w-[356px]"
      data-reaction="afs.substitute"
    >
      <text x={20} y={22} fontSize={15} fill="var(--ink-2)" fontFamily={UI} fontWeight={500}>
        Put x = {SUBSTITUTE.x} into both:
      </text>
      <g>
        <text x={58} y={54} fontSize={20} textAnchor="middle" fill="var(--ink)" fontFamily={MATHS}>
          {SUBSTITUTED.top}
        </text>
        <Vinculum x1={34} x2={82} y={62} />
        <text x={58} y={86} fontSize={20} textAnchor="middle" fill="var(--ink)" fontFamily={MATHS}>
          {SUBSTITUTED.bottom}
        </text>
        <text x={96} y={70} fontSize={20} fill="var(--ink)" fontFamily={MATHS}>
          =
        </text>
        <rect x={116} y={46} width={48} height={38} rx={10} fill="var(--ok-wash)" stroke="var(--ok)" strokeWidth={2} />
        <text x={140} y={73} fontSize={22} textAnchor="middle" fill="var(--ok)" fontWeight={600} fontFamily={MATHS}>
          {SUBSTITUTE.value}
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
/* Recap glyphs, one a line of "You can now", each found by its line's words (recapGlyphsFor): factorise, cancel,     */
/* finish on the numbers and any lone x, turn a division into a multiplication, and the number first (64 − x²).      */

export const RECAP_GLYPHS = ["factorise", "cancel", "numbers", "divide", "reverse"] as const;
export type RecapGlyphKind = (typeof RECAP_GLYPHS)[number];
export const isRecapGlyph = (kind: string): kind is RecapGlyphKind => (RECAP_GLYPHS as readonly string[]).includes(kind);

export function RecapGlyph({ kind, size = 44 }: { kind: RecapGlyphKind; size?: number }) {
  const box = { width: size, height: size, viewBox: "0 0 44 44", "aria-hidden": true as const, className: "shrink-0", "data-glyph": kind };
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
  if (kind === "divide")
    // "Turn a division into a multiplication first": ÷ becomes ×, drawn (a bar and two dots; two crossed strokes), the
    // × in the accent because it is what she writes.
    return (
      <svg {...box}>
        <rect x={1} y={1} width={42} height={42} rx={10} fill="var(--tint-wash)" />
        <path d="M6 22 L16 22" stroke="var(--ink)" strokeWidth={2} strokeLinecap="round" />
        <circle cx={11} cy={16.5} r={1.8} fill="var(--ink)" />
        <circle cx={11} cy={27.5} r={1.8} fill="var(--ink)" />
        <path d="M19.5 22 L26.5 22 M23.5 18.8 L26.8 22 L23.5 25.2" fill="none" stroke="var(--ink-2)" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
        <path d="M31 17 L39 27 M39 17 L31 27" stroke="var(--accent)" strokeWidth={2.2} strokeLinecap="round" />
      </svg>
    );
  if (kind === "reverse")
    // "Read the newest shapes the other way round": 64 − x² is (8 − x)(8 + x), the number first in each bracket, the 8
    // in the accent because it is what she writes first (the v3 note's fifth line of "You can now").
    return (
      <svg {...box}>
        <rect x={1} y={1} width={42} height={42} rx={10} fill="var(--tint-wash)" />
        <text x={22} y={27} textAnchor="middle" fontSize={15} fontWeight={600} fill="var(--ink)" fontFamily={MATHS}>
          (<tspan fill="var(--accent)">8</tspan>−x)
        </text>
      </svg>
    );
  // "Finish on the numbers and any lone x": 2x over 4x is only 1 over 2 (the note's "a 2 over a 4, or an x over an x").
  // No tick: fern means right, and 2x over 4x is not finished (audit CT-09).
  return (
    <svg {...box}>
      <rect x={1} y={1} width={42} height={42} rx={10} fill="var(--tint-wash)" />
      <text x={12} y={19} textAnchor="middle" fontSize={13} fontWeight={600} fill="var(--ink)" fontFamily={MATHS}>
        2x
      </text>
      <path d="M4 22 L20 22" stroke="var(--ink)" strokeWidth={1.4} />
      <text x={12} y={36} textAnchor="middle" fontSize={13} fontWeight={600} fill="var(--ink)" fontFamily={MATHS}>
        4x
      </text>
      <text x={25} y={27} textAnchor="middle" fontSize={13} fill="var(--ink-2)" fontFamily={MATHS}>
        =
      </text>
      <text x={35} y={19} textAnchor="middle" fontSize={13} fontWeight={600} fill="var(--accent)" fontFamily={MATHS}>
        1
      </text>
      <path d="M30 22 L40 22" stroke="var(--accent)" strokeWidth={1.4} />
      <text x={35} y={36} textAnchor="middle" fontSize={13} fontWeight={600} fill="var(--accent)" fontFamily={MATHS}>
        2
      </text>
    </svg>
  );
}
