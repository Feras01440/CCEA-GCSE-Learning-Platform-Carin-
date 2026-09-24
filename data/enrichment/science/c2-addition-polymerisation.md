# Enrichment dossier — c2-addition-polymerisation

**CCEA** Double Award Science, **C2** §2.5 Organic Chemistry · outcomes 2.5.17 (F), **2.5.18, 2.5.19 (H)** · tier mixed · difficulty 4 · no prescribed practical
**CCEA must-recall:** monomers (**ethene**, **chloroethene**) join to form long-chain polymers by addition polymerisation: **poly(ethene)**, **poly(chloroethene) / PVC**. **Higher:** `n C₂H₄ → –(CH₂–CH₂)–ₙ`; draw the **repeat unit** with brackets, n and extending bonds; deduce the monomer from the polymer and vice versa.
**Prerequisite in our taxonomy:** `c2-alkenes`
**Compiled** 20 September 2026 · 28 minutes
**Headline** Addition polymerisation is in **AQA Chemistry 8462 §4.7.3.1 only** — not in Trilogy — and Edexcel 1SC0 reaches it through a single line, **CC1.39**, using poly(ethene) as an example inside *bonding*. So the accessible material is separate-science, and it carries two things CCEA does not want: condensation polymerisation and ester links. The transferable gold is AQA's own sentence — **"in addition polymers the repeating unit has the same atoms as the monomer because no other molecule is formed"** — which is simultaneously the definition, the drawing rule and the test for whether a repeat unit is right. Our Summer 2025 finding is at the easy end: **naming poly(ethene) from its monomer was poorly done**, which is a naming convention, not chemistry.

---

## 1. Crosswalk

| CCEA | AQA | Edexcel 1SC0 | Confidence | Status |
|---|---|---|---|---|
| 2.5.17 (F) — monomers join to form polymers; poly(ethene), PVC | **not in 8464 Trilogy.** **AQA Chemistry 8462 §4.7.3.1** — "alkenes can be used to make polymers such as poly(ethene) and poly(propene) by addition polymerisation… many small molecules (monomers) join together to form very large molecules (polymers)" | **CC1.39** — "describe, using poly(ethene) as the example, that simple polymers consist of large molecules containing chains of carbon atoms" | high | **partial** |
| 2.5.18, 2.5.19 (H) — the equation, the repeat unit, monomer ↔ polymer deduction | **8462 §4.7.3.1** — "recognise addition polymers and monomers from diagrams… and from the presence of the functional group"; the repeating-unit rule | unmatched | high | **ccea-only** against combined science |

Evidence: `monomer` returns **zero hits** in AQA 8464 and in Edexcel 1SC0, and six in AQA 8462 §4.7.3.1. `repeat unit` returns zero everywhere — it is CCEA's phrasing for a drawing AQA describes without naming.

**Scope deltas outwards.** AQA 8462 adds **poly(propene)**, **condensation polymerisation** (§4.7.3.2, HT), **amino acids and DNA as natural polymers** (§4.7.3.3, §4.7.3.4) and **polymer properties and disposal** (§4.10.3.3). CCEA names **only** ethene → poly(ethene) and chloroethene → poly(chloroethene).

---

## 2. Teaching angles worth recreating (in our own words)

1. **The double bond is the whole mechanism — open it and hold hands.** *Implied by AQA 8462's placement of polymerisation immediately after alkenes, and by its "same atoms as the monomer" rule.* An alkene has a C=C. One of those two bonds opens up, leaving each carbon with a spare bond at each end of the molecule, so the molecules join in a chain. Nothing is lost and nothing is added — which is exactly why the repeat unit has the same atoms as the monomer. Teaching the mechanism first makes the drawing rule a consequence rather than a recipe.

2. **AQA's test, verbatim in idea: same atoms, because nothing else is formed.** *AQA 8462 §4.7.3.1 states it as a sentence, and it is the single most useful line in the topic.* If a drawn repeat unit has a different atom count from the monomer, it is wrong. That gives her a check she can apply to her own answer, which is rare in organic chemistry.

3. **Naming is a rule, not a fact: put the monomer in brackets and write "poly" in front.** *CCEA Summer 2025 C2 Foundation: naming poly(ethene) from its monomer was poorly done — so this is a convention that needs teaching explicitly, and no borrowed resource will flag it as a difficulty.* ethene → **poly(ethene)**; chloroethene → **poly(chloroethene)**. The brackets are part of the name. Make it a one-mark gate on its own, twice.

4. **Chloroethene and PVC are the same substance under two names.** *CCEA names both; AQA uses poly(propene) as its second example instead.* She will meet "PVC" everywhere in daily life and "poly(chloroethene)" only in the exam. Say once that PVC stands for polyvinyl chloride, that "vinyl chloride" is the old name for chloroethene, and that **the answer line wants the systematic name**.

5. **Draw the repeat unit with its four required features.** *The Higher drawing skill, and it is mechanical once decomposed.* (i) The **brackets**; (ii) the **bonds extending through** the brackets on both sides; (iii) the **n** outside the bracket at the bottom right; (iv) the **single** bond between the two carbons inside, never a double bond. Missing extending bonds and a retained C=C are the two errors that cost the mark, and both are visible at a glance.

6. **Work it backwards as often as forwards.** *AQA 8462 asks candidates to "recognise addition polymers **and monomers** from diagrams" — both directions.* Given the repeat unit, put the double bond back and remove the extending bonds to recover the monomer. Practising only monomer → polymer leaves half the question type untouched, and CCEA's 2.5.19 names both directions.

---

## 3. The representation to rebuild as our own SVG

**Hero figure: opening the double bond.** `viewBox` about `0 0 1000 420`. Three stages left to right, drawn as displayed formulae with every bond shown.

1. **Three separate monomers** — three ethene molecules in a row, each with its **C=C drawn as two lines**, all hydrogens shown.
2. **The bonds open** — the same three molecules with one line of each double bond redrawn as a short outward "spare bond" at each carbon, with small curved arrows indicating the opening. Caption: *one of the two bonds opens; nothing leaves the molecule.*
3. **The chain** — the three units joined, bonds continuing off both ends of the drawing with a dashed continuation, so the chain visibly does not stop.

Below stage 3, **the repeat unit boxed**, with its four required features individually labelled by leader lines: *brackets*, *bonds through the brackets*, *n*, *single bond between the carbons*.

**Generator parameters:** `monomer: "ethene" | "chloroethene"`, `units: number`, `stage: 1|2|3`, `showRepeatUnit: boolean`, `labelFeatures: boolean`, `blank: "name" | "repeat-unit" | null`. The displayed formula is computed from the monomer so chloroethene's Cl lands on alternate carbons correctly; assert the atom count of the repeat unit equals the monomer's.

**Second figure: the atom-count check.** Two small boxes side by side — the monomer with its formula `C₂H₄` and the repeat unit with `–(C₂H₄)–` — joined by an equals sign and captioned *same atoms, because nothing else was formed*. Ten lines of SVG, and it is AQA's rule turned into a tool.

**Third, small: the naming strip.** Three rows, each monomer name → arrow → polymer name, with the **brackets highlighted** in the product: ethene → poly(ethene); chloroethene → poly(chloroethene); propene → poly(propene) greyed and marked `notonspec`. Aimed at the recorded naming failure, and it shows the rule generalising, which is what makes a rule memorable.

---

## 4. Practical variants CCEA also examines

No prescribed practical on this outcome, and no other board sets one either. Three legitimate hooks:

- **Sorting plastic objects by polymer**, using the recycling codes moulded into them. Free, tactile, and it makes poly(ethene) and PVC real objects rather than formulae.
- **Making "slime" or nylon rope-trick** demonstrations are **condensation** polymerisation and are beyond CCEA — name them only as something she may have seen, marked `notonspec`.
- The transferable Unit 7 demand is **interpreting a displayed formula** and **deducing one structure from another**, which is a paper skill rather than a bench one and is where our items should sit.

---

## 5. Question types the other boards use that CCEA also rewards

1. **"Name the polymer formed from this monomer" [1].** CCEA's recorded weakness. Set it twice, with both named monomers.
2. **"Draw the repeat unit of poly(chloroethene)" [2].** The Higher drawing skill; marks for the correct carbon backbone with substituents and for the brackets with extending bonds. Encode as a `figure`-plus-`choice` item over four computed structures whose distractors are: a retained C=C, missing extending bonds, and the Cl on the wrong carbon.
3. **"Write an equation for the polymerisation of ethene" [2].** `n C₂H₄ → –(CH₂–CH₂)–ₙ`. Our `equation` answer spec handles it; note chemistry is case-sensitive.
4. **"Deduce the monomer from this section of polymer" [2].** The reverse direction, which AQA asks for explicitly.
5. **"Explain why the repeat unit has the same atoms as the monomer" [1–2].** No other molecule is formed. A conceptual mark that separates candidates.

---

## 6. Misconception framings worth borrowing

| Misconception | The framing that fixes it | Evidence |
|---|---|---|
| The polymer name is guessed | Brackets round the monomer's name, "poly" in front. It is a convention, so learn it as one | **CCEA S2025 C2 Foundation** |
| The double bond kept in the repeat unit | The double bond is what *opened* to make the chain. If it is still there, no polymerisation happened | AQA 8462's mechanism ordering |
| Extending bonds omitted | The chain continues. Bonds must cross the brackets on both sides | universal drawing rule |
| Something is given off | Nothing is lost — that is why the atoms match. (Losing a small molecule is *condensation* polymerisation, which is off spec) | AQA 8462 §4.7.3.1's own sentence |
| Monomer and polymer used interchangeably | Monomer is the single small molecule; polymer is the long chain. One of each in every sentence | universal |
| PVC treated as a separate substance | PVC is poly(chloroethene). The answer line wants the systematic name | CCEA names both |
| `n` forgotten | The `n` says "many". Without it the drawing is one unit, not a polymer | follows from the four features |

---

## 7. Photographs (Commons, licence checked 20 Sep 2026) and simulations

| File | Licence | Size | Use and prompt |
|---|---|---|---|
| `File:LLDPE.jpg` (Cjp24) | **Public domain** | 638×596 | Polyethylene granules — the raw industrial form of poly(ethene). Prompt: *which small molecule were these made from, and what happened to its double bond?* |
| `File:PE and PP objects.jpg` (Cjp24) | CC BY-SA 3.0 | 1240×1244 | Everyday objects made from polyethylene and polypropylene; makes "polymer" an object rather than a formula |
| `File:Dura-Blue PVC Pipe for Underground Water Mains.JPG` (Dwight Burdette) | CC BY 3.0 | 4752×3168 | PVC pipe. Prompt: *PVC is the trade name. What is this polymer called in the exam, and what was its monomer?* — aimed straight at the naming finding |

**Simulation held, with a caveat:** **PhET *Build a Molecule*** is mapped to this slug. It builds small molecules from atoms and **cannot build a polymer or show a double bond opening**, so it models the atom-counting idea and nothing else. Keep it only if the task is *build ethene, count the atoms, then check that your repeat unit has the same ones* — which is genuinely useful for angle 2 — and say plainly that it stops there. Otherwise leave the panel empty.

**Videos already held:** Freesciencelessons `GhvevdJU_DM` and Cognito `1ZUg6ZC3ltA`. Both are separate-science chemistry, so both will reach **condensation polymerisation, polyesters and natural polymers**. One `notonspec` line covers it, and the gate after the video should be the naming rule.

---

## 8. Scope note

**Beyond CCEA — mark `notonspec` if it appears:**
- **condensation polymerisation**, ester links, polyesters, nylon (AQA 8462 §4.7.3.2, HT only)
- **amino acids, proteins, DNA and starch as natural polymers** (AQA 8462 §4.7.3.3, §4.7.3.4)
- **poly(propene)** and other monomers beyond ethene and chloroethene
- polymer **properties, disposal, recycling and life-cycle assessment** (AQA 8462 §4.10.3.3)
- thermosoftening versus thermosetting polymers
- the mechanism as free-radical addition

**CCEA-only against combined science:** the whole topic sits in AQA **Chemistry 8462** and not in Trilogy; Edexcel 1SC0 has a single descriptive line. The **repeat-unit drawing** and the **monomer ↔ polymer deduction** at Higher have no combined-science equivalent at all.

---

## 9. Sources consulted

- `data/enrichment/crosswalk.json` → `science:c2-addition-polymerisation` (status `partial`, medium confidence)
- AQA GCSE Chemistry 8462 specification, **§4.7.3.1** (read in full), and §4.7.3.2–§4.7.3.4, §4.10.3.3 for the scope boundary
- AQA GCSE Combined Science: Trilogy 8464 — searched for "monomer" and "polymerisation": **no addition-polymerisation content**
- Pearson Edexcel GCSE (9-1) Combined Science 1SC0 specification, **CC1.39**
- `data/spec/double-award-science-topics.json` → `c2-addition-polymerisation`: outcomes 2.5.17–2.5.19, `mustRecall`, and the Summer 2025 C2 Foundation `examinerEvidence` entry
- Wikimedia Commons API for all three photographs
- `data/links/media-map.json` key `science:c2-addition-polymerisation`
