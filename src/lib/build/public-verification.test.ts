/**
 * The verification logs the public bundle carries (public/content/<subject>/<id>.json), trimmed by the content build
 * (pipeline/build-content.mts through publicVerification, the lead's item 18 of 27 Sep 2026): the note's own log and every
 * log an exam-style question names are kept whole; every other log keeps its id, item, version, status and withdrawn
 * records, with its checks emptied. The guard: for every topic the packs hold (read from packs/, never public/content,
 * which the build rewrites while authors run it), nothing the app reads at runtime changes.
 */
import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import type { VerificationLog } from "@/lib/content/schema";
import { verificationFor, type ShippedBundle } from "@/lib/content/load";
import { withdrawnRecords } from "@/lib/review/withdrawn";
import { lessonReadiness } from "@/lib/slides/readiness";
import { publicVerification } from "./public-verification";

// the repository: three folders up from src/lib/build, or the working directory when the test is run from elsewhere
const ROOT = fs.existsSync(path.resolve(__dirname, "../../../packs")) ? path.resolve(__dirname, "../../..") : process.cwd();
const SHIPPABLE = new Set(["verified", "published"]);

type Raw = { topic?: { id?: string }; note?: { verification?: string } | null; questions?: Array<{ id: string; style?: string; verification?: string }>; verification?: VerificationLog[] };

/** Every topic of the packs as the build ships its logs: the bundle, its note blocks, its shipped questions. */
function packTopics(): Array<{ file: string; raw: Raw; blocks: unknown[] | null; questions: Array<{ id: string; style?: string; verification?: string }> }> {
  const out = [];
  const packs = path.join(ROOT, "packs");
  for (const subject of fs.readdirSync(packs)) {
    const content = path.join(packs, subject, "content");
    if (!fs.existsSync(content)) continue;
    for (const unit of fs.readdirSync(content)) {
      const unitDir = path.join(content, unit);
      if (!fs.statSync(unitDir).isDirectory()) continue;
      for (const topic of fs.readdirSync(unitDir)) {
        const bundleFile = path.join(unitDir, topic, "bundle.json");
        if (!fs.existsSync(bundleFile)) continue;
        let raw: Raw;
        try {
          raw = JSON.parse(fs.readFileSync(bundleFile, "utf8")) as Raw;
        } catch {
          continue; // a bundle mid-write by an author is the build's finding, not this test's
        }
        const noteFile = path.join(unitDir, topic, "note.blocks.json");
        const blocks = fs.existsSync(noteFile) ? (JSON.parse(fs.readFileSync(noteFile, "utf8")) as unknown[]) : null;
        const logs = raw.verification ?? [];
        const questions = (raw.questions ?? []).filter((q) => SHIPPABLE.has(String(logs.find((l) => l.id === q.verification)?.status)));
        out.push({ file: `${subject}/${unit}/${topic}`, raw, blocks, questions });
      }
    }
  }
  return out;
}

const log = (id: string, extra: Partial<VerificationLog> = {}): VerificationLog =>
  ({ id, itemId: id.replace(/^ver\./, ""), version: 1, status: "verified", checks: [{ type: "schema", tool: "t", result: "pass", detail: "A long detail.", at: "2026-09-27T20:00:00Z", by: "claude" }], reports: [], ...extra }) as VerificationLog;

describe("publicVerification: the rule", () => {
  it("keeps the note's log and every exam-style question's log whole, and trims the rest to their skeleton", () => {
    const withdrawn = [{ id: "g3", kind: "gate" as const, replacedBy: "g9", reason: "r", on: "2026-09-27T20:00:00Z" }];
    const logs = [log("ver.note.x", { withdrawn }), log("ver.q.exam"), log("ver.q.practice", { withdrawn: [{ id: "q.old", kind: "question", replacedBy: null, reason: "r", on: "2026-09-27T20:00:00Z" }] }), log("ver.we.1", { status: "withdrawn" })];
    const trimmed = publicVerification({ note: { verification: "ver.note.x" }, questions: [{ style: "exam-style", verification: "ver.q.exam" }, { style: "practice", verification: "ver.q.practice" }], verification: logs });
    expect(trimmed[0]).toEqual(logs[0]);
    expect(trimmed[1]).toEqual(logs[1]);
    expect(trimmed[2]).toEqual({ id: "ver.q.practice", itemId: "q.practice", version: 1, checks: [], status: "verified", reports: [], withdrawn: logs[2]!.withdrawn });
    expect(trimmed[3]).toEqual({ id: "ver.we.1", itemId: "we.1", version: 1, checks: [], status: "withdrawn", reports: [] });
    // the input is never changed: the packs stay complete
    expect(logs[2]!.checks).toHaveLength(1);
  });
});

describe("publicVerification: nothing the app reads changes, on every topic the packs hold", () => {
  const topics = packTopics();
  it("reads the packs (more than 150 topics)", () => {
    expect(topics.length).toBeGreaterThan(150);
  });

  it("keeps every withdrawn record, the readiness verdict, and every exam question's log", () => {
    const problems: string[] = [];
    let saved = 0;
    let before = 0;
    for (const t of topics) {
      const full = (t.raw.verification ?? []) as VerificationLog[];
      const trimmed = publicVerification({ note: t.raw.note ?? null, questions: t.questions, verification: full });
      before += JSON.stringify(full).length;
      saved += JSON.stringify(full).length - JSON.stringify(trimmed).length;
      if (JSON.stringify(withdrawnRecords({ verification: trimmed })) !== JSON.stringify(withdrawnRecords({ verification: full }))) problems.push(`${t.file}: withdrawn records differ`);
      const ready = (verification: VerificationLog[]) => lessonReadiness({ note: t.raw.note ?? null, noteBlocks: t.blocks, verification }).ready;
      if (ready(trimmed) !== ready(full)) problems.push(`${t.file}: readiness differs`);
      for (const q of t.questions.filter((x) => x.style === "exam-style")) {
        const a = verificationFor({ verification: trimmed } as ShippedBundle, q.verification);
        const b = verificationFor({ verification: full } as ShippedBundle, q.verification);
        if (JSON.stringify(a) !== JSON.stringify(b)) problems.push(`${t.file}: exam question ${q.id}'s log differs`);
      }
    }
    expect(problems, problems.slice(0, 5).join("\n")).toEqual([]);
    // the trim is worth doing: it removes most of what the logs weigh
    expect(saved / before).toBeGreaterThan(0.3);
  });
});
