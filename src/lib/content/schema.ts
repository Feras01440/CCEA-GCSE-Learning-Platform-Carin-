/**
 * Content schemas for subject packs — master plan §3.9, implemented in Zod 4.
 *
 * Single source of truth for every JSON file under `packs/<subject>/content/**`, the
 * MDX note frontmatter, the mined layer, the data pack and the verification log.
 * `z.toJSONSchema` output (see `json-schema.ts` / `scripts/export-json-schema.mjs`)
 * is what editors and structured drafting validate against.
 *
 * Conventions enforced here (shape-level; existence checks live in `ids.ts` and the
 * pipeline G0 check):
 *  - item ids are prefixed by type: note. we. dx. q. ftm. rp. ins. prac. eq. qwc. set. mock. ver.
 *  - `ExaminerSource` = ccea-cer:<subject>:<yyyy>-<series>:<unit>:Q<n>[part]
 *  - a question's `totalMarks` equals the sum of its parts; a part's scheme (when given)
 *    sums to the part's marks; `MarkPoint.dependsOn` names mark points of the same part
 *  - an mcq has exactly one correct option unless `multi: true`
 *  - every `Tolerance` variant carries the fields it needs (`range` has min <= max, …)
 *
 * Nothing in this module reads the spec JSON files, so it is safe to import anywhere.
 */
import { z } from "zod";

// ---------------------------------------------------------------------------
// Registry (module-local so hot reloads never collide on ids) and helpers
// ---------------------------------------------------------------------------

export const contentRegistry = z.registry<{ id: string; description?: string }>();

/** Register a schema under a stable name so `z.toJSONSchema` emits it as a `$defs` entry. */
function named<T extends z.ZodType>(schema: T, id: string, description?: string): T {
  contentRegistry.add(schema, description ? { id, description } : { id });
  return schema;
}

const sum = (xs: readonly number[]) => xs.reduce((a, b) => a + b, 0);

function duplicates(values: readonly string[]): string[] {
  const seen = new Set<string>();
  const dupes = new Set<string>();
  for (const v of values) (seen.has(v) ? dupes : seen).add(v);
  return [...dupes];
}

/** Whole-file objects may carry "$schema" so editors validate them against pipeline/schema/*.json. */
const SchemaPointer = z.string().min(1).optional();

// ---------------------------------------------------------------------------
// Shared references
// ---------------------------------------------------------------------------

export const KNOWN_SUBJECT_IDS = [
  "maths",
  "further-maths",
  "science",
  "english-language",
  "english-literature",
] as const;
export type KnownSubjectId = (typeof KNOWN_SUBJECT_IDS)[number];

/** Subject ids are kebab-case; the five known ones are listed in KNOWN_SUBJECT_IDS but any pack may add more. */
export const SubjectId = named(
  z.string().regex(/^[a-z][a-z0-9-]*$/, { error: 'subject id must be kebab-case, e.g. "further-maths"' }),
  "SubjectId",
  'Subject pack id: "maths" | "further-maths" | "science" | "english-language" | "english-literature" | another kebab-case id',
);
export type SubjectId = z.infer<typeof SubjectId>;

export const Tier = named(z.enum(["F", "H", "both", "untiered"]), "Tier");
export type Tier = z.infer<typeof Tier>;

/**
 * Statement id. Shape only — `M4-HD-02`, `FM1-ALF-01`, `DA-P1-1.4.17`, `DA-PRAC-C5`, `DA-U7-plan-3`.
 * Existence against data/spec/*.json is checked by `isSpecRef(subject)` in ids.ts.
 */
export const SPEC_REF_PATTERN = /^[A-Z][A-Z0-9]{0,4}(-[A-Za-z0-9.]+){1,3}$/;
export const SpecRef = named(
  z.string().regex(SPEC_REF_PATTERN, {
    error: 'spec ref must look like "M4-HD-02", "FM1-ALF-01", "DA-P1-1.4.17", "DA-PRAC-C5" or "DA-U7-plan-3"',
  }),
  "SpecRef",
  "Learning-outcome statement id from data/spec/*.json",
);
export type SpecRef = z.infer<typeof SpecRef>;

/** Topic id: `<subject-alias>.<unit>.<slug>` — maths.m4.histograms, fm.u1.algebraic-fractions-add-subtract, science.practicals.c5 */
export const TOPIC_ID_PATTERN = /^[a-z][a-z0-9-]*\.[a-z0-9]+\.[a-z0-9]+(-[a-z0-9]+)*$/;
export const TopicId = named(
  z.string().regex(TOPIC_ID_PATTERN, {
    error: 'topic id must be "<subject>.<unit>.<slug>" in lowercase, e.g. "maths.m4.histograms"',
  }),
  "TopicId",
  'Teachable-topic id "<subject>.<unit>.<slug>", e.g. "maths.m4.histograms"',
);
export type TopicId = z.infer<typeof TopicId>;

export const Slug = z.string().regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, { error: "slug must be kebab-case" });

/** Exam series id used in examiner sources and the misconception registry: 2025-summer, 2024-november, 2027-march */
export const SeriesId = named(
  z.string().regex(/^\d{4}-(summer|november|march|january)$/, {
    error: 'series must be "<yyyy>-<summer|november|march|january>"',
  }),
  "SeriesId",
);
export type SeriesId = z.infer<typeof SeriesId>;

/**
 * ccea-cer:<subject>:<series>:<unit>:Q<n>[part] — e.g. ccea-cer:maths:2025-summer:M4:Q22.
 * The part suffix is optional: a letter bare or in parentheses, then an optional roman numeral
 * in parentheses — Q21b, Q22(a), Q22(a)(ii), Q22b(ii).
 */
const QUESTION_REF = /\d{1,2}(?:[a-z]|\([a-z]\))?(?:\([ivx]{1,4}\))?/;
export const EXAMINER_SOURCE_PATTERN = new RegExp(
  `^ccea-cer:[a-z][a-z0-9-]*:\\d{4}-(?:summer|november|march|january):[A-Za-z0-9]+:Q${QUESTION_REF.source}$`,
);
export const ExaminerSource = named(
  z.templateLiteral(
    [
      "ccea-cer:",
      z.string().regex(/[a-z][a-z0-9-]*/),
      ":",
      z.string().regex(/\d{4}-(?:summer|november|march|january)/),
      ":",
      z.string().regex(/[A-Za-z0-9]+/),
      ":Q",
      z.string().regex(QUESTION_REF),
    ],
    {
      error:
        'examiner source must be "ccea-cer:<subject>:<yyyy>-<series>:<unit>:Q<n>", e.g. "ccea-cer:maths:2025-summer:M4:Q22"',
    },
  ),
  "ExaminerSource",
  "Chief Examiner report citation: ccea-cer:<subject>:<yyyy>-<series>:<unit>:Q<n>",
);
export type ExaminerSource = z.infer<typeof ExaminerSource>;

/** Misconception-registry tag: hist.freq-as-height, median.class-midpoint */
export const MisconceptionId = named(
  z.string().regex(/^[a-z0-9]+(\.[a-z0-9]+(-[a-z0-9]+)*)+$/, {
    error: 'misconception id must be "<area>.<name>" in kebab-case, e.g. "hist.freq-as-height"',
  }),
  "MisconceptionId",
);
export type MisconceptionId = z.infer<typeof MisconceptionId>;

/** Unit code as CCEA prints it: M4, FM1, B1, P2, 7 (science Unit 7) */
export const UnitCode = z
  .string()
  .regex(/^[A-Z]{0,3}[0-9]{1,2}$/, { error: 'unit code must look like "M4", "FM1", "P1" or "7"' });

/** ISO calendar date or date-time (with or without offset). */
export const IsoDateLike = named(
  z.union([z.iso.date(), z.iso.datetime({ offset: true, local: true })]),
  "IsoDateLike",
  "ISO 8601 date (2026-09-05) or date-time (2026-09-05T10:00:00Z)",
);
export type IsoDateLike = z.infer<typeof IsoDateLike>;

export const PaperContext = named(
  z.object({
    unit: UnitCode,
    paper: z.literal([1, 2]).optional(),
    calculator: z.boolean(),
    bookletB: z.boolean().optional(),
    resources: z.array(z.string().min(1)),
  }),
  "PaperContext",
  "Which paper the item imitates: unit, paper 1/2, calculator, Booklet B, resources allowed",
);
export type PaperContext = z.infer<typeof PaperContext>;

export const ItemTypeId = named(
  z.enum(["note", "we", "dx", "q", "ftm", "rp", "ins", "prac", "eq", "qwc", "set", "mock", "ew", "ann"]),
  "ItemTypeId",
);
export type ItemTypeId = z.infer<typeof ItemTypeId>;

export const AnswerKind = named(
  z.enum([
    "numeric",
    "algebraic",
    "mcq",
    "text",
    "text-long",
    "graph",
    "drawing",
    "table",
    "matrix",
    "equation",
    "steps",
    "label",
    "order",
    "annotation",
  ]),
  "AnswerKind",
);
export type AnswerKind = z.infer<typeof AnswerKind>;

export const Hardness = named(
  z.enum(["L", "S", "H"]),
  "Hardness",
  "Bundle size: L lite, S standard, H hard (examiner-flagged)",
);
export type Hardness = z.infer<typeof Hardness>;

export const Difficulty = named(z.literal([1, 2, 3, 4, 5]), "Difficulty", "1 routine … 5 A*/A discriminator");
export type Difficulty = z.infer<typeof Difficulty>;

// ---------------------------------------------------------------------------
// Prefixed item ids
// ---------------------------------------------------------------------------

export const ITEM_ID_PREFIXES = [
  "note",
  "we",
  "dx",
  "q",
  "ftm",
  "rp",
  "ins",
  "prac",
  "eq",
  "qwc",
  "set",
  "mock",
  "ver",
] as const;
export type ItemIdPrefix = (typeof ITEM_ID_PREFIXES)[number];

const ID_TAIL = /[a-z0-9][a-z0-9.-]*/;

/** `<prefix>.<lowercase letters, digits, dots, hyphens>` — e.g. q.maths.m4.histograms.0001 */
export function itemId<P extends ItemIdPrefix>(prefix: P) {
  return z.templateLiteral([`${prefix}.` as `${P}.`, z.string().regex(ID_TAIL)], {
    error: `id must start with "${prefix}." followed by lowercase letters, digits, dots or hyphens`,
  });
}

export const NoteId = named(itemId("note"), "NoteId");
export const WorkedExampleId = named(itemId("we"), "WorkedExampleId");
export const DiagnosticSetId = named(itemId("dx"), "DiagnosticSetId");
export const QuestionId = named(itemId("q"), "QuestionId");
export const FindTheMistakeId = named(itemId("ftm"), "FindTheMistakeId");
export const RetrievalPromptId = named(itemId("rp"), "RetrievalPromptId");
export const ExaminerInsightId = named(itemId("ins"), "ExaminerInsightId");
export const PracticalId = named(itemId("prac"), "PracticalId");
export const PhysicsEquationId = named(itemId("eq"), "PhysicsEquationId");
export const QwcItemId = named(itemId("qwc"), "QwcItemId");
export const PracticeSetId = named(itemId("set"), "PracticeSetId");
export const MockPaperId = named(itemId("mock"), "MockPaperId");
export const VerificationRef = named(itemId("ver"), "VerificationRef", "Id of the item's VerificationLog");

export type NoteId = z.infer<typeof NoteId>;
export type WorkedExampleId = z.infer<typeof WorkedExampleId>;
export type DiagnosticSetId = z.infer<typeof DiagnosticSetId>;
export type QuestionId = z.infer<typeof QuestionId>;
export type FindTheMistakeId = z.infer<typeof FindTheMistakeId>;
export type RetrievalPromptId = z.infer<typeof RetrievalPromptId>;
export type ExaminerInsightId = z.infer<typeof ExaminerInsightId>;
export type PracticalId = z.infer<typeof PracticalId>;
export type PhysicsEquationId = z.infer<typeof PhysicsEquationId>;
export type QwcItemId = z.infer<typeof QwcItemId>;
export type PracticeSetId = z.infer<typeof PracticeSetId>;
export type MockPaperId = z.infer<typeof MockPaperId>;
export type VerificationRef = z.infer<typeof VerificationRef>;

// ---------------------------------------------------------------------------
// External references (link out, never copy)
// ---------------------------------------------------------------------------

export const ExternalRef = named(
  z.discriminatedUnion("kind", [
    z.object({
      kind: z.literal("corbettmaths"),
      videos: z.array(z.int().positive()),
      playlistId: z.string().min(1).optional(),
      practiceUrl: z.url().optional(),
      textbookUrl: z.url().optional(),
    }),
    z.object({ kind: z.literal("bitesize"), url: z.url(), articleId: z.string().min(1).optional() }),
    z.object({
      kind: z.literal("youtube"),
      videoId: z.string().regex(/^[A-Za-z0-9_-]{6,}$/),
      channel: z.string().min(1),
      start: z.number().nonnegative().optional(),
      end: z.number().positive().optional(),
      credit: z.string().min(1),
      checkpoints: z.array(z.object({ at: z.number().nonnegative(), promptId: RetrievalPromptId })).optional(),
    }),
    z.object({
      kind: z.literal("ccea-doc"),
      docType: z.enum([
        "spec",
        "teacher-guidance",
        "factfile",
        "glossary",
        "practical-manual",
        "qa-booklet",
        "data-leaflet",
        "cer",
        "pastpaper",
        "markscheme",
      ]),
      url: z.url(),
      page: z.int().positive().optional(),
      asOf: IsoDateLike,
    }),
    z.object({
      kind: z.literal("phet"),
      sim: z.string().min(1),
      url: z.url(),
      licence: z.enum(["CC BY 4.0 (pre-2026-03-29)", "CC BY-NC 4.0"]),
      attribution: z.string().min(1),
    }),
    z.object({
      kind: z.literal("geogebra"),
      materialId: z.string().min(1),
      attribution: z.literal("Made with GeoGebra®"),
    }),
    z.object({
      kind: z.literal("pastpaper-question"),
      paperId: z.string().min(1),
      question: z.string().min(1),
      page: z.int().positive(),
    }),
  ]),
  "ExternalRef",
  "Outbound link to Corbettmaths, Bitesize, YouTube, a CCEA document, PhET, GeoGebra or a past-paper question (metadata only)",
);
export type ExternalRef = z.infer<typeof ExternalRef>;

// ---------------------------------------------------------------------------
// Figures
// ---------------------------------------------------------------------------

export const FigureSpec = named(
  z.discriminatedUnion("kind", [
    z.object({
      kind: z.literal("svg-gen"),
      generator: z.enum(["histogram", "cf-curve", "box-plot", "bar", "pie", "scatter", "table", "number-line", "axes"]),
      data: z.unknown(),
      options: z.unknown().optional(),
    }),
    z.object({ kind: z.literal("jsxgraph"), script: z.string().min(1), static: z.boolean() }),
    z.object({ kind: z.literal("mafs"), component: z.string().min(1), props: z.unknown() }),
    z.object({ kind: z.literal("svg"), src: z.string().min(1), alt: z.string().min(1) }),
    z.object({
      kind: z.literal("photo"),
      src: z.string().min(1),
      alt: z.string().min(1),
      licence: z.string().min(1),
      credit: z.string().min(1),
      prompt: z.string().optional(),
    }),
    z.object({
      kind: z.literal("apparatus"),
      parts: z.array(z.string().min(1)).min(1),
      style: z.literal("ccea-2d"),
    }),
  ]),
  "FigureSpec",
);
export type FigureSpec = z.infer<typeof FigureSpec>;

// ---------------------------------------------------------------------------
// Tolerances, answers, graphs
// ---------------------------------------------------------------------------

export const Tolerance = named(
  z.discriminatedUnion("type", [
    z.object({ type: z.literal("absolute"), value: z.number().nonnegative() }),
    z.object({ type: z.literal("relative"), value: z.number().nonnegative() }),
    z.object({ type: z.literal("dp"), places: z.int().nonnegative() }),
    z.object({ type: z.literal("sf"), figures: z.int().positive() }),
    z
      .object({ type: z.literal("range"), min: z.number(), max: z.number() })
      .refine((t) => t.min <= t.max, { message: "range tolerance needs min <= max", path: ["max"] }),
    z.object({ type: z.literal("exact") }),
  ]),
  "Tolerance",
  "How close a numeric answer must be: absolute, relative, decimal places, significant figures, a range, or exact",
);
export type Tolerance = z.infer<typeof Tolerance>;

export const McqOption = named(
  z.object({
    id: z.string().min(1),
    text: z.string().min(1),
    correct: z.boolean(),
    misconception: MisconceptionId.optional(),
    feedback: z.string().min(1),
  }),
  "McqOption",
);
export type McqOption = z.infer<typeof McqOption>;

/** Adds "option ids unique" and "exactly one correct (unless multi)" issues to ctx. */
function checkOptions(
  options: readonly McqOption[],
  ctx: z.RefinementCtx,
  { multi = false, path = ["options"] as PropertyKey[] } = {},
) {
  for (const id of duplicates(options.map((o) => o.id))) {
    ctx.addIssue({ code: "custom", message: `duplicate option id "${id}"`, path });
  }
  const correct = options.filter((o) => o.correct).length;
  if (multi) {
    if (correct === 0) {
      ctx.addIssue({ code: "custom", message: "a multi-select mcq needs at least one correct option", path });
    }
  } else if (correct !== 1) {
    ctx.addIssue({
      code: "custom",
      message: `an mcq needs exactly one correct option (found ${correct}); set multi: true for multi-select`,
      path,
    });
  }
}

const Point = z.tuple([z.number(), z.number()]);

export const GraphExpectation = named(
  z.discriminatedUnion("plot", [
    z.object({
      plot: z.literal("histogram"),
      bars: z
        .array(
          z
            .object({ from: z.number(), to: z.number(), frequencyDensity: z.number().nonnegative() })
            .refine((b) => b.from < b.to, { message: "bar needs from < to", path: ["to"] }),
        )
        .min(1),
      axisLabelY: z.literal("Frequency density"),
      scaleTolerance: z.number().nonnegative(),
    }),
    z.object({
      plot: z.literal("points-line"),
      points: z.array(Point).min(1),
      lineThrough: z.array(Point).optional(),
      tolerance: Tolerance,
      lineRequired: z.boolean(),
    }),
    z.object({
      plot: z.literal("curve"),
      samples: z.array(Point).min(2),
      tolerance: Tolerance,
      smooth: z.literal(true),
      noStraightSegments: z.literal(true),
    }),
    z.object({
      plot: z.literal("region"),
      inequalities: z.array(z.string().min(1)).min(1),
      shadeInside: z.boolean(),
    }),
    z
      .object({
        plot: z.literal("box"),
        min: z.number(),
        q1: z.number(),
        median: z.number(),
        q3: z.number(),
        max: z.number(),
        tolerance: Tolerance,
      })
      .refine((b) => b.min <= b.q1 && b.q1 <= b.median && b.median <= b.q3 && b.q3 <= b.max, {
        message: "box plot needs min <= q1 <= median <= q3 <= max",
        path: ["median"],
      }),
    z.object({
      plot: z.literal("transformation"),
      object: z.array(Point).min(1),
      image: z.array(Point).min(1),
    }),
    z.object({
      plot: z.literal("best-fit"),
      throughMeans: Point.optional(),
      kind: z.enum(["line", "curve"]),
      tolerance: Tolerance,
    }),
  ]),
  "GraphExpectation",
);
export type GraphExpectation = z.infer<typeof GraphExpectation>;

const NumericForm = z.enum(["decimal", "fraction", "mixed", "surd", "pi", "percent", "standardForm", "ratio"]);

/** Written form the marker demands once an algebraic answer is equivalent (mirrors the engine's AlgebraForm). */
export const AlgebraForm = named(
  z.enum([
    "factorised",
    "expanded",
    "simplest-fraction",
    "completed-square",
    "y=mx+c",
    "surd-rationalised",
    "single-fraction",
    "integer-coefficients",
    "subject",
    "single-log",
    "expanded-logs",
    "single-log-expanded",
  ]),
  "AlgebraForm",
  'Required written form of an algebraic answer; "subject" = the spec\'s subject alone on one side and absent from the other',
);
export type AlgebraForm = z.infer<typeof AlgebraForm>;

const Band = z
  .object({
    band: z.string().min(1),
    marks: z.tuple([z.int().nonnegative(), z.int().nonnegative()]),
    descriptor: z.string().min(1),
  })
  .refine((b) => b.marks[0] <= b.marks[1], {
    message: "band marks must be [low, high] with low <= high",
    path: ["marks"],
  });

export const AnswerSpec = named(
  z.discriminatedUnion("kind", [
    z
      .object({
        kind: z.literal("numeric"),
        value: z.number(),
        tolerance: Tolerance,
        unit: z.string().min(1).optional(),
        unitRequired: z.boolean(),
        acceptForms: z.array(NumericForm),
        mustBeSimplified: z.boolean().optional(),
        moneyFormat: z.boolean().optional(),
        /**
         * The form is the task (MK-01 ruling, 25 Sep 2026): true where the question asks for this form ("simplify
         * fully", "factorise", "write in the form …"), false where the value is what is asked. Unset, the stem's
         * instruction decides (mark.ts isFormTask). On a form task the right value in another form earns nothing.
         */
        formTask: z.boolean().optional(),
      })
      .refine((a) => !a.unitRequired || a.unit !== undefined, {
        message: "unitRequired needs a unit",
        path: ["unit"],
      }),
    z.object({
      kind: z.literal("algebraic"),
      latex: z.string().min(1),
      equivalence: z.enum(["identical", "equivalent", "simplifiedOnly"]),
      variables: z.array(z.string().min(1)),
      domain: z.string().optional(),
      /**
       * Form demanded after equivalence. "subject": the spec's left-hand side (x in "x=\frac{w}{4}") must be alone
       * on one side and absent from the other, so "4x = w" or a bare "w/4" are the right relationship in the wrong
       * form. Takes precedence over mustBeFactorised / mustBeExpanded.
       */
      form: AlgebraForm.optional(),
      /** Coordinate-pair specs only: absolute tolerance per coordinate, so "(0.83, -3.08)" can earn (5/6, -37/12). */
      tolerance: z.number().positive().optional(),
      mustBeFactorised: z.boolean().optional(),
      mustBeExpanded: z.boolean().optional(),
      keepInequalitySign: z.boolean().optional(),
      /**
       * The form is the task (MK-01 ruling, 25 Sep 2026): true where the question asks for this form ("simplify
       * fully", "factorise", "write in the form …"), false where the value is what is asked. Unset, the stem's
       * instruction decides (mark.ts isFormTask). On a form task the right value in another form earns nothing.
       */
      formTask: z.boolean().optional(),
    }),
    z
      .object({
        kind: z.literal("mcq"),
        options: z.array(McqOption).min(2),
        shuffle: z.boolean(),
        multi: z.boolean().optional(),
      })
      .superRefine((a, ctx) => checkOptions(a.options, ctx, { multi: a.multi === true })),
    z.object({
      kind: z.literal("text"),
      accepted: z.array(z.string().min(1)),
      keyWords: z.array(
        z.object({
          any: z.array(z.string().min(1)).min(1),
          marks: z.int().positive(),
          reject: z.array(z.string().min(1)).optional(),
        }),
      ),
      listingRule: z.boolean(),
    }),
    z.object({
      kind: z.literal("text-long"),
      rubricId: z.string().min(1),
      bands: z.array(Band).min(1),
      indicativeContent: z.array(z.object({ point: z.string().min(1), keyWords: z.array(z.string().min(1)) })),
      selfMark: z.literal(true),
      aiMark: z.boolean().optional(),
      minWords: z.int().positive().optional(),
    }),
    z.object({ kind: z.literal("graph"), expect: GraphExpectation }),
    z.object({
      kind: z.literal("drawing"),
      rubric: z.array(z.string().min(1)).min(1),
      selfMark: z.literal(true),
      aiMark: z.boolean().optional(),
    }),
    z.object({
      kind: z.literal("table"),
      cells: z
        .array(
          z.object({
            row: z.int().nonnegative(),
            col: z.int().nonnegative(),
            value: z.union([z.number(), z.string()]),
            tolerance: Tolerance.optional(),
          }),
        )
        .min(1),
    }),
    /**
     * A whole matrix (Further Maths Unit 1: 2×2 sums, differences, scalar multiples, products, the
     * identity and inverses). `entries` is `rows` rows of `cols` entries, each a number or a short
     * algebraic expression written as LaTeX or plain text ("5", "-3", "1/2", "2a", "\\frac{1}{2}").
     * Entries are marked in place, so a transposed answer is not the answer; a matrix answer never
     * carries a unit.
     */
    z.object({
      kind: z.literal("matrix"),
      rows: z.int().positive(),
      cols: z.int().positive(),
      entries: z.array(z.array(z.string().min(1)).min(1)).min(1),
      /** Absolute tolerance per entry; without one every entry must be the value as written. */
      tolerance: z.object({ type: z.literal("absolute"), value: z.number().nonnegative() }).optional(),
    }),
    z.object({
      kind: z.literal("equation"),
      kindOf: z.enum(["word", "symbol", "ionic", "half", "nuclear", "physics"]),
      balancedLatex: z.string().min(1),
      stateSymbolsRequired: z.boolean(),
      acceptMultiples: z.boolean(),
      registryId: z.string().min(1).optional(),
    }),
    z.object({
      kind: z.literal("steps"),
      expectedOrder: z.array(z.string().min(1)).min(1),
      allowSkips: z.literal(false),
    }),
    z.object({
      kind: z.literal("label"),
      targets: z
        .array(
          z.object({
            id: z.string().min(1),
            accepted: z.array(z.string().min(1)).min(1),
            position: Point.optional(),
            direction: z.enum(["up", "down", "left", "right", "normal", "along"]).optional(),
          }),
        )
        .min(1),
      bank: z.array(z.string().min(1)),
    }),
    z
      .object({
        kind: z.literal("order"),
        items: z.array(z.string().min(1)).min(2),
        correctOrder: z.array(z.int().nonnegative()),
      })
      .refine(
        (a) =>
          a.correctOrder.length === a.items.length &&
          new Set(a.correctOrder).size === a.items.length &&
          a.correctOrder.every((i) => i < a.items.length),
        { message: "correctOrder must be a permutation of the item indices", path: ["correctOrder"] },
      ),
    z
      .object({
        kind: z.literal("annotation"),
        spans: z.array(z.object({ from: z.int().nonnegative(), to: z.int().nonnegative(), tag: z.string().min(1) })),
        tags: z.array(z.string().min(1)).min(1),
        minCorrect: z.int().nonnegative(),
      })
      .refine((a) => a.spans.every((s) => a.tags.includes(s.tag)), {
        message: "every span tag must be listed in tags",
        path: ["spans"],
      }),
  ]),
  "AnswerSpec",
  "What the marker compares the learner's response against; discriminated on kind",
);
export type AnswerSpec = z.infer<typeof AnswerSpec>;

// ---------------------------------------------------------------------------
// Mark points, common errors, parts, questions
// ---------------------------------------------------------------------------

export const MarkPoint = named(
  z.object({
    id: z.string().regex(/^[A-Za-z0-9][A-Za-z0-9._-]*$/),
    code: z
      .string()
      .regex(/^[A-Z]{1,3}$/, { error: "mark code is the subject's letter code: M, A, MA, W, MW, B, P, QWC, L" }),
    marks: z.int().positive(),
    for: z.string().min(1),
    accept: z.array(z.string().min(1)).optional(),
    reject: z.array(z.string().min(1)).optional(),
    ignore: z.array(z.string().min(1)).optional(),
    ft: z.boolean().optional(),
    dependsOn: z.array(z.string().min(1)).optional(),
    seenIf: z.string().min(1).optional(),
    examinerNote: z.string().min(1).optional(),
  }),
  "MarkPoint",
  "One line of the mark scheme in the subject's mark language",
);
export type MarkPoint = z.infer<typeof MarkPoint>;

function compiles(pattern: string): boolean {
  try {
    new RegExp(pattern);
    return true;
  } catch {
    return false;
  }
}

export const CommonError = named(
  z.object({
    misconception: MisconceptionId,
    pattern: z.discriminatedUnion("kind", [
      z.object({ kind: z.literal("numeric"), value: z.number(), tolerance: Tolerance.optional() }),
      z.object({ kind: z.literal("algebraic"), latex: z.string().min(1) }),
      /** A whole wrong matrix, shaped like the answer's `entries`; it fires when every entry agrees. */
      z.object({ kind: z.literal("matrix"), entries: z.array(z.array(z.string().min(1)).min(1)).min(1) }),
      z.object({ kind: z.literal("text"), regex: z.string().min(1).refine(compiles, { message: "regex must compile" }) }),
      z.object({ kind: z.literal("graph"), test: z.string().min(1) }),
    ]),
    feedback: z.string().min(1),
    marksTypicallyEarned: z.int().nonnegative(),
    source: ExaminerSource.optional(),
    /**
     * The response is right: the scheme or the examiners accept it, and the feedback is a note, not a correction ("the
     * examiners accepted a false origin on the diagram"; "m/s is the unit of speed, which (b) asks about"). It is marked
     * right with every mark. Only such an error may set marksTypicallyEarned to the part's tariff (content-lint).
     */
    accepted: z.boolean().optional(),
  }),
  "CommonError",
);
export type CommonError = z.infer<typeof CommonError>;

/** "a", "b(i)", or "main" for a single-part question */
export const PART_ID_PATTERN = /^(main|[a-z]{1,2}(\([ivx]{1,4}\))?)$/;

export const Part = named(
  z
    .object({
      id: z.string().regex(PART_ID_PATTERN, { error: 'part id must be like "a", "b(i)" or "main"' }),
      stem: z.string().min(1),
      marks: z.int().positive(),
      answer: AnswerSpec,
      scheme: z.array(MarkPoint),
      hints: z.array(z.string().min(1)),
      workedSolution: z.string().min(1),
      commonErrors: z.array(CommonError),
      requiresWorking: z.boolean(),
      followThrough: z
        .object({
          fromPart: z.string().min(1),
          rule: z.enum(["use-candidate-value", "use-candidate-diagram"]),
          /**
           * How her earlier value carries into this part, as an expression in x ("x - 5", "x * 4.0"). Optional: without
           * it the engine reads the worked solution's chain, or a choice's next option above (mark.ts followThroughValue).
           */
          relation: z.string().min(1).optional(),
        })
        .optional(),
    })
    .superRefine((part, ctx) => {
      const ids = new Set(part.scheme.map((m) => m.id));
      for (const id of duplicates(part.scheme.map((m) => m.id))) {
        ctx.addIssue({ code: "custom", message: `duplicate mark point id "${id}" in part ${part.id}`, path: ["scheme"] });
      }
      part.scheme.forEach((m, i) => {
        (m.dependsOn ?? []).forEach((dep, j) => {
          if (dep === m.id) {
            ctx.addIssue({
              code: "custom",
              message: `mark point "${m.id}" cannot depend on itself`,
              path: ["scheme", i, "dependsOn", j],
            });
          } else if (!ids.has(dep)) {
            ctx.addIssue({
              code: "custom",
              message: `dependsOn "${dep}" is not a mark point in part ${part.id}`,
              path: ["scheme", i, "dependsOn", j],
            });
          }
        });
      });
      if (part.scheme.length > 0) {
        const total = sum(part.scheme.map((m) => m.marks));
        if (total !== part.marks) {
          ctx.addIssue({
            code: "custom",
            message: `scheme for part ${part.id} totals ${total} marks but the part is worth ${part.marks}`,
            path: ["marks"],
          });
        }
      }
    }),
  "Part",
);
export type Part = z.infer<typeof Part>;

/** "(a)draw3|(b)estimate2|(c)estimate3" — one "(<part>)<verb><marks>" segment per part. */
const SKELETON_SEGMENT = /^\((main|[a-z]{1,2}(?:\([ivx]{1,4}\))?)\)([a-z][a-z-]*)(\d{1,2})$/;

export function parseSkeleton(skeleton: string): Array<{ part: string; verb: string; marks: number }> | null {
  const out: Array<{ part: string; verb: string; marks: number }> = [];
  for (const segment of skeleton.split("|")) {
    const m = SKELETON_SEGMENT.exec(segment);
    if (!m) return null;
    out.push({ part: m[1]!, verb: m[2]!, marks: Number(m[3]) });
  }
  return out;
}

export const Question = named(
  z
    .object({
      id: QuestionId,
      topic: TopicId,
      specRefs: z.array(SpecRef).min(1),
      paper: PaperContext,
      tier: Tier,
      style: z.enum(["practice", "exam-style"]),
      difficulty: Difficulty,
      ao: z.array(z.string().regex(/^AO[1-9]$/)),
      commandWords: z.array(z.string().min(1)),
      emphasis: z.array(z.string().min(1)),
      context: z.object({ setting: z.string().min(1), original: z.literal(true) }),
      figures: z.array(FigureSpec),
      parts: z.array(Part).min(1),
      totalMarks: z.int().positive(),
      timeAllowanceSec: z.int().positive(),
      skeleton: z.string().min(1),
      methodLock: z
        .object({ instruction: z.string().min(1), requiredMethod: z.string().min(1), evidence: ExaminerSource })
        .optional(),
      examinerSources: z.array(ExaminerSource),
      solutionProgram: z.string().min(1).optional(),
      verification: VerificationRef,
      version: z.int().positive(),
    })
    .superRefine((q, ctx) => {
      const partIds = q.parts.map((p) => p.id);
      for (const id of duplicates(partIds)) {
        ctx.addIssue({ code: "custom", message: `duplicate part id "${id}"`, path: ["parts"] });
      }
      const total = sum(q.parts.map((p) => p.marks));
      if (total !== q.totalMarks) {
        ctx.addIssue({
          code: "custom",
          message: `totalMarks is ${q.totalMarks} but the parts sum to ${total}`,
          path: ["totalMarks"],
        });
      }
      q.parts.forEach((p, i) => {
        if (p.followThrough && (p.followThrough.fromPart === p.id || !partIds.includes(p.followThrough.fromPart))) {
          ctx.addIssue({
            code: "custom",
            message: `followThrough.fromPart "${p.followThrough.fromPart}" must name another part of this question`,
            path: ["parts", i, "followThrough", "fromPart"],
          });
        }
      });
      const skeleton = parseSkeleton(q.skeleton);
      if (!skeleton) {
        ctx.addIssue({
          code: "custom",
          message: 'skeleton must be "(<part>)<verb><marks>" segments joined by "|", e.g. "(a)draw3|(b)estimate2"',
          path: ["skeleton"],
        });
      } else if (
        skeleton.length !== q.parts.length ||
        skeleton.some((s, i) => s.part !== q.parts[i]!.id || s.marks !== q.parts[i]!.marks)
      ) {
        ctx.addIssue({
          code: "custom",
          message: `skeleton "${q.skeleton}" does not match the parts (${q.parts.map((p) => `(${p.id})${p.marks}`).join("|")})`,
          path: ["skeleton"],
        });
      }
    }),
  "Question",
  "Original exam-style or practice question with a CCEA-language mark scheme",
);
export type Question = z.infer<typeof Question>;

// ---------------------------------------------------------------------------
// Worked examples
// ---------------------------------------------------------------------------

const WhyMenu = z
  .object({ options: z.array(z.string().min(1)).min(2), correct: z.int().nonnegative(), explain: z.string().min(1) })
  .refine((m) => m.correct < m.options.length, { message: "correct must index an option", path: ["correct"] });

const MarkCodeWithOrdinal = z.string().regex(/^[A-Z]{1,3}\d?$/, { error: 'a mark code such as "M1", "A1" or "MA1"' });

export const WorkedExampleStep = named(
  z.object({
    n: z.int().positive(),
    working: z.string().min(1),
    decision: z.string().min(1),
    whyMenu: WhyMenu.optional(),
    earns: z.array(MarkCodeWithOrdinal).optional(),
    input: AnswerSpec.optional(),
  }),
  "WorkedExampleStep",
);
export type WorkedExampleStep = z.infer<typeof WorkedExampleStep>;

export const WorkedExample = named(
  z
    .object({
      id: WorkedExampleId,
      topic: TopicId,
      specRefs: z.array(SpecRef).min(1),
      paper: PaperContext,
      stem: z.string().min(1),
      figure: FigureSpec.optional(),
      /** A copy of the figure with nothing that a hidden step asks for, for the faded and problem modes (25 Sep 2026). */
      figurePlain: FigureSpec.optional(),
      steps: z.array(WorkedExampleStep).min(1),
      finalAnswer: z.string().min(1),
      twin: z.object({ stem: z.string().min(1), answer: AnswerSpec, figure: FigureSpec.optional() }),
      faded: z.array(
        z.object({ showSteps: z.int().nonnegative(), studentSupplies: z.array(z.int().positive()).min(1) }),
      ),
      clip: z
        .object({
          kind: z.enum(["manim", "motion-canvas", "youtube"]),
          src: z.string().min(1),
          captions: z.string().min(1).optional(),
          seconds: z.number().positive(),
        })
        .optional(),
      verification: VerificationRef,
      version: z.int().positive(),
    })
    .superRefine((we, ctx) => {
      we.steps.forEach((s, i) => {
        if (s.n !== i + 1) {
          ctx.addIssue({
            code: "custom",
            message: `steps must be numbered 1..${we.steps.length} in order`,
            path: ["steps", i, "n"],
          });
        }
      });
      const last = we.steps.length;
      we.faded.forEach((f, i) => {
        if (f.showSteps >= last) {
          ctx.addIssue({
            code: "custom",
            message: `showSteps must be less than the number of steps (${last})`,
            path: ["faded", i, "showSteps"],
          });
        }
        f.studentSupplies.forEach((n, j) => {
          if (n <= f.showSteps || n > last) {
            ctx.addIssue({
              code: "custom",
              message: `studentSupplies must name steps after the ${f.showSteps} shown (${f.showSteps + 1}..${last})`,
              path: ["faded", i, "studentSupplies", j],
            });
          }
        });
      });
    }),
  "WorkedExample",
  "Step list with narrated decisions and the mark each step earns, plus a twin and faded versions",
);
export type WorkedExample = z.infer<typeof WorkedExample>;

// ---------------------------------------------------------------------------
// Diagnostics, prompts, find-the-mistake, misconceptions, insight
// ---------------------------------------------------------------------------

export const DiagnosticItem = named(
  z
    .object({
      id: z.string().min(1),
      stem: z.string().min(1),
      skill: z.string().min(1),
      figure: FigureSpec.optional(),
      options: z.array(McqOption).min(2),
      secondsExpected: z.int().min(5).max(90),
      confidence: z.literal(true),
      hypercorrectionQueue: z.literal(true),
    })
    .superRefine((item, ctx) => checkOptions(item.options, ctx)),
  "DiagnosticItem",
  "Single-skill multiple-choice item; every distractor names a misconception",
);
export type DiagnosticItem = z.infer<typeof DiagnosticItem>;

export const DiagnosticSet = named(
  z
    .object({
      id: DiagnosticSetId,
      topic: TopicId,
      specRefs: z.array(SpecRef).min(1),
      when: z.enum(["pre", "post", "both"]),
      items: z.array(DiagnosticItem).min(1),
    })
    .superRefine((set, ctx) => {
      for (const id of duplicates(set.items.map((i) => i.id))) {
        ctx.addIssue({ code: "custom", message: `duplicate diagnostic item id "${id}"`, path: ["items"] });
      }
    }),
  "DiagnosticSet",
);
export type DiagnosticSet = z.infer<typeof DiagnosticSet>;

export const RetrievalPrompt = named(
  z.object({
    id: RetrievalPromptId,
    topic: TopicId,
    specRefs: z.array(SpecRef).min(1),
    kind: z.enum([
      "qa",
      "cloze",
      "formula",
      "definition",
      "procedure",
      "trap",
      "label-diagram",
      "novel-example",
      "quotation",
    ]),
    prompt: z.string().min(1),
    answer: z.string().min(1),
    keyWords: z.array(z.string().min(1)).optional(),
    image: FigureSpec.optional(),
    examUnit: UnitCode.optional(),
    difficultyPrior: z.number().min(0).max(10).optional(),
  }),
  "RetrievalPrompt",
  "Atomic retrieval prompt scheduled by FSRS towards the unit's paper date",
);
export type RetrievalPrompt = z.infer<typeof RetrievalPrompt>;

export const FindTheMistake = named(
  z
    .object({
      id: FindTheMistakeId,
      topic: TopicId,
      specRefs: z.array(SpecRef).min(1),
      stem: z.string().min(1),
      studentWorking: z.array(z.string().min(1)).min(1),
      mistakeLine: z.int().positive(),
      misconception: MisconceptionId,
      whatWentWrong: z.string().min(1),
      correction: z.array(z.string().min(1)).min(1),
      marksEarnedAsWritten: z.array(MarkCodeWithOrdinal),
      feedback: z.string().min(1),
      source: ExaminerSource,
    })
    .refine((f) => f.mistakeLine <= f.studentWorking.length, {
      message: "mistakeLine must be one of the studentWorking lines (1-based)",
      path: ["mistakeLine"],
    }),
  "FindTheMistake",
  "Plausible wrong working seeded from an examiner report: locate, name, fix",
);
export type FindTheMistake = z.infer<typeof FindTheMistake>;

export const Misconception = named(
  z.object({
    id: MisconceptionId,
    label: z.string().min(1),
    subject: SubjectId,
    statements: z.array(SpecRef),
    sources: z.array(ExaminerSource),
    firstSeen: SeriesId,
    lastSeen: SeriesId,
    ledgerTag: z.enum(["method", "accuracy", "misread", "presentation", "not-attempted", "concept"]),
  }),
  "Misconception",
  "Registry entry that names a recurring error; the vocabulary for distractor tags and ledger tags",
);
export type Misconception = z.infer<typeof Misconception>;

export const ExaminerInsight = named(
  z.object({
    id: ExaminerInsightId,
    topic: TopicId,
    specRefs: z.array(SpecRef).min(1),
    findings: z
      .array(
        z.object({
          source: ExaminerSource,
          url: z.url(),
          asked: z.string().min(1),
          wentWrong: z.string().min(1),
          fullMarkAnswersDid: z.string().min(1).optional(),
          rule: z.string().min(1),
          misconceptions: z.array(MisconceptionId),
        }),
      )
      .min(1),
    ruleToRemember: z.string().min(1),
    aStarSignal: z.string().min(1).optional(),
  }),
  "ExaminerInsight",
  "Chief Examiner report findings for one topic, in our words, cited to series/unit/question",
);
export type ExaminerInsight = z.infer<typeof ExaminerInsight>;

// ---------------------------------------------------------------------------
// Science-specific
// ---------------------------------------------------------------------------

export const PracticalCode = z.string().regex(/^[BCP][1-6]$/, { error: "practical code is B1–B6, C1–C6 or P1–P6" });

export const Practical = named(
  z
    .object({
      id: PracticalId,
      code: PracticalCode,
      specRef: z.templateLiteral(["DA-PRAC-", z.string().regex(/[BCP][1-6]/)], {
        error: 'specRef must be "DA-PRAC-<code>"',
      }),
      attachedLOs: z.array(SpecRef),
      title: z.string().min(1),
      method: z.array(z.string().min(1)).min(1),
      apparatus: z.array(z.string().min(1)).min(1),
      apparatusDiagram: FigureSpec,
      variables: z.object({
        independent: z.string().min(1),
        dependent: z.string().min(1),
        control: z.array(z.string().min(1)),
      }),
      hypothesis: z.string().min(1),
      risks: z.array(z.object({ hazard: z.string().min(1), control: z.string().min(1) })),
      resultsTable: z.object({
        columns: z.array(z.object({ heading: z.string().min(1), unit: z.string() })).min(1),
        repeats: z.int().nonnegative(),
      }),
      graph: z
        .object({
          x: z.string().min(1),
          y: z.string().min(1),
          expected: z.enum(["straight-through-origin", "straight", "curve"]),
          note: z.string().min(1),
        })
        .optional(),
      calculations: z.array(z.string().min(1)),
      vocabulary: z.array(
        z.object({ term: z.string().min(1), ourDefinition: z.string().min(1), keyWords: z.array(z.string().min(1)) }),
      ),
      bookletBItems: z.array(QuestionId),
      bookletAChecklist: z.array(z.string().min(1)),
      examinerSources: z.array(ExaminerSource),
      externalRefs: z.array(ExternalRef),
    })
    .refine((p) => p.specRef === `DA-PRAC-${p.code}`, {
      message: "specRef must be DA-PRAC-<code> for this practical's code",
      path: ["specRef"],
    }),
  "Practical",
  "Prescribed-practical trainer: method, apparatus, variables, results table, graph, vocabulary, Booklet B items",
);
export type Practical = z.infer<typeof Practical>;

export const PhysicsEquation = named(
  z.object({
    id: PhysicsEquationId,
    specRefs: z.array(SpecRef).min(1),
    latex: z.string().min(1),
    words: z.string().min(1),
    symbols: z.array(z.object({ sym: z.string().min(1), quantity: z.string().min(1), unit: z.string() })).min(1),
    rearrangements: z.array(z.string().min(1)),
    conversions: z.array(
      z.object({
        from: z.string().min(1),
        to: z.string().min(1),
        factor: z.number().positive(),
        examinerNote: z.string().min(1).optional(),
      }),
    ),
    givenInExam: z.literal(false),
    constants: z
      .array(z.object({ sym: z.string().min(1), value: z.number(), unit: z.string(), note: z.string() }))
      .optional(),
    drills: z.array(z.enum(["recall", "units", "rearrange", "substitute-convert"])),
  }),
  "PhysicsEquation",
  "Equation Vault entry: physics equations are never given in the exam",
);
export type PhysicsEquation = z.infer<typeof PhysicsEquation>;

export const QwcItem = named(
  z.object({
    id: QwcItemId,
    specRefs: z.array(SpecRef).min(1),
    unit: UnitCode,
    tier: Tier,
    stem: z.string().min(1),
    indicativeContent: z
      .array(
        z.object({
          point: z.string().min(1),
          keyWords: z.array(z.string().min(1)),
          commonLoss: z.string().min(1).optional(),
        }),
      )
      .min(1),
    bands: z
      .array(
        z
          .object({
            band: z.enum(["A", "B", "C", "0"]),
            marks: z.tuple([z.int().min(0).max(6), z.int().min(0).max(6)]),
            descriptor: z.string().min(1),
          })
          .refine((b) => b.marks[0] <= b.marks[1], {
            message: "band marks must be [low, high] with low <= high",
            path: ["marks"],
          }),
      )
      .min(1),
    modelAnswerBandA: z.string().min(1),
    upgradeMeBandB: z.string().min(1),
    selfMarkRubric: z.array(z.string().min(1)).min(1),
    examinerSources: z.array(ExaminerSource),
  }),
  "QwcItem",
  "Six-mark quality-of-written-communication builder: indicative content, three bands, model → upgrade-me → blank",
);
export type QwcItem = z.infer<typeof QwcItem>;

// ---------------------------------------------------------------------------
// Mined layer (metadata only — never question text)
// ---------------------------------------------------------------------------

export const MinedQuestion = named(
  z.object({
    paperId: z.string().min(1),
    session: z.string().min(1),
    unit: UnitCode,
    paper: z.literal([1, 2]).optional(),
    tier: Tier,
    question: z.string().min(1),
    part: z.string().min(1).optional(),
    page: z.int().positive(),
    marks: z.int().nonnegative(),
    commandWords: z.array(z.string().min(1)),
    emphasis: z.array(z.string().min(1)),
    hasFigure: z.boolean(),
    contextClass: z.string().min(1),
    skeleton: z.string().min(1),
    markCodes: z.array(z.string().regex(/^[A-Z]{1,3}\d{0,2}$/)),
    ft: z.boolean(),
    topics: z.array(TopicId),
    topicsConfirmedBy: z.literal("human").optional(),
    textHash: z
      .string()
      .regex(/^[a-f0-9]{64}$/, { error: "textHash is the lowercase hex SHA-256 of the normalised text" }),
  }),
  "MinedQuestion",
  "Metadata for one past-paper question (no text): number, page, marks, command words, mark-code sequence, topics",
);
export type MinedQuestion = z.infer<typeof MinedQuestion>;

const Tariff = z
  .object({ min: z.number(), p10: z.number(), median: z.number(), p90: z.number(), max: z.number() })
  .refine((t) => t.min <= t.p10 && t.p10 <= t.median && t.median <= t.p90 && t.p90 <= t.max, {
    message: "tariff must be ordered min <= p10 <= median <= p90 <= max",
    path: ["median"],
  });

const Counts = z.record(z.string(), z.int().nonnegative());

export const MinedStats = named(
  z.object({
    subject: SubjectId,
    generatedFrom: z.array(z.string().min(1)),
    byTopic: z.record(
      TopicId,
      z.object({
        appearances: z.array(
          z.object({
            session: z.string().min(1),
            unit: UnitCode,
            question: z.string().min(1),
            marks: z.int().nonnegative(),
          }),
        ),
        tariff: Tariff,
        commandWords: Counts,
        markCodePatterns: Counts,
        latePaperShare: z.number().min(0).max(1),
      }),
    ),
    byUnit: z.record(
      z.string(),
      z.object({
        commandWords: Counts,
        tariffHistogram: Counts,
        questionsPerPaper: z.array(z.int().nonnegative()),
      }),
    ),
  }),
  "MinedStats",
  "Per-topic and per-unit statistics mined from the private corpus",
);
export type MinedStats = z.infer<typeof MinedStats>;

// ---------------------------------------------------------------------------
// Data pack and verification
// ---------------------------------------------------------------------------

const ClockTime = z.string().regex(/^\d{2}:\d{2}$/, { error: 'time must be "HH:MM"' });

export const DataPack = named(
  z.object({
    umsUnitBoundaries: z.record(z.string(), z.record(z.string(), z.number())),
    rawBoundaries: z.array(
      z.object({
        unit: UnitCode,
        series: z.string().min(1),
        grades: z.record(z.string(), z.number()),
        source: z.string().min(1),
      }),
    ),
    subjectBoundaries: z.array(
      z.object({
        qual: z.string().min(1),
        series: z.string().min(1),
        aStar: z.union([z.number(), z.string()]),
        grades: z.record(z.string(), z.number()),
      }),
    ),
    timetable: z.array(
      z.object({
        series: z.string().min(1),
        unit: UnitCode,
        paper: z.string().min(1).optional(),
        date: z.iso.date(),
        start: ClockTime,
        end: ClockTime,
        source: z.string().min(1),
        version: z.string().min(1),
      }),
    ),
    rules: z.array(
      z.object({
        id: z.string().min(1),
        text: z.string().min(1),
        appliesFrom: z.string().min(1).optional(),
        source: z.string().min(1),
      }),
    ),
    asOf: IsoDateLike,
  }),
  "DataPack",
  "Grade boundaries, UMS scales, timetable rows and rules for one subject",
);
export type DataPack = z.infer<typeof DataPack>;

export const VerificationCheckType = named(
  z.enum([
    "schema",
    "scope-tier",
    "formula-sheet",
    "command-words",
    "tariff",
    "maths-numeric",
    "maths-symbolic",
    "independent-solve",
    "units-dimensions",
    "chem-balance",
    "examiner-alignment",
    "copy-shingle",
    "isomorph",
    "style-lint",
    "katex-compile",
    "link-health",
    "human-spot",
  ]),
  "VerificationCheckType",
);
export type VerificationCheckType = z.infer<typeof VerificationCheckType>;

export const VerificationStatus = named(
  z.enum(["draft", "checked", "verified", "published", "withdrawn"]),
  "VerificationStatus",
);
export type VerificationStatus = z.infer<typeof VerificationStatus>;

/**
 * The withdraw-and-replace record (25 Sep 2026; pipeline/prompts/author-topic.md, "Withdraw and replace: one record";
 * checked by scripts/qa/withdrawn.mjs). Any log may carry
 *   withdrawn: [{ id, kind, replacedBy, reason, on }]
 * id: a gate id ("g3"), a bundle item id, or a diagnostic item as "<set id>#<item id>"; kind: "gate" | "diagnostic" |
 * "prompt" | "question" | "workedExample" | "findTheMistake"; replacedBy: the replacing id of the same kind, or null;
 * reason: a sentence; on: an ISO date-time. The note's own log lists withdrawn gates; a bundle item's own log lists the
 * item and has status "withdrawn"; a diagnostic set's log lists its withdrawn items. (Declared on the object
 * below as `withdrawn`, so the published copy carries the records.)
 */
export const VerificationLog = named(
  z.object({
    id: VerificationRef,
    itemId: z.string().min(1),
    version: z.int().positive(),
    checks: z.array(
      z.object({
        type: VerificationCheckType,
        tool: z.string().min(1),
        result: z.enum(["pass", "fail", "waived"]),
        detail: z.string().optional(),
        at: IsoDateLike,
        by: z.enum(["pipeline", "claude", "developer", "teacher"]),
      }),
    ),
    status: VerificationStatus,
    /** Withdraw-and-replace records (25 Sep 2026 ruling): one shape the app can read, never guess. */
    withdrawn: z
      .array(
        z.object({
          id: z.string().min(1),
          kind: z.enum(["gate", "diagnostic", "prompt", "question", "workedExample", "findTheMistake"]),
          replacedBy: z.string().min(1).nullable(),
          reason: z.string().min(1),
          on: IsoDateLike,
        }),
      )
      .optional(),
    reports: z.array(
      z.object({
        at: IsoDateLike,
        by: z.enum(["learner", "developer"]),
        text: z.string().min(1),
        resolvedAt: IsoDateLike.optional(),
        resolution: z.string().min(1).optional(),
      }),
    ),
  }),
  "VerificationLog",
  'The "Checked" panel: every gate result for one item version, plus learner reports and their resolution',
);
export type VerificationLog = z.infer<typeof VerificationLog>;

// ---------------------------------------------------------------------------
// The subject as data
// ---------------------------------------------------------------------------

export const MarkLanguageProfile = named(
  z
    .object({
      codes: z
        .array(
          z.object({
            code: z.string().regex(/^[A-Z]{1,3}$/),
            meaning: z.string().min(1),
            dependsOnMethod: z.boolean().optional(),
          }),
        )
        .min(1),
      followThrough: z.boolean(),
      positiveMarking: z.boolean(),
      rules: z.array(z.object({ id: z.string().min(1), text: z.string().min(1), source: z.string().min(1) })),
      feedbackTemplates: z.record(z.string(), z.string()),
    })
    .superRefine((p, ctx) => {
      for (const code of duplicates(p.codes.map((c) => c.code))) {
        ctx.addIssue({ code: "custom", message: `duplicate mark code "${code}"`, path: ["codes"] });
      }
    }),
  "MarkLanguageProfile",
  "The subject's mark codes (M/A/MA, M/W/MW, P/QWC, L), follow-through and positive-marking flags, marking rules in our words",
);
export type MarkLanguageProfile = z.infer<typeof MarkLanguageProfile>;

export const SubjectPack = named(
  z
    .object({
      $schema: SchemaPointer,
      id: SubjectId,
      title: z.string().min(1),
      cceaQualificationId: z.string().min(1),
      subjectCode: z.string().min(1),
      gradeScale: z.array(z.string().min(1)).min(1),
      units: z
        .array(
          z.object({
            code: UnitCode,
            title: z.string().min(1),
            tier: Tier,
            weighting: z.number().min(0).max(100),
            umsMax: z.number().positive(),
            umsScale: z.number().positive(),
            papers: z
              .array(
                z.object({
                  name: z.string().min(1),
                  minutes: z.int().positive(),
                  marks: z.int().positive(),
                  calculator: z.boolean().nullable(),
                  resources: z.array(z.string().min(1)),
                }),
              )
              .min(1),
            prerequisiteUnits: z.array(UnitCode),
            series: z.array(z.enum(["November", "March", "Summer"])).min(1),
          }),
        )
        .min(1),
      strands: z.array(z.object({ id: z.string().min(1), title: z.string().min(1) })).min(1),
      markLanguage: MarkLanguageProfile,
      itemTypes: z.array(ItemTypeId).min(1),
      answerKinds: z.array(AnswerKind).min(1),
      commandWordsFile: z.string().min(1),
      tariffsFile: z.string().min(1),
      formulaSheetsFile: z.string().min(1).optional(),
      methodLocksFile: z.string().min(1).optional(),
      qwcBandsFile: z.string().min(1).optional(),
      rubricsFile: z.string().min(1).optional(),
      externalProviders: z.array(
        z.object({ kind: z.string().min(1), label: z.string().min(1), licenceNote: z.string().min(1) }),
      ),
    })
    .superRefine((pack, ctx) => {
      const codes = pack.units.map((u) => u.code);
      for (const code of duplicates(codes)) {
        ctx.addIssue({ code: "custom", message: `duplicate unit code "${code}"`, path: ["units"] });
      }
      pack.units.forEach((u, i) => {
        u.prerequisiteUnits.forEach((p, j) => {
          if (!codes.includes(p)) {
            ctx.addIssue({
              code: "custom",
              message: `prerequisite unit "${p}" is not a unit of this pack`,
              path: ["units", i, "prerequisiteUnits", j],
            });
          }
        });
      });
    }),
  "SubjectPack",
  "packs/<subject>/pack.json — the qualification as data: units, papers, tiers, UMS, strands, mark language, item types",
);
export type SubjectPack = z.infer<typeof SubjectPack>;

// ---------------------------------------------------------------------------
// Statements and topics
// ---------------------------------------------------------------------------

export const Statement = named(
  z.object({
    id: SpecRef,
    unit: UnitCode,
    strand: z.string().min(1),
    text: z.string().min(1),
    tier: Tier,
    specPage: z.int().positive().optional(),
    teacherGuidance: z.string().optional(),
    exclusions: z.array(z.string().min(1)).optional(),
    progressionOf: SpecRef.nullable().optional(),
    mixed: z.boolean().optional(),
    textMarked: z.string().optional(),
    topics: z.array(TopicId),
  }),
  "Statement",
  "One learning-outcome statement, verbatim, with tier and teacher-guidance elaboration",
);
export type Statement = z.infer<typeof Statement>;

/** Topics live in a unit, or in the science "practicals" pseudo-unit (science.practicals.c5). */
const TopicUnit = z.union([UnitCode, z.literal("practicals")]);

export const Topic = named(
  z
    .object({
      id: TopicId,
      slug: Slug,
      title: z.string().min(1),
      subject: SubjectId,
      unit: TopicUnit,
      tier: Tier,
      strand: z.string().min(1),
      statementIds: z.array(SpecRef).min(1),
      prerequisites: z.array(TopicId),
      order: z.int().nonnegative(),
      hardness: Hardness,
      difficulty: Difficulty,
      examinerFlagged: z.boolean(),
      examinerSources: z.array(ExaminerSource),
      examWeightHint: z.string(),
      mustMemorise: z.array(z.string().min(1)),
      onFormulaSheet: z.array(z.string().min(1)),
      notOnThisSpec: z.array(z.string().min(1)),
      externalRefs: z.array(ExternalRef),
      keywords: z.array(z.string().min(1)),
      practicals: z.array(PracticalCode).optional(),
    })
    .superRefine((t, ctx) => {
      if (!t.id.endsWith(`.${t.slug}`)) {
        ctx.addIssue({ code: "custom", message: `topic id "${t.id}" must end with ".${t.slug}"`, path: ["id"] });
      }
      if (t.prerequisites.includes(t.id)) {
        ctx.addIssue({ code: "custom", message: "a topic cannot be its own prerequisite", path: ["prerequisites"] });
      }
      if (t.examinerFlagged && t.examinerSources.length === 0) {
        ctx.addIssue({
          code: "custom",
          message: "an examiner-flagged topic needs at least one examinerSource",
          path: ["examinerSources"],
        });
      }
    }),
  "Topic",
  "Teachable topic: the unit of authoring and navigation; maps to >= 1 statement",
);
export type Topic = z.infer<typeof Topic>;

// ---------------------------------------------------------------------------
// Notes
// ---------------------------------------------------------------------------

export const NoteFrontmatter = named(
  z.object({
    id: NoteId,
    topic: TopicId,
    title: z.string().min(1),
    subject: SubjectId,
    unit: TopicUnit,
    tier: Tier,
    specRefs: z.array(SpecRef).min(1),
    calculator: z.union([z.boolean(), z.literal("P1-no/P2-yes")]),
    formulaSheet: z.object({ given: z.array(z.string().min(1)), mustKnow: z.array(z.string().min(1)) }),
    notOnThisSpec: z.array(z.string().min(1)),
    hardness: Hardness,
    examinerFlagged: z.boolean(),
    externalRefs: z.array(ExternalRef),
    sheet: z.object({
      mustBeAbleTo: z.array(z.string().min(1)).min(1),
      howExamined: z.string().min(1),
      traps: z.array(z.string().min(1)),
    }),
    verification: VerificationRef,
    version: z.int().positive(),
    updated: IsoDateLike,
  }),
  "NoteFrontmatter",
  "Frontmatter of note.mdx: the Sheet (must-be-able-to, how examined, traps), formula-sheet split, scope limits",
);
export type NoteFrontmatter = z.infer<typeof NoteFrontmatter>;

// ---------------------------------------------------------------------------
// Sets and mocks (D11) — §3.9 reserves the set./mock. prefixes without a type; minimal shapes here
// ---------------------------------------------------------------------------

export const PracticeSet = named(
  z.object({
    id: PracticeSetId,
    topic: TopicId.optional(),
    kind: z.enum(["interleaved", "ssdd", "mixed", "unit-review"]),
    title: z.string().min(1),
    subject: SubjectId,
    units: z.array(UnitCode).min(1),
    itemIds: z.array(z.union([QuestionId, DiagnosticSetId, RetrievalPromptId, FindTheMistakeId])).min(1),
    showTopicLabels: z.boolean(),
    version: z.int().positive(),
  }),
  "PracticeSet",
  "Interleaved / SSDD / mixed set of existing items, shown without topic labels by default",
);
export type PracticeSet = z.infer<typeof PracticeSet>;

export const MockPaper = named(
  z
    .object({
      id: MockPaperId,
      subject: SubjectId,
      paper: PaperContext,
      tier: Tier,
      title: z.string().min(1),
      minutes: z.int().positive(),
      totalMarks: z.int().positive(),
      questions: z.array(z.object({ questionId: QuestionId, marks: z.int().positive() })).min(1),
      composition: z
        .object({ aoWeights: z.record(z.string(), z.number()), strandWeights: z.record(z.string(), z.number()) })
        .optional(),
      verification: VerificationRef,
      version: z.int().positive(),
    })
    .refine((m) => sum(m.questions.map((q) => q.marks)) === m.totalMarks, {
      message: "totalMarks must equal the sum of the question marks",
      path: ["totalMarks"],
    }),
  "MockPaper",
  "Paper-format mock composed to the AO/strand grid and the mined tariff distribution",
);
export type MockPaper = z.infer<typeof MockPaper>;

// ---------------------------------------------------------------------------
// Topic bundle: everything for one topic, cross-checked
// ---------------------------------------------------------------------------

export const TopicBundle = named(
  z
    .object({
      $schema: SchemaPointer,
      topic: Topic,
      note: NoteFrontmatter.optional(),
      workedExamples: z.array(WorkedExample),
      diagnostics: z.array(DiagnosticSet),
      questions: z.array(Question),
      findTheMistake: z.array(FindTheMistake),
      prompts: z.array(RetrievalPrompt),
      insight: ExaminerInsight.optional(),
      sets: z.array(PracticeSet).optional(),
      verification: z.array(VerificationLog),
    })
    .superRefine((b, ctx) => {
      const topicId = b.topic.id;
      const ids: string[] = [];
      const withTopic: Array<{ id: string; topic: string | undefined; path: PropertyKey[] }> = [];
      const withRef: Array<{ id: string; ref: string; path: PropertyKey[] }> = [];

      if (b.note) {
        ids.push(b.note.id);
        withTopic.push({ id: b.note.id, topic: b.note.topic, path: ["note", "topic"] });
        withRef.push({ id: b.note.id, ref: b.note.verification, path: ["note", "verification"] });
      }
      b.workedExamples.forEach((we, i) => {
        ids.push(we.id);
        withTopic.push({ id: we.id, topic: we.topic, path: ["workedExamples", i, "topic"] });
        withRef.push({ id: we.id, ref: we.verification, path: ["workedExamples", i, "verification"] });
      });
      b.diagnostics.forEach((dx, i) => {
        ids.push(dx.id);
        withTopic.push({ id: dx.id, topic: dx.topic, path: ["diagnostics", i, "topic"] });
      });
      b.questions.forEach((q, i) => {
        ids.push(q.id);
        withTopic.push({ id: q.id, topic: q.topic, path: ["questions", i, "topic"] });
        withRef.push({ id: q.id, ref: q.verification, path: ["questions", i, "verification"] });
      });
      b.findTheMistake.forEach((f, i) => {
        ids.push(f.id);
        withTopic.push({ id: f.id, topic: f.topic, path: ["findTheMistake", i, "topic"] });
      });
      b.prompts.forEach((p, i) => {
        ids.push(p.id);
        withTopic.push({ id: p.id, topic: p.topic, path: ["prompts", i, "topic"] });
      });
      if (b.insight) {
        ids.push(b.insight.id);
        withTopic.push({ id: b.insight.id, topic: b.insight.topic, path: ["insight", "topic"] });
      }
      (b.sets ?? []).forEach((s, i) => {
        ids.push(s.id);
        if (s.topic !== undefined) withTopic.push({ id: s.id, topic: s.topic, path: ["sets", i, "topic"] });
      });
      b.verification.forEach((log) => ids.push(log.id));

      for (const id of duplicates(ids)) {
        ctx.addIssue({ code: "custom", message: `duplicate id "${id}" in bundle`, path: ["topic", "id"] });
      }
      for (const item of withTopic) {
        if (item.topic !== topicId) {
          ctx.addIssue({
            code: "custom",
            message: `${item.id} belongs to topic "${item.topic}" but the bundle is "${topicId}"`,
            path: item.path,
          });
        }
      }
      const logs = new Map<string, { itemId: string }>(b.verification.map((log) => [log.id, log]));
      for (const item of withRef) {
        const log = logs.get(item.ref);
        if (!log) {
          ctx.addIssue({
            code: "custom",
            message: `verification log "${item.ref}" for ${item.id} is not in the bundle`,
            path: item.path,
          });
        } else if (log.itemId !== item.id) {
          ctx.addIssue({
            code: "custom",
            message: `verification log "${item.ref}" records itemId "${log.itemId}", expected "${item.id}"`,
            path: item.path,
          });
        }
      }
      const itemIds = new Set(ids);
      b.verification.forEach((log, i) => {
        if (!itemIds.has(log.itemId)) {
          ctx.addIssue({
            code: "custom",
            message: `verification log ${log.id} refers to unknown item "${log.itemId}"`,
            path: ["verification", i, "itemId"],
          });
        }
      });
    }),
  "TopicBundle",
  "Everything authored for one topic: topic row, note frontmatter, worked examples, diagnostics, questions, find-the-mistake, prompts, insight, sets and verification logs",
);
export type TopicBundle = z.infer<typeof TopicBundle>;
