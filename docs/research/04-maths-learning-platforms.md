# 04 – Audit of online maths learning platforms for CCEA GCSE Maths students (Northern Ireland)

*Research date: 1 September 2026. All URLs below were visited (WebFetch or browser) unless explicitly marked "not verified".*

---

## 0. Method, scope and caveats

**What was done.** ~35 web searches plus ~110 page fetches/browser reads across the platforms named in the brief, CCEA's own site, BBC Bitesize, YouTube's embed/API terms, and the small set of Northern Ireland-specific sites that exist. Where a site blocked automated fetches (Cloudflare 403), the page was read through the browser pane instead.

**What could not be verified (say so, don't guess).**

| Item | Status |
|---|---|
| Save My Exams membership prices | `/pricing/`, `/membership/`, `/pricing` all returned 404; the `/join/` page shows only testimonials/FAQ. Freemium model confirmed; price not captured. |
| MME Premium price | mmerevise.co.uk shows a consent-all-cookies wall with no "decline" option, so it was not clicked. Feature claims come from search snippets only. |
| The GCSE Maths Tutor "Upgrade"/"TGMT Live" prices | `tgmt.app` returned 403. |
| TLMaths GCSE video count ("862 videos, 68+ hours, incomplete, no more being added") | Appears in a search snippet attributed to TLMaths but the Google Site's content is not text-extractable; treat as unverified. |
| UCAS "Changes to CCEA GCSEs" grade-mapping leaflet (A = 7/8, B = 6, C* = 5, C = 4) | `https://www.ucas.com/media/119716/download` returned 403; the mapping is quoted from search-result summaries and matches CCEA's own C* statement, but was not read directly. |
| "Mr Maths NI", "mathsni" | No site or channel under these names was found in any search. Treat as non-existent. |
| St Malachy's College maths resources | Nothing public beyond the curriculum page. Belfast High's maths page is a 404. |

**Northern Ireland context that every platform must be judged against.**

- CCEA GCSE Mathematics (2017 spec, subject code 2210, QAN 603/1688/3) has **eight units**: M1, M2 (Foundation), M3, M4 (Higher) are single calculator papers; M5, M6 (Foundation) and M7, M8 (Higher) are *Completion Tests* consisting of Paper 1 (non-calculator) and Paper 2 (calculator). A student takes **one of M1–M4 and one of M5–M8**. Source: https://ccea.org.uk/key-stage-4/gcse/subjects/gcse-mathematics-2017
- CCEA GCSEs are graded **A\*, A, B, C\*, C, D, E, F, G**. CCEA Regulation: "In summer 2019, the grading changed for all CCEA GCSE qualifications... The C\* appeared in the grading for the first time". Learners in NI "can access Letter (A\*-G) and Number (9-1) graded GCSEs" (9-1 only from AQA/OCR/Pearson/Eduqas). Source: https://ccea.org.uk/regulation/qualifications-regulation/guide-changes-gcse-grading
- Per-unit grade ranges as summarised by On Target Resources: M1/M5 D–G; M2/M6 C\*–F (sic — check the spec PDF for the exact ceiling); M3/M7 B–E; M4/M8 A\*–C. Source: https://ontargetresources.co.uk/ccea-gcse-maths-exams-explained/
- Maths Genie's CCEA page states the unit exam is weighted 45% and the two completion papers 55% (verify against the CCEA specification PDF linked from the spec page above). Source: https://www.mathsgenie.co.uk/gcse/maths/ccea
- CCEA past papers: 635 documents (2018–Summer 2026, incl. Irish Medium and Modified papers). **Copyright notice:** "You are permitted to download and print content from the CCEA website for your own personal use or that of your school... You are not permitted to distribute the content via electronic means (for example the internet or an intranet), store it in a retrieval system, or use content from the website for commercial exploitation in any circumstances." Source: https://ccea.org.uk/key-stage-4/gcse/subjects/gcse-mathematics-2017/past-papers-mark-schemes

---

## 1. Headline comparison table

Legend: **CCEA-mapped** = content organised or labelled against the CCEA spec/units. **Grades** = grading scale the platform speaks in. **Embed** = can its videos be embedded in a third-party site (YouTube iframe) — "n/a" if no video.

| Platform | CCEA-mapped? | CCEA past papers? | Grades used | Cost (student) | Interactive practice / auto-marking | Feedback | Spaced repetition | Progress tracking | Video host / embeddable |
|---|---|---|---|---|---|---|---|---|---|
| **Corbettmaths** | Partly – CCEA M1–M8 revision pages, checklists (topic→video no.), booklets, practice papers, "Ultimate" unit videos | No (own practice papers only) | 5-a-day uses 9-1 tiers; CCEA pages use units | Free | No – PDFs | Answers PDFs | No | No | YouTube; oEmbed confirms embedding allowed |
| **Maths Genie** | Yes – dedicated CCEA section "matched to the CCEA GCSE Maths (2210) specification" | Yes – M1–M8, Jun 2019–Nov 2025 with mark schemes | **Grades 1–9** (topics grouped by 9-1 grade bands); "We don't have the grade calculator for CCEA Maths yet" | Free (optional account/premium) | Some ("exam-style questions", whiteboard, "mark as done") | Worked solutions | No | Basic (mark as done) | YouTube embeds |
| **Dr Frost** | No – AQA, Cambridge OCR, Edexcel, Eduqas, WJEC | No | 9-1 | Free for individuals; £650+VAT/school/yr | Yes – self-marking, 48k+ exam Qs, generators | Yes | Partial (retrieval features) | Yes | Own platform |
| **MathsWatch** | No mention | No | Not stated | Schools/colleges/tutoring services only (GCSE £375+VAT/yr) | Yes – working-out marking | Yes | Some | Yes | Own platform |
| **Sparx Maths** | No – England Y7–Y11 curriculum; no NI mention | No | Not stated | Whole-school licences only | Yes – adaptive homework, 47k Qs | Yes | Yes | Yes (parent portal) | Own platform (11.5k videos) |
| **Save My Exams** | Listed, but **past papers only** for CCEA | Yes – M1–M8 (P1/P2), 2022–Nov 2025 with mark schemes | 9-1 (other boards) | Freemium (price not verified) | For other boards only | – | – | – | – |
| **Seneca** | No – AQA, Edexcel, OCR only | No | 9-1 | Free + premium | Yes (other boards) | AI marking | Yes | Yes | Own |
| **Physics & Maths Tutor** | No – AQA, CAIE, Edexcel, OCR, Eduqas, WJEC | No | 9-1 | Free PDFs | No | Solutions | No | No | n/a |
| **BBC Bitesize** | **Yes – bespoke CCEA GCSE Maths section organised M1–M8 (~108 guides) + quizzes based on CCEA papers** | Yes (links to CCEA PDFs, Summer 2023 onwards) | Letter grades implicit | Free | Quizzes (exam-style, quick-fire, by topic) | Instant | No | "My Bitesize" only | Not embeddable |
| **Oak National Academy** | No – England NC; KS4 Foundation/Higher, no board | No | 9-1 implicit | Free | Quizzes/worksheets | Answers | No | No | Own; content OGL |
| **Khan Academy** | No – no GCSE course ("I will be sure to pass this feedback along") | No | US | Free | Yes | Yes | Yes | Yes | YouTube |
| **1st Class Maths** | No – Edexcel, AQA, OCR | No | 9-1 | Free (Ko-fi) | No – PDFs | Mark schemes / YouTube walkthroughs | No | No | YouTube |
| **Mr Barton / Diagnostic Questions** | No – AQA, Edexcel, OCR; England NC codes | No | 9-1 | Free forever | Yes – MCQ diagnostics with explanations | Yes | No | Yes (teacher-led); Takeaway ticks | YouTube/curated |
| **OnMaths** | No – Edexcel, AQA, OCR, Eduqas | No | 9-1 | Free account | Yes – online self-marking papers | Grade tracked live | No | Scores saved | Video walkthroughs |
| **MME Revise** | No | No | 9-1 | Free + MME Premium | Yes (Premium AI marking – snippet) | – | – | – | – |
| **Third Space Learning** | No – Edexcel, OCR, AQA, Eduqas/WJEC | No | 9-1 | Free PDFs; tutoring by quote | Mostly PDF | Answers | No | No | n/a |
| **Cognito** | No – AQA, Edexcel, OCR A/B, SQA N5, CIE/Edexcel iGCSE | No | 9-1 | Free + Pro | Yes – quizzes, AI feedback | Yes | Flashcards | Yes | Own/YouTube |
| **The GCSE Maths Tutor (YouTube)** | No | No | 9-1 ("grades 4–9") | Free YouTube; paid Upgrade/Live | Paid tiers only | – | – | – | YouTube |
| **TLMaths** | No – England NC codes N1…A25 | No | 9-1 | Free YouTube | No | – | No | No | YouTube |
| **NI Maths Tutor** (NI) | **Yes – M4, M8 courses; M3/M4/M7/M8 past-paper video solutions** | Video solutions for every M4/M8 series 2022–May 2026 | Letter | £64.99 per unit course; solutions free | No (Google Classroom Qs) | Worked solutions | No | No | YouTube |
| **On Target Resources** (NI) | **Yes – 4 practice papers per unit M1–M8** | No (own papers) | Letter, per-unit ranges | Paid (price not shown) | No – PDF | – | No | No | n/a |
| **Belfast Maths Academy** (NI) | CCEA, but still advertises legacy **T3–T6** modules | – | – | Course fees | No | – | – | – | Free video channel |
| **CCEA Paper Builder** | **Yes – 2015–2025 GCSE/GCE maths questions by unit/year/topic** | Yes (question-level) | Letter | Free — **teachers/tutors only** | Builds PDFs | Mark scheme export | No | No | n/a |
| **Quizlet (CCEA verified sets)** | Yes-ish – "Specifically for the CCEA spec", but sets labelled "GCSE (9:1)" | No | 9-1 label | Free/Plus | Self-marking Test mode | Yes | Yes (Learn mode) | Yes | n/a |
| **CGP / Hodder (Hachette) books** | Yes – CGP guide "M3, M4, M7 or M8", topics tagged by module; Hodder MRN Foundation/Higher | No | Letter (CGP metadata says "9-4") | £8.25 / £12 | No | Answers | No | No | n/a |

---

## 2. Platform-by-platform detail

### 2.1 Corbettmaths (the de-facto video/worksheet backbone in NI classrooms)

**Home:** https://corbettmaths.com/  **Contents index:** https://corbettmaths.com/contents/  **YouTube:** https://www.youtube.com/corbettmaths

**How content is organised.** The Contents page is an alphabetical list (2D shapes → Vectors) of several hundred topics; each row offers up to three artefacts — *Video* (numbered, e.g. "Video 9"; numbers run past 390, with suffixes like 267d, 390a), *Practice Questions*, *Textbook Exercise*. Numbering is stable and is what NI teachers and Corbettmaths' own CCEA checklists reference.

**Exact URL patterns (verified examples).**

| Artefact | Pattern | Verified examples |
|---|---|---|
| Video page | `corbettmaths.com/YYYY/MM/DD/{slug}-video-{n}/` (older ones lack the number) | https://corbettmaths.com/2013/12/28/collecting-like-terms-video-9/ · http://corbettmaths.com/2012/08/19/pythagoras-video/ · http://corbettmaths.com/2013/04/04/circle-theorems-theorems/ (V64) · http://corbettmaths.com/2013/04/04/circle-theorems-examples/ (V65) |
| Practice questions page | `corbettmaths.com/YYYY/MM/DD/{slug}-practice-questions/` | https://corbettmaths.com/2019/08/22/collecting-like-terms-practice-questions/ · https://corbettmaths.com/2019/09/02/pythagoras-practice-questions/ · https://corbettmaths.com/2018/04/04/circle-theorems-2/ |
| Practice questions PDFs | `corbettmaths.com/wp-content/uploads/YYYY/MM/{slug}.pdf` + `{slug}-answers.pdf` | https://corbettmaths.com/wp-content/uploads/2023/10/pythagoras.pdf · https://corbettmaths.com/wp-content/uploads/2023/10/pythagoras-answers.pdf |
| Textbook exercise PDF | `corbettmaths.com/wp-content/uploads/YYYY/MM/{Topic}-pdf.pdf` | https://corbettmaths.com/wp-content/uploads/2013/02/collecting-like-terms-pdf3.pdf · https://corbettmaths.com/wp-content/uploads/2019/02/Pythagoras-pdf.pdf · https://corbettmaths.com/wp-content/uploads/2018/09/Circle-Theorems-pdf.pdf |
| Video on YouTube | `youtube.com/watch?v={id}` | Collecting like terms = `zxJNJMDj2Ec` |

Note: the Corbettmaths video page itself does **not** embed the player; it says "you can view this video on the YouTube website by clicking here" and links out. Practice-question pages are two links (Questions PDF, Answers PDF) — nothing interactive.

**5-a-day (GCSE):** https://corbettmaths.com/5-a-day/gcse/ — organised by calendar date, five levels that are explicitly anchored to **9-1 grades**: Numeracy (grades 1–3), Foundation (3–4), Foundation Plus (4–6), Higher (6–7), Higher Plus (8–9). Monthly answer PDFs; file naming `[Month]-[Tier]_Part[N].pdf` (e.g. `Jan-Numeracy-Book_Part1.pdf`). No exam board named; grade labels do not map to CCEA letters.

**CCEA-specific material (unique among the big UK sites).**

- Hub: https://corbettmaths.com/2022/09/21/ccea-revision/ → unit pages `https://corbettmaths.com/2022/09/21/ccea-m{1..8}-revision/` (e.g. https://corbettmaths.com/2022/09/21/ccea-m4-revision/ , https://corbettmaths.com/2022/09/21/ccea-m8-revision/ ).
- Each unit page: an "Ultimate CCEA M*n* Revision Video" (YouTube: M1 = https://www.youtube.com/watch?v=cNDfKSwfzKE ; M8 = https://www.youtube.com/watch?v=twPU3HYboOI ), a question booklet + answers (e.g. https://corbettmaths.com/wp-content/uploads/2022/09/M1-Booklet-Corbettmaths.pdf , https://corbettmaths.com/wp-content/uploads/2022/09/M8-Booklet-1.pdf ), a revision checklist, "A Bit of Everything" paper + answers, and practice papers (M1: Set A and Set B — https://corbettmaths.com/wp-content/uploads/2021/11/CCEA-Set-A-M1.pdf ; M8: Set A Paper 1 and Paper 2 — https://corbettmaths.com/wp-content/uploads/2022/04/CCEA-Set-A-M8-Paper-1.pdf , https://corbettmaths.com/wp-content/uploads/2022/04/CCEA-Set-A-M8-Paper-2-1.pdf ).
- **Checklists map CCEA unit topics to Corbettmaths video numbers.** Read directly: the M1 checklist (https://corbettmaths.com/wp-content/uploads/2021/11/CCEA-Checklist-M1.pdf) lists ~100 topics in three columns, e.g. "Words & Figures – Videos 362, 363", "Collecting Like Terms – Video 9", "Drawing Linear Graphs – Video 186". The M8 checklist (https://corbettmaths.com/wp-content/uploads/2019/04/CCEA-M8-Checklist.pdf) lists 20 Higher-only topics — Irrational Numbers V230, Recurring Decimals V96, Negative Indices V175, Fractional Indices V173, Growth and Decay V236, Surds V305–308, Inverse Proportion V255, Negative Scale Factors V108, Sine Rule V333/334, Cosine Rule V335/336, Area of any Triangle V337, 3D Trig V332, 3D Pythagoras V259, Similar Shapes (Volumes) V293b, Conditional Probability V247, Non-linear Sim Eqns V298, Exponential Graphs V345, Graphical Solutions V267d, Rates of Change V390a, Equation of a Circle V12 — and ends "***Make sure you revise the topics on the M7, M6, M5, M4, M3, M2 & M1 Checklists***", i.e. the checklists are cumulative, not standalone. Later checklists: https://corbettmaths.com/wp-content/uploads/2022/04/CCEA-Checklist-M8.pdf , https://corbettmaths.com/wp-content/uploads/2019/04/CCEA-M6-Checklist.pdf.
- A YouTube playlist "GCSE Maths - CCEA M8" (https://www.youtube.com/playlist?list=PLCkAjxP1zN65iAGUvckYv_gCd2W3FHxz4) is owned by the `corbettmaths` channel (confirmed via YouTube oEmbed).

**Terms of use** (https://corbettmaths.com/more/about/terms-of-use/ — verbatim key clauses):
- "The resources are free (and will always be free) to use for individual use or for use by teachers (and tutors) for their classes (or students)."
- "Under no circumstances can any Corbettmaths resource be used by anyone for profit making purposes (excluding private tuition)."
- "Under no circumstances can any Corbettmaths resource (including individual questions) be used within other resources that are redistributed."
- "never pass any of my work off as your own (including individual questions) as all work is copyrighted"; explicitly prohibits "copying Corbettmaths questions and then uploading on any teaching resources websites".
- Prefers **linking** over uploading copies ("I constantly update and improve my worksheets and this avoids older versions of my files being found online").
- "if in doubt over your planned use of the resources, please feel free to ask me directly".

**Embeddability.** YouTube oEmbed (`https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=zxJNJMDj2Ec&format=json`) returns an `<iframe src="https://www.youtube.com/embed/zxJNJMDj2Ec">` for the Collecting Like Terms video, and likewise for the Ultimate CCEA M1 (`cNDfKSwfzKE`) and M8 (`twPU3HYboOI`) videos — i.e. embedding is **enabled** by the channel owner. Embedding is governed by YouTube's terms (see §3), but Corbettmaths' own ToU bars use "for profit making purposes" and inclusion of its *questions/PDFs* in redistributed resources.

**Quality/pedagogy.** Short, clear, exam-focused videos; the "Ultimate" unit videos are long single-sitting revisions. Practice is static PDF; no feedback, spaced repetition or progress tracking.

### 2.2 Maths Genie

**CCEA hub:** https://www.mathsgenie.co.uk/gcse/maths/ccea (the trailing-slash form loops on automated fetch) **Past papers:** https://www.mathsgenie.co.uk/gcse/maths/ccea/past-papers/

- Boards supported site-wide: "AQA, Edexcel, Eduqas, OCR, WJEC and CCEA" (https://www.mathsgenie.co.uk/gcse.html).
- **Past papers:** M1–M4 single calculator papers; M5–M8 Paper 1 (non-calc) + Paper 2 (calc); F/H labelled; series June 2019, Jan 2020, Nov 2020… Dec 2022, Jun/Nov 2024, Jun/Nov 2025; question paper + mark scheme, "how each mark is awarded". URL pattern `mathsgenie.co.uk/gcse/maths/ccea/papers/[year]-[month]-unit-[n]-[format]`.
- **Topics are organised by 9-1 grade band, not M-unit.** Pattern `https://mathsgenie.co.uk/gcse/maths/ccea/grade-{g}-{g}-{k}-{topic}` (e.g. `.../grade-1-1-3-time/videos`, `.../grade-2-2-9-solving-one-step-equations/videos`). Each topic page says "1 lesson matched to the CCEA GCSE Maths (2210) specification" and describes the "Unit (M1–M4) and Completion Test Paper 1 and Paper 2 (M5–M8) format", but does not tag the topic to a specific unit. Video is a YouTube embed (e.g. ID `5N3_yXTFrp8`); page tools: Whiteboard, Formula sheet, "Mark as done".
- Grade boundaries page: **"We don't have the grade calculator for CCEA Maths yet"** (https://www.mathsgenie.co.uk/gcse/maths/ccea/grade-boundaries). Predicted-papers and exam-questions pages exist for CCEA but rendered only testimonials on fetch — CCEA-specific predicted papers not confirmed.
- Cost: free; optional free account "to save your subjects and track your progress", premium upgrade optional.
- Legacy page https://www.mathsgenie.co.uk/papers.html is Edexcel-only.

### 2.3 Dr Frost Maths / Dr Frost Learning

https://www.drfrost.org/ · GCSE papers: https://www.drfrost.org/revision/papers/gcse · Pricing: https://www.drfrost.org/pricing

- 2,300+ worked-example videos, 48,000+ real exam questions, 3,000+ question generators, auto-marking, analytics, Wonde import.
- Past-paper boards: **AQA, Cambridge OCR, Edexcel, Eduqas, WJEC — no CCEA.**
- Cost: free for independent students; schools £650+VAT/year (unlimited accounts), 60-day trial; teacher tools (assignments, class management, progress) are the paid part.

### 2.4 MathsWatch

https://www.mathswatch.co.uk/ · Order page: https://www.mathswatch.co.uk/order

- Videos + interactive questions + "working-out marking" ("the only platform in the World with this facility"), 1,300+ schools, ~100k daily users.
- **"Subscriptions are available to schools/colleges/Tutoring services only (not individuals)."** Indicative prices (third-party review, https://academiccoaching.co.uk/mathswatch-review-is-it-any-good-your-complete-guide/): GCSE/IGCSE £375+VAT, KS3 £150+VAT, bundles £450–£500+VAT per year. EdTech Impact (https://edtechimpact.com/products/mathswatch/): 4.9/5 from 137 reviews; boards listed generically incl. "WJEC dual award".
- No CCEA or NI mention anywhere found. Reviewers note strict answer matching and weakness on multi-step problem solving.

### 2.5 Sparx Maths

https://sparxmaths.com/ · Subscription help: https://support.sparxmaths.com/en/articles/342370-managing-your-sparx-subscription · Parents: https://sparxmaths.com/parents/ · Curriculum: https://mathscurriculum.sparx-learning.com/

- Adaptive weekly homework for ages 11–16; "Each question also has a short video tutorial"; parent portal; Cambridge-validated impact claim; 2,600+ schools.
- **Whole-school licences only** ("All Sparx subscriptions are whole school"); families cannot buy.
- Curriculum is a "5 year maths curriculum for Y7 to Y11" (England year labels), 47,000 questions / 11,500 videos, "GCSE crossover workbooks". No Northern Ireland/CCEA reference anywhere. (Hegarty Maths was folded into Sparx.)

### 2.6 Save My Exams

https://www.savemyexams.com/gcse/maths/ · CCEA: https://www.savemyexams.com/gcse/maths/ccea/ · CCEA papers: https://www.savemyexams.com/gcse/maths/ccea/past-papers/ · Unit page e.g. https://www.savemyexams.com/gcse/maths/ccea/past-papers/unit-m4/

- GCSE Maths boards: AQA, Edexcel, OCR, WJEC, WJEC Eduqas, **CCEA**. But for CCEA the *only* resource type is **Past Papers** — no revision notes, topic questions, flashcards, smart lessons, target tests or mock exams (all of which exist for AQA/Edexcel/OCR/WJEC). Their join-page FAQ even has "Why do some courses only have past papers/partial resources?".
- CCEA papers listed by unit tab (M1, M2, M5 P1/P2, M6 P1/P2, M3, M4, M7 P1/P2, M8 P1/P2) with paper codes (GMC11, GMC21, GMC51/52, GMC61/62, GMC31, GMC41, GMC71/72, GMC81/82), series June/Nov 2022, Jun/Nov 2023, Jun/Nov 2024, June 2025, Nov 2025 (M1) plus a "December 2022" M7/M8 entry; each with Question Paper + Mark Scheme. Page shows "Exam code: G9602" (an SME label, not CCEA's 2210).
- Pricing: freemium; figures not captured (see caveats).

### 2.7 Seneca Learning

https://senecalearning.com/en-GB/ · Courses help: https://help.senecalearning.com/en/articles/3621918-what-subjects-courses-are-covered-on-seneca · GCSE maths blog: https://senecalearning.com/en-gb/blog/gcse-maths-revision/ · Revision notes: https://senecalearning.com/en-GB/revision-notes/gcse/maths

- Spaced repetition/interleaving, 8,000+ practice exam questions with AI marking, "Amelia" AI tutor, gamification, free core + premium.
- GCSE Maths boards: **AQA, Edexcel, OCR** (Foundation & Higher). No CCEA maths course; CCEA not mentioned in the courses article. (Seneca offers a "request a course" form.)

### 2.8 Physics & Maths Tutor (PMT)

https://www.physicsandmathstutor.com/maths-revision/gcse/ · Papers: https://www.physicsandmathstutor.com/past-papers/gcse-maths/

- Free PDFs: worksheets with solutions, notes, questions by topic (by board and tier), past papers with model solutions. Paid: printed workbooks, tutoring (~£35/h).
- Boards: AQA, Edexcel (GCSE/IGCSE A/B), OCR, Eduqas/WJEC, CAIE. **No CCEA.**

### 2.9 BBC Bitesize — the one mainstream site with a real CCEA maths product

CCEA GCSE Maths section: https://www.bbc.co.uk/bitesize/examspecs/zcq8b82 (CCEA's spec page links it as https://www.bbc.com/education/examspecs/zcq8b82 : "BBC Bitesize has produced bespoke support materials for our GCSE Mathematics specification... cover both Foundation Tier and Higher Tier content.")

- **Organised by unit M1–M8**, each split into Number / Algebra / Geometry and measures / Handling data (M4, M5, M8 merge "Number & Algebra"). Guide counts read from the page: M1 7+7+9+6=29; M2 6+5+4+3=18; M3 4+5+4(+HD); M4 4+2+2=8; M5 2+6+2=10; M6 2+5+4(+HD); M7 3+4+2(+HD); M8 7+3(+HD) — roughly **108+ guides**.
- Three interactive quizzes: "GCSE maths: Exam-style quiz by topic", "GCSE Maths: exam-style questions" ("Free interactive maths quizzes based on CCEA foundation and higher past papers... covering common errors in algebra, graphs"), "GCSE Maths: quick-fire questions".
- Past papers: https://www.bbc.co.uk/bitesize/articles/znktwsg — "three years' worth of past papers and mark schemes (from summer 2023 onwards)... All are available as PDF files hosted by CCEA"; "All CCEA material is linked to with their permission."
- External links on the CCEA maths page: Save My Exams (flagged "Subscription"), Quizlet, Pearson Education, Just Maths.
- Limits: guides are text/diagram pages; no adaptive practice, no per-unit progress, no spaced repetition; Bitesize video/quiz content is not embeddable elsewhere.

### 2.10 Oak National Academy

KS4 programmes: https://www.thenational.academy/teachers/key-stages/ks4/subjects/maths/programmes · Higher units: https://www.thenational.academy/teachers/programmes/maths-secondary-ks4-higher/units · Example unit: https://www.thenational.academy/teachers/programmes/maths-secondary-ks4-higher/units/surds/lessons · Licence: https://www.thenational.academy/blog/open-innovation-licencing-and-access-to-our-new-resources

- KS4 Foundation and Higher (no board variants); Higher = 68 units across Y10/Y11 (e.g. Surds: 12 lessons). Each lesson: slide deck, worksheet PDF, quizzes, lesson overview (+ video). NCETM: Oak KS4 "aligns with all exam board specifications" — meaning England's boards (https://ncetm.org.uk/news/maths-curriculum-resources-available-from-oak-national-academy/).
- **Licence: Open Government Licence** for curricula/resources ("attribute it to Oak and our partners as the creators"); platform code MIT; third-party copyrighted media excluded; Oak's founding principles prevent "direct commercial profiting from its content". No NI/CCEA mention.

### 2.11 Khan Academy

https://support.khanacademy.org/hc/en-us/community/posts/23695821291917-Gcse-uk-content — user asks for "Uk gcse syllabus"; Khan staff reply: "Thank you for sharing your thoughts on the creation of a GCSE course. I will be sure to pass this feedback along". No UK/GCSE mapping exists; US-sequenced; excellent mastery/spaced practice mechanics but wrong taxonomy and terminology for CCEA.

### 2.12 1st Class Maths

https://www.1stclassmaths.com/ · Papers: https://www.1stclassmaths.com/gcse-exam-papers — Edexcel, AQA, OCR only (Foundation/Higher, June 2017–2026 incl. mark schemes); topic booklets, "spicy questions", topic-frequency analysis, predicted papers with YouTube walkthroughs. Free (Ko-fi). No CCEA.

### 2.13 Mr Barton Maths / Diagnostic Questions

- GCSE Maths Takeaway: https://www.mrbartonmaths.com/exams/gcse/gcse-maths-takeaway.html — 133 topics (Foundation / F+H / Higher), each with worksheet, video, answers, MCQ DQ quiz; progress ticks; free; curates Corbettmaths, Maths Genie, KESH, MathedUp.
- Diagnostic Questions: https://diagnosticquestions.com/ — 25,000 questions, "will always remain free"; GCSE questions from **AQA, Edexcel, OCR**; Mr Barton's GCSE quiz collection is organised by England NC codes N1–N16, A1–A25, R1–R16, G1–G25, P1–P9, S1–S6 (https://diagnosticquestions.com/Quizzes/Collection/MrBartonNewGCSEMaths). Student explanations + misconception analytics; scheme-of-work mapping for AQA/Edexcel/OCR only.

### 2.14 OnMaths

https://www.onmaths.com/ · https://www.onmaths.uk/homepage/ · Predicted papers: https://www.onmaths.com/resources/predicted-papers/ — online, **self-marking** predicted papers, mini-mocks (20 min), "demon papers", topic papers; live grade tracking; free account saves scores; video walkthroughs. Boards: **Edexcel, AQA, OCR, Eduqas**. No CCEA.

### 2.15 MME Revise

https://mmerevise.co.uk/ · https://mmerevise.co.uk/gcse-maths-revision/ — worksheets, past papers, online tests; MME Premium claims "22 interactive courses, 10,000+ questions and teacher-accurate AI marking" (search snippet; site behind consent wall). Boards generic England (AQA/Edexcel/OCR). No CCEA.

### 2.16 Third Space Learning

https://thirdspacelearning.com/secondary-resources/gcse-maths/ — "suitable for Edexcel, OCR and AQA and Eduqas / WJEC GCSE mathematics exam boards"; 50+ free papers, 200+ worksheets, revision guides, diagnostic questions, revision mats (PDF); one interactive Edexcel Foundation Paper 1 test; tutoring by quote. No CCEA.

### 2.17 Cognito

https://cognito.org/ · https://go.cognitoedu.org/gcse — GCSE Maths for **AQA, Edexcel, OCR A, OCR B, SQA N5, CIE iGCSE, Edexcel iGCSE** (Foundation/Higher); 5–10 min videos "spec-mapped", quizzes, flashcards, past papers by year and topic, AI feedback, progress; free core + Pro (price not stated; "significantly cheaper than one hour of tutoring" — https://amumreviews.co.uk/inside-cognito-an-honest-explainer-of-the-gcse-revision-platform/). No CCEA.

### 2.18 The GCSE Maths Tutor (YouTube)

https://thegcsemathstutor.co.uk/ · https://www.youtube.com/@TheGCSEMathsTutor — free videos ("over 20 million views"), free practice papers/booklets/checklist and grade calculator; paid "UPGRADE" (on-demand) and "TGMT LIVE"; talks in grades 4–9 and Progress 8; no CCEA mention; prices not captured.

### 2.19 TLMaths

https://www.tlmaths.com/home/gcse-maths · https://www.youtube.com/c/TLMaths — primarily A-level (AQA/Edexcel/OCR/MEI); GCSE section is organised by England NC codes (N: Number N1–N16, A: Algebra A1–A25 visible); reported as incomplete and no longer growing (unverified snippet). Free YouTube. No CCEA.

### 2.20 Northern Ireland / CCEA-specific sites

**N.I. Maths Tutor** — https://www.nimathstutor.co.uk/ (run by "an experienced CCEA Mathematics teacher"; contact n.i.mathstutor@hotmail.com)
- Paid unit courses: "Mastering M4" **£64.99** (https://www.nimathstutor.co.uk/index.php/online-maths-course-options/mastering-m4-ccea-gcse-maths-revision-details) and an M8 course; GCSE→AS bridging; Further Maths Units 1–3; AS/A2. Each course = video tutorials + downloadable notes booklet + question booklet + worked solutions + Google Classroom; full-academic-year access; purchase by email.
- Free: **full video solutions to every M4 and M8 paper from June 2022 to May 2026**, plus some M3/M7 (https://nimathstutor.co.uk/index.php/past-papers/gcse-past-papers-solutions) — YouTube (channel https://www.youtube.com/channel/UCIQNcdd_riJxiEqWBMhWGRQ ; playlist "CCEA GCSE Maths past papers solutions" https://www.youtube.com/playlist?list=PL4Lq_36vZOItjBiUKlftTV3lVtwnjNh59 , owner confirmed via oEmbed).
- Gaps: **Higher-only** (nothing for M1/M2/M5/M6); no interactive practice, marking, spaced repetition or progress.

**On Target Resources** — https://ontargetresources.co.uk/ccea-gcse-maths-exams-explained/ · https://ontargetresources.co.uk/northern-ireland-gcse-maths-papers/ — sells sets of **4 practice papers per unit M1–M8** "written by an experienced GCSE Maths teacher and examiner to align with the CCEA curriculum specification", motivated by "there are very few actual past papers". Prices/format not shown on listing pages.

**Belfast Maths Academy** — https://www.belfastmathsacademy.com/ — GCSE/A-level revision courses; still advertises **legacy T3–T6 GCSE modules** (pre-2017 spec), i.e. content is dated; a free "maths videos" channel.

**MJ Tutors** — https://www.mjtutors.com/ — NI CCEA maths/physics tutoring; no online resources.

**CCEA's own student/teacher resources**
- Spec page: https://ccea.org.uk/key-stage-4/gcse/subjects/gcse-mathematics-2017 (spec PDF, circulars, grade boundaries, past papers, webinars).
- Support: https://ccea.org.uk/key-stage-4/gcse/subjects/gcse-mathematics-2017/support — Specimen Assessment Materials, Teacher Guidance, Exemplification of Examination Performance, Practice Papers, Sample Past Papers, Student Guidance, "Mapping T spec to M Spec", Planning Framework Templates for M1–M4 and M5–M8, Progression of Subject Content, 2022 support webinar.
- **Paper Builder** https://ccea.org.uk/learning-resources/paper-builder — "free tool designed for teachers to create practice question papers from past examination papers... GCSE and GCE Mathematics questions from 2015 to 2025... filter questions by unit, year or topic... export it as a PDF, along with a mark scheme" (max 50 questions). **"Can students access and use Paper Builder? No"**; papers "are copyright of CCEA... authorised for personal or classroom use only and cannot be resold or redistributed online".
- **Topic Tracker** https://ccea.org.uk/learning-resources/topic-tracker — free past-paper-question worksheet builder; "This resource is for teachers only."
- Past papers: https://ccea.org.uk/key-stage-4/gcse/subjects/gcse-mathematics-2017/past-papers-mark-schemes — 635 items; series Summer, November, January; 2018–2026; Standard, Modified (MV18/MV24) and Irish Medium versions.
- No CCEA student-facing microsite, video series or interactive practice for GCSE Maths was found (the Further Maths Q&A booklets are the closest analogue: https://ccea.org.uk/key-stage-4/gcse/subjects/gcse-further-mathematics-2017/support).

**Past-paper aggregators** — RevisionMaths https://revisionmaths.com/gcse-maths/gcse-maths-past-papers/ccea-gcse-maths-past-papers (June 2019, Nov 2020, June 2022–June 2025, zip bundles, free); LearnYay https://www.learnyay.co.uk/maths/gcse-maths/past-papers/ccea/ (2020 only); Teachers To Your Home https://www.teacherstoyourhome.com/uk/past-papers/gcse/maths/ccea (blocked); RevisionWorld https://revisionworld.com/mathematics-ccea-gcse (links only); Think Online Training https://www.thinkonlinetraining.com/maths/gcse/past-papers/ccea/ ("Coming soon"); RevisionTown, British Teachers, A Plus Topper (search hits only). All papers-only, no topic tagging.

**Print / eBook** — CGP CCEA GCSE Maths Revision Guide: Higher, £8.25, "any of the Higher Tier exams (M3, M4, M7 or M8)", free Online Edition, reviewer praises that the "module number is 'attached' to each topic"; metadata oddly says "Level: 9-4 (GCSE)" (https://www.cgpbooks.co.uk/secondary-books/gcse/maths/mcchr41-ccea-gcse-maths-revision-guide); Exam Practice Workbook: Higher £7.99 (MCCHQ41). Hodder/Hachette *My Revision Notes: CCEA GCSE Mathematics* Higher and Foundation (Ian Bettison, 29 Sep 2023, 136pp, £12; Boost eBook £8/yr) — https://www.hachettelearning.com/mathematics/my-revision-notes-ccea-gcse-mathematics-higher , https://www.hachettelearning.com/mathematics/my-revision-notes-ccea-gcse-mathematics-foundation ; Hachette CCEA hub https://www.hachettelearning.com/ccea . TES: "GCSE Maths Revision booklets – CCEA M2 and M6 papers" £5 (https://www.tes.com/teaching-resource/gcse-maths-revision-booklets-ccea-m2-and-m6-papers-11938283).

**Quizlet** — https://quizlet.com/gb/content/ccea-gcse-maths-resources — "Verified Content… Specifically for the CCEA spec": flashcards + exam questions; sets titled e.g. "Place value: Maths CCEA: GCSE (9:1)", "Vectors: GCSE (9-1): CCEA" — CCEA content mislabelled with 9-1.

**Schools** — St Malachy's College curriculum page (https://www.stmalachyscollege.com/curriculum) notes GCSE Maths in Year 11 and Further Maths in Year 12 for selected pupils; no public revision resources. No NI school maths department was found publishing CCEA-mapped online resources.

---

## 3. Embedding and licensing notes (what a platform may legally reuse)

**YouTube**
- Terms of Service (https://www.youtube.com/static?template=terms): "You may also show YouTube videos through the embeddable YouTube player." Prohibits downloading, reproducing, altering content except via Service features.
- Embed help (https://support.google.com/youtube/answer/171780?hl=en): creators can untick "Allow embedding"; age-restricted videos won't play on third-party sites; child-directed sites must self-designate; `youtube-nocookie.com` privacy-enhanced mode.
- Developer Policies (https://developers.google.com/youtube/terms/developer-policies) / API ToS (https://developers.google.com/youtube/terms/api-services-terms-of-service): the embedded player counts as an API Client — "must not modify, build upon, or block any portion or functionality of a YouTube player"; no separating audio/video; no background/hidden players; show YouTube branding; look up *Made for Kids* status and disable tracking/autoplay for such videos (COPPA/GDPR). The IFrame Player API "does not require authorization"; no API key/quota needed just to embed.
- **oEmbed check** (`https://www.youtube.com/oembed?url={video}&format=json`) is a reliable, key-free way to test whether embedding is enabled: it returned iframe HTML for Corbettmaths videos `zxJNJMDj2Ec`, `cNDfKSwfzKE`, `twPU3HYboOI` and identified playlist owners (`corbettmaths`, `N.I. Maths Tutor`); the "CCEA GCSE Further Maths – Revision Playlist" (`PL7O6CcKg0HaF59FTo3En7lUVtbcT0Oz3w`) returned 404 (private/removed).

**Corbettmaths** — free for individual/teacher/tutor use; **no profit-making use** except private tuition; **no inclusion of its questions/resources in redistributed resources**; link rather than re-upload. Embedding its YouTube videos via the YouTube player + linking to its PDFs is the defensible pattern; copying questions, checklists or booklets into a platform is not.

**CCEA** — past papers/mark schemes may be downloaded for personal/school use only; **no electronic redistribution, no retrieval-system storage, no commercial exploitation**. BBC Bitesize links to CCEA-hosted PDFs "with their permission". Paper Builder output is CCEA copyright for personal/classroom use only. A student platform should deep-link to `ccea.org.uk` PDFs or negotiate a licence; it should not rehost or tag-and-serve official questions.

**Oak National Academy** — Open Government Licence (attribution to Oak and partners; third-party media excluded; Oak's principle against direct commercial profiting from its content) — the only large, openly licensed body of GCSE-level maths explanations/quizzes, albeit England-sequenced.

**Diagnostic Questions / Mr Barton** — free forever for teachers; content licensing for reuse not stated. **Maths Genie / PMT / 1st Class Maths / Third Space** — free to use, ordinary copyright; no reuse licence stated.

---

## 4. Concrete gaps for a CCEA GCSE Maths student

1. **No student-facing, CCEA-mapped topic-by-topic past-paper question bank.** Official questions filtered by unit/year/topic exist only in CCEA Paper Builder / Topic Tracker, which are **teachers-only**. Maths Genie, Save My Exams, RevisionMaths etc. give whole papers only; Bitesize offers a handful of quizzes "based on" CCEA papers.
2. **Grade-scale mismatch everywhere.** Every mainstream platform (and even CCEA-labelled third-party content) speaks 9-1: Maths Genie's CCEA topics are grouped by grades 1–9; Corbettmaths 5-a-day tiers are 9-1; Quizlet's CCEA sets are titled "GCSE (9:1)"; CGP's CCEA guide metadata says "9-4". Maths Genie has **no CCEA grade calculator**; nobody exposes A\*–G with C\* or the per-unit grade ceilings (M1/M5 D–G … M4/M8 A\*–C).
3. **M-unit structure is missing or shallow.** Only BBC Bitesize (guides), Corbettmaths (checklists/booklets/practice papers) and NI Maths Tutor (M4/M8) organise by unit. None models the gateway/completion pairing, the cumulative nature of the checklists ("revise the topics on the M7, M6… & M1 checklists"), or lets a student declare "I'm sitting M4 + M8" and get only that content.
4. **No completion-unit-specific (M5–M8) practice** separating Paper 1 non-calculator from Paper 2 calculator skills, other than Corbettmaths' single Set A for M8 and On Target's paid PDFs.
5. **Foundation units (M1, M2, M5, M6) are the least served by NI-specific creators** — NI Maths Tutor's solutions/courses are Higher-only; the print market skews Higher too.
6. **No interactive, auto-marked practice mapped to CCEA.** The engines that do this well (Sparx, MathsWatch, Dr Frost, OnMaths, Diagnostic Questions, Seneca, Cognito) are all England-board and, for Sparx/MathsWatch, school-licence-only.
7. **No spaced repetition or per-unit progress tracking tied to CCEA** (Seneca/Cognito/Khan have the mechanics but not the content).
8. **Thin past-paper corpus.** Spec first awarded 2019, with 2020–21 disruption; On Target: "there are very few actual past papers". Aggregators diverge on which series they hold (e.g. LearnYay 2020 only; SME from 2022; CCEA itself has Summer 2026 papers already).
9. **Licensing walls.** The best free NI-relevant content (Corbettmaths, CCEA papers) cannot be copied into a commercial platform; it can only be linked/embedded.
10. **Stale or absent local provision.** Belfast Maths Academy still lists T3–T6 modules; no NI school department publishes mapped resources; "Mr Maths NI"/"mathsni" do not exist.
11. **No Irish-medium support** anywhere outside CCEA's own Irish Medium papers; no Functional Mathematics recognition support.

---

## 5. Implications for the CCEA GCSE Top Learning Platform

1. **Make the M-unit pair the primary navigation object.** Onboarding: pick tier → pick gateway unit (M1–M4) and completion unit (M5–M8); show the exact paper formats (single calculator paper vs P1 non-calc + P2 calc) and the unit's grade ceiling. Treat checklists as cumulative (M8 presumes M1–M7 content) rather than disjoint.
2. **Speak CCEA grades natively** (A\*–G with C\*), with an optional 9-1 "equivalent" tooltip (A ≈ 7/8, B ≈ 6, C\* ≈ 5, C ≈ 4 — verify against the CCEA/UCAS leaflet). Build the CCEA grade-boundary calculator Maths Genie admits it lacks, using CCEA's published boundaries.
3. **Build the student-facing, unit- and topic-tagged question bank that Paper Builder gives only to teachers — but with original questions.** Write CCEA-style items per topic per unit; for official questions, deep-link to the PDF on ccea.org.uk (as Bitesize does, with permission) or seek a CCEA licence — do not rehost or transcribe official papers.
4. **Embed, don't copy, Corbettmaths and Maths Genie videos.** Use the YouTube iframe (privacy-enhanced domain, no overlays, YouTube branding, Made-for-Kids check, autoplay off), map each CCEA topic to Corbettmaths video numbers (Corbettmaths' own checklists show the mapping is feasible) and link to their practice PDFs. Do not import their questions; note Corbettmaths' no-profit clause when deciding on pricing model, and consider asking Corbettmaths directly as its terms invite.
5. **Differentiate on interactivity and memory**: auto-marked practice with method-level feedback, spaced-repetition scheduling per unit topic, and progress dashboards keyed to the student's chosen unit pair — the combination no CCEA-aligned source currently offers.
6. **Cover Foundation properly.** M1/M2/M5/M6 are under-served by NI creators and by NI Maths Tutor's Higher-only solutions; this is the least contested segment.
7. **Add Paper 1 / Paper 2 modes for completion units** (non-calculator fluency drills vs calculator-required problem sets) and full-length timed mocks per unit, filling the practice-paper scarcity that On Target monetises.
8. **Use openly licensed explanatory text where useful.** Oak's OGL lessons/quizzes can be adapted (with attribution and third-party-media checks) to seed Foundation/Higher explanations, then re-sequenced to CCEA units.
9. **Point outward for what already exists well**: link to the Bitesize CCEA section per unit, to CCEA's Student Guidance and specimen materials, and to NI Maths Tutor's free past-paper video solutions (with attribution) rather than duplicating them.
10. **Watch the series calendar**: CCEA runs Summer and November sittings (and historically January; a December 2022 anomaly exists); the platform's past-paper index should mirror CCEA's own list, including Modified and Irish Medium variants.

---

## 6. Full URL register

**CCEA**
- https://ccea.org.uk/key-stage-4/gcse/subjects/gcse-mathematics-2017
- https://ccea.org.uk/key-stage-4/gcse/subjects/gcse-mathematics-2017/past-papers-mark-schemes
- https://ccea.org.uk/key-stage-4/gcse/subjects/gcse-mathematics-2017/support
- https://ccea.org.uk/regulation/qualifications-regulation/guide-changes-gcse-grading
- https://ccea.org.uk/learning-resources/paper-builder
- https://ccea.org.uk/learning-resources/topic-tracker
- https://ccea.org.uk/key-stage-4/gcse/subjects/gcse-further-mathematics-2017/support
- https://ccea.org.uk/mathematics · https://ccea.org.uk/learning-resources (403 to fetch; reached via search)
- https://www.ucas.com/media/119716/download (403 — not verified)

**Corbettmaths**
- https://corbettmaths.com/ · https://corbettmaths.com/contents/ · https://corbettmaths.com/more/about/terms-of-use/ · https://corbettmaths.com/5-a-day/gcse/
- https://corbettmaths.com/2022/09/21/ccea-revision/ · https://corbettmaths.com/2022/09/21/ccea-m1-revision/ … https://corbettmaths.com/2022/09/21/ccea-m8-revision/
- https://corbettmaths.com/wp-content/uploads/2021/11/CCEA-Checklist-M1.pdf · https://corbettmaths.com/wp-content/uploads/2019/04/CCEA-M8-Checklist.pdf · https://corbettmaths.com/wp-content/uploads/2022/04/CCEA-Checklist-M8.pdf · https://corbettmaths.com/wp-content/uploads/2019/04/CCEA-M6-Checklist.pdf
- https://corbettmaths.com/2013/12/28/collecting-like-terms-video-9/ · https://corbettmaths.com/2019/08/22/collecting-like-terms-practice-questions/ · https://corbettmaths.com/2019/09/02/pythagoras-practice-questions/
- https://www.youtube.com/corbettmaths · https://www.youtube.com/watch?v=cNDfKSwfzKE · https://www.youtube.com/watch?v=twPU3HYboOI · https://www.youtube.com/playlist?list=PLCkAjxP1zN65iAGUvckYv_gCd2W3FHxz4

**Maths Genie** — https://www.mathsgenie.co.uk/gcse.html · https://www.mathsgenie.co.uk/gcse/maths/ccea · https://www.mathsgenie.co.uk/gcse/maths/ccea/past-papers/ · https://www.mathsgenie.co.uk/gcse/maths/ccea/videos · https://www.mathsgenie.co.uk/gcse/maths/ccea/grade-1-1-3-time/videos · https://www.mathsgenie.co.uk/gcse/maths/ccea/grade-boundaries · https://www.mathsgenie.co.uk/gcse/maths/ccea/predicted-papers · https://www.mathsgenie.co.uk/papers.html

**Dr Frost** — https://www.drfrost.org/ · https://www.drfrost.org/revision/papers · https://www.drfrost.org/revision/papers/gcse · https://www.drfrost.org/pricing

**MathsWatch** — https://www.mathswatch.co.uk/ · https://www.mathswatch.co.uk/order · https://academiccoaching.co.uk/mathswatch-review-is-it-any-good-your-complete-guide/ · https://edtechimpact.com/products/mathswatch/

**Sparx** — https://sparxmaths.com/ · https://sparxmaths.com/parents/ · https://support.sparxmaths.com/en/articles/342370-managing-your-sparx-subscription · https://mathscurriculum.sparx-learning.com/

**Save My Exams** — https://www.savemyexams.com/gcse/maths/ · https://www.savemyexams.com/gcse/maths/ccea/ · https://www.savemyexams.com/gcse/maths/ccea/past-papers/ · https://www.savemyexams.com/gcse/maths/ccea/past-papers/unit-m4/ · https://www.savemyexams.com/join/

**Seneca** — https://senecalearning.com/en-GB/ · https://help.senecalearning.com/en/articles/3621918-what-subjects-courses-are-covered-on-seneca · https://senecalearning.com/en-gb/blog/gcse-maths-revision/ · https://senecalearning.com/en-GB/revision-notes/gcse/maths

**PMT** — https://www.physicsandmathstutor.com/maths-revision/gcse/ · https://www.physicsandmathstutor.com/past-papers/gcse-maths/

**BBC Bitesize** — https://www.bbc.co.uk/bitesize/examspecs/zcq8b82 · https://www.bbc.co.uk/bitesize/articles/znktwsg

**Oak** — https://www.thenational.academy/teachers/key-stages/ks4/subjects/maths/programmes · https://www.thenational.academy/teachers/programmes/maths-secondary-ks4-higher/units · https://www.thenational.academy/teachers/programmes/maths-secondary-ks4-higher/units/surds/lessons · https://www.thenational.academy/blog/open-innovation-licencing-and-access-to-our-new-resources · https://support.thenational.academy/our-maths-curriculum · https://ncetm.org.uk/news/maths-curriculum-resources-available-from-oak-national-academy/

**Khan Academy** — https://support.khanacademy.org/hc/en-us/community/posts/23695821291917-Gcse-uk-content

**1st Class Maths** — https://www.1stclassmaths.com/ · https://www.1stclassmaths.com/gcse-exam-papers

**Mr Barton / DQ** — https://www.mrbartonmaths.com/exams/gcse/gcse-maths-takeaway.html · https://diagnosticquestions.com/ · https://diagnosticquestions.com/Quizzes/Collection/MrBartonNewGCSEMaths

**OnMaths** — https://www.onmaths.com/ · https://www.onmaths.uk/homepage/ · https://www.onmaths.com/resources/predicted-papers/

**MME** — https://mmerevise.co.uk/ · https://mmerevise.co.uk/gcse-maths-revision/

**Third Space Learning** — https://thirdspacelearning.com/secondary-resources/gcse-maths/

**Cognito** — https://cognito.org/ · https://cognito.org/courses · https://go.cognitoedu.org/gcse · https://amumreviews.co.uk/inside-cognito-an-honest-explainer-of-the-gcse-revision-platform/

**The GCSE Maths Tutor** — https://thegcsemathstutor.co.uk/ · https://www.youtube.com/@TheGCSEMathsTutor

**TLMaths** — https://www.tlmaths.com/home/gcse-maths · https://sites.google.com/view/tlmaths/home · https://www.youtube.com/c/TLMaths

**NI-specific** — https://www.nimathstutor.co.uk/ · https://www.nimathstutor.co.uk/index.php/online-maths-course-options/mastering-m4-ccea-gcse-maths-revision-details · https://nimathstutor.co.uk/index.php/past-papers/gcse-past-papers-solutions · https://www.youtube.com/channel/UCIQNcdd_riJxiEqWBMhWGRQ · https://www.youtube.com/playlist?list=PL4Lq_36vZOItjBiUKlftTV3lVtwnjNh59 · https://ontargetresources.co.uk/ccea-gcse-maths-exams-explained/ · https://ontargetresources.co.uk/northern-ireland-gcse-maths-papers/ · https://www.belfastmathsacademy.com/ · https://www.mjtutors.com/ · https://www.stmalachyscollege.com/curriculum

**Aggregators / books / other** — https://revisionmaths.com/gcse-maths/gcse-maths-past-papers/ccea-gcse-maths-past-papers · https://www.learnyay.co.uk/maths/gcse-maths/past-papers/ccea/ · https://www.teacherstoyourhome.com/uk/past-papers/gcse/maths/ccea · https://revisionworld.com/mathematics-ccea-gcse · https://www.thinkonlinetraining.com/maths/gcse/past-papers/ccea/ · https://www.cgpbooks.co.uk/secondary-books/gcse/maths/mcchr41-ccea-gcse-maths-revision-guide · https://www.hachettelearning.com/mathematics/my-revision-notes-ccea-gcse-mathematics-higher · https://www.hachettelearning.com/mathematics/my-revision-notes-ccea-gcse-mathematics-foundation · https://www.hachettelearning.com/ccea · https://www.tes.com/teaching-resource/gcse-maths-revision-booklets-ccea-m2-and-m6-papers-11938283 · https://quizlet.com/gb/content/ccea-gcse-maths-resources

**YouTube embedding** — https://www.youtube.com/static?template=terms · https://support.google.com/youtube/answer/171780?hl=en · https://developers.google.com/youtube/terms/developer-policies · https://developers.google.com/youtube/terms/api-services-terms-of-service · https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=zxJNJMDj2Ec&format=json
