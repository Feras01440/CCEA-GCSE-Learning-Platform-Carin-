import fs from "node:fs";
import path from "node:path";
import type { SeeBlock } from "@/components/items/gates";
import { resolveSee } from "@/lib/slides/see";

/**
 * The lab's cases: the longest See its in the shipped content (public/content, read at build time), by the words of
 * the stem, every working line, every reason and the answer line, each resolved as the renderer resolves it (so what
 * the lab says a case has, an answer line for one, is what the card shows). Server-only (the static route calls it once).
 */
export interface LabCase {
  subject: string;
  unit: string;
  slug: string;
  topicId: string;
  title: string;
  /** The See it's index in the note's blocks. */
  block: number;
  /** Which See it of the topic this is (1-based) and how many the topic has. */
  nth: number;
  seeCount: number;
  steps: number;
  words: number;
  figure: boolean;
  answer: boolean;
  typed: boolean;
  stem: string;
}

const words = (s: unknown) => (typeof s === "string" ? s.split(/\s+/).filter(Boolean).length : 0);

interface Step {
  working?: string;
  decision?: string;
  input?: unknown;
}

/** The topics the build made ready for Slides (src/generated/manifest.json, as e2e/content.ts reads it): the lab ranks only their See its. */
function readyIds(): Set<string> {
  try {
    const m = JSON.parse(fs.readFileSync(path.join(process.cwd(), "src", "generated", "manifest.json"), "utf8")) as { topics?: Array<{ id: string; hasBlocks?: boolean; ready?: unknown }> };
    return new Set((m.topics ?? []).filter((t) => t.hasBlocks && t.ready === true).map((t) => t.id));
  } catch {
    return new Set();
  }
}

export function labCases(limit = 12): LabCase[] {
  const root = path.join(process.cwd(), "public", "content");
  const ready = readyIds();
  const out: LabCase[] = [];
  for (const subject of fs.readdirSync(root)) {
    const dir = path.join(root, subject);
    if (!fs.statSync(dir).isDirectory()) continue;
    for (const file of fs.readdirSync(dir)) {
      if (!file.endsWith(".json")) continue;
      if (!ready.has(file.replace(/\.json$/, ""))) continue;
      let bundle: { topic?: { id?: string; unit?: string; slug?: string; title?: string }; noteBlocks?: unknown[]; workedExamples?: Array<{ id: string; stem: string; steps: Step[]; finalAnswer?: string; figure?: unknown }> };
      try {
        bundle = JSON.parse(fs.readFileSync(path.join(dir, file), "utf8"));
      } catch {
        continue;
      }
      const blocks = bundle.noteBlocks ?? [];
      const sees = blocks.map((b, i) => ({ b: b as { type?: string }, i })).filter(({ b }) => b && b.type === "see");
      sees.forEach(({ b, i }, k) => {
        const see = resolveSee(b as unknown as SeeBlock, (bundle.workedExamples ?? []) as unknown as Parameters<typeof resolveSee>[1]);
        if (!see) return;
        const steps: Step[] = see.steps;
        out.push({
          subject,
          unit: bundle.topic?.unit ?? "",
          slug: bundle.topic?.slug ?? "",
          topicId: bundle.topic?.id ?? file.replace(/\.json$/, ""),
          title: bundle.topic?.title ?? "",
          block: i,
          nth: k + 1,
          seeCount: sees.length,
          steps: steps.length,
          words: words(see.stem) + steps.reduce((a, s) => a + words(s.working) + words(s.decision), 0) + words(see.finalAnswer),
          figure: see.figure !== null,
          answer: see.finalAnswer !== null,
          // The topic's first See it is shown, never typed (src/lib/slides/see.ts typedStep), as the card draws it.
          typed: k > 0 && see.workedExample === null && steps.some((s) => s.input !== undefined),
          stem: see.stem,
        });
      });
    }
  }
  out.sort((a, b) => b.words - a.words || a.topicId.localeCompare(b.topicId) || a.block - b.block);
  return out.slice(0, limit);
}

/** The card route's address for a case: the hash carries the subject folder, the topic id and the block index. */
export const labCardHref = (c: Pick<LabCase, "subject" | "topicId" | "block">) => `/lab/see-its/card/#${c.subject}/${c.topicId}/${c.block}`;
