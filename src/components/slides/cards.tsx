"use client";

/**
 * The card bodies (docs/design/2026-09-23-art-direction-v2.md §8.1): each returns what goes in the frame's prose
 * column and, where the canvas draws one, its figure column. The frame (SlidesRun) owns the header, the track, the
 * one control and the navigation; a card body never navigates.
 */
import { useEffect, useRef, type ReactNode } from "react";
import { clsx } from "clsx";
import { InlineSvg, MdInlines, MissMark, Tex, Tick, keywordsPresent, parseInline, formatExaminerSource, optionLetter } from "@/components/items";
import { fieldCls } from "@/components/items/ui";
import { gateStem } from "@/components/topic/lesson-plan";
import { PhotoFigure } from "@/components/media/PhotoFigure";
import { SimEmbed } from "@/components/media/SimEmbed";
import { VideoEmbed } from "@/components/media/VideoEmbed";
import type { Card } from "@/lib/slides/cards";
import { optionTex } from "@/lib/gate-order";
import { ILLUSTRATIONS, INTERACTIONS, REACTIONS, RecapGlyphFor } from "./enrich";
import type { TapResult } from "./enrich/afs";
import type { TapState } from "./enrich/afs-model";
import { Caption, CardTitle, Eyebrow, Option, Prose, Recess, Stage, Verdict, type OptionState } from "./ui";

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

const sectionEyebrow = (card: { section: { n: number; total: number; title: string } | null }, what: string) =>
  card.section ? `${card.section.n} of ${card.section.total} · ${what}` : what;

/** A registered drawing on its stage, on the phone white with a hairline, on the desktop the wash. */
function Illustrated({ id, caption }: { id: string; caption?: ReactNode }) {
  const Fig = ILLUSTRATIONS[id];
  if (!Fig) return null;
  return (
    <div className="flex flex-col gap-2.5">
      <Stage>
        <Fig />
      </Stage>
      {caption}
    </div>
  );
}

export function ideaParts(card: IdeaCard, illustration: string | null): CardParts {
  return {
    eyebrow: card.first ? `Section ${card.section.n} of ${card.section.total}` : `Section ${card.section.n} of ${card.section.total} · ${card.section.title}`,
    title: card.first ? <MdInlines inlines={parseInline(card.section.heading)} /> : null,
    left: <Prose md={card.md} />,
    // The drawing divides out everything both lines share, the bracket and a 2 (audit CT-10); the caption says why.
    right: illustration ? <Illustrated id={illustration} caption={<Caption>Both lines are multiplied by (x + 5) and by 2, so both divide out. A term never does.</Caption>} /> : null,
  };
}

export function mediaParts(card: MediaCard): CardParts {
  const b = card.block;
  const eyebrow = sectionEyebrow(card, b.type === "video" ? "Watch" : b.type === "sim" ? "Try" : "Look");
  if (b.type === "video") {
    return {
      eyebrow,
      title: card.section?.heading ? <MdInlines inlines={parseInline(card.section.heading)} /> : b.title,
      left: (
        <div className="flex flex-col gap-3">
          <VideoEmbed video={{ provider: "youtube", ...b }} className="!my-0" />
          <Caption>The next card asks a question about it. Watching is not practice.</Caption>
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
      <Stage>
        <InlineSvg svg={b.svg} alt={b.alt} className="m-0 w-full" />
      </Stage>
    ) : null,
  };
}

/* ---------------------------------------------------------------------------------------------------------- */
/* The gate                                                                                                   */

/**
 * What happens to an answer, said once per gate card (on the phone in the foot, on the desktop beside the gate). True in
 * the behaviour: a first miss comes back once before the recap; an answer asked again is not recorded, and the first
 * answer's review card brings it back either way (audit LD-18, LD-19: "Nothing here is scored" sat beside "Recorded").
 */
export const GATE_NOTE = "A miss comes back once, before the recap.";
export const RETRY_NOTE = "Asked once more. Whatever you choose, it comes back in your reviews.";

export interface GateAnswer {
  answer: string;
  correct: boolean;
  /** "recorded": the first answer, now an attempt and a review card; "already": answered on an earlier visit; "retry": asked again, not recorded. */
  record: "recorded" | "already" | "retry";
}

export function GateStem({ prompt }: { prompt: string }) {
  const stem = gateStem(prompt);
  const sentence = clsx("font-serif-lesson text-[length:var(--fs-stem)] font-semibold text-ink", stem.stackedInline ? "leading-[1.6]" : "leading-[var(--lh-stem)]");
  return (
    <div data-stem>
      {stem.lead && (
        <div className={sentence}>
          <Tex text={stem.lead} />
        </div>
      )}
      {stem.maths && (
        <div
          className="py-0"
          style={{ marginTop: stem.lead ? "var(--gap-stem-maths)" : 0 }}
          data-stem-maths
        >
          <Tex text={`$$${stem.maths}$$`} />
        </div>
      )}
      {stem.tail && (
        <div className={sentence} style={{ marginTop: "var(--gap-stem-maths)" }}>
          <Tex text={stem.tail} />
        </div>
      )}
    </div>
  );
}

export function gateParts(
  card: GateCard,
  state: {
    selected: string | null;
    answer: GateAnswer | null;
    onSelect: (option: string) => void;
    reactionId: string | null;
    /** The options in the order shown: the lesson's balanced order (src/lib/gate-order.ts), the one Read shows. */
    options: readonly string[];
  },
): CardParts {
  const { gate } = card;
  const { selected, answer, onSelect, reactionId } = state;
  // Marking is by the option picked, so the order changes nothing about what is right.
  const options = gate.kind === "choice" ? state.options : [];
  const optionState = (opt: string): OptionState => {
    if (!answer) return selected === opt ? "chosen" : "";
    const right = opt.trim() === gate.answer.trim();
    if (right) return "ok";
    if (opt === answer.answer) return "miss";
    return "";
  };
  const Reaction = reactionId ? REACTIONS[reactionId] : null;
  const meta = !answer
    ? null
    : answer.record === "retry"
      ? answer.correct
        ? "Asked again, and held. The first answer is the one on record."
        : "Asked again. The first answer is the one on record."
      : answer.correct
        ? answer.record === "recorded"
          ? "Recorded. It comes back in your reviews."
          : "Already in your reviews from an earlier visit."
        : "This card comes back once more before the recap.";
  const eyebrowText = card.retry ? "Once more" : card.afterMedia === "video" ? "Check · watching is not practice" : "Check";
  return {
    eyebrow: sectionEyebrow(card, eyebrowText),
    title: null,
    left: (
      <div className="rounded-[12px] border border-line-2 bg-surface p-4 lg:p-5" data-gate={gate.id} data-retry={card.retry || undefined}>
        <GateStem prompt={gate.prompt} />
        {gate.kind === "choice" ? (
          <div role="radiogroup" aria-label="Choose" className="flex flex-col" style={{ marginTop: "var(--gap-maths-field)", gap: "var(--gap-option)" }}>
            {options.map((opt, i) => (
              // A stacked fraction at text size, the answers as legible as the question (optionTex, shared with Read).
              <Option key={opt} index={i + 1} value={opt} letter={optionLetter(i)} text={optionTex(opt)} state={optionState(opt)} disabled={answer !== null} onSelect={() => onSelect(opt)} />
            ))}
          </div>
        ) : (
          <TypedGateField gate={gate} selected={selected} answer={answer} onChange={onSelect} />
        )}
      </div>
    ),
    right: answer ? (
      <Verdict kind={answer.correct ? "ok" : "miss"} explain={gate.explain} meta={meta} reaction={Reaction ? <Reaction hers={answer.answer} correct={answer.correct} /> : undefined} />
    ) : (
      <Caption className="hidden lg:block">
        {gate.kind === "choice" ? "Choose with a tap or the keys 1 to 3, then Check or Enter." : "Type it, then Check or Enter."} {card.retry ? RETRY_NOTE : GATE_NOTE}
      </Caption>
    ),
  };
}

/** A blank or number gate: one field, 52 px, its label above; Enter checks through the frame. */
function TypedGateField({ gate, selected, answer, onChange }: { gate: GateCard["gate"]; selected: string | null; answer: GateAnswer | null; onChange: (v: string) => void }) {
  const ref = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (!answer) ref.current?.focus({ preventScroll: true });
  }, [answer]);
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
        value={answer ? answer.answer : selected ?? ""}
        onChange={(e) => onChange(e.target.value)}
        disabled={answer !== null}
        autoComplete="off"
        spellCheck={false}
        placeholder={gate.kind === "number" ? "Number" : "Fill the blank"}
        className={clsx(fieldCls, "tap-lg")}
      />
      {answer && !answer.correct && (
        <p className="mt-2 font-sans text-[14px] text-ink-2">
          Expected <Tex text={gate.answer.split("|")[0].trim()} />
        </p>
      )}
    </div>
  );
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
              {glyphs?.[i] ? <RecapGlyphFor kind={glyphs[i]} size={44} /> : <span aria-hidden className="mt-[2px] h-[6px] w-[6px] shrink-0 rounded-full bg-ink-3" />}
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

export function pointerParts(card: PointerCard): CardParts {
  return {
    eyebrow: "Before the paper",
    title: card.heading,
    left: (
      <Recess>
        <Prose md={card.md} size="explain" />
      </Recess>
    ),
    right: null,
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
    <div className="rounded-[12px] border border-line-2 bg-surface p-5" data-recall={p.id}>
      <p className="font-serif-lesson text-[length:var(--fs-stem)] font-semibold leading-[1.4] text-ink">
        <Tex text={p.prompt} />
      </p>
      {!revealed ? (
        <div style={{ marginTop: "var(--gap-maths-field)" }}>
          <label htmlFor={`slide-recall-${p.id}`} className="mb-1.5 block font-sans text-[14px] text-ink-2">
            Say it in your head, or type it
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
          {skipped && <p className="mt-2 font-sans text-[14px] text-ink-2">Skipped. Nothing was recorded.</p>}
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
    eyebrow: `Recall · ${card.index} of ${card.total} · ${KIND_LABEL[card.prompt.kind]}`,
    title: null,
    left: <RecallBody card={card} {...state} />,
    right: state.revealed ? null : (
      <Caption className="hidden lg:block">Say it or type it, then show the answer. Grading is yours to choose: Skip moves on and records nothing.</Caption>
    ),
  };
}
