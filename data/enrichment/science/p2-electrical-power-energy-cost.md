# Enrichment dossier — p2-electrical-power-energy-cost

**CCEA** Double Award Science, **P2** §2.3 Electricity · outcomes 2.3.18, 2.3.20 · tier **F** · difficulty 3 · no prescribed practical
**Key equations:** `E = P × t` (J, W, s) · `P = I × V` (W, A, V) · `energy (kWh) = power (kW) × time (h)` and `cost = kWh × price per unit`
**Prerequisites in our taxonomy:** `p2-ohms-law-filament-lamp`, `p1-work-and-power`
**Compiled** 20 September 2026 · 30 minutes
**Headline** **This row was `matched` and is now corrected to `partial`.** The physics half — `P = IV` and `E = Pt` — is matched on both boards. The **domestic-billing half is not: "kilowatt", "kWh" and "cost of electricity" return zero hits in AQA 8464, AQA 8463 and Edexcel 1SC0.** So the kilowatt-hour, the "unit of electricity" and the cost calculation are CCEA-only, and no borrowed resource will teach them. Meanwhile our examiner evidence names the two most ordinary failures imaginable — **`P = IV` not recalled** and **minutes not converted to seconds** — which tells you where the lesson's weight belongs.

---

## 1. Crosswalk

| CCEA | AQA 8464 | Edexcel 1SC0 | Confidence | Status |
|---|---|---|---|---|
| 2.3.18 — `E = P × t` and `P = I × V` | **§6.2.4.1** *Power* — `P = VI` to recall and apply; **§6.2.4.2** — `E = Pt` to recall and apply | **CP10.28** (power as energy per second, in watts), **CP10.29** (`P = E/t`), **CP10.30** (how power relates to pd and current), **CP10.31** (`P = I × V`) | high | **matched** |
| 2.3.20 — the kilowatt-hour; `kWh = kW × hours`; `cost = kWh × price per unit` | **unmatched — zero hits for "kilowatt", "kWh" or "cost of electricity"** in 8464 or 8463. Nearest: §6.2.4.2's "describe, with examples, the relationship between the power ratings for domestic appliances and the changes in stored energy" | **unmatched** — nearest is **CP10.42**, the same power-ratings statement, and **CP10.32** (how domestic devices transfer energy) | high | **ccea-only** |

**Scope deltas outwards.** Both boards add equations CCEA does not need: **`P = I²R`** (AQA §6.2.4.1; Edexcel CP10.31), **`E = QV`** (AQA §6.2.4.2), **`E = IVt`** (Edexcel CP10.27). Both also carry **the National Grid and transformers** (AQA §6.2.4.3; Edexcel CP13.6–CP13.10), which is beyond CCEA Double Award.

**Consequence for the author.** The lesson splits cleanly in two. Sections on `P = IV` and `E = Pt` can be enriched freely from AQA/Edexcel material; the kilowatt-hour section has to be authored from CCEA's own wording and from real electricity bills, and it is where the exclusivity claim sits.

---

## 2. Teaching angles worth recreating (in our own words)

1. **Power is the rate — energy per second — before any formula.** *Edexcel makes it a statement of its own (CP10.28: "describe power as the energy transferred per second and recall that it is measured in watt"), which is a better opening than an equation.* A 60 W lamp transfers 60 joules every second. From that, `E = P × t` is not a formula but a sentence: energy is the rate multiplied by how long it ran. Our examiner records `P = IV` not being recalled; a meaning that generates the equation survives better than a memorised one.

2. **`P = IV` in words: how much charge passes each second, times how much energy each coulomb carries.** *AQA §6.2.4.1 asks candidates to "explain how the power transfer … is related to the potential difference across it and the current through it", so the explanation is itself assessed.* Current is coulombs per second; voltage is joules per coulomb; multiply and the coulombs cancel, leaving joules per second — watts. That derivation takes twenty seconds and turns two symbols into an argument.

3. **Seconds, always, in `E = Pt`. Make the conversion a written step.** *CCEA Summer 2025 P2 Foundation: "minutes not converted to seconds".* The joule is defined against the second, so any time in minutes or hours must be converted **before** substitution, on its own line. This is the single highest-frequency mark loss in the topic and it is arithmetic, not physics.

4. **Two energy units, two jobs — and that is the whole of the kilowatt-hour.** *CCEA-only, so this framing has to be ours.* The **joule** is the scientist's unit and is tiny: a kettle uses about 360 000 of them to boil once. The **kilowatt-hour** is the electricity company's unit, sized for billing: it is what a 1 kW appliance uses in 1 hour. Present them as two rulers for the same quantity, chosen for convenience, rather than as an extra formula. Then `kWh = kW × hours` is just `E = P × t` with the units changed, which is worth saying explicitly.

5. **Do the kilowatts first, then the hours.** *A layout rule that prevents most of the errors.* The commonest slip is leaving the power in watts, so a 2000 W heater for 3 hours becomes 6000 kWh. Make step 1 "convert the power to kW" and step 2 "convert the time to hours", each on its own line, before multiplying.

6. **Use a real bill.** *CCEA-specific context, and the most motivating thing in P2.* A unit price in pence, a number of units, a total. Working out what it costs to run her own devices for an hour is the "why does this exist" answer, and it links to `p2-electricity-in-the-home` and to `p1-energy-resources`. Take the structure of a bill from a real one; invent the numbers.

7. **Power ratings are on the appliance.** *This is the one place both other boards meet CCEA — AQA §6.2.4.2 and Edexcel CP10.42 both ask for the relationship between power ratings and energy transferred.* The rating plate on a kettle or a hair dryer is a data source, and comparing two appliances' ratings is a legitimate question on all three boards.

---

## 3. The representation to rebuild as our own SVG

**Hero figure: the two-ruler comparison.** `viewBox` about `0 0 960 400`. The idea that carries the CCEA-only half.

- **Two horizontal bars of the same length**, one above the other, both representing the energy a 2 kW heater uses in 3 hours.
- **Upper bar** divided into a vast number of tiny ticks, labelled **21 600 000 J** — with the ticks deliberately too fine to count and a caption *the scientist's unit*.
- **Lower bar** divided into **6 large blocks**, labelled **6 kWh**, caption *the electricity company's unit — one block is a 1 kW appliance running for 1 hour*.
- **Between them, a conversion line**: `1 kWh = 1000 W × 3600 s = 3 600 000 J`.
- **Beneath, the cost strip**: 6 blocks, each annotated with the unit price, and the total.
- **Generator parameters:** `powerW`, `hours`, `pricePerUnit`, `showJoules: boolean`, `showCost: boolean`. Every number computed from `powerW` and `hours`; assert the joule and kWh figures agree.

**Second figure: the unit-conversion ladder.** A four-row strip for a worked `E = Pt` calculation: the quantities as given (2 kW, 3 hours), then each converted (2000 W, 10 800 s), then the substitution, then the answer with its unit. **The two conversion rows are tinted** so they read as compulsory steps rather than optional ones. Generator: `values`, `blankRows: number[]` for gated versions.

**Third, small: the `P = IV` derivation card.** Three short lines, units cancelling: `I (C/s) × V (J/C) = J/s = W`, with the coulombs struck through. Ten lines of SVG, and it is why the formula is true.

---

## 4. Practical variants CCEA also examines

No prescribed practical on this outcome. The real activities that support it, and which CCEA can set as written questions:

- **Read the rating plates** on household appliances and rank them by power. Both boards' "power ratings" statements (AQA §6.2.4.2, Edexcel CP10.42) are exactly this, so their material is usable here.
- **Measure the power of a small device** with an ammeter and voltmeter and `P = IV` — reuses the circuit from `p2-ohms-law-filament-lamp`.
- **Read a domestic meter** twice and find the units used — the practical that makes the kWh real. CCEA-only.
- **CCEA's own Prescribed Practical P4** (measuring personal power, in `p1-work-and-power`) is the mechanical cousin and a good callback: same idea, different energy store.

The transferable Unit 7 demand is **unit conversion within a calculation**, which is exactly what the examiner evidence records failing.

---

## 5. Question types the other boards use that CCEA also rewards

1. **"Calculate the power of the lamp" [2].** `P = IV`, with the unit. Matched on both boards.
2. **"Calculate the energy transferred in 5 minutes" [3].** `E = Pt` with the **conversion** as its own mark. CCEA's recorded failure; author the scheme so the conversion is credited separately and the feedback names it.
3. **"Calculate the energy used in kWh" [2].** Convert to kW, multiply by hours. CCEA-only.
4. **"Calculate the cost of running the appliance" [2–3].** kWh then price. CCEA-only, and the item that makes the topic feel worth learning.
5. **"Appliance A is 2 kW, appliance B is 800 W. Compare the cost of running each for 2 hours" [3].** A compare item that needs both conversions and rewards a stated conclusion.
6. **"Explain why energy companies use the kilowatt-hour rather than the joule" [2].** The two-ruler idea, in words. No other board can set this, and it is a good discriminator.

**Mark-scheme habit worth copying from both boards:** the equation, the substitution and the answer-with-unit are three separate credits, so a correct rearrangement with an arithmetic slip still scores. Author it that way.

---

## 6. Misconception framings worth borrowing

| Misconception | The framing that fixes it | Evidence |
|---|---|---|
| `P = IV` not recalled | Derive it from the units: coulombs per second × joules per coulomb = joules per second | CCEA S2025 P2 Foundation |
| Minutes substituted into `E = Pt` | The joule is defined against the second. Convert on its own line, before substituting | CCEA S2025 P2 Foundation |
| Watts left in the kWh calculation | Step 1 is always "convert the power to kW" | follows; the commonest slip in the CCEA-only half |
| kWh treated as a unit of power | It is a unit of **energy** — a power multiplied by a time. The name says so | universal; the two-ruler figure |
| "A unit" of electricity is vague | One unit = one kilowatt-hour, and that is what the bill counts | CCEA-only content |
| Power and energy used interchangeably | Power is the rate; energy is the total. A 2 kW heater has a fixed power and a growing energy | Edexcel CP10.28's framing |
| Reaching for `P = I²R` or `E = QV` | Both are beyond CCEA. Two equations are enough here | AQA §6.2.4.1, §6.2.4.2 — both carry extra equations |

---

## 7. Photographs (Commons, licence checked 20 Sep 2026) and simulations

| File | Licence | Size | Use and prompt |
|---|---|---|---|
| `File:Hydro quebec meter.JPG` (Kristoferb) | CC BY-SA 3.0 | 2432×2852 | A domestic electricity meter with dials, described by its uploader as recording usage in kilowatt-hours. The photograph that makes the CCEA-only half concrete. Prompt: *this meter counts units. What is one unit, and what would the reading have gone up by after a 2 kW heater ran for three hours?* |

An appliance **rating plate** photograph would be the ideal second image — power in watts, printed on the device — but nothing suitable was verified in this session. Search for one with `pipeline/enrichment/check-commons-licence.mjs` before authoring, and give it a prompt asking for the cost of running it for an hour.

**Simulation already held:** **PhET *Circuit Construction Kit: DC***. It is mapped here and it is honest but partial — it will give current and voltage for a component, so `P = IV` can be computed from measurements, but it models no energy meter and nothing about kWh or cost. Write the task for the physics half only: *build a circuit, measure I and V for the bulb, calculate its power, then predict what happens to the power if the supply voltage is doubled.* Do not imply it covers the billing half.

**Videos already held:** Freesciencelessons `EDT0DPhaaMY` and `WLaUmNr4lho`. Both AQA-shaped; both will include **`P = I²R`** and possibly `E = QV`, and **neither will mention the kilowatt-hour**, because AQA does not examine it. That is worth an explicit `why` line so she is not left thinking she has missed something — the truth is the opposite.

---

## 8. Scope note

**Beyond CCEA — mark `notonspec` if it appears:**
- **`P = I²R`** (AQA §6.2.4.1; Edexcel CP10.31)
- **`E = QV`** (AQA §6.2.4.2) and **`E = IVt`** (Edexcel CP10.27)
- **the National Grid, transformers and step-up/step-down** (AQA §6.2.4.3; Edexcel CP13.6–CP13.10)
- efficiency of appliances as a calculation in this topic (CCEA covers efficiency in P1)
- "potential difference" as the required term — CCEA says **voltage**

**CCEA-only, and this is where the exclusivity is:**
- **the kilowatt-hour**, the "unit of electricity", `kWh = kW × hours` and `cost = kWh × price per unit` — zero hits in AQA 8464, AQA 8463 and Edexcel 1SC0

---

## 9. Sources consulted

- `data/enrichment/crosswalk.json` → `science:p2-electrical-power-energy-cost` (status **`partial`**, high confidence — **corrected from `matched` on 20 September 2026** after searching all three specifications for the kilowatt-hour)
- AQA GCSE Combined Science: Trilogy 8464 specification, **§6.2.4.1** and **§6.2.4.2** (read in full), **§6.2.4.3** for the scope boundary
- AQA GCSE Physics 8463 — searched for "kilowatt"/"kWh": no hits
- Pearson Edexcel GCSE (9-1) Combined Science 1SC0 specification, **CP10.27–CP10.32** and **CP10.42**
- `data/spec/double-award-science-topics.json` → `p2-electrical-power-energy-cost`: outcomes 2.3.18 and 2.3.20, three `keyEquations`, `mustRecall`, and the Summer 2025 P2 Foundation `examinerEvidence` entry
- Wikimedia Commons API for the electricity-meter photograph
- `data/links/media-map.json` key `science:p2-electrical-power-energy-cost`
