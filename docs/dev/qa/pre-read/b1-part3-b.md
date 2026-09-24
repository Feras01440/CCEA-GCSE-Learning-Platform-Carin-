# Pre-read: B1 part 3 (b) — competition/food webs and decomposition/carbon cycle

Read 13–14 Sep 2026 against `data/spec/double-award-science.json` (outcomes 1.7.4–1.7.9), the mined examiner-report blocks in `pipeline/mine/cer-blocks/science/`, and the marking engine as written (`src/components/items/text-marking.ts`, `mark.ts`). Both `note.blocks.json` files were rewritten by the note-block pass at 02:59 on 14 Sep (blocks reordered only; every block's text is unchanged), so the digests were regenerated after that:

- `docs/dev/qa/pre-read/b1-competition-food-webs.digest.txt`
- `docs/dev/qa/pre-read/b1-decomposition-carbon-cycle.digest.txt`

Method notes. Every number was recomputed in node. Every text part was run through a verbatim port of `markText` (including the listing-rule penalty) with the model answer forced down the key-word path and with probe answers; every text-kind common-error regex was compiled with the `i` flag that `mark.ts` uses and run against the part's own correct texts and probes; order answers were joined with `", "` as `mark.ts` does. Figures were decoded from their `data:` URIs and the arrows and labels read off. Misconception ids all resolve in `packs/science/insights/misconceptions.json`; `sets` references all resolve; no learner-facing string in either bundle contains `$` or `${` (the only `$` anywhere is a regex anchor, noted under D1).

Severity: **H** = wrong marks or wrong science reaching the learner; **M** = a correct answer routinely under-marked or mis-fed-back; **L** = tidy-up.

---

## 1. `packs/science/content/b1/b1-competition-food-webs/bundle.json`

Science is sound except C1. Numbers (q0005: 366 ÷ 120 × 100 = 305; 75.3 = 366 ÷ 486 × 100; 2.1 ÷ 8.4 × 100 = 25; 33.3 = 2.1 ÷ 6.3 × 100) all recompute. All MCQs have exactly one correct option and no duplicate texts. The food-web SVG (shared by the note, we.01, q0001, q0002, q0005, q0007) resolves to eleven arrows: wheat → aphid, wheat → wood mouse, hawthorn → aphid, hawthorn → rabbit, aphid → ladybird, aphid → blue tit, ladybird → blue tit, wood mouse → kestrel, wood mouse → fox, rabbit → fox, blue tit → kestrel; every feeding claim in the text matches it.

### C1 [H] Food-web figure — top row labelled "Level 4: tertiary consumers" but the fox is a secondary consumer
- **Where:** the shared food-web SVG (`note.blocks.json` figure block 2; `we.science.b1.b1-competition-food-webs.01` figure; `q…0001/0002/0005/0007` figures[0]); row label `<text x="16" y="84">Level 4: tertiary consumers</text>` beside kestrel and fox.
- **Why wrong:** the fox's only incoming arrows are from the wood mouse and the rabbit, both primary consumers, so by the bundle's own definition (note paragraph 4: "Level 3 holds the secondary consumers, which eat the primary consumers, and Level 4 the tertiary consumers") the fox is a secondary consumer, Level 3, in every chain it sits in. The kestrel is tertiary only via the blue tit (and quaternary via wheat → aphid → ladybird → blue tit → kestrel). A learner asked the fox's trophic level will answer Level 4.
- **Fix:** relabel the top row "Top predators" (and the third row "Level 3: secondary consumers and above"), and add one sentence to note paragraph 4: "The fox here eats only primary consumers, so it is a secondary consumer (Level 3) even though it is drawn at the top; the kestrel is a tertiary consumer when it eats the blue tit." (Alternative: add a blue tit → fox arrow, but that changes the web every question uses.)

### C2 [H] `ftm.science.b1.b1-competition-food-webs.01` — two wrong lines, one `mistakeLine`
- **Current:** `mistakeLine: 1`; line 3 `"The source of energy for the wood is the leaves of the trees."`; `whatWentWrong` ends "Line 3 has the second error: the **leaves capture** the energy, but the **Sun** is where it comes from."; `correction[2]` = "The source of energy for the wood is the Sun."; `marksEarnedAsWritten: []`.
- **Why wrong:** the schema allows one mistake line (`z.int().positive()`), so the interaction can only accept line 1. A learner who picks line 3 — a genuine error, and the one the examiner report singles out — is told they chose the wrong line.
- **Fix:** make line 3 correct ("The source of energy for the wood is the Sun."), set `marksEarnedAsWritten` to the Sun mark (e.g. `["P3"]`), change the feedback's "Nothing scored from three" to "One mark from three", drop "Line 3 has the second error…" from `whatWentWrong`, and cut `correction` to the two competition lines (the Sun tip can stay in `feedback` as an aside).

### C3 [H] `q…0001` part (a) — "Name the two producers": one key word, listing rule zeroes every non-exact correct answer
- **Current:** `accepted: ["wheat and hawthorn"]`, `keyWords: [{"any":["wheat"],"marks":1,"reject":["aphid","rabbit"]}]`, `listingRule: true`; scheme P1 "wheat and hawthorn (both needed) reject aphid, rabbit, the Sun".
- **Why wrong (simulated):** "wheat" alone → 1/1 although both are needed; "hawthorn and wheat" → 0/1 and "Wheat, hawthorn" → 0/1, because the listing rule counts two items against one group and cancels the mark (only the exact string "wheat and hawthorn" survives). "wheat and the Sun" is not on the reject list and is zeroed only by the same accident.
- **Fix:** `any: ["wheat and hawthorn","hawthorn and wheat","wheat hawthorn","hawthorn wheat"]` (normalisation turns "wheat, hawthorn" into "wheat hawthorn"), `reject: ["aphid","rabbit","mouse","sun"]`, `listingRule: false`.

### C4 [H] `q…0001` part (c) — reversed arrow earns the mark, the correct active-voice answer does not
- **Current:** `keyWords: [{"any":["eaten by","energy","transfer"],"marks":1,"reject":["eats the ladybird"]}]`.
- **Why wrong (simulated):** "the ladybird is eaten by the aphid" → 1/1; "energy passes from the ladybird to the aphid" → 1/1; "the ladybird eats the aphid" → 0/1 (no key word in it). The common-error regex reports the reversal but the mark is still awarded.
- **Fix:** `any: ["eaten by the ladybird","ladybird eats","is eaten by","energy","transfer","consumption"]`, `reject: ["eats the ladybird","eaten by the aphid","ladybird to the aphid","from the ladybird"]`.

### C5 [M] `q…0003` part (a) — "Give two resources": only "light" can earn the first mark
- **Current:** `keyWords: [{"any":["light"],"marks":1,"reject":["food"]},{"any":["minerals","water","space"],"marks":1,"reject":["food"]}]`; scheme "any two from water / light / space / minerals — [1] each".
- **Why wrong (simulated):** "water and minerals" → 1/2; "space and water" → 1/2.
- **Fix:** both groups `any: ["water","light","space","minerals"]`, `reject: ["food"]` (the engine's used-set stops one word earning both groups); keep `listingRule: true`.

### C6 [M] `q…0005` part (b) — "eaten" alone lets a reversed answer score
- **Current:** group 2 `{"any":["predator","eat aphids","eaten"],"marks":1}`.
- **Why wrong (simulated):** "the ladybirds were eaten by the aphids so there were fewer ladybirds" → 2/3; "aphids eat ladybirds, so with no ladybirds the aphids had nothing to eat" → 1/3.
- **Fix:** group 2 `any: ["predator","eat aphids","eat the aphids","eats aphids","aphids were eaten","aphids are eaten","fewer aphids were eaten"]`, and on groups 1 and 2 `reject: ["aphids eat","eaten by the aphids","eaten by aphids"]`.

### C7 [M] `q…0007` part (a) — scheme alternatives cannot score; listing rule penalises prose
- **Current:** `keyWords: [{"any":["rabbits","rabbit"],"marks":1},{"any":["foxes","fox","less to eat"],"marks":1}]`, `listingRule: true`; scheme lists five acceptable effects (rabbits / foxes / aphids lose a food plant / blue tits lose nesting and shelter / biodiversity falls).
- **Why wrong (simulated):** "the aphids lose one of their food plants and the blue tits lose their nesting sites" → 0/2; "the rabbits would have less food and their numbers would fall, and the foxes would have less prey so their numbers fall" → 1/2 (the splitter counts three items on "and"/"," and deducts one).
- **Fix:** both groups `any: ["rabbit","fox","aphid","blue tit","biodiversity","fewer species","less food","less prey","nesting"]`, `listingRule: false` (a suggest-effects part is answered in clauses, not a bare list). Accepted limitation: "rabbits and foxes" with no effect stated will still score.

### C8 [L] `we…01` twin — "rabbits increases" only matches after "number of"
- **Current:** group 2 `{"any":["rabbits increases","more rabbits"]}`; group 1 `{"any":["fox eats the rabbit","predator","fewer rabbits are eaten"]}`.
- **Why wrong (simulated):** "nothing eats the rabbits now so the rabbits increase, so more hawthorn is eaten and there is less hawthorn" → 2/4; "the rabbits number increases because their predator is gone, they feed on the hawthorn so the hawthorn decreases" → 3/4. The phrase-stem rule only tolerates a trailing s on a phrase, so "rabbits increase" fails "rabbits increases".
- **Fix:** group 2 `any: ["rabbits increase","more rabbits","rabbit population increases","rabbit numbers rise","rabbits rise"]` (the engine then also accepts "rabbits increases"); group 1 add `"nothing eats","not eaten","fox eats","foxes eat"`.

### C9 [M] `q…0003` part (b) common-error regex is unanchored
- **Current:** `{"kind":"text","regex":"eat|hunt|kill|prey"}` → feedback "Two species using the same resource are competitors, not predator and prey…"
- **Why wrong (simulated):** fires on "create", "wheat", "great", "threat", "skill": "the new species takes the nest holes, so the original species cannot create enough nests" is told it called a competitor a predator. (Marks are safe — the key-word rejects are whole-word — but the feedback is wrong.)
- **Fix:** `\b(eats?|eating|ate|hunts?|hunted|kills?|killed|prey|preys|predators?)\b`.

### C10 [L] `q…0004` part (a) — reject list cancels a correct answer that also names the leaves
- **Current:** `keyWords: [{"any":["sun","sunlight"],"marks":1,"reject":["leaves","soil"]}]`, `listingRule: true`; common-error regex `leaf|leaves|tree|trunk|soil|root`.
- **Why wrong (simulated):** "the sun, captured by the leaves" → 0/1 (reject) and is then told the source is not the leaves. The listing rule already zeroes the genuine wrong list "the Sun and the leaves" (2 items > 1 group).
- **Fix:** drop the `reject` list, keep `listingRule: true`; anchor the regex to answers that never name the Sun: `^(?![^;\n]*\bsun)[^;\n]*\b(leaf|leaves|trees?|trunk|soil|roots?)\b`.

### C11 [L] `q…0002` part (c) scheme `accept` names the wrong chain
- **Current:** `accept: ["kestrel, if the chain wheat → aphid → ladybird → blue tit → kestrel is followed"]`.
- **Why wrong:** in that chain the kestrel is a quaternary consumer (Level 5). The chain that makes it a tertiary consumer is wheat → aphid → blue tit → kestrel. Inert (kestrel is not an option of this MCQ) but wrong as written.
- **Fix:** "kestrel, via wheat → aphid → blue tit → kestrel", or delete the `accept` (an MCQ needs none).

### C12 [L] `dx…` item 02 — distractor is half true
- **Current:** option "the rabbit eating the grass, so the arrow points at what is eaten" (marked wrong, misconception arrow-direction-reversed).
- **Why wrong:** the arrow does show the rabbit eating the grass (the spec: "arrows represent consumption"); only the tail clause is false, so a learner who reads the true half is marked wrong.
- **Fix:** "the rabbit being eaten by the grass, because the arrow points at what is eaten".

**Verdict (competition/food webs):** not publishable as is — fix C1 (figure label), C2 (find-the-mistake structure) and the marking defects C3–C7 first; C8–C12 are tidy-ups. Science, numbers, spec coverage and examiner citations (B1F Q6 / B1H Q1, B1H 2025 Q1) all check out.

---

## 2. `packs/science/content/b1/b1-decomposition-carbon-cycle/bundle.json`

Science is sound (one loose figure label, D12). Numbers all recompute: 60 − 48 = 12, 12 ÷ 12 = 1 and the wrong 12 ÷ 4 = 3; twin 48 ÷ 12 = 4; 48 ÷ 60 × 100 = 80 and the wrong 48 ÷ 12 × 100 = 400; the graph decodes (4 px per gram) to A 60 → 42 → 26 → 12, B 60 → 54 → 47 → 39, C 60 → 57 → 53 → 48, matching every value quoted. All MCQs have one correct option and no duplicates. The carbon-cycle SVG's nine arrows all run the right way; the find-the-mistake item is internally consistent (`mistakeLine` 2, respiration in both columns).

### D1 [H] `q…0004` part (a) common-error regex flags correct trend answers
- **Current:** `{"kind":"text","regex":"fastest|quickest|^[^;\\n]{0,40}\\bA\\b[^;\\n]{0,40}$"}` → "That names the fastest environment, which is a different question…"
- **Why wrong (simulated):** `mark.ts` compiles every text pattern with the `i` flag, so `\bA\b` matches the article "a": "mass decreased at a steady rate", "there was a decrease in mass over time" and "the mass fell over time in A, B and C" are all told they named the fastest environment. (The trailing `$` is a regex anchor, not a maths delimiter — no learner sees it.)
- **Fix:** `fastest|quickest|\b(environment|bag)\s+A\b|^\s*A\s+(was|is|because|had|decomposed)\b`.

### D2 [M] `q…0004` part (a) key words are past-tense phrases only
- **Current:** `keyWords: [{"any":["mass decreased","mass fell","decreased as time"],"marks":1,"reject":["stayed the same"]}]`.
- **Why wrong (simulated):** "the mass decreases with time in all three environments" → 0/1; "in all three the mass of leaf litter went down over the twelve weeks" → 0/1.
- **Fix:** `any: ["decrease","fell","fall","falls","went down","goes down","dropped","drops","reduced","lost mass","loses mass"]` (the engine matches "decrease" to decreases/decreased/decreasing), `reject: ["stayed the same","increased"]`.

### D3 [H] `q…0004` part (b) — the numbers to calculate with are not given
- **Current:** stem "Calculate the rate of decomposition in environment C between 0 and 12 weeks, in grams per week. Show your working out." — the only data is the line graph (gridlines every 20 g), `tolerance: exact`, answer 1 g/week. The question has no results table (`context` carries only a setting).
- **Why wrong:** C's end point (48 g) must be read to the gram off a 20-g grid; a reading of 47 or 50 gives 1.08 or 0.83 and scores 0 of 3 under an exact tolerance. The exam question had a results table, and the bundle's own worked example, note question g3 and diagnostic 05 all state "60 g to 48 g".
- **Fix:** state the values in the stem ("In environment C the mass fell from 60 g to 48 g…") or add a results-table figure; failing that, give the numeric answer a tolerance.

### D4 [M] `q…0006` (main) common-error regex can never match
- **Current:** `{"kind":"text","regex":"decomposers respire[^;\\n]{0,60}takes it in"}`.
- **Why wrong (computed):** `mark.ts` joins an order answer's items with `", "`; even when the respiration item is placed directly before the photosynthesis item the gap between "decomposers respire" and "takes it in" is 66 characters, so the 60-character window never matches.
- **Fix:** `decomposers respire[^;\n]{0,120}takes it in`.

### D5 [H] `q…0008` part (a) — listing rule wipes out prose answers
- **Current:** `listingRule: true` with two groups; stem "Suggest two features of a peat bog…"
- **Why wrong (simulated):** "it is waterlogged and cold, so there is no oxygen and the decomposers' enzymes work slowly" earns both groups, then the splitter counts four clauses and deducts two → 0/2; "waterlogged, so no oxygen, and acidic" → 1/2; the model answer itself scores 1/2 through the key-word path and is rescued only by the exact-match path.
- **Fix:** `listingRule: false`.

### D6 [M] `q…0003` part (a) — "secretes" and "absorbed" do not match their own inflections
- **Current:** group 1 `{"any":["secretes","releases enzymes"]}`, group 3 `{"any":["absorbed","taken in"]}`.
- **Why wrong (simulated):** the engine stems a key word forward only ("secretes" ≠ secrete/secreted/secretion; "absorbed" ≠ absorbs/absorb), so "it secretes enzymes onto the bread, digests it outside its cells and absorbs the products" → 2/3 and "enzymes are secreted out of the hyphae, extracellular digestion happens on the bread, then the mould absorbs the small soluble molecules" → 1/3.
- **Fix:** group 1 `any: ["secrete","secretion","release enzymes","releases enzymes","enzymes onto","enzymes out"]`; group 3 `any: ["absorb","absorption","taken in","take in","takes in"]` ("secrete" and "absorb" then cover every inflection).

### D7 [L] `we…01` twin — same inflection gap, and "nutrients are recycled" misses group 4
- **Current:** group 3 `{"any":["absorbed","taken in"]}`, group 4 `{"any":["recycles nutrients","humus","minerals returned"]}`.
- **Why wrong (simulated):** "…the products are absorbed, and nutrients are recycled into the soil" → 3/4; "…absorb the soluble products and this forms humus" → 3/4.
- **Fix:** group 3 as D6; group 4 `any: ["recycl","humus","minerals returned","nutrients back","into the soil","back to the soil"]`.

### D8 [M] `q…0003` part (b) — the scheme's "release minerals" alternative scores 0
- **Current:** `keyWords: [{"any":["recycle","returned to the soil","humus"],"marks":1}]`; scheme "recycle nutrients / release minerals back into the soil for plants / form humus".
- **Why wrong (simulated):** "they release minerals back into the soil for plants to use" → 0/1.
- **Fix:** `any: ["recycl","returned to the soil","into the soil","back to the soil","humus","release minerals","releases minerals","minerals back","nutrients back"]`.

### D9 [H] `q…0007` part (a) — model-equivalent answers score 0/2
- **Current:** group 1 `{"any":["photosynthesising faster","photosynthesis is faster","more photosynthesis"]}`, group 2 `{"any":["uses up","used more quickly","than it produces"]}`.
- **Why wrong (simulated):** "the rate of photosynthesis is greater than the rate of respiration so more carbon dioxide is taken in than is given out" → 0/2; "photosynthesis is happening faster than respiration so carbon dioxide is used up faster than it is made" → 0/2 ("used up" fails "uses up" because a phrase is only stemmed on its last s).
- **Fix:** group 1 `any: ["photosynthesis is faster","photosynthesising faster","photosynthesis faster","faster than respiration","faster than it respires","greater than the rate of respiration","photosynthesis is greater","more photosynthesis","rate of photosynthesis is higher"]`; group 2 `any: ["uses up","used up","using up","taken in","absorbed","removed","than it produces","than it makes","than is produced","than is given out","faster than it is made"]`.

### D10 [H] `q…0007` part (b) — same
- **Current:** group 1 `{"any":["cannot photosynthesise","no photosynthesis"]}`, group 2 `{"any":["still respires","respiration continues","respires"]}`.
- **Why wrong (simulated):** "photosynthesis stops in the dark but respiration carries on and gives out carbon dioxide" → 0/2; "the plant can no longer photosynthesise but it is still respiring" → 0/2.
- **Fix:** group 1 `any: ["cannot photosynthesise","no photosynthesis","photosynthesis stops","stops photosynthesising","no longer photosynthesise","not photosynthesise","does not photosynthesise","no light"]`; group 2 `any: ["respir","still respires","respiration continues","respiration carries on","carries on respiring"]` with `reject: ["stops respiring","respiration stops","does not respire","no respiration"]` ("respir" covers respire/respires/respiring/respiration).

### D11 [L] Examiner-report citation points at the wrong tier
- **Current:** note examiner block "March 2026 B1 Q5(a) — the part that caught everyone", `source: "ccea-cer:science:2026-march:B1F:Q5"`; `q…0004.examinerSources: ["ccea-cer:science:2026-march:B1F:Q5"]`; `topic.examinerSources` includes the same id.
- **Why wrong:** the mined Foundation Q5 block (`pipeline/mine/cer-blocks/science/2026-march-B1F.json`) is the photosynthesis / light-intensity question. The saprophyte, overall-trend and "divided by an incorrect time" findings are the Higher paper's Q5 (`2026-march-B1H.json`, Q5; report text lines 305–320); only the Foundation overview line repeats the Q5(a) sentence.
- **Fix:** cite `ccea-cer:science:2026-march:B1H:Q5` in all three places and title the block "March 2026 B1 Higher Q5(a)".

### D12 [L] Carbon-cycle figure — plants → dead material arrow labelled "death, excretion and egestion"
- **Where:** shared carbon-cycle SVG (`note.blocks.json` figure block 15; `q…0001/0002/0006/0009` figures[0]); labels `<text x="40" y="322">death, excretion</text>` / `<text x="40" y="338">and egestion</text>` on the green plants → dead material arrow; alt/title "death, excretion and egestion from plants and animals to dead material".
- **Why wrong:** egestion is the removal of undigested food from an animal's gut; plants do not egest. A learner copying the label onto a plant arrow in an exam would lose the mark.
- **Fix:** label the plants → dead material arrow "death" (keep "death, excretion, egestion" on the animals arrow) and amend the alt/title text.

### D13 [L] `q…0001` part (c) — "burning" does not cover burn/burnt/burned
- **Current:** `keyWords: [{"any":["combustion","burning"],"marks":1,"reject":["fossilisation"]}]`.
- **Why wrong (simulated):** "we burn it" → 0/1; "it is burnt" → 0/1, though the scheme accepts "burning".
- **Fix:** `any: ["combustion","burn","burnt","burning"]` ("burn" covers burns/burned/burning).

**Verdict (decomposition/carbon cycle):** not publishable as is — D1, D3, D5, D9, D10 lose marks on correct answers or make a calculation unanswerable; D2, D4, D6, D8 are marking-coverage fixes; D7, D11–D13 are tidy-ups. Science, numbers, spec coverage, the graph, the find-the-mistake item and the retrieval prompts all check out.
