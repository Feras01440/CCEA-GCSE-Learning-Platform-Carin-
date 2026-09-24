# `pipeline/enrichment/` — cross-board enrichment tooling

The scripts behind `data/enrichment/crosswalk.json` and the per-topic dossiers in
`data/enrichment/<subject>/<slug>.md`. The method they implement is
**`docs/research/11-cross-board-enrichment.md`** — read that first; this file is only how to
run things.

The idea in one sentence: CCEA overlaps AQA, Edexcel and OCR by roughly 80% topic for topic,
those boards have almost all of the UK's good free teaching material, and CCEA has almost none
— so we find the matching spec reference, mine the material for ideas, and write our own.

---

## Run order

Everything after step 1 is cheap; step 1 is the only one that touches the network for large
files, and its output is cached under `docs/sources/cross-board/`.

```bash
# 1. Download the comparison specifications and extract their text (once; ~15 MB)
node pipeline/enrichment/fetch-specs.mjs
node pipeline/enrichment/fetch-specs.mjs --list        # what it knows about, and what it could not get
node pipeline/enrichment/fetch-specs.mjs --force       # re-download everything

# 2. Build the lookup indexes from that text (fast, deterministic, safe to re-run)
node pipeline/enrichment/index-specs.mjs

# 3. Write a crosswalk row: search the specs for CCEA's vocabulary, then the synonyms
node pipeline/enrichment/lookup-spec.mjs "placenta" "oviduct" "fallopian"
node pipeline/enrichment/lookup-spec.mjs --combined-only "dispersion|prism"

# 4. Check a photograph's licence BEFORE recommending it in a dossier
node pipeline/enrichment/check-commons-licence.mjs search "human sperm micrograph" 10
node pipeline/enrichment/check-commons-licence.mjs check "File:Icsi.JPG"

# 5. Edit the map for your subject, then rebuild the crosswalk
#    maps/science.mjs · maps/maths.mjs · maps/further-maths.mjs
node pipeline/enrichment/build-crosswalk.mjs --check    # validate, write nothing
node pipeline/enrichment/build-crosswalk.mjs            # write data/enrichment/crosswalk.json
```

No npm aliases are defined, deliberately: `package.json` is shared with the app session and a
four-script diff there is not worth a merge conflict. Add them if that stops being true.

---

## What each script is for

| Script | Does | Writes |
|---|---|---|
| `fetch-specs.mjs` | Downloads the AQA, Edexcel and OCR comparison specifications and runs `pdftotext -layout` over each. Validates every download (magic bytes plus a minimum size) so a stub cannot reach the indexers. Carries a register of what could **not** be obtained, so nobody repeats the search | `docs/sources/cross-board/<id>.pdf`, `<id>.txt` |
| `index-specs.mjs` | Turns the extracted text into the three lookup indexes: AQA numbered headings per specification, the Edexcel 1SC0 statement list (489 statements, `CB7.4` style), and the DfE reference codes with their descriptions | `docs/sources/cross-board/*-headings.txt`, `edexcel-1sc0-statements.txt`, `aqa-8300-refs.txt` |
| `lookup-spec.mjs` | For a regex, prints which AQA section contains a hit and which Edexcel statements mention it. This is the tool a crosswalk row is actually written from | nothing |
| `check-commons-licence.mjs` | Searches Wikimedia Commons and reports each file's licence against the same accept rule as `scripts/fetch-commons-image.mjs`, so a dossier never recommends a photograph the fetcher would refuse | nothing |
| `build-crosswalk.mjs` | Joins the hand-written maps to the CCEA taxonomies, so titles, units, tiers, outcome ids, statement texts and prescribed practicals cannot drift; fails if a taxonomy topic has no row or a row names a topic that no longer exists; counts statuses | `data/enrichment/crosswalk.json` |
| `maps/*.mjs` | The judgements. One row per CCEA topic: the other boards' references, a `status`, a `confidence`, and a two-directional scope note | — |

**Never edit `data/enrichment/crosswalk.json` by hand.** Edit the map and re-run step 5.

---

## Copyright, and the one rule that matters

`docs/sources/cross-board/` holds other exam boards' specifications. They are there for the
same reason the CCEA corpus under `docs/sources/` is there: **to read**, so that a CCEA
statement can be matched to another board's reference code.

- **A reference code is an address, not content.** `AQA 4.5.3.3`, `Edexcel CB7.4`, `DfE A18` may
  travel anywhere. A sentence from the specification may not.
- **Never copy statement text into a dossier, a note, a question or a commit message.** The house
  rule is that any eight-word sequence in common with a source is a failure, and it applies to a
  dossier exactly as it applies to a lesson.
- **Never redistribute or re-host** the PDFs or the extracted `.txt`.
- `docs/sources/cross-board/` is listed in `.gitignore` for this reason, exactly as
  `docs/sources/papers/` is. Re-fetch with step 1 rather than committing it.
- Photographs travel only under **CC0, CC BY, CC BY-SA or public domain**, with the credit
  fields recorded. Step 4 enforces it; `scripts/fetch-commons-image.mjs` enforces it again on
  download. Commons' bare "Attribution" and "No restrictions" tags are **refused** by both.
- Diagrams are never reused as images. They are recreated as our own computed SVG, which is
  also what lets them be parameterised, gated and themed.

Full statement of the line: `docs/research/11-cross-board-enrichment.md` section 4.

---

## The traps, so you lose an afternoon to something new

1. **AQA's filestore path is per subject, not per suite.** Physics 8463 is under
   `resources/physics/…`, not `resources/science/…`. The wrong path returns an HTML error page
   with HTTP 200, about 123 KB, and `pdftotext` then produces plausible-looking rubbish.
   `fetch-specs.mjs` checks the `%PDF-` magic bytes and a minimum size for exactly this.
2. **Pearson's own Combined Science link served a 152 KB stub** in September 2026 where the real
   document is 3 MB; the Science Clinic mirror served the full file. Any short Pearson download
   is a stub — try the fallback URL in the register.
3. **`pdftotext -layout` is not optional.** The AQA specifications are a two-column table
   (Content | Key opportunities for skills development) and without `-layout` the columns
   interleave line by line into unreadable text.
4. **The Edexcel indexer must find its end bound by searching, not by line number.** The
   specification restates its topic list near the end; an earlier version stopped at a
   hard-coded line and silently dropped Topic 15 (Forces and matter, i.e. Hooke's law). The
   indexer now prints per-topic counts and asserts four canary statements; if a science topic
   comes back with no Edexcel references, suspect this first.
5. **Commons rate-limits fast.** 500 ms between calls, back off on 429, and send a real
   User-Agent; the checker does all three.
6. **`git bash` mangles backslashes in inline `node -e`.** Everything here is a script file for
   that reason; keep it that way.

---

## Coverage today

`data/enrichment/crosswalk.json`, rebuilt by step 5:

| Subject | Topics | matched | partial | ccea-only | unmatched |
|---|---:|---:|---:|---:|---:|
| Double Award Science (vs AQA 8464, Edexcel 1SC0) | 130 | 87 | 26 | 17 | 0 |
| Mathematics (vs AQA 8300, Edexcel 1MA1) | 152 | 143 | 8 | 0 | 1 |
| Further Mathematics FM1–FM3 (vs AQA 8365, OCR 6993, Edexcel 4PM1) | see the file | | | | |

Dossiers live at `data/enrichment/<subject>/<slug>.md` and follow the nine-section template in
`docs/research/11-cross-board-enrichment.md` section 6. `pipeline/prompts/author-topic.md`
("Cross-board enrichment") tells every author to read their topic's dossier, and its crosswalk
row, before writing.
