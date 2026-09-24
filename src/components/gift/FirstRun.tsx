"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { Wordmark } from "@/components/shell/Nav";
import { PRODUCT } from "@/lib/product";
import { DEFAULT_PLAN, formatPaperDate, nextPaper, planSummary, todayISO, type ExamPlan } from "@/lib/plan/exam-plan";
import { getSetting, loadPlan, savePlan, setSetting } from "@/lib/plan/store";
import { GIVER_NAME, NOTES } from "@/lib/gift/unlocks";
import { SeededLesson } from "./SeededLesson";

/**
 * First run: her brother's note, her name and the plan, then the seeded lesson.
 *
 * Rowan is not here. Its first Letter is offered on the first Today after first run (decision 3 of the
 * platform programme, 22 September 2026): on this screen it stood above "Two things before you start" with
 * a second name field beside hers, lengthened the part the learner review asked to keep short, and was
 * marked read by "Begin" whether or not she had read it. Today carries it instead, under Start, in plain
 * words, with the rename there; and nothing Rowan says is spent before first run is done (select.ts,
 * "first-run").
 */
export function FirstRun() {
  const router = useRouter();
  const [plan, setPlan] = useState<ExamPlan>(DEFAULT_PLAN);
  const [name, setName] = useState("");
  const [step, setStep] = useState<0 | 1 | 2>(0);

  useEffect(() => {
    loadPlan().then((p) => {
      setPlan(p);
      if (p.learnerName) setName(p.learnerName);
    });
    /**
     * Read once, not live: `begin()` writes `firstRunDone` before the seeded lesson so that a reload
     * in the middle of it lands on Today rather than starting the gift again, and a live read would
     * take the lesson off the screen the moment that setting is written.
     */
    getSetting("firstRunDone", false)
      .then((done) => {
        if (done === true) router.replace("/");
      })
      .catch(() => {});
  }, [router]);

  const welcome = NOTES.find((n) => n.unlock.event === "first-open");
  const next = nextPaper(plan, todayISO());

  /**
   * The plan is confirmed and first run is done — written here, before the seeded lesson, so a
   * reload lands on Today. What follows is not part of the setup: it is the lesson itself.
   */
  async function begin() {
    const updated = { ...plan, learnerName: name.trim() || null };
    setPlan(updated);
    await savePlan(updated);
    await setSetting("firstRunDone", true);
    await setSetting("events", ["first-open"]);
    setStep(2);
  }

  /**
   * The way out, on every step. Before the plan is confirmed it still writes `firstRunDone` and the
   * plan as it stands, because leaving must mean leaving: Today would otherwise send her straight
   * back here. Nothing is withheld for skipping, and nothing asks her to stay.
   */
  async function skip() {
    if (step < 2) {
      await savePlan({ ...plan, learnerName: name.trim() || null });
      await setSetting("firstRunDone", true);
      await setSetting("events", ["first-open"]);
    }
    router.push("/");
  }

  return (
    <div className={step === 2 ? "mx-auto max-w-2xl py-6" : "mx-auto max-w-xl py-6"}>
      <div className="mb-8 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Wordmark size={26} />
          <span className="text-[19px] font-semibold tracking-tight">{PRODUCT.name}</span>
        </div>
        {/* Quiet, on every step, and one click away from the rest of the app. */}
        <button type="button" onClick={() => void skip()} className="tap text-meta text-ink-2 underline-offset-4 hover:underline">
          Skip to Today
        </button>
      </div>

      {step === 0 && welcome && (
        <section className="rise-in rounded-[var(--radius)] border border-line bg-surface p-6 shadow-[var(--shadow-2)]">
          <p className="text-meta font-medium text-ink-2">A note from {GIVER_NAME}</p>
          <h1 className="mt-2 text-[26px] font-semibold tracking-tight">{welcome.title}</h1>
          <p className="prose-note mt-3 text-[16px] leading-relaxed">{welcome.body}</p>
          <button
            type="button"
            onClick={() => setStep(1)}
            className="tap mt-6 inline-flex items-center gap-2 rounded-[var(--radius-sm)] bg-accent px-5 font-medium text-accent-ink"
          >
            Continue <ArrowRight size={18} aria-hidden />
          </button>
        </section>
      )}

      {step === 1 && (
        <section className="rise-in rounded-[var(--radius)] border border-line bg-surface p-6 shadow-[var(--shadow-2)]">
          <h1 className="text-[24px] font-semibold tracking-tight">Two things before you start</h1>
          <label className="mt-5 block text-meta text-ink-2">
            What should it call you?
            <input
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="tap mt-1 w-full rounded-[var(--radius-sm)] border border-line-3 bg-surface px-3 text-[16px] text-ink"
              placeholder="First name"
            />
          </label>
          <div className="mt-5 rounded-[var(--radius-sm)] bg-surface-2 p-4 text-meta">
            <p className="font-medium">Your exam plan is already filled in</p>
            <p className="mt-1 text-ink-2">
              {planSummary(plan)}
            </p>
            {next && (
              <p className="mt-1 text-ink-2">
                Next paper: <span className="font-medium text-ink">{next.label}</span>, {formatPaperDate(next.date)}
                {next.start ? ` at ${next.start}` : ""}. You can change any of this in Settings.
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={begin}
            className="tap mt-6 inline-flex items-center gap-2 rounded-[var(--radius-sm)] bg-accent px-5 font-medium text-accent-ink"
          >
            Begin <ArrowRight size={18} aria-hidden />
          </button>
        </section>
      )}

      {/* First run ends inside the lesson, not on Today: one section, one check, one marked question. */}
      {step === 2 && <SeededLesson plan={plan} today={todayISO()} onDone={() => router.push("/")} />}
    </div>
  );
}
