# Enrichment dossier — c2-atmosphere-nitrogen-ammonia

**CCEA** Double Award Science, **C2** §2.9 Gas Chemistry · outcomes 2.9.1 to 2.9.3 (F), **2.9.4 (H)** · tier mixed · difficulty 2 · no prescribed practical
**CCEA must-recall:** air — about **78% nitrogen, 21% oxygen, 0.03–0.04% carbon dioxide, 1% argon**, traces of other noble gases and varying water vapour. Nitrogen is a **colourless, odourless, unreactive** gas because of its **triple covalent bond**; used as a **coolant** (liquid nitrogen) and in **food packaging**. **Higher:** the **ammonia test** — a glass rod dipped in concentrated hydrochloric acid gives **white smoke** (ammonium chloride); ammonia + acids make **fertilisers**.
**Compiled** 20 September 2026 · 28 minutes
**Headline** Four separate pieces of CCEA content here have **zero hits in any comparison specification**: the **precise air composition** (AQA gives only "about four-fifths nitrogen, about one-fifth oxygen"), **argon by name**, the **triple covalent bond** as nitrogen's reason for being unreactive, and the **ammonia test**. What *is* matched is the Haber process context (Edexcel CC4.15, CC4.16) and the Earth's atmosphere story (CC8.18 to CC8.22) — but CCEA needs neither in this topic. Our Summer 2025 C2 Higher evidence is about a **sustainability argument** on an ammonia-based preparation, which is the same weakness recorded on `c2-concentration-atom-economy`; the two should share a sentence frame.

---

## 1. Crosswalk

| CCEA | AQA 8464 | Edexcel 1SC0 | Confidence | Status |
|---|---|---|---|---|
| 2.9.1 — the composition of air, with figures | **§5.9.1.1** — "about four-fifths (approximately **80%**) nitrogen; about one-fifth (approximately **20%**) oxygen; small proportions of various other gases, including carbon dioxide, water vapour and noble gases" | **unmatched** for present-day composition; CC8.18–CC8.22 cover the **early** atmosphere | high | **partial** — the idea matches, **CCEA's precision does not** |
| 2.9.2 — nitrogen's properties and its **triple covalent bond** | **unmatched** — zero hits for "triple bond" or "triple covalent" | **unmatched** | high | **ccea-only** |
| 2.9.3 — uses of nitrogen: coolant, food packaging | **unmatched** | **unmatched** | high | **ccea-only** |
| 2.9.4 (H) — the **ammonia test**; ammonia + acids → fertilisers | **unmatched** — AQA's gas tests (§5.8.2) are hydrogen, oxygen, carbon dioxide and chlorine only | **unmatched**; **CC4.15**, **CC4.16** cover ammonia via the **Haber process**, not its test | high | **ccea-only** |

Evidence: `argon`, `triple bond`, `triple covalent` all return **zero hits** in AQA 8464, AQA 8462 and Edexcel 1SC0.

**Scope deltas outwards.** Edexcel puts considerable weight on the **Earth's early atmosphere** (CC8.18–CC8.22: volcanic gases, oceans forming by condensation, carbon dioxide decreasing, primitive plants releasing oxygen) and on the **Haber process conditions** (CC4.16: 450 °C, high pressure, iron catalyst); AQA covers the early atmosphere in §5.9.1.2–§5.9.1.4. **None of that is CCEA C2 §2.9**, and a borrowed "atmosphere" page will be mostly about it.

---

## 2. Teaching angles worth recreating (in our own words)

1. **Give the real numbers, because CCEA does and nobody else does.** *AQA rounds to 80% and 20%; CCEA asks for 78%, 21%, about 0.04% and 1% argon.* A pie chart drawn from AQA's figures will be *wrong* for a CCEA answer. Teach the four numbers as a set, note that they sum to about 100%, and flag that most textbooks round — which is a small lesson in reading a source critically as well as a mark.

2. **Argon is the surprise, and surprise is memorable.** *CCEA names it; no other specification mentions it at all.* Almost 1% of the air is a noble gas — more than twenty times as much as carbon dioxide. That comparison is the hook, and it links to `c1-group-0-and-transition-metals`, where she met the noble gases and their inertness.

3. **Nitrogen is unreactive *because* of the triple bond — the "because" is the mark.** *CCEA-only: zero hits anywhere for the triple covalent bond.* Three shared pairs of electrons between the two nitrogen atoms make an exceptionally strong bond, so the molecule is very hard to break apart, so it takes part in few reactions. Bond strength → hard to break → unreactive is a three-link chain, and it reuses the covalent-bonding work from `c1-covalent-bonding`, so it is a second application rather than new content.

4. **Every use of nitrogen follows from one property.** *CCEA names two uses; giving the reason makes them recallable.* **Food packaging**: nitrogen is unreactive, so it displaces oxygen and the food does not oxidise or go mouldy as fast. **Coolant**: liquid nitrogen is extremely cold and, because it is unreactive, it can be in contact with things safely. One property, two applications — and that is the shape the exam question takes.

5. **The ammonia test is the only "white smoke" test in the pack — teach what you *see*.** *CCEA-only, and Higher.* Hold a glass rod dipped in concentrated hydrochloric acid near the gas: **white smoke** forms, which is solid ammonium chloride made where the two gases meet. Not a "white precipitate" (that is in solution) and not a colour change — **smoke in the air above the rod**. Because no borrowed resource covers it, the observation wording must come from CCEA and be drilled.

6. **Ammonia plus acid makes a salt, and that salt is a fertiliser.** *CCEA's own clause.* The test reaction and the industrial use are the same chemistry: ammonia is a base, acids neutralise it, and the ammonium salts that result feed plants. Saying that once links the Higher test to the Foundation acid work in `c1-neutralisation-and-bases`.

7. **A sustainability argument needs the same three-part frame as atom economy.** *CCEA Summer 2025 C2 Higher records the sustainability of an ammonia-based preparation being poorly argued — and the identical weakness appears on `c2-concentration-atom-economy`.* Give her one frame and reuse it: **what is used up · what is wasted · what it costs**, then a sentence that actually decides. Teaching it once for both topics is worth more than two separate attempts.

---

## 3. The representation to rebuild as our own SVG

**Hero figure: the air, to scale, with the small ones magnified.** `viewBox` about `0 0 940 440`.

- A **single horizontal bar** representing 100% of dry air, divided to scale: nitrogen 78%, oxygen 21%, and a final sliver for everything else — each segment labelled with **name and percentage**.
- Because argon and carbon dioxide are invisible at that scale, a **magnified call-out** of the final 1% sliver, expanded into its own bar beneath and re-divided: **argon about 1%**, **carbon dioxide about 0.04%**, traces of other noble gases, plus a note that **water vapour varies** and is usually excluded from these figures.
- A caption: *many books round this to 80% and 20%. CCEA asks for the figures above.*
- **Generator parameters:** `gases` (name and percentage pairs), `magnify: string[]` (which segments to expand), `showRoundingNote: boolean`, `labels: "full" | "blank"`. Segment widths computed from the percentages; assert they sum to 100.

**Second figure: why nitrogen does nothing.** `viewBox` about `0 0 760 300`. Two panels. **Left** — a dot-and-cross diagram of N₂ with the **three shared pairs** clearly drawn between the two atoms, the shared electrons circled. **Right** — a three-box chain: *three shared pairs* → *a very strong bond* → *very hard to break, so unreactive*. Caption tying it to the uses: *this is why it can sit in a crisp packet and do nothing.* **Generator parameters:** `showChain: boolean`, `blankChain: boolean`, `molecule: "N2"`.

**Third, small: the ammonia test card.** A gas jar of ammonia with a **glass rod dipped in concentrated hydrochloric acid** held at its mouth, and **white smoke** drawn as a small cloud between them, labelled *white smoke — solid ammonium chloride*. Beside it, a struck-through label *white precipitate*, with a note that a precipitate forms in a liquid, not in the air. Ten lines of SVG against a Higher observation that no other board teaches.

---

## 4. Practical variants CCEA also examines

No prescribed practical on this outcome, though **Prescribed Practical C6** (gas preparation, properties and tests) sits on the neighbouring topics and shares its apparatus vocabulary.

| Activity | Source | What is seen | Why it matters |
|---|---|---|---|
| **The ammonia test** | CCEA-only, Higher | white smoke at the rod | The observation is the mark; no other board sets it |
| **Burning a candle in a sealed jar over water** | classic | water rises by about a fifth | The traditional measurement of oxygen's share, and it produces a real number to compare with 21% |
| **Liquid nitrogen demonstrations** | common | dramatic cooling | A demonstration only; the teaching point is that it is cold **and** unreactive |
| **Food packaging** | everyday | a crisp packet is inflated | The cheapest possible link between a property and an application — worth a question stem |

The transferable **Unit 7** demand is **describing an observation precisely** — smoke versus precipitate, and where it forms — and **making an argument from evidence** for the sustainability part.

---

## 5. Question types the other boards use that CCEA also rewards

1. **"Give the approximate percentages of nitrogen and oxygen in air" [2].** CCEA's figures, not AQA's rounded ones.
2. **"Name the gas that makes up about 1% of the air" [1].** Argon — CCEA-only, and a reliable mark.
3. **"Explain why nitrogen is unreactive" [2].** The triple bond and the consequence. Author "it is a noble gas" as a named `commonError`, since that is the plausible wrong answer.
4. **"Explain why nitrogen is used in food packaging" [2].** Unreactive, so it keeps oxygen out and the food lasts longer.
5. **"Describe a test for ammonia gas and give the result" [2].** Higher. A glass rod dipped in concentrated hydrochloric acid; **white smoke**.
6. **"Evaluate the sustainability of this preparation route" [3–4].** The recorded weakness. Use the same three-part frame as `c2-concentration-atom-economy`, and say so in the note so she sees it is one skill.

---

## 6. Misconception framings worth borrowing

| Misconception | The framing that fixes it | Evidence |
|---|---|---|
| Air given as 80% / 20% | Those are AQA's rounded figures. CCEA asks for **78%, 21%, ~0.04%, 1% argon** | AQA §5.9.1.1's own wording |
| Argon forgotten entirely | It is nearly 1% — more than twenty times the carbon dioxide | CCEA-only content |
| Nitrogen called unreactive "because it is a noble gas" | It is not a noble gas. It is unreactive because its **triple bond** is very hard to break | the dot-and-cross chain |
| "Triple bond" stated without the consequence | Strong bond → hard to break → few reactions. The chain is the mark | CCEA-only; zero hits elsewhere |
| The ammonia result called a white **precipitate** | **White smoke**, in the air at the rod. A precipitate forms in a liquid | the test card; CCEA's own wording |
| Carbon dioxide's share overestimated | About 0.04%. The magnified call-out shows how small that is beside argon | the scale figure |
| Sustainability answered as "it is better for the environment" | What is used up, what is wasted, what it costs — then decide | **CCEA S2025 C2 Higher**, and the same weakness on `c2-concentration-atom-economy` |

---

## 7. Photographs and simulations

**Photographs.** Two worth sourcing with `pipeline/enrichment/check-commons-licence.mjs`: **liquid nitrogen being poured** (the vapour cloud is striking and makes the coolant use concrete) and an **inflated crisp or salad packet**. Prompt the second with *what gas is in here, and why not just air?* — which is angle 4 asked as a question.

**Simulations: none mapped that model this, and none needed.** The content is composition figures, one bond and one observation; our own scale bar and dot-and-cross figure serve it better than any interactive. Do not reach for a general "gas particles" sim — it would model kinetic theory, which is `p1-density-kinetic-theory`.

**Videos already held:** check the entry's `why` lines carefully here, because the mismatch is large. Both boards' "atmosphere" material is mostly about the **Earth's early atmosphere and climate change** (AQA §5.9.1.2–§5.9.3; Edexcel CC8.18–CC8.26), which is **not** CCEA's §2.9. A video titled "the atmosphere" will spend most of its time off spec, and **none will cover the ammonia test, argon or the triple bond**. This is one of the clearest cases in the pack where the `why` line should tell her what the video is *not* for.

---

## 8. Scope note

**Beyond CCEA — mark `notonspec` if it appears:**
- the **Earth's early atmosphere**, volcanic outgassing, oceans forming, carbon dioxide decreasing, primitive plants releasing oxygen (AQA §5.9.1.2–§5.9.1.4; Edexcel CC8.18–CC8.22)
- **greenhouse gases, climate change and carbon footprint** (AQA §5.9.2; Edexcel CC8.24–CC8.26)
- **atmospheric pollutants** from fuels (AQA §5.9.3) — CCEA covers them in `c2-combustion-and-pollution`
- the **Haber process** and its conditions (Edexcel CC4.15, CC4.16) — CCEA touches ammonia only through the test and fertilisers
- nitrogen fixation and the nitrogen cycle (CCEA covers it in `b1-nitrogen-cycle`)
- the fractional distillation of liquid air

**CCEA-only:**
- the **precise composition of air**, including **argon** by name
- the **triple covalent bond** as the reason for nitrogen's unreactivity
- the **uses of nitrogen** (coolant, food packaging)
- the **ammonia test** and its white-smoke observation

---

## 9. Sources consulted

- `data/enrichment/crosswalk.json` → `science:c2-atmosphere-nitrogen-ammonia` (status `partial`, high confidence)
- AQA GCSE Combined Science: Trilogy 8464 specification, **§5.9.1.1** (read in full), §5.9.1.2–§5.9.3 for the scope boundary, and §5.8.2 for the gas tests AQA does set
- Pearson Edexcel GCSE (9-1) Combined Science 1SC0 specification, **CC4.15**, **CC4.16**, **CC8.18** to **CC8.22**
- `pipeline/enrichment/lookup-spec.mjs` searches for "argon", "triple bond" and "triple covalent" across AQA 8464, AQA 8462 and Edexcel 1SC0: **zero hits for all three**
- `data/spec/double-award-science-topics.json` → `c2-atmosphere-nitrogen-ammonia`: outcomes 2.9.1–2.9.4, `mustRecall`, and the Summer 2025 C2 Higher `examinerEvidence` entry
- `data/enrichment/science/c2-concentration-atom-economy.md` — for the shared sustainability-argument weakness, taught as one frame
- `data/links/media-map.json` key `science:c2-atmosphere-nitrogen-ammonia`
