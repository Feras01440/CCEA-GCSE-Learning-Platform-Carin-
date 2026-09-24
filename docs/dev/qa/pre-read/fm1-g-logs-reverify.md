# Re-verify — FM1 "Laws of logarithms", against `fm1-g-logs-1.md`

Bundle: `packs/further-maths/content/fm1/laws-of-logarithms/bundle.json` + `note.blocks.json`
(mtime 2026-09-20 20:47). Pre-read: `docs/dev/qa/pre-read/fm1-g-logs-1.md`.
Date: 2026-09-20. Nothing under `packs/` or `src/` was edited.

Scripts (scratchpad `…/0d8d19ef-…/scratchpad/`): `logs-rv-scan.mjs`, `logs-rv-scan2.mjs` (2 289
strings re-scanned), `logs-rv-scan3.mjs`, `logs-rv-mark.mts` / `logs-rv-mark2.mts` /
`logs-rv-mark3.mts` (≈100 responses through `markAnswer`), `logs-rv-ftm.mts` (all three
find-the-mistakes through `fixMatches`), `logs-rv-re.mjs`.
`npm run content:check` → `ok   fm.u1.laws-of-logarithms  we 3 · dx 0 · q 16 · ftm 0 · rp 0 · note`,
**156 bundles published**, no `FIGURE` line for this bundle.

---

## Table

| # | Finding | Verdict | Evidence |
|---|---|---|---|
| 1 | 0014 (a) common-error feedback reversed | **holds** | text now "gone **on top** … squared one **underneath**"; `markAnswer("\log\frac{ac}{b^{2}}")` → 1/3 with that sentence and tag `fm.logs.subtraction-rule-misapplied` |
| 2 | ftm…01 earned marks name the mark the working loses | **holds** (route A, all three edits) | `marksEarnedAsWritten: ["M1"]`; feedback "What went are the last two marks…"; q0004 `commonErrors[0].marksTypicallyEarned: 1`, verified `\log 2x^{3}` → **1/3** |
| 3 | 0016 (c) accepts the rejected root | **holds** (engine) | `4 or -4` **0/4**, `4 or −4` 0/4, `4 and -4` 0/4, `x = 4 or x = -4` 0/4; `4 only` 4/4, `4` 4/4, `x = 4` 4/4, `4.0` 4/4, `6` → the authored common error. Same on 0011 (`5 or 16`, `5 or 4` → 0/3), 0012 (`4 or -4` → 0/4), 0014 (b) (`6.5 or 4` → 0/3), while `6.5`, `13/2`, `4` still mark as before |
| 4 | `\log(2x)^{3}` denotes $(\log 2x)^{3}$ — 8 sites | **holds** | all 8 now `\log\left((2x)^{3}\right)` / `= log((2x)^3)`; 0 matches for `\log\s*\([^)]*\)\s*\^` in 2 289 strings. 0016 (c) carries `\log\left((x + 2)(x - 2)\right)` in `scheme[0].for`, `workedSolution` **and** `solutionProgram` |
| 5 | `single-log` pays full marks for the unexpanded bracket | **holds** | q0004 `form: "single-log-expanded"`, stem "…with the bracket multiplied out"; `log((2x)^3)` → **2/3** "Correct, but multiply the argument out…" (was 3/3). Twin `we[1].twin` also `single-log-expanded`: `log((5x)^2)` → 2/3 |
| 6 | `1/2 log n` rejected | **holds** (engine) | q0008: `4log m + 1/2 log n - log t`, `4 log m + 1/2 log n - log t`, `4log m + 1/2log n - log t`, `4log m + (1/2) log n - log t` all **4/4**. q0016 (a): `2log x + 1/2 log y - 3log z` → **3/3** |
| 7 | 0016 (a) tagged with a misconception it does not show | **holds** | new registry entry `fm.logs.root-not-brought-down` (ledgerTag `accuracy`, source `ccea-cer:further-maths:2025-summer:FM1:Q9`); the common error is re-tagged and marks **2/3** with that tag |
| 8 | gate `g6` third option equals its own prompt | **holds** | options now `$\log 10x$` (answer), `$\log(1 + x)$`, `$\log x$`; `explain` extended with "Dropping the $1$ altogether would leave $\log x$" |
| 9 | the first scheme mark scores nothing on five parts | **moot** — superseded by the engine | equivalent-wrong-form now keeps marks−1: q0007 **2/3**, q0008 **3/4**, q0016 (a) **2/3**, q0005 **2/3**, q0014 (a) **2/3**, each with the form sentence and no common error. Better than the 1 mark the pre-read asked for; no pack change needed |
| 10 | 0006's single-log rejection misnames the slip | **not applied** | `2 + \log x` now scores 2/3 (was 0/3) but still reads "Correct, but **a number in front of the log** belongs inside it as a power" — there is no coefficient in $2 + \log x$ |
| 11 | find-the-mistake fix box accepts the wrong line | **partly** | pack side **holds**: `correction` is now `["= log 8x^3"]` alone, and `banana 3` / `banana 2` / `42` are all refused. Engine side **not fixed**: the mistake line itself still passes — ftm…01 `= log 2x^3` → `{match:true, how:"value"}`, ftm…02 `log(x + 5) / log(x - 1) = log 3` → value, ftm…03 `= log(a c) - log b^2` → value |

---

## Still open

### A · [Low, engine] `fixMatches` value fallback still passes the mistake line (finding 11)

`src/components/items/mistake-marking.ts` ~line 57 gates the fallback on **the typed line**:

```ts
const statesValue = /[=≈]/.test(t) || /^[-−+]?\d[\d.,\s]*(?:[a-zA-Z°%²³]{0,4})?$/.test(t.trim());
```

Every algebraic working line has an `=`, so `statesValue` is true for all three mistake lines, and
`lastNumber` then compares exponents (3 against 3 on ftm…01, 3 against 3 on ftm…02, 2 against 2 on
ftm…03). The pre-read asked for the gate to be on the **correction**.

**Fix** — require both the last correction line and the typed line to end in a bare numeric result,
which is the only case the fallback exists for ("Median = 36.2 cm"):

```ts
const endsInValue = (s: string) => /(?:^|[=≈])\s*[-−+]?\d+(?:[.,]\d+)?\s*[a-zA-Z°%]{0,4}\s*$/.test(s.trim());
if (target !== null && typedValue !== null && endsInValue(t) && endsInValue(correction[correction.length - 1])) { … }
```

Checked against this bundle: ftm…01's correction `= log 8x^3` and ftm…03's `= log(a b^2 / c)` do not
end in a bare number, so the fallback is switched off there and only the line match can pass;
ftm…02's last correction line `(x + 5) / (x - 1) = 3` does end in one, but the mistake line
`log(x + 5) / log(x - 1) = log 3` ends in `log 3`, not a bare number, so it no longer passes either.

### B · [Low, engine] 0006's form sentence (finding 10)

Unchanged. `src/lib/marking/algebra.ts` ~line 1125 — branch on whether the stray term is a bare
number: "Correct, but a constant has to be written as a logarithm before it can be combined."
The same sentence is right where it fires on q0004 (`3\log 2x` → 2/3) and on the twin (`2\log 5x`),
so only the added-constant branch needs splitting.

### C · [Low, pack] 0016 (c): "4 or −4" is now scored 0 but told it was unreadable

The engine fix lands, but the response she is most likely to give is answered with
"That answer could not be read. Try typing just the number, with any unit after it." — which is
about typing, not about the root that had to be rejected. The unreadable branch **does** reach
`withCommonError`, so a `text` pattern diagnoses it. Verified with the real spec:

```json
{
  "misconception": "fm.logs.log-values-in-original-equation",
  "pattern": { "kind": "text", "regex": "4\\s*(?:or|and|,)\\s*(?:x\\s*=\\s*)?[-−]\\s*4|[-−]\\s*4\\s*(?:or|and|,)\\s*(?:x\\s*=\\s*)?4" },
  "feedback": "Both roots of $x^{2} = 16$ are there, but $-4$ has to be rejected: $\\log(x - 2)$ would have a negative argument. The answer is $4$.",
  "marksTypicallyEarned": 3,
  "source": "ccea-cer:further-maths:2022-summer:FM1:Q5"
}
```

Fires on `4 or -4`, `4 or −4`, `4 and -4`, `x = 4 or x = -4`, `x=4 or x=-4`, `-4 or 4`, `4, -4`
(→ 3/4 with the diagnosis); silent on `4`, `4 only`, `-4`, `6`, `4 cm`, `14`.
*(Caution when authoring: the field is `regex`, not `pattern` — `new RegExp(undefined)` is the
empty pattern and matches everything, so a mis-spelled key would make the error fire on every miss.)*

### D · [Low, pack] route A leaves "two of three" in the note and the insight

Route A made the scheme the authority, so `\log 2x^{3}` now scores **1 of 3**. Two places still
quote the report's count at her:

* `note.blocks[17].md` — "Good candidates earned two of the three marks here and then lost the last one: …"
* `insight.findings[4].wentWrong` — "Good candidates got two of three; the majority forgot to cube the 2 …"

A learner who types the slip is told 1 of 3 and then reads that it costs one mark. Either keep the
attribution and drop the count — note: "Marks went here: writing $3\log 2x$ as a single logarithm,
the majority forgot to cube the $2$. Write the bracket $(2x)^{3}$ before you expand it, every time."
(insight the same) — or take route B after all. Neither the FTM nor q0004's common error needs to
move again.

---

## Not re-opened

* **Mathematics, specification, text parts, regex common errors, MCQ/diagnostics, structure and
  hygiene** — the pre-read found these clean and nothing in the fix pass touches them. Re-checked
  the parts the fixes moved: 2 289 strings still give 0 unpaired `$`, 0 `${`, 0 `undefined`/`NaN`;
  `content:check` publishes the bundle with no figure warning; all 8 gate ids unique; the four
  `prompt` blocks still resolve.
* **q0004's scheme, hints and worked solution** read consistently after the brace fix
  (M1 `$\log\left((2x)^{3}\right)$`, M2 the expansion, W1 `$\log 8x^{3}$`), and `we[1]`'s three
  steps match them.

---

**Verdict**: **all six pack-side fixes hold** — 0014 (a)'s feedback, ftm…01 under route A, the eight
braced `\log(2x)^{3}` sites plus 0016 (c), `single-log-expanded` on q0004 and its twin, the
`root-not-brought-down` registry entry and re-tag, and gate `g6`. Two of the four engine items are
fixed (the numeric connective tail, `1/2 log n`), one is fixed better than proposed (finding 9 is
moot), one is **partly** fixed (the find-the-mistake value fallback, A) and one is **not applied**
(0006's form sentence, B). Nothing blocks shipping the pack; A and B are engine work, C and D are
two small pack edits that would finish the job.
