# 04 — Critique

20 September 2026. A review of `00-audit.md`, `01-art-direction.md`, `02-surfaces.md`, `03-implementation-plan.md` and `tokens.css`; of the fourteen mockups in `mockups/` (built from the M4 histograms bundle) and their three HTML sources; of twelve of the live-app captures in `audit/`; and of the three showcase screenshots of 19 September that the direction says it carries forward. Judged against `docs/plan/emotional-design.md`, `docs/plan/why-this-platform.md`, the 13 September learner review, the 19 September quality bar and the companion spec, and against the apps she would actually compare it with. Where a claim rests on a value or a line of code, the file is named so it can be checked.

The standing test is hers: why do I need this, how is it different, how can it help me, why is it worth my time. The standing rule is the owner's: judge without lies to ourselves. So the verdicts say better, equal or behind, and mean it. Nothing here is softened because the work is ours.

---

## 1. Verdicts

| Surface | In three words | Against the named apps | The single reason |
|---|---|---|---|
| **Today** | Clear, honest, unpulling | **Behind** Duolingo and DeepStash on return; equal to DeepStash on clarity | The mockup draws the first evening (the Letter). The evening she will meet two hundred times is not drawn, and in it nothing above the fold is about her: the sub-line under the count is the same sentence every night, and the count is a chore. |
| **Topic page** | Clear, finally; pictureless | **Equal**: better than DeepStash and Bitesize in the first five seconds, equal to Kinnu on the lesson, behind Brilliant | The button is at 367 px and the promise is legible, which fixes the worst thing in the live app. But the first screen now shows no picture: the figure that is ours has gone below the objectives, and Brilliant would have the histogram in her hands by the third second. |
| **Practice question** | Better once marked | **Better** than Duolingo, Seneca and Bitesize on what a miss teaches; equal to Brilliant on the visual consequence; behind Duolingo on how instantly the state registers | A mark code shown earned or struck beside a figure that draws her answer against the right one is something no product can do for CCEA. The reservation is the not-yet state, carried by a 3 px slate rule in nearly the same colour as the maths accent. |

Two qualifications, so the table is not read as more than it is. "Behind on return" for Today is partly chosen: the direction refuses the streak and the loss framing, and it is right to. The part that is not chosen is that the non-manipulative pull the companion spec promises (one fact about her own work, every arrival) is missing from the mockup. And "better" for practice is a verdict on the direction as drawn: the wrong-answer figure is pass 3 and needs `mark.ts` to return the matched error id. Until it lands, a miss is prose and the surface is equal, not better.

Net: the direction moves the two surfaces she complained about from behind to level, and the one she did not mention to ahead. It does not yet answer the fifth-evening question, and the five risks in §3 could take back most of what it gains.

---

## 2. What it gets right, and must survive implementation

1. **The hero order and the 640 px rule.** `Start the lesson` at 367 px (`mockups/topic-phone.png`) against ≈1,260 px live (`audit/topic-histograms-phone-scroll1.png`). Worth more than everything else in the plan; `03` puts it first, and it must stay first.
2. **The promise line promoted.** "About 16 minutes" in 600 ink at 15 px, with the examiner-finding count, above the button. It is the only differentiating fact on the first screen. Live it is 13 px at 2.98:1.
3. **Three surfaces, prose on the page.** `topic-phone-lesson.png` is a document with one object in it; `audit/topic-histograms-phone-scroll2.png` is boxes in boxes. Nesting capped at one, dashed borders gone, shadows gone. This is the structural fix for "intense".
4. **The eyebrow's death.** "1 · Read and check · 2 min" against "WORKED EXAMPLE · READ EACH STEP, THEN SAY WHY" wrapping to two lines of capitals.
5. **Selection is ink, action is accent.** One rule fixes the three chosen colours in `audit/practise-desktop-light.png`.
6. **The red squares deleted from the contents page.** The most discouraging pixels in the product (`audit/unitmap-m4-phone-light.png`), gone.
7. **The video as a row, the licence in a disclosure.** The loudest object in a lesson becomes a 112 px thumbnail; four lines of GeoGebra licence become one sentence behind "Source".
8. **The wrong-answer figure.** `practice-phone-notyet.png`: her 24 drawn as a bar that leaves the axis, "twenty times off this scale", beside the bar at 1.2 with area 24. The best thing in the mockups, and it costs no artwork. The most important sentence in the plan is that this lands before the prose.
9. **Mark codes shown earned and struck** (`MA1`, `M1`, ~~`A1`~~). CCEA's own language, visible, at the moment it matters.
10. **Done-only stones; "0 / 4" gone; empty states in the future tense.** Rule 1 of `emotional-design.md` finally applied to the week strip.
11. **Dark as a different paper, and `--fig-*` as tokens** so 264 figures are not re-authored.
12. **§15 of `01`.** The paragraph admitting that restraint may read as flat, and the method for finding out. Keep the method; run it earlier (R5).

---

## 3. The five biggest risks

### R1. The three inks have become two, and the page goes flat

`tokens.css`: `--ink-2` at 42%, `--ink-3` at 46%. Four lightness units apart. Live they are 40 and 60. The quiet register the direction leans on everywhere (captions, source lines, the locator, the minutes in the spine, the "why" line under a plan row) is now the same grey as labels and lede sub-lines. Two consequences. The hierarchy the tables in `01` and `02` assign to ink-2 and ink-3 — dozens of times — does not exist on the page. And the product loses its third tone, which is the mechanical reason the mockups look flatter than the showcase: the showcase had ink, a mid grey and a light grey; the mockups have ink and one grey.

It happened for a good reason. Ink-3 is pinned at 46 by the recess (4.57:1 on the L95 surface); any lighter fails there. So the fix is the other way.

**Amendment.** `--ink-2: lch(36% 4 var(--base-h))` (7.0:1 on the ground); keep `--ink-3` at 46. Steps of 18 and 10 instead of 24 and 4. Evening the same (`--ink-2: 37%`). Dark is already 74/62 and needs nothing. And a rule: below 18 px, only two text greys exist on any one surface; ink-3 is for the locator, figure captions and the spine's minutes, nothing else.

### R2. Slate for a miss is honest in the pixels, evasive in the prose, and nearly the maths accent

The brief asks whether slate for a miss is honest or evasive. In the pixels it is honest: `practice-phone-notyet.png` says "Not yet", "0 of 1 mark", `MA1` struck, the meter empty, "It comes back on Thursday". Nothing is hidden and nothing is red, and that is the right register for a sixteen-year-old who will get enough red from her mocks. The evasion is in `01` §4.5: "a wrong answer is simply *unmarked*". If implementation takes the mood of that sentence rather than the facts of the mockup — drops the struck code or the "0 of N" because they are "negative" — the card becomes a shrug, and a shrug after a confident wrong answer is exactly what hypercorrection cannot survive.

**Rule.** The mark meter and the struck code are mandatory on every not-yet and part-way card. A not-yet card without a visible "0 of N" is a lint failure.

The colour is the second half. `--miss` is `lch(40% 8 252)`; the maths accent is `lch(40% 22 266)`. Identical lightness, hues 14° apart, chroma 8 against 22. On the not-yet card the slate rule sits 40 px above a `Fix it now` button in the maths accent, and in the mockup they read as the same dark blue-grey. So the colour that means "the thing to do next" and the colour that means "not yet" are, on the surface she will use most, the same colour at the same weight, and the meanings in the margin-rule table (`01` §1: accent = "you are here", miss = "judged") are carried by position alone. The direction calls the root accent "a dark blue-grey that reads almost as ink" and the miss "slate ink". It is describing one colour twice.

**Amendment.** `--miss: lch(40% 3 var(--base-h))` in light, `lch(70% 3 var(--base-h))` in dark: the warm neutral of the ink, no blue. A not-yet is then judged in ink, which is what the direction says it wants. And the accent rule never appears inside an object; a rule inside an object is always a verdict.

### R3. The type floor is broken by the two things she reads most: figures and maths

**Figures.** `src/components/figures/generated.tsx`: `W = 640`, labels at `fontSize={13}`, rendered `w-full`. At 390 px with 16 px gutters the SVG is 358 px wide, a scale of 0.56, so every axis numeral and label renders at **7.3 px**. The mockup (`topic.html`, viewBox 560, font-size 12) renders at 7.7 px; look at the axis numerals in `topic-phone-lesson.png`, the smallest text on the screen by a factor of two. `01` §7 specifies "labels on the figure, Inter 500, 13 px" without noticing that a viewBox scales them, and 264 figures inherit it. The floor the direction is proudest of — "below 13 px nothing exists" — is violated by every figure on every phone, and the figures are the one artwork the product owns.

*Amendment.* Label size becomes a breakpoint value in viewBox units: 24 below 768 px (13.4 px rendered at 358 wide), 14 from 768 px; axis numerals `tabular-nums`. Playwright: for every `svg[viewBox]` in the viewport, `fontSize × clientWidth / viewBoxWidth ≥ 13`. While in that file: `fillOpacity={0.18}` at line 106 is hard-coded, so the `--fig-fill` token the dark-mode fix depends on is not read by the generator today.

**KaTeX.** `.katex { font-size: 1em }`, from 1.06. KaTeX_Main has a smaller x-height than Literata, so at 1em inline symbols look about a tenth smaller than the words beside them; the "fraction sits a shade proud" impression at 1.06 is the fraction's *height*, not its size, and 1em does not change it. Worse, an inline `\frac` sets numerator and denominator at scriptstyle, 0.7 em: 17 × 1.0 × 0.7 = **11.9 px**, under the floor, and `01` §3.4 instructs exactly that ("a fraction in running prose uses `\frac`").

*Amendment.* `.katex` stays at 1.06em (try 1.1 by eye on the `0 < t ⩽ 10` stem at 390 px). Inline stacked fractions become a content lint (`\tfrac` at most; a solidus or ÷ preferred), not a renderer rule. Playwright: the smallest computed font-size of any text inside `.katex` ≥ 13 px.

**Further Maths density.** FM notes are display maths at density: a product-rule derivative or a determinant expansion at 18.7 px is 300–400 px wide and the measure at 390 is 358. `overflow-x: auto` on a phone hides the right-hand end of an equation behind a scrollbar iOS does not draw, and the right-hand end of an equation is the answer. Nothing in the direction measures how often this happens, and FM carries equal priority.

*Amendment.* Before pass 2, count at 390 px every `.katex-display` with `scrollWidth > clientWidth` across all 17 FM bundles and every M-unit bundle, and report the number per bundle. Above a handful, display maths gets a step-down (1.1 → 1.0 → 0.92 em, glyphs never under 13 px) before it gets a scrollbar; and the content session's brief gets a rule that one equality goes on one line.

**Two more floor breaks the direction does not see.** The tab-bar labels are 11 px in the live nav (`Nav.tsx:151, 169`) *and* in every mockup (`today.html:51`, `topic.html:47`), and the plan deletes 11 px classes without saying what a tab label becomes; the direction has no legal size for one, since 13 px is numerals-only. *Amendment:* tab labels are `--fs-micro` 13 px Inter 500, and "a label under a tab-bar icon" joins the legal uses of 13 px. And the feedback card's two-column `<dl>` (`7rem` label column) leaves about 190 px for the value at 390 px, so "What happened / The step" wrap to three lines each in `practice-phone-notyet.png`. *Amendment:* the `<dl>` stacks below `sm`, two columns from `sm`.

### R4. The margin rule is asked to be two things and is not quite either

As the state carrier on a phone: 3 px, slate, on a white object with a 1 px border and a 12 px radius (`practice-phone-notyet.png`). Visible when you look for it. It is not the "unmistakable state change" the direction borrows from Duolingo (`00` §5). The correct state works because the tick, the word and the 35 % green border fire together; the not-yet state has the rule and a hairline glyph, and the rule is the colour of the button beneath it (R2).

As the identity: "recognisable at a glance across a bus aisle without a logo in sight" (`01` §1) is not a claim a 3 px line can support. What a bus aisle could recognise is the warm paper, the serif and the stone. Calling the rule the signature invites the implementation to spend on it and then be surprised that she sees no identity.

**Amendment, three parts.** A marked object has a **2 px border** in the outcome colour — `--ok`, `--warn`, or `--ink` for not-yet — against the 1 px `--line-2` of every unmarked object, so the whole edge changes and the state is visible at arm's length; the left rule is **4 px**, not 3; the verdict word is `--fs-h2` 21 px, not 18. And the rule has **two uses, not four**: judged (inside an object) and here (in the spine). The examiner's quote is a recess with the `Quote` icon and needs no rule; the unit list's rail goes with the tint band (§4). Say plainly what the signature is: paper, Literata, stone.

### R5. Nothing on Today or the topic hero pulls, and the fifth evening is undrawn

The brief asks whether the mockups' Today would make her open the app on a Tuesday. As drawn, no more than a to-do list would.

`today-phone.png` is the first evening: the Letter, three paragraphs of Rowan, the rename field. On the fifth evening the Letter is gone and the screen is a date, "Today", an object saying "9 back · about 7 minutes" with a fixed sentence under it ("Chosen for you: what you got wrong, or right without confidence") and a black button; then rows. The fixed sentence is furniture by the third night. The only thing that is *hers*, the stones, is a 20 px mark at the right of a row below the fold. The only interesting *fact*, "5 % got full marks" on the next step, is a 14 px sub-line. The largest thing on the page is a count of work owed, and however gently it is worded a count of work owed is a chore. On Today the accent at chroma 12 is a black rounded button with white text, which fails the direction's own "ours" test — it is the component-library button — so Today's only colour is none.

What makes someone open Duolingo on a Tuesday is loss aversion, refused here, rightly. What makes someone open DeepStash is a gift chosen for them. The companion spec already defines Cairn's version: Rowan's arrival line carries one fact about her own work ("Two are the ones you were sure about on Tuesday"). The mockup does not use it. The `today-open` slot is filled by the Letter on day one and by nothing on day five.

The paper question belongs here too. Warm paper, a serif and slate do not read as "old" to her cohort; they read as the study aesthetic she already sees in Notion, GoodNotes and the study accounts, and against Seneca's cartoons and Bitesize's yellow bands they read as more grown-up, not older. `01` §15 is afraid of the wrong thing. What reads as old is a page with nothing on it to look at: on none of the three first screens is there a picture, and on Today there is not even a subject colour. The paper is not the risk. The emptiness is.

**Amendment.** (1) Draw the fifth-evening Today and the returning-visit topic hero ("Section 3 is where you stopped"; does the button say *Continue at 3*?) and put them in front of her with the other three, *before* pass 2, using the three questions in `01` §15. (2) The sub-line under the count is Rowan's `today-open` line and changes nightly; "Chosen for you…" appears in the first week only. (3) The stone stack sits at the top right of the Tonight object at 24 px, the object's only ornament, no number; the count stays in the plan row. (4) On the topic hero the figure's top edge is within 720 px at 390 wide: the lede is one sentence (two lines), the secondary action is a text link (§4), and the objectives move below the figure. The 640 rule stays; the picture rule joins it.

---

## 4. Three things to cut

1. **The tint band and accent rail on the unit list and flashcards index** (`01` §4.6 job 1; `02` §2 and §6). A whole region washed in a subject colour with a 3 px rail is the decorative tint bar the direction just deleted from flashcards, scaled up to a region. And the unit list is the screen she praised as it is; the 13 September review says not to touch it beyond dropping the pill. Keep the rows, the glyph gutter and the deletion of the meter; cut the band.

2. **"Examiners flag this one" on the contents page.** It would sit on 56 of 104 rows. The direction's own argument against "Lesson and practice" — a label true of most rows says nothing — applies. Provenance belongs inside the topic, in the "In the exam" recess and on the miss card, where it already is.

3. **"I have done this before" as a 52 px button stacked under the primary in the phone hero** (`topic-phone.png`, y ≈ 405–457). Sixty-two pixels of the first screen for a decision a first-timer does not have to make, and a second button dilutes the first. Make it a text link under the primary ("Done this before?") at `--fs-ui` with a 44 px tap height, and give the pixels to the figure.

### The mockups against their own rules

Cheap to fix, dangerous to copy into `src/`:

- Five accented elements on the first phone screen (the button, three objective dots, the spine's current segment) against "at most one accented element on any screen" (`01` §4.3). Dots become `--ink-3`; the rule is restated as *one accent-filled control per screen*.
- The stone as a list marker on the desktop spine's "Practice" row (`topic.html:248`) against "never as a list bullet" (`01` §2); and three stones on one Today screen (`today.html:195–217`) against "more than once on a screen".
- The Letter has a border *and* an inner hairline (`today.html:147`), a double top edge that reads as a rendering error.
- The spine's segmented track is drawn touching the descenders of the third objective (`topic-phone.png`, y ≈ 650): the hero has no bottom margin below `md`.
- The title appears three times on the first screen: display title, spine bar, section 1 heading. When section 1's heading equals the display title, omit the h2.
- The desktop spine at 200 px orphans "· 3 min" onto a line of its own on rows 2–8 (`topic-desktop-lesson.png`); the showcase had minutes right-aligned in their own column and was right.
- `tokens.css` leaks in dark mode on every subject page. `[data-subject]` is a descendant `div` (`app/learn/[subject]/[unit]/[topic]/page.tsx:90`), so `[data-subject="maths"] { --accent-l: 40% }` overrides the dark theme's `--accent-l: 74%` on the html element, while `[data-theme="dark"] [data-subject="maths"]` restates only hue and chroma. Result: a dark button with `--accent-ink` at 14 %, about 2.4:1. The same leak flattens high contrast's raised chroma. The dark and hc subject rules must restate `--accent-l` and `--accent-ink-l`.

---

## 5. The first five seconds: `topic-phone.png`, as her eye does it

Positions are CSS pixels (the capture is at 2×).

**0.0–0.4 s.** The heaviest ink on the screen: "Histograms with unequal class widths", two lines of 30 px serif at y 50–110. She has "Histograms" before she has anything else, and that is right. The grey capitals above it (the locator, 13 px, L46) do not register; she will not learn "for your paper on 14 May" from this screen.

**0.4–1.5 s.** Straight down into the lede, five lines of 18 px serif at y 130–260. Title and lede are the same face at weights 500 and 400, so they read as one block of serif and the eye has to find where the heading stops. She reads the first sentence, "A bar chart shows how many by how tall", which is the best sentence on the page; she skims the rest and catches the bold "area".

**1.5–2.2 s.** The dark rectangle at y 342–392 pulls the eye before its label does. It is the only solid object on the screen, and she has it as "the thing to press" before she reads "Start the lesson". On the way down, "About 16 minutes", the one bold sans line, lands as a number. "10 sections 12 checks 5 examiner findings" does not: three grey numbers, and "examiner findings" means nothing to her yet.

**2.2–3.2 s.** Under it a second, outlined button: "I have done this before". A flicker of "am I that?", a decision she did not ask for. Then a grey serif line: "New ground. The note teaches before it asks; nothing here is a test." It is the third block of serif and the first in grey, with no mark and no name, so she cannot tell who is speaking; it reads as a caption to the buttons.

**3.2–4.5 s.** Three bullets in grey sans with dark blue dots; she skims "frequency density", "bars touching", "area of a bar". Then a row of ten thin segments drawn tight under the third bullet, and a bar that says the title again: "1 of 10 · Histograms with unequal class wid… · 2 min". Then a hairline, "1 · Read and check · 2 min", and under it, cut by the tab bar, the title a third time as the section heading.

**4.5–5.0 s.** The tab bar: five grey icons and "Learn" in ink at 11 px. Her thumb is already on the dark button.

What she has at five seconds: what the topic is, that it takes sixteen minutes, and where to press. The live app (`audit/topic-histograms-phone-light.png`) gives her none of those; it gives her a four-line specification title and a countdown chip. What she does not have: a picture; a colour she could name as "maths"; anything that says this was made for *her* exam rather than for GCSE in general; and any reason to believe the sixteen minutes will be interesting. And she has read "Histograms with unequal class widths" three times.

---

## 6. The answer the look gives, in her words, and whether it is true

> "It looks like someone actually made this, not like a game and not like a school website. It's calm, like a nice notes app or a Kindle. It says my exam is on 14 May and this bit takes sixteen minutes, so it knows what I'm doing. When I get one wrong it draws what I did instead of just going red, and it tells me which mark I got and which I didn't, like the real paper. I'd trust it. I'm not sure what I'd open it for on a random Tuesday, and it's a bit plain."

Clause by clause:

- *Someone made this.* True, and the thing that most distinguishes it. The look supports it: Literata, a figure drawn for the sentence, no stock.
- *Not a game.* True by law (`emotional-design.md` rules 1 and 2), and the look keeps the law.
- *It knows my exam.* True (`exam-plan.ts`; the locator; "for your paper on 14 May"). But the look says it in 13 px grey capitals, so the claim is true and nearly invisible.
- *Sixteen minutes.* True only when `timeMs` is real. The review found timing recorded at one call site; the companion spec forbids printing minutes when `timeMs` is null. If the hero prints an authored estimate it must say "about" and be under-promised, which the direction says and the plan must test.
- *It draws what I did wrong and tells me which mark.* True for the 85 % of parts with authored errors, and only once the wrong-answer figure is built (pass 3). Until then a miss is prose. The mockup promises this; the product does not yet.
- *I'd trust it.* The look earns this and the product must keep it. "It comes back on Thursday" is false for practice misses until `ensureCard` covers every item kind (quality bar, item 1). The mockup prints the sentence. Printing it before it is true is the one way the look could lie, and `03` §2e is right to gate it.
- *Not sure what I'd open it for.* True. That is R5.
- *A bit plain.* True, and the honest cost of calm. The amendments in R5 are the cheapest way to pay it down without breaking the law.

What the look cannot say and should not try to: that 74 of her 219 topics have content and Further Maths is a quarter built. Today and Learn carry the honest denominators; the direction keeps them, and must.

---

## 7. What the plan should verify with Playwright, beyond the hero rule

1. **Figure text.** For every `svg[viewBox]` in the viewport at 390 px, `fontSize × clientWidth / viewBoxWidth ≥ 13`. Today this is 7.3 px on every generated figure.
2. **KaTeX.** Smallest computed font-size of any text inside `.katex` ≥ 13 px; count of `.katex-display` elements with `scrollWidth > clientWidth` reported per bundle, and zero on the three sample topics.
3. **Type floor, everywhere.** No text node in the viewport under 13 px on Today, a unit list, a topic, practice, papers and flashcards, tab bar included.
4. **Contrast per text node against its painted background**, light and dark, and specifically **a subject page in dark mode and high contrast**, which is where `tokens.css` leaks `--accent-l` (§4).
5. **One accent-filled control per screen.** Count buttons and links whose computed background equals the computed `--accent`, in the viewport: ≤ 1.
6. **The marked object.** After a miss: a left border ≥ 4 px whose colour ≠ the computed `--accent`; the text "0 of" present; a struck code (`line-through`) present. After a correct answer: the tick and "of" both present.
7. **Sticky elements.** At most one `position: sticky` or `fixed` element besides the tab bar; combined height ≤ 103 px.
8. **No horizontal page scroll** on any stage of a topic, including worked examples with mark-code chips and tables.
9. **The display title is never a fragment.** It equals `hero.short` or `topic.title`, and never ends in "," or "and". No bundle has `hero.short` today, so the fallback chain would produce "Simplifying, multiplying" for M3; this test should fail until the content session adds the field. And the display title ≠ the first section heading.
10. **A stopping point exists at every section boundary.** "Pause here" is carried forward in `01` §1 and appears in neither `02` nor `03` nor any mockup; it is the fix for 19,418 px with no stopping point.
11. **The desktop spine wraps no minutes onto their own line.**
12. **Rowan's line on Today is data-driven**: two fixtures with different facts render different lines under the count.
13. **The returning-visit hero**: with flow state at section 3, the primary control reads *Continue* and lands within 640 px.
14. **Reduced motion** → `getAnimations().length === 0` (already planned), plus no `transition` on `background-color` anywhere.

---

## 8. The order, amended

`03` is right that the hero re-order is first and that tokens go second. Three changes to its order: fix the `tokens.css` subject leak before pass 1 ships, since it puts a 2.4:1 button on every dark subject page; draw the two undrawn states and run the `01` §15 test with her *before* pass 2, because her reaction on the fifth-evening Today decides whether R5 is a risk or a fact; and hold the figure floor (R3) inside pass 2, not pass 3, because a lesson whose axis numerals are 7 px is not a document, whatever surface it sits on.

The direction is the right direction. Its risk is not that it is wrong but that it is quiet in the places she needs it to be present, and that four of its own numbers — 42/46, 40/40, 7.3 px, 11 px — quietly undo what its rules promise.
