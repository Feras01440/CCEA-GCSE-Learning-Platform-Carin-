/**
 * Note-block checks: every gate marks its own answer correct, every choice gate's answer is one of
 * its options, the video block is followed by a gate, prompt ids exist, and no stretch of prose
 * runs past ~150 words without a gate.
 *
 * Run: npx tsx scratchpad/subject/check-note.mts
 */
import fs from "node:fs";
import path from "node:path";
import { markGate, gateAlternatives, type NoteBlock } from "../../src/components/items/gates.ts";

const DIR = path.resolve("packs/maths/content/m7/changing-the-subject-harder-formulae");
const blocks: NoteBlock[] = JSON.parse(fs.readFileSync(path.join(DIR, "note.blocks.json"), "utf8"));
const bundle = JSON.parse(fs.readFileSync(path.join(DIR, "bundle.json"), "utf8"));
const promptIds = new Set<string>(bundle.prompts.map((p: { id: string }) => p.id));

let fails = 0;
const fail = (m: string) => {
  fails++;
  console.log(`  FAIL ${m}`);
};

let gates = 0;
let wordsSinceGate = 0;
let sawVideo = false;
let videoFollowedByGate = false;
const words = (s: string) => s.split(/\s+/).filter(Boolean).length;

blocks.forEach((b, i) => {
  if (b.type === "p") wordsSinceGate += words(b.md);
  if (b.type === "callout") wordsSinceGate += words(b.md);
  if (b.type === "gate") {
    gates++;
    if (wordsSinceGate > 170) fail(`${wordsSinceGate} words of prose before gate ${b.id} (limit ~150)`);
    wordsSinceGate = 0;
    for (const alt of gateAlternatives(b.answer)) {
      if (!markGate(b, alt)) fail(`gate ${b.id}: its own answer "${alt}" does not mark as correct`);
    }
    if (b.kind === "choice") {
      if (!b.options?.length) fail(`gate ${b.id} is a choice gate with no options`);
      else if (!b.options.includes(b.answer)) fail(`gate ${b.id}: answer is not one of its options`);
    }
    if (!b.explain?.trim()) fail(`gate ${b.id} has no explain`);
  }
  if (b.type === "video") {
    sawVideo = true;
    const next = blocks[i + 1];
    if (next?.type === "gate") videoFollowedByGate = true;
  }
  if (b.type === "prompt" && !promptIds.has(b.promptId)) fail(`prompt block references unknown id ${b.promptId}`);
  if (b.type === "figure" && !b.alt?.trim()) fail("figure without alt text");
});

if (!sawVideo) fail("no video block in the see-it step");
if (sawVideo && !videoFollowedByGate) fail("the video block is not followed by a gate");
if (wordsSinceGate > 260) fail(`${wordsSinceGate} words of prose after the last gate`);

const media = JSON.parse(fs.readFileSync(path.resolve("data/links/media-map.json"), "utf8"));
const entry = media.topics["maths:changing-the-subject-harder-formulae"];
const videoBlock = blocks.find((b) => b.type === "video") as Extract<NoteBlock, { type: "video" }> | undefined;
if (videoBlock && !entry.videos.some((v: { videoId: string }) => v.videoId === videoBlock.videoId)) {
  fail(`video id ${videoBlock.videoId} is not in data/links/media-map.json for this topic`);
}

console.log(
  `${blocks.length} blocks, ${gates} gates, ${blocks.filter((b) => b.type === "figure").length} figures, ` +
    `${blocks.filter((b) => b.type === "callout").length} callouts, ${blocks.filter((b) => b.type === "prompt").length} prompt refs, ` +
    `video ${videoBlock?.videoId} (verified in media-map, followed by a gate: ${videoFollowedByGate})`,
);
console.log(`${fails} failure(s).`);
process.exitCode = fails ? 1 : 0;
