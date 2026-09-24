# 07 — Award-winning & best-in-class EdTech design: inspiration, principles and a licensed toolkit

**Dimension:** design-inspiration
**Date:** 2026-09-01
**Audience:** the team building a self-hosted Next.js/React (or Astro) CCEA GCSE study platform for a 16-year-old in Northern Ireland (CCEA grades A*–G with C*, Maths units M1–M8 — grading/unit facts are covered in other research files; this file is about *design*).

> Method note. Every claim below carries the URL it was taken from. ~50 primary pages were fetched (Awwwards, vendor docs, licence files, W3C, Apple HIG, npm/unpkg package manifests). Some pages could not be fetched — GitHub HTML pages and npmjs.com returned HTTP 403, `desmos.com/api-terms` and `desmos.com/my-api` render client-side and returned only "Loading…", `screensdesign.com` was down, `withorbit.com` returned a browser-compatibility error. Where that happened I say so and used an alternative (e.g. `unpkg.com/<pkg>/package.json` for licence fields). The web-search budget for this session was exhausted after the third batch, so a handful of items (Linear LCH, Geist licence, BDA dyslexia guide, etc.) were verified by direct fetch of known URLs instead.

---

## 0. Executive summary

1. **Awwwards is the wrong yardstick for a study tool, but its jury rubric is useful.** Awwwards' "Culture & Education" winners are almost all *marketing* sites (Obys' Design Education Series, Iron Velvet's D2C Life Science, Halo Lab's Skillex) scored on Design/Usability/Creativity/Content plus a Dev award for animation and responsiveness. They win with monochrome two-colour palettes, one strong typographic voice, GSAP/Three.js motion, and scroll choreography — and they typically score *lowest* on accessibility (Obys' SOTD got 7.0/10 for accessibility vs 8.0 for animation). Borrow the restraint and craft; do not borrow the scroll-jacking.
2. **The genuinely award-winning *learning* products (Brilliant, Mathigon, Khan Academy, Quantum Country, Execute Program) share one design idea: the learner does something every 30–90 seconds, and the interface reacts truthfully.** Brilliant ("no videos, everything is interactive"; ustwo built a "Game Feel" north star with celebration + encouragement components), Mathigon (BETT 2022 winner, "a front-runner for a new generation of textbooks"), Execute Program (courses are "primarily code examples, not text"; lessons gated by reviews), Quantum Country (112 prompts embedded in prose; retention rising from ~2 days after one review to ~54 days after six for ~95 minutes of review).
3. **Motivation loops must be borrowed selectively.** Duolingo's own data: 7-day streak → 3.6× more likely to finish a course; streak-extension animations lifted D7 retention +1.7%; two equippable streak freezes lifted DAU +0.38%. The critique is equally well-documented: streak anxiety, hearts, leagues and speed-running easy lessons optimise engagement not learning; a 2023 systematic review found most Duolingo studies measured app design, not outcomes. Sparx Maths (used across NI/UK schools) shows the school-side version: XP, levels every 1,000 XP, opt-out leaderboards, certificates — and student complaints of "racing to hit the XP target". **Recommendation:** streaks measured in *weeks studied* not days, no hearts, no public leagues, mastery states like Khan's (Familiar → Proficient → Mastered, with decay), and celebration reserved for rare milestones (FEAT test).
4. **UI polish = fewer decisions, executed consistently.** Vercel Geist (#fafafa ground, #171717 ink, one accent at most), Linear (LCH-based themes generated from *three* variables: base, accent, contrast; Inter Display for headings; high-contrast variants auto-generated), Stripe (one gradient as the only colour moment, WebGL disabled off-screen). Apple HIG motion: intentional, optional, quick and precise, respect Reduce Motion. WCAG 2.2 adds concrete rules that matter for a 16-year-old on a phone: 24×24 CSS-px targets, dragging must have a non-drag alternative, no cognitive-test logins, focus never obscured.
5. **Toolkit (all self-hostable, licences verified from package manifests):** KaTeX 0.18.5 (MIT; fonts OFL 1.1; default output `htmlAndMathml` for accessibility) or MathJax (Apache-2.0; speech/braille explorer built in), MathLive 0.110 (MIT) for maths *input*, Mafs 0.21 (MIT, React ≥18) for bespoke interactive diagrams, JSXGraph 1.13.2 (MIT OR LGPL-3.0) for geometry/constructions, function-plot (MIT), Observable Plot (ISC), ts-fsrs 5.4.2 (MIT) for scheduling, Motion 13 (MIT) + `MotionConfig reducedMotion="user"`, GSAP (free for commercial use since the Webflow acquisition; one anti-competitor clause), canvas-confetti (ISC), auto-animate (MIT), Radix (MIT) / React Aria Components (Apache-2.0), Tailwind 4 (MIT), Inter and Geist (OFL), STIX Two (OFL). **Avoid or licence:** Desmos API (key required; terms page is JS-only and could not be read — email Desmos before production use; self-hosted builds exist for partners), GeoGebra (source EUPL-1.2 but *apps/web services are non-commercial only* and require "Made with GeoGebra®" attribution; commercial use needs office@geogebra.org), Mathigon textbooks content (© all rights reserved; `@mathigon/studio` is MIT AND CC-BY-SA-4.0 AND OFL-1.1, `@mathigon/euclid` MIT), Anki (AGPL-3.0-or-later — do not embed its code; use ts-fsrs instead), Orbit (Apache-2.0 for libs, AGPL/BUSL for app+backend).

---

## 1. Awwwards: what wins in "Culture & Education", and what it is worth to us

### 1.1 How Awwwards judges
Jury + community score four categories — Design, Usability, Creativity, Content — plus a separate Developer Award (animations/transitions, responsive design, accessibility, SEO/semantics). Source (rubric visible on each site page, e.g.): https://www.awwwards.com/sites/design-education-series-r

### 1.2 Specific winners/nominees fetched (education-adjacent)

| Site | Award & date | Author | What made it score | Palette / tech | Score highlights | URL |
|---|---|---|---|---|---|---|
| **Design Education Series®** (design courses) | Site of the Day, 25 Jun 2024 (+ Dev Award, Product Honors) | Obys (Viacheslav & Olha Olianishyn) | Site is itself a demonstration of the design fundamentals it teaches; scroll-driven animation; strict two-colour monochrome | #17191A / #F2F2F2; Contentful CMS | SOTD 7.59; Dev 7.58; Animation 8.0; Responsive 8.0; **Accessibility 7.0**; SEO 7.2; top jury 9.0 (Rogue Studio) | https://www.awwwards.com/sites/design-education-series-r |
| **D2C Life Science** | SOTD + Dev Award, 22 Feb 2026 | Iron Velvet | Metaphor-driven 3D hero (self-solving Rubik's cube → pill); minimal UI | #879186 / #E6F7ED; Three.js, Blender, GSAP | SOTD 7.28; Creativity 7.71; Animations 7.80; Usability 6.98 | https://www.awwwards.com/sites/d2c-life-science |
| **Made With GSAP** (animation education) | SOTD + Dev Award, 29 Jul 2026 | Florent Roux-Durraffourt, Michael Garcia, Manoir | Curated, well-crafted JS effect gallery; semantic markup | #C9FE6E / #0A0A0B; vanilla JS + GSAP | 7.65 overall; Animation 8.40; Creativity 7.75 | https://www.awwwards.com/sites/made-with-gsap-1 |
| **Skillex Online Education** | Honorable Mention, 14 Feb 2023 | Halo Lab | Clean single-page, parallax, restrained sage/white | #97c680 / #fff; Webflow | scores 5.7–9.4, top 9.4 | https://www.awwwards.com/sites/skillex-online-education |
| **Papumba – Educational App** (kids) | Honorable Mention, 9 May 2026 | Tomas Vera | Illustration-led storytelling, colourful | Webflow, Figma, Illustrator | community 7.42; creativity up to 10/10 | https://www.awwwards.com/sites/papumba-educational-app |
| **Lionheart Education** (school) | Honorable Mention, Dec 2025 | Fhoke | Big photography, minimal, strong content architecture | #F5D2B5 / #191919; WordPress | ~7.4 avg | https://www.awwwards.com/sites/lionheart-education |
| **Glean Education** | Nominee, 23 Oct 2024 | luke-bair | Micro-interactions, big imagery, strong copy | — | ~7.2 avg | https://www.awwwards.com/sites/glean-education |
| **Peak Education** | Nominee, 27 Mar 2024 | Milkable | Smooth scrolling animation, full-screen imagery | WordPress | 6.87 avg | https://www.awwwards.com/sites/peak-education-1 |

Category index pages (fetched): https://www.awwwards.com/websites/culture-education/ and https://www.awwwards.com/websites/culture-education-science/ (also lists WiDS, Museum of Science and Industry, Hyperactive Education, European Cultural Academy, etc.).

### 1.3 Take-aways for a *serious* study product
- **Winners use two colours and one type family.** Obys: black/off-white. Made With GSAP: lime/near-black. Lionheart: peach/near-black. That restraint is transferable and cheap.
- **Motion is scored, and it is what separates SOTD from HM** (Animation 8.0–8.4 on winners). But every winner scores lowest on *accessibility*, and these are one-visit marketing pages; a study tool is used daily for 20–60 minutes. Import the *craft* (easing, choreography, 60 fps) into micro-interactions, not into page-level scroll-jacking.
- **Nothing in the category is a working learning UI.** The award-winning *learning interfaces* are found via BETT/Webby/Common Sense (Mathigon) and Apple/Google editorial (Brilliant, Duolingo), covered next.

---

## 2. The learning products: what each does, why it works, what to steal

### 2.1 Brilliant.org — "learn by doing"
**Facts (from Brilliant's own text):** "On Brilliant, you learn by doing — there are no videos, everything is interactive"; recommended 15 minutes/day or 2-minute sessions; "40+ interactive courses"; "ages 13 to 113"; claims "6x more effective"; features daily streaks, leagues, progress dashboards. Source: https://brilliant.org/llms.txt
**Lesson anatomy (secondary):** lessons 5–15 min; drag-and-drop diagrams that animate; multiple choice with immediate visual feedback; prediction tasks before reveal; "Get it wrong, the diagram changes and shows you why." Source: https://beginnersinai.org/brilliant-explained/
**Design process (ustwo case study):** ustwo defined a "'Game Feel' North Star vision", wrote game-design documentation for progression/unlocks, and shipped UI components for three emotional needs — (1) in-lesson celebrations on correct answers, (2) "moments of encouragement when learners are struggling", (3) transparency via lesson tiles, progress trackers and a "Level Gameboard"; plus "whimsical in-lesson flourishes" and a learning companion; no metrics disclosed. Source: https://ustwo.com/work/brilliant/
**Criticism:** not suited for those needing "rigorous mastery enforcement" or external accountability; pricing $24.99/mo or $149.88/yr. Source: https://beginnersinai.org/brilliant-explained/

**Steal:** one question per screen; every wrong answer produces a *visual* consequence (the diagram moves) before the textual explanation; a "struggle" state (after 2 wrong) that offers a hint rather than a red X; prediction-then-reveal for graphs/transformations (perfect for CCEA M-unit topics like transformations of functions, straight-line graphs, vectors).

### 2.2 Duolingo — motivation loops and their cost
**What Duolingo says works:** 7-day streak users are "3.6 times more likely to complete their course"; new streak-extension animations lifted 7-day retention +1.7%; >6M users on 7+ day streaks; Streak Freeze exists because breaking a streak "can be demotivating"; two equippable freezes → +0.38% DAU; early-streak gains feel big (2→3 days is +50%) then loss aversion takes over. Source: https://blog.duolingo.com/how-duolingo-streak-builds-habit/
**2022 Path redesign rationale:** learners weren't confident they were "learning the correct or best way"; tree replaced with a linear path interleaving crown levels from different skills on spaced-repetition principles; stories/practice embedded in the path; completed lessons stay reviewable. Source: https://blog.duolingo.com/new-duolingo-home-screen-design
**Brand system:** Feather Bold custom display face (Fontsmith / Krista Radoeva, 2019 identity by Johnson Banks), letterforms derived from the owl. Source: https://www.monotype.com/resources/duolingo-custom-font-inspired-their-owl-mascot-duo
**Criticism (documented):** streak anxiety, compulsive checking, leaderboards "resembling addictive social media"; hearts make learning "feel truncated"; users speed-run easy lessons to protect streaks — "activating the retention mechanism without the learning"; 2023 systematic review: most studies measured app design, not learning; 2024 review: vocabulary gains, but small/short-term studies; "engagement should never be the end goal"; removing difficulty conflicts with "desirable difficulties" research. Sources: https://uxdesign.cc/the-good-the-bad-and-the-ugly-of-duolingo-gamification-3a12f0e80dc7 ; https://theeconomyofmeaning.com/2025/08/25/a-critical-look-at-how-to-make-learning-as-addictive-as-social-media-a-ted-talk-about-duolingo/ ; https://www.tandfonline.com/doi/full/10.1080/09588221.2021.1933540 ; https://gadallon.substack.com/p/duolingos-scaling-journey-education

**Steal / avoid:**
- Steal: a single clear "next step" (the path), streak *forgiveness* (freeze), and small animated acknowledgement of consistency.
- Avoid: hearts/lives, public leagues, daily-day streaks for a GCSE student (exam study is weekly-rhythmic and term-shaped). Use a **weekly streak** ("6 weeks in a row with ≥3 sessions") and show *mastery* deltas, not XP.

### 2.3 Khan Academy — mastery levels with decay
Levels: Not started → Attempted → **Familiar** (score 70–85% on an exercise, or all correct on a quiz/test) → **Proficient** (from Familiar, 100% on an exercise/quiz/test/challenge) → **Mastered** (from Proficient, sustained mastery via mastery challenges / course challenge); points 50/80/100; levels can go *down* with later performance. Sources: https://support.khanacademy.org/hc/en-us/articles/5548760867853--How-do-Khan-Academy-s-Mastery-levels-work (help centre page 403'd on direct fetch; details taken from the search snippet of that page and the community post https://support.khanacademy.org/hc/en-us/community/posts/39370163344653 ).
Evidence: proportion of skills at proficient/mastered correlated with MAP Growth maths scores regardless of skills attempted or time; ~30 minutes gets two skills to proficient; "focus on fewer skills but reach at least proficient". Source: https://blog.khanacademy.org/why-khan-academy-will-be-using-skills-to-proficient-to-measure-learning-outcomes/

**Steal:** four-state mastery chip per CCEA spec point; a *unit test* that can promote many skills at once; downward movement when a later mixed test exposes decay; a headline metric "spec points at Proficient+" rather than minutes or XP.

### 2.4 Mathigon / Polypad — the interactive textbook
Awards: BETT 2022 Winner (Highly Commended 2020; finalist 2018/19/21), GESS 2019 Winner, Reimagine Education 2018 Gold, Webby Honoree 2015/2017, Common Sense Education Top Pick ("a front-runner for a new generation of textbooks"), Lovie 2013 Gold; >600k monthly users; founder Philipp Legner (ex-Google; Amplify acquired 2021). Source: https://mathigon.org/press
Authoring model (repo README): each course = `content.md` in a custom Markdown extension + `functions.ts` for interactivity + SCSS + optional `hints.yaml` for the virtual tutor; libraries `@mathigon/core|fermat|hilbert|euclid|boost|studio`. Source: https://github.com/mathigon/textbooks
Licensing: textbook content "© Mathigon 2016–2022, All rights reserved"; FAQ: "You can only use Mathigon for non-commercial purposes" without a licence. Sources: https://github.com/mathigon/textbooks ; https://mathigon.org/faqs . Package manifests: `@mathigon/studio` 0.1.43 licence "(MIT AND CC-BY-SA-4.0 AND OFL-1.1)" (https://unpkg.com/@mathigon/studio/package.json); `@mathigon/euclid` 1.2.4 MIT (https://unpkg.com/@mathigon/euclid/package.json).
Polypad embed: `<iframe src="https://polypad.amplify.com/embed/${key}">`; manipulatives include algebra tiles, balance scales, function machines, sliders, number bars, fraction bars, 3D solids, dice/spinners, charts. Source: https://polypad.amplify.com/p/api (no commercial terms stated on that page).

**Steal:** the *step-reveal* textbook pattern — a paragraph ends in a blank or a click target; the next paragraph does not render until the learner has committed an answer; a per-course `hints.yaml`-style tutor voice; algebra tiles / balance-scale manipulatives for M1–M4 algebra.

### 2.5 Desmos (calculator + Classroom)
Amplify Classroom (formerly Desmos Classroom) design rubric: does the activity "elicit student thinking", teach with pedagogical best practice, take a creative approach, and is it "accessible and approachable for all students"; students compare responses to peers to discuss reasoning. Source: https://help.desmos.com/hc/en-us/articles/23421565218573-Amplify-Classroom-formerly-Desmos-Classroom-now-a-part-of-Amplify and https://amplify.com/programs/amplify-desmos-math/
API v1.12: key required as URL param; keys from desmos.com/my-api; Graphing, Geometry, 3D, Scientific, Four-function calculators, each "separately enabled per API key"; annual stable release each April; partners may self-host ("total separation … the option to use the tools without a network connection"); accessibility: audio trace, Nemeth/UEB braille, keyboard shortcuts, screen-reader descriptions, reverse contrast, projector mode. Source: https://www.desmos.com/api and https://www.desmos.com/api/v1.12/docs/index.html
Terms: `https://www.desmos.com/api-terms` and `/my-api` are client-rendered and returned only "Loading…" — **could not verify commercial terms**. Search snippets indicate non-commercial sites may use the API free and production/commercial use needs a key via info@desmos.com; the general ToS (https://www.desmos.com/terms) reserves the right to show "Powered by desmos.com" attribution and licences user content CC BY-NC-SA 3.0. Treat commercial embedding as *requires written confirmation from Desmos*.

**Steal:** audio-trace-level accessibility as the bar; "predict, then check on the graph" tasks; Desmos-style expression list + graph split view for M-unit graph work.

### 2.6 Seneca (UK GCSE — includes CCEA content)
Claim: >1,000-student study; groups (traditional / iPad study guides / Seneca), equal baseline, retested after 4 weeks; Seneca group "2x the test scores". The help page gives no randomisation, significance or peer-review detail — treat as promotional. Source: https://help.senecalearning.com/en/articles/2483299-is-seneca-more-effective-than-other-revision-resources . Design premise: built with neuroscientists (Oxford/Cambridge/UCL); "Accelerated Learning System" = retrieval practice, spacing, interleaving, imagery; interactive revision-guide format with instant feedback. Sources: https://senecalearning.com/en-gb/ ; https://help.senecalearning.com/en/articles/2483292-what-is-seneca-learning
**Steal:** vertical, card-per-concept scroll with retrieval questions interleaved every 2–3 cards; very low friction (no setup, no deck building). **Avoid:** its low information density and cartoon aesthetic, which reads as "Year 8" to a 16-year-old.

### 2.7 Sparx Maths (used in NI/UK schools)
Personalisation: level judged after ~100 questions, continuously adjusted; teacher-overridable; every question has a support video (>10,000); one hour of homework per week; mixes prior topics. Source: https://support.sparxmaths.com/en/articles/342284-how-does-sparx-personalise-homework
Rewards: XP per exercise; new level every 1,000 XP, cumulative across years; ~5,000 XP per 10 weeks if all compulsory homework done; XP table (compulsory homework up to 420, completion bonus 50, unused question-swap 25 each, bookwork accuracy up to 50, XP Boost 405, Target 135, Independent Learning 20/task); milestone levels at multiples of 5/25/100; leaderboards (class/year/school, random nicknames, **students can opt out**); auto certificates. Source: https://support.sparxmaths.com/en/articles/342328-student-rewards-and-recognition
Student frustration: "the same type of question 20 times"; algorithm oversimplifies after careless errors; "racing to hit the XP target before bedtime"; "the robot voice just says 'Wrong' repeatedly"; requests for creative problem types, difficulty choice, teacher-style mini-lessons. Source: https://www.thinkingineducating.com/why-sparx-maths-triggers-frustration-among-students-and-what-could-make-it-better/

**Steal:** bookwork/working-out capture (a photo or typed working) as part of the answer; ~100-question calibration; opt-out social features. **Avoid:** XP-as-currency and "Wrong" with no warmth.

### 2.8 Quantum Country / the mnemonic medium (Andy Matuschak & Michael Nielsen)
Data: 112 Q/A prompts embedded in the essay; retention rose from ~2 days after one review to ~54 days after six; ~95 minutes of review total versus ~4 hours reading; intervals in-text → 5 days → 2 weeks → 1 month → 4 months after five successes; "exponential returns on effort". Card principles: atomic, early prompts deliberately trivial (to teach the interface), no orphan prompts — "densely interconnected webs". Source: https://numinous.productions/ttft/
Prompt-writing properties: **focused, precise, consistent, tractable, effortful**; procedures → key verbs/conditions; concepts → multiple lenses (attributes, similarities/differences, parts/wholes, causes/effects, significance); open lists → tag-linking and "give a novel example" prompts. Source: https://andymatuschak.org/prompts/
Orbit (the embeddable successor): Apache-2.0 except `packages/app` and `packages/backend` (AGPL-3.0+ or BUSL-1.1) — https://github.com/andymatuschak/orbit (licence detail from search snippet of that repo; the live site https://withorbit.com/ returned a browser-compatibility message when fetched).

**Steal:** *prompts inside the notes*, not in a separate flashcard app; a review inbox on the home page; show the learner their own forgetting curve (Quantum Country's "memory is a choice" framing).

### 2.9 Execute Program (Gary Bernhardt)
Courses are "primarily code examples, not text"; every example interactive; hundreds of small examples increasing in complexity; the system knows lesson dependencies and unlocks lessons only when prior reviews are passed; a daily lesson limit ("you can't do the whole course in a day"); ~20 min/day for a couple of weeks, ~10 min/day of reviews declining over time; reviews are "tiny programs" the learner completes; critique: no easy/hard rating, sibling reviews land on the same day ("artificially easy"), spacing "a little crude relative to Anki"; $39/mo or $235/yr. Sources: https://www.executeprogram.com/spaced-repetition (page body did not render on fetch; description from search snippet), https://mike.place/2020/executeprogram/ , https://code.brettchalupa.com/execute-program-review , https://notes.andymatuschak.org/z2LGZ8cXBcQMP7YuAHbeVyCSLZoiMXvQNKCok

**Steal:** *worked-example-as-question* — every "example" in the notes is a fill-in step; dependency-gated lessons; a soft daily cap that says "come back tomorrow, the reviews will be waiting" (turns the cap into a retention hook).

### 2.10 Anki / FSRS and RemNote
Anki desktop licence: "GNU Affero General Public License, version 3 or later" (plus MIT/BSD/Apache/CC for components) — https://raw.githubusercontent.com/ankitects/anki/main/LICENSE . FSRS: default desired retention 90%; avoids SM-2 "ease hell"; buttons Again (forgot → relearn), Hard (correct but difficult — counts as success), Good, Easy — https://docs.ankiweb.net/deck-options.html
RemNote: flashcards written inline in notes (`==` / `>>`), cards keep full context; Anki-SM2 or FSRS (claims FSRS cuts reviews 20–40%); exam scheduler adjusts intervals to a test date — https://www.remnote.com/feature/spaced-repetition ; https://help.remnote.com/en/articles/8663109-flashcard-basics
ts-fsrs 5.4.2, MIT — https://unpkg.com/ts-fsrs/package.json

**Steal:** FSRS with a **target-date mode** (RemNote's exam scheduler) keyed to CCEA exam dates; 90% desired retention default; 3-button grading (Again/Good/Easy) to reduce decision load for a teen.

---

## 3. UI polish references (Linear / Vercel / Stripe / Apple)

| Source | Concrete, reusable decision | URL |
|---|---|---|
| Vercel Geist | Near-white #fafafa ground, #171717 ink, 200-step grey scale; "the ink IS the brand"; Geist Sans + Geist Mono; components via `@vercel/geistcn` | https://vercel.com/geist/introduction ; https://www.shadcn.io/design/vercel |
| Geist font licence | "Licensed under OFL"; npm `geist` 1.7.2 declares SIL Open Font License | https://vercel.com/font ; https://unpkg.com/geist/package.json |
| Linear redesign | LCH colour space for perceptual uniformity; themes generated from **3 variables (base, accent, contrast)** instead of 98; auto high-contrast variants; Inter Display for headings, Inter body; explicit elevation levels (background/foreground/panel/dialog/modal); neutral greys with reduced blue chroma | https://linear.app/blog/how-we-redesigned-the-linear-ui |
| Stripe / Linear / Vercel common principles | High contrast; generous whitespace; monochrome base + one accent (Stripe gradient, Linear purple, Vercel rare blue); sharp geometric type | https://www.pixeldarts.com/en/post/four-design-principles-behind-stripe-linear-and-vercel |
| Stripe gradient | WebGL mesh gradient (minigl, ~10 kB), disabled via ScrollObserver when off-screen | https://www.bram.us/2021/10/13/how-to-create-the-stripe-website-gradient-effect/ ; https://kevinhufnagl.com/how-to-stripe-website-gradient-effect/ |
| Apple HIG Motion | Use motion intentionally; make motion optional (Reduce Motion); realism/credibility; "quick, precise animations"; avoid gratuitous motion | https://developer.apple.com/design/human-interface-guidelines/motion |
| Bento grids | 4-col base, `span 2`/`span 2 × 2` for hero tiles, 12–24 px gap, 12–16 px radius, ≤ 6–12 tiles, collapse to 2 cols < 768 px; popularised by Apple product pages | https://senorit.de/en/blog/bento-grid-design-trend-2025 ; https://www.stan.vision/journal/revolutionizing-ui-ux-in-2024-with-bento-ui-grid-design-trend |
| Micro-interactions | Trigger → feedback pairs; value = system status, error prevention, engagement, brand | https://www.nngroup.com/articles/microinteractions/ |
| Celebration restraint | "Over-confetti-ing": confetti no longer surprising; FEAT test — "If it's an ordinary thing, it does not need … an extraordinary response"; celebrate only what the user has built toward for weeks/months | https://uxplanet.org/why-confetti-celebrations-backfire-and-how-to-make-them-work-be838a6e7b8b ; https://uxdesign.cc/the-over-confetti-ing-of-digital-experiences-af523745db19 |
| Inter | OFL 1.1; Display optical size; `tnum`, `zero`, `frac`, `sups/subs` features | https://rsms.me/inter/ |

---

## 4. Accessibility for a 16-year-old (WCAG 2.2 + cognitive guidance)

New WCAG 2.2 criteria (all fetched from W3C): 2.4.11 Focus Not Obscured (AA); 2.4.12 (AAA); 2.4.13 Focus Appearance (AAA); **2.5.7 Dragging Movements (AA)** — every drag must have a single-pointer alternative; **2.5.8 Target Size (Minimum) (AA)** — 24×24 CSS px or 24 px spacing circles, inline-text exception; 3.2.6 Consistent Help (A); 3.3.7 Redundant Entry (A); **3.3.8 Accessible Authentication (AA)** — no memory/cognitive tests without alternative. Sources: https://www.w3.org/WAI/standards-guidelines/wcag/new-in-22/ ; https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html
2.3.3 Animation from Interactions (AAA) — interaction-triggered motion can be disabled; technique = `prefers-reduced-motion`. https://www.w3.org/WAI/WCAG22/Understanding/animation-from-interactions.html
GOV.UK "Dos and don'ts" posters — dyslexia: images/diagrams to support text, left-align, no underline/italics/capitals, don't force recall of previous page, don't rely on spelling; low vision: readable size, 200% zoom, colour + shape + text; autism: simple colours, plain language, descriptive buttons; screen readers: linear layout, HTML5 structure, keyboard-only. https://accessibility.blog.gov.uk/2016/09/02/dos-and-donts-on-designing-for-accessibility/ (the BDA style-guide URL returned 404 on fetch.)
Motion library support: Motion `MotionConfig reducedMotion="user"` disables transform/layout animations but keeps opacity/colour; `useReducedMotion()` for custom cases. https://motion.dev/docs/react-accessibility

**Implications specific to a teenager on a phone:** big touch targets on answer options (≥ 44 px effective, 24 px minimum); no drag-only manipulatives (offer tap-to-place); passwordless email/magic-link login satisfies 3.3.8; dark theme is a *preference*, not a default (exam papers are black on white — practise in light mode by default, offer dark); no timed-out sessions mid-question (3.3.7 spirit); never rely on colour alone for correct/incorrect (use icon + text + motion).

---

## 5. Typography for maths

| Need | Choice | Licence | Notes | URL |
|---|---|---|---|---|
| Render LaTeX fast, SSR-friendly | **KaTeX 0.18.5** | MIT (code); fonts OFL 1.1 (font sources MIT) | Default `output: "htmlAndMathml"` = visual HTML + MathML for accessibility; `throwOnError:false` to degrade gracefully; renders synchronously, no reflow; maths renders at 1.21× surrounding size by default (tune `.katex{font-size}`); self-host fonts via `$font-folder`; WOFF2 subsetting by Browserslist | https://unpkg.com/katex/package.json ; https://katex.org/docs/options.html ; https://katex.org/docs/font.html ; https://github.com/KaTeX/katex-fonts/blob/master/LICENSE (licence detail via search snippet) |
| Screen-reader speech/braille for maths | **MathJax** (mathjax-full 3.2.2 on npm; v4 docs) | Apache-2.0 | v4 combined components include speech + explorer by default: `aria-label`/`aria-braillelabel`, term-by-term exploration, Nemeth/Euro braille; semantic-enrich improves line-breaking | https://unpkg.com/mathjax-full/package.json ; https://docs.mathjax.org/en/latest/basic/accessibility.html |
| Native MathML | MathML Core in Chromium since 2023 → all major browsers | — | Consider MathML output + an OpenType MATH font as a progressive path | https://arxiv.org/pdf/2605.16562 (arXiv paper on MathML 4 conversion, via search snippet) |
| Maths text font | **STIX Two** 2.10 | OFL 1.1 | Designed for scientific publishing; Text + Math variants | https://www.stixfonts.org/ |
| UI font with tabular numerals | **Inter** (or Geist) | OFL 1.1 | `font-feature-settings: "tnum"` for score tables, `"zero"` for slashed zero | https://rsms.me/inter/ ; https://vercel.com/font |
| Maths *input* | **MathLive 0.110** (mathfield web component) + Compute Engine (MathJSON) | MIT | Virtual keyboard, LaTeX in/out, can compare student answers symbolically | https://unpkg.com/mathlive/package.json ; https://mathlive.io/ ; https://github.com/cortex-js/compute-engine (MIT, via search snippet) |

Performance note (secondary): MathJax 3 closed much of the gap with KaTeX; KaTeX still wins on font-loading and bundle size. https://www.intmath.com/cg5/katex-mathjax-comparison.php

---

## 6. Interactive graphing / geometry / animation libraries — licence matrix

| Library | Version (verified) | Licence | Self-host in Next.js/Astro? | Fit for CCEA GCSE Maths | URL(s) |
|---|---|---|---|---|---|
| **Mafs** | 0.21.0 | MIT | Yes; React ≥ 18 peer dep; SVG; declarative `<Coordinates>`, `<Plot>`, movable points via `useMovablePoint`, transforms, LaTeX | Best for bespoke, animated, "predict-then-drag" diagrams in notes (M1–M8 graphs, vectors, transformations) | https://unpkg.com/mafs/package.json ; https://mafs.dev/ ; https://github.com/stevenpetryk/mafs |
| **JSXGraph** | 1.13.2 | MIT OR LGPL-3.0-or-later | Yes; standalone, no deps; SVG/canvas; multi-touch; MathJax/KaTeX labels; ARIA hooks; 2D/3D, geometry, curves, vector fields, charts, animation | Constructions, loci, circle theorems, bearings, transformations; also statistics charts | https://unpkg.com/jsxgraph/package.json ; https://jsxgraph.org/wp/index.html ; https://github.com/jsxgraph/jsxgraph |
| **function-plot** | 1.25.4 | MIT | Yes (d3-based) | Quick y=f(x) plots, roots/intersections | https://unpkg.com/function-plot/package.json |
| **Observable Plot** | 0.6.17 | ISC | Yes | Statistics unit charts (histograms, box plots, scatter/correlation) | https://unpkg.com/@observablehq/plot/package.json |
| **Desmos API** | v1.12 | Proprietary; API key required; terms page not machine-readable | Load from desmos.com with key, or partner self-host build | Gold-standard graphing + accessibility (audio trace, braille) but **licence must be agreed** for production/commercial use | https://www.desmos.com/api ; https://www.desmos.com/api/v1.12/docs/index.html ; https://www.desmos.com/api-terms (unreadable on fetch) |
| **GeoGebra apps** (`deployggb.js`) | — | Source EUPL-1.2; **apps/web services non-commercial only**; language files CC BY-NC-SA 4.0; attribution "Made with GeoGebra®" required; commercial → office@geogebra.org | Yes (Math Apps Bundle, `setHTML5Codebase`) but only under a licence for anything revenue-generating | Fine for a personal/non-commercial site; not for a paid product without agreement | https://www.geogebra.org/license ; https://geogebra.github.io/docs/reference/en/GeoGebra_Apps_Embedding/ |
| **Polypad** (Amplify/Mathigon) | — | Not stated on API page; Mathigon FAQ: non-commercial without licence | iframe embed | Algebra tiles, balance scale, number bars | https://polypad.amplify.com/p/api ; https://mathigon.org/faqs |
| **@mathigon/euclid** | 1.2.4 | MIT | Yes | Geometry maths (intersections, transformations) to drive your own SVG | https://unpkg.com/@mathigon/euclid/package.json |
| **@mathigon/studio** | 0.1.43 | MIT AND CC-BY-SA-4.0 AND OFL-1.1 | Yes, but the CC-BY-SA part is share-alike | Interactive-course server/markdown parser — study its step-reveal pattern | https://unpkg.com/@mathigon/studio/package.json |
| **Manim (Community)** | v0.21 docs | MIT (both 3b1b and community editions) | Offline render → MP4/WebM/GIF embedded as `<video>` | Explainer clips for hard topics (completing the square, circle theorems) | https://github.com/ManimCommunity/manim ; https://docs.manim.community/en/stable/ (licence via search snippet of the LICENSE file) |
| **Motion Canvas** | — | MIT | TS generator-based animations + editor; ships a custom element/player for the browser; voice-over sync | Animated worked examples that stay vector/crisp and themeable | https://github.com/motion-canvas/motion-canvas |
| **Motion** (ex-Framer Motion) | 13.1.1 | MIT | Yes; `MotionConfig reducedMotion="user"` | All micro-interactions and layout transitions | https://unpkg.com/motion/package.json ; https://motion.dev/docs/react-accessibility |
| **GSAP** | — | "Standard 'No Charge' GSAP License": free incl. commercial, all former club plugins (SplitText, MorphSVG…); restriction: not for no-code animation builders competing with Webflow; AI-generated GSAP code explicitly allowed | Yes | Scroll choreography for the marketing/landing page only | https://gsap.com/licensing/ |
| **auto-animate** | 0.10.0 | MIT | Yes | List reorders (review queue, mastery lists) | https://unpkg.com/@formkit/auto-animate/package.json |
| **canvas-confetti** | 1.9.4 | ISC | Yes | Reserve for unit-mastery / exam-ready milestones only | https://unpkg.com/canvas-confetti/package.json |
| **ts-fsrs** | 5.4.2 | MIT | Yes | Scheduling engine for prompts | https://unpkg.com/ts-fsrs/package.json |
| **Radix UI** | 1.6.7 | MIT | Yes | Primitives (dialog, popover, tabs, slider) | https://unpkg.com/radix-ui/package.json |
| **React Aria Components** | 1.21.0 | Apache-2.0 | Yes | Alternative accessible primitives (Adobe) | https://unpkg.com/react-aria-components/package.json |
| **Tailwind CSS** | 4.3.3 | MIT | Yes | Styling | https://unpkg.com/tailwindcss/package.json |
| **shadcn/ui** | — | MIT | Copy-in components | Good baseline, then de-genericise | https://raw.githubusercontent.com/shadcn-ui/ui/main/LICENSE.md |
| **Anki** | — | AGPL-3.0-or-later | **Do not embed** (network copyleft) | Study its UX only | https://raw.githubusercontent.com/ankitects/anki/main/LICENSE |
| **Orbit** | — | Apache-2.0 (libs) / AGPL-3.0+ or BUSL-1.1 (app, backend) | Libs yes; avoid app/backend | Prompt-in-prose reference | https://github.com/andymatuschak/orbit |

---

## 7. Design principles for an award-worthy but *serious* GCSE study platform

Each principle names the source it is derived from.

1. **Do-something-every-minute.** No screen of notes longer than ~150 words without an interaction (Brilliant "no videos, everything is interactive"; Execute Program "primarily code examples"; Mathigon step-reveal; Quantum Country in-text prompts).
2. **Truthful feedback, warm tone.** Wrong answers change the diagram (Brilliant) and speak like a tutor (Mathigon `hints.yaml`), never a bare "Wrong" (Sparx complaint). Second miss → hint; third → worked step, then re-ask a *variant*.
3. **Mastery, not XP.** Four states with decay (Khan Familiar/Proficient/Mastered); headline stat = "spec points at Proficient+"; unit tests can promote in bulk; mixed tests can demote. No hearts, no leagues (Duolingo critique; Sparx opt-out precedent).
4. **Consistency streak measured in weeks, with slack.** Weekly streak + one free "freeze" per half-term (Duolingo streak-freeze evidence: slack "can actually be more motivating than … rigid rules").
5. **Reviews are the product's heartbeat.** FSRS (ts-fsrs) with exam-date targeting (RemNote exam scheduler), 90% desired retention default; home page opens on "Due today: 14 · ~9 min" and nothing else competing (Execute Program's review-first UI).
6. **Prompts live in the notes.** Every prompt is authored next to its explanation and is focused/precise/consistent/tractable/effortful (Matuschak); first prompts in each topic are trivially easy to teach the interface (Quantum Country).
7. **Monochrome + one accent, one type family.** Off-white ground, near-black ink, one accent used only for "the thing to do next" (Geist/Linear/Stripe). Suggest Inter (OFL) for UI with `tnum`, KaTeX fonts for maths, STIX Two Text for long-form notes if a serif is wanted.
8. **Themes from three variables in LCH** (Linear): base, accent, contrast → light, dark and high-contrast for free. Light is default (exam papers are light).
9. **Motion: 150–300 ms, transform/opacity only, intentional, optional** (Apple HIG; WCAG 2.3.3; Motion `reducedMotion="user"`). Layout changes animate with auto-animate; nothing moves on scroll inside the study surface.
10. **Celebrate rarely and proportionately (FEAT).** Tick + subtle scale on each correct answer; a full-screen moment only for: first Proficient in a unit, unit Mastered, "exam-ready" for a paper. Confetti at most a few times a term.
11. **Bento only on the dashboard, never in lessons.** 4-col bento with a 2×2 "Due now" tile, 2×1 "Mastery by unit", 1×1 weekly streak, 1×1 next exam countdown; ≤ 8 tiles; 16 px gap/radius.
12. **Touch-first WCAG 2.2.** 24 px minimum targets (44 px on answer buttons), non-drag alternatives for every manipulative (2.5.7), magic-link login (3.3.8), focus never hidden behind sticky bars (2.4.11), colour never the only signal.
13. **Dyslexia-aware text defaults** (GOV.UK): left-aligned, ~65–75 character measure, no italics for emphasis, no all-caps headings, diagrams beside text, user-adjustable contrast/spacing.
14. **Accessible maths by default.** KaTeX `htmlAndMathml` everywhere; MathJax speech/explorer for the "read aloud" mode; any graph has a text description and, ideally, a sonified trace (Desmos bar).
15. **Show the learner their own data honestly.** Forgetting curves, predicted retention at exam date, time-to-mastery per unit (Quantum Country's "memory is a choice"; Khan's proficiency evidence). Never show a public leaderboard.
16. **Earn the polish where the teen actually looks:** the answer button, the feedback card, the review-complete screen, the mastery chip. Awwwards-level craft (easing, alignment, density) goes there, not into a hero animation.

---

## 8. Component ideas (with the reference that inspired each)

| Component | Behaviour | Inspired by |
|---|---|---|
| `StepRevealNote` | Markdown notes where `??` blanks or `[choice]` blocks gate the next paragraph until answered | Mathigon textbooks |
| `PredictThenPlot` | Learner drags a guess curve/point on a Mafs canvas, then the true graph animates in with a residual highlight | Brilliant prediction tasks; Desmos Classroom "elicit thinking" |
| `WorkedExampleAsQuestion` | Each step of a worked solution is a MathLive input; a wrong step reveals only that step's fix | Execute Program; Sparx bookwork |
| `MasteryChip` | Not started / Familiar / Proficient / Mastered with decay indicator and last-evidence date | Khan Academy |
| `ReviewInbox` | Home-page module: due count, minutes estimate, single CTA; empty state says "come back tomorrow" | Execute Program; Quantum Country |
| `InlinePrompt` | Q/A prompt rendered inside the notes with reveal, Again/Good/Easy, scheduled by ts-fsrs | Quantum Country / Orbit; RemNote |
| `ExamDateScheduler` | Sets desired retention curve to peak at the CCEA paper date | RemNote exam scheduler |
| `EncouragementCard` | Appears after two misses: hint, "you've got 3 of the 4 steps", option to see a worked variant | ustwo/Brilliant "moments of encouragement" |
| `WeeklyStreak` | 12-week strip; freeze token; no daily nag | Duolingo streak + freeze, adapted |
| `MilestoneMoment` | Full-bleed, 1.2 s, reduced-motion-safe celebration; confetti only for Mastered/Exam-ready | FEAT framework; Apple HIG |
| `ThemeEngine` | LCH tokens from base/accent/contrast; light default, dark, high-contrast | Linear |
| `DashboardBento` | 4-col grid, ≤ 8 tiles, 16 px gap/radius | Apple/bento guidance |
| `MathA11yToggle` | Switch KaTeX visual → MathJax explorer/speech for a passage | MathJax 4 a11y |
| `ManipulativeWithTapFallback` | Algebra tiles / balance scale (JSXGraph or Polypad iframe) with tap-to-place alternative to drag | WCAG 2.5.7; Polypad |
| `ExplainerClip` | Pre-rendered Manim/Motion Canvas WebM, captions, transcript, ≤ 60 s | 3Blue1Brown-style |

---

## 9. Gaps in the market (from this research)

- No UK GCSE product combines Brilliant-grade interaction with Khan-grade mastery states and Quantum-Country-style in-text spaced repetition; Seneca has spacing but low-density cartoon UI, Sparx has adaptivity but is homework-only and XP-driven.
- No mainstream study tool exposes forgetting-curve / exam-date retention forecasts to the *student*.
- Accessibility of maths content (speech, braille, sonified graphs) is strong in Desmos but nearly absent in UK revision products.
- Design-award-level craft is applied to edtech *marketing sites*, not to the daily learning surface.
- CCEA-specific: none of the reviewed products are CCEA-native in their design language (A*–G grade bands, M1–M8 unit structure) — an opportunity for a mastery map keyed to CCEA unit and grade descriptors.

## 10. Open questions

1. Desmos API commercial terms could not be read (client-rendered page); confirm by email before relying on it, or standardise on Mafs + JSXGraph.
2. GeoGebra: is the intended product non-commercial (personal use) or will it ever charge? That single answer decides whether GeoGebra can be used at all.
3. Polypad embedding terms are unspecified on the API page; ask Amplify.
4. MathJax 4 final release status/version on npm (npm returned 403; `mathjax-full` manifest shows 3.2.2) — confirm the v4 package name before adopting the a11y explorer.
5. Which CCEA-authored content (past papers, mark schemes) may be reproduced in-app — a licensing question outside this dimension.
6. Whether a 16-year-old prefers light or dark by default should be validated with the actual user; the exam-paper argument favours light.

---

## Appendix A — All URLs fetched or cited

Awwwards: https://www.awwwards.com/websites/culture-education/ · https://www.awwwards.com/websites/culture-education-science/ · https://www.awwwards.com/sites/design-education-series-r · https://www.awwwards.com/sites/d2c-life-science · https://www.awwwards.com/sites/made-with-gsap-1 · https://www.awwwards.com/sites/skillex-online-education · https://www.awwwards.com/sites/papumba-educational-app · https://www.awwwards.com/sites/lionheart-education · https://www.awwwards.com/sites/glean-education · https://www.awwwards.com/sites/peak-education-1
Brilliant: https://brilliant.org/llms.txt · https://ustwo.com/work/brilliant/ · https://beginnersinai.org/brilliant-explained/ · https://screensdesign.com/showcase/brilliant-learn-by-doing (unavailable)
Duolingo: https://blog.duolingo.com/how-duolingo-streak-builds-habit/ · https://blog.duolingo.com/new-duolingo-home-screen-design · https://uxdesign.cc/the-good-the-bad-and-the-ugly-of-duolingo-gamification-3a12f0e80dc7 · https://theeconomyofmeaning.com/2025/08/25/a-critical-look-at-how-to-make-learning-as-addictive-as-social-media-a-ted-talk-about-duolingo/ · https://www.tandfonline.com/doi/full/10.1080/09588221.2021.1933540 · https://www.monotype.com/resources/duolingo-custom-font-inspired-their-owl-mascot-duo
Khan: https://blog.khanacademy.org/why-khan-academy-will-be-using-skills-to-proficient-to-measure-learning-outcomes/ · https://support.khanacademy.org/hc/en-us/articles/5548760867853--How-do-Khan-Academy-s-Mastery-levels-work
Mathigon/Polypad: https://mathigon.org/press · https://mathigon.org/faqs · https://github.com/mathigon/textbooks · https://polypad.amplify.com/p/api · https://unpkg.com/@mathigon/studio/package.json · https://unpkg.com/@mathigon/euclid/package.json
Desmos: https://www.desmos.com/api · https://www.desmos.com/api/v1.12/docs/index.html · https://www.desmos.com/api-terms (unreadable) · https://www.desmos.com/my-api (unreadable) · https://www.desmos.com/terms · https://help.desmos.com/hc/en-us/articles/23421565218573-Amplify-Classroom-formerly-Desmos-Classroom-now-a-part-of-Amplify
GeoGebra: https://www.geogebra.org/license · https://geogebra.github.io/docs/reference/en/GeoGebra_Apps_Embedding/
Seneca: https://help.senecalearning.com/en/articles/2483299-is-seneca-more-effective-than-other-revision-resources · https://senecalearning.com/en-gb/
Sparx: https://support.sparxmaths.com/en/articles/342284-how-does-sparx-personalise-homework · https://support.sparxmaths.com/en/articles/342328-student-rewards-and-recognition · https://www.thinkingineducating.com/why-sparx-maths-triggers-frustration-among-students-and-what-could-make-it-better/
Matuschak: https://numinous.productions/ttft/ · https://andymatuschak.org/prompts/ · https://quantum.country/ · https://github.com/andymatuschak/orbit · https://withorbit.com/ (error page)
Execute Program: https://www.executeprogram.com/spaced-repetition · https://www.executeprogram.com/why-ep · https://mike.place/2020/executeprogram/ · https://code.brettchalupa.com/execute-program-review
Anki/RemNote/FSRS: https://raw.githubusercontent.com/ankitects/anki/main/LICENSE · https://docs.ankiweb.net/deck-options.html · https://www.remnote.com/feature/spaced-repetition · https://unpkg.com/ts-fsrs/package.json
Polish: https://vercel.com/geist/introduction · https://vercel.com/font · https://unpkg.com/geist/package.json · https://linear.app/blog/how-we-redesigned-the-linear-ui · https://www.pixeldarts.com/en/post/four-design-principles-behind-stripe-linear-and-vercel · https://www.bram.us/2021/10/13/how-to-create-the-stripe-website-gradient-effect/ · https://developer.apple.com/design/human-interface-guidelines/motion · https://senorit.de/en/blog/bento-grid-design-trend-2025 · https://www.nngroup.com/articles/microinteractions/ · https://uxplanet.org/why-confetti-celebrations-backfire-and-how-to-make-them-work-be838a6e7b8b · https://uxdesign.cc/the-over-confetti-ing-of-digital-experiences-af523745db19 · https://rsms.me/inter/
Accessibility: https://www.w3.org/WAI/standards-guidelines/wcag/new-in-22/ · https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html · https://www.w3.org/WAI/WCAG22/Understanding/animation-from-interactions.html · https://accessibility.blog.gov.uk/2016/09/02/dos-and-donts-on-designing-for-accessibility/ · https://motion.dev/docs/react-accessibility
Maths typography/input: https://unpkg.com/katex/package.json · https://katex.org/docs/options.html · https://katex.org/docs/font.html · https://unpkg.com/mathjax-full/package.json · https://docs.mathjax.org/en/latest/basic/accessibility.html · https://www.stixfonts.org/ · https://unpkg.com/mathlive/package.json · https://mathlive.io/
Graphing/animation libs: https://unpkg.com/mafs/package.json · https://mafs.dev/ · https://github.com/stevenpetryk/mafs · https://unpkg.com/jsxgraph/package.json · https://jsxgraph.org/wp/index.html · https://github.com/jsxgraph/jsxgraph · https://unpkg.com/function-plot/package.json · https://unpkg.com/@observablehq/plot/package.json · https://github.com/ManimCommunity/manim · https://github.com/motion-canvas/motion-canvas · https://unpkg.com/motion/package.json · https://gsap.com/licensing/ · https://unpkg.com/@formkit/auto-animate/package.json · https://unpkg.com/canvas-confetti/package.json · https://unpkg.com/radix-ui/package.json · https://unpkg.com/react-aria-components/package.json · https://unpkg.com/tailwindcss/package.json · https://raw.githubusercontent.com/shadcn-ui/ui/main/LICENSE.md
