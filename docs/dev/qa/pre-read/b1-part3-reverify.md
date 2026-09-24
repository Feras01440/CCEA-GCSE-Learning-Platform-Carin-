# Re-verify: B1 part 3 — did the pre-read fixes land?

Re-read on 2026-09-19 against the current bundles, after the author reported "Fixer closed" on every finding in
`b1-part3-a.md` (plant hormones, fieldwork), `b1-part3-b.md` (competition, decomposition) and `b1-part3-c.md`
(nitrogen cycle, minerals/eutrophication). 86 findings, six bundles:

- `packs/science/content/b1/b1-plant-hormones-phototropism/bundle.json` — PH-1 … PH-11
- `packs/science/content/b1/b1-fieldwork-sampling/bundle.json` — FW-1 … FW-10
- `packs/science/content/b1/b1-competition-food-webs/bundle.json` — C1 … C12
- `packs/science/content/b1/b1-decomposition-carbon-cycle/bundle.json` — D1 … D13
- `packs/science/content/b1/b1-nitrogen-cycle/bundle.json` — N1 … N18
- `packs/science/content/b1/b1-minerals-eutrophication/bundle.json` — M1 … M22

**How the marking rows were proved.** A tsx harness imports `markAnswer` from `src/components/items/mark.ts` and
marks, for every part a finding touched: the part's own `workedSolution`, each `accepted` answer verbatim **and**
with a trailing sentence (so the exact-match shortcut cannot hide a key-word gap), one plausible paraphrase, and
the wrong or reversed answer the finding described. 428 probes. A second sweep re-marks every text part of all six
bundles to catch the two regressions the brief names — a `reject` that cancels its own accepted answer, and a
common-error regex that fires on the part's own correct wording. **That sweep is clean in all six bundles**: no
reject sits inside its own accepted answer or solution, no text common error fires on one, and every accepted
answer and every worked solution earns full marks by the key-word path, not merely by the exact-match shortcut.

**Engine changes since the reports were written** (these decide the "moot" rows):

1. `mark.ts` no longer lets a matched common error raise a **text** part's marks — the text branch ends
   `return { ...diagnosed, marksAwarded: base.marksAwarded }`. Every "`marksTypicallyEarned` floors a wholly wrong
   answer" half-finding (N4 iv, N6, N9, N11, M1, M2, M5, M6, M9, M12, M13, M16) is therefore moot on its own, and
   several wrong answers now score *less* than the reports predicted. The floor still applies to `order`, `table`,
   `label` and `numeric` kinds.
2. `countListedItems` returns 1 as soon as any segment runs past four words, so the listing rule only bites
   list-shaped answers. Prose answers can no longer be penalised — which makes the listing-rule half of C7 moot.
3. `normaliseText` drops `£ € $ % °` and maps `²`/`³` to `^2`/`^3`, so `"32°"` and `"32"` are one key word.
4. The numeric engine reads a `%` on the response as the part's declared unit when `unit: "%"`
   (`numeric.ts`: `targetUnit === "%" && parsed.form === "percent" ? "decimal" : parsed.form`). A percentage part
   that declares its unit accepts "45%" whatever `acceptForms` says — which makes PH-8 and half of FW-4 moot, and
   leaves the other half of FW-4 broken for the one part that never declared a unit.
5. No hyphen-to-space rule was found in `normaliseText`, so `"nitrogen-fixing"` still does not match
   "nitrogen fixing". The bundles carry both spellings where it matters, so nothing turns on it here.

Status words: **holds** = applied and proved; **partly** = applied in part, or applied in a way that leaves the
finding's own defect (or a new one) standing; **not applied**; **moot** = the engine changed under it.

---

## 1. `b1-plant-hormones-phototropism`

| # | Part | Status | Evidence |
|---|---|---|---|
| PH-1 | 0006(b) | holds | groups widened, `reject:["lit side"]` gone, regex given the correct-direction lookahead. Solution / accepted / "auxin moves away from the lit side" all 2/2; "the lit side, because the light attracts the auxin" 0/2 with the lit-side diagnosis; regex silent on the accepted answer |
| PH-2 | 0008(b) | holds | group 3 is the negation list, group 2 gained "anomalous/outlier", regex given the `not\|doesn't` lookahead. Solution and accepted 3/3 by key words; "it improves the accuracy and the reliability" 2/3 with the diagnosis |
| PH-3 | 0004(c) | holds | `"no auxin"` dropped from group 2. "no tip so no auxin" 1/2 and the regex now fires; "it didn't grow and it didn't bend" 2/2; "stayed straight and stopped growing" 2/2 |
| PH-4 | 0004(b) | holds | data groups + `tip detects` group with stem rejects. Accepted, solution and "E still bent by 32° but C only 1°" all 3/3; "…shows the stem detects the light" 0/3; bare stem restatement 0/3 |
| PH-5 | 0003 main, we01 twin | holds | group 3 names the side, rejects the lit side; regex narrowed. Solution 4/4; "more auxin on the lit left side … divide" 2/4; "uneven" with no side named 3/4; twin "more on the window side" 3/4 |
| PH-6 | 0007(a) | holds | `"elongated"` → `"elongat"` + `"grown more"`; "cells … elongate more" and "because of cell elongation" both 2/2 |
| PH-7 | 0005(a)/(b), figure | holds | stem, scheme, solution and error feedback all read 100 µm → 145 µm; "cells 145 µm long" / "cells 110 µm long" in all five SVG copies (note block 2, we.01, q.0002, q.0003, q.0009) |
| PH-8 | 0005(a), 0006(a) | moot | `acceptForms` still `["decimal"]`, but both parts declare `unit:"%"`, so the engine now reads the sign as the unit: "45" and "45%" 3/3, "65" and "65%" 2/2 |
| PH-9 | 0001(c), 0005(b) grp 3 | holds | direction list + `"it moves"` rejects. "it bends left" 1/1, "the shoot grows to the left" 1/1, "it moves towards the light" 0/1 |
| PH-10 | 0005(b) grp 1 | holds | comparison list + lit-side rejects. Accepted 3/3; "The lit side grew more than the shaded side…" 2/3 (comparison mark lost, auxin and direction kept) |
| PH-11 | 0007(b), 0008(a) | holds | 0007(b) groups widened — solution and "the shaded side now faces the light…" 2/2; 0008(a) solution now opens "The clear cap is a control:" and scores 2/2 by key words |

## 2. `b1-fieldwork-sampling`

| # | Part | Status | Evidence |
|---|---|---|---|
| FW-1 | 0005(a) | holds | `reject:["increases"]` gone, list widened, regex narrowed. Solution 1/1; "plantain decreases as distance … increases" 1/1; the scheme's converse 1/1; the wrong trend 0/1 |
| FW-2 | 0007(c) | holds | `exclud`/`ignor`/`not be included`… list + negation lookahead on the regex. All six correct phrasings 1/1; "include it in the mean" 0/1 with the anomaly diagnosis |
| FW-3 | 0008(b) | holds | `listingRule:false`, both groups share the suggestion list, definition rejects added. "plant more native trees … and leave dead wood…" 2/2; "dig a pond; put up nest boxes" 2/2; canopy + invasive 2/2; the definition 0/2 with the diagnosis |
| FW-4 | 0003(a) | moot | `acceptForms` unchanged, but `unit:"%"` is declared: "37" and "37%" both 2/2 |
| FW-4 | **0008(a)** | **not applied** | still `acceptForms:["decimal"]` with **no `unit`**: "88.9" 3/3 but **"88.9%" 0/3** — "That is not the expected answer. Check each step of your working." Proved in the harness that adding `unit:"%"` alone makes "88.9%" 3/3 |
| FW-5 | 0005(c) | holds | regex rewritten to clause-safe alternatives, group 1 widened with rejects. Solution 2/2 (was 1/2 and falsely diagnosed); "a transect is a type of random sampling…" 1/2 |
| FW-6 | 0006(c) | holds | `identif` stem + recognise/tell-apart list. Solution 2/2; the identification-key paraphrase 2/2 |
| FW-7 | 0003(b), 0004(c), 0002(b), 0002(c) | holds | "it is quicker" 1/1, "you cannot count individual clover plants" 1/1, "the quadrats may have landed on unusual patches" 1/1, "only ten quadrats were counted" 1/1, "pH" 1/1, "a pH probe" 1/1, "a moisture meter" 1/1 |
| FW-8 | 0005(b) | holds | `shaded` → `shade` stem, `950`/`light falls` added. The scheme's own P1 sentence 2/2; "there is lower light near the hedge…" 2/2 |
| FW-9 | 0007(a) | holds | `"12"` and sample-size synonyms added; "the group with 12 quadrats, because the mean is less affected by one odd patch" 2/2 |
| FW-10 | 0001(c) | holds | spec definition accepted, regex re-anchored. "the number of plant and animal species" 1/1; "the number of plants and animals in a habitat" 0/1 **with** the targeted diagnosis; "the number of organisms in a habitat" 0/1 |

## 3. `b1-competition-food-webs`

| # | Part | Status | Evidence |
|---|---|---|---|
| C1 | shared food-web SVG | holds | all five copies now read "Top predators" and "Level 3: secondary consumers and above"; the note carries "The fox here eats only primary consumers, so it is a secondary consumer (Level 3) even though it is drawn at the top…" |
| C2 | ftm…01 | holds | line 3 → "The source of energy for the wood is the Sun."; `mistakeLine:1`; `marksEarnedAsWritten:["P3"]`; feedback "One mark from three: the source of energy is right."; `correction` cut to the two competition lines |
| C3 | 0001(a) | holds | `listingRule:false`, both orders and the Sun/aphid rejects. "hawthorn and wheat" 1/1, "Wheat, hawthorn" 1/1, bare "wheat" 0/1, "wheat and the Sun" 0/1, "wheat and aphid" 0/1 |
| C4 | 0001(c) | holds | active-voice phrases + reversal rejects. "the ladybird eats the aphid" 1/1; "the ladybird is eaten by the aphid" 0/1; "energy passes from the ladybird to the aphid" 0/1 |
| C5 | 0003(a) | holds | both groups carry the full resource list. "water and minerals" 2/2, "space and water" 2/2, "food" 0/2 |
| C6 | 0005(b) | holds | group 2 role phrases + reversal rejects. "the ladybirds were eaten by the aphids…" 0/3 (report predicted 1/3 — the ERR floor is gone); "aphids eat ladybirds…" 0/3 with the arrow diagnosis |
| C7 | 0007(a) | holds | both groups carry all five scheme effects. "the aphids lose one of their food plants and the blue tits lose their nesting sites" 2/2; the three-clause rabbits/foxes answer 2/2. `listingRule` left `true`, which the report asked to flip, but engine change 2 makes it moot for prose — a bare list ("rabbits, foxes and aphids") still and correctly loses a mark (1/2) |
| C8 | we…01 twin | holds | group 2 gained `rabbits increase`/`rabbit numbers rise`; group 1 gained `nothing eats`/`fox eats`. "nothing eats the rabbits now so the rabbits increase…" 4/4 |
| C9 | 0003(b) | holds | regex now `\b(eats?\|eating\|ate\|hunts?\|…)\b`. "cannot create enough nests" no longer gets the predator diagnosis; "the new species eats the original one" 0/2 with it |
| C10 | 0004(a) | **partly** | the `reject:["leaves","soil"]` is gone and the regex is anchored — "the sun, captured by the leaves" 1/1, "the leaves" 0/1 with the diagnosis. But `listingRule` was flipped to **false** where the report said keep it `true`, so the wrong list **"the Sun and the leaves" now scores 1/1** (it was 0/1) and "the Sun, the leaves and the soil" 1/1 |
| C11 | 0002(c) scheme | holds | `accept` now reads "kestrel, via wheat → aphid → blue tit → kestrel" |
| C12 | dx…02 | holds | distractor now "the rabbit being eaten by the grass, because the arrow points at what is eaten" |

## 4. `b1-decomposition-carbon-cycle`

| # | Part | Status | Evidence |
|---|---|---|---|
| D1 | 0004(a) ERR | holds | `\bA\b` replaced. "mass decreased at a steady rate", "there was a decrease in mass over time" and "the mass fell over time in A, B and C" all 1/1 with no false diagnosis; "environment A decomposed fastest" 0/1 with the fastest diagnosis |
| D2 | 0004(a) keys | holds (documented deviation) | tense-free stems applied: "the mass decreases with time…" 1/1, "…went down over the twelve weeks" 1/1. `reject:["increased"]` deliberately omitted, correctly — it would cancel the part's own accepted "decreased as time increased"; "the mass increased over time" scores 0/1 on the key words anyway |
| D3 | 0004(b) | holds | stem now reads "the mass of leaf litter fell from 60 g at 0 weeks to 48 g at 12 weeks"; 1 → 3/3, 1.08 and 0.83 → 0/3 |
| D4 | 0006 order ERR | **partly** | window widened 60 → 120. The arrangement the report named (respiration directly before photosynthesis, `0,4,1,2,3`, gap 66 chars) now fires: 2/4 with the respiration diagnosis. Respiration placed **first** (`4,0,1,2,3`) has a 129-char gap and still misses — 0/4 with generic feedback |
| D5 | 0008(a) | holds | `listingRule:false`. "it is waterlogged and cold, so there is no oxygen and the decomposers' enzymes work slowly" 2/2; "waterlogged, so no oxygen, and acidic" 2/2; the solution 2/2 by key words |
| D6 | 0003(a) | holds | `secrete`/`absorb` stems plus both inflected spellings. Both report paraphrases 3/3 |
| D7 | we…01 twin | holds | group 3 now `absorb`/`absorption`/`take in`, group 4 `recycl`/`humus`/`into the soil`. Accepted, solution and "…the products are absorbed, and nutrients are recycled into the soil" all full (4 groups scaled to the twin's 3 marks) |
| D8 | 0003(b) | holds | `release minerals`/`minerals back` added; "they release minerals back into the soil for plants to use" 1/1 |
| D9 | 0007(a) | holds | both groups widened. "the rate of photosynthesis is greater than the rate of respiration so more carbon dioxide is taken in than is given out" 2/2; "…used up faster than it is made" 2/2 |
| D10 | 0007(b) | holds | `respir` stem + stop-respiring rejects. "photosynthesis stops in the dark but respiration carries on" 2/2; "can no longer photosynthesise but it is still respiring" 2/2; "respiration stops too" 1/2 |
| D11 | citations | holds | all six `examinerSources` entries and the note's examiner block now read `ccea-cer:science:2026-march:B1H:Q5` |
| D12 | carbon-cycle SVG | holds (one stale string) | plants arrow relabelled "death", animals arrow keeps "death, excretion, egestion"; all four bundle `<title>`s and the note block's `alt` now say "death from green plants, and death, excretion and egestion from animals". The note copy's inner SVG `<title>` still reads "…from plants and animals to dead material" |
| D13 | 0001(c) | holds | `burn`/`burnt` added; "we burn it" 1/1, "it is burnt" 1/1 |

## 5. `b1-nitrogen-cycle`

| # | Part | Status | Evidence |
|---|---|---|---|
| N1 | 0006(d) | holds | `reject:["high"]` gone, comparatives added. Solution 2/2, "finished higher than the oat field by 25 mg per kg" 2/2, "has more nitrate than" 2/2; "The clover field is high, 45 mg per kg." 1/2 with the no-comparative diagnosis |
| N2 | 0002(d) | holds | `listingRule:false` + decompose/saprophyte forms. Solution ("Decomposing (saprophytic) bacteria and fungi.") 1/1; "saprophytic bacteria and fungi" 1/1; "fungi and bacteria that decompose it" 1/1 |
| N3 | 0003(b) | holds | `listingRule:false`. "amino acids and proteins" 1/1, "amino acids, then protein" 1/1 |
| N4 | 0004(c) | holds | regex `\b`-anchored, both ERR typicals 0, role-bearing group 3, oxygen phrasings added. The correct denitrifying sentence 3/3 with **no** swap diagnosis; the swapped answer 1/3 with it; "Denitrifying bacteria turn nitrates into nitrogen gas." 1/3; the leach sentence 0/3 with the leach diagnosis |
| N5 | 0004(b) | holds | "lack of oxygen" 1/1, "the air spaces are full of water" 1/1, "it is flooded so there is little oxygen" 1/1 |
| N6 | 0005(b) | holds | groups widened, reject narrowed to yield-falls forms, ERR given the positive lookahead. Solution 2/2, four paraphrases 2/2, "The yield decreases…" 0/2, "As the fertiliser level increases the yield increases." 1/2 with the plateau diagnosis |
| N7 | 0005(c) | holds | Solution 2/2; "cannot take up any more nitrate so another factor limits growth" 2/2; "absorbing nitrate as fast as they can, so growth is limited by light or water" 2/2 |
| N8 | 0005(d) | holds | "it is a waste of money for no extra yield" 1/1, "leaching" 1/1, "eutrophication of nearby water" 1/1 |
| N9 | 0006(b) | holds | fix/fixes/fixation forms + ERR positive lookahead. "nodules … that fix nitrogen from the air" 3/3; "Clover is a cereal crop that uses up nitrate." 0/3; "Bacteria in the clover turn nitrogen gas from the air into nitrate." 1/3 with the nodules diagnosis |
| N10 | 0008(a) | holds | regex now `\bnitrification\b` — no hit on the accepted answer or the solution; "nitrification" 0/1 with the swap diagnosis |
| N11 | 0008(b) | holds | anaerobic/denitrification phrasings, ERR typical 0, role rejects. Solution 3/3, paraphrase 3/3; the swapped-role answer 1/3 (report predicted 2/3 — the reject bites too); "There is more nitrate deeper down." 0/3 with the diagnosis |
| N12 | 0008(c) | holds | `aerates`/`air spaces` added, role rejects. Both correct phrasings 2/2; "lets air in so the denitrifying bacteria can make more nitrate" 1/2 |
| N13 | we…01 twin | holds | role rejects added: "Denitrification turns urea into ammonium compounds, and decomposition returns nitrogen to the air." 0/4; the correct paraphrases 4/4 |
| N14 | we…02 twin | holds | "no longer anaerobic…" 3/3, "puts air back in the soil…" 3/3; the swapped answer 0/3 |
| N15 | 0001(a(ii)), 0003(c) | holds | "decomposing" 1/1, "rotting" 1/1, "by consuming plants and digesting the protein" 1/1, "from the protein in the food they have eaten" 1/1 |
| N16 | nitrite / lightning | holds | the callout route was taken: a footnote "Nitrite and fixation by lightning are background only: this specification asks for ammonium → nitrates" on every copy of the cycle figure (note block 2, we.01, q.0001, q.0007, q.0009) and a nitrite footnote on the q.0002 table; rp.03 and rp.05 carry "(background only / not on this specification)"; q.0009 point 7 now reads "(by way of nitrites, which this specification does not require)" with `keyWords:["nitrifying","aerobic"]` |
| N17 | ftm…02 | holds | feedback now "One mark from three, for the first line — 'full of water' is the start of the oxygen point…", `marksEarnedAsWritten:["P1"]`; the two fields tell the same story |
| N18 | ftm…01 | holds | lines 2–3 corrected to "Q: nitrifying bacteria" / "R: denitrifying bacteria", `mistakeLine:1`, `marksEarnedAsWritten:["P2","P3"]`, feedback "Two marks from three" |

## 6. `b1-minerals-eutrophication`

| # | Part | Status | Evidence |
|---|---|---|---|
| M1 | 0001(b) | holds | group 2 → `surface area`, reject dropped, ERR typical 0. Solution 2/2; "A long projection which gives a bigger surface area." 2/2; "It looks like a hair on your head." 0/2 with the diagnosis |
| M2 | 0002(a) | holds | `respir` stem, against-a/from-low/using forms, ERR lookaheads. Both paraphrases 4/4; "By osmosis." 0/4; "By diffusion down the concentration gradient…" 0/4 with the gradient diagnosis; the respiration-less answer 3/4 with the respiration diagnosis |
| M3 | 0002(b) | holds | passive/no-energy list, reject list widened, ERR given the `(?!osmosis)` guard. "Osmosis, which does not use energy…" 2/2; "By osmosis - it is passive." 2/2; "Water is taken in by active transport…" 1/2; "Water enters by osmosis, not active transport." 1/2 with **no** false diagnosis |
| M4 | 0002(c) | holds | "To release energy by respiring for active uptake of minerals." 2/2; "Respiration in the mitochondria provides the energy needed to absorb mineral ions…" 2/2 |
| M5 | 0003(a) | holds | trend list widened, reject narrowed, ERR given the positive lookahead. All four paraphrases 2/2; "The uptake decreases as oxygen increases." 0/2 |
| M6 | 0003(c) | holds | `respir` stem + ERR lookahead. "Oxygen lets the roots respire aerobically to release energy for active uptake." 3/3; "By diffusion." 0/3 |
| M7 | 0003(d) | holds | "Respiration cannot go any faster so no extra energy is released, and something else is limiting." 2/2; "respiring as fast as they can … limited by another factor" 2/2; the one-idea answer 1/2 |
| M8 | 0005(a) | holds | `reject:["nutrients"]` dropped, `listingRule:false`, ERR given the nitrate lookahead. "nitrates, a nutrient from the slurry" 1/1; "nitrate or phosphate" 1/1; "nutrients" and "minerals" 0/1 with the diagnosis |
| M9 | 0005(b) | **partly — regression** | the author's resolution (require the quoted readings) replaced Appendix A's fall/rise vocabulary with number-anchored phrases (`from 9.6`, `to 3.2`, `3.2 mg` \| `to 9.1`, `9.1 mg`), so **direction is no longer marked**: the reversed "Oxygen **increases** from 9.6 at A to 3.2 at C and then **decreases** to 9.1 at E." scores **2/2**, and so does the direction-free "The oxygen is 9.6 at A, 3.2 at C and 9.1 at E." The correct paraphrases do all score 2/2, and "The oxygen falls and then rises again." (no data) 0/2 with the quote-the-data diagnosis |
| M10 | 0005(d) | holds | groups widened, ERR given the `bacteri`/`dead` look-behinds, typical 0. Solution 3/3; "Bacteria decomposed the dead algae and used up the dissolved oxygen…" 3/3; "The algae use up the oxygen so the invertebrates die." 2/3 with the algae diagnosis; the correct "bacteria decomposing the dead algae use up the oxygen" no longer diagnosed |
| M11 | 0005(e) | holds | Appendix A `M.0005.e` applied verbatim. Solution 2/2; "broken down … bacteria have died off … re-oxygenated by mixing with air" 2/2; "used up the dead material and the water picks up oxygen from the air" 2/2. Residual in the report's own list: "run **out of dead material**" is not covered (only "run out of food"), so that phrasing is still 1/2 |
| M12 | 0006(a) | holds | `shade` stem, `blocks light`, `photosynthes` stem, ERR typical 0. All three paraphrases 2/2; "The bloom stops oxygen getting into the water." 0/2 with the diagnosis |
| M13 | 0006(b) | holds | bacteria/multiply lists widened, ERR given the look-behinds. Five correct sentences 3/3; "Bacteria feed on the dead algae and use up the oxygen as they respire." **not** diagnosed; "The algae use up all the oxygen." 0/3 with the diagnosis |
| M14 | 0006(c) | holds | "There is not enough oxygen for the fish to breathe." 2/2; "Fish suffocate because the dissolved oxygen has gone." 2/2 |
| M15 | 0007(a) | holds | two identical groups over one list. Solution 2/2; four two-idea answers 2/2; each single idea 1/2. Documented residual stands: "Use less fertiliser, only what the crop needs." (one idea twice) 2/2 |
| M16 | 0007(b) | holds | `wash` stem, ERR given the nitrate lookahead and typical 0. Solution 2/2; "The rain washed the fertiliser off the fields…" 2/2; "Rain washes nutrients such as nitrate off the land…" 2/2 |
| M17 | we…01 twin | holds | "…passive and does not need energy, unlike nitrate ions which are actively transported against the concentration gradient…" 4/4; the swapped-process answer 2/4 (reject fires) |
| M18 | we…02 twin | holds | `reject:["nutrients"]` gone, role phrases added. "The sewage adds nitrate and other nutrients, algae bloom, then bacteria decompose them…" 5/5; the reversed-causation answer 2/5 |
| M19 | we…03 twin | holds | `waterlogged` dropped, anaerobic forms added. "The soil is anaerobic so the roots cannot respire aerobically…" 4/4; "The field is waterlogged." 0/4 |
| M20 | 0004 order ERR | holds | regex now `dissolved oxygen[\s\S]{0,400}the plants and algae die`. Correct order 6/6; `0,1,2,5,3,4,6` and `0,1,5,6,2,3,4` both 3/6 with the sequence diagnosis; a plain first-two swap gets the generic feedback, not a false diagnosis |
| M21 | ftm…01, ftm…02 | holds | ftm.01 line 1 → "…a long extension which reaches into the soil.", line 3 → "They move against the concentration gradient into the cell.", `mistakeLine:2`, `["P1","P3","P4"]`, "Three marks from four". ftm.02 line 1 → "Nitrate from the fertiliser is washed into the lake.", `mistakeLine:3`, `["P1","P2","P5"]`, "Three marks from five", the 'nutrients' point moved into `feedback` |
| M22 | 0002(b), 0009 solutions | holds | "selectively permeable" ×3; no occurrence of "partially permeable" remains |

---

## Still open

Four rows, in order of what a learner loses.

1. **FW-4 / `b1-fieldwork-sampling` q…0008 part (a) — not applied.** A correct "88.9%" is marked wrong.
   Fix: add `"unit": "%"` to that part's `answer` (leave `acceptForms` as it is). Proved in the harness:
   with the unit declared, "88.9" and "88.9%" are both 3/3 and the 1-d.p. demand still holds ("89" → rounded too far).

2. **M9 / `b1-minerals-eutrophication` q…0005 part (b) — the fix removed the direction mark.** Requiring the
   quoted readings is right, but every direction word was taken out with the old vocabulary, so a reversed
   description scores full. Fix: keep the number-anchored phrases and put the direction back as a condition —
   group 1 `any` limited to falls/decrease/drop/goes-down forms **paired with** the figure
   (`"falls from 9.6"`, `"falls to 3.2"`, `"decreases to 3.2"`, `"drops to 3.2"`, `"lowest value of 3.2"`, `"lowest of 3.2"`,
   `"down to 3.2"` …) and group 2 to rise/recover forms paired with 9.1 (`"rises again to 9.1"`, `"back up to 9.1"`,
   `"recovers to 9.1"`, `"reaches 9.1"` …) — i.e. delete the bare `"from 9.6"`, `"to 3.2"`, `"3.2 at c"`, `"3.2 mg"`
   from group 1 and the bare `"to 9.1"`, `"9.1 at e"`, `"9.1 at site e"`, `"9.1 mg"` from group 2.

3. **C10 / `b1-competition-food-webs` q…0004 part (a) — `listingRule` flipped the wrong way.** The report's fix
   was "drop the `reject`, **keep** `listingRule: true`", because the listing rule is what zeroes the wrong list
   "the Sun and the leaves". With it `false`, that answer now earns the mark. Fix: set `"listingRule": true`
   again (the reject must stay dropped — "the sun, captured by the leaves" then still scores 1/1, and the
   anchored regex is doing the diagnosis work).

4. **D4 / `b1-decomposition-carbon-cycle` q…0006 — the widened window is still 9 characters short.** With the
   respiration item placed first (`4,0,1,2,3`) the gap between "decomposers respire" and "takes it in" is 129
   characters, so the commonest wrong arrangement gets generic feedback. Fix: widen to
   `decomposers respire[\s\S]{0,200}takes it in` (as M20 was widened), or simply drop the window:
   `decomposers respire[\s\S]*takes it in`.

Four smaller residuals, worth one line each and no more:

- **D12** — the note's carbon-cycle SVG still carries the pre-fix `<title>` "death, excretion and egestion from
  plants and animals to dead material"; the four bundle copies and the note's own `alt` were corrected. Screen
  readers on the note page read the stale sentence.
- **D7** — the we.01 twin's group 1 is `["secrete","release enzymes"]`; q…0003(a)'s list also carries
  `"releases enzymes"`, and without it "It releases enzymes…" is 2/3 on the twin. One word.
- **C8** — the we.01 twin accepts `rabbits increase` / `rabbit numbers rise` but not "the rabbit**s** number
  increases" (3/4). Adding `"rabbit number"` would close it.
- **M11** — Appendix A's own list has `"run out of food"` but not `"run out of dead"`, so the report's own probe
  sentence is still 1/2.

---

## Verdicts

- **`b1-plant-hormones-phototropism`** — all eleven findings closed (PH-8 by an engine change rather than an edit); no regression; **ready**.
- **`b1-fieldwork-sampling`** — nine of ten closed; **one line short of ready**: q…0008(a) still needs `"unit": "%"` or a correct "88.9%" is marked wrong.
- **`b1-competition-food-webs`** — eleven of twelve closed; C10's `listingRule` was flipped to `false` where the report said keep it `true`, so "the Sun and the leaves" now earns the mark — one field to put back.
- **`b1-decomposition-carbon-cycle`** — twelve of thirteen closed and no marking regression; D4's order common error still misses the respiration-first arrangement, and the note figure keeps one stale `<title>`.
- **`b1-nitrogen-cycle`** — all eighteen findings closed, including the two find-the-mistake items and the nitrite/lightning callout; no regression; **ready**.
- **`b1-minerals-eutrophication`** — twenty-one of twenty-two closed; M9's resolution dropped the direction mark, so a reversed description of the oxygen graph scores 2/2 — the one blocker in this bundle.
