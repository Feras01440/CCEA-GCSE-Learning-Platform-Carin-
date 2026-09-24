# Enrichment dossier — c2-hydrated-salts-water-of-crystallisation

**CCEA** Double Award Science, **C2** §2.6 Quantitative Chemistry · outcomes 2.6.1 (partly H), 2.6.2, 2.6.3, **2.6.4 (H)** · tier mixed · difficulty 4 · **Prescribed Practical C5**
**CCEA practical C5:** determine the mass of water present in hydrated crystals
**CCEA must-recall:** empirical formula = simplest whole-number ratio; molecular formula = actual numbers. Hydrated salts contain **water of crystallisation** (CuSO₄·5H₂O, blue); **anhydrous** = water removed (white); **heat to constant mass** to be sure all the water is driven off. The **Mr of a hydrate includes the water** (CuSO₄·5H₂O = 160 + 90 = **250**). **Higher:** moles of salt : moles of water from the masses gives the degree of hydration x.
**Compiled** 20 September 2026 · 32 minutes
**Headline** **"Water of crystallisation" returns zero hits in AQA 8464, AQA 8462 and Edexcel 1SC0.** The closest thing on any board is **Edexcel Core Practical CC3.17** — preparing pure, dry **hydrated copper sulfate** crystals — which makes the substance but never computes the water. So Prescribed Practical C5 and the degree-of-hydration calculation are CCEA's own, and the *empirical formula* method that underlies them (Edexcel **CC1.44–CC1.46**) is where the transferable material is. Our three examiner findings are unusually specific and all point the same way: **the Mr of the hydrate**, the **apparatus**, and the **blue → white** colour change.

---

## 1. Crosswalk

| CCEA | AQA | Edexcel 1SC0 | Confidence | Status |
|---|---|---|---|---|
| 2.6.1 (partly H) — empirical and molecular formula | **§5.2.1.3** *Ionic compounds* mentions empirical formula once | **CC1.44** (formulae from reacting masses), **CC1.45** ("deduce the empirical formula of a compound from the formula of its molecule"), **CC1.46** ("describe an experiment to determine the empirical formula of a simple compound") | high | **matched to Edexcel** |
| 2.6.2, 2.6.3 — hydrated and anhydrous; water of crystallisation; heating to constant mass; Mr including the water | **unmatched** — zero hits for "water of crystallisation" in 8464 or 8462 | **unmatched** as a concept; **CC3.17** Core Practical prepares hydrated copper sulfate but does not quantify the water | high | **ccea-only** |
| 2.6.4 (H) — moles of salt : moles of water → the degree of hydration x | **unmatched** | **unmatched** | high | **ccea-only** |
| Prescribed Practical C5 | **unmatched** — no AQA required practical on hydrates | **CC3.17** is the nearest, and it makes the crystals rather than dehydrating them | high | **ccea-only** |

**The transferable core.** Edexcel **CC1.46** — *"describe an experiment to determine the empirical formula of a simple compound such as magnesium oxide"* — is the same **method** as C5: heat to constant mass, use the mass change, convert to moles, find the simplest ratio. Borrow the method and change the substance. That is the whole enrichment strategy for this topic.

---

## 2. Teaching angles worth recreating (in our own words)

1. **The dot is not a full stop and not a multiplication — it means "with".** *CCEA-specific notation that no borrowed resource explains, because no other board uses it.* `CuSO₄·5H₂O` means one copper sulfate unit **with five water molecules locked into the crystal**. Saying that once, and pointing at the dot, prevents the commonest structural confusion. The five waters are part of the crystal's structure, not a wet sample.

2. **The Mr includes the water. Compute it in two visible pieces.** *CCEA Summer 2025 C2 Foundation: the Mr of C₂H₂O₄·2H₂O was given as 110 instead of 126 — the water was left out.* Make the layout compulsory: `Mr(salt) = …` on one line, `+ x × 18 = …` on the next, `total = …` on a third. Two pieces, visibly added. For CuSO₄·5H₂O that is 160 + 90 = 250, which is CCEA's own worked example.

3. **Heat to constant mass, and say what "constant" proves.** *CCEA's `mustRecall`, and Edexcel CC1.46's method logic.* Heat, cool, weigh; heat again, cool, weigh again; repeat until two successive masses agree. When the mass stops falling, no more water is leaving, so all of it has gone. Without that reasoning the repeated weighing looks like fussiness; with it, it is the evidence.

4. **Cool before weighing, and cool in a desiccator if you have one.** *Standard in every gravimetric method, including Edexcel's CC1.46 write-up.* A hot crucible on a balance reads low because of convection, and anhydrous salts are hygroscopic — they take water back from the air, which is the very thing being measured. Two sentences, two marks.

5. **Blue to white, and back again.** *CCEA Summer 2025 Unit 7 Booklet B names the colour change; Summer 2025 Unit 7 Booklet A adds that anhydrous magnesium sulfate is a **white powder, not crystals**.* Hydrated copper(II) sulfate is blue; anhydrous is white; add water and the blue returns with heat released. The reversibility is both a memorable demonstration and a genuine link to `c2-equilibrium` and `c2-energy-changes`.

6. **The calculation is the empirical-formula method wearing different clothes.** *Edexcel CC1.45–CC1.46 supply the method; CCEA supplies the context.* Mass of hydrate − mass of anhydrous = mass of water. Then: moles of anhydrous salt, moles of water, divide both by the smaller, round to a whole number — and that whole number is x. Teaching it as "the ratio method you already know" makes the Higher outcome a transfer rather than a new technique.

7. **Say what the apparatus is and why each part is there.** *CCEA Summer 2025 C2 Foundation: "apparatus for dehydrating a hydrate poorly drawn".* Crucible (withstands direct heat), pipeclay triangle on a tripod (supports it over the flame), lid ajar (lets steam out, keeps solid in), Bunsen with a blue flame, tongs (to move a hot crucible), balance. Every item earns a mark by being named and, better, justified.

---

## 3. The representation to rebuild as our own SVG

**Hero figure: the C5 apparatus, with reasons.** `viewBox` about `0 0 900 480`. The drawing our examiner says candidates could not produce.

- A **tripod** on a heatproof mat, a **pipeclay triangle** across it, a **crucible** sitting in the triangle with its **lid resting ajar**, a **Bunsen burner** beneath with a blue flame, and **tongs** and a **balance** drawn to one side.
- **Steam drawn escaping** through the gap under the lid, labelled *water vapour leaving*.
- Every component **labelled with its job on a second line**: *crucible — withstands direct heating*; *lid ajar — lets the steam out, keeps the solid in*; *pipeclay triangle — supports the crucible over the flame*; *tongs — a hot crucible is never handled or put straight on a balance*.
- **Generator parameters:** `labels: "full" | "names-only" | "blank"`, `showReasons: boolean`, `showSteam: boolean`, `wrongVersion: "lid-closed" | "no-triangle" | "beaker-not-crucible" | null` for find-the-mistake items — all three are real candidate errors.

**Second figure: the mass-to-formula ladder.** `viewBox` about `0 0 820 500`. Six rows, right-aligned on an equals sign, computed end to end:

```
mass of crucible + hydrate        = 24.60 g
mass of crucible + anhydrous      = 22.80 g
mass of crucible (empty)          = 18.80 g
  → mass of anhydrous salt        =  4.00 g
  → mass of water driven off      =  1.80 g
moles of salt   = 4.00 ÷ 160      = 0.025
moles of water  = 1.80 ÷ 18       = 0.100
  ratio salt : water              = 1 : 4     → x = 4
```

with a **bracket down the left of the mole rows** labelled *the empirical-formula method, applied to a hydrate*, and the final line boxed. **Generator parameters:** `crucibleMass`, `hydrateMass`, `anhydrousMass`, `saltMr`, with every difference, mole value and ratio computed and the final x rounded; assert that x comes out within tolerance of a whole number, and expose `xTarget` so twins can be generated backwards from a chosen answer.

**Third figure: the two-piece Mr.** A small stacked calculation for CuSO₄·5H₂O — `160` in one box, `5 × 18 = 90` in a second, joined by a plus to `250` — with a struck-through `160` beside it labelled *the water counts too*. Ten lines of SVG against a named examiner finding.

**Fourth, small: the colour card.** Two squares side by side, **blue crystals** and **white powder**, with a two-headed arrow between them labelled *heat →* and *← add water*, and a note that the anhydrous form of magnesium sulfate is a **powder, not crystals**. Colour must not be the only signal: label both squares in text.

---

## 4. Practical variants CCEA also examines

**Prescribed Practical C5** is the core: weigh the crucible, add hydrated crystals, weigh, heat, cool, weigh, and repeat to constant mass.

| Variant | Source | What changes | Why it matters |
|---|---|---|---|
| **Hydrated copper(II) sulfate** | CCEA's standard | blue → white, very visible | The colour change is itself examinable (Unit 7 Booklet B) |
| **Hydrated magnesium sulfate** | CCEA Summer 2025 Unit 7 Booklet A | anhydrous product is a **white powder, not crystals** | Named in our evidence as a point candidates got wrong |
| **Magnesium oxide from magnesium** | **Edexcel CC1.46** | mass *gains* instead of losing | Same gravimetric logic, opposite direction — an excellent contrast item and the best external method write-up available |
| **Preparing hydrated copper sulfate** | **Edexcel CC3.17** Core Practical | makes the crystals rather than dehydrating them | The reverse journey; worth naming so she sees both directions |
| **Reversibility demonstration** | standard | add water to the anhydrous salt | Blue returns, heat released; links to `c2-equilibrium` and `c2-energy-changes` |

**The Unit 7 demands CCEA marks here:** heating to constant mass and saying why; cooling before weighing; using tongs; recording masses to the balance's precision; and computing a difference correctly. All of them are method points, not chemistry.

---

## 5. Question types the other boards use that CCEA also rewards

1. **"Calculate the Mr of CuSO₄·5H₂O" [2].** The two-piece layout. Our recorded failure; author the distractor that omits the water as a named `commonError`.
2. **"Draw the apparatus used to heat the crystals" [2–3].** Or label a printed diagram. Our `label` answer kind, with the four justified components.
3. **"Why was the crucible heated, cooled and weighed more than once?" [2].** To reach constant mass, which shows all the water has been driven off.
4. **"Calculate the mass of water driven off" [1].** A subtraction — but from the *right* two masses, which is where the crucible mass trips candidates.
5. **"Determine the value of x in MgSO₄·xH₂O" [4].** Higher. Marks for moles of salt, moles of water, the ratio, and a whole-number x. The ladder figure is the method.
6. **"Suggest why the anhydrous salt was cooled in a desiccator" [1].** It absorbs water from the air.
7. **"State the colour change seen" [1].** Blue to white. Low tariff, named in our evidence, frequently dropped.

**Mark-scheme habit worth copying from Edexcel's empirical-formula items:** the moles lines are credited separately from the ratio, so an arithmetic slip early does not cost the method. Author the scheme so each mole calculation and the ratio step earn independently, and carry an error forward.

---

## 6. Misconception framings worth borrowing

| Misconception | The framing that fixes it | Evidence |
|---|---|---|
| The water left out of the Mr | Two pieces, visibly added: salt Mr **plus** x × 18 | **CCEA S2025 C2 Foundation** — 110 given instead of 126 |
| Apparatus drawn as a beaker on a gauze | A crucible in a pipeclay triangle, lid ajar. Each part has a job | **CCEA S2025 C2 Foundation** — "poorly drawn" |
| Anhydrous magnesium sulfate described as crystals | It is a **white powder**. The crystal shape needs the water | **CCEA S2025 Unit 7 Booklet A** |
| The colour change not known | Blue → white on heating; white → blue on adding water | **CCEA S2025 Unit 7 Booklet B** |
| The dot read as a multiplication | It means "with": the water is part of the crystal | CCEA notation, unexplained elsewhere |
| Heating once is enough | Heat to **constant mass** — two agreeing weighings prove the water has all gone | CCEA `mustRecall`; Edexcel CC1.46's method logic |
| Weighing while hot | Cool first: a hot crucible reads low, and the anhydrous salt takes water back from the air | standard gravimetric practice |
| x left as a decimal | The ratio must be a whole number; round it and say why | follows from the empirical-formula method |

---

## 7. Photographs (Commons, licence checked 20 Sep 2026) and simulations

| File | Licence | Size | Use and prompt |
|---|---|---|---|
| `File:Copper-Sulfate.JPG` (Yuvalif) | **Public domain** | 1261×1202 | Hydrated copper(II) sulfate crystals, blue. Prompt: *these crystals are dry to the touch. Where is the water, and what would you see if they were heated strongly?* |
| `File:Blue vitriol monocrystal.jpg` (Tatewaki) | CC BY-SA 4.0 | 1457×609 | A single large crystal about 5 cm across; makes the crystal *structure* point vivid |

A photograph of the **white anhydrous powder** would complete the pair and is the more useful of the two, but nothing suitable was verified this session — search for it with `pipeline/enrichment/check-commons-licence.mjs` before authoring, and pair the two images in one figure with the heat/water arrows between them.

**Simulations: none, and that is now recorded.** PhET *Concentration* had been mapped to this slug; it models dissolving a solute to make a solution of known concentration, which is the opposite idea — in a hydrate the water is locked **inside** the solid, not dissolving it — and it belongs to `c2-concentration-atom-economy`. It was removed from `data/links/media-map.json` on 20 September 2026 and the slug's `sims` array is deliberately empty. No faithful interactive exists for dehydration or for a mass-to-formula calculation; the interactive here is our own parameterised mass-to-formula ladder.

**Videos already held:** Freesciencelessons `u2V8b7M_caA` and Cognito `kBlmEfS_P00`. Both are separate-science chemistry and will treat **empirical formulae** generally — useful for the method — but neither will cover **water of crystallisation or the C5 practical**, because no other board examines them. The `why` line should say the video gives the method and our lesson gives the context.

---

## 8. Scope note

**Beyond CCEA — mark `notonspec` if it appears:**
- **percentage composition by mass** as a route into empirical formulae (a common AQA/Edexcel step CCEA does not need here)
- **molecular formula from empirical formula and Mr** beyond CCEA's own 2.6.1 wording
- **titration** and concentration calculations (CCEA: `c2-concentration-atom-economy`)
- **anhydrous salts as drying agents** in organic preparations
- reversible reactions treated formally with equilibrium position (CCEA: `c2-equilibrium`)
- the enthalpy of hydration

**CCEA-only:**
- **water of crystallisation** as a named idea — zero hits in AQA 8464, AQA 8462 and Edexcel 1SC0
- **Prescribed Practical C5** and the **degree of hydration x** calculation
- the **Mr of a hydrate including its water**, examined as its own step
- the **blue ⇄ white** colour change as recalled content, and that anhydrous magnesium sulfate is a **powder**

---

## 9. Sources consulted

- `data/enrichment/crosswalk.json` → `science:c2-hydrated-salts-water-of-crystallisation` (status `partial`, high confidence)
- AQA GCSE Combined Science: Trilogy 8464 and AQA GCSE Chemistry 8462 — searched for "water of crystallisation", "hydrated" and "anhydrous": the only hits are in *Electrolysis of molten ionic compounds*, an unrelated use of the word
- Pearson Edexcel GCSE (9-1) Combined Science 1SC0 specification, **CC1.44**, **CC1.45**, **CC1.46** (the empirical-formula experiment — the transferable method) and **CC3.17** (Core Practical: preparing pure, dry hydrated copper sulfate)
- `data/spec/double-award-science-topics.json` → `c2-hydrated-salts-water-of-crystallisation`: outcomes 2.6.1–2.6.4, Prescribed Practical C5, `mustRecall`, and **three** `examinerEvidence` entries (Summer 2025 C2 Foundation; Summer 2025 Unit 7 Booklet B Higher; Summer 2025 Unit 7 Booklet A Foundation)
- Wikimedia Commons API for both photographs
- `data/links/media-map.json` key `science:c2-hydrated-salts-water-of-crystallisation`
