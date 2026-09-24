/**
 * Id helpers for the content layer (master plan §3.2): topic ids, item ids and
 * statement-id (SpecRef) existence checks against data/spec/*.json.
 *
 * The spec JSON files (~0.8 MB together) are imported statically so the validators are
 * synchronous. Import this module from the pipeline, scripts and tests; the app should
 * read the published manifest instead.
 *
 * Statement id families (all validated for existence here):
 *   maths          M4-HD-02          data/spec/mathematics.json         statements[].id
 *   further-maths  FM1-ALF-01        data/spec/further-mathematics.json statements[].id
 *   science        DA-P1-1.4.17      double-award-science.json          DA-<unit>-<outcome id>   (kind "lo")
 *                  DA-PRAC-C5                                            DA-PRAC-<practical code>
 *                  DA-U7-plan-3                                          DA-U7-<area>-<n>: Unit 7 skill n (1-based)
 *                                                                        in area plan | carry | analyse | conclude
 */
import fmSpec from "../../../data/spec/further-mathematics.json";
import scienceSpec from "../../../data/spec/double-award-science.json";
import mathsSpec from "../../../data/spec/mathematics.json";
import {
  ITEM_ID_PREFIXES,
  SPEC_REF_PATTERN,
  Slug,
  TOPIC_ID_PATTERN,
  type ItemIdPrefix,
  type SubjectId,
  type TopicBundle,
  type TopicId,
} from "./schema";

// ---------------------------------------------------------------------------
// Subjects with a spec file
// ---------------------------------------------------------------------------

export const SPEC_SUBJECTS = ["maths", "further-maths", "science"] as const;
export type SpecSubject = (typeof SPEC_SUBJECTS)[number];

export function hasSpecData(subject: string): subject is SpecSubject {
  return (SPEC_SUBJECTS as readonly string[]).includes(subject);
}

/** Unit 7 skill areas, in the order the spec prints them; `area` is the SpecRef segment. */
export const U7_AREAS = [
  { area: "plan", title: "Planning an investigation" },
  { area: "carry", title: "Carrying out an experiment" },
  { area: "analyse", title: "Analysing experimental data" },
  { area: "conclude", title: "Drawing conclusions from an experiment" },
] as const;
export type U7Area = (typeof U7_AREAS)[number]["area"];

type ScienceSpecShape = {
  units: Array<{
    code: string;
    sections: Array<{ title: string; topics: Array<{ outcomes: Array<{ id: string | null; kind: string }> }> }>;
  }>;
  prescribedPracticals: Array<{ code: string }>;
};

const maths = mathsSpec as unknown as { statements: Array<{ id: string }> };
const fm = fmSpec as unknown as { statements: Array<{ id: string }> };
const science = scienceSpec as unknown as ScienceSpecShape;

export const scienceOutcomeRef = (unit: string, outcomeId: string) => `DA-${unit}-${outcomeId}`;
export const sciencePracticalRef = (code: string) => `DA-PRAC-${code}`;
export const scienceSkillRef = (area: U7Area, n: number) => `DA-U7-${area}-${n}`;

function u7AreaFor(sectionTitle: string): U7Area {
  const t = sectionTitle.toLowerCase();
  if (t.includes("plan")) return "plan";
  if (t.includes("carry")) return "carry";
  if (t.includes("analys")) return "analyse";
  if (t.includes("conclusion")) return "conclude";
  throw new Error(`Unit 7 section "${sectionTitle}" does not match a known skill area`);
}

function buildScienceIds(): Set<string> {
  const ids = new Set<string>();
  for (const unit of science.units) {
    const isUnit7 = unit.code === "7" || unit.code === "U7";
    for (const section of unit.sections) {
      let n = 0;
      for (const topic of section.topics) {
        for (const outcome of topic.outcomes) {
          if (isUnit7) {
            if (outcome.kind === "skill") ids.add(scienceSkillRef(u7AreaFor(section.title), ++n));
          } else if (outcome.kind === "lo" && outcome.id) {
            ids.add(scienceOutcomeRef(unit.code, outcome.id));
          }
        }
      }
    }
  }
  for (const practical of science.prescribedPracticals) ids.add(sciencePracticalRef(practical.code));
  return ids;
}

const idSets = new Map<SpecSubject, ReadonlySet<string>>();

/** Every valid SpecRef for the subject (built once per subject, then cached). Throws for a subject without a spec file. */
export function statementIdsFor(subject: SubjectId): ReadonlySet<string> {
  const canonical = subjectFromAlias(subject);
  if (!hasSpecData(canonical)) {
    throw new Error(`No spec data for subject "${subject}" (known: ${SPEC_SUBJECTS.join(", ")})`);
  }
  let set = idSets.get(canonical);
  if (!set) {
    set =
      canonical === "maths"
        ? new Set(maths.statements.map((s) => s.id))
        : canonical === "further-maths"
          ? new Set(fm.statements.map((s) => s.id))
          : buildScienceIds();
    idSets.set(canonical, set);
  }
  return set;
}

/** Which subject a statement id belongs to, from its prefix (M4-…, FM1-…, DA-…), or null. */
export function subjectOfSpecRef(ref: string): SpecSubject | null {
  if (/^M\d-/.test(ref)) return "maths";
  if (/^FM\d-/.test(ref)) return "further-maths";
  if (/^DA-/.test(ref)) return "science";
  return null;
}

/** `isSpecRef("maths")("M4-HD-02") === true` — a validator bound to one subject's id set. */
export function isSpecRef(subject: SubjectId): (ref: string) => boolean {
  const ids = statementIdsFor(subject);
  return (ref) => SPEC_REF_PATTERN.test(ref) && ids.has(ref);
}

/** True when the ref exists in the spec file its prefix points at. */
export function isKnownSpecRef(ref: string): boolean {
  const subject = subjectOfSpecRef(ref);
  return subject !== null && isSpecRef(subject)(ref);
}

/** The refs that do not exist (in `subject`'s spec if given, else in the spec their prefix points at). */
export function unknownSpecRefs(refs: Iterable<string>, subject?: SubjectId): string[] {
  const check = subject ? isSpecRef(subject) : isKnownSpecRef;
  return [...new Set(refs)].filter((ref) => !check(ref));
}

/** Every statement id referenced anywhere in a topic bundle (deduplicated, in first-seen order). */
export function bundleSpecRefs(bundle: TopicBundle): string[] {
  const refs: string[] = [...bundle.topic.statementIds];
  if (bundle.note) refs.push(...bundle.note.specRefs);
  for (const list of [bundle.workedExamples, bundle.diagnostics, bundle.questions, bundle.findTheMistake, bundle.prompts]) {
    for (const item of list) refs.push(...item.specRefs);
  }
  if (bundle.insight) refs.push(...bundle.insight.specRefs);
  return [...new Set(refs)];
}

// ---------------------------------------------------------------------------
// Topic ids: <subject alias>.<unit segment>.<slug>
// ---------------------------------------------------------------------------

/** Subject ids that use a short alias inside topic ids; every other subject uses its own id. */
export const TOPIC_SUBJECT_ALIASES: Readonly<Record<string, string>> = {
  maths: "maths",
  "further-maths": "fm",
  science: "science",
};

export function subjectAliasFor(subject: SubjectId): string {
  return TOPIC_SUBJECT_ALIASES[subject] ?? subject;
}

export function subjectFromAlias(alias: string): SubjectId {
  for (const [subject, a] of Object.entries(TOPIC_SUBJECT_ALIASES)) if (a === alias) return subject;
  return alias;
}

/** Science's pseudo-unit for the 18 prescribed practicals: science.practicals.c5 */
export const PRACTICALS_UNIT = "practicals";

/** M4 → m4; FM1 | U1 | 1 → u1 (further maths); 7 | U7 → u7 (science); practicals → practicals */
export function unitSegmentFor(subject: SubjectId, unit: string): string {
  const canonical = subjectFromAlias(subject);
  const u = unit.trim();
  if (u.toLowerCase() === PRACTICALS_UNIT) return PRACTICALS_UNIT;
  if (canonical === "further-maths") {
    const m = /^(?:FM|U)?(\d)$/i.exec(u);
    if (m) return `u${m[1]}`;
  }
  if (canonical === "science" && /^U?7$/i.test(u)) return "u7";
  return u.toLowerCase();
}

/** Inverse of unitSegmentFor: u1 → FM1 (further maths); u7 → U7 (science); m4 → M4 */
export function unitFromSegment(subject: SubjectId, segment: string): string {
  const canonical = subjectFromAlias(subject);
  if (segment === PRACTICALS_UNIT) return PRACTICALS_UNIT;
  if (canonical === "further-maths") {
    const m = /^u(\d)$/.exec(segment);
    if (m) return `FM${m[1]}`;
  }
  return segment.toUpperCase();
}

export function makeTopicId(subject: SubjectId, unit: string, slug: string): TopicId {
  const parsedSlug = Slug.safeParse(slug);
  if (!parsedSlug.success) throw new Error(`Invalid topic slug "${slug}": must be kebab-case`);
  const id = `${subjectAliasFor(subject)}.${unitSegmentFor(subject, unit)}.${parsedSlug.data}`;
  if (!TOPIC_ID_PATTERN.test(id)) throw new Error(`Invalid topic id "${id}"`);
  return id;
}

export type ParsedTopicId = {
  /** full subject id, e.g. "further-maths" */
  subject: SubjectId;
  /** the alias as written in the id, e.g. "fm" */
  alias: string;
  /** canonical unit code, e.g. "FM1", "M4", "U7", "practicals" */
  unit: string;
  /** the unit segment as written, e.g. "u1" */
  unitSegment: string;
  slug: string;
};

export function tryParseTopicId(id: string): ParsedTopicId | null {
  if (!TOPIC_ID_PATTERN.test(id)) return null;
  const [alias, unitSegment, slug] = id.split(".") as [string, string, string];
  const subject = subjectFromAlias(alias);
  return { subject, alias, unit: unitFromSegment(subject, unitSegment), unitSegment, slug };
}

export function parseTopicId(id: string): ParsedTopicId {
  const parsed = tryParseTopicId(id);
  if (!parsed) throw new Error(`Invalid topic id "${id}": expected "<subject>.<unit>.<slug>"`);
  return parsed;
}

// ---------------------------------------------------------------------------
// Item ids: <prefix>.<topic id>[.<ordinal>]
// ---------------------------------------------------------------------------

/** q.maths.m4.histograms.0001 (questions pad to 4 digits), we.maths.m4.histograms.01 (everything else 2) */
export function makeItemId<P extends ItemIdPrefix>(prefix: P, topicId: string, ordinal?: number): `${P}.${string}` {
  if (!TOPIC_ID_PATTERN.test(topicId)) throw new Error(`Invalid topic id "${topicId}"`);
  if (ordinal === undefined) return `${prefix}.${topicId}`;
  if (!Number.isInteger(ordinal) || ordinal < 0) throw new Error(`Invalid ordinal ${ordinal}`);
  return `${prefix}.${topicId}.${String(ordinal).padStart(prefix === "q" ? 4 : 2, "0")}`;
}

export function parseItemId(id: string): { prefix: ItemIdPrefix; tail: string } | null {
  const dot = id.indexOf(".");
  if (dot <= 0) return null;
  const prefix = id.slice(0, dot);
  if (!(ITEM_ID_PREFIXES as readonly string[]).includes(prefix)) return null;
  const tail = id.slice(dot + 1);
  return /^[a-z0-9][a-z0-9.-]*$/.test(tail) ? { prefix: prefix as ItemIdPrefix, tail } : null;
}
