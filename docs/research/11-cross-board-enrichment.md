# 11 — Cross-board enrichment: how to build a topic dossier in under an hour

*19 September 2026. Written after piloting the method on eight topics (four B2 biology, one C2 chemistry, two P2 physics, one M7 maths). Every URL and every specification reference below was opened or extracted in this session unless marked otherwise.*

---

## 0. Why this exists

CCEA's content overlaps AQA, Edexcel and OCR by roughly 80% topic for topic, and those three boards carry almost all of the UK's good free teaching material. CCEA carries almost none: `docs/research/04` and `05` found that Save My Exams gives CCEA past papers and nothing else, Seneca and Cognito have no CCEA course at all, Dr Frost and Physics & Maths Tutor do not list CCEA, and BBC Bitesize's CCEA pathway is thinner than its own single-science pathways.

So the asymmetry is exploitable. An AQA revision note cannot be given to her — wrong board, wrong grades, wrong scope, and copying it would be theft. But the *ideas* in it can: the order someone chose to teach in, the analogy that makes a mechanism stick, the one representation that beats the other five, the question shape an examiner keeps reaching for, the misconception a teacher wrote down because thirty children made it.

A dossier is the artefact that carries those ideas from a resource we may not copy into a lesson that is entirely ours. It sits at `data/enrichment/<subject>/<slug>.md`, and `pipeline/prompts/author-topic.md` tells every author to read it before writing.

**The budget is under an hour per topic.** The eight pilots took 40 to 50 minutes each once the specifications were extracted; the first topic in a subject costs an extra 30 to 40 minutes for the downloads, the text extraction and the two index files, and that cost is paid once, not per topic. Steps 1 and 2 below are done once per *subject*; within a cluster of related topics (the four B2 reproduction topics, say) the second and later dossiers land nearer 40 minutes because the crosswalk searching and the resource reading are already done.

---

## 1. The crosswalk: from a CCEA statement to the other boards

### 1.1 What each board's references look like

| Board | Qualification | Reference form | Example |
|---|---|---|---|
| **CCEA** | Double Award Science (G9824) | unit + section + outcome | `B2 §2.3.5` |
| **CCEA** | Mathematics (2210) | unit + strand + number, as in our own taxonomy | `M7-NA-10` |
| **AQA** | Combined Science: Trilogy **8464** | decimal section, four levels deep; Biology `4.x`, Chemistry `5.x`, Physics `6.x` | `4.5.3.3 Hormones in human reproduction` |
| **AQA** | Biology **8461**, Chemistry **8462**, Physics **8463** | same numbering, all `4.x`; content absent from Trilogy is marked "(physics only)" etc. in the separate spec | `4.6.2.5 Lenses (physics only)` |
| **AQA** | Mathematics **8300** | the DfE subject-content reference codes, grouped under section numbers `3.1`–`3.6` | `A11`, inside `3.2.2 Graphs` |
| **Edexcel** | Combined Science **1SC0** | Topic number + statement number, per science. Prefix `CB` biology, `CC` chemistry, `CP` physics | `CB7.4` (Topic 7, statement 4, biology) |
| **Edexcel** | Biology **1BI0**, Chemistry **1CH0**, Physics **1PH0** | same topic/statement numbering; the separate spec adds statements the combined one omits, and the combined spec prints a footnote naming them ("Specification points 8.4 and 8.5 are in the GCSE in Biology only") | `B8.4` |
| **Edexcel** | Mathematics **1MA1** | **the same DfE codes as AQA** — N1–N16, A1–A25, R1–R16, G1–G25, P1–P9, S1–S6 — grouped under topic areas 1–6 | `A11` |
| **OCR** | Gateway Science A **J250** | topic letter + number + sub-letter | `C6.1a` |

**The maths consequence is important and saves a lot of time:** AQA 8300 and Edexcel 1MA1 both restate the DfE GCSE mathematics subject content verbatim, so the *reference code is the same on both boards*. The crosswalk row for a maths topic is therefore one set of codes plus two different section groupings, and its real content is the **scope delta** — which board puts the code at Foundation, which marks it Higher-only, and which examines a slice of the code CCEA does not.

### 1.2 Getting the specifications (10 minutes, once per unit)

Download the PDFs and extract text once; after that every crosswalk row is a `grep`.

```bash
UA="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/125.0 Safari/537.36"
curl -sL -A "$UA" -o aqa-8464.pdf  https://filestore.aqa.org.uk/resources/science/specifications/AQA-8464-SP-2016.PDF
curl -sL -A "$UA" -o aqa-8461.pdf  https://filestore.aqa.org.uk/resources/biology/specifications/AQA-8461-SP-2016.PDF
curl -sL -A "$UA" -o aqa-8462.pdf  https://filestore.aqa.org.uk/resources/chemistry/specifications/AQA-8462-SP-2016.PDF
curl -sL -A "$UA" -o aqa-8463.pdf  https://filestore.aqa.org.uk/resources/physics/specifications/AQA-8463-SP-2016.PDF
curl -sL -A "$UA" -o aqa-8300.pdf  https://filestore.aqa.org.uk/resources/mathematics/specifications/AQA-8300-SP-2015.PDF
curl -sL -A "$UA" -o edexcel-1sc0.pdf https://www.scienceclinic.co.uk/uploads/all_subject/pdf/Edexcel-GCSE-Combined-Science-9-1-Specification.pdf
curl -sL -A "$UA" -o edexcel-1ma1.pdf https://qualifications.pearson.com/content/dam/pdf/GCSE/mathematics/2015/specification-and-sample-assesment/gcse-maths-2015-specification.pdf
for f in *.pdf; do pdftotext -layout "$f" "${f%.pdf}.txt"; done
```

Notes learnt the hard way:
- AQA's filestore paths are **per subject**, not per suite: `resources/physics/...` for 8463, not `resources/science/...`. The science path silently returns an HTML error page of about 123 KB, so check the file size.
- Pearson's `qualifications.pearson.com/.../GCSE_CombinedScience_Spec.pdf` served a 152 KB stub; the Science Clinic mirror served the full 3 MB document. Check the byte count before trusting a download.
- `pdftotext -layout` is on this machine (`/mingw64/bin/pdftotext`) and preserves the two-column "Content | Key opportunities" layout well enough to read.
- OCR's J250 specification was **not obtainable** in this session: the ocr.org.uk PDF path and two mirrors all returned error pages. Until someone lands it, treat OCR as a bonus column and leave it out rather than guessing.

Then build two index files you will use for every topic in the unit:

```bash
# AQA: every numbered heading, which is the reference itself
grep -nE "^\s*[456]\.[0-9]+(\.[0-9]+)*\s+[A-Z(]" aqa-8464.txt > aqa-8464-headings.txt

# Edexcel: statement number + first 200 characters, prefixed CB/CC/CP by position in the file
#   (biology topics come first, then chemistry, then physics)
```

The Edexcel indexer is thirty lines of Python: walk the lines, reset the science prefix when you see "Topic 1 - Key concepts in chemistry" / "... of physics", reset the topic number on every "Topic N -", and start a new statement whenever a line begins `N.M` with `N` equal to the current topic. It produced 482 statements for 1SC0 and is worth keeping.

### 1.3 Writing a crosswalk row

For each CCEA statement, in this order:

1. **Search by CCEA's own vocabulary first.** `grep -i "placenta" aqa-8464.txt` is a better first move than reading a section, because a zero result is itself the answer. Four of the eight pilots found their headline finding this way.
2. **Then search by the concept's other names.** "oviduct" and "Fallopian"; "sperm tube" and "vas deferens"; "retardation" and "deceleration"; "turning point" and "vertex". A zero on CCEA's word and a hit on the synonym means *matched, different vocabulary* — which is a `notonspec`-adjacent note for the author, not an unmatched row.
3. **Read the matching section, not the heading.** AQA headings are misleading: "Contraception" contains the oviduct, and "Meiosis" contains fertilisation, implantation-adjacent content and differentiation.
4. **Record the scope delta in both directions.** Not just "AQA has this too" but "AQA also demands FSH and LH, which CCEA does not" and "CCEA demands the placenta, which AQA does not have at all".
5. **Set `confidence` honestly**: `high` when you read the statement text on both sides; `medium` when the mapping is by section heading or by a synonym search; `low` when you are inferring from a topic list. A `low` row is a flag to the author that the dossier's angles may be aimed slightly off.

The finished rows live in **`data/enrichment/crosswalk.json`** — one row per CCEA topic, 282 of them (130 Double Award Science, 152 Mathematics), each carrying the CCEA statement, the AQA and Edexcel references, a `status`, a `confidence`, and a two-directional `scope` block. An author should read their topic's row before opening any other board's page, because it is the row that tells them whether a resource exists at all.

Four row types, and each earns its keep:

| `status` | Means | What the author does with it |
|---|---|---|
| `matched` | An equivalent statement exists; scope is comparable | Mine the other board's resources freely for angles |
| `partial` | Overlapping but the other board demands more or less | Mine, then cut. Name the excess in the scope note |
| `ccea-only` | No equivalent anywhere on AQA or Edexcel GCSE | Borrow an *argument shape* from a neighbouring topic; expect no ready-made resource. Say so in the Sheet — this is where our exclusivity claim is literally true |
| `unmatched` | Genuinely absent and nothing transferable found | Author from CCEA alone; do not pad the dossier |

---

## 2. The resources worth mining, and what each is actually best for

Judged by what they are *best* at, not by whether they are good. A dossier that says "Save My Exams is a revision site" has wasted the author's time; one that says "Save My Exams' exam-question banks show you the three stems a board keeps reusing" has not.

### 2.1 Science

| Resource | Best for | Weak at | Notes |
|---|---|---|---|
| **Save My Exams** revision notes (AQA/Edexcel/OCR) | Scope discipline — they cut hard to the statement, so they show you what the *minimum* answer is; and their "Exam Tip" boxes are mark-scheme habits in plain words | No CCEA content beyond past papers; freemium wall on question banks | Best used to decide what to leave out |
| **Save My Exams** topic question banks | Question *shapes*: the three or four stems a board reuses on one statement, with tariffs | Behind a wall for some topics | Harvest the shape and the tariff, never the wording |
| **Physics & Maths Tutor** | Topic-by-topic past-paper compilations across boards — the fastest way to see a question type's real frequency; and its notes sets are dense summaries good for spotting the order an experienced teacher chose | No CCEA; no interactivity | Excellent for "what does this question look like on three boards" |
| **Cognito** | 5–10 minute videos with unusually clean figures; their diagrams are often the cleanest free rendering of a standard representation | AQA/Edexcel/OCR only; several videos are KS3-labelled for content CCEA examines at GCSE | Already mapped in `data/links/media-map.json` for 103 of our science topics |
| **Freesciencelessons** | The single-idea 4-minute lesson, and consistently good at "why", not just "what" | Strictly AQA paper structure; stops where AQA stops | 144 entries already in our media map |
| **Isaac Physics / Isaac Science** | Multi-step numerical problems with real auto-marking and a proper quantity/unit discipline — the best free source of *harder* physics numerical practice | No CCEA column; no biology depth; link-only, © University of Cambridge | Use for the shape of a stretch question, not for text |
| **Royal Society of Chemistry — Education in Chemistry & edu.rsc.org** | **The best free source of misconception research and classroom analogies in chemistry.** Their 14–16 CPD articles name the misconception, the language that causes it and the language that fixes it | Not exam-board mapped; teacher-facing | The C2 pilot's three strongest findings all came from one RSC CPD article |
| **Institute of Physics — IOPSpark / Physics Narrative** | The same for physics: teaching sequences with the reasoning behind each step, and a strong line on language ("change of speed", not "optical density") | Teacher-facing; no exam mapping | Its "Physics Narrative" pages are the closest thing to a rationale for an order of teaching |
| **STEM Learning** | Practical variants and equipment alternatives; historical schemes of work that show how a practical is examined | Login for some items; variable age | Best when CCEA's prescribed practical has an AQA/Edexcel cousin done differently |
| **Oak National Academy** | Explicit, published **common misconceptions**, per-lesson "learning cycles" and key learning points — a free, structured teaching order for almost every AQA GCSE topic | England KS4 only, no CCEA, no practicals mapped to CCEA's 18 | **Openly licensed (OGL v3.0)** — the only large body here we could quote with attribution. We still do not, but it makes Oak the safest thing to read |
| **BBC Bitesize, AQA/Edexcel/OCR pages** | The pictures they chose, and their teaching order. Bitesize's other-board pages are often richer than its CCEA ones for the same content | BBC copyright; link only, no text reuse | Compare its CCEA page with its AQA page on the same idea; the difference is usually the enrichment |
| **PhET** | The one genuinely interactive asset class we can embed | Licence: CC BY-NC from 29 March 2026, so Cairn must stay free and ad-free; many chemistry sims never made it to HTML5 | Always check the direct URL returns 200 before recording it (`reactions-and-rates`, `collision-theory` and `nuclear-fission` are all 404) |
| **Doc Brown** | Old-fashioned, extremely complete, and unusually honest about what a graph does and does not say | Dense, ad-supported, dated presentation | Good for a second opinion on exactly what is examinable |

### 2.2 Mathematics

| Resource | Best for | Weak at | Notes |
|---|---|---|---|
| **Dr Frost Maths** | The finest-grained topic decomposition in UK maths — its skill breakdown shows the micro-steps a topic actually contains, which is the best possible input to a lesson's section structure. Its question generators show which parameters can vary | No CCEA | Free for individual students |
| **Maths Genie** | Grade-banded sequencing, and it is the one large site with a **CCEA section** (papers M1–M8 and "1 lesson matched to the CCEA GCSE Maths (2210) specification" per topic) | Topics are grouped by 9-1 grade, not by M-unit; no CCEA grade calculator | Useful sanity check on difficulty ordering |
| **Corbettmaths** | The canonical worked example and the canonical practice ladder. Its CCEA checklists map M-unit topics to video numbers, which is how our media map was built | Static PDFs, no feedback. **Terms forbid reusing its questions inside redistributed resources** | Link and embed; never transcribe |
| **Mr Barton / Diagnostic Questions** | Misconception-bearing multiple-choice distractors with real student explanations — the best free source of *why* a wrong answer is attractive | England NC codes; teacher-facing analytics | This is the place to find distractor routes we have not thought of |
| **Khan Academy** | Mastery mechanics and the habit of one idea per screen; strong on the *concept before procedure* move | US sequencing and vocabulary | Take the pedagogy, not the taxonomy |
| **1st Class Maths / OnMaths** | Question-type frequency analysis and predicted papers — good evidence of what actually gets asked | Edexcel/AQA/OCR | Frequency data is the transferable part |
| **GeoGebra** | Where PhET has nothing: circle theorems, transformations, loci, intersections of a line and a curve | Third-party user content; non-commercial terms; applets can vanish | Embed via `geogebra.org/classic/<id>`; the old `/material/iframe/` endpoint is 410 Gone |
| **Desmos** | Excellent for designing our own figure — use it to *check* a curve and its intersections before writing the SVG | **Deliberately excluded from the product** — public graphs may not be embedded the way we would need | Author's tool, not a learner-facing link |

### 2.3 The non-negotiable first read

Before any of the above: the CCEA specification statement itself, the CCEA Teacher Guidance for that section, and our own `examinerEvidence` on the taxonomy entry. **CCEA's scope, terms and mark language win every disagreement.** A dossier that makes an AQA framing sound authoritative has done harm.

---

## 3. What to harvest

Nine things. If a dossier has fewer than six of them it is not finished; if it has a paragraph describing what a website *is*, it has the wrong content.

1. **Teaching order and angle.** In what order did someone who teaches this for a living choose to put the ideas, and why? Oak publishes this as numbered "learning cycles"; RSC and IOP publish it as a narrative; Dr Frost publishes it as a skill decomposition. Record the order, and record the *reason* the order works — "the calendar before the chemistry", "the chain before the categories".
2. **Analogies.** Record the analogy, its source, and the point at which it breaks. An analogy without its limit is a future misconception.
3. **The single best representation.** Not a list of diagrams: the one picture that does the most work, described precisely enough for a generator to build it — axes and their labels, what is plotted, what is aligned with what, what varies between versions, and which parameter a gate would change. This is the highest-value section of a dossier and usually the longest.
4. **Practical variants.** How do the other boards do the same experiment? Different apparatus, different measured variable, different control. CCEA examines its 18 prescribed practicals directly in Unit 7, so a variant is only worth recording if CCEA could set it — and then it is worth a lot, because Booklet B asks about method choices.
5. **Question types and mark-scheme habits.** Two or three shapes, each with its tariff, and the *habit*: what earns the first mark, what earns the last, what a bald answer scores. "One mark for the direction, one for a quoted value" is worth more to an author than any amount of content.
6. **Misconception framings.** Both halves: the wrong idea, and the sentence that fixes it. Oak and RSC publish these; Diagnostic Questions has them implicitly in its distractors. Cross-reference our own `examinerEvidence` — where a published misconception matches a CCEA examiner finding, say so, because that is a confirmed target.
7. **Photographs.** Commons `File:` names with the licence checked, the pixel size, and — required — **what the examiner would ask about this photo**. A photograph without a question is decoration and the house rules forbid it.
8. **Simulations.** Verified URL, licence, and a one-sentence task. If none exists, write "none" and say why; `media-map.json` deliberately leaves 53 topics without a sim and padding that is worse than leaving it empty.
9. **The scope note.** Everything the borrowed material contains that CCEA does not examine, listed so the author can either drop it or mark it `notonspec`; and everything CCEA examines that nobody else does.

---

## 4. The legal line

This is the part that cannot be got wrong, and it is simpler than it looks: **ideas travel, sentences do not.**

**Yes.**
- Teaching order, sequencing, the decision to introduce X before Y.
- An analogy, re-expressed in our own words.
- The *structure* of a representation — axes, what is plotted, what is aligned — rebuilt as our own computed SVG from our own numbers.
- Question *shapes* and tariffs and mark-scheme habits, with our own stems, contexts and numbers.
- Misconceptions and the pedagogy for fixing them: facts about learners, not anyone's copyright.
- Specification statements, quoted briefly, inside a `callout` of kind `spec` with the statement id — and specification references, which are just addresses.

**No.**
- Any sentence. The house rule is that **any eight-word sequence in common with a source is a failure**, and it applies to a dossier as much as to a note. Dossiers may carry short quoted phrases in quotation marks where the exact words are the finding ("not all collisions are successful"); nothing longer.
- Any diagram as an image. Recreate it. This is not only licensing — a recreated figure can be parameterised, gated and themed, which a borrowed PNG cannot.
- Any photograph that is not **CC0, CC BY, CC BY-SA or public domain**, with the credit fields recorded. `scripts/fetch-commons-image.mjs` enforces exactly this and refuses anything else; Commons' bare "Attribution" and "No restrictions" tags are *refused* by it and several otherwise-perfect images fall foul.
- Corbettmaths questions, in any quantity, inside anything we redistribute — its terms name this explicitly.
- CCEA question or mark-scheme text. Read the papers to learn the patterns; write new questions.
- Bitesize text, in any form. Link only.

**Checking a photograph's licence** costs one API call:

```
https://commons.wikimedia.org/w/api.php?action=query&format=json&formatversion=2
  &prop=imageinfo&iiprop=url|extmetadata|mime|size&titles=File:Example.jpg
```

Read `extmetadata.LicenseShortName` and accept only `/^(CC0|CC BY(-SA)?( [0-9.]+)?|Public domain)/i`. Send a real `User-Agent`, sleep about 500 ms between calls, and retry on HTTP 429 — Commons rate-limits quickly. A small `commons.mjs` doing `search` and `check` modes pays for itself by the second dossier.

**Attribution in the dossier itself.** Name the source of every borrowed idea, in the sentence that borrows it. Partly this is honesty; mostly it is so a reviewer can check whether the idea was worth taking, and so the author knows how much weight to put on it.

---

## 5. Marking content that is beyond CCEA

Three mechanisms, used at three different stages:

1. **In the dossier:** the `status` field on the crosswalk row and the closing **scope note**, which lists *beyond CCEA* and *CCEA-only* separately. Nothing should reach the author as an angle without its scope already attached.
2. **In the bundle:** a `callout` of kind `notonspec` beside anything the lesson mentions but the specification does not demand — one line, naming what it is and that she is not assessed on it. This is one of the platform's real differentiators (36 notes carry one today) and the enrichment work is the main thing that generates them, because the borrowed material is where the extra content comes from.
3. **In the Sheet:** the "what is NOT on this spec" line, drawn from the taxonomy's `notOnThisSpec` and from the dossier's scope note.

The bar for including beyond-CCEA content at all: it must **answer a question she would actually ask** (why only one sperm; why the pill can fail) or **make the on-spec content easier to hold** (the fertile-window arithmetic). It must never be presented as required, and it must never displace an on-spec idea. Where a borrowed resource's *centre of gravity* is off-spec — the AQA menstrual-cycle videos are three-quarters FSH and LH — the dossier must say so loudly, because otherwise the author embeds the video and the gate after it cannot repair the damage.

---

## 6. The dossier template

Copy this. Nine sections, in this order. Aim for 120 to 170 lines of dense findings — the eight pilots ran 116 to 166. If it is shorter than about 110 lines something has been skipped; if it is much longer, prose has crept in where a table belongs.

```markdown
# Enrichment dossier — <slug>

**CCEA** <subject>, <unit> §<section> <section title> · outcomes <ids> · tier <F|H|mixed> ·
difficulty <n> · <prescribed practical or "no prescribed practical">
**Prerequisites in our taxonomy:** <slugs>
**Compiled** <date> · <minutes> minutes
**Headline** <one paragraph: the single most valuable thing found, and what the author should
do with it. If the headline is "there is nothing here", say that — it is a finding.>

## 1. Crosswalk
<table: CCEA statement | what CCEA asks | AQA ref + scope | Edexcel ref + scope |
confidence | scope verdict>
<below the table: the searches actually run, with their zero results — the negatives are
evidence and they are what justify a "CCEA-only" claim>

## 2. Teaching angles worth recreating (in our own words)
<3–5 numbered items. Each: the source named in italics, the angle, and why it earns its place.
Say where an analogy breaks.>

## 3. The representation to rebuild as our own SVG
<Hero figure: viewBox, every axis and its label, every band/panel and what it shows,
what is aligned with what, the generator parameters (what varies), and the accessibility
constraints — currentColor, no colour-only signals, what the <title> says.
Then a second, smaller figure if one earns its place.>

## 4. Practicals CCEA also examines
<Variants from the other boards that CCEA could set; the measured variable, the control,
the apparatus difference. If there is no prescribed practical, say so and name the
transferable practical *skill* instead — do not invent an apparatus block.>

## 5. Question types the other boards use that CCEA also rewards
<2–3 numbered shapes. Each: the stem pattern, the tariff, and the mark-scheme habit —
what earns the first mark, what earns the last, what a bald answer scores.>

## 6. Misconception framings worth borrowing
<table: misconception | the framing that fixes it | where it comes from>
<Cross-reference our own examinerEvidence. If the taxonomy records none, say so — the
"In the exam" panel must not invent a finding.>

## 7. Photographs (Commons, licence checked <date>) and simulations
<table: File: | licence | pixel size | use and the prompt the examiner would ask>
<Record refusals too, with the reason.>
<Simulations: verified URL + licence + task, or "none" with the reason.>
<Videos already in media-map.json: say what each is good for and what it over-teaches.>

## 8. Scope note
**Beyond CCEA — `notonspec` if used:** <list>
**CCEA-only, so no borrowed resource will cover it:** <list>

## 9. Sources consulted
<Every specification section read, every page fetched, every API used, and our own
taxonomy entry. One line each.>
```

### The hour, budgeted

| Minutes | Step |
|---|---|
| 0–5 | Read the CCEA taxonomy entry, its statements, `examinerEvidence`, `mustRecall`, and the `media-map.json` entry |
| 5–15 | Crosswalk: grep the extracted specification texts for CCEA's vocabulary, then the synonyms; read the matching sections. (First topic in a unit: add 10 minutes to download and extract the PDFs) |
| 15–35 | Mine two or three resources chosen from §2 for *this topic's* strengths — not the same three every time |
| 35–45 | Write §3, the representation. This is the section that takes real thought and the one authors use most |
| 45–55 | Commons licence checks, simulation URL checks (a 200, not a search result), misconception table |
| 55–60 | Scope note and sources |

### The self-check before filing

- Does every angle name its source?
- Is the representation described precisely enough that someone could build it without reading the source?
- Does every photograph have a licence, a size and a prompt?
- Is every simulation URL one that returned 200 today?
- Does the scope note list both directions — beyond CCEA *and* CCEA-only?
- Is there any sentence in the file that a reader could mistake for someone else's words?
- Did you record the negative searches? A "CCEA-only" claim with no evidence behind it will be believed and should not be.

---

## 7. What the pilot proved, and what it did not

### Coverage, as built

All 282 CCEA topics have a crosswalk row; none was left blank.

| Subject | Topics | matched | partial | ccea-only | unmatched | high confidence |
|---|---:|---:|---:|---:|---:|---:|
| Double Award Science (vs AQA 8464 and Edexcel 1SC0) | 130 | 87 | 26 | 17 | 0 | 123 |
| Mathematics (vs AQA 8300 and Edexcel 1MA1) | 152 | 143 | 8 | 0 | 1 | 145 |

Per science unit, `ccea-only` runs B1 2, B2 1, C1 1, C2 1, **P1 5, P2 7** — the physics units are where a CCEA Double Award learner is furthest from the combined-science material the free sites publish, because AQA and Edexcel confine moments, pressure, fission, fusion, ultrasound, lenses and the whole of space physics to their separate Physics specifications. Maths is the opposite: 143 of 152 topics map cleanly onto shared DfE reference codes, and the useful information in a maths row is the **tier delta**, not the code.

**Proved.** The method finds things that are not in the specification and not in our examiner evidence, and it finds them fast:

- Four of the CCEA B2 §2.3 reproduction statements — the placenta, the umbilical cord, the amnion, the male and female organ names — **have no AQA or Edexcel GCSE equivalent at all**; they are KS3 in England. That is both a warning (no borrowed resource will cover them) and a genuine exclusivity claim.
- CCEA **does not examine FSH or LH**, yet every AQA-shaped video and revision note in that topic leads with them. Without the dossier, an author would have embedded a video that is three-quarters off-spec.
- CCEA classifies contraception as **mechanical / chemical / surgical**; AQA and Edexcel use **hormonal / non-hormonal**. Same methods, incompatible boxes, and the mark scheme cares.
- The RSC's 14–16 CPD writing supplied, in one article, a classroom analogy, the exact language fix for a misconception, and the two misconceptions our own Summer 2025 examiner finding independently records.

- CCEA sets the **graphical solution of a quadratic at Higher (M7 and M8)** where AQA and Edexcel set the same DfE codes at **Foundation** — so their Foundation material is pitched correctly for a first-time learner and their Higher material is mostly off-spec. The tier delta, not the code, is the finding.
- **Binary and number bases** (M6) appear nowhere in the DfE GCSE mathematics subject content, so in neither AQA 8300 nor Edexcel 1MA1. It is the single genuinely unmatched row in 282.

**Not proved.** OCR could not be sourced this session, so the OCR column of the method is untested. Fourteen rows sit at `medium` confidence because they were mapped by section heading or by a synonym search rather than by reading the statement text on both sides; a second pass over those would be cheap and worthwhile. The Edexcel separate-science specifications (1BI0, 1CH0, 1PH0) were not obtained, so where a row names one the claim is flagged as unverified. And no dossier has yet been through the loop that matters most: an author writing a bundle from one, and saying which sections they actually used.

---

## 8. URL register

**Specifications** — `filestore.aqa.org.uk/resources/{science,biology,chemistry,physics,mathematics}/specifications/AQA-{8464,8461,8462,8463,8300}-SP-201{5,6}.PDF` · `qualifications.pearson.com/content/dam/pdf/GCSE/mathematics/2015/specification-and-sample-assesment/gcse-maths-2015-specification.pdf` · `scienceclinic.co.uk/uploads/all_subject/pdf/Edexcel-GCSE-Combined-Science-9-1-Specification.pdf` (mirror of Pearson 1SC0) · OCR J250: not obtained, see §1.2

**Teaching sources named in §2** — `thenational.academy` (Oak, OGL v3.0) · `edu.rsc.org` · `spark.iop.org` · `stem.org.uk` · `savemyexams.com` · `physicsandmathstutor.com` · `cognito.org` · `freesciencelessons.co.uk` · `isaacscience.org` · `docbrown.info` · `drfrost.org` · `mathsgenie.co.uk` · `corbettmaths.com` · `mrbartonmaths.com` and `diagnosticquestions.com` · `khanacademy.org` · `1stclassmaths.com` · `onmaths.com` · `phet.colorado.edu` · `geogebra.org` · `bbc.co.uk/bitesize`

**Licence checking** — `commons.wikimedia.org/w/api.php` (`prop=imageinfo&iiprop=extmetadata`)

**Our own inputs** — `data/spec/*.json` · `data/links/media-map.json` and its README · `docs/research/04` and `05` · `pipeline/prompts/author-topic.md` ("Cross-board enrichment") · `scripts/fetch-commons-image.mjs`
