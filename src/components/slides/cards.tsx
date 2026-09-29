"use client";

/**
 * The card bodies (docs/design/2026-09-23-art-direction-v2.md §8.1, with the teach-first case's §8.1 rows): each returns
 * what goes in the frame's prose column and, where the canvas draws one, its figure column. The frame (SlidesRun) owns
 * the header, the track, the one control and the navigation; a card body never navigates.
 */
import { useEffect, useRef, type ReactNode } from "react";
import { clsx } from "clsx";
import { InlineSvg, KeyStrip, MdInlines, MissMark, Tex, Tick, formatExaminerSource, insertAtCaret, keywordsPresent, optionLetter, parseInline, type StripKey } from "@/components/items";
import { fieldCls } from "@/components/items/ui";
import type { GateBlock } from "@/components/items/gates";
import { StemTex } from "@/components/items/StemTex";
import { PhotoFigure } from "@/components/media/PhotoFigure";
import { SimEmbed } from "@/components/media/SimEmbed";
import { VideoEmbed } from "@/components/media/VideoEmbed";
import type { Card, SeeCard } from "@/lib/slides/cards";
import { optionTex } from "@/lib/gate-order";
import type { StepResult } from "@/lib/slides/position";
import type { GatePhase } from "@/lib/slides/run";
import { lineAbout, optionNoteFor, stepPointers } from "@/lib/slides/see";
import { spokenText } from "@/lib/slides/text";
import { ILLUSTRATIONS, INTERACTIONS, REACTIONS, RecapGlyphFor, isRecapGlyph } from "./enrich";
import type { TapResult } from "./enrich/afs";
import type { TapState } from "./enrich/afs-model";
import { SeeSteps, stemWords } from "./SeeSteps";
import { Caption, Option, Prose, Recess, Stage, Verdict, wholeMaths, type OptionState } from "./ui";

export type IdeaCard = Extract<Card, { kind: "idea" }>;
export type MediaCard = Extract<Card, { kind: "media" }>;
export type GateCard = Extract<Card, { kind: "gate" }>;
export type CalloutCard = Extract<Card, { kind: "callout" }>;
export type InteractionCard = Extract<Card, { kind: "interaction" }>;
export type RecapCard = Extract<Card, { kind: "recap" }>;
export type PointerCard = Extract<Card, { kind: "pointer" }>;
export type RecallCard = Extract<Card, { kind: "recall" }>;

/** What a card body gives the frame: the prose column, the optional figure column, and the eyebrow and title above them. */
export interface CardParts {
  eyebrow: ReactNode;
  title: ReactNode | null;
  left: ReactNode;
  right: ReactNode | null;
}

type Sectioned = { section: { n: number; total: number; title: string } | null };

/** "3 of 6 · Your turn"; a section the close has taken in says its own title; a card of no section says only what it is. */
const sectionEyebrow = (card: Sectioned, what: string) => {
  const s = card.section;
  if (!s) return what;
  if (s.n === 0) return s.title ? `${s.title} · ${what}` : what;
  return `${s.n} of ${s.total} · ${what}`;
};

/**
 * A drawing on its stage with its caption under it: a registered one (drawn in code) or the note's own figure. On the
 * phone the stage runs 16 px into the card's gutter each side, so a figure is drawn about as wide as the 358 px column
 * its labels were sized for (a 15-unit label in a 400-unit box is 13.4 px there, 11.9 px on the narrower stage); on the
 * desktop it is the 400 px figure column.
 */
function Illustrated({ id, figure, caption }: { id: string | null; figure: IdeaCard["figure"]; caption: string | null }) {
  const Fig = id ? ILLUSTRATIONS[id] : undefined;
  const drawing = Fig ? <Fig /> : figure?.svg ? <InlineSvg svg={figure.svg} alt={figure.alt} className="m-0 w-full" /> : null;
  if (!drawing) return null;
  return (
    <div className="flex flex-col gap-2.5" data-card-figure={Fig ? id ?? undefined : "note"}>
      <Stage bleed>{drawing}</Stage>
      {caption && (
        <Caption>
          <MdInlines inlines={parseInline(caption)} />
        </Caption>
      )}
    </div>
  );
}

/**
 * An idea card: its words, and the drawing that stands on it, if any. `illustration` is a registered drawing for this
 * card; `illustrationCaption` is what it says under it (the caption of the note figure it stands in for). Otherwise the
 * note's own figure, the one just before the paragraph that reads it, stands on the card with its own caption.
 */
export function ideaParts(card: IdeaCard, illustration: string | null, illustrationCaption: string | null = null): CardParts {
  const right =
    illustration && ILLUSTRATIONS[illustration] ? (
      <Illustrated id={illustration} figure={null} caption={illustrationCaption} />
    ) : card.figure?.svg ? (
      <Illustrated id={null} figure={card.figure} caption={card.figure.caption ?? null} />
    ) : null;
  const s = card.section;
  const where = s.n === 0 ? s.title || "After the lesson" : `Section ${s.n} of ${s.total}`;
  return {
    eyebrow: card.first || !s.title || s.n === 0 ? where : `${where} · ${s.title}`,
    title: card.first ? <MdInlines inlines={parseInline(s.heading)} /> : null,
    left: <Prose md={card.md} />,
    right,
  };
}

/** `nextIsTurn`: the card after this one is a Your turn, so the video's caption can say what comes next. */
export function mediaParts(card: MediaCard, nextIsTurn = false): CardParts {
  const b = card.block;
  const eyebrow = sectionEyebrow(card, b.type === "video" ? "Watch" : b.type === "sim" ? "Try" : "Look");
  if (b.type === "video") {
    return {
      eyebrow,
      title: card.section?.heading ? <MdInlines inlines={parseInline(card.section.heading)} /> : b.title,
      left: (
        <div className="flex flex-col gap-3">
          <VideoEmbed video={{ provider: "youtube", ...b }} className="!my-0" />
          <Caption>{nextIsTurn ? "The method at writing speed, beside the steps you have just seen. Watching is not practice: your turn is next." : "The method at writing speed, beside the steps you have just seen."}</Caption>
        </div>
      ),
      right: null,
    };
  }
  if (b.type === "sim") {
    return { eyebrow, title: b.title, left: <SimEmbed sim={b} />, right: null };
  }
  if (b.type === "photo") {
    return { eyebrow, title: card.section?.heading ? <MdInlines inlines={parseInline(card.section.heading)} /> : null, left: <PhotoFigure photo={b} />, right: null };
  }
  return {
    eyebrow,
    title: card.section?.heading ? <MdInlines inlines={parseInline(card.section.heading)} /> : null,
    left: b.caption ? <Prose md={b.caption} /> : <Caption>{b.alt}</Caption>,
    right: b.svg ? (
      <Stage bleed>
        <InlineSvg svg={b.svg} alt={b.alt} className="m-0 w-full" />
      </Stage>
    ) : null,
  };
}

/* ---------------------------------------------------------------------------------------------------------- */
/* See it                                                                                                     */

export interface SeeState {
  revealed: number;
  typedResult: StepResult | null;
  onTyped: (r: StepResult) => void;
  /** The newest step was shown by her Continue just now, so it arrives with the reveal motion. */
  animateLast: boolean;
  /** "Skip to your turn", on a return visit only (null otherwise). */
  onSkip: (() => void) | null;
}

/**
 * The See it card (the teach-first case §8.1): the stem with its maths on its own line, the steps one per Continue, each
 * a working line with its reason under it and its mark on the right, the ones to come as numbered ghosts. A See it
 * whose named worked example did not ship says so rather than showing an empty card (the build refuses such a note).
 */
export function seeParts(card: SeeCard, state: SeeState): CardParts {
  const title = card.first && card.section?.heading ? <MdInlines inlines={parseInline(card.section.heading)} /> : null;
  if (!card.see) return { eyebrow: sectionEyebrow(card, "See it"), title, left: <Caption>This example is not on this device yet.</Caption>, right: null };
  return {
    eyebrow: sectionEyebrow(card, "See it"),
    title,
    left: (
      // Every kind renders the same steps today (V3.1); the kind is on the card for a layout that differs later.
      <div className="flex flex-col gap-4" data-see-card data-see-kind={card.see.kind ?? undefined}>
        <SeeSteps see={card.see} revealed={state.revealed} typed={card.typed} typedResult={state.typedResult} onTyped={state.onTyped} size="card" animateLast={state.animateLast} />
        {state.onSkip && (
          <button type="button" onClick={state.onSkip} className="tap inline-flex w-fit items-center px-1 font-sans text-[15px] font-medium text-ink-2 underline decoration-accent underline-offset-[3px] hover:text-ink" data-skip-see>
            Skip to your turn
            <span className="sr-only">: every step shown, nothing recorded</span>
          </button>
        )}
      </div>
    ),
    right: null,
  };
}

/* ---------------------------------------------------------------------------------------------------------- */
/* Your turn                                                                                                  */

export interface GateAnswer {
  answer: string;
  correct: boolean;
  /** "recorded": the first answer, now an attempt and a review card; "already": answered on an earlier visit; "retry": asked again, not recorded. */
  record: "recorded" | "already" | "retry";
}

/**
 * The stem that asks, then the maths it asks about on its own line at the display size (§8.4): the engine's StemTex, the
 * lift every stem shares, with the Your turn's words (SeeSteps' stemWords).
 */
export function GateStem({ prompt }: { prompt: string }) {
  return (
    <div data-stem>
      <StemTex text={prompt} className={stemWords(prompt)} />
    </div>
  );
}

export interface GateState {
  /** The gate as asked on this card: the note's gate, or its twin on a retry. */
  asked: GateBlock;
  selected: string | null;
  answer: GateAnswer | null;
  phase: GatePhase;
  onSelect: (option: string) => void;
  reactionId: string | null;
  /** The options in the order shown: the lesson's balanced order (src/lib/gate-order.ts), the one Read shows. */
  options: readonly string[];
  /** What happens to an answer, said before Check. */
  note: string;
  /** What happened to hers, said after. */
  meta: string;
}

const eyebrowFor = (card: GateCard): string => {
  if (card.retry) return card.twin ? "Once more · on new numbers" : "Once more";
  return card.turn ? `Your turn · ${card.turn.n} of ${card.turn.of}` : "Your turn";
};

/**
 * The Your turn card (was the gate): the question at the stem size on a white object, three 52 px options or a field.
 * After Check: a hit shows "Yes." and the explanation; a miss has been re-taught (reteachParts) before this card shows
 * its answer: her option edged in ink, the right one lit in fern with its tick, "The answer …" at 21 px, a line about her
 * choice, and what happens to it. A retry is answered straight away.
 */
export function gateParts(card: GateCard, state: GateState): CardParts {
  const { asked, selected, answer, onSelect, reactionId } = state;
  const options = asked.kind === "choice" ? state.options : [];
  const hers = answer?.answer ?? null;
  const optionState = (opt: string): OptionState => {
    if (!answer) return selected === opt ? "chosen" : "";
    if (opt.trim() === asked.answer.trim()) return "ok";
    if (opt === answer.answer) return "miss";
    return "";
  };
  const Reaction = reactionId && !card.retry ? REACTIONS[reactionId] : null;
  const shownAnswer = answer !== null && state.phase === "answer";
  let verdict: ReactNode = null;
  if (shownAnswer && answer) {
    if (answer.correct) {
      verdict = <Verdict kind="ok" explain={asked.explain} meta={state.meta} reaction={Reaction ? <Reaction hers={answer.answer} correct /> : undefined} />;
    } else {
      // The note on her option where the gate carries one (V3.1), else the explanation's sentence that names it.
      const line = lineAbout(asked, answer.answer);
      const diagnosis = (
        <div className={clsx("font-serif-lesson text-[17px] leading-[1.45] text-ink", wholeMaths)} data-diagnosis data-hers={answer.answer}>
          <p>
            <span className="text-ink-2">You chose </span>
            <Tex text={asked.kind === "choice" ? optionTex(answer.answer) : answer.answer} />
            <span className="text-ink-2">.</span>
          </p>
          {line && (
            <p className="mt-1">
              <Tex text={line} />
            </p>
          )}
        </div>
      );
      // A retry was not re-taught first, so its answer carries the explanation; a first asking's re-teach gave it.
      verdict = <Verdict kind="miss" answer={asked.kind === "choice" ? optionTex(asked.answer) : asked.answer.split("|")[0]!.trim()} diagnosis={diagnosis} explain={card.retry ? asked.explain : null} meta={state.meta} />;
    }
  }
  return {
    eyebrow: sectionEyebrow(card, eyebrowFor(card)),
    title: null,
    left: (
      <div className="rounded-[12px] border border-line-2 bg-surface p-4 lg:p-5" data-gate={card.gate.id} data-retry={card.retry ? (card.twin ? "twin" : "same") : undefined} data-asked={asked.id}>
        <GateStem prompt={asked.prompt} />
        {asked.kind === "choice" ? (
          <div role="radiogroup" aria-label={spokenText(asked.prompt)} className="flex flex-col" style={{ marginTop: "var(--gap-maths-field)", gap: "var(--gap-option)" }}>
            {options.map((opt, i) => (
              // A stacked fraction at text size, the answers as legible as the question (optionTex, shared with Read).
              <Option key={opt} index={i + 1} value={opt} letter={optionLetter(i)} text={optionTex(opt)} state={optionState(opt)} hers={answer !== null && opt === hers} disabled={answer !== null} onSelect={() => onSelect(opt)} />
            ))}
          </div>
        ) : (
          <TypedGateField gate={asked} selected={selected} answer={answer} onChange={onSelect} />
        )}
      </div>
    ),
    right: verdict ?? (
      <Caption className="hidden lg:block">
        {asked.kind === "choice" ? "Choose with a tap or the keys 1 to 3, then Check or Enter." : "Type it, then Check or Enter."} {state.note}
      </Caption>
    ),
  };
}

/** The keys a phone's number pad lacks: the minus sign (iOS's decimal pad has none) and the fraction bar. */
const NUMBER_KEYS: StripKey[] = [
  { label: "−", insert: "−", name: "minus" },
  { label: "/", insert: "/", name: "fraction bar" },
];

/** A blank or number gate: one field, 52 px, its label above; Enter checks through the frame. A number field has the minus. */
function TypedGateField({ gate, selected, answer, onChange }: { gate: GateBlock; selected: string | null; answer: GateAnswer | null; onChange: (v: string) => void }) {
  const ref = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (!answer) ref.current?.focus({ preventScroll: true });
  }, [answer]);
  const value = answer ? answer.answer : selected ?? "";
  return (
    <div style={{ marginTop: "var(--gap-maths-field)" }}>
      <label htmlFor={`slide-gate-${gate.id}`} className="mb-1.5 block font-sans text-[14px] text-ink-2">
        Your answer
      </label>
      <input
        ref={ref}
        id={`slide-gate-${gate.id}`}
        type="text"
        inputMode={gate.kind === "number" ? "decimal" : "text"}
        enterKeyHint="done"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={answer !== null}
        autoComplete="off"
        spellCheck={false}
        placeholder={gate.kind === "number" ? "Number" : "Fill the blank"}
        className={clsx(fieldCls, "tap-lg")}
        data-gate-field
      />
      {gate.kind === "number" && !answer && <KeyStrip keys={NUMBER_KEYS} label="Signs the number pad lacks" onKey={(k) => insertAtCaret(ref.current, value, k, onChange)} />}
    </div>
  );
}

/* ---------------------------------------------------------------------------------------------------------- */
/* The re-teach, after a miss and before its answer                                                           */

export interface ReteachState {
  /** The option or the words she gave. */
  hers: string;
  reactionId: string | null;
  /** The See it card this Your turn follows, for the step its explanation points at. */
  see: SeeCard | null;
}

/**
 * A miss re-teaches before it marks (the teach-first case §6.3): "Not quite." in ink, her choice without shame (the
 * circle-dash, never red), the note on her option where the gate carries one (V3.1: why it tempts and what is wrong,
 * said before anything general, because the correction lands best on the expectation she formed), the explanation again
 * (the gate's `explain`, which re-teaches in other words and points at the step), the step itself where it names one,
 * and the figure's consequence where the gate has one. Nothing is lit yet, and nothing here is recorded: "Show me the
 * answer" is the one control.
 */
export function reteachParts(card: GateCard, gate: GateBlock, state: ReteachState): CardParts {
  const Reaction = state.reactionId ? REACTIONS[state.reactionId] : null;
  const note = optionNoteFor(gate, state.hers);
  // The steps the explanation points at ("step 2 of See it", "steps 1 and 2 of See it"), as the See it showed them.
  const steps = stepPointers(gate.explain).flatMap((k) => state.see?.see?.steps.filter((s) => s.n === k) ?? []);
  const pointed = steps.length ? (
    <div className="flex flex-col gap-2.5">
      {steps.map((step) => (
        <Recess key={step.n} title={`Step ${step.n} of See it`} className={wholeMaths}>
          <div className="font-serif-lesson text-[19px] leading-[1.4] text-ink" data-reteach-step={step.n}>
            <Tex text={step.working} />
          </div>
          <div className="mt-2 font-serif-lesson text-[16px] leading-[1.45] text-ink-2">
            <MdInlines inlines={parseInline(step.decision)} />
          </div>
        </Recess>
      ))}
    </div>
  ) : null;
  const drawn = Reaction ? <Reaction hers={state.hers} correct={false} /> : null;
  return {
    eyebrow: sectionEyebrow(card, "Once more, in other words"),
    title: null,
    left: (
      <div role="status" tabIndex={-1} data-focus-quiet="" className="motion-reveal flex flex-col gap-3" data-reteach>
        <p className="font-serif-lesson text-[length:var(--fs-verdict)] font-semibold leading-[1.2] text-ink">Not quite.</p>
        <div className="flex flex-col gap-1.5">
          <p className="font-sans text-[14px] text-ink-2">You chose</p>
          <div className="flex items-center gap-3 rounded-[12px] border border-miss bg-[var(--miss-wash)] px-3.5 py-2.5 shadow-[inset_0_0_0_1px_var(--miss)]" data-her-choice aria-label={`You chose ${spokenText(state.hers)}`}>
            <span className="flex h-[26px] w-[26px] shrink-0 items-center justify-center rounded-full border-[1.5px] border-miss" aria-hidden>
              <MissMark size={16} label="" className="text-miss" />
            </span>
            <span className={clsx("font-serif-lesson text-[length:var(--fs-option)] leading-[1.35] text-ink", wholeMaths)}>
              <Tex text={gate.kind === "choice" ? optionTex(state.hers) : state.hers} />
            </span>
          </div>
        </div>
        {note && (
          <div className={clsx("font-serif-lesson text-[17px] leading-[1.45] text-ink", wholeMaths)} data-option-note>
            <Tex text={note.why} />
          </div>
        )}
        <Prose md={gate.explain} size="explain" />
      </div>
    ),
    // The figure's consequence and the step it rests on: under the words on the phone (the frame stacks the columns),
    // beside them on the desktop. Drawn once.
    right:
      drawn || pointed ? (
        <div className="flex flex-col gap-3">
          {drawn}
          {pointed}
        </div>
      ) : null,
  };
}

/* ---------------------------------------------------------------------------------------------------------- */

export function calloutParts(card: CalloutCard): CardParts {
  const b = card.block;
  const label = b.kind === "examiner" ? "Examiners say" : b.kind === "why" ? "Why it works" : b.kind === "spec" ? "The spec says" : b.kind === "mustknow" ? "Must know" : "Not on this spec";
  return {
    eyebrow: sectionEyebrow(card, label),
    title: b.title ? <MdInlines inlines={parseInline(b.title)} /> : label,
    left: (
      <Recess>
        <Prose md={b.md} size="explain" />
        {b.source && <p className="mt-2.5 font-serif-lesson text-[14px] italic text-ink-2">{b.source.startsWith("ccea-cer:") ? formatExaminerSource(b.source) : b.source}</p>}
      </Recess>
    ),
    right: null,
  };
}

export function interactionParts(
  card: InteractionCard,
  state: { checked: TapResult | null; checkSignal: number; onChecked: (r: TapResult) => void; figure?: TapState; onFigure?: (s: TapState) => void },
): CardParts {
  const spec = INTERACTIONS[card.id];
  // A descriptor naming a drawing the registry lacks is caught by the registry test; were one to slip through, the card
  // says nothing false and the frame lets her past it (SlidesRun: an unregistered interaction never locks the way on).
  if (!spec) return { eyebrow: sectionEyebrow(card, "Try it"), title: null, left: null, right: null };
  const { Component } = spec;
  return {
    eyebrow: sectionEyebrow(card, "Try it"),
    title: spec.title,
    left: (
      <div className="flex flex-col gap-3">
        <Prose md={spec.verb} />
        <Caption className="hidden lg:block">{spec.caption}</Caption>
      </div>
    ),
    right: (
      <div className="flex flex-col gap-2.5">
        <Component checked={state.checked} checkSignal={state.checkSignal} onChecked={state.onChecked} state={state.figure} onState={state.onFigure} />
        <Caption className="lg:hidden">{spec.caption}</Caption>
      </div>
    ),
  };
}

export function recapParts(card: RecapCard, glyphs: string[] | null, retriesNote: string | null): CardParts {
  return {
    eyebrow: "Recap",
    title: card.heading,
    left: (
      <div className="flex flex-col gap-4">
        <ul className="flex flex-col gap-3.5">
          {card.lines.map((line, i) => (
            <li key={line} className="flex items-center gap-3.5">
              {glyphs?.[i] && isRecapGlyph(glyphs[i]) ? <RecapGlyphFor kind={glyphs[i]} size={44} /> : <span aria-hidden className="mt-[2px] h-[6px] w-[6px] shrink-0 rounded-full bg-ink-3" />}
              <span className="font-serif-lesson text-[19px] leading-[1.4] text-ink lg:text-[23px]">
                <MdInlines inlines={parseInline(line)} />
              </span>
            </li>
          ))}
        </ul>
        {retriesNote && <Caption>{retriesNote}</Caption>}
      </div>
    ),
    right: null,
  };
}

/** The pointer: what the paper does with the lesson, in its recess, and the note's drawing of it beside it (the marks a scheme gives) when the note has one. */
export function pointerParts(card: PointerCard): CardParts {
  return {
    eyebrow: "Before the paper",
    title: card.heading,
    left: (
      <Recess>
        <Prose md={card.md} size="explain" />
      </Recess>
    ),
    right: card.figure?.svg ? <Illustrated id={null} figure={card.figure} caption={card.figure.caption ?? null} /> : null,
  };
}

/* ---------------------------------------------------------------------------------------------------------- */
/* The recall card: try it, show the answer, grade yourself; the grades are the frame's three controls.       */

const KIND_LABEL: Record<RecallCard["prompt"]["kind"], string> = {
  qa: "Recall",
  cloze: "Fill the gap",
  formula: "Formula",
  definition: "Definition",
  procedure: "Procedure",
  trap: "Trap",
  "label-diagram": "Label",
  "novel-example": "New example",
  quotation: "Quotation",
};

const GRADE_LABEL = { again: "Again", good: "Good", easy: "Easy" } as const;

export interface RecallState {
  revealed: boolean;
  /** What she typed, kept by the run so it stands beside the model answer (audit LD-06). */
  typed: string;
  onType: (text: string) => void;
  graded: keyof typeof GRADE_LABEL | null;
  skipped: boolean;
}

/**
 * Try it, then show the answer: what she typed stays on the card, above the model answer, with the scheme's key words
 * ticked where hers has them, so the comparison is hers to make. Nothing she types is marked or kept beyond this run.
 */
export function RecallBody({ card, revealed, typed, onType, graded, skipped }: { card: RecallCard } & RecallState) {
  const p = card.prompt;
  const keys = p.keyWords ?? [];
  const mine = typed.trim();
  const check = revealed && mine && keys.length > 0 ? keywordsPresent(mine, keys) : null;
  return (
    <div className={clsx("rounded-[12px] border border-line-2 bg-surface p-5", wholeMaths)} data-recall={p.id}>
      <StemTex text={p.prompt} className={stemWords(p.prompt)} />
      {!revealed ? (
        <div style={{ marginTop: "var(--gap-maths-field)" }}>
          <label htmlFor={`slide-recall-${p.id}`} className="mb-1.5 block font-sans text-[14px] text-ink-2">
            Type it, or say it in your head
          </label>
          <textarea
            id={`slide-recall-${p.id}`}
            value={typed}
            onChange={(e) => onType(e.target.value)}
            rows={2}
            autoComplete="off"
            spellCheck={false}
            className={clsx(fieldCls, "font-sans text-[16px]")}
          />
          {skipped && <p className="mt-2 font-sans text-[14px] text-ink-2">Skipped. Nothing was recorded, and it is not scheduled.</p>}
        </div>
      ) : (
        <div className="motion-reveal mt-4 flex flex-col gap-3 border-t border-line pt-3.5" role="status">
          {mine && (
            <div data-typed>
              <p className="font-sans text-[13px] font-medium text-ink-2">You wrote</p>
              <p className="mt-1 whitespace-pre-wrap break-words font-sans text-[16px] leading-[1.45] text-ink">{mine}</p>
            </div>
          )}
          <div data-model-answer>
            <p className="font-sans text-[13px] font-medium text-ink-2">The answer</p>
            <div className="mt-1 font-serif-lesson text-[17px] leading-[1.45] text-ink">
              <Tex text={p.answer} />
            </div>
          </div>
          {keys.length > 0 &&
            (check ? (
              <div>
                <ul className="flex flex-wrap gap-1.5" aria-label="The key words, and whether yours has each">
                  {keys.map((k) => {
                    const present = check.present.includes(k);
                    return (
                      <li key={k} className={clsx("inline-flex items-center gap-1 rounded-full border px-2 py-0.5 font-sans text-[13px]", present ? "border-ink-3 text-ink" : "border-line-3 text-ink-2")}>
                        {present ? <Tick size={12} label="in yours" /> : <MissMark size={12} label="not in yours" />}
                        <Tex text={k} />
                      </li>
                    );
                  })}
                </ul>
                <p className="mt-1.5 font-sans text-[13px] text-ink-2">{check.all ? "Every key word the scheme rewards is in yours." : "The scheme rewards each of these words."}</p>
              </div>
            ) : (
              <p className="font-sans text-[13px] text-ink-2">
                <span className="font-medium text-ink">Key words the scheme rewards:</span> {keys.join("; ")}.
              </p>
            ))}
          {graded && <p className="font-sans text-[14px] text-ink-2">Graded {GRADE_LABEL[graded]}. It comes back in your reviews.</p>}
        </div>
      )}
    </div>
  );
}

export function recallParts(card: RecallCard, state: RecallState): CardParts {
  return {
    eyebrow: `Recall · optional · ${card.index} of ${card.total} · ${KIND_LABEL[card.prompt.kind]}`,
    title: null,
    left: <RecallBody card={card} {...state} />,
    right: state.revealed ? null : (
      <Caption className="hidden lg:block">Type it or say it, then show the answer, or skip it: a skipped card records nothing and is not scheduled.</Caption>
    ),
  };
}
