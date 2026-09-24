#!/usr/bin/env node
/**
 * build-papers-index.mjs
 *
 * Parses the three locally saved CCEA past-paper JSON feeds and writes a
 * normalised, deterministic index to data/papers/index.json.
 *
 *   node scripts/build-papers-index.mjs            # build + print full report
 *   node scripts/build-papers-index.mjs --quiet    # build, print summary only
 *
 * Offline only: it never touches the network and never downloads a PDF.
 * See data/papers/README.md for provenance, copyright rules and how to refresh
 * the feeds.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT_FILE = 'data/papers/index.json';
const ORIGIN = 'https://ccea.org.uk';
const QUIET = process.argv.includes('--quiet');

const FEEDS = {
  504: {
    subject: 'maths',
    name: 'GCSE Mathematics (2017)',
    file: 'docs/sources/maths/ccea-qualification-504.json',
    url: 'https://ccea.org.uk/sites/default/files/qualification/504.json',
  },
  507: {
    subject: 'further-maths',
    name: 'GCSE Further Mathematics (2017)',
    file: 'docs/sources/further-maths/ccea-qualification-507.json',
    url: 'https://ccea.org.uk/sites/default/files/qualification/507.json',
  },
  584: {
    subject: 'science',
    name: 'GCSE Science Double Award (2017)',
    file: 'docs/sources/science/584.json',
    url: 'https://ccea.org.uk/sites/default/files/qualification/584.json',
  },
};

const TYPES = new Set(['Standard', 'Modified', 'Irish Medium']);
const TYPE_SLUG = { Standard: 'standard', Modified: 'modified', 'Irish Medium': 'irish-medium' };
const SERIES_ORDER = { January: 1, March: 2, Summer: 3, November: 4 };
const UNIT_ORDER = {
  maths: ['M1', 'M2', 'M3', 'M4', 'M5', 'M6', 'M7', 'M8'],
  'further-maths': ['FM1', 'FM2', 'FM3', 'FM4'],
  science: ['B1', 'B2', 'C1', 'C2', 'P1', 'P2', 'U7'],
};
const FM_UNIT_NAMES = {
  FM1: 'Pure Mathematics',
  FM2: 'Mechanics',
  FM3: 'Statistics',
  FM4: 'Discrete and Decision Mathematics',
};
// Irish-language FM titles ("Aonad 1 (Le háireamhán) An Ghlanmhatamaitic").
const FM_IRISH_NAMES = [
  [/ghlanmhatamaitic/i, 'FM1'],
  [/meicnic/i, 'FM2'],
  [/staitistic/i, 'FM3'],
];
const SCIENCE_DISCIPLINE = { B: 'Biology', C: 'Chemistry', P: 'Physics' };

/**
 * Per-entry overrides for facts that cannot be derived from the title or the
 * filename. Keyed by feed id. Every override must carry a reason.
 */
const OVERRIDES = {
  // Summer 2019, Foundation Tier, Unit 7 Booklet B, titled only
  // "Practical Skills : Booklet B". In every variant set (Standard, Modified,
  // Irish Medium) the Foundation Booklet B papers present are Biology and
  // Chemistry plus this one, and a Foundation Physics Booklet B mark scheme
  // exists for the session, so this is the Physics booklet by elimination.
  14436: {
    discipline: 'Physics',
    reason: 'discipline inferred by elimination (Summer 2019 F Booklet B: Biology and Chemistry are labelled, Physics is not)',
  },
  10143: { discipline: 'Physics', reason: 'discipline inferred by elimination (Modified set, see 14436)' },
  10079: { discipline: 'Physics', reason: 'discipline inferred by elimination (Irish Medium set, see 14436)' },
};

// ---------------------------------------------------------------------------
// helpers
// ---------------------------------------------------------------------------

const collapse = (s) => String(s ?? '').replace(/\s+/g, ' ').trim();

/** Feed dates are dd/mm/yyyy; return yyyy-mm-dd (or '' if unparseable) for sorting. */
function changedIso(changed) {
  const m = String(changed ?? '').match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  return m ? `${m[3]}-${m[2]}-${m[1]}` : '';
}

/**
 * Trailing accessibility / medium markers, e.g. "(MV18)", "(MV24pt)", "(ML)",
 * "(MV24-IM)", "(MEP62)", "(IM)", "(MS)". Parentheses are optional on either
 * side because the feed contains "(MV18" and "MV24)" as well as bare "ML".
 */
const MARKER_RE = /\s*\(?\s*(?<![A-Za-z0-9])(MV\s?\d{2}(?:\s?pt)?(?:-(?:IM|ML))?|MEP\d+|ML|IM|MS)\s*\)?\s*$/i;

function stripMarkers(title) {
  const markers = [];
  let stem = title;
  for (let guard = 0; guard < 6; guard++) {
    const m = stem.match(MARKER_RE);
    if (!m) break;
    markers.push(m[1].replace(/\s+/g, '').toUpperCase().replace(/PT$/, ''));
    stem = stem.slice(0, m.index).trim();
  }
  return { stem, markers };
}

function parseTier(stem) {
  const m = stem.match(/\b(Foundation|Higher)\b/i);
  if (!m) return null;
  return m[1][0].toUpperCase() === 'F' ? 'F' : 'H';
}

function parseCalculator(stem) {
  if (/non[\s-]*calc/i.test(stem)) return false;
  // "calc" also catches the feed typo "calcuator"; "áireamhán" is Irish for calculator.
  if (/calc|áireamhán/i.test(stem)) return true;
  return null;
}

function parseDiscipline(stem) {
  const m = stem.match(/\b(Biology|Chemistry|Physics)\b/i);
  return m ? m[1][0].toUpperCase() + m[1].slice(1).toLowerCase() : null;
}

function buildUrl(docPath) {
  // The feed paths are already percent-encoded ("%20", "%2C", "%28"...). Use them
  // verbatim. If a future feed ever ships a raw (unencoded) path, encode it once;
  // never re-encode an already-encoded one.
  const alreadyEncoded = /%[0-9A-Fa-f]{2}/.test(docPath);
  const needsEncoding = /[\s"<>\\^`{|}]|[^\x20-\x7E]/.test(docPath);
  const p = !alreadyEncoded && needsEncoding ? encodeURI(docPath) : docPath;
  return ORIGIN + (p.startsWith('/') ? p : '/' + p);
}

// ---------------------------------------------------------------------------
// subject-specific classifiers. Each returns partial fields and appends notes.
// ---------------------------------------------------------------------------

function classifyMaths(stem, notes) {
  // "M4", "M4:", "Unit M4", "M5.1"; the typo "MI:" (M1) is matched case-sensitively
  // so that ordinary words ("Mi...") can never be mistaken for a unit code.
  let um = stem.match(/\bM\s?([1-8])(?:\.([12]))?(?![0-9])/);
  let n;
  if (um) n = Number(um[1]);
  else if ((um = stem.match(/\bMI(?![A-Za-z0-9])/))) {
    n = 1;
    notes.push('unit "MI" read as M1');
  } else return { unit: null };
  const unit = `M${n}`;
  let tier = parseTier(stem);
  let paperNumber = null;
  const pm = stem.match(/\bPaper\s*([12])\b/i);
  if (pm) paperNumber = Number(pm[1]);
  else if (um[2]) paperNumber = Number(um[2]);
  let calculator = parseCalculator(stem);
  const isCompletion = n >= 5;
  if (isCompletion) {
    if (paperNumber == null && calculator != null) {
      paperNumber = calculator ? 2 : 1;
      notes.push('paperNumber inferred from calculator flag');
    }
    if (calculator == null && paperNumber != null) {
      calculator = paperNumber === 2;
      notes.push('calculator inferred from paper number (P1 non-calculator, P2 calculator)');
    }
    if (paperNumber != null && calculator != null && calculator !== (paperNumber === 2)) {
      notes.push(`WARNING calculator flag (${calculator}) disagrees with paper number (${paperNumber})`);
    }
  } else {
    if (paperNumber != null) notes.push(`WARNING unexpected paper number ${paperNumber} on ${unit}`);
    paperNumber = null;
    if (calculator == null) {
      calculator = true;
      notes.push('calculator inferred: M1-M4 are calculator papers');
    } else if (calculator === false) {
      notes.push(`WARNING ${unit} flagged non-calculator`);
    }
  }
  const expectedTier = n <= 2 || n === 5 || n === 6 ? 'F' : 'H';
  if (tier && tier !== expectedTier) notes.push(`WARNING tier ${tier} disagrees with unit ${unit} (expected ${expectedTier})`);
  if (!tier) {
    tier = expectedTier;
    notes.push(`tier inferred from unit ${unit}`);
  }
  return {
    unit,
    unitName: `Unit ${unit}`,
    tier,
    paperNumber,
    calculator,
    discipline: null,
    booklet: null,
  };
}

function classifyFurtherMaths(stem, notes) {
  let unit = null;
  const um = stem.match(/\b(?:Unit|Aonad)\s*([1-4])\b/i);
  if (um) unit = `FM${um[1]}`;
  else {
    for (const [re, u] of FM_IRISH_NAMES) if (re.test(stem)) unit = u;
  }
  if (!unit) return { unit: null };
  // Cross-check the unit name in the title against the unit number.
  const nameChecks = {
    FM1: /pure|ghlanmhatamaitic/i,
    FM2: /mechanic|meicnic/i,
    FM3: /statistic|staitistic/i,
    FM4: /discrete|decision/i,
  };
  const named = Object.entries(nameChecks)
    .filter(([, re]) => re.test(stem))
    .map(([u]) => u);
  if (named.length && !named.includes(unit)) notes.push(`WARNING unit name in title (${named.join('/')}) disagrees with ${unit}`);
  let calculator = parseCalculator(stem);
  if (calculator == null) {
    calculator = true;
    notes.push('calculator inferred: all Further Mathematics units are calculator papers');
  }
  return {
    unit,
    unitName: `Unit ${unit.slice(2)}: ${FM_UNIT_NAMES[unit]}`,
    tier: null,
    paperNumber: null,
    calculator,
    discipline: null,
    booklet: null,
  };
}

function classifyScience(stem, notes) {
  const tier = parseTier(stem);
  if (/\bUnit\s*7\b/i.test(stem)) {
    const discipline = parseDiscipline(stem);
    const bm = stem.match(/Booklet\s*([AB])\b/i);
    return {
      unit: 'U7',
      unitName: 'Unit 7: Practical Skills',
      tier,
      paperNumber: null,
      calculator: null,
      discipline,
      booklet: bm ? bm[1].toUpperCase() : null,
    };
  }
  let letter = null;
  let n = null;
  // "Unit B1: Biology", "B1: Biology", "Unit P1 : Physics"; the typo "CI" (C1) is
  // matched case-sensitively so "Bi" in "Biology" can never be read as a unit code.
  let m = stem.match(/\b([BCP])\s?([12])(?![0-9])/);
  if (m) {
    letter = m[1];
    n = Number(m[2]);
  } else if ((m = stem.match(/\b([BCP])I(?![A-Za-z0-9])/))) {
    letter = m[1];
    n = 1;
    notes.push(`unit "${letter}I" read as ${letter}1`);
  } else {
    // "Unit 1: Physics" (typo for P1)
    m = stem.match(/\bUnit\s*([12])\b/i);
    const d = parseDiscipline(stem);
    if (m && d) {
      letter = d[0];
      n = Number(m[1]);
      notes.push(`unit "Unit ${m[1]}: ${d}" read as ${letter}${n}`);
    }
  }
  if (!letter) return { unit: null };
  const discipline = SCIENCE_DISCIPLINE[letter];
  const titled = parseDiscipline(stem);
  if (titled && titled !== discipline) notes.push(`WARNING discipline word "${titled}" disagrees with unit ${letter}${n}`);
  return {
    unit: `${letter}${n}`,
    unitName: `Unit ${letter}${n}: ${discipline}`,
    tier,
    paperNumber: null,
    calculator: null,
    discipline,
    booklet: null,
  };
}

const CLASSIFIERS = { maths: classifyMaths, 'further-maths': classifyFurtherMaths, science: classifyScience };

// ---------------------------------------------------------------------------
// entry normalisation
// ---------------------------------------------------------------------------

function normaliseEntry(e, feedKey, feed, problems) {
  const notes = [];
  const subject = feed.subject;
  const rawTitle = e.field_title_paper_ms ?? '';
  const title =
    collapse(rawTitle) ||
    collapse(e.title)
      .replace(/^Cleared\/[^:]+:\s*/, '')
      .replace(/\s-\s\[\d+\].*$/, '');
  if (!collapse(rawTitle)) notes.push('field_title_paper_ms empty; title derived from feed title');
  const { stem, markers } = stripMarkers(title);

  const type = TYPES.has(e.type) ? e.type : null;
  if (!type) problems.push({ level: 'error', id: e.id, msg: `unknown type "${e.type}"` });

  const kind = e.mark_scheme === '1' ? 'ms' : e.mark_scheme === '0' ? 'paper' : null;
  if (!kind) problems.push({ level: 'error', id: e.id, msg: `unknown mark_scheme "${e.mark_scheme}"` });
  const titleSaysMs = /^Cleared\/[^:]*\bMS:/i.test(e.title ?? '') || markers.includes('MS');
  const docPath = e.field_document_cloud ?? '';
  const fileSaysMs = /-MS(?:_\d+)?\.pdf$/i.test(docPath);
  if (kind && titleSaysMs !== (kind === 'ms')) notes.push('WARNING feed title kind disagrees with mark_scheme flag');
  if (kind && /-(?:Paper|MS)(?:_\d+)?\.pdf$/i.test(docPath) && fileSaysMs !== (kind === 'ms')) {
    notes.push('WARNING filename kind disagrees with mark_scheme flag');
  }

  const series = SERIES_ORDER[e.series] ? e.series : null;
  if (!series) problems.push({ level: 'error', id: e.id, msg: `unknown series "${e.series}"` });
  const year = /^\d{4}$/.test(e.year ?? '') ? Number(e.year) : null;
  if (!year) problems.push({ level: 'error', id: e.id, msg: `bad year "${e.year}"` });

  const variantTokens = markers.filter((m) => m !== 'IM' && m !== 'MS');
  const variant = variantTokens.length ? variantTokens.join('+') : null;
  if (variant && type === 'Standard') notes.push(`WARNING Standard entry carries modification marker ${variant}`);

  const c = CLASSIFIERS[subject](stem, notes);
  const ov = OVERRIDES[e.id];
  if (ov) {
    for (const [k, v] of Object.entries(ov)) if (k !== 'reason') c[k] = v;
    notes.push(`override: ${ov.reason}`);
  }

  const sessionKey = `${year}-${series}`;
  const entry = {
    id: String(e.id),
    subject,
    qualificationId: String(feedKey),
    series,
    year,
    sessionKey,
    type,
    kind,
    tier: c.tier ?? null,
    unit: c.unit ?? null,
    unitName: c.unitName ?? null,
    paperNumber: c.paperNumber ?? null,
    calculator: c.calculator ?? null,
    discipline: c.discipline ?? null,
    booklet: c.booklet ?? null,
    variant,
    title: rawTitle,
    url: buildUrl(docPath),
    changed: e.changed ?? null,
    pairId: null,
    counterpartIds: [],
    duplicateOf: null,
    notes,
  };

  // completeness checks
  if (!entry.unit) {
    problems.push({ level: 'unclassified', id: e.id, msg: `could not determine unit from "${title}"`, entry });
  } else {
    const missing = [];
    if (subject !== 'further-maths' && !entry.tier) missing.push('tier');
    if (subject === 'maths' && /^M[5-8]$/.test(entry.unit) && !entry.paperNumber) missing.push('paperNumber');
    if (entry.unit === 'U7' && !entry.discipline) missing.push('discipline');
    if (entry.unit === 'U7' && !entry.booklet) missing.push('booklet');
    if (missing.length) problems.push({ level: 'incomplete', id: e.id, msg: `missing ${missing.join(', ')} in "${title}"`, entry });
  }
  for (const n of notes) if (n.startsWith('WARNING')) problems.push({ level: 'warning', id: e.id, msg: `${n} ("${title}")` });

  entry.pairId = [
    subject,
    sessionKey,
    TYPE_SLUG[type] ?? 'unknown',
    entry.unit ?? '?',
    entry.tier,
    entry.paperNumber != null ? `P${entry.paperNumber}` : null,
    entry.booklet ? `Booklet${entry.booklet}` : null,
    entry.unit === 'U7' ? entry.discipline : null,
    entry.variant,
  ]
    .filter((x) => x != null && x !== '')
    .join(':');

  return entry;
}

// ---------------------------------------------------------------------------
// main
// ---------------------------------------------------------------------------

function main() {
  const problems = [];
  const papers = [];
  const generatedFrom = {};
  const feeds = {};

  for (const [key, feed] of Object.entries(FEEDS)) {
    const abs = path.join(ROOT, feed.file);
    const raw = JSON.parse(fs.readFileSync(abs, 'utf8'));
    if (!Array.isArray(raw)) throw new Error(`${feed.file}: expected a JSON array`);
    generatedFrom[key] = feed.file;
    let latestChanged = null;
    for (const e of raw) {
      if (String(e.qualification) !== key) {
        problems.push({ level: 'warning', id: e.id, msg: `qualification ${e.qualification} in feed ${key}` });
      }
      papers.push(normaliseEntry(e, key, feed, problems));
      const iso = changedIso(e.changed);
      if (iso && (!latestChanged || iso > latestChanged)) latestChanged = iso;
    }
    feeds[key] = { subject: feed.subject, name: feed.name, file: feed.file, url: feed.url, entries: raw.length, latestChanged };
  }

  // duplicate ids across feeds would break counterpart lookup
  const seen = new Map();
  for (const p of papers) {
    if (seen.has(p.id)) problems.push({ level: 'error', id: p.id, msg: `duplicate feed id (also in ${seen.get(p.id)})` });
    seen.set(p.id, p.subject);
  }

  // pairing: paper <-> mark scheme sharing a pairId
  const groups = new Map();
  for (const p of papers) {
    if (!groups.has(p.pairId)) groups.set(p.pairId, []);
    groups.get(p.pairId).push(p);
  }
  for (const [pairId, members] of groups) {
    const ps = members.filter((m) => m.kind === 'paper');
    const ms = members.filter((m) => m.kind === 'ms');
    for (const p of ps) p.counterpartIds = ms.map((m) => m.id);
    for (const m of ms) m.counterpartIds = ps.map((p) => p.id);
    // Drupal re-uploads ("-Paper_0.pdf") produce two entries for one document.
    // Keep both, but mark older copies as duplicates of the newest upload (latest
    // `changed`, then highest id): a re-upload is more likely to be the corrected
    // file, and in the feed the re-uploads are sometimes dated a year later.
    for (const same of [ps, ms]) {
      if (same.length < 2) continue;
      const canonical = [...same].sort((a, b) => changedIso(b.changed).localeCompare(changedIso(a.changed)) || Number(b.id) - Number(a.id))[0];
      for (const d of same) if (d !== canonical) d.duplicateOf = canonical.id;
    }
    if (ps.length > 1 || ms.length > 1) {
      problems.push({
        level: 'duplicate',
        id: members.map((m) => m.id).join(','),
        msg: `${pairId}: ${ps.length} paper(s), ${ms.length} mark scheme(s) -> ${members
          .map((m) => `${m.id}[${m.kind}] ${m.url.split('/').pop()}`)
          .join(' | ')}`,
      });
    }
  }

  // deterministic ordering
  const subjOrder = { maths: 1, 'further-maths': 2, science: 3 };
  const typeOrder = { Standard: 1, Modified: 2, 'Irish Medium': 3 };
  const unitRank = (p) => {
    const i = (UNIT_ORDER[p.subject] ?? []).indexOf(p.unit);
    return i === -1 ? 99 : i;
  };
  papers.sort(
    (a, b) =>
      subjOrder[a.subject] - subjOrder[b.subject] ||
      b.year - a.year ||
      SERIES_ORDER[b.series] - SERIES_ORDER[a.series] ||
      typeOrder[a.type] - typeOrder[b.type] ||
      unitRank(a) - unitRank(b) ||
      String(a.tier).localeCompare(String(b.tier)) ||
      (a.paperNumber ?? 0) - (b.paperNumber ?? 0) ||
      String(a.discipline).localeCompare(String(b.discipline)) ||
      String(a.booklet).localeCompare(String(b.booklet)) ||
      String(a.variant).localeCompare(String(b.variant)) ||
      (a.kind === b.kind ? 0 : a.kind === 'paper' ? -1 : 1) ||
      Number(a.id) - Number(b.id),
  );

  // sessions
  const sessMap = new Map();
  for (const p of papers) {
    const k = `${p.subject}|${p.sessionKey}`;
    if (!sessMap.has(k)) {
      sessMap.set(k, {
        subject: p.subject,
        sessionKey: p.sessionKey,
        year: p.year,
        series: p.series,
        units: new Set(),
        standard: { papers: 0, markSchemes: 0, papersWithoutMarkScheme: 0 },
        modified: { papers: 0, markSchemes: 0 },
        irishMedium: { papers: 0, markSchemes: 0 },
        hasMarkSchemes: false,
      });
    }
    const s = sessMap.get(k);
    const bucket = p.type === 'Standard' ? s.standard : p.type === 'Modified' ? s.modified : s.irishMedium;
    if (p.kind === 'ms') bucket.markSchemes++;
    else bucket.papers++;
    if (p.unit) s.units.add(p.unit);
    if (p.type === 'Standard') {
      if (p.kind === 'ms') s.hasMarkSchemes = true;
      if (p.kind === 'paper' && p.counterpartIds.length === 0) s.standard.papersWithoutMarkScheme++;
    }
  }
  const sessions = [...sessMap.values()]
    .map((s) => ({
      ...s,
      units: [...s.units].sort((a, b) => UNIT_ORDER[s.subject].indexOf(a) - UNIT_ORDER[s.subject].indexOf(b)),
    }))
    .sort(
      (a, b) =>
        subjOrder[a.subject] - subjOrder[b.subject] || b.year - a.year || SERIES_ORDER[b.series] - SERIES_ORDER[a.series],
    );

  const out = {
    $schema: 'ccea-papers-index/1',
    generatedFrom,
    feeds,
    origin: ORIGIN,
    counts: countSummary(papers),
    papers,
    sessions,
  };
  const outAbs = path.join(ROOT, OUT_FILE);
  fs.mkdirSync(path.dirname(outAbs), { recursive: true });
  fs.writeFileSync(outAbs, JSON.stringify(out, null, 2) + '\n');

  report(papers, sessions, problems, out);
  const hard = problems.filter((p) => p.level === 'error' || p.level === 'unclassified');
  process.exitCode = hard.length ? 1 : 0;
}

function countSummary(papers) {
  const c = {};
  for (const p of papers) {
    const s = (c[p.subject] ??= { total: 0, byType: {}, standard: { papers: 0, markSchemes: 0, papersWithoutMarkScheme: 0 } });
    s.total++;
    const t = (s.byType[p.type] ??= { papers: 0, markSchemes: 0 });
    if (p.kind === 'ms') t.markSchemes++;
    else t.papers++;
    if (p.type === 'Standard') {
      if (p.kind === 'ms') s.standard.markSchemes++;
      else {
        s.standard.papers++;
        if (!p.counterpartIds.length) s.standard.papersWithoutMarkScheme++;
      }
    }
  }
  return c;
}

function report(papers, sessions, problems, out) {
  const log = (...a) => console.log(...a);
  log(`Wrote ${OUT_FILE}: ${papers.length} entries, ${sessions.length} sessions`);
  for (const [k, f] of Object.entries(out.feeds)) {
    log(`  feed ${k} (${f.subject}): ${f.entries} entries, latest changed ${f.latestChanged}`);
  }

  log('\n== Totals per subject ==');
  for (const [subj, c] of Object.entries(out.counts)) {
    const bt = Object.entries(c.byType)
      .map(([t, v]) => `${t} ${v.papers}p/${v.markSchemes}m`)
      .join(', ');
    log(`  ${subj.padEnd(14)} ${String(c.total).padStart(4)} entries | ${bt} | Standard papers without MS: ${c.standard.papersWithoutMarkScheme}`);
  }

  if (!QUIET) {
    log('\n== Standard entries per session / unit (papers/mark schemes) ==');
    for (const s of sessions) {
      const cells = s.units.map((u) => {
        const inUnit = papers.filter(
          (p) => p.subject === s.subject && p.sessionKey === s.sessionKey && p.type === 'Standard' && p.unit === u,
        );
        const np = inUnit.filter((p) => p.kind === 'paper').length;
        const nm = inUnit.filter((p) => p.kind === 'ms').length;
        return `${u} ${np}/${nm}`;
      });
      const extra = [];
      if (s.modified.papers) extra.push(`mod ${s.modified.papers}`);
      if (s.irishMedium.papers) extra.push(`irish ${s.irishMedium.papers}`);
      log(`  ${s.subject.padEnd(14)} ${s.sessionKey.padEnd(14)} ${cells.join(', ')}${extra.length ? '   [+' + extra.join(', ') + ']' : ''}`);
    }
  }

  log('\n== Standard papers lacking a mark scheme ==');
  const lacking = papers.filter((p) => p.type === 'Standard' && p.kind === 'paper' && p.counterpartIds.length === 0);
  const byS = new Map();
  for (const p of lacking) {
    const k = `${p.subject} ${p.sessionKey}`;
    if (!byS.has(k)) byS.set(k, []);
    byS.get(k).push(p);
  }
  if (!lacking.length) log('  (none)');
  for (const [k, list] of byS) {
    const labels = list.map((p) =>
      [p.unit, p.tier, p.paperNumber ? `P${p.paperNumber}` : null, p.discipline, p.booklet ? `Bk${p.booklet}` : null]
        .filter(Boolean)
        .join('-'),
    );
    log(`  ${k.padEnd(28)} ${list.length.toString().padStart(2)}: ${labels.join(', ')}`);
  }

  const byLevel = (lvl) => problems.filter((p) => p.level === lvl);
  log('\n== Classification problems ==');
  log(
    `  errors: ${byLevel('error').length}, unclassified: ${byLevel('unclassified').length}, incomplete: ${byLevel('incomplete').length}, warnings: ${byLevel('warning').length}, duplicate pairIds: ${byLevel('duplicate').length}`,
  );
  for (const lvl of ['error', 'unclassified', 'incomplete', 'warning', 'duplicate']) {
    const list = byLevel(lvl);
    if (!list.length) continue;
    log(`  -- ${lvl} --`);
    for (const p of list) log(`    [${p.id}] ${p.msg}`);
  }
  const noted = papers.filter((p) => p.notes.some((n) => !n.startsWith('WARNING')));
  log(`\n  entries with informational notes (typos fixed / fields inferred / overrides): ${noted.length}`);
  if (!QUIET) {
    const tally = {};
    for (const p of noted) for (const n of p.notes) if (!n.startsWith('WARNING')) tally[n] = (tally[n] || 0) + 1;
    for (const [n, c] of Object.entries(tally).sort((a, b) => b[1] - a[1])) log(`    ${String(c).padStart(4)}  ${n}`);
  }
}

main();
