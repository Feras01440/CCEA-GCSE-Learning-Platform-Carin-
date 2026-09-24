# Enrichment dossier — p2-lenses-focal-length

**CCEA** Double Award Science, **P2** §2.2 Light · outcomes 2.2.7, 2.2.8 · tier **F** · difficulty 3 · no prescribed practical
**CCEA must-recall:** a **converging (convex)** lens brings parallel rays to a focus; a **diverging (concave)** lens spreads them out. **Focal length** = the distance from the centre of a converging lens to the **principal focus**. Measure it by **focusing a distant object on a screen** and measuring the lens-to-screen distance.
**Leads to:** `p2-lens-ray-diagrams`
**Compiled** 20 September 2026 · 26 minutes
**Headline** `ccea-only` against combined science: **"focal" returns one hit in AQA Physics 8463 §4.6.2.5 and zero in AQA 8464 Trilogy and Edexcel 1SC0.** Lenses are separate-science content on both other boards, so everything she can find was written for Triple Science. The compensation is that this topic is the easy half of the lens pair and has **no recorded examiner evidence** — the failures all land next door, in `p2-lens-ray-diagrams`. Its job is therefore to make F and the focal length *secure objects* before ray construction begins, because that dossier's headline is that candidates lose marks by not marking F at all.

---

## 1. Crosswalk

| CCEA | AQA | Edexcel | Confidence | Status |
|---|---|---|---|---|
| 2.2.7 — converging and diverging lenses and what each does to parallel rays | **not in 8464 Trilogy.** **AQA Physics 8463 §4.6.2.5** *Lenses (physics only)* — "a lens forms an image by refracting light. In a convex lens, parallel rays of light are brought to a focus at the principal focus" | **not in 1SC0.** Edexcel covers lenses in separate **Physics 1PH0**, Topic 6 (statement number **not verified** this session) | high for the absences; **medium** for the 1PH0 reference | **ccea-only** against combined science |
| 2.2.8 — focal length, and measuring it with a distant object | **8463 §4.6.2.5** names the focal length; its suggested activity is "investigate the magnification produced by a range of convex lenses" | as above | high | **ccea-only** |

**Scope deltas.** AQA 8463 adds **ray diagrams for concave lenses**, the **magnification equation** (image height ÷ object height, on its equation sheet) and the real/virtual classification. CCEA needs converging *and* diverging lenses named here, but only the **converging** ray diagrams next door, and **no magnification calculation at all**.

**Consequence for the author.** Every video and note she can reach is labelled "physics only" or "Triple". Say so once, plainly, and turn it into the Sheet's point: this is content most GCSE students in England never meet.

---

## 2. Teaching angles worth recreating (in our own words)

1. **A lens is a prism problem solved smoothly.** *Follows from AQA 8463's own sentence, "a lens forms an image by refracting light", and from CCEA's own `p2-refraction-and-dispersion`, which she has already met.* The middle of a converging lens is nearly parallel-sided, so light passes almost straight through; the edges are wedge-shaped, like prisms, and bend light inwards — more steeply the further from the axis. That is why all the parallel rays arrive at one point. Presenting the lens as refraction she already understands, rather than as a new device, is the single best economy available here.

2. **Converging and diverging, by what they do rather than by their shape.** *CCEA names both pairs of words — converging/convex, diverging/concave — and the functional name is the useful one.* Parallel rays in: a converging lens brings them **together**; a diverging lens spreads them **apart**. The shape names are then just a way of remembering which is which — fat in the middle converges. Keeping the functional word first prevents the classic shape-name muddle.

3. **The principal focus is a place, and the focal length is a distance to it.** *A distinction worth making explicitly because the two words get used interchangeably.* **F** is the point where parallel rays meet; the **focal length** is the distance from the centre of the lens to F. Marking F on both sides of the lens — because light can arrive from either direction — is the habit that `p2-lens-ray-diagrams` depends on, and this is the lesson where it should be established.

4. **A fatter lens has a shorter focal length.** *The comparison AQA's suggested activity invites ("a range of convex lenses").* More curvature means more bending, so the rays meet sooner. Giving her two lenses and one relationship is enough, and it makes the focal length a property of *that* lens rather than a universal constant.

5. **Why a distant object: the rays arrive parallel.** *CCEA's stated method, and the reason is the whole of the measurement's validity.* Light from a window across the room arrives at the lens effectively parallel, so it converges at the principal focus — which means the sharp image on the screen sits at exactly one focal length. Without that reasoning the method looks arbitrary; with it, it is a direct measurement of the definition.

6. **A diverging lens has a focal point too, but the rays only seem to come from it.** *Present at one line, because CCEA names diverging lenses but examines no diagram for them.* Parallel rays spread out as if they had come from a point on the near side. One sentence and a small dashed-line sketch; do not develop it, since the ray diagrams next door are converging-only.

---

## 3. The representation to rebuild as our own SVG

**Hero figure: parallel in, focus out — both lenses.** `viewBox` about `0 0 1000 400`, two panels on a shared principal axis.

- **Left panel — converging.** The standard symbol (a vertical line with **outward** arrowheads at both ends), three or five **parallel rays** arriving from the left, each refracting at the lens line and meeting at a single marked point **F** on the axis. A **dimension line** from the lens centre to F labelled **focal length, f**, with its value. A small inset showing the lens's cross-section as a stack of shallow prisms, steeper at the edges, tying back to angle 1.
- **Right panel — diverging.** The symbol with **inward** arrowheads, the same parallel rays arriving, each refracting **outwards**, and **dashed construction lines** projected backwards to meet at a point F on the *incoming* side. Caption: *the rays only appear to come from here.*
- **F marked on both sides of each lens**, since light can arrive from either direction.
- **Generator parameters:** `type: "converging" | "diverging"`, `focalLength`, `rays: number`, `showPrismInset: boolean`, `showDimensionLine: boolean`, `labels: "full" | "blank"`. Ray paths computed from `focalLength`; assert every converging ray passes within a pixel of F.

**Second figure: the distant-object method.** `viewBox` about `0 0 900 320`. A window on the left with a **break symbol** in the axis (to show the distance is large and not to scale), rays arriving at the lens **parallel**, an inverted sharp image on a screen, and a **dimension line from lens to screen labelled "= f"**. A caption band: *a distant object sends rays that arrive parallel, so they meet at the principal focus — the screen distance is the focal length.* Generator: `showBreak: boolean`, `objectDistance: "distant" | number`.

**Third, small: two lenses compared.** Two converging lenses of visibly different thickness on the same axis, each with its own ray bundle and its own F marked, the fatter one's F closer. One caption: *more curved, shorter focal length.*

---

## 4. Practical variants CCEA also examines

No prescribed practical on this outcome, but the measurement is examinable as a written method and is the cheapest optics activity there is:

| Variant | Source | Method | Why it matters |
|---|---|---|---|
| **Distant-object method** | CCEA's own `mustRecall` | focus a window or a distant lamp on a screen; measure lens-to-screen | The examinable method. One measurement, and the reasoning behind it is the mark |
| **Repeat with different lenses** | AQA 8463's suggested activity ("a range of convex lenses") | compare focal lengths | Turns one measurement into a relationship |
| **Illuminated object on an optical bench** | standard on both boards | vary the object distance and find the sharp image | This is `p2-lens-ray-diagrams`' practical; mention it as what comes next |
| **Magnification measurement** | AQA 8463 §4.6.2.5 | image height ÷ object height | **Beyond CCEA** — recognise it in borrowed material and cut it |

**The Unit 7 skills CCEA marks here:** judging when an image is sharpest (and that "sharpest" is a judgement, so repeat it and take a mean), measuring a distance from the **centre** of the lens, and stating why a distant object is used.

---

## 5. Question types the other boards use that CCEA also rewards

1. **"Complete the diagram to show what happens to the parallel rays" [2].** For each lens type. Encode as a `choice` over four computed figures whose distractors are: rays converging at the diverging lens, rays unbent, and rays meeting at the lens rather than at F.
2. **"Label the principal focus and the focal length on the diagram" [2].** A `label` item, and it is the habit `p2-lens-ray-diagrams` needs.
3. **"Describe how you would measure the focal length of a converging lens" [3].** Marks: use a distant object; move the screen until the image is sharp; measure from the centre of the lens to the screen. A fourth mark is available for saying *why* the object must be distant.
4. **"Lens A is fatter than lens B. Which has the shorter focal length? Explain." [2].**
5. **"State one difference between a converging and a diverging lens" [1].** Low tariff, and it wants the functional difference, not the shape.

---

## 6. Misconception framings worth borrowing

| Misconception | The framing that fixes it | Source |
|---|---|---|
| Convex and concave confused | Lead with what they **do** — converge or diverge. The shape name is a mnemonic, not the definition | CCEA names both pairs |
| The focal point is "where the image forms" | It is where **parallel** rays meet. An image forms elsewhere for a near object — which is the whole of the next topic | AQA 8463's wording, "parallel rays of light are brought to a focus" |
| Focal length measured from the screen to the object | From the **centre of the lens** to the sharp image of a distant object | CCEA's stated method |
| Any object will do for the measurement | Only a distant one sends parallel rays. That is why the method works | CCEA's method; the reasoning is the extra mark |
| F exists only on one side | Mark it on both sides; light can arrive from either direction. Needed before ray diagrams | the recorded failure in `p2-lens-ray-diagrams` |
| A diverging lens has no focus | It has one, but the rays only appear to come from it — hence the dashed lines | CCEA names diverging lenses |
| Reaching for the magnification equation | Beyond CCEA. The nature of the image is described in words, never calculated | AQA 8463 §4.6.2.5 |

Our taxonomy records **no examiner evidence** on this topic, so the "In the exam" panel must say only what is true: this is accessible, low-tariff content that appears as the opening part of a lens question whose later parts are the ray diagrams, where the marks are actually lost.

---

## 7. Photographs and simulations

**Photographs.** The pair already verified for `p2-lens-ray-diagrams` serves here too, and the first is the better hook of the two: **`File:Convex lens (magnifying glass) and upside-down image.jpg`** (AntanO, CC BY-SA 4.0) and **`File:Magnifying glass with focus on paper.png`** (Niabot, CC BY-SA 3.0). For this topic the useful prompt on the first is: *the scene is far away, so its light arrives at the lens almost parallel. Roughly where is the image forming, compared with the focal length?* A photograph of **sunlight focused to a bright point** would be the ideal third image; search for one with `pipeline/enrichment/check-commons-licence.mjs`, and if it shows burning, caption it with the obvious safety line rather than as an invitation.

**Simulation already held, and it is well matched:** **PhET *Geometric Optics: Basics***. The focal length is a slider, so the "fatter lens, shorter focal length" relationship becomes something she drags. Task worth authoring: *set the object very far away and note where the image forms; then change the focal length and watch that distance follow it.* That is the distant-object method, run in reverse, and it makes the definition concrete before any ray is constructed by hand.

**Videos already held:** two Freesciencelessons entries. Both are **Triple Science** material, so both will reach concave-lens ray diagrams and the magnification equation. One `notonspec` line covers both, and the `why` line should say plainly that this content is Triple in England and Double Award here.

---

## 8. Scope note

**Beyond CCEA — mark `notonspec` if it appears:**
- **the magnification equation** (image height ÷ object height) — AQA 8463 §4.6.2.5 and on its equation sheet
- **ray diagrams for diverging lenses** — CCEA names diverging lenses but examines no diagram for them
- the **lens equation** `1/f = 1/u + 1/v`, lens power and dioptres
- **real and virtual** as a classification here — that belongs to `p2-lens-ray-diagrams`
- the eye, accommodation, long and short sight; cameras as optical systems
- chromatic and spherical aberration

**CCEA-only against combined science:** the whole topic. AQA confines lenses to Physics 8463 and Edexcel to Physics 1PH0; neither combined-science specification mentions a lens.

---

## 9. Sources consulted

- `data/enrichment/crosswalk.json` → `science:p2-lenses-focal-length` (status `ccea-only`, high confidence)
- AQA GCSE Physics 8463 specification, **§4.6.2.5** *Lenses (physics only)*
- AQA GCSE Combined Science: Trilogy 8464 and Pearson Edexcel Combined Science 1SC0 — searched for "lens" and for "focal" (single word, to defeat line wrapping): **zero hits in both**
- Edexcel separate Physics 1PH0 Topic 6 identified from secondary sources only; **statement number not verified**
- `data/spec/double-award-science-topics.json` → `p2-lenses-focal-length`: outcomes 2.2.7–2.2.8, `mustRecall` (no `examinerEvidence` recorded)
- `data/links/media-map.json` key `science:p2-lenses-focal-length`
