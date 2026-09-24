# 08 – CCEA Past Papers, Question Banks and a Legal Topic-Practice Strategy

Research date: 1 September 2026. All URLs below were fetched and verified during this session unless explicitly marked "unverified". Feeds and indexes were saved under `docs/sources/`.

Scope: GCSE Mathematics (2017, CCEA qualification id **504**), GCSE Further Mathematics (2017, id **507**) and, for comparison, GCSE Double Award Science (2017, id **584**).

---

## 1. CCEA past-paper JSON feeds

### 1.1 How the CCEA site serves past papers

Every "Past Papers & Mark Schemes" page on ccea.org.uk is a Drupal page containing an Alpine.js block:

```html
<div id="qp-block-504"
     x-data="qualificationPapers('https://ccea.org.uk/sites/default/files/qualification/504.json?v=1787910737', '504')"
     x-init="init()">
```

The qualification id is therefore discoverable by fetching the subject's past-papers page with a browser User-Agent and grepping for `qualification/<id>.json`.

| Subject | Past-papers page (verified 200) | Feed URL | Feed entries |
|---|---|---|---|
| GCSE Mathematics (2017) | https://ccea.org.uk/key-stage-4/gcse/subjects/gcse-mathematics-2017/past-papers-mark-schemes | https://ccea.org.uk/sites/default/files/qualification/504.json | **635** |
| GCSE Further Mathematics (2017) | https://ccea.org.uk/key-stage-4/gcse/subjects/gcse-further-mathematics-2017/past-papers-mark-schemes | https://ccea.org.uk/sites/default/files/qualification/507.json | **90** |
| GCSE Double Award Science (2017) | https://ccea.org.uk/key-stage-4/gcse/subjects/gcse-science-double-award-2017/past-papers-mark-schemes (verified 200; page references `qualification/584.json`) | https://ccea.org.uk/sites/default/files/qualification/584.json | **945** |

Access notes (verified with curl on 1 Sep 2026):

* HTML pages and the JSON feeds return **HTTP 403** to a plain `curl` / non-browser UA (Cloudflare). They return 200 with `-A "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/128.0 Safari/537.36"`.
* PDF downloads under `/downloads/docs/Past-Papers/...` return 200 **even without** a browser UA.
* JSON feed headers: `Content-Type: application/json`, `Cache-Control: max-age=1209600` (14 days), `last-modified: Fri, 28 Aug 2026 09:52:17 GMT` (feed regenerated when new papers are released; the `?v=` query string on the page is a cache-buster).
* PDF headers: `Cache-Control: public, max-age=86400`, `x-frame-options: SAMEORIGIN`, served via Cloudflare. HTML pages also send `x-frame-options: SAMEORIGIN`. **This means CCEA PDFs and pages cannot be embedded in an `<iframe>` on another origin** — browsers will refuse to render them. Link-out (open in new tab) is the only technically viable option.
* `robots.txt` (https://ccea.org.uk/robots.txt): `User-agent: *`, `Crawl-delay: 10`; only `/core/`, `/profiles/`, `/admin/`, `/search/`, `/user/...` are disallowed. `/downloads/` and `/sites/default/files/` are **not** disallowed, so polite (10 s delay) crawling of the feed is permitted by robots.txt.

Saved copies:

* `docs/sources/maths/ccea-qualification-504.json` (431,557 bytes)
* `docs/sources/maths/ccea-504-standard-papers-index.csv` (all 316 Standard entries: unit, series, year, tier, mark_scheme flag, title, absolute URL)
* `docs/sources/further-maths/ccea-qualification-507.json` (61,987 bytes)
* `docs/sources/further-maths/ccea-507-standard-papers-index.csv` (all 54 Standard entries)
* `docs/sources/science/584.json` (saved by the science research task; 662,594 bytes)

### 1.2 Feed schema (identical for all three qualifications)

Each entry is a flat object:

```json
{"title":"Cleared/Standard Paper: Higher Tier, M8: Paper 2 (With calculator) - [504] GCSE Mathematics (2017), Summer 2026",
 "id":"69329","copyright_status":"","series":"Summer","year":"2026","gce":"","qualification":"504",
 "archive":"0","status":"","mark_scheme":"0","tier":"","type":"Standard",
 "field_document_cloud":"/downloads/docs/Past-Papers/cleared/GCSE/GCSE%20Mathematics%20%282017%29/2026-Summer/Standard/0/GCSE-Mathematics%20-504-Summer2026-Higher%20Tier%2C%20M8%3A%20Paper%202%20%28With%20calculator%29-Paper.pdf",
 "field_title_paper_ms":"Higher Tier, M8: Paper 2 (With calculator)","mime_type":"pdf","type_class":"standard","changed":"28/08/2026"}
```

| Field | Values seen | Notes |
|---|---|---|
| `type` | `Standard`, `Modified`, `Irish Medium` | Filter to `Standard` for the English-medium standard-print papers. Modified = large print (MV18pt/MV24pt) and ML variants. |
| `mark_scheme` | `"0"` paper, `"1"` mark scheme | Absolute PDF URL = `https://ccea.org.uk` + `field_document_cloud`. |
| `series` | Maths: `Summer`, `November`, `January`; FM: `Summer` only; DAS: `Summer`, `November`, `March` | |
| `tier` | `""`, `Foundation`, `Higher` | Not reliably populated; parse tier from `field_title_paper_ms` instead. |
| `copyright_status`, `archive`, `status`, `gce` | always empty / `"0"` in these feeds | Papers withheld for copyright are simply absent from the feed. |
| `changed` | `dd/mm/yyyy` | Useful for incremental sync. |

Data-quality quirks a parser must handle (all observed in 504):

* Inconsistent unit labels: `Unit M4 (With calculator)`, `M4: (With calculator)`, `M4 (With calculator)`; one November 2021 entry is typed `MI: (With calculator)` (should be M1).
* Summer 2019 / January 2020 mark schemes for M5–M8 are titled just `M5`, `M6`... without `Paper 1/2` (two MS entries per unit); the papers themselves are labelled with the paper number.
* Summer 2018 has a duplicate M3 paper entry (`M3: (With calculator)` and `Unit M3 (With calculator)`).
* Filenames sometimes end `-Paper_0.pdf` / `-MS_0.pdf` (Drupal duplicate-upload suffix).

### 1.3 GCSE Mathematics (504) – what exists

Totals: 635 entries = 316 Standard (164 papers + 152 mark schemes) + 218 Modified + 101 Irish Medium.

Series present (all entries): Summer 2018 (13), January 2019 (17), Summer 2019 (56), January 2020 (46), Summer 2021 (30), November 2021 (25), Summer 2022 (47), November 2022 (36), Summer 2023 (67), November 2023 (63), Summer 2024 (57), November 2024 (59), Summer 2025 (58), November 2025 (49), Summer 2026 (12 – papers only, mark schemes not yet published as of 1 Sep 2026). The January series was replaced by a November series from 2021 (see the "November – March Examination Series" circular linked from the subject page: https://ccea.org.uk/downloads/docs/Circulars/S/2026/August/S-IF-35-26-August.pdf). No papers exist for Summer 2020 (COVID).

Unit × series matrix for **Standard** entries (`p` = paper, `m` = mark scheme):

| Unit | Sum 18 | Jan 19 | Sum 19 | Jan 20 | Sum 21 | Nov 21 | Sum 22 | Nov 22 | Sum 23 | Nov 23 | Sum 24 | Nov 24 | Sum 25 | Nov 25 | Sum 26 |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| M1 (F, calc) | 1p/1m | 1p/1m | 1p/1m | 1p/1m | 1p/1m | 1p/1m* | 1p/1m | 1p/1m | 1p/1m | 1p/1m | 1p/1m | 1p/1m | 1p/1m | 1p/1m | 1p |
| M2 (F, calc) | 1p/1m | 1p/1m | 1p/1m | 1p/1m | 1p/1m | 1p/1m | 1p/1m | 1p/1m | 1p/1m | 1p/1m | 1p/1m | 1p/1m | 1p/1m | 1p/1m | 1p |
| M3 (H, calc) | 1p/1m | 1p/1m | 1p/1m | 1p/1m | 1p/1m | 1p/1m | 1p/1m | 1p/1m | 1p/1m | 1p/1m | 1p/1m | 1p/1m | 1p/1m | 1p/1m | 1p |
| M4 (H, calc) | 1p/1m | 1p/1m | 1p/1m | 1p/1m | 1p/1m | 1p/1m | 1p/1m | 1p/1m | 1p/1m | 1p/1m | 1p/1m | 1p/1m | 1p/1m | 1p/1m | 1p |
| M5 P1 (F, non-calc) | – | – | 1p/1m | 1p/1m† | 1p/1m | 1p/1m | 1p/1m | 1p/1m | 1p/1m | 1p/1m | 1p/1m | 1p/1m | 1p/1m | 1p/1m | 1p |
| M5 P2 (F, calc) | – | – | 1p/1m | 1p/1m† | 1p/1m | 1p/1m | 1p/1m | 1p/1m | 1p/1m | 1p/1m | 1p/1m | 1p/1m | 1p/1m | 1p/1m | 1p |
| M6 P1 (F, non-calc) | – | – | 1p/1m† | 1p/1m† | 1p/1m | 1p/1m | 1p/1m | 1p/1m | 1p/1m | 1p/1m | 1p/1m | 1p/1m | 1p/1m | 1p/1m | 1p |
| M6 P2 (F, calc) | – | – | 1p/1m† | 1p/1m† | 1p/1m | 1p/1m | 1p/1m | 1p/1m | 1p/1m | 1p/1m | 1p/1m | 1p/1m | 1p/1m | 1p/1m | 1p |
| M7 P1 (H, non-calc) | – | – | 1p/1m† | 1p/1m† | 1p/1m | 1p/1m | 1p/1m | 1p/1m | 1p/1m | 1p/1m | 1p/1m | 1p/1m | 1p/1m | 1p/1m | 1p |
| M7 P2 (H, calc) | – | – | 1p/1m† | 1p/1m† | 1p/1m | 1p/1m | 1p/1m | 1p/1m | 1p/1m | 1p/1m | 1p/1m | 1p/1m | 1p/1m | 1p/1m | 1p |
| M8 P1 (H, non-calc) | – | – | 1p/1m† | 1p/1m† | 1p/1m | 1p/1m | 1p/1m | 1p/1m | 1p/1m | 1p/1m | 1p/1m | 1p/1m | 1p/1m | 1p/1m | 1p |
| M8 P2 (H, calc) | – | – | 1p/1m† | 1p/1m† | 1p/1m | 1p/1m | 1p/1m | 1p/1m | 1p/1m | 1p/1m | 1p/1m | 1p/1m | 1p/1m | 1p/1m | 1p |

\* Nov 2021 M1 is the entry mis-labelled `MI`. † Mark schemes for these series are titled without the paper number (see quirks above) – both P1 and P2 mark schemes exist.

So: **14 complete sittings of M1–M4** (Summer 2018 → November 2025) and **12 complete sittings of M5–M8** (Summer 2019 → November 2025), plus Summer 2026 papers awaiting mark schemes. That is 164 papers / 152 mark schemes to index.

Example URLs per unit (latest series with both paper and mark scheme, November 2025):

| Unit | Paper | Mark scheme |
|---|---|---|
| M1 | https://ccea.org.uk/downloads/docs/Past-Papers/cleared/GCSE/GCSE%20Mathematics%20%282017%29/2025-November/Standard/0/GCSE-Mathematics%20-504-November2025-Foundation%20Tier%2C%20M1%20%28With%20calculator%29-Paper.pdf | https://ccea.org.uk/downloads/docs/Past-Papers/cleared/GCSE/GCSE%20Mathematics%20%282017%29/2025-November/Standard/0/GCSE-Mathematics%20-504-November2025-Foundation%20Tier%2C%20M1%20%28With%20calculator%29-MS.pdf |
| M2 | https://ccea.org.uk/downloads/docs/Past-Papers/cleared/GCSE/GCSE%20Mathematics%20%282017%29/2025-November/Standard/0/GCSE-Mathematics%20-504-November2025-Foundation%20Tier%2C%20M2%20%28With%20calculator%29-Paper.pdf | https://ccea.org.uk/downloads/docs/Past-Papers/cleared/GCSE/GCSE%20Mathematics%20%282017%29/2025-November/Standard/0/GCSE-Mathematics%20-504-November2025-Foundation%20Tier%2C%20M2%20%28With%20calculator%29-MS.pdf |
| M3 | https://ccea.org.uk/downloads/docs/Past-Papers/cleared/GCSE/GCSE%20Mathematics%20%282017%29/2025-November/Standard/0/GCSE-Mathematics%20-504-November2025-Higher%20Tier%2C%20M3%20%28With%20calculator%29-Paper.pdf | https://ccea.org.uk/downloads/docs/Past-Papers/cleared/GCSE/GCSE%20Mathematics%20%282017%29/2025-November/Standard/0/GCSE-Mathematics%20-504-November2025-Higher%20Tier%2C%20M3%20%28With%20calculator%29-MS.pdf |
| M4 | https://ccea.org.uk/downloads/docs/Past-Papers/cleared/GCSE/GCSE%20Mathematics%20%282017%29/2025-November/Standard/0/GCSE-Mathematics%20-504-November2025-Higher%20Tier%2C%20M4%20%28With%20calculator%29-Paper.pdf | https://ccea.org.uk/downloads/docs/Past-Papers/cleared/GCSE/GCSE%20Mathematics%20%282017%29/2025-November/Standard/0/GCSE-Mathematics%20-504-November2025-Higher%20Tier%2C%20M4%20%28With%20calculator%29-MS.pdf |
| M5 P1 | https://ccea.org.uk/downloads/docs/Past-Papers/cleared/GCSE/GCSE%20Mathematics%20%282017%29/2025-November/Standard/0/GCSE-Mathematics%20-504-November2025-Foundation%20Tier%2C%20M5%20Paper%201%20%28Non-Calculator%29-Paper.pdf | https://ccea.org.uk/downloads/docs/Past-Papers/cleared/GCSE/GCSE%20Mathematics%20%282017%29/2025-November/Standard/0/GCSE-Mathematics%20-504-November2025-Foundation%20Tier%2C%20M5%20Paper%201%20%28Non-calculator%29-MS.pdf |
| M5 P2 | https://ccea.org.uk/downloads/docs/Past-Papers/cleared/GCSE/GCSE%20Mathematics%20%282017%29/2025-November/Standard/0/GCSE-Mathematics%20-504-November2025-Foundation%20Tier%2C%20M5%20Paper%202%20%28With%20calculator%29-Paper.pdf | https://ccea.org.uk/downloads/docs/Past-Papers/cleared/GCSE/GCSE%20Mathematics%20%282017%29/2025-November/Standard/0/GCSE-Mathematics%20-504-November2025-Foundation%20Tier%2C%20M5%20Paper%202%20%28With%20calculator%29-MS.pdf |
| M6 P1 | https://ccea.org.uk/downloads/docs/Past-Papers/cleared/GCSE/GCSE%20Mathematics%20%282017%29/2025-November/Standard/0/GCSE-Mathematics%20-504-November2025-Foundation%20Tier%2C%20M6%20Paper%201%20%28Non-Calculator%29-Paper.pdf | https://ccea.org.uk/downloads/docs/Past-Papers/cleared/GCSE/GCSE%20Mathematics%20%282017%29/2025-November/Standard/0/GCSE-Mathematics%20-504-November2025-Foundation%20Tier%2C%20M6%20Paper%201%20%28Non-Calculator%29-MS.pdf |
| M6 P2 | https://ccea.org.uk/downloads/docs/Past-Papers/cleared/GCSE/GCSE%20Mathematics%20%282017%29/2025-November/Standard/0/GCSE-Mathematics%20-504-November2025-Foundation%20Tier%2C%20M6%20Paper%202%20%28With%20calculator%29-Paper.pdf | https://ccea.org.uk/downloads/docs/Past-Papers/cleared/GCSE/GCSE%20Mathematics%20%282017%29/2025-November/Standard/0/GCSE-Mathematics%20-504-November2025-Foundation%20Tier%2C%20M6%20Paper%202%20%28With%20calculator%29-MS.pdf |
| M7 P1 | https://ccea.org.uk/downloads/docs/Past-Papers/cleared/GCSE/GCSE%20Mathematics%20%282017%29/2025-November/Standard/0/GCSE-Mathematics%20-504-November2025-Higher%20Tier%2C%20M7%20Paper%201%20%28Non-Calculator%29-Paper.pdf | https://ccea.org.uk/downloads/docs/Past-Papers/cleared/GCSE/GCSE%20Mathematics%20%282017%29/2025-November/Standard/0/GCSE-Mathematics%20-504-November2025-Higher%20Tier%2C%20M7%20Paper%201%20%28Non-Calculator%29-MS.pdf |
| M7 P2 | https://ccea.org.uk/downloads/docs/Past-Papers/cleared/GCSE/GCSE%20Mathematics%20%282017%29/2025-November/Standard/0/GCSE-Mathematics%20-504-November2025-Higher%20Tier%2C%20M7%20Paper%202%20%28With%20calculator%29-Paper.pdf | https://ccea.org.uk/downloads/docs/Past-Papers/cleared/GCSE/GCSE%20Mathematics%20%282017%29/2025-November/Standard/0/GCSE-Mathematics%20-504-November2025-Higher%20Tier%2C%20M7%20Paper%202%20%28With%20calculator%29-MS.pdf |
| M8 P1 | https://ccea.org.uk/downloads/docs/Past-Papers/cleared/GCSE/GCSE%20Mathematics%20%282017%29/2025-November/Standard/0/GCSE-Mathematics%20-504-November2025-Higher%20Tier%2C%20M8%20Paper%201%20%28Non-Calculator%29-Paper.pdf | https://ccea.org.uk/downloads/docs/Past-Papers/cleared/GCSE/GCSE%20Mathematics%20%282017%29/2025-November/Standard/0/GCSE-Mathematics%20-504-November2025-Higher%20Tier%2C%20M8%20Paper%201%20%28Non-Calculator%29-MS.pdf |
| M8 P2 | https://ccea.org.uk/downloads/docs/Past-Papers/cleared/GCSE/GCSE%20Mathematics%20%282017%29/2025-November/Standard/0/GCSE-Mathematics%20-504-November2025-Higher%20Tier%2C%20M8%20Paper%202%20%28With%20calculator%29-Paper.pdf | https://ccea.org.uk/downloads/docs/Past-Papers/cleared/GCSE/GCSE%20Mathematics%20%282017%29/2025-November/Standard/0/GCSE-Mathematics%20-504-November2025-Higher%20Tier%2C%20M8%20Paper%202%20%28With%20calculator%29-MS.pdf |

Summer 2025 M4 (downloaded and text-extracted for this report): paper https://ccea.org.uk/downloads/docs/Past-Papers/cleared/GCSE/GCSE%20Mathematics%20%282017%29/2025-Summer/Standard/0/GCSE-Mathematics%20-504-Summer2025-Higher%20Tier%2C%20M4%20%28With%20calculator%29-Paper.pdf (690 KB, code GMC41, Thursday 15 May 2025, 2 hours, 22 questions, 100 marks) and mark scheme https://ccea.org.uk/downloads/docs/Past-Papers/cleared/GCSE/GCSE%20Mathematics%20%282017%29/2025-Summer/Standard/0/GCSE-Mathematics%20-504-Summer2025-Higher%20Tier%2C%20M4%20%28With%20calculator%29-MS.pdf (239 KB, 8 pages).

Legacy (pre-2017, "T" units, qualification id 505) papers are on the archived page https://ccea.org.uk/key-stage-4/gcse/subjects/gcse-mathematics-2017/archived-past-papers-mark-schemes, e.g. https://ccea.org.uk/downloads/docs/Past-Papers/cleared/GCSE/GCSE%20Mathematics%20%20%282010%29/2019-January/Standard/0/GCSE-Mathematics%20-505-January2019-Higher%20Tier%2C%20Unit%20T4%20%28With%20calculator%29-Paper.pdf. CCEA publishes a "Mapping T spec to M spec" document (https://ccea.org.uk/downloads/docs/Support/General/2019/Mapping%20T%20spec%20to%20M%20Spec.pdf) which would let legacy T-unit questions be re-used for M-unit topics.

### 1.4 GCSE Further Mathematics (507) – what exists

Totals: 90 entries = 54 Standard (29 papers + 25 mark schemes) + 25 Modified + 11 Irish Medium. **Summer series only**; no January/November sittings.

| Unit | Sum 18 | Sum 19 | Sum 21 | Sum 22 | Sum 23 | Sum 24 | Sum 25 | Sum 26 |
|---|---|---|---|---|---|---|---|---|
| Unit 1 Pure Mathematics (GFM11) | 1p/1m | 1p/1m | 1p/1m | 1p/1m | 1p/1m | 1p/1m | 1p/1m | 1p |
| Unit 2 Mechanics (GFM21) | – | 1p/1m | 1p/1m | 1p/1m | 1p/1m | 1p/1m | 1p/1m | 1p |
| Unit 3 Statistics (GFM31) | – | 1p/1m | 1p/1m | 1p/1m | 1p/1m | 1p/1m | 1p/1m | 1p |
| Unit 4 Discrete & Decision Maths (GFM41) | – | 1p/1m | 1p/1m | 1p/1m | 1p/1m | 1p/1m | 1p/1m | 1p |

Example URLs (Summer 2025):

| Unit | Paper | Mark scheme |
|---|---|---|
| Unit 1 | https://ccea.org.uk/downloads/docs/Past-Papers/cleared/GCSE/GCSE%20Further%20Mathematics%20%282017%29/2025-Summer/Standard/0/GCSE-Further%20Mathematics-507-Summer2025-Unit%201%2C%20%28With%20calculator%29%20Pure%20Mathematics-Paper.pdf | https://ccea.org.uk/downloads/docs/Past-Papers/cleared/GCSE/GCSE%20Further%20Mathematics%20%282017%29/2025-Summer/Standard/0/GCSE-Further%20Mathematics-507-Summer2025-Unit%201%2C%20%28With%20calculator%29%20Pure%20Mathematics-MS.pdf |
| Unit 2 | https://ccea.org.uk/downloads/docs/Past-Papers/cleared/GCSE/GCSE%20Further%20Mathematics%20%282017%29/2025-Summer/Standard/0/GCSE-Further%20Mathematics-507-Summer2025-Unit%202%2C%20%28With%20calculator%29%20Mechanics-Paper.pdf | https://ccea.org.uk/downloads/docs/Past-Papers/cleared/GCSE/GCSE%20Further%20Mathematics%20%282017%29/2025-Summer/Standard/0/GCSE-Further%20Mathematics-507-Summer2025-Unit%202%2C%20%28With%20calculator%29%20Mechanics-MS.pdf |
| Unit 3 | https://ccea.org.uk/downloads/docs/Past-Papers/cleared/GCSE/GCSE%20Further%20Mathematics%20%282017%29/2025-Summer/Standard/0/GCSE-Further%20Mathematics-507-Summer2025-Unit%203%2C%20%28With%20calculator%29%20Statistics-Paper.pdf | https://ccea.org.uk/downloads/docs/Past-Papers/cleared/GCSE/GCSE%20Further%20Mathematics%20%282017%29/2025-Summer/Standard/0/GCSE-Further%20Mathematics-507-Summer2025-Unit%203%2C%20%28With%20calculator%29%20Statistics-MS.pdf |
| Unit 4 | https://ccea.org.uk/downloads/docs/Past-Papers/cleared/GCSE/GCSE%20Further%20Mathematics%20%282017%29/2025-Summer/Standard/0/GCSE-Further%20Mathematics-507-Summer2025-Unit%204%20%28With%20calculator%29%20Discrete%20and%20Decision%20Mathematics-Paper.pdf | https://ccea.org.uk/downloads/docs/Past-Papers/cleared/GCSE/GCSE%20Further%20Mathematics%20%282017%29/2025-Summer/Standard/0/GCSE-Further%20Mathematics-507-Summer2025-Unit%204%20%28With%20calculator%29%20Discrete%20and%20Decision%20Mathematics-MS.pdf |

Summer 2018 only has Unit 1 (the other units were first sat in 2019). Legacy FM (2013 spec, qualification id 1807, two units: Pure; Mechanics and Statistics) is on https://ccea.org.uk/key-stage-4/gcse/subjects/gcse-further-mathematics-2017/archived-past-papers-mark-schemes.

### 1.5 GCSE Double Award Science (584) – comparison

945 entries; 508 Standard (264 papers + 244 mark schemes). Series: Summer, November and **March** (the practical-skills Unit 7 papers are sat in March). Series-years present: March 2017, Summer 2017, March/Summer/November 2018, 2019, 2020 (March + November), 2021 (Summer + November), March/Summer/November 2022–2025, March 2026, Summer 2026. Units: B1, B2, C1, C2, P1, P2 (F/H) and Unit 7 Practical Skills (Biology/Chemistry/Physics, Booklet B). Example (Summer 2025 Higher B1):

* Paper: https://ccea.org.uk/downloads/docs/Past-Papers/cleared/GCSE/GCSE%20Science%20Double%20Award%20%282017%29/2025-Summer/Standard/0/GCSE-Science%20Double%20Award-584-Summer2025-Higher%20Tier%2C%20Unit%20B1%3A%20Biology-Paper.pdf
* MS: https://ccea.org.uk/downloads/docs/Past-Papers/cleared/GCSE/GCSE%20Science%20Double%20Award%20%282017%29/2025-Summer/Standard/0/GCSE-Science%20Double%20Award-584-Summer2025-Higher%20Tier%2C%20Unit%20B1%3A%20Biology-MS.pdf

---

## 2. CCEA copyright and terms of use

### 2.1 Copyright notice on every past-papers page

Each past-papers page contains a block `id="pastpaper-copyright-notice"` (verified on the Mathematics page, https://ccea.org.uk/key-stage-4/gcse/subjects/gcse-mathematics-2017/past-papers-mark-schemes). Its wording:

> Please note that if a past paper or mark scheme does not appear in this section, it may not be available due to copyright reasons. We work to clear the copyright on as many papers and mark schemes as possible so that we can publish these on our website. If papers or mark schemes contain material copyrighted by third parties, we need the copyright owners' permission to use this material after the original examination. Without the necessary permissions, these documents may not be made available to centres.
>
> **Copyright Notice** – The copyright in the content of this material is owned (or controlled under licence) by © CCEA. Anyone using copyrighted materials must respect the rights of the copyright holder. You are permitted to download and print content from the CCEA website for your own personal use or that of your school, college or other educational institution, for example as revision material. **You are not permitted to distribute the content via electronic means (for example the internet or an intranet), store it in a retrieval system, or use content from the website for commercial exploitation in any circumstances.**

### 2.2 Website Terms of Use

https://ccea.org.uk/legal/terms-use (verified):

> The copyright in the content of this is owned by © Council for the Curriculum, Examinations and Assessment (CCEA) 2018. You are permitted to download and print content from the CCEA website for your own personal use or that of your school, college or other educational institution. You are not entitled to use content of the website for commercial exploitation in any circumstances.

Also: "Using our Services does not give you ownership of any intellectual property rights in our Services or the content you access. These terms do not grant you the right to use any branding or logos used in our Services."

Related pages: https://ccea.org.uk/legal (index), https://ccea.org.uk/legal/disclaimer (liability exclusion; CCEA not responsible for linked sites). There is no dedicated `/copyright` or `/terms-and-conditions` page (both 404). No published "linking policy" was found; the terms do not restrict *linking* to CCEA URLs.

### 2.3 Notice inside the PDFs

The Summer 2025 M4 paper (and the Summer 2025 FM Unit 1 paper) carry on the final page:

> Permission to reproduce all copyright material has been applied for. In some cases, efforts to contact copyright holders may have been unsuccessful and CCEA will be happy to rectify any omissions of acknowledgement in future if notified.

and, inside the paper, "All images © CCEA unless stated." Mark schemes carry no separate notice. The specification PDF (Version 2, 8 June 2017, subject code 2210) contains no copyright licence text.

### 2.4 Practical reading for our platform

| Action | Permitted? | Basis |
|---|---|---|
| Deep-link (open in new tab) to the official PDF on ccea.org.uk | Yes – nothing in the terms restricts linking; Maths Genie and Save My Exams both do exactly this (see §3). | Terms of Use; observed practice |
| Download for personal / school revision use | Yes | Copyright Notice |
| Re-host / mirror PDFs on our own server or CDN, or serve them through our own proxy/viewer | **No** – "not permitted to distribute the content via electronic means (for example the internet...)". Revision Maths and Teachers To Your Home do mirror files, but that is their risk, not a licence. | Copyright Notice |
| Embed the PDF in an `<iframe>` / `<embed>` | **Technically blocked** (`x-frame-options: SAMEORIGIN`) and arguably "distribution via electronic means" – do not attempt. | HTTP headers; Copyright Notice |
| Reproduce question text / diagrams (OCR, screenshots, re-typing) | No without a licence – it is CCEA's copyright; "store it in a retrieval system" is expressly excluded. Very short quotation for identification (e.g. the first few words of a question stem) is defensible as metadata but full stems are not. | Copyright Notice |
| Use for a paid product | **No** – "not ... for commercial exploitation in any circumstances". If the platform is monetised, obtain a written licence from CCEA (info@ccea.org.uk, 29 Clarendon Road, Belfast BT1 3BG, +44 (0)28 9026 1200). | Terms of Use; Copyright Notice |
| Index metadata (paper, question number, marks, topic, spec reference) | Yes – facts about a work are not the work; this is how Corbettmaths, BBC Bitesize and teacher sites reference CCEA papers. | General copyright principle; observed practice |
| Write our own worked solutions / model answers to a CCEA question | Yes for the solution itself (our original expression), provided we do not reproduce the question and we link to the official paper and mark scheme. NI Maths Tutor publishes full video solutions this way. | Observed practice |
| Write original questions "in CCEA style" | Yes – style, topic lists and mark structures are not protected; Corbettmaths and On Target Resources both sell/give CCEA-style practice papers. Do not use CCEA logos or imply endorsement. | Terms of Use (branding); observed practice |

Important corroborating signal: CCEA itself withholds papers whose third-party content it cannot clear, and its own Paper Builder / Topic Tracker tools that re-serve past-paper questions are **restricted to registered teachers and tutors** (see §4). That strongly suggests CCEA does not regard open re-publication of question content as acceptable.

---

## 3. Third-party hosts of CCEA maths papers and topic-sorted questions

| Site | CCEA GCSE Maths coverage | Hosting model | Topic-sorted CCEA questions? | Notes / URLs |
|---|---|---|---|---|
| **Maths Genie** | 138 Maths paper pages (Summer 2018 → Nov 2024 at fetch time; June/Nov naming), plus FM Unit 1–4 2018–2025 | **Links out to ccea.org.uk PDFs** (e.g. its M4 June 2019 page contains the exact `https://ccea.org.uk/downloads/docs/Past-Papers/...-Paper.pdf` URL) | No CCEA-specific topic bank – the CCEA course pages reuse Maths Genie's generic GCSE lessons/questions/worksheets. | https://mathsgenie.co.uk/gcse/maths/ccea, https://mathsgenie.co.uk/gcse/maths/ccea/papers, https://mathsgenie.co.uk/gcse/further-maths/ccea/papers, example paper page https://mathsgenie.co.uk/gcse/maths/ccea/papers/gcse-ccea-maths-2019-june-unit-m4-calculator-gmc41-983ddd214b. Footer: "Exam board names are used for identification only and do not imply affiliation or endorsement." (© MyDojo, Inc.) |
| **Save My Exams** | CCEA GCSE Maths past papers (276 paper/MS viewer links) and CCEA GCSE Further Maths (50 links) | Its viewer pages take a `?pdf=https://ccea.org.uk/downloads/...` parameter, i.e. **the PDF is loaded from ccea.org.uk**, not mirrored | No – for CCEA GCSE Maths the nav lists only "Past Papers" (no revision notes, exam questions or topic questions), unlike AQA/Edexcel/OCR. | https://www.savemyexams.com/gcse/maths/ccea/, https://www.savemyexams.com/gcse/maths/ccea/past-papers/, https://www.savemyexams.com/gcse/further-maths/ccea/past-papers/ |
| **Physics & Maths Tutor** | **None for GCSE Maths** – the GCSE Maths past-papers page lists AQA, Edexcel, OCR, WJEC, CIE/IGCSE only; `/maths-revision/gcse-ccea/` and `/past-papers/gcse-maths/ccea/` both 404 | – | No | https://www.physicsandmathstutor.com/past-papers/gcse-maths/ |
| **Corbettmaths** | No past papers, but the **only major site with CCEA M1–M8-specific materials**: per-unit revision pages, revision checklists (M1–M8), YouTube playlists per unit, "A Bit of Everything" papers, Practice Papers Set A (M1–M8) and Set B (M1–M4), "Ultimate M4 / M8" revision booklets with answers | Self-authored, free | Yes in the sense of *Corbettmaths* questions mapped to CCEA units; the booklets map each topic to Corbettmaths video numbers (e.g. "Factorising Harder Quadratics – Video 119", "Circle Theorems – Videos 64, 65", "Histograms – Videos 157 to 159, 52", "Applying Bounds – Video 184", "Volume of a Frustum – Video 360a", "Stratified Sampling – Video 281"). | Hub https://corbettmaths.com/2022/09/21/ccea-revision/; unit pages https://corbettmaths.com/2022/09/21/ccea-m1-revision/ … `ccea-m8-revision/`; checklists https://corbettmaths.com/2019/03/19/ccea-revision-checklists/ (PDFs: https://corbettmaths.com/wp-content/uploads/2021/11/CCEA-Checklist-M1.pdf, `CCEA-Checklist-M2.pdf`, `CCEA-Checklist-M3.pdf`, `CCEA-Checklist-M4-.pdf`, https://corbettmaths.com/wp-content/uploads/2019/04/CCEA-M5-Checklist.pdf, `CCEA-M6-Checklist.pdf`, `CCEA-M7-Checklist.pdf`, `CCEA-M8-Checklist.pdf` – these are image-only PDFs, no text layer); practice papers https://corbettmaths.com/2021/11/18/ccea-practice-papers/ (e.g. https://corbettmaths.com/wp-content/uploads/2021/11/CCEA-Set-A-M4.pdf, https://corbettmaths.com/wp-content/uploads/2022/04/CCEA-Set-A-M8-Paper-1.pdf); M4 booklet https://corbettmaths.com/wp-content/uploads/2022/09/M4-Booklet-Corbettmaths.pdf and answers https://corbettmaths.com/wp-content/uploads/2022/12/M4-Booklet-Answers.pdf; playlists e.g. M4 https://www.youtube.com/playlist?list=PLCkAjxP1zN65WiAbtrBpUjZlGMS1h28GU, M8 https://www.youtube.com/playlist?list=PLCkAjxP1zN65iAGUvckYv_gCd2W3FHxz4, M1 `PLCkAjxP1zN67LNpjEr4Xav97VkdnRFmjY`, M2 `PLCkAjxP1zN650RIzPzoHhmFHHLj0Y1jsg`, M3 `PLCkAjxP1zN67BWvEi8aY3rCFg2mKmKh6J`, M5 `PLCkAjxP1zN65MEhygAA3MIyr8HfYV5bRl`, M6 `PLCkAjxP1zN64jcJ9F5zTK4SRlb102jHzA`, M7 `PLCkAjxP1zN67p4VtB5jluY6b0KnqkhqMm`. Terms (https://corbettmaths.com/2018/05/17/terms-and-conditions/): free for individual/teacher use; **"I encourage colleagues to 'link' to my resources ... rather than uploading copies"**; no profit-making use; no re-distribution of questions inside other resources. |
| **Revision Maths** | M1–M8 papers + MS for June 2022–2025 (as zip bundles) and Nov 2020/2021 individually | **Self-hosted copies** (`/sites/mathsrevision.net/files/imce/GCSE-Mathematics -504-November2021-...-MS.pdf`, `/sites/default/files/revisionmaths/archives/CCEA2025HigherPapers.zip`) | No | https://revisionmaths.com/gcse-maths/gcse-maths-past-papers/ccea-gcse-maths-past-papers |
| **Teachers To Your Home** | Nov 2025 back to May 2023 papers/MS per unit | **Self-hosted copies** (`/storage/uploads/exam_files/gcse-mathematics--504-summer2025-foundation-tier2c-m1-28with-calculator29-ms.pdf`) | No | https://www.teacherstoyourhome.com/uk/past-papers/gcse/maths/ccea |
| **PapaCambridge → Papafy** | `pastpapers.papacambridge.com/papers/ccea/gcse/mathematics` now redirects to https://papafy.com/ccea; CCEA GCSE Mathematics (2210) page exists; site sells "Topical Past Papers", "Solved Past Papers" and "Predicted Papers" products (subscription) | JS-rendered; PDF hosting not verifiable from HTML | Advertises topical papers per board; CCEA GCSE maths topical availability **unverified** | https://papafy.com/ccea/past-papers/ccea-gcses/mathematics-2210 |
| **GCSE Guide** | Site unreachable (gcseguide.co.uk and www. – connection failure, curl exit 000) | – | – | – |
| **BBC Bitesize (CCEA GCSE Maths)** | Revision guides organised **by CCEA unit and strand** (M1 Number/Algebra/Geometry & measures/Handling data … M8 Number & Algebra 7 guides, Geometry & measures 3, Handling data), plus "GCSE Maths: CCEA past papers and mark schemes", "Exam-style quiz by topic" and "quick-fire questions" based on CCEA past papers | BBC-authored | Yes (BBC's own quizzes "based on CCEA foundation and higher past papers") | https://www.bbc.co.uk/bitesize/examspecs/zcq8b82 |
| **NI Maths Tutor** (NI tutor site) | Full video solutions for M3/M4/M7/M8 papers, June 2022 → May 2026, and FM Units 1–3 2023–2025 | YouTube videos (own work); sells M4/M8 and FM revision courses | Per-paper, not per-topic | https://www.nimathstutor.co.uk, https://www.nimathstutor.co.uk/index.php/past-papers/gcse-past-papers-solutions (e.g. "M4 May 2025 Full Solutions" https://www.youtube.com/watch?v=Fx6KtsT0Or8, "M8 May 2025" https://www.youtube.com/watch?v=quYwFewtTXI), https://www.nimathstutor.co.uk/index.php/past-papers/gcse-further-maths-past-paper-solutions |
| **FSL GCSE Maths** (NI school Google Site on the c2ken.net schools domain) | M4 and M7/8 **topic → resource maps**: each topic lists the CCEA Higher textbook chapter and the exact Corbettmaths video numbers with links to the practice/textbook questions (e.g. M4 "3. Pythagoras' Theorem and Trigonometry – chapter 33 – Videos 257–263, 329–332"; M7/8 "1. Transformations – chapter 41 – Videos 325, 326, 275, 272–274, 104a–109") | Links only | Yes – a worked example of exactly the Corbettmaths mapping we need | https://sites.google.com/c2ken.net/fsl-gcse-maths/home/m4-module/m4-topic-resources, https://sites.google.com/c2ken.net/fsl-gcse-maths/home/m78-module/m78-topic-resources |
| **On Target Resources** (NI) | Parent guide to M1–M8 structure; sells original M1–M8 practice papers | Commercial | No | https://ontargetresources.co.uk/ccea-gcse-maths-exams-explained/ |
| MME Revise, OnMaths, The GCSE Maths Tutor, Dr Frost, Seneca, Sparx, Oak National | No CCEA mention found on the fetched pages (https://mmerevise.co.uk/gcse-maths-revision/gcse-maths-past-papers/, https://www.onmaths.com, https://thegcsemathstutor.co.uk/, https://senecalearning.com/en-GB/revision-notes/gcse/maths, https://www.thenational.academy/pupils/programmes/maths-secondary-year-11-higher/units) | – | No | Generic GCSE content only |

Take-aways: nobody offers an **official, open, question-level CCEA topic bank**. The two credible topic-level resources are CCEA's own teacher-only tools (§4) and Corbettmaths' unit-level mapping. Sites that stay on the right side of CCEA's notice link out (Maths Genie, Save My Exams); sites that mirror PDFs (Revision Maths, TTYH) are relying on tolerance rather than permission.

---

## 4. CCEA support materials for Maths and Further Maths

### 4.1 Interactive tools (teacher-only)

| Tool | What it is | Access | URL |
|---|---|---|---|
| **Paper Builder** | "A free tool designed for teachers to create practice question papers from past examination papers … currently features GCSE and GCE Mathematics questions from 2015 to 2025. You can easily filter questions by **unit, year or topic**", export PDF + mark scheme, max 50 questions per paper; launched 2 March 2023 | "currently only available to teachers and tutors delivering CCEA qualifications" – login at paperbuilder.ccea.org.uk (unauthenticated request → 403 → `/user/login`) | https://ccea.org.uk/learning-resources/paper-builder; Quick Start Guide linked from that page; launch news https://ccea.org.uk/key-stage-4/gcse/subjects/gcse-mathematics-2017/news |
| **Topic Tracker** | Legacy (© 2010) tool: "free access to over 4000 of CCEA's GCE & GCSE past paper questions" – choose a topic, auto-generate paper + mark scheme, non-calculator flag, formula sheet | Teachers only; register by emailing CCEA for a username/password | https://ccea.org.uk/learning-resources/topic-tracker; https://topictracker.ccea.org.uk/ |
| GCSE Mathematics Support Webinar (Oct 2022) | Recorded webinar | Open | https://ccea.org.uk/key-stage-4/gcse/subjects/gcse-mathematics-2017/webinars |

This is the strongest evidence that CCEA has already topic-tagged its own question bank (Paper Builder filters by "area of study … e.g. Number and the topic Algebraic Expressions") but only licenses it to registered teachers.

### 4.2 GCSE Mathematics support downloads (https://ccea.org.uk/key-stage-4/gcse/subjects/gcse-mathematics-2017/support)

| Resource | URL |
|---|---|
| Specification (Version 2, 8 June 2017; PDF last updated 05/02/2026) | https://ccea.org.uk/downloads/docs/Specifications/GCSE/GCSE%20Mathematics%20%282017%29/GCSE%20Mathematics%20%282017%29-specification-Standard_0.pdf |
| Specimen Assessment Materials | https://ccea.org.uk/downloads/docs/Support/Specimen%20Assessment%20Materials/2019/Specimen%20Assessment%20Materials_23.pdf |
| Specimen Assessment Materials (Legacy) | https://ccea.org.uk/downloads/docs/Support/Specimen%20Assessment%20Materials/2019/Specimen%20Assessment%20Materials%20%28Legacy%29.pdf |
| Student Guide | https://ccea.org.uk/downloads/docs/Support/Student%20Guidance/2019/Student%20Guide_17.pdf |
| Teacher Guidance | https://ccea.org.uk/downloads/docs/Support/Teacher%20Guidance/2019/Teacher%20Guidance.pdf |
| Guidance for teachers on Grading, Aggregation, Resit and Terminal Rules | https://ccea.org.uk/downloads/docs/Support/Teacher%20Guidance/2020/Guidance%20for%20teachers%20on%20Grading%2C%20Aggregation%2C%20Resit%20and%20Terminal%20Rules.pdf |
| Exemplifying Examination Performance 2019 – Grade A | https://ccea.org.uk/downloads/docs/Support/Exemplification%20of%20Examination%20Performance/2020/GCSE%20Mathematics%20Grade%20A%20Exemplifying%20Examination%20Performance%202019.pdf |
| Exemplifying Examination Performance 2019 – Grade C | https://ccea.org.uk/downloads/docs/Support/Exemplification%20of%20Examination%20Performance/2020/GCSE%20Mathematics%20Grade%20C%20Exemplifying%20Examination%20Performance%202019.pdf |
| Practice Papers 2021 (M1, M2, M3, M4, M6 P1/P2, M8 P1/P2) | https://ccea.org.uk/downloads/docs/Support/Practice%20Papers/2021/Unit%20M4%20Practice%20Paper_0.pdf (pattern `Unit%20M1..M8%20Practice%20Paper...`), mark schemes e.g. https://ccea.org.uk/downloads/docs/Support/Practice%20Papers/2022/Unit%20M4%20Practice%20Paper%20%28Mark%20Scheme%29.pdf; bundle https://ccea.org.uk/downloads/docs/Support/Practice%20Papers/2022/GCSE%20Mathematics%20Practice%20Papers%20202122.zip |
| Summer 2021 Additional Support papers 1, 2, 4 with solutions | https://ccea.org.uk/downloads/docs/Support/Sample%20Past%20Papers/2021/Summer%202021%20Alternative%20Arrangements%3A%20GCSE%20Additional%20Support%20Mathematics%3A%20Support%20Papers%201.pdf (and `...Papers%201%20Solutions.pdf`, `Papers%202`, `Papers%204`) |
| Planning Framework Templates M1–M4 / M5–M8 (docx) | https://ccea.org.uk/downloads/docs/Support/General/2021/Planning%20Framework%20Templates%20for%20M1%2C%20M2%2C%20M3%2C%20M4%20Units.docx; https://ccea.org.uk/downloads/docs/Support/General/2021/Planning%20Framework%20Templates%20for%20M5%2C%20M6%2C%20M7%2C%20M8%20Units.docx |
| Progression of Subject Content (topic progression across M1→M8) | https://ccea.org.uk/downloads/docs/Support/General/2019/Progression%20of%20Subject%20Content.pdf |
| Mapping T spec to M spec | https://ccea.org.uk/downloads/docs/Support/General/2019/Mapping%20T%20spec%20to%20M%20Spec.pdf |
| Snapshot (one-page qualification summary) | https://ccea.org.uk/downloads/docs/Support/General/2019/Snapshot_11.pdf |
| Summer 2021 Breakdown of Assessment Objectives | https://ccea.org.uk/downloads/docs/Support/General/2021/Summer%202021%20Assessment%20Resource%3A%20GCSE%20Mathematics%20Breakdown%20of%20Assessment%20Objectives.pdf |
| Problem-solving PPT; Support-event slides 2017, Nov 2018, Mar 2019, Nov 2019 | https://ccea.org.uk/downloads/docs/Support/General/2021/CCEA%20GCSE%20Mathematics%20-%20Problem%20solving.ppt; https://ccea.org.uk/downloads/docs/Support/General/2020/GCSE%20Mathematics%20Support%20Event%20November%202019.pptx |
| Data-handling starters (Frequency Trees, Listing Strategies, Venn Diagrams, "What happens if…?") | https://ccea.org.uk/downloads/docs/Support/Data%20Handling%20Resources/2019/Venn%20Diagrams.pptx etc. |
| BBC Bitesize CCEA GCSE Maths (linked from subject page) | https://www.bbc.com/education/examspecs/zcq8b82 |

Not found for GCSE Mathematics: fact files, eGuides, revision checklists, a topic tracker document, a microsite, or a "Get Ready for GCSE" pack (guessed `learning-resources/get-ready-gcse*` URLs all 404; `https://ccea.org.uk/learning-resources` index returns 403 even with a browser UA, and `learning-resources?subject=mathematics` renders no results server-side). The "resources" tab for Further Maths is a 404.

### 4.3 GCSE Further Mathematics support downloads (https://ccea.org.uk/key-stage-4/gcse/subjects/gcse-further-mathematics-2017/support)

| Resource | URL |
|---|---|
| Specification (Version 2, 17 Sept 2019; subject code 2260) | https://ccea.org.uk/downloads/docs/Specifications/GCSE/GCSE%20Further%20Mathematics%20%282017%29/GCSE%20Further%20Mathematics%20%282017%29-specification-Standard_0.pdf |
| Specimen Assessment Materials | https://ccea.org.uk/downloads/docs/Support/Specimen%20Assessment%20Materials/2019/Specimen%20Assessment%20Materials_18.pdf |
| Student Guide | https://ccea.org.uk/downloads/docs/Support/Student%20Guidance/2019/Student%20Guide_7.pdf |
| Teacher Guidance (Dec 2024) | https://ccea.org.uk/downloads/docs/Support/Teacher%20Guidance/2024/GCSE%20Further%20Mathematics%20Teacher%20Guidance.pdf |
| **Fact Files** Unit 1–4 | https://ccea.org.uk/downloads/docs/Support/Factfile/2019/GCSE%20Further%20Maths%20Unit%201.pdf, `...Unit%202.pdf`, `...Unit%203.pdf`, `...Unit%204.pdf` |
| **Question and Answer Booklets** (topic-organised CCEA-authored questions) – Unit 1 Pure, Unit 2 Mechanics, Unit 3 Statistics (2023 and 2025 editions) | https://ccea.org.uk/downloads/docs/Support/Question%20and%20Answer%20Booklets/2023/GCSE%20Further%20Mathematics%20%282017%29%3A%20Unit%201%3A%20Pure%20Mathematics%20-%20Question%20and%20Answer%20Booklet.pdf; `...Unit%202%3A%20Mechanics%20-%20Question%20and%20Answer%20Booklet.pdf`; `...Unit%203%3A%20Statistics%20-%20Question%20and%20Answer%20Booklet.pdf`; 2025 Unit 3: https://ccea.org.uk/downloads/docs/Support/Question%20and%20Answer%20Booklets/2025/GCSE%20Further%20Mathematics%20%282017%29%3A%20Unit%203%3A%20Statistics%20-%20Question%20and%20Answer%20Booklet.pdf |
| Exemplifying Examination Performance 2019 | https://ccea.org.uk/downloads/docs/Support/Exemplification%20of%20Examination%20Performance/2020/GCSE%20Further%20Mathematics%20Exemplifying%20Examination%20Performance%202019.pdf |
| Mathematical Formulae and Tables | https://ccea.org.uk/downloads/docs/Support/General/2019/Mathematical%20Formulae%20and%20Tables_0.pdf |
| Planning Framework (docx), Snapshot | https://ccea.org.uk/downloads/docs/Support/General/2019/Planning%20Framework_6.docx; https://ccea.org.uk/downloads/docs/Support/General/2019/Snapshot_10.pdf |
| Topic PPTs (U1 completing the square, U1 quadratic inequalities, U4 logic truth tables, U4 linear programming, U4 counting) | e.g. https://ccea.org.uk/downloads/docs/Support/General/2019/U4%2018%20Linear%20Programming%20Making%20Furniture%20Question.pptx |
| Support-event slides June 2018, March 2020, March 2023 | https://ccea.org.uk/downloads/docs/Support/General/2023/GCSE%20Further%20Mathematics%20Support%20Event%2C%20March%202023.pptx |

All of these carry the same CCEA copyright terms as past papers (link, don't mirror).

---

## 5. Proposed legal strategy for a topic-by-topic CCEA practice bank

### 5.1 Principle

**Index, don't copy.** Our database stores *facts about* CCEA questions (where they are, what they test, how many marks) and *our own* content (solutions, hints, original questions). Every CCEA-owned artefact is reached by a link to ccea.org.uk. This mirrors how Maths Genie, Save My Exams and BBC Bitesize operate and stays inside the Copyright Notice ("personal / educational use", no electronic redistribution) while giving students the topic-level practice that CCEA's own Paper Builder only offers to teachers.

### 5.2 Data model

```
Paper        {id, qualification(504|507|584), unit(M1..M8|U1..U4), paper_no(1|2|null), tier(F|H),
              series(Summer|November|January|March), year, code(GMC41…), duration_min, total_marks,
              paper_url, ms_url, feed_entry_id, feed_changed, examiner_report_url?}
Question     {id, paper_id, q_number("11"), part("b"|null), marks, calculator(bool),
              page_in_pdf, spec_refs[], topic_ids[], ao(AO1|AO2|AO3), difficulty(1-5),
              stem_hint(≤ 12 words, e.g. "cumulative frequency – house prices"), our_solution_id,
              video_ids[] (NI Maths Tutor / Corbettmaths timestamps), status(draft|reviewed)}
Topic        {id, unit, strand(Number & algebra | Geometry & measures | Handling data),
              name, spec_outcome_text_ref, corbett_video_numbers[], corbett_worksheet_urls[],
              bbc_bitesize_url, ccea_support_urls[]}
Solution     {id, question_id, author, markdown/LaTeX, method_marks_breakdown (M/A/MA as per CCEA MS),
              common_errors[], reviewed_by}
OriginalQ    {id, topic_ids[], stem, diagram(svg), answer, marks, style_notes ("CCEA M4-style, 3 marks, MA1 MA1 A1")}
```

The `stem_hint` deliberately is *not* the question text; it is an identification label. The student flow is: pick topic → see list "Summer 2025 M4 Q11 (6 marks, cumulative frequency)" → button "Open official paper (CCEA)" (new tab, `#page=N` anchor so the PDF opens on the right page) → attempt → reveal *our* worked solution → link "Official mark scheme (CCEA)".

### 5.3 Build pipeline (all automatable, run every fortnight against the feed's `last-modified`)

1. **Sync**: fetch `504.json`, `507.json`, `584.json` with the browser UA and a 10 s crawl delay (robots.txt), keep `Standard` entries, normalise unit/paper/tier from `field_title_paper_ms` (handle the `MI`, missing "Paper n" and `_0` quirks in §1.2), upsert `Paper` rows. Never store the PDF bytes in anything user-facing; a private cache for the tagging step is "download for educational use", but delete it after tagging.
2. **Segment** each paper into questions: the CCEA layout makes this easy – questions start with a number at the left margin and every part ends with `[n]` marks (M4 Summer 2025 example: Q1 [6], Q2(a)[2](b)[3], Q3 [3], Q4 [3], Q5 [3], Q6(a)[3](b)[3], Q7 [1][1], Q8 [4], Q9 [3], Q10 [2][1][3], Q11 [1][3][2], Q12 [3], Q13 [4], Q14 [4], Q15 [3][3], Q16 [4], Q17 [2][3], Q18 [1][1], Q19 [4], Q20 [4], Q21 [5], Q22 [4][4][4] = 100 marks). Record page numbers so deep links can carry `#page=`.
3. **Tag** each question to spec learning outcomes and our topic taxonomy (human-reviewed; the M4 spec has ~12 outcomes – bounds, factorising harder quadratics, algebraic fractions, equations with algebraic fractions, quadratics by factors/formula, perpendicular gradients, frustums, circle theorems, stratified sampling, histograms – so M4 tagging is quick; M8 adds surds, indices, growth/decay, recurring decimals, simultaneous linear/non-linear, exponential graphs, rates of change, circle equation/tangent, indirect proportion, sine/cosine rule, ½ab sin C, 3-D trig, negative enlargement, similar-solid ratios, complex probability). Cross-check with the mark scheme's M/A/MA breakdown for the `method_marks_breakdown` field.
4. **Author solutions**: our own worked solutions per question (Markdown + KaTeX), written from the mark scheme's method but in our words, with the CCEA mark labels (MA1/A1) so students see where marks are earned. Solutions are our copyright.
5. **Author original questions**: for each topic, 3–10 original items written to the same mark tariff and phrasing conventions (contexts, "diagram not drawn accurately", answer lines with units, "[n]" marks). These are the items we can render inline, auto-mark, randomise and put in quizzes. No CCEA logos, and a footer stating "Not endorsed by CCEA; exam-board names used for identification only" (the wording Maths Genie uses).
6. **Enrich** with external, link-only resources: Corbettmaths video/worksheet per topic (see 5.4), BBC Bitesize CCEA unit guide, NI Maths Tutor full-paper video (per paper), CCEA support downloads (§4).

### 5.4 Mapping Corbettmaths to CCEA M-unit topics

Corbettmaths has no per-video CCEA tag, but three things make a reliable mapping possible:

* The **Corbettmaths CCEA revision booklets** (M4: https://corbettmaths.com/wp-content/uploads/2022/09/M4-Booklet-Corbettmaths.pdf) list each CCEA topic with its video numbers – 14 mappings for M4 (Factorising Harder Quadratics 119; Algebraic Fractions 21; Harder Equations 111, 111a; Quadratic Equations 266; Quadratic Formula 267; Perpendicular Lines 197; Circle Theorems 64, 65; Volume of a Cone 359; Volume of a Pyramid 360; Volume of a Frustum 360a; Surface Area of a Cone 314; Stratified Sampling 281; Histograms 157–159, 52; Applying Bounds 184). The M1–M3/M5–M8 checklists are image PDFs, so those need manual transcription (or OCR) from https://corbettmaths.com/2019/03/19/ccea-revision-checklists/.
* The **FSL GCSE Maths** NI school site already publishes a full M4 and M7/M8 topic → Corbettmaths video-number table (§3) which can be used as a second source to validate our table.
* The **Corbettmaths contents page** (https://corbettmaths.com/contents/) gives the canonical video-number → URL → practice-questions → textbook-exercise mapping, so once a topic has video numbers, the worksheet URLs follow.

Proposed `Topic.corbett_video_numbers` seed for M4 (from the booklet) and the method for the rest: for each spec learning outcome (from the spec's "Content / Learning Outcomes" tables, §3.1–3.8), pick the Corbettmaths video(s) whose title matches, record the number(s), store the canonical Corbettmaths URL and link out. Respect Corbettmaths' terms: **link, never upload copies**, never reuse their questions in our resources, keep attribution visible.

### 5.5 Legal guard-rails checklist

* Link-out only for every CCEA PDF; no proxying, no iframes (blocked anyway by `x-frame-options: SAMEORIGIN`), no mirrored copies, no OCR'd stems in the public database.
* Keep our identification label ≤ ~12 words and never a full question sentence.
* Attribution line on every paper card: "© CCEA – opens on ccea.org.uk. Papers and mark schemes are CCEA copyright; download for personal or school revision use only."
* No CCEA branding/logos (Terms of Use).
* If the platform charges money, get a written licence from CCEA first – the Copyright Notice's "not ... commercial exploitation in any circumstances" would otherwise bite even for an index-plus-links model that depends on their content. Ask at the same time whether CCEA would grant student access to Paper Builder / Topic Tracker data or an API; their launch news (2 March 2023) shows they already maintain a topic-tagged question bank.
* Honour `Crawl-delay: 10` and cache the feed (14-day `max-age`).
* Corbettmaths and NI Maths Tutor content: link only, attribute, no commercial reuse.
* Original questions must be original: write from the spec outcome, not by paraphrasing a CCEA item.

### 5.6 Coverage available on day one

| Qualification | Papers indexable | Mark schemes | Question rows (est.) |
|---|---|---|---|
| GCSE Maths 504 | 164 | 152 | ≈ 164 × 20 ≈ 3,300 |
| GCSE Further Maths 507 | 29 | 25 | ≈ 29 × 10 ≈ 300 |
| Double Award Science 584 | 264 | 244 | ≈ 264 × 12 ≈ 3,200 |

---

## 6. Source URL register (everything cited above)

CCEA
* https://ccea.org.uk/key-stage-4/gcse/subjects/gcse-mathematics-2017 (subject home; links spec, Paper Builder, Topic Tracker, BBC Bitesize)
* https://ccea.org.uk/key-stage-4/gcse/subjects/gcse-mathematics-2017/past-papers-mark-schemes
* https://ccea.org.uk/key-stage-4/gcse/subjects/gcse-mathematics-2017/archived-past-papers-mark-schemes
* https://ccea.org.uk/key-stage-4/gcse/subjects/gcse-mathematics-2017/support
* https://ccea.org.uk/key-stage-4/gcse/subjects/gcse-mathematics-2017/news
* https://ccea.org.uk/key-stage-4/gcse/subjects/gcse-mathematics-2017/webinars
* https://ccea.org.uk/key-stage-4/gcse/subjects/gcse-further-mathematics-2017
* https://ccea.org.uk/key-stage-4/gcse/subjects/gcse-further-mathematics-2017/past-papers-mark-schemes
* https://ccea.org.uk/key-stage-4/gcse/subjects/gcse-further-mathematics-2017/archived-past-papers-mark-schemes
* https://ccea.org.uk/key-stage-4/gcse/subjects/gcse-further-mathematics-2017/support
* https://ccea.org.uk/sites/default/files/qualification/504.json
* https://ccea.org.uk/sites/default/files/qualification/507.json
* https://ccea.org.uk/sites/default/files/qualification/584.json
* https://ccea.org.uk/legal, https://ccea.org.uk/legal/terms-use, https://ccea.org.uk/legal/disclaimer
* https://ccea.org.uk/robots.txt
* https://ccea.org.uk/learning-resources/paper-builder, https://paperbuilder.ccea.org.uk/user/login
* https://ccea.org.uk/learning-resources/topic-tracker, https://topictracker.ccea.org.uk/
* https://ccea.org.uk/past-papers-mark-schemes (A–Z of past papers)

Third parties
* https://mathsgenie.co.uk/gcse/maths/ccea, https://mathsgenie.co.uk/gcse/maths/ccea/papers, https://mathsgenie.co.uk/gcse/further-maths/ccea/papers
* https://www.savemyexams.com/gcse/maths/ccea/, https://www.savemyexams.com/gcse/maths/ccea/past-papers/, https://www.savemyexams.com/gcse/further-maths/ccea/past-papers/
* https://www.physicsandmathstutor.com/past-papers/gcse-maths/
* https://corbettmaths.com/2022/09/21/ccea-revision/, https://corbettmaths.com/2019/03/19/ccea-revision-checklists/, https://corbettmaths.com/2021/11/18/ccea-practice-papers/, https://corbettmaths.com/2021/11/18/ccea-revision-2021-2022/, https://corbettmaths.com/2019/04/03/ccea-gcse-summer-2019/, https://corbettmaths.com/2022/09/21/ccea-m4-revision/, https://corbettmaths.com/contents/, https://corbettmaths.com/2018/05/17/terms-and-conditions/
* https://revisionmaths.com/gcse-maths/gcse-maths-past-papers/ccea-gcse-maths-past-papers
* https://www.teacherstoyourhome.com/uk/past-papers/gcse/maths/ccea
* https://papafy.com/ccea, https://papafy.com/ccea/past-papers/ccea-gcses/mathematics-2210
* https://www.bbc.co.uk/bitesize/examspecs/zcq8b82
* https://www.nimathstutor.co.uk, https://www.nimathstutor.co.uk/index.php/past-papers/gcse-past-papers-solutions, https://www.nimathstutor.co.uk/index.php/past-papers/gcse-further-maths-past-paper-solutions
* https://sites.google.com/c2ken.net/fsl-gcse-maths/home/m4-module/m4-topic-resources, https://sites.google.com/c2ken.net/fsl-gcse-maths/home/m78-module/m78-topic-resources
* https://ontargetresources.co.uk/ccea-gcse-maths-exams-explained/
