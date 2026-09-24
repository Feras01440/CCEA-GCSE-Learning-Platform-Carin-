import { describe, expect, test } from "vitest";
import { existsSync, mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import * as S from "./schema";
import { JSON_SCHEMA_NAMES, buildJsonSchemas, schemaFileName, writeJsonSchemas } from "./json-schema";
import {
  bundleSpecRefs,
  isKnownSpecRef,
  isSpecRef,
  makeItemId,
  makeTopicId,
  parseItemId,
  parseTopicId,
  statementIdsFor,
  subjectOfSpecRef,
  tryParseTopicId,
  unknownSpecRefs,
} from "./ids";
import histogramsJson from "./fixtures/histograms.example.json";

// ---------------------------------------------------------------------------
// helpers
// ---------------------------------------------------------------------------

type Issue = { path: PropertyKey[]; message: string };
type Result = { success: boolean; error?: { issues: Issue[] } };

const paths = (r: Result) => (r.success ? [] : r.error!.issues.map((i) => i.path.join(".")));
const messages = (r: Result) => (r.success ? [] : r.error!.issues.map((i) => i.message));

/** Asserts the parse failed and that one of the issues sits at exactly `path`. */
function expectIssueAt(r: Result, path: PropertyKey[]) {
  expect(r.success, `expected a failure at ${path.join(".")}`).toBe(false);
  expect(paths(r)).toContain(path.join("."));
}

const clone = <T>(v: T): T => structuredClone(v);

const bundle = S.TopicBundle.parse(histogramsJson);
const question = () => clone(bundle.questions[0]!);
const workedExample = () => clone(bundle.workedExamples[0]!);
const diagnostics = () => clone(bundle.diagnostics[0]!);
const prompt = () => clone(bundle.prompts[0]!);
const ftm = () => clone(bundle.findTheMistake[0]!);
const insight = () => clone(bundle.insight!);

const ISO = "2026-09-05T09:00:00Z";
const CER = "ccea-cer:maths:2025-summer:M4:Q22";

// ---------------------------------------------------------------------------
// shared references
// ---------------------------------------------------------------------------

describe("shared references", () => {
  test("every Tolerance variant parses", () => {
    const cases: S.Tolerance[] = [
      { type: "absolute", value: 0.05 },
      { type: "relative", value: 0.01 },
      { type: "dp", places: 1 },
      { type: "sf", figures: 3 },
      { type: "range", min: 36.1, max: 36.2 },
      { type: "exact" },
    ];
    for (const c of cases) expect(S.Tolerance.safeParse(c).success, c.type).toBe(true);
  });

  test("Tolerance completeness: a range with min > max and a dp without places both fail", () => {
    expectIssueAt(S.Tolerance.safeParse({ type: "range", min: 2, max: 1 }), ["max"]);
    expectIssueAt(S.Tolerance.safeParse({ type: "dp" }), ["places"]);
    expectIssueAt(S.Tolerance.safeParse({ type: "sf", figures: 0 }), ["figures"]);
    expect(S.Tolerance.safeParse({ type: "nearly" }).success).toBe(false);
  });

  test("ExaminerSource accepts ccea-cer:<subject>:<series>:<unit>:Q<n> with optional part", () => {
    for (const ok of [CER, "ccea-cer:maths:2024-summer:M4:Q21b", "ccea-cer:science:2026-march:P1:Q7(a)", "ccea-cer:further-maths:2019-summer:FM1:Q8"]) {
      expect(S.ExaminerSource.safeParse(ok).success, ok).toBe(true);
    }
  });

  test("ExaminerSource rejects malformed citations", () => {
    for (const bad of [
      "ccea-cer:maths:2025:M4:Q22",
      "ccea-cer:maths:2025-summer:M4:22",
      "cer:maths:2025-summer:M4:Q22",
      "ccea-cer:maths:summer-2025:M4:Q22",
      "ccea-cer:Maths:2025-summer:M4:Q22",
      "ccea-cer:maths:2025-summer:M4:Q22:extra",
    ]) {
      expect(S.ExaminerSource.safeParse(bad).success, bad).toBe(false);
    }
  });

  test("SpecRef checks the id shape for every subject family", () => {
    for (const ok of ["M4-HD-02", "FM1-ALF-01", "DA-P1-1.4.17", "DA-PRAC-C5", "DA-U7-plan-3"]) {
      expect(S.SpecRef.safeParse(ok).success, ok).toBe(true);
    }
    for (const bad of ["m4-hd-02", "histograms", "M4", "-M4-HD-02"]) expect(S.SpecRef.safeParse(bad).success, bad).toBe(false);
  });

  test("TopicId and MisconceptionId patterns", () => {
    for (const ok of ["maths.m4.histograms", "fm.u1.algebraic-fractions-add-subtract", "science.practicals.c5"]) {
      expect(S.TopicId.safeParse(ok).success, ok).toBe(true);
    }
    for (const bad of ["maths.histograms", "Maths.m4.histograms", "maths.m4.histo grams", "maths.m4.-histograms"]) {
      expect(S.TopicId.safeParse(bad).success, bad).toBe(false);
    }
    expect(S.MisconceptionId.safeParse("hist.freq-as-height").success).toBe(true);
    expect(S.MisconceptionId.safeParse("freq-as-height").success).toBe(false);
  });

  test("every ExternalRef kind parses", () => {
    const refs: S.ExternalRef[] = [
      { kind: "corbettmaths", videos: [157, 158], practiceUrl: "https://corbettmaths.com/contents/" },
      { kind: "bitesize", url: "https://www.bbc.co.uk/bitesize/examspecs/zcq8b82" },
      { kind: "youtube", videoId: "abc123XYZ_-", channel: "NI Maths Tutor", credit: "NI Maths Tutor", checkpoints: [{ at: 30, promptId: "rp.maths.m4.histograms.01" }] },
      { kind: "ccea-doc", docType: "spec", url: "https://ccea.org.uk/", page: 40, asOf: "2026-09-01" },
      { kind: "phet", sim: "energy-skate-park", url: "https://phet.colorado.edu/", licence: "CC BY-NC 4.0", attribution: "PhET Interactive Simulations" },
      { kind: "geogebra", materialId: "abcd1234", attribution: "Made with GeoGebra®" },
      { kind: "pastpaper-question", paperId: "maths/2025-summer/M4-H", question: "22", page: 18 },
    ];
    for (const r of refs) expect(S.ExternalRef.safeParse(r).success, r.kind).toBe(true);
    expect(S.ExternalRef.safeParse({ kind: "geogebra", materialId: "x", attribution: "GeoGebra" }).success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// item ids
// ---------------------------------------------------------------------------

describe("item id prefixes", () => {
  test("each prefixed id schema accepts its own prefix and rejects the others", () => {
    const table: Array<[S.ItemIdPrefix, { safeParse: (v: unknown) => { success: boolean } }]> = [
      ["note", S.NoteId],
      ["we", S.WorkedExampleId],
      ["dx", S.DiagnosticSetId],
      ["q", S.QuestionId],
      ["ftm", S.FindTheMistakeId],
      ["rp", S.RetrievalPromptId],
      ["ins", S.ExaminerInsightId],
      ["prac", S.PracticalId],
      ["eq", S.PhysicsEquationId],
      ["qwc", S.QwcItemId],
      ["set", S.PracticeSetId],
      ["mock", S.MockPaperId],
      ["ver", S.VerificationRef],
    ];
    for (const [prefix, schema] of table) {
      expect(schema.safeParse(`${prefix}.maths.m4.histograms.01`).success, prefix).toBe(true);
      expect(schema.safeParse(`${prefix}.`).success, `${prefix}. (empty tail)`).toBe(false);
      expect(schema.safeParse(`${prefix}.Maths.M4`).success, `${prefix} uppercase`).toBe(false);
      const other = prefix === "q" ? "we" : "q";
      expect(schema.safeParse(`${other}.maths.m4.histograms.01`).success, `${prefix} vs ${other}`).toBe(false);
    }
  });

  test("a bad id prefix fails at path id with a message naming the prefix", () => {
    const r = S.RetrievalPrompt.safeParse({ ...prompt(), id: "q.maths.m4.histograms.01" });
    expectIssueAt(r, ["id"]);
    expect(messages(r).join("\n")).toContain('"rp."');
    expectIssueAt(S.Question.safeParse({ ...question(), id: "question.0001" }), ["id"]);
  });
});

// ---------------------------------------------------------------------------
// answers
// ---------------------------------------------------------------------------

describe("AnswerSpec", () => {
  test("every AnswerSpec kind parses", () => {
    const specs: S.AnswerSpec[] = [
      { kind: "numeric", value: 36.2, tolerance: { type: "range", min: 36.1, max: 36.2 }, unit: "cm", unitRequired: true, acceptForms: ["decimal"] },
      { kind: "algebraic", latex: "(x+3)(x-2)", equivalence: "equivalent", variables: ["x"], mustBeFactorised: true },
      { kind: "mcq", options: [{ id: "a", text: "1.6", correct: true, feedback: "Yes" }, { id: "b", text: "16", correct: false, misconception: "hist.freq-as-height", feedback: "No" }], shuffle: true },
      { kind: "text", accepted: ["frequency density"], keyWords: [{ any: ["frequency", "density"], marks: 1, reject: ["frequency polygon"] }], listingRule: false },
      { kind: "text-long", rubricId: "qwc.science.p1.energy", bands: [{ band: "A", marks: [5, 6], descriptor: "Full, coherent" }], indicativeContent: [{ point: "KE rises with v²", keyWords: ["kinetic"] }], selfMark: true },
      { kind: "graph", expect: { plot: "histogram", bars: [{ from: 0, to: 20, frequencyDensity: 0.3 }], axisLabelY: "Frequency density", scaleTolerance: 0.05 } },
      { kind: "drawing", rubric: ["arcs visible", "line through both arc intersections"], selfMark: true },
      { kind: "table", cells: [{ row: 1, col: 2, value: 1.6, tolerance: { type: "exact" } }] },
      { kind: "matrix", rows: 2, cols: 2, entries: [["7", "10"], ["-3", "4"]], tolerance: { type: "absolute", value: 0.0005 } },
      { kind: "equation", kindOf: "symbol", balancedLatex: "2H_2 + O_2 \\rightarrow 2H_2O", stateSymbolsRequired: false, acceptMultiples: true },
      { kind: "steps", expectedOrder: ["find n/2", "find the class", "interpolate"], allowSkips: false },
      { kind: "label", targets: [{ id: "t1", accepted: ["Frequency density"], direction: "up" }], bank: ["Frequency density", "Frequency"] },
      { kind: "order", items: ["a", "b", "c"], correctOrder: [2, 0, 1] },
      { kind: "annotation", spans: [{ from: 0, to: 4, tag: "simile" }], tags: ["simile", "metaphor"], minCorrect: 1 },
    ];
    expect(specs.length).toBe(S.AnswerKind.options.length);
    for (const spec of specs) expect(S.AnswerSpec.safeParse(spec).success, spec.kind).toBe(true);
  });

  test("numeric with unitRequired but no unit fails at unit", () => {
    expectIssueAt(S.AnswerSpec.safeParse({ kind: "numeric", value: 1, tolerance: { type: "exact" }, unitRequired: true, acceptForms: [] }), ["unit"]);
  });

  test("mcq needs exactly one correct option unless multi", () => {
    const opts = (correct: boolean[]) =>
      correct.map((c, i) => ({ id: `o${i}`, text: `option ${i}`, correct: c, feedback: "feedback" }));
    expectIssueAt(S.AnswerSpec.safeParse({ kind: "mcq", options: opts([false, false, false]), shuffle: true }), ["options"]);
    expectIssueAt(S.AnswerSpec.safeParse({ kind: "mcq", options: opts([true, true, false]), shuffle: true }), ["options"]);
    expect(S.AnswerSpec.safeParse({ kind: "mcq", options: opts([true, true, false]), shuffle: true, multi: true }).success).toBe(true);
    expectIssueAt(S.AnswerSpec.safeParse({ kind: "mcq", options: opts([false, false]), shuffle: true, multi: true }), ["options"]);
    const dup = opts([true, false]).map((o) => ({ ...o, id: "same" }));
    expectIssueAt(S.AnswerSpec.safeParse({ kind: "mcq", options: dup, shuffle: false }), ["options"]);
  });

  test("order answers need a permutation; graph expectations are checked", () => {
    expectIssueAt(S.AnswerSpec.safeParse({ kind: "order", items: ["a", "b"], correctOrder: [0, 0] }), ["correctOrder"]);
    expectIssueAt(S.GraphExpectation.safeParse({ plot: "box", min: 1, q1: 5, median: 3, q3: 7, max: 9, tolerance: { type: "exact" } }), ["median"]);
    expectIssueAt(S.GraphExpectation.safeParse({ plot: "histogram", bars: [{ from: 0, to: 20, frequencyDensity: 0.3 }], axisLabelY: "Frequency", scaleTolerance: 0 }), ["axisLabelY"]);
    expectIssueAt(S.GraphExpectation.safeParse({ plot: "histogram", bars: [{ from: 20, to: 20, frequencyDensity: 0.3 }], axisLabelY: "Frequency density", scaleTolerance: 0 }), ["bars", 0, "to"]);
  });
});

// ---------------------------------------------------------------------------
// questions
// ---------------------------------------------------------------------------

describe("Question", () => {
  test("the fixture question parses and infers a typed result", () => {
    const q = S.Question.parse(question());
    expect(q.parts.map((p) => p.marks)).toEqual([3, 2, 3]);
    expect(q.parts[2]!.answer.kind).toBe("numeric");
  });

  test("parts' marks must sum to totalMarks", () => {
    const q = question();
    q.totalMarks = 9;
    const r = S.Question.safeParse(q);
    expectIssueAt(r, ["totalMarks"]);
    expect(messages(r).join("\n")).toContain("parts sum to 8");
  });

  test("MarkPoint.dependsOn must name a mark point of the same part", () => {
    const q = question();
    q.parts[0]!.scheme[1]!.dependsOn = ["M9"];
    expectIssueAt(S.Question.safeParse(q), ["parts", 0, "scheme", 1, "dependsOn", 0]);
    const self = question();
    self.parts[2]!.scheme[0]!.dependsOn = ["M1"];
    expectIssueAt(S.Question.safeParse(self), ["parts", 2, "scheme", 0, "dependsOn", 0]);
  });

  test("a part's scheme must total the part's marks", () => {
    const q = question();
    q.parts[1]!.scheme[0]!.marks = 2;
    expectIssueAt(S.Question.safeParse(q), ["parts", 1, "marks"]);
  });

  test("followThrough.fromPart must be another part of the question", () => {
    const q = question();
    q.parts[1]!.followThrough = { fromPart: "z", rule: "use-candidate-value" };
    expectIssueAt(S.Question.safeParse(q), ["parts", 1, "followThrough", "fromPart"]);
  });

  test("skeleton must match the parts and their marks", () => {
    const q = question();
    q.skeleton = "(a)draw3|(b)estimate3|(c)estimate2";
    expectIssueAt(S.Question.safeParse(q), ["skeleton"]);
    q.skeleton = "draw 3 marks";
    expectIssueAt(S.Question.safeParse(q), ["skeleton"]);
    expect(S.parseSkeleton("(a)draw3|(b(i))calc2|(main)show4")).toEqual([
      { part: "a", verb: "draw", marks: 3 },
      { part: "b(i)", verb: "calc", marks: 2 },
      { part: "main", verb: "show", marks: 4 },
    ]);
  });

  test("duplicate part ids, a bad part id and a non-original context all fail", () => {
    const q = question();
    q.parts[1]!.id = "a";
    q.skeleton = "(a)draw3|(a)estimate2|(c)estimate3";
    expectIssueAt(S.Question.safeParse(q), ["parts"]);
    const bad = question();
    bad.parts[0]!.id = "A";
    expectIssueAt(S.Question.safeParse(bad), ["parts", 0, "id"]);
    expectIssueAt(S.Question.safeParse({ ...question(), context: { setting: "x", original: false } }), ["context", "original"]);
  });

  test("CommonError text patterns must be valid regexes", () => {
    const r = S.CommonError.safeParse({ misconception: "hist.x", pattern: { kind: "text", regex: "([" }, feedback: "f", marksTypicallyEarned: 0 });
    expectIssueAt(r, ["pattern", "regex"]);
  });
});

// ---------------------------------------------------------------------------
// worked examples
// ---------------------------------------------------------------------------

describe("WorkedExample", () => {
  test("the fixture worked example parses", () => {
    expect(S.WorkedExample.safeParse(workedExample()).success).toBe(true);
  });

  test("steps are numbered in order, why-menus index an option, and fading names later steps", () => {
    const we = workedExample();
    we.steps[1]!.n = 5;
    expectIssueAt(S.WorkedExample.safeParse(we), ["steps", 1, "n"]);

    const menu = workedExample();
    menu.steps[2]!.whyMenu!.correct = 3;
    expectIssueAt(S.WorkedExample.safeParse(menu), ["steps", 2, "whyMenu", "correct"]);

    const faded = workedExample();
    faded.faded[0] = { showSteps: 3, studentSupplies: [2] };
    expectIssueAt(S.WorkedExample.safeParse(faded), ["faded", 0, "studentSupplies", 0]);
    faded.faded[0] = { showSteps: 4, studentSupplies: [4] };
    expectIssueAt(S.WorkedExample.safeParse(faded), ["faded", 0, "showSteps"]);
  });
});

// ---------------------------------------------------------------------------
// diagnostics, prompts, find-the-mistake, insight, misconceptions
// ---------------------------------------------------------------------------

describe("DiagnosticSet", () => {
  test("the fixture set parses and each distractor carries a misconception tag", () => {
    const dx = S.DiagnosticSet.parse(diagnostics());
    for (const item of dx.items) {
      expect(item.options.filter((o) => o.correct).length).toBe(1);
      for (const o of item.options.filter((o) => !o.correct)) expect(o.misconception).toMatch(/^[a-z]+\./);
    }
  });

  test("an item with zero correct options fails at items.n.options; duplicate item ids fail", () => {
    const dx = diagnostics();
    dx.items[0]!.options.forEach((o) => (o.correct = false));
    expectIssueAt(S.DiagnosticSet.safeParse(dx), ["items", 0, "options"]);
    const dupes = diagnostics();
    dupes.items[1]!.id = dupes.items[0]!.id;
    expectIssueAt(S.DiagnosticSet.safeParse(dupes), ["items"]);
  });

  test("confidence and hypercorrectionQueue are always on", () => {
    const dx = diagnostics();
    (dx.items[0] as unknown as { confidence: boolean }).confidence = false;
    expectIssueAt(S.DiagnosticSet.safeParse(dx), ["items", 0, "confidence"]);
  });
});

describe("RetrievalPrompt and FindTheMistake", () => {
  test("prompts parse for every kind, including English's quotation kind", () => {
    for (const kind of S.RetrievalPrompt.shape.kind.options) {
      expect(S.RetrievalPrompt.safeParse({ ...prompt(), kind }).success, kind).toBe(true);
    }
    expectIssueAt(S.RetrievalPrompt.safeParse({ ...prompt(), kind: "essay" }), ["kind"]);
  });

  test("find-the-mistake parses; the mistake line must exist and the source must be a CER citation", () => {
    expect(S.FindTheMistake.safeParse(ftm()).success).toBe(true);
    expectIssueAt(S.FindTheMistake.safeParse({ ...ftm(), mistakeLine: 4 }), ["mistakeLine"]);
    expectIssueAt(S.FindTheMistake.safeParse({ ...ftm(), source: "S2025 M4 Q22" }), ["source"]);
  });
});

describe("ExaminerInsight and Misconception", () => {
  test("the fixture insight parses; a malformed source or url fails at its path", () => {
    expect(S.ExaminerInsight.safeParse(insight()).success).toBe(true);
    const bad = insight();
    bad.findings[0]!.source = "ccea-cer:maths:2025-summer:M4:22" as S.ExaminerSource;
    expectIssueAt(S.ExaminerInsight.safeParse(bad), ["findings", 0, "source"]);
    const url = insight();
    url.findings[1]!.url = "reports page";
    expectIssueAt(S.ExaminerInsight.safeParse(url), ["findings", 1, "url"]);
  });

  test("misconception registry entries parse", () => {
    const m: S.Misconception = {
      id: "hist.freq-as-height",
      label: "Plots frequency as the bar height on an unequal-width histogram",
      subject: "maths",
      statements: ["M4-HD-02"],
      sources: [CER, "ccea-cer:maths:2024-november:M4:Q21"],
      firstSeen: "2023-summer",
      lastSeen: "2025-summer",
      ledgerTag: "concept",
    };
    expect(S.Misconception.safeParse(m).success).toBe(true);
    expectIssueAt(S.Misconception.safeParse({ ...m, firstSeen: "Summer 2023" }), ["firstSeen"]);
  });
});

// ---------------------------------------------------------------------------
// science-specific
// ---------------------------------------------------------------------------

describe("science items", () => {
  const practical: S.Practical = {
    id: "prac.science.practicals.c5",
    code: "C5",
    specRef: "DA-PRAC-C5",
    attachedLOs: ["DA-C2-2.6.1"],
    title: "Find the mass of water in hydrated crystals",
    method: ["Weigh the crucible empty, then with the crystals", "Heat gently, cool, reweigh; repeat to constant mass"],
    apparatus: ["crucible", "pipeclay triangle", "tripod", "Bunsen burner", "balance", "tongs"],
    apparatusDiagram: { kind: "apparatus", parts: ["crucible", "pipeclay triangle", "tripod", "Bunsen burner"], style: "ccea-2d" },
    variables: { independent: "heating time", dependent: "mass of the crucible and contents", control: ["same crucible", "same balance"] },
    hypothesis: "Heating drives off the water of crystallisation, so the mass falls until it is constant.",
    risks: [{ hazard: "hot crucible", control: "use tongs and let it cool on a heat-proof mat" }],
    resultsTable: { columns: [{ heading: "Mass of crucible", unit: "g" }, { heading: "Mass after heating", unit: "g" }], repeats: 3 },
    calculations: ["mass of water = mass before − mass after", "moles of water = mass ÷ 18"],
    vocabulary: [{ term: "constant mass", ourDefinition: "Two successive weighings agree, so no more water is leaving", keyWords: ["constant", "mass"] }],
    bookletBItems: ["q.science.practicals.c5.0001"],
    bookletAChecklist: ["heat gently at first", "reheat and reweigh until the mass stops changing"],
    examinerSources: ["ccea-cer:science:2025-summer:U7:Q3"],
    externalRefs: [],
  };

  test("a practical parses; the code and specRef must agree", () => {
    expect(S.Practical.safeParse(practical).success).toBe(true);
    expectIssueAt(S.Practical.safeParse({ ...practical, code: "C4" }), ["specRef"]);
    expectIssueAt(S.Practical.safeParse({ ...practical, specRef: "DA-PRAC-X9" }), ["specRef"]);
  });

  test("a physics equation parses and is never given in the exam", () => {
    const eq: S.PhysicsEquation = {
      id: "eq.science.p1.kinetic-energy",
      specRefs: ["DA-P1-1.4.17"],
      latex: "E_k = \\tfrac{1}{2} m v^2",
      words: "kinetic energy = half × mass × speed squared",
      symbols: [{ sym: "E_k", quantity: "kinetic energy", unit: "J" }, { sym: "m", quantity: "mass", unit: "kg" }, { sym: "v", quantity: "speed", unit: "m/s" }],
      rearrangements: ["v = \\sqrt{2E_k / m}", "m = 2E_k / v^2"],
      conversions: [{ from: "g", to: "kg", factor: 0.001, examinerNote: "mass in kilograms before substituting" }],
      givenInExam: false,
      drills: ["recall", "units", "rearrange", "substitute-convert"],
    };
    expect(S.PhysicsEquation.safeParse(eq).success).toBe(true);
    expectIssueAt(S.PhysicsEquation.safeParse({ ...eq, givenInExam: true }), ["givenInExam"]);
  });

  test("a QWC item parses with three bands", () => {
    const qwc: S.QwcItem = {
      id: "qwc.science.p1.energy-transfers.01",
      specRefs: ["DA-P1-1.4.1"],
      unit: "P1",
      tier: "both",
      stem: "Describe the energy transfers as a ball is thrown upwards and falls back to the ground.",
      indicativeContent: [
        { point: "kinetic energy falls as the ball rises", keyWords: ["kinetic"] },
        { point: "gravitational potential energy is greatest at the top", keyWords: ["gravitational potential", "maximum"], commonLoss: "saying potential energy without gravitational" },
      ],
      bands: [
        { band: "A", marks: [5, 6], descriptor: "Sequenced, all transfers named, correct terms" },
        { band: "B", marks: [3, 4], descriptor: "Most transfers named, some sequencing" },
        { band: "C", marks: [1, 2], descriptor: "Limited, list-like" },
        { band: "0", marks: [0, 0], descriptor: "Nothing creditworthy" },
      ],
      modelAnswerBandA: "As the ball rises its kinetic energy is transferred to gravitational potential energy …",
      upgradeMeBandB: "The ball goes up and slows down because it loses energy …",
      selfMarkRubric: ["Did you name kinetic and gravitational potential energy?", "Did you say where each is greatest?"],
      examinerSources: ["ccea-cer:science:2024-summer:P1:Q9"],
    };
    expect(S.QwcItem.safeParse(qwc).success).toBe(true);
    expectIssueAt(S.QwcItem.safeParse({ ...qwc, bands: [{ band: "A", marks: [6, 5], descriptor: "x" }] }), ["bands", 0, "marks"]);
  });
});

// ---------------------------------------------------------------------------
// mined layer, data pack, verification, subject pack, statements, topics, notes, sets
// ---------------------------------------------------------------------------

describe("mined layer", () => {
  test("MinedQuestion carries metadata only; textHash must be a SHA-256 hex", () => {
    const mq: S.MinedQuestion = {
      paperId: "maths/2025-november/M4-H",
      session: "2025-november",
      unit: "M4",
      tier: "H",
      question: "22",
      part: "a",
      page: 18,
      marks: 3,
      commandWords: ["draw"],
      emphasis: [],
      hasFigure: true,
      contextClass: "data",
      skeleton: "(a)draw3|(b)estimate2",
      markCodes: ["M1", "A1", "A1"],
      ft: false,
      topics: ["maths.m4.histograms"],
      topicsConfirmedBy: "human",
      textHash: "a".repeat(64),
    };
    expect(S.MinedQuestion.safeParse(mq).success).toBe(true);
    expectIssueAt(S.MinedQuestion.safeParse({ ...mq, textHash: "not-a-hash" }), ["textHash"]);
  });

  test("MinedStats is keyed by topic id and its tariff is ordered", () => {
    const stats: S.MinedStats = {
      subject: "maths",
      generatedFrom: ["packs/maths/mined/2025-november/M4.questions.json"],
      byTopic: {
        "maths.m4.histograms": {
          appearances: [{ session: "2025-november", unit: "M4", question: "22", marks: 8 }],
          tariff: { min: 6, p10: 6, median: 8, p90: 9, max: 9 },
          commandWords: { draw: 1, estimate: 2 },
          markCodePatterns: { "M1 A1 A1": 1 },
          latePaperShare: 1,
        },
      },
      byUnit: { M4: { commandWords: { draw: 4 }, tariffHistogram: { "3": 5 }, questionsPerPaper: [24, 25] } },
    };
    expect(S.MinedStats.safeParse(stats).success).toBe(true);
    const badKey = { ...stats, byTopic: { Histograms: stats.byTopic["maths.m4.histograms"] } };
    expect(S.MinedStats.safeParse(badKey).success).toBe(false);
    const badTariff = clone(stats);
    badTariff.byTopic["maths.m4.histograms"]!.tariff = { min: 9, p10: 6, median: 8, p90: 9, max: 9 };
    expectIssueAt(S.MinedStats.safeParse(badTariff), ["byTopic", "maths.m4.histograms", "tariff", "median"]);
  });
});

describe("DataPack and VerificationLog", () => {
  test("a data pack parses", () => {
    const pack: S.DataPack = {
      umsUnitBoundaries: { M4: { a: 144, b: 132, "c*": 121, c: 108 } },
      rawBoundaries: [{ unit: "M4", series: "Summer 2025", grades: { a: 45, b: 36 }, source: "CCEA raw-to-UMS Summer 2025" }],
      subjectBoundaries: [{ qual: "G9602", series: "Summer 2025", aStar: "top 3.5% of A", grades: { a: 320, b: 293 } }],
      timetable: [{ series: "November 2026", unit: "M4", date: "2026-11-17", start: "09:15", end: "11:15", source: "timetable-november2026", version: "v1" }],
      rules: [{ id: "nov-resit-only", text: "From November 2027 the November series is a resit series only.", appliesFrom: "2027-11", source: "Circular S/IF/35/26" }],
      asOf: "2026-09-01",
    };
    expect(S.DataPack.safeParse(pack).success).toBe(true);
    expectIssueAt(S.DataPack.safeParse({ ...pack, timetable: [{ ...pack.timetable[0]!, start: "9.15" }] }), ["timetable", 0, "start"]);
  });

  test("verification logs parse and reject unknown check types", () => {
    const log = clone(bundle.verification[2]!);
    expect(S.VerificationLog.safeParse(log).success).toBe(true);
    expect(log.status).toBe("verified");
    (log.checks[0] as unknown as { type: string }).type = "vibes";
    expectIssueAt(S.VerificationLog.safeParse(log), ["checks", 0, "type"]);
    expectIssueAt(S.VerificationLog.safeParse({ ...log, id: "log.q.x" }), ["id"]);
  });
});

describe("SubjectPack, Statement, Topic, NoteFrontmatter, sets and mocks", () => {
  const markLanguage: S.MarkLanguageProfile = {
    codes: [
      { code: "M", meaning: "method" },
      { code: "A", meaning: "accuracy, needs the preceding M", dependsOnMethod: true },
      { code: "MA", meaning: "method and accuracy together" },
    ],
    followThrough: true,
    positiveMarking: true,
    rules: [{ id: "gma-v", text: "Two answers with none on the answer line: the poorer is marked.", source: "General Marking Advice (v)" }],
    feedbackTemplates: { A: "A1 lost — {reason}", M: "M1 earned for {for}" },
  };
  const pack: S.SubjectPack = {
    id: "maths",
    title: "GCSE Mathematics",
    cceaQualificationId: "504",
    subjectCode: "2210",
    gradeScale: ["A*", "A", "B", "C*", "C", "D", "E", "F", "G"],
    units: [
      {
        code: "M4",
        title: "Unit M4: Higher Tier",
        tier: "H",
        weighting: 45,
        umsMax: 180,
        umsScale: 180,
        papers: [{ name: "Paper", minutes: 120, marks: 100, calculator: true, resources: ["formula-sheet-H"] }],
        prerequisiteUnits: [],
        series: ["November", "Summer"],
      },
      {
        code: "M8",
        title: "Unit M8: Higher Tier",
        tier: "H",
        weighting: 55,
        umsMax: 220,
        umsScale: 220,
        papers: [
          { name: "Paper 1", minutes: 75, marks: 50, calculator: false, resources: ["formula-sheet-H"] },
          { name: "Paper 2", minutes: 75, marks: 50, calculator: true, resources: ["formula-sheet-H"] },
        ],
        prerequisiteUnits: ["M4"],
        series: ["Summer"],
      },
    ],
    strands: [{ id: "NA", title: "Number and algebra" }, { id: "GM", title: "Geometry and measures" }, { id: "HD", title: "Handling data" }],
    markLanguage,
    itemTypes: ["note", "we", "dx", "q", "ftm", "rp", "ins", "set", "mock"],
    answerKinds: ["numeric", "algebraic", "mcq", "text", "graph", "drawing", "table", "steps"],
    commandWordsFile: "exam-true/command-words.json",
    tariffsFile: "exam-true/tariffs.json",
    formulaSheetsFile: "exam-true/formula-sheets.json",
    externalProviders: [{ kind: "corbettmaths", label: "Corbettmaths", licenceNote: "Link only; no re-hosting" }],
  };

  test("a subject pack parses; unknown prerequisite units and duplicate mark codes fail", () => {
    expect(S.SubjectPack.safeParse(pack).success).toBe(true);
    const badPrereq = clone(pack);
    badPrereq.units[1]!.prerequisiteUnits = ["M3"];
    expectIssueAt(S.SubjectPack.safeParse(badPrereq), ["units", 1, "prerequisiteUnits", 0]);
    const dupCode = clone(markLanguage);
    dupCode.codes.push({ code: "M", meaning: "again" });
    expectIssueAt(S.MarkLanguageProfile.safeParse(dupCode), ["codes"]);
    expectIssueAt(S.SubjectPack.safeParse({ ...pack, itemTypes: ["essay"] }), ["itemTypes", 0]);
  });

  test("a statement parses", () => {
    const st: S.Statement = {
      id: "M4-HD-02",
      unit: "M4",
      strand: "HD",
      text: "construct and interpret histograms for grouped continuous data with unequal class intervals",
      tier: "H",
      teacherGuidance: "Use a histogram to estimate the mean or median of a distribution.",
      progressionOf: "M3-HD-02",
      topics: ["maths.m4.histograms"],
    };
    expect(S.Statement.safeParse(st).success).toBe(true);
    expectIssueAt(S.Statement.safeParse({ ...st, progressionOf: "histograms" }), ["progressionOf"]);
  });

  test("a topic parses; its id must end with its slug and flagged topics need sources", () => {
    const topic = clone(bundle.topic);
    expect(S.Topic.safeParse(topic).success).toBe(true);
    expectIssueAt(S.Topic.safeParse({ ...topic, slug: "histogram" }), ["id"]);
    expectIssueAt(S.Topic.safeParse({ ...topic, examinerSources: [] }), ["examinerSources"]);
    expectIssueAt(S.Topic.safeParse({ ...topic, prerequisites: [topic.id] }), ["prerequisites"]);
  });

  test("note frontmatter parses and needs a ver. reference and an ISO date", () => {
    const note = clone(bundle.note!);
    expect(S.NoteFrontmatter.safeParse(note).success).toBe(true);
    expect(S.NoteFrontmatter.safeParse({ ...note, calculator: "P1-no/P2-yes" }).success).toBe(true);
    expectIssueAt(S.NoteFrontmatter.safeParse({ ...note, verification: "verified" }), ["verification"]);
    expectIssueAt(S.NoteFrontmatter.safeParse({ ...note, updated: "5 September 2026" }), ["updated"]);
  });

  test("practice sets and mocks parse; a mock's marks must add up", () => {
    expect(S.PracticeSet.safeParse(bundle.sets![0]).success).toBe(true);
    const mock: S.MockPaper = {
      id: "mock.maths.m4.2026-11.a",
      subject: "maths",
      paper: { unit: "M4", calculator: true, resources: ["formula-sheet-H"] },
      tier: "H",
      title: "M4 mock A",
      minutes: 120,
      totalMarks: 100,
      questions: [{ questionId: "q.maths.m4.histograms.0001", marks: 8 }, { questionId: "q.maths.m4.bounds.0002", marks: 92 }],
      verification: "ver.mock.maths.m4.2026-11.a",
      version: 1,
    };
    expect(S.MockPaper.safeParse(mock).success).toBe(true);
    expectIssueAt(S.MockPaper.safeParse({ ...mock, totalMarks: 99 }), ["totalMarks"]);
  });
});

// ---------------------------------------------------------------------------
// the topic bundle
// ---------------------------------------------------------------------------

describe("TopicBundle", () => {
  test("the histograms fixture parses as a complete bundle", () => {
    expect(bundle.topic.id).toBe("maths.m4.histograms");
    expect(bundle.note?.id).toBe("note.maths.m4.histograms");
    expect(bundle.workedExamples).toHaveLength(1);
    expect(bundle.diagnostics[0]!.items[0]!.options).toHaveLength(4);
    expect(bundle.questions[0]!.totalMarks).toBe(8);
    expect(bundle.findTheMistake).toHaveLength(1);
    expect(bundle.prompts).toHaveLength(2);
    expect(bundle.insight?.findings[0]!.source).toBe(CER);
    expect(bundle.verification.map((v) => v.itemId)).toEqual([bundle.note!.id, bundle.workedExamples[0]!.id, bundle.questions[0]!.id]);
  });

  test("an item from another topic fails at its topic path", () => {
    const b = clone(histogramsJson);
    b.prompts[1]!.topic = "maths.m4.stratified-sampling";
    expectIssueAt(S.TopicBundle.safeParse(b), ["prompts", 1, "topic"]);
  });

  test("a verification reference must resolve to a log for that item", () => {
    const dangling = clone(histogramsJson);
    dangling.questions[0]!.verification = "ver.q.maths.m4.histograms.9999";
    expectIssueAt(S.TopicBundle.safeParse(dangling), ["questions", 0, "verification"]);

    const wrongItem = clone(histogramsJson);
    wrongItem.verification[2]!.itemId = "q.maths.m4.histograms.0002";
    const r = S.TopicBundle.safeParse(wrongItem);
    expectIssueAt(r, ["questions", 0, "verification"]);
    expectIssueAt(r, ["verification", 2, "itemId"]);
  });

  test("duplicate ids across the bundle fail", () => {
    const b = clone(histogramsJson);
    b.prompts[1]!.id = b.prompts[0]!.id;
    expectIssueAt(S.TopicBundle.safeParse(b), ["topic", "id"]);
  });

  test("every spec ref in the fixture exists in data/spec", () => {
    const refs = bundleSpecRefs(bundle);
    expect(refs).toEqual(["M4-HD-02", "M4-HD-01"]);
    expect(unknownSpecRefs(refs, "maths")).toEqual([]);
  });
});

// ---------------------------------------------------------------------------
// JSON Schema export
// ---------------------------------------------------------------------------

describe("JSON Schema export", () => {
  test("builds the twelve named schemas with $defs for shared types", () => {
    const built = buildJsonSchemas();
    expect(built.map((b) => b.name)).toEqual(JSON_SCHEMA_NAMES);
    expect(built).toHaveLength(12);
    for (const { name, fileName, schema } of built) {
      expect(schema.$schema).toBe("https://json-schema.org/draft/2020-12/schema");
      expect(schema.$id).toBe(fileName);
      expect(schema.title).toBe(name);
    }
    const question = built.find((b) => b.name === "Question")!.schema;
    const defs = question.$defs as Record<string, unknown>;
    for (const shared of ["Tolerance", "AnswerSpec", "MarkPoint", "FigureSpec", "ExaminerSource"]) expect(defs, shared).toHaveProperty(shared);
    expect(schemaFileName("TopicBundle")).toBe("topic-bundle.schema.json");
  });

  test("writes one file per schema to the output directory", async () => {
    const dir = mkdtempSync(join(tmpdir(), "ccea-schema-"));
    try {
      const written = await writeJsonSchemas(dir);
      expect(written).toHaveLength(12);
      for (const file of written) {
        expect(existsSync(file)).toBe(true);
        const parsed = JSON.parse(readFileSync(file, "utf8")) as { title: string };
        expect(JSON_SCHEMA_NAMES).toContain(parsed.title);
      }
      expect(existsSync(join(dir, "topic-bundle.schema.json"))).toBe(true);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });
});

// ---------------------------------------------------------------------------
// ids
// ---------------------------------------------------------------------------

describe("ids", () => {
  test("topic ids round-trip through makeTopicId and parseTopicId", () => {
    expect(makeTopicId("maths", "M4", "histograms")).toBe("maths.m4.histograms");
    expect(makeTopicId("further-maths", "FM1", "algebraic-fractions-add-subtract")).toBe("fm.u1.algebraic-fractions-add-subtract");
    expect(makeTopicId("further-maths", "U2", "force-diagrams")).toBe("fm.u2.force-diagrams");
    expect(makeTopicId("science", "P1", "kinetic-energy")).toBe("science.p1.kinetic-energy");
    expect(makeTopicId("science", "7", "planning")).toBe("science.u7.planning");
    expect(makeTopicId("science", "practicals", "c5")).toBe("science.practicals.c5");
    expect(makeTopicId("english-language", "1", "analyse-language")).toBe("english-language.1.analyse-language");

    expect(parseTopicId("fm.u1.algebraic-fractions-add-subtract")).toEqual({
      subject: "further-maths",
      alias: "fm",
      unit: "FM1",
      unitSegment: "u1",
      slug: "algebraic-fractions-add-subtract",
    });
    expect(parseTopicId("maths.m4.histograms").unit).toBe("M4");
    expect(parseTopicId("science.u7.planning").unit).toBe("U7");
    expect(parseTopicId("science.practicals.c5").unit).toBe("practicals");
    expect(tryParseTopicId("histograms")).toBeNull();
    expect(() => parseTopicId("Maths.M4.Histograms")).toThrow(/Invalid topic id/);
    expect(() => makeTopicId("maths", "M4", "Histograms!")).toThrow(/slug/);
  });

  test("statementIdsFor loads every id family from data/spec", () => {
    expect(statementIdsFor("maths").size).toBe(218);
    expect(statementIdsFor("further-maths").size).toBe(61);
    const science = statementIdsFor("science");
    expect(science.size).toBe(419 + 18 + 24);
    expect(science.has("DA-P1-1.4.17")).toBe(true);
    expect(science.has("DA-PRAC-C5")).toBe(true);
    expect(science.has("DA-U7-plan-3")).toBe(true);
    expect(science.has("DA-U7-plan-8")).toBe(true);
    expect(science.has("DA-U7-plan-9")).toBe(false);
    expect(science.has("DA-U7-carry-1")).toBe(true);
    expect(science.has("DA-U7-conclude-9")).toBe(true);
    expect(statementIdsFor("fm")).toBe(statementIdsFor("further-maths"));
    expect(() => statementIdsFor("english-language")).toThrow(/No spec data/);
  });

  test("isSpecRef validators check existence, not just shape", () => {
    const maths = isSpecRef("maths");
    expect(maths("M4-HD-02")).toBe(true);
    expect(maths("M4-HD-99")).toBe(false);
    expect(maths("FM1-ALF-01")).toBe(false);
    expect(isSpecRef("further-maths")("FM1-ALF-01")).toBe(true);
    expect(isSpecRef("science")("DA-B1-1.1.1")).toBe(true);
    expect(isSpecRef("science")("DA-B1-9.9.9")).toBe(false);
    expect(isKnownSpecRef("M4-HD-02")).toBe(true);
    expect(isKnownSpecRef("DA-PRAC-C5")).toBe(true);
    expect(isKnownSpecRef("GM-M4-HD-2")).toBe(false);
    expect(subjectOfSpecRef("FM2-FOR-01")).toBe("further-maths");
    expect(subjectOfSpecRef("XX-1")).toBeNull();
    expect(unknownSpecRefs(["M4-HD-02", "M4-HD-02", "M4-HD-99", "DA-P1-1.4.17", "GM-M4-HD-2"])).toEqual(["M4-HD-99", "GM-M4-HD-2"]);
  });

  test("item ids are built and parsed with their prefix", () => {
    expect(makeItemId("q", "maths.m4.histograms", 1)).toBe("q.maths.m4.histograms.0001");
    expect(makeItemId("we", "maths.m4.histograms", 1)).toBe("we.maths.m4.histograms.01");
    expect(makeItemId("ins", "maths.m4.histograms")).toBe("ins.maths.m4.histograms");
    expect(S.QuestionId.safeParse(makeItemId("q", "maths.m4.histograms", 12)).success).toBe(true);
    expect(parseItemId("ver.note.maths.m4.histograms")).toEqual({ prefix: "ver", tail: "note.maths.m4.histograms" });
    expect(parseItemId("question.0001")).toBeNull();
    expect(parseItemId("q.Bad")).toBeNull();
    expect(() => makeItemId("q", "histograms")).toThrow(/Invalid topic id/);
  });
});
