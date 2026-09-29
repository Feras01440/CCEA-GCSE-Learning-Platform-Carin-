/**
 * Unified, read-only access to the three subject taxonomies in data/spec/.
 * Everything here is static data, so it is safe in server components and generateStaticParams.
 */
import maths from "../../../data/spec/mathematics.json";
import fm from "../../../data/spec/further-mathematics.json";
import sciTopics from "../../../data/spec/double-award-science-topics.json";
import sciSpec from "../../../data/spec/double-award-science.json";

export type Subject = "maths" | "further-maths" | "science";
/**
 * A topic's or a statement's tier, as its specification states it. "untiered" is a qualification that sets no tier at
 * all (every candidate sits the same papers, as in GCSE Further Mathematics): nothing may call its content Higher.
 */
export type Tier = "F" | "H" | "mixed" | "untiered";

/** The tier a specification file gives, or "untiered" where it gives none (audit CT-06, 24 Sep 2026). */
function specTier(value: unknown): Tier {
  return value === "F" || value === "H" || value === "mixed" ? value : "untiered";
}

export interface SubjectInfo {
  id: Subject;
  title: string;
  short: string;
  tintClass: string;
  blurb: string;
}

export interface UnitInfo {
  subject: Subject;
  code: string;
  title: string;
  short: string;
  tier: "F" | "H" | null;
  weighting: number | null;
  minutes: number | null;
  marks: number | null;
  calculator: string;
  prerequisiteUnits: string[];
  note?: string;
  topicCount: number;
}

export interface StatementInfo {
  id: string;
  text: string;
  tier: Tier;
  note?: string;
  /**
   * The list a statement introduces, in the specification's words: "use the following apparatus correctly, skilfully and
   * safely:" is followed by seventeen kinds of apparatus. Present only when the specification prints a list.
   */
  bullets?: string[];
}

export interface ExternalLink {
  kind: "corbettmaths" | "bitesize" | "phet" | "youtube" | "ccea";
  label: string;
  url: string;
  note?: string;
}

export interface TopicInfo {
  subject: Subject;
  unit: string;
  slug: string;
  title: string;
  tier: Tier;
  strand: string | null;
  difficulty: number;
  calculator: string | null;
  statements: StatementInfo[];
  prerequisites: string[];
  examinedIn: string[];
  examinerEvidence: Array<{ series: string; unit?: string; note: string }>;
  mustMemorise: string[];
  onFormulaSheet: string[];
  keywords: string[];
  links: ExternalLink[];
  practicals: string[];
}

export const SUBJECTS: SubjectInfo[] = [
  {
    id: "maths",
    title: "Mathematics",
    short: "Maths",
    tintClass: "bg-tint-maths",
    blurb: "Eight units, M1 to M8. Higher route M4 + M8 is the only way to an A*.",
  },
  {
    id: "further-maths",
    title: "Further Mathematics",
    short: "Further Maths",
    tintClass: "bg-tint-fm",
    blurb: "Unit 1 Pure is compulsory; Mechanics and Statistics are the two options almost everyone takes.",
  },
  {
    id: "science",
    title: "Double Award Science",
    short: "Science",
    tintClass: "bg-tint-bio",
    blurb: "Biology, Chemistry and Physics in two units each, plus Unit 7 practical skills, which is a quarter of the grade.",
  },
];

export function subjectInfo(id: string): SubjectInfo | undefined {
  return SUBJECTS.find((s) => s.id === id);
}

/* ---------------- the science catalogue, read from the specification's own shape ---------------- */

/** A specification outcome as the science file holds it; `id` is null where the specification prints no number. */
export interface SpecOutcome {
  id: string | null;
  text: string;
  tier: string;
  kind?: string;
  bullets?: Array<{ text: string; tier?: string }>;
}

/** The science specification file's shape (data/spec/double-award-science.json), as far as the catalogue reads it. */
export interface SpecShape {
  units: Array<{ code: string; sections: Array<{ title: string; topics: Array<{ outcomes: SpecOutcome[] }> }> }>;
}

/**
 * A science catalogue entry (data/spec/double-award-science-topics.json), in either of its two shapes: a unit topic,
 * which names its outcomes by the specification's own numbers (`outcomeIds`, "2.3.8"), or a skills topic, which is a
 * whole section of a unit whose skills the specification prints without numbers, so the catalogue names them by place
 * (`skillIds`, "U7.1.1": the unit's first section, its first skill) and copies their words beside them (`skills`).
 */
export interface CatalogueEntry {
  slug: string;
  unit: string;
  title: string;
  sectionTitle: string;
  difficulty: number;
  prerequisites: string[];
  examinerEvidence: Array<{ series: string; unit?: string; note: string }>;
  tier?: string;
  outcomeIds?: string[];
  outcomeTiers?: Record<string, string>;
  skillIds?: string[];
  skills?: Array<{ id: string; text: string; bullets?: string[] }>;
  mustRecall?: string[];
  keywords?: string[];
  practicals?: string[];
  practicalsPractised?: string[];
  phet?: Array<{ name: string; url: string }>;
  video?: Array<{ channel: string; url: string; note?: string }>;
  bitesize?: string | null;
}

/**
 * The catalogue's code for a specification unit. The specification numbers a unit that belongs to no single discipline
 * ("7"); the catalogue, the bundles and the routes write it with a U ("U7"), as src/lib/content/ids.ts reads it. A unit
 * with a discipline letter ("B1", "P2") keeps its code.
 */
export function catalogueUnitCode(specCode: string): string {
  return /^\d+$/.test(specCode) ? `U${specCode}` : specCode;
}

/** An outcome's key by the specification's own number. */
const byNumber = (unit: string, id: string): string => `${unit}:${id}`;
/** An unnumbered outcome's key by its place: its section, and its order among that section's unnumbered outcomes. */
const byPlace = (unit: string, section: number, n: number): string => `${unit}#${section}.${n}`;

/**
 * Every outcome of a specification, keyed so a catalogue entry can find it: by the specification's own number where it
 * prints one ("P2:2.3.8"), and by place where it prints none ("U7#1.1"). Places count from 1 within each section, across
 * the section's topics in document order, as src/lib/content/ids.ts numbers the DA-U7-<area>-<n> refs.
 */
export function indexSpecOutcomes(spec: SpecShape): ReadonlyMap<string, SpecOutcome> {
  const index = new Map<string, SpecOutcome>();
  for (const unit of spec.units) {
    const code = catalogueUnitCode(unit.code);
    unit.sections.forEach((section, s) => {
      let n = 0;
      for (const topic of section.topics) {
        for (const outcome of topic.outcomes) {
          index.set(outcome.id ? byNumber(code, outcome.id) : byPlace(code, s + 1, ++n), outcome);
        }
      }
    });
  }
  return index;
}

const SCIENCE_OUTCOMES = indexSpecOutcomes(sciSpec as unknown as SpecShape);
/** Every science catalogue entry: the unit topics, then the skills topics, which the catalogue file keeps in `unit7`. */
const SCIENCE_CATALOGUE = [...sciTopics.topics, ...sciTopics.unit7] as unknown as readonly CatalogueEntry[];

/* ---------------- units ---------------- */

type MathsUnit = (typeof maths)["units"][number];
type FmUnit = (typeof fm)["units"][number];

const SCIENCE_UNIT_META: Record<string, { title: string; short: string; minutes: number; marks: number; weighting: number; discipline: string }> = {
  B1: { title: "Biology Unit B1: Cells, Living Processes and Biodiversity", short: "Biology 1", minutes: 60, marks: 70, weighting: 11, discipline: "Biology" },
  C1: { title: "Chemistry Unit C1: Structures, Trends, Chemical Reactions, Quantitative Chemistry and Analysis", short: "Chemistry 1", minutes: 60, marks: 70, weighting: 11, discipline: "Chemistry" },
  P1: { title: "Physics Unit P1: Motion, Force, Moments, Energy, Density, Kinetic Theory, Radioactivity, Nuclear Fission and Fusion", short: "Physics 1", minutes: 60, marks: 70, weighting: 11, discipline: "Physics" },
  B2: { title: "Biology Unit B2: Body Systems, Genetics, Microorganisms and Health", short: "Biology 2", minutes: 75, marks: 80, weighting: 14, discipline: "Biology" },
  C2: { title: "Chemistry Unit C2: Further Chemical Reactions, Rates and Equilibrium, Calculations and Organic Chemistry", short: "Chemistry 2", minutes: 75, marks: 80, weighting: 14, discipline: "Chemistry" },
  P2: { title: "Physics Unit P2: Waves, Light, Electricity, Magnetism, Electromagnetism and Space Physics", short: "Physics 2", minutes: 75, marks: 80, weighting: 14, discipline: "Physics" },
  U7: { title: "Unit 7: Practical Skills (Booklet A practical, Booklet B written)", short: "Practical skills", minutes: 90, marks: 105, weighting: 25, discipline: "All three" },
};

export function unitsFor(subject: Subject): UnitInfo[] {
  if (subject === "maths") {
    return (maths.units as MathsUnit[]).map((u) => ({
      subject,
      code: u.code,
      title: u.title,
      short: u.code,
      tier: u.tier as "F" | "H",
      weighting: u.weighting,
      minutes: u.papers.reduce((s, p) => s + p.durationMinutes, 0),
      marks: u.papers.reduce((s, p) => s + p.marks, 0),
      calculator: u.papers.length === 2 ? "Paper 1 non-calculator, Paper 2 calculator" : "Calculator",
      prerequisiteUnits: u.prerequisiteUnits,
      note: u.kind === "gateway" ? `Targets ${u.targetGrades.join(", ")}` : `Completion test · targets ${u.targetGrades.join(", ")}`,
      topicCount: maths.topics.filter((t) => t.introducedIn === u.code).length,
    }));
  }
  if (subject === "further-maths") {
    return (fm.units as FmUnit[]).map((u) => ({
      subject,
      code: u.code,
      title: u.title,
      short: u.shortTitle,
      tier: null,
      weighting: u.weighting,
      minutes: u.durationMinutes,
      marks: u.marks,
      calculator: "Calculator",
      prerequisiteUnits: [],
      note: u.compulsory ? "Compulsory" : (u as { lowUptake?: boolean }).lowUptake ? "Optional · very few candidates" : "Optional",
      topicCount: fm.topics.filter((t) => t.unit === u.code).length,
    }));
  }
  return Object.entries(SCIENCE_UNIT_META).map(([code, m]) => ({
    subject,
    code,
    title: m.title,
    short: m.short,
    tier: null,
    weighting: m.weighting,
    minutes: m.minutes,
    marks: m.marks,
    calculator: "Calculator allowed",
    prerequisiteUnits: code.endsWith("2") ? [code[0] + "1"] : [],
    note: code === "U7" ? "Booklet A 7.5% · Booklet B 17.5%" : `${m.discipline} · Foundation and Higher`,
    topicCount: SCIENCE_CATALOGUE.filter((t) => t.unit === code).length,
  }));
}

export function unitInfo(subject: Subject, code: string): UnitInfo | undefined {
  return unitsFor(subject).find((u) => u.code === code);
}

/* ---------------- statements ---------------- */

const mathsStatements = new Map(maths.statements.map((s) => [s.id, s]));
const fmStatements = new Map(fm.statements.map((s) => [s.id, s]));

/**
 * The outcome a catalogue id names: a specification number ("2.3.8"), or a place written with its unit ("U7.1.1", the
 * unit's first section, its first unnumbered skill).
 */
function outcomeFor(outcomes: ReadonlyMap<string, SpecOutcome>, unit: string, id: string): SpecOutcome | undefined {
  const numbered = outcomes.get(byNumber(unit, id));
  if (numbered) return numbered;
  if (!id.startsWith(`${unit}.`)) return undefined;
  const place = id.slice(unit.length + 1).split(".");
  return place.length === 2 && place.every((p) => /^\d+$/.test(p)) ? outcomes.get(byPlace(unit, Number(place[0]), Number(place[1]))) : undefined;
}

/** A science statement's tier as the catalogue or the specification marks it; unmarked means both tiers sit it. */
function scienceTier(value: string | undefined): Tier {
  return value === "H" || value === "mixed" ? value : "F";
}

/** The tier a topic's statements add up to: all Foundation text, all Higher, or some of each. */
function tierOf(statements: readonly StatementInfo[]): Tier {
  if (statements.length > 0 && statements.every((s) => s.tier === "H")) return "H";
  return statements.every((s) => s.tier === "F") ? "F" : "mixed";
}

/* ---------------- topics ---------------- */

function mathsTopic(t: (typeof maths)["topics"][number]): TopicInfo {
  return {
    subject: "maths",
    unit: t.introducedIn,
    slug: t.slug,
    title: t.title,
    tier: t.tier as Tier,
    strand: maths.strands.find((s) => s.id === t.strand)?.title ?? t.strand,
    difficulty: t.difficulty,
    calculator: t.calculator,
    statements: t.statementIds.map((id) => {
      const s = mathsStatements.get(id);
      return { id, text: s?.text ?? id, tier: (t.tier as Tier) ?? "H", note: (s as { note?: string } | undefined)?.note };
    }),
    prerequisites: t.prerequisites,
    examinedIn: t.examinedIn,
    examinerEvidence: t.examinerEvidence,
    mustMemorise: t.mustMemorise ?? [],
    onFormulaSheet: t.onFormulaSheet ?? [],
    keywords: t.keywords ?? [],
    links: (t.corbettmaths ?? [])
      .filter((c) => c.url)
      .map((c) => ({ kind: "corbettmaths" as const, label: `Corbettmaths ${c.videoNumber ? "video " + c.videoNumber : ""}: ${c.title}`.trim(), url: c.url as string })),
    practicals: [],
  };
}

function fmTopic(t: (typeof fm)["topics"][number]): TopicInfo {
  return {
    subject: "further-maths",
    unit: t.unit,
    slug: t.slug,
    title: t.title,
    // The specification sets no tier for any topic or statement, so they are untiered: never "Higher tier only".
    tier: specTier((t as { tier?: unknown }).tier),
    strand: t.area,
    difficulty: t.difficulty,
    calculator: "calc",
    statements: t.statementIds.map((id) => {
      const s = fmStatements.get(id);
      return { id, text: s?.text ?? id, tier: specTier((s as { tier?: unknown } | undefined)?.tier) };
    }),
    prerequisites: t.prerequisites.filter((p) => !p.startsWith("maths:")),
    examinedIn: [t.unit],
    examinerEvidence: t.examinerEvidence.map((e) => ({ series: e.series, note: e.note })),
    mustMemorise: (t as { mustMemorise?: string[] }).mustMemorise ?? [],
    onFormulaSheet: (t as { onFormulaSheet?: string[] }).onFormulaSheet ?? [],
    keywords: t.keywords ?? [],
    links: [],
    practicals: [],
  };
}

/**
 * A science topic from its catalogue entry, in either shape (CatalogueEntry), read the same way: each statement's words,
 * tier and list from the specification, found by number or by place; the difficulty, strand, prerequisites, examiners'
 * evidence, recall lines, keywords, practicals and reading links from the entry itself. Nothing here knows a unit: a
 * new practical unit, or a new subject in this file's shape, is a data addition.
 *
 * A statement the specification has lost falls back to the entry's own copy of its words, and to its id only as a last
 * resort (taxonomy.test.ts keeps that out of every real topic). A number is shown with its unit ("P2-2.3.8"); a place is
 * already written with its unit and is shown as the catalogue writes it ("U7.1.1").
 */
export function scienceTopicFrom(entry: CatalogueEntry, outcomes: ReadonlyMap<string, SpecOutcome>): TopicInfo {
  const unit = entry.unit;
  const own = new Map((entry.skills ?? []).map((s) => [s.id, s]));
  const statements = (entry.outcomeIds ?? entry.skillIds ?? []).map((id): StatementInfo => {
    const outcome = outcomeFor(outcomes, unit, id);
    const copy = own.get(id);
    const bullets = outcome ? (outcome.bullets ?? []).map((b) => b.text) : (copy?.bullets ?? []);
    return {
      id: id.startsWith(`${unit}.`) ? id : `${unit}-${id}`,
      text: outcome?.text ?? copy?.text ?? id,
      tier: scienceTier(entry.outcomeTiers?.[id] ?? outcome?.tier),
      ...(bullets.length > 0 ? { bullets } : {}),
    };
  });
  const links: ExternalLink[] = [];
  for (const p of entry.phet ?? []) links.push({ kind: "phet", label: `PhET: ${p.name}`, url: p.url });
  for (const v of entry.video ?? []) links.push({ kind: "youtube", label: v.channel, url: v.url, note: v.note });
  if (entry.bitesize) links.push({ kind: "bitesize", label: "BBC Bitesize (CCEA)", url: entry.bitesize });
  return {
    subject: "science",
    unit,
    slug: entry.slug,
    title: entry.title,
    tier: entry.tier === "F" || entry.tier === "H" || entry.tier === "mixed" ? entry.tier : tierOf(statements),
    strand: entry.sectionTitle,
    difficulty: entry.difficulty,
    calculator: null,
    statements,
    prerequisites: entry.prerequisites,
    examinedIn: [unit],
    examinerEvidence: entry.examinerEvidence.map((e) => ({ series: e.series, unit: e.unit, note: e.note })),
    mustMemorise: entry.mustRecall ?? [],
    onFormulaSheet: [],
    keywords: entry.keywords ?? [],
    links,
    practicals: entry.practicals ?? entry.practicalsPractised ?? [],
  };
}

export function topicsFor(subject: Subject, unit: string): TopicInfo[] {
  if (subject === "maths") {
    const order = maths.routes.higher.topicOrder;
    return maths.topics
      .filter((t) => t.introducedIn === unit)
      .sort((a, b) => order.indexOf(a.slug) - order.indexOf(b.slug))
      .map(mathsTopic);
  }
  if (subject === "further-maths") {
    const order = (fm.topicOrder as Record<string, string[]>)[unit] ?? [];
    return fm.topics
      .filter((t) => t.unit === unit)
      .sort((a, b) => order.indexOf(a.slug) - order.indexOf(b.slug))
      .map(fmTopic);
  }
  // A unit the catalogue gives no teaching order keeps the catalogue's own order (the sort is stable).
  const order = (sciTopics.unitOrder as Record<string, string[]>)[unit] ?? [];
  return SCIENCE_CATALOGUE.filter((t) => t.unit === unit)
    .sort((a, b) => order.indexOf(a.slug) - order.indexOf(b.slug))
    .map((t) => scienceTopicFrom(t, SCIENCE_OUTCOMES));
}

export function topicInfo(subject: Subject, unit: string, slug: string): TopicInfo | undefined {
  return topicsFor(subject, unit).find((t) => t.slug === slug);
}

export function allTopicParams(): Array<{ subject: Subject; unit: string; topic: string }> {
  const out: Array<{ subject: Subject; unit: string; topic: string }> = [];
  for (const s of SUBJECTS) for (const u of unitsFor(s.id)) for (const t of topicsFor(s.id, u.code)) out.push({ subject: s.id, unit: u.code, topic: t.slug });
  return out;
}

export function allUnitParams(): Array<{ subject: Subject; unit: string }> {
  const out: Array<{ subject: Subject; unit: string }> = [];
  for (const s of SUBJECTS) for (const u of unitsFor(s.id)) out.push({ subject: s.id, unit: u.code });
  return out;
}

export function difficultyLabel(d: number): string {
  return ["", "Routine", "Standard", "Demanding", "Hard", "Where marks are lost"][d] ?? "";
}
