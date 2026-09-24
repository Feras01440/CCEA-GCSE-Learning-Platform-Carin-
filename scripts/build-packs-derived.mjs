#!/usr/bin/env node
// Builds the DERIVED parts of the subject packs from the single sources of truth:
//   packs/<subject>/exam-true/tariffs.json   <- data/papers/questions-index.json (parsed paper tariffs; metadata only)
//   packs/<subject>/data-pack/timetable.json <- data/exams/exam-map.json (+ the timetable version table below)
// Everything hand-authored (mark language, command words, formula sheets, rules, ...) lives beside these files
// and is NOT touched here. Re-run after the corpus miner or the exam map changes:
//   node scripts/build-packs-derived.mjs
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const TODAY = new Date().toISOString().slice(0, 10);
const read = (p) => JSON.parse(readFileSync(join(ROOT, p), 'utf8'));
const write = (p, obj) => {
  mkdirSync(dirname(join(ROOT, p)), { recursive: true });
  writeFileSync(join(ROOT, p), JSON.stringify(obj, null, 2) + '\n');
  console.log('wrote', p);
};

// ───────────────────────────── tariffs ─────────────────────────────
// Paper timing (marks / minutes) from the specifications and paper front pages
// (research 01 §2, 02 §2, 03 §2; master plan concept C §6.3).
const TIMING = {
  maths: {
    M1: { Paper: { marks: 100, minutes: 105 } },
    M2: { Paper: { marks: 100, minutes: 105 } },
    M3: { Paper: { marks: 100, minutes: 120 } },
    M4: { Paper: { marks: 100, minutes: 120 } },
    M5: { P1: { marks: 50, minutes: 60 }, P2: { marks: 50, minutes: 60 } },
    M6: { P1: { marks: 50, minutes: 60 }, P2: { marks: 50, minutes: 60 } },
    M7: { P1: { marks: 50, minutes: 75 }, P2: { marks: 50, minutes: 75 } },
    M8: { P1: { marks: 50, minutes: 75 }, P2: { marks: 50, minutes: 75 } },
  },
  'further-maths': {
    FM1: { Paper: { marks: 100, minutes: 120 } },
    FM2: { Paper: { marks: 50, minutes: 60 } },
    FM3: { Paper: { marks: 50, minutes: 60 } },
    FM4: { Paper: { marks: 50, minutes: 60 } },
  },
  science: {
    B1: { H: { marks: 70, minutes: 60 }, F: { marks: 60, minutes: 60 } },
    C1: { H: { marks: 70, minutes: 60 }, F: { marks: 60, minutes: 60 } },
    P1: { H: { marks: 70, minutes: 60 }, F: { marks: 60, minutes: 60 } },
    B2: { H: { marks: 80, minutes: 75 }, F: { marks: 70, minutes: 75 } },
    C2: { H: { marks: 80, minutes: 75 }, F: { marks: 70, minutes: 75 } },
    P2: { H: { marks: 80, minutes: 75 }, F: { marks: 70, minutes: 75 } },
    'U7-BkA': { H: { marks: 15, minutes: 60 }, F: { marks: 15, minutes: 60 } },
    'U7-BkB': { H: { marks: 35, minutes: 30 }, F: { marks: 35, minutes: 30 } },
  },
};
// A single question cannot carry more than this many marks; larger values are segmentation artefacts
// (e.g. a whole non-calculator paper parsed as one question) and are dropped from the samples.
const MAX_PLAUSIBLE_QUESTION_MARKS = { maths: 12, 'further-maths': 20, science: 20 };

function quantile(arr, p) {
  if (!arr.length) return null;
  const s = [...arr].sort((a, b) => a - b);
  return s[Math.min(s.length - 1, Math.max(0, Math.round((s.length - 1) * p)))];
}
const dist = (arr) => ({ n: arr.length, min: quantile(arr, 0), p10: quantile(arr, 0.1), typical: quantile(arr, 0.5), p90: quantile(arr, 0.9), max: quantile(arr, 1) });

function buildTariffs() {
  const index = read('data/papers/questions-index.json');
  const perSubject = {};
  for (const paper of index.papers) {
    if (!paper.totalMatches) continue; // only papers whose parsed tariffs sum to the printed total
    const subj = paper.subject;
    const unitKey = paper.unit + (paper.booklet ? '-Bk' + paper.booklet : '');
    const paperKey = paper.paperNumber ? 'P' + paper.paperNumber : subj === 'science' ? (paper.tier || 'H') : 'Paper';
    const S = (perSubject[subj] ||= { units: {}, commandWords: {} });
    const U = (S.units[unitKey] ||= {});
    const P = (U[paperKey] ||= { papers: 0, sessions: new Set(), questionsPerPaper: [], q: [], part: [], partsPerQ: [], dropped: 0 });
    P.papers++;
    P.sessions.add(paper.sessionKey);
    P.questionsPerPaper.push(paper.questions.length);
    for (const q of paper.questions) {
      if (!q.marks) continue;
      if (q.marks > MAX_PLAUSIBLE_QUESTION_MARKS[subj]) { P.dropped++; continue; }
      P.q.push(q.marks);
      const parts = q.parts.filter((x) => x.marks > 0);
      P.partsPerQ.push(parts.length);
      for (const pt of parts) P.part.push(pt.marks);
      for (const c of q.commandWords || []) {
        const C = (S.commandWords[c] ||= { questions: 0, marks: [] });
        C.questions++;
        C.marks.push(q.marks);
      }
    }
  }
  for (const [subj, S] of Object.entries(perSubject)) {
    const units = {};
    for (const [unitKey, U] of Object.entries(S.units)) {
      units[unitKey] = {};
      for (const [paperKey, P] of Object.entries(U)) {
        const timing = TIMING[subj]?.[unitKey]?.[paperKey] ?? null;
        units[unitKey][paperKey] = {
          status: 'provisional',
          marks: timing?.marks ?? null,
          minutes: timing?.minutes ?? null,
          minutesPerMark: timing ? +(timing.minutes / timing.marks).toFixed(2) : null,
          papersSampled: P.papers,
          sessions: [...P.sessions].sort(),
          questionsPerPaper: { min: Math.min(...P.questionsPerPaper), max: Math.max(...P.questionsPerPaper) },
          perQuestion: dist(P.q),
          perPart: dist(P.part),
          partsPerQuestion: { typical: quantile(P.partsPerQ, 0.5), max: quantile(P.partsPerQ, 1) },
          questionsDroppedAsArtefacts: P.dropped,
        };
      }
    }
    const commandWords = Object.fromEntries(
      Object.entries(S.commandWords)
        .filter(([, c]) => c.questions >= 8)
        .sort((a, b) => b[1].questions - a[1].questions)
        .map(([w, c]) => [w, { questionsTagged: c.questions, questionMarks: dist(c.marks) }]),
    );
    write(`packs/${subj}/exam-true/tariffs.json`, {
      $schema: 'cairn-tariffs/1',
      subject: subj,
      status: 'provisional',
      generatedAt: TODAY,
      generatedBy: 'scripts/build-packs-derived.mjs',
      source: `data/papers/questions-index.json (generated ${index.generatedAt}; metadata only, no question text) — only papers whose parsed tariffs sum to the printed total are used (${index.totalMatchRate * 100}% of papers); questions above ${MAX_PLAUSIBLE_QUESTION_MARKS[subj]} marks are dropped as segmentation artefacts`,
      note: 'Placeholder ranges to be replaced by the full miner (master plan §3.4 mine-stats.mjs) once topic classification exists. "typical" is the median. perQuestion = whole numbered question; perPart = each lettered/numbered part carrying marks. Timing from research 01 §2 / 02 §2 / 03 §2 (concept C §6.3): item timeAllowanceSec = marks × minutesPerMark × 60.',
      units,
      commandWords: {
        note: 'Marks of whole questions whose parsed stem contains the command word (question-level, so multi-part questions inflate the figure). Use the exam-true command-words.json typicalTariff for per-part expectations.',
        ...commandWords,
      },
    });
  }
}

// ───────────────────────────── timetable ─────────────────────────────
// Version / issue data per series (from the timetable PDFs in docs/sources/maths and research 01 §6, 02 §6, 03 §6).
const SERIES_SOURCE = {
  '2026-Summer': {
    version: 'Final GCSE Timetable, Summer 2026 (issued 06/05/2025)',
    source: 'docs/sources/maths/timetable-summer2026.txt; https://ccea.org.uk/downloads/docs/ccea-asset/Examinations/Final%20GCSE%20Timetable%2C%20Summer%202026.pdf',
    contingencyDate: '2026-06-24',
  },
  '2026-November': {
    version: 'Final GCSE Timetable, November 2026',
    source: 'docs/sources/maths/timetable-november2026.txt; https://ccea.org.uk/downloads/docs/ccea-asset/Examinations/Final%20GCSE%20Timetable%2C%20November%202026.pdf',
  },
  '2027-March': {
    version: 'Final GCSE Timetable, March 2027',
    source: 'docs/sources/maths/timetable-march2027.txt; https://ccea.org.uk/document/24027',
  },
  '2027-Summer': {
    version: 'Final GCSE Timetable, June 2027, Version 2 (dated 01/09/2026)',
    source: 'docs/sources/maths/timetable-summer2027-v2.txt; https://ccea.org.uk/downloads/docs/ccea-asset/Examinations/Final%20GCSE%20Timetable%2C%20Summer%202027%20%28Version%202%29.pdf',
    contingencyDate: '2027-06-23',
  },
};
const SESSION_START = { am: '09:15', pm: '13:30' }; // timetable note: "normal start time for morning sessions is 9.15am ... afternoon sessions is 1.30pm"
const ENTRY_CODES = {
  maths: { M1: ['GMC11'], M2: ['GMC21'], M3: ['GMC31'], M4: ['GMC41'], 'M5-P1': ['GMC51'], 'M5-P2': ['GMC52'], 'M6-P1': ['GMC61'], 'M6-P2': ['GMC62'], 'M7-P1': ['GMC71'], 'M7-P2': ['GMC72'], 'M8-P1': ['GMC81'], 'M8-P2': ['GMC82'] },
  'further-maths': { FM1: ['GFM11'], FM2: ['GFM21'], FM3: ['GFM31'], FM4: ['GFM41'] },
  science: { B1: ['GDW11', 'GDW12'], C1: ['GDW21', 'GDW22'], P1: ['GDW31', 'GDW32'], B2: ['GDW41', 'GDW42'], C2: ['GDW51', 'GDW52'], P2: ['GDW61', 'GDW62'], 'U7-Biology-BkB': ['GDW72', 'GDW76'], 'U7-Chemistry-BkB': ['GDW73', 'GDW77'], 'U7-Physics-BkB': ['GDW74', 'GDW78'], 'U7-BookletA': ['GDW71', 'GDW75'] },
};
const addMinutes = (hhmm, mins) => {
  const [h, m] = hhmm.split(':').map(Number);
  const t = h * 60 + m + mins;
  return `${String(Math.floor(t / 60)).padStart(2, '0')}:${String(t % 60).padStart(2, '0')}`;
};
const weekday = (iso) => ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][new Date(iso + 'T12:00:00Z').getUTCDay()];

function buildTimetable() {
  const map = read('data/exams/exam-map.json');
  const rows = { maths: [], 'further-maths': [], science: [] };
  const push = (subject, row) => {
    const meta = SERIES_SOURCE[row.series];
    rows[subject].push({
      ...row,
      weekday: weekday(row.date),
      end: addMinutes(row.start, row.durationMinutes),
      entryCodes: ENTRY_CODES[subject][row.paper ? `${row.unit}-${row.paper}` : row.unit] ?? [],
      version: meta.version,
      source: meta.source,
    });
  };
  for (const p of map.papers) {
    const units = p.unit.split('|');
    for (const unit of units) {
      if (p.papers) {
        // completion tests: two papers, durations by tier
        const tier = ['M5', 'M6'].includes(unit) ? 'F' : 'H';
        for (const pp of p.papers) {
          push(p.subject, { series: p.series, unit, paper: `P${pp.paper}`, tier, date: p.date, session: 'am', start: pp.start, durationMinutes: pp.durationMinutes[tier], timeConfidence: 'printed' });
        }
      } else {
        const duration = typeof p.durationMinutes === 'object' ? p.durationMinutes[unit] : p.durationMinutes;
        const session = p.session ?? (p.start && p.start < '12:00' ? 'am' : 'pm');
        const start = p.start ?? SESSION_START[session];
        push(p.subject, { series: p.series, unit, date: p.date, session, start, durationMinutes: duration, timeConfidence: p.start ? 'printed' : 'session-default (start = normal session start; end computed from duration; re-check against the multi-column PDF)' });
        if (p.then) {
          push(p.subject, { series: p.series, unit: p.then.unit, date: p.date, session, start: p.then.start, durationMinutes: p.then.durationMinutes, timeConfidence: 'printed', follows: unit });
        }
      }
    }
  }
  const seriesInfo = Object.fromEntries(map.series.map((s) => [s.key, { label: s.label, resultsDate: s.resultsDate, notes: s.notes ?? [], contingencyDate: SERIES_SOURCE[s.key]?.contingencyDate ?? null }]));
  for (const subject of Object.keys(rows)) {
    const out = {
      $schema: 'cairn-data-pack-timetable/1',
      subject,
      asOf: TODAY,
      generatedBy: 'scripts/build-packs-derived.mjs',
      source: 'data/exams/exam-map.json (verified 1 Sep 2026 against the Final GCSE Timetables) flattened per unit/paper; per-row source/version fields name the timetable document',
      series: seriesInfo,
      rows: rows[subject].sort((a, b) => a.date.localeCompare(b.date) || a.start.localeCompare(b.start)),
    };
    if (subject === 'science') {
      out.practicalWindows = map.practicalWindows.map((w) => ({ ...w, entryCodes: ENTRY_CODES.science['U7-BookletA'], source: 'GCSE Science Practical Skills — Instructions to Teachers, Summer 2026 (research 03 §5.7); data/exams/exam-map.json' }));
    }
    write(`packs/${subject}/data-pack/timetable.json`, out);
  }
}

buildTariffs();
buildTimetable();
