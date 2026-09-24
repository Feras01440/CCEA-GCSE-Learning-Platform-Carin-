# Art direction v2: colour that carries meaning, an illustration per idea, and a character with a face

23 September 2026. Written by the design-v2 agent after the owner's verdict on the first mockups (practice: yes; flashcards: ok; the character: "very bad and could be scary"; Slides: the format yes, the look no; "it needs to be fun to learn"; every mockup on desktop and phone). This document revises `docs/design/art-direction/01-art-direction.md` for colour, illustration, the character and motion. The type scale, the three surfaces, the margin rule, the empty and loading states and the layout rules of `01` and `02` stand unless a line below says otherwise; where the two disagree on colour, illustration, character or motion, this file wins. The artboards that show it are on the design-v2 canvas (`scratchpad/mockups-v2/project/`, published by the lead); the research behind it, with every source, is in `scratchpad/platform/design-v2/research-notes.md`.

The standing test is hers: why do I need this, how is it different, how can it help me, why is it worth my time. The standing bar is the best learning apps in the world, judged honestly (STANDARDS.md, item 6).

---

## 1. What the owner saw, and why it happened

Pass 1 was right about almost everything it measured and wrong about one thing it did not: it treated restraint as an identity. Chroma came down from 60 to 12–30 so that the accent would "read as stone"; the only pictures on the first screens were the computed figures; the companion was a written voice with a three-stone mark; and the first Slides mockups used that palette on cards with no illustration but a monochrome fraction. The critique had already named the cost: "the risk is emptiness, not age" (`04-critique.md` R5). The owner named it again in one word: it is not fun to learn.

The first Rowan drawing made the same mistake in the other direction. A small skin-toned face set high inside a dark sage ring on a tall cone, dot eyes with no whites, a hairline mouth: the ring reads as a hood and the cone as a robe, so the figure reads as a hooded thing or a gnome, and it has no silhouette a person could name. That is what the owner called "basic slop", and it is what happens when a character is drawn without a shape budget, a light source, a model sheet or a personality in the drawing. The research (`research-notes.md` §1) shows that every character the owner pointed at was made the opposite way: Duolingo builds every drawing from three primitives with a shape budget of about fourteen shapes, no outlines, one shadow tone per colour and big eyes with whites (its own shape-language post, read and seen); Headspace draws no sharp edge, keeps faces to two dots and a curve, and shows emotion as metaphor (Raw.Studio, It's Nice That, read); Khan Kids chose a bear because it is "easy to render with a strong silhouette and large readable features" (third-party analysis, read); Kinnu's avatars are folded paper and never demand anything (Kinnu 2.0 post, read and seen).

So the direction changes in four places and keeps the rest:

1. **Colour gets its chroma back, and a job.** Subject colours a person can name (Mourne blue, heather, sea-glass), illustration tints in three steps, one warm accent for drawings, and a rule that every colour on a study screen means something: this subject, this is right, this is the thing to press, this is what changed.
2. **An illustration per idea, in one grammar.** Every Slides card and every Read section carries a drawing built the way the best apps build theirs: three primitives, no outlines, one light, one shadow tone, labels on the figure. And every figure is an object to act on, Brilliant's rule.
3. **Rowan has a face,** drawn with real craft and a strong silhouette, with five states tied to exam events, at the seams of a session and never on an answer. Three directions are on the canvas; the recommendation is §7.
4. **Motion is a vocabulary of five named moves,** each a token, each reduced-motion safe.

The four words of `01` ("calm, exact, warm, ours") gain a fifth: **alive**. A screen is alive when something on it was drawn for this idea, when colour tells her what just happened, and when the next thing to do is one tap away. Calm without alive is the emptiness she saw.

---

## 2. Colour v2

### 2.1 The principle

Four products taught the same lesson from four directions. Linear generates every theme from three LCH variables and limits the blue chroma of its neutrals so the interface reads as neutral and timeless (Linear's redesign post, read). Duolingo uses one brand hue, a neutral scale, and six secondary hues that appear only in illustration and full-bleed backgrounds; every fill has exactly one darker shading tone, so the characters and the screens are one world (shape-language post and the sample scenes, read and seen; palette via a third-party breakdown, read). Headspace leads with one warm orange and an expanded supporting palette "to represent the range of human emotions", against an industry of "dreary blues and greys" (It's Nice That, read). Slack cut eleven colours to four plus aubergine so that the colours would work on any background and on screen (Pentagram, read). Kinnu paints one saturated hue per pathway on a charcoal ground, so a learner can name a course by its colour (seen).

The rule that follows for Cairn: **few colours, real chroma, each with a job, one shadow tone each, and the paper underneath.** The warm paper and Literata stay; the stone greys stay for the neutrals; what changes is that the three subject hues become nameable, the outcome colours are allowed to carry the whole meaning of a marked answer, and illustration gets a palette of its own that is derived from the subject hue rather than picked per drawing.

### 2.2 The palette

LCH is the specification (CSS `lch()`, D50); the hex is the sRGB rendering used in the mockups, computed by `scratchpad/platform/design-v2/lch.mjs`; the contrast is WCAG against the surface named.

| Token | LCH | Hex | For | Contrast |
|---|---|---|---|---|
| `--ground` | 97.5 / 2.4 / 85 | #FAF8F3 | warm paper (kept) | — |
| `--surface` | 100 / 0 / 0 | #FFFFFF | objects (kept) | — |
| `--surface-2` | 95 / 2.2 / 85 | #F2F0EC | recesses (kept) | — |
| `--ink`, `--ink-2`, `--ink-3` | 18 / 36 / 46, chroma 3–4, hue 85 | #2E2C28, #57544E, #706D66 | kept exactly; R1 of the critique stands | 13.1, 7.1, 4.9 on ground |
| `--accent` (no subject) | 32 / 14 / 255 | #3C4D61 | the one thing to press on Today, Papers, Map, Settings | 8.7 with white |
| `--accent` maths | **44 / 34 / 255** | #2F6FA6 | Mourne blue: the Start button, the current card's pill, the figure's accent element | 5.4 with white |
| `--accent` further-maths | **46 / 46 / 330** | #9E5195 | heather | 5.2 with white |
| `--accent` science | **44 / 32 / 195** | #1E7A78 | sea-glass, the Causeway coast | 5.2 with white |
| `--tint-mid` per subject | 80 / 20–22 / subject hue | #ABCAEE, #E3BADC, #93D2D0 | the middle step of an illustration: a bar, a shape, a bracket at rest | — |
| `--tint-wash` per subject | 94 / 8–10 / subject hue | #E2EFFF, #FBE8F8, #D8F4F2 | the card's top wash, the figure's stage, the segmented track's unfilled segments | ink 12:1 on it |
| `--ok` | 45 / 42 / 148 | #277943 | correct: the lit option, the tick, the verdict word, the placed pill | 5.1 on ground |
| `--ok-wash` | 94 / 12 / 148 | #DDF4E1 | the lit option's fill | ink 12:1 |
| `--warn` | 46 / 48 / 66 | #975F20 | part way: burnt ochre (kept) | 5.0 on ground |
| `--miss` | 40 / 3 / 85 | #605E59 | not yet: the warm neutral of the ink (kept from the critique's R2) | 6.1 on ground |
| `--danger` | 45 / 58 / 28 | #BA3D41 | destructive controls only (kept) | — |
| `--gorse` | **80 / 72 / 90** | #E1C42F | the one warm accent for illustration: the hare's scarf, the sun, a highlighted number. Never a control, never text | ink 8.1:1 on it |
| stone greys | 78 / 66 / 52, chroma 5–6, hue 82–85 | #C4BFB7, #A39E94, #7F796F | drawn stones and construction lines | — |
| lichen, heather | 74 / 30 / 125; 58 / 44 / 330 | #A2BF88; #BD71B3 | the cairn's lichen, a heather sprig | — |
| sky, hill, evening | 94 / 8 / 235; 70 / 30 / 135; 88 / 12 / 60 | #DFF1FA; #8EB683; #EED8C9 | the close card's scene; evening is a warmer sky, never a dimmer screen | — |

Departure from `01` §4.3: the subject hues move from chroma 22–26 to 32–46 and the maths hue from 266 to 255 (a slate that is blue, not a grey that hints at it). The lightness stays at 44–46 so every accent clears 5:1 with white text and the "chroma only" rule for `[data-subject]` in `tokens.css` still holds (the dark-mode leak fix stands). Science moves from hue 160 (pine) to 195 (sea-glass): at real chroma a green subject hue and `--ok` fern (148) were fourteen lightness units and twelve degrees apart, and on a biology gate card "this subject" and "this is right" would have been one colour twice, the exact fault `01` §1 named in the showcase. Sea-glass is also the companion's own geography for Double Award Science (the Causeway coast, companion spec §2).

### 2.3 Where colour goes, and where it never goes

- **The top of a card, as a wash.** A Slides card and the topic hero carry a subject wash at the top: a flat `--tint-wash` panel that is the card header's own background (the track, the card's label and its title sit on it; on the desktop it is the panel's top band), ending in a straight edge where the paper begins. Flat, not a gradient: the five refusals of `01` §1 stand. Duolingo explored a "punchy" direction of solid saturated headers and a "soft" one of pastel washes with ink type (core-tabs post, read and seen); the soft one is the one that stays calm, and a flat wash is calmer still. The wash is not a control and does not count against the one-accent rule; it says which subject she is in from across a room.
- **The figure's stage.** A drawing sits on a rounded `--tint-wash` panel (radius 12), never on a white card and never floating on the paper: the stage is what makes an illustration read as made for this card rather than pasted on.
- **The option that is right.** On a marked gate the correct option takes `--ok`: a 2 px edge, the `--ok-wash` fill, a drawn tick. Her wrong choice takes the `--miss` edge and the circle-dash glyph, never red. So colour says *which is right*, and never *you are wrong*. The verdict word ("Yes." in fern, "Not quite." in ink) is the second signal, the mark line the third.
- **Progress as pills.** The segmented track's done segments fill in the subject accent, the current one is outlined, the rest are `--tint-wash`; on a flashcard run the placed cards are pills in the deck's colour. A journey she can see, in her subject's colour.
- **The character.** Rowan's palette (§7) is fixed and is not a subject colour; the gorse scarf is the only warm accent on a screen that has one.
- **Never:** behind prose; behind a question stem; on two controls at once; as a full-bleed header; as a red for a miss; as a hue chosen per drawing. The one-accent-filled-control rule of `01` §4.3 stands.

### 2.4 Dark

A different paper, as before (`01` §4.8): ground 13 %, surface 17 %, recess 21 %, inks 93 / 74 / 62. The subject accents rise to L 74–76 with chroma 30–40 (#7FBCFA, #EDA4E1, #5BC7C5) and the washes become 24 % lightness tints (#2F3A48, #433541). The character keeps its own colours in dark mode (the hare is the same hare at night) with its stage on the dark wash; nothing about it dims. High contrast keeps every drawing at 0.6 opacity or more (integration contract, "The figure slots").

---

## 3. The illustration system

### 3.1 The grammar

The system is what lets one agent draw a character sheet, another a Slides figure, and a third a Today scene, and have them read as one hand.

1. **Three primitives.** The rounded rectangle, the circle and the rounded triangle (Duolingo's shape-language post, read). Any drawn object is a composition of these; a curve that is none of them is a fault.
2. **A shape budget.** An object is eight to sixteen shapes; a character twelve to eighteen. Duolingo's cat test (seen) is the calibration: six shapes is too abstract, thirty is too many, fourteen is right.
3. **No outlines.** Edges are made by colour against colour. Where two fills are the same colour, a one-tone shadow separates them.
4. **One light, top-left.** Every fill has exactly one shadow tone: the same hue and chroma, lightness minus 10 to 12 (in LCH), on the lower-right of the form. One highlight per object at most: lightness plus 8, a small ellipse near the top-left. No gradients, no glow, no blur (the five refusals of `01` §1 stand).
5. **The corner language is the UI's.** Radii 12 / 8 / 5 on drawn objects as on cards, fields and chips; a stone's radius is half its height (a pill); a bracket is a stroke with round caps.
6. **Labels on the figure, in the interface face.** Inter 500 in ink with a 3.5-unit paper halo (`paint-order: stroke`), never a key; sized in viewBox units to render at 13 px or more on a 358 px column (`01` §7 and the depth standard's 3.5 % rule).
7. **One accent element per figure.** The thing the sentence is about takes the subject accent; everything else is ink, stone grey or tint. If two things must differ, the second is dashed or labelled.
8. **A caption says what to notice,** at most 25 words, and stands alone as a card (depth standard §3).

**The craft floor (added 23 Sep, evening, after the owner's ruling on the cairn).** The cairn on the first canvas was three symmetric grey pills stacked on a green slope: no light, a rounded lozenge for a shadow, a green sticker for lichen. The owner said it "looks like something not good", and it was a placeholder by every rule above; a designer at Duolingo or Headspace would have sent it back. So the rules are a floor, and every drawing on every board passes it or is removed: a real shape budget (the cairn is four stones, each its own hand-drawn path, no two alike); one light from the top-left giving every form a lit face and a shadow face, and a contact shadow wherever one thing rests on another; a cast shadow on the ground to the lower right; asymmetry and weight (the base slab is thickest on the right, each stone sits off-centre, the stack tapers); one accent at most (a lichen patch, not a sticker); a ground that belongs to the same world (grass at the base, or the hill the cairn stands on); and a black-filled silhouette that still reads at 24, 48 and 160 px. The redrawn cairn is the worked example on the craft-floor board (before and after, every size, the silhouettes) and is the one cairn used everywhere: the keeper's body, the hare's placed stone, both close scenes, the 24 px mark, the wordmark. The same floor rebuilt the hill scene (a far ridge in a cooler green, a lit band and a darker foot on every slope, gorse as bushes with a lit side rather than yellow puddles, a haze band at the horizon, the cast shadow on the slope) and the stonechat's perch. A figure card's pills, a verdict's tiles and the flashcard's matrix are diagrams, not pictures, and pass on the grammar's own terms: consistent radii, one accent element, labels on the figure.

### 3.2 The illustration palette, derived

For a subject page the drawing palette is: the subject accent (deep), `--tint-mid`, `--tint-wash`, ink, the three stone greys, and gorse. That is eight colours, of which one is warm. It is derived from the page's `data-subject`, so a figure re-tokened for maths is blue and the same figure on a science page is sea-glass without being redrawn: the 2,038 existing figures migrate by tokens, not by re-authoring (`--fig-fill`, `--fig-fill-accent`, `--fig-stroke` in `tokens.css` already carry the mechanism; the addition is `--fig-stage`, `--fig-mid` and `--fig-warm`).

### 3.3 Figures are objects to act on

Brilliant's rule is that every screen has a diagram and most screens ask her to do something to it, and a wrong answer re-runs the diagram (research 07 §2.1; ustwo's case study, read). In Slides every figure card carries a verb, and there are three interaction primitives:

- **Tap to cancel.** Factors are drawn as pills; she taps every factor that appears on both lines; a tapped pair strikes through in the subject accent (`react`, 250 ms, the strike drawn along its length); when the shared factors are all struck the simplified fraction rises in. The numbers are pills too, so "a 2 over a 4" is a thing to tap, which is the Summer 2024 finding made physical.
- **Predict, then reveal.** She chooses what will happen (which option cancels; where a bar will land); the figure then draws the truth beside her prediction: hers in dashed ink, the truth in the accent. The gate's record is her prediction.
- **Drag a value, with a tap alternative.** A slider on the figure changes a coefficient or a value of x and the figure recomputes; every drag has a tap or arrow-key alternative (WCAG 2.5.7). Used for "substitute x = 1" checks and for graphs.

The wrong-answer figure of `01` §7 lands here first: on a miss, the figure shows her answer against the right one before any prose. On the algebraic-fractions gate the consequence is the substitution: at x = 1 the fraction is 5 and the cancelled version is 4, drawn as two number tiles that do not match.

### 3.4 What an illustration per idea means in Read

The same drawings serve the note. The topic hero's figure moves onto a wash stage under the display title and the two buttons (`02` §3.1 order otherwise unchanged); each section's figure sits on its stage on the page, with its verb ("Tap the factor") where the section's gate is about the figure. Prose stays on the paper; the stage is the only tinted thing in a section.

---

## 4. Typography: kept, with three additions

Literata for the lesson voice and Rowan, Inter for everything operated, KaTeX for maths, the scale and the floor of `01` §3: all kept. The argument for not adding a rounded display face in Duolingo's or Headspace's manner (Feather Bold derives its letterforms from the owl's wing, Monotype, read; Headspace's typeface takes its curves from the smiley, It's Nice That, read): those faces exist because the character is the brand and the type follows it. Cairn's brand is the paper and the serif; the warmth now comes from the drawing beside the words, and a bubbly display face would push the whole product toward the "Year 8" register the quality bar rejects in Seneca (emoji, GIFs and memes; Seneca's site, read). Headspace itself corrected a juvenile read for adults by keeping the roundness in the drawing and sobering everything else (Karen Hong, Blush, read).

Additions: a Slides card title at 24 px (28 on desktop) Literata 500; option text on a gate at 18 px Literata; the verdict word at 21 px as the critique's R4 requires, in `--ok` when it is "Yes." and in ink otherwise.

---

## 5. Motion: five names, five tokens (decision 12)

| Name | Where | Duration | Easing | Properties |
|---|---|---|---|---|
| `arrival` | a card entering; the Letter; Rowan's single move | 240 ms | ease-out | opacity 0→1, translateY 8→0 (Rowan: 4→0) |
| `reveal` | the verdict and explanation after Check; the next stretch in Read | 200 ms | ease-out | opacity, translateY 6→0 |
| `place` | a stone placed; a card's pill filling | 300 ms | ease-out | translateY −6→0, scale 0.96→1, opacity |
| `react` | the figure's consequence: a strike drawn, a bar redrawn, the substitution tiles | 250 ms | cubic-bezier(0.2, 0.8, 0.2, 1) | pathLength, transform |
| `dismiss` | a line put away; a sheet closing | 160 ms | ease-in | opacity 1→0, translateY 0→−4 |

Card advance in Slides: translateX 24→0 with opacity over 200 ms, backwards mirrored. A press is 120 ms scale 0.98 as before. Nothing animates on scroll or hover; nothing moves inside the study surface except the figure reacting to her answer; the character moves once on arrival and never idles (no blink, no breath, integration contract). Under `prefers-reduced-motion` every component renders its final pose and `document.getAnimations().length === 0`. Haptics as emotional-design rule 5.

---

## 6. Reconciling with the critique's five risks and the emotional rules

- **R1 (three inks).** Kept at 18 / 36 / 46; nothing here changes a text grey. The two-grey rule per surface stands; a wash is not a text colour.
- **R2 (miss not blue, not red).** Kept: `--miss` is the warm neutral. What v2 adds is that the *right* option is lit in fern on the same card, so the meaning is carried by colour without colouring her.
- **R3 (the type floor in figures and maths).** Kept and tightened: figures are authored in 360–420-unit viewBoxes with 14-unit labels, so a phone renders 13 px or more; inline stacked fractions stay a content lint.
- **R4 (the marked object's edge).** Kept: 2 px outcome edge, 4 px rule, 21 px verdict word, the mark line. v2 adds the lit option and the reacting figure, which is what makes the state "unmistakable at arm's length" rather than merely present.
- **R5 (nothing pulls).** Answered by three things that are hers: the wash that says which subject, the drawing made for this idea, and Rowan's arrival line with a face beside it carrying one fact about her own work.
- **Emotional rules.** No shame: the miss lights the right answer and draws the consequence; the word "Wrong" never appears; her option is edged in ink, never red. No loss: nothing empties, greys out or is taken away; a placed pill stays placed. No variable reward: Rowan's states are fixed to events (a stone placed, a Letter, an evening), never to a random draw or a run of answers. No XP, streaks, leagues, confetti. Calm: one wash per card, one accent control, chroma budgeted, motion 120–300 ms. Trust: nothing on a study surface is decorative; the illustration is the content, and the character is never on a screen that holds an answer field.

---

## 7. Rowan v2

Three directions are drawn on the canvas as full character sheets (concept, proportions, palette, five states, two expressions, the 24 px mark, 48 / 96 / 160 px). The drawing rules they share:

- **Built from the three primitives with a budget of twelve to eighteen shapes;** no outlines; flat fills with one shadow tone from the top-left light; one highlight.
- **Eyes with whites, a dark pupil and a catchlight.** The whites are the warmth (Duolingo's "really big endearing eyes", building-character post, read); personality lives in the lids and the brows on the same eye system (Lily's half-lowered lids, Rive, seen). Dot eyes without whites are what made the first Rowan read as a hooded figure.
- **A silhouette that reads at 24 px** black-filled (the silhouette test; Big Red Illustration, read). Two ears, three stones, or a bird on a stone: each direction has one.
- **One warm accent** (gorse) and otherwise the hills' palette; never a subject colour, because Rowan is not a subject.
- **Restraint in expression.** Eyes too wide read as "why is she so happy?" (Rive on Lily, read). The default expression is attentive and dry, which is the voice the companion spec wrote.
- **Five states, all exam events** (decision 8): arrival, listening, a stone placed, evening, the Letter. No sad state, no angry state, no absent state, no desperate-at-midnight state (the Duolingo widget's "unhinged Duos", read, are the mechanism this product refuses).
- **One arrival movement,** 240 ms, then stillness. Never during a question; never inside a container with an answer field; RowanMark stays the fallback.
- **Presence at Duolingo's scale (the owner's ruling, 23 Sep, evening).** The 28 / 40 / 24 px slots of the integration contract read as an icon in a corner and are superseded: on Today the figure is a posed hare composed into the Tonight tile, about 140 px on the phone and 200 px on the desktop, in the state the day calls for, with the arrival line beside it; the Letter carries it at 100–110 px beside the note; the close card and the Slides close at 160 px or more, standing on the hill by the cairn; the topic hero at 72–96 px beside the topic-open line; the 24 px mark only where a line has no room (the rail, a contents row). The companion agent updates `FIGURE_SLOTS` and the contract's table to these sizes; the containment rule and the "never a reaction to an answer" rule are unchanged.
- **Real poses per state, drawn to the craft floor:** arrival waves with the near arm and looks up; listening tilts the head, ears forward, paws together; a stone placed holds the heather stone up in both paws; evening sits low with the ears back and the lids half down under the moon; the Letter is held in both paws.

**Direction A, the hare.** An Irish hare of the hills in the rounded vector language: a pill body, a round head with a cream muzzle, two long ears (the silhouette), big eyes with whites, long hind feet, a gorse-yellow scarf. Lean rather than chubby, so it reads as quick and dry, not as a plush. It can hold things: the Letter in its paws, a paw on the placed stone.

**Direction B, the cairn-keeper.** The three-stone mark itself with a face on the top stone, lichen on the stones, a heather sprig in a gap; states by arrangement (the fourth stone placed; the moon on the top stone; an envelope at the base). Continuity with the mark she already has; the risk is that a rock with a face is the mascot cliche and that grey reads gloomy, which the lichen and heather are there to answer.

**Direction C, the paper stonechat.** The bird the companion spec kept on file (§8), folded from paper in Kinnu's manner: large planes in three paper tones, one crease that catches the light, a rust breast fold, a dark head fold with the white neck patch, one dot eye with a lid, perched on a stone. States by pose: head up on arrival with a wing lifted, tilted when listening, wings open on a taller cairn when a stone is placed, head tucked with the lid half down in the evening, a folded note under one foot for the Letter. The most "designed" of the three and the least likely to embarrass.

**Against the benchmarks** (the table is drawn on the comparison board):

| | Duo and the cast | Kodi | Headspace's characters | Kinnu's avatar | A hare | B keeper | C paper bird |
|---|---|---|---|---|---|---|---|
| Silhouette at 24 px | strong (owl; ten distinct outlines) | strong (bear) | weak by design (blobs) | strong (folded animal) | strong (two ears) | medium (three stones; also the mark) | strong (bird on a stone) |
| Eyes | big whites, pupils, lids | big, closed-happy | two dots | one dot | big whites, lids, brows | whites on the top stone | one dot with a lid facet |
| Shape budget | ~14 | ~14 | 6–10 | facets | 16 | 12 | 18 facets |
| Palette | one hue per character plus skin | teal plus pink | muted flat, one shade | one paper colour | fur, cream, rose, gorse | stone greys, lichen, heather | three paper tones, rust |
| States | a state machine, dozens | introduce, demonstrate, succeed, retry | per emotional register | none (unlocks) | five, exam events | five, by arrangement | five, by pose |
| Age register | all ages | under eight | adult calm | adult | sixteen if lean and dry | any; risks gloomy | adult |
| What it asks of her | streak, hearts, notifications | nothing | nothing | nothing | nothing | nothing | nothing |
| Risk for her | the lever | preschool | wellness-app blob | cannot react | "cute animal" if drawn round | "rock with a face" | cold |

**Recommendation: A, the hare,** and the owner's choice on the full canvas (23 Sep, evening, after weighing C). Four reasons. It has the strongest silhouette of the three at the sizes the contract allows (two ears read at 24 px where three grey stones read as a mark, not a someone). Eyes with whites and lids give it the dry, attentive register the companion's voice already has, and let the five states be told by the face rather than by props. It can hold the Letter and place a stone, which is what two of the five states are. And it belongs to the hills without being a pet: a hare is wild, quick and a little aloof, which is the opposite of Finch's needy bird (Slate, read) and of the preschool animal-cast pattern (Khan Kids, Lingokids), and it is drawn in the same grammar as every figure on the screen, so screen and character are one world, which is the thing Duolingo's lesson screen does that ours did not. Its one risk is reading as a cute animal; the sheet answers it with the lean body, the lowered lids by default, the ban on bounce and idle motion, and its absence from every question. The developed sheet carries the five states, two expressions, 160 / 96 / 48 px and the 24 px mark, the silhouette test and the three slots in place; the hare is carried into Today (28 px beside the arrival line, 40 px on the Letter's signature) and both close cards, where it stands on the hill beside the topic's cairn.

*The alternatives.* C, the paper stonechat, is complete on the canvas and is the one to return to if the sit-down finds the hare too cute: the most designed of the three, folded rather than drawn, a bird that lives on stones and could perch on the cairn. B stays for the comparison only.

---

## 8. Slides v2

### 8.1 The card grammar, and what each colour means

| Card | Top | Body | The one control | What colour says |
|---|---|---|---|---|
| Title | subject wash; the locator and the display title | the lede (two sentences), the promise line, the topic's illustration on its stage | Start (accent) and a "Read it as a page" link | which subject; that this is a beginning |
| Idea | the segmented track; "n · role" | ≤ 70 words at 20 px, the illustration on its stage, a caption | Continue | the stage is the idea's; the accent element is what the sentence is about |
| Figure to act on | as idea | the verb ("Tap every factor on both lines"), the figure as pills | Check, then Continue | tapped pairs strike in the accent; the result rises in ink |
| Gate | as idea | the question at 20 px Literata 600 on a white object; three 52 px options | Check | nothing yet; selection is ink |
| Gate, right | as gate | the option lit in fern with a tick; "Yes." at 21 px in fern; the explanation; the reaction figure | Continue | fern means proved |
| Gate, a miss | as gate | her option edged in ink with the circle-dash; the right option lit in fern; the consequence drawn first; "Not quite." at 21 px in ink; the explanation; "This card comes back before the recap" | Continue | fern shows which was right; ink says not yet; nothing is red |
| Examiner, why | as idea | a titled recess with the sentence; the series cited in Literata italic | Continue | the recess is paper-on-paper; no colour |
| Recap and pointer | heather wash | "You can now": three lines with a small drawn glyph each; "In the exam" as a recess with the tariff and the command word | Continue | the wash marks the end of teaching |
| Close | the evening scene | Rowan on the hill by the cairn, one line, what returns when, the stone if one is placed | Done for tonight (accent), Practise this topic (outline) | the sky is warmer, not darker; the stone in the cairn's colour |

Progress is a segmented 3 px track plus "n of N" in tabular figures, on every card but the title and the close. The last cards before the recap are any gates she missed, asked again (Duolingo's mistakes-at-the-end, benchmarks page 4).

### 8.2 Slides is the primary way in, on both sizes, and every card is a full screen

The owner's ruling (23 Sep, evening): the current topic page is "boring and scrolling down without a full screen to read and engage"; every idea and every question is displayed on its own full screen, on the desktop as on the phone, as Duolingo does. So **Slides is the primary way into a topic on both sizes** and Read stays as the second way (it keeps the depth, the spine and the desk); the hero's accent button is "Start the slides" on both sizes and "Read it as a page" is the outline. Decision 9's "Slides is the default on a first visit on a phone" widens to every first visit.

Phone (390 × 844): one card fills the screen; the header (the track, "n of N", the card's label and title) carries the wash and the body sits on the paper; the control sits at the foot with 24 px clearance; swipe, tap and arrow keys advance; a swipe back re-reads.

Desktop (1280 × 800): **the whole screen is the card, not a card inside a page.** A wash header band holds Exit (left), the segmented track and "n of N" (centred, 720 px), then the card's label and title on a 1000 px measure; the body is that 1000 px measure in two columns (prose in the wider column, the figure or the verdict at 400 px) so one idea per screen holds with no scroll; previous and next controls stand at the screen's edges; a full-width bottom bar carries the keyboard hints (←, →, Enter, 1–3) at the left and the one control at the right, as Duolingo's desktop lesson does. The title card and the close card are full-bleed two-column screens (text left, the figure on the wash or the hill scene right). There is no navigation rail inside Slides on either width (decision 9: no chrome but the track and one button).

### 8.4 The stem, its maths and the answer: the rhythm

The owner saw questions where a stem and its equation sat too close, and that spacing is part of "fun to learn". The rule, as tokens, shown measured on the annotated gate card on the canvas:

| Token | Phone | Desktop | What it separates |
|---|---|---|---|
| stem | 20 px Literata 600, line-height 1.4 | 22 px | the sentence that asks |
| `--gap-stem-maths` | **16 px** | 20 px | the stem from its display maths |
| display maths in a stem | **28 px** Literata, its own line, left-aligned with the stem, 4 px padding above and below | 32 px | never inline when it is the thing being asked about |
| `--gap-maths-field` | **20 px** | 24 px | the maths from the first option or the field |
| option | 52 px tall, 10 px apart | same | the answers |
| the field | 52 px tall, its label 6 px above, its helper line 8 px below | same | a typed answer |
| Check | at the foot, 12 px above the safe area | in the bottom bar | the one control |

Inline maths inside a sentence keeps the sentence's line-height at 1.6 so a stacked fraction never touches the lines above and below, and `\tfrac` is the most an inline fraction may be (the content lint of `01` §3.4); anything that is the subject of the question goes on its own line at the display size. In a worked example a step line has 12 px above its "Because" and 20 px below the pair; in a find-the-mistake item the lines of working are 14 px apart so a tap lands on one line. These are the same gaps at the same names in Read and in Slides.

### 8.3 The five questions, answered by the pixels

Clarity: one idea, one drawing, one control per card. Focus: nothing on the card but the card. Momentum: the track fills a segment on Continue; a placed pill stays placed; a reaction arrives inside 250 ms. Calm: one wash, one accent, ink everywhere else, 120–300 ms. Trust: the drawing is of this idea; the miss shows the right answer and why; the tariff is CCEA's; the character is never on a question.

---

## 9. Read, Today and flashcards: what the direction adds

- **Read.** The second way in, for the desk and for depth, redrawn to the owner's ruling that "the bar on the left of the content is still distracting": on the desktop the lesson is **one centred 720 px column with generous margins and no persistent rail beside the text**; the app's own left navigation collapses to a 64 px icon rail on a topic page so the reading column owns the width; progress is a slim segmented track at the top of the column with "n of N · min · section" and a **Contents** control that opens a popover (closed by default, never a standing column, `aria-expanded`); moving on is the gate itself and a Continue at the end of each section, as in Slides; "Pause here" stays at the section's end; nothing is sticky beside the text at any width, which also settles decision 1's spine question: the spine becomes the popover and the track. The hero keeps its order (locator, display title, lede, promise line, the two ways in with Slides on the accent, the topic-open line with the hare at 72–96 px, the figure on its stage with its caption); a section's figure is an object with its verb; the gate object and the marked states are exactly Slides', with the stem-maths-answer rhythm of §8.4. Prose stays on the paper at the `01` measure. The phone Read hero is the same column at 390 with the track at the top.
- **Today.** The Tonight object keeps its facts (`02` §1, the fifth evening) and is composed around the hare at scale: the count and the arrival line on the left, the posed figure standing on the tile's floor at the right (140 px on the phone, 200 px on the desktop), Start below; the Letter carries the hare at 100–110 px beside the note with the name in the signature row; the plan rows and the recess are untouched. The only colour on Today is the character's.
- **Flashcards.** The deck's colour as a wash at the top of the run; progress as placed pills ("7 of 12 placed"); a large reveal; three unaccented 52 px buttons each with its return; nothing else changes from decision 10.

---

## 10. Every departure from `01-art-direction.md`

| `01` said | v2 says | Why |
|---|---|---|
| Chroma 12–26 everywhere; subject accents at chroma 22–26 | subject accents at chroma 32–46, hue 255 / 330 / 195; illustration tints at 20–22 and 8–10 | the owner's verdict; a subject colour a person can name is wayfinding and warmth at once; contrast unchanged |
| Science hue 160 (pine) | hue 195 (sea-glass) | at real chroma pine and `--ok` fern were one colour twice on a science gate |
| "No decorative imagery"; "the only pictures are our own computed figures" | an illustration per idea, in one grammar, as the content of the card; still no stock, no photography, no decoration | research 06's ban is on decoration (Mayer); a drawing of the idea is the idea |
| The subject tint's two jobs (spine track, active row) | plus the card's top wash and the figure's stage; still never behind prose or a question | the wash is where "colourful yet calm" lives (Duolingo's soft direction, seen) |
| `--ok` never appears in a subject's chrome | kept; and the lit correct option is the one place fern appears on a card | colour carries which is right |
| The five places of the stone motif | kept; the close card's cairn is drawn in the illustration grammar | the stone becomes a picture, not a glyph |
| Icons: `lucide-react` at 1.5 | kept; the icon set becomes pass 3's SVG components | decision 12 |
| Motion table of six rows | the five named tokens of §5 | decision 12 |
| Rowan has no face (companion spec §1) | Rowan has a face, five states, one movement (decision 8) | DIRECTIVE-2.md; the rewrite of rule 2 below |

---

## 11. Acceptance for the trial topic (fm1/algebraic-fractions-simplify)

1. One accent-filled control per screen on every Slides card and on the hero; the wash and the lit option do not count (computed background of `button, a` ≤ 1 match).
2. Every drawn label renders at ≥ 13 px at 390 wide (`fontSize × clientWidth / viewBoxWidth`).
3. After a miss: an option with a fern edge and a tick that is not hers; her option with an ink edge; the text "Not quite."; no computed colour within 20° of red on the card except `--danger`, which is absent.
4. No `[data-companion]` or `[data-companion-figure]` inside any container holding an answer field; none on a gate card; present on the close card.
5. `document.getAnimations().length === 0` under reduced motion on the title, a gate, a miss and the close.
6. The card list is a pure function of `note.blocks.json` with the prototype's count asserted (25 cards, 7 gates, 4 recall cards as the note stands).
7. Dark mode: every accent ≥ 4.5:1 with its text; the character's colours unchanged.

---

## Appendix: emotional-design rule 2, rewritten (for the lead to place)

> **2. No variable rewards, XP, coins, leaderboards, confetti or cartoon gamification, and nothing decorative on a study surface. Cairn has one companion, Rowan, and it has a face.** A mascot in the sense this rule refuses is a character that performs at her: one that has needs, reacts to her attendance or the clock, praises her rather than the line, gets sad or angry when she is away, appears inside the work, or is used as a lever to bring her back. Rowan is none of these, and each is a test rather than a promise: its states are exam events (a Letter, an arrival, a stone placed, an evening, a paper eve), never attendance events; it reacts once, at the seams of a session, and never on an answer or during a question; it asks nothing, notices no gap and misses nobody; its warmth is a fact remembered from her own work; and it can be reduced to its voice or silenced at no cost. Celebration stays proportionate: a stone placed, one reaction from Rowan at the close, and a full-screen card only for a unit reaching Proficient across the board or an exam-ready state, 1.2 seconds, reduced-motion safe.

**The reasoning.** The rule was written against Duolingo, and Duolingo is two things that its own writing lets us separate. The craft is a character built from three primitives with a shape budget, big eyes, a distinctive silhouette, a bible that keeps it consistent, and a state machine that lets it react at the moment that matters (its shape-language, building-character and visemes posts and Rive's case study, all read). The manipulation is what the character is then used for: a widget Duo that "gets more and more desperate as it nears midnight", "unhinged" skeletal and angry Duos, guilt notifications, hearts and a streak (its widget post, read; research 07 §2.2). The first is what makes a learner enjoy a screen; the second is what makes a reviewer abandon an app they otherwise praise (quality bar Part A). The evidence on characters in learning points the same way: pedagogical agents add about g = 0.2, more for school-age learners; characters that guide rather than explain do better than characters that explain; anything decorative on the content screen costs (Schroeder, Adesope and Gilbert 2013; Li et al. 2025; Mayer's coherence principle, all via benchmarks page 14 and research 06). And the one companion built entirely on positive reinforcement, Finch's bird, still burned a reviewer out in six weeks because it asked to be fed (Slate, read). So the line is not "no face"; it is "no lever". A face drawn well, kept to the seams, tied to her exams and asking nothing is the craft without the lever, and it is what the owner asked for: fun, colourful, nice to engage with, intelligently designed.
