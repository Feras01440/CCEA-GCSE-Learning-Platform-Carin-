"use client";

/**
 * The drawings for fm1/algebraic-fractions-simplify, in the v2 illustration grammar (§3): three primitives, no
 * outlines, one accent element, labels on the figure, and every figure an object to act on where the card asks for
 * one. Ported from the approved canvas (scratchpad/mockups-v2/art.mjs: figCancel, figTap, figSubstitute, recapGlyph).
 *
 * Colours are the tokens: the subject accent for the thing the sentence is about, ink for the rest, fern for what is
 * right, the warm neutral for not yet. Text inside a figure is Literata for the maths and Inter for a label, sized
 * in viewBox units so a label never renders under 13 px on a 342 px column (a 340-unit box).
 */
import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import { motion, useReducedMotion } from "motion/react";
import { clsx } from "clsx";
import { Caption } from "../ui";

const MATHS = "var(--serif-lesson)";
const UI = "var(--font-inter), ui-sans-serif, system-ui, sans-serif";

/** A factor drawn as a pill: a rounded rectangle with the expression inside. */
function Pill({ x, y, w, text, state = "", h = 36, fs = 20 }: { x: number; y: number; w: number; text: string; state?: "" | "struck" | "lit"; h?: number; fs?: number }) {
  const stroke = state === "struck" ? "var(--accent)" : state === "lit" ? "var(--ok)" : "var(--line-2)";
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} rx={h / 2} fill={state === "lit" ? "var(--ok-wash)" : "var(--surface)"} stroke={stroke} strokeWidth={state ? 2 : 1} />
      <text x={x + w / 2} y={y + h / 2 + fs * 0.35} textAnchor="middle" fontSize={fs} fill={state === "struck" ? "var(--ink-3)" : "var(--ink)"} fontFamily={MATHS}>
        {text}
      </text>
      {state === "struck" && <path d={`M${x + 8} ${y + h - 8} L${x + w - 8} ${y + 8}`} stroke="var(--accent)" strokeWidth={2.5} strokeLinecap="round" />}
    </g>
  );
}

const Vinculum = ({ x1, x2, y }: { x1: number; x2: number; y: number }) => <path d={`M${x1} ${y} L${x2} ${y}`} stroke="var(--ink)" strokeWidth={2} strokeLinecap="round" />;

/**
 * The idea figure: 2x(x+5) over 4(x+5)(x−5), the matching bracket struck in the accent, equals x over 2(x−5). On the
 * title card (`variant="title"`) it carries no caption inside the drawing: the lede says it, and at the title's 248 px
 * width a 15-unit label would render under the 13 px floor.
 */
export function FigCancel({ result = true, variant = "idea", className }: { result?: boolean; variant?: "title" | "idea"; className?: string }) {
  return (
    <svg
      viewBox={variant === "title" ? "0 0 340 140" : "0 0 340 170"}
      role="img"
      aria-label="2x(x + 5) over 4(x + 5)(x − 5): the matching (x + 5) on each line is struck through, leaving x over 2(x − 5). Only a factor divides out."
      className={clsx("block h-auto w-full max-w-[400px]", className)}
    >
      <Pill x={24} y={26} w={44} text="2x" />
      <Pill x={74} y={26} w={84} text="(x + 5)" state="struck" />
      <Vinculum x1={20} x2={250} y={84} />
      <Pill x={24} y={100} w={40} text="4" />
      <Pill x={70} y={100} w={84} text="(x + 5)" state="struck" />
      <Pill x={160} y={100} w={84} text="(x − 5)" />
      {result && (
        <g>
          <text x={266} y={92} fontSize={22} fill="var(--ink)" fontFamily={MATHS}>
            =
          </text>
          <text x={300} y={66} fontSize={22} textAnchor="middle" fill="var(--ink)" fontFamily={MATHS}>
            x
          </text>
          <Vinculum x1={280} x2={336} y={84} />
          <text x={308} y={116} fontSize={20} textAnchor="middle" fill="var(--ink)" fontFamily={MATHS}>
            2(x − 5)
          </text>
        </g>
      )}
      {variant === "idea" && (
        <text x={24} y={156} fontSize={15} fill="var(--ink-2)" fontFamily={UI} fontWeight={500}>
          Only a factor divides out.
        </text>
      )}
    </svg>
  );
}

/* ------------------------------------------------------------------------------------------------------------ */
/* The figure she acts on: tap a factor on one line, then its match on the other; a matched pair strikes through.  */

type PillId = "t-2x" | "t-b" | "b-4" | "b-b" | "b-m";
interface PillSpec {
  id: PillId;
  line: "top" | "bottom";
  text: string;
  /** What it is a factor of, for matching: a bracket by its text, a number by its numeric factor. */
  match: string;
}
const TOP: PillSpec[] = [
  { id: "t-2x", line: "top", text: "2x", match: "2" },
  { id: "t-b", line: "top", text: "(x + 5)", match: "(x + 5)" },
];
const BOTTOM: PillSpec[] = [
  { id: "b-4", line: "bottom", text: "4", match: "2" },
  { id: "b-b", line: "bottom", text: "(x + 5)", match: "(x + 5)" },
  { id: "b-m", line: "bottom", text: "(x − 5)", match: "(x − 5)" },
];
const ALL = [...TOP, ...BOTTOM];
const SHARED: PillId[] = ["t-2x", "t-b", "b-4", "b-b"];

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
 * pill (pending, an accent ring), then a pill on the other line: a match strikes both (the `react` motion, 250 ms);
 * a mismatch clears the pending pill and says why in one line. Check marks: every shared factor struck and nothing
 * else, and the simplified fraction rises in; otherwise the factor still shared on both lines is lit in fern and
 * named, before any words.
 */
export function TapToCancel({ onChecked, checked, checkSignal, verb }: { onChecked: (r: TapResult) => void; checked: TapResult | null; checkSignal: number; verb?: ReactNode }) {
  const reduce = useReducedMotion();
  const [struck, setStruck] = useState<Set<PillId>>(() => new Set());
  const [pending, setPending] = useState<PillId | null>(null);
  const [note, setNote] = useState<string | null>(null);
  const [lit, setLit] = useState<Set<PillId>>(() => new Set());
  const groupId = useId();
  // The frame's one Check control asks for the marking by counting up `checkSignal`; the marking runs here, where
  // the struck pills live. The first render's value is remembered so a card restored mid-run is not marked on mount.
  const seenSignal = useRef(checkSignal);

  const tap = (id: PillId) => {
    if (checked || struck.has(id)) return;
    const spec = ALL.find((p) => p.id === id)!;
    if (pending === null) {
      setPending(id);
      setNote(null);
      return;
    }
    if (pending === id) {
      setPending(null);
      return;
    }
    const first = ALL.find((p) => p.id === pending)!;
    if (first.line === spec.line) {
      setPending(id);
      setNote("Now its match on the other line.");
      return;
    }
    if (first.match === spec.match) {
      setStruck((s) => new Set([...s, first.id, spec.id]));
      setPending(null);
      const nextShared = SHARED.filter((k) => k !== first.id && k !== spec.id && !struck.has(k));
      setNote(nextShared.length ? (first.match === "(x + 5)" ? "One more: what divides both 2x and 4?" : "Now the bracket that both lines share.") : "Nothing is shared any more. Press Check.");
      return;
    }
    setPending(null);
    setNote(`${first.text} and ${spec.text} are not the same factor, so nothing divides out.`);
  };

  useEffect(() => {
    if (checkSignal === seenSignal.current) return;
    seenSignal.current = checkSignal;
    if (checked) return;
    const allShared = SHARED.every((k) => struck.has(k));
    const nothingElse = [...struck].every((k) => SHARED.includes(k));
    const correct = allShared && nothingElse;
    if (!correct) setLit(new Set(SHARED.filter((k) => !struck.has(k))));
    setPending(null);
    onChecked({ correct });
    // `struck` and `checked` are read at the moment of the signal, which is the point.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [checkSignal]);

  const pillCls = (id: PillId) => {
    const isStruck = struck.has(id);
    const isPending = pending === id;
    const isLit = lit.has(id) && checked !== null;
    return clsx(
      "relative inline-flex h-[44px] min-w-[44px] items-center justify-center rounded-full border bg-surface px-3.5 font-serif-lesson text-[20px] leading-none transition-[transform] duration-150 active:scale-[0.97] disabled:pointer-events-none",
      isStruck ? "border-2 border-accent text-ink-3" : isLit ? "border-2 border-ok bg-[var(--ok-wash)]" : isPending ? "border-2 border-accent text-ink" : "border-line-2 text-ink",
    );
  };
  const pill = (p: PillSpec) => (
    <button
      key={p.id}
      type="button"
      data-pill={p.id}
      data-struck={struck.has(p.id) || undefined}
      aria-pressed={pending === p.id}
      aria-label={`${p.text}, ${p.line === "top" ? "on the top line" : "on the bottom line"}${struck.has(p.id) ? ", struck out" : ""}`}
      disabled={checked !== null || struck.has(p.id)}
      onClick={() => tap(p.id)}
      className={pillCls(p.id)}
    >
      <span aria-hidden>{p.text}</span>
      {struck.has(p.id) && <StrikeMark animate={!reduce} />}
    </button>
  );

  const remaining = SHARED.filter((k) => !struck.has(k));
  const remainingText = (() => {
    const bracket = remaining.includes("t-b") || remaining.includes("b-b");
    const number = remaining.includes("t-2x") || remaining.includes("b-4");
    if (bracket && number) return "(x + 5) and a factor of 2 still divide both lines.";
    if (bracket) return "(x + 5) still divides both lines.";
    if (number) return "A factor of 2 still divides both 2x and 4.";
    return null;
  })();

  return (
    <div className="flex flex-col gap-3" data-interaction="afs.tap-to-cancel">
      {verb}
      <div className="rounded-[12px] border border-line bg-surface p-4 lg:border-0 lg:bg-[var(--tint-wash)]" data-stage>
        <div role="group" aria-labelledby={groupId} className="flex flex-col items-start gap-2">
          <span id={groupId} className="sr-only">
            The fraction 2x(x + 5) over 4(x + 5)(x − 5), each factor a button
          </span>
          <div className="flex flex-wrap items-center gap-2">{TOP.map(pill)}</div>
          <div className="h-[2px] w-[min(100%,272px)] rounded bg-ink" aria-hidden />
          <div className="flex flex-wrap items-center gap-2">{BOTTOM.map(pill)}</div>
        </div>
        {checked?.correct && (
          <div className="motion-place mt-4 flex items-center gap-3 font-serif-lesson text-[20px] text-ink" data-result>
            <span aria-hidden>=</span>
            <span className="inline-flex flex-col items-center leading-[1.15]" role="img" aria-label="x over 2(x − 5)">
              <span className="px-1.5">x</span>
              <span className="h-[2px] w-full bg-ink" aria-hidden />
              <span className="px-1.5">2(x − 5)</span>
            </span>
          </div>
        )}
        <p className="mt-3 font-sans text-[14px] leading-[1.4] text-ink-2" aria-live="polite">
          {checked === null
            ? note ?? "Tap a factor on top, then its match underneath."
            : checked.correct
              ? "Both lines shared (x + 5) and a factor of 2. Nothing they share is left, and (x − 5) stays."
              : remainingText ?? "Something struck was not shared by both lines."}
        </p>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------------------------------------------------ */
/* The reaction figure for gate g2: substitute x = 1; the fraction gives 5, the cancelled version does not.        */

export function Substitute({ hers, correct }: { hers: string; correct: boolean }) {
  // "The x, leaving 4" gives 4; "The x and the 4" leaves 1. On a right answer the wrong route is still shown as the reason.
  const cancelled = /and the 4/i.test(hers) ? "1" : "4";
  const label = correct ? "the cancelled version" : "your cancelled version";
  return (
    <svg
      viewBox="0 0 340 128"
      role="img"
      aria-label={`Put x = 1 into both: the fraction (1 + 4) over 1 is 5, but ${label} is ${cancelled}. Not the same.`}
      className="block h-auto w-full max-w-[356px]"
      data-reaction="afs.substitute"
    >
      <text x={20} y={24} fontSize={15} fill="var(--ink-2)" fontFamily={UI} fontWeight={500}>
        Put x = 1 into both:
      </text>
      <g>
        <text x={60} y={56} fontSize={20} textAnchor="middle" fill="var(--ink)" fontFamily={MATHS}>
          1 + 4
        </text>
        <Vinculum x1={36} x2={84} y={64} />
        <text x={60} y={90} fontSize={20} textAnchor="middle" fill="var(--ink)" fontFamily={MATHS}>
          1
        </text>
        <text x={102} y={72} fontSize={20} fill="var(--ink)" fontFamily={MATHS}>
          =
        </text>
        <rect x={122} y={48} width={48} height={38} rx={10} fill="var(--ok-wash)" stroke="var(--ok)" strokeWidth={2} />
        <text x={146} y={75} fontSize={22} textAnchor="middle" fill="var(--ok)" fontWeight={600} fontFamily={MATHS}>
          5
        </text>
        <text x={146} y={112} fontSize={15} textAnchor="middle" fill="var(--ink-2)" fontFamily={UI}>
          the fraction
        </text>
      </g>
      <text x={200} y={74} fontSize={24} textAnchor="middle" fill="var(--ink-2)" fontFamily={MATHS}>
        ≠
      </text>
      <g>
        <rect x={230} y={48} width={48} height={38} rx={10} fill="var(--surface)" stroke="var(--miss)" strokeWidth={1.6} strokeDasharray="5 3" />
        <text x={254} y={75} fontSize={22} textAnchor="middle" fill="var(--miss)" fontWeight={600} fontFamily={MATHS}>
          {cancelled}
        </text>
        <text x={254} y={112} fontSize={15} textAnchor="middle" fill="var(--ink-2)" fontFamily={UI}>
          {label}
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
  return (
    <svg {...box}>
      <rect x={1} y={1} width={42} height={42} rx={10} fill="var(--tint-wash)" />
      <text x={15} y={19} textAnchor="middle" fontSize={15} fontWeight={600} fill="var(--ink)" fontFamily={MATHS}>
        2
      </text>
      <path d="M7 22 L23 22" stroke="var(--ink)" strokeWidth={1.6} />
      <text x={15} y={38} textAnchor="middle" fontSize={15} fontWeight={600} fill="var(--ink)" fontFamily={MATHS}>
        4
      </text>
      <circle cx={33} cy={22} r={8} fill="var(--ok)" />
      <path d="M29 22.5 L32 25.5 L37.5 19" fill="none" stroke="var(--surface)" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/** The caption under the idea figure, from the note's own words. */
export function CancelCaption() {
  return <Caption>A matching pair of brackets divides out. A matching pair of terms does not.</Caption>;
}
