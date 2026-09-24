# Enrichment dossier — log-log-graphs

**CCEA** GCSE Further Mathematics (2017), **FM1** Unit 1, area Logarithms · statement **FM1-LOG-02** · difficulty 3 · calculator paper
**CCEA statement:** solve problems using: the laws of logarithms; and log/log graphs in context
**CCEA Teacher Guidance:** excluding the change of base rule. Students will be required to draw log/log graphs from a table of data. The resulting graph will be a straight line.
**Formula sheet (Unit 1):** if aˣ = n then x = logₐ n. **The relationship log y = n log x + log k is NOT given.**
**Prerequisites in our taxonomy:** `laws-of-logarithms`, `maths:straight-line-graphs`, `maths:gradient-of-a-line`
**Compiled** 19 September 2026 · 22 minutes (crosswalk already written; examiner evidence unusually rich)
**Headline** This topic is `ccea-only`: log/log graphs appear in **no** AQA 8365, OCR 6993 or Edexcel 4PM1 statement. The technique exists in the wider world only as the A level / physics move called **reduction to linear form** or **linearising a power law**, and the two best free treatments of it — Isaac Science's *Log Plots* concept page and Save My Exams' CIE O Level Additional Maths *Transforming Relationships to Linear Form* note — are both pitched at or above A level and both generalise to y = kaˣ, which CCEA excludes. So: take the **structure** of their explanation, cut the generalisation, and build the lesson around the six years of CCEA examiner evidence, which is the richest we hold for any Further Maths topic and which names the same four slips over and over.

---

## 1. Crosswalk

| CCEA | AQA 8365 (L2) | OCR 6993 (L3) | Edexcel 4PM1 (L2 IGCSE) | Confidence | Status |
|---|---|---|---|---|---|
| FM1-LOG-02, the log/log graph half | **unmatched — AQA 8365 carries no logarithms at all** (zero hits for "logarithm" in the specification) | *Exponentials and Logarithms* carries the log laws this depends on, but does not apply them to a log/log graph | §1B carries the laws and change of base, but no graphical application | high | **ccea-only** |

The log **laws** the technique depends on are matched (see `laws-of-logarithms`); the **graphical application** is not. Expect no ready-made resource at this level, and expect anything you find to be teaching y = kaˣ alongside y = kxⁿ.

**What this means for the author.** Two things. First, the Sheet can claim exclusivity here truthfully. Second, there is nothing to copy even if we wanted to — this lesson has to be built from CCEA's own papers and our own figures, and the enrichment below is about *how to explain it*, not what to say.

---

## 2. Teaching angles worth recreating (in our own words)

1. **Name the move before doing it: "make it straight, then read it."** *Isaac Science, "Log Plots: Using Logarithms to Linearise Data" (`isaacscience.org/concepts/cm_log_plots`).* Isaac's framing is that a curve carries its information awkwardly, so we deliberately change the axes until it becomes a straight line, because a straight line has only two numbers in it — a gradient and an intercept — and those two numbers *are* the answer. Say that at the top of the lesson. Everything afterwards is then a consequence rather than a recipe.

2. **Derive log y = n log x + log k in three lines, in front of her, and leave it on screen.** *Standard in every reduction-to-linear-form treatment; Save My Exams' CIE Additional Maths note "Transforming relationships to linear form" does it this way.* Start from y = kxⁿ, take logs of both sides, use the product law, then the power law:
   - log y = log(kxⁿ)
   - log y = log k + log xⁿ
   - log y = **n** log x + **log k**
   Then set it beside y = mx + c and draw the two correspondences with arrows: **gradient = n**, **intercept = log k**. The derivation is three uses of the laws she has just learnt, so it doubles as retrieval for `laws-of-logarithms`, and it is the only defence against the recurring "gave log a instead of a" slip — if the intercept is visibly *log k*, then k must be un-logged.

3. **k = 10^(intercept). Make the un-logging a numbered step with its own line of working.** *This is the single most repeated CCEA finding on this topic — Summer 2018 "many gave log A instead of A", Summer 2019 "a found as log a", Summer 2022 "leaving log a".* Every method we publish must have step 5 written as its own step: *the intercept is log k, so k = 10^(intercept)*. Never fold it into step 4.

4. **The gradient is Δ(log y) / Δ(log x), and it is easy to invert.** *CCEA Summer 2022 and Summer 2024 both record candidates inverting the gradient.* Borrow the physics-lab habit from the Pomona and PPLATO log-log treatments: mark two points on the drawn line that are **far apart and on gridline intersections**, write the subtraction the right way up as a labelled fraction, and state the units-free check — if log y increases as log x increases, n is positive.

5. **Three decimal places is a mark.** *CCEA Summer 2022 "marks lost for log values not to 3 d.p."; Summer 2025 "rounding to 2 d.p. instead of 3".* No external resource will tell her this, because no other board sets the question. Put it in the method, in the table's column headings, and in the worked example.

6. **Check the answer against the data range.** *CCEA Summer 2019 "answers not checked against the data range"; Summer 2023 "a result outside the given data range should signal an error".* This is a genuine transferable habit — it is interpolation versus extrapolation, which she already meets in GCSE S6 — and it converts a lucky answer into a checked one. Frame it as: the line was fitted to the data you were given; a prediction outside that range is a guess.

7. **Round the context, not the number.** *CCEA Summer 2024: "rounding a context answer down instead of up".* If the answer is "how many whole units are needed", the arithmetic rounds one way and the context the other. One sentence, one gate.

---

## 3. The representation to rebuild as our own SVG

**Hero figure: the two-panel transformation.** `viewBox` about `0 0 1000 460`, two panels side by side sharing a caption, with a single arrow between them labelled "take logs of both axes".

- **Left panel — the raw data.** Axes `x` and `y`, the plotted points from the table, and a smooth **curve** through them (a power curve, visibly not straight). Caption: *y = kxⁿ — two unknowns, and no obvious way to read either off this.*
- **Right panel — the log/log plot.** Axes labelled **`log x`** and **`log y`** (the labels are themselves an examiner finding: Summer 2019 "log r put on the wrong axis", Summer 2022 and Summer 2025 "axes unlabelled"). The same data, now **straight**, with each point drawn as a small **circled** dot (Summer 2019: "points should be circled"). A ruled line of best fit through them, extended to meet the vertical axis.
- **On the right panel, three annotations**, which are the whole method:
  - a right-angled triangle on the line with its horizontal and vertical legs labelled with their actual values and the fraction written out — `n = Δ(log y) / Δ(log x)`;
  - the intercept marked with a short horizontal tick and labelled **`log k`**, not `k`;
  - a boxed conclusion under the panel: *gradient = n = …, intercept = log k = …, so k = 10^… = …*
- **Generator parameters:** `k`, `n` (the generator computes the table, the logs to 3 d.p., both sets of plotted points and the exact line, so no number is ever typed twice); `showTriangle: boolean`; `labelAxes: "full" | "blank"` (the blank version is a find-the-mistake item aimed at the unlabelled-axes finding); `points: number`; `decimals: 3`.
- Line and curve distinguished by **dash pattern plus an end label**, never colour; `<title>` naming both panels and saying the right-hand one is straight.

**Second figure: the table, as the exam prints it.** A three-row table generator — `x`, `y`, then `log x` and `log y` to 3 d.p. — with the two log rows blank in the gated version. Trivial to draw and it is where half the marks are, because the table is what the paper actually asks her to complete first.

**Third, small: the mistake gallery.** Four miniature right-hand panels, each with exactly one thing wrong: axes labelled `x` and `y` instead of `log x` and `log y`; the gradient triangle drawn with the legs the wrong way up; the intercept read as `k`; a prediction marked well outside the plotted range. Each is a ready-made find-the-mistake item and each corresponds to a named CCEA finding.

---

## 4. Practical variants — not applicable; the equivalent is plotting discipline

There is no practical, but there is a set of drawing demands CCEA marks explicitly and no other board's resource will mention:

- **Scales.** Summer 2018 records "inappropriate scales". The log values are small and close together, so a scale chosen for the raw data ruins the plot. Make choosing the scale a step with its reason: look at the *range of the log values*, not the range of y.
- **Circled points**, labelled axes, values to 3 d.p., a ruled line.
- Our own `points-line` answer kind marks plotted points within an absolute tolerance and can require the line; use half a small square, as the house rule says, and make the line its own scored element.

---

## 5. Question types the other boards use that CCEA also rewards

CCEA sets this as a **single long structured question**, once per paper, worth roughly 10–12 marks, and the parts come in the same order every year (2018 Q11, 2019 Q10, 2022 Q12, 2023 Q13, 2024 Q12, 2025 Q10 in our own evidence). The shape to author:

1. **Complete the table of log values [2].** One mark for the row, one for 3 d.p. throughout.
2. **Plot the points and draw the line of best fit [3].** Marks for scale, for the points within tolerance, for a ruled line. Circled points and labelled axes are where marks leak.
3. **Use the graph to find n and k [3–4].** Gradient from the triangle for n; intercept for log k; **then the un-logging**, which is its own mark.
4. **Write down the relationship [1].** She must produce `y = kxⁿ` with her own numbers in it, not leave it as a log equation. Summer 2018: "log values wrongly substituted into the exponential equation."
5. **Use the relationship to predict a value [2].** Then the range check, and the context rounding.

The nearest external question shape is a physics-practical "plot a log-log graph and find the power" item (Isaac and the Pomona lab notes both set them), which is worth reading for the *wording* of the prediction and range-check parts.

---

## 6. Misconception framings worth borrowing

| Misconception | The framing that fixes it | Evidence |
|---|---|---|
| The intercept is k | The intercept is **log k**, because that is what the derivation put there. So k = 10^(intercept), as its own step | CCEA S2018, S2019, S2022 (three separate years) |
| The gradient is inverted | Write the fraction with Δ(log y) on top, out loud, before dividing; mark the triangle on the figure | CCEA S2022, S2024 |
| log x and log y on the wrong axes | The axes are labelled `log x` and `log y`, and the labels are worth a mark. Label them before plotting anything | CCEA S2019, S2022, S2025 |
| Rounding log values to 2 d.p. | Three decimal places, in the table and on the plot | CCEA S2022, S2025 |
| A prediction outside the data range is fine | The line was fitted to the data you were given. Outside it you are guessing, and an answer far outside should make you check for an error | CCEA S2019, S2023 |
| k and the other constant swapped | Name the letters at the start and keep them: gradient → power, intercept → coefficient | CCEA S2025 ("k and v swapped") |
| Rounding a context answer down | Ask what the answer is *for* before rounding | CCEA S2024 |

Two of these — the intercept and the inverted gradient — are named in **more than half the series we hold**. They should carry the insight card, the find-the-mistake items and the closing retrieval prompt.

---

## 7. Photographs, videos and simulations

**Photographs: none appropriate.** This is an algebraic and graphical technique; a photograph would be decoration, which the house rules forbid. Do not reach for a "scientist at a graph" image.

**Videos already held** (`data/links/media-map.json` key `further-maths:log-log-graphs`): Corbettmaths `KvipqSYQrmA`. One video only, and it is worth saying in the `why` line that this is a CCEA-specific technique with little video coverage — that is honest and it is also the argument for our own lesson.

**Simulation already held:** PhET *Curve Fitting* (`phet.colorado.edu/sims/html/curve-fitting/latest/curve-fitting_en.html`). Useful but **not** a model of this technique: it fits polynomials to points and shows residuals, so it teaches line-of-best-fit judgement, not linearisation. Write the task accordingly — "place points that lie close to a straight line, then see how the fitted line's gradient and intercept respond when you move one point" — and do not imply it plots log axes, because it does not.

**Worth linking, not embedding:** Isaac Science's *Log Plots* concept page is free, accurate and at the right conceptual level even though it is aimed higher; it is a legitimate outbound "read more" link, with the usual caution that its worked examples generalise beyond CCEA.

---

## 8. Scope note

**Beyond CCEA — mark `notonspec` if it appears:**
- **the change of base rule** (CCEA Teacher Guidance excludes it in terms; 4PM1 §1B and every A level resource include it)
- **semi-log graphs and y = kaˣ** — the other half of every external treatment of linearisation. CCEA's guidance says the resulting graph will be a straight line from a **log/log** plot of a power law only
- natural logarithms and e
- least-squares regression, correlation coefficients, residuals
- logarithmic scales on graph paper (log-ruled paper); CCEA gives ordinary paper and a table of computed log values

**CCEA-only:** the whole topic, as established in §1. Also specifically CCEA's marking of the **3 d.p. table**, the **circled points**, the **labelled log axes** and the **range check**, none of which any external resource mentions.

---

## 9. Sources consulted

- `data/enrichment/crosswalk.json` → `further-maths:log-log-graphs` (status `ccea-only`, high confidence), and the three comparison specifications behind it: AQA 8365 (no logarithms at all), OCR 6993 *Exponentials and Logarithms*, Edexcel 4PM1 §1B
- Isaac Science, "Log Plots: Using Logarithms to Linearise Data" (`isaacscience.org/concepts/cm_log_plots`) — the make-it-straight framing and the two-numbers argument
- Save My Exams, CIE O Level Additional Mathematics revision note "Transforming Relationships to Linear Form" — the three-line derivation and its side-by-side comparison with y = mx + c
- PPLATO (Brock University) *Log-Log Plots* and the Pomona College *Power-law fitting and log-log graphs* lab notes — the gradient-triangle and far-apart-points habits
- `data/spec/further-mathematics.json` → `log-log-graphs`: statement FM1-LOG-02 with its Teacher Guidance, `mustMemorise`, `onFormulaSheet`, and **six** `examinerEvidence` entries (Summer 2018 Q11, 2019 Q10, 2022 Q12, 2023 Q13, 2024 Q12, 2025 Q10)
- `data/links/media-map.json` key `further-maths:log-log-graphs`
