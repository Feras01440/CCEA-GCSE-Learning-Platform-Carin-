# Enrichment dossier — p2-big-bang-evidence

**CCEA** Double Award Science, **P2** §2.5 Space Physics · outcomes 2.5.12, 2.5.14 (F), **2.5.13, 2.5.15 (H)** · tier mixed · **difficulty 4 — the hardest topic in P2 §2.5** · no prescribed practical
**CCEA must-recall:** the Universe began with the **Big Bang about 14 billion years ago**. **Higher:** rapid expansion and cooling → neutrons and protons form → further cooling lets nuclei form → electrons combine with nuclei to form hydrogen atoms. **Red shift:** light from other galaxies is shifted to the red end of the spectrum, explained by **space expanding**. **Higher:** **cosmic microwave background radiation** is further evidence; the Big Bang is currently the only model that explains it.
**Prerequisites in our taxonomy:** `p2-electromagnetic-spectrum`, `p2-stars-and-fusion`
**Compiled** 20 September 2026 · 30 minutes
**Headline** **CMBR appears in no specification at all.** Searching AQA Physics 8463 for "microwave background" and "CMB" returns nothing, and Edexcel's Combined Science specification prints Topic 7 Astronomy as "only found in the GCSE in Physics". Yet CCEA examines CMBR at Higher, and our Summer 2025 P2 Higher evidence records it being **confused with "light from stars"** — the single most important thing this dossier has to fix. AQA §4.8.2 does supply an excellent model for the **red-shift** half, and its wording is worth following closely. The age of the Universe and the Higher cooling sequence are CCEA's own too.

---

## 1. Crosswalk

| CCEA | AQA | Edexcel 1SC0 | Confidence | Status |
|---|---|---|---|---|
| 2.5.12 — the Big Bang, about 14 billion years ago | **AQA Physics 8463 §4.8.2** — "the Big Bang theory suggests that the universe began from a very small region that was extremely hot and dense". **No age is given** | **unmatched** | high | **ccea-only**; the age is CCEA's own |
| 2.5.13 (H) — the cooling sequence: neutrons and protons → nuclei → hydrogen atoms | **unmatched** | **unmatched** | high | **ccea-only** |
| 2.5.14 — red shift, and space expanding | **8463 §4.8.2** — "an observed increase in the wavelength of light from most distant galaxies. The further away the galaxies, the faster they are moving and the bigger the observed increase… The observed red-shift provides evidence that **space itself (the universe) is expanding** and supports the Big Bang theory" | **unmatched** | high | **ccea-only**, with an excellent AQA wording model |
| 2.5.15 (H) — CMBR as further evidence; the Big Bang is the only model explaining it | **unmatched** — zero hits for "microwave background" or "CMB" in AQA 8463 | **unmatched** | high | **ccea-only**, and unmatched everywhere |

**Scope deltas outwards.** AQA §4.8.2 adds that galaxy speed increases with distance (the Hubble relation in words), that **supernova observations since 1998 suggest distant galaxies are receding ever faster**, and — in the §4.8 introduction — **dark matter and dark energy**. All are beyond CCEA.

---

## 2. Teaching angles worth recreating (in our own words)

1. **Red shift is a stretch, and the stretch is the space itself.** *AQA §4.8.2's wording is the model: "an observed increase in the wavelength of light".* Light from distant galaxies arrives with a **longer wavelength** than it left with, which moves it towards the red end of the spectrum. The reason is not that the galaxies are flying through space away from us so much as that **the space between us and them is expanding**, stretching the light on its way. CCEA's `mustRecall` says "explained by space expanding", so the distinction is examinable and AQA states it in exactly the right words.

2. **Further away means more shift — and that is what makes it evidence.** *AQA states the relation plainly: the further away the galaxy, the bigger the observed increase.* A single red-shifted galaxy proves little; the *pattern* — the further, the faster — is what says everything is moving apart everywhere, which is what an expansion looks like from the inside. Building the argument in that order turns an observation into evidence, which is the whole of this topic's difficulty.

3. **Run the expansion backwards, and you get the Big Bang.** *The standard inference, and CCEA's 2.5.12.* If everything is moving apart now, then in the past everything was closer; far enough back, it was all in one very small, very hot region. That is the Big Bang — not an explosion **in** space but an expansion **of** it, which is the phrasing worth insisting on.

4. **CMBR is not starlight, and the exam will test exactly that.** *CCEA Summer 2025 P2 Higher records CMBR confused with "light from stars" — so this angle carries the topic.* Three separating facts, each worth stating:
   - it comes from **everywhere**, uniformly, not from points in the sky;
   - it is **microwave**, not visible — it is the leftover heat of the early Universe, stretched by the same expansion from high-energy radiation down into microwaves;
   - it is **not made by any object now** — it is the Universe's own afterglow.
   Say all three, then say the conclusion CCEA words carefully: the Big Bang is currently **the only model that explains it**.

5. **Two pieces of evidence, two different jobs.** *A structure worth imposing because the exam asks for both.* Red shift says the Universe **is expanding**. CMBR says it **was once hot and dense**. Neither alone is the Big Bang; together they are. Keeping the two claims separate stops her offering red shift twice when asked for two pieces of evidence.

6. **The cooling sequence is a sequence — teach the order, not the particles.** *CCEA 2.5.13, Higher, and it has no equivalent anywhere.* Rapid expansion and cooling → neutrons and protons form → more cooling lets nuclei form → electrons join nuclei to make hydrogen atoms. The physics behind each step is far beyond GCSE; what is examined is the **order**, and the through-line is simple: *the cooler it got, the more things could stick together*. Give her that one sentence and the sequence becomes reconstructible.

7. **"Currently the only model" is deliberate language.** *CCEA's own phrasing.* It is not "the Big Bang is true"; it is that no other model accounts for the observations. That is how science works, and copying CCEA's hedge is both accurate and exam-correct.

---

## 3. The representation to rebuild as our own SVG

**Hero figure: the stretched spectrum.** `viewBox` about `0 0 960 400`. Two spectra stacked on a shared wavelength axis.

- **Upper band — a laboratory hydrogen spectrum**, its absorption lines drawn as ticks at marked wavelengths, labelled.
- **Lower band — the same pattern from a distant galaxy**, the **identical spacing pattern** but every line shifted towards the long-wavelength end, with **arrows joining each line to its laboratory position** and a bracket labelled *shift*.
- A caption: *the pattern is the same, so it is the same element. Every line has moved towards the red end — the light has been stretched.*
- A second small panel beside it: **three galaxies at different distances**, each with its own shift bracket, the brackets getting longer with distance, captioned *the further away, the bigger the shift*.
- Because colour cannot be the only signal, the wavelength axis is marked with values and the ends are labelled in words (**shorter wavelength** / **longer wavelength — "red" end**).
- **Generator parameters:** `shift: number`, `galaxies: number[]` (distances), `showLabSpectrum: boolean`, `showConnectors: boolean`, `blankShift: boolean` for a gate. Line positions from the same fixed table used in `p2-stars-and-fusion`, so the two topics' spectra are visibly the same object.

**Second figure: the two pieces of evidence.** Two boxes side by side, each with its observation on top and its conclusion beneath:

| observation | what it tells us |
|---|---|
| light from distant galaxies is red-shifted, more so the further away | the Universe **is expanding** |
| microwave radiation arrives **uniformly from every direction** | the Universe **was once hot and dense** |

with a brace joining both to a single conclusion box: **the Big Bang**. This is angle 5 drawn, and it is the answer structure for the most common extended question.

**Third figure: the cooling timeline.** A horizontal arrow labelled *time* with four stations, each with a small particle picture and a one-clause caption: *too hot for anything to stick* → *neutrons and protons form* → *nuclei form* → *electrons join nuclei: hydrogen atoms*. A temperature arrow beneath, falling. Caption: *the cooler it got, the more things could stick together.* Generator: `stations: number[]`, `labels: "full" | "blank"` — the blank version is the Higher retrieval item.

**Fourth, small: the CMBR sorting card.** Two columns headed *light from stars* and *CMBR*, with six statements to place: *comes from points in the sky* · *comes uniformly from every direction* · *visible light* · *microwaves* · *made by objects now* · *left over from the early Universe*. Ten minutes to build, and it is the direct antidote to the recorded examiner finding.

---

## 4. Practical variants CCEA also examines

None possible. Three things that are examinable as written work:

- **The expanding-balloon model.** Dots inked on a balloon; as it inflates every dot moves away from every other, and the further apart two dots are, the faster they separate. It is the single best model for angle 2 and for "there is no centre". **Its limit, which must be stated:** the galaxies themselves do not expand, only the space between them, and the balloon's surface is two-dimensional where space is three.
- **Stretching a spectrum.** Draw the line pattern on a rubber band and stretch it: the pattern stays recognisable while every line moves apart. That is red shift in one object.
- The transferable **Unit 7** demand is **distinguishing an observation from a conclusion** — "light is red-shifted" versus "the Universe is expanding" — which is exactly what the two-piece evidence figure teaches and is a general skill worth its own item.

---

## 5. Question types the other boards use that CCEA also rewards

1. **"What is meant by red shift?" [2].** An increase in the wavelength of light from distant galaxies, towards the red end of the spectrum.
2. **"Explain how red shift provides evidence that the Universe is expanding" [3].** The pattern argument: all distant galaxies are shifted; the further away, the bigger the shift; so everything is moving apart, which is what expansion looks like from anywhere.
3. **"Give two pieces of evidence for the Big Bang" [2].** Red shift **and** CMBR — and the two-box figure is why she will not give red shift twice.
4. **"What is cosmic microwave background radiation?" [2].** Higher, and the recorded failure. Author the rejects to include "light from stars" and "radiation from galaxies", with feedback naming the three separating facts.
5. **"Describe what happened as the Universe expanded and cooled" [3–4].** Higher; the four-station sequence. Our `order` answer kind.
6. **"State the approximate age of the Universe" [1].** About 14 billion years — CCEA's own number, given by neither board.

---

## 6. Misconception framings worth borrowing

| Misconception | The framing that fixes it | Evidence |
|---|---|---|
| CMBR is light from stars | Three separating facts: from **everywhere**, **microwaves** not visible, and **not made by anything now** | **CCEA S2025 P2 Higher** — the recorded finding |
| The Big Bang was an explosion in space | It was an expansion **of** space. There is no centre and no outside | the balloon model, with its limits stated |
| Galaxies are flying through space away from us | The space between is stretching, and the light stretches with it | CCEA's "explained by space expanding"; AQA's "space itself is expanding" |
| Red shift means the galaxy is red | The whole pattern of lines moves towards the longer-wavelength end. The galaxy's colour is not the point | the two-spectra figure |
| One red-shifted galaxy is the evidence | The **pattern** — the further, the faster — is the evidence | AQA §4.8.2's own sequencing |
| Red shift offered twice when two pieces of evidence are asked for | Two observations, two different conclusions: expanding now, hot and dense then | the two-box figure |
| "The Big Bang is proved" | CCEA's own words: it is **currently the only model** that explains the observations | CCEA `mustRecall` |
| The cooling sequence learnt as particle physics | Only the **order** is examined, and the through-line is that cooling lets things stick together | CCEA 2.5.13 |

---

## 7. Photographs and simulations

**Photographs.** Two are worth sourcing with `pipeline/enrichment/check-commons-licence.mjs`, and both are likely to be available under open licences from **NASA/ESA**: the **all-sky CMBR map** (the WMAP or Planck image) and a **deep-field image of distant galaxies**. The CMBR map is the more valuable by far, because it makes the "from every direction" fact visible in one look — prompt it with *this map covers the whole sky. What does that tell you about where this radiation comes from, and why can it not be light from stars?*

Label the CMBR map honestly as a **map of measurements**, not a photograph of the sky in visible light, since presenting processed data as an ordinary image would mislead.

**Simulations: none, and that is now recorded.** PhET *Sound Waves* had been mapped to this slug; it models sound in air and has no red shift, no spectrum and nothing about expansion. Its only conceivable framing was a Doppler analogy, and CCEA teaches red shift as **expanding space**, not as a Doppler effect, so even that would have pushed against the specification. It was removed from `data/links/media-map.json` on 20 September 2026 and the slug's `sims` array is deliberately empty. There is no faithful free red-shift or CMBR sim in our verified set; the interactive here is our own parameterised spectrum figure with its `shift` parameter.

**Videos already held:** Freesciencelessons and Cognito. Both are **Triple Science** space physics and both cover red shift and CMBR well — this is one of the CCEA-only topics where the borrowed video is genuinely on target. Both will add **dark energy and the accelerating expansion**, and neither will give **the 14-billion-year age** or **CCEA's cooling sequence**, so the `why` line should say what to take and what is missing.

---

## 8. Scope note

**Beyond CCEA — mark `notonspec` if it appears:**
- **dark matter and dark energy**, and the accelerating expansion from supernova observations since 1998 (AQA §4.8.2 and its introduction)
- the **Hubble constant** or any calculation of the age from it
- **red shift as a Doppler effect**, and Doppler calculations — CCEA teaches expanding space
- the **Steady State** theory as a named alternative
- inflation, nucleosynthesis details, recombination by name
- the CMBR's temperature or its anisotropies

**CCEA-only, and here it is nearly everything:**
- **CMBR** — zero hits in AQA 8463 and absent from Edexcel's combined specification
- the **age of the Universe, about 14 billion years**
- the **Higher cooling sequence** — neutrons and protons, then nuclei, then hydrogen atoms
- the phrasing that the Big Bang is **currently the only model** that explains CMBR

---

## 9. Sources consulted

- `data/enrichment/crosswalk.json` → `science:p2-big-bang-evidence` (status `ccea-only`, high confidence)
- AQA GCSE Physics 8463 specification, **§4.8.2** *Red-shift (physics only)* (read in full) and the §4.8 introduction
- Searches of AQA 8463 for "microwave background", "CMB", "dark matter" and "dark energy": CMBR **absent**; dark matter and dark energy present only in the introductory prose
- Pearson Edexcel GCSE (9-1) Combined Science 1SC0 — Topic 7 Astronomy is printed as "only found in the GCSE in Physics"
- `data/spec/double-award-science-topics.json` → `p2-big-bang-evidence`: outcomes 2.5.12–2.5.15, `mustRecall`, and the Summer 2025 P2 Higher `examinerEvidence` entry
- `data/links/media-map.json` key `science:p2-big-bang-evidence`
