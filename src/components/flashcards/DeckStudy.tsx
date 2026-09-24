"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { clsx } from "clsx";
import { Layers, RotateCcw } from "lucide-react";
import { Md } from "@/components/items";
import { btnPrimary, btnSecondary } from "@/components/items/ui";
import type { Flashcard, ShippedDeck } from "@/lib/content/deck-schema";
import { loadDeck } from "@/lib/content/decks";
import type { Subject } from "@/lib/content/taxonomy";
import { getDB } from "@/lib/db/db";
import { gradeFlashcard, touchSession } from "@/lib/session/record";
import type { ReviewGrade } from "@/lib/srs/scheduler";
import { ProgressLine } from "@/components/ux/ProgressLine";
import { CardSkeleton } from "@/components/ux/Skeleton";
import { tap } from "@/lib/ux/haptics";
import { sanitizeInlineSvg } from "@/lib/ux/svg";
import { SESSION_SIZE, sittingFrom } from "./sitting";

interface Props {
  subject: Subject;
  unit: string;
}

type Mode = "pick" | "study" | "done";
type Queued = Flashcard & { topicSlug: string; topicTitle: string };

/**
 * The corrections of pass 2f and the platform audit, and no more (the full redesign to Kinnu's standard waits for its
 * feature case): Study sits above the topic list on a phone, a sitting is a fixed fifteen cards rather than the whole
 * deck, the three grading buttons are 52 px and none of them is accented (none is more correct than the others),
 * keyboard hints show only where there is a keyboard, and the spacing is said in one line.
 */

const KIND_LABEL: Record<Flashcard["kind"], string> = {
  definition: "Definition",
  formula: "Formula",
  fact: "Fact",
  method: "Method",
  equation: "Equation",
  test: "Test",
  colour: "Colour",
  trap: "Trap",
  cloze: "Fill the gap",
  unit: "Unit",
  keyword: "Key word",
  example: "Quick example",
};

/** Shown only where there is a keyboard and a fine pointer: a phone has neither a space bar nor a 1, 2 and 3. */
const keyHint = "hidden [@media(hover:hover)_and_(pointer:fine)]:inline";

const inWords = (n: number) => ["no", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten", "eleven", "twelve", "thirteen", "fourteen", "fifteen"][n] ?? String(n);

export function DeckStudy({ subject, unit }: Props) {
  const [deck, setDeck] = useState<ShippedDeck | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [mode, setMode] = useState<Mode>("pick");
  const [queue, setQueue] = useState<Queued[]>([]);
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [tally, setTally] = useState({ again: 0, good: 0, easy: 0 });
  const startedAt = useRef<number>(0);
  /** Cards already studied in this visit, so "Another fifteen" moves on through the deck rather than repeating. */
  const studied = useRef<Set<string>>(new Set());

  useEffect(() => {
    loadDeck(subject, unit).then(setDeck).catch((e) => setError(String(e)));
    try {
      const preset = new URLSearchParams(window.location.search).get("topic");
      if (preset) setSelected(new Set([preset]));
    } catch {
      /* ignore */
    }
  }, [subject, unit]);

  const dueIds = useLiveQuery(async () => {
    try {
      const due = await getDB().cards.where("due").belowOrEqual(new Date()).and((c) => c.subject === subject).toArray();
      return new Set(due.map((c) => c.id));
    } catch {
      return new Set<string>();
    }
  }, [subject]);

  const allTopics = useMemo(() => deck?.sections.flatMap((s) => s.topics.map((t) => ({ ...t, sectionTitle: s.title }))) ?? [], [deck]);
  const pool = useMemo<Queued[]>(
    () =>
      allTopics
        .filter((t) => selected.size === 0 || selected.has(t.slug))
        .flatMap((t) => t.cards.map((c) => ({ ...c, topicSlug: t.slug, topicTitle: t.title }))),
    [allTopics, selected],
  );
  const remaining = pool.filter((c) => !studied.current.has(c.id)).length;
  const sessionSize = Math.min(SESSION_SIZE, remaining || pool.length);

  useEffect(() => {
    if (mode !== "study") return;
    const onKey = (e: KeyboardEvent) => {
      if (e.repeat) return;
      if (e.key === " ") {
        e.preventDefault();
        setFlipped((f) => !f);
      } else if (flipped && ["1", "2", "3"].includes(e.key)) {
        e.preventDefault();
        void grade((["again", "good", "easy"] as ReviewGrade[])[Number(e.key) - 1]);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, flipped, index]);

  function start(onlyDue = false) {
    if (remaining === 0) studied.current = new Set(); // the whole selection has been through: start it again
    const source = onlyDue ? pool.filter((c) => dueIds?.has(c.id)) : pool;
    const sitting = sittingFrom(source, dueIds ?? new Set(), studied.current, Date.now() % 100000);
    setQueue(sitting);
    setIndex(0);
    setFlipped(false);
    setTally({ again: 0, good: 0, easy: 0 });
    startedAt.current = Date.now();
    setMode("study");
  }

  const busy = useRef(false);
  async function grade(g: ReviewGrade) {
    if (busy.current || !flipped) return;
    busy.current = true;
    tap();
    const c = queue[index];
    const nextQueue = g === "again" ? [...queue, c] : queue; // an Again card comes back at the end of this sitting
    const tallyKey = g === "again" ? "again" : g === "easy" ? "easy" : "good";
    try {
      await gradeFlashcard({ id: c.id, subject, unit, topicSlug: c.topicSlug }, g);
      await touchSession(subject);
    } finally {
      studied.current.add(c.id);
      setTally((t) => ({ ...t, [tallyKey]: t[tallyKey] + 1 }));
      setQueue(nextQueue);
      setFlipped(false);
      setIndex(index + 1);
      if (index + 1 >= nextQueue.length) setMode("done");
      busy.current = false;
    }
  }

  if (error) return <p className="text-meta text-ink-2">Could not load this deck.</p>;
  if (!deck) return <CardSkeleton lines={4} />;

  if (mode === "study" && index < queue.length) {
    const c = queue[index];
    return (
      <div className="mx-auto max-w-2xl">
        <ProgressLine value={index} max={queue.length} label="Cards done" />
        <p className="mb-3 mt-3 flex items-baseline justify-between text-meta text-ink-2">
          <span className="tnum shrink-0 whitespace-nowrap">
            {index + 1} of {queue.length}
          </span>
          <span className="truncate pl-3 text-ink-2">{c.topicTitle}</span>
        </p>
        <button
          type="button"
          onClick={() => setFlipped((f) => !f)}
          aria-pressed={flipped}
          className="block w-full rounded-[var(--radius)] border border-line-2 bg-surface p-6 text-left"
          style={{ minHeight: 220 }}
        >
          <span className="flex items-center justify-between text-meta font-medium text-ink-2">
            <span>
              {KIND_LABEL[c.kind]}
              {c.tier === "H" ? " · Higher" : ""}
            </span>
            <span>
              {flipped ? "Answer" : "Tap to flip"}
              {!flipped && <span className={keyHint}> · space</span>}
            </span>
          </span>
          <div className="mt-4 text-prose leading-relaxed">
            {!flipped ? (
              <>
                {c.image && <div className="mb-3 text-ink [&>svg]:h-auto [&>svg]:max-w-full" dangerouslySetInnerHTML={{ __html: sanitizeInlineSvg(c.image.svg) }} aria-label={c.image.alt} role="img" />}
                <Md md={c.front} />
                {c.hint && <p className="mt-3 text-meta text-ink-2">Hint: {c.hint}</p>}
              </>
            ) : (
              <>
                <div className="mb-2">
                  <Md md={c.front} compact className="text-meta text-ink-2" />
                </div>
                <div className="border-t border-line pt-3">
                  <Md md={c.back} />
                </div>
                {c.keyWords && c.keyWords.length > 0 && <p className="mt-3 text-meta text-ink-2">Key words examiners look for: {c.keyWords.join(", ")}</p>}
              </>
            )}
          </div>
        </button>
        {/* Three buttons at thumb height, 52 px, none accented: none of them is more right than the others. */}
        <div className={clsx("mt-3 grid grid-cols-3 gap-2", !flipped && "pointer-events-none opacity-30")} aria-hidden={!flipped}>
          {(
            [
              ["again", "Again", "1"],
              ["good", "Good", "2"],
              ["easy", "Easy", "3"],
            ] as Array<[ReviewGrade, string, string]>
          ).map(([g, label, key]) => (
            <button
              key={g}
              type="button"
              disabled={!flipped}
              onClick={() => grade(g)}
              className="tap tap-lg rounded-[var(--radius-sm)] border border-line-3 bg-surface text-ui font-medium text-ink transition-transform duration-150 hover:bg-surface-2 active:scale-[0.98]"
            >
              {label}{" "}
              <span className={clsx("tnum text-micro font-normal text-ink-2", keyHint)}>{key}</span>
            </button>
          ))}
        </div>
        <button type="button" className="tap mt-4 inline-flex items-center text-meta text-ink-2 underline-offset-4 hover:underline" onClick={() => setMode("pick")}>
          Stop here
        </button>
      </div>
    );
  }

  if (mode === "done" || (mode === "study" && index >= queue.length)) {
    const minutes = Math.max(1, Math.round((Date.now() - startedAt.current) / 60_000));
    const left = pool.filter((c) => !studied.current.has(c.id)).length;
    const nextSize = Math.min(SESSION_SIZE, left);
    return (
      <div className="rise-in mx-auto max-w-xl rounded-[var(--radius)] border border-line-2 bg-surface p-6">
        <p className="text-meta font-medium text-ink-2">{left === 0 ? "Deck done" : "Done for now"}</p>
        <p className="tnum mt-2 text-h1 font-semibold tracking-[-0.01em]">
          {tally.again + tally.good + tally.easy} cards · {minutes} min
        </p>
        <p className="tnum mt-1 text-meta text-ink-2">
          Again {tally.again} · Good {tally.good} · Easy {tally.easy}. The ones you marked Again come back in your reviews first.
        </p>
        <p className="mt-1 text-meta text-ink-2">
          {left === 0 ? "Every card you chose has been through once." : `${left} more card${left === 1 ? "" : "s"} in what you chose.`} Saved on this device.
        </p>
        <div className="mt-5 flex flex-wrap gap-2">
          <button type="button" className={clsx(btnPrimary, "tap-lg")} onClick={() => start(false)}>
            {left === 0 ? "Again from the start" : `Another ${inWords(nextSize)}`}
          </button>
          <button type="button" className={btnSecondary} onClick={() => setMode("pick")}>
            Choose topics
          </button>
        </div>
      </div>
    );
  }

  const dueInDeck = allTopics.reduce((n, t) => n + t.cards.filter((c) => dueIds?.has(c.id)).length, 0);
  const dueInPool = pool.filter((c) => dueIds?.has(c.id)).length;

  return (
    <div className="flex flex-col gap-6 lg:grid lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)] lg:items-start">
      {/* On a phone the way in comes first, above the list of topics it draws from (the audit found it at 1,299 px). */}
      <aside className="lg:sticky lg:top-6 lg:order-2" aria-labelledby="deck-heading">
        <div className="rounded-[var(--radius)] border border-line-2 bg-surface p-5 sm:p-6">
          <p id="deck-heading" className="flex items-center gap-2 text-meta font-medium text-ink-2">
            <Layers size={16} strokeWidth={1.5} aria-hidden /> {selected.size ? "Your choice" : "This deck"}
          </p>
          <p className="tnum mt-2 text-h3 font-semibold">
            {pool.length} cards · {selected.size ? `${selected.size} of ${deck.counts.topics}` : deck.counts.topics} topics
          </p>
          <p className="tnum text-meta text-ink-2">{dueInDeck ? `${dueInDeck} due now in the deck` : "Nothing due in this deck"}</p>
          <button type="button" onClick={() => start(false)} className={clsx(btnPrimary, "tap-lg mt-4 w-full")}>
            Study {sessionSize} cards
          </button>
          {dueInPool > 0 && (
            <button type="button" onClick={() => start(true)} className={clsx(btnSecondary, "mt-2 w-full")}>
              <RotateCcw size={16} strokeWidth={1.5} aria-hidden />{" "}
              {dueInPool <= SESSION_SIZE ? `Only the ${dueInPool} due` : `Only due cards, ${SESSION_SIZE} of ${dueInPool}`}
            </button>
          )}
          {selected.size > 0 && (
            <button type="button" onClick={() => setSelected(new Set())} className="tap mt-1 inline-flex items-center text-meta text-ink-2 underline-offset-4 hover:underline">
              Clear selection
            </button>
          )}
          <p className="mt-3 text-meta text-ink-2">
            Fifteen at a time, the due ones first. Again brings a card back before you finish and sooner in your reviews; Good and Easy send it further out.
          </p>
        </div>
      </aside>

      <div className="flex flex-col gap-4 lg:order-1">
        {deck.sections.map((s) => (
          <section key={s.id} aria-label={s.title}>
            <h2 className="border-b border-line pb-2 text-meta font-medium text-ink-2">{s.title}</h2>
            <ul className="divide-y divide-line">
              {s.topics.map((t) => {
                const on = selected.has(t.slug);
                const due = t.cards.filter((c) => dueIds?.has(c.id)).length;
                return (
                  <li key={t.slug}>
                    <label className="flex min-h-[52px] cursor-pointer items-center gap-3 py-2 hover:bg-surface-2">
                      <input
                        type="checkbox"
                        checked={on}
                        onChange={() => {
                          const next = new Set(selected);
                          if (on) next.delete(t.slug);
                          else next.add(t.slug);
                          setSelected(next);
                          studied.current = new Set();
                        }}
                        className="h-5 w-5 accent-[var(--ink)]"
                      />
                      <span className="min-w-0 flex-1 text-ui">{t.title}</span>
                      <span className="tnum shrink-0 text-meta text-ink-2">
                        {t.cards.length} cards{due ? ` · ${due} due` : ""}
                      </span>
                    </label>
                  </li>
                );
              })}
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
}
