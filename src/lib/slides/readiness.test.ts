import { describe, expect, it } from "vitest";
import {
  CLOSING_ROLES,
  REVIEW_TOOL,
  REVIEW_TYPE,
  SECTION_ROLES,
  TEACHING_ROLES,
  hasSeeBlock,
  lessonReadiness,
  noteStructure,
  reviewOf,
  sectionsOf,
} from "./readiness";

/**
 * Lesson readiness on fixtures (27 Sep 2026): a topic is ready for Slides and Read v2 when its note passes lesson
 * structure v3 AND the latest teach-show-check review in the note's own verification log says pass, or when that review
 * is the waiver and the note has no See it block yet. Nothing here names a real topic: the rule reads roles and block
 * types only.
 */

type Json = Record<string, unknown>;

const hero = { type: "hero", lede: "What this is.", can: ["Do the thing"], minutes: 5 };
const h = (text: string, role?: string): Json => ({ type: "h", text, ...(role ? { role } : {}) });
const p = (md = "The idea in words, with its one honest because."): Json => ({ type: "p", md });
const figure: Json = { type: "figure", alt: "A drawing", svg: "<svg/>" };
const callout = (kind: string): Json => ({ type: "callout", kind, title: "Why", md: "Because of this." });
const see = (stem = "Simplify $\\dfrac{x^2 - 9}{x + 3}$."): Json => ({
  type: "see",
  stem,
  steps: [
    { n: 1, working: "$x^2 - 9 = (x + 3)(x - 3)$", decision: "Factorise the top first.", earns: ["MW1"] },
    { n: 2, working: "$x - 3$", decision: "Divide out the common bracket.", earns: ["W1"] },
  ],
});
const seeRef: Json = { type: "see", workedExample: "we.x.01" };
const video: Json = { type: "video", videoId: "abc123", title: "A clip", channel: "A channel", start: 0, end: 60 };
const gate = (id: string): Json => ({ type: "gate", id, kind: "choice", prompt: "Which?", options: ["A", "B"], answer: "A", explain: "Because." });
const prompt = (id: string): Json => ({ type: "prompt", promptId: id });
const close = (...prompts: string[]): Json[] => [h("You can now", "recap"), p("Factorise, then divide out."), h("In the exam", "pointer"), p("Worth 4 or 5 marks."), ...prompts.map(prompt)];

/** A note in lesson structure v3: every teaching section explains, shows (a See it), then asks. */
const V3: Json[] = [
  hero,
  figure,
  h("1. Only a factor divides out", "idea"),
  p(),
  see(),
  gate("g1"),
  h("2. A square minus a square", "variant"),
  figure,
  p(),
  callout("why"),
  see(),
  video,
  gate("g2"),
  h("3. Two shapes at once", "variant"),
  p(),
  see(),
  gate("g3"),
  gate("g4"),
  ...close("rp.x.01", "rp.x.02"),
];

/** A note written before 27 Sep: teach, show and check in prose, no See it block (the trial topic's shape). */
const V2: Json[] = [hero, figure, h("Why cancelling works", "idea"), p(), p("So $x^2 - 49 = (x + 7)(x - 7)$ gives $x - 7$."), gate("g2"), h("A square minus a square", "variant"), p(), gate("g12"), ...close("rp.x.02", "rp.x.08")];

const REVIEW_AT = "2026-09-28T10:00:00Z";
const review = (over: Json = {}): Json => ({ type: REVIEW_TYPE, tool: REVIEW_TOOL, result: "pass", detail: "Read as Slides and as Read at 390 and 1280; every section explains, shows, then asks.", at: REVIEW_AT, by: "claude", ...over });
const authorCheck: Json = { type: "maths-numeric", tool: "claude (author pass)", result: "pass", detail: "Every line recomputed.", at: "2026-09-25T04:20:00Z", by: "claude" };

function bundle(noteBlocks: unknown[] | null, checks: Json[] = [], opts: { status?: string; otherLogs?: Json[]; note?: Json | null } = {}): Json {
  return {
    note: opts.note === undefined ? { id: "note.x", verification: "ver.note.x" } : opts.note,
    noteBlocks,
    verification: [{ id: "ver.note.x", itemId: "note.x", version: 1, checks: [authorCheck, ...checks], status: opts.status ?? "verified", reports: [] }, ...(opts.otherLogs ?? [])],
  };
}

/** The seed allow entry exactly as it goes into the trial topic's note log (sent to the lead, 27 Sep 2026). */
const SEED_WAIVER = JSON.parse(
  '{ "type": "human-spot", "tool": "teach-show-check", "result": "waived", "detail": "The owner\'s trial topic (Slides judged much better, 24 Sep 2026; answer 7 of 27 Sep): Slides and Read v2 stay on while the note keeps its 25 Sep structure. The waiver lapses when the note gains its first See it block; the migrated note then needs a pass review.", "at": "2026-09-27T17:00:00Z", "by": "developer" }',
) as Json;

describe("readiness: the structure AND the review", () => {
  it("is ready when the note passes the structure and its review says pass", () => {
    expect(noteStructure(V3)).toEqual({ ok: true, problems: [] });
    const r = lessonReadiness(bundle(V3, [review()]) as never);
    expect(r.ready).toBe(true);
    expect(r.via).toBe("reviewed");
    expect(r.reasons).toEqual([]);
    expect(r.review).toMatchObject({ result: "pass", by: "claude", at: REVIEW_AT });
  });

  it("is not ready with neither: no review, and the structure's problems listed after it", () => {
    const r = lessonReadiness(bundle(V2) as never);
    expect(r.ready).toBe(false);
    expect(r.via).toBeNull();
    expect(r.reasons[0]).toMatch(/^no review: the note's own verification log has no "human-spot" check with the tool "teach-show-check"/);
    expect(r.reasons.slice(1)).toEqual(r.structure);
    expect(r.structure.length).toBeGreaterThan(0);
  });

  it("is not ready when reviewed but not structured: a pass never lifts a note without its See it blocks", () => {
    const r = lessonReadiness(bundle(V2, [review()]) as never);
    expect(r.ready).toBe(false);
    expect(r.reasons[0]).toBe(`the review of ${REVIEW_AT} says pass, but the note does not pass the structure`);
    expect(r.structure).toEqual([
      'section 1 "Why cancelling works" has no See it block',
      'gate g2 in section 1 "Why cancelling works" comes before its See it',
      'section 2 "A square minus a square" has no See it block',
      'gate g12 in section 2 "A square minus a square" comes before its See it',
    ]);
  });

  it("is not ready when structured but not reviewed: every topic is reviewed before it counts", () => {
    const r = lessonReadiness(bundle(V3) as never);
    expect(r.ready).toBe(false);
    expect(r.structure).toEqual([]);
    expect(r.reasons).toHaveLength(1);
    expect(r.reasons[0]).toMatch(/^no review/);
  });
});

describe("readiness: the waiver, the one explicit allow entry", () => {
  it("keeps a note with no See it block ready, with its reason", () => {
    const r = lessonReadiness(bundle(V2, [review({ result: "waived", by: "developer", detail: "The owner's trial topic, until its migration." })]) as never);
    expect(r.ready).toBe(true);
    expect(r.via).toBe("waived");
    // The structure is still reported, so the migration knows what it owes.
    expect(r.structure.length).toBeGreaterThan(0);
  });

  it("accepts the seed record exactly as written into the trial topic's log", () => {
    const r = lessonReadiness(bundle(V2, [SEED_WAIVER]) as never);
    expect(r).toMatchObject({ ready: true, via: "waived", review: { result: "waived", by: "developer", at: "2026-09-27T17:00:00Z" } });
  });

  it("lapses the moment the note gains its first See it: the migrated note needs a pass", () => {
    const migrated = [hero, h("Why cancelling works", "idea"), p(), see(), gate("g2"), ...close("rp.x.02")];
    expect(noteStructure(migrated).ok).toBe(true);
    const waived = lessonReadiness(bundle(migrated, [SEED_WAIVER]) as never);
    expect(waived.ready).toBe(false);
    expect(waived.reasons[0]).toBe("the waiver of 2026-09-27T17:00:00Z has lapsed: the note now has See it blocks, so it needs a review that says pass");
    // A half-migrated note (one See it, the other gates still before theirs) lapses the waiver too.
    expect(lessonReadiness(bundle([...V2.slice(0, 5), see(), ...V2.slice(5)], [SEED_WAIVER]) as never).ready).toBe(false);
    // The reviewer's pass, appended after the waiver, makes the migrated note ready.
    expect(lessonReadiness(bundle(migrated, [SEED_WAIVER, review()]) as never)).toMatchObject({ ready: true, via: "reviewed" });
  });

  it("is no waiver without its reason", () => {
    const r = lessonReadiness(bundle(V2, [review({ result: "waived", detail: "  " })]) as never);
    expect(r.ready).toBe(false);
    expect(r.reasons[0]).toBe(`the waiver of ${REVIEW_AT} gives no reason in its detail`);
  });
});

describe("readiness: which record is the review", () => {
  it("takes the latest by its date, whatever the order in the log", () => {
    const pass = review({ at: "2026-09-28T10:00:00Z" });
    const fail = review({ result: "fail", at: "2026-09-29T09:00:00Z", detail: "Section 3's Your turn asks what its See it did not show." });
    expect(lessonReadiness(bundle(V3, [pass, fail]) as never)).toMatchObject({ ready: false, review: { result: "fail" } });
    expect(lessonReadiness(bundle(V3, [fail, pass]) as never).ready).toBe(false);
    expect(lessonReadiness(bundle(V3, [pass, fail]) as never).reasons[0]).toBe(
      "the latest review (2026-09-29T09:00:00Z, by claude) says fail: Section 3's Your turn asks what its See it did not show.",
    );
    // A re-review is one more appended check.
    expect(lessonReadiness(bundle(V3, [pass, fail, review({ at: "2026-09-30T08:00:00Z" })]) as never).ready).toBe(true);
    // A date and a date-time compare as times: the 29th is later than the morning of the 28th.
    expect(reviewOf(bundle(V3, [review({ result: "fail", at: "2026-09-29" }), pass]) as never)?.result).toBe("fail");
  });

  it("on a tie, takes the later record in the log", () => {
    expect(reviewOf(bundle(V3, [review({ result: "fail" }), review()]) as never)?.result).toBe("pass");
    expect(reviewOf(bundle(V3, [review(), review({ result: "fail" })]) as never)?.result).toBe("fail");
  });

  it("counts a reader's record only: never the pipeline's, never an unknown result", () => {
    const r = lessonReadiness(bundle(V3, [review({ by: "pipeline" }), review({ result: "ok" })]) as never);
    expect(r.ready).toBe(false);
    expect(r.reasons).toEqual([
      expect.stringMatching(/^no review/),
      `the teach-show-check check of ${REVIEW_AT} does not count: by "pipeline", result "pass"`,
      `the teach-show-check check of ${REVIEW_AT} does not count: by "claude", result "ok"`,
    ]);
    for (const by of ["claude", "developer", "teacher"]) expect(lessonReadiness(bundle(V3, [review({ by })]) as never).ready, by).toBe(true);
  });

  it("reads exactly the type human-spot and the tool teach-show-check", () => {
    for (const other of [review({ tool: "teach-show-check review" }), review({ tool: "Teach-show-check" }), review({ type: "style-lint" }), review({ tool: "claude (teach-show-check)" })])
      expect(lessonReadiness(bundle(V3, [other]) as never).ready, JSON.stringify(other)).toBe(false);
  });

  it("reads the note's own log only, never another item's", () => {
    const questionLog = { id: "ver.q.x.0001", itemId: "q.x.0001", version: 1, checks: [review()], status: "verified", reports: [] };
    expect(lessonReadiness(bundle(V3, [], { otherLogs: [questionLog] }) as never).ready).toBe(false);
  });

  it("needs the published note: a shipped note, blocks, and a note log that ships", () => {
    expect(lessonReadiness(bundle(V3, [review()], { status: "draft" }) as never).reasons).toEqual(['the note\'s verification log says "draft", so the note does not ship']);
    expect(lessonReadiness(bundle(V3, [review()], { status: "withdrawn" }) as never).ready).toBe(false);
    expect(lessonReadiness(bundle(V3, [review()], { status: "published" }) as never).ready).toBe(true);
    // A shipped bundle whose note does not ship: note and noteBlocks are null.
    expect(lessonReadiness(bundle(null, [review()], { note: null }) as never).reasons).toEqual(["no published note: the bundle ships no note blocks"]);
    expect(lessonReadiness(bundle(null, [review()]) as never).ready).toBe(false);
    expect(lessonReadiness(bundle(V3, [review()], { note: { id: "note.x", verification: "ver.note.elsewhere" } }) as never).ready).toBe(false);
    expect(lessonReadiness(null).ready).toBe(false);
    expect(lessonReadiness(undefined).ready).toBe(false);
  });
});

describe("the structure: explain, then see it, then your turn, in every teaching section", () => {
  const problems = (blocks: Json[]) => noteStructure(blocks).problems;
  const section = (...body: Json[]) => [hero, h("1. The idea", "idea"), ...body, ...close()];

  it("passes a See it drawn from a worked example as it passes one written inline", () => {
    expect(problems(section(p(), seeRef, gate("g1")))).toEqual([]);
  });

  it("refuses a gate before its section's See it: the first check follows the first See it", () => {
    expect(problems(section(p(), gate("g1"), see(), gate("g2")))).toEqual(['gate g1 in section 1 "1. The idea" comes before its See it']);
  });

  it("refuses a section with no See it; a video beside it is never instead of it", () => {
    expect(problems(section(p(), gate("g1")))).toEqual(['section 1 "1. The idea" has no See it block', 'gate g1 in section 1 "1. The idea" comes before its See it']);
    expect(problems(section(p(), video, gate("g1")))[0]).toBe('section 1 "1. The idea" has no See it block (a video or a sim stands beside a See it, never instead of it)');
  });

  it("refuses a section that shows and never asks", () => {
    expect(problems(section(p(), see()))).toEqual(['section 1 "1. The idea" has no Your turn (gate)']);
  });

  it("refuses a section that shows before it explains: a figure, a spec or notonspec callout does not explain", () => {
    const shows = 'section 1 "1. The idea" shows before it explains: no paragraph or teaching callout comes before its first See it';
    expect(problems(section(see(), gate("g1")))).toEqual([shows]);
    expect(problems(section(figure, see(), gate("g1")))).toEqual([shows]);
    expect(problems(section(callout("notonspec"), see(), gate("g1")))).toEqual([shows]);
    expect(problems(section(callout("spec"), see(), gate("g1")))).toEqual([shows]);
    for (const kind of ["why", "mustknow", "examiner"]) expect(problems(section(callout(kind), see(), gate("g1"))), kind).toEqual([]);
    // A paragraph after the See it does not explain it first.
    expect(problems(section(see(), p(), gate("g1")))).toEqual([shows]);
  });

  it("ends each teaching section in its Your turn", () => {
    expect(problems(section(p(), see(), gate("g1"), p("One more thought.")))).toEqual(['section 1 "1. The idea" does not end in its Your turn: a p block follows gate g1']);
    expect(problems(section(p(), see(), gate("g1"), callout("notonspec")))).toEqual(['section 1 "1. The idea" does not end in its Your turn: a callout block follows gate g1']);
  });

  it("lets two Your turns share one See it, never three", () => {
    expect(problems(section(p(), see(), gate("g1"), gate("g2")))).toEqual([]);
    expect(problems(section(p(), see(), video, gate("g1"), gate("g2")))).toEqual([]);
    expect(problems(section(p(), see(), gate("g1"), gate("g2"), gate("g3")))).toEqual(['gate g3 makes 3 Your turns in a row in section 1 "1. The idea" (at most 2 share one See it)']);
  });

  it("spends a See it on its Your turn: a later gate needs its own See it", () => {
    expect(problems(section(p(), see(), gate("g1"), p("Now the second shape."), gate("g2")))).toEqual([
      'gate g2 in section 1 "1. The idea" has no See it of its own: the See it before it was spent on gate g1',
    ]);
    expect(problems(section(p(), see(), gate("g1"), p("Now the second shape."), see(), gate("g2")))).toEqual([]);
    // A video between two gates is not a See it either.
    expect(problems(section(p(), see(), gate("g1"), video, gate("g2")))[0]).toMatch(/gate g2 .* has no See it of its own/);
  });

  it('continues the section above under a "See it done" heading, which needs its own See it for its own gate', () => {
    const idea = [hero, h("1. The idea", "idea"), p(), see(), gate("g1")];
    expect(problems([...idea, h("See it done at writing speed", "see"), see(), video, gate("g2"), ...close()])).toEqual([]);
    expect(problems([...idea, h("See it done at writing speed", "see"), video, gate("g2"), ...close()])).toEqual([
      'gate g2 in section 1 "1. The idea" has no See it of its own: the See it before it was spent on gate g1',
    ]);
    // Explained in the section above, shown under the see heading, then asked: one section.
    expect(problems([hero, h("1. The idea", "idea"), p(), h("See it done", "see"), see(), gate("g1"), ...close()])).toEqual([]);
  });

  it("reads roles, never heading words: every heading carries one of the nine", () => {
    expect(problems([hero, h("1. The idea"), p(), see(), gate("g1"), ...close()])).toEqual(['heading "1. The idea" has no role']);
    expect(problems([hero, h("1. The idea", "hook"), p(), see(), gate("g1"), ...close()])[0]).toBe(
      'heading "1. The idea" has the role "hook", which is not one of idea, why, variant, see, twists, further, derivation, recap, pointer',
    );
    // "You can now" without its role is not the close: it is an unlabelled heading.
    expect(problems([hero, h("1. The idea", "idea"), p(), see(), gate("g1"), h("You can now"), p()])).toContain('heading "You can now" has no role');
  });

  it("asks nothing in the opening or in the close, and teaches nothing after the close has begun", () => {
    expect(problems([hero, p("A hook."), gate("g0"), h("1. The idea", "idea"), p(), see(), gate("g1"), ...close()])).toEqual([
      "gate g0 comes before the note's first heading: the first check follows the first See it, inside its section",
    ]);
    expect(problems([hero, h("1. The idea", "idea"), p(), see(), gate("g1"), h("You can now", "recap"), p(), gate("g9")])).toEqual([
      'gate g9 in section 2 "You can now" comes after the close has begun: every check belongs to a teaching section',
    ]);
    expect(problems([hero, h("1. The idea", "idea"), p(), see(), gate("g1"), h("You can now", "recap"), p(), h("2. Going further", "further"), p(), see(), gate("g2")])).toEqual([
      'section 3 "2. Going further" (further) comes after the close has begun at "You can now"',
      'gate g2 in section 3 "2. Going further" comes after the close has begun: every check belongs to a teaching section',
    ]);
  });

  it("holds at most two recall prompts, in the close", () => {
    expect(problems(section(p(), see(), gate("g1")).concat([prompt("rp.1"), prompt("rp.2")]))).toEqual([]);
    expect(problems(section(p(), see(), gate("g1")).concat([prompt("rp.1"), prompt("rp.2"), prompt("rp.3")]))).toEqual(["3 recall prompts (at most 2)"]);
    expect(problems([hero, h("1. The idea", "idea"), p(), prompt("rp.1"), see(), gate("g1"), ...close()])).toEqual([
      'recall prompt rp.1 sits in section 1 "1. The idea": recall comes in the close, after "In the exam"',
    ]);
  });

  it("needs at least one teaching section", () => {
    expect(problems([])).toEqual(["the note has no blocks"]);
    expect(problems([hero, p("Only a hook.")])).toEqual(["no teaching section: nothing is explained, shown and then asked"]);
    expect(problems([hero, ...close()])).toEqual(["no teaching section: nothing is explained, shown and then asked"]);
    expect(noteStructure(null).ok).toBe(false);
  });

  it("checks every section, not only the first", () => {
    const later = [hero, h("1. The idea", "idea"), p(), see(), gate("g1"), h("2. A variant", "variant"), p(), gate("g2"), ...close()];
    expect(problems(later)).toEqual(['section 2 "2. A variant" has no See it block', 'gate g2 in section 2 "2. A variant" comes before its See it']);
  });

  it("is the same rule in every subject: a science note with its worked answer as a See it passes", () => {
    const science = [
      hero,
      { type: "photo", src: "/p.jpg", alt: "Quadrats on a field", credit: "c", licence: "CC BY" },
      h("1. Estimating a population", "idea"),
      p("A quadrat samples a small area; scaling up gives the whole field."),
      { type: "see", stem: "Ten quadrats of 1 m² hold 60 daisies in all. The field is 500 m². Estimate the daisies.", steps: [
        { n: 1, working: "Mean per quadrat: 60 ÷ 10 = 6 daisies", decision: "Average first, so one odd quadrat does not decide the answer.", earns: ["P1"] },
        { n: 2, working: "Whole field: 6 × 500 = 3000 daisies", decision: "Scale the mean up by the area.", earns: ["P1"] },
      ] },
      gate("g1"),
      ...close("rp.b.01"),
    ];
    expect(problems(science)).toEqual([]);
  });
});

describe("sectionsOf: the shared parser", () => {
  it("reads the opening, the teaching sections and the close, with every block's index in the note", () => {
    const s = sectionsOf(V3);
    expect(s.map((x) => [x.n, x.part, x.heading?.text ?? null, x.heading?.role ?? null])).toEqual([
      [0, "opening", null, null],
      [1, "teaching", "1. Only a factor divides out", "idea"],
      [2, "teaching", "2. A square minus a square", "variant"],
      [3, "teaching", "3. Two shapes at once", "variant"],
      [4, "closing", "You can now", "recap"],
      [5, "closing", "In the exam", "pointer"],
    ]);
    // The hero is never part of a section; the hero figure is the opening's.
    expect(s[0]!.blocks.map((b) => [b.at, b.block.type])).toEqual([[1, "figure"]]);
    expect(s[2]!.heading).toEqual({ at: 6, text: "2. A square minus a square", role: "variant" });
    expect(s[2]!.explanation.map((b) => [b.at, b.block.type])).toEqual([
      [7, "figure"],
      [8, "p"],
      [9, "callout"],
    ]);
    expect(s[2]!.see.map((b) => b.at)).toEqual([10]);
    expect(s[2]!.media.map((b) => [b.at, b.block.type])).toEqual([[11, "video"]]);
    expect(s[2]!.gates.map((b) => b.block.id)).toEqual(["g2"]);
    expect(s[3]!.gates.map((b) => b.block.id)).toEqual(["g3", "g4"]);
    expect(s[5]!.prompts.map((b) => b.block.promptId)).toEqual(["rp.x.01", "rp.x.02"]);
    // Every block but the hero and the headings lands in exactly one section, in the note's order.
    expect(s.flatMap((x) => x.blocks.map((b) => b.at))).toEqual(V3.flatMap((b, i) => (b.type === "hero" || b.type === "h" ? [] : [i])));
  });

  it('folds a "See it done" heading into the section above it, as a continuation', () => {
    const blocks = [h("1. The idea", "idea"), p(), h("See it done", "see"), see(), gate("g1"), h("2. A variant", "variant"), p(), see(), gate("g2")];
    const s = sectionsOf(blocks);
    expect(s.map((x) => x.n)).toEqual([0, 1, 2]);
    expect(s[1]!.continuations).toEqual([{ at: 2, text: "See it done", role: "see" }]);
    expect(s[1]!.blocks.map((b) => b.at)).toEqual([1, 3, 4]);
    expect(s[0]!.blocks).toEqual([]);
  });

  it("keeps an explanation that follows the See it out of `explanation`, and in `blocks`", () => {
    const [, first] = sectionsOf([h("1. The idea", "idea"), p("Before."), see(), p("After."), gate("g1")]);
    expect(first!.explanation.map((b) => b.at)).toEqual([1]);
    expect(first!.blocks.map((b) => b.at)).toEqual([1, 2, 3, 4]);
  });

  it("treats every heading after the close has begun as the close, whatever its role", () => {
    const s = sectionsOf([h("1. The idea", "idea"), p(), h("You can now", "recap"), h("2. Late", "variant")]);
    expect(s.map((x) => x.part)).toEqual(["opening", "teaching", "closing", "closing"]);
  });

  it("reads nothing but arrays of objects", () => {
    expect(sectionsOf(null)).toHaveLength(1);
    expect(sectionsOf([null, 3, "x", { type: "p", md: "Words." }])[0]!.blocks.map((b) => b.at)).toEqual([3]);
  });

  it("names the roles once, for the lint, the renderer and this rule alike", () => {
    expect([...SECTION_ROLES]).toEqual(["idea", "why", "variant", "see", "twists", "further", "derivation", "recap", "pointer"]);
    expect([...TEACHING_ROLES, "see", ...CLOSING_ROLES].sort()).toEqual([...SECTION_ROLES].sort());
    expect(hasSeeBlock(V3)).toBe(true);
    expect(hasSeeBlock(V2)).toBe(false);
  });
});
