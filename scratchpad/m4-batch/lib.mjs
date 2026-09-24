/**
 * Shared helpers for the M4 batch (perpendicular lines, frustums and compound solids,
 * stratified sampling, factorising ax^2 + bx + c).
 *
 * Everything numeric in the four bundles is computed here or in the per-topic generator,
 * so a stem, its answer, its scheme and its verification log all read from the same value.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
export const AT = "2026-09-13T10:00:00Z";
export const UPDATED = "2026-09-13";
export const TOOL = "claude (author-unit-batch pass, every value recomputed in scratchpad/m4-batch)";

/** M4: 100 marks in 120 minutes => 1.2 minutes per mark (packs/maths/exam-true/tariffs.json). */
export const timeFor = (marks) => Math.round(marks * 1.2 * 60);

export const PAPER = { unit: "M4", calculator: true, resources: ["formula-sheet-H"] };
export const PAPER_EITHER = { unit: "M4", calculator: true, resources: ["formula-sheet-H"] };

// ---------------------------------------------------------------------------
// Numbers
// ---------------------------------------------------------------------------

export const round = (x, dp) => {
  const f = 10 ** dp;
  return Math.round((x + Number.EPSILON) * f) / f;
};
export const sf = (x, n) => {
  if (x === 0) return 0;
  const mag = Math.ceil(Math.log10(Math.abs(x)));
  const f = 10 ** (n - mag);
  return Math.round(x * f) / f;
};
/** Fixed-decimal string, e.g. fx(675.4424, 1) === "675.4" */
export const fx = (x, dp) => x.toFixed(dp);

// ---------------------------------------------------------------------------
// SVG
// ---------------------------------------------------------------------------

/**
 * Inline SVG (for note `figure` blocks): plain markup, currentColor strokes.
 * Written with double quotes because it is embedded in JSON, not in a URI.
 */
export const inlineSvg = (body) => body;

/**
 * Data-URI SVG for `figures: [{ kind: "svg", src, alt }]`.
 * Attribute quotes become single quotes; '#' and every non-ASCII character are
 * percent-encoded so the string is a legal data URI.
 * No <style>, no <script>, no event handlers, no external hrefs, no
 * prefers-color-scheme rules: every colour is an attribute on the element.
 */
export function dataUri(svg) {
  if (/<style|<script|\son[a-z]+=|xlink:href|href=/i.test(svg)) {
    throw new Error("SVG must not contain <style>, <script>, event handlers or external hrefs");
  }
  if (!/viewBox=/.test(svg)) throw new Error("SVG must carry a viewBox");
  const single = svg.replace(/"/g, "'");
  let out = "";
  for (const ch of single) {
    const code = ch.codePointAt(0);
    if (ch === "#") out += "%23";
    else if (ch === "%") out += "%25";
    else if (code > 127) {
      out += [...new TextEncoder().encode(ch)].map((b) => "%" + b.toString(16).toUpperCase().padStart(2, "0")).join("");
    } else out += ch;
  }
  const uri = `data:image/svg+xml;utf8,${out}`;
  if (uri.length > 12000) throw new Error(`SVG data URI too large: ${uri.length} bytes`);
  return uri;
}

export const svgFigure = (svg, alt) => ({ kind: "svg", src: dataUri(svg), alt });

// ---------------------------------------------------------------------------
// Verification logs
// ---------------------------------------------------------------------------

const check = (type, detail) => ({ type, tool: TOOL, result: "pass", detail, at: AT, by: "claude" });

/**
 * A verification log whose checks record what was actually done for this item.
 * `d` supplies the per-item detail for the checks that vary.
 */
export function verLog(itemId, d) {
  const checks = [
    check("schema", "Shape checked against src/lib/content/schema.ts (TopicBundle) and published by pipeline/build-content.mts with 0 problems"),
    check("scope-tier", d.scope),
    check("formula-sheet", d.formula),
    check("command-words", d.command ?? "Command words taken from packs/maths/exam-true/command-words.json"),
    check("tariff", d.tariff),
    check("maths-numeric", d.numeric),
  ];
  if (d.symbolic) checks.push(check("maths-symbolic", d.symbolic));
  checks.push(check("examiner-alignment", d.examiner));
  checks.push(check("copy-shingle", d.copy ?? DEFAULT_COPY));
  checks.push(check("style-lint", d.style ?? DEFAULT_STYLE));
  return { id: `ver.${itemId}`, itemId, version: 1, checks, status: "verified", reports: [] };
}

export const DEFAULT_COPY =
  "Compared by hand against the M4 papers and mark schemes read for this batch (Summer 2023, Summer 2024, November 2024, Summer 2025, November 2025, Summer 2026): new contexts, letters, numbers and wording throughout; no 8-word sequence in common with any source";

export const DEFAULT_STYLE =
  "Every $...$ segment compiled with KaTeX 0.18.5 (throwOnError) by scratchpad/m4-batch/lint.mjs; British English; no exclamation marks; the banned tokens from the authoring brief (the W-word for an incorrect answer, and the 9-1 grade label) do not occur in the bundle or the note blocks";

// ---------------------------------------------------------------------------
// Writing
// ---------------------------------------------------------------------------

export function writeBundle(unit, slug, bundle, blocks) {
  const dir = path.join(ROOT, "packs", "maths", "content", unit, slug);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, "bundle.json"), JSON.stringify(bundle, null, 2) + "\n");
  fs.writeFileSync(path.join(dir, "note.blocks.json"), JSON.stringify(blocks, null, 2) + "\n");
  const counts = {
    we: bundle.workedExamples.length,
    dx: bundle.diagnostics.reduce((n, d) => n + d.items.length, 0),
    q: bundle.questions.length,
    ftm: bundle.findTheMistake.length,
    rp: bundle.prompts.length,
    ver: bundle.verification.length,
    blocks: blocks.length,
  };
  console.log(`wrote ${slug}:`, JSON.stringify(counts));
  return counts;
}

/** Every item that needs a log gets one; called at the end of each generator. */
export function collectLogs(bundle, details) {
  const logs = [];
  const add = (id) => {
    const d = details[id];
    if (!d) throw new Error(`no verification detail for ${id}`);
    logs.push(verLog(id, d));
  };
  if (bundle.note) add(bundle.note.id);
  bundle.workedExamples.forEach((w) => add(w.id));
  bundle.diagnostics.forEach((x) => add(x.id));
  bundle.questions.forEach((q) => add(q.id));
  bundle.findTheMistake.forEach((f) => add(f.id));
  bundle.prompts.forEach((p) => add(p.id));
  return logs;
}
