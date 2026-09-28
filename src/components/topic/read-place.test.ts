import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  arrivalFor,
  continued,
  finishedLesson,
  frontierOf,
  lastReadLesson,
  legacyFinished,
  newPlace,
  paused,
  readPlace,
  READ_LAST_KEY,
  READ_PLACE_KEY,
  resumeHref,
  resumeState,
  touched,
  writePlace,
  type ReadPlace,
} from "./read-place";

// A minimal localStorage for the node test environment.
let store: Map<string, string>;
beforeEach(() => {
  store = new Map<string, string>();
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

/** The trial note as build 8 served it: seven sections, the third with two checks (g7 then g3), the fifth with two. */
const BUILD8 = [
  { title: "Simplifying algebraic fractions", gateIds: ["g1"] },
  { title: "Why cancelling works, and when it does not", gateIds: ["g2"] },
  { title: "The three moves", gateIds: ["g7", "g3"] },
  { title: "See it done", gateIds: ["g4"] },
  { title: "Fully means fully", gateIds: ["g5", "g6"] },
  { title: "You can now", gateIds: [] },
  { title: "In the exam", gateIds: [] },
];
/** The trial note as the source has it now (27 Sep): nine sections, the sixth with two checks. */
const NOW = [
  { title: "Why cancelling works, and when it does not", gateIds: ["g2"] },
  { title: "A square minus a square", gateIds: ["g12"] },
  { title: "Two squares with a number in front", gateIds: ["g9"] },
  { title: "A common factor first", gateIds: ["g13"] },
  { title: "The three moves", gateIds: ["g4"] },
  { title: "Fully means fully", gateIds: ["g10", "g11"] },
  { title: "How the paper asks it", gateIds: ["g8"] },
  { title: "You can now", gateIds: [] },
  { title: "In the exam", gateIds: [] },
];
const META = { topicId: "fm.u1.algebraic-fractions-simplify", subject: "further-maths" as const, unit: "FM1", slug: "algebraic-fractions-simplify", title: "Simplifying algebraic fractions" };
const T0 = new Date("2026-09-27T18:00:00Z");
const T1 = new Date("2026-09-27T18:05:00Z");
const T2 = new Date("2026-09-27T18:09:00Z");

describe("where she is: one reading of the place and her answers, for the page, the track and the hero", () => {
  it("finds the section holding the first check she has not answered", () => {
    expect(frontierOf(BUILD8, [])).toBe(1);
    expect(frontierOf(BUILD8, ["g1", "g2", "g7"])).toBe(3);
    expect(frontierOf(BUILD8, ["g1", "g2", "g7", "g3", "g4", "g5", "g6"])).toBeNull();
  });

  it("with no place kept, a first visit opens section 1 and the hero names no section", () => {
    expect(resumeState({ sections: BUILD8, answered: [], place: null })).toEqual({ open: 1, sectionNumber: null, finished: false });
  });

  it("with no place kept, the page opens as far as her answers reach: every section once all are answered", () => {
    const openFor = (answered: string[], sections = BUILD8) => resumeState({ sections, answered, place: null }).open;
    expect(openFor(["g1"])).toBe(2);
    expect(openFor(["g1", "g2", "g7", "g3", "g4", "g5"])).toBe(5);
    expect(openFor(["g1", "g2", "g7", "g3", "g4", "g5", "g6"])).toBe(7);
    expect(openFor([], [{ title: "One", gateIds: [] }, { title: "Two", gateIds: [] }])).toBe(1);
    expect(openFor([], [])).toBe(0);
  });

  it("with no place kept (answers given in Slides, or on a classic page), a section with no check is not skipped", () => {
    const withReading = [
      { title: "One", gateIds: ["a"] },
      { title: "Two", gateIds: ["b"] },
      { title: "Three, read only", gateIds: [] },
      { title: "Four", gateIds: ["d"] },
    ];
    expect(resumeState({ sections: withReading, answered: ["a", "b"], place: null })).toEqual({ open: 4, sectionNumber: 3, finished: false });
    expect(resumeState({ sections: withReading, answered: ["a"], place: null })).toEqual({ open: 2, sectionNumber: 2, finished: false });
    // A check answered past one still waiting (Slides lets her on): she is where the waiting check is.
    expect(resumeState({ sections: withReading, answered: ["a", "d"], place: null })).toEqual({ open: 2, sectionNumber: 2, finished: false });
  });

  it("HERO-1: stopped in section 3 with its first check answered and its second not, she is in section 3, not 4", () => {
    const answered = ["g1", "g2", "g7"];
    expect(resumeState({ sections: BUILD8, answered, place: null })).toEqual({ open: 3, sectionNumber: 3, finished: false });
    const place: ReadPlace = { ...newPlace(META, BUILD8, T0), open: 3, openTitle: "The three moves" };
    expect(resumeState({ sections: BUILD8, answered, place })).toEqual({ open: 3, sectionNumber: 3, finished: false });
  });

  it("READ-9: a check answered without Continue keeps her in its section; only Continue moves her on", () => {
    const place = touched(newPlace(META, BUILD8, T0), BUILD8, T1);
    expect(resumeState({ sections: BUILD8, answered: ["g1"], place })).toEqual({ open: 1, sectionNumber: 1, finished: false });
    const on = continued(place, 1, BUILD8, T2);
    expect(on.open).toBe(2);
    expect(on.openTitle).toBe("Why cancelling works, and when it does not");
    expect(resumeState({ sections: BUILD8, answered: ["g1"], place: on })).toEqual({ open: 2, sectionNumber: 2, finished: false });
  });

  it("READ-9: every check answered does not open the sections after the one she is in", () => {
    const all = ["g1", "g2", "g7", "g3", "g4", "g5", "g6"];
    const place: ReadPlace = { ...newPlace(META, BUILD8, T0), open: 5, openTitle: "Fully means fully" };
    expect(resumeState({ sections: BUILD8, answered: all, place })).toEqual({ open: 5, sectionNumber: 5, finished: false });
  });

  it("a place never runs past a check still to answer (a check added to the note later waits for her)", () => {
    const place: ReadPlace = { ...newPlace(META, BUILD8, T0), open: 5, openTitle: "Fully means fully" };
    expect(resumeState({ sections: BUILD8, answered: ["g1", "g2"], place })).toEqual({ open: 3, sectionNumber: 3, finished: false });
  });

  it("a finished lesson stays finished while every check is answered, and reopens honestly when one is not", () => {
    const all = ["g1", "g2", "g7", "g3", "g4", "g5", "g6"];
    const done = finishedLesson(newPlace(META, BUILD8, T0), BUILD8, T1);
    expect(done.finished).toBe(true);
    expect(resumeState({ sections: BUILD8, answered: all, place: done })).toEqual({ open: 7, sectionNumber: null, finished: true });
    expect(resumeState({ sections: BUILD8, answered: all.slice(0, 6), place: done })).toEqual({ open: 5, sectionNumber: 5, finished: false });
    // The device that finished on build 7 or 8 kept only cairn.read.finished.<topic>: still finished.
    expect(resumeState({ sections: BUILD8, answered: all, place: null, legacyFinished: true })).toEqual({ open: 7, sectionNumber: null, finished: true });
  });

  it("a place survives a content edit that renumbers the sections: it is found again by its section's title", () => {
    const old: ReadPlace = { ...newPlace(META, BUILD8, T0), total: 7, open: 5, openTitle: "Fully means fully" };
    const answered = ["g2", "g12", "g9", "g13", "g4"];
    expect(resumeState({ sections: NOW, answered, place: old })).toEqual({ open: 6, sectionNumber: 6, finished: false });
    // A title that is gone: the number, clamped to the note, and never past the first check still to answer.
    const lost: ReadPlace = { ...old, openTitle: "See it done", open: 4 };
    expect(resumeState({ sections: NOW, answered, place: lost })).toEqual({ open: 4, sectionNumber: 4, finished: false });
  });
});

describe("Pause here and Continue: what each press keeps (READ-12: 'the lesson opens at the next section')", () => {
  it("Pause here at the end of the section she is in opens the next one for next time, and says when", () => {
    const place = { ...newPlace(META, NOW, T0), open: 3, openTitle: "Two squares with a number in front" };
    const p = paused(place, 3, NOW, T1);
    expect(p.open).toBe(4);
    expect(p.openTitle).toBe("A common factor first");
    expect(p.pausedAt).toBe(T1.toISOString());
    expect(p.updatedAt).toBe(T1.toISOString());
    expect(p.finished).toBe(false);
  });

  it("Pause here under a section she has already moved past changes nothing but the time", () => {
    const place = { ...newPlace(META, NOW, T0), open: 5, openTitle: "The three moves" };
    const p = paused(place, 2, NOW, T1);
    expect(p.open).toBe(5);
    expect(p.pausedAt).toBe(T1.toISOString());
  });

  it("Pause here at the end of the last section is the lesson finished; Continue never runs past the end", () => {
    const place = { ...newPlace(META, NOW, T0), open: 9, openTitle: "In the exam" };
    expect(paused(place, 9, NOW, T1).finished).toBe(true);
    expect(continued(place, 9, NOW, T1).open).toBe(9);
  });

  it("the record knows the lesson it belongs to and how long it is", () => {
    const p = newPlace(META, NOW, T0);
    expect(p).toEqual({ v: 1, ...META, total: 9, open: 1, openTitle: "Why cancelling works, and when it does not", finished: false, updatedAt: T0.toISOString(), pausedAt: null });
  });
});

describe("kept on this device, and what Today reads (the paused-lesson record)", () => {
  it("writes the place and the lesson she last worked in; reads them back", () => {
    const p = paused({ ...newPlace(META, NOW, T0), open: 3, openTitle: "Two squares with a number in front" }, 3, NOW, T1);
    writePlace(p);
    expect(readPlace(META.topicId)).toEqual(p);
    expect(JSON.parse(store.get(READ_LAST_KEY) ?? "{}")).toEqual({ topicId: META.topicId, at: T1.toISOString() });
    expect(store.has(READ_PLACE_KEY(META.topicId))).toBe(true);
  });

  it("Today: the lesson she paused, the sections done, that pausing was the last thing she did, and the way back", () => {
    writePlace(paused({ ...newPlace(META, NOW, T0), open: 3, openTitle: "Two squares with a number in front" }, 3, NOW, T1));
    const last = lastReadLesson();
    expect(last?.place.open).toBe(4);
    expect(last?.done).toBe(3);
    expect(last?.pausedLast).toBe(true);
    expect(last?.href).toBe("/learn/further-maths/FM1/algebraic-fractions-simplify/#resume");
    // She came back and pressed Continue: still her lesson, no longer a pause.
    writePlace(continued(readPlace(META.topicId)!, 4, NOW, T2));
    expect(lastReadLesson()?.pausedLast).toBe(false);
    expect(lastReadLesson()?.place.open).toBe(5);
  });

  it("Today shows nothing for a finished lesson, nothing when nothing is kept, and survives a broken record", () => {
    expect(lastReadLesson()).toBeNull();
    writePlace(finishedLesson(newPlace(META, NOW, T0), NOW, T1));
    expect(lastReadLesson()).toBeNull();
    store.set(READ_LAST_KEY, "not json");
    expect(lastReadLesson()).toBeNull();
    store.set(READ_PLACE_KEY("x"), JSON.stringify({ v: 1, topicId: "x", open: "three" }));
    expect(readPlace("x")).toBeNull();
  });

  it("with no storage at all (private mode, the server) every read is empty and no write throws", () => {
    delete (globalThis as unknown as { window?: unknown }).window;
    expect(readPlace(META.topicId)).toBeNull();
    expect(lastReadLesson()).toBeNull();
    expect(legacyFinished(META.topicId)).toBe(false);
    expect(() => writePlace(newPlace(META, NOW, T0))).not.toThrow();
  });

  it("reads the finished mark build 7 and 8 kept", () => {
    store.set("cairn.read.finished.fm.u1.algebraic-fractions-simplify", "1");
    expect(legacyFinished(META.topicId)).toBe(true);
    expect(resumeHref({ subject: "maths", unit: "M4", slug: "histograms-unequal-widths" })).toBe("/learn/maths/M4/histograms-unequal-widths/#resume");
  });
});

describe("arriving on the page: her exact place after a reload or Back, the section after a link to it, else the top (READ-11)", () => {
  const base = { docType: "navigate" as const, docPath: "/learn/further-maths/FM1/algebraic-fractions-simplify/", path: "/learn/further-maths/FM1/algebraic-fractions-simplify/", firstMount: true, popped: false, discarded: false, hash: "", anchor: true };

  it("a reload, a Back into a fresh load and a discarded tab come back to where she was reading", () => {
    expect(arrivalFor({ ...base, docType: "reload" })).toBe("restore");
    expect(arrivalFor({ ...base, docType: "back_forward" })).toBe("restore");
    expect(arrivalFor({ ...base, discarded: true })).toBe("restore");
  });

  it("Back from Today inside the app comes back to where she was reading", () => {
    expect(arrivalFor({ ...base, docPath: "/", firstMount: false, popped: true })).toBe("restore");
    expect(arrivalFor({ ...base, docPath: "/", firstMount: true, popped: true })).toBe("restore");
  });

  it("a link opens where it says: #resume at her section, a stage at the stage, otherwise the top", () => {
    expect(arrivalFor({ ...base, hash: "resume" })).toBe("resume");
    expect(arrivalFor({ ...base, docPath: "/", firstMount: true, hash: "resume" })).toBe("resume");
    expect(arrivalFor({ ...base, hash: "practice" })).toBe("hash");
    expect(arrivalFor({ ...base })).toBe("top");
    // Today was the page reloaded, then a link to the topic: a new visit, not a reload of this page.
    expect(arrivalFor({ ...base, docType: "reload", docPath: "/", firstMount: true })).toBe("top");
  });

  it("nothing to restore without an anchor kept in this tab: the link's own target, or the top", () => {
    expect(arrivalFor({ ...base, docType: "reload", anchor: false })).toBe("top");
    expect(arrivalFor({ ...base, docType: "reload", anchor: false, hash: "resume" })).toBe("resume");
  });
});
