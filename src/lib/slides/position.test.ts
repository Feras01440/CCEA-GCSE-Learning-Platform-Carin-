import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { nextRun, readPosition, withKnownFigures, writePosition, type SlidesPosition } from "./position";

// A minimal localStorage for the node test environment.
beforeEach(() => {
  const store = new Map<string, string>();
  (globalThis as unknown as { window: unknown }).window = {
    localStorage: {
      getItem: (k: string) => store.get(k) ?? null,
      setItem: (k: string, v: string) => void store.set(k, v),
      removeItem: (k: string) => void store.delete(k),
    },
  };
});
afterEach(() => {
  delete (globalThis as unknown as { window?: unknown }).window;
});

const run: SlidesPosition = {
  at: 9,
  key: "interaction:afs.tap-to-cancel",
  done: false,
  missed: ["g2"],
  answers: { g12: { answer: "$(x+9)(x-9)$", correct: true, record: "recorded" } },
  checked: { "interaction:afs.tap-to-cancel": { correct: true } },
  graded: { "recall:rp.fm.u1.algebraic-fractions-simplify.02": "good" },
  typed: { "recall:rp.fm.u1.algebraic-fractions-simplify.08": "the numbers" },
  skipped: { "recall:rp.fm.u1.algebraic-fractions-simplify.02": true },
  figures: { "interaction:afs.tap-to-cancel": { struck: ["t-b", "b-b", "t-n", "b-n"], lit: [] } },
  steps: { "see:only-a-factor-divides-out:1": 3, "see:simplify-before-you-substitute:1": 3 },
  typedSteps: { "see:simplify-before-you-substitute:1": { raw: "10", correct: true }, "see:elsewhere:1": { shown: true } },
  shown: { g2: true },
  seen: ["see:only-a-factor-divides-out:1"],
  seenBefore: ["see:factorise-first:1"],
};

/** What a run saved before a field existed reads it as. */
const EMPTY = { typed: {}, skipped: {}, figures: {}, steps: {}, typedSteps: {}, shown: {}, seen: [], seenBefore: [] };

describe("her place in the slides, kept on the device", () => {
  it("keeps everything the run did, the figure's strikes, what she typed, the See it steps and the answers she asked to see (audit CQ-04, LD-06)", () => {
    writePosition("fm.u1.algebraic-fractions-simplify", run);
    expect(readPosition("fm.u1.algebraic-fractions-simplify")).toEqual(run);
  });

  it("starts the run after a finished one afresh, keeping only the See its she has seen to their end (for Skip to your turn)", () => {
    const finished: SlidesPosition = { ...run, done: true };
    const next = nextRun(finished);
    expect(next).toEqual({ at: 0, done: false, missed: [], answers: {}, checked: {}, graded: {}, ...EMPTY, seenBefore: ["see:factorise-first:1", "see:only-a-factor-divides-out:1"] });
    expect(nextRun(next).seenBefore).toEqual(next.seenBefore);
  });

  it("keeps the card's key beside its index, so an edited note reopens on the same card (audit CQ-17)", () => {
    writePosition("t", run);
    expect(readPosition("t")?.key).toBe("interaction:afs.tap-to-cancel");
  });

  it("reads a run saved before these fields existed", () => {
    (globalThis as unknown as { window: { localStorage: Storage } }).window.localStorage.setItem("cairn.slides.old", JSON.stringify({ at: 3, done: false, missed: [], answers: {}, checked: {}, graded: {} }));
    expect(readPosition("old")).toEqual({ at: 3, done: false, missed: [], answers: {}, checked: {}, graded: {}, ...EMPTY });
  });

  it("drops what is not what it claims to be", () => {
    (globalThis as unknown as { window: { localStorage: Storage } }).window.localStorage.setItem(
      "cairn.slides.bad",
      JSON.stringify({ at: 2, typed: { a: 1, b: "ok" }, figures: { f: { struck: ["t-b", 3], lit: "no" } }, steps: { s: 2, t: "3", u: 0 }, typedSteps: { s: { raw: 5 }, t: { shown: true } }, seen: ["a", 1] }),
    );
    expect(readPosition("bad")).toMatchObject({ typed: { b: "ok" }, figures: { f: { struck: ["t-b"], lit: [] } }, steps: { s: 2 }, typedSteps: { t: { shown: true } }, seen: ["a"] });
  });
});

describe("a figure kept from an earlier drawing starts afresh (the trial's example changed on 25 Sep)", () => {
  const TAP = "interaction:afs.tap-to-cancel";
  const pieces = ["t-n", "t-b", "b-n", "b-b", "b-m"];
  const piecesFor = (key: string) => (key === TAP ? pieces : null);

  it("drops the strikes and the Check of a figure whose pieces the deck no longer draws", () => {
    // A run from build 8: 2x(x + 5) over 4(x + 5)(x − 5), finished and checked.
    const old = { figures: { [TAP]: { struck: ["t-b", "b-b", "t-2x", "b-4"], lit: [] } }, checked: { [TAP]: { correct: true }, other: { correct: false } } };
    expect(withKnownFigures(old, piecesFor)).toEqual({ figures: {}, checked: { other: { correct: false } } });
    // A lit piece from the old drawing counts too.
    expect(withKnownFigures({ figures: { [TAP]: { struck: ["t-b", "b-b"], lit: ["t-2x", "b-4"] } }, checked: { [TAP]: { correct: false } } }, piecesFor)).toEqual({ figures: {}, checked: {} });
  });

  it("keeps a figure made on this drawing, and anything that is not a figure she acts on", () => {
    expect(withKnownFigures({ figures: run.figures, checked: run.checked }, piecesFor)).toEqual({ figures: run.figures, checked: run.checked });
    const unknownCard = { figures: { "interaction:gone": { struck: ["zz"], lit: [] } }, checked: { "interaction:gone": { correct: true } } };
    expect(withKnownFigures(unknownCard, piecesFor)).toEqual(unknownCard);
  });
});
