# Enrichment dossier — c2-concentration-atom-economy

**CCEA** Double Award Science, **C2** §2.6 Quantitative Chemistry · outcomes 2.6.5 to 2.6.8 · tier **H — every outcome is Higher only** · difficulty 4 · no prescribed practical
**CCEA must-recall:** concentration (mol/dm³) = moles ÷ volume (dm³); **1 dm³ = 1000 cm³**. moles = concentration × volume (dm³); mass = moles × Mr. **Atom economy = (mass of desired product ÷ total mass of products) × 100**; a high atom economy matters for **sustainable development** and for **economic** reasons.
**Prerequisites in our taxonomy:** `c1-formula-mass-and-moles`, `c1-reacting-masses-and-yield`
**Compiled** 20 September 2026 · 30 minutes
**Headline** The two halves have opposite comparison positions, and one of them carries a units trap. **Concentration is matched but in different units**: CCEA works in **mol/dm³**, AQA §5.3.2.5 does both, and **Edexcel CC1.49 asks only for g dm⁻³** — so an Edexcel-shaped worked example will compute the wrong quantity. **Atom economy is in AQA Chemistry 8462 §4.3.3.2 only** and in no Edexcel statement at all. Our Summer 2025 C2 Higher evidence names both halves: the mass of solute for a 2.0 mol/dm³ solution, and a **sustainability argument** that was poorly made — which is the atom-economy half asked as prose rather than arithmetic.

---

## 1. Crosswalk

| CCEA | AQA | Edexcel 1SC0 | Confidence | Status |
|---|---|---|---|---|
| 2.6.5 to 2.6.7 — concentration in mol/dm³, the dm³/cm³ conversion, moles and mass | **§5.3.2.5** *Concentration of solutions* (Trilogy), with the mole statements §5.3.2.1–§5.3.2.4 all **HT only** | **CC1.49** — "calculate the concentration of solutions in **g dm⁻³**" | high | **partial** — the idea matches, **the units do not** |
| 2.6.8 — atom economy, its formula, and why it matters | **not in 8464 Trilogy.** **AQA Chemistry 8462 §4.3.3.2** *Atom economy* — six mentions, including the formula and the sustainability argument | **unmatched** — zero hits for "atom economy" in 1SC0 | high | **ccea-only** against combined science |

Evidence: `atom economy` returns **zero hits** in AQA 8464 and in Edexcel 1SC0, and six in AQA 8462 §4.3.3.2.

**Scope deltas.** AQA 8462 pairs atom economy with **percentage yield** in the same section (§4.3.3), and CCEA covers yield separately in `c1-reacting-masses-and-yield` — so a borrowed AQA page will teach both at once and she needs only half of it. Edexcel's g dm⁻³ concentration also feeds its **titration** work (CC3.18), which is beyond CCEA.

---

## 2. Teaching angles worth recreating (in our own words)

1. **Concentration is "how much stuff per litre", and the unit tells you which stuff.** *The distinction that the Edexcel/CCEA difference makes unavoidable, and it is worth turning into an asset.* **g/dm³** counts the *mass* in each litre; **mol/dm³** counts the *number of particles*. Both are concentrations; chemists prefer moles because reactions happen particle by particle, not gram by gram. Saying that once means she can read either and knows why CCEA wants the second.

2. **The triangle is the same one she has met twice already.** *A deliberate economy.* `concentration = moles ÷ volume` has exactly the shape of `density = mass ÷ volume` (from `p1-density-kinetic-theory`) and of `speed = distance ÷ time`. She does not need a new rearrangement skill; she needs to notice it is the old one.

3. **Convert the volume first, on its own line.** *CCEA's own `mustRecall` states `1 dm³ = 1000 cm³`, and the recorded failure is a mass-of-solute calculation.* Laboratory volumes come in cm³ and the formula wants dm³, so **divide by 1000 before substituting**. This is the same discipline as the seconds conversion in `p2-charge-current-cells` and the kW conversion in `p2-electrical-power-energy-cost` — a unit step written on its own line before the formula. Worth naming as the same habit for the third time.

4. **Atom economy asks a different question from percentage yield — set them side by side once.** *AQA 8462 §4.3.3 teaches them together, which is the right instinct even though CCEA separates them.* **Yield** asks *how much of what I could have made did I actually get?* — a question about the process going well. **Atom economy** asks *how much of what I put in ends up in the product I want?* — a question about the reaction I chose. A reaction can have a perfect yield and a dreadful atom economy, because the waste was built into the equation from the start. That contrast is the concept; the formula is a consequence.

5. **Atom economy is decided by the equation, before the experiment.** *Follows from angle 4, and it is what makes the sustainability argument answerable.* Because it is computed from the balanced equation, you can compare two possible routes to the same product **on paper** and pick the one that wastes fewer atoms. That is what "important for sustainable development" actually means — fewer raw materials used, less waste to dispose of — and it is the argument our examiner says was poorly made.

6. **Give the economic half its own sentence.** *CCEA names both reasons, and candidates tend to give only the environmental one.* Atoms you buy and then throw away are money thrown away, and waste costs money to treat or dispose of. Two reasons, two marks.

---

## 3. The representation to rebuild as our own SVG

**Hero figure: where the atoms go.** `viewBox` about `0 0 980 420`. A balanced equation drawn as a mass-flow diagram.

- **Left:** the reactants, drawn as blocks whose **widths are proportional to their masses**, labelled with formula and Mr.
- **Right:** the products, as blocks of the same total width, split into the **desired product** (solid outline) and the **by-products** (hatched), each labelled.
- **Beneath the product blocks**, a bracket under the desired one and a bracket under the total, with the fraction written out: `atom economy = (desired ÷ total) × 100 = … %`.
- **A second row** showing the *same* product made by a different route, with a visibly different split — so two routes can be compared on one figure, which is the sustainability question.
- **Generator parameters:** `equation` (reactants and products with formulae and Mr), `desired: string`, `routes: 1 | 2`, `showWorking: boolean`, `blankResult: boolean`. Block widths and the percentage computed from the Mr values; assert the reactant and product total masses agree, since that is conservation of mass and a free self-check.

**Second figure: yield against atom economy.** Two small panels of the same reaction. **Left** — a perfect yield with a poor atom economy: everything that could be made was made, but half the product mass is waste. **Right** — a poor yield with a good atom economy: the reaction chose its atoms well but much was lost in handling. Caption: *they measure different things, and a reaction can be good at one and bad at the other.* This is angle 4 drawn, and it is what the extended question rewards.

**Third figure: the concentration ladder.** A four-row computed strip for a worked problem, right-aligned on the equals signs:

```
volume            = 250 cm³ = 250 ÷ 1000 = 0.250 dm³     ← convert first
moles             = concentration × volume = 2.0 × 0.250 = 0.500 mol
Mr of the solute  = …
mass              = moles × Mr = …
```

with the conversion row **tinted** so it reads as compulsory. **Generator parameters:** `concentration`, `volumeCm3`, `mr`, `solveFor: "mass" | "moles" | "concentration" | "volume"`, `blankRows: number[]`. Every value computed; assert the conversion row is always present when a cm³ volume is given.

---

## 4. Practical variants CCEA also examines

No prescribed practical on this outcome, and CCEA does not set titration. What is examinable:

- **Making up a standard solution** — weigh the solid, dissolve, make up to the mark in a volumetric flask. This is the physical meaning of the calculation and it produces the apparatus vocabulary a Booklet B question can ask about.
- **Comparing two routes to the same product on paper** — the atom-economy sustainability question, which needs no apparatus at all.
- **Edexcel CC3.18's titration** (burette, pipette and a suitable indicator) is the practical home of concentration on that board; it is **beyond CCEA**, so read it for the apparatus names and nothing else.

The transferable **Unit 7** demand is **unit conversion inside a multi-step calculation** and **justifying a choice using calculated evidence**, which is exactly the sustainability part.

---

## 5. Question types the other boards use that CCEA also rewards

1. **"Calculate the mass of solute needed to make 250 cm³ of a 2.0 mol/dm³ solution" [3].** The recorded failure. Marks: the volume conversion, the moles, the mass. Author the scheme so each earns independently and the feedback names which step failed.
2. **"Calculate the concentration in mol/dm³" [2].** The reverse direction.
3. **"Calculate the atom economy for this reaction" [3].** Marks: the Mr of the desired product, the total Mr of the products, the percentage. Higher only.
4. **"Route A has an atom economy of 44%, route B of 87%. Explain which is better for sustainable development" [3].** The recorded weakness. Marks for **fewer raw materials wasted**, **less waste to dispose of**, and the **economic** point — and a fourth is available for referring to the actual figures.
5. **"Explain the difference between percentage yield and atom economy" [2].** The distinction item, and a genuine discriminator.

---

## 6. Misconception framings worth borrowing

| Misconception | The framing that fixes it | Evidence |
|---|---|---|
| cm³ substituted directly | Convert to dm³ first, on its own line. Same habit as seconds in `p2-charge-current-cells` | **CCEA S2025 C2 Higher** |
| Atom economy confused with percentage yield | Yield is how well the process went; atom economy is how well the **reaction was chosen**. A perfect yield can still waste most of the atoms | AQA 8462 §4.3.3 teaches them together, which invites the confusion |
| Sustainability answered as "it is better for the environment" | Two named reasons: fewer raw materials and less waste, **and** the economic cost of buying and disposing of atoms you do not want | **CCEA S2025 C2 Higher** — poorly argued |
| Atom economy thought to need an experiment | It comes from the **balanced equation**; you can compare routes on paper before making anything | follows from the formula |
| g/dm³ and mol/dm³ used interchangeably | Grams count mass, moles count particles. CCEA wants **mol/dm³** | **Edexcel CC1.49 asks only for g dm⁻³** — a borrowed example computes the wrong thing |
| The equation not balanced before the calculation | An unbalanced equation gives a meaningless atom economy, and the mass check fails | the figure's conservation-of-mass assertion |

---

## 7. Photographs and simulations

**Photographs: none needed.** The content is arithmetic and an argument. A **volumetric flask with its graduation mark** would be the only image worth having, for the standard-solution activity; verify with `pipeline/enrichment/check-commons-licence.mjs` and prompt: *why does this flask have a single line rather than a scale?*

**Simulation.** `media-map.json` maps **PhET *Concentration*** to `c2-concentration-atom-economy` — and, unlike the hydrate topic where it was wrong and has been removed, **here it is exactly right**. It shows solute being added to a fixed volume, with a live concentration readout in **mol/L**, which is CCEA's unit. Two tasks worth authoring:
1. Fix the volume, add solute until the readout reads 2.0 mol/L, then work out what mass that must have been and check against the label.
2. Add water at constant solute and describe what happens to the concentration — dilution, seen rather than derived.
It models nothing about atom economy, and the panel note should say so.

**Videos already held:** check the entry's `why` lines against two things — AQA-shaped videos will teach **percentage yield alongside atom economy** (yield is a different CCEA topic), and any Edexcel-shaped material will work in **g/dm³**.

---

## 8. Scope note

**Beyond CCEA — mark `notonspec` if it appears:**
- **percentage yield** in this topic (CCEA covers it in `c1-reacting-masses-and-yield`)
- **titration** calculations and apparatus (Edexcel CC3.18)
- concentration in **g/dm³** as the required form (Edexcel CC1.49) — recognise it, do not compute in it
- moles of gas, molar volume, Avogadro's constant in calculations
- limiting reactants (AQA §5.3.2.4, HT)
- life-cycle assessment as the sustainability framework (AQA §5.10.2.1; Edexcel CC4.11)

**CCEA-only or CCEA-specific:**
- **atom economy** against combined science — AQA has it in Chemistry 8462 only, Edexcel not at all
- **mol/dm³** as the working unit, where Edexcel's combined specification asks only for g dm⁻³
- the pairing of the calculation with a **written sustainability argument** in the same question

---

## 9. Sources consulted

- `data/enrichment/crosswalk.json` → `science:c2-concentration-atom-economy` (status `partial`, high confidence)
- AQA GCSE Combined Science: Trilogy 8464 specification, **§5.3.2.5** and §5.3.2.1–§5.3.2.4 for the HT boundary
- AQA GCSE Chemistry 8462 specification, **§4.3.3** and **§4.3.3.2** *Atom economy*
- Pearson Edexcel GCSE (9-1) Combined Science 1SC0 specification, **CC1.49**, and CC3.18 for the scope boundary; searched for "atom economy": **zero hits**
- `data/spec/double-award-science-topics.json` → `c2-concentration-atom-economy`: outcomes 2.6.5–2.6.8 (all Higher), `mustRecall`, and the Summer 2025 C2 Higher `examinerEvidence` entry
- `data/links/media-map.json` key `science:c2-concentration-atom-economy`
