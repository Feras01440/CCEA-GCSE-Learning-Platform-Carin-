# CCEA past papers index (`data/papers/index.json`)

A normalised, link-only index of every past paper and mark scheme that CCEA
publishes for the three qualifications this platform covers. It is generated
from CCEA's own JSON feeds by `scripts/build-papers-index.mjs` and contains
**metadata and deep links only** - no PDF content is stored here.

```
npm run papers:index          # rebuild data/papers/index.json and print the report
node scripts/build-papers-index.mjs --quiet
```

## 1. Provenance

Each "Past Papers & Mark Schemes" page on ccea.org.uk loads its list from a
per-qualification JSON feed. The feeds were downloaded on 1 September 2026 and
saved under `docs/sources/` (see `docs/research/08-past-papers-and-question-banks.md`
section 1 for how they were located and verified).

| Qualification | Feed id | Feed URL | Saved copy | Entries |
|---|---|---|---|---|
| GCSE Mathematics (2017) | 504 | https://ccea.org.uk/sites/default/files/qualification/504.json | `docs/sources/maths/ccea-qualification-504.json` | 635 |
| GCSE Further Mathematics (2017) | 507 | https://ccea.org.uk/sites/default/files/qualification/507.json | `docs/sources/further-maths/ccea-qualification-507.json` | 90 |
| GCSE Science Double Award (2017) | 584 | https://ccea.org.uk/sites/default/files/qualification/584.json | `docs/sources/science/584.json` | 945 |

All 1,670 feed entries are present in the index, tagged by `type`
(`Standard`, `Modified` = large-print/accessibility variants, `Irish Medium`).
Filter on `type === "Standard"` for the ordinary English-medium papers.

The index records which feed files it was built from (`generatedFrom`), the feed
URLs, entry counts and the most recent `changed` date per feed (`feeds`).

## 2. Copyright and usage rules (read before wiring this into the UI)

CCEA's copyright notice (on every past-papers page) and its Terms of Use
(https://ccea.org.uk/legal/terms-use) permit downloading and printing for
personal or educational use, but state that you are **not permitted to
distribute the content via electronic means (the internet or an intranet),
store it in a retrieval system, or use it for commercial exploitation**.

Rules for this platform:

* **Link only.** Every `url` in the index points at the official PDF on
  `https://ccea.org.uk`. Open it in a new tab
  (`target="_blank" rel="noopener noreferrer"`).
* **Never re-host, mirror, cache, proxy or bundle the PDFs**, and never commit
  a PDF to this repository. The build script deliberately makes no network
  requests and never downloads a paper.
* **Never embed a paper in an `<iframe>`, `<embed>` or `<object>`.** CCEA serves
  PDFs and pages with `x-frame-options: SAMEORIGIN`, so browsers will refuse to
  render them cross-origin anyway; attempting it is both broken and arguably
  "distribution via electronic means".
* **Do not reproduce question text or diagrams** (no OCR, screenshots or
  re-typing). Facts *about* a paper (series, unit, tier, question number, marks,
  topic tags) are fine; the content is not.
* No CCEA logos or wording that implies endorsement. Exam-board names are used
  for identification only.
* If the platform ever charges for access, obtain a written licence from CCEA
  first (info@ccea.org.uk).

## 3. File format

```jsonc
{
  "$schema": "ccea-papers-index/1",
  "generatedFrom": { "504": "docs/sources/maths/ccea-qualification-504.json", "507": "...", "584": "..." },
  "feeds": { "504": { "subject", "name", "file", "url", "entries", "latestChanged" }, ... },
  "origin": "https://ccea.org.uk",
  "counts": { "<subject>": { "total", "byType": {...}, "standard": { "papers", "markSchemes", "papersWithoutMarkScheme" } } },
  "papers": [ /* one object per feed entry, see below */ ],
  "sessions": [ /* one object per subject + exam sitting, see below */ ]
}
```

### `papers[]`

| Field | Values | Notes |
|---|---|---|
| `id` | string | The feed's own `id`. Unique across all three feeds. |
| `subject` | `maths` / `further-maths` / `science` | |
| `qualificationId` | `"504"` / `"507"` / `"584"` | |
| `series`, `year`, `sessionKey` | e.g. `"Summer"`, `2025`, `"2025-Summer"` | Series seen: January (maths, to 2020), March (science), Summer, November. |
| `type` | `Standard` / `Modified` / `Irish Medium` | As in the feed. |
| `kind` | `paper` / `ms` | From the feed's `mark_scheme` flag (cross-checked against the title and filename). |
| `tier` | `"F"` / `"H"` / `null` | `null` for Further Mathematics (untiered). |
| `unit` | Maths `M1`-`M8`; FM `FM1`-`FM4`; Science `B1`,`B2`,`C1`,`C2`,`P1`,`P2`,`U7` | `U7` = Unit 7 Practical Skills. |
| `unitName` | string | Human label, e.g. `"Unit 2: Mechanics"`, `"Unit B1: Biology"`. |
| `paperNumber` | `1` / `2` / `null` | Only for the completion tests M5-M8 (Paper 1 non-calculator, Paper 2 calculator). |
| `calculator` | `true` / `false` / `null` | Maths and FM only; `null` for science. |
| `discipline` | `Biology` / `Chemistry` / `Physics` / `null` | Science only. |
| `booklet` | `"A"` / `"B"` / `null` | Unit 7 only. |
| `variant` | e.g. `MV18`, `MV24`, `ML`, `MV24-IM`, `MEP62`, or `null` | Accessibility variant parsed from the title (large print 18pt/24pt, modified language, ...). Always `null` for Standard entries. |
| `title` | string | The feed's `field_title_paper_ms`, verbatim (typos and stray spaces included). |
| `url` | string | `https://ccea.org.uk` + the feed path, verbatim. The feed paths are already percent-encoded; the script never re-encodes them (it would encode once only if a future feed shipped a raw path). |
| `changed` | `dd/mm/yyyy` | As in the feed; useful for incremental refresh. |
| `pairId` | string | Identity of the *document* independent of kind: `subject:sessionKey:type:unit[:tier][:P1/P2][:BookletA/B][:discipline][:variant]`. A paper and its mark scheme share the same `pairId`. |
| `counterpartIds` | string[] | For a paper: ids of its mark scheme(s); for a mark scheme: ids of its paper(s). Empty when the counterpart is not (yet) published. |
| `duplicateOf` | string / `null` | Set when the feed carries the same document twice (Drupal re-uploads named `-Paper_0.pdf`, `-MS_0.pdf`). Points at the newest upload (latest `changed`, then highest id), which is the copy a UI should show. |
| `notes` | string[] | Provenance of anything that was inferred or corrected for this entry (see section 4). Empty for the vast majority of entries. |

### `sessions[]`

One object per `subject` + `sessionKey`: `year`, `series`, `units` (unit codes
present in that sitting, any type), per-type counts (`standard`, `modified`,
`irishMedium`, each with `papers` / `markSchemes`; `standard` also has
`papersWithoutMarkScheme`) and `hasMarkSchemes` (true if any Standard mark
scheme exists for the sitting).

Ordering is deterministic: subject, then newest sitting first, then type, unit,
tier, paper number, discipline, booklet, variant, paper-before-MS, id.

## 4. Parsing rules and feed quirks handled

The feed's `tier` field is mostly empty and titles are inconsistent, so
everything is derived from `field_title_paper_ms` with regexes. Every entry is
classified (the script exits non-zero and prints the offending titles if any
entry cannot be assigned a unit). Quirks that are handled explicitly:

* Unit label variants: `Unit M4 (With calculator)`, `M4: (With calculator)`,
  `M4 (With calculator)`, `M4 (Calculator Paper)`; science `Unit B1: Biology`,
  `B1: Biology`, `Unit B1 Biology`, `Unit P1 : Physics`, `Unit C1:Chemistry`,
  `Higher Tier,Unit B1` (no space), `Foundation tier` (lower case).
* Typos read as the obvious unit and recorded in `notes`: `MI` -> M1 (Nov 2021),
  `Unit CI` -> C1 (Nov 2024 Irish Medium), `Unit 1: Physics` -> P1 (Mar 2018),
  `Unit 1: Biology` -> B1 (Nov 2023 Modified), `Unit P2: Higher` and
  `Unit B1: Higher Tier` (discipline taken from the unit letter),
  `Practical Skilsl`, `Practical Skill`, `calcuator`.
* Summer 2019 / January 2020 M5-M8 mark schemes are titled `M5.1`, `M6.2` etc.;
  `.1`/`.2` is read as the paper number and, where the title carries no
  calculator wording, `calculator` is inferred from the paper number (noted).
* Further Mathematics titles put the unit name after the calculator wording
  (`Unit 2, (With calculator) Mechanics`), sometimes omit it, and three Irish
  Medium papers are titled in Irish (`Aonad 1 (Le háireamhán) An
  Ghlanmhatamaitic`). All FM units are calculator papers, so `calculator` is
  `true` even when the title omits it (noted).
* Unit 7 titles: `Unit 7: Biology, Practical Skills (Booklet A)`, `Unit 7,
  Biology: Practical Skills (Booklet A) (MS)`, `Unit 7: Biology Practical
  Skills (Booklet B)`, `( Booklet A)` with a stray space, `Practical (Booklet B)`.
* Trailing markers `(MV18)`, `(MV18pt)`, `(MV24-IM)`, `(ML)`, `(MEP62)`, `(IM)`,
  `(MS)`, including unbalanced `(MV18` / `MV24)` and bare `ML`, are stripped
  into `variant` (IM/MS markers are dropped; the feed's `type` field already
  carries the medium).
* Three Science entries live under `/sites/default/files/filefield_paths/`
  instead of `/downloads/docs/Past-Papers/`; their paths are used verbatim and
  resolve (HTTP 200).
* One explicit override (`OVERRIDES` in the script): the Summer 2019 Foundation
  Unit 7 Booklet B entries titled only `Practical Skills : Booklet B` (feed ids
  14436 Standard, 10143 Modified, 10079 Irish Medium) are assigned
  `discipline: "Physics"` by elimination - in each variant set the Foundation
  Booklet B papers present are Biology, Chemistry and this one, and a
  Foundation Physics Booklet B mark scheme exists for the session. The
  reasoning is recorded in each entry's `notes`.
* Duplicate uploads (7 `pairId` groups) are kept and cross-linked via
  `duplicateOf` as described above.

## 5. Known gaps in the feeds (as of 1 September 2026)

* **Summer 2026 mark schemes are not yet published** for any subject: 12 maths
  papers, 4 FM papers and 18 science papers have empty `counterpartIds`.
  Summer 2026 science also has no B1/B2 papers in the feed yet.
* Two older science mark schemes are missing from the feed: Summer 2024
  Higher Unit 7 Chemistry Booklet A and Summer 2022 Foundation Unit 7 Chemistry
  Booklet A. November 2019 has only one Standard B1 paper.
* No mark schemes exist for Modified or Irish Medium entries in any feed (use
  the Standard mark scheme for the same `sessionKey`/`unit`/`tier`).
* Papers withheld for third-party copyright are simply absent from the feeds.
* No Summer 2020 papers (COVID). Maths January series ended 2020 and was
  replaced by November from 2021; science Unit 7 sits in March.

## 6. How to refresh

The feeds return HTTP 403 to non-browser user agents (Cloudflare), so pass a
browser UA. `robots.txt` asks for a 10 second crawl delay; the feed is cached
for 14 days server-side and regenerated when new papers are released.

```sh
UA="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/128.0 Safari/537.36"
curl -sS -A "$UA" -o docs/sources/maths/ccea-qualification-504.json \
  https://ccea.org.uk/sites/default/files/qualification/504.json
sleep 10
curl -sS -A "$UA" -o docs/sources/further-maths/ccea-qualification-507.json \
  https://ccea.org.uk/sites/default/files/qualification/507.json
sleep 10
curl -sS -A "$UA" -o docs/sources/science/584.json \
  https://ccea.org.uk/sites/default/files/qualification/584.json

npm run papers:index
```

Then read the report: it must show `errors: 0, unclassified: 0, incomplete: 0`.
If CCEA introduces a new title pattern the offending titles are printed under
`-- unclassified --` / `-- incomplete --`; extend the regexes in
`scripts/build-papers-index.mjs` rather than adding data by hand, and add a
commented `OVERRIDES` entry only for facts that genuinely cannot be derived.
Use `curl -sI -A "$UA" <url> | head -1` to spot-check links (PDF HEAD requests
return `200` with `Content-Type: application/pdf`; a `-r 0-0` range GET works
as a fallback).

A cheap change check before a full refresh:
`curl -sI -A "$UA" https://ccea.org.uk/sites/default/files/qualification/504.json | grep -i last-modified`
and compare with `feeds["504"].latestChanged` in the index.
