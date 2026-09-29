/**
 * For tests only (node): every topic the packs hold, read straight from packs/<subject>/content/<unit>/<slug>/
 * {note.blocks.json, bundle.json} (the lead, 27 Sep 2026: never public/content, which the content build rewrites while
 * the authors run it). Never import this from app code: it reads the file system.
 */
import fs from "node:fs";
import path from "node:path";
import type { RetrievalPrompt, WorkedExample } from "@/lib/content/schema";

export interface PackTopic {
  /** "further-maths/fm1/algebraic-fractions-simplify" */
  file: string;
  /** The bundle's topic id, "fm.u1.algebraic-fractions-simplify", or the file path when the bundle is missing. */
  topicId: string;
  blocks: unknown[];
  bundle: {
    note?: { verification?: string } | null;
    verification?: unknown[];
    prompts: RetrievalPrompt[];
    workedExamples: WorkedExample[];
  };
}

const ROOT = path.resolve(__dirname, "../../..");

/** The trial topic (fm1/algebraic-fractions-simplify), whose deck and drawings the Slides tests check against its note. */
export const TRIAL_ID = "fm.u1.algebraic-fractions-simplify";

/**
 * The trial's folder in the packs; or the folder SLIDES_TRIAL_DIR names, to run the same tests on another version of its
 * note and bundle (the committed one, a draft): `SLIDES_TRIAL_DIR=<folder> npx vitest run src/lib/slides`. The tests
 * read every id, count and prompt from here, so they hold on whichever version the content session commits.
 */
export function trialDir(): string {
  return process.env.SLIDES_TRIAL_DIR || path.join(ROOT, "packs", "further-maths", "content", "fm1", "algebraic-fractions-simplify");
}

/** The trial's note blocks, its bundle's retrieval prompts and worked examples, as trialDir() holds them. */
export function trialNote(): { blocks: unknown[]; prompts: RetrievalPrompt[]; workedExamples: WorkedExample[] } {
  const dir = trialDir();
  const bundle = JSON.parse(fs.readFileSync(path.join(dir, "bundle.json"), "utf8")) as { prompts?: RetrievalPrompt[]; workedExamples?: WorkedExample[] };
  return {
    blocks: JSON.parse(fs.readFileSync(path.join(dir, "note.blocks.json"), "utf8")) as unknown[],
    prompts: bundle.prompts ?? [],
    workedExamples: bundle.workedExamples ?? [],
  };
}

export function packTopics(): PackTopic[] {
  const out: PackTopic[] = [];
  const packs = path.join(ROOT, "packs");
  for (const subject of fs.readdirSync(packs)) {
    const content = path.join(packs, subject, "content");
    if (!fs.existsSync(content)) continue;
    for (const unit of fs.readdirSync(content)) {
      const unitDir = path.join(content, unit);
      if (!fs.statSync(unitDir).isDirectory()) continue;
      for (const topic of fs.readdirSync(unitDir)) {
        const dir = path.join(unitDir, topic);
        const noteFile = path.join(dir, "note.blocks.json");
        if (!fs.existsSync(noteFile)) continue;
        const bundleFile = path.join(dir, "bundle.json");
        const raw = fs.existsSync(bundleFile) ? (JSON.parse(fs.readFileSync(bundleFile, "utf8")) as Record<string, unknown>) : {};
        const file = `${subject}/${unit}/${topic}`;
        out.push({
          file,
          topicId: typeof (raw.topic as { id?: unknown } | undefined)?.id === "string" ? (raw.topic as { id: string }).id : file,
          blocks: JSON.parse(fs.readFileSync(noteFile, "utf8")) as unknown[],
          bundle: {
            note: (raw.note as { verification?: string } | undefined) ?? null,
            verification: (raw.verification as unknown[] | undefined) ?? [],
            prompts: (raw.prompts as RetrievalPrompt[] | undefined) ?? [],
            workedExamples: (raw.workedExamples as WorkedExample[] | undefined) ?? [],
          },
        });
      }
    }
  }
  return out;
}
