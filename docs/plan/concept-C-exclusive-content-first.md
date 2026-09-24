# Concept C — Exclusive-content-first

**Lens:** start from the content that nobody provides for CCEA students, design the products, the exact formats, the authoring pipeline that can produce them at volume without losing accuracy, and the "exam-true" layer that makes every piece of feedback sound like a CCEA examiner.

**Sources:** this concept uses only the research already in `docs/research/01`–`10` and the machine-readable spec at `data/spec/double-award-science.json` (see `data/spec/README.md`). Citations are given as `(NN §x)` = research file NN, section x. No new web research was done; where a fact still needs confirming from a document we already hold locally (e.g. `docs/sources/maths/*.pdf`, `docs/sources/science/DA-Science-spec.pdf`), it is marked **[confirm from local source]**.

**Date basis:** written 2 September 2026. Phase 0 = the two weeks to ~16 September 2026.

**What the audits say is missing (the whole reason for this concept):**

| Gap | Evidence |
|---|---|
| No student-facing, topic-tagged CCEA question bank (Paper Builder / Topic Tracker are teachers-only) | 04 §4.1, 08 §6, 08 §8 |
| No per-statement "what you actually need to know" notes in CCEA language; every mainstream site is 9–1 / AQA-shaped | 04 §4.2–4.3, 05 §3 |
| Chief Examiner reports are narrative PDFs; nobody has turned them into a per-topic misconception bank or coaching | 03 §10 (gap 5), 01 §9.5 |
| Unit 7 Booklet B (17.5% of Double Award) has no trainer anywhere | 05 §4 (gap 2), 03 §10 (gap 4) |
| Physics has no formula sheet; ~25 equations must be recalled; no recall tool exists | 03 §2, §5.9, §10 (gap 1) |
| Further Maths has no interactive resources at all; only PDFs, one paid video course, and a removed playlist | 02 §7, 04 §2.20, 04 §3 |
| No A\*/UMS calculator (Maths Genie: "We don't have the grade calculator for CCEA Maths yet"); students argue whether A\* is "79% or 90+" | 04 §2.2, 09 §2.3, §7.1 |

---

## 1. The answer to her question

You already have the specification, the past papers, the mark schemes and Corbettmaths. This platform is the layer that none of those give you.

Every statement in your three specifications has a short note that says exactly what you must be able to do, what is on the formula sheet and what you must memorise, what is *not* on the CCEA spec, and what the Chief Examiner reported students got wrong on that statement in 2023–2025 (Products 1 and 7). Before each topic you answer five diagnostic questions whose wrong options are the real mistakes examiners describe, so you find your gaps before you spend an hour on them (Product 2).

Then you practise on original questions written in CCEA's style, with mark schemes in CCEA's mark language, so you learn where the method marks are and why "correct answer, no working" can score zero (Products 3, 4, 5). Every item you get wrong comes back on a spaced schedule tuned to your exam dates (Product 6).

For science, there is an equation-recall trainer for the physics equations the exam does not give you, a Data Leaflet drill for chemistry, a QWC builder for the 6-mark questions, and the only Booklet B practical-theory trainer that exists (Products 8–11). For Further Maths, the first interactive practice of any kind (Product 12).

Finally, it converts your practice-paper raw marks into UMS and shows what A\* actually requires, and indexes every past-paper question by topic with a link to the official PDF (Products 13–14). Every item shows what was checked before it was published, so you can trust it.

*(238 words)*

---

## 2. The content products

Conventions used below:

- **Spec ids.** Science uses the ids already in `data/spec/double-award-science.json`: `DA-<unit>-<lo id>` (e.g. `DA-P1-1.4.17`), prescribed practicals `DA-PRAC-<code>` (e.g. `DA-PRAC-C5`), Unit 7 skills `DA-U7-<area>-<n>`. Maths and Further Maths taxonomies are being built in parallel; ids below are **provisional** in the form `GM-<unit>-<strand>-<n>` (strands NA = Number & algebra, GM = Geometry & measures, HD = Handling data, following the spec's own three strands, 01 §5) and `FM-<unit>-<area>-<n>`. Content files store statement ids as opaque strings that the build validates against `data/spec/*.json`.
- **Teachable topic ids** are dotted slugs: `maths.m4.histograms`, `science.p1.kinetic-energy`, `fm.u2.force-diagrams`.
- **Item ids** are prefixed by type: `note.`, `we.` (worked example), `dx.` (diagnostic), `q.` (question), `ftm.` (find-the-mistake), `rp.` (retrieval prompt), `ins.` (examiner insight), `prac.`, `eq.`, `qwc.`.
- **Bundle sizes** (used in §5): **L** lite = note + 5 diagnostics + 6 prompts + links; **S** standard = note + 2 worked examples (+ twins, + 2 faded) + 5 diagnostics + 8 practice + 2 exam-style + 1 find-the-mistake + 8 prompts + 1 insight card; **H** hard = longer note with trap list + 4 worked examples + 8 diagnostics + 16 practice + 5 exam-style + 3 find-the-mistake + 12 prompts + insight card + one ≤60 s clip.

Products 1–7 are demonstrated end-to-end on one real topic: **M4 Handling data — histograms with unequal class intervals** (01 §5.7; examiner evidence 01 §9.1 Q22, §9.2 Q21(b), §9.3 Q21(b), §9.4 Q23). Products 8–15 each carry their own worked example.

### Product 1 — Need-to-Know Notes (per spec statement, in CCEA language)

**What it is.** One MDX note per teachable topic, structured as: *What the spec says* (statement id + our one-sentence paraphrase) → *What you must be able to do* (numbered, in the command words CCEA uses) → *Given on the formula sheet / must memorise* (01 §4) → *Not on this spec* (from the Teacher Guidance scope limits, 01 §4, 02 §4) → *How it is examined* (question types, typical tariff, calculator or not) → *Examiner's trap list* (Product 7, inlined) → in-text retrieval prompts (Product 6). 600–900 words; every paragraph ends in an interaction (07 §7 principle 1).

**Worked example — `note.maths.m4.histograms`**

```mdx
---
id: note.maths.m4.histograms
topic: maths.m4.histograms
title: Histograms with unequal class widths
subject: maths
unit: M4
tier: higher
specRefs: [GM-M4-HD-2]            # "construct and interpret histograms with unequal class intervals" (01 §5.7)
assumes: [GM-M2-HD-2, GM-M3-HD-1] # grouped frequency tables & estimated mean (M2); cumulative frequency (M3)
calculator: true                  # M4 is a calculator paper (01 §2)
formulaSheet: { given: [], mustKnow: ["frequency density = frequency ÷ class width"] }
examinerFlagged: true
hardness: H
externalRefs:
  - { kind: corbettmaths, videos: [157, 158, 159, 52], note: "Histograms; reading; median (M4 booklet mapping, 08 §11 step 3 of current file)" }
  - { kind: corbettmaths-playlist, playlistId: PLCkAjxP1zN65WiAbtrBpUjZlGMS1h28GU }
  - { kind: bitesize, examSpec: zcq8b82, unit: M4, section: "Handling data" }
  - { kind: ccea-pastpaper, paper: "504/2025-Summer/M4", question: 22, deepLink: true }
verification: { status: verified, log: ver.note.maths.m4.histograms }
version: 1
---

<SpecBox ref="GM-M4-HD-2">
Construct and interpret histograms with unequal class intervals, using frequency density.
</SpecBox>

## What you must be able to do
1. **Calculate** frequency density for every class: frequency ÷ class width.
2. **Draw** a histogram on a blank grid: choose a sensible frequency-density scale, label the vertical axis
   *Frequency density*, put the variable and unit on the horizontal axis, no gaps between bars.
3. **Read** a histogram: frequency = frequency density × class width (area of the bar).
4. **Estimate** how many values lie in part of a class (assume the values are spread evenly).
5. **Estimate the median** from a histogram by accumulating bar areas to n/2 and interpolating inside the class.
6. **Reverse-read**: given the frequency of one bar, find the vertical scale, then every other frequency.

<Prompt id="rp.maths.m4.histograms.01" />

## Formula sheet
Nothing for this topic is printed on the Higher formula sheet (01 §4). Memorise: frequency density = frequency ÷ class width.

## Not on this spec
Equal-width histograms are treated as bar charts of grouped data (M2). You will not be asked for a frequency
polygon over a histogram or for a histogram with open-ended classes.

## How it is examined
Almost always one multi-part question late in M4 worth 6–9 marks: (a) construct on a blank grid, (b) an
interpretation (a count in a range or the median), (c) often stratified sampling attached (01 §9.1 Q22, §9.4 Q23).

<WorkedExample id="we.maths.m4.histograms.01" />
<Try id="we.maths.m4.histograms.01.twin" />

## Examiner's trap list
<ExaminerSays source="ccea-cer:maths:2025-summer:M4:Q22">
Drawing on a blank grid: "many zero — no frequency density; scales/labels". Estimating the median "continues
to cause problems for the vast majority". Stratified sampling: many blank. (01 §9.1)
</ExaminerSays>
<ExaminerSays source="ccea-cer:maths:2025-november:M4:Q23">
Frequency-density scale, median from histogram and stratified sampling were answered by "top only". (01 §9.4)
</ExaminerSays>
<ExaminerSays source="ccea-cer:maths:2024-summer:M4:Q21b">
Reverse reading of a histogram was "all or nothing". (01 §9.2)
</ExaminerSays>

<Prompt id="rp.maths.m4.histograms.05" />
<Diagnostic set="dx.maths.m4.histograms" />
```

**Why it is exclusive.** No site offers per-statement notes in CCEA unit language with the formula-sheet split and the Teacher Guidance scope limits; Bitesize's CCEA guides are ~108 text pages without spec ids, tiers or examiner evidence (04 §2.9); CGP/Hodder are print (04 §2.20). **Spec statements covered:** `GM-M4-HD-2`.

### Product 2 — Statement-level Diagnostics (misconception distractors + confidence)

**What it is.** 4–8 single-skill MCQs per topic, answerable in 10–20 s, each distractor tagged with a named misconception and its own feedback; answered before teaching (pretesting) and re-probed later (06 §9: Little & Bjork 2015, Barton's rules, Foster 2022 hypercorrection). Confidence is collected on every answer.

**Worked example — `dx.maths.m4.histograms`** (5 items; correct option marked ✔; misconception tags in brackets)

1. The class 10 < t ≤ 20 has frequency 30. Its frequency density is…
   3 ✔ · 30 [`fd.plots-frequency`: height = frequency] · 300 [`fd.multiplies-width`] · 0.33 [`fd.inverts`]
2. In a histogram with unequal class widths the frequency of a class is shown by the bar's…
   area ✔ · height [`hist.height-is-frequency`] · width [`hist.width-is-frequency`] · position on the axis [`hist.position`]
3. A bar for 20 < t ≤ 40 has frequency density 0.8. The class frequency is…
   16 ✔ · 0.8 [`hist.height-is-frequency`] · 0.04 [`fd.divides-again`] · 32 [`fd.uses-upper-bound`]
4. A histogram shows 80 values on an axis from 0 to 60 minutes. The median is…
   the 40th value, found by accumulating bar areas ✔ · at 30 minutes, the middle of the axis [`median.midpoint-of-axis`] · in the tallest bar [`median.mode-confusion`] · the mean of the bar heights [`median.mean-of-heights`]
5. Class 5 < t ≤ 10 has frequency density 4; class 10 < t ≤ 20 has frequency density 3. Which contains more values?
   10 < t ≤ 20 (30 vs 20) ✔ · 5 < t ≤ 10 [`hist.height-is-frequency`] · equal [`hist.ignores-width`] · cannot tell [`hist.needs-total`]

Each distractor's feedback names the mistake in examiner language, e.g. for 1/`fd.plots-frequency`: "You have plotted frequency. On an unequal-width histogram the examiner awards the drawing mark only if heights are frequency ÷ class width (S2025 M4 Q22(a): 'no frequency density' scored zero)."

**Why it is exclusive.** Diagnostic Questions/Eedi are England-only and NC-coded (04 §2.13); nothing exists per CCEA statement, and no CCEA product collects confidence. **Covers:** `GM-M4-HD-2`, prerequisites `GM-M2-HD-2`.

### Product 3 — Original Exam-Style Question Bank with CCEA-style mark schemes

**What it is.** Original questions (new contexts, new numbers, new diagrams) written to CCEA paper conventions: unit, tier, calculator/non-calculator (Paper 1 vs Paper 2 for M5–M8), marks per part, command words, answer-line/units conventions, with a mark scheme in the CCEA mark language for that subject (§6). Never a re-skin of a specific CCEA question (see §4, stage 7).

**Worked example — two original M4 questions**

**`q.maths.m4.histograms.0001`** (calculator, 8 marks)

> 80 students each completed a logic puzzle. The table shows the times, *t* minutes, they took.
>
> | Time (t minutes) | 0 < t ≤ 5 | 5 < t ≤ 10 | 10 < t ≤ 20 | 20 < t ≤ 40 | 40 < t ≤ 60 |
> |---|---|---|---|---|---|
> | Frequency | 10 | 20 | 30 | 16 | 4 |
>
> (a) On the grid, draw a histogram for this information. **[3]**
> (b) Estimate the number of students who took more than 30 minutes. **[2]**
> (c) Estimate the median time. **[3]**

Mark scheme (GCSE Maths mark language, see §6.2):

| Part | Answer | Mark | Notes |
|---|---|---|---|
| (a) | Frequency densities 2, 4, 3, 0.8, 0.2 | M1 | any one correct frequency density calculated or a correct FD column started |
| | | A1 | all five correct |
| | histogram | A1 | bars of correct heights, no gaps, vertical axis labelled *Frequency density* with a linear scale. Award 2 marks max if axis unlabelled. |
| (b) | (40 − 30)/20 × 16 = 8 | M1 | proportion of the 20–40 bar, or 8 seen |
| | 12 | A1 | ft from a wrongly drawn histogram if the method is clear |
| (c) | 40th value; cumulative 10, 30, 60 → class 10 < t ≤ 20 | M1 | identifying n/2 = 40 and the correct class |
| | 10 + (40 − 30)/30 × 10 | M1 | interpolation inside the class (ft their class) |
| | 13.3 (accept 13.3–13.4) | A1 | 15 (class midpoint) scores M1 only |

**`q.maths.m4.histograms.0002`** (calculator, 7 marks) — figure supplied as a histogram whose vertical axis carries **no numbers**; bar heights as drawn: 0 < m ≤ 2 → 1.5 cm, 2 < m ≤ 3 → 4 cm, 3 < m ≤ 5 → 1 cm, 5 < m ≤ 10 → 0.4 cm.

> The histogram shows information about the masses, *m* kg, of the parcels a courier collected one morning. There were 24 parcels with 2 < m ≤ 3.
> (a) Work out the number of parcels with 3 < m ≤ 5. **[2]**
> (b) Work out the total number of parcels. **[2]**
> (c) Estimate the number of parcels with a mass greater than 4 kg. **[2]**
> (d) Ciara says "The 5 < m ≤ 10 bar is the lowest, so it has the fewest parcels." Explain why Ciara is wrong. **[1]**

| Part | Answer | Mark | Notes |
|---|---|---|---|
| (a) | 24 ÷ 4 = 6 per cm (or 4 cm ≡ 24 for width 1) | M1 | establishing the scale from the given class |
| | 6 × 1 × 2 = 12 | A1 | |
| (b) | 18 (0–2) or 12 (5–10) seen | M1 | ft their scale |
| | 18 + 24 + 12 + 12 = 66 | A1 | |
| (c) | ½ × 12 = 6 and 12 | M1 | half of the 3–5 class, plus the whole 5–10 class |
| | 18 | A1 | |
| (d) | Area, not height, gives frequency: the class is 5 kg wide so its frequency is 2.4 × 5 = 12, the same as 3 < m ≤ 5 | A1 | must refer to width/area; "it's wider" alone is not enough |

**Why it is exclusive.** Corbettmaths' CCEA booklets exist but may not be copied (04 §2.1); CCEA's own bank is teachers-only (08 §6); Save My Exams, Maths Genie and PMT have no CCEA topic questions (08 §8). **Covers:** `GM-M4-HD-2`, with (b)/(c) touching `GM-M3-HD-1` reasoning.

### Product 4 — Worked Examples with examiner narration, twin and faded versions

**What it is.** Each worked example is a step list where every step has (i) the working, (ii) the *decision* ("I notice… so I…", 06 §12), (iii) a "why is this step allowed?" menu, and (iv) which mark it earns. It is followed by a structurally identical *Your Turn* twin and two backward-faded completions (06 §6: Renkl 2002; Barton example–problem pairs).

**Worked example — `we.maths.m4.histograms.01` (estimate the median)**, using the table from `q.…0001`:

| Step | Working | Decision (narrated) | Mark it earns |
|---|---|---|---|
| 1 | n = 80, so the median is the 40th value | "Median from a histogram means 'halfway through the *area*', so I need the total first." | M1 (with step 2) |
| 2 | Cumulative: 10, 30, 60 → the 40th lies in 10 < t ≤ 20 | "30 values are done by t = 10; I need 10 more from a class of 30." | M1 |
| 3 | Fraction of the class needed = 10/30; width 10 → 10/30 × 10 = 3.33 | "Values are assumed evenly spread, so I take a fraction of the *width*." | M1 |
| 4 | Median ≈ 10 + 3.33 = 13.3 minutes | "Answer to 1 d.p. with the unit; the examiner rejects the class midpoint 15." | A1 |

Why-menu at step 3: (a) "because the bar is a rectangle, so area is proportional to width" ✔; (b) "because 30 is the largest frequency"; (c) "because the median is always in the third class".
*Your Turn twin:* same table structure, frequencies 12, 18, 24, 20, 6 (n = 80; median in 10 < t ≤ 20: 30 done, need 10 of 24 → 10 + 4.17 = 14.2).
*Faded 1:* steps 1–3 shown, student supplies step 4. *Faded 2:* steps 1–2 shown, student supplies 3–4.

**Why it is exclusive.** Video walkthroughs exist (NI Maths Tutor, Corbettmaths) but no CCEA resource shows *which mark each step earns* or fades support (04 §2.20). **Covers:** `GM-M4-HD-2`.

### Product 5 — Find-the-Mistake ("Examiner's red pen") items

**What it is.** A student's plausible wrong solution, built from an error named in a Chief Examiner report; the learner must locate the step, name the mistake and fix it (06 §9: McLaren 2015 *d* = 0.33 at delay; Durkin & Rittle-Johnson 2012). Each item cites the report it came from.

**Worked example — `ftm.maths.m4.histograms.01`**

> Aoife's answer to "Estimate the median time" (table as above):
> "Total = 80, so the median is the 40th value. 10 + 20 = 30, 30 + 30 = 60, so the median is in 10 < t ≤ 20. **Median = (10 + 20) ÷ 2 = 15 minutes.**"
> (i) Which line contains the mistake? (ii) What did Aoife do? (iii) Write the correct final two lines.

Answer: line 3; she took the midpoint of the class instead of interpolating 10 of the 30 values across the 10-minute width; correct: 10 + (40 − 30)/30 × 10 = 13.3 min. Examiner-language feedback: "Correct class identified — M1. Midpoint of the class gains no further credit; the interpolation step is the second method mark (S2025 M4 Q22(b): the median from a histogram 'continues to cause problems for the vast majority', 01 §9.1)." Source: `ccea-cer:maths:2025-summer:M4:Q22`.

**Why it is exclusive.** No CCEA product turns examiner reports into fix-it tasks. **Covers:** `GM-M4-HD-2`.

### Product 6 — Retrieval Prompt Decks (in-note prompts, FSRS-scheduled to the exam date)

**What it is.** Atomic prompts authored *inside* the note (07 §2.8 Quantum Country; §7 principle 6), scheduled with ts-fsrs at desired retention 0.9, rising to 0.93–0.95 in the last six weeks before the relevant CCEA paper (06 §3). Kinds: Q/A, cloze, formula recall, definition-with-key-words, procedure-steps, "give a novel example", label-the-diagram.

**Worked example — `rp.maths.m4.histograms.01–08`**

| id | Kind | Prompt | Answer |
|---|---|---|---|
| 01 | qa | On a histogram with unequal class widths, what does the **area** of a bar represent? | The frequency of that class |
| 02 | formula | frequency density = ? | frequency ÷ class width |
| 03 | qa | Class 20 < t ≤ 40 has frequency 16. Frequency density? | 0.8 |
| 04 | qa | What must the vertical axis be labelled? | Frequency density (horizontal: variable and unit) |
| 05 | procedure | First step when estimating the median from a histogram? | Total the frequencies (areas) and halve: find position n/2 |
| 06 | formula | You enter the median class needing k more values; class frequency f, width w. Median ≈ ? | lower boundary + (k ÷ f) × w |
| 07 | qa | Estimate how many of the 16 values in 20 < t ≤ 40 lie in 30 < t ≤ 40. | (10 ÷ 20) × 16 = 8, assuming an even spread |
| 08 | trap | A wide class has the lowest bar. Does it hold the fewest values? | Not necessarily — frequency = height × width |

**Why it is exclusive.** Quizlet CCEA sets are user-made, 9-1-labelled and unverified (04 §2.20, 05 §2.13); no product schedules retrieval against CCEA paper dates. **Covers:** `GM-M4-HD-2`.

### Product 7 — Examiner-Insight Coaching Cards (structured Chief Examiner reports)

**What it is.** A per-topic card distilled (in our own words, cited to the report URL, series, unit and question) from every Chief Examiner report 2023–Nov 2025 for Maths (01 §9), 2018–2025 for Further Maths (02 §8) and 2022–Mar 2026 for Science (03 §7): *what was asked*, *what went wrong*, *what full-mark answers did*, *the rule to remember*. The cards also generate the distractor tags for Product 2 and the source list for Product 5.

**Worked example — `ins.maths.m4.histograms`**

- **S2025 M4 Q22** — (a) draw on blank grid: many scored zero for using frequency as height, or for missing scale/label; (b) median from the histogram: failed by "the vast majority"; (c) stratified sampling often blank (01 §9.1).
- **Nov 2025 M4 Q23** — frequency-density scale, median, stratified sampling: "top only" (01 §9.4).
- **S2024 M4 Q21(b)** — reverse reading: "all or nothing" (01 §9.2).
- **S2023 M4 Q21(b)** — median from a histogram again among the hardest (01 §9.3).
- **Rule to remember:** label *Frequency density*; frequency = area; the median is half the *area*, interpolated inside its class; never the class midpoint; never the middle of the axis.
- **A\* signal:** this question type sits in the last third of M4 where the grade-a raw boundary is 45/100 (01 §2.3) — full marks here are worth ~3–4 UMS points.

**Why it is exclusive.** Reports are narrative PDFs nobody has structured (03 §10). **Covers:** `GM-M4-HD-2`, `GM-M4-HD-1` (stratified sampling).

### Product 8 — Physics Equation-Recall Trainer

**What it is.** The full list of equations CCEA Double Award physics students must recall (03 §5.9 — none are given in the exam) as a deck with four drill modes: *recall the equation* (from the quantity names), *units*, *rearrange*, *substitute with a unit conversion*; plus the two examiner rules baked into feedback: "show the equation before substituting" and "a wrong physics equation leading to a correct numerical answer will lead to no marks" (03 §7.1, March 2026 report).

**Worked example — `eq.science.p1.kinetic-energy`** (spec `DA-P1-1.4.17`, tier F per the JSON)

```json
{
  "id": "eq.science.p1.kinetic-energy",
  "specRefs": ["DA-P1-1.4.17"],
  "latex": "E_k = \\tfrac{1}{2} m v^{2}",
  "words": "kinetic energy = ½ × mass × speed²",
  "symbols": [{"sym":"E_k","quantity":"kinetic energy","unit":"J"},{"sym":"m","quantity":"mass","unit":"kg"},{"sym":"v","quantity":"speed","unit":"m/s"}],
  "rearrangements": ["m = 2E_k / v^2", "v = \\sqrt{2E_k / m}"],
  "conversions": [{"from":"g","to":"kg","factor":0.001,"examinerNote":"S2025 P1 HT: KE unit conversions g → kg lost marks (03 §7.4)"}],
  "givenInExam": false,
  "constants": [{"sym":"g","value":10,"unit":"N/kg","note":"spec uses g = 10 (03 §5.5 1.2.8)"}],
  "drills": ["recall","units","rearrange","substitute-convert"]
}
```

Substitute-convert drill item: "A 250 g ball moves at 12 m/s. Calculate its kinetic energy." Marking points: equation stated `E_k = ½mv²` [1]; mass converted 0.25 kg [1]; `½ × 0.25 × 12² = 18 J` [1]. Feedback if the student writes `E = mv²`: "Zero marks — wrong physics equation, even if the number were right (03 §7.1)."

**Why it is exclusive.** 03 §10 gap 1: no CCEA-branded equation practice tool. **Covers:** all "recall and use" equation LOs in P1 and P2 (`DA-P1-1.1.1`, `1.1.3`, `1.1.4`, `1.2.7`, `1.2.9`, `1.2.12`, `1.2.15`, `1.2.17`, `1.3.4`, `1.4.11`, `1.4.13`, `1.4.15`, `1.4.17`, `1.4.18`; `DA-P2-2.1.4`, `2.1.5`, `2.3.6`, `2.3.8`, `2.3.12`–`2.3.14`, `2.3.18`, `2.3.20`, `2.3.25`) — the exact list is generated from the JSON by matching LO text for "recall and use".

### Product 9 — Booklet B Practical-Theory Trainer (18 prescribed practicals)

**What it is.** One module per prescribed practical (`DA-PRAC-B1…P6`): method card, 2-D labelled apparatus diagram in the style examiners accept (no 3-D, no four-legged tripods, no blocked tubes, 03 §7.1), variables (independent/dependent/control), hypothesis, risk, results-table design (headings with units), graph rules (axes labelled with units, best-fit line or curve, "related but not proportional"), reliability vs accuracy vs validity, anomalies, improvements, the calculations the practical carries; then Booklet-B-style items (30-minute paper feel, 35 marks HT, 03 §2) and a Booklet A checklist. Item types are catalogued in §6.6.

**Worked example — `prac.science.c5.hydrated-crystals`** (`DA-PRAC-C5`, spec `DA-C2-2.6.1`–`2.6.4`)

- Method card: weigh crucible + lid; add ~2.5 g hydrated copper(II) sulfate; heat gently, then strongly; cool; reweigh; repeat until constant mass ("heat to constant mass" = until two successive masses agree).
- Apparatus diagram: crucible with lid on pipe-clay triangle, tripod (two legs visible), Bunsen; labelled.
- Observations vocabulary: blue crystals → white powder (not "cloudy"; 03 §7.3 Booklet A 2025).
- Booklet-B item (7 marks): "A student heated 2.50 g of hydrated copper(II) sulfate, CuSO₄·xH₂O, to constant mass and obtained 1.60 g of the anhydrous solid. (a) State what is meant by heating to constant mass. [1] (b) Calculate the mass of water removed. [1] (c) Calculate the number of moles of water removed. [1] (d) Use the Data Leaflet to calculate the relative formula mass of anhydrous CuSO₄. [1] (e) Calculate x. [2] (f) Give one reason why the value of x found experimentally may be lower than expected. [1]"
- Marking points: (a) heating and reweighing until the mass no longer changes [1]; (b) 0.90 g [1]; (c) 0.90 ÷ 18 = 0.05 [1]; (d) 63.5 + 32 + 64 = 159.5 [1]; (e) 1.60 ÷ 159.5 = 0.0100 mol [1], x = 0.05 ÷ 0.0100 = 5 (accept 4.98–5.0) [1]; (f) not heated to constant mass / water not fully removed [1]. Examiner notes attached: "mass of water → moles of water" and "Mr of hydrated CuSO₄" were weak in S2025 Booklet B Chemistry (03 §7.3).

**Why it is exclusive.** 05 §4 gap 2: Unit 7 is "unserved apart from Bitesize's 18 prescribed-practical pages and CCEA's PDF Practical Manual". **Covers:** `DA-PRAC-*`, `DA-U7-*` skills, and the LOs each practical is attached to via `outcome.practical` in the JSON.

### Product 10 — Chemistry Data-Leaflet and Equations Drill

**What it is.** Drills for the things the C1/C2 examiners flag every series (03 §7.3): writing formulae, balancing, ionic and half equations, state symbols, case-sensitive symbols, diatomic elements, Mr and % by mass from the Data Leaflet, moles ↔ mass, reacting masses and limiting reactant, concentration, % yield, atom economy, degree of hydration, plus the observation-phrasing bank ("colourless solution forms", "effervescence", "red-brown gas at the anode").

**Worked example — `q.science.c1.reacting-masses.0003`** (`DA-C1-1.7.4`, `1.7.5`; Data Leaflet allowed)

> Magnesium burns in oxygen: 2Mg + O₂ → 2MgO. Calculate the mass of magnesium oxide formed when 6.0 g of magnesium burns completely. [3]

Marking points: moles Mg = 6.0 ÷ 24 = 0.25 [1]; ratio Mg : MgO = 1 : 1 so 0.25 mol MgO [1]; mass = 0.25 × 40 = 10.0 g [1]. Common-error feedback: using 12 (atomic number) for Ar → "Use the Data Leaflet: the larger number is the relative atomic mass"; forgetting O₂ is diatomic in balancing drills (03 §7.3 C2 F 2025).

**Why it is exclusive.** No CCEA-specific drill exists; England-board tools use different equations lists and no Data Leaflet. **Covers:** `DA-C1-1.5.*`, `DA-C1-1.7.*`, `DA-C2-2.6.*`, `DA-C2-2.7.3`.

### Product 11 — QWC 6-mark Answer Builder

**What it is.** For each of the QWC question sites (one 6-mark question in every science paper and every Booklet B, 03 §2), a builder that shows the band descriptors, an indicative-content checklist, a model Band-A answer in our words, a Band-B answer to upgrade, and a self-marking rubric (06 §15: self-grading *g* = 0.34 with rubrics). Fades from model → scaffold → blank.

**Worked example — `qwc.science.p1.nuclear-fusion`** (`DA-P1-1.5.20`–`1.5.23`; flagged in S2025 P1 F and H, 03 §7.4)

Indicative content checklist: *nuclei* (not atoms) of hydrogen isotopes (deuterium, tritium) join to form a larger nucleus (helium); needs very high temperature and pressure; releases very large energy; helium is the by-product (not "energy"); fuel obtainable from seawater; difficulties: containing the plasma, cost, technology. Common losses: fission confusion; "atoms" instead of nuclei; energy given as the by-product. Bands as in §6.5.

**Why it is exclusive.** Bitesize's quizzes are AQA-shaped (05 §1.3); no CCEA QWC coaching exists. **Covers:** each QWC-bearing section, starting with those examiners flagged (fusion; aerobic respiration B1 F; aluminium extraction C2 F; stars P2 F; fieldwork Booklet B Biology; 03 §7).

### Product 12 — Further Maths Interactive Modules (Units 1–3)

**What it is.** The first interactive practice for GCSE Further Mathematics: per unit, the examiner-ranked hard topics (02 §8) become interactive drills with the M/W mark language (02 §7) and the "method-locked" rules ("hence", "use matrices", no calculator-only answers; 02 §9 item 2).

**Worked example — `fm.u2.force-diagrams` interactive checker** (`FM-U2-FOR-2`, `FM-U2-NEW-3`; top-ranked Mechanics failure every year, 02 §8.2)

A JSXGraph scene (uniform rod on two supports; particle on a smooth plane at 30°; two connected particles over a pulley) where the student places labelled force arrows by tap (WCAG 2.5.7 alternative to drag, 07 §4). The checker awards the diagram mark only when: weight acts at the rod's centre and is labelled *mg* or a value in N (not the mass); normal reaction is perpendicular to the surface; no extra reactions at rod ends; friction (when given) opposes motion; tensions on one string carry the same label; and, for the pulley part, the force on the pulley is the resultant of the two tensions (2T for vertical strings — "the least well-answered question on the paper" in 2025, 02 §8.2). Feedback speaks M/W: "M1 for a complete, correctly labelled diagram; W marks follow only from a correct diagram."

Companion Unit 3 example — conditional probability from a two-way table (`FM-U3-PROB-2`, top discriminator every year, 02 §8.3): the drill forces the denominator choice first ("Given *B*: which total do you divide by?") before the numerator.

**Why it is exclusive.** 04 §2.20 and 02 §7: only PDFs, one paid course (NI Maths Tutor), and a removed YouTube playlist exist. **Covers:** Unit 1 top-8 (algebraic fractions, tangents/normals, log laws, optimisation, forming three equations, integrating a gradient function, trig graphs/equations, completing the square "hence"); Unit 2 top-5; Unit 3 top-6.

### Product 13 — Grade, UMS and Series Data Pack (A\* map + exam map)

**What it is.** Data files (not prose) that power the calculator and the personal exam map: fixed unit UMS boundaries (01 §2.2), per-series raw boundaries (01 §2.3, 02 §2), subject-level boundaries with A\* per series (09 §2.3), Double Award 600-UMS ladder (05 §0, 09 §2.3), the timetable rows for Nov 2026, Mar 2027, Summer 2027 (01 §6, 02 §6, 03 §6, 09 §6), and the rules (40% terminal, one resit before cash-in, November 2027 resit-only, March 2028 no science; 01 §1, 03 §2, 09 §9.1).

**Worked example.** M4 Summer 2025: raw 45 → 144 UMS (grade a), 37 → 132 (b); the calculator interpolates linearly between published boundary points, so raw 41 → 138 UMS. A\* is displayed as a band, "393–394 of 400 in the last two series — in practice near-maximum UMS on both M4 and M8" (09 §2.3), never as a fixed percentage. Exam map for a pupil sitting M4 on Fri 14 May 2027 and M8 on Thu 27 May 2027 shows the two dates, the P1/P2 split (non-calc 9.15, calc 10.45), and the resit rule.

**Why it is exclusive.** 04 §2.2, 05 §4 gap 4, 09 §7.1. **Covers:** none (cross-cutting data).

### Product 14 — Past-Paper Question Index (metadata + deep links + our solutions)

**What it is.** For every question in every cleared CCEA paper (feeds 504/507/584, 08 §3): paper, question, part, marks, calculator flag, tier, AO, topic ids, difficulty, and a deep link to the official PDF with `#page=N`, plus our own worked solution and (where one exists) the NI Maths Tutor video solution embedded with credit. No CCEA text is stored or displayed (08 §5.6, §11).

**Worked example — record for M4 Summer 2025 Q22** (values other than the citation are entered at tagging time from the PDF):

```json
{
  "id": "pp.504.2025-summer.M4.22",
  "paper": {"feedId":"504","series":"Summer","year":2025,"unit":"M4","tier":"H","calculator":true},
  "question": 22, "parts": ["a","b","c"],
  "marks": null, "pdfPage": null,
  "topics": ["maths.m4.histograms","maths.m4.stratified-sampling"],
  "specRefs": ["GM-M4-HD-2","GM-M4-HD-1"],
  "links": {
    "paper": "https://ccea.org.uk/downloads/docs/Past-Papers/cleared/GCSE/GCSE%20Mathematics%20%282017%29/2025-Summer/Standard/0/GCSE-Mathematics%20-504-Summer2025-Higher%20Tier%2C%20M4%20%28With%20calculator%29-Paper.pdf",
    "markScheme": "https://ccea.org.uk/downloads/docs/Past-Papers/cleared/GCSE/GCSE%20Mathematics%20%282017%29/2025-Summer/Standard/0/GCSE-Mathematics%20-504-Summer2025-Higher%20Tier%2C%20M4%20%28With%20calculator%29-MS.pdf",
    "videoSolution": {"kind":"youtube","channel":"N.I. Maths Tutor","playlistId":"PL4Lq_36vZOItjBiUKlftTV3lVtwnjNh59","videoId":"Fx6KtsT0Or8"}
  },
  "examinerReport": "ccea-cer:maths:2025-summer:M4:Q22",
  "ourSolution": "sol.pp.504.2025-summer.M4.22",
  "linkHealth": {"checkedAt":"2026-09-02","status":"ok"}
}
```

**Why it is exclusive.** 08 §8 conclusion: "no third party publishes a CCEA past-paper question bank sorted by topic". **Covers:** everything, by tagging.

### Product 15 — Mixed-Practice Sets, SSDD sets and Paper-format Mocks

**What it is.** Assembled from the bank: interleaved sets with no topic labels (06 §5), "same surface, different deep" sets built on one diagram, and mocks that mirror each paper's format and tariff (M4: 100 marks/2 h; M8 P1 50 marks non-calculator/1 h 15; P2 50 marks calculator; FM Unit 1 100/2 h; DAS B1 HT 70/1 h; Booklet B 35/30 min — 01 §2, 02 §2, 03 §2), with student self-marking against the mark scheme before the system marks.

**Worked example — SSDD set `set.maths.m3m4.trapezium`:** one trapezium with sides 8, 14, slant 10, height h → (i) area (M2), (ii) find h by Pythagoras then perimeter (M2/M3), (iii) the trapezium is the cross-section of a prism of volume 1,320 cm³: find its length (M2), (iv) a similar trapezium has area 4× — find the scale factor (M7), (v) form and solve a quadratic if the parallel sides are x and x + 6 with area 60 (M4 "setting up quadratics from geometry", the hardest M4 type, 01 §9.5). Mock composition rule: strand and AO weights follow the Breakdown of Assessment Objectives grid (01 §3).

**Why it is exclusive.** Only Corbettmaths Set A/B and On Target's paid PDFs exist as CCEA-format practice; neither is interactive or self-marked (04 §4.4). **Covers:** cross-topic.

---

## 3. Content schemas

All JSON is validated by Zod 4 schemas (single source of truth; `z.toJSONSchema()` exported for editor validation and for structured AI output — 10 §9). MDX is used only for notes and worked-example prose; everything a marking engine or scheduler consumes is JSON. Types below are TypeScript-flavoured for precision; `?` = optional.

### 3.1 Shared references

```ts
type SpecRef = string;                       // "DA-P1-1.4.17" | "DA-PRAC-C5" | "DA-U7-plan-3" | "GM-M4-HD-2" | "FM-U2-FOR-2"
                                             // validated at build against data/spec/*.json

type Tier = "F" | "H" | "both";
type Subject = "maths" | "further-maths" | "biology" | "chemistry" | "physics";
type Unit = "M1"|"M2"|"M3"|"M4"|"M5"|"M6"|"M7"|"M8"|"FM1"|"FM2"|"FM3"|"FM4"|"B1"|"B2"|"C1"|"C2"|"P1"|"P2"|"U7";
type PaperContext = { unit: Unit; paper?: 1 | 2; calculator: boolean; bookletB?: boolean; dataLeaflet?: boolean };

type ExternalRef =
  | { kind: "corbettmaths"; videos: number[]; videoUrl?: string; practiceUrl?: string; textbookPdf?: string; note?: string }   // numbers from the CCEA checklists/booklets (08 §9, 04 §2.1); URLs resolved from corbettmaths.com/contents; link only, never copy
  | { kind: "corbettmaths-playlist"; playlistId: string }                                                                       // M1–M8 playlist ids listed in 08 (current file) §2
  | { kind: "bitesize"; examSpec?: "zcq8b82" | "zrjj92p"; topicId?: string; articleId?: string; url: string }                   // ids from 05 §1.2; link only
  | { kind: "phet"; sim: string; url: string; licence: "CC BY 4.0 (pre-2026-03-29)" | "CC BY-NC 4.0"; attribution: string }   // 05 §2.11, 10 §12.2
  | { kind: "youtube"; videoId: string; playlistId?: string; channel: string; start?: number; end?: number; credit: string }    // privacy-enhanced embed, facade, no overlays (10 §12.1)
  | { kind: "ccea-doc"; docType: "spec"|"teacher-guidance"|"factfile"|"glossary"|"practical-manual"|"qa-booklet"|"data-leaflet"|"cer"|"pastpaper"|"markscheme"; url: string; page?: number; asOf: string }
  | { kind: "geogebra"; materialId: string; attribution: "Made with GeoGebra®" };                                             // non-commercial use only (07 §6)

type ExaminerSource = `ccea-cer:${"maths"|"further-maths"|"das"}:${string}:${string}:Q${string}`; // e.g. ccea-cer:maths:2025-summer:M4:Q22
```

### 3.2 Teachable topic and Need-to-Know note (MDX frontmatter)

```ts
type Topic = {
  id: string;                      // "maths.m4.histograms"
  title: string; subject: Subject; unit: Unit; tier: Tier;
  specRefs: SpecRef[]; assumes: string[];        // topic ids this one presumes (cumulative units, 01 §5, 04 §5.1)
  strand?: "NA"|"GM"|"HD"|"pure"|"mech"|"stats"|"discrete";
  hardness: "L"|"S"|"H"; examinerFlagged: boolean; examinerSources: ExaminerSource[];
  examWeightHint: string;          // "6–9 marks, late M4"
  order: number;                   // teaching order within the unit
  externalRefs: ExternalRef[];
};

type NoteFrontmatter = {
  id: `note.${string}`; topic: string; title: string; subject: Subject; unit: Unit; tier: Tier;
  specRefs: SpecRef[]; assumes: string[];
  calculator: boolean | "P1-no/P2-yes";
  formulaSheet: { given: string[]; mustKnow: string[] };            // 01 §4, 02 §4.1–4.3; science: always mustKnow (03 §5.9)
  notOnThisSpec: string[];                                            // from Teacher Guidance limits (01 §4, 02 §4)
  hardness: "L"|"S"|"H"; examinerFlagged: boolean;
  externalRefs: ExternalRef[];
  verification: { status: "draft"|"checked"|"verified"|"published"; log: `ver.${string}` };
  version: number; updated: string;
};
```

MDX components available in notes: `<SpecBox ref>`, `<MustKnow>`, `<NotOnThisSpec>`, `<ExaminerSays source>`, `<Prompt id>`, `<WorkedExample id>`, `<Try id>`, `<Diagnostic set>`, `<Figure spec>`, `<Video ref>`, `<Sim ref>`, `<CorbettLink videos>`, `<GlossaryLink term>`. Rule: no more than ~150 words of prose between interactions (07 §7).

### 3.3 Worked examples

```ts
type WorkedExample = {
  id: `we.${string}`; topic: string; specRefs: SpecRef[]; paper: PaperContext;
  stem: string;                                    // MDX/LaTeX
  figure?: FigureSpec;
  steps: Array<{
    n: number; working: string;                    // LaTeX allowed
    decision: string;                              // narrated "I notice… so I…" (06 §12)
    whyMenu?: { options: string[]; correct: number; explain: string };   // menu-based self-explanation (06 §7)
    earns?: MarkCode[];                            // which mark(s) this step secures
  }>;
  finalAnswer: string;
  twin: { stem: string; answer: AnswerSpec; figure?: FigureSpec };       // same structure, new numbers
  faded: Array<{ showSteps: number; studentSupplies: number[] }>;        // backward fading (06 §6)
  clip?: { kind: "manim"|"motion-canvas"; src: string; captions: string; seconds: number };
  verification: VerificationRef;
};
```

### 3.4 Questions, parts, answers, tolerances, mark points

```ts
type Question = {
  id: `q.${string}`; topic: string; specRefs: SpecRef[];
  paper: PaperContext; tier: Tier;
  style: "practice" | "exam-style";                // exam-style = full CCEA layout, tariff and mark scheme
  difficulty: 1|2|3|4|5;                           // 5 = A*/A discriminator (01 §9), or Booklet B "HT only"
  ao: ("AO1"|"AO2"|"AO3")[];                       // 01 §3, 02 §2, 03 §4
  commandWords: string[];                          // from the §6.1 dictionary; validated
  context?: { setting: string; original: true };   // new context, never a CCEA/Corbettmaths one
  figures: FigureSpec[];
  parts: Part[];
  totalMarks: number;                              // must equal sum of parts
  timeAllowanceSec: number;                        // tariff × marks (§6.3)
  resources: ("formula-sheet-H"|"formula-sheet-F"|"data-leaflet"|"normal-table"|"fm-formula-U1"|"fm-formula-U2"|"fm-formula-U3")[];
  examinerSources: ExaminerSource[];               // which report finding this question rehearses
  isomorphOf?: never;                              // deliberately absent: we do not track "based on Qn" because we do not clone (§4 stage 7)
  verification: VerificationRef; version: number;
};

type Part = {
  id: string;                                      // "a", "b(i)"
  stem: string; marks: number;
  answer: AnswerSpec;
  scheme: MarkPoint[];                             // sum of marks == part.marks
  hints: string[];                                 // progressive; hint 3 = first worked step
  workedSolution: string;                          // MDX
  commonErrors: CommonError[];
  requiresWorking: boolean;                        // if true the UI captures working (typed/photo/Excalidraw) before marking
  followThrough?: { fromPart: string; rule: "use-candidate-value" | "use-candidate-diagram" };
};

type Tolerance =
  | { type: "absolute"; value: number }
  | { type: "relative"; value: number }
  | { type: "dp"; places: number }                 // "give your answer to 1 decimal place"
  | { type: "sf"; figures: number }
  | { type: "range"; min: number; max: number }    // e.g. median 13.3–13.4; graph readings ± half a small square
  | { type: "exact" };

type AnswerSpec =
  | { kind: "numeric"; value: number; tolerance: Tolerance; unit?: string; unitRequired: boolean;
      acceptForms: ("decimal"|"fraction"|"mixed"|"surd"|"pi"|"percent"|"standardForm"|"ratio")[]; mustBeSimplified?: boolean;
      moneyFormat?: boolean }                      // "£73.30 never £45.50p" (01 §9.3 general advice)
  | { kind: "algebraic"; latex: string; equivalence: "identical"|"equivalent"|"simplifiedOnly"; variables: string[];
      domain?: string; mustBeFactorised?: boolean; mustBeExpanded?: boolean; keepInequalitySign?: boolean }   // compute-engine isIdenticallyEqual + sampling (10 §10)
  | { kind: "mcq"; options: Array<{ id: string; text: string; correct: boolean; misconception?: string; feedback: string }>; shuffle: boolean }
  | { kind: "text"; accepted: string[]; keyWords: Array<{ any: string[]; marks: number; reject?: string[] }>;
      listingRule: true }                          // science: correct + incorrect listed = 0 (03 §7.1)
  | { kind: "graph"; expect: GraphExpectation }    // see below
  | { kind: "drawing"; rubric: string[]; selfMark: true; aiMark?: boolean }   // constructions, apparatus diagrams, ray diagrams
  | { kind: "table"; cells: Array<{ row: number; col: number; value: number|string; tolerance?: Tolerance }> }
  | { kind: "equation"; kindOf: "word"|"symbol"|"ionic"|"half"|"nuclear"; balancedLatex: string; stateSymbolsRequired: boolean; acceptMultiples: boolean }
  | { kind: "steps"; expectedOrder: string[]; allowSkips: false };          // procedures (constructions with arcs; "show that")

type GraphExpectation =
  | { plot: "histogram"; bars: Array<{ from: number; to: number; frequencyDensity: number }>; axisLabelY: "Frequency density"; scaleTolerance: number }
  | { plot: "points-line"; points: [number, number][]; lineThrough?: [number, number][]; tolerance: Tolerance; lineRequired: boolean }   // "solution without the line drawn = 0" (01 §9.1 M6 Q14)
  | { plot: "curve"; samples: [number, number][]; tolerance: Tolerance; smooth: true; noStraightSegments: true }
  | { plot: "region"; inequalities: string[]; shadeInside: boolean }
  | { plot: "box"; min: number; q1: number; median: number; q3: number; max: number; tolerance: Tolerance }
  | { plot: "transformation"; object: [number, number][]; image: [number, number][] }
  | { plot: "best-fit"; throughMeans?: [number, number]; kind: "line"|"curve"; tolerance: Tolerance };   // FM: line must pass through (x̄, ȳ) (02 §4.3)

type MarkCode = "M" | "A" | "MA" | "W" | "MW" | "B" | "P" | "QWC";   // legal subset selected by the subject's mark-language profile (§6.2)

type MarkPoint = {
  code: MarkCode; marks: number;                   // 1 unless code is QWC (6)
  for: string;                                     // "any one correct frequency density calculated"
  accept?: string[]; reject?: string[]; ignore?: string[];       // science MS conventions
  ft?: boolean;                                    // follow-through from an earlier error
  dependsOn?: string[];                            // ids of mark points that must be earned first (A after M)
  seenIf?: string;                                 // machine check expression, e.g. "working contains 24/4 or 6"
  examinerNote?: string;                           // "15 (midpoint) scores M1 only"
  id: string;
};

type CommonError = {
  misconception: string;                           // tag from the misconception registry (Product 7 output)
  pattern: { kind: "numeric"; value: number; tolerance?: Tolerance } | { kind: "algebraic"; latex: string } | { kind: "text"; regex: string } | { kind: "graph"; test: string };
  feedback: string;                                // examiner language, cites the report
  marksTypicallyEarned: number;
  source?: ExaminerSource;
};

type FigureSpec =
  | { kind: "svg-gen"; generator: "histogram"|"cf-curve"|"box-plot"|"bar"|"pie"|"scatter"|"table"; data: unknown; options?: unknown }
  | { kind: "jsxgraph"; script: string; static: boolean }
  | { kind: "mafs"; component: string; props: unknown }
  | { kind: "svg"; src: string; alt: string }
  | { kind: "photo"; src: string; alt: string; licence: string; credit: string }
  | { kind: "apparatus"; parts: string[]; style: "ccea-2d" };
```

### 3.5 Diagnostics, retrieval prompts, find-the-mistake

```ts
type DiagnosticSet = { id: `dx.${string}`; topic: string; specRefs: SpecRef[]; when: "pre"|"post"|"both"; items: DiagnosticItem[] };
type DiagnosticItem = {
  id: string; stem: string; skill: string;         // exactly one skill/step (06 §9 Barton rules)
  options: Array<{ id: string; text: string; correct: boolean; misconception?: string; feedback: string }>;
  secondsExpected: number;                         // 10–20
  confidence: true;                                // 3-point slider collected
  hypercorrectionQueue: true;                      // confident-wrong → re-probe 1–3 d and ~1 wk (06 §9)
};

type RetrievalPrompt = {
  id: `rp.${string}`; topic: string; specRefs: SpecRef[];
  kind: "qa"|"cloze"|"formula"|"definition"|"procedure"|"trap"|"label-diagram"|"novel-example";
  prompt: string; answer: string;
  keyWords?: string[];                             // for definitions: words the examiner needs (03 §7.1 "verbatim from Glossary") — we write our own sentence containing them and link the Glossary
  image?: FigureSpec;
  examDate?: Unit;                                 // scheduler targets this unit's paper date (07 §2.10 RemNote-style)
  difficultyPrior?: number;                        // seeds FSRS difficulty
  fsrs: { desiredRetention: 0.9; boostFinalWeeks: 0.93 };
};

type FindTheMistake = {
  id: `ftm.${string}`; topic: string; specRefs: SpecRef[];
  stem: string; studentWorking: string[];          // numbered lines
  mistakeLine: number; misconception: string;
  whatWentWrong: string; correction: string[];
  marksEarnedAsWritten: MarkCode[]; feedback: string; source: ExaminerSource;
};
```

### 3.6 Practicals, equations, QWC, examiner insight, data pack

```ts
type Practical = {
  id: `prac.${string}`; code: "B1"|…|"P6"; specRef: `DA-PRAC-${string}`; attachedLOs: SpecRef[];
  title: string;                                   // from prescribedPracticals[].title in the JSON
  method: string[]; apparatus: string[]; apparatusDiagram: FigureSpec;   // style "ccea-2d"
  variables: { independent: string; dependent: string; control: string[] };
  hypothesis: string; risks: Array<{ hazard: string; control: string }>;
  resultsTable: { columns: Array<{ heading: string; unit: string }>; repeats: number };
  graph?: { x: string; y: string; expected: "straight-through-origin"|"straight"|"curve"; note: string };
  calculations: string[];                          // "mean", "gradient = k", "moles of water"…
  vocabulary: Array<{ term: "reliability"|"accuracy"|"validity"|"precision"|"anomalous"|"directly proportional"; ourDefinition: string; keyWords: string[] }>;
  bookletBItems: `q.${string}`[];                  // exam-style items in practical context
  bookletAChecklist: string[];
  examinerSources: ExaminerSource[];
  externalRefs: ExternalRef[];                     // CCEA practical-manual PDF, Bitesize practical page, PhET
};

type PhysicsEquation = { id: `eq.${string}`; specRefs: SpecRef[]; latex: string; words: string; symbols: Array<{ sym: string; quantity: string; unit: string }>;
  rearrangements: string[]; conversions: Array<{ from: string; to: string; factor: number; examinerNote?: string }>;
  givenInExam: false; constants?: Array<{ sym: string; value: number; unit: string; note: string }>; drills: string[] };

type QwcItem = { id: `qwc.${string}`; specRefs: SpecRef[]; unit: Unit; tier: Tier; stem: string;
  indicativeContent: Array<{ point: string; keyWords: string[]; commonLoss?: string }>;
  bands: Array<{ band: "A"|"B"|"C"|"0"; marks: [number, number]; descriptor: string }>;   // §6.5
  modelAnswerBandA: string; upgradeMeBandB: string; selfMarkRubric: string[]; examinerSources: ExaminerSource[] };

type ExaminerInsight = { id: `ins.${string}`; topic: string; specRefs: SpecRef[];
  findings: Array<{ source: ExaminerSource; url: string; asked: string; wentWrong: string; fullMarkAnswersDid?: string; rule: string; misconceptions: string[] }>;
  ruleToRemember: string; aStarSignal?: string };

type DataPack = {
  umsUnitBoundaries: Record<Unit, Record<"a"|"b"|"c*"|"c"|"d"|"e"|"f"|"g", number>>;    // fixed (01 §2.2, 02 §2)
  rawBoundaries: Array<{ unit: Unit; series: string; grades: Record<string, number>; source: string }>;   // per series (01 §2.3, 02 §2)
  subjectBoundaries: Array<{ qual: "G9602"|"G2337"|"G9824"; series: string; aStar: number|string; a: number; b: number; cStar: number; c: number }>;
  timetable: Array<{ series: string; unit: Unit; date: string; session: string; time?: string; source: string; version: string }>;
  rules: Array<{ id: string; text: string; appliesFrom?: string; source: string }>;
  asOf: string;
};
```

### 3.7 Verification log (the trust layer; see §10)

```ts
type VerificationRef = `ver.${string}`;
type VerificationLog = {
  id: VerificationRef; itemId: string; version: number;
  checks: Array<{
    type: "schema"|"scope-tier"|"formula-sheet"|"command-words"|"tariff"|"maths-numeric"|"maths-symbolic"|"independent-solve"|"units-dimensions"|"chem-balance"|"examiner-alignment"|"copy-shingle"|"isomorph"|"style-lint"|"katex-compile"|"link-health"|"human-spot";
    tool: string; result: "pass"|"fail"|"waived"; detail?: string; at: string; by: "pipeline"|"claude"|"brother"|"teacher";
  }>;
  status: "draft"|"checked"|"verified"|"published"|"withdrawn";
  reports: Array<{ at: string; by: "sister"|"brother"; text: string; resolvedAt?: string; resolution?: string }>;
};
```

---

## 4. The authoring pipeline

Principle: the model drafts, machines verify what machines can verify, a human checks what only a human can, and every item carries its log. Inputs to the model are *our* structured data (spec statement text and id, Teacher Guidance scope notes summarised in our words, examiner-insight card, product bundle spec, style guide, schema); CCEA question papers, mark schemes and Corbettmaths PDFs are **never** put in a drafting context — they are only used by the copy checker (stage 7) as a reference corpus.

### Stage 0 — Taxonomy row
Input: one teachable topic from `data/spec/*.json` (science) or the parallel maths/FM taxonomy: statement ids, exact statement text, tier flags (`tier`, `mixed`, `textMarked` for science; the JSON gives 23 partly-Higher items — a Foundation build drops only the marked phrase, `data/spec/README.md`), attached practical, assumed prior topics, examiner-insight card (Product 7), bundle size (L/S/H).
Gate G0: the row is complete (statement text, tier, bundle size, examiner sources present or explicitly "none").

### Stage 1 — Outline
Prompt (system): "You are a CCEA GCSE [subject] senior examiner and a CGP-calibre editor. Produce an outline JSON for the note and item bundle. Rules: use CCEA unit codes and letter grades only; list what is on the formula sheet vs must be memorised; list scope limits; choose original contexts; map every examiner finding to at least one diagnostic distractor, one find-the-mistake item and one exam-style part; state the intended tariff per exam-style part; do not reproduce any CCEA or Corbettmaths wording."
Output: outline conforming to `OutlineSchema` (sections, item list with skills, contexts, tariffs, examiner mapping table).
Human: brother approves or edits the outline (≈2 min). Gate G1: every examiner finding is mapped; tariffs sum to plausible paper values; contexts are new.

### Stage 2 — Draft
One call per artefact type with structured output against the Zod JSON Schema (10 §9, §13): note MDX; worked examples; diagnostics; questions with mark schemes; find-the-mistake; prompts. Drafting rules in the system prompt (the style guide, §4.9): British English; "sulfur"; letter grades; "Frequency density"; money to 2 d.p.; units on answer lines; calculator flag respected (non-calculator items must have hand-doable numbers); science definitions must contain the glossary key words (rewritten in our words); science items obey the listing rule; physics items require the equation line; chemistry items state Data Leaflet use; FM items follow the 2 d.p. default and "show full working" rules (02 §2).
For every numeric/algebraic part the model must also emit a **solution program**: a small JavaScript expression list (mathjs/compute-engine) that recomputes the answer from the stem's numbers. This is what stage 5 executes.

### Stage 3 — Self-check against spec and Teacher Guidance
A second model pass (critic) with a rubric returning pass/fail per line:
1. Every skill tested is inside the statement(s) and tier; nothing from "not on this spec" (e.g. completing the square in M4, ambiguous sine rule in M8, fractional indices in FM differentiation, P(a<z<b) in FM Unit 3; 01 §4, 02 §4).
2. Formula-sheet claims match 01 §4 / 02 §4.1–4.3 / science "none given".
3. Command words are from the dictionary (§6.1) and match the demanded response.
4. Tariff ≈ number of credited steps; A marks depend on M marks; ft flags present where CCEA would ft.
5. Each distractor is a *named* misconception with feedback; single-skill; unambiguous; not gettable for the wrong reason (06 §9).
6. Calculator status plausible; numbers realistic (probabilities ≤ 1, means inside data, estimates below population — 01 §9.3 general advice).
7. Prose length between interactions ≤ 150 words.
Gate G2: schema valid and critic pass on all lines (fails loop back to stage 2 with the critic's notes, max 2 loops, then human).

### Stage 4 — Examiner-report alignment
Automatic: intersect the item bundle's `misconception` and `examinerSources` tags with the insight card. Gate G3: every finding on the card is exercised by ≥1 diagnostic distractor, ≥1 find-the-mistake item and ≥1 exam-style part (H bundles: ≥2 each). The card itself is built once per topic by a separate extraction pass over the CER text we hold locally (`docs/sources/maths/CER-*.txt` etc.), in our own words, with the report URL, series, unit, question; the brother reads each card once (Phase 0: ~40 cards).

### Stage 5 — Maths and science verification
- **Numeric:** execute the solution program with mathjs; compare with the declared answer under the declared tolerance; also recompute from an *independent* solve by a second model instance that sees only the stem (blind to the answer) and must output a number; disagreement → fail.
- **Algebraic:** compute-engine `isIdenticallyEqual` on declared vs independently derived expressions, then numeric sampling at 12 rational points inside the domain (10 §10.3) — this is the same engine the marker uses, so the check doubles as a test that the marker will accept the intended answer.
- **Mark scheme arithmetic:** part marks sum to the part total; `dependsOn` chains are acyclic; ft targets exist.
- **Graph items:** the generator renders the figure from data and the expected `GraphExpectation` is derived from the *same* data (no hand-typed bar heights).
- **Science:** unit/dimension check on every equation item (mathjs units); chemistry equations balanced by a small element-count script; physics equation strings must match an entry in the equation registry (Product 8) — a "recall and use" equation the spec does not list is a fail; Data Leaflet Ar values come from our `data/exam-true/periodic-table.json` **[confirm values from the Data Leaflet PDF]**.
- **FM:** g = 10 enforced in mechanics; 2 d.p. default in answers; normal-table lookups recomputed.
Gate G4: zero discrepancies (no tolerance for "close").

### Stage 6 — Style lint
Deterministic: KaTeX compiles with `strict: 'warn'` and no errors; banned strings ("grade 9", "Paper 1 / Paper 2" in science, "AQA", "required practical", "elastic limit" where "limit of proportionality" is meant — 03 §7.4); required strings present (axis labels, units); sentence length ≤ 25 words average; reading age ≈ 14; British spellings; `£` formatting; `%` and `°` spacing; ids unique; every `<Prompt>` referenced exists.
Gate G5: lint clean.

### Stage 7 — Copy and isomorph check (the no-copy guarantee)
- **Shingle check:** every drafted text field is compared against a private, non-served reference corpus: extracted text of all cleared CCEA papers and mark schemes we downloaded (feeds 504/507/584), the specs, Teacher Guidance, fact files, glossaries, Q&A booklets, CERs, and Corbettmaths PDFs (booklets, practice papers, textbook exercises) — kept only in the build pipeline, never in `out/` (08 §11 step 1). Any 8-word (maths) / 10-word (science prose) shingle match that is not a spec statement quotation inside `<SpecBox>` fails the item.
- **Isomorph check:** for exam-style items, an embedding-similarity screen against the CCEA question index (Product 14 metadata plus our private extracted text) flags items whose structure and numbers merely re-skin a specific past question; the critic must confirm the context, numbers *and* part structure are new. Style, layout, tariff and command words are deliberately similar; wording, contexts, numbers and diagrams are ours (08 §11 step 5).
- **Provenance rule:** the drafting prompts never contain CCEA question text or Corbettmaths text, so the model cannot "quote" it; this is enforced by the pipeline code, not by instruction.
- **Definitions:** science definitions are rewritten to contain the key words with a `<GlossaryLink>` to the official glossary PDF; the glossary sentence itself is not reproduced.
Gate G6: shingle and isomorph pass.

### Stage 8 — Human spot-check
Phase 0: the brother reads 100% of notes and exam-style questions with mark schemes (checklist: reads like a CCEA question; tariff feels right; the mark scheme would be usable by a marker; the trap list is true to the report; nothing embarrassing). Later: 100% of exam-style items and insight cards, 30% random sample of practice/diagnostic/prompt items, 100% of anything the sister reports. If an NI teacher volunteer is found, they review H-bundle exam-style questions only (highest value per hour). Gate G7: signed off, `status: verified`.

### Stage 9 — Publish with log
`status: published`, log rendered in the UI as a "Checked" panel (§10). Every later edit bumps `version` and re-runs stages 3–7 automatically.

### Stage 10 — Feedback loop
"Something wrong?" on every item → report stored in the log; brother triages within 48 h; a confirmed error withdraws the item from the scheduler until fixed and adds a regression case to the golden test corpus (10 §14).

### Throughput and quality economics

| Bundle | Model wall-clock (draft + critic + verify loops) | Human time | Total developer time |
|---|---|---|---|
| L (note + 5 dx + 6 rp) | ~8 min | ~15 min | ~25 min |
| S | ~20 min | ~35 min | ~1 h |
| H | ~45 min | ~80 min | ~2–2.5 h |
| Practical module | ~25 min | ~40 min | ~1 h |
| Insight card (per topic) | ~5 min extraction | ~5 min read | ~10 min |

Expected first-pass failure rates (plan for them): maths verification fail ≈ 15–25% of drafted parts (mostly tolerance/format, some genuine errors); critic scope fails ≈ 10%; copy/isomorph flags ≈ 5% of exam-style items. Two automatic loops resolve most; the rest go to the human with the failure attached.

### Prompt/rubric library (files to create under `pipeline/prompts/`)
`system.maths-examiner.md`, `system.science-examiner.md`, `system.fm-examiner.md`, `outline.md`, `draft.note.md`, `draft.questions.md`, `draft.diagnostics.md`, `draft.prompts.md`, `draft.ftm.md`, `critic.scope-tier.md`, `critic.markscheme.md`, `critic.distractors.md`, `extract.cer-insights.md`, `style-guide.md`, `mark-language.<subject>.md`. Each prompt embeds the relevant §6 tables verbatim so the exam-true layer is the single source for both authoring and feedback.

---

## 5. Coverage plan and volumes

### 5.1 Units, topics and bundle sizes

Teachable-topic counts are estimates from the spec sections (01 §5, 02 §4, 03 §5, `data/spec/README.md` counts); "hard" = examiner-flagged topics that get H bundles (01 §9.5, 02 §8, 03 §7).

| Unit (weight) | Topics | Hard | Bundle plan | Items (approx.) |
|---|---|---|---|---|
| **M4** (45% of Maths) | 10 | 6 | H×6, S×4 | ~360 |
| **M8** (55%) | 20 | 10 | H×10, S×10 | ~680 |
| M3 (assumed by M4) | 22 | 8 | H×8 (setting up quadratics, algebraic fractions, CF/box plots, arc/sector/cylinder, line through two points, trig, reverse %, pressure), S×14 | ~690 |
| M7 (assumed by M8) | 16 | 6 | H×6 (standard form, indices, subject twice, combined transformations, similar shapes, simultaneous), S×10 | ~500 |
| M1 / M2 (Foundation first) | 45 / 22 | 10 / 8 | L first, then S; H for the ten Foundation killers (equations with brackets, volume/capacity, Pythagoras in context, percentages/fractions of amounts, adding fractions, compound areas/circles, parallel-line angles, grouped mean/Venn, average speed, compound interest — 01 §9.5) | ~1,100 |
| M5 / M6 (Foundation completion) | 18 / 16 | 6 / 6 | L first, then S; H for ratio (non-share), map scales, non-calc %, constructions/loci & describing transformations, conversion/distance–time graphs, bounds/polygon angles, inequalities/graphical simultaneous, probability tables | ~800 |
| FM Unit 1 (50%) | 20 | 10 | H×10 (02 §8.1 ranks 1–10), S×10 | ~680 |
| FM Unit 2 | 10 | 5 | H×5 (force diagrams, pulley 2T, i–j equations, inclined planes, moments), S×5 | ~340 |
| FM Unit 3 | 10 | 6 | H×6 (conditional probability, pooled SD, linear transformation, Σfx², binomial "at least", normal tails), S×4 | ~360 |
| FM Unit 4 | 8 | 0 | L only, Phase 3+ (tiny uptake, 02 §3) | ~100 |
| B1 (11%) | 20 | 5 | S, H for nitrogen cycle/eutrophication, active transport, potometer-adjacent leaf/gas exchange, enzymes, aerobic respiration QWC | ~700 |
| B2 (14%) | 22 | 6 | S, H for meiosis/independent assortment & genetic diagrams, transpiration/potometer, immune response, DNA/base %, restriction enzymes, natural selection | ~790 |
| C1 (11%) | 22 | 8 | S, H for formulae & balanced/ionic/half equations, atomic structure definitions, bonding/structure explanations (NaCl m.p., conduction), periodic table trends & observations, moles/reacting masses/yield, acids–bases–salts, chromatography (Rf, solvent front), flame tests | ~880 |
| C2 (14%) | 20 | 8 | S, H for organic (naming, structures, general formulae, addition/polymers), redox/half equations, electrolysis (products, half equations, Al extraction QWC), rates (curves, collision language), equilibrium, quantitative (hydrates, concentration), energy profiles/bond energies, gas prep apparatus | ~830 |
| P1 (11%) | 22 | 6 | S, H for definitions (mass, power, Hooke's law), Newton II with weight, KE/GPE conversions, moments & c.o.g., half-life/decay equations, fusion QWC | ~700 |
| P2 (14%) | 22 | 7 | S, H for lens ray diagrams & refraction through prisms, filament lamp explanation, parallel resistors & fuses/plug, a.c./d.c. and CRO, electromagnet factors, stars/CMBR QWC, wave calculations with unit conversions | ~750 |
| Unit 7 (25%) | 18 practicals + skills | 18 | practical module ×18 + Booklet-B item bank ×~120 + Booklet A checklists | ~480 |
| Cross-cutting | Physics equations (~25), chemistry equations bank, QWC items (~14 sites), SSDD sets (~20), mocks (~14 papers) | | | ~400 |

**Total ≈ 12,000 items** (notes ≈ 330; exam-style questions ≈ 1,100; diagnostics ≈ 2,000; practice ≈ 3,400; prompts ≈ 3,300; find-the-mistake ≈ 550; worked examples ≈ 800; practicals 18; the rest data). At the §4 rates that is ≈ 550–600 developer hours — feasible over the school year at 12–15 h/week **only if** the order below is respected and Foundation-only units start as L bundles.

### 5.2 Order by exam date, then by examiner-reported difficulty

Dates from 01 §6, 02 §6, 03 §6, 09 §6. The sister's actual entry pattern must be confirmed with her school (09 §7.3: parents "confused about which tests their child will be sitting"); the plan handles both common patterns.

| Window | Paper dates | Content that must be complete |
|---|---|---|
| **Now → 9 Nov 2026** | DAS B1 Mon 9 Nov, C1 Tue 10 Nov, P1 Wed 11 Nov 2026 (if entered); M1–M4 **Tue 17 Nov 2026** (last November open to first-time entries); M5–M8 Thu 19 Nov | M4 (all, H-weighted); M3 assumed-content L→S; P1 equations; B1/C1/P1 L bundles + hard-topic H bundles; QWC builders for B1/C1/P1 |
| Nov 2026 → 22 Feb 2027 | DAS Unit 1s Mon 22 / Wed 24 / Fri 26 Feb 2027 (last March series with science) | Finish B1/C1/P1 to S; Booklet-B-lite for Unit-1 practicals (B1–B4, C1–C2, P1–P4); M8 H bundles begin; FM Unit 1 H bundles |
| Feb → 11 May 2027 | B1 Tue 11 May; **M4 Fri 14 May**; C1 Mon 17 May; FM U1 Tue 18 May; P1 Tue 25 May; **M8 Thu 27 May** | M8 complete; M7 assumed content; M4 mocks; FM Unit 1 complete; DAS Unit 1 mocks |
| May → 15 June 2027 | B2 + Booklet B Wed 2 Jun; FM U2 Fri 4 Jun; C2 + Booklet B Thu 10 Jun; P2 + Booklet B Mon 14 Jun; FM U3 Tue 15 Jun | B2/C2/P2 complete; all 18 practical modules; FM Units 2–3; Booklet B mocks |
| Summer 2027 → Summer 2028 | If she is Year 11 now: M8 in Summer 2028 (Nov 2027 is resit-only), DAS Unit 2s and Booklet B Summer 2028 | Foundation units to S (for completeness and for any tier change), FM Unit 4 L, bridging content |

Within each window, hard topics are authored first and get 2–3× the items (H vs S above), because the raw grade-a boundaries (M4 45/100, M8 40–49/100; 01 §2.3) mean the A/A\* is decided on exactly the questions examiners report as worst answered.

### 5.3 Phase 0 (2–16 September 2026) — explicit subset

Rationale: M4 is 45% of her Maths grade and its first sitting is either 17 Nov 2026 or 14 May 2027; both are served by finishing M4 first. Physics equations and the data pack are cheap and immediately useful. One science topic and one practical module prove the science formats end-to-end.

| # | Deliverable | Bundle | Why now |
|---|---|---|---|
| 1 | `maths.m4.histograms` (this document's exemplar) | H | Examiner-flagged every series; proves Products 1–7 |
| 2 | `maths.m4.algebraic-fractions-add-subtract` and `maths.m4.equations-with-algebraic-fractions` | H, H | "only a small number full marks"; 5% and 18% full marks (01 §9.1, §9.4) |
| 3 | `maths.m4.quadratics-formula-and-setting-up` (incl. rearranging first; completing the square excluded) | H | Setting up quadratics from geometry: 5–7% full marks (01 §9.2, §9.5) |
| 4 | `maths.m4.circle-theorems` (facts) and `maths.m4.circle-theorem-reasoning` (two-step, key words "opposite", "cyclic") | S, H | 6% full marks (01 §9.2, §9.4) |
| 5 | `maths.m4.bounds-subtract-divide` | H | "45 kg used instead of 47.5"; keep full calculator display (01 §9.1) |
| 6 | `maths.m4.factorise-ax2-bx-c`, `maths.m4.perpendicular-lines`, `maths.m4.frustums-composite-solids`, `maths.m4.stratified-sampling` | S ×4 | Completes M4 |
| 7 | M3 assumed-content prompt deck (60 prompts: reverse %, arc/sector, CF/IQR vocabulary, trig, equation of a line) | L-prompts | M4 assumes M1–M3 (01 §5) |
| 8 | Physics equation trainer, P1 + P2 (~25 equations, 4 drills each) | data | 03 §5.9; no tool exists |
| 9 | `science.p1.kinetic-energy` note + items; `prac.science.p2.hookes-law` module (`DA-PRAC-P2`) with 6 Booklet-B items | S; practical | Proves science formats; Hooke's law definition and spring constant flagged S2025 P1 (03 §7.4) |
| 10 | Exam-true layer v1: command-word dictionary, GCSE Maths mark-language profile, tariff table, Higher formula sheet given/not-given, QWC bands | data | §6 |
| 11 | Data pack v1: Maths unit UMS, S2025/S2026 raw boundaries, A\* band, Nov 2026 & Summer 2027 dates, rules | data | Product 13 |
| 12 | Past-paper index for M4 Summer 2025, Nov 2025, Summer 2024 (tagged, deep-linked, NI Maths Tutor solutions embedded) | data | Product 14; three most recent M4 series |
| 13 | Examiner-insight cards for all 10 M4 topics | 10 cards | Product 7 |
| 14 | Verification logs for everything above, rendered in the UI | | §10 |

Phase 0 content effort ≈ 6 H × 2.5 h + 4 S × 1 h + practical 1 h + equations 4 h + data 4 h + index 3 h + cards 2 h ≈ **35 hours**, alongside the developer's platform work. **Phase 0 switch:** if the school confirms she has already banked M4 (Year 12 on the M8 sitting), swap rows 1–6 for the M8 top-10 (surds, inverse/direct variation, circle equation/tangent, non-right-angled trig multi-step, standard form, negative/fractional indices, subject-twice, combined transformations, similar area/volume ratios, both-multiplied simultaneous equations — 01 §9.5) and keep rows 7–14.

---

## 6. The "exam-true" layer

Everything here is data under `data/exam-true/` and is loaded by both the authoring prompts and the feedback generator, so the same vocabulary is used to write items and to explain marks.

### 6.1 Command words (`command-words.json`)

Each entry: `{ word, subject, meaning, whatEarnsMarks, typicalTariff, trap, examinerEvidence }`. Seed set:

| Command word | Subject | What the examiner expects | Typical tariff | Trap (from reports) |
|---|---|---|---|---|
| Work out / Calculate | Maths, Sci | Numerical working shown; answer on the line with units | 1–4 | "correct answer with no working = 0" on some items (01 §9.4) |
| Write down | Maths | No working needed | 1 | — |
| Estimate | Maths | Round first, then calculate; exact working scores nothing | 2 | "398 × 3.1 done exactly" (01 §9.1) |
| Show that | Maths, FM | Forward reasoning to the given result; working backwards or substituting the answer = 0 | 2–4 | 01 §9.1 Q15(a); 02 §8.2 |
| Prove | Maths (A grade), FM | Complete chain with reasons/algebra | 3–4 | sphere vs cube proof 7% (01 §9.2) |
| Hence | FM, Maths | Use the previous part's method; another valid method scores 0 | — | completing the square "hence" (02 §8.1 rank 8) |
| Use [a matrix method / a scale drawing / your graph] | FM, Maths | Method-locked | — | "algebraic solutions received no marks" (02 §8.1); "Pythagoras gained nothing" (01 §9.2 M7) |
| Form an equation | Maths | The equation must be written, not solved by trial | 1–3 | "1% of candidates" formed it (01 §9.2 M2) |
| Solve | Maths, FM | All solutions; keep inequality signs; indicate final answer | 2–4 | negative root ignored; "the worst solution is marked" (01 §9.1) |
| Simplify / Factorise / Expand | Maths, FM | Final form as demanded ("fully") | 1–3 | left as brackets / set = 0 (01 §9.1) |
| Describe fully (a transformation) | Maths | All details: name + vector / centre & angle & direction / line / centre & scale factor | 2–3 | "only one candidate gained both marks" (01 §9.4) |
| Give a reason / Explain why | Maths | Key mathematical words tied to the data ("range affected by the high maximum"); "Z angles" = 0 | 1–2 | 01 §9.3, §9.4 |
| Draw / Construct | Maths | Ruler, dark pencil, arcs shown, tolerances | 2–3 | one-arc shortcut "will not work in future" (01 §9.4) |
| State / Name / Give | Sci | Recall; listing rule applies | 1 | correct + incorrect listed = 0 (03 §7.1) |
| Describe | Sci | What happens / the trend *with data* | 2–3 | trends not taken from the graph (03 §7.2) |
| Explain | Sci | Cause → effect chain with the spec's key words | 2–3 | "carry charge" not "carry current" (03 §7.3) |
| Compare | Sci | Comparative language, both sides | 2 | "biggest clear area / killed the most" (03 §7.1) |
| Suggest / Evaluate | Sci | Apply knowledge to a new situation; judgement with evidence | 2–3 | osmosis in new situations (03 §7.2) |
| Complete the diagram / Draw a ray | Sci | Arrows, normals, labels | 1–3 | rays bent the wrong way; missing normals (03 §7.4) |
| Use the Data Leaflet | Chem | Ar values from the leaflet; case-sensitive symbols | — | 03 §7.1 |

Bold words inside stems ("**not**", "**to 1 decimal place**", "**as a fraction**", "**whole number**") are stored as `emphasis` and the marker enforces them (01 §9.3, §9.4 general advice).

### 6.2 Mark language profiles (`mark-language.<subject>.json`)

- **GCSE Mathematics:** codes `M` (method), `A` (accuracy, depends on M), `MA` (single mark for method and answer), `W` (working/communication mark where the scheme credits shown working) **[confirm the exact token set and the "General Marking Advice" rules from the downloaded Summer 2025 M4/M8 mark schemes in `docs/sources/maths`; 08 §3.2 records them as verified downloads and 08 (current) §11 step 3 refers to an "M/A/MA breakdown"]**. Rules encoded: A marks are not awarded without the M mark unless the scheme says "MA"; follow-through marked `ft`; "the worst solution is marked" when several are left; transcription/working-seen rules; early rounding loses the A mark; money to 2 d.p.
- **Further Mathematics:** `M` (correct method), `W` (accurate working), `MW` (combined) (02 §7); positive marking; follow-through after an error; "where an error trivialises a question not more than half the marks"; misreads earn a proportion; "sole use of a calculator will not gain any marks"; 2 d.p. default, 3 d.p. for log tables (02 §2, §8.1).
- **Double Award Science:** `P` marking points worth [1] with `accept / reject / ignore` lists; the listing rule; definitions need the glossary key words; physics: equation line [1] before substitution, unit conversion, "wrong equation → 0"; chemistry: symbols case-sensitive, "chloride ion", observations fully qualified, 2-D apparatus; `QWC` = 6 marks in three bands (§6.5) (03 §7.1).

Feedback templates draw from the profile, e.g. maths: "M1 earned for `{for}`; A1 lost — `{reason}` (ft not available because the method was incomplete)."; science: "Marking point 2 not awarded: you wrote 'chlorine ion' — the examiner rejects this (03 §7.3)."

### 6.3 Tariffs and timing (`tariffs.json`)

| Paper | Marks / time | Min per mark |
|---|---|---|
| M1, M2 | 100 / 105 min | 1.05 |
| M3, M4 | 100 / 120 min | 1.2 |
| M5, M6 P1 or P2 | 50 / 60 min | 1.2 |
| M7, M8 P1 or P2 | 50 / 75 min | 1.5 |
| FM Unit 1 | 100 / 120 min | 1.2 |
| FM Units 2–4 | 50 / 60 min | 1.2 |
| B1, C1, P1 (HT 70; B1 FT 60) | 60 min | ≈0.86 (HT) |
| B2, C2, P2 (HT 80) | 75 min | ≈0.94 |
| Booklet B, each discipline (HT 35) | 30 min | ≈0.86 |

(01 §2, 02 §2, 03 §2.) Exam mode starts at 1.5× these allowances and converges to 1.0× over weeks (06 §15). Item `timeAllowanceSec = marks × minPerMark × 60`.

### 6.4 Formula sheets and "must memorise" (`formula-sheets.json`)

Higher Maths sheet: prism, trapezium, sphere volume/SA, cone volume/CSA, quadratic formula, sine rule, cosine rule, ½ab sin C. Foundation: trapezium, prism only. Not given (must know): circle circumference/area, triangle/parallelogram/kite areas, Pythagoras, SOH-CAH-TOA, cuboid/cylinder volume & SA, arc/sector as fractions, polygon angle facts, speed/density/pressure, compound interest multipliers, mean from tables, y = mx + c, index laws, probability rules, 5 miles ≈ 8 km, 1 kg ≈ 2.2 lb, 1 litre = 1000 cm³ (01 §4). FM: Unit 1 (quadratic formula, differentiation/integration rules, log definition), Unit 2 (vectors, suvat, F = ma), Unit 3 (mean, SD, addition rule, conditional probability, Spearman, Normal table), Unit 4 none (02 §4, §5). Science: none — every physics equation "recall and use" (03 §2). Each note's `formulaSheet` field is validated against this file.

### 6.5 QWC 6-mark bands (`qwc-bands.json`)

Encoded as three bands: **Band A (5–6)**: all/most indicative content, accurate specialist terms, well organised, few errors of spelling/punctuation/grammar; **Band B (3–4)**: some indicative content, some specialist terms, some organisation, some errors; **Band C (1–2)**: limited content, limited terms, poorly organised, frequent errors; **0**: nothing creditworthy. One QWC question per science paper and per Booklet B (03 §2). **[Transcribe the exact band descriptors from spec §4.4 in `docs/sources/science/DA-Science-spec.pdf` and store them verbatim in this data file — they are the marker's rubric, not our prose.]** Examiner notes attached to the builder: capital letters and full stops matter; answer in the box; legibility (03 §7.1).

### 6.6 Booklet B item types (`booklet-b-item-types.json`)

From 03 §5.7, §7.2–7.4: name apparatus (gas syringe, conical flask, delivery tube, gas jar, coverslip, eyepiece lens); draw a 2-D labelled diagram; identify independent/dependent/control variables (the control is *not* the one being changed); state a hypothesis; give a safety precaution with reason (safety screen wording; fume cupboard for toxic gases); design a results table (column heading = axis label incl. unit); plot points and draw a best-fit line/curve (not straight segments; "related but not proportional" reason); identify an anomaly; describe a trend using values; calculate mean/gradient (with unit)/moles/percentage; reliability (repeat and compare) vs accuracy (close to true value) vs validity; suggest an improvement; a 6-mark QWC in a practical context; tolerances (angles to ±1°, masses to 2 d.p., range 2.00–2.50 g). Each practical module must include at least one item of each type that applies.

### 6.7 Physics equation list and Chemistry Data Leaflet

- `physics-equations.json` = the 03 §5.9 table as Product 8 records; the note for each P1/P2 topic shows a "Must memorise" box generated from it. Two rules are attached to every item: write the equation first; wrong equation = 0 even with a correct number (03 §7.1).
- `chemistry-data-leaflet.json` = Periodic Table with symbol, atomic number, Ar (the leaflet is provided in C1, C2 and both Unit 7 chemistry papers, 03 §2) **[transcribe Ar values from the Data Leaflet PDF; also record any further tables the leaflet carries]**; UI shows a leaflet panel on any item with `resources: ["data-leaflet"]`. Chemistry recall formulae (rate = 1/time, Rf, moles, concentration, % yield, atom economy, bond energies) are stored as a second equation registry (03 §5.9 note).

### 6.8 Further Maths method locks (`fm-method-locks.json`)

Per statement: `{ instructionRegex, requiredMethod, zeroIfIgnored: true, evidence }` — e.g. `"hence"` after completing the square → must use completed-square form (02 §8.1 rank 8); `"use a matrix method"` → matrix inverse required (rank 12); "show that" → no back-substitution (02 §8.2 rank 7); forming equations → working backwards from given equations gains nothing (rank 5). The marker refuses A/W credit when a lock is violated and explains why in M/W language.

### 6.9 Presentation rules (`presentation-rules.json`)

Applied to every worked solution and to feedback: units on the answer line; money to 2 d.p.; probabilities as fractions or decimals, never words or ratios; keep the inequality sign; write the full calculator display in bounds questions; product of primes with index notation and × signs; describe transformations fully; constructions show arcs; dark pencil for graphs; check answers against context (estimated mean within the data; probability ≤ 1; estimate below population) (01 §9.3, §9.4 general advice; 02 §8.1 general advice).

---

## 7. Visual and media content

Rule of thumb (06 §10, §13; 07 §7): every figure is *informational*, labels sit on the diagram, no decoration; videos ≤ 6 min with a question every 2–3 min and an attempt within 60 s of watching.

| Topic type | What is needed | How it is produced | Licence / notes |
|---|---|---|---|
| Statistics (histograms, CF curves, box plots, scatter, pie, bar, stem-and-leaf) | Data-driven charts for stems, blank grids for "draw", answer overlays, an interactive "drag the bar height" drawer | SVG generators (`d3-scale`/`d3-shape` inside React, 10 §4) fed from the item's data; the same data yields the `GraphExpectation` | Ours (MIT libs) |
| Coordinate geometry, functions, inequalities, tangents, exponential graphs, FM calculus | Predict-then-plot canvases; movable points; tangent sliders; area-under-curve shading | **Mafs** components in MDX (pin 0.21, wrapper component, 10 §4) | MIT |
| Geometry and constructions (circle theorems, loci, bearings, transformations, similar shapes, FM vectors) | Draggable theorem explorers; construction step-players with arcs; transformation before/after | **JSXGraph** (MIT option), `useEffect` wrapper; tap-to-place alternatives (WCAG 2.5.7, 07 §4) | MIT |
| 3-D mensuration and 3-D trig (frustums, cones, space diagonals) | Rotatable solids with the right-angled triangle highlighted; nets | Start with isometric SVG; R3F 9 lazy-loaded only where rotation matters (10 §6) | MIT |
| Mechanics (FM Unit 2) | Force-diagram builder; v–t/s–t graph builders for two-vehicle problems; pulley/incline scenes | JSXGraph scenes + a checker (Product 12) | MIT |
| Science structure diagrams (leaf, heart, reflex arc, kidney, DNA, atom, dot-and-cross, lattices, electrolysis cell, ray diagrams, circuits) | Clean labelled SVGs with "label from memory" mode; dot-and-cross generator for the spec's molecules; circuit symbol set (spec symbol chart is an image in the PDF, `data/spec/README.md` caveat 4) | Hand-drawn SVG library in one house style; generators for dot-and-cross and circuits; ray diagrams via JSXGraph | Ours |
| Apparatus diagrams (Booklet B) | 2-D CCEA-style parts library (crucible, pipe-clay triangle, tripod, gas syringe, delivery tube, beehive shelf, potometer, Visking tubing…) | SVG part library + a "build the apparatus" tap interface | Ours |
| Photos (practicals, real contexts, flame colours, indicator colours, rusting, lattice models) | One photo per practical and per colour-observation fact | Own photographs first (kitchen/garden/lab if accessible); otherwise public-domain or CC-licensed images with licence and credit stored in `FigureSpec.photo` | Record licence per image; no unlicensed stock |
| Explainer clips (≤ 60 s) for H topics | Median from a histogram; alternate segment theorem; completing the square (FM); normal-distribution tails; force on a pulley; rates curves | **Manim Community** renders → WebM, captions, transcript (07 §6); Motion Canvas where a themeable vector clip is better | MIT tools; our content |
| Video lessons | Corbettmaths topic videos by number (M4: 157–159, 52, 119, 21, 111, 111a, 266, 267, 197, 64, 65, 359, 360, 360a, 314, 281, 184; M8: 230, 96, 175, 173, 236, 305–308, 255, 108, 333–337, 332, 259, 293b, 247, 298, 345, 267d, 390a, 12 — 08 §9/04 §2.1); "Ultimate CCEA Mx" videos; NI Maths Tutor paper solutions; Chemistry Chicken specimen walk-throughs; Science Shorts unit summaries; PhysicsRocksItsTrue nuclear physics; GCSE Physics Online CCEA free videos (05 §2.19–2.20) | YouTube privacy-enhanced embed behind a facade, `start`/`end` timestamps, credit line, no overlays, never cached (10 §12.1); Bitesize linked, not embedded (05 §1.3) | YouTube ToS; Corbettmaths ToU: link/embed only, no profit, never copy questions (04 §2.1) |
| Simulations | P1: Forces and Motion Basics, Hooke's Law, Balancing Act, Energy Skate Park, Density, States of Matter, Build a Nucleus; P2: Wave on a String, Bending Light, Geometric Optics Basics, CCK DC (Virtual Lab), Ohm's Law, Resistance in a Wire, Magnets and Electromagnets, Gravity and Orbits; C1/C2: Build an Atom, Isotopes, Balancing Chemical Equations, Reactants/Products/Leftovers, pH Scale Basics, Concentration; B: Membrane Transport, Natural Selection (05 §2.11) | PhET iframe with the attribution line beside it and the logo unobstructed; pre-29-Mar-2026 builds (CC BY 4.0) self-hosted for offline where needed (10 §12.2) | CC BY-NC 4.0 (current) is fine for this non-commercial personal build; CC BY 4.0 for historical builds |
| GeoGebra applets (optional) | Specific 3-D/constructions applets | `deployggb.js`, "Made with GeoGebra®" attribution (07 §6, 10 §4) | Non-commercial only — acceptable here; revisit if ever monetised |

---

## 8. Information-architecture implications and phased roadmap

### 8.1 IA implications of a content-first design

1. **Spec statement is the atom; teachable topic is the page.** Routes: `/maths/m4/histograms`, `/science/p1/kinetic-energy`, `/science/practicals/c5`, `/further-maths/u2/force-diagrams`. Each page = note + diagnostics + practice + exam-style + prompts + links, in that order, with the mastery chip (Familiar/Proficient/Mastered with decay, 07 §2.3) keyed to spec statements.
2. **Unit pair is the primary navigation object** (04 §5.1): onboarding captures her entries (M4 + M8; B1/C1/P1 then B2/C2/P2 + Unit 7; FM 1 + 2 + 3) and dates; the exam map and the scheduler derive from it. Cumulative assumptions (M8 presumes M1–M7) are shown as "assumed content" panels, not hidden.
3. **Review inbox first** (07 §7 principle 5): the home screen opens on "Due today: n · ~m min", then "Next topic", then the exam countdowns.
4. **Three practice modes per topic** (06 §15): learn → mixed → exam mode; exam mode uses real tariffs and self-marking against the mark scheme.
5. **Exam-true layer as data**, loaded by both the authoring pipeline and the UI, so vocabulary never drifts.
6. **Verification panel on every item** (§10) and a "Something wrong?" control.
7. **Links out** are first-class citizens (Corbettmaths video number chips, Bitesize article ids, CCEA PDF deep links with `#page=`, PhET), each with attribution and link-health status.
8. **Static export constraints** (10 §2): all topic routes enumerated via `generateStaticParams`; JSON banks bundled per topic; the private reference corpus and pipeline live outside `out/`.

### 8.2 Roadmap

| Phase | Dates | Content | Platform surface it needs |
|---|---|---|---|
| **0** | 2–16 Sep 2026 | §5.3 table: M4 complete (6 H + 4 S), M3 prompt deck, physics equations, P1 KE + P2 Hooke's law practical, exam-true v1, data pack v1, M4 past-paper index (3 series), 10 insight cards, verification logs | Note renderer (MDX + KaTeX), diagnostic and question runner (numeric/algebraic/MCQ/graph-histogram), FSRS inbox, mastery chips, UMS calculator, verification panel |
| **1** | 17 Sep – 8 Nov 2026 | M3 to S (H×8); B1, C1, P1 to L then H for hard topics; QWC builders for the three Unit-1 papers; Booklet-B-lite for B1–B4, C1–C2, P1–P4; chemistry Data-Leaflet drill v1; M4 mocks ×2; insight cards for M3/B1/C1/P1 | Working capture (typed/photo/Excalidraw), science text marking with listing rule, QWC self-mark, apparatus builder v1, exam mode |
| **2** | 9 Nov 2026 – 21 Feb 2027 | M8 (H×10, S×10); M7 (H×6, S×10); FM Unit 1 (H×10); DAS Unit 1s to S; Unit-1 practical modules complete; DAS Unit-1 mocks for March | JSXGraph/Mafs interactives for M8 (circle/tangent, transformations, similar shapes), FM Unit 1 calculus canvases, paper-format mocks P1/P2 |
| **3** | 22 Feb – 15 Jun 2027 | B2, C2, P2 (S with H×21); all 18 practical modules + Booklet B bank; FM Units 2–3 (H×11); SSDD sets; full mock set; FM Unit 1 to S | Force-diagram checker, normal-table tool, Booklet B timed mode, mock scheduler |
| **4 (continuous)** | Jun 2027 → | Foundation M1/M2/M5/M6 to S; FM Unit 4 L; bridging-to-AS; refresh data pack each results day (Aug/Feb/Apr) and each timetable version | Data refresh jobs; link-health job over feeds 504/507/584 |

---

## 9. What NOT to author (link instead), and why

| Do not author | Do instead | Why |
|---|---|---|
| CCEA past-paper questions and mark-scheme text | Metadata index + `#page=` deep links + our own solutions (Product 14) | Copyright notice forbids electronic distribution and storage in a retrieval system (08 §5); CCEA's site blocks iframes; BBC links "with their permission" — we have no such permission (04 §2.9) |
| Corbettmaths questions, booklets, checklists | Embed videos by number; link practice PDFs | ToU: never include their questions in redistributed resources; link rather than upload (04 §2.1, 08 §9.1) |
| BBC Bitesize guide text and quizzes | Deep-link the exact article ids (05 §1.2) | BBC copyright, no embed facility (05 §1.3) |
| CCEA fact files, Q&A booklets, practical manuals, glossaries, Student Guides | Link as "official further reading" from each topic; our notes contain the key words and cite the glossary | CCEA copyright; also they are already good — the value we add is structure, examiner evidence and interactivity, not a rewrite (08 §7) |
| Full-length video lessons | Embed Corbettmaths / NI Maths Tutor / Chemistry Chicken / Science Shorts / GCSE Physics Online with timestamps; make only ≤60 s Manim clips for H topics | Existing video coverage is good for maths and physics (05 §4 gap 3); our developer time is better spent on items and verification |
| PhET-style simulations | Embed PhET with attribution (05 §2.11) | Building sims is weeks of work; PhET is licensed for this use |
| Generic KS3 prerequisite teaching (times tables, basic fractions) | Link Corbettmaths videos; keep only prompts that CCEA reports as gaps (01 §9.5) | Not exclusive; Corbettmaths already excels |
| Further Maths Unit 4 | L bundles late, link the CCEA fact file | 0–4 candidates per year sit it (02 §3) |
| Legacy T-spec content, Irish-medium versions | Out of scope; link CCEA | Not relevant to her; 09 §7.3 |
| A textbook | — | The platform is notes-plus-practice; Hodder/CGP exist (04 §2.20) |
| Mark-scheme "General Marking Advice" verbatim | Encode the rules as data in our words (§6.2) | CCEA copyright; the rules, not the prose, are what matter |

---

## 10. Risks and mitigations

| Risk | Mitigation |
|---|---|
| **Accuracy — AI-drafted maths is wrong** (wrong answer, wrong tariff, out-of-scope method) | Stages 3–5: critic, independent blind solve, compute-engine/numeric sampling, mark-scheme arithmetic; zero-tolerance gate G4; 100% human read of exam-style items; golden-test corpus grows from every reported error (10 §14); items withdrawn from the scheduler while under investigation |
| **Accuracy — examiner "insights" hallucinated** | Insight extraction runs only over CER text we hold locally; every finding cites series/unit/question and the report URL; the brother reads every card once; items cannot cite a source that is not in the card |
| **Accuracy — tier/scope drift** (Foundation shown Higher content; M4 includes completing the square) | Tier flags come from the JSON (`tier`, `mixed`, `textMarked`) and the parallel maths taxonomy; critic line 1; `notOnThisSpec` validated against Teacher Guidance limits (01 §4, 02 §4) |
| **Volume — 12,000 items is too many** | Bundle sizes L/S/H; exam-date ordering; Foundation-only units start as L; H only where reports say so; the §4 economics (≈1 h per S topic) are the planning unit; anything not on the §5.2 critical path is deferred without guilt |
| **Volume — quality collapses under speed** | Gates are automatic and cannot be skipped; publish rate is capped by human sign-off, not by drafting speed |
| **Staleness — grade boundaries, A\* threshold, timetables, series rules change** | Data pack with `asOf` and source per row; refresh on each results day and timetable version (Summer 2027 is already at v2, 01 §6); A\* always a band; Nov 2027 resit-only and Mar 2028 no-science rules encoded with `appliesFrom` (09 §9.1) |
| **Staleness — mark schemes published 2–5 months after results; papers removed after five years; filenames renamed** | Nightly diff of feeds 504/507/584 on `changed`; link-health job; index rows show "mark scheme not yet published" / "withdrawn by CCEA" states (08 §10, §11 step 3) |
| **Staleness — spec re-uploads** | The spec PDFs are Version 2 (2017/2019) with no content change; reform first-teaches 2029 at the earliest (01 §1, 09 §9.4); watch the CCEA reform survey outputs annually |
| **Copyright — CCEA** | No CCEA question/MS text stored or served; short statement quotations only inside `<SpecBox>` with attribution; deep links only; if inline reproduction is ever wanted, ask CCEA first (08 §11 step 7) |
| **Copyright — Corbettmaths** | Link/embed only; shingle check includes their PDFs; non-commercial personal use keeps us inside their terms (04 §3) |
| **Copyright — BBC, PhET, GeoGebra, YouTube** | Link only (BBC); attribution and logo (PhET); non-commercial + attribution (GeoGebra); privacy-enhanced embed, facade, no caching (YouTube) (10 §12) |
| **Trust — she stops believing the platform after one wrong answer** | The verification panel (below) and a visible fix log; errors are acknowledged in the UI ("fixed 3 Sep, reported by you"); never hide a withdrawal |
| **Over-reach — building products before the sister's entry pattern is known** | Confirm units and series with the school in week 1; Phase 0 switch rule (§5.3) |

### The verification log she can see

Every item renders a compact "Checked" panel from `VerificationLog`:

> **Checked** · Maths: answer recomputed (mathjs) and independently solved — agree · Algebra: equivalent by compute-engine + 12-point sampling · Scope: M4 Handling data, Higher (Teacher Guidance 2019) · Examiner: rehearses S2025 M4 Q22(b), Nov 2025 M4 Q23 · Copy check: passed · Read by: Feras, 9 Sep 2026 · Version 1 · **Something wrong? →**

Panel rows come straight from `checks[]`; a failed or waived check is shown, not hidden; a report from her appears under the panel with its resolution. The log is also exported as `out/verification/<itemId>.json` so it survives redeploys and can be audited.

---

## Appendix A — Phase 0 checklist (content side)

- [ ] Confirm with the school: which maths unit and series, science tier, FM units.
- [ ] Create `data/exam-true/` files: `command-words.json`, `mark-language.maths.json`, `mark-language.further-maths.json`, `mark-language.science.json`, `tariffs.json`, `formula-sheets.json`, `qwc-bands.json` **[transcribe from spec §4.4]**, `booklet-b-item-types.json`, `physics-equations.json`, `chemistry-data-leaflet.json` **[transcribe Ar values]**, `fm-method-locks.json`, `presentation-rules.json`.
- [ ] Confirm the GCSE Maths mark-code token set from the Summer 2025 M4/M8 mark schemes **[local PDFs]**.
- [ ] Build the private reference corpus for the shingle check (CCEA + Corbettmaths text) outside the web root.
- [ ] Extract insight cards for the 10 M4 topics from CER Summer 2023/2024/2025 and Nov 2025 (`docs/sources/maths/CER-*.txt`).
- [ ] Author and verify the 10 M4 bundles (6 H, 4 S) starting with `maths.m4.histograms`.
- [ ] Physics equation registry + drills; `science.p1.kinetic-energy`; `prac.science.p2.hookes-law`.
- [ ] Data pack v1 and M4 past-paper index (Summer 2025, Nov 2025, Summer 2024).
- [ ] Verification logs rendered for every published item.

## Appendix B — Id and file layout

```
content/
  maths/m4/histograms/
    note.mdx                # NoteFrontmatter + body
    worked-examples.json    # WorkedExample[]
    diagnostics.json        # DiagnosticSet
    questions.json          # Question[] (practice + exam-style)
    find-the-mistake.json   # FindTheMistake[]
    prompts.json            # RetrievalPrompt[]
    insight.json            # ExaminerInsight
    verification/*.json     # VerificationLog per item
  science/p1/kinetic-energy/…
  science/practicals/c5/…   # Practical + questions
  further-maths/u2/force-diagrams/…
data/
  spec/double-award-science.json   (exists)   gcse-maths.json   further-maths.json   (parallel builds)
  exam-true/…                      (§6)
  data-pack/…                      (Product 13)
  pastpaper-index/…                (Product 14)
pipeline/
  prompts/…  corpus/ (private, not built)  checks/  golden/
```
