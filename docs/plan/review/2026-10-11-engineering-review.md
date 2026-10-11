# Engineering review, 11 October 2026

Written for the owner by the `eng-review` agent (Fable; instance B, the one the lead launched at 15:19), read-only on the repository. Measured 15:19–15:46 on 11 Oct 2026 (`date`) against the working tree at 514c7aa and build 15 (`../cairn-build/out`, commit 662cd3b, served at http://localhost:3200). Every number below has its command or file in `scratchpad/reports/eng-review/B/EVIDENCE.md`; the scripts that produced them are beside it. The product judgement is in `2026-10-11-programme-assessment.md` and is not repeated here: this is the engineering one.

---

## The page to read first

1. **Size.** About 85,400 non-blank lines of hand-written code (app 1,857; src 51,295; pipeline 9,192; scripts 16,644; e2e 6,418) plus 25,292 lines of unit tests and 21,834 lines of Markdown documentation; 545 content JSON files (82 MB) compiled into 204 shipped bundles (35 MB); an export of 6,117 files and 185 MB; 17 runtime dependencies, five of them imported by nothing; 237 commits on nine calendar days since 24 September.
2. **Checks.** Type check 0 errors; 3,392 unit tests green in 25 s; 374 Playwright tests in 18 files, all green on build 15 (7.6 minutes run file by file). The content pipeline, lints, readiness rule and spec–content contract are the best engineering in the repository.
3. **What a team would definitely dislike**, in order: the marking engine and the lesson logic live inside `src/components/items` and are imported back by `src/lib` (13 upward edges, 3 import cycles); two functions of 501 and 783 lines carry most of the risk (`markAnswerInner`, `SlidesRun`); nothing catches a runtime error, so one thrown render blanks the whole app; the only backup is a manual button; the repository is public with personal notes tracked and five dead dependencies (144 MB) installed; commit subjects average 254 characters; CI (968 lines, written today) has never run and `origin/main` is 33 commits behind.
4. **What a team would like**: content as data behind a 2,089-line Zod schema with verification logs and withdraw-and-replace; a pure, well-tested engine (test-to-code 0.68 in `src/lib/marking`); one readiness rule shared by the build, the app and the specs; `e2e/content.ts`, so a content change cannot break a test without breaking the product; header comments that say *why* (18 % of production lines), which made every "where does this live?" search a one-grep answer.
5. **Old laptop.** Copy the export and serve it: it runs on a 2015 dual-core with 4 GB and a 2023-or-newer browser. Measured at 4× CPU slow-down: Today interactive in about 1.3 s, Slides 1.0 s, Welcome 0.8 s; the Read lesson is the slow page (3.3 s, 1.3 s of blocked main thread, 5.4 MB of JavaScript, 4,141 DOM nodes). At 6×: Read about 5 s, everything else under 3.5 s. Building on that laptop is a 25–40-minute, 4-GB-marginal job; do not.
6. **Durability.** A version-1 database upgrades to today's version 5 with its rows kept (probed); an older build still opens a newer database; the export/restore path checks only a schema id. Nothing asks the browser to persist storage, nothing reminds her to back up, nothing logs a crash.
7. **Security of a static app** is good where it matters (no secrets, no server, KaTeX with `trust:false`, SVG stripped of scripts and handlers) and absent where it is cheap (no Content-Security-Policy; a regex sanitiser; a critical Next advisory one minor version away from fixed).
8. **Against the platforms online**, Cairn's architecture is closest to Anki's (local-first, data on the device) and simplest of all but PMT's. What every account-based platform has and Cairn does not is a backend: accounts, sync, dashboards, telemetry, adaptivity at scale. The engineering cost of parity on the first two is weeks, not months; the rest needs data Cairn does not collect.
9. **The way it is built is the right way for a one-learner product and a wrong-sized way for 2027**: the content pipeline, the engine contracts, builds from committed state, the definition of done and the metrics line should be copied; module boundaries, file-size limits, CI from day one, a backend decision, telemetry, i18n and a design system in code should be done differently from the first week.
10. **First three corrections**: push and make CI green (half a day); error boundaries plus a crash log plus a backup nudge (two days); move the engine out of `components`, split the two giant functions, delete the five dead dependencies (one week). Everything else in §7 follows.

---

## 1. How large is the code, and what each part is for

### 1.1 The areas

| Area | Files | Non-blank lines | What it is for |
|---|---|---|---|
| `app/` | 23 | 1,857 | Next.js routes: Today, learn, flashcards, papers, practise, review, map, ledger, settings, welcome, a `/lab/` gallery. Thin: each page reads the catalogue and hands off to a component. |
| `src/components/` | 129 | 30,350 | The screens. `items` (41 files, 13,178 lines) holds the answer fields *and* the marking engine's dispatcher, text, equation, mistake and lint code; `slides` the deck runner; `topic` Read, the hero, practice; `companion`, `papers`, `figures`, `shell`, `ux`. 95 of 241 production files are `"use client"`. |
| `src/lib/` | 89 | 20,944 | The pure logic: `content` (schema 2,089 lines, taxonomy, loader), `marking` (numeric, algebra, working, plots, matrices…), `slides` (cards, readiness, minutes, recall), `db` (Dexie), `plan`, `grades`, `srs`, `companion`, `papers`, `review`. |
| `src/**/*.test.ts` | 130 | 25,292 | Vitest unit tests (3,392 tests). |
| `pipeline/` | 20 | 9,192 | The content build (`build-content.mts`, 268 lines), decks, the misconception registry sources (five files of 800–1,800 lines that are data written as code), enrichment and mining. |
| `scripts/` | 50 | 16,644 | Spec builders, paper index, `verify.mjs` (the local loop), `serve-export.mjs`, `build-sw.mjs`, and `scripts/qa/` (16 lints, 5,025 lines). |
| `e2e/` | 20 | 6,418 | Playwright: 18 spec files, `content.ts` (the contract), `helpers.ts`. |
| `.github/` | 8 | 871 | CI, nightly, preview deploy, Lighthouse budgets, a summary script. Never run. |
| `docs/` | 86 `.md` | 21,834 | Plans, reviews, research, dev notes, rulings, build notes. On disk 682 MB because `docs/sources` (ignored) holds the CCEA corpus. |
| Content | 545 JSON | 82 MB | `packs/<subject>/content/<unit>/<topic>/{bundle.json, note.blocks.json}`: 204 topics in 14 units; 2,828 questions, 512 worked examples, 1,763 diagnostic items, 432 find-the-mistakes, 1,536 prompts; 2,879 flashcards in 14 decks. Shipped: 204 files, 35 MB. |
| Reference data | 131 files | 9.6 MB | `data/spec` (the three specifications as JSON), `data/papers` (every paper and scheme, 3.4 MB and 1.5 MB indexes), grades, exam map, enrichment, media map, personal notes. |

There is no backend and no database server. "Backend" is the pipeline that runs on the developer's machine; "database" is one IndexedDB per browser, ten tables, schema in `src/lib/db/db.ts`.

### 1.2 Dependencies (17 runtime, 14 dev)

| Package | For | In the shipped bundle | Installed |
|---|---|---|---|
| next 16.3.4, react/react-dom 19.2.8 | framework, static export, UI | the 223 KB + 156 KB framework chunks every page loads | 195 MB + 9 MB |
| dexie 4.4.5, dexie-react-hooks | learner data in IndexedDB, live queries | a 118 KB chunk (with ts-fsrs) | 5 MB |
| ts-fsrs 5.4.2 | spaced-repetition scheduling | with dexie | 1 MB |
| zod 4.5.4 | the content schema and lints | build time only | 8 MB |
| katex 0.18.5 (+mhchem) | maths rendering | the 107 KB CSS and part of a 724 KB chunk | 5 MB |
| @cortex-js/compute-engine 0.120 | algebraic equivalence in marking | its own 2,604 KB chunk (726 KB compressed), fetched only where marking happens since build 15 | 38 MB |
| motion 13.1.1 | animation | a 120 KB chunk | 1 MB |
| lucide-react 1.39 | icons | 26 KB | 39 MB |
| clsx | class names | tiny | — |
| **mathlive, jsxgraph, mafs, pdfjs-dist, zustand** | **nothing: imported by no file in app, src, pipeline, scripts or e2e** | not shipped | **144 MB**, and two of the nine `npm audit` advisories arrive through mafs |
| dev: @playwright/test 1.63, vitest 4.1, typescript 7.0.2, tailwindcss 4.3, tsx, fake-indexeddb, serve, @axe-core/playwright | tests, build, the export server | — | node_modules 781 MB in all |

`npm outdated` lists 19 packages behind (next 16.3.4 → 16.4.0, compute-engine 0.120 → 0.151, vitest 4 → 5). `npm audit`: 9 advisories, one critical (next 16.0.0–16.3.7: `next/og`, cache poisoning, a dev-server endpoint), five high (serve/compression, brace-expansion, sharp, source-map-js: all dev-time or transitive).

### 1.3 The ten largest hand-written files, and what they do

| Lines | File | What it does |
|---|---|---|
| 2,331 | `src/lib/marking/numeric.ts` | reads whatever she types as a number (fractions, surds, standard form, units, money, percentages) and marks it against a numeric spec; `parseNumericInner` alone is 260 lines |
| 2,217 | `scripts/science-topics-source.mjs` | the science topic layer, written as code (data, not logic) |
| 2,089 | `src/lib/content/schema.ts` | the Zod schema of every pack file: 107 object schemas, 72 exported types; imported by 52 files (the highest fan-in) |
| 1,890 | `src/components/items/mistake-marking.ts` | the find-the-mistake fix box and faded worked-example step matching |
| 1,819 | `src/lib/marking/algebra.ts` | algebraic equivalence, forms (simplified, factorised, single log…), using the compute engine |
| 1,776 | `pipeline/mine/insights-source/further-maths.mjs` | the misconception registry's Further Maths entries (data as code) |
| 1,684 | `e2e/learn.spec.ts` | the Read lesson walks |
| 1,490 | `src/components/figures/apparatus/layouts.ts` | how apparatus diagrams are laid out |
| 1,463 | `e2e/slides.spec.ts` | the Slides walks |
| 1,447 | `src/components/items/mark.ts` | the one marking entry point that dispatches to the engines; `markAnswerInner` is 501 lines |

Twenty-six of 331 hand-written files are over 800 lines; the median file is 148. Of 2,249 functions, the median is 8 lines, the 90th percentile 40, and 100 are over 80 lines (46 over 150, 8 over 300). The 261 React components have a median of 25 lines; 32 are over 150 and 5 over 300 (`SlidesRun` 783, `QuestionRunner` 391, `PlotField` 365, `PaperRunner` 339, `TodayTiles` 305).

### 1.4 Shape and tooling

- 907 exported functions (12 hooks), 333 exported constants, 523 exported types; 326 exported functions/consts are named by no other production file, 183 of those only by tests (mostly thresholds exported for testing, some genuinely dead).
- TypeScript `strict: true`; 3 `any` in production; 0 `console.*` in production; 9 `ts-ignore`/`eslint-disable` markers; 3 TODOs.
- No ESLint, no Prettier, no `.editorconfig`, no `.nvmrc`: `npm run lint` is `tsc --noEmit`. Formatting is consistent anyway because one author (the agents) wrote it, which is luck, not a guard.
- Comments: 9,454 of 51,295 production lines (18 %), mostly header blocks that state the rule and the date it was decided.

### 1.5 How the pieces fit (the data flow)

```
 CCEA specifications, papers, schemes, examiner reports (private, git-ignored)   other boards' resources
        │ read by authors (agents) and distilled; never copied                           │
        ▼                                                                                ▼
 packs/<subject>/content/<unit>/<topic>/bundle.json + note.blocks.json      data/spec/*.json, data/papers, data/grades,
 545 JSON · 82 MB · Zod schema src/lib/content/schema.ts · verification logs   data/exams, data/enrichment, data/links
        │  tsx pipeline/build-content.mts --strict   (validate → lint → readiness rule → publish)
        ▼
 public/content/<subject>/<id>.json (204 · 35 MB)      src/generated/manifest.json (204 rows: ready, readyVia, counts)
 public/decks/*.json (pipeline/build-decks.mts: 2,879 cards)
        │  next build (output: "export")  → 957 prerendered pages; the topic page reads its bundle from disk at build time
        │  scripts/fix-export.mjs (RSC payload files) · scripts/build-sw.mjs (sw.js: 252-URL precache, 2,523-URL on-demand set)
        ▼
 out/  6,117 files · 185 MB  ──  any static host: scripts/serve-export.mjs on :3200, Cloudflare Pages, Vercel
        ▼
 the browser
   ├─ one note → Read v2 (StepRevealNote, TopicContent) and Slides (src/lib/slides/cards.ts → SlidesRun)
   ├─ marking in the browser: mark.ts → numeric · algebra (+ compute engine, lazy 2.6 MB) · text · equation · plot · matrix · working ladder
   ├─ readiness: src/lib/slides/readiness.ts, the same rule the build wrote into the manifest, also imported by e2e/content.ts
   └─ Dexie "ccea-study" v5 · IndexedDB · 10 tables ── Settings: Export backup (JSON) / Restore
 checks: vitest 3,392 · Playwright 374 (reads content through e2e/content.ts) · npm run content:check (strict build + lesson-v2
         + figure-leaks + svg-draws) · shingles (private corpus) · scripts/verify.mjs · .github/workflows (never run)
```

The ten Dexie tables: `cards` (FSRS state per prompt), `attempts` (every answer, kept forever), `mastery` (per topic), `sessions`, `settings`, `mocks` (timed past papers with UMS), `flow` (where each topic's first visit stands), `companionNotes`, `companionState`, `reports` ("Something wrong?" reports). Versions 1–5 only add tables; no upgrade function exists or is needed yet.

---

## 2. What a complete team would say

I read the largest files, the engine's entry point, `SlidesRun`, the pipeline build, `lesson-v2.mjs`, `figure-leaks.mjs`, `e2e/content.ts`, the database, the export, the service worker and the sanitiser, and measured the rest. Here is the review a tech lead, two front-end engineers, a QA engineer, a designer and a content engineer would give.

### 2.1 Definitely dislike (ranked by how much it would cost them later)

**D1. The engine lives in the wrong place and the layers point upwards.** `src/components/items` holds `mark.ts`, `text-marking.ts`, `equation-marking.ts`, `mistake-marking.ts`, `gates.ts`, `content-lint.ts` and `keyword-lint.ts`: about 6,500 lines of pure, UI-free logic in a folder named for React components. `src/lib` imports from it 13 times (`src/lib/marking/working.ts → components/items/mistake-marking.ts`, `src/lib/slides/readiness.ts → components/items/gates.ts`, `src/lib/content/media.ts → components/media/VideoEmbed.tsx`…), and the graph has three cycles: `lesson-plan.ts ↔ lib/slides/{cards,minutes,enrichment}`, `db.ts ↔ companion/memory.ts ↔ backfill.ts`, `mark.ts ↔ lib/marking/working.ts ↔ topic/reteach.ts`. The brief itself has to say "the marking engine is `src/components/items/*marking*.ts`, `mark.ts` and `src/lib/marking/`" because no folder says so. A new engineer cannot tell from the tree what is logic and what is screen, and nothing stops the next cycle. *Fix:* move the seven files to `src/lib/marking` and `src/lib/content`, make `src/lib` forbidden from importing `src/components` and `app` (an ESLint `import/no-restricted-paths` rule, or a 30-line test over the import graph: the script in `scratchpad/reports/eng-review/B/import-graph.mjs` already finds the edges), and break the three cycles by moving the shared types down. *Cost:* two to three days, mostly import rewrites; the 3,392 tests prove nothing moved.

**D2. Two functions hold most of the risk.** `markAnswerInner` (`mark.ts:947–1447`) is 501 lines with roughly 247 branches: every answer kind, the form-task rules, show-that, follow-through, common errors and the working ladder in one body. `SlidesRun` (`SlidesRun.tsx:108–890`) is a 783-line component with 24 `useState`, 8 `useEffect`, 6 `useRef` and 20 memoised callbacks: the deck's whole state machine (position, answers, retries, pauses, keyboard, a live region, the engine prefetch) lives inside one React function. `QuestionRunner` (391 lines), `markText` (304), `PlotField` (365), `TodayTiles` (305) are the same shape. A team would say: nobody can review a change to these with confidence, and the e2e suite is doing the job a unit test of the state machine should. *Fix:* `markAnswerInner` becomes a 60-line dispatcher plus one module per spec kind (`numeric`, `algebraic`, `text`, `mcq`, `equation`, `graph`, `table`, `matrix`, `order`), each with the tests that already exist for it in `mark.test.ts` (2,232 lines) moved beside it; `SlidesRun`'s state becomes a reducer in `src/lib/slides/run.ts` (`{ pos, answers, missed, paused }` and the events `continue`, `answer`, `back`, `pause`), unit-tested against the trial deck, with `SlidesRun` left as a 200-line view. *Cost:* a week for both, with the engine's corpus guard and the `slides` spec file as the safety net.

**D3. Nothing catches a runtime error.** There is no `ErrorBoundary`, no `app/error.tsx`, no `app/global-error.tsx`, no `app/not-found.tsx`, no `window.onerror`, no `unhandledrejection` handler and no crash log (grep over `app/` and `src/`). Twenty-nine `useLiveQuery` call sites read the database during render; `dexie-react-hooks` rethrows a querier's error into render, so a blocked database, a quota error, or one malformed row from a restored backup unmounts the whole tree: a blank page, with no message and no record. The same for any content edge case a renderer does not expect. For a learner alone at night this is the worst failure mode the app has. *Fix:* `app/error.tsx` and `app/global-error.tsx` ("Something went wrong on this screen · Try again · Back to Today"), a boundary around each stage (the Slides card, the Read lesson, the practice runner, the paper runner) so a bad card loses one card and not the session, and a `crashes` table in Dexie (last 50: time, route, message, stack, build) shown under Settings → Diagnostics with "Copy". *Cost:* one day.

**D4. Her progress has one copy, and nothing reminds her.** Backup is Settings → "Export backup" (a JSON download) and "Restore from file". There is no reminder, no automatic copy, no `navigator.storage.persist()` request (so a browser under storage pressure, or Safari's seven-day rule for a site not installed to the home screen, may evict it), and `importAll` checks only a schema id: no version, no row shape. The upgrade probe (`B/b-dexie-upgrade.out`) shows the schema side is sound today: a version-1 database with rows opens under version 5 with the rows kept and the backfill run; a version-4 build opens a version-5 database; a same-version index change is patched by Dexie with a warning. But none of that is a test in the repository, and the restore path would accept a file whose rows the app cannot read. *Fix now:* request persistence after the first answer and show its state in Settings; a one-tap backup nudge after seven days or fifty attempts; `importAll` validates with a Zod schema per table and refuses with a message; the probe becomes `src/lib/db/upgrade.test.ts`. *Cost:* one to two days. *Fix later:* an account and sync (§5).

**D5. The repository hygiene a team would not accept.** The repository is **public** (`gh repo view`: `visibility: PUBLIC`) and tracks `data/personal/notes.json`, the giver's notes to his sister, which `src/lib/gift/unlocks.ts` also compiles into the JavaScript bundle. Five runtime dependencies (144 MB) are installed and never imported. 311 files under `scratchpad/` are tracked although the folder is ignored, so agents' generator scripts show as modified in `git status` (seven of them did at the start of this review). Commit subjects average 254 characters (230 of 237 are over 72; the longest is 1,144): `git log --oneline` is unreadable, and 18,332 words of commit messages carry decisions that belong in `RULINGS.md` and a changelog. No root `README.md`, `LICENSE`, `CHANGELOG.md` or `CONTRIBUTING.md`. No tags, so "build 15" exists only as a service-worker stamp and a note. *Fix:* make the repository private or move the notes out of git (ten minutes); `npm uninstall mathlive jsxgraph mafs pdfjs-dist zustand` (ten minutes; removes two advisories); `git rm -r --cached scratchpad` (ten minutes); a commit template of a 60-character subject and a body; `git tag build-16` on the next cut; a 60-line root README. *Cost:* two hours in all.

**D6. CI was written today and has never run; the remote is 33 commits behind.** `.github/` holds 871 non-blank lines of workflow, actions, a Lighthouse budget and a nightly, all dated today; `gh run list` returns nothing; `origin/main` was last pushed on 9 Oct, 00:08. Until it runs on a Linux runner nobody knows that the paths, fonts, `tsx` registration and `serve` supervisor behave there. A suite that never runs is documentation (the programme assessment's own words about the specs, now true of CI). *Fix:* push, read the first run, fix what breaks. *Cost:* half a day, and the Cloudflare secrets for the preview.

**D7. One file of marking rules nobody can read.** `docs/dev/README.md` is 164 lines and 44 KB; its marking-rules section (lines 111–135) is twenty-five paragraphs, several over 1,000 characters, each a rule plus its history. The content is excellent and the format defeats it; the same is true of the `lesson-v2.mjs` paragraph. *Fix:* `docs/dev/marking-rules.md` with one rule per heading and the history moved to a dated "decisions" list; the README keeps the run/test/layout page. *Cost:* two hours.

**D8. The bundle still ships what the page does not use.** Every page's HTML loads an 836 KB (204 KB compressed) chunk that is the specification catalogue, the exam map, the grade boundaries and the misconception registry compiled from JSON into JavaScript (`src/lib/content/taxonomy.ts` and friends import `data/spec/*.json`); Today, Settings and Map load 1.8 MB of JavaScript (decoded) to show a few tiles. The Read lesson fetches the 2.6 MB compute engine with the lesson because its questions mark as they draw (the build-15 note says so). `/practise/` makes 100 requests and transfers 3.3 MB on arrival. *Fix:* the catalogue as JSON fetched by the pages that need it (or split per subject); the Read lesson's questions mark on Check, not on draw; Practise fetches bundles as the set advances. *Cost:* two to three days; the measurement scripts in `B/` give the before and after.

**D9. The QA scripts are powerful and untested.** Sixteen lints, 5,025 lines, single files of up to 1,184 lines (`figure-leaks.mjs`) with functions of 249 lines and about 130 branches (`depthOf`, `checkNote` in `lesson-v2.mjs`), fatal flags per unit kept in a JSON file, and **no tests** (vitest includes only `src/**`). The lints in `src/components/items/content-lint.ts` do have 942 lines of tests; the scripts that gate every build do not. A content engineer would ask how a lint is proved right before it fails a pack. *Fix:* move the rule bodies into `src/lib/qa/*.ts` with fixtures (a passing note, each failing shape), leave `scripts/qa/*.mjs` as thin CLIs; one shared CLI (`node scripts/qa/run.mjs --unit fm1 --see --teach`) instead of sixteen entry points. *Cost:* a week, spread over the next passes.

### 2.2 Like a bit

- **The database design.** Ten tables with clear owners, additive versions, a lazy singleton, a ready hook for the one backfill, comments that say which version added what. They would like upgrade tests, persistence and a crash table (D3, D4).
- **The tests.** 3,392 unit tests in 25 s is a healthy base; `src/lib/marking` at 0.68 test lines per production line, `lib/slides` 0.77, `lib/review` 0.95. But the pyramid has a hole: no component-level tests at all (no Testing Library), and seven feature folders with zero tests (`settings`, `map`, `media`, `practise`, `ledger`, `learn`, `components/slides` at 0.21, `papers` at 0.05). The e2e suite covers them, slowly (7.6 minutes, one topic).
- **The comments.** The *why* on every rule is the thing a new developer thanks you for; the dated history inside them ("engine item 10.4, 23 Sep 2026: the panel promised a re-check while its handler threw the words away") is a changelog living in the code. They would keep the rule and move the story.
- **The documentation.** Eighty-six Markdown files, a plan, reviews with evidence, build notes with three measures, `RULINGS.md` indexed by date: far more than most teams write. What is missing is the map (a root README that says which five files to read) and ADRs as a folder, so that a decision is one page with its context, options and consequence rather than a line in a log.
- **Duplication.** 3.9 % of production lines sit in a repeated six-line block, which is low; but the typed-answer fields repeat each other's shell (TableField 49 % duplicated, MatrixField 48 %, LabelField 43 %, InlinePrompt 42 %, TransformationField 35 %), and `Markdown.tsx` and `slides/ui.tsx` share a 24-line block. A field shell component (label, aria, the verdict row, the disabled state) would remove most of it in a day.
- **Tailwind inside 300-line components.** Fine for one product; a design system in code (tokens exist in `globals.css`; the components do not consume them as named primitives) is what a designer would ask for before a second product.

### 2.3 Like

- **Content as data with a real schema.** `schema.ts` is the single source of truth (107 object schemas; exported as JSON Schema for editors), every item carries a verification log, only `verified`/`published` items ship, and a wrong item is withdrawn and replaced under a new id, never edited. This is how a content team at scale works, and it is already here.
- **A pure engine with contracts and a corpus guard.** `markAnswer(raw, spec, opts) → MarkResult`, "pure; never throws on learner input", with the mark scheme's own vocabulary (M, A, B, follow-through, show-that) in the result. The 8 Oct battery (1,713 engine tests, 11,575 fixture checks, a mutation run) is the right kind of evidence, and today's gate records are the right kind of change control.
- **One readiness rule in three places.** `src/lib/slides/readiness.ts` is imported by the build (which writes `ready` into the manifest), by the app (the hero, the Slides route, the static params) and by `e2e/content.ts`, so a test, the export and the page cannot disagree about what is ready. The deck grammar reads the note through the same `sectionsOf`.
- **The spec–content contract.** `e2e/content.ts` (415 lines) is the only place a spec reads content, through the app's own functions; the specs name one topic and derive every count and id. This is the single best test-engineering decision in the repository.
- **Builds from committed state, with notes.** The lead cuts each build in a detached worktree, serves it from there, identifies it by the service-worker stamp, and writes a one-page note with the same three measures each time (`docs/plan/builds/`).
- **Findability.** Three "where does this live?" tasks each resolved in one or two greps and under a quarter of a second of searching (the deck counter → `src/lib/slides/dealt.ts`; retries → `cards.ts withRetries`; the next paper → `exam-plan.ts nextPaper`), because files start with a paragraph that names the rule, the date and the neighbours.
- **The offline design.** A 252-URL shell precache (13.6 MB on disk, 6.0 MB compressed) at install, pages kept as visited, and the 79 MB full copy only on an explicit tap, remembered per device. Nothing large is downloaded without consent.
- **Hygiene where it is cheap.** `strict: true`, three `any`, zero `console.*`, no secrets in code, a supervisor for the export server with the reason for every rule written above it.

### 2.4 Solving the dislikes, in order of value for effort

| Order | Work | Effort | What it buys |
|---|---|---|---|
| 1 | Push; make CI green; add the Cloudflare secrets (D6) | ½ day | every commit checked; a phone link per build |
| 2 | Error boundaries + crash table + backup nudge + `storage.persist()` + restore validation + the upgrade test (D3, D4) | 2 days | no blank screens; no silent data loss |
| 3 | Private repository or notes out of git; uninstall the five dead dependencies; untrack `scratchpad`; commit template; tag builds; root README; split the marking rules (D5, D7) | 3 hours | a repository a stranger can open |
| 4 | Move the engine and lints to `src/lib`; a layer rule; break the three cycles (D1) | 3 days | a tree that says what is what; no new cycles |
| 5 | Split `markAnswerInner` and `SlidesRun` (D2) | 1 week | reviewable changes; a tested state machine |
| 6 | Catalogue off the critical path; Read marks on Check; Practise fetches as it goes (D8) | 3 days | Today under 300 KB; Read under 1 s of blocking at 4× |
| 7 | Field shell component; QA rule bodies into `src/lib/qa` with fixtures (D9, 2.2) | 1–2 weeks, spread | lints proved before they gate; half the field code |

---

## 3. Running it on an old laptop

Two routes. The first is the one to use.

### 3.1 Route A: copy the built export and serve it (no build on the laptop)

1. On this PC the export already exists: `../cairn-build/out` (build 15: 6,117 files, 185 MB). Zip it before copying (many small files copy slowly over USB).
2. On the laptop, unzip to a folder, say `C:\cairn\out`.
3. Serve it from that folder. Either install Node.js (any LTS from 20 up; the project itself runs on 24) and run `npx serve out -l 3200 --no-etag` (the exact command the project's Playwright config uses), or with Python 3 and no Node at all: `python -m http.server 3200 --directory out`. Both serve `/learn/maths/M4/` from `index.html` the way the export expects (`trailingSlash: true`). Python sends no compression, which does not matter on the same machine.
4. Open `http://localhost:3200/` in a current browser. `localhost` counts as secure, so the service worker installs and the app works offline afterwards; a LAN address (`http://192.168…`) does not install it, as `docs/dev/deploy.md` says.

What it needs: about 400 MB of disk (the export plus the browser's cache), 4 GB of RAM, any dual-core processor from about 2013 on, and a browser from 2023 or later (Tailwind 4's CSS needs Chrome 111+, Safari 16.4+, Firefox 128+; Windows 7 cannot run such a Chrome, so the laptop needs Windows 10/11, a recent macOS or Linux). No internet, except for the linked videos, PhET simulations and CCEA papers, which are external.

### 3.2 Route B: clone, install, build

1. Install Git and Node 22.12 or newer (`require(esm)` for the compute engine needs it; the project is built on 24.18).
2. `git clone …` (the pack is 91 MB; the checkout about 150 MB more).
3. `npm install`: 781 MB of `node_modules`, 31 packages; two to four minutes on an SSD with good internet, ten or more on a 2015 hard disk.
4. `npm run build`: on this PC the content build takes about 15 s, `next build` compiles in 28.5 s and prerenders 957 pages in 96 s with 15 workers, and the whole command about 3.5 minutes. A 2015 dual-core has two workers and is about 2.5× slower per core, so the prerender alone is on the order of 957 pages × 3.8 s ÷ 2 ≈ 30 minutes, and the build needs 2–3 GB of memory while it runs. Expect 25–40 minutes with everything else closed, and a real chance of an out-of-memory failure on 4 GB (set `NODE_OPTIONS=--max-old-space-size=3072` and retry, or build elsewhere and use route A). This is an estimate from the measured numbers, not a measured build on such a machine.
5. Then serve as in route A, or `npm run dev` for the development server (the first compile of a lesson route will take tens of seconds on such a machine; usable for reading code, not for her).

Minimum machine for route B: 8 GB of RAM and an SSD; 4 GB is marginal.

### 3.3 How it would perform (measured)

Measured on build 15 at http://localhost:3200 with Playwright's Desktop Chrome at 1366×768 (a 2015 laptop screen), the service worker blocked (a first visit), the CPU slowed 1×, 4× and 6× through the DevTools protocol, median of two runs. This PC is an i7-13620H; a 2015 Core i5 ULV is roughly 2.5–3× slower per core, so **4× is a fair proxy for a 2015 i5 and 6× for a 2015 Pentium/Celeron or a throttled i3**. The machine was busy with other agents' browsers during the run, so the 1× column is already pessimistic. TTI is Lighthouse's rule (the first moment after DOMContentLoaded with no long task for five seconds) without its network-quiet clause.

| Page | CPU | Sent | JS sent / decoded | DOM ready | Load | Interactive | Main thread blocked | Longest task | JS heap | DOM nodes |
|---|---|---|---|---|---|---|---|---|---|---|
| Today `/` | 1× | 1,055 KB | 819 / 2,847 KB | 134 ms | 227 ms | 134 ms | 0 | 0 | 10 MB | 352 |
| | 4× | | | 45 | 238 | **1,259** | 260 | 137 | | |
| | 6× | | | 80 | 433 | 2,303 | 623 | 244 | | |
| Welcome | 1× | 861 KB | 680 / 2,433 KB | 27 | 147 | 27 | 0 | 0 | 8.5 MB | 102 |
| | 4× | | | 45 | 296 | **769** | 317 | 273 | | |
| | 6× | | | 101 | 543 | 1,431 | 666 | 486 | | |
| Read lesson (FM1 trial) | 1× | 1,955 KB | 1,536 / 5,445 KB | 29 | 129 | 488 | 30 | 80 | 19 MB | 4,138 |
| | 4× | | | 69 | 479 | **3,313** | 1,302 | 503 | 21 MB | |
| | 6× | | | 293 | 747 | 5,213 | 2,336 | 829 | | |
| Slides lesson (FM1 trial) | 1× | 975 KB | 745 / 2,630 KB | 26 | 127 | 180 | 2 | 52 | 11 MB | 328 |
| | 4× | | | 74 | 493 | **985** | 355 | 293 | | |
| | 6× | | | 433 | 815 | 1,960 | 770 | 596 | | |
| Practise | 1× | 3,279 KB (100 requests) | 1,475 / 5,261 KB | 22 | 146 | 411 | 27 | 77 | 23 MB | 267 |
| | 4× | | | 44 | 288 | **1,895** | 864 | 521 | | |
| | 6× | | | 95 | 613 | 3,379 | 1,696 | 922 | | |
| Papers | 1× | 946 KB | 790 / 2,756 KB | 32 | 55 | 32 | 0 | 0 | 6 MB | 455 |
| | 4× | | | 101 | 249 | **1,065** | 183 | 171 | | |
| | 6× | | | 309 | 394 | 1,802 | 364 | 259 | | |

The lead's build-15 measurement on a Pixel 7 profile agrees where the pages overlap (Welcome 861 KB sent, 2,433 KB decoded; Read 5,445 KB decoded, 1,079 ms blocked at 4×).

**What would feel slow and why.**
- *The Read lesson.* It is the only page that is unpleasant at 6×: five seconds to interactive, two and a third seconds of blocked main thread, an 829 ms single task. Three causes, all fixable (D8): the whole lesson renders at once (4,141 DOM nodes against 328 for Slides); its questions mark as they draw, so it downloads and evaluates the 2.6 MB compute engine with the page; and the catalogue chunk comes too. On a 2015 i5 (4×) it is 3.3 s: tolerable, not calm.
- *The first Check on a typed step in Slides* waits for the engine chunk (726 KB compressed) to arrive and evaluate: the lead measured a 740 ms evaluation task at 4× on build 14; expect about a second's pause once per session at 4×, more at 6×.
- *Practise* arrives with 100 requests and 3.3 MB because it fetches the bundles for its mixed set up front; on a hard disk and a busy CPU that is a two-to-three-second settle.
- *Everything else is fine*: Today, Welcome, Slides, Papers, the unit pages are interactive within about a second at 4× and within 2.3 s at 6×. Once a page is open, typing, tapping and the card transitions are cheap (heaps of 6–23 MB; the longest tasks after load are well under a frame budget at 1×).
- *Memory.* JS heaps of 6–23 MB and a few thousand DOM nodes: a tab of roughly 150–250 MB in practice (the process size was not measured), which a 4 GB laptop carries with a couple of other tabs open.
- *Disk and the service worker.* The precache (252 URLs, 13.6 MB on disk, 6.0 MB compressed) installs in the background on the first visit at `localhost`; the full offline copy (2,523 URLs, 79 MB) only when she taps for it. Playwright does not report a worker's own fetches on the page, so the install was sized from the precache list rather than observed; the README's "about 10 MB" is now 13.6 MB.

**Verdict:** copy the export; it runs well on a 2015 laptop with 4 GB and a current browser, with the Read lesson as the one page that drags until D8 lands. Do not build on it.

---

## 4. What is not done yet (usable, durable, recoverable, proven)

| Area | State today | Rating (impact × likelihood) | Fix and cost |
|---|---|---|---|
| **Backups** | Manual: Settings → Export backup (JSON) / Restore. No reminder, no automatic copy, no cloud, no account. `importAll` checks a schema id only. | High: a lost or wiped phone loses every answer since the last export; a learner never exports unprompted. | Nudge after 7 days / 50 attempts with one tap; `navigator.storage.persist()`; Zod validation per table on restore; later an account (§5). 1–2 days now. |
| **Schema migrations** | Dexie versions 1–5, additive, no `.upgrade()`; no test. Probed today (`B/b-dexie-upgrade.out`): v1 → v5 keeps rows and runs the backfill; a v4 build opens a v5 database; a same-version index change is patched with a warning. | Medium: sound now by luck of being additive; the first non-additive change (a renamed field, a split table) has no test and no plan. | The probe as `src/lib/db/upgrade.test.ts`; a rule in the README: every schema change bumps the version, ships an upgrade function and a test with a fixture database. ½ day. |
| **Error boundaries, crash log** | None of `ErrorBoundary`, `error.tsx`, `global-error.tsx`, `not-found.tsx`, `onerror`, `unhandledrejection`. 29 live queries in render. | High: one thrown render or a blocked database is a blank page with no record. | `app/error.tsx`, `global-error.tsx`, a boundary per stage, a `crashes` table shown in Settings with Copy. 1 day. |
| **Release process** | Builds cut from a detached worktree, identified by the sw.js stamp (`cairn-20261011134947`) and a note in `docs/plan/builds/` (four notes, builds 12–15, all today); no tags, no changelog, no version in the app; `package.json` says 0.1.0. | Medium: "which build is she on?" is answerable only from the stamp. | `git tag build-N` at each cut; the stamp and commit shown in Settings ("Build 15 · 662cd3b"); `CHANGELOG.md` from the build notes. 1 hour. |
| **CI** | 871 lines written today: check, build, three e2e shards, Lighthouse budgets, preview deploy, nightly. Never run; `origin/main` 33 commits behind. | High until the first green run; then low. | Push; fix the first run's Linux surprises; add the two Cloudflare secrets. ½ day. |
| **Monitoring** | None, by design (no server, no telemetry). The `reports` table keeps her "Something wrong?" words. | Low for one learner; a "it marked me wrong" cannot be reproduced without the inputs. | Keep the design; add the marking inputs (spec id, raw answer, award, build) to each report and a Diagnostics export. 1 day. For 2027: crash reporting and privacy-respecting analytics from day one. |
| **Security of a static app** | No server, no secrets, no cookies; KaTeX `trust:false`, `throwOnError:false`; authored SVG inlined through a regex sanitiser (`sanitizeInlineSvg`: strips `<script>`, `<style>`, `on*=`, non-`#` `href`, width/height) at 7 `dangerouslySetInnerHTML` sites; no Content-Security-Policy anywhere (the deploy writes `_headers` with `noindex` only); external links to ccea.org.uk (737), PhET (222), BBC (88), Corbettmaths (68), Wikimedia (37) with `rel="noopener noreferrer"` where I read them. | Medium-low: the content is the trust boundary; a hostile pack could run script in her browser, reach her IndexedDB, and phish. Impact is bounded (no credentials, nothing to exfiltrate but her progress). | A CSP in `_headers`/`vercel.json` (`default-src 'self'; img-src 'self' data: https:; frame-src https://www.youtube.com https://phet.colorado.edu; script-src 'self' 'unsafe-inline'` as the static export needs); sanitise SVG at build in the strict content build (fail the build on `<foreignObject>`, `<animate attributeName="href">`, external `<use>`) and keep the runtime strip. 1 day. |
| **Dependency updates** | 19 behind; one critical advisory (next ≤ 16.3.7; the static export does not run the affected server paths, but the dev server's endpoint is local), five high (dev-time/transitive), two via the unused `mafs`; `compute-engine` pinned 31 minor versions behind the engine it marks with. No Dependabot/Renovate (CI has not run). | Medium: the engine's library drifting is the one that bites later. | Remove the five unused; `npm update`; `next@16.4.0`; Dependabot weekly once CI is green; a note on how to re-run the engine battery after a compute-engine bump. 2 hours + ongoing. |
| **Licensing and privacy** | Repository public and `UNLICENSED`; the whole 82 MB content corpus is readable by anyone; `data/personal/notes.json` tracked and bundled; CCEA material is linked never re-hosted (good); Wikimedia images carry their licences in `data/enrichment`. | Medium: a private gift is public; the content's own licence is undecided. | Private repository now (pending since 7 Oct) or the notes out of git; decide the content licence before March 2027. 10 minutes. |
| **First-day documentation** | No root README; `docs/dev/README.md` is the real one (44 KB, 1,000-character lines); 86 docs with no map; decisions in `RULINGS.md` (good) and in commit bodies (bad); no ADRs; the lead's own log and queue live in an ignored folder. | Medium: a new engineer finds the run commands in five minutes and the rules in an hour, if told where to look. | Root README (what, run, test, layout, the five files to read, where decisions live); `docs/decisions/` with one ADR per platform decision (the nine in `docs/plan/review`'s names); the marking rules split (D7). 3 hours. |
| **Bus factor** | One human identity (236 of 237 commits), the rest in agents' heads and briefs under `scratchpad/` (ignored: 159-line lead log, 59-line queue, dozens of briefs). | High: the process lives in one session's memory files. | Commit the briefs and hand-offs that explain the system (`scratchpad/briefs` → `docs/process/`); the README; a recorded walk-through of a build cut. 1 day. |
| **Export size** | 6,117 files / 185 MB per build; `papers/` alone 2,490 files (420 paper pages with their RSC payloads); `learn/` 3,096 files. Cloudflare's limit is 20,000 files. | Low today; medium at three times the content (English and more). | Prerender fewer variants per paper; or the paper page as one route reading `data/papers` on the client. Later. |

What happens today in the five scenarios the brief names: a **corrupted IndexedDB** blanks the app (no boundary) and nothing offers a reset; a **service-worker version change** installs the new shell (`skipWaiting` + `clients.claim`), clears the old cache, and re-fetches the full copy if she asked for it (good; but a page open during the swap may run old JavaScript against new content for one navigation); a **lost phone** loses everything since the last export; a **browser clearing site data** loses everything, with no persistence requested; a **content schema change** is caught at build by Zod and by the strict content build (good), and a restored backup from a newer app version is accepted without a check.

---

## 5. How it differs from the platforms online, on the engineering side

What their public engineering writing allows (sources in `B/EVIDENCE.md`; most ed-tech companies publish little, and several entries below rest on job adverts, which say what a company runs, not how well).

| Platform | What their engineering has that Cairn lacks | What Cairn has that they lack |
|---|---|---|
| **Khan Academy** | A multi-year, ADR-driven rewrite of a ~1 M-line Python monolith into about 40 Go services behind GraphQL (their blog's "Goliath" posts); accounts, sync, teacher and parent dashboards, analytics, content at global scale. | CCEA-true marking with mark codes; teach → show → check per section; re-teach per wrong option; offline with no account; no manipulation. |
| **Duolingo** | A "Session Generator" service that picks each learner's next exercises (Python → Scala, latency 750 → 14 ms), hundreds of microservice endpoints on AWS ECS, A/B testing at scale. | A deterministic deck from one authored note (reproducible, reviewable); no streaks or hearts by design. |
| **Anki** | A Rust core (`rslib`) with Python and Qt/TypeScript around it, protobuf contracts, an SQLite collection, and a self-hostable sync server that every client speaks to. The closest architecture to Cairn's: local-first, data on the device. | A lesson grammar and a marking engine; Anki marks nothing. Anki's sync server is exactly the piece Cairn would copy for recovery. |
| **Quizlet** | Cloud Spanner, PlanetScale MySQL, BigQuery; GKE with Istio; GitHub Actions, CircleCI, ArgoCD; Datadog; a 99.95 % availability target (a 2025 job advert). | Subject-true content with verification logs; marking beyond "is the string equal". |
| **Save My Exams** | React/Next.js/TypeScript with Postgres on AWS and GCP (job adverts); 2.5 M students a month behind accounts and a paywall. The same front-end family as Cairn plus a database. | Interactive marking and re-teaching; Save My Exams is notes and mark schemes to read. |
| **Sparx Maths** | No engineering writing found; the product is school-licensed, with teacher assignment, "200 million data points" of adaptivity, and a CDN (Cloudflare per aggregators). | Free of a school; CCEA; the See it with marks per line. |
| **Seneca** | A React front end (one job advert); nothing else public. | Marking with the scheme's codes; no "weak spots = same format again". |
| **Brilliant** | Job adverts describe interactive learning interfaces, authoring tools, a notification pipeline, native iOS and Android. | CCEA fit; the worked case on the note's own numbers; offline. |
| **Dr Frost Maths** | Accounts, an auto-marked question bank, teacher analytics; 6,000+ schools, 450,000 monthly users, 800 M questions answered (their site); no stack published. | A lesson (Dr Frost is practice and video); the re-teach per option. |
| **Up Learn** | Adaptive sequencing ("Smart Learning"), teacher dashboards, video, tutor chat; no stack published. | Open, offline, no manipulation; scheme-level marking. |
| **Physics & Maths Tutor** | A static site of PDFs and HTML with no accounts (a competitor's comparison) — architecturally the only one simpler than Cairn. | Everything interactive. |

**What it would take to be as strong, on the engineering side.** Four capabilities, in the order they unlock each other:

1. **Accounts and sync** (so progress survives a device and reaches a parent or teacher): a small backend. Either a managed one (Supabase/Firebase: auth, Postgres, row-level security; the Dexie tables become a per-user replicated set with last-write-wins per row and `attempts` append-only) in two to three weeks, or an Anki-style sync service of one's own in four to eight engineer-weeks. The export file format already exists and becomes the sync payload.
2. **Telemetry and crash reporting** (so "it marked me wrong" is reproducible and a blank screen is seen): a crash reporter (Sentry-class) and a privacy-respecting event log (route, card kind, award, build), one week once accounts exist.
3. **A teacher or parent dashboard** reading the same `attempts` and `mastery` tables: three to four weeks after 1.
4. **Adaptive sequencing at scale** (what Sparx, Duolingo and Up Learn sell): needs the data from 1 and 2 across many learners; two to three months of modelling and evaluation, and not before the content is reviewed.

Native apps (Capacitor around the export) and a CDN are two weeks each and optional; the static export already runs on a phone from the home screen.

---

## 6. Educate: how it is built, what is right, what is not, and the lessons for 2027

### 6.1 How it is built, step by step

1. **Content is data.** An author (an agent, under `pipeline/prompts/author-topic.md` and `STANDARDS.md`) reads the specification, the papers, the schemes, the examiner reports and the textbook chapter, and writes two JSON files per topic: `bundle.json` (the items: worked examples, questions with parts, specs and mark schemes, diagnostics, find-the-mistakes, prompts, the verification log) and `note.blocks.json` (the lesson as blocks: headings with roles, paragraphs, figures, See its, gates). The shape is a Zod schema (`src/lib/content/schema.ts`), exported as JSON Schema so an editor can validate while typing.
2. **A pipeline lints and ships it.** `tsx pipeline/build-content.mts --strict` validates every bundle, runs the lints (marking, gates, sizes, figure leaks, characters, key words), computes the readiness of each lesson with `src/lib/slides/readiness.ts`, and writes `public/content/<subject>/<id>.json` plus `src/generated/manifest.json`. `scripts/qa/*.mjs` add the slower checks (lesson structure, teach-show-check, same-case, prompts, withdrawn chains, figure leaks, SVG draws, shingles against the private corpus). Only `verified`/`published` items ship; a withdrawn item stays byte-identical in the pack and never ships.
3. **A static Next app reads it.** `next build` with `output: "export"` prerenders 957 pages (every unit, topic, Slides deck, paper and flashcard deck) from the manifest and the shipped bundles, so the hero and the deck arrive as HTML; the client fetches the bundle JSON for the interactive parts. There is no server at run time: any static host serves `out/`.
4. **A marking engine runs in the browser.** `markAnswer(raw, spec)` reads what she typed with the numeric, algebraic, text, equation, plot, table, matrix and working-ladder engines and returns marks, a diagnosis, the misconception tags and the examiner citation. It is pure and synchronous; the one heavy library (the compute engine) is fetched when marking first needs it.
5. **A readiness rule decides what she sees.** The note's structure (explain → See it → Your turn per section, nothing asked before the first See it, at most two recall cards in the close) plus the latest reviewer record decide whether a topic is offered as Slides and Read v2; the policy constant is "structure" for the test builds and returns to "reviewed".
6. **Specs read the content.** Playwright walks the trial topic on a desktop and a phone profile, taking every count and id from `e2e/content.ts`, which imports the app's own functions. A content edit can only break a test by breaking the product.
7. **Learner data stays on the device**, in ten Dexie tables, with a JSON export as the only copy.

### 6.2 The agent-driven process and its artefacts

A lead session plans and cuts builds; waves of up to eight agents (authors per unit, reviewers, fixers, an engine owner, an e2e owner, a CI owner, an assessor, this reviewer) work under a common brief and their own, with ownership tables so no two write the same files; each checkpoints a `STATE.md` every twenty minutes because sessions are cut by usage limits; each hands back a report with counts, hashes and the five self-audit answers. The artefacts: `STANDARDS.md` and `author-topic.md` (the bar), `RULINGS.md` (every decision by date and where it binds), briefs under `scratchpad/briefs/<date>/`, states and reports under `scratchpad/state` and `scratchpad/reports`, probes under `scratchpad/probes`, build notes under `docs/plan/builds/`, reviews under `docs/plan/review/`, and a lead log. Commit messages carry the full story of each change (hence 254 characters a subject).

### 6.3 What is being done the right way

- The content model: schema, verification logs, withdraw-and-replace, stage-first (no half-written pack on disk), lints as code, readiness by review. This is how a content organisation of hundreds works; a one-person project rarely builds it.
- The engine as a contract with fixtures, a corpus guard, mutation runs and gates as lists written once.
- One rule in one module shared by build, app and tests (readiness, the deck grammar, the minutes model).
- Builds from committed state in a separate worktree, with a one-page note and three measures compared build to build.
- The definition of done per topic, the metrics line, the student test after every build.
- Writing down why: the comments, the rulings, the reviews with evidence.

### 6.4 What is not

- Scale before structure: 85,000 lines in nine calendar days with no linter, no layer rule and no size limit grew five functions over 300 lines and a `components` folder holding the engine. Agents write fast and consistently, and they do not refactor unless told; a human team would have stopped at the second 500-line function.
- Verification written after the fact: the e2e suite rotted for two weeks (the programme assessment's finding), CI arrived on day 18 and has not run, the Dexie upgrade had no test until this review's probe.
- Process memory outside the repository: briefs, states, the lead log and the queue live in an ignored folder that was wiped once already (7 Oct).
- Hygiene a reviewer notices first: five dead dependencies, tracked scratch files, a public repository with private notes, no README at the root.
- The research-heavy, feature-light balance: 86 documents and 28,000 lines of Markdown for 51,000 lines of product; right for a bespoke gift, too heavy for a company unless the documents become ADRs and a handbook.

### 6.5 Lessons for a global animal-science teaching platform (March 2027)

**Copy, and from where.**
- Content as data with a schema and lints: `src/lib/content/schema.ts`, `pipeline/build-content.mts`, `src/components/items/content-lint.ts`, `scripts/qa/`. Start the schema on day one and never let a screen read a field the schema does not name.
- A marking engine behind contracts and a corpus guard: `src/components/items/mark.ts` (the `MarkResult` shape), `src/lib/marking/*`, the fixture battery and the gate records under `scratchpad/state/engine`. Animal science marks text answers (key-word groups with negations and inflections: `text-marking.ts`), numbers with units (`numeric.ts`: dosages, feed conversion ratios, concentrations), labelled diagrams (`label.ts`), ordering (`order-marking.ts`), tables (`table.ts`) and banded written answers (`qwc.ts`). The parts you do not need (matrices, transformations, logarithm forms) show how a new kind is added: a spec variant in the schema, a module in `src/lib/marking`, a case in the dispatcher, tests beside it.
- The lesson grammar: `src/lib/slides/cards.ts` and `readiness.ts`. A section is explain → See it → Your turn; for animal science the See it is a modelled answer (a six-mark "explain how you would…" worked line by line with the marks each line earns), a procedure (a practical as checklist steps with the reason each step exists), or a calculation; the Your turn is the same shape on a new case; the re-teach is written per wrong option.
- Readiness by review, the definition of done, the metrics line, builds from committed state with a build note: `docs/dev/RULINGS.md`, `docs/plan/builds/`, `scripts/qa/metrics.mjs`.
- The spec–content contract: `e2e/content.ts`.
- Agent authoring with human review gates, under a written standard with a self-audit: `STANDARDS.md`, `author-topic.md`, the reviewer brief.

**Do differently from the first week.**
1. **CI and a preview URL before the first feature**: a workflow that runs the type check, the unit tests, the content build and one smoke spec on every push, and deploys a preview per commit. Nothing merges red.
2. **Module boundaries as a rule the machine enforces**: `lib` never imports `ui`; features import `shared`, never each other; an ESLint `no-restricted-paths` and `import/no-cycle` from day one; the engine in its own package (`packages/marking`) with its own tests and version.
3. **File and function size limits in the linter** (a file over 500 lines and a function over 80 fail the build, with a dated exception list) so refactoring happens when it is cheap.
4. **ADRs** (`docs/decisions/NNNN-title.md`: context, options, decision, consequences) for every platform choice, instead of decisions in commit bodies and logs.
5. **A design system in code**: tokens, primitives (Button, Field, Card, Verdict), a `/lab` gallery as the first route, Storybook-free as here but with visual snapshots in CI.
6. **A backend decided in the first month**: accounts, roles (learner, teacher, author, reviewer), sync, and an audit log; local-first on the device as here, with a sync protocol (Anki's is the model) rather than a JSON button. Content stays static and cached; only learner data goes through the backend.
7. **Telemetry and crash reporting on day one**, opt-in and privacy-respecting, so the first learner's blank screen is seen.
8. **i18n from the first string**: animal science is global; message catalogues, locale-aware numbers and units (kg/lb, °C/°F, dates), right-to-left readiness, and content versioned per language.
9. **Content versioning and migrations**: a `shape` number on every note, a migration script per shape change that reports counts, the strict build refusing a note whose declared shape its lint does not confirm (the programme assessment's §7, made mechanical).
10. **Schema-migration tests** for the client database from version 2 onward, each with a fixture database from the previous version.
11. **A release train**: tags, a changelog from build notes, the build and commit shown in the app, a rollback path (the previous export kept on the host).
12. **Commit discipline**: 60-character subjects, bodies that link the ADR or ruling; the story lives in the ADR, not the commit.

**How animal science maps onto this architecture.** The subject-agnostic parts are already so: the spec catalogue (`data/spec/*.json` with teachable topics and statements) becomes a curriculum model per course or qualification; packs per subject area (husbandry, nutrition, anatomy and physiology, welfare, health and disease, breeding and genetics) with units and topics; the note's block grammar is unchanged; worked examples become modelled answers and procedures; practicals become checklists with reasons, photographs with licences (the `data/enrichment` dossiers show the method), and labelled-diagram items; the marking engine's text, numeric, label, order, table and banded kinds cover most of it, with a new "sequence with thresholds" kind for procedures; readiness by review keeps a vet or a lecturer as the gate; the metrics line per unit is the same; the service worker and offline copy matter more, not less, in the field.

**A suggested first quarter (March–May 2027), twelve weeks.**
- Weeks 1–2: the monorepo (`apps/web`, `packages/content-schema`, `packages/marking`, `packages/ui`, `packages/curriculum`), ESLint/Prettier/size rules, CI with preview deploys, ADR 0001 (architecture), ADR 0002 (backend and sync), the design tokens and the `/lab` route, telemetry and crash reporting wired to an empty app.
- Weeks 3–4: the content schema for one course and one unit, the strict build and the first five lints, the lesson grammar ported (sections, See it, Your turn, re-teach), the readiness rule and the manifest; one topic authored by hand to the definition of done.
- Weeks 5–6: the marking engine ported (text, numeric with units, label, order, table, banded) with the fixture battery; the first corpus guard; the Slides and Read renderers on the one topic; the spec–content contract and the first smoke specs.
- Weeks 7–8: accounts and sync (managed backend), the local-first store with migrations and their tests, backup and restore as a sync fallback; roles for author and reviewer; the reviewer's pass record in the UI.
- Weeks 9–10: agent authoring under a written standard for the first unit (eight to twelve topics), human review gates, the metrics line, the build note, the first student test with five learners in two countries.
- Weeks 11–12: one planned pass from the test; i18n for the second language; the teacher view reading the same tables; the release train (tags, changelog, rollback); the quarter's retrospective as ADRs.

---

## 7. What to correct or improve so the platform stands out, ranked

Each with its acceptance test.

1. **Push and make CI green; preview on her phone.** Accept: a green run on the Actions page for `main`; the stable preview address opens on her phone with build 16.
2. **No blank screens: error boundaries, a crash table, Diagnostics.** Accept: a thrown error in a `/lab` card shows "Try again · Back to Today" and Today still works; the error is listed under Settings → Diagnostics with Copy.
3. **Her progress survives: persistence, a backup nudge, validated restore, an upgrade test.** Accept: `navigator.storage.persisted()` is true after the first answer; a nudge appears after seven days or fifty attempts and exports in one tap; a file with a malformed row is refused with a sentence; `src/lib/db/upgrade.test.ts` opens a v1 fixture and asserts v5 with rows kept.
4. **A clean repository: private (or notes out of git), five dependencies gone, scratchpad untracked, builds tagged, a root README, the marking rules split.** Accept: `gh repo view` says private or `git ls-files data/personal` is empty; `npm ls --depth=0` shows 12 runtime dependencies and `npm audit` no critical in them; `git ls-files scratchpad` is empty; `git tag` lists `build-16`; a stranger runs the app and the tests from the README in fifteen minutes.
5. **The engine and lints in `src/lib`, a layer rule, no cycles.** Accept: the import-graph script reports 0 `lib → components` edges and 0 cycles; ESLint enforces it; all 3,392 tests green.
6. **`markAnswerInner` and `SlidesRun` split.** Accept: no function over 150 lines in `src/lib/marking` or `src/components/slides`; `src/lib/slides/run.ts` has a reducer with tests over the trial deck; the `slides` and `learn` spec files green on build 17.
7. **Bytes off the critical path.** Accept: Today under 300 KB sent and interactive under 800 ms at 4×; the Read lesson's blocked time under 500 ms at 4× and no compute-engine fetch until the first Check; Practise under 30 requests on arrival.
8. **A field shell for typed answers; lints with fixtures.** Accept: no file in `src/components/items` over 20 % duplicated in the shingle scan; every rule in `scripts/qa` has a passing and a failing fixture in vitest.
9. **ESLint + Prettier + size limits.** Accept: `npm run lint` runs ESLint with `import/no-cycle`, `no-restricted-paths`, `max-lines` (500) and `max-lines-per-function` (80) with an exception list dated today that only shrinks.
10. **A security floor.** Accept: a CSP header served on the preview (checked in the e2e `offline` or a new `headers` spec); the strict content build fails on `<foreignObject>`, animated `href` or external `<use>` in any SVG; `next` at 16.4.0 or later; Dependabot open.

**Things you did not ask that you would want to know.**
- *The content's licence is undecided and the corpus is public.* Eighty-two megabytes of original CCEA-true content sit in a public, `UNLICENSED` repository. Decide what it is (private; or open under a licence) before anyone else builds on it.
- *Framework churn is your biggest external risk.* Next has shipped four majors in two years; the export relies on `scripts/fix-export.mjs` to repair Next 16's RSC payload layout and on `agentRules: false` to stop it writing files into the repository. Keep the app thin over the framework (it is) and budget a week per major.
- *Accessibility is wired but not green*: `e2e/a11y.spec.ts` runs axe on three pages; the commit of 15:0x records two rules broken on the Read v2 lesson. Fix them before the student test; a screen-reader learner is a real case.
- *The e2e suite scales badly as written*: 374 tests on one topic in 7.6 minutes; the content contract lets it walk any topic, so pick three (one per subject) and let the nightly rotate.
- *The biggest shipped topic is 2.3 MB of JSON* (`b2-natural-selection-selective-breeding`): look at what a learner needs of it (data-URI figures and verification logs ship with every bundle).
- *Her phone is the real target; this review's laptop numbers are the floor.* The lead's Pixel 7 measurements at 4× are the ones to track in CI's Lighthouse job.
- *The cost of the agent process is readable noise*: 18,332 words of commit messages, 311 tracked scratch files, 86 documents. For 2027, the ADR and the changelog are where that writing should land, so a human can read the project in an afternoon.

---

## The five self-audit answers (STANDARDS.md)

1. *Would she understand it alone at night, without anyone to ask?* Not the question for this document; but the engineering it reviews decides whether she can: today a thrown error leaves her a blank page with nobody to ask, which is why D3 is a day's work ranked second.
2. *Can she rely on every number, every scheme line and every award?* Every number in this review is in `B/EVIDENCE.md` with its command; the laptop figures are medians of two runs on a busy machine and are labelled as proxies; the build-on-a-laptop time is an estimate from measured parts and is labelled so; the platform comparison rests on the sources listed, several of them job adverts, and says so.
3. *Does it earn her marks on her real paper, or is any of it filler?* The ranked list is ordered by what protects her evenings first (CI, no blank screens, no lost progress) and what protects the engine's awards next; the 2027 section is for the owner's next platform, not for her, and is kept to one page.
4. *Would a Chief Examiner sign it as CCEA-true?* Not applicable to code; the engineering equivalent is "would a tech lead sign the verdict", and the evidence folder is written so that one can re-run every measurement.
5. *Is there a line I would be embarrassed to defend?* Two. The cyclomatic numbers come from a brace-matching scanner (TypeScript 7 ships no compiler API and nothing else parses TSX here), cross-checked by hand only on the rows I cite; treat "cc ≈ 247" as "very high", not as a figure. And the service-worker install size was taken from the precache list because Playwright does not report a worker's own fetches on the page; the 13.6 MB is what the list weighs on disk, not what was observed on the wire.
