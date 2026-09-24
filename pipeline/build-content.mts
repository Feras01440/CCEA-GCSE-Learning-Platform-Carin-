/**
 * Content build (plan §3.7 / P0-10, Phase 0 form).
 *
 *   packs/<subject>/content/<unit>/<topic>/bundle.json       TopicBundle (validated with the Zod schema)
 *   packs/<subject>/content/<unit>/<topic>/note.blocks.json  StepRevealNote blocks (optional)
 *
 * Writes:
 *   public/content/<subject>/<topicId>.json   the shippable bundle (items whose verification status is verified/published)
 *   src/generated/manifest.json               route + coverage manifest consumed by the app
 *
 * Run: npx tsx pipeline/build-content.mts   (also runs before `next build`)
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { TopicBundle, type VerificationLog } from "../src/lib/content/schema.ts";
import { lintKeyWords } from "../src/components/items/keyword-lint.ts";
import { figureLeakWarnings, lintContent, lintNoteBlocks } from "../src/components/items/content-lint.ts";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const PACKS = path.join(ROOT, "packs");
const OUT_PUBLIC = path.join(ROOT, "public", "content");
const OUT_MANIFEST = path.join(ROOT, "src", "generated", "manifest.json");

const SHIPPABLE = new Set(["verified", "published"]);

type ManifestTopic = {
  id: string;
  subject: string;
  unit: string;
  slug: string;
  title: string;
  hardness: string;
  difficulty: number;
  counts: Record<string, number>;
  hasNote: boolean;
  hasBlocks: boolean;
  version: string;
};

function walk(dir: string, out: string[] = []): string[] {
  if (!fs.existsSync(dir)) return out;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(p, out);
    else if (entry.name === "bundle.json") out.push(p);
  }
  return out;
}

/**
 * Items that carry a `verification` ref (note, worked examples, questions) are looked up by that ref.
 * Diagnostic sets, find-the-mistake items and retrieval prompts have no such field in the schema,
 * so their log is found by `itemId` instead; with no log at all they stay "draft" and are not shipped.
 */
function statusOf(logs: VerificationLog[], ref: string | undefined, itemId?: string): string {
  const log = ref ? logs.find((l) => l.id === ref) : itemId ? logs.find((l) => l.itemId === itemId) : undefined;
  return log?.status ?? "draft";
}

const files = walk(PACKS);
const manifest: { generatedAt: string; topics: ManifestTopic[]; problems: string[] } = {
  generatedAt: new Date().toISOString(),
  topics: [],
  problems: [],
};

// public/content is never emptied first: `next build` in the other session copies public/ while this runs, and a
// wiped folder ships an export with no lessons. Every file is overwritten in place and stale ones go at the end.
const written = new Set<string>();
const keyWordWarnings = { hard: 0, soft: 0 };
let figureWarnings = 0;

for (const file of files) {
  const text = fs.readFileSync(file, "utf8");
  // A generator's "${…}" that was never expanded is always wrong in learner-facing text.
  const leaks = (src: string, label: string) => {
    const n = (src.match(/\$\{/g) ?? []).length;
    if (n > 0) {
      const msg = `${label}: ${n} unexpanded template placeholder(s) "\${…}" in published text`;
      manifest.problems.push(msg);
      console.error("INVALID", msg);
    }
    return n > 0;
  };
  if (leaks(text, path.relative(ROOT, file))) continue;
  const raw = JSON.parse(text);
  const parsed = TopicBundle.safeParse(raw);
  if (!parsed.success) {
    const msg = `${path.relative(ROOT, file)}: ${parsed.error.issues.slice(0, 5).map((i) => `${i.path.join(".")}: ${i.message}`).join("; ")}`;
    manifest.problems.push(msg);
    console.error("INVALID", msg);
    continue;
  }
  const b = parsed.data;
  // Structural defects a generator can produce (duplicate options, a common error equal to the answer, a
  // float artefact in a value) are always wrong: reported as problems, and the bundle is not published.
  const defects = lintContent(raw, path.relative(PACKS, path.dirname(file)).split(path.sep).join("/"));
  if (defects.length > 0) {
    for (const d of defects) console.error("INVALID", d);
    manifest.problems.push(...defects);
    continue;
  }
  // Key-word groups no accepted answer can earn are an authoring slip, not a schema error: reported, never fatal.
  // A question figure that prints one of its parts' answers: warned, never fatal on its own.
  for (const w of figureLeakWarnings(raw, path.relative(PACKS, path.dirname(file)).split(path.sep).join("/"))) {
    console.warn("FIGURE", w);
    figureWarnings += 1;
  }
  const kw = lintKeyWords(raw, path.relative(PACKS, path.dirname(file)).split(path.sep).join("/"));
  for (const w of kw.hard) console.warn("KEYWORDS", w);
  keyWordWarnings.hard += kw.hard.length;
  keyWordWarnings.soft += kw.soft.length;
  const logs = b.verification;
  const keep = <T extends { verification?: string; id: string }>(items: T[] | undefined) =>
    (items ?? []).filter((it) => SHIPPABLE.has(statusOf(logs, it.verification, it.id)));

  const blocksPath = path.join(path.dirname(file), "note.blocks.json");
  const blocksText = fs.existsSync(blocksPath) ? fs.readFileSync(blocksPath, "utf8") : null;
  if (blocksText !== null && leaks(blocksText, path.relative(ROOT, blocksPath))) continue;
  const noteBlocks = blocksText !== null ? JSON.parse(blocksText) : null;
  // A note figure that draws nothing (path data as text, a path without d, an empty SVG) is a generator slip too.
  const noteDefects = lintNoteBlocks(noteBlocks, path.relative(PACKS, path.dirname(file)).split(path.sep).join("/"));
  if (noteDefects.length > 0) {
    for (const d of noteDefects) console.error("INVALID", d);
    manifest.problems.push(...noteDefects);
    continue;
  }
  const noteOk = b.note ? SHIPPABLE.has(statusOf(logs, b.note.verification)) : false;

  const shipped = {
    topic: b.topic,
    note: noteOk ? b.note : null,
    noteBlocks: noteOk ? noteBlocks : null,
    workedExamples: keep(b.workedExamples),
    diagnostics: keep(b.diagnostics),
    questions: keep(b.questions),
    findTheMistake: keep(b.findTheMistake),
    prompts: keep(b.prompts),
    insight: b.insight ?? null,
    sets: b.sets ?? [],
    verification: logs,
  };

  const counts = {
    we: shipped.workedExamples.length,
    dx: shipped.diagnostics.reduce((n, d) => n + d.items.length, 0),
    q: shipped.questions.length,
    ftm: shipped.findTheMistake.length,
    rp: shipped.prompts.length,
  };

  const outDir = path.join(OUT_PUBLIC, b.topic.subject);
  fs.mkdirSync(outDir, { recursive: true });
  const outFile = path.join(outDir, `${b.topic.id}.json`);
  fs.writeFileSync(outFile, JSON.stringify(shipped));
  written.add(path.resolve(outFile));

  manifest.topics.push({
    id: b.topic.id,
    subject: b.topic.subject,
    unit: b.topic.unit,
    slug: b.topic.slug,
    title: b.topic.title,
    hardness: b.topic.hardness,
    difficulty: b.topic.difficulty,
    counts,
    hasNote: noteOk,
    hasBlocks: noteOk && !!noteBlocks,
    version: String(b.note?.version ?? 1),
  });
  console.log(`ok   ${b.topic.id}  we ${counts.we} · dx ${counts.dx} · q ${counts.q} · ftm ${counts.ftm} · rp ${counts.rp}${noteOk ? " · note" : ""}`);
}

fs.mkdirSync(path.dirname(OUT_MANIFEST), { recursive: true });
fs.writeFileSync(OUT_MANIFEST, JSON.stringify(manifest, null, 2));

// Bundles that no longer publish (renamed, withdrawn) leave the folder now that the new set is complete.
function listFiles(dir: string, out: string[] = []): string[] {
  if (!fs.existsSync(dir)) return out;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) listFiles(p, out);
    else out.push(p);
  }
  return out;
}
for (const stale of listFiles(OUT_PUBLIC).filter((p) => !written.has(path.resolve(p)))) fs.rmSync(stale, { force: true });
console.log(
  `\n${manifest.topics.length} topic bundle(s) published, ${manifest.problems.length} problem(s), ${keyWordWarnings.hard} key-word warning(s)` +
    `${keyWordWarnings.soft ? ` (+${keyWordWarnings.soft} earned only by the part's own wording)` : ""}${figureWarnings ? `, ${figureWarnings} figure(s) printing an answer` : ""}. Manifest → ${path.relative(ROOT, OUT_MANIFEST)}`,
);
// An invalid bundle is skipped (never shipped) and reported. `--strict` (used by `npm run content:check`
// and by authors) turns problems into a failing exit code; the app build keeps publishing the valid bundles.
const strict = process.argv.includes("--strict");
if (manifest.problems.length && strict) process.exitCode = 1;
if (manifest.problems.length && !strict) console.error(`\nWARNING: ${manifest.problems.length} bundle(s) skipped; run \`npm run content:check\` for the failing exit code.`);
