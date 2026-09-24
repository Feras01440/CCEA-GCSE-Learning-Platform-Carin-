# Enrichment dossier — p2-solar-system-satellites

**CCEA** Double Award Science, **P2** §2.5 Space Physics · outcomes 2.5.1 to 2.5.4 · tier **F** · difficulty 2 · no prescribed practical
**CCEA must-recall:** the Solar System — the Sun, rocky inner planets, gas giants, moons, asteroids and comets. Order: **Mercury, Venus, Earth, Mars, Jupiter, Saturn, Uranus, Neptune**. **Gravity provides the force** for the orbital motion of planets, comets, moons and artificial satellites. Satellites: Earth observation, weather monitoring, astronomy, communications.
**Compiled** 20 September 2026 · 26 minutes
**Headline** `ccea-only` against combined science — **space physics is AQA Physics 8463 §4.8 (physics only), and Edexcel's own Combined Science specification prints "Topic 7 – Astronomy" under the heading "only found in the GCSE in Physics"**. So every resource she can reach was written for Triple. Two of CCEA's three recorded failures in this section are not astronomy at all: **gravity described as a "push"** and **meteors listed among orbiting objects**. The first recurs in `p2-stars-and-fusion` as well, which makes "gravity always pulls" the single sentence this whole section turns on.

---

## 1. Crosswalk

| CCEA | AQA | Edexcel 1SC0 | Confidence | Status |
|---|---|---|---|---|
| 2.5.1, 2.5.2 — contents and order of the Solar System | **AQA Physics 8463 §4.8.1.1** *Our solar system* — one star, eight planets, dwarf planets, natural satellites; the Solar System as a small part of the Milky Way | **unmatched** — Topic 7 Astronomy is Physics-only | high | **ccea-only** |
| 2.5.3 — gravity provides the force for orbital motion | **8463 §4.8.1.3** *Orbital motion, natural and artificial satellites* — "gravity provides the force that allows planets and satellites (both natural and artificial) to maintain their circular orbits" | **unmatched** | high | **ccea-only**, but 8463 §4.8.1.3 is an almost exact wording match |
| 2.5.4 — uses of artificial satellites | **8463 §4.8.1.3** asks for "the similarities and distinctions between the planets, their moons, and artificial satellites" | **unmatched** | high | **ccea-only** |

**Scope deltas outwards.** AQA adds **dwarf planets** and the **Milky Way** as named objects, and a **Higher-only** pair of orbital relationships: that gravity can change a satellite's *velocity* while its *speed* stays the same, and that a stable orbit's radius must change if the speed changes. All three are beyond CCEA. Conversely **AQA never names asteroids or comets**, which CCEA does.

---

## 2. Teaching angles worth recreating (in our own words)

1. **Gravity always pulls. Never once pushes.** *CCEA Summer 2025 P2 Foundation records gravity described as a "push", and the same finding recurs on `p2-stars-and-fusion` — so it is the section's defining error, not a one-off slip.* Say it as a flat rule at the top of the lesson, repeat it in every explanation, and add it to the reject list of every relevant answer. Nothing else in this topic is as valuable.

2. **An orbit is falling without arriving.** *The standard framing that makes "gravity pulls" and "it keeps going round" compatible, rather than contradictory.* A satellite is moving sideways fast enough that, as gravity pulls it towards the Earth, the Earth's surface curves away beneath it at the same rate. So it never gets closer and never escapes. This answers the question a good learner will ask — *if gravity pulls it in, why doesn't it fall?* — and it prevents the invented "outward push" that our examiner records.

3. **Order the planets by what they are, not just by name.** *AQA §4.8.1.1's framing — one star, eight planets — plus CCEA's own rocky/gas-giant split.* Four small rocky planets, then four large gas giants, with the asteroid belt at the join. Grouping them makes the sequence recallable as two fours rather than eight arbitrary names, and it is also the answer to "why are the inner planets rocky?" if it ever comes up.

4. **Asteroid, comet, moon, meteor — sort them once, properly.** *CCEA Summer 2025 records meteors being listed among orbiting objects.* An **asteroid** is a rocky body orbiting the Sun, mostly between Mars and Jupiter; a **comet** is ice and dust on a long stretched orbit, growing a tail near the Sun; a **moon** orbits a planet; a **meteor** is the streak of light made by something burning up in the atmosphere — it is an *event*, not a body in orbit. That last distinction is the recorded failure and deserves its own gate.

5. **Natural and artificial satellites are the same physics.** *AQA §4.8.1.3 asks explicitly for the similarities and distinctions.* A moon and a weather satellite both orbit because gravity pulls them; the only difference is who put them there. Framing it that way means the four uses in CCEA's list (Earth observation, weather, astronomy, communications) hang on one idea rather than being a list to memorise.

6. **Match the use to the orbit, in one sentence each.** *An application angle both boards invite.* A weather or communications satellite sits high over one place so it always sees the same region; an Earth-observation satellite passes low over the poles so the planet turns beneath it and it eventually sees everywhere; a space telescope is above the atmosphere so the air does not blur its view. CCEA does not require the orbit names, so give the *reason* and keep the jargon out.

---

## 3. The representation to rebuild as our own SVG

**Hero figure: the Solar System, correctly ordered, not to scale — and saying so.** `viewBox` about `0 0 1020 400`.

- The **Sun at the left**, clearly larger, with a caption. Placing it at the left matters: our Summer 2025 evidence records the Sun drawn **on the wrong side** of a Solar System diagram, which means candidates were drawing it at the far end of the orbits.
- The eight planets in order along a horizontal band, each labelled, with the **four rocky planets grouped under one bracket** and the **four gas giants under another**.
- The **asteroid belt** drawn as a band of small dots between Mars and Jupiter, labelled.
- A **comet** on a long elliptical path crossing the band, with its tail pointing **away from the Sun** — which is itself a small teaching point.
- A prominent caption: **not to scale — neither the sizes nor the distances.** Then one honest line giving a sense of the real scale.
- **Generator parameters:** `showBelt: boolean`, `showComet: boolean`, `labels: "full" | "blank"`, `group: "none" | "rocky-gas"`, `bodyCount: 8`. Positions from a fixed ordered list so the sequence can never be emitted wrongly.

**Second figure: falling without arriving.** `viewBox` about `0 0 700 700`. A circle for the Earth, a satellite above it, and **three trajectories from the same starting point**: one too slow (curving down into the surface), one at the right speed (a closed circle), one too fast (curving away). A single **gravity arrow on the satellite pointing at the Earth's centre** in every case, labelled *always towards the centre, always a pull*. Caption: *the sideways speed decides the shape; gravity only ever pulls.* **Generator parameters:** `speeds: number[]`, `showGravityArrow: boolean`, `labelPaths: boolean`.

**Third, small: the sorting card.** Four cards — *asteroid*, *comet*, *moon*, *meteor* — each to be matched to a one-line description, with the meteor's description deliberately phrased as *"a streak of light — an event in our atmosphere, not a body in orbit"*. Maps onto our `label` answer kind and targets the recorded finding directly.

---

## 4. Practical variants CCEA also examines

No prescribed practical, and none is possible. Two activities that are genuinely examinable as written work:

- **Scale modelling.** Lay out the planets' distances along a corridor or a playground using a chosen scale. It is arithmetic — ratio and proportion, which is her maths — and it produces the honest answer to "why is every diagram not to scale?".
- **Tracking a satellite pass.** Naked-eye observation of the ISS, which needs no equipment and connects the abstract to something she can look at.
- The transferable **Unit 7** demand here is **reading and criticising a diagram**: what a "not to scale" label licenses and what it does not, which is a general data-handling skill worth one item.

---

## 5. Question types the other boards use that CCEA also rewards

1. **"Name the planets in order from the Sun" [2].** Our `order` answer kind, which marks a sequence directly.
2. **"Name the force that keeps the Moon in orbit around the Earth" [1].** One word, and the follow-up *"In which direction does it act?"* is where the "push" error is caught.
3. **"Explain why a satellite stays in orbit instead of falling to Earth" [3].** The falling-without-arriving argument. Marks: gravity pulls it towards the Earth; it is moving sideways; so it follows a curved path around.
4. **"Give two uses of artificial satellites" [2].** CCEA's own list.
5. **"State one difference between an asteroid and a comet" [1].** And *"Explain why a meteor is not an orbiting object" [1]* — the recorded failure.
6. **"Suggest why this diagram of the Solar System cannot be drawn to scale" [2].** A criticism item, and it rewards a real number.

---

## 6. Misconception framings worth borrowing

| Misconception | The framing that fixes it | Evidence |
|---|---|---|
| Gravity described as a push | Gravity **always pulls**, and always towards the centre of the larger mass. State it flatly, repeat it everywhere | **CCEA S2025 P2 Foundation** — and again on `p2-stars-and-fusion` |
| An outward force is invented to balance gravity | There is only one force. The sideways motion, not a second force, is what keeps the satellite up | the three-trajectory figure |
| Meteors listed as orbiting bodies | A meteor is a **streak of light** in our atmosphere — an event, not an object in orbit | **CCEA S2025 P2 Foundation** |
| The Sun drawn at the wrong end | The Sun is at the centre; everything orbits it. Our figure puts it first and labels it | **CCEA S2025 P2 Foundation** |
| Diagrams read as if to scale | Say what the real ratio is once, with a number | universal, and a legitimate exam question |
| Satellites need engines to stay up | They coast. Fuel is for changing the orbit, not maintaining it | follows from the orbit figure |
| Asteroid and comet used interchangeably | Rock, short orbit, mostly in the belt versus ice and dust, long stretched orbit, tail near the Sun | CCEA names both; AQA names neither |

---

## 7. Photographs and simulations

**Photographs.** Space imagery is abundant and much of it is **public domain via NASA**, which is the easiest licensing in the whole pack. Worth sourcing with `pipeline/enrichment/check-commons-licence.mjs`: a **full-disc image of a gas giant** (Jupiter or Saturn, for the rocky/gas contrast), a **comet with a visible tail**, and an **artificial satellite in orbit above the Earth**. Each needs a prompt: for the comet, *why does the tail point away from the Sun rather than backwards along its path?*; for the satellite, *what force keeps this in orbit, and in which direction does it act?*

**Simulation already held, and it is the strongest possible fit:** **PhET *Gravity and Orbits***. It lets her switch gravity **off** mid-orbit and watch the body fly off in a straight line — which is the most direct possible demonstration that gravity is what curves the path, and the most direct refutation of the "push" misconception. Three tasks worth authoring:
1. Run the Sun–Earth system, then turn gravity off and describe what happens and why.
2. Change the satellite's starting speed and find the value that gives a circular orbit — the three-trajectory figure, built by her.
3. Switch on the gravity-force arrows and state which way they always point.

**Videos already held:** Freesciencelessons and Cognito. Both are **Triple Science** space physics, so both will cover dwarf planets, the Milky Way, and probably the Higher circular-orbit relationships. One `notonspec` line covers it, and the `why` line should say this is Triple content in England and Double Award here.

---

## 8. Scope note

**Beyond CCEA — mark `notonspec` if it appears:**
- **dwarf planets** and the **Milky Way** as named objects (AQA 8463 §4.8.1.1)
- the **Higher orbital relationships**: gravity changing velocity but not speed, and the radius changing with speed (AQA §4.8.1.3, HT only)
- orbit **types by name** — geostationary, polar, low Earth
- `g` as a field strength, weight on other planets, orbital period calculations
- **dark matter and dark energy** (AQA's §4.8 introduction)
- the history of the heliocentric model

**CCEA-only:** the entire topic against combined science — AQA confines it to Physics 8463 and Edexcel states in its own combined specification that Topic 7 Astronomy is found only in GCSE Physics. **Asteroids and comets** are named by CCEA and by neither board.

---

## 9. Sources consulted

- `data/enrichment/crosswalk.json` → `science:p2-solar-system-satellites` (status `ccea-only`, high confidence)
- AQA GCSE Physics 8463 specification, **§4.8.1.1** and **§4.8.1.3** (read in full), and the §4.8 introduction for the scope boundary
- Pearson Edexcel GCSE (9-1) Combined Science 1SC0 specification — "The following topics are only found in the GCSE in Physics: Topic 7 – Astronomy", read directly from the specification text
- `data/spec/double-award-science-topics.json` → `p2-solar-system-satellites`: outcomes 2.5.1–2.5.4, `mustRecall`, and the Summer 2025 P2 Foundation `examinerEvidence` entry
- `data/links/media-map.json` key `science:p2-solar-system-satellites`
