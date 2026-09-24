# Re-verify: B2 biology set 1 (reproduction) — the fixes from `b2-b-1.md`

Every finding in `docs/dev/qa/pre-read/b2-b-1.md` (33 across four bundles) checked against the current
files, written 20 Sep 20:43 — after the pre-read (16:05). Nothing under `packs/` or `src/` was edited.

Bundles: `packs/science/content/b2/{b2-reproductive-systems,b2-fertilisation-pregnancy,`
`b2-sex-hormones-menstrual-cycle,b2-infertility-contraception}/{bundle.json,note.blocks.json}`.

**How the marking rows were proved.** One script imports `markAnswer` from `src/components/items/mark.ts`
(called as `markAnswer(raw, part.answer, { marks: part.marks, prompt: part.stem, commonErrors: part.commonErrors })`)
and `qwcEvidence` from `src/lib/marking/qwc.ts`, and puts the worked solution, every authored accepted
answer, at least one fresh paraphrase and the reversed or wrong answer each finding named through each
part: **109 assertions, 0 failures**. `matchesCommonError` was asserted alongside every mark, so a fix
that silences a pattern is separated from a fix that changes a mark.

**How the figure rows were proved.** A second script decodes every question figure's SVG out of its
`data:image/svg+xml` `src` (the four bundles carry figures as `src`, not `svg`) and collects its `<text>`
and `<tspan>` nodes, `<title>`, `<desc>`, `aria-label`, `alt` and `caption`, then matches that text, after
the engine's own normalisation, against every phrase the question's parts ask for (accepted answers, key
words, table cell values, label targets, QWC key words, scheme accepts). Two matches came back across the
four bundles, neither of them one of the report's figures — both are recorded under *Still open*.

`npm run content:check`: **156 bundles published, 0 problems, 0 key-word warnings**, and of the 181
"figure printing an answer" warnings across the pack **none names any of these four bundles** (`grep -c`
= 0). All four print `ok` lines. The one strict-build breach (`b1-aerobic-respiration`, 125 words between
gates) is outside this set — that bundle was being edited while this check ran (`note.blocks.json` at
21:02) and belongs to whoever is authoring it.

Also confirmed across the set, against the author's own account of the pass: **every question and
worked-example figure's `<title>` now equals its `alt`** — 23 of 23, checked by decode and compare; and
every `topic.examinerSources` id is answered by a Sheet trap (8 / 11 / 8 / 9 traps; none of the four
appears in the strict build's "no trap answers" warnings).

Scripts in the session scratchpad: `b2brv-scan.mjs`, `b2brv-dump.mjs`, `b2brv-figleak.mjs`,
`b2brv-titles.mjs`, `b2brv-mark.mts`, `b2brv-residual.mts`, `b2brv-proposed.mts`.

Note: block indices below are the current ones. The `mustknow` rewrite the pre-read mentions, plus the
video moves, shifted most of them by one or two from the numbers in `b2-b-1.md`.

---

## 1. `b2-reproductive-systems`

| # | finding | status | evidence |
|---|---|---|---|
| 1 | figure subtitle contradicts its caption, note [8] | **holds** | SVG second `<text>` now `The verb on the right is what the examiner is looking for.`, agreeing with the caption `The verb on the right is what the mark scheme is reading for.` |
| 2 | same subtitle on the question figure, `q…0009` | **holds** | question SVG now `The female reproductive system` / `Write one function in each empty box.` + the five left-column names; `<title>` = `alt`; the stem was also reworded to `Complete the table. Write in what each part … does.` |
| 3 | scheme accept missing from key words, `q…0001 b` | **holds** | `any` gained `takes sperm`, `takes the sperm`; `it takes sperm to the urethra` **1/1**, `it takes the sperm from the testis towards the urethra` **1/1**, fresh `The sperm tube transports sperm up towards the urethra.` 1/1; `it carries urine` 0/1 and still tags `sci.repro.male-parts-answered-with-urine`; `it makes the sperm` 0/1. A `reject:["urine"]` was added on top of the fix and does not touch `…to the urethra` (1/1) |
| 4 | article asymmetry, `q…0001 c` | **holds** | `adds a liquid` present; `it adds a liquid to the sperm` **1/1**, fresh paraphrase 1/1, `it stores urine until it is released` 0/1 + tag |
| 5 | hormone route unreachable, `q…0003 a` | **holds** | `hormone oestrogen` added; all three report phrasings **1/1** (`makes the hormone oestrogen`, `produces the hormone oestrogen`, `makes the female sex hormone oestrogen`); swapped-organ answers `it carries the ovum to the uterus` and `fertilisation happens here` stay 0/1 |
| 6 | passive oviduct answer unreachable, `q…0003 b` | **holds** | `is fertilised`, `are fertilised` added; both report answers **1/1**; `it makes ova and oestrogen` and `the embryo implants in it` 0/1 |
| 7 | commonest "cooler" unreachable, `q…0008 c` | **holds** | `cool`, `temperature is lower`, `lower than body temperature`, `temperature outside the body is lower` added; all five report phrasings **1/1**; `there is more room outside the body`, `so the sperm can get out` and the trap `the scrotum is lower down than the rest of the body` all 0/1 |
| 8 | worked example twin scored wrong answers, `we…01` | **holds** | `any` replaced with the verb list; the three report answers (`it carries the ova to the uterus`, `the ova pass through it`, `an ovum implants here`) **0/1** each; all three accepted answers and a fresh paraphrase 1/1 |
| 9 | the word "wrong" in note prose, [19] and [29] | **holds** | exact fix applied at both sites; `wrong` now appears **0 times** in `note.blocks.json` |
| 10 | video under the wrong heading, now [20] | **holds (placed differently)** | the video sits inside section 4 — after the examiner callout [19] and **before** gate `g4` [21], not after it as the fix proposed; heading 5 [22] follows the gate. The fault (a section-1–4 recap sitting under a section-5 heading) is closed; the `why` was rewritten too |

**Verdict — `b2-reproductive-systems`: all ten findings closed; 45 marking assertions pass; nothing regressed.**

## 2. `b2-fertilisation-pregnancy`

| # | finding | status | evidence |
|---|---|---|---|
| 1 | `q…0011` figure prints its own three-mark answer | **holds (better than proposed)** | the question copy drops the five-line four-point panel; the villus label is **`A`**, not `villi` as proposed — which also closes part `c` ([1] "State the part … that gives it its large surface area"), whose answer `villi` the proposed wording would have printed. `alt` and `<title>` match and say "the folds reaching into it marked A"; leak scan: no answer phrase printed |
| 2 | `q…0008` figure prints all three answers | **holds** | arrow labels cut to `to the foetus` / `from the foetus`, amnion label to `amniotic fluid`; `cushions the foetus`, `dissolved nutrients, oxygen`, `carbon dioxide, urea` all gone; leak scan clean |
| 3 | `q…0013` `<title>` gives the six-mark answer away | **holds** | `<title>` = `alt` = "A route from the ovary along the oviduct into the uterus, with five numbered stations along it and no caption on any of them", and that is now true of the canvas |
| 4 | key words contradict the "feature plus consequence" rule, `q…0011 a` | **holds** | groups 2 and 3 carry the consequence exactly as listed in the report (plus `blood supplies is thin so`); bare-features answer **0/3** and the bare list **0/3**; accepted, worked solution and the report's fresh paraphrase **3/3**; the blood-mixes common error still fires |
| 5 | Higher-tier content without the marker, [24] and [31] | **holds** | [24] step 2 ends `**[1]** *(Higher Tier.)*`; [31] reads `…as feature-plus-consequence pairs *(the villi part is Higher Tier)*` — same signal as block [5], wording adapted to the sentence |
| 6 | video "why" points at a second video that does not exist, [27] | **holds** | exact replacement text in place; no reference to Freesciencelessons remains in this bundle |
| 7 | one-word key word lets a wrong organ score, `q…0006 b` | **holds** | `reject:["oviduct","ovary","fallopian"]` added; `in the lining of the oviduct` and `in the lining of the ovary` **0/1**; all four accepted answers, the worked solution and a fresh paraphrase 1/1; `in the uterus` still 0/1 + tag |
| 8 | bare "bigger"/"larger" let a wrong reason score, `q…0012 b` | **holds** | the two bare words are gone, replaced by the four anchored phrases; `the placenta is bigger` and `the mother is larger by then` **0/1**; worked solution, accepted, `there are many more cells dividing at the end` and the scheme's own accept all 1/1 |
| 9 | two different "about" lengths for an oviduct | **holds** | `q…0010 b` opens `The oviduct in this dish measures 96 mm.`; the arithmetic is untouched (96 ÷ 1.6 = 60) |

**Verdict — `b2-fertilisation-pregnancy`: all nine findings closed, the two blocking figures and the leaking title included; one new QWC evidence gap found on `q…0013` (below), not a regression of a fix.**

## 3. `b2-sex-hormones-menstrual-cycle`

| # | finding | status | evidence |
|---|---|---|---|
| 1 | false arithmetic in the find-the-mistake feedback | **holds** | now `…day 19 is 5 days later than that while her cycle is only 3 days longer than 28`, anchored on day 14 as the fix asked; 19 − 14 = 5 and 31 − 28 = 3 both recompute |
| 2 | two QWC points share key words, `q…0012 main` | **holds** | `indicativeContent[6].keyWords` is exactly `["progesterone falls","level of progesterone falls","no longer maintained","next cycle"]`; the report's menstruation-only answer now shows **1 of 7** (was 2), the worked solution 7 of 7 band A, a fresh full paraphrase 7 of 7 band A, and a hormones-swapped answer 5 of 7 but tagged `sci.cycle.oestrogen-progesterone-roles-swapped` |
| 3 | scheme accepts two characteristics the key words cannot match, `q…0013 b` | **holds** | both groups carry the same twelve-phrase list; all five scheme-accepted pairs **2/2** (including `body hair grows and the menstrual cycle begins`, which scored 0/2); one characteristic alone 1/2; `a deeper voice and facial hair` and `the voice gets deeper` 0/2 |
| 4 | video under a heading about something else, now [10] | **holds** | the video sits in section 2 ("Two hormones, and the jobs they never swap"), directly after that section's teaching paragraph [9]; the `why` now opens `…which is exactly this section` and keeps the FSH/LH warning |
| 5 | the graph thickens through the half the note calls "maintained" | **holds** | block [5] now reads `Days 14 to 28: the lining is kept ready — progesterone holds it there while it finishes thickening.`; the strip figure [4] was re-lettered to match (`keep it ready` / `progesterone holds the lining there`, was `maintain` / `progesterone keeps the lining thick`) |

**Verdict — `b2-sex-hormones-menstrual-cycle`: all five findings closed, including the two optional ones; one duplicated Sheet trap is the only thing left (below).**

## 4. `b2-infertility-contraception`

| # | finding | status | evidence |
|---|---|---|---|
| 1 | `q…0002` figure prints all three answers | **holds** | the four method captions are gone, the six chain boxes and four break symbols stay; `alt` = `<title>` = "…with four unlabelled break symbols across the connectors"; `a barrier, so sperm never reach the ovum`, `HIV`, `chlamydia` no longer appear anywhere on it |
| 2 | `q…0008` `alt` false and figure prints most of the answer | **holds** | the three remaining caption lines (pill/implant, male sterilisation, female sterilisation) are deleted, so the three-break `alt` is now true |
| 3 | `q…0006` IVF figure prints all four marks | **holds** | five numbered boxes with their step names only; the descriptions under 1, 3, 4, 5 and the footnote are gone (`ova and sperm are mixed in a dish in the laboratory` no longer printed); leak scan clean |
| 4 | ICSI photo off-spec and contradicts the bundle's own figure, [14] | **holds** | option (a) applied in full: caption `Fertilisation in a dish, under a microscope. In this clinic one sperm is being injected into the ovum; CCEA asks only that the ova and sperm are mixed in a dish.`, prompt `Which step of in vitro fertilisation is this, and where is it happening?`, and `notOnThisSpec` gained `ICSI, injecting a single sperm into the ovum (CCEA asks only that ova and sperm are mixed in a dish)` |
| 5 | common error fires on a learner who gets it right, `q…0001` | **holds** | the negative lookahead is in place; `it is not a barrier; it changes hormone levels so no ovum develops` is **2/2 and untagged** (the report predicted untagged at 1/2 — the group-2 list now also carries `no ovum develops`, so it takes both marks); `it is a barrier that stops the sperm reaching the ovum` 0/2 + `sci.contra.pill-mechanism-unknown`, `it kills the sperm…` 0/2 + tag |
| 6 | the same misfire on the six-mark QWC, `q…0008` | **holds** | guarded regex in place; a Band-A answer containing `The pill is not a barrier: …` shows **7 of 7, band A, untagged**; `The pill is a barrier that stops the sperm reaching the ovum.` still tags. (The floor stays the band's own — `mark.ts:242` keeps a common error from moving a QWC floor by design, so the report's "floors at 3/6" is a property of that answer's point count, not of the fix) |
| 7 | the IVF absence pattern fires on a correct answer, `q…0006 a` | **holds** | `lots of ova`, `lots of eggs`, `a number of ova` added and the pattern anchored; `so that lots of ova ripen at once` **1/1 untagged**, a fresh `So a number of ova ripen together…` 1/1, `to make the sperm swim faster` 0/1 untagged, `so that an ovum ripens` 0/1 + tag, and an **empty answer** returns `Type an answer first.` and no longer matches |
| 8 | contentless QWC answer collects a point; model answer misses one of its own | **holds** | point 3 gained `ovum developing`, `egg developing`, `none is released`, `no egg`; point 7 is now `["which for","would suit","for this couple","for a couple who"]`. The worked answer shows **7 of 7 (band A)**, was 5; the report's contentless answer shows **0 of 7 (band 0)**, was 1 of 7 on band C. The stem was also extended to ask for the comparison outright |
| 9 | video framing warns about grouping but not off-spec content, [10] | **holds (placed differently)** | the `why` is unchanged; a `notonspec` callout [11] sits directly under the video instead: "Clips made for the other boards name methods CCEA does not — **coils**, **patches**, **injections**, **diaphragms**, **spermicides** — and they usually give the pill's mechanism as **inhibiting FSH** … the wording CCEA marks is **changes hormone levels**." It carries both warnings the fix asked for, and it makes no claim about this clip in particular, so it needed no human viewing to be honest |

**Verdict — `b2-infertility-contraception`: all nine findings closed, including the three figures and the ICSI photo; one key-word gap on `q…0001` remains (below), which the pre-read did not reach.**

---

## Still open

Three things, none of them a finding that failed to land. Two were found by the figure-leak and paraphrase
sweeps run for this re-verification; both proposed fixes are measured, not predicted.

### A. `q.science.b2.b2-fertilisation-pregnancy.0013`, part `main` — three QWC points can be collected off the figure's own labels

The `<title>` leak is closed, but the figure still prints the anatomical labels `ovary`, `oviduct`,
`uterus` and `the thickened lining`, and three of the seven indicative points key on bare
`oviduct` / `uterus` / `lining`. **Measured:** an answer made only of those labels —
`The ovary is on the left and the oviduct runs from it to the uterus on the right. Inside the uterus there
is the thickened lining. There are five stations numbered along the route…` — shows **3 of 7 points,
band B, floor 3/6**, having described no event at all. This is the same fault the infertility bundle's
finding 8 fixed.

Fix (keeps the labels on the diagram, which an exam figure needs, and moves the demand into the point):

- `indicativeContent[0].keyWords` → `["fertilisation happens in the oviduct","fertilisation takes place in the oviduct","fertilisation occurs in the oviduct","fertilised in the oviduct","fertilisation in the oviduct","reaches the ovum in the oviduct"]`
- `indicativeContent[4].keyWords` → `["ball of cells","identical cells","ball of identical","down the oviduct to the uterus","travels to the uterus","moves to the uterus"]`
- `indicativeContent[5].keyWords` → `["implant","implantation","lining of the uterus","uterus lining"]`

**Verified with `qwcEvidence`:** the labels-only answer falls to **0 of 7 (band 0)**; the pack's worked
solution stays **7 of 7 (band A)** and a fresh full paraphrase is **7 of 7 (band A)**.

### B. `q.science.b2.b2-infertility-contraception.0001`, part `main` — group 1 only matches "changes hormone levels" as a contiguous phrase

`any` holds `changes hormone levels`, `change hormone levels`, `changes the hormone levels`,
`alters hormone levels`, `contains hormones`, `contains a hormone`, `raises hormone levels`. An article or
possessive between the words breaks every one of them. **Measured, all 1/2 today:**

- `The pill alters her hormone levels, so no ovum matures and none is released.`
- `It changes her hormone levels so that no ovum develops.`
- `It changes the level of hormones in her body, so no ovum is released.`
- `The pill gives her hormones, so no ovum develops or is released.`

Each is the scheme's own P1 (`it contains hormones / changes hormone levels`) in ordinary words, and each
is told `1 of 2: still missing changes hormone levels`. Same class as `b2-reproductive-systems` findings 4
and 5, which were fixed.

Fix: append to `keyWords[0].any` →
`"hormone levels","level of hormones","levels of hormones","hormones in her body","gives her hormones","supplies hormones"`.
**Verified with `markAnswer`:** all four sentences above go to **2/2**; the worked solution, the accepted
answer and the barrier denial stay 2/2; `it is a barrier that stops the sperm reaching the ovum`,
`it kills the sperm before they reach the ovum` and `it cuts the sperm tubes so the sperm cannot leave`
all stay **0/2**, the first two still tagged.

### C. `b2-sex-hormones-menstrual-cycle` — one Sheet trap is listed twice

`note.sheet.traps[1]` is `Saying the lining thickens after day 28 when no fertilisation has happened: on
Summer 2025 B2 Foundation Q6 the mark went to answers saying it became thinner or broke down`;
`traps[6]` is the same sentence without the citation. Fix: delete `traps[6]` and keep the cited one.
(No other duplicate in any of the four Sheets; every examiner source is answered.)

### Noted, not open

- `q…0008 c` in `b2-reproductive-systems`: the added bare `cool` matches by the engine's 4+ letter
  inflection rule, so a sentence like `the scrotum is a cool colour` would score 1/1. It is not a
  plausible answer to "Give one reason why the testes are held outside the body", and dropping `cool`
  would cost `it keeps the testes cool`, which the report explicitly wanted. Left as it is.
- `q.science.b2.b2-infertility-contraception.0007`'s table figure prints `1250`, `400`, `500`, `55` —
  these are the question's given data, quoted back in part `b`'s accepted answer, not an answer leak.
