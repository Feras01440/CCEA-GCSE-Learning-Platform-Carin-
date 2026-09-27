/**
 * Lesson readiness (27 Sep 2026): whether a topic's lesson is ready to be offered as Slides and drawn as Read v2, decided
 * by the content itself and never by a list in code.
 *
 * Pure and shared on purpose. pipeline/build-content.mts calls `lessonReadiness` on every shipped bundle and writes the
 * answer into src/generated/manifest.json as `ready: boolean`; src/lib/slides/ready.ts reads that field for every
 * surface (the hero's way in, the Slides route and its static params, the Read v2 layout, the folded rail); the Slides
 * card grammar reads a note through `sectionsOf`; the e2e suite applies this same rule to the content the export
 * serves. Nothing here names a subject, a unit or a topic: the rule reads heading roles and block types only, so a new
 * subject's topics become ready the day their notes and reviews are.
 *
 * READY = the STRUCTURE passes and the latest REVIEW says pass; or the latest review is the one explicit WAIVER.
 *
 * 1. THE STRUCTURE: lesson structure v3 (docs/plan/review/2026-09-24-teach-first-case.md §6 and §8.3, with the block
 *    shape of docs/plan/review/2026-09-27-see-it-block-shape.md and the owner's answers of 27 Sep). `sectionsOf` reads
 *    the note as sections:
 *    - the OPENING: the blocks before the first heading (the hook, the hero figure);
 *    - a TEACHING section: a heading whose role is idea, why, variant, twists, further or derivation, with its blocks up
 *      to the next heading that opens a section. A heading whose role is `see` ("See it done") opens nothing: it
 *      continues the section above it;
 *    - the CLOSE: from the first `recap` or `pointer` heading to the end ("You can now", "In the exam", the recall).
 *    `noteStructure` passes a note when
 *    - every heading carries one of the nine roles, and no teaching section comes after the close has begun;
 *    - there is at least one teaching section, and each one explains, then shows, then asks: a paragraph or a teaching
 *      callout (why, mustknow, examiner) before its first See it block, at least one See it block, at least one gate;
 *    - every gate follows a See it block of its own section shown after the section's previous gate, or follows that
 *      gate directly (two Your turns on one See it); never three gates in a row; a video or a sim never stands in for a
 *      See it (the owner's answer 4);
 *    - each teaching section ends in its Your turn: its last block is a gate;
 *    - nothing is asked in the opening or in the close, so the topic's first check comes after its first See it (the
 *      owner's answer 8);
 *    - at most two recall prompts, both in the close (the owner's answer 3).
 *
 * 2. THE REVIEW: one check in the note's OWN verification log, the entry of bundle.json's `verification` whose `id` is
 *    the note's `verification` ref ("ver.note.<topic id>"), appended by the reviewer who has read the topic as Slides
 *    and as Read:
 *
 *      { "type": "human-spot", "tool": "teach-show-check", "result": "pass",
 *        "detail": "<what was read, at which widths, and the judgement>", "at": "2026-09-28T10:00:00Z", "by": "claude" }
 *
 *    `type` is exactly "human-spot" and `tool` exactly "teach-show-check" (the schema's check types have no
 *    teach-show-check of their own; human-spot is a reader's judgement, and the tool names the rule it was judged by).
 *    `by` is "claude", "developer" or "teacher", never "pipeline": a script is not a reader. `result` "pass" makes the
 *    topic ready while the structure passes; "fail" takes it off. The LATEST such check is the review (by `at`; on a
 *    tie, the later in the list), so a re-review is one more appended check and nothing is ever edited or deleted.
 *
 * 3. THE WAIVER: a review whose `result` is "waived", with its reason in `detail`, keeps a topic ready although its note
 *    was written before the See it block (the owner's trial topic until its migration). It holds only while the note
 *    has no See it block at all: the first See it that a migration adds ends it, and the migrated note then needs a
 *    review that says "pass".
 *
 * The note must be the published one: a shipped bundle's `noteBlocks` (public/content/…, null when the note does not
 * ship), or a raw bundle.json with its note.blocks.json passed as `noteBlocks`, whose note log says verified or
 * published.
 *
 * THE CONTRACT (other modules import these names; change them only together with their readers):
 *  - lessonReadiness(bundle) -> { ready, via: "reviewed" | "waived" | null, structure, review, reasons }: the one rule.
 *    pipeline/build-content.mts writes its `ready` into the manifest; the e2e suite applies it to served content.
 *  - sectionsOf(blocks) -> NoteSection[]: the note as sections, the parser the Slides card grammar shares. Each section
 *    has its number `n` (0 for the opening), its `part` (opening, teaching, closing), its `heading` ({ at, text, role })
 *    and the "See it done" headings folded into it (`continuations`), then its blocks in order (`blocks`) and the same
 *    blocks by kind: `explanation` (paragraphs, callouts, figures and photos before its first See it), `see`, `media`
 *    (videos and sims), `gates` (the Your turns) and `prompts`. Every entry is { at, block }, `at` being the block's
 *    index in note.blocks.json. Hero and pause blocks belong to no section.
 *  - noteStructure(blocks) -> { ok, problems }; reviewOf(bundle) -> the review that counts, or null; hasSeeBlock(blocks).
 *  - The names the content session writes: REVIEW_TYPE, REVIEW_TOOL, REVIEWERS; the roles: SECTION_ROLES,
 *    TEACHING_ROLES, CONTINUING_ROLE, CLOSING_ROLES; the limits: RECALL_MAX, TURNS_IN_A_ROW_MAX.
 */
import type { GateBlock, NoteBlock, SeeBlock } from "@/components/items/gates";

// ---------------------------------------------------------------------------------------------------------------------
// The names the content session writes and the renderers read
// ---------------------------------------------------------------------------------------------------------------------

/** The heading roles of the depth standard (pipeline/prompts/author-topic.md, "The note: sections, their roles and their order"). */
export const SECTION_ROLES = ["idea", "why", "variant", "see", "twists", "further", "derivation", "recap", "pointer"] as const;
export type SectionRole = (typeof SECTION_ROLES)[number];
/** A heading with one of these roles opens a teaching section. */
export const TEACHING_ROLES: ReadonlySet<string> = new Set(["idea", "why", "variant", "twists", "further", "derivation"]);
/** A heading with this role ("See it done") continues the section above it. */
export const CONTINUING_ROLE = "see";
/** The first heading with one of these roles begins the close: "You can now", then "In the exam". */
export const CLOSING_ROLES: ReadonlySet<string> = new Set(["recap", "pointer"]);
/** Callouts that explain; a spec callout quotes the statement and a notonspec callout marks a boundary. */
export const TEACHING_CALLOUTS: ReadonlySet<string> = new Set(["why", "mustknow", "examiner"]);

/** At most two recall prompts in a note (the owner's answer 3, 27 Sep 2026). */
export const RECALL_MAX = 2;
/** Two Your turns may follow one See it, when the section showed two variants; never three in a row. */
export const TURNS_IN_A_ROW_MAX = 2;

/** The review check, exactly as the reviewer writes it in the note's own verification log. */
export const REVIEW_TYPE = "human-spot";
export const REVIEW_TOOL = "teach-show-check";
/** Who may review: a reader. A check by "pipeline" is never a review. */
export const REVIEWERS: ReadonlySet<string> = new Set(["claude", "developer", "teacher"]);
export type ReviewResult = "pass" | "fail" | "waived";
const RESULTS: ReadonlySet<string> = new Set(["pass", "fail", "waived"]);
/** Note logs whose note ships (pipeline/build-content.mts SHIPPABLE). */
const SHIPPED: ReadonlySet<string> = new Set(["verified", "published"]);

// ---------------------------------------------------------------------------------------------------------------------
// sectionsOf: the note as sections (shared with the Slides card grammar)
// ---------------------------------------------------------------------------------------------------------------------

export type ExplanationBlock = Extract<NoteBlock, { type: "p" | "callout" | "figure" | "photo" }>;
export type SectionMediaBlock = Extract<NoteBlock, { type: "video" | "sim" }>;
export type PromptBlock = Extract<NoteBlock, { type: "prompt" }>;

/** A block with its index in note.blocks.json, so a caller can go back to the note. */
export interface At<T> {
  at: number;
  block: T;
}

/** A heading as the parser read it: its index in the note, its text, and its role (null when the author gave none). */
export interface SectionHeading {
  at: number;
  text: string;
  role: string | null;
}

/**
 * One section of a note.
 * - `n`: 0 for the opening, then 1, 2, 3 … for each heading that opens a section (the close's headings included), in
 *   the note's order; a `see` heading continues a section and takes no number.
 * - `part`: "opening", "teaching" or "closing". A heading after the close has begun is "closing", whatever its role.
 * - `heading`: the heading that opens it (null for the opening); `continuations`: the `see` headings folded into it.
 * - `blocks`: every block of the section in order, its headings left out; `hero` and `pause` blocks are never part of a
 *   section. The buckets below are views of `blocks`, each in order:
 *   `explanation` the paragraphs, callouts, figures and photos before the section's first See it (all of them when it
 *   has none); `see` the See it blocks; `media` the videos and sims; `gates` the gates (the Your turns); `prompts` the
 *   recall prompt blocks. A paragraph, callout, figure or photo after the first See it is in `blocks` only.
 * The parser reads `type`, `role` and `text` and nothing else: a block is typed as the NoteBlock member its `type`
 * names, not validated (the build's content lint checks the See it and gate fields).
 */
export interface NoteSection {
  n: number;
  part: "opening" | "teaching" | "closing";
  heading: SectionHeading | null;
  continuations: SectionHeading[];
  blocks: At<NoteBlock>[];
  explanation: At<ExplanationBlock>[];
  see: At<SeeBlock>[];
  media: At<SectionMediaBlock>[];
  gates: At<GateBlock>[];
  prompts: At<PromptBlock>[];
}

type Json = Record<string, unknown>;
const isObject = (v: unknown): v is Json => typeof v === "object" && v !== null && !Array.isArray(v);
const str = (v: unknown): string => (typeof v === "string" ? v : "");
const typeOf = (b: unknown): string => (isObject(b) ? str(b.type) : "");
const roleOf = (b: Json): string | null => (typeof b.role === "string" && b.role.trim() ? b.role.trim() : null);
const EXPLANATION_TYPES: ReadonlySet<string> = new Set(["p", "callout", "figure", "photo"]);
const MEDIA_TYPES: ReadonlySet<string> = new Set(["video", "sim"]);

/** The note as sections: the opening, then one section per heading that opens one (see NoteSection). */
export function sectionsOf(blocks: readonly unknown[] | null | undefined): NoteSection[] {
  const list = Array.isArray(blocks) ? blocks : [];
  const open = (n: number, part: NoteSection["part"], heading: SectionHeading | null): NoteSection => ({
    n,
    part,
    heading,
    continuations: [],
    blocks: [],
    explanation: [],
    see: [],
    media: [],
    gates: [],
    prompts: [],
  });
  const sections: NoteSection[] = [open(0, "opening", null)];
  let closing = false;
  list.forEach((raw, at) => {
    if (!isObject(raw)) return;
    const type = str(raw.type);
    if (type === "hero" || type === "pause") return;
    const current = sections[sections.length - 1]!;
    if (type === "h") {
      const heading: SectionHeading = { at, text: str(raw.text), role: roleOf(raw) };
      if (heading.role === CONTINUING_ROLE) {
        current.continuations.push(heading);
        return;
      }
      if (heading.role !== null && CLOSING_ROLES.has(heading.role)) closing = true;
      sections.push(open(sections.length, closing ? "closing" : "teaching", heading));
      return;
    }
    const block = raw as unknown as NoteBlock;
    current.blocks.push({ at, block });
    if (type === "see") current.see.push({ at, block: block as SeeBlock });
    else if (type === "gate") current.gates.push({ at, block: block as GateBlock });
    else if (type === "prompt") current.prompts.push({ at, block: block as PromptBlock });
    else if (MEDIA_TYPES.has(type)) current.media.push({ at, block: block as SectionMediaBlock });
  });
  for (const s of sections) {
    const firstSee = s.see.length ? s.see[0]!.at : Number.POSITIVE_INFINITY;
    s.explanation = s.blocks.filter((b) => b.at < firstSee && EXPLANATION_TYPES.has(b.block.type)) as At<ExplanationBlock>[];
  }
  return sections;
}

/** Whether the note holds a See it block anywhere. */
export function hasSeeBlock(blocks: readonly unknown[] | null | undefined): boolean {
  return Array.isArray(blocks) && blocks.some((b) => typeOf(b) === "see");
}

// ---------------------------------------------------------------------------------------------------------------------
// noteStructure: lesson structure v3, as a list of plain problems
// ---------------------------------------------------------------------------------------------------------------------

const quoted = (text: string): string => `"${text.trim()}"`;
const named = (s: NoteSection): string => (s.heading ? `section ${s.n} ${quoted(s.heading.text)}` : "the opening");
const gateId = (g: At<GateBlock>): string => str((g.block as unknown as Json).id) || `at block ${g.at}`;
const explains = (b: NoteBlock): boolean => b.type === "p" || (b.type === "callout" && TEACHING_CALLOUTS.has(str((b as unknown as Json).kind)));

/** The note's structure against lesson structure v3: `ok` when `problems` is empty; one plain sentence per problem. */
export function noteStructure(blocks: readonly unknown[] | null | undefined): { ok: boolean; problems: string[] } {
  if (!Array.isArray(blocks) || blocks.length === 0) return { ok: false, problems: ["the note has no blocks"] };
  const problems: string[] = [];
  const sections = sectionsOf(blocks);
  const closeStart = sections.find((s) => s.part === "closing")?.heading ?? null;

  for (const s of sections) {
    for (const h of [...(s.heading ? [s.heading] : []), ...s.continuations]) {
      if (h.role === null) problems.push(`heading ${quoted(h.text)} has no role`);
      else if (!(SECTION_ROLES as readonly string[]).includes(h.role))
        problems.push(`heading ${quoted(h.text)} has the role "${h.role}", which is not one of ${SECTION_ROLES.join(", ")}`);
    }

    if (s.part === "opening") {
      for (const g of s.gates) problems.push(`gate ${gateId(g)} comes before the first teaching section: the first check follows the first See it, inside its section`);
      for (const p of s.prompts) problems.push(`recall prompt ${str((p.block as unknown as Json).promptId)} sits in the opening: recall comes in the close, after "In the exam"`);
      continue;
    }

    if (s.part === "closing") {
      const role = s.heading?.role ?? null;
      if (role !== null && TEACHING_ROLES.has(role)) problems.push(`${named(s)} (${role}) comes after the close has begun at ${quoted(closeStart?.text ?? "")}`);
      for (const g of s.gates) problems.push(`gate ${gateId(g)} in ${named(s)} comes after the close has begun: every check belongs to a teaching section`);
      continue;
    }

    // A teaching section: explain, then see it, then your turn.
    for (const p of s.prompts) problems.push(`recall prompt ${str((p.block as unknown as Json).promptId)} sits in ${named(s)}: recall comes in the close, after "In the exam"`);
    if (s.see.length === 0) problems.push(`${named(s)} has no See it block${s.media.length ? " (a video or a sim stands beside a See it, never instead of it)" : ""}`);
    else if (!s.blocks.some((b) => b.at < s.see[0]!.at && explains(b.block))) problems.push(`${named(s)} shows before it explains: no paragraph or teaching callout comes before its first See it`);
    if (s.gates.length === 0) {
      problems.push(`${named(s)} has no Your turn (gate)`);
      continue;
    }

    let shown = false;
    let everShown = false;
    let run = 0;
    let previous: At<GateBlock> | null = null;
    for (const item of s.blocks) {
      const type = item.block.type;
      if (type === "see") {
        shown = true;
        everShown = true;
        run = 0;
        continue;
      }
      if (type !== "gate") {
        run = 0;
        continue;
      }
      const gate = item as At<GateBlock>;
      run += 1;
      if (run === 1 && !shown)
        problems.push(
          everShown && previous
            ? `gate ${gateId(gate)} in ${named(s)} has no See it of its own: the See it before it was spent on gate ${gateId(previous)}`
            : `gate ${gateId(gate)} in ${named(s)} comes before its See it`,
        );
      if (run > TURNS_IN_A_ROW_MAX) problems.push(`gate ${gateId(gate)} makes ${run} Your turns in a row in ${named(s)} (at most ${TURNS_IN_A_ROW_MAX} share one See it)`);
      shown = false;
      previous = gate;
    }

    const last = s.blocks[s.blocks.length - 1]!;
    if (last.block.type !== "gate") problems.push(`${named(s)} does not end in its Your turn: a ${last.block.type} block follows gate ${gateId(s.gates[s.gates.length - 1]!)}`);
  }

  if (!sections.some((s) => s.part === "teaching")) problems.push("no teaching section: nothing is explained, shown and then asked");
  const prompts = sections.reduce((n, s) => n + s.prompts.length, 0);
  if (prompts > RECALL_MAX) problems.push(`${prompts} recall prompts (at most ${RECALL_MAX})`);
  return { ok: problems.length === 0, problems };
}

// ---------------------------------------------------------------------------------------------------------------------
// The review record
// ---------------------------------------------------------------------------------------------------------------------

/** The reviewer's record, as read from the note's own verification log. */
export interface LessonReview {
  result: ReviewResult;
  at: string;
  by: string;
  detail: string;
}

/** What readiness reads from a bundle: a shipped bundle (public/content) or a raw bundle.json with its note blocks. */
export interface ReadinessInput {
  note?: { verification?: unknown } | null;
  noteBlocks?: readonly unknown[] | null;
  verification?: readonly unknown[] | null;
}

/** The note's own verification log: the entry whose `id` is the note's `verification` ref. */
function noteLog(bundle: ReadinessInput): Json | null {
  const ref = isObject(bundle.note) ? str(bundle.note.verification) : "";
  if (!ref || !Array.isArray(bundle.verification)) return null;
  return (bundle.verification.find((l) => isObject(l) && l.id === ref) as Json | undefined) ?? null;
}

const time = (at: string): number => {
  const t = Date.parse(at);
  return Number.isNaN(t) ? Number.NEGATIVE_INFINITY : t;
};

/** Every teach-show-check record in the note's own log, in the log's order, with whether it counts as a review. */
function reviewRecords(bundle: ReadinessInput): Array<{ review: LessonReview; counts: boolean }> {
  const log = noteLog(bundle);
  const checks = log && Array.isArray(log.checks) ? log.checks : [];
  return checks
    .filter((c): c is Json => isObject(c) && c.type === REVIEW_TYPE && c.tool === REVIEW_TOOL)
    .map((c) => {
      const review: LessonReview = { result: str(c.result) as ReviewResult, at: str(c.at), by: str(c.by), detail: str(c.detail) };
      return { review, counts: REVIEWERS.has(review.by) && RESULTS.has(review.result) };
    });
}

/** The note's review: the latest counting teach-show-check check of its own log (on a tie, the later in the log), or null. */
export function reviewOf(bundle: ReadinessInput): LessonReview | null {
  let latest: LessonReview | null = null;
  for (const { review, counts } of reviewRecords(bundle)) if (counts && (latest === null || time(review.at) >= time(latest.at))) latest = review;
  return latest;
}

// ---------------------------------------------------------------------------------------------------------------------
// lessonReadiness: the one rule
// ---------------------------------------------------------------------------------------------------------------------

export interface LessonReadiness {
  /** Offer Slides, build its route, draw Read v2. */
  ready: boolean;
  /** "reviewed": the structure passes and the review says pass. "waived": the waiver, on a note with no See it yet. */
  via: "reviewed" | "waived" | null;
  /** The structure's problems (empty when it passes), reported whatever the review says. */
  structure: string[];
  /** The review that counts, or null. */
  review: LessonReview | null;
  /** Why the topic is not ready, the review first and then the structure (empty when it is ready). */
  reasons: string[];
}

/** Whether a topic's lesson is ready for Slides and Read v2, and why not. See the top of this file for the rule. */
export function lessonReadiness(bundle: ReadinessInput | null | undefined): LessonReadiness {
  const notReady = (reasons: string[], structure: string[] = [], review: LessonReview | null = null): LessonReadiness => ({ ready: false, via: null, structure, review, reasons: [...reasons, ...structure] });
  if (!bundle || !isObject(bundle.note) || !Array.isArray(bundle.noteBlocks)) return notReady(["no published note: the bundle ships no note blocks"]);
  const log = noteLog(bundle);
  if (!log) return notReady(["the note has no verification log of its own (no entry whose id is the note's verification ref)"]);
  if (!SHIPPED.has(str(log.status))) return notReady([`the note's verification log says "${str(log.status)}", so the note does not ship`]);

  const blocks = bundle.noteBlocks;
  const structure = noteStructure(blocks).problems;
  const review = reviewOf(bundle);

  if (review === null) {
    const ignored = reviewRecords(bundle).filter((r) => !r.counts);
    return notReady(
      [
        `no review: the note's own verification log has no "${REVIEW_TYPE}" check with the tool "${REVIEW_TOOL}" by claude, developer or teacher`,
        ...ignored.map(({ review: r }) => `the ${REVIEW_TOOL} check of ${r.at || "(no date)"} does not count: by "${r.by}", result "${r.result}"`),
      ],
      structure,
    );
  }
  if (review.result === "waived") {
    if (hasSeeBlock(blocks)) return notReady([`the waiver of ${review.at} has lapsed: the note now has See it blocks, so it needs a review that says pass`], structure, review);
    if (!review.detail.trim()) return notReady([`the waiver of ${review.at} gives no reason in its detail`], structure, review);
    return { ready: true, via: "waived", structure, review, reasons: [] };
  }
  if (review.result === "fail") return notReady([`the latest review (${review.at}, by ${review.by}) says fail${review.detail.trim() ? `: ${review.detail.trim()}` : ""}`], structure, review);
  if (structure.length > 0) return notReady([`the review of ${review.at} says pass, but the note does not pass the structure`], structure, review);
  return { ready: true, via: "reviewed", structure, review, reasons: [] };
}
