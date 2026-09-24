# 01 — Art direction

20 September 2026. Written so a developer can implement it without asking a question. Every value is concrete; where a number is a judgement it says so. Token values are in `tokens.css`; per-surface layouts are in `02-surfaces.md`; the order of work is in `03-implementation-plan.md`.

> **Amended 20 September 2026, after `04-critique.md`.** Seven changes, all taken:
> - **§2 The margin rule is cut from four uses to two**, and a marked object now changes its whole edge: a **2 px border** in the outcome colour against the 1 px of every unmarked object, a **4 px** left rule, and the verdict word at **21 px**. A 3 px line is not the "unmistakable state change" this document borrows from Duolingo, and it is not an identity either. The signature is stated plainly instead: **paper, Literata, stone.**
> - **§4.5 the phrase "a wrong answer is simply *unmarked*" is deleted.** It was honest about the colour and evasive about the card, and an implementation that took its mood rather than its facts would drop the struck code and the "0 of N" for being negative. **Both are now mandatory and lintable.**
> - **§4.5 `--miss` loses its blue.** It was within fourteen degrees and zero lightness units of the maths accent, so "not yet" and "the thing to do next" were one colour twice.
> - **§7 figure labels are specified in viewBox units** (24 below `md`, 14 from `md`), because `generated.tsx` has `W = 640` rendered `w-full` and the old "13 px" instruction rendered at **7.3 px** on a phone — the type floor broken by the one artwork we own.
> - **§3.4 KaTeX returns to 1.06em** and the inline stacked fraction becomes a content lint. The earlier 1em instruction was wrong about its own reason.
> - **§13 the display title comes from `spokenTitle`**, which ships. The `hero.short` fallback chain is deleted: **zero of 156 bundles carry that field**, so the chain's first link was fictional.
> - **§13 "Pause here" is specified** rather than merely carried forward from the showcase.
>
> **One correction to the critique, not a disagreement.** §7.9 predicts the display-title test "should fail until the content session adds `hero.short`", on the grounds that a truncating fallback would yield "Simplifying, multiplying" for M3. Run over all 156 shipped bundles, `spokenTitle` returns **one** single-word output — "Pressure", which is a genuine one-word title — and **nothing** ending in a comma or "and". So the test passes today, and the content session is not blocking.

---

## 1. The personality, in one paragraph

**Cairn looks like a field notebook kept on a hill.** Warm paper, printing ink, a ruled line, and a small number of solid objects placed on the page — never a dashboard, never a feed, never a deck of cards. Its colours come from Northern Irish stone and weather: wet basalt, heather, the lichen on the cairn itself. It does not glow, gradient, bounce or celebrate. It is calm because it is uncluttered, exact because its measurements are consistent, and warm because the paper is warm and the ink is not black. A page of it should look like something a careful person made for one other person — which is what it is.

Four words to test any decision against: **calm, exact, warm, ours.** If a treatment could have come off a component library, it fails *ours*. If it needs an explanation, it fails *exact*. If it is louder than the sentence it sits beside, it fails *calm*.

### What this continues from the 19 September showcase

`docs/design/showcase/cairn-top-tier-edition.html` and its three screenshots already settled most of this, and none of it is being restarted. Carried forward unchanged:

- The short plain-English display title in Literata, with the lede beneath it ("What changes an enzyme's rate", not the CCEA statement).
- Warm neutral greys with pure-white objects on them.
- One accent hue per subject, derived rather than picked per component.
- Labels **on** the figure with leader lines, never a key.
- A segmented progress rail at the top of the lesson, and a "Pause here" stopping point beside the next section.

Three things this document adds or changes:

1. **The hero order.** The showcase never had to answer where the primary button goes, because the mock opens mid-lesson. It goes above the fold; see §13.
2. **The subject accent and the "correct" green must be different colours.** In the showcase phone mock they are the same green: the accent-filled option letter, the green verdict line and the green *Section 4* button are indistinguishable, so on a biology page "this is science" and "this is right" look identical. Here science is pine (hue 160, L38) and `--ok` is grass (hue 148, L45), and the rule is absolute: `--ok` never appears in a subject's chrome, and a subject hue never appears inside a marking surface.
3. **Chroma comes down.** The showcase greens and the live app's blue both sit around chroma 50–60. Everything here is 12–26. That is the single change that moves the product from "a nicely made web app" to stone.

### The signature: paper, Literata, stone

Restraint on its own is not an identity. Cairn's identity is three things a bus aisle could actually recognise at a glance: **the warm paper**, **Literata carrying real prose**, and **the stone**. Nothing smaller than those carries the brand, and no 3 px line ever will — an earlier draft of this document called the margin rule "the signature", which invited the implementation to spend on a hairline and then wonder why she saw no identity.

### The margin rule: a state carrier, two uses

A teacher marking a paper draws down the margin. We do the same, for exactly two meanings:

| Where | Rule | Colour | Meaning |
|---|---|---|---|
| A marked object (a question, a gate, a check) | **4 px** left | `--ok` / `--warn` / `--miss` | **This has been judged.** |
| The current section in the spine | 3 px left | `--accent` | **You are here.** |

Nothing else takes a left rule: not a paragraph, not a callout, not a tile, not a nav item, not an examiner's quote (that is a recess with a `Quote` icon and needs no rule), not a unit list.

**The rule that keeps the two apart:** `--accent` never appears as a rule *inside* an object. A rule inside an object is always a verdict. That, plus `--miss` losing its blue in `tokens.css`, is what stops "not yet" and "the thing to do next" reading as the same dark grey-blue on the surface she uses most.

**A marked object changes its whole edge, not just its margin.** A 3 px line you have to look for is not the unmistakable state change this document borrows from Duolingo (§5, "Duolingo — clarity and immediate feedback"). So:

- **Unmarked object:** 1 px `--line-2` border all round.
- **Marked object:** **2 px** border all round in the outcome colour, plus the 4 px left rule, plus the glyph, plus the verdict word at **`--fs-h2` 21 px** (not 18), plus the mark meter, plus the mark code.

Six signals, of which exactly one is colour. At arm's length the edge is what she sees; at reading distance the word and the code are what she uses.

The second, quieter device is the **section rule**: a hairline across the measure with a numbered sentence-case label beneath it (§3.3). Together with the margin rule they are the notebook — ruled lines across, a marker's stroke down the margin.

### The five refusals

1. **No gradient, no glow, no glass, no blur behind content.** The only `backdrop-filter` in the product is the sticky Check bar and it is 85% opacity of the surface, nothing more.
2. **No decorative imagery.** Both research files ban it independently (`06`: "Ban decorative imagery, background music and animated mascots on content screens"; `07`: "no decorative art"). The only pictures are our own computed figures and the third-party media she asked for.
3. **No confetti, XP, coins, hearts, streaks, leagues or mascot.** Already law in `emotional-design.md`; restated here because it is also an *art-direction* rule: nothing in the visual language may imply a score.
4. **No motion on scroll.** Nothing parallaxes, reveals on scroll, or lifts on hover. Movement answers an action, never a scroll position.
5. **No colour used to say "no".** Green marks a thing as proved. Nothing is marked red for being wrong. Red exists in exactly one place: a destructive control.

---

## 2. The cairn motif

The motif is the **stacked stone**: a small SVG of three (sometimes four) rounded rectangles, tapering upward, in `currentColor` at descending opacity — `RowanMark.tsx` already draws it correctly and is the single implementation.

### Where it appears — five places, and no more

| Place | Size | Rule |
|---|---|---|
| The wordmark | 26 px | Always. The only place it is ever beside the word "Cairn". |
| The lesson spine, beside a section she has finished | 12 px | Replaces the tick. A finished section is a stone placed, not a task ticked. |
| The close card, when a topic reaches Proficient | 24 px, 4 stones, `stone-settle` 300 ms | Once per session at most. |
| Today's "Your cairn" tile | 20 px | A count, never a target. |
| The Map, per unit | 24 px | The unit's stack. |

### Where it never appears

Inside a question or an answer field. On a button. As a loading indicator. As a list bullet. As a background watermark or a section divider. In an empty state. More than once on a screen. Animated for any reason other than a stone being genuinely placed. Tinted with a subject colour — the stone is always `currentColor`, because a stone is not a subject.

**The rule that keeps it from becoming a mascot:** a stone is only ever *placed*. It is never removed, never greyed out for absence, never shown as "missing", and a decayed topic shows as a **paler** stone (opacity 0.45) with no message.

---

## 3. Type

### The two faces

| Role | Face | Fallback stack | Why |
|---|---|---|---|
| The lesson voice — notes, headings inside a lesson, the topic display title, the hero lede, Rowan | **Literata** (SIL OFL, self-hosted, 4 woff2 files already in `public/fonts`) | `Georgia, "Times New Roman", serif` | A screen-first serif designed for long reading. Georgia is on every device she will use, has a comparable x-height, and degrades without reflowing badly. |
| Everything she operates or counts — buttons, fields, labels, chips, nav, tables, meta, mark codes | **Inter** (already loaded via `next/font`, `--font-inter`) | `ui-sans-serif, system-ui, sans-serif` | Tabular numerals (`tnum`), slashed zero, real optical sizing. |
| Maths | **KaTeX** (its own OFL fonts) | — | See §3.4. |

There is no third face. There is no monospace face: mark codes (`MA1`, `A1`) use Inter with `font-variant-numeric: tabular-nums` and letterspacing 0.02 em, which reads as a code without loading a fourth font.

**The boundary rule, already correct in `globals.css` and to be kept:** inside `.prose-note`, any `button, input, select, textarea, label, .tnum` reverts to Inter. Literata narrates; Inter is operated.

### The scale

Phone first. The `md` column applies from 768 px.

| Token | Phone | md | Leading | Face | Used for |
|---|---|---|---|---|---|
| `--fs-display` | **30 px** | 40 px | 1.15 / 1.1 | Literata 500 | The topic's short plain-English title. One per page. |
| `--fs-h1` | **26 px** | 32 px | 1.2 | Inter 600 | Page titles: Today, Your papers, Unit M4. |
| `--fs-h2` | **21 px** | 24 px | 1.3 | Literata 500 in a lesson, Inter 600 elsewhere | A numbered lesson section; a stage heading. |
| `--fs-h3` | **18 px** | 19 px | 1.35 | Inter 600 | A question stem's lead-in; a tile heading. |
| `--fs-prose` | **17 px** | 18 px | 1.62 | Literata 400 | All learning prose. |
| `--fs-ui` | **15 px** | 15 px | 1.5 | Inter 400/500 | Buttons, options, fields, list rows, captions. |
| `--fs-meta` | **14 px** | 14 px | 1.45 | Inter 400 | Section labels, figure captions, source lines, counts. |
| `--fs-micro` | **13 px** | 13 px | 1.4 | Inter 500 `tnum` | **Tabular numerals only.** A mark-code chip, a UMS figure in a table. Never prose, never a label, never a caption. |

**Below 13 px nothing exists.** `text-[12px]`, `text-[11px]` and `text-[10px]` (113 instances today) are deleted from the vocabulary.

Weights: 400 body, 500 emphasis and headings, 600 for `h1`/`h3` and buttons. **No 700.** Literata is never set below 400 or above 600 (the variable font's range).

Tracking: `-0.015 em` on `--fs-display`, `-0.01 em` on `--fs-h1`, `0` everywhere else. **Letterspaced uppercase is abolished** — see §3.3.

### 3.3 The death of the eyebrow

The 52 uppercase letterspaced grey labels are replaced by **one** piece of furniture:

```
.section-rule  →  border-top: 1px solid var(--line);
                  padding-top: 14px;
                  margin-top: var(--gap-section);
```
followed by a **sentence-case label**: `--fs-meta`, Inter 500, `--ink-2`, no tracking, no capitals.

> ─────────────────────────────────
> 3 · Reading a histogram back · 2 min

The rule does the work the capitals were doing (it says "a new thing starts here") and costs nothing to read. The number, the title and the minutes are three facts in one line, in sentence case, at a size she can read.

**The one surviving use of uppercase** is the page locator — `MATHS · UNIT M4 · HANDLING DATA` — at 13 px, tracking 0.06 em, `--ink-3`. It is a breadcrumb, not a heading, and it appears once per page. Everywhere else, capitals are a bug.

### Measure and alignment

- Learning prose: `--measure` = **66 ch** (≈ 620 px at 18 px Literata). Already correct in `.prose-note`.
- Hero lede and close-card copy: `--measure-tight` = **46 ch**. A short line reads as a statement; a 66 ch lede reads as an introduction to something else.
- **Everything is left-aligned, ragged right.** No centring except: a figure inside its frame, a single number in a stat tile, and the option letter in its badge. No justification anywhere (GOV.UK dyslexia guidance).
- No italics for emphasis — `strong` at 600 only. Italic Literata exists and is used for one thing: a quoted examiner sentence.
- No underline except on links in running prose, at `text-underline-offset: 3px`, `text-decoration-thickness: 1px`, in `--accent`.

### 3.4 Maths

KaTeX, `output: "htmlAndMathml"`, `throwOnError: false`.

- **Inline maths: `.katex { font-size: 1.06em }`.** KaTeX's own default is 1.21 em. An earlier draft of this document pulled it to 1em, on the impression that inline fractions sat proud of the line; that impression is the fraction's *height*, not its size, and 1em does not change it — it only shrinks every symbol, and KaTeX_Main's x-height is **smaller** than Literata's, so an inline `x` at 1em reads about a tenth small beside the words around it. 1.06 stands. Try 1.1 by eye on the `0 < t ⩽ 10` stem at 390 px before settling.
- **Display maths: `.katex-display { font-size: 1.1em; margin: 0.7em 0 }`**, `overflow-x: auto`, `overflow-y: hidden` — but see the Further Maths rule below, because a scrollbar is the fallback, not the plan.
- Colour is `var(--ink)`. Maths is never accent-coloured, never highlighted with a background, and never bold.
- **Inline stacked fractions are a content lint, not a renderer rule.** An inline `\frac` sets numerator and denominator at scriptstyle, 0.7 em: 17 × 1.06 × 0.7 = **12.6 px**, under the floor. So in running prose, prefer a solidus or ÷ ("frequency ÷ class width"); where a stack is unavoidable inline, `\tfrac` at most; `\dfrac` belongs in a stem or a display block and never in a line of prose. (This reverses the earlier instruction here, which asked for exactly the thing that breaks the floor.)
- **Display maths must not hide its right-hand end.** At 390 px the measure is 358 px, and an FM product-rule derivative or a determinant expansion at 18.7 px runs 300–400 px. `overflow-x: auto` on a phone hides the end of the equation behind a scrollbar iOS does not draw — and the end of the equation is the answer. So: display maths **steps down** before it scrolls, 1.1 → 1.0 → 0.92 em, with glyphs never under 13 px; only past that does it scroll. `03` makes the corpus-wide count of overflowing `.katex-display` a precondition of pass 2, and the content brief gets the matching rule that one equality goes on one line.
- Maths inside a button or a chip is forbidden: it breaks the Inter boundary and the tabular alignment. If an option's text is an expression, the option is rendered as prose with the letter badge beside it (as today).

---

## 4. Colour

Values in `tokens.css`. This section says what each one is *for*.

### 4.1 The paper and the ink

The whole system rests on one relationship: **the page is warm off-white, and an object placed on it is pure white.**

- `--ground` `lch(97.5% 2.4 85)` — warm paper.
- `--surface` `lch(100% 0 0)` — pure white, for objects only.
- `--surface-2` `lch(95% 2.2 85)` — the recess, for reference.

That gap is why **nothing needs a drop shadow**. `--shadow-1` becomes `none`. Today 91 containers carry both a border and a shadow; a page of nine faintly floating boxes is what "intense" looks like from ten feet away.

Ink is `lch(18% 3 85)` — warm near-black, 13.1:1 on the ground. Not `#000`, which on a bright phone outdoors is a printing error.

`--ink-3` moves from `lch(60% …)` to `lch(46% …)`. This is the highest-leverage colour change in the file: at 60% it is **2.98:1** and carries every caption, label and meta line in the product. At 46% it is **4.87:1** — still visibly quiet, now actually readable. If something must be lighter than `--ink-3`, it is not text; it is `--line`.

`--ink-2` moves to `lch(36% …)`, **7.0:1**. An earlier draft had it at 42%, four lightness units from `--ink-3`, which meant the product had two inks rather than three — and the hierarchy this document assigns to ink-2 against ink-3, dozens of times across §§4–12 and all of `02`, did not exist on the page. Four units is not a distinction; it is a rounding error with two names. The steps are now **18 and 10**.

> **The two-grey rule.** Below 18 px, at most **two** text greys appear on any one surface: `--ink` and `--ink-2`. `--ink-3` has exactly three legal uses and no fourth — **the page locator, a figure caption, and the minutes in the spine**. Everywhere else, quiet means `--ink-2`. This is what stops the third tone being spent on furniture and then being unavailable when something genuinely needs to recede.

### 4.2 The three surfaces

This is the structural idea, not a colour decision, and it is the second-largest change after the hero.

| Surface | Token | Treatment | What lives here |
|---|---|---|---|
| **Page** | `--ground` | No border, no background, no shadow. Just the paper. | All learning prose. Section headings. Figures and their captions. Empty states. The close card's numbers. |
| **Object** | `--surface` | 1px `--line-2` border, `--radius` 12 px, `--shadow-1` (= none), padding 20 px (24 from `sm`). | Only things she **acts on**: a gate, a question, an option group, a feedback card, a Today tile, a flashcard. |
| **Recess** | `--surface-2` | No border, `--radius-sm` 8 px, padding 16 px. | Only things she **consults**: the Sheet, the spec row, "Not on this spec", formula lines, external links, licence and attribution, the Checked panel. |

**The rule:** prose is never inside an object. If a container holds no control and nothing to answer, it is either the page or a recess. That rule alone removes roughly 60 of the 91 cards and turns a topic from a stack of boxes into a document with a handful of objects in it.

**Nesting is capped at one level.** An object may contain a recess. A recess may not contain an object. Two objects may never be nested — the dashed gate box inside the white section card inside the page (`topic-heart-phone-scroll1.png`) is the exact pattern being abolished, and the dashed border with it.

### 4.3 The accent: one per screen

`--accent` means **"the one thing to do next"**. The rule, stated so it can be tested: **at most one accent-*filled* control on any screen** — one button or link whose computed background is `--accent`.

Two clarifications the first draft needed. A 6 px objective dot is not a control and must not be accent: those become `--ink-3`, because three coloured dots beside the one accented button is four accents by eye whatever the rule says. And the spine's current segment is an **outline** — a transparent fill with a 1 px accent inset ring — not a fill, so it reads as *position* rather than as a second thing to press.

- Chroma drops from **60 to 30**. Halving the chroma is what turns a SaaS button into a stone. Hue moves 270 → 250 (wet slate).
- On a page with no subject (Today, Papers, Map, Flashcards, Settings) the accent is the root slate at `lch(40% 30 250)` — a dark blue-grey that reads almost as ink.
- On a subject's pages `data-subject` swaps the hue **and the chroma**, so the Start button on a maths topic is basalt and on a science topic is lichen. That is the subject wayfinding the tints were defined for and never delivered.

| Subject | Hue | Colour | White text |
|---|---|---|---|
| Maths | 248, C 34, L 40% | wet slate — Mourne basalt after rain | 6.5:1 |
| Further Maths | 322, C 32, L 42% | heather | 6.0:1 |
| Science | 160, C 30, L 38% | lichen | 7.0:1 |

### 4.4 Selection is ink; the action is accent

The `practise` page currently shows three "chosen" colours in one viewport. One rule fixes it:

- **A selected state is `--ink`** (filled ink, `--surface` text) — chips, toggles, segmented controls, the chosen MCQ option's letter badge.
- **The forward action is `--accent`** — exactly one per screen: Start, Check, Next, Begin.
- **The active navigation item** is `--ink` text on `--accent-3` (the 97% wash), never a filled pill.

Accent and selection never appear inside the same control group.

### 4.5 The three outcomes

Correct, part way, and not yet. None of them shames.

| Outcome | Colour | Non-colour signals (all mandatory) | Object treatment |
|---|---|---|---|
| **Correct** | `--ok` `lch(45% 42 148)` fern, 5.05:1 | Tick drawing in over 250 ms · "That's it." at 21 px · meter filled · mark code shown **earned** | 2 px `--ok` border + 4 px `--ok` left rule |
| **Part way** | `--warn` `lch(46% 48 66)` burnt ochre, 4.87:1 | Half-circle glyph · "Part way there" at 21 px · **"1 of 2 marks"** · `M1` earned and `A1` **struck** | 2 px `--warn` border + 4 px `--warn` left rule |
| **Not yet** | `--miss` `lch(40% 3 base-h)` — **the warm neutral of the ink, never red and never blue** | Circle-dash glyph · "Not yet" at 21 px · **"0 of 1 mark"** · the code **struck** | 2 px `--miss` border + 4 px `--miss` left rule |

Three consequences, and the first two are lints, not preferences:

1. **"0 of N" and the struck mark code are mandatory on every not-yet and part-way card.** A not-yet card that shows neither is a lint failure. This rule exists because the calm register is one step from a shrug, and a shrug after a *confident* wrong answer is precisely what hypercorrection cannot survive: she has to see that a mark was available and was not earned, in CCEA's own code, or the confidence scale is decoration.
2. **A marked object is unmistakable at arm's length.** Today it is not (`audit/practice-miss-phone.png`): a miss and a paragraph are the same white rectangle. The 2 px outcome border changes the whole edge; the 4 px rule and the 21 px verdict word carry it at reading distance.
3. **Colour is never the signal on its own, and red is never used at all.** Red is what her mocks will give her; there is no version of it here, not even a soft one. But calm is a register, not an omission — the *facts* of the card are complete and blunt, and only the *colour* is quiet.

`--danger` `lch(45% 58 28)` is the only red in the product. It appears on destructive controls — "Forget everything", "Delete this backup" — and nowhere else. Splitting it out of `--miss` is what allows `--miss` to go calm.

### 4.6 The subject tints, finally given a job

Today they exist as a decorative 6 px × 48 px bar above two card headings (`taxonomy.ts:75,82,89` → `app/learn/page.tsx:23`, `app/flashcards/page.tsx:17`), and `tint-chem` and `tint-phys` are used nowhere. Delete that bar; it reads as a leftover skeleton.

**Two jobs replace it, and no third:**

1. **The spine's unfilled track** (`--tint-*`), with the done segments in `--accent` and the current one outlined.
2. **The wash behind the active row** of the spine (`--accent-3`).

**Cut, on the critique's argument and rightly:** the tint band and 3 px accent rail behind a unit's topic list and the flashcards index. A whole region washed in a subject colour with a rail beside it is the decorative tint bar we just deleted, scaled up to a region — and the unit list is the one screen the learner praised as it is, which the 13 September review says not to touch beyond dropping the pill. Keep the rows, the glyph gutter and the deletion of the difficulty meter; cut the band.

The subject colour is therefore carried by **the accent on the primary control** and by the spine, which is enough: she is looking at the button anyway, and it is basalt on maths and lichen on science.

Never: behind prose, behind a question, on a button, as a card background, behind a list, or on more than one element per screen.

### 4.7 The difficulty meter must stop being red

Five red squares labelled "Where marks are lost" beside a topic title is an alarm about a topic she has not opened. Replace the whole component:

- Difficulty is **not shown on the contents page at all**. It is a verdict before she starts and it is the first thing she reads.
- **Nothing replaces it.** An earlier draft put a recessed "Examiners flag this one" chip on the ~56 topics carrying an insight card. That is 56 of 104 rows — and this document's own argument against the "Lesson and practice" pill is that a label true of most rows says nothing. Provenance belongs **inside** the topic: in the "In the exam" recess and on the miss card, where it already is and where it is a named series and question number rather than a badge.
- Inside the topic, once she has started, the honest difficulty appears in the "In the exam" recess where it belongs, as a sentence.

### 4.8 Dark

Dark is a different paper, not an inversion.

- Ground rises from 10% to **13%**, surface to 17%, recess to 21%. At 10% on OLED, white Literata blooms; and with `--shadow-1: none` the three surfaces need real separation of their own.
- `--ink-3` rises 55% → **62%** (5.4:1 on the new ground).
- Accent lightness 74%, chroma 34, with `--accent-ink` at 14% — the button becomes a light stone with dark text.
- **Figures must be told to invert properly.** They are authored as `currentColor` with `fill-opacity: 0.18`, which on dark becomes a pale wash and on the current dark ground becomes a smudge. `--fig-fill` rises 0.08 → 0.14 and `--fig-fill-accent` 0.16 → 0.26 in dark; because these are tokens, none of the 264 SVGs is re-authored.
- Default theme stays `system`. Light is the argument — exam papers are black on white — but the argument is ours, not hers, and the setting already honours the device.

---

## 5. Space, shape, elevation

### Spacing

4 px base. The values that matter are named:

| Token | Phone | md | Where |
|---|---|---|---|
| `--gap-para` | 20 px | 20 px | Between paragraphs in a note |
| `--gap-section` | 40 px | 48 px | Above a `.section-rule` |
| `--gap-stage` | 64 px | 80 px | Between stages (lesson → worked examples → practice → in the exam) |

Other constants: page gutter **16 px** at 390 px, 24 px from `sm`, 32 px from `lg`. Object padding **20 px** (24 from `sm`). Recess padding **16 px**. Gap between stacked objects **12 px**. Gap inside a control group **8 px**.

**One vertical rhythm rule:** a figure is separated from the paragraph it illustrates by 16 px above and 12 px below its caption — tighter than `--gap-para` — so that the figure reads as belonging to the sentence above it (Mayer's spatial contiguity), not as a separate object.

### Radius

`--radius` **12 px** (objects), `--radius-sm` **8 px** (recesses, fields, buttons), `--radius-xs` **5 px** (mark-code chips, option letters), `--radius-pill` (mastery chip, next-paper chip — exactly two components). 14 px was slightly bubbly; 12 reads as exact.

### Elevation — two levels, not five

1. **Resting**: no shadow. Objects are carried by pure white on warm paper plus a `--line-2` hairline.
2. **Floating**: `--shadow-2`, for the two things that genuinely sit above content — the sticky Check bar, and the section sheet the spine opens. Nothing else.

There is no hover-lift, no pressed shadow, no focus shadow (focus is a 2 px accent outline at 2 px offset, already correct).

### Borders

`--line` is a rule (between list rows, under a section label). `--line-2` is a container edge. **`--line-3` is a control edge** — an input, an option button, a segmented chip — at 3.1:1, because WCAG 1.4.11 requires 3:1 where the boundary is the only thing identifying a control. `fieldCls` and `btnOption` currently use `--line-2` at 2.0:1 and fail it.

Dashed borders: **abolished.** They read as placeholder. A gate is an object with a solid border and a label.

---

## 6. Motion

| Thing | Duration | Easing | Properties |
|---|---|---|---|
| Press (button, option) | `--dur-fast` 120 ms | `--ease-out` | `transform: scale(0.98)` |
| Gate reveal, feedback card, next question | `--dur` 200 ms | `--ease-out` | `opacity` 0→1, `translateY` 8px→0 |
| Tick drawing in | 250 ms | `cubic-bezier(0.2,0.8,0.2,1)` | `pathLength` |
| Progress line / spine fill | 200 ms | `--ease-out` | `transform: scaleX` |
| Stone settling | `--dur-slow` 300 ms | `--ease-out` | `opacity`, `translateY(-6px)`, `scale(0.96)` |
| Section sheet opening | 200 ms | `--ease-out` | `opacity`, `translateY` |

**Only `transform` and `opacity` animate.** Never `height`, `width`, `top`, `background-color` or `box-shadow`.

**What never moves:** anything on scroll. Anything on hover. Cards. Figures. The wordmark. Rowan's mark, except the one stone that settles when a stone is genuinely placed. Skeletons travel nowhere — they pulse opacity 0.55 ↔ 1 over 1.4 s.

**Reduced motion:** every animated component takes `initial={false}` and renders its final pose. The acceptance test is `document.getAnimations().length === 0` under `prefers-reduced-motion: reduce`.

Haptics: `navigator.vibrate(8)` on a grading tap, touch devices only, never with reduced motion, never on desktop.

---

## 7. Figures

The 264 computed SVGs are the only artwork the product owns. They are currently flat monochrome. Making them two-colour is the cheapest large visual upgrade available, and it is also a *teaching* upgrade, because it lets a figure point at the thing the sentence is about.

### The treatment

| Element | Stroke | Fill | Colour |
|---|---|---|---|
| Axes and grid | 1 px | — | `currentColor` at `--fig-grid` (0.12) |
| Ordinary data (a bar, a shape, a line) | `--fig-stroke` 1.75 px | `currentColor` at `--fig-fill` (0.08) | ink |
| **The one element under discussion** | `--fig-stroke-accent` 2.25 px | `var(--accent)` at `--fig-fill-accent` (0.16) | accent |
| Construction lines, the median's drop line | 1.25 px dashed `4 3` | — | ink at 0.4 |
| Labels on the figure | — | — | `--ink`, Inter 500, **sized in viewBox units — see below**, with `paint-order: stroke` and a 3.5 px `--fig-halo` stroke so a label survives over a gridline |

### Figure label size: viewBox units, not CSS pixels

This is the one place the type floor was being broken by the product's own artwork, and it is worth the paragraph.

`src/components/figures/generated.tsx` sets **`W = 640`** (line 16) and renders the SVG `w-full`. At 390 px with 16 px gutters the SVG is **358 px** wide, a scale of **0.56**. So `fontSize={13}` at line 55 renders at **7.3 px** — a little over half the 13 px floor this document is proudest of, on every one of the 264 figures, on every phone. A `font-size` inside a `viewBox` is not a CSS pixel; it is a viewBox unit, and it scales with the box.

| Breakpoint | Label size, viewBox units (W = 640) | Renders at |
|---|---|---|
| below `md` (358 px wide) | **24** (`--fig-label`) | 13.4 px |
| `md` and above (up to 640 px wide) | **14** (`--fig-label-md`) | 14 px at full width |

Axis numerals additionally take `font-variant-numeric: tabular-nums` so they align in a column.

**The acceptance test** (`03`, pass 2): for every `svg[viewBox]` in the viewport at 390 px, `fontSize × clientWidth / viewBoxWidth ≥ 13`.

One more thing the generator owner needs to know: `fillOpacity={0.18}` is **hard-coded at line 106**, so `--fig-fill` is not read today and the dark-mode legibility fix in `tokens.css` does nothing until that line takes the token.

**One accent element per figure. Never two.** If two things must be distinguished, the second is distinguished by a dashed stroke or a label, not by a second colour.

**Labels go on the figure, never in a key.** Our own research is unambiguous: "labels *on* the diagram, not in a key" (`06`, CLT presentation hygiene). Every legend in a computed figure becomes an inline label with a short leader line.

**Colour is never the only signal.** An accented bar also carries its value as a label. A highlighted region also carries a dashed boundary. A figure must survive being printed in grey — that is the test, and it matches the exam paper she will actually sit.

### Captions

`--fs-meta` 14 px, `--ink-2`, on the page (not in a box), 12 px under the figure, max `--measure`. A caption says *what to notice*, never what it is: "The tallest bar is the second, even though the third class holds fewer values per bar of width" — not "A histogram."

Every figure keeps its `role="img"`, `aria-label` from `alt`, and `<title>`.

### Wrong-answer figures (the Brilliant borrow)

Where a figure exists for a question and the miss is one of the authored 2,612 common errors, the figure re-renders to show *her* answer against the right one — her bar drawn at her height in ink-dash, the correct bar in accent — **before** the prose diagnosis. 200 ms, opacity and transform. This is the single highest-value interaction upgrade in the document, and it costs no new artwork because the figures are computed.

---

## 8. Photography and third-party media

We commission nothing. There is no illustration programme and no photography budget, and our own research bans decorative imagery twice.

Three kinds of image exist:

1. **Our figures** (§7).
2. **Video facades** — 699 YouTube thumbnails.
3. **Required photographs** — apparatus in a science note, where the note's brief already requires a prompt beside it.

### The treatment for (2) and (3)

The problem today is that a third-party thumbnail is the loudest and widest object in a Cairn lesson. The fix is to change its *role*, not its colour:

- A video is a **row, not a banner**: a 112 × 63 px thumbnail (160 × 90 from `md`) on the left, the title and source on the right, the whole row an object at `--surface` with a 52 px minimum height. Not a 16:9 full-width image.
- The thumbnail is `filter: saturate(0.75)` with a `--ink` overlay at 6% and `--radius-sm`. Enough to sit inside our palette; not so much that it looks broken.
- The play affordance is a 32 px circle in `--surface` with a 14 px ink triangle. Not the YouTube chrome.
- **Attribution and licence move into a recess**, one line at `--fs-meta` `--ink-2`, with anything longer than one line behind a `<details>` labelled "Source". The four lines of GeoGebra licence text in the middle of a lesson become one line reading "GeoGebra applet, used under its non-commercial licence" with the URL inside the disclosure.
- The required "watching is not practice" sentence stays — but as the label *on the gate that follows*, not as a third line of grey caption.

A photograph in a science note is treated identically: object row, 112 px, desaturated, caption in the recess.

---

## 9. Icons

`lucide-react`, already a dependency.

- **Stroke 1.5** everywhere (lucide's default is 2; pass `strokeWidth={1.5}`).
- Sizes: **16 px** inside a button, **18 px** in body text and list rows, **20 px** in navigation, **24 px** never except the nav's active item on desktop.
- Colour: `currentColor`, always. An icon is never accent-coloured on its own.
- **An icon is never a control by itself** except in the bottom tab bar, where a text label sits beneath it. Every other icon is paired with a word in the same element.
- **No filled icons. No duotone. No emoji, anywhere, ever** (the companion constitution already forbids emoji in copy; this extends it to the interface).
- The icon vocabulary is small and fixed: `ArrowRight` (forward), `Check` (done), `Quote` (an examiner's words), `Lightbulb` (a hint), `BookOpen` (a worked example), `Wrench` (fix it now), `Timer` (a timed run), `ExternalLink` (leaves the app), `Trash2` (destructive), `ChevronDown` (a disclosure). Adding an eleventh requires deleting one.

---

## 10. Empty states

One formula, on the page ground, never in a card:

1. A sentence in `--fs-ui` `--ink-2` saying **what will fill this space**, in the future tense.
2. **One** action, as a secondary button — or no action if there genuinely is none.
3. Nothing else. No illustration, no icon, no large zero, no "0 items".
4. 48 px of air above and below.

Examples, to be used verbatim:

| Surface | Copy |
|---|---|
| Today, nothing due | "Nothing back tonight. Ten minutes on something new is enough." → *Learn* |
| Map, nothing proved | "Stones appear here as you prove topics in a later mixed set. None yet." → *Start a topic* |
| Papers, no runs | "When you sit a paper against the clock, its raw mark, UMS and grade appear here." → *Sit one* |
| A topic with no practice sets | "This topic has its questions but no mixed set yet. The lesson and the check are complete." → *no action* |
| Flashcards, unit not built | "coming" (unchanged — it is already honest and quiet) |

**The word "None" is never a heading, and a large "0" is never displayed.** "0 / 4" on Today's week tile becomes four hollow stones and the line "Four evenings is the plan." — a plan, not a score.

---

## 11. Loading states

- Skeletons are **the shape of the content**, at `--surface-2`, radius matching the thing they replace, pulsing opacity 0.55 ↔ 1 over 1.4 s. They never shimmer or travel.
- **Never a spinner.** Anywhere.
- **Never shorter than 200 ms** — a skeleton that flashes is worse than no skeleton. If the data is known to arrive faster, render nothing.
- **Never longer than 3 s without a sentence.** At 3 s the skeleton is replaced by a line in `--ink-2`: "Still loading. Everything is on your device, so this is unusual."
- The topic hero, the Sheet and the note are server-rendered, so the lesson paints before anything client-side resolves. That is a performance requirement with a visual consequence: the first paint must already show the display title, the lede and the button.

---

## 12. Layout — phone first

She is on a phone on the bus and a laptop at a desk. The phone is the design target; the desktop is the phone with a rail.

### 390 × 844 (phone)

- Gutter 16 px. Content is full width; measure is whatever the gutter leaves.
- **The primary action of any entry screen must be visible within the first 640 px of scroll.** This is the hard rule that fixes the topic hero. 640 px is 844 minus the 56 px bottom nav, the status bar, and a margin for a shorter device.
- **One sticky element at a time.** The bottom tab bar is 56 px plus `env(safe-area-inset-bottom)`. The lesson spine is a **3 px progress rail pinned at the very top** plus a **44 px bar** reading "3 of 10 · Reading a histogram back" that opens a sheet with all sections. Total 47 px, against the 64 px chip-scroller it replaces, and it actually answers "where am I".
- Tap targets: `--tap` 44 px floor; **52 px** on anything tapped hundreds of times (grading buttons, MCQ options, the Check button). `emotional-design.md` already specifies 52 for grading; the two numbers are reconciled here.
- Wide content — a table, a display equation, a figure — scrolls inside its own `overflow-x: auto` box. The body never scrolls sideways. Already correct in `globals.css`; keep.
- The bottom tab bar is 6 items: Today, Learn, Practise, Papers, Map, More. Active = `--ink` label and icon; inactive = `--ink-3`. No pill, no dot, no badge, no count.

### 768 px (tablet) and 1280 × 800 (desktop)

- Left rail 200 px (currently 375 px, which is absurd for six items). Nav item = 18 px label, 20 px icon, active on `--accent-3`.
- **Lesson column 720 px**, which is `--measure` at 18 px plus gutters. It does not grow with the window.
- **The spine becomes a 200 px sticky rail to the left of the lesson column**, inside the content area: numbered rows, title, minutes, a 12 px stone on each finished section, the current row on `--accent-3`.
- **There is no third column.** The reference rail (the Sheet, spec, links) sits at the end of the lesson in the flow, as recesses. A three-column study page is a dashboard.
- Max page width 1160 px (200 rail + 720 lesson + gutters); beyond that the whole block centres.
- No hover effects except a 1-step background change on rows and a link underline.

### Both

- Content never reflows when a gate is answered: the revealed stretch appears **below** the fold of the current section, and the scroll position is not moved. Focus moves; the page does not jump.
- Focus is never obscured by a sticky bar (WCAG 2.4.11): `scroll-margin-block: 64px` on every focusable landing target.

---

## 13. The first five seconds

Everything above serves this. The three changes that decide it are, in order:

1. **Put the promise above the fold.** Short display title, a lede of at most two sentences at `--measure-tight`, the honest meta line at `--fs-ui` in `--ink-2` — not 13 px grey — and the accent button. Inside **640 px**. And a second rule beside it: **the figure's top edge is inside 720 px**, because on none of the three first screens as first drawn was there a picture, and Brilliant would have the histogram in her hands by the third second. The objectives move below the figure; the secondary action becomes a text link (§2 of `02`).

**Where the display title comes from — settled.** `spokenTitle` in `src/lib/companion/context.ts:207`, which already ships and already does exactly this job: it strips any parenthesis and, for a title over six words, keeps the first clause cut at the first colon, semicolon, comma, "and", "including" or "using" that leaves at least three words. On the histograms topic it returns *"Histograms with unequal class widths"*, which is the mockup's title, derived rather than chosen.

An earlier draft proposed a chain beginning with an authored `hero.short` field. **Zero of the 156 shipped bundles carry it**, so that link was fictional and the chain's second and third links would have truncated M3 to "Simplifying, multiplying". Run over all 156 titles, `spokenTitle` produces one single-word output — "Pressure", a genuine one-word title — and nothing ending in a comma or "and". Eighteen results exceed 44 characters, the longest 60, which is three lines of 30 px Literata at 390 px; that is the worst case and it is acceptable. **The rule is: display title = `spokenTitle(topic.title)`. No fallback chain, no new content field, no invention in the renderer.** If the content session later adds `hero.short`, it takes precedence and `spokenTitle` becomes the fallback.

**"Pause here", specified.** It is carried forward from the showcase and named in the 19 September quality bar, and an earlier draft claimed it without saying what it is. It is this: at **every section boundary** — after a section's gate has been answered, before the next `.section-rule` — a single 44 px text control reading **"Pause here"**, `--fs-ui`, `--ink-2`, on the page, no border, right-aligned against the measure. It writes the flow state and returns her to Today with the close card's one line ("Section 3 done. Thursday brings back the bound."). It is the answer to 19,418 px with no stopping point, and it must exist on every boundary rather than once at the end, because a twenty-minute school night does not end where the lesson does.
2. **Take the prose off the cards.** Three surfaces; nesting capped at one; no shadows; no dashed borders. The lesson becomes a document.
3. **Raise the type floor and delete the capitals.** 12 px gone, `--ink-3` to 4.87:1, 52 eyebrows to one ruled label.

The fourth, if there is room, is the two-colour figure — because a figure that points at what the sentence is about is the thing no other CCEA product has.

---

## 14. Does this answer "why this platform"?

She will ask why she needs it, how it is different, and why it is worth her time. The look has to answer honestly in five seconds, without a claim.

- **"What is this and how long?"** — the meta line, promoted: *About 16 minutes · 10 short sections · 12 checks · 3 worked examples*. Under-promised, never optimistic. DeepStash says six minutes for 3,700 words; we say sixteen and mean it.
- **"Is it for my exam?"** — the locator line says `MATHS · UNIT M4 · HANDLING DATA`; the chip says `Next paper: M4, 236 days`; the subject colour is basalt on maths and lichen on science. Nothing else in the UK says CCEA M4 to her.
- **"Is it any good?"** — the figures are ours, drawn for this sentence; the examiner's words appear in Literata italic with a series and a question number; the Checked panel shows its working. A product that shows its evidence looks unlike one that does not.
- **"Will it nag me?"** — no streak, no XP, no badge, no red. The only colour that means anything says *yes*.

That is the whole argument, and it is made by the page rather than by a paragraph about the page.

---

## 15. The honest risk in this direction

Two of them, named rather than argued away.

**The risk is emptiness, not age.** The first draft of this section worried that warm paper and a serif would read as old. The critique is right that this is the wrong fear: paper, a serif and slate are the study aesthetic she already sees in Notion, GoodNotes and the study accounts, and against Seneca's cartoons and Bitesize's yellow bands they read as more grown-up, not older.

What she would actually call plain is a screen with nothing on it to look at. As first drawn, **none of the three first screens had a picture**, and Today had no colour at all. That is the real cost of restraint, and it is why the figure now has a 720 px rule beside the button's 640 px rule, and why Today's Tonight object carries the stone stack.

**The second risk is that nothing pulls.** What makes someone open Duolingo on a Tuesday is loss aversion, which we refuse and should. What makes someone open DeepStash is a gift chosen for them, and Cairn's version is already written in the companion spec: Rowan's arrival line carries one fact about *her own work* — "Two are the ones you were sure about on Tuesday." The first draft of Today left that slot empty from the second evening onward and put a fixed sentence under the count instead, which is furniture by the third night. `02` §1 now draws the fifth evening rather than the first.

**How we find out, rather than deciding here.** Put **five** mockups in front of her on a phone with no explanation — the three first screens plus the fifth-evening Today and the returning-visit hero — and ask three questions in this order: *what is this?*, *would you open it?*, *what looks wrong?* Then show her the live app. Do this **before pass 2**, not after, because her reaction to the fifth-evening Today is what decides whether "nothing pulls" is a risk or a fact. If the mockups do not win clearly, the answer is not more restraint — it is more of what she reacted to. Her reaction overrides this document, as it overrides the companion spec.

**The second risk: this is a lot of change at once.** 562 type instances, 52 labels, 91 containers. A pass this wide can break things she liked — the gate mechanic, the note's reading rhythm, the feedback voice. `03-implementation-plan.md` puts the behaviour-preserving work first and fences the marking surfaces, the companion containment rule and the teach-first order in every pass. If a change cannot be made without touching one of those three, it does not belong in an appearance pass.
