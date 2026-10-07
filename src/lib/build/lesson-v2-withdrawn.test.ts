import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

/**
 * lesson-v2 reads no withdrawn item (the lead, 7 Oct 2026, after the M4 author restored 19 withdrawn items and the depth
 * "maths" line counted their worked solutions): every line that reads the bundle's items reads it through
 * scripts/qa/shingles-allow.mjs withoutWithdrawn (an id in a withdrawn record, a diagnostic item as set#item, or an item
 * whose own log says withdrawn); the withdrawn-record check alone reads the whole bundle, because the records are its
 * subject. The script runs as authors run it, on a packs folder of one topic in a temporary directory.
 */

const REPO = path.resolve(__dirname, "../../..");
const ON = "2026-10-07T21:00:00Z";
const LONG = `$${"x^{2}+".repeat(14)}1$`; // an inline segment of more than 60 characters
const WORDS30 = Array.from({ length: 30 }, (_, i) => `word${i}`).join(" ");
const log = (id: string, itemId: string, status: string, withdrawn?: unknown[]) => ({ id, itemId, version: 1, checks: [], status, reports: [], ...(withdrawn ? { withdrawn } : {}) });
const question = (id: string) => ({
  id,
  verification: `ver.${id}`,
  style: "practice",
  difficulty: 3,
  totalMarks: 2,
  parts: [{ id: "a", stem: "Simplify it.", marks: 2, answer: { kind: "numeric", value: 1 }, workedSolution: `So ${LONG} gives 1.` }],
});
const bundle = {
  topic: { id: "maths.m4.fixture", subject: "maths", unit: "M4", slug: "fixture", title: "Fixture", hardness: "S", difficulty: 3, statementIds: [], examinerSources: [] },
  note: { id: "note.fixture", verification: "ver.note", sheet: { traps: [] }, formulaSheet: { mustKnow: [] } },
  questions: [question("q.live"), question("q.gone")],
  workedExamples: [],
  diagnostics: [],
  findTheMistake: [],
  prompts: [
    { id: "rp.live", kind: "definition", prompt: "What is one?", answer: "One." },
    // withdrawn by a record only: its own log still says verified, as a record-only withdrawal leaves it
    { id: "rp.gone", kind: "definition", prompt: "What is two?", answer: WORDS30 },
  ],
  sets: [],
  verification: [
    log("ver.note", "note.fixture", "verified", [{ id: "rp.gone", kind: "prompt", replacedBy: null, reason: "Over the cap.", on: ON }]),
    log("ver.q.live", "q.live", "verified"),
    log("ver.q.gone", "q.gone", "withdrawn", [{ id: "q.gone", kind: "question", replacedBy: "q.live", reason: "Reissued.", on: ON }]),
    log("ver.rp.live", "rp.live", "verified"),
    log("ver.rp.gone", "rp.gone", "verified"),
  ],
};
const blocks = [
  { type: "hero", lede: "A lede.", can: ["Do a", "Do b", "Do c"], minutes: 8 },
  { type: "h", text: "The idea", role: "idea" },
  { type: "p", md: "Words." },
  { type: "callout", kind: "why", title: "Why", md: "Because." },
  { type: "h", text: "You can now", role: "recap" },
  { type: "p", md: "One.\nTwo.\nThree." },
  { type: "h", text: "In the exam", role: "pointer" },
  { type: "p", md: "A pointer." },
];

let dir = "";
let report: { depth: Array<{ slug: string; maths: string[]; rows: Array<{ name: string; value: unknown }> }>; prompts: Array<{ findings: Array<{ detail: string }> }>; withdrawnSummary: { records: number } };

beforeAll(() => {
  dir = fs.mkdtempSync(path.join(os.tmpdir(), "lesson-v2-withdrawn-"));
  const topic = path.join(dir, "packs", "maths", "content", "m4", "fixture");
  fs.mkdirSync(topic, { recursive: true });
  fs.writeFileSync(path.join(topic, "bundle.json"), JSON.stringify(bundle));
  fs.writeFileSync(path.join(topic, "note.blocks.json"), JSON.stringify(blocks));
  fs.mkdirSync(path.join(dir, "scripts", "qa"), { recursive: true });
  fs.copyFileSync(path.join(REPO, "scripts", "qa", "gate-context.mjs"), path.join(dir, "scripts", "qa", "gate-context.mjs"));
  const run = spawnSync(process.execPath, [path.join(REPO, "scripts", "qa", "lesson-v2.mjs"), "--json"], { cwd: dir, encoding: "utf8", env: { ...process.env, TSX_TSCONFIG_PATH: path.join(REPO, "tsconfig.json") } });
  report = JSON.parse(run.stdout);
}, 60_000);

afterAll(() => {
  if (dir) fs.rmSync(dir, { recursive: true, force: true });
});

describe("lesson-v2 reads no withdrawn item", () => {
  it("counts only the live question's worked solution on the depth maths line", () => {
    const maths = report.depth.find((d) => d.slug === "fixture")?.maths ?? [];
    expect(maths.join("\n")).toMatch(/^1 inline segment\(s\) over 60 characters/);
  });

  it("does not hold a prompt withdrawn by a record to the prompt caps, nor count it on the depth row", () => {
    const details = report.prompts.flatMap((n) => n.findings.map((f) => f.detail)).join("\n");
    expect(details).not.toContain("rp.gone");
    const rp = report.depth.find((d) => d.slug === "fixture")?.rows.find((r) => r.name === "retrieval prompts");
    expect(rp?.value).toBe(1);
  });

  it("still reads every withdrawn record (they are the withdrawn check's subject)", () => {
    expect(report.withdrawnSummary.records).toBe(2);
  });
});
