"use client";

/**
 * One See it in the real Slides frame (src/components/slides/frame.tsx with seeParts), named by the address's hash:
 * `#<subject folder>/<topic id>/<block index>`. The bundle is fetched from /content as the lesson page fetches it, the
 * See it resolved as Slides resolves it, and the card given the frame's header, body and foot, so a measurement here is
 * a measurement of the card she uses. Continue shows the next step and lands the keyboard on it without scrolling, as
 * SlidesRun does; "Show every step" shows the ladder at once; "Step through again" starts over. Nothing is recorded.
 */
import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { focusLanding } from "@/components/shell/input-modality";
import { seeParts } from "@/components/slides/cards";
import { CardBody, SlidesFoot, SlidesHeader, slidesRootCls } from "@/components/slides/frame";
import { Kbd, controlPrimary } from "@/components/slides/ui";
import type { SeeBlock } from "@/components/items/gates";
import type { SeeCard } from "@/lib/slides/cards";
import type { StepResult } from "@/lib/slides/position";
import { resolveSee, typedStep } from "@/lib/slides/see";

interface Loaded {
  subject: string;
  topicId: string;
  block: number;
  title: string;
  card: SeeCard;
  nth: number;
  seeCount: number;
}

function parseHash(hash: string): { subject: string; topicId: string; block: number } | null {
  const m = /^#?([a-z-]+)\/([a-z0-9.-]+)\/(\d+)$/i.exec(decodeURIComponent(hash));
  if (!m) return null;
  return { subject: m[1]!, topicId: m[2]!, block: Number(m[3]) };
}

export function LabCard() {
  const [loaded, setLoaded] = useState<Loaded | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [shown, setShown] = useState(1);
  const [typedResult, setTypedResult] = useState<StepResult | null>(null);
  const [animate, setAnimate] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const landOnStep = useRef(false);

  // The case named by the hash, on load and whenever it changes.
  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      const want = parseHash(window.location.hash);
      setError(null);
      setLoaded(null);
      setShown(1);
      setTypedResult(null);
      if (!want) {
        setError("Name a See it in the address: #subject/topic-id/block-index (the lab page links each one).");
        return;
      }
      try {
        const res = await fetch(`/content/${want.subject}/${want.topicId}.json`);
        if (!res.ok) throw new Error(`${res.status}`);
        const bundle = (await res.json()) as { topic?: { title?: string }; noteBlocks?: unknown[]; workedExamples?: Parameters<typeof resolveSee>[1] };
        const blocks = bundle.noteBlocks ?? [];
        const block = blocks[want.block] as SeeBlock | undefined;
        if (!block || (block as { type?: string }).type !== "see") throw new Error(`block ${want.block} is not a See it`);
        const see = resolveSee(block, bundle.workedExamples ?? null);
        if (!see) throw new Error("the See it names a worked example the bundle does not ship");
        const sees = blocks.map((b, i) => ((b as { type?: string })?.type === "see" ? i : -1)).filter((i) => i >= 0);
        const nth = sees.indexOf(want.block) + 1;
        const card: SeeCard = { kind: "see", key: `lab:${want.topicId}:${want.block}`, section: null, first: false, see, firstSee: nth === 1, typed: typedStep(see, nth === 1) };
        if (!cancelled) setLoaded({ ...want, title: bundle.topic?.title ?? want.topicId, card, nth, seeCount: sees.length });
      } catch (e) {
        if (!cancelled) setError(`Could not load ${want.subject}/${want.topicId} block ${want.block}: ${e instanceof Error ? e.message : String(e)}`);
      }
    };
    void load();
    window.addEventListener("hashchange", load);
    return () => {
      cancelled = true;
      window.removeEventListener("hashchange", load);
    };
  }, []);

  const total = loaded?.card.see?.steps.length ?? 1;
  const typed = loaded?.card.typed ?? null;
  const waiting = typed !== null && typed < shown && typedResult === null;
  const complete = shown >= total && !waiting;

  const reveal = useCallback(() => {
    if (!loaded || waiting || shown >= total) return;
    landOnStep.current = true;
    setAnimate(true);
    setShown((s) => Math.min(total, s + 1));
  }, [loaded, shown, total, waiting]);
  const revealAll = useCallback(() => {
    if (!loaded) return;
    setAnimate(false);
    setShown(total);
    if (typed !== null && typedResult === null) setTypedResult({ shown: true });
  }, [loaded, total, typed, typedResult]);
  const restart = useCallback(() => {
    setAnimate(false);
    setShown(1);
  }, []);

  // The new step takes the keyboard where it arrives; nothing scrolls (as SlidesRun's landOn does for a step).
  useEffect(() => {
    if (!landOnStep.current) return;
    landOnStep.current = false;
    const el = cardRef.current?.querySelector<HTMLElement>("[data-step][data-current]");
    if (el) focusLanding(el);
  }, [shown]);

  // The lab's own controls live outside the frame so the frame stays the real one: the keys here (→ or Enter the next
  // step, A every step, R again), and the lab page's buttons beside each frame, which post the same three actions.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.defaultPrevented || e.altKey || e.ctrlKey || e.metaKey) return;
      const t = e.target as HTMLElement | null;
      if (t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.tagName === "BUTTON" || t.tagName === "A" || t.isContentEditable)) return;
      if (e.key === "ArrowRight" || e.key === "Enter") {
        e.preventDefault();
        reveal();
      } else if (e.key === "a" || e.key === "A") {
        e.preventDefault();
        revealAll();
      } else if (e.key === "r" || e.key === "R") {
        e.preventDefault();
        restart();
      }
    };
    const onMessage = (e: MessageEvent) => {
      if (e.origin !== window.location.origin) return;
      const d = e.data as { lab?: string } | null;
      if (!d || typeof d !== "object") return;
      if (d.lab === "step") reveal();
      else if (d.lab === "all") revealAll();
      else if (d.lab === "again") restart();
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener("message", onMessage);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("message", onMessage);
    };
  }, [restart, reveal, revealAll]);

  if (error) {
    return (
      <main className="p-8 font-sans text-ink" data-lab-error>
        <p className="max-w-[60ch] text-[15px] text-ink-2">{error}</p>
      </main>
    );
  }
  if (!loaded) return <main className="p-8 font-sans text-[15px] text-ink-2">Loading the See it…</main>;

  const parts = seeParts(loaded.card, { revealed: shown, typedResult, onTyped: (r) => setTypedResult(r), animateLast: animate, onSkip: null, onRestart: complete ? restart : null });
  // The control as the run draws it: live at the end too ("Your turn" goes on to the Your turn there; here it stays).
  const label = complete || shown >= total ? "Your turn" : "Continue";
  const control = waiting ? null : (
    <button type="button" className={controlPrimary} onClick={reveal} data-control>
      {label}
    </button>
  );
  const exit = (
    <Link href="/lab/see-its/" className="tap inline-flex items-center gap-1.5 font-sans text-[14px] text-ink-2 hover:text-ink lg:w-[120px]" data-exit>
      <span aria-hidden className="text-[18px] leading-none">
        ←
      </span>
      Lab
    </Link>
  );
  // The real foot's hints bar (desktop only), with the lab's keys in place of the run's; the foot's height is the run's.
  const hints = (
    <div className="hidden items-center gap-4 font-sans text-[13px] text-ink-3 lg:flex" data-hints>
      <span>
        <Kbd>→</Kbd> <Kbd>Enter</Kbd> {label.toLowerCase()}
      </span>
      <span>
        <Kbd>A</Kbd> every step
      </span>
      <span>
        <Kbd>R</Kbd> again
      </span>
      <span>{`${total} steps · ${loaded.subject} · ${loaded.topicId} · block ${loaded.block}`}</span>
    </div>
  );

  return (
    <div data-subject={loaded.subject} className="contents">
      <div data-slides data-palette="v2" data-lab-ready="" data-lab-case={`${loaded.topicId}:${loaded.block}`} data-lab-steps={total} className={slidesRootCls} role="region" aria-label={`Lab: ${loaded.title}`}>
        <SlidesHeader exit={exit} displayTitle={loaded.title} count={`See it ${loaded.nth} of ${loaded.seeCount}`} track={{ n: loaded.nth, N: loaded.seeCount }} parts={parts} />
        <CardBody cardRef={cardRef} cardKey={`${loaded.topicId}:${loaded.block}`} cardKind="see" count={`See it ${loaded.nth} of ${loaded.seeCount}`} parts={parts} />
        <SlidesFoot hints={hints} control={control} footNote={null} />
      </div>
    </div>
  );
}
