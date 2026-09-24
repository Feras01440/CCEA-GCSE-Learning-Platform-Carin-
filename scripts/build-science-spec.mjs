#!/usr/bin/env node
/**
 * build-science-spec.mjs
 *
 * Parse the CCEA GCSE Double Award Science (2017) specification PDF into
 * structured JSON with per-learning-outcome tier flags.
 *
 * Usage:
 *   node scripts/build-science-spec.mjs [--pdf <file>] [--dump <lines.json>] [--out <file>]
 *                                       [--overrides <file>] [--from 11 --to 107] [--y-tol 6]
 *
 * By default it extracts pages 11-107 of docs/sources/science/DA-Science-spec.pdf
 * with scripts/extract-spec-pdf.mjs (baseline tolerance 6pt so sub/superscripts
 * merge into their parent line) and writes data/spec/double-award-science.json.
 *
 * Conventions in the PDF (see spec p.9):
 *   - Higher-Tier-only content is set in Calibri-Bold. LO numbers, bullet glyphs
 *     (SymbolMT) and arrows (Wingdings) are always regular, so tier is judged on
 *     the remaining text only.
 *   - The 18 prescribed practicals are set in Calibri-Italic and sit at the
 *     LO-number indent (not the bullet indent) as "• ... (Prescribed Practical Xn)".
 *   - Left column (x < 185): section id (bold, x~95), section title (bold, x~95),
 *     topic labels (bold, x~108). Right column (x >= 185): "Students should be
 *     able to:", numbered LOs, bullets (x ~ LO indent + 36), sub-bullets ("–").
 *   - Stacked fractions are set with numerator/denominator 8-10pt above/below the
 *     "=" line (normal pitch is 14.7pt); they are re-linearised as "a = b / c".
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { extractLines } from './extract-spec-pdf.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

// ---------------------------------------------------------------------------
// CLI
// ---------------------------------------------------------------------------
const argv = process.argv.slice(2);
const opt = {
  pdf: path.join(ROOT, 'docs', 'sources', 'science', 'DA-Science-spec.pdf'),
  dump: null,
  out: path.join(ROOT, 'data', 'spec', 'double-award-science.json'),
  overrides: path.join(__dirname, 'science-spec-overrides.json'),
  from: 11,
  to: 107,
  yTol: 6,
};
for (let i = 0; i < argv.length; i++) {
  const a = argv[i];
  if (a === '--pdf') opt.pdf = argv[++i];
  else if (a === '--dump') opt.dump = argv[++i];
  else if (a === '--out') opt.out = argv[++i];
  else if (a === '--overrides') opt.overrides = argv[++i];
  else if (a === '--from') opt.from = Number(argv[++i]);
  else if (a === '--to') opt.to = Number(argv[++i]);
  else if (a === '--y-tol') opt.yTol = Number(argv[++i]);
  else throw new Error(`Unknown argument ${a}`);
}

// ---------------------------------------------------------------------------
// Static metadata (from "Specification at a Glance", spec pp.6-8)
// ---------------------------------------------------------------------------
const UNIT_META = {
  B1: { discipline: 'Biology', duration: '1 hour', weighting: 11, assessment: 'External written examination' },
  B2: { discipline: 'Biology', duration: '1 hour 15 mins', weighting: 14, assessment: 'External written examination' },
  C1: { discipline: 'Chemistry', duration: '1 hour', weighting: 11, assessment: 'External written examination' },
  C2: { discipline: 'Chemistry', duration: '1 hour 15 mins', weighting: 14, assessment: 'External written examination' },
  P1: { discipline: 'Physics', duration: '1 hour', weighting: 11, assessment: 'External written examination' },
  P2: { discipline: 'Physics', duration: '1 hour 15 mins', weighting: 14, assessment: 'External written examination' },
  '7': {
    discipline: 'Practical Skills',
    duration: 'Booklet A: 3 hours (three 1-hour tasks); Booklet B: 1 hour 30 mins',
    weighting: 25,
    assessment: 'Booklet A (practical skills assessment, 7.5%, externally marked) and Booklet B (external written examination, 17.5%)',
  },
};

const COLUMN_SPLIT_X = 185; // left column (labels) vs right column (learning outcomes)
const PROSE_MAX_X = 93;     // prose paragraphs / headings start at x~90; table cells at >= 95
const LINE_PITCH = 14.7;    // normal baseline spacing at 12pt
const STACK_GAP = 12.5;     // baseline gap below which two lines form a stacked construct (fraction/annotation)

// ---------------------------------------------------------------------------
// Text helpers
// ---------------------------------------------------------------------------
const norm = (s) => s.replace(/\s+/g, ' ').trim();
const isBulletGlyph = (t) => /^[•]\s*$/.test(t);
const isDashGlyph = (t) => /^[–−-]\s*$/.test(t);

/** Build tokens [{text,bold,italic,x,w,size,font}] from runs, dropping stray glyphs. */
function runsToTokens(runs) {
  const toks = [];
  for (const r of runs) {
    if (r.size < 4 || r.text === '') continue; // stray sub-pixel glyphs
    let text = r.text;
    if (/Wingdings/i.test(r.font)) text = ' → '; // arrow glyph in equations
    toks.push({ text, bold: r.bold, italic: r.italic, x: r.x, w: r.w, size: r.size, font: r.font });
  }
  return toks;
}

/** Tokens -> styled parts [{text,bold}], inferring spaces (and missing arrows) from horizontal gaps. */
function tokensToStyled(toks) {
  const parts = [];
  const lineText = toks.map((k) => k.text).join('');
  const hasPlus = /\+/.test(lineText);
  const hasArrow = /→/.test(lineText);
  let prev = null;
  for (const t of toks) {
    let pre = '';
    if (prev) {
      const gap = t.x - (prev.x + prev.w);
      const before = parts.map((p) => p.text).join('');
      if (gap > 22 && hasPlus && !hasArrow) pre = ' → ';
      else if (gap > 22 && /=/.test(before) && /=/.test(t.text)) pre = '; '; // side-by-side equations: "energy = power × time   E = P × t"
      else if (gap > Math.max(1.0, Math.min(prev.size, t.size) * 0.16)) pre = ' ';
    }
    if (pre) parts.push({ text: pre, bold: prev.bold && t.bold });
    parts.push({ text: t.text, bold: t.bold });
    prev = t;
  }
  return parts;
}
const tokensToText = (toks) => norm(tokensToStyled(toks).map((p) => p.text).join(''));

/** Merge styled parts into spans and render plain + marked text. */
function renderStyled(parts) {
  const spans = [];
  for (const p of parts) {
    const last = spans[spans.length - 1];
    if (last && last.bold === p.bold) last.text += p.text;
    else spans.push({ text: p.text, bold: p.bold });
  }
  // whitespace-only spans adopt their neighbours' boldness so spans do not fragment
  for (let i = 0; i < spans.length; i++) {
    if (!spans[i].text.trim()) {
      const prev = spans[i - 1], next = spans[i + 1];
      if (prev && next && prev.bold === next.bold) spans[i].bold = prev.bold;
    }
  }
  const merged = [];
  for (const s of spans) {
    const last = merged[merged.length - 1];
    if (last && last.bold === s.bold) last.text += s.text;
    else merged.push({ ...s });
  }
  const plain = norm(merged.map((s) => s.text).join(''));
  let marked = '';
  for (const s of merged) {
    const t = s.text;
    if (!t) continue;
    if (s.bold && t.trim()) {
      const lead = t.match(/^\s*/)[0], trail = t.match(/\s*$/)[0];
      marked += `${lead}**${t.trim()}**${trail}`;
    } else marked += t;
  }
  marked = norm(marked).replace(/\*\* \*\*/g, ' ');
  // Tier is judged on the "core" text: trailing punctuation and list connectors
  // ("; and", "or", ".") take the style of the *next* outcome in the PDF, so they
  // are ignored when deciding whether the outcome itself is bold.
  const chars = []; // per-character bold flags of the un-normalised text
  for (const s of merged) for (const ch of s.text) chars.push({ ch, bold: s.bold });
  const rawText = chars.map((c) => c.ch).join('');
  const coreEnd = rawText.replace(/[\s;:,.]*(\b(?:and|or|including|such as|for example)\b)?[\s;:,.]*$/, '').length;
  const core = chars.slice(0, coreEnd).filter((c) => /\S/.test(c.ch));
  const inkTotal = core.length;
  const inkBold = core.filter((c) => c.bold).length;
  return { text: plain, marked, allBold: inkTotal > 0 && inkBold === inkTotal, anyBold: inkBold > 0 };
}

/** Tidy chemical-formula spacing artefacts, e.g. "C6H12 O6 +6O2" -> "C6H12O6 + 6O2". */
function tidyFormula(s) {
  return s
    .replace(/([A-Z][a-z]?\d+) (?=[A-Z][a-z]?\d+(?:\b|[ +→]))/g, '$1') // "C6H12 O6" -> "C6H12O6"
    .replace(/ \+(\d)/g, ' + $1')                                      // "H2O +6O2" -> "H2O + 6O2"
    .replace(/(\S)\s*→\s*/g, '$1 → ')
    .replace(/([A-Za-z]\d*n\+) (\d)/g, '$1$2')                          // "CnH2n+ 2" -> "CnH2n+2" (subscript artefact)
    .replace(/([+–-]|\d) \((aq|s|l|g)\)/g, '$1($2)')                    // "H+ (aq)" -> "H+(aq)"
    .replace(/\s+([;,.)])/g, '$1')                                     // "CO2 ;" -> "CO2;"
    .replace(/ +/g, ' ');
}

// ---------------------------------------------------------------------------
// Line preparation: split every line into left-column / right-column parts
// ---------------------------------------------------------------------------
function prepareLines(raw) {
  const lines = [];
  for (const l of raw) {
    if (l.y > 785) continue; // running header
    if (l.y < 50) continue;  // page-number footer
    const text = norm(l.text);
    if (/^Content Learning Outcomes$/.test(text)) continue;
    if (/^CCEA GCSE Double Award Science/.test(text)) continue;
    const runs = l.runs.filter((r) => r.size >= 4 && r.text !== '');
    const left = runs.filter((r) => r.x < COLUMN_SPLIT_X);
    const right = runs.filter((r) => r.x >= COLUMN_SPLIT_X);
    const lt = runsToTokens(left), rt = runsToTokens(right);
    const ltext = lt.length ? tokensToText(lt) : '';
    const rtext = rt.length ? tokensToText(rt) : '';
    if (ltext === 'Content' && /^Learning Outcomes$/.test(rtext)) continue;
    if (!lt.length && !rt.length) continue;
    lines.push({
      page: l.page,
      y: l.y,
      left: lt.length ? { x: lt[0].x, toks: lt, text: ltext, bold: lt.every((t) => t.bold || !t.text.trim()), size: lt[0].size } : null,
      right: rt.length ? { x: rt[0].x, toks: rt, text: rtext, size: rt[0].size } : null,
    });
  }
  return lines;
}

// ---------------------------------------------------------------------------
// Right-column line classification
// ---------------------------------------------------------------------------
const LO_START_RE = /^(\d+\.\d+\.\d+)(\s|$)/;

function classifyRight(r, loIndent) {
  const first = r.toks[0];
  const t0 = first.text;
  if (/^Students should be able to:?$/.test(r.text)) return { type: 'sstba' };
  const m = t0.trim().match(LO_START_RE);
  if (m && !first.bold && (loIndent === null || r.x <= loIndent + 8)) return { type: 'lo', id: m[1] };
  if (isBulletGlyph(t0) || /^•\s+\S/.test(r.text)) return { type: 'bullet' };
  if (isDashGlyph(t0) || /^[–−-]\s+\S/.test(r.text)) return { type: 'dash' };
  return { type: 'text' };
}

/** Tokens of a line minus its leading marker (LO number / bullet / dash). */
function stripMarker(r, type) {
  const toks = r.toks.slice();
  const t0 = toks[0];
  const re = type === 'lo' ? /^\s*\d+\.\d+\.\d+\s*/ : /^\s*[•–−-]\s*/;
  const m = t0.text.match(re);
  if (!m) return toks;
  if (m[0].length >= t0.text.trim().length) toks.shift();
  else {
    const frac = m[0].length / t0.text.length;
    toks[0] = { ...t0, text: t0.text.slice(m[0].length), x: t0.x + t0.w * frac, w: t0.w * (1 - frac) };
  }
  return toks;
}

// ---------------------------------------------------------------------------
// Assemble a block of lines into styled parts (fractions, arrows, hyphenation)
// ---------------------------------------------------------------------------
const wrapExpr = (s) => {
  s = s.trim();
  if (/^\(.*\)$/.test(s)) return s;
  return /[+–−]|\s-\s/.test(s) ? `(${s})` : s; // parenthesise only sums/differences
};

function assembleLines(lines, baseIndent) {
  if (!lines.length) return [];
  // 1. group into stacks by unusually small vertical gaps
  const groups = [];
  for (const ln of lines) {
    const g = groups[groups.length - 1];
    const gap = g ? g[g.length - 1].y - ln.y : null;
    if (g && gap > 0.5 && gap < STACK_GAP) g.push(ln);
    else groups.push([ln]);
  }
  // 2. render each group
  const rendered = []; // { kind: 'text'|'eq'|'arrow', parts, x, y, conds }
  for (const g of groups) {
    if (g.length === 1) {
      const parts = tokensToStyled(g[0].toks);
      const text = parts.map((p) => p.text).join('');
      rendered.push({ kind: /→/.test(text) ? 'arrow' : 'text', parts, x: g[0].x, y: g[0].y, conds: [] });
      continue;
    }
    const texts = g.map((ln) => tokensToText(ln.toks));
    let mainIdx = -1;
    for (let i = 0; i < g.length; i++) if (/=/.test(texts[i]) && (mainIdx < 0 || g[i].x < g[mainIdx].x)) mainIdx = i;
    if (mainIdx < 0) {
      const idx = texts.findIndex((t) => /→/.test(t));
      if (idx < 0) {
        // no equation/arrow: a tightly-spaced table row or wrapped cell; keep reading order
        for (const ln of g) rendered.push({ kind: 'text', parts: tokensToStyled(ln.toks), x: ln.x, y: ln.y, conds: [] });
        continue;
      }
      // arrow with annotations above/below (e.g. "light" / "(chlorophyll)")
      const parts = tokensToStyled(g[idx].toks);
      const conds = g.filter((_, i) => i !== idx).map((ln) => tokensToText(ln.toks));
      rendered.push({ kind: 'arrow', parts, x: g[idx].x, y: g[idx].y, conds });
      continue;
    }
    const main = g[mainIdx];
    const above = g.slice(0, mainIdx).map((ln) => tokensToText(ln.toks));
    const below = g.slice(mainIdx + 1).map((ln) => tokensToText(ln.toks));
    const mainText = texts[mainIdx];
    const bold = main.toks.every((t) => t.bold || !t.text.trim());
    const eqPos = mainText.indexOf('=');
    const beforeEq = mainText.slice(0, eqPos).trim();
    const afterEq = mainText.slice(eqPos + 1).trim();
    let eq;
    if (afterEq && below.length && !above.length) eq = `${beforeEq} = ${wrapExpr(afterEq)} / ${wrapExpr(below.join(' '))}`;
    else if (!afterEq && above.length && below.length) eq = `${beforeEq} = ${wrapExpr(above.join(' '))} / ${wrapExpr(below.join(' '))}`;
    else if (afterEq && above.length && below.length) eq = `${beforeEq} = ${wrapExpr(above.join(' '))} / ${wrapExpr(below.join(' '))} ${afterEq}`;
    else eq = `${mainText} [stack: ${[...above, ...below].join(' | ')}]`;
    rendered.push({ kind: 'eq', parts: [{ text: eq, bold }], x: main.x, y: main.y, conds: [] });
  }
  // 3. hanging fragments: short text far right of the indent, directly after an "=" line or an arrow line
  const out = [];
  for (const r of rendered) {
    const prev = out[out.length - 1];
    const text = norm(r.parts.map((p) => p.text).join(''));
    const isFragment = r.kind === 'text' && r.x > baseIndent + 45 && text.length <= 30 && !/[;:]$/.test(text) && !/[=→]/.test(text);
    if (isFragment && prev) {
      if (prev.kind === 'arrow') { prev.conds.push(text); continue; }
      if (prev.kind === 'text') {
        const ptext = norm(prev.parts.map((p) => p.text).join(''));
        const m = ptext.match(/^(.*?)=\s*([^=]+)$/);
        if (m && m[2].trim() && !/\//.test(m[2])) {
          const bold = prev.parts.every((p) => p.bold || !p.text.trim());
          prev.parts = [{ text: `${m[1].trim()} = ${wrapExpr(m[2])} / ${wrapExpr(text)}`, bold }];
          prev.kind = 'eq';
          continue;
        }
      }
    }
    out.push(r);
  }
  // 4. materialise arrow conditions and join lines (hyphenation-aware)
  const parts = [];
  for (let i = 0; i < out.length; i++) {
    const r = out[i];
    if (r.kind === 'arrow' && r.conds.length) {
      const bold = r.parts.every((p) => p.bold || !p.text.trim());
      r.parts = [...r.parts, { text: ` (conditions: ${r.conds.map((c) => c.replace(/^\((.*)\)$/, '$1')).join(', ')})`, bold }];
    }
    if (i > 0) {
      const prevText = parts.map((p) => p.text).join('').trimEnd();
      const nextText = r.parts.map((p) => p.text).join('').trimStart();
      const prevLine = norm(out[i - 1].parts.map((p) => p.text).join(''));
      const joinNoSpace = /[-–]$/.test(prevText) && /^[a-z]/.test(nextText);
      // two display equations on consecutive lines ("charge = current × time" / "Q = I × t") get a "; " separator
      const eqSep = /=/.test(prevLine) && /=/.test(nextText) && !/[;:,.]$/.test(prevLine) && !/^(or|and)\b/.test(nextText);
      const bold = (parts[parts.length - 1]?.bold ?? false) && (r.parts[0]?.bold ?? false);
      if (eqSep) parts.push({ text: '; ', bold });
      else if (!joinNoSpace) parts.push({ text: ' ', bold });
    }
    parts.push(...r.parts);
  }
  return parts;
}

// ---------------------------------------------------------------------------
// Main parse
// ---------------------------------------------------------------------------
function parse(lines) {
  const units = [];
  const warnings = [];
  let unit = null;
  let pendingSection = null;   // { title, intro } from the prose heading before a table
  let section = null;
  let topic = null;
  let item = null;             // current outcome (lo / practical / skill)
  let bullet = null;
  let subBullet = null;
  let loIndent = null;         // x of LO numbers on the current page
  let unitIntroLines = [];
  let sectionIntroLines = [];
  let inUnitHeading = false;
  let u7Prose = [];            // Unit 7 row-level prose awaiting its section

  const paragraphs = (ls) => {
    const paras = [];
    let cur = [];
    let lastY = null, lastPage = null;
    for (const l of ls) {
      if (lastY !== null && l.page === lastPage && lastY - l.y > LINE_PITCH * 1.5) { paras.push(cur); cur = []; }
      cur.push(l.text); lastY = l.y; lastPage = l.page;
    }
    if (cur.length) paras.push(cur);
    return paras.map((p) => norm(p.join(' '))).join('\n\n');
  };

  const newUnit = (headingText) => {
    const m = headingText.match(/^3\.(\d)\s+(?:(Biology|Chemistry|Physics)\s+Unit\s+([BCP]\d):\s*(.*)|(Unit 7):\s*(.*))$/);
    if (!m) throw new Error(`Cannot parse unit heading: ${headingText}`);
    const code = m[3] || '7';
    const meta = UNIT_META[code];
    unit = { code, discipline: meta.discipline, title: norm(m[4] || m[6] || ''), specSection: `3.${m[1]}`, duration: meta.duration, weighting: meta.weighting, assessment: meta.assessment, intro: '', sections: [], _heading: [headingText] };
    units.push(unit);
    section = null; topic = null; item = null; bullet = null; subBullet = null; pendingSection = null;
    unitIntroLines = []; sectionIntroLines = [];
  };
  const fixUnitTitle = () => {
    const h = norm(unit._heading.join(' '));
    const m = h.match(/Unit\s+(?:[BCP]\d|7):\s*(.*)$/);
    if (m) unit.title = norm(m[1]);
  };

  const closeItem = () => { item = null; bullet = null; subBullet = null; };
  const ensureSection = (id, titleLines) => {
    if (section && section.id === id) return section;
    const label = norm(titleLines.join(' ')) || null;
    section = { id, title: pendingSection?.title || label, label, intro: pendingSection?.intro || '', topics: [] };
    unit.sections.push(section);
    pendingSection = null; topic = null; closeItem();
    return section;
  };
  const ensureTopic = (label) => {
    if (!section) {
      section = { id: null, title: label, label, intro: '', topics: [] };
      unit.sections.push(section);
      label = null;
    }
    if (topic && topic.label === label) return topic;
    topic = { label, outcomes: [] };
    section.topics.push(topic);
    closeItem();
    return topic;
  };
  const currentTopic = () => topic || ensureTopic(null);
  const flushIntros = () => {
    if (pendingSection && sectionIntroLines.length) { pendingSection.intro = paragraphs(sectionIntroLines); sectionIntroLines = []; }
    if (unit && !unit.intro && unitIntroLines.length) { unit.intro = paragraphs(unitIntroLines); unitIntroLines = []; }
  };

  const pages = [...new Set(lines.map((l) => l.page))].sort((a, b) => a - b);
  for (const p of pages) {
    const pl = lines.filter((l) => l.page === p).sort((a, b) => b.y - a.y);

    // LO-number indent on this page (min x of LO-number lines); else keep the previous page's
    const loXs = pl.filter((l) => l.right && !l.right.toks[0].bold && LO_START_RE.test(l.right.toks[0].text.trim()) && l.right.x < 215).map((l) => l.right.x);
    if (loXs.length) loIndent = Math.min(...loXs);

    // --- Pre-pass A: left-column label groups inside the table ------------
    const leftGroups = [];
    for (const l of pl) {
      if (!l.left || l.left.x < PROSE_MAX_X || !l.left.bold || l.left.size >= 13.5) continue;
      const L = l.left;
      const kind = L.x < 100 ? 'section' : L.x < 140 ? 'topic' : 'other';
      const g = leftGroups[leftGroups.length - 1];
      const isId = /^\d+\.\d+$/.test(L.text);
      if (g && g.kind === kind && !isId && !g.isId && g.lines[g.lines.length - 1].y - l.y < LINE_PITCH * 1.5) g.lines.push({ y: l.y, text: L.text });
      else leftGroups.push({ kind, isId, lines: [{ y: l.y, text: L.text }], x: L.x });
    }
    for (const g of leftGroups) {
      g.text = norm(g.lines.map((x) => x.text).join(' ').replace(/([-–]) (?=[a-z])/g, '$1'));
      g.cont = /\(cont\.\)$/.test(g.text);
      g.top = g.lines[0].y;
    }
    // --- Pre-pass B: outcome start lines on this page ----------------------
    const starts = [];
    for (const l of pl) {
      if (!l.right) continue;
      const c = classifyRight(l.right, loIndent);
      if (c.type === 'lo') starts.push({ y: l.y, line: l });
      else if (c.type === 'bullet' && (loIndent === null || l.right.x < loIndent + 20)) starts.push({ y: l.y, line: l });
    }
    // --- Resolve label groups to the outcome start they belong to ---------
    const labelFor = new Map();
    for (const g of leftGroups) {
      if (g.isId || g.cont) continue;
      let best = null;
      for (const s of starts) {
        const d = s.y - g.top; // > 0: start is above the label top
        if (d >= -3 && d > LINE_PITCH * 3.2) continue;
        const score = d >= -3 ? d : 1000 + Math.abs(d);
        if (!best || score < best.score) best = { s, score };
      }
      if (!best) { if (g.kind === 'topic') warnings.push(`p${p}: label "${g.text}" could not be attached to any outcome`); continue; }
      const arr = labelFor.get(best.s.line) || [];
      arr.push(g);
      labelFor.set(best.s.line, arr);
    }

    // --- Main pass ---------------------------------------------------------
    for (const l of pl) {
      const L = l.left;
      // unit heading (size 14 bold; continuation lines are indented to x~126)
      if (L && L.size >= 13.5 && L.bold && !l.right) {
        if (/^3\.\d\s/.test(L.text)) { newUnit(L.text); inUnitHeading = true; }
        else if (inUnitHeading) { unit._heading.push(L.text); fixUnitTitle(); }
        continue;
      }
      inUnitHeading = false;
      if (!unit) continue; // preamble before 3.1

      // prose outside the table (x~90): section headings and intro paragraphs
      const isProse = L && L.x < PROSE_MAX_X && (!l.right || pendingSection || !unit.sections.length);
      if (isProse) {
        // section heading: short bold Title-Case line, not a bold sentence inside an intro paragraph
        if (!l.right && L.size >= 11.5 && L.bold && L.text.length < 80 && /^[A-Z]/.test(L.text) && !/[.:;]$/.test(L.text) && !/^(In this|This section|For this)/.test(L.text)) {
          flushIntros();
          pendingSection = { title: L.text, intro: '' };
          sectionIntroLines = [];
          continue;
        }
        const text = norm(L.text + (l.right ? ' ' + l.right.text : ''));
        if (pendingSection) sectionIntroLines.push({ y: l.y, page: p, text });
        else if (!unit.sections.length) unitIntroLines.push({ y: l.y, page: p, text });
        else warnings.push(`p${p}: stray prose "${text.slice(0, 60)}"`);
        continue;
      }
      flushIntros();

      // section id in the left column (x~95): "1.1" -> new section, title lines follow at x~95
      if (L && /^\d+\.\d+$/.test(L.text) && L.x < 100) {
        if (!section || section.id !== L.text) {
          const titleGroup = leftGroups.find((g) => g.kind === 'section' && !g.isId && !g.cont && g.top < l.y && l.y - g.top < LINE_PITCH * 1.5);
          ensureSection(L.text, titleGroup ? titleGroup.lines.map((x) => x.text) : []);
          if (titleGroup) titleGroup.used = true;
        }
      }

      // Unit 7: the first line of a new skill-area label (x~95, not "(cont.)") starts a new table row, so the open item ends here
      if (unit.code === '7' && leftGroups.some((g) => g.kind === 'section' && !g.cont && !g.isId && g.lines[0].y === l.y)) closeItem();

      if (!l.right) continue;
      const R = l.right;
      const c = classifyRight(R, loIndent);
      if (c.type === 'sstba') continue;

      // labels anchored to this outcome start
      const labels = labelFor.get(l);
      if (labels) {
        for (const g of labels) {
          if (g.kind === 'section') {
            if (unit.code === '7') { section = null; topic = null; ensureTopic(g.text); section.intro = norm(u7Prose.join(' ')); u7Prose = []; }
            else if (section && !section.label && !g.used) { section.label = g.text; if (!section.title) section.title = g.text; }
          } else if (g.kind === 'topic') ensureTopic(g.text);
        }
      }

      if (c.type === 'lo') {
        closeItem();
        const t = currentTopic();
        item = { id: c.id, kind: 'lo', lines: [{ y: l.y, x: R.x, toks: stripMarker(R, 'lo') }], bullets: [], page: p };
        t.outcomes.push(item);
        continue;
      }
      if (c.type === 'bullet') {
        const topLevel = loIndent === null || R.x < loIndent + 20;
        if (topLevel) {
          closeItem();
          const t = currentTopic();
          item = { id: null, kind: unit.code === '7' ? 'skill' : 'practical', lines: [{ y: l.y, x: R.x, toks: stripMarker(R, 'bullet') }], bullets: [], page: p };
          t.outcomes.push(item);
        } else {
          if (!item) { warnings.push(`p${p}: bullet without outcome: "${R.text.slice(0, 50)}"`); continue; }
          bullet = { lines: [{ y: l.y, x: R.x, toks: stripMarker(R, 'bullet') }], sub: [] };
          subBullet = null;
          item.bullets.push(bullet);
        }
        continue;
      }
      if (c.type === 'dash') {
        if (!item) { warnings.push(`p${p}: dash without outcome: "${R.text.slice(0, 50)}"`); continue; }
        const toks = stripMarker(R, 'dash');
        if (bullet && !bullet.dash) { subBullet = { lines: [{ y: l.y, x: R.x, toks }] }; bullet.sub.push(subBullet); }
        else { bullet = { lines: [{ y: l.y, x: R.x, toks }], sub: [], dash: true }; subBullet = null; item.bullets.push(bullet); }
        continue;
      }
      if (!item) {
        if (unit.code === '7') { u7Prose.push(R.text); continue; } // row-level prose, e.g. "Below is a list of prescribed practicals ..."
        warnings.push(`p${p}: text without outcome: "${R.text.slice(0, 60)}"`);
        continue;
      }
      (subBullet || bullet || item).lines.push({ y: l.y, x: R.x, toks: R.toks });
    }
  }
  flushIntros();
  for (const u of units) delete u._heading;
  return { units, warnings };
}

// ---------------------------------------------------------------------------
// Render parsed items to the final JSON shape
// ---------------------------------------------------------------------------
function renderBlock(lines, baseIndent) {
  const r = renderStyled(assembleLines(lines, baseIndent));
  return { text: tidyFormula(r.text), marked: tidyFormula(r.marked), tier: r.allBold ? 'H' : 'F', mixed: !r.allBold && r.anyBold };
}
const stripPracticalSuffix = (t) => t.replace(/\s*\(Prescribed Practical [BCP]\d\)\s*[;.]?\s*(and)?\s*$/i, '').replace(/[;.]\s*$/, '').trim();

function finalise(parsed, overrides) {
  const stats = {};
  const appliedOverrides = [];
  const practicalsInUnits = [];
  const renderBullet = (b) => {
    const rb = renderBlock(b.lines, b.lines[0].x);
    const out = { text: rb.text, tier: rb.tier };
    if (rb.mixed) { out.mixed = true; out.textMarked = rb.marked; }
    if (b.sub && b.sub.length) out.sub = b.sub.map(renderBullet);
    return out;
  };
  for (const unit of parsed.units) {
    const st = { sections: 0, topics: 0, outcomes: 0, H: 0, F: 0, mixed: 0, bullets: 0, bulletsH: 0, practicals: 0, skills: 0 };
    stats[unit.code] = st;
    for (const sec of unit.sections) {
      st.sections++;
      for (const top of sec.topics) {
        st.topics++;
        top.outcomes = top.outcomes.map((it) => {
          const stem = renderBlock(it.lines, it.lines[0].x);
          const bullets = it.bullets.map(renderBullet);
          const allText = [stem.text, ...bullets.flatMap((b) => [b.text, ...(b.sub || []).map((s) => s.text)])].join(' ');
          const practicalCode = allText.match(/Prescribed Practical ([BCP]\d)/)?.[1] ?? null;
          const o = { id: it.id, kind: it.kind, text: stem.text, tier: stem.tier, bullets, practical: practicalCode, page: it.page };
          if (stem.mixed) { o.mixed = true; o.textMarked = stem.marked; }
          if (it.kind === 'practical') {
            if (!practicalCode) parsed.warnings.push(`${unit.code} p${it.page}: top-level bullet without a Prescribed Practical code: "${stem.text.slice(0, 70)}"`);
            o.id = practicalCode;
            o.title = stripPracticalSuffix(stem.text);
          }
          const key = `${unit.code}:${o.id}`;
          if (overrides[key]) {
            const ov = overrides[key];
            if (ov.text) { o.autoText = o.text; o.text = ov.text; if (o.mixed) { delete o.mixed; delete o.textMarked; } }
            if (ov.tier) { o.autoTier = o.tier; o.tier = ov.tier; }
            if (ov.table) o.table = ov.table;
            if (ov.bullets) for (const [i, b] of Object.entries(ov.bullets)) if (o.bullets[i]) { o.bullets[i].autoText = o.bullets[i].text; o.bullets[i].text = b; }
            o.override = ov.note || true;
            appliedOverrides.push(key);
          }
          return o;
        });
        for (let i = 1; i < top.outcomes.length; i++) {
          const o = top.outcomes[i], prev = top.outcomes[i - 1];
          if (o.kind === 'practical' && prev.kind === 'lo' && !prev.practical) prev.practical = o.id;
        }
        for (const o of top.outcomes) {
          if (o.kind === 'lo') { st.outcomes++; if (o.tier === 'H') st.H++; else st.F++; if (o.mixed) st.mixed++; }
          else if (o.kind === 'practical') { st.practicals++; practicalsInUnits.push({ code: o.id, unit: unit.code, sectionId: sec.id, topic: top.label, title: o.title, text: o.text, page: o.page }); }
          else st.skills++;
          for (const b of o.bullets) { st.bullets++; if (b.tier === 'H') st.bulletsH++; }
        }
      }
    }
  }
  // prescribed practicals from the Unit 7 appendix table ("Prescribed practicals", spec pp.103-105)
  const prescribed = [];
  const u7 = parsed.units.find((u) => u.code === '7');
  if (u7) {
    const sec = u7.sections.find((s) => /^Prescribed practicals/i.test(s.title || ''));
    if (sec) {
      for (const top of sec.topics) {
        const unitCode = (top.label || '').match(/Unit\s+([BCP]\d)/)?.[1] || null;
        for (const o of top.outcomes) {
          if (!o.practical) continue; // code may sit in a sub-bullet (P6)
          const m = [null, o.practical];
          const inUnit = practicalsInUnits.find((x) => x.code === m[1]);
          prescribed.push({
            code: m[1], unit: unitCode || m[1], title: stripPracticalSuffix(o.text), details: o.bullets.map((b) => b.text),
            sectionId: inUnit?.sectionId ?? null, topic: inUnit?.topic ?? null, unitPage: inUnit?.page ?? null, appendixPage: o.page,
          });
        }
      }
      u7.sections = u7.sections.filter((s) => s !== sec);
    }
  }
  return { prescribed, stats, appliedOverrides };
}

// ---------------------------------------------------------------------------
// Run
// ---------------------------------------------------------------------------
let raw;
if (opt.dump) raw = JSON.parse(fs.readFileSync(opt.dump, 'utf8')).filter((l) => l.page >= opt.from && l.page <= opt.to);
else {
  console.error(`Extracting pages ${opt.from}-${opt.to} from ${opt.pdf} ...`);
  raw = await extractLines(opt.pdf, { from: opt.from, to: opt.to, yTol: opt.yTol });
}
const overrides = fs.existsSync(opt.overrides) ? JSON.parse(fs.readFileSync(opt.overrides, 'utf8')) : {};
const parsed = parse(prepareLines(raw));
const { prescribed, stats, appliedOverrides } = finalise(parsed, overrides);

const result = {
  subject: 'CCEA GCSE Double Award Science (2017)',
  subjectCode: '1370',
  cceaQualificationId: '584',
  source: {
    file: path.relative(ROOT, opt.pdf).replace(/\\/g, '/'),
    pages: `${opt.from}-${opt.to}`,
    generatedBy: 'scripts/build-science-spec.mjs',
    tierRule: 'tier "H" = the learning-outcome stem (excluding its number) is set entirely in bold in the PDF (Higher Tier only); "F" otherwise. Bullets carry their own tier. mixed=true with textMarked (**bold**) marks stems/bullets that are only partly bold.',
  },
  units: parsed.units,
  prescribedPracticals: prescribed,
};
fs.mkdirSync(path.dirname(opt.out), { recursive: true });
fs.writeFileSync(opt.out, JSON.stringify(result, null, 2) + '\n');

// ---------------------------------------------------------------------------
// Report
// ---------------------------------------------------------------------------
console.log(`Wrote ${opt.out}`);
console.log('\nCounts per unit:');
console.log('unit  sections topics  LOs    H    F  mixed bullets bulletsH practicals skills');
for (const [code, s] of Object.entries(stats)) {
  console.log(`${code.padEnd(5)} ${String(s.sections).padStart(8)} ${String(s.topics).padStart(6)} ${String(s.outcomes).padStart(4)} ${String(s.H).padStart(4)} ${String(s.F).padStart(4)} ${String(s.mixed).padStart(6)} ${String(s.bullets).padStart(7)} ${String(s.bulletsH).padStart(8)} ${String(s.practicals).padStart(10)} ${String(s.skills).padStart(6)}`);
}
console.log(`\nPrescribed practicals listed: ${prescribed.length} (${prescribed.map((p) => p.code).join(', ')})`);
if (appliedOverrides.length) console.log(`Overrides applied (${appliedOverrides.length}): ${appliedOverrides.join(', ')}`);

// numbering continuity check
for (const unit of parsed.units) {
  if (unit.code === '7') continue;
  for (const sec of unit.sections) {
    const ids = sec.topics.flatMap((t) => t.outcomes.filter((o) => o.kind === 'lo').map((o) => o.id));
    for (let i = 0; i < ids.length; i++) {
      if (ids[i] !== `${sec.id}.${i + 1}`) { parsed.warnings.push(`${unit.code} section ${sec.id}: LO numbering issue at ${ids[i]} (expected ${sec.id}.${i + 1})`); break; }
    }
  }
}
// spot checks against docs/research/03-ccea-gcse-double-award-science-spec.md (section 5)
const SPOT_CHECKS = [
  ['P1', '1.1.2', 'H'], ['P1', '1.1.3', 'H'], ['P1', '1.1.4', 'H'], ['P1', '1.1.6', 'H'], ['P1', '1.1.1', 'F'], ['P1', '1.1.5', 'F'],
  ['B1', '1.1.3', 'F'], ['B1', '1.6.12', 'H'], ['B1', '1.7.12', 'H'], ['C1', '1.5.8', 'H'], ['C2', '2.4.2', 'H'], ['P2', '2.5.15', 'H'],
];
const findLo = (code, id) => parsed.units.find((u) => u.code === code)?.sections.flatMap((s) => s.topics.flatMap((t) => t.outcomes)).find((o) => o.id === id);
console.log('\nSpot checks:');
let spotFail = 0;
for (const [code, id, tier] of SPOT_CHECKS) {
  const o = findLo(code, id);
  const ok = o && o.tier === tier;
  if (!ok) spotFail++;
  console.log(`  ${ok ? 'PASS' : 'FAIL'} ${code} ${id} expected ${tier}, got ${o ? o.tier : 'MISSING'}`);
}
const expectedPracticals = ['B1', 'B2', 'B3', 'B4', 'B5', 'B6', 'C1', 'C2', 'C3', 'C4', 'C5', 'C6', 'P1', 'P2', 'P3', 'P4', 'P5', 'P6'];
const gotPracticals = prescribed.map((p) => p.code);
const practicalsOk = expectedPracticals.every((c) => gotPracticals.includes(c)) && gotPracticals.length === 18;
if (!practicalsOk) spotFail++;
console.log(`  ${practicalsOk ? 'PASS' : 'FAIL'} 18 prescribed practicals listed (${gotPracticals.length})`);
const expectedLoCounts = { B1: 47, B2: 51, C1: 109, C2: 73, P1: 76, P2: 63 };
for (const [code, n] of Object.entries(expectedLoCounts)) {
  const ok = stats[code]?.outcomes === n;
  if (!ok) spotFail++;
  console.log(`  ${ok ? 'PASS' : 'FAIL'} ${code} has ${n} numbered LOs per the spec numbering (got ${stats[code]?.outcomes})`);
}

if (parsed.warnings.length) {
  console.log(`\nWarnings (${parsed.warnings.length}):`);
  for (const w of parsed.warnings) console.log('  - ' + w);
}
if (spotFail) { console.log(`\n${spotFail} spot check(s) FAILED`); process.exitCode = 1; }
