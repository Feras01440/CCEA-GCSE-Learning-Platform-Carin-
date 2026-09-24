# Pre-read: B1 nitrogen cycle and minerals/eutrophication (part 3c)

Bundles read in full (note text excluded, as instructed):

- `packs/science/content/b1/b1-nitrogen-cycle/bundle.json` — digest `docs/dev/qa/pre-read/b1-nitrogen-cycle.digest.txt`
- `packs/science/content/b1/b1-minerals-eutrophication/bundle.json` — digest `docs/dev/qa/pre-read/b1-minerals-eutrophication.digest.txt`

Spec statements used (`data/spec/double-award-science.json`, Unit B1 §1.7): *Nitrogen cycle* (H) "role that microorganisms have in the nitrogen cycle, including nitrogen fixation, nitrification, denitrification and decomposition (knowledge of the names of specific bacteria is not required) … aerobic and anaerobic conditions, for example waterlogging"; *Minerals* "absorb minerals … through root hair cells by active uptake/transport", "absorption of nitrates for proteins", "extended shape, providing an increased surface area", (H) "requires energy from respiration … against a concentration gradient"; *Eutrophication* (H) "nitrates stimulating growth of aquatic plants and algae; … dying due to subsequent nitrate depletion and shading; the role of aerobic microorganisms in the decomposition …; the consequences of oxygen depletion on other aquatic vertebrates and invertebrates".

How the marking claims were tested: a tsx harness (`…/scratchpad/mark-test.ts`) imports `markAnswer`/`matchesCommonError` from `src/components/items/mark.ts` and marks, for every text part of both bundles, the accepted answer (also with a suffix so the exact-match shortcut cannot hide key-word gaps), the part's `workedSolution`, paraphrases, wrong answers (swapped bacterium/process, reversed sequence, misconception-only sentences) and the order items; twins are marked with the marks the real UI passes (sum of parent steps, `WorkedExampleAsQuestion.tsx`). Baseline output: `…/scratchpad/baseline.txt` (94 flags). Every fix below was then applied as an override (`…/scratchpad/fixes.json`) and the harness re-run (`…/scratchpad/fixed.txt`): every under-earning case now earns full marks, every wrong answer scores what the scheme would give, and only the two documented residuals remain. Numbers were recomputed with node. Appendix A at the end holds the exact replacement groups/regexes, generated from that verified fixes file.

Marker facts that drive several findings (from `text-marking.ts`): a single key word matches inflections only as a *stem* (`respire` matches respiration/respiring; `respiration` does not match respires); a phrase must appear verbatim; a trailing `s`/`es` is stripped from a key word (`washes` → `wash`, `shades` → `shad`, so `shades` does not match "shade"); the listing rule counts every comma/and-separated segment of ≤4 words; a common error's `marksTypicallyEarned` is a floor (`max(base, typical)`), never a cap.

---

## Bundle 1 — `science.b1.b1-nitrogen-cycle`

### N1. q.science.b1.b1-nitrogen-cycle.0006 (d) — the reject `high` cancels every "higher" answer
- Current: group 1 `{"any":["higher than","more than","greater than"],"marks":1,"reject":["high"]}`.
- Why wrong: `high` is a 4-letter key word, so the stem rule matches "high**er**" — the reject fires on the very word the group wants. Baseline: worked solution 1/2 ("high" cancels the mark it sits with), accepted answer with a trailing sentence 1/2, "The clover field finished higher than the oat field by 25 mg per kg." 1/2. "has more nitrate than" also misses "more than" (1/2). Group 1 is unearnable except by typing the accepted string exactly.
- Fix: Appendix A `N.0006.d` (drop the reject; add bare comparatives and `than`). Verified: solution 2/2, all comparative paraphrases 2/2, "The clover field is high, 45 mg per kg." 1/2 with the no-comparative diagnosis.

### N2. q.science.b1.b1-nitrogen-cycle.0002 (d) — listing rule zeroes the two-organism answer
- Current: `listingRule: true`; group `{"any":["decomposing","decomposers","saprophytic"],…}`; worked solution "Decomposing (saprophytic) bacteria and fungi."
- Why wrong: the question asks for *organisms* (plural) and the model answer is "bacteria and fungi", which the listing rule splits on "and" into two ≤4-word segments against one group: worked solution 0/1 ("Listing rule: more answers were given than asked for"), "saprophytic bacteria and fungi" 0/1. The group also misses "decompose", "decomposition", "saprophytes", "fungi and bacteria that decompose it" (all 0/1).
- Fix: `listingRule: false` and Appendix A `N.0002.d`. Verified all 1/1. (Judgement call: the fix also accepts a bare "bacteria and fungi" — P1's bracket "(decomposers)" suggests that is fine; remove those two phrases if not.)

### N3. q.science.b1.b1-nitrogen-cycle.0003 (b) — listing rule zeroes "amino acids and proteins"
- Current: `listingRule: true`, group `["protein","amino acids"]`; dx 05 feedback says "March 2026 examiners accepted either word".
- Why wrong: "amino acids and proteins" → 0/1, "amino acids, then protein" → 0/1 (listing penalty), although both words are the group's own alternatives.
- Fix: `listingRule: false`. Verified 1/1.

### N4. q.science.b1.b1-nitrogen-cycle.0004 (c) — swap regex matches the correct statement; group 3 pays the swapped role; group 1 misses "little/lack of oxygen"
- Current ERR: `nitrifying bacteria[^;\n]{0,40}(nitrogen gas|remove|destroy)` (typical 1); group 1 `["no oxygen","anaerobic","air spaces"]`; group 3 `["less nitrate is made","nitrifying","nitrogen-fixing"]`; group 2 carries a pointless reject `"nitrifying bacteria turn nitrate"`.
- Why wrong: (i) no word boundary, so the pattern matches "**de**nitrifying bacteria … nitrogen gas": "Lack of oxygen means denitrifying bacteria multiply and remove nitrate as nitrogen gas, while the nitrogen fixing bacteria are less active so less nitrate is produced." scored 1/3 with the feedback "Nitrifying bacteria make nitrate; denitrifying bacteria destroy it" — a correct sentence diagnosed as the swap; "Denitrifying bacteria turn nitrates into nitrogen gas." alone got the same wrong diagnosis. (ii) bare `nitrifying` in group 3 pays the swapped answer "There is no oxygen, so the nitrifying bacteria turn nitrates into nitrogen gas." 2/3 (scheme: 1, P1 only). (iii) "little oxygen"/"lack of oxygen"/"less oxygen" (P1's own "little or no oxygen") earn nothing, and "nitrogen fixing" (no hyphen) does not match "nitrogen-fixing". (iv) the leach ERR (typical 1) floors "The nitrate is all washed away by the water." at 1/3.
- Fix: Appendix A `N.0004.c` — regex `\bnitrifying bacteria[^;\n]{0,40}(nitrogen gas|remove|destroy)`, both ERR typical marks 0, role-bearing group 3. Verified: the three paraphrases 3/3; swapped answer 1/3 with the swap diagnosis; "Denitrifying bacteria turn nitrates into nitrogen gas." 1/3 "still missing no oxygen, less nitrate is made"; washed-away sentence 0/3 with the leach diagnosis.

### N5. q.science.b1.b1-nitrogen-cycle.0004 (b) — P1's own alternatives are not key words
- Current: `["waterlogged","anaerobic","no oxygen"]`; P1 reads "waterlogged / anaerobic / lack of oxygen".
- Why wrong: "lack of oxygen" 0/1, "the air spaces are full of water" 0/1, "it is flooded so there is little oxygen" 0/1.
- Fix: Appendix A `N.0004.b`. Verified 1/1 each.

### N6. q.science.b1.b1-nitrogen-cycle.0005 (b) — reject `decreases`, phrase-only trend, worked solution under-earns, ERR floors wrong answers
- Current: group 1 `["yield increases","increases as"]` reject `["decreases"]`; group 2 `["levels off","almost unchanged","plateau","increase gets smaller"]`; ERR `^(?![^]*(level|plateau|smaller|unchanged))[^]*$` typical 1.
- Why wrong: the worked solution ("each rise is smaller than the one before … almost levelled off") scores 1/2; "the yield rises, but each rise is smaller and the last one is tiny" 0/2; "the rate of increase decreases and it levels off" 1/2 (reject); "higher yield … plateaus" 1/2; "Yield goes up … levels off" 1/2. The ERR's typical 1 floors any answer lacking those words, e.g. a wholly wrong "The yield decreases as more fertiliser is added." would be lifted to 1/2 once the reject is narrowed.
- Fix: Appendix A `N.0005.b` (groups; reject narrowed to `yield decreases/falls/drops/goes down`; ERR requires the rise to be described: `^(?=[^]*(yield (increases|rises|goes up|increased|rose|went up)|higher yield|more yield|greater yield|bigger yield|increase in yield|rise in yield))(?![^]*(level|plateau|smaller|unchanged|flat|tiny|barely|hardly|constant|little))[^]*$`). Verified: solution 2/2, four paraphrases 2/2, "The yield decreases…" 0/2, "As the fertiliser level increases the yield increases." 1/2 with the plateau diagnosis.

### N7. q.science.b1.b1-nitrogen-cycle.0005 (c) — "take up any more" and "limited by" are not accepted; worked solution under-earns
- Current: group 1 `["cannot absorb any more","cannot take in any more","maximum uptake"]`; group 2 `["another factor","something else","limiting"]`.
- Why wrong: worked solution 1/2 ("limited by some other factor" matches none); "cannot take up any more nitrate so another factor limits growth" 1/2; "absorbing nitrate as fast as they can, so growth is limited by light or water" 0/2; "Uptake is at its maximum and something else is limiting" 1/2; "all the nitrate they need" 1/2.
- Fix: Appendix A `N.0005.c`. Verified 2/2 for all, solution 2/2.

### N8. q.science.b1.b1-nitrogen-cycle.0005 (d) — P1's second alternative earns nothing
- Current: `["washed","run-off","river","lake"]`; P1 reads "…washed (leached) into rivers or lakes / it is a waste of money for no extra yield".
- Why wrong: "it is a waste of money for no extra yield" 0/1, "leaching" 0/1, "eutrophication of nearby water" 0/1.
- Fix: Appendix A `N.0005.d`. Verified 1/1.

### N9. q.science.b1.b1-nitrogen-cycle.0006 (b) — "fix nitrogen" is not "nitrogen-fixing"; ERR floors a wrong answer
- Current: group 2 `["nitrogen-fixing","nitrogen fixing"]`; ERR `^(?![^]*(nodul|fix))[^]*$` typical 1.
- Why wrong: "nodules on its roots containing bacteria that fix nitrogen from the air into nitrates" 2/3; "Clover is a cereal crop that uses up nitrate." would be floored at 1/3 by the ERR.
- Fix: Appendix A `N.0006.b` (group 2 adds fix/fixes/fixation/fixing forms; ERR `^(?=[^]*(nitrogen gas|from the air|in the air|bacteria))(?![^]*(nodul|fix))[^]*$`). Verified 3/3; the cereal answer 0/3; "Bacteria in the clover turn nitrogen gas from the air into nitrate." 1/3 with the nodules/fixing diagnosis.

### N10. q.science.b1.b1-nitrogen-cycle.0008 (a) — ERR regex matches the accepted answer
- Current: `^[^;\n]{0,30}nitrification[^;\n]{0,10}$` (typical 0).
- Why wrong: it matches "de**nitrification**" — the accepted answer and the worked solution both hit it (harmless today only because the marker consults common errors on a miss).
- Fix: `^[^;\n]{0,30}\bnitrification\b[^;\n]{0,10}$`. Verified: no hit on the accepted answer or solution; "nitrification" still 0/1.

### N11. q.science.b1.b1-nitrogen-cycle.0008 (b) — P1's "anaerobic" not accepted, process name rejected, swapped roles score full
- Current: group 1 `["less oxygen","less oxygen deeper"]`; group 2 `["denitrifying"]`; group 3 `["lower","less nitrate"]`; ERR `more nitrate deeper|nitrate increases with depth` typical 1.
- Why wrong: worked solution 2/3 ("As oxygen falls with depth the soil becomes anaerobic" — no "less oxygen"); "…anaerobic because there is little oxygen … the nitrate falls" 1/3; "denitrification increases so there is less nitrate" 2/3; "nitrate content decreases with depth" 2/3; the swapped-role answer "nitrifying bacteria are more active making more nitrate, but denitrifying bacteria are less active so nitrate is lower" 3/3; "There is more nitrate deeper down." floored at 1/3 by the ERR.
- Fix: Appendix A `N.0008.b` (ERR typical 0; role rejects on group 2). Verified: solution 3/3, paraphrases 3/3, swapped 2/3, wrong 0/3 with the diagnosis.

### N12. q.science.b1.b1-nitrogen-cycle.0008 (c) — "aerates"/"air spaces" not accepted; swapped role scores full
- Current: group 1 `["lets air in","air into","oxygen"]`; group 2 `["nitrifying","denitrifying"]`.
- Why wrong: "Ploughing aerates the soil so the aerobic bacteria keep making nitrate and denitrification is reduced." 0/2; "opens up air spaces, so the soil stays aerobic and the nitrifying bacteria keep working" 1/2; "lets air in so the denitrifying bacteria can make more nitrate" 2/2.
- Fix: Appendix A `N.0008.c`. Verified 2/2, 2/2, swapped 1/2.

### N13. we.science.b1.b1-nitrogen-cycle.01 twin — swapped processes score full
- Current: `[{"any":["decomposition","decay"]},{"any":["denitrification"]}]`.
- Why wrong: "Denitrification turns urea into ammonium compounds, and decomposition returns nitrogen to the air." → 4/4 (presence-based).
- Fix: Appendix A `N.we01.twin` (role rejects on both groups; also accepts decompose/decomposed/rotting). Verified: swapped 0/4; the correct paraphrases 4/4.

### N14. we.science.b1.b1-nitrogen-cycle.02 twin — "no longer anaerobic"/"air" not accepted; swapped roles score full
- Current: `[{"any":["oxygen","air spaces"]},{"any":["denitrifying"]},{"any":["nitrifying","nitrogen-fixing"]}]`.
- Why wrong: "The soil is no longer anaerobic, so fewer nitrates are converted to nitrogen gas by denitrifying bacteria, and nitrifying bacteria make more nitrate." 2/3; "puts air back in the soil so the aerobic nitrogen fixing and nitrifying bacteria make nitrate again…" 2/3; "the denitrifying bacteria make more nitrate and the nitrifying bacteria stop working" 3/3.
- Fix: Appendix A `N.we02.twin`. Verified 3/3 ×3, swapped 1/3.

### N15. (minor, 1-mark) q.0001 (a(ii)) and q.0003 (c)
- "decomposing" and "rotting" 0/1 on a(ii); "by consuming plants and digesting the protein" and "from the protein in the food they have eaten" 0/1 on 0003 (c) (`eats` only matches eat/eats; no consume/food/digest/eaten).
- Fix: Appendix A `N.0001.a(ii)`, `N.0003.c`. Verified 1/1.

### N16. Beyond the specification without a callout — nitrites and lightning
- Where: rp.science.b1.b1-nitrogen-cycle.03 "…and by lightning"; rp.05 "Ammonium compounds into nitrites and then into nitrates"; q.0009 worked solution "convert the ammonium into nitrites and then into nitrates"; q.0009 indicativeContent point 7 `keyWords: ["nitrifying","nitrites"]`; the cycle figure (`nitrites` box, "(and lightning)" label, used by we.01, q.0001, q.0007, q.0009); the q.0002 table figure "nitrite, nitrate".
- Why wrong: the B1 statement names only fixation, nitrification, denitrification and decomposition; the note's `notOnThisSpec` is `["Names of specific bacteria","Equations for the reactions","The Haber process","Eutrophication (outcome 1.7.12)"]`, so neither nitrite nor lightning is called out. Point 7's `nitrites` key word makes a spec-accurate self-marked answer look incomplete.
- Fix: word rp.05, the q.0009 solution and point 7 as "ammonium compounds into nitrates" and set point 7 keyWords to `["nitrifying","aerobic"]`; drop the nitrite box/"(and lightning)" from the figures and "and by lightning" from rp.03 — or add "Nitrite as an intermediate; nitrogen fixation by lightning" to `notOnThisSpec` and keep them only in the figures.

### N17. ftm.science.b1.b1-nitrogen-cycle.02 — marks earned and feedback disagree
- Current: `marksEarnedAsWritten: ["P1"]`; feedback "One mark from three, for the last line."
- Why wrong: line 3 ("So there is less nitrate for the plants.") restates the question and is no marking point in any scheme in the bundle; the only line touching P1 (air spaces full of water → no oxygen) is line 1 ("The soil is full of water so all the nitrate is washed away."), which `whatWentWrong` itself calls weak.
- Fix: either feedback → "One mark from three, for the first line — 'full of water' is the start of the oxygen point, though it stops short of saying the oxygen has gone. The single word that costs the other two…" (keep `["P1"]`), or `marksEarnedAsWritten: []` with "Nothing from three…" if the reviewer judges "full of water" insufficient. Pick one; both fields must tell the same story.

### N18. ftm.science.b1.b1-nitrogen-cycle.01 — three wrong lines, one `mistakeLine`
- Current: `studentWorking` = "P: nitrogen fixation" / "Q: nitrification" / "R: denitrification", `mistakeLine: 1`.
- Why wrong: every line has the same error, but `FindTheMistake.tsx` accepts only `n === item.mistakeLine` (a first tap on line 2 or 3 is a miss and the second tap gives the line away).
- Fix: make lines 2–3 correct ("Q: nitrifying bacteria", "R: denitrifying bacteria"), `marksEarnedAsWritten: ["P2","P3"]`, feedback "Two marks from three. The biology behind the answer was right; line 1 gave the process where the bacteria were asked for…" — or leave the item until the component supports several mistake lines (platform change, not this bundle).

### Clean in this bundle
- Numbers (all recomputed with node): 6 − 4.8 = 1.2, 1.2 ÷ 4.8 = 25 %, ÷ 6 = 20 %, (4.8 − 3.2) ÷ 3.2 = 50 %; 42 − 11 = 31, 31 ÷ 42 = 73.8 %, 31 ÷ 11 = 281.8 %; 45 − 18 = 27, 27 ÷ 18 = 150 %, 27 ÷ 45 = 60 %; 45 − 20 = 25; bar chart 3.2 / 4.8 / 6 / 6.2 (6 + 0.2); part marks sum to every question header; QWC bands 5–6 / 3–4 / 1–2 / 0.
- Science: the four processes, their bacteria and the aerobic/anaerobic split, waterlogging chain, root nodules, plants → amino acids/protein, animals by feeding — all correct and consistent across worked examples, diagnostics, questions, prompts and figures (apart from N16).
- Diagnostics: 7 items, exactly one correct option each, no duplicate texts or ids, every distractor genuinely wrong.
- Order item q.0007: correct order verified; the ammonium-step ERR fires on "0,1,2,4,3" (2/4 with the right diagnosis).
- `$` / `${`: none outside the note (the only `$` characters are regex anchors).
- Regexes: no greedy `.*` across clauses, no `\bA\b`; the anchored `[^]*` lookaheads are deliberate whole-answer tests (their floor problem is N6/N9 and the cross-cutting note).
- Key words on q.0001 (all), q.0002 (a–c), q.0003 (a), q.0004 (a), q.0005 (a), q.0006 (a, c) behave.

**Verdict — b1-nitrogen-cycle: science sound, numbers/MCQ/order/`$` clean; not ready to ship as marked — nine text parts and both twins under-earn ordinary paraphrases (q.0006 (d) is unearnable, q.0002 (d)'s own solution scores 0), one ERR misdiagnoses correct denitrifying statements, nitrites/lightning are off-spec without a callout, and both find-the-mistake items are inconsistent. All marking fixes above are verified.**

---

## Bundle 2 — `science.b1.b1-minerals-eutrophication`

### M1. q.science.b1.b1-minerals-eutrophication.0001 (b) — the part's own solution under-earns
- Current: group 1 `["extension","extended shape","long and narrow"]` reject `["like a hair on your head"]`; group 2 `["large surface area","increased surface area"]`; ERR `hair on (a|your|the) head|like human hair` typical 1.
- Why wrong: worked solution ("a much **larger** surface area") 1/2; "A long projection which gives a bigger surface area." 0/2; "extended shape … larger surface area" 1/2. The reject cancels an answer that says "extension" and also mentions the hair comparison (the ERR already diagnoses that). The ERR's typical 1 floors "It looks like a hair on your head." at 1/2.
- Fix: Appendix A `M.0001.b` (group 2 = `["surface area"]`, no reject, ERR typical 0). Verified: solution 2/2, paraphrases 2/2, hair-only answer 0/2 with the diagnosis.

### M2. q.science.b1.b1-minerals-eutrophication.0002 (a) — gradient/energy/respiration phrasing, and two ERRs that floor wrong answers at 2/4
- Current: group 2 `["against the concentration gradient","low to high","against the gradient"]`; group 3 `["requires energy","needs energy","uses energy"]`; group 4 `["respiration"]`; ERR gradient (typical 2), ERR `^(?![^]*respir)[^]*$` (typical 2).
- Why wrong: "Active transport moves them against **a** concentration gradient **using** energy from respiration." 2/4; "By active uptake, from a low concentration to a high concentration, which needs energy released when the cell **respires**." 2/4 (`respiration` is not a stem); "By osmosis." scored 2/4 and "By diffusion down the concentration gradient, which needs no energy." 2/4 — both floored by the ERRs' typical marks.
- Fix: Appendix A `M.0002.a` (`respir` stem; against-a/its/their, from-low forms; using/energy-is-needed forms; gradient ERR typical 0; missing-respiration ERR `^(?=[^]*(active|against|low to high))(?![^]*respir)[^]*$` typical 2). Verified: paraphrases 4/4; "By osmosis." 0/4; diffusion answer 0/4 with the gradient diagnosis; "By active transport against the concentration gradient, which needs energy." 3/4 with the respiration diagnosis.

### M3. q.science.b1.b1-minerals-eutrophication.0002 (b) — "does not use energy"/"passive" not accepted; wrong-process wording scores full; ERR fires on a correct sentence
- Current: group 1 reject `["water enters by active transport"]`; group 2 `["no energy","without energy","does not need energy"]`; ERR `water[^;\n]{0,30}active transport` typical 0.
- Why wrong: "Osmosis, which does not use energy, while active transport does." 1/2; "By osmosis - it is passive." 1/2; "Water is taken in by active transport, not osmosis, which needs no energy." 2/2; the ERR matched the correct "Water enters by osmosis, not active transport" so a P1-only answer got "Water is never taken up by active transport" as feedback.
- Fix: Appendix A `M.0002.b` (reject list covering taken in/absorbed/moves/… by active transport; group 2 with passive/does-not-use forms; ERR `water(?:(?!osmosis)[^;\n]){0,30}active transport`). Verified: paraphrases 2/2; both wrong-process answers 1/2 with the active-transport diagnosis; "Water enters by osmosis, not active transport." 1/2 "still missing no energy".

### M4. q.science.b1.b1-minerals-eutrophication.0002 (c) — `respiration` not a stem; "absorb"/"uptake" not accepted
- Current: `[{"any":["respiration"]},{"any":["active transport","energy for absorbing"]}]`.
- Why wrong: "To release energy by respiring for active uptake of minerals." 0/2; "Respiration in the mitochondria provides the energy needed to absorb mineral ions against the gradient." 1/2.
- Fix: Appendix A `M.0002.c`. Verified 2/2.

### M5. q.science.b1.b1-minerals-eutrophication.0003 (a) — trend phrasing, reject `decreases`, ERR matches a correct paraphrase and floors a wrong one
- Current: group 1 `["uptake increases","increases as"]` reject `["decreases"]`; group 2 `["levels off","plateau","stays the same"]`; ERR `^(?![^]*(level|plateau|stays))[^]*$` typical 1.
- Why wrong: "The more oxygen there is the more nitrate is taken up, until it reaches a maximum and stays constant." 0/2; "the rate of increase decreases until it flattens out" 1/2 (reject) and the ERR matches that correct sentence; "rises steeply … then stays the same at 7" 1/2; "The uptake decreases as oxygen increases." floored at 1/2.
- Fix: Appendix A `M.0003.a` (groups; reject narrowed to `uptake decreases/falls/drops/goes down`; ERR `^(?=[^]*(uptake (increases|rises|goes up|increased|rose)|more nitrate|increase in uptake|greater uptake|higher uptake|uptake is higher))(?![^]*(level|plateau|stays|constant|flat|maximum|steady|stable|unchanged|stops))[^]*$`). Verified: four paraphrases 2/2; wrong 0/2.

### M6. q.science.b1.b1-minerals-eutrophication.0003 (c) — `respiration` not a stem; ERR floors "By diffusion." at 1/3
- Fix: group 1 `["respir"]`; ERR `^(?=[^]*(active|energy))(?![^]*respir)[^]*$` (Appendix A `M.0003.c`). Verified: "Oxygen lets the roots respire aerobically to release energy for active uptake." 3/3 (was 2/3); "By diffusion." 0/3 (was 1/3).

### M7. q.science.b1.b1-minerals-eutrophication.0003 (d) — P1's own wording not accepted
- Current: group 1 `["respiration is at its maximum","maximum rate","as fast as it can"]`; group 2 `["cannot take up any more","cannot absorb any more","another factor"]`.
- Why wrong: "Respiration cannot go any faster so no extra energy is released, and something else is limiting." 0/2 (P1 reads "no extra energy is released"); "respiring as fast as they can, so no more energy is available and uptake is limited by another factor" 1/2.
- Fix: Appendix A `M.0003.d`. Verified 2/2; one-idea "Respiration is at its limit so no more energy can be released." 1/2.

### M8. q.science.b1.b1-minerals-eutrophication.0005 (a) — reject `nutrients` punishes an answer that names nitrate; listing rule zeroes "nitrate or phosphate"
- Current: `{"any":["nitrate","phosphate"],"reject":["nutrients"]}`, `listingRule: true`, ERR `nutrient|mineral|chemical`.
- Why wrong: "nitrates, a nutrient from the slurry" 0/1 and then the ERR tells the learner "'Nutrients' earns nothing here. Write nitrate or phosphate." although they did; "nitrate or phosphate" 0/1 (listing rule) although the solution says phosphate is also accepted. The examiner point is *nutrients instead of* the ion, not alongside it.
- Fix: drop the reject, `listingRule: false`, ERR `^(?![^]*(nitrate|phosphate))[^]*(nutrient|mineral|chemical)` (Appendix A `M.0005.a`). Verified: both 1/1; "nutrients" and "minerals" 0/1 with the diagnosis.

### M9. q.science.b1.b1-minerals-eutrophication.0005 (b) — only falls/decreases/drops and rises again/recovers/increases again
- Current: `[{"any":["falls","decreases","drops"]},{"any":["rises again","recovers","increases again"]}]`; ERR `^(?![^]*\d)[^]*$` typical 1.
- Why wrong: "Oxygen goes down from 9.6 at A to 3.2 at C then goes back up to 9.1 at E." 0/2; "It decreased to 3.2 at C and then increased to 9.1 at E." 0/2 (`decreases` → stem `decrease` never reaches "decreased"); "falls … and then rises to 9.1" 1/2. The ERR floors "It changes along the river." at 1/2.
- Fix: Appendix A `M.0005.b` (stems fall/decrease/drop/decline…, again/back/then-rises forms, ERR `^(?=[^]*(fall|decreas|drop|goes down|rise|increas|recover|back up))(?![^]*\d)[^]*$`). Verified: four paraphrases 2/2; content-free 0/2; reversed "increases from A to C and then decreases to E" 1/2. Residual to decide: the ERR says data must be quoted but the groups never require it ("The oxygen falls and then rises again." is 2/2 before and after) — if P1/P2 need the readings, put `"9.6"`, `"3.2"`, `"9.1"` into a group instead of the ERR.

### M10. q.science.b1.b1-minerals-eutrophication.0005 (d) — the part's own solution under-earns; ERR matches "dead algae use up the oxygen"
- Current: group 1 `["aerobic bacteria","decomposers","decomposing"]`; group 2 `["used up the oxygen","oxygen is used","low oxygen"]`; ERR `algae (use|take)[^;\n]{0,20}oxygen|algae used up the oxygen` typical 1.
- Why wrong: worked solution ("their aerobic respiration takes dissolved oxygen out of the water") 2/3; "Bacteria decomposed the dead algae and used up the dissolved oxygen, so invertebrates could not respire and died." 1/3; the ERR matches the correct "bacteria decomposing the dead algae use up the oxygen".
- Fix: Appendix A `M.0005.d` (groups; ERR `(?<!bacteri[^;\n]{0,60})(?<!dead )algae (use|used|take|took)[^;\n]{0,20}oxygen` typical 0). Verified: solution 3/3; paraphrases 3/3; "The algae use up the oxygen so the invertebrates die." 2/3 with the algae diagnosis (P2/P3 by key words, no floor).

### M11. q.science.b1.b1-minerals-eutrophication.0005 (e) — the part's own solution under-earns
- Current: `[{"any":["fewer bacteria","decomposed","used up the dead material"]},{"any":["dissolves back","from the air","oxygen returns"]}]`.
- Why wrong: worked solution ("the bacteria have used up the dead algae and plants, so their numbers have fallen") 1/2; "broken down … bacteria have died off … re-oxygenated by mixing with air" 0/2; "run out of dead material … picks up oxygen from the air" 1/2.
- Fix: Appendix A `M.0005.e`. Verified 2/2 for all, solution 2/2.

### M12. q.science.b1.b1-minerals-eutrophication.0006 (a) — `photosynthesise` does not match "photosynthesis"; `shades` does not match "shade"; "blocks light" not accepted
- Current: group 1 `["shades","shading","blocks the light"]`; group 2 `["photosynthesise","nitrate is used up","nitrate depletion"]`; ERR `stops? oxygen (getting|entering|dissolving)` typical 1.
- Why wrong: "The bloom blocks light reaching the plants so they cannot photosynthesise." 1/2; "No light gets through so photosynthesis stops, and the nitrate has run out." 0/2; "The algae shade the plants below and use up the nitrate." 0/2 (the marker strips `es` from `shades`, leaving `shad`). The ERR floors "The bloom stops oxygen getting into the water." at 1/2.
- Fix: Appendix A `M.0006.a` (ERR typical 0). Verified 2/2 ×3; the oxygen-blocking answer 0/2 with the diagnosis.

### M13. q.science.b1.b1-minerals-eutrophication.0006 (b) — bacteria/multiply phrasing; ERR matches "feed on the dead algae and use up the oxygen"
- Current: group 1 `["aerobic bacteria","decomposing bacteria","decomposers"]`; group 2 `["multiply","increase in number","grow in number"]`; ERR `algae[^;\n]{0,25}(use|used|take|taking)[^;\n]{0,15}oxygen` typical 1.
- Why wrong: "Bacteria decompose the dead material, their numbers rise, and they respire aerobically using the oxygen." 1/3; "The bacteria population grows rapidly as they feed on the dead plants and their respiration uses up the oxygen." 1/3; the ERR matches the correct "Bacteria feed on the dead algae and use up the oxygen as they respire".
- Fix: Appendix A `M.0006.b` (ERR `(?<!bacteri[^;\n]{0,60})(?<!dead )algae(?:(?!bacteri)[^;\n]){0,25}(use|used|take|taking)[^;\n]{0,15}oxygen` typical 0). Verified: five correct sentences 3/3; "The algae use up all the oxygen." 0/3 with the diagnosis.

### M14. q.science.b1.b1-minerals-eutrophication.0006 (c) — "to breathe"/"suffocate" not accepted
- Current: group 2 `["respire","respiration","cannot breathe"]`. "There is not enough oxygen for the fish to breathe." 1/2; "Fish suffocate because the dissolved oxygen has gone." 1/2.
- Fix: Appendix A `M.0006.c`. Verified 2/2.

### M15. q.science.b1.b1-minerals-eutrophication.0007 (a) — "any two from five" written as two fixed single-idea groups
- Current: group 1 `["less fertiliser","spread less","only what the crop needs"]`; group 2 `["strip","buffer","not near the river","not before rain"]`; P1 lists five alternatives.
- Why wrong: two valid different suggestions from the same family score 1/2 ("Do not spread slurry before heavy rain, and leave a strip of land next to the river unfertilised." 1/2); the worked solution itself ("no more fertiliser than the crop can absorb … unfertilised strip") 1/2; "Use less fertiliser and store slurry in a sealed tank." 1/2; "Reduce the amount of fertiliser and keep it away from the river." 0/2; "not near the river"/"not before rain" never occur verbatim in natural wording.
- Fix: two identical groups over one co-occurrence-minimised list (the codebase's "give two" pattern; Appendix A `M.0007.a`). Verified: solution 2/2; four two-idea answers 2/2; single ideas 1/2 (strip; less fertiliser; near the river; before heavy rain; sealed tank). Residual: "Use less fertiliser, only what the crop needs." (two phrasings of one idea) scores 2/2.

### M16. q.science.b1.b1-minerals-eutrophication.0007 (b) — `washes` never matches "washed"; the part's own solution under-earns
- Current: group 1 `["washes","run-off","carried"]`; group 2 `["more nitrate","larger amount","into the river"]`; ERR `nutrients|chemicals` typical 1.
- Why wrong: worked solution ("runs off … carries dissolved nitrate") 1/2; "The rain washed the fertiliser off the fields into the river so a lot of nitrate arrived at once." 1/2; "runs off the land into the river in large amounts" 1/2. The ERR fires on a miss even when nitrate is named next to "nutrients".
- Fix: Appendix A `M.0007.b` (ERR `^(?![^]*(nitrate|phosphate))[^]*(nutrients|chemicals)` typical 0). Verified 2/2 ×3, solution 2/2, "Rain washes nutrients such as nitrate off the land into the river in large amounts." 2/2.

### M17. we.science.b1.b1-minerals-eutrophication.01 twin — "does not need energy", "against the concentration gradient", "actively transported" not accepted; swapped processes score full
- Current: `[{"any":["osmosis"],"reject":["active transport moves the water"]},{"any":["no energy","needs no energy","without energy"]},{"any":["against the gradient","active transport"]}]`.
- Why wrong: "Water enters by osmosis, which is passive and does not need energy, unlike nitrate ions which are actively transported against the concentration gradient using energy." 1/4; "Water enters by active transport which needs no energy, and nitrate enters by osmosis against the gradient." 4/4.
- Fix: Appendix A `M.we01.twin`. Verified: paraphrases 4/4; swapped 2/4.

### M18. we.science.b1.b1-minerals-eutrophication.02 twin — reject `nutrients` cancels "nitrate and other nutrients"; reversed causation scores full
- Current: `[{"any":["nitrate","phosphate"],"reject":["nutrients"]},{"any":["algae","bloom"]},{"any":["bacteria","decompose"]},{"any":["oxygen"]}]`.
- Why wrong: "The sewage adds nitrate and other nutrients, algae bloom, then bacteria decompose them and use up the oxygen…" 3/5; "The oxygen in the river is used up by the nitrate, so the bacteria and algae die and the invertebrates have no food." 5/5.
- Fix: Appendix A `M.we02.twin` (no reject; role-bearing phrases for the bacteria and oxygen groups). Verified: paraphrases 5/5; reversed 2/5.

### M19. we.science.b1.b1-minerals-eutrophication.03 twin — "anaerobic" not accepted; "waterlogged" restates the stem
- Current: group 1 `["little oxygen","no oxygen","waterlogged"]`. "The soil is anaerobic so the roots cannot respire aerobically and release energy for active uptake." 2/4; "The field is waterlogged." alone earned 1/4.
- Fix: Appendix A `M.we03.twin` (drop `waterlogged`, add anaerobic/lack-of-oxygen forms). Verified 4/4; the restatement 0/4.

### M20. q.science.b1.b1-minerals-eutrophication.0004 (main) — the order item's common error can never fire
- Current: `oxygen[^;\n]{0,60}before the plants and algae die` typical 3.
- Why wrong: for `order` specs the regex is tested against the arranged item texts joined with ", " (`mark.ts`), and no item contains "before the plants and algae die". The oxygen-before-death arrangement "0,1,2,5,3,4,6" scored 0/6 with the generic "4 of 7 in the right place".
- Fix: `dissolved oxygen[\s\S]{0,400}the plants and algae die` (deliberately spans items: it matches whenever item 6 or 7 precedes item 4). Verified: "0,1,2,5,3,4,6" and "0,1,5,6,2,3,4" → 3/6 with the sequence diagnosis; correct order 6/6; other misorders unchanged.

### M21. ftm.science.b1.b1-minerals-eutrophication.01 and .02 — several wrong lines, one `mistakeLine`
- ftm.01: `mistakeLine: 2`, but `whatWentWrong` itself says line 3 ("They move down the concentration gradient") and line 1 ("a hair like the ones on your head") are also errors; ftm.02: `mistakeLine: 3`, and line 1 ("Nutrients from the field…") is stated to earn nothing. `FindTheMistake.tsx` accepts only the marked line: a learner who taps line 3 (ftm.01) or line 1 (ftm.02) first is told they missed it.
- Fix: make the unmarked lines correct so exactly one line is wrong — ftm.01 line 1 → "The root hair cell has a long extension which reaches into the soil.", line 3 → "They move against the concentration gradient into the cell." (then re-derive `marksEarnedAsWritten` and the "One mark from four" feedback, and trim `whatWentWrong` to line 2); ftm.02 line 1 → "Nitrate from the fertiliser is washed into the lake.", `marksEarnedAsWritten: ["P1","P2","P5"]`, feedback "Three marks from five…", and move the 'nutrients' point out of `whatWentWrong`. (Alternative: keep as written once the component supports several mistake lines.)

### M22. (low) Terminology — "partially permeable membrane"
- q.0002 (b) worked solution and q.0009 worked solution say "partially permeable membrane"; the CCEA statement (B2 osmosis) says "selectively permeable membrane". Fix: replace the phrase in both solutions.

### Clean in this bundle
- Numbers (recomputed with node): 6.8 − 5.1 = 1.7, 1.7 ÷ 5.1 = 33.3 %, ÷ 6.8 = 25.0 %; 9.6 − 3.2 = 6.4, 6.4 ÷ 9.6 = 66.7 %, ÷ 3.2 = 200 %; 28 → 6; part marks sum to every question header; QWC bands. Figure geometry: the barley curve's plotted points decode to 0.4 / 2.6 / 5.1 / 6.8 / 7.0 / 7.0 at 0–10 units of oxygen (so 5.1 and 6.8 are readable at 4 and 6 as the question assumes); the river bars decode to 9.6 / 8.1 / 3.2 / 5.9 / 9.1 mg per litre and, on a 0–32 scale, 28 / 21 / 6 / 14 / 26 species, matching the stem's 28 → 6 (the species scale is unlabelled, but the stem supplies both values).
- Science and spec fit: root hair cell (extension → surface area, no chloroplasts), active transport (against the gradient, energy from respiration), osmosis needing no energy, nitrate → protein, and the seven-stage eutrophication sequence (leaching → bloom → shading and nitrate depletion → death → aerobic decomposers multiply and respire → oxygen falls → animals die) are correct and consistent with the B1 statements; magnesium/chlorophyll, ATP/carrier proteins are confined to `notOnThisSpec` callouts and the dx 05 / q.0001 (c) feedback.
- Diagnostics: 7 items, exactly one correct option each, no duplicate texts or ids, distractors genuinely wrong.
- `$` / `${`: none outside the note.
- Regexes: no greedy `.*`, no `\bA\b`; q.0001 (a) `hair root|^[^;\n]{0,12}root cell` does not match "root hair cell"; q.0001 (c) and q.0005 (a) rejects/ERRs behave once M8 is applied.
- Key words on q.0001 (a, c), q.0002 (a) group 1, q.0003 (b), q.0005 (c) behave.

**Verdict — b1-minerals-eutrophication: science sound and on-spec, numbers/figures/MCQ/`$` clean; not ready to ship as marked — sixteen text parts and all three twins under-earn ordinary paraphrases (five of the bundle's own worked solutions score below full), three ERR regexes fire on correct sentences, the order item's common error is dead, two ERRs floor wholly wrong answers at 2/4, and both find-the-mistake items have several wrong lines. All marking fixes above are verified.**

---

## Cross-cutting notes (platform behaviour, not bundle defects — for the owner of `src/components/items`)

1. `marksTypicallyEarned` on a text common error is a floor (`Math.max(base.marksAwarded, hit.marksTypicallyEarned)` in `mark.ts`). With key-word groups already paying every present point, a positive-pattern text ERR with typical > 0 pays that many marks to an answer that contains only the misconception ("By osmosis." 2/4 on M q.0002 (a); "The nitrate is all washed away" 1/3 on N q.0004 (c)). The fixes above set typical 0 on positive patterns and give every negative-lookahead ("missing X") pattern a positive lookahead for the half that must be present.
2. `FindTheMistake.tsx` accepts one `mistakeLine`, and `mistake-marking.ts` `fixMatches` accepts a typed correction only verbatim (`nitrogen fixing bacteria` vs `nitrogen-fixing bacteria` → no match; `Denitrifying bacteria turn the nitrate back into nitrogen gas.` → no match), so for prose items the "fix it" stage will almost always end in "Here is the correction". Affects every science ftm, not just these four.
3. `text-long` parts are not auto-marked, so their `commonErrors` (N q.0009 ×2, M q.0008 ×2, M q.0009 ×2) are never evaluated — harmless, but dead.
4. A twin is marked with `marks` = number of parent steps (`WorkedExampleAsQuestion.tsx`): N we.01 twin has 2 groups but 4 marks, M we.02 twin 4 groups but 5 marks. Proportional, but the digest's twin tariff is not what the learner sees.

## Appendix A — verified replacement groups and regexes

Generated from the fixes file the harness re-ran (`…/scratchpad/fixes.json`). Keys are `N`/`M` + question number + part id (`we01.twin` = worked example 01's twin). Each entry replaces the part's `keyWords`, `listingRule` or `commonErrors` as shown; anything not listed is unchanged.


### `M.0001.b`

```json
{
 "keyWords": [
  {
   "any": [
    "extension",
    "extended",
    "extend",
    "extends",
    "elongated",
    "projection",
    "protrusion",
    "long and narrow",
    "long narrow",
    "long and thin",
    "long thin",
    "finger-like",
    "finger like",
    "long shape",
    "sticks out",
    "reaches out",
    "pushes out",
    "grows out"
   ],
   "marks": 1
  },
  {
   "any": [
    "surface area"
   ],
   "marks": 1
  }
 ],
 "commonErrors": [
  {
   "misconception": "sci.root-hair.adaptation-not-named",
   "pattern": {
    "kind": "text",
    "regex": "hair on (a|your|the) head|like human hair"
   },
   "feedback": "Describe it as an extension of the cell, not by comparing it to a body part — the mark scheme does not accept that.",
   "marksTypicallyEarned": 0
  }
 ]
}
```

### `M.0002.a`

```json
{
 "keyWords": [
  {
   "any": [
    "active transport",
    "active uptake",
    "actively transported",
    "actively"
   ],
   "marks": 1
  },
  {
   "any": [
    "against the concentration gradient",
    "against a concentration gradient",
    "against its concentration gradient",
    "against their concentration gradient",
    "against the gradient",
    "against a gradient",
    "against",
    "low to high",
    "low to a high",
    "lower to higher",
    "lower to a higher",
    "from low",
    "from a low",
    "from the low",
    "from a lower",
    "from the lower",
    "uphill",
    "up the concentration gradient",
    "up the gradient"
   ],
   "marks": 1,
   "reject": [
    "down the concentration gradient",
    "down a concentration gradient",
    "down the gradient",
    "down their concentration gradient",
    "down its concentration gradient",
    "high to low",
    "higher to lower",
    "from high",
    "from a high",
    "from the high"
   ]
  },
  {
   "any": [
    "requires energy",
    "needs energy",
    "uses energy",
    "using energy",
    "use energy",
    "need energy",
    "require energy",
    "requiring energy",
    "needing energy",
    "energy is needed",
    "energy is required",
    "energy is used",
    "energy needed",
    "energy required",
    "energy from",
    "energy released",
    "energy supplied",
    "energy provided",
    "takes energy",
    "costs energy",
    "active process",
    "energy-requiring",
    "energy requiring"
   ],
   "marks": 1
  },
  {
   "any": [
    "respir"
   ],
   "marks": 1
  }
 ],
 "commonErrors": [
  {
   "misconception": "sci.active-transport.gradient-direction",
   "pattern": {
    "kind": "text",
    "regex": "down the (concentration )?gradient|high(er)? to low"
   },
   "feedback": "Active transport goes against the gradient, from low to high. Movement down a gradient is diffusion and needs no energy.",
   "marksTypicallyEarned": 0
  },
  {
   "misconception": "sci.active-transport.no-energy-named",
   "pattern": {
    "kind": "text",
    "regex": "^(?=[^]*(active|against|low to high))(?![^]*respir)[^]*$"
   },
   "feedback": "Two of the four marks here are 'requires energy' and 'from respiration'. Write both as separate statements.",
   "marksTypicallyEarned": 2
  }
 ]
}
```

### `M.0002.b`

```json
{
 "keyWords": [
  {
   "any": [
    "osmosis",
    "osmotic"
   ],
   "marks": 1,
   "reject": [
    "water enters by active transport",
    "water is taken in by active transport",
    "water by active transport",
    "water moves by active transport",
    "water is absorbed by active transport",
    "water is moved by active transport",
    "water gets in by active transport",
    "water goes in by active transport",
    "water comes in by active transport",
    "water uses active transport",
    "water needs active transport",
    "active transport moves the water",
    "water is actively transported"
   ]
  },
  {
   "any": [
    "no energy",
    "needs no energy",
    "without energy",
    "does not need energy",
    "does not require energy",
    "does not use energy",
    "doesnt need energy",
    "doesnt require energy",
    "doesnt use energy",
    "not need energy",
    "not require energy",
    "not use energy",
    "energy is not needed",
    "energy is not required",
    "energy is not used",
    "passive",
    "requires no energy",
    "uses no energy",
    "free"
   ],
   "marks": 1
  }
 ],
 "commonErrors": [
  {
   "misconception": "sci.active-transport.water-by-active-transport",
   "pattern": {
    "kind": "text",
    "regex": "water(?:(?!osmosis)[^;\\n]){0,30}active transport"
   },
   "feedback": "Water is never taken up by active transport. Examiners have reported this in two separate series: water moves by osmosis.",
   "marksTypicallyEarned": 0
  }
 ]
}
```

### `M.0002.c`

```json
{
 "keyWords": [
  {
   "any": [
    "respir"
   ],
   "marks": 1
  },
  {
   "any": [
    "active transport",
    "active uptake",
    "actively",
    "absorb",
    "absorption",
    "uptake",
    "take in mineral",
    "take in ions",
    "take up mineral",
    "take up ions",
    "taking in mineral",
    "taking up",
    "against the concentration gradient",
    "against the gradient",
    "against",
    "transport"
   ],
   "marks": 1
  }
 ]
}
```

### `M.0003.a`

```json
{
 "keyWords": [
  {
   "any": [
    "uptake increases",
    "increases as",
    "uptake rises",
    "uptake goes up",
    "more nitrate is taken up",
    "more nitrate is absorbed",
    "more uptake",
    "greater uptake",
    "higher uptake",
    "increase in uptake",
    "rise in uptake",
    "uptake increased",
    "uptake rose",
    "rises as",
    "goes up as",
    "positive correlation",
    "directly proportional",
    "the more oxygen the more",
    "more oxygen more",
    "increases with",
    "rises with",
    "goes up with",
    "increases the uptake",
    "increases uptake",
    "faster uptake",
    "uptake is faster"
   ],
   "marks": 1,
   "reject": [
    "uptake decreases",
    "uptake falls",
    "uptake drops",
    "uptake goes down",
    "negative correlation"
   ]
  },
  {
   "any": [
    "levels off",
    "level off",
    "levelled off",
    "levelling off",
    "levels out",
    "level out",
    "plateau",
    "stays the same",
    "stays constant",
    "remains constant",
    "constant",
    "stays at",
    "remains the same",
    "flattens",
    "flatten",
    "flat",
    "maximum",
    "stops increasing",
    "stops rising",
    "no further increase",
    "no more increase",
    "does not increase any more",
    "steady",
    "stable",
    "unchanged",
    "the same after",
    "the same above",
    "no change above",
    "no change after",
    "levels"
   ],
   "marks": 1
  }
 ],
 "commonErrors": [
  {
   "misconception": "sci.graph.trend-not-from-data",
   "pattern": {
    "kind": "text",
    "regex": "^(?=[^]*(uptake (increases|rises|goes up|increased|rose)|more nitrate|increase in uptake|greater uptake|higher uptake|uptake is higher))(?![^]*(level|plateau|stays|constant|flat|maximum|steady|stable|unchanged|stops))[^]*$"
   },
   "feedback": "The rise is only half the description. The second mark is for the plateau at the right-hand end of the graph.",
   "marksTypicallyEarned": 1
  }
 ]
}
```

### `M.0003.c`

```json
{
 "keyWords": [
  {
   "any": [
    "respir"
   ],
   "marks": 1
  },
  {
   "any": [
    "energy"
   ],
   "marks": 1
  },
  {
   "any": [
    "active transport",
    "active uptake",
    "actively"
   ],
   "marks": 1,
   "reject": [
    "diffusion alone"
   ]
  }
 ],
 "commonErrors": [
  {
   "misconception": "sci.active-transport.no-energy-named",
   "pattern": {
    "kind": "text",
    "regex": "^(?=[^]*(active|energy))(?![^]*respir)[^]*$"
   },
   "feedback": "The link the question is testing is oxygen → respiration → energy → active transport. Respiration is the missing word.",
   "marksTypicallyEarned": 1
  }
 ]
}
```

### `M.0003.d`

```json
{
 "keyWords": [
  {
   "any": [
    "respiration is at its maximum",
    "maximum rate",
    "as fast as it can",
    "as fast as they can",
    "as fast as possible",
    "maximum",
    "cannot go any faster",
    "cannot respire any faster",
    "cannot respire faster",
    "no faster",
    "no more energy",
    "no extra energy",
    "no additional energy",
    "not release any more energy",
    "cannot release any more energy",
    "cannot release more energy",
    "enough energy",
    "all the energy",
    "energy is not limiting",
    "respiration cannot increase",
    "respiration is limited",
    "respiration is at its limit",
    "saturated",
    "flat out"
   ],
   "marks": 1
  },
  {
   "any": [
    "cannot take up any more",
    "cannot absorb any more",
    "cannot take in any more",
    "take up any more",
    "absorb any more",
    "take in any more",
    "no more nitrate",
    "maximum uptake",
    "uptake is at its maximum",
    "uptake cannot increase",
    "uptake stops increasing",
    "another factor",
    "other factor",
    "something else",
    "limiting",
    "limited by",
    "limits the uptake",
    "limits uptake",
    "enough nitrate",
    "all the nitrate",
    "as much nitrate as"
   ],
   "marks": 1
  }
 ]
}
```

### `M.0004.main`

```json
{
 "commonErrors": [
  {
   "misconception": "sci.eutrophication.sequence-confused",
   "pattern": {
    "kind": "text",
    "regex": "dissolved oxygen[\\s\\S]{0,400}the plants and algae die"
   },
   "feedback": "The oxygen is used up by the bacteria decomposing the dead material, so it cannot fall before the plants and algae have died.",
   "marksTypicallyEarned": 3
  }
 ]
}
```

### `M.0005.a`

```json
{
 "keyWords": [
  {
   "any": [
    "nitrate",
    "phosphate"
   ],
   "marks": 1
  }
 ],
 "listingRule": false,
 "commonErrors": [
  {
   "misconception": "sci.eutrophication.vague-nutrients",
   "pattern": {
    "kind": "text",
    "regex": "^(?![^]*(nitrate|phosphate))[^]*(nutrient|mineral|chemical)"
   },
   "feedback": "'Nutrients' earns nothing here. Write nitrate or phosphate.",
   "marksTypicallyEarned": 0
  }
 ]
}
```

### `M.0005.b`

```json
{
 "keyWords": [
  {
   "any": [
    "fall",
    "fell",
    "fallen",
    "decrease",
    "drop",
    "dropped",
    "dropping",
    "goes down",
    "went down",
    "going down",
    "decline",
    "reduce",
    "reduction",
    "lower at",
    "lowest",
    "minimum",
    "dip"
   ],
   "marks": 1
  },
  {
   "any": [
    "rises again",
    "rise again",
    "rising again",
    "rose again",
    "risen again",
    "rises back",
    "rise back",
    "rising back",
    "rose back",
    "back up",
    "back to",
    "increases again",
    "increase again",
    "increasing again",
    "increased again",
    "goes back up",
    "went back up",
    "recover",
    "return",
    "then rises",
    "then rise",
    "then rose",
    "then increases",
    "then increase",
    "then increased",
    "then goes up",
    "then went up",
    "then climbs",
    "then climbed",
    "then improves",
    "then improved",
    "up again",
    "higher again",
    "picks up",
    "picked up",
    "rises to 9",
    "increases to 9",
    "climbs to 9",
    "reaches 9.1",
    "reaching 9.1"
   ],
   "marks": 1
  }
 ],
 "commonErrors": [
  {
   "misconception": "sci.comparison.no-comparative-language",
   "pattern": {
    "kind": "text",
    "regex": "^(?=[^]*(fall|decreas|drop|goes down|rise|increas|recover|back up))(?![^]*\\d)[^]*$"
   },
   "feedback": "A description of data needs the data. Quote at least the highest and the lowest readings.",
   "marksTypicallyEarned": 1
  }
 ]
}
```

### `M.0005.d`

```json
{
 "keyWords": [
  {
   "any": [
    "aerobic bacteria",
    "decomposers",
    "decomposing",
    "decompose",
    "decomposed",
    "decomposition",
    "bacteria",
    "microorganisms",
    "microbes",
    "fungi"
   ],
   "marks": 1
  },
  {
   "any": [
    "used up the oxygen",
    "used up the dissolved oxygen",
    "use up the oxygen",
    "use up the dissolved oxygen",
    "uses up the oxygen",
    "uses up the dissolved oxygen",
    "using up the oxygen",
    "using up the dissolved oxygen",
    "use up oxygen",
    "used up oxygen",
    "uses up oxygen",
    "oxygen is used",
    "oxygen has been used",
    "oxygen was used",
    "oxygen used up",
    "taken the oxygen",
    "take oxygen",
    "takes oxygen",
    "taking oxygen",
    "took oxygen",
    "removes oxygen",
    "remove oxygen",
    "removed oxygen",
    "removing oxygen",
    "oxygen is removed",
    "less oxygen",
    "low oxygen",
    "lower oxygen",
    "little oxygen",
    "lack of oxygen",
    "not enough oxygen",
    "oxygen is low",
    "oxygen has fallen",
    "oxygen falls",
    "oxygen fell",
    "oxygen drops",
    "oxygen dropped",
    "oxygen decreases",
    "oxygen decreased",
    "oxygen is lower",
    "3.2",
    "depleted the oxygen",
    "oxygen depletion",
    "oxygen has been depleted",
    "oxygen out of the water",
    "oxygen from the water",
    "use oxygen",
    "uses oxygen",
    "using oxygen",
    "used oxygen"
   ],
   "marks": 1
  },
  {
   "any": [
    "respire",
    "cannot survive",
    "die",
    "died",
    "dying",
    "death",
    "dead",
    "kill",
    "killed",
    "suffocat",
    "survive",
    "breathe",
    "breath",
    "cannot live",
    "cannot cope",
    "need oxygen",
    "need dissolved oxygen",
    "needs oxygen",
    "need the oxygen"
   ],
   "marks": 1
  }
 ],
 "commonErrors": [
  {
   "misconception": "sci.eutrophication.algae-use-up-oxygen-directly",
   "pattern": {
    "kind": "text",
    "regex": "(?<!bacteri[^;\\n]{0,60})(?<!dead )algae (use|used|take|took)[^;\\n]{0,20}oxygen"
   },
   "feedback": "Living algae photosynthesise and add oxygen. It is the aerobic bacteria decomposing them after they die that use the oxygen up.",
   "marksTypicallyEarned": 0
  }
 ]
}
```

### `M.0005.e`

```json
{
 "keyWords": [
  {
   "any": [
    "fewer bacteria",
    "less bacteria",
    "bacteria have died",
    "bacteria die",
    "bacteria died",
    "bacteria have gone",
    "bacteria decrease",
    "bacteria have decreased",
    "bacteria numbers fall",
    "number of bacteria falls",
    "fewer decomposers",
    "less decomposition",
    "decomposed",
    "decomposition is complete",
    "all decomposed",
    "fully decomposed",
    "broken down",
    "used up the dead material",
    "used up the dead",
    "no more dead",
    "no dead material",
    "dead material has gone",
    "run out of food",
    "no food",
    "less food",
    "food has run out",
    "nothing left to decompose",
    "nothing left to feed on",
    "less respiration",
    "less oxygen is used",
    "less oxygen being used",
    "less oxygen used",
    "further from the outflow",
    "dilut",
    "dispersed",
    "spread out",
    "fewer of them"
   ],
   "marks": 1
  },
  {
   "any": [
    "dissolves back",
    "dissolve",
    "dissolved back",
    "dissolving",
    "from the air",
    "air",
    "oxygen returns",
    "oxygen return",
    "re-oxygenat",
    "reoxygenat",
    "oxygenated",
    "mixing",
    "mixes",
    "turbulence",
    "flowing",
    "flow",
    "oxygen enters",
    "oxygen gets back",
    "oxygen goes back",
    "oxygen comes back",
    "oxygen is replaced",
    "replaced",
    "replenish",
    "photosynthes",
    "photosynthesis",
    "plants grow back",
    "plants recover",
    "plants return",
    "picks up oxygen",
    "picked up oxygen",
    "takes in oxygen"
   ],
   "marks": 1
  }
 ]
}
```

### `M.0006.a`

```json
{
 "keyWords": [
  {
   "any": [
    "shade",
    "shades",
    "shaded",
    "shading",
    "light",
    "sunlight",
    "dark"
   ],
   "marks": 1
  },
  {
   "any": [
    "photosynthesis",
    "photosynthesise",
    "photosynthesize",
    "photosynthesising",
    "photosynthesizing",
    "photosynthesised",
    "photosynthesized",
    "nitrate is used up",
    "nitrate has been used up",
    "nitrate gets used up",
    "nitrate has run out",
    "nitrate runs out",
    "nitrate ran out",
    "nitrate has gone",
    "nitrate is gone",
    "nitrate depletion",
    "nitrate depleted",
    "nitrate is depleted",
    "nitrate has been depleted",
    "used up the nitrate",
    "use up the nitrate",
    "uses up the nitrate",
    "using up the nitrate",
    "used up all the nitrate",
    "run out of nitrate",
    "runs out of nitrate",
    "ran out of nitrate",
    "no nitrate",
    "not enough nitrate",
    "short of nitrate",
    "shortage of nitrate",
    "lack of nitrate",
    "less nitrate",
    "little nitrate",
    "cannot make food",
    "cannot make glucose",
    "no food",
    "starve",
    "algae use the nitrate",
    "algae used the nitrate",
    "algae take the nitrate",
    "algae took the nitrate",
    "algae use up the nitrate",
    "algae have used the nitrate"
   ],
   "marks": 1
  }
 ],
 "commonErrors": [
  {
   "misconception": "sci.eutrophication.algae-block-oxygen",
   "pattern": {
    "kind": "text",
    "regex": "stops? oxygen (getting|entering|dissolving)"
   },
   "feedback": "The plants below are short of light, not of oxygen. Shading and nitrate depletion are the two causes the specification names.",
   "marksTypicallyEarned": 0
  }
 ]
}
```

### `M.0006.b`

```json
{
 "keyWords": [
  {
   "any": [
    "aerobic bacteria",
    "decomposing bacteria",
    "decomposers",
    "decompose",
    "decomposition",
    "decay",
    "bacteria",
    "microorganisms",
    "microbes",
    "fungi",
    "saprophyt"
   ],
   "marks": 1
  },
  {
   "any": [
    "multiply",
    "increase in number",
    "grow in number",
    "numbers rise",
    "numbers increase",
    "numbers grow",
    "number increases",
    "number rises",
    "number grows",
    "more bacteria",
    "more and more bacteria",
    "lots of bacteria",
    "many bacteria",
    "huge numbers",
    "large numbers",
    "population grows",
    "population increases",
    "population rises",
    "population of bacteria",
    "reproduce",
    "breed",
    "thrive",
    "flourish",
    "increase in population",
    "bacteria increase",
    "bacteria grow",
    "bacteria rise"
   ],
   "marks": 1
  },
  {
   "any": [
    "respire",
    "respiration",
    "use the oxygen",
    "uses the oxygen",
    "use up the oxygen",
    "uses up the oxygen",
    "using up the oxygen",
    "use oxygen",
    "uses oxygen",
    "using oxygen",
    "use up oxygen",
    "used up the oxygen",
    "take oxygen",
    "takes oxygen",
    "taking oxygen",
    "remove oxygen",
    "removes oxygen",
    "removing oxygen",
    "need oxygen",
    "needs oxygen",
    "needing oxygen",
    "require oxygen",
    "requires oxygen",
    "oxygen is used",
    "oxygen is taken",
    "oxygen is removed"
   ],
   "marks": 1
  }
 ],
 "commonErrors": [
  {
   "misconception": "sci.eutrophication.algae-use-up-oxygen-directly",
   "pattern": {
    "kind": "text",
    "regex": "(?<!bacteri[^;\\n]{0,60})(?<!dead )algae(?:(?!bacteri)[^;\\n]){0,25}(use|used|take|taking)[^;\\n]{0,15}oxygen"
   },
   "feedback": "It is the bacteria, not the algae, that use the oxygen — and only after the algae have died.",
   "marksTypicallyEarned": 0
  }
 ]
}
```

### `M.0006.c`

```json
{
 "keyWords": [
  {
   "any": [
    "dissolved oxygen",
    "oxygen"
   ],
   "marks": 1
  },
  {
   "any": [
    "respire",
    "respiration",
    "cannot breathe",
    "breathe",
    "breath",
    "breathing",
    "suffocat",
    "gills",
    "need oxygen",
    "needs oxygen",
    "need dissolved oxygen",
    "need the oxygen",
    "need it",
    "cannot get enough oxygen",
    "not enough oxygen for",
    "no oxygen for"
   ],
   "marks": 1
  }
 ]
}
```

### `M.0007.a`

```json
{
 "keyWords": [
  {
   "any": [
    "less fertiliser",
    "less slurry",
    "less manure",
    "fewer",
    "smaller amount",
    "lower amount",
    "reduce",
    "what the crop needs",
    "what the plants need",
    "than the crop can",
    "than the plants can",
    "right amount",
    "correct amount",
    "too much",
    "less often",
    "less frequently",
    "just enough",
    "strip",
    "gap",
    "margin",
    "distance",
    "away from",
    "near the river",
    "near water",
    "near a river",
    "near rivers",
    "close to",
    "hedge",
    "trees",
    "before rain",
    "before heavy rain",
    "before it rains",
    "when it rains",
    "when it is raining",
    "when rain is",
    "if rain is",
    "wet weather",
    "dry weather",
    "dry day",
    "dry period",
    "when it is dry",
    "when dry",
    "tank",
    "covered",
    "lined",
    "growing season",
    "when crops are growing",
    "when the crop is growing",
    "spring",
    "summer",
    "treat",
    "sewage works",
    "rotation",
    "clover",
    "legume",
    "slow release",
    "slow-release",
    "test the soil",
    "soil test",
    "soil testing",
    "plough it in",
    "ploughed in",
    "inject"
   ],
   "marks": 1
  },
  {
   "any": [
    "less fertiliser",
    "less slurry",
    "less manure",
    "fewer",
    "smaller amount",
    "lower amount",
    "reduce",
    "what the crop needs",
    "what the plants need",
    "than the crop can",
    "than the plants can",
    "right amount",
    "correct amount",
    "too much",
    "less often",
    "less frequently",
    "just enough",
    "strip",
    "gap",
    "margin",
    "distance",
    "away from",
    "near the river",
    "near water",
    "near a river",
    "near rivers",
    "close to",
    "hedge",
    "trees",
    "before rain",
    "before heavy rain",
    "before it rains",
    "when it rains",
    "when it is raining",
    "when rain is",
    "if rain is",
    "wet weather",
    "dry weather",
    "dry day",
    "dry period",
    "when it is dry",
    "when dry",
    "tank",
    "covered",
    "lined",
    "growing season",
    "when crops are growing",
    "when the crop is growing",
    "spring",
    "summer",
    "treat",
    "sewage works",
    "rotation",
    "clover",
    "legume",
    "slow release",
    "slow-release",
    "test the soil",
    "soil test",
    "soil testing",
    "plough it in",
    "ploughed in",
    "inject"
   ],
   "marks": 1
  }
 ]
}
```

### `M.0007.b`

```json
{
 "keyWords": [
  {
   "any": [
    "washes",
    "wash",
    "washed",
    "washing",
    "run-off",
    "runoff",
    "run off",
    "runs off",
    "running off",
    "carried",
    "carries",
    "carry",
    "carrying",
    "leach",
    "flows",
    "flow",
    "flush",
    "flushed",
    "drain",
    "drains",
    "drained",
    "dissolves",
    "dissolve",
    "dissolved",
    "surface water",
    "sweeps",
    "swept",
    "transports",
    "transported"
   ],
   "marks": 1
  },
  {
   "any": [
    "more nitrate",
    "larger amount",
    "large amount",
    "greater amount",
    "lot of nitrate",
    "lots of nitrate",
    "more fertiliser",
    "more slurry",
    "more of the",
    "into the river",
    "into the water",
    "into the lake",
    "into rivers",
    "into lakes",
    "into the stream",
    "reaches the river",
    "reach the river",
    "reaches the water",
    "reach the water",
    "reaches the lake",
    "gets into the river",
    "get into the river",
    "ends up in the river",
    "end up in the river",
    "all at once",
    "at once",
    "sudden",
    "suddenly",
    "quickly",
    "faster",
    "higher concentration",
    "more concentrated",
    "greater quantity",
    "larger quantity",
    "bigger amount"
   ],
   "marks": 1
  }
 ],
 "commonErrors": [
  {
   "misconception": "sci.eutrophication.vague-nutrients",
   "pattern": {
    "kind": "text",
    "regex": "^(?![^]*(nitrate|phosphate))[^]*(nutrients|chemicals)"
   },
   "feedback": "Name the ion: nitrate (or phosphate). 'Nutrients' is the word the mark scheme does not credit.",
   "marksTypicallyEarned": 0
  }
 ]
}
```

### `M.we01.twin`

```json
{
 "keyWords": [
  {
   "any": [
    "osmosis",
    "osmotic"
   ],
   "marks": 1,
   "reject": [
    "active transport moves the water",
    "water enters by active transport",
    "water is taken in by active transport",
    "water by active transport",
    "water moves by active transport",
    "water is absorbed by active transport",
    "water is moved by active transport",
    "water gets in by active transport",
    "water goes in by active transport",
    "water comes in by active transport",
    "water uses active transport",
    "water needs active transport",
    "water is actively transported",
    "nitrate enters by osmosis",
    "nitrate ions enter by osmosis",
    "nitrate by osmosis",
    "ions by osmosis",
    "ions enter by osmosis",
    "nitrate is taken in by osmosis",
    "nitrate moves by osmosis"
   ]
  },
  {
   "any": [
    "no energy",
    "needs no energy",
    "without energy",
    "does not need energy",
    "does not require energy",
    "does not use energy",
    "doesnt need energy",
    "doesnt require energy",
    "doesnt use energy",
    "not need energy",
    "not require energy",
    "not use energy",
    "energy is not needed",
    "energy is not required",
    "energy is not used",
    "passive",
    "requires no energy",
    "uses no energy",
    "free"
   ],
   "marks": 1
  },
  {
   "any": [
    "against the gradient",
    "against the concentration gradient",
    "against a concentration gradient",
    "against its concentration gradient",
    "against their concentration gradient",
    "against",
    "active transport",
    "active uptake",
    "actively transported",
    "actively",
    "low to high",
    "lower to higher",
    "from low",
    "from a low",
    "from the low",
    "uphill"
   ],
   "marks": 1
  }
 ]
}
```

### `M.we02.twin`

```json
{
 "keyWords": [
  {
   "any": [
    "nitrate",
    "phosphate"
   ],
   "marks": 1
  },
  {
   "any": [
    "algae",
    "algal",
    "bloom"
   ],
   "marks": 1
  },
  {
   "any": [
    "bacteria decompose",
    "bacteria feed",
    "bacteria multiply",
    "bacteria break down",
    "decomposed by bacteria",
    "decomposing bacteria",
    "aerobic bacteria",
    "decomposers",
    "decompose",
    "decomposition",
    "decay",
    "broken down by",
    "bacteria respire",
    "bacteria use",
    "bacteria grow",
    "bacteria increase",
    "microorganisms",
    "microbes"
   ],
   "marks": 1
  },
  {
   "any": [
    "oxygen is used up",
    "use up the oxygen",
    "uses up the oxygen",
    "used up the oxygen",
    "using up the oxygen",
    "use up oxygen",
    "uses up oxygen",
    "used up oxygen",
    "use up the dissolved oxygen",
    "uses up the dissolved oxygen",
    "used up the dissolved oxygen",
    "removes oxygen",
    "remove oxygen",
    "removing oxygen",
    "removes dissolved oxygen",
    "take oxygen",
    "takes oxygen",
    "taking oxygen",
    "less oxygen",
    "low oxygen",
    "little oxygen",
    "lack of oxygen",
    "no oxygen",
    "oxygen falls",
    "oxygen decreases",
    "oxygen drops",
    "oxygen runs out",
    "oxygen levels fall",
    "not enough oxygen",
    "without oxygen",
    "deoxygenat",
    "oxygen is removed",
    "oxygen is depleted",
    "oxygen depletion",
    "short of oxygen",
    "oxygen shortage",
    "cannot respire",
    "suffocate"
   ],
   "marks": 1
  }
 ]
}
```

### `M.we03.twin`

```json
{
 "keyWords": [
  {
   "any": [
    "little oxygen",
    "no oxygen",
    "anaerobic",
    "lack of oxygen",
    "less oxygen",
    "low oxygen",
    "not enough oxygen",
    "without oxygen",
    "no air",
    "air spaces",
    "full of water",
    "oxygen"
   ],
   "marks": 1
  },
  {
   "any": [
    "respire",
    "respiration"
   ],
   "marks": 1
  },
  {
   "any": [
    "active transport",
    "active uptake",
    "energy"
   ],
   "marks": 1
  }
 ]
}
```

### `N.0001.a(ii)`

```json
{
 "keyWords": [
  {
   "any": [
    "decomposition",
    "decay",
    "decompose",
    "decomposing",
    "rotting",
    "putrefaction"
   ],
   "marks": 1,
   "reject": [
    "nitrification"
   ]
  }
 ]
}
```

### `N.0002.d`

```json
{
 "listingRule": false,
 "keyWords": [
  {
   "any": [
    "decomposing",
    "decomposers",
    "decompose",
    "decomposition",
    "saprophytic",
    "saprophyte",
    "saprophytes",
    "bacteria and fungi",
    "fungi and bacteria",
    "fungi"
   ],
   "marks": 1,
   "reject": [
    "nitrifying"
   ]
  }
 ]
}
```

### `N.0003.b`

```json
{
 "listingRule": false
}
```

### `N.0003.c`

```json
{
 "keyWords": [
  {
   "any": [
    "eating",
    "feeding",
    "eats",
    "eat",
    "eaten",
    "consume",
    "food",
    "diet",
    "digest",
    "prey"
   ],
   "marks": 1
  }
 ]
}
```

### `N.0004.b`

```json
{
 "keyWords": [
  {
   "any": [
    "waterlogged",
    "anaerobic",
    "no oxygen",
    "lack of oxygen",
    "little oxygen",
    "less oxygen",
    "low oxygen",
    "without oxygen",
    "not enough oxygen",
    "no air",
    "flooded",
    "full of water",
    "air spaces"
   ],
   "marks": 1
  }
 ]
}
```

### `N.0004.c`

```json
{
 "keyWords": [
  {
   "any": [
    "no oxygen",
    "anaerobic",
    "air spaces",
    "little oxygen",
    "lack of oxygen",
    "less oxygen",
    "low oxygen",
    "without oxygen",
    "not enough oxygen",
    "full of water",
    "no air"
   ],
   "marks": 1
  },
  {
   "any": [
    "denitrifying",
    "denitrification"
   ],
   "marks": 1
  },
  {
   "any": [
    "less nitrate is made",
    "less nitrate made",
    "less nitrate is produced",
    "less nitrate is formed",
    "make less nitrate",
    "produce less nitrate",
    "less new nitrate",
    "no new nitrate",
    "not replaced",
    "less nitrification",
    "nitrification slows",
    "less active",
    "slow down",
    "stop working",
    "cannot work",
    "do not work",
    "need oxygen",
    "need air",
    "aerobic bacteria",
    "aerobic nitrifying",
    "aerobic nitrogen"
   ],
   "marks": 1
  }
 ],
 "commonErrors": [
  {
   "misconception": "sci.nitrogen.nitrifying-denitrifying-swapped",
   "pattern": {
    "kind": "text",
    "regex": "\\bnitrifying bacteria[^;\\n]{0,40}(nitrogen gas|remove|destroy)"
   },
   "feedback": "Nitrifying bacteria make nitrate; denitrifying bacteria destroy it. The extra 'de-' reverses the direction.",
   "marksTypicallyEarned": 0
  },
  {
   "misconception": "sci.nitrogen.waterlogged-soil-effect",
   "pattern": {
    "kind": "text",
    "regex": "washed away|leach|rain[^;\\n]{0,20}carries"
   },
   "feedback": "Leaching does happen, but the marking points here are the bacteria: no oxygen, denitrifying bacteria multiply, nitrate leaves as nitrogen gas.",
   "marksTypicallyEarned": 0
  }
 ]
}
```

### `N.0005.b`

```json
{
 "keyWords": [
  {
   "any": [
    "yield increases",
    "yield increased",
    "yield rises",
    "yield rose",
    "yield goes up",
    "yield went up",
    "yield gets higher",
    "yield is higher",
    "higher yield",
    "higher the yield",
    "greater yield",
    "greater the yield",
    "bigger yield",
    "more yield",
    "larger yield",
    "increases the yield",
    "increase in yield",
    "rise in yield",
    "increases as",
    "rises as",
    "goes up as",
    "positive correlation",
    "directly proportional"
   ],
   "marks": 1,
   "reject": [
    "yield decreases",
    "yield falls",
    "yield drops",
    "yield goes down"
   ]
  },
  {
   "any": [
    "levels off",
    "level off",
    "levelled off",
    "levelling off",
    "levels out",
    "level out",
    "almost unchanged",
    "barely changes",
    "hardly changes",
    "hardly any",
    "barely any",
    "plateau",
    "increase gets smaller",
    "rise gets smaller",
    "rises get smaller",
    "increase is smaller",
    "rise is smaller",
    "each rise is smaller",
    "smaller increase",
    "smaller rise",
    "smaller each time",
    "smaller and smaller",
    "less each time",
    "diminishing",
    "tiny",
    "very little",
    "only 0.2",
    "only a small",
    "small increase between",
    "flattens",
    "flatten",
    "flat",
    "less steep",
    "slows down",
    "stops increasing",
    "stops rising",
    "no further increase",
    "little further",
    "little difference",
    "not much difference",
    "little effect",
    "almost no",
    "stays the same",
    "constant",
    "similar"
   ],
   "marks": 1
  }
 ],
 "commonErrors": [
  {
   "misconception": "sci.graph.trend-not-from-data",
   "pattern": {
    "kind": "text",
    "regex": "^(?=[^]*(yield (increases|rises|goes up|increased|rose|went up)|higher yield|more yield|greater yield|bigger yield|increase in yield|rise in yield))(?![^]*(level|plateau|smaller|unchanged|flat|tiny|barely|hardly|constant|little))[^]*$"
   },
   "feedback": "The first half is right, but the second mark is for the flat top: the rises get smaller and the last one is almost nothing.",
   "marksTypicallyEarned": 1
  }
 ]
}
```

### `N.0005.c`

```json
{
 "keyWords": [
  {
   "any": [
    "cannot absorb any more",
    "cannot take in any more",
    "cannot take up any more",
    "cannot use any more",
    "absorb any more",
    "take up any more",
    "take in any more",
    "no more nitrate",
    "maximum uptake",
    "uptake is at its maximum",
    "at its maximum",
    "maximum",
    "as fast as they can",
    "as much as they can",
    "as much nitrate as they can",
    "all the nitrate they need",
    "all they need",
    "enough nitrate",
    "already have enough",
    "saturated",
    "excess",
    "not taken up",
    "unused",
    "surplus",
    "more than they need",
    "more than the plants can"
   ],
   "marks": 1
  },
  {
   "any": [
    "another factor",
    "other factor",
    "something else",
    "limiting",
    "limited by",
    "limits growth",
    "limit growth",
    "light",
    "water",
    "temperature",
    "carbon dioxide",
    "co2",
    "space"
   ],
   "marks": 1
  }
 ]
}
```

### `N.0005.d`

```json
{
 "keyWords": [
  {
   "any": [
    "washed",
    "wash",
    "leach",
    "run-off",
    "runoff",
    "run off",
    "runs off",
    "river",
    "lake",
    "stream",
    "pond",
    "water",
    "eutrophication",
    "algae",
    "pollut",
    "waste",
    "money",
    "cost",
    "expensive",
    "wasted"
   ],
   "marks": 1
  }
 ]
}
```

### `N.0006.b`

```json
{
 "keyWords": [
  {
   "any": [
    "root nodules",
    "nodules",
    "nodule"
   ],
   "marks": 1
  },
  {
   "any": [
    "nitrogen-fixing",
    "nitrogen fixing",
    "fix nitrogen",
    "fixes nitrogen",
    "fixing nitrogen",
    "fixed nitrogen",
    "fix the nitrogen",
    "fixation",
    "fixing",
    "fix",
    "fixes"
   ],
   "marks": 1
  },
  {
   "any": [
    "nitrogen gas",
    "from the air",
    "in the air",
    "atmospheric",
    "atmosphere",
    "nitrogen in the air"
   ],
   "marks": 1
  }
 ],
 "commonErrors": [
  {
   "misconception": "sci.nitrogen.legume-role",
   "pattern": {
    "kind": "text",
    "regex": "^(?=[^]*(nitrogen gas|from the air|in the air|bacteria))(?![^]*(nodul|fix))[^]*$"
   },
   "feedback": "The two words that carry this answer are root nodules and nitrogen-fixing bacteria. Without them the mark scheme has nothing to credit.",
   "marksTypicallyEarned": 1
  }
 ]
}
```

### `N.0006.d`

```json
{
 "keyWords": [
  {
   "any": [
    "higher than",
    "more than",
    "greater than",
    "larger than",
    "higher",
    "greater",
    "larger",
    "more nitrate",
    "than"
   ],
   "marks": 1
  },
  {
   "any": [
    "25",
    "45"
   ],
   "marks": 1
  }
 ],
 "commonErrors": [
  {
   "misconception": "sci.comparison.no-comparative-language",
   "pattern": {
    "kind": "text",
    "regex": "^(?=[^]*(45|25|20))(?![^]*(higher|more|greater|larger|less|than))[^]*$"
   },
   "feedback": "A comparison needs a comparative word. 'The clover field has a high nitrate content' does not compare it with anything.",
   "marksTypicallyEarned": 1
  }
 ]
}
```

### `N.0008.a`

```json
{
 "commonErrors": [
  {
   "misconception": "sci.nitrogen.nitrifying-denitrifying-swapped",
   "pattern": {
    "kind": "text",
    "regex": "^[^;\\n]{0,30}\\bnitrification\\b[^;\\n]{0,10}$"
   },
   "feedback": "Nitrification is aerobic and needs air spaces. Denitrification is the anaerobic one.",
   "marksTypicallyEarned": 0
  }
 ]
}
```

### `N.0008.b`

```json
{
 "keyWords": [
  {
   "any": [
    "less oxygen",
    "little oxygen",
    "no oxygen",
    "low oxygen",
    "lack of oxygen",
    "not enough oxygen",
    "without oxygen",
    "anaerobic",
    "oxygen falls",
    "oxygen decreases",
    "oxygen is lower",
    "less air",
    "no air",
    "little air"
   ],
   "marks": 1
  },
  {
   "any": [
    "denitrifying",
    "denitrification",
    "denitrified",
    "denitrify"
   ],
   "marks": 1,
   "reject": [
    "denitrifying bacteria are less active",
    "denitrifying bacteria become less active",
    "denitrifying bacteria make",
    "denitrifying bacteria produce",
    "denitrifying bacteria die",
    "fewer denitrifying",
    "less denitrification",
    "denitrifying bacteria cannot",
    "denitrifying bacteria stop"
   ]
  },
  {
   "any": [
    "lower",
    "less nitrate",
    "nitrate falls",
    "nitrate decreases",
    "nitrate drops",
    "nitrate is lost",
    "nitrate content falls",
    "nitrate content decreases",
    "nitrate content is lower",
    "nitrate content drops",
    "little nitrate",
    "low nitrate",
    "not much nitrate",
    "nitrate goes down",
    "nitrate is reduced",
    "reduces the nitrate",
    "loses nitrate",
    "lost as nitrogen gas",
    "less nitrate deeper",
    "nitrate is low"
   ],
   "marks": 1
  }
 ],
 "commonErrors": [
  {
   "misconception": "sci.nitrogen.waterlogged-soil-effect",
   "pattern": {
    "kind": "text",
    "regex": "more nitrate deeper|nitrate increases with depth"
   },
   "feedback": "Less oxygen means more denitrification and less nitrification, so the nitrate falls rather than rises with depth.",
   "marksTypicallyEarned": 0
  }
 ]
}
```

### `N.0008.c`

```json
{
 "keyWords": [
  {
   "any": [
    "lets air in",
    "air into",
    "oxygen",
    "air",
    "aerat",
    "aerobic",
    "air spaces"
   ],
   "marks": 1
  },
  {
   "any": [
    "nitrifying",
    "nitrogen-fixing",
    "nitrogen fixing",
    "aerobic bacteria",
    "denitrifying",
    "denitrification",
    "nitrification",
    "make nitrate",
    "making nitrate"
   ],
   "marks": 1,
   "reject": [
    "denitrifying bacteria make",
    "denitrifying bacteria can make",
    "denitrifying bacteria produce",
    "denitrifying bacteria stay active",
    "denitrifying bacteria keep",
    "denitrifying bacteria thrive",
    "denitrifying bacteria multiply",
    "more denitrification",
    "nitrifying bacteria cannot",
    "nitrifying bacteria stop",
    "nitrifying bacteria die",
    "nitrifying bacteria are held back",
    "less nitrification"
   ]
  }
 ]
}
```

### `N.we01.twin`

```json
{
 "keyWords": [
  {
   "any": [
    "decomposition",
    "decay",
    "decompose",
    "decomposed",
    "rotting"
   ],
   "marks": 1,
   "reject": [
    "denitrification turns urea",
    "denitrification changes urea",
    "denitrification converts urea",
    "denitrification breaks down urea",
    "urea by denitrification",
    "denitrification turns the urea",
    "ammonium compounds by denitrification",
    "ammonium by denitrification"
   ]
  },
  {
   "any": [
    "denitrification"
   ],
   "marks": 1,
   "reject": [
    "decomposition returns nitrogen",
    "decomposition puts nitrogen",
    "decomposition releases nitrogen",
    "decomposition returns the nitrogen",
    "decomposition turns nitrate",
    "decomposition changes nitrate",
    "decomposition converts nitrate",
    "to the air by decomposition",
    "into the air by decomposition"
   ]
  }
 ]
}
```

### `N.we02.twin`

```json
{
 "keyWords": [
  {
   "any": [
    "oxygen",
    "air spaces",
    "air",
    "aerobic conditions",
    "no longer anaerobic",
    "not anaerobic",
    "aerat"
   ],
   "marks": 1
  },
  {
   "any": [
    "denitrifying",
    "denitrification"
   ],
   "marks": 1,
   "reject": [
    "denitrifying bacteria make",
    "denitrifying bacteria produce",
    "denitrifying bacteria become more active",
    "denitrifying bacteria are more active",
    "denitrifying bacteria thrive",
    "denitrifying bacteria multiply",
    "denitrifying bacteria increase",
    "denitrifying bacteria work again",
    "denitrifying bacteria start",
    "more denitrification",
    "more denitrifying"
   ]
  },
  {
   "any": [
    "nitrifying",
    "nitrogen-fixing",
    "nitrogen fixing",
    "nitrification",
    "more nitrate is made",
    "make more nitrate",
    "make nitrate again"
   ],
   "marks": 1,
   "reject": [
    "nitrifying bacteria stop",
    "nitrifying bacteria become less active",
    "nitrifying bacteria are less active",
    "nitrifying bacteria die",
    "nitrifying bacteria decrease",
    "nitrifying bacteria cannot",
    "less nitrification",
    "fewer nitrifying"
   ]
  }
 ]
}
```
