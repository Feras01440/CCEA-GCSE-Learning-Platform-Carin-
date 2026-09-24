/**
 * The depth standard (author-topic.md, "Depth standard (22 Sep 2026)"), checked in the generator so
 * a note that fails it never reaches packs/. Mirrors depthOf() in scripts/qa/lesson-v2.mjs for every
 * floor, and adds the rules the lint states but does not count: the fixed section order, twists of
 * at most 40 words ending in a choice gate, one "=" per maths segment, and titled callouts.
 *
 * splitChains() rewrites a string so every inline maths chain of two or more "=" becomes one line
 * per "=", and a segment over 60 characters of TeX breaks at a top-level + or − before a new term.
 */
import { segmentIssues, measuredStrings } from "./long-maths.mjs";

export const ROLES = ["idea", "why", "variant", "see", "twists", "further", "derivation", "recap", "pointer"];
const ORDER = ["idea", "why", "variant", "see", "twists", "further", "derivation"];
export const FLOOR = {
  L: { sections: 4, gates: 5, words: [450, 750], variants: 1, twists: 0, visuals: 3, we: 1, practice: [6, 9], d4: 0, tail: 0, exam: 1, multi: 0, ftm: 1, rp: [4, 5], embedded: 3, pre: 3, post: 1 },
  S: { sections: 6, gates: 7, words: [600, 950], variants: 2, twists: 2, visuals: 4, we: 2, practice: [8, 10], d4: 1, tail: 3, exam: 2, multi: 1, ftm: 2, rp: [6, 8], embedded: 4, pre: 3, post: 3 },
};
const bandOf = (d) => (d <= 2 ? "L" : d === 3 ? "S" : d === 4 ? "H4" : "H5");
const words = (s) => String(s ?? "").split(/\s+/).filter(Boolean).length;
const prose = (b) => (b.type === "p" || b.type === "callout" ? b.md ?? "" : b.type === "h" ? b.text ?? "" : "");
const VISUAL = new Set(["figure", "photo", "video", "sim"]);

/* ---- maths chains ------------------------------------------------------------------------------ */

/** Positions of the top-level characters of `ch` in a TeX string: outside braces and brackets. */
function topLevel(tex, test) {
  const out = [];
  let brace = 0;
  let paren = 0;
  for (let i = 0; i < tex.length; i += 1) {
    const c = tex[i];
    if (c === "\\") {
      const m = /^\\(left|right)\b/.exec(tex.slice(i));
      if (m) {
        paren += m[1] === "left" ? 1 : -1;
        i += m[0].length; // skip the delimiter that follows
        continue;
      }
      const cmd = /^\\[a-zA-Z]+/.exec(tex.slice(i));
      if (cmd) {
        i += cmd[0].length - 1;
        continue;
      }
      i += 1;
      continue;
    }
    if (c === "{") brace += 1;
    else if (c === "}") brace -= 1;
    else if (c === "(" || c === "[") paren += 1;
    else if (c === ")" || c === "]") paren -= 1;
    else if (brace === 0 && paren === 0 && test(c, i)) out.push(i);
  }
  return out;
}
const compact = (tex) => tex.replace(/\s+/g, "").length;

/** Break one maths segment's TeX into pieces of at most 60 characters at top-level + or −. */
function breakLong(tex) {
  const out = [];
  let rest = tex.trim();
  while (compact(rest) > 60) {
    const cuts = topLevel(rest, (c, i) => (c === "+" || c === "-" || c === "−") && i > 0 && !/[=({^_]\s*$/.test(rest.slice(0, i)));
    const ok = cuts.filter((i) => compact(rest.slice(0, i)) <= 60 && compact(rest.slice(0, i)) > 0);
    if (!ok.length) throw new Error(`splitChains: cannot break "${rest}" at a top-level + or − within 60 characters`);
    const at = ok[ok.length - 1];
    out.push(rest.slice(0, at).trim());
    rest = rest.slice(at).trim();
  }
  out.push(rest);
  return out;
}

/**
 * Every inline `$…$` with two or more top-level "=" becomes one line per "=", the text before the
 * segment staying on its first line and the text after it on its last; every segment over 60
 * characters is broken at a top-level + or −. Display maths ($$…$$) is left alone.
 */
export function splitChains(text) {
  if (typeof text !== "string" || !text.includes("$")) return text;
  const lines = text.split("\n");
  const out = [];
  for (const line of lines) {
    if (line.includes("$$")) {
      out.push(line);
      continue;
    }
    const segs = [...line.matchAll(/\$([^$]+)\$/g)];
    const chains = segs.filter((m) => topLevel(m[1], (c) => c === "=").length >= 2 || compact(m[1]) > 60);
    if (chains.length === 0) {
      out.push(line);
      continue;
    }
    if (chains.length > 1) {
      // Two chains on one line ("$P(0) = … = …$ and $P(1) = … = …$"): the words between them start the
      // second chain's line, and each half is split on its own.
      const cut = chains[1].index;
      let head = line.slice(0, cut);
      const joiner = /(\s*(?:,\s*)?(?:and|then|so)?\s*)$/.exec(head)[1];
      head = head.slice(0, head.length - joiner.length);
      // A bare comma between the two is replaced by the line break; a word ("and") starts the next line.
      const word = joiner.replace(/,/g, " ").trim();
      out.push(splitChains(head));
      out.push(splitChains(`${word ? `${word} ` : ""}${line.slice(cut)}`.trim()));
      continue;
    }
    const m = chains[0];
    const before = line.slice(0, m.index);
    const after = line.slice(m.index + m[0].length);
    const tex = m[1];
    const eq = topLevel(tex, (c) => c === "=");
    const pieces = [];
    let from = 0;
    for (const i of eq) {
      pieces.push(tex.slice(from, i).trim());
      from = i + 1;
    }
    pieces.push(tex.slice(from).trim());
    const segLines = [];
    if (pieces.length === 1) segLines.push(pieces[0]);
    else if (pieces[0] === "") for (const p of pieces.slice(1)) segLines.push(`= ${p}`);
    else {
      segLines.push(`${pieces[0]} = ${pieces[1]}`);
      for (const p of pieces.slice(2)) segLines.push(`= ${p}`);
    }
    const broken = segLines.flatMap((s) => breakLong(s));
    broken.forEach((s, k) => out.push(`${k === 0 ? before : ""}$${s}$${k === broken.length - 1 ? after : ""}`));
  }
  return out.join("\n");
}

/** Apply splitChains to the strings a depth pass may change (never a frozen field). */
export function tidyBundle(bundle) {
  for (const q of bundle.questions)
    for (const p of q.parts) {
      p.workedSolution = splitChains(p.workedSolution);
      if (p.hints) p.hints = p.hints.map(splitChains);
    }
  for (const we of bundle.workedExamples) for (const s of we.steps) s.working = splitChains(s.working);
  return bundle;
}
export function tidyBlocks(blocks) {
  for (const b of blocks) {
    if (b.type === "p" || b.type === "callout") b.md = splitChains(b.md);
    if (b.type === "gate") b.explain = splitChains(b.explain);
  }
  return blocks;
}

/* ---- the floors -------------------------------------------------------------------------------- */

function svgMeasure(svg) {
  const vb = /viewBox=["']([^"']+)["']/.exec(svg);
  const vw = vb ? Number(vb[1].split(/[\s,]+/)[2]) : 0;
  const sizes = [...svg.matchAll(/font-size[=:]\s*["']?([\d.]+)/g)].map((m) => Number(m[1]));
  const texts = (svg.match(/<text\b/g) ?? []).length;
  const shapes = (svg.match(/<(path|rect|circle|line|polyline|polygon|ellipse)\b/g) ?? []).length;
  const min = sizes.length ? Math.min(...sizes) : 16;
  return { vw, texts, shapes, min, at358: vw ? (min * Math.min(358, vw)) / vw : 0 };
}
const decode = (src) => decodeURIComponent(src.replace(/^data:image\/svg\+xml[^,]*,/, "").replace(/%23/g, "#"));

export function assertDepth(blocks, bundle, label) {
  const fails = [];
  const fail = (s) => fails.push(s);
  const band = bandOf(Number(bundle.topic.difficulty));
  const F = FLOOR[band];
  if (!F) throw new Error(`${label}: no floor written here for band ${band}`);

  const recapAt = blocks.findIndex((b) => b.type === "h" && /^you can now$/i.test(b.text ?? ""));
  const panelAt = blocks.findIndex((b) => b.type === "h" && /^in the exam$/i.test(b.text ?? ""));
  const body = blocks.slice(0, recapAt);
  const headings = body.filter((b) => b.type === "h");

  // roles, order, sections
  for (const h of headings) if (!ROLES.includes(h.role)) fail(`heading "${h.text}" has no valid role`);
  const roles = headings.map((h) => h.role);
  const rank = roles.map((r) => ORDER.indexOf(r));
  for (let i = 1; i < rank.length; i += 1) if (rank[i] < rank[i - 1]) fail(`section order: ${roles[i]} ("${headings[i].text}") after ${roles[i - 1]}`);
  if (!roles.includes("idea")) fail("no idea section");
  if (roles.filter((r) => r === "variant").length < F.variants) fail(`${roles.filter((r) => r === "variant").length} variant sections (floor ${F.variants})`);
  if (!roles.includes("see")) fail("no see-it-done section");
  if (headings.length < F.sections) fail(`${headings.length} sections (floor ${F.sections})`);

  // sections as index ranges
  const sections = [];
  blocks.forEach((b, i) => {
    if (b.type === "h") sections.push({ h: b, from: i });
  });
  sections.forEach((s, k) => (s.to = k + 1 < sections.length ? sections[k + 1].from : blocks.length));
  for (const s of sections) {
    if (!["variant", "see", "twists", "idea", "why"].includes(s.h.role)) continue;
    const inner = blocks.slice(s.from + 1, s.to);
    if (!inner.some((b) => b.type === "gate")) fail(`section "${s.h.text}" has no gate`);
    if (inner[inner.length - 1]?.type !== "gate") fail(`section "${s.h.text}" does not end in a gate`);
  }
  const tw = sections.filter((s) => s.h.role === "twists");
  if (F.twists) {
    if (tw.length !== 1) fail(`${tw.length} twists sections (needs one)`);
    else {
      const inner = blocks.slice(tw[0].from + 1, tw[0].to);
      const paras = inner.filter((b) => b.type === "p");
      if (paras.length < F.twists) fail(`${paras.length} twists (floor ${F.twists})`);
      for (const p of paras) if (words(p.md) > 40) fail(`a twist is ${words(p.md)} words (max 40): ${p.md.slice(0, 50)}`);
      const lastGate = [...inner].reverse().find((b) => b.type === "gate");
      if (lastGate?.kind !== "choice") fail("the twists section does not end in a choice gate");
    }
  }

  // counts
  const gates = body.filter((b) => b.type === "gate").length;
  if (gates < F.gates) fail(`${gates} gates (floor ${F.gates})`);
  const wordCount = blocks.reduce((a, b) => a + words(prose(b)), 0);
  if (wordCount < F.words[0]) fail(`${wordCount} words (floor ${F.words[0]})`);
  const visuals = blocks.filter((b) => VISUAL.has(b.type)).length;
  if (visuals < F.visuals) fail(`${visuals} visuals (floor ${F.visuals})`);
  const whyCallouts = body.filter((b) => b.type === "callout" && b.kind === "why").length + roles.filter((r) => r === "why").length;
  if (whyCallouts < 1) fail("no why callout or section");
  const recapLines = String(blocks[recapAt + 1]?.md ?? "").split("\n").filter((l) => l.trim()).length;
  if (recapLines < 3 || recapLines > 5) fail(`${recapLines} recap lines`);
  const weComplete = bundle.workedExamples.filter((we) => we.twin && (we.faded?.length ?? 0) >= 2 && we.steps.some((s) => s.whyMenu)).length;
  if (weComplete < F.we) fail(`${weComplete} complete worked examples (floor ${F.we})`);
  const practice = bundle.questions.filter((q) => q.style === "practice");
  const exam = bundle.questions.filter((q) => q.style === "exam-style");
  if (practice.length < F.practice[0]) fail(`${practice.length} practice items (floor ${F.practice[0]})`);
  if (practice.filter((q) => q.difficulty >= 4).length < F.d4) fail(`no practice item at difficulty 4-5 (floor ${F.d4})`);
  const rungs = new Set(practice.map((q) => q.difficulty));
  const top = band === "L" ? Math.max(...rungs) : 4;
  for (let d = 1; d <= top; d += 1) if (!rungs.has(d)) fail(`no practice item at difficulty ${d} (the ladder runs from 1 to ${top})`);
  const tail = Math.max(0, ...(bundle.sets ?? []).filter((s) => (s.kind === "mixed" || s.kind === "interleaved") && s.showTopicLabels === false).map((s) => s.itemIds.length));
  if (tail < F.tail) fail(`mixed tail of ${tail} (floor ${F.tail})`);
  if (exam.length < F.exam) fail(`${exam.length} exam-style (floor ${F.exam})`);
  if (exam.filter((q) => q.parts.length >= 2).length < F.multi) fail("no multi-part exam-style question");
  if (bundle.findTheMistake.length < F.ftm) fail(`${bundle.findTheMistake.length} find-the-mistake (floor ${F.ftm})`);
  if (bundle.prompts.length < F.rp[0]) fail(`${bundle.prompts.length} prompts (floor ${F.rp[0]})`);
  if (blocks.filter((b) => b.type === "prompt").length < F.embedded) fail("too few prompts embedded in the note");
  const pre = bundle.diagnostics.filter((d) => d.when === "pre").reduce((a, d) => a + d.items.length, 0);
  const post = bundle.diagnostics.filter((d) => d.when === "post").reduce((a, d) => a + d.items.length, 0);
  if (pre < F.pre || post < F.post) fail(`diagnostics ${pre} pre / ${post} post (floor ${F.pre} / ${F.post})`);

  // Slides-ready
  for (const b of blocks) {
    if ((b.type === "p" || b.type === "callout") && words(b.md) > 75) fail(`a ${b.type} of ${words(b.md)} words (max 75): ${String(b.md).slice(0, 50)}`);
    if (b.type === "h" && words(b.text) > 8) fail(`heading over 8 words: ${b.text}`);
    if (b.type === "figure" && (!b.caption || words(b.caption) > 25)) fail(`figure caption missing or over 25 words: ${b.caption ?? "(none)"}`);
    if (b.type === "callout" && (!b.title || words(b.title) > 8)) fail(`callout without a title of at most 8 words: ${String(b.md).slice(0, 40)}`);
  }
  let cards = 0;
  for (let i = 0; i < body.length; i += 1) {
    const b = body[i];
    if (VISUAL.has(b.type) && VISUAL.has(body[i - 1]?.type)) fail(`two visuals back to back at block ${i}`);
    if (b.type === "p" || b.type === "callout" || VISUAL.has(b.type)) cards += 1;
    if (b.type === "gate") cards = 0;
    if (cards > 4) fail(`more than 4 cards before a gate at block ${i}`);
  }

  // figures
  const figs = [];
  blocks.forEach((b, i) => b.type === "figure" && b.svg && figs.push({ where: `note#${i}`, svg: b.svg }));
  for (const q of bundle.questions) for (const f of q.figures ?? []) if (f.kind === "svg") figs.push({ where: q.id, svg: decode(f.src) });
  for (const we of bundle.workedExamples) {
    if (we.figure?.kind === "svg") figs.push({ where: we.id, svg: decode(we.figure.src) });
    if (we.twin?.figure?.kind === "svg") figs.push({ where: `${we.id} twin`, svg: decode(we.twin.figure.src) });
  }
  for (const d of bundle.diagnostics) for (const it of d.items) if (it.figure?.kind === "svg") figs.push({ where: `${d.id}/${it.id}`, svg: decode(it.figure.src) });
  for (const f of figs) {
    const m = svgMeasure(f.svg);
    if (m.texts && m.at358 < 12.5) fail(`figure ${f.where}: smallest label ${m.min}/${m.vw} renders at ${m.at358.toFixed(1)} px on a phone`);
    if (m.texts >= 4 && m.shapes <= 1) fail(`figure ${f.where} is text drawn as a picture`);
  }

  // long maths and chains
  for (const s of measuredStrings(blocks, bundle)) {
    for (const issue of segmentIssues(s.text)) if (!s.frozen) fail(`maths ${s.where}: ${issue.why}: ${issue.tex}`);
    if (s.frozen) continue;
    for (const m of String(s.text).matchAll(/\$(?!\$)([^$]+)\$/g)) if (topLevel(m[1], (c) => c === "=").length >= 2) fail(`chain of equalities in ${s.where}: ${m[1]}`);
  }

  if (fails.length) throw new Error(`${label}: the depth standard is not met:\n  ${fails.join("\n  ")}`);
  return { band, sections: headings.length, gates, words: wordCount, visuals, roles: roles.join(" "), practice: practice.length, tail };
}
