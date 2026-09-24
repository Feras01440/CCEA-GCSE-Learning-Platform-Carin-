# 08 – CCEA past papers, mark schemes, specimen papers and topic question banks

Research date: 1 September 2026. Scope: CCEA GCSE Mathematics (2017 spec, units M1–M8), GCSE Further Mathematics (2017), GCSE Science Double Award (2017). Every URL below was either fetched (curl/WebFetch) or seen verbatim in a search result; fetch failures are recorded in section 12.

---

## 1. Executive summary

- **Official source**: everything lives under `https://ccea.org.uk/key-stage-4/gcse/subjects/<subject-slug>/past-papers-mark-schemes`. The pages are Drupal/Alpine.js views that render a **per-qualification JSON feed** at `https://ccea.org.uk/sites/default/files/qualification/<id>.json`. Feed ids confirmed: **504 = GCSE Mathematics (2017)** (635 entries), **507 = GCSE Further Mathematics (2017)** (90 entries), **584 = GCSE Science Double Award (2017)** (945 entries). Legacy feeds also exist: 505 (GCSE Mathematics 2010, T-units, 326 entries), 585 (Science Double Award 2011, 449 entries).
- **PDF URL pattern** (use the feed's `field_document_cloud` verbatim – filenames are inconsistent, hand-building them fails):
  `https://ccea.org.uk/downloads/docs/Past-Papers/cleared/GCSE/<Subject folder>/<YEAR>-<Series>/<Standard|Modified|Irish Medium>/0/<Subject>-<qualcode>-<Series><YEAR>-<Paper title>-<Paper|MS>.pdf`
- **Series available (Standard papers)**: Maths: Summer 2018 (M1–M4 only), **January 2019** (M1–M4), Summer 2019, **January 2020** (all 12 papers), Summer 2021, November 2021, Summer 2022, November 2022, Summer 2023, November 2023, Summer 2024, November 2024, Summer 2025, November 2025 and Summer 2026 (papers only; MS not yet posted). January series stopped after 2020; a November series (all eight units) exists from 2021. Further Maths: Summer 2018 (Unit 1 only), 2019, 2021, 2022, 2023, 2024, 2025, 2026 (no 2020). Double Award Science: March, Summer and November series every year 2018–2026 (no Summer 2020).
- **Copyright**: CCEA's notice on every past-paper page permits download/print "for your own personal use or that of your school, college or other educational institution", and expressly forbids distributing "via electronic means (for example the internet or an intranet)", storing "in a retrieval system", or "commercial exploitation in any circumstances". So: **link out, do not re-host, embed, or reproduce** CCEA question text/mark schemes without a licence. Papers older than five years are removed annually.
- **Topic-by-topic official tools**: CCEA **Topic Tracker** (topictracker.ccea.org.uk, 4,000+ GCE/GCSE past-paper questions, teachers only, register by e-mail) and **Paper Builder** (paperbuilder.ccea.org.uk, GCSE & GCE Mathematics questions 2015–2025 filterable by unit/year/topic, teachers/tutors only; output "authorised for personal or classroom use only", cannot be "redistributed online without prior permission from CCEA"). GCSE Further Mathematics was planned for Paper Builder in 2025/26.
- **Third parties**: none of PMT, Save My Exams, Maths Genie or Revisely offer CCEA topic-sorted question banks. Save My Exams and Maths Genie list CCEA papers (SME deep-links to CCEA PDFs; Maths Genie serves them behind its own viewer/login). Revision Maths, Revision Science, PapersDaddy and Teachers To Your Home re-host copies. NI Maths Tutor publishes free YouTube full-paper video solutions (M3/M4/M7/M8, 2022–2026). Corbettmaths has original CCEA-specific checklists, "Ultimate" question booklets, and practice papers for every unit M1–M8, but its terms say link, don't re-upload, and no for-profit use. BBC Bitesize has bespoke CCEA M1–M8 guides plus exam-style quizzes built from CCEA past papers.
- **Recommended build**: an index of CCEA questions by *metadata* (paper, question number, page, topic tags, marks, calculator, tier) with deep links to the official PDF (`#page=N`), our own worked solutions/video, and our own bank of original CCEA-style questions with our own mark schemes; plus a licence request to CCEA for anything beyond that. Details in section 11.

---

## 2. Official ccea.org.uk URLs

### 2.1 Cross-subject entry points

| Page | URL | Notes |
|---|---|---|
| A–Z of CCEA Past Papers & Mark Schemes | https://ccea.org.uk/past-papers-mark-schemes | Lists current spec + "View legacy" per subject |
| GCSE Past Papers & Mark Schemes landing | https://ccea.org.uk/key-stage-4/gcse/past-papers-mark-schemes | Same A–Z, GCSE only |
| Terms of Use | https://ccea.org.uk/legal/terms-use | Copyright wording quoted in §5 |
| Disclaimer (external links) | https://ccea.org.uk/legal/disclaimer | "CCEA is not responsible for the content of linked websites" |
| Legal index | https://ccea.org.uk/legal | |
| Topic Tracker (resource page) | https://ccea.org.uk/learning-resources/topic-tracker | "This resource is for teachers only." |
| Topic Tracker (tool) | https://topictracker.ccea.org.uk/default.aspx | Login; register via e-mail |
| Paper Builder (resource page + FAQ) | https://ccea.org.uk/learning-resources/paper-builder | Login at paperbuilder.ccea.org.uk (as stated on the page) |
| Paper Builder Quick Start Guide | linked from the page above ("Paper Builder Quick Start Guide, pdf, 1.23 MB, 02/02/2023") | |
| BBC Bitesize GCSE Maths – CCEA (linked from CCEA maths page) | https://www.bbc.com/education/examspecs/zcq8b82 → resolves to https://www.bbc.co.uk/bitesize/examspecs/zcq8b82 | Bespoke M1–M8 content |

### 2.2 GCSE Mathematics (2017) – qualification code 504, subject code 2210, QAN 603/1688/3

| Page | URL |
|---|---|
| Subject home | https://ccea.org.uk/key-stage-4/gcse/subjects/gcse-mathematics-2017 |
| Past Papers & Mark Schemes | https://ccea.org.uk/key-stage-4/gcse/subjects/gcse-mathematics-2017/past-papers-mark-schemes |
| Archived (legacy T-spec) Past Papers | https://ccea.org.uk/key-stage-4/gcse/subjects/gcse-mathematics-2017/archived-past-papers-mark-schemes (alias also live: https://ccea.org.uk/key-stage-4/gcse/subjects/gcse-mathematics-2017/past-papers-mark-schemes/archived-past-papers-mark) |
| Support (specimen, exemplars, practice papers, guidance) | https://ccea.org.uk/key-stage-4/gcse/subjects/gcse-mathematics-2017/support |
| Resources (learning-resource tiles) | https://ccea.org.uk/key-stage-4/gcse/subjects/gcse-mathematics-2017/resources |
| Reports (Chief Examiner's reports) | https://ccea.org.uk/key-stage-4/gcse/subjects/gcse-mathematics-2017/reports |
| News | https://ccea.org.uk/key-stage-4/gcse/subjects/gcse-mathematics-2017/news |
| Specification PDF (Standard, updated 05/02/2026) | https://ccea.org.uk/downloads/docs/Specifications/GCSE/GCSE%20Mathematics%20%282017%29/GCSE%20Mathematics%20%282017%29-specification-Standard_0.pdf |
| Specification PDF (Irish-medium) | https://ccea.org.uk/downloads/docs/Specifications/GCSE/GCSE%20Mathematics%20%20%282017%29/GCSE%20Mathematics%20%20%282017%29-specification-Irish-medium.pdf |
| JSON feed | https://ccea.org.uk/sites/default/files/qualification/504.json |
| Legacy JSON feed (GCSE Mathematics 2010, T1–T6) | https://ccea.org.uk/sites/default/files/qualification/505.json |

The page references the feed as `x-data="qualificationPapers('https://ccea.org.uk/sites/default/files/qualification/504.json?v=1787910737', '504')"` (the `?v=` is a cache-buster; the bare URL works).

### 2.3 GCSE Further Mathematics (2017) – qualification code 507

| Page | URL |
|---|---|
| Past Papers & Mark Schemes | https://ccea.org.uk/key-stage-4/gcse/subjects/gcse-further-mathematics-2017/past-papers-mark-schemes |
| Archived (legacy, Summer 2006–2019) | https://ccea.org.uk/key-stage-4/gcse/subjects/gcse-further-mathematics-2017/archived-past-papers-mark-schemes |
| Support (fact files, Q&A booklets, specimen, exemplars) | https://ccea.org.uk/key-stage-4/gcse/subjects/gcse-further-mathematics-2017/support |
| Reports | https://ccea.org.uk/key-stage-4/gcse/subjects/gcse-further-mathematics-2017/reports |
| Resources | https://ccea.org.uk/key-stage-4/gcse/subjects/gcse-further-mathematics-2017/resources → **404** |
| JSON feed | https://ccea.org.uk/sites/default/files/qualification/507.json |

(Feed id 506 is GCE Further Mathematics (2018), 50 entries – not GCSE.)

### 2.4 GCSE Science Double Award (2017) – qualification code 584

| Page | URL |
|---|---|
| Subject home | https://ccea.org.uk/key-stage-4/gcse/subjects/gcse-science-double-award-2017 |
| Past Papers & Mark Schemes | https://ccea.org.uk/key-stage-4/gcse/subjects/gcse-science-double-award-2017/past-papers-mark-schemes |
| Archived (legacy 2011 spec) | https://ccea.org.uk/key-stage-4/gcse/subjects/gcse-science-double-award-2017/archived-past-papers-mark-schemes |
| Support (fact files, practical manuals, specimen, exemplars, glossaries) | https://ccea.org.uk/key-stage-4/gcse/subjects/gcse-science-double-award-2017/support |
| Resources | https://ccea.org.uk/key-stage-4/gcse/subjects/gcse-science-double-award-2017/resources |
| Reports | https://ccea.org.uk/key-stage-4/gcse/subjects/gcse-science-double-award-2017/reports |
| Specification PDF (Standard, updated 28/01/2026) | https://ccea.org.uk/downloads/docs/Specifications/GCSE/GCSE%20Science%20Double%20Award%20%282017%29/GCSE%20Science%20Double%20Award%20%282017%29-specification-Standard_0.pdf |
| JSON feed | https://ccea.org.uk/sites/default/files/qualification/584.json |
| Legacy JSON feed (Science Double Award 2011) | https://ccea.org.uk/sites/default/files/qualification/585.json |

---

## 3. How the past-paper pages work (JSON feeds) and the PDF URL pattern

### 3.1 Feed format

Each feed is a JSON array. Fields (identical across 504/507/584):
`title, id, copyright_status, series, year, gce, qualification, archive, status, mark_scheme, tier, type, field_document_cloud, field_title_paper_ms, mime_type, type_class, changed`.

Example entry (504):

```json
{"title":"Cleared/Standard Paper: Higher Tier, M8: Paper 2 (With calculator) - [504] GCSE Mathematics (2017), Summer 2026",
 "id":"69329","copyright_status":"","series":"Summer","year":"2026","qualification":"504","archive":"0",
 "mark_scheme":"0","tier":"","type":"Standard",
 "field_document_cloud":"/downloads/docs/Past-Papers/cleared/GCSE/GCSE%20Mathematics%20%282017%29/2026-Summer/Standard/0/GCSE-Mathematics%20-504-Summer2026-Higher%20Tier%2C%20M8%3A%20Paper%202%20%28With%20calculator%29-Paper.pdf",
 "field_title_paper_ms":"Higher Tier, M8: Paper 2 (With calculator)","mime_type":"pdf","type_class":"standard","changed":"28/08/2026"}
```

- `mark_scheme`: `"0"` = question paper, `"1"` = mark scheme.
- `type` / `type_class`: `Standard`, `Modified` (large-print / modified-language versions, e.g. `(MV18)`, `(MV24)`, `(ML)`), `Irish Medium`.
- `tier` is mostly blank (only 102 of 635 maths entries populated) – derive tier from `field_title_paper_ms`.
- `field_document_cloud` is the path to prepend to `https://ccea.org.uk`. Paths are pre-percent-encoded. 633/635 maths paths are under `/downloads/docs/Past-Papers/cleared/`; one is under `/denied/` and one under `/pending/` (both Summer 2023 M1 modified versions) – treat non-`cleared` paths as unavailable.
- `changed` (dd/mm/yyyy) is the last-modified date – usable for change detection.
- Feed counts: 504 = 635 (316 Standard, 218 Modified, 101 Irish Medium; 483 papers, 152 MS); 507 = 90 (54/25/11); 584 = 945 (508/256/181; 701 papers, 244 MS).

### 3.2 PDF URL pattern

`https://ccea.org.uk/downloads/docs/Past-Papers/cleared/GCSE/<Subject folder>/<YEAR>-<Series>/<Type>/0/<Subject>-<code>-<Series><YEAR>-<Paper title>-<Paper|MS>.pdf`

| Element | Values seen |
|---|---|
| Subject folder | `GCSE%20Mathematics%20%282017%29`, `GCSE%20Further%20Mathematics%20%282017%29`, `GCSE%20Science%20Double%20Award%20%282017%29`; legacy `GCSE%20Mathematics%20%20%282010%29` (note double space), `GCSE%20Science%20Double%20Award%20%282011%29` |
| Series | `Summer`, `January`, `November`, `March` |
| Type | `Standard`, `Modified`, `Irish%20Medium` |
| File prefix | `GCSE-Mathematics%20-504-`, `GCSE-Further%20Mathematics-507-`, `GCSE-Science%20Double%20Award-584-` (legacy `-505-`, `-585-`) |
| Suffix | `-Paper.pdf` or `-MS.pdf`; some carry `_0.pdf` duplicates-suffix (e.g. January 2020 M3 paper) or a trailing space before `-Paper` (e.g. Summer 2024 M8 Paper 2 `...%29%20-Paper.pdf`) |

Verified downloads (HTTP 200, `application/pdf`, with a browser User-Agent):

| Document | URL | Size |
|---|---|---|
| Maths M4 Summer 2025 paper | https://ccea.org.uk/downloads/docs/Past-Papers/cleared/GCSE/GCSE%20Mathematics%20%282017%29/2025-Summer/Standard/0/GCSE-Mathematics%20-504-Summer2025-Higher%20Tier%2C%20M4%20%28With%20calculator%29-Paper.pdf | 690,679 B |
| Maths M4 Summer 2025 mark scheme | https://ccea.org.uk/downloads/docs/Past-Papers/cleared/GCSE/GCSE%20Mathematics%20%282017%29/2025-Summer/Standard/0/GCSE-Mathematics%20-504-Summer2025-Higher%20Tier%2C%20M4%20%28With%20calculator%29-MS.pdf | 238,551 B |
| Further Maths Unit 1 Summer 2025 paper | https://ccea.org.uk/downloads/docs/Past-Papers/cleared/GCSE/GCSE%20Further%20Mathematics%20%282017%29/2025-Summer/Standard/0/GCSE-Further%20Mathematics-507-Summer2025-Unit%201%2C%20%28With%20calculator%29%20Pure%20Mathematics-Paper.pdf | 574,823 B |
| Further Maths Unit 1 Summer 2025 MS (from feed) | https://ccea.org.uk/downloads/docs/Past-Papers/cleared/GCSE/GCSE%20Further%20Mathematics%20%282017%29/2025-Summer/Standard/0/GCSE-Further%20Mathematics-507-Summer2025-Unit%201%2C%20%28With%20calculator%29%20Pure%20Mathematics-MS.pdf | – |
| DAS Chemistry C2 Higher Summer 2025 paper | https://ccea.org.uk/downloads/docs/Past-Papers/cleared/GCSE/GCSE%20Science%20Double%20Award%20%282017%29/2025-Summer/Standard/0/GCSE-Science%20Double%20Award-584-Summer2025-Higher%20Tier%2C%20Unit%20C2%3A%20Chemistry-Paper.pdf | 1,025,265 B |
| DAS Chemistry C2 Higher Summer 2025 MS (from feed) | https://ccea.org.uk/downloads/docs/Past-Papers/cleared/GCSE/GCSE%20Science%20Double%20Award%20%282017%29/2025-Summer/Standard/0/GCSE-Science%20Double%20Award-584-Summer2025-Higher%20Tier%2C%20Unit%20C2%3A%20Chemistry-MS.pdf | – |

Other feed paths worth noting (all from the 504 feed):
- January 2019 M4 paper: `.../2019-January/Standard/0/GCSE-Mathematics%20-504-January2019-Higher%20Tier%2C%20M4%20%28With%20calculator%29-Paper.pdf`
- January 2020 M3 paper: `.../2020-January/Standard/0/GCSE-Mathematics%20-504-January2020-Higher%20Tier%2C%20Unit%20M3%20%28With%20calculator%29-Paper_0.pdf`
- Modified example: `.../2025-November/Modified/0/GCSE-Mathematics%20-504-November2025-Foundation%20Tier%2C%20M6%20Paper%202%20%28With%20calculator%29%20%28MV24%29-Paper.pdf`
- Irish-medium example: `.../2025-November/Irish%20Medium/0/GCSE-Mathematics%20-504-November2025-Foundation%20Tier%2C%20M6%20Paper%202%20%28With%20calculator%29-Paper.pdf`
- Legacy T-spec example (505): `https://ccea.org.uk/downloads/docs/Past-Papers/cleared/GCSE/GCSE%20Mathematics%20%20%282010%29/2019-January/Standard/0/GCSE-Mathematics%20-505-January2019-Higher%20Tier%2C%20Unit%20T4%20%28With%20calculator%29-Paper.pdf`

**Important**: a hand-built URL `...Summer2025-Higher%20Tier%2C%20M4%3A%20%28With%20calculator%29-Paper.pdf` (with a colon after M4) returned 404 – titles vary series to series ("M4 (With calculator)", "M4: (With calculator)", "Unit M4 (With calculator)", "M4 (Calculator Paper)"). Always take the path from the feed.

### 3.3 Access notes

- `ccea.org.uk` HTML pages return **HTTP 403 to generic fetchers** (WebFetch) but **200 to curl with a browser User-Agent**; PDFs and the JSON feeds download without issue.
- Site search (`/search?keys=`) and `/learning-resources` returned 403 even with a UA.

---

## 4. Series coverage

### 4.1 GCSE Mathematics (504) – Standard-type question papers / mark schemes per series

| Series | Papers | Mark schemes | Units covered |
|---|---|---|---|
| Summer 2018 | 4 | 4 | M1, M2, M3, M4 (first assessment of gateway units) |
| January 2019 | 4 | 4 | M1, M2, M3, M4 |
| Summer 2019 | 12 | 12 | M1–M4, M5/M6/M7/M8 Papers 1 & 2 |
| January 2020 | 12 | 12 | all (titles use "Unit Mx" wording) |
| Summer 2021 | 12 | 12 | all |
| November 2021 | 12 | 12 | all (note typo "MI" for M1 in titles) |
| Summer 2022 | 12 | 12 | all |
| November 2022 | 12 | 12 | all |
| Summer 2023 | 12 | 12 | all |
| November 2023 | 12 | 12 | all |
| Summer 2024 | 12 | 12 | all |
| November 2024 | 12 | 12 | all |
| Summer 2025 | 12 | 12 | all |
| November 2025 | 12 | 12 | all (MS `changed` 25/03/2026) |
| Summer 2026 | 12 | 0 | all papers posted 28/08/2026; mark schemes not yet published |

No Summer 2020 or January 2021 series (pandemic). January series ran only in 2019 and 2020; from 2021 CCEA runs a November series covering all eight units (also confirmed by the circular "November - March Examination Series" linked from the subject page, https://ccea.org.uk/downloads/docs/Circulars/S/2026/August/S-IF-35-26-August.pdf). Modified and Irish-medium versions exist for every series.

Paper codes (as used by third parties and on the papers): GMC11 (M1), GMC21 (M2), GMC31 (M3), GMC41 (M4), GMC51/GMC52 (M5 P1/P2), GMC61/GMC62, GMC71/GMC72, GMC81/GMC82. The Summer 2025 M4 paper front page reads "Mathematics Unit M4 (With calculator) Higher Tier [GMC41] … TIME 2 hours … total mark for this paper is 100 … twenty-two questions … The Formula Sheet is on page 2."

### 4.2 GCSE Mathematics legacy (505, 2010 spec, units T1–T6)

Feed 505 has 326 entries: January 2014 – January 2019 (January and Summer each year). The archived page filter offers years 2014–2019, series January only in the visible list, types Standard/Modified/Irish Medium. Legacy content is flagged: "The materials in this section relate to the legacy specification (no longer available for teaching) however, they may still be of use to teachers and students." A "Mapping T spec to M Spec" PDF exists (see §7.1).

### 4.3 GCSE Further Mathematics (507)

| Series | Papers | Mark schemes | Units |
|---|---|---|---|
| Summer 2018 | 1 | 1 | Unit 1 Pure only |
| Summer 2019 | 4 | 4 | Units 1–4 |
| Summer 2021 | 4 | 4 | Units 1–4 |
| Summer 2022 | 4 | 4 | Units 1–4 |
| Summer 2023 | 4 | 4 | Units 1–4 |
| Summer 2024 | 4 | 4 | Units 1–4 |
| Summer 2025 | 4 | 4 | Units 1–4 (MS `changed` 15/10/2025) |
| Summer 2026 | 4 | 0 | papers posted 28/08/2026 |

Units: Unit 1 Pure Mathematics (GFM11), Unit 2 Mechanics (GFM21), Unit 3 Statistics (GFM31), Unit 4 Discrete and Decision Mathematics (GFM41). Summer only; no 2020. Legacy archived page: Summer series 2006–2019, Standard only (Unit 1 Pure, Unit 2 Mechanics and Statistics).

### 4.4 GCSE Science Double Award (584)

| Series | Papers | MS | Content |
|---|---|---|---|
| March 2017 / Summer 2017 | 1 / 2 | 0 | stray early entries |
| March 2018, November 2018 | 6 | 6 | B1, C1, P1 × Foundation/Higher |
| Summer 2018 | 6 | 6 | B1, C1, P1 × F/H |
| March 2019, November 2019 | 6 / 5 | 6 | Unit 1s |
| Summer 2019 | 24 | 24 | B1, B2, C1, C2, P1, P2 × F/H + Unit 7 practical booklets A/B (Bio/Chem/Phys × F/H) |
| March 2020, November 2020 | 6 | 6 | Unit 1s (no Summer 2020) |
| Summer 2021 | 25 | 25 | full set |
| November 2021; March/Nov 2022; March/Nov 2023; March/Nov 2024; March/Nov 2025 | 6 each (March 2024: 7) | 6 | Unit 1s |
| Summer 2022 / 2023 / 2024 / 2025 | 22 / 24 / 25 / 24 | 21 / 24 / 24 / 24 | full set incl. Unit 7 booklets |
| March 2026 | 6 | 6 | Unit 1s |
| Summer 2026 | 18 | 0 | posted 28/08/2026 |

Paper codes seen in CCEA filenames/search titles: e.g. `[GDW12]` (Biology Unit B1 Higher), `GDW42` (Biology B2 Higher); Revision Science quotes GSD11/GSD12/GSD41/GSD42 for B1/B2 F/H. Legacy feed 585 (2011 spec): 449 entries, January 2014 – November 2018 (March/Summer/November series).

---

## 5. Copyright and terms of use (verbatim)

### 5.1 Notice on every current past-papers page (Maths, FM, DAS)

> "Please note that if a past paper or mark scheme does not appear in this section, it may not be available due to copyright reasons. We work to clear the copyright on as many papers and mark schemes as possible so that we can publish these on our website. If papers or mark schemes contain material copyrighted by third parties, we need the copyright owners' permission to use this material after the original examination. Without the necessary permissions, these documents may not be made available to centres."
>
> "Copyright Notice – The copyright in the content of this material is owned (or controlled under licence) by © CCEA. Anyone using copyrighted materials must respect the rights of the copyright holder. You are permitted to download and print content from the CCEA website for your own personal use or that of your school, college or other educational institution, for example as revision material. You are not permitted to distribute the content via electronic means (for example the internet or an intranet), store it in a retrieval system, or use content from the website for commercial exploitation in any circumstances."

Source: https://ccea.org.uk/key-stage-4/gcse/subjects/gcse-mathematics-2017/past-papers-mark-schemes (identical text on the FM and DAS pages).

### 5.2 Archived pages add the five-year rule

> "…Without the necessary permissions, these documents may not be made available to centres in whole or in part for revision purposes. Papers with expired copyright licences (older than five years) will also not be available for download or print; these are automatically removed from our website each year."
> "Copyright Notice – The copyright in the content of this material is owned (or controlled under licence) by © CCEA 2020. …" (same permissions/prohibitions as above)

Source: https://ccea.org.uk/key-stage-4/gcse/subjects/gcse-mathematics-2017/archived-past-papers-mark-schemes and the DAS/FM archived pages. (In practice the 505 legacy feed still lists 2014–2019 documents, so removal is not strictly enforced, but link rot must be expected.)

### 5.3 Website Terms of Use (https://ccea.org.uk/legal/terms-use)

> "Using our Services does not give you ownership of any intellectual property rights in our Services or the content you access. These terms do not grant you the right to use any branding or logos used in our Services."
> "The copyright in the content of this is owned by © Council for the Curriculum, Examinations and Assessment (CCEA) 2018. You are permitted to download and print content from the CCEA website for your own personal use or that of your school, college or other educational institution. You are not entitled to use content of the website for commercial exploitation in any circumstances."

### 5.4 Paper Builder terms (https://ccea.org.uk/learning-resources/paper-builder)

> "Can I put my practice papers online to share with other teachers? – All practice papers created in Paper Builder are copyright of CCEA. All rights reserved. The papers are authorised for personal or classroom use only and cannot be resold or redistributed online without prior permission from CCEA."
> "Can students access and use Paper Builder? – No, Paper Builder is currently only available to teachers and tutors delivering CCEA qualifications."

### 5.5 Inside the PDFs

Summer 2025 M4 paper (and the DAS C2 and FM Unit 1 papers) carry on the last page: "Permission to reproduce all copyright material has been applied for. In some cases, efforts to contact copyright holders may have been unsuccessful and CCEA will be happy to rectify any omissions of acknowledgement in future if notified." and "SOURCES: All images © CCEA unless stated." Mark schemes open with "General Marking Advice" (transcription-error and working-seen rules).

### 5.6 What this means in practice

| Action | Permitted by the notice? |
|---|---|
| Student/teacher downloads and prints a paper for revision | Yes ("personal use or that of your school…") |
| Our site **links** to the CCEA PDF (including `#page=N` deep links) | Not addressed by the copyright notice (linking is not copying); CCEA's Disclaimer only disclaims liability for outbound links. Low risk. |
| Our site **re-hosts** the PDF, embeds it in an iframe from our own storage, or stores questions in a database | No – "distribute the content via electronic means (for example the internet…)", "store it in a retrieval system" are expressly prohibited |
| Reproducing question text/images or mark-scheme text on our pages | No, without a licence (CCEA copyright) |
| Using Paper Builder output on a public site | No – "personal or classroom use only", needs "prior permission from CCEA" |
| Any commercial use of CCEA content | No – "commercial exploitation in any circumstances" |

There is no published licensing/permissions form on ccea.org.uk that we found; the general contact is info@ccea.org.uk (029 9026 1200); the GCSE Mathematics Subject Officer listed on the subject page is Lisa McFarland (lmcfarland@ccea.org.uk, 028 9590 6711) and Specification Support Officer Nuala Tierney (ntierney@ccea.org.uk, 028 9590 6689); Paper Builder queries go to paperbuilder@ccea.org.uk.

---

## 6. CCEA's own topic-by-topic tools

### 6.1 Topic Tracker

- Resource page: https://ccea.org.uk/learning-resources/topic-tracker – "Topic Tracker is a free resource for teachers designed to improve and introduce innovative support for GCE Maths & GCSE Maths & Science. This resource allows teachers to personally design new worksheets by giving free access past paper questions. … This resource is for teachers only."
- Tool: https://topictracker.ccea.org.uk/default.aspx – "free access to over 4000 of CCEA's GCE & GCSE past paper questions"; you "choose a topic and generate a selection of questions on that topic; generate a corresponding mark scheme … automatically; choose questions that do not allow the use of calculators …; generate the question paper total marks automatically; and attach a formula sheet". Registration: "Please email [protected address] to register for Topic Tracker and receive your username and password." The site is an old ASP.NET microsite (footer "Copyright 2010 CCEA"); its nav still points at the retired microsite `http://www.ccea.org.uk/microsites/mathematics/revised_gcse/index.asp`, which now 301→https and returns **404**.
- Coverage claimed on the CCEA resource tile: KS4/Post-16, English and Irish-medium, Science and Mathematics.

### 6.2 Paper Builder (launched March 2023)

- https://ccea.org.uk/learning-resources/paper-builder – "Paper Builder currently features GCSE and GCE Mathematics questions from 2015 to 2025. You can easily filter questions by unit, year or topic. Then select the questions you need, add them to your paper and export it as a PDF, along with a mark scheme. You can add a maximum of 50 questions to each paper you create." Topic example given: "Number and the topic Algebraic Expressions". Free; teachers/tutors only; C2k or CCEA account login; "In 2025/26, we aim to add GCSE Further Mathematics."
- Launch news (02/03/2023): https://ccea.org.uk/key-stage-4/gcse/subjects/gcse-mathematics-2017/news#23332 – "a bank of past paper questions and answers which reflect the current CCEA GCSE Mathematics specification".

### 6.3 BBC Bitesize (CCEA-endorsed)

The CCEA maths page states "BBC Bitesize has produced bespoke support materials for our GCSE Mathematics specification … cover both Foundation Tier and Higher Tier content." The Bitesize exam-spec page https://www.bbc.co.uk/bitesize/examspecs/zcq8b82 is organised per unit (M1: Number 7 guides, Algebra 7, Geometry and measures 9, Handling data 6; M2: 6/5/4/3; M3: 4/5/4/…; M4: Number & Algebra 4, Handling data 2, Geometry 2; M5; M6; M7; M8) and links:
- "GCSE Maths: CCEA past papers and mark schemes" https://www.bbc.co.uk/bitesize/topics/zc8v46f/articles/z78b6rd
- "GCSE maths: Exam-style quiz by topic" (quiz "based on GCSE Maths past papers") https://www.bbc.co.uk/bitesize/topics/zc8v46f/articles/zfsf9ty
- "GCSE Maths: exam-style questions" ("based on CCEA foundation and higher past papers") https://www.bbc.co.uk/bitesize/topics/zc8v46f/articles/z8n76rd
- "GCSE Maths: quick-fire questions" https://www.bbc.co.uk/bitesize/topics/zc8v46f/articles/zxgsb7h

---

## 7. Other CCEA-published support materials

### 7.1 GCSE Mathematics – Support page (https://ccea.org.uk/key-stage-4/gcse/subjects/gcse-mathematics-2017/support)

Sections: General · Specimen Assessment Materials · Teacher Guidance · Exemplification of Examination Performance · Data Handling Resources · Practice Papers · Sample Past Papers · Student Guidance.

| Resource | URL |
|---|---|
| Specimen Assessment Materials (2019, 3.92 MB; HEAD verified 200, 4,108,802 B) | https://ccea.org.uk/downloads/docs/Support/Specimen%20Assessment%20Materials/2019/Specimen%20Assessment%20Materials_23.pdf |
| Specimen Assessment Materials (Irish-Medium) | https://ccea.org.uk/downloads/docs/Support/Specimen%20Assessment%20Materials/2019/Specimen%20Assessment%20Materials%20%28Irish-Medium%29_1.pdf |
| Specimen Assessment Materials (Legacy T-spec) | https://ccea.org.uk/downloads/docs/Support/Specimen%20Assessment%20Materials/2019/Specimen%20Assessment%20Materials%20%28Legacy%29.pdf |
| Grade A Exemplifying Examination Performance 2019 | https://ccea.org.uk/downloads/docs/Support/Exemplification%20of%20Examination%20Performance/2020/GCSE%20Mathematics%20Grade%20A%20Exemplifying%20Examination%20Performance%202019.pdf |
| Grade C Exemplifying Examination Performance 2019 (Unit M2) | https://ccea.org.uk/downloads/docs/Support/Exemplification%20of%20Examination%20Performance/2020/GCSE%20Mathematics%20Grade%20C%20Exemplifying%20Examination%20Performance%202019.pdf |
| Practice Papers 2021/22 (zip, all units except M5, M7) | https://ccea.org.uk/downloads/docs/Support/Practice%20Papers/2022/GCSE%20Mathematics%20Practice%20Papers%20202122.zip |
| Unit M1 Practice Paper / MS | https://ccea.org.uk/downloads/docs/Support/Practice%20Papers/2021/Unit%20M1%20Practice%20Paper_0.pdf / https://ccea.org.uk/downloads/docs/Support/Practice%20Papers/2022/Unit%20M1%20Practice%20Paper%20%28Mark%20Scheme%29.pdf |
| Unit M2 Practice Paper / MS | https://ccea.org.uk/downloads/docs/Support/Practice%20Papers/2021/Unit%20M2%20Practice%20Paper_0.pdf / https://ccea.org.uk/downloads/docs/Support/Practice%20Papers/2022/Unit%20M2%20Practice%20Paper%20%28Mark%20Scheme%29.pdf |
| Unit M3 Practice Paper / MS | https://ccea.org.uk/downloads/docs/Support/Practice%20Papers/2021/Unit%20M3%20Practice%20Paper_0.pdf / https://ccea.org.uk/downloads/docs/Support/Practice%20Papers/2022/Unit%20M3%20Practice%20Paper%20%28Mark%20Scheme%29.pdf |
| Unit M4 Practice Paper / MS | https://ccea.org.uk/downloads/docs/Support/Practice%20Papers/2021/Unit%20M4%20Practice%20Paper_0.pdf / https://ccea.org.uk/downloads/docs/Support/Practice%20Papers/2022/Unit%20M4%20Practice%20Paper%20%28Mark%20Scheme%29.pdf |
| Unit M6 Practice Paper 1 / MS | https://ccea.org.uk/downloads/docs/Support/Practice%20Papers/2021/Unit%20M6%20Practice%20Paper%20%28Paper%201%29_0.pdf / https://ccea.org.uk/downloads/docs/Support/Practice%20Papers/2022/Unit%20M6%20Practice%20Paper%20%28Paper%201%29%20%28Mark%20Scheme%29.pdf |
| Unit M6 Practice Paper 2 / MS | https://ccea.org.uk/downloads/docs/Support/Practice%20Papers/2021/Unit%20M6%20Practice%20Paper%20%28Paper%202%29.pdf / https://ccea.org.uk/downloads/docs/Support/Practice%20Papers/2022/Unit%20M6%20Practice%20Paper%20%28Paper%202%29%20%28Mark%20Scheme%29.pdf |
| Unit M8 Practice Paper 1 / MS | https://ccea.org.uk/downloads/docs/Support/Practice%20Papers/2021/Unit%20M8%20Practice%20Paper%20%28Paper%201%29.pdf / https://ccea.org.uk/downloads/docs/Support/Practice%20Papers/2022/Unit%20M8%20Practice%20Paper%20%28Paper%201%29%20%28Mark%20Scheme%29.pdf |
| Unit M8 Practice Paper 2 / MS | https://ccea.org.uk/downloads/docs/Support/Practice%20Papers/2021/Unit%20M8%20Practice%20Paper%20%28Paper%202%29.pdf / https://ccea.org.uk/downloads/docs/Support/Practice%20Papers/2022/Unit%20M8%20Practice%20Paper%20%28Paper%202%29%20%28Mark%20Scheme%29.pdf |
| Summer 2021 Alternative Arrangements Support Papers 1 / 2 / 4 (+ Solutions for 1 and 2) | https://ccea.org.uk/downloads/docs/Support/Sample%20Past%20Papers/2021/Summer%202021%20Alternative%20Arrangements%3A%20GCSE%20Additional%20Support%20Mathematics%3A%20Support%20Papers%201.pdf (and `...Papers%202.pdf`, `...Papers%204.pdf`, `...Papers%201%20Solutions.pdf`, `...Papers%202%20Solutions.pdf`) |
| Teacher Guidance (2019) | https://ccea.org.uk/downloads/docs/Support/Teacher%20Guidance/2019/Teacher%20Guidance.pdf |
| Guidance on Grading, Aggregation, Resit and Terminal Rules | https://ccea.org.uk/downloads/docs/Support/Teacher%20Guidance/2020/Guidance%20for%20teachers%20on%20Grading%2C%20Aggregation%2C%20Resit%20and%20Terminal%20Rules.pdf |
| Planning Framework Templates M1–M4 / M5–M8 (docx) | https://ccea.org.uk/downloads/docs/Support/General/2021/Planning%20Framework%20Templates%20for%20M1%2C%20M2%2C%20M3%2C%20M4%20Units.docx / https://ccea.org.uk/downloads/docs/Support/General/2021/Planning%20Framework%20Templates%20for%20M5%2C%20M6%2C%20M7%2C%20M8%20Units.docx |
| Progression of Subject Content | https://ccea.org.uk/downloads/docs/Support/General/2019/Progression%20of%20Subject%20Content.pdf |
| Mapping T spec to M Spec | https://ccea.org.uk/downloads/docs/Support/General/2019/Mapping%20T%20spec%20to%20M%20Spec.pdf |
| Snapshot | https://ccea.org.uk/downloads/docs/Support/General/2019/Snapshot_11.pdf |
| Summer 2021 Breakdown of Assessment Objectives | https://ccea.org.uk/downloads/docs/Support/General/2021/Summer%202021%20Assessment%20Resource%3A%20GCSE%20Mathematics%20Breakdown%20of%20Assessment%20Objectives.pdf |
| Problem solving (ppt, 16 MB) | https://ccea.org.uk/downloads/docs/Support/General/2021/CCEA%20GCSE%20Mathematics%20-%20Problem%20solving.ppt |
| Data handling pptx (Frequency Trees, Listing Strategies, Venn Diagrams, "What happens if…?") | https://ccea.org.uk/downloads/docs/Support/Data%20Handling%20Resources/2019/Frequency%20Trees.pptx (etc.) |
| Support webinar Oct 2022 | https://ccea.org.uk/key-stage-4/gcse/subjects/gcse-mathematics-2017/webinars |

CCEA's caveat on the practice papers: "All practice papers below have not been proofed to the highest standards and rigours that live papers would normally go through."

Chief Examiner's reports (https://ccea.org.uk/key-stage-4/gcse/subjects/gcse-mathematics-2017/reports): Summer 2018, January 2019, Summer 2019, January 2020, November 2021, Summer/November 2022, 2023, 2024, 2025 – e.g. https://ccea.org.uk/downloads/docs/ExamMod-Reports/GCSE/GCSE%20Mathematics%20%282017%29/2025/GCSE%20Mathematics%20%282017%29-Summer2025-Report_0.pdf and https://ccea.org.uk/downloads/docs/ExamMod-Reports/GCSE/GCSE%20Mathematics%20%20%282017%29/2019/GCSE%20Mathematics%20%20%282017%29-January2019-Report.pdf.

**Not found for GCSE Mathematics on ccea.org.uk**: fact files, revision checklists, topic trackers as PDFs, student revision guides, or any "Get Ready for GCSE" resource (the KS4 learning-resources listing https://ccea.org.uk/key-stage-4/learning-resources contains no such item; site search was blocked, so absence is "not found", not proof). The only "microsite" is the retired `ccea.org.uk/microsites/mathematics/revised_gcse` (404). The Resources tab lists just Paper Builder, Topic Tracker, parents' guides and certificates.

### 7.2 GCSE Further Mathematics – Support page

| Resource | URL |
|---|---|
| Fact File Unit 1 / 2 / 3 / 4 (2019) | https://ccea.org.uk/downloads/docs/Support/Factfile/2019/GCSE%20Further%20Maths%20Unit%201.pdf, `...Unit%202.pdf`, `...Unit%203.pdf`, `...Unit%204.pdf` |
| Question and Answer Booklet – Unit 1 Pure (2023) | https://ccea.org.uk/downloads/docs/Support/Question%20and%20Answer%20Booklets/2023/GCSE%20Further%20Mathematics%20%282017%29%3A%20Unit%201%3A%20Pure%20Mathematics%20-%20Question%20and%20Answer%20Booklet.pdf |
| Q&A Booklet – Unit 2 Mechanics (2023) | https://ccea.org.uk/downloads/docs/Support/Question%20and%20Answer%20Booklets/2023/GCSE%20Further%20Mathematics%20%282017%29%3A%20Unit%202%3A%20Mechanics%20-%20Question%20and%20Answer%20Booklet.pdf |
| Q&A Booklet – Unit 3 Statistics (2025) | https://ccea.org.uk/downloads/docs/Support/Question%20and%20Answer%20Booklets/2025/GCSE%20Further%20Mathematics%20%282017%29%3A%20Unit%203%3A%20Statistics%20-%20Question%20and%20Answer%20Booklet.pdf |
| Specimen Assessment Materials | https://ccea.org.uk/downloads/docs/Support/Specimen%20Assessment%20Materials/2019/Specimen%20Assessment%20Materials_18.pdf |
| Exemplifying Examination Performance 2019 | https://ccea.org.uk/downloads/docs/Support/Exemplification%20of%20Examination%20Performance/2020/GCSE%20Further%20Mathematics%20Exemplifying%20Examination%20Performance%202019.pdf |
| Student Guide | https://ccea.org.uk/downloads/docs/Support/Student%20Guidance/2019/Student%20Guide_7.pdf |
| Mathematical Formulae and Tables; Planning Framework; Snapshot; topic pptx (U1 completing the square, quadratic inequalities; U4 counting, logic, linear programming) | listed on the support page |
| Chief Examiner's reports 2018, 2019, 2022–2025 | https://ccea.org.uk/key-stage-4/gcse/subjects/gcse-further-mathematics-2017/reports (e.g. https://ccea.org.uk/downloads/docs/ExamMod-Reports/GCSE/GCSE%20Further%20Mathematics%20%282017%29/2025/GCSE%20Further%20Mathematics%20%282017%29-Summer2025-Report_0.pdf) |

CCEA's description of the Q&A booklets: "The questions are spread across every topic for each of the above three units and are in the familiar style of the examination papers. Answers are provided for every question. … the questions have not gone through CCEA's normal quality assurance process for question paper production." These are the closest thing CCEA publishes to an official topic-by-topic bank (Units 1–3 only; no Unit 4 booklet).

### 7.3 GCSE Science Double Award – Support page

23 fact files (2019/2022), all under `https://ccea.org.uk/downloads/docs/Support/Fact%20File%3A%20<Science>/2019/...` or `.../Fact%20Files%3A%20Chemistry/2022/...`:
- Biology: U1.2 Photosynthesis and plants; Unit 1.3 Food tests; U1.5 Breathing and the Respiratory System (e.g. https://ccea.org.uk/downloads/docs/Support/Fact%20File%3A%20Biology/2019/GCSE%20DA%20Biology%20U1.2%20Photosynthesis%20and%20plants.pdf)
- Physics: U1.2 Forces (https://ccea.org.uk/downloads/docs/Support/Fact%20File%3A%20Physics/2019/GCSE%20DA%20Physics%20U1.2%20Forces.pdf)
- Chemistry: U1.1 Atomic Structures, U1.2 Bonding, U1.3 Structures, U1.4 Nanoparticles, U1.5 Symbols/Formulae/Equations, U1.6 Periodic Table, U1.7 Quantitative Chemistry, U1.8 Acids Bases Salts, U1.9 Chemical Analysis, U2.1 Metals/reactivity, U2.2 Redox/Rusting/Iron, U2.3 Rates, U2.4 Equilibrium, U2.5 Organic, U2.6 Quantitative, U2.7 Electrochemistry, U2.8 Energy Changes, U2.9 Gas Chemistry, plus "Answer Booklet Fact File Unit 1 and 2" (https://ccea.org.uk/downloads/docs/Support/Fact%20Files%3A%20Chemistry/2022/GCSE%20DA%20Chemistry%20Answer%20Booklet%20Fact%20File%20Unit%201%20and%202.pdf)

Other DAS support: Specimen Assessment Materials (https://ccea.org.uk/downloads/docs/Support/Specimen%20Assessment%20Materials/2019/Specimen%20Assessment%20Materials_44.pdf) and Irish-medium; Exemplification of Examination Performance 2019 for Biology/Chemistry/Physics Higher (e.g. https://ccea.org.uk/downloads/docs/Support/Exemplification%20of%20Examination%20Performance/2020/GCSE%20Double%20Award%20Science%20Chemistry%20Higher%20Tier%20Exemplifying%20Examination%20Performance%202019.pdf); Unit 7 Practical Manuals (B1–B6, C1–C6, P2, P3, P5, P6 individual PDFs plus per-science manuals, e.g. https://ccea.org.uk/downloads/docs/Support/eGuide/2026/GCSE%20Double%20Award%20Science%20Biology%3A%20Practical%20Manual.pdf); Glossaries of Terms (Biology/Chemistry/Physics, e.g. https://ccea.org.uk/downloads/docs/Support/Useful%20Links/2019/DAS%20Chemistry%20Glossary%20of%20Terms.pdf); Student Guide (https://ccea.org.uk/downloads/docs/Support/Student%20Guidance/2019/Student%20Guide_12.pdf); Practical Skills Instructions to Teachers Summer 2026; Chromatography lesson booklet. Chief Examiner's reports Summer 2022 → March 2026 at https://ccea.org.uk/key-stage-4/gcse/subjects/gcse-science-double-award-2017/reports.

---

## 8. Third-party hosts and topic banks

| Site | URL | What it has for CCEA | Hosting model | Topic-by-topic? |
|---|---|---|---|---|
| **Save My Exams** | https://www.savemyexams.com/gcse/maths/ccea/past-papers/ ; https://www.savemyexams.com/gcse/further-maths/ccea/past-papers/ ; https://www.savemyexams.com/gcse/science/ccea/double-award-science/past-papers/ | Maths: June 2018, Jan 2019, June 2019, Jan 2020, June 2021, Nov 2021, June 2022, Nov 2022, June 2023, Nov 2023, June 2024, Nov 2024, June 2025, Nov 2025. DAS: June 2018/2019/2021–2025, Nov 2022/2023, March 2023 | **Deep-links to CCEA's PDFs** through a viewer: `/gcse/maths/ccea/past-papers/paper/ppr_…/?pdf=https%3A%2F%2Fccea.org.uk%2Fdownloads%2F…` | No – CCEA entries in the nav have only "Past Papers"; no Exam Questions/Revision Notes for CCEA |
| **Maths Genie** | https://mathsgenie.co.uk/gcse/maths/ccea/papers ; https://mathsgenie.co.uk/gcse/further-maths/ccea/papers | GCSE: June 2018 → (per-paper pages e.g. `/gcse/maths/ccea/papers/gcse-ccea-maths-2018-june-unit-m1-calculator-gmc11-b15b65949e` and `?view=markscheme`), incl. Jan 2019/2020; FM: June 2018, 2019, 2021–2025 | Served in Maths Genie's own viewer; page prompts login (`/auth/login?redirectTo=/gcse/maths/ccea/papers`); also `/gcse/maths/ccea/lessons`, `/mock-exam-builder`, `/paper-marker` | Its "GCSE question bank" link goes to `/gcse/maths/edexcel/questions`; no CCEA-specific topic bank confirmed |
| **Physics & Maths Tutor** | https://www.physicsandmathstutor.com/past-papers/gcse-maths/ | **None** – boards listed are AQA, CAIE, Edexcel, OCR, Eduqas, WJEC | – | No |
| **Revision Maths** | https://revisionmaths.com/gcse-maths/gcse-maths-past-papers/ccea-gcse-maths-past-papers | June 2025, 2024, 2023, 2022, Nov 2021, June 2019 (M1–M8, GMC codes) | **Re-hosts copies** (`/sites/default/files/revisionmaths/archives/CCEA2025HigherPapers.zip`, `/sites/mathsrevision.net/files/imce/GCSE-Mathematics -504-November2021-…-Paper.pdf`) | No |
| **Revision Science** (same network) | https://revisionscience.com/gcse-revision/science/science-gcse-past-papers/ccea-gcse-science-past-papers | DAS June 2018, 2022–2025 | Re-hosts (zip/PDF on its own domain) | No |
| **PapersDaddy** | https://www.papersdaddy.com/ccea/gcse/mathematics/2025-summer | Summer 2025 (12 QP + 12 MS), Nov 2025, legacy 2009–2011 | Re-hosts (`/ccea/gcse/mathematics/2025-summer/GCSE-Mathematics -504-Summer2025-…-Paper.pdf`) | No |
| **Teachers To Your Home** | https://www.teacherstoyourhome.com/uk/past-papers/gcse/maths/ccea | Nov 2025 etc., per-paper pages `/uk/exam-library/maths/gcse/ccea/question-paper-higher-unit-m4-calculator/nov-2025` | Own exam library | No |
| **Revision Genie** | https://www.revisiongenie.com/subject/gcse/mathematics/ccea/past-papers | "Past papers for Mathematics will be added soon" | – | Claims a question bank/mock builder; nothing CCEA-specific live |
| **GCSE Guide** | https://gcseguide.co.uk/papers/ccea/mathematics/ (search-result URL) | Search snippet: "CCEA GCSE 9-1 Maths Past Papers & Mark Schemes … free" | **Unreachable today** – DNS `ENOTFOUND gcseguide.co.uk` from both WebFetch and curl | Unknown |
| **NI Maths Tutor** | https://www.nimathstutor.co.uk/index.php/past-papers ; https://nimathstutor.co.uk/index.php/past-papers/gcse-past-papers-solutions | Free YouTube **full video solutions**: M4 & M8 May 2026, Nov 2025, May 2025, Nov 2024, May/June 2024, Nov 2023, June 2023, Nov 2022, June 2022; M3 May 2024/June 2023; M7 June 2023/2022 (e.g. https://www.youtube.com/watch?v=Fx6KtsT0Or8 M4 May 2025). FM solutions page also exists. Paid M4/M8 revision courses. | Links to YouTube | Not by topic (by paper) |
| **Corbettmaths** | https://corbettmaths.com/2022/09/21/ccea-revision/ (hub) | Per-unit pages M1–M8, checklists, booklets, practice papers (see §9) | Own original content | Yes (checklists by topic → Corbettmaths videos/exercises) |
| **FSL GCSE Maths** (school Google Site, c2ken.net) | https://sites.google.com/c2ken.net/fsl-gcse-maths/home/m4-module/m4-topic-resources ; https://sites.google.com/c2ken.net/fsl-gcse-maths/home/m78-module/m78-topic-resources | Maps M4 (16 topics) and M7/8 (22 topics) to "CCEA Higher textbook" chapters and Corbettmaths video/practice/textbook exercises | Links + Google Drive notes | Yes (by CCEA topic, but links to generic Corbettmaths material, not CCEA questions) |
| **On Target Resources** | https://ontargetresources.co.uk/ccea-gcse-maths-exams-explained/ | Explains M1–M8 structure; sells M1–M8 practice papers ("very few actual past papers for students to practice with") | Commercial | No |
| **TES** | e.g. https://www.tes.com/teaching-resource/gcse-maths-revision-booklets-ccea-m2-and-m6-papers-11938283 ; https://www.tes.com/en-au/teaching-resource/ccea-gcse-double-award-science-physics-p2-workbook-12801276 | Teacher-made revision booklets/workbooks | Downloads (teacher IP; may contain CCEA questions) | Partly |
| **YouTube playlists** (search results) | https://www.youtube.com/playlist?list=PLAH_P1qnv6Tic2Cp9fVwKqciohtNvkRCU ("CCEA GCSE Maths Past Papers"); https://www.youtube.com/playlist?list=PL4Lq_36vZOItjBiUKlftTV3lVtwnjNh59 ("CCEA GCSE Maths past papers solutions") | Walkthroughs by paper | – | No |
| **Publishers** | CGP "CCEA GCSE Maths Revision Guide: Foundation (M1, M2, M5, M6)" https://www.cgpbooks.co.uk/secondary-books/gcse/maths/mccfr41-ccea-gcse-maths-revision-guide and Higher https://www.cgpbooks.co.uk/secondary-books/gcse/maths/mcchr41-ccea-gcse-maths-revision-guide ; Hodder "My Revision Notes: CCEA GCSE Science Double Award" https://www.hachettelearning.com/science/my-revision-notes-ccea-gcse-science-double-award ; Hachette CCEA hub https://www.hachettelearning.com/ccea | Commercial revision guides with topic planners | Print/ebook | Yes (their own questions) |
| **applaa.com** (blog) | https://applaa.com/blog/ccea-gcse-past-papers-where-to-find-them | Explains CCEA clearance and 5-year removal; no official quotes | – | No |

Conclusion: **no third party publishes a CCEA past-paper question bank sorted by topic** for GCSE Maths, Further Maths or Double Award Science. The only topic-sorted CCEA question tools are CCEA's own teacher-only Topic Tracker and Paper Builder, and BBC Bitesize's quizzes "based on" CCEA past papers.

---

## 9. Corbettmaths – CCEA-specific resources and mapping

### 9.1 CCEA pages (all original Corbettmaths content, "based on the topics on the GCSE Maths specifications created by the exam boards")

| Resource | URL |
|---|---|
| Hub | https://corbettmaths.com/2022/09/21/ccea-revision/ |
| Unit pages | https://corbettmaths.com/2022/09/21/ccea-m1-revision/ … `ccea-m8-revision/` (M1–M8) |
| Revision checklists index (+ YouTube playlists per unit) | https://corbettmaths.com/2019/03/19/ccea-revision-checklists/ ; https://corbettmaths.com/2019/04/03/ccea-gcse-summer-2019/ |
| Checklist PDFs | M1 https://corbettmaths.com/wp-content/uploads/2021/11/CCEA-Checklist-M1.pdf · M2 https://corbettmaths.com/wp-content/uploads/2021/11/CCEA-Checklist-M2.pdf · M3 https://corbettmaths.com/wp-content/uploads/2021/11/CCEA-Checklist-M3.pdf · M4 https://corbettmaths.com/wp-content/uploads/2021/11/CCEA-Checklist-M4-.pdf · M5 https://corbettmaths.com/wp-content/uploads/2019/04/CCEA-M5-Checklist.pdf · M6 https://corbettmaths.com/wp-content/uploads/2019/04/CCEA-M6-Checklist.pdf · M7 https://corbettmaths.com/wp-content/uploads/2019/04/CCEA-M7-Checklist.pdf · M8 https://corbettmaths.com/wp-content/uploads/2019/04/CCEA-M8-Checklist.pdf (M8 page also links https://corbettmaths.com/wp-content/uploads/2022/04/CCEA-Checklist-M8.pdf) |
| "Ultimate" question booklets + answers | M1 https://corbettmaths.com/wp-content/uploads/2022/09/M1-Booklet-Corbettmaths.pdf / https://corbettmaths.com/wp-content/uploads/2022/09/M1-Answers.pdf · M2 `.../2022/09/M2-Booklet-Corbettmaths.pdf` / `M2-Booklet-Answers.pdf` · M3 `M3-Booklet-Corbettmaths.pdf` / `M3-Booklet-Answers.pdf` · M4 https://corbettmaths.com/wp-content/uploads/2022/09/M4-Booklet-Corbettmaths.pdf / https://corbettmaths.com/wp-content/uploads/2022/12/M4-Booklet-Answers.pdf · M5 `M5-Booklet-Corbettmaths.pdf` / `M5-Booklet-Answers.pdf` · M6 `M6-Booklet-Corbettmaths.pdf` / `M6-Booklet-Answers.pdf` · M7 `M7-Booklet-Corbettmaths.pdf` / `M7-Booklet-Answers.pdf` · M8 https://corbettmaths.com/wp-content/uploads/2022/09/M8-Booklet-1.pdf / https://corbettmaths.com/wp-content/uploads/2022/09/M8-Booklet-Answers.pdf |
| "A Bit of Everything" papers + answers | M1 https://corbettmaths.com/wp-content/uploads/2021/11/A-Bit-of-Everything-CCEA-M1.pdf · M2 `.../2021/11/A-Bit-of-Everything-CCEA-M2.pdf` · M3 https://corbettmaths.com/wp-content/uploads/2022/05/A-Bit-of-Everything-CCEA-M3.pdf · M4 https://corbettmaths.com/wp-content/uploads/2021/11/A-Bit-of-Everything-CCEA-M4.pdf · M5 `.../2022/04/A-Bit-of-Everything-CCEA-M5-1.pdf` · M6 `.../2022/04/A-Bit-of-Everything-CCEA-M6.pdf` · M7 `.../2022/04/A-Bit-of-Everything-CCEA-M7.pdf` · M8 https://corbettmaths.com/wp-content/uploads/2022/04/A-Bit-of-Everything-CCEA-M8.pdf |
| Practice papers Set A (M1–M8) and Set B (M1–M4) with solutions | https://corbettmaths.com/2021/11/18/ccea-practice-papers/ (e.g. https://corbettmaths.com/wp-content/uploads/2021/11/CCEA-Set-A-M4.pdf, https://corbettmaths.com/wp-content/uploads/2022/04/CCEA-Set-A-M8-Paper-1.pdf) |
| Contents index (videos / practice questions / textbook exercises) | https://corbettmaths.com/contents/ (388 rows with a Textbook Exercise link, ~430 topics) |
| Terms and Conditions | https://corbettmaths.com/2018/05/17/terms-and-conditions/ |

Corbettmaths terms (verbatim extracts): "The resources are free (and will always be free) to use for individual use or for use by teachers for their classes." "I encourage colleagues to 'link' to my resources on their school websites, VLEs or personal website rather that uploading copies of my files." "Under no circumstances can any Corbettmaths resource be used by anyone for profit making purposes." "Under no circumstances can any Corbettmaths resource (including individual questions) be used within other resources that are redistributed." → For our platform: **link only, attribute, never bundle**; if the platform is commercial, do not rely on Corbettmaths material at all beyond outbound links.

### 9.2 Checklist topics per unit (from the Corbettmaths CCEA checklists)

- **M1 (Foundation)**: number (four operations, negatives, ordering, BIDMAS, squares/cubes/roots, factors/multiples/primes, place value, decimals, rounding, fractions, percentages, FDP, simple interest, best buys), shape (2D/3D, nets, triangles, symmetry, angle facts, parallel lines, views/elevations, units, estimates, time, perimeter/area, circles, cuboid volume, surface area, speed, distance charts), data (questionnaires, tables, Venn, two-way tables, averages, tally, pictograms, bar/line/pie/stem-leaf/scatter, frequency trees, flow charts), algebra (notation, expressions, like terms, expanding, factorising, substitution, equations, function machines, coordinates, linear graphs, real-life graphs).
- **M2 (Foundation)**: indices, laws of indices, primes/LCM/HCF, decimals, sf rounding, recurring decimals, fraction arithmetic, percentage change, compound interest, finance; Venn (3 sets), combined/estimated mean, modal class, median class, scatter; density, semicircles, parallelogram/trapezium/compound area, prism/cylinder volume, Pythagoras; expanding, factorising, forming equations, letters both sides, midpoint, length, gradient, real-life graphs.
- **M3 (Higher)**: identities, expanding double brackets, factorising quadratics, solving quadratics, difference of two squares, algebraic fractions, harder equations, forming quadratics, equation of a line, parallel lines; circle parts, pressure, arc length, sector area, surface area (cylinder/cone/sphere), volume (cone/sphere), trigonometry; product of primes, LCM/HCF, reverse percentages, bounds; quartiles/IQR, cumulative frequency, box plots.
- **M4 (Higher)**: harder factorising, algebraic fractions, harder equations, quadratic equations/formula, perpendicular lines; circle theorems, volume of cone/pyramid/frustum, cone surface area; stratified sampling, histograms, applying bounds.
- **M5 (Foundation)**: four operations, estimation, ratio, unitary method, best buys, conversion graphs, exchange rates, triangular numbers; scales, imperial units, polygon angles, reflections/rotations/translations/enlargements, drawing triangles; probability scale, basic probability, not happening, listing outcomes, expectation; sequences, patterns, real-life graphs.
- **M6 (Foundation)**: polygon angles, transformations, constructions, loci, congruence; laws of indices, trial & improvement, inequalities, changing the subject, quadratic graphs, graphical solutions; listing outcomes, sample spaces, relative frequency; binary.
- **M7 (Higher)**: laws of indices, simultaneous equations, changing the subject (adv.), graphical inequalities, reciprocal/cubic/quadratic graphs; transformations, similar shapes; product rule for counting, independent events, tree diagrams; negative indices, standard form, direct proportion.
- **M8 (Higher)**: irrational numbers, recurring decimals, negative/fractional indices, growth & decay, surds, rationalising, inverse proportion; negative scale factors, sine/cosine rule, area of any triangle, 3D trig, 3D Pythagoras, similar volumes; conditional probability; non-linear simultaneous equations, exponential graphs, graphical solutions, rates of change, equation of a circle, equation of a tangent.

The FSL school site adds "CCEA Higher textbook" chapter numbers for M4 (e.g. ch.16 Brackets, ch.17 Linear Equations, ch.33 Pythagoras and Trigonometry, ch.44/45 Averages/Cumulative Frequency, ch.19 Factorisation, ch.1/9 Number/Percentages, ch.25 Coordinate Geometry …) and for M7/8 (ch.41 Transformations, ch.22 Trial and Improvement, ch.20 Formulae, ch.15 Indices/Standard Form, ch.12 Rational and Irrational Numbers, ch.26 Non Linear Graphs, ch.27 Real Life Graphs, ch.38 Constructions and Loci, ch.47 Probability, ch.21 Proportion and Variation, ch.13 Surds …) – a useful cross-check for our topic taxonomy.

### 9.3 Full unit → Corbettmaths textbook-exercise / practice-question mapping

Generated automatically from the checklists' video numbers and the Corbettmaths contents index (see Appendix A at the end of this document; 8 tables, one per unit, with direct PDF/page URLs for each video number). Video numbers that have no Textbook-Exercise row in the contents index (practice-questions only, renamed, or not on the index) and therefore show "—" in Appendix A: 199/200 (multiplication), 277, 236a, 354, 347, 349, 268, 380, 364, 171a, 223a, 96a, 394, 380a, 395, 396, 399, 266, 57a, 283, 400, 248a, 401, 346, 344, 267d, 293, 345, 372. These can be looked up manually on https://corbettmaths.com/contents/ (e.g. Solving Quadratics 266 → "Quadratics: solving (factorising)" page).

---

## 10. Legacy naming and other gotchas for an indexer

- Titles are inconsistent across series ("M1 (With calculator)", "M1: (With calculator)", "Unit M1 (With calculator)", "M1 (Calculator Paper)", "M5.1"/"M5.2" for 2019/2020 mark schemes, "MI" typo in Nov 2021). Normalise with a regex on `field_title_paper_ms` (`\bM([1-8])\b` and `Paper ([12])`/`\.([12])`).
- Some MS entries are titled slightly differently from their papers (e.g. Summer 2019 "M6.1 (Non-Calculator Paper)" MS vs "M6: Paper 1 (Non-Calculator)" paper) – pair by unit + paper number + series, not by string equality.
- DAS titles for Unit 7 vary wildly ("Practical Skills (Booklet A)", "Practical Skill (Booklet A)", "Practical Skilsl (Booklet A)").
- Three DAS entries point to `/sites/default/files/filefield_paths/...` rather than `/downloads/docs/...` (older uploads).
- `changed` dates show when a document was (re)published: Summer 2026 papers 28/08/2026; November 2025 maths MS 25/03/2026; Summer 2025 FM MS 15/10/2025 – so mark schemes appear roughly 2–5 months after the results date.

---

## 11. Proposed legal way to build a topic-by-topic CCEA practice bank

**Principle**: CCEA owns the questions and mark schemes; the *facts about* them (which paper, which question number, which page, which topic, how many marks, calculator or not) are not copyright-protected, and our own explanations, solutions and original questions are ours. Build on the metadata + our own IP, and link to CCEA for the protected text.

1. **Metadata index, not a copy.** Ingest the three JSON feeds nightly (`504.json`, `507.json`, `584.json`; optionally 505/585 legacy). Store paper id, series, unit, tier, type, paper/MS URL, `changed` date. Never store the PDF or its text in a user-facing retrieval system (the notice forbids storing in "a retrieval system" and distribution "via electronic means"). If we need internal text extraction for tagging, do it in a private pipeline and keep only the derived metadata.
2. **Question-level tagging** (done by our team from the official PDFs, which teachers/students may legitimately download): for every question record `paper_id, question_no, part, pdf_page, marks, calculator, topic_ids[] (our taxonomy aligned to the spec's Number/Algebra/Geometry & measures/Handling data + Corbettmaths/BBC unit topics), difficulty, AO, year`. This is purely factual; no question text is stored.
3. **Deep links** to the official PDF with a page fragment, e.g. `…M4%20%28With%20calculator%29-Paper.pdf#page=7`, and to the MS page. Open in a new tab with attribution "Question paper © CCEA – opens on ccea.org.uk". Do not iframe/embed CCEA PDFs (that is electronic distribution from our site). Monitor link health (5-year removals, `_0` renames) and fall back to "paper withdrawn by CCEA" states.
4. **Our own worked solutions** per question (text, LaTeX, short video), written independently in our words. Do not reproduce the mark-scheme text; we may state our own "how marks are typically awarded" guidance derived from the Chief Examiner's reports in our own words. Cite the report URL.
5. **Original CCEA-style questions** per topic (style, layout, mark allocation and command words are not protected; question wording/numbers/diagrams are ours), each with our own mark scheme, calculator flag and tier. Model the format on the Specimen Assessment Materials and the Corbettmaths CCEA booklets, but write everything from scratch. Quality-assure with NI teachers; label them clearly as "original practice questions in CCEA style – not CCEA past-paper questions".
6. **Use official topic tools where appropriate.** Point teachers to Paper Builder and Topic Tracker (free, official, topic-filterable, with mark schemes). Papers a teacher generates there are for their classroom only – our platform must not host or share them.
7. **Ask CCEA for a licence** for anything beyond linking (e.g. displaying a question image inline next to our solution, or offering an "attempt online" mode). Contact info@ccea.org.uk / the Mathematics Subject Officer (lmcfarland@ccea.org.uk) and, for Paper Builder-derived material, paperbuilder@ccea.org.uk. Ask specifically for: (a) permission to reproduce cleared questions (excluding third-party material) with attribution; (b) whether a fee or non-commercial condition applies; (c) confirmation that deep-linking is acceptable. Record the answer and scope any inline reproduction to what is granted.
8. **Fair dealing is not a safe basis** for a question bank: UK exceptions (quotation, illustration for instruction) are narrow and do not cover systematic reproduction on a public site; do not rely on them.
9. **Third-party content**: link (never mirror) Corbettmaths, BBC Bitesize and NI Maths Tutor videos, with attribution; if the platform is commercial, avoid any Corbettmaths use beyond outbound links (their terms forbid profit-making use). Do not use TES teacher booklets (mixed rights).
10. **Science (DAS)**: same model. Tag questions by spec section (e.g. C1.7 Quantitative Chemistry) so that CCEA's fact files (§7.3) and our notes attach to the same nodes; link Unit 7 practical questions to the official practical manuals.
11. **Further Maths**: additionally link the official Q&A booklets (Units 1–3) and fact files (Units 1–4) as CCEA's own topic-sorted practice; write original Unit 4 material (no CCEA booklet exists).

---

## 12. Method and fetch log

- WebSearch: 8 initial queries succeeded; the session's search budget was then exhausted (200/200), so later work used direct fetches.
- `ccea.org.uk` HTML: WebFetch → HTTP 403 on all pages; `curl -A "Mozilla/5.0 …"` → 200 for every subject page listed in §2 (except `/legal/terms-use` on first attempt, which rendered "Page Not Found" and then loaded correctly on a second attempt; `/learning-resources` and `/search` → 403; `gcse-further-mathematics-2017/resources` and `gcse-mathematics-2017/specification` → 404).
- JSON feeds 504, 507, 584, 505, 585, 506 fetched (200); 508 → 404.
- Example PDFs downloaded (200, application/pdf) as listed in §3.2; PDF text extracted by inflating streams with node (no pdftoppm available), giving the copyright/sources wording in §5.5.
- Third-party pages: mathsgenie.co.uk, savemyexams.com (maths, further maths, DAS), revisionmaths.com, revisionscience.com, papersdaddy.com, teacherstoyourhome.com, revisiongenie.com, nimathstutor.co.uk, ontargetresources.co.uk, corbettmaths.com (hub, M1–M8, checklists, practice papers, contents, T&Cs), sites.google.com/c2ken.net/fsl-gcse-maths (M4 and M7/8), physicsandmathstutor.com, applaa.com, bbc.com/bbc.co.uk (curl only; WebFetch is blocked for bbc.co.uk) – all fetched successfully. gcseguide.co.uk: DNS failure on both tools.
- Not verified directly (cited from search results only): TES resource pages, YouTube playlist ids, CGP/Hodder product pages, the applaa.com five-year statement (independently confirmed on CCEA archived pages).

---

## Appendix A – Unit-by-unit mapping of Corbettmaths checklist topics to Textbook Exercise and Practice Question PDFs

(Link text is the Corbettmaths video number; URLs come from https://corbettmaths.com/contents/ as fetched on 1 September 2026. "—" = no Textbook-Exercise row in the contents index for that video number.)
