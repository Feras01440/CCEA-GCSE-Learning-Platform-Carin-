# 00 — Appearance audit

20 September 2026. What the product looks like today, why a first-timer called it "not very nice" and "intense", and how it stands beside the apps she would actually compare it with.

**Provenance.** Every screenshot in `audit/` is the **live application**, not the showcase mock. The static export at `out/` (built 19 September 2026, 23:24; `out/index.html` 22,119 bytes) was served with a Node static server on port 3211 and rendered with Playwright at 390 × 844 and 1280 × 800, device scale 2, light and dark, `waitUntil: "domcontentloaded"`. Thirty-three captures. Three of them (`today-real-*`) were taken after driving first run to completion so the Today tiles render rather than the gift card. Nothing here is a mock-up of what we wish were there.

Every count below is from the source, not from an impression. The commands are in the footnote at the end so they can be re-run.

**One caveat on the counts.** The app session is working in `src/` while this was written, so a number here may have moved by a few since. The commands at the end re-derive every one of them in a second; nothing in this document depends on a count being exact to the unit, and where a fault is structural the count is only evidence of scale.

---

## 1. What the look already does well

These are not consolations. They are the parts of the visual system that are better than most of what she could buy, and the appearance pass must not disturb them.

**The lesson voice is right.** Literata at 17 px (18 px from `md`), 1.6 leading, 66 ch measure, `font-feature-settings` on, real paragraphs of real prose. `topic-heart-phone-scroll1.png` shows the heart note reading like a book. She said she liked the content; a large part of that is that the content is *set* like content. DeepStash's whole typographic argument is that the type choice is itself a claim about the product, and on this one surface we already make it.

**The figures are ours and they are honest.** 264 captioned, alt-texted, computed SVGs. `topic-histograms-phone-light.png` shows one: axes labelled, values on the bars, a caption that says what to notice. They use `currentColor` so they theme, and they carry a `<title>` and `role="img"`. No stock illustration, no decorative art — which both of our research files independently demand (`06`: "Ban decorative imagery… on content screens"; `07`: the Seneca cartoon aesthetic "reads as 'Year 8' to a 16-year-old").

**The feedback copy is humane and specific.** `practice-miss-phone.png`: "Not quite. Frequency ÷ class width: 20 ÷ 10 = 2. The width is 10, not 0 or 20." That is Hattie's process-level feedback, not a cross. The word "Wrong" appears nowhere in the product.

**The empty states tell the truth in words.** "No timed runs saved yet. When you sit one, that unit's best and latest run appear on its card" (`papers-desktop-light.png`). "coming" against M1, M2, M5, M6 on the flashcards index (`flashcards-phone-light.png`). No fake zero states, no invented progress.

**The theme architecture is the right one.** Three variables — `--base-h`, `--accent-h`, `--contrast` — generating every theme in LCH, exactly Linear's model, with four themes and a `data-subject` hue scope. The machine is built. It is simply not switched on: see §3.

**Tap targets are taken seriously.** A `.tap` utility (44 px floor) is applied across the item components; the option rows in `topic-heart-phone-scroll1.png` measure ~52 px.

---

## 2. The five questions

The audit instrument is the interaction table in `docs/plan/emotional-design.md` — **what did she just do · what is the immediate feedback · what should she understand · what should she feel · what happens next** — scored against the five principles (clarity, focus, momentum, calm, trust). Each fault below is judged with it.

---

## 3. What makes it "not very nice"

### 3.1 One card recipe, ninety-one times

`border border-line bg-surface` appears **70 times** in `src/` and `app/`; `cardCls` (the same string plus `p-5 shadow-1 sm:p-6`) a further **21**. Ninety-one identical containers. A diagnostic, a video, a GeoGebra licence notice, a reference link, a spec reference, a formula list and a feedback card are the same object.

`topic-histograms-phone-end.png` is the proof: four stacked white cards — SPECIFICATION, FORMULA SHEET, BUILDS ON, BEST OF WHAT EXISTS — with identical borders, radii, padding and label treatment. Nothing in the picture says which of these she is supposed to read and which she is supposed to consult later.

Worse, they nest. `topic-histograms-phone-scroll2.png` shows three levels in one screen: page ground → section card → a recessed "Open the simulation" box; and `topic-heart-phone-scroll1.png` shows page → white section card → **dashed** gate box → white option buttons. A dashed border reads as "placeholder" or "drop your file here", not "answer this".

> **Five questions.** *What happens next* is unanswerable by looking. Everything has the same weight, so nothing has priority. Fails **clarity** and **focus**.

### 3.2 The product is set in small grey type

| size | uses |
|---|---|
| `text-[13px]` | **162** |
| `text-[14px]` | **147** |
| `text-[12px]` | **100** |
| `text-[15px]` | 63 |
| `text-[16px]` | 28 |
| `text-[17px]` | 10 |
| `text-[18px]` | 7 |

Eighteen distinct arbitrary sizes, **562 instances**. Against that, the six type-scale utilities defined in `app/globals.css` (`text-h1` … `text-ui`) are used **nine times in the entire codebase** (`text-h1` 2, `text-h2` 1, `text-h3` 0, `text-prose` 0, `text-meta` 4, `text-ui` 2). The scale exists on paper and is ignored in practice.

**409 of the 562 are 12–14 px.** So around the one good typographic surface — the note — everything else is small: captions, meta lines, option labels, licence text, feedback details, chips. The eye is constantly switching between 18 px serif and 13 px sans, which is the mechanical cause of "intense".

And most of that small type is `text-ink-3`, which at `lch(60% 2 …)` is **2.98:1** on the ground. That is a live WCAG 1.4.3 failure on every eyebrow, caption and meta line in the product — roughly a hundred call sites. It is also, plainly, what "washed out" looks like.

> **Five questions.** *What should she understand* — she cannot read half of it without effort. Fails **calm** and **trust** (a product that is hard to read does not look like it was made carefully).

### 3.3 Fifty-two uppercase, letterspaced, grey labels

`uppercase tracking-[0.08em]` appears **41 times** as a literal, plus **11** uses of the `<Eyebrow>` component that contains the same string. Fifty-two.

On one phone screen of the histograms topic (`topic-histograms-phone-scroll2.png`) three of them are visible at once: `WORK THROUGH · ABOUT 6 MIN`, `WORKED EXAMPLES` (as a serif h2 beneath it), `WORKED EXAMPLE · READ EACH STEP, THEN SAY WHY` — the last wrapping to two lines of capitals. On `topic-histograms-phone-end.png` there are four in a column. On Today there are six, one per tile (`today-real-phone-light.png`).

Our own research forbids this twice over: GOV.UK's dyslexia guidance, quoted in `07-award-winning-edtech-design.md`, is "no underline/italics/capitals"; the same file's principle 13 says "no all-caps headings". Capitals at 12 px with 0.08 em tracking are slower to read, and they *shout* while carrying almost no information — "SEE IT", "CHECKED", "BUILDS ON".

> **Five questions.** *What did she just do* is announced in the same voice as *what is this section*. Fails **focus**.

### 3.4 Colour is not doing any work

| token | component uses |
|---|---|
| `tint-maths` / `-fm` / `-bio` | **2 call sites between them**, via `taxonomy.ts:75,82,89` → `bg-tint-*`, rendered only as a decorative `h-1.5 w-12 rounded-full` bar on `app/learn/page.tsx:23` and `app/flashcards/page.tsx:17` |
| `tint-chem`, `tint-phys` | **0** |
| `text-ok` | 3 |
| `text-miss` | 4 |
| `text-warn` | 2 |
| `bg-ok`, `border-ok`, `border-miss` | **0** |

Five subject tints defined across four themes. Two of them are used nowhere at all; the other three appear only as a 6 px × 48 px pale rounded bar above a card heading — the thing that reads as a leftover loading skeleton in `flashcards-phone-light.png`. That is the entire subject-colour system. Three semantic colours between them are used nine times. So:

- A **correct** answer and a **not-yet** answer are the same white card with the same border; the only difference is a 28 px glyph — a green tick or a grey hairline circle (`FeedbackCard.tsx:60,73`). `practice-miss-phone.png` shows the result: the miss reads as nothing at all.
- The **one** place colour is loud is the worst possible place. On the unit list (`unitmap-m4-phone-light.png`) the difficulty meter renders **five red squares** labelled "Where marks are lost", beside a topic she has not opened. Alarm colour, on a contents page, as a verdict before she starts.
- Meanwhile the accent — `lch(45% 60 270)` — is the saturated blue-violet of every SaaS primary button (`today-real-phone-light.png`, `practise-desktop-light.png`). Chroma 60 at hue 270 is the most generic colour in software.

### 3.5 Two different "selected" colours on one screen

`practise-desktop-light.png`: the chosen subject ("Maths"), calculator mode ("Either") and count ("6") are **black** (`bg-ink`); the primary action ("Start · 6 questions") is **blue** (`bg-accent`); the nav's active item is a **pale blue wash** (`bg-accent-3`). Three affordances for "this one is chosen", in three colours, in one viewport.

### 3.6 Third-party imagery is the loudest thing on the page

Every video is a YouTube facade. `topic-heart-phone-scroll1.png` ends on a **saturated blue banner with green display type and a face** — a thumbnail. In `topic-histograms-phone-scroll2.png` the thumbnail is followed by **six lines of grey 14 px caption**, then a nested GeoGebra box, then **four more lines** including a raw URL and a licence name. In the middle of a lesson.

We have 699 video links and they are the thing she liked. But as rendered, the loudest and largest object in a Cairn lesson is somebody else's artwork, wrapped in administrative small print.

### 3.7 The dark theme is an inversion, not a design

`topic-histograms-desktop-dark.png`. Ground `lch(10% 2 80)` is close enough to black that white Literata blooms; surface at 14% barely separates from it, so the figure's container is a ghost. And the figure itself — authored as `currentColor` at `fill-opacity: 0.18` — becomes dark-grey bars on near-black: a chart that was legible in light is a smudge in dark. 264 figures have this property.

### 3.8 Empty and loading states are undesigned where it matters

The Map (`map-desktop-light.png`) is **eleven near-identical grey bars** reading 233, 236, 239, 240, 247, 249, 255, 257, 263, 267, 268 days. The bars all sit at 92–97% full, so they encode nothing the number does not; what they *communicate* is eleven deadlines closing in. There is no designed empty state for "you have not proved anything yet" — just a full-width countdown wall.

On the flashcards index (`flashcards-phone-light.png`) each subject card opens with a **6 px pale-blue rounded bar** that reads as a leftover loading skeleton.

---

## 4. What makes it "intense" — and "unattractive for a first-timer"

### 4.1 The primary action is two screens below the fold

This is the most important finding in the audit.

`TopicHero.tsx` renders, in order: eyebrow → mastery chip + next-paper chip → h1 → lede → **figure** → three "you will be able to" bullets → the meta line → Rowan's line → **"Start the lesson"**.

On a 390 × 844 phone, measured from the captures: the h1 ends at ~510 px, the lede at ~700 px, the figure card runs to ~1,040 px, the three bullets to ~1,180 px, the meta line at ~1,225 px, and the primary button lands at **≈1,260 px** (`topic-histograms-phone-scroll1.png`, taken at scroll 900, shows it at y ≈ 361 CSS px). That is **one and a half screens of scrolling before the one thing she is meant to do.**

Everything needed for a good first five seconds is authored and present — a plain-English lede, three objectives, an honest "About 16 minutes · 10 short sections · 12 checks · 3 worked examples" — and all of it is below or beneath the thing that should carry it.

> **Five questions.** *What should she understand* in five seconds: nothing actionable. *What happens next*: unknown. Fails **clarity** and **momentum** outright.

### 4.2 The first screen is a spec statement at display size

`topic-histograms-phone-light.png`. "Histograms with unequal class widths (frequency density) and estimating the median" is set at 32 px Literata and takes **four lines** — about 40% of the first screen — before a word of orientation. It is the specification's title, not a headline. The note already contains the sentence that should be there ("A bar chart shows how many by how tall…") but it is the *second* thing, at 19 px.

### 4.3 The honest promise is rendered as the quietest thing on the screen

"About 16 minutes  10 short sections  12 checks  3 worked examples" is `text-meta text-ink-3` — 13 px at 2.98:1. This is our DeepStash three-metric header. It is the single best answer we have to "why is this worth my time", and it is set smaller and fainter than the licence note under a GeoGebra link.

### 4.4 The spine does not work on a phone

`topic-histograms-phone-scroll2.png`: the sticky stage bar is a horizontal scroller of pills, each pill containing a full section title. At 390 px **you can see one and a fraction pills**. So the component that exists to answer "where am I and how much is left" answers neither, while costing 64 px of a 844 px screen and competing with a 56 px bottom nav. Two sticky bars, 120 px, 14% of the screen.

### 4.5 A contents page that grades her before she starts

`unitmap-m4-phone-light.png`. Each row carries four or five filled squares and the word "Hard" — or five red squares and "Where marks are lost". The difficulty block reserves so much of the right-hand column that topic 3's title wraps to **six lines**, and its "Lesson and practice" pill **breaks across two lines into two separate pill fragments**. The first impression of a unit is: nine topics, all Hard, several bleeding red.

### 4.6 Density: one page, 19,418 px

The histograms topic measures **19,418 px** tall on a phone — 23 screens, roughly 8,000 words, ten sections, three worked examples, a four-item check, fourteen practice questions, four exam-style questions, three find-the-mistake items, seven prompts and four reference cards. There is no recap, no stopping point, no close card and no stone at the end of it. `topic-histograms-phone-end.png` is where the page stops: a link list and the line "Linked with credit, never copied."

> **Five questions.** *What happens next* at the end of a lesson: nothing. She does not know she has finished. Fails **momentum** and **calm**.

### 4.7 How a wrong answer looks

The marking is good; the *look* of it is absent. In `practice-miss-phone.png` a wrong gate answer produces: the label `CHECKED` (which on the same page also names the verification panel — a collision), the stem repeated, then "You: 1700 · expected 2" in grey with a grey hairline circle, then the diagnosis in serif. No colour, no rule, no change of surface. The object she has just acted on looks exactly like the object above it that she read.

There is a real principle underneath this — no shame, no red flash, `emotional-design.md` rule 4 — and it is being honoured by *removing* signal rather than by designing a calm one. The fix is not red. It is that a marked answer should become a visibly different kind of object.

---

## 5. Against the best in class, by name

Scored on what is visible, not on what is planned.

### DeepStash — reading rhythm and card typography
**Borrow:** the three-metric header answering *what is this, how long, what do I get* before any scroll — we already compute ours and must promote it from 13 px grey to the confident line of the hero. The one-idea-per-card rhythm, which for us means the numbered note section: one idea, one figure, one gate. And the argument that the typeface is itself a claim — Lexend for them, Literata for us, already loaded and already good.
**Do not borrow:** the optimistic minute count (their "6 min read" is about 3× short). If we say 16 minutes it must be 16. The full-page streak interstitial. The card wall behind a paywall. And do not borrow their *card*: DeepStash's card is the unit of reading because it holds 70–85 words. Ours currently holds a licence notice.

### Duolingo — clarity and immediate feedback
**Borrow:** value before setup (their first lesson precedes sign-up); the unmistakable state change at the moment of answering — you are never in doubt that something happened; one screen, one question, one action.
**Do not borrow:** anything that follows the answer. No end-of-lesson economy, no XP, no hearts, no streak, no league, no mascot reaction. Their clarity comes from the *moment of feedback*; their retention comes from loss aversion. Take the first, refuse the second. In particular: their feedback is loud because it is coloured red and green edge-to-edge; ours must be unmistakable *without* using red at all.

### Linear — restraint
**Borrow:** themes from three variables in LCH (we already have this); explicit elevation levels; one accent that means "the thing to do next" and appears **once per screen**; neutral greys with reduced blue chroma; the discipline that a UI which never decorates reads as competent.
**Do not borrow:** the near-monochrome density. Linear is a tool for eight hours a day; she uses this for twenty minutes on a bus. We need the warmth Linear deliberately refuses, and we need bigger type than a professional tool can get away with.

### Apple Books / Readwise — reading comfort
**Borrow:** prose sits on the page, not in a container. The paper is warm, not blue-white. The measure is fixed and the furniture gets out of the way. Readwise's discipline that the *source* of a passage is available but never competes with the passage.
**Do not borrow:** the page-turn skeuomorphism, and the idea that reading is the goal. Our note is interrupted by a gate every ~150 words on purpose.

### Brilliant — interactive maths
**Borrow:** one idea, one screen, one interaction; predict-then-reveal; and the pattern that a wrong answer produces a **visual consequence in the figure** before any text. We have 264 computed SVGs and 2,612 authored common errors and we currently answer every miss with prose alone. The twenty-second proof: hand her a working object before a feature list.
**Do not borrow:** their fully-illustrated house style, which costs a commissioned illustration programme we will not have, and which our own research bans on content screens.

### Khan Academy — calm
**Borrow:** the mastery vocabulary and its honesty (levels go *down*; Mastered is only reachable on a mixed check); progress shown without urgency; a page that never hurries you.
**Do not borrow:** energy points, and the greyness. Khan's calm shades into institutional; our Map is already halfway there (eleven grey bars) and needs warmth and a subject hue to stop looking like a school portal.

### The honest position
Seneca does not cover CCEA at all. Bitesize does, free, and caps you around a B with no record of what you got wrong. So the *content* argument is already won — 274 named examiner findings, 2,612 authored errors, schemes in CCEA's own language, 414 official papers. **The appearance is the only part of "why this platform" that is currently losing**, because in the first five seconds she cannot see any of that. She sees a four-line spec title, a grey meta line she cannot read, and no button.

---

## 6. Summary of faults, in the order they cost her

| # | Fault | Evidence | Principle failed |
|---|---|---|---|
| 1 | Primary action ≈1,260 px down on a phone | `topic-histograms-phone-scroll1.png`, `TopicHero.tsx` order | clarity, momentum |
| 2 | Prose and reference live on the same card as interaction; 91 identical containers, nesting 3 deep | 70 + 21 call sites | clarity, focus |
| 3 | 409 instances of 12–14 px type; `ink-3` at 2.98:1 | 562 arbitrary sizes vs 9 scale uses | calm, trust |
| 4 | 52 uppercase letterspaced grey labels | 41 + 11 call sites | focus |
| 5 | Subject tints reduced to a decorative bar; semantic colour used 9 times; red squares on a contents page | 2 call sites, 2 tints unused | trust, calm |
| 6 | Spine unusable at 390 px; two sticky bars = 120 px | `topic-histograms-phone-scroll2.png` | clarity |
| 7 | Third-party thumbnails are the loudest object in a lesson | `topic-heart-phone-scroll1.png` | focus |
| 8 | A marked answer looks like an unmarked one | `practice-miss-phone.png` | momentum |
| 9 | 19,418 px with no recap, stopping point, close card or stone | page height measured | momentum, calm |
| 10 | Dark is an inversion; figures illegible in it | `topic-histograms-desktop-dark.png` | calm |
| 11 | Map is eleven countdown bars with no empty state | `map-desktop-light.png` | calm, trust |
| 12 | Two "selected" colours and a third nav wash on one screen | `practise-desktop-light.png` | focus |

---

## 7. Screenshots

All in `audit/`, live app, 19 September build.

| File | What it shows |
|---|---|
| `today-phone-light.png`, `welcome-phone-light.png` | First run: the gift note, the only screen with one clear action |
| `today-real-phone-light.png`, `today-real-desktop-light.png`, `today-real-phone-dark.png` | Today after first run: six identical tiles, six uppercase labels |
| `unitmap-m4-phone-light.png`, `unitmap-m4-desktop-light.png` | The unit list, the difficulty meter, the broken pill |
| `learn-index-desktop-light.png` | The subject index |
| `topic-histograms-phone-light.png` … `-end.png` (7 captures) | A maths topic top to bottom at 390 px |
| `topic-histograms-desktop-light.png`, `-scroll1.png`, `-desktop-dark.png` | The same at 1280 px, light and dark |
| `topic-heart-phone-light.png`, `-scroll1.png`, `topic-heart-desktop-light.png` | A science topic: gates, the dashed box, the video thumbnail |
| `practice-midanswer-phone.png`, `-desktop.png` | A question mid-answer |
| `practice-miss-phone.png`, `-desktop.png` | The same answer marked |
| `papers-phone-light.png`, `papers-desktop-light.png` | The papers plan |
| `flashcards-phone-light.png`, `flashcards-maths-phone-light.png` | Decks by unit |
| `practise-desktop-light.png` | Mixed practice: three selected-states in three colours |
| `map-desktop-light.png` | The countdown wall |
| `review-phone-light.png` | The review queue |

**How the counts were produced** (from the project root):

```
grep -rn "border border-line bg-surface" src app --include=*.tsx | wc -l     # 70
grep -rn "cardCls" src app --include=*.tsx | wc -l                          # 21
grep -rn 'uppercase tracking-\[0.08em\]' src app --include=*.tsx | wc -l    # 41
grep -rn "<Eyebrow" src app --include=*.tsx | wc -l                         # 11
grep -rno 'text-\[[0-9]*px\]' src app --include=*.tsx | sed 's/.*text/text/' | sort | uniq -c | sort -rn
grep -rn "tint-maths" src app --include=*.tsx --include=*.css               # globals.css only
grep -rn "tintClass" src app --include=*.ts --include=*.tsx                # 3 defs, 2 call sites
```

Contrast ratios are computed from the LCH lightness, `Y = ((L + 16) / 116)^3`, against the ground or surface each token is used on.
