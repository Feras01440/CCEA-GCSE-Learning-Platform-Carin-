# Cairn: cloud continuation brief

24 September 2026 · written by the first cloud session on this repository

This brief exists because the cloud session that was asked to "read the handoff memory and continue the programme" found neither the memory nor the code here. Section 1 says what was found and what is missing, section 2 says exactly how to unblock, and sections 3 to 6 reconstruct the programme's state and locked decisions from the published artifacts so the continuation has a checked starting point the moment the code lands.

Everything in sections 3 to 6 is reconstructed from the three Cairn artifacts and the founding plan (section 7). The authoritative record is the handoff memory and the docs in the local repository. Where they disagree with this brief, they win, and this brief should be corrected.

## 1. What was found, and what is missing

The GitHub repository `Feras01440/CCEA-GCSE-Learning-Platform-Carin-` was created at 00:36 UTC on 24 September 2026 and has no commits and no branches. The cloud session was cloned from it at 00:38 and started with zero memory files loaded.

The programme has been built in Remote Control sessions running on the owner's own machine, so the code and any memory those sessions kept live there:

| Session | Ran | Kind |
| --- | --- | --- |
| High-end learning platform design | 2 Aug to 22 Sep 2026 | local (bridge) |
| CCEA GCSE learning platform for sister | 1 Sep to 22 Sep 2026 | local (bridge) |
| CCEA GCSE learning platform (fork) | 20 Sep 2026 | local (bridge), archived |
| CCEA GCSE Top Learning Platform (this one) | 24 Sep 2026 | cloud, this repository |

Two facts confirm a real local codebase with its own docs: the design canvas of 23 September says "Read with docs/design/2026-09-23-art-direction-v2.md", and the status artifact of 19 September describes a lesson generator, a marking engine and 100 published lessons.

Nothing else reachable from the cloud holds a handoff: the account's Google Drive has only the founding plan PDF and past papers, the artifact list has no document named as a handoff, and no other GitHub repository of the account holds the code.

## 2. How to unblock the cloud programme

From the local clone of the Cairn codebase, push it to this repository:

```bash
cd <local cairn clone>
git remote add origin https://github.com/Feras01440/CCEA-GCSE-Learning-Platform-Carin-.git
# if a remote named origin already exists:
# git remote set-url origin https://github.com/Feras01440/CCEA-GCSE-Learning-Platform-Carin-.git
git push -u origin --all
git push -u origin --tags
```

Then bring the handoff memory into the repository so every future session can read it:

```bash
# Claude Code keeps auto-memory per project folder. Find the folder for the Cairn clone:
ls ~/.claude/projects/            # macOS or Linux
dir %USERPROFILE%\.claude\projects  # Windows
# copy its memory folder into the repo and push it
cp -r ~/.claude/projects/<the cairn project folder>/memory docs/handoff/memory
git add docs/handoff/memory
git commit -m "Add the handoff memory from the local sessions"
git push
```

If the previous session wrote its handoff as a file inside the repository instead (for example HANDOFF.md or a file under docs), the first push already brings it.

After the push, tell the cloud session the code is up. It will read the memory and the design docs first, correct this brief, and continue from the queue in section 6. This brief sits on the branch `claude/tender-goodall-o0h0uz`, which was created on an empty repository; once the real history is on the default branch, this one commit rebases onto it cleanly (it adds one new file and touches nothing else).

## 3. Where the programme stood on 19 September

Source: the artifact "Cairn Top-Tier Edition" (section 7).

### 3.1 Content

| Measure | Value |
| --- | --- |
| Lessons published | 100 of 355 topics |
| Computed figures | 1,044 |
| Licensed photographs | 24 |
| Verified videos and simulations linked | 1,040 |
| Examiner findings mined from Chief Examiner reports | 1,100 |
| Named misconceptions in the registry | 800 |
| Formerly paper-only question parts now marked on screen | 309 |

Unit by unit, as published on the status page:

| Unit | Lessons | Status |
| --- | --- | --- |
| Maths M1 | 0 of 41 | Queued |
| Maths M2 | 0 of 18 | Queued |
| Maths M3 | 17 of 17 | Complete |
| Maths M4 | 9 of 9 | Complete |
| Maths M5 | 0 of 17 | Queued |
| Maths M6 | 0 of 18 | Queued |
| Maths M7 | 13 of 17 | In progress |
| Maths M8 | 15 of 15 | Complete |
| Further Maths FM1 | 8 of 29 | Started |
| Further Maths FM2 | 4 of 16 | Started |
| Further Maths FM3 | 2 of 16 | Started |
| Science B1 | 21 of 21 | Complete |
| Science B2 | 4 of 20 | Started |
| Science C1 | 0 of 25 | Queued |
| Science C2 | 3 of 22 | Started |
| Science P1 | 0 of 22 | Queued |
| Science P2 | 4 of 20 | Started |
| Science Unit 7 practicals | 0 of 4 | Queued |

The rows sum to 100 lessons and 347 topics, while the headline says 355 topics. Check which is current against the real topic index once the code is here.

### 3.2 The pipeline

Every lesson is authored by a generator that computes every number once. The app's own marking engine then checks every answer and every common error. A second session reads the lesson line by line before it counts as published. The pipeline was producing about four topics per author per session.

Content route, in order: Further Maths Units 1 to 3 (FM1 batches C to G: simultaneous equations, trigonometry, calculus, logarithms, matrices; FM2 vectors and forces; FM3 probability and distributions) and the Year 12 science units B2, C2 and P2 in teaching order; then C1, P1 and a practical write-up surface for all 18 prescribed practicals (apparatus, variables, ordered method, results table, one improvement); then the Foundation route through the same lessons with tier-tagged sections; then CCEA English Language and Literature on the same pipeline.

### 3.3 Live on 19 September

"Teach first, every question on screen": the lock is gone, the check follows instruction, and 309 formerly paper-only parts are marked on screen.

### 3.4 The roadmap as published

1. **Next.** The new topic page: hero with hook and figure, lesson spine, three surface levels, the type scale, subject colour, one question per screen, the close card.
2. **Then.** The companion: a character with a memory of her, a voice, its own story to the exams; speaks at arrival and at the close, never during a question; no streaks, no guilt. Research, three concepts and a judge panel were done; the specification was to follow.
3. **Then.** Working ladder, tables, ordered methods, labels, practical write-ups: method marks awarded line by line; every Booklet B question type answerable on screen.
4. **Term.** The run-up to each paper: a weekly target from mastery and the real timetable, paper-first mode in the final weeks, a per-unit grade view with the A* band, a printable one-page summary for a parent or teacher.
5. **Term.** First run inside a lesson: the first visit opens inside one seeded topic in the new flow, explaining each idea where it first appears.
6. **Later.** Foundation route, English, more subjects.

### 3.5 Teaching method, as designed

- First time: instruction before testing. Idea and picture, a fully worked example, completion problems, unaided practice; guidance fades step by step. The confidence check comes after instruction.
- Done it before: "I have done this before" opens on the exam panel, runs a short confidence check, routes to the weak skills at the faded or problem level, then a mixed set. Successive relearning to criterion, then spacing.
- Self-explanation: every method step carries its reason; every lesson has a "why" callout; gates ask for the reason as often as the answer.
- Dual coding: words and a picture for every idea.
- Retrieval, spaced (FSRS) and mixed (CCEA layout in exam weeks); returns are shown as a promise on the close card, never a nag.
- Examiner language: marks earned in the scheme's own codes; the "In the exam" panel carries the Chief Examiner's findings for that topic with the series named.
- Method marks on screen: a working ladder marks line by line; faded steps compare her line to the model's; a photo of working is the fallback for the last few drawing parts.
- Calm accomplishment: gates answer "Yes." or "Not quite.", never a score. No streaks, no confetti, no shame after a missed week.

### 3.6 Resources, integrated

CCEA specification and Teacher Guidance as the spine (statement ids on the page, "not on this spec" called out, Higher-only tagged). Past papers and mark schemes read privately for tariffs and wording; every question original; official papers deep-linked for timed practice with UMS and grade boundaries. Chief Examiner reports mined into findings and misconceptions. Corbettmaths, BBC Bitesize, Freesciencelessons, Cognito, PhET and GeoGebra in the "See it" step and the "Best of what exists" rail, each verified embeddable and credited. Wikimedia Commons photographs under CC0, CC BY or CC BY-SA, fetched by a script that refuses any other licence, each carrying the prompt "What would the examiner ask about this?".

## 4. Design decisions locked on 23 September

Source: the canvases "Cairn design v2" and "Cairn feature mockups" (section 7). The v2 canvas supersedes the feature mockups where they differ.

### 4.1 Direction v2

- The palette is LCH; every hex is computed from it. Paper, Literata and the stone are kept; chroma returns where it means something.
- Paper and ink: ground L 97.5 C 2.4 H 85; recess L 95 C 2.2 H 85; ink L 18; ink-2 L 36 (7.1:1); ink-3 L 46 (4.9:1).
- Subjects, each with a deep, a mid and a wash: Mourne blue 44/34/255 (mid 80/20, wash 94/8); heather 46/46/330 (mid 80/22, wash 94/9); sea-glass 44/32/195 (mid 80/20, wash 94/9).
- Outcomes: ok is fern 45/42/148 with an ok wash for the lit option; part way 46/48/66; not yet is a warm neutral edge in ink, never red; gorse is for drawings only; danger is for destructive actions only.
- What colour means: the wash says the subject and is the card's top and the figure's stage; the accent is the one thing to press; fern says this is right or a placed pill; an ink edge says not yet; gorse is warmth in a drawing and never a control; everything else is selection and prose.
- Dark mode is a different paper, with the same names.

Hex values used in the mockups (light): ground #FAF8F3, ink #2E2C28, ink-2 #57544E, ink-3 #706D66, line #C9C6C1, surface #FFFFFF, recess #F2F0EC; Further Maths accent #9E5195 with wash #FAE9F7; Mourne accent #3B4E60; fern #2F7A45 with wash #E6F1E8.

### 4.2 Illustration grammar

- Three primitives: the rounded rectangle, the circle, the rounded triangle; every corner rounded; radii 12, 8 and 5 as in the interface.
- A shape budget of about 17 shapes per figure; no outline; eyes with whites; one warm accent; one light and one shadow.
- A drawing sits on a wash panel, never floats. The accent element is the thing the sentence is about. Labels go on the figure.

### 4.3 Motion, five names

| Name | Duration | Easing | What moves |
| --- | --- | --- | --- |
| arrival | 240 ms | ease-out | opacity, y 8 to 0 |
| reveal | 200 ms | ease-out | opacity, y 6 to 0 |
| place | 300 ms | ease-out | y −6 to 0, scale .96 to 1 |
| react | 250 ms | cubic-bezier(0.2, 0.8, 0.2, 1) | pathLength, transform |
| dismiss | 160 ms | ease-in | opacity, y 0 to −4 |

Nothing moves on scroll or hover. The character moves once, on arrival. Reduced motion means zero animations.

### 4.4 The craft floor (owner's ruling, 23 September, evening)

The cairn drawn as three flat pills on a slope must not appear anywhere. The rules below are the floor for every drawing on every board; what fails them is redrawn or removed.

- A shape budget: four stones, each one hand-drawn path, no two alike.
- One light, top-left: a lit face and a shadow face on every stone, a contact shadow where it sits.
- A cast shadow on the ground, to the lower right.
- Asymmetric and weighted: the base slab is thickest on the right; each stone sits off-centre.
- One accent at most: a lichen patch, not a sticker.
- A ground that belongs to the same world: grass at the base, or the hill itself.
- It must read black-filled at 24, 48 and 160 px.

The same floor applies to the scene: a far ridge in a cooler green for depth; every slope with a lit band and a darker foot; gorse as bushes with a lit side and flower dots, not yellow puddles; a haze band at the horizon; the cairn with its cast shadow on the slope; the hare on the hill in the same light. A stone placed is the heather stone, once, never removed.

### 4.5 Rowan, the companion: direction A, the hare

The owner's choice on the canvas and the recommendation. An Irish hare of the hills: quick, wild, a little aloof, and on her side. It keeps the path and reads the note she left; it never asks her to stay. B (the cairn-keeper) and C (the paper stonechat) stay complete on the canvas as alternatives; C is the fallback if the sit-down finds the hare too cute.

- Proportions: about 2.6 heads tall seated; ears one head long; the body a pill, the haunch a circle, the feet two long pills. Lean, not plump.
- Palette (LCH): fur 60/36/62, shade 50/34/60, cream 91/12/85, ear 74/28/28, gorse scarf 80/72/90 (the only warm accent on the screen), eyes ink and white.
- Do: lids a touch lowered by default; one ear moves on arrival, both forward when listening; holds the Letter; a paw on the placed stone.
- Never: no bounce, no idle blink, no wide eyes; never round-bodied or big-headed; never inside a question or an answer container; never sad, angry or waiting.
- Five states, all exam events and never attendance events: arrival, listening, stone placed, evening, the Letter. Two expressions: dry and pleased.
- Sizes: 160, 96 and 48 px, and a 24 px mark. Silhouette test at 120, 48 and 24.
- Places: Today's tile at 140 px on the phone and 200 on desktop; the Letter at 100 to 110 px; the hero at 72 to 96 px (80 px beside the topic-open line); the close at 160 px or more, on the hill by the topic's cairn; the 24 px mark only where a line has no room (the rail, a contents row).
- Rules carried from the first sheet: it appears in the Letter, the arrival line on Today, the close card, the paper line and the Map's place; nothing during a question; nothing inside a container that holds an answer field; after 21:30 copy only, no new work suggested; the Letter arrives on Sunday or the first Today and is sealed until she taps; she can rename it ("It answers to Rowan. Call it something else if you would rather.").
- Refused: a cartoon animal, a badge machine, sad faces, guilt lines, notifications, streak reactions, XP, hearts, any reaction to a right or wrong answer. The twenty-minute sit-down's veto stands: "embarrassing" removes the figure, not the voice.

### 4.6 Slides, the primary way into a topic

Phone first, 390 by 844. The worked example on the canvas is fm1/algebraic-fractions-simplify: 25 cards, 7 checks, generated from the lesson authors already write.

- Card kinds: title; idea with figure; figure to act on (tapped, not looked at); gate; gate answered right; gate missed; recap and pointer; close with Rowan.
- A miss draws its consequence before the words, answers "Not quite.", explains, and the card comes back once before the recap. Nothing is scored.
- Colour on the cards: the wash says the subject; fern says which option is right; ink says not yet; the accent is the one thing to press.
- The rhythm, as tokens (design doc section 8.4): stem 20 px Literata 600; gap 16; the maths on its own line at 28 px, left-aligned, 4 px padding; gap 20; options 52 px tall, 10 apart; Check 52 px at the foot. Desktop: 22, 20, 32, 24. The same names in Read and in Slides.
- The track: 3 px segments, done segments in the subject colour, the current one outlined, the rest in the wash at 55 percent.
- Desktop (1280 by 800): the whole screen is the card. A wash header with Exit, the track, the count, the label and the title; a 1000 px measure in two columns; a full-width bottom bar with the keyboard hints and the one control; no rail, no page around it. The title and the close are full-bleed two-column screens.
- The close card: "Done for tonight." What was answered, what returns and when ("Thursday: the x + 4 over x check, because you were sure and not right, so it comes back sooner"), "Later: this topic in a mixed set. That is when a stone can go on." Saved on this device.
- Refused: sound, hearts, a character mid-card, no way back.

### 4.7 Read, the second way

One centred 720 px column; the app rail collapsed to 64 px icons (Today, Learn, Practise, Papers, Map, More); a slim track with the count and a Contents popover; Continue at the end of a section and the gate itself; the hare at 80 px beside the topic-open line ("New ground. The note teaches before it asks; nothing in it is scored.").

The hero: an eyebrow line ("Further Maths · Unit FM1 · for your paper on 18 May"), the title at 40 px Literata 500, the hook at 18 px, the facts line ("About 10 minutes · 7 sections · 7 checks · 2 worked examples"), then three controls: "Start the slides · 25 cards" in the accent, "Read it as a page", and "Done this before?".

### 4.8 Today

- The Tonight tile: "9 back · about 7 minutes", one true line from Rowan ("Nine back tonight. Two are the ones you were sure about on Tuesday."), the posed hare at 140 px (phone) or 200 px (desktop), one Start button.
- The Letter card: Rowan at 100 px, the note ("I keep the dates of your papers and what comes back when. You do the maths."), the rename field, Close.
- The plan: Next step (with the examiner finding that motivates it), This week, Next paper ("Biology Unit 1 · Higher · Tue 11 May 2027, 09:15"), Your cairn ("3 stones · Nothing here is ever taken away").
- Bottom tab bar on the phone, 57 px: Today, Learn, Practise, Papers, Map, More.

### 4.9 Flashcards, to Kinnu's standard

Year 12 decks first. The deck's colour as the wash header; placed pills 10 px tall; the state on the card ("Back from Tuesday · Recall"); the answer at 34 px with its figure; the explanation with the examiner slip named; "Key words the scheme rewards"; three unaccented buttons each showing its return: Again (tonight), Good (Thu), Easy (3 wk); "Again is honest, not a penalty: the card comes back at the end of this run." Sessions of twelve with an honest close. A typed key-word card kind. Refused: streaks, stamps, a fourth Hard button.

### 4.10 Practise, as honest modes

| Mode | What it does |
| --- | --- |
| Mixed | Original questions with no topic labels, marked the way CCEA marks. |
| This topic | The ladder for one topic, then its mixed set. |
| Weak spots | What she missed, shown a different way first, then asked again in a new form. |
| Exam-style | Timed at 1.2 minutes a mark, working counts, the scheme lines she missed at the end. No grade. |
| Unit check | Six exam parts across three topics of one unit. This is what moves a topic to Proficient. |
| Due reviews | Spaced returns, with the reason each one is back. |

"No streaks, no points. A miss costs nothing but a return." Refused: XP, "Wrong", leagues, the same question twenty times.

### 4.11 Type

Literata for the lesson voice: section headings at 24, prose at 18, reading text near 65 characters wide. Inter for controls and numbers, with tabular figures wherever digits line up. Subject colour on the chrome only. Right and miss are separate from the accent and never decorative. Three surface levels: prose on the page ground, cards for things she operates, recessed panels for reference.

## 5. Founding constraints (12 August plan)

The plan "Building a High-Impact CCEA GCSE Learning Platform for Northern Ireland" set rules the programme still follows:

- The loop for every topic: diagnose, learn, retrieve, apply, reflect, revisit. Attempt first, a hint ladder, the full answer delayed until a genuine attempt, then a similar but not identical question.
- No grade promise. Readiness is shown as evidence, never as a prediction.
- Original questions by default; official papers linked, never reproduced without clearance; a rights record for every external asset.
- No autonomous publication: a generator may draft and check; a review releases.
- Privacy-high defaults, data minimisation, accessibility as a condition of valid learning evidence.

## 6. The work queue once the code is here

1. Read the handoff memory and `docs/design/2026-09-23-art-direction-v2.md`. Correct this brief where it is wrong or stale. Confirm the topic count (355 or 347).
2. Land direction v2 as tokens: the LCH palette computed to CSS custom properties for light, dark and evening; the five motion names; the reduced-motion rule.
3. Replace the banned three-pill cairn everywhere with the craft-floor cairn at 24, 48, 96 and 160 px, and apply the floor to the hill scene.
4. Build Rowan A as one SVG component: five states, two expressions, four sizes, placements on Today, the Letter, the hero and the close; voice lines at arrival and the close only.
5. Slides: generate the card deck from the existing lesson format (idea, figure to act on, gate, miss with return, recap, close); phone first with the section 8.4 rhythm tokens, then the desktop full-screen card.
6. Read: the 720 px column, the collapsed rail, the Contents popover, Continue at the end of a section.
7. Today: the Tonight tile, the Letter with rename, the plan rows.
8. Flashcards restyle with the typed key-word kind; Practise as the six modes.
9. Content route: FM1 batches C to G, FM2, FM3; B2, C2, P2; then C1, P1 and the practical write-up surface. Every topic through the pipeline: generator, marking engine, second-session review, then published.

## 7. Sources

- Cairn Top-Tier Edition, status page and plan, 19 September 2026: https://claude.ai/artifact/G5eHzDvLDmmYS1NnJKUFMS
- Cairn design v2: colour, illustration, Rowan, Slides, canvas of 23 September 2026: https://claude.ai/artifact/994fXbktz9Qfi32ZdcJB5s
- Cairn feature mockups, canvas of 23 September 2026: https://claude.ai/artifact/MJujDjzgPq6fYzmsXxz7ia
- Building a High-Impact CCEA GCSE Learning Platform for Northern Ireland, Manus AI, 12 August 2026 (Google Drive): https://drive.google.com/file/d/10ZxA7qW0tu6iGr01aF5tLzSBMfyOJlp0/view
