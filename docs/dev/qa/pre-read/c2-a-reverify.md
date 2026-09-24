# Re-verify: C2 chemistry bundles A (reactivity series, displacement) + pre-read C2 redox and rusting

**Partial:** the c2-a-1 re-verification (part 1) is complete — all twenty findings checked against the
current bundles, every marking finding proved with `markAnswer`. The redox and rusting pre-read (part 2)
was run to the session's stop mark: chemistry against the spec, every number recomputed, every equation
balanced in atoms and charge, every text part probed with paraphrases and reversed answers, MCQ and
find-the-mistake shape, delimiters/placeholders, hero blocks and photo licences are all done. **Not
reached:** a line-by-line read of the two note prose bodies (only the block skeleton, the figure alt
text and the `$\ce{}` equations in them were checked), the retrieval-prompt and insight text beyond the
digest, and the QWC band descriptors of `q.…redox.0016` / `q.…rusting.0013` below their first band.

Bundles: `packs/science/content/c2/{c2-reactivity-series,c2-displacement-and-extraction,c2-redox,c2-rusting-and-iron}/bundle.json`
(+ `note.blocks.json`). Digests written for the two unread bundles:
`docs/dev/qa/pre-read/c2-redox.digest.txt`, `docs/dev/qa/pre-read/c2-rusting-and-iron.digest.txt` (read end to end).
Spec: `data/spec/double-award-science.json`, unit C2 (`specSection` 3.4) §2 *Redox, Rusting and Iron*.
Scripts in the session scratchpad: `c2rv-scan.mjs`, `c2rv-mark.mts`, `c2rr-probe.mts`, `c2rr-probe2.mts`,
`c2rr-lint.mjs`. Nothing under `packs/` or `src/` was edited.

---

## 1. `c2-reactivity-series` — re-verification of A1–A10

| finding | status | evidence |
|---|---|---|
| A1 worked example one mark short | **holds** | `we.…02` steps now `[P1,P2] [P3] [P4] [P5] [P6,P7]` = 7 codes for the stem's 2+3+2; `we.…01` 5/5 unchanged |
| A2 q0004 key-word group tests only the verb | **holds** | group is now `{any:["steam"], reject:["absorb","dry","dries","drying","gives out heat","give out heat","gives off heat"]}`; all 3 wrong answers 1/1→0/1, all 3 correct paraphrases 0/1→1/1, both accepted 1/1 |
| A3 q0010 reversed explanation scores 3/3 | **holds (different fix)** | author keyed the groups to "potassium …" instead of adding rejects: swapped 3/3→**1/3**, swapped-2 3/3→**1/3**, "gains … negative ion" 3/3→**1/3** (better than the 2/3 proposed); accepted, worked solution and all 3 paraphrases still 3/3 |
| A4 q0002 fixed multi-word phrases | **holds** | exact fix applied; "It fizzes and the granules slowly disappear" 0/2→**2/2**, "heat is given out" 1/2→2/2, "the solution left is colourless" 1/2→2/2; `smoke` now rejected (0/2) |
| A5 q0001 reject list cancels a justified answer | **holds** | `keyWords[0].reject` removed, regex now `^(?![\s\S]*potassium)…`; justified answer 0/1→**1/1**, `matchesCommonError` true→**false**; "copper" still 0/1 and still matches |
| A6 q0011 a(i) unguarded regex | **holds** | regex now `^(?![\s\S]*spark)[\s\S]*(glow|\bred\b|white light)`; `matchesCommonError("It throws orange sparks and glows red hot.")` true→**false**, "it glows red" still true. (The hedge still scores 0/1 — now via the group's `reject:["glows red"]` rather than only the listing rule; same mark, honest feedback.) |
| A7 aluminium's blank row | **holds** | SVG row reads "…no reaction with water or steam: a tough oxide layer protects it"; figure `alt` and `<title>` both say "aluminium and copper with neither, aluminium because a tough oxide layer protects it"; `mustMemorise[2]` now "…aluminium and copper react with neither" |
| A8 find-the-mistake has two wrong lines | **holds** | line 2 rewritten correct, `mistakeLine:1`, `correction` is one line, `marksEarnedAsWritten:["P2","P3"]`, `whatWentWrong` line-2 sentence dropped, feedback reopened. `fixMatches` now accepts only the real fix (line-2 and line-3 text → `match:false`) |
| A9 no hero block | **holds** | `blocks[0].type = "hero"`, 3 `can` lines, `minutes: 11` |
| A10 wrong spec section | **holds** | "Prerequisite from C1 §1.6 — group number and outer electrons" |

**Verdict — `c2-reactivity-series`: all ten findings applied; nothing regressed; no new marking fault found in the re-probe.**

## 2. `c2-displacement-and-extraction` — re-verification of B1–B10

| finding | status | evidence |
|---|---|---|
| B1 q0009 swapped explanation scores 2/2 | **holds (different fix)** | groups keyed to the metal names without reject lists: both swaps 2/2→**0/2**; carbon's-side paraphrase 1/2→**2/2**; accepted, worked solution and above/below paraphrase 2/2 |
| B2 q0005 reversed comparison scores 2/2 | **holds (different fix)** | group 1 keyed to "copper is …" / "… than zinc" (no reject): reversed 2/2→**1/2**; "push the zinc out" 1/2→**2/2**; "copper is more reactive" 1/2 |
| B3 q0010 a/b reject lists cancel correct answers | **holds** | both `keyWords[0].reject` removed, (a)'s regex guarded: both justified answers 0/1→**1/1**; wrong metals still 0/1; `matchesCommonError` on (a)'s justified answer true→**false** |
| B4 q0010 e "becomes blue" under-earns | **holds** | exact fix applied; "becomes blue" 1/2→**2/2**, "stays colourless" rejected at 1/2 |
| B5 q0002 brown + warms scores 1/2 | **holds** | exact fix applied; "A brown coating appears on the zinc and the tube warms up." 1/2→**2/2**; "stays blue" now rejected |
| B6 accuracy instruction not enforced | **holds** | stem split to "… Show your working. Give your answer to one decimal place."; `instructsAccuracy` **true**; `16.8` 3/3, `16.7857142857` / `16.79` / `16.785` each **0/3** with the rounding message; 8.4 and 34.3 still 1/3 |
| B7 find-the-mistake has two wrong lines | **holds** | line 3 rewritten correct, one `correction` line, `["P2","P3"]`, `whatWentWrong`/feedback reopened; `fixMatches("This is a displacement reaction.")` → `match:false` |
| B8 `MgNO32` accepted (engine) | **moot — fixed in engine** | `equation-marking.ts:94` now gates the atom-bracket strip on `opts.implicitMultiply`; `Mg + 2AgNO3 → MgNO32 + 2Ag` **0/3**, `Mg(NO₃)₂` 3/3, `MgN2O6` 0/3 |
| B9 `$…$` equation refused (engine) | **moot — fixed in engine, with a gap** | `normaliseEquation` now strips `$`; `$\ce{Mg(s) + H2O(g) -> MgO(s) + H2(g)}$` **3/3**. Gap carried into redox — see **R9** |
| B10 no hero block | **holds** | `blocks[0].type = "hero"`, 3 `can` lines, `minutes: 12` |

**Verdict — `c2-displacement-and-extraction`: all ten findings closed (eight in the bundle, two in the engine); the engine `$` fix does not reach a `\ce{}` whose contents contain braces, which bites the redox half equations.**

---

## 3. Pre-read: `c2-redox`

Chemistry is sound and on-spec (C2 §2 *Redox, Rusting and Iron*): oxidation/reduction as gain/loss of
oxygen, of hydrogen and of electrons; OIL RIG; redox defined as both in the same reaction; half equations
with the electrons placed by a charge check; oxidising and reducing agents named for what they do to the
other substance; the blast furnace and the aluminium cell as the industrial cases. Every equation balances
in atoms **and** charge: `CuO + H2 → Cu + H2O`; `Mg + CuO → MgO + Cu`; `Fe2O3 + 3CO → 2Fe + 3CO2`
(Fe 2/2, C 3/3, O 6/6); `2Al + Fe2O3 → 2Fe + Al2O3`; `Fe → Fe³⁺ + 3e⁻` (0 = +3−3); `Cu²⁺ + 2e⁻ → Cu`
(+2−2 = 0); `Al³⁺ + 3e⁻ → Al`; `Mg → Mg²⁺ + 2e⁻`; `Zn + Cu²⁺ → Zn²⁺ + Cu` (0+2 = +2+0);
`2Br⁻ → Br₂ + 2e⁻` (−2 = 0−2). Numbers: `Fe2O3` = 2×56 + 3×16 = **160** ✓; 2×56 = **112**;
112 ÷ 160 × 100 = **70.0** ✓; common errors 56 ÷ 160 × 100 = **35** ✓ and 160 ÷ 112 × 100 = **142.86 → 142.9** ✓,
each marking to its stated `marksTypicallyEarned` (35 → 1/3, 142.9 → 1/3).

### R1 — `q.science.c2.c2-redox.0002` part `main`: the swapped answer scores the mark

**Current.** `keyWords: [{"any":["copper oxide","copper(II) oxide","cuo"],"marks":1}]` for "Name the
substance that is reduced" in `CuO + H2 → Cu + H2O`.

**Why it is wrong.** The group is presence-based and both substances are in front of the learner, so an
answer that names the wrong one while mentioning the right one collects the mark. Verified:
"The hydrogen is reduced, because the copper(II) oxide gives it oxygen." → **1/1**, feedback "Every
marking point is there." The `commonErrors` guard (`^(?![\s\S]*copper)[\s\S]*hydrogen`) cannot fire either,
for the same reason. Bare "the hydrogen" is correctly 0/1.

**Fix (verified by the same probe shape used for A3/B1).** Key the group to the role-bearing phrase and
guard the inversion:

```json
"keyWords":[{"any":["copper oxide","copper(II) oxide","cuo"],"marks":1,
             "reject":["hydrogen is reduced","hydrogen was reduced","the hydrogen is the one"]}]
```

Accepted "copper(II) oxide", "The copper oxide is reduced." and "The copper(II) oxide, not the hydrogen."
all keep 1/1; the swapped answer falls to 0/1.

### R2 — `q.…redox.0003` part `main`: the same inversion, the other way round

**Current.** `keyWords: [{"any":["hydrogen"],"marks":1}]` for "name the substance that is oxidised".

**Why it is wrong.** "The copper(II) oxide is oxidised and the hydrogen is reduced." → **1/1**. The exact
misconception the item exists to catch scores full marks whenever the learner writes both substances in
one sentence — which the mark scheme's own `reject: ["copper(II) oxide","water"]` shows the author expected.

**Fix.** `{"any":["hydrogen"],"marks":1,"reject":["copper oxide is oxidised","copper(II) oxide is oxidised","hydrogen is reduced"]}`.
"hydrogen" and "The hydrogen is oxidised because it gains the oxygen." stay 1/1.

### R3 — `q.…redox.0009` part `main`: naming the copper ion still scores

**Current.** `keyWords: [{"any":["zinc"],"marks":1}]` for "name the species that is oxidised" in
`Zn + Cu²⁺ → Zn²⁺ + Cu`.

**Why it is wrong.** "The copper(II) ion is oxidised because it gains the electrons from the zinc." →
**1/1**. The reason clause is itself the definition of reduction, so the answer is wrong twice over and
still earns.

**Fix.** Add `"reject":["copper is oxidised","copper ion is oxidised","copper(II) ion is oxidised","gains the electrons"]`
to the group. "the zinc" and "The zinc atom, because it loses two electrons." stay 1/1.

### R4 — `q.…redox.0014` part `d`: the swap scores, and the mark scheme's own accepted form does not

**Current.** `keyWords: [{"any":["copper"],"marks":1}]`; scheme P1 `accept: ["Cu2+","copper ions"]`,
`reject: ["magnesium","sulfate"]`.

**Why it is wrong.** Two faults in one group. (i) "The magnesium, because it gives its electrons to the
copper(II) ions." → **1/1** — the reducing agent named as the oxidising agent, full marks. (ii) The
scheme says `Cu2+` is accepted, but `"Cu2+"` → **0/1** and `"the Cu²⁺ ions"` → **0/1**, because the only
key word is the English word. The stem's own convention line teaches her to write `Cu²⁺`.

**Fix.** `{"any":["copper","cu2+","cu 2+"],"marks":1,"reject":["magnesium is the oxidising","the magnesium, because","magnesium gives"]}`.
Verified shape: "copper ions" and "the copper(II) ions" keep 1/1; `Cu2+` rises to 1/1; the swap falls to 0/1.

### R5 — `q.…redox.0014` part `e`: the spectator question accepts the non-spectator

**Current.** `keyWords: [{"any":["sulfate","sulphate"],"marks":1}]` for "Name the ion in the solution
that takes no part".

**Why it is wrong.** "The copper ion, because the sulfate changes." → **1/1**. The answer names the
species that does change and asserts the opposite of the chemistry, and the word "sulfate" in the reason
pays the mark.

**Fix.** Add `"reject":["copper ion","copper(II) ion","magnesium ion"]` to the group (the scheme already
lists `reject: ["copper ion"]` as display text). "the sulfate ion" and "SO4 2-" keep the mark.

### R6 — `q.…redox.0015` part `a`: same inversion inside the exam-style item

**Current.** `keyWords: [{"any":["iron oxide","iron(III) oxide","fe2o3","haematite"],"marks":1}]`.

**Why it is wrong.** "The carbon monoxide is reduced and the iron(III) oxide is oxidised." → **1/1**.
Bare "the carbon monoxide" is correctly 0/1, so the fault only shows on the fuller answer — the one a
learner writes when she is guessing.

**Fix.** Add `"reject":["carbon monoxide is reduced","co is reduced","oxide is oxidised"]`.
`Fe2O3`, "the Fe2O3" and "The haematite loses its oxygen." all keep 1/1.

### R7 — `q.…redox.0015` part `b`: both marks survive a complete inversion

**Current.**

```json
"keyWords":[{"any":["removes the oxygen","takes the oxygen","reduces the iron oxide"],"marks":1},
            {"any":["is itself oxidised","gains oxygen","becomes carbon dioxide"],"marks":1}]
```

**Why it is wrong.** Neither group names a substance, so the two roles can be exchanged wholesale:
"The iron(III) oxide removes the oxygen from the carbon monoxide and is itself oxidised." → **2/2**, and
"It takes the oxygen from the carbon monoxide, and the iron(III) oxide gains oxygen." → **2/2**. This is
the fault the question is written to test ("Explain why the carbon monoxide is described as the reducing
agent"), and it is the same class as B1.

**Fix (keyed, as B1 was).**

```json
"keyWords":[{"any":["removes the oxygen from the iron","takes the oxygen from the iron","takes the oxygen off the ore","removes the oxygen from the ore","reduces the iron oxide","reduces the iron(III) oxide"],"marks":1,
             "reject":["takes the oxygen from the carbon","removes the oxygen from the carbon"]},
            {"any":["is itself oxidised","it is oxidised","carbon monoxide gains oxygen","becomes carbon dioxide","oxidised to carbon dioxide"],"marks":1,
             "reject":["iron(III) oxide gains oxygen","iron oxide gains oxygen","oxide is oxidised"]}]
```

The accepted answer and the worked solution keep 2/2; both inversions fall to 0/2.

### R8 — the twins of `we.…redox.01` and `we.…redox.03` carry the same inversion

**Current.** `we.01` twin: `[{"any":["iron oxide","iron(III) oxide","fe2o3","haematite"],"marks":1},
{"any":["lost oxygen","loses oxygen","loss of oxygen","oxygen removed"],"marks":1}]`.
`we.03` twin: `[{"any":["aluminium"],"marks":1,"reject":["iron oxide"]}, {"any":["takes the oxygen","removes the oxygen","gains oxygen","is oxidised"],"marks":1}]`.

**Why it is wrong.** `we.01` twin: "The carbon monoxide is reduced because the iron(III) oxide has lost
oxygen." → **2/2**. `we.03` twin: "The iron(III) oxide, because the aluminium takes the oxygen and is
oxidised." → **2/2** — its `reject:["iron oxide"]` does not fire because the answer spells it
"iron(III) oxide", which normalises to `iron iii oxide`.

**Fix.** `we.01` twin group 1: add `"reject":["carbon monoxide is reduced","co is reduced"]`.
`we.03` twin group 1: widen the reject to `["iron oxide","iron(iii) oxide","iron iii oxide","fe2o3"]` —
the author's intent, defeated by the spelling.

### R9 — engine: `$\ce{…}$` still fails when the formula contains braces (half and ionic equations)

**Current.** `normaliseEquation` (`src/components/items/equation-marking.ts:68`) now strips a leading and
trailing `$` — the B9 fix — but `unwrapBraces(s, "ce")` matches `\\ce\{([^{}]*)\}`, which cannot match a
`\ce{}` whose contents hold `^{3+}`. The literal `ce` then survives the `[{}\\]` strip and is prefixed to
the formula.

**Why it matters.** Every half and ionic equation in this bundle is printed in the note in exactly that
form — `$\ce{Fe -> Fe^{3+}}$`, `$\ce{Fe -> Fe^{3+} + 3e^-}$`, `$\ce{Al^{3+} + 3e^- -> Al}$`,
`$\ce{2O^{2-} -> O2 + 4e^-}$`, `$\ce{Zn + Cu^{2+} -> Zn^{2+} + Cu}$` — so a learner who copies the form
she was taught scores nothing. Verified, all five equation parts:

| response | q0006 | q0007 | q0013 | q0008 | q0014 c |
|---|---|---|---|---|---|
| authored form | 3/3 | 3/3 | 3/3 | 2/2 | 3/3 |
| Unicode (`Fe → Fe³⁺ + 3e⁻`) | 3/3 | 3/3 | 3/3 | 2/2 | 3/3 |
| plain digit before the sign (`Fe3⁺`) | 3/3 | 3/3 | 3/3 | 2/2 | 3/3 |
| `$\ce{…}$` as the note prints it | **0/3** | **0/3** | **0/3** | **0/2** | **0/3** |

The rusting bundle's symbol equations are unaffected (`$\ce{Fe2O3 + 3CO -> 2Fe + 3CO2}$` → 3/3), because
they carry no braces.

**Fix.** Engine-level, not fixable in the bundle: make `unwrapBraces` brace-aware (match the balanced
group, or run the `\^\{…\}` / `_\{…\}` collapse *before* `unwrapBraces`), so `\ce{Fe -> Fe^{3+} + 3e^-}`
unwraps. Flagged for routing, not patched here.

### Residual worth knowing (not defects)

- `q.…redox.0006/0013/0014 c` correctly refuse the electrons on the wrong side and the reversed equation
  (0/3 each). `q0007` and `q0013` are reductions, so "electrons on the left" *is* the answer — the probe
  row that looks like a pass is the authored equation itself.
- `q.…redox.0001` "Give one definition only" + `listingRule: true`: writing all three definitions scores
  0/1 by the listing rule. That is the rule doing its designed job against the stem, but it punishes the
  learner who has just revised `rp.…02`; the hint already warns her ("Pick the one you trust most").
- `q.…redox.0005` and `0014 a` reject `gain of electrons`, so "Oxidation is loss of electrons and reduction
  is gain of electrons." scores 0/1. Defensible (a one-mark state-what-is-meant) but stricter than CCEA.

### Clean in `c2-redox`

- `q0012` — the **artificial one-decimal-place instruction is gone** from the stem, and the `dp` tolerance
  now behaves as a closeness test: `70`, `70.0`, `70%` and `70.00` all **3/3**, `69.9` 0/3. This is the fix
  the author reported, and it lands.
- **Half-equation convention lines** are present on every equation part and on the `we.02` twin —
  "Write a charge with the superscript sign — Zn²⁺ or Zn2⁺ — and an electron as e⁻" — and the marker
  honours all three spellings (see R9's table).
- **Find-the-mistake** ×3: each has exactly one wrong line (line 1 in all three), lines 2–3 correct, a
  single `correction` entry, and `marksEarnedAsWritten` matching the feedback ("One of the three marks",
  "One of the two marks", "Partial credit"). The A8/B7 fault class is not present.
- **MCQ shape**: 3 pre-diagnostic and 7 post-diagnostic items, each with exactly one correct option, no
  duplicate option texts, every distractor genuinely wrong and carrying its own feedback and misconception id.
- **Hero block** present (`lede`, 3 `can` lines, `minutes: 12`).
- **Delimiters and placeholders**: `$` count even in both files (42 and 12), no `${`, no `undefined`, no `NaN`.
- **Reject/regex guards**: the `^(?!…)` guarded forms in q0002, q0003, q0009, q0010, q0014 d/e and q0015 a/b
  are correctly anchored and do not fire on any accepted answer, worked solution or paraphrase probed
  (they are simply too weak to catch the inversions — R1–R7).

---

## 4. Pre-read: `c2-rusting-and-iron`

Chemistry is sound and on-spec: rust is hydrated iron(III) oxide; rusting needs water **and** oxygen; the
four-tube experiment with anhydrous calcium chloride as the drying agent and boiled water under oil as the
oxygen-free tube; barrier methods (painting, oiling/greasing, plastic coating, galvanising) and sacrificial
protection with a **more reactive** metal; the blast furnace with haematite, coke, limestone and hot air,
slag floating on molten iron because it is less dense. Equations balance: `C + O2 → CO2`; `CO2 + C → 2CO`
(C 2/2, O 2/2); `Fe2O3 + 3CO → 2Fe + 3CO2` (Fe 2/2, C 3/3, O 6/6); `CaCO3 → CaO + CO2`;
`CaO + SiO2 → CaSiO3` (Ca 1/1, Si 1/1, O 3/3). Numbers: 320 × 112 ÷ 160 = **224** ✓; common errors
320 × 56 ÷ 160 = **112** ✓ and 320 × 160 ÷ 112 = 457.14 → **457** ✓, each marking 1/3 as stated.

### S1 — `q.science.c2.c2-rusting-and-iron.0003` part `main`: the item's own answer does not score

**Current.**

```json
"accepted":["it removes water from the air in the tube"],
"keyWords":[{"any":["removes water","absorbs water","drying agent","removes moisture","absorbs moisture","dries the air"],"marks":1}]
```

**Why it is wrong.** Every key word is a fixed two- or three-word phrase, and the natural English has an
article in the middle. Verified:

| response | now |
|---|---|
| "it removes water from the air in the tube" (the `accepted` string, exactly) | 1/1 |
| "It is a drying agent." | 1/1 |
| "It dries the air in the tube." | 1/1 |
| "It removes **the** water from the air in the tube." | **0/1** |
| "It removes **the** water vapour from the air." | **0/1** |
| "It absorbs **the** water from the air inside the tube." | **0/1** |
| "It absorbs **the** moisture in the tube." | **0/1** |
| "It takes the water out of the air." | **0/1** |

The item's own worked solution ("it absorbs **the** water vapour from the air in the tube"), the post-
diagnostic's correct option ("it removes **the** water from the air in the tube") and `rp.…02` ("removes
water from the air in the tube") therefore split three ways, and the two that carry the article score
nothing. The feedback shown is "The marking points are not there yet. Expected: removes water." — which
is what she wrote.

**Fix (verified shape).** Drop the verb-object pairs to single stems plus the object, so the article
cannot break them:

```json
"keyWords":[{"any":["removes water","removes the water","absorbs water","absorbs the water","takes the water","removes moisture","removes the moisture","absorbs moisture","absorbs the moisture","drying agent","dries the air","dries the tube"],"marks":1,
             "reject":["removes the oxygen","removes oxygen"]}]
```

All eight rows above then score 1/1 except the two wrong answers, which stay 0/1 ("It prevents water
getting into the tube." is held at 0/1 by its common error, "It removes the oxygen from the air." by the
new reject). The same phrasing appears in `q.…0012 (c)` and `q.…0004` for the oil layer, but there the key
word is the bare stem `"dissolving"/"dissolve"/"dissolved"`, which is article-proof — "It stops **the**
oxygen from dissolving in the water." scores 1/1. Only q0003 is affected.

### S2 — `q.…rusting-and-iron.0012` part `b`: the answer the stem asks for scores 0/1

**Current.** Stem: "Identify, **by its letter**, the tube in which the condition removed is oxygen."
`accepted:["tube C"]`, `keyWords:[{"any":["tube c","c is the tube","the third tube"],"marks":1}]`.

**Why it is wrong.** Every key word contains the word "tube", so the one-character answer the stem
demands misses. Verified: `"C"` → **0/1**, `"c"` → **0/1**, feedback "The marking points are not there
yet. Expected: tube c."; while `"tube C"` and "It is tube C." both score 1/1. A learner who does exactly
as instructed is marked wrong, and the common-error regex (`^(?![\s\S]*tube c)[\s\S]*tube (a|b|d)\b`) does
not fire, so she gets no diagnosis either.

**Fix.** A bare letter cannot be a key word (`phraseIn` keeps tokens under four letters exact, which is
what makes `"c"` safe to list): add it to `accepted` rather than to `keyWords`, so the equality branch
catches it before the key words run —

```json
"accepted":["tube C","C","c"],
"keyWords":[{"any":["tube c","c is the tube","the third tube"],"marks":1}]
```

`"C"` and `"c"` then score 1/1 through `spec.accepted`; "tube B" stays 0/1 with its regex diagnosis intact.

### S3 — `q.…rusting-and-iron.0012` part `d`: the reversed reactivity claim keeps two of three marks

**Current.**

```json
"keyWords":[{"any":["zinc"],"marks":1},
            {"any":["zinc is more reactive","more reactive than iron","zinc is above iron","above iron"],"marks":1},
            {"any":["zinc corrodes","corrodes instead of the","corrodes in place of the","zinc is sacrificed"],"marks":1}]
```

**Why it is wrong.** Group 3 does not say *which* metal corrodes, so an answer that inverts the reactivity
order keeps it: "It is coated in zinc, but iron is more reactive than zinc, so the iron corrodes in place
of the zinc." → **2/3** (group 2 correctly lost, groups 1 and 3 paid). The item is the three-mark version
of the sacrificial idea, so the inverted answer should keep at most the naming mark.

**Fix.** Key group 3 to the zinc and guard the inversion:

```json
{"any":["zinc corrodes","the zinc corrodes","zinc is sacrificed","zinc corrodes instead","zinc corrodes in place"],"marks":1,
 "reject":["iron corrodes","steel corrodes","the zinc rusts"]}
```

The accepted answer and the "Zinc is above iron … so the zinc corrodes in place of the steel" paraphrase
keep 3/3; the inversion falls to 1/3.

### S4 — `q.…rusting-and-iron.0012` part `f`: a single method written as two words loses the mark

**Current.** Stem: "State **one** other barrier method…"; `listingRule: true`, one key-word group.

**Why it is worth knowing.** The mark scheme's P1 is "painting, oiling or greasing, or plastic coating" and
the hint says "Oiling, greasing and plastic coating would each be accepted too" — but "oiling or greasing",
written as the scheme itself names that method, splits on "or" into two list items and the listing rule
takes the mark: **0/1**. "oiling" or "greasing" alone each score 1/1.

**Fix.** Either add `"oiling or greasing"` and `"oiling and greasing"` to `accepted` (the equality branch
runs before the listing rule), or reword the hint to "Name one: oiling, or greasing, or plastic coating."
The author's **metal coating / plating fix lands**: "metal coating" and "metal plating" each 1/1, while
bare "plastic" and bare "metal" are correctly 0/1 through the `^[^;\n]*(plastic|metal)\s*$` regex.

### Clean in `c2-rusting-and-iron`

- **Sacrificial protection swaps no longer score** — the fix class the author reported holds where it
  matters: `q0006` "Magnesium is **less** reactive than iron, so the magnesium corrodes instead of the
  iron." → **1/2**; "Iron is more reactive than magnesium, so the iron corrodes in place of the magnesium."
  → **0/2**; "The magnesium **rusts** instead of the iron" → 1/2 with the verb diagnosis. `q0005`
  galvanising: "…iron is more reactive than zinc so the iron corrodes first." → **1/2**; "coated in a metal
  that corrodes instead of it" (no zinc named) → **0/2**. Accepted answers and paraphrases all full marks.
  Only `q0012 d` leaks a mark (S3).
- **The accuracy-instruction split on q0011 lands**: the stem now reads "… Show your working. Give your
  answer to the nearest tonne."; `224` and `224 tonnes` 3/3, `224.0` and `223.99` **0/3** with "the question
  asks for 0 decimal places, so write 224", `112` and `457` 1/3 each.
- **Rust naming** (`q0001`, `q0012 a`): "hydrated iron(III) oxide" 2/2 with or without a space before the
  bracket; "iron(III) oxide" 1/2 with the *hydrated* diagnosis; "hydrated iron oxide" 1/2; "iron hydroxide"
  correctly cancelled.
- **Conditions** (`q0002`, `we.01` twin): "water and oxygen" and "Moisture and air." both 2/2; "rain and
  oxygen" 1/2 with the Booklet B diagnosis.
- **Find-the-mistake** `ftm.…01`: one wrong line (line 1), lines 2–3 correct, one `correction` entry,
  `marksEarnedAsWritten ["P3","P4"]` matching "Two of the four marks". No A8/B7 fault.
- **MCQ shape**: 3 pre- and 7 post-diagnostic items, one correct option each, no duplicate texts, every
  distractor genuinely wrong with its own feedback and misconception id.
- **Hero block** present (`lede`, 3 `can` lines, `minutes: 13`). **Delimiters**: `$` even in both files
  (10 and 10), no `${`, no `undefined`, no `NaN`.
- **Photo credit**: three photos, each with credit, licence, licence-bearing source URL and a file that
  exists — `public/img/science/c2/c2-rusting-and-iron-{1,2,3}.jpg` (CC BY 2.0, public domain, CC BY-SA 3.0).

---

## Verdicts

- **`c2-reactivity-series`** — all ten c2-a-1 findings are applied and proved with the marker; A3 by a
  better fix than the one proposed (the reversed answer now scores 1/3 rather than 2/3). Nothing regressed.
- **`c2-displacement-and-extraction`** — all ten closed: eight in the bundle, B8 and B9 in the engine;
  the `$`-strip fix does not reach a braced `\ce{}`, which is the only live remnant and it surfaces in redox (R9).
- **`c2-redox`** — chemistry, every equation (atoms and charge) and every number are correct and on-spec,
  the half-equation convention lines, the dropped d.p. instruction and the three find-the-mistake items are
  right; but the "name the substance / name the agent" parts were not carried into the keyed fix class, and
  seven of them (R1–R8) pay full marks to an answer that names the wrong substance while mentioning the
  right one — plus one engine-level equation gap (R9).
- **`c2-rusting-and-iron`** — the strongest of the four: chemistry, the furnace equations, the numbers, the
  sacrificial and galvanising swaps, the accuracy split and the metal-coating fix all hold; four findings,
  two of which (S1, S2) mark a correct answer wrong.

Report: `docs/dev/qa/pre-read/c2-a-reverify.md`.
