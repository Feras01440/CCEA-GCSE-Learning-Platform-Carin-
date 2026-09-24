# Grid fields audit: TransformationField and PlotField

Review of the two tap-to-draw answer fields against usability, accessibility, tone and the emotional-design principle (docs/plan/emotional-design.md). Review only; no code was changed. Date: 13 Sep 2026.

Files read in full: `src/components/items/TransformationField.tsx`, `src/components/items/PlotField.tsx`, `src/components/items/ui.tsx`, `src/components/items/grid-guides.ts`, `src/lib/marking/plot.ts`, `src/lib/marking/transformation.ts`, `src/lib/marking/points.ts`, `src/lib/ux/haptics.ts`, `app/globals.css`, `docs/plan/emotional-design.md`; plus `src/components/items/AnswerField.tsx`, `FeedbackCard.tsx`, `mark.ts`, `src/components/topic/QuestionRunner.tsx`, `src/components/shell/AppShell.tsx`, `e2e/plot.spec.ts`, `e2e/transformation.spec.ts` for how the fields are mounted, marked and tested.

## How the numbers below were produced

- **Phone geometry.** On a 375 px phone the SVG width is 375 − 32 (`main` `px-4`, AppShell.tsx:8) − 40 (question card `p-5`, QuestionRunner.tsx:63) = **303 px** for a single-part question, and about **267 px** for a multi-part one (the "(a)" gutter and `gap-3`, QuestionRunner.tsx:85–86). PlotField's viewBox is 460 × 324, so its scale is 0.58–0.66; TransformationField's −8…8 grid is 436 × 436, scale 0.61–0.70.
- **Contrast.** From the lch tokens in globals.css, light theme on the white surface: `--line` (L 90) ≈ 1.3:1, `--line-2` (L 84) ≈ 1.5:1, `--ink-3` (L 60) ≈ 3.2:1, `--ink-2` (L 40) ≈ 6.5:1, `--accent` (L 45) ≈ 5.4:1, **`--accent-2` (L 92) ≈ 1.2:1**. Dark theme: `--line` on `--surface` ≈ 1.35:1, `--accent-2` ≈ 1.55:1. High-contrast theme: `--line` ≈ 3.2:1, `--accent-2` ≈ 1.3:1.
- **Reachability.** A scratch script replayed `niceStep`, `axisFor` and `snapTo` from PlotField.tsx over every `graph` part in `packs/*/content` and `public/content` and compared each target with the nearest lattice point against the part's tolerance. The published set was being rebuilt during the review (the cumulative-frequency bundle changed at 13:56), so the figures quoted are from the pack bundles as they stood at the end of the review.

Severity: **must-fix** blocks a learner or breaks a stated rule; **should-fix** materially hurts the experience; **nice** is polish.

---

## 1. Keyboard and screen-reader access

**K1 · must-fix · The line has no non-pointer route.** PlotField.tsx:176–181, 353–363. The two points of a line of best fit / straight-line graph can only be tapped on the SVG, which is `role="img"`, not focusable and has no key handler. The typed input covers the points only. Three parts currently need a placed line (straight-lines M3 main; B1 biological molecules (d); B1 photosynthesis (b)); a keyboard, switch or screen-reader user can never enable Check on them and only sees "then draw the line". *Fix:* when `lineWanted`, render a second labelled text input, "Two points on your line", parsed with `parseVertices` (require exactly two distinct points), mirroring `line` the way `text` mirrors `placed`; keep tap mode as the pointer route. Longer term, make the SVG focusable (`tabIndex={0}`, arrow keys move a cursor one small square, Enter places or lifts, Escape leaves) with a visually hidden live readout.

**K2 · should-fix · Placement, lifting and parse failures are silent to assistive tech.** PlotField.tsx:256–261, TransformationField.tsx:146–147, ui.tsx:169. State is only exposed through the SVG's `aria-label` (a `role="img"` label is not re-announced when it changes) and the StickyBar hint, which is not a live region. A screen-reader user who types "(1, 3), (1, 8)" hears nothing about whether it parsed, and a disabled Check does not say why. *Fix:* make the StickyBar hint `aria-live="polite" aria-atomic="true"` (ui.tsx:169; it only changes on a count or mode change, so it stays quiet), and give the submit button `aria-describedby` pointing at it. Optionally a hidden `<output>` per field: "Placed (1, 3) · 2 of 3", "Lifted (1, 3) · 1 of 3", "Line through (0, 0) and (6, 0)".

**K3 · should-fix · The text box and the submitted vertices can disagree.** TransformationField.tsx:108–121; PlotField.tsx:195–203, 205–214. When the typed text fails to parse, `placed` keeps the last good parse. Sequence: a complete list "(1, 3), (1, 8), (4, 3)" → she deletes the final ")" → text no longer parses → `placed` still has three vertices → Check stays enabled → the field submits the old three, not what she sees. There is also no message that the text was not understood. *Fix:* `const textOk = !text.trim() || parseVertices(text) !== null`; disable submit while `!textOk` and show a 13 px note under the input, "Use (x, y) pairs, e.g. (1, 3), (1, 8)".

**K4 · nice** · "Draw the line" changes both its label and `aria-pressed` (PlotField.tsx:353–363), so a screen reader hears "Back to points, pressed". Keep the label fixed with `aria-pressed`, or change the label and drop `aria-pressed`.

**K5 · nice** · Histogram inputs: visible label "0–10", accessible name "Height of the 0 to 10 bar" (PlotField.tsx:317–327). WCAG 2.5.3 wants the visible text inside the name; `"0–10 bar height"` would do (e2e/plot.spec.ts:56–78 matches the current name and would need the same change).

**K6 · nice** · The SVG labels omit the guide. TransformationField.tsx:147 describes the range, the object and the placed vertices (useful and in the right order) but not the mirror line or centre drawn on the grid; grid-guides.ts already computes a `label` for each guide. Append "mirror line y = x shown" / "centre (2, 2) shown".

**Fine:** typed fallbacks exist and are labelled for vertices ("Vertices of the image"), points ("Plotted points") and every bar ("Height of the … bar", with `aria-describedby` to the instructions); the icon buttons carry names; the histogram is fully completable by keyboard; `:focus-visible` is global and never suppressed on these controls; nothing in the fields animates, so reduced motion has nothing to honour.

---

## 2. Touch ergonomics on a 375 px phone

**T1 · must-fix · Targets are far below finger precision and are committed on `pointerdown`.** PlotField.tsx:156–193; TransformationField.tsx:85–106. On the phone a PlotField small square is **4.6–10.5 px** (per axis, from the replay) and a transformation grid point is **14.7–16.7 px**; both fields commit on the down event and set `touch-none`, so there is no slide-to-correct and no pinch-zoom. A fingertip's reported point is typically 3–8 px from the spot she believes she touched, so on the plot lattice the intended square is hit about half the time, and about one transformation tap in four lands a cell off. Where the tolerance is smaller than a small square (G1) the tap route is a lottery. *Fix:* place on release with drag-to-adjust: `onPointerDown` starts a provisional marker and calls `setPointerCapture`; `onPointerMove` snaps it live and shows a readout above the finger ("(60, 50)" / "0.8"); `onPointerUp` commits and `onPointerCancel` discards. A press that starts on an existing marker moves that marker; releasing it without movement lifts it. The readout doubles as the live region in K2 and makes the finer lattice from G1 usable.

**T2 · should-fix · Accidental lifts, and a third tap that destroys the line.** (a) PlotField.tsx:184–189, TransformationField.tsx:97–102: a tap within half a cell of an existing marker lifts it, with the same haptic as placing, so a tap meant for the neighbouring square silently removes the neighbour. (b) PlotField.tsx:179: in line mode a third tap replaces the whole line with a single new point (`current.length >= 2 ? [[x, y]] : …`), so a stray touch while reaching for Check drops the line and the hint flips back to "tap 1 more for the line". *Fix:* with T1, press-on-marker means "move it" and a lift needs Undo or a deliberate no-move release; once two line points exist, a further tap moves the nearer endpoint (Undo already lifts one).

**T3 · should-fix · The coordinate box is squeezed to 39–75 px when "Draw the line" is present.** PlotField.tsx:337–352. The row is `flex-wrap` but the label is `flex-1 min-w-0` (basis 0), so it never wraps; the fixed siblings (Draw the line ≈ 116 px, Undo 44, Clear 44, three 8 px gaps) leave 39 px at 267 px and 75 px at 303 px for a 17 px input whose placeholder is "e.g. (0, 4), …". *Fix:* `basis-full sm:basis-0 sm:flex-1` on the label (the input takes its own row on phones) and move the mode toggle under the grid or into the sticky bar. TransformationField's row (163–199 px for the input) is acceptable.

**T4 · should-fix · Undo and Clear are two look-alike arrows with no visible text; Clear is irreversible.** TransformationField.tsx:244–249; PlotField.tsx:332–334, 364–385. `Undo2` and `RotateCcw` are both anticlockwise arrows; on a phone there is no hover or tooltip, and `btnQuiet` has no border, so they do not read as buttons beside the field. Clear wipes every vertex, point and the line with no confirmation and cannot be undone. *Fix:* text labels ("Undo", "Clear") with the icons as leading glyphs (`btnQuiet` already styles 14 px text); keep the cleared state so the next Undo restores it, or hide Clear until at least two elements exist. Target sizes are fine: every control carries `.tap` (44 × 44, globals.css:167).

**T5 · nice** · The sticky bar wraps to two or three lines on a phone (Check + "Calculator allowed" + a 40-character hint) and can sit over the lowest grid row (y = −8, or the histogram base line she taps to clear a bar) when the grid is at the bottom of the viewport; the hint is `ink-3` (3.2:1) at 13 px (ui.tsx:165–171). Hide the calculator tag below `sm`, shorten the hint on phones ("3 of 6 · then the line"), and use `ink-2`.

**Fine:** `tap()` respects `pointer: coarse` and reduced motion; `select-none` and `touch-none` stop selection and scroll jitter while drawing; the `max-w` caps stop the grid becoming oversized on tablets; taps in the padding are accepted onto the boundary line, so the edges of the range are reachable.

---

## 3. Clarity of the instructions and the feedback

Against the five questions in the design document's audit table:

| Interaction | What did she just do? | Immediate feedback | She should understand | She should feel | What happens next |
|---|---|---|---|---|---|
| Places a vertex / point | Tapped a grid point | Dot or cross appears, 8 ms tap, count in the bar, text box updates | Where it landed (only if she can read the axis: V2) | Control | Next vertex; Check enables at n |
| Lifts one | Tapped it again | It disappears, same haptic as placing (T2) | That the tap was a lift, not a miss | Control | Re-place |
| Lays the line | Chose Draw the line, tapped twice | Endpoints and an extended line, in a near-invisible tint (V1) | Whether it passes through the points (needs V1) | Confidence | Check |
| Sets a bar | Tapped inside the interval | Bar fills; number appears below | Its height, and whether it is the exact value (G1: often it cannot be) | Trust, currently undermined | Next bar |
| Checks | Pressed Check | Tick, or "Not yet" with expected, diagnosis, marks | Which element is off, but the drawing has vanished (C2) | Momentum or a clear fix | Next part |

**C1 · must-fix · "wrong" appears, against rule 4 ("The word 'Wrong' never appears").** plot.ts:204: `"One bar is wrong: "` / `` `${wrong.length} bars are wrong: ` ``. It is the only judgemental sentence in either marking file. *Rewrite:* "One bar is not at its height yet: the 55–75 bar should reach 0.15, not 0.1. Frequency density is frequency ÷ class width." and "Two bars are not at their heights yet: …".

**C2 · should-fix · The drawing disappears before the feedback that refers to it.** QuestionRunner.tsx:97–101 unmounts `AnswerField` as soon as `result` is set, so "The point at (60, 48) belongs at (60, 50)", "Your line misses (10, 74) by 3.2" and "That is a reflection in the y-axis" are read with no grid on screen. Immediate feedback and "she should understand" both fail: she cannot see which cross is off or what she drew. *Fix:* keep the field mounted with `disabled` (both fields already support it) above the FeedbackCard while `result` is set, and pass the verdict down so the field can outline the expected image or points in dashed `ink-3`. This is a runner change; the fields need nothing.

**C3 · should-fix · "Your line misses (10, 74) by 3.2" gives no direction.** plot.ts:177 (`gapToLine`, 125–129, returns an absolute value). She cannot tell which way to move the line. *Rewrite with the signed gap:* "Your line passes 3.2 below (10, 74). It should go through (0, 0) and (10, 74)." ("to the left/right of" when the line is vertical.)

**C4 · should-fix · The histogram instruction promises what the tap cannot deliver.** PlotField.tsx:238: "Draw the histogram: tap inside each class interval at the height its bar should reach (tap the base line to clear it), or type the heights below." Given G1 (three of five histogram parts have a bar no tap can set), lead with the reliable route until G1 lands. *Rewrite:* "Draw the histogram: type each bar's frequency density below, or tap inside its class interval at the height it should reach. Tap the base line to remove a bar."

**C5 · nice** · transformation.ts:181: "That is a reflection in the line x = 2 of the object, which is not the image asked for here." reads awkwardly and offers no next step; it fires only when the asked-for image is a combined transformation. *Rewrite:* "That is a reflection in the line x = 2. This part needs two transformations in turn: do the first, then apply the second to that image."

**C6 · nice** · transformation.ts:183: "2 of 3 vertices are in the right place. Check the others one at a time." → when one remains, "Check the other one." (pluralise on `total − inPlace`).

**C7 · nice** · plot.ts:161 has a dead ternary (`unnamed.length === 1 ? "Not plotted yet" : "Not plotted yet"`); the sentence itself is fine.

**C8 · nice** · TransformationField.tsx:237: the placeholder is the object's own vertices ("e.g. (3, 1), (8, 1), (3, 4)"). A tired learner reads an example as a hint and types it (the e2e test does exactly this and gets "the object itself, unmoved"). Use a neutral example such as "e.g. (1, 2), (3, 4), (5, 6)". Same for transformation.ts:158.

**Fine:** "That is a reflection in the y-axis. The question asked for a reflection in the line y = x." is the best sentence in the platform: it answers "what did she just do" before saying what was asked. "Tap a vertex again to lift it" and the "Lift the last vertex" button share one verb. Hints are counts, never scores; no celebration copy; the correct lines ("Every vertex of the image is in the right place.", "Every point is plotted correctly.") are one calm sentence each; "On paper, join them with one smooth freehand curve, never straight segments." is exam truth stated plainly. The points instruction (PlotField.tsx:239) is long but every clause is load-bearing.

---

## 4. Visual issues visible in the code

**V1 · must-fix · The mirror line, the centre and the learner's own line are drawn in a background tint.** `--accent-2` is lch(92 % 12 270) (globals.css:24) and is used everywhere else only as a fill (`bg-accent-2`, ExamMap.tsx:17). TransformationField.tsx:185–186 and 207 draw the centre cross and the mirror line in it; PlotField.tsx:301 and 303 draw her line of best fit and its endpoints in it. Contrast ≈ 1.2:1 light, 1.3:1 high-contrast, 1.55:1 dark: the one line she must reflect in, and the line she is being marked on, are close to invisible. *Fix:* mirror line and centre in `--color-ink`, dashed, as the printed papers do; her line in `--color-accent` with a dash pattern distinct from the join (e.g. `strokeDasharray="8 4"`), endpoints `--color-accent` with the surface stroke.

**V2 · must-fix · Axis numbers render at 5.8–7 px on a phone, in 3.2:1 grey.** `fontSize={10}` viewBox units (PlotField.tsx:279, 284; TransformationField.tsx:161, 168) × scale 0.58–0.70, filled `--color-ink-3` (≈ 3.2:1, under the 4.5:1 text minimum). She cannot read where 50 is. *Fix:* `fontSize={14}` in PlotField (PAD_L 44 still holds "1000" at ≈ 32 units with `textAnchor="end"` at 38; the last x label "100" centred at 444 stays inside the 460 width) and `fontSize={13}` with `PAD = 30` in TransformationField; fill `--color-ink-2`. Keep `labelStep = 2` whenever the on-screen cell would be under 16 px.

**V3 · should-fix · Minor grid lines are ≈ 1.16:1 and 0.35–0.4 px thick; majors are ≈ 1.3:1.** PlotField.tsx:266, 269: `--color-line` (L 90) at `strokeWidth 0.6` and `strokeOpacity 0.6`, which after scaling is a sub-pixel ghost; majors (273, 276) are `--color-line` at 1 unit (0.6–0.7 px). The "five small squares to a labelled one" premise depends on seeing them. In the high-contrast theme the hard-coded opacity undoes the theme (3.2:1 → 1.7:1). TransformationField.tsx:152, 155: the whole grid is `--color-line` at 1 unit. *Fix:* minors `--color-line-2` at `strokeWidth 1` with `vectorEffect="non-scaling-stroke"` (a crisp 1 px at any scale) and no `strokeOpacity`; majors `--color-ink-3` (3.2:1) at 1 px non-scaling; axes `--color-ink-2` at 1.5 px. Transformation grid: `--color-line-2`, 1 px non-scaling; axes as now. `shapeRendering="crispEdges"` on the grid lines is worth trying.

**V4 · should-fix · The guide is never labelled, and stems can produce the wrong guides.** grid-guides.ts computes `label` ("y = x", "x = 2", "centre") but neither field renders it. Part (b) stems of the combined-transformations questions restate the whole sequence in a "(So … after a reflection in the line y = −x, followed by …)" parenthetical, so the grid draws a mirror line and a centre for a part that is a single enlargement; with two unlabelled dashed guides she cannot tell which is which. *Fix:* draw the label at the guide's end in 12–13 units `ink-2` italic ("x = 2" beside the top of the line, "y = x" at its upper-right end), and in grid-guides.ts:14 drop a trailing "(So …)" sentence before matching.

**V5 · should-fix · Fixed SVG id `plot-area`.** TransformationField.tsx:206, 211. Two grids on one page (the items gallery; a worked-example twin beside a question) share the id, and `url(#plot-area)` resolves to the first in the DOM, so the second grid's guide lines are clipped to the wrong rectangle. *Fix:* `const clipId = `clip-${useId().replace(/\W/g, "")}``; use it for both the `id` and the `clipPath` reference.

**V6 · nice** · The image outline follows placement order (TransformationField.tsx:128–129, 217–222), so vertices placed in a different order from the object's give a self-crossing polygon for quadrilaterals even though marking is order-free. Order the outline by angle about the centroid (every published object is convex), or draw the outline only once complete.

**V7 · nice** · Histogram input row (PlotField.tsx:315–335): five `w-[104px]` fields wrap two per row on a phone with the Clear button dangling beside the last one. A two-column grid with Clear on its own row reads better; add `step={ya.minor}` so the number spinner nudges one small square (see G1).

**V8 · nice** · A cumulative-frequency `lineThrough` with more than two points is joined with straight segments (`M … L …`, PlotField.tsx:218) while the feedback asks for a smooth curve; use `smoothPath` when the join has more than two points. The `prompt` prop is accepted and unused (PlotField.tsx:107).

**Fine:** axis-label overlap was checked at the current and proposed sizes: y labels end at 38 units with the widest ("1000") ≈ 32 units; x labels sit 80 units apart with "0.2" ≈ 16 units; the origin's two "0"s are 12.5 units apart; the transformation grid's x/y letters clear the numbers. Dark theme fills (object `ink-3` at 0.18, image `accent` at 0.12) remain visible. Placed points and line endpoints differ in shape (cross vs dot), so colour is never the only signal.

---

## 5. Correctness risks in the tap geometry

**G1 · must-fix · The snap lattice is coarser than the marking tolerance, so correct answers cannot be tapped.** `axisFor` (PlotField.tsx:49–58) fixes `minor = major / 5` with `major` from `niceStep(span, 6)` for y, while marking demands `|placed − expected| ≤ tol` (plot.ts:97; 196). Replaying the field's maths over the pack bundles: **5 of 18 maths plot parts contain targets no tap can reach**:

| Part | Lattice (y) | Unreachable target | Nearest snap | Tolerance |
|---|---|---|---|---|
| M4 histograms, `we.…01` (both parts) | 0.1 | 55–75 bar: 0.15 | 0.1 / 0.2 | 0.02 |
| M4 histograms, (a) | 0.2 | 0–10 bar: 0.5; 40–60 bar: 0.35 | 0.6 / 0.4 | 0.02 |
| M7 y = 8/x, (b) | 1 | (5, 1.6) | (5, 2) | 0.25 |
| M8 T = 20 + 60(0.75)^t, (b) | 4 | 6 of 11 samples, e.g. (2, 53.75), (8, 26.01) | 52, 28 | 1 |

She taps the nearest small square, the field shows exactly what she meant, and the feedback says "the 55–75 bar should reach 0.15, not 0.1". That is a trust failure rules 3 and 4 cannot survive, and it will recur for every cumulative-frequency curve (the CF parts published at the start of this review had points such as (20, 5) and (60, 50) on a lattice of 4 with a tolerance of 0.5; that bundle was re-authored during the review). *Fix, in order:* (1) derive the snap step from the data: after `axisFor`, refine `minor` to the coarsest of `major/5`, `major/10`, `major/20` that puts every target (points, `lineThrough`, bar heights) within tolerance of a lattice point; (2) raise the y `niceStep` target from 6 to 10 so the grid matches the printed one (CF papers label 10s, not 20s); (3) add a check to `src/components/items/content-lint.ts` that fails a bundle whose graph targets are not within tolerance of the derived lattice, so authors see it before publish; (4) land T1's drag readout, without which a finer lattice is not usable by finger.

**G2 · should-fix · The histogram bar is chosen from the snapped x, not the touched x.** PlotField.tsx:163, 169. Boundaries such as 25 and 35 are not on the x lattice (minor 2), so a touch up to half a small square inside the 25–35 bar (≈ 3 px on a phone) snaps to 24 and sets the 10–25 bar. *Fix:* pick the bar with the unsnapped x (`xa.lo + ((ux − PAD_L) / PLOT_W) × (xa.hi − xa.lo)`); snap only y.

**G3 · should-fix · Two identical line taps make a "vertical line".** PlotField.tsx:179, 224; plot.ts:126. Tapping the same square twice in line mode yields a degenerate pair that both the field and the marker treat as a vertical line at that x. *Fix:* ignore a second tap on the same snapped point (or treat it as moving the first).

**G4 · nice** · `axisFor` always includes 0 (`Math.min(0, …)`, PlotField.tsx:50), so T = 20 + 60(0.75)^t (values 23–80) spends a third of its height below the data and the lattice coarsens with it. Leave unless the authoring brief allows a non-zero origin; CCEA's own grid for this question starts at 0.

**Fine:** range edges: taps in the padding round or snap onto the boundary and are accepted (TransformationField.tsx:92–94; PlotField.tsx:163–165). Non-integer axes: `round6` and the `1e-9` guards keep 0.1 and 0.04 lattices exact, so 0.30000000000000004 never reaches the text box or the JSON. The `getBoundingClientRect` mapping is linear because the SVG has `w-full` and no CSS height; the 1 px border shifts it by at most 1 px, absorbed by snapping. Guide lines intersect the clip rectangle correctly for vertical (`b = 0`) and sloped lines. Marking is order-free (`sameVertexSet`), greedy point matching takes the nearest unused point, and the transformation library covers every published `asked` transformation (including scale factor −2 about integer centres). Typed points outside the range draw outside the plot area but are clipped by the SVG viewport.

---

## Summary by severity

**Must-fix (6):** K1 no typed route for the line · T1 targets below finger precision, committed on pointerdown · C1 "wrong" in the histogram feedback · V1 guides and her line in the `accent-2` tint · V2 axis numbers 5.8–7 px in 3.2:1 grey · G1 snap lattice coarser than the tolerance (5 of 18 parts have untappable answers).

**Should-fix (13):** K2 silent state changes · K3 stale vertices submitted after a parse failure · T2 accidental lifts and the destructive third tap · T3 squeezed coordinate box · T4 icon-only Undo/Clear, irreversible Clear · C2 drawing unmounted before the feedback · C3 undirected "misses by" · C4 histogram instruction leads with the unreliable route · V3 minor lines at 1.16:1 sub-pixel · V4 unlabelled guides and parenthetical stems · V5 fixed clipPath id · G2 bar chosen from snapped x · G3 degenerate line.

**Nice (12):** K4, K5, K6, T5, C5, C6, C7, C8, V6, V7, V8, G4.
