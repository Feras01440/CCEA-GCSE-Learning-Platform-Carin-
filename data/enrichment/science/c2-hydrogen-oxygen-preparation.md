# Enrichment dossier — c2-hydrogen-oxygen-preparation

**CCEA** Double Award Science, **C2** §2.9 Gas Chemistry · outcomes 2.9.5, 2.9.6, 2.9.7 · tier **F** · difficulty 3 · feeds **Prescribed Practical C6**
**CCEA must-recall:** **hydrogen** — zinc + dilute hydrochloric acid, **collected over water**; colourless, odourless, less dense than air, insoluble; uses: weather balloons, hardening oils, clean fuel. **Oxygen** — hydrogen peroxide with **manganese(IV) oxide** catalyst, collected over water; test: **relights a glowing splint**; uses: medicine, welding. **With oxygen:** carbon → CO₂ (acidic); sulfur → SO₂ (acidic, blue flame); magnesium → MgO (basic, bright white flame); iron → iron oxide (basic, sparks); copper → CuO (basic, black).
**Compiled** 20 September 2026 · 30 minutes
**Headline** **Neither board teaches gas preparation at all.** AQA §5.8.2 and Edexcel CC3.12 / CC8.23 give only the **tests** — squeaky pop, glowing splint, limewater — with no method, no apparatus and no collection technique. So the whole of CCEA's preparation half, including *collecting over water*, is CCEA's own, and our Summer 2024 C2 Foundation evidence is exactly there: **apparatus names (delivery tube, gas jar) and two-dimensional apparatus diagrams were weak**. The second recorded failure is the one this dossier shares with `c2-collision-theory-catalysts`: **MnO₂ as the catalyst for hydrogen peroxide was not recalled**. Teach the apparatus as a drawable object and the catalyst as a named fact.

---

## 1. Crosswalk

| CCEA | AQA 8464 | Edexcel 1SC0 | Confidence | Status |
|---|---|---|---|---|
| 2.9.5, 2.9.6 — **preparing** hydrogen and oxygen; apparatus; collecting over water; properties and uses | **unmatched** — AQA sets no preparation | **unmatched** | high | **ccea-only** |
| the **tests** for hydrogen and oxygen | **§5.8.2.1** *Test for hydrogen* (squeaky pop with a lighted splint); **§5.8.2.2** *Test for oxygen* (relights a glowing splint) | **CC3.12a** (test for hydrogen); **CC8.23** (test for oxygen) | high | **matched** |
| 2.9.7 — reactions of carbon, sulfur, magnesium, iron and copper with oxygen; acidic and basic oxides | **§5.4.1.1** *Metal oxides* covers metals reacting with oxygen; the acidic/basic classification is not set as such | **unmatched** as a set | high | **partial** |

**Scope deltas.** Both boards test for **chlorine** as well (AQA §5.8.2.4), which CCEA does not require here. Edexcel adds **sulfur dioxide and acid rain** (CC8.11, CC8.12), which CCEA covers in `c2-combustion-and-pollution`. Neither board asks for **uses** of hydrogen or oxygen.

---

## 2. Teaching angles worth recreating (in our own words)

1. **Draw the apparatus as three named parts, every time.** *CCEA Summer 2024 C2 Foundation: apparatus names and 2-D diagrams were weak — and no borrowed resource will help, because neither board sets preparation.* The generator is: a **flask or test tube** holding the reactants, a **delivery tube** carrying the gas away, and a **collection vessel** — a gas jar over water, or a gas jar for downward delivery. Naming all three on every diagram, and drawing them in the flat 2-D convention CCEA uses, is the whole of the recorded failure.

2. **Collect over water when the gas is insoluble — say the property that justifies the method.** *CCEA's own wording for both gases.* Hydrogen and oxygen are both **insoluble in water**, so bubbling them up into an inverted gas jar full of water works and the water level shows how much has been collected. The method is a consequence of a property, which means she can choose a collection method for an unfamiliar gas — and CCEA's *next* topic uses the contrast, since carbon dioxide can also be collected by **downward delivery** because it is denser than air.

3. **MnO₂ is the catalyst, and it is named twice in this pack.** *CCEA records it as not recalled here **and** on `c2-collision-theory-catalysts`. Two topics, one fact, same failure.* Manganese(IV) oxide catalyses the decomposition of hydrogen peroxide into water and oxygen. It is not used up, it is not in the equation, and CCEA names it where AQA explicitly says its candidates need no catalyst names. Teach it as one fact taught in two places, cross-referenced, rather than twice from scratch.

4. **The oxide table has a pattern: metals give basic oxides, non-metals give acidic ones.** *CCEA lists five elements with their products and classifications; the pattern is what makes the list learnable.* Carbon and sulfur are non-metals → acidic oxides that dissolve to give acids. Magnesium, iron and copper are metals → basic oxides. Teaching the rule first turns five separate facts into one rule plus five examples, and it links to `c1-metals-and-non-metals` and `c1-neutralisation-and-bases`.

5. **Each reaction has an observation, and the observation is the mark.** *CCEA gives them: sulfur burns with a **blue flame**, magnesium with a **bright white flame**, iron gives **sparks**, copper turns **black**.* These are what a question asks for, and they are what makes the table memorable. Pair every product with what you see.

6. **Both gas tests use a splint, and the difference is whether it is lit.** *AQA §5.8.2.1 and §5.8.2.2; Edexcel CC3.12a and CC8.23.* A **lighted** splint in hydrogen gives a **squeaky pop**; a **glowing** splint in oxygen **relights**. Stating the contrast as one sentence prevents the commonest mix-up, and it is the one half of this topic where borrowed material is accurate.

7. **The uses follow from the properties — again.** *CCEA names them and no other board does.* Hydrogen is **less dense than air** (weather balloons) and burns to give only water (**clean fuel**); oxygen supports life and combustion (**medicine, welding**). One property, one use, every time.

---

## 3. The representation to rebuild as our own SVG

**Hero figure: the preparation bench, parameterised.** `viewBox` about `0 0 940 480`. One apparatus generator serving both gases and, with one more setting, the next topic's carbon dioxide too.

- A **conical flask or side-arm test tube** holding the reactants, labelled with what is in it (*zinc + dilute hydrochloric acid*, or *hydrogen peroxide + manganese(IV) oxide*).
- A **delivery tube** from the stopper, bent down and under the water in a **trough**, rising into an **inverted gas jar** full of water, with the water level part-displaced and **bubbles drawn** rising into it.
- **Every part labelled by name**: flask, stopper, **delivery tube**, trough, **gas jar**, beehive shelf — because the names are the recorded failure.
- A caption stating the reason: *both gases are insoluble in water, so they can be collected over it.*
- **Generator parameters:** `gas: "hydrogen" | "oxygen" | "carbon dioxide"`, `collection: "over-water" | "downward-delivery"`, `labels: "full" | "names-only" | "blank"`, `showReactants: boolean`, `wrongVersion: "tube-above-water" | "jar-upright" | null`. The reactants and the caption derive from `gas`, so one generator covers three topics and the blank version is an instant labelling item.

**Second figure: the two splint tests.** Two small panels side by side. **Left** — a **lighted** splint entering a tube of hydrogen, with a small burst and the label *squeaky pop*. **Right** — a **glowing** splint entering a tube of oxygen, with the glow becoming a flame and the label *relights*. One caption: *lighted splint for hydrogen, glowing splint for oxygen.* Generator: `test: "hydrogen" | "oxygen" | "both"`, `blankResult: boolean`.

**Third figure: the oxide table with observations.** Five rows, four columns — **element · what you see · product · acidic or basic** — filled from CCEA's own list, with the **metal rows grouped** and the **non-metal rows grouped**, and a bracket on each group labelled *metals give basic oxides* and *non-metals give acidic oxides*. **Generator parameters:** `elements: string[]`, `blankColumn: "observation" | "product" | "class" | null`, `groupByType: boolean`. Products and classifications from a fixed table so twins are computed.

---

## 4. Practical variants CCEA also examines

**Prescribed Practical C6** — "investigate the preparation, properties, tests and reactions of the gases hydrogen, oxygen and carbon dioxide" — is tagged to `c2-carbon-dioxide-preparation` but covers all three gases, so this topic is half of it.

| Variant | Source | What changes | Why it matters |
|---|---|---|---|
| **Hydrogen from zinc and dilute HCl** | CCEA's own | collected over water | The named method; the apparatus is the marked object |
| **Oxygen from H₂O₂ with MnO₂** | CCEA's own | a catalyst, not a reactant | The catalyst is the recorded failure, and it links to `c2-collision-theory-catalysts` |
| **Varying the catalyst** | AQA §5.6.1.4 suggests investigating different metal salts on H₂O₂ | rate rather than preparation | A legitimate rate investigation; here it reinforces that MnO₂ is not used up |
| **Burning elements in oxygen gas jars** | CCEA's 2.9.7 | the five elements | Produces the observations that are the marks, and the oxides can then be tested with indicator |

**The Unit 7 demands CCEA marks here:** naming apparatus correctly, drawing it in 2-D section, choosing a collection method and justifying it from a property, and testing the gas with the right splint.

---

## 5. Question types the other boards use that CCEA also rewards

1. **"Name the pieces of apparatus labelled A, B and C" [3].** The recorded failure. A `label` item on our own figure.
2. **"Draw a labelled diagram of the apparatus used to prepare and collect hydrogen" [3].** Marks for a sealed reaction vessel, a delivery tube reaching under the water, and an inverted gas jar. Our `wrongVersion` parameter generates the find-the-mistake twins.
3. **"Explain why the gas can be collected over water" [1].** It is insoluble.
4. **"Name the catalyst used in the preparation of oxygen" [1].** Manganese(IV) oxide — the recorded failure, and set it in both this topic and `c2-collision-theory-catalysts`.
5. **"Describe the test for oxygen and the result" [2].** Glowing splint; relights.
6. **"Sulfur is burned in oxygen. State what you see and name the product" [2].** Blue flame; sulfur dioxide. Then *"Is the oxide acidic or basic?" [1].*
7. **"Write a balanced equation for sulfur burning in oxygen" [2].** Our Summer 2025 C2 Higher evidence records the SO₂ equation as weak; our `equation` answer spec is case-sensitive, as chemistry is.

---

## 6. Misconception framings worth borrowing

| Misconception | The framing that fixes it | Evidence |
|---|---|---|
| Apparatus not named, or drawn in perspective | Three named parts, drawn flat in 2-D section: flask, delivery tube, gas jar | **CCEA S2024 C2 Foundation** |
| Delivery tube drawn above the water | It must reach **under** the water so the gas bubbles up into the jar | the `wrongVersion` figure |
| MnO₂ not recalled as the catalyst | Named twice in the pack: here and in `c2-collision-theory-catalysts`. Cross-reference it | **CCEA S2025 C2 Higher**, and the same finding on the rates topic |
| The catalyst written into the equation | It is not a reactant and is not used up — that is what makes it a catalyst | links to `c2-collision-theory-catalysts` |
| Splint tests swapped | **Lighted** for hydrogen, **glowing** for oxygen | AQA §5.8.2.1, §5.8.2.2 |
| Oxide classification guessed | Metal → basic, non-metal → acidic. Learn the rule, then the five examples | the grouped table |
| Observations omitted | Blue flame, bright white flame, sparks, black solid — the observation is the mark | CCEA's own list |
| The SO₂ equation unbalanced | `S + O₂ → SO₂` is already balanced; the trouble comes with magnesium and iron, where it is not | **CCEA S2025 C2 Higher** |

---

## 7. Photographs and simulations

**Photographs.** Three worth sourcing with `pipeline/enrichment/check-commons-licence.mjs`: **magnesium burning** (the bright white flame is unmistakable and it is a marked observation), **sulfur burning with its blue flame**, and **manganese(IV) oxide** — the last is already verified for `c2-collision-theory-catalysts` as `File:Manganese-dioxide-sample.jpg` (**public domain**), so reuse it here with a different prompt: *this is the catalyst for the oxygen preparation. What would the balance read if it were recovered and dried afterwards?*

For the burning photographs, caption them as demonstrations and do not present them as invitations.

**Simulations: none mapped that model this, and none suitable.** Gas preparation is apparatus work; no free interactive models it faithfully. The interactive here is our own parameterised bench figure, whose `gas` and `collection` switches cover this topic and the next one from one generator.

**Videos already held:** check the entry's `why` lines. Both boards' material covers the **tests** well and the **preparations not at all**, so a video will deliver half this topic and silently omit the half that our examiner evidence says is failing. Say that explicitly rather than leaving her to discover it.

---

## 8. Scope note

**Beyond CCEA — mark `notonspec` if it appears:**
- the **test for chlorine** (AQA §5.8.2.4)
- **sulfur dioxide and acid rain** (Edexcel CC8.11, CC8.12) — CCEA covers them in `c2-combustion-and-pollution`
- the **reactivity series** as the frame for metals reacting with oxygen (AQA §5.4.1.2) — CCEA covers it in `c2-reactivity-series`
- **flame tests** for metal ions (AQA Chemistry 8462 §4.8.3.1) — a different test entirely, and CCEA teaches it in `c1-flame-tests`
- industrial production of hydrogen or oxygen; fractional distillation of liquid air
- fuel cells and the hydrogen economy (Edexcel CC8.14 evaluates hydrogen as a fuel)

**CCEA-only:**
- the **preparation methods** for both gases, the **apparatus** and **collecting over water** — neither board sets any gas preparation
- the **uses** of hydrogen and oxygen
- the five **elements-burning-in-oxygen** observations and the acidic/basic classification as a set

---

## 9. Sources consulted

- `data/enrichment/crosswalk.json` → `science:c2-hydrogen-oxygen-preparation` (status `partial`, high confidence)
- AQA GCSE Combined Science: Trilogy 8464 specification, **§5.8.2.1**, **§5.8.2.2**, §5.8.2.4 for the scope boundary, and §5.4.1.1 for metal oxides
- Pearson Edexcel GCSE (9-1) Combined Science 1SC0 specification, **CC3.12**, **CC8.23**, and CC8.11–CC8.14 for the scope boundary
- `data/spec/double-award-science-topics.json` → `c2-hydrogen-oxygen-preparation`: outcomes 2.9.5–2.9.7, `mustRecall`, and two `examinerEvidence` entries (Summer 2025 C2 Higher; Summer 2024 C2 Foundation)
- `data/enrichment/science/c2-collision-theory-catalysts.md` — for the shared MnO₂ finding, cross-referenced rather than taught twice
- `data/links/media-map.json` key `science:c2-hydrogen-oxygen-preparation`
