/**
 * Unified, read-only access to the three subject taxonomies in data/spec/.
 * Everything here is static data, so it is safe in server components and generateStaticParams.
 */
import maths from "../../../data/spec/mathematics.json";
import fm from "../../../data/spec/further-mathematics.json";
import sciTopics from "../../../data/spec/double-award-science-topics.json";
import sciSpec from "../../../data/spec/double-award-science.json";

export type Subject = "maths" | "further-maths" | "science";
export type Tier = "F" | "H" | "mixed";

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
    topicCount: code === "U7" ? sciTopics.unit7.length : sciTopics.topics.filter((t) => t.unit === code).length,
  }));
}

export function unitInfo(subject: Subject, code: string): UnitInfo | undefined {
  return unitsFor(subject).find((u) => u.code === code);
}

/* ---------------- statements ---------------- */

const mathsStatements = new Map(maths.statements.map((s) => [s.id, s]));
const fmStatements = new Map(fm.statements.map((s) => [s.id, s]));

type SciOutcome = { id: string | null; text: string; tier: string; kind?: string };
const sciOutcomes = new Map<string, SciOutcome>();
for (const unit of sciSpec.units as Array<{ code: string; sections: Array<{ topics: Array<{ outcomes: SciOutcome[] }> }> }>) {
  const code = unit.code === "7" ? "U7" : unit.code;
  for (const section of unit.sections) {
    for (const t of section.topics) {
      for (const o of t.outcomes) {
        if (o.id) sciOutcomes.set(`${code}:${o.id}`, o);
      }
    }
  }
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
    tier: "H",
    strand: t.area,
    difficulty: t.difficulty,
    calculator: "calc",
    statements: t.statementIds.map((id) => ({ id, text: fmStatements.get(id)?.text ?? id, tier: "H" as Tier })),
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

type SciTopic = (typeof sciTopics)["topics"][number];
function sciTopic(t: SciTopic): TopicInfo {
  const links: ExternalLink[] = [];
  for (const p of (t as { phet?: Array<{ name: string; url: string }> }).phet ?? []) links.push({ kind: "phet", label: `PhET: ${p.name}`, url: p.url });
  for (const v of (t as { video?: Array<{ channel: string; url: string; note?: string }> }).video ?? [])
    links.push({ kind: "youtube", label: v.channel, url: v.url, note: v.note });
  const b = (t as { bitesize?: string | null }).bitesize;
  if (b) links.push({ kind: "bitesize", label: "BBC Bitesize (CCEA)", url: b });
  return {
    subject: "science",
    unit: t.unit,
    slug: t.slug,
    title: t.title,
    tier: t.tier as Tier,
    strand: t.sectionTitle,
    difficulty: t.difficulty,
    calculator: null,
    statements: t.outcomeIds.map((id) => {
      const o = sciOutcomes.get(`${t.unit}:${id}`);
      const tier = ((t.outcomeTiers as unknown as Record<string, string>)[id] ?? o?.tier ?? "F") as Tier;
      return { id: `${t.unit}-${id}`, text: o?.text ?? id, tier };
    }),
    prerequisites: t.prerequisites,
    examinedIn: [t.unit],
    examinerEvidence: t.examinerEvidence.map((e) => ({ series: e.series, unit: e.unit, note: e.note })),
    mustMemorise: (t as { mustRecall?: string[] }).mustRecall ?? [],
    onFormulaSheet: [],
    keywords: t.keywords ?? [],
    links,
    practicals: t.practicals ?? [],
  };
}

function unit7Topic(g: (typeof sciTopics)["unit7"][number]): TopicInfo {
  return {
    subject: "science",
    unit: "U7",
    slug: g.slug,
    title: g.title,
    tier: "mixed",
    strand: "Practical skills",
    difficulty: 4,
    calculator: null,
    statements: (g as { skillIds?: string[] }).skillIds?.map((id) => ({ id, text: id, tier: "mixed" as Tier })) ?? [],
    prerequisites: [],
    examinedIn: ["U7"],
    examinerEvidence: [],
    mustMemorise: [],
    onFormulaSheet: [],
    keywords: [],
    links: [],
    practicals: (g as { practicalsPractised?: string[] }).practicalsPractised ?? [],
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
  if (unit === "U7") return sciTopics.unit7.map(unit7Topic);
  const order = (sciTopics.unitOrder as Record<string, string[]>)[unit] ?? [];
  return sciTopics.topics
    .filter((t) => t.unit === unit)
    .sort((a, b) => order.indexOf(a.slug) - order.indexOf(b.slug))
    .map(sciTopic);
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
