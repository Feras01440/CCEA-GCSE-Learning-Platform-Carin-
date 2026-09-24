# 03 — Implementation plan

20 September 2026. For the app session, which owns `src/`, `app/` and the e2e specs. This session owns only `docs/design/art-direction/` and has changed nothing under `src/`, `app/` or `packs/`.

Three passes, in this order. Pass 1 is a day and moves the whole product; pass 2 is the topic page, where she spends her time; pass 3 is the part that can wait.

**The one number to hold on to:** today the primary action on a topic page sits ≈1,260 px down a 844 px phone screen. After pass 2 it must be inside 640 px. That is the acceptance test that matters more than any other in this document.

---

## Pass 1 — Tokens and type (about a day)

Whole-product effect, no component restructuring, no behaviour change. Do this first and alone, so the diff is reviewable.

### Files

| File | Change |
|---|---|
| `app/globals.css` | Replace lines 51–196 and the `@theme inline` block with `docs/design/art-direction/tokens.css`. Keep the `@font-face` rules, `html`/`body`, `.tnum`, `:focus-visible`, `.rise-in`, `.stone-settle`, `.skeleton`, the reduced-motion block and the overflow rules exactly as they are, and take the four replacement rules at the foot of `tokens.css` (`.katex`, `.prose-note`, `.section-rule`, `.tap`/`.tap-lg`). |
| `src/components/items/ui.tsx` | `cardCls`: drop `shadow-[var(--shadow-1)]`, border to `border-line-2`. `fieldCls` and `btnOption`: border to `border-line-3`. `btnPrimary`/`btnSecondary`: `text-ui`, and add a `tap-lg` variant for answer controls. **Delete the `Eyebrow` component's uppercase and tracking**: `text-meta font-medium text-ink-2`, sentence case. |
| `src/components/shell/PageHeader.tsx` | `h1` stays `text-h1`; the eyebrow becomes the 13 px locator style, used only here. `lede` from `text-ui` to `text-prose text-ink-2`. |
| Codemod across `src/**` and `app/**` | `text-[12px]` → `text-meta`; `text-[13px]` → `text-meta` (or `text-micro` **only** where the element also has `tnum`); `text-[14px]` → `text-meta`; `text-[15px]` → `text-ui`; `text-[17px]`/`text-[18px]` in prose → `text-prose`; `text-[24px]` → `text-h2`; `text-[19px]`/`text-[20px]` → `text-h3`. 562 instances; the 11px/10px ones (13 instances) are deleted, not converted. |
| Codemod across `src/**` and `app/**` | `uppercase tracking-[0.08em]` → removed, and the adjacent `text-[12px] ... text-ink-3` → `text-meta text-ink-2`. 41 literal sites plus the 11 `<Eyebrow>` call sites. **Rewrite the strings to sentence case at the same time** — `WORK THROUGH · ABOUT 6 MIN` → `Work through · about 6 min`. |
| `app/flashcards/page.tsx:17`, `app/learn/page.tsx:23` | Delete the decorative `h-1.5 w-12 rounded-full` tint bar. |
| `src/lib/content/taxonomy.ts:75,82,89` | Keep `tintClass`; it gets its real job in pass 2. Add the two missing tints so all five exist. |
| `src/components/companion/CompanionMemory.tsx` | `text-miss` → `text-danger` on the destructive confirm. This is required, not optional: `--miss` is no longer red. |
| `src/components/topic/DifficultyDots.tsx` | Delete the red state. The component stops being rendered in pass 2; in pass 1 just make sure nothing on a contents page is red. |

### Acceptance

- `npx tsc --noEmit` clean, `npm test` green.
- **Contrast**: no text element below 4.5 : 1 (3 : 1 for ≥24 px, or ≥18.66 px bold) on Today, a unit list, a topic page, practice, papers and flashcards, in **light and dark**. The checker used for the mockups is `scratchpad/art-direction/check.mjs` and can be pointed at `localhost` instead of `file://`; it reports the failing element, size, colour and ratio.
- **Tap targets**: no interactive element under 44 px tall; answer controls, grading buttons and the Check button at 52 px.
- `grep -rn 'text-\[[0-9]*px\]' src app --include=*.tsx | wc -l` → **0**.
- `grep -rn 'uppercase tracking' src app --include=*.tsx | wc -l` → **1** (the page locator in `PageHeader`).
- `grep -rn 'shadow-\[var(--shadow-1)\]' src app --include=*.tsx` → the token is now `none`, so these are inert; delete them opportunistically, do not block on it.
- The five emotional-design questions, on any screen touched: *what did she just do* / *what is the immediate feedback* / *what should she understand* / *what should she feel* / *what happens next*. Pass 1 changes none of the answers; it only makes them readable. If any answer got **worse**, the token change is wrong.
- Dark mode: open the histograms topic in dark and confirm the figure is legible (this is what `--fig-fill` 0.14 is for). Confirm no surface is pure black.
- No confetti, XP, streaks, hearts or leaderboards introduced. (Trivially true here; the check is part of every pass.)
- Playwright specs that must stay green: **all twelve** — `today`, `learn`, `practice`, `papers`, `flashcards`, `first-run`, `companion`, `map-ledger-settings`, `offline`, `plot`, `transformation`. Pass 1 touches no DOM structure, so any failure is a real regression. Run them **alone**, not under load: a 1-minute Playwright timeout under a concurrent build is not a regression, and a failed spec should be re-run in isolation before it is believed.

### What must not change in pass 1

- Any marking behaviour, any copy in `FeedbackCard.tsx`, `mark.ts`, `text-marking.ts`, `equation-marking.ts`, `mistake-marking.ts`.
- The companion's selection logic, its constitution, or the containment rule.
- The teach-first order.
- `--radius` may move 14 → 12 and `--shadow-1` → `none`; nothing else about layout.

---

## Pass 2 — Surfaces, topic page first (about a week)

Ordered by where her time goes. The topic page is roughly 90% of it.

### 2a. The topic hero — the single highest-value change

**Files:** `src/components/topic/TopicHero.tsx`, `app/learn/[subject]/[unit]/[topic]/page.tsx`, `src/components/topic/lesson-plan.ts`.

1. Re-order the hero to: locator → display title → lede → promise line → **buttons** → chips → Rowan → objectives → figure. (`TopicHero.tsx:145-200` currently runs title → lede → figure → objectives → facts → Rowan → buttons.)
2. The display title is the note's **first heading**, not `topic.title`. The full CCEA statement moves to the "In the exam" recess beside the spec code.
3. The promise line goes from `text-meta text-ink-3` to `text-ui text-ink-2` with the minutes in `text-ink font-semibold`, and gains the examiner-finding count where an insight exists (`5 examiner findings` on histograms).
4. The figure moves below the objectives, out of its card, onto the page.
5. Server-render the hero, so the display title, lede, promise and button are in the first paint. `contentFor` returns a manifest row only today; this needs a build-time read of the bundle JSON. If that cost is not acceptable this week, ship the re-order client-side first and the SSR second — the re-order is what she will notice.

**Acceptance:** a Playwright assertion, added to `e2e/learn.spec.ts`, that at 390 × 844 the element with text `Start the lesson` has `getBoundingClientRect().top < 640` on at least three topics across the three subjects. Make it a permanent test, not a one-off check.

### 2b. Three surfaces

**Files:** `src/components/items/ui.tsx`, `src/components/topic/TopicContent.tsx`, `src/components/items/StepRevealNote.tsx`, `src/components/media/VideoEmbed.tsx`, and the ~70 `border border-line bg-surface` call sites.

1. Add `recessCls` beside `cardCls` in `ui.tsx`: `rounded-[var(--radius-sm)] bg-surface-2 p-4`.
2. **Every container that holds no control becomes a recess or nothing.** Note prose, callouts, spec rows, formula lines, links, licence text, the Checked panel, captions: page or recess. Objects are gates, questions, options, feedback, Today's Tonight tile, the Letter, a flashcard.
3. **Delete the dashed border** on the gate (`StepRevealNote`), and cap nesting: an object may contain a recess; two objects may not nest.
4. Media: the 16:9 banner becomes a 112 px [160] row with `filter: saturate(.75)` and a 6% ink veil. Attribution and licence move into a `<details>` labelled "Source".
5. The four end-of-topic reference cards become recesses under one `In the exam` rule.

### 2c. The spine

**File:** `src/components/topic/LessonSpine.tsx`.

- Phone: replace the chip scroller with a 3 px progress track + a 44 px bar (`N of M · title · N min`, title truncating) that opens a sheet. 47 px total, one sticky element; the bottom tab bar is the other, and they must never both animate.
- Desktop: a 200 px sticky rail left of a 720 px lesson column, `max-height: calc(100vh - 120px); overflow-y: auto`, current row on `--accent-3`, completed rows carrying a 14 px stone in place of their number.
- Delete the `hidden md:flex` seven-link nav.

### 2d. The unit list and Today

**Files:** `app/learn/[subject]/[unit]/page.tsx`, `src/components/topic/DifficultyDots.tsx`, `src/components/home/TodayTiles.tsx`.

- **Delete the difficulty meter from the contents page entirely** and with it the red. Replace with an "Examiners flag this one" recess chip on the ~56 topics with an insight. Delete the "Lesson and practice" pill. Row state becomes a 20 px glyph gutter so titles never reflow.
- Today: six tiles → one object (Tonight) + the Letter + four page rows + one recess. "0 / 4" becomes four stones and "Four is the plan, not a target."
- Subject tint job 1: a 3 px `--accent` left rail with the list on the tint at 50%, on the unit list and the flashcards index.

### 2e. The marked answer

**Files:** `src/components/items/FeedbackCard.tsx`, `src/components/items/ui.tsx`.

- Add the 3 px left rule: `--ok` / `--warn` / `--miss`. **This is the change that makes a marked answer visible.**
- The diagnosis becomes a two-column `<dl>` at `text-ui`; the examiner quote becomes a recess in Literata italic with a `cite`.
- Add the mark meter and the mark-code chips at `text-micro` / `--radius-xs`.
- Add the sentence "It comes back on Thursday." beside the actions — but **only once `ensureCard` is called for every `itemKind`** (`src/lib/session/record.ts:66`). Do not print a promise the product does not keep; that is item 1 of the quality bar and half a day's work.

### 2f. Papers and flashcards

- Papers: four phases, four screens, one accent each; the running screen strips everything but the clock; "in 233 days" is 14 px at the end of a row and never a bar.
- Flashcards: delete the tint bar, three 52 px grading buttons, **none of them accented**.

### Acceptance for pass 2

- The 640 px assertion above, on three topics.
- `grep -rn "border border-line bg-surface" src app --include=*.tsx | wc -l` falls from 70 to **under 25**, and every survivor holds a control.
- No `aria-hidden` element is visible, and no element is both `pointer-events-none` and focusable — keep the acceptance test the 13 Sep review asked for.
- No `border-dashed` in `src/components`.
- Contrast and tap targets re-checked at 390 and 1280, light and dark.
- A phone screenshot of a topic page shows **at most one sticky element** besides the tab bar.
- **The five questions, re-asked per surface**, using `02-surfaces.md` as the answer key. The one that catches regressions: *what happens next* must be answerable from the pixels alone on every screen.
- Playwright: `learn`, `practice`, `today`, `papers`, `flashcards`, `companion` will all need selector updates. Update them in the same commit as the component; do not leave a red spec overnight.

### What must not change in pass 2

1. **The marking surfaces' behaviour.** `mark.ts`, `text-marking.ts`, `equation-marking.ts`, `order-marking.ts`, `mistake-marking.ts`, `spec-map.ts`, the self-award override, the QWC band decision, the 2,612 authored errors, and every string in `FeedbackCard.tsx` except where this document names one. The word "Wrong" still appears nowhere.
2. **The containment rule for the companion's signed line.** No `data-companion` element may be a descendant of a section, form, article or card containing an answer field, and it must precede the first answer field in document order. Enforced by `e2e/companion.spec.ts:210-226`; the hero re-order in 2a moves the line, so re-run that spec specifically. The second-miss line stays unsigned: no mark, no name, no attribute.
3. **Teach-first.** No gate, check, diagnostic or question before the first teaching section. Nothing dims, nothing locks, and the `dim` mechanism does not come back.
4. The gate mechanic and its copy ("Yes." / "Not quite."), the confidence scale and hypercorrection routing, the fading worked-example machinery, `FindTheMistake`, the Checked panel, the "Not on this spec" callouts, and the unit list's teaching order.
5. Offline: the lesson stages stay inside one topic URL. Turning a stage into a route or a query state silently drops it from the service worker's precache under `output: "export"` with `trailingSlash: true`.

---

## Pass 3 — Polish and motion (two to three days)

Only after passes 1 and 2 are green.

### Files and work

| Work | Files |
|---|---|
| **Two-colour figures.** One accent element per figure; labels on the figure with a `--fig-halo` paint-order stroke; no legends; construction lines dashed at 1.25 px. | `src/components/figures/generated.tsx`, `src/components/items/Figure.tsx`, and the generator in `pipeline/` that emits the 264 SVGs |
| **The visual consequence on a miss.** Where a figure exists and the error matches an authored `commonError`, re-render the figure with her answer against the right one, before the prose. | `src/components/items/Figure.tsx`, `FeedbackCard.tsx`, `mark.ts` (result must carry the matched error id) |
| **Motion pass.** `--dur-fast` 120 ms press; `--dur` 200 ms reveal; 250 ms tick; 200 ms progress; `--dur-slow` 300 ms stone. Transform and opacity only. Delete any `transition-colors`, hover-lift or scroll-linked effect. | `ui.tsx`, `ProgressLine.tsx`, `CairnStack.tsx`, `StepRevealNote.tsx` |
| **The close card and the stone.** One per session at most. | `src/components/ux/CloseCard.tsx`, `TopicContent.tsx` |
| **Empty and loading states**, to the table in `02-surfaces.md §9`. Skeletons content-shaped, minimum 200 ms, a sentence after 3 s. | `src/components/ux/Skeleton.tsx`, Today, Map, Papers |
| **Icon pass.** `strokeWidth={1.5}` everywhere; 16 / 18 / 20 px only; no icon-only controls outside the tab bar; the vocabulary capped at ten. | all `lucide-react` call sites |
| **First run screen 3**, ending inside a seeded topic. | `src/components/gift/FirstRun.tsx` |

### Acceptance for pass 3

- `prefers-reduced-motion: reduce` → `document.getAnimations().length === 0` on Today, a topic page and a practice question. Make it a Playwright assertion.
- No animation outside 120–300 ms except the stone (300) and a milestone card (1,200 ms, at most once a term).
- **Nothing animates on scroll or hover.** Grep for `transition` and check each survivor.
- Every figure survives a greyscale render: no information is carried by colour alone. Print one at 100% grey and read it.
- KaTeX: `.katex` at `1em` inline and `1.1em` display; no display equation causes horizontal page scroll at 390 px; every one scrolls inside its own box.
- Contrast and tap targets, one more time, across all six themes-and-viewports (light/dark × phone/desktop, plus evening and high-contrast spot checks).
- Still no confetti, XP, streaks, hearts, leagues or mascot. Still no `--miss` red. Still one accent per screen.
- All twelve Playwright specs green, run alone.

---

## The order, if there is only a week

If the whole plan cannot be done before she sees it again, this is the order of value:

1. **Hero re-order** (2a). Half a day. Moves the button from 1,260 px to under 640 px.
2. **Tokens and type** (pass 1). One day. Fixes the contrast failure, the 12 px type and 52 uppercase labels across the whole product at once.
3. **Three surfaces** (2b). Two days. Turns the lesson from a stack of boxes into a document.
4. **The 3 px left rule on a marked answer** (2e, first bullet). One hour, and it is the difference between momentum and none.
5. **Delete the red difficulty squares** (2d, first bullet). One hour, and it removes the most discouraging pixels in the product.

Those five are three days and they are the whole of the first five seconds.

---

## How to check it worked

Not by asking whether it looks nicer. By these:

- At 390 px, on any topic: the display title, the lede, the promise line and the button are all on the first screen. Measurable.
- A screenshot of the lesson has fewer than four rectangles on it. Countable.
- The smallest text on the screen is 13 px and it is a number. Countable.
- A wrong answer looks different from a paragraph. Visible in a screenshot.
- Nothing on a contents page is red. Visible in a screenshot.
- Then, and only then: sit with her for twenty minutes and ask the four things — was she taught before she was tested, could she answer everything on screen, did the first screen tell her what the topic was, and did she know when she had finished. Her reaction overrides this document.
