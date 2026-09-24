# Enrichment dossier — b2-sex-hormones-menstrual-cycle

**CCEA** Double Award Science, B2 §2.3 Reproduction, Fertility and Contraception · outcomes 2.3.4, 2.3.5 · tier F (both Foundation) · difficulty 3 · no prescribed practical
**Prerequisites in our taxonomy:** `b2-reproductive-systems`, `b1-blood-glucose-diabetes`
**Compiled** 19 September 2026 · 45 minutes
**Headline, and the most important line in this dossier: CCEA does not examine FSH or LH.** CCEA's outcomes name only testosterone, oestrogen and progesterone. Every AQA and Edexcel resource she will find leads with the four-hormone interaction, and three quarters of the cognitive load in those resources is content she is not assessed on. The enrichment job here is **subtraction**, then borrowing the two representations that survive it.

---

## 1. Crosswalk

| CCEA | What CCEA asks | AQA | Edexcel | Confidence | Scope |
|---|---|---|---|---|---|
| 2.3.4 | Testosterone (testes) and oestrogen (ovaries) cause secondary sexual characteristics | 8464 **§4.5.3.3**, first three paragraphs — "during puberty reproductive hormones cause secondary sex characteristics to develop"; oestrogen from the ovary, testosterone from the testes stimulating sperm production | 1SC0 **CB7.1** (where hormones are produced and how they are transported, including ovaries and testes) | high | matched. AQA adds "testosterone stimulates sperm production", which CCEA does not require but which is harmless and useful |
| 2.3.5 | Menstrual cycle: menstruation days 1–5, ovulation about day 14, fertilisation most likely around ovulation; oestrogen repairs and thickens the lining, progesterone maintains it | 8464 **§4.5.3.3**, remaining paragraphs. **Beyond CCEA within it:** FSH, LH, and the Higher-only "explain the interactions of FSH, oestrogen, LH and progesterone" plus "extract and interpret data from graphs showing hormone levels" | **CB7.4** — "the stages of the menstrual cycle, including the roles of the hormones oestrogen and progesterone" (a near-exact CCEA match) and **CB7.5** — the four-hormone interaction (beyond CCEA) | high | **CB7.4 is the single closest statement on any other board.** Use CB7.4-shaped material; treat CB7.5 and AQA's HT paragraphs as out of scope |
| — | (no CCEA equivalent) | 8464 §4.5.3.6 Feedback systems (HT) — thyroxine, adrenaline, negative feedback | CB7.2, CB7.3, CB7.9 | high | **beyond CCEA** for this topic. Negative feedback as a named mechanism is not in CCEA §2.3 |

---

## 2. Teaching angles worth recreating (in our own words)

1. **Four stages tied to day ranges, before any hormone is named.** *Doc Brown's GCSE biology revision notes, "Human reproduction — hormones and the menstrual cycle".* He scaffolds the cycle as four blocks with explicit day ranges — menstruation days 1–5, lining rebuilt days 6–13, ovulation day 14, lining maintained days 15–28 — and only then hangs hormones on it. This order is right for a first-time learner and it is exactly CCEA's scope: the day numbers *are* the examinable content. Teach the calendar first, the chemistry second.

2. **"The graph is not to scale."** *Doc Brown states this explicitly, and it is the most useful single sentence about these graphs.* Hormone-level graphs in textbooks and papers plot four hormones on one unlabelled y-axis; the peaks are in the right *places* but the heights are not comparable between hormones. A learner who tries to read "oestrogen is higher than progesterone" off the curve is reading something the graph does not say. Put this in a `why` callout, because it also teaches a general graph-literacy point CCEA rewards in Unit 7.

3. **One icon per hormone.** *Seneca's AQA Higher revision note "Menstrual hormones" gives each hormone a symbolic image — an egg, a sponge, a release symbol, a calendar.* The sponge for oestrogen (the thickening lining) and the calendar for progesterone (the waiting period) are the two we need. A small, consistent glyph beside each hormone name, reused in every figure and every question stem in the bundle, is cheap and does real memory work. Draw our own glyphs; the idea is what we are taking.

4. **Verb discipline: stimulates versus inhibits, builds versus maintains.** *Seneca deliberately bolds "inhibits (stops)" and "stimulates (encourages)".* CCEA's two-hormone version reduces to **oestrogen builds, progesterone maintains**, and the whole of menstruation follows from "the maintainer stops". A three-word summary — *build, maintain, shed* — should be the spine of the section and the answer to the closing retrieval prompt.

5. **Two jobs for the ovary in one sentence.** *AQA §4.5.3.3 and Edexcel CB7.1 both introduce the ovary as an endocrine gland.* Our lesson should say, once, that the ovary releases an ovum **and** makes oestrogen, and that the two events are the same event seen from two sides. This is the join to `b2-reproductive-systems` and it pre-empts "which organ makes oestrogen?" which is a recorded CCEA slip.

6. **The fertile window is arithmetic, not biology.** *Common to AQA's contraception teaching (abstinence "when an egg may be in the oviduct") and to Oak's KS4 lesson.* An ovum survives about a day, sperm about three; so the days on which intercourse could lead to fertilisation run from about day 11 to about day 15. CCEA only asks "most likely around ovulation", but the arithmetic makes it memorable and it sets up the natural-methods part of `b2-infertility-contraception`.

---

## 3. The representation to rebuild as our own SVG

**Hero figure: one x-axis, three stacked bands.** This is the representation every board converges on and it is worth building properly as a parameterised generator, because four topics in this cluster can reuse it.

`viewBox` about `0 0 980 520`. **Shared x-axis: day of cycle, 1 to 28, gridlines every 7 days, ticks every day, labelled 1, 7, 14, 21, 28.** Three bands share it, drawn top to bottom with a common left margin so the vertical alignment is exact:

- **Band 1 — the uterus lining (height ≈ 120).** A filled profile whose height is the thickness of the lining: near zero at day 5, rising steadily to day 14, roughly level from day 15 to day 28, then dropping vertically at day 1 of the next cycle (draw one extra day at the right edge to show the drop). Axis label "thickness of the uterus lining"; no numbers on this axis, because there are none to give honestly.
- **Band 2 — hormones (height ≈ 180).** Two curves only: **oestrogen**, rising from about day 6 to a peak just before day 14 then falling; **progesterone**, low until day 14, rising to a broad peak about day 21, falling away to day 28. Both labelled at their peaks with a leader, not in a legend, so the curve and its name cannot be separated. The y-axis is labelled "relative concentration" and carries **no numbers**, with a small note "not to scale — read the timing, not the height". Each curve gets its glyph from §2.3 at the label.
- **Band 3 — the calendar ribbon (height ≈ 70).** A single horizontal strip divided into: **days 1–5 menstruation** (hatched), **days 6–13 lining rebuilt**, **day 14 ovulation** (a vertical marker running up through all three bands), **days 15–28 lining maintained**. A bracket labelled "most likely to conceive" spanning about days 11–15.

**The day-14 marker must run through all three bands** — that vertical line is the single most valuable mark on the figure, because it makes "oestrogen peaks just before ovulation" and "the lining is already thick by then" visible at once.

**Generator parameters:**
- `showFshLh: boolean` — default **false**. When true, adds greyed FSH and LH curves to band 2 with a `notonspec` caption. This lets the same figure serve a learner who has read an AQA site and is worried she is missing something.
- `bands: ("lining"|"hormones"|"calendar")[]` — so a gate can present band 2 alone and ask her to draw or choose the matching band 3.
- `blankLabels: string[]` — for the retrieval version.
- `markDay: number | null` — draws a single query line at any day, for "what is happening on day 20?" items.

All strokes `currentColor`; the two curves distinguished by **dash pattern and label**, never by colour alone; hatching by `fill-opacity`; `<title>` describing all three bands and the day-14 alignment.

---

## 4. Practicals CCEA also examines

None prescribed. The genuine practical-skills link, and it is a strong one for Unit 7 Booklet B, is **reading a multi-line graph with an unlabelled y-axis**: identifying the independent variable, saying what can and cannot be concluded from relative heights, and reading a value at a stated day. Build one data item on that skill and tag it to the practical-skills strand rather than inventing an experiment.

---

## 5. Question types the other boards use that CCEA also rewards

1. **"Describe how the concentration of hormone X changes between day A and day B" [2].** AQA's standard graph-description shape, and CCEA uses it identically. The mark-scheme habit worth copying: **one mark for the direction, one for a quoted day or a turning point**. Author the scheme so "it goes up" scores one and "it rises from day 6 and peaks at about day 13, then falls" scores two, and say exactly that in the feedback.
2. **"On day 20 of the cycle, state what is happening in the ovary / to the uterus lining" [1].** A single-point read that forces band-to-band transfer. Both AQA and Edexcel use it; CCEA's version tends to ask about the lining.
3. **"Explain why a woman is unlikely to become pregnant on day 3" [2].** A reasoning item built from the same figure. This is the shape that separates candidates, and it rewards the fertile-window arithmetic from §2.6.
4. **Match hormone to effect.** A three-by-three matching item (testosterone, oestrogen, progesterone against their effects). Our `label` or `order` answer kinds both handle it; it directly attacks the recorded hormone-confusion slip.

---

## 6. Misconception framings worth borrowing

| Misconception | Framing | Evidence |
|---|---|---|
| Hormones are confused with each other — testosterone, auxin or ADH offered for progesterone | Give each hormone one glyph and one verb and never vary them. Ask for the verb, not the name, in at least one gate | our own Summer 2025 B2 Foundation finding |
| "Progesterone" misspelt so the mark is lost | Name the trap explicitly and make her type it once in a `blank` gate early, where the cost is zero. Spelling is the mark here because the word is a key word | our own Summer 2025 B2 Foundation finding |
| Day 1 is the *end* of the period | State it plainly: **day 1 is the first day of bleeding**. The hatched block on the ribbon starts at day 1, at the left edge, where it cannot be misread | Doc Brown's four-stage scaffold; universal |
| Reading hormone heights off the graph as if comparable | "Not to scale — read the timing, not the height" | Doc Brown states this explicitly |
| Believing FSH and LH must be learnt | One `notonspec` line: other boards examine them; CCEA does not; here is what CCEA does ask | verified against CCEA outcomes 2.3.4/2.3.5 |
| Ovulation is the same thing as menstruation | They are two weeks apart on the ribbon, and the ribbon is drawn once. Ask "how many days between them?" | common; the figure answers it |
| The cycle is exactly 28 days for everyone | Say "about 28 days" once; CCEA prints "about" and a question may use a 30-day cycle, where ovulation is about 14 days **before the next period**, not on day 14 | AQA and Edexcel both set variable-length-cycle items |

---

## 7. Photographs (Commons, licence checked 19 Sep 2026) and simulations

| File | Licence | Size | Use and prompt |
|---|---|---|---|
| `File:Mature ovarian follicle.png` (Luis F. Goncalves) | CC BY-SA 3.0 | 644×519 | An ultrasound of a mature follicle, 20 × 24 mm, days before ovulation. This is the photograph that makes ovulation a real event. Prompt: "roughly which day of the cycle would this scan have been taken, and what happens to this structure next?" |
| `File:Gray1163.png` (Henry Vandyke Carter) | Public domain | 385×283 | A section of ovary showing follicles at several stages at once — the best single image for "one is released about every 28 days" |
| `File:Foliculo de Graaf..png` (Tufts OpenCourseWare) | CC BY 3.0 | 520×358 | A stained secondary follicle with a large antrum; a genuine micrograph alternative to the Gray drawing |

**Simulations: none.** There is no PhET or GeoGebra model of the menstrual cycle, and a generic "hormone" sim would model nothing. `media-map.json` correctly records `sims: []`. The interactive here is our own figure with `markDay`, not a third-party embed.

**Videos already held:** Freesciencelessons `iXswGsfeHJg` (The Menstrual Cycle) and Cognito `oGZMIQ8Oa9M` (The Menstrual Cycle & Puberty). **Both are AQA-shaped and both spend most of their running time on FSH and LH.** If either is placed in the note, the `why` line must say so and the gate after it must be about oestrogen, progesterone and the day numbers — otherwise the video teaches her something she is not examined on and the gate cannot rescue it. Consider a `start`/`end` window on the Cognito video to reach the puberty and secondary-characteristics section, which is 2.3.4 and genuinely on spec.

---

## 8. Scope note

**Beyond CCEA — `notonspec` if it appears at all:**
- **FSH and LH** and their interactions (AQA HT; Edexcel CB7.5)
- negative feedback as a named mechanism; the pituitary gland as the source of anything in this cycle
- the corpus luteum by name, and its role in producing progesterone
- the menopause (Oak and AQA both teach it here; CCEA does not)
- thyroxine, adrenaline, the endocrine system as a whole (CCEA covers insulin and ADH in B1, separately)
- interpreting four-hormone graphs as a Higher skill

**CCEA-only or CCEA-specific emphasis:** the day numbers (1–5, about 14) as recall; "repairs and thickens" versus "maintains" as the two examinable verbs; secondary sexual characteristics attributed to testosterone and oestrogen by name.

---

## 9. Sources consulted

- AQA GCSE Combined Science: Trilogy 8464 specification PDF, §4.5.3.3 and §4.5.3.6
- Pearson Edexcel GCSE (9-1) Combined Science 1SC0 specification PDF, CB7.1, CB7.4, CB7.5
- Doc Brown, "GCSE Biology — human reproduction, hormones, the menstrual cycle" (`docbrown.info/ebiology/hormones-1.htm`) — for the four-stage day scaffold and the not-to-scale warning
- Seneca Learning, AQA GCSE Biology Higher revision note 5.3.21 "Menstrual hormones" — for the one-glyph-per-hormone device and the stimulates/inhibits verb discipline
- Oak National Academy, KS4 Biology (AQA Higher), "Hormonal control of the menstrual cycle" — five-cycle lesson structure, for sequencing comparison only
- Wikimedia Commons API for every file above
- `data/spec/double-award-science-topics.json` → `b2-sex-hormones-menstrual-cycle` (`examinerEvidence`, Summer 2025 B2 Foundation)
