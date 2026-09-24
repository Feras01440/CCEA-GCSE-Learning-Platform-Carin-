# 02 — Surfaces

20 September 2026. One section per surface. Each says what she should feel in the first five seconds, what the eye lands on first, second and third, and then the layout in enough detail to build from. Tokens are in `tokens.css`; the rules they serve are in `01-art-direction.md`.

> **Amended 20 September 2026, after `04-critique.md`.** All amendments taken, no disagreements:
> - **§1 now draws the fifth evening, not the first.** The first draft specified the evening she will see once (the Letter) and left the evening she will see two hundred times to be inferred. On that evening the sub-line under the count was a fixed sentence — furniture by the third night — and the only thing on the screen that was *hers* was a 20 px mark below the fold. Rowan's `today-open` line now carries the sub-line and changes nightly; the stone stack moves onto the Tonight object at 24 px.
> - **§3.1 now draws the returning visit too**, and adds a second hero rule beside the 640 px one: **the figure's top edge is inside 720 px**. A first screen with no picture is the real "plain".
> - **Three cuts:** the subject tint band and accent rail behind the unit list and the flashcards index; the "Examiners flag this one" chip on the contents page (56 of 104 rows — a label true of most rows says nothing); and "I have done this before" as a stacked 52 px button, which spent 62 px of the first screen on a decision a first-timer does not have to make and diluted the primary. It becomes a text link.
> - **Smaller, from §4 of the critique:** the feedback `<dl>` stacks below `sm`; the section `h2` is omitted when it equals the display title; the desktop spine right-aligns minutes in their own column; "Pause here" is specified at every section boundary.

Three notations used throughout:

- **page** / **object** / **recess** are the three surfaces (`--ground`, `--surface` + `--line-2` border, `--surface-2`).
- **⟶** marks the accented element. There is **exactly one per screen**.
- Sizes are phone-first (390 px); the `md` value follows in brackets where it differs.

---

## 1. Today

> **First five seconds:** *I know exactly what tonight is, it is small, and something here is about me.*
> **Eye lands:** 1. the count — "9 back · about 7 minutes". 2. Rowan's line under it. 3. the Start button, with the stones in the corner of the same object.

Mockups: `mockups/today-phone.png` (**the fifth evening — the one she will meet two hundred times**), `today-phone-first.png` (the first evening, with the Letter), `today-phone-plan.png`, `today-desktop.png`.

### The fifth evening — the layout that matters

```
Sunday 20 September                       14 px, ink-2, sentence case
Today                                     26 px [32], Inter 600

┌ OBJECT ──────────────────────────────▤──┐   ← 24 px stone stack, top right
│ Tonight                    14 px, ink-2 │     the object's only ornament, no number
│ 9 back · about 7 minutes   30 px, tnum  │
│ Two are the ones you were sure          │   ← ROWAN, 17 px Literata, ink-2, 42ch
│ about on Tuesday.                       │     data-companion="today-open"
│                                         │     A DIFFERENT SENTENCE EVERY NIGHT
│ ⟶ [ Start → ]              52 px, accent│
└─────────────────────────────────────────┘

──────────────────────────────────────────    .section-rule
The plan                                      14 px, ink-2
  Next step   M3 · Simplifying, multiplying and dividing algebraic fractions   →
              November 2025, M4 Q22(b) — 5% got full marks.
  ──
  This week   Two evenings this week.
  ──
  Next paper  Biology Unit 1 · Higher · Tue 11 May 2027, 09:15     233 days
  ──
  Your cairn  6 stones · Nothing here is ever taken away.
```

### The three changes that make it the fifth evening and not the first

1. **The sub-line under the count is Rowan's `today-open` line, and it changes nightly.** The first draft printed "Chosen for you: what you got wrong, or right without confidence" — true, and identical every night, so furniture by the third. The companion spec already defines Cairn's non-manipulative pull and it is exactly this: one fact about *her own work*, quoted back. "Two are the ones you were sure about on Tuesday." "You left a line at frustums: 'cube the scale factor for volume.' It is still true." The fixed sentence is kept for the **first week only**, while there is no history to quote.
   Containment holds: the Tonight object holds no answer field, and the line precedes every one in document order.
2. **The stone stack moves onto the Tonight object**, top right, 24 px, `currentColor` at `--ink-3`, **no number beside it**. It is the object's only ornament and the only stone graphic on the screen — the count stays as text in the plan row. The first draft had three stone graphics on one screen (the week row, the cairn row, the stack) against this document's own "never more than once on a screen".
3. **The week row loses its glyphs entirely.** "Two evenings this week." in words. Two stones there would be a third motif and a second thing that looks like a score.

### The first evening

Identical, with Rowan's **Letter** as its own object below Tonight (hairline top rule *or* the object border, never both — see §8), and the fixed "Chosen for you…" sub-line in the Tonight object because there is no history yet. Her brother's note takes the screen when it is present, and Rowan is silent then.

### Below the plan

```
──────────────────────────────────────────
Coming up
┌ RECESS ─────────────────────────────────┐
│ Biology Unit 1        Tue 11 May · 09:15│
│ M4 · Higher           Fri 14 May · 09:15│
│ Chemistry Unit 1      Mon 17 May · 09:15│
└─────────────────────────────────────────┘
Eleven papers, on CCEA's own dates.
```

### What changes from today's build

The six identical tiles (`TodayTiles.tsx:132-234`) become **one object, one Letter, four page rows and one recess**. Tonight is the only object because it is the only thing she acts on; the plan is reference, so it is rows on the paper; Coming up is reference she consults, so it is a recess. That is the three-surface rule applied to the surface she sees most.

Specifics:
- The `label` on each tile (12 px uppercase tracked) becomes a 14 px sentence-case label, once, above the plan block. Four of the six labels disappear entirely.
- **On Today there is no subject, so the accent resolves to the near-ink slate and the Start button is effectively a black rounded button.** That is the correct answer to "one accent means the one thing to do next" and the wrong answer to "ours" — a black rounded button is the component-library button. It is accepted here for one reason: Today is the only screen with no subject, and giving it a colour of its own would mean a fourth hue competing with the three that carry meaning. What stops the screen being colourless is the stone stack and Rowan's line, not a tint.
- **"0 / 4" is never shown, and neither are hollow placeholders.** `emotional-design.md` rule 1 is exact: "The week strip shows what was done, never what was not." Two sessions this week is **two stones and the words "Two evenings this week."** Four outlines with two filled would show her the two she has not done, which is the same loss-framing in a quieter typeface. With no sessions yet the row reads "Nothing yet this week." and shows nothing.
- The `CairnStack` moves to the right edge of its row at 20 px and is the only motif on the screen.
- Empty state, nothing due: the count line becomes "Nothing back tonight." and the sentence becomes "Ten minutes on something new is enough." The button becomes *Learn* and stays accented — there is always exactly one.
- Loading: a `CardSkeleton` in the shape of the Tonight object only. The plan rows render as soon as the plan resolves; they do not need a skeleton because they are text on paper.

### Rowan on Today

Two mutually exclusive states in the same slot, both inside the Tonight block on the page (never in a floating bubble):

| State | Treatment |
|---|---|
| **The Letter is owed** (`flags.firstLetterDue`) | Its own object below Tonight: the label "Left at the cairn" at 14 px ink-2, one to three lines of 17 px Literata at 42 ch, the rename field in a recess, and a footer of the three-stone mark at 14 px plus the name, with a Close button. `rise-in` 200 ms. **The object's own 1 px top border IS the companion spec's "hairline top rule"** — an inner hairline as well gives the card a double top edge that reads as a rendering error. One edge. |
| **Ordinary arrival** | One line of 17 px Literata, `--ink-2`, no container, no mark, `data-companion="today-open"`, directly under the Start button. |

Her brother's note takes the screen when it is present; Rowan is silent then.

---

## 2. The unit map

> **First five seconds:** *Nine topics, in the order I should do them, and I can see where I stopped.*
> **Eye lands:** 1. the unit name. 2. the first unfinished row. 3. the one-line honest count of what is built.

### What must change

`unitmap-m4-phone-light.png` is the clearest single failure of tone in the product. The fixes, in order of effect:

1. **Delete the difficulty meter.** Five filled squares labelled "Hard" — or five **red** squares labelled "Where marks are lost" — is a verdict delivered before she opens anything. It also squeezes the title column so badly that topic 3 wraps to six lines and its status pill breaks into two fragments.
2. **Replace it with nothing.** An earlier draft put an "Examiners flag this one" chip on the ~56 topics with an insight card. That is 56 of 104 rows, and this document's own argument against the "Lesson and practice" pill — a label true of most rows says nothing — applies exactly. Provenance belongs **inside** the topic, in the "In the exam" recess and on the miss card, where it is a named series and question number rather than a badge.
3. **Delete the "Lesson and practice" pill.** It is true of every row, so it says nothing; the 13 Sep review already asked for this.
4. **Row state is a glyph in a 20 px gutter**, not a pill: a filled stone (proved), a hollow stone (started), nothing (not started). One column, always the same width, so titles never reflow.

**And a cut, not a change.** The subject tint band behind the topic list, with its 3 px accent rail, is **cut**. A whole region washed in a subject colour is the decorative tint bar this direction just deleted from the flashcards index, scaled up to a region — and the unit list is the screen the learner praised as it is; the 13 September review says not to touch it beyond dropping the pill. Rows on the page, a hairline between them, a glyph gutter, no meter, no band.

### Layout

```
Mathematics · M4                              13 px uppercase locator
Unit M4: Higher Tier                          26 px [32] Inter 600
Nine topics in teaching order. All nine have  17 px, ink-2, 60ch
original questions and a lesson. This paper
also assumes M1, M2 and M3.
[ Flashcards · 198 ]                          secondary button, 44 px

──────────────────────────────────────────    .section-rule
Topics
 1  ▬  Upper and lower bounds in subtraction and division
       Number and algebra · 1 statement
 2  ▬  Factorising ax² + bx + c and more complex expressions
       Number and algebra · 1 statement
 3  ▭  Algebraic fractions with linear denominators      [Examiners flag this one]
       Number and algebra · 2 statements
 …
```

- Rows are page rows separated by `--line`, not one white card, and **not on a tint**.
- Row height 64 px minimum (well over 44), the whole row a link.
- **The honest denominator stays**: if a unit has 9 of 9, say nine. If `/learn` has 54 of 152 built, `/learn` says so. Optimism here is the one thing the quality bar tells us reviewers punish.

---

## 3. The topic page

Mockups: `mockups/topic-phone.png`, `topic-phone-lesson.png`, `topic-desktop.png`, `topic-desktop-lesson.png`.

### 3.1 Hero

> **First five seconds:** *I know what this is, how long it takes, and where to press.*
> **Eye lands:** 1. the display title. 2. the lede. 3. the promise line and the button (they read as one block).

**Two hard rules at 390 px wide:**

1. **The accented button is visible within 640 px of scroll.** In the mockup it lands at 367 px; live it lands at ≈1,260 px.
2. **The figure's top edge is within 720 px.** A first screen with no picture is the real "plain", and the one artwork we own is the reason to trust the sixteen minutes. Brilliant would have the histogram in her hands by the third second.

Rule 2 is paid for by three things: the lede is at most two sentences, the secondary action is a text link rather than a stacked 52 px button, and the objectives move **below** the figure.

Order, top to bottom:

| # | Element | Spec |
|---|---|---|
| 1 | Locator | `Maths · Unit M4 · for your paper on 14 May` — 13 px, tracking 0.06 em, uppercase, `--ink-3`. The one surviving uppercase in the product. **The paper is named as a place, not a countdown**: "for your paper on 14 May", never "236 days". It is the same differentiating fact — this knows her exam — said without pressure on the screen where she is about to start learning. |
| 2 | **Display title** | `spokenTitle(topic.title)` — see below. 30 px [40] Literata 500, tracking −0.015 em, `max-width: 18ch`. The full specification statement lives in the "In the exam" recess where the spec reference already is. |
| 3 | Lede | `hero.lede`, **at most two sentences and at most three lines at 390 px**, 18 px Literata, 1.52, `--measure-tight` 42 ch. The content brief writes `hero.lede` to that budget; the renderer takes the first two sentences and never mangles one. |
| 4 | **The promise line** | `About 16 minutes · 10 sections · 12 checks · 5 examiner findings` — **15 px `--fs-ui`, `--ink-2`, with the minutes in `--ink` 600**. Today this is 13 px `--ink-3` at 2.98 : 1 and is the quietest thing on the screen. It is our DeepStash three-metric header and the single best five-second answer to "why is this worth my time". Under-promise it: if it says 16 it must be 16, and if `timeMs` is null it says "about". |
| 5 | ⟶ Primary | *Start the lesson* — 52 px, accent, the **only** accent-filled control on the screen. |
| 6 | Secondary | *Done this before?* — a **text link**, `--fs-ui`, `--ink-2`, underlined in `--accent`, in a 44 px tap area directly under the primary. Not a 52 px outlined button: that spent 62 px of the first screen on a decision a first-timer does not have to make, and a second button dilutes the first. The pixels go to the figure. |
| 7 | Rowan | One line, 17 px Literata `--ink-2`, `data-companion="topic-open"`. Containment holds: the hero contains no answer field, and the line precedes every one in document order. |
| 8 | **Figure** | The topic's own figure, **on the page**, no card, no border, **top edge inside 720 px**. Labels at `--fig-label` 24 viewBox units below `md`. Caption 12 px below in `--ink-3`. |
| 9 | Objectives | The three `hero.can` lines, 15 px, `--ink-2`, with a 6 px **`--ink-3`** dot — not accent; three coloured dots beside the accented button are four accents by eye. **Below the figure** — they are a contract, read third, not an obstacle. |
| 10 | Mastery chip | **Only when there is mastery to show.** On a first visit there is no chip at all. The next-paper chip is **deleted** — that fact lives in the locator, and it was already on Today and on Papers. |

**Where the display title comes from — settled.** `spokenTitle` in `src/lib/companion/context.ts:207`, which already ships. It strips any parenthesis and, for a title over six words, keeps the first clause cut at the first colon, semicolon, comma, "and", "including" or "using" that leaves at least three words. On histograms it returns *"Histograms with unequal class widths"*.

An earlier draft proposed a chain starting with an authored `hero.short`. **Zero of 156 shipped bundles carry that field.** Run over all 156 titles, `spokenTitle` gives one single-word result — "Pressure", a real one-word title — and nothing ending in a comma or "and"; eighteen exceed 44 characters, the longest 60, which is three lines at 30 px on a phone and is the acceptable worst case. **Rule: display title = `spokenTitle(topic.title)`.** If `hero.short` is ever authored it takes precedence. Never invent a title in the renderer.

**And: when section 1's heading equals the display title, the section `h2` is omitted.** On the first screen as first drawn the title appeared three times — display title, spine bar, section heading. Twice is the ceiling.

### 3.1b The returning visit

The same hero with four differences. This is the state she will be in for most of the two hundred evenings, and the first draft did not draw it.

| Element | First visit | Returning, stopped after section 3 |
|---|---|---|
| ⟶ Primary | *Start the lesson* | **_Continue at 3_** — and it still lands within 640 px |
| Secondary link | *Done this before?* | *Start again from the top* |
| Rowan | "New ground. The note teaches before it asks; nothing here is a test." | "Section 3 is where you stopped. Start there." |
| Mastery chip | none | the chip, with its level |
| Spine | segment 1 outlined, rest on tint | segments 1–2 filled, 3 outlined |

Everything else is identical, including the figure. The lede stays: a topic she half-remembers needs the sentence as much as a new one does.

### 3.2 The spine

> **What it must answer:** where am I, how much is left, where can I stop.

**Phone.** A **segmented** 3 px rail pinned at the very top — one segment per section, 4 px gaps: done segments filled `--accent`, the current one outlined in `--accent`, the rest `--tint-*`. This is the showcase's own device and it is better than a continuous bar, because it answers *how many are left* as well as *how far in*. Beneath it a 44 px bar: `1 of 10 · Histograms with unequal class widths · 2 min`, the title truncating with an ellipsis, a chevron opening a sheet with all ten rows. **47 px total, one sticky element.** It replaces a 64 px horizontal chip-scroller that showed 1.2 chips at 390 px.

Above eleven sections the segments become too thin to read; fall back to the continuous track and keep the `N of M` count, which is the fact that matters.

The current segment is an **outline** — transparent fill, 1 px accent inset ring — not a fill, so it reads as position rather than as a second thing to press and does not count against the one-accent-filled-control rule.

**Desktop.** A 200 px sticky rail to the left of the lesson column: a head line (`The lesson · about 16 min`), the same segmented bar, then numbered rows at 14 px. Current row on `--accent-3` with a 3 px accent left rule. A completed row's number is replaced by a 14 px stone. `max-height: calc(100vh - 120px); overflow-y: auto` so a ten-row spine never becomes unreachable.

**Minutes go in their own right-aligned column**, `--ink-3`, tabular — a three-column grid of `18px | 1fr | auto`. Inline after the title they orphan "· 3 min" onto a line of its own on most rows at 200 px; the showcase right-aligned them and was right.

Stages after the numbered sections carry no number: *Practice, one at a time · 14 questions*; *In the exam · the Sheet, traps, papers*. The stone is a **completion marker in the number column only** — never a list bullet beside a stage name.

### 3.3 A teaching section

> **First five seconds inside a section:** *This is one idea and it will not take long.*
> **Eye lands:** 1. the section heading. 2. the figure. 3. the gate.

```
──────────────────────────────────────────    .section-rule (1 px --line, 40 px [48] above)
1 · Read and check · 2 min                    14 px, Inter 500, --ink-2, sentence case
Histograms with unequal class widths          21 px [24], Literata 500

On an ordinary bar chart the height of a       17 px [18] Literata, 1.62, 60 ch
bar is the count, which works only while…      ON THE PAGE. No card.

[ figure, on the page, one accent element ]
Frequencies 8, 24, 15, 10, 3 over widths…      14 px, --ink-2, caption says what to notice

The height of a bar is therefore a rate…

┌ RECESS — a why-callout ─────────────────┐
│ 💡 Why area and not height    14 px ink-2│
│ A bar's area is height × width…  16px Lit│
└─────────────────────────────────────────┘

┌ OBJECT — the gate, the only object here ┐
│ Answer to continue         14 px, ink-2 │
│ A class 0 < t ⩽ 10 has frequency 20.    │  18 px Literata 600
│ What is its frequency density?          │
│ [ field 52 px ]  ⟶ [ Check 52 px ]      │
└─────────────────────────────────────────┘

[ media row: 112 px thumb + title + source ]
▸ Source and licence                          <details>, recess when open
```

**And at every section boundary, after the gate is answered and before the next `.section-rule`:** a single 44 px text control, right-aligned against the measure, reading **"Pause here"** — `--fs-ui`, `--ink-2`, on the page, no border. It writes the flow state and returns her to Today with one close line. It exists at *every* boundary, not once at the end, because a twenty-minute school night does not end where the lesson does. This is the fix for 19,418 px with no stopping point, and it is the thing the showcase had that the first draft of this document named without specifying.

Rules this encodes:
- **Prose never sits inside an object.** That removes roughly 60 of today's 91 cards.
- **The dashed gate box is abolished.** Dashed reads as placeholder. A gate is a solid-bordered object with a label.
- Nesting is capped at one: an object may contain a recess, never another object.
- **One gate per section**, at the end, as the section's own conclusion.
- The revealed next stretch appears **below** the fold of the current section; focus moves, the page does not jump.

### 3.4 Worked examples

The ladder order is `full → faded1 → faded2 → twin → problem`. Visually:

- The stage is introduced by a `.section-rule` reading `Work through · about 6 min` and a Literata h2 *Worked examples*. **Not** an eyebrow reading `WORKED EXAMPLE · READ EACH STEP, THEN SAY WHY`, which currently wraps to two lines of capitals.
- Each **step is a page row**, numbered, with the mark code chip (`MA1`, 13 px `--fs-micro`, `--radius-xs`) at the right. The step's input is the only object in the row.
- A **faded** step shows the removed part as a field of exactly the width of the missing expression, not a full-width input — the fading has to be visible as fading.
- A step she has completed collapses to one line of 15 px `--ink-2` with a 12 px stone. Progress down a worked example should be legible in one glance.
- The "why is this step allowed?" menu is three options in `btnOption` style, 52 px each.

### 3.5 Check yourself

Post-instruction, with confidence. One object per item, one item at a time, a progress line above.

- The confidence row is three 52 px options — *Sure* / *Fairly sure* / *Guessing* — in `btnOption`. Selected is **ink-filled**, never accent.
- A **confident-wrong** answer is the only place the interface gets a second beat: the feedback object keeps the `--miss` left rule and adds one line in Literata — *"Not quite, and you were sure, so this one is worth a minute. It comes back Thursday."* No colour change, no icon change.
- `item.skill` is never printed beside the stem (it gave the answer away on the frustums topic).

### 3.6 Practice, one question at a time

See §4 below; the practice stage itself is: a `.section-rule` reading `Practise · 14 questions`, a progress line, and one question object. Nothing else is on the screen.

### 3.7 "In the exam" — the Sheet and the reference cards

Everything reference-shaped lives here, at the end, **as recesses on the page**, under one `.section-rule` reading *In the exam*. Today these are four identical white cards with four uppercase labels (`topic-histograms-phone-end.png`).

| Was | Becomes |
|---|---|
| `SPECIFICATION` card | A recess: the code chip `M4-HD-02` at 13 px `--fs-micro` + the statement at 15 px. This is also where the **full CCEA title** lives, since the hero shows the short one. |
| `FORMULA SHEET` card | A recess headed *You must know* — and the honest line about what is and is not on the page-2 sheet. |
| `BUILDS ON` card | A row of plain links, 15 px, underlined in `--accent`. Not outlined pills that wrap into fragments. |
| `BEST OF WHAT EXISTS` card | A recess of links with a 16 px `ExternalLink` icon and one closing line, *"Linked with credit, never copied."* |
| The traps and examiner findings | A recess: each finding as *series · question · what went wrong · the fix*, the examiner's sentence in Literata **italic** with a `cite` line beneath. The italic is the one sanctioned use of italic in the product. |

### 3.8 The close card and the stone

The lesson currently has no end: 19,418 px and then a link list. The close card is an object on the page ground:

1. One line from Rowan, 17 px Literata.
2. The numbers, as page rows: items, minutes, marks recovered.
3. *What returns when* — the next three items with their reason and date.
4. **The stone.** If a topic reached Proficient, a 24 px `CairnStack` gains a fourth stone with `stone-settle`, 300 ms, once. Nothing else animates.
5. ⟶ *Done for tonight* (accent) and *Five more minutes* (outline).

No score, no percentage, no confetti, no "great job".

---

## 4. A question being answered and marked

Mockups: `mockups/practice-phone.png` (mid-answer), `practice-phone-correct.png`, `practice-phone-partway.png`, `practice-phone-notyet.png`, `practice-desktop.png`.

> **First five seconds:** *One question, and I can see exactly what is being asked of me.*
> **Eye lands:** 1. the stem. 2. the field. 3. the Check button. (The progress line is peripheral and stays peripheral.)

### 4.1 Mid-answer

```
┌ OBJECT ─────────────────────────────────┐
│ Practice · 3 of 14              1 mark  │  14 px, --ink-2
│ ▬▬▭▭▭▭▭▭▭▭▭▭▭▭                          │  3 px progress, tint track + accent fill
│ The class 10 < m ⩽ 30 has frequency 24. │  17 px [18] Literata
│ Work out the frequency density…         │
│ [ field, 52 px, --line-3 ]  ⟶ [Check]   │
│ Calculator allowed.   Give me a hint    │  14 px --ink-2, hint is a 44 px target
└─────────────────────────────────────────┘
```

The field's border is `--line-3` (3.1 : 1) and its focus ring is `--accent` at 2 px / 2 px offset. Today `fieldCls` uses `--line-2` at 2.0 : 1, which fails WCAG 1.4.11 for a control whose boundary is its only identifier.

### 4.2 The three outcomes

**The rule this exists to enforce: a marked answer is a visibly different object from an unmarked one, at arm's length.** The carrier is the **whole edge**, not just the margin: a marked object takes a **2 px border** in the outcome colour against the 1 px `--line-2` of every unmarked object, plus a **4 px** left rule. Today a miss and a paragraph look identical (`audit/practice-miss-phone.png`).

| Outcome | Border + rule | Glyph | Verdict word (21 px) | Marks — **all mandatory** |
|---|---|---|---|---|
| **Correct** | 2 px + 4 px `--ok` fern | tick, draws in 250 ms | "That's it." | meter filled + **"1 of 1 mark"** + `MA1` **earned** |
| **Part way** | 2 px + 4 px `--warn` ochre | half-filled circle | "Part way there" | meter half + **"1 of 2 marks"** + `M1` earned, `A1` **struck** |
| **Not yet** | 2 px + 4 px `--miss` — **the warm neutral of the ink; never red, and no longer blue** | hairline circle-dash | "Not yet" | meter empty + **"0 of 1 mark"** + `MA1` **struck** |

> **Lint, not preference.** A not-yet or part-way card **must** show "N of M" and a struck mark code. The calm register is one step from a shrug, and a shrug after a *confident* wrong answer is what hypercorrection cannot survive. If implementation reads "no shame" as "say less", it has read it wrong: the colour is quiet, the facts are blunt.

> **Why `--miss` is no longer blue.** It was `lch(40% 8 252)` against a maths accent of `lch(40% 22 266)` — identical lightness, fourteen degrees of hue apart — so on the surface she uses most, "not yet" and "the thing to do next" were the same dark grey-blue at the same weight, forty pixels apart. The two meanings were being carried by position alone. `--miss` is now the warm neutral of the ink, and **the accent never appears as a rule inside an object**: a rule inside an object is always a verdict.

Then, in this order:

1. **The visual consequence** (miss only, where a figure exists and the error is one of the 2,612 authored ones). The figure re-renders with her answer against the right one — hers as a dashed ink outline, the right one in accent — **before** any prose. This is the Brilliant borrow and it costs no artwork, because the figures are computed. 200 ms, opacity and transform.
2. **The diagnosis**, a `<dl>` at 15 px: *What happened* / *The step*. On a correct answer: *The method*, one line, naming where the mark was — Hattie's process level, `d ≈ 0.99` against `d ≈ 0.24` for a bare verdict.
   **It stacks below `sm` and goes two-column from `sm`.** A `7rem` label column leaves about 190 px for the value at 390 px, which wraps "24 is the frequency. The height of the bar is 24 ÷ 20 = 1.2." to three lines against a one-word label. Below `sm` the label is its own line in `--ink-2` and the value runs the full measure.
3. **The examiner's sentence**, in a recess, Literata italic 16 px, with `cite` beneath: *CCEA examiners' report, Summer 2025, M4 Q22*.
4. ⟶ *Fix it now* (accent) then *Next* (outline), then one line of `--ink-2`: **"It comes back on Thursday."** The promise is stated where it is made.

Two misses on one part bring the encouragement object instead of a third go: prose only, no mark, no name, no `data-companion` attribute (the containment rule — a question is on screen).

### 4.3 What must not change

The marking behaviour is not in scope for the appearance pass. The engines, the keyword groups, the 2,612 authored errors, the self-award override, the QWC band decision, the "Wrong"-never-appears rule and the copy in `FeedbackCard.tsx` all stay exactly as they are. This section changes the container, the rule, the order and the type. Nothing else.

---

## 5. The paper runner

> **First five seconds:** *This is the real thing, at the real length, and I know what happens after.*
> **Eye lands:** 1. the paper's identity and length. 2. the clock or the Start button. 3. the link to the official PDF.

`PaperRunner.tsx` has four phases — `preflight`, `running`, `marking`, `result`. Each gets one screen and one accented control.

| Phase | Layout | Accent |
|---|---|---|
| **Preflight** | Page, no card. The paper's identity as a display line (`M4 · Summer 2025 · Higher`), then three page rows: *100 marks · 2 h*, *Calculator allowed*, *Formula sheet given*. Then the official-paper link with an `ExternalLink` icon and the CCEA notice in a recess. | ⟶ *Start the clock* |
| **Running** | **The most restrained screen in the product.** Nothing but the clock (48 px tabular, `--ink`), the paper link, and a *Pause* control. No progress, no question list, no companion, no navigation — the bottom tabs are hidden. | ⟶ *I have finished* |
| **Marking** | The self-mark grid as a real table: question, marks available, marks earned. Row height 52 px, zebra by `--surface-2`, no borders inside. The scheme link per row. | ⟶ *See the grade* |
| **Result** | Raw → UMS → grade as **one arc**, drawn in `--accent`, with the A* bracket marked by a hairline and the gap named **in raw marks on her unit**. Below it, marks lost as page rows with their reasons, each linking to the topic. Then one Rowan line. | ⟶ *Send the misses to my reviews* |

Papers index (`papers-desktop-light.png`): default to her eleven entries, Foundation hidden, the next paper first with days remaining, and older sittings behind one disclosure. The "Run it timed" control is `--line-3` outline, not accent — the accent belongs to the single *Sit the next one* at the top.

**The countdown must stop being the loudest thing.** "in 233 days" is a fact, 14 px `--ink-2`, at the end of a row. It is never a large number and never a bar.

---

## 6. Flashcards

> **First five seconds:** *There are decks for my units, and I can see which are ready.*
> **Eye lands:** 1. the subject. 2. the unit with cards. 3. the honest "coming".

- The decorative 6 px tint bar above each subject heading (`app/flashcards/page.tsx:17`) is **deleted** — it reads as a leftover loading skeleton. **Nothing replaces it**: an earlier draft put the tint back as a band behind the unit list with a 3 px rail, which is the same decorative tint at four times the size. The subject heading in ink is enough.
- Unit rows are page rows at 52 px: unit short name at 15 px, `N cards · N topics` at 14 px tabular on the right. A unit with no deck is `--ink-3` and reads "coming" — already honest, keep the words exactly.

**The card itself**, in a run:
- One object, centred, `--measure-tight`. The prompt in 18 px [19] Literata; the answer revealed below a `--line` rule, never on a flip animation.
- **Three grading buttons, 52 px tall, at thumb height**: *Again* / *Good* / *Easy*. All three are `--line-3` outline; **none of them is accent**, because none of them is more correct than the others. This is the one place the "one accent per screen" rule resolves to zero accented elements, and that is right.
- An 8 ms vibration on tap, touch only, never with reduced motion.
- The progress line fills one step, 200 ms, `transform` only.

---

## 7. First run

> **First five seconds:** *Someone made this for me.*
> **Eye lands:** 1. "Happy birthday". 2. the note. 3. Continue.

Chrome-free (`isChromeFree` already covers `/welcome`). Three screens, each one object on the page ground, each with exactly one accented button.

1. **Her brother's note.** Unchanged in content. The eyebrow becomes 14 px sentence case, *A note from your brother*; the title 26 px; the body 17 px Literata at 42 ch. Rowan is silent here, always.
2. **Rowan's Letter + the plan.** The Letter as specified in §1, then the pre-filled exam plan in a recess and the name field. ⟶ *Begin*.
3. **New: one real section of one real topic** — the hero, one teaching section, one gate, one marked question, one stone. It ends inside the product rather than at a list of 104 topics. Each piece of vocabulary is named where it first appears, once, in a 14 px `--ink-2` line beside it: *"A gate is one question at the end of a section. Yes or Not quite; no score."*

This is the surface with the highest ratio of impression to code. It is also the only screen where the word "birthday" appears.

---

## 8. Rowan: the line and the Letter

The visual contract, consolidated. Nothing here changes the selection logic or the constitution.

### The signed line
- One `<p>`, no container, no border, no icon, no background.
- 17 px, `var(--font-companion)` → the lesson serif, `--ink-2`, `line-height: 1.55`, `max-width: 42ch`.
- `data-companion="<moment>"`. No `aria-live` — an arrival line is part of the page, not an announcement over it.
- **Containment:** never a descendant of a section, form or card that contains an answer field, and always before the first answer field in document order. Enforced by `e2e/companion.spec.ts:210-226`. In the hero that is satisfied by placing it above the objectives and below the buttons.
- Rowan's three-stone mark appears on the line **only for Letter moments**. On an ordinary line there is no mark.

### The Letter
An object, and the only container Rowan ever gets:

```
┌ OBJECT ─────────────────────────────────┐   ← this 1 px border IS the hairline rule
│ Left at the cairn          14 px ink-2  │   ← sentence case now, was 12 px uppercase
│ I keep the path and the notes left at   │   17 px Literata, --ink, 42 ch
│ each cairn. I know your papers; you do  │
│ the maths.                              │
│ …                                       │
│ ┌ RECESS — rename ────────────────────┐ │
│ │ It answers to Rowan. Call it        │ │   14 px --ink-2
│ │ something else if you would rather. │ │
│ │ [ field 44 px ]        [ Save ]     │ │   16 px field (no iOS zoom)
│ └─────────────────────────────────────┘ │
│ ▤ Rowan                      [ Close ]  │   14 px mark + name, 44 px button
└─────────────────────────────────────────┘
```

- **One top edge.** The object's own 1 px border is the "hairline top rule" the companion spec asks for. Do not draw a second rule inside it: the double edge reads as a rendering error.
- Entrance: `rise-in`, 200 ms, transform and opacity.
- **No evening dimming.** The evening state is copy only (binding condition 2); 0.7 opacity on 16 px fails 4.5 : 1 on our ink tokens and is worst on OLED at low brightness. Evening changes which sentence is true, not how dark it is.
- **No idle motion, ever.** No blink, no breath, no float. `document.getAnimations().length === 0` at rest.
- The mark is `aria-hidden`; the signature is the visible name beside it.
- The only coloured text anywhere in the companion is the destructive confirm in `CompanionMemory`, which moves from `--miss` to the new `--danger` token — because `--miss` is now the calm "not yet" slate and must not be reused for "this deletes things".

---

## 9. Empty and loading states, consolidated

| Surface | Empty | Loading |
|---|---|---|
| Today | "Nothing back tonight. Ten minutes on something new is enough." → *Learn* | Skeleton for the Tonight object only |
| Map | "Stones appear here as you prove topics in a later mixed set. None yet." → *Start a topic* | Skeleton in the shape of the paper rows |
| Papers | "When you sit a paper against the clock, its raw mark, UMS and grade appear here." → *Sit one* | Skeleton for the next-paper block |
| A topic without sets | "This topic has its questions but no mixed set yet. The lesson and the check are complete." → no action | — |
| Flashcards, unit not built | "coming" (unchanged) | — |
| Review queue, empty | "Nothing is due. That is what the schedule is for." → *Learn something new* | — |

Rules: on the page ground, never in a card; one sentence, one action, nothing else; 48 px of air above and below; **never a large "0", never "None" as a heading, never an illustration**. Skeletons: content-shaped, `--surface-2`, opacity pulse 0.55 ↔ 1 over 1.4 s, minimum 200 ms on screen, and after 3 s a sentence replaces them: "Still loading. Everything is on your device, so this is unusual."
