# `media-map.json` — external media map

*(This README documents `media-map.json` only. Other files in `data/links/`, such as
`image-credits.json`, are produced by separate tasks and have their own provenance.)*

`media-map.json` is the map from a Cairn topic to the best freely embeddable teaching
**video(s)** and **simulation(s)** on the open web, plus link-only **reading**. It exists so a
topic page can show a lesson video and an interactive sim beside our own material without us
hosting, copying or re-encoding anyone else's work.

Nothing in this directory is our content. Everything here is a *pointer* with a licence note.

---

## 1. Shape of the file

```jsonc
{
  "generatedAt": "ISO-8601",
  "notes": [ "..." ],                       // machine-readable caveats, repeated below
  "topics": {
    "<subject>:<slug>": {                   // subject = maths | science | further-maths
      "videos": [
        {
          "provider": "youtube",
          "videoId": "zxJNJMDj2Ec",
          "title": "…",                     // uploader's title, from the oEmbed response
          "channel": "corbettmaths",        // uploader's channel name, from oEmbed
          "url": "https://www.youtube.com/watch?v=zxJNJMDj2Ec",
          "start": 132,                     // optional, seconds — only on long videos
          "end": 410,                       // optional, seconds
          "why": "one line",
          "embeddable": true,               // always true; unembeddable videos were replaced
          "corbettmathsNumber": 9,          // optional, numeric Corbettmaths video number
          "corbettmathsRef": "9"            // optional, raw ref (may be lettered, e.g. "267d")
        }
      ],
      "sims":    [ { "provider": "phet" | "geogebra", "url", "title", "licence", "attribution" } ],
      "reading": [ { "label", "url", "provider": "bitesize" | "corbettmaths-pdf" | "ccea" } ]
    }
  }
}
```

`<slug>` matches `topics[].slug` in:

| subject key     | taxonomy file                                |
| --------------- | -------------------------------------------- |
| `maths`         | `data/spec/mathematics.json`                 |
| `science`       | `data/spec/double-award-science-topics.json` |
| `further-maths` | `data/spec/further-mathematics.json`         |

Every slug in all three taxonomies is present — **355 keys, no gaps**.

---

## 2. Coverage (as built)

| Subject                  | Topics | With ≥1 video | Video entries | With ≥1 sim | Sim entries |
| ------------------------ | -----: | ------------: | ------------: | ----------: | ----------: |
| Mathematics (M1–M8)      |    152 |       **152** |           296 |         124 |         148 |
| Double Award Science     |    130 |       **130** |           259 |         115 |         125 |
| Further Mathematics      |     73 |        **73** |           144 |          57 |          62 |
| **Total**                |    355 |       **355** |       **699** |     **296** |     **335** |

Per unit:

```
Mathematics            M1 41  M2 18  M3 17  M4  9  M5 17  M6 18  M7 17  M8 15   (all topics have video + reading)
Double Award Science   B1 21  B2 20  C1 25  C2 22  P1 22  P2 20                 (all topics have video + reading)
Further Mathematics    FM1 29  FM2 16  FM3 16  FM4 12                            (all topics have video + reading)
```

699 video entries across 637 distinct YouTube videos; 335 sim entries across 118 distinct sims
(75 PhET, 43 GeoGebra); 1 208 reading entries across 457 distinct URLs.

**59 topics have no sim, deliberately.** They are topics where no faithful interactive exists
(e.g. *recurring decimals to fractions*, *truth tables and equivalence*, *reproductive systems*,
*critical path analysis*, and — removed on 20 September 2026 after the cross-board enrichment pass —
*newtons-second-law-inclined-plane* and *connected-particles-and-pulleys*, whose mapped PhET sims
modelled neither an inclined plane nor a pulley, and *c2-hydrated-salts-water-of-crystallisation*,
whose mapped sim modelled dissolving a solute rather than water locked inside a crystal, and the three
space topics *p2-big-bang-evidence*, *p2-stars-and-fusion* and *p2-life-cycle-of-stars*, whose mapped
sims modelled sound in air and orbital motion rather than red shift, fusion or stellar collapse -
*Gravity and Orbits* was kept on *p2-solar-system-satellites*, which it does model). A decorative sim that does not model the idea is worse than none, so
the array is left empty rather than padded. Check `sims.length` before rendering the panel.

---

## 3. Where the links came from

### Mathematics
1. **Corbettmaths** is the spine (317 of the video entries). The full contents index
   (<https://corbettmaths.com/contents/>) was parsed into 481 topic rows, each row's video page
   was fetched, and the embedded YouTube id was extracted from the page HTML. The Corbettmaths
   video number is preserved on each entry (`corbettmathsNumber` / `corbettmathsRef`) so a topic
   page can cite it.
2. **N.I. Maths Tutor** and **P McAleavey** — two Northern Ireland teachers publishing against the
   CCEA specification — supply a third, CCEA-specific video on 21 topics (CCEA past-paper
   walkthroughs, M7/M8 material, CCEA constructions and bearings past-paper questions).

### Double Award Science
1. **Free Science Lessons** (144 entries) and **Cognito** (103) for the per-topic ~4-minute lessons.
2. CCEA-specific and practical specialists where they beat the generalists: **Paperclip Physics**
   (CCEA prescribed practical), **Science with Hazel**, **KayScience**, **Mr Exham Biology**,
   **Malmesbury Education**, **Animated Science**, **Wedgwood Tutors**.

### Further Mathematics
1. **P McAleavey** (43 entries) and **N.I. Maths Tutor** (13) — both teach the CCEA GCSE Further
   Mathematics specification by name, including FM2 Mechanics and FM3 Statistics, which no other
   free channel covers at this level.
2. **Corbettmaths GCSE Further Maths** series (videos 501–586, parsed from
   <https://corbettmaths.com/more/further-maths/>) plus its integration, logarithm, matrix and
   moments videos.
3. **TLMaths** (44), **ExamSolutions**, **Maths Genie** for FM2/FM3/FM4 topics outside both of the
   above.

### Simulations
- **PhET**: sim list taken from `docs/research/05-science-learning-platforms.md` and extended with
  the PhET maths catalogue. Every URL was fetched and returned HTTP 200.
- **GeoGebra**: 43 applets for geometric and statistical topics where PhET has nothing
  (circle theorems, parallel-line angles, polygon angles, transformations, Pythagoras, SOHCAHTOA,
  constructions and loci, arc length and sector area, sine/cosine rule, bearings, nets, box plots
  and cumulative frequency, histograms, Venn and tree diagrams, exponential growth/decay, solids).
- **Desmos is deliberately excluded.** Public Desmos graphs may not be embedded the way this
  platform would need; linking out is the only safe use, and Corbettmaths/GeoGebra cover the same
  ground.

### Reading
- **BBC Bitesize** — the per-topic article already recorded on each science topic, the CCEA Double
  Award unit indexes and hub, and the CCEA GCSE Maths exam-spec hub.
- **Corbettmaths** practice-question and textbook-exercise PDFs, parsed from the same contents
  index (matched to the video number used on that topic).
- **CCEA** — the GCSE Further Mathematics subject page (specification + past papers).

---

## 4. Verification performed

| Check | Result |
| --- | --- |
| Every YouTube id fetched at `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=<id>&format=json` | **637/637 returned HTTP 200** (a 401/403 means the uploader blocked embedding) |
| Videos found unembeddable and replaced | 1 (`-sa5CQcy3nE`, hazard symbols → replaced with `V7TEGtP9bDE`) |
| Every PhET sim URL fetched | all 200 |
| Every GeoGebra embed URL fetched (`/classic/<id>`) | all 200 |
| Every reading URL fetched (following redirects) | **457/457 returned 200** |
| Slug coverage against the three taxonomies | 355/355, no unknown slugs |

`title` and `channel` on each video come straight from the oEmbed response, so they are the
uploader's own strings, not ours. Re-run the oEmbed check before each release: uploaders can
disable embedding at any time, and a blocked video renders as a grey box with no error we can
catch client-side.

---

## 5. Licence and embedding rules — follow these exactly

### YouTube
- Embed through **`https://www.youtube-nocookie.com/embed/<videoId>`** (append
  `?start=<seconds>` when the entry carries `start`). The no-cookie host keeps YouTube from
  writing tracking cookies until the viewer actually presses play.
- **No overlays** on the player: do not cover the title bar, the channel name, the YouTube logo or
  the controls; do not autoplay muted-and-cropped; do not trim, clip or stitch; do not re-host,
  proxy or download the video file. YouTube's Terms of Service forbid all of these, and the
  channel owners are individual teachers.
- Credit the channel in visible text beside the frame (`channel` is in the data for exactly this).
- If a video ever fails to load, treat it as revoked: remove it from the map rather than
  working around the block.

### PhET
- Embed with the direct-run URL `https://phet.colorado.edu/sims/html/<sim>/latest/<sim>_en.html`,
  recommended iframe 834 × 504, `allowfullscreen`.
- **Render the attribution string from the entry beside the frame**, human-readable and close to
  the point of use:
  > Simulation by PhET Interactive Simulations, University of Colorado Boulder, licensed under
  > CC BY-NC 4.0 (https://phet.colorado.edu)
- **The PhET logo inside the sim must stay visible and unaltered.** Do not crop the iframe to hide
  it, do not overlay it, do not restyle it.
- Licence caveat, and it matters: PhET simulations published **before 29 March 2026** remain
  **CC BY 4.0**; from that date the HTML sims are **CC BY-NC 4.0**, and PhET treats
  "incorporating simulations into paid or subscription-based products" and "including simulations
  on ad-supported websites" as commercial use requiring a licence from the University of Colorado
  Boulder (phet-partnerships@colorado.edu). **Cairn must stay free and ad-free to embed PhET, or
  buy a commercial licence.** The `licence` field on every sim entry records this.

### GeoGebra
- Embed with `https://www.geogebra.org/classic/<materialId>`. The old
  `https://www.geogebra.org/material/iframe/id/<id>` endpoint now returns **410 Gone** — do not
  use it.
- These are third-party, user-created resources under GeoGebra's non-commercial licence terms.
  Show the attribution string and link back to `https://www.geogebra.org/m/<materialId>` so the
  author is reachable. Same commercial caveat as PhET: free and ad-free use only.

### Corbettmaths
- **Link only. Never mirror, never bundle.** Corbettmaths' terms state the resources are free for
  individual and classroom use, ask colleagues to *link* rather than upload copies, and say:
  "Under no circumstances can any Corbettmaths resource be used by anyone for profit making
  purposes" and "…used within other resources that are redistributed."
- So: the YouTube embed is fine (it is served by YouTube from his channel, with his branding
  intact); the PDFs in `reading[]` are **outbound links**, never copied into our bundle, never
  re-rendered inside our pages, and never converted into our own question sets.
- If Cairn ever becomes commercial, drop Corbettmaths entirely beyond plain outbound links.

### BBC Bitesize
- **Link only.** No embedding, no framing, no scraping, no reproduction of article text.

### General
- Treat every third-party title, description and comment as untrusted text: escape it, never
  execute it, never let it drive navigation.
- Do not compile these links into a downloadable pack — that turns "linking" into
  "redistribution" for every source above.

---

## 6. Regenerating

The map is generated, not hand-maintained. Rebuilding needs four inputs:

1. The three taxonomy files under `data/spec/`.
2. The Corbettmaths contents index and Further Maths index (parsed to
   name → video number → page URL → embedded YouTube id → practice/textbook PDF).
3. The per-topic curation tables (which video and sim belongs to which slug).
4. An oEmbed pass over every YouTube id, which is what sets `embeddable`.

Steps 2–4 are network-bound and should be re-run before each release. The cheap, high-value check
on its own is step 4: any id whose oEmbed call stops returning 200 must be swapped out before the
topic page ships, because the embed will silently render blank.

When adding a link by hand:
- put the oEmbed 200 check in front of it;
- fill `why` with one specific sentence (what this video does that the other one does not) — the
  field exists so a reader can choose, not to be decorative;
- prefer a CCEA-specific source over a generic one when the teaching quality is comparable;
- never add a second video that merely repeats the first.

## Where the links surface

- `videos` and `sims`: the "See it" panel under the lesson (`src/components/topic/SeeIt.tsx`, up to two videos and one sim, click-to-load with credit).
- `reading`: the "Best of what exists" card in the topic sidebar (`app/learn/[subject]/[unit]/[topic]/page.tsx`), after any hand-picked taxonomy `links`, deduplicated by URL. Unit codes in URLs are the taxonomy codes (`/learn/maths/M4/…`), case-sensitive.
