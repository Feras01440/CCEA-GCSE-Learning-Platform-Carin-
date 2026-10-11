import { readFileSync } from "node:fs";
import path from "node:path";
import { expect, type APIRequestContext } from "@playwright/test";
import type { GateBlock, SeeBlock } from "../src/components/items/gates";
import type { RetrievalPrompt, WorkedExample } from "../src/lib/content/schema";
import { displayTitle, gateStem, heroDataFor, lessonBlocks, lessonSections, seeStepsOf, type GateStem } from "../src/components/topic/lesson-plan";
import { deckGateOrders, shownOptions } from "../src/lib/gate-order";
import { deckPromise, type Card, type DeckStats } from "../src/lib/slides/cards";
import { deckFor } from "../src/lib/slides/deck";
import { enrichmentFor } from "../src/lib/slides/enrichment";
import { closingRoleOf } from "../src/lib/slides/lesson-blocks";
import { pausePoints } from "../src/lib/slides/pause";
import { lessonReadiness, sectionsOf, type LessonReadiness, type NoteSection } from "../src/lib/slides/readiness";
import { resolveSee, typedStep } from "../src/lib/slides/see";

/**
 * The spec-content contract (the e2e rewrite of 11 Oct 2026; scratchpad/briefs/2026-10-11/E2E-CONTRACT.md). Every spec
 * reads a topic's content here and nowhere else, so no spec types a section count, a gate id or an option text: a
 * content edit changes what a walk reads, never what a test asserts. The specs name one topic, the owner's trial
 * (TRIAL below), and only as the subject of their walks; every number and every id about it comes from this module.
 *
 * What it reads:
 *  - the bundle the export SERVES (`/content/<subject>/<id>.json`), never public/content on disk: the served build is the
 *    one under test, and an agent's content build may have moved the working tree on since it was cut;
 *  - src/generated/manifest.json for the catalogue rows (id, unit, title, and the build's `ready` and `readyVia`).
 *
 * How it reads them: through the app's own rules, imported from src, so a spec and the app read one note one way.
 *  - sectionsOf (src/lib/slides/readiness.ts): the note as sections, the parser the Slides card grammar and the build's
 *    readiness share (`structure`); the Your turns in the order Read shows them must be the order it reads, or loading
 *    the topic fails saying so;
 *  - lessonBlocks, lessonSections, heroDataFor, seeStepsOf, displayTitle and gateStem (src/components/topic/
 *    lesson-plan.ts): what Read renders, how it numbers and titles its sections (one per heading the lesson keeps, the
 *    opening in the first) and their minutes, the title the hero and the title card print, and how a stem is laid out;
 *  - resolveSee and typedStep (src/lib/slides/see.ts): each See it's steps, and the one she types (never in the first);
 *  - deckFor, deckPromise and pausePoints (src/lib/slides): the deck the Slides route builds, the promise its title card
 *    prints, its recall cards (the deck's own rule, src/lib/slides/recall.ts), and where it offers Pause here;
 *  - deckGateOrders and shownOptions (src/lib/gate-order.ts): the order each Your turn shows its options in;
 *  - enrichmentFor (src/lib/slides/enrichment.ts): the consequence a gate's verdict draws;
 *  - lessonReadiness: whether a topic is ready for Slides and Read v2, and via what.
 *
 * When the page and the rule disagree, the rule is the source's and the page is the build's: a spec that compares them
 * says which is which, so a stale export and a renderer that drops a card read differently in a report.
 */

/** The owner's trial topic: the subject of the Read and Slides walks, and the one topic the specs name. */
export const TRIAL = { subject: "further-maths", slug: "algebraic-fractions-simplify" } as const;

/** A topic as the specs name it: its subject and slug. Everything else is looked up. */
export interface TopicRef {
  subject: string;
  slug: string;
}

/** A published topic's row in src/generated/manifest.json, as the build wrote it. */
export interface ManifestRow {
  id: string;
  subject: string;
  unit: string;
  slug: string;
  title: string;
  hasBlocks: boolean;
  /** The build's verdict (lessonReadiness on the shipped bundle): Slides and Read v2 are drawn exactly when true. */
  ready?: unknown;
  readyVia?: "reviewed" | "waived" | "structure" | null;
}

const MANIFEST = path.join(__dirname, "..", "src", "generated", "manifest.json");
let rows: ManifestRow[] | null = null;

/** Every published topic the build lists, in the manifest's order. */
export function manifestRows(): ManifestRow[] {
  rows ??= (JSON.parse(readFileSync(MANIFEST, "utf8")) as { topics: ManifestRow[] }).topics;
  return rows;
}

/** The topics the build made ready for Slides and Read v2, each with the way it became ready ("reviewed", "structure"…). */
export function readyRows(): ManifestRow[] {
  return manifestRows().filter((r) => r.hasBlocks && r.ready === true);
}

/** The manifest row of a topic; a spec that names a topic the build does not list fails here, saying so. */
export function topicRow(ref: TopicRef): ManifestRow {
  const row = manifestRows().find((r) => r.subject === ref.subject && r.slug === ref.slug);
  if (!row) throw new Error(`${ref.subject}/${ref.slug} is not in src/generated/manifest.json: renamed, or not published`);
  return row;
}

export const topicPath = (t: Pick<ManifestRow, "subject" | "unit" | "slug">): string => `/learn/${t.subject}/${t.unit}/${t.slug}/`;
export const slidesPath = (t: Pick<ManifestRow, "subject" | "unit" | "slug">): string => `${topicPath(t)}slides/`;
export const bundleUrl = (t: Pick<ManifestRow, "subject" | "id">): string => `/content/${t.subject}/${t.id}.json`;

/** The fields of a served bundle the contract reads. */
export interface ServedBundle {
  topic?: { id?: string; title?: string };
  note?: { verification?: string } | null;
  noteBlocks: unknown[] | null;
  workedExamples: WorkedExample[];
  prompts: RetrievalPrompt[];
  questions: Array<{ id: string; style?: string; parts?: Array<{ id?: string; answer?: AnswerLike }> }>;
  verification?: unknown[];
}

/** A question part's answer as the content writes it (src/lib/content/schema.ts AnswerSpec), read loosely. */
type AnswerLike = { kind?: string; latex?: string; value?: unknown; accept?: unknown; text?: unknown; answer?: unknown };

/** A Your turn (the note's gate), with what a walk needs to answer it and what a measurement needs to find it. */
export interface Gate {
  id: string;
  kind: GateBlock["kind"];
  prompt: string;
  /** As authored: a choice gate's answer is one of its options; a blank gate may list alternatives with " | ". */
  answer: string;
  /** As authored ([] for a typed gate). */
  options: string[];
  /** The order she is shown them, in Read and in Slides alike (src/lib/gate-order.ts); [] for a typed gate. */
  shown: string[];
  explain: string;
  twin: { prompt: string; options: string[]; answer: string; explain: string } | null;
  /** Read's number of the section that asks it. */
  section: number;
  /** A right answer as she would give it: the option, or a typed gate's first accepted form without its maths markers. */
  right: string;
  /** Every wrong option, in the order she is shown them; [] for a typed gate. */
  wrongs: string[];
  /** Its stem as both ways lay it out: the words, the maths lifted onto its own line, the words after it. */
  stem: GateStem;
  /** The consequence its verdict draws (the enrichment's id, "afs.substitute"), or null. */
  reaction: string | null;
  /** Two Your turns on one See it: "1 of 2", "2 of 2"; null for a Your turn on its own. */
  turn: { n: number; of: number } | null;
}

/** A See it, as Read and Slides show it. */
export interface SeeIt {
  /** 0-based among the note's See its. */
  index: number;
  /** Read's number of the section it shows in. */
  section: number;
  /** How many steps it shows, one per "Next step" (Read) or Continue (Slides). */
  steps: number;
  /** The step she types (0-based), or null: never in the topic's first See it, never in one drawn from a worked example. */
  typed: number | null;
  /** The Your turn it is shown for: the next gate after it. */
  gate: string | null;
}

/** A section as Read v2 numbers it (`data-lesson-section`), titles it (the track, Contents) and prices it. */
export interface ReadSection {
  n: number;
  /** The heading's first clause, as the track and Contents print it. */
  title: string;
  heading: string;
  minutes: number;
  /** "teaching" up to the close; "closing" from the first recap or pointer heading on, read as the deck reads the close. */
  part: "teaching" | "closing";
  /** Its Your turns, in order. */
  gates: string[];
  sees: SeeIt[];
  /** It holds a video. */
  video: boolean;
}

/** A deck's card as the counter numbers it ("6 of 55"). */
export interface DeckCard {
  /** 1-based, as the counter says it. */
  n: number;
  kind: Card["kind"];
  key: string;
  /** A Your turn's gate id, null for every other card. */
  gate: string | null;
  /** An idea or See it card that is the first under its heading, and so carries the heading as its title. */
  first: boolean;
  /** A drawing of the note's stands on it (an idea card's figure, a figure card, the pointer's marks). */
  figure: boolean;
}

export interface Deck {
  cards: DeckCard[];
  stats: DeckStats;
  /** The title card's promise line, "About 37 minutes · 55 cards · 11 your turns · 10 see its · 1 video". */
  promise: string;
  /** The recall cards it deals: at most two of the prompts the note places, by the deck's own rule. */
  recall: RetrievalPrompt[];
  /** The recap card's lines ("You can now" and the lines under it), [] for a deck with no recap. */
  recapLines: string[];
  /** Where it offers Pause here (after `after`) and where the slides open next time (`resumeAt`, 1-based like `n`). */
  pauses: Array<{ after: string; resume: string; resumeAt: number }>;
}

/** Everything a spec may know about a topic, read from what the export serves. */
export interface TopicContent {
  row: ManifestRow;
  path: string;
  slidesPath: string;
  bundleUrl: string;
  /** The title the hero and the Slides title card print. */
  title: string;
  /** The caption of the note's first figure, the one the hero promotes (and Slides' registered drawing stands in for). */
  heroCaption: string;
  bundle: ServedBundle;
  /** The note as sectionsOf reads it: the opening (n 0), then one section per heading that opens one. */
  structure: NoteSection[];
  /** The note as Read v2 shows it, one section per heading the lesson keeps. */
  read: ReadSection[];
  /** Every Your turn, in the note's order. */
  gates: Gate[];
  /** Every See it, in the note's order. */
  sees: SeeIt[];
  deck: Deck;
  /** The rule applied to the served bundle (src/lib/slides/readiness.ts). */
  readiness: LessonReadiness;
  /** The worked examples, the stage the lesson's last Continue goes on to when there are any. */
  workedExamples: number;
  /** Each exam-style part's answer as she would type it, in the order the stage asks them (its LaTeX read as a/b). */
  examAnswers: string[];
  gate(id: string): Gate;
  /** The Read section a gate is asked in. */
  sectionOf(gateId: string): ReadSection;
}

type Block = Record<string, unknown>;
const blockType = (b: unknown): string => (typeof b === "object" && b !== null && typeof (b as Block).type === "string" ? ((b as Block).type as string) : "");

const cache = new Map<string, Promise<TopicContent>>();

/**
 * A topic's content, read from the bundle the export serves and through the app's own rules (see the file comment).
 * Cached per worker: one fetch per topic per run.
 */
export function topicContent(request: APIRequestContext, ref: TopicRef): Promise<TopicContent> {
  const key = `${ref.subject}/${ref.slug}`;
  let hit = cache.get(key);
  if (!hit) {
    hit = load(request, ref);
    hit.catch(() => cache.delete(key));
    cache.set(key, hit);
  }
  return hit;
}

/** The trial topic's content: the subject of the walks. */
export const trialContent = (request: APIRequestContext): Promise<TopicContent> => topicContent(request, TRIAL);

async function load(request: APIRequestContext, ref: TopicRef): Promise<TopicContent> {
  const row = topicRow(ref);
  const url = bundleUrl(row);
  const res = await request.get(url);
  expect(res.status(), `${url}: the export serves no content for a topic the manifest lists (is the export older than the manifest?)`).toBe(200);
  const bundle = (await res.json()) as ServedBundle;
  const blocks = bundle.noteBlocks ?? [];
  const workedExamples = bundle.workedExamples ?? [];
  const prompts = bundle.prompts ?? [];

  // Read: the lesson's blocks (the hero's lede and figure taken out, a pause before every heading after the first) and
  // its sections, priced and titled as the page prices and titles them (TopicContent.tsx planFor).
  const steps = seeStepsOf(workedExamples);
  const hero = heroDataFor(blocks, steps, prompts);
  const lesson = lessonBlocks<unknown>(blocks, hero.lede);
  const priced = lessonSections(blocks, hero.lede, steps, prompts);
  const orders = deckGateOrders(lesson);
  const reactions = enrichmentFor(row.id)?.reactions ?? {};

  // Each lesson block's Read section, numbered as the paced note numbers them: an unheaded opening belongs to the first.
  let headings = 0;
  let closing = false;
  const read: ReadSection[] = [];
  const sees: SeeIt[] = [];
  const gates: Gate[] = [];
  const firstSee = lesson.findIndex((b) => blockType(b) === "see");
  lesson.forEach((b, i) => {
    const type = blockType(b);
    if (type === "h") {
      headings += 1;
      if (closingRoleOf(b) !== null) closing = true;
    }
    const n = Math.max(1, headings);
    while (read.length < n) {
      const p = priced[read.length];
      if (!p) throw new Error(`${row.id}: lessonSections gives ${priced.length} sections, the lesson's headings more`);
      read.push({ n: p.n, title: p.title, heading: p.heading, minutes: p.minutes, part: "teaching", gates: [], sees: [], video: false });
    }
    const section = read[n - 1]!;
    if (type === "h" && closing) section.part = "closing";
    if (type === "video") section.video = true;
    if (type === "see") {
      const resolved = resolveSee(b as SeeBlock, workedExamples);
      const next = lesson.slice(i + 1).find((x) => blockType(x) === "gate") as GateBlock | undefined;
      const see: SeeIt = { index: sees.length, section: n, steps: resolved?.steps.length ?? 0, typed: typedStep(resolved, i === firstSee), gate: next?.id ?? null };
      sees.push(see);
      section.sees.push(see);
    }
    if (type === "gate") {
      const g = b as GateBlock;
      const shown = g.kind === "choice" ? shownOptions(g, orders) : [];
      gates.push({
        id: g.id,
        kind: g.kind,
        prompt: g.prompt,
        answer: g.answer,
        options: [...(g.options ?? [])],
        shown,
        explain: g.explain,
        twin: g.twin ? { prompt: g.twin.prompt, options: [...(g.twin.options ?? [])], answer: g.twin.answer, explain: g.twin.explain } : null,
        section: n,
        right: g.kind === "choice" ? g.answer : g.answer.split("|")[0]!.trim().replace(/\$/g, ""),
        wrongs: shown.filter((o) => o.trim() !== g.answer.trim()),
        stem: gateStem(g.prompt),
        reaction: reactions[g.id] ?? null,
        turn: null,
      });
      section.gates.push(g.id);
    }
  });
  if (read.length !== priced.length) throw new Error(`${row.id}: Read shows ${read.length} sections, lessonSections prices ${priced.length}`);
  // Two Your turns in a row share one See it: "1 of 2", "2 of 2" (both ways number them so).
  for (let i = 0; i < lesson.length; ) {
    let j = i;
    while (j < lesson.length && blockType(lesson[j]) === "gate") j += 1;
    if (j - i >= 2) for (let k = i; k < j; k += 1) gates.find((g) => g.id === (lesson[k] as GateBlock).id)!.turn = { n: k - i + 1, of: j - i };
    i = j === i ? i + 1 : j;
  }

  // The structure, through the parser Slides and the build's readiness share: its gate order must be Read's.
  const structure = sectionsOf(blocks);
  const structural = structure.flatMap((s) => s.gates.map((g) => (g.block as GateBlock).id));
  if (structural.join(" ") !== gates.map((g) => g.id).join(" ")) throw new Error(`${row.id}: sectionsOf reads the gates ${structural.join(", ")}; Read shows ${gates.map((g) => g.id).join(", ")}`);

  // Slides: the deck the route builds from the same bundle, with the topic's registered enrichment.
  const built = deckFor(row.id, blocks, prompts, workedExamples);
  const pauses = pausePoints(built.cards).map((p) => ({ after: p.after, resume: p.resume, resumeAt: p.resumeAt + 1 }));
  const deck: Deck = {
    cards: built.cards.map((c, i) => ({
      n: i + 1,
      kind: c.kind,
      key: c.key,
      gate: c.kind === "gate" ? c.gate.id : null,
      first: (c.kind === "idea" || c.kind === "see") && c.first,
      figure: (c.kind === "idea" && c.figure !== null) || (c.kind === "media" && c.block.type === "figure") || (c.kind === "pointer" && c.figure !== null),
    })),
    stats: built.stats,
    promise: deckPromise(built.stats),
    recall: built.cards.flatMap((c) => (c.kind === "recall" ? [c.prompt] : [])),
    recapLines: built.cards.flatMap((c) => (c.kind === "recap" ? c.lines : [])),
    pauses,
  };

  const firstHeading = (blocks.find((b) => blockType(b) === "h") as { text?: string } | undefined)?.text ?? null;
  const byId = new Map(gates.map((g) => [g.id, g]));
  const gate = (id: string): Gate => {
    const g = byId.get(id);
    if (!g) throw new Error(`${row.id} has no gate ${id}`);
    return g;
  };
  return {
    row,
    path: topicPath(row),
    slidesPath: slidesPath(row),
    bundleUrl: url,
    title: displayTitle(row.title, firstHeading),
    heroCaption: hero.figure?.kind === "svg" ? (hero.figure.caption ?? "") : hero.figure?.kind === "photo" ? (hero.figure.photo.caption ?? "") : "",
    bundle,
    structure,
    read,
    gates,
    sees,
    deck,
    readiness: lessonReadiness(bundle),
    workedExamples: workedExamples.length,
    examAnswers: (bundle.questions ?? [])
      .filter((q) => q.style === "exam-style")
      .flatMap((q) => (q.parts ?? []).map((p) => typedAnswer(p.answer)))
      .filter((a): a is string => a !== null),
    gate,
    sectionOf: (gateId: string): ReadSection => read[gate(gateId).section - 1]!,
  };
}

/** LaTeX as she would type it: \frac{a}{b} (innermost first) as (a)/(b), the spacing and the braces of powers gone. */
export function typedTex(tex: string): string {
  let s = tex.replace(/\\left|\\right/g, "").replace(/\\[dt]frac(?![a-zA-Z])/g, "\\frac");
  const FRAC = /\\frac\{([^{}]*)\}\{([^{}]*)\}/;
  for (let guard = 0; guard < 24 && FRAC.test(s); guard += 1) s = s.replace(FRAC, (_, a: string, b: string) => `(${a})/(${b})`);
  return s
    .replace(/\\cdot|\\times/g, "*")
    .replace(/\^\{([^{}]*)\}/g, "^($1)")
    .replace(/\\[,;!]|\\ |\s+/g, "")
    .replace(/[{}]/g, "");
}

/** A part's answer as she would type it, or null when the content gives none a field can take. */
function typedAnswer(answer: AnswerLike | undefined): string | null {
  if (!answer) return null;
  if (typeof answer.latex === "string") return typedTex(answer.latex);
  if (typeof answer.value === "number" || typeof answer.value === "string") return String(answer.value);
  for (const v of [answer.accept, answer.text, answer.answer]) {
    if (typeof v === "string") return v.split("|")[0]!.trim();
    if (Array.isArray(v) && typeof v[0] === "string") return v[0];
  }
  return null;
}

/**
 * A published topic whose page is still the classic one (not ready: "Start the lesson", the rail), in a subject: the
 * one a spec prefers while the content keeps it classic, else the first in the manifest that is. Read from the served
 * content by the rule, as the readiness spec reads it, so a note migrated since does not leave a spec on the wrong page.
 */
export async function classicTopic(request: APIRequestContext, subject: string, preferred?: string): Promise<TopicContent> {
  const rows = manifestRows().filter((r) => r.subject === subject && r.hasBlocks);
  const candidates = [...rows.filter((r) => r.slug === preferred), ...rows.filter((r) => r.slug !== preferred && r.ready !== true)];
  for (const r of candidates) {
    const t = await topicContent(request, r);
    if (!t.readiness.ready) return t;
  }
  throw new Error(`no published ${subject} topic draws the classic page: every one is ready`);
}
