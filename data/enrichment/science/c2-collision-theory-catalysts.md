# Enrichment dossier — c2-collision-theory-catalysts

**CCEA** Double Award Science, C2 §2.3 Rates of Reaction · outcomes 2.3.4 (**H**), 2.3.5 (F), 2.3.6 (**H**) · tier mixed · difficulty 4 · no prescribed practical on this topic (PP **C4** sits on `c2-measuring-rates`)
**Prerequisite in our taxonomy:** `c2-measuring-rates`
**Compiled** 19 September 2026 · 50 minutes
**Headline** The Royal Society of Chemistry's 14–16 CPD article on this exact topic hands us, in one page, both halves of the problem CCEA's own examiner reported. It names the misconception (*all collisions react*), the language that fixes it (*"not all collisions are successful" — repeat it until it is boring*), and a second misconception our examiner did not name but which silently costs marks (*a faster rate means more product*). Our Summer 2025 C2 Higher finding — "say fewer **successful** collisions **per unit time**, not less collisions" — is the same fault seen from the marking end. Build the lesson around that one adjective and that one phrase.

---

## 1. Crosswalk

| CCEA | What CCEA asks | AQA 8464 | Edexcel 1SC0 | Confidence | Scope |
|---|---|---|---|---|---|
| 2.3.4 (H) | Higher temperature → particles have more energy and collide more often with more energy → more successful collisions per unit time | **§5.6.1.3 Collision theory and activation energy** — "increasing the temperature increases the frequency of collisions **and** makes the collisions more energetic" | **CC7.4** — effects of temperature, concentration, surface area to volume ratio and pressure "in terms of frequency and/or energy of collisions" | high | matched, and AQA's two-part sentence is the better scaffold: *frequency* and *energy* are two separate marks |
| 2.3.5 (F) | A catalyst increases the rate without being used up; transition metals and their compounds are often catalysts (MnO₂ for H₂O₂) | **§5.6.1.4 Catalysts** — "change the rate… but are not used up"; "students do not need to know the names of catalysts other than those specified" | **CC7.6** — "speeds up the rate… without altering the products, being itself unchanged chemically and in mass at the end" | high | matched. **Edexcel's wording is the most useful**: "unchanged chemically **and in mass**" is exactly how an identify-the-catalyst data question is marked. **MnO₂ for H₂O₂ is named by CCEA and by neither of the others** |
| 2.3.6 (H) | A catalyst provides an alternative pathway of lower activation energy | **§5.6.1.4** — "providing a different pathway… that has a lower activation energy", with a catalysed reaction profile printed in the spec | **CC7.7** — "explain how the addition of a catalyst increases the rate… in terms of activation energy"; **CC7.15** "explain the term activation energy"; **CC7.16** draw and label reaction profiles identifying activation energy | high | matched. Edexcel splits the profile-drawing skill out as its own statement, which is a good argument for giving it its own section here |
| — | (CCEA covers concentration and surface area under the same outcomes) | §5.6.1.2 lists the five factors including **pressure of reacting gases** | CC7.4 also names **pressure** | high | **Pressure of reacting gases is beyond CCEA** at Double Award. Every AQA resource will include it |
| — | (no CCEA equivalent here) | §5.6.2.4–5.6.2.7 Le Chatelier-style equilibrium shifts (HT) | CC7.9–CC7.14 energy changes, bond energies | high | **beyond this topic**; CCEA covers equilibrium in `c2-equilibrium` and bond energies in `c2-energy-changes` |

Searches run: `collision`, `activation energy`, `catalyst`, `surface area to volume`, `manganese` across the AQA 8464 and Edexcel 1SC0 extracted texts. `manganese` returns **zero** in both — the named catalyst is CCEA's alone.

---

## 2. Teaching angles worth recreating (in our own words)

1. **"Not all collisions are successful", said until it is boring.** *RSC Education, "Teaching rates of reaction and collision theory at 14–16" (CPD article).* The RSC's position is that this single sentence cannot be over-repeated at this age, because learners who know particles move constantly conclude that they must constantly react. Our own examiner says the same thing from the other side: candidates wrote "more collisions" where the mark needed "more **successful** collisions". So the adjective is the mark. Put it in the section heading, in the gate answer, in the feedback, and in the retrieval prompt.

2. **The playground.** *RSC, same article.* More children in the playground means more bumping into each other — that is concentration. Children running instead of walking bump **more often** and **harder** — that is temperature, and it is why temperature gets two marks where concentration gets one. **Where it breaks:** a bump between children is never "successful", so the analogy carries frequency and energy but not the activation-energy threshold. Say that when you use it; an analogy without its limit becomes the next misconception.

3. **Johnstone's triangle, used as a lesson structure.** *RSC cites Johnstone's three levels — what you can see, what the particles are doing, and the symbols and graphs.* This maps onto our section structure directly: §1 what you observe (fizzing stops sooner), §2 what the particles are doing (the collision picture), §3 how it is written down (the rate graph, the reaction profile). Moving deliberately between the three levels, and saying which level you are on, is the difference between a lesson and a list.

4. **Rate is not yield.** *RSC names this as the second big misconception: "an increased rate of reaction results in more product — it doesn't".* It looks reasonable when a gas syringe fills faster. The fix is the three-curve rate graph where all three lines reach the **same plateau**: steeper means sooner, not more. This is a Higher-discriminating idea and it is the one place this topic and `c2-measuring-rates` must agree.

5. **Definition versus effect, kept apart on purpose.** *Follows from our Summer 2025 C2 Higher finding ("catalyst effect confused with its definition") and from the way Edexcel splits CC7.6 from CC7.7.* A catalyst's **definition** is what it is and what happens to it (speeds the reaction; not used up; unchanged in mass; not in the equation). Its **effect** is how it does it (an alternative pathway of lower activation energy — Higher only). Teach them in two separate sections with two separate gates, and make the definition gate a data item ("here is a table of masses before and after — which substance was the catalyst?").

6. **Surface area is a ratio, not an area.** *AQA §5.6.1.3 explicitly asks for "surface area to volume ratio", and MS 5c is flagged against it.* Cutting one cube into eight doubles the total surface area while the volume is unchanged — that is a calculation she can do, and doing it once is worth more than the phrase "bigger surface area" repeated four times.

---

## 3. The representation to rebuild as our own SVG

**Hero figure: the collision budget, four panels.** `viewBox` about `0 0 1000 560`. A 2 × 2 grid of identical square "reaction boxes", each 300 × 200, each showing the *same* reaction, with a counter strip beneath.

- Every box contains particles of two kinds, drawn as small circles distinguished by **outline style** (solid ring / double ring), never by colour. Short motion lines behind each particle show speed: one stroke for slow, three for fast.
- Inside each box, a few collisions are drawn as touching pairs. **Successful** collisions are marked with a small starburst; unsuccessful ones are drawn touching with no mark. *This is the whole figure's job.*
- Under each box, a two-line counter: `collisions per second: N` and `successful collisions per second: n`, with `n` always much smaller than `N`.
- **Panel A — baseline.** 12 particles, slow, `N = 20`, `n = 2`.
- **Panel B — higher concentration.** 24 particles, same speed. `N = 40`, `n = 4`. Caption: more particles in the same volume → collisions **more often**. Same fraction successful.
- **Panel C — higher temperature.** 12 particles, fast (three motion strokes), `N = 40`, `n = 8`. Caption: **two** things changed — more often **and** a bigger fraction have enough energy. The counters must show `n` rising more than proportionally; that visible difference is why temperature earns two marks and concentration one.
- **Panel D — catalyst present.** 12 particles, slow, plus a shaded block labelled "catalyst surface". `N = 20` (unchanged) and `n = 8`. Caption: the collisions are no more frequent; **more of them succeed**, because the energy needed is lower.
- **Generator parameters:** `panels: ("base"|"conc"|"temp"|"catalyst"|"surface")[]`, `showCounters: boolean` (off for a gate that asks her to predict the counters), `particleCounts` and `collisionCounts` as data so the numbers are computed, never typed. Add a `"surface"` panel option showing one block versus eight smaller blocks of the same total volume, with only the outer faces available for collision.
- Accessibility: outline style and the starburst carry all the meaning; `<title>` says "four reaction boxes comparing how often particles collide and how many collisions succeed".

**Second figure: the reaction profile, catalysed and uncatalysed.** `viewBox` about `0 0 760 420`. Energy on the vertical axis (labelled "energy", no numbers), progress of reaction on the horizontal. Two curves from the **same reactant level** to the **same product level**: a solid curve with a high peak, a dashed curve with a lower peak. Two vertical arrows from the reactant level to each peak, labelled `Eₐ without a catalyst` and `Eₐ with a catalyst`. One horizontal arrow between the two levels labelled "energy change — the same either way".
**The two things that must be visually unmissable are that the curves start together and end together.** That single fact answers "why is the final amount of product unchanged?", "why is the energy change unchanged?" and "what exactly does a catalyst do?" — three separate marks.
Generator parameters: `catalysed: boolean` (draw one curve or two), `exothermic: boolean` (products below or above reactants), `labels: "full" | "blank"`.

**Third, small: the cut cube.** One cube of side 2 units beside eight cubes of side 1. Total volume equal; surface area 24 against 48. Print both numbers. Twenty seconds to draw and it converts a phrase into arithmetic.

---

## 4. Practicals CCEA also examines

CCEA's Prescribed Practical **C4** (rate of reaction) is tagged to `c2-measuring-rates`, but this topic supplies the explanations C4's write-up is marked on, and Unit 7 Booklet B asks about method choices. Variants worth knowing:

| Variant | Where it comes from | Measured variable | Why it is worth recording |
|---|---|---|---|
| Sodium thiosulfate + acid, "disappearing cross" | AQA required practical 11 (the colour-change/turbidity method); RSC lists it first | time for a printed cross to stop being visible | Subjective end point — the evaluation question writes itself. **RSC's language note:** say "you can no longer see the cross", never "the cross has disappeared", because the latter feeds the "if I can't see it, it isn't there" misconception |
| Marble chips + hydrochloric acid, gas collected | AQA RP 11 (gas-volume method); Edexcel CC7.1a | volume of CO₂ against time, or mass loss on a balance | The standard CCEA C4 shape. Two methods for one reaction is a ready-made "suggest another method" part |
| Magnesium **block** against magnesium **powder** | RSC | time to fizz out | The cleanest surface-area demonstration; the cut-cube figure is its model |
| Hydrogen peroxide with different catalysts | AQA §5.6.1.4 names this as the catalyst investigation; RSC adds washing-up liquid so the oxygen is trapped as foam | height or volume of foam, or gas collected | **This is where MnO₂ belongs**, and MnO₂ for H₂O₂ is the fact our examiner says candidates could not recall. Adding a second catalyst (liver, potato, iron(III) oxide) makes it a fair-test question |
| Cornflour ignited in air | RSC, as a demonstration | qualitative | Surface area at its most memorable. Demonstration only; do not write it as a learner practical |

CCEA's data-handling demand on all of these is the same: calculate a rate from a graph or a pair of readings, and say what would make the comparison fair.

---

## 5. Question types the other boards use that CCEA also rewards

1. **"Explain, in terms of collision theory, why increasing the temperature increases the rate of reaction" [3].** The universal shape. The mark-scheme habit worth copying exactly: **one mark for what the particles do** (move faster / have more energy), **one for collision frequency** (collide more often), **one for the energy condition** (a greater proportion of collisions have at least the activation energy, so more **successful** collisions per second). Author the scheme so a bald "the particles move faster" earns one and stops, and let the feedback name the missing two. Concentration and surface area take the same shape but drop the third mark — and CCEA's tariffs reflect that, so do not write a 3-mark concentration part.
2. **"A catalyst was added to the reaction. Explain why the total volume of gas collected was unchanged" [2].** AQA and Edexcel both use it; it is the direct test of the rate-is-not-yield misconception and it is the single best discriminating question on this topic. Two marks: the catalyst changes only how fast, and the amounts of reactant are unchanged.
3. **Identify-the-catalyst from data [1–2].** A table of masses before and after, or an equation in which one named substance does not appear. Marks for "its mass is the same at the end" and "it is not in the equation". This is Edexcel CC7.6's wording turned into an item, and it separates the definition from the effect.
4. **Label the reaction profile [2–3].** Mark the activation energy, mark the energy change, and add the curve for the catalysed route. Our `label` answer kind handles the first two; the third is a `figure`-plus-`choice` item ("which of these three dashed curves shows the catalysed route?" — with distractors that change the product level and the reactant level, since those are the wrong answers that matter).

---

## 6. Misconception framings worth borrowing

| Misconception | The framing that fixes it | Source |
|---|---|---|
| All collisions produce a reaction | "Not all collisions are successful" — said every time, in the heading, the gate and the feedback | RSC CPD article; the direct cause of our Summer 2025 C2 Higher finding |
| "More collisions" is a complete answer | The mark is the adjective and the time unit: **more successful collisions per unit time**. Write it as a phrase she copies once and reuses | our own Summer 2025 C2 Higher finding |
| A faster rate gives more product | Three rate curves, different steepness, **same plateau**. Steeper means sooner, not more | RSC names this explicitly |
| A catalyst is "used up slowly" | Its mass is the same at the end and it is not in the equation. Make her check both in a data item | Edexcel CC7.6's wording |
| The catalyst's definition is its explanation | Two sections, two gates: *what it is* (F) and *how it does it* (H, lower activation energy) | our own Summer 2025 C2 Higher finding ("catalyst effect confused with its definition") |
| Activation energy is the energy a reaction gives out | It is the **minimum energy particles must have to react** — a threshold before, not an output after. The profile figure puts it on the way up | RSC; AQA §5.6.1.3 wording |
| "The cross disappeared", so the substance went away | Say "you can no longer see the cross" | RSC's language recommendation |
| Surface area means the size of the lump | It is surface area **to volume**; cut the cube and count | AQA MS 5c flag on §5.6.1.3 |

---

## 7. Photographs (Commons, licence checked 19 Sep 2026) and simulations

| File | Licence | Size | Use and prompt |
|---|---|---|---|
| `File:Manganese-dioxide-sample.jpg` (Benjah-bmm27) | Public domain | 1765×1324 | A sample of MnO₂ — the catalyst CCEA names and our examiner says candidates could not recall. Seeing the black powder once is worth more than reading the formula five times. Prompt: "this is recovered, dried and weighed after the reaction. What would the balance read, and why?" |
| `File:Katalyticky.rozklad.peroxidu.vodiku.png` (Knappová Tereza) | CC BY 4.0 | 1170×1894 | Catalytic decomposition of hydrogen peroxide, captured as a sequence. The best single image of a catalyst *working* |
| `File:Elephant Toothpaste Denver JDS Labs.jpg` | CC BY-SA 2.0 | 3096×2474 | The foam demonstration. Prompt: "the catalyst is still in the beaker at the end. What does that tell you about a catalyst?" |
| `File:Καταλύτης Βενζινοκίνητου Οχήματος 03.tif` (Galadrid) | CC BY-SA 4.0 | 1024×943 | A car catalytic converter's honeycomb. The honeycomb *is* the surface-area argument in a real object — one photo that joins catalysis and surface area. Note the `.tif` format; convert on fetch |
| `File:Manganese dioxide.jpg` (W. Oelen) | CC BY-SA 3.0 | 500×667 | Fine crystals; an alternative if the PD sample image reads too flat |

**Commons is thin on school rate-of-reaction apparatus.** Searches for gas-syringe set-ups, thiosulfate cloudiness and magnesium-plus-acid test tubes returned nothing usable. That is a finding, not a gap to paper over: the apparatus in this topic should be **our own SVG**, and the photographs should be the catalyst and the honeycomb.

**Simulations — verified 19 September 2026 (all returned HTTP 200):**
- **PhET *States of Matter: Basics*** — `phet.colorado.edu/sims/html/states-of-matter-basics/latest/states-of-matter-basics_en.html`. Task: raise the temperature and watch the particle speeds, then say in one sentence why a hot reaction mixture reacts faster, using the words *often* and *energy*.
- **PhET *Diffusion*** — already in `media-map.json` for this slug. Honest note: it models concentration difference and particle movement, **not** reaction. Keep it, but write the task so it is about collision frequency, not about rate.
- **PhET *Gas Properties*** — the pressure/temperature/particle-count relationships; useful for the temperature panel, but pressure itself is beyond CCEA, so frame the task carefully.
- **PhET *Reactions & Rates* does not exist as HTML5.** `reactions-and-rates`, `rate-of-reaction` and `collision-theory` all return **404**. Do not record any of them.
- **Falstad's gas applet** (`falstad.com/gas/`, returns 200) is what the RSC article recommends for watching individual particles and the energy distribution. It is a third-party page with no stated open licence — **link out only, never embed**.

**Videos already held:** Cognito `JK7yPzO9POU` (Factors Affecting Rate & Collision Theory) and Freesciencelessons `WojotwxPD6I` (Effect of Surface Area on Rate). Both are AQA-shaped and both will include **pressure of reacting gases**, which CCEA does not examine. One `notonspec` line covers it.

---

## 8. Scope note

**Beyond CCEA — `notonspec` if used:**
- **pressure of reacting gases** as a factor (AQA §5.6.1.2, Edexcel CC7.4)
- Maxwell–Boltzmann distribution curves (post-16; RSC flags them as post-16 in the same article)
- catalysts by name beyond MnO₂ — AQA explicitly says its candidates need none, so a list of industrial catalysts is wasted effort here
- enzymes as biological catalysts in *this* topic (Edexcel CC7.8 and AQA §5.6.1.4 both mention them; CCEA teaches enzymes in B1)
- bond energies and calculating energy change (CCEA: `c2-energy-changes`)
- equilibrium and the effect of changing conditions (CCEA: `c2-equilibrium`)
- collision *orientation* as a requirement for a successful collision — true, taught at A-level, and not a CCEA mark

**CCEA-only or CCEA-specific:**
- **manganese(IV) oxide as the catalyst for hydrogen peroxide**, named in the specification. No AQA or Edexcel statement names it
- the exact phrase the mark scheme wants: **"more/fewer successful collisions per unit time"**
- the split between 2.3.5 (Foundation: what a catalyst is) and 2.3.6 (Higher: the alternative pathway) — a Foundation learner needs the definition fluently and the profile not at all

---

## 9. Sources consulted

- AQA GCSE Combined Science: Trilogy 8464 specification PDF, §5.6.1.2, §5.6.1.3, §5.6.1.4 (read in full), §5.6.2 (scope boundary)
- Pearson Edexcel GCSE (9-1) Combined Science 1SC0 specification PDF, CC7.1–CC7.8, CC7.15, CC7.16
- Royal Society of Chemistry, *Teaching rates of reaction and collision theory at 14–16*, CPD article, `edu.rsc.org/cpd/teaching-rates-of-reaction-and-collision-theory-at-14-16/4021531.article` — teaching sequence, playground analogy, Johnstone's triangle, both misconceptions, the language recommendations and the five practicals
- PhET Interactive Simulations, direct-run URLs checked for HTTP 200 on 19 September 2026
- Wikimedia Commons API for every file above
- `data/spec/double-award-science-topics.json` → `c2-collision-theory-catalysts` (`examinerEvidence`, Summer 2025 C2 Higher)
- `data/links/media-map.json` key `science:c2-collision-theory-catalysts`
